const hero = document.querySelector('.hero');
const heroButton = document.querySelector('.hero__button');
const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('#site-menu');
const menuLinks = document.querySelectorAll('.site-menu a');
const menuCloseButtons = document.querySelectorAll('.site-menu__close');
const scrollSections = document.querySelectorAll('.scroll-section');

let heroIntroLocked = true;
let ticking = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = (value) => value < 0.5
  ? 4 * value * value * value
  : 1 - Math.pow(-2 * value + 2, 3) / 2;

const updateNavbarState = () => {
  const isScrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 18;
  document.body.classList.toggle('is-scrolled', isScrolled);
};

const getMotionTargets = (section) => {
  if (section.classList.contains('hero')) {
    return [
      section.querySelector('.hero__background'),
      section.querySelector('.hero__content'),
    ].filter(Boolean);
  }

  const target = section.querySelector('.section-motion-content');
  return target ? [target] : [section];
};

const applyMotion = (target, opacity, y) => {
  const cleanOpacity = clamp(opacity, 0, 1);
  target.style.setProperty('opacity', cleanOpacity.toFixed(3), 'important');
  target.style.setProperty('transform', `translate3d(0, ${y.toFixed(1)}px, 0)`, 'important');
  target.style.setProperty('pointer-events', cleanOpacity > 0.14 ? 'auto' : 'none', 'important');
};

const updateSectionMotion = () => {
  const vh = window.innerHeight || document.documentElement.clientHeight;

  scrollSections.forEach((section) => {
    if (section.classList.contains('hero') && heroIntroLocked && window.scrollY < 12) return;

    const rect = section.getBoundingClientRect();
    let opacity = 1;
    let y = 0;

    if (rect.top >= vh) {
      opacity = 0;
      y = 76;
    } else if (rect.top > 0) {
      const enterStart = vh * 0.95;
      const enterEnd = vh * 0.20;
      const progress = clamp((enterStart - rect.top) / (enterStart - enterEnd), 0, 1);
      const eased = easeOutCubic(progress);
      opacity = eased;
      y = 76 * (1 - eased);
    } else if (rect.bottom > 0) {
      // Salida progresiva. El hero debe irse antes para que no se vea dentro del bloque de Productos.
      const passed = -rect.top;
      const isHero = section.classList.contains('hero');
      const exitStart = vh * (isHero ? 0.08 : 0.34);
      const exitEnd = vh * (isHero ? 0.58 : 0.96);
      const progress = clamp((passed - exitStart) / (exitEnd - exitStart), 0, 1);
      const eased = easeInOutCubic(progress);
      opacity = 1 - eased;
      y = (isHero ? -190 : -128) * eased;
    } else {
      opacity = 0;
      y = -128;
    }

    getMotionTargets(section).forEach((target) => applyMotion(target, opacity, y));
  });
};

const requestMotionUpdate = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateNavbarState();
    updateSectionMotion();
    ticking = false;
  });
};

const closeMenu = () => {
  document.body.classList.remove('menu-open');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  if (siteMenu) siteMenu.setAttribute('aria-hidden', 'true');
};

const openMenu = () => {
  document.body.classList.add('menu-open');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
  if (siteMenu) siteMenu.setAttribute('aria-hidden', 'false');
};

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
  });
}

menuLinks.forEach((link) => link.addEventListener('click', closeMenu));
menuCloseButtons.forEach((button) => button.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

if (heroButton) {
  heroButton.addEventListener('click', (event) => {
    const target = document.querySelector(heroButton.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

window.addEventListener('load', () => {
  if (hero) hero.classList.add('is-visible');
  updateNavbarState();
  updateSectionMotion();
  window.setTimeout(() => {
    heroIntroLocked = false;
    updateSectionMotion();
  }, 2100);
});

window.addEventListener('scroll', requestMotionUpdate, { passive: true });
window.addEventListener('resize', requestMotionUpdate);
updateNavbarState();
requestAnimationFrame(updateSectionMotion);

// Lifestyle carousel: desktop infinite loop + edge-hover auto-scroll, vertical gallery on mobile
const lifestyleTracks = document.querySelectorAll('.lifestyle__track');
lifestyleTracks.forEach((track) => {
  const section = track.closest('.lifestyle');
  const carousel = track.closest('.lifestyle__carousel');
  const originalItems = Array.from(track.children);
  if (!section || !carousel || !originalItems.length) return;

  if (!track.dataset.loopCloned) {
    for (let copy = 0; copy < 2; copy += 1) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('is-loop-clone');
        track.appendChild(clone);
      });
    }
    track.dataset.loopCloned = 'true';
  }

  const isMobileGallery = () => window.matchMedia('(max-width: 700px)').matches;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let edgeSpeed = 0;
  let rafId = null;

  const getLoopWidth = () => Math.max(1, track.scrollWidth / 3);

  const setLoopStart = () => {
    if (isMobileGallery()) return;
    const loopWidth = getLoopWidth();
    if (!track.dataset.loopReady || track.scrollLeft < 4) {
      track.scrollLeft = loopWidth;
      track.dataset.loopReady = 'true';
    }
  };

  const normalizeLoop = () => {
    if (isMobileGallery()) return;
    const loopWidth = getLoopWidth();
    if (track.scrollLeft >= loopWidth * 2) {
      track.scrollLeft -= loopWidth;
    } else if (track.scrollLeft <= 2) {
      track.scrollLeft += loopWidth;
    }
  };

  const sectionIsActive = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.9 && rect.bottom > vh * 0.1;
  };

  const stopEdgeScroll = () => {
    edgeSpeed = 0;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const edgeTick = () => {
    if (!edgeSpeed || isDown || isMobileGallery() || !sectionIsActive()) {
      rafId = null;
      return;
    }

    track.scrollLeft += edgeSpeed;
    normalizeLoop();
    rafId = requestAnimationFrame(edgeTick);
  };

  const startEdgeScroll = () => {
    if (!rafId && edgeSpeed) rafId = requestAnimationFrame(edgeTick);
  };

  const updateEdgeSpeed = (event) => {
    if (isDown || isMobileGallery() || !sectionIsActive()) {
      stopEdgeScroll();
      return;
    }

    const rect = carousel.getBoundingClientRect();
    const yInside = event.clientY >= rect.top && event.clientY <= rect.bottom;
    const xInside = event.clientX >= rect.left && event.clientX <= rect.right;
    if (!xInside || !yInside) {
      stopEdgeScroll();
      return;
    }

    const edgeZone = Math.min(220, Math.max(90, rect.width * 0.24));
    const maxSpeed = 8.5;

    if (event.clientX >= rect.right - edgeZone) {
      const progress = (event.clientX - (rect.right - edgeZone)) / edgeZone;
      edgeSpeed = maxSpeed * Math.max(0.18, progress);
      startEdgeScroll();
    } else if (event.clientX <= rect.left + edgeZone) {
      const progress = ((rect.left + edgeZone) - event.clientX) / edgeZone;
      edgeSpeed = -maxSpeed * Math.max(0.18, progress);
      startEdgeScroll();
    } else {
      stopEdgeScroll();
    }
  };

  const stopDrag = () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    normalizeLoop();
  };

  track.addEventListener('pointerdown', (event) => {
    if (isMobileGallery()) return;
    setLoopStart();
    isDown = true;
    stopEdgeScroll();
    track.classList.add('is-dragging');
    startX = event.pageX;
    scrollStart = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', (event) => {
    if (isMobileGallery() || !isDown) return;
    const walk = (event.pageX - startX) * 1.08;
    track.scrollLeft = scrollStart - walk;
    normalizeLoop();
  });

  carousel.addEventListener('pointerenter', (event) => {
    setLoopStart();
    updateEdgeSpeed(event);
  }, { passive: true });
  carousel.addEventListener('pointermove', updateEdgeSpeed, { passive: true });
  carousel.addEventListener('pointerleave', stopEdgeScroll);

  track.addEventListener('pointerup', stopDrag);
  track.addEventListener('pointercancel', stopDrag);
  track.addEventListener('scroll', normalizeLoop, { passive: true });

  window.addEventListener('blur', stopEdgeScroll);
  window.addEventListener('scroll', () => {
    if (!sectionIsActive()) stopEdgeScroll();
  }, { passive: true });
  window.addEventListener('resize', () => {
    stopEdgeScroll();
    if (isMobileGallery()) {
      track.dataset.loopReady = '';
      return;
    }
    requestAnimationFrame(() => {
      setLoopStart();
      normalizeLoop();
    });
  });

  requestAnimationFrame(setLoopStart);
});


// Products listing page filters
const productFilterButtons = document.querySelectorAll('.products-filter__item');
const productCards = document.querySelectorAll('.product-card');
const normalizeFilter = (value) => {
  const clean = (value || 'todo').toLowerCase().trim();
  if (clean === 'all') return 'todo';
  if (clean === 'sofas' || clean === 'sofás') return 'sofas';
  if (clean === 'decoración') return 'decoracion';
  if (clean === 'iluminación') return 'iluminacion';
  return clean;
};

const applyProductFilter = (filter, updateUrl = true) => {
  if (!productFilterButtons.length || !productCards.length) return;
  const activeFilter = normalizeFilter(filter);

  productFilterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === activeFilter);
  });

  productCards.forEach((card) => {
    const show = activeFilter === 'todo' || card.dataset.category === activeFilter;
    card.classList.toggle('is-hidden', !show);
  });

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('filter', activeFilter);
    window.history.replaceState({}, '', url);
  }
};

if (productFilterButtons.length && productCards.length) {
  const params = new URLSearchParams(window.location.search);
  const initialFilter = normalizeFilter(params.get('filter') || params.get('category') || 'todo');
  applyProductFilter(initialFilter, false);

  productFilterButtons.forEach((button) => {
    button.addEventListener('click', () => applyProductFilter(button.dataset.filter));
  });
}

// Product detail page data
const productDetailRoot = document.querySelector('.product-detail');
if (productDetailRoot) {
  const productData = {
    'poltrona-model': {
      title: 'HT-12',
      category: 'Poltronas',
      filter: 'poltronas',
      description: 'Poltrona de líneas limpias con estructura metálica y tapizado cálido. Una pieza diseñada para aportar carácter, confort y presencia editorial dentro de salas, recámaras o espacios de lectura.',
      materials: 'Madera maciza, estructura metálica y PU',
      measures: '41 cm (ancho) × 49 cm (profundidad) × 78 cm (alto)',
      price: '$22,000.00',
      stock: '2 Disponibles',
      ctaLabel: 'Comprar',
      images: [
        'assets/product-poltrona-gallery-1.webp',
        'assets/product-poltrona-gallery-2.webp',
        'assets/product-poltrona-gallery-3.webp',
        'assets/product-poltrona-gallery-4.webp',
        'assets/product-poltrona-gallery-5.webp',
        'assets/product-poltrona-gallery-6.webp'
      ]
    },
    'silla-tapizada': {
      title: 'Model',
      category: 'Sillas',
      filter: 'sillas',
      description: 'Silla tapizada de perfil contemporáneo, pensada para comedores residenciales, hospitality y espacios donde el confort debe convivir con una estética sobria y atemporal.',
      materials: 'Estructura metálica, tapizado suave y PU',
      measures: '48 cm (ancho) × 55 cm (profundidad) × 84 cm (alto)',
      images: [
        'assets/category-sillas.webp',
        'assets/category-sillas.webp',
        'assets/category-sillas.webp',
        'assets/lifestyle-dining-chair.webp',
        'assets/lifestyle-dining-chair.webp',
        'assets/lifestyle-dining-chair.webp'
      ]
    },
    'mesa-lateral': {
      title: 'Model',
      category: 'Mesas',
      filter: 'mesas',
      description: 'Mesa lateral con base metálica y cubierta de acabado pétreo. Un acento escultórico que suma textura, contraste y funcionalidad al espacio.',
      materials: 'Metal con acabado dorado y cubierta tipo mármol',
      measures: '45 cm (diámetro) × 55 cm (alto)',
      images: [
        'assets/category-mesas.webp',
        'assets/category-mesas.webp',
        'assets/category-mesas.webp',
        'assets/lifestyle-side-table.webp',
        'assets/lifestyle-side-table.webp',
        'assets/lifestyle-side-table.webp'
      ]
    },
    'sofa-cafe': {
      title: 'Model',
      category: 'Sofás',
      filter: 'sofas',
      description: 'Sofá de piel en tono café, con volumen generoso y lenguaje arquitectónico. Ideal para crear una sala cálida, premium y contemporánea.',
      materials: 'Estructura de madera, espuma de alta densidad y tapizado PU',
      measures: '220 cm (ancho) × 96 cm (profundidad) × 74 cm (alto)',
      images: [
        'assets/category-sofas.webp',
        'assets/category-sofas.webp',
        'assets/category-sofas.webp',
        'assets/lifestyle-sofa.webp',
        'assets/lifestyle-sofa.webp',
        'assets/lifestyle-sofa.webp'
      ]
    },
    'arte-tonos-calidos': {
      title: 'Model',
      category: 'Decoración',
      filter: 'decoracion',
      description: 'Pieza decorativa en tonos cálidos, ideal para complementar composiciones residenciales y elevar la atmósfera visual del proyecto.',
      materials: 'Lámina decorativa, marco ligero y cristal',
      measures: '60 cm (ancho) × 80 cm (alto)',
      images: [
        'assets/category-decoracion.webp',
        'assets/category-decoracion.webp',
        'assets/category-decoracion.webp',
        'assets/lifestyle-sofa.webp',
        'assets/lifestyle-side-table.webp',
        'assets/lifestyle-reading-chair.webp'
      ]
    }
  };

  const params = new URLSearchParams(window.location.search);
  const productKey = params.get('product') || params.get('id') || 'poltrona-model';
  const product = productData[productKey] || productData['poltrona-model'];

  const titleNodes = document.querySelectorAll('[data-product-title]');
  const descNode = document.querySelector('[data-product-description]');
  const materialsNode = document.querySelector('[data-product-materials]');
  const measuresNode = document.querySelector('[data-product-measures]');
  const categoryLink = document.querySelector('[data-product-category-link]');
  const crumbName = document.querySelector('[data-product-breadcrumb-name]');
  const quoteLink = document.querySelector('[data-product-quote]');
  const priceBlock = document.querySelector('[data-product-price-block]');
  const priceNode = document.querySelector('[data-product-price]');
  const stockNode = document.querySelector('[data-product-stock]');

  titleNodes.forEach((node) => { node.textContent = product.title; });
  if (descNode) descNode.textContent = product.description;
  if (materialsNode) materialsNode.textContent = product.materials;
  if (measuresNode) measuresNode.textContent = product.measures;
  if (categoryLink) {
    categoryLink.textContent = product.category;
    categoryLink.href = `productos.html?filter=${product.filter}`;
  }
  if (crumbName) crumbName.textContent = product.title;
  if (priceBlock && priceNode) {
    const hasPrice = Boolean(product.price);
    document.querySelector('[data-mobile-product-sheet]')?.classList.toggle('has-product-price', hasPrice);
    priceBlock.hidden = !hasPrice;
    priceBlock.classList.toggle('is-visible', hasPrice);
    priceNode.textContent = product.price || '';
    if (stockNode) {
      stockNode.textContent = product.stock || '';
      stockNode.hidden = !product.stock;
    }
  }

  if (quoteLink) {
    const actionLabel = product.ctaLabel || (product.price ? 'Comprar' : 'Cotizar');
    quoteLink.textContent = actionLabel;
    const message = encodeURIComponent(product.price
      ? `Hola, me interesa comprar el producto ${product.title} de Casa Glick. Precio: ${product.price}.`
      : `Hola, me interesa cotizar el producto ${product.title} de Casa Glick.`);
    quoteLink.href = `https://wa.me/?text=${message}`;
  }

  document.querySelectorAll('[data-product-image]').forEach((img) => {
    const index = Number(img.dataset.productImage || 0);
    const nextSrc = product.images[index] || product.images[0];
    img.src = nextSrc;
    img.alt = `${product.title} Casa Glick`;
  });
}

const productSwatches = document.querySelectorAll('.product-swatch');
productSwatches.forEach((swatch) => {
  swatch.addEventListener('click', () => {
    productSwatches.forEach((item) => item.classList.remove('is-active'));
    swatch.classList.add('is-active');
  });
});

// Mobile product detail bottom sheet
const mobileProductSheet = document.querySelector('[data-mobile-product-sheet]');
if (mobileProductSheet) {
  const isProductMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const isProductLightboxOpen = () => document.body.classList.contains('has-product-lightbox');
  const mobileTabs = mobileProductSheet.querySelectorAll('.product-mobile-tab');
  const sheetToggle = mobileProductSheet.querySelector('[data-product-sheet-toggle]');
  let lastScrollY = window.scrollY || 0;
  let touchStartY = 0;
  let ignoreUntil = 0;

  // v17: on mobile the sheet must be a direct child of body.
  // This prevents fixed positioning from being trapped at the bottom of the gallery/layout flow.
  const originalSheetParent = mobileProductSheet.parentNode;
  const originalSheetNext = mobileProductSheet.nextSibling;
  const sheetPlaceholder = document.createComment('mobile product sheet placeholder');
  originalSheetParent.insertBefore(sheetPlaceholder, mobileProductSheet);

  const syncSheetMount = () => {
    if (isProductMobile()) {
      if (mobileProductSheet.parentNode !== document.body) {
        document.body.appendChild(mobileProductSheet);
      }
    } else if (mobileProductSheet.parentNode === document.body) {
      if (originalSheetNext && originalSheetNext.parentNode === originalSheetParent) {
        originalSheetParent.insertBefore(mobileProductSheet, originalSheetNext);
      } else {
        originalSheetParent.insertBefore(mobileProductSheet, sheetPlaceholder.nextSibling);
      }
    }
  };

  const setSheetState = (state) => {
    syncSheetMount();
    if (!isProductMobile()) {
      mobileProductSheet.classList.remove('is-peeking', 'is-expanded', 'is-hidden-mobile-sheet');
      return;
    }

    mobileProductSheet.classList.remove('is-peeking', 'is-expanded', 'is-hidden-mobile-sheet');

    if (state === 'expanded') {
      mobileProductSheet.classList.add('is-peeking', 'is-expanded');
      if (sheetToggle) sheetToggle.setAttribute('aria-label', 'Minimizar información del producto');
      return;
    }

    if (state === 'hidden') {
      mobileProductSheet.classList.add('is-hidden-mobile-sheet');
      if (sheetToggle) sheetToggle.setAttribute('aria-label', 'Expandir información del producto');
      return;
    }

    mobileProductSheet.classList.add('is-peeking');
    if (sheetToggle) sheetToggle.setAttribute('aria-label', 'Expandir información del producto');
  };

  mobileProductSheet.dataset.activeTab = mobileProductSheet.dataset.activeTab || 'description';

  if (sheetToggle) {
    sheetToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isProductMobile()) return;
      if (mobileProductSheet.classList.contains('is-expanded')) {
        setSheetState('peek');
      } else {
        setSheetState('expanded');
      }
      ignoreUntil = Date.now() + 520;
    });
  }

  mobileTabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.stopPropagation();
      mobileTabs.forEach((item) => item.classList.remove('is-active'));
      tab.classList.add('is-active');
      mobileProductSheet.dataset.activeTab = tab.dataset.productTab || 'description';
      setSheetState('peek');
      ignoreUntil = Date.now() + 380;
    });
  });

  window.addEventListener('wheel', (event) => {
    if (!isProductMobile() || isProductLightboxOpen() || Date.now() < ignoreUntil || mobileProductSheet.classList.contains('is-expanded')) return;
    if (event.deltaY > 6) setSheetState('hidden');
    if (event.deltaY < -6) setSheetState('peek');
  }, { passive: true });

  window.addEventListener('touchstart', (event) => {
    if (!isProductMobile() || isProductLightboxOpen()) return;
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (!isProductMobile() || isProductLightboxOpen() || Date.now() < ignoreUntil || mobileProductSheet.classList.contains('is-expanded')) return;
    const currentY = event.touches[0]?.clientY || touchStartY;
    const delta = touchStartY - currentY;
    if (delta > 18) setSheetState('hidden');
    if (delta < -18) setSheetState('peek');
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (!isProductMobile() || isProductLightboxOpen() || Date.now() < ignoreUntil || mobileProductSheet.classList.contains('is-expanded')) return;
    const current = window.scrollY || 0;
    const diff = current - lastScrollY;
    lastScrollY = current;
    if (diff > 8) setSheetState('hidden');
    if (diff < -8) setSheetState('peek');
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSheetState('peek');
  });

  const showInitialMobileSheet = () => {
    if (isProductMobile()) {
      setSheetState('peek');
      lastScrollY = window.scrollY || 0;
    } else {
      setSheetState('hidden');
    }
  };

  window.addEventListener('resize', () => {
    syncSheetMount();
    showInitialMobileSheet();
  });
  syncSheetMount();
  showInitialMobileSheet();

  // Force the intended initial mobile state after layout and images settle.
  window.setTimeout(() => {
    syncSheetMount();
    if (isProductMobile()) setSheetState('peek');
  }, 60);
  window.requestAnimationFrame(showInitialMobileSheet);
  window.addEventListener('load', showInitialMobileSheet, { once: true });
}

// v27: smooth page transitions between landing, products and product detail pages
(() => {
  const transitionLinks = document.querySelectorAll('a[href^="productos.html"], a[href^="producto.html"]');
  transitionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || link.target || href.startsWith('#') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.add('is-page-leaving');
      window.setTimeout(() => {
        window.location.href = href;
      }, 360);
    });
  });
})();

// v28: product gallery lightbox with gallery navigation
(() => {
  const galleryImages = Array.from(document.querySelectorAll('.product-gallery [data-product-image]'));
  if (!galleryImages.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'product-image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Imagen ampliada del producto');
  lightbox.innerHTML = `
    <button class="product-image-lightbox__close" type="button" aria-label="Cerrar imagen ampliada"></button>
    <button class="product-image-lightbox__nav product-image-lightbox__nav--prev" type="button" aria-label="Imagen anterior">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5 L8 12 L15 19" /></svg>
    </button>
    <img class="product-image-lightbox__image" alt="Imagen ampliada del producto" />
    <button class="product-image-lightbox__nav product-image-lightbox__nav--next" type="button" aria-label="Siguiente imagen">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5 L16 12 L9 19" /></svg>
    </button>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.product-image-lightbox__image');
  const closeButton = lightbox.querySelector('.product-image-lightbox__close');
  const prevButton = lightbox.querySelector('.product-image-lightbox__nav--prev');
  const nextButton = lightbox.querySelector('.product-image-lightbox__nav--next');
  let lastFocusedImage = null;
  let activeIndex = 0;
  let touchStartX = 0;
  let lastImageTapAt = 0;

  const setLightboxZoom = (isZoomed) => {
    lightbox.classList.toggle('is-zoomed', Boolean(isZoomed));
    lightboxImage?.setAttribute('aria-label', isZoomed ? 'Doble click para reducir imagen' : 'Doble click para ampliar imagen');
  };

  const toggleLightboxZoom = () => {
    setLightboxZoom(!lightbox.classList.contains('is-zoomed'));
  };

  const setLightboxImage = (index) => {
    if (!lightboxImage) return;
    activeIndex = (index + galleryImages.length) % galleryImages.length;
    const image = galleryImages[activeIndex];
    setLightboxZoom(false);
    lightboxImage.classList.remove('is-loaded');
    window.setTimeout(() => {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || 'Imagen ampliada del producto';
      lightboxImage.classList.add('is-loaded');
    }, 90);
  };

  const goToImage = (direction) => {
    setLightboxImage(activeIndex + direction);
  };

  const openLightbox = (image) => {
    if (!image || !lightboxImage) return;
    lastFocusedImage = image;
    const index = galleryImages.indexOf(image);
    setLightboxImage(index >= 0 ? index : 0);
    document.body.classList.add('has-product-lightbox');
    setLightboxZoom(false);
    lightbox.classList.add('is-open');
    window.setTimeout(() => closeButton?.focus(), 80);
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    setLightboxZoom(false);
    document.body.classList.remove('has-product-lightbox');
    window.setTimeout(() => {
      if (!lightbox.classList.contains('is-open') && lightboxImage) {
        lightboxImage.removeAttribute('src');
        lightboxImage.classList.remove('is-loaded');
      }
      if (lastFocusedImage) lastFocusedImage.focus?.();
    }, 560);
  };

  galleryImages.forEach((image) => {
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `${image.alt || 'Imagen de producto'} ampliada`);
    image.addEventListener('click', () => openLightbox(image));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  prevButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    goToImage(-1);
  });
  nextButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    goToImage(1);
  });

  lightboxImage?.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  lightboxImage?.addEventListener('dblclick', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleLightboxZoom();
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });

  lightbox.addEventListener('touchmove', (event) => {
    event.stopPropagation();
  }, { passive: true });

  lightbox.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || touchStartX;
    const deltaX = touchStartX - endX;
    if (Math.abs(deltaX) > 45) {
      goToImage(deltaX > 0 ? 1 : -1);
      return;
    }

    if (event.target === lightboxImage) {
      const now = Date.now();
      if (now - lastImageTapAt < 320) {
        toggleLightboxZoom();
        lastImageTapAt = 0;
      } else {
        lastImageTapAt = now;
      }
    }
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') goToImage(-1);
    if (event.key === 'ArrowRight') goToImage(1);
  });
})();

// v51: restore page state when returning with browser Back / bfcache
(() => {
  const resetPageTransition = () => {
    document.body.classList.remove('is-page-leaving');
    document.documentElement.classList.remove('is-page-leaving');
  };

  resetPageTransition();
  window.addEventListener('pageshow', resetPageTransition);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resetPageTransition();
  });
})();
