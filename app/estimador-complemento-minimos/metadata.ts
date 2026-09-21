import { Metadata } from 'next';
import { PENSIONES_MINIMAS_2026, COMPLEMENTO_MINIMOS_LIMITES_2026 } from '@/data/fiscal';

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

const title = 'Estimador de Complemento a Mínimos 2026 — Pensión mínima garantizada | meskeIA';
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
    title: 'Estimador de Complemento a Mínimos 2026 | meskeIA',
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
    title: 'Estimador de Complemento a Mínimos 2026 | meskeIA',
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
        text: `Para tener derecho al complemento a mínimos es necesario que la pensión contributiva reconocida sea inferior a la cuantía mínima del año en curso, residir en España y no superar el límite de ingresos: en 2026, ${eur(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)} € anuales de rentas distintas de la propia pensión, o ${eur(COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge)} € contando también los del cónyuge a cargo. Superar el límite no siempre deja sin complemento: el art. 9.2 del RD 241/2026 reconoce la diferencia cuando la suma de rentas y pensión queda por debajo de la suma del límite y la cuantía mínima anual. El complemento alcanza a la jubilación, a la viudedad y a la incapacidad permanente en todos sus grados, incluida la gran invalidez, que tiene cuantías mínimas propias.`,
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
        text: 'Sí. El complemento a mínimos se puede aplicar a jubilación, incapacidad permanente (total, absoluta y gran invalidez) y viudedad, siempre que la pensión reconocida quede por debajo del mínimo correspondiente a cada modalidad. Los importes mínimos difieren: por ejemplo, la pensión mínima de viudedad con cargas familiares es superior a la de viudedad sin cargas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula si tengo derecho al complemento a mínimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El cálculo compara tu pensión contributiva bruta con la cuantía mínima legal para tu tipo de pensión y situación familiar: si tu pensión es inferior, la diferencia es el complemento. Después se miran tus rentas anuales, excluida la propia pensión. Por debajo del límite (${eur(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)} € en 2026) el complemento es íntegro; por encima no se pierde de golpe, sino que se reconoce la diferencia entre lo que sumas —rentas más pensión— y la suma del límite más la cuantía mínima anual, hasta que esa diferencia llega a cero. El estimador automatiza los dos pasos a partir de tu pensión reconocida, el tipo de prestación, la edad y la situación de convivencia.`,
      },
    },
  ],
};
