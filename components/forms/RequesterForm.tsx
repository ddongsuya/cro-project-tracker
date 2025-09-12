import React, { useState } from 'react';
import type { Requester } from '../../types';

interface RequesterFormProps {
  onSave: (requesterData: Omit<Requester, 'id' | 'projects'>) => void;
  onCancel: () => void;
  initialData?: Omit<Requester, 'id' | 'projects'>;
}

const RequesterForm: React.FC<RequesterFormProps> = ({ onSave, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [position, setPosition] = useState(initialData?.position || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim() || undefined,
      position: position.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">👤 의뢰자 정보 입력</h4>
        <p className="text-sm text-blue-700">
          고객사 내에서 프로젝트를 의뢰하는 담당자의 정보를 입력하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="requester-name" className="block text-sm font-medium text-gray-700">이름 *</label>
          <input 
            type="text" 
            id="requester-name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            required 
          />
        </div>
        
        <div>
          <label htmlFor="requester-email" className="block text-sm font-medium text-gray-700">이메일 *</label>
          <input 
            type="email" 
            id="requester-email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="requester-phone" className="block text-sm font-medium text-gray-700">연락처</label>
          <input 
            type="tel" 
            id="requester-phone" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder="010-1234-5678"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="requester-department" className="block text-sm font-medium text-gray-700">부서</label>
          <input 
            type="text" 
            id="requester-department" 
            value={department} 
            onChange={e => setDepartment(e.target.value)} 
            placeholder="예: 연구개발팀"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
      </div>

      <div>
        <label htmlFor="requester-position" className="block text-sm font-medium text-gray-700">직책</label>
        <input 
          type="text" 
          id="requester-position" 
          value={position} 
          onChange={e => setPosition(e.target.value)} 
          placeholder="예: 선임연구원"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          취소
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </form>
  );
};

export default RequesterForm;