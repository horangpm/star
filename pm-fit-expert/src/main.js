import './style.css'

const app = document.querySelector('#app')

// -- Global State --
let state = {
  view: 'splash',
  name: '', gender: 'male', age: 45, height: 172,
  weight: 75, muscle: 32, bfr: 22, visceral: 8,
  bmi: 24.5, isPremium: false
}

// -- Clinical Data Base --
const Standards = {
  male: {
    bmi: { min: 18.5, max: 23, unit: '', label: "체질량(BMI)" },
    muscle: { min: 32, max: 38, unit: 'kg', label: "골격근량(Muscle)" },
    bfr: { min: 10, max: 20, unit: '%', label: "체지방률(Fat)" },
    visceral: { min: 1, max: 9, unit: 'Lv', label: "내장지방(Visceral)" }
  },
  female: {
    bmi: { min: 18.5, max: 23, unit: '', label: "체질량(BMI)" },
    muscle: { min: 22, max: 28, unit: 'kg', label: "골격근량(Muscle)" },
    bfr: { min: 18, max: 28, unit: '%', label: "체지방률(Fat)" },
    visceral: { min: 1, max: 9, unit: 'Lv', label: "내장지방(Visceral)" }
  }
}

const TypeData = {
  "표준체중보통형": { desc: "신체 밸런스가 매우 이상적인 '건강 표준' 상태입니다. 현재의 높은 대사 효율을 유지하기 위해 항산화 영양소와 기초 미네랄 보강이 권장됩니다.", pm: ["파워칵테일", "리스토레이트"] },
  "표준체중강인형": { desc: "골격근량이 우수하며 대사 능력이 활발한 '스포츠 엘리트형' 체형입니다. 강도 높은 활동 후 세포 재생과 에너지 전해질 균형을 유지하는 것이 핵심입니다.", pm: ["리스토레이트", "액티바이즈", "제슈츠"] },
  "표준체중비만형": { desc: "체중은 정상이나 체지방률이 높은 '대사 위험형' 상태입니다. 근육 내 지방 침착을 방지하고 세포의 해독 능력을 높이는 집중 처방이 필요합니다.", pm: ["액티바이즈", "C-Balance", "디드링크", "리스토레이트"] },
  "표준체중허약형": { desc: "체중은 정상이나 근질이 약하고 대사 속도가 느린 '에너지 저하형'입니다. 단백질 대사를 돕는 아미노산 합성과 영양 흡수력 재건이 시급합니다.", pm: ["파워칵테일", "리스토레이트", "제슈츠"] },
  "저체중허약형": { desc: "에너지 가용량이 극도로 낮고 기초 면역력이 붕괴된 '생체 허약' 단계입니다. 즉각적인 필수 영양 공급과 신체 조직의 재건이 최우선 과제입니다.", pm: ["파워칵테일", "리스토레이트", "제슈츠"] },
  "저체중강인형": { desc: "체중은 낮으나 근육의 밀도가 높은 '고효율 연소형' 체형입니다. 신체 산성도를 조절하고 필수 미네랄 결핍을 방지하여 활력을 유지해야 합니다.", pm: ["리스토레이트", "제슈츠", "파워칵테일"] },
  "과체중허약형": { desc: "체격에 비해 근육량이 부족하여 관절과 심혈관에 과부하가 걸린 '근감소성 비만' 상태입니다. 지방 연소와 세포 재생이 동시에 이루어져야 합니다.", pm: ["액티바이즈", "리스토레이트", "겔링핏"] },
  "과체중강인형": { desc: "전신 대사량이 높으나 산화 스트레스와 혈관 부하가 심한 '고에너지 위험형'입니다. 신체 산성도 중화와 항산화 보호막 형성이 필수적입니다.", pm: ["리스토레이트", "제슈츠", "액티바이즈"] },
  "과체중비만형": { desc: "대사 증후군 위험도가 높은 '고위험 염증성' 체형입니다. 내장지방 독소의 강력한 배출과 인슐린 감수성 개선을 위한 집중 솔루션이 필요합니다.", pm: ["C-Balance", "디드링크", "액티바이즈", "리스토레이트"] }
}

const ProductInfo = {
  "액티바이즈": "NTC 공법으로 산소 흡수율을 극대화하여 체지방 연소를 가속화하고 즉각적인 에너지를 공급합니다.",
  "파워칵테일": "56가지 효소와 과채 영양소가 장내 환경을 재건하고 전신 대사의 기초 밸런스를 확립합니다.",
  "리스토레이트": "8가지 필수 미네랄과 아미노산 합성을 돕는 최적의 포뮬러로 수면 중 세포 재생과 독소 배출을 주도합니다.",
  "C-Balance": "구아바 추출물 등 당 대사 조절 성분이 탄수화물의 지방 전환을 억제하고 혈당 밸런스를 최적화합니다.",
  "디드링크": "간과 림프의 해독 경로를 2주간 집중적으로 활성화하여 체내 깊숙이 쌓인 중금속과 독소를 정화합니다.",
  "제슈츠": "강력한 항산화 성분이 활성산소로부터 세포막을 보호하고 외부 바이러스에 대한 면역 방어막을 구축합니다.",
  "겔링핏": "연골과 결합 조직의 구성 성분을 직접 공급하여 관절 기동 능력을 회복하고 신체 기동력을 보강합니다."
}

// -- Engine --
const AIEngine = {
  calculateBMI: (w, h) => {
    if (!w || !h || h === 0) return 0
    return (w / ((h / 100) ** 2)).toFixed(1)
  },
  classify: (u) => {
    const bmi = AIEngine.calculateBMI(u.weight, u.height)
    const std = u.gender === 'male' ? Standards.male : Standards.female
    const isUnderweight = bmi < 18.5
    const isOverweight = bmi >= 25
    const isNormalWeight = !isUnderweight && !isOverweight
    if (isUnderweight) return u.muscle < std.muscle.min ? "저체중허약형" : "저체중강인형"
    if (isNormalWeight) {
      if (u.bfr > std.bfr.max) return "표준체중비만형"
      if (u.muscle < std.muscle.min) return "표준체중허약형"
      if (u.muscle > std.muscle.max) return "표준체중강인형"
      return "표준체중보통형"
    }
    if (u.muscle > std.muscle.max) return "과체중강인형"
    if (u.bfr > std.bfr.max) return "과체중비만형"
    return "과체중허약형"
  }
}

// -- Components --

const NavHeader = (targetView) => `
  <div style="padding: 20px 24px; display:flex; align-items:center; position:sticky; top:0; z-index:100; background:rgba(255,255,255,0.95); backdrop-filter:blur(15px); border-bottom:1px solid #f1f5f9;">
    <button onclick="window.setView('${targetView}')" style="background:none; border:none; font-size:1.4rem; color:var(--brand-primary); cursor:pointer; padding:5px;">
      <i class="fas fa-chevron-left"></i>
    </button>
    <div style="flex:1; text-align:center; font-size:0.85rem; font-weight:800; letter-spacing:3px; color:var(--brand-accent); margin-right:35px;">CLINICAL REPORT</div>
  </div>
`

const MetricMeter = (label, current, std) => {
  const safeCurrent = isNaN(current) ? 0 : current
  const percent = Math.min(Math.max((safeCurrent / (std.max * 1.5)) * 100, 0), 100)
  const minPos = (std.min / (std.max * 1.5)) * 100
  const maxPos = (std.max / (std.max * 1.5)) * 100
  const status = safeCurrent < std.min ? '부족' : (safeCurrent > std.max ? '과다' : '적정')
  const isBad = status === '부족' || status === '과다'
  const displayColor = isBad ? 'var(--brand-danger)' : 'var(--brand-success)'

  return `
    <div class="modern-meter reveal">
      <div class="meter-info" style="margin-bottom:12px;">
        <span class="meter-name" style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); opacity:0.8;">${label}</span>
        <div style="text-align:right;">
          <span style="font-size:1.3rem; font-weight:900; font-family:var(--font-montserrat);">${safeCurrent}</span>
          <span style="font-size:0.95rem; font-weight:${isBad?'900':'700'}; color:${displayColor}; margin-left:6px; letter-spacing:-0.5px;">
            ${status}
          </span>
        </div>
      </div>
      <div class="meter-track" style="height:12px; background:#f1f5f9; border-radius:100px; overflow:visible;">
        <div class="meter-range-indicator" style="left:${minPos}%; width:${maxPos-minPos}%; background:rgba(16, 185, 129, 0.12); border-left:1px dashed #10b981; border-right:1px dashed #10b981;"></div>
        <div class="meter-fill" style="width:${percent}%; background:${displayColor}; opacity:0.35; border-radius:100px;"></div>
        <div class="meter-pin" style="left:${percent}%; width:4px; height:26px; top:-7px; background:var(--brand-primary); border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
      </div>
    </div>
  `
}

// -- Views --

const SplashView = () => `
  <div style="height:100vh; display:flex; flex-direction:column; justify-content:center; padding:40px; text-align:center;" class="reveal">
    <h1 style="font-size:3.2rem; font-weight:900; color:var(--brand-primary); margin-bottom:12px; letter-spacing:-1.5px;">FitLine Health AI</h1>
    <h2 style="font-size:1.25rem; color:var(--brand-accent); font-weight:700; margin-bottom:50px;">데이터로 증명하는 건강 맞춤 가이드</h2>
    <p style="color:var(--text-secondary); line-height:2.1; font-size:1.1rem; padding:0 10px; opacity:0.9;">
      맞춤형 인바디 데이터를 기반으로<br>당신의 최적화된 신체 밸런스를 디자인합니다.
    </p>
    <button class="btn-luxury" style="margin-top:80px; font-weight:900;" onclick="window.setView('input')">상담 시작하기</button>
  </div>
`

const InputView = () => `
  ${NavHeader('splash')}
  <div class="section-container reveal" style="padding-top:20px;">
    <h2 style="font-size:1.9rem; font-weight:900; margin-bottom:40px; letter-spacing:-1px;">정밀 데이터 입력</h2>
    
    <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:30px; padding:55px 20px; text-align:center; position:relative; margin-bottom:40px; transition:all 0.3s;">
      <div id="scan-feedback" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.92); display:none; justify-content:center; align-items:center; z-index:5; border-radius:30px;">
        <div style="font-weight:900; color:var(--brand-accent); letter-spacing:3px;">AI DATA SCANNING...</div>
      </div>
      <i class="fas fa-camera-retro" style="font-size:2.8rem; color:var(--brand-accent); margin-bottom:18px; opacity:0.7;"></i>
      <div style="font-weight:900; font-size:1.15rem;">인바디 결과지 판독</div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-top:10px;">이미지를 분석하여 수치를 정밀 추출합니다.</p>
      <input type="file" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;" accept="image/*" onchange="window.handleOCR(this)">
    </div>

    <div style="margin-top:35px;">
      <div class="input-group" style="margin-bottom:25px;">
        <label style="font-size:0.8rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:12px; text-transform:uppercase; letter-spacing:1px;">성명(Name)</label>
        <input type="text" style="width:100%; padding:20px; border-radius:18px; border:1px solid #e2e8f0; font-size:1.15rem; font-weight:700;" value="${state.name}" onchange="window.updateState('name', this.value)">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:25px;">
        <div class="input-group"><label style="font-size:0.75rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:10px;">키(Height).cm</label><input type="number" style="width:100%; padding:18px; border-radius:18px; border:1px solid #e2e8f0; font-weight:700;" value="${state.height}" onchange="window.updateState('height', this.value)"></div>
        <div class="input-group"><label style="font-size:0.75rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:10px;">나이(Age).세</label><input type="number" style="width:100%; padding:18px; border-radius:18px; border:1px solid #e2e8f0; font-weight:700;" value="${state.age}" onchange="window.updateState('age', this.value)"></div>
        <div class="input-group"><label style="font-size:0.75rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:10px;">체중(Weight).kg</label><input type="number" style="width:100%; padding:18px; border-radius:18px; border:1px solid #e2e8f0; font-weight:700;" value="${state.weight}" onchange="window.updateState('weight', this.value)"></div>
        <div class="input-group"><label style="font-size:0.75rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:10px;">골격근량(Muscle).kg</label><input type="number" style="width:100%; padding:18px; border-radius:18px; border:1px solid #e2e8f0; font-weight:700;" value="${state.muscle}" onchange="window.updateState('muscle', this.value)"></div>
        <div class="input-group"><label style="font-size:0.75rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:10px;">체지방률(Fat).%</label><input type="number" style="width:100%; padding:18px; border-radius:18px; border:1px solid #e2e8f0; font-weight:700;" value="${state.bfr}" onchange="window.updateState('bfr', this.value)"></div>
        <div class="input-group"><label style="font-size:0.75rem; font-weight:900; color:var(--text-muted); display:block; margin-bottom:10px;">내장지방(Visceral).Lv</label><input type="number" style="width:100%; padding:18px; border-radius:18px; border:1px solid #e2e8f0; font-weight:700;" value="${state.visceral}" onchange="window.updateState('visceral', this.value)"></div>
      </div>
    </div>

    <button class="btn-luxury" style="width:100%; margin-top:40px; padding:22px; font-size:1.15rem;" onclick="window.startAnalysis()">분석 리포트 생성</button>
  </div>
`

const AnalysisView = () => {
  const bmi = AIEngine.calculateBMI(state.weight, state.height)
  state.bmi = bmi
  const typeName = AIEngine.classify(state)
  const type = TypeData[typeName]
  const std = state.gender === 'male' ? Standards.male : Standards.female

  return `
    ${NavHeader('input')}
    <div class="diagnosis-header reveal" style="padding-top:25px; padding-bottom:50px;">
      <div class="type-badge" style="background:var(--brand-primary); color:white; padding:10px 25px; font-weight:900; border-radius:100px;">SCENE 3: ANALYSIS</div>
      <h1 class="type-title" style="font-size:2.2rem; margin-top:25px; font-weight:900;">${state.name || '고객'}님의 건강 유형은<br><span style="color:var(--brand-accent);">${typeName}</span></h1>
      <p style="padding:0 35px; color:var(--text-secondary); line-height:2; font-size:1.05rem; opacity:0.9;">${type.desc}</p>
    </div>

    <div class="section-container" style="background:white; border-radius:50px 50px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,0.05); margin-top:-30px;">
      <h3 style="font-size:0.9rem; letter-spacing:4px; text-align:center; color:var(--text-muted); margin-bottom:45px; font-weight:900;">CLINICAL DATA ANALYTICS</h3>
      ${MetricMeter("체질량지수(BMI)", state.bmi, std.bmi)}
      ${MetricMeter("골격근량(Muscle).kg", state.muscle, std.muscle)}
      ${MetricMeter("체지방률(Fat).%", state.bfr, std.bfr)}
      ${MetricMeter("내장지방(Visceral).Lv", state.visceral, std.visceral)}

      <button class="btn-luxury" style="margin-top:70px; width:100%; font-weight:900; letter-spacing:1px;" onclick="window.setView('prescription')">맞춤형 정밀 처방 보기 <i class="fas fa-chevron-right" style="margin-left:10px;"></i></button>
    </div>
  `
}

const PrescriptionView = () => {
  const typeName = AIEngine.classify(state)
  const type = TypeData[typeName]

  return `
    ${NavHeader('analysis')}
    <div class="prescription-dark reveal" style="min-height:100vh; margin-top:0; border-radius:0; padding-top:40px;">
      <div style="text-align:center; margin-bottom:60px; padding:0 30px;">
        <div class="type-badge" style="background:var(--brand-gold); color:var(--brand-primary); margin-bottom:25px; padding:10px 25px; font-weight:900; border-radius:100px;">SCENE 4: PRESCRIPTION</div>
        <h2 style="font-size:1.8rem; color:var(--brand-gold); font-weight:900; letter-spacing:-0.5px;">분석 데이터 기반 PM 정밀 처방</h2>
        <p style="font-size:0.9rem; color:rgba(255,255,255,0.5); margin-top:15px; line-height:1.7;">데이터 기반 대사 개선 및 영양 밸런스 솔루션</p>
      </div>

      ${type.pm.map(name => `
        <div class="product-card-luxury" style="margin-bottom:25px;">
          <span class="product-name-gold" style="font-size:1.15rem; font-weight:900;">${name}</span>
          <p style="font-size:0.95rem; color:rgba(255,255,255,0.8); line-height:1.8; margin-top:15px; font-weight:500;">${ProductInfo[name]}</p>
        </div>
      `).join('')}

      <a href="https://horangpm.linkstory.co.kr" target="_blank" class="btn-luxury" style="margin-top:70px; font-size:1.15rem; font-weight:900; box-shadow:0 15px 30px rgba(184, 151, 89, 0.3);">호랑피엠 공식몰에서 즉시 처방받기</a>
      
      <div style="margin-top:80px; padding:30px; background:rgba(255,255,255,0.06); border-radius:25px; border:1px solid rgba(255,255,255,0.1);">
        <p style="font-size:0.75rem; color:rgba(255,255,255,0.4); line-height:1.8; text-align:justify;">
          "본 분석 결과는 인바디 수치 기반의 영양 참고 정보입니다. 건강기능식품은 질병의 예방·치료를 목적으로 하지 않으며, 건강 이상이 의심될 경우 반드시 전문의 상담을 받으시길 권장합니다."
        </p>
      </div>
      
      <div style="text-align:center; margin-top:70px; padding-bottom:50px; font-size:0.8rem; color:rgba(255,255,255,0.3); letter-spacing:2px; font-weight:600;">
        © 2025 HORANG PM. ALL RIGHTS RESERVED.
      </div>
    </div>
  `
}

// -- Main Controls --

window.setView = (v) => { state.view = v; window.scrollTo({top: 0, behavior: 'smooth'}); render() }
window.updateState = (k, v) => state[k] = isNaN(v) ? v : parseFloat(v)

window.handleOCR = async (input) => {
  if(!input.files[0]) return
  const f = document.querySelector('#scan-feedback'); f.style.display = 'flex'
  try {
    const r = await Tesseract.recognize(input.files[0], 'kor+eng')
    const t = r.data.text
    const weight = t.match(/(?:체중|Weight)\s*[:\s]*(\d+\.?\d*)/i)
    const muscle = t.match(/(?:골격근량|Muscle)\s*[:\s]*(\d+\.?\d*)/i)
    const bfr = t.match(/(?:체지방률|Fat)\s*[:\s]*(\d+\.?\d*)/i)
    const visceral = t.match(/(?:내장지방|Visceral)\s*[:\s]*(\d+)/i)
    const height = t.match(/(?:키|신장|Height)\s*[:\s]*(\d+\.?\d*)/i)
    const age = t.match(/(?:나이|연령|Age)\s*[:\s]*(\d+)/i)
    
    if(weight) state.weight = parseFloat(weight[1])
    if(muscle) state.muscle = parseFloat(muscle[1])
    if(bfr) state.bfr = parseFloat(bfr[1])
    if(visceral) state.visceral = parseInt(visceral[1])
    if(height) state.height = parseFloat(height[1])
    if(age) state.age = parseInt(age[1])
    render()
  } finally { f.style.display = 'none' }
}

window.startAnalysis = () => {
  const o = document.querySelector('#scan-overlay'); o.style.display = 'flex'
  setTimeout(() => { o.style.display = 'none'; window.setView('analysis') }, 2000)
}

const render = () => {
  if (state.view === 'splash') app.innerHTML = SplashView()
  else if (state.view === 'input') app.innerHTML = InputView()
  else if (state.view === 'analysis') app.innerHTML = AnalysisView()
  else if (state.view === 'prescription') app.innerHTML = PrescriptionView()
}

if(!document.querySelector('#scan-overlay')){
  document.body.insertAdjacentHTML('beforeend', `<div id="scan-overlay"><div class="laser"></div><div style="color:white; font-family:var(--font-montserrat); font-weight:900; margin-top:20px; letter-spacing:5px;">AI CLINICAL ANALYSIS</div></div>`)
}

render()
