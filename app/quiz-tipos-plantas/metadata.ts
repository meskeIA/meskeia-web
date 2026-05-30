import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Musgo, Helecho o Angiosperma? Quiz de Clasificación de Plantas | meskeIA',
  description: 'Quiz interactivo de botánica: clasifica 40 organismos vegetales en su grupo (alga, briófito, pteridófito, gimnosperma, monocotiledónea, dicotiledónea). Con explicaciones diagnósticas y modo por grupos.',
  keywords: 'quiz plantas, clasificación botánica, tipos de plantas, briófitos pteridófitos, angiospermas gimnospermas, biología bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz: Clasifica 40 Plantas — meskeIA',
    description: '¿Sabes distinguir un briófito de un pteridófito? ¿Una monocotiledónea de una dicotiledónea? 40 plantas, 6 grupos y criterios diagnósticos explicados.',
    url: 'https://meskeia.com/quiz-tipos-plantas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz de Clasificación de Plantas',
    description: '40 organismos vegetales, 6 grupos botánicos, criterios diagnósticos explicados.',
  },
  other: {
    'application-name': 'Quiz Tipos de Plantas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Quiz de Clasificación de Plantas',
  description: 'Quiz interactivo de botánica con 40 organismos vegetales para clasificar en su grupo taxonómico: alga, briófito, pteridófito, gimnosperma, monocotiledónea y dicotiledónea. Incluye explicaciones de los criterios diagnósticos para cada organismo.',
  url: 'https://meskeia.com/quiz-tipos-plantas/',
  category: 'EducationalApplication',
  features: [
    '40 organismos vegetales para clasificar',
    '6 grupos taxonómicos con criterios diagnósticos',
    'Modo rápido (20 preguntas) y modo completo (40)',
    'Práctica por grupo individual',
    'Explicación detallada de cada respuesta',
    'Estadísticas finales con resumen de errores',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una monocotiledónea y una dicotiledónea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las monocotiledóneas tienen un solo cotiledón (hoja embrionaria), hojas con nervios paralelos y raíces fasciculadas; ejemplos: trigo, maíz, tulipán. Las dicotiledóneas tienen dos cotiledones, hojas con nervios reticulados y raíz pivotante; ejemplos: rosal, judía, roble. Esta distinción es uno de los criterios diagnósticos clave para clasificar las angiospermas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los seis grandes grupos de plantas que cubre el quiz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz trabaja con algas (organismos fotosintéticos sin tejidos vasculares verdaderos), briófitos (musgos y hepáticas, sin vasos conductores), pteridófitos (helechos, con vasos pero sin semillas), gimnospermas (pino, abeto, con semillas desnudas), monocotiledóneas y dicotiledóneas (ambas angiospermas, con flores y frutos). Cada grupo tiene criterios diagnósticos propios explicados tras cada respuesta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este quiz de botánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado principalmente a estudiantes de Bachillerato científico y primer curso universitario de Biología, Farmacia o Ciencias Ambientales, donde la clasificación vegetal es temario habitual. También resulta útil para opositores de secundaria y cualquier persona con curiosidad por la biología vegetal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el modo de práctica por grupo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modo de práctica por grupo permite seleccionar una categoría concreta (por ejemplo, solo pteridófitos o solo gimnospermas) y recibir únicamente preguntas de ese grupo. Es útil para reforzar los grupos en los que se cometen más errores antes de intentar el modo completo de 40 organismos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un briófito y en qué se diferencia de un helecho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los briófitos (musgos, hepáticas, antocerotas) son plantas no vasculares: carecen de xilema y floema, por eso no pueden superar unos pocos centímetros de altura y dependen del agua para la reproducción sexual. Los helechos son pteridófitos: ya poseen tejido vascular (xilema y floema), lo que les permite crecer más y colonizar ambientes más secos, aunque siguen reproducándose mediante esporas en lugar de semillas.',
      },
    },
  ],
};
