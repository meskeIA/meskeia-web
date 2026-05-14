import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Balance de Blancos: 2500K-10000K | meskeIA',
  description: 'Aprende balance de blancos moviendo la temperatura de color (2500K a 10000K) sobre 3 escenas con luz distinta. Indicador visual de WB correcto y guía completa con presets de cámara.',
  keywords: 'simulador balance de blancos, temperatura color Kelvin, WB cámara, tungsteno fluorescente sol nublado, corrección de color fotografía, dominante de color, RAW JPEG balance, color naranja azul foto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Balance de Blancos',
    description: 'Mueve el slider de temperatura sobre 3 escenas con luz distinta y aprende cuándo aciertas el balance correcto.',
    url: 'https://meskeia.com/simulador-balance-blancos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Balance de Blancos',
    description: 'Aprende balance de blancos con un slider Kelvin sobre 3 escenas distintas.',
  },
  other: {
    'application-name': 'Simulador de Balance de Blancos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Balance de Blancos',
  description: 'Herramienta interactiva para aprender el balance de blancos de la cámara. Slider de temperatura de color (2500K a 10000K) aplicado sobre 3 escenas con luz dominante distinta (tungsteno interior, día nublado, atardecer). Indica visualmente cuándo aciertas el balance correcto.',
  url: 'https://meskeia.com/simulador-balance-blancos/',
  category: 'EducationalApplication',
  features: [
    'Slider de temperatura de color de 2500K a 10000K en escala Kelvin',
    '3 escenas con luz dominante distinta: interior tungsteno, día nublado, atardecer',
    'Visualización inmediata del tinte aplicado sobre la escena (cálido o frío)',
    'Indicador visual de WB correcto para cada escena',
    'Mensajes contextuales: demasiado cálido, demasiado frío, balance correcto',
    'Guía completa con presets de cámara (Tungsteno, Fluorescente, Sol, Nublado, Sombra)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});
