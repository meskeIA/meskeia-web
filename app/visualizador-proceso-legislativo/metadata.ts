import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de una Ley - Proceso Legislativo en España | meskeIA',
  description: 'Cómo se hace una ley en España paso a paso: iniciativa, debate en el Congreso, revisión en el Senado, sanción real y publicación en el BOE. Explicador visual interactivo.',
  keywords: 'proceso legislativo, cómo se hace una ley, congreso diputados, senado, BOE, ley españa, proposición de ley, proyecto de ley, iniciativa legislativa popular',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de una Ley - Proceso Legislativo en España',
    description: 'De la idea a la ley: cómo funciona el proceso legislativo en España explicado de forma visual.',
    url: 'https://meskeia.com/visualizador-proceso-legislativo/',
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
    title: 'El Viaje de una Ley - Proceso Legislativo en España',
    description: 'Cómo nace, se debate, se aprueba y se publica una ley en España. Explicador visual interactivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Proceso Legislativo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de una Ley - Proceso Legislativo en España',
  description: 'Explicador visual interactivo del proceso legislativo español: quién puede proponer una ley, cómo se debate en el Congreso y el Senado, sanción real, publicación en el BOE y entrada en vigor.',
  url: 'https://meskeia.com/visualizador-proceso-legislativo/',
  features: [
    'Orígenes de una ley: Gobierno, Congreso, Senado, CCAA, ciudadanos',
    'Flujo visual del debate parlamentario en el Congreso',
    'Caminos del Senado: aprobar, enmendar o vetar',
    'Cronología real desde propuesta hasta entrada en vigor',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se hace una ley en España paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso empieza con una iniciativa legislativa (del Gobierno, de un grupo parlamentario, de una comunidad autónoma o de los ciudadanos mediante una ILP). El texto se debate y enmienda en el Congreso de los Diputados, luego pasa al Senado, que puede aprobarlo, introducir enmiendas o vetarlo. Si el Congreso supera el veto, el texto va al Rey para su sanción y promulgación, y finalmente se publica en el BOE para entrar en vigor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una Iniciativa Legislativa Popular (ILP)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ILP es el mecanismo por el que los ciudadanos pueden proponer una ley al Congreso recogiendo al menos 500.000 firmas acreditadas en un plazo máximo de nueve meses. Si se supera ese umbral, el Congreso está obligado a debatirla, aunque no necesariamente a aprobarla. Materias como impuestos, indultos o leyes orgánicas están excluidas de este procedimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en aprobarse una ley en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo varía enormemente según la urgencia y la complejidad política. Una ley ordinaria con trámite de urgencia puede aprobarse en pocas semanas; un proceso legislativo ordinario suele durar entre seis meses y dos años. El récord de tramitaciones más largas se da cuando hay negociaciones políticas intensas o cuando el Senado devuelve el texto al Congreso con enmiendas o veto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un proyecto de ley y una proposición de ley?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un proyecto de ley es el texto que presenta el Gobierno al Congreso; tiene prioridad en el orden del día y va acompañado de una memoria económica. Una proposición de ley, en cambio, la presenta un grupo parlamentario, el Senado, una comunidad autónoma o los ciudadanos (ILP). Ambas siguen el mismo trámite parlamentario una vez admitidas, pero la iniciativa del Gobierno tiene preferencia formal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede el Rey vetar una ley aprobada por las Cortes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. En el sistema constitucional español la sanción real es un acto debido: el Rey está obligado a sancionar y promulgar las leyes aprobadas por las Cortes Generales en el plazo de quince días. No dispone de veto suspensivo ni absoluto. Su función en este trámite es formal y refrendada por el Presidente del Gobierno.',
      },
    },
  ],
};
