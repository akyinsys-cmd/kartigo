import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Mail, Save, Server, Globe, Lock, 
  Palette, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsManager() {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings State
  const [appName, setAppName] = useState("Kartigo Draft");
  const [appSlogan, setAppSlogan] = useState("AI-Powered Indian Legal and Business Document Intelligence");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [gstId, setGstId] = useState("29AKYIN1234A1Z0");
  const [companyName, setCompanyName] = useState("AKYIN Ventures Private Limited");
  const [companyAddress, setCompanyAddress] = useState("Suite 404, Koramangala 4th Block, Bangalore, KA, 560034");

  // Theme & Branding State
  const [primaryColor, setPrimaryColor] = useState("#3C1A47");
  const [accentColor, setAccentColor] = useState("#2B9348");
  const [highlightColor, setHighlightColor] = useState("#F1FEC8");
  const [logoUrl, setLogoUrl] = useState("https://kartigo.online/assets/logo.png");
  const [primaryFont, setPrimaryFont] = useState("Inter");
  const [displayFont, setDisplayFont] = useState("Space Grotesk");

  // Email (SMTP) Settings State
  const [smtpHost, setSmtpHost] = useState("smtp.resend.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("alerts@kartigo.online");
  const [smtpPass, setSmtpPass] = useState("••••••••••••••••");
  const [fromEmail, setFromEmail] = useState("noreply@kartigo.online");

  // Firebase State
  const [firebaseProjectId, setFirebaseProjectId] = useState("kartigo-draft-production");
  const [firebaseApiKey, setFirebaseApiKey] = useState("AIzaSyB1-mK9c8-zFpL_QwRtYuIoPas");
  const [firebaseRegion, setFirebaseRegion] = useState("asia-south1 (Mumbai)");
  const [firestoreDbId, setFirestoreDbId] = useState("(default)");

  // Security State
  const [logoutTimer, setLogoutTimer] = useState(30);
  const [minPasswordLen, setMinPasswordLen] = useState(8);
  const [mfaMandate, setMfaMandate] = useState(true);
  const [ipWhitelisting, setIpWhitelisting] = useState("103.14.120.*, 192.168.1.*");

  const handleSave = () => {
    setSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-left">
      
      {/* Sidebar Settings Nav */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        {[
          { id: 'general', label: 'General & Company', icon: Globe },
          { id: 'theme', label: 'Theme & Branding', icon: Palette },
          { id: 'email', label: 'Email (SMTP)', icon: Mail },
          { id: 'firebase', label: 'Firebase Config', icon: Server },
          { id: 'security', label: 'Security & Admin Lock', icon: Lock },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeSection === item.id 
                ? 'bg-[#3C1A47] text-white shadow-md' 
                : 'bg-white text-[#8395A7] border border-[#E5F5B8] hover:border-[#3C1A47]/30 hover:text-[#3C1A47]'
            }`}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white p-6 md:p-8 rounded-[24px] border border-[#E5F5B8] shadow-sm">
        
        {saveSuccess && (
          <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#2B9348]">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            System parameters updated successfully! Cache cleared and updates propagated to production instances.
          </div>
        )}

        {/* Section 1: General & Company */}
        {activeSection === 'general' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#2B9348]" />
                General & Company Settings
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure default corporate billing options, app currency, timezone, and official registration numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">App Brand Name</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">App Tagline/Slogan</label>
                <input 
                  type="text" 
                  value={appSlogan}
                  onChange={(e) => setAppSlogan(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Official Company Entity</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Company GSTIN ID</label>
                <input 
                  type="text" 
                  value={gstId}
                  onChange={(e) => setGstId(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">System Primary Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                >
                  <option value="INR">INR (₹) - Indian Rupees</option>
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euros</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">System Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST) - GMT+5:30</option>
                  <option value="Asia/Singapore">Asia/Singapore - GMT+8:00</option>
                  <option value="America/New_York">America/New_York (EST) - GMT-5:00</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Official Corporate Address</label>
                <textarea 
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                  rows={2}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Section 2: Theme & Branding */}
        {activeSection === 'theme' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#2B9348]" />
                Theme & Branding Customizer
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Customize colors, display fonts, logos, and layouts directly to modify UI templates dynamically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Brand Primary (Deep Plum)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-[#E5F5B8] cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 text-center text-[#3C1A47] font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Brand Accent (Forest Green)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-[#E5F5B8] cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 text-center text-[#3C1A47] font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Brand Highlight (Lemon Luster)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-[#E5F5B8] cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="flex-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 text-center text-[#3C1A47] font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Corporate Brand Logo URL</label>
                <input 
                  type="text" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Body Font Family</label>
                <select 
                  value={primaryFont}
                  onChange={(e) => setPrimaryFont(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden"
                >
                  <option value="Inter">Inter (Swiss Modern)</option>
                  <option value="Outfit">Outfit (Tech Elegant)</option>
                  <option value="Roboto">Roboto (Google standard)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Display Font Family (Headings)</label>
                <select 
                  value={displayFont}
                  onChange={(e) => setDisplayFont(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden"
                >
                  <option value="Space Grotesk">Space Grotesk (Neo Brutalist)</option>
                  <option value="Outfit">Outfit (Symmetrical Elegance)</option>
                  <option value="Playfair Display">Playfair Display (Premium Editorial)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section 3: Email (SMTP) */}
        {activeSection === 'email' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#2B9348]" />
                Email (SMTP) Settings
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure your mail server for sending transactional emails (receipts, password resets).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">SMTP Host</label>
                <input 
                  type="text" 
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">SMTP Port</label>
                <input 
                  type="number" 
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Encryption</label>
                <select className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]">
                  <option>TLS (Port 587)</option>
                  <option>SSL (Port 465)</option>
                  <option>None (Insecure)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">SMTP Username</label>
                <input 
                  type="text" 
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">SMTP Password</label>
                <input 
                  type="password" 
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">From Email Address</label>
                <input 
                  type="email" 
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button className="px-4 py-2 text-xs font-bold text-[#2B9348] border border-[#2B9348] rounded-xl hover:bg-[#2B9348]/10 transition-colors cursor-pointer">
                Send Test Email
              </button>
            </div>
          </motion.div>
        )}

        {/* Section 4: Firebase Configuration */}
        {activeSection === 'firebase' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Server className="h-5 w-5 text-[#2B9348]" />
                Firebase SDK Configuration
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Synchronize and check health connection to your Firebase Auth, Firestore Database, and Cloud Storage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Project ID</label>
                <input 
                  type="text" 
                  value={firebaseProjectId}
                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] font-mono focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Web SDK API Key</label>
                <input 
                  type="password" 
                  value={firebaseApiKey}
                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] font-mono focus:outline-hidden focus:border-[#2B9348]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Firestore Host Region</label>
                <input 
                  type="text" 
                  disabled
                  value={firebaseRegion}
                  className="w-full bg-vanilla-secondary/50 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47]/70 font-mono focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Firestore Database ID</label>
                <input 
                  type="text" 
                  disabled
                  value={firestoreDbId}
                  className="w-full bg-vanilla-secondary/50 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47]/70 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-green-800 block">Database Connected</span>
                <p className="text-[#8395A7] mt-0.5">Firestore security rules mapped and validated. Auto-backup schema snapshot running every 24 hours.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section 5: Security & Admin Lock */}
        {activeSection === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Security & Access Control
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure session lifetimes, password complexities, and IP network restriction maps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Session Expire Logout (Minutes)</label>
                <input 
                  type="number" 
                  value={logoutTimer}
                  onChange={(e) => setLogoutTimer(parseInt(e.target.value))}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Min Password Length</label>
                <input 
                  type="number" 
                  value={minPasswordLen}
                  onChange={(e) => setMinPasswordLen(parseInt(e.target.value))}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Whitelisted IP Masks (Comma separated)</label>
                <input 
                  type="text" 
                  value={ipWhitelisting}
                  onChange={(e) => setIpWhitelisting(e.target.value)}
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] font-mono focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="space-y-0.5 text-left">
                  <span className="font-extrabold text-[#3C1A47] block">Enforce Admin Multi-Factor (MFA)</span>
                  <span className="text-[10px] text-amber-800">Force all Super Admin and Finance accounts to pass Google Authenticator verification.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={mfaMandate}
                  onChange={(e) => setMfaMandate(e.target.checked)}
                  className="h-5 w-5 text-[#2B9348] border-[#E5F5B8] rounded-md focus:ring-[#2B9348] cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Save Controls */}
        <div className="mt-8 pt-6 border-t border-[#E5F5B8] flex items-center justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save System Configurations
          </button>
        </div>

      </div>
    </div>
  );
}
