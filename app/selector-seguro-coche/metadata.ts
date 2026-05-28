import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Coche | ¿Terceros o Todo Riesgo? | meskeIA',
  description: 'Test de 10 preguntas para saber qué modalidad de seguro de coche necesitas: terceros básico, terceros ampliado, todo riesgo con franquicia o todo riesgo sin franquicia.',
  keywords: ['qué seguro de coche elegir', 'terceros o todo riesgo', 'seguro coche todo riesgo con franquicia', 'terceros ampliado', 'seguro coche según valor', 'modalidad seguro automóvil España', 'seguro coche nuevo o usado', 'cuánto vale asegurar coche', 'cobertura seguro coche', 'seguro coche joven España'],
  openGraph: {
    title: 'Selector de Seguro de Coche — ¿Terceros o Todo Riesgo?',
    description: 'Descubre qué modalidad de seguro de coche se adapta mejor a tu situación en 10 preguntas.',
    url: 'https://meskeia.com/selector-seguro-coche/',
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
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Seguro de Coche",
  description: "Test de 10 preguntas para saber qué modalidad de seguro de coche necesitas: terceros básico, terceros ampliado, todo riesgo con franquicia o todo riesgo sin franquicia.",
  url: "https://meskeia.com/selector-seguro-coche/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre seguro a terceros y todo riesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El seguro a terceros cubre los daños que tú causas a otros vehículos o personas, pero no repara tu propio coche. El todo riesgo, además, cubre los daños de tu vehículo independientemente de quién tenga la culpa, incluidos los provocados por ti mismo. La diferencia de precio puede superar los 500 € anuales dependiendo del valor del vehículo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo compensa contratar todo riesgo para el coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El todo riesgo suele compensar cuando el valor del vehículo supera los 8.000-10.000 €, cuando el coche tiene menos de cinco años o cuando tiene un préstamo activo. Para coches con más de diez años y un valor de mercado bajo, el seguro a terceros ampliado suele ser suficiente y más económico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el todo riesgo con franquicia y para quién es recomendable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El todo riesgo con franquicia cubre los daños propios, pero el asegurado paga una cantidad fija (la franquicia, habitualmente entre 150 y 600 €) en cada siniestro. La prima anual es inferior al todo riesgo sin franquicia, por lo que resulta adecuado para conductores experimentados con bajo historial de siniestros que quieren protección ante daños graves sin asumir el coste total de la prima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cubre el seguro a terceros ampliado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El terceros ampliado incluye la cobertura básica obligatoria de responsabilidad civil más coberturas adicionales opcionales como robo, incendio, rotura de lunas y, en algunos casos, asistencia en viaje extendida o daños por fenómenos naturales. Es una opción intermedia que ofrece más protección que el mínimo legal sin llegar al coste del todo riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Influye la antigüedad del carné en la modalidad de seguro recomendada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los conductores noveles (con menos de dos años de carné) suelen tener primas más altas en cualquier modalidad, por lo que a veces el sobrecoste del todo riesgo resulta menos proporcionado. Sin embargo, la inexperiencia también implica mayor riesgo de siniestro propio, lo que puede justificar el todo riesgo si el vehículo tiene un valor elevado. La antigüedad del carné es uno de los factores clave en los baremos de las aseguradoras.',
      },
    },
  ],
};
