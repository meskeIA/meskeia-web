import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Inflamación — Mecanismo Celular Agudo y Crónico | meskeIA',
  description: 'Visualizador educativo del proceso inflamatorio: los 5 signos clásicos, diferencia entre inflamación aguda y crónica, células protagonistas (mastocitos, neutrófilos, macrófagos) y factores que la amplifican.',
  keywords: 'inflamación, inflamación crónica, inflamación aguda, neutrófilos, macrófagos, citocinas, histamina, prostaglandinas, respuesta inflamatoria, inmunología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-inflamacion/' },
  openGraph: {
    type: 'website',
    title: 'La Inflamación — Mecanismo Celular Agudo y Crónico',
    description: 'Los 5 signos clásicos, inflamación aguda vs crónica, células protagonistas y factores amplificadores.',
    url: 'https://meskeia.com/visualizador-inflamacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Inflamación — Mecanismo Celular Agudo y Crónico',
    description: 'Visualizador educativo: 5 signos clásicos, aguda vs crónica, mastocitos, neutrófilos, macrófagos.',
  },
  other: { 'application-name': 'Inflamación meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Inflamación — Mecanismo Celular Agudo y Crónico',
  description: 'Explicador visual interactivo del proceso inflamatorio: los 5 signos clásicos de Celso, diferencia entre inflamación aguda y crónica, células protagonistas y factores que amplifican la inflamación crónica.',
  url: 'https://meskeia.com/visualizador-inflamacion/',
  category: 'EducationalApplication',
  features: [
    'Los 5 signos clásicos con mecanismo celular detallado',
    'Comparativa aguda vs crónica con colores diferenciados',
    'Selector de 4 células protagonistas (mastocitos, neutrófilos, macrófagos, linfocitos T)',
    '6 factores amplificadores de la inflamación crónica',
    'Línea temporal del proceso inflamatorio agudo (0h → resolución)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});
