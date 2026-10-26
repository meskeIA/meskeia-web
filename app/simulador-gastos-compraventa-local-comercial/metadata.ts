import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  ITP_CCAA,
  RANGO_AJD_OTROS,
  RANGO_ITP_OTROS,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  CASOS_ESCRITURAR,
  preguntaEscriturar,
  respuestaEscriturar,
  // La salvedad del no residente en la plusvalía, art. 106.2 TRLRHL (hallazgo 3472, cabo C0354).
  SALVEDAD_PLUSVALIA_NO_RESIDENTE,
} from '@/data/itp-ccaa';
// El tope y el plazo de la renta vitalicia de los mayores de 65 (art. 38.3 LIRPF), del módulo y no
// tecleados (hallazgo 3518, efecto familia del 3499 de la referencia).
import { IVA_INMUEBLES_2025, TRAMOS_GANANCIAS_PATRIMONIALES_2025, EXENCION_RENTA_VITALICIA_MAYORES_65 } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

/**
 * El `%` separado de la cifra por un espacio DURO (CLAUDE.md global §2, desde el 25/09/2026):
 * en la meta description y el JSON-LD iba pegado en 17 sitios (hallazgo 2202). El JSON-LD es lo
 * que leen los asistentes de IA, y ahí la cifra se cita tal cual.
 */
const PCT = '\u00A0%';

/** Los rangos que cita el JSON-LD se DERIVAN de la tabla: escritos a mano contradecían al
 *  panel, que muestra «AJD 0 %» en el País Vasco y el 0,25 % efectivo de Ceuta y Melilla
 *  tras la bonificación (hallazgo 622). */
const AJD_MIN = formatNumber(RANGO_AJD_OTROS.min, 1);
const AJD_MAX = formatNumber(RANGO_AJD_OTROS.max, 1);
/**
 * ⚠️ 24/09/2026 (hallazgos 1582, 1583 y 1603): los rangos son los de lo que NO es vivienda. El
 * 4 % de ITP y el 0 % de AJD del País Vasco son de la vivienda: un local paga allí el 7 % y el
 * 0,5 %, y el FAQPage decía «el País Vasco no lo cobra». El AJD de la renuncia de Valencia (2 %)
 * es el único tipo de renuncia verificado, y se lee de la tabla.
 */
const AJD_RENUNCIA_VALENCIA = formatNumber(ITP_CCAA.valencia.ajdRenuncia ?? ITP_CCAA.valencia.ajd, 0);

/** Y por la misma razón el rango del ITP, que la pregunta del ITP tenía escrito a mano
 *  («del 4% al 10%-11%») mientras la primera pregunta del MISMO bloque ya lo derivaba y
 *  decía «del 4% al 13%» — el 13 % que la propia app cobra en el tramo alto de Baleares y
 *  de Cataluña (hallazgo 665). */
const ITP_MIN = formatNumber(RANGO_ITP_OTROS.min, 0);
const ITP_MAX = formatNumber(RANGO_ITP_OTROS.max, 0);

/** Extremos de la base del ahorro, derivados de la tabla con la que la app calcula el
 *  IRPF de la ganancia (`calcularGananciaInmueble`), en vez de teclearlos (hallazgo 667). */
const AHORRO_MIN = formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo, 0);
const AHORRO_MAX = formatNumber(TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo, 0);

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Local Comercial - IVA, ITP, Plusvalía e IRPF | meskeIA',
  description: `Calcula los gastos de compra y venta de un local comercial en España. Si compras: IVA ${IVA_INMUEBLES_2025.local}${PCT} en obra nueva, ITP en segunda mano, renuncia a la exención de IVA (inversión del sujeto pasivo), AJD, notaría y registro. Si vendes: plusvalía municipal, IRPF de la ganancia y neto que recibes. Gratis y sin registro.`,
  keywords: 'simulador gastos compra local comercial, simulador gastos venta local comercial, calculadora gastos venta local comercial, gastos compraventa local, IVA local comercial, ITP local comercial, renuncia exencion IVA local, inversion sujeto pasivo local, plusvalia venta local comercial, irpf venta local, calculadora local comercial españa, escriturar local, cuanto cuesta escriturar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compraventa Local Comercial | meskeIA',
    description: 'Calcula el IVA, ITP y la renuncia a la exención si compras; la plusvalía municipal y el IRPF si vendes un local comercial en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compraventa Local Comercial | meskeIA',
    description: 'IVA, ITP, renuncia a la exención, plusvalía municipal e IRPF en la compraventa de un local comercial. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compraventa Local Comercial',
  description: `Calculadora de gastos de compra y venta de local comercial en España. Para el comprador: IVA ${IVA_INMUEBLES_2025.local}${PCT} en obra nueva, ITP por comunidad autónoma en segunda mano, renuncia a la exención de IVA con inversión del sujeto pasivo, AJD, notaría y registro. Para el vendedor: plusvalía municipal, IRPF sobre la ganancia patrimonial (con corrección por amortizaciones si el local estuvo afecto a una actividad o alquilado) y neto resultante.`,
  url: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
  category: 'FinanceApplication',
  features: [
    `IVA ${IVA_INMUEBLES_2025.local}${PCT} en local comercial de nueva construcción`,
    'ITP por comunidad autónoma en segunda mano',
    'Renuncia a la exención de IVA (inversión del sujeto pasivo)',
    'AJD (Actos Jurídicos Documentados)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre deducibilidad del IVA para empresas y autónomos',
    'Vendedor: plusvalía municipal (IIVTNU) por método objetivo y real',
    'Vendedor: IRPF de la ganancia patrimonial y neto tras impuestos',
    'Corrección del valor de adquisición por amortizaciones (local afecto a actividad o alquilado)',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos local comercial', 'IVA local comercial', 'ITP local comercial', 'renuncia exención IVA', 'gastos venta local comercial', 'plusvalía venta local', 'compraventa local', 'España'],
});

/**
 * Respuesta ÚNICA a «qué impuesto se paga al comprar», la que leen el FAQPage y la FAQ visible de
 * page.tsx (hallazgo 2968): antes eran dos textos y cada uno callaba lo que daba el otro. Y dice,
 * como el resto de la familia (garaje, trastero, nave, solar, rústico), que en Canarias, Ceuta y
 * Melilla no rige el IVA sino el IGIC o el IPSI (hallazgo 2967), y que la renuncia no existe en
 * Ceuta y Melilla (la app ya la deshabilita allí: hallazgo 1584).
 */
export const RESPUESTA_IMPUESTO_COMPRA = `Depende del tipo de transmisión. Si el local es de nueva construcción y lo vende el promotor (primera entrega), se paga IVA al ${IVA_INMUEBLES_2025.local}${PCT} más AJD (del ${AJD_MIN}${PCT} al ${AJD_MAX}${PCT} según la comunidad autónoma). En Canarias, Ceuta y Melilla no rige el IVA sino el IGIC o el IPSI, con sus propios tipos, y por eso el simulador no calcula ahí el impuesto de la obra nueva, ni en Canarias el de la renuncia, que allí es a la exención del IGIC (art. 50.Cinco de la Ley canaria 4/2012); en Ceuta y Melilla el AJD se paga con la bonificación del ${formatNumber(BONIFICACION_CUOTA_CEUTA_MELILLA * 100, 0)}${PCT} de la cuota (art. 57 bis.1 TRLITPAJD). Si es una segunda transmisión, por regla general está exenta de IVA y se paga ITP al tipo general de la comunidad, que va del ${ITP_MIN}${PCT} al ${ITP_MAX}${PCT} (en Ceuta y Melilla se paga la mitad, por la bonificación del ${formatNumber(BONIFICACION_CUOTA_CEUTA_MELILLA * 100, 0)}${PCT} de la cuota del artículo 57 bis.3.a del TRLITPAJD). La excepción es la renuncia a la exención, que puede hacer el vendedor empresario cuando el comprador es un empresario o profesional con derecho a deducir el IVA, y que no existe en Ceuta y Melilla. No coinciden IVA e ITP en la misma operación.`;

/**
 * Respuesta ÚNICA a «qué es la renuncia», por la misma razón que la de arriba (hallazgo 3063): eran
 * dos textos, y la reparación del 2967 tuvo que añadir la salvedad de Ceuta y Melilla dos veces. Y
 * dice que en Canarias la renuncia es a la exención del IGIC (hallazgo 3064), como el botón, el
 * aviso y la tarjeta de la propia app, y como nave y terreno rústico.
 */
export const PREGUNTA_RENUNCIA = '¿Qué es la renuncia a la exención de IVA y a quién le interesa?';
export const RESPUESTA_RENUNCIA = `La segunda transmisión de un inmueble está exenta de IVA (artículo 20.Uno.22.º de la Ley del IVA), por lo que tributa por ITP. Sin embargo, si el vendedor es empresario o profesional y el comprador también lo es y tiene derecho a deducir el IVA, el vendedor puede renunciar a esa exención (artículo 20.Dos, que el derecho a deducir solo se lo exige al comprador). Entonces la operación pasa a tributar por IVA al ${IVA_INMUEBLES_2025.local}${PCT} en lugar de ITP, con inversión del sujeto pasivo: es el comprador quien autoliquida y, si tiene derecho, deduce el IVA. Interesa a ese comprador, porque el ITP es un coste no recuperable. En Canarias la renuncia existe igual, pero a la exención del IGIC (art. 50.Cinco de la Ley canaria 4/2012), que el simulador no calcula. La renuncia no existe en Ceuta y Melilla, donde la ley del IPSI no la regula.`;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: preguntaEscriturar(CASOS_ESCRITURAR.local.inmueble),
      acceptedAnswer: {
        '@type': 'Answer',
        text: respuestaEscriturar(CASOS_ESCRITURAR.local),
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué impuesto se paga al comprar un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_IMPUESTO_COMPRA,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_RENUNCIA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_RENUNCIA,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene renunciar a la exención de IVA al comprar un local?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Interesa cuando el comprador es empresario o autónomo con derecho a deducir el IVA. El ITP es un coste no recuperable, mientras que el IVA autoliquidado por inversión del sujeto pasivo se deduce en la declaración trimestral (modelo 303), con un coste financiero cercano a cero. A cambio, la escritura tributa por AJD, que algunas comunidades aplican a un tipo incrementado cuando existe renuncia a la exención (en la Comunitat Valenciana, el ${AJD_RENUNCIA_VALENCIA}${PCT}).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede deducir el IVA de la compra de un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, siempre que el comprador sea sujeto pasivo de IVA (empresa o autónomo) y el local se destine a una actividad económica sujeta y no exenta de IVA. El IVA soportado en la compra se deduce en el modelo 303, en el porcentaje de afectación a la actividad. Si la actividad está exenta de IVA (por ejemplo enseñanza o sanidad), el IVA no es deducible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos e impuestos paga el vendedor de un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        // La salvedad del promotor, como la tarjeta de la pestaña Vendedor (AVISO_VENTA_PROMOTOR,
        // 616e5fc8): sin ella el FAQPage daba por ganancia del ahorro cualquier venta (hallazgo 3402).
        text: `El vendedor paga la plusvalía municipal (IIVTNU), porque el local está sobre suelo urbano, salvo que el terreno no haya ganado valor: sin ese incremento la venta no está sujeta, aunque haya ganancia (art. 104.5 TRLRHL). Quién la ingresa cambia en un caso: ${SALVEDAD_PLUSVALIA_NO_RESIDENTE}. Si es una persona física, tributa en el IRPF por la ganancia patrimonial en la base del ahorro (tipos del ${AHORRO_MIN}${PCT} al ${AHORRO_MAX}${PCT} en 2025); si es una sociedad, en el Impuesto sobre Sociedades. En una primera entrega (obra nueva) vende el promotor, que es empresario aunque promueva una sola vez: su renta no es una ganancia patrimonial, sino un rendimiento de actividad económica en el IRPF (art. 27.1 LIRPF) o, si es una sociedad, renta del Impuesto sobre Sociedades, y esta calculadora no la calcula. A diferencia de la vivienda habitual, no existe exención por reinversión; los mayores de 65 años sí pueden excluir la ganancia si destinan lo obtenido, en ${EXENCION_RENTA_VITALICIA_MAYORES_65.plazoMeses} meses, a constituir una renta vitalicia asegurada a su favor, hasta ${formatNumber(EXENCION_RENTA_VITALICIA_MAYORES_65.importeMaximo, 0)} € (art. 38.3 LIRPF), algo que esta calculadora no aplica. Si el local estuvo afecto a una actividad económica o alquilado, el valor de adquisición se minora en las amortizaciones deducidas, o al menos en la mínima (art. 35.2 LIRPF y art. 40 de su Reglamento), lo que aumenta la ganancia. A esto se suman la comisión de la inmobiliaria y la gestoría.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de ITP aplica a un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Los tipos reducidos de ITP por perfil del comprador (jóvenes, familias numerosas, discapacidad) son exclusivos de la vivienda habitual, así que un local comercial tributa por el tipo general de su comunidad autónoma, que va del ${ITP_MIN}${PCT} al ${ITP_MAX}${PCT}; en Ceuta y Melilla la cuota se paga a la mitad (bonificación del ${formatNumber(BONIFICACION_CUOTA_CEUTA_MELILLA * 100, 0)}${PCT}, artículo 57 bis.3.a del TRLITPAJD), sea cual sea el uso del inmueble. Conviene mirar además la normativa autonómica: hay comunidades con tipos propios ligados a la ACTIVIDAD y no a la vivienda —Aragón, por ejemplo, aplica el 1${PCT} (0,75${PCT} en medio rural) a la adquisición de un inmueble para iniciar una actividad económica, art. 121-11—, que esta calculadora no aplica por depender de requisitos que no pregunta. Sobre el tipo general: el extremo alto no es un tipo plano, sino el último tramo de las comunidades que aplican una escala progresiva por valor del inmueble. Estos tipos pueden variar, por lo que conviene consultar la normativa vigente de cada comunidad.`,
      },
    },
  ],
};
