import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánto Pesa una Decisión - Impacto Acumulado a 10 Años | meskeIA',
  description: 'Visualiza el impacto acumulado de decisiones cotidianas a 10 años: dejar de fumar, caminar 30 min/día, ahorrar 5 €/día, dormir 1h más. Efecto multiplicador.',
  keywords: 'impacto decisiones, efecto acumulado, hábitos largo plazo, dejar fumar ahorro, caminar salud, decisiones cotidianas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuánto Pesa una Decisión',
    description: 'El impacto acumulado de decisiones cotidianas. Pequeños cambios, grandes resultados.',
    url: 'https://meskeia.com/visualizador-peso-decisiones/',
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
    title: 'Cuánto Pesa una Decisión',
    description: 'Pequeñas decisiones diarias con impacto enorme a 10 años.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Peso Decisiones meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánto Pesa una Decisión',
  description: 'Explicador visual del impacto acumulado de decisiones cotidianas proyectadas a 1, 5 y 10 años: salud, dinero, tiempo y bienestar. Cada decisión con su efecto multiplicador.',
  url: 'https://meskeia.com/visualizador-peso-decisiones/',
  features: [
    '10 decisiones cotidianas con impacto a largo plazo',
    'Proyección a 1, 5 y 10 años',
    'Categorías: salud, dinero, tiempo, bienestar',
    'Efecto acumulado visualizado con barras',
    'Esfuerzo vs. impacto: dificultad de cada decisión frente a su beneficio',
    'Desglose por ámbito: horas ganadas, euros ahorrados, puntos de salud',
    'Ejemplos reales: ejercicio, sueño, comida procesada, ahorro mensual',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dinero se ahorra en 10 años dejando de fumar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fumando un paquete diario a un precio medio de 5,50 € en España, el gasto anual supera los 2.000 €. A lo largo de 10 años eso equivale a más de 20.000 €. Si ese dinero se invirtiera con un rendimiento moderado del 5 % anual, el resultado compuesto sería aún mayor. El impacto en salud es adicional e independiente del económico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo influye caminar 30 minutos al día en la salud a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Caminar 30 minutos diarios a ritmo moderado suma alrededor de 182 horas de actividad física al año. Estudios de seguimiento a largo plazo asocian este hábito con una reducción del riesgo de enfermedades cardiovasculares, mejor control del peso y menor probabilidad de diabetes tipo 2. A 10 años, el efecto acumulado en bienestar general es difícil de cuantificar en una sola cifra, pero el beneficio es sólido y bien documentado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el efecto del interés compuesto en el ahorro diario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés compuesto hace que los rendimientos se reinviertan y generen nuevos rendimientos sobre rendimientos previos. Ahorrar 5 € al día equivale a 1.825 € anuales. Con una rentabilidad del 5 % anual compuesto, tras 10 años el capital acumulado supera los 23.000 € en lugar de los 18.250 € que resultarían sin rentabilidad. A 20 años la diferencia se multiplica drásticamente por el efecto de aceleración exponencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve visualizar el impacto de las decisiones cotidianas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las personas tendemos a infravalorar los cambios pequeños porque su efecto es imperceptible día a día. Visualizar el resultado acumulado a 1, 5 y 10 años hace tangible lo que el cerebro no puede intuir directamente. Esta perspectiva no sustituye la toma de decisiones individual ni tiene en cuenta circunstancias personales, pero puede servir de punto de partida para reflexionar sobre hábitos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dormir una hora más cada noche tiene impacto real a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dormir entre 7 y 9 horas se asocia con mejor rendimiento cognitivo, menor riesgo de obesidad y mejor regulación del estado de ánimo, según recomendaciones de la Sociedad Española del Sueño. Añadir una hora de sueño cuando se partía de un déficit crónico representa más de 365 horas adicionales de descanso al año. El beneficio no es lineal y depende de la calidad del sueño, pero la privación crónica acumulada tiene efectos negativos bien documentados.',
      },
    },
  ],
};
