import React, { useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebaseService';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import UserIcon from './icons/UserIcon';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: 'meeting' | 'task' | 'deadline' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  scope: 'personal' | 'team' | 'company';
  assignedTo?: string[]; // 사용자 이메일 배열
  createdBy: string;
  createdAt: Date;
  completed?: boolean;
}

interface CalendarProps {
  currentUser: any;
  viewScope: 'personal' | 'team' | 'company';
}

const Calendar: React.FC<CalendarProps> = ({ currentUser, viewScope }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    loadEvents();
  }, [currentUser, viewScope, currentDate]);

  const loadEvents = async () => {
    try {
      // 실제로는 Firebase에서 이벤트를 로드해야 하지만, 임시로 더미 데이터 사용
      const dummyEvents: CalendarEvent[] = [
        {
          id: '1',
          title: '고객사 미팅',
          description: '중앙미생물연구소 프로젝트 논의',
          date: '2025-01-15',
          time: '14:00',
          type: 'meeting',
          priority: 'high',
          scope: 'team',
          assignedTo: [currentUser?.email],
          createdBy: currentUser?.email || '',
          createdAt: new Date(),
        },
        {
          id: '2',
          title: '견적서 제출 마감',
          description: '4주 DRF 시험 견적서',
          date: '2025-01-18',
          time: '17:00',
          type: 'deadline',
          priority: 'high',
          scope: 'personal',
          assignedTo: [currentUser?.email],
          createdBy: currentUser?.email || '',
          createdAt: new Date(),
        },
        {
          id: '3',
          title: '팀 회의',
          description: '월간 성과 리뷰',
          date: '2025-01-20',
          time: '10:00',
          type: 'meeting',
          priority: 'medium',
          scope: 'team',
          assignedTo: [],
          createdBy: currentUser?.email || '',
          createdAt: new Date(),
        }
      ];
      
      setEvents(dummyEvents);
    } catch (error) {
      console.error('이벤트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 마지막 날들
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: formatDate(prevDate)
      });
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: formatDate(currentDate)
      });
    }
    
    // 다음 달의 첫 날들 (42개 칸을 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: formatDate(nextDate)
      });
    }
    
    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (dateString: string): CalendarEvent[] => {
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'task':
        return 'bg-green-500';
      case 'deadline':
        return 'bg-red-500';
      case 'reminder':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'meeting':
        return <UserGroupIcon className="h-3 w-3" />;
      case 'task':
        return <ClockIcon className="h-3 w-3" />;
      case 'deadline':
        return <CalendarIcon className="h-3 w-3" />;
      case 'reminder':
        return <UserIcon className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getScopeLabel = (scope: string): string => {
    switch (scope) {
      case 'personal':
        return '개인';
      case 'team':
        return '팀';
      case 'company':
        return '전체';
      default:
        return '알 수 없음';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 달력 헤더 */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </h2>
              <p className="text-slate-600">
                {getScopeLabel(viewScope)} 일정 ({events.length}개)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              오늘
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 요일 헤더 */}
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-medium ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              {day}
            </div>
          ))}
          
          {/* 날짜 셀 */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.dateString);
            const isToday = day.dateString === formatDate(new Date());
            const isSelected = selectedDate === day.dateString;
            
            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day.dateString)}
                className={`
                  min-h-[80px] p-2 border border-slate-200 cursor-pointer transition-all duration-200
                  hover:bg-slate-50 relative
                  ${!day.isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white'}
                  ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 
                  !day.isCurrentMonth ? 'text-slate-400' : 'text-slate-800'
                }`}>
                  {day.date.getDate()}
                </div>
                
                {/* 이벤트 표시 */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`
                        px-1 py-0.5 rounded text-xs text-white truncate flex items-center gap-1
                        ${getEventTypeColor(event.type)}
                      `}
                      title={event.title}
                    >
                      {getEventTypeIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-500 px-1">
                      +{dayEvents.length - 2}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜의 이벤트 상세 */}
      {selectedDate && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {new Date(selectedDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })} 일정
            </h3>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              + 일정 추가
            </button>
          </div>
          
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>이 날에는 일정이 없습니다.</p>
              </div>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg text-white ${getEventTypeColor(event.type)}`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {event.time}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full ${
                            event.scope === 'personal' ? 'bg-blue-100 text-blue-700' :
                            event.scope === 'team' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {getScopeLabel(event.scope)}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            event.priority === 'high' ? 'bg-red-100 text-red-700' :
                            event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {event.priority === 'high' ? '높음' : 
                             event.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.type === 'task' && (
                        <button
                          onClick={() => {
                            // 할 일 완료 처리
                            console.log('Task completed:', event.id);
                          }}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            event.completed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                          }`}
                        >
                          {event.completed ? '완료됨' : '완료'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;