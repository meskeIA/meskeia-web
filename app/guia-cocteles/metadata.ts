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
    url: 'https://meskeia.com/guia-cocteles/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Cócteles Clásicos | meskeIA',
    description: '45 cócteles clásicos con ingredientes, método de preparación, copa, origen e historia. Filtros por familia y base.',
    images: ['https://meskeia.com/coquinum/og-image.png']
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
  ],
});

// Hallazgo 4775 (16/11/2026): el FAQPage («Agitar un Martini no está "mal"») y la FAQ visible
// («técnicamente incorrecto y produce un resultado inferior») daban veredictos opuestos, y la regla
// del FAQPage («se agita cuando contiene… jarabes») chocaba con el Old Fashioned, que lleva jarabe y
// se revuelve. Una sola respuesta, que leen las dos (check:faq-unica).
export const PREGUNTA_MARTINI = '¿Por qué el Martini se revuelve y no se agita?';
export const RESPUESTA_MARTINI =
  'Se agita cuando el cóctel lleva zumo de cítrico, lácteos o huevo, que hay que integrar y emulsionar. Se revuelve en vaso mezclador cuando solo lleva espirituosos, a lo sumo con un poco de jarabe o unas gotas de bitters (Martini, Negroni, Manhattan, Old Fashioned): así se enfría y se diluye sin meter burbujas de aire ni fragmentos de hielo, y queda transparente y sedoso. Agitar un Martini, como pedía James Bond, no lo estropea como bebida, pero le da otra textura, más turbia, que no es la de la receta clásica.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: PREGUNTA_MARTINI,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_MARTINI,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los cócteles más fáciles de preparar en casa sin equipamiento profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los highballs (un destilado alargado con un refresco sobre hielo, a veces con un toque de cítrico, como la lima del Cuba Libre) son los más sencillos: Gin Tonic, Cuba Libre, Vodka Tonic, Dark & Stormy. Solo requieren un vaso alto, hielo y las proporciones correctas. El Aperol Spritz también es muy accesible (Aperol + cava/prosecco + soda). Para cócteles algo más elaborados pero sin necesidad de coctelera, el Negroni (gin + Campari + vermut rojo en partes iguales sobre hielo) es una elección clásica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un sour y qué cócteles pertenecen a esta familia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un sour es una familia de cócteles que combina un destilado con un ácido cítrico (limón o lima) y un elemento dulce (jarabe de azúcar, licor dulce). Las proporciones cambian de una receta a otra: en las fichas de esta guía, el Daiquiri lleva 60 ml de ron, 25 de lima y 15 de jarabe, y el Whiskey Sour 50, 25 y 15. Los sours más conocidos son: Daiquiri (ron), Margarita (tequila), Whiskey Sour (whiskey), Pisco Sour (pisco) y Gimlet (gin). Varios admiten una clara de huevo para añadir textura cremosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cócteles clásicos se pueden preparar sin alcohol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Varios clásicos tienen versiones sin alcohol (mocktails) bien establecidas: el Virgin Mojito quita el ron y alarga con más soda; el Arnold Palmer mezcla té helado con limonada; el Shirley Temple usa ginger ale y granadina. Más allá de las versiones sin alcohol de clásicos, hay cócteles sin alcohol de identidad propia como el Agua de Valencia sin alcohol o el Cucumber Cooler. La clave es mantener el equilibrio ácido-dulce-amargo del original.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el origen del Mojito y cuál es su receta clásica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Mojito tiene origen cubano, con raíces que se remontan al siglo XVI aunque su forma moderna se consolidó en La Habana en el siglo XX. Se asocia popularmente con Ernest Hemingway y el bar La Bodeguita del Medio. La receta de la ficha de esta guía usa 50 ml de ron blanco, 25 ml de zumo de lima, 15 ml de jarabe de azúcar, 6-8 hojas de menta fresca y unos 100 ml de soda. Se machaca suavemente la menta con el azúcar y la lima, se añade hielo y se completa con el agua con gas.',
      },
    },
  ],
};
