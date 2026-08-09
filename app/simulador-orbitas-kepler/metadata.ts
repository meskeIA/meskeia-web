import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Órbitas y Leyes de Kepler - Periodo y Velocidad Orbital | meskeIA',
  description:
    'Calcula el periodo orbital, la velocidad en el periastro y el apoastro, la velocidad de escape y la energía de una órbita a partir del semieje mayor y la excentricidad, con la elipse animada según la segunda ley de Kepler.',
  keywords:
    'leyes de kepler, tercera ley de kepler, periodo orbital, velocidad orbital, velocidad de escape, órbita elíptica, excentricidad, perihelio, afelio, perigeo, apogeo, ecuación vis-viva, mecánica orbital, satélite geoestacionario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-orbitas-kepler/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Órbitas y Leyes de Kepler | meskeIA',
    description:
      'Ajusta el semieje mayor y la excentricidad y obtén el periodo, las velocidades y la energía de la órbita, con la elipse animada',
    url: 'https://meskeia.com/simulador-orbitas-kepler/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Órbitas y Leyes de Kepler | meskeIA',
    description: 'Periodo, velocidades y energía de una órbita, con la elipse animada por la segunda ley',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Órbitas y Leyes de Kepler',
  description:
    'Simulador interactivo de mecánica orbital. Elige el cuerpo central (Sol, Tierra, Marte o Júpiter), ajusta el semieje mayor y la excentricidad de la órbita y obtén el periodo orbital por la tercera ley de Kepler, las distancias y velocidades en el periastro y el apoastro por la ecuación vis-viva, la velocidad de escape y la energía orbital, con la elipse dibujada y el satélite animado según la segunda ley de Kepler.',
  url: 'https://meskeia.com/simulador-orbitas-kepler/',
  category: 'EducationalApplication',
  features: [
    'Periodo orbital por la tercera ley de Kepler',
    'Velocidades en el periastro y el apoastro por la ecuación vis-viva',
    'Velocidad de escape y velocidad circular equivalente',
    'Energía orbital específica y energía mecánica total',
    'Elipse a escala con el cuerpo central en el foco',
    'Satélite animado que barre áreas iguales en tiempos iguales',
    'Órbitas reales predefinidas: planetas, ISS, GPS, geoestacionaria, Luna y cometa Halley',
    'Aviso cuando la órbita corta la superficie del cuerpo central',
    'En español',
  ],
  keywords: ['leyes de kepler', 'periodo orbital', 'velocidad orbital', 'órbita elíptica', 'velocidad de escape'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el periodo orbital con la tercera ley de Kepler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con T = 2π·√(a³/GM), donde a es el semieje mayor de la órbita, G la constante de gravitación universal (6,674·10⁻¹¹ m³/kg·s²) y M la masa del cuerpo central. Lo llamativo es lo que NO aparece en la fórmula: ni la masa del satélite ni la excentricidad. Dos objetos con el mismo semieje mayor tardan lo mismo en dar una vuelta aunque uno describa una circunferencia y el otro una elipse muy alargada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un satélite va más rápido en el periastro que en el apoastro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque se conserva el momento angular: al acercarse al cuerpo central el radio disminuye y la velocidad tiene que aumentar para compensarlo. Es la segunda ley de Kepler, que dice que la línea que une ambos cuerpos barre áreas iguales en tiempos iguales. La relación exacta entre las dos velocidades es v_periastro/v_apoastro = (1+e)/(1−e), así que en una órbita muy excéntrica la diferencia es enorme: el cometa Halley pasa de unos 54 km/s cerca del Sol a menos de 1 km/s en el afelio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la ecuación vis-viva y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la fórmula v = √(GM·(2/r − 1/a)) y da la velocidad de un cuerpo en cualquier punto de su órbita conociendo solo la distancia r en ese instante y el semieje mayor a. Es la herramienta básica de la mecánica orbital: de ella salen la velocidad circular (cuando r = a), la velocidad de escape (cuando a tiende a infinito) y el cálculo de las maniobras de transferencia entre órbitas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué altura está un satélite geoestacionario y por qué justo ahí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A unos 35.786 km sobre el ecuador, lo que da un radio orbital de unos 42.164 km medido desde el centro de la Tierra. Esa es la única distancia a la que el periodo orbital coincide con el día sidéreo (23 h 56 min 4 s), de modo que el satélite parece quedarse quieto sobre el mismo punto del ecuador. Se obtiene despejando a en la tercera ley de Kepler con T igual al día sidéreo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la energía de una órbita es negativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el criterio habitual fija la energía potencial en cero a distancia infinita, así que cualquier cuerpo ligado gravitatoriamente tiene energía total negativa: ε = −GM/2a. Cuanto más pequeño es el semieje mayor, más negativa es la energía y más ligado está el objeto. Cuando la energía llega a cero el cuerpo escapa con velocidad residual nula (órbita parabólica), y si es positiva escapa con velocidad sobrante (órbita hiperbólica).',
      },
    },
  ],
};
