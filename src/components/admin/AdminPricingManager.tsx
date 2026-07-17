import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Check, Edit2, Save, Trash2, Plus, 
  Percent, AlertCircle, ShoppingBag, Gift, Sliders, FileText
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  doc, setDoc, getDoc, collection, getDocs, 
  deleteDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

interface TierConfig {
  id: string;
  name: string;
  basePrice: number;
  offerPrice: number;
  discount: number;
  taxPercent: number;
  active: boolean;
  comingSoon: boolean;
  description: string;
}

interface DocOverrideConfig {
  id: string;
  documentTitle: string;
  tierId: string;
  basePrice?: number;
  offerPrice?: number;
  active: boolean;
  comingSoon: boolean;
}

interface CouponConfig {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  expiryDate?: string;
  active: boolean;
  usageCount: number;
}

export default function AdminPricingManager() {
  const [activeSubTab, setActiveSubTab] = useState<'tiers' | 'documents' | 'coupons'>('tiers');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // States
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState<Partial<TierConfig>>({});

  const [docOverrides, setDocOverrides] = useState<DocOverrideConfig[]>([]);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<Partial<DocOverrideConfig>>({});

  const [coupons, setCoupons] = useState<CouponConfig[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<CouponConfig>>({
    code: '',
    discountPercent: 10,
    active: true,
    usageCount: 0
  });

  const triggerNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load Data
  const loadPricingData = async () => {
    setLoading(true);
    try {
      // 1. Load Tiers
      const tiersSnap = await getDocs(collection(db, 'admin_config', 'pricing', 'tiers'));
      const tiersList: TierConfig[] = [];
      tiersSnap.forEach((snap) => {
        tiersList.push({ id: snap.id, ...snap.data() } as TierConfig);
      });

      // Default tiers if none exist
      if (tiersList.length === 0) {
        const defaultTiers: TierConfig[] = [
          { id: 'tier_1', name: 'Tier 1 - Basic Agreement', basePrice: 99, offerPrice: 49, discount: 50, taxPercent: 18, active: true, comingSoon: false, description: 'Simple business and lease templates.' },
          { id: 'tier_2', name: 'Tier 2 - Essential Contract', basePrice: 149, offerPrice: 79, discount: 47, taxPercent: 18, active: true, comingSoon: false, description: 'Freelancer agreement, standard contracts.' },
          { id: 'tier_3', name: 'Tier 3 - Professional template', basePrice: 299, offerPrice: 149, discount: 50, taxPercent: 18, active: true, comingSoon: false, description: 'Investor, NDA, Partnership agreements.' },
          { id: 'tier_4', name: 'Tier 4 - Business Suite', basePrice: 499, offerPrice: 299, discount: 40, taxPercent: 18, active: true, comingSoon: false, description: 'Corporate, board resolutions, SLA contracts.' },
          { id: 'tier_5', name: 'Tier 5 - Enterprise Custom', basePrice: 999, offerPrice: 499, discount: 50, taxPercent: 18, active: true, comingSoon: false, description: 'Premium custom legal documents.' }
        ];

        // Seed to Firestore
        for (const t of defaultTiers) {
          await setDoc(doc(db, 'admin_config', 'pricing', 'tiers', t.id), t);
          tiersList.push(t);
        }
      }
      setTiers(tiersList.sort((a, b) => a.id.localeCompare(b.id)));

      // 2. Load Doc Overrides
      const docsSnap = await getDocs(collection(db, 'admin_config', 'pricing', 'documents'));
      const docsList: DocOverrideConfig[] = [];
      docsSnap.forEach((snap) => {
        docsList.push({ id: snap.id, ...snap.data() } as DocOverrideConfig);
      });
      setDocOverrides(docsList);

      // 3. Load Coupons
      const couponsSnap = await getDocs(collection(db, 'admin_config', 'pricing', 'coupons'));
      const couponsList: CouponConfig[] = [];
      couponsSnap.forEach((snap) => {
        couponsList.push({ id: snap.id, ...snap.data() } as CouponConfig);
      });
      setCoupons(couponsList);

    } catch (err) {
      console.error(err);
      triggerNotification("Failed to load pricing configurations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  // Save Tier
  const handleSaveTier = async (tierId: string) => {
    try {
      const original = tiers.find(t => t.id === tierId);
      if (!original) return;

      const updated = {
        ...original,
        ...tierForm,
        // Calculate dynamic discount % if base/offer updated
        discount: Math.round(((Number(tierForm.basePrice ?? original.basePrice) - Number(tierForm.offerPrice ?? original.offerPrice)) / Number(tierForm.basePrice ?? original.basePrice)) * 100)
      };

      await setDoc(doc(db, 'admin_config', 'pricing', 'tiers', tierId), updated);
      setEditingTier(null);
      triggerNotification("Tier price configurations saved!", "success");
      await loadPricingData();
    } catch (err) {
      console.error(err);
      triggerNotification("Error saving tier pricing details.", "error");
    }
  };

  // Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code?.trim()) return;

    try {
      const couponId = 'cp_' + Date.now();
      const codeUpper = couponForm.code.trim().toUpperCase();

      const newCoupon: CouponConfig = {
        id: couponId,
        code: codeUpper,
        discountPercent: Number(couponForm.discountPercent || 10),
        active: couponForm.active ?? true,
        usageCount: 0,
        expiryDate: couponForm.expiryDate || '',
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined
      };

      await setDoc(doc(db, 'admin_config', 'pricing', 'coupons', couponId), newCoupon);
      setShowAddCoupon(false);
      setCouponForm({ code: '', discountPercent: 10, active: true, usageCount: 0 });
      triggerNotification(`Coupon code ${codeUpper} registered successfully!`, "success");
      await loadPricingData();
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to register coupon.", "error");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Permanently archive and delete this coupon code?")) return;
    try {
      await deleteDoc(doc(db, 'admin_config', 'pricing', 'coupons', id));
      triggerNotification("Coupon code removed successfully.", "success");
      await loadPricingData();
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to delete coupon.", "error");
    }
  };

  // Add Document Custom Override
  const handleAddDocOverride = async (documentTitle: string, tierId: string) => {
    try {
      const id = 'override_' + Date.now();
      const newOverride: DocOverrideConfig = {
        id,
        documentTitle,
        tierId,
        active: true,
        comingSoon: false
      };
      await setDoc(doc(db, 'admin_config', 'pricing', 'documents', id), newOverride);
      triggerNotification(`Pricing rule created for ${documentTitle}`, "success");
      await loadPricingData();
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to register pricing rule.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Pricing Header Subtabs */}
      <div className="flex border-b border-vanilla-main bg-white p-1 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('tiers')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${activeSubTab === 'tiers' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-light hover:bg-vanilla-secondary'}`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Global Pricing Tiers
        </button>
        <button
          onClick={() => setActiveSubTab('documents')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${activeSubTab === 'documents' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-light hover:bg-vanilla-secondary'}`}
        >
          <FileText className="h-3.5 w-3.5" />
          Document Exceptions
        </button>
        <button
          onClick={() => setActiveSubTab('coupons')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${activeSubTab === 'coupons' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-light hover:bg-vanilla-secondary'}`}
        >
          <Gift className="h-3.5 w-3.5" />
          Coupons & Referrals
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-[24px] border border-vanilla-main">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xs text-text-light font-bold">Synchronizing real-time pricing engine...</p>
        </div>
      ) : (
        <>
          {/* Subtab 1: Tiers */}
          {activeSubTab === 'tiers' && (
            <div className="bg-white rounded-[24px] border border-vanilla-main shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-brand-secondary font-display mb-1">Standardized Monetization Tiers</h3>
                <p className="text-xs text-text-light leading-relaxed">
                  Configure primary price slabs globally across Kartigo Draft. Changes here apply immediately to any document within that tier.
                </p>
              </div>

              <div className="space-y-4">
                {tiers.map((tier) => {
                  const isEditing = editingTier === tier.id;
                  return (
                    <div key={tier.id} className="p-4 bg-vanilla-secondary/30 rounded-2xl border border-vanilla-main/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 md:max-w-md">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#2B9348] bg-[#2B9348]/10 px-2 py-0.5 rounded-full">{tier.id.toUpperCase()}</span>
                        <h4 className="text-sm font-extrabold text-brand-secondary mt-1">{tier.name}</h4>
                        <p className="text-[11px] text-text-secondary leading-normal">{tier.description}</p>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-wrap gap-3 items-end bg-white p-3 rounded-xl border border-vanilla-main">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-text-light uppercase">Base Price (₹)</label>
                            <input 
                              type="number"
                              className="w-20 px-2 py-1 text-xs font-bold border border-vanilla-main rounded-lg"
                              defaultValue={tier.basePrice}
                              onChange={(e) => setTierForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-text-light uppercase">Offer Price (₹)</label>
                            <input 
                              type="number"
                              className="w-20 px-2 py-1 text-xs font-bold border border-vanilla-main rounded-lg"
                              defaultValue={tier.offerPrice}
                              onChange={(e) => setTierForm(prev => ({ ...prev, offerPrice: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-text-light uppercase">Tax % (GST)</label>
                            <input 
                              type="number"
                              className="w-16 px-2 py-1 text-xs font-bold border border-vanilla-main rounded-lg"
                              defaultValue={tier.taxPercent}
                              onChange={(e) => setTierForm(prev => ({ ...prev, taxPercent: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 self-center pb-1">
                            <input 
                              id={`check_active_${tier.id}`}
                              type="checkbox"
                              defaultChecked={tier.active}
                              onChange={(e) => setTierForm(prev => ({ ...prev, active: e.target.checked }))}
                              className="cursor-pointer"
                            />
                            <label htmlFor={`check_active_${tier.id}`} className="text-[10px] font-bold cursor-pointer">Active</label>
                          </div>
                          <div className="flex items-center gap-1.5 self-center pb-1">
                            <input 
                              id={`check_coming_${tier.id}`}
                              type="checkbox"
                              defaultChecked={tier.comingSoon}
                              onChange={(e) => setTierForm(prev => ({ ...prev, comingSoon: e.target.checked }))}
                              className="cursor-pointer"
                            />
                            <label htmlFor={`check_coming_${tier.id}`} className="text-[10px] font-bold cursor-pointer">Coming Soon</label>
                          </div>
                          <button
                            onClick={() => handleSaveTier(tier.id)}
                            className="p-1.5 bg-[#3C1A47] text-white rounded-lg flex items-center justify-center hover:opacity-90 cursor-pointer"
                          >
                            <Save className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs text-text-light line-through font-medium">₹{tier.basePrice}</span>
                              <span className="text-sm font-extrabold text-brand-secondary">₹{tier.offerPrice}</span>
                            </div>
                            <span className="block text-[9px] font-bold text-[#2B9348] mt-0.5">Discount: {tier.discount}% Off</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${tier.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                              {tier.active ? 'Active' : 'Disabled'}
                            </span>
                            {tier.comingSoon && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-100">
                                Coming Soon
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingTier(tier.id);
                                setTierForm({ basePrice: tier.basePrice, offerPrice: tier.offerPrice, taxPercent: tier.taxPercent, active: tier.active, comingSoon: tier.comingSoon });
                              }}
                              className="p-2 bg-white hover:bg-vanilla-secondary text-text-light rounded-xl border border-vanilla-main cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtab 2: Exceptions */}
          {activeSubTab === 'documents' && (
            <div className="bg-white rounded-[24px] border border-vanilla-main shadow-sm p-6 space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-brand-secondary font-display mb-1">Document Exception Rules</h3>
                  <p className="text-xs text-text-light leading-relaxed">
                    Configure document-specific pricing overrides that diverge from the default tier levels.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const docTitle = window.prompt("Enter Document Name (e.g., Special Power of Attorney):");
                    if (!docTitle) return;
                    const tierId = window.prompt("Enter Tier Id (tier_1 to tier_5):", "tier_3");
                    if (!tierId) return;
                    handleAddDocOverride(docTitle, tierId);
                  }}
                  className="px-3.5 py-2 bg-[#3C1A47] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Exception Override
                </button>
              </div>

              {docOverrides.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-vanilla-main rounded-[20px] bg-vanilla-secondary/10">
                  <FileText className="h-8 w-8 text-text-light/50 mx-auto mb-2" />
                  <p className="text-xs text-text-light font-bold">No custom overrides configured.</p>
                  <p className="text-[11px] text-text-light mt-0.5">All documents are governed by their respective tiers.</p>
                </div>
              ) : (
                <div className="divide-y divide-vanilla-main border border-vanilla-main rounded-[20px] overflow-hidden">
                  {docOverrides.map((ov) => (
                    <div key={ov.id} className="p-4 bg-white flex items-center justify-between hover:bg-vanilla-secondary/20 transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-brand-secondary">{ov.documentTitle}</h4>
                        <span className="block text-[9px] font-mono font-bold text-text-light mt-0.5">Governed By: {ov.tierId.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete override exception rule?")) {
                              await deleteDoc(doc(db, 'admin_config', 'pricing', 'documents', ov.id));
                              triggerNotification("Exception override deleted.", "success");
                              loadPricingData();
                            }
                          }}
                          className="p-1.5 text-text-light hover:text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtab 3: Coupons */}
          {activeSubTab === 'coupons' && (
            <div className="bg-white rounded-[24px] border border-vanilla-main shadow-sm p-6 space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-brand-secondary font-display mb-1">Coupon Codes & Launch Campaigns</h3>
                  <p className="text-xs text-text-light leading-relaxed">
                    Set up marketing discount campaign offers, coupon exclusions, and track their conversion performance.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCoupon(!showAddCoupon)}
                  className="px-3.5 py-2 bg-[#3C1A47] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Promotional Coupon
                </button>
              </div>

              {showAddCoupon && (
                <form onSubmit={handleAddCoupon} className="p-4 bg-vanilla-secondary/40 rounded-2xl border border-vanilla-main grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-text-light uppercase">Coupon Code</label>
                    <input 
                      type="text"
                      className="w-full text-xs font-bold uppercase bg-white border border-vanilla-main rounded-xl p-2 focus:ring-1 focus:ring-[#3C1A47]"
                      placeholder="e.g. SAVE25"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-text-light uppercase">Discount %</label>
                    <input 
                      type="number"
                      className="w-full text-xs font-bold bg-white border border-vanilla-main rounded-xl p-2 focus:ring-1 focus:ring-[#3C1A47]"
                      min="1"
                      max="100"
                      value={couponForm.discountPercent}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-text-light uppercase">Expiry (YYYY-MM-DD)</label>
                    <input 
                      type="date"
                      className="w-full text-xs font-medium bg-white border border-vanilla-main rounded-xl p-2 focus:ring-1 focus:ring-[#3C1A47]"
                      value={couponForm.expiryDate}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#2B9348] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 cursor-pointer"
                    >
                      Save Campaign
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCoupon(false)}
                      className="px-4 py-2 bg-white text-text-light border border-vanilla-main text-xs font-bold rounded-xl hover:bg-vanilla-secondary cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {coupons.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-vanilla-main rounded-[20px] bg-vanilla-secondary/10">
                  <Gift className="h-8 w-8 text-text-light/50 mx-auto mb-2" />
                  <p className="text-xs text-text-light font-bold">No active promotional campaigns.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.id} className="p-4 bg-white border border-vanilla-main rounded-2xl flex items-center justify-between shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-brand-secondary font-mono tracking-wider bg-vanilla-secondary px-2 py-0.5 rounded-md border border-vanilla-main">{c.code}</span>
                          <span className="text-[10px] font-bold text-[#2B9348]">{c.discountPercent}% OFF</span>
                        </div>
                        <div className="text-[9px] font-bold text-text-light space-y-0.5">
                          {c.expiryDate && <p>Expires: {c.expiryDate}</p>}
                          <p>Used: {c.usageCount} times</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {c.active ? 'Active' : 'Expired'}
                        </span>
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1.5 text-text-light hover:text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
