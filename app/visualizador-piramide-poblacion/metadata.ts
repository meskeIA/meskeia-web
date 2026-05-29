import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Pirámide de Población: España 1950-2100 | meskeIA',
  description: 'Visualiza cómo envejece España. Pirámide de población interactiva con datos del INE: desde 1950 hasta las proyecciones del año 2100. Tasa de dependencia y edad mediana.',
  keywords: ['pirámide de población', 'demografía España', 'envejecimiento población', 'INE', 'tasa de dependencia', 'proyecciones demográficas', 'edad mediana España'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Pirámide de Población: España 1950-2100',
    description: 'Visualiza cómo envejece España con datos del INE y proyecciones hasta 2100.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-piramide-poblacion/',
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
    title: 'Pirámide de Población: España 1950-2100',
    description: 'Cómo envejece España: pirámide de población interactiva con datos del INE y proyecciones hasta 2100.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Pirámide de Población meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: "Pirámide de Población: España 1950-2100",
  description: "Visualiza cómo envejece España. Pirámide de población interactiva con datos del INE: desde 1950 hasta las proyecciones del año 2100. Tasa de dependencia y edad mediana.",
  url: "https://meskeia.com/visualizador-piramide-poblacion/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una pirámide de población y cómo se lee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una pirámide de población es un gráfico de barras horizontales dobles que muestra la distribución por edad y sexo de una población. El eje central indica los grupos de edad (de 0 a 100+ años), las barras izquierdas representan a los hombres y las derechas a las mujeres. Una pirámide ancha en la base y estrecha en la cima indica población joven y alta natalidad; una forma más rectangular o invertida señala envejecimiento y baja natalidad, como ocurre en España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo está envejeciendo la población española según el INE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según las proyecciones del Instituto Nacional de Estadística (INE), España pasará de tener el 20% de su población mayor de 65 años en 2020 a superar el 30% hacia 2050. La edad mediana, que rondaba los 45 años en 2020, superará los 50 años en 2040. La tasa de natalidad (1,2 hijos por mujer en 2023) está muy por debajo del nivel de reemplazo generacional (2,1), lo que agudiza el proceso de envejecimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la tasa de dependencia demográfica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tasa de dependencia mide la proporción entre la población en edad activa (15-64 años) y la población dependiente (menores de 15 y mayores de 64). Una tasa del 50% significa que hay dos activos por cada dependiente. En España, esta tasa superará el 80% hacia 2050 según el INE, lo que implica mayor presión sobre el sistema de pensiones, la sanidad y los servicios de atención a mayores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el envejecimiento de España al sistema de pensiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema de pensiones contributivo español es de reparto: los trabajadores activos financian las pensiones actuales. Con menos jóvenes y más jubilados, el ratio cotizantes/pensionistas se deteriora. En 1980 había más de 4 cotizantes por pensionista; en 2023 eran alrededor de 2,3, y las proyecciones apuntan a menos de 2 hacia 2045. Esto genera presión para reformas como retrasar la edad de jubilación, aumentar cotizaciones o diversificar las fuentes de financiación del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las proyecciones de población de España para el año 2100?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las proyecciones del INE para 2100 muestran una España con una pirámide prácticamente invertida: más personas mayores de 65 años que menores de 30. La población total podría oscilar entre 35 y 45 millones dependiendo de los flujos migratorios y la evolución de la fecundidad. La edad mediana podría superar los 55 años. Estas son proyecciones estadísticas sujetas a revisión; los cambios en políticas migratorias o de conciliación pueden alterar significativamente los resultados.',
      },
    },
  ],
};
