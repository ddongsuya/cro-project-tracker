import React from 'react';
import type { Client, Project } from '../types';
import PlusIcon from './icons/PlusIcon';
import CalendarIcon from './icons/CalendarIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClockIcon from './icons/ClockIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';

interface ProjectListProps {
  client: Client;
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
  onAddRequester: () => void;
  onEditProject: (project: Project, requesterId: string) => void;
  onDeleteRequester: (requesterId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ client, onSelectProject, onAddProject, onAddRequester, onEditProject, onDeleteRequester, onDeleteProject }) => {
  const getStatusColor = (statusText: string) => {
    if (statusText.includes('완료')) return 'bg-green-100 text-green-800';
    if (statusText.includes('진행')) return 'bg-blue-100 text-blue-800';
    if (statusText.includes('검토')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getProgressRate = (project: Project) => {
    const completedStages = project.stages.filter(s => s.status === '완료').length;
    return Math.round((completedStages / project.stages.length) * 100);
  };

  // 모든 의뢰자의 프로젝트를 합쳐서 계산
  const allProjects = client.requesters.flatMap(r => r.projects);
  const completedProjects = allProjects.filter(p => {
    const completedStages = p.stages.filter(s => s.status === '완료').length;
    return completedStages === p.stages.length;
  });
  const totalQuoted = allProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
  const totalContracted = allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{client.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-slate-600">
              {client.ceoName && <span>대표: {client.ceoName}</span>}
              {client.mainPhone && (
                <>
                  <span>•</span>
                  <span>{client.mainPhone}</span>
                </>
              )}
              {client.website && (
                <>
                  <span>•</span>
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    홈페이지
                  </a>
                </>
              )}
            </div>
            {client.requesters.length > 0 && (
              <div className="mt-2 text-sm text-slate-500">
                의뢰자 {client.requesters.length}명: {client.requesters.map(r => r.name).join(', ')}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onAddRequester}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>의뢰자 추가</span>
            </button>
            <button
              onClick={onAddProject}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              <span>새 프로젝트 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* 프로젝트 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{allProjects.length}</div>
              <div className="text-sm text-slate-600">총 프로젝트</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{completedProjects.length}</div>
              <div className="text-sm text-slate-600">완료된 프로젝트</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {(totalQuoted / 100000000).toFixed(1)}억
              </div>
              <div className="text-sm text-slate-600">총 견적 금액</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {(totalContracted / 100000000).toFixed(1)}억
              </div>
              <div className="text-sm text-slate-600">총 계약 금액</div>
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">프로젝트 목록</h2>
        
        {allProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-4xl mb-4">📋</div>
            <p className="text-slate-500 mb-4">등록된 프로젝트가 없습니다</p>
            <button
              onClick={onAddProject}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              첫 프로젝트 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {client.requesters.map((requester) => (
              <div key={requester.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-slate-700">{requester.name}</h3>
                    <span className="text-sm text-slate-500">({requester.department})</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {requester.projects.length}개 프로젝트
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`정말로 "${requester.name}" 의뢰자를 삭제하시겠습니까?\n\n삭제하면 해당 의뢰자의 모든 프로젝트가 함께 삭제됩니다.`)) {
                        onDeleteRequester(requester.id);
                      }
                    }}
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                    title="의뢰자 삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {requester.projects.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <p className="text-slate-500 text-sm">등록된 프로젝트가 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {requester.projects.map((project) => {
                      const progressRate = getProgressRate(project);
                      
                      return (
                        <div
                          key={project.id}
                          className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-200 group hover:border-blue-300 relative"
                        >
                          {/* 편집/삭제 버튼 */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditProject(project, requester.id);
                              }}
                              className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                              title="프로젝트 편집"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project.id);
                              }}
                              className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                              title="프로젝트 삭제"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>

                          {/* 프로젝트 헤더 */}
                          <div 
                            onClick={() => onSelectProject(project.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-4 pr-12">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {project.testItem}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{project.id}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.statusText)}`}>
                                {project.statusText}
                              </span>
                            </div>

                            {/* 프로젝트 정보 */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">견적일</span>
                                <span className="font-medium text-slate-800">{project.quoteDate}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">견적 금액</span>
                                <span className="font-medium text-slate-800">{project.quotedAmount.toLocaleString()}원</span>
                              </div>
                              
                              {project.contractedAmount && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">계약 금액</span>
                                  <span className="font-medium text-green-600">{project.contractedAmount.toLocaleString()}원</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">시험 수</span>
                                <span className="font-medium text-slate-800">{project.tests.length}개</span>
                              </div>
                            </div>

                            {/* 진행률 */}
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">진행률</span>
                                <span className="font-medium text-slate-800">{progressRate}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progressRate}%` }}
                                />
                              </div>
                            </div>

                            {/* Follow-up 정보 */}
                            {project.followUps && project.followUps.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>📞 Follow-up: {project.followUps.length}건</span>
                                  <span>•</span>
                                  <span>최근: {project.followUps[project.followUps.length - 1]?.date}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;