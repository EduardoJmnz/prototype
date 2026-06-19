
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


const revealElements = document.querySelectorAll('.reveal-on-scroll');

if ('IntersectionObserver' in window && revealElements.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.24,
    rootMargin: '-12% 0px -18% 0px'
  });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}
