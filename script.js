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

if (carouselTrack && carouselPrev && carouselNext) {
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
    if (carouselDots) {
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
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', () => { isHovering = true; });
    carouselWrapper.addEventListener('mouseleave', () => { isHovering = false; });
  }

  window.addEventListener('resize', updateCarousel);
  updateCarousel();
  startAutoPlay();
}

// ---------- FAQ Accordion ----------
const accordionItems = $$('.accordion-item');

accordionItems.forEach(item => {
  const header = item.querySelector('.accordion-header');
  const body = item.querySelector('.accordion-body');
  if (!header || !body) return;

  header.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    // Close all items
    accordionItems.forEach(i => {
      i.classList.remove('active');
      const b = i.querySelector('.accordion-body');
      if (b) b.style.maxHeight = null;
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
      item.classList.add('active');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// Configuración de Telegram Bot (Cargada desde config.js o fallback seguro)
const TELEGRAM_CONFIG = (window.TELEGRAM_CONFIG && window.TELEGRAM_CONFIG.botToken) ? window.TELEGRAM_CONFIG : {
  botToken: atob('ODcxODQyNjA3NTpBQUdDM2Vxb2FYUGR3eE44OVEwS1QzYTNnY0hhaHVBdVppVQ=='),
  chatId: atob('LTEwMDM4NTg0MTQwNjE=')
};

// WhatsApp Numbers for dispatch
const WHATSAPP_NUMBERS = [
  { id: 1, name: 'WhatsApp 1', number: '584249016080' },
  { id: 2, name: 'WhatsApp 2', number: '584122155025' },
  { id: 3, name: 'WhatsApp 3', number: '584148804780' },
  { id: 4, name: 'WhatsApp 4', number: '584121799492' }
];

// ---------- Contact Form ----------
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');
const waSendAllGrid = $('#waSendAllGrid');
const btnNuevaSolicitud = $('#btnNuevaSolicitud');

function validateField(field) {
  const isValid = field.checkValidity();
  field.classList.toggle('valid', isValid && field.value.trim() !== '');
  field.classList.toggle('invalid', !isValid);
  return isValid;
}

if (contactForm) {
  // Real-time validation
  $$('#contactForm input, #contactForm select, #contactForm textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let allValid = true;
    let firstInvalid = null;
    $$('#contactForm [required]').forEach(field => {
      if (!validateField(field)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return false;
    }

    // Cambiar boton a estado de carga
    const submitBtn = contactForm.querySelector('.form-submit');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando solicitud...';
      submitBtn.disabled = true;
    }

    // Extract form data
    const nombre = ($('#nombre') && $('#nombre').value) ? $('#nombre').value.trim() : 'No especificado';
    const telefono = ($('#telefono') && $('#telefono').value) ? $('#telefono').value.trim() : 'No especificado';
    const email = ($('#email') && $('#email').value) ? $('#email').value.trim() : 'No especificado';
    const nivelEl = $('#nivel');
    const nivel = (nivelEl && nivelEl.value) ? nivelEl.options[nivelEl.selectedIndex].text : 'No especificado';
    const servicioEl = $('#tipoServicio');
    const servicio = (servicioEl && servicioEl.value) ? servicioEl.options[servicioEl.selectedIndex].text : 'No especificado';
    const fecha = ($('#fechaLimite') && $('#fechaLimite').value) ? $('#fechaLimite').value : 'Por acordar';
    const origenEl = $('#origen');
    const origen = (origenEl && origenEl.value) ? origenEl.options[origenEl.selectedIndex].text : 'No especificado';
    const descripcion = ($('#descripcion') && $('#descripcion').value) ? $('#descripcion').value.trim() : 'Sin detalles';

    // Limpiar numero de telefono para enlace
    const cleanPhone = telefono.replace(/[^\d]/g, '');

    // 1. Enviar notificación instantánea a Telegram y ESPERAR entrega
    if (TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId) {
      const telegramMsg = `🎓 <b>NUEVA SOLICITUD DE TRABAJO - EduCraft</b>\n\n` +
        `👤 <b>Cliente:</b> ${nombre}\n` +
        `📱 <b>WhatsApp:</b> <a href="https://wa.me/${cleanPhone}">${telefono}</a>\n` +
        `📧 <b>Correo:</b> ${email}\n` +
        `📚 <b>Nivel:</b> ${nivel}\n` +
        `🛠️ <b>Servicio:</b> ${servicio}\n` +
        `📅 <b>Fecha entrega:</b> ${fecha}\n` +
        `🔍 <b>Origen:</b> ${origen}\n\n` +
        `📝 <b>Detalles del trabajo:</b>\n${descripcion}`;

      try {
        const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CONFIG.chatId,
            text: telegramMsg,
            parse_mode: 'HTML'
          }),
          keepalive: true
        });
        const respData = await resp.json();
        console.log('Telegram response:', respData);
      } catch (err) {
        console.warn('Error enviando a Telegram:', err);
      }
    }

    // 2. Construir mensaje de WhatsApp
    const messageLines = [
      '🎓 *NUEVA SOLICITUD DE TRABAJO - EDU_CRAFT*',
      '',
      `👤 *Nombre:* ${nombre}`,
      `📱 *Mi WhatsApp:* ${telefono}`,
      `📧 *Correo:* ${email}`,
      `📚 *Nivel:* ${nivel}`,
      `🛠️ *Servicio:* ${servicio}`,
      `📅 *Fecha de entrega:* ${fecha}`,
      `🔍 *Nos encontro por:* ${origen}`,
      '',
      '📝 *Detalles del trabajo:*',
      descripcion
    ];
    const fullMessage = messageLines.join('\n');
    const encodedMsg = encodeURIComponent(fullMessage);
    const directWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBERS[0].number}?text=${encodedMsg}`;

    // 3. Render cards for all 4 numbers with preloaded message
    if (waSendAllGrid) {
      waSendAllGrid.innerHTML = WHATSAPP_NUMBERS.map(wa => `
        <a href="https://wa.me/${wa.number}?text=${encodedMsg}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="wa-dispatch-card" 
           data-id="${wa.id}">
          <div class="wa-dispatch-left">
            <i class="fab fa-whatsapp"></i>
            <div class="wa-dispatch-text">
              <span class="wa-dispatch-name">${wa.name}</span>
              <span class="wa-dispatch-num">+${wa.number}</span>
            </div>
          </div>
          <span class="wa-dispatch-badge"><i class="fas fa-paper-plane"></i> Enviar chat</span>
        </a>
      `).join('');

      // Mark as opened when clicked
      waSendAllGrid.querySelectorAll('.wa-dispatch-card').forEach(card => {
        card.addEventListener('click', () => {
          card.classList.add('opened');
          const badge = card.querySelector('.wa-dispatch-badge');
          if (badge) {
            badge.innerHTML = '<i class="fas fa-check"></i> Abierto';
          }
        });
      });
    }

    // Actualizar botón principal si existe
    const btnPrimaryWhatsApp = $('#btnPrimaryWhatsApp');
    if (btnPrimaryWhatsApp) {
      btnPrimaryWhatsApp.href = directWhatsAppUrl;
    }

    // 4. Transicionar interfaz a vista de exito
    contactForm.style.display = 'none';
    if (formSuccess) {
      formSuccess.classList.add('active');
      const wrapper = $('#contactFormWrapper');
      if (wrapper) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // 5. Abrir WhatsApp en una nueva pestaña (sin abandonar la página)
    try {
      window.open(directWhatsAppUrl, '_blank');
    } catch (e) {
      console.log('Popup prevented, user can click WhatsApp link', e);
    }

    return false;
  });
}

// Reset form and go back
if (btnNuevaSolicitud) {
  btnNuevaSolicitud.addEventListener('click', () => {
    if (formSuccess) formSuccess.classList.remove('active');
    if (contactForm) {
      contactForm.style.display = 'block';
      contactForm.reset();
      $$('#contactForm .valid, #contactForm .invalid').forEach(el => {
        el.classList.remove('valid', 'invalid');
      });
      const submitBtn = contactForm.querySelector('.form-submit');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Enviar solicitud ahora';
        submitBtn.disabled = false;
      }
      const wrapper = $('#contactFormWrapper');
      if (wrapper) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
}

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
