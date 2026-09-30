import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { getEdadJubilacion, getEscalaPorcentajePension, REQUISITOS_ANTICIPADA_INVOLUNTARIA, REQUISITOS_ANTICIPADA_VOLUNTARIA } from '@/data/fiscal';
import {
  porcentajePension,
  ANIO_ESCALA,
  pct,
  aniosYMeses,
  ANIOS_ACCESO,
  MESES_ACCESO,
  MESES_PARA_CIEN,
  PCT_ACCESO,
  TRAMOS_CRECIENTES,
  EDAD_ORDINARIA,
  ejemploInicio,
  frenteAlCien,
  ANIOS_ANTICIPO_VOLUNTARIA,
  ANIOS_ANTICIPO_INVOLUNTARIA,
} from './escala';

export const metadata: Metadata = {
  title: 'Tu Jubilación en Perspectiva - Timeline Visual | meskeIA',
  description: 'Visualiza tu vida laboral como una línea temporal: cuántos años cotizas, qué porcentaje de pensión generas y cómo cambia según cuándo empezaste a trabajar.',
  keywords: 'jubilación perspectiva, años cotizados, porcentaje pensión, vida laboral, timeline jubilación, explicador visual, seguridad social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Jubilación en Perspectiva - Timeline Visual',
    description: 'Timeline interactivo de tu vida laboral: años cotizados, porcentaje de pensión y edad de jubilación.',
    url: 'https://meskeia.com/visualizador-jubilacion-perspectiva/',
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
    title: 'Tu Jubilación en Perspectiva',
    description: 'Visualiza tu carrera laboral y cómo se traduce en pensión.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Jubilación Perspectiva meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Jubilación en Perspectiva',
  description: 'Explicador visual de la jubilación española: timeline interactivo que muestra cuántos años cotizas según cuándo empiezas, qué porcentaje de pensión generas, y cómo cada año extra de cotización impacta tu pensión futura.',
  url: 'https://meskeia.com/visualizador-jubilacion-perspectiva/',
  features: [
    `Timeline visual de vida laboral desde los 16 a los ${EDAD_ORDINARIA}`,
    'Cálculo del porcentaje de pensión según años cotizados',
    'Slider de edad de inicio de cotización',
    'Gráfico de evolución del porcentaje de pensión por años',
  ],
});

// ─── FAQPage: todas las cifras DERIVADAS de data/fiscal y del motor (hallazgo 2230) ──
// Hasta el 26/09/2026 publicaba la escala anterior a la Ley 27/2011 («25 años ≈ 80 %»,
// «un 3 % por año»). Ahora cada número sale de ./escala.ts, que lee pensiones.ts.

const [TRAMO_1, TRAMO_2] = TRAMOS_CRECIENTES;
const PCT_25_ANIOS = porcentajePension(25 * 12); // 72,80 con la escala de 2027
/** Meses para el 100 % el último año de la escala anterior, para contar el cambio. */
const MESES_PARA_CIEN_ANTERIOR = getEscalaPorcentajePension(ANIO_ESCALA - 1).mesesParaCien; // 438
const EJEMPLO_30 = ejemploInicio(30);
const EDAD_2026 = getEdadJubilacion(2026);
const EDAD_2027 = getEdadJubilacion(2027);
const edadTexto = (e: { anios: number; meses: number }) => aniosYMeses(e.anios * 12 + e.meses);
const BASE_EJEMPLO = 1500;
// Con el tramo LARGO (el del 0,19 %, 248 meses), que es donde está casi cualquier carrera;
// el del 0,18 % solo dura 16 meses. Hasta el 30/09/2026 era TRAMO_2, que entonces era el largo.
const EUROS_UN_ANIO = Math.round(BASE_EJEMPLO * TRAMO_1.porAnio) / 100; // 34,20 €
const puntos = (v: number) => formatNumber(v, 2);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `¿Cuántos años hay que cotizar para cobrar el ${pct(100, 0)} de la pensión en España?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Con la escala de la LGSS que rige para quien se jubila desde ${ANIO_ESCALA} (art. 210.1.b y disposición transitoria 9.ª), el ${pct(100, 0)} de la base reguladora se alcanza con ${aniosYMeses(MESES_PARA_CIEN)} cotizados (${MESES_PARA_CIEN} meses). Con ${ANIOS_ACCESO} años (${MESES_ACCESO} meses) se tiene derecho al ${pct(PCT_ACCESO, 0)}, y a partir de ahí cada mes suma ${puntos(TRAMO_1.porMes)} puntos entre el ${TRAMO_1.desde} y el ${TRAMO_1.hasta}, y ${puntos(TRAMO_2.porMes)} entre el ${TRAMO_2.desde} y el ${TRAMO_2.hasta}: con 25 años cotizados corresponde el ${pct(PCT_25_ANIOS, 2)}. Hasta ${ANIO_ESCALA - 1}, el ${pct(100, 0)} llegaba con ${aniosYMeses(MESES_PARA_CIEN_ANTERIOR)}. Con menos de ${ANIOS_ACCESO} años cotizados no hay derecho a pensión contributiva.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad se puede jubilar una persona en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `En 2026 la edad ordinaria de jubilación es de ${edadTexto(EDAD_2026.edadSinCotizacion)}, o de 65 años para quien acredite ${edadTexto(EDAD_2026.cotizacionPara65)} cotizados. Desde 2027 queda fijada en ${edadTexto(EDAD_2027.edadSinCotizacion)}, y para jubilarse a los 65 se exigen ${edadTexto(EDAD_2027.cotizacionPara65)} cotizados. La jubilación anticipada es posible hasta ${ANIOS_ANTICIPO_VOLUNTARIA} años antes de la edad ordinaria por voluntad propia (con al menos ${REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados} años cotizados) o hasta ${ANIOS_ANTICIPO_INVOLUNTARIA} años antes si es involuntaria (con al menos ${REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados}), con una reducción de la pensión por cada trimestre adelantado.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si empiezo a trabajar tarde y cotizo pocos años?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Empezar a cotizar tarde reduce los años cotizados y, con ellos, el porcentaje que se aplica a la base reguladora. Por ejemplo, quien empiece a trabajar a los 30 años y se jubile a los ${EDAD_ORDINARIA} habrá cotizado ${EJEMPLO_30.anios} años, ${frenteAlCien(EJEMPLO_30.meses)} ${aniosYMeses(MESES_PARA_CIEN)} que dan el ${pct(100, 0)}. Con 25 años cotizados, la pensión sería el ${pct(PCT_25_ANIOS, 2)} de la base reguladora. El visualizador permite comparar estas trayectorias de forma gráfica.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la base reguladora de la pensión de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base reguladora se calcula a partir de las bases de cotización de los últimos 25 años (300 meses), actualizadas por el IPC. Se divide la suma total entre 350. Es el importe mensual sobre el que se aplica el porcentaje según los años cotizados para obtener la pensión bruta. Cuanto más elevadas y estables sean las cotizaciones en esos 25 años, mayor será la base reguladora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena cotizar un año más para mejorar la pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Depende del punto de partida. Cada mes cotizado entre el ${TRAMO_1.desde} y el ${TRAMO_1.hasta} suma ${puntos(TRAMO_1.porMes)} puntos al porcentaje (${puntos(TRAMO_1.porAnio)} puntos por año completo) y cada mes entre el ${TRAMO_2.desde} y el ${TRAMO_2.hasta} suma ${puntos(TRAMO_2.porMes)} (${puntos(TRAMO_2.porAnio)} puntos por año). Con ${aniosYMeses(MESES_PARA_CIEN)} cotizados ya se está en el ${pct(100, 0)}, y un año más no sube el porcentaje. Sobre una base reguladora de ${formatCurrency(BASE_EJEMPLO)} al mes, ${puntos(TRAMO_1.porAnio)} puntos son ${formatCurrency(EUROS_UN_ANIO)} más de pensión bruta mensual.`,
      },
    },
  ],
};
