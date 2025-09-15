import React from 'react';
import type { Client } from '../types';
import ChartBarIcon from './icons/ChartBarIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import SimpleChart from './SimpleChart';

interface DashboardProps {
  clients: Client[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  
  const calculateStats = () => {
    const totalClients = clients.length;
    const allProjects = clients.flatMap(c => c.requesters.flatMap(r => r.projects));
    
    const totalQuoted = allProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const totalContracted = allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const contractRate = totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0;
    
    // 단계별 통계
    const stageStats = [
      { name: '문의접수', completed: 0 },
      { name: '제안서작성', completed: 0 },
      { name: '견적서송부', completed: 0 },
      { name: '계약협상', completed: 0 },
      { name: '계약체결', completed: 0 },
      { name: '프로젝트진행', completed: 0 },
      { name: '최종보고서', completed: 0 }
    ];
    
    allProjects.forEach(project => {
      project.stages.forEach((stage, index) => {
        if (stage.status === '완료' && stageStats[index]) {
          stageStats[index].completed++;
        }
      });
    });

    // 월별 통계 (최근 6개월)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      monthlyStats.push({
        month: monthKey,
        contracted: Math.random() * 50000000 // 임시 데이터
      });
    }

    return {
      totalClients,
      totalProjects: allProjects.length,
      totalQuoted,
      totalContracted,
      contractRate,
      stageStats,
      monthlyStats
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <ChartBarIcon className="h-4 w-4 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">내 대시보드</h2>
      </div>

      {/* 첫 번째 줄: 모든 주요 정보를 한 줄에 */}
      <div className="flex gap-3 items-start flex-wrap">
        {/* 통계 카드들 - 데이터 크기에 맞게 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-md text-white text-center" style={{width: '70px'}}>
          <UserGroupIcon className="h-4 w-4 mx-auto mb-1 text-blue-200" />
          <p className="text-xs text-blue-100">고객사</p>
          <p className="text-lg font-bold">{stats.totalClients}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-md text-white text-center" style={{width: '70px'}}>
          <ClipboardDocumentListIcon className="h-4 w-4 mx-auto mb-1 text-emerald-200" />
          <p className="text-xs text-emerald-100">프로젝트</p>
          <p className="text-lg font-bold">{stats.totalProjects}</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-md text-white text-center" style={{width: '80px'}}>
          <CurrencyDollarIcon className="h-4 w-4 mx-auto mb-1 text-amber-200" />
          <p className="text-xs text-amber-100">견적금액</p>
          <p className="text-lg font-bold">{(stats.totalQuoted / 100000000).toFixed(1)}억</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-md text-white text-center" style={{width: '70px'}}>
          <ChartBarIcon className="h-4 w-4 mx-auto mb-1 text-purple-200" />
          <p className="text-xs text-purple-100">전환율</p>
          <p className="text-lg font-bold">{stats.contractRate.toFixed(1)}%</p>
        </div>

        {/* 단계별 현황 - 같은 줄에 */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardDocumentListIcon className="h-3 w-3 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-800">업무진행</span>
          </div>
          <div className="flex items-center gap-2">
            {stats.stageStats.map((stage, index) => (
              <div key={stage.name} className="text-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  stage.completed > 0 ? (
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-indigo-500' : 
                    index === 2 ? 'bg-purple-500' : 
                    index === 3 ? 'bg-pink-500' :
                    index === 4 ? 'bg-red-500' :
                    index === 5 ? 'bg-orange-500' : 'bg-green-500'
                  ) : 'bg-slate-300'
                }`}>
                  {stage.completed > 0 ? stage.completed : index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 월별 매출 트렌드 - 같은 줄에 */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100" style={{width: '250px'}}>
          <div className="flex items-center gap-2 mb-1">
            <ChartBarIcon className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-semibold text-slate-800">월별 매출</span>
            <span className="text-xs text-slate-500">
              {(stats.monthlyStats[stats.monthlyStats.length - 1]?.contracted / 100000000).toFixed(1)}억
            </span>
          </div>
          <SimpleChart
            type="line"
            data={stats.monthlyStats.map((month, index) => ({
              label: month.month.substring(5),
              value: month.contracted / 10000,
              color: `hsl(${220 + index * 20}, 70%, 50%)`
            }))}
            height={60}
          />
        </div>

        {/* 프로젝트 상태 - 같은 줄에 */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100" style={{width: '200px'}}>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardDocumentListIcon className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">프로젝트 상태</span>
          </div>
          <SimpleChart
            type="pie"
            data={[
              {
                label: '완료',
                value: stats.stageStats.reduce((sum, stage) => sum + stage.completed, 0),
                color: '#10b981'
              },
              {
                label: '진행중',
                value: stats.totalProjects - stats.stageStats.reduce((sum, stage) => sum + stage.completed, 0),
                color: '#3b82f6'
              }
            ]}
            height={60}
          />
        </div>
      </div>

      {/* 계약 완료 고객사만 간단히 */}
      {clients.filter(client => {
        const hasCompletedContract = client.requesters.some(requester =>
          requester.projects.some(project => {
            const contractStage = project.stages.find(s => s.name === '계약 체결');
            return contractStage?.status === '완료';
          })
        );
        return hasCompletedContract;
      }).length > 0 && (
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100" style={{width: 'fit-content'}}>
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">계약 완료 고객사</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {clients.filter(client => {
              const hasCompletedContract = client.requesters.some(requester =>
                requester.projects.some(project => {
                  const contractStage = project.stages.find(s => s.name === '계약 체결');
                  return contractStage?.status === '완료';
                })
              );
              return hasCompletedContract;
            }).slice(0, 5).map(client => (
              <div key={client.id} className="px-2 py-1 bg-emerald-50 rounded text-xs text-emerald-700 border border-emerald-200">
                {client.name.length > 8 ? client.name.substring(0, 8) + '..' : client.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;