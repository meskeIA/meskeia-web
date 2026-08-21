import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';
import { RANGO_ITP } from '@/data/itp-ccaa';

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
      answer: 'El ITP se aplica a viviendas de segunda mano (transmisiones entre particulares), mientras que el IVA al 10% se paga en viviendas nuevas (primera entrega del promotor). No pueden coexistir en la misma operación: o se paga uno u otro, nunca ambos.',
    },
    {
      question: '¿Cuánto hay que sumar al precio de una vivienda por gastos e impuestos?',
      answer: `La horquilla habitual en España es del 10% al 14% del precio para una vivienda de segunda mano y del 12% al 15% en obra nueva. El grueso es el impuesto: ITP entre el ${RANGO_ITP.min} % y el ${RANGO_ITP.max} % según la comunidad autónoma en segunda mano, o IVA al 10% más AJD en obra nueva. A eso se suman notaría, registro de la propiedad y gestoría, que en conjunto rondan el 1%-2%. Conviene tener ese dinero ahorrado aparte, porque no se financia con la hipoteca.`,
    },
    {
      question: '¿Qué paga el vendedor de una vivienda?',
      answer: 'El vendedor asume la plusvalía municipal (IIVTNU), el IRPF sobre la ganancia patrimonial (del 19% al 30% en la base del ahorro) y, si la hubo, la comisión de la inmobiliaria. Existen dos exenciones importantes en el IRPF que no se aplican a otros inmuebles: la reinversión del importe en otra vivienda habitual y la de los mayores de 65 años que venden su vivienda habitual.',
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
      answer: 'No es obligatoria por ley, pero los bancos suelen exigirla cuando hay hipoteca para asegurarse de que la documentación se tramita correctamente. Su coste oscila entre 200 € y 400 €. Sin hipoteca, puedes presentar los impuestos directamente o contratar una gestoría por comodidad.',
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
        text: `El Impuesto de Transmisiones Patrimoniales (ITP) varía entre el ${RANGO_ITP.min} % y el ${RANGO_ITP.max} % del valor del inmueble según la comunidad autónoma. Cataluña aplica el 10 % de tipo general y escala hasta el 13 % en los inmuebles de más valor, Madrid el 6 %, Andalucía el 7 % y el País Vasco el 4 %. Además, desde 2022 la base imponible es el mayor valor entre el precio escriturado y el valor de referencia catastral, por lo que comprar por debajo del valor de referencia no reduce el impuesto a pagar.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos tiene el comprador al adquirir una vivienda en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El comprador asume habitualmente: el ITP (segunda mano) o IVA + AJD (obra nueva), los gastos de notaría (entre 300 € y 1.000 €), los gastos de inscripción en el Registro de la Propiedad (entre 100 € y 600 €), y opcionalmente la gestoría (200-400 €). En total, los gastos de compraventa suelen representar entre el 8 % y el 13 % del precio de compra, dependiendo de la comunidad autónoma y si hay hipoteca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué impuestos paga el vendedor al vender un inmueble?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El vendedor debe hacer frente a dos tributos principales: la plusvalía municipal (IIVTNU), que grava el incremento del valor del terreno durante los años de tenencia, y la ganancia patrimonial en el IRPF si el precio de venta supera el precio de adquisición. La ganancia patrimonial tributa entre el 19 % y el 30 % según el importe. Existen exenciones relevantes: reinversión en vivienda habitual, mayores de 65 años, vivienda habitual con hipoteca...',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta la escritura notarial de una compraventa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los honorarios del notario en una compraventa se calculan según el Arancel Notarial (RD 1426/1989) y dependen del precio del inmueble. Para una vivienda de 200.000 € los gastos de notaría rondan los 700-900 €; para 400.000 €, aproximadamente 900-1.200 €. Si hay hipoteca, desde 2019 los gastos de notaría de la hipoteca los paga el banco, no el comprador.',
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
