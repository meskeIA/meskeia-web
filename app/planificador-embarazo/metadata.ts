import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Embarazo y Bebé - Calculadora FPP, Checklist, Compras y Vacunas | meskeIA',
  description: 'Planifica tu embarazo completo: calcula tu fecha probable de parto (FPP), organiza tareas por trimestre, lista de compras del bebé con prioridades y calendario de vacunación infantil España 2024.',
  keywords: 'calculadora fecha parto, FPP, fecha probable parto, semanas embarazo, trimestre embarazo, checklist embarazo, lista compras bebé, calendario vacunas bebé, planificador embarazo, preparativos nacimiento, canastilla bebé, vacunas recién nacido España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Embarazo y Bebé - Calculadora, Checklist, Compras y Vacunas',
    description: 'Tu guía completa para el embarazo: calcula la fecha de parto, organiza tareas por trimestre, lista de compras y calendario de vacunación.',
    url: 'https://meskeia.com/planificador-embarazo/',
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
    title: 'Planificador de Embarazo y Bebé - meskeIA',
    description: 'Calculadora FPP, checklist por trimestres, lista de compras del bebé y calendario de vacunas España 2024.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador de Embarazo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador Embarazo y Bebé",
  description: "Planifica tu embarazo completo: calcula tu fecha probable de parto (FPP), organiza tareas por trimestre, lista de compras del bebé con prioridades y calendario de vacunación infantil España 2024.",
  url: "https://meskeia.com/planificador-embarazo/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la fecha probable de parto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fecha probable de parto (FPP) se calcula sumando 280 días (40 semanas) al primer día de la última menstruación, usando la regla de Naegele. Otra forma es restar 3 meses a esa fecha y sumar 7 días. Se trata de una estimación: solo el 5% de los bebés nacen exactamente en esa fecha, y la mayoría lo hacen entre las semanas 38 y 42.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tareas son importantes durante el primer trimestre del embarazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el primer trimestre (semanas 1-12) es importante confirmar el embarazo con el médico, iniciar la toma de ácido fólico y yodo, solicitar la primera analítica y ecografía de las 12 semanas, comunicar el embarazo en el trabajo para proteger los derechos laborales, y valorar informar a familiares cercanos. También se recomienda evitar el alcohol, tabaco y medicamentos sin prescripción médica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué vacunas recibe un bebé en España durante el primer año de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el calendario de vacunación infantil del Ministerio de Sanidad de España (2024), en el primer año los bebés reciben las vacunas hexavalente (difteria, tétanos, tos ferina, polio, Hib, hepatitis B) a los 2, 4 y 11 meses; la vacuna neumocócica a los 2, 4 y 11 meses; y la vacuna meningocócica B a los 2, 4 y 4 meses, entre otras. El calendario puede variar ligeramente entre comunidades autónomas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué artículos son imprescindibles en la canastilla del bebé?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los artículos básicos para los primeros meses incluyen: silla de coche grupo 0+ (obligatoria para salir del hospital), cuna o moisés con colchón firme, pañales de recién nacido, bodis y pijamas de talla 50-56, leche de fórmula o utensilios de lactancia, termómetro y botiquín básico, y cochecito. La lista puede simplificarse mucho; muchos artículos se consiguen de segunda mano o se compran según necesidad real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se debe comunicar el embarazo en el trabajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España no existe obligación legal de comunicar el embarazo al empleador en una fecha concreta. Sin embargo, es recomendable hacerlo antes de la semana 16 para acogerse a la protección contra el despido (nulidad del despido durante el embarazo) y para adaptar el puesto de trabajo si hay riesgos laborales. Comunicarlo a Recursos Humanos permite también tramitar las prestaciones de la Seguridad Social a tiempo.',
      },
    },
  ],
};
