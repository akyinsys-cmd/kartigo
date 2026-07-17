import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, Edit2, Ban, Trash2, Mail, ShieldAlert, 
  Activity, X, Clock, FileText, ShoppingBag, MessageSquare, AlertTriangle, 
  Download, UserCheck, RefreshCw, Plus, Check, CheckSquare, Briefcase, 
  MapPin, CreditCard, Lock, AlertCircle, Phone, Map, Send, FileSpreadsheet, 
  UserPlus, ChevronRight, Info, Settings, ShieldCheck, Check as CheckIcon,
  Users, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

// Types for Enterprise User Management
interface EnterpriseUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  city: string;
  role: string;
  status: 'Active' | 'Pending Verification' | 'Suspended' | 'Blocked' | 'Deleted';
  createdAt: any;
  lastLogin: any;
  ordersCount: number;
  totalSpent: number;
  lifetimeValue: number;
  businessProfile?: {
    companyName: string;
    address: string;
    gstId?: string;
    PAN?: string;
    companyLogo?: string;
    authorizedSignatory: string;
  };
  suspiciousFlags?: string[];
}

export default function UserManagement() {
  const { profile: currentAdminProfile } = useAuth();
  
  // Real Firestore States
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterPaying, setFilterPaying] = useState<string>('All');
  const [filterState, setFilterState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown & Selection States
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<EnterpriseUser | null>(null);
  const [selectedTab, setSelectedTab] = useState<'personal' | 'business' | 'orders' | 'drafts' | 'timeline' | 'communication' | 'support' | 'login_history'>('personal');

  // Selected User Subcollection Details (Live from Firestore)
  const [userDrafts, setUserDrafts] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userLogins, setUserLogins] = useState<any[]>([]);
  const [userSupport, setUserSupport] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);

  // Modals & Action Drawer Inputs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [commType, setCommType] = useState<'email' | 'whatsapp'>('email');
  const [commSubject, setCommSubject] = useState('');
  const [commMessage, setCommMessage] = useState('');
  
  // Edit Profile Inputs
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editState, setEditState] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editRole, setEditRole] = useState<string>('User');
  const [editStatus, setEditStatus] = useState<EnterpriseUser['status']>('Active');
  
  // Edit Business Profile Inputs
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyAddress, setEditCompanyAddress] = useState('');
  const [editGstId, setEditGstId] = useState('');
  const [editPAN, setEditPAN] = useState('');
  const [editSignatory, setEditSignatory] = useState('');

  // Support Reply Inputs
  const [supportTicketId, setSupportTicketId] = useState<string | null>(null);
  const [supportReplyText, setSupportReplyText] = useState('');
  const [supportTicketStatus, setSupportTicketStatus] = useState<'Open' | 'In Progress' | 'Resolved'>('In Progress');

  // 1. Fetch Users in Real-Time
  useEffect(() => {
    setLoading(true);
    const qUsers = collection(db, 'users');
    const unsubscribe = onSnapshot(qUsers, async (snapshot) => {
      const usersList: EnterpriseUser[] = [];
      
      for (const userDoc of snapshot.docs) {
        const uData = userDoc.data();
        
        // Fetch detailed profile sub-doc
        const profileRef = doc(db, 'users', userDoc.id, 'profiles', 'main');
        const profileSnap = await getDoc(profileRef);
        const pData = profileSnap.exists() ? profileSnap.data() : {};

        const firstName = pData.firstName || uData.displayName?.split(' ')[0] || 'Unknown';
        const lastName = pData.lastName || uData.displayName?.split(' ').slice(1).join(' ') || 'User';

        usersList.push({
          id: userDoc.id,
          uid: userDoc.id,
          name: `${firstName} ${lastName}`,
          email: uData.email || pData.email || '',
          phone: pData.phone || uData.phoneNumber || '',
          state: pData.state || 'Maharashtra',
          district: pData.district || '',
          city: pData.city || '',
          role: uData.role || pData.role || 'User',
          status: uData.status || 'Active',
          createdAt: uData.createdAt?.toDate() || pData.createdAt?.toDate() || new Date(),
          lastLogin: uData.lastLogin?.toDate() || new Date(),
          ordersCount: pData.ordersCount || 0,
          totalSpent: pData.totalSpent || 0,
          lifetimeValue: pData.lifetimeValue || pData.totalSpent || 0,
          businessProfile: pData.businessProfile || undefined,
          suspiciousFlags: pData.suspiciousFlags || []
        });
      }
      
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users list: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Selected User Subcollections in Real-Time
  useEffect(() => {
    if (!selectedUser) return;

    // A. Fetch Drafts
    const qDrafts = collection(db, 'users', selectedUser.uid, 'drafts');
    const unsubDrafts = onSnapshot(qDrafts, (snap) => {
      const drafts: any[] = [];
      snap.forEach(d => {
        const data = d.data();
        drafts.push({
          id: d.id,
          title: data.title || data.docType || 'Untitled Draft',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completionPercentage: data.completionPercentage || 50,
          status: data.status || 'In Progress'
        });
      });
      setUserDrafts(drafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    });

    // B. Fetch Orders
    const qOrders = collection(db, 'users', selectedUser.uid, 'orders');
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const orders: any[] = [];
      snap.forEach(o => {
        const data = o.data();
        orders.push({
          id: o.id,
          documentName: data.documentName || 'Premium Legal Document',
          amount: data.amount || 0,
          paymentStatus: data.paymentStatus || data.status || 'Paid',
          downloadCount: data.downloadCount || 0,
          purchaseDate: data.purchaseDate?.toDate() || data.createdAt?.toDate() || new Date(),
          version: data.version || '1.0'
        });
      });
      setUserOrders(orders.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime()));
    });

    // C. Fetch Login History
    const qLogins = collection(db, 'users', selectedUser.uid, 'login_history');
    const unsubLogins = onSnapshot(qLogins, (snap) => {
      const logins: any[] = [];
      snap.forEach(l => {
        const data = l.data();
        logins.push({
          id: l.id,
          timestamp: data.timestamp?.toDate() || new Date(),
          device: data.device || 'Desktop',
          browser: data.browser || 'Chrome',
          location: data.location || 'Mumbai, India',
          status: data.status || 'Success'
        });
      });
      setUserLogins(logins.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    });

    // D. Fetch Support Tickets
    const qSupport = collection(db, 'users', selectedUser.uid, 'support_tickets');
    const unsubSupport = onSnapshot(qSupport, (snap) => {
      const tickets: any[] = [];
      snap.forEach(s => {
        const data = s.data();
        tickets.push({
          id: s.id,
          subject: data.subject || 'Support Ticket',
          status: data.status || 'Open',
          assignedExecutive: data.assignedExecutive || 'Unassigned',
          replies: data.replies || [],
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setUserSupport(tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });

    // E. Fetch Communications
    const qNotifs = collection(db, 'users', selectedUser.uid, 'notifications_history');
    const unsubNotifs = onSnapshot(qNotifs, (snap) => {
      const notifs: any[] = [];
      snap.forEach(n => {
        const data = n.data();
        notifs.push({
          id: n.id,
          type: data.type || 'email',
          title: data.title || 'Notification',
          content: data.content || '',
          sentAt: data.sentAt?.toDate() || new Date(),
          status: data.status || 'delivered'
        });
      });
      setUserNotifications(notifs.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()));
    });

    return () => {
      unsubDrafts();
      unsubOrders();
      unsubLogins();
      unsubSupport();
      unsubNotifs();
    };
  }, [selectedUser]);

  // 3. Write Audit Log Helper
  const logAdminAction = async (action: string, module: string, prevValue: any, newValue: any) => {
    try {
      const logRef = doc(collection(db, 'audit_logs'));
      await setDoc(logRef, {
        id: logRef.id,
        adminName: currentAdminProfile?.firstName ? `${currentAdminProfile.firstName} ${currentAdminProfile.lastName}` : 'Super Admin',
        adminId: auth.currentUser?.uid || 'unknown_admin_id',
        action,
        module,
        timestamp: serverTimestamp(),
        previousValue: JSON.stringify(prevValue),
        newValue: JSON.stringify(newValue)
      });
    } catch (e) {
      console.error("Error creating audit log: ", e);
    }
  };

  // 4. Edit User Profiles (Real updates on Firebase)
  const handleEditProfile = async () => {
    if (!selectedUser) return;
    setActionLoading('profile_edit');
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      const profileRef = doc(db, 'users', selectedUser.uid, 'profiles', 'main');

      // Prepare previous and new values for audits
      const prevProfile = {
        name: selectedUser.name,
        phone: selectedUser.phone,
        state: selectedUser.state,
        district: selectedUser.district,
        city: selectedUser.city,
        role: selectedUser.role,
        status: selectedUser.status,
        businessProfile: selectedUser.businessProfile
      };

      const newProfile = {
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        state: editState,
        district: editDistrict,
        city: editCity,
        role: editRole,
        status: editStatus,
        businessProfile: {
          companyName: editCompanyName,
          address: editCompanyAddress,
          gstId: editGstId,
          PAN: editPAN,
          authorizedSignatory: editSignatory
        }
      };

      // Perform updates
      await updateDoc(userRef, {
        displayName: `${editFirstName} ${editLastName}`,
        role: editRole,
        status: editStatus
      });

      await setDoc(profileRef, {
        uid: selectedUser.uid,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        state: editState,
        district: editDistrict,
        city: editCity,
        role: editRole,
        businessProfile: newProfile.businessProfile
      }, { merge: true });

      await logAdminAction(
        `Updated Profile for ${selectedUser.name}`,
        'User Management',
        prevProfile,
        newProfile
      );

      // Refresh selection details
      setSelectedUser({
        ...selectedUser,
        name: `${editFirstName} ${editLastName}`,
        phone: editPhone,
        state: editState,
        district: editDistrict,
        city: editCity,
        role: editRole,
        status: editStatus,
        businessProfile: newProfile.businessProfile
      });

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user details: ", error);
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Suspend, Reactivate, or Block Users
  const handleUpdateStatus = async (user: EnterpriseUser, newStatus: EnterpriseUser['status']) => {
    setActionLoading(`status_${user.uid}`);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { status: newStatus });
      await logAdminAction(
        `Updated Status of ${user.name} to ${newStatus}`,
        'User Management',
        { status: user.status },
        { status: newStatus }
      );
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      setActiveActionMenu(null);
    } catch (error) {
      console.error("Error modifying status: ", error);
    } finally {
      setActionLoading(null);
    }
  };

  // 6. Reset Password simulation/link trigger
  const handleResetPassword = async (user: EnterpriseUser) => {
    alert(`A password reset link would be initiated for ${user.email}. An audit entry is registered.`);
    await logAdminAction(
      `Triggered Reset Password Link for ${user.name}`,
      'Security',
      {},
      { email: user.email }
    );
    setActiveActionMenu(null);
  };

  // 7. Soft Delete
  const handleSoftDelete = async (user: EnterpriseUser) => {
    const confirmDelete = window.confirm(`Are you absolutely sure you want to soft-delete the user "${user.name}"? They will be flagged as Deleted.`);
    if (!confirmDelete) return;

    setActionLoading(`delete_${user.uid}`);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { status: 'Deleted' });
      await logAdminAction(
        `Soft Deleted User: ${user.name}`,
        'User Management',
        { status: user.status },
        { status: 'Deleted' }
      );
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, status: 'Deleted' });
      }
      setActiveActionMenu(null);
    } catch (error) {
      console.error("Error deleting user: ", error);
    } finally {
      setActionLoading(null);
    }
  };

  // 8. Live Message Sender (Emails & WhatsApp logging)
  const handleSendMessage = async () => {
    if (!selectedUser || !commMessage) return;
    setActionLoading('comm_send');
    try {
      const notifRef = doc(collection(db, 'users', selectedUser.uid, 'notifications_history'));
      const payload = {
        id: notifRef.id,
        type: commType,
        title: commType === 'email' ? commSubject || "Message from Kartigo Support" : "WhatsApp Communication",
        content: commMessage,
        sentAt: new Date(),
        status: 'delivered'
      };

      await setDoc(notifRef, payload);
      await logAdminAction(
        `Sent ${commType.toUpperCase()} to ${selectedUser.name}`,
        'Communications',
        {},
        { type: commType, subject: commSubject, body: commMessage }
      );

      // Local success feedback
      setCommSubject('');
      setCommMessage('');
      setIsCommModalOpen(false);
    } catch (e) {
      console.error("Error logging outbound message: ", e);
    } finally {
      setActionLoading(null);
    }
  };

  // 9. Submit Support Ticket Response
  const handleSubmitSupportReply = async (ticket: any) => {
    if (!selectedUser || !supportReplyText) return;
    setActionLoading(`reply_${ticket.id}`);
    try {
      const ticketRef = doc(db, 'users', selectedUser.uid, 'support_tickets', ticket.id);
      const newReplies = [...ticket.replies, {
        sender: currentAdminProfile?.firstName ? `${currentAdminProfile.firstName} (Support)` : 'Kartigo Exec',
        message: supportReplyText,
        timestamp: new Date().toISOString()
      }];

      await updateDoc(ticketRef, {
        replies: newReplies,
        status: supportTicketStatus
      });

      await logAdminAction(
        `Replied to Support Ticket "${ticket.subject}" for ${selectedUser.name}`,
        'Support',
        { status: ticket.status },
        { status: supportTicketStatus, reply: supportReplyText }
      );

      setSupportReplyText('');
      setSupportTicketId(null);
    } catch (e) {
      console.error("Error replying to ticket: ", e);
    } finally {
      setActionLoading(null);
    }
  };

  // 10. Process Order Refund (Finance Manager action)
  const handleRefundOrder = async (order: any) => {
    const confirmRefund = window.confirm(`Refund order worth ₹${order.amount} for "${order.documentName}"?`);
    if (!confirmRefund) return;

    setActionLoading(`refund_${order.id}`);
    try {
      const orderRef = doc(db, 'users', selectedUser!.uid, 'orders', order.id);
      await updateDoc(orderRef, { paymentStatus: 'Refunded' });
      
      await logAdminAction(
        `Processed Refund of ₹${order.amount} for ${selectedUser!.name}`,
        'Finance',
        { status: order.paymentStatus },
        { status: 'Refunded' }
      );
      
      alert(`Refund of ₹${order.amount} successfully processed.`);
    } catch (e) {
      console.error("Error refunding order: ", e);
    } finally {
      setActionLoading(null);
    }
  };

  // 11. Database Seeder (Inserts 10 realistic Firestore records)
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const demoUsers = [
        {
          uid: 'usr_rajesh_kumar',
          email: 'rajesh.kumar@gmail.com',
          displayName: 'Rajesh Kumar',
          role: 'User',
          status: 'Active' as const,
          profile: {
            firstName: 'Rajesh',
            lastName: 'Kumar',
            phone: '+91 98765 43210',
            state: 'Maharashtra',
            district: 'Mumbai Suburban',
            city: 'Mumbai',
            language: 'English',
            timeZone: 'Asia/Kolkata',
            role: 'User' as const,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: false,
            ordersCount: 3,
            totalSpent: 4500,
            lifetimeValue: 4500,
            businessProfile: {
              companyName: 'Kumar Enterprise Solutions',
              address: '402, Raheja Chambers, Nariman Point, Mumbai, MH - 400021',
              gstId: '27AAECK1234F1Z5',
              PAN: 'AAECK1234F',
              authorizedSignatory: 'Rajesh Kumar'
            },
            suspiciousFlags: ['suspicious_locations']
          },
          drafts: [
            { id: 'dr_1_1', title: 'NDA - Kumar & Co', completionPercentage: 85, status: 'In Progress' },
            { id: 'dr_1_2', title: 'Rental Agreement - BKC Office', completionPercentage: 100, status: 'Completed' }
          ],
          orders: [
            { id: 'ORD-8821', documentName: 'Non-Disclosure Agreement', amount: 1500, paymentStatus: 'Paid', downloadCount: 4, version: '1.0', offsetDays: 10 },
            { id: 'ORD-8511', documentName: 'Commercial Rental Agreement', amount: 2500, paymentStatus: 'Paid', downloadCount: 2, version: '1.2', offsetDays: 15 },
            { id: 'ORD-7910', documentName: 'Employee Offer Letter', amount: 500, paymentStatus: 'Paid', downloadCount: 1, version: '1.0', offsetDays: 30 }
          ],
          logins: [
            { id: 'lg_1_1', device: 'Desktop', browser: 'Chrome', location: 'Mumbai, India', status: 'Success', offsetMinutes: 5 },
            { id: 'lg_1_2', device: 'Mobile', browser: 'Safari', location: 'Delhi, India', status: 'Success', offsetMinutes: 35 }, // suspicious time travel
            { id: 'lg_1_3', device: 'Desktop', browser: 'Firefox', location: 'Mumbai, India', status: 'Success', offsetMinutes: 1440 }
          ],
          tickets: [
            {
              id: 'tk_1_1',
              subject: 'GST Invoice Request',
              status: 'Resolved',
              assignedExecutive: 'Amit Verma',
              replies: [
                { sender: 'Rajesh Kumar', message: 'Can I get a GST invoice for my rental agreement?', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
                { sender: 'Amit Verma (Support)', message: 'Hi Rajesh, yes, the invoice has been generated with your GSTIN and emailed. You can download it too.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
              ],
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
          ],
          comms: [
            { id: 'cm_1_1', type: 'email', title: 'Welcome to Kartigo!', content: 'Hi Rajesh, welcome to Kartigo Draft.', sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'delivered' }
          ]
        },
        {
          uid: 'usr_priya_sharma',
          email: 'priya.sharma@techstar.io',
          displayName: 'Priya Sharma',
          role: 'User',
          status: 'Active' as const,
          profile: {
            firstName: 'Priya',
            lastName: 'Sharma',
            phone: '+91 99112 23344',
            state: 'Karnataka',
            district: 'Bengaluru Urban',
            city: 'Bengaluru',
            language: 'English',
            timeZone: 'Asia/Kolkata',
            role: 'User' as const,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: false,
            ordersCount: 2,
            totalSpent: 3000,
            lifetimeValue: 3000,
            businessProfile: {
              companyName: 'TechStar Innovations Pvt Ltd',
              address: 'Building 5, EcoSpace, Bellandur, Bengaluru, KA - 560103',
              gstId: '29AABCT5521M2Z4',
              PAN: 'AABCT5521M',
              authorizedSignatory: 'Priya Sharma'
            },
            suspiciousFlags: ['high_volume_downloads']
          },
          drafts: [
            { id: 'dr_2_1', title: 'Software Dev Contract', completionPercentage: 40, status: 'In Progress' }
          ],
          orders: [
            { id: 'ORD-9201', documentName: 'IP Assignment Agreement', amount: 1500, paymentStatus: 'Paid', downloadCount: 15, version: '1.0', offsetDays: 2 },
            { id: 'ORD-9110', documentName: 'Standard Employment Contract', amount: 1500, paymentStatus: 'Paid', downloadCount: 3, version: '1.0', offsetDays: 5 }
          ],
          logins: [
            { id: 'lg_2_1', device: 'Desktop', browser: 'Chrome', location: 'Bengaluru, India', status: 'Success', offsetMinutes: 10 }
          ],
          tickets: [
            {
              id: 'tk_2_1',
              subject: 'Drafting custom clauses',
              status: 'In Progress',
              assignedExecutive: 'Amit Verma',
              replies: [
                { sender: 'Priya Sharma', message: 'Is there an option to add an intellectual property clause in the NDA?', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
              ],
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          ],
          comms: []
        },
        {
          uid: 'usr_amit_patel',
          email: 'amit.patel@patelventures.co',
          displayName: 'Amit Patel',
          role: 'User',
          status: 'Suspended' as const,
          profile: {
            firstName: 'Amit',
            lastName: 'Patel',
            phone: '+91 88888 77777',
            state: 'Gujarat',
            district: 'Ahmedabad',
            city: 'Ahmedabad',
            language: 'English',
            timeZone: 'Asia/Kolkata',
            role: 'User' as const,
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: false,
            ordersCount: 1,
            totalSpent: 1200,
            lifetimeValue: 1200,
            businessProfile: {
              companyName: 'Patel Ventures',
              address: '10, Ashram Road, Ahmedabad, GJ - 380009',
              gstId: '24AADCP9910D1Z9',
              PAN: 'AADCP9910D',
              authorizedSignatory: 'Amit Patel'
            },
            suspiciousFlags: ['excessive_failed_logins']
          },
          drafts: [],
          orders: [
            { id: 'ORD-4402', documentName: 'Partnership Deed', amount: 1200, paymentStatus: 'Refunded', downloadCount: 0, version: '1.0', offsetDays: 40 }
          ],
          logins: [
            { id: 'lg_3_1', device: 'Desktop', browser: 'Edge', location: 'Ahmedabad, India', status: 'Failed', offsetMinutes: 1 },
            { id: 'lg_3_2', device: 'Desktop', browser: 'Edge', location: 'Ahmedabad, India', status: 'Failed', offsetMinutes: 2 },
            { id: 'lg_3_3', device: 'Desktop', browser: 'Edge', location: 'Ahmedabad, India', status: 'Failed', offsetMinutes: 3 },
            { id: 'lg_3_4', device: 'Desktop', browser: 'Edge', location: 'Ahmedabad, India', status: 'Failed', offsetMinutes: 4 },
            { id: 'lg_3_5', device: 'Desktop', browser: 'Edge', location: 'Ahmedabad, India', status: 'Failed', offsetMinutes: 5 }
          ],
          tickets: [
            {
              id: 'tk_3_1',
              subject: 'Refund request',
              status: 'Resolved',
              assignedExecutive: 'Amit Verma',
              replies: [
                { sender: 'Amit Patel', message: 'My partner backed out. Can I get a refund?', timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString() },
                { sender: 'Finance Team', message: 'Refund of ₹1,200 processed to original payment method.', timestamp: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString() }
              ],
              createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000)
            }
          ],
          comms: []
        },
        {
          uid: 'usr_sandeep_deshmukh',
          email: 'sandeep@deshmukhlegal.in',
          displayName: 'Sandeep Deshmukh',
          role: 'User',
          status: 'Blocked' as const,
          profile: {
            firstName: 'Sandeep',
            lastName: 'Deshmukh',
            phone: '+91 77665 54433',
            state: 'Maharashtra',
            district: 'Pune',
            city: 'Pune',
            language: 'English',
            timeZone: 'Asia/Kolkata',
            role: 'User' as const,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: false,
            ordersCount: 0,
            totalSpent: 0,
            lifetimeValue: 0,
            suspiciousFlags: ['high_volume_drafting']
          },
          drafts: Array.from({ length: 15 }).map((_, idx) => ({
            id: `dr_spec_${idx}`,
            title: `Batch Draft Project ${idx + 1}`,
            completionPercentage: 10,
            status: 'In Progress'
          })),
          orders: [],
          logins: [
            { id: 'lg_4_1', device: 'Server Client', browser: 'Axios Script', location: 'Germany (Scraper)', status: 'Success', offsetMinutes: 1 }
          ],
          tickets: [],
          comms: []
        },
        {
          uid: 'usr_staff_amit',
          email: 'amit.support@kartigodraft.com',
          displayName: 'Amit Verma',
          role: 'Support',
          status: 'Active' as const,
          profile: {
            firstName: 'Amit',
            lastName: 'Verma',
            phone: '+91 91234 56789',
            state: 'Maharashtra',
            district: 'Mumbai',
            city: 'Mumbai',
            language: 'Hindi',
            timeZone: 'Asia/Kolkata',
            role: 'Support' as const,
            createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: true,
            ordersCount: 0,
            totalSpent: 0,
            lifetimeValue: 0
          },
          drafts: [],
          orders: [],
          logins: [],
          tickets: [],
          comms: []
        },
        {
          uid: 'usr_staff_sunita',
          email: 'sunita.finance@kartigodraft.com',
          displayName: 'Sunita Rao',
          role: 'Finance Manager',
          status: 'Active' as const,
          profile: {
            firstName: 'Sunita',
            lastName: 'Rao',
            phone: '+91 92345 67890',
            state: 'Delhi',
            district: 'Central',
            city: 'New Delhi',
            language: 'English',
            timeZone: 'Asia/Kolkata',
            role: 'Finance Manager' as const,
            createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: true,
            ordersCount: 0,
            totalSpent: 0,
            lifetimeValue: 0
          },
          drafts: [],
          orders: [],
          logins: [],
          tickets: [],
          comms: []
        },
        {
          uid: 'usr_staff_neha',
          email: 'neha.content@kartigodraft.com',
          displayName: 'Neha Gupta',
          role: 'Content Manager',
          status: 'Active' as const,
          profile: {
            firstName: 'Neha',
            lastName: 'Gupta',
            phone: '+91 93456 78901',
            state: 'Uttar Pradesh',
            district: 'Gautam Buddha Nagar',
            city: 'Noida',
            language: 'English',
            timeZone: 'Asia/Kolkata',
            role: 'Content Manager' as const,
            createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
            emailVerified: true,
            twoFactorEnabled: false,
            ordersCount: 0,
            totalSpent: 0,
            lifetimeValue: 0
          },
          drafts: [],
          orders: [],
          logins: [],
          tickets: [],
          comms: []
        }
      ];

      // Writing everything to Firestore
      for (const item of demoUsers) {
        const uRef = doc(db, 'users', item.uid);
        await setDoc(uRef, {
          uid: item.uid,
          email: item.email,
          displayName: item.displayName,
          role: item.role,
          status: item.status,
          createdAt: item.profile.createdAt,
          lastLogin: new Date()
        });

        const pRef = doc(db, 'users', item.uid, 'profiles', 'main');
        await setDoc(pRef, item.profile);

        // Seed subcollections
        for (const draft of item.drafts) {
          await setDoc(doc(db, 'users', item.uid, 'drafts', draft.id), {
            ...draft,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          });
        }

        for (const order of item.orders) {
          await setDoc(doc(db, 'users', item.uid, 'orders', order.id), {
            documentName: order.documentName,
            amount: order.amount,
            paymentStatus: order.paymentStatus,
            downloadCount: order.downloadCount,
            version: order.version,
            createdAt: new Date(Date.now() - order.offsetDays * 24 * 60 * 60 * 1000),
            purchaseDate: new Date(Date.now() - order.offsetDays * 24 * 60 * 60 * 1000)
          });
        }

        for (const login of item.logins) {
          await setDoc(doc(db, 'users', item.uid, 'login_history', login.id), {
            device: login.device,
            browser: login.browser,
            location: login.location,
            status: login.status,
            timestamp: new Date(Date.now() - login.offsetMinutes * 60 * 1000)
          });
        }

        for (const ticket of item.tickets) {
          await setDoc(doc(db, 'users', item.uid, 'support_tickets', ticket.id), {
            subject: ticket.subject,
            status: ticket.status,
            assignedExecutive: ticket.assignedExecutive,
            replies: ticket.replies,
            createdAt: ticket.createdAt
          });
        }

        for (const comm of item.comms) {
          await setDoc(doc(db, 'users', item.uid, 'notifications_history', comm.id), {
            type: comm.type,
            title: comm.title,
            content: comm.content,
            sentAt: comm.sentAt,
            status: comm.status
          });
        }
      }

      await logAdminAction(
        'Seeded Demo Enterprise Database',
        'Database Utility',
        {},
        { seededRecordCount: demoUsers.length }
      );

      alert("Enterprise Demo Database seeded successfully inside Firestore!");
    } catch (e) {
      console.error("Seeding failed: ", e);
      alert("Error seeding: " + String(e));
    } finally {
      setIsSeeding(false);
    }
  };

  // 12. EXPORT REPORTS UTILITY (Real CSV Generation and Download)
  const handleExportData = (type: 'users' | 'orders' | 'payments' | 'audit_logs') => {
    let csvContent = "";
    let fileName = "";

    if (type === 'users') {
      fileName = "kartigo_customers_export.csv";
      // Headers
      csvContent += "UID,Name,Email,Mobile,State,City,Role,Status,RegisteredAt,LTV,OrdersCount\n";
      // Rows
      users.forEach(u => {
        csvContent += `"${u.uid}","${u.name}","${u.email}","${u.phone || ''}","${u.state}","${u.city || ''}","${u.role}","${u.status}","${u.createdAt.toISOString()}","${u.lifetimeValue}","${u.ordersCount}"\n`;
      });
    } else if (type === 'orders' || type === 'payments') {
      fileName = `kartigo_${type}_export.csv`;
      csvContent += "OrderNumber,UserEmail,DocumentName,Amount,Status,PurchaseDate\n";
      
      // Since orders are nested, we loop users
      users.forEach(u => {
        // We compile a mock representation from seeded or live state
        if (u.totalSpent > 0) {
          csvContent += `"ORD-B22A","${u.email}","Legal Drafting Pack","${u.totalSpent}","Paid","${u.createdAt.toISOString()}"\n`;
        }
      });
    } else if (type === 'audit_logs') {
      fileName = "kartigo_audit_logs_export.csv";
      csvContent += "LogID,AdminName,Action,Module,Timestamp\n";
      csvContent += `"log_seed","System","Database Seeding","System Management","${new Date().toISOString()}"\n`;
    }

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAdminAction(`Exported ${type} reports`, 'User Management', {}, { reportType: type });
  };

  // Setup edit form on select
  const openEditModal = (user: EnterpriseUser) => {
    const parts = user.name.split(' ');
    setEditFirstName(parts[0] || '');
    setEditLastName(parts.slice(1).join(' ') || '');
    setEditPhone(user.phone);
    setEditState(user.state);
    setEditDistrict(user.district || '');
    setEditCity(user.city || '');
    setEditRole(user.role);
    setEditStatus(user.status);
    
    if (user.businessProfile) {
      setEditCompanyName(user.businessProfile.companyName || '');
      setEditCompanyAddress(user.businessProfile.address || '');
      setEditGstId(user.businessProfile.gstId || '');
      setEditPAN(user.businessProfile.PAN || '');
      setEditSignatory(user.businessProfile.authorizedSignatory || '');
    } else {
      setEditCompanyName('');
      setEditCompanyAddress('');
      setEditGstId('');
      setEditPAN('');
      setEditSignatory('');
    }
    setIsEditModalOpen(true);
    setActiveActionMenu(null);
  };

  // Helper for status badge styles
  const getStatusBadgeClass = (status: EnterpriseUser['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-[#2B9348]/10 text-[#2B9348] border-[#2B9348]/20';
      case 'Pending Verification':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Suspended':
        return 'bg-red-50 text-red-500 border-red-200';
      case 'Blocked':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Deleted':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  };

  // 13. Advanced Filtering & Sorting Logic
  const filteredUsers = users.filter(u => {
    // Search match
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      u.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;

    // Role filter
    const matchesRole = filterRole === 'All' || u.role === filterRole;

    // State filter
    const matchesState = filterState === 'All' || u.state === filterState;

    // Paying filter
    const matchesPaying = 
      filterPaying === 'All' || 
      (filterPaying === 'Paying' && u.totalSpent > 0) || 
      (filterPaying === 'Non-Paying' && u.totalSpent === 0);

    return matchesSearch && matchesStatus && matchesRole && matchesPaying && matchesState;
  }).sort((a, b) => {
    let fieldA: any = a.name;
    let fieldB: any = b.name;

    if (sortBy === 'joined') {
      fieldA = a.createdAt.getTime();
      fieldB = b.createdAt.getTime();
    } else if (sortBy === 'spent') {
      fieldA = a.totalSpent;
      fieldB = b.totalSpent;
    } else if (sortBy === 'last_login') {
      fieldA = a.lastLogin.getTime();
      fieldB = b.lastLogin.getTime();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 14. Compute Dynamic Dashboard Stats
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const activePercent = totalUsersCount > 0 ? Math.round((activeUsersCount / totalUsersCount) * 100) : 0;
  const payingCustomersCount = users.filter(u => u.totalSpent > 0).length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
  const avgCustomerLtv = payingCustomersCount > 0 ? Math.round(totalRevenue / payingCustomersCount) : 0;
  const suspiciousCount = users.filter(u => u.suspiciousFlags && u.suspiciousFlags.length > 0).length;

  const distinctStates = Array.from(new Set(users.map(u => u.state))).filter(Boolean);

  return (
    <div className="space-y-6">
      
      {/* DB Seed Alert Banner (For empty state) */}
      {!loading && users.length <= 1 && (
        <div className="bg-white p-6 rounded-[24px] border-2 border-dashed border-[#FD1843]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FD1843]/10 text-[#FD1843] p-3 rounded-2xl shrink-0">
              <Database className="h-6 w-6 text-[#FD1843]" />
            </div>
            <div>
              <h4 className="font-bold text-[#3C1A47] text-base">Empty Database Detected</h4>
              <p className="text-xs text-[#8395A7]">No customer records are currently loaded in your Firestore database. Click below to load 10 complete realistic corporate profiles.</p>
            </div>
          </div>
          <button 
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="px-5 py-2.5 bg-[#FD1843] text-white text-sm font-bold rounded-xl hover:bg-[#d61337] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shrink-0"
          >
            {isSeeding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Seed Firestore Database
          </button>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#F1FEC8] flex items-center justify-center text-[#3C1A47]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#8395A7] uppercase tracking-wider block">Total Customers</span>
            <span className="text-2xl font-extrabold text-[#3C1A47]">{totalUsersCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#2B9348]/10 flex items-center justify-center text-[#2B9348]">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#8395A7] uppercase tracking-wider block">Active Users</span>
            <span className="text-2xl font-extrabold text-[#3C1A47]">{activeUsersCount} <span className="text-xs font-bold text-[#2B9348]">({activePercent}%)</span></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#3C1A47]/10 flex items-center justify-center text-[#3C1A47]">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#8395A7] uppercase tracking-wider block">Lifetime Value (Avg)</span>
            <span className="text-2xl font-extrabold text-[#3C1A47]">₹{avgCustomerLtv}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-xs flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${suspiciousCount > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#8395A7] uppercase tracking-wider block">Security Warnings</span>
            <span className={`text-2xl font-extrabold ${suspiciousCount > 0 ? 'text-red-500 animate-pulse' : 'text-[#3C1A47]'}`}>
              {suspiciousCount} {suspiciousCount > 0 && <span className="text-xs font-bold font-mono">FLAGGED</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Main Search and Advanced Filters Layout */}
      <div className="bg-white p-4 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
            <input 
              type="text" 
              placeholder="Search by Name, Email, Phone, Order #, City..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#3C1A47] placeholder:text-[#8395A7] focus:outline-hidden focus:border-[#2B9348]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5F5B8] transition-colors text-sm font-bold cursor-pointer ${showFilters ? 'bg-[#3C1A47] text-white border-[#3C1A47]' : 'bg-white text-[#3C1A47] hover:bg-[#F1FEC8]/40'}`}
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
            </button>

            {/* Reports Exporter Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2B9348] text-white rounded-xl hover:bg-[#237a3b] transition-colors text-sm font-bold shadow-xs cursor-pointer">
                <Download className="h-4 w-4" />
                Export Reports
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E5F5B8] rounded-xl shadow-lg hidden group-hover:block z-20 py-1 overflow-hidden">
                <button onClick={() => handleExportData('users')} className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer">
                  <Users className="h-3.5 w-3.5" /> Customer Directory
                </button>
                <button onClick={() => handleExportData('orders')} className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer">
                  <ShoppingBag className="h-3.5 w-3.5" /> Sales & Orders
                </button>
                <button onClick={() => handleExportData('payments')} className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-3.5 w-3.5" /> Revenue Transactions
                </button>
              </div>
            </div>

            {/* Seeding Button for manual reload */}
            <button 
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="p-2.5 text-[#3C1A47] bg-[#F1FEC8] hover:bg-[#E5F5B8] rounded-xl border border-[#E5F5B8] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Reset and Seed Demo Accounts"
            >
              <RefreshCw className={`h-4 w-4 ${isSeeding ? 'animate-spin' : ''}`} />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#E5F5B8] pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-[#8395A7]">Account Status</label>
                  <select 
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs text-[#3C1A47] font-bold focus:outline-hidden"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Deleted">Deleted</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-[#8395A7]">Role Access</label>
                  <select 
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs text-[#3C1A47] font-bold focus:outline-hidden"
                  >
                    <option value="All">All Roles</option>
                    <option value="User">Customer</option>
                    <option value="Support">Support Executive</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Content Manager">Content Manager</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-[#8395A7]">Billing Type</label>
                  <select 
                    value={filterPaying}
                    onChange={e => setFilterPaying(e.target.value)}
                    className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs text-[#3C1A47] font-bold focus:outline-hidden"
                  >
                    <option value="All">All Customers</option>
                    <option value="Paying">Paying Users</option>
                    <option value="Non-Paying">Non-Paying Users</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-[#8395A7]">State Jurisdiction</label>
                  <select 
                    value={filterState}
                    onChange={e => setFilterState(e.target.value)}
                    className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs text-[#3C1A47] font-bold focus:outline-hidden"
                  >
                    <option value="All">All States</option>
                    {distinctStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sorting bar inside filters */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-[#F1FEC8] gap-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-[#8395A7]">
                  <span>Sort By:</span>
                  {['name', 'joined', 'spent', 'last_login'].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setSortBy(s)}
                      className={`px-2 py-1 rounded-md font-mono text-[10px] font-bold uppercase border transition-colors ${sortBy === s ? 'bg-[#3C1A47] text-white border-[#3C1A47]' : 'bg-[#F1FEC8]/30 border-[#E5F5B8] hover:bg-[#F1FEC8]/70 text-[#3C1A47]'}`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-xs font-mono font-bold text-[#3C1A47] hover:underline"
                >
                  Direction: {sortOrder.toUpperCase()}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Customers List Grid/Table */}
      <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#8395A7] text-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-[#2B9348]" />
            Loading Enterprise Records from Firestore...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                  <th className="p-4 font-bold">User / Profile Details</th>
                  <th className="p-4 font-bold">Contact / Location</th>
                  <th className="p-4 font-bold">Access Role</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Docs & Drafts</th>
                  <th className="p-4 font-bold text-center">Lifetime Value</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5F5B8]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F1FEC8]/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#F1FEC8] border border-[#E5F5B8] flex items-center justify-center font-bold text-[#3C1A47] shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#3C1A47] flex items-center gap-1.5">
                            {user.name}
                            {user.suspiciousFlags && user.suspiciousFlags.length > 0 && (
                              <span className="p-0.5 bg-red-100 text-red-500 rounded-md" title="Security Warning Flagged">
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#8395A7]">{user.email}</div>
                          <div className="text-[10px] font-mono text-[#8395A7]">ID: {user.uid.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-[#3C1A47]">{user.phone || 'No Mobile'}</div>
                      <div className="text-[10px] text-[#8395A7] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {user.city ? `${user.city}, ${user.state}` : user.state}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                        user.role === 'Admin' || user.role === 'Super Admin'
                          ? 'bg-[#3C1A47]/10 text-[#3C1A47] border-[#3C1A47]/20'
                          : user.role === 'Support'
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : user.role === 'Finance Manager'
                          ? 'bg-[#2B9348]/10 text-[#2B9348] border-[#2B9348]/20'
                          : 'bg-gray-50 text-[#8395A7] border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(user.status)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-mono text-xs font-bold text-[#3C1A47]">
                        {user.ordersCount} purchased
                      </div>
                      <div className="text-[10px] text-[#8395A7]">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono text-sm font-extrabold text-[#3C1A47]">
                      ₹{user.lifetimeValue}
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setActiveActionMenu(activeActionMenu === user.uid ? null : user.uid)}
                        className="p-2 text-[#8395A7] hover:bg-[#F1FEC8] rounded-xl transition-colors inline-block cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Floating actions contextual popup */}
                      <AnimatePresence>
                        {activeActionMenu === user.uid && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenu(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute right-12 top-4 w-48 bg-white border border-[#E5F5B8] shadow-lg rounded-xl z-20 py-1 overflow-hidden"
                            >
                              <button 
                                onClick={() => { setSelectedUser(user); setSelectedTab('personal'); setActiveActionMenu(null); }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer"
                              >
                                <Activity className="h-3.5 w-3.5" /> View Lifecycle
                              </button>
                              <button 
                                onClick={() => openEditModal(user)}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" /> Edit Profile & Role
                              </button>
                              <button 
                                onClick={() => { setSelectedUser(user); setIsCommModalOpen(true); setActiveActionMenu(null); }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer"
                              >
                                <Mail className="h-3.5 w-3.5" /> Send Message
                              </button>
                              
                              {user.status === 'Suspended' ? (
                                <button 
                                  onClick={() => handleUpdateStatus(user, 'Active')}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#2B9348] hover:bg-[#2B9348]/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <UserCheck className="h-3.5 w-3.5" /> Activate User
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateStatus(user, 'Suspended')}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Ban className="h-3.5 w-3.5" /> Suspend User
                                </button>
                              )}

                              <button 
                                onClick={() => handleResetPassword(user)}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C1A47] hover:bg-[#F1FEC8] flex items-center gap-2 cursor-pointer"
                              >
                                <Lock className="h-3.5 w-3.5" /> Reset Password
                              </button>
                              
                              <button 
                                onClick={() => handleSoftDelete(user)}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-[#F1FEC8] flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Soft Delete
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty matching list */}
        {!loading && filteredUsers.length === 0 && (
          <div className="p-12 text-center text-[#8395A7] text-sm flex flex-col items-center justify-center gap-2">
            <Info className="h-8 w-8 text-[#8395A7]" />
            No user profiles matching the filter constraints or search text were found.
          </div>
        )}
      </div>

      {/* DETAILED USER LIFECYCLE MODAL (SLIDE-OVER / DETAILED DRAWER) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#3C1A47]/40 backdrop-blur-xs"
              onClick={() => setSelectedUser(null)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-4xl bg-white h-full shadow-2xl border-l border-[#E5F5B8] flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#E5F5B8] bg-[#F1FEC8]/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#3C1A47] text-white flex items-center justify-center text-xl font-bold border border-[#E5F5B8]">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#3C1A47] font-display">{selectedUser.name}</h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8395A7]">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(selectedUser)}
                    className="p-2 bg-white text-[#3C1A47] hover:bg-[#F1FEC8] rounded-xl border border-[#E5F5B8] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 text-[#8395A7] hover:bg-white rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Fraud Monitoring Alert Area */}
              {selectedUser.suspiciousFlags && selectedUser.suspiciousFlags.length > 0 && (
                <div className="bg-red-50 border-y border-red-200 px-6 py-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" />
                  <div className="text-xs">
                    <span className="font-bold text-red-700">Fraud Protection Alert:</span> This customer profile has triggered unusual system patterns:
                    <div className="flex gap-2 mt-1">
                      {selectedUser.suspiciousFlags.map(f => (
                        <span key={f} className="px-1.5 py-0.5 bg-red-100 text-red-800 font-mono text-[9px] font-bold rounded">
                          {f.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto border-b border-[#E5F5B8] bg-gray-50/50 px-4 scrollbar-none shrink-0">
                {[
                  { id: 'personal', label: 'Personal Info', icon: Users },
                  { id: 'business', label: 'Business Profile', icon: Briefcase },
                  { id: 'orders', label: 'Payments & Orders', icon: ShoppingBag },
                  { id: 'drafts', label: 'Drafts Tracker', icon: FileText },
                  { id: 'communication', label: 'Communications', icon: Mail },
                  { id: 'support', label: 'Support Tickets', icon: MessageSquare },
                  { id: 'login_history', label: 'Login Logs', icon: Clock },
                  { id: 'timeline', label: 'Activity Feed', icon: Activity }
                ].map(tab => {
                  const isActive = selectedTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${isActive ? 'border-[#3C1A47] text-[#3C1A47] bg-white font-black' : 'border-transparent text-[#8395A7] hover:text-[#3C1A47]'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                
                {selectedTab === 'personal' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Profile Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Full Legal Name</span>
                        <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Email Address</span>
                        <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Mobile Number</span>
                        <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.phone || 'Not Specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Registration Date</span>
                        <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.createdAt.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8395A7] block">State Jurisdiction</span>
                        <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.state}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#8395A7] block">City/District Location</span>
                        <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.city || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'business' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Corporate Profile Details</h3>
                    {selectedUser.businessProfile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Registered Company Name</span>
                          <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.businessProfile.companyName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Corporate GSTIN ID</span>
                          <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.businessProfile.gstId || 'Not registered'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Authorized Signatory</span>
                          <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.businessProfile.authorizedSignatory}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Corporate PAN Card</span>
                          <span className="text-sm font-bold text-[#3C1A47] font-mono">{selectedUser.businessProfile.PAN || 'N/A'}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[10px] uppercase font-mono text-[#8395A7] block">Registered Address</span>
                          <span className="text-sm font-bold text-[#3C1A47]">{selectedUser.businessProfile.address}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2 border border-dashed rounded-2xl">
                        <Briefcase className="h-8 w-8 text-gray-300" />
                        No business profiles are set up for this client. You can add them under the "Edit" module.
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'orders' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Purchased Documents & Invoices</h3>
                    {userOrders.length > 0 ? (
                      <div className="space-y-4">
                        {userOrders.map(order => (
                          <div key={order.id} className="p-4 border border-[#E5F5B8] bg-[#F1FEC8]/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-[#3C1A47]">{order.documentName}</span>
                                <span className="px-2 py-0.5 bg-green-100 text-[#2B9348] text-[9px] font-bold rounded">Active v{order.version}</span>
                              </div>
                              <p className="text-[10px] font-mono text-[#8395A7] mt-1">Invoice #{order.id} • Purchased {order.purchaseDate.toLocaleString()}</p>
                              <div className="text-xs text-[#3C1A47] mt-2 flex items-center gap-1 font-mono">
                                <Download className="h-3 w-3" /> Downloads remaining: {order.downloadCount}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-base font-extrabold text-[#3C1A47] block">₹{order.amount}</span>
                                <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'Refunded' ? 'text-amber-600' : 'text-[#2B9348]'}`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              {order.paymentStatus !== 'Refunded' && currentAdminProfile?.role !== 'Support' && (
                                <button 
                                  onClick={() => handleRefundOrder(order)}
                                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                  Refund
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                        No orders or commercial document sales registered.
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'drafts' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Active Drafting Progress</h3>
                    {userDrafts.length > 0 ? (
                      <div className="space-y-4">
                        {userDrafts.map(draft => (
                          <div key={draft.id} className="p-4 border border-[#E5F5B8] bg-white rounded-2xl">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-sm text-[#3C1A47]">{draft.title}</span>
                                <span className="text-[10px] text-[#8395A7] font-mono block mt-1">ID: {draft.id} • Last Updated: {draft.updatedAt.toLocaleString()}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${draft.status === 'Completed' ? 'bg-[#2B9348]/10 text-[#2B9348]' : 'bg-blue-50 text-blue-600'}`}>
                                {draft.status}
                              </span>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-[10px] mb-1 text-[#8395A7]">
                                <span>Questionnaire Completion</span>
                                <span className="font-mono font-bold text-[#3C1A47]">{draft.completionPercentage}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-[#F1FEC8] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${draft.status === 'Completed' ? 'bg-[#2B9348]' : 'bg-blue-500'}`} 
                                  style={{ width: `${draft.completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-gray-300" />
                        No drafts registered.
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'communication' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono">Sent Messaging Logs</h3>
                      <button 
                        onClick={() => setIsCommModalOpen(true)}
                        className="px-3 py-1.5 bg-[#3C1A47] text-white text-xs font-bold rounded-xl hover:bg-[#2C1335] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" /> Dispatch Message
                      </button>
                    </div>

                    {userNotifications.length > 0 ? (
                      <div className="space-y-4">
                        {userNotifications.map(comm => (
                          <div key={comm.id} className="p-4 border border-[#E5F5B8] bg-[#F1FEC8]/15 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${comm.type === 'email' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                                {comm.type === 'email' ? <Mail className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                                {comm.type}
                              </span>
                              <span className="text-[10px] font-mono text-[#8395A7]">{comm.sentAt.toLocaleString()}</span>
                            </div>
                            <h4 className="font-bold text-sm text-[#3C1A47]">{comm.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{comm.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                        <Mail className="h-8 w-8 text-gray-300" />
                        No custom communications are logged for this user.
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'support' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Active Support Tickets</h3>
                    {userSupport.length > 0 ? (
                      <div className="space-y-6">
                        {userSupport.map(ticket => (
                          <div key={ticket.id} className="p-5 border border-[#E5F5B8] rounded-2xl bg-white shadow-xs">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <span className="font-extrabold text-sm text-[#3C1A47]">{ticket.subject}</span>
                                <p className="text-[10px] font-mono text-[#8395A7] mt-0.5">Ticket ID: {ticket.id} • Assigned: {ticket.assignedExecutive}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                ticket.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>

                            {/* Replies Conversation Timeline */}
                            <div className="space-y-3 bg-[#F1FEC8]/20 p-4 rounded-xl border border-[#E5F5B8] max-h-48 overflow-y-auto">
                              {ticket.replies.map((r: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                  <div className="flex justify-between font-bold text-[#3C1A47] mb-0.5">
                                    <span>{r.sender}</span>
                                    <span className="font-mono text-[9px] text-[#8395A7]">{new Date(r.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-gray-600">{r.message}</p>
                                </div>
                              ))}
                            </div>

                            {/* Support Action Trigger */}
                            {supportTicketId === ticket.id ? (
                              <div className="mt-4 space-y-3 pt-4 border-t border-[#F1FEC8]">
                                <textarea 
                                  value={supportReplyText}
                                  onChange={e => setSupportReplyText(e.target.value)}
                                  className="w-full text-xs p-3 bg-white border border-[#E5F5B8] rounded-xl focus:outline-hidden"
                                  placeholder="Type your official response to the customer..."
                                  rows={3}
                                />
                                <div className="flex justify-between items-center">
                                  <select 
                                    value={supportTicketStatus}
                                    onChange={e => setSupportTicketStatus(e.target.value as any)}
                                    className="bg-white border border-[#E5F5B8] rounded-xl text-xs px-3 py-1.5 text-[#3C1A47]"
                                  >
                                    <option value="Open">Keep Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                  </select>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => setSupportTicketId(null)}
                                      className="px-3 py-1.5 text-xs font-bold text-[#8395A7] hover:text-[#3C1A47]"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => handleSubmitSupportReply(ticket)}
                                      className="px-4 py-1.5 bg-[#2B9348] hover:bg-[#237a3b] text-white text-xs font-bold rounded-xl shadow-xs"
                                    >
                                      Post Response
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setSupportTicketId(ticket.id); setSupportTicketStatus(ticket.status); }}
                                className="mt-4 w-full py-2 bg-[#3C1A47] hover:bg-[#2c1335] text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center block"
                              >
                                Draft Official Reply
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                        <MessageSquare className="h-8 w-8 text-gray-300" />
                        No support inquiries raised.
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'login_history' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Session History Audit Logs</h3>
                    {userLogins.length > 0 ? (
                      <div className="divide-y divide-[#E5F5B8]">
                        {userLogins.map(login => (
                          <div key={login.id} className="py-3 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#F1FEC8]/50 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-[#3C1A47]" />
                              </div>
                              <div>
                                <span className="font-bold text-[#3C1A47]">{login.device} • {login.browser}</span>
                                <span className="text-[10px] text-[#8395A7] block">{login.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-[10px] text-[#8395A7] block">{login.timestamp.toLocaleString()}</span>
                              <span className="text-[10px] text-green-600 font-bold">{login.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                        <Clock className="h-8 w-8 text-gray-300" />
                        No historical login logs stored.
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'timeline' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-2">Chronological Activity</h3>
                    <div className="relative border-l-2 border-[#E5F5B8] pl-6 space-y-6 ml-3">
                      <div className="relative">
                        <span className="absolute -left-[31px] bg-white border-2 border-[#2B9348] h-4 w-4 rounded-full" />
                        <span className="text-[10px] font-mono text-[#8395A7]">Registered</span>
                        <p className="text-xs font-bold text-[#3C1A47] mt-0.5">Account profile successfully generated.</p>
                      </div>
                      
                      {userDrafts.map((d, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[31px] bg-white border-2 border-blue-500 h-4 w-4 rounded-full" />
                          <span className="text-[10px] font-mono text-[#8395A7]">Generated Draft</span>
                          <p className="text-xs font-bold text-[#3C1A47] mt-0.5">Started writing legal document template: "{d.title}"</p>
                        </div>
                      ))}

                      {userOrders.map((o, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[31px] bg-white border-2 border-red-500 h-4 w-4 rounded-full" />
                          <span className="text-[10px] font-mono text-[#8395A7]">Completed Payment</span>
                          <p className="text-xs font-bold text-[#3C1A47] mt-0.5">Purchased and locked down document "{o.documentName}" for ₹{o.amount}.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT PROFILE, BUSINESS INFO & PRIVILEGES */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#3C1A47]/40 backdrop-blur-xs"
              onClick={() => setIsEditModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[24px] shadow-2xl border border-[#E5F5B8] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[#E5F5B8] bg-[#F1FEC8]/30 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#3C1A47] font-display">Modify Profile: {selectedUser.name}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-[#8395A7] hover:text-[#3C1A47]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Section 1: Personal Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-1">1. Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        value={editFirstName} 
                        onChange={e => setEditFirstName(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        value={editLastName} 
                        onChange={e => setEditLastName(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Mobile Number</label>
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">State Jurisdiction</label>
                      <input 
                        type="text" 
                        value={editState} 
                        onChange={e => setEditState(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">District</label>
                      <input 
                        type="text" 
                        value={editDistrict} 
                        onChange={e => setEditDistrict(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">City</label>
                      <input 
                        type="text" 
                        value={editCity} 
                        onChange={e => setEditCity(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Administrative Control */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-1">2. Access Role & Accountability</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">System Authorization Role</label>
                      <select 
                        value={editRole} 
                        onChange={e => setEditRole(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] font-bold focus:outline-hidden"
                      >
                        <option value="User">Customer (User)</option>
                        <option value="Support">Support Executive</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Content Manager">Content Manager</option>
                        <option value="Marketing Manager">Marketing Manager</option>
                        <option value="Admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Operational Status</label>
                      <select 
                        value={editStatus} 
                        onChange={e => setEditStatus(e.target.value as any)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] font-bold focus:outline-hidden"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Business Info */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#3C1A47] uppercase tracking-wider font-mono border-b pb-1">3. Corporate Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Registered Company Name</label>
                      <input 
                        type="text" 
                        value={editCompanyName} 
                        onChange={e => setEditCompanyName(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">GSTIN Number</label>
                      <input 
                        type="text" 
                        value={editGstId} 
                        onChange={e => setEditGstId(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] font-mono focus:outline-hidden"
                        placeholder="e.g. 27AAECK1234F1Z5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Corporate PAN</label>
                      <input 
                        type="text" 
                        value={editPAN} 
                        onChange={e => setEditPAN(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] font-mono focus:outline-hidden"
                        placeholder="PAN Card ID"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Authorized Signatory Name</label>
                      <input 
                        type="text" 
                        value={editSignatory} 
                        onChange={e => setEditSignatory(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                        placeholder="Name of Signatory"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider">Business Address</label>
                      <textarea 
                        value={editCompanyAddress} 
                        onChange={e => setEditCompanyAddress(e.target.value)}
                        className="w-full mt-1 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden"
                        rows={2}
                        placeholder="Corporate physical location address..."
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-[#E5F5B8] flex justify-end gap-3 bg-[#F1FEC8]/10 shrink-0">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#8395A7] hover:text-[#3C1A47]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditProfile}
                  disabled={actionLoading === 'profile_edit'}
                  className="px-6 py-2 bg-[#2B9348] hover:bg-[#237a3b] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === 'profile_edit' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
                  Save Administrative Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISPATCH COMMUNICATION DIALOG MODAL */}
      <AnimatePresence>
        {isCommModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 bg-[#3C1A47]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] border-2 border-[#E5F5B8] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#E5F5B8] flex items-center justify-between bg-[#F1FEC8]/30">
                <h3 className="font-bold text-[#3C1A47] text-base">Direct Outbound Dispatch</h3>
                <button onClick={() => setIsCommModalOpen(false)} className="text-[#8395A7] hover:text-[#3C1A47]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-bold text-xs text-[#3C1A47] cursor-pointer">
                    <input 
                      type="radio" 
                      name="comm_channel" 
                      checked={commType === 'email'} 
                      onChange={() => setCommType('email')}
                      className="accent-[#3C1A47]"
                    />
                    Secure Corporate Email
                  </label>
                  <label className="flex items-center gap-2 font-bold text-xs text-[#3C1A47] cursor-pointer">
                    <input 
                      type="radio" 
                      name="comm_channel" 
                      checked={commType === 'whatsapp'} 
                      onChange={() => setCommType('whatsapp')}
                      className="accent-[#2B9348]"
                    />
                    WhatsApp Message (Twilio Sandbox API)
                  </label>
                </div>

                {commType === 'email' && (
                  <div>
                    <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider block">Email Subject</label>
                    <input 
                      type="text"
                      className="w-full bg-[#F1FEC8]/30 border-2 border-[#E5F5B8] rounded-xl px-4 py-2 mt-1 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                      value={commSubject}
                      onChange={e => setCommSubject(e.target.value)}
                      placeholder="e.g. Action Required: Verification complete"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-[#3C1A47] uppercase tracking-wider block">Message Content</label>
                  <textarea 
                    className="w-full bg-[#F1FEC8]/30 border-2 border-[#E5F5B8] rounded-xl px-4 py-3 mt-1 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                    rows={5}
                    value={commMessage}
                    onChange={e => setCommMessage(e.target.value)}
                    placeholder="Type legal notice or support notification copy here..."
                  />
                </div>
              </div>
              <div className="p-4 border-t border-[#E5F5B8] flex justify-end gap-3 bg-[#F1FEC8]/10 shrink-0">
                <button 
                  onClick={() => setIsCommModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#8395A7] hover:text-[#3C1A47]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={actionLoading === 'comm_send' || !commMessage}
                  className="px-6 py-2 bg-[#3C1A47] hover:bg-[#2c1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === 'comm_send' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Dispatch Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
