import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { RANGO_ITP } from '@/data/itp-ccaa';

/** Un rango es un dato DERIVADO de la tabla de CCAA: escrito a mano envejece en silencio. */
const pct = (n: number) => `${String(n).replace('.', ',')}%`;

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Finca Rústica - ITP, Notaría y Registro | meskeIA',
  description: 'Calcula los gastos de compra de una finca o terreno rústico en España: ITP por comunidad autónoma, notaría y registro. Sin plusvalía municipal (suelo rústico) y con opción de renuncia a la exención de IVA entre profesionales. Gratis y sin registro.',
  keywords: 'simulador gastos compra finca rustica, gastos compraventa terreno rustico, itp finca rustica, comprar terreno agricola impuestos, impuestos finca rustica, calculadora finca rustica españa, renuncia exencion iva terreno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-terreno-rustico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Finca Rústica | meskeIA',
    description: 'Calcula el ITP, notaría y registro de la compra de una finca o terreno rústico en España. Sin plusvalía municipal.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-terreno-rustico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Finca Rústica | meskeIA',
    description: 'ITP, notaría y registro en la compra de una finca o terreno rústico en España. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Finca Rústica',
  description: 'Calculadora de gastos de compra de finca o terreno rústico en España. Incluye ITP por comunidad autónoma, notaría y registro, sin plusvalía municipal al tratarse de suelo rústico, y la opción de renuncia a la exención de IVA entre profesionales con inversión del sujeto pasivo.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-terreno-rustico/',
  category: 'FinanceApplication',
  features: [
    'ITP por comunidad autónoma en la compra de finca rústica',
    'Sin plusvalía municipal (suelo rústico)',
    'Renuncia a la exención de IVA entre profesionales (inversión del sujeto pasivo)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre reducciones para explotaciones agrarias y jóvenes agricultores',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos finca rústica', 'ITP terreno rústico', 'comprar finca agrícola', 'renuncia exención IVA', 'compraventa terreno rústico', 'España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué impuesto se paga al comprar una finca rústica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La transmisión de un terreno rústico no edificable está exenta de IVA (Art. 20.Uno.20º de la Ley del IVA), incluso cuando el vendedor es empresario. Por eso, por regla general se paga ITP (Impuesto de Transmisiones Patrimoniales) al tipo general de la comunidad autónoma, que va del ${pct(RANGO_ITP.min)} al ${pct(RANGO_ITP.max)} contando el tramo más alto de las comunidades con escala progresiva. En Ceuta y Melilla la cuota se bonifica al 50% (art. 57 bis del TRLITPAJD), lo que deja el tipo efectivo por debajo de ese mínimo. Entre particulares siempre se paga ITP.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Se paga plusvalía municipal al comprar o vender una finca rústica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La plusvalía municipal (IIVTNU) solo grava el incremento de valor de los terrenos de naturaleza urbana. El suelo rústico está excluido de este impuesto, así que la venta de una finca rústica no genera plusvalía municipal. Otra cosa es la ganancia patrimonial en el IRPF del vendedor, que sí puede tributar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede aplicarse IVA en la compra de una finca rústica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por regla general la operación está exenta de IVA y tributa por ITP. Sin embargo, si comprador y vendedor son empresarios o profesionales con derecho a deducir el IVA, el vendedor puede renunciar a la exención (Art. 20.Dos LIVA): la compra pasa a tributar por IVA al 21% con inversión del sujeto pasivo, que el comprador autoliquida y deduce en el modelo 303.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay reducciones de ITP al comprar tierras agrícolas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La Ley 19/1995 de Modernización de Explotaciones Agrarias prevé reducciones en la base imponible del impuesto para la adquisición de fincas por titulares de explotaciones prioritarias y por jóvenes agricultores que se instalan por primera vez. Además, algunas comunidades autónomas aplican tipos reducidos propios. Los porcentajes varían y conviene confirmarlos con la normativa de cada comunidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia comprar una finca rústica de comprar un solar edificable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fiscalidad cambia. El terreno rústico no edificable está exento de IVA, tributa por ITP y no genera plusvalía municipal. En cambio, un solar o terreno edificable vendido por un promotor o empresario tributa por IVA al 21% más AJD, y al ser suelo urbano sí genera plusvalía municipal para el vendedor. Son dos operaciones distintas con impuestos distintos.',
      },
    },
  ],
};
