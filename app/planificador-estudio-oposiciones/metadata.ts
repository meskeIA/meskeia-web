import { Metadata } from 'next';

const title = 'Planificador de Estudio para Oposiciones — Organiza tu temario | meskeIA';
const description = 'Organiza tu estudio de oposiciones: distribuye temas en semanas, programa repasos espaciados, marca días de descanso y visualiza tu progreso. Adaptable a cualquier convocatoria.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'planificar estudio oposiciones, organizar temario oposiciones, plan de estudio oposiciones, repasos espaciados, calendario oposiciones, distribuir temas semanas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Estudio para Oposiciones | meskeIA',
    description,
    url: 'https://meskeia.com/planificador-estudio-oposiciones/',
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
    title: 'Planificador de Estudio para Oposiciones | meskeIA',
    description: 'Distribuye tu temario en semanas con repasos espaciados y progreso visual',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Planificador de Estudio para Oposiciones',
  description,
  url: 'https://meskeia.com/planificador-estudio-oposiciones/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo organizo el estudio de oposiciones con muchos temas en poco tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clave es distribuir los temas en bloques semanales partiendo de la fecha del examen hacia atrás, reservando las últimas semanas para repasos. El planificador permite introducir el número de temas y la fecha límite para generar automáticamente un calendario de estudio adaptado a tu disponibilidad diaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los repasos espaciados y por qué son importantes en oposiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los repasos espaciados consisten en revisar el material estudiado en intervalos de tiempo crecientes (por ejemplo, al día siguiente, a la semana y al mes), lo que según la curva del olvido de Ebbinghaus aumenta significativamente la retención a largo plazo. Para oposiciones con temarios de 60-100 temas, este método reduce el tiempo total de estudio necesario para memorizar con solidez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es este planificador válido para cualquier tipo de oposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la herramienta es flexible y se adapta a cualquier convocatoria: oposiciones de Administración General del Estado, Comunidades Autónomas, Fuerzas y Cuerpos de Seguridad, Educación u otras. Solo necesitas introducir el número de temas del temario oficial y la fecha aproximada del examen para obtener un plan personalizado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas diarias debo estudiar para preparar una oposición?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del temario y del tiempo disponible hasta el examen, pero lo habitual es entre 3 y 6 horas diarias para convocatorias exigentes. Lo más importante no es la cantidad de horas sino la constancia y la calidad del estudio. El planificador calcula automáticamente las horas necesarias según tu carga de temas y el tiempo disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo marcar días de descanso o festivos en el plan de estudio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el planificador permite excluir días concretos del calendario de estudio, ya sean festivos, compromisos personales o días de descanso programado. Descansar periódicamente es parte del proceso: la consolidación de la memoria se produce durante el sueño y los periodos de reposo.',
      },
    },
  ],
};
