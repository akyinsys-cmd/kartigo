import React, { useState } from 'react';
import { Building2, MapPin, Hash, UserCheck, Save } from 'lucide-react';
import { BusinessProfile as BusinessProfileType } from '../types';

interface BusinessProfileProps {
  initialProfile?: BusinessProfileType;
  onSave?: (profile: BusinessProfileType) => void;
}

export default function BusinessProfile({ initialProfile, onSave }: BusinessProfileProps) {
  const [profile, setProfile] = useState<BusinessProfileType>(initialProfile || {
    companyName: '',
    address: '',
    gstId: '',
    authorizedSignatory: ''
  });

  const handleSave = () => {
    if (!profile.companyName || !profile.address || !profile.authorizedSignatory) {
      alert("Please fill in Company Name, Address, and Authorized Signatory.");
      return;
    }
    if (onSave) {
      onSave(profile);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Company Name</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
          <input
            type="text"
            value={profile.companyName}
            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
            placeholder="e.g. Kartigo Solutions Pvt Ltd"
            className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-secondary placeholder:text-text-light/50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Registered Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-text-light" />
          <textarea
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="e.g. 123 Business Hub, MG Road, Mumbai 400001"
            rows={3}
            className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-secondary placeholder:text-text-light/50 focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">GST / Tax ID (Optional)</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input
              type="text"
              value={profile.gstId || ''}
              onChange={(e) => setProfile({ ...profile, gstId: e.target.value })}
              placeholder="e.g. 27AAAAA0000A1Z5"
              className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-secondary placeholder:text-text-light/50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Authorized Signatory</label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input
              type="text"
              value={profile.authorizedSignatory}
              onChange={(e) => setProfile({ ...profile, authorizedSignatory: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-secondary placeholder:text-text-light/50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-2 py-3 bg-[#3C1A47] text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save Business Profile
      </button>
    </div>
  );
}
