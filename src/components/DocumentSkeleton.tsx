import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function DocumentSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm h-80 bg-white rounded-[24px] shadow-2xl border border-vanilla-main p-8 relative overflow-hidden"
      >
        {/* Shimmer effect overlay */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 z-10 bg-linear-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] w-1/2"
        />

        <div className="space-y-6 mt-4">
          {/* Header Skeleton */}
          <div className="space-y-3 pb-6 border-b border-vanilla-main/50">
            <div className="h-4 bg-vanilla-main rounded-md w-3/4 overflow-hidden relative" />
            <div className="h-3 bg-vanilla-main rounded-md w-1/2 overflow-hidden relative" />
          </div>

          {/* Body Lines Skeleton */}
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2.5 bg-vanilla-main rounded-sm overflow-hidden relative ${
                  i === 4 ? 'w-2/3' : 'w-full'
                }`}
              />
            ))}
          </div>
          
          <div className="space-y-4 pt-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-2.5 bg-vanilla-main rounded-sm overflow-hidden relative ${
                  i === 1 ? 'w-4/5' : 'w-full'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer/Watermark */}
        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end border-t border-vanilla-main/50 pt-4">
          <span className="text-[9px] font-mono text-text-light/50 font-bold flex items-center gap-1.5 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Processing
          </span>
          <div className="w-16 h-10 bg-vanilla-main/50 rounded-lg rounded-br-3xl" />
        </div>
      </motion.div>
    </div>
  );
}
