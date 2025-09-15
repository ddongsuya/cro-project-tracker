import React from 'react';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  headerColor?: string;
  showHeader?: boolean;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  icon,
  children,
  headerColor = 'from-blue-500 to-indigo-500',
  showHeader = false,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 선택적 헤더 */}
      {showHeader && title && (
        <div className={`bg-gradient-to-r ${headerColor} text-white p-6 rounded-2xl shadow-lg`}>
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 bg-white/20 rounded-xl">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-white/80 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">실시간 동기화</span>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;