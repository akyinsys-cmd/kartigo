import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Menu, X, FileText, ChevronRight, User, Bell, Settings, HelpCircle, LogOut, LayoutDashboard, Shield, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LayoutContainer from './LayoutContainer';

interface HeaderProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  currentView: 'landing' | 'dashboard' | 'agent' | 'admin_login' | 'admin' | 'blog' | 'blog_post' | 'doc_landing' | 'help' | 'about' | 'contact' | 'coming_soon';
  setCurrentView: (view: 'landing' | 'dashboard' | 'agent' | 'admin_login' | 'admin' | 'blog' | 'blog_post' | 'doc_landing' | 'help' | 'about' | 'contact' | 'coming_soon') => void;
  onSelectDashboardTab: (tab: 'overview' | 'agent' | 'profile' | 'security' | 'notifications' | 'future' | 'help' | 'pricing') => void;
}

export default function Header({ 
  onOpenAuth, 
  currentView, 
  setCurrentView,
  onSelectDashboardTab 
}: HeaderProps) {
  const { user, profile, logout, notifications } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setCurrentView('landing');

    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80; // offset for sticky header
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const menuItems = [
    { name: 'Home', id: 'hero', type: 'scroll' },
    { name: 'Categories', id: 'search-filter-section', type: 'scroll' },
    { name: 'Popular Documents', id: 'recent-documents', type: 'scroll' },
    { name: 'Pricing', id: 'pricing-section', type: 'scroll' },
    { name: 'About Us', id: 'about', type: 'view' },
    { name: 'Contact Us', id: 'contact', type: 'view' },
    { name: 'FAQ', id: 'faq-section', type: 'scroll' }
  ];

  const handleNavAction = (item: { name: string, id: string, type: string }) => {
    setIsMobileMenuOpen(false);
    if (item.type === 'view') {
      setCurrentView(item.id as any);
      window.scrollTo(0, 0);
    } else {
      setCurrentView('landing');
      setTimeout(() => {
        const element = document.getElementById(item.id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleUserMenuAction = (tab: 'overview' | 'agent' | 'profile' | 'security' | 'notifications' | 'future' | 'help' | 'pricing') => {
    onSelectDashboardTab(tab);
    setCurrentView('dashboard');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSecureLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    setCurrentView('landing');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
    <header
      id="main-sticky-header"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? 'glass-effect card-shadow py-3 border-b border-vanilla-main/40'
          : 'bg-vanilla-secondary/85 py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
          
          {/* Logo */}
          <div className="flex items-center flex-1 justify-start">
            <button
              id="header-logo-link"
              onClick={(e) => handleNavClick(e, 'hero')}
              className="flex items-center gap-1.5 sm:gap-2 group focus:outline-hidden cursor-pointer shrink-0 min-h-[44px] py-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm group-hover:scale-105 transition-all">
                <span>K</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base sm:text-lg font-bold text-brand-secondary tracking-tight leading-none group-hover:text-brand-primary transition-colors">
                  Kartigo Draft
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-text-light uppercase tracking-widest font-mono mt-0.5">
                  Expert-Grade
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Landing vs Logged In) */}
          <nav id="desktop-nav" className="hidden lg:flex items-center justify-center mx-2 gap-1 relative">
            {menuItems.map((item) => {
              const isActive = (item.type === 'view' && currentView === item.id) || (item.type === 'scroll' && currentView === 'landing' && item.id === 'hero');
              return (
                <motion.button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavAction(item)}
                  whileTap={{ scale: 0.97 }}
                  className={`px-2 xl:px-3 py-2 text-[13px] xl:text-sm font-semibold transition-colors cursor-pointer rounded-lg relative overflow-hidden ${
                    isActive
                      ? 'text-brand-primary'
                      : 'text-text-secondary hover:text-brand-primary hover:bg-vanilla-alt/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="headerNavActiveTab"
                      className="absolute inset-0 bg-vanilla-alt rounded-lg z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Authentication Action Buttons (Right side) */}
          <div id="auth-actions" className="hidden md:flex items-center gap-2 xl:gap-3 relative shrink-0 flex-1 justify-end">
            {user ? (
              // USER DROPDOWN MENU (Logged In)
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('agent')}
                  className="hidden xl:flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Document
                </button>
                
                <div className="relative">
                  <button
                    id="user-profile-menu-trigger"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-vanilla-main bg-white hover:border-brand-primary/20 hover:bg-vanilla-alt transition-all focus:outline-hidden cursor-pointer"
                  >
                    <img
                      src={profile?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                      alt="User Profile"
                      className="w-7 h-7 rounded-full object-cover border border-brand-primary/10"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-bold text-text-cosmic max-w-[100px] truncate">
                      {profile?.firstName || 'My Account'}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Card */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div 
                        id="user-menu-dropdown-box"
                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2.5 w-56 bg-white border border-vanilla-main rounded-[20px] shadow-xl py-2 z-50 text-left"
                      >
                        <div className="px-4 py-2.5 border-b border-vanilla-alt text-left">
                          <span className="block text-xs font-extrabold text-brand-secondary leading-tight">
                            {profile?.firstName} {profile?.lastName}
                          </span>
                          <span className="block text-[10px] text-text-secondary mt-0.5 truncate">{user.email}</span>
                        </div>

                        <div className="p-1 space-y-0.5">
                          <button
                            id="user-menu-dashboard"
                            onClick={() => handleUserMenuAction('overview')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-brand-secondary hover:bg-vanilla-alt rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <LayoutDashboard className="h-4 w-4 text-brand-secondary" />
                            <span>Dashboard</span>
                          </button>
                          
                          <button
                            id="user-menu-profile"
                            onClick={() => handleUserMenuAction('profile')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-brand-secondary hover:bg-vanilla-alt rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <User className="h-4 w-4 text-brand-secondary" />
                            <span>Profile Settings</span>
                          </button>

                          <button
                            id="user-menu-settings"
                            onClick={() => handleUserMenuAction('security')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-brand-secondary hover:bg-vanilla-alt rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <Settings className="h-4 w-4 text-brand-secondary" />
                            <span>Account Settings</span>
                          </button>

                          <button
                            id="user-menu-notifications"
                            onClick={() => handleUserMenuAction('notifications')}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-secondary hover:text-brand-secondary hover:bg-vanilla-alt rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-brand-secondary" />
                              <span>Notifications</span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="h-2 w-2 rounded-full bg-brand-primary" />
                            )}
                          </button>

                          <button
                            id="user-menu-help"
                            onClick={() => handleUserMenuAction('help')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-brand-secondary hover:bg-vanilla-alt rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <HelpCircle className="h-4 w-4 text-brand-secondary" />
                            <span>Help & Support</span>
                          </button>
                        </div>

                        <div className="p-1 border-t border-vanilla-alt">
                          <button
                            id="user-menu-logout"
                            onClick={handleSecureLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-text-light hover:text-brand-primary hover:bg-vanilla-alt rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Secure Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            </div>
          ) : (
              // Action triggers when Logged Out
              <>
                <button
                  id="login-btn-header"
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors focus:outline-hidden cursor-pointer"
                >
                  Login
                </button>
                <button
                  id="get-started-btn-header"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors focus:outline-hidden cursor-pointer"
                >
                  Register
                </button>
                <button
                  onClick={() => setCurrentView('agent')}
                  className="inline-flex items-center gap-1 bg-brand-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all card-shadow cursor-pointer"
                >
                  Create Document
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2 shrink-0 flex-1 justify-end">
            {user && (
              <button
                onClick={() => handleUserMenuAction('overview')}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] focus:outline-hidden cursor-pointer"
              >
                <img
                  src={profile?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt="Mobile User"
                  className="w-8 h-8 rounded-full object-cover border border-brand-primary/10"
                />
              </button>
            )}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-text-secondary hover:text-brand-secondary hover:bg-vanilla-main focus:outline-hidden transition-all cursor-pointer"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
    {/* Mobile Drawer menu */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          id="mobile-menu" key="mobile-menu"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="md:hidden fixed inset-0 bg-vanilla-secondary z-[150] overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-vanilla-main/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  <span>K</span>
                </div>
                <span className="text-lg font-bold text-brand-secondary">Kartigo Draft</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl bg-vanilla-main text-brand-secondary cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2 p-6 overflow-y-auto pb-32">
              <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-4 text-center">Main Menu</div>
              {menuItems.map((item) => (
                <button
                  id={`mobile-nav-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavAction(item)}
                  className={`flex items-center justify-center w-full px-5 py-4 rounded-2xl text-center transition-all min-h-[44px] ${
                    (item.type === 'view' && currentView === item.id) || (item.type === 'scroll' && currentView === 'landing' && item.id === 'hero')
                      ? 'bg-brand-primary/10 text-brand-primary font-bold'
                      : 'text-brand-secondary font-semibold hover:bg-vanilla-main/40'
                  }`}
                >
                  <span className="text-base">{item.name}</span>
                </button>
              ))}
              
              {!user ? (
                <div className="mt-8 pt-8 border-t border-vanilla-main/60 space-y-4">
                  <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-4 text-center">Account</div>
                  <button
                    id="mobile-login-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full flex items-center justify-center py-4 bg-white border border-vanilla-main text-brand-secondary font-bold rounded-2xl shadow-sm"
                  >
                    Sign In
                  </button>
                  <button
                    id="mobile-register-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full flex items-center justify-center py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20"
                  >
                    Join Kartigo Draft
                  </button>
                </div>
              ) : (
                <div className="mt-8 pt-8 border-t border-vanilla-main/60 space-y-2">
                  <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-4 text-center">User Workspace</div>
                  <button
                    onClick={() => handleUserMenuAction('overview')}
                    className="flex items-center justify-center gap-4 w-full p-5 rounded-2xl text-center transition-all text-brand-secondary font-bold hover:bg-vanilla-main/40 bg-white border border-vanilla-main shadow-xs flex-col sm:flex-row min-h-[44px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm">My Dashboard</div>
                      <div className="text-[10px] font-medium text-text-secondary mt-0.5">Manage all drafts & documents</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleUserMenuAction('profile')}
                    className="flex items-center justify-center gap-4 w-full p-5 rounded-2xl text-center transition-all text-brand-secondary font-bold hover:bg-vanilla-main/40 min-h-[44px]"
                  >
                    <User className="h-5 w-5 text-text-light" />
                    <span className="text-sm">Business Profile</span>
                  </button>
                  <button
                    onClick={() => handleUserMenuAction('help')}
                    className="flex items-center justify-center gap-4 w-full p-5 rounded-2xl text-center transition-all text-brand-secondary font-bold hover:bg-vanilla-main/40 min-h-[44px]"
                  >
                    <HelpCircle className="h-5 w-5 text-text-light" />
                    <span className="text-sm">Support Desk</span>
                  </button>
                  <button
                    onClick={handleSecureLogout}
                    className="flex items-center justify-center gap-4 w-full p-5 rounded-2xl text-center transition-all text-red-600 font-bold hover:bg-red-50 mt-4 min-h-[44px]"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm">Sign Out Safely</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}