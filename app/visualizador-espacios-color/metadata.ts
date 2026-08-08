import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Espacios de Color: RGB, HSV, HSL y HEX | meskeIA',
  description:
    'Selecciona un color y míralo a la vez en RGB, HSV, HSL y HEX. Picker interactivo con cuadrado de saturación/valor, slider de tono arcoíris y sliders RGB. Pensado para programación de videojuegos, generación de imágenes, CSS y diseño. Copia cada valor con un clic.',
  keywords:
    'espacios de color, RGB HSV HSL, conversor de color, HEX, selector de color, picker de color, color HSV, color HSL, rueda de tono, diseño, CSS, programación de videojuegos, generación de imágenes, paletas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-espacios-color/',
  },
  openGraph: {
    type: 'website',
    title: 'Espacios de Color: RGB, HSV, HSL y HEX',
    description:
      'Un mismo color en RGB, HSV, HSL y HEX a la vez. Picker con cuadrado saturación/valor y slider de tono, ideal para videojuegos, CSS y diseño.',
    url: 'https://meskeia.com/visualizador-espacios-color/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espacios de Color',
    description: 'Un mismo color en RGB, HSV, HSL y HEX a la vez, con picker interactivo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Espacios de Color: RGB, HSV, HSL y HEX',
  description:
    'Herramienta interactiva para visualizar un mismo color simultáneamente en los espacios RGB, HSV, HSL y HEX. Incluye un cuadrado de saturación/valor sobre canvas, un slider de tono con gradiente arcoíris y sliders RGB bidireccionales, con copia al portapapeles de cada notación. Útil para programación de videojuegos, generación de imágenes, CSS y diseño gráfico.',
  url: 'https://meskeia.com/visualizador-espacios-color/',
  category: 'EducationalApplication',
  features: [
    'Mismo color en RGB, HSV, HSL y HEX a la vez',
    'Cuadrado saturación/valor interactivo (canvas)',
    'Slider de tono con gradiente arcoíris',
    'Sliders RGB bidireccionales (0-255)',
    'Copia cada valor al portapapeles con un clic',
    'Botón de color aleatorio',
    'Conversiones rgb↔hsv↔hsl↔hex propias',
    'En español, sin instalar nada',
  ],
  keywords: ['espacios de color', 'RGB HSV HSL', 'conversor de color', 'HEX', 'selector de color'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre RGB, HSV, HSL y HEX?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cuatro describen el mismo color, pero con coordenadas distintas. RGB lo define por cantidad de rojo, verde y azul (0-255 cada canal). HEX es exactamente RGB escrito en hexadecimal (#RRGGBB), el formato típico de CSS. HSV (tono, saturación, valor) y HSL (tono, saturación, luminosidad) reordenan la información en torno al tono para que sea más intuitivo elegir y ajustar colores: cambiar solo el brillo o solo la intensidad es directo, algo incómodo en RGB.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene usar HSV o HSL en lugar de RGB?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HSV y HSL son más cómodos cuando trabajas con el color de forma perceptual: crear una paleta variando el tono, oscurecer o aclarar manteniendo el matiz, o generar variaciones de un mismo color para un personaje o una interfaz. RGB y HEX son mejores para almacenar o transmitir el color (CSS, formatos de imagen, shaders), porque es la representación que usa la pantalla. Un flujo habitual es elegir en HSV/HSL y exportar en HEX o RGB.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué RGB es un modelo aditivo y CMYK no?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RGB es aditivo: parte del negro (pantalla apagada) y suma luz roja, verde y azul; al sumar las tres al máximo se obtiene blanco. Es el modelo de las pantallas, los videojuegos y la generación de imágenes. CMYK es sustractivo: parte del blanco del papel y resta luz con tintas (cian, magenta, amarillo, negro). Por eso no debes diseñar para pantalla pensando en CMYK ni esperar que un color RGB vibrante se imprima idéntico: son procesos físicos distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierte un color de RGB a HSV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se normalizan R, G y B al rango 0-1 y se toman su máximo y su mínimo. El valor V es el máximo. La saturación S es 0 si el máximo es 0, y en otro caso (máx − mín) / máx. El tono H se calcula según cuál de los tres canales sea el máximo, comparando los otros dos, y se expresa en grados de 0 a 360. HSL es parecido pero la tercera componente es la luminosidad, definida como (máx + mín) / 2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sirve este visualizador para comprobar el contraste y la accesibilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ayuda a entender cómo cambia un color al mover su luminosidad o saturación, lo cual es el primer paso para ajustar contraste entre texto y fondo. Sin embargo, el contraste accesible (WCAG) se mide con la ratio de luminancia relativa entre dos colores, no con un único color, así que para verificar conformidad conviene calcular esa ratio entre el color de texto y el de fondo con una herramienta específica de contraste.',
      },
    },
  ],
};
