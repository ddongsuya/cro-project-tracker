import React, { useState, useCallback, useMemo } from 'react';
import type { Project, ProjectStage, Test } from '../types';
import { StageStatus } from '../types';

interface SafeProjectViewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onAddTest: () => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const SafeProjectView: React.FC<SafeProjectViewProps> = ({ 
  project, 
  onUpdateProject,
  onAddTest,
  onEditTest,
  onDeleteTest,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageClick = useCallback(async (stage: ProjectStage) => {
    if (isUpdating) return; // 중복 클릭 방지
    
    setIsUpdating(true);
    
    try {
      const nextStatus: StageStatus = 
        stage.status === '대기' ? '진행중' : 
        stage.status === '진행중' ? '완료' : '대기';
      
      const updatedStages = project.stages.map(s => 
        s.id === stage.id ? { ...s, status: nextStatus } : s
      );
      
      const updatedProject = { ...project, stages: updatedStages };
      onUpdateProject(updatedProject);
    } catch (error) {
      console.error('단계 업데이트 실패:', error);
    } finally {
      setTimeout(() => setIsUpdating(false), 500); // 0.5초 후 다시 클릭 가능
    }
  }, [project, onUpdateProject, isUpdating]);

  const projectStats = useMemo(() => {
    const completedStages = project.stages.filter(s => s.status === '완료').length;
    const progress = Math.round((completedStages / project.stages.length) * 100);
    const testCount = project.tests?.length || 0;
    
    return { completedStages, progress, testCount };
  }, [project.stages, project.tests]);

  const getStageColor = useCallback((status: StageStatus) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-800 border-green-200';
      case '진행중': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }, []);

  const getStageIcon = useCallback((status: StageStatus) => {
    switch (status) {
      case '완료': return '✅';
      case '진행중': return '🔄';
      default: return '⏸';
    }
  }, []);

  if (!project) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-slate-500">프로젝트를 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {/* 프로젝트 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{project.projectName || '프로젝트명 없음'}</h3>
          <p className="text-slate-600 text-sm mt-1">
            {project.projectNumber || project.id}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{projectStats.progress}%</div>
          <div className="text-xs text-slate-500">완료율</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${projectStats.progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{projectStats.completedStages}/{project.stages.length} 단계 완료</span>
          <span>{projectStats.testCount}개 시험</span>
        </div>
      </div>

      {/* 단계별 현황 */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-slate-800 text-sm">프로젝트 단계</h4>
        {project.stages.map((stage, index) => (
          <div
            key={stage.id || `stage-${index}`}
            onClick={() => handleStageClick(stage)}
            className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border ${getStageColor(stage.status)} ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-lg">{getStageIcon(stage.status)}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{stage.name}</div>
                <div className="text-xs opacity-80">
                  {stage.status === '완료' ? '완료됨' : 
                   stage.status === '진행중' ? '진행 중' : '대기 중'}
                </div>
              </div>
            </div>
            <div className="text-xs opacity-60">
              {isUpdating ? '업데이트 중...' : '클릭하여 변경'}
            </div>
          </div>
        ))}
      </div>

      {/* 시험 관리 섹션 */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">시험 관리</h4>
          <button
            onClick={onAddTest}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
          >
            + 시험 추가
          </button>
        </div>
        
        {project.tests && project.tests.length > 0 ? (
          <div className="space-y-3">
            {project.tests.slice(0, 5).map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{test.testName}</div>
                  <div className="text-sm text-slate-600 mt-1">{test.testMethod}</div>
                  {test.testPeriod && (
                    <div className="text-xs text-slate-500 mt-1">기간: {test.testPeriod}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditTest(test)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteTest(test.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
            {project.tests.length > 5 && (
              <div className="text-center py-2">
                <span className="text-xs text-slate-500">
                  +{project.tests.length - 5}개 더 있음
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-3">🧪</div>
            <p className="font-medium">등록된 시험이 없습니다</p>
            <p className="text-sm mt-1">시험을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeProjectView;