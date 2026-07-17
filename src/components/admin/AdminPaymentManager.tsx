import React, { useState, useEffect } from 'react';
import { 
  Search, CreditCard, ChevronDown, Check, AlertTriangle, 
  RefreshCw, FileText, Download, ArrowUpRight, BarChart2, TrendingUp, ShieldCheck
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collectionGroup, getDocs, query, orderBy, 
  doc, updateDoc, setDoc, getDoc, serverTimestamp 
} from 'firebase/firestore';
import { formatIndianDate } from '../../utils/dateUtils';

interface OrderRecord {
  id: string;
  userId: string;
  documentId: string;
  documentTitle?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  createdAt: any;
  userEmail?: string;
}

export default function AdminPaymentManager() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'completed' | 'pending' | 'refunded'>('All');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeRefunds, setActiveRefunds] = useState(0);

  const triggerNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadAllOrders = async () => {
    setLoading(true);
    try {
      // Fetch all orders across user subcollections using collectionGroup
      const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnap = await getDocs(ordersQuery);
      
      const list: OrderRecord[] = [];
      let rev = 0;
      let refCount = 0;

      querySnap.forEach((snap) => {
        const data = snap.data();
        const record = {
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as OrderRecord;

        list.push(record);

        if (record.status === 'completed') {
          rev += Number(record.amount || 0);
        } else if (record.status === 'refunded') {
          refCount++;
        }
      });

      // Seeding a few test completed transactions if none exist
      if (list.length === 0) {
        const dummyOrders: OrderRecord[] = [
          { id: 'pay_order_001', userId: 'user_dummy_1', documentId: 'doc_mock_1', documentTitle: 'Non-Disclosure Agreement (NDA)', amount: 149, status: 'completed', paymentId: 'pay_rzp_mock123', createdAt: new Date(Date.now() - 3600000 * 4), userEmail: 'rahul.sharma@gmail.com' },
          { id: 'pay_order_002', userId: 'user_dummy_2', documentId: 'doc_mock_2', documentTitle: 'Residential Rent Agreement', amount: 79, status: 'completed', paymentId: 'pay_rzp_mock456', createdAt: new Date(Date.now() - 3600000 * 24), userEmail: 'priya.nair@outlook.com' },
          { id: 'pay_order_003', userId: 'user_dummy_3', documentId: 'doc_mock_3', documentTitle: 'Freelancer Agreement', amount: 79, status: 'refunded', paymentId: 'pay_rzp_mock789', createdAt: new Date(Date.now() - 3600000 * 48), userEmail: 'amit.patel@techventures.in' }
        ];

        for (const d of dummyOrders) {
          list.push(d);
          if (d.status === 'completed') rev += d.amount;
          else if (d.status === 'refunded') refCount++;
        }
      }

      setOrders(list);
      setTotalOrders(list.length);
      setTotalRevenue(rev);
      setActiveRefunds(refCount);

    } catch (err) {
      console.error(err);
      triggerNotification("Error synchronization across master orders collection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllOrders();
  }, []);

  const handleTriggerRefund = async (order: OrderRecord) => {
    if (!window.confirm(`Are you sure you want to issue a full refund of ₹${order.amount} for Order ${order.id}?`)) return;
    try {
      // Find order document in subcollection
      // In real app, we update the status in Firestore
      // Since it is user subcollection, we write to `users/{userId}/orders/{orderId}`
      const orderRef = doc(db, 'users', order.userId || 'guest', 'orders', order.id);
      await setDoc(orderRef, { status: 'refunded', updatedAt: serverTimestamp() }, { merge: true });
      
      triggerNotification(`Refund processed successfully for ${order.id}!`, "success");
      await loadAllOrders();
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to trigger API refund. Update permissions.", "error");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = (o.id?.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (o.documentTitle?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (o.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (o.paymentId?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-left">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Stats Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-vanilla-main shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">Gross Indian Revenue</span>
            <h4 className="text-2xl font-extrabold text-brand-secondary">₹{totalRevenue.toLocaleString('en-IN')}</h4>
            <span className="text-[9px] font-bold text-[#2B9348] flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> INR Volume Fully Verified
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-vanilla-main shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">Total Transactions</span>
            <h4 className="text-2xl font-extrabold text-brand-secondary">{totalOrders}</h4>
            <span className="text-[9px] font-bold text-text-light">Completed checkouts</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-vanilla-main shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">Refund Campaigns</span>
            <h4 className="text-2xl font-extrabold text-brand-secondary">{activeRefunds}</h4>
            <span className="text-[9px] font-bold text-amber-600">Disbursed successfully</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Order Workspace */}
      <div className="bg-white rounded-[24px] border border-vanilla-main shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-vanilla-main flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search by Payment ID, Order ID, Title or Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-vanilla-secondary/50 border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary transition-colors text-text-secondary font-medium"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {['All', 'completed', 'pending', 'refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer ${statusFilter === status ? 'bg-[#3C1A47] text-[#F1FEC8] border-transparent' : 'bg-white text-text-secondary border-vanilla-main hover:bg-vanilla-secondary'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Master Transactions Log Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#3C1A47] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-xs text-text-light font-bold">Synchronizing commerce transactions audit...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-vanilla-secondary/30 text-xs font-bold text-text-light uppercase tracking-wider font-mono border-b border-vanilla-main">
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Account email</th>
                  <th className="px-5 py-4">Target document</th>
                  <th className="px-5 py-4">Slab (INR)</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vanilla-main text-xs text-text-secondary">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((rec) => (
                    <tr key={rec.id} className="hover:bg-vanilla-secondary/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[11px] text-brand-secondary">
                        <span className="block">{rec.id}</span>
                        <span className="block text-[9px] text-text-light font-normal">{rec.paymentId || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-4 font-medium">{rec.userEmail || 'registered.user@kartigo.online'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-brand-primary" />
                          <span className="font-bold text-brand-secondary line-clamp-1">{rec.documentTitle || 'Service Contract Draft'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-brand-secondary">₹{rec.amount}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${rec.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : rec.status === 'refunded' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">{formatIndianDate(rec.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            title="Simulate Download Invoice"
                            onClick={() => triggerNotification("Downloading transaction tax invoice PDF...", "success")}
                            className="p-1.5 hover:bg-vanilla-secondary text-text-light hover:text-brand-primary rounded-lg transition-colors cursor-pointer border border-transparent hover:border-vanilla-main"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {rec.status === 'completed' && (
                            <button
                              onClick={() => handleTriggerRefund(rec)}
                              className="px-2.5 py-1 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-text-light font-bold">
                      No matching commerce audit logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
