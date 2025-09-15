import React, { useMemo } from 'react';
import type { Client } from '../types';
import ChartBarIcon from './icons/ChartBarIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import SimpleChart from './SimpleChart';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';

interface DashboardProps {
  clients: Client[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  const dashboardData = useMemo(() => {
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
      teamProjects: allProjects.length
    };
  }, [clients]);

  return (
    <DashboardLayout className="space-y-6">
      {/* 핵심 KPI 카드 - 통일된 디자인 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">활성 프로젝트</p>
              <p className="text-2xl font-bold">{dashboardData.activeProjects}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-blue-200">
                <span>↗</span><span>+12%</span>
              </div>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">이달 매출</p>
              <p className="text-2xl font-bold">{(dashboardData.thisMonthRevenue / 100000000).toFixed(1)}억</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-200">
                <span>↗</span><span>+8%</span>
              </div>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">전환율</p>
              <p className="text-2xl font-bold">{dashboardData.conversionRate.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-purple-200">
                <span>↘</span><span>-5%</span>
              </div>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">긴급 처리</p>
              <p className="text-2xl font-bold">{dashboardData.urgentProjects}</p>
              <p className="text-xs text-orange-200 mt-1">마감 임박</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* 메인 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 매출 트렌드 차트 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            매출 트렌드
          </h3>
          <SimpleChart
            type="line"
            data={dashboardData.revenueTrend.map(item => ({
              label: item.month,
              value: item.revenue / 100000000,
              color: '#3b82f6'
            }))}
            height={200}
          />
        </div>
        
        {/* 프로젝트 진행률 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
            진행 현황
          </h3>
          <SimpleChart
            type="pie"
            data={[
              {
                label: '완료',
                value: dashboardData.stageStats[4].count,
                color: '#10b981'
              },
              {
                label: '진행중',
                value: dashboardData.totalProjects - dashboardData.stageStats[4].count,
                color: '#3b82f6'
              }
            ]}
            height={200}
          />
        </div>
      </div>

      {/* 하단 정보 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 긴급 알림 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            우선순위 알림
          </h3>
          <div className="space-y-2">
            {dashboardData.priorityAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                alert.level === 'urgent' ? 'bg-red-50 border-red-200' :
                alert.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.level === 'urgent' ? 'bg-red-500' :
                    alert.level === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium">{alert.message}</span>
                  <span className="text-xs text-gray-500 ml-auto">{alert.client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 주요 고객사 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            주요 고객사
          </h3>
          <div className="space-y-2">
            {dashboardData.completedClients.slice(0, 5).map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{client.name}</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;