import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, RotateCcw, FileSearch, Lock, 
  ServerCrash, Hammer, WifiOff, ArrowLeft 
} from 'lucide-react';

// 1. Standalone Page Not Found (404) Component
export function PageNotFound({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-vanilla-secondary/30 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-vanilla-main rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-vanilla-secondary rounded-full -mr-16 -mt-16 opacity-40" />
        
        <div className="h-20 w-20 bg-vanilla-secondary/60 text-[#3C1A47] rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <FileSearch className="h-10 w-10 text-brand-primary" />
        </div>
        
        <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[0.2em]">Error 404</span>
        <h2 className="text-3xl font-bold font-display text-brand-secondary mt-2 mb-4 tracking-tight">Draft Not Found</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-8 font-medium">
          The requested page or document does not exist, or has been moved. Verify the URL or return to your secure customer workspace.
        </p>
        
        <button
          onClick={onBack || (() => window.location.href = '/')}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#3C1A47] text-[#F1FEC8] px-6 py-3.5 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// 2. Standalone Access Denied (403) Component
export function AccessDenied({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-vanilla-secondary/30 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-vanilla-main rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-40" />
        
        <div className="h-20 w-20 bg-red-50 text-red-600 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
          <Lock className="h-10 w-10" />
        </div>
        
        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-[0.2em]">Error 403</span>
        <h2 className="text-3xl font-bold font-display text-brand-secondary mt-2 mb-4 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-8 font-medium">
          You do not have administrative clearance to access this module. If you believe this is an error, verify your credentials or contact support.
        </p>
        
        <button
          onClick={onBack || (() => window.location.href = '/')}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#3C1A47] text-[#F1FEC8] px-6 py-3.5 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

// 3. Standalone Server Error (500) Component
export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="min-h-screen bg-vanilla-secondary/30 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-vanilla-main rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-40" />
        
        <div className="h-20 w-20 bg-amber-50 text-amber-600 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-amber-100">
          <ServerCrash className="h-10 w-10 text-brand-primary" />
        </div>
        
        <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[0.2em]">Error 500</span>
        <h2 className="text-3xl font-bold font-display text-brand-secondary mt-2 mb-4 tracking-tight">Systems Overloaded</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-8 font-medium">
          The Kartigo Document Intelligence engine experienced an internal fault. Rest assured, your drafts are securely backed up. Please try again.
        </p>
        
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#3C1A47] text-[#F1FEC8] px-6 py-3.5 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Reboot Intelligence
        </button>
      </div>
    </div>
  );
}

// 4. Standalone Maintenance Page Component
export function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-vanilla-secondary/30 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-vanilla-main rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F1FEC8]/30 rounded-full -mr-16 -mt-16" />
        
        <div className="h-20 w-20 bg-vanilla-secondary text-brand-primary rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Hammer className="h-10 w-10" />
        </div>
        
        <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[0.2em]">Scheduled Optimization</span>
        <h2 className="text-3xl font-bold font-display text-brand-secondary mt-2 mb-4 tracking-tight">Upgrading Drafting Engine</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-8 font-medium">
          We are deploying a pre-vetted legal model update to enhance NDA and commercial agreement compilation speed. Back online in ~10 minutes.
        </p>
        
        <div className="text-[10px] font-mono font-extrabold text-brand-secondary uppercase tracking-widest bg-vanilla-secondary/50 py-2 rounded-xl border border-vanilla-main">
          Status: COMPILING CLAUSES...
        </div>
      </div>
    </div>
  );
}

// 5. Standalone Offline Page Component
export function OfflineMode({ onRetry }: { onRetry?: () => void }) {
  const [checking, setChecking] = React.useState(false);
  
  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (navigator.onLine) {
        if (onRetry) onRetry();
        else window.location.reload();
      } else {
        alert("Still Offline. Please check your Wi-Fi or mobile data network.");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-vanilla-secondary/30 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-vanilla-main rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-40" />
        
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
          <WifiOff className="h-10 w-10" />
        </div>
        
        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-[0.2em]">Network Disrupted</span>
        <h2 className="text-3xl font-bold font-display text-brand-secondary mt-2 mb-4 tracking-tight">Offline Mode</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-8 font-medium">
          You are currently disconnected from the Internet. Ensure your connection is stable to resume syncing pre-vetted contracts in real-time.
        </p>
        
        <button
          onClick={handleCheck}
          disabled={checking}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#3C1A47] text-[#F1FEC8] px-6 py-3.5 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {checking ? (
            <>
              <span className="h-4 w-4 border-2 border-[#F1FEC8] border-t-transparent rounded-full animate-spin" />
              <span>Verifying Ping...</span>
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              <span>Reconnect & Sync</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// 6. Primary ErrorBoundary Class Component
interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Kartigo ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-vanilla-secondary/30 flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white border border-vanilla-main rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-40" />
            
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold font-display text-brand-secondary mb-3 tracking-tight">Something went wrong</h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-8 font-medium">
              We encountered an unexpected error while trying to compile or load this segment. 
              Our site engineers have been alerted. Your workspace draft remains secure.
            </p>
            
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#3C1A47] text-[#F1FEC8] px-6 py-3.5 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
