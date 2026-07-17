import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Code, FileText, Download, ShoppingBag, FileEdit, User, Settings, 
  HelpCircle, Bell, LogOut, Globe, Clock, Lock, Monitor, AlertCircle, 
  CheckCircle, ArrowRight, Shield, Key, CreditCard, MessageSquare, 
  Sparkles, ExternalLink, ChevronRight, Trash2, ChevronDown, Eye, 
  RefreshCw, Star, LayoutDashboard, Search, MapPin, X, History, Share2, Filter, RotateCcw
} from 'lucide-react';
import { AppRole, UserProfile } from '../types';
import { formatIndianDate } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './CustomerWorkspacePlaceholders';
import LocationSelector from './LocationSelector';
import BusinessProfile from './BusinessProfile';
import PricingSection from './PricingSection';

import DocumentAgent from './DocumentAgent';
import DocumentEditor from './DocumentEditor';
import Breadcrumbs from './Breadcrumbs';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';

import MyDocumentsView from './MyDocumentsView';
import NotificationsView from './NotificationsView';
import HelpCenterView from './HelpCenterView';
import UserSecuritySettings from './UserSecuritySettings';
import UserDeveloperPortal from './UserDeveloperPortal';
import { 
  DraftsView, DownloadsView, OrdersView, 
  FavoritesView, SharedView, HistoryView 
} from './CustomerWorkspacePlaceholders';
import { VersionsView } from './VersionsView';
import { 
  DraftsIllustration, PurchasedDocsIllustration, ReportsIllustration, CategoryLegalIllustration 
} from './Illustrations';

interface DashboardViewProps {
  onBrowseDocuments: () => void;
  activeTab?: 'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future' | 'help' | 'documents' | 'favorites' | 'downloads' | 'orders' | 'drafts' | 'shared' | 'history' | 'pricing' | 'versions';
  setActiveTab?: (tab: 'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future' | 'help' | 'documents' | 'favorites' | 'downloads' | 'orders' | 'drafts' | 'shared' | 'history' | 'pricing' | 'versions') => void;
}

export default function DashboardView({ 
  onBrowseDocuments,
  activeTab: externalTab,
  setActiveTab: setExternalTab
}: DashboardViewProps) {
  const { 
    user, profile, sessions, notifications, logout, logoutEverywhere,
    updateProfileData, setDefaultLocation, updateBusinessProfile, changePassword,
    clearNotification, addMockNotification
  } = useAuth();

  const [internalTab, setInternalTab] = useState<'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future' | 'help' | 'documents' | 'favorites' | 'downloads' | 'orders' | 'drafts' | 'shared' | 'history' | 'pricing' | 'versions'>('overview');
  
  const activeTab = externalTab || internalTab;
  const setActiveTab = setExternalTab || setInternalTab;

  // Document state management
  const [activeDoc, setActiveDoc] = useState<{ id: string; content: string; title: string; documentType: string } | null>(null);
  const [myDocuments, setMyDocuments] = useState<any[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  // Firestore Sub-Collections for global search & counters
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [downloadsList, setDownloadsList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);

  // Instant Search Engine states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic time-based greeting state
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const updateGreeting = () => {
      const hr = new Date().getHours();
      if (hr >= 5 && hr < 12) setGreeting('Good morning');
      else if (hr >= 12 && hr < 17) setGreeting('Good afternoon');
      else if (hr >= 17 && hr < 21) setGreeting('Good evening');
      else setGreeting('Working late');
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent searches from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('kartigo_recent_searches') || '[]');
    setRecentSearches(history);
  }, []);

  // Fetch collections for counters & search index
  useEffect(() => {
    if (!user) return;

    // Documents
    const qDocs = query(collection(db, 'users', user.uid, 'documents'), orderBy('createdAt', 'desc'));
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      setMyDocuments(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        updatedAt: d.data().updatedAt?.toDate() || new Date()
      })));
    });

    // Drafts
    const qDrafts = query(collection(db, 'users', user.uid, 'drafts'), orderBy('updatedAt', 'desc'));
    const unsubDrafts = onSnapshot(qDrafts, (snap) => {
      setDraftsList(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        updatedAt: d.data().updatedAt?.toDate() || new Date()
      })));
    });

    // Orders
    const qOrders = query(collection(db, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrdersList(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date()
      })));
    });

    // Downloads
    const qDls = query(collection(db, 'users', user.uid, 'downloads'), orderBy('downloadedAt', 'desc'));
    const unsubDls = onSnapshot(qDls, (snap) => {
      setDownloadsList(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        downloadedAt: d.data().downloadedAt?.toDate() || new Date()
      })));
    });

    // Tickets
    const qTkts = query(collection(db, 'users', user.uid, 'tickets'), orderBy('createdAt', 'desc'));
    const unsubTkts = onSnapshot(qTkts, (snap) => {
      setTicketsList(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date()
      })));
    });

    return () => {
      unsubDocs();
      unsubDrafts();
      unsubOrders();
      unsubDls();
      unsubTkts();
    };
  }, [user]);

  // Click outside search auto-complete dropdown closer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (queryStr: string) => {
    if (!queryStr.trim()) return;
    const cleanQuery = queryStr.trim();
    setSearchQuery(cleanQuery);
    
    // Save to history
    const updated = [cleanQuery, ...recentSearches.filter(s => s !== cleanQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kartigo_recent_searches', JSON.stringify(updated));
    setShowSearchResults(true);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('kartigo_recent_searches');
  };

  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this generated document?")) return;

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'documents', docId));
        await addMockNotification("Document Deleted", "The selected legal document was removed from your secure cloud storage.", "info");
      } catch (err) {
        console.error("Failed to delete document", err);
      }
    }
  };

  // State-Based Business Recommendations Engine
  const getJurisdictionRecommendations = () => {
    const stateName = profile?.defaultLocation?.state || profile?.state || '';
    
    if (stateName.toLowerCase().includes('karnataka')) {
      return [
        { title: 'Karnataka House Rental Agreement', type: 'Residential Lease', desc: 'Indiranagar / Koramangala specific stamp duty pre-optimized template.' },
        { title: 'Commercial Lease (Bangalore Tech Parks)', type: 'Commercial Lease', desc: 'Pre-formatted for BBMP limits and high-density office compliance.' },
        { title: 'Startup Founder Shareholder Agreement', type: 'Corporate Agreement', desc: 'Standard VC-vetted clauses for Bangalore startup corridors.' }
      ];
    } else if (stateName.toLowerCase().includes('maharashtra')) {
      return [
        { title: 'Mumbai Leave & License Agreement', type: 'Residential Lease', desc: 'Optimized according to Maharashtra Rent Control Act, 1999.' },
        { title: 'Bespoke Pune Partnership Deed', type: 'Partnership', desc: 'Optimized for local sub-registrar registration requirements.' },
        { title: 'Standard Indemnity Bond (Stamp Act)', type: 'Indemnity', desc: 'Pre-optimized for Mumbai jurisdiction compliance.' }
      ];
    } else if (stateName.toLowerCase().includes('delhi')) {
      return [
        { title: 'Delhi Residential Lease Deed', type: 'Residential Lease', desc: 'Vetted under the Delhi Rent Control regulations.' },
        { title: 'Executive Service Master Agreement', type: 'Service Level Agreement', desc: 'Standard business terms with New Delhi arbitration venue.' },
        { title: 'Bilingual Hindi/English Rent Agreement', type: 'Lease Agreement', desc: 'Common dual-tongue layout used in NCT boundaries.' }
      ];
    } else {
      return [
        { title: 'Mutual Non-Disclosure Agreement (NDA)', type: 'Confidentiality', desc: 'Professional Indian jurisdiction-neutral business agreement.' },
        { title: 'Employment Contract & Offer Covenants', type: 'HR/Employment', desc: 'Clean, modern terms covering IP assignment and non-competes.' },
        { title: 'Indian Consultancy Service Deed', type: 'Service Level Agreement', desc: 'Vetted independent contractor covenants and payment parameters.' }
      ];
    }
  };

  const recommendations = getJurisdictionRecommendations();

  // Integrated Global Search Index Compiler
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const term = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search Documents
    myDocuments.forEach(doc => {
      const dateStr = doc.createdAt ? formatIndianDate(doc.createdAt).toLowerCase() : '';
      const status = 'completed';
      if (
        doc.title.toLowerCase().includes(term) || 
        doc.documentType.toLowerCase().includes(term) ||
        dateStr.includes(term) ||
        status.includes(term)
      ) {
        results.push({ id: doc.id, title: doc.title, category: 'Completed Document', icon: FileText, action: () => {
          setActiveDoc({ id: doc.id, content: doc.content, title: doc.title, documentType: doc.documentType });
          setShowSearchResults(false);
          setSearchQuery('');
        }});
      }
    });

    // Search Drafts
    draftsList.forEach(dr => {
      const dateStr = dr.updatedAt ? formatIndianDate(dr.updatedAt).toLowerCase() : '';
      const status = 'draft pending';
      if (
        dr.documentType?.toLowerCase().includes(term) || 
        dr.promptContext?.toLowerCase().includes(term) ||
        dateStr.includes(term) ||
        status.includes(term)
      ) {
        results.push({ id: dr.id, title: `Drafting: ${dr.documentType}`, category: 'In-Progress Draft', icon: FileEdit, action: () => {
          setActiveTab('drafts');
          setShowSearchResults(false);
          setSearchQuery('');
        }});
      }
    });

    // Search Orders
    ordersList.forEach(ord => {
      const dateStr = ord.createdAt ? formatIndianDate(ord.createdAt).toLowerCase() : '';
      const status = 'order purchased invoice';
      if (
        ord.invoiceId?.toLowerCase().includes(term) || 
        ord.tier?.toLowerCase().includes(term) ||
        dateStr.includes(term) ||
        status.includes(term)
      ) {
        results.push({ id: ord.id, title: `Order ${ord.invoiceId} (${ord.tier} Tier)`, category: 'Order Invoice', icon: ShoppingBag, action: () => {
          setActiveTab('orders');
          setShowSearchResults(false);
          setSearchQuery('');
        }});
      }
    });

    // Search Downloads
    downloadsList.forEach(dl => {
      const dateStr = dl.downloadedAt ? formatIndianDate(dl.downloadedAt).toLowerCase() : '';
      const status = 'download unwatermarked';
      if (
        dl.title.toLowerCase().includes(term) || 
        dl.documentType.toLowerCase().includes(term) ||
        dateStr.includes(term) ||
        status.includes(term)
      ) {
        results.push({ id: dl.id, title: `Unwatermarked: ${dl.title}`, category: 'Purchase Download', icon: Download, action: () => {
          setActiveTab('downloads');
          setShowSearchResults(false);
          setSearchQuery('');
        }});
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  // Profile update form states
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [state, setState] = useState(profile?.state || 'Maharashtra');
  const [language, setLanguage] = useState(profile?.language || 'English');
  const [timeZone, setTimeZone] = useState(profile?.timeZone || 'Asia/Kolkata');
  const [profilePicture, setProfilePicture] = useState(profile?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80');

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState('');

  // Profile update feedback
  const [profileSuccess, setProfileSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    try {
      await updateProfileData({
        firstName, lastName, phone, state, language, timeZone, profilePicture
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    if (!newPassword) {
      setPassError('Password field is empty.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }

    setPassLoading('updating');
    try {
      await changePassword(newPassword);
      setPassSuccess('Password updated securely on Firebase Auth!');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Error updating password.');
    } finally {
      setPassLoading('');
    }
  };

  if (activeDoc) {
    return (
      <div className="bg-[#F1FEC8] min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-12 text-left">
        <div className="max-w-7xl mx-auto">
          <DocumentEditor
            documentId={activeDoc.id}
            initialContent={activeDoc.content}
            documentType={activeDoc.documentType}
            initialTitle={activeDoc.title}
            userId={user?.uid}
            onClose={() => setActiveDoc(null)}
          />
        </div>
      </div>
    );
  }

  // Memoized Search Results list
  const searchResultsList = useMemo(() => {
    if (searchResults.length === 0) {
      return (
        <p className="text-xs text-text-light py-4 text-center font-bold">
          {searchQuery.trim() ? "No matched indices found. Try simpler query terms." : "Start typing to index matching results instantly."}
        </p>
      );
    }

    return (
      <div className="space-y-1.5">
        {searchResults.map((res) => {
          const Icon = res.icon;
          return (
            <button
              key={res.id}
              onClick={res.action}
              className="w-full flex items-center justify-between p-2.5 hover:bg-vanilla-secondary/40 rounded-xl transition-all cursor-pointer text-left border border-transparent hover:border-vanilla-main/60"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 text-brand-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-black text-brand-secondary line-clamp-1">{res.title}</span>
                  <span className="block text-[9px] text-text-light font-mono mt-0.5">{res.category}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-text-light" />
            </button>
          );
        })}
      </div>
    );
  }, [searchResults, searchQuery]);

  // Memoized Metrics Grid
  const metricsGrid = useMemo(() => (
    <div id="metrics-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-left">
      <div className="bg-white p-4.5 rounded-[20px] border border-vanilla-main shadow-sm flex items-center gap-3 hover:border-brand-primary/20 transition-all">
        <div className="w-10 h-10 shrink-0">
          <CategoryLegalIllustration />
        </div>
        <div>
          <span className="block text-lg font-black text-[#3C1A47] leading-tight">{myDocuments.length}</span>
          <span className="block text-[9px] font-bold text-text-light uppercase tracking-wider font-mono">My Documents</span>
        </div>
      </div>

      <div className="bg-white p-4.5 rounded-[20px] border border-vanilla-main shadow-sm flex items-center gap-3 hover:border-brand-primary/20 transition-all">
        <div className="w-10 h-10 shrink-0">
          <DraftsIllustration />
        </div>
        <div>
          <span className="block text-lg font-black text-[#3C1A47] leading-tight">{draftsList.length}</span>
          <span className="block text-[9px] font-bold text-text-light uppercase tracking-wider font-mono">Active Drafts</span>
        </div>
      </div>

      <div className="bg-white p-4.5 rounded-[20px] border border-vanilla-main shadow-sm flex items-center gap-3 hover:border-brand-primary/20 transition-all">
        <div className="w-10 h-10 shrink-0">
          <PurchasedDocsIllustration />
        </div>
        <div>
          <span className="block text-lg font-black text-[#3C1A47] leading-tight">{ordersList.length}</span>
          <span className="block text-[9px] font-bold text-text-light uppercase tracking-wider font-mono">Completed Orders</span>
        </div>
      </div>

      <div className="bg-white p-4.5 rounded-[20px] border border-vanilla-main shadow-sm flex items-center gap-3 hover:border-brand-primary/20 transition-all">
        <div className="w-10 h-10 shrink-0">
          <ReportsIllustration />
        </div>
        <div>
          <span className="block text-lg font-black text-[#3C1A47] leading-tight">
            {ticketsList.filter(t => t.status === 'Open' || t.status === 'Replied').length}
          </span>
          <span className="block text-[9px] font-bold text-text-light uppercase tracking-wider font-mono">Active Tickets</span>
        </div>
      </div>
    </div>
  ), [myDocuments.length, draftsList.length, ordersList.length, ticketsList]);

  // ... Add getting tab label logic
  const getTabLabel = (tab: string) => {
    const map: Record<string, string> = {
      overview: 'Overview',
      documents: 'My Documents',
      agent: 'AI Assistant',
      drafts: 'Drafts',
      downloads: 'Downloads',
      orders: 'Orders',
      favorites: 'Favorites',
      shared: 'Shared',
      history: 'History',
      versions: 'Versions',
      pricing: 'Pricing & Plans',
      notifications: 'Notifications',
      profile: 'Business Profile',
      security: 'Account Security',
      help: 'Help Center',
    };
    return map[tab] || 'Dashboard';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-6 relative">
      
      {/* Global Interactive Search Input Box in Workspace Top Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-20">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <div id="dashboard-sidebar" className="hidden lg:block lg:col-span-3 bg-white border border-vanilla-main rounded-[20px] p-5 card-shadow space-y-6 lg:sticky lg:top-8 text-left">
          
          {/* User Profile Mini Card */}
          <div className="flex items-center gap-3 pb-5 border-b border-vanilla-main">
            <img 
              id="dashboard-sidebar-avatar"
              src={profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'} 
              alt="Avatar" 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-primary/10"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-brand-secondary font-display leading-tight">
                {profile?.firstName || 'Valued'} {profile?.lastName || 'Client'}
              </span>
              <span className="text-[9px] font-bold text-text-light uppercase tracking-widest font-mono mt-0.5">
                Role: <span className="text-brand-primary">{profile?.role || 'Corporate Client'}</span>
              </span>
            </div>
          </div>

          {/* Default Location Box */}
          <div className="pb-5 border-b border-vanilla-main text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">Default Jurisdiction</span>
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center px-2"
              >
                [Edit]
              </button>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 bg-brand-primary/10 rounded flex items-center justify-center shrink-0 text-brand-primary mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="text-xs font-bold text-brand-secondary leading-snug whitespace-pre-line">
                {profile?.defaultLocation?.state ? `${profile.defaultLocation.state}` : profile?.state || 'Not Set'}
                {profile?.defaultLocation?.district ? `\n→ ${profile.defaultLocation.district}` : ''}
              </div>
            </div>
          </div>

          {/* Custom Navigation Menu items optimized for customers */}
          <nav className="flex flex-col gap-1.5 text-left h-[450px] overflow-y-auto pr-2 custom-scrollbar relative">
            {[
              { id: 'overview', name: 'Workspace Overview', icon: LayoutDashboard },
              { id: 'agent', name: 'Conversational Draft', icon: Sparkles, iconColor: 'text-brand-primary' },
              { id: 'documents', name: 'My Documents', icon: FileText },
              { id: 'drafts', name: 'Drafts & Auto-Saves', icon: FileEdit, count: draftsList.length },
              { id: 'downloads', name: 'Download Center', icon: Download },
              { id: 'orders', name: 'Orders & Invoices', icon: ShoppingBag },
              { id: 'favorites', name: 'Starred Favorites', icon: Star, iconColor: 'text-amber-500' },
              { id: 'shared', name: 'Public Sharing Center', icon: Share2 },
              { id: 'history', name: 'Chronological History', icon: History },
              { id: 'versions', name: 'Iteration Vault', icon: RotateCcw },
              { id: 'pricing', name: 'Pricing Plans', icon: CreditCard },
              { id: 'profile', name: 'Business Profile', icon: User },
              { id: 'security', name: 'Account Security', icon: Settings },
              { id: 'help', name: 'Support Help Desk', icon: HelpCircle, pulse: ticketsList.filter(t => t.status === 'Replied').length > 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  id={`sidebar-tab-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-hidden cursor-pointer relative overflow-hidden ${
                    isActive 
                      ? 'text-brand-primary pl-4' 
                      : 'text-text-secondary hover:text-brand-secondary hover:bg-vanilla-secondary/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-brand-primary/5 border-l-4 border-brand-primary rounded-xl z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-2.5 w-full">
                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="shrink-0"
                    >
                      <Icon className={`h-4 w-4 ${tab.iconColor || ''}`} />
                    </motion.div>
                    <span className="truncate">{tab.name}</span>
                    
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 bg-brand-primary text-[#F1FEC8] rounded-full text-[9px] font-black relative z-10">
                        {tab.count}
                      </span>
                    )}
                    {tab.pulse && (
                      <span className="ml-auto h-2 w-2 bg-brand-primary rounded-full animate-pulse relative z-10" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-vanilla-main">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-text-secondary hover:text-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer border border-vanilla-main/60 bg-vanilla-secondary/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Secure Sign Out</span>
            </button>
          </div>

        </div>

        {/* WORKSPACE DETAIL AREA */}
        <div id="dashboard-detail-area" className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* Mobile Navigation Tabs (Horizontally Scrollable) */}
          <div className="lg:hidden flex overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 gap-2 scroll-smooth snap-x snap-mandatory relative">
            {[
              { id: 'overview', name: 'Overview', icon: LayoutDashboard },
              { id: 'agent', name: 'Draft', icon: Sparkles },
              { id: 'documents', name: 'My Docs', icon: FileText },
              { id: 'drafts', name: 'Drafts', icon: FileEdit },
              { id: 'downloads', name: 'Downloads', icon: Download },
              { id: 'orders', name: 'Orders', icon: ShoppingBag },
              { id: 'favorites', name: 'Starred', icon: Star },
              { id: 'shared', name: 'Shared', icon: Share2 },
              { id: 'versions', name: 'Versions', icon: Clock },
              { id: 'history', name: 'History', icon: History },
              { id: 'profile', name: 'Profile', icon: User },
              { id: 'security', name: 'Security', icon: Settings },
              { id: 'help', name: 'Support', icon: HelpCircle }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap snap-start transition-colors cursor-pointer relative overflow-hidden ${
                    isActive 
                      ? 'text-white' 
                      : 'bg-white border border-vanilla-main text-text-secondary'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTabBackground"
                      className="absolute inset-0 bg-brand-primary shadow-md shadow-brand-primary/20 z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tab.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.name}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          {/* Header Search Engine widget */}
          <div id="dashboard-search-container" ref={searchRef} className="relative z-50">
            <div className="bg-white border border-vanilla-main rounded-2xl p-3 shadow-xs flex items-center gap-3">
              <Search className="h-5 w-5 text-text-light shrink-0" />
              <input
                type="text"
                placeholder="Instant Search across documents, drafts, orders, or download center..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                className="flex-1 bg-transparent border-0 focus:outline-hidden focus:ring-0 text-xs font-bold text-brand-secondary placeholder-text-light/80"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-vanilla-secondary rounded-lg">
                  <X className="h-4 w-4 text-text-light" />
                </button>
              )}
              <button
                onClick={() => handleSearchSubmit(searchQuery)}
                className="px-4 py-2 bg-[#3C1A47] text-[#F1FEC8] rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-95 cursor-pointer shadow-xs"
              >
                Query Search
              </button>
            </div>

            {/* Instant Search Results Autocomplete Dropdown Panel */}
            <AnimatePresence>
              {showSearchResults && (searchQuery.trim() || recentSearches.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-vanilla-main rounded-2xl shadow-xl z-[100] max-h-96 overflow-y-auto p-4 space-y-4 text-left"
                >
                  {/* Recent Searches Tracker */}
                  {recentSearches.length > 0 && (
                    <div className="pb-3 border-b border-vanilla-main/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black font-mono text-text-light uppercase tracking-wider">Recent Searches</span>
                        <button onClick={handleClearRecentSearches} className="text-[9px] font-bold text-brand-primary hover:underline">Clear History</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(term);
                              handleSearchSubmit(term);
                            }}
                            className="inline-flex items-center gap-1 bg-vanilla-secondary px-2.5 py-1 rounded-lg text-[10px] text-brand-secondary hover:bg-[#3C1A47] hover:text-[#F1FEC8] transition-all cursor-pointer font-bold"
                          >
                            <History className="h-3 w-3" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results Display */}
                  <div>
                    <h4 className="text-[10px] font-black font-mono text-[#3C1A47] uppercase tracking-wider mb-2.5">
                      Search Results ({searchResults.length})
                    </h4>
                    {searchResultsList}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white border border-vanilla-main rounded-[20px] p-6 sm:p-8 card-shadow text-left min-h-[600px]">
            <div className="mb-6">
              <Breadcrumbs 
                onBackHome={() => {
                  // Simply redirect to home if outside router context or handled by parent
                  window.location.hash = '';
                  window.location.pathname = '/';
                }}
                items={[
                  { label: 'Dashboard', onClick: () => setActiveTab('overview'), isActive: activeTab === 'overview' },
                  ...(activeTab !== 'overview' ? [{ label: getTabLabel(activeTab), isActive: true }] : [])
                ]} 
              />
            </div>
            <AnimatePresence mode="wait">
              
              {/* TAB: AGENT */}
              {activeTab === 'agent' && (
                <motion.div
                  key="agent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-left"
                >
                  <DocumentAgent 
                    onOpenEditor={(docId, content, title, documentType) => {
                      setActiveDoc({ id: docId, content, title, documentType });
                    }}
                  />
                </motion.div>
              )}

              {/* TAB: DOCUMENTS */}
              {activeTab === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MyDocumentsView 
                    documents={myDocuments}
                    onOpenDoc={(doc) => setActiveDoc({ id: doc.id, content: doc.content, title: doc.title, documentType: doc.documentType })}
                    onDeleteDoc={handleDeleteDoc}
                    onCreateNew={onBrowseDocuments}
                  />
                </motion.div>
              )}

              {/* TAB: OVERVIEW (REDESIGNED COMPREHENSIVE LANDING SHELL) */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 text-left"
                >
                  {/* Dynamic welcome banner matching hours & location */}
                  <div className="bg-gradient-to-br from-vanilla-secondary/40 to-white border border-vanilla-main rounded-[28px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="text-left">
                      <span className="text-[10px] font-black font-mono text-brand-primary uppercase tracking-widest">{greeting} IST</span>
                      <h2 className="text-2xl font-black font-display tracking-tight text-brand-secondary mt-1">
                        Greetings, {profile?.firstName || 'Valued Client'}!
                      </h2>
                      <p className="text-xs text-text-light mt-1 font-semibold leading-relaxed max-w-lg">
                        All files are secured with professional 256-bit encryption. Pre-fill profile variables are set to Indian standard Stamp Duty Act standards.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('agent')}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#F1FEC8] bg-[#3C1A47] hover:bg-brand-primary hover:text-white px-5 py-3.5 rounded-xl transition-all card-shadow cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Start Conversational Draft</span>
                    </button>
                  </div>

                  {/* Active Workspace Metrics Rows */}
                  {metricsGrid}

                  {/* Pre-fill default status panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F1FEC8] p-5 rounded-[20px] border border-brand-primary/10 shadow-xs flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-[#3C1A47]/60 uppercase tracking-widest font-mono">Active Jurisdiction State</span>
                          <span className="block text-xs font-black text-brand-secondary">
                            {profile?.defaultLocation ? `${profile.defaultLocation.city}, ${profile.defaultLocation.state}` : 'Not Configured'}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsLocationModalOpen(true)}
                        className="text-[10px] font-black text-brand-primary bg-white border border-brand-primary/20 px-3 py-1.5 rounded-lg hover:bg-brand-primary/5 transition-colors cursor-pointer"
                      >
                        {profile?.defaultLocation ? 'Change' : 'Set Jurisdiction'}
                      </button>
                    </div>

                    <div className="bg-[#3C1A47]/5 p-5 rounded-[20px] border border-[#3C1A47]/10 shadow-xs flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#3C1A47]/10 rounded-full flex items-center justify-center text-[#3C1A47]">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-[#3C1A47]/60 uppercase tracking-widest font-mono">Corporate Identity Profile</span>
                          <span className="block text-xs font-black text-brand-secondary">
                            {profile?.businessProfile ? profile.businessProfile.companyName : 'Incomplete Profile'}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsBusinessModalOpen(true)}
                        className="text-[10px] font-black text-[#3C1A47] bg-white border border-[#3C1A47]/20 px-3 py-1.5 rounded-lg hover:bg-[#3C1A47]/5 transition-colors cursor-pointer"
                      >
                        {profile?.businessProfile ? 'Manage Profile' : 'Configure pre-fills'}
                      </button>
                    </div>
                  </div>

                  {/* Business Recommendations tailored deck */}
                  <div className="p-5 border border-vanilla-main rounded-[24px] bg-vanilla-secondary/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-brand-secondary mb-3 font-mono flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-brand-primary animate-pulse" /> Recommended Documents for {profile?.defaultLocation?.state || profile?.state || 'India'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-vanilla-main hover:border-brand-primary/30 transition-all flex flex-col justify-between">
                          <div className="text-left">
                            <span className="text-[8px] font-black font-mono text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">{rec.type}</span>
                            <h4 className="text-xs font-black text-brand-secondary mt-2">{rec.title}</h4>
                            <p className="text-[10px] text-text-light mt-1 font-medium leading-relaxed">{rec.desc}</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab('agent');
                            }}
                            className="mt-4 text-left text-[10px] font-black text-brand-primary flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <span>Draft Draft with AI Assistant</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Panel */}
                  <div>
                    <h3 className="text-sm font-black text-brand-secondary font-display flex items-center gap-1.5 mb-3">
                      <Sparkles className="h-4.5 w-4.5 text-brand-primary" /> Rapid Action Panels
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <button onClick={() => setActiveTab('agent')} className="flex flex-col items-center justify-center gap-2 bg-white border border-vanilla-main hover:border-brand-primary hover:bg-brand-primary/5 p-4 rounded-2xl transition-all cursor-pointer group">
                        <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-brand-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-secondary text-center">Start Drafting</span>
                      </button>

                      <button onClick={onBrowseDocuments} className="flex flex-col items-center justify-center gap-2 bg-white border border-vanilla-main hover:border-brand-primary hover:bg-brand-primary/5 p-4 rounded-2xl transition-all cursor-pointer group">
                        <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-brand-primary">
                          <Search className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-secondary text-center">Browse templates</span>
                      </button>

                      <button onClick={() => setActiveTab('drafts')} className="flex flex-col items-center justify-center gap-2 bg-white border border-vanilla-main hover:border-brand-primary hover:bg-brand-primary/5 p-4 rounded-2xl transition-all cursor-pointer group">
                        <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-brand-primary">
                          <FileEdit className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-secondary text-center">Saved Drafts</span>
                      </button>

                      <button onClick={() => setActiveTab('downloads')} className="flex flex-col items-center justify-center gap-2 bg-white border border-vanilla-main hover:border-brand-primary hover:bg-brand-primary/5 p-4 rounded-2xl transition-all cursor-pointer group">
                        <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-brand-primary">
                          <Download className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-secondary text-center">Downloads</span>
                      </button>

                      <button onClick={() => setActiveTab('help')} className="flex flex-col items-center justify-center gap-2 bg-white border border-vanilla-main hover:border-brand-primary hover:bg-brand-primary/5 p-4 rounded-2xl transition-all cursor-pointer group">
                        <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-brand-primary">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-secondary text-center">Secure Tickets</span>
                      </button>

                      <a 
                        href="https://wa.me/918073589439?text=Hi%20Kartigo%2C%20I%20need%20assistance%20on%20my%20recent%20legal%20draft."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-2 bg-white border border-vanilla-main hover:border-green-500 hover:bg-green-50/20 p-4 rounded-2xl transition-all cursor-pointer group text-center"
                      >
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-green-600">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-secondary text-center">WhatsApp Chat</span>
                      </a>
                    </div>
                  </div>

                  {/* Recent Documents Feed */}
                  <div className="bg-white border border-vanilla-main rounded-[24px] p-5 shadow-sm text-left mt-6">
                    <div className="flex items-center justify-between pb-4 border-b border-vanilla-main mb-4">
                      <h3 className="text-sm font-black text-brand-secondary font-display flex items-center gap-1.5">
                        <FileText className="h-4.5 w-4.5 text-brand-primary" />
                        Recent Finalized Documents ({myDocuments.length})
                      </h3>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="text-[11px] font-black text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View All <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {myDocuments.length === 0 ? (
                      <EmptyState 
                        icon={FileText} 
                        title="No Recent Documents" 
                        description="You don't have any recent documents. Create a new document to get started." 
                        actionText="Create Document" 
                        onAction={onBrowseDocuments} 
                      />
                    ) : (
                      <div className="divide-y divide-vanilla-main/60 overflow-hidden">
                        {myDocuments.slice(0, 3).map((doc) => (
                          <div
                            key={doc.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-vanilla-secondary/20 -mx-4 px-4 rounded-xl transition-all cursor-pointer text-left"
                            onClick={() => setActiveDoc({ id: doc.id, content: doc.content, title: doc.title, documentType: doc.documentType })}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-9 w-9 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0 text-brand-primary">
                                <FileText className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0 text-left">
                                <span className="block text-xs font-black text-brand-secondary group-hover:text-brand-primary transition-colors truncate">
                                  {doc.title}
                                </span>
                                <span className="block text-[10px] text-text-light font-mono mt-0.5">
                                  {doc.documentType} • Created: {formatIndianDate(doc.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDoc({ id: doc.id, content: doc.content, title: doc.title, documentType: doc.documentType });
                                }}
                                className="p-1.5 text-text-light hover:text-brand-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-vanilla-main shadow-xs"
                                title="Open in Writer Editor"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteDoc(doc.id, e)}
                                className="p-1.5 text-text-light hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-vanilla-main shadow-xs"
                                title="Delete Document"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB: DRAFTS */}
              {activeTab === 'drafts' && (
                <motion.div
                  key="drafts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <DraftsView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: DOWNLOADS */}
              {activeTab === 'downloads' && (
                <motion.div
                  key="downloads"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <DownloadsView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: ORDERS */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <OrdersView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: FAVORITES */}
              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FavoritesView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: SHARED */}
              {activeTab === 'shared' && (
                <motion.div
                  key="shared"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SharedView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <HistoryView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: ITERATION VAULT (VERSIONS) */}
              {activeTab === 'versions' && (
                <motion.div
                  key="versions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <VersionsView onCreateNew={onBrowseDocuments} />
                </motion.div>
              )}

              {/* TAB: PRICING */}
              {activeTab === 'pricing' && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-black text-brand-secondary">Pricing Plans</h3>
                    <p className="text-xs text-text-light mt-1 font-semibold">Choose the legal tier that fits your professional drafting needs. All prices in INR only.</p>
                  </div>
                  <div className="bg-vanilla-secondary/30 rounded-3xl p-2 border border-vanilla-main/50">
                    <PricingSection onOpenComingSoon={(feature) => alert(`Interested in: ${feature}. We'll notify you when this checkout flow is live!`)} />
                  </div>
                </motion.div>
              )}

              {/* TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black text-brand-secondary">Workspace Notifications</h3>
                    <p className="text-xs text-text-light mt-1 font-semibold">Track real-time billing activity, security credential events, and support desk replies.</p>
                  </div>
                  <NotificationsView />
                </motion.div>
              )}

              {/* TAB: BUSINESS PROFILE */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 text-left"
                >
                  <div>
                    <h3 className="text-lg font-black text-brand-secondary font-display">Business Profile Settings</h3>
                    <p className="text-xs text-text-light mt-1 font-semibold">Configure your pre-fill parameters like company name, registered address, and GSTIN/PAN to automatically apply on new contracts.</p>
                  </div>

                  {profileSuccess && (
                    <div id="profile-success-alert" className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 font-bold flex items-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5 text-green-600 shrink-0" />
                      <span>Profile parameters synced to secure cloud storage successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {/* Avatar Picker Row */}
                    <div className="flex items-center gap-4 py-2 bg-vanilla-secondary p-4 rounded-[20px] border border-vanilla-main">
                      <img 
                        id="profile-picker-current-img"
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary/10"
                      />
                      <div>
                        <span className="block text-xs font-black text-brand-secondary">Customize Profile Avatar</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80'
                          ].map((url, index) => (
                            <button
                              id={`avatar-choice-${index}`}
                              key={index}
                              type="button"
                              onClick={() => setProfilePicture(url)}
                              className={`h-8 w-8 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                profilePicture === url ? 'border-brand-primary scale-105 shadow-sm' : 'border-transparent hover:border-vanilla-main'
                              }`}
                            >
                              <img src={url} alt="Option" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-text-secondary mb-1.5">First Name</label>
                        <input
                          id="profile-first-name-input"
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-vanilla-secondary/50 border border-vanilla-main rounded-xl focus:outline-hidden focus:border-brand-primary transition-all font-bold text-brand-secondary"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-text-secondary mb-1.5">Last Name</label>
                        <input
                          id="profile-last-name-input"
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-vanilla-secondary/50 border border-vanilla-main rounded-xl focus:outline-hidden focus:border-brand-primary transition-all font-bold text-brand-secondary"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-text-secondary mb-1.5">Contact Phone</label>
                        <input
                          id="profile-phone-input"
                          type="tel"
                          className="w-full px-3.5 py-2.5 text-xs bg-vanilla-secondary/50 border border-vanilla-main rounded-xl focus:outline-hidden focus:border-brand-primary transition-all font-bold text-brand-secondary"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-text-secondary mb-1.5">Email Address</label>
                        <input
                          id="profile-email-readonly"
                          type="email"
                          disabled
                          className="w-full px-3.5 py-2.5 text-xs bg-vanilla-alt text-text-light border border-vanilla-main rounded-xl cursor-not-allowed font-semibold"
                          value={profile?.email || ''}
                        />
                      </div>
                    </div>

                    <button
                      id="save-profile-btn"
                      type="submit"
                      className="bg-brand-primary hover:opacity-95 text-white px-5 py-3 rounded-xl font-bold text-xs card-shadow transition-opacity inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Save Personal Info
                    </button>
                  </form>

                  <div className="pt-6 border-t border-vanilla-main">
                    <h3 className="text-sm font-black text-brand-secondary mb-1 font-display">Default Jurisdiction Location</h3>
                    <p className="text-xs text-text-light mb-4 font-semibold">Set your default state/district to pre-initialize corresponding stamp act clauses.</p>
                    <LocationSelector 
                      initialLocation={profile?.defaultLocation}
                      onSave={setDefaultLocation}
                    />
                  </div>

                  <div className="pt-6 border-t border-vanilla-main">
                    <h3 className="text-sm font-black text-brand-secondary mb-1 font-display">Corporate Identity pre-fills</h3>
                    <p className="text-xs text-text-light mb-4 font-semibold">Save your company details to auto-fill commercial contracts, rent agreements and vendor deeds instantly.</p>
                    <BusinessProfile 
                      initialProfile={profile?.businessProfile}
                      onSave={updateBusinessProfile}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB: ACCOUNT SECURITY */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 text-left"
                >
                  <UserSecuritySettings />
                </motion.div>
              )}

              {/* TAB: SUPPORT HELP DESK */}
              {activeTab === 'help' && (
                <motion.div
                  key="help"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <HelpCenterView />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* MODAL OVERLAYS */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-vanilla-main text-left"
            >
              <div className="p-6 border-b border-vanilla-main flex items-center justify-between bg-vanilla-secondary/30">
                <h3 className="text-lg font-black text-brand-secondary font-display">Select Default Jurisdiction</h3>
                <button onClick={() => setIsLocationModalOpen(false)} className="p-2 hover:bg-vanilla-main rounded-full transition-colors cursor-pointer">
                  <X className="h-5 w-5 text-text-light" />
                </button>
              </div>
              <div className="p-6">
                <LocationSelector 
                  initialLocation={profile?.defaultLocation}
                  onSave={async (loc) => {
                    await setDefaultLocation(loc);
                    setIsLocationModalOpen(false);
                    await addMockNotification("Jurisdiction Changed", `Selected ${loc.district}, ${loc.state} as default jurisdiction.`, "info");
                  }} 
                />
              </div>
            </motion.div>
          </div>
        )}

        {isBusinessModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBusinessModalOpen(false)}
              className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-vanilla-main text-left"
            >
              <div className="p-6 border-b border-vanilla-main flex items-center justify-between bg-vanilla-secondary/30">
                <h3 className="text-lg font-black text-brand-secondary font-display">Business Profile Settings</h3>
                <button onClick={() => setIsBusinessModalOpen(false)} className="p-2 hover:bg-vanilla-main rounded-full transition-colors cursor-pointer">
                  <X className="h-5 w-5 text-text-light" />
                </button>
              </div>
              <div className="p-6">
                <BusinessProfile 
                  initialProfile={profile?.businessProfile}
                  onSave={async (bp) => {
                    await updateBusinessProfile(bp);
                    setIsBusinessModalOpen(false);
                    await addMockNotification("Business Profile Synced", "Corporate identity pre-fill records successfully updated.", "success");
                  }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
