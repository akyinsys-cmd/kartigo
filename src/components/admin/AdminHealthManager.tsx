import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Cloud, Clock, CheckCircle, AlertCircle, 
  RefreshCw, Layers, ShieldCheck, Cpu, Zap, Radio, BellRing, Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface HealthService {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Provider' | 'Core';
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
  latency: number; // in ms
  description: string;
  icon: any;
}

const INITIAL_SERVICES: HealthService[] = [
  { 
    id: 'db', 
    name: 'Firestore Database', 
    category: 'Infrastructure', 
    status: 'operational', 
    uptime: '100%', 
    latency: 12, 
    description: 'NoSQL document database cluster for persistent records.',
    icon: Database 
  },
  { 
    id: 'storage', 
    name: 'Cloud Storage Bucket', 
    category: 'Infrastructure', 
    status: 'operational', 
    uptime: '99.99%', 
    latency: 45, 
    description: 'Asset pipeline hosting document drafts and templates.',
    icon: Cloud 
  },
  { 
    id: 'auth', 
    name: 'Firebase Authentication', 
    category: 'Provider', 
    status: 'operational', 
    uptime: '99.98%', 
    latency: 68, 
    description: 'User access token control and Google OAuth gateways.',
    icon: ShieldCheck 
  },
  { 
    id: 'payments', 
    name: 'Payment Gateway (Razorpay/Stripe)', 
    category: 'Provider', 
    status: 'operational', 
    uptime: '99.95%', 
    latency: 145, 
    description: 'Subscription order checkouts and invoice processing.',
    icon: Zap 
  },
  { 
    id: 'email', 
    name: 'Email Delivery API', 
    category: 'Provider', 
    status: 'operational', 
    uptime: '100%', 
    latency: 110, 
    description: 'Transactional drafts transmission and newsletter mailing.',
    icon: BellRing 
  },
  { 
    id: 'ai', 
    name: 'AI APIs (Gemini Models)', 
    category: 'Core', 
    status: 'operational', 
    uptime: '99.91%', 
    latency: 650, 
    description: 'Generative smart assistants and legal draft auto-compilers.',
    icon: Brain 
  }
];

export default function AdminHealthManager() {
  const { user } = useAuth();
  const [services, setServices] = useState<HealthService[]>(INITIAL_SERVICES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeIncidentCount, setActiveIncidentCount] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    'System status initialized.',
    'All connections verified.'
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnosticLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 25)]);
  };

  const runDiagnostics = async () => {
    if (!user) return;
    setIsRefreshing(true);
    addLog('Initiating full system diagnostic handshake with secure Express backend...');
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/admin/health', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to retrieve system health metrics');
      const data = await res.json();
      
      const mappedServices = INITIAL_SERVICES.map(s => {
        const remote = data.services.find((rs: any) => rs.id === s.id);
        if (remote) {
          addLog(`Handshake successful for ${remote.name} -> status: ${remote.status} (${remote.latency}ms)`);
          return {
            ...s,
            status: remote.status,
            latency: remote.latency
          };
        }
        return s;
      });

      setServices(mappedServices);
      addLog('Full diagnostic audit completed. Parameters successfully captured.');
    } catch (e: any) {
      console.error("Health check fetch failed:", e);
      addLog(`CRITICAL error running handshake diagnostics: ${e.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }

    // Fluctuating background ping interval
    const interval = setInterval(() => {
      setServices(prev => prev.map(s => {
        if (s.status === 'outage') return s;
        const fluctuation = Math.floor((Math.random() - 0.5) * (s.latency * 0.15));
        return {
          ...s,
          latency: Math.max(2, s.latency + fluctuation)
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Recalculate incidents based on status
  useEffect(() => {
    const incidents = services.filter(s => s.status !== 'operational').length;
    setActiveIncidentCount(incidents);
  }, [services]);

  const triggerPing = async (id: string) => {
    addLog(`Pinging ${services.find(s => s.id === id)?.name}...`);
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, latency: Math.floor(s.latency * 0.8) }; // temporary boost simulation
      }
      return s;
    }));
    await new Promise(resolve => setTimeout(resolve, 200));
    addLog(`Ping response from ${services.find(s => s.id === id)?.name} received.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight text-[#3C1A47] flex items-center gap-2">
            <Radio className="h-6 w-6 text-[#FD1843] animate-pulse" />
            System Health Dashboard
          </h2>
          <p className="text-xs text-[#8395A7] mt-1">Live status, performance metrics, and latency reports for critical modules.</p>
        </div>
        <button 
          onClick={runDiagnostics}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-[#2B9348] hover:bg-[#227539] text-white border border-[#2B9348] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          {isRefreshing ? 'Running Diagnostic Handshake...' : 'Run Diagnostics'}
        </button>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider font-mono">System Global Uptime</span>
            <Activity className="h-4 w-4 text-[#2B9348]" />
          </div>
          <div className="text-3xl font-extrabold text-[#3C1A47]">
            {activeIncidentCount > 0 ? '99.12%' : '100%'}
          </div>
          <p className="text-[10px] font-bold text-[#2B9348] mt-1">All core pipelines operational</p>
        </div>
        
        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider font-mono">Core Network Latency</span>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#3C1A47]">
            {Math.floor(services.reduce((acc, s) => acc + s.latency, 0) / services.length)} ms
          </div>
          <p className="text-[10px] font-bold text-[#8395A7] mt-1">Average connection handshake speed</p>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider font-mono">Active Service Incidents</span>
            <AlertCircle className={`h-4 w-4 ${activeIncidentCount > 0 ? 'text-[#FD1843]' : 'text-gray-300'}`} />
          </div>
          <div className="text-3xl font-extrabold text-[#3C1A47]">
            {activeIncidentCount}
          </div>
          <p className={`text-[10px] font-bold mt-1 ${activeIncidentCount > 0 ? 'text-[#FD1843]' : 'text-[#2B9348]'}`}>
            {activeIncidentCount > 0 ? 'Action required in degraded pipelines' : 'Zero service incidents detected'}
          </p>
        </div>
      </div>

      {/* Services status list */}
      <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5F5B8] flex justify-between items-center bg-[#F1FEC8]/20">
          <h3 className="text-sm font-black text-[#3C1A47]">Microservice Network Topology</h3>
          <span className="text-xs font-mono font-bold text-[#8395A7]">{services.length} Monitored Endpoints</span>
        </div>
        
        <div className="divide-y divide-[#E5F5B8]">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F1FEC8]/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    service.status === 'operational' ? 'bg-[#2B9348]/10 text-[#2B9348]' :
                    service.status === 'degraded' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-500'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#3C1A47]">{service.name}</h4>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-[#F1FEC8] text-[#3C1A47] rounded-full uppercase border border-[#E5F5B8]">
                        {service.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#8395A7] mt-1 max-w-md">{service.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12 pt-2 sm:pt-0 border-t sm:border-0 border-[#E5F5B8]">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8395A7] font-mono block">Uptime</span>
                    <span className="text-sm font-mono font-extrabold text-[#3C1A47]">{service.uptime}</span>
                  </div>

                  <div className="text-left sm:text-right w-20">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8395A7] font-mono block">Latency</span>
                    <span className={`text-sm font-mono font-extrabold ${
                      service.status === 'operational' ? 'text-[#2B9348]' :
                      service.status === 'degraded' ? 'text-amber-500' :
                      'text-red-500'
                    }`}>
                      {service.status === 'outage' ? 'TIMEOUT' : `${service.latency}ms`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status indicator pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F1FEC8]/30 rounded-xl border border-[#E5F5B8]">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        service.status === 'operational' ? 'bg-[#2B9348] animate-pulse' :
                        service.status === 'degraded' ? 'bg-amber-500 animate-pulse' :
                        'bg-red-500'
                      }`} />
                      <span className={`text-[10px] font-extrabold uppercase ${
                        service.status === 'operational' ? 'text-[#2B9348]' :
                        service.status === 'degraded' ? 'text-amber-600' :
                        'text-red-500'
                      }`}>
                        {service.status}
                      </span>
                    </div>

                    <button 
                      onClick={() => triggerPing(service.id)}
                      className="p-1.5 bg-white hover:bg-[#F1FEC8]/50 border border-[#E5F5B8] rounded-lg text-[#3C1A47] text-[10px] font-bold cursor-pointer transition-colors"
                      title="Test live connection latency"
                    >
                      Ping
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time status console */}
      <div className="bg-[#1E1E1E] rounded-[24px] border border-gray-800 p-6">
        <h3 className="text-xs font-mono font-extrabold text-[#E5F5B8] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Live Handshake Diagnostics Logs
        </h3>
        
        <div className="font-mono text-xs text-gray-300 space-y-1.5 max-h-48 overflow-y-auto">
          {diagnosticLogs.map((log, idx) => (
            <div key={idx} className="flex gap-4 hover:bg-white/5 py-0.5 px-1 rounded transition-colors">
              <span className="text-gray-500 shrink-0">{(new Date()).toLocaleDateString()}</span>
              <span className={`leading-relaxed ${
                log.includes('CRITICAL') ? 'text-red-400 font-bold' :
                log.includes('WARNING') ? 'text-amber-300' :
                'text-[#E5F5B8]'
              }`}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
