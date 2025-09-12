import React from 'react';

interface PrinterIconProps {
  className?: string;
}

const PrinterIcon: React.FC<PrinterIconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.32 0H6.34m11.32 0l1.836-1.836a.75.75 0 000-1.061l-1.54-1.54a.75.75 0 00-.53-.22H15V8.25A2.25 2.25 0 0012.75 6h-1.5A2.25 2.25 0 009 8.25V15h-1.086a.75.75 0 00-.53.22l-1.54 1.54a.75.75 0 000 1.061L7.68 18.164z" />
    </svg>
  );
};

export default PrinterIcon;