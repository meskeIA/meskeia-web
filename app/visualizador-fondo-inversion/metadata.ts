import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fondo de Inversión: Por Dentro | meskeIA',
  description:
    'Cómo funciona un fondo de inversión por dentro: NAV, gestión activa vs indexada, el impacto devastador de las comisiones a largo plazo y qué significa diversificar de verdad. Educativo — sin recomendaciones de fondos concretos.',
  keywords: [
    'fondo de inversión cómo funciona',
    'NAV valor liquidativo',
    'gestión activa vs indexada',
    'comisiones fondo impacto',
    'fondo índice ventajas',
    'diversificación real inversión',
    'SPIVA estudio fondos activos',
    'ETF vs fondo inversión',
  ],
  openGraph: {
    title: 'Fondo de Inversión: Por Dentro | meskeIA',
    description:
      'El 85% de los fondos activos no baten al índice en 10 años — y las comisiones son la razón principal.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Fondo de Inversión: Por Dentro",
  description: "Cómo funciona un fondo de inversión por dentro: NAV, gestión activa vs indexada, el impacto devastador de las comisiones a largo plazo y qué significa diversificar de verdad. Educativo — sin recomenda",
  url: "https://meskeia.com/visualizador-fondo-inversion/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un fondo de inversión y cómo funciona el NAV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fondo de inversión es un vehículo que reúne el dinero de múltiples inversores para comprar una cartera diversificada de activos (acciones, bonos, inmuebles, etc.) gestionada por profesionales. El NAV (Net Asset Value, o valor liquidativo en español) es el precio de cada participación del fondo: se calcula dividiendo el valor total de todos los activos del fondo entre el número de participaciones en circulación. El NAV se recalcula al cierre de cada día de mercado, por lo que a diferencia de las acciones individuales, no fluctúa en tiempo real durante la sesión bursátil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un fondo de gestión activa y un fondo indexado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fondo de gestión activa tiene un equipo de analistas que selecciona los valores de la cartera intentando superar al mercado; sus comisiones suelen estar entre el 1% y el 2,5% anual. Un fondo indexado (o ETF de índice) simplemente replica un índice de referencia como el S&P 500 o el MSCI World sin tomar decisiones activas; sus comisiones son mucho menores, típicamente entre el 0,03% y el 0,30% anual. El estudio SPIVA de S&P Global documenta que más del 85% de los fondos activos no superan a su índice de referencia en periodos de 10 años, una vez descontadas las comisiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué impacto tienen las comisiones de un fondo en la rentabilidad a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El impacto de las comisiones es exponencial gracias (o perjudicial por) al efecto del interés compuesto. Con una inversión inicial de 10.000 € a una rentabilidad bruta del 7% anual durante 30 años: un fondo con comisión del 0,2% crece hasta aproximadamente 74.000 €, mientras que un fondo con comisión del 1,5% crece solo hasta aproximadamente 51.000 €. La diferencia de 23.000 € es dinero que el inversor pierde sin que el gestor haya obtenido peores resultados brutos; simplemente es el coste acumulado de la comisión, que consume el 31% del capital final potencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa realmente diversificar en un fondo de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diversificar no es solo tener muchos valores: consiste en combinar activos cuyas rentabilidades no estén perfectamente correlacionadas entre sí. Un fondo con 50 empresas del mismo sector o del mismo país diversifica poco, porque todas reaccionan igual ante las mismas noticias. La diversificación real incluye distintos sectores económicos, geografías (mercados desarrollados y emergentes), clases de activos (renta variable, renta fija, materias primas) y divisas. Los fondos globales de índice como los referenciados al MSCI ACWI cubren más de 2.900 empresas en 47 países, ofreciendo diversificación real en un solo instrumento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un ETF y un fondo de inversión tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos son fondos que agrupan activos de múltiples inversores, pero difieren en su mecanismo de negociación: un fondo tradicional se compra y vende directamente a la gestora al precio NAV calculado al cierre del día. Un ETF (Exchange Traded Fund) cotiza en bolsa como una acción y puede comprarse y venderse en tiempo real durante el horario de mercado a precios que fluctúan continuamente. En la práctica, para el inversor a largo plazo las diferencias son menores; los factores más relevantes siguen siendo las comisiones y la estrategia subyacente (activa vs indexada), no el formato de negociación.',
      },
    },
  ],
};
