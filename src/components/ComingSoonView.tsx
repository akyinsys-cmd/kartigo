import React from 'react';
import { motion } from 'motion/react';
import { Construction, Bell, ArrowLeft, Search, Sparkles } from 'lucide-react';
import LayoutContainer from './LayoutContainer';

interface ComingSoonViewProps {
  onBack: () => void;
  onBrowseAvailable: () => void;
}

export default function ComingSoonView({ onBack, onBrowseAvailable }: ComingSoonViewProps) {
  return (
    <div className="bg-vanilla-secondary min-h-screen flex items-center justify-center pt-20 pb-12">
      <LayoutContainer>
        <div className="max-w-2xl mx-auto text-center space-y-12">
          {/* Animated Illustration */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 w-48 h-48 bg-white rounded-[40px] shadow-2xl border-4 border-vanilla-main mx-auto flex items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Construction className="w-24 h-24 text-brand-primary" />
              </motion.div>
              
              {/* Construction tape animation */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-8 bg-amber-400 rotate-[-12deg] flex items-center justify-center overflow-hidden border-y border-amber-500 shadow-lg">
                 <div className="flex gap-4 animate-marquee whitespace-nowrap">
                    {[...Array(10)].map((_, i) => (
                      <span key={i} className="text-[10px] font-black text-amber-900 uppercase tracking-tighter italic">Coming Soon • Coming Soon • </span>
                    ))}
                 </div>
              </div>
            </motion.div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/5 blur-3xl rounded-full -z-1" />
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold text-brand-secondary font-display"
            >
              Coming Soon
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-text-secondary font-medium max-w-md mx-auto leading-relaxed"
            >
              We're working on this category and it will be available soon. Our legal experts are curating professional templates for you.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => alert("We'll notify you when this category is available!")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
            >
              <Bell className="w-5 h-5" />
              Notify Me
            </button>
            <button
              onClick={onBrowseAvailable}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-brand-secondary border-2 border-vanilla-main px-8 py-4 rounded-2xl font-bold hover:bg-vanilla-secondary transition-all"
            >
              <Search className="w-5 h-5" />
              Browse Available Documents
            </button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-text-light hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
        </div>
      </LayoutContainer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}} />
    </div>
  );
}
