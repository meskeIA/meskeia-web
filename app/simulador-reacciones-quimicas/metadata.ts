import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Reacciones Químicas | meskeIA',
  description: 'Calculadora de estequiometría y reactivo limitante para 20 reacciones químicas reales. Dado X gramos o moles de una sustancia, calcula todos los demás. Encuentra el reactivo que agota primero y el rendimiento teórico.',
  keywords: [
    'estequiometría química',
    'reactivo limitante',
    'cálculo moles gramos',
    'reacciones químicas calculadora',
    'rendimiento teórico reacción',
    'masa molar cálculo',
    'química bachillerato',
    'calculadora química',
    'balanceo estequiometrico',
    'síntesis combustión descomposición',
  ],
  openGraph: {
    title: 'Simulador de Reacciones Químicas | meskeIA',
    description: 'Estequiometría y reactivo limitante para 20 reacciones reales. Convierte gramos ↔ moles, calcula cantidades de todos los productos y reactivos.',
    url: 'https://meskeia.com/simulador-reacciones-quimicas/',
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
  alternates: {
    canonical: 'https://meskeia.com/simulador-reacciones-quimicas/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador de Reacciones Químicas",
  description: "Calculadora de estequiometría y reactivo limitante para 20 reacciones químicas reales. Dado X gramos o moles de una sustancia, calcula todos los demás. Encuentra el reactivo que agota primero y el ren",
  url: "https://meskeia.com/simulador-reacciones-quimicas/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la estequiometría y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estequiometría es la rama de la química que estudia las proporciones cuantitativas en que reaccionan los elementos y compuestos. Permite calcular cuántos gramos de un producto se forman a partir de una cantidad dada de reactivos, cuánto reactivo se consume en la reacción y qué cantidad de reactivo quedará en exceso. Es fundamental en laboratorio, industria química y en los exámenes de química de secundaria y bachillerato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el reactivo limitante en una reacción química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reactivo limitante es el compuesto que se agota primero en una reacción química, deteniendo el proceso y determinando la cantidad máxima de producto que puede obtenerse. El resto de reactivos quedan en exceso. Para identificarlo hay que comparar la relación molar de los reactivos disponibles con la que indica la ecuación balanceada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierten gramos a moles en química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para convertir gramos a moles se divide la masa en gramos entre la masa molar de la sustancia (g/mol). Por ejemplo, 18 g de agua (H₂O, masa molar 18 g/mol) equivalen a 1 mol. La masa molar se obtiene sumando las masas atómicas de todos los átomos de la fórmula molecular, datos que aparecen en la tabla periódica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un simulador de reacciones químicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de secundaria, bachillerato y primer año de universidad que necesiten practicar problemas de estequiometría antes de un examen. También es una herramienta de repaso rápido para docentes que quieran verificar resultados o preparar ejercicios. No requiere instalar ningún programa; funciona directamente en el navegador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de reacciones químicas incluye el simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador incluye 20 reacciones reales de los principales tipos: síntesis (combinación de elementos simples), descomposición (ruptura de un compuesto), combustión (reacción con oxígeno que produce CO₂ y H₂O) y doble desplazamiento (intercambio de iones). Cada reacción usa coeficientes estequiométricos reales y masas molares precisas de los elementos.',
      },
    },
  ],
};
