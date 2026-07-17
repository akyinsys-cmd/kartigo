import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to securely handle Razorpay Webhook events.
 * It verifies the request signature, identifies the associated order,
 * updates the payment status to "completed" in Firestore, and unlocks
 * the corresponding document for the user.
 */
export const paymentWebhook = onRequest({ cors: true }, async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  if (!signature) {
    console.error("Missing x-razorpay-signature header");
    res.status(400).send("Signature missing");
    return;
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured on the server");
    res.status(500).send("Webhook secret not configured");
    return;
  }

  try {
    // Obtain raw request body if available (common in Firebase Cloud Functions)
    const rawBody = (req as any).rawBody 
      ? (req as any).rawBody.toString() 
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature verified against x-razorpay-signature header");
      res.status(400).send("Invalid signature");
      return;
    }

    const { event, payload } = req.body;
    console.log(`Processing secure Razorpay Webhook event: ${event}`);

    // We process both "order.paid" and "payment.captured" to ensure high-reliability
    if (event === "order.paid" || event === "payment.captured") {
      const orderEntity = event === "order.paid" ? payload.order.entity : payload.payment.entity;
      const rzpOrderId = orderEntity.order_id || orderEntity.id;
      const rzpPaymentId = payload.payment?.entity?.id || orderEntity.id;
      const amount = orderEntity.amount / 100; // Razorpay uses paise, convert to INR Rupees

      const db = admin.firestore();
      
      // Perform a CollectionGroup query across all users' orders subcollections
      const ordersSnapshot = await db
        .collectionGroup("orders")
        .where("id", "==", rzpOrderId)
        .get();

      let orderProcessed = false;

      if (!ordersSnapshot.empty) {
        for (const docSnapshot of ordersSnapshot.docs) {
          await processOrderUnlock(db, docSnapshot, rzpPaymentId, amount);
          orderProcessed = true;
        }
      } else {
        // Fallback search using razorpayOrderId field in case ID is generated differently
        const altOrdersSnapshot = await db
          .collectionGroup("orders")
          .where("razorpayOrderId", "==", rzpOrderId)
          .get();

        for (const docSnapshot of altOrdersSnapshot.docs) {
          await processOrderUnlock(db, docSnapshot, rzpPaymentId, amount);
          orderProcessed = true;
        }
      }

      if (!orderProcessed) {
        console.warn(`Order identifier ${rzpOrderId} was verified but not found in Firestore`);
      }
    }

    res.status(200).send("Webhook processed and verified successfully");
  } catch (err: any) {
    console.error("Fatal error processing Razorpay Webhook:", err);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
});

/**
 * Helper function to update order details and securely unlock the associated document.
 */
async function processOrderUnlock(
  db: admin.firestore.Firestore,
  orderDoc: admin.firestore.QueryDocumentSnapshot,
  paymentId: string,
  amount: number
) {
  const orderData = orderDoc.data();
  const orderPath = orderDoc.ref.path;
  const pathParts = orderPath.split("/");
  const userId = pathParts[1];

  console.log(`Fulfilling order at path ${orderPath} for user: ${userId}`);

  // 1. Mark order as completed
  await orderDoc.ref.update({
    status: "Success",
    paymentId: paymentId,
    amountVerified: amount,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 2. Locate and unlock the linked user document
  const documentId = orderData.documentId;
  if (documentId) {
    const docRef = db.doc(`users/${userId}/documents/${documentId}`);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      await docRef.update({
        isLocked: false,
        unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentId: paymentId
      });
      console.log(`Document ${documentId} is unlocked and ready for user ${userId}`);
    } else {
      console.error(`Referenced document ${documentId} not found at path users/${userId}/documents/${documentId}`);
    }
  } else {
    console.error(`Order document at ${orderPath} is missing a documentId reference`);
  }
}
