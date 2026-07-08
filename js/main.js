
const siteHeader = document.querySelector('.site-header');
const heroSlider = document.querySelector('.hero-slider');

function updateHeaderState() {
  if (!siteHeader || !heroSlider) return;

  siteHeader.classList.toggle('is-scrolled', window.scrollY > 4);
}

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });
window.addEventListener('resize', updateHeaderState);

const menuButton = document.querySelector('.menu-button');
const fullscreenMenu = document.querySelector('.fullscreen-menu');

if (menuButton && fullscreenMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = fullscreenMenu.classList.toggle('is-open');
    menuButton.classList.toggle('is-active', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    fullscreenMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  fullscreenMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      fullscreenMenu.classList.remove('is-open');
      menuButton.classList.remove('is-active');
      menuButton.setAttribute('aria-expanded', 'false');
      fullscreenMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

const slides = [...document.querySelectorAll('.hero-slide')];
let activeSlide = 0;
let sliderTimer;
const sliderDuration = 8400;
document.documentElement.style.setProperty('--slider-duration', `${sliderDuration}ms`);

function setSlide(index) {
  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSlide;
    slide.classList.toggle('is-active', isActive);

    slide.querySelectorAll('.hero-dots button').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeSlide);

      // Reinicia la animación del loader en el indicador activo visible.
      if (isActive && dotIndex === activeSlide) {
        dot.style.animation = 'none';
        dot.offsetHeight;
        dot.style.animation = '';
      }
    });
  });
}

function startSlider() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => {
    setSlide(activeSlide + 1);
  }, sliderDuration);
}

slides.forEach((slide) => {
  slide.querySelectorAll('.hero-dots button').forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      setSlide(dotIndex);
      startSlider();
    });
  });
});

if (slides.length > 1) startSlider();


const revealElements = Array.from(document.querySelectorAll('.reveal-on-scroll'));
let revealFrame = null;

const setActiveRevealSection = () => {
  revealFrame = null;

  if (!revealElements.length) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
  const viewportFocus = viewportHeight * 0.54;
  const candidates = revealElements
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => rect.top < viewportHeight * 0.82 && rect.bottom > viewportHeight * 0.16);

  if (!candidates.length) {
    revealElements.forEach((element) => element.classList.remove('is-visible'));
    return;
  }

  const active = candidates.reduce((best, current) => {
    const bestFocus = best.rect.top + best.rect.height * 0.38;
    const currentFocus = current.rect.top + current.rect.height * 0.38;
    return Math.abs(currentFocus - viewportFocus) < Math.abs(bestFocus - viewportFocus) ? current : best;
  }).element;

  revealElements.forEach((element) => {
    element.classList.toggle('is-visible', element === active);
  });
};

const requestRevealUpdate = () => {
  if (revealFrame) return;
  revealFrame = window.requestAnimationFrame(setActiveRevealSection);
};

if (revealElements.length) {
  setActiveRevealSection();
  window.addEventListener('scroll', requestRevealUpdate, { passive: true });
  window.addEventListener('resize', requestRevealUpdate);
  window.addEventListener('load', requestRevealUpdate);
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const brandsCarousel = document.querySelector('[data-brands-carousel]');
const brandsTrack = brandsCarousel?.querySelector('.brands-track');
const brandsEdges = brandsCarousel?.querySelectorAll('[data-brands-edge]') || [];
let brandsScrollFrame = null;
let brandsScrollDirection = 0;
let brandsLastTimestamp = 0;
const brandsScrollSpeed = 0.32;

function stopBrandsScroll() {
  brandsScrollDirection = 0;
  brandsLastTimestamp = 0;
  if (brandsScrollFrame) {
    cancelAnimationFrame(brandsScrollFrame);
    brandsScrollFrame = null;
  }
}

function stepBrandsScroll(timestamp) {
  if (!brandsTrack || !brandsScrollDirection) return;

  if (!brandsLastTimestamp) brandsLastTimestamp = timestamp;
  const delta = timestamp - brandsLastTimestamp;
  brandsLastTimestamp = timestamp;

  brandsTrack.scrollLeft += brandsScrollDirection * brandsScrollSpeed * delta;

  const maxScrollLeft = brandsTrack.scrollWidth - brandsTrack.clientWidth;
  if (brandsTrack.scrollLeft <= 0 && brandsScrollDirection < 0) {
    brandsTrack.scrollLeft = 0;
    stopBrandsScroll();
    return;
  }

  if (brandsTrack.scrollLeft >= maxScrollLeft && brandsScrollDirection > 0) {
    brandsTrack.scrollLeft = maxScrollLeft;
    stopBrandsScroll();
    return;
  }

  brandsScrollFrame = requestAnimationFrame(stepBrandsScroll);
}

function startBrandsScroll(direction) {
  if (!brandsTrack) return;
  brandsScrollDirection = direction;
  if (!brandsScrollFrame) {
    brandsScrollFrame = requestAnimationFrame(stepBrandsScroll);
  }
}

brandsEdges.forEach((edge) => {
  const direction = edge.dataset.brandsEdge === 'left' ? -1 : 1;

  edge.addEventListener('pointerenter', () => startBrandsScroll(direction));
  edge.addEventListener('pointerleave', stopBrandsScroll);
  edge.addEventListener('focus', () => startBrandsScroll(direction));
  edge.addEventListener('blur', stopBrandsScroll);
  edge.addEventListener('click', () => {
    if (!brandsTrack) return;
    brandsTrack.scrollBy({ left: direction * brandsTrack.clientWidth * 0.85, behavior: 'smooth' });
  });
});

if (brandsTrack) {
  brandsTrack.addEventListener('pointerdown', stopBrandsScroll);
  brandsTrack.addEventListener('wheel', stopBrandsScroll, { passive: true });
}


// Non-blocking edge hover carousel: moves the track when the cursor is near
// the visible left/right edges, without placing elements above the cards.
if (brandsCarousel && brandsTrack) {
  const edgeZoneRatio = 0.16;

  brandsCarousel.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(max-width: 980px)').matches) return;

    const rect = brandsCarousel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const zone = Math.max(92, rect.width * edgeZoneRatio);

    if (x < zone) {
      startBrandsScroll(-1);
    } else if (x > rect.width - zone) {
      startBrandsScroll(1);
    } else {
      stopBrandsScroll();
    }
  });

  brandsCarousel.addEventListener('pointerleave', stopBrandsScroll);
}

// Brand modal: opens brand detail without leaving the home page.
const brandModalData = {
  nautica: {
    name: 'Nautica Home',
    logo: 'assets/logos/nautica.svg',
    website: '#',
    headline: 'Mobiliario y decoración que inspiran un estilo de vida atemporal.',
    description: 'Nautica Home integra piezas residenciales, decoración y ambientes cuidadosamente curados para crear espacios cálidos, sofisticados y pensados para disfrutarse todos los días.',
    images: [
      'assets/images/brand-nautica.webp',
      'assets/images/solution-residencial.webp',
      'assets/images/brand-cg-furniture.webp',
      'assets/images/hero-bg.webp'
    ]
  },
  hacker: {
    name: 'Häcker',
    logo: 'assets/logos/hacker.svg',
    website: '#',
    headline: 'Cocinas alemanas de diseño que combinan precisión, funcionalidad y una estética excepcional.',
    description: 'Häcker reúne ingeniería alemana, sistemas modulares y acabados de alta calidad para desarrollar cocinas y soluciones interiores con una ejecución limpia, durable y personalizada.',
    images: [
      'assets/images/brand-hacker.webp',
      'assets/images/hero-bg.webp',
      'assets/images/about-integral.webp',
      'assets/images/solution-residencial.webp'
    ]
  },
  emerald: {
    name: 'Emerald',
    logo: 'assets/logos/emerald.svg',
    website: '#',
    headline: 'Superficies y acabados seleccionados para elevar cada proyecto.',
    description: 'Emerald aporta materiales, cubiertas, superficies y acabados premium que integran belleza, resistencia y versatilidad para proyectos residenciales, comerciales y de hospitalidad.',
    images: [
      'assets/images/brand-emerald.webp',
      'assets/images/about-integral.webp',
      'assets/images/solution-hospitality.webp',
      'assets/images/hero-02-showroom.webp'
    ]
  },
  cg: {
    name: 'CG Furniture',
    logo: 'assets/logos/cg-furniture.svg',
    website: '#',
    headline: 'Fabricación a medida con precisión y atención a cada detalle.',
    description: 'CG Furniture desarrolla mobiliario, carpinterías y soluciones especiales fabricadas a medida para integrar diseño, funcionalidad y manufactura en espacios residenciales y comerciales.',
    images: [
      'assets/images/brand-cg-furniture.webp',
      'assets/images/brand-emerald.webp',
      'assets/images/solution-residencial.webp',
      'assets/images/about-integral.webp'
    ]
  }
};

const brandModal = document.querySelector('[data-brand-modal]');
const brandModalPanel = brandModal?.querySelector('.brand-modal__panel');
const modalLogo = document.querySelector('[data-modal-logo]');
const modalHeadline = document.querySelector('[data-modal-headline]');
const modalDescription = document.querySelector('[data-modal-description]');
const modalWebsite = document.querySelector('[data-modal-website]');
const modalImages = document.querySelectorAll('[data-modal-image]');
let lastBrandTrigger = null;

function setBrandModalContent(key) {
  const brand = brandModalData[key] || brandModalData.hacker;

  if (modalLogo) {
    modalLogo.src = brand.logo;
    modalLogo.alt = brand.name;
  }
  if (modalHeadline) modalHeadline.textContent = brand.headline;
  if (modalDescription) modalDescription.textContent = brand.description;
  if (modalWebsite) {
    modalWebsite.href = brand.website || '#';
    modalWebsite.setAttribute('aria-label', `Visitar web de ${brand.name}`);
    modalWebsite.target = brand.website && brand.website !== '#' ? '_blank' : '_self';
  }
  modalImages.forEach((img) => {
    const index = Number(img.dataset.modalImage);
    img.src = brand.images[index] || brand.images[0];
    img.alt = `${brand.name} lifestyle ${index + 1}`;
  });
}

function openBrandModal(key, trigger) {
  if (!brandModal) return;
  lastBrandTrigger = trigger || null;
  stopBrandsScroll();
  setBrandModalContent(key);
  brandModal.classList.add('is-open');
  brandModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-brand-modal');
  requestAnimationFrame(() => {
    brandModal.querySelector('[data-brand-modal-close]')?.focus({ preventScroll: true });
  });
}

function closeBrandModal() {
  if (!brandModal) return;
  if (showroomLightbox?.classList.contains('is-open')) closeShowroomLightbox();
  brandModal.classList.remove('is-open');
  brandModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-brand-modal');
  syncBodyScrollLock();
  if (lastBrandTrigger) lastBrandTrigger.focus({ preventScroll: true });
}

document.querySelectorAll('.brand-card[data-brand]').forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    openBrandModal(card.dataset.brand, card);
  });
});

brandModal?.querySelectorAll('[data-brand-modal-close]').forEach((button) => {
  button.addEventListener('click', closeBrandModal);
});

brandModalPanel?.addEventListener('click', (event) => {
  event.stopPropagation();
});

window.addEventListener('keydown', (event) => {
  if (showroomLightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape' && brandModal?.classList.contains('is-open')) {
    closeBrandModal();
  }
});

// Mobile brand carousel indicators.
const brandsIndicators = document.querySelector('[data-brands-indicators]');
const brandsIndicatorButtons = brandsIndicators ? [...brandsIndicators.querySelectorAll('button')] : [];
const brandCards = brandsTrack ? [...brandsTrack.querySelectorAll('.brand-card')] : [];
let brandsIndicatorRaf = null;

function updateBrandsIndicators() {
  if (!brandsTrack || !brandsIndicatorButtons.length || !brandCards.length) return;

  const trackRect = brandsTrack.getBoundingClientRect();
  const trackCenter = trackRect.left + trackRect.width / 2;
  let activeIndex = 0;
  let closestDistance = Infinity;

  brandCards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const distance = Math.abs(cardCenter - trackCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  brandsIndicatorButtons.forEach((button, index) => {
    button.classList.toggle('is-active', index === activeIndex);
    button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
  });
}

function requestBrandsIndicatorUpdate() {
  if (brandsIndicatorRaf) cancelAnimationFrame(brandsIndicatorRaf);
  brandsIndicatorRaf = requestAnimationFrame(updateBrandsIndicators);
}

if (brandsTrack && brandsIndicatorButtons.length && brandCards.length) {
  brandsTrack.addEventListener('scroll', requestBrandsIndicatorUpdate, { passive: true });
  window.addEventListener('resize', requestBrandsIndicatorUpdate);

  brandsIndicatorButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const target = brandCards[index];
      if (!target) return;
      brandsTrack.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    });
  });

  requestBrandsIndicatorUpdate();
}


// Floating WhatsApp CTA: replace the phone number with the official WhatsApp Business number.
const whatsappButtons = document.querySelectorAll('[data-whatsapp-button]');
const whatsappPhone = '5210000000000';
const whatsappMessage = 'Hola, vi la página de Casa Glick y me gustaría hablar con un agente.';

whatsappButtons.forEach((button) => {
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  button.setAttribute('href', whatsappUrl);

  button.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'contact',
        event_label: 'floating_button'
      });
    }
  });
});

const showroomWhatsAppButtons = document.querySelectorAll('[data-showroom-whatsapp]');
const showroomWhatsAppMessage = 'Quiero conocer el showroom';

showroomWhatsAppButtons.forEach((button) => {
  const showroomWhatsAppUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(showroomWhatsAppMessage)}`;
  button.setAttribute('href', showroomWhatsAppUrl);
  button.setAttribute('target', '_blank');
  button.setAttribute('rel', 'noopener');

  button.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'showroom',
        event_label: 'showroom_cta'
      });
    }
  });
});

const showroomCarousel = document.querySelector('[data-showroom-carousel]');
const showroomItems = showroomCarousel ? Array.from(showroomCarousel.querySelectorAll('.showroom-gallery__item')) : [];

const showroomLightbox = document.querySelector('[data-showroom-lightbox]');
const showroomLightboxImage = document.querySelector('[data-showroom-lightbox-image]');
const showroomLightboxClose = document.querySelector('[data-showroom-lightbox-close]');
const showroomLightboxPrev = document.querySelector('[data-showroom-lightbox-prev]');
const showroomLightboxNext = document.querySelector('[data-showroom-lightbox-next]');
const showroomTrack = document.querySelector('.showroom-track');
let showroomLightboxOpenedFromCarousel = false;
let lastLightboxTrigger = null;
let currentLightboxItems = [];
let currentLightboxIndex = -1;

const pauseShowroomCarousel = () => {
  showroomTrack?.classList.add('is-paused');
};

const resumeShowroomCarousel = () => {
  showroomTrack?.classList.remove('is-paused');
};

const syncBodyScrollLock = () => {
  if (!showroomLightbox?.classList.contains('is-open')) {
    document.body.classList.remove('has-showroom-lightbox');
  }
  if (!brandModal?.classList.contains('is-open')) {
    document.body.classList.remove('has-brand-modal');
  }
  if (!projectModal?.classList.contains('is-open') && !sectorModal?.classList.contains('is-open')) {
    document.body.classList.remove('has-project-modal');
  }
  if (!aboutModal?.classList.contains('is-open')) {
    document.body.classList.remove('has-about-modal');
  }
  if (!solutionModal?.classList.contains('is-open')) {
    document.body.classList.remove('has-solution-modal');
  }
};

const getLightboxItemsFromGallery = (trigger) => {
  if (!trigger) return [];

  if (trigger.closest('.showroom-gallery__item')) {
    const firstGroup = document.querySelector('.showroom-track__group');
    const buttons = firstGroup
      ? Array.from(firstGroup.querySelectorAll('.showroom-gallery__item'))
      : Array.from(document.querySelectorAll('.showroom-gallery__item'));

    return buttons.map((button) => {
      const image = button.querySelector('img');
      return {
        source: button.getAttribute('data-showroom-image') || image?.currentSrc || image?.getAttribute('src') || '',
        alt: image?.getAttribute('alt') || 'Imagen ampliada del showroom Casa Glick',
        trigger: button
      };
    }).filter((item) => item.source);
  }

  const gallery = trigger.closest('.brand-modal__gallery, [data-project-modal-gallery], [data-sector-modal-gallery]');
  if (gallery) {
    return Array.from(gallery.querySelectorAll('[data-modal-image], [data-project-modal-image], [data-sector-modal-image]')).map((image) => ({
      source: image.currentSrc || image.getAttribute('src') || '',
      alt: image.getAttribute('alt') || 'Imagen ampliada de Casa Glick',
      trigger: image
    })).filter((item) => item.source);
  }

  const image = trigger.matches('img') ? trigger : trigger.querySelector?.('img');
  const source = trigger.getAttribute?.('data-showroom-image') || image?.currentSrc || image?.getAttribute('src') || '';
  return source ? [{ source, alt: image?.getAttribute('alt') || 'Imagen ampliada de Casa Glick', trigger }] : [];
};

const setShowroomLightboxNavState = () => {
  const canNavigate = currentLightboxItems.length > 1;
  showroomLightboxPrev?.toggleAttribute('hidden', !canNavigate);
  showroomLightboxNext?.toggleAttribute('hidden', !canNavigate);
};

const renderShowroomLightboxItem = (index) => {
  if (!showroomLightboxImage || !currentLightboxItems.length) return;
  const normalizedIndex = ((index % currentLightboxItems.length) + currentLightboxItems.length) % currentLightboxItems.length;
  currentLightboxIndex = normalizedIndex;
  const item = currentLightboxItems[normalizedIndex];
  showroomLightboxImage.setAttribute('src', item.source);
  showroomLightboxImage.setAttribute('alt', item.alt || 'Imagen ampliada de Casa Glick');
  setShowroomLightboxNavState();
};

const stepShowroomLightbox = (direction) => {
  if (currentLightboxItems.length <= 1) return;
  renderShowroomLightboxItem(currentLightboxIndex + direction);
};

const openShowroomLightbox = (source, alt = 'Imagen ampliada de Casa Glick', shouldPauseCarousel = false, trigger = null, collectionItems = null, initialIndex = 0) => {
  if (!showroomLightbox || !showroomLightboxImage || !source) return;
  if (showroomLightbox.parentElement !== document.body) {
    document.body.appendChild(showroomLightbox);
  }

  const derivedItems = Array.isArray(collectionItems) && collectionItems.length ? collectionItems : getLightboxItemsFromGallery(trigger);
  currentLightboxItems = derivedItems.length ? derivedItems : [{ source, alt, trigger }];
  showroomLightboxOpenedFromCarousel = Boolean(shouldPauseCarousel);
  lastLightboxTrigger = trigger || document.activeElement || null;
  renderShowroomLightboxItem(Math.max(0, initialIndex));
  showroomLightbox.classList.add('is-open');
  showroomLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-showroom-lightbox');
  if (shouldPauseCarousel) pauseShowroomCarousel();
  requestAnimationFrame(() => {
    showroomLightboxClose?.focus({ preventScroll: true });
  });
};

const closeShowroomLightbox = () => {
  if (!showroomLightbox || !showroomLightboxImage) return;
  showroomLightbox.classList.remove('is-open');
  showroomLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-showroom-lightbox');
  showroomLightboxImage.removeAttribute('src');
  currentLightboxItems = [];
  currentLightboxIndex = -1;
  setShowroomLightboxNavState();
  if (showroomLightboxOpenedFromCarousel) resumeShowroomCarousel();
  showroomLightboxOpenedFromCarousel = false;
  const shouldRestoreFocus = lastLightboxTrigger && typeof lastLightboxTrigger.focus === 'function' && document.contains(lastLightboxTrigger);
  if (shouldRestoreFocus) {
    lastLightboxTrigger.focus({ preventScroll: true });
  }
  lastLightboxTrigger = null;
  syncBodyScrollLock();
};

showroomItems.forEach((item) => {
  item.addEventListener('click', () => {
    const image = item.querySelector('img');
    const source = item.getAttribute('data-showroom-image') || image?.currentSrc || image?.getAttribute('src');
    const collection = getLightboxItemsFromGallery(item);
    const initialIndex = Math.max(0, collection.findIndex((entry) => entry.source === source));
    openShowroomLightbox(source, image?.getAttribute('alt') || 'Imagen ampliada del showroom Casa Glick', true, item, collection, initialIndex);
  });
});

showroomLightboxClose?.addEventListener('click', closeShowroomLightbox);
showroomLightboxPrev?.addEventListener('click', (event) => { event.stopPropagation(); stepShowroomLightbox(-1); });
showroomLightboxNext?.addEventListener('click', (event) => { event.stopPropagation(); stepShowroomLightbox(1); });

showroomLightbox?.addEventListener('click', (event) => {
  event.stopPropagation();
  if (event.target === showroomLightbox) closeShowroomLightbox();
});

document.addEventListener('keydown', (event) => {
  if (!showroomLightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeShowroomLightbox();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    stepShowroomLightbox(-1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    stepShowroomLightbox(1);
  }
});

document.addEventListener('click', (event) => {
  const image = event.target.closest?.('[data-modal-image], [data-project-modal-image], [data-sector-modal-image]');
  if (!image) return;
  event.preventDefault();
  event.stopPropagation();
  const source = image.currentSrc || image.getAttribute('src');
  const collection = getLightboxItemsFromGallery(image);
  const initialIndex = Math.max(0, collection.findIndex((entry) => entry.trigger === image || entry.source === source));
  openShowroomLightbox(source, image.getAttribute('alt') || 'Imagen ampliada de Casa Glick', false, image, collection, initialIndex);
}, true);


// Projects auto scroll: same edge-hover behavior used in Brands.
const projectsCarousel = document.querySelector('[data-projects-carousel]');
const projectsTrack = projectsCarousel?.querySelector('.projects-track');
const projectsEdges = projectsCarousel?.querySelectorAll('[data-projects-edge]') || [];
let projectsScrollFrame = null;
let projectsScrollDirection = 0;
let projectsLastTimestamp = 0;
const projectsScrollSpeed = 0.32;

function stopProjectsScroll() {
  projectsScrollDirection = 0;
  projectsLastTimestamp = 0;
  if (projectsScrollFrame) {
    cancelAnimationFrame(projectsScrollFrame);
    projectsScrollFrame = null;
  }
}

function stepProjectsScroll(timestamp) {
  if (!projectsTrack || !projectsScrollDirection) return;

  if (!projectsLastTimestamp) projectsLastTimestamp = timestamp;
  const delta = timestamp - projectsLastTimestamp;
  projectsLastTimestamp = timestamp;

  projectsTrack.scrollLeft += projectsScrollDirection * projectsScrollSpeed * delta;

  const maxScrollLeft = projectsTrack.scrollWidth - projectsTrack.clientWidth;
  if (projectsTrack.scrollLeft <= 0 && projectsScrollDirection < 0) {
    projectsTrack.scrollLeft = 0;
    stopProjectsScroll();
    return;
  }

  if (projectsTrack.scrollLeft >= maxScrollLeft && projectsScrollDirection > 0) {
    projectsTrack.scrollLeft = maxScrollLeft;
    stopProjectsScroll();
    return;
  }

  projectsScrollFrame = requestAnimationFrame(stepProjectsScroll);
}

function startProjectsScroll(direction) {
  if (!projectsTrack) return;
  projectsScrollDirection = direction;
  if (!projectsScrollFrame) {
    projectsScrollFrame = requestAnimationFrame(stepProjectsScroll);
  }
}

projectsEdges.forEach((edge) => {
  const direction = edge.dataset.projectsEdge === 'left' ? -1 : 1;

  edge.addEventListener('pointerenter', () => startProjectsScroll(direction));
  edge.addEventListener('pointerleave', stopProjectsScroll);
  edge.addEventListener('focus', () => startProjectsScroll(direction));
  edge.addEventListener('blur', stopProjectsScroll);
  edge.addEventListener('click', () => {
    if (!projectsTrack) return;
    projectsTrack.scrollBy({ left: direction * projectsTrack.clientWidth * 0.85, behavior: 'smooth' });
  });
});

if (projectsTrack) {
  projectsTrack.addEventListener('pointerdown', stopProjectsScroll);
  projectsTrack.addEventListener('wheel', stopProjectsScroll, { passive: true });
}

function getProjectsVisibleCards() {
  if (!projectsTrack) return [];

  const trackRect = projectsTrack.getBoundingClientRect();
  return [...projectsTrack.querySelectorAll('.project-card:not(.is-hidden)')].filter((card) => {
    const cardRect = card.getBoundingClientRect();
    return cardRect.right > trackRect.left + 1 && cardRect.left < trackRect.right - 1;
  });
}

if (projectsCarousel && projectsTrack) {
  const edgeZoneRatio = 0.14;

  projectsCarousel.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(max-width: 980px)').matches) return;

    const carouselRect = projectsCarousel.getBoundingClientRect();
    const trackRect = projectsTrack.getBoundingClientRect();
    const x = event.clientX - carouselRect.left;
    const zone = Math.max(96, carouselRect.width * edgeZoneRatio);
    const visibleCards = getProjectsVisibleCards();
    const firstVisibleCard = visibleCards[0];
    const lastVisibleCard = visibleCards[visibleCards.length - 1];
    const hoveredCard = event.target.closest?.('.project-card');

    if (x < zone || (hoveredCard && hoveredCard === firstVisibleCard && projectsTrack.scrollLeft > 0)) {
      startProjectsScroll(-1);
    } else if (x > carouselRect.width - zone || (hoveredCard && hoveredCard === lastVisibleCard && projectsTrack.scrollLeft < projectsTrack.scrollWidth - projectsTrack.clientWidth - 1)) {
      startProjectsScroll(1);
    } else if (event.clientX < trackRect.left || event.clientX > trackRect.right) {
      stopProjectsScroll();
    } else {
      stopProjectsScroll();
    }
  });

  projectsCarousel.addEventListener('pointerleave', stopProjectsScroll);
}



// Project modal: opens project detail with an adaptive image grid.
const projectModalData = {
  'casa-nautica': {
    type: 'Residencial',
    title: 'Casa Náutica',
    location: 'Mérida, Yucatán',
    description: 'Un proyecto residencial pensado para integrar interiorismo, mobiliario y atmósferas cálidas bajo una ejecución integral. La galería se adapta al número de imágenes disponibles para que cada proyecto pueda crecer sin romper el diseño.',
    images: [
      'assets/images/solution-residencial.webp',
      'assets/images/hero-bg.webp',
      'assets/images/about-integral.webp',
      'assets/images/brand-nautica.webp',
      'assets/images/brand-cg-furniture.webp'
    ]
  },
  'torre-habitat': {
    type: 'Hospitality',
    title: 'Torre Habitat',
    location: 'Cancún, Quintana Roo',
    description: 'Una propuesta de hospitalidad con acabados premium, piezas seleccionadas y una narrativa espacial enfocada en crear una experiencia memorable desde el primer recorrido.',
    images: [
      'assets/images/solution-hospitality.webp',
      'assets/images/hero-02-showroom.webp'
    ]
  },
  'emerald-residence': {
    type: 'Residencial',
    title: 'Emerald Residence',
    location: 'Ciudad de México',
    description: 'Un espacio residencial contemporáneo donde arquitectura, materiales y curaduría interior se integran en una sola visión de diseño.',
    images: [
      'assets/images/hero-03-exterior.webp'
    ]
  },
  'glick-lounge': {
    type: 'Hospitality',
    title: 'Glick Lounge',
    location: 'Mérida, Yucatán',
    description: 'Un ambiente de showroom y lounge diseñado para exhibir materiales, soluciones y experiencias de interiorismo con una lectura sofisticada y funcional.',
    images: [
      'assets/images/hero-02-showroom.webp',
      'assets/images/brand-hacker.webp',
      'assets/images/brand-emerald.webp',
      'assets/images/about-integral.webp'
    ]
  }
};

const projectModal = document.querySelector('[data-project-modal]');
const projectModalPanel = projectModal?.querySelector('.project-modal__panel');
const projectModalType = document.querySelector('[data-project-modal-type]');
const projectModalTitle = document.querySelector('[data-project-modal-title]');
const projectModalLocation = document.querySelector('[data-project-modal-location]');
const projectModalDescription = document.querySelector('[data-project-modal-description]');
const projectModalGallery = document.querySelector('[data-project-modal-gallery]');
const projectModalImages = document.querySelectorAll('[data-project-modal-image]');
let lastProjectTrigger = null;

function setProjectModalContent(key) {
  const project = projectModalData[key] || projectModalData['casa-nautica'];
  const images = project.images && project.images.length ? project.images : ['assets/images/hero-bg.webp'];

  if (projectModalType) projectModalType.textContent = project.type || 'Proyecto';
  if (projectModalTitle) projectModalTitle.textContent = project.title || '';
  if (projectModalLocation) projectModalLocation.textContent = project.location || '';
  if (projectModalDescription) projectModalDescription.textContent = project.description || '';

  projectModalImages.forEach((img) => {
    const index = Number(img.dataset.projectModalImage || 0);
    img.src = images[index] || images[index % images.length] || images[0];
    img.alt = `${project.title || 'Proyecto'} imagen ${index + 1}`;
  });
}

function openProjectModal(key, trigger) {
  if (!projectModal) return;
  lastProjectTrigger = trigger || null;
  stopProjectsScroll();
  setProjectModalContent(key);
  projectModal.classList.add('is-open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-project-modal');
  requestAnimationFrame(() => {
    projectModal.querySelector('[data-project-modal-close]')?.focus({ preventScroll: true });
  });
}

function closeProjectModal() {
  if (!projectModal) return;
  if (showroomLightbox?.classList.contains('is-open')) closeShowroomLightbox();
  projectModal.classList.remove('is-open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-project-modal');
  syncBodyScrollLock();
  if (lastProjectTrigger) lastProjectTrigger.focus({ preventScroll: true });
}

document.querySelectorAll('.project-card[data-project]').forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    openProjectModal(card.dataset.project, card);
  });
});

projectModal?.querySelectorAll('[data-project-modal-close]').forEach((button) => {
  button.addEventListener('click', closeProjectModal);
});

projectModalPanel?.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.querySelector('[data-project-modal-cta]')?.addEventListener('click', () => {
  closeProjectModal();
});

window.addEventListener('keydown', (event) => {
  if (showroomLightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape' && projectModal?.classList.contains('is-open')) {
    closeProjectModal();
  }
});


// Sector modal: opens sector detail with the same visual system as Brands and Projects.
const sectorModalData = {
  residencial: {
    type: 'Sector residencial',
    title: 'Residencial',
    description: 'Diseñamos casas, departamentos y residencias privadas con una visión integral que une interiorismo, mobiliario, materiales y detalles para crear espacios habitables, funcionales y atemporales.',
    scope: [
      { label: 'Interiorismo integral', icon: 'layout' },
      { label: 'Mobiliario y decoración', icon: 'sofa' },
      { label: 'Cocinas y baños', icon: 'chefhat' },
      { label: 'Iluminación y acabados', icon: 'lamp' }
    ],
    images: [
      'assets/images/solution-residencial.webp',
      'assets/images/hero-bg.webp',
      'assets/images/about-integral.webp',
      'assets/images/brand-nautica.webp'
    ]
  },
  hospitality: {
    type: 'Sector hospitality',
    title: 'Hospitality',
    description: 'Creamos espacios para hoteles, restaurantes, lounges y proyectos de experiencia donde la atmósfera, la operación y la durabilidad trabajan juntas para fortalecer la percepción de marca.',
    scope: [
      { label: 'Concepto interior', icon: 'layout' },
      { label: 'Mobiliario contract', icon: 'sofa' },
      { label: 'Iluminación ambiental', icon: 'lamp' },
      { label: 'Acabados de alto tráfico', icon: 'layers' }
    ],
    images: [
      'assets/images/solution-hospitality.webp',
      'assets/images/hero-02-showroom.webp',
      'assets/images/brand-emerald.webp',
      'assets/images/about-integral.webp'
    ]
  },
  comercial: {
    type: 'Sector comercial',
    title: 'Comercial',
    description: 'Desarrollamos showrooms, boutiques, retail y espacios comerciales pensados para mejorar el recorrido, la exhibición del producto y la experiencia del cliente en cada punto de contacto.',
    scope: [
      { label: 'Diseño de experiencia', icon: 'sparkles' },
      { label: 'Exhibición y layout', icon: 'layout' },
      { label: 'Mobiliario comercial', icon: 'store' },
      { label: 'Iluminación de producto', icon: 'lamp' }
    ],
    images: [
      'assets/images/brand-cg-furniture.webp',
      'assets/images/hero-bg.webp',
      'assets/images/solution-residencial.webp',
      'assets/images/brand-hacker.webp'
    ]
  },
  corporativo: {
    type: 'Sector corporativo',
    title: 'Corporativo',
    description: 'Diseñamos oficinas, salas de juntas y espacios de trabajo que proyectan imagen institucional, optimizan la operación diaria y elevan el confort de los equipos.',
    scope: [
      { label: 'Planeación de espacios', icon: 'layout' },
      { label: 'Mobiliario corporativo', icon: 'briefcase' },
      { label: 'Salas de juntas', icon: 'users' },
      { label: 'Áreas comunes', icon: 'building' }
    ],
    images: [
      'assets/images/hero-02-showroom.webp',
      'assets/images/about-integral.webp',
      'assets/images/brand-hacker.webp',
      'assets/images/brand-emerald.webp'
    ]
  }
};


const sectorScopeIconPaths = {
  layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  sofa: '<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v7"/>',
  faucet: '<path d="M10 4h4"/><path d="M12 4v4"/><path d="M8 8h8a4 4 0 0 1 4 4v1"/><path d="M4 13h16"/><path d="M6 13v4a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-4"/><path d="M12 16v.01"/>',
  chefhat: '<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>',
  bath: '<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.12 0l-.88.88"/><path d="M2 12h20"/><path d="M7 12v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7"/><path d="M4 12v3a4 4 0 0 0 4 4"/><path d="M20 12v3a4 4 0 0 1-4 4"/>',
  lamp: '<path d="M8 2h8l2 8H6l2-8Z"/><path d="M12 10v10"/><path d="M8 22h8"/><path d="M10 20h4"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>',
  store: '<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0V7"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M2 12h20"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'
};


function escapeSectorScopeText(value) {
  return String(value || '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]));
}

function formatSectorScopeLabel(label) {
  const words = String(label || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';

  const splitIndex = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, splitIndex).join(' ');
  const secondLine = words.slice(splitIndex).join(' ') || '&nbsp;';

  return `<span class="sector-modal__scope-line">${escapeSectorScopeText(firstLine)}</span><span class="sector-modal__scope-line">${secondLine === '&nbsp;' ? secondLine : escapeSectorScopeText(secondLine)}</span>`;
}

function createSectorScopeIcon(iconName) {
  const wrapper = document.createElement('span');
  wrapper.className = 'sector-modal__scope-icon';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = `<svg class="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${sectorScopeIconPaths[iconName] || sectorScopeIconPaths.layout}</svg>`;
  return wrapper;
}

const sectorModal = document.querySelector('[data-sector-modal]');
const sectorModalPanel = sectorModal?.querySelector('.project-modal__panel');
const sectorModalType = document.querySelector('[data-sector-modal-type]');
const sectorModalTitle = document.querySelector('[data-sector-modal-title]');
const sectorModalDescription = document.querySelector('[data-sector-modal-description]');
const sectorModalScope = document.querySelector('[data-sector-modal-scope]');
const sectorModalImages = document.querySelectorAll('[data-sector-modal-image]');
let lastSectorTrigger = null;

function setSectorModalContent(key) {
  const sector = sectorModalData[key] || sectorModalData.residencial;
  const images = sector.images && sector.images.length ? sector.images : ['assets/images/hero-bg.webp'];

  if (sectorModalType) sectorModalType.textContent = sector.type || 'Sector';
  if (sectorModalTitle) sectorModalTitle.textContent = sector.title || '';
  if (sectorModalDescription) sectorModalDescription.textContent = sector.description || '';
  if (sectorModalScope) {
    sectorModalScope.innerHTML = '';
    (sector.scope || []).slice(0, 4).forEach((item) => {
      const li = document.createElement('li');
      const scopeItem = typeof item === 'string' ? { label: item, icon: 'layout' } : item;
      const label = document.createElement('span');
      label.className = 'sector-modal__scope-text';
      label.innerHTML = formatSectorScopeLabel(scopeItem.label || '');
      li.appendChild(createSectorScopeIcon(scopeItem.icon));
      li.appendChild(label);
      sectorModalScope.appendChild(li);
    });
  }

  sectorModalImages.forEach((img) => {
    const index = Number(img.dataset.sectorModalImage || 0);
    img.src = images[index] || images[index % images.length] || images[0];
    img.alt = `${sector.title || 'Sector'} imagen ${index + 1}`;
  });
}

function openSectorModal(key, trigger) {
  if (!sectorModal) return;
  lastSectorTrigger = trigger || null;
  setSectorModalContent(key);
  sectorModal.classList.add('is-open');
  sectorModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-project-modal');
  requestAnimationFrame(() => {
    sectorModal.querySelector('[data-sector-modal-close]')?.focus({ preventScroll: true });
  });
}

function closeSectorModal() {
  if (!sectorModal) return;
  if (showroomLightbox?.classList.contains('is-open')) closeShowroomLightbox();
  sectorModal.classList.remove('is-open');
  sectorModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-project-modal');
  syncBodyScrollLock();
  if (lastSectorTrigger) lastSectorTrigger.focus({ preventScroll: true });
}

document.querySelectorAll('.sector-item[data-sector]').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    openSectorModal(item.dataset.sector, item);
  });
});

sectorModal?.querySelectorAll('[data-sector-modal-close]').forEach((button) => {
  button.addEventListener('click', closeSectorModal);
});

sectorModalPanel?.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.querySelector('[data-sector-modal-cta]')?.addEventListener('click', () => {
  closeSectorModal();
});

window.addEventListener('keydown', (event) => {
  if (showroomLightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape' && sectorModal?.classList.contains('is-open')) {
    closeSectorModal();
  }
});


// Projects filter interactions.
const projectFilterButtons = document.querySelectorAll('[data-project-filter]');
const projectCards = document.querySelectorAll('[data-project-category]');

projectFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const activeFilter = button.dataset.projectFilter || 'all';

    projectFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('is-active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });

    projectCards.forEach((card) => {
      const shouldHide = activeFilter !== 'all' && card.dataset.projectCategory !== activeFilter;
      card.classList.toggle('is-hidden', shouldHide);
    });

    stopProjectsScroll();
    document.querySelector('.projects-track')?.scrollTo({ left: 0, behavior: 'smooth' });
  });
});

// Contact form: static fallback opens the user's mail client with the form content.
const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = document.querySelector('[data-contact-status]');

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get('nombre') || '').trim();
  const email = String(formData.get('correo') || '').trim();
  const phone = String(formData.get('telefono') || '').trim();
  const message = String(formData.get('mensaje') || '').trim();

  if (!name || !email || !phone || !message || !contactForm.checkValidity()) {
    if (contactStatus) contactStatus.textContent = 'Completa todos los campos requeridos.';
    contactForm.reportValidity();
    return;
  }

  const subject = `Nuevo proyecto Casa Glick - ${name || 'Contacto web'}`;
  const body = [
    'Hola Casa Glick,',
    '',
    'Me gustaría compartir la información de mi proyecto:',
    '',
    `Nombre: ${name}`,
    `Correo: ${email}`,
    `Teléfono: ${phone}`,
    '',
    'Mensaje:',
    message,
  ].join('\n');

  if (contactStatus) contactStatus.textContent = 'Preparando tu mensaje...';
  window.location.href = `mailto:contacto@gruposegel.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});


// About modal: opens Casa Glick editorial story from the Nosotros CTA.
const aboutModal = document.querySelector('[data-about-modal]');
const aboutModalPanel = aboutModal?.querySelector('.project-modal__panel');
const aboutModalOpen = document.querySelector('[data-about-modal-open]');
let lastAboutTrigger = null;

function openAboutModal(trigger) {
  if (!aboutModal) return;
  lastAboutTrigger = trigger || null;
  aboutModal.classList.add('is-open');
  aboutModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-about-modal');
  requestAnimationFrame(() => {
    aboutModal.querySelector('[data-about-modal-close]')?.focus({ preventScroll: true });
  });
}

function closeAboutModal() {
  if (!aboutModal) return;
  if (showroomLightbox?.classList.contains('is-open')) closeShowroomLightbox();
  aboutModal.classList.remove('is-open');
  aboutModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-about-modal');
  syncBodyScrollLock();
  if (lastAboutTrigger) lastAboutTrigger.focus({ preventScroll: true });
}

aboutModalOpen?.addEventListener('click', () => openAboutModal(aboutModalOpen));

aboutModal?.querySelectorAll('[data-about-modal-close]').forEach((button) => {
  button.addEventListener('click', closeAboutModal);
});

aboutModalPanel?.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.querySelector('[data-about-modal-cta]')?.addEventListener('click', () => {
  closeAboutModal();
});

window.addEventListener('keydown', (event) => {
  if (showroomLightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape' && aboutModal?.classList.contains('is-open')) {
    closeAboutModal();
  }
});

// Solution modal: opens Hospitality and Residencial details from the Soluciones cards.
const solutionModalData = {
  hospitality: {
    type: 'Solución',
    title: 'Hospitality',
    lead: 'Diseñamos espacios pensados para recibir, operar y permanecer memorables. Alineamos concepto, selección de firmas, materiales y acompañamiento para que cada decisión funcione en la experiencia del huésped y en la operación diaria.',
    tags: ['Hoteles boutique', 'Restaurantes', 'Amenidades', 'Villas'],
    cta: 'HABLEMOS DE TU PROYECTO',
    result: 'Un espacio con atmósfera clara, materiales adecuados para uso intensivo y una experiencia coherente desde el primer contacto hasta el último detalle.',
    sections: [
      {
        heading: 'Qué resolvemos',
        copy: 'Convertimos una intención de negocio en una experiencia espacial clara: recorridos, permanencia, resistencia, mantenimiento, iluminación y carácter visual.'
      },
      {
        heading: 'Nuestro enfoque',
        copy: 'Integramos planeación, selección de firmas, mobiliario, acabados e instalación para reducir fricción entre proveedores y mantener control estético y técnico.'
      },
      {
        heading: 'Acompañamiento',
        copy: 'Trabajamos junto al cliente desde la definición del concepto hasta la entrega, cuidando tiempos, prioridades operativas y consistencia en cada zona del proyecto.'
      }
    ]
  },
  residencial: {
    type: 'Solución',
    title: 'Residencial',
    lead: 'Creamos hogares con equilibrio entre estética, funcionalidad y vida cotidiana. Cada espacio se desarrolla a partir de cómo se habita, qué se necesita resolver y qué sensación debe permanecer todos los días.',
    tags: ['Casas', 'Departamentos', 'Cocinas y baños', 'Interiores completos'],
    cta: 'HABLEMOS DE TU PROYECTO',
    result: 'Un hogar coherente, cómodo y personalizado, donde distribución, materiales, mobiliario e iluminación conviven con naturalidad y sentido práctico.',
    sections: [
      {
        heading: 'Qué resolvemos',
        copy: 'Traducimos necesidades reales en decisiones de diseño: almacenamiento, circulación, uso diario, privacidad, áreas sociales y relación entre materiales.'
      },
      {
        heading: 'Nuestro enfoque',
        copy: 'Curamos firmas, acabados, mobiliario, cocinas, baños, clósets y piezas decorativas para construir una propuesta integral sin perder personalidad.'
      },
      {
        heading: 'Acompañamiento',
        copy: 'Guiamos al cliente en selección, compra, fabricación e instalación para que el proceso sea claro, ordenado y conectado con la visión del proyecto.'
      }
    ]
  }
};

const solutionModal = document.querySelector('[data-solution-modal]');
const solutionModalPanel = solutionModal?.querySelector('.project-modal__panel');
const solutionModalType = document.querySelector('[data-solution-modal-type]');
const solutionModalTitle = document.querySelector('[data-solution-modal-title]');
const solutionModalLead = document.querySelector('[data-solution-modal-lead]');
const solutionModalTags = document.querySelector('[data-solution-modal-tags]');
const solutionModalResult = document.querySelector('[data-solution-modal-result]');
const solutionModalHeadings = [
  document.querySelector('[data-solution-modal-heading-one]'),
  document.querySelector('[data-solution-modal-heading-two]'),
  document.querySelector('[data-solution-modal-heading-three]')
];
const solutionModalCopies = [
  document.querySelector('[data-solution-modal-copy-one]'),
  document.querySelector('[data-solution-modal-copy-two]'),
  document.querySelector('[data-solution-modal-copy-three]')
];
let lastSolutionTrigger = null;

function setSolutionModalContent(key) {
  const solution = solutionModalData[key] || solutionModalData.residencial;
  if (solutionModalType) solutionModalType.textContent = solution.type;
  if (solutionModalTitle) solutionModalTitle.textContent = solution.title;
  if (solutionModalLead) solutionModalLead.textContent = solution.lead;
  if (solutionModalTags) {
    solutionModalTags.innerHTML = '';
    solution.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.textContent = tag;
      solutionModalTags.appendChild(span);
    });
  }
  if (solutionModalResult) solutionModalResult.textContent = solution.result;
  const solutionModalCta = document.querySelector('[data-solution-modal-cta]');
  if (solutionModalCta) solutionModalCta.textContent = solution.cta || 'HABLEMOS DE TU PROYECTO';
  solution.sections.forEach((section, index) => {
    if (solutionModalHeadings[index]) solutionModalHeadings[index].textContent = section.heading;
    if (solutionModalCopies[index]) solutionModalCopies[index].textContent = section.copy;
  });
}

function openSolutionModal(key, trigger) {
  if (!solutionModal) return;
  lastSolutionTrigger = trigger || null;
  setSolutionModalContent(key);
  solutionModal.classList.add('is-open');
  solutionModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-solution-modal');
  requestAnimationFrame(() => {
    solutionModal.querySelector('[data-solution-modal-close]')?.focus({ preventScroll: true });
  });
}

function closeSolutionModal() {
  if (!solutionModal) return;
  if (showroomLightbox?.classList.contains('is-open')) closeShowroomLightbox();
  solutionModal.classList.remove('is-open');
  solutionModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-solution-modal');
  syncBodyScrollLock();
  if (lastSolutionTrigger) lastSolutionTrigger.focus({ preventScroll: true });
}

document.querySelectorAll('[data-solution-modal-open]').forEach((button) => {
  button.addEventListener('click', () => openSolutionModal(button.dataset.solutionModalOpen, button));
});

solutionModal?.querySelectorAll('[data-solution-modal-close]').forEach((button) => {
  button.addEventListener('click', closeSolutionModal);
});

solutionModalPanel?.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.querySelector('[data-solution-modal-cta]')?.addEventListener('click', () => {
  closeSolutionModal();
});

window.addEventListener('keydown', (event) => {
  if (showroomLightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape' && solutionModal?.classList.contains('is-open')) {
    closeSolutionModal();
  }
});


// Catalog flipbook viewer.
const catalogViewer = document.querySelector('[data-catalog-viewer]');
const catalogBook = document.querySelector('[data-catalog-book]');
const catalogCover = document.querySelector('[data-catalog-cover]');
const catalogCoverImage = document.querySelector('[data-catalog-cover-image]');
const catalogFlipbookMount = document.querySelector('[data-catalog-pageflip]');
const catalogFallbackSpread = document.querySelector('[data-catalog-spread]');
const catalogLeftPage = document.querySelector('[data-catalog-page-left]');
const catalogRightPage = document.querySelector('[data-catalog-page-right]');
const catalogStatus = document.querySelector('[data-catalog-status]');
const catalogPrevButtons = Array.from(document.querySelectorAll('[data-catalog-prev]'));
const catalogNextButtons = Array.from(document.querySelectorAll('[data-catalog-next]'));
const catalogTitle = document.querySelector('#catalog-viewer-title');
const catalogStage = document.querySelector('[data-catalog-stage]');
let lastCatalogTrigger = null;
let catalogCurrentIndex = 0;
let catalogIsAnimating = false;
let catalogPageFlip = null;
let catalogPageFlipLoading = false;
let catalogPageFlipScriptPromise = null;
let catalogUsingPageFlip = false;
let catalogIsCoverMode = false;
let catalogResizeTimer = null;

const catalogData = {
  'cg-coleccion-2026': {
    title: 'CG Colección 2026',
    pdf: 'assets/catalogs/cg-coleccion-2026/cg-coleccion-2026.pdf',
    pages: Array.from({ length: 60 }, (_, index) => `assets/catalogs/cg-coleccion-2026/pages/page-${String(index + 1).padStart(2, '0')}.jpg`)
  }
};
let activeCatalog = catalogData['cg-coleccion-2026'];

function isCatalogMobileView() {
  return window.matchMedia('(max-width: 760px)').matches;
}

function normalizeCatalogIndex(index) {
  const pageCount = activeCatalog.pages.length;
  if (catalogUsingPageFlip) return Math.max(0, Math.min(index, pageCount - 1));
  if (isCatalogMobileView()) return Math.max(0, Math.min(index, pageCount - 1));
  if (index <= 0) return 0;
  const spreadIndex = index % 2 === 0 ? index - 1 : index;
  return Math.max(0, Math.min(spreadIndex, pageCount - 1));
}

function setCatalogCoverView(enabled) {
  catalogIsCoverMode = Boolean(enabled) && !isCatalogMobileView();
  catalogBook?.classList.toggle('is-cover-view', catalogIsCoverMode);
  catalogBook?.classList.remove('is-cover-mode');
  catalogCover?.setAttribute('aria-hidden', 'true');
  if (catalogFallbackSpread) catalogFallbackSpread.setAttribute('aria-hidden', String(catalogUsingPageFlip));
}

function updateCatalogControls() {
  const pageCount = activeCatalog.pages.length;
  const atStart = catalogCurrentIndex <= 0;
  const atEnd = catalogCurrentIndex >= pageCount - 1;
  const nextDisabled = atEnd;

  catalogPrevButtons.forEach((button) => { button.disabled = atStart; });
  catalogNextButtons.forEach((button) => { button.disabled = nextDisabled; });
}

function updateCatalogStatus(pageIndex = catalogCurrentIndex) {
  if (!catalogStatus || !activeCatalog) return;
  const pageCount = activeCatalog.pages.length;
  const page = Math.max(0, Math.min(pageIndex, pageCount - 1));

  if (catalogUsingPageFlip || isCatalogMobileView() || page === 0 || page >= pageCount - 1) {
    catalogStatus.textContent = `Página ${page + 1} de ${pageCount}`;
    return;
  }

  const rightIndex = Math.min(page + 1, pageCount - 1);
  catalogStatus.textContent = `Páginas ${page + 1}-${rightIndex + 1} de ${pageCount}`;
}

function renderCatalogPages() {
  if (!catalogLeftPage || !catalogRightPage || !activeCatalog) return;
  if (catalogUsingPageFlip) {
    updateCatalogStatus();
    updateCatalogControls();
    return;
  }

  catalogCurrentIndex = normalizeCatalogIndex(catalogCurrentIndex);
  const pageCount = activeCatalog.pages.length;
  const mobile = isCatalogMobileView();
  const leftIndex = mobile ? catalogCurrentIndex : catalogCurrentIndex === 0 ? -1 : catalogCurrentIndex;
  const rightIndex = mobile ? catalogCurrentIndex : catalogCurrentIndex === 0 ? 0 : catalogCurrentIndex + 1;

  if (leftIndex >= 0 && activeCatalog.pages[leftIndex]) {
    catalogLeftPage.src = activeCatalog.pages[leftIndex];
    catalogLeftPage.alt = `${activeCatalog.title}, página ${leftIndex + 1}`;
  } else {
    catalogLeftPage.removeAttribute('src');
    catalogLeftPage.alt = '';
  }

  if (rightIndex >= 0 && activeCatalog.pages[rightIndex]) {
    catalogRightPage.src = activeCatalog.pages[rightIndex];
    catalogRightPage.alt = `${activeCatalog.title}, página ${rightIndex + 1}`;
  } else {
    catalogRightPage.removeAttribute('src');
    catalogRightPage.alt = '';
  }

  updateCatalogStatus();
  updateCatalogControls();
}

function preloadCatalogAround(index) {
  if (!activeCatalog) return;
  const candidates = [index - 2, index - 1, index, index + 1, index + 2, index + 3]
    .filter((pageIndex) => pageIndex >= 0 && pageIndex < activeCatalog.pages.length);
  candidates.forEach((pageIndex) => {
    const img = new Image();
    img.src = activeCatalog.pages[pageIndex];
  });
}

function loadCatalogPageFlipScript() {
  if (window.St?.PageFlip) return Promise.resolve(true);
  if (catalogPageFlipScriptPromise) return catalogPageFlipScriptPromise;

  catalogPageFlipScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.St?.PageFlip));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return catalogPageFlipScriptPromise;
}

function destroyCatalogPageFlip() {
  if (catalogPageFlip) {
    try { catalogPageFlip.destroy(); } catch (error) { /* no-op */ }
  }
  catalogPageFlip = null;
  catalogUsingPageFlip = false;
  catalogFlipbookMount?.replaceChildren();
  catalogViewer?.classList.remove('is-pageflip-ready');
}

function showStaticCatalogCover() {
  if (!activeCatalog) return;
  catalogCurrentIndex = 0;
  setCatalogCoverView(true);
  updateCatalogStatus(0);
  updateCatalogControls();
  preloadCatalogAround(0);
}

async function animateCatalogFromCover() {
  if (catalogPageFlipLoading) return;
  if (!catalogPageFlip) {
    const ready = await initCatalogPageFlip(0, true);
    if (!ready) return;
  }
  setCatalogCoverView(false);
  requestAnimationFrame(() => {
    try { catalogPageFlip?.flipNext(); } catch (error) { /* no-op */ }
  });
}

function getCatalogPageSize() {
  const stageRect = catalogStage?.getBoundingClientRect() || { width: 860, height: 620 };
  const panelPadding = isCatalogMobileView() ? 24 : 18;
  const ratio = 1.4142;
  const mobile = isCatalogMobileView();
  const availableWidth = Math.max(240, stageRect.width - panelPadding);
  const availableHeight = Math.max(320, stageRect.height - panelPadding);

  let pageWidth = mobile
    ? Math.min(420, availableWidth)
    : Math.min(390, (availableWidth - 12) / 2);
  let pageHeight = pageWidth * ratio;

  if (pageHeight > availableHeight) {
    pageHeight = availableHeight;
    pageWidth = pageHeight / ratio;
  }

  return {
    width: Math.max(220, Math.round(pageWidth)),
    height: Math.max(312, Math.round(pageHeight)),
    mobile
  };
}

async function initCatalogPageFlip(startPage = catalogCurrentIndex, forceFlipbook = false) {
  if (!catalogViewer?.classList.contains('is-open') || !catalogFlipbookMount || !activeCatalog) return false;
  if (catalogPageFlipLoading) return false;
  setCatalogCoverView(false);
  catalogPageFlipLoading = true;

  const hasLibrary = await loadCatalogPageFlipScript();
  catalogPageFlipLoading = false;
  if (!hasLibrary || !window.St?.PageFlip || !catalogViewer.classList.contains('is-open')) {
    catalogViewer?.classList.remove('is-pageflip-ready');
    catalogUsingPageFlip = false;
    renderCatalogPages();
    return false;
  }

  destroyCatalogPageFlip();

  const { width, height, mobile } = getCatalogPageSize();
  catalogCurrentIndex = Math.max(0, Math.min(startPage, activeCatalog.pages.length - 1));

  catalogBook?.style.setProperty('--catalog-single-page-width', `${width}px`);
  catalogBook?.style.setProperty('--catalog-single-page-height', `${height}px`);
  catalogFlipbookMount.style.width = mobile ? `${width}px` : `${width * 2}px`;
  catalogFlipbookMount.style.height = `${height}px`;

  catalogPageFlip = new window.St.PageFlip(catalogFlipbookMount, {
    width,
    height,
    size: 'fixed',
    minWidth: width,
    maxWidth: width,
    minHeight: height,
    maxHeight: height,
    showCover: true,
    usePortrait: mobile,
    drawShadow: true,
    flippingTime: 840,
    maxShadowOpacity: 0.34,
    startPage: catalogCurrentIndex,
    mobileScrollSupport: false,
    useMouseEvents: true,
    autoSize: false,
    clickEventForward: false,
    swipeDistance: 30,
    showPageCorners: true,
    disableFlipByClick: false
  });

  catalogPageFlip.loadFromImages(activeCatalog.pages);
  catalogPageFlip.on('flip', (event) => {
    catalogCurrentIndex = Number(event.data) || 0;
    const shouldShowCoverOnly = !isCatalogMobileView() && catalogCurrentIndex <= 0;
    window.setTimeout(() => {
      setCatalogCoverView(shouldShowCoverOnly);
      updateCatalogStatus(catalogCurrentIndex);
      updateCatalogControls();
      preloadCatalogAround(catalogCurrentIndex);
    }, shouldShowCoverOnly ? 60 : 0);
  });

  catalogUsingPageFlip = true;
  catalogViewer.classList.add('is-pageflip-ready');
  catalogFallbackSpread?.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    try { catalogPageFlip?.turnToPage(catalogCurrentIndex); } catch (error) { /* no-op */ }
    setCatalogCoverView(!isCatalogMobileView() && catalogCurrentIndex <= 0);
    updateCatalogStatus(catalogCurrentIndex);
    updateCatalogControls();
  }, 80);

  return true;
}

function playCatalogPageTurn(direction) {
  if (!catalogBook || !activeCatalog) return;

  const mobile = isCatalogMobileView();
  const pageCount = activeCatalog.pages.length;
  let turningIndex;

  if (mobile) {
    turningIndex = catalogCurrentIndex;
  } else if (direction > 0) {
    turningIndex = catalogCurrentIndex === 0 ? 0 : Math.min(catalogCurrentIndex + 1, pageCount - 1);
  } else {
    turningIndex = catalogCurrentIndex;
  }

  const pageSrc = activeCatalog.pages[turningIndex];
  if (!pageSrc) return;

  let backIndex;
  if (mobile) {
    backIndex = normalizeCatalogIndex(catalogCurrentIndex + direction);
  } else if (direction > 0) {
    backIndex = catalogCurrentIndex === 0 ? 1 : Math.min(catalogCurrentIndex + 2, pageCount - 1);
  } else {
    backIndex = Math.max(catalogCurrentIndex - 1, 0);
  }
  const backPageSrc = activeCatalog.pages[backIndex] || pageSrc;

  catalogBook.querySelectorAll('.catalog-page-turner').forEach((node) => node.remove());

  const turner = document.createElement('div');
  turner.className = `catalog-page-turner ${direction > 0 ? 'catalog-page-turner--next' : 'catalog-page-turner--prev'}`;

  const frontFace = document.createElement('div');
  frontFace.className = 'catalog-page-turner__face catalog-page-turner__face--front';
  const frontImg = document.createElement('img');
  frontImg.src = pageSrc;
  frontImg.alt = '';
  frontFace.appendChild(frontImg);

  const backFace = document.createElement('div');
  backFace.className = 'catalog-page-turner__face catalog-page-turner__face--back';
  const backImg = document.createElement('img');
  backImg.src = backPageSrc;
  backImg.alt = '';
  backFace.appendChild(backImg);

  turner.appendChild(frontFace);
  turner.appendChild(backFace);

  const spread = catalogBook.querySelector('[data-catalog-spread]');
  spread?.appendChild(turner);

  window.setTimeout(() => {
    turner.remove();
  }, 780);
}

function turnCatalog(direction) {
  if (!activeCatalog) return;

  if (catalogIsCoverMode) {
    if (direction > 0) animateCatalogFromCover();
    return;
  }

  if (catalogUsingPageFlip && catalogPageFlip) {
    if (direction > 0) catalogPageFlip.flipNext();
    else catalogPageFlip.flipPrev();
    return;
  }

  if (catalogIsAnimating) return;

  const step = isCatalogMobileView() ? 1 : 2;
  const nextIndex = normalizeCatalogIndex(catalogCurrentIndex + direction * step);
  if (nextIndex === catalogCurrentIndex) return;

  catalogIsAnimating = true;
  playCatalogPageTurn(direction);

  window.setTimeout(() => {
    catalogCurrentIndex = nextIndex;
    renderCatalogPages();
    preloadCatalogAround(catalogCurrentIndex);
  }, 560);

  window.setTimeout(() => {
    catalogBook?.querySelectorAll('.catalog-page-turner').forEach((node) => node.remove());
    catalogIsAnimating = false;
  }, 780);
}

function openCatalogViewer(catalogId, trigger) {
  if (!catalogViewer) return;
  activeCatalog = catalogData[catalogId] || catalogData['cg-coleccion-2026'];
  lastCatalogTrigger = trigger || null;
  catalogCurrentIndex = 0;
  destroyCatalogPageFlip();
  setCatalogCoverView(false);
  if (catalogTitle) catalogTitle.textContent = activeCatalog.title;
  renderCatalogPages();
  preloadCatalogAround(0);
  catalogViewer.classList.add('is-open');
  catalogViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-catalog-viewer');
  requestAnimationFrame(() => {
    catalogViewer.querySelector('[data-catalog-close]')?.focus({ preventScroll: true });
    initCatalogPageFlip(0, true);
  });
}

function closeCatalogViewer() {
  if (!catalogViewer) return;
  destroyCatalogPageFlip();
  setCatalogCoverView(false);
  catalogViewer.classList.remove('is-open');
  catalogViewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-catalog-viewer');
  if (lastCatalogTrigger) lastCatalogTrigger.focus({ preventScroll: true });
}

document.querySelectorAll('[data-catalog-open]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openCatalogViewer(trigger.dataset.catalogOpen, trigger);
  });
});

catalogViewer?.querySelectorAll('[data-catalog-close]').forEach((button) => {
  button.addEventListener('click', closeCatalogViewer);
});

catalogPrevButtons.forEach((button) => button.addEventListener('click', () => turnCatalog(-1)));
catalogNextButtons.forEach((button) => button.addEventListener('click', () => turnCatalog(1)));

window.addEventListener('keydown', (event) => {
  if (!catalogViewer?.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeCatalogViewer();
  if (event.key === 'ArrowLeft') turnCatalog(-1);
  if (event.key === 'ArrowRight') turnCatalog(1);
});

let catalogTouchStartX = null;
catalogStage?.addEventListener('touchstart', (event) => {
  if (catalogUsingPageFlip) return;
  catalogTouchStartX = event.touches[0]?.clientX ?? null;
}, { passive: true });

catalogStage?.addEventListener('touchend', (event) => {
  if (catalogUsingPageFlip) return;
  if (catalogTouchStartX === null) return;
  const endX = event.changedTouches[0]?.clientX ?? catalogTouchStartX;
  const delta = endX - catalogTouchStartX;
  if (Math.abs(delta) > 42) turnCatalog(delta < 0 ? 1 : -1);
  catalogTouchStartX = null;
}, { passive: true });

window.addEventListener('resize', () => {
  if (!catalogViewer?.classList.contains('is-open')) return;
  window.clearTimeout(catalogResizeTimer);
  catalogResizeTimer = window.setTimeout(() => {
    const current = catalogCurrentIndex;
    if (catalogUsingPageFlip || catalogIsCoverMode) {
      initCatalogPageFlip(current, true);
    } else {
      renderCatalogPages();
    }
  }, 180);
});
