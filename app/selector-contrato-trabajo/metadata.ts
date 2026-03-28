import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Contrato — ¿Qué modalidad laboral te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de contrato o modalidad laboral se adapta mejor a tu perfil: indefinido, temporal, autónomo/freelance, prácticas o funcionario. Análisis según estabilidad, ingresos y flexibilidad.',
  keywords: [
    'qué contrato laboral elegir',
    'indefinido o autónomo',
    'trabajo temporal o fijo',
    'hacerse autónomo España',
    'oposiciones o empresa privada',
    'contrato prácticas becario',
    'modalidad laboral España',
    'freelance o empleado',
    'estabilidad laboral vs flexibilidad',
    'qué tipo de trabajo buscar',
  ],
  openGraph: {
    title: '¿Indefinido, autónomo o funcionario? Test laboral | meskeIA',
    description:
      'Descubre qué modalidad laboral se adapta mejor a tus prioridades de estabilidad, ingresos y estilo de vida.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-contrato-trabajo/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué tipo de contrato te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre contrato indefinido, temporal, autónomo, prácticas o funcionario.',
  },
  alternates: { canonical: 'https://meskeia.com/selector-contrato-trabajo/' },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Contrato de Trabajo',
        description:
          'Test orientativo para saber qué modalidad laboral (indefinido, temporal, autónomo, prácticas o funcionario) se adapta mejor al perfil y prioridades vitales.',
        url: 'https://meskeia.com/selector-contrato-trabajo/',
        features: [
          'Test de 10 preguntas sobre perfil y prioridades',
          '5 modalidades: indefinido, temporal, autónomo, prácticas, funcionario',
          'Análisis de estabilidad, ingresos y flexibilidad',
          'Consideración de sector y etapa profesional',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};
