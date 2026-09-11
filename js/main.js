/**
 * main.js
 * Interatividade geral: menu mobile, accordion, observador para animacoes, scroll ativo
 */

/**
 * Menu mobile: toggle quando clicar no botao hamburguer
 */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu-mobile');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isOpen);
    menu.hidden = isOpen; // Inverte: se estava aberto, agora fecha

    // Impede scroll quando o menu estiver aberto
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Fecha o menu quando clicar em um link
  const links = menu.querySelectorAll('a, button');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      document.body.style.overflow = '';
    });
  });

  // Fecha ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.hidden === false) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      document.body.style.overflow = '';
    }
  });
}

/**
 * Acordeao (FAQ): toggle das respostas
 */
function initAccordion() {
  const questions = document.querySelectorAll('.faq__question');

  questions.forEach((question) => {
    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';
      const answerId = question.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      if (!answer) return;

      // Fecha todos os outros
      document.querySelectorAll('.faq__question').forEach((q) => {
        if (q !== question) {
          q.setAttribute('aria-expanded', 'false');
          const id = q.getAttribute('aria-controls');
          const el = document.getElementById(id);
          if (el) el.hidden = true;
        }
      });

      // Toggle este item
      question.setAttribute('aria-expanded', !isOpen);
      answer.hidden = isOpen; // Inverte: se estava aberto, fecha
    });
  });
}

/**
 * Animacoes de entrada: elementos com .reveal entram com fade + slide quando aparecem na viewport
 * Usa IntersectionObserver para melhor performance
 */
function initRevealAnimations() {
  // Verifica se o navegador suporta IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // Fallback: mostra tudo de uma vez
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Para de observar apos a animacao
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Quando 10% do elemento estiver visivel
    rootMargin: '0px 0px -50px 0px', // Um pouco antes de aparecer
  });

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Marca links de navegacao ativos conforme a secao em view
 */
function initActiveNavigation() {
  if (!('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link, .mobile-menu__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Remove ativo de todos
        navLinks.forEach((link) => {
          link.removeAttribute('aria-current');
        });

        // Marca o link correspondente como ativo
        const id = entry.target.id;
        const activeLink = document.querySelector(`a[href="#${id}"]`);
        if (activeLink) {
          activeLink.setAttribute('aria-current', 'true');
        }
      }
    });
  }, {
    threshold: 0.3,
  });

  sections.forEach((section) => {
    observer.observe(section);
  });
}

/**
 * Smooth scroll para links internos (fallback em browsers antigos)
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      // Se o navegador suporta scroll-behavior nativo, deixa ele fazer
      // Senao, faz manualmente
      if (!('scrollBehavior' in document.documentElement.style)) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Otimiza lazy loading: pre-carrega imagens que estao prestes a entrar na viewport
 */
function initLazyLoadOptimization() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[loading="lazy"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        // Se nao tiver src, carrega a partir de data-src (se existir)
        if (img.dataset.src && !img.src) {
          img.src = img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px', // Comeca a carregar 50px antes de aparecer
  });

  images.forEach((img) => {
    observer.observe(img);
  });
}

/**
 * Monitora performance basica
 */
function initPerformanceMonitoring() {
  // Envia metricas web vitals ao GA4 se disponivel
  if (!window.gtag) return;

  if ('web-vital' in window) {
    // Se voce implementar Web Vitals, envie para GA4:
    // window.gtag('event', 'page_view', { timing: value });
  }

  // Monitora Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            'lcp': lastEntry.renderTime || lastEntry.loadTime,
          });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Silenciosamente ignora se nao suportado
    }
  }
}

/**
 * Carrega tudo quando o DOM estiver pronto
 */
function init() {
  initMobileMenu();
  initAccordion();
  initRevealAnimations();
  initActiveNavigation();
  initSmoothScroll();
  initLazyLoadOptimization();
  initPerformanceMonitoring();

  // Avisa que a pagina esta pronta (util para debugging)
  console.log('[Shumurani] Pagina carregada e interativa');
}

// Executa init quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM ja carregou
  init();
}

// Rastreia event de navegacao (se GA4 estiver ativo)
window.addEventListener('pageshow', () => {
  if (window.gtag) {
    window.gtag('event', 'page_view');
  }
});
