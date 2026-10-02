import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_IRPF_META, FISCAL_MODULOS_IRPF_META, LIMITES_EXCLUSION_MODULOS_2025, ORDEN_MODULOS_VIGENTE } from '@/data/fiscal';
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

// ⚠️ 01/10/2026 (hallazgo 2545) — la app dejó de estimar el rendimiento de módulos con
// fórmulas inventadas por actividad y de recomendar régimen: el rendimiento lo aporta el
// usuario y la diferencia de costes se da como dato. Description, features y FAQPage dejaron
// de prometer qué régimen elegir y un «cálculo por actividad».

export const metadata: Metadata = {
  title: `Simulador Módulos vs Estimación Directa Autónomos ${anio} | meskeIA`,
  description: 'Calcula el coste anual de IRPF y cuota RETA de un autónomo en Estimación Directa Simplificada y en módulos, con tus ingresos, tus gastos y tu rendimiento neto de módulos. Diferencia entre ambos y límites de exclusión.',
  keywords: `módulos vs estimación directa, autónomo régimen fiscal, EDS estimación directa simplificada, estimación objetiva módulos, IRPF autónomos, RETA autónomos ${anio}, rendimiento neto de módulos`,
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
    description: 'Coste anual de IRPF y cuota RETA del autónomo en directa y en módulos, con tus datos',
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
  description: 'Calculadora orientativa del coste anual (IRPF + cuota RETA) de un autónomo en España en Estimación Directa Simplificada y, con el rendimiento neto de módulos que aporta el usuario, en Estimación Objetiva (módulos).',
  url: 'https://meskeia.com/simulador-modulos-vs-directa/',
  category: 'FinanceApplication',
  features: [
    'Desglose lado a lado del coste anual en los dos regímenes',
    'Estimación directa con la cuota RETA como gasto deducible y el 5\u00A0% de gastos de difícil justificación',
    'Módulos con el rendimiento neto que aporta el usuario y la reducción general de la Orden vigente',
    'Límites de exclusión de módulos por ingresos y compras',
    'IRPF con la escala general y el mínimo personal (art. 63 de la Ley 35/2006)',
    'Diferencia de costes como dato, sin veredicto sobre qué régimen elegir',
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
        text: 'En estimación directa (simplificada o normal) el IRPF se calcula sobre el beneficio real: ingresos menos gastos deducibles. En estimación objetiva (módulos) el rendimiento se calcula mediante indicadores fijos por actividad (mesas, empleados, potencia eléctrica…) independientemente del beneficio real. En módulos los gastos reales no se deducen uno a uno, y la cuota de autónomo tampoco.',
      },
    },
    {
      '@type': 'Question',
      name: `¿Qué actividades pueden acogerse al régimen de módulos en ${orden.ejercicio}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Pueden usar módulos las actividades recogidas en la Orden anual de estimación objetiva — para ${orden.ejercicio}, la ${orden.referencia}, de ${orden.fecha} (${orden.boe}), que sustituye a la ${orden.anterior}, entre ellas restaurantes y bares, comercio minorista de determinados sectores, transporte de viajeros y mercancías, peluquerías y servicios similares. Quedan excluidas si el volumen de ingresos supera ${euros(limites.ingresosConjuntoActividades)} anuales, si la facturación a otros empresarios y profesionales supera ${euros(limites.facturacionAEmpresas)} anuales, o si las compras en bienes y servicios superan ${euros(limites.comprasBienesYServicios)}. ${FISCAL_MODULOS_IRPF_META.salvedad}`,
      },
    },
    {
      '@type': 'Question',
      name: '¿De qué depende que la estimación directa cueste más o menos que los módulos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De la distancia entre el beneficio real (ingresos menos gastos deducibles y cuota de autónomo) y el rendimiento neto de módulos que fija la Orden para la actividad: cuanto más se separan, más se separan las cuotas de IRPF, en un sentido o en otro. La comparación de un año no recoge que la renuncia a módulos obliga a seguir tres años en estimación directa, que el rendimiento de módulos no baja en un año con menos margen, ni el IVA. Un asesor fiscal puede valorar la situación concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede cambiar de módulos a estimación directa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el autónomo puede renunciar a módulos presentando la comunicación a la Agencia Tributaria (modelo 036 o 037), pero la renuncia tiene efecto mínimo durante tres años: no se puede volver a módulos hasta transcurrido ese periodo. También es posible quedar excluido automáticamente si se superan los límites de ingresos, de facturación a empresas o de compras, y la exclusión obliga igualmente a tributar en estimación directa durante los tres años siguientes (art. 31.1.5.ª de la Ley del IRPF).',
      },
    },
    {
      '@type': 'Question',
      name: '¿El simulador de módulos vs estimación directa reemplaza al asesor fiscal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `No. El simulador calcula el IRPF de ambos regímenes con la escala general del art. 63 de la Ley 35/2006 del IRPF, pero no calcula el rendimiento de módulos: lo aporta el usuario, porque depende de los módulos que la Orden anual (para ${orden.ejercicio}, la ${orden.referencia}) fija para cada epígrafe. Da las cifras y su diferencia, no un veredicto sobre qué régimen elegir ni una declaración. La decisión debe tomarse con un asesor fiscal o gestor que conozca la situación particular del autónomo, sus deducciones aplicables y las implicaciones del IVA.`,
      },
    },
  ],
};
