/**
 * analytics.js
 * Gerencia consentimento de cookies (LGPD) e Google Analytics 4
 * O GA4 so funciona se o usuario consentir explicitamente
 */

// ID do seu Google Analytics 4 - SUBSTITUA PELO SEU ID REAL
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Configuracao do consentimento
const CONSENT_KEY = 'shumurani-consent';

/**
 * Obtem o status de consentimento do usuario
 * @returns {Object} { cookies: boolean, analytics: boolean }
 */
function getConsentStatus() {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) {
    return { cookies: null, analytics: false }; // null = nao respondeu
  }
  try {
    return JSON.parse(stored);
  } catch {
    return { cookies: null, analytics: false };
  }
}

/**
 * Salva o consentimento do usuario
 * @param {boolean} accepted
 */
function saveConsent(accepted) {
  const consent = {
    cookies: accepted,
    analytics: accepted,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

  // Ativa/desativa o GA4
  if (accepted) {
    loadGoogleAnalytics();
  }

  // Avisa ao corpo da pagina que ha um banner de cookies ativo
  if (accepted || !accepted) {
    document.body.classList.toggle('has-consent-banner', false);
  }
}

/**
 * Injeta o Google Analytics 4 no documento
 */
function loadGoogleAnalytics() {
  // Evita carregamento duplo
  if (window.dataLayer) return;

  // DataLayer do Google Tag Manager / GA4
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, {
    'anonymize_ip': true,
    'allow_google_signals': false,
  });

  // Injeta o script do GA4
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  script.setAttribute('data-ga', GA4_MEASUREMENT_ID);
  document.head.appendChild(script);

  // Armazena gtag globalmente para uso posterior
  window.gtag = gtag;
}

/**
 * Rastreia evento de clique (se consentir com GA4)
 * @param {string} category
 * @param {string} action
 * @param {string} label
 */
function trackEvent(category, action, label) {
  if (window.gtag) {
    window.gtag('event', action, {
      'event_category': category,
      'event_label': label,
    });
  }
}

/**
 * Rastreia evento de visualizacao de pagina
 */
function trackPageView() {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      'page_path': window.location.pathname,
      'page_title': document.title,
    });
  }
}

/**
 * Mostra o banner de cookies
 */
function showConsentBanner() {
  const banner = document.getElementById('banner-cookies');
  if (banner) {
    banner.hidden = false;
    banner.classList.add('is-visible');
    document.body.classList.add('has-consent-banner');
  }
}

/**
 * Esconde o banner de cookies
 */
function hideConsentBanner() {
  const banner = document.getElementById('banner-cookies');
  if (banner) {
    banner.classList.remove('is-visible');
    setTimeout(() => {
      banner.hidden = true;
      document.body.classList.remove('has-consent-banner');
    }, 350); // Aguarda o tempo da animacao CSS
  }
}

/**
 * Inicializa o sistema de consentimento
 */
function initConsent() {
  const consent = getConsentStatus();

  // Se nao respondeu, mostra o banner
  if (consent.cookies === null) {
    showConsentBanner();
  } else if (consent.analytics) {
    // Se ja consentiu, carrega GA4
    loadGoogleAnalytics();
  }

  // Event listeners nos botoes do banner
  const btnAccept = document.querySelector('[data-consent="accept"]');
  const btnDeny = document.querySelector('[data-consent="deny"]');
  const btnPreferences = document.getElementById('abrir-preferencias-cookies');

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      saveConsent(true);
      hideConsentBanner();
    });
  }

  if (btnDeny) {
    btnDeny.addEventListener('click', () => {
      saveConsent(false);
      hideConsentBanner();
    });
  }

  if (btnPreferences) {
    btnPreferences.addEventListener('click', () => {
      showConsentBanner();
    });
  }
}

/**
 * Setup de rastreamento de cliques em links (se consentir)
 */
function setupClickTracking() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-track]');
    if (!target) return;

    const category = target.getAttribute('data-track') || 'link';
    const location = target.getAttribute('data-track-location') || 'unknown';
    const label = target.textContent?.trim() || target.href || 'click';

    trackEvent(category, 'click', `${location}: ${label}`);
  }, true); // Capture phase para pegar antes da nav
}

/**
 * Inicializa o ano no footer
 */
function updateYearInFooter() {
  const anoSpan = document.getElementById('ano-atual');
  if (anoSpan) {
    anoSpan.textContent = new Date().getFullYear();
  }
}

// Inicia tudo quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initConsent();
    setupClickTracking();
    updateYearInFooter();
  });
} else {
  // DOM ja carregou (ex: se o script for loaded como defer apos o DOM)
  initConsent();
  setupClickTracking();
  updateYearInFooter();
}

// Rastreia page_view apos o carregamento
if (window.gtag) {
  trackPageView();
}
