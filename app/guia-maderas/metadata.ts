import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Maderas - Directorio de 35 tipos: roble, pino, teca y más | meskeIA',
  description:
    'Directorio interactivo de 35 tipos de madera para carpintería, construcción y decoración. Dureza Janka, densidad, origen, usos y facilidad de trabajo.',
  keywords:
    'guía maderas, tipos de madera, dureza janka, roble, pino, teca, nogal, madera para muebles, madera para suelos, madera exterior, carpintería',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Maderas - Directorio Interactivo | meskeIA',
    description:
      'Explora 35 tipos de madera: frondosas, coníferas, tropicales y más. Filtra por tipo, dificultad y sostenibilidad.',
    url: 'https://meskeia.com/guia-maderas/',
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
    title: 'Guía de Maderas - 35 tipos con Janka, densidad y usos',
    description:
      'Directorio interactivo de maderas: roble, pino, teca, ébano y más. Filtra y compara características.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Maderas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Maderas',
  description:
    'Directorio interactivo de 35 tipos de madera para carpintería, construcción y decoración. Incluye dureza Janka, densidad, origen, usos principales y facilidad de trabajo para cada especie.',
  url: 'https://meskeia.com/guia-maderas/',
  features: [
    '35 tipos de madera con ficha técnica completa',
    'Filtros por tipo, dificultad y sostenibilidad',
    'Buscador por nombre de especie',
    'Escala visual de dureza Janka',
    'Información de sostenibilidad y origen',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la dureza Janka y para qué sirve al elegir una madera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dureza Janka mide la resistencia de una madera a la penetración y al desgaste. Se expresa en libras-fuerza (lbf) o kilonewtons (kN) y es clave para elegir suelos, encimeras o muebles de uso intensivo. Una madera con Janka superior a 1.000 lbf como el roble o la teca se considera dura y apta para tráfico elevado; por debajo de 500 lbf, como el pino, es más blanda y se raya con mayor facilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué madera es mejor para muebles de exterior?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para uso en exterior se recomienda maderas tropicales ricas en aceites naturales que repelen la humedad y los insectos, como la teca (Tectona grandis), el ipé o el cedro rojo occidental. La teca es la opción más valorada por su durabilidad —puede durar décadas sin tratamiento— aunque su precio es elevado y conviene verificar que procede de plantaciones certificadas FSC o PEFC para evitar deforestación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre madera frondosa (hardwood) y madera de conífera (softwood)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los términos frondosa y conífera hacen referencia al origen botánico, no solo a la dureza física. Las frondosas provienen de árboles de hoja caduca o perennifolia de crecimiento lento (roble, nogal, cerezo) y suelen ser más densas y duraderas. Las coníferas crecen más rápido (pino, abeto, cedro) y son generalmente más blandas, ligeras y económicas. Hay excepciones: el balsa es una frondosa muy blanda, mientras que el tejo es una conífera bastante dura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué maderas están certificadas como sostenibles y por qué importa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales certificaciones son FSC (Forest Stewardship Council) y PEFC, que garantizan una gestión forestal responsable: tala controlada, reforestación y respeto a los ecosistemas. Elegir madera certificada es especialmente importante en especies tropicales como teca, ébano o palisandro, cuya extracción ilegal contribuye a la deforestación. En la guía se indica el estado de sostenibilidad de cada especie para facilitar la decisión de compra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué madera es más fácil de trabajar para proyectos de bricolaje o carpintería de iniciación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pino silvestre y el pino radiata son las opciones más recomendadas para principiantes: son blandas, se cortan y lijan con facilidad, admiten bien el adhesivo y la tornillería, y tienen un precio accesible. El álamo y el chopo son alternativas ligeras con buen comportamiento para proyectos interiores. Maderas duras como el roble o el nogal requieren herramientas más potentes y mayor experiencia para obtener acabados limpios.',
      },
    },
  ],
};
