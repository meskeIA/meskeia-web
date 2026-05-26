import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Gastos de Compraventa Inmobiliaria - Calculadora | meskeIA',
  description: 'Calcula gastos de compraventa de vivienda, local comercial, nave industrial y terreno en España. ITP/IVA por comunidad autónoma, notaría, registro y plusvalía.',
  keywords: 'simulador compraventa, gastos compra vivienda, ITP por comunidad, gastos notario, registro propiedad, plusvalía municipal, impuestos vivienda, calculadora inmobiliaria, compra local comercial, nave industrial, compra terreno, IVA inmuebles',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/estimador-compraventa-inmueble/',
  },
  openGraph: {
    type: 'website',
    title: 'Estimador Compraventa Inmobiliaria - meskeIA',
    description: 'Calcula todos los gastos de compra y venta de inmuebles en España: ITP, IVA, notaría, registro, plusvalía municipal y comisiones.',
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
    title: 'Estimador Compraventa Inmobiliaria',
    description: 'Calcula todos los gastos de compra y venta de inmuebles en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador Compraventa Inmobiliaria meskeIA',
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Estimador Gastos Compraventa Inmobiliaria',
  description: 'Calculadora de gastos de compraventa de vivienda, local comercial, nave industrial y terreno en España. Incluye ITP/AJD por comunidad autónoma, IVA en obra nueva, gastos de notaría, registro de la propiedad, plusvalía municipal y comisiones.',
  url: 'https://meskeia.com/estimador-compraventa-inmueble/',
  category: 'FinanceApplication',
  features: [
    'Cálculo de ITP por comunidad autónoma (España)',
    'IVA + AJD en obra nueva',
    'Gastos de notaría y registro de la propiedad',
    'Plusvalía municipal (IIVTNU)',
    'Comisiones de inmobiliaria configurables',
    'Cuatro tipos de inmueble: vivienda, local, nave, terreno',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: ['compraventa inmueble', 'ITP', 'IVA', 'plusvalía municipal', 'gastos vivienda España', 'inmobiliaria'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/estimador-compraventa-inmueble/',
  mainEntity: [
    {
      question: '¿Qué diferencia hay entre ITP e IVA en la compra de una vivienda?',
      answer: 'El ITP se aplica a viviendas de segunda mano (transmisiones entre particulares), mientras que el IVA al 10% se paga en viviendas nuevas (primera entrega del promotor). No pueden coexistir en la misma operación: o se paga uno u otro, nunca ambos.',
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
