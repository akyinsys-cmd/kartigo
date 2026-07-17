import React from 'react';
import { motion } from 'motion/react';
import { Edit3, CheckCircle } from 'lucide-react';

interface KartigoLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function KartigoLoader({ text = "Loading Kartigo Engine...", size = "md" }: KartigoLoaderProps) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const containerClasses = isLarge 
    ? "w-40 h-52 p-5" 
    : isSmall 
      ? "w-16 h-20 p-2" 
      : "w-28 h-36 p-3.5";

  const spacingClasses = isLarge ? "space-y-3 mt-4" : isSmall ? "space-y-1 mt-1" : "space-y-2 mt-2";
  const lineHeights = isLarge ? "h-2" : isSmall ? "h-0.5" : "h-1";
  
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex flex-col items-center">
        {/* Paper Background */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`${containerClasses} bg-white rounded-xl shadow-xl border border-vanilla-main relative overflow-hidden`}
        >
          {/* Text Lines */}
          <div className={spacingClasses}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 1.5
                }}
                className={`${lineHeights} bg-vanilla-alt rounded-xs w-full origin-left`}
              />
            ))}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.4,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1.5
              }}
              className={`${lineHeights} bg-vanilla-alt rounded-xs w-2/3 origin-left`}
            />
          </div>

          {/* Signature Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className={`absolute ${isLarge ? 'bottom-8 right-5 w-16' : isSmall ? 'bottom-2 right-2 w-6' : 'bottom-6 right-3.5 w-10'} h-px bg-brand-secondary/30`}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className={`absolute ${isLarge ? 'bottom-8.5 right-6 text-brand-primary' : isSmall ? 'bottom-2.5 right-2 text-brand-primary scale-75' : 'bottom-6.5 right-4 text-brand-primary scale-90'}`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </motion.div>

          {/* Stamp */}
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 0.8, rotate: -10 }}
            transition={{ 
              type: 'spring', 
              damping: 10, 
              stiffness: 150, 
              delay: 0.9,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className={`absolute ${isLarge ? 'top-6 right-3 w-10 h-10' : isSmall ? 'top-2 right-1 w-4 h-4' : 'top-4 right-2 w-7 h-7'} border-2 border-brand-primary rounded-full flex items-center justify-center text-brand-primary rotate-12`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </motion.div>
        </motion.div>

        {/* Text */}
        {text && (
          <p className="mt-4 text-xs font-mono font-bold text-brand-secondary uppercase tracking-[0.15em] animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
