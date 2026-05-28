import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Formación Postgrado | ¿Máster, FP, Bootcamp u Oposiciones? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de formación postgrado se adapta mejor a tu perfil: máster universitario, FP de grado superior, bootcamp online, oposiciones o certificación profesional.',
  keywords: ['qué estudiar después del grado', 'máster o FP superior', 'bootcamp o máster', 'oposiciones o estudiar', 'formación postgrado España', 'certificación profesional', 'qué hacer después de la carrera', 'FP dual o universidad', 'máster universitario España', 'formación continua adultos'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Selector de Formación Postgrado — ¿Máster, FP, Bootcamp u Oposiciones?',
    description: 'Descubre qué tipo de formación postgrado se adapta mejor a tu perfil en 10 preguntas.',
    url: 'https://meskeia.com/selector-formacion-postgrado/',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Selector de Formación Postgrado — ¿Máster, FP, Bootcamp u Oposiciones?',
    description: 'Descubre qué tipo de formación postgrado se adapta mejor a tu perfil en 10 preguntas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Formación Postgrado",
  description: "Test de 10 preguntas para saber qué tipo de formación postgrado se adapta mejor a tu perfil: máster universitario, FP de grado superior, bootcamp online, oposiciones o certificación profesional.",
  url: "https://meskeia.com/selector-formacion-postgrado/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué hacer después de terminar la carrera universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las opciones principales son: un máster universitario para profundizar en tu área o acceder a investigación, un bootcamp para adquirir habilidades técnicas en poco tiempo, oposiciones para acceder a empleo público estable, una certificación profesional reconocida por el sector o directamente la entrada al mercado laboral. La mejor opción depende de tus objetivos, disponibilidad económica y cuánto tiempo estás dispuesto a invertir en formación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena hacer un máster universitario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del campo y del objetivo. En sectores como derecho, medicina, psicología clínica o investigación, el máster es casi obligatorio. En tecnología, el retorno económico de un máster puede ser similar al de un bootcamp de 6 meses pero con un coste y tiempo mucho mayor. Según el INE, los titulados con máster tienen una tasa de empleo un 8% superior a los licenciados sin postgrado, aunque el diferencial varía mucho por área.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un bootcamp de un máster?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un bootcamp es una formación intensiva (3-9 meses) centrada en habilidades prácticas y empleabilidad inmediata, principalmente en tecnología y marketing digital. Un máster universitario dura entre 1 y 2 años, otorga titulación oficial reconocida por el sistema universitario y combina teoría y práctica. Los bootcamps son más baratos y rápidos; los másteres, más valorados para roles de dirección o investigación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién son recomendables las oposiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las oposiciones son adecuadas para personas que valoran la estabilidad laboral a largo plazo, toleran bien el estudio memorístico y estructurado durante 1-4 años, y tienen capacidad de financiar ese periodo de preparación. Son especialmente competitivas en cuerpos como la Administración General del Estado, la judicatura o el magisterio. La tasa de aprobados en cuerpos de acceso libre suele estar entre el 5% y el 15% de los presentados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una certificación profesional y cuándo tiene sentido hacerla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una certificación profesional es un título emitido por una organización o empresa reconocida en un sector (PMP en gestión de proyectos, AWS en cloud, CFA en finanzas, CISSP en ciberseguridad). Tiene sentido cuando ya tienes experiencia en el área y necesitas acreditar tus competencias de forma reconocida internacionalmente. Son más rápidas y económicas que un máster, y en algunos sectores tienen más peso en la contratación que un título universitario adicional.',
      },
    },
  ],
};
