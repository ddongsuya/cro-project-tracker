import Anthropic from '@anthropic-ai/sdk';
import type { Project, Test, Client } from '../types';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // 프로덕션에서는 백엔드에서 처리 권장
});

export class ClaudeService {
  // 프로젝트 진행 상황 분석 및 제안
  async analyzeProjectProgress(project: Project): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `다음 CRO 프로젝트의 진행 상황을 분석하고 개선 제안을 해주세요:

프로젝트: ${project.testItem}
견적금액: ${project.quotedAmount.toLocaleString()}원
계약금액: ${project.contractedAmount?.toLocaleString() || '미정'}원
현재 상태: ${project.statusText}

진행 단계:
${project.stages.map(stage => `- ${stage.name}: ${stage.status} ${stage.date ? `(${stage.date})` : ''}`).join('\n')}

시험 정보:
${project.tests.map(test => `- ${test.testNumber}: ${test.testManager} (${test.startDate} ~ ${test.endDate})`).join('\n')}

분석 결과를 한국어로 간결하게 정리해주세요.`
        }]
      });

      return message.content[0].type === 'text' ? message.content[0].text : '분석 결과를 가져올 수 없습니다.';
    } catch (error) {
      console.error('Claude API 오류:', error);
      return '분석 중 오류가 발생했습니다.';
    }
  }

  // 시험 일정 최적화 제안
  async optimizeTestSchedule(tests: Test[]): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `다음 시험 일정들을 분석하고 최적화 방안을 제안해주세요:

${tests.map(test => `
시험번호: ${test.testNumber}
담당자: ${test.testManager}
기간: ${test.startDate} ~ ${test.endDate}
`).join('\n')}

일정 충돌, 리소스 배분, 효율성 관점에서 개선 제안을 해주세요.`
        }]
      });

      return message.content[0].type === 'text' ? message.content[0].text : '최적화 제안을 가져올 수 없습니다.';
    } catch (error) {
      console.error('Claude API 오류:', error);
      return '일정 최적화 분석 중 오류가 발생했습니다.';
    }
  }

  // 고객사별 프로젝트 요약 리포트 생성
  async generateClientReport(client: Client): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: `다음 고객사의 프로젝트 현황을 종합적으로 분석하여 리포트를 작성해주세요:

고객사: ${client.name}
담당자: ${client.contactPerson}
연락처: ${client.email}, ${client.phone}

프로젝트 목록:
${client.requesters.flatMap(r => r.projects).map(project => `
- ${project.id}: ${project.testItem}
  견적: ${project.quotedAmount.toLocaleString()}원
  계약: ${project.contractedAmount?.toLocaleString() || '미정'}원
  상태: ${project.statusText}
  시험 수: ${project.tests.length}개
`).join('\n')}

다음 항목들을 포함한 종합 리포트를 작성해주세요:
1. 전체 프로젝트 현황 요약
2. 매출 분석
3. 진행 상황 평가
4. 향후 관리 방안`
        }]
      });

      return message.content[0].type === 'text' ? message.content[0].text : '리포트를 생성할 수 없습니다.';
    } catch (error) {
      console.error('Claude API 오류:', error);
      return '리포트 생성 중 오류가 발생했습니다.';
    }
  }

  // 프로젝트 제안서 초안 생성
  async generateProjectProposal(testItem: string, clientName: string): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `${clientName}사의 "${testItem}" 프로젝트에 대한 CRO 제안서 초안을 작성해주세요.

다음 내용을 포함해주세요:
1. 프로젝트 개요
2. 시험 방법론
3. 예상 일정
4. 필요 리소스
5. 품질 보증 방안

전문적이면서도 이해하기 쉽게 한국어로 작성해주세요.`
        }]
      });

      return message.content[0].type === 'text' ? message.content[0].text : '제안서를 생성할 수 없습니다.';
    } catch (error) {
      console.error('Claude API 오류:', error);
      return '제안서 생성 중 오류가 발생했습니다.';
    }
  }
}