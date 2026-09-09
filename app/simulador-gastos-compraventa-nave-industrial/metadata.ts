import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  CIUDADES_CON_BONIFICACION,
  ComunidadAutonoma,
  ITP_CCAA,
  RANGO_AJD,
  RANGO_ITP,
  calcularRegistro,
  estimarFacturaNotarial,
} from '@/data/itp-ccaa';
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

/** El 50 % del art. 57 bis, DERIVADO de la constante que aplica el motor (hallazgo 650). */
const BONIFICACION_PCT = pct(BONIFICACION_CUOTA_CEUTA_MELILLA * 100);

/**
 * Tipo EFECTIVO: el nominal de la tabla con la bonificación de cuota ya descontada donde la
 * hay. `calcularITP` la aplica por el SITIO del inmueble, así que un ranking que la ignore
 * no ordena lo que la app cobra.
 */
const efectivo = (clave: ComunidadAutonoma, tipo: number) =>
  CIUDADES_CON_BONIFICACION.includes(clave) ? tipo * (1 - BONIFICACION_CUOTA_CEUTA_MELILLA) : tipo;

/**
 * El extremo alto de cada comunidad: su tipo general, o el último tramo si tiene escala.
 * Sin esto la quinta pregunta hablaba de «10%-11%» mientras la app cobraba el 11,50 %
 * efectivo en Cataluña y el 11,00 % en Baleares (hallazgo 449).
 */
const techoDe = (clave: ComunidadAutonoma) => {
  const c = ITP_CCAA[clave];
  return efectivo(clave, Math.max(c.tipoGeneral, ...(c.tramosProgresivos ?? []).map((t) => t.tipo)));
};

/**
 * El extremo bajo, SIMÉTRICO del anterior: el primer tramo de la escala si la hay, y la
 * bonificación descontada donde la hay.
 *
 * Sin él, el suelo salía de `tipoGeneral` a secas y la respuesta se contradecía sola: coronaba
 * al País Vasco (4%) como el ITP más bajo mientras la app cobraba el 3% efectivo en Ceuta y
 * Melilla —15.000 € por una nave de 500.000 €— y el propio párrafo anunciaba la bonificación
 * dos frases más abajo (hallazgo 646). Es el defecto simétrico del hallazgo C del 27/08/2026,
 * que corrigió el techo y dejó el suelo sin tocar.
 */
const sueloDe = (clave: ComunidadAutonoma) => {
  const c = ITP_CCAA[clave];
  return efectivo(clave, Math.min(c.tipoGeneral, ...(c.tramosProgresivos ?? []).map((t) => t.tipo)));
};

const CLAVES = Object.keys(ITP_CCAA) as ComunidadAutonoma[];
const rotulo = (clave: ComunidadAutonoma, tipo: number) =>
  CIUDADES_CON_BONIFICACION.includes(clave)
    ? `${ITP_CCAA[clave].nombre} (${pct(tipo)} efectivo, ya bonificado)`
    : `${ITP_CCAA[clave].nombre} (${pct(tipo)})`;

const masBaratas = CLAVES.slice()
  .sort((a, b) => sueloDe(a) - sueloDe(b))
  .slice(0, 3)
  .map((clave) => rotulo(clave, sueloDe(clave)))
  .join(', ');
const masCaras = CLAVES.slice()
  .sort((a, b) => techoDe(b) - techoDe(a))
  .slice(0, 3)
  .map((clave) => `${ITP_CCAA[clave].nombre} (hasta el ${pct(techoDe(clave))})`)
  .join(', ');

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Nave Industrial - IVA, ITP y Costes | meskeIA',
  description: `Calcula los gastos de compra de una nave industrial en España: IVA ${IVA_INMUEBLES_2025.local}%, ITP por comunidad autónoma, AJD, notaría y registro. Para empresas y autónomos. Gratis y sin registro.`,
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
    description: `Calcula el IVA ${IVA_INMUEBLES_2025.local}%, ITP y gastos de compraventa de una nave industrial en España.`,
    url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Nave Industrial | meskeIA',
    description: `IVA ${IVA_INMUEBLES_2025.local}%, ITP, notaría y registro en la compraventa de nave industrial. Calcula gratis.`,
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Nave Industrial',
  description: `Calculadora de gastos de compra de nave industrial en España. Incluye IVA ${IVA_INMUEBLES_2025.local}% en obra nueva, ITP por comunidad autónoma en segunda mano, AJD, notaría y registro de la propiedad.`,
  url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
  category: 'FinanceApplication',
  features: [
    `IVA ${IVA_INMUEBLES_2025.local}% en nave industrial de nueva construcción`,
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
        text: `Si la nave es de nueva construcción y la vende el promotor, se paga IVA al ${pct(IVA_INMUEBLES_2025.local)} más AJD (Actos Jurídicos Documentados), que va del ${pct(RANGO_AJD.min)} al ${pct(RANGO_AJD.max)} según la comunidad autónoma. Si es una segunda transmisión (segunda mano), se paga ITP (Impuesto de Transmisiones Patrimoniales) al tipo general de la comunidad, que va del ${pct(RANGO_ITP.min)} al ${pct(RANGO_ITP.max)} contando el tramo más alto de las comunidades con escala progresiva. No pueden coexistir IVA e ITP en la misma operación, salvo que se renuncie a la exención de IVA en la segunda transmisión entre empresarios: entonces vuelve a haber IVA con inversión del sujeto pasivo y no se paga ITP. En Ceuta y Melilla la cuota se bonifica al ${BONIFICACION_PCT} (art. 57 bis del TRLITPAJD), sea cual sea el uso del inmueble.`,
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
        text: `Fiscalmente, tanto nave industrial como local comercial tienen el mismo tratamiento: IVA ${IVA_INMUEBLES_2025.local}% en primera transmisión e ITP al tipo general en segunda mano. La diferencia práctica está en el uso (industrial vs. comercial o de oficinas) y en la calificación urbanística, que determina qué actividades pueden realizarse. La superficie, la normativa de seguridad industrial y los servicios disponibles también difieren habitualmente.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué comunidad autónoma tiene el ITP más bajo para la compra de una nave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Los tipos generales de ITP van del ${pct(RANGO_ITP.min)} al ${pct(RANGO_ITP.max)} contando el tramo más alto de las comunidades con escala progresiva. Para una nave, los más bajos hoy son ${masBaratas}: Ceuta y Melilla salen primeras porque su cuota se bonifica un ${BONIFICACION_PCT} (art. 57 bis del TRLITPAJD), lo que deja su ${pct(ITP_CCAA.ceuta.tipoGeneral)} general en el ${pct(sueloDe('ceuta'))} efectivo. Los más altos, ${masCaras}. Una nave no tiene tipos reducidos por perfil del comprador —esos van ligados a la vivienda habitual—, así que se aplica el tipo general del sitio donde esté el inmueble. Estos tipos los fija cada comunidad y cambian: conviene comprobar la normativa vigente antes de firmar.`,
      },
    },
  ],
};
