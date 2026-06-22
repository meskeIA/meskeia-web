import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador Compra Vehículo (Coche, Carro o Auto): Contado vs Financiación vs Renting vs Leasing | meskeIA',
  description: 'Compara las 4 formas de adquirir un coche, carro o auto: contado, financiación, renting y leasing. Calcula el coste total real de cada opción y descubre cuál te conviene más.',
  keywords: 'comparador coche, comparador carro, comparador auto, financiar coche, financiar auto, renting vs compra, leasing vehiculo, comprar coche contado, comprar carro, financiacion coche, calculadora renting, coste total vehiculo, TAE coche',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador Compra Vehículo: Contado vs Financiación vs Renting vs Leasing',
    description: 'Compara las 4 formas de adquirir un coche, carro o auto y descubre cuál te conviene más según tu situación.',
    url: 'https://meskeia.com/comparador-vehiculos/',
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
    title: 'Comparador Compra Vehículo',
    description: 'Contado vs Financiación vs Renting vs Leasing: calcula el coste total real.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador Vehículos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador Compra Vehículos",
  description: "Compara las 4 formas de adquirir un coche, carro o auto: contado, financiación, renting y leasing. Calcula el coste total real de cada opción y descubre cuál te conviene más.",
  url: "https://meskeia.com/comparador-vehiculos/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre renting y leasing de un vehículo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el renting pagas una cuota mensual que incluye mantenimiento, seguro y gestión de neumáticos; al terminar el contrato devuelves el coche sin opción de compra habitual. En el leasing financiero, la cuota solo cubre la financiación del vehículo y al final del contrato puedes ejercer una opción de compra por el valor residual pactado. El renting es más popular para particulares y autónomos por su sencillez; el leasing es preferido por empresas que quieren activar el bien en balance.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué opción de compra de coche resulta más barata a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pagar al contado suele ser la opción con menor coste total, ya que evita intereses y recargos financieros. La financiación bancaria eleva el precio final según el TAE aplicado. El renting y el leasing incluyen márgenes de la entidad financiera y los costes de gestión, lo que los hace más caros en términos de desembolso global, aunque mejoran la liquidez mensual. La mejor opción depende de tu situación de tesorería, fiscalidad y necesidades de movilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el TAE en la financiación de un coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TAE (Tasa Anual Equivalente) es el coste real anual del préstamo expresado en porcentaje. A diferencia del TIN (Tipo de Interés Nominal), el TAE incluye comisiones y otros gastos asociados al crédito. Para comparar financiaciones de distintos concesionarios o bancos siempre hay que usar el TAE, no el TIN. Un TAE del 6% en un préstamo de 15.000 € a 5 años supone pagar aproximadamente 2.400 € adicionales en intereses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene financiar un coche en lugar de comprarlo al contado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Financiar puede tener sentido si el tipo de interés del préstamo es inferior a la rentabilidad que obtienes invirtiendo el capital, o si mantener liquidez es prioritario para tu negocio o situación personal. También puede ser ventajoso para autónomos y empresas cuando los intereses son deducibles fiscalmente. En cambio, si no tienes inversiones con mayor rentabilidad que el TAE del préstamo, pagar al contado reduce el coste total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El renting incluye seguro y mantenimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la mayoría de contratos de renting para particulares y empresas, la cuota mensual cubre el seguro a todo riesgo, el mantenimiento preventivo y correctivo, la gestión de neumáticos y, en algunos casos, un vehículo de sustitución. Hay que revisar el contrato concreto porque las coberturas varían entre compañías. Esto simplifica la gestión del vehículo, pero eleva la cuota mensual frente a la financiación tradicional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo coche, carro y auto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los tres términos designan el mismo vehículo. "Coche" es la palabra habitual en España, "carro" se usa en gran parte de Hispanoamérica (Colombia, México, Centroamérica, Caribe) y "auto" predomina en el Cono Sur (Argentina, Chile, Uruguay). Este comparador de contado, financiación, renting y leasing funciona igual con cualquiera de los tres nombres.',
      },
    },
  ],
};
