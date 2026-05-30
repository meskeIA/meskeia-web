import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de los Derechos Humanos | Cronología Visual | meskeIA',
  description: 'Visualiza la evolución de los derechos humanos: de la Magna Carta a los derechos digitales. Cronología interactiva de hitos, tratados y movimientos históricos.',
  keywords: ['derechos humanos', 'historia', 'Magna Carta', 'Declaración Universal', 'sufragismo', 'abolicionismo', 'derechos civiles', 'GDPR'],
  openGraph: {
    title: 'Historia de los Derechos Humanos | Cronología Visual | meskeIA',
    description: 'Visualiza la evolución de los derechos humanos: de la Magna Carta a los derechos digitales.',
    url: 'https://meskeia.com/visualizador-derechos-humanos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-derechos-humanos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Historia de los Derechos Humanos — Cronología Visual',
  description: 'Herramienta educativa sobre la evolución histórica de los derechos humanos desde la Magna Carta hasta los derechos digitales.',
  url: 'https://meskeia.com/visualizador-derechos-humanos/',
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
      name: '¿Cuándo y cómo surgieron los derechos humanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los derechos humanos no surgieron en un momento único, sino que se fueron construyendo a lo largo de siglos. Hitos fundacionales incluyen la Magna Carta de 1215 (que limitó el poder del rey inglés), la Declaración de Independencia estadounidense de 1776, la Declaración de los Derechos del Hombre y del Ciudadano francesa de 1789 y, tras las atrocidades de la Segunda Guerra Mundial, la Declaración Universal de los Derechos Humanos adoptada por la ONU el 10 de diciembre de 1948.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué establece la Declaración Universal de los Derechos Humanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aprobada por la Asamblea General de la ONU en 1948, la Declaración Universal reconoce 30 artículos que proclaman derechos civiles (libertad, igualdad ante la ley, prohibición de tortura), políticos (voto, libertad de expresión), económicos (trabajo digno, seguridad social) y culturales (educación, participación en la vida cultural). Aunque no es un tratado vinculante per se, ha inspirado más de 70 convenios internacionales y las constituciones de decenas de países.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los derechos digitales y por qué son relevantes hoy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los derechos digitales son la extensión de los derechos fundamentales al entorno digital: derecho a la privacidad online, a la protección de datos personales, al acceso a internet, a la no vigilancia masiva y a la libertad de expresión en redes. El Reglamento General de Protección de Datos (RGPD) de la UE, en vigor desde 2018, es uno de los marcos normativos más avanzados del mundo en esta materia. Su relevancia crece con la expansión de la inteligencia artificial y la economía de los datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál fue el papel del movimiento sufragista en la historia de los derechos humanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sufragismo fue el movimiento que, entre finales del siglo XIX y principios del XX, luchó por el derecho al voto de las mujeres. Nueva Zelanda fue el primer país en concederlo, en 1893. En el Reino Unido se conquistó parcialmente en 1918 (mujeres mayores de 30) y de forma plena en 1928. En España se aprobó en 1931 gracias a la diputada Clara Campoamor. El sufragismo no solo amplió la democracia, sino que abrió el debate sobre la igualdad de género que continúa hasta hoy.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre derechos civiles, políticos, económicos y sociales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los derechos civiles y políticos (llamados de "primera generación") protegen la libertad individual frente al poder del Estado: prohibición de tortura, libertad de expresión, derecho al voto. Los derechos económicos, sociales y culturales (segunda generación) garantizan condiciones de vida dignas: derecho al trabajo, a la educación, a la salud y a la seguridad social. Los derechos de tercera generación incluyen los colectivos: derecho al desarrollo, a la paz y a un medio ambiente sano. Las tres generaciones son interdependientes e igualmente importantes.',
      },
    },
  ],
};
