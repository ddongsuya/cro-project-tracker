import React, { useState } from 'react';
import Modal from './Modal';
import { FirebaseService } from '../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const firebaseService = FirebaseService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!team) {
          setError('팀을 선택해주세요.');
          return;
        }
        await firebaseService.signUp(email, password, name, team);
      } else {
        await firebaseService.signIn(email, password);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다.';
      case 'auth/wrong-password':
        return '비밀번호가 올바르지 않습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password':
        return '비밀번호는 6자 이상이어야 합니다.';
      case 'auth/invalid-email':
        return '올바르지 않은 이메일 형식입니다.';
      default:
        return '로그인에 실패했습니다. 다시 시도해주세요.';
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setTeam('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSignUp ? '회원가입' : '로그인'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                소속 팀 *
              </label>
              <select
                id="team"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">팀을 선택해주세요</option>
                <option value="business_dev_1">사업개발 1팀 (6명)</option>
                <option value="business_dev_2">사업개발 2팀 (4명)</option>
                <option value="management">경영진</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일 *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호 *
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={6}
          />
          {isSignUp && (
            <p className="mt-1 text-sm text-gray-500">비밀번호는 6자 이상이어야 합니다.</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
            </button>
          </div>
        </div>
      </form>

      {/* 팀 사용 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h5 className="font-medium text-blue-800 mb-2">🔥 실시간 팀 협업</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 14명 팀원과 실시간 데이터 동기화</li>
          <li>• 누가 언제 수정했는지 실시간 확인</li>
          <li>• 권한별 접근 제어 (관리자/편집자/뷰어)</li>
          <li>• 자동 백업 및 버전 관리</li>
        </ul>
      </div>
    </Modal>
  );
};

export default AuthModal;