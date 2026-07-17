import React, { useState, useEffect } from 'react';
import { 
  Layout, Share2, Megaphone, MonitorSmartphone, MousePointerClick, 
  Save, Plus, Mail, Phone, MapPin, Clock, Compass, Target, Eye, 
  FileText, Loader2, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCMSContext } from '../../context/CMSContext';

export default function AdminMarketingManager() {
  const { 
    homepageContent, saveHomepageSections,
    aboutContent, saveAboutContent,
    contactSettings, saveContactSettings
  } = useCMSContext();

  const [activeTab, setActiveTab] = useState<'homepage' | 'about' | 'contact' | 'landing' | 'banners' | 'popups' | 'social'>('homepage');

  // --- Homepage CMS State ---
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroPrimaryCta, setHeroPrimaryCta] = useState('');
  const [heroSecondaryCta, setHeroSecondaryCta] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  // --- About Us CMS State ---
  const [aboutHeroTitle, setAboutHeroTitle] = useState('');
  const [aboutHeroSubtitle, setAboutHeroSubtitle] = useState('');
  const [ourStory, setOurStory] = useState('');
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [val1Title, setVal1Title] = useState('');
  const [val1Desc, setVal1Desc] = useState('');
  const [val2Title, setVal2Title] = useState('');
  const [val2Desc, setVal2Desc] = useState('');
  const [val3Title, setVal3Title] = useState('');
  const [val3Desc, setVal3Desc] = useState('');

  // --- Contact Settings State ---
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactHours, setContactHours] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when CMS settings loaded
  useEffect(() => {
    if (homepageContent) {
      setHeroHeadline(homepageContent.heroHeadline || '');
      setHeroSubheadline(homepageContent.heroSubheadline || '');
      setHeroPrimaryCta(homepageContent.heroPrimaryCta || '');
      setHeroSecondaryCta(homepageContent.heroSecondaryCta || '');
      setSearchPlaceholder(homepageContent.searchPlaceholder || '');
    }
  }, [homepageContent]);

  useEffect(() => {
    if (aboutContent) {
      setAboutHeroTitle(aboutContent.heroTitle || '');
      setAboutHeroSubtitle(aboutContent.heroSubtitle || '');
      setOurStory(aboutContent.ourStory || '');
      setMission(aboutContent.mission || '');
      setVision(aboutContent.vision || '');
      
      const vals = aboutContent.values || [];
      if (vals[0]) {
        setVal1Title(vals[0].title || '');
        setVal1Desc(vals[0].desc || '');
      }
      if (vals[1]) {
        setVal2Title(vals[1].title || '');
        setVal2Desc(vals[1].desc || '');
      }
      if (vals[2]) {
        setVal3Title(vals[2].title || '');
        setVal3Desc(vals[2].desc || '');
      }
    }
  }, [aboutContent]);

  useEffect(() => {
    if (contactSettings) {
      setContactEmail(contactSettings.email || '');
      setContactPhone(contactSettings.phone || '');
      setContactWhatsapp(contactSettings.whatsapp || '');
      setContactAddress(contactSettings.address || '');
      setContactHours(contactSettings.hours || '');
    }
  }, [contactSettings]);

  // Handle Homepage Save
  const handleSaveHomepage = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveHomepageSections({
        heroHeadline,
        heroSubheadline,
        heroPrimaryCta,
        heroSecondaryCta,
        searchPlaceholder
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save homepage content', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle About Save
  const handleSaveAbout = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveAboutContent({
        heroTitle: aboutHeroTitle,
        heroSubtitle: aboutHeroSubtitle,
        ourStory,
        mission,
        vision,
        values: [
          { title: val1Title, desc: val1Desc },
          { title: val2Title, desc: val2Desc },
          { title: val3Title, desc: val3Desc }
        ]
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save about content', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle Contact Save
  const handleSaveContact = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveContactSettings({
        email: contactEmail,
        phone: contactPhone,
        whatsapp: contactWhatsapp,
        address: contactAddress,
        hours: contactHours
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save contact settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12">
      {/* Sidebar Nav */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        {[
          { id: 'homepage', label: 'Homepage CMS', icon: Layout },
          { id: 'about', label: 'About Us CMS', icon: Compass },
          { id: 'contact', label: 'Contact Details', icon: Mail },
          { id: 'landing', label: 'Landing Pages', icon: FileText },
          { id: 'banners', label: 'Banner Manager', icon: MonitorSmartphone },
          { id: 'popups', label: 'Popups & Intent', icon: MousePointerClick },
          { id: 'social', label: 'Social Sharing', icon: Share2 },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as any);
              setSaveSuccess(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === item.id 
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
        
        {/* HOMEPAGE CMS */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4">
              <h3 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Layout className="h-5 w-5 text-brand-primary" />
                Homepage CMS
              </h3>
              <p className="text-xs text-[#8395A7] mt-1">Configure and manage titles, content, and search bars visible on the public home view.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Hero Main Headline</label>
                <input 
                  type="text" 
                  value={heroHeadline}
                  onChange={e => setHeroHeadline(e.target.value)}
                  placeholder="Expert-Grade Business & Legal Documents"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Hero Subheadline</label>
                <textarea 
                  rows={3}
                  value={heroSubheadline}
                  onChange={e => setHeroSubheadline(e.target.value)}
                  placeholder="Draft, customize, and sign legally compliant agreements, NDAs, and HR letters in minutes."
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Primary CTA Button Label</label>
                  <input 
                    type="text" 
                    value={heroPrimaryCta}
                    onChange={e => setHeroPrimaryCta(e.target.value)}
                    placeholder="Talk to AI Assistant"
                    className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Secondary CTA Button Label</label>
                  <input 
                    type="text" 
                    value={heroSecondaryCta}
                    onChange={e => setHeroSecondaryCta(e.target.value)}
                    placeholder="Browse Templates"
                    className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Search Box Placeholder Text</label>
                <input 
                  type="text" 
                  value={searchPlaceholder}
                  onChange={e => setSearchPlaceholder(e.target.value)}
                  placeholder="Search 100+ documents (e.g. rent receipt, NDA...)"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5F5B8] flex items-center gap-4">
              <button 
                onClick={handleSaveHomepage}
                disabled={saving}
                className="px-6 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Homepage Content
                  </>
                )}
              </button>
              {saveSuccess && (
                <span className="text-sm font-bold text-brand-primary">✓ Saved successfully! Updated on frontend.</span>
              )}
            </div>
          </div>
        )}

        {/* ABOUT US CMS */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4">
              <h3 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-primary" />
                About Us Page CMS
              </h3>
              <p className="text-xs text-[#8395A7] mt-1">Manage the narrative story, company mission, vision, and core values displayed on the About page.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Hero title</label>
                <input 
                  type="text" 
                  value={aboutHeroTitle}
                  onChange={e => setAboutHeroTitle(e.target.value)}
                  placeholder="Empowering Everyone with Expert-Grade Agreements"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Hero subtitle</label>
                <input 
                  type="text" 
                  value={aboutHeroSubtitle}
                  onChange={e => setAboutHeroSubtitle(e.target.value)}
                  placeholder="Kartigo Draft is built to democratize high-quality drafting through AI."
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Our Narrative / Story Description</label>
                <textarea 
                  rows={4}
                  value={ourStory}
                  onChange={e => setOurStory(e.target.value)}
                  placeholder="Founded in 2024, AKYIN Ventures set out to build..."
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-brand-primary" />
                    Company Mission
                  </label>
                  <textarea 
                    rows={3}
                    value={mission}
                    onChange={e => setMission(e.target.value)}
                    placeholder="To eliminate drafting barriers, saving time and money..."
                    className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-brand-primary" />
                    Company Vision
                  </label>
                  <textarea 
                    rows={3}
                    value={vision}
                    onChange={e => setVision(e.target.value)}
                    placeholder="A world where secure, legally sound paperwork is generated..."
                    className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary resize-none"
                  />
                </div>
              </div>

              {/* Core Values Section */}
              <div className="border border-[#E5F5B8] rounded-2xl p-5 bg-[#F1FEC8]/10 space-y-4">
                <h4 className="text-sm font-bold text-[#3C1A47] font-display">Core Values Configuration (3 Main Pillars)</h4>
                
                <div className="space-y-4 divide-y divide-[#E5F5B8]/40">
                  {/* Value 1 */}
                  <div className="space-y-2 pt-2 first:pt-0">
                    <span className="text-xs font-bold text-brand-primary font-mono">Pillar 1: Trust & Integrity</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={val1Title}
                        onChange={e => setVal1Title(e.target.value)}
                        placeholder="Title (e.g. Rigorous Precision)"
                        className="bg-white border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs text-[#3C1A47] focus:border-brand-primary"
                      />
                      <input 
                        type="text" 
                        value={val1Desc}
                        onChange={e => setVal1Desc(e.target.value)}
                        placeholder="Short description..."
                        className="md:col-span-2 bg-white border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs text-[#3C1A47] focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  {/* Value 2 */}
                  <div className="space-y-2 pt-4">
                    <span className="text-xs font-bold text-brand-primary font-mono">Pillar 2: Simplification</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={val2Title}
                        onChange={e => setVal2Title(e.target.value)}
                        placeholder="Title (e.g. Empathetic Design)"
                        className="bg-white border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs text-[#3C1A47] focus:border-brand-primary"
                      />
                      <input 
                        type="text" 
                        value={val2Desc}
                        onChange={e => setVal2Desc(e.target.value)}
                        placeholder="Short description..."
                        className="md:col-span-2 bg-white border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs text-[#3C1A47] focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  {/* Value 3 */}
                  <div className="space-y-2 pt-4">
                    <span className="text-xs font-bold text-brand-primary font-mono">Pillar 3: Data Security</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={val3Title}
                        onChange={e => setVal3Title(e.target.value)}
                        placeholder="Title (e.g. Ironclad Security)"
                        className="bg-white border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs text-[#3C1A47] focus:border-brand-primary"
                      />
                      <input 
                        type="text" 
                        value={val3Desc}
                        onChange={e => setVal3Desc(e.target.value)}
                        placeholder="Short description..."
                        className="md:col-span-2 bg-white border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-xs text-[#3C1A47] focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5F5B8] flex items-center gap-4">
              <button 
                onClick={handleSaveAbout}
                disabled={saving}
                className="px-6 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save About Page Content
                  </>
                )}
              </button>
              {saveSuccess && (
                <span className="text-sm font-bold text-brand-primary">✓ Saved! Changes synchronized across the public page.</span>
              )}
            </div>
          </div>
        )}

        {/* CONTACT SETTINGS CMS */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4">
              <h3 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-primary" />
                Contact Settings
              </h3>
              <p className="text-xs text-[#8395A7] mt-1">Configure contact channels, physical coordinates, and business operational hours.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-brand-primary" />
                  Support Email Address
                </label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="support@kartigo.online"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-brand-primary" />
                  Support Telephone / Mobile
                </label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-brand-primary" />
                  WhatsApp Direct Business Number
                </label>
                <input 
                  type="text" 
                  value={contactWhatsapp}
                  onChange={e => setContactWhatsapp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-primary" />
                  Business Operational Hours
                </label>
                <input 
                  type="text" 
                  value={contactHours}
                  onChange={e => setContactHours(e.target.value)}
                  placeholder="Mon - Sat: 9:00 AM - 6:00 PM IST"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                  Corporate Address Coordinates
                </label>
                <textarea 
                  rows={3}
                  value={contactAddress}
                  onChange={e => setContactAddress(e.target.value)}
                  placeholder="AKYIN Ventures, Tower B, Level 14, Tech Park, Pune, MH, India"
                  className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2.5 text-[#3C1A47] text-sm focus:outline-hidden focus:border-brand-primary resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5F5B8] flex items-center gap-4">
              <button 
                onClick={handleSaveContact}
                disabled={saving}
                className="px-6 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Contact Settings
                  </>
                )}
              </button>
              {saveSuccess && (
                <span className="text-sm font-bold text-brand-primary">✓ Settings saved and active on Contact views!</span>
              )}
            </div>
          </div>
        )}

        {/* LANDING PAGES (DYNAMIC CAMPAIGNS) */}
        {activeTab === 'landing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-[#3C1A47]">Landing Pages</h3>
                <p className="text-xs text-[#8395A7] mt-1">Manage campaigns, dynamic document SEO index structures, and promotional pages.</p>
              </div>
              <button className="px-4 py-2 bg-[#2B9348] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:bg-[#237a3b] transition-colors cursor-pointer">
                <Plus className="h-4 w-4" /> New Page
              </button>
            </div>
            
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                    <th className="p-4 font-bold">Page Name</th>
                    <th className="p-4 font-bold">Path</th>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5F5B8] text-sm">
                  {[
                    { name: 'Rent Agreement Online Generation', path: '/draft/rent-agreement', type: 'SEO Document', status: 'Active' },
                    { name: 'Non-Disclosure Agreement', path: '/draft/nda', type: 'SEO Document', status: 'Active' },
                    { name: 'About Us', path: '/about', type: 'Standard', status: 'Active' },
                    { name: 'Contact Support', path: '/contact', type: 'Standard', status: 'Active' },
                  ].map((page, i) => (
                    <tr key={i} className="hover:bg-[#F1FEC8]/20 transition-colors">
                      <td className="p-4 text-[#3C1A47] font-bold">{page.name}</td>
                      <td className="p-4 text-[#8395A7] font-mono text-xs">{page.path}</td>
                      <td className="p-4 text-[#8395A7]">{page.type}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                          {page.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-[#2B9348] hover:underline text-xs font-bold cursor-pointer">Configure</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BANNERS */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-[#3C1A47]">Banner Manager</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure global marketing banner overlays, sales tags, and header notices.</p>
              </div>
              <button className="px-4 py-2 bg-[#2B9348] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:bg-[#237a3b] transition-colors cursor-pointer">
                <Plus className="h-4 w-4" /> Add Banner
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-4">
               <div className="border border-[#E5F5B8] rounded-xl p-4 bg-[#F1FEC8]/10 flex justify-between items-center">
                 <div>
                   <h4 className="font-bold text-[#3C1A47] text-sm">Homepage Promo Banner</h4>
                   <p className="text-xs text-[#8395A7] mt-0.5">"Get 20% off all Employment Contracts this week!"</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                    <button className="text-[#3C1A47] hover:underline text-xs font-bold cursor-pointer">Edit</button>
                 </div>
               </div>
               
               <div className="border border-[#E5F5B8] rounded-xl p-4 bg-gray-50 flex justify-between items-center opacity-70">
                 <div>
                   <h4 className="font-bold text-[#3C1A47] text-sm">Urgency Sale Ribbon</h4>
                   <p className="text-xs text-[#8395A7] mt-0.5">"Save ₹200 on customized NDAs with AI summary!"</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">Draft</span>
                    <button className="text-[#3C1A47] hover:underline text-xs font-bold cursor-pointer">Edit</button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* POPUPS */}
        {activeTab === 'popups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-[#3C1A47]">Popups & Exit Intent</h3>
                <p className="text-xs text-[#8395A7] mt-1">Configure exit-intent triggers, lead grab modals, and cookie notices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Exit Intent Offer Modal', status: true, desc: 'Shows 10% discount when mouse leaves top edge.' },
                { name: 'AI Assistant AI Assistant Intro', status: true, desc: 'Greets user after 10 seconds of inactivity.' },
                { name: 'Required Terms Consent', status: true, desc: 'Standard business terms acknowledgment.' },
                { name: 'Festival Offer Overlay', status: false, desc: 'Festive branding decorations and vouchers.' },
              ].map((popup, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#3C1A47] text-sm">{popup.name}</h4>
                      <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${popup.status ? 'bg-[#2B9348]' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${popup.status ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-[#8395A7] mb-4">{popup.desc}</p>
                  </div>
                  <button className="text-xs font-bold text-[#3C1A47] bg-[#F1FEC8]/30 border border-[#E5F5B8] py-2 rounded-lg hover:bg-[#F1FEC8] transition-colors cursor-pointer">
                    Configure Rules
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOCIAL SHARING */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-[#2B9348]" />
                  Social Sharing & Open Graph
                </h3>
                <p className="text-xs text-[#8395A7] mt-1">Enable or disable dynamic quick-sharing integrations across the template pages.</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              {[
                { name: 'Facebook Share Link', enabled: true },
                { name: 'X / Twitter Direct Card', enabled: true },
                { name: 'LinkedIn Professional Post', enabled: true },
                { name: 'WhatsApp Web Quick-Send', enabled: true },
                { name: 'Direct Copy URL Link', enabled: true },
              ].map((network, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[#E5F5B8] bg-[#F1FEC8]/10">
                  <span className="text-sm font-medium text-[#3C1A47]">{network.name}</span>
                  <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${network.enabled ? 'bg-[#3C1A47]' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${network.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
