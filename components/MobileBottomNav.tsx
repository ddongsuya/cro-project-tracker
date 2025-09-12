import React from 'react';

type ViewMode = 'dashboard' | 'team-dashboard' | 'company-dashboard' | 'calendar' | 'projects';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isFirebaseMode: boolean;
  currentUser: any;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  onViewModeChange,
  isFirebaseMode,
  currentUser
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewMode,
      icon: '📊',
      label: '내 대시보드',
      shortLabel: '대시보드'
    },
    ...(isFirebaseMode && currentUser ? [
      {
        id: 'team-dashboard' as ViewMode,
        icon: '👥',
        label: '팀 대시보드',
        shortLabel: '팀'
      },
      {
        id: 'company-dashboard' as ViewMode,
        icon: '🏢',
        label: '전체 대시보드',
        shortLabel: '전체'
      },
      {
        id: 'calendar' as ViewMode,
        icon: '📅',
        label: '일정 관리',
        shortLabel: '일정'
      }
    ] : []),
    {
      id: 'projects' as ViewMode,
      icon: '📋',
      label: '프로젝트 관리',
      shortLabel: '프로젝트'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewModeChange(item.id)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              viewMode === item.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium truncate">{item.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;