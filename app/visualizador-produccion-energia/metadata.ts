import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Produce la Energía - Del Átomo al Enchufe | meskeIA',
  description: 'Entiende cómo se genera la electricidad: nuclear, solar, eólica, gas, hidráulica y carbón. Mix eléctrico español, costes por kWh, emisiones CO2 y futuro energético. Explicador visual interactivo.',
  keywords: 'producción energía, mix eléctrico España, energía nuclear, energía solar, energía eólica, coste kWh, emisiones CO2, renovables, transición energética, fusión nuclear',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo se Produce la Energía - Del Átomo al Enchufe',
    description: 'Nuclear, solar, eólica, gas, hidráulica y carbón: cómo funciona cada fuente de energía, cuánto cuesta y cuánto contamina.',
    url: 'https://meskeia.com/visualizador-produccion-energia/',
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
    title: 'Cómo se Produce la Energía - Explicador Visual',
    description: 'Las fuentes de energía explicadas: mecanismos, costes, CO2 y el futuro energético de España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Producción Energía meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo se Produce la Energía - Del Átomo al Enchufe',
  description: 'Explicador visual interactivo sobre producción de energía eléctrica: cómo funciona cada fuente (nuclear, solar, eólica, gas, hidráulica, carbón), el mix eléctrico español, costes y emisiones por kWh, y el futuro energético con renovables, baterías y fusión nuclear.',
  url: 'https://meskeia.com/visualizador-produccion-energia/',
  category: 'EducationalApplication',
  features: [
    '6 fuentes de energía explicadas con mecanismos simplificados',
    'Mix eléctrico español: distribución actual y evolución en 20 años',
    'Comparativa de coste y emisiones CO2 por kWh para cada fuente',
    'Futuro energético: almacenamiento, fusión nuclear, objetivos 2030',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se genera la electricidad en una central nuclear?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una central nuclear, la fisión del uranio-235 libera calor que convierte agua en vapor a alta presión. Ese vapor mueve una turbina conectada a un generador eléctrico, que produce corriente alterna mediante inducción electromagnética. El agua del circuito primario nunca entra en contacto con el exterior; el vapor que se ve en las torres de refrigeración es agua del circuito de enfriamiento, no radiactiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué fuente de energía produce menos emisiones de CO2 por kWh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía nuclear y la eólica offshore son las fuentes con menores emisiones de ciclo de vida, ambas por debajo de 12 g CO2 equivalente/kWh según el IPCC. La solar fotovoltaica emite entre 18-48 g/kWh. En el otro extremo, el carbón emite entre 820-1.050 g CO2/kWh y el gas natural ciclo combinado unos 490 g/kWh.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el mix eléctrico de España y qué porcentaje es renovable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2023, España generó aproximadamente el 50 % de su electricidad con fuentes renovables (eólica, hidráulica, solar fotovoltaica y solar térmica). La eólica es la principal fuente renovable, aportando en torno al 23 % del total. El objetivo del Plan Nacional Integrado de Energía y Clima (PNIEC) es alcanzar el 81 % de electricidad renovable en 2030.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la energía solar no puede suministrar electricidad las 24 horas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los paneles solares fotovoltaicos solo generan electricidad cuando hay radiación solar directa o difusa, es decir, durante el día. Por la noche o en días muy nublados la producción cae a cero o es mínima. El principal reto de la transición energética es el almacenamiento: baterías de gran escala, bombeo hidráulico y, en el futuro, hidrógeno verde permiten guardar el exceso de energía solar para usarla cuando no hay sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la fusión nuclear y cuándo podría estar disponible comercialmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fusión nuclear replica el proceso del Sol: une núcleos ligeros de hidrógeno (deuterio y tritio) a temperaturas de más de 100 millones de grados para liberar energía. A diferencia de la fisión, no genera residuos de larga vida ni riesgo de accidente nuclear grave. El proyecto ITER en Francia (2025-2035) busca demostrar viabilidad científica; las primeras plantas comerciales de fusión se estiman para la década de 2040-2050 según los calendarios más optimistas.',
      },
    },
  ],
};
