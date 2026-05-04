import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Cócteles Clásicos - Recetas, historia y técnica | meskeIA',
  description: '45 cócteles clásicos: ingredientes, método de preparación, copa, origen e historia. Sours, Highballs, Martinis, Tropicales, Spritz y opciones sin alcohol. Filtros por familia y base.',
  keywords: 'cocteles clasicos recetas, margarita daiquiri mojito, gin tonic cuba libre, aperol spritz bellini, negroni manhattan old fashioned, cocteleria clasica, recetas cocteles espanol, mocktails sin alcohol, bartender barista',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Cócteles Clásicos | meskeIA',
    description: '45 cócteles clásicos: ingredientes, método, copa, origen e historia. Sours, Highballs, Martinis, Tropicales, Spritz y sin alcohol.',
    url: 'https://meskeia.com/guia-cocteles',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Cócteles Clásicos | meskeIA',
    description: '45 cócteles clásicos con ingredientes, método de preparación, copa, origen e historia. Filtros por familia y base.',
  },
  other: {
    'application-name': 'Guía de Cócteles Clásicos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Cócteles Clásicos',
  description: 'Directorio de 45 cócteles clásicos con ingredientes y cantidades orientativas, método de preparación correcto, tipo de copa, dulzor, graduación, perfil de sabor, origen histórico y curiosidades. Incluye secciones Sour, Highball, Martini, Tropical, Spritz/Aperitivo, Cremoso/Caliente y Sin alcohol. Filtros por familia y base alcohólica.',
  url: 'https://meskeia.com/guia-cocteles/',
  features: [
    '45 cócteles con perfil completo',
    'Filtros por familia de cóctel y base alcohólica',
    'Búsqueda por nombre, origen, ingredientes y perfil',
    'Indicador visual de dulzor (5 niveles)',
    'Método correcto de preparación por cóctel',
    'Copa o vaso recomendado',
    'Historia y curiosidades de cada cóctel',
    '7 opciones sin alcohol / mocktails',
    'Funciona 100% en el navegador, sin registro',
  ],
});
