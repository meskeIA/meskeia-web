import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Inmune - Tu Ejército Invisible | meskeIA',
  description: 'Entiende cómo funciona tu sistema inmunitario: las 3 líneas de defensa, anticuerpos, memoria inmunológica, tipos de vacunas e inmunidad de grupo.',
  keywords: 'sistema inmune, inmunidad innata, inmunidad adaptativa, anticuerpos, linfocitos, vacunas, memoria inmunológica, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Inmune - Tu Ejército Invisible',
    description: 'Las 3 líneas de defensa, anticuerpos y memoria inmunológica explicados visualmente.',
    url: 'https://meskeia.com/visualizador-sistema-inmune',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Sistema Inmune - Tu Ejército Invisible',
    description: 'Barreras, inmunidad innata vs adaptativa, anticuerpos y vacunas.',
  },
  other: { 'application-name': 'Sistema Inmune meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Inmune - Tu Ejército Invisible',
  description: 'Explicador visual interactivo del sistema inmunitario humano: las 3 líneas de defensa, anticuerpos en forma de Y, memoria inmunológica, tipos de vacunas y datos fascinantes.',
  url: 'https://meskeia.com/visualizador-sistema-inmune/',
  category: 'EducationalApplication',
  features: [
    'Las 3 líneas de defensa explicadas paso a paso',
    'Diagrama interactivo de anticuerpos',
    'Gráfico de respuesta primaria vs secundaria',
    '4 tipos de vacunas comparados',
    'Datos fascinantes del sistema inmune',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
