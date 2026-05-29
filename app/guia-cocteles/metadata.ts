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
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Cócteles Clásicos | meskeIA',
    description: '45 cócteles clásicos con ingredientes, método de preparación, copa, origen e historia. Filtros por familia y base.',
    images: ['https://meskeia.com/og-image.png']
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre agitar (shake) y remover (stir) un cóctel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla general es: se agita cuando el cóctel contiene zumos, lácteos, jarabes o huevo (ingredientes opacos), porque hay que integrar y emulsionar. Se remueve cuando todos los ingredientes son alcohólicos y transparentes (Martini, Negroni, Manhattan), para enfriar y diluir sin añadir burbujas ni opacidad. Agitar un Martini no está "mal", pero cambia su textura y claridad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los cócteles más fáciles de preparar en casa sin equipamiento profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los highballs (combinados de dos ingredientes sobre hielo) son los más sencillos: Gin Tonic, Cuba Libre, Vodka Tonic, Dark & Stormy. Solo requieren un vaso alto, hielo y las proporciones correctas. El Aperol Spritz también es muy accesible (Aperol + cava/prosecco + soda). Para cócteles algo más elaborados pero sin necesidad de coctelera, el Negroni (gin + Campari + vermut rojo en partes iguales sobre hielo) es una elección clásica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un sour y qué cócteles pertenecen a esta familia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un sour es una familia de cócteles que combina un destilado con un ácido cítrico (limón o lima) y un elemento dulce (jarabe de azúcar, licor dulce). La proporción clásica es 2:1:¾ (base:cítrico:dulce). Los sours más conocidos son: Daiquiri (ron), Margarita (tequila), Whiskey Sour (whiskey), Pisco Sour (pisco) y Gimlet (gin). Muchos sours admiten media clara de huevo para añadir textura cremosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cócteles clásicos se pueden preparar sin alcohol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Varios clásicos tienen versiones sin alcohol (mocktails) bien establecidas: el Virgin Mojito sustituye el ron por agua con gas y más lima; el Arnold Palmer mezcla té helado con limonada; el Shirley Temple usa ginger ale y granadina. Más allá de las versiones sin alcohol de clásicos, hay cócteles sin alcohol de identidad propia como el Seedlip Spritz o el Nojito. La clave es mantener el equilibrio ácido-dulce-amargo del original.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el origen del Mojito y cuál es su receta clásica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Mojito tiene origen cubano, con raíces que se remontan al siglo XVI aunque su forma moderna se consolidó en La Habana en el siglo XX. Se asocia popularmente con Ernest Hemingway y el bar La Bodeguita del Medio. La receta clásica usa ron blanco cubano (45 ml), zumo de lima (30 ml), azúcar (2 cucharaditas o jarabe simple), hojas de hierbabuena fresca (8-10) y agua con gas. Se machaca suavemente la menta con el azúcar y la lima, se añade hielo y se completa con el agua con gas.',
      },
    },
  ],
};
