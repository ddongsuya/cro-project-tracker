import React, { useState, useEffect } from 'react';
import { FirebaseService, TeamMember } from '../services/firebaseService';
import UserGroupIcon from './icons/UserGroupIcon';
import UserIcon from './icons/UserIcon';

interface TeamManagementProps {
  currentUser: any;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ currentUser }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('viewer');

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    loadTeamMembers();
    loadUserRole();
  }, [currentUser]);

  const loadTeamMembers = async () => {
    try {
      const members = await firebaseService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('팀 멤버 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const role = await firebaseService.getUserRole();
      setUserRole(role);
    } catch (error) {
      console.error('권한 확인 실패:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'editor':
        return '편집자';
      case 'viewer':
        return '뷰어';
      default:
        return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <UserGroupIcon className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">팀 관리</h3>
        <span className="text-sm text-gray-500">({teamMembers.length}명)</span>
      </div>

      {/* 현재 사용자 정보 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3">
          <UserIcon className="h-8 w-8 text-blue-600" />
          <div>
            <div className="font-medium text-gray-800">{currentUser?.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userRole)}`}>
                {getRoleName(userRole)}
              </span>
              <span className="text-xs text-gray-500">현재 로그인</span>
            </div>
          </div>
        </div>
      </div>

      {/* 팀 멤버 목록 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">팀 멤버</h4>
        
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>등록된 팀 멤버가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-800">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                    {getRoleName(member.role)}
                  </span>
                  {member.lastActive && (
                    <span className="text-xs text-gray-400">
                      {new Date(member.lastActive.toDate()).toLocaleDateString('ko-KR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 권한 설명 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-700 mb-2">권한 설명</h5>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">관리자</span>
            <span>모든 데이터 편집, 팀 관리, 권한 설정</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">편집자</span>
            <span>데이터 편집, 프로젝트 관리</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">뷰어</span>
            <span>데이터 조회만 가능</span>
          </div>
        </div>
      </div>

      {/* 실시간 동기화 상태 */}
      <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>실시간 동기화 활성</span>
      </div>
    </div>
  );
};

export default TeamManagement;