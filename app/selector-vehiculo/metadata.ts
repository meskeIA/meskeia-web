import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Vehículo — ¿Qué coche me conviene? | meskeIA',
  description:
    'Test para saber qué tipo de coche te conviene según tu uso, presupuesto y estilo de vida. Compacto, SUV, familiar. Gasolina, híbrido o eléctrico. Comparativa de costes anuales incluida.',
  keywords: [
    'qué coche comprar',
    'selector coche',
    'test tipo de coche',
    'gasolina o eléctrico',
    'SUV o compacto',
    'qué motorización elegir',
    'coste anual coche',
    'comparativa coches España',
    'cuál es el mejor coche para mí',
    'híbrido o gasolina',
  ],
  openGraph: {
    title: '¿Qué tipo de coche te conviene? Test en 9 preguntas | meskeIA',
    description:
      'Descubre el segmento y motorización ideal para tu perfil real. Compacto, SUV, familiar. Gasolina, híbrido, eléctrico. Comparativa de costes anuales estimados.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-vehiculo/',
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
    title: '¿Qué coche te conviene? Test gratuito | meskeIA',
    description:
      'Test de 9 preguntas para encontrar tu tipo de coche ideal según tus km, uso, presupuesto y estilo de vida.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-vehiculo/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Vehículo',
        description:
          'Test orientativo para descubrir qué tipo de coche (segmento y motorización) se adapta mejor a tu perfil de uso, presupuesto y estilo de vida. Incluye comparativa de costes anuales estimados.',
        url: 'https://meskeia.com/selector-vehiculo/',
        features: [
          'Test de 9 preguntas sobre uso y perfil',
          'Recomendación de segmento (urbano, compacto, SUV, familiar)',
          'Recomendación de motorización (gasolina, diésel, híbrido, eléctrico)',
          'Comparativa de coste anual estimado por tipo de motor',
          'Alertas contextuales (ZBE, puntos de carga, km altos)',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Vehículo",
  description: "Test para saber qué tipo de coche te conviene según tu uso, presupuesto y estilo de vida. Compacto, SUV, familiar. Gasolina, híbrido o eléctrico. Comparativa de costes anuales incluida.",
  url: "https://meskeia.com/selector-vehiculo/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipo de coche me conviene según mis kilómetros anuales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si recorres menos de 10.000 km al año, un urbano eléctrico o un compacto de gasolina suele ser la opción más económica. Entre 10.000 y 20.000 km, el híbrido ofrece un buen equilibrio entre coste y autonomía. Por encima de 20.000 km, el diésel sigue siendo competitivo en coste por kilómetro, aunque las restricciones de acceso a zonas de bajas emisiones (ZBE) en ciudades grandes pueden penalizarlo a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un coche híbrido y uno híbrido enchufable (PHEV)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El híbrido convencional (HEV) recarga su batería únicamente mediante el motor de combustión y la frenada regenerativa; no puede enchufarse. El híbrido enchufable (PHEV) tiene una batería mayor que se recarga también en un punto de carga y ofrece entre 40 y 80 km de autonomía eléctrica pura. Si puedes cargar en casa o en el trabajo, el PHEV puede ahorrar significativamente en combustible; si no, su peso extra puede hacerlo menos eficiente que un híbrido convencional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena comprar un coche eléctrico en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de tu perfil. Si tienes cargador en casa o en el trabajo, haces trayectos habituales de menos de 400 km y no necesitas hacer viajes largos frecuentes, el eléctrico puede ahorrar entre 800 y 1.500 € anuales en combustible y mantenimiento respecto a un gasolina equivalente. Las barreras principales siguen siendo el precio de compra más elevado, la red de carga rápida en rutas secundarias y los tiempos de recarga en viajes largos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una Zona de Bajas Emisiones (ZBE) y cómo afecta a la elección del coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las Zonas de Bajas Emisiones (ZBE) son áreas urbanas donde solo pueden circular libremente vehículos con etiqueta ECO o ZERO de la DGT. Los coches con etiqueta B (la mayoría de gasolina anteriores a 2015 y diésel anteriores a 2019) pueden tener restricciones de acceso en días de alta contaminación. Si vives o trabajas habitualmente en ciudades con ZBE establecida (Madrid, Barcelona, Valencia, Sevilla, entre otras), la etiqueta del vehículo es un criterio de compra relevante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta de media mantener un coche al año en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según estimaciones habituales, el coste total anual de un vehículo de gama media en España (seguro, impuesto de circulación, revisiones, neumáticos, combustible y amortización) ronda los 5.000-8.000 € dependiendo del uso. El combustible representa entre el 20% y el 35% de ese total. Un eléctrico reduce el gasto en energía y mantenimiento preventivo (sin cambio de aceite ni embrague), pero incrementa la amortización por el mayor precio de compra inicial.',
      },
    },
  ],
};
