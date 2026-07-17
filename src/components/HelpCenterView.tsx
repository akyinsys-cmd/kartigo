import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, MessageSquare, Plus, Send, ChevronDown, ChevronUp, 
  Clock, Shield, AlertCircle, CheckCircle, Search, Mail, 
  ExternalLink, ArrowLeft, Bot, User, CornerDownRight, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { formatIndianDate } from '../utils/dateUtils';
import { EmptyState } from './CustomerWorkspacePlaceholders';
import Breadcrumbs from './Breadcrumbs';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: 'Getting Started',
    items: [
      { q: 'What is Kartigo Draft?', a: 'Kartigo Draft is an expert-grade, conversational drafting workspace that enables businesses and individuals to compile complex contracts, NDAs, offer letters, and rental agreements within minutes through structured form flows or direct AI-guided chat with our assistant, AI Assistant.' },
      { q: 'Is it legally binding in India?', a: 'Yes, all our templates are carefully compiled to adhere to the Indian Contract Act, 1872, the IT Act, 2000, and standard Indian jurisdiction practices. Remember to print on appropriate stamp duty paper (e.g., ₹100 or ₹200 stamp paper depending on your state guidelines) to execute legally.' },
      { q: 'Do I need a lawyer to draft a document?', a: 'Our templates are vetted by business legal professionals, which satisfies standard corporate and personal situations. However, for specialized disputes, ultra-high-value mergers, or unique courtroom litigations, we always recommend having your final output reviewed by a registered corporate advocate.' }
    ]
  },
  {
    title: 'Documents & Drafts',
    items: [
      { q: 'How does the Draft auto-save work?', a: 'Any answers or prompts you supply in the drafting assistant are automatically persisted in real time as a Draft in your workspace. You can close your tab, return days later, and continue drafting from where you paused without losing any progress.' },
      { q: 'Can I add custom legal clauses?', a: 'Yes! While the structured form wizard fills out primary standard parameters, you can use our "Chat with AI Assistant" mode to specify custom penalties, bespoke exclusions, unique arbitration cities, or custom confidentiality terms. The system will auto-inject these seamlessly.' },
      { q: 'How do I duplicate or version my documents?', a: 'From your Document feed, you can click "Duplicate" to clone a contract or "New Version" to increment the version control (e.g. v1.1, v1.2) of an existing layout so you can experiment with clause updates.' }
    ]
  },
  {
    title: 'Billing & Payments',
    items: [
      { q: 'Are there any hidden monthly subscription fees?', a: 'No, Kartigo operates on a strict Pay-Per-Draft paygo framework. There are no monthly fees. You only pay when you decide to unlock and download a finalized legal document.' },
      { q: 'How do I access my GST tax invoice?', a: 'Every purchase registers an invoice. You can click on "Order History" or select the "Tax Invoice" button inside your Orders log to view, export, and claim inputs for CGST, SGST, and IGST.' },
      { q: 'What payment methods do you support?', a: 'We use Razorpay secure integration supporting UPI (GPay, PhonePe, Paytm), net banking from all major Indian banks, and all domestic debit or credit cards.' }
    ]
  },
  {
    title: 'Downloads & Formats',
    items: [
      { q: 'What formats can I download?', a: 'Once a document is unlocked, you can download it in professional, clean PDF (unwatermarked) format or in editable Microsoft Word (DOCX) format for final styling adjustments.' },
      { q: 'Do I have to pay again to re-download the same document?', a: 'Absolutely not! Once purchased, that document is unlocked permanently. You can edit, recompile, and download it as many times as you want for free from your Download Center.' }
    ]
  }
];

interface HelpCenterViewProps {
  onNavigateHome?: () => void;
}

export default function HelpCenterView({ onNavigateHome }: HelpCenterViewProps = {}) {
  const { user, profile, addMockNotification } = useAuth();
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'create' | 'contact'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);

  // Form state
  const [category, setCategory] = useState('Technical Issue');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Reply state inside chat
  const [replyText, setReplyText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoadingTickets(false);
      return;
    }

    const ticketsRef = collection(db, 'users', user.uid, 'tickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          replies: (data.replies || []).map((r: any) => ({
            ...r,
            createdAt: r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
          }))
        };
      });
      setTickets(list);
      setLoadingTickets(false);

      // Keep active ticket state synchronized if open
      if (activeTicket) {
        const updated = list.find(t => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
    }, (error) => {
      console.error("Failed to fetch tickets:", error);
      setLoadingTickets(false);
    });

    return () => unsubscribe();
  }, [user, activeTicket?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeTicket?.replies]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketRef = doc(collection(db, 'users', user.uid, 'tickets'));
      const newTicket = {
        id: ticketRef.id,
        uid: user.uid,
        userEmail: user.email || '',
        userName: profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Valued Client',
        subject,
        category,
        priority,
        description,
        status: 'Open',
        createdAt: new Date(),
        replies: [
          {
            id: 'initial',
            sender: 'user',
            senderName: profile?.firstName || 'Client',
            text: description,
            createdAt: new Date()
          }
        ]
      };

      await setDoc(ticketRef, newTicket);
      
      await addMockNotification(
        "Support Ticket Logged",
        `Your technical query regarding "${subject}" has been successfully logged. ID: TKT-${ticketRef.id.slice(0, 5)}`,
        "info"
      );

      setSubject('');
      setDescription('');
      setSuccessMsg(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setSuccessMsg(false);
        setActiveTab('tickets');
      }, 2500);

    } catch (err) {
      console.error("Failed to log ticket:", err);
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!user || !activeTicket || !replyText.trim()) return;

    try {
      const ticketRef = doc(db, 'users', user.uid, 'tickets', activeTicket.id);
      const newReply = {
        id: `reply-${Date.now()}`,
        sender: 'user',
        senderName: profile?.firstName || 'Client',
        text: replyText,
        createdAt: new Date()
      };

      const updatedReplies = [...(activeTicket.replies || []), newReply];
      await updateDoc(ticketRef, {
        replies: updatedReplies,
        status: 'Open' // Reset status to Open so support sees it
      });

      setReplyText('');
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  // Legendary Simulated Agent response trigger
  const handleSimulateReply = async () => {
    if (!user || !activeTicket) return;
    setIsSimulating(true);

    setTimeout(async () => {
      try {
        const ticketRef = doc(db, 'users', user.uid, 'tickets', activeTicket.id);
        const autoResponses = [
          `Hi ${profile?.firstName || 'there'},\n\nThis is Arjun from Kartigo Support Team. I have investigated your ticket regarding "${activeTicket.subject}". \n\nI have confirmed that our payment processing channel is fully operational. We've verified your GST invoice record is clean. Please proceed to verify in your Downloads tab. Let me know if you experience any other hiccups!`,
          `Greetings!\n\nI'm Arjun, Support Lead. Your document draft parameters have been synchronized on our backup servers securely. If you need any specific customized indemnification clauses, please let me know and we will formulate them instantly!\n\nBest, Arjun`,
          `Hi,\n\nWe've validated your business profile configurations (GSTIN/PAN). These values will now automatically pre-fill into all future rental leases or NDAs you initiate. Thank you for choosing Kartigo Draft!`
        ];

        const chosenResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        const agentReply = {
          id: `support-reply-${Date.now()}`,
          sender: 'support',
          senderName: 'Arjun (Support Lead)',
          text: chosenResponse,
          createdAt: new Date()
        };

        const updatedReplies = [...(activeTicket.replies || []), agentReply];
        await updateDoc(ticketRef, {
          replies: updatedReplies,
          status: 'Replied'
        });

        await addMockNotification(
          "Support Response Received",
          "Your support ticket TKT-has received a new response from Arjun.",
          "success"
        );

      } catch (err) {
        console.error("Simulation failed:", err);
      } finally {
        setIsSimulating(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Breadcrumbs 
          onBackHome={onNavigateHome}
          items={[{ label: 'Support & Help Desk', isActive: true }]} 
        />
      </div>
      {/* Title block */}
      {!activeTicket && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Support & Help Desk</h2>
            <p className="text-xs text-text-light mt-1 font-medium">Have legal questions or experiencing technical difficulties? We are here 24/7.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-vanilla-main shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'faq' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-secondary hover:bg-vanilla-secondary'}`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${activeTab === 'tickets' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-secondary hover:bg-vanilla-secondary'}`}
            >
              My Tickets
              {tickets.filter(t => t.status === 'Replied').length > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-brand-primary rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'create' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-secondary hover:bg-vanilla-secondary'}`}
            >
              Open Ticket
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'contact' ? 'bg-[#3C1A47] text-[#F1FEC8]' : 'text-text-secondary hover:bg-vanilla-secondary'}`}
            >
              Contact Us
            </button>
          </div>
        </div>
      )}

      {/* 1. TICKET TIMELINE CHAT DETAILED VIEW */}
      <AnimatePresence mode="wait">
        {activeTicket ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border border-vanilla-main rounded-[24px] shadow-sm overflow-hidden flex flex-col h-[520px] text-left"
          >
            {/* Ticket header */}
            <div className="p-5 border-b border-vanilla-main bg-vanilla-secondary/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTicket(null)}
                  className="p-2 hover:bg-vanilla-main rounded-xl text-[#3C1A47] transition-all cursor-pointer border border-vanilla-main bg-white shadow-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-brand-secondary">{activeTicket.subject}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      activeTicket.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {activeTicket.priority} Priority
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      activeTicket.status === 'Resolved' ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {activeTicket.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-light font-mono mt-0.5">Category: {activeTicket.category} • ID: TKT-{activeTicket.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Simulation Quick Reply */}
              <button
                onClick={handleSimulateReply}
                disabled={isSimulating || activeTicket.status === 'Resolved'}
                className="hidden sm:inline-flex items-center gap-1 bg-[#F1FEC8] border border-brand-primary/20 text-[#3C1A47] hover:bg-[#3C1A47] hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40"
              >
                {isSimulating ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-[#3C1A47] border-t-transparent rounded-full animate-spin" />
                    <span>Writing Reply...</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <span>Simulate Support Response</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrollable messages container */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-vanilla-secondary/10">
              <div className="p-4 bg-white border border-vanilla-main/60 rounded-2xl mb-2">
                <span className="block text-[10px] font-bold text-text-light font-mono uppercase tracking-wider">Ticket Description</span>
                <p className="text-xs text-text-secondary mt-1 font-bold whitespace-pre-wrap">{activeTicket.description}</p>
                <div className="mt-3 text-[9px] text-text-light font-mono">
                  Submitted: {formatIndianDate(activeTicket.createdAt)}
                </div>
              </div>

              {/* Chat replies */}
              {activeTicket.replies && activeTicket.replies.map((reply: any, index: number) => {
                const isUser = reply.sender === 'user';
                return (
                  <div key={reply.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4.5 text-xs text-left shadow-2xs ${
                      isUser 
                        ? 'bg-[#3C1A47] text-[#F1FEC8] rounded-br-none' 
                        : 'bg-white border border-vanilla-main text-text-secondary rounded-bl-none'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold font-mono uppercase tracking-widest text-brand-primary">
                        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        <span>{reply.senderName || (isUser ? 'Client' : 'Agent')}</span>
                      </div>
                      <p className="whitespace-pre-line font-medium">{reply.text}</p>
                      <span className="block text-[8px] text-right mt-1.5 opacity-60 font-mono">
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSimulating && (
                <div className="flex justify-start">
                  <div className="bg-white border border-vanilla-main rounded-2xl rounded-bl-none p-3.5 shadow-xs space-y-1">
                    <span className="text-[9px] font-bold text-brand-primary animate-pulse font-mono uppercase tracking-wider">Arjun is typing reply...</span>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reply Input Box */}
            <div className="p-4 border-t border-vanilla-main bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder="Type reply to support team..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                className="flex-1 px-4 py-3 bg-vanilla-secondary/40 border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary text-text-secondary font-medium"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="p-3 bg-[#3C1A47] text-[#F1FEC8] rounded-xl hover:opacity-95 transition-opacity disabled:opacity-40 cursor-pointer shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* 2. FAQ ACCORDION TAB */}
            {activeTab === 'faq' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
                  <input
                    type="text"
                    placeholder="Search FAQ articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/40 transition-colors text-text-secondary shadow-xs"
                  />
                </div>

                <div className="grid gap-6 text-left">
                  {FAQ_CATEGORIES.map((cat, cIdx) => {
                    const filteredItems = cat.items.filter(
                      i => i.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           i.a.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={cIdx} className="space-y-3">
                        <h3 className="text-xs font-extrabold text-[#3C1A47] uppercase tracking-wider font-mono border-b border-vanilla-main pb-1.5">
                          {cat.title}
                        </h3>
                        <div className="space-y-2">
                          {filteredItems.map((item, iIdx) => {
                            const uniqueKey = `${cIdx}-${iIdx}`;
                            const isExpanded = expandedFaq === uniqueKey;

                            return (
                              <div 
                                key={iIdx} 
                                className="bg-white border border-vanilla-main/80 rounded-xl overflow-hidden hover:border-brand-primary/20 transition-all shadow-2xs"
                              >
                                <button
                                  onClick={() => setExpandedFaq(isExpanded ? null : uniqueKey)}
                                  className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-brand-secondary hover:bg-vanilla-secondary/20 transition-colors cursor-pointer text-left"
                                >
                                  <span>{item.q}</span>
                                  {isExpanded ? <ChevronUp className="h-4 w-4 text-brand-primary" /> : <ChevronDown className="h-4 w-4 text-text-light" />}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-t border-vanilla-main bg-vanilla-secondary/10 px-4 py-3 text-xs text-text-secondary leading-relaxed font-bold"
                                    >
                                      {item.a}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 3. MY TICKETS LIST TAB */}
            {activeTab === 'tickets' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-vanilla-main rounded-[24px] shadow-sm p-6 text-left"
              >
                {loadingTickets ? (
                  <div className="py-12 text-center text-xs text-text-light font-mono flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span>Retrieving active logs...</span>
                  </div>
                ) : tickets.length === 0 ? (
                  <EmptyState 
                    icon={HelpCircle}
                    title="No Support Tickets Logged"
                    description="Have questions about stamp duty, payments, or custom clauses? Open a secure support ticket to receive immediate response."
                    actionText="Open Support Ticket"
                    onAction={() => setActiveTab('create')}
                  />
                ) : (
                  <div className="grid gap-4">
                    {tickets.map((ticket) => {
                      const lastReply = ticket.replies && ticket.replies.length > 0 
                        ? ticket.replies[ticket.replies.length - 1] 
                        : null;

                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setActiveTicket(ticket)}
                          className="p-5 bg-white border border-vanilla-main hover:border-brand-primary/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition-all cursor-pointer relative group text-left"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-[#3C1A47] group-hover:text-brand-primary transition-colors">{ticket.subject}</h4>
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${
                                ticket.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {ticket.priority}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                                ticket.status === 'Replied' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-vanilla-secondary text-brand-secondary'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            
                            <p className="text-xs text-text-secondary mt-1 font-bold line-clamp-1">{ticket.description}</p>
                            
                            {lastReply && (
                              <div className="mt-3 flex items-start gap-1.5 text-[11px] text-text-light font-bold">
                                <CornerDownRight className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                                <span className="line-clamp-1 italic">
                                  Last reply: <strong className="not-italic text-brand-secondary">{lastReply.senderName}</strong>: {lastReply.text}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="block text-[10px] text-text-light font-mono">{formatIndianDate(ticket.createdAt)}</span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-primary mt-2">
                              View Timeline <Send className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. OPEN TICKET FORM TAB */}
            {activeTab === 'create' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-vanilla-main rounded-[24px] shadow-sm p-6 text-left max-w-xl mx-auto w-full"
              >
                <div className="border-b border-vanilla-main pb-4 mb-5">
                  <h3 className="text-base font-bold text-brand-secondary flex items-center gap-2">
                    <Plus className="h-5 w-5 text-brand-primary" />
                    Log a New Support Ticket
                  </h3>
                  <p className="text-xs text-text-light mt-1 font-medium">Please supply detailed parameters of your issue so we can resolve it instantly.</p>
                </div>

                {successMsg ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-brand-secondary">Support Ticket Registered!</h4>
                    <p className="text-xs text-text-light">We have logged your ticket and synchronized it with active support queues.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-[#3C1A47] uppercase tracking-wider mb-1.5">Issue Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-white border border-vanilla-main rounded-xl px-3.5 py-2.5 text-xs text-brand-secondary focus:outline-hidden focus:border-brand-primary font-bold cursor-pointer"
                        >
                          <option>Technical Issue</option>
                          <option>Payment Gateway Issue</option>
                          <option>GST Invoice request</option>
                          <option>Document Customization</option>
                          <option>Stamp Duty consultation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-[#3C1A47] uppercase tracking-wider mb-1.5">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full bg-white border border-vanilla-main rounded-xl px-3.5 py-2.5 text-xs text-brand-secondary focus:outline-hidden focus:border-brand-primary font-bold cursor-pointer"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#3C1A47] uppercase tracking-wider mb-1.5">Subject</label>
                      <input
                        type="text"
                        placeholder="Brief summary of your query"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-white border border-vanilla-main rounded-xl px-3.5 py-2.5 text-xs text-brand-secondary focus:outline-hidden focus:border-brand-primary font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#3C1A47] uppercase tracking-wider mb-1.5">Description Details</label>
                      <textarea
                        rows={5}
                        placeholder="Please elaborate on your concern. If referring to a transaction, mention the Order ID or time of checkout."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white border border-vanilla-main rounded-xl px-3.5 py-2.5 text-xs text-brand-secondary focus:outline-hidden focus:border-brand-primary font-bold resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#3C1A47] text-[#F1FEC8] border border-[#E5F5B8]/30 font-bold text-xs rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-[#F1FEC8] border-t-transparent rounded-full animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* 5. CONTACT US CHANNELS TAB */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-vanilla-main rounded-[24px] shadow-sm p-6 text-left max-w-xl mx-auto w-full space-y-6"
              >
                <div className="border-b border-vanilla-main pb-4">
                  <h3 className="text-base font-bold text-brand-secondary">Contact Our Central Support Team</h3>
                  <p className="text-xs text-text-light mt-1">Get directly in touch with our live support officers via rapid digital communication channels.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/918073589439?text=Hi%20Kartigo%20Support%2C%20I%20have%20a%20legal%20drafting%20query."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 border-2 border-green-100 hover:border-green-400 rounded-2xl bg-green-50/20 text-left transition-all hover:shadow-md flex flex-col justify-between h-40 cursor-pointer"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-wider rounded-md">WhatsApp Support</span>
                      <h4 className="text-sm font-extrabold text-[#3C1A47] mt-3">Live WhatsApp Chat</h4>
                      <p className="text-[11px] text-text-secondary mt-1 font-bold leading-relaxed">Direct message with support team for quick assistance on transactions.</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-green-600">
                      <span>Message on WhatsApp</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </a>

                  {/* Email Support */}
                  <a
                    href="mailto:support@kartigo.online?subject=Kartigo%20Support%20Request"
                    className="p-5 border-2 border-blue-100 hover:border-blue-400 rounded-2xl bg-blue-50/20 text-left transition-all hover:shadow-md flex flex-col justify-between h-40 cursor-pointer"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-wider rounded-md">Email Help Desk</span>
                      <h4 className="text-sm font-extrabold text-[#3C1A47] mt-3">Support Email Desk</h4>
                      <p className="text-[11px] text-text-secondary mt-1 font-bold leading-relaxed">Submit corporate invoices requests, billing reconciliations, or customized templates proposals.</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-blue-600">
                      <span>Send Support Email</span>
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
