import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sustitución de Gelatina — Hojas, Polvo y Agar-Agar | meskeIA',
  description: 'Convierte entre gelatina en hoja (bronce, plata, oro, platino), polvo y agar-agar. Equivalencias precisas por bloom strength para repostería y cocina.',
  keywords: 'sustitución gelatina, hojas gelatina, agar-agar equivalencia, bloom strength, gelatina polvo, gelatina oro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sustitución de Gelatina | meskeIA',
    description: 'Convierte entre gelatina en hoja (bronce, plata, oro, platino), polvo y agar-agar con equivalencias por bloom strength.',
    url: 'https://meskeia.com/calculadora-gelatina',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Sustitución de Gelatina | meskeIA',
    description: 'Convierte entre gelatina en hoja, polvo y agar-agar con equivalencias precisas por bloom strength.',
  },
  other: {
    'application-name': 'Calculadora Gelatina meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Sustitución de Gelatina',
  description: 'Calcula equivalencias entre todos los tipos de gelatina: hojas de bronce (120 bloom), plata (160), oro (200), platino (250), polvo 200 y 250, y agar-agar. Basada en el bloom strength de cada tipo.',
  url: 'https://meskeia.com/calculadora-gelatina/',
  category: 'UtilityApplication',
  features: [
    'Conversión entre 7 tipos de gelatina (4 hojas + 2 polvos + agar-agar)',
    'Resultados en gramos y número de hojas simultáneamente',
    'Advertencia sobre el comportamiento diferente del agar-agar',
    'Destaque de la gelatina hoja de oro (la más habitual en supermercados)',
    'Selector de unidad: gramos o número de hojas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
