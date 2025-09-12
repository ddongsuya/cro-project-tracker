// 무료 AI API 서비스들
import type { Project, Test, Client } from '../types';

export class FreeAIService {
  
  // Hugging Face 무료 API 사용
  async analyzeWithHuggingFace(project: Project): Promise<string> {
    try {
      // 무료 모델 사용 (API 키 불필요한 경우도 있음)
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `프로젝트 분석: ${project.testItem}, 상태: ${project.statusText}`
        })
      });

      const data = await response.json();
      return data.generated_text || '분석 결과를 가져올 수 없습니다.';
    } catch (error) {
      return 'Hugging Face API 연결 오류';
    }
  }

  // 간단한 규칙 기반 분석 (AI 없이)
  async analyzeProjectWithRules(project: Project): Promise<string> {
    let analysis = `📊 ${project.testItem} 프로젝트 분석\n\n`;

    // 계약률 분석
    if (project.contractedAmount && project.quotedAmount) {
      const contractRate = (project.contractedAmount / project.quotedAmount) * 100;
      if (contractRate >= 95) {
        analysis += '✅ 견적 대비 계약률이 우수합니다 (95% 이상)\n';
      } else if (contractRate >= 80) {
        analysis += '👍 견적 대비 계약률이 양호합니다 (80-95%)\n';
      } else {
        analysis += '⚠️ 견적 대비 계약률이 낮습니다. 협상이 필요할 수 있습니다\n';
      }
    }

    // 진행 단계 분석
    const completedStages = project.stages.filter(s => s.status === '완료').length;
    const totalStages = project.stages.length;
    const progressRate = (completedStages / totalStages) * 100;

    analysis += `\n📈 진행률: ${progressRate.toFixed(1)}% (${completedStages}/${totalStages} 단계 완료)\n`;

    if (progressRate >= 80) {
      analysis += '🚀 프로젝트가 거의 완료 단계입니다\n';
    } else if (progressRate >= 50) {
      analysis += '⏳ 프로젝트가 중반 단계입니다\n';
    } else {
      analysis += '🏁 프로젝트가 초기 단계입니다\n';
    }

    // 시험 분석
    if (project.tests.length > 0) {
      analysis += `\n🧪 시험 현황: ${project.tests.length}개 시험 등록\n`;
      
      const now = new Date();
      const ongoingTests = project.tests.filter(test => {
        const start = new Date(test.startDate);
        const end = new Date(test.endDate);
        return start <= now && now <= end;
      });

      if (ongoingTests.length > 0) {
        analysis += `⚡ 현재 진행 중인 시험: ${ongoingTests.length}개\n`;
      }
    } else {
      analysis += '\n📝 시험 일정을 등록해야 합니다\n';
    }

    // 개선 제안
    analysis += '\n💡 개선 제안:\n';
    if (progressRate < 50) {
      analysis += '- 다음 단계 진행을 위한 액션 플랜 수립\n';
    }
    if (project.tests.length === 0) {
      analysis += '- 시험 계획 및 일정 수립\n';
    }
    if (!project.contractedAmount) {
      analysis += '- 계약 체결을 위한 후속 조치 필요\n';
    }

    return analysis;
  }
}