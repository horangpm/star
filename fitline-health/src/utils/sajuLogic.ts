import { SajuInput } from '../store/useSajuStore';

export interface YearlyLuck {
  overall: number;
  stamina: number;
  digestion: number;
  mentalHealth: number;
}

export interface SajuResult {
  dominantElement: '목' | '화' | '토' | '금' | '수';
  elementBalance: { 목: number; 화: number; 토: number; 금: number; 수: number };
  weakOrgans: string[];
  constitutionType: string;
  constitutionDesc: string;
  yearlyLuck: YearlyLuck;
  warningMonths: string;
  warningDesc: string;
}

export function analyzeSaju(input: SajuInput): SajuResult {
  const elements: Array<'목' | '화' | '토' | '금' | '수'> = ['목', '화', '토', '금', '수'];
  const elementIndex = (input.birthYear ?? 1990) % 5;
  const dominantElement = elements[elementIndex];

  const elementBalance = { 목: 10, 화: 10, 토: 10, 금: 10, 수: 10 };
  elementBalance[dominantElement] = 60;

  let weakOrgans: string[] = [];
  let constitutionType = '';
  let constitutionDesc = '';

  switch (dominantElement) {
    case '목':
      weakOrgans = ['간', '담낭', '근육'];
      constitutionType = '목(木) 태과 체질 (간·담 취약)';
      constitutionDesc = '사주에 목(木) 기운이 강하여 간과 담낭의 기능에 부담이 가기 쉬운 체질입니다. 스트레스를 받으면 기운이 뭉쳐 피로감을 쉽게 느끼며, 근육이 경직되거나 눈이 쉽게 피로해질 수 있습니다. 평소 충분한 수면을 취하고 간 해독에 신경 쓰는 것이 중요합니다.';
      break;
    case '화':
      weakOrgans = ['심장', '소장', '혈관'];
      constitutionType = '화(火) 태과 체질 (심혈관 취약)';
      constitutionDesc = '화(火) 기운이 강해 열이 상체로 쏠리기 쉬운 체질입니다. 심장과 소장의 기능에 무리가 올 수 있으며, 땀을 많이 흘리거나 가슴이 답답하고 두근거리는 증상이 나타날 수 있습니다. 열을 식혀주는 신선한 채소 위주의 식단과 심혈관 관리가 필수적입니다.';
      break;
    case '토':
      weakOrgans = ['비장', '위장', '소화기'];
      constitutionType = '토(土) 태과 체질 (비위 취약)';
      constitutionDesc = '토(土) 기운이 주를 이루어 비장과 위장 등 소화기 계통의 균형이 깨지기 쉬운 체질입니다. 식곤증, 잦은 소화불량, 위산 역류나 몸이 무거워지는 증상을 겪을 수 있습니다. 규칙적이고 담백한 식습관을 유지하며, 소화 효소를 꾸준히 보충하는 것이 좋습니다.';
      break;
    case '금':
      weakOrgans = ['폐', '대장', '호흡기'];
      constitutionType = '금(金) 태과 체질 (폐·호흡기 취약)';
      constitutionDesc = '금(金) 기운이 강하여 건조함에 취약하며 폐와 대장, 기관지의 건강에 각별한 주의가 필요합니다. 환절기에 호흡기 질환에 쉽게 노출되며 피부가 건조해질 수 있습니다. 수분을 충분히 섭취하고 장내 유익균을 늘려 면역력을 방어하는 것이 핵심입니다.';
      break;
    case '수':
      weakOrgans = ['신장', '방광', '비뇨기'];
      constitutionType = '수(水) 태과 체질 (신장·순환 취약)';
      constitutionDesc = '수(水) 기운이 발달하여 신장과 방광 기능이 약해지거나 체액 대사가 원활하지 않을 수 있는 체질입니다. 몸이 차가워지기 쉽고 붓기, 부종, 피로가 하체로 몰리는 경향이 있습니다. 하복부를 따뜻하게 유지하고 미네랄 밸런스를 맞춰 순환을 돕는 것이 중요합니다.';
      break;
  }

  const baseScore = 70 + ((input.birthDay ?? 15) % 20); 
  const yearlyLuck = {
    overall: baseScore,
    stamina: Math.min(100, baseScore + 5),
    digestion: Math.max(0, baseScore - 10),
    mentalHealth: baseScore,
  };

  return {
    dominantElement,
    elementBalance,
    weakOrgans,
    constitutionType,
    constitutionDesc,
    yearlyLuck,
    warningMonths: '환절기 (3~4월, 9~10월)',
    warningDesc: '급격한 기온 변화로 인해 체내 바이오리듬이 깨지기 쉬운 시기입니다. 특히 이 시기에는 본인의 취약 장기 기능이 더욱 저하될 수 있으므로, 무리한 활동을 피하고 항산화 및 기초 영양소를 적극적으로 보충하여 면역 체계를 철저히 보호해야 합니다.',
  };
}
