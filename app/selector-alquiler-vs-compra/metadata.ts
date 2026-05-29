import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Alquiler o Compra — ¿Qué te conviene? | meskeIA',
  description: 'Test de 10 preguntas para saber si te conviene más alquilar o comprar vivienda según tu situación personal, laboral y vital. Sin cálculos, solo tu contexto real.',
  keywords: [
    'alquilar o comprar vivienda',
    'me conviene comprar piso',
    'test alquiler vs compra',
    'cuándo comprar casa España',
    'es mejor alquilar o comprar',
    'selector alquiler compra',
    'comprar piso o seguir alquilando',
    'decidir comprar vivienda',
    'estabilidad para comprar piso',
    'alquiler vs hipoteca España',
  ],
  openGraph: {
    title: '¿Alquilar o comprar? Test en 10 preguntas | meskeIA',
    description: 'Antes de los números, analiza tu situación vital real. Estabilidad laboral, horizonte temporal, mercado local y más. Resultado: alquila, compra o espera.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-alquiler-vs-compra/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Alquilar o comprar casa? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para saber si estás en el momento vital adecuado para comprar o si es mejor seguir alquilando.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-alquiler-vs-compra/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Alquiler o Compra',
      description: 'Test orientativo para saber si conviene más alquilar o comprar vivienda según situación laboral, personal y del mercado. Sin cálculos financieros, análisis de situación vital.',
      url: 'https://meskeia.com/selector-alquiler-vs-compra/',
      features: [
        'Test de 10 preguntas sobre situación vital',
        'Análisis de estabilidad laboral y personal',
        'Evaluación del horizonte temporal',
        'Consideración del mercado local',
        'Resultado: alquila, compra o espera',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Alquiler o Compra",
  description: "Test de 10 preguntas para saber si te conviene más alquilar o comprar vivienda según tu situación personal, laboral y vital. Sin cálculos, solo tu contexto real.",
  url: "https://meskeia.com/selector-alquiler-vs-compra/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo conviene más alquilar que comprar una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Alquilar suele ser más conveniente cuando tu situación laboral o personal es inestable, cuando planeas cambiar de ciudad en los próximos 5 años, cuando no tienes ahorros suficientes para la entrada (generalmente el 20-30% del precio más gastos), o cuando los precios de compra en tu zona son muy elevados respecto a los alquileres. La flexibilidad del alquiler tiene un valor real que los cálculos puramente financieros no siempre capturan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos ahorros necesito para comprar un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como referencia, los bancos financian hasta el 80% del precio de tasación, por lo que necesitas cubrir el 20% restante con ahorros propios. A esto hay que sumar los gastos de compraventa: en España, entre el 10% y el 15% adicional del precio (ITP o IVA, notaría, registro, gestoría). En total, para un piso de 200.000 €, necesitarías disponer de entre 60.000 y 70.000 € en ahorros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es verdad que alquilar es "tirar el dinero"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No necesariamente. Al comprar también se "tiran" dinero los intereses de la hipoteca (que pueden superar el 30-50% del capital en los primeros años), los gastos de comunidad, el IBI, las derramas, el mantenimiento y los costes de transacción al vender. Alquilar ofrece flexibilidad y libera capital que puede invertirse de otras formas. La decisión óptima depende del mercado local, el horizonte temporal y la situación vital de cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años tengo que quedarme en una casa comprada para que salga rentable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estudios sobre el mercado español sitúan el punto de equilibrio entre alquilar y comprar generalmente en 7 a 12 años, dependiendo del precio de compra, el alquiler equivalente y la evolución del mercado local. En zonas con precios de compra muy altos respecto a los alquileres (como ciertas áreas de Madrid o Barcelona), el plazo puede ser aún mayor. Con un horizonte de menos de 5 años, la compra raramente compensa los costes de transacción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores personales influyen más en la decisión de comprar o alquilar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores más determinantes son: la estabilidad laboral y de ingresos, el horizonte temporal en la misma ciudad, la situación familiar (pareja, hijos previstos), los ahorros disponibles y la tolerancia al riesgo financiero. Los factores puramente económicos (precio de compra frente a alquiler equivalente) son importantes, pero una situación vital inestable puede hacer que comprar sea un riesgo importante aunque los números parezcan favorables.',
      },
    },
  ],
};
