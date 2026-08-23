import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { RANGO_AJD, RANGO_ITP, calcularRegistro, estimarFacturaNotarial } from '@/data/itp-ccaa';
import { IVA_INMUEBLES_2025 } from '@/data/fiscal';

/**
 * Las cifras del FAQPage se DERIVAN del mismo motor que hace los cálculos.
 *
 * Escritas a mano se quedaron atrás cuando la página visible sí se corrigió, y el bloque que
 * consumen Bing Copilot, ChatGPT y Perplexity contradecía al simulador en tres números a la
 * vez: decía que el AJD va «entre el 0,5% y el 1,5%» cuando la app cobra 0 € en el País Vasco,
 * que el ITP está «habitualmente entre el 6% y el 10%» cuando cobra del 4% al 13%, y que el
 * Registro de una nave de 200.000 € cuesta «entre 400 € y 800 €» cuando su propio arancel da
 * 236,22 €. Derivándolas, esa divergencia deja de ser posible.
 */
const PRECIO_EJEMPLO = 200000;
const NOTARIA_EJEMPLO = estimarFacturaNotarial(PRECIO_EJEMPLO);
const REGISTRO_EJEMPLO = calcularRegistro(PRECIO_EJEMPLO);
const euros = (n: number) => `${Math.round(n)} €`;
const pct = (n: number) => `${String(n).replace('.', ',')}%`;

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Nave Industrial - IVA, ITP y Costes | meskeIA',
  description: 'Calcula los gastos de compra de una nave industrial en España: IVA 21%, ITP por comunidad autónoma, AJD, notaría y registro. Para empresas y autónomos. Gratis y sin registro.',
  keywords: 'simulador gastos compra nave industrial, gastos compraventa nave industrial, IVA nave industrial, ITP nave industrial, comprar nave impuestos, calculadora nave industrial españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Nave Industrial | meskeIA',
    description: 'Calcula el IVA 21%, ITP y gastos de compraventa de una nave industrial en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Nave Industrial | meskeIA',
    description: 'IVA 21%, ITP, notaría y registro en la compraventa de nave industrial. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Nave Industrial',
  description: 'Calculadora de gastos de compra de nave industrial en España. Incluye IVA 21% en obra nueva, ITP por comunidad autónoma en segunda mano, AJD, notaría y registro de la propiedad.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
  category: 'FinanceApplication',
  features: [
    'IVA 21% en nave industrial de nueva construcción',
    'ITP por comunidad autónoma en segunda mano',
    'AJD (Actos Jurídicos Documentados)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre deducibilidad del IVA para empresas',
    'Preconfigurado para nave industrial',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos nave industrial', 'IVA nave industrial', 'ITP nave industrial', 'compraventa nave', 'España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué impuesto paga la compra de una nave industrial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Si la nave es de nueva construcción y la vende el promotor, se paga IVA al ${pct(IVA_INMUEBLES_2025.local)} más AJD (Actos Jurídicos Documentados), que va del ${pct(RANGO_AJD.min)} al ${pct(RANGO_AJD.max)} según la comunidad autónoma. Si es una segunda transmisión (segunda mano), se paga ITP (Impuesto de Transmisiones Patrimoniales) al tipo general de la comunidad, que va del ${pct(RANGO_ITP.min)} al ${pct(RANGO_ITP.max)} contando el tramo más alto de las comunidades con escala progresiva. No pueden coexistir IVA e ITP en la misma operación, salvo que se renuncie a la exención de IVA en la segunda transmisión entre empresarios: entonces vuelve a haber IVA con inversión del sujeto pasivo y no se paga ITP. En Ceuta y Melilla la cuota se bonifica al 50% (art. 57 bis del TRLITPAJD), sea cual sea el uso del inmueble.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede una empresa deducirse el IVA de la compra de una nave industrial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Si el comprador es una empresa o autónomo que actúa en el ejercicio de su actividad económica y está sujeto a IVA, puede deducirse el IVA soportado en la compra de la nave, siempre que la nave se destine a la actividad. El porcentaje deducible depende del porcentaje de afectación a la actividad. Esta deducibilidad no existe con el ITP, que es un gasto no recuperable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta la notaría y el registro en la compra de una nave industrial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Los honorarios notariales y registrales se calculan sobre el valor escriturado según aranceles oficiales. Para una nave de 200.000 €, la notaría sale por unos ${euros(NOTARIA_EJEMPLO.min)} a ${euros(NOTARIA_EJEMPLO.max)} y el Registro de la Propiedad por unos ${euros(REGISTRO_EJEMPLO)}. Los aranceles son decrecientes: el porcentaje baja a medida que sube el precio de la operación.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia comprar una nave industrial de comprar un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fiscalmente, tanto nave industrial como local comercial tienen el mismo tratamiento: IVA 21% en primera transmisión e ITP al tipo general en segunda mano. La diferencia práctica está en el uso (industrial vs. comercial o de oficinas) y en la calificación urbanística, que determina qué actividades pueden realizarse. La superficie, la normativa de seguridad industrial y los servicios disponibles también difieren habitualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué comunidad autónoma tiene el ITP más bajo para la compra de una nave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El País Vasco aplica uno de los tipos más bajos (en torno al 4%-6% según territorio histórico). Madrid aplica el 6%, y otras comunidades como Castilla y León o Aragón tienen tipos en el rango del 7%-8%. Cataluña y Comunidad Valenciana se encuentran entre las que aplican tipos más altos, llegando al 10%-11%. Estos tipos pueden variar y se recomienda consultar la normativa vigente de cada comunidad.',
      },
    },
  ],
};
