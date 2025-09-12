import React, { useState } from 'react';
import type { FollowUpRecord } from '../../types';

interface FollowUpFormProps {
  onSave: (followUpData: Omit<FollowUpRecord, 'id'>) => void;
  onCancel: () => void;
  initialData?: FollowUpRecord;
  clientName: string;
  projectId: string;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({
  onSave,
  onCancel,
  initialData,
  clientName,
  projectId
}) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    method: initialData?.method || '전화' as const,
    contactPerson: initialData?.contactPerson || '',
    content: initialData?.content || '',
    result: initialData?.result || '응답대기' as const,
    nextAction: initialData?.nextAction || '',
    nextActionDate: initialData?.nextActionDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 프로젝트 정보 표시 */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="font-medium text-slate-800 mb-1">Follow-up 대상</h4>
        <p className="text-sm text-slate-600">{clientName} - {projectId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Follow-up 날짜 *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 연락 방법 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            연락 방법 *
          </label>
          <select
            value={formData.method}
            onChange={(e) => handleChange('method', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="전화">📞 전화</option>
            <option value="이메일">📧 이메일</option>
            <option value="방문">🏢 방문</option>
            <option value="기타">📝 기타</option>
          </select>
        </div>
      </div>

      {/* 담당자 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          연락한 담당자 *
        </label>
        <input
          type="text"
          value={formData.contactPerson}
          onChange={(e) => handleChange('contactPerson', e.target.value)}
          required
          placeholder="담당자 이름을 입력하세요"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* 연락 내용 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          연락 내용 *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          required
          rows={4}
          placeholder="연락한 내용을 상세히 기록하세요..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* 결과 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          연락 결과 *
        </label>
        <select
          value={formData.result}
          onChange={(e) => handleChange('result', e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="응답대기">⏳ 응답대기</option>
          <option value="긍정적">✅ 긍정적</option>
          <option value="부정적">❌ 부정적</option>
          <option value="추가정보요청">📋 추가정보요청</option>
          <option value="계약진행">🤝 계약진행</option>
          <option value="거절">🚫 거절</option>
        </select>
      </div>

      {/* 다음 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            다음 액션 (선택사항)
          </label>
          <input
            type="text"
            value={formData.nextAction}
            onChange={(e) => handleChange('nextAction', e.target.value)}
            placeholder="예: 추가 자료 발송, 재연락 등"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            다음 액션 예정일
          </label>
          <input
            type="date"
            value={formData.nextActionDate}
            onChange={(e) => handleChange('nextActionDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {initialData ? '수정' : '저장'}
        </button>
      </div>
    </form>
  );
};

export default FollowUpForm;