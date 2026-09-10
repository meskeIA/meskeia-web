import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  RANGO_ITP,
  BANDA_PRECIO_VIVIENDA,
  horquillaFedatarios,
  estimarFacturaNotarial,
  calcularRegistro,
  calcularAJD,
  elegirTipoITP,
  importeITP,
  sumarLineasVisibles,
  TERRITORIOS_SIN_IVA,
} from '@/data/itp-ccaa';
import { IVA_INMUEBLES_2025, TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '@/data/fiscal';

/**
 * Los tipos que cita el JSON-LD se LEEN de la tabla, no se escriben.
 *
 * ── Por qué (27/08/2026, hallazgo 434) ────────────────────────────────────────
 * Los extremos del rango ya se derivaban de RANGO_ITP, pero cuatro comunidades iban
 * nombradas con su tipo a mano en la misma frase. Hoy los cuatro coinciden con la
 * tabla, así que no había ninguna cifra mal — pero `npm run check:itp` vigila
 * `data/itp-ccaa.ts`, no los ficheros de las apps: un movimiento como el de Murcia
 * (8 → 7,75 %) o el de Valencia (10 → 9 %) no llegaría hasta aquí, y la señal
 * estructurada que leen Bing Copilot, ChatGPT y Perplexity envejecería sin aviso.
 */
const pct = (n: number) => `${String(n).replace('.', ',')} %`;

/**
 * Las horquillas de notaría y registro salen del ARANCEL, no de la memoria.
 *
 * ── Por qué (02/09/2026, hallazgo 584) ────────────────────────────────────────
 * Este mismo fichero publicaba «notaría 300 €-1.000 €» en una pregunta y «700-900 €» en
 * otra, mientras la página visible decía «600 €-1.500 €» y el motor cobra 758,98 € para
 * una vivienda de 200.000 €. Tres rangos para lo mismo, y el que leen los asistentes de
 * IA era el peor. Ahora los tres sitios llaman a la misma función.
 */
const euros = (n: number) => `${(Math.round(n / 10) * 10).toLocaleString('es-ES')} €`;
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;
const HORQUILLA = horquillaFedatarios(BANDA_PRECIO_VIVIENDA.min, BANDA_PRECIO_VIVIENDA.max);
const notariaDe = (precio: number) => {
  const f = estimarFacturaNotarial(precio);
  return `${euros(f.min)} y ${euros(f.max)}`;
};
const tipoDe = (id: keyof typeof ITP_CCAA) => pct(ITP_CCAA[id].tipoGeneral);
const techoDe = (id: keyof typeof ITP_CCAA) =>
  pct(Math.max(ITP_CCAA[id].tipoGeneral, ...(ITP_CCAA[id].tramosProgresivos ?? []).map((t) => t.tipo)));

/**
 * Gestoría que la calculadora propone por defecto. Vive aquí porque entra en la horquilla
 * de abajo, y `page.tsx` la importa para su valor inicial: si el defecto de la app y el de
 * la horquilla se separaran, la cifra publicada dejaría de ser la que el motor suma.
 */
export const GESTORIA_TIPICA = 300;

/**
 * Horquilla de la gestoría, en una sola boca.
 *
 * La misma cifra se escribía de CUATRO formas distintas en la página —«200-400€»,
 * «200€ y 400€», «200 € y 400 €» y «(200-400 €)»— y dos de ellas incumplían el formato
 * español de moneda del CLAUDE.md global §2, que exige espacio antes del símbolo. La
 * página se contradecía consigo misma en la manera de imprimir el mismo dato (hallazgo
 * 676 del Inspector). Ahora las cuatro salen de aquí, así que no pueden divergir ni en
 * el valor ni en el formato.
 */
export const HORQUILLA_GESTORIA = { min: 200, max: 400 };

/** «200 € y 400 €» — la horquilla ya formateada, para intercalar en prosa. */
export const gestoriaEnTexto = () =>
  `${HORQUILLA_GESTORIA.min.toLocaleString('es-ES')} € y ${HORQUILLA_GESTORIA.max.toLocaleString('es-ES')} €`;

/**
 * Cuánto hay que sumar al precio por gastos e impuestos — DERIVADO del mismo motor que
 * ejecuta la calculadora, nunca escrito a mano.
 *
 * ── Por qué (09/09/2026, hallazgo 628) ────────────────────────────────────────
 * La app publicaba TRES horquillas incompatibles de esta misma cifra —«entre un 10 % y
 * 15 %» en el paso 1 del bloque educativo, «del 10 % al 14 % … y del 12 % al 15 % en obra
 * nueva» en el JSON-LD WebApplication+FAQ y «entre el 8 % y el 13 %» en el FAQPage— y
 * ninguna contenía lo que su propio motor calcula: 6,65 % para Madrid en segunda mano y
 * 4,65 % para el País Vasco. Es la familia del hallazgo 584 (tres rangos para lo mismo,
 * ninguno igual al motor), que se cerró derivando notaría y registro del arancel; esta es
 * la cifra de cabecera de toda la app —la que el comprador usa para saber cuánto ahorrar
 * aparte, porque no se financia con la hipoteca— y se había quedado a mano en los tres
 * sitios, dos de ellos leídos por los asistentes de IA.
 *
 * ── Cómo se obtiene ───────────────────────────────────────────────────────────
 * Se recorren las 19 comunidades en la banda de BANDA_PRECIO_VIVIENDA (100.000 € a
 * 500.000 €, de 10.000 en 10.000) reproduciendo las dos ramas de `resultadosComprador`:
 *   · segunda mano → ITP del tipo general (`elegirTipoITP` + `importeITP`, que aplica la
 *     escala progresiva donde la hay y la bonificación del 50 % de Ceuta y Melilla),
 *   · obra nueva   → IVA de obra nueva + AJD de la comunidad, salvo en los territorios
 *     sin IVA, donde la app no da cifra (`impuestoNoCalculado`),
 * y a las dos se les suman notaría (factura media), registro y la gestoría típica, con el
 * mismo `sumarLineasVisibles` que usa la pantalla. Los extremos se redondean HACIA FUERA a
 * una décima, para que la horquilla publicada contenga siempre lo que el motor calcula.
 *
 * Al ser derivada, no hay que recalcular nada a mano: si se mueve un tipo de ITP, el IVA,
 * el AJD o el arancel, esta constante se mueve con ellos y las tres bocas que la publican
 * dicen lo mismo el mismo día.
 */
export const HORQUILLA_GASTOS_COMPRAVENTA: { min: number; max: number } = (() => {
  const porcentajes: number[] = [];
  const PASO = 10000;

  for (const ccaa of Object.keys(ITP_CCAA) as ComunidadAutonoma[]) {
    for (
      let precio = BANDA_PRECIO_VIVIENDA.min;
      precio <= BANDA_PRECIO_VIVIENDA.max;
      precio += PASO
    ) {
      const notaria = estimarFacturaNotarial(precio).medio;
      const registro = calcularRegistro(precio);

      const itp = importeITP(
        precio,
        ccaa,
        elegirTipoITP(ccaa, 'general', precio, { viviendaHabitual: true }),
      );
      porcentajes.push(
        (sumarLineasVisibles(itp, notaria, registro, GESTORIA_TIPICA) / precio) * 100,
      );

      if (!TERRITORIOS_SIN_IVA[ccaa]) {
        const iva = precio * (IVA_INMUEBLES_2025.obraNueva / 100);
        porcentajes.push(
          (sumarLineasVisibles(iva, calcularAJD(precio, ccaa), notaria, registro, GESTORIA_TIPICA) /
            precio) *
            100,
        );
      }
    }
  }

  return {
    min: Math.floor(Math.min(...porcentajes) * 10) / 10,
    max: Math.ceil(Math.max(...porcentajes) * 10) / 10,
  };
})();

export const metadata: Metadata = {
  title: 'Gastos de Compraventa de Vivienda - Calculadora ITP, Notaría y Plusvalía | meskeIA',
  description: 'Calcula los gastos de comprar o vender una vivienda en España: ITP o IVA por comunidad autónoma, notaría, registro, plusvalía municipal e IRPF del vendedor. También orienta sobre garaje, trastero, local, nave y terreno.',
  keywords: 'gastos compra vivienda, simulador gastos compraventa vivienda, calculadora gastos compra piso, gastos venta vivienda, ITP por comunidad, gastos notario, registro propiedad, plusvalía municipal, impuestos compra casa, gastos compra vivienda segunda mano, calculadora inmobiliaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/estimador-compraventa-inmueble/',
  },
  openGraph: {
    type: 'website',
    title: 'Estimador de Gastos de Compraventa de Vivienda - meskeIA',
    description: 'Cuánto cuesta comprar o vender un piso o una casa en España: ITP o IVA, notaría, registro, plusvalía municipal e IRPF del vendedor.',
    url: 'https://meskeia.com/estimador-compraventa-inmueble/',
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
    title: 'Estimador de Gastos de Compraventa de Vivienda',
    description: 'Cuánto cuesta comprar o vender un piso o una casa en España, con todos los impuestos y gastos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Gastos Compraventa Vivienda meskeIA',
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Estimador Gastos Compraventa Vivienda',
  description: 'Calculadora de los gastos de comprar o vender una vivienda en España: ITP o IVA por comunidad autónoma, AJD, notaría, registro de la propiedad, plusvalía municipal, IRPF del vendedor y comisión de la inmobiliaria. Cubre además, de forma orientativa, garaje, trastero, local comercial, nave industrial y terreno, con enlace a la calculadora especializada de cada tipo.',
  url: 'https://meskeia.com/estimador-compraventa-inmueble/',
  category: 'FinanceApplication',
  features: [
    'Cálculo de ITP por comunidad autónoma (España)',
    'IVA + AJD en obra nueva',
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal (IIVTNU)',
    'Comisiones de inmobiliaria configurables',
    'Tipos reducidos de ITP: joven, familia numerosa, discapacidad y VPO',
    'Pestaña de vendedor: plusvalía municipal, IRPF de la ganancia y neto resultante',
    'Orientación sobre garaje, trastero, local, nave y terreno con enlace a su calculadora',
  ],
  keywords: ['gastos compra vivienda', 'gastos venta vivienda', 'compraventa vivienda', 'ITP', 'IVA', 'plusvalía municipal', 'España'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/estimador-compraventa-inmueble/',
  mainEntity: [
    {
      question: '¿Qué diferencia hay entre ITP e IVA en la compra de una vivienda?',
      answer: `El ITP se aplica a viviendas de segunda mano (transmisiones entre particulares), mientras que el IVA al ${IVA_INMUEBLES_2025.obraNueva}% se paga en viviendas nuevas (primera entrega del promotor). No pueden coexistir en la misma operación: o se paga uno u otro, nunca ambos.`,
    },
    {
      question: '¿Cuánto hay que sumar al precio de una vivienda por gastos e impuestos?',
      answer: `Los gastos e impuestos van del ${pct(HORQUILLA_GASTOS_COMPRAVENTA.min)} al ${pct(HORQUILLA_GASTOS_COMPRAVENTA.max)} del precio, según la comunidad autónoma, el importe de la operación y si la vivienda es de segunda mano o de obra nueva. El grueso es el impuesto: ITP entre el ${RANGO_ITP.min} % y el ${RANGO_ITP.max} % según la comunidad autónoma en segunda mano, o IVA al ${IVA_INMUEBLES_2025.obraNueva}% más AJD en obra nueva. A eso se suman notaría, registro de la propiedad y gestoría, que en conjunto rondan el 1%-2%. Conviene tener ese dinero ahorrado aparte, porque no se financia con la hipoteca.`,
    },
    {
      question: '¿Qué paga el vendedor de una vivienda?',
      answer: `El vendedor asume la plusvalía municipal (IIVTNU), el IRPF sobre la ganancia patrimonial (del ${TIPO_AHORRO_MIN}% al ${TIPO_AHORRO_MAX}% en la base del ahorro) y, si la hubo, la comisión de la inmobiliaria. Existen dos exenciones importantes en el IRPF que no se aplican a otros inmuebles: la reinversión del importe en otra vivienda habitual y la de los mayores de 65 años que venden su vivienda habitual.`,
    },
    {
      question: '¿Puedo negociar quién paga cada gasto?',
      answer: 'En principio, salvo los gastos del vendedor (plusvalía municipal, IRPF), el resto son del comprador por ley. Sin embargo, es posible pactar condiciones distintas en el contrato privado. Lo que no puede modificarse es la obligación tributaria frente a Hacienda.',
    },
    {
      question: '¿Qué es el valor de referencia catastral y cómo afecta al ITP?',
      answer: 'Desde 2022, la base imponible del ITP es el mayor valor entre el precio escriturado y el valor de referencia catastral (publicado por el Catastro). Si el valor de referencia supera el precio de compra, deberás pagar ITP sobre ese valor mayor, aunque hayas comprado más barato.',
    },
    {
      question: '¿Cuándo se está exento de pagar plusvalía municipal?',
      answer: 'Desde la sentencia del Tribunal Constitucional de 2021, si no existe ganancia real en el valor del terreno (vendes por menos de lo que compraste), puedes acreditar la pérdida y quedar exento. El vendedor puede elegir el método de cálculo más favorable: objetivo o real.',
    },
    {
      question: '¿Qué gastos puede deducir el comprador en la declaración de la renta?',
      answer: 'Si compras con hipoteca, los gastos financieros no son deducibles en IRPF desde 2013 (solo para contratos anteriores). Sin embargo, los gastos de compraventa (notaría, registro, ITP) incrementan el valor de adquisición, reduciendo la ganancia patrimonial futura al vender.',
    },
    {
      question: '¿Qué son los tipos reducidos de ITP y cómo acceder a ellos?',
      answer: 'Muchas comunidades aplican tipos reducidos para jóvenes (menores de 35-36 años), familias numerosas, personas con discapacidad (≥33%), VPO o municipios en riesgo de despoblación. Los requisitos (edad, ingresos, valor máximo del inmueble) varían por comunidad. Consulta la normativa de tu CC.AA.',
    },
    {
      question: '¿La gestoría es obligatoria en la compraventa?',
      answer: `No es obligatoria por ley, pero los bancos suelen exigirla cuando hay hipoteca para asegurarse de que la documentación se tramita correctamente. Su coste oscila entre ${gestoriaEnTexto()}. Sin hipoteca, puedes presentar los impuestos directamente o contratar una gestoría por comodidad.`,
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se paga de ITP al comprar una vivienda de segunda mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El Impuesto de Transmisiones Patrimoniales (ITP) varía entre el ${RANGO_ITP.min} % y el ${RANGO_ITP.max} % del valor del inmueble según la comunidad autónoma. Cataluña aplica el ${tipoDe('cataluna')} de tipo general y escala hasta el ${techoDe('cataluna')} en los inmuebles de más valor, Madrid el ${tipoDe('madrid')}, Andalucía el ${tipoDe('andalucia')} y el País Vasco el ${tipoDe('pais-vasco')}. Además, desde 2022 la base imponible es el mayor valor entre el precio escriturado y el valor de referencia catastral, por lo que comprar por debajo del valor de referencia no reduce el impuesto a pagar.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos tiene el comprador al adquirir una vivienda en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El comprador asume habitualmente: el ITP (segunda mano) o IVA + AJD (obra nueva), los gastos de notaría (entre ${euros(HORQUILLA.notaria.min)} y ${euros(HORQUILLA.notaria.max)} para viviendas de ${euros(BANDA_PRECIO_VIVIENDA.min)} a ${euros(BANDA_PRECIO_VIVIENDA.max)}), los gastos de inscripción en el Registro de la Propiedad (entre ${euros(HORQUILLA.registro.min)} y ${euros(HORQUILLA.registro.max)} en esa misma banda), y opcionalmente la gestoría (entre ${gestoriaEnTexto()}). En total, los gastos de compraventa representan entre el ${pct(HORQUILLA_GASTOS_COMPRAVENTA.min)} y el ${pct(HORQUILLA_GASTOS_COMPRAVENTA.max)} del precio de compra, según la comunidad autónoma, el importe de la operación y si es obra nueva o segunda mano.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué impuestos paga el vendedor al vender un inmueble?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El vendedor debe hacer frente a dos tributos principales: la plusvalía municipal (IIVTNU), que grava el incremento del valor del terreno durante los años de tenencia, y la ganancia patrimonial en el IRPF si el precio de venta supera el precio de adquisición. La ganancia patrimonial tributa entre el ${TIPO_AHORRO_MIN} % y el ${TIPO_AHORRO_MAX} % según el importe. Existen exenciones relevantes: reinversión en vivienda habitual, mayores de 65 años, vivienda habitual con hipoteca...`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta la escritura notarial de una compraventa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Los honorarios del notario en una compraventa se calculan según el Arancel Notarial (RD 1426/1989) y dependen del precio del inmueble. Para una vivienda de 200.000 € la factura notarial se sitúa entre ${notariaDe(200000)}; para 400.000 €, entre ${notariaDe(400000)}. Si hay hipoteca, desde 2019 los gastos de notaría de la hipoteca los paga el banco, no el comprador.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la plusvalía municipal y quién la paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La plusvalía municipal (IIVTNU, Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana) grava el aumento de valor del suelo desde la última transmisión. La paga el vendedor, salvo en herencias y donaciones (donde la paga el heredero o donatario). Desde la sentencia del Tribunal Constitucional de 2021, si no hay ganancia real en el terreno se puede acreditar la pérdida y quedar exento o pagar menos.',
      },
    },
  ],
};
