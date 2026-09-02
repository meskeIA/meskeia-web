import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { RANGO_AJD, RANGO_ITP } from '@/data/itp-ccaa';
import { IVA_INMUEBLES_2025 } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

/** Los rangos que cita el JSON-LD se DERIVAN de la tabla: escritos a mano contradecían al
 *  panel, que muestra «AJD 0 %» en el País Vasco y el 0,25 % efectivo de Ceuta y Melilla
 *  tras la bonificación (hallazgo 622). */
const AJD_MIN = formatNumber(RANGO_AJD.min, 0);
const AJD_MAX = formatNumber(RANGO_AJD.max, 1);

export const metadata: Metadata = {
  title: 'Simulador Gastos Compraventa Local Comercial - IVA, ITP, Plusvalía e IRPF | meskeIA',
  description: `Calcula los gastos de compra y venta de un local comercial en España. Si compras: IVA ${IVA_INMUEBLES_2025.local}% en obra nueva, ITP en segunda mano, renuncia a la exención de IVA (inversión del sujeto pasivo), AJD, notaría y registro. Si vendes: plusvalía municipal, IRPF de la ganancia y neto que recibes. Gratis y sin registro.`,
  keywords: 'simulador gastos compra local comercial, simulador gastos venta local comercial, calculadora gastos venta local comercial, gastos compraventa local, IVA local comercial, ITP local comercial, renuncia exencion IVA local, inversion sujeto pasivo local, plusvalia venta local comercial, irpf venta local, calculadora local comercial españa',
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
  description: `Calculadora de gastos de compra y venta de local comercial en España. Para el comprador: IVA ${IVA_INMUEBLES_2025.local}% en obra nueva, ITP por comunidad autónoma en segunda mano, renuncia a la exención de IVA con inversión del sujeto pasivo, AJD, notaría y registro. Para el vendedor: plusvalía municipal, IRPF sobre la ganancia patrimonial (con corrección por amortizaciones si el local estuvo afecto a una actividad) y neto resultante.`,
  url: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
  category: 'FinanceApplication',
  features: [
    `IVA ${IVA_INMUEBLES_2025.local}% en local comercial de nueva construcción`,
    'ITP por comunidad autónoma en segunda mano',
    'Renuncia a la exención de IVA (inversión del sujeto pasivo)',
    'AJD (Actos Jurídicos Documentados)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre deducibilidad del IVA para empresas y autónomos',
    'Vendedor: plusvalía municipal (IIVTNU) por método objetivo y real',
    'Vendedor: IRPF de la ganancia patrimonial y neto tras impuestos',
    'Corrección del valor de adquisición por amortizaciones (local afecto a actividad)',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos local comercial', 'IVA local comercial', 'ITP local comercial', 'renuncia exención IVA', 'gastos venta local comercial', 'plusvalía venta local', 'compraventa local', 'España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué impuesto se paga al comprar un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Depende del tipo de transmisión. Si el local es de nueva construcción y lo vende el promotor (primera entrega), se paga IVA al ${IVA_INMUEBLES_2025.local}% más AJD (del ${AJD_MIN}% al ${AJD_MAX}% según la comunidad autónoma; el País Vasco no lo cobra). Si es una segunda transmisión, por regla general está exenta de IVA y se paga ITP al tipo general de la comunidad, que va del ${formatNumber(RANGO_ITP.min, 0)}% al ${formatNumber(RANGO_ITP.max, 0)}%. No coinciden IVA e ITP en la misma operación.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la renuncia a la exención de IVA en la compra de un local?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La segunda transmisión de un inmueble está exenta de IVA (artículo 20.Uno.22º de la Ley del IVA), por lo que tributa por ITP. Sin embargo, si comprador y vendedor son empresarios o profesionales con derecho a deducir el IVA, el vendedor puede renunciar a esa exención (artículo 20.Dos). Entonces la operación pasa a tributar por IVA al ${IVA_INMUEBLES_2025.local}% en lugar de ITP, con inversión del sujeto pasivo: es el comprador quien autoliquida y, si tiene derecho, deduce el IVA.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene renunciar a la exención de IVA al comprar un local?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Interesa cuando el comprador es empresario o autónomo con derecho a deducir el IVA. El ITP es un coste no recuperable, mientras que el IVA autoliquidado por inversión del sujeto pasivo se deduce en la declaración trimestral (modelo 303), con un coste financiero cercano a cero. A cambio, la escritura tributa por AJD, que en muchas comunidades se aplica a un tipo incrementado cuando existe renuncia a la exención.',
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
        text: 'El vendedor paga la plusvalía municipal (IIVTNU), porque el local está sobre suelo urbano, y tributa en el IRPF por la ganancia patrimonial en la base del ahorro (tipos del 19% al 30% en 2025). A diferencia de la vivienda habitual, no existe exención por reinversión ni por tener más de 65 años. Si el local estuvo afecto a una actividad económica, el valor de adquisición se minora en las amortizaciones deducidas, lo que aumenta la ganancia. A esto se suman la comisión de la inmobiliaria y la gestoría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de ITP aplica a un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tipos reducidos de ITP (jóvenes, familias numerosas, discapacidad) son exclusivos de la vivienda habitual. Para un local comercial siempre aplica el tipo general de la comunidad autónoma, que oscila entre el 4% (País Vasco) y el 10%-11% (Cataluña, Comunidad Valenciana). Estos tipos pueden variar, por lo que conviene consultar la normativa vigente de cada comunidad.',
      },
    },
  ],
};
