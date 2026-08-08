import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Ciclo Celular: Interfase, División y Errores en la Mitosis | meskeIA',
  description: 'El ciclo celular completo, fase a fase: interfase (G1, S, G2), división, cromosomas y ploidía, crossing-over y qué ocurre cuando la división falla (no disyunción). Con las fases de mitosis y meiosis animadas.',
  keywords: 'mitosis, meiosis, división celular, cromosomas, profase, metafase, anafase, telofase, crossing-over, gametos, biología visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Ciclo Celular: Interfase, División y Ploidía',
    description: 'División celular explicada visualmente: fases, cromosomas y crossing-over paso a paso.',
    url: 'https://meskeia.com/visualizador-mitosis-meiosis/',
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
    title: 'El Ciclo Celular',
    description: '3,8 millones de divisiones por segundo en tu cuerpo. ¿Sabes cómo funcionan?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mitosis Meiosis meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Ciclo Celular: Interfase, División y Ploidía',
  description: 'Explicador visual interactivo sobre división celular: mitosis (5 fases animadas), meiosis (crossing-over y reducción cromosómica), comparativa y datos fascinantes.',
  url: 'https://meskeia.com/visualizador-mitosis-meiosis/',
  category: 'EducationalApplication',
  features: [
    'Mitosis paso a paso con cromosomas animados',
    'Meiosis I y II con crossing-over visualizado',
    'Comparativa visual mitosis vs meiosis',
    'Datos: 3,8 millones de mitosis por segundo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre mitosis y meiosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitosis produce dos células hijas idénticas a la célula madre (con el mismo número de cromosomas), y se usa para crecer y reparar tejidos. La meiosis produce cuatro células hijas con la mitad de cromosomas (gametos), y ocurre solo en órganos reproductores para permitir la reproducción sexual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas fases tiene la mitosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitosis tiene 5 fases: profase (condensación de cromosomas), metafase (alineación en el ecuador), anafase (separación de cromátidas), telofase (formación de dos núcleos) y citocinesis (división del citoplasma). En total el proceso dura entre 1 y 3 horas dependiendo del tipo celular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el crossing-over en la meiosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El crossing-over (o entrecruzamiento) es el intercambio de fragmentos entre cromosomas homólogos durante la profase I de la meiosis. Este proceso mezcla el material genético de ambos progenitores, generando nuevas combinaciones de genes que aumentan la diversidad genética en la descendencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas divisiones celulares ocurren en el cuerpo humano por segundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que en el cuerpo humano ocurren aproximadamente 3,8 millones de divisiones celulares por segundo. Esto equivale a unos 330.000 millones de mitosis al día, necesarias para reponer células de la piel, sangre, intestino y otros tejidos que se renuevan continuamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar mitosis y meiosis en bachillerato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitosis y meiosis son conceptos fundamentales en biología celular y genética, presentes en los currículos de secundaria y bachillerato. Comprender estos procesos es clave para entender el crecimiento y desarrollo de los organismos, la herencia genética, las enfermedades cromosómicas y los avances en medicina y biotecnología.',
      },
    },
  ],
};
