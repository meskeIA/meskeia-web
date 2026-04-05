import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu Cuerpo en Números - Estadísticas Asombrosas del Cuerpo Humano | meskeIA',
  description: 'Descubre las cifras más increíbles del cuerpo humano: 206 huesos, 100.000 latidos al día, 37,2 billones de células, ADN que llega al Sol. Explicador visual interactivo.',
  keywords: 'cuerpo humano números, estadísticas cuerpo, huesos músculos, latidos corazón, células humanas, ADN longitud, curiosidades cuerpo, anatomía datos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Cuerpo en Números - Estadísticas Asombrosas del Cuerpo Humano',
    description: 'Las cifras más increíbles del cuerpo humano explicadas visualmente: estructura, sistemas, células y récords.',
    url: 'https://meskeia.com/visualizador-cuerpo-numeros',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tu Cuerpo en Números - Explicador Visual',
    description: '206 huesos, 37,2 billones de células, ADN que llega a Plutón 4 veces. Tu cuerpo es asombroso.',
  },
  other: { 'application-name': 'Cuerpo en Números meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Cuerpo en Números - Estadísticas Asombrosas del Cuerpo Humano',
  description: 'Explicador visual interactivo sobre las cifras más sorprendentes del cuerpo humano: estructura ósea y muscular, sistemas en acción diaria, mundo microscópico celular y récords biológicos.',
  url: 'https://meskeia.com/visualizador-cuerpo-numeros/',
  category: 'EducationalApplication',
  features: [
    'Estructura corporal: 206 huesos, 640 músculos, 78 órganos en bloques proporcionales',
    'Sistemas en acción: latidos, respiraciones, saliva, parpadeos y kilómetros de sangre diarios',
    'Mundo micro: 37,2 billones de células, 86.000 millones de neuronas, longitud total del ADN',
    'Récords y curiosidades: velocidad nerviosa, ácido estomacal, regeneración hepática',
    'Datos de ejemplo con comparaciones cotidianas para dimensionar las cifras',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
