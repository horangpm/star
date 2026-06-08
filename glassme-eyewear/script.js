/* ===================================================
   글라스미 안경 배곧점 - JavaScript (Premium & Refined)
   =================================================== */

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initRevealAnimations();
  initScrollAnimations();
  initFloatingCTA();
  initBackToTop();
  initPriceRowEffects();
  initActiveNavLink();
  initLensCardInteraction();
  initEasterEgg();
  
  console.log('%c글라스미 안경 배곧점', 'color: #1e78e6; font-size: 24px; font-weight: bold;');
  console.log('%c봄맞이 대할인 행사 진행중! 031-433-0880', 'color: #ffd700; font-size: 14px;');
});

// ===== HEADER SCROLL EFFECT =====
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const menu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');
  
  window.toggleMenu = function() {
    if (!menu || !hamburger) return;
    menu.classList.toggle('open');
    hamburger.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  };

  window.closeMenu = function() {
    if (!menu || !hamburger) return;
    menu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close menu on outside click
  document.addEventListener('click', function(e) {
    if (menu && hamburger && !menu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });
}

// ===== REVEAL ON SCROLL =====
function initRevealAnimations() {
  const elements = [
    '.sale-card',
    '.price-row',
    '.lens-card',
    '.sunglass-item',
    '.why-item',
    '.contact-card',
    '.contact-map',
    '.lens-notice',
    '.section__header',
    '.gallery-item'
  ];
  elements.forEach(function(selector) {
    document.querySelectorAll(selector).forEach(function(el) {
      el.classList.add('reveal');
    });
  });
}

function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  reveals.forEach(function(el, i) {
    el.style.transitionDelay = (i % 6) * 0.05 + 's';
    observer.observe(el);
  });
}

// ===== FLOATING CTA =====
function initFloatingCTA() {
  const cta = document.getElementById('floatingCta');
  if (!cta) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      cta.classList.add('visible');
    } else {
      cta.classList.remove('visible');
    }
  }, { passive: true });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  
  window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

// ===== PRICE ROW HOVER EFFECT =====
function initPriceRowEffects() {
  document.querySelectorAll('.price-row').forEach(function(row) {
    row.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(30, 120, 230, 0.06)';
    });
    row.addEventListener('mouseleave', function() {
      this.style.background = '';
    });
  });
}

// ===== ACTIVE NAV LINK ON SCROLL =====
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    let current = '';
    const navHeight = 80;

    sections.forEach(function(section) {
      const sectionTop = section.offsetTop - navHeight - 30;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function(link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // Trigger once on load
}

// ===== LENS CARD INTERACTIVE =====
function initLensCardInteraction() {
  document.querySelectorAll('.lens-card').forEach(function(card) {
    card.addEventListener('click', function() {
      const salePriceEl = this.querySelector('.lens-sale');
      if (salePriceEl) {
        salePriceEl.style.transform = 'scale(1.15)';
        salePriceEl.style.color = 'var(--color-gold-light)';
        setTimeout(function() {
          salePriceEl.style.transform = '';
          salePriceEl.style.color = '';
        }, 300);
      }
    });
  });
}

// ===== EASTER EGG =====
function initEasterEgg() {
  var tapCount = 0;
  var tapTimer;
  const badge = document.querySelector('.hero__badge');
  if (!badge) return;
  badge.addEventListener('click', function() {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(function() { tapCount = 0; }, 2000);
    if (tapCount >= 5) {
      tapCount = 0;
      document.title = '글라스미 VIP 고객님 환영합니다! 👓';
      setTimeout(function() { document.title = '글라스미 안경 배곧점 | GLASSME EYEWEAR'; }, 3000);
    }
  });
}
