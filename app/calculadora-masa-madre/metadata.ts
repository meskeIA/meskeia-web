import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sustitución de Levadura por Masa Madre | meskeIA',
  description: 'Calcula cuánta masa madre necesitas para sustituir levadura fresca, seca o instantánea en cualquier receta. Ajuste automático de harina y agua.',
  keywords: 'masa madre, levadura, sustitución, calculadora pan, hidratación masa madre, pan artesano, fermentación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sustitución de Levadura por Masa Madre',
    description: 'Convierte cualquier receta de levadura comercial a masa madre con ajuste automático de harina y agua.',
    url: 'https://meskeia.com/calculadora-masa-madre',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Sustitución de Levadura por Masa Madre',
    description: 'Convierte cualquier receta de levadura comercial a masa madre con ajuste automático de harina y agua.',
  },
  other: {
    'application-name': 'Calculadora Masa Madre meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Sustitución de Levadura por Masa Madre',
  description: 'Calcula cuánta masa madre necesitas para sustituir levadura fresca, seca o instantánea en cualquier receta de pan, con ajuste automático de harina y agua.',
  url: 'https://meskeia.com/calculadora-masa-madre/',
  features: [
    'Conversión de levadura fresca, seca e instantánea a masa madre',
    'Ajuste automático de harina y agua por hidratación de la masa madre',
    'Compatible con cualquier hidratación de masa madre (50–150%)',
    'Tiempo de fermentación orientativo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
