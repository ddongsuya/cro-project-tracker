import React, { useState, useCallback, useMemo } from 'react';
import type { Project, ProjectStage, Test } from '../types';
import { StageStatus } from '../types';

interface OptimizedProjectTimelineProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onAddTest: () => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const OptimizedProjectTimeline = React.memo<OptimizedProjectTimelineProps>(({ 
  project, 
  onUpdateProject,
  onAddTest,
  onEditTest,
  onDeleteTest,
}) => {
  const [editingStage, setEditingStage] = useState<ProjectStage | null>(null);

  const handleStageClick = useCallback((stage: ProjectStage) => {
    const nextStatus: StageStatus = 
      stage.status === '대기' ? '진행중' : 
      stage.status === '진행중' ? '완료' : '대기';
    
    const updatedStage = { ...stage, status: nextStatus };
    const updatedStages = project.stages.map(s => 
      s.id === stage.id ? updatedStage : s
    );
    
    onUpdateProject({ ...project, stages: updatedStages });
  }, [project, onUpdateProject]);

  const stageProgress = useMemo(() => {
    const completedStages = project.stages.filter(s => s.status === '완료').length;
    return Math.round((completedStages / project.stages.length) * 100);
  }, [project.stages]);

  const getStageColor = (status: StageStatus) => {
    switch (status) {
      case '완료': return 'bg-green-500 text-white';
      case '진행중': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const getStageIcon = (status: StageStatus) => {
    switch (status) {
      case '완료': return '✅';
      case '진행중': return '🔄';
      default: return '⏸';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{project.projectName}</h3>
          <p className="text-slate-600 text-sm mt-1">프로젝트 진행 현황</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stageProgress}%</div>
          <div className="text-xs text-slate-500">완료율</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stageProgress}%` }}
          ></div>
        </div>
      </div>

      {/* 단계별 현황 */}
      <div className="space-y-3">
        {project.stages.map((stage, index) => (
          <div
            key={stage.id}
            onClick={() => handleStageClick(stage)}
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${getStageColor(stage.status)}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getStageIcon(stage.status)}</span>
              <div className="flex-1">
                <div className="font-semibold">{stage.name}</div>
                <div className="text-xs opacity-80">
                  {stage.status === '완료' ? '완료됨' : 
                   stage.status === '진행중' ? '진행 중' : '대기 중'}
                </div>
              </div>
            </div>
            <div className="text-xs opacity-60">
              클릭하여 상태 변경
            </div>
          </div>
        ))}
      </div>

      {/* 시험 관리 */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">시험 관리</h4>
          <button
            onClick={onAddTest}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            + 시험 추가
          </button>
        </div>
        
        {project.tests && project.tests.length > 0 ? (
          <div className="space-y-2">
            {project.tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-slate-800">{test.testName}</div>
                  <div className="text-sm text-slate-600">{test.testMethod}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditTest(test)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteTest(test.id)}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-2">🧪</div>
            <p>등록된 시험이 없습니다</p>
            <p className="text-sm">시험을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedProjectTimeline.displayName = 'OptimizedProjectTimeline';

export default OptimizedProjectTimeline;