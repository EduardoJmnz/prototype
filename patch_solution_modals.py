from pathlib import Path
p=Path('/mnt/data/cg_solution_modals/index.html')
s=p.read_text()
s=s.replace('<a class="solution-link" href="#proyectos">Ver proyectos <span aria-hidden="true">→</span></a>', '<button class="solution-link solution-open" type="button" data-solution-modal-open="hospitality">Conocer solución <span aria-hidden="true">→</span></button>', 1)
s=s.replace('<a class="solution-link" href="#proyectos">Ver proyectos <span aria-hidden="true">→</span></a>', '<button class="solution-link solution-open" type="button" data-solution-modal-open="residencial">Conocer solución <span aria-hidden="true">→</span></button>', 1)
modal='''\n\n  <div class="project-modal solution-modal" data-solution-modal aria-hidden="true">
    <div class="project-modal__backdrop" data-solution-modal-close></div>
    <article class="project-modal__panel solution-modal__panel" role="dialog" aria-modal="true" aria-labelledby="solution-modal-title">
      <button class="project-modal__close" type="button" aria-label="Cerrar" data-solution-modal-close>×</button>

      <section class="about-modal__layout solution-modal__layout">
        <aside class="about-modal__intro-panel solution-modal__intro-panel">
          <p class="project-modal__eyebrow about-modal__eyebrow" data-solution-modal-type></p>
          <span class="project-modal__rule about-modal__rule" aria-hidden="true"></span>
          <h2 id="solution-modal-title" class="about-modal__title" data-solution-modal-title></h2>
          <p class="about-modal__lead" data-solution-modal-lead></p>
          <div class="about-modal__summary" data-solution-modal-tags aria-label="Especialidades de la solución"></div>
          <a class="btn btn-primary about-modal__cta solution-modal__cta" href="#contacto" data-solution-modal-cta>Hablemos de tu proyecto</a>
        </aside>

        <div class="about-modal__content solution-modal__content" aria-label="Detalle de la solución">
          <article class="about-modal__item">
            <span class="about-modal__number">01</span>
            <div>
              <h3 data-solution-modal-heading-one></h3>
              <p data-solution-modal-copy-one></p>
            </div>
          </article>
          <article class="about-modal__item">
            <span class="about-modal__number">02</span>
            <div>
              <h3 data-solution-modal-heading-two></h3>
              <p data-solution-modal-copy-two></p>
            </div>
          </article>
          <article class="about-modal__item">
            <span class="about-modal__number">03</span>
            <div>
              <h3 data-solution-modal-heading-three></h3>
              <p data-solution-modal-copy-three></p>
            </div>
          </article>
          <figure class="solution-modal__image-wrap">
            <img data-solution-modal-image src="assets/images/solution-residencial.webp" alt="">
          </figure>
        </div>
      </section>
    </article>
  </div>
'''
insert_before='\n  <div class="project-modal sector-modal" data-sector-modal aria-hidden="true">'
if modal.strip() not in s:
    s=s.replace(insert_before, modal+insert_before)
p.write_text(s)
