import React, { useState, useEffect } from 'react';
import type { Client, Project } from '../types';
import { FirebaseService, TeamMember } from '../services/firebaseService';
import ChartBarIcon from './icons/ChartBarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import SimpleChart from './SimpleChart';

interface TeamDashboardProps {
  clients: Client[];
  currentUser: any;
}

interface TeamStats {
  teamName: string;
  memberCount: number;
  totalProjects: number;
  completedProjects: number;
  totalQuoted: number;
  totalContracted: number;
  contractRate: number;
  members: TeamMember[];
  recentActivities: any[];
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ clients, currentUser }) => {
  const [currentUserTeam, setCurrentUserTeam] = useState<string>('');
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [teamData, setTeamData] = useState<{ [userId: string]: { profile: any, clients: Client[] } }>({});
  const [loading, setLoading] = useState(true);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    loadTeamData();
  }, [currentUser, clients]);

  const loadTeamData = async () => {
    try {
      console.log('팀 데이터 로드 시작...');
      
      // 현재 사용자의 팀 정보 가져오기
      const members = await firebaseService.getTeamMembers();
      console.log('팀 멤버들:', members);
      setAllTeamMembers(members);
      
      const currentMember = members.find(m => m.email === currentUser?.email);
      console.log('현재 사용자:', currentMember);
      
      if (currentMember) {
        setCurrentUserTeam(currentMember.team);
        
        // 팀 전체 데이터 로드
        const allTeamData = await firebaseService.loadTeamData(currentMember.team);
        console.log('팀 데이터:', allTeamData);
        setTeamData(allTeamData);
        
        calculateTeamStats(currentMember.team, members, allTeamData);
      } else {
        console.log('현재 사용자를 팀 멤버에서 찾을 수 없음');
      }
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = (userTeam: string, members: TeamMember[], teamData: { [userId: string]: { profile: any, clients: Client[] } }) => {
    console.log('팀 통계 계산 시작:', { userTeam, teamDataKeys: Object.keys(teamData) });
    
    const teamMembers = members.filter(m => m.team === userTeam);
    console.log('팀 멤버들:', teamMembers);
    
    // 팀원들의 모든 프로젝트 취합
    const allProjects = Object.values(teamData).flatMap(userData => 
      userData.clients.flatMap(c => c.requesters.flatMap(r => r.projects))
    );
    
    console.log('취합된 프로젝트들:', allProjects);
    
    // 임시로 현재 사용자의 개인 데이터라도 표시
    if (allProjects.length === 0 && clients.length > 0) {
      console.log('팀 데이터가 없어서 개인 데이터 사용:', clients);
      const personalProjects = clients.flatMap(c => c.requesters.flatMap(r => r.projects));
      console.log('개인 프로젝트들:', personalProjects);
      
      const completedProjects = personalProjects.filter(p => {
        const completedStages = p.stages.filter(s => s.status === '완료').length;
        return completedStages === p.stages.length;
      });

      const totalQuoted = personalProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
      const totalContracted = personalProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
      const contractRate = totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0;

      const teamName = getTeamName(userTeam);

      setTeamStats({
        teamName,
        memberCount: teamMembers.length || 1,
        totalProjects: personalProjects.length,
        completedProjects: completedProjects.length,
        totalQuoted,
        totalContracted,
        contractRate,
        members: teamMembers,
        recentActivities: []
      });
      return;
    }
    
    const completedProjects = allProjects.filter(p => {
      const completedStages = p.stages.filter(s => s.status === '완료').length;
      return completedStages === p.stages.length;
    });

    const totalQuoted = allProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const totalContracted = allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const contractRate = totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0;

    const teamName = getTeamName(userTeam);

    setTeamStats({
      teamName,
      memberCount: teamMembers.length,
      totalProjects: allProjects.length,
      completedProjects: completedProjects.length,
      totalQuoted,
      totalContracted,
      contractRate,
      members: teamMembers,
      recentActivities: []
    });
  };

  const getTeamName = (team: string): string => {
    switch (team) {
      case 'business_dev_1':
        return '사업개발 1팀';
      case 'business_dev_2':
        return '사업개발 2팀';
      case 'management':
        return '경영진';
      default:
        return '알 수 없음';
    }
  };

  const getTeamColor = (team: string): string => {
    switch (team) {
      case 'business_dev_1':
        return 'from-blue-500 to-indigo-500';
      case 'business_dev_2':
        return 'from-green-500 to-emerald-500';
      case 'management':
        return 'from-purple-500 to-violet-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
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

  if (!teamStats) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">팀 정보를 불러올 수 없습니다</h3>
        <p className="text-gray-500">사용자 프로필에 팀 정보가 설정되지 않았습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 컴팩트한 팀 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-gradient-to-r ${getTeamColor(currentUserTeam)} rounded-lg`}>
          <UserGroupIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{teamStats.teamName} 대시보드</h2>
          <p className="text-slate-500 text-sm">{teamStats.memberCount}명의 팀원</p>
        </div>
      </div>

      {/* 초컴팩트 팀 성과 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">팀 프로젝트</p>
              <p className="text-xl font-bold">{teamStats.totalProjects}</p>
            </div>
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs">팀 견적금액</p>
              <p className="text-xl font-bold">{(teamStats.totalQuoted / 100000000).toFixed(1)}억</p>
            </div>
            <CurrencyDollarIcon className="h-6 w-6 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-xs">계약 전환율</p>
              <p className="text-xl font-bold">{teamStats.contractRate.toFixed(1)}%</p>
            </div>
            <ChartBarIcon className="h-6 w-6 text-amber-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">팀원 수</p>
              <p className="text-xl font-bold">{teamStats.memberCount}</p>
            </div>
            <UserGroupIcon className="h-6 w-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* 초컴팩트 팀원 현황 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <UserGroupIcon className="h-4 w-4 text-blue-600" />
          <h3 className="text-base font-semibold text-slate-800">{teamStats.teamName} 멤버</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamStats.members.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getTeamColor(member.team)} flex items-center justify-center text-white font-bold`}>
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{member.name}</div>
                  <div className="text-sm text-slate-500">{member.email}</div>
                  {member.position && (
                    <div className="text-xs text-slate-400 mt-1">{member.position}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.role === 'admin' ? 'bg-red-100 text-red-700' :
                    member.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role === 'admin' ? '관리자' : 
                     member.role === 'editor' ? '편집자' : '뷰어'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 팀 성과 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">프로젝트 진행 현황</h3>
          </div>
          <SimpleChart
            type="pie"
            data={[
              {
                label: '완료',
                value: teamStats.completedProjects,
                color: '#10b981'
              },
              {
                label: '진행중',
                value: teamStats.totalProjects - teamStats.completedProjects,
                color: '#3b82f6'
              }
            ]}
            height={200}
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">매출 현황</h3>
          </div>
          <SimpleChart
            type="pie"
            data={[
              {
                label: `계약 완료 (${(teamStats.totalContracted / 100000000).toFixed(1)}억원)`,
                value: teamStats.totalContracted,
                color: '#059669'
              },
              {
                label: `견적 대기 (${((teamStats.totalQuoted - teamStats.totalContracted) / 100000000).toFixed(1)}억원)`,
                value: teamStats.totalQuoted - teamStats.totalContracted,
                color: '#d97706'
              }
            ]}
            height={200}
          />
        </div>
      </div>

      {/* 실시간 팀 활동 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">팀 활동 현황</h3>
          <div className="ml-auto flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>실시간 동기화</span>
          </div>
        </div>
        
        <div className="text-center py-8 text-slate-500">
          <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <p>팀 활동 로그가 여기에 표시됩니다</p>
          <p className="text-sm mt-1">프로젝트 업데이트, 새 고객사 추가 등</p>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;