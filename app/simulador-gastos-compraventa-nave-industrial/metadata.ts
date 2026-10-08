import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  CIUDADES_CON_BONIFICACION,
  ComunidadAutonoma,
  ITP_CCAA,
  RANGO_AJD_OTROS,
  RANGO_ITP_OTROS,
  tipoGeneralITP,
  calcularRegistro,
  estimarFacturaNotarial,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
  nombreEnFrase,
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
const pct = (n: number) => `${String(n).replace('.', ',')}\u00A0%`;

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
 * El tipo general de una NAVE en cada comunidad, no el de la vivienda: en el País Vasco la
 * nave paga el 7 % y la vivienda el 4 %, y hasta el 24/09/2026 este ranking coronaba a la
 * nave vasca con el 4 % de la vivienda (hallazgo 1582). Sale de `tipoGeneralITP` del motor,
 * con el objeto `'otro'` que es el de la app.
 */
const generalNave = (clave: ComunidadAutonoma) => tipoGeneralITP(clave, 'otro', 0);

/** Las comunidades con tipo de AJD propio de la renuncia VERIFICADO en su norma (motor). */
const CCAA_CON_AJD_DE_RENUNCIA = (Object.keys(ITP_CCAA) as ComunidadAutonoma[])
  .filter((clave) => ITP_CCAA[clave].ajdRenuncia !== undefined)
  .map(nombreEnFrase);

/**
 * Las dos preguntas que la FAQ visible y el FAQPage hacían por separado, con dos respuestas
 * escritas aparte (hallazgos 3085 y 3086, 08/10/2026): cada boca callaba lo que daba la otra, y la
 * del FAQPage sobre el IVA deducible omitía que una actividad exenta no deduce. UNA constante que
 * importan las dos, como en app/simulador-gastos-compraventa-garaje.
 */
export const PREGUNTA_IMPUESTO_COMPRA = '¿Se paga IVA o ITP al comprar una nave industrial?';
export const RESPUESTA_IMPUESTO_COMPRA = `Depende del tipo de transmisión, y nunca se pagan los dos a la vez. Si la nave es de nueva construcción y la vende el promotor (primera entrega), se paga IVA al ${pct(IVA_INMUEBLES_2025.local)} más AJD (Actos Jurídicos Documentados), que va del ${pct(RANGO_AJD_OTROS.min)} al ${pct(RANGO_AJD_OTROS.max)} según la comunidad autónoma; en Ceuta y Melilla se paga la mitad (bonificación del ${BONIFICACION_PCT} de la cuota, art. 57 bis.1 del TRLITPAJD). Si es de segunda mano, se paga ITP (Impuesto de Transmisiones Patrimoniales) al tipo general de la comunidad, que va del ${pct(RANGO_ITP_OTROS.min)} al ${pct(RANGO_ITP_OTROS.max)} contando el tramo más alto de las comunidades con escala progresiva. Con una salvedad que en naves industriales es frecuente: la segunda transmisión está exenta de IVA, pero cuando comprador y vendedor son empresarios con derecho a deducción es habitual renunciar a esa exención. Entonces la operación vuelve al IVA, con inversión del sujeto pasivo (lo declara el comprador), y no se paga ITP, aunque el AJD suele ir a un tipo incrementado en muchas comunidades. El simulador lo contempla en su opción «2ª mano con renuncia al IVA» y aplica el AJD propio de la renuncia donde está verificado en su norma (${CCAA_CON_AJD_DE_RENUNCIA.join(', ')}); en las demás usa el general, así que conviene contrastarlo con tu asesor. En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos: por eso el simulador no calcula ahí el impuesto de la obra nueva, ni en Canarias el de la renuncia, que allí es a la exención del IGIC (art. 50.Cinco de la Ley canaria 4/2012). En Ceuta y Melilla el IPSI no admite la renuncia (Ley 8/1991, arts. 7 y 20.3), así que la segunda mano paga siempre ITP, cuya cuota se bonifica al ${BONIFICACION_PCT} (art. 57 bis del TRLITPAJD), sea cual sea el uso del inmueble.`;
export const PREGUNTA_IVA_DEDUCIBLE = '¿Es deducible el IVA en la compra de una nave industrial?';
export const RESPUESTA_IVA_DEDUCIBLE = 'Sí, si el comprador es un sujeto pasivo de IVA (empresa o autónomo) y destina la nave a una actividad económica sujeta y no exenta de IVA: el IVA soportado se deduce en el modelo 303, y el porcentaje deducible depende del grado de afectación de la nave a esa actividad. Si la actividad está exenta de IVA (por ejemplo, la sanitaria o la educativa), no es deducible. Con el ITP no existe esta posibilidad: es un gasto no recuperable.';

/**
 * El extremo alto de cada comunidad: su tipo general, el último tramo si tiene escala, o el
 * tipo de su umbral (Valencia: el 11 % por encima del millón, sobre TODO el valor; hallazgo
 * 1581). Sin esto la quinta pregunta hablaba de «10%-11%» mientras la app cobraba el 11,50 %
 * efectivo en Cataluña y el 11,00 % en Baleares (hallazgo 449).
 */
const techoDe = (clave: ComunidadAutonoma) => {
  const c = ITP_CCAA[clave];
  return efectivo(
    clave,
    Math.max(
      generalNave(clave),
      ...(c.tramosProgresivos ?? []).map((t) => t.tipo),
      ...(c.umbralTipoUnico ? [c.umbralTipoUnico.tipo] : [])
    )
  );
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
  return efectivo(clave, Math.min(generalNave(clave), ...(c.tramosProgresivos ?? []).map((t) => t.tipo)));
};

const CLAVES = Object.keys(ITP_CCAA) as ComunidadAutonoma[];
const rotulo = (clave: ComunidadAutonoma, tipo: number) =>
  CIUDADES_CON_BONIFICACION.includes(clave)
    ? `${nombreEnFrase(clave)} (${pct(tipo)} efectivo, ya bonificado)`
    : `${nombreEnFrase(clave)} (${pct(tipo)})`;

/**
 * Las tres primeras según `valor`, y con ellas las EMPATADAS con la tercera: cortar a tres
 * dentro de un empate nombraba a una comunidad y callaba a otra con el mismo tipo (con el 7 %
 * vasco fuera del podio, Madrid y Navarra empatan al 6 %).
 */
const podio = (valor: (c: ComunidadAutonoma) => number, ascendente: boolean) => {
  const ordenadas = CLAVES.slice().sort((a, b) => (ascendente ? valor(a) - valor(b) : valor(b) - valor(a)));
  const corte = valor(ordenadas[Math.min(2, ordenadas.length - 1)]);
  return ordenadas.filter((c) => (ascendente ? valor(c) <= corte : valor(c) >= corte));
};

const masBaratas = podio(sueloDe, true)
  .map((clave) => rotulo(clave, sueloDe(clave)))
  .join(', ');
const masCaras = podio(techoDe, false)
  .map((clave) => `${nombreEnFrase(clave)} (hasta el ${pct(techoDe(clave))})`)
  .join(', ');

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Nave Industrial - IVA, ITP y Costes | meskeIA',
  description: `Calcula los gastos de compra de una nave industrial en España: IVA ${IVA_INMUEBLES_2025.local}\u00A0%, ITP por comunidad autónoma, AJD, notaría y registro. Para empresas y autónomos. Gratis y sin registro.`,
  keywords: 'simulador gastos compra nave industrial, gastos compraventa nave industrial, IVA nave industrial, ITP nave industrial, comprar nave impuestos, calculadora nave industrial españa, escriturar nave, cuanto cuesta escriturar',
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
    description: `Calcula el IVA ${IVA_INMUEBLES_2025.local}\u00A0%, ITP y gastos de compraventa de una nave industrial en España.`,
    url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Nave Industrial | meskeIA',
    description: `IVA ${IVA_INMUEBLES_2025.local}\u00A0%, ITP, notaría y registro en la compraventa de nave industrial. Calcula gratis.`,
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Nave Industrial',
  description: `Calculadora de gastos de compra de nave industrial en España. Incluye IVA ${IVA_INMUEBLES_2025.local}\u00A0% en obra nueva, ITP por comunidad autónoma en segunda mano, AJD, notaría y registro de la propiedad.`,
  url: 'https://meskeia.com/simulador-gastos-compraventa-nave-industrial/',
  category: 'FinanceApplication',
  features: [
    `IVA ${IVA_INMUEBLES_2025.local}\u00A0% en nave industrial de nueva construcción`,
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
      name: preguntaEscriturar(CASOS_ESCRITURAR.nave.inmueble),
      acceptedAnswer: {
        '@type': 'Answer',
        text: respuestaEscriturar(CASOS_ESCRITURAR.nave),
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_IMPUESTO_COMPRA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_IMPUESTO_COMPRA,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_IVA_DEDUCIBLE,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_IVA_DEDUCIBLE,
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
        text: `Fiscalmente, tanto nave industrial como local comercial tienen el mismo tratamiento: IVA ${IVA_INMUEBLES_2025.local}\u00A0% en primera transmisión e ITP al tipo general en segunda mano. La diferencia práctica está en el uso (industrial vs. comercial o de oficinas) y en la calificación urbanística, que determina qué actividades pueden realizarse. La superficie, la normativa de seguridad industrial y los servicios disponibles también difieren habitualmente.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué comunidad autónoma tiene el ITP más bajo para la compra de una nave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Para una nave, los tipos generales de ITP van del ${pct(RANGO_ITP_OTROS.min)} al ${pct(RANGO_ITP_OTROS.max)} contando el tramo más alto de las comunidades con escala progresiva. Los más bajos hoy son ${masBaratas}: Ceuta y Melilla salen primeras porque su cuota se bonifica un ${BONIFICACION_PCT} (art. 57 bis del TRLITPAJD), lo que deja su ${pct(generalNave('ceuta'))} general en el ${pct(sueloDe('ceuta'))} efectivo. El País Vasco no está entre ellas para una nave: su ${pct(tipoGeneralITP('pais-vasco', 'vivienda', 0))} es el de la vivienda, y el resto de inmuebles paga el ${pct(generalNave('pais-vasco'))}. Los más altos, ${masCaras}. Una nave no tiene tipos reducidos por perfil del comprador —esos van ligados a la vivienda habitual—, así que se aplica el tipo general del sitio donde esté el inmueble, salvo donde la comunidad liga un tipo reducido a la actividad: en Aragón, el inmueble que se adquiere para iniciar una actividad económica (art. 121-11 de su texto refundido de tributos cedidos). Estos tipos los fija cada comunidad y cambian: conviene comprobar la normativa vigente antes de firmar.`,
      },
    },
  ],
};
