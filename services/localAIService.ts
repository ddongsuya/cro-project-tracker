// 무료 로컬 AI 서비스 (Ollama 사용)
import type { Project, Test, Client } from '../types';

export class LocalAIService {
  private baseUrl = 'http://localhost:11434'; // Ollama 기본 포트

  // 간단한 프로젝트 분석 (로컬 AI 사용)
  async analyzeProjectProgress(project: Project): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2', // 무료 모델
          prompt: `다음 CRO 프로젝트를 분석해주세요:
          
프로젝트: ${project.testItem}
견적금액: ${project.quotedAmount.toLocaleString()}원
계약금액: ${project.contractedAmount?.toLocaleString() || '미정'}원
현재 상태: ${project.statusText}

간단히 분석하고 개선점을 제안해주세요.`,
          stream: false
        })
      });

      const data = await response.json();
      return data.response || '분석 결과를 가져올 수 없습니다.';
    } catch (error) {
      return '로컬 AI 서버에 연결할 수 없습니다. Ollama가 실행 중인지 확인해주세요.';
    }
  }

  // 기본적인 일정 분석
  async optimizeTestSchedule(tests: Test[]): Promise<string> {
    if (tests.length === 0) return '분석할 시험이 없습니다.';

    // 간단한 로직으로 일정 충돌 검사
    const conflicts: string[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      for (let j = i + 1; j < tests.length; j++) {
        const test1 = tests[i];
        const test2 = tests[j];
        
        const start1 = new Date(test1.startDate);
        const end1 = new Date(test1.endDate);
        const start2 = new Date(test2.startDate);
        const end2 = new Date(test2.endDate);
        
        // 일정 겹침 확인
        if (start1 <= end2 && start2 <= end1) {
          conflicts.push(`${test1.testNumber}와 ${test2.testNumber}의 일정이 겹칩니다.`);
        }
      }
    }

    let result = '📊 시험 일정 분석 결과:\n\n';
    
    if (conflicts.length > 0) {
      result += '⚠️ 발견된 문제점:\n';
      conflicts.forEach(conflict => result += `- ${conflict}\n`);
      result += '\n💡 개선 제안:\n';
      result += '- 겹치는 시험들의 일정을 조정하세요\n';
      result += '- 담당자별 업무량을 재분배하세요\n';
    } else {
      result += '✅ 일정 충돌이 없습니다!\n';
      result += '- 모든 시험이 순차적으로 잘 계획되어 있습니다\n';
    }

    return result;
  }

  // 간단한 리포트 생성
  async generateClientReport(client: Client): Promise<string> {
    const allProjects = client.requesters.flatMap(r => r.projects);
    const totalProjects = allProjects.length;
    const totalQuoted = allProjects.reduce((sum, p) => sum + p.quotedAmount, 0);
    const totalContracted = allProjects.reduce((sum, p) => sum + (p.contractedAmount || 0), 0);
    const totalTests = allProjects.reduce((sum, p) => sum + p.tests.length, 0);

    return `📋 ${client.name} 고객사 현황 리포트

👤 담당자 정보:
- 이름: ${client.contactPerson}
- 이메일: ${client.email}
- 전화: ${client.phone}

📊 프로젝트 현황:
- 총 프로젝트 수: ${totalProjects}개
- 총 견적 금액: ${totalQuoted.toLocaleString()}원
- 총 계약 금액: ${totalContracted.toLocaleString()}원
- 계약률: ${totalContracted > 0 ? ((totalContracted/totalQuoted)*100).toFixed(1) : 0}%
- 총 시험 수: ${totalTests}개

💡 관리 포인트:
${totalContracted === 0 ? '- 계약 체결이 필요한 프로젝트가 있습니다' : '- 계약이 순조롭게 진행되고 있습니다'}
${totalTests === 0 ? '- 시험 일정을 계획해야 합니다' : '- 시험 진행 상황을 주기적으로 점검하세요'}`;
  }
}