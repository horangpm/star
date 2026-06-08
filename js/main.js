// HAM SSAM — main.js
(function () {
  // 햄버거 메뉴
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  }

  // 스크롤 페이드인
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .review-card, .info-card, .about-text').forEach(el => {
    el.classList.add('fade-on-scroll');
    observer.observe(el);
  });

  // 방문자 카운트 (관리자용)
  const visits = parseInt(localStorage.getItem('hs_visits') || '0') + 1;
  localStorage.setItem('hs_visits', visits);
  const today = new Date().toISOString().split('T')[0];
  const daily = JSON.parse(localStorage.getItem('hs_daily') || '{}');
  daily[today] = (daily[today] || 0) + 1;
  // 최근 30일만 유지
  const keys = Object.keys(daily).sort();
  if (keys.length > 30) keys.slice(0, keys.length - 30).forEach(k => delete daily[k]);
  localStorage.setItem('hs_daily', JSON.stringify(daily));
  localStorage.setItem('hs_total', visits);

  // 헤더 스크롤 효과
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.background = window.scrollY > 50
        ? 'rgba(3,1,10,0.92)'
        : 'rgba(3,1,10,0.7)';
    }, { passive: true });
  }
})();
