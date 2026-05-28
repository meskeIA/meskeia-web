import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Tipos de Seguros - Guía Completa | meskeIA',
  description: 'Compara tipos de seguros en España: vida, auto, hogar y salud. Descubre las diferencias entre coberturas y elige el seguro adecuado para ti.',
  keywords: 'tipos de seguros, comparador seguros, seguro vida, seguro coche, seguro hogar, seguro salud, todo riesgo, terceros, vida temporal, España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Tipos de Seguros - Guía Completa | meskeIA',
    description: 'Guía educativa sobre tipos de seguros en España: vida, auto, hogar y salud. Compara coberturas y características.',
    url: 'https://meskeia.com/comparador-tipos-seguros/',
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
    title: 'Comparador de Tipos de Seguros - meskeIA',
    description: 'Guía educativa sobre tipos de seguros en España: vida, auto, hogar y salud.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-tipos-seguros/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador Tipos de Seguros",
  description: "Compara tipos de seguros en España: vida, auto, hogar y salud. Descubre las diferencias entre coberturas y elige el seguro adecuado para ti.",
  url: "https://meskeia.com/comparador-tipos-seguros/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre seguro a terceros y todo riesgo para el coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El seguro a terceros (responsabilidad civil obligatoria) cubre los daños que tú causas a otras personas o vehículos, pero no los daños a tu propio coche. El seguro a todo riesgo añade la cobertura de daños propios, robo, cristales y asistencia en viaje. Todo riesgo es más caro pero protege el valor del vehículo, especialmente en coches nuevos o de valor elevado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cubre un seguro de vida temporal y en qué se diferencia del seguro de vida entera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El seguro de vida temporal cubre el fallecimiento durante un periodo concreto (por ejemplo, 20 años) y es el más habitual para cubrir una hipoteca o proteger a la familia mientras los hijos son dependientes. El seguro de vida entera garantiza el pago del capital sea cual sea el momento del fallecimiento, a cambio de primas más altas. Para la mayoría de personas con hipoteca, el temporal resulta suficiente y más económico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena contratar un seguro de salud privado si ya tienes la sanidad pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de factores como el tiempo de espera en la sanidad pública de tu comunidad autónoma, la frecuencia con que utilizas el sistema sanitario y si necesitas especialistas concretos. El seguro privado permite elegir médico, reduce listas de espera y en algunas pólizas cubre dental y óptica. En España, el precio medio de un seguro de salud individual ronda los 50-100 € al mes según edad y cobertura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué garantías básicas incluye un seguro de hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un seguro de hogar estándar cubre el continente (estructura del edificio) y el contenido (muebles y enseres) frente a incendio, robo, daños por agua y responsabilidad civil del hogar. Las coberturas adicionales pueden incluir roturas de cristales, daños eléctricos, asistencia en el hogar 24 horas y daños estéticos. Es obligatorio en hipotecas contratar al menos la cobertura de incendios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo comparar seguros para elegir el más adecuado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para comparar seguros de forma efectiva, lo primero es listar las coberturas que necesitas (no el precio) y usarlas como filtro inicial. Después, compara las exclusiones de cada póliza, los límites de indemnización y el capital asegurado. Herramientas educativas de comparación permiten entender las diferencias estructurales entre modalidades antes de pedir presupuesto a una aseguradora.',
      },
    },
  ],
};
