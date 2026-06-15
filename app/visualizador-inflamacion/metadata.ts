import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Inflamación — Mecanismo Celular Agudo y Crónico | meskeIA',
  description: 'Visualizador educativo del proceso inflamatorio: los 5 signos clásicos, diferencia entre inflamación aguda y crónica, células protagonistas (mastocitos, neutrófilos, macrófagos) y factores que la amplifican.',
  keywords: 'inflamación, inflamación crónica, inflamación aguda, neutrófilos, macrófagos, citocinas, histamina, prostaglandinas, respuesta inflamatoria, inmunología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-inflamacion/' },
  openGraph: {
    type: 'website',
    title: 'La Inflamación — Mecanismo Celular Agudo y Crónico',
    description: 'Los 5 signos clásicos, inflamación aguda vs crónica, células protagonistas y factores amplificadores.',
    url: 'https://meskeia.com/visualizador-inflamacion/',
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
    title: 'La Inflamación — Mecanismo Celular Agudo y Crónico',
    description: 'Visualizador educativo: 5 signos clásicos, aguda vs crónica, mastocitos, neutrófilos, macrófagos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Inflamación meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Inflamación — Mecanismo Celular Agudo y Crónico',
  description: 'Explicador visual interactivo del proceso inflamatorio: los 5 signos clásicos de Celso, diferencia entre inflamación aguda y crónica, células protagonistas y factores que amplifican la inflamación crónica.',
  url: 'https://meskeia.com/visualizador-inflamacion/',
  category: 'EducationalApplication',
  features: [
    'Los 5 signos clásicos con mecanismo celular detallado',
    'Comparativa aguda vs crónica con colores diferenciados',
    'Selector de 4 células protagonistas (mastocitos, neutrófilos, macrófagos, linfocitos T)',
    '6 factores amplificadores de la inflamación crónica',
    'Línea temporal del proceso inflamatorio agudo (0h → resolución)',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la inflamación y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inflamación es la respuesta defensiva del sistema inmunitario ante lesiones o agentes patógenos. Su función es aislar el daño, eliminar la causa y reparar el tejido. Los 5 signos clásicos descritos por Celso son rubor, calor, tumor, dolor y pérdida de función, cada uno con una base celular concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre inflamación aguda y crónica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inflamación aguda dura horas o días, está dominada por neutrófilos y termina en resolución o reparación. La crónica persiste semanas o meses, con predominio de macrófagos y linfocitos T, y puede dañar el propio tejido. Enfermedades como artritis reumatoide, enfermedad inflamatoria intestinal o aterosclerosis implican inflamación crónica sostenida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué células participan en la respuesta inflamatoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los mastocitos son los primeros en reaccionar, liberando histamina y prostaglandinas que provocan vasodilatación. Los neutrófilos llegan masivamente en las primeras horas para fagocitar patógenos. Los macrófagos limpian los restos celulares y dirigen la resolución. Los linfocitos T coordinan la respuesta adaptativa en inflamaciones crónicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores amplifican la inflamación crónica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sedentarismo, la obesidad, el tabaquismo, el estrés crónico, la dieta proinflamatoria (alto contenido en azúcares refinados y grasas trans) y las infecciones persistentes son los principales factores que mantienen activa la inflamación de bajo grado. La reducción de estos factores es la estrategia más efectiva para controlarla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en resolverse una inflamación aguda normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una inflamación aguda sin complicaciones sigue una línea temporal de 0-2 horas (vasodilatación y llegada de neutrófilos), 6-24 horas (fagocitosis activa) y 2-7 días (resolución y reparación tisular). Si no se resuelve en ese plazo, el proceso puede cronificarse y requerir evaluación médica.',
      },
    },
  ],
};
