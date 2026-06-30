import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tablet | ¿Qué Tablet Necesitas? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de tablet se adapta mejor a tus necesidades: tablet Android, iPad/iOS, tablet Windows, eReader o prescindir de tablet. Incluye comparativa tablet vs portátil (laptop/notebook).',
  keywords: [
    'qué tablet comprar',
    'iPad o tablet Android',
    'tablet Windows o iPad',
    'eReader o tablet',
    'tablet para dibujar',
    'tablet para estudiar',
    'tablet para niños',
    'tablet para trabajar',
    'mejor tablet según uso',
    'tablet o portátil',
    'tablet o laptop',
    'tablet vs notebook',
  ],
  openGraph: {
    title: 'Selector de Tablet — ¿Qué Tipo de Tablet Necesitas?',
    description:
      'Descubre qué tipo de tablet se adapta mejor a tus necesidades en 10 preguntas.',
    url: 'https://meskeia.com/selector-tablet/',
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
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tablet",
  description: "Test de 10 preguntas para saber qué tipo de tablet se adapta mejor a tus necesidades: tablet Android, iPad/iOS, tablet Windows, eReader o prescindir de tablet.",
  url: "https://meskeia.com/selector-tablet/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipo de tablet me conviene comprar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de tu uso principal: si priorizas apps, juegos y multimedia, un iPad o tablet Android son las opciones más equilibradas. Si necesitas Office nativo y compatibilidad con software de escritorio, una tablet Windows (como Surface) es más adecuada. Para leer libros, una eReader con tinta electrónica ofrece mayor autonomía y menos fatiga visual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor un iPad o una tablet Android?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El iPad destaca por su ecosistema cerrado con mayor optimización de apps, mejor soporte a largo plazo y herramientas creativas como el Apple Pencil. Las tablets Android ofrecen más variedad de precios, mayor libertad de personalización y mejor integración con servicios de Google. La elección depende principalmente de si ya usas dispositivos Apple o Android en tu día a día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una tablet Windows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una tablet Windows (como las de la gama Surface o similares) ejecuta el mismo software que un ordenador de escritorio: Microsoft Office completo, programas de edición profesional y aplicaciones de empresa. Es ideal para quienes trabajan en movilidad y necesitan compatibilidad total con su entorno laboral, aunque suele tener mayor precio y menor autonomía que las tablets convencionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tablet es mejor para estudiar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para estudiantes de secundaria o universidad, un iPad de gama media o una tablet Android de 10-11 pulgadas suelen ser suficientes para tomar apuntes, leer PDFs y hacer presentaciones. Si los estudios requieren software específico (programación, diseño técnico, estadística), valorar una tablet Windows o directamente un portátil ligero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena comprar una tablet o es mejor un portátil (laptop/notebook)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una tablet es más cómoda para consumir contenido (vídeo, lectura, redes sociales) y trabajar en movilidad con tareas ligeras. Un portátil (laptop o notebook) es más versátil para crear documentos largos, programar o usar software profesional. Muchos usuarios optan por la combinación de un smartphone potente más un portátil, prescindiendo de la tablet, salvo que tengan un caso de uso muy concreto.',
      },
    },
  ],
};
