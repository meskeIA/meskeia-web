import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciclo del Nitrógeno | meskeIA',
  description: 'Visualiza el ciclo del nitrógeno: fijación biológica (Rhizobium), industrial (Haber-Bosch), nitrificación, desnitrificación y el impacto humano en los ciclos biogeoquímicos.',
  keywords: ['ciclo del nitrógeno', 'fijación nitrógeno', 'Rhizobium', 'Haber-Bosch', 'nitrificación', 'biogeoquímica', 'biología'],
  openGraph: {
    title: 'Ciclo del Nitrógeno — meskeIA',
    description: 'Ciclo completo del nitrógeno: fijación, nitrificación, desnitrificación e impacto humano.',
    url: 'https://meskeia.com/visualizador-ciclo-nitrogeno/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciclo del Nitrógeno — meskeIA',
    description: 'Ciclo completo del nitrógeno: fijación, nitrificación, desnitrificación e impacto humano.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador del Ciclo del Nitrógeno',
  description: 'Herramienta educativa sobre el ciclo biogeoquímico del nitrógeno',
  url: 'https://meskeia.com/visualizador-ciclo-nitrogeno/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo del nitrógeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo del nitrógeno es el proceso biogeoquímico por el que el nitrógeno circula entre la atmósfera, el suelo, el agua y los seres vivos. Aunque el 78% del aire es nitrógeno (N₂), la mayoría de organismos no pueden usarlo directamente. El ciclo incluye procesos clave como la fijación, la nitrificación, la asimilación y la desnitrificación, que transforman el nitrógeno en formas accesibles para plantas y animales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la fijación de nitrógeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fijación convierte el nitrógeno atmosférico (N₂) en amoníaco (NH₃), que las plantas pueden absorber. Ocurre de dos formas: biológica, realizada por bacterias como Rhizobium (en simbiosis con leguminosas) y Azotobacter (de vida libre); e industrial, mediante el proceso Haber-Bosch (N₂ + H₂ → NH₃ a alta temperatura y presión), que produce los fertilizantes sintéticos responsables de alimentar aproximadamente la mitad de la población mundial actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre nitrificación y desnitrificación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La nitrificación es la oxidación del amoníaco (NH₄⁺) a nitrito (NO₂⁻) y luego a nitrato (NO₃⁻), realizada por bacterias como Nitrosomonas y Nitrobacter en suelos bien oxigenados. La desnitrificación es el proceso inverso: bacterias anaerobias como Paracoccus denitrificans convierten los nitratos de nuevo en N₂ gaseoso que vuelve a la atmósfera, cerrando el ciclo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el impacto humano en el ciclo del nitrógeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La actividad humana ha duplicado la cantidad de nitrógeno reactivo que entra en los ecosistemas, principalmente a través del uso masivo de fertilizantes sintéticos y la quema de combustibles fósiles. Esto provoca eutrofización de ríos y mares (exceso de nutrientes que agota el oxígeno), lluvia ácida, contribución al efecto invernadero mediante el óxido nitroso (N₂O), y pérdida de biodiversidad en ecosistemas sensibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está indicado este visualizador del ciclo del nitrógeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está especialmente indicado para estudiantes de biología y ciencias de secundaria, bachillerato y primeros cursos universitarios. Cubre los contenidos del currículo de Biología y Geología de 4.º ESO y 2.º Bachillerato, incluyendo los ciclos biogeoquímicos y el papel de los microorganismos. También es útil para docentes que busquen materiales visuales interactivos para explicar los procesos del ciclo del nitrógeno.',
      },
    },
  ],
};
