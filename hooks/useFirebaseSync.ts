import { useState, useEffect, useCallback } from 'react';
import { FirebaseService } from '../services/firebaseService';
import type { Client } from '../types';

export const useFirebaseSync = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFirebaseMode, setIsFirebaseMode] = useState(false);
  const firebaseService = FirebaseService.getInstance();

  // Firebase 인증 상태 관리
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (user) {
        setIsFirebaseMode(true);
      } else {
        setIsFirebaseMode(false);
      }
    });

    return () => unsubscribe();
  }, [firebaseService]);

  // Firebase 데이터 로드
  const loadFirebaseData = useCallback(async () => {
    try {
      const firebaseData = await firebaseService.loadData();
      return firebaseData || [];
    } catch (error) {
      console.error('Firebase 데이터 로드 실패:', error);
      return [];
    }
  }, [firebaseService]);

  // Firebase 데이터 저장
  const saveFirebaseData = useCallback(async (clients: Client[]) => {
    if (clients.length > 0 && currentUser) {
      try {
        await firebaseService.saveData(clients);
      } catch (error) {
        console.error('Firebase 데이터 저장 실패:', error);
      }
    }
  }, [firebaseService, currentUser]);

  // Firebase 실시간 동기화 설정
  const setupRealtimeSync = useCallback((
    onDataChange: (clients: Client[]) => void,
    isSearchActive: boolean
  ) => {
    if (isFirebaseMode && currentUser) {
      return firebaseService.onDataChange((firebaseClients) => {
        onDataChange(firebaseClients);
      });
    }
    return () => {};
  }, [firebaseService, isFirebaseMode, currentUser]);

  return {
    currentUser,
    isFirebaseMode,
    setIsFirebaseMode,
    loadFirebaseData,
    saveFirebaseData,
    setupRealtimeSync,
    firebaseService
  };
};