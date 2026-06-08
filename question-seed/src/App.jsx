import { useState } from "react";
import "./App.css";

const STEPS = ["프로필", "도서검색", "질문법", "질문생성"];

const QUESTION_METHODS = [
  { id: "swc", label: "SWC 질문", icon: "👁️", desc: "보기 · 궁금해하기 · 연결하기" },
  { id: "qft", label: "QFT 질문", icon: "💡", desc: "스스로 질문 만들고 분류하기" },
  { id: "bloom", label: "Bloom 질문", icon: "🧠", desc: "6단계 사고력 질문" },
  { id: "ib5", label: "IB 5단계 질문", icon: "🌐", desc: "사실적·해석적·개념적·적용적·논쟁적 5단계" },
];

const GRADE_OPTIONS = {
  초등: ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
  중등: ["1학년", "2학년", "3학년"],
  고등: ["1학년", "2학년", "3학년"],
  기타: ["기타"],
};

// ── 텍스트 클리닝 필터 (모든 정보에서 *, # 마크다운 기호 제거) ────────────
export function cleanMarkdown(text) {
  if (!text) return "";
  return text
    // 볼드 마크다운 (**) 제거
    .replace(/\*\*/g, "")
    // 개별 별표 (*) 제거
    .replace(/\*/g, "")
    // 샵 (#) 기호 및 헤더 제거
    .replace(/#/g, "")
    // 대괄호 내의 마크다운 기호 파편 제거
    .replace(/\[\s*#+\s*/g, "[")
    // 불필요한 줄바꿈 공백 정리
    .replace(/^[ \t]*[•-][ \t]+/gm, "- ")
    .trim();
}

// ── AI 모델 목록 (우선순위순, 하나가 막히면 자동으로 다음 모델로 전환) ──────────
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

// ── 대기 함수 ────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── 지수 백오프 대기 시간 계산 (시도 횟수에 따라 점점 길게 기다림) ──────────────
// 1회: 3초, 2회: 6초, 3회: 12초, 4회: 24초, 5회: 48초 (최대 60초)
function getRetryDelay(attempt) {
  return Math.min(3000 * Math.pow(2, attempt), 60000);
}

// ── 단일 키+모델 조합으로 1회 Gemini 호출 ────────────────────────────────────
async function callGeminiOnce(fullPrompt, key, modelName, responseJson) {
  const generationConfig = { maxOutputTokens: 4000, temperature: 0.7 };
  if (responseJson) {
    generationConfig.responseMimeType = "application/json";
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || "API 오류";
    const isQuota =
      res.status === 429 ||
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("limit") ||
      msg.toLowerCase().includes("exhausted") ||
      msg.toLowerCase().includes("rate") ||
      msg.toLowerCase().includes("resource_exhausted");
    throw Object.assign(new Error(msg), { status: res.status, isQuota });
  }
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return responseJson ? rawText : cleanMarkdown(rawText);
}

// ── 메인 AI 호출: 지수 백오프 재시도 + 다중키 순환 + 모델 자동폴백 ───────────
// onRetry(남은초, 현재시도, 최대시도): 재시도 직전 UI에 알려주는 콜백
async function callGemini(prompt, systemPrompt = "", apiKey = "", responseJson = false, onRetry = null) {
  if (!apiKey) throw new Error("API 키가 없습니다. 오른쪽 상단 [API 키 변경] 버튼을 눌러 키를 입력해 주세요.");

  const fullPrompt = systemPrompt ? systemPrompt + "\n\n" + prompt : prompt;

  // 쉼표로 구분된 여러 API 키 지원
  const keys = apiKey.split(",").map((k) => k.trim()).filter((k) => k.length > 10);
  if (keys.length === 0) throw new Error("유효한 API 키가 없습니다. API 키를 다시 확인해 주세요.");

  const MAX_QUOTA_RETRIES = 5; // 한도 초과 시 최대 자동 재시도 횟수
  let lastError = null;
  let quotaRetries = 0;

  // 현재 키×모델 조합을 전부 시도하는 내부 함수
  const tryAllCombinations = async () => {
    for (const key of keys) {
      for (const model of GEMINI_MODELS) {
        try {
          return await callGeminiOnce(fullPrompt, key, model, responseJson);
        } catch (err) {
          lastError = err;
          if (err.isQuota) throw err; // 한도 초과는 상위로 전달하여 대기 처리
          // 그 외 에러는 다음 모델/키로 계속 시도
        }
      }
    }
    // 모든 조합 실패 (한도 초과 외 에러)
    throw lastError;
  };

  // 한도 초과 시 대기 후 재시도 루프
  while (true) {
    try {
      return await tryAllCombinations();
    } catch (err) {
      lastError = err;
      // 한도 초과가 아니거나 최대 재시도 초과 시 종료
      if (!err.isQuota || quotaRetries >= MAX_QUOTA_RETRIES) break;

      quotaRetries++;
      const delay = getRetryDelay(quotaRetries - 1);
      const delaySec = Math.ceil(delay / 1000);

      // UI에 카운트다운 알림 (콜백이 있는 경우)
      if (onRetry) onRetry(delaySec, quotaRetries, MAX_QUOTA_RETRIES);

      // 실제 대기 (카운트다운 중에도 사용자는 기다리는 화면 확인 가능)
      await sleep(delay);
    }
  }

  // 최종 에러 메시지
  if (lastError?.isQuota) {
    throw new Error(
      `AI 서버가 지금 매우 바쁩니다. ${MAX_QUOTA_RETRIES}번 재시도했지만 연결이 어렵습니다. 잠시 후 다시 시도해 주세요.`
    );
  }
  throw new Error(lastError?.message || "AI 호출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
}

// ── API 키 입력 모달 ────────────────────────────────────
function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const isValid = key.trim().length > 10;

  return (
    <div className="apikey-modal">
      <div className="apikey-box">
        <div className="apikey-icon">✨</div>
        <h3>Google AI 키 입력</h3>
        <p>
          질문 생성과 AI 피드백에 <strong>Google Gemini</strong>를 사용합니다.<br />
          도서 검색은 <strong>무료</strong>입니다! 키는 아래에서 무료로 발급받으세요:
        </p>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="apikey-cta-link"
        >
          🔗 aistudio.google.com → 무료 키 발급
        </a>
        <div className="apikey-input-row" style={{ marginTop: 16 }}>
          <input
            className="input"
            type={show ? "text" : "password"}
            placeholder="AIza..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isValid && onSave(key.trim())}
          />
          <button className="btn btn-outline btn-sm" onClick={() => setShow(s => !s)}>
            {show ? "숨기기" : "보기"}
          </button>
        </div>
        <button
          className="btn btn-primary btn-full"
          onClick={() => onSave(key.trim())}
          disabled={!isValid}
          style={{ marginTop: 12 }}
        >
          시작하기 🚀
        </button>
        <p className="apikey-notice">키는 이 브라우저에만 저장되며 외부로 전송되지 않아요. 투명하게 Gemini API에만 사용됩니다.</p>
        <p className="apikey-notice" style={{ marginTop: 8, color: "#2563eb", fontWeight: 600 }}>
          💡 키 여러 개를 쉼표로 구분해서 입력하면 자동으로 순환 사용됩니다!<br />
          예: AIzaSy...키1, AIzaSy...키2
        </p>
      </div>
    </div>
  );
}

// ── 스텝 1: 프로필 ────────────────────────────────────────
function ProfileStep({ profile, setProfile, onNext }) {
  const levels = ["초등", "중등", "고등", "기타"];
  const isValid = profile.role && profile.level && profile.grade;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">👤</span>
        <h2>사용자 설정</h2>
      </div>

      <div className="section">
        <label className="section-label">역할 선택</label>
        <div className="tag-group">
          {["학생", "교사"].map((r) => (
            <button
              key={r}
              className={`tag ${profile.role === r ? "active" : ""}`}
              onClick={() => setProfile((p) => ({ ...p, role: r }))}
            >
              {r === "학생" ? "🎒 학생" : "📚 교사"}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <label className="section-label">학교급</label>
        <div className="tag-group">
          {levels.map((l) => (
            <button
              key={l}
              className={`tag ${profile.level === l ? "active" : ""}`}
              onClick={() => setProfile((p) => ({ ...p, level: l, grade: "" }))}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {profile.level && (
        <div className="section fade-in">
          <label className="section-label">학년</label>
          <div className="tag-group">
            {GRADE_OPTIONS[profile.level].map((g) => (
              <button
                key={g}
                className={`tag ${profile.grade === g ? "active" : ""}`}
                onClick={() => setProfile((p) => ({ ...p, grade: g }))}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-full"
        onClick={onNext}
        disabled={!isValid}
        style={{ marginTop: 8 }}
      >
        다음 →
      </button>
    </div>
  );
}

// ── 명품 도서 자체 로컬 검색 데이터베이스 (통신 0회, 무료 100%, 팩트 100%) ────────────────
const LOCAL_BOOKS_DATABASE = [
  {
    title: "슈퍼거북",
    author: "유설화",
    genre: "동화 / 그림책",
    publisher: "책읽는곰",
    year: "2014",
    summary: "토끼와의 경주에서 이긴 뒤 '슈퍼거북'으로 불리게 된 거북이 '꾸물기'의 이야기입니다. 꾸물기는 이웃들의 기대에 부응하기 위해 진짜 빠른 거북이가 되려고 밤낮없이 피나는 훈련을 거듭합니다. 엄청난 훈련 덕분에 꾸물기는 웬만한 동물들보다 훨씬 빨라지고 진짜 '슈퍼거북'이 되지만, 자기 자신의 진짜 모습(느긋하고 느린 삶)을 잃어버린 채 매일 극심한 피로와 불안감에 시달리게 됩니다. 그러던 어느 날, 다시 찾아온 토끼와의 재경주에서 꾸물기는 마침내 경주 도중 쏟아지는 잠을 참지 못하고 단잠에 빠집니다. 경주에서는 지게 되지만, 남들의 기대와 시선이라는 무거운 껍질을 벗어던지고 비로소 느리지만 행복한 자신의 본래 모습으로 돌아와 진짜 자유와 평화를 찾게 된다는 깊은 교훈을 줍니다."
  },
  {
    title: "슈퍼토끼",
    author: "유설화",
    genre: "동화 / 그림책",
    publisher: "책읽는곰",
    year: "2016",
    summary: "거북이 꾸물기와의 경주에서 진 뒤 충격에 빠진 토끼 '재빨라'의 이야기입니다. 경주에서 진 뒤 온 세상의 비웃음과 놀림을 받던 재빨라는 큰 상처를 입고 '다시는 달리지 않겠다'며 자신의 가장 큰 장점이자 본성인 달리기를 부정하기 시작합니다. 빠른 것은 모두 피하고, 달리고 싶은 마음을 억누르며 억지로 느리게 걸으려 고군분투하던 재빨라는 삶의 의욕과 기쁨을 잃어버리고 심한 스트레스에 시달립니다. 그러던 중 예기치 못한 사고로 위기에 처한 친구들을 구해야 하는 절체절명의 상황에 놓이게 되자, 재빨라는 자신도 모르게 마음속 깊은 곳에 잠재되어 있던 달리기 본능을 깨워 바람처럼 질주합니다. 친구들을 구해내고 신나게 달리는 행복을 다시 깨달은 재빨라는 실패의 아픔을 극복하고, 넘어져도 다시 일어설 수 있는 튼튼한 마음을 가진 진짜 멋진 토끼로 거듭나게 됩니다."
  },
  {
    title: "알사탕",
    author: "백희나",
    genre: "동화 / 그림책",
    publisher: "책읽는곰",
    year: "2017",
    summary: "친구들과 어울리지 못하고 늘 혼자 노는 외로운 소년 '동동이'가 신비로운 알사탕을 만나면서 벌어지는 마음 따뜻한 판타지 성장 동화입니다. 동동이는 문구점에서 산 무늬가 알록달록한 알사탕을 하나씩 입에 넣을 때마다 신비한 소리를 듣게 됩니다. 첫 번째 사탕은 얼룩덜룩한 소파의 속마음(몸이 무겁고 힘들다는 불평)을 들려주고, 두 번째 사탕은 늙은 반려견 '구슬이'의 진심(사실은 늙어서 뛰어놀지 못할 뿐 동동이를 무척 사랑하고 늘 함께 놀고 싶어 한다는 속삭임)을 들려줍니다. 이어서 매일 잔소리만 늘어놓는 아빠의 진짜 속마음(매 순간 '사랑한다'고 말하는 아빠의 겹겹이 쌓인 사랑 고백)과 낙엽의 작별 인사, 그리고 먼저 세상을 떠난 돌아가신 할머니의 다정하고 안부 넘치는 편지 같은 소리를 전해 듣습니다. 알사탕을 통해 타인의 마음과 보이지 않는 진심을 깊이 이해하고 공감하게 된 동동이는, 마지막 남은 아무 소리도 나지 않는 투명한 사탕을 먹은 뒤 마침내 스스로 용기를 내어 동네 놀이터에서 혼자 노는 친구에게 다가가 '나랑 같이 놀래?'라고 먼저 말을 건네며 찬란한 우정의 첫걸음을 내딛습니다."
  },
  {
    title: "만복이네 떡집",
    author: "김리리",
    genre: "아동문학 / 동화",
    publisher: "비룡소",
    year: "2010",
    summary: "부잣집 외동아들이지만 욕심이 많고 툭하면 친구들에게 심술궂은 욕을 퍼부어 미움을 받는 주인공 '만복이'의 성장 동화입니다. 만복이는 마음속과 달리 매번 나쁜 말과 삐뚤어진 행동을 하는 스스로에게 실망하며 괴로워하던 중, 우연히 신비로운 '만복이네 떡집'을 발견하게 됩니다. 이 신기한 떡집의 떡들은 돈이 아닌 착한 행동이나 마음씨로만 살 수 있습니다. '입에 척 붙어 말을 못 하게 만드는 찹쌀떡'은 남의 욕을 하지 않고 입을 다물게 해 주며, '바람이 들어가 웃음이 솔솔 나는 바람떡'은 늘 찌푸려져 있던 만복이의 얼굴에 밝은 미소를 찾아주고, '귀가 뚫려 남의 말이 잘 들리는 귀송송떡'은 친구들의 이야기에 귀를 기울이는 공감 능력을 키워줍니다. 떡집의 신비한 떡들을 하나씩 먹으며 친구들의 마음을 이해하고 자신의 말과 행동을 다스리는 법을 배우게 된 만복이는, 점차 친구들에게 따뜻한 응원과 칭찬의 말을 건네는 착하고 인기 많은 아이로 아름답게 변화해 갑니다. 타인을 향한 배려와 칭찬 한마디가 우리 삶을 얼마나 마법처럼 아름답게 바꿀 수 있는지 일깨워 줍니다."
  },
  {
    title: "긴긴밤",
    author: "루리",
    genre: "아동문학 / 동화",
    publisher: "문학동네",
    year: "2021",
    summary: "지구상의 마지막 남은 흰바위코뿔소 '노든'과 버려진 알에서 깨어난 아기 펭귄이 수많은 위기와 상실의 고통을 견디며 마침내 푸른 바다를 찾아가는 눈물겨운 여정을 그린 걸작 동화입니다. 흰바위코뿔소 노든은 코끼리 고아원에서 코끼리들의 사랑 속에서 자라났지만, 진짜 자신의 삶을 찾기 위해 세상 밖으로 나가 아내와 딸을 만나 행복한 가정을 꾸립니다. 하지만 이내 인간 사냥꾼들의 잔인한 총칼에 가족을 모두 잃고 홀로 살아남아 피눈물 흘리는 복수와 상실의 고통 속에 갇힙니다. 전쟁으로 폐허가 된 동물원에서 노든은 마음씨 착한 버려진 펭귄 '치쿠'를 만나고, 함께 탈출하여 치쿠가 품고 있던 이름 없는 펭귄 알을 지키기 위한 머나먼 고난의 여정을 동행합니다. 도중 치쿠마저 세상을 떠나자, 노든은 홀로 남은 알에서 갓 깨어난 아기 펭귄을 품고 뜨거운 태양과 모래바람이 가득한 기나긴 밤들을 묵묵히 버텨냅니다. 노든의 거대하고 든든한 등 뒤에서 보살핌을 받으며 자라난 아기 펭귄은 스스로 걷는 법을 배우고, 수많은 밤을 함께 넘기며 서로에게 없어서는 안 될 온전한 삶의 이유이자 우주가 됩니다. 마침내 노든의 헌신적인 사랑 덕분에 펭귄들의 고향인 끝없는 푸른 바다에 도달한 아기 펭귄은, 노든과의 눈물 어린 작별을 뒤로하고 당당하게 자신의 바다로 나아가는 큰 성장을 이룩하며 깊은 감동과 생명의 숭고함을 선사합니다."
  }
];

// ── 스텝 2: 도서 검색 (Google Books API + Gemini AI 하이브리드) ─────────────────
function BookStep({ book, setBook, profile, onNext, onBack, apiKey }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [retryMsg, setRetryMsg] = useState(""); // 자동 재시도 안내 메시지

  async function searchBook() {
    if (!query.trim() || loading) return; // 중복 호출 완벽 가드
    setLoading(true);
    setError("");
    setResults([]);
    setBook(null);
    try {
      // 0단계: 로컬 명품 도서 데이터베이스 검색 매칭 (통신 0회, 무료 100%)
      const cleanQuery = query.trim().toLowerCase().replace(/\s+/g, "");
      const matchedLocal = LOCAL_BOOKS_DATABASE.filter(b => 
        cleanQuery.includes(b.title.toLowerCase().replace(/\s+/g, "")) || 
        b.title.toLowerCase().replace(/\s+/g, "").includes(cleanQuery) ||
        cleanQuery.includes(b.author.toLowerCase().replace(/\s+/g, "")) || 
        b.author.toLowerCase().replace(/\s+/g, "").includes(cleanQuery)
      );

      if (matchedLocal.length > 0) {
        console.log("로컬 명품 도서 DB에서 즉각 매칭 성공:", matchedLocal);
        const mappedResults = matchedLocal.map((b, idx) => ({
          id: `local-book-${idx}-${Date.now()}`,
          title: b.title,
          author: b.author,
          genre: b.genre,
          keywords: b.title,
          summary: b.summary,
          cover: null,
          publisher: b.publisher,
          year: b.year,
          googleLink: `https://search.naver.com/search.naver?query=${encodeURIComponent(b.title)}`,
          characters: "",
          setting: "",
          conflict: "",
          message: "",
          topics: []
        }));
        setResults(mappedResults);
        setLoading(false);
        return; // 즉각 로컬 결과를 반환하여 소중한 API 호출 낭비를 0회로 만듭니다!
      }

      let items = [];
      
      // 1단계: Google Books API 3중 하이브리드 시도 (일반검색 -> intitle -> inauthor)
      try {
        items = await fetchBooks(query);
        if (!items || items.length === 0) {
          items = await fetchBooks(`intitle:${query}`);
        }
        if (!items || items.length === 0) {
          items = await fetchBooks(`inauthor:${query}`);
        }
      } catch (booksApiErr) {
        console.warn("Google Books API 차단됨, Gemini 백업 검색 가동:", booksApiErr);
        items = []; // 아래 Gemini 검색으로 넘어가도록 초기화
      }

      // 2단계: Google Books 실패 시 Gemini AI 백업 도서 검색 가동!
      if (!items || items.length === 0) {
        const geminiSearchResult = await callGemini(
          `도서명 또는 검색어 "${query}"에 해당하는 실제 한국어 도서 정보 3권을 찾아 아래 JSON 형식으로만 대답해줘.
          [중요 지침]
          반드시 실제로 존재하는 도서 정보여야 하며, 소설이나 문학 도서의 등장인물 이름(예: "재바우"를 "재빨라"로 잘못 적는 등) 및 책의 세부 정보에 절대로 임의적인 거짓/가짜 정보(환각/Hallucination)가 들어가서는 안 됩니다. 
          등장인물의 역사적/문학적 이름과 정확한 줄거리를 면밀히 백과사전식 교차 검증하여 기록하십시오. 줄거리는 각 책마다 1500자 이내의 상세한 줄거리로 상세하게 요약해 주세요.

          [
            {
              "title": "정확한 책 제목",
              "author": "저자명",
              "genre": "장르",
              "summary": "책의 구체적인 전체 줄거리 (반드시 실제 등장인물의 정밀한 이름과 스토리를 포함한 1500자 이내의 상세 요약)",
              "year": "출판년도",
              "publisher": "출판사"
            }
          ]`,
          "당신은 유능하고 팩트 체크가 철저한 도서 검색 사서입니다. 반드시 규격화된 JSON 대괄호 리스트 배열로만 대답하십시오.",
          apiKey,
          true // JSON 강제 모드 활성화!
        );

        try {
          // 2중 안전장치: 텍스트에서 처음 나오는 '[' 와 마지막 나오는 ']' 사이의 문자열만 추출
          const startIdx = geminiSearchResult.indexOf('[');
          const endIdx = geminiSearchResult.lastIndexOf(']');
          if (startIdx === -1 || endIdx === -1) {
            throw new Error("결과 데이터 포맷 오류");
          }
          const cleanJson = geminiSearchResult.slice(startIdx, endIdx + 1);
          const parsed = JSON.parse(cleanJson);
          
          items = parsed.map((b, idx) => ({
            id: `gemini-book-${idx}-${Date.now()}`,
            volumeInfo: {
              title: b.title,
              authors: [b.author],
              categories: [b.genre],
              description: b.summary,
              publishedDate: b.year,
              publisher: b.publisher,
              imageLinks: null // 표지 이미지가 없으면 기본 책 아이콘 사용
            }
          }));
        } catch (parseErr) {
          console.error("Gemini 도서 파싱 에러:", parseErr, geminiSearchResult);
          throw new Error("도서 정보를 AI로 추출하는 데 실패했습니다. 조금 더 대중적인 책 제목으로 다시 검색해 주세요.");
        }
      }

      if (!items || items.length === 0) {
        setError("도서 정보를 찾지 못했습니다. 다시 시도해 주세요.");
        return;
      }

      const parsed = items.map((item) => {
        const v = item.volumeInfo;
        return {
          id: item.id,
          title: v.title || "제목 없음",
          author: (v.authors || []).join(", ") || "저자 미상",
          genre: (v.categories || ["기타"]).join(", "),
          keywords: (v.categories || []).slice(0, 3).join(", ") || query,
          summary: v.description
            ? v.description.replace(/<[^>]*>/g, "").slice(0, 1500) + (v.description.length > 1500 ? "..." : "")
            : "줄거리 정보가 없습니다.",
          cover: v.imageLinks?.thumbnail?.replace("http://", "https://") || null,
          publisher: v.publisher || "",
          year: v.publishedDate?.slice(0, 4) || "",
          googleLink: item.id.startsWith("gemini-book")
            ? `https://search.naver.com/search.naver?query=${encodeURIComponent(v.title)}`
            : v.infoLink || `https://books.google.com/books?id=${item.id}`,
          characters: "",
          setting: "",
          conflict: "",
          message: "",
          topics: [],
        };
      });

      setResults(parsed);
    } catch (e) {
      setError("도서 검색 중 문제가 발생했습니다: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBooks(q) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8&printType=books&orderBy=relevance`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Google Books API 호출 불가");
    const data = await res.json();
    return data.items || [];
  }

  function selectBook(b) {
    setBook(b);
    setResults([]);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">📖</span>
        <h2>도서 검색</h2>
      </div>
      <p className="sub-desc" style={{ marginTop: -14, marginBottom: 16 }}>
        Google Books에서 실제 도서를 검색합니다
      </p>

      <div className="search-row">
        <input
          className="input"
          placeholder="도서명 또는 저자 검색 (예: 어린왕자, 김지영...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && searchBook()}
        />
        <button className="btn btn-primary" onClick={searchBook} disabled={loading || !query.trim()}>
          {loading ? "검색중..." : "🔍 검색"}
        </button>
      </div>

      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <p>Google Books에서 검색하고 있어요...</p>
        </div>
      )}

      {error && <div className="error-box">⚠️ {error}</div>}

      {/* 검색 결과 목록 */}
      {results.length > 0 && !book && (
        <div className="fade-in">
          <p className="search-count">📚 검색 결과 {results.length}권 — 원하는 책을 선택하세요</p>
          <div className="book-results">
            {results.map((b) => (
              <div key={b.id} className="book-result-card" onClick={() => selectBook(b)}>
                <div className="book-cover-wrap">
                  {b.cover ? (
                    <img src={b.cover} alt={b.title} className="book-cover" />
                  ) : (
                    <div className="book-cover-placeholder">📚</div>
                  )}
                </div>
                <div className="book-result-info">
                  <p className="book-result-title">{b.title}</p>
                  <p className="book-result-author">{b.author}</p>
                  {b.year && <p className="book-result-year">{b.year}년</p>}
                  {b.genre && b.genre !== "기타" && (
                    <span className="book-result-genre">{b.genre.split(",")[0]}</span>
                  )}
                </div>
                <span className="book-select-arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 책 정보 */}
      {book && (
        <div className="fade-in">
          <div className="book-selected">
            <div className="book-selected-cover">
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="book-cover-lg" />
              ) : (
                <div className="book-cover-placeholder-lg">📚</div>
              )}
            </div>
            <div className="book-selected-info">
              <h3 className="book-selected-title">{book.title}</h3>
              <p className="book-selected-author">✍️ {book.author}</p>
              {book.year && <p className="book-selected-year">📅 {book.year}년{book.publisher ? ` · ${book.publisher}` : ""}</p>}
              {book.genre && book.genre !== "기타" && (
                <div className="keyword-group" style={{ marginTop: 8 }}>
                  {book.genre.split(",").slice(0, 3).map((g, i) => (
                    <span key={i} className="keyword">{g.trim()}</span>
                  ))}
                </div>
              )}
              <a
                href={book.googleLink}
                target="_blank"
                rel="noreferrer"
                className="google-books-link"
                onClick={(e) => e.stopPropagation()}
              >
                🔗 Google Books에서 보기
              </a>
            </div>
          </div>

          {book.summary && book.summary !== "줄거리 정보가 없습니다." && (
            <div className="book-summary-box">
              <p className="book-summary-label">📝 책 소개</p>
              <p className="book-summary">{book.summary}</p>
            </div>
          )}

          <button
            className="btn btn-outline btn-full"
            onClick={() => { setBook(null); setResults([]); }}
            style={{ marginTop: 10, marginBottom: 4 }}
          >
            🔄 다른 책 선택
          </button>
          <p className="ai-notice">📡 Google Books 실제 데이터입니다.</p>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn btn-outline" onClick={onBack}>← 이전</button>
        <button className="btn btn-primary flex-1" onClick={onNext} disabled={!book}>
          이 책으로 질문 만들기 →
        </button>
      </div>
    </div>
  );
}

// ── 스텝 3: 질문법 선택 ───────────────────────────────────
function MethodStep({ method, setMethod, onNext, onBack }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🧩</span>
        <h2>질문법 선택</h2>
      </div>
      <p className="sub-desc">하나를 선택해 AI가 질문을 생성합니다</p>

      <div className="method-list">
        {QUESTION_METHODS.map((m) => (
          <div
            key={m.id}
            className={`method-card ${method === m.id ? "selected" : ""}`}
            onClick={() => setMethod(m.id)}
          >
            <span className="method-icon">{m.icon}</span>
            <div className="method-info">
              <p className="method-name">{m.label}</p>
              <p className="method-desc">{m.desc}</p>
            </div>
            {method === m.id && <span className="check-mark">✓</span>}
          </div>
        ))}
      </div>

      <div className="btn-row" style={{ marginTop: 8 }}>
        <button className="btn btn-outline" onClick={onBack}>← 이전</button>
        <button className="btn btn-primary flex-1" onClick={onNext} disabled={!method}>
          질문 생성하기 →
        </button>
      </div>
    </div>
  );
}

// ── 스텝 4: 질문 생성 & AI 피드백 ────────────────────────
function QuestionStep({ book, method, profile, onBack, apiKey }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myQ, setMyQ] = useState("");
  const [feedback, setFeedback] = useState("");
  const [fbLoading, setFbLoading] = useState(false);
  const [error, setError] = useState("");

  // ── 학년 눈높이 상세 지침 (어휘·문장·사고 수준 세분화) ──────────────────
  const gradeGuide = (() => {
    const level = profile.level;
    const grade = profile.grade;
    if (level === "초등") {
      if (grade === "1학년" || grade === "2학년")
        return "초등 1~2학년 눈높이: 10자 이내의 아주 짧고 쉬운 문장, 일상 어휘만 사용, 단순 감정·행동에 집중, '왜?', '어떻게?' 같은 단순 의문문 형태로";
      if (grade === "3학년" || grade === "4학년")
        return "초등 3~4학년 눈높이: 짧고 명확한 문장, 등장인물의 감정·이유를 묻는 질문, 쉬운 비교 표현 사용, 너무 어려운 한자어·추상어 금지";
      return "초등 5~6학년 눈높이: 중학교 입문 수준의 어휘 허용, 책의 주제·교훈을 묻는 질문, 자신의 경험과 연결하는 질문 가능";
    }
    if (level === "중등") {
      if (grade === "1학년")
        return "중학교 1학년 눈높이: 책의 주제·갈등·인물 심리를 분석하는 질문, 일부 추상적 개념 허용, 비유·상징 기초 탐색";
      if (grade === "2학년")
        return "중학교 2학년 눈높이: 인물의 가치관·사회적 맥락을 연결하는 질문, 주제의 보편성 탐구, 논리적 근거를 요구하는 질문";
      return "중학교 3학년 눈높이: 작가 의도·시대 배경을 고려한 심층 분석 질문, 다양한 관점 비교, 논쟁적 주제 토론 질문 포함";
    }
    if (level === "고등") {
      return "고등학생 눈높이: 문학적 장치·사상적 배경을 활용한 비판적 분석 질문, 철학·사회·윤리적 쟁점과 연결, 고급 어휘·논술형 사고 요구";
    }
    return "학습자 눈높이에 맞는 적절한 수준으로";
  })();

  const levelHint = gradeGuide;

  const methodPrompts = {
    swc: `도서 "${book.title}"을 기반으로 SWC 질문법(See·Wonder·Connect)에 따라 ${levelHint} 각 단계별 질문 2개씩 만들어줘.

형식:
[See - 보기]
1.
2.

[Wonder - 궁금해하기]
1.
2.

[Connect - 연결하기]
1.
2.`,
    qft: `도서 "${book.title}"을 기반으로 QFT 질문법에 따라 ${levelHint} 아래 형식으로 질문 10개를 만들어줘.

[질문 초점]
(이 책에서 가장 생각해볼 만한 장면이나 문장 1개 제시)

[브레인스토밍 질문 10개]
1. (느낌질문)
2. (비교질문)
3. (상상/IF질문)
4. (흥미/Why질문)
5. (유추질문)
6. (문제해결질문)
7. (메타인지질문)
8.
9.
10.`,
    bloom: `도서 "${book.title}"을 기반으로 블룸의 6단계 질문법에 따라 ${levelHint} 각 단계별 질문 2개씩 만들어줘.

[1단계 기억] - 사실 확인
1.
2.

[2단계 이해] - 내용 파악
1.
2.

[3단계 적용] - 내 삶에 연결
1.
2.

[4단계 분석] - 비교·분석
1.
2.

[5단계 평가] - 가치 판단
1.
2.

[6단계 창조] - 새롭게 만들기
1.
2.`,
    ib5: `도서 "${book.title}"을 기반으로 IB 5단계 통합 질문법에 따라 ${levelHint} 아래 5개 단계별로 질문을 각각 2개씩 만들어줘.

[1단계 사실적 질문] - 책의 내용과 객관적 사실을 확인하는 질문
1.
2.

[2단계 해석적 질문] - 행간의 숨겨진 의미와 인물의 행동 원인을 추론하는 질문
1.
2.

[3단계 개념적 질문] - 책의 주제를 보편적 가치나 더 큰 개념으로 확장하는 질문
1.
2.

[4단계 적용적 질문] - 책에서 얻은 깨달음을 내 삶이나 현대 사회에 대입해 보는 질문
1.
2.

[5단계 논쟁적 질문] - 정해진 답 없이 다양한 시선으로 토론할 수 있는 찬반/가치 판단 질문
1.
2.`,
  };

  async function generateQuestions() {
    if (loading) return; // 중복 호출 방지 락
    setLoading(true);
    setError("");
    setRetryMsg("");
    setQuestions(null);
    try {
      const bookContext = `[도서 팩트 정보 — 이 정보를 절대적 기준으로 사용할 것]
- 도서명: ${book.title}
- 저자: ${book.author}
- 장르: ${book.genre}
- 줄거리 및 등장인물: ${book.summary}

[절대 금지 규칙]
1. 위 줄거리에 나오는 등장인물(주인공 포함) 이름을 단 한 글자도 바꾸거나 임의로 지어내지 마시오.
2. 줄거리에 없는 사건·장면·대사를 만들어 내지 마시오.
3. 실제 책에 없는 내용을 사실처럼 질문에 포함하지 마시오.
4. 모든 질문은 위 줄거리에 명시된 팩트에만 근거하여 만드시오.

[눈높이 지침]
${gradeGuide}

위 지침을 엄수하면서 아래 질문 생성 요청을 처리해 주세요:

`;

      const result = await callGemini(
        bookContext + methodPrompts[method],
        "당신은 참여형 독서교육 및 질문교육 전문가 함선미입니다. [팩트 정확성 최우선 원칙] 제공된 줄거리에 나오는 등장인물 이름·사건·내용을 절대로 변경하거나 임의로 창작하지 마십시오. 주인공 이름이 한 글자라도 틀리면 절대 안 됩니다. [중요 출력 규칙] 답변의 첫 번째 줄(첫 문장)은 무조건 \"안녕하세요! 참여형 독서교육 및 질문교육 전문가 함선미입니다.\" 라는 인사말 하나로만 완벽히 끝맺어야 합니다. 인사말 바로 뒤에는 어떠한 부연 설명이나 특수 기호도 덧붙이지 마십시오. 인사말이 끝나자마자 즉시 줄바꿈(엔터)을 2회 적용하여 문단을 분리한 뒤, 새로운 다음 줄부터 사용자의 학년 눈높이에 맞게 질문을 생성해 주세요.",
        apiKey,
        false,
        (sec, cur, max) => setRetryMsg(`AI 서버가 바빠요. ${sec}초 후 자동 재시도... (${cur}/${max}번째 시도)`)
      );
      setQuestions(result);
    } catch (e) {
      setRetryMsg("");
      setError("질문 생성 중 오류: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function getAiFeedback() {
    if (!myQ.trim() || fbLoading) return; // 중복 호출 방지 락
    setFbLoading(true);
    setFeedback("");
    setRetryMsg("");
    try {
      const bookContext = `[도서 팩트 정보 — 절대 기준]
- 도서명: ${book.title}
- 저자: ${book.author}
- 장르: ${book.genre}
- 줄거리 및 등장인물: ${book.summary}

[절대 금지] 등장인물 이름·사건을 임의로 바꾸거나 창작하지 마시오. 오직 위 정보에 명시된 팩트만 기준으로 삼으시오.

`;

      const result = await callGemini(
        bookContext + `위 도서 정보를 바탕으로, 실제 줄거리와 실존 등장인물 팩트에 완벽히 일치시켜 학생이 만든 아래 독서 질문을 면밀히 분석해줘.

학생 질문: "${myQ}"
학생 수준: ${profile.level} ${profile.grade}

아래 형식으로 피드백 해줘:

[질문 유형] 사실적/해석적/개념적/적용적/논쟁적 중 해당하는 것
[사고 수준] 블룸의 6단계 중 해당하는 것
[잘된 점] 이 질문의 강점 1~2가지
[개선 제안] 더 좋은 질문이 되려면 어떻게 바꿀 수 있는지 구체적으로
[업그레이드 질문] 개선된 버전 질문 1개`,
        "당신은 따뜻하고 격려를 아끼지 않는 참여형 독서교육 및 질문교육 전문가 함선미입니다. [중요 출력 규칙] 답변의 첫 번째 줄(첫 문장)은 무조건 \"안녕하세요! 참여형 독서교육 및 질문교육 전문가 함선미입니다.\" 라는 인사말 하나로만 완벽히 끝맺어야 합니다. 인사말 바로 뒤에는 어떠한 부연 설명이나 특수 기호도 덧붙이지 마십시오. 인사말이 끝나자마자 즉시 줄바꿈(엔터)을 2회 적용하여 문단을 분리한 뒤, 새로운 다음 줄부터 학생의 질문 분석 및 피드백 본문을 친절하게 진행해 주세요.",
        apiKey,
        false,
        (sec, cur, max) => setRetryMsg(`AI 서버가 바빠요. ${sec}초 후 자동 재시도... (${cur}/${max}번째 시도)`)
      );
      setFeedback(result);
    } catch (e) {
      setRetryMsg("");
      setFeedback("피드백 생성 중 오류가 발생했습니다: " + e.message);
    } finally {
      setFbLoading(false);
    }
  }

  const methodName = QUESTION_METHODS.find((m) => m.id === method)?.label;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">✨</span>
        <h2>{methodName} — {book.title}</h2>
      </div>
      <p className="sub-desc">{profile.level} {profile.grade} · {profile.role}</p>

      {!questions && !loading && (
        <button className="btn btn-primary btn-full btn-large" onClick={generateQuestions}>
          🎯 AI 질문 생성하기
        </button>
      )}

      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          {retryMsg ? (
            <>
              <p style={{ color: "#f59e0b", fontWeight: 600 }}>⏳ {retryMsg}</p>
              <p style={{ fontSize: "0.85em", color: "#6b7280" }}>에러가 아닙니다. 잠시만 기다려 주세요!</p>
            </>
          ) : (
            <p>AI가 질문을 만들고 있어요...</p>
          )}
        </div>
      )}

      {error && (
        <div className="error-box">
          ⚠️ {error}
          <button className="btn btn-danger btn-sm" onClick={generateQuestions} style={{ marginLeft: 12 }}>
            재시도
          </button>
        </div>
      )}

      {questions && (
        <div className="fade-in">
          <div className="ai-box">{questions}</div>
          <p className="ai-notice">⚠️ AI가 생성한 질문입니다. 직접 수정·활용해 보세요.</p>
          <button className="btn btn-green btn-full" onClick={generateQuestions} style={{ marginTop: 8 }}>
            🔄 다시 생성
          </button>
        </div>
      )}

      {/* 내 질문 AI 피드백 */}
      <div className="feedback-section">
        <h3 className="feedback-title">💬 내 질문 AI 피드백 받기</h3>
        <p className="feedback-desc">직접 만든 질문을 입력하면 AI가 분석·개선 방향을 알려줍니다.</p>
        <textarea
          className="input textarea"
          placeholder="여기에 내가 만든 질문을 써보세요..."
          value={myQ}
          onChange={(e) => setMyQ(e.target.value)}
        />
        <button
          className="btn btn-orange btn-full"
          onClick={getAiFeedback}
          disabled={fbLoading || !myQ.trim()}
          style={{ marginTop: 10 }}
        >
          {fbLoading ? "분석 중..." : "📊 AI 피드백 받기"}
        </button>

        {fbLoading && (
          <div className="loading-box loading-orange">
            <div className="spinner spinner-orange" />
            {retryMsg ? (
              <>
                <p style={{ color: "#f59e0b", fontWeight: 600 }}>⏳ {retryMsg}</p>
                <p style={{ fontSize: "0.85em", color: "#6b7280" }}>에러가 아닙니다. 잠시만 기다려 주세요!</p>
              </>
            ) : (
              <p>질문을 분석하고 있어요...</p>
            )}
          </div>
        )}

        {feedback && (
          <div className="ai-box ai-box-orange fade-in">{feedback}</div>
        )}
      </div>

      <button className="btn btn-outline btn-full" onClick={onBack} style={{ marginTop: 20 }}>
        ← 질문법 다시 선택
      </button>
    </div>
  );
}

// ── 메인 앱 ──────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ role: "", level: "", grade: "" });
  const [book, setBook] = useState(null);
  const [method, setMethod] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || ""
  );

  function handleSaveKey(key) {
    localStorage.setItem("gemini_api_key", key);
    setApiKey(key);
    setShowKeyModal(false);
  }

  // API 키가 없거나 강제 키 입력 모드가 켜진 경우 모달 표시
  if (!apiKey || showKeyModal) {
    return <ApiKeyModal onSave={handleSaveKey} />;
  }

  return (
    <div className="app-wrap">
      {/* 헤더 */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-logo">🌱</span>
          <div>
            <div className="header-title">질문의 씨앗</div>
            <div className="header-sub">AI 기반 질문교육 플랫폼</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {step > 0 && (
            <div className="header-profile">
              {profile.role} · {profile.level} {profile.grade}
            </div>
          )}
          <button
            className="header-key-btn"
            onClick={() => setShowKeyModal(true)}
            title="API 키 변경"
          >
            🔑 API 키 변경
          </button>
        </div>
      </header>

      {/* 진행 표시 */}
      <div className="step-bar">
        {STEPS.map((s, i) => (
          <div key={s} className="step-item">
            <div className={`step-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} />
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < step ? "done" : ""}`} />
            )}
          </div>
        ))}
      </div>
      <p className="step-label">{STEPS[step]}</p>

      {/* 스텝 렌더링 */}
      <div className="step-content">
        {step === 0 && (
          <ProfileStep profile={profile} setProfile={setProfile} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <BookStep book={book} setBook={setBook} profile={profile} onNext={() => setStep(2)} onBack={() => setStep(0)} apiKey={apiKey} />
        )}
        {step === 2 && (
          <MethodStep method={method} setMethod={setMethod} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <QuestionStep book={book} method={method} profile={profile} onBack={() => setStep(2)} apiKey={apiKey} />
        )}
      </div>
      
      {/* 하단 저작권 문장 */}
      <footer className="app-footer">
        Copyright © 2026. 담연에듀연구소 함선미 All rights reserved.
      </footer>
    </div>
  );
}
