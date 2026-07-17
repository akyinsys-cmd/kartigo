import React, { useState } from 'react';
import { Shield, Key, Smartphone, Monitor, Globe, LogOut, Download, Trash2, ShieldCheck, ToggleRight, ToggleLeft, Cookie, Activity, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BusinessProfile from './BusinessProfile';

export default function UserSecuritySettings() {
  const { user, profile, updateBusinessProfile } = useAuth();
  const [cookieConsent, setCookieConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  const mockDevices = [
    { id: 1, type: 'Desktop', name: 'MacBook Pro', browser: 'Chrome', os: 'macOS', location: 'New York, US', ip: '192.168.***.***', lastActive: 'Current Session', current: true },
    { id: 2, type: 'Mobile', name: 'iPhone 13', browser: 'Safari', os: 'iOS 16', location: 'New York, US', ip: '172.20.***.***', lastActive: '2 hours ago', current: false },
    { id: 3, type: 'Desktop', name: 'Windows PC', browser: 'Edge', os: 'Windows 11', location: 'London, UK', ip: '82.14.***.***', lastActive: '3 days ago', current: false },
  ];

  return (
    <div className="space-y-8">
      {/* Default Business Settings */}
      <div className="bg-vanilla-secondary p-6 rounded-[24px] border border-vanilla-main shadow-xs">
        <div className="border-b border-vanilla-main pb-4 mb-6">
          <h3 className="text-lg font-bold text-brand-secondary flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-primary" />
            Global Business Profile
          </h3>
          <p className="text-xs text-text-light mt-1">These details are used to auto-fill your documents and invoices.</p>
        </div>
        <BusinessProfile 
          initialProfile={profile?.businessProfile} 
          onSave={updateBusinessProfile} 
        />
      </div>

      {/* Device Manager */}
      <div>
        <div className="border-b border-vanilla-main pb-4 mb-6">
          <h3 className="text-lg font-bold text-brand-secondary flex items-center gap-2">
            <Monitor className="h-5 w-5 text-brand-primary" />
            Device & Session Manager
          </h3>
          <p className="text-xs text-text-light mt-1">Review where you're logged in and manage your active sessions.</p>
        </div>

        <div className="grid gap-4">
          {mockDevices.map((device) => (
            <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[20px] border border-vanilla-main bg-white hover:border-brand-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${device.current ? 'bg-brand-primary/10 text-brand-primary' : 'bg-vanilla-secondary text-brand-secondary'}`}>
                  {device.type === 'Desktop' ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-secondary">{device.name}</span>
                    {device.current && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Current Device</span>
                    )}
                  </div>
                  <div className="text-xs text-text-light mt-1 flex items-center gap-2 flex-wrap">
                    <span>{device.browser} on {device.os}</span>
                    <span className="h-1 w-1 bg-vanilla-main rounded-full" />
                    <span>{device.location}</span>
                    <span className="h-1 w-1 bg-vanilla-main rounded-full" />
                    <span className="font-mono">{device.ip}</span>
                  </div>
                  <div className="text-[10px] text-text-light font-bold uppercase tracking-wider mt-1.5">
                    Last active: {device.lastActive}
                  </div>
                </div>
              </div>
              {!device.current && (
                <button className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors whitespace-nowrap">
                  <LogOut className="h-4 w-4" /> Revoke Access
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Password & Authentication */}
      <div>
        <div className="border-b border-vanilla-main pb-4 mb-6">
          <h3 className="text-lg font-bold text-brand-secondary flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-primary" />
            Password & Security
          </h3>
        </div>
        
        <div className="bg-white p-6 rounded-[20px] border border-vanilla-main">
          <button className="px-4 py-2 bg-vanilla-secondary text-brand-secondary border border-vanilla-main rounded-xl text-xs font-bold hover:bg-vanilla-main transition-colors">
            Change Password
          </button>
          <p className="text-xs text-text-light mt-3">We will send a password reset link to your email ({user?.email}).</p>
        </div>
      </div>

      {/* Privacy & Data */}
      <div>
        <div className="border-b border-vanilla-main pb-4 mb-6">
          <h3 className="text-lg font-bold text-brand-secondary flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-primary" />
            Privacy & Data
          </h3>
          <p className="text-xs text-text-light mt-1">Manage your data consent and privacy preferences.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-[20px] border border-vanilla-main hover:border-brand-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <Cookie className="h-5 w-5 text-text-light" />
              <div>
                <div className="text-sm font-bold text-brand-secondary">Essential Cookies & Consent</div>
                <div className="text-xs text-text-light">Required for the platform to function properly.</div>
              </div>
            </div>
            <div className="text-xs font-bold text-text-light uppercase tracking-wider">Required</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-[20px] border border-vanilla-main hover:border-brand-primary/30 transition-colors cursor-pointer" onClick={() => setAnalyticsConsent(!analyticsConsent)}>
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-brand-primary" />
              <div>
                <div className="text-sm font-bold text-brand-secondary">Analytics & Usage Data</div>
                <div className="text-xs text-text-light">Help us improve by sharing anonymous usage data.</div>
              </div>
            </div>
            {analyticsConsent ? (
              <ToggleRight className="h-6 w-6 text-brand-primary" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-text-light" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-vanilla-main text-brand-secondary rounded-xl text-xs font-bold hover:bg-vanilla-secondary transition-colors">
              <Download className="h-4 w-4" /> Export My Data
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
              <Trash2 className="h-4 w-4" /> Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
