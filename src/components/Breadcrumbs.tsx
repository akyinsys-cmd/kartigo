import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onBackHome?: () => void;
}

export default function Breadcrumbs({ items, onBackHome }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest text-[#3C1A47] overflow-x-auto whitespace-nowrap pb-2 no-print">
      {onBackHome && (
        <>
          <button 
            onClick={onBackHome} 
            className="hover:opacity-70 transition-opacity flex items-center gap-1.5 focus:outline-hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </button>
          {items.length > 0 && <span className="opacity-30 mx-1">/</span>}
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.onClick && !isLast && !item.isActive ? (
              <button 
                onClick={item.onClick}
                className="opacity-70 cursor-pointer hover:opacity-100 transition-opacity focus:outline-hidden"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast || item.isActive ? "truncate" : "opacity-70"}>
                {item.label}
              </span>
            )}
            
            {!isLast && <span className="opacity-30 mx-1">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
