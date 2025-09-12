import React, { useState } from 'react';
import type { Client, Project, ProjectStage, Test } from '../types';
import { StageStatus } from '../types';
import PencilIcon from './icons/PencilIcon';
import Modal from './Modal';
import StageEditForm from './forms/StageEditForm';
import HorizontalProgressTracker from './HorizontalProgressTracker';
import GanttChart from './GanttChart';
import TestManagement from './TestManagement';
import ProjectForm from './forms/ProjectForm';
import PlusIcon from './icons/PlusIcon';
import FollowUpManagement from './FollowUpManagement';
import ProjectHistory from './ProjectHistory';
import OCRTestUpload from './OCRTestUpload';
import OCRModal from './OCRModal';
import MultipleTestForm from './forms/MultipleTestForm';
import { TestRegistrationInfo, MultipleTestInfo } from '../services/ocrService';

interface ProjectTimelineProps {
  client: Client;
  project: Project;
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
  onUpdateProject: (project: Project) => void;
  onAddTest: () => void;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
    client, 
    project, 
    onSelectProject, 
    onAddProject, 
    onUpdateProject,
    onAddTest,
    onEditTest,
    onDeleteTest,
}) => {
  const [editingStage, setEditingStage] = useState<ProjectStage | null>(null);
  const [isProjectEditModalOpen, setProjectEditModalOpen] = useState(false);
  const [showOCRUpload, setShowOCRUpload] = useState(false);
  const [showMultipleTestForm, setShowMultipleTestForm] = useState(false);

  const handleSaveStage = (updatedStage: ProjectStage) => {
    console.log('Saving stage:', updatedStage); // 디버깅용
    const updatedStages = project.stages.map((s) =>
      s.id === updatedStage.id ? updatedStage : s
    );
    console.log('Updated stages:', updatedStages); // 디버깅용
    onUpdateProject({ ...project, stages: updatedStages });
    setEditingStage(null); // 모달 닫기
  };

  const handleSaveProject = (projectData: Omit<Project, 'stages' | 'tests'>, requesterId: string) => {
      // ProjectTimeline에서는 의뢰자 변경을 지원하지 않으므로 requesterId는 무시하고 기존 프로젝트 정보만 업데이트
      onUpdateProject({ ...project, ...projectData });
      setProjectEditModalOpen(false);
  }

  const handleOCRTestExtracted = (testData: Omit<Test, 'id'>, extractedInfo: TestRegistrationInfo) => {
    // OCR로 추출된 시험 정보를 프로젝트에 추가
    const newTest: Test = { ...testData, id: `test-${Date.now()}` };
    const updatedTests = [...project.tests, newTest];
    
    // 시험 접수요청 단계를 완료로 변경
    const updatedStages = project.stages.map(stage => 
      stage.name === '시험 접수요청' 
        ? { ...stage, status: StageStatus.Completed, date: new Date().toISOString().split('T')[0] }
        : stage
    );
    
    onUpdateProject({ ...project, stages: updatedStages, tests: updatedTests });
    setShowOCRUpload(false);
  }

  const handleOCRMultipleTestsExtracted = (testsData: Omit<Test, 'id'>[], extractedInfo: MultipleTestInfo) => {
    console.log('다중 시험 등록 시작:', testsData, extractedInfo);
    
    try {
      // 입력 데이터 유효성 검사
      if (!testsData || testsData.length === 0) {
        throw new Error('등록할 시험 데이터가 없습니다.');
      }
      
      // OCR로 추출된 다중 시험 정보를 프로젝트에 추가
      const newTests: Test[] = testsData.map((testData, index) => {
        console.log(`시험 ${index + 1} 데이터:`, testData);
        
        // 필수 필드 검증 및 기본값 설정
        const processedTest = {
          ...testData,
          id: `test-${Date.now()}-${index}`,
          testNumber: testData.testNumber || `TEST-${Date.now()}-${index}`,
          testManager: testData.testManager || '담당자 미지정',
          projectNumber: testData.projectNumber || project.projectNumber || 'UNKNOWN',
          startDate: testData.startDate || new Date().toISOString().split('T')[0],
          endDate: testData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        console.log(`처리된 시험 ${index + 1}:`, processedTest);
        return processedTest;
      });
      
      console.log('생성된 새 시험들:', newTests);
      
      const updatedTests = [...project.tests, ...newTests];
      
      // 시험 접수요청 단계를 완료로 변경
      const updatedStages = project.stages.map(stage => 
        stage.name === '시험 접수요청' 
          ? { ...stage, status: StageStatus.Completed, date: new Date().toISOString().split('T')[0] }
          : stage
      );
      
      console.log('업데이트된 프로젝트:', { ...project, stages: updatedStages, tests: updatedTests });
      
      onUpdateProject({ ...project, stages: updatedStages, tests: updatedTests });
      setShowOCRUpload(false);
      
      alert(`${newTests.length}개의 시험이 성공적으로 등록되었습니다!`);
    } catch (error) {
      console.error('다중 시험 등록 오류:', error);
      alert(`시험 등록 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  const handleSaveMultipleTests = (testsData: Omit<Test, 'id'>[]) => {
    try {
      console.log('다중 시험 저장:', testsData);
      
      const newTests: Test[] = testsData.map((testData, index) => ({
        ...testData,
        id: `test-${Date.now()}-${index}`
      }));
      
      const updatedTests = [...project.tests, ...newTests];
      
      // 시험 접수요청 단계를 완료로 변경
      const updatedStages = project.stages.map(stage => 
        stage.name === '시험 접수요청' 
          ? { ...stage, status: StageStatus.Completed, date: new Date().toISOString().split('T')[0] }
          : stage
      );
      
      onUpdateProject({ ...project, stages: updatedStages, tests: updatedTests });
      setShowMultipleTestForm(false);
      
      alert(`${newTests.length}개의 시험이 성공적으로 추가되었습니다!`);
    } catch (error) {
      console.error('다중 시험 저장 오류:', error);
      alert('시험 저장 중 오류가 발생했습니다.');
    }
  };

  const otherProjects = client.requesters.flatMap(r => r.projects).filter(p => p.id !== project.id);

  return (
    <div className="space-y-8">
      <header className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
               <h1 className="text-3xl font-bold text-slate-800">{project.testItem}</h1>
               <button 
                 onClick={() => setProjectEditModalOpen(true)} 
                 className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
               >
                  <PencilIcon className="h-5 w-5 text-slate-600" />
               </button>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {client.name}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                견적서: {project.id}
              </span>
              {project.projectNumber && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  프로젝트: {project.projectNumber}
                </span>
              )}
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                {project.quotedAmount.toLocaleString()}원
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
              {otherProjects.length > 0 && (
                  <select 
                      value={project.id} 
                      onChange={e => onSelectProject(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white"
                  >
                      <option value={project.id}>{project.id}</option>
                      {otherProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.id} - {p.testItem}</option>
                      ))}
                  </select>
              )}
              <button
                  onClick={onAddProject}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                  <PlusIcon className="h-5 w-5" />
                  <span>새 프로젝트</span>
              </button>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">업무 진행 단계</h2>
        <HorizontalProgressTracker stages={project.stages} onStageClick={setEditingStage} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">시험 정보 관리</h2>
            <button
              onClick={() => setShowOCRUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              📧 이미지에서 자동 등록
            </button>
          </div>
          <TestManagement 
            tests={project.tests}
            onAdd={() => setShowMultipleTestForm(true)}
            onEdit={onEditTest}
            onDelete={onDeleteTest}
          />
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">시험 진행 (간트 차트)</h2>
          <GanttChart tests={project.tests} />
        </section>
      </div>

      {/* Follow-up 관리 섹션 */}
      <section>
        <FollowUpManagement 
          project={project}
          client={client}
          onUpdateProject={onUpdateProject}
        />
      </section>

      {/* 프로젝트 히스토리 섹션 */}
      <section>
        <ProjectHistory 
          project={project}
          client={client}
        />
      </section>


      {editingStage && (
        <Modal
          isOpen={!!editingStage}
          onClose={() => setEditingStage(null)}
          title={`${editingStage.name} 정보 수정`}
        >
          <StageEditForm
            stage={editingStage}
            onSave={handleSaveStage}
            onCancel={() => setEditingStage(null)}
          />
        </Modal>
      )}

      {isProjectEditModalOpen && (
          <Modal isOpen={isProjectEditModalOpen} onClose={() => setProjectEditModalOpen(false)} title="프로젝트 정보 수정">
              <ProjectForm 
                onSave={handleSaveProject} 
                onCancel={() => setProjectEditModalOpen(false)}
                initialData={project}
                requesters={client.requesters}
                initialRequesterId={client.requesters.find(r => r.projects.some(p => p.id === project.id))?.id}
              />
          </Modal>
      )}

      <OCRModal
        isOpen={showOCRUpload}
        onClose={() => setShowOCRUpload(false)}
        title="시험 접수 확인서 자동 등록"
      >
        <OCRTestUpload
          onTestExtracted={handleOCRTestExtracted}
          onMultipleTestsExtracted={handleOCRMultipleTestsExtracted}
          onClose={() => setShowOCRUpload(false)}
        />
      </OCRModal>

      <Modal
        isOpen={showMultipleTestForm}
        onClose={() => setShowMultipleTestForm(false)}
        title="다중 시험 추가"
      >
        <MultipleTestForm
          projectNumber={project.projectNumber || ''}
          onSave={handleSaveMultipleTests}
          onCancel={() => setShowMultipleTestForm(false)}
        />
      </Modal>
    </div>
  );
};

export default ProjectTimeline;