import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Plusvalía Municipal (IIVTNU) 2025 | meskeIA',
  description: 'Oriéntate sobre el importe de la Plusvalía Municipal (IIVTNU) al vender o heredar un inmueble en España. Compara el método objetivo y el método real conforme al RDL 26/2021.',
  keywords: 'plusvalia municipal, IIVTNU, impuesto plusvalia venta piso, metodo objetivo, metodo real, RDL 26/2021, impuesto ayuntamiento venta inmueble, orientacion plusvalia municipal 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Plusvalía Municipal (IIVTNU) 2025 — meskeIA',
    description: 'Estima orientativamente la Plusvalía Municipal con los dos métodos legales: objetivo y real. Consulta siempre al Ayuntamiento o a un asesor fiscal.',
    url: 'https://meskeia.com/estimador-plusvalia-municipal/',
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
    title: 'Estimador Plusvalía Municipal (IIVTNU) 2025',
    description: 'Oriéntate sobre el impuesto municipal al vender o heredar un inmueble. Dos métodos comparados según RDL 26/2021.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Plusvalía Municipal (IIVTNU)",
  description: "Oriéntate sobre el importe de la Plusvalía Municipal (IIVTNU) al vender o heredar un inmueble en España. Compara el método objetivo y el método real conforme al RDL 26/2021.",
  url: "https://meskeia.com/estimador-plusvalia-municipal/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la Plusvalía Municipal y cuándo hay que pagarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Plusvalía Municipal o IIVTNU (Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana) es un tributo local que grava el aumento de valor del terreno urbano entre la adquisición y la transmisión de un inmueble. Se paga al vender, donar o heredar una propiedad. El sujeto pasivo es el vendedor en caso de compraventa, y el heredero o donatario en transmisiones gratuitas. El plazo de liquidación es de 30 días hábiles en ventas y de 6 meses en herencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la Plusvalía Municipal después del Real Decreto-ley 26/2021?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde noviembre de 2021 (RDL 26/2021), el contribuyente puede elegir entre dos métodos y pagar el que resulte menor. El método objetivo multiplica el valor catastral del suelo por un coeficiente fijado por el Ministerio según los años de tenencia (de 0,14 para 1 año a 0,45 para 20 o más años). El método real calcula la ganancia real del suelo comparando el precio de compra y el de venta proporcionales al terreno. El ayuntamiento aplica después el tipo impositivo municipal, que no puede superar el 30 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay que pagar Plusvalía Municipal si se vende con pérdidas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Tras la sentencia del Tribunal Constitucional de octubre de 2021 y el posterior RDL 26/2021, si el valor de transmisión es igual o inferior al de adquisición (es decir, no hay incremento de valor real), no se genera hecho imponible y no se paga el impuesto. Para acreditarlo, el contribuyente debe demostrar ante el ayuntamiento mediante las escrituras que la ganancia es nula o negativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién paga la Plusvalía Municipal, el comprador o el vendedor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una compraventa entre particulares, el obligado al pago es el vendedor, ya que él es quien obtiene el incremento de valor. No obstante, la ley permite pactar contractualmente que sea el comprador quien lo asuma, aunque esto no cambia quién es el sujeto pasivo ante el ayuntamiento. En herencias y donaciones, el obligado es el heredero o donatario que recibe el bien.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La Plusvalía Municipal es deducible en el IRPF al vender un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El importe pagado por la Plusvalía Municipal puede deducirse del precio de transmisión a efectos del cálculo de la ganancia o pérdida patrimonial en el IRPF, lo que reduce la base imponible del tramo de ahorro. Es decir, reduce indirectamente lo que se paga por la venta en la declaración de la renta. Para ello conviene conservar el justificante de pago del impuesto municipal.',
      },
    },
  ],
};
