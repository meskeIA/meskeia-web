import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Produce la Energía - Del Átomo al Enchufe | meskeIA',
  description: 'Entiende cómo se genera la electricidad: nuclear, solar, eólica, gas, hidráulica y carbón. Mix eléctrico español, costes por kWh, emisiones CO2 y futuro energético. Explicador visual interactivo.',
  keywords: 'producción energía, mix eléctrico España, energía nuclear, energía solar, energía eólica, coste kWh, emisiones CO2, renovables, transición energética, fusión nuclear',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo se Produce la Energía - Del Átomo al Enchufe',
    description: 'Nuclear, solar, eólica, gas, hidráulica y carbón: cómo funciona cada fuente de energía, cuánto cuesta y cuánto contamina.',
    url: 'https://meskeia.com/visualizador-produccion-energia',
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
    title: 'Cómo se Produce la Energía - Explicador Visual',
    description: 'Las fuentes de energía explicadas: mecanismos, costes, CO2 y el futuro energético de España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Producción Energía meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo se Produce la Energía - Del Átomo al Enchufe',
  description: 'Explicador visual interactivo sobre producción de energía eléctrica: cómo funciona cada fuente (nuclear, solar, eólica, gas, hidráulica, carbón), el mix eléctrico español, costes y emisiones por kWh, y el futuro energético con renovables, baterías y fusión nuclear.',
  url: 'https://meskeia.com/visualizador-produccion-energia/',
  category: 'EducationalApplication',
  features: [
    '6 fuentes de energía explicadas con mecanismos simplificados',
    'Mix eléctrico español: distribución actual y evolución en 20 años',
    'Comparativa de coste y emisiones CO2 por kWh para cada fuente',
    'Futuro energético: almacenamiento, fusión nuclear, objetivos 2030',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
