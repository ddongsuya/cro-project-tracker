import React from 'react';

interface MagnifyingGlassIconProps {
  className?: string;
}

const MagnifyingGlassIcon: React.FC<MagnifyingGlassIconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
};

export default MagnifyingGlassIcon;