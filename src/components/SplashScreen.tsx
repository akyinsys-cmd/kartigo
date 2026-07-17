import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Edit3, CheckCircle } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-vanilla-main"
    >
      <div className="relative flex flex-col items-center">
        {/* Paper Background */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-48 h-64 bg-white rounded-lg shadow-xl border border-vanilla-secondary p-6 relative overflow-hidden"
          style={{ perspective: 1000 }}
        >
          {/* Text Lines */}
          <div className="space-y-3 mt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                className="h-2 bg-vanilla-alt rounded-sm w-full origin-left"
              />
            ))}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
              className="h-2 bg-vanilla-alt rounded-sm w-2/3 origin-left"
            />
          </div>

          {/* Signature Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="absolute bottom-10 right-6 w-16 h-px bg-brand-secondary"
          />
          <motion.div
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute bottom-11 right-8 text-brand-primary"
          >
            <Edit3 className="w-5 h-5" />
          </motion.div>

          {/* Stamp */}
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 0.8, rotate: -10 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 1.8 }}
            className="absolute top-8 right-4 w-12 h-12 border-2 border-brand-primary rounded-full flex items-center justify-center text-brand-primary rotate-12"
          >
            <CheckCircle className="w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Logo fade in */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.0 }}
          className="mt-8 text-center"
        >
          <h1 className="text-2xl font-bold text-brand-secondary tracking-tight">Kartigo Draft</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-light mt-1">An AKYIN Ventures Product</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
