const brandPages = {
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
    ],
    values: [
      ['Diseño residencial', 'Piezas y ambientes pensados para elevar la vida cotidiana.'],
      ['Curaduría de interiores', 'Mobiliario, decoración y acabados bajo una misma sensibilidad estética.'],
      ['Calidez atemporal', 'Materiales, texturas y proporciones que permanecen vigentes.'],
      ['Ambientes completos', 'Soluciones que conectan sala, comedor, recámaras y áreas sociales.']
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
    ],
    values: [
      ['Precisión alemana', 'Sistemas diseñados para una ejecución exacta y confiable.'],
      ['Diseño funcional', 'Cocinas pensadas para simplificar el uso diario sin perder elegancia.'],
      ['Materiales premium', 'Acabados resistentes, sobrios y adaptables a cada proyecto.'],
      ['Personalización', 'Soluciones configuradas a la medida del espacio y estilo de vida.']
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
    ],
    values: [
      ['Superficies', 'Materiales de alto desempeño para cocinas, baños y áreas sociales.'],
      ['Acabados premium', 'Texturas, tonos y formatos que aportan carácter al espacio.'],
      ['Resistencia', 'Soluciones pensadas para uso continuo y mantenimiento eficiente.'],
      ['Versatilidad', 'Aplicaciones para proyectos residenciales, comerciales y hoteleros.']
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
    ],
    values: [
      ['Fabricación a medida', 'Piezas desarrolladas específicamente para cada proyecto.'],
      ['Carpintería integral', 'Panelados, closets, recámaras y mobiliario coordinado.'],
      ['Control de calidad', 'Procesos de manufactura supervisados desde el diseño hasta la entrega.'],
      ['Ejecución precisa', 'Soluciones funcionales con acabados consistentes y durables.']
    ]
  }
};

const params = new URLSearchParams(window.location.search);
const key = params.get('brand') || 'hacker';
const brand = brandPages[key] || brandPages.hacker;

document.title = `Casa Glick | ${brand.name}`;

const logo = document.querySelector('[data-brand-logo]');
if (logo) {
  logo.src = brand.logo;
  logo.alt = brand.name;
}

document.querySelector('[data-brand-headline]').textContent = brand.headline;
document.querySelector('[data-brand-description]').textContent = brand.description;

const websiteLink = document.querySelector('[data-brand-website]');
if (websiteLink) {
  websiteLink.href = brand.website || '#';
  if (!brand.website || brand.website === '#') {
    websiteLink.setAttribute('target', '_self');
  }
}

document.querySelectorAll('[data-brand-image]').forEach((img) => {
  const index = Number(img.dataset.brandImage);
  img.src = brand.images[index] || brand.images[0];
  img.alt = `${brand.name} lifestyle ${index + 1}`;
});

document.querySelectorAll('[data-brand-value-title]').forEach((node) => {
  const index = Number(node.dataset.brandValueTitle);
  node.textContent = brand.values[index]?.[0] || '';
});

document.querySelectorAll('[data-brand-value-text]').forEach((node) => {
  const index = Number(node.dataset.brandValueText);
  node.textContent = brand.values[index]?.[1] || '';
});
