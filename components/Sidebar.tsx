import React, { useState } from 'react';
import type { Client } from '../types';

interface SidebarProps {
  clients: Client[];
  currentUser: any;
  onMenuSelect: (menu: string, submenu?: string) => void;
  selectedMenu: string;
  selectedSubmenu?: string;
}

interface MenuGroup {
  id: string;
  title: string;
  icon: string;
  items?: {
    id: string;
    title: string;
    icon: string;
    count?: number;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  clients, 
  currentUser, 
  onMenuSelect, 
  selectedMenu, 
  selectedSubmenu 
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['my-projects', 'dashboard']);

  // 프로젝트 상태별 카운트 계산
  const getProjectCounts = () => {
    const allProjects = clients.flatMap(c => c.requesters.flatMap(r => r.projects));
    
    const quotedProjects = allProjects.filter(p => {
      const quotedStage = p.stages.find(s => s.name === '견적서 송부');
      return quotedStage?.status === '완료';
    });
    
    const contractedProjects = allProjects.filter(p => {
      const contractStage = p.stages.find(s => s.name === '계약 체결');
      return contractStage?.status === '완료';
    });
    
    const completedProjects = allProjects.filter(p => {
      const completedStages = p.stages.filter(s => s.status === '완료').length;
      return completedStages === p.stages.length;
    });

    return {
      quoted: quotedProjects.length,
      contracted: contractedProjects.length,
      completed: completedProjects.length,
      total: allProjects.length
    };
  };

  const projectCounts = getProjectCounts();

  const menuGroups: MenuGroup[] = [
    {
      id: 'my-projects',
      title: '내 프로젝트',
      icon: '📋',
      items: [
        {
          id: 'quoted',
          title: '견적서 송부 완료',
          icon: '📤',
          count: projectCounts.quoted
        },
        {
          id: 'contracted',
          title: '계약 체결 완료',
          icon: '✅',
          count: projectCounts.contracted
        },
        {
          id: 'completed',
          title: '프로젝트 완료',
          icon: '🏁',
          count: projectCounts.completed
        }
      ]
    },
    {
      id: 'dashboard',
      title: '대시보드',
      icon: '📊',
      items: [
        {
          id: 'personal',
          title: '내 대시보드',
          icon: '🏠'
        },
        {
          id: 'team',
          title: '팀 대시보드',
          icon: '👥'
        },
        {
          id: 'company',
          title: '전체 대시보드',
          icon: '🏢'
        }
      ]
    },
    {
      id: 'clients',
      title: '고객 관리',
      icon: '👥',
      items: [
        {
          id: 'all',
          title: '전체 고객사',
          icon: '📋',
          count: clients.length
        },
        {
          id: 'add',
          title: '신규 고객사 등록',
          icon: '➕'
        },
        {
          id: 'search',
          title: '고객사 검색',
          icon: '🔍'
        }
      ]
    },
    {
      id: 'schedule',
      title: '일정 관리',
      icon: '📅',
      items: [
        {
          id: 'my',
          title: '내 일정',
          icon: '📅'
        },
        {
          id: 'team',
          title: '팀 일정',
          icon: '👥'
        },
        {
          id: 'deadlines',
          title: '마감일 관리',
          icon: '⏰'
        }
      ]
    },
    {
      id: 'analytics',
      title: '분석 & 리포트',
      icon: '📈',
      items: [
        {
          id: 'sales',
          title: '매출 분석',
          icon: '📊'
        },
        {
          id: 'reports',
          title: '프로젝트 리포트',
          icon: '📋'
        },
        {
          id: 'export',
          title: 'PDF 출력',
          icon: '🖨️'
        }
      ]
    },
    {
      id: 'settings',
      title: '설정',
      icon: '⚙️',
      items: [
        {
          id: 'profile',
          title: '내 프로필',
          icon: '👤'
        },
        {
          id: 'system',
          title: '시스템 설정',
          icon: '🔧'
        },
        {
          id: 'data',
          title: '데이터 관리',
          icon: '💾'
        }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleMenuClick = (groupId: string, itemId?: string) => {
    if (itemId) {
      onMenuSelect(groupId, itemId);
    } else {
      toggleGroup(groupId);
    }
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-slate-200/60 flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div className="relative z-10">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            Corestemchemon
          </h1>
          <p className="text-blue-100 text-sm mt-1 font-medium">CRO Management System</p>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      </div>

      {/* 메뉴 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-2">
            {/* 그룹 헤더 */}
            <button
              onClick={() => handleMenuClick(group.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-slate-100 ${
                selectedMenu === group.id ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{group.icon}</span>
                <span className="font-semibold text-slate-700">{group.title}</span>
              </div>
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  expandedGroups.includes(group.id) ? 'rotate-90' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 서브 메뉴 */}
            {expandedGroups.includes(group.id) && group.items && (
              <div className="ml-4 mt-2 space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(group.id, item.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-slate-50 ${
                      selectedMenu === group.id && selectedSubmenu === item.id 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedMenu === group.id && selectedSubmenu === item.id
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 사용자 정보 */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">
              {currentUser?.email || '사용자'}
            </div>
            <div className="text-xs text-slate-500">온라인</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;