import React, { useState, useEffect } from 'react';
import type { Client, Project } from '../types';
import { FirebaseService, TeamMember } from '../services/firebaseService';
import ChartBarIcon from './icons/ChartBarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import SimpleChart from './SimpleChart';

interface CompanyDashboardProps {
  clients: Client[];
  currentUser: any;
}

interface CompanyStats {
  totalMembers: number;
  team1Members: number;
  team2Members: number;
  totalProjects: number;
  totalQuoted: number;
  totalContracted: number;
  contractRate: number;
  teamComparison: {
    team1: TeamPerformance;
    team2: TeamPerformance;
  };
}

interface TeamPerformance {
  name: string;
  members: number;
  projects: number;
  quoted: number;
  contracted: number;
  contractRate: number;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ clients, currentUser }) => {
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    loadCompanyData();
  }, [currentUser, clients]);

  const loadCompanyData = async () => {
    try {
      const members = await firebaseService.getTeamMembers();
      setAllTeamMembers(members);
      await calculateCompanyStats(members);
    } catch (error) {
      console.error('회사 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompanyStats = async (members: TeamMember[]) => {
    const team1Members = members.filter(m => m.team === 'business_dev_1');
    const team2Members = members.filter(m => m.team === 'business_dev_2');
    
    console.log('전체 회사 통계 계산:', { team1Count: team1Members.length, team2Count: team2Members.length });
    
    // 실제 팀별 데이터 로드
    const team1Data = await firebaseService.loadTeamData('business_dev_1');
    const team2Data = await firebaseService.loadTeamData('business_dev_2');
    
    // 팀1 프로젝트 취합
    const team1Projects = Object.values(team1Data).flatMap(userData => 
      userData.clients.flatMap(c => c.requesters.flatMap(r => r.projects))
    );
    
    // 팀2 프로젝트 취합
    const team2Projects = Object.values(team2Data).flatMap(userData => 
      userData.clients.flatMap(c => c.requesters.flatMap(r => r.projects))
    );
    
    const allProjects = [...team1Projects, ...team2Projects];
    
    // 팀1 통계
    const team1Quoted = team1Projects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const team1Contracted = team1Projects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const team1ContractRate = team1Quoted > 0 ? (team1Contracted / team1Quoted) * 100 : 0;
    
    // 팀2 통계
    const team2Quoted = team2Projects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const team2Contracted = team2Projects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const team2ContractRate = team2Quoted > 0 ? (team2Contracted / team2Quoted) * 100 : 0;
    
    // 전체 통계
    const totalQuoted = team1Quoted + team2Quoted;
    const totalContracted = team1Contracted + team2Contracted;
    const contractRate = totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0;

    const team1Performance: TeamPerformance = {
      name: '사업개발 1팀',
      members: team1Members.length,
      projects: team1Projects.length,
      quoted: team1Quoted,
      contracted: team1Contracted,
      contractRate: team1ContractRate
    };

    const team2Performance: TeamPerformance = {
      name: '사업개발 2팀',
      members: team2Members.length,
      projects: team2Projects.length,
      quoted: team2Quoted,
      contracted: team2Contracted,
      contractRate: team2ContractRate
    };

    setCompanyStats({
      totalMembers: members.length,
      team1Members: team1Members.length,
      team2Members: team2Members.length,
      totalProjects: allProjects.length,
      totalQuoted,
      totalContracted,
      contractRate,
      teamComparison: {
        team1: team1Performance,
        team2: team2Performance
      }
    });
  };

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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!companyStats) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">회사 데이터를 불러올 수 없습니다</h3>
        <p className="text-gray-500">데이터를 다시 로드해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 회사 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl">
          <ChartBarIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">전체 회사 대시보드</h2>
          <p className="text-slate-600 mt-1">사업개발팀 전체 현황을 한눈에 확인하세요</p>
        </div>
      </div>

      {/* 전체 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 팀원"
          value={companyStats.totalMembers}
          icon={<UserGroupIcon className="h-7 w-7 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`1팀: ${companyStats.team1Members}명, 2팀: ${companyStats.team2Members}명`}
        />
        
        <StatCard
          title="전체 프로젝트"
          value={companyStats.totalProjects}
          icon={<ClipboardDocumentListIcon className="h-7 w-7 text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        
        <StatCard
          title="전체 견적금액"
          value={`${(companyStats.totalQuoted / 100000000).toFixed(1)}억원`}
          icon={<CurrencyDollarIcon className="h-7 w-7 text-white" />}
          color="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        
        <StatCard
          title="계약 전환율"
          value={`${companyStats.contractRate.toFixed(1)}%`}
          icon={<ChartBarIcon className="h-7 w-7 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-indigo-500"
          subtitle={`${(companyStats.totalContracted / 100000000).toFixed(1)}억원 계약`}
        />
      </div>

      {/* 팀간 성과 비교 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <UserGroupIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">팀별 성과 비교</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 사업개발 1팀 */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800">사업개발 1팀</h4>
                <p className="text-sm text-slate-600">{companyStats.teamComparison.team1.members}명</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">프로젝트</span>
                <span className="font-semibold text-slate-800">{companyStats.teamComparison.team1.projects}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">견적 금액</span>
                <span className="font-semibold text-slate-800">
                  {(companyStats.teamComparison.team1.quoted / 100000000).toFixed(1)}억원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">계약 금액</span>
                <span className="font-semibold text-green-600">
                  {(companyStats.teamComparison.team1.contracted / 100000000).toFixed(1)}억원
                </span>
              </div>
              <div className="pt-2 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">전환율</span>
                  <span className="font-bold text-blue-600">{companyStats.teamComparison.team1.contractRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 사업개발 2팀 */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800">사업개발 2팀</h4>
                <p className="text-sm text-slate-600">{companyStats.teamComparison.team2.members}명</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">프로젝트</span>
                <span className="font-semibold text-slate-800">{companyStats.teamComparison.team2.projects}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">견적 금액</span>
                <span className="font-semibold text-slate-800">
                  {(companyStats.teamComparison.team2.quoted / 100000000).toFixed(1)}억원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">계약 금액</span>
                <span className="font-semibold text-green-600">
                  {(companyStats.teamComparison.team2.contracted / 100000000).toFixed(1)}억원
                </span>
              </div>
              <div className="pt-2 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">전환율</span>
                  <span className="font-bold text-green-600">{companyStats.teamComparison.team2.contractRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 팀별 성과 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">팀별 프로젝트 수</h3>
          </div>
          <SimpleChart
            type="bar"
            data={[
              {
                label: '1팀',
                value: companyStats.teamComparison.team1.projects,
                color: '#3b82f6'
              },
              {
                label: '2팀',
                value: companyStats.teamComparison.team2.projects,
                color: '#10b981'
              }
            ]}
            height={200}
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">팀별 계약 금액</h3>
          </div>
          <SimpleChart
            type="bar"
            data={[
              {
                label: '1팀',
                value: companyStats.teamComparison.team1.contracted / 10000,
                color: '#3b82f6'
              },
              {
                label: '2팀',
                value: companyStats.teamComparison.team2.contracted / 10000,
                color: '#10b981'
              }
            ]}
            height={200}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;