import React from 'react';
import type { Project, Test } from '../types';

interface StableProjectViewProps {
  project: Project | null;
  onUpdateProject: (project: Project) => void;
  onAddTest: () => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const StableProjectView: React.FC<StableProjectViewProps> = ({ 
  project, 
  onUpdateProject,
  onAddTest,
  onEditTest,
  onDeleteTest,
}) => {
  // 프로젝트가 없는 경우 안전한 기본 화면
  if (!project) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">프로젝트를 선택하세요</h3>
        <p className="text-slate-500">왼쪽에서 고객사와 프로젝트를 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }

  // 안전한 단계 클릭 핸들러
  const handleStageClick = (stage: any) => {
    try {
      if (!stage || !project) return;
      
      let nextStatus = '대기';
      if (stage.status === '대기') nextStatus = '진행중';
      else if (stage.status === '진행중') nextStatus = '완료';
      else nextStatus = '대기';
      
      const updatedStages = project.stages.map(s => 
        s.id === stage.id ? { ...s, status: nextStatus } : s
      );
      
      const updatedProject = { ...project, stages: updatedStages };
      onUpdateProject(updatedProject);
    } catch (error) {
      console.error('단계 업데이트 오류:', error);
    }
  };

  // 안전한 진행률 계산
  const getProgress = () => {
    try {
      if (!project.stages || project.stages.length === 0) return 0;
      const completed = project.stages.filter(s => s.status === '완료').length;
      return Math.round((completed / project.stages.length) * 100);
    } catch {
      return 0;
    }
  };

  // 안전한 단계 색상
  const getStageColor = (status: string) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-800 border-green-200';
      case '진행중': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // 안전한 단계 아이콘
  const getStageIcon = (status: string) => {
    switch (status) {
      case '완료': return '✅';
      case '진행중': return '🔄';
      default: return '⏸';
    }
  };

  const progress = getProgress();
  const testCount = project.tests ? project.tests.length : 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      {/* 프로젝트 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {project.projectName || '프로젝트명 없음'}
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            {project.projectNumber || project.id || '번호 없음'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{progress}%</div>
          <div className="text-xs text-slate-500">완료율</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>진행률: {progress}%</span>
          <span>시험: {testCount}개</span>
        </div>
      </div>

      {/* 프로젝트 정보 */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <div>
          <div className="text-xs text-slate-500">견적 금액</div>
          <div className="font-semibold text-slate-800">
            {project.quotedAmount ? `${project.quotedAmount.toLocaleString()}원` : '미정'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">계약 금액</div>
          <div className="font-semibold text-slate-800">
            {project.contractedAmount ? `${project.contractedAmount.toLocaleString()}원` : '미정'}
          </div>
        </div>
      </div>

      {/* 단계별 현황 */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-slate-800">프로젝트 단계</h4>
        {project.stages && project.stages.length > 0 ? (
          project.stages.map((stage, index) => (
            <div
              key={stage.id || `stage-${index}`}
              onClick={() => handleStageClick(stage)}
              className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border ${getStageColor(stage.status)} hover:scale-[1.01]`}
            >
              <span className="text-lg">{getStageIcon(stage.status)}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{stage.name}</div>
                <div className="text-xs opacity-80">
                  {stage.status === '완료' ? '완료됨' : 
                   stage.status === '진행중' ? '진행 중' : '대기 중'}
                </div>
              </div>
              <div className="text-xs opacity-60">클릭하여 변경</div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-slate-500">
            <p>단계 정보가 없습니다</p>
          </div>
        )}
      </div>

      {/* 시험 관리 */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">시험 관리</h4>
          <button
            onClick={onAddTest}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            + 시험 추가
          </button>
        </div>
        
        {project.tests && project.tests.length > 0 ? (
          <div className="space-y-3">
            {project.tests.map((test, index) => (
              <div
                key={test.id || `test-${index}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{test.testName || '시험명 없음'}</div>
                  <div className="text-sm text-slate-600 mt-1">{test.testMethod || '방법 미정'}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditTest(test)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteTest(test.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
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

export default StableProjectView;