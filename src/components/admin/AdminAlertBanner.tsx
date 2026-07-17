import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
  title?: string;
}

export default function AdminAlertBanner() {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  useEffect(() => {
    // Simulate real-time alerts
    const initialAlerts: AlertMessage[] = [
      { id: '1', type: 'error', title: 'Payment Gateway Issue', message: 'High failure rate detected on Stripe gateway.' },
      { id: '2', type: 'warning', title: 'Traffic Spike', message: 'Unusual spike in active users detected in the last 5 minutes.' }
    ];
    
    setAlerts(initialAlerts);

    const timer = setTimeout(() => {
      setAlerts(prev => [...prev, { id: Date.now().toString(), type: 'info', title: 'Backup Complete', message: 'Daily database backup completed successfully.' }]);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`pointer-events-auto p-4 rounded-[16px] shadow-lg border animate-in slide-in-from-right-4 fade-in duration-300 flex items-start gap-3
            ${alert.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : ''}
            ${alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
            ${alert.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            ${alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
          `}
        >
          <div className="shrink-0 mt-0.5">
            {alert.type === 'error' && <ShieldAlert className="h-5 w-5 text-rose-600" />}
            {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
            {alert.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
            {alert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          </div>
          <div className="flex-1">
            {alert.title && <h4 className="text-sm font-bold mb-0.5">{alert.title}</h4>}
            <p className="text-xs opacity-90">{alert.message}</p>
          </div>
          <button 
            onClick={() => removeAlert(alert.id)}
            className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
