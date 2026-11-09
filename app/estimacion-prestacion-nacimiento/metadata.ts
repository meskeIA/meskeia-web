import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de prestación por nacimiento - Seguridad Social España | meskeIA',
  // Sin «mensual»: el resultado da la cifra diaria y la total, no una mensual (hallazgo 4295)
  description: 'Estima la prestación por nacimiento de la Seguridad Social en España: 100 % de la base reguladora, 19 semanas de permiso (32 en familias monoparentales). Calcula tu prestación diaria y el total del permiso.',
  keywords: 'prestacion nacimiento, baja maternidad cuanto cobro, prestacion paternidad, seguridad social nacimiento, 19 semanas permiso, permiso nacimiento espana, baja paternidad 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de prestación por nacimiento | meskeIA',
    description: 'Calcula cuánto cobrarás durante el permiso por nacimiento: 100 % de tu base reguladora, 19 semanas. Seguridad Social España.',
    url: 'https://meskeia.com/estimacion-prestacion-nacimiento/',
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
    title: 'Estimación de prestación por nacimiento | meskeIA',
    description: 'Estima tu prestación por nacimiento de la Seguridad Social: cuantía diaria, duración y total.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimación Prestación Nacimiento meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimación de prestación por nacimiento',
  description: 'Herramienta orientativa para estimar la prestación por nacimiento y cuidado del menor de la Seguridad Social española. Calcula la cuantía diaria y total según tu base de cotización, con información sobre duración, ampliaciones y requisitos.',
  url: 'https://meskeia.com/estimacion-prestacion-nacimiento/',
  features: [
    'Cálculo de prestación diaria y total por nacimiento',
    'Ampliaciones por parto múltiple y por días de hospitalización neonatal',
    'Requisitos de cotización mínima por edad',
    'Comparativa contributiva vs no contributiva',
  ],
});

/**
 * FAQPage. Corregidas el 09/11/2026 contra el RD 295/2009 (BOE-A-2009-4724, arts. 6.2, 7 y
 * 16.2), el ET art. 48.4 y 48.6 y el art. 182 LGSS (hallazgos 4290 y 4291): la base general es
 * la del mes entre 30 (la de 12 meses entre 365 es la de tiempo parcial); la hospitalización
 * amplía en DÍAS; el parto múltiple, dos semanas por hijo, una por progenitor; la no
 * contributiva no es una cuantía fija y dura 42 días más 14 en cuatro supuestos.
 */
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cobra una persona durante el permiso por nacimiento en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación por nacimiento equivale al 100 % de la base reguladora, que es la base de cotización del mes anterior al inicio del descanso dividida entre 30. A tiempo parcial se suman las bases de los 12 meses anteriores y se dividen entre 365. No hay límite especial: el tope es la base máxima de cotización vigente. El importe diario se multiplica por los días de permiso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas semanas dura el permiso por nacimiento en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde el Real Decreto-ley 9/2025, en vigor el 31 de julio de 2025, cada progenitor tiene derecho a 19 semanas en las familias biparentales, y el progenitor único de una familia monoparental a 32. Las primeras 6 son obligatorias e inmediatamente posteriores al parto; 11 se distribuyen de forma flexible hasta que el menor cumple 12 meses y 2 más son de cuidado prolongado, repartibles hasta que cumple 8 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué requisito mínimo de cotización se exige para cobrar la prestación por nacimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la edad del trabajador en la fecha del parto. Los menores de 21 años no necesitan período mínimo. Entre 21 y 25 años se exigen 90 días cotizados en los 7 años anteriores o 180 en toda la vida laboral. A partir de 26 años, 180 días en los 7 años anteriores o 360 en toda la vida laboral. Basta con cumplir uno de los dos umbrales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se amplía el permiso por nacimiento en caso de parto múltiple o parto prematuro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En parto múltiple, el permiso se amplía en dos semanas por cada hijo a partir del segundo, una para cada progenitor; en una familia monoparental, el progenitor único disfruta las dos. Además, uno de los progenitores cobra un subsidio especial de 6 semanas por cada hijo a partir del segundo. Si el recién nacido está hospitalizado más de siete días tras el parto, el permiso se amplía en tantos días como dure el ingreso, con un máximo de 13 semanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe una prestación por nacimiento para quienes no cumplen los requisitos de cotización?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la prestación no contributiva, para quien no reúne el período mínimo de cotización. Se cobra el 100 % del IPREM diario, salvo que la base reguladora sea inferior, en cuyo caso se cobra esta. Dura 42 días naturales, que se amplían en 14 en familia numerosa, monoparental, parto múltiple o discapacidad igual o superior al 65 %, una sola vez aunque coincidan varios supuestos.',
      },
    },
  ],
};
