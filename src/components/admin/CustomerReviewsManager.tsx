import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Check, X, Trash2, Edit2, Plus, Search, Filter, 
  ThumbsUp, Calendar, RefreshCw, AlertCircle, Save, CheckCircle2, User, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  docType: string;
  status: 'Approved' | 'Pending' | 'Suspended';
  createdAt: string;
  likes: number;
  featured: boolean;
}

export default function CustomerReviewsManager() {
  const { profile: currentAdminProfile } = useAuth();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  
  // Add / Edit Testimonial form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [docType, setDocType] = useState("Rental Agreement");
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Pending' | 'Suspended'>("Approved");
  const [featured, setFeatured] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: CustomerReview[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CustomerReview);
        });

        if (list.length > 0) {
          setReviews(list);
        } else {
          // Prepopulate static testimonials if collection is completely empty
          const fallbackReviews: CustomerReview[] = [
            {
              id: "rev_1",
              customerName: "Aravind Sharma",
              rating: 5,
              reviewText: "Kartigo Draft transformed how our agency creates vendor agreements! Generated a legally sound document with stamp guidelines in under 2 minutes. Highly recommended!",
              docType: "Vendor Agreement",
              status: "Approved",
              createdAt: "2026-07-10T10:30:00Z",
              likes: 42,
              featured: true
            },
            {
              id: "rev_2",
              customerName: "Sneha Reddy",
              rating: 5,
              reviewText: "Super fast and compliant with Karnataka state jurisdiction laws. The Hinglish chat helper is extremely helpful and easy to follow.",
              docType: "Rental Agreement",
              status: "Approved",
              createdAt: "2026-07-15T14:22:00Z",
              likes: 18,
              featured: true
            },
            {
              id: "rev_3",
              customerName: "Vikram Malhotra",
              rating: 4,
              reviewText: "Very convenient Co-Founder Agreement template. Saved us expensive consultation fees with lawyers. Would love to see more customization options.",
              docType: "Co-Founder Agreement",
              status: "Pending",
              createdAt: "2026-07-16T18:45:00Z",
              likes: 4,
              featured: false
            }
          ];
          setReviews(fallbackReviews);
        }
      } catch (err) {
        console.error("Firestore reviews reading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !reviewText) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const reviewId = editingId || `rev_${Date.now()}`;
      const payload: Partial<CustomerReview> = {
        customerName,
        rating,
        reviewText,
        docType,
        status: reviewStatus,
        featured,
        likes: editingId ? reviews.find(r => r.id === editingId)?.likes || 0 : 0,
        createdAt: editingId ? reviews.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
      };

      await setDoc(doc(db, "reviews", reviewId), payload, { merge: true });

      // Update Local State
      if (editingId) {
        setReviews(reviews.map(r => r.id === editingId ? { ...r, ...payload } as CustomerReview : r));
      } else {
        setReviews([{ id: reviewId, ...payload } as CustomerReview, ...reviews]);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
      }, 1500);

    } catch (err) {
      console.error("Error writing review:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (r: CustomerReview) => {
    setEditingId(r.id);
    setCustomerName(r.customerName);
    setRating(r.rating);
    setReviewText(r.reviewText);
    setDocType(r.docType);
    setReviewStatus(r.status);
    setFeatured(r.featured);
    setShowAddForm(true);
  };

  const handleToggleStatus = async (reviewId: string, currentStatus: 'Approved' | 'Pending' | 'Suspended') => {
    const nextStatus = currentStatus === 'Approved' ? 'Suspended' : 'Approved';
    try {
      await updateDoc(doc(db, "reviews", reviewId), { status: nextStatus });
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: nextStatus } : r));
    } catch (err) {
      console.error("Failed updating review status:", err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this customer review/testimonial?")) {
      try {
        await deleteDoc(doc(db, "reviews", reviewId));
        setReviews(reviews.filter(r => r.id !== reviewId));
      } catch (err) {
        console.error("Failed to delete review:", err);
      }
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setRating(5);
    setReviewText("");
    setDocType("Rental Agreement");
    setReviewStatus("Approved");
    setFeatured(false);
  };

  // Filters search
  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.docType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
            <Star className="h-6 w-6 text-[#2B9348] fill-current" />
            Customer Review Moderation
          </h2>
          <p className="text-xs text-[#8395A7] font-mono mt-1">
            Read, moderate, feature, or create client testimonials and social proofs on the landing page.
          </p>
        </div>

        <button 
          onClick={() => { resetForm(); setEditingId(null); setShowAddForm(!showAddForm); }}
          className="px-4 py-2.5 bg-[#2B9348] hover:bg-[#237c3c] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> {showAddForm ? "Hide Form" : "Create Testimonial"}
        </button>
      </div>

      {/* Grid: Form and Reviews table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Add / Edit form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-4 self-start"
            >
              <div className="border-b border-[#E5F5B8] pb-3 mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-[#3C1A47] font-display flex items-center gap-1.5">
                  <Edit2 className="h-4 w-4 text-[#2B9348]" />
                  {editingId ? "Edit Testimonial" : "New Testimonial"}
                </span>
                <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-[#8395A7] hover:text-[#3C1A47]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-[#2B9348] text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Client Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Priyesh Kapoor"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Star Rating ({rating} Stars)</label>
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-hidden"
                      >
                        <Star className={`h-5 w-5 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Document Type Ref</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Non-Disclosure Agreement"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Review/Testimonial Feedback</label>
                  <textarea 
                    required
                    placeholder="Describe their experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Status</label>
                    <select 
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as any)}
                      className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl">
                    <span className="font-bold text-[#3C1A47]">Featured</span>
                    <input 
                      type="checkbox" 
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 text-[#2B9348] border-[#E5F5B8] focus:ring-[#2B9348]"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Deploy Testimonial
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Search / Filters & Reviews List Table */}
        <div className={`bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col min-h-[500px] ${showAddForm ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5F5B8] pb-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
              <input 
                type="text" 
                placeholder="Search reviews, clients, document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F1FEC8]/10 border border-[#E5F5B8] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#8395A7]" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F1FEC8]/10 border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs font-bold text-[#3C1A47] focus:outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved Only</option>
                <option value="Pending">Pending Only</option>
                <option value="Suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#8395A7]">
              <RefreshCw className="h-8 w-8 animate-spin text-[#2B9348] mb-2" />
              <p className="font-bold text-sm">Syncing client testimonials...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8395A7] py-20">
              <MessageSquare className="h-12 w-12 text-[#E5F5B8] mb-3" />
              <p className="font-bold">No matching reviews found</p>
              <p className="text-xs">Adjust search query or create a fresh testimonial entry.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {filteredReviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-[#E5F5B8] bg-white hover:shadow-xs transition-all flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 text-left flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-xs text-[#3C1A47] flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-[#8395A7]" />
                        {r.customerName}
                      </span>
                      
                      <span className="text-[10px] font-bold text-[#2B9348] bg-[#F1FEC8] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                        <FileText className="h-3 w-3" />
                        {r.docType}
                      </span>

                      {r.featured && (
                        <span className="text-[9px] font-extrabold uppercase bg-[#3C1A47] text-[#F1FEC8] px-1.5 py-0.5 rounded border border-[#3C1A47]">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex gap-0.5 py-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-3.5 w-3.5 ${idx < r.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>

                    <p className="text-xs font-medium text-[#3C1A47]/90 leading-relaxed italic">
                      "{r.reviewText}"
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-[#8395A7] font-mono pt-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(r.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {r.likes || 0} Helpful Marks</span>
                    </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button 
                      onClick={() => handleToggleStatus(r.id, r.status)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                        r.status === 'Approved' 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {r.status === 'Approved' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      {r.status}
                    </button>

                    <button 
                      onClick={() => handleStartEdit(r)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-xl"
                      title="Edit review"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button 
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl"
                      title="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
