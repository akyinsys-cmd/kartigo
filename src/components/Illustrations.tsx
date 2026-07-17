import React from 'react';
import { motion } from 'motion/react';

const BrandColors = {
  primary: "#FD1843",
  secondary: "#3C1A47",
  background: "#F1FEC8",
  accent1: "#6D28D9", // Purple
  accent2: "#EC4899", // Pink
  accent3: "#3B82F6", // Blue
  accent4: "#06B6D4", // Cyan
  accent5: "#F59E0B", // Orange
  accent6: "#10B981", // Emerald
  accent7: "#EAB308", // Yellow
};

export const HeroIllustration = () => (
  <motion.svg
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full max-w-md mx-auto"
    initial="initial"
    animate="animate"
  >
    {/* Background Decorative Circles */}
    <motion.circle
      cx="250" cy="250" r="150"
      fill={BrandColors.background}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.5 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    
    {/* Floating Document */}
    <motion.g
      initial={{ y: 20 }}
      animate={{ y: -20 }}
      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    >
      <rect x="150" y="100" width="200" height="280" rx="12" fill="white" stroke={BrandColors.secondary} strokeWidth="2" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))' }} />
      <rect x="180" y="140" width="140" height="8" rx="4" fill="#E5E7EB" />
      <rect x="180" y="160" width="140" height="8" rx="4" fill="#E5E7EB" />
      <rect x="180" y="180" width="100" height="8" rx="4" fill="#E5E7EB" />
      
      <rect x="180" y="210" width="140" height="40" rx="4" fill={BrandColors.background} opacity="0.5" />
      <rect x="190" y="225" width="60" height="4" rx="2" fill={BrandColors.secondary} opacity="0.2" />
      <rect x="190" y="235" width="120" height="4" rx="2" fill={BrandColors.secondary} opacity="0.2" />
      
      {/* Signature Animation */}
      <motion.path
        d="M200 340 C 210 330, 230 350, 250 335 C 270 320, 290 345, 310 330"
        stroke={BrandColors.primary}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 3 }}
      />
    </motion.g>

    {/* AI Orbiting Elements */}
    <motion.circle
      cx="400" cy="150" r="30"
      fill={BrandColors.accent1}
      animate={{ 
        y: [0, -10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.path
      d="M390 150 L410 150 M400 140 L400 160"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <motion.rect
      x="80" y="320" width="60" height="60" rx="15"
      fill={BrandColors.accent4}
      animate={{ 
        rotate: [0, 15, 0],
        y: [0, 10, 0]
      }}
      transition={{ duration: 5, repeat: Infinity }}
    />
  </motion.svg>
);

export const SuccessIllustration = () => (
  <motion.svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-48 h-48 mx-auto"
  >
    <motion.circle
      cx="200" cy="200" r="100"
      fill={BrandColors.background}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    />
    <motion.path
      d="M140 200 L185 245 L260 170"
      stroke={BrandColors.accent6}
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    />
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={i}
          cx={200 + 120 * Math.cos(i * Math.PI / 4)}
          cy={200 + 120 * Math.sin(i * Math.PI / 4)}
          r="4"
          fill={BrandColors.accent6}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.g>
  </motion.svg>
);

export const FailureIllustration = () => (
  <motion.svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-48 h-48 mx-auto"
  >
    <motion.circle
      cx="200" cy="200" r="100"
      fill="#FEE2E2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    />
    <motion.path
      d="M150 150 L250 250 M250 150 L150 250"
      stroke="#EF4444"
      strokeWidth="12"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    />
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      {[...Array(6)].map((_, i) => (
        <motion.circle
          key={i}
          cx={200 + 110 * Math.cos(i * Math.PI / 3)}
          cy={200 + 110 * Math.sin(i * Math.PI / 3)}
          r="3"
          fill="#F87171"
          animate={{ x: [0, 5, -5, 0], y: [0, -5, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.g>
  </motion.svg>
);

export const CategoryTechIllustration = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect x="20" y="25" width="60" height="45" rx="4" fill={BrandColors.accent4} opacity="0.2" stroke={BrandColors.accent4} strokeWidth="2"/>
    <path d="M30 40 H70 M30 50 H50" stroke={BrandColors.accent4} strokeWidth="2" strokeLinecap="round"/>
    <rect x="40" y="70" width="20" height="5" fill={BrandColors.secondary}/>
    <rect x="30" y="75" width="40" height="3" fill={BrandColors.secondary}/>
  </svg>
);

export const CategoryLegalIllustration = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect x="20" y="15" width="60" height="70" rx="4" fill="white" stroke={BrandColors.secondary} strokeWidth="2"/>
    <path d="M35 35 H65 M35 45 H65 M35 55 H50" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="70" cy="75" r="15" fill={BrandColors.accent1} />
    <path d="M65 75 L70 80 L75 70" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CategoryHRIllustration = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="50" cy="40" r="15" fill={BrandColors.accent2} />
    <path d="M25 80 C 25 65, 75 65, 75 80" fill={BrandColors.accent2} />
    <rect x="65" y="20" width="20" height="25" rx="2" fill="white" stroke={BrandColors.secondary} strokeWidth="1"/>
    <path d="M70 28 H80 M70 33 H80" stroke="#E5E7EB" strokeWidth="1"/>
  </svg>
);

export const CategoryBusinessIllustration = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect x="15" y="30" width="70" height="50" rx="8" fill={BrandColors.accent3} />
    <path d="M35 30 V20 H65 V30" stroke={BrandColors.secondary} strokeWidth="2"/>
    <circle cx="50" cy="55" r="8" fill="white" opacity="0.3"/>
  </svg>
);

export const LoadingDocument = () => (
  <motion.svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-48 h-48 mx-auto"
  >
    {/* 1. Document Base */}
    <motion.rect
      x="50" y="30" width="100" height="140" rx="8"
      fill="white" stroke={BrandColors.secondary} strokeWidth="2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    />

    {/* 2. Text Lines Appearing */}
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.path
          key={i}
          d={`M70 ${60 + i * 15} H${130 - (i % 2) * 20}`}
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
        />
      ))}
    </motion.g>

    {/* 3. Signature */}
    <motion.path
      d="M70 145 Q85 135 100 145 T130 140"
      stroke={BrandColors.accent3}
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    />

    {/* 4. Stamp */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.3, type: "spring" }}>
      <circle cx="135" cy="140" r="15" fill={BrandColors.primary} opacity="0.1" />
      <circle cx="135" cy="140" r="12" stroke={BrandColors.primary} strokeWidth="1.5" strokeDasharray="2 2" />
    </motion.g>

    {/* 5. Logo Finish */}
    <motion.g initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 3, type: "spring" }}>
      <rect x="90" y="40" width="20" height="20" rx="4" fill={BrandColors.primary} />
      <path d="M96 50 L104 50 M100 46 L100 54" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </motion.g>
  </motion.svg>
);

export const DocumentEmptyStateIllustration = () => (
  <motion.svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-32 h-32 mx-auto"
  >
    <rect x="40" y="40" width="120" height="120" rx="20" fill={BrandColors.background} opacity="0.3" />
    <motion.path
      d="M70 60 H130 M70 80 H130 M70 100 H100"
      stroke={BrandColors.secondary}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.2"
    />
    <motion.circle
      cx="100" cy="110" r="30"
      fill="white"
      stroke={BrandColors.primary}
      strokeWidth="1.5"
      strokeDasharray="4 4"
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
    <motion.path
      d="M100 95 V125 M85 110 H115"
      stroke={BrandColors.primary}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </motion.svg>
);

export const AuthIllustration = () => (
  <motion.svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-24 h-24 mx-auto mb-4"
  >
    <rect x="40" y="60" width="120" height="100" rx="20" fill={BrandColors.background} opacity="0.3" />
    <motion.path
      d="M70 100 H130 M70 120 H130 M70 140 H100"
      stroke={BrandColors.secondary}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.2"
    />
    <motion.circle
      cx="100" cy="50" r="30"
      fill="white"
      stroke={BrandColors.primary}
      strokeWidth="2"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />
    <motion.path
      d="M90 50 L97 57 L110 43"
      stroke={BrandColors.primary}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    />
    <motion.g
      animate={{ 
        y: [0, -5, 0],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M150 80 L165 95 L150 110" stroke={BrandColors.accent3} strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  </motion.svg>
);

export const PurchasedDocsIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.accent3} opacity="0.1" />
    <motion.path
      d="M35 50 L45 60 L65 40"
      stroke={BrandColors.accent3}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
    />
    <rect x="30" y="70" width="40" height="4" rx="2" fill={BrandColors.accent3} opacity="0.2" />
  </motion.svg>
);

export const DraftsIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.accent6} opacity="0.1" />
    <motion.g
      animate={{ 
        rotate: [0, 5, 0],
        x: [0, 2, 0]
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <path d="M40 35 H60 M40 45 H60 M40 55 H50" stroke={BrandColors.accent6} strokeWidth="3" strokeLinecap="round" />
      <path d="M60 65 L70 55" stroke={BrandColors.accent6} strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  </motion.svg>
);

export const ReportsIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.accent5} opacity="0.1" />
    <motion.path
      d="M30 70 V50 M50 70 V30 M70 70 V60"
      stroke={BrandColors.accent5}
      strokeWidth="4"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
    />
  </motion.svg>
);

export const EmptySearchIllustration = () => (
  <motion.svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-32 h-32 mx-auto"
  >
    <circle cx="100" cy="100" r="80" fill={BrandColors.background} opacity="0.3" />
    <motion.g
      animate={{ 
        rotate: [0, 10, -10, 0],
        x: [0, 5, -5, 0]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="70" y="60" width="60" height="80" rx="4" fill="white" stroke={BrandColors.secondary} strokeWidth="2" />
      <path d="M80 80 H120 M80 95 H120 M80 110 H100" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <circle cx="130" cy="130" r="25" fill="white" stroke={BrandColors.primary} strokeWidth="2" />
      <path d="M120 120 L140 140 M140 120 L120 140" stroke={BrandColors.primary} strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  </motion.svg>
);

export const StepSearchIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-12 h-12">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.background} opacity="0.3" />
    <motion.circle cx="45" cy="45" r="15" stroke={BrandColors.primary} strokeWidth="3" />
    <motion.path d="M56 56 L75 75" stroke={BrandColors.primary} strokeWidth="3" strokeLinecap="round" />
  </motion.svg>
);

export const StepFormIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-12 h-12">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.background} opacity="0.3" />
    <motion.path d="M35 40 H65 M35 55 H65 M35 70 H50" stroke={BrandColors.secondary} strokeWidth="2" strokeLinecap="round" />
    <motion.circle cx="70" cy="70" r="12" fill="white" stroke={BrandColors.primary} strokeWidth="2" />
    <motion.path d="M65 70 L68 73 L75 66" stroke={BrandColors.primary} strokeWidth="2" strokeLinecap="round" />
  </motion.svg>
);

export const StepReviewIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-12 h-12">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.background} opacity="0.3" />
    <motion.circle cx="50" cy="50" r="20" stroke={BrandColors.primary} strokeWidth="2" strokeDasharray="4 4" />
    <motion.path d="M40 50 H60 M50 40 V60" stroke={BrandColors.primary} strokeWidth="3" strokeLinecap="round" />
  </motion.svg>
);

export const StepExportIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-12 h-12">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.background} opacity="0.3" />
    <motion.path d="M50 35 V65 M40 55 L50 65 L60 55" stroke={BrandColors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <motion.path d="M30 75 H70" stroke={BrandColors.secondary} strokeWidth="2" strokeLinecap="round" />
  </motion.svg>
);

export const WhyQualityIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.accent1} opacity="0.1" />
    <path d="M35 50 L45 60 L65 40" stroke={BrandColors.accent1} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

export const WhyFastIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.accent2} opacity="0.1" />
    <path d="M40 30 L30 55 H50 L40 80" stroke={BrandColors.accent2} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

export const WhySecureIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.accent3} opacity="0.1" />
    <rect x="35" y="45" width="30" height="25" rx="4" stroke={BrandColors.accent3} strokeWidth="3" />
    <path d="M42 45 V35 A8 8 0 0 1 58 35 V45" stroke={BrandColors.accent3} strokeWidth="3" />
  </motion.svg>
);

export const WhyMobileIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-10 h-10">
    <rect x="30" y="25" width="40" height="55" rx="6" stroke={BrandColors.accent4} strokeWidth="3" />
    <circle cx="50" cy="70" r="2" fill={BrandColors.accent4} />
  </motion.svg>
);

export const HelpIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
    <rect x="20" y="20" width="60" height="60" rx="12" fill={BrandColors.background} opacity="0.3" />
    <motion.path
      d="M50 70 V65 M50 55 C 50 45, 65 45, 65 35 C 65 25, 35 25, 35 35"
      stroke={BrandColors.primary}
      strokeWidth="4"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
    />
    <circle cx="50" cy="75" r="3" fill={BrandColors.primary} />
  </motion.svg>
);

export const SecureBadgeIllustration = () => (
  <motion.svg viewBox="0 0 100 100" fill="none" className="w-5 h-5">
    <motion.path
      d="M50 20 L80 35 V55 C80 75 50 85 50 85 C50 85 20 75 20 55 V35 L50 20Z"
      fill={BrandColors.accent6}
      opacity="0.1"
      stroke={BrandColors.accent6}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
    />
    <motion.path
      d="M35 50 L45 60 L65 40"
      stroke={BrandColors.accent6}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    />
  </motion.svg>
);
