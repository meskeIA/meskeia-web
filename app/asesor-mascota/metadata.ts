import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asesor de Mascota — ¿Qué animal se adapta a mí? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué mascota te conviene según tu estilo de vida, vivienda, tiempo disponible y presupuesto. Perro, gato, roedor, pez, pájaro o reptil.',
  keywords: [
    'qué mascota tener',
    'asesor mascota',
    'qué perro elegir',
    'mejor mascota para piso',
    'mascota para niños',
    'mascota fácil de cuidar',
    'perro o gato',
    'mascota sin jardín',
    'primera mascota',
    'qué animal se adapta a mí',
  ],
  openGraph: {
    title: '¿Qué mascota te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre qué animal se adapta a tu estilo de vida, espacio disponible, tiempo libre y presupuesto. Sin romanticismos, con información real.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/asesor-mascota/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Perro, gato o algo más? Descubre tu mascota ideal | meskeIA',
    description:
      'Test de 10 preguntas para encontrar la mascota que mejor encaja con tu vida real.',
  },
  alternates: {
    canonical: 'https://meskeia.com/asesor-mascota/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Asesor de Mascota',
        description:
          'Test orientativo de 10 preguntas para descubrir qué tipo de mascota (perro, gato, roedor, pez, pájaro o reptil) se adapta mejor a tu estilo de vida, espacio, tiempo disponible y presupuesto.',
        url: 'https://meskeia.com/asesor-mascota/',
        features: [
          'Test de 10 preguntas sobre estilo de vida y situación',
          'Recomendación de tipo de mascota y perfil concreto',
          'Coste mensual estimado de mantenimiento',
          'Pros y contras adaptados a tu situación',
          'Consejos antes de adoptar o comprar',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
