import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header glass-panel">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-en text-gradient">HAM SSAM</span>
          <span className="logo-ko">함쌤</span>
        </Link>

        <nav className="desktop-nav">
          <Link to="/shape" className={location.pathname === '/shape' ? 'active' : ''}>도형심리</Link>
          <Link to="/star" className={location.pathname === '/star' ? 'active' : ''}>별자리</Link>
          <Link to="/saju" className={location.pathname === '/saju' ? 'active' : ''}>사주</Link>
          <a href="https://open.kakao.com/o/gbdfKQai" target="_blank" rel="noreferrer" className="btn-primary btn-sm">
            상담 신청
          </a>
        </nav>

        <button className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} color="#f8fafc" /> : <Menu size={24} color="#f8fafc" />}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-menu glass-panel animate-fade-in">
          <Link to="/shape" onClick={closeMenu}>도형심리분석</Link>
          <Link to="/star" onClick={closeMenu}>별자리차트</Link>
          <Link to="/saju" onClick={closeMenu}>운명비밀사주</Link>
          <a href="https://open.kakao.com/o/gbdfKQai" target="_blank" rel="noreferrer" className="btn-primary" onClick={closeMenu}>
            <MessageCircle size={18} /> 카카오 상담 신청
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
