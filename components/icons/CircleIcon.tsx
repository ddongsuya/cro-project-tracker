
import React from 'react';

const CircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
);

export default CircleIcon;
