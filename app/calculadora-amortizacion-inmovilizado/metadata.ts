import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Amortización de Inmovilizado - Lineal, Degresivo y Dígitos - meskeIA',
  description: 'Compara los tres sistemas de amortización del inmovilizado (lineal, degresivo y suma de dígitos) y obtén el cuadro año a año con cuota, acumulada y valor neto contable.',
  keywords: 'amortizacion inmovilizado, cuadro de amortizacion, metodo lineal, amortizacion degresiva, suma de digitos, porcentaje constante, tabla amortizacion AEAT, valor neto contable, amortizacion activo, coeficiente amortizacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Amortización de Inmovilizado - meskeIA',
    description: 'Calcula y compara los tres métodos de amortización del inmovilizado con el cuadro completo año a año y un gráfico de la evolución del valor neto contable.',
    url: 'https://meskeia.com/calculadora-amortizacion-inmovilizado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Amortización de Inmovilizado - meskeIA',
    description: 'Lineal, degresivo y suma de dígitos comparados: cuadro año a año con cuota, amortización acumulada y valor neto contable.',
  },
  other: {
    'application-name': 'Calculadora de Amortización de Inmovilizado meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Amortización de Inmovilizado',
  description: 'Herramienta para calcular y comparar los tres sistemas de amortización del inmovilizado: lineal (cuota constante), degresivo por porcentaje constante sobre saldo decreciente y suma de dígitos. Genera el cuadro de amortización año a año con la cuota, la amortización acumulada y el valor neto contable, e incluye un gráfico comparativo de la evolución del valor en libros y un selector de tipo de activo con los coeficientes orientativos de las tablas oficiales españolas.',
  url: 'https://meskeia.com/calculadora-amortizacion-inmovilizado/',
  category: 'FinanceApplication',
  features: [
    'Tres métodos: lineal, degresivo por porcentaje constante y suma de dígitos',
    'Cuadro de amortización año a año: cuota, acumulada y valor neto contable',
    'Gráfico comparativo de la evolución del valor neto contable',
    'Selector de tipo de activo con coeficientes orientativos de las tablas AEAT',
    'Cálculo automático del porcentaje degresivo según la vida útil',
    'Valor residual configurable',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la amortización del inmovilizado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es el reparto del coste de un activo duradero (maquinaria, vehículos, equipos, edificios) a lo largo de los años en que se usa, en lugar de imputarlo todo en el año de compra. Refleja contablemente que el activo pierde valor con el tiempo y permite deducir ese gasto de forma escalonada. La base que se amortiza es el valor de adquisición menos el valor residual estimado al final de su vida útil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los métodos de amortización del inmovilizado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres sistemas habituales son: el método lineal, que reparte la misma cuota todos los años; el método degresivo de porcentaje constante, que aplica un porcentaje fijo sobre el saldo pendiente generando cuotas decrecientes; y el método de suma de dígitos, que reparte la base según una serie de dígitos. Los tres amortizan el mismo importe total; lo que cambia es el ritmo al que se reconoce el gasto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cambia el total amortizado según el método elegido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Los tres métodos amortizan exactamente la misma cantidad total a lo largo de la vida útil del activo: el valor de adquisición menos el valor residual. Lo único que cambia es la distribución temporal, es decir, cuánto gasto se reconoce cada año. Por eso elegir entre lineal, degresivo o suma de dígitos es una decisión sobre el momento del gasto y la tesorería fiscal, no sobre la cuantía total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el método degresivo de porcentaje constante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se aplica un porcentaje fijo sobre el valor pendiente de amortizar cada año, por lo que la cuota disminuye con el tiempo. En España ese porcentaje se obtiene multiplicando el coeficiente lineal por 1,5 si la vida útil es menor de 5 años, por 2 si está entre 5 y 8 años, o por 2,5 si supera los 8 años, con un mínimo del 11 %. El último año se amortiza todo el saldo pendiente. No se aplica a edificios, mobiliario y enseres.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valor de adquisición debo usar para amortizar un activo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El valor de adquisición incluye el precio de compra más todos los gastos necesarios para poner el activo en funcionamiento: transporte, instalación, montaje y puesta en marcha. No incluye el IVA cuando es deducible. Sobre ese valor, menos el valor residual estimado, se calcula la base amortizable que se reparte a lo largo de la vida útil.',
      },
    },
  ],
};
