import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Una sola lista para el JSON-LD que inyecta layout.tsx y la meta schema:WebApplication. El
// JSON-LD salía con `features: []` y las ocho vivían solo en la meta (hallazgo 1686).
const FEATURES = [
  'Test de 10 preguntas sobre uso, prioridades y presupuesto',
  'Recomendación de sistema operativo (iOS o Android)',
  'Recomendación de gama (básica, media, alta o pro) con precio orientativo, ajustada a tu presupuesto',
  'Pliego de características técnicas a buscar, escrito para la gama recomendada',
  'Aviso cuando el presupuesto recorta lo que pide tu uso, o cuando no hay iPhone nuevo en tu tramo',
  'Consejos de compra: cuándo comprar y cuándo conviene un reacondicionado certificado',
  '100 % en el navegador, sin registro ni instalación',
];

export const metadata: Metadata = {
  title: 'Selector de Smartphone — ¿Qué móvil o celular me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué smartphone (móvil o celular) te conviene según tu uso, presupuesto y prioridades. iOS o Android, gama alta, media o básica, con las características técnicas que buscar en cada caso.',
  keywords: [
    'qué móvil comprar',
    'qué celular comprar',
    'selector smartphone',
    'test móvil ideal',
    'iOS o Android',
    'gama alta o media',
    'qué smartphone comprar',
    'qué teléfono comprar',
    'cuál es el mejor móvil para mí',
    'cuál es el mejor celular para mí',
    'comparativa smartphones',
    'iPhone o Samsung',
  ],
  openGraph: {
    title: '¿Qué smartphone te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre el tipo de móvil o celular ideal para tu perfil: sistema operativo, gama y las características técnicas que buscar. Sin marcas patrocinadas, solo tu uso real.',
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
    title: '¿Qué móvil o celular te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu smartphone (móvil o celular) ideal según presupuesto, uso y prioridades.',
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
          'Test orientativo de 10 preguntas para descubrir qué tipo de smartphone, móvil o celular (sistema operativo, gama y perfil de uso) se adapta mejor a tus necesidades reales, con las características técnicas que buscar. No recomienda modelos ni marcas concretas.',
        url: 'https://meskeia.com/selector-smartphone/',
        features: FEATURES,
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Smartphone",
  description: "Test de 10 preguntas para saber qué smartphone (móvil o celular) te conviene según tu uso, presupuesto y prioridades. iOS o Android, gama alta, media o básica, con las características técnicas que buscar en cada caso.",
  url: "https://meskeia.com/selector-smartphone/",
  category: 'UtilityApplication',
  features: FEATURES,
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
        text: 'La gama básica (hasta ~250 €) cubre llamadas, mensajería y redes sociales, pero puede quedarse corta para juegos exigentes o fotografía avanzada. La gama media (250-500 €) ofrece la mejor relación calidad-precio para la mayoría de usuarios. La gama alta (500-900 €) añade mejoras en cámara, pantalla y rendimiento que solo se notan en usos intensivos, y la gama pro o flagship (900 € en adelante) lleva al máximo zoom óptico, pantalla y años de actualizaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería durar un smartphone antes de cambiarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un smartphone de gama media o alta debería funcionar correctamente entre 3 y 5 años. El factor limitante suele ser el soporte de actualizaciones del sistema operativo: sin actualizaciones de seguridad, el dispositivo queda expuesto. En Android depende del fabricante y del modelo: los más generosos declaran hasta 7 años, e incluso en la gama de entrada ya hay modelos con 5 o más; Apple suele mantener el soporte durante años. En la Unión Europea, desde el 20/06/2025 (Reglamento (UE) 2023/1670), si el fabricante publica actualizaciones del sistema para un modelo debe ofrecerlas gratis a todas sus unidades hasta al menos 5 años después de que deje de venderse. La cifra que cuenta sigue siendo la que el fabricante declara para ese modelo concreto.',
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
    {
      '@type': 'Question',
      name: '¿Es lo mismo móvil, celular y smartphone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, se refieren al mismo dispositivo. "Móvil" (o "teléfono móvil") es el término habitual en España, mientras que "celular" (o "teléfono celular") es el más usado en Hispanoamérica. "Smartphone" es el anglicismo común en ambas regiones para los teléfonos inteligentes actuales. Este selector funciona igual sea cual sea el nombre que uses.',
      },
    },
  ],
};
