import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Módulos vs Estimación Directa Autónomos 2025 | meskeIA',
  description: 'Compara orientativamente cuál régimen fiscal te conviene como autónomo: Estimación Directa Simplificada o Estimación Objetiva (Módulos). Cálculo por actividad y comparativa de coste fiscal anual.',
  keywords: 'módulos vs estimación directa, autónomo régimen fiscal, EDS estimación directa simplificada, estimación objetiva módulos, IRPF autónomos, RETA autónomos 2025, qué régimen me conviene',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-modulos-vs-directa/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Módulos vs Estimación Directa | meskeIA',
    description: 'Compara los dos regímenes fiscales del autónomo y descubre cuál te conviene',
    url: 'https://meskeia.com/simulador-modulos-vs-directa/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Módulos vs Estimación Directa | meskeIA',
    description: 'Compara regímenes fiscales del autónomo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Módulos vs Estimación Directa para Autónomos',
  description: 'Comparador orientativo entre los dos regímenes fiscales del IRPF para autónomos en España: Estimación Directa Simplificada y Estimación Objetiva (Módulos). Cálculo por actividad.',
  url: 'https://meskeia.com/simulador-modulos-vs-directa/',
  category: 'FinanceApplication',
  features: [
    'Comparativa visual lado a lado de los dos regímenes',
    'Cálculo IRPF + RETA + IVA orientativo',
    '4 casos preconfigurados (bar rentable, bar con pérdidas, comercio, profesional)',
    'Aviso sobre actividades elegibles a módulos',
    'Datos basados en LPGE 2025 y Orden HFP de módulos 2024',
    'Solo orientativo — no sustituye al asesor fiscal',
    'En español',
  ],
  keywords: ['módulos', 'estimación directa', 'autónomo', 'régimen fiscal'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre módulos y estimación directa para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En estimación directa (simplificada o normal) el IRPF se calcula sobre el beneficio real: ingresos menos gastos deducibles. En estimación objetiva (módulos) el rendimiento se calcula mediante indicadores fijos por actividad (mesas, empleados, potencia eléctrica…) independientemente del beneficio real. Módulos puede ser ventajoso en actividades con márgenes altos, pero no permite deducir gastos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué actividades pueden acogerse al régimen de módulos en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2025 pueden usar módulos las actividades recogidas en la Orden HFP/1359/2023 (actualizada anualmente por Hacienda), entre ellas restaurantes y bares, comercio minorista de determinados sectores, transporte de viajeros y mercancías, peluquerías y servicios similares. Quedan excluidas si el volumen de ingresos supera 250.000 € anuales o si más del 50% de las ventas son a empresas (régimen de inversión del sujeto pasivo en IVA).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene más la estimación directa que los módulos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estimación directa simplificada suele convenir cuando el negocio tiene muchos gastos deducibles (alquiler, suministros, personal), márgenes ajustados o resultados variables. Si el beneficio real es inferior al rendimiento que calcularían los módulos, pagar por módulos implica tributar más de lo necesario. Un asesor fiscal puede confirmar cuál resulta más favorable según la situación concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede cambiar de módulos a estimación directa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el autónomo puede renunciar a módulos presentando la comunicación a la Agencia Tributaria (modelo 036 o 037), pero la renuncia tiene efecto mínimo durante tres años: no se puede volver a módulos hasta transcurrido ese periodo. También es posible quedar excluido automáticamente si se superan los límites de ingresos o de facturación a empresas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El simulador de módulos vs estimación directa reemplaza al asesor fiscal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El simulador ofrece una comparativa orientativa basada en datos fiscales publicados (LPGE 2025 y Orden HFP de módulos) para ayudar a entender la diferencia entre ambos regímenes. La decisión final debe tomarse con un asesor fiscal o gestor que conozca la situación particular del autónomo, sus deducciones aplicables y las implicaciones del IVA.',
      },
    },
  ],
};
