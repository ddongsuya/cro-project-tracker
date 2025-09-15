import React from 'react';
import type { Client, Project } from '../types';
import ProjectList from './ProjectList';

interface ProjectFilterProps {
  clients: Client[];
  filterType: string;
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
  onEditProject: (project: Project, requesterId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
  clients,
  filterType,
  onSelectProject,
  onAddProject,
  onEditProject,
  onDeleteProject
}) => {
  const getFilteredClients = () => {
    if (filterType === 'all') {
      return clients;
    }

    return clients.map(client => ({
      ...client,
      requesters: client.requesters.map(requester => ({
        ...requester,
        projects: requester.projects.filter(project => {
          switch (filterType) {
            case 'quoted':
              // 견적서 송부까지 완료된 프로젝트
              const quotedStage = project.stages.find(s => s.name === '견적서 송부');
              return quotedStage?.status === '완료';
              
            case 'contracted':
              // 계약 체결까지 완료된 프로젝트
              const contractStage = project.stages.find(s => s.name === '계약 체결');
              return contractStage?.status === '완료';
              
            case 'completed':
              // 모든 단계가 완료된 프로젝트
              const completedStages = project.stages.filter(s => s.status === '완료').length;
              return completedStages === project.stages.length;
              
            default:
              return true;
          }
        })
      }))
    })).filter(client => 
      client.requesters.some(requester => requester.projects.length > 0)
    );
  };

  const filteredClients = getFilteredClients();
  
  const getFilterTitle = () => {
    switch (filterType) {
      case 'quoted':
        return '견적서 송부 완료 고객사';
      case 'contracted':
        return '계약 체결 완료 고객사';
      case 'completed':
        return '프로젝트 완료 고객사';
      case 'all':
        return '전체 고객사';
      default:
        return '고객사 목록';
    }
  };

  const getFilterDescription = () => {
    const totalProjects = filteredClients.reduce((sum, client) => 
      sum + client.requesters.reduce((reqSum, req) => reqSum + req.projects.length, 0), 0
    );

    switch (filterType) {
      case 'quoted':
        return `견적서 송부가 완료된 ${totalProjects}개의 프로젝트`;
      case 'contracted':
        return `계약이 체결된 ${totalProjects}개의 프로젝트`;
      case 'completed':
        return `모든 단계가 완료된 ${totalProjects}개의 프로젝트`;
      case 'all':
        return `총 ${totalProjects}개의 프로젝트`;
      default:
        return `${totalProjects}개의 프로젝트`;
    }
  };

  if (filteredClients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          {getFilterTitle()}가 없습니다
        </h3>
        <p className="text-slate-500 mb-6">
          해당 조건에 맞는 프로젝트가 아직 없습니다.
        </p>
        <button
          onClick={onAddProject}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          새 프로젝트 추가
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 헤더 */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{getFilterTitle()}</h2>
            <p className="text-slate-600 mt-1">{getFilterDescription()}</p>
          </div>
          <button
            onClick={onAddProject}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium"
          >
            + 새 프로젝트
          </button>
        </div>
      </div>

      {/* 필터링된 고객사 목록 */}
      <div className="space-y-4">
        {filteredClients.map(client => (
          <ProjectList
            key={client.id}
            client={client}
            onSelectProject={onSelectProject}
            onAddProject={onAddProject}
            onEditProject={onEditProject}
            onDeleteProject={onDeleteProject}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectFilter;