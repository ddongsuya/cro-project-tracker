import React, { useState } from 'react';
import { ClaudeService } from '../services/claudeService';
import { FreeAIService } from '../services/freeAIService';
import type { Project, Client } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface AIInsightsProps {
  project?: Project;
  client?: Client;
}

const AIInsights: React.FC<AIInsightsProps> = ({ project, client }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'schedule' | 'report' | 'proposal'>('progress');
  const [useClaudeAPI, setUseClaudeAPI] = useState(false);

  const claudeService = new ClaudeService();
  const freeService = new FreeAIService();

  const handleAnalyzeProgress = async () => {
    if (!project) return;
    
    setLoading(true);
    try {
      const result = useClaudeAPI 
        ? await claudeService.analyzeProjectProgress(project)
        : await freeService.analyzeProjectWithRules(project);
      setInsights(result);
    } catch (error) {
      setInsights('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeSchedule = async () => {
    if (!project || project.tests.length === 0) {
      setInsights('최적화할 시험 일정이 없습니다.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await claudeService.optimizeTestSchedule(project.tests);
      setInsights(result);
    } catch (error) {
      setInsights('일정 최적화 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      const result = await claudeService.generateClientReport(client);
      setInsights(result);
    } catch (error) {
      setInsights('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!project || !client) return;
    
    setLoading(true);
    try {
      const result = await claudeService.generateProjectProposal(project.testItem, client.name);
      setInsights(result);
    } catch (error) {
      setInsights('제안서 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'progress', label: '진행 분석', action: handleAnalyzeProgress, disabled: !project },
    { id: 'schedule', label: '일정 최적화', action: handleOptimizeSchedule, disabled: !project || project.tests.length === 0 },
    { id: 'report', label: '고객사 리포트', action: handleGenerateReport, disabled: !client },
    { id: 'proposal', label: '제안서 생성', action: handleGenerateProposal, disabled: !project || !client },
  ] as const;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI 인사이트</h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useClaudeAPI}
              onChange={(e) => setUseClaudeAPI(e.target.checked)}
              className="mr-1"
            />
            Claude API 사용 (유료)
          </label>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setInsights('');
            }}
            disabled={tab.disabled}
            className={`px-3 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-100 text-purple-700'
                : tab.disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <button
          onClick={tabs.find(t => t.id === activeTab)?.action}
          disabled={loading || tabs.find(t => t.id === activeTab)?.disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span>분석 중...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>AI 분석 시작</span>
            </>
          )}
        </button>

        {insights && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">분석 결과:</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {insights}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;