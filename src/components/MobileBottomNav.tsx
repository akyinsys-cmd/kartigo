import React from 'react';
import { Home, FileText, PlusCircle, Bell, User } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  currentView: string;
  activeTab: string;
  onNavigateHome: () => void;
  onNavigateDashboard: (tab: string) => void;
  onStartAgent: (title?: string) => void;
}

export default function MobileBottomNav({ currentView, activeTab, onNavigateHome, onNavigateDashboard, onStartAgent }: MobileBottomNavProps) {
  // Only show on dashboard or landing, hide on agent so it doesn't block keyboard
  if (currentView === 'agent' || currentView === 'admin' || currentView === 'admin_login') return null;

  const items = [
    {
      id: 'home',
      name: 'Home',
      icon: Home,
      isActive: currentView === 'landing',
      onClick: onNavigateHome,
    },
    {
      id: 'docs',
      name: 'Docs',
      icon: FileText,
      isActive: currentView === 'dashboard' && activeTab === 'overview',
      onClick: () => onNavigateDashboard('overview'),
    },
    {
      id: 'plus',
      name: 'Plus',
      icon: PlusCircle,
      isFab: true,
      onClick: () => onStartAgent(),
    },
    {
      id: 'alerts',
      name: 'Alerts',
      icon: Bell,
      isActive: currentView === 'dashboard' && activeTab === 'notifications',
      onClick: () => onNavigateDashboard('notifications'),
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      isActive: currentView === 'dashboard' && activeTab === 'profile',
      onClick: () => onNavigateDashboard('profile'),
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-vanilla-main px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
      {items.map((item) => {
        if (item.isFab) {
          return (
            <motion.button 
              key={item.id}
              onClick={item.onClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative -top-6 bg-brand-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-primary/95 transition-colors border-4 border-white cursor-pointer z-10"
            >
              <PlusCircle className="h-6 w-6" />
            </motion.button>
          );
        }

        const Icon = item.icon;
        return (
          <motion.button 
            key={item.id}
            onClick={item.onClick}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center gap-1.5 py-1 px-3 relative cursor-pointer min-w-[50px]"
          >
            {item.isActive && (
              <motion.div 
                layoutId="mobileNavIndicator"
                className="absolute -top-3 left-0 right-0 h-1 bg-brand-primary rounded-b-full mx-auto w-8"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className={`h-5 w-5 transition-colors duration-200 ${item.isActive ? 'text-brand-primary' : 'text-text-secondary hover:text-brand-secondary'}`} />
            <span className={`text-[9px] font-bold transition-colors duration-200 ${item.isActive ? 'text-brand-primary' : 'text-text-secondary'}`}>
              {item.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
