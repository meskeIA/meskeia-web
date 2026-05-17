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
