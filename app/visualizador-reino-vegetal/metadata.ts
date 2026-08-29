import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'El Reino Vegetal: de las Algas a las Angiospermas | meskeIA',
  description:
    'Visualizador interactivo del reino vegetal. Árbol de clasificación clicable: Criptógamas (algas, briófitos, pteridófitos) y Fanerógamas (gimnospermas, angiospermas). Tabla comparativa y ciclos de vida.',
  keywords: [
    'reino vegetal',
    'criptógamas fanerógamas',
    'angiospermas gimnospermas',
    'briófitos pteridófitos',
    'clasificación plantas',
    'biología bachillerato',
    'biología preparatoria',
    'biología secundaria',
  ],
  openGraph: {
    title: 'El Reino Vegetal — Clasificación Interactiva | meskeIA',
    description:
      'Árbol interactivo del reino vegetal: algas, briófitos, pteridófitos, gimnospermas y angiospermas. Para estudiantes de secundaria, preparatoria y Bachillerato.',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Reino Vegetal — Clasificación Interactiva | meskeIA',
    description: 'Árbol interactivo del reino vegetal: algas, briófitos, pteridófitos, gimnospermas y angiospermas. Para estudiantes de secundaria, preparatoria y Bachillerato.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Reino Vegetal',
  description:
    'Árbol interactivo de clasificación del reino vegetal: criptógamas (algas, briófitos, pteridófitos, líquenes) y fanerógamas (gimnospermas y angiospermas con monocotiledóneas y dicotiledóneas). Tabla comparativa, características diagnósticas y ciclos de vida.',
  url: 'https://meskeia.com/visualizador-reino-vegetal/',
  category: 'EducationalApplication',
  features: [
    'Árbol jerárquico interactivo de clasificación vegetal',
    'Detalle de cada grupo: características, reproducción y ejemplos',
    'Tabla comparativa de 7 grupos por vasculatura, semilla y flor',
    'Ciclos de vida: briófitos, pteridófitos y fanerógamas',
    'Guía de identificación paso a paso',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se clasifica el reino vegetal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reino vegetal se divide en dos grandes grupos: criptógamas (plantas sin semilla, que incluyen algas, briófitos y pteridófitos) y fanerógamas (plantas con semilla, subdivididas en gimnospermas y angiospermas). Las angiospermas son el grupo más diverso, con más de 300.000 especies descritas, y producen flores y frutos que encierran la semilla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre briófitos y pteridófitos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los briófitos (musgos, hepáticas y antocerotas) carecen de tejidos vasculares y son avasculares, por lo que no pueden crecer en altura y dependen del agua para la fecundación. Los pteridófitos (helechos, equisetos y licopodios) ya poseen vasos conductores (xilema y floema) que les permiten alcanzar mayor tamaño, aunque siguen necesitando agua para que los espermatozoides lleguen al óvulo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre gimnospermas y angiospermas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia fundamental es que las gimnospermas tienen semillas desnudas, no encerradas en un fruto (como los pinos y los abetos), mientras que las angiospermas producen flores y encierran la semilla dentro de un fruto (como los manzanos, las gramíneas o los robles). Las angiospermas dominan la flora terrestre actual y son la base de casi toda la alimentación humana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las monocotiledóneas y dicotiledóneas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son las dos clases principales de angiospermas, diferenciadas por el número de cotiledones (hojas embrionarias) de la semilla. Las monocotiledóneas tienen uno (gramíneas, lirios, orquídeas, palmeras) y sus hojas muestran nervación paralela. Las dicotiledóneas tienen dos (rosas, robles, leguminosas, tomates) y presentan nervación reticulada, raíz pivotante y flor con piezas múltiplos de 4 o 5.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar la clasificación del reino vegetal en secundaria o preparatoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clasificación vegetal es un contenido central de Biología en la educación secundaria, la preparatoria y el Bachillerato, y aparece habitualmente en los exámenes de admisión universitaria. Comprender la jerarquía de grupos permite identificar plantas por sus características morfológicas, entender su ciclo de vida y relacionar su evolución con la conquista del medio terrestre. Además, es la base para disciplinas aplicadas como la agronomía, la farmacognosia y la ecología.',
      },
    },
  ],
};
