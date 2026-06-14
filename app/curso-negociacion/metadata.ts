import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Curso de Negociación Exitosa - Domina el Arte de Negociar | meskeIA',
  description: 'Aprende negociación profesional: BATNA, ZOPA, tácticas de persuasión, cierre de acuerdos, resolución de conflictos y negociación multicultural. 12 capítulos.',
  keywords: 'negociación, BATNA, ZOPA, persuasión, Cialdini, cierre de ventas, contratos, mediación, arbitraje, negociación internacional, curso negociación, técnicas negociación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Negociación Exitosa - meskeIA',
    description: 'Domina el arte de negociar: preparación estratégica, psicología, tácticas de persuasión, cierre de acuerdos y resolución de conflictos.',
    url: 'https://meskeia.com/curso-negociacion/',
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
    title: 'Curso de Negociación Exitosa - meskeIA',
    description: 'Aprende técnicas de negociación profesional: BATNA, ZOPA, persuasión, cierre de acuerdos y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso de Negociación Exitosa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Curso de Negociación Exitosa',
  description: 'Curso gratuito de negociación profesional en español. 12 capítulos que cubren BATNA, ZOPA, tácticas de persuasión, cierre de acuerdos, resolución de conflictos y negociación multicultural.',
  url: 'https://meskeia.com/curso-negociacion/',
  category: 'EducationalApplication',
  features: [
    'Curso completo de 12 capítulos sobre negociación',
    'Conceptos clave: BATNA, ZOPA, principios de Cialdini',
    'Tácticas de persuasión y cierre de acuerdos',
    'Resolución de conflictos y mediación',
    'Negociación multicultural e internacional',
    'Progreso guardado localmente entre sesiones',
    'Acceso 100% gratis sin registro',
    'Sin publicidad',
    'En español',
  ],
  keywords: ['curso negociación', 'BATNA', 'ZOPA', 'persuasión', 'Cialdini', 'mediación', 'conflictos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el BATNA en una negociación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BATNA (Best Alternative To a Negotiated Agreement) es la mejor alternativa que tienes si la negociación fracasa. Conocer tu BATNA te da poder de negociación: si la otra parte no ofrece algo mejor que tu alternativa, puedes retirarte con confianza. Antes de negociar conviene identificar y fortalecer tu BATNA tanto como sea posible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la ZOPA y cómo afecta al resultado de una negociación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ZOPA (Zone Of Possible Agreement) es el rango entre el mínimo aceptable de cada parte donde existe posibilidad de acuerdo. Si los rangos se solapan, hay ZOPA y el acuerdo es posible; si no se solapan, la negociación no puede cerrarse sin que alguna parte cambie su posición. Identificar la ZOPA ayuda a enfocar los esfuerzos en opciones realistas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre negociación distributiva e integrativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La negociación distributiva (suma cero) asume que lo que gana una parte lo pierde la otra, como ocurre al regatear el precio de un producto. La negociación integrativa busca crear valor para ambas partes identificando intereses distintos que se pueden satisfacer simultáneamente. La mayoría de negociaciones profesionales tienen elementos de ambos tipos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este curso de negociación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que negocie en su vida laboral o personal: profesionales que cierran contratos o acuerdos comerciales, responsables de compras, emprendedores, abogados, mediadores y personas que quieran mejorar sus habilidades de comunicación y persuasión en el día a día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva completar el curso de negociación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El curso consta de 12 capítulos organizados en 4 módulos: preparación estratégica, psicología de la negociación, cierre de acuerdos y resolución de conflictos. A un ritmo de un capítulo por día, se puede completar en menos de dos semanas. El progreso se guarda automáticamente en el navegador para retomarlo cuando quieras.',
      },
    },
  ],
};
