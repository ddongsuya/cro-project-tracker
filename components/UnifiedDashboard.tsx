import React, { useState, useMemo } from 'react';
import type { Client } from '../types';
import Dashboard from './Dashboard';
import TeamDashboard from './TeamDashboard';
import CompanyDashboard from './CompanyDashboard';

interface UnifiedDashboardProps {
  clients: Client[];
  currentUser: any;
}

type DashboardTab = 'personal' | 'team' | 'company';

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ clients, currentUser }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('personal');

  const tabs = useMemo(() => [
    {
      id: 'personal' as DashboardTab,
      name: '내 대시보드',
      icon: '👤',
      description: '개인 성과 현황',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'team' as DashboardTab,
      name: '팀 대시보드',
      icon: '👥',
      description: '팀 전체 성과',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'company' as DashboardTab,
      name: '전체 대시보드',
      icon: '🏢',
      description: '회사 전체 현황',
      color: 'from-purple-500 to-violet-500'
    }
  ], []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <Dashboard clients={clients} />;
      case 'team':
        return <TeamDashboard clients={clients} currentUser={currentUser} />;
      case 'company':
        return <CompanyDashboard clients={clients} currentUser={currentUser} />;
      default:
        return <Dashboard clients={clients} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 통합 대시보드 헤더 */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">📊 통합 대시보드</h1>
            <p className="text-slate-600 mt-1">실시간 성과 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">실시간 동기화</span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 bg-slate-50 p-2 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-md'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{tab.name}</div>
                <div className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-slate-500'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="transition-all duration-300 ease-in-out">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UnifiedDashboard;