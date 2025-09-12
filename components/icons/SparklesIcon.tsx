import React from 'react';

interface SparklesIconProps {
  className?: string;
}

const SparklesIcon: React.FC<SparklesIconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6l-1.5-1.5L5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 8l2 2-2 2-2-2 2-2zM5 17l1.5 1.5L5 20l-1.5-1.5L5 17zM19 17l1.5 1.5L19 20l-1.5-1.5L19 17z" />
    </svg>
  );
};

export default SparklesIcon;