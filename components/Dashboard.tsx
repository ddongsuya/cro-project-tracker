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

interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalQuoted: number;
  totalContracted: number;
  contractRate: number;
  totalTests: number;
  avgProjectValue: number;
  monthlyStats: Array<{
    month: string;
    quoted: number;
    contracted: number;
    projects: number;
  }>;
  topClients: Array<{
    name: string;
    totalValue: number;
    projectCount: number;
  }>;
  stageStats: Array<{
    stageName: string;
    completedCount: number;
    inProgressCount: number;
    pendingCount: number;
    totalCount: number;
    completionRate: number;
  }>;
  currentStageDistribution: Array<{
    stageName: string;
    projectCount: number;
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  
  const calculateStats = (): DashboardStats => {
    const totalClients = clients.length;
    // 새로운 구조: 모든 의뢰자의 프로젝트를 합쳐서 계산
    const allProjects = clients.flatMap(c => c.requesters.flatMap(r => r.projects));
    const totalProjects = allProjects.length;
    const totalQuoted = allProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const totalContracted = allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const contractRate = totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0;
    const totalTests = allProjects.reduce((sum, p) => sum + p.tests.length, 0);
    const avgProjectValue = totalProjects > 0 ? totalQuoted / totalProjects : 0;

    // 월별 통계
    const monthlyMap = new Map<string, { quoted: number; contracted: number; projects: number }>();
    allProjects.forEach(project => {
      const month = project.quoteDate.substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { quoted: 0, contracted: 0, projects: 0 };
      monthlyMap.set(month, {
        quoted: existing.quoted + project.quotedAmount,
        contracted: existing.contracted + (project.contractedAmount || 0),
        projects: existing.projects + 1
      });
    });

    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 상위 고객사 (새로운 구조에 맞게 수정)
    const topClients = clients
      .map(client => {
        const clientProjects = client.requesters.flatMap(r => r.projects);
        return {
          name: client.name,
          totalValue: clientProjects.reduce((sum, p) => sum + (p.contractedAmount || p.quotedAmount), 0),
          projectCount: clientProjects.length
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // 단계별 완료 통계
    const stageNames = [
      '온라인 문의 접수',
      '문의 내용 검토 및 대응', 
      '견적서 송부',
      '지급 조건 설정',
      '계약 체결',
      '시험 접수요청',
      '최종보고서 발행'
    ];

    const stageStats = stageNames.map(stageName => {
      const completedCount = allProjects.filter(project => {
        const stage = project.stages.find(s => s.name === stageName);
        return stage && stage.status === '완료';
      }).length;
      
      const inProgressCount = allProjects.filter(project => {
        const stage = project.stages.find(s => s.name === stageName);
        return stage && stage.status === '진행중';
      }).length;
      
      const pendingCount = allProjects.filter(project => {
        const stage = project.stages.find(s => s.name === stageName);
        return stage && stage.status === '대기';
      }).length;
      
      const totalCount = allProjects.filter(project => 
        project.stages.some(s => s.name === stageName)
      ).length;
      
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      return {
        stageName,
        completedCount,
        inProgressCount,
        pendingCount,
        totalCount,
        completionRate
      };
    });

    // 현재 진행 중인 단계별 프로젝트 분포
    const currentStageDistribution = stageNames.map(stageName => {
      // 각 프로젝트에서 현재 진행 중인 단계 (완료되지 않은 첫 번째 단계)
      const projectCount = allProjects.filter(project => {
        // 프로젝트의 현재 단계 찾기 (완료되지 않은 첫 번째 단계)
        const currentStageIndex = project.stages.findIndex(stage => stage.status !== '완료');
        if (currentStageIndex === -1) return false; // 모든 단계가 완료된 경우
        
        const currentStage = project.stages[currentStageIndex];
        return currentStage.name === stageName;
      }).length;
      
      return {
        stageName,
        projectCount
      };
    });

    return {
      totalClients,
      totalProjects,
      totalQuoted,
      totalContracted,
      contractRate,
      totalTests,
      avgProjectValue,
      monthlyStats,
      topClients,
      stageStats,
      currentStageDistribution
    };
  };

  const stats = calculateStats();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group">
      <div className="flex items-center">
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="ml-5 flex-1">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <ChartBarIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">내 대시보드</h2>
          <p className="text-slate-500 text-sm">프로젝트 현황 요약</p>
        </div>
      </div>

      {/* 초컴팩트 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">총 고객사</p>
              <p className="text-xl font-bold">{stats.totalClients}</p>
            </div>
            <UserGroupIcon className="h-6 w-6 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs">총 프로젝트</p>
              <p className="text-xl font-bold">{stats.totalProjects}</p>
            </div>
            <ClipboardDocumentListIcon className="h-6 w-6 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-xs">총 견적금액</p>
              <p className="text-xl font-bold">{(stats.totalQuoted / 100000000).toFixed(1)}억</p>
            </div>
            <CurrencyDollarIcon className="h-6 w-6 text-amber-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">계약 전환율</p>
              <p className="text-xl font-bold">{stats.contractRate.toFixed(1)}%</p>
            </div>
            <ChartBarIcon className="h-6 w-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* 초컴팩트 단계별 현황 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">업무 진행 현황</h3>
          <span className="text-xs text-slate-500 ml-auto">{stats.totalProjects}개 프로젝트</span>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {stats.stageStats.map((stage, index) => (
            <div key={stage.stageName} className="p-2 border border-slate-200 rounded-md hover:shadow-sm transition-all duration-200 bg-slate-50">
              <div className="flex items-center justify-between mb-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  index === 0 ? 'bg-blue-500' : 
                  index === 1 ? 'bg-indigo-500' : 
                  index === 2 ? 'bg-purple-500' : 
                  index === 3 ? 'bg-pink-500' :
                  index === 4 ? 'bg-red-500' :
                  index === 5 ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {stage.completionRate.toFixed(0)}%
                </span>
              </div>
              
              <h4 className="font-medium text-slate-800 text-xs mb-1 leading-tight">
                {stage.stageName}
              </h4>
              
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-700">{stage.completedCount}/{stage.totalCount}</div>
              </div>
              
              {/* 초컴팩트 진행률 바 */}
              <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-indigo-500' : 
                    index === 2 ? 'bg-purple-500' : 
                    index === 3 ? 'bg-pink-500' :
                    index === 4 ? 'bg-red-500' :
                    index === 5 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stage.completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* 핵심 지표 요약 */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-base font-bold text-blue-600">{stats.stageStats[0]?.completedCount || 0}</div>
              <div className="text-xs text-slate-600">문의접수</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-md">
              <div className="text-base font-bold text-purple-600">{stats.stageStats[2]?.completedCount || 0}</div>
              <div className="text-xs text-slate-600">견적송부</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-md">
              <div className="text-base font-bold text-red-600">{stats.stageStats[4]?.completedCount || 0}</div>
              <div className="text-xs text-slate-600">계약체결</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <div className="text-base font-bold text-green-600">{stats.stageStats[6]?.completedCount || 0}</div>
              <div className="text-xs text-slate-600">최종완료</div>
            </div>
          </div>
        </div>
      </div>

      {/* 초컴팩트 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 월별 매출 트렌드 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">월별 매출 트렌드</h3>
          </div>
          <SimpleChart
            type="line"
            data={stats.monthlyStats.slice(-6).map((month, index) => ({
              label: month.month.substring(5), // MM만 표시
              value: month.contracted / 10000, // 만원 단위
              color: `hsl(${220 + index * 20}, 70%, 50%)`
            }))}
            height={100}
          />
        </div>

        {/* 프로젝트 상태 분포 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardDocumentListIcon className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-800">프로젝트 상태</h3>
          </div>
          <SimpleChart
            type="pie"
            data={[
              {
                label: '완료',
                value: clients.flatMap(c => c.requesters.flatMap(r => r.projects)).filter(p => {
                  const completedStages = p.stages.filter(s => s.status === '완료').length;
                  return completedStages === p.stages.length;
                }).length,
                color: '#10b981'
              },
              {
                label: '진행중',
                value: clients.flatMap(c => c.requesters.flatMap(r => r.projects)).filter(p => {
                  const completedStages = p.stages.filter(s => s.status === '완료').length;
                  return completedStages > 0 && completedStages < p.stages.length;
                }).length,
                color: '#3b82f6'
              },
              {
                label: '대기',
                value: clients.flatMap(c => c.requesters.flatMap(r => r.projects)).filter(p => {
                  const completedStages = p.stages.filter(s => s.status === '완료').length;
                  return completedStages === 0;
                }).length,
                color: '#f59e0b'
              }
            ]}
            height={180}
          />
        </div>

        {/* 고객사별 프로젝트 수 */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">고객사별 프로젝트</h3>
          </div>
          <SimpleChart
            type="bar"
            data={stats.topClients.slice(0, 5).map((client, index) => ({
              label: client.name.length > 8 ? client.name.substring(0, 8) + '...' : client.name,
              value: client.projectCount,
              color: `hsl(${280 + index * 30}, 60%, 50%)`
            }))}
            height={180}
          />
        </div>
      </div>

      {/* 기존 월별 트렌드 테이블 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">월별 상세 현황</h3>
          </div>
          <div className="space-y-3">
            {stats.monthlyStats.slice(-6).map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">
                      견적: {(month.quoted / 10000).toFixed(0)}만원
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      계약: {(month.contracted / 10000).toFixed(0)}만원
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((month.quoted / Math.max(...stats.monthlyStats.map(m => m.quoted))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상위 고객사 */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">주요 고객사 (매출 기준)</h3>
          </div>
          <div className="space-y-3">
            {stats.topClients.map((client, index) => (
              <div key={client.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.projectCount}개 프로젝트</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    {(client.totalValue / 10000).toFixed(0)}만원
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 프로젝트 진행 현황 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">프로젝트 진행 현황</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => {
            const clientProjects = client.requesters.flatMap(r => r.projects);
            const clientStats = {
              total: clientProjects.length,
              completed: clientProjects.filter(p => {
                const completedStages = p.stages.filter(s => s.status === '완료').length;
                return completedStages === p.stages.length; // 7단계 모두 완료 (최종보고서 발행까지)
              }).length,
              inProgress: clientProjects.filter(p => {
                const completedStages = p.stages.filter(s => s.status === '완료').length;
                return completedStages > 0 && completedStages < p.stages.length;
              }).length
            };

            return (
              <div key={client.id} className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-slate-50">
                <h4 className="font-semibold text-slate-800 mb-4 text-lg">{client.name}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">완료</span>
                    </div>
                    <span className="text-emerald-600 font-semibold">{clientStats.completed}개</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">진행중</span>
                    </div>
                    <span className="text-blue-600 font-semibold">{clientStats.inProgress}개</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                      <span className="text-sm text-slate-600">대기</span>
                    </div>
                    <span className="text-slate-600 font-semibold">
                      {clientStats.total - clientStats.completed - clientStats.inProgress}개
                    </span>
                  </div>
                  
                  {/* 진행률 바 */}
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>전체 진행률</span>
                      <span>{clientStats.total > 0 ? Math.round((clientStats.completed / clientStats.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${clientStats.total > 0 ? (clientStats.completed / clientStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;