import React, { useState, useEffect } from 'react';
import { 
  Shield, Search, UserCheck, ShieldAlert, UserPlus, MoreVertical, X, Check,
  Sliders, Users, AlertTriangle, RefreshCw, Key, ShieldCheck, Save, Trash2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, doc, getDocs, setDoc, updateDoc, onSnapshot, getDoc,
  query, where, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const TEAM_ROLES = [
  'Super Admin', 
  'Admin', 
  'Support', 
  'Finance Manager', 
  'Content Manager', 
  'Marketing Manager'
];

interface StaffMember {
  uid: string;
  name: string;
  email: string;
  role: string;
  isSuper: boolean;
  status: string;
}

interface RolePermissions {
  user_view: boolean;
  user_edit: boolean;
  user_suspend: boolean;
  user_export: boolean;
  doc_view: boolean;
  doc_create: boolean;
  doc_edit: boolean;
  doc_publish: boolean;
  doc_archive: boolean;
  pay_view: boolean;
  pay_refund: boolean;
  pay_export: boolean;
  support_view: boolean;
  support_reply: boolean;
  support_assign: boolean;
  view_documents: boolean;
  edit_cms: boolean;
  CMS: boolean;
  Orders: boolean;
}

const DEFAULT_PERMISSIONS: Record<string, RolePermissions> = {
  'Super Admin': {
    user_view: true, user_edit: true, user_suspend: true, user_export: true,
    doc_view: true, doc_create: true, doc_edit: true, doc_publish: true, doc_archive: true,
    pay_view: true, pay_refund: true, pay_export: true,
    support_view: true, support_reply: true, support_assign: true,
    view_documents: true, edit_cms: true,
    CMS: true, Orders: true
  },
  'Admin': {
    user_view: true, user_edit: true, user_suspend: true, user_export: true,
    doc_view: true, doc_create: true, doc_edit: true, doc_publish: true, doc_archive: true,
    pay_view: true, pay_refund: false, pay_export: true,
    support_view: true, support_reply: true, support_assign: true,
    view_documents: true, edit_cms: true,
    CMS: true, Orders: true
  },
  'Support': {
    user_view: true, user_edit: false, user_suspend: false, user_export: false,
    doc_view: true, doc_create: false, doc_edit: false, doc_publish: false, doc_archive: false,
    pay_view: false, pay_refund: false, pay_export: false,
    support_view: true, support_reply: true, support_assign: true,
    view_documents: true, edit_cms: false,
    CMS: false, Orders: false
  },
  'Finance Manager': {
    user_view: true, user_edit: false, user_suspend: false, user_export: true,
    doc_view: true, doc_create: false, doc_edit: false, doc_publish: false, doc_archive: false,
    pay_view: true, pay_refund: true, pay_export: true,
    support_view: false, support_reply: false, support_assign: false,
    view_documents: true, edit_cms: false,
    CMS: false, Orders: true
  },
  'Content Manager': {
    user_view: false, user_edit: false, user_suspend: false, user_export: false,
    doc_view: true, doc_create: true, doc_edit: true, doc_publish: true, doc_archive: true,
    pay_view: false, pay_refund: false, pay_export: false,
    support_view: false, support_reply: false, support_assign: false,
    view_documents: true, edit_cms: true,
    CMS: true, Orders: false
  },
  'Marketing Manager': {
    user_view: true, user_edit: false, user_suspend: false, user_export: true,
    doc_view: true, doc_create: false, doc_edit: false, doc_publish: false, doc_archive: false,
    pay_view: false, pay_refund: false, pay_export: false,
    support_view: false, support_reply: false, support_assign: false,
    view_documents: true, edit_cms: true,
    CMS: true, Orders: false
  }
};

export default function RoleManagement() {
  const { profile: currentAdminProfile } = useAuth();
  
  // Real-time Firestore States
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [savingPermissionRole, setSavingPermissionRole] = useState<string | null>(null);

  // Layout View Tabs
  const [activeTab, setActiveTab] = useState<'directory' | 'permissions'>('directory');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Assign Role State Form
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState('Support');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Selected Role for matrix editor
  const [selectedPermissionRole, setSelectedPermissionRole] = useState<string>('Support');

  // 1. Fetch Staff Directory (Live from Firestore)
  useEffect(() => {
    setLoading(true);
    const qUsers = collection(db, 'users');
    const unsubscribe = onSnapshot(qUsers, async (snapshot) => {
      const staffList: StaffMember[] = [];
      
      for (const userDoc of snapshot.docs) {
        const uData = userDoc.data();
        const role = uData.role || 'User';

        // Filter: Only include administrative and operational team members
        if (TEAM_ROLES.includes(role)) {
          // Fetch detailed profile for Display Name
          const profileRef = doc(db, 'users', userDoc.id, 'profiles', 'main');
          const profileSnap = await getDoc(profileRef);
          const pData = profileSnap.exists() ? profileSnap.data() : {};
          
          const firstName = pData.firstName || uData.displayName?.split(' ')[0] || 'Unknown';
          const lastName = pData.lastName || uData.displayName?.split(' ').slice(1).join(' ') || 'Staff';

          staffList.push({
            uid: userDoc.id,
            name: `${firstName} ${lastName}`,
            email: uData.email || pData.email || '',
            role: role,
            isSuper: role === 'Super Admin',
            status: uData.status || 'Active'
          });
        }
      }
      setTeamMembers(staffList);
      setLoading(false);
    }, (error) => {
      console.error("Error loading team members: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Granular Permissions Matrix Config from secure API
  useEffect(() => {
    const fetchPermissions = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/v1/admin/permissions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to retrieve permissions matrix');
        const data = await res.json();
        
        const matrixMap: Record<string, RolePermissions> = { ...DEFAULT_PERMISSIONS };
        Object.keys(data.permissions).forEach(roleName => {
          const rData = data.permissions[roleName];
          matrixMap[roleName] = {
            user_view: rData.user_view ?? DEFAULT_PERMISSIONS[roleName]?.user_view ?? false,
            user_edit: rData.user_edit ?? DEFAULT_PERMISSIONS[roleName]?.user_edit ?? false,
            user_suspend: rData.user_suspend ?? DEFAULT_PERMISSIONS[roleName]?.user_suspend ?? false,
            user_export: rData.user_export ?? DEFAULT_PERMISSIONS[roleName]?.user_export ?? false,
            doc_view: rData.doc_view ?? DEFAULT_PERMISSIONS[roleName]?.doc_view ?? false,
            doc_create: rData.doc_create ?? DEFAULT_PERMISSIONS[roleName]?.doc_create ?? false,
            doc_edit: rData.doc_edit ?? DEFAULT_PERMISSIONS[roleName]?.doc_edit ?? false,
            doc_publish: rData.doc_publish ?? DEFAULT_PERMISSIONS[roleName]?.doc_publish ?? false,
            doc_archive: rData.doc_archive ?? DEFAULT_PERMISSIONS[roleName]?.doc_archive ?? false,
            pay_view: rData.pay_view ?? DEFAULT_PERMISSIONS[roleName]?.pay_view ?? false,
            pay_refund: rData.pay_refund ?? DEFAULT_PERMISSIONS[roleName]?.pay_refund ?? false,
            pay_export: rData.pay_export ?? DEFAULT_PERMISSIONS[roleName]?.pay_export ?? false,
            support_view: rData.support_view ?? DEFAULT_PERMISSIONS[roleName]?.support_view ?? false,
            support_reply: rData.support_reply ?? DEFAULT_PERMISSIONS[roleName]?.support_reply ?? false,
            support_assign: rData.support_assign ?? DEFAULT_PERMISSIONS[roleName]?.support_assign ?? false,
            view_documents: rData.view_documents ?? DEFAULT_PERMISSIONS[roleName]?.view_documents ?? false,
            edit_cms: rData.edit_cms ?? DEFAULT_PERMISSIONS[roleName]?.edit_cms ?? false,
            CMS: rData.CMS ?? DEFAULT_PERMISSIONS[roleName]?.CMS ?? false,
            Orders: rData.Orders ?? DEFAULT_PERMISSIONS[roleName]?.Orders ?? false
          };
        });
        setRolePermissions(matrixMap);
      } catch (error) {
        console.error("Error loading granular permissions: ", error);
      }
    };

    fetchPermissions();
  }, [currentAdminProfile]);

  // 3. Write Audit Log
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
      console.error("Error logging admin action: ", e);
    }
  };

  // 4. Assign Team Role (Updates Firestore DB)
  const handleAssignRole = async () => {
    setAssignError('');
    setAssignSuccess('');
    if (!assignEmail) {
      setAssignError('Please specify a valid customer email address.');
      return;
    }

    setAssigning(true);
    try {
      // Find the user with that email in Firestore
      const qUsers = query(collection(db, 'users'), where('email', '==', assignEmail.trim().toLowerCase()));
      const snap = await getDocs(qUsers);

      if (snap.empty) {
        // If they don't exist, bootstrap a profile for demonstration
        const mockUid = `usr_gen_${Math.random().toString(36).substring(7)}`;
        const userRef = doc(db, 'users', mockUid);
        await setDoc(userRef, {
          uid: mockUid,
          email: assignEmail.trim().toLowerCase(),
          displayName: assignEmail.split('@')[0],
          role: assignRole,
          status: 'Active',
          createdAt: new Date(),
          lastLogin: new Date()
        });

        const profileRef = doc(db, 'users', mockUid, 'profiles', 'main');
        await setDoc(profileRef, {
          uid: mockUid,
          firstName: assignEmail.split('@')[0],
          lastName: 'Team',
          email: assignEmail.trim().toLowerCase(),
          role: assignRole,
          state: 'Maharashtra',
          createdAt: new Date(),
          ordersCount: 0,
          totalSpent: 0
        });

        await logAdminAction(
          `Provisioned Staff Access for ${assignEmail}`,
          'Role Management',
          {},
          { email: assignEmail, assignedRole: assignRole }
        );

        setAssignSuccess(`New staff profile created and granted "${assignRole}" access!`);
      } else {
        const userDoc = snap.docs[0];
        const uData = userDoc.data();
        
        await updateDoc(doc(db, 'users', userDoc.id), { role: assignRole });
        
        // Also update nested profile
        const profileRef = doc(db, 'users', userDoc.id, 'profiles', 'main');
        await setDoc(profileRef, { role: assignRole }, { merge: true });

        await logAdminAction(
          `Assigned ${assignRole} Role to ${uData.displayName || assignEmail}`,
          'Role Management',
          { previousRole: uData.role || 'User' },
          { assignedRole: assignRole, email: assignEmail }
        );

        setAssignSuccess(`Successfully upgraded ${uData.displayName || assignEmail} to "${assignRole}"!`);
      }

      setAssignEmail('');
      setTimeout(() => {
        setAssignModalOpen(false);
        setAssignSuccess('');
      }, 1500);

    } catch (e) {
      console.error(e);
      setAssignError('Database action failed: ' + String(e));
    } finally {
      setAssigning(false);
    }
  };

  // 5. Revoke Role (Sets back to standard 'User')
  const handleRevokeRole = async (member: StaffMember) => {
    const confirmRevoke = window.confirm(`Are you sure you want to revoke administrative privileges for "${member.name}"? They will be set back to a standard Customer.`);
    if (!confirmRevoke) return;

    try {
      await updateDoc(doc(db, 'users', member.uid), { role: 'User' });
      const profileRef = doc(db, 'users', member.uid, 'profiles', 'main');
      await setDoc(profileRef, { role: 'User' }, { merge: true });

      await logAdminAction(
        `Revoked Admin Access for ${member.name}`,
        'Role Management',
        { revokedRole: member.role },
        { assignedRole: 'User' }
      );

      alert(`Revoked access successfully.`);
    } catch (e) {
      console.error(e);
      alert('Revocation failed: ' + String(e));
    }
  };

  // 6. Save Role Permissions Configuration (Writes to secure backend API)
  const handleSavePermissions = async () => {
    setSavingPermissionRole(selectedPermissionRole);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');
      const token = await currentUser.getIdToken();
      const permissionsToSave = rolePermissions[selectedPermissionRole];

      const response = await fetch('/api/v1/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: selectedPermissionRole,
          permissions: permissionsToSave
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save permissions');
      }

      alert(`Granular permissions configured and saved for "${selectedPermissionRole}"!`);
    } catch (e) {
      console.error("Failed saving permission config: ", e);
      alert("Error saving: " + String(e));
    } finally {
      setSavingPermissionRole(null);
    }
  };

  // Toggle helper for Matrix checkboxes
  const togglePermissionValue = (permissionKey: keyof RolePermissions) => {
    const currentConfig = rolePermissions[selectedPermissionRole];
    const updatedConfig = {
      ...currentConfig,
      [permissionKey]: !currentConfig[permissionKey]
    };

    setRolePermissions({
      ...rolePermissions,
      [selectedPermissionRole]: updatedConfig
    });
  };

  const filteredTeam = teamMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Tab bar header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-[24px] border border-[#E5F5B8] shadow-sm flex-wrap gap-4">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'directory' ? 'bg-[#3C1A47] text-white' : 'bg-transparent text-[#8395A7] hover:bg-[#F1FEC8]/30'}`}
          >
            <Users className="h-4 w-4" />
            Administrative Directory ({teamMembers.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'permissions' ? 'bg-[#3C1A47] text-white' : 'bg-transparent text-[#8395A7] hover:bg-[#F1FEC8]/30'}`}
          >
            <Sliders className="h-4 w-4" />
            Granular Permissions Matrix
          </button>
        </div>

        {activeTab === 'directory' && (
          <button 
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FD1843] hover:bg-[#d61337] text-white rounded-xl transition-all text-sm font-bold shadow-md cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Provision Staff Account
          </button>
        )}
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md bg-white rounded-xl border border-[#E5F5B8] shadow-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
            <input 
              type="text" 
              placeholder="Search team members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#F1FEC8]/10 border-0 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#3C1A47] placeholder:text-[#8395A7] focus:outline-hidden focus:ring-2 focus:ring-[#2B9348]"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#8395A7] text-sm flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-[#2B9348]" />
              Loading team directory...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredTeam.map((member) => (
                <div key={member.uid} className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white text-base ${member.isSuper ? 'bg-[#3C1A47]' : 'bg-[#FD1843]'}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#3C1A47]">{member.name}</div>
                        <div className="text-xs text-[#8395A7] truncate max-w-[180px]">{member.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#2B9348]/10 text-[#2B9348] rounded">
                      {member.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#E5F5B8]">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      member.isSuper ? 'bg-[#3C1A47]/10 text-[#3C1A47]' : 'bg-[#FD1843]/10 text-[#FD1843]'
                    }`}>
                      {member.isSuper ? <ShieldAlert className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                      {member.role}
                    </span>
                    
                    {!member.isSuper && (
                      <button 
                        onClick={() => handleRevokeRole(member)}
                        className="text-[10px] font-extrabold text-red-500 hover:text-red-700 font-mono tracking-wider cursor-pointer hover:underline"
                      >
                        REVOKE ACCESS
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTeam.length === 0 && !loading && (
            <div className="p-12 text-center text-[#8395A7] text-sm">
              No staff members match your search criteria.
            </div>
          )}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Roles Selector Sidebar */}
          <div className="lg:col-span-1 bg-white p-4 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-[#8395A7] px-2 mb-3 tracking-wider">Configure Permissions For:</h3>
            {TEAM_ROLES.filter(r => r !== 'Super Admin').map((role) => (
              <button
                key={role}
                onClick={() => setSelectedPermissionRole(role)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${selectedPermissionRole === role ? 'bg-[#3C1A47] text-white shadow-xs' : 'text-[#3C1A47] hover:bg-[#F1FEC8]/30'}`}
              >
                {role}
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Permissions Matrix grid editor */}
          <div className="lg:col-span-3 bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-[#3C1A47] font-display">Granular Permissions Matrix</h3>
                <p className="text-xs text-[#8395A7]">Modify active modules accessible by accounts assigned to the role "<span className="font-bold text-[#3C1A47]">{selectedPermissionRole}</span>".</p>
              </div>
              
              <button 
                onClick={handleSavePermissions}
                disabled={savingPermissionRole === selectedPermissionRole}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2B9348] hover:bg-[#237a3b] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {savingPermissionRole === selectedPermissionRole ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Config
              </button>
            </div>

            {/* Matrix categories */}
            <div className="space-y-6">
              
              {/* Category A: User Management */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-extrabold text-[#8395A7] uppercase tracking-wider">User Directory & Account Operations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'user_view', label: 'View Profiles' },
                    { key: 'user_edit', label: 'Edit Info & Roles' },
                    { key: 'user_suspend', label: 'Suspend Accounts' },
                    { key: 'user_export', label: 'Export Directories' }
                  ].map(perm => (
                    <label key={perm.key} className="p-3 border border-[#E5F5B8] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#F1FEC8]/10 transition-colors">
                      <span className="text-xs font-bold text-[#3C1A47]">{perm.label}</span>
                      <input 
                        type="checkbox" 
                        checked={rolePermissions[selectedPermissionRole]?.[perm.key as keyof RolePermissions] || false}
                        onChange={() => togglePermissionValue(perm.key as any)}
                        className="h-4 w-4 rounded-sm accent-[#2B9348]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Category B: Document Management */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-extrabold text-[#8395A7] uppercase tracking-wider">Legal Document Management</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { key: 'doc_view', label: 'View Drafts' },
                    { key: 'doc_create', label: 'Create Templates' },
                    { key: 'doc_edit', label: 'Edit Templates' },
                    { key: 'doc_publish', label: 'Publish Templates' },
                    { key: 'doc_archive', label: 'Archive Templates' }
                  ].map(perm => (
                    <label key={perm.key} className="p-3 border border-[#E5F5B8] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#F1FEC8]/10 transition-colors">
                      <span className="text-xs font-bold text-[#3C1A47]">{perm.label}</span>
                      <input 
                        type="checkbox" 
                        checked={rolePermissions[selectedPermissionRole]?.[perm.key as keyof RolePermissions] || false}
                        onChange={() => togglePermissionValue(perm.key as any)}
                        className="h-4 w-4 rounded-sm accent-[#2B9348]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Category C: Billing & Financials */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-extrabold text-[#8395A7] uppercase tracking-wider">Payments & Revenue Accounts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'pay_view', label: 'View Transactions' },
                    { key: 'pay_refund', label: 'Issue refunds' },
                    { key: 'pay_export', label: 'Export Invoices' }
                  ].map(perm => (
                    <label key={perm.key} className="p-3 border border-[#E5F5B8] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#F1FEC8]/10 transition-colors">
                      <span className="text-xs font-bold text-[#3C1A47]">{perm.label}</span>
                      <input 
                        type="checkbox" 
                        checked={rolePermissions[selectedPermissionRole]?.[perm.key as keyof RolePermissions] || false}
                        onChange={() => togglePermissionValue(perm.key as any)}
                        className="h-4 w-4 rounded-sm accent-[#2B9348]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Category D: Support Desk */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-extrabold text-[#8395A7] uppercase tracking-wider">Support Desk Operations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'support_view', label: 'View Tickets' },
                    { key: 'support_reply', label: 'Reply to clients' },
                    { key: 'support_assign', label: 'Assign Executives' }
                  ].map(perm => (
                    <label key={perm.key} className="p-3 border border-[#E5F5B8] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#F1FEC8]/10 transition-colors">
                      <span className="text-xs font-bold text-[#3C1A47]">{perm.label}</span>
                      <input 
                        type="checkbox" 
                        checked={rolePermissions[selectedPermissionRole]?.[perm.key as keyof RolePermissions] || false}
                        onChange={() => togglePermissionValue(perm.key as any)}
                        className="h-4 w-4 rounded-sm accent-[#2B9348]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Category E: CMS & Feature Access */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-extrabold text-[#8395A7] uppercase tracking-wider">CMS & Feature Access</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'view_documents', label: 'View Documents' },
                    { key: 'edit_cms', label: 'Edit CMS & Pages' },
                    { key: 'CMS', label: 'Module Access: CMS' },
                    { key: 'Orders', label: 'Module Access: Orders' }
                  ].map(perm => (
                    <label key={perm.key} className="p-3 border border-[#E5F5B8] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#F1FEC8]/10 transition-colors">
                      <span className="text-xs font-bold text-[#3C1A47]">{perm.label}</span>
                      <input 
                        type="checkbox" 
                        checked={rolePermissions[selectedPermissionRole]?.[perm.key as keyof RolePermissions] || false}
                        onChange={() => togglePermissionValue(perm.key as any)}
                        className="h-4 w-4 rounded-sm accent-[#2B9348]"
                      />
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROVISION TEAM ACCESS */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 bg-[#3C1A47]/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl border-2 border-[#E5F5B8] w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#E5F5B8] flex items-center justify-between bg-[#F1FEC8]/30">
                <h3 className="font-bold font-display text-[#3C1A47] text-lg">Provision Staff Account</h3>
                <button onClick={() => setAssignModalOpen(false)} className="text-[#8395A7] hover:text-[#3C1A47]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                {assignError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {assignError}
                  </div>
                )}

                {assignSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-[#2B9348] text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 animate-bounce" />
                    {assignSuccess}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#3C1A47] ml-1 uppercase tracking-wider">Staff Account Email</label>
                  <input 
                    type="email"
                    value={assignEmail}
                    onChange={e => setAssignEmail(e.target.value)}
                    className="w-full bg-[#F1FEC8]/30 border-2 border-[#E5F5B8] rounded-xl px-4 py-2.5 mt-1 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                    placeholder="name@kartigodraft.com"
                  />
                  <p className="text-[10px] text-[#8395A7] mt-1 ml-1">The system will look up the user by email or bootstrap a new staff credential if not found.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#3C1A47] ml-1 uppercase tracking-wider">Access Authorization Level</label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {TEAM_ROLES.filter(r => r !== 'Super Admin').map(role => (
                      <label 
                        key={role} 
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-[#F1FEC8]/30 transition-colors ${assignRole === role ? 'bg-[#F1FEC8]/40 border-[#2B9348]' : 'border-[#E5F5B8]'}`}
                      >
                        <span className="text-xs font-bold text-[#3C1A47]">{role}</span>
                        <input 
                          type="radio" 
                          name="assigned_role" 
                          checked={assignRole === role}
                          onChange={() => setAssignRole(role)}
                          className="accent-[#2B9348]" 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E5F5B8] flex justify-end gap-3 bg-[#F1FEC8]/10 shrink-0">
                <button 
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#8395A7] hover:text-[#3C1A47] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignRole}
                  disabled={assigning}
                  className="px-6 py-2 bg-[#2B9348] hover:bg-[#237a3b] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {assigning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Assign Privileges
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
