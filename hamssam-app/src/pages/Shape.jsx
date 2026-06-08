import React from 'react';
import { Hexagon, ArrowRight } from 'lucide-react';
import './PageStyles.css';

const Shape = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="glass-panel page-header">
        <Hexagon size={48} className="page-icon neon-purple" />
        <h1 className="page-title text-gradient">도형심리분석</h1>
        <p className="page-subtitle">무의식이 그리는 진짜 나의 모습</p>
      </div>

      <div className="page-content">
        <div className="glass-panel content-box">
          <h2>도형심리란?</h2>
          <p>
            우리가 무의식적으로 선택하고 그리는 도형(동그라미, 세모, 네모, S자)에는 
            우리의 현재 심리 상태와 기질, 성격적 특성이 고스란히 담겨 있습니다.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="bullet neon-purple">•</span>
              <strong>관계와 소통:</strong> 타인과 어떻게 관계 맺고 소통하는지 파악합니다.
            </div>
            <div className="feature-item">
              <span className="bullet neon-purple">•</span>
              <strong>스트레스 요인:</strong> 현재 나를 힘들게 하는 내면의 갈등을 찾습니다.
            </div>
            <div className="feature-item">
              <span className="bullet neon-purple">•</span>
              <strong>잠재력 발견:</strong> 내가 가진 고유한 강점과 가능성을 깨닫습니다.
            </div>
          </div>
        </div>

        <div className="cta-box glass-panel">
          <h3>나만의 도형 차트를 그려보고 싶다면?</h3>
          <p>함쌤과 함께 내면의 이야기를 나누어 보세요.</p>
          <a href="https://open.kakao.com/o/gbdfKQai" target="_blank" rel="noreferrer" className="btn-primary">
            상담 예약하기 <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Shape;
