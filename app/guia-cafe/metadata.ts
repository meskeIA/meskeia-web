import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía del Café - Orígenes, variedades y producción mundial | meskeIA',
  description: '40 orígenes de café del mundo: especie, altitud, notas de sabor, procesado, cosecha y preparación ideal. Más guía de especies (Arábica, Robusta, Libérica), métodos de procesado y niveles de tueste.',
  keywords: 'cafe origenes mundo, arabica robusta, cafe colombia, cafe etiopia, cafe especialidad, notas de sabor cafe, procesado cafe, tueste cafe, guia cafe',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía del Café | meskeIA',
    description: '40 orígenes de café: especie, altitud, notas de sabor, procesado y preparación ideal. Guía de especies, procesados y tueste.',
    url: 'https://meskeia.com/guia-cafe/',
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
    title: 'Guía del Café | meskeIA',
    description: '40 orígenes de café del mundo: especie, altitud, notas de sabor y preparación ideal.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía del Café meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía del Café',
  description: 'Directorio de 40 orígenes de café del mundo con especie, altitud de cultivo, notas de sabor, método de procesado, época de cosecha y preparación ideal. Incluye guía de referencia sobre especies (Arábica, Robusta, Libérica), métodos de procesado y niveles de tueste. Filtros por continente.',
  url: 'https://meskeia.com/guia-cafe/',
  features: [
    '40 orígenes de café con perfil completo',
    'Filtros por continente',
    'Búsqueda por origen, país o nota de sabor',
    'Guía de referencia: Arábica vs Robusta vs Libérica',
    'Guía de métodos de procesado',
    'Guía de niveles de tueste',
    'Indicadores visuales de acidez y cuerpo',
    'Funciona 100% en el navegador, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre café Arábica y Robusta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El café Arábica (Coffea arabica) representa alrededor del 60-70% de la producción mundial y se cultiva a mayor altitud (800-2.200 m). Tiene menos cafeína (0,8-1,4%), mayor acidez y notas aromáticas más complejas (frutas, flores, chocolate). El Robusta (Coffea canephora) crece en cotas más bajas, es más resistente a plagas y tiene entre 1,7-3,5% de cafeína; su sabor es más amargo y terroso. El espresso italiano clásico suele mezclar ambas especies para equilibrar cuerpo y crema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el procesado natural, lavado o honey en el café?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El procesado se refiere al método de separación del grano de la cereza. En el procesado natural (dry process) la cereza se seca entera al sol, lo que aporta notas dulces y afrutadas al café. En el lavado (washed) la pulpa se retira mecánicamente antes del secado, resultando en tazas más limpias y ácidas. El honey es un proceso intermedio: se retira parte de la pulpa pero se deja cierta mucílago adherida al pergamino, lo que aporta dulzor sin la intensidad frutal del natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la altitud de cultivo al sabor del café?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A mayor altitud, el café crece más lentamente debido a las temperaturas más bajas, lo que permite que el grano desarrolle mayor complejidad aromática y acidez brillante. Los cafés de especialidad de alta altitud (por encima de 1.500 m) como los de Etiopía Yirgacheffe o Colombia Huila suelen mostrar notas de cítricos, bayas y flores. A altitudes más bajas el crecimiento es más rápido y el grano tiende a tener mayor cuerpo y notas achocolatadas o a frutos secos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el origen de café con mejor reputación en el mercado de especialidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Etiopía es ampliamente considerada la cuna del café Arábica y sus regiones Yirgacheffe, Guji y Sidamo producen algunos de los cafés de especialidad más valorados del mundo por sus notas florales y cítricas. Colombia destaca por su consistencia y acidez brillante; Panamá es conocido por la variedad geisha de Boquete; y Kenia por su acidez intensa tipo grosella negra. No hay un único "mejor origen"; depende del perfil de sabor que busque cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué método de preparación resalta mejor las notas de sabor de un café de especialidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para cafés de especialidad con notas delicadas (florales, cítricas, afrutadas) los métodos de filtrado como el V60, Chemex o Aeropress resaltan la claridad y acidez mejor que el espresso. El espresso concentra y potencia cuerpo y amargor, por lo que es más adecuado para blends o cafés de tueste medio-oscuro con notas de chocolate o frutos secos. La cafetera francesa (French press) produce una taza con más cuerpo y sedimento, lo que puede tapar los matices más sutiles.',
      },
    },
  ],
};
