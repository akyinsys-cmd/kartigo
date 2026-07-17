import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, CheckCircle, AlertCircle, Info, Trash2, 
  Search, Filter, Shield, Settings, FileText, Download, Check
} from 'lucide-react';
import { formatIndianDate } from '../utils/dateUtils';
import { EmptyState } from './CustomerWorkspacePlaceholders';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'order' | 'payment' | 'document' | 'support' | 'security' | 'announcement';
  read: boolean;
  createdAt: Date;
}

interface NotificationsViewProps {
  notifications?: Notification[];
  markAsRead?: (id: string) => void;
  markAllAsRead?: () => void;
  deleteNotification?: (id: string) => void;
  addMockNotification?: () => void;
}

export default function NotificationsView({
  notifications = [],
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addMockNotification
}: NotificationsViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Default mock data if none provided
  const displayNotifications = notifications.length > 0 ? notifications : [
    {
      id: '1',
      title: 'Welcome to Kartigo Draft',
      message: 'Your workspace is ready. You can now start drafting professional legal documents.',
      type: 'system',
      read: false,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Document Saved',
      message: 'Your "Non-Disclosure Agreement" draft was successfully saved.',
      type: 'document',
      read: true,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      title: 'Security Alert: New Login',
      message: 'A new login was detected on a Mac device in San Francisco, CA.',
      type: 'security',
      read: true,
      createdAt: new Date(Date.now() - 86400000)
    }
  ] as Notification[];

  const unreadCount = displayNotifications.filter(n => !n.read).length;

  const filteredNotifications = displayNotifications.filter(n => {
    const matchesFilter = activeFilter === 'all' || n.type === activeFilter;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4 text-amber-500" />;
      case 'document': return <FileText className="h-4 w-4 text-brand-primary" />;
      case 'order':
      case 'payment': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'support': return <Info className="h-4 w-4 text-blue-500" />;
      case 'system':
      case 'announcement': return <Bell className="h-4 w-4 text-brand-secondary" />;
      default: return <Bell className="h-4 w-4 text-text-light" />;
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'security': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'document': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'order':
      case 'payment': return 'bg-green-50 text-green-600 border-green-200';
      case 'support': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-vanilla-main text-brand-secondary border-vanilla-main';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-xs text-text-light mt-1">Manage alerts, messages, and document updates.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {addMockNotification && (
            <button
              onClick={addMockNotification}
              className="px-3 py-2 bg-vanilla-secondary text-brand-secondary text-xs font-bold rounded-xl hover:bg-vanilla-main transition-colors border border-vanilla-main cursor-pointer"
            >
              Simulate Alert
            </button>
          )}
          <button
            onClick={() => markAllAsRead && markAllAsRead()}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-vanilla-main text-brand-secondary text-xs font-bold rounded-xl hover:bg-vanilla-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            Mark All Read
          </button>
        </div>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-vanilla-main flex flex-col sm:flex-row gap-3 items-center justify-between bg-vanilla-secondary/30 rounded-t-[20px]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30 transition-colors text-text-secondary shadow-xs"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            {['all', 'document', 'payment', 'security', 'system'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                  activeFilter === filter
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-text-secondary border-vanilla-main hover:bg-vanilla-secondary'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-vanilla-main">
          {filteredNotifications.length === 0 ? (
            <div className="p-6">
              <EmptyState 
                icon={Bell}
                title="All Caught Up!"
                description="You don't have any notifications matching this filter. We will ping you when there is a critical document or billing update."
              />
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 flex gap-4 transition-colors hover:bg-vanilla-secondary/20 relative group ${!notif.read ? 'bg-brand-primary/5' : 'bg-white'}`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r-full" />
                )}
                
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${getBadgeForType(notif.type)} bg-white`}>
                  {getIconForType(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm font-bold ${!notif.read ? 'text-brand-secondary' : 'text-text-secondary'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-text-light mt-1 leading-relaxed pr-8">
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-text-light whitespace-nowrap pt-1">
                      {notif.createdAt.toLocaleDateString() === new Date().toLocaleDateString() 
                        ? notif.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : formatIndianDate(notif.createdAt)}
                    </span>
                  </div>
                  
                  {/* Actions (visible on hover) */}
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    {!notif.read && markAsRead && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-[10px] font-bold text-brand-primary bg-white border border-brand-primary/20 px-2 py-1 rounded hover:bg-brand-primary/5 transition-colors cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                    {deleteNotification && (
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="text-text-light hover:text-red-500 p-1 bg-white border border-vanilla-main rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
