import { useState, useCallback } from 'react';

// 강제 리렌더링을 위한 커스텀 훅
export const useForceUpdate = () => {
  const [, setTick] = useState(0);
  
  const forceUpdate = useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
  
  return forceUpdate;
};