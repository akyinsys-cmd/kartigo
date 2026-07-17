import React, { useState } from 'react';
import { ShieldAlert, Shield, Key, AlertTriangle, Activity, Lock, Save, Ban, Unlock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminSecurityManager() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'login' | 'sessions' | 'api' | 'fraud' | 'maintenance'>('dashboard');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const mockTrafficData = [
    { time: '00:00', requests: 1200, blocked: 20 },
    { time: '04:00', requests: 800, blocked: 45 },
    { time: '08:00', requests: 3400, blocked: 120 },
    { time: '12:00', requests: 5600, blocked: 450 }, // Attack spike
    { time: '16:00', requests: 4200, blocked: 80 },
    { time: '20:00', requests: 2100, blocked: 30 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">Security Center</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage platform security, API keys, and maintenance settings.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'dashboard', label: 'Security Dashboard', icon: ShieldAlert },
          { id: 'api', label: 'API Security', icon: Key },
          { id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle },
          { id: 'maintenance', label: 'Maintenance Mode', icon: Lock },
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
                <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider">Failed Logins (24h)</span>
                <div className="text-2xl font-bold font-display text-[#3C1A47] mt-2">142</div>
                <div className="text-red-600 text-[10px] font-bold mt-1 flex items-center gap-1">↑ +12.4%</div>
              </div>
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
                <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider">Active Bans</span>
                <div className="text-2xl font-bold font-display text-[#3C1A47] mt-2">84</div>
                <div className="text-[#2B9348] text-[10px] font-bold mt-1 flex items-center gap-1">↓ -5.2%</div>
              </div>
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
                <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider">Blocked IPs</span>
                <div className="text-2xl font-bold font-display text-[#3C1A47] mt-2">1,024</div>
              </div>
              <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex flex-col justify-center items-center text-center">
                <Shield className="h-8 w-8 text-[#2B9348] mb-2" />
                <span className="text-xs font-bold text-[#3C1A47]">Firewall Active</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5F5B8] rounded-[24px] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#3C1A47] font-display mb-6">Traffic & Blocked Requests (24h)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrafficData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F5B8" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8395A7' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8395A7' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5F5B8' }} />
                    <Area type="monotone" dataKey="requests" stackId="1" stroke="#8395A7" fill="#8395A7" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="blocked" stackId="2" stroke="#D90429" fill="#D90429" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        
        {activeTab === 'login' && (
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47]">Login Protection</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure protections against brute force and credential stuffing.</p>
              </div>
              <button className="px-4 py-2 bg-[#3C1A47] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2C1335] transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Max Login Attempts (before lock)</label>
                  <input type="number" defaultValue={5} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Account Lockout Duration (Minutes)</label>
                  <input type="number" defaultValue={30} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30 mt-4">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Suspicious Login Alerts</div>
                  <div className="text-xs text-[#8395A7]">Send email alert on login from new device/location</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47]">Session & Device Management</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure user session lifecycles and device tracking.</p>
              </div>
              <button className="px-4 py-2 bg-[#3C1A47] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2C1335] transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Default Session Expiry (Hours)</label>
                  <input type="number" defaultValue={24} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">"Remember Me" Session Expiry (Days)</label>
                  <input type="number" defaultValue={30} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30 mt-4">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Concurrent Sessions</div>
                  <div className="text-xs text-[#8395A7]">Allow users to be logged in on multiple devices simultaneously</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Force Logout All Users</div>
                  <div className="text-xs text-[#8395A7] text-red-600">Immediately invalidates all active sessions (Emergency only)</div>
                </div>
                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                  Execute Global Logout
                </button>
              </div>
            </div>
          </div>
        )}
{activeTab === 'api' && (
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47]">API Rate Limiting</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure rate limits to prevent abuse.</p>
              </div>
              <button className="px-4 py-2 bg-[#3C1A47] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2C1335] transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Global API Rate Limit (req/min)</label>
                  <input type="number" defaultValue={60} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Document Generation Limit (req/hr)</label>
                  <input type="number" defaultValue={10} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Fraud Monitoring</h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Detect Multiple Failed Payments</div>
                      <div className="text-xs text-[#8395A7]">Alert if &gt;3 failed payments from same IP</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Suspicious Referral Activity</div>
                      <div className="text-xs text-[#8395A7]">Flag accounts with same-IP referrals</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Rapid Document Requests</div>
                      <div className="text-xs text-[#8395A7]">Alert on unusually high API traffic from single user</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Duplicate Accounts</div>
                      <div className="text-xs text-[#8395A7]">Prevent multiple sign-ups from the same device fingerprint</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Account Abuse</div>
                      <div className="text-xs text-[#8395A7]">Detect automated credential stuffing and bot behavior</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-white p-6 md:p-8 rounded-[24px] border border-[#E5F5B8] shadow-sm">
            <div className="max-w-2xl mx-auto text-center">
              <Lock className={`h-16 w-16 mx-auto mb-6 ${maintenanceMode ? 'text-amber-500' : 'text-[#8395A7]'}`} />
              <h3 className="text-2xl font-bold font-display text-[#3C1A47] mb-2">
                {maintenanceMode ? 'Maintenance Mode is Active' : 'Maintenance Mode is Off'}
              </h3>
              <p className="text-sm text-[#8395A7] mb-8">
                When active, all non-admin users will see a maintenance screen. Active sessions will be preserved but API requests will be paused.
              </p>
              
              <div className="bg-[#F1FEC8]/30 p-6 rounded-2xl border border-[#E5F5B8] text-left mb-8 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider block mb-1">Custom Maintenance Message</label>
                  <textarea rows={2} defaultValue="We are upgrading our database. We'll be back shortly!" className="w-full bg-white border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] focus:outline-hidden resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider block mb-1">Estimated Duration (Hours)</label>
                  <input type="number" defaultValue={2} className="w-full bg-white border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>

              <button 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`px-8 py-3 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-colors w-full sm:w-auto mx-auto ${
                  maintenanceMode 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-[#3C1A47] hover:bg-[#2C1335] text-white'
                }`}
              >
                {maintenanceMode ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
