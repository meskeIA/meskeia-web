import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cortisol - La Hormona del Estrés: Ritmo, Efectos y Hábitos | meskeIA',
  description: 'Entiende el cortisol en profundidad: ritmo circadiano hora a hora, diferencia entre estrés agudo y crónico, efectos en 8 sistemas del cuerpo y qué hábitos lo modulan.',
  keywords: ['cortisol', 'hormona estres', 'ritmo circadiano cortisol', 'estres cronico', 'CAR cortisol awakening response', 'eje HPA', 'hipocortisol', 'hipercortisol', 'manejo estres', 'fisiologia estres'],
  openGraph: {
    title: 'Cortisol - Hormona del Estrés | meskeIA',
    description: 'Ritmo circadiano, estrés agudo vs crónico, efectos en el cuerpo y moduladores',
    url: 'https://meskeia.com/visualizador-cortisol/',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Cortisol - La Hormona del Estrés',
  url: 'https://meskeia.com/visualizador-cortisol/',
  description: 'Visualizador interactivo del cortisol: ritmo circadiano, estrés agudo vs crónico, efectos en 8 sistemas corporales y moduladores.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
