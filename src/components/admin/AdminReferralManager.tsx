import React, { useState } from 'react';
import { Users, Gift, Share2, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminReferralManager() {
  const [activeTab, setActiveTab] = useState<'overview' | 'affiliates' | 'coupons'>('overview');

  const mockReferralData = [
    { name: 'Week 1', signups: 12, revenue: 120 },
    { name: 'Week 2', signups: 18, revenue: 250 },
    { name: 'Week 3', signups: 25, revenue: 420 },
    { name: 'Week 4', signups: 42, revenue: 840 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">Referrals & Affiliates</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage user referrals, affiliate programs, and promotional coupons.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'overview', label: 'Referral Program', icon: Users },
          { id: 'affiliates', label: 'Affiliate Network', icon: Share2 },
          { id: 'coupons', label: 'Coupons & Promos', icon: Gift },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#2B9348] text-white border-[#2B9348]'
                : 'bg-white text-[#8395A7] border-[#E5F5B8] hover:border-[#2B9348]/30 hover:text-[#2B9348]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#2B9348]/10 flex items-center justify-center text-[#2B9348]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3C1A47]">1,402</div>
                  <div className="text-xs text-[#8395A7]">Total Referrals</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#2B9348]/10 flex items-center justify-center text-[#2B9348]">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3C1A47]">₹11.8 Lakh</div>
                  <div className="text-xs text-[#8395A7]">Referral Revenue</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#2B9348]/10 flex items-center justify-center text-[#2B9348]">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3C1A47]">₹1,98,000</div>
                  <div className="text-xs text-[#8395A7]">Rewards Paid</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#2B9348]/10 flex items-center justify-center text-[#2B9348]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3C1A47]">12.4%</div>
                  <div className="text-xs text-[#8395A7]">Conversion Rate</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5F5B8] rounded-[24px] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#3C1A47] font-display mb-6">Referral Growth Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockReferralData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F5B8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8395A7' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8395A7' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5F5B8' }} />
                    <Area type="monotone" dataKey="signups" stroke="#2B9348" strokeWidth={3} fill="#2B9348" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white border border-[#E5F5B8] rounded-[24px] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#3C1A47] font-display mb-4">Referral Rules Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Referrer Reward (User who invites)</label>
                    <input type="text" defaultValue="₹800 Credit" className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Referee Reward (Invited friend)</label>
                    <input type="text" defaultValue="20% Off First Document" className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                  </div>
                </div>
                <button className="px-6 py-2 bg-[#3C1A47] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2C1335] transition-colors">
                  Update Rules
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-12 text-center">
            <Share2 className="h-12 w-12 text-[#E5F5B8] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#3C1A47] font-display mb-2">Affiliate Network (Beta)</h3>
            <p className="text-xs text-[#8395A7] max-w-md mx-auto mb-6">
              The external affiliate system is currently being provisioned. This will allow you to approve external marketers, set commission tiers (e.g. 30% recurring), and manage payouts.
            </p>
            <button className="px-6 py-2 border border-[#E5F5B8] text-[#3C1A47] rounded-xl text-sm font-bold hover:bg-[#F1FEC8]/50 transition-colors">
              Join Early Access Waitlist
            </button>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-bold font-display text-[#3C1A47]">Coupons & Promos</h3>
              <button className="px-4 py-2 bg-[#2B9348] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#237a3b] transition-colors">
                + Create Coupon
              </button>
            </div>
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                    <th className="p-4 font-bold">Code</th>
                    <th className="p-4 font-bold">Discount</th>
                    <th className="p-4 font-bold">Usage Limits</th>
                    <th className="p-4 font-bold">Expires</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5F5B8] text-sm">
                  {[
                    { code: 'WELCOME20', discount: '20% OFF', usage: '342 / Unlimited', exp: 'Never', status: 'Active' },
                    { code: 'BLACKFRIDAY', discount: '50% OFF', usage: '4,102 / 5000', exp: 'Nov 30, 2026', status: 'Active' },
                    { code: 'VIPCREDIT', discount: '₹1,200 OFF', usage: '12 / 50', exp: 'Dec 31, 2026', status: 'Active' },
                    { code: 'SUMMER', discount: '10% OFF', usage: '842 / 1000', exp: 'Aug 31, 2025', status: 'Expired' },
                  ].map((coupon, i) => (
                    <tr key={i} className="hover:bg-[#F1FEC8]/20 transition-colors">
                      <td className="p-4 text-[#3C1A47] font-bold font-mono">{coupon.code}</td>
                      <td className="p-4 text-[#2B9348] font-bold">{coupon.discount}</td>
                      <td className="p-4 text-[#8395A7] text-xs">{coupon.usage}</td>
                      <td className="p-4 text-[#8395A7] text-xs">{coupon.exp}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {coupon.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
