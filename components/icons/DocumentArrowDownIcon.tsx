import React from 'react';

interface DocumentArrowDownIconProps {
  className?: string;
}

const DocumentArrowDownIcon: React.FC<DocumentArrowDownIconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  );
};

export default DocumentArrowDownIcon;