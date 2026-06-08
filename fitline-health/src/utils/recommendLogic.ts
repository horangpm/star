import { SajuResult } from './sajuLogic';
import { HealthCheck } from '../store/useHealthStore';

export interface RecommendedProduct {
  productName: string;
  reason: string;
  pmUrl: string;
}

const PM_URL = 'https://horangpm.linkstory.co.kr';

export function recommendProducts(saju: SajuResult, healthCheck: HealthCheck): RecommendedProduct[] {
  const recommendations: RecommendedProduct[] = [];
  const addedProducts = new Set<string>();

  const addProduct = (name: string, reason: string) => {
    if (!addedProducts.has(name) && recommendations.length < 3) {
      recommendations.push({ productName: name, reason, pmUrl: PM_URL });
      addedProducts.add(name);
    }
  };

  // 1. 오행별 1순위 제품 매핑
  switch (saju.dominantElement) {
    case '목':
      addProduct('Restorate', '미네랄과 산-염기 균형을 통해 간의 부담을 완화해줍니다.');
      break;
    case '화':
      addProduct('Activize Oxyplus', '풍부한 산소 공급으로 심혈관 건강과 에너지 생성에 도움을 줍니다.');
      break;
    case '토':
      addProduct('PowerCocktail', '종합 영양 공급으로 소화와 대사 기능을 원활하게 지원합니다.');
      break;
    case '금':
      addProduct('PowerCocktail', '필수 비타민과 미네랄 기초를 채워 호흡기 및 면역력 강화에 좋습니다.');
      break;
    case '수':
      addProduct('Restorate', '필수 미네랄 보충으로 신장 기능과 체액 순환을 돕습니다.');
      addProduct('Omega 3', '혈행 개선을 통해 체내 원활한 순환을 지원합니다.');
      break;
  }

  // 2. 건강 체크 결과에 따른 약한 영역 추가 추천
  if (healthCheck.fatigue < 60) {
    addProduct('Activize Oxyplus', '피로감이 높으신 편이네요. 즉각적인 에너지 부스팅이 필요합니다.');
  }
  if (healthCheck.sleep < 60) {
    addProduct('Restorate', '수면의 질이 떨어져 있습니다. 깊은 숙면을 돕는 미네랄 충전이 필요해요.');
  }
  if (healthCheck.digestion < 60) {
    addProduct('PowerCocktail', '소화가 자주 불편하신가요? 장 건강과 소화 효소 보충을 추천합니다.');
  }
  if (healthCheck.immunity < 60) {
    addProduct('PowerCocktail', '면역력이 저하되어 잔병치레가 걱정됩니다. 항산화 면역 케어가 필요합니다.');
  }

  // 여전히 3개가 안 채워졌다면 점수가 가장 낮은 순서대로 기본 추천
  const sortedHealth = Object.entries(healthCheck).sort((a, b) => a[1] - b[1]);
  for (const [key] of sortedHealth) {
    if (recommendations.length >= 3) break;
    if (key === 'stamina') addProduct('Munogen', '전반적인 일상 체력이 부족하여, 혈관 건강과 지구력 개선을 추천해요.');
    if (key === 'fatigue' && !addedProducts.has('Activize Oxyplus')) addProduct('Activize Oxyplus', '만성 피로 회복을 위해 활력 에너지가 필요합니다.');
  }

  return recommendations;
}
