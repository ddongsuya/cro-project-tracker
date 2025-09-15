import React, { useMemo, useCallback } from 'react';
import type { Client } from '../types';
import ChartBarIcon from './icons/ChartBarIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import UserGroupIcon from './icons/UserGroupIcon';

interface DashboardProps {
  clients: Client[];
}

const Dashboard = React.memo<DashboardProps>(({ clients }) => {
  
  const calculateDashboardData = () => {
    const allProjects = clients.flatMap(c => c.requesters.flatMap(r => r.projects));
    
    // 활성 프로젝트 (완료되지 않은 프로젝트)
    const activeProjects = allProjects.filter(p => {
      const completedStages = p.stages.filter(s => s.status === '완료').length;
      return completedStages < p.stages.length;
    });

    // 이달 매출 (계약 완료된 프로젝트)
    const thisMonthRevenue = allProjects
      .filter(p => {
        const contractStage = p.stages.find(s => s.name === '계약 체결');
        return contractStage?.status === '완료';
      })
      .reduce((sum, p) => sum + (p.contractedAmount || 0), 0);

    // 전환율 계산
    const quotedProjects = allProjects.filter(p => {
      const quotedStage = p.stages.find(s => s.name === '견적서 송부');
      return quotedStage?.status === '완료';
    });
    const contractedProjects = allProjects.filter(p => {
      const contractStage = p.stages.find(s => s.name === '계약 체결');
      return contractStage?.status === '완료';
    });
    const conversionRate = quotedProjects.length > 0 ? (contractedProjects.length / quotedProjects.length) * 100 : 0;

    // 마감 임박 프로젝트 (임시로 진행 중인 프로젝트의 30%로 가정)
    const urgentProjects = Math.ceil(activeProjects.length * 0.3);

    // 단계별 현황
    const stageStats = [
      { name: '문의접수', count: 0, color: 'bg-blue-500' },
      { name: '제안서작성', count: 0, color: 'bg-indigo-500' },
      { name: '견적송부', count: 0, color: 'bg-purple-500' },
      { name: '계약체결', count: 0, color: 'bg-green-500' },
      { name: '완료', count: 0, color: 'bg-gray-500' }
    ];

    allProjects.forEach(project => {
      // 현재 진행 중인 단계 찾기 (완료되지 않은 첫 번째 단계)
      const currentStageIndex = project.stages.findIndex(s => s.status !== '완료');
      if (currentStageIndex !== -1 && currentStageIndex < 4) {
        stageStats[currentStageIndex].count++;
      } else if (currentStageIndex === -1) {
        // 모든 단계가 완료된 경우
        stageStats[4].count++;
      }
    });

    // 우선순위 알림
    const priorityAlerts = [
      { level: 'urgent', message: '계약서 검토 필요', client: '삼성바이오', color: 'text-red-600 bg-red-50' },
      { level: 'warning', message: '견적 회신 대기 중', client: 'LG화학', color: 'text-yellow-600 bg-yellow-50' },
      { level: 'completed', message: '최종보고서 발송', client: '현대제약', color: 'text-green-600 bg-green-50' }
    ];

    // 매출 트렌드 (최근 6개월)
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('ko-KR', { month: 'long' });
      revenueTrend.push({
        month: monthName,
        revenue: (Math.random() * 100000000 + 150000000) // 1.5억 ~ 2.5억 랜덤
      });
    }

    // 계약 완료 고객사
    const completedClients = clients.filter(client => {
      return client.requesters.some(requester =>
        requester.projects.some(project => {
          const contractStage = project.stages.find(s => s.name === '계약 체결');
          return contractStage?.status === '완료';
        })
      );
    });

    return {
      activeProjects: activeProjects.length,
      thisMonthRevenue,
      conversionRate,
      urgentProjects,
      stageStats,
      priorityAlerts,
      revenueTrend,
      completedClients,
      totalProjects: allProjects.length,
      teamProjects: allProjects.length // 임시로 동일하게 설정
    };
  };

  const data = useMemo(() => calculateDashboardData(), [clients]);

  return (
    <div className="space-y-3">
      {/* 1. 핵심 KPI 카드 (6개 한 줄 배치) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <div className="bg-blue-500 text-white p-2 rounded-lg flex items-center gap-2 min-w-[120px] min-h-[44px] touch-manipulation">
          <ClipboardDocumentListIcon className="h-4 w-4" />
          <div>
            <div className="text-xs opacity-90">활성 프로젝트</div>
            <div className="text-lg font-bold">{data.activeProjects}개</div>
          </div>
        </div>

        <div className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-2 min-w-[120px] min-h-[44px] touch-manipulation">
          <CurrencyDollarIcon className="h-4 w-4" />
          <div>
            <div className="text-xs opacity-90">이달 매출</div>
            <div className="text-lg font-bold">{(data.thisMonthRevenue / 100000000).toFixed(1)}억</div>
          </div>
        </div>

        <div className="bg-purple-500 text-white p-2 rounded-lg flex items-center gap-2 min-w-[120px] min-h-[44px] touch-manipulation">
          <ChartBarIcon className="h-4 w-4" />
          <div>
            <div className="text-xs opacity-90">전환율</div>
            <div className="text-lg font-bold">{data.conversionRate.toFixed(0)}%</div>
          </div>
        </div>

        <div className="bg-red-500 text-white p-2 rounded-lg flex items-center gap-2 min-w-[120px] min-h-[44px] touch-manipulation">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-xs opacity-90">마감임박</div>
            <div className="text-lg font-bold">{data.urgentProjects}개</div>
          </div>
        </div>

        <div className="bg-orange-500 text-white p-2 rounded-lg flex items-center gap-2 min-w-[120px] min-h-[44px] touch-manipulation">
          <UserGroupIcon className="h-4 w-4" />
          <div>
            <div className="text-xs opacity-90">총 고객사</div>
            <div className="text-lg font-bold">{data.completedClients.length}개</div>
          </div>
        </div>

        <div className="bg-indigo-500 text-white p-2 rounded-lg flex items-center gap-2 min-w-[120px] min-h-[44px] touch-manipulation">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div>
            <div className="text-xs opacity-90">목표달성</div>
            <div className="text-lg font-bold">85%</div>
          </div>
        </div>
      </div>

      {/* 3열 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* 2. 프로젝트 진행 현황 */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 h-48">
          <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-3 w-3 text-indigo-600" />
            진행단계별 현황
          </h3>
          
          <div className="space-y-2 overflow-y-auto h-40">
            {data.stageStats.map((stage, index) => (
              <div key={stage.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-16">{stage.name}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(stage.count, 8) }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${stage.color}`}></div>
                    ))}
                    {stage.count > 8 && (
                      <span className="text-xs text-slate-500 ml-1">+{stage.count - 8}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700">({stage.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 우선순위 알림 */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 h-48">
          <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <svg className="h-3 w-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
            </svg>
            우선순위 알림
          </h3>
          
          <div className="space-y-2 overflow-y-auto h-40">
            {data.priorityAlerts.map((alert, index) => (
              <div key={index} className={`p-2 rounded-md ${alert.color} border min-h-[44px] touch-manipulation`}>
                <div className="flex items-center gap-2">
                  {alert.level === 'urgent' && <span className="text-red-600">🔴</span>}
                  {alert.level === 'warning' && <span className="text-yellow-600">🟡</span>}
                  {alert.level === 'completed' && <span className="text-green-600">🟢</span>}
                  <div className="flex-1">
                    <div className="text-xs font-medium">{alert.message}</div>
                    <div className="text-xs opacity-75">({alert.client})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 매출 트렌드 */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 h-48">
          <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <ChartBarIcon className="h-3 w-3 text-blue-600" />
            매출 트렌드 (6개월)
          </h3>
          
          <div className="space-y-1 overflow-y-auto h-32">
            {data.revenueTrend.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{item.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.revenue / 250000000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-10 text-right">
                    {(item.revenue / 100000000).toFixed(1)}억
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">평균 월매출</span>
              <span className="font-semibold text-slate-800">
                {(data.revenueTrend.reduce((sum, item) => sum + item.revenue, 0) / data.revenueTrend.length / 100000000).toFixed(1)}억
              </span>
            </div>
          </div>
        </div>

        {/* 5. 팀 성과 + 계약완료 고객사 */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 h-48">
          <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <UserGroupIcon className="h-3 w-3 text-green-600" />
            팀 성과 요약
          </h3>
          
          {/* 팀 성과 */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">내 담당</span>
              <span className="text-xs font-semibold text-slate-800">{data.activeProjects}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">팀 전체</span>
              <span className="text-xs font-semibold text-slate-800">{data.teamProjects}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">목표 달성률</span>
              <span className="text-xs font-semibold text-green-600">85%</span>
            </div>
          </div>

          {/* 계약완료 고객사 */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-600 mb-2">계약 완료 고객사</div>
            <div className="flex flex-wrap gap-1 overflow-y-auto h-20">
              {data.completedClients.slice(0, 8).map((client) => (
                <span key={client.id} className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200 min-h-[20px] touch-manipulation">
                  {client.name.length > 5 ? client.name.substring(0, 5) + '..' : client.name}
                </span>
              ))}
              {data.completedClients.length > 8 && (
                <span className="px-1.5 py-0.5 bg-slate-50 text-slate-600 text-xs rounded border border-slate-200 min-h-[20px]">
                  +{data.completedClients.length - 8}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;