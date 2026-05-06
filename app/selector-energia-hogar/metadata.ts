import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Energía para el Hogar — ¿Gas, eléctrico, aerotermia o biomasa? | meskeIA',
  description: 'Test de 10 preguntas para saber qué sistema de calefacción y agua caliente te conviene: electricidad/bomba de calor, gas natural, aerotermia, biomasa/pellets o solar térmica. Sin marcas, análisis técnico y económico.',
  keywords: ['gas o aerotermia', 'bomba de calor o gas natural', 'qué calefacción elegir', 'aerotermia o caldera gas', 'pellets o gas', 'sistema calefacción eficiente España', 'calefacción más barata 2025', 'cambiar caldera a bomba de calor', 'ayudas rehabilitación energética', 'qué energía hogar elegir'],
  openGraph: {
    title: '¿Gas, aerotermia o biomasa? Test de energía para el hogar | meskeIA',
    description: 'Descubre qué sistema energético se adapta mejor a tu vivienda, zona climática y presupuesto.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-energia-hogar/',
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
    title: '¿Qué energía para tu hogar? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para elegir entre gas natural, bomba de calor, aerotermia, biomasa o solar térmica.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-energia-hogar/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Energía para el Hogar',
      description: 'Test orientativo para saber qué sistema de calefacción y agua caliente (gas, eléctrico/bomba de calor, aerotermia, biomasa o solar térmica) se adapta mejor a la vivienda.',
      url: 'https://meskeia.com/selector-energia-hogar/',
      features: [
        'Test de 10 preguntas sobre vivienda y preferencias',
        '5 sistemas: gas natural, electricidad/bomba calor, aerotermia, biomasa, solar+backup',
        'Análisis de zona climática, presupuesto y espacio',
        'Orientación sobre ayudas y subvenciones',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};
