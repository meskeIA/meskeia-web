import { Metadata } from 'next';
import {
  PENSIONES_MINIMAS_2026, COMPLEMENTO_MINIMOS_LIMITES_2026, TOPE_COMPLEMENTO_MINIMOS_2026,
  FISCAL_PENSIONES_META,
} from '@/data/fiscal';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_PENSIONES_META.vigencia;

/**
 * Las cuantías del FAQPage salen de @/data/fiscal, no tecleadas.
 *
 * ⚠️ 2026-09-21 (hallazgo 1102 del Inspector): estaban escritas a mano y NINGUNA
 *    coincidía con el módulo —«ronda los 1.020 €» frente a 1.256,60; «en torno a 835»
 *    frente a 888,70; el límite «en 2025, alrededor de 8.942 €» frente a 9.442—, de modo
 *    que el FAQPage contradecía a la tabla que la propia página imprime tres pantallas
 *    más abajo. Es lo que leen Bing Copilot, ChatGPT y Perplexity para grounding.
 */
const eur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const minimo = (subtipo: string, campo: 'conConyuge' | 'sinConyuge' | 'unipersonal') =>
  eur(PENSIONES_MINIMAS_2026.find(e => e.tipo === 'jubilacion' && e.subtipo === subtipo)![campo]);

/** La fecha desde la que rige el tope (art. 9.5), sacada del dato y no tecleada. */
const fechaTope = TOPE_COMPLEMENTO_MINIMOS_2026.causadasDesde.split('-').reverse().join('/');

const title = `Estimador de Complemento a Mínimos ${anio} — Pensión mínima garantizada | meskeIA`;
const description = 'Estima si tienes derecho al complemento a mínimos de la Seguridad Social. Pensiones mínimas 2026 por tipo (jubilación, viudedad, incapacidad), edad y situación familiar.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'complemento a minimos 2026, pension minima seguridad social, pension minima jubilacion, pension minima viudedad, complemento minimos requisitos, pension minima incapacidad permanente',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Estimador de Complemento a Mínimos ${anio} | meskeIA`,
    description,
    url: 'https://meskeia.com/estimador-complemento-minimos/',
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
    title: `Estimador de Complemento a Mínimos ${anio} | meskeIA`,
    description: 'Pensiones mínimas 2026: calcula si tienes derecho al complemento a mínimos de la SS',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Complemento a Mínimos meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimador de Complemento a Mínimos 2026',
  description,
  url: 'https://meskeia.com/estimador-complemento-minimos/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el complemento a mínimos de la Seguridad Social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El complemento a mínimos es una prestación adicional que la Seguridad Social abona a los pensionistas cuya pensión contributiva no alcanza el importe mínimo establecido para cada modalidad. Su objetivo es garantizar que ningún pensionista perciba una cantidad inferior a la pensión mínima legal, que varía según el tipo de pensión, la edad del titular y su situación familiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos para cobrar el complemento a mínimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Para tener derecho al complemento a mínimos es necesario que la pensión contributiva reconocida sea inferior a la cuantía mínima del año en curso, residir en España y no superar el límite de ingresos: en 2026, ${eur(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)} € anuales de rentas distintas de la propia pensión —sueldos y demás rendimientos del trabajo, capital, actividades económicas y ganancias patrimoniales—, o ${eur(COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge)} € contando también los del cónyuge a cargo. Superar el límite no siempre deja sin complemento: el art. 9.2 del RD 241/2026 reconoce la diferencia cuando la suma de rentas y pensión queda por debajo de la suma del límite y la cuantía mínima anual. El complemento alcanza a la jubilación, a la viudedad y a la incapacidad permanente en todos sus grados, incluida la gran incapacidad, que tiene cuantías mínimas propias, igual que la jubilación a los 65 años que procede de ella.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto es la pensión mínima de jubilación en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `En 2026, la pensión mínima de jubilación a partir de los 65 años es de ${minimo('65_o_mas', 'conConyuge')} € al mes con cónyuge a cargo, ${minimo('65_o_mas', 'unipersonal')} € en unidad unipersonal y ${minimo('65_o_mas', 'sinConyuge')} € con cónyuge no a cargo, siempre en 14 pagas. Para menores de 65 años son ${minimo('menos_65', 'conConyuge')} €, ${minimo('menos_65', 'unipersonal')} € y ${minimo('menos_65', 'sinConyuge')} € respectivamente. Los importes los fija cada año el real decreto de revalorización: los de 2026 vienen del Anexo I del RD 241/2026.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿El complemento a mínimos se aplica también a pensiones de viudedad e incapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El complemento a mínimos se puede aplicar a jubilación, incapacidad permanente (total, absoluta y gran incapacidad) y viudedad, siempre que la pensión reconocida quede por debajo del mínimo correspondiente a cada modalidad. Los importes mínimos difieren: por ejemplo, la pensión mínima de viudedad con cargas familiares es superior a la de viudedad sin cargas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula si tengo derecho al complemento a mínimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El cálculo compara tu pensión contributiva bruta con la cuantía mínima legal para tu tipo de pensión y situación familiar: si tu pensión es inferior, la diferencia es el complemento. Después se miran tus rentas anuales, excluida la propia pensión. Por debajo del límite (${eur(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)} € en 2026) el complemento es íntegro; por encima no se pierde de golpe, sino que se reconoce la diferencia entre lo que sumas —rentas más pensión— y la suma del límite más la cuantía mínima anual, hasta que esa diferencia llega a cero. En las pensiones causadas desde el ${fechaTope} el complemento tiene además un tope, la pensión no contributiva del año. El estimador automatiza los dos pasos a partir de tu pensión reconocida, el tipo de prestación, la edad y la situación de convivencia.`,
      },
    },
    {
      // Hallazgo 2803 (03/10/2026): la página no nombraba el tope ni lo aplicaba.
      '@type': 'Question',
      name: '¿Tiene tope el complemento a mínimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Sí, en las pensiones causadas desde el ${fechaTope}: el complemento no puede superar la pensión de jubilación e incapacidad en su modalidad no contributiva del año, que en 2026 es de ${eur(TOPE_COMPLEMENTO_MINIMOS_2026.pncAnual)} € anuales (${eur(TOPE_COMPLEMENTO_MINIMOS_2026.sinConyugeMensual)} € al mes en 14 pagas). Con cónyuge a cargo, el tope es la pensión no contributiva de una unidad con dos beneficiarios: ${eur(TOPE_COMPLEMENTO_MINIMOS_2026.conConyugeAnual)} € anuales (${eur(TOPE_COMPLEMENTO_MINIMOS_2026.conConyugeMensual)} € al mes). Lo fijan los arts. 9.5 y 10.4 del RD 241/2026 y el art. 59.4 LGSS. Con una pensión muy baja, la pensión final puede quedarse por debajo del mínimo. No tienen tope las pensiones causadas antes del ${fechaTope} ni la gran incapacidad que cobra el complemento para la persona que atiende al pensionista (art. 9.7).`,
      },
    },
  ],
};
