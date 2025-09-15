import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Client, Project } from '../types';
import PrinterIcon from './icons/PrinterIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';

interface PrintReportProps {
  clients: Client[];
  selectedClient?: Client;
  selectedProject?: Project;
}

const PrintReport: React.FC<PrintReportProps> = ({ clients, selectedClient, selectedProject }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<'dashboard' | 'client' | 'project'>('dashboard');

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 한글 폰트 설정 (기본 폰트로 대체)
      pdf.setFont('helvetica');
      
      let yPosition = 20;
      
      // 헤더
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // blue-500
      pdf.text('Corestemchemon', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('ko-KR')}`, 20, yPosition);
      
      yPosition += 20;
      
      if (reportType === 'dashboard') {
        await generateDashboardReport(pdf, yPosition);
      } else if (reportType === 'client' && selectedClient) {
        await generateClientReport(pdf, selectedClient, yPosition);
      } else if (reportType === 'project' && selectedProject && selectedClient) {
        await generateProjectReport(pdf, selectedClient, selectedProject, yPosition);
      }
      
      // PDF 저장
      const fileName = `CRO-Report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDashboardReport = async (pdf: jsPDF, startY: number) => {
    let yPos = startY;
    
    // 제목
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Dashboard Summary Report', 20, yPos);
    yPos += 15;
    
    // 전체 통계
    const allProjects = clients.flatMap(c => c.requesters.flatMap(r => r.projects));
    const totalQuoted = allProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const totalContracted = allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const contractRate = totalQuoted > 0 ? (totalContracted / totalQuoted) * 100 : 0;
    
    pdf.setFontSize(12);
    pdf.text(`Total Clients: ${clients.length}`, 20, yPos);
    yPos += 8;
    pdf.text(`Total Projects: ${allProjects.length}`, 20, yPos);
    yPos += 8;
    pdf.text(`Total Quoted Amount: ${(totalQuoted / 100000000).toFixed(1)} billion KRW`, 20, yPos);
    yPos += 8;
    pdf.text(`Total Contracted Amount: ${(totalContracted / 100000000).toFixed(1)} billion KRW`, 20, yPos);
    yPos += 8;
    pdf.text(`Contract Rate: ${contractRate.toFixed(1)}%`, 20, yPos);
    yPos += 15;
    
    // 고객사별 요약
    pdf.setFontSize(14);
    pdf.text('Client Summary', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    clients.forEach((client, index) => {
      if (yPos > 250) { // 페이지 끝에 가까우면 새 페이지
        pdf.addPage();
        yPos = 20;
      }
      
      const clientProjects = client.requesters.flatMap(r => r.projects);
      const clientQuoted = clientProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
      
      pdf.text(`${index + 1}. ${client.name}`, 25, yPos);
      yPos += 6;
      pdf.text(`   Projects: ${clientProjects.length}, Quoted: ${(clientQuoted / 10000).toFixed(0)}M KRW`, 30, yPos);
      yPos += 8;
    });
  };

  const generateClientReport = async (pdf: jsPDF, client: Client, startY: number) => {
    let yPos = startY;
    
    // 고객사 정보
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Client Report: ${client.name}`, 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.text(`Contact Person: ${client.contactPerson}`, 20, yPos);
    yPos += 8;
    pdf.text(`Email: ${client.email}`, 20, yPos);
    yPos += 8;
    pdf.text(`Phone: ${client.phone}`, 20, yPos);
    yPos += 15;
    
    // 프로젝트 목록
    pdf.setFontSize(14);
    pdf.text('Projects', 20, yPos);
    yPos += 10;
    
    client.requesters.forEach((requester, reqIndex) => {
      if (requester.projects.length > 0) {
        pdf.setFontSize(12);
        pdf.text(`Requester: ${requester.name} (${requester.department})`, 20, yPos);
        yPos += 8;
        
        requester.projects.forEach((project, projIndex) => {
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFontSize(10);
          pdf.text(`${projIndex + 1}. ${project.testItem}`, 25, yPos);
          yPos += 6;
          pdf.text(`   Quote Date: ${project.quoteDate}`, 30, yPos);
          yPos += 5;
          pdf.text(`   Amount: ${project.quotedAmount.toLocaleString()} KRW`, 30, yPos);
          yPos += 5;
          pdf.text(`   Status: ${project.statusText}`, 30, yPos);
          yPos += 8;
        });
        yPos += 5;
      }
    });
  };

  const generateProjectReport = async (pdf: jsPDF, client: Client, project: Project, startY: number) => {
    let yPos = startY;
    
    // 프로젝트 정보
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Project Detail Report', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.text(`Client: ${client.name}`, 20, yPos);
    yPos += 8;
    pdf.text(`Test Item: ${project.testItem}`, 20, yPos);
    yPos += 8;
    pdf.text(`Quote Date: ${project.quoteDate}`, 20, yPos);
    yPos += 8;
    pdf.text(`Quoted Amount: ${project.quotedAmount.toLocaleString()} KRW`, 20, yPos);
    yPos += 8;
    if (project.contractedAmount) {
      pdf.text(`Contracted Amount: ${project.contractedAmount.toLocaleString()} KRW`, 20, yPos);
      yPos += 8;
    }
    pdf.text(`Status: ${project.statusText}`, 20, yPos);
    yPos += 15;
    
    // 진행 단계
    pdf.setFontSize(14);
    pdf.text('Project Stages', 20, yPos);
    yPos += 10;
    
    project.stages.forEach((stage, index) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(10);
      const statusColor = stage.status === '완료' ? [34, 197, 94] : 
                         stage.status === '진행중' ? [59, 130, 246] : [156, 163, 175];
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`${index + 1}. ${stage.name} - ${stage.status}`, 25, yPos);
      yPos += 6;
      
      if (stage.startDate) {
        pdf.setTextColor(100, 100, 100);
        pdf.text(`   Start: ${stage.startDate}`, 30, yPos);
        yPos += 5;
      }
      if (stage.endDate) {
        pdf.text(`   End: ${stage.endDate}`, 30, yPos);
        yPos += 5;
      }
      if (stage.notes) {
        pdf.text(`   Notes: ${stage.notes}`, 30, yPos);
        yPos += 5;
      }
      yPos += 3;
    });
    
    // 시험 정보
    if (project.tests.length > 0) {
      yPos += 10;
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Tests', 20, yPos);
      yPos += 10;
      
      project.tests.forEach((test, index) => {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(10);
        pdf.text(`${index + 1}. ${test.testName}`, 25, yPos);
        yPos += 6;
        pdf.text(`   Method: ${test.testMethod}`, 30, yPos);
        yPos += 5;
        pdf.text(`   Standard: ${test.testStandard}`, 30, yPos);
        yPos += 5;
        pdf.text(`   Status: ${test.status}`, 30, yPos);
        yPos += 8;
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <PrinterIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">리포트 출력</h3>
      </div>
      
      <div className="space-y-4">
        {/* 리포트 타입 선택 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            리포트 유형
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setReportType('dashboard')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                reportType === 'dashboard'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">대시보드</div>
                <div className="text-xs">전체 현황</div>
              </div>
            </button>
            
            <button
              onClick={() => setReportType('client')}
              disabled={!selectedClient}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                reportType === 'client'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : selectedClient
                  ? 'border-slate-200 hover:border-slate-300 text-slate-600'
                  : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🏢</div>
                <div className="font-medium">고객사</div>
                <div className="text-xs">선택된 고객사</div>
              </div>
            </button>
            
            <button
              onClick={() => setReportType('project')}
              disabled={!selectedProject}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                reportType === 'project'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : selectedProject
                  ? 'border-slate-200 hover:border-slate-300 text-slate-600'
                  : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="font-medium">프로젝트</div>
                <div className="text-xs">선택된 프로젝트</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* 선택된 항목 정보 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-700 mb-2">출력 대상</h4>
          {reportType === 'dashboard' && (
            <p className="text-sm text-slate-600">
              전체 {clients.length}개 고객사의 종합 현황 리포트
            </p>
          )}
          {reportType === 'client' && selectedClient && (
            <p className="text-sm text-slate-600">
              {selectedClient.name} - {selectedClient.requesters.flatMap(r => r.projects).length}개 프로젝트
            </p>
          )}
          {reportType === 'project' && selectedProject && selectedClient && (
            <p className="text-sm text-slate-600">
              {selectedClient.name} - {selectedProject.testItem}
            </p>
          )}
          {((reportType === 'client' && !selectedClient) || (reportType === 'project' && !selectedProject)) && (
            <p className="text-sm text-amber-600">
              먼저 {reportType === 'client' ? '고객사' : '프로젝트'}를 선택해주세요.
            </p>
          )}
        </div>
        
        {/* 출력 버튼 */}
        <button
          onClick={generatePDF}
          disabled={isGenerating || 
            (reportType === 'client' && !selectedClient) || 
            (reportType === 'project' && !selectedProject)
          }
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>PDF 생성 중...</span>
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>PDF 리포트 다운로드</span>
            </>
          )}
        </button>
      </div>
      
      {/* 사용 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">💡 사용 안내</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 대시보드: 전체 프로젝트 현황과 통계</li>
          <li>• 고객사: 선택된 고객사의 모든 프로젝트 정보</li>
          <li>• 프로젝트: 선택된 프로젝트의 상세 정보와 진행 단계</li>
          <li>• PDF 파일은 자동으로 다운로드됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default PrintReport;