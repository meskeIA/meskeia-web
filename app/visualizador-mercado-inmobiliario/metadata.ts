import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mercado Inmobiliario: Burbuja, Accesibilidad y Ciudades — meskeIA',
  description:
    'Visualizador del mercado de vivienda español. Curvas oferta/demanda interactivas, burbuja 2008, ratio precio/renta por ciudad, accesibilidad generacional y alquiler vs compra.',
  keywords: [
    'mercado inmobiliario España',
    'burbuja inmobiliaria 2008',
    'precio vivienda por ciudad',
    'ratio precio renta vivienda',
    'accesibilidad vivienda millennials',
    'alquiler vs compra España',
    'oferta demanda vivienda',
    'precio vivienda Madrid Barcelona',
  ],
  openGraph: {
    title: 'Mercado Inmobiliario: Burbuja, Accesibilidad y Ciudades — meskeIA',
    description:
      'La economía del mercado de vivienda en España: de la burbuja 2008 a los nuevos máximos.',
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
  name: "Mercado Inmobiliario: Burbuja, Precios y Accesibilidad",
  description: "Visualizador del mercado de vivienda español. Curvas oferta/demanda interactivas, burbuja 2008, ratio precio/renta por ciudad, accesibilidad generacional y alquiler vs compra.",
  url: "https://meskeia.com/visualizador-mercado-inmobiliario/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué causó la burbuja inmobiliaria de 2008 en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La burbuja inmobiliaria española de 2008 fue el resultado de una combinación de crédito hipotecario excesivamente barato (tipos de interés bajos tras la entrada en el euro), especulación masiva, sobreoferta de vivienda nueva y una regulación laxa del sistema financiero. Entre 1997 y 2007, los precios de la vivienda se multiplicaron por 2,5. Cuando los tipos subieron y el crédito se cerró, los precios cayeron un 40% en las zonas más afectadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ratio precio/renta y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio precio/renta (Price-to-Income ratio) mide cuántos años de salario bruto son necesarios para comprar una vivienda. En España, la media histórica sostenible se sitúa en torno a 6-7 años, pero en ciudades como Madrid o Barcelona supera los 12-14 años para los compradores más jóvenes. Es uno de los indicadores más usados para detectar sobrevaloración del mercado inmobiliario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué les resulta tan difícil comprar vivienda a los jóvenes en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dificultad de acceso a la vivienda para los jóvenes en España responde a varios factores estructurales: salarios bajos y temporalidad laboral, precios que han crecido más que las rentas, exigencia de ahorrar el 20% de entrada más costes notariales, y un mercado de alquiler asequible muy limitado. En 2024, el esfuerzo de compra para un hogar joven en Madrid supera el 40% de los ingresos, muy por encima del 30% considerado sostenible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es mejor alquilar que comprar una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Financieramente, el alquiler puede ser más ventajoso cuando el precio de compra supera 20-25 veces el alquiler anual equivalente (ratio precio/alquiler), cuando el horizonte de permanencia es inferior a 5-7 años, o cuando el capital para la entrada tiene una rentabilidad alternativa clara. La compra suele ser más favorable en zonas con alta revalorización esperada, tipos hipotecarios bajos y estabilidad laboral a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan las curvas de oferta y demanda en el mercado inmobiliario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el mercado inmobiliario, la oferta es muy rígida a corto plazo porque construir lleva tiempo y el suelo disponible es escaso, especialmente en ciudades. La demanda, en cambio, responde rápidamente a cambios en el empleo, los tipos de interés y la demografía. Cuando la demanda sube más rápido que la oferta, los precios suben de forma pronunciada. Esta rigidez de la oferta explica por qué las ciudades con alta presión demográfica, como Madrid o Barcelona, registran subidas de precios persistentes.',
      },
    },
  ],
};
