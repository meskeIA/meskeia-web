import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Smartphone — ¿Qué móvil me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué smartphone te conviene según tu uso, presupuesto y prioridades. iOS o Android, gama alta, media o básica. Modelos de referencia actualizados.',
  keywords: [
    'qué móvil comprar',
    'selector smartphone',
    'test móvil ideal',
    'iOS o Android',
    'gama alta o media',
    'mejor smartphone 2025',
    'qué teléfono comprar España',
    'cuál es el mejor móvil para mí',
    'comparativa smartphones',
    'iPhone o Samsung',
  ],
  openGraph: {
    title: '¿Qué smartphone te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre el tipo de móvil ideal para tu perfil: sistema operativo, gama y modelos de referencia. Sin marcas patrocinadas, solo tu uso real.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-smartphone/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué móvil te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu smartphone ideal según presupuesto, uso y prioridades.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-smartphone/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Smartphone',
        description:
          'Test orientativo de 10 preguntas para descubrir qué tipo de smartphone (sistema operativo, gama y perfil de uso) se adapta mejor a tus necesidades reales. Incluye modelos de referencia actualizados.',
        url: 'https://meskeia.com/selector-smartphone/',
        features: [
          'Test de 10 preguntas sobre uso y prioridades',
          'Recomendación de sistema operativo (iOS / Android)',
          'Recomendación de gama (básica, media, alta, pro)',
          'Modelos de referencia actualizados por perfil',
          'Consejos sobre cuándo comprar y dónde',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Smartphone",
  description: "Test de 10 preguntas para saber qué smartphone te conviene según tu uso, presupuesto y prioridades. iOS o Android, gama alta, media o básica. Modelos de referencia actualizados.",
  url: "https://meskeia.com/selector-smartphone/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre iOS y Android para elegir móvil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'iOS (Apple) ofrece un ecosistema cerrado pero muy integrado: actualizaciones garantizadas durante 5-7 años, privacidad reforzada y sincronización fluida con otros productos Apple. Android es más abierto, con mayor variedad de fabricantes y rangos de precio, y mayor flexibilidad de personalización. La elección depende en gran medida de si ya usas otros dispositivos Apple y de cuánto valoras la personalización frente a la simplicidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gama de smartphone me conviene según mi presupuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La gama básica (hasta ~250 €) cubre llamadas, mensajería y redes sociales, pero puede quedarse corta para juegos exigentes o fotografía avanzada. La gama media (250-600 €) ofrece la mejor relación calidad-precio para la mayoría de usuarios. La gama alta (600 €+) añade mejoras en cámara, pantalla y rendimiento que solo se notan en usos intensivos o profesionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería durar un smartphone antes de cambiarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un smartphone de gama media o alta debería funcionar correctamente entre 3 y 5 años. El factor limitante suele ser el soporte de actualizaciones del sistema operativo: sin actualizaciones de seguridad, el dispositivo queda expuesto. Android varía mucho por fabricante (2-4 años en la mayoría, hasta 7 en algunos modelos recientes), mientras que Apple garantiza soporte durante más tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona este test para elegir smartphone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test hace 10 preguntas sobre tu uso habitual (fotografía, juegos, autonomía, trabajo), tu presupuesto y tus prioridades. A partir de las respuestas determina el sistema operativo más adecuado (iOS o Android), la gama recomendada y el perfil de dispositivo. No recomienda modelos concretos de marcas patrocinadas, sino perfiles técnicos con características clave.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor comprar smartphone con contrato o libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la mayoría de casos el teléfono libre resulta más económico a largo plazo. Los contratos con terminal subvencionado tienen el coste del dispositivo repartido en la tarifa mensual, que suele ser más cara. Comprar el móvil libre y contratar por separado la tarifa más ajustada a tu consumo real permite mayor flexibilidad y ahorro en contratos de 24 meses.',
      },
    },
  ],
};
