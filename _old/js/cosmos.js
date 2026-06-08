// HAM SSAM — 우주 배경 캔버스
(function () {
  const canvas = document.getElementById('cosmos');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], nebulas = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    const count = Math.floor((W * H) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.2,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#e9d5ff', '#fde68a', '#bfdbfe'][Math.floor(Math.random() * 4)]
      });
    }
  }

  function initNebulas() {
    nebulas = [
      { x: W * 0.15, y: H * 0.25, rx: 300, ry: 200, color: 'rgba(109,40,217,0.07)' },
      { x: W * 0.85, y: H * 0.6,  rx: 250, ry: 180, color: 'rgba(251,191,36,0.05)' },
      { x: W * 0.5,  y: H * 0.9,  rx: 350, ry: 150, color: 'rgba(244,114,182,0.06)' },
    ];
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#03010a';
    ctx.fillRect(0, 0, W, H);

    // 성운
    nebulas.forEach(n => {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.scale(n.rx / Math.max(n.rx, n.ry), n.ry / Math.max(n.rx, n.ry));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x / (n.rx / Math.max(n.rx, n.ry)), n.y / (n.ry / Math.max(n.rx, n.ry)), Math.max(n.rx, n.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 별들
    t += 0.01;
    stars.forEach(s => {
      const alpha = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initStars(); initNebulas(); });
  resize(); initStars(); initNebulas(); draw();

  // 파티클 생성
  const particleContainer = document.getElementById('particles');
  if (particleContainer) {
    function createParticle() {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 1;
      const colors = ['rgba(192,132,252,0.6)', 'rgba(251,191,36,0.5)', 'rgba(244,114,182,0.5)', 'rgba(96,165,250,0.4)', 'rgba(52,211,153,0.4)'];
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration:${Math.random() * 15 + 10}s;
        animation-delay:${Math.random() * 10}s;
      `;
      particleContainer.appendChild(p);
      setTimeout(() => p.remove(), 25000);
    }
    setInterval(createParticle, 600);
    for (let i = 0; i < 20; i++) createParticle();
  }
})();
