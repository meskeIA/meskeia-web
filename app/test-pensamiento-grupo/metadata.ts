import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Pensamiento de Grupo - ¿Tu equipo debate o solo confirma? | meskeIA',
  description: 'Descubre si tu equipo sufre pensamiento de grupo (groupthink). Test de 10 preguntas basado en Irving Janis. Evalúa conformidad y disidencia constructiva. Gratuito y sin registro.',
  keywords: 'pensamiento de grupo, groupthink, Irving Janis, conformidad equipo, disidencia constructiva, toma decisiones grupo, consenso, debate equipo, sesgo grupo, decisiones colectivas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Pensamiento de Grupo | meskeIA',
    description: '¿Tu equipo debate o solo confirma? Test basado en Irving Janis (groupthink).',
    url: 'https://meskeia.com/test-pensamiento-grupo/',
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
    title: 'Test de Pensamiento de Grupo | meskeIA',
    description: '¿Tu equipo sufre groupthink? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Pensamiento de Grupo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Pensamiento de Grupo',
  description: 'Herramienta interactiva de reflexión para detectar si tu equipo sufre pensamiento de grupo (groupthink). Basado en el trabajo de Irving Janis.',
  url: 'https://meskeia.com/test-pensamiento-grupo/',
  features: [
    'Test de 10 preguntas sobre conformidad y disidencia',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en Irving Janis (groupthink)',
    'Acciones concretas según tu resultado',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el pensamiento de grupo o groupthink?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pensamiento de grupo (groupthink) es un fenómeno psicológico descrito por Irving Janis en 1972 en el que el deseo de armonía o conformidad dentro de un grupo suprime el debate, la disidencia y el pensamiento crítico. El resultado son decisiones colectivas de peor calidad que las individuales porque nadie se atreve a cuestionar el consenso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona este test de pensamiento de grupo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test consta de 10 preguntas sobre comportamientos habituales en tu equipo: si se critican ideas sin consecuencias, si la disidencia es bienvenida, si se buscan perspectivas externas, etc. Cada respuesta puntúa en dos ejes (conformidad y disidencia constructiva) y el resultado se representa en un mapa 2D con un perfil y acciones concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que trabaje en equipo: líderes, coordinadores de proyecto, miembros de comités, equipos de startup o departamentos corporativos. También sirve como herramienta de reflexión individual para quienes participan en reuniones donde raramente se cuestionan las decisiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre groupthink y consenso sano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el consenso sano, el acuerdo llega después de un debate real donde se han explorado alternativas y se han escuchado objeciones. En el groupthink, el consenso aparece antes del debate porque los miembros del grupo autocensuran sus dudas para no romper la cohesión. La diferencia clave es si la disidencia fue posible antes de llegar al acuerdo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los síntomas más frecuentes del pensamiento de grupo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Janis identificó ocho síntomas principales: ilusión de invulnerabilidad, racionalización colectiva, creencia en la superioridad moral del grupo, estereotipación de quienes disienten, presión directa sobre los disidentes, autocensura, ilusión de unanimidad y presencia de "guardianes mentales" que filtran la información incómoda.',
      },
    },
  ],
};
