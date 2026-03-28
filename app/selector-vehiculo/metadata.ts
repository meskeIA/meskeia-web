import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Vehículo — ¿Qué coche me conviene? | meskeIA',
  description:
    'Test para saber qué tipo de coche te conviene según tu uso, presupuesto y estilo de vida. Compacto, SUV, familiar. Gasolina, híbrido o eléctrico. Comparativa de costes anuales incluida.',
  keywords: [
    'qué coche comprar',
    'selector coche',
    'test tipo de coche',
    'gasolina o eléctrico',
    'SUV o compacto',
    'qué motorización elegir',
    'coste anual coche',
    'comparativa coches España',
    'cuál es el mejor coche para mí',
    'híbrido o gasolina',
  ],
  openGraph: {
    title: '¿Qué tipo de coche te conviene? Test en 9 preguntas | meskeIA',
    description:
      'Descubre el segmento y motorización ideal para tu perfil real. Compacto, SUV, familiar. Gasolina, híbrido, eléctrico. Comparativa de costes anuales estimados.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-vehiculo/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué coche te conviene? Test gratuito | meskeIA',
    description:
      'Test de 9 preguntas para encontrar tu tipo de coche ideal según tus km, uso, presupuesto y estilo de vida.',
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-vehiculo/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Vehículo',
        description:
          'Test orientativo para descubrir qué tipo de coche (segmento y motorización) se adapta mejor a tu perfil de uso, presupuesto y estilo de vida. Incluye comparativa de costes anuales estimados.',
        url: 'https://meskeia.com/selector-vehiculo/',
        features: [
          'Test de 9 preguntas sobre uso y perfil',
          'Recomendación de segmento (urbano, compacto, SUV, familiar)',
          'Recomendación de motorización (gasolina, diésel, híbrido, eléctrico)',
          'Comparativa de coste anual estimado por tipo de motor',
          'Alertas contextuales (ZBE, puntos de carga, km altos)',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
