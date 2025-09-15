import React from 'react';

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  height = "h-32", 
  className = "" 
}) => {
  return (
    <div className={`animate-pulse bg-gray-200 ${height} rounded-lg ${className}`}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* KPI 카드 스켈레톤 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} height="h-16" />
        ))}
      </div>
      
      {/* 메인 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} height="h-48" />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;