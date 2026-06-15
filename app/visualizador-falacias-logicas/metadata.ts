import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Falacias Lógicas - Detecta Errores de Razonamiento | meskeIA',
  description:
    'Aprende a detectar las 12 falacias lógicas más comunes: ad hominem, hombre de paja, falso dilema, pendiente resbaladiza y más. Ejemplos reales de política, publicidad y debate.',
  keywords: [
    'falacias logicas',
    'ad hominem',
    'hombre de paja',
    'falso dilema',
    'pendiente resbaladiza',
    'pensamiento critico',
    'errores de razonamiento',
    'logica informal',
    'argumentacion',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Falacias Lógicas | meskeIA',
    description:
      'Detecta los 12 errores de razonamiento más comunes con ejemplos interactivos',
    url: 'https://meskeia.com/visualizador-falacias-logicas/',
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
    title: 'Falacias Lógicas | meskeIA',
    description:
      'Detecta los 12 errores de razonamiento más comunes con ejemplos interactivos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Falacias Lógicas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Falacias Lógicas',
  description:
    'Explora las 12 falacias lógicas más comunes con ejemplos interactivos de política, publicidad y debate cotidiano. Incluye detector de falacias y constructor de argumentos sólidos.',
  url: 'https://meskeia.com/visualizador-falacias-logicas/',
  features: [
    'Las 5 familias de falacias organizadas por tipo',
    '12 falacias explicadas con ejemplos reales',
    'Detector interactivo: adivina la falacia antes de ver la respuesta',
    'Constructor de argumentos sólidos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una falacia lógica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una falacia lógica es un error en el razonamiento que hace que un argumento parezca válido cuando en realidad no lo es. Pueden ser intencionales (para manipular o engañar) o involuntarias (por descuido o desconocimiento). Identificarlas es fundamental para el pensamiento crítico y la argumentación rigurosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ad hominem y cómo se detecta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ad hominem consiste en atacar a la persona que presenta un argumento en lugar de rebatir el argumento en sí. Por ejemplo: "No hagas caso de su propuesta económica, es que nunca ha tenido un trabajo de verdad." Para detectarlo, hay que preguntarse si la crítica se dirige al carácter o circunstancias del hablante en vez de a sus ideas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el hombre de paja y el falso dilema?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hombre de paja distorsiona o exagera la posición del oponente para rebatirla con más facilidad, mientras que el falso dilema presenta solo dos opciones como si fueran las únicas posibles cuando en realidad existen más alternativas. Ambas son falacias de relevancia, pero operan de forma distinta: una tergiversa el argumento ajeno y la otra limita artificialmente las opciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil aprender a identificar falacias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Identificar falacias es útil para cualquier persona que participe en debates, consuma noticias, estudie filosofía o derecho, o simplemente quiera tomar decisiones más racionales. Es especialmente valioso en contextos de política, publicidad y redes sociales, donde los argumentos falaces son frecuentes y a menudo persuasivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos tipos de falacias existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los catálogos académicos recogen más de 100 falacias nombradas, aunque en la práctica cotidiana unas 15-20 son las más frecuentes. Las clasificaciones habituales las agrupan en falacias de relevancia (el argumento no apoya la conclusión), falacias de ambigüedad (explotan el doble sentido de las palabras) y falacias de presunción (asumen como cierto algo que no está probado).',
      },
    },
  ],
};
