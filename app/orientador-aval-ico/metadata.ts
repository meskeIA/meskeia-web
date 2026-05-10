import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Aval ICO Vivienda — Comprar sin el 20% de Entrada | meskeIA',
  description:
    'Oriéntate sobre el aval ICO para comprar tu primera vivienda sin el 20% de entrada. Requisitos, proceso paso a paso y documentación necesaria para jóvenes menores de 35 años y familias con menores.',
  keywords:
    'aval ico vivienda, aval ico jóvenes, comprar piso sin entrada, ico jóvenes hipoteca, aval gobierno primera vivienda, requisitos aval ico, hipoteca 100%, garantía ico vivienda 2026',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-aval-ico/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador Aval ICO Vivienda — Comprar sin el 20% de Entrada',
    description:
      '¿Quieres comprar una vivienda pero no tienes el 20% de entrada? Conoce el programa de avales del ICO para jóvenes y familias.',
    url: 'https://meskeia.com/orientador-aval-ico/',
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
    title: 'Orientador Aval ICO Vivienda',
    description:
      'El gobierno avala hasta el 20% de tu hipoteca si tienes menos de 35 años. Descubre cómo funciona y si puedes solicitarlo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Aval ICO Vivienda',
  description: 'Comprueba si puedes acceder al Aval ICO para comprar tu primera vivienda sin el 20% de entrada. Orientador de requisitos para jóvenes menores de 35 años y familias con hijos menores a cargo.',
  url: 'https://meskeia.com/orientador-aval-ico/',
  category: 'FinanceApplication',
  features: [
    'Comprobación de requisitos del Aval ICO paso a paso',
    'Perfil jóvenes (menores de 35 años) y familias con menores',
    'Resultado orientativo inmediato: apto / parcial / no apto',
    'Proceso de solicitud explicado paso a paso',
    'Documentación necesaria detallada',
    'Comparativa con compra sin aval ICO',
    'Preguntas frecuentes sobre el programa ICO',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['aval ICO', 'primera vivienda', 'hipoteca 100%', 'jóvenes vivienda', 'ICO', 'comprar sin entrada'],
});
