import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Client, Project } from '../types';
import BellIcon from './icons/BellIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import XMarkIcon from './icons/XMarkIcon';

interface NotificationSystemProps {
  clients: Client[];
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'urgent';
  title: string;
  message: string;
  clientName: string;
  projectId?: string;
  date: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ clients }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    clients.forEach(client => {
      const allProjects = client.requesters.flatMap(r => r.projects);
      allProjects.forEach(project => {
        // 1. 견적 후 오랫동안 응답이 없는 경우
        const quoteDate = new Date(project.quoteDate);
        const daysSinceQuote = Math.floor((today.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!project.contractedAmount && daysSinceQuote > 14) {
          notifications.push({
            id: `quote-followup-${project.id}`,
            type: 'warning',
            title: '견적 후속 조치 필요',
            message: `견적 송부 후 ${daysSinceQuote}일이 경과했습니다. 고객 응답을 확인해보세요.`,
            clientName: client.name,
            projectId: project.id,
            date: today.toISOString()
          });
        }

        // 2. 계약은 했지만 시험이 시작되지 않은 경우
        if (project.contractedAmount && project.tests.length === 0) {
          const contractStage = project.stages.find(s => s.name === '계약 체결');
          if (contractStage?.status === '완료' && contractStage.date) {
            const contractDate = new Date(contractStage.date);
            const daysSinceContract = Math.floor((today.getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceContract > 7) {
              notifications.push({
                id: `test-schedule-${project.id}`,
                type: 'urgent',
                title: '시험 일정 수립 필요',
                message: `계약 체결 후 ${daysSinceContract}일이 경과했으나 시험 일정이 없습니다.`,
                clientName: client.name,
                projectId: project.id,
                date: today.toISOString()
              });
            }
          }
        }

        // 3. 시험 종료 예정 알림
        project.tests.forEach(test => {
          const endDate = new Date(test.endDate);
          const daysUntilEnd = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilEnd >= 0 && daysUntilEnd <= 7) {
            notifications.push({
              id: `test-ending-${test.id}`,
              type: 'info',
              title: '시험 종료 예정',
              message: `${test.testNumber} 시험이 ${daysUntilEnd}일 후 종료 예정입니다.`,
              clientName: client.name,
              projectId: project.id,
              date: today.toISOString()
            });
          }
        });

        // 4. 진행이 멈춘 프로젝트
        const inProgressStages = project.stages.filter(s => s.status === '진행중');
        if (inProgressStages.length > 0) {
          inProgressStages.forEach(stage => {
            if (stage.date) {
              const stageDate = new Date(stage.date);
              const daysSinceUpdate = Math.floor((today.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysSinceUpdate > 10) {
                notifications.push({
                  id: `stalled-project-${project.id}-${stage.id}`,
                  type: 'warning',
                  title: '프로젝트 진행 지연',
                  message: `"${stage.name}" 단계가 ${daysSinceUpdate}일째 진행 중입니다.`,
                  clientName: client.name,
                  projectId: project.id,
                  date: today.toISOString()
                });
              }
            }
          });
        }

        // 5. 시험 일정 충돌
        for (let i = 0; i < project.tests.length; i++) {
          for (let j = i + 1; j < project.tests.length; j++) {
            const test1 = project.tests[i];
            const test2 = project.tests[j];
            
            const start1 = new Date(test1.startDate);
            const end1 = new Date(test1.endDate);
            const start2 = new Date(test2.startDate);
            const end2 = new Date(test2.endDate);
            
            if (start1 <= end2 && start2 <= end1) {
              notifications.push({
                id: `schedule-conflict-${test1.id}-${test2.id}`,
                type: 'urgent',
                title: '시험 일정 충돌',
                message: `${test1.testNumber}와 ${test2.testNumber}의 일정이 겹칩니다.`,
                clientName: client.name,
                projectId: project.id,
                date: today.toISOString()
              });
            }
          }
        }
      });
    });

    return notifications.filter(n => !dismissedNotifications.has(n.id));
  };

  useEffect(() => {
    const newNotifications = generateNotifications();
    setNotifications(newNotifications);
  }, [clients, dismissedNotifications]);

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const urgentCount = notifications.filter(n => n.type === 'urgent').length;
  const totalCount = notifications.length;

  return (
    <div className="relative">
      {/* 알림 버튼 */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2 rounded-full transition-colors ${
          totalCount > 0 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={`${totalCount}개의 알림`}
      >
        <BellIcon className="h-6 w-6" />
        {totalCount > 0 && (
          <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold text-white flex items-center justify-center ${
            urgentCount > 0 ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {/* 알림 패널 - Portal로 렌더링 */}
      {showNotifications && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-start justify-end p-4 pt-20">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          {/* 알림 패널 */}
          <div className="relative w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-hidden animate-in slide-in-from-right-5 duration-300"
               style={{ 
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
               }}>
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">알림</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {totalCount > 0 && (
              <p className="text-sm text-gray-600 mt-2 font-medium">
                {totalCount}개의 알림 {urgentCount > 0 && `(긴급 ${urgentCount}개)`}
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">🔔</div>
                <h4 className="font-medium text-gray-700 mb-2">새로운 알림이 없습니다</h4>
                <p className="text-sm">모든 프로젝트가 순조롭게 진행되고 있습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-5 border-l-4 hover:bg-gray-50 transition-colors duration-200 ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{notification.clientName}</span>
                            {notification.projectId && (
                              <>
                                <span>•</span>
                                <span>{notification.projectId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
              <button
                onClick={() => setDismissedNotifications(new Set(notifications.map(n => n.id)))}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                모든 알림 지우기
              </button>
            </div>
          )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationSystem;