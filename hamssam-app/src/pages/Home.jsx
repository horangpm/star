import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Hexagon, Star as StarIcon, Compass } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <p className="hero-sub text-gradient">우주의 기운이 전하는 메시지</p>
          <h1 className="hero-title">
            <span className="line1">당신의 별자리</span>
            <span className="line2">도형 심리</span>
            <span className="line3">운명의 사주</span>
          </h1>
          <p className="hero-desc">
            함쌤이 우주의 언어로 당신의 본질을 읽어드립니다.<br />
            태어난 순간 새겨진 별의 지도를 함께 펼쳐보세요.
          </p>
          <a href="https://open.kakao.com/o/gbdfKQai" target="_blank" rel="noreferrer" className="btn-primary hero-btn">
            <Sparkles size={20} /> 지금 상담 시작하기
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="section-label text-gradient">WHAT WE OFFER</div>
        <h2 className="section-title">세 가지 우주의 언어</h2>

        <div className="cards-grid">
          {/* Shape Card */}
          <Link to="/shape" className="glass-panel service-card float-1">
            <div className="card-icon neon-purple">
              <Hexagon size={40} />
            </div>
            <div className="card-num">01</div>
            <h3 className="card-title">도형심리분석</h3>
            <p className="card-desc">당신이 선택한 도형 속에 숨겨진 무의식의 언어. 심층 심리가 드러내는 진짜 나.</p>
            <div className="card-tag">Shape Psychology</div>
          </Link>

          {/* Star Card */}
          <Link to="/star" className="glass-panel service-card float-2">
            <div className="card-icon neon-blue">
              <StarIcon size={40} />
            </div>
            <div className="card-num">02</div>
            <h3 className="card-title">별자리차트</h3>
            <p className="card-desc">탄생 순간 하늘이 그린 별자리 지도. 12궁의 배열이 전하는 운명의 청사진.</p>
            <div className="card-tag">Astrology Chart</div>
          </Link>

          {/* Saju Card */}
          <Link to="/saju" className="glass-panel service-card float-3">
            <div className="card-icon neon-pink">
              <Compass size={40} />
            </div>
            <div className="card-num">03</div>
            <h3 className="card-title">운명비밀사주</h3>
            <p className="card-desc">사주팔자 속에 새겨진 당신만의 운명 코드. 천간지지가 펼치는 삶의 이야기.</p>
            <div className="card-tag">Secret Destiny</div>
          </Link>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews">
        <div className="section-label text-gradient">REVIEWS</div>
        <h2 className="section-title">별들이 전한 이야기들</h2>
        <div className="reviews-grid">
          <div className="glass-panel review-card float-1">
            <div className="stars">★★★★★</div>
            <p>"도형 분석을 받고 나서 왜 그동안 그런 선택을 해왔는지 이해하게 됐어요. 정말 신기하고 깊이 있는 상담이었습니다."</p>
            <span className="reviewer">— 30대 직장인 ㄱ님</span>
          </div>
          <div className="glass-panel review-card float-2">
            <div className="stars">★★★★★</div>
            <p>"별자리 차트 해석이 제 상황과 너무 정확하게 맞아서 소름이 돋았어요. 앞으로의 방향이 조금 더 선명해진 느낌입니다."</p>
            <span className="reviewer">— 20대 대학원생 ㅂ님</span>
          </div>
          <div className="glass-panel review-card float-3">
            <div className="stars">★★★★★</div>
            <p>"사주 풀이가 단순히 운세를 보는 것이 아니라 제 본질적인 특성을 이해하는 시간이었습니다. 새로운 관점이 생겼어요."</p>
            <span className="reviewer">— 40대 사업가 ㅇ님</span>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer glass-panel">
        <p>© 2026 HAM SSAM. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
