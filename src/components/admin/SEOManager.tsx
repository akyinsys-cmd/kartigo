import React, { useState, useEffect } from 'react';
import { Search, Save, Globe, Code, Link as LinkIcon, RefreshCw, AlertCircle, CheckCircle2, Activity, Zap, Loader2 } from 'lucide-react';
import { useCMSContext } from '../../context/CMSContext';

export default function SEOManager() {
  const { seoSettings, saveSEOSettings } = useCMSContext();
  const [activeTab, setActiveTab] = useState<'global' | 'dynamic' | 'redirects' | 'sitemap' | 'audit' | 'gsc'>('global');
  
  // State for SEO properties
  const [titlePattern, setTitlePattern] = useState('Kartigo Draft');
  const [metaDescription, setMetaDescription] = useState('Generate legally binding documents, agreements, and contracts in seconds with Kartigo Draft AI.');
  const [ogImageUrl, setOgImageUrl] = useState('https://kartigo.online/og-image.jpg');
  const [categoryTitlePattern, setCategoryTitlePattern] = useState('{Category Name} Templates & Legal Forms | Kartigo Draft');
  const [documentTitlePattern, setDocumentTitlePattern] = useState('Create {Document Name} Online | Kartigo Draft');
  const [documentDescriptionPattern, setDocumentDescriptionPattern] = useState('Generate a customized {Document Name} tailored to {State}. Quick, legally binding, and AI-powered.');
  const [robotsTxt, setRobotsTxt] = useState('User-agent: *\nDisallow: /admin/\nDisallow: /checkout/\nSitemap: https://kartigo.online/sitemap.xml');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when seoSettings loaded from database
  useEffect(() => {
    if (seoSettings) {
      if (seoSettings.titlePattern) setTitlePattern(seoSettings.titlePattern);
      if (seoSettings.metaDescription) setMetaDescription(seoSettings.metaDescription);
      if (seoSettings.ogImageUrl) setOgImageUrl(seoSettings.ogImageUrl);
      if (seoSettings.categoryTitlePattern) setCategoryTitlePattern(seoSettings.categoryTitlePattern);
      if (seoSettings.documentTitlePattern) setDocumentTitlePattern(seoSettings.documentTitlePattern);
      if (seoSettings.documentDescriptionPattern) setDocumentDescriptionPattern(seoSettings.documentDescriptionPattern);
      if (seoSettings.robotsTxt) setRobotsTxt(seoSettings.robotsTxt);
    }
  }, [seoSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveSEOSettings({
        titlePattern,
        metaDescription,
        ogImageUrl,
        categoryTitlePattern,
        documentTitlePattern,
        documentDescriptionPattern,
        robotsTxt
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save SEO settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        {[
          { id: 'global', label: 'Global SEO', icon: Globe },
          { id: 'dynamic', label: 'Dynamic SEO', icon: Zap },
          { id: 'redirects', label: 'Redirect Manager', icon: LinkIcon },
          { id: 'sitemap', label: 'XML Sitemap & Robots', icon: Code },
          { id: 'audit', label: 'SEO Audit', icon: AlertCircle },
          { id: 'gsc', label: 'Search Console', icon: Activity },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
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
      <div className="flex-1 bg-white p-6 md:p-8 rounded-[24px] border border-[#E5F5B8] shadow-sm">
        {activeTab === 'global' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#2B9348]" />
                Global SEO Settings
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure default meta tags, Open Graph, and Twitter card settings for the entire application.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Global Meta Title Pattern</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input 
                    type="text" 
                    value={titlePattern} 
                    onChange={e => setTitlePattern(e.target.value)}
                    className="w-48 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]" 
                  />
                  <span className="text-[#8395A7] font-bold">-</span>
                  <input type="text" value="{Page Title}" disabled className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Global Meta Description</label>
                <textarea 
                  rows={3} 
                  value={metaDescription} 
                  onChange={e => setMetaDescription(e.target.value)}
                  className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348] resize-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Default Open Graph Image URL</label>
                <input 
                  type="text" 
                  value={ogImageUrl} 
                  onChange={e => setOgImageUrl(e.target.value)}
                  className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]" 
                />
              </div>
            </div>
            
            <div className="pt-4 flex items-center gap-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Global Settings
                  </>
                )}
              </button>
              {saveSuccess && (
                <span className="text-sm font-bold text-[#2B9348]">✓ Settings saved!</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dynamic' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#2B9348]" />
                Dynamic SEO Rules
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure how dynamic pages generate their Meta Title, Description, and Structured Data.
              </p>
            </div>
            <div className="space-y-6">
               <div className="border border-[#E5F5B8] rounded-xl p-5 bg-[#F1FEC8]/10">
                 <h4 className="font-bold text-[#3C1A47] text-sm mb-3">Document Category Pages</h4>
                 <div className="space-y-3">
                   <div>
                     <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider block mb-1">Title Pattern</label>
                     <input 
                       type="text" 
                       value={categoryTitlePattern} 
                       onChange={e => setCategoryTitlePattern(e.target.value)}
                       className="w-full bg-white border border-[#E5F5B8] rounded-lg px-3 py-2 text-xs font-mono focus:border-[#2B9348]" 
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider block mb-1">Structured Data (Schema.org)</label>
                     <select className="w-full bg-white border border-[#E5F5B8] rounded-lg px-3 py-2 text-xs font-mono focus:border-[#2B9348]">
                        <option>CollectionPage + ItemList</option>
                        <option>WebPage</option>
                     </select>
                   </div>
                 </div>
               </div>

               <div className="border border-[#E5F5B8] rounded-xl p-5 bg-[#F1FEC8]/10">
                 <h4 className="font-bold text-[#3C1A47] text-sm mb-3">Individual Document Pages</h4>
                 <div className="space-y-3">
                   <div>
                     <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider block mb-1">Title Pattern</label>
                     <input 
                       type="text" 
                       value={documentTitlePattern} 
                       onChange={e => setDocumentTitlePattern(e.target.value)}
                       className="w-full bg-white border border-[#E5F5B8] rounded-lg px-3 py-2 text-xs font-mono focus:border-[#2B9348]" 
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider block mb-1">Description Pattern</label>
                     <input 
                       type="text" 
                       value={documentDescriptionPattern} 
                       onChange={e => setDocumentDescriptionPattern(e.target.value)}
                       className="w-full bg-white border border-[#E5F5B8] rounded-lg px-3 py-2 text-xs font-mono focus:border-[#2B9348]" 
                     />
                   </div>
                 </div>
               </div>
            </div>
            <div className="pt-2 flex items-center gap-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[#3C1A47] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2C1335] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Rules'}
              </button>
              {saveSuccess && (
                <span className="text-sm font-bold text-[#2B9348]">✓ Settings saved!</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4 border-b border-[#E5F5B8] pb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  SEO Audit & Issues
                </h3>
                <p className="text-xs text-[#8395A7] mt-1">Automatically checks for missing meta tags, broken links, and slow pages.</p>
              </div>
              <button className="px-4 py-2 bg-[#2B9348] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 hover:bg-[#237a3b] transition-colors">
                <RefreshCw className="h-3 w-3" /> Run Audit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="border border-red-200 bg-red-50 p-4 rounded-xl">
                 <div className="text-2xl font-bold text-red-700">12</div>
                 <div className="text-xs font-bold text-red-600 mt-1">Missing Meta Descriptions</div>
               </div>
               <div className="border border-amber-200 bg-amber-50 p-4 rounded-xl">
                 <div className="text-2xl font-bold text-amber-700">4</div>
                 <div className="text-xs font-bold text-amber-600 mt-1">Broken Internal Links (404s)</div>
               </div>
               <div className="border border-[#E5F5B8] bg-[#F1FEC8]/30 p-4 rounded-xl">
                 <div className="text-2xl font-bold text-[#2B9348]">98%</div>
                 <div className="text-xs font-bold text-[#3C1A47] mt-1">Pages with Valid Canonical URLs</div>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5F5B8] overflow-hidden">
               <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#F1FEC8]/30 text-[10px] uppercase tracking-wider font-bold text-[#8395A7]">
                    <tr>
                      <th className="p-3">Issue Type</th>
                      <th className="p-3">URL</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5F5B8]">
                    <tr>
                      <td className="p-3 text-red-600 font-bold flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Missing Meta Desc</td>
                      <td className="p-3 text-[#3C1A47] font-mono text-xs">/blog/top-10-legal-mistakes</td>
                      <td className="p-3 text-right"><button className="text-[#2B9348] font-bold text-xs hover:underline">Fix Now</button></td>
                    </tr>
                    <tr>
                      <td className="p-3 text-amber-600 font-bold flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Missing H1 Tag</td>
                      <td className="p-3 text-[#3C1A47] font-mono text-xs">/landing/summer-promo</td>
                      <td className="p-3 text-right"><button className="text-[#2B9348] font-bold text-xs hover:underline">Fix Now</button></td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'gsc' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4 border-b border-[#E5F5B8] pb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#2B9348]" />
                  Google Search Console
                </h3>
                <p className="text-xs text-[#8395A7] mt-1">View index status and organic performance directly from GSC.</p>
              </div>
            </div>

            <div className="bg-white border border-[#E5F5B8] rounded-[20px] p-8 text-center">
              <Activity className="h-12 w-12 text-[#E5F5B8] mx-auto mb-4" />
              <h4 className="text-lg font-bold text-[#3C1A47] mb-2">Connect Search Console</h4>
              <p className="text-sm text-[#8395A7] max-w-md mx-auto mb-6">
                Authorize the Kartigo Draft Admin Panel to read your Google Search Console data via OAuth to display crawl errors, indexed pages, and search performance metrics here.
              </p>
              <button className="px-6 py-2.5 bg-white border border-[#E5F5B8] text-[#3C1A47] rounded-xl text-sm font-bold shadow-sm hover:bg-[#F1FEC8]/30 transition-colors mx-auto flex items-center gap-2">
                 Authenticate with Google
              </button>
            </div>
          </div>
        )}

        {activeTab === 'redirects' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-[#2B9348]" />
                  Redirect Manager
                </h3>
                <p className="text-sm text-[#8395A7] mt-1">Manage 301, 302, and 404 redirects to preserve SEO juice.</p>
              </div>
              <button className="px-4 py-2 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md">
                + Add Redirect
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                  <th className="p-3 font-bold">Old Path</th>
                  <th className="p-3 font-bold">Type</th>
                  <th className="p-3 font-bold">New Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5F5B8] text-sm">
                <tr>
                  <td className="p-3 text-[#3C1A47] font-mono">/old-doc-page</td>
                  <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">301</span></td>
                  <td className="p-3 text-[#3C1A47] font-mono">/documents/new-page</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Code className="h-5 w-5 text-[#2B9348]" />
                Sitemap & Robots.txt
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-[#F1FEC8]/10">
                <div>
                  <div className="font-bold text-[#3C1A47]">XML Sitemap</div>
                  <div className="text-xs text-[#8395A7]">Auto-generates based on active pages, blogs, and documents.</div>
                </div>
                <button className="px-4 py-2 bg-[#2B9348] hover:bg-[#237a3b] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Force Regenerate
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  Robots.txt Content
                  <span title="Use carefully to avoid blocking search engines" className="text-amber-500 cursor-help"><AlertCircle className="h-3 w-3" /></span>
                </label>
                <textarea 
                  rows={6} 
                  value={robotsTxt} 
                  onChange={e => setRobotsTxt(e.target.value)}
                  className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] font-mono focus:outline-hidden focus:border-[#2B9348] resize-y"
                />
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Robots.txt'}
                </button>
                {saveSuccess && (
                  <span className="text-sm font-bold text-[#2B9348]">✓ Settings saved!</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
