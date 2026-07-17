import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  collectionGroup,
  orderBy, 
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { OrderRecord } from "../types";

// ========================================================
// FIRESTORE ERROR HANDLING (As required by Firebase Skill)
// ========================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Operation Failed:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ========================================================
// ORDER & INVOICE SERVICE IMPLEMENTATION
// ========================================================
export const orderService = {
  /**
   * Generates a complete invoice metadata payload from the total paid amount.
   * Based on standard tax regulations (e.g., 18% GST in India).
   * Total = Base + (Base * GST%)
   * Base = Total / (1 + GST%)
   */
  generateInvoiceMetadata(totalAmount: number, gstRatePercent: number = 18) {
    const rateFactor = 1 + (gstRatePercent / 100);
    const baseAmount = parseFloat((totalAmount / rateFactor).toFixed(2));
    const gstAmount = parseFloat((totalAmount - baseAmount).toFixed(2));
    
    // Generate a unique, professional invoice number, e.g., KTG-2026-82910
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const invoiceNo = `KTG-${year}-${randomSuffix}`;
    
    return {
      baseAmount,
      gstAmount,
      gstRate: gstRatePercent,
      invoiceNo,
      invoiceDate: new Date().toISOString()
    };
  },

  /**
   * Encapsulated method to create an order inside a secure transaction.
   * Creates a pending order document in Firestore at `/users/{userId}/orders/{orderId}`.
   */
  async createOrder(userId: string, documentId: string, amount: number): Promise<string> {
    const orderId = `ord_${Math.random().toString(36).substring(2, 11)}`;
    const orderPath = `users/${userId}/orders/${orderId}`;
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "users", userId, "orders", orderId);
        
        // Retrieve document details to populate documentTitle
        const docRef = doc(db, "users", userId, "documents", documentId);
        const docSnap = await transaction.get(docRef);
        const documentTitle = docSnap.exists() ? docSnap.data().title : "Untitled Document";

        const orderPayload = {
          id: orderId,
          userId,
          documentId,
          documentTitle,
          amount,
          currency: "INR",
          status: "pending" as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        transaction.set(orderRef, orderPayload);
      });
      return orderId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, orderPath);
    }
  },

  /**
   * Legacy wrapper for createPendingOrder, keeping backwards compatibility
   */
  async createPendingOrder(userId: string, order: Omit<OrderRecord, 'createdAt'>): Promise<void> {
    const orderPath = `users/${userId}/orders/${order.id}`;
    try {
      const orderRef = doc(db, "users", userId, "orders", order.id);
      const orderPayload = {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(orderRef, orderPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, orderPath);
    }
  },

  /**
   * Updates an order's status and records payment references/metadata on completion.
   * Uses a secure Firestore transaction to ensure data consistency during the payment 
   * and document unlocking process.
   */
  async updateOrderStatus(
    orderId: string,
    status: 'completed' | 'failed' | 'Success',
    paymentDetails?: {
      paymentId?: string;
      userEmail?: string;
    }
  ): Promise<OrderRecord> {
    try {
      // 1. Locate the order document via collectionGroup query
      const ordersCol = collectionGroup(db, "orders");
      const orderQuery = query(ordersCol, where("id", "==", orderId));
      const querySnap = await getDocs(orderQuery);

      if (querySnap.empty) {
        // Fallback check on razorpayOrderId
        const altOrderQuery = query(ordersCol, where("razorpayOrderId", "==", orderId));
        const altQuerySnap = await getDocs(altOrderQuery);
        if (altQuerySnap.empty) {
          throw new Error(`Order identifier ${orderId} does not exist in our systems.`);
        }
        return await this.executeTransactionalUnlock(altQuerySnap.docs[0].ref.path, status, paymentDetails);
      }

      return await this.executeTransactionalUnlock(querySnap.docs[0].ref.path, status, paymentDetails);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `CollectionGroup/orders/${orderId}`);
    }
  },

  /**
   * Internal transactional helper to atomicly update order status and unlock document
   */
  async executeTransactionalUnlock(
    orderPath: string,
    status: 'completed' | 'failed' | 'Success',
    paymentDetails?: {
      paymentId?: string;
      userEmail?: string;
    }
  ): Promise<OrderRecord> {
    const pathParts = orderPath.split("/");
    const userId = pathParts[1];
    const orderId = pathParts[3];

    const orderRef = doc(db, "users", userId, "orders", orderId);

    let updatedRecord: any = null;

    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error(`Order ${orderId} missing during transaction execution.`);
      }

      const currentOrder = orderSnap.data() as OrderRecord;
      const updatePayload: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (paymentDetails?.paymentId) {
        updatePayload.paymentId = paymentDetails.paymentId;
      }
      if (paymentDetails?.userEmail) {
        updatePayload.userEmail = paymentDetails.userEmail;
      }

      // Generate tax/invoice metadata if transitioning to completed
      if (status === 'completed' && !currentOrder.invoiceNo) {
        const metadata = this.generateInvoiceMetadata(currentOrder.amount);
        updatePayload.invoiceNo = metadata.invoiceNo;
        updatePayload.invoiceDate = metadata.invoiceDate;
        updatePayload.baseAmount = metadata.baseAmount;
        updatePayload.gstAmount = metadata.gstAmount;
        updatePayload.gstRate = metadata.gstRate;
      }

      // 1. Transactionally update order status
      transaction.update(orderRef, updatePayload);

      // 2. Transactionally unlock the linked document if status is completed
      if (status === 'completed') {
        const documentId = currentOrder.documentId;
        if (documentId) {
          const docRef = doc(db, "users", userId, "documents", documentId);
          transaction.update(docRef, {
            isLocked: false,
            unlockedAt: serverTimestamp(),
            paymentId: paymentDetails?.paymentId || "ONLINE"
          });
        }
      }

      updatedRecord = {
        ...currentOrder,
        ...updatePayload,
        createdAt: currentOrder.createdAt
      };
    });

    return updatedRecord as OrderRecord;
  },

  /**
   * Attaches an invoice URL or reference to the order record.
   * Runs in a transaction to ensure no concurrent modifications are overwritten.
   */
  async attachInvoiceToOrder(orderId: string, invoiceUrl: string): Promise<void> {
    try {
      const ordersCol = collectionGroup(db, "orders");
      const orderQuery = query(ordersCol, where("id", "==", orderId));
      const querySnap = await getDocs(orderQuery);

      if (querySnap.empty) {
        throw new Error(`Order ${orderId} not found to attach invoice.`);
      }

      const orderRef = querySnap.docs[0].ref;

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error(`Order record missing during invoice attachment transaction.`);
        }
        transaction.update(orderRef, {
          invoiceUrl,
          updatedAt: serverTimestamp()
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  /**
   * Backwards compatible legacy updateOrderStatus, keeping method signature expected by some imports
   */
  async updateOrderStatusLegacy(
    userId: string,
    orderId: string,
    status: 'completed' | 'failed' | 'Success',
    paymentDetails?: {
      paymentId?: string;
      userEmail?: string;
    }
  ): Promise<OrderRecord> {
    const orderPath = `users/${userId}/orders/${orderId}`;
    return this.executeTransactionalUnlock(orderPath, status, paymentDetails);
  },

  /**
   * Fetches a specific order by ID.
   */
  async getOrder(userId: string, orderId: string): Promise<OrderRecord> {
    const orderPath = `users/${userId}/orders/${orderId}`;
    try {
      const orderRef = doc(db, "users", userId, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error(`Order ${orderId} not found.`);
      }
      
      return { id: orderSnap.id, ...orderSnap.data() } as OrderRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, orderPath);
    }
  },

  /**
   * Retrieves all orders for a specific user, sorted by creation time.
   */
  async getUserOrders(userId: string): Promise<OrderRecord[]> {
    const ordersPath = `users/${userId}/orders`;
    try {
      const ordersCol = collection(db, "users", userId, "orders");
      const ordersQuery = query(ordersCol, orderBy("createdAt", "desc"));
      const querySnap = await getDocs(ordersQuery);
      
      return querySnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as OrderRecord[];
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, ordersPath);
    }
  }
};
