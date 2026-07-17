import React, { useState, useEffect } from 'react';
import { Megaphone, CheckCircle, XCircle, Layout, Save, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCMSContext } from '../../context/CMSContext';

export default function AdSenseManager() {
  const { adsenseSettings, saveAdSenseSettings } = useCMSContext();
  const [publisherId, setPublisherId] = useState('ca-pub-XXXXXXXXXXXXXXXX');
  const [autoAds, setAutoAds] = useState(true);
  const [manualAds, setManualAds] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pageSettings, setPageSettings] = useState({
    home: true,
    categories: true,
    blog: true,
    search: true,
    help: true,
    checkout: false,
    payment: false,
    editor: false,
    dashboard: false
  });

  const [positions, setPositions] = useState({
    homepageBanner: true,
    categoryBanner: true,
    blogTop: true,
    blogMiddle: true,
    blogBottom: true,
    searchResults: true,
    sidebar: true,
    footer: false,
    stickyMobile: true
  });

  // Sync state with database values when loaded
  useEffect(() => {
    if (adsenseSettings) {
      if (adsenseSettings.publisherId) setPublisherId(adsenseSettings.publisherId);
      if (adsenseSettings.autoAds !== undefined) setAutoAds(adsenseSettings.autoAds);
      if (adsenseSettings.manualAds !== undefined) setManualAds(adsenseSettings.manualAds);
      if (adsenseSettings.pageSettings) {
        setPageSettings(prev => ({ ...prev, ...adsenseSettings.pageSettings }));
      }
      if (adsenseSettings.positions) {
        setPositions(prev => ({ ...prev, ...adsenseSettings.positions }));
      }
    }
  }, [adsenseSettings]);

  const togglePage = (key: keyof typeof pageSettings) => {
    setPageSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePos = (key: keyof typeof positions) => {
    setPositions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveAdSenseSettings({
        publisherId,
        autoAds,
        manualAds,
        pageSettings,
        positions
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save AdSense settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview & Global Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-[#2B9348]" />
            AdSense Configuration
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono mb-1.5 block">
                Google Publisher ID
              </label>
              <input 
                type="text" 
                value={publisherId}
                onChange={e => setPublisherId(e.target.value)}
                className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] font-mono focus:outline-hidden focus:border-[#2B9348]"
              />
            </div>
            
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl cursor-pointer hover:bg-[#F1FEC8]/30 transition-colors">
                <div>
                  <div className="font-bold text-[#3C1A47] text-sm">Auto Ads</div>
                  <div className="text-xs text-[#8395A7]">Let Google place ads automatically</div>
                </div>
                <input type="checkbox" checked={autoAds} onChange={() => setAutoAds(!autoAds)} className="h-5 w-5 accent-[#2B9348]" />
              </label>
              <label className="flex-1 flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl cursor-pointer hover:bg-[#F1FEC8]/30 transition-colors">
                <div>
                  <div className="font-bold text-[#3C1A47] text-sm">Manual Ad Slots</div>
                  <div className="text-xs text-[#8395A7]">Enable pre-defined ad spaces</div>
                </div>
                <input type="checkbox" checked={manualAds} onChange={() => setManualAds(!manualAds)} className="h-5 w-5 accent-[#2B9348]" />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#3C1A47] p-6 rounded-[24px] shadow-sm text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white/90 text-sm mb-1">Estimated Ad Revenue</h3>
            <p className="text-[10px] text-white/50 font-mono">Current Month</p>
          </div>
          <div>
            <div className="text-4xl font-extrabold font-display">₹1,02,450.00</div>
            <div className="text-xs font-bold text-[#2B9348] flex items-center gap-1 mt-1">
              <span className="h-2 w-2 rounded-full bg-[#2B9348]" /> +14.2% from last month
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Level Controls */}
        <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm">
          <h3 className="text-sm font-bold font-display text-[#3C1A47] mb-4 flex items-center gap-2">
            <Layout className="h-4 w-4 text-[#8395A7]" />
            Page-Level Visibility
          </h3>
          <div className="space-y-3">
            {Object.entries(pageSettings).map(([key, value]) => {
              const isRestricted = ['checkout', 'payment', 'editor', 'dashboard'].includes(key);
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F1FEC8]/20 border border-transparent hover:border-[#E5F5B8] transition-colors">
                  <span className={`text-sm font-medium capitalize ${isRestricted ? 'text-red-600 font-bold' : 'text-[#3C1A47]'}`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()} {isRestricted && '(Restricted Zone)'}
                  </span>
                  {isRestricted ? (
                    <div className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded-md border border-red-100 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> FORCED OFF
                    </div>
                  ) : (
                    <button 
                      onClick={() => togglePage(key as keyof typeof pageSettings)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#2B9348]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slot Controls */}
        <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col">
          <h3 className="text-sm font-bold font-display text-[#3C1A47] mb-4">Ad Slot Placements</h3>
          <div className="space-y-3 flex-1">
            {Object.entries(positions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-[#E5F5B8] bg-[#F1FEC8]/10">
                <span className="text-sm font-medium text-[#3C1A47] capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button 
                  onClick={() => togglePos(key as keyof typeof positions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#3C1A47]' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#E5F5B8]">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Configuration
                </>
              )}
            </button>
            {saveSuccess && (
              <p className="text-center text-xs text-[#2B9348] font-bold mt-2">
                ✓ Configuration saved successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
