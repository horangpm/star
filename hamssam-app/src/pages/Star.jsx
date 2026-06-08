import React from 'react';
import { Star as StarIcon, ArrowRight } from 'lucide-react';
import './PageStyles.css';

const Star = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="glass-panel page-header">
        <StarIcon size={48} className="page-icon neon-blue" />
        <h1 className="page-title text-gradient">별자리차트</h1>
        <p className="page-subtitle">우주가 나에게 부여한 특별한 청사진</p>
      </div>

      <div className="page-content">
        <div className="glass-panel content-box">
          <h2>점성학(Astrology)이란?</h2>
          <p>
            당신이 태어난 정확한 시간과 장소에서 바라본 하늘의 별자리 배치를 
            '네이탈 차트(Natal Chart)'라고 합니다. 이는 우주가 당신에게 찍어준 영혼의 지문과도 같습니다.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="bullet neon-blue">•</span>
              <strong>12 하우스:</strong> 삶의 다양한 영역(재물, 사랑, 직업 등)에서의 성향을 분석합니다.
            </div>
            <div className="feature-item">
              <span className="bullet neon-blue">•</span>
              <strong>행성의 위치:</strong> 나의 자아(태양), 감정(달), 소통방식(수성) 등을 깊이 이해합니다.
            </div>
            <div className="feature-item">
              <span className="bullet neon-blue">•</span>
              <strong>인생의 타이밍:</strong> 현재 별들의 움직임이 내 삶에 미치는 영향을 예측합니다.
            </div>
          </div>
        </div>

        <div className="cta-box glass-panel">
          <h3>나의 네이탈 차트가 궁금하다면?</h3>
          <p>정확한 태어난 시간을 준비하시고 함쌤에게 문의하세요.</p>
          <a href="https://open.kakao.com/o/gbdfKQai" target="_blank" rel="noreferrer" className="btn-primary">
            상담 예약하기 <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Star;
