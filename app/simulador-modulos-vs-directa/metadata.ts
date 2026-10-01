import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_IRPF_META, LIMITES_EXCLUSION_MODULOS_2025, ORDEN_MODULOS_VIGENTE } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_IRPF_META.vigencia;

// El FAQPage (lo que leen los buscadores con IA) cita la Orden de módulos y los límites de
// exclusión desde data/fiscal, como la página. Hasta el 01/10/2026 iban tecleados y se habrían
// quedado atrás al re-sellar la Orden del año siguiente (hallazgo 2549).
const orden = ORDEN_MODULOS_VIGENTE;
const limites = LIMITES_EXCLUSION_MODULOS_2025;
const euros = (n: number) => `${formatNumber(n, 0)} €`;

export const metadata: Metadata = {
  title: `Simulador Módulos vs Estimación Directa Autónomos ${anio} | meskeIA`,
  description: 'Compara orientativamente cuál régimen fiscal te conviene como autónomo: Estimación Directa Simplificada o Estimación Objetiva (Módulos). Cálculo por actividad y comparativa de coste fiscal anual.',
  keywords: `módulos vs estimación directa, autónomo régimen fiscal, EDS estimación directa simplificada, estimación objetiva módulos, IRPF autónomos, RETA autónomos ${anio}, qué régimen me conviene`,
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
    'Cálculo IRPF + RETA orientativo',
    '4 casos preconfigurados (bar rentable, bar con pérdidas, comercio, profesional)',
    'Aviso sobre actividades elegibles a módulos',
    'IRPF calculado con la escala general del art. 63 de la Ley 35/2006 del IRPF; módulos con fórmula didáctica simplificada, no los coeficientes oficiales de la Orden anual de módulos',
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
      name: `¿Qué actividades pueden acogerse al régimen de módulos en ${orden.ejercicio}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Pueden usar módulos las actividades recogidas en la Orden anual de estimación objetiva — para ${orden.ejercicio}, la ${orden.referencia}, de ${orden.fecha} (${orden.boe}), que sustituye a la ${orden.anterior}, entre ellas restaurantes y bares, comercio minorista de determinados sectores, transporte de viajeros y mercancías, peluquerías y servicios similares. Quedan excluidas si el volumen de ingresos supera ${euros(limites.ingresosConjuntoActividades)} anuales, si la facturación a otros empresarios y profesionales supera ${euros(limites.facturacionAEmpresas)} anuales, o si las compras en bienes y servicios superan ${euros(limites.comprasBienesYServicios)}.`,
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
        text: `No. El simulador calcula el IRPF de ambos regímenes con la escala general del art. 63 de la Ley 35/2006 del IRPF, pero el rendimiento de módulos usa una fórmula didáctica simplificada por actividad, no los coeficientes reales que publica la Orden anual de módulos (para ${orden.ejercicio}, la ${orden.referencia}). Sirve para entender la lógica de la comparación, no para presentar una declaración. La decisión final debe tomarse con un asesor fiscal o gestor que conozca la situación particular del autónomo, sus deducciones aplicables y las implicaciones del IVA.`,
      },
    },
  ],
};
