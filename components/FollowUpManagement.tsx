import React, { useState } from 'react';
import type { FollowUpRecord, Project, Client } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import PhoneIcon from './icons/PhoneIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import UserIcon from './icons/UserIcon';
import Modal from './Modal';
import FollowUpForm from './forms/FollowUpForm';

interface FollowUpManagementProps {
  project: Project;
  client: Client;
  onUpdateProject: (project: Project) => void;
}

const FollowUpManagement: React.FC<FollowUpManagementProps> = ({ 
  project, 
  client, 
  onUpdateProject 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpRecord | null>(null);

  const handleAddFollowUp = (followUpData: Omit<FollowUpRecord, 'id'>) => {
    const newFollowUp: FollowUpRecord = {
      ...followUpData,
      id: `followup-${Date.now()}`
    };
    
    const updatedFollowUps = [...(project.followUps || []), newFollowUp];
    onUpdateProject({ ...project, followUps: updatedFollowUps });
    setShowModal(false);
  };

  const handleEditFollowUp = (followUpData: Omit<FollowUpRecord, 'id'>) => {
    if (!editingFollowUp) return;
    
    const updatedFollowUps = (project.followUps || []).map(f =>
      f.id === editingFollowUp.id ? { ...f, ...followUpData } : f
    );
    
    onUpdateProject({ ...project, followUps: updatedFollowUps });
    setEditingFollowUp(null);
    setShowModal(false);
  };

  const handleDeleteFollowUp = (followUpId: string) => {
    if (!window.confirm('정말로 이 Follow-up 기록을 삭제하시겠습니까?')) return;
    
    const updatedFollowUps = (project.followUps || []).filter(f => f.id !== followUpId);
    onUpdateProject({ ...project, followUps: updatedFollowUps });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case '전화': return <PhoneIcon className="h-4 w-4 text-blue-500" />;
      case '이메일': return <EnvelopeIcon className="h-4 w-4 text-green-500" />;
      case '방문': return <UserIcon className="h-4 w-4 text-purple-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case '긍정적': return 'bg-green-100 text-green-800';
      case '부정적': return 'bg-red-100 text-red-800';
      case '계약진행': return 'bg-blue-100 text-blue-800';
      case '거절': return 'bg-gray-100 text-gray-800';
      case '추가정보요청': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const followUps = project.followUps || [];
  const sortedFollowUps = [...followUps].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <PhoneIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Follow-up 관리</h3>
            <p className="text-sm text-slate-600">{client.name} - {project.id}</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setEditingFollowUp(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Follow-up 추가</span>
        </button>
      </div>

      {/* Follow-up 목록 */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedFollowUps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-4xl mb-4">📞</div>
            <p className="text-slate-500">Follow-up 기록이 없습니다</p>
            <button
              onClick={() => {
                setEditingFollowUp(null);
                setShowModal(true);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              첫 Follow-up 기록하기
            </button>
          </div>
        ) : (
          sortedFollowUps.map((followUp) => (
            <div
              key={followUp.id}
              className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getMethodIcon(followUp.method)}
                  <div>
                    <div className="font-medium text-slate-800">
                      {followUp.date} - {followUp.method}
                    </div>
                    <div className="text-sm text-slate-600">
                      담당자: {followUp.contactPerson}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(followUp.result)}`}>
                    {followUp.result}
                  </span>
                  <button
                    onClick={() => {
                      setEditingFollowUp(followUp);
                      setShowModal(true);
                    }}
                    className="p-1 rounded-full hover:bg-slate-200"
                  >
                    <PencilIcon className="h-4 w-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteFollowUp(followUp.id)}
                    className="p-1 rounded-full hover:bg-slate-200"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-slate-700 mb-3">
                <strong>내용:</strong> {followUp.content}
              </div>
              
              {followUp.nextAction && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <strong>다음 액션:</strong> {followUp.nextAction}
                  {followUp.nextActionDate && (
                    <span className="ml-2 text-indigo-600">
                      ({followUp.nextActionDate})
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Follow-up 통계 */}
      {followUps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{followUps.length}</div>
              <div className="text-sm text-slate-600">총 Follow-up</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {followUps.filter(f => f.result === '긍정적' || f.result === '계약진행').length}
              </div>
              <div className="text-sm text-slate-600">긍정적 응답</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {followUps.filter(f => f.result === '응답대기' || f.result === '추가정보요청').length}
              </div>
              <div className="text-sm text-slate-600">대기중</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">
                {followUps.filter(f => f.method === '전화').length}
              </div>
              <div className="text-sm text-slate-600">전화 연락</div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up 폼 모달 */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFollowUp(null);
        }}
        title={editingFollowUp ? 'Follow-up 수정' : 'Follow-up 추가'}
      >
        <FollowUpForm
          onSave={editingFollowUp ? handleEditFollowUp : handleAddFollowUp}
          onCancel={() => {
            setShowModal(false);
            setEditingFollowUp(null);
          }}
          initialData={editingFollowUp || undefined}
          clientName={client.name}
          projectId={project.id}
        />
      </Modal>
    </div>
  );
};

export default FollowUpManagement;