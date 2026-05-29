import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Hipoteca | ¿Fija, Variable o Mixta? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de hipoteca se adapta mejor a tu situación: hipoteca fija, variable, mixta o hipoteca verde para vivienda eficiente.',
  keywords: [
    'hipoteca fija o variable',
    'qué tipo de hipoteca elegir',
    'hipoteca mixta España',
    'hipoteca verde vivienda eficiente',
    'interés fijo variable hipoteca',
    'euríbor hipoteca variable',
    'hipoteca primer piso España',
    'cuota fija o variable hipoteca',
    'tipo hipoteca según perfil',
    'simulador hipoteca España',
  ],
  openGraph: {
    title: 'Selector de Tipo de Hipoteca — ¿Fija, Variable o Mixta?',
    description:
      'Descubre qué tipo de hipoteca se adapta mejor a tu perfil en 10 preguntas.',
    url: 'https://meskeia.com/selector-tipo-hipoteca/',
    siteName: 'meskeIA',
    locale: 'es_ES',
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
  name: "Selector de Tipo de Hipoteca",
  description: "Test de 10 preguntas para saber qué tipo de hipoteca se adapta mejor a tu situación: hipoteca fija, variable, mixta o hipoteca verde para vivienda eficiente.",
  url: "https://meskeia.com/selector-tipo-hipoteca/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una hipoteca fija y una variable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una hipoteca fija el tipo de interés no varía durante toda la vida del préstamo, por lo que la cuota mensual es siempre la misma. En una hipoteca variable el tipo se revisa periódicamente (generalmente cada 6 o 12 meses) en función del euríbor más un diferencial acordado con el banco. La fija ofrece certeza pero suele partir de un interés nominal más alto; la variable puede ser más barata en entornos de euríbor bajo pero encarece la cuota si el índice sube.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una hipoteca mixta y para quién es adecuada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hipoteca mixta combina un período inicial a tipo fijo (habitualmente 5-15 años) con el resto del plazo a tipo variable. Es adecuada para quienes quieren estabilidad a corto plazo pero asumen que en el futuro podrán amortizar capital anticipadamente o refinanciar. Es una buena opción cuando los tipos fijos a largo plazo son elevados pero se prevé que bajen a medio plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una hipoteca verde y qué ventajas tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una hipoteca verde es un préstamo hipotecario con condiciones preferentes (tipo de interés más bajo, comisiones reducidas o bonificaciones) para la compra o rehabilitación de viviendas con alta calificación energética, generalmente A o B. Los bancos ofrecen estos incentivos porque las viviendas eficientes tienen menos riesgo de depreciación y encajan con los objetivos de sostenibilidad de la UE. Para acceder a ella normalmente es necesario acreditar el certificado energético del inmueble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero necesito ahorrado para pedir una hipoteca en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España los bancos financian como máximo el 80 % del valor de tasación de la vivienda (70 % si es segunda residencia), por lo que necesitas al menos un 20 % de entrada propia. A eso hay que sumar los gastos de compraventa: ITP o IVA (según si la vivienda es de segunda mano o nueva), notaría, registro y gestoría, que en conjunto suponen entre un 8 % y un 12 % adicional del precio. En total conviene tener ahorrado entre un 28 % y un 32 % del precio del inmueble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué plazo máximo tienen las hipotecas y cuál es el recomendable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de los bancos ofrecen hipotecas de hasta 30 años, aunque algunas entidades llegan a 40 años para perfiles jóvenes. Un plazo más largo reduce la cuota mensual pero aumenta el total de intereses pagados. Como referencia, la cuota hipotecaria no debería superar el 30-35 % de los ingresos netos del hogar. Para minimizar el coste total suele convenir amortizar anticipadamente cuando sea posible, eligiendo reducir plazo en lugar de cuota.',
      },
    },
  ],
};
