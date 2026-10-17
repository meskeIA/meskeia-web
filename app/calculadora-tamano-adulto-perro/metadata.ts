import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { rangosTipicos } from './razas';

export const metadata: Metadata = {
  title: 'Calculadora de Peso y Tamaño Adulto del Cachorro por Raza',
  description: 'Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia.',
  keywords: 'peso adulto cachorro, tamaño perro adulto, crecimiento cachorro, predicción peso perro, raza perro, cuánto pesará mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Peso y Tamaño Adulto del Cachorro',
    description: 'Predice cuánto pesará tu cachorro cuando sea adulto',
    url: 'https://meskeia.com/calculadora-tamano-adulto-perro/',
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
    title: 'Predictor de Peso y Tamaño Adulto del Cachorro',
    description: 'Calcula el peso final de tu cachorro según su raza y peso actual',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Tamaño Adulto Cachorro",
  description: "Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia.",
  url: "https://meskeia.com/calculadora-tamano-adulto-perro/",
  category: 'UtilityApplication',
  features: [
    'Predicción del peso adulto a partir del peso y edad actuales del cachorro',
    'Curvas de crecimiento específicas para 5 tamaños de raza (mini a gigante)',
    'Rango de peso probable con margen de error del ±15 %',
    'Tabla de referencia con más de 25 razas y su peso adulto típico',
    'Indicación de la edad de maduración esperada según el tamaño',
    'Filtros por categoría de tamaño en la tabla de razas',
    'Ración diaria orientativa del cachorro en kcal y en gramos de su pienso (ecuación de crecimiento NRC 2006)',
  ],
});

/**
 * Preguntas que se publican en DOS bocas: el FAQPage de abajo y la FAQ visible de `page.tsx`.
 * Hallazgo 3330 (16/10/2026): cada boca tenía su respuesta escrita a mano y ya decían cosas
 * distintas (la visible callaba los grandes y los pesos; la del JSON-LD, los mini). Una sola
 * constante por pregunta, como en `simulador-gastos-compraventa-garaje` (§1.ter).
 */
export const PREGUNTA_EDAD_DEJA_DE_CRECER = '¿A qué edad dejan de crecer los perros según su tamaño?';
export const RESPUESTA_EDAD_DEJA_DE_CRECER = `Depende del tamaño de la raza: cuanto mayor es el perro, más tarde madura. Los perros mini (${rangosTipicos.mini.etiqueta} de adulto) terminan de crecer hacia los 8-10 meses y los de razas pequeñas (${rangosTipicos.pequeno.etiqueta}), hacia los 10-12 meses. Las razas medianas (${rangosTipicos.mediano.etiqueta}) maduran entre los 12 y 15 meses. Las razas grandes (${rangosTipicos.grande.etiqueta}) tardan entre 18 y 24 meses, y las razas gigantes (${rangosTipicos.gigante.etiqueta}), como el Gran Danés o el San Bernardo, pueden seguir creciendo hasta los 24-36 meses. Los rangos salen de las razas de referencia de la propia calculadora y se solapan en los bordes, porque describen pesos reales de razas, no tramos administrativos.`;

export const PREGUNTA_ALIMENTACION_TAMANO = '¿Influye la alimentación en el tamaño final de un perro?';
export const RESPUESTA_ALIMENTACION_TAMANO = 'Sí, aunque la genética es el factor determinante: la alimentación no puede hacer que un perro supere su potencial genético, pero una dieta deficiente sí puede impedir que lo alcance. La sobrealimentación en cachorros de razas grandes acelera el desarrollo óseo y aumenta el riesgo de problemas articulares. Los piensos específicos para cachorros de raza grande o gigante están formulados para un crecimiento más controlado.';

/**
 * Hallazgo 3329 (16/10/2026): esta respuesta era la última copia de la clasificación por peso
 * escrita a mano (mediano «entre 10 y 25 kg», grande «entre 25 y 45 kg»), la misma que el
 * hallazgo 51 retiró de la pregunta 2. Con ella el Husky (16-27 kg) y el Rottweiler (desde
 * 35 kg) quedaban fuera de la categoría en la que los pone la app. Ahora se deriva, como la 2,
 * de `rangosTipicos`.
 */
const RESPUESTA_DIFERENCIA_TAMANOS = `La clasificación varía según la fuente. Esta calculadora la deriva del peso adulto típico de sus razas de referencia: razas mini, ${rangosTipicos.mini.etiqueta} (Chihuahua, Yorkshire, Pomerania); razas pequeñas, ${rangosTipicos.pequeno.etiqueta} (Bichón Frisé, Jack Russell, Shih Tzu); razas medianas, ${rangosTipicos.mediano.etiqueta} (Beagle, Cocker Spaniel, Border Collie); razas grandes, ${rangosTipicos.grande.etiqueta} (Labrador Retriever, Golden Retriever, Pastor Alemán, Husky Siberiano); y razas gigantes, ${rangosTipicos.gigante.etiqueta} (Gran Danés, San Bernardo, Terranova, Rottweiler). Los rangos se solapan en los bordes porque describen pesos reales de razas, no tramos excluyentes: un perro de 15 kg puede ser de raza pequeña o mediana según cuál sea.`;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo puedo saber cuánto pesará mi cachorro de adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora divide el peso actual entre el porcentaje de peso adulto que corresponde a esa edad y a ese tamaño de raza. Una raza grande a las 14 semanas ronda el 35 % de su peso adulto, así que 12 kg a esa edad proyectan unos 34,3 kg. Circulan reglas más rápidas, como multiplicar por 2 el peso de una raza mediana a las 16 semanas, que coincide con la curva en ese punto concreto pero pierde precisión fuera de él. En todos los casos son estimaciones: la genética individual y la alimentación influyen en el resultado final.',
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_EDAD_DEJA_DE_CRECER,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_EDAD_DEJA_DE_CRECER,
      },
    },
    {
      '@type': 'Question',
      name: '¿Es fiable predecir el peso adulto de un perro mestizo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La predicción es menos precisa en perros mestizos porque desconocemos la genética completa del animal. Sin embargo, el peso a las 8-12 semanas sigue siendo un indicador útil: los cachorros mestizos pequeños a esa edad suelen ser adultos pequeños o medianos. Si conoces las razas de los progenitores, puedes hacer una estimación promediando los pesos adultos típicos de ambas razas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un perro de raza pequeña, mediana y grande?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_DIFERENCIA_TAMANOS,
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_ALIMENTACION_TAMANO,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_ALIMENTACION_TAMANO,
      },
    },
  ],
};
