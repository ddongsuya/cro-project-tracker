import React from 'react';
import type { Project, Client } from '../types';
import ClockIcon from './icons/ClockIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import UserIcon from './icons/UserIcon';
import CalendarIcon from './icons/CalendarIcon';

interface ProjectHistoryProps {
  project: Project;
  client: Client;
}

interface HistoryItem {
  id: string;
  date: string;
  type: 'stage' | 'followup' | 'test';
  title: string;
  content: string;
  status?: string;
  icon: React.ReactNode;
}

const ProjectHistory: React.FC<ProjectHistoryProps> = ({ project, client }) => {
  
  const generateHistoryItems = (): HistoryItem[] => {
    const items: HistoryItem[] = [];

    // 1. 단계별 메모 추가
    project.stages.forEach(stage => {
      if (stage.notes && stage.notes.trim() !== '') {
        items.push({
          id: `stage-${stage.id}`,
          date: stage.date || project.quoteDate,
          type: 'stage',
          title: `${stage.name} - ${stage.status}`,
          content: stage.notes,
          status: stage.status,
          icon: <DocumentTextIcon className="h-5 w-5 text-blue-600" />
        });
      }
    });

    // 2. Follow-up 기록 추가
    if (project.followUps) {
      project.followUps.forEach(followUp => {
        items.push({
          id: `followup-${followUp.id}`,
          date: followUp.date,
          type: 'followup',
          title: `${followUp.method} - ${followUp.contactPerson}`,
          content: followUp.content,
          status: followUp.result,
          icon: <UserIcon className="h-5 w-5 text-green-600" />
        });
      });
    }

    // 3. 시험 정보 추가 (시작/종료 이벤트)
    project.tests.forEach(test => {
      // 시험 시작
      items.push({
        id: `test-start-${test.id}`,
        date: test.startDate,
        type: 'test',
        title: `시험 시작 - ${test.testNumber}`,
        content: `담당자: ${test.testManager}, 프로젝트 번호: ${test.projectNumber}`,
        status: '시작',
        icon: <ClockIcon className="h-5 w-5 text-purple-600" />
      });

      // 시험 종료
      items.push({
        id: `test-end-${test.id}`,
        date: test.endDate,
        type: 'test',
        title: `시험 종료 예정 - ${test.testNumber}`,
        content: `담당자: ${test.testManager}, 프로젝트 번호: ${test.projectNumber}`,
        status: '종료예정',
        icon: <ClockIcon className="h-5 w-5 text-orange-600" />
      });
    });

    // 날짜순 정렬 (최신순)
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const historyItems = generateHistoryItems();

  const getStatusColor = (type: string, status?: string) => {
    if (type === 'stage') {
      switch (status) {
        case '완료': return 'bg-green-100 text-green-800';
        case '진행중': return 'bg-blue-100 text-blue-800';
        case '보류': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    if (type === 'followup') {
      switch (status) {
        case '긍정적': return 'bg-green-100 text-green-800';
        case '계약진행': return 'bg-blue-100 text-blue-800';
        case '부정적': return 'bg-red-100 text-red-800';
        case '추가정보요청': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    if (type === 'test') {
      return status === '시작' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stage': return '업무 단계';
      case 'followup': return 'Follow-up';
      case 'test': return '시험 정보';
      default: return '기타';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <ClockIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800">프로젝트 히스토리</h3>
          <p className="text-sm text-slate-600">{client.name} - {project.id}</p>
        </div>
      </div>

      {historyItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-4xl mb-4">📝</div>
          <p className="text-slate-500">기록된 히스토리가 없습니다</p>
          <p className="text-sm text-slate-400 mt-2">각 단계에서 메모를 남기거나 Follow-up을 기록하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {historyItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* 타임라인 선 */}
              {index < historyItems.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-200"></div>
              )}
              
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                {/* 아이콘 */}
                <div className="flex-shrink-0 p-2 bg-white rounded-full border-2 border-slate-200">
                  {item.icon}
                </div>
                
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-slate-800 truncate">{item.title}</h4>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {getTypeLabel(item.type)}
                    </span>
                    {item.status && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(item.type, item.status)}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                    {item.content}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{new Date(item.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 통계 정보 */}
      {historyItems.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {historyItems.filter(item => item.type === 'stage').length}
              </div>
              <div className="text-sm text-slate-600">단계 메모</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {historyItems.filter(item => item.type === 'followup').length}
              </div>
              <div className="text-sm text-slate-600">Follow-up</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {historyItems.filter(item => item.type === 'test').length}
              </div>
              <div className="text-sm text-slate-600">시험 이벤트</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;