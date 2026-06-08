import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import './PageStyles.css';

const Saju = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="glass-panel page-header">
        <Compass size={48} className="page-icon neon-pink" />
        <h1 className="page-title text-gradient">운명비밀사주</h1>
        <p className="page-subtitle">태어난 년월일시가 알려주는 나의 길</p>
      </div>

      <div className="page-content">
        <div className="glass-panel content-box">
          <h2>명리학(사주팔자)이란?</h2>
          <p>
            우주 만물을 이루는 음양오행의 기운이 내가 태어난 순간 어떻게 작용했는지,
            네 개의 기둥(사주)과 여덟 글자(팔자)로 풀어내는 동양의 지혜입니다.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="bullet neon-pink">•</span>
              <strong>타고난 기질:</strong> 나의 본성과 사회적 가면, 숨겨진 재능을 알아봅니다.
            </div>
            <div className="feature-item">
              <span className="bullet neon-pink">•</span>
              <strong>대운과 세운:</strong> 10년 단위의 큰 흐름(대운)과 매년의 흐름(세운)을 읽어냅니다.
            </div>
            <div className="feature-item">
              <span className="bullet neon-pink">•</span>
              <strong>관계와 궁합:</strong> 나와 타인의 기운이 어떻게 조화를 이루는지 분석합니다.
            </div>
          </div>
        </div>

        <div className="cta-box glass-panel">
          <h3>나의 운명 코드를 풀고 싶다면?</h3>
          <p>함쌤과 함께 인생의 내비게이션을 확인해 보세요.</p>
          <a href="https://open.kakao.com/o/gbdfKQai" target="_blank" rel="noreferrer" className="btn-primary">
            상담 예약하기 <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Saju;
