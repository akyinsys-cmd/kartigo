import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Mock Admin Authentication
    setTimeout(() => {
      // In a real app, this would verify via Firebase Auth and check a Custom Claim (role === 'admin')
      // For the sake of UI preview, we allow bypass with dummy credentials or specific admin email
      if (email === 'admin@kartigo.com' || password === 'admin') {
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials. (Try admin@kartigo.com / admin)');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F1FEC8] flex flex-col justify-center items-center p-4 selection:bg-[#3C1A47] selection:text-white">
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-[#3C1A47] hover:bg-[#E5F5B8] px-4 py-2 rounded-full text-sm font-bold transition-colors"
      >
        &larr; Back to Public Site
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 md:p-12 rounded-[32px] shadow-2xl border-2 border-[#E5F5B8]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#3C1A47] text-white p-4 rounded-2xl mb-4 shadow-lg shadow-[#3C1A47]/20">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#3C1A47] text-center">
            Restricted Access
          </h1>
          <p className="text-sm text-[#8395A7] text-center mt-2 font-mono">
            Kartigo Enterprise Control Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold font-mono border border-red-100 flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3C1A47] ml-1 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#F1FEC8]/30 border-2 border-[#E5F5B8] rounded-xl px-4 py-3 text-[#3C1A47] placeholder:text-[#8395A7] focus:outline-hidden focus:border-[#2B9348] focus:bg-white transition-colors"
              placeholder="admin@kartigo.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3C1A47] ml-1 uppercase tracking-wider">Password</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#F1FEC8]/30 border-2 border-[#E5F5B8] rounded-xl px-4 py-3 text-[#3C1A47] placeholder:text-[#8395A7] focus:outline-hidden focus:border-[#2B9348] focus:bg-white transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-[#3C1A47] hover:bg-[#2C1335] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Authenticate <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-[#E5F5B8] pt-6">
           <p className="text-[10px] text-[#8395A7] uppercase font-mono tracking-widest">
             Authorized Personnel Only
           </p>
        </div>
      </motion.div>
    </div>
  );
}
