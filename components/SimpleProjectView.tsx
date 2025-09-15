import React, { useCallback } from 'react';
import type { Project, ProjectStage, Test } from '../types';
import { StageStatus } from '../types';

interface SimpleProjectViewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onAddTest: () => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const SimpleProjectView: React.FC<SimpleProjectViewProps> = ({ 
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
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold mb-2">{project.projectName}</h3>
      <div className="text-sm text-blue-600 mb-4">{progress}% 완료</div>

      <div className="space-y-2 mb-4">
        {project.stages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => handleStageClick(stage)}
            className={`p-2 rounded cursor-pointer ${
              stage.status === '완료' ? 'bg-green-100' :
              stage.status === '진행중' ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <span className="text-sm">{stage.name}</span>
            <span className="ml-2 text-xs">
              {stage.status === '완료' ? '✅' : 
               stage.status === '진행중' ? '🔄' : '⏸'}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">시험</span>
          <button
            onClick={onAddTest}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            추가
          </button>
        </div>
        
        {project.tests && project.tests.length > 0 ? (
          <div className="space-y-1">
            {project.tests.map((test) => (
              <div key={test.id} className="flex justify-between items-center p-1 bg-gray-50 rounded text-xs">
                <span>{test.testName}</span>
                <div>
                  <button
                    onClick={() => onEditTest(test)}
                    className="px-1 bg-blue-100 rounded mr-1"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteTest(test.id)}
                    className="px-1 bg-red-100 rounded"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500 text-xs">
            시험이 없습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleProjectView;