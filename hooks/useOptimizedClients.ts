import { useMemo } from 'react';
import type { Client } from '../types';

export const useOptimizedClients = (clients: Client[]) => {
  // 모든 프로젝트를 한 번만 계산
  const allProjects = useMemo(() => 
    clients.flatMap(c => c.requesters.flatMap(r => r.projects)),
    [clients]
  );

  // 활성 프로젝트 (완료되지 않은 프로젝트)
  const activeProjects = useMemo(() => 
    allProjects.filter(p => {
      const completedStages = p.stages.filter(s => s.status === '완료').length;
      return completedStages < p.stages.length;
    }),
    [allProjects]
  );

  // 완료된 프로젝트
  const completedProjects = useMemo(() => 
    allProjects.filter(p => {
      const completedStages = p.stages.filter(s => s.status === '완료').length;
      return completedStages === p.stages.length;
    }),
    [allProjects]
  );

  // 총 견적 금액
  const totalQuoted = useMemo(() => 
    allProjects.reduce((sum, p) => sum + p.quotedAmount, 0),
    [allProjects]
  );

  // 총 계약 금액
  const totalContracted = useMemo(() => 
    allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0),
    [allProjects]
  );

  // 계약 전환율
  const contractRate = useMemo(() => 
    totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0,
    [totalQuoted, totalContracted]
  );

  return {
    allProjects,
    activeProjects,
    completedProjects,
    totalQuoted,
    totalContracted,
    contractRate
  };
};