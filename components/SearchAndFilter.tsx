import React, { useState } from 'react';
import type { Client, StageStatus } from '../types';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import FunnelIcon from './icons/FunnelIcon';
import XMarkIcon from './icons/XMarkIcon';

interface SearchAndFilterProps {
  clients: Client[];
  onFilteredResults: (filteredClients: Client[], hasActiveSearch: boolean) => void;
}

interface FilterOptions {
  searchTerm: string;
  statusFilter: string;
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: number;
    max: number;
  };
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ clients, onFilteredResults }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    dateRange: { start: '', end: '' },
    amountRange: { min: 0, max: 0 }
  });

  // 최대 금액 계산
  const maxAmount = Math.max(...clients.flatMap(c => 
    c.requesters.flatMap(r => r.projects.map(p => p.quotedAmount))
  ));

  const applyFilters = (newFilters: FilterOptions) => {
    let filtered = [...clients];
    const hasActiveSearch = !!(
      newFilters.searchTerm || 
      newFilters.statusFilter !== 'all' || 
      newFilters.dateRange.start || 
      newFilters.dateRange.end || 
      newFilters.amountRange.min > 0 || 
      newFilters.amountRange.max < maxAmount
    );

    // 검색어 필터링 (새로운 구조에 맞게 수정)
    if (newFilters.searchTerm) {
      const searchLower = newFilters.searchTerm.toLowerCase();
      filtered = filtered.map(client => {
        const filteredRequesters = client.requesters.map(requester => ({
          ...requester,
          projects: requester.projects.filter(project =>
            client.name.toLowerCase().includes(searchLower) ||
            requester.name.toLowerCase().includes(searchLower) ||
            project.testItem.toLowerCase().includes(searchLower) ||
            project.id.toLowerCase().includes(searchLower) ||
            project.statusText.toLowerCase().includes(searchLower)
          )
        }));
        
        return {
          ...client,
          requesters: filteredRequesters
        };
      }).filter(client => 
        client.name.toLowerCase().includes(searchLower) || 
        client.requesters.some(r => 
          r.name.toLowerCase().includes(searchLower) || 
          r.projects.length > 0
        )
      );
    }

    // 상태 필터링 (새로운 구조에 맞게 수정)
    if (newFilters.statusFilter !== 'all') {
      filtered = filtered.map(client => ({
        ...client,
        requesters: client.requesters.map(requester => ({
          ...requester,
          projects: requester.projects.filter(project => {
            const completedStages = project.stages.filter(s => s.status === '완료').length;
            const totalStages = project.stages.length;
            const progressRate = (completedStages / totalStages) * 100;

            switch (newFilters.statusFilter) {
              case 'completed': return progressRate === 100;
              case 'in-progress': return progressRate > 0 && progressRate < 100;
              case 'not-started': return progressRate === 0;
              case 'contracted': return project.contractedAmount !== undefined;
              case 'quoted': return project.contractedAmount === undefined;
              default: return true;
            }
          })
        }))
      })).filter(client => client.requesters.some(r => r.projects.length > 0));
    }

    // 날짜 범위 필터링 (새로운 구조에 맞게 수정)
    if (newFilters.dateRange.start || newFilters.dateRange.end) {
      filtered = filtered.map(client => ({
        ...client,
        requesters: client.requesters.map(requester => ({
          ...requester,
          projects: requester.projects.filter(project => {
            const quoteDate = new Date(project.quoteDate);
            const startDate = newFilters.dateRange.start ? new Date(newFilters.dateRange.start) : new Date('1900-01-01');
            const endDate = newFilters.dateRange.end ? new Date(newFilters.dateRange.end) : new Date('2100-12-31');
            
            return quoteDate >= startDate && quoteDate <= endDate;
          })
        }))
      })).filter(client => client.requesters.some(r => r.projects.length > 0));
    }

    // 금액 범위 필터링 (새로운 구조에 맞게 수정)
    if (newFilters.amountRange.min > 0 || newFilters.amountRange.max > 0) {
      const minAmount = newFilters.amountRange.min;
      const maxAmount = newFilters.amountRange.max || Infinity;
      
      filtered = filtered.map(client => ({
        ...client,
        requesters: client.requesters.map(requester => ({
          ...requester,
          projects: requester.projects.filter(project => 
            project.quotedAmount >= minAmount && project.quotedAmount <= maxAmount
          )
        }))
      })).filter(client => client.requesters.some(r => r.projects.length > 0));
    }

    onFilteredResults(filtered, hasActiveSearch);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      searchTerm: '',
      statusFilter: 'all',
      dateRange: { start: '', end: '' },
      amountRange: { min: 0, max: 0 }
    };
    setFilters(clearedFilters);
    onFilteredResults(clients, false); // 검색이 비활성화됨을 알림
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.statusFilter !== 'all' || 
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.amountRange.min > 0 || 
    filters.amountRange.max > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8">
      <div className="flex items-center gap-4 mb-6">
        {/* 검색창 */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="고객사명, 프로젝트명, 상태로 검색..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* 필터 토글 버튼 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
          <span>필터</span>
        </button>

        {/* 필터 초기화 버튼 */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            <XMarkIcon className="h-5 w-5" />
            <span>초기화</span>
          </button>
        )}
      </div>

      {/* 상세 필터 */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">진행 상태</label>
            <select
              value={filters.statusFilter}
              onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="completed">완료</option>
              <option value="in-progress">진행중</option>
              <option value="not-started">시작전</option>
              <option value="contracted">계약완료</option>
              <option value="quoted">견적단계</option>
            </select>
          </div>

          {/* 날짜 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">견적일 (시작)</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">견적일 (종료)</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 금액 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              견적금액 (최소: {filters.amountRange.min.toLocaleString()}원)
            </label>
            <input
              type="range"
              min="0"
              max={maxAmount}
              step="1000000"
              value={filters.amountRange.min}
              onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;