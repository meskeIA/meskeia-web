import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Local Comercial - IVA, ITP, Renuncia Exención | meskeIA',
  description: 'Calcula los gastos de compra de un local comercial en España: IVA 21% en obra nueva, ITP por comunidad autónoma en segunda mano, renuncia a la exención de IVA (inversión del sujeto pasivo), AJD, notaría y registro. Gratis y sin registro.',
  keywords: 'simulador gastos compra local comercial, gastos compraventa local, IVA local comercial, ITP local comercial, renuncia exencion IVA local, inversion sujeto pasivo local, comprar local impuestos, calculadora local comercial españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Local Comercial | meskeIA',
    description: 'Calcula el IVA 21%, ITP, renuncia a la exención de IVA y gastos de compraventa de un local comercial en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Local Comercial | meskeIA',
    description: 'IVA 21%, ITP, renuncia a la exención de IVA, notaría y registro en la compraventa de un local comercial. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Local Comercial',
  description: 'Calculadora de gastos de compra de local comercial en España. Incluye IVA 21% en obra nueva, ITP por comunidad autónoma en segunda mano, renuncia a la exención de IVA con inversión del sujeto pasivo, AJD, notaría y registro de la propiedad.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-local-comercial/',
  category: 'FinanceApplication',
  features: [
    'IVA 21% en local comercial de nueva construcción',
    'ITP por comunidad autónoma en segunda mano',
    'Renuncia a la exención de IVA (inversión del sujeto pasivo)',
    'AJD (Actos Jurídicos Documentados)',
    'Gastos de notaría y registro de la propiedad',
    'Nota sobre deducibilidad del IVA para empresas y autónomos',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos local comercial', 'IVA local comercial', 'ITP local comercial', 'renuncia exención IVA', 'compraventa local', 'España'],
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
        text: 'Depende del tipo de transmisión. Si el local es de nueva construcción y lo vende el promotor (primera entrega), se paga IVA al 21% más AJD (entre el 0,5% y el 1,5% según la comunidad autónoma). Si es una segunda transmisión, por regla general está exenta de IVA y se paga ITP al tipo general de la comunidad, habitualmente entre el 6% y el 10%. No coinciden IVA e ITP en la misma operación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la renuncia a la exención de IVA en la compra de un local?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La segunda transmisión de un inmueble está exenta de IVA (artículo 20.Uno.22º de la Ley del IVA), por lo que tributa por ITP. Sin embargo, si comprador y vendedor son empresarios o profesionales con derecho a deducir el IVA, el vendedor puede renunciar a esa exención (artículo 20.Dos). Entonces la operación pasa a tributar por IVA al 21% en lugar de ITP, con inversión del sujeto pasivo: es el comprador quien autoliquida y, si tiene derecho, deduce el IVA.',
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
      name: '¿Qué tipo de ITP aplica a un local comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tipos reducidos de ITP (jóvenes, familias numerosas, discapacidad) son exclusivos de la vivienda habitual. Para un local comercial siempre aplica el tipo general de la comunidad autónoma, que oscila entre el 4% (País Vasco) y el 10%-11% (Cataluña, Comunidad Valenciana). Estos tipos pueden variar, por lo que conviene consultar la normativa vigente de cada comunidad.',
      },
    },
  ],
};
