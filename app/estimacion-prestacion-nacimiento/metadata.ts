import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Prestacion por Nacimiento - Seguridad Social Espana | meskeIA',
  description: 'Estima la prestacion por nacimiento de la Seguridad Social en Espana. 100% de la base reguladora, 19 semanas de permiso (32 en familias monoparentales). Calcula tu prestacion diaria, mensual y total.',
  keywords: 'prestacion nacimiento, baja maternidad cuanto cobro, prestacion paternidad, seguridad social nacimiento, 19 semanas permiso, permiso nacimiento espana, baja paternidad 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Prestacion por Nacimiento | meskeIA',
    description: 'Calcula cuanto cobraras durante el permiso por nacimiento: 100% de tu base reguladora, 19 semanas. Seguridad Social Espana.',
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
    title: 'Estimacion de Prestacion por Nacimiento | meskeIA',
    description: 'Estima tu prestacion por nacimiento de la Seguridad Social: cuantia diaria, duracion y total.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimacion Prestacion Nacimiento meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Prestacion por Nacimiento',
  description: 'Herramienta orientativa para estimar la prestacion por nacimiento y cuidado del menor de la Seguridad Social espanola. Calcula la cuantia diaria y total segun tu base de cotizacion, con informacion sobre duracion, ampliaciones y requisitos.',
  url: 'https://meskeia.com/estimacion-prestacion-nacimiento/',
  features: [
    'Calculo de prestacion diaria y total por nacimiento',
    'Ampliaciones por parto multiple y hospitalizacion neonatal',
    'Requisitos de cotizacion minima por edad',
    'Comparativa contributiva vs no contributiva',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cobra una persona durante el permiso por nacimiento en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación por nacimiento equivale al 100% de la base reguladora del trabajador, que se calcula dividiendo la suma de las bases de cotización de los últimos 12 meses entre 365. No hay límite máximo especial: el tope es la base máxima de cotización vigente. El importe diario se multiplica por los días de permiso disfrutados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas semanas dura el permiso por nacimiento en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde el Real Decreto-ley 9/2025, en vigor el 31 de julio de 2025, cada progenitor tiene derecho a 19 semanas en las familias biparentales, y el progenitor unico de una familia monoparental a 32. Las primeras 6 son obligatorias e inmediatamente posteriores al parto; 11 se distribuyen de forma flexible hasta que el menor cumple 12 meses y 2 mas son de cuidado prolongado, repartibles hasta que cumple 8 anos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué requisito mínimo de cotización se exige para cobrar la prestación por nacimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El periodo mínimo de cotización depende de la edad del trabajador en el momento del parto. Menores de 21 años no necesitan periodo mínimo. De 21 a 26 años se exigen 90 días cotizados en los 7 años previos. A partir de 26 años se requieren 180 días en los 7 años anteriores o 360 días cotizados a lo largo de toda la vida laboral.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se amplía el permiso por nacimiento en caso de parto múltiple o parto prematuro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En partos múltiples el permiso se amplía en 2 semanas por cada hijo adicional a partir del segundo. Si el recién nacido requiere hospitalización neonatal durante más de 7 días, se añaden tantas semanas de ampliación como días de ingreso, con un máximo de 13 semanas adicionales. Estas ampliaciones aplican a ambos progenitores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe una prestación por nacimiento para quienes no cumplen los requisitos de cotización?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Existe la prestación no contributiva por nacimiento y cuidado de menor, que tiene una cuantía fija equivalente al 100% del IPREM mensual vigente y dura 42 días naturales (6 semanas). Para acceder a ella es necesario no reunir el periodo mínimo de cotización exigido para la prestación contributiva.',
      },
    },
  ],
};
