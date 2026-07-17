import React from 'react';
import { Megaphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCMSContext } from '../context/CMSContext';

interface AdSenseSpaceProps {
  id: string;
  type: 'top-banner' | 'sidebar' | 'in-content' | 'footer';
  className?: string;
  showAdPlaceholders?: boolean;
}

export default function AdSenseSpace({ id, type, className = '', showAdPlaceholders = true }: AdSenseSpaceProps) {
  const { adsenseSettings } = useCMSContext();

  // Determine if this ad should render based on dynamic database settings
  const shouldShowAd = React.useMemo(() => {
    if (!adsenseSettings) return showAdPlaceholders;
    if (adsenseSettings.manualAds === false) return false;
    
    // Check page specific rules or placements
    if (adsenseSettings.positions) {
      if (type === 'top-banner' && !adsenseSettings.positions.homepageBanner) return false;
      if (type === 'sidebar' && !adsenseSettings.positions.blogMiddle) return false;
      if (type === 'in-content' && !adsenseSettings.positions.blogMiddle) return false;
      if (type === 'footer' && !adsenseSettings.positions.blogBottom) return false;
    }
    
    return true;
  }, [adsenseSettings, type, showAdPlaceholders]);

  const publisherId = adsenseSettings?.publisherId || 'ca-pub-XXXXXXXXXXXXXXXX';

  // Define standard sizes based on ad types
  const getSpecs = () => {
    switch (type) {
      case 'top-banner':
        return {
          dimensions: 'Leaderboard (728 × 90 px or fluid)',
          description: 'Top page banner above-the-fold. High CTR placement.',
          minHeight: 'h-24 md:h-28',
          maxWidth: 'max-w-4xl'
        };
      case 'sidebar':
        return {
          dimensions: 'Medium Rectangle (300 × 250 px)',
          description: 'Sidebar sticky box. Perfect for desktop viewports.',
          minHeight: 'h-[250px] w-full max-w-[300px]',
          maxWidth: 'max-w-[300px]'
        };
      case 'in-content':
        return {
          dimensions: 'Flexible Feed Banner (Fluid x 120px)',
          description: 'In-content article/section separator. Seamlessly blended.',
          minHeight: 'h-28 md:h-32',
          maxWidth: 'max-w-3xl'
        };
      case 'footer':
        return {
          dimensions: 'Large Leaderboard (970 × 90 px or fluid)',
          description: 'Above-footer exit-intent ad block.',
          minHeight: 'h-24 md:h-28',
          maxWidth: 'max-w-5xl'
        };
    }
  };

  const specs = getSpecs();

  return (
    <AnimatePresence>
      {shouldShowAd && (
        <motion.div
          id={id}
          initial={{ opacity: 0, scale: 0.95, y: -15, height: 0, marginTop: 0, marginBottom: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, height: 'auto', marginTop: 24, marginBottom: 24 }}
          exit={{ opacity: 0, scale: 0.95, y: -15, height: 0, marginTop: 0, marginBottom: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`mx-auto px-4 py-3 rounded-[20px] border-2 border-dashed border-vanilla-main bg-vanilla-alt/40 text-text-light flex flex-col justify-center items-center text-center transition-colors duration-300 hover:border-brand-primary/40 hover:bg-brand-primary/5 overflow-hidden ${specs.minHeight} ${specs.maxWidth} ${className}`}
        >
          {/* Small, subtle descriptive label for UX and transparency */}
          <div className="mb-2 text-[10px] font-bold text-brand-primary/80 uppercase tracking-wider bg-brand-primary/5 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-brand-primary/10">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
            Sponsored Advertisement
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-vanilla-main text-brand-secondary text-[10px] font-bold">
              AD
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-secondary font-mono">
              Google AdSense Reserved Space
            </span>
          </div>
          
          <p className="text-[11px] font-mono font-medium text-text-secondary">
            Placement: <span className="text-brand-secondary font-semibold">{type}</span> | Specs: {specs.dimensions}
          </p>
          
          <div className="hidden md:flex items-center gap-1.5 mt-1.5 text-[10px] text-text-light font-sans">
            <Info className="h-3.5 w-3.5" />
            <span>{specs.description}</span>
          </div>

          <div className="text-[9px] text-text-light mt-1 uppercase tracking-widest font-mono">
            {publisherId} / slot-{id}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

