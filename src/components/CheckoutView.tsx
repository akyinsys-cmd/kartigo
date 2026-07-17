import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Receipt,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { paymentService } from "../services/paymentService";
import { orderService } from "../services/orderService";
import { invoiceGenerator } from "../utils/invoiceGenerator";
import { PricingRecord, OrderRecord } from "../types";

interface CheckoutViewProps {
  documentId: string;
  documentTitle: string;
  documentType: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onCancel: () => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Puducherry", "Chandigarh", "Jammu & Kashmir", "Ladakh"
];

export function CheckoutView({
  documentId,
  documentTitle,
  documentType,
  onSuccess,
  onCancel
}: CheckoutViewProps) {
  const { user, profile } = useAuth();
  
  // State variables
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [pricing, setPricing] = useState<PricingRecord | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Billing profile details
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingGstId, setBillingGstId] = useState("");
  const [billingState, setBillingState] = useState("Karnataka"); // Default HSR Layout local state

  // Notification states
  const [notification, setNotification] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);

  const triggerNotification = (message: string, type: "info" | "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Fetch dynamic pricing from Firestore '/pricing/{id}' or template categories
  useEffect(() => {
    async function loadPricing() {
      try {
        setLoadingPricing(true);
        // Attempt to fetch from pricing collection first (using template id or documentType)
        const docRef = doc(db, "pricing", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPricing({ id: docSnap.id, ...docSnap.data() } as PricingRecord);
        } else {
          // Fallback to searching with documentType as documentId
          const altDocRef = doc(db, "pricing", documentType);
          const altDocSnap = await getDoc(altDocRef);
          
          if (altDocSnap.exists()) {
            setPricing({ id: altDocSnap.id, ...altDocSnap.data() } as PricingRecord);
          } else {
            // Default pricing model if not specified in Firestore
            setPricing({
              id: documentId,
              basePrice: 599,
              discount: 100,
              gstRate: 18,
              currency: "INR",
              features: [
                "Full-fledged print layout compatibility",
                "Pristine, secure high-fidelity PDF download",
                "Advanced custom clause explanations",
                "Unlimited version-history checkpoints",
                "Fully verified stamp-paper ready document"
              ]
            });
          }
        }
      } catch (err) {
        console.error("Failed to load pricing details", err);
        // Safe fail-silent defaults
        setPricing({
          id: documentId,
          basePrice: 599,
          discount: 100,
          gstRate: 18,
          currency: "INR"
        });
      } finally {
        setLoadingPricing(false);
      }
    }

    loadPricing();
  }, [documentId, documentType]);

  // Sync client profile details when ready
  useEffect(() => {
    if (profile) {
      setBillingName(`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || user?.displayName || "");
      setBillingEmail(profile.email || user?.email || "");
      setBillingPhone(profile.phone || "");
      if (profile.defaultLocation) {
        setBillingState(profile.defaultLocation.state || "Karnataka");
      }
      if (profile.businessProfile) {
        setBillingCompany(profile.businessProfile.companyName || "");
        setBillingAddress(profile.businessProfile.address || "");
        setBillingGstId(profile.businessProfile.gstId || "");
      }
    }
  }, [profile, user]);

  if (loadingPricing || !pricing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center bg-vanilla-main/20 rounded-2xl border border-vanilla-main/40 shadow-xs">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        <h3 className="mt-4 text-sm font-bold text-text-primary">Loading Transparent Payment Summary...</h3>
        <p className="text-xs text-text-secondary max-w-xs mt-1">Retrieving official pricing configurations and legal tax brackets.</p>
      </div>
    );
  }

  // Calculate prices
  const basePrice = pricing.basePrice;
  const discount = pricing.discount;
  const netBeforeTax = basePrice - discount;
  const gstRate = pricing.gstRate;
  
  // Base price includes GST of 18% in typical pricing models. If not, we calculate add-on GST
  // Let's make it fully transparent: Net total is subtotal minus discount.
  // We represent the Tax and Base values clearly.
  const taxFactor = 1 + (gstRate / 100);
  const taxableBase = parseFloat((netBeforeTax / taxFactor).toFixed(2));
  const gstAmount = parseFloat((netBeforeTax - taxableBase).toFixed(2));
  const cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  const sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  const totalAmount = netBeforeTax;

  // Handle pay and unlock action
  const handlePayAndUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerNotification("You must be logged in to make a payment.", "error");
      return;
    }

    setPaymentLoading(true);
    triggerNotification("Preparing checkout order on Razorpay servers...", "info");

    try {
      // 1. Create secure order on server
      const razorpayOrder = await paymentService.initiateRazorpayOrder(
        totalAmount,
        documentId
      );

      // 2. Log pending transaction in Firestore
      const orderPayload: any = {
        id: razorpayOrder.id,
        userId: user.uid,
        documentId: documentId,
        documentTitle: documentTitle,
        amount: totalAmount,
        currency: pricing.currency,
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
        userEmail: billingEmail || user.email || ""
      };

      await orderService.createPendingOrder(user.uid, orderPayload);

      // 3. Initiate client Razorpay Checkout popup
      await paymentService.checkout({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        documentTitle: documentTitle,
        prefill: {
          name: billingName,
          email: billingEmail,
          contact: billingPhone
        },
        themeColor: "#6D28D9",
        onSuccess: async (rzpResponse) => {
          triggerNotification("Payment authorized. Cryptographically verifying receipt...", "info");
          
          try {
            // 4. Verify signature on the server, which also updates status & unlocks
            const verifyRes = await paymentService.verifyPaymentSignature(
              rzpResponse.razorpay_order_id,
              rzpResponse.razorpay_payment_id,
              rzpResponse.razorpay_signature,
              {
                userId: user.uid,
                documentId: documentId,
                documentTitle: documentTitle,
                amount: totalAmount,
                userEmail: billingEmail
              }
            );

            if (verifyRes.status === "success") {
              // 5. Update local state Order using Service (re-fetches enriched GST details)
              const completedRef = await orderService.updateOrderStatus(
                razorpayOrder.id,
                "completed",
                {
                  paymentId: rzpResponse.razorpay_payment_id,
                  userEmail: billingEmail
                }
              );

              setCompletedOrder(completedRef);
              setPaymentSuccess(true);
              triggerNotification("Payment verified! Document is now unlocked.", "success");
            } else {
              throw new Error(verifyRes.message || "Failed signature authentication.");
            }
          } catch (verifyErr: any) {
            console.error("Signature verification failed", verifyErr);
            triggerNotification(verifyErr.message || "Cryptographic signature verification failed.", "error");
            await orderService.updateOrderStatus(razorpayOrder.id, "failed");
          } finally {
            setPaymentLoading(false);
          }
        },
        onDismiss: () => {
          setPaymentLoading(false);
          triggerNotification("Payment session dismissed by user.", "info");
        }
      });

    } catch (err: any) {
      console.error("Razorpay initiation failed:", err);
      triggerNotification(err.message || "Failed to initialize payment gateway.", "error");
      setPaymentLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (completedOrder) {
      invoiceGenerator.generateAndDownload(completedOrder, {
        name: billingName,
        email: billingEmail,
        phone: billingPhone,
        companyName: billingCompany,
        address: billingAddress,
        gstId: billingGstId,
        state: billingState
      });
      triggerNotification("Official tax invoice PDF generated!", "success");
    }
  };

  const handleProceedToEditor = () => {
    if (completedOrder) {
      onSuccess(completedOrder.paymentId || "ONLINE", completedOrder.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-vanilla-main/20 border border-vanilla-main/40 rounded-3xl relative">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[10000] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
            : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-150'
              : 'bg-indigo-50 text-indigo-800 border-indigo-150'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-vanilla-main/30">
        <button 
          onClick={onCancel}
          disabled={paymentLoading || paymentSuccess}
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-brand-primary disabled:opacity-40 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to drafting</span>
        </button>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">SSL Secure Payment</span>
        </div>
      </div>

      {/* SUCCESS SCREEN */}
      {paymentSuccess && completedOrder ? (
        <div className="max-w-md mx-auto text-center py-10 px-6 bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full text-emerald-600 mb-4 animate-scale-in">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Successful!</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1.5 mx-auto">
            Order <span className="font-mono text-[10px] font-semibold bg-slate-100 px-1 py-0.5 rounded">{completedOrder.id.substring(0, 10).toUpperCase()}</span> is fully paid. Your document is unlocked and ready for export.
          </p>

          {/* Inline Receipt Details */}
          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-3">
            <div className="flex justify-between text-xs border-b border-slate-200/60 pb-2">
              <span className="font-semibold text-slate-700">Invoice No:</span>
              <span className="font-mono font-bold text-slate-900">{completedOrder.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Document:</span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{documentTitle}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-brand-primary">INR {completedOrder.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>GST Included:</span>
              <span>18% (INR {completedOrder.gstAmount?.toFixed(2)})</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleProceedToEditor}
              className="w-full py-2.5 px-4 bg-[#3C1A47] hover:bg-[#2e1436] text-[#F1FEC8] font-bold text-xs rounded-xl shadow-md cursor-pointer transition-transform hover:scale-[1.01] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-[#F1FEC8] animate-pulse" />
              <span>Proceed to Editor Workspace</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>
      ) : (
        /* MAIN CHECKOUT FORM & BREAKDOWN GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Billing Profile Form */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#3C1A47]" />
                <span>Billing Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Specify your tax residence state and optional GSTIN for valid compliance invoicing.</p>
            </div>

            <form onSubmit={handlePayAndUnlock} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Billing Name</label>
                  <input
                    type="text"
                    required
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Billing Email</label>
                  <input
                    type="email"
                    required
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Billing Phone</label>
                  <input
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Billing State / Place of Supply</label>
                  <select
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-vanilla-main/10 rounded-xl border border-vanilla-main/35 space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-brand-primary" />
                  <span>Business GST Add-on (Optional)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={billingCompany}
                      onChange={(e) => setBillingCompany(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white/70 border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden"
                      placeholder="Company Legal Name"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={billingGstId}
                      onChange={(e) => setBillingGstId(e.target.value.toUpperCase())}
                      maxLength={15}
                      className="w-full px-3 py-1.5 text-xs bg-white/70 border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden uppercase font-mono"
                      placeholder="GSTIN (15 Digits)"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white/70 border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-hidden"
                    placeholder="Registered Office Street Address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full py-3 bg-[#3C1A47] hover:bg-[#2c1334] text-[#F1FEC8] font-bold text-xs rounded-xl cursor-pointer shadow-md transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#F1FEC8]" />
                    <span>Configuring Payment Overlay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-[#F1FEC8]" />
                    <span>Pay Securely & Unlock (INR {totalAmount.toFixed(2)})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Transparent Payment Summary Breakdown */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-5 space-y-5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Payment Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">Unified, fully-audited billing computation</p>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Document</span>
              <div className="flex gap-2 items-start">
                <FileText className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{documentTitle}</span>
                  <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 uppercase tracking-wide bg-slate-100/50 inline-block px-1.5 py-0.5 rounded border border-slate-200/50">
                    {documentType.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Line Breakdown */}
            <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Base Document Rate:</span>
                <span className="font-semibold text-slate-700">INR {basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Special Promotion Discount:</span>
                <span>- INR {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200/60 pt-2.5">
                <span className="text-slate-500">Taxable Net Amount:</span>
                <span className="font-semibold text-slate-800">INR {taxableBase.toFixed(2)}</span>
              </div>
              
              {/* GST Breakdown */}
              <div className="pl-3 border-l-2 border-slate-200 space-y-1.5 text-[11px] text-slate-400 mt-1">
                {billingState.toLowerCase() === "karnataka" ? (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (9.0%):</span>
                      <span>INR {cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9.0%):</span>
                      <span>INR {sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>IGST ({gstRate}% Interstate):</span>
                    <span>INR {gstAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-slate-800">Grand Total (Net):</span>
              <div className="text-right">
                <span className="text-lg font-black text-[#3C1A47] tracking-tight">INR {totalAmount.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block font-semibold uppercase">Inclusive of all taxes</span>
              </div>
            </div>

            {/* Listed features unlocked */}
            {pricing.features && pricing.features.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Features Unlocked:</span>
                <ul className="space-y-1.5">
                  {pricing.features.map((feat, idx) => (
                    <li key={idx} className="flex gap-1.5 items-start text-[11px] text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
