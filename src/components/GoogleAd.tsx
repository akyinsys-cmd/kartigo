import React from 'react';

interface GoogleAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

export default function GoogleAd({ slot, format = 'auto', className = '', style }: GoogleAdProps) {
  // In a real scenario, this would load the AdSense script
  // and initialize the ad. For now, we provide a placeholder
  // that follows AdSense best practices.
  
  return (
    <div className={`ad-container my-8 flex flex-col items-center justify-center ${className}`}>
      <div className="text-[10px] text-text-light uppercase tracking-widest mb-2">Advertisement</div>
      <div 
        className="bg-vanilla-secondary/50 border border-vanilla-main rounded-xl flex items-center justify-center overflow-hidden"
        style={{ 
          minHeight: '100px', 
          width: '100%',
          maxWidth: format === 'rectangle' ? '336px' : '728px',
          height: format === 'rectangle' ? '280px' : 'auto',
          ...style 
        }}
      >
        <div className="text-sm text-text-secondary font-medium italic opacity-50">
          Ad Slot: {slot}
        </div>
      </div>
      {/* 
        Real implementation:
        <ins className="adsbygoogle"
             style={{ display: 'block', ...style }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot={slot}
             data-ad-format={format}
             data-full-width-responsive="true"></ins>
        <script>
             (window.adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      */}
    </div>
  );
}
