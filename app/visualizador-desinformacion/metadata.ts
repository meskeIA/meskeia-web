import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Propaga un Bulo: El Ciclo de la Desinformación | meskeIA',
  description:
    'Descubre cómo nace y se viraliza un bulo. Visualizador interactivo del ciclo de desinformación: creación, amplificación, viralización y desmentido. Con datos del MIT y el Reuters Institute.',
  keywords: [
    'desinformación',
    'bulos',
    'fake news',
    'verificación',
    'sesgos cognitivos',
    'DSA',
    'fact-checking',
    'noticias falsas',
  ],
  openGraph: {
    title: 'Cómo se Propaga un Bulo: El Ciclo de la Desinformación',
    description:
      'Los bulos viajan 6 veces más rápido que la verdad. Descubre por qué y cómo protegerte.',
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
  name: "El Ciclo de la Desinformación: Cómo se Propaga un Bulo",
  description: "Descubre cómo nace y se viraliza un bulo. Visualizador interactivo del ciclo de desinformación: creación, amplificación, viralización y desmentido. Con datos del MIT y el Reuters Institute.",
  url: "https://meskeia.com/visualizador-desinformacion/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué los bulos se propagan más rápido que la verdad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un estudio del MIT publicado en Science (2018) demostró que las noticias falsas se difunden 6 veces más rápido que las verdaderas en Twitter. La clave está en la novedad emocional: los bulos suelen activar sorpresa, miedo o indignación, emociones que impulsan a compartir sin verificar. Además, el sesgo de confirmación hace que aceptemos información que encaja con nuestras creencias previas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fases del ciclo de la desinformación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo tiene cuatro etapas principales: creación (fabricación o distorsión deliberada de un hecho), amplificación (difusión por canales propios y cuentas coordinadas), viralización (contagio masivo en redes sociales y aplicaciones de mensajería) y, finalmente, desmentido (fact-checking y rectificación, que llega tarde y con menor alcance). La asimetría entre la velocidad de difusión y la del desmentido es el problema central.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo identificar un bulo antes de compartirlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales más fiables son: titular exageradamente emocional o alarmista, ausencia de fuente primaria o cita a "estudios" sin autoría concreta, imagen o vídeo descontextualizado (verificable con búsqueda inversa de imágenes), y fecha manipulada que recicla noticias antiguas. Contrastar la información en al menos dos medios de referencia y consultar verificadores como Maldita.es o Newtral reduce drásticamente el riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juegan los sesgos cognitivos en la difusión de desinformación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sesgos cognitivos son el principal combustible de la desinformación. El sesgo de confirmación nos lleva a aceptar sin cuestionarlos los mensajes acordes a nuestra visión del mundo. El efecto Dunning-Kruger hace que quienes menos saben sobre un tema sean los más seguros al compartir información incorrecta. El sesgo de ilusión de verdad, descrito en investigaciones de psicología cognitiva, hace que la mera repetición de un enunciado aumente su percepción de veracidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la regulación europea sobre desinformación online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Reglamento de Servicios Digitales (DSA) de la UE, en vigor desde 2024 para grandes plataformas, obliga a las redes sociales con más de 45 millones de usuarios en Europa a evaluar y mitigar los riesgos sistémicos de desinformación, garantizar la transparencia de sus algoritmos y permitir auditorías independientes. Las plataformas que incumplan pueden recibir multas de hasta el 6% de su facturación global anual.',
      },
    },
  ],
};
