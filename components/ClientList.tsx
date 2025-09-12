import React from 'react';
import type { Client } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface ClientListProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  onAddClient: () => void;
  onDeleteClient: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, selectedClientId, onSelectClient, onAddClient, onDeleteClient }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">고객사 목록</h2>
        <button 
          onClick={onAddClient} 
          className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm" 
          aria-label="고객사 추가"
          title="고객사 추가"
        >
          <PlusIcon className="h-5 w-5 text-white" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-3 space-y-2">
          {clients.map((client) => {
            // 모든 의뢰자의 프로젝트를 합쳐서 계산
            const allProjects = client.requesters.flatMap(r => r.projects);
            const totalProjects = allProjects.length;
            const completedProjects = allProjects.filter(p => {
              const completedStages = p.stages.filter(s => s.status === '완료').length;
              return completedStages === p.stages.length;
            }).length;
            
            // 현재 진행 중인 단계별 프로젝트 수 계산
            const stageDistribution = {
              '문의접수': 0,
              '견적송부': 0,
              '계약체결': 0,
              '시험진행': 0,
              '완료': completedProjects
            };
            
            allProjects.forEach(project => {
              if (completedProjects > 0 && project.stages.every(s => s.status === '완료')) {
                return; // 이미 완료된 프로젝트는 건너뛰기
              }
              
              // 현재 진행 중인 단계 찾기 (완료되지 않은 첫 번째 단계)
              const currentStageIndex = project.stages.findIndex(stage => stage.status !== '완료');
              if (currentStageIndex !== -1) {
                const currentStage = project.stages[currentStageIndex];
                if (currentStage.name.includes('문의')) {
                  stageDistribution['문의접수']++;
                } else if (currentStage.name.includes('견적')) {
                  stageDistribution['견적송부']++;
                } else if (currentStage.name.includes('계약')) {
                  stageDistribution['계약체결']++;
                } else if (currentStage.name.includes('시험') || currentStage.name.includes('보고서')) {
                  stageDistribution['시험진행']++;
                }
              }
            });
            
            return (
              <li key={client.id} className="relative group">
                <button
                  onClick={() => onSelectClient(client.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedClientId === client.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]'
                      : 'text-slate-700 hover:bg-slate-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between pr-8">
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${
                        selectedClientId === client.id ? 'text-white' : 'text-slate-800'
                      }`}>
                        {client.name}
                      </div>
                      <div className={`text-xs mt-1 ${
                        selectedClientId === client.id ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {client.contactPerson}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${
                        selectedClientId === client.id ? 'text-white' : 'text-slate-600'
                      }`}>
                        {totalProjects}개 프로젝트
                      </div>
                      {totalProjects > 0 && (
                        <div className={`text-xs mt-1 ${
                          selectedClientId === client.id ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {[
                            stageDistribution['문의접수'] > 0 && `문의${stageDistribution['문의접수']}`,
                            stageDistribution['견적송부'] > 0 && `견적${stageDistribution['견적송부']}`,
                            stageDistribution['계약체결'] > 0 && `계약${stageDistribution['계약체결']}`,
                            stageDistribution['시험진행'] > 0 && `시험${stageDistribution['시험진행']}`,
                            stageDistribution['완료'] > 0 && `완료${stageDistribution['완료']}`
                          ].filter(Boolean).join(' / ') || '진행 중인 프로젝트 없음'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 진행률 바 */}
                  {totalProjects > 0 && (
                    <div className="mt-3">
                      <div className={`w-full h-1.5 rounded-full ${
                        selectedClientId === client.id ? 'bg-white/20' : 'bg-slate-200'
                      }`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            selectedClientId === client.id ? 'bg-white' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(completedProjects / totalProjects) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
                
                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`정말로 "${client.name}" 고객사를 삭제하시겠습니까?\n\n삭제하면 해당 고객사의 모든 의뢰자와 프로젝트가 함께 삭제됩니다.`)) {
                      onDeleteClient(client.id);
                    }
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="고객사 삭제"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
        
        {clients.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-4xl mb-4">🏢</div>
            <p className="text-slate-500 text-sm">등록된 고객사가 없습니다</p>
            <button
              onClick={onAddClient}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              첫 고객사 추가하기
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default ClientList;
