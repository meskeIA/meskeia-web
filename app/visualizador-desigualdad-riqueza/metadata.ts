import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Desigualdad de la Riqueza - Curva de Lorenz y Coeficiente Gini | meskeIA',
  description: 'Visualiza la distribución de la riqueza con la curva de Lorenz, el coeficiente Gini, la paradoja del 1%, datos reales de España y el mundo, y el efecto acumulación.',
  keywords: ['desigualdad riqueza', 'curva de lorenz', 'coeficiente gini', 'distribucion riqueza', 'el 1%', 'oxfam', 'desigualdad españa', 'riqueza global', 'impuesto patrimonio', 'redistribucion'],
  openGraph: {
    title: 'Desigualdad de la Riqueza | meskeIA',
    description: 'Curva de Lorenz interactiva, Gini y distribución de la riqueza global.',
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
  name: "Desigualdad de la Riqueza - Curva de Lorenz y Coeficiente Gini",
  description: "Visualiza la distribución de la riqueza con la curva de Lorenz, el coeficiente Gini, la paradoja del 1%, datos reales de España y el mundo, y el efecto acumulación.",
  url: "https://meskeia.com/visualizador-desigualdad-riqueza/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el coeficiente Gini y cómo se interpreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coeficiente Gini es un indicador estadístico que mide la desigualdad en la distribución de la riqueza o los ingresos dentro de una población. Toma valores entre 0 (igualdad perfecta, todos tienen lo mismo) y 1 (desigualdad máxima, una sola persona lo tiene todo). Un Gini por encima de 0,35 se considera alto en economías desarrolladas; España se sitúa habitualmente en torno a 0,33-0,35 en renta disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la curva de Lorenz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La curva de Lorenz es una representación gráfica que muestra qué porcentaje acumulado de la riqueza total posee el porcentaje acumulado más pobre de la población. Si la curva coincide con la diagonal (línea de igualdad perfecta), la distribución es completamente igualitaria. Cuanto más alejada está la curva de esa diagonal, mayor es la desigualdad. El área entre la diagonal y la curva es precisamente la base para calcular el coeficiente Gini.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué porcentaje de la riqueza mundial posee el 1% más rico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos de Credit Suisse y Oxfam, el 1% más rico de la población mundial concentra aproximadamente el 45-50% de la riqueza global. En el caso de España, el 1% más acaudalado acumula alrededor del 25-27% de la riqueza neta del país. Estas cifras han tendido a aumentar desde la crisis financiera de 2008, especialmente tras la pandemia de 2020.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre desigualdad de riqueza y desigualdad de ingresos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La desigualdad de ingresos compara cuánto gana cada persona al año (salarios, rentas, pensiones). La desigualdad de riqueza compara el patrimonio acumulado: propiedades, inversiones, ahorro y otros activos menos deudas. La desigualdad de riqueza es sistemáticamente mayor que la de ingresos en casi todos los países, porque el patrimonio se acumula durante generaciones y genera rendimientos propios que se reinvierten.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué países tienen mayor y menor desigualdad de riqueza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los países con menor desigualdad de riqueza destacan Japón, los países nórdicos (Noruega, Dinamarca, Finlandia) y Bélgica, con Gini de riqueza inferiores a 0,70. En el extremo opuesto, países como Rusia, Brasil y Sudáfrica presentan Gini superiores a 0,85. Estados Unidos se sitúa en torno a 0,85, mientras que España se encuentra en un nivel intermedio-bajo dentro del contexto europeo, alrededor de 0,69.',
      },
    },
  ],
};
