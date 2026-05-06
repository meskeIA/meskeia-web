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
    url: 'https://meskeia.com/curso-negociacion',
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
