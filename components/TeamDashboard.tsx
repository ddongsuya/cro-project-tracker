import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Client, Project } from '../types';
import { FirebaseService, TeamMember } from '../services/firebaseService';
import ChartBarIcon from './icons/ChartBarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import SimpleChart from './SimpleChart';
import { SkeletonDashboard } from './SkeletonCard';
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';

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



  if (loading) {
    return <SkeletonDashboard />;
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
    <DashboardLayout
      title={`${teamStats.teamName} 대시보드`}
      subtitle={`${teamStats.memberCount}명의 팀원과 함께하는 협업 현황`}
      icon={<UserGroupIcon className="h-5 w-5 text-white" />}
      headerColor={getTeamColor(currentUserTeam)}
    >
      {/* 팀 성과 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="팀 프로젝트"
          value={teamStats.totalProjects}
          icon={<ClipboardDocumentListIcon className="h-5 w-5 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          compact
        />
        <StatCard
          title="팀 견적금액"
          value={`${(teamStats.totalQuoted / 100000000).toFixed(1)}억`}
          icon={<CurrencyDollarIcon className="h-5 w-5 text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          compact
        />
        <StatCard
          title="계약 전환율"
          value={`${teamStats.contractRate.toFixed(1)}%`}
          icon={<ChartBarIcon className="h-5 w-5 text-white" />}
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          compact
        />
        <StatCard
          title="팀원 수"
          value={teamStats.memberCount}
          icon={<UserGroupIcon className="h-5 w-5 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-indigo-500"
          compact
        />
      </div>

      {/* 팀원 현황 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-blue-600" />
          팀 멤버 ({teamStats.memberCount}명)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamStats.members.map((member) => (
            <div key={member.id} className="p-3 bg-gray-50 rounded-lg border hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTeamColor(member.team)} flex items-center justify-center text-white font-bold text-sm`}>
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{member.name}</div>
                  <div className="text-xs text-gray-500 truncate">{member.email}</div>
                </div>
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
          ))}
        </div>
      </div>

      {/* 팀 성과 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-green-600" />
            프로젝트 진행 현황
          </h3>
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            매출 현황
          </h3>
          <SimpleChart
            type="pie"
            data={[
              {
                label: `계약완료 ${(teamStats.totalContracted / 100000000).toFixed(1)}억`,
                value: teamStats.totalContracted,
                color: '#059669'
              },
              {
                label: `견적대기 ${((teamStats.totalQuoted - teamStats.totalContracted) / 100000000).toFixed(1)}억`,
                value: teamStats.totalQuoted - teamStats.totalContracted,
                color: '#d97706'
              }
            ]}
            height={200}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamDashboard;