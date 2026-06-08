// @ts-nocheck
/**
 * 내 몸 사용 설명서 — FitLine 건강앱
 * 앱인토스(Apps in Toss) 미니앱 React 버전
 *
 * 구조:
 * 1. 인트로 (심사 필수)
 * 2. 사주 입력
 * 3. 타고난 건강 체질 결과 (초년/중년/말년운 포함)
 * 4. 현재 건강 체크 설문
 * 5. 종합 리포트
 * 6. FitLine 제품 추천 + 구매 연결
 *
 * 안티그래비티에서 그대로 사용 가능한 단일 파일 구조
 */

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// 1. 데이터 / 로직 레이어
// ─────────────────────────────────────────────

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const STEM_ELEMENT = { 갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수" };
const BRANCH_ELEMENT = { 자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 신: "금", 유: "금", 술: "토", 해: "수" };
const ELEMENTS = ["목", "화", "토", "금", "수"];

const ELEMENT_META = {
  목: { organ: "간·담낭", symptom: "눈 피로·근육 긴장·분노 조절", color: "#3B6D11", bg: "#EAF3DE", en: "Wood", colorName: "푸른색(녹색)", habit: "규칙적인 식사, 해독 중심 식단", emotion: "분노, 조급함", exercise: "요가, 스트레칭" },
  화: { organ: "심장·소장", symptom: "불면·두근거림·열감", color: "#993C1D", bg: "#FAECE7", en: "Fire", colorName: "붉은색", habit: "따뜻한 물 섭취, 자외선 주의", emotion: "흥분, 불안", exercise: "산책, 명상" },
  토: { organ: "비장·위", symptom: "소화불량·무기력·식욕저하", color: "#854F0B", bg: "#FAEEDA", en: "Earth", colorName: "노란색(황색)", habit: "소식, 따뜻한 식사", emotion: "걱정, 우울", exercise: "등산, 자전거" },
  금: { organ: "폐·대장", symptom: "기관지 약화·피부건조·변비", color: "#5F5E5A", bg: "#F1EFE8", en: "Metal", colorName: "흰색", habit: "공기 정화, 담배 금지", emotion: "슬픔, 자책", exercise: "조깅, 체조" },
  수: { organ: "신장·방광", symptom: "부종·요통·냉증", color: "#185FA5", bg: "#E6F1FB", en: "Water", colorName: "검은색(보라색)", habit: "충분한 수면, 염분 섭취 조절", emotion: "두려움, 무기력", exercise: "수영, 반신욕" },
};

// PM International 전체 제품 카탈로그
const PM_CATALOG = {
  restorate:  { name: "리스토레이트(Restorate)",                    desc: "마그네슘·미네랄·산-염기 균형, 야간 회복 및 수면의 질 개선",           url: "https://horangpm.linkstory.co.kr" },
  activize:   { name: "액티바이즈(Activize Oxyplus)",               desc: "비타민B군 공급으로 세포 에너지 생성, 산소 활용 능력·집중력 향상",     url: "https://horangpm.linkstory.co.kr" },
  cocktail:   { name: "파워칵테일(PowerCocktail)",                   desc: "53종 식물성 영양소, 소화효소 활성·대사 지원·종합 항산화",             url: "https://horangpm.linkstory.co.kr" },
  omega3:     { name: "오메가3(Omega-3)",                            desc: "EPA·DHA 고농도 공급, 심혈관·뇌 건강 지원, 혈행 개선 및 염증 완화",   url: "https://horangpm.linkstory.co.kr" },
  q10:        { name: "Q10 플러스(Q10 Plus)",                        desc: "코엔자임Q10·항산화 복합체, 심장 에너지 대사 지원 및 노화 억제",      url: "https://horangpm.linkstory.co.kr" },
  proshape:   { name: "프로쉐이프 올인원(ProShape All-in-One)",       desc: "고품질 단백질·식이섬유, 근육 유지·체중 관리·포만감 지속",          url: "https://horangpm.linkstory.co.kr" },
};

// 오행별 핵심 제품 (체질 기반 1순위)
const FITLINE_PRODUCTS = {
  목: { ...PM_CATALOG.restorate, desc: "간·담낭 해독 부담 완화, 마그네슘으로 근육·신경 이완" },
  화: { ...PM_CATALOG.omega3,    desc: "EPA·DHA로 심장·혈관 건강 직접 지원, 혈행 개선" },
  토: { ...PM_CATALOG.cocktail,  desc: "식물성 영양소로 비장·위 소화력 강화, 대사 균형" },
  금: { ...PM_CATALOG.cocktail,  desc: "53종 식물영양소로 폐·대장 면역력·호흡기 강화" },
  수: { ...PM_CATALOG.restorate, desc: "전해질·미네랄 보충으로 신장·방광 기능 지원" },
};

// 증상별 추천 제품 (정확한 매핑)
const SECONDARY_PRODUCTS = {
  피로: { ...PM_CATALOG.activize,  desc: "비타민B군으로 세포 에너지 대사 활성화, 만성 피로 개선" },
  수면: { ...PM_CATALOG.restorate, desc: "마그네슘·미네랄 보충으로 신경 이완 및 수면의 질 향상" },
  소화: { ...PM_CATALOG.cocktail,  desc: "53종 식물성 영양소로 소화효소 활성 및 장 환경 개선" },
  면역: { ...PM_CATALOG.cocktail,  desc: "식물성 영양소·항산화 성분으로 면역 세포 기능 전반 강화" },
  체력: { ...PM_CATALOG.q10,       desc: "코엔자임Q10으로 세포 에너지 생산 효율 향상, 지구력 증대" },
};

function getGanjiFromYear(year) {
  const stemIdx = (year - 4) % 10;
  const branchIdx = (year - 4) % 12;
  return {
    stem: STEMS[(stemIdx + 10) % 10],
    branch: BRANCHES[(branchIdx + 12) % 12],
  };
}

function calculateYearlyLuck(birthYear, elements, targetYear) {
  const yearLuckBase = ((targetYear - birthYear) % 10) * 7;
  return {
    year: targetYear,
    overall: Math.min(95, Math.max(30, 55 + (yearLuckBase % 30) - 10)),
    stamina: Math.min(95, Math.max(25, 50 + (yearLuckBase % 25) - 5)),
    digestion: Math.min(95, Math.max(25, 45 + (elements["토"] * 3) % 30)),
    mentalHealth: Math.min(95, Math.max(30, 60 + (elements["화"] * 2) % 20) - 5),
  };
}

function analyzeSaju({ birthYear, birthMonth, birthDay, birthHour, gender }) {
  // 1. 연주 (Year)
  const yearIdx = (birthYear - 4) % 60;
  const yearGan = STEMS[yearIdx % 10];
  const yearJi = BRANCHES[yearIdx % 12];

  // 2. 월주 (Month) - 간략 계산
  const monthGanIdx = ((birthYear % 5) * 2 + birthMonth) % 10;
  const monthGan = STEMS[monthGanIdx];
  const monthJiIdx = (birthMonth + 1) % 12;
  const monthJi = BRANCHES[monthJiIdx];

  // 3. 일주 (Day) - 기준일(2000년 1월 1일: 무오일) 기반
  const baseDate = new Date(2000, 0, 1);
  const targetDate = new Date(birthYear, birthMonth - 1, birthDay);
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const dayIdx = (diffDays % 60 + 60) % 60;
  const dayGan = STEMS[(dayIdx + 4) % 10];
  const dayJi = BRANCHES[(dayIdx + 6) % 12];

  // 4. 시주 (Time)
  const timeJiIdx = Math.floor(((parseInt(birthHour || "0") + 1) % 24) / 2);
  const timeJi = BRANCHES[timeJiIdx];
  const dayGanIdx = STEMS.indexOf(dayGan);
  const timeGanIdx = (dayGanIdx * 2 + timeJiIdx) % 10;
  const timeGan = STEMS[timeGanIdx];

  const elements = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const addScore = (gan, ji, weight) => {
    elements[STEM_ELEMENT[gan]] += weight.gan;
    elements[BRANCH_ELEMENT[ji]] += weight.ji;
  };

  addScore(yearGan, yearJi, { gan: 10, ji: 10 });
  addScore(monthGan, monthJi, { gan: 15, ji: 15 });
  addScore(dayGan, dayJi, { gan: 20, ji: 10 }); 
  addScore(timeGan, timeJi, { gan: 5, ji: 5 });

  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  const normalized = {};
  ELEMENTS.forEach(e => { normalized[e] = Math.round((elements[e] / total) * 100); });

  const dayMaster = dayGan;
  const dayMasterElem = STEM_ELEMENT[dayMaster];
  const dominant = ELEMENTS.reduce((a, b) => (normalized[a] >= normalized[b] ? a : b));
  const weak = ELEMENTS.reduce((a, b) => (normalized[a] <= normalized[b] ? a : b));

  const yearGanji = { stem: yearGan, branch: yearJi };
  const currentYear = new Date().getFullYear();
  const yearlyLuck = calculateYearlyLuck(birthYear, elements, currentYear);

  const missingInfo = ELEMENTS.filter(e => normalized[e] < 15).map(e => ({
    element: e,
    organ: ELEMENT_META[e].organ,
    desc: `${e} 기운이 부족하여 ${ELEMENT_META[e].organ} 기능이 선천적으로 약할 수 있습니다.`,
    nutrients: e === "목" ? "비타민 B군, 마그네슘" : 
               e === "화" ? "오메가3, 코엔자임 Q10" :
               e === "토" ? "식이섬유, 유산균, 효소" :
               e === "금" ? "비타민 C, 아연, 셀레늄" : "미네랄, 수분, 전해질",
    advice: `평소 ${ELEMENT_META[e].colorName} 계열의 생활 소품을 곁들이고, ${e === "수" ? "충분한 수분 섭취" : "해당 장기에 좋은 식단"}을 추천해요.`
  }));

  const lifeStages = {
    early: {
      label: "초년운 (0~30세)",
      luck: Math.round(Math.min(95, Math.max(30, normalized[dominant] * 0.8 + 20))),
      theme: `${dayMasterElem}의 기운이 피어나는 시기`,
      detail: `${dayMaster}일간의 특성상 성취욕이 강하나, ${dominant === "화" ? "심장의 열이 과해지기 쉽습니다." : "기초 체력을 다지는 것이 무엇보다 중요한 때입니다."}`,
      health: `청년기에는 ${ELEMENT_META[dominant].organ}의 에너지가 넘치지만 과부하를 조심하세요.`,
      nutrients: "단백질, 칼슘, 비타민 B군",
      message: "성장을 위한 에너지를 리스토레이트로 보충하세요.",
      supplement: "파워칵테일",
    },
    middle: {
      label: "중년운 (30~60세)",
      luck: Math.min(95, Math.max(30, yearlyLuck.overall - 5)),
      theme: "인생의 정점에서 균형을 찾는 시기",
      detail: `${weak}의 기운이 약해지면서 ${ELEMENT_META[weak].organ}의 피로가 누적될 수 있습니다. ${dominant}의 강점을 유지하며 보강에 힘쓰세요.`,
      health: `대사 능력이 변하는 시기이므로 ${ELEMENT_META[weak].organ} 관리가 노후의 건강을 결정합니다.`,
      nutrients: "코엔자임 Q10, 오메가3, 루테인",
      message: "지치지 않는 열정을 위해 액티바이즈로 산소를 공급하세요.",
      supplement: "액티바이즈",
    },
    late: {
      label: "노년기 (60세~)",
      luck: Math.min(90, Math.max(25, yearlyLuck.overall - 10)),
      theme: "안정과 갈무리를 통한 장수의 시기",
      detail: "오행의 순환이 완만해지는 시기입니다. 전반적인 면역력과 리스토레이트(회복) 능력이 핵심입니다.",
      health: `뼈와 관절, 그리고 ${ELEMENT_META[weak].organ}의 미네랄 관리에 집중해야 합니다.`,
      nutrients: "미네랄, 콜라겐, 식이섬유",
      message: "가장 깊은 휴식으로 내일의 활력을 리스토레이트하세요.",
      supplement: "파워칵테일",
    },
  };

  return {
    dominant,
    weak,
    gender,
    elementBalance: normalized,
    dayMaster: {
      gan: dayGan,
      elem: dayMasterElem,
      desc: dayMaster === "갑" ? "강직하고 곧은 성품으로 성장하려는 에너지가 강합니다." :
            dayMaster === "을" ? "유연하고 적응력이 뛰어나며 생명력이 끈질깁니다." :
            dayMaster === "병" ? "밝고 화려하며 열정적으로 자신을 드러내는 빛과 같습니다." :
            dayMaster === "정" ? "따뜻하고 헌신적이며 내면의 열기가 강한 등불과 같습니다." :
            dayMaster === "무" ? "듬직하고 포용력이 넓으며 신뢰를 중시하는 대지와 같습니다." :
            dayMaster === "기" ? "섬세하고 알뜰하며 주변을 잘 챙기는 비옥한 전답과 같습니다." :
            dayMaster === "경" ? "강인하고 결단력이 있으며 정의를 중시하는 바위와 같습니다." :
            dayMaster === "신" ? "예민하고 정교하며 고귀한 가치를 지닌 보석과 같습니다." :
            dayMaster === "임" ? "지혜롭고 유동적이며 모든 것을 포용하는 바다와 같습니다." : "총명하고 감수성이 풍부하며 생명을 기르는 빗물과 같습니다.",
    },
    constitutionType: `${dayMaster}일생 ${dominant}(${ELEMENT_META[dominant].en}) 체질`,
    constitutionDesc: `당신의 핵심 기운은 ${dayMasterElem}(${dayMaster})이며, 에너지의 중심이 ${ELEMENT_META[dominant].organ}에 집중되어 있어요. ${dayMasterElem}의 특성상 ${ELEMENT_META[dayMasterElem].organ}의 리듬을 맞추는 것이 건강 유지의 핵심입니다.`,
    weakOrgans: [ELEMENT_META[weak].organ],
    elementsObj: elements,
    birthYear,
    yearlyLuck,
    warningMonths: "3·6·12월",
    warningDesc: `${weak}의 기운이 약해지는 시기에 영양 보충을 강화하세요.`,
    lifeStages,
    yearGanji,
    missingInfo,
  };
}

function analyzeHealthCheck(answers) {
  const keys = ["피로", "수면", "소화", "면역", "체력"];
  const scoreMap = { 0: 90, 1: 70, 2: 45, 3: 20 };
  const scores = {};
  keys.forEach((k, i) => { scores[k] = scoreMap[answers[i] ?? 0]; });
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);
  return { scores, overall };
}

function recommendProducts(sajuResult, healthScores) {
  const products = [];
  // 1순위: 체질 기반
  products.push({ ...FITLINE_PRODUCTS[sajuResult.dominant], reason: `${sajuResult.constitutionType}에 가장 필요한 핵심 영양소를 공급해요`, rank: 1 });
  // 2순위: 약한 오행
  if (sajuResult.weak !== sajuResult.dominant) {
    products.push({ ...FITLINE_PRODUCTS[sajuResult.weak], reason: `약한 ${ELEMENT_META[sajuResult.weak].organ} 기능 보강에 최적화됐어요`, rank: 2 });
  }
  // 3순위: 건강 체크 최저 항목
  const worstKey = Object.entries(healthScores.scores).sort((a, b) => a[1] - b[1])[0][0];
  const secondary = SECONDARY_PRODUCTS[worstKey];
  if (!products.find((p) => p.name === secondary.name)) {
    products.push({ ...secondary, reason: `현재 ${worstKey} 수준이 낮아요. 즉각적인 보충이 필요해요`, rank: 3 });
  }
  return products.slice(0, 3);
}

// ─────────────────────────────────────────────
// 2. UI 컴포넌트
// ─────────────────────────────────────────────

const STEP = { INTRO: 0, SAJU_INPUT: 1, SAJU_RESULT: 2, HEALTH_CHECK: 3, REPORT: 4, PRODUCTS: 5 };

const HEALTH_QUESTIONS = [
  { key: "피로", q: "요즘 하루 중 피로감이 어느 정도인가요?", options: ["거의 없음", "가끔 피곤", "자주 피곤", "항상 지쳐있음"] },
  { key: "수면", q: "최근 수면의 질은 어떤가요?", options: ["깊게 잘 잠", "가끔 뒤척임", "자주 깨거나 얕음", "불면이 잦음"] },
  { key: "소화", q: "식후 소화 상태는 어떤가요?", options: ["항상 쾌적", "가끔 더부룩", "자주 불편함", "매일 문제 있음"] },
  { key: "면역", q: "감기나 잔병치레 빈도는?", options: ["거의 안 걸림", "1년에 1~2회", "자주 걸림", "달고 삶"] },
  { key: "체력", q: "일상적인 체력 수준은?", options: ["넘쳐남", "적당함", "자주 부족", "많이 부족함"] },
];

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= current ? "var(--primary-gold)" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

function GaugeBar({ value, color = "var(--primary-gold)", label, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div className="glass-card" style={{ padding: "16px 18px", marginBottom: 12, color: "var(--text-main)", ...style }}>
      {children}
    </div>
  );
}

function Tag({ children, color = "var(--primary-gold)", bg = "rgba(212, 175, 55, 0.15)" }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, borderRadius: 8, padding: "4px 10px", display: "inline-block", marginBottom: 8, border: `1px solid ${color}33` }}>
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", style = {} }) {
  const base = { width: "100%", padding: "15px 0", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", transition: "all 0.2s", ...style };
  const variants = {
    primary: { background: "var(--primary-gold)", color: "#0c0c1f" },
    secondary: { background: "rgba(255,255,255,0.1)", color: "var(--text-main)", border: "1px solid rgba(255,255,255,0.2)" },
    teal: { background: "#1D9E75", color: "#fff" },
    coral: { background: "#D85A30", color: "#fff" },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick}>{children}</button>;
}

// ─────────────────────────────────────────────
// 화면 1: 인트로
// ─────────────────────────────────────────────
function IntroScreen({ onStart }) {
  const features = [
    { icon: "🔮", title: "사주 기반 건강 체질 분석", desc: "오행(목·화·토·금·수)으로 타고난 체질과 인생 건강운을 확인해요" },
    { icon: "📋", title: "현재 건강 상태 체크", desc: "피로·수면·소화·면역·체력 5가지를 점검하고 종합 점수를 받아요" },
    { icon: "💊", title: "FitLine 맞춤 영양제 추천", desc: "체질과 건강 상태에 딱 맞는 독일 PM International 제품을 연결해줘요" },
  ];

  return (
    <div style={{ padding: "0 20px 32px", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <div style={{ textAlign: "center", padding: "60px 0 32px" }}>
        <div style={{ fontSize: 56, marginBottom: 16, filter: "drop-shadow(0 0 12px var(--primary-gold))" }}>🪐</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--primary-gold)", margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-0.02em" }}>Fitline 사주건강앱</h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: 0, lineHeight: 1.6 }}>당신의 운명에 숨겨진 건강의 비밀을 찾으세요</p>
      </div>

      <div style={{ marginBottom: 28 }}>
        {features.map((f, i) => (
          <div key={i} className="glass-card" style={{ display: "flex", gap: 14, marginBottom: 16, padding: "18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--primary-gold)", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(212, 175, 55, 0.1)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 12, color: "var(--primary-gold)", lineHeight: 1.5, textAlign: "center", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
        🔒 당신의 정보는 별의 지혜로만 활용됩니다
      </div>

      <Button onClick={onStart}>건강 오행 분석 시작하기 →</Button>
      <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-dim)", marginTop: 12 }}>
        이 서비스는 전통 사주 이론 참고용이며 의학적 진단이 아닙니다
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 화면 2: 사주 입력
// ─────────────────────────────────────────────
function SajuInputScreen({ onNext }) {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({ birthYear: 1990, birthMonth: 5, birthDay: 15, calendarType: "solar", birthHour: null, gender: "female" });
  const [noHour, setNoHour] = useState(false);

  const HOUR_OPTIONS = [
    { label: "자시 (23~01시)", value: 0 }, { label: "축시 (01~03시)", value: 1 },
    { label: "인시 (03~05시)", value: 2 }, { label: "묘시 (05~07시)", value: 3 },
    { label: "진시 (07~09시)", value: 4 }, { label: "사시 (09~11시)", value: 5 },
    { label: "오시 (11~13시)", value: 6 }, { label: "미시 (13~15시)", value: 7 },
    { label: "신시 (15~17시)", value: 8 }, { label: "유시 (17~19시)", value: 9 },
    { label: "술시 (19~21시)", value: 10 }, { label: "해시 (21~23시)", value: 11 },
  ];

  const sel = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleSel = (style) => ({ fontSize: 13, padding: "8px 16px", borderRadius: 8, cursor: "pointer", border: "1.5px solid", transition: "all 0.15s", ...style });

  return (
    <div style={{ padding: "0 20px 32px", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E", margin: "28px 0 4px" }}>사주 정보 입력</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>태어난 정보로 건강 체질을 분석해요</p>

      <div style={{ background: "#F0EFF8", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#665FA0" }}>
        🔒 사주 정보는 건강 체질 분석에만 활용되며 외부에 제공되지 않아요
      </div>

      {/* 생년월일 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>생년월일</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
          <select value={form.birthYear} onChange={(e) => sel("birthYear", Number(e.target.value))} style={{ padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E0E0F0", fontSize: 13, background: "#fff" }}>
            {Array.from({ length: 80 }, (_, i) => currentYear - 10 - i).map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select value={form.birthMonth} onChange={(e) => sel("birthMonth", Number(e.target.value))} style={{ padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E0E0F0", fontSize: 13, background: "#fff" }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select value={form.birthDay} onChange={(e) => sel("birthDay", Number(e.target.value))} style={{ padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E0E0F0", fontSize: 13, background: "#fff" }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </div>

      {/* 음력/양력 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>음력 / 양력</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["solar", "lunar"].map((v) => (
            <button key={v} onClick={() => sel("calendarType", v)}
              style={toggleSel(form.calendarType === v ? { background: "#EEEDFE", borderColor: "#534AB7", color: "#534AB7", fontWeight: 600 } : { background: "#fff", borderColor: "#E0E0F0", color: "#888" })}>
              {v === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
      </div>

      {/* 태어난 시간 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>태어난 시간 <span style={{ fontWeight: 400, color: "#AAA" }}>(선택)</span></div>
        <select disabled={noHour} value={form.birthHour ?? ""} onChange={(e) => sel("birthHour", Number(e.target.value))}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E0E0F0", fontSize: 13, background: noHour ? "#F8F8F8" : "#fff", color: noHour ? "#CCC" : "#333", marginBottom: 8 }}>
          <option value="">시간 선택</option>
          {HOUR_OPTIONS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#888", cursor: "pointer" }}>
          <input type="checkbox" checked={noHour} onChange={(e) => { setNoHour(e.target.checked); if (e.target.checked) sel("birthHour", null); }} />
          태어난 시간을 몰라요
        </label>
      </div>

      {/* 성별 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>성별</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "female", l: "여성" }, { v: "male", l: "남성" }].map(({ v, l }) => (
            <button key={v} onClick={() => sel("gender", v)}
              style={toggleSel(form.gender === v ? { background: "#EEEDFE", borderColor: "#534AB7", color: "#534AB7", fontWeight: 600 } : { background: "#fff", borderColor: "#E0E0F0", color: "#888" })}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => onNext(form)}>건강 체질 분석하기 →</Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 화면 3: 사주 결과 (초년/중년/말년 포함)
// ─────────────────────────────────────────────
function SajuResultScreen({ sajuResult, onNext }) {
  const { dominant, weak, gender, elementBalance, constitutionType, constitutionDesc, yearlyLuck, warningMonths, warningDesc, lifeStages, yearGanji, elementsObj, birthYear, missingInfo } = sajuResult;
  const [activeStage, setActiveStage] = useState("early");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [currentYearlyLuck, setCurrentYearlyLuck] = useState(yearlyLuck);

  const handleYearChange = (year) => {
    setTargetYear(year);
    setCurrentYearlyLuck(calculateYearlyLuck(birthYear, elementsObj, year));
  };

  const ELEM_COLOR = { 목: "#3B6D11", 화: "#993C1D", 토: "#854F0B", 금: "#5F5E5A", 수: "#185FA5" };
  const ELEM_BG = { 목: "#EAF3DE", 화: "#FAECE7", 토: "#FAEEDA", 금: "#F1EFE8", 수: "#E6F1FB" };
  const stageLabels = { early: "초년운", middle: "중년운", late: "말년운" };
  const stage = lifeStages[activeStage];

  return (
    <div style={{ padding: "0 20px 32px", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--primary-gold)", margin: "28px 0 4px" }}>타고난 건강 체질</h2>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
        {yearGanji.stem}{yearGanji.branch}년생 · {gender === "female" ? "여성" : "남성"}
      </p>

      {/* 오행 균형 */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-gold)", marginBottom: 12 }}>오행 균형</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {ELEMENTS.map((e) => (
            <div key={e} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 6px", textAlign: "center", border: `1.5px solid ${e === dominant ? "var(--primary-gold)" : "rgba(255,255,255,0.1)"}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: e === dominant ? "var(--primary-gold)" : "var(--text-dim)", marginBottom: 4 }}>{e}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{elementBalance[e]}</div>
              {e === dominant && <div style={{ fontSize: 9, color: "var(--primary-gold)", marginTop: 2 }}>강</div>}
              {e === weak && <div style={{ fontSize: 9, color: "#F08030", marginTop: 2 }}>보강필요</div>}
            </div>
          ))}
        </div>
      </Card>

      {/* 체질 유형 */}
      <Card>
        <Tag>{constitutionType}</Tag>
        <div style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.6 }}>{constitutionDesc}</div>
        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(216, 90, 48, 0.1)", borderRadius: 8, fontSize: 12, color: "#D85A30", border: "1px solid rgba(216, 90, 48, 0.2)" }}>
          ⚠️ 약한 부위: {ELEMENT_META[weak].organ} — {ELEMENT_META[weak].symptom}
        </div>
      </Card>

      {/* 체질 맞춤 가이드 */}
      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-gold)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          🥗 맞춤 라이프 코칭
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "생활 습관", value: ELEMENT_META[dominant].habit, icon: "🏠" },
            { label: "감정 경향", value: ELEMENT_META[dominant].emotion, icon: "💭" },
            { label: "추천 운동", value: ELEMENT_META[dominant].exercise, icon: "🏃" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Tag color="var(--primary-gold)" bg="rgba(212, 175, 55, 0.1)">{targetYear}년 건강운</Tag>
          <div style={{ display: "flex", gap: 6 }}>
            {[targetYear - 1, targetYear, targetYear + 1].map((y) => (
              <button key={y} onClick={() => handleYearChange(y)}
                style={{ padding: "4px 10px", fontSize: 12, fontWeight: targetYear === y ? 700 : 400, borderRadius: 12, border: "1.5px solid", borderColor: targetYear === y ? "var(--primary-gold)" : "rgba(255,255,255,0.1)", background: targetYear === y ? "rgba(212, 175, 55, 0.15)" : "transparent", color: targetYear === y ? "var(--primary-gold)" : "var(--text-dim)", cursor: "pointer", transition: "all 0.15s" }}>
                {y}년
              </button>
            ))}
          </div>
        </div>
        <GaugeBar value={currentYearlyLuck.overall} label="전체 건강" color="#534AB7" />
        <GaugeBar value={currentYearlyLuck.stamina} label="체력·면역" color="#1D9E75" />
        <GaugeBar value={currentYearlyLuck.digestion} label="소화·대사" color="#854F0B" />
        <GaugeBar value={currentYearlyLuck.mentalHealth} label="심리·활력" color="#D85A30" />
      </Card>

      {/* 부족한 정보 보강 */}
      {missingInfo && missingInfo.length > 0 && (
        <Card style={{ background: "#F5F7FA" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 12 }}>선천적 부족 기운 보완</div>
          {missingInfo.map((info, i) => (
            <div key={i} style={{ marginBottom: i < missingInfo.length - 1 ? 16 : 0 }}>
              <Tag color="#555" bg="#E5E8EB">{info.element} 기운 부족</Tag>
              <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6, marginTop: 4 }}>
                {info.desc} {info.advice}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6, background: "#fff", padding: "8px 12px", borderRadius: 8 }}>
                💡 <strong style={{ color: "#444" }}>필요 영양소:</strong> {info.nutrients}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* 초년/중년/말년운 */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 12 }}>인생 건강 흐름 분석</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {Object.entries(stageLabels).map(([key, label]) => (
            <button key={key} onClick={() => setActiveStage(key)}
              style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: activeStage === key ? 700 : 400, borderRadius: 8, border: "1.5px solid", borderColor: activeStage === key ? "#534AB7" : "#E0E0F0", background: activeStage === key ? "#EEEDFE" : "#fff", color: activeStage === key ? "#534AB7" : "#888", cursor: "pointer", transition: "all 0.15s" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ background: "#F8F8FD", borderRadius: 10, padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>{stage.label} - {stage.theme}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#534AB7" }}>{stage.luck}<span style={{ fontSize: 11, fontWeight: 400, color: "#999" }}>/100</span></div>
          </div>
          <div style={{ height: 5, background: "#E8E8F0", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ width: `${stage.luck}%`, height: "100%", background: "#534AB7", borderRadius: 3 }} />
          </div>
          
          <div style={{ fontSize: 12, color: "#444", lineHeight: 1.6, marginBottom: 10 }}>
            <strong style={{ color: "#1A1A2E" }}>[사주 상세]</strong><br />
            {stage.detail}
          </div>
          
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 12, padding: "10px", background: "#fff", borderRadius: 8, border: "1px solid #EBEBF5" }}>
            <strong style={{ color: "#D85A30" }}>📍 건강 가이드:</strong> {stage.health}
          </div>

          <div style={{ fontSize: 12, color: "#333", marginBottom: 12 }}>
            🛡️ <strong style={{ color: "#1D9E75" }}>보충 필수 성분:</strong> {stage.nutrients}
          </div>

          <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 12, paddingLeft: 8, borderLeft: "3px solid #534AB7" }}>
            " {stage.message} "
          </div>

          <div style={{ fontSize: 11, color: "#888", background: "#EEEDFE", borderRadius: 6, padding: "6px 10px" }}>
            💊 추천 FitLine: <strong style={{ color: "#534AB7" }}>{stage.supplement === "Restorate" || stage.supplement.includes("Restorate") ? "리스토레이트(Restorate)" : stage.supplement}</strong>
          </div>
        </div>
      </Card>

      {/* 주의 시기 */}
      <Card style={{ background: "#FFF9F0", borderColor: "#F5D89A" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#854F0B", marginBottom: 6 }}>⚠️ {warningMonths} 집중 관리</div>
        <div style={{ fontSize: 12, color: "#AA6800", lineHeight: 1.5 }}>{warningDesc}</div>
      </Card>

      <div style={{ fontSize: 11, color: "#BBB", lineHeight: 1.5, marginBottom: 20, textAlign: "center" }}>
        이 분석은 전통 사주 이론을 참고한 것으로, 의학적 진단이 아닙니다
      </div>
      <Button onClick={onNext}>현재 건강 상태 체크하기 →</Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 화면 4: 건강 체크 설문 (스텝)
// ─────────────────────────────────────────────
function HealthCheckScreen({ onNext }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const q = HEALTH_QUESTIONS[step];

  const handleSelect = (idx) => {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
    if (step < HEALTH_QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 300);
    } else {
      setTimeout(() => onNext(next), 300);
    }
  };

  return (
    <div style={{ padding: "0 20px 32px", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <div style={{ marginTop: 28 }}>
        <ProgressBar current={step} total={HEALTH_QUESTIONS.length} />
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>{step + 1} / {HEALTH_QUESTIONS.length}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--primary-gold)", lineHeight: 1.4, marginBottom: 32 }}>{q.q}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => {
            const selected = answers[step] === i;
            return (
              <button key={i} onClick={() => handleSelect(i)}
                style={{ padding: "16px 20px", borderRadius: 14, border: "1.5px solid", borderColor: selected ? "var(--primary-gold)" : "rgba(255,255,255,0.1)", background: selected ? "rgba(212, 175, 55, 0.15)" : "rgba(255,255,255,0.03)", color: selected ? "var(--primary-gold)" : "var(--text-main)", fontSize: 14, fontWeight: selected ? 600 : 400, textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 화면 5: 종합 리포트
// ─────────────────────────────────────────────
function ReportScreen({ sajuResult, healthResult, onNext }) {
  const combined = Math.round(sajuResult.yearlyLuck.overall * 0.4 + healthResult.overall * 0.6);
  const worstAreas = Object.entries(healthResult.scores).sort((a, b) => a[1] - b[1]).slice(0, 3);

  const scoreColor = combined >= 80 ? "#1D9E75" : combined >= 60 ? "var(--primary-gold)" : "#D85A30";
  const scoreLabel = combined >= 80 ? "건강 상태 양호" : combined >= 60 ? "보통, 관리 필요" : "집중 관리 필요";

  return (
    <div style={{ padding: "0 20px 32px", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--primary-gold)", margin: "28px 0 4px" }}>종합 건강 리포트</h2>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>사주 체질 40% + 현재 건강 60% 통합 분석</p>

      {/* 종합 점수 */}
      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: scoreColor, lineHeight: 1, textShadow: `0 0 15px ${scoreColor}44` }}>{combined}</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>종합 건강 점수</div>
        <div style={{ display: "inline-block", marginTop: 12, padding: "6px 16px", background: scoreColor + "22", borderRadius: 20, fontSize: 13, fontWeight: 600, color: scoreColor, border: `1px solid ${scoreColor}44` }}>{scoreLabel}</div>
      </Card>

      {/* 영역별 점수 */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-gold)", marginBottom: 16 }}>영역별 건강 점수</div>
        {Object.entries(healthResult.scores).map(([k, v]) => (
          <GaugeBar key={k} label={k} value={v} color={v >= 70 ? "#1D9E75" : v >= 50 ? "var(--primary-gold)" : "#D85A30"} />
        ))}
      </Card>

      {/* 보강 포인트 */}
      <Card>
        <Tag color="#D85A30" bg="rgba(216, 90, 48, 0.1)">지금 보강해야 할 포인트</Tag>
        {worstAreas.map(([key, val], i) => (
          <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < 2 ? 16 : 0, paddingBottom: i < 2 ? 16 : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(216, 90, 48, 0.15)", color: "#D85A30", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>{key} 관리 필요 ({val}점)</div>
              <div style={{ fontSize: 12, color: "var(--primary-gold)", fontWeight: 600, marginTop: 2 }}>→ {SECONDARY_PRODUCTS[key]?.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                {SECONDARY_PRODUCTS[key]?.desc}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* 체질 요약 */}
      <Card style={{ background: "rgba(212, 175, 55, 0.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-gold)", marginBottom: 8 }}>🔮 {sajuResult.constitutionType}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>약한 {ELEMENT_META[sajuResult.weak].organ}을 리스토레이트(Restorate)로 보강하는 것이 가장 효과적입니다.</div>
      </Card>

      <Button onClick={onNext}>맞춤 FitLine 추천 보기 →</Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 화면 6: FitLine 제품 추천
// ─────────────────────────────────────────────
function ProductScreen({ products, sajuResult }) {
  const rankColors = ["#D85A30", "var(--primary-gold)", "#1D9E75"];
  const rankBgs = ["rgba(216, 90, 48, 0.15)", "rgba(212, 175, 55, 0.15)", "rgba(29, 158, 117, 0.15)"];
  const rankLabels = ["1순위", "2순위", "3순위"];

  return (
    <div style={{ padding: "0 20px 40px", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--primary-gold)", margin: "28px 0 4px" }}>맞춤 FitLine 추천</h2>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>{sajuResult.constitutionType} 기반 분석 결과</p>

      <div style={{ background: "rgba(29, 158, 117, 0.1)", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 12, color: "#1D9E75", lineHeight: 1.5, border: "1px solid rgba(29, 158, 117, 0.2)" }}>
        🌿 독일 PM International의 NTC(영양 이동 개념) 기술 기반 제품으로, 체질에 맞게 선별했어요
      </div>

      {products.map((p, i) => (
        <Card key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: rankBgs[i], color: rankColors[i] }}>{rankLabels[i]}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary-gold)", marginBottom: 4 }}>FitLine {p.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.5, marginBottom: 8 }}>{p.desc}</div>
          <div style={{ fontSize: 12, color: "#534AB7", background: "#F0EFF8", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
            💡 {p.reason}
          </div>
          <button
            onClick={() => window.open(p.url, "_blank")}
            style={{ width: "100%", padding: "12px 0", borderRadius: 10, background: rankColors[i], color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            PM 공식몰에서 보기 →
          </button>
        </Card>
      ))}

      {/* 섭취 가이드 */}
      <Card style={{ background: "#F0EFF8", borderColor: "#C8C5E8" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#534AB7", marginBottom: 8 }}>📅 섭취 가이드</div>
        {[
          { time: "아침", action: "PowerCocktail / Basics — 기초 영양 공급" },
          { time: "점심", action: "Activize Oxyplus — 에너지 활성화" },
          { time: "저녁", action: "리스토레이트(Restorate) — 미네랄 보충 및 리스토레이트" },
        ].map(({ time, action }) => (
          <div key={time} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 12, color: "#555" }}>
            <span style={{ fontWeight: 600, color: "#534AB7", width: 30 }}>{time}</span>
            <span>{action}</span>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 11, color: "#CCC", textAlign: "center", lineHeight: 1.5 }}>
        이 추천은 전통 사주 이론과 건강 자가 체크를 참고한 것으로,<br />의학적 진단·처방이 아닙니다. 전문의와 상담하세요.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. 메인 앱 (라우터)
// ─────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(STEP.INTRO);
  const [sajuInput, setSajuInput] = useState(null);
  const [sajuResult, setSajuResult] = useState(null);
  const [healthAnswers, setHealthAnswers] = useState([]);
  const [healthResult, setHealthResult] = useState(null);
  const [products, setProducts] = useState([]);

  const handleSajuInput = useCallback((input) => {
    setSajuInput(input);
    const result = analyzeSaju(input);
    setSajuResult(result);
    setStep(STEP.SAJU_RESULT);
  }, []);

  const handleHealthCheck = useCallback((answers) => {
    setHealthAnswers(answers);
    const hResult = analyzeHealthCheck(answers);
    setHealthResult(hResult);
    if (sajuResult) {
      setProducts(recommendProducts(sajuResult, hResult));
    }
    setStep(STEP.REPORT);
  }, [sajuResult]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => { scrollToTop(); }, [step]);

  const stepTitles = ["", "사주 입력", "건강 체질 분석", "건강 상태 체크", "종합 리포트", "FitLine 추천"];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "var(--bg-color)", minHeight: "100vh", position: "relative", color: "var(--text-main)" }}>
      {/* 헤더 (인트로 제외) */}
      {step > STEP.INTRO && (
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(12, 12, 31, 0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(212, 175, 55, 0.12)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--primary-gold)", lineHeight: 1, flexShrink: 0 }}>
            ← 이전
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--primary-gold)", flex: 1, textAlign: "center", marginRight: 56 }}>{stepTitles[step]}</span>
        </div>
      )}

      {/* 화면 렌더링 */}
      {step === STEP.INTRO && <IntroScreen onStart={() => setStep(STEP.SAJU_INPUT)} />}
      {step === STEP.SAJU_INPUT && <SajuInputScreen onNext={handleSajuInput} />}
      {step === STEP.SAJU_RESULT && sajuResult && (
        <SajuResultScreen sajuResult={sajuResult} onNext={() => setStep(STEP.HEALTH_CHECK)} />
      )}
      {step === STEP.HEALTH_CHECK && <HealthCheckScreen onNext={handleHealthCheck} />}
      {step === STEP.REPORT && sajuResult && healthResult && (
        <ReportScreen sajuResult={sajuResult} healthResult={healthResult} onNext={() => setStep(STEP.PRODUCTS)} />
      )}
      {step === STEP.PRODUCTS && sajuResult && (
        <ProductScreen products={products} sajuResult={sajuResult} />
      )}
    </div>
  );
}
