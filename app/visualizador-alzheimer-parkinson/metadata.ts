import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Alzheimer y Parkinson: Mecanismo Neurobiológico — meskeIA',
  description: 'Visualizador de la neurobiología molecular del Alzheimer y el Parkinson. Placas amiloides (APP/Aβ), ovillos de Tau, α-sinucleína, cuerpos de Lewy y circuito dopaminérgico. Sin síntomas ni diagnóstico.',
  keywords: ['Alzheimer mecanismo molecular beta-amiloide', 'proteína Tau ovillos neurofibrilares', 'APP beta-secretasa cascada amiloide', 'Parkinson alfa-sinucleína cuerpos Lewy', 'sustancia negra dopamina nigroestriada', 'ganglios basales circuito motor dopamina', 'hipótesis cascada amiloide', 'neurobiología enfermedades neurodegenerativas'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Alzheimer y Parkinson: Mecanismo Neurobiológico — meskeIA',
    description: 'Qué ocurre molecularmente en el cerebro en el Alzheimer (Aβ/Tau) y el Parkinson (α-sinucleína/dopamina).',
    type: 'website',
    url: 'https://meskeia.com/visualizador-alzheimer-parkinson',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alzheimer y Parkinson: Mecanismo Neurobiológico',
    description: 'Placas amiloides, ovillos de Tau, α-sinucleína y circuito dopaminérgico — neurobiología molecular explicada.',
  },
  other: { 'application-name': 'Alzheimer Parkinson Neurobiología meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Alzheimer y Parkinson: Mecanismo Neurobiológico',
  description: 'Visualizador de la neurobiología molecular del Alzheimer (APP, Aβ, Tau, cascada amiloide) y el Parkinson (α-sinucleína, cuerpos de Lewy, circuito nigroestriado y ganglios basales). Enfoque educativo molecular, sin síntomas ni diagnóstico.',
  url: 'https://meskeia.com/visualizador-alzheimer-parkinson/',
  category: 'EducationalApplication',
  features: [
    'Procesamiento APP: vía normal vs amiloidogénica (SVG interactivo)',
    'Proteína Tau normal vs hiperfosforilada y ovillos neurofibrilares',
    'Hipótesis de la cascada amiloide con diagrama de flujo',
    'Vía nigroestriada y pérdida de dopamina en Parkinson',
    'α-sinucleína y cuerpos de Lewy (SVG)',
    'Circuito de ganglios basales: vía directa vs indirecta',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
