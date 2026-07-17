import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { UserLocation } from '../types';

interface LocationSelectorProps {
  initialLocation?: UserLocation;
  onSave?: (location: UserLocation) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function LocationSelector({ initialLocation, onSave }: LocationSelectorProps) {
  const [location, setLocation] = useState<UserLocation>(() => {
    // Try to load from initialLocation or localStorage
    const saved = localStorage.getItem('kartigo_default_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          country: parsed.country || 'India',
          state: parsed.state || '',
          district: parsed.district || '',
          city: parsed.city || ''
        };
      } catch (e) {
        // ignore
      }
    }
    return initialLocation || {
      country: 'India',
      state: '',
      district: '',
      city: ''
    };
  });

  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  // Auto-save logic
  const triggerAutoSave = (updatedLoc: UserLocation) => {
    localStorage.setItem('kartigo_default_location', JSON.stringify(updatedLoc));
    if (onSave) {
      onSave(updatedLoc);
    }
    setSavedStatus(true);
    const timer = setTimeout(() => setSavedStatus(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleFieldChange = (field: keyof UserLocation, value: string) => {
    const updated = {
      ...location,
      [field]: value
    };
    setLocation(updated);
    // Auto-save if state is selected (since State is the only required field)
    if (field === 'state' && !value) {
      return; // Do not save empty state
    }
    triggerAutoSave(updated);
  };

  return (
    <div className="space-y-4 text-left p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-brand-secondary">Set Document Location</h3>
        {savedStatus && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 animate-fade-in font-mono">
            <CheckCircle2 className="h-3 w-3" /> Auto-saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Country</label>
          <select
            value={location.country || 'India'}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="India">India</option>
            <option value="Other">Other (International)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">State / UT *</label>
          <select
            value={location.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {!location.state && (
            <span className="text-[10px] text-red-500 font-medium block mt-1">State is required for local compliance.</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">District (Optional)</label>
          <input
            type="text"
            value={location.district || ''}
            onChange={(e) => handleFieldChange('district', e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl px-4 py-2.5 text-sm font-medium text-brand-secondary placeholder:text-text-light/40 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">City / Town (Optional)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input
              type="text"
              value={location.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              placeholder="e.g. Bandra"
              className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-brand-secondary placeholder:text-text-light/40 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
