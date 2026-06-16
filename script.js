// ================================================================
// EDUCRAFT — JavaScript functionality
// ================================================================

// ---------- Utilities ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ---------- Navbar scroll effect ----------
const navbar = $('#navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);
  lastScroll = y;
});

// ---------- Mobile menu ----------
const hamburger = $('#hamburger');
const mobileMenu = $('#mobileMenu');
const mobileOverlay = $('#mobileOverlay');

function toggleMenu() {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  mobileOverlay.classList.toggle('active');
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMenu);
mobileOverlay.addEventListener('click', toggleMenu);

// Close mobile menu on link click
$$('.mobile-menu a').forEach(link => {
  link.addEventListener('click', toggleMenu);
});

// Keyboard accessibility for hamburger
hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMenu();
  }
});

// ---------- Smooth scroll for anchor links ----------
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = $(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ---------- Scroll reveal (IntersectionObserver) ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Active nav link tracking ----------
const sections = $$('section[id]');
const navLinks = $$('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(sec => sectionObserver.observe(sec));

// ---------- Animated counters ----------
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = '+' + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

$$('.stat-number').forEach(el => counterObserver.observe(el));

// ---------- Service tabs ----------
const serviceTabs = $$('#serviceTabs .tab-btn');
const serviceCards = $$('#servicesGrid .service-card');

serviceTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update tab active state
    serviceTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const category = tab.dataset.tab;

    // Filter cards
    serviceCards.forEach(card => {
      const show = category === 'todos' || card.dataset.category === category;
      if (show) {
        card.classList.remove('hidden-card');
        card.classList.add('fade-in');
        // Remove animation class after it plays so it can replay
        setTimeout(() => card.classList.remove('fade-in'), 450);
      } else {
        card.classList.add('hidden-card');
      }
    });
  });
});

// ---------- Pricing tabs ----------
const pricingTabs = $$('#pricingTabs .tab-btn');
const pricingPanels = $$('.pricing-panel');

pricingTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    pricingTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const panelId = tab.dataset.panel;
    pricingPanels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === panelId);
    });
  });
});

// ---------- Testimonials Carousel ----------
const carouselTrack = $('#carouselTrack');
const carouselPrev = $('#carouselPrev');
const carouselNext = $('#carouselNext');
const carouselDots = $('#carouselDots');
const testimonialCards = $$('.testimonial-card');

let currentSlide = 0;
let autoPlayInterval;
let isHovering = false;

function getSlidesPerView() {
  return window.innerWidth >= 768 ? 2 : 1;
}

function getMaxSlide() {
  return Math.ceil(testimonialCards.length / getSlidesPerView()) - 1;
}

function updateCarousel() {
  const slidesPerView = getSlidesPerView();
  const maxSlide = getMaxSlide();
  currentSlide = Math.min(currentSlide, maxSlide);
  const translateX = -(currentSlide * (100 / slidesPerView));
  carouselTrack.style.transform = `translateX(${translateX}%)`;

  // Update dots
  const totalDots = maxSlide + 1;
  carouselDots.innerHTML = '';
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === currentSlide ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => { currentSlide = i; updateCarousel(); });
    carouselDots.appendChild(dot);
  }
}

function nextSlide() {
  const maxSlide = getMaxSlide();
  currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
  updateCarousel();
}

function prevSlide() {
  const maxSlide = getMaxSlide();
  currentSlide = currentSlide <= 0 ? maxSlide : currentSlide - 1;
  updateCarousel();
}

function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(() => {
    if (!isHovering) nextSlide();
  }, 4000);
}

function stopAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
}

carouselNext.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
carouselPrev.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

const carouselWrapper = $('#testimonialCarousel');
carouselWrapper.addEventListener('mouseenter', () => { isHovering = true; });
carouselWrapper.addEventListener('mouseleave', () => { isHovering = false; });

window.addEventListener('resize', updateCarousel);

updateCarousel();
startAutoPlay();

// ---------- FAQ Accordion ----------
const accordionItems = $$('.accordion-item');

accordionItems.forEach(item => {
  const header = item.querySelector('.accordion-header');
  const body = item.querySelector('.accordion-body');

  header.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    // Close all items
    accordionItems.forEach(i => {
      i.classList.remove('active');
      i.querySelector('.accordion-body').style.maxHeight = null;
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
      item.classList.add('active');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// ---------- Contact Form ----------
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');

// Real-time validation
$$('#contactForm input, #contactForm select, #contactForm textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('invalid')) validateField(field);
  });
});

function validateField(field) {
  const isValid = field.checkValidity();
  field.classList.toggle('valid', isValid && field.value.trim() !== '');
  field.classList.toggle('invalid', !isValid);
  return isValid;
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let allValid = true;
  $$('#contactForm [required]').forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  if (allValid) {
    // TODO: conectar con backend o EmailJS
    contactForm.style.display = 'none';
    formSuccess.classList.add('active');
  }
});

// Helper: scroll to contact
function scrollToContact() {
  const contact = $('#contacto');
  if (contact) {
    const navHeight = navbar.offsetHeight;
    window.scrollTo({
      top: contact.getBoundingClientRect().top + window.pageYOffset - navHeight,
      behavior: 'smooth'
    });
  }
}

// Make scrollToContact globally accessible
window.scrollToContact = scrollToContact;

// ---------- Initialize ----------
// Set minimum date for fechaLimite to today
const fechaInput = $('#fechaLimite');
if (fechaInput) {
  const today = new Date().toISOString().split('T')[0];
  fechaInput.setAttribute('min', today);
}
