import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Residencia vs Cuidado en Casa - Comparativa de costes | meskeIA',
  description: 'Compara los costes orientativos de residencia privada, servicio de ayuda a domicilio (SAD) y cuidador en casa para elegir la opción de cuidado más adecuada.',
  keywords: 'residencia mayores coste, cuidador en casa precio, sad servicio ayuda domicilio, residencia vs domicilio, cuanto cuesta residencia mayores españa, comparativa cuidado mayores',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Residencia vs Cuidado en Casa | meskeIA',
    description: 'Comparativa de costes: residencia privada, SAD y cuidador en casa.',
    url: 'https://meskeia.com/residencia-vs-cuidado-en-casa/',
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
    title: 'Residencia vs Cuidado en Casa | meskeIA',
    description: 'Comparativa de opciones de cuidado para mayores: costes y factores clave',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Residencia vs Cuidado en Casa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Residencia vs Cuidado en Casa",
  description: "Compara los costes orientativos de residencia privada, servicio de ayuda a domicilio (SAD) y cuidador en casa para elegir la opción de cuidado más adecuada.",
  url: "https://meskeia.com/residencia-vs-cuidado-en-casa/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta una residencia de mayores en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de una residencia privada en España oscila entre 1.500 y 4.000 € al mes, dependiendo de la comunidad autónoma, el tipo de habitación (individual o doble) y el grado de asistencia requerida. Las residencias en grandes ciudades como Madrid o Barcelona suelen estar en la parte alta de ese rango. Las plazas públicas o concertadas tienen precios mucho más bajos, pero las listas de espera pueden superar los dos años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Servicio de Ayuda a Domicilio (SAD) y cuánto cuesta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SAD es un servicio municipal o autonómico que envía a domicilio a un auxiliar para ayudar con tareas cotidianas (higiene personal, comidas, limpieza). El coste público puede ser gratuito o con copago según los ingresos; el servicio privado ronda 15–25 €/hora. Suele cubrir entre 1 y 4 horas diarias, por lo que no es suficiente cuando la persona necesita supervisión continua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es preferible contratar un cuidador en casa frente a una residencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuidador en casa es preferible cuando la persona mayor desea permanecer en su entorno habitual, tiene un grado de dependencia moderado y el domicilio puede adaptarse. También puede ser más económico si solo se necesitan unas horas al día. La residencia es más adecuada cuando la persona requiere atención sanitaria especializada las 24 horas, supervisión constante o cuando el cuidador familiar está desbordado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las ayudas por dependencia cubren el coste de la residencia o del cuidador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, parcialmente. El Sistema para la Autonomía y Atención a la Dependencia (SAAD) reconoce prestaciones según el grado (I, II o III). Para residencia, la prestación puede llegar a unos 1.500 €/mes en grado III; para cuidador profesional a domicilio, hasta ~800–900 €/mes. La prestación económica para cuidador familiar (PEC) oscila entre 153 y 387 €/mes según el grado, y se cobra directamente por cuidar en casa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un auxiliar de ayuda a domicilio y un asistente personal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El auxiliar de ayuda a domicilio se centra en tareas de asistencia personal básica (aseo, movilidad, alimentación) y del hogar, y suele gestionarse a través del SAD público o de empresas de servicios. El asistente personal está regulado por la Ley de Dependencia y está orientado a facilitar la autonomía de la persona con discapacidad en cualquier ámbito de su vida, no solo en el domicilio; tiene mayor flexibilidad y es elegido y dirigido por la propia persona beneficiaria.',
      },
    },
  ],
};
