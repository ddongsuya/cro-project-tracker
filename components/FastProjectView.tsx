import React, { useState, useCallback } from 'react';
import type { Project, ProjectStage, Test } from '../types';
import { StageStatus } from '../types';

interface FastProjectViewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onAddTest: () => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const FastProjectView = React.memo<FastProjectViewProps>(({ 
  project, 
  onUpdateProject,
  onAddTest,
  onEditTest,
  onDeleteTest,
}) => {
  const handleStageClick = useCallback((stage: ProjectStage) => {
    const nextStatus: StageStatus = 
      stage.status === '대기' ? '진행중' : 
      stage.status === '진행중' ? '완료' : '대기';
    
    const updatedStages = project.stages.map(s => 
      s.id === stage.id ? { ...s, status: nextStatus } : s
    );
    
    onUpdateProject({ ...project, stages: updatedStages });
  }, [project, onUpdateProject]);

  const completedStages = project.stages.filter(s => s.status === '완료').length;
  const progress = Math.round((completedStages / project.stages.length) * 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">{project.projectName}</h3>
        <div className="text-sm text-blue-600 font-semibold">{progress}% 완료</div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="space-y-2">
        {project.stages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => handleStageClick(stage)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              stage.status === '완료' ? 'bg-green-100 text-green-800' :
              stage.status === '진행중' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}
          >
            <span className="text-sm">
              {stage.status === '완료' ? '✅' : 
               stage.status === '진행중' ? '🔄' : '⏸'}
            </span>
            <span className="font-medium text-sm">{stage.name}</span>
            <span className="ml-auto text-xs opacity-60">클릭</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">시험 ({project.tests?.length || 0}개)</span>
          <button
            onClick={onAddTest}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            + 추가
          </button>
        </div>
        
        {project.tests && project.tests.length > 0 ? (
          <div className="space-y-1">
            {project.tests.slice(0, 3).map((test) => (
              <div key={test.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                <span className="truncate">{test.testName}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditTest(test)}
                    className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteTest(test.id)}
                    className="px-1 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
            {project.tests.length > 3 && (
              <div className="text-xs text-slate-500 text-center">
                +{project.tests.length - 3}개 더
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">
            시험이 없습니다
          </div>
        )}
      </div>
    </div>
  );
});

FastProjectView.displayName = 'FastProjectView';

export default FastProjectView;