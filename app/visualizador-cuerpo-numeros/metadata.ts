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
    url: 'https://meskeia.com/visualizador-cuerpo-numeros/',
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
    title: 'Tu Cuerpo en Números - Explicador Visual',
    description: '206 huesos, 37,2 billones de células, ADN que llega a Plutón 4 veces. Tu cuerpo es asombroso.',
    images: ['https://meskeia.com/og-image.png']
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos huesos tiene el cuerpo humano adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuerpo humano adulto tiene 206 huesos. Los bebés nacen con alrededor de 270 huesos cartilaginosos que se van fusionando durante el crecimiento. El hueso más largo es el fémur y el más pequeño es el estribo, situado en el oído medio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas células tiene el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que el cuerpo humano contiene aproximadamente 37,2 billones de células (37,2 × 10¹²). Este cálculo, publicado en 2013 por Bianconi et al., varía según la talla y el sexo de la persona. Las células rojas de la sangre son las más numerosas, con cerca de 25 billones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos latidos da el corazón al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En reposo, el corazón late entre 60 y 100 veces por minuto, lo que equivale a entre 86.400 y 144.000 latidos al día. A lo largo de una vida media de 80 años, el corazón late aproximadamente 3.000 millones de veces sin descanso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué longitud tendría el ADN de todas las células del cuerpo humano si se estirara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si se estirara todo el ADN de las células del cuerpo humano, alcanzaría entre 50.000 y 170.000 millones de kilómetros, suficiente para ir y volver a Plutón unas 4 veces. Cada célula contiene aproximadamente 2 metros de ADN comprimido en un núcleo de apenas 6 micrómetros de diámetro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de estadísticas del cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de biología, ciencias de la salud o secundaria que quieran consolidar datos anatómicos y fisiológicos, así como para cualquier persona curiosa que quiera entender las magnitudes reales del cuerpo con comparaciones cotidianas. No requiere registro ni conocimientos previos.',
      },
    },
  ],
};
