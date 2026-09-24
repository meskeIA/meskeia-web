import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FRASE_PLAZO_DEL_TEST, FRASE_SIN_PLAZO_UNIVERSAL } from './motor';
import {
  AHORRO_NECESARIO_USADA,
  AVAL_ICO,
  ENTRADA_HABITUAL,
  FINANCIACION_HABITUAL,
  FRASE_GASTOS,
  FRASE_INTERESES,
  PRECIO_EJEMPLO,
  porcentaje,
} from './cifras';
import { formatNumber } from '@/lib';

/**
 * Las funciones de la app, UNA lista para la etiqueta meta y para el JSON-LD. El JSON-LD que
 * inyecta layout.tsx salía con `features: []` mientras la meta llevaba ocho (hallazgo 1470).
 */
const FUNCIONES = [
  'Test de 10 preguntas sobre tu situación laboral, personal y económica',
  'Resultado en tres niveles (alquilar, esperar o comprar) con la puntuación y los umbrales a la vista',
  'Razones sacadas de tus propias respuestas, a favor y en contra',
  'Avisa cuando el ahorro para la entrada o el plazo de permanencia impiden recomendar la compra',
  'Gastos de compra en España calculados con los tipos generales de cada comunidad',
  'Próximos pasos según tu resultado y lo que has declarado',
  'Sin registro ni datos personales',
];

export const metadata: Metadata = {
  title: 'Selector de Alquiler (Arriendo) o Compra — ¿Qué te conviene? | meskeIA',
  description: 'Test de 10 preguntas para saber si te conviene más alquilar (arrendar) o comprar vivienda según tu situación personal, laboral y vital. Sin cálculos, solo tu contexto real.',
  keywords: [
    'alquilar o comprar vivienda',
    'arrendar vs comprar',
    'arriendo vs compra',
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
    title: '¿Alquilar (arrendar) o comprar? Test en 10 preguntas | meskeIA',
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
      features: FUNCIONES,
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Alquiler (Arriendo) o Compra",
  description: "Test de 10 preguntas para saber si te conviene más alquilar (arrendar) o comprar vivienda según tu situación personal, laboral y vital. Sin cálculos, solo tu contexto real.",
  url: "https://meskeia.com/selector-alquiler-vs-compra/",
  category: 'FinanceApplication',
  features: FUNCIONES,
});

const FINANCIA = porcentaje(FINANCIACION_HABITUAL.maximo);
const ENTRADA = porcentaje(ENTRADA_HABITUAL);

/*
 * El FAQPage es lo que leen buscadores e IA, y no puede dar otras cifras que la pantalla: los
 * gastos, el ejemplo de la hipoteca y el aval salen de ./cifras.ts, y el plazo de ./motor.ts,
 * igual que la guía y los avisos. Decía «entre el 10% y el 15%» de gastos (hallazgo 1462),
 * «7 a 12 años» según unos estudios sin citar (1463), intereses del «30-50% del capital en los
 * primeros años» (1466) y el 20 % «con ahorros propios» sin mencionar el aval ICO (1467).
 */
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo conviene más alquilar (arrendar) que comprar una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Alquilar (lo que en buena parte de Latinoamérica se denomina arrendar) suele ser más conveniente cuando tu situación laboral o personal es inestable, cuando prevés cambiar de ciudad en pocos años, cuando no tienes ahorro para la entrada y los gastos de compra (el banco suele financiar como máximo el ${FINANCIA} del valor de tasación, así que el ${ENTRADA} restante y los gastos salen de tus ahorros), o cuando los precios de compra en tu zona son muy elevados respecto a los alquileres. La flexibilidad del alquiler tiene un valor real que los cálculos puramente financieros no siempre capturan.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos ahorros necesito para comprar un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Como referencia, según el Banco de España las entidades financian normalmente hasta el ${FINANCIA} del valor de tasación, así que el ${ENTRADA} restante y los gastos de compra salen de tus ahorros. La excepción es el ${AVAL_ICO.nombre}: ${AVAL_ICO.descripcion} En cuanto a los gastos, en España, ${FRASE_GASTOS}. Para una vivienda usada de ${formatNumber(PRECIO_EJEMPLO, 0)} €, eso supone reunir entre ${AHORRO_NECESARIO_USADA.min} y ${AHORRO_NECESARIO_USADA.max}, según la comunidad.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Es verdad que alquilar es "tirar el dinero"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `No necesariamente. Al comprar también se "tiran" dinero los intereses de la hipoteca (${FRASE_INTERESES}), los gastos de comunidad, el IBI, las derramas, el mantenimiento y los costes de transacción al vender. Alquilar ofrece flexibilidad y libera capital que puede invertirse de otras formas. La decisión óptima depende del mercado local, el horizonte temporal y la situación vital de cada persona.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años tengo que quedarme en una casa comprada para que salga rentable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${FRASE_SIN_PLAZO_UNIVERSAL} Los gastos de compra no se recuperan al vender: en España, ${FRASE_GASTOS}. ${FRASE_PLAZO_DEL_TEST}`,
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
