import axios from "axios";

/**
 * Loads the external Razorpay checkout.js script dynamically.
 * Returns a promise that resolves to true once the script is loaded successfully.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: any[];
  created_at: number;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId?: string;
  documentId?: string;
  documentTitle?: string;
  amount?: number;
  userEmail?: string;
}

export interface VerifyPaymentResponse {
  status: "success" | "failure";
  message: string;
}

/**
 * Service to handle Razorpay payment flows in the frontend.
 */
export const paymentService = {
  /**
   * Contacts the backend to create a new Razorpay order.
   * @param amount The base document price (in Rupees/INR)
   * @param documentId Document ID for reference (will be used as receipt)
   */
  async initiateRazorpayOrder(
    amount: number,
    documentId: string
  ): Promise<CreateOrderResponse> {
    try {
      const response = await axios.post<CreateOrderResponse>("/api/payments/create-order", {
        amount,
        currency: "INR",
        receipt: `rcpt_${documentId}_${Date.now()}`.substring(0, 40),
      });
      return response.data;
    } catch (err: any) {
      console.error("Failed to create Razorpay order:", err);
      throw new Error(err.response?.data?.error || "Failed to create payment order");
    }
  },

  /**
   * Sends the checkout signature and payload to the backend for cryptographic verification
   * and Firestore database reconciliation.
   */
  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    additionalPayload?: Omit<VerifyPaymentPayload, "razorpay_order_id" | "razorpay_payment_id" | "razorpay_signature">
  ): Promise<VerifyPaymentResponse> {
    try {
      const payload: VerifyPaymentPayload = {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        ...additionalPayload
      };
      const response = await axios.post<VerifyPaymentResponse>("/api/payments/verify", payload);
      return response.data;
    } catch (err: any) {
      console.error("Payment signature verification failed:", err);
      throw new Error(err.response?.data?.error || "Payment verification failed");
    }
  },

  /**
   * Legacy method - contacts the backend to create a new Razorpay order.
   * @param amount The base document price (in Rupees/INR)
   * @param currency The currency code (default: INR)
   * @param receipt Optional receipt identifier (e.g., "rcpt_draftId")
   */
  async createOrder(
    amount: number,
    currency: string = "INR",
    receipt?: string
  ): Promise<CreateOrderResponse> {
    try {
      const response = await axios.post<CreateOrderResponse>("/api/payments/create-order", {
        amount,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`.substring(0, 40),
      });
      return response.data;
    } catch (err: any) {
      console.error("Failed to create Razorpay order:", err);
      throw new Error(err.response?.data?.error || "Failed to create payment order");
    }
  },

  /**
   * Legacy method - sends the checkout signature and payload to the backend.
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.post<VerifyPaymentResponse>("/api/payments/verify", payload);
      return response.data;
    } catch (err: any) {
      console.error("Payment signature verification failed:", err);
      throw new Error(err.response?.data?.error || "Payment verification failed");
    }
  },

  /**
   * Triggers the interactive Razorpay checkout overlay modal.
   */
  async checkout(options: {
    orderId: string;
    amount: number;
    currency: string;
    documentTitle: string;
    prefill: {
      name?: string;
      email?: string;
      contact?: string;
    };
    themeColor?: string;
    onSuccess: (response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => void;
    onDismiss?: () => void;
  }): Promise<void> {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
    }

    const keyId = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key";

    const rzpOptions = {
      key: keyId,
      amount: options.amount,
      currency: options.currency,
      name: "Kartigo Draft",
      description: `Unlock and Print: ${options.documentTitle}`,
      order_id: options.orderId,
      handler: (response: any) => {
        options.onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
      prefill: {
        name: options.prefill.name || "",
        email: options.prefill.email || "",
        contact: options.prefill.contact || "",
      },
      theme: {
        color: options.themeColor || "#6D28D9",
      },
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.open();
  },
};
