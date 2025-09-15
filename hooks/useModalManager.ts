import { useState, useCallback } from 'react';
import type { Project, Test } from '../types';

export type ModalState = 
  | { type: 'NONE' }
  | { type: 'ADD_CLIENT' }
  | { type: 'ADD_REQUESTER' }
  | { type: 'ADD_PROJECT' }
  | { type: 'EDIT_PROJECT', project: Project, requesterId: string }
  | { type: 'ADD_TEST' }
  | { type: 'EDIT_TEST', test: Test }
  | { type: 'DATA_MANAGEMENT' }
  | { type: 'PRINT_REPORT' }
  | { type: 'AUTH' }
  | { type: 'TEAM_MANAGEMENT' };

export const useModalManager = () => {
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  const openModal = useCallback((state: ModalState) => {
    setModalState(state);
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: 'NONE' });
  }, []);

  const openAddClientModal = useCallback(() => {
    setModalState({ type: 'ADD_CLIENT' });
  }, []);

  const openAddRequesterModal = useCallback(() => {
    setModalState({ type: 'ADD_REQUESTER' });
  }, []);

  const openAddProjectModal = useCallback(() => {
    setModalState({ type: 'ADD_PROJECT' });
  }, []);

  const openEditProjectModal = useCallback((project: Project, requesterId: string) => {
    setModalState({ type: 'EDIT_PROJECT', project, requesterId });
  }, []);

  const openAddTestModal = useCallback(() => {
    setModalState({ type: 'ADD_TEST' });
  }, []);

  const openEditTestModal = useCallback((test: Test) => {
    setModalState({ type: 'EDIT_TEST', test });
  }, []);

  const openDataManagementModal = useCallback(() => {
    setModalState({ type: 'DATA_MANAGEMENT' });
  }, []);

  const openPrintReportModal = useCallback(() => {
    setModalState({ type: 'PRINT_REPORT' });
  }, []);

  const openAuthModal = useCallback(() => {
    setModalState({ type: 'AUTH' });
  }, []);

  const openTeamManagementModal = useCallback(() => {
    setModalState({ type: 'TEAM_MANAGEMENT' });
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    openAddClientModal,
    openAddRequesterModal,
    openAddProjectModal,
    openEditProjectModal,
    openAddTestModal,
    openEditTestModal,
    openDataManagementModal,
    openPrintReportModal,
    openAuthModal,
    openTeamManagementModal
  };
};