import React, { useState } from 'react';
import { ProjectStage, StageStatus } from '../../types';

interface StageEditFormProps {
  stage: ProjectStage;
  onSave: (updatedStage: ProjectStage) => void;
  onCancel: () => void;
}

const StageEditForm: React.FC<StageEditFormProps> = ({ stage, onSave, onCancel }) => {
  const [status, setStatus] = useState<StageStatus>(stage.status);
  const [date, setDate] = useState(stage.date || '');
  const [notes, setNotes] = useState(stage.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...stage, status, date, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="stage-status" className="block text-sm font-medium text-gray-700">상태</label>
        <select
          id="stage-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StageStatus)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.values(StageStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="stage-date" className="block text-sm font-medium text-gray-700">완료/예정일</label>
        <input
          type="date"
          id="stage-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="stage-notes" className="block text-sm font-medium text-gray-700">참고</label>
        <textarea
          id="stage-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="메모를 입력하세요..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
      </div>
    </form>
  );
};

export default StageEditForm;
