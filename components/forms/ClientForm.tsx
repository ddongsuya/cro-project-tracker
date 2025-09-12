import React, { useState } from 'react';
import type { Client } from '../../types';

interface ClientFormProps {
  onSave: (clientData: Omit<Client, 'id' | 'requesters'>) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert('고객사명을 입력해주세요.');
        return;
    }
    onSave({ 
      name, 
      businessNumber: businessNumber.trim() || undefined,
      ceoName: ceoName.trim() || undefined,
      mainPhone: mainPhone.trim() || undefined,
      website: website.trim() || undefined,
      address: address.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="client-name" className="block text-sm font-medium text-gray-700">고객사명 *</label>
        <input type="text" id="client-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="business-number" className="block text-sm font-medium text-gray-700">사업자등록번호</label>
          <input type="text" id="business-number" value={businessNumber} onChange={e => setBusinessNumber(e.target.value)} placeholder="123-45-67890" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="ceo-name" className="block text-sm font-medium text-gray-700">대표이사</label>
          <input type="text" id="ceo-name" value={ceoName} onChange={e => setCeoName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="main-phone" className="block text-sm font-medium text-gray-700">대표번호</label>
          <input type="tel" id="main-phone" value={mainPhone} onChange={e => setMainPhone(e.target.value)} placeholder="02-1234-5678" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">홈페이지</label>
          <input type="url" id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.company.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">주소</label>
        <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>안내:</strong> 고객사 등록 후 해당 고객사의 의뢰자(담당자)를 별도로 추가할 수 있습니다.
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
      </div>
    </form>
  );
};

export default ClientForm;
