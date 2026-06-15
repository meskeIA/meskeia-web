import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lo que Cuesta Enfermarse - Sanidad Pública vs Privada | meskeIA',
  description: 'Coste real de consultas, operaciones y urgencias en España vs otros países. Sanidad pública vs privada explicada con datos reales.',
  keywords: 'coste sanidad, sanidad publica, sanidad privada, coste operaciones, urgencias, sistema sanitario españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lo que Cuesta Enfermarse',
    description: 'Sanidad pública vs privada: costes reales de enfermarse en España y el mundo.',
    url: 'https://meskeia.com/visualizador-coste-sanidad/',
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
    title: 'Lo que Cuesta Enfermarse',
    description: 'Costes reales de la sanidad explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Coste Sanidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Lo que Cuesta Enfermarse',
  description: 'Explicador visual del coste real de la sanidad: consultas, operaciones, urgencias. España vs otros países, público vs privado.',
  url: 'https://meskeia.com/visualizador-coste-sanidad/',
  features: [
    'Comparación costes médicos entre países',
    'Desglose sanidad pública vs privada',
    'Coste real de operaciones comunes',
    'Cómo se financia la sanidad española',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta una operación en la sanidad privada en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los costes en la sanidad privada española varían notablemente según el procedimiento. Una apendicectomía puede rondar los 3.000-6.000 €, una operación de cataratas entre 1.000 y 2.500 € por ojo, y una prótesis de cadera entre 8.000 y 15.000 €. Una consulta con especialista oscila entre 60 y 150 €. Estas cifras dependen del centro, la ciudad y si se cuenta con seguro médico privado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se financia la sanidad pública en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sanidad pública española se financia principalmente a través de los impuestos generales del Estado (IRPF, IVA, cotizaciones sociales) que se transfieren a las comunidades autónomas, que son las responsables de gestionar los servicios sanitarios. El gasto público sanitario en España representa aproximadamente el 6-7 % del PIB, por debajo de la media europea del 8 %. El copago farmacéutico es la única aportación directa del usuario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta enfermarse en Estados Unidos sin seguro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En Estados Unidos, una visita a urgencias sin seguro puede costar entre 1.000 y 3.000 dólares. Una hospitalización de varios días puede superar los 30.000 dólares, y una operación mayor puede alcanzar los 100.000 dólares o más. Es el sistema sanitario con mayor coste per cápita del mundo: unos 12.000 dólares anuales por habitante, frente a los ~3.500 € de media en España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena contratar un seguro médico privado teniendo la sanidad pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de varios factores: las listas de espera en tu comunidad autónoma, la frecuencia con que usas servicios médicos y el coste del seguro (entre 50 y 150 €/mes para adultos sanos). Los seguros privados ofrecen principalmente menores tiempos de espera, elección de especialista y habitación individual. Para procedimientos urgentes o de vida o muerte, la sanidad pública ofrece las mismas garantías que la privada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué país tiene la sanidad más cara del mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Estados Unidos es el país con el mayor gasto sanitario per cápita del mundo, con aproximadamente 12.500 dólares anuales por persona (datos OCDE 2022), más del doble que la media de los países europeos. Le siguen Suiza (~8.000 USD) y Noruega (~7.700 USD). A pesar del gasto, los indicadores de salud estadounidenses —esperanza de vida, mortalidad infantil— se sitúan por debajo de muchos países con menor gasto.',
      },
    },
  ],
};
