import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Exoplanetas: Detección, Zona Habitable y Diversidad — meskeIA',
  description:
    'Explora cómo detectamos exoplanetas con animaciones del método de tránsito y velocidad radial, la zona habitable de Goldilocks, clasificación de tipos y distribución de los 5.500+ mundos conocidos.',
  keywords: [
    'exoplanetas visualizador',
    'método tránsito exoplanetas',
    'velocidad radial planeta',
    'zona habitable Goldilocks',
    'TRAPPIST-1 exoplaneta',
    'Kepler-452b planeta',
    'Proxima Centauri b',
    'detección exoplanetas animación',
    'júpiter caliente mini neptuno super tierra',
    'James Webb atmósferas exoplanetas',
    'ecuación de Drake Fermi',
    'tipos de exoplanetas clasificación',
  ],
  openGraph: {
    title: 'Visualizador de Exoplanetas: Detección, Zona Habitable y Diversidad — meskeIA',
    description:
      'Animaciones interactivas del método de tránsito, velocidad radial, zona habitable y clasificación de los más de 5.500 exoplanetas confirmados.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Exoplanetas: Tránsito, Zona Habitable y Kepler",
  description: "Explora cómo detectamos exoplanetas con animaciones del método de tránsito y velocidad radial, la zona habitable de Goldilocks, clasificación de tipos y distribución de los 5.500+ mundos conocidos.",
  url: "https://meskeia.com/visualizador-exoplanetas/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se detectan los exoplanetas desde la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los dos métodos principales son el tránsito y la velocidad radial. El método de tránsito detecta la pequeña caída de brillo de una estrella cuando un planeta pasa por delante de ella (entre 0,01 % y 1 %). La velocidad radial mide el bamboleo gravitacional que el planeta induce en su estrella mediante el efecto Doppler en el espectro estelar. El telescopio Kepler descubrió más de 2.700 exoplanetas usando el método de tránsito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la zona habitable de Goldilocks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La zona habitable, o zona de Goldilocks, es el rango de distancias alrededor de una estrella donde las condiciones de temperatura permiten que el agua líquida exista en la superficie de un planeta rocoso. Para el Sol, esta zona va aproximadamente de 0,95 a 1,37 UA (unidades astronómicas). Un planeta demasiado cerca se sobrecalienta (como Venus); demasiado lejos, el agua se congela (como Marte parcialmente).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos exoplanetas se han confirmado hasta la fecha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A principios de 2025 se han confirmado más de 5.700 exoplanetas en el Archivo de Exoplanetas de la NASA. Los tipos más frecuentes son los júpiteres calientes (gigantes gaseosos muy cercanos a su estrella) y las supertierras (planetas entre 1 y 10 masas terrestres). Solo un pequeño porcentaje se encuentra en la zona habitable de su estrella y tiene tamaño similar a la Tierra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es TRAPPIST-1 y por qué es tan relevante para la búsqueda de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TRAPPIST-1 es una enana roja ultrafría situada a 39 años luz con 7 planetas de tamaño similar a la Tierra orbitando muy cerca de ella. Al menos 3 (TRAPPIST-1e, f y g) se encuentran en la zona habitable. Es el sistema con más planetas potencialmente habitables conocido, y el telescopio James Webb lo estudia activamente en busca de señales atmosféricas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué aporta el telescopio James Webb al estudio de exoplanetas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El James Webb Space Telescope (JWST), operativo desde 2022, puede analizar la atmósfera de exoplanetas durante los tránsitos usando espectroscopía de transmisión: la luz estelar filtrada a través de la atmósfera deja huellas espectrales de moléculas como CO₂, vapor de agua o metano. En 2023 detectó CO₂ en K2-18b y dióxido de carbono en TRAPPIST-1b, marcando hitos en la caracterización atmosférica de otros mundos.',
      },
    },
  ],
};
