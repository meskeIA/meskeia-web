import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Desempleo: Friccional, Estructural, Cíclico — meskeIA',
  description:
    'Visualizador de los 4 tipos de desempleo (friccional, estructural, cíclico, estacional), NAIRU, curva de Beveridge, evolución histórica España vs EU y políticas activas vs pasivas.',
  keywords: [
    'tipos de desempleo',
    'desempleo friccional estructural cíclico',
    'NAIRU tasa paro natural',
    'curva de Beveridge',
    'tasa paro España historia',
    'políticas activas pasivas empleo',
    'paro España vs Europa',
    'ERTE reforma laboral 2022',
  ],
  openGraph: {
    title: 'Tipos de Desempleo: Friccional, Estructural, Cíclico — meskeIA',
    description:
      'Por qué hay desempleo, sus 4 tipos y qué pueden hacer las políticas económicas.',
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
  name: "Tipos de Desempleo: Friccional, Estructural y Cíclico",
  description: "Visualizador de los 4 tipos de desempleo (friccional, estructural, cíclico, estacional), NAIRU, curva de Beveridge, evolución histórica España vs EU y políticas activas vs pasivas.",
  url: "https://meskeia.com/visualizador-desempleo-tipos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los tipos de desempleo que existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los economistas distinguen cuatro tipos principales de desempleo: friccional (personas entre empleos por búsqueda voluntaria), estructural (trabajadores cuyas habilidades no coinciden con la demanda del mercado), cíclico (causado por la caída de la actividad económica) y estacional (varía con las estaciones, como el turismo o la agricultura). Cada tipo requiere políticas diferentes para reducirse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el NAIRU o tasa de paro natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El NAIRU (Non-Accelerating Inflation Rate of Unemployment) es la tasa de desempleo por debajo de la cual la inflación tiende a acelerarse. Incluye el desempleo friccional y estructural que siempre existe en una economía dinámica. No es un objetivo deseable en sí mismo, sino el límite inferior práctico del desempleo sin tensiones inflacionarias. En la eurozona se estima alrededor del 6-7%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué tiene España históricamente más paro que el resto de Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tasa de paro estructural de España es persistentemente más alta que la media europea por varios factores: alta dualidad del mercado laboral (contratos temporales vs indefinidos), sectores muy expuestos a ciclos (construcción, turismo), dificultades en la transición educación-empleo para jóvenes y diferencias regionales muy pronunciadas. La reforma laboral de 2022 ha reducido la temporalidad, pero la brecha con Europa sigue siendo de varios puntos porcentuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la curva de Beveridge y qué mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La curva de Beveridge representa la relación entre la tasa de desempleo y la tasa de vacantes sin cubrir en una economía. Cuando la curva se desplaza hacia la derecha, indica un aumento del desempleo estructural: hay muchas vacantes pero los desempleados no tienen las habilidades o la ubicación que demandan las empresas. Es una herramienta clave para diagnosticar si el paro es cíclico (se corrige solo al crecer la economía) o estructural (requiere formación y políticas activas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre políticas activas y pasivas de empleo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las políticas pasivas de empleo proporcionan ingresos a los desempleados sin exigir contrapartidas (prestación por desempleo, subsidios). Las políticas activas buscan reintegrar a los desempleados en el mercado laboral mediante formación, orientación, incentivos a la contratación o empleo público directo. La evidencia empírica muestra que combinar ambas —con prestaciones condicionadas a participar en actividades activas— produce mejores resultados que usar solo una de ellas.',
      },
    },
  ],
};
