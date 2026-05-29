import { Metadata } from 'next';

import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de MRU y MRUA - Cinemática (Caída Libre, Tiro Parabólico)',
  description: 'Resuelve problemas de cinemática paso a paso: MRU (movimiento uniforme), MRUA (uniformemente acelerado), caída libre y tiro parabólico. Con fórmulas y ejemplos.',
  keywords: 'cinemática, física, MRU, MRUA, caída libre, tiro parabólico, velocidad, aceleración, distancia, tiempo, movimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de MRU y MRUA - Cinemática Paso a Paso',
    description: 'MRU, MRUA, caída libre y tiro parabólico. Resuelve velocidad, aceleración, distancia y tiempo con fórmulas y ejemplos.',
    url: 'https://meskeia.com/calculadora-movimiento/',
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
    title: 'Calculadora de MRU y MRUA - Cinemática',
    description: 'Caída libre, tiro parabólico, velocidad y aceleración. Fórmulas y ejemplos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

const webAppSchema = generateWebAppSchema({
  name: "Calculadora de Movimiento - Cinemática MRU, MRUA, Caída Libre",
  description: "Calculadora de cinemática con MRU, MRUA, caída libre y tiro parabólico. Calcula velocidad, aceleración, distancia y tiempo con fórmulas y ejemplos prácticos.",
  url: 'https://meskeia.com/calculadora-movimiento/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/calculadora-movimiento/',
  mainEntity: [
    {
      question: '¿Cuál es la diferencia entre velocidad y aceleración?',
      answer: 'La velocidad indica cuánto espacio recorre un objeto por unidad de tiempo (m/s). La aceleración mide cuánto cambia esa velocidad por unidad de tiempo (m/s²). Un objeto puede ir muy rápido pero con aceleración cero (MRU), o estar casi parado pero acelerando rápidamente.',
    },
    {
      question: '¿Por qué el ángulo de 45° da el alcance máximo en tiro parabólico?',
      answer: 'El alcance es R = v₀²·sin(2θ)/g. La función sin(2θ) tiene su valor máximo (= 1) cuando 2θ = 90°, es decir, θ = 45°. Para ese ángulo, la velocidad se reparte igual entre componente horizontal y vertical, logrando el equilibrio óptimo entre distancia y altura.',
    },
    {
      question: '¿Qué pasa si la aceleración es negativa en MRUA?',
      answer: 'Una aceleración negativa (desaceleración o frenado) significa que el objeto pierde velocidad. Si la velocidad inicial es positiva y la aceleración negativa, el objeto se frena hasta detenerse (v = 0) y, si continúa la aceleración, invierte su movimiento. Ejemplo: un coche frenando a −5 m/s² desde 20 m/s se detiene en t = 20/5 = 4 s.',
    },
    {
      question: '¿La masa afecta a la caída libre? ¿Por qué?',
      answer: 'No, en caída libre ideal (sin resistencia del aire) todos los objetos caen igual independientemente de su masa. Galileo lo demostró: la fuerza gravitacional es F = m·g, pero también F = m·a, por lo que a = g para cualquier masa. En la realidad, la resistencia del aire sí diferencia objetos según su forma y densidad.',
    },
    {
      question: '¿Cómo se calcula la distancia de frenado de un coche a 120 km/h?',
      answer: 'Primero convierte: 120 km/h ÷ 3,6 = 33,33 m/s. Con una deceleración típica de −7 m/s²: d = v²/(2·|a|) = 33,33²/(2·7) = 1.110,9/14 ≈ 79,4 m. A esto hay que sumar la distancia de reacción: d_reac = 33,33 × 0,7 s ≈ 23,3 m. Total: ≈ 102,7 m.',
    },
    {
      question: '¿En qué se diferencia la caída libre del tiro parabólico?',
      answer: 'En la caída libre el objeto solo tiene movimiento vertical (v₀ horizontal = 0). En el tiro parabólico hay además una velocidad horizontal inicial que se mantiene constante durante todo el vuelo. El resultado es una trayectoria curva (parábola) en lugar de una línea vertical.',
    },
    {
      question: '¿Cómo convierto km/h a m/s?',
      answer: 'Divide entre 3,6: m/s = km/h ÷ 3,6. La razón: 1 km = 1.000 m y 1 h = 3.600 s, por tanto 1 km/h = 1.000/3.600 m/s = 1/3,6 m/s. Ejemplos: 36 km/h → 10 m/s, 90 km/h → 25 m/s, 120 km/h → 33,33 m/s.',
    },
    {
      question: '¿Qué errores son más frecuentes en los problemas de cinemática?',
      answer: 'Los cinco fallos más comunes son: (1) no convertir unidades al SI antes de calcular, (2) olvidar el signo negativo en desaceleraciones, (3) confundir distancia con desplazamiento en MRUA, (4) no descomponer la velocidad inicial en tiro parabólico, y (5) usar g = 10 cuando el enunciado no lo especifica.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre MRU y MRUA en física?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El MRU (Movimiento Rectilíneo Uniforme) ocurre cuando un objeto se desplaza en línea recta a velocidad constante, sin aceleración. El MRUA (Movimiento Rectilíneo Uniformemente Acelerado) se da cuando la velocidad cambia de forma constante por la acción de una aceleración uniforme, como ocurre en la caída libre o en un coche que frena. La fórmula del MRU es d = v·t, mientras que en MRUA se usa d = v₀·t + ½·a·t².',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la velocidad final en un movimiento uniformemente acelerado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula es v = v₀ + a·t, donde v₀ es la velocidad inicial, a es la aceleración y t es el tiempo transcurrido. Si un objeto parte del reposo (v₀ = 0) con una aceleración de 5 m/s² durante 4 segundos, alcanza una velocidad final de 20 m/s. Para calcular la distancia recorrida en ese caso: d = ½·a·t² = ½·5·16 = 40 m.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda un objeto en caer desde determinada altura en caída libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En caída libre (sin rozamiento del aire) la fórmula es t = √(2h/g), donde h es la altura en metros y g = 9,8 m/s². Desde 20 m: t = √(2·20/9,8) ≈ 2,02 s. Desde 45 m: t ≈ 3,03 s. La velocidad al impactar se obtiene con v = g·t. Recuerda convertir siempre las unidades al Sistema Internacional antes de calcular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué niveles educativos es útil esta calculadora de cinemática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora cubre los contenidos de cinemática que se trabajan en los últimos años de educación secundaria y en el primer año universitario de física. Es especialmente útil para estudiantes que preparan exámenes de admisión universitaria, asignaturas de física general o que quieren repasar conceptos de MRU, MRUA, caída libre y tiro parabólico con ejemplos resueltos paso a paso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el tiro parabólico y qué ángulo da el mayor alcance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el tiro parabólico un objeto lanzado con velocidad inicial v₀ y ángulo θ describe una trayectoria curva. El movimiento horizontal es uniforme (vₓ = v₀·cos θ) y el vertical es uniformemente acelerado (vy = v₀·sin θ − g·t). El alcance máximo se obtiene con θ = 45°, ya que maximiza la función sin(2θ). Para un lanzamiento horizontal desde altura h, el alcance es x = v₀·√(2h/g).',
      },
    },
  ],
};
