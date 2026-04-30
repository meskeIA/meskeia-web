import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Filosofía — Corrientes y Pensadores | meskeIA',
  description: 'Explora 16 corrientes filosóficas desde los presocráticos hasta el posmodernismo. Cronología interactiva con filósofos clave, conceptos fundamentales y contexto histórico.',
  keywords: ['historia filosofía', 'corrientes filosóficas', 'presocráticos', 'estoicismo', 'existencialismo', 'filosofía moderna', 'cronología filosófica'],
  openGraph: {
    title: 'Historia de la Filosofía — Corrientes y Pensadores',
    description: 'De Tales de Mileto a Derrida: 16 corrientes filosóficas con filósofos clave, conceptos y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-filosofia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-filosofia/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia de la Filosofía',
  description: 'Herramienta educativa sobre historia de la filosofía y corrientes filosóficas',
  url: 'https://meskeia.com/visualizador-filosofia/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
