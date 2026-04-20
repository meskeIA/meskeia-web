import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta | meskeIA',
  description: 'Visualizador educativo de la hipertensión arterial: qué son sistólica y diastólica, etapas ESC/ESH 2018, cómo daña las arterias y órganos diana (corazón, cerebro, riñón, ojos).',
  keywords: 'hipertensión arterial, presión alta, sistólica diastólica, daño arterial, aterosclerosis, órganos diana, ictus hipertensión, retinopatía hipertensiva, nefropatía hipertensiva',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-hipertension/' },
  openGraph: {
    type: 'website',
    title: 'Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta',
    description: 'Mecanismo arterial, etapas ESC/ESH 2018 y daño en órganos diana. Explicador visual educativo.',
    url: 'https://meskeia.com/visualizador-hipertension/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hipertensión — Qué le Ocurre al Cuerpo',
    description: 'El 46% de los hipertensos en España no saben que lo son. Entiende por qué la presión alta daña sin avisar.',
  },
  other: { 'application-name': 'Hipertensión meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta',
  description: 'Visualizador educativo interactivo sobre la hipertensión arterial: etapas de presión (clasificación ESC/ESH 2018), mecanismos de daño arterial (tensión mecánica, remodelado, aterosclerosis) y órganos diana.',
  url: 'https://meskeia.com/visualizador-hipertension/',
  category: 'EducationalApplication',
  features: [
    'Clasificación ESC/ESH 2018 por etapas con colores: de óptima a HTA grado 3',
    'Selector de 3 fases de daño arterial: tensión mecánica, remodelado y aterosclerosis',
    'Órganos diana clickables: corazón, cerebro, riñón, ojos y arterias grandes',
    'Factores modificables y no modificables que elevan la presión',
    'Warningbox: el asesino silencioso y estadísticas de diagnóstico en España',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
