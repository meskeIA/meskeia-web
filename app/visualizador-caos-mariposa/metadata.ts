import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Caos y Efecto Mariposa: El Atractor de Lorenz | meskeIA',
  description:
    'Visualiza el atractor de Lorenz y el efecto mariposa: dos trayectorias casi idénticas que divergen completamente. Caos determinista, sensibilidad a condiciones iniciales y sistemas caóticos reales.',
  keywords: [
    'efecto mariposa caos',
    'atractor de Lorenz visualizador',
    'caos determinista',
    'sensibilidad condiciones iniciales',
    'exponente Lyapunov',
    'sistemas caóticos ejemplos',
    'bifurcación logística',
    'predicción meteorología límites',
  ],
  openGraph: {
    title: 'Caos y Efecto Mariposa: El Atractor de Lorenz',
    description:
      'Dos trayectorias separadas por 0.01 que acaban en lugares completamente distintos. El caos visualizado.',
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
  name: "Caos y Mariposa: El Atractor de Lorenz",
  description: "Visualiza el atractor de Lorenz y el efecto mariposa: dos trayectorias casi idénticas que divergen completamente. Caos determinista, sensibilidad a condiciones iniciales y sistemas caóticos reales.",
  url: "https://meskeia.com/visualizador-caos-mariposa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el efecto mariposa y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto mariposa es la idea de que pequeñas diferencias en las condiciones iniciales de un sistema caótico pueden producir resultados radicalmente distintos. El meteorólogo Edward Lorenz lo formuló en 1963 al observar que una variación de 0,000127 en sus simulaciones atmosféricas cambiaba por completo la predicción del tiempo. Esta sensibilidad explica por qué el pronóstico del tiempo fiable solo alcanza unos 10-14 días.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el atractor de Lorenz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El atractor de Lorenz es una figura tridimensional con forma de mariposa que aparece al representar las trayectorias de un sistema de tres ecuaciones diferenciales propuesto por Lorenz para modelar la convección atmosférica. Aunque el sistema es determinista, las trayectorias nunca se repiten exactamente, lo que lo convierte en uno de los ejemplos más visuales del caos matemático.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El caos determinista significa que el futuro es impredecible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No exactamente: determinista significa que el sistema sigue leyes fijas sin azar. El problema es que la sensibilidad extrema a las condiciones iniciales hace imposible conocerlas con precisión infinita, lo que limita la predicción práctica. A corto plazo el sistema es predecible; a largo plazo, no. Esta diferencia entre determinismo e impredecibilidad es el núcleo de la teoría del caos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sistemas reales se comportan de forma caótica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Numerosos fenómenos naturales muestran comportamiento caótico: la meteorología, las turbulencias en fluidos, ciertas dinámicas poblacionales en ecología, el ritmo cardíaco en algunas arritmias, los mercados financieros y hasta la órbita de algunos planetas del sistema solar a muy largo plazo. El caos no implica desorden aleatorio, sino un orden subyacente muy sensible a pequeñas perturbaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el exponente de Lyapunov y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El exponente de Lyapunov mide la velocidad a la que dos trayectorias inicialmente cercanas se separan en un sistema dinámico. Un valor positivo indica caos: cuanto mayor es, más rápidamente divergen las trayectorias. En el atractor de Lorenz el mayor exponente es aproximadamente 0,9, lo que significa que el error en la predicción se duplica aproximadamente cada 0,77 unidades de tiempo.',
      },
    },
  ],
};
