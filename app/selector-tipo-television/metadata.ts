import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Televisión — ¿OLED, QLED o LED? ¿Qué tecnología te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tecnología de pantalla te conviene: OLED, QLED/Mini-LED, LED LCD IPS o LED LCD VA. Análisis según uso, habitación, presupuesto y distancia de visión.',
  keywords: [
    'OLED o QLED',
    'qué televisión comprar',
    'diferencia OLED QLED LED',
    'mejor tecnología TV 2025',
    'televisión para gaming',
    'televisión para cine en casa',
    'tamaño TV según distancia',
    'Mini-LED vs OLED',
    'LED IPS o VA',
    'qué panel TV elegir',
  ],
  openGraph: {
    title: '¿OLED, QLED o LED? Test de tecnología de TV | meskeIA',
    description:
      'Descubre qué tecnología de pantalla se adapta mejor a tu habitación, uso y presupuesto con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-television/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿OLED, QLED o LED? Elige la tecnología TV ideal | meskeIA',
    description:
      'Test de 10 preguntas para saber qué tipo de panel de TV te conviene según uso, habitación y presupuesto.',
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-tipo-television/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Televisión',
        description:
          'Test orientativo para descubrir qué tecnología de panel (OLED, QLED/Mini-LED, LED IPS o LED VA) se adapta mejor al uso, habitación y presupuesto.',
        url: 'https://meskeia.com/selector-tipo-television/',
        features: [
          'Test de 10 preguntas sobre uso y entorno',
          '4 tecnologías analizadas: OLED, QLED/Mini-LED, LED IPS, LED VA',
          'Análisis de iluminación ambiental y ángulos de visión',
          'Orientación de tamaño según distancia de visión',
          'Consideración de gaming, cine, deportes y uso general',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
