import React from 'react';

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function LayoutContainer({ children, className = '', id }: LayoutContainerProps) {
  return (
    <div
      id={id || "layout-container"}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
