import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Plan de Pensiones — ¿Te conviene contratar uno? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene un plan de pensiones individual, de empleo, EPSV (País Vasco/Navarra) o si es mejor no contratar ninguno. Análisis según perfil fiscal, horizonte temporal y liquidez.',
  keywords: [
    'plan de pensiones sí o no',
    'conviene plan de pensiones',
    'plan pensiones individual o empleo',
    'EPSV País Vasco',
    'ahorro jubilación España',
    'ventajas fiscales plan pensiones',
    'plan pensiones 2025',
    'alternativas al plan de pensiones',
    'fondo pensiones o indexado',
    'deducción IRPF plan pensiones',
  ],
  openGraph: {
    title: '¿Te conviene un plan de pensiones? Test en 10 preguntas | meskeIA',
    description:
      'Descubre si deberías contratar un plan de pensiones individual, de empleo, EPSV o ninguno, según tu perfil fiscal, horizonte y necesidad de liquidez.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-plan-pensiones/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Plan de pensiones sí o no? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para saber qué opción de ahorro para la jubilación se adapta a tu situación fiscal y vital.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-plan-pensiones/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Plan de Pensiones',
        description:
          'Test orientativo para saber si conviene contratar un plan de pensiones individual, de empleo, EPSV o ninguno según perfil fiscal, horizonte temporal y necesidades de liquidez.',
        url: 'https://meskeia.com/selector-plan-pensiones/',
        features: [
          'Test de 10 preguntas sobre perfil fiscal y vital',
          'Análisis de 5 opciones: individual, empleo, EPSV, diversificar, ninguno',
          'Consideración de ventajas fiscales IRPF',
          'Alertas sobre liquidez y penalizaciones',
          'Comparativa de alternativas al plan tradicional',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
