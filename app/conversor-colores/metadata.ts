import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Convertidor de Colores - HEX, RGB, HSL, CMYK | meskeIA',
  description: 'Convierte colores entre HEX, RGB, HSL y CMYK al instante. Elige el color por su nombre (ocre, lapislázuli, verde oliva) y descárgalo como imagen PNG o JPEG para usarlo de fondo.',
  keywords: 'convertidor colores, HEX RGB, RGB HSL, color picker, CMYK, conversión colores, diseño web, descargar color en png, fondo de color liso, nombres de colores en español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Convertidor de Colores - meskeIA',
    description: 'Convierte entre HEX, RGB, HSL y CMYK, elige el color por su nombre y descárgalo como imagen',
    url: 'https://meskeia.com/conversor-colores/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Convertidor de Colores - HEX, RGB, HSL, CMYK",
  description: "Convierte colores entre HEX, RGB, HSL y CMYK al instante. Elige el color por su nombre en español y descárgalo como imagen PNG o JPEG para usarlo de fondo de pantalla o de diapositiva.",
  url: 'https://meskeia.com/conversor-colores/',
  category: 'UtilityApplication',
  features: [
    'Conversión instantánea entre HEX, RGB, HSL y CMYK con actualización en tiempo real',
    'Color picker visual integrado para seleccionar cualquier color con el ratón o en pantalla táctil',
    'Sliders interactivos para ajustar canales RGB, tono/saturación/luminosidad HSL y CMYK',
    'Buscador de 71 colores con nombre en español, incluidos pigmentos como ocre, lapislázuli, siena tostada o púrpura de Tiro',
    'Descarga del color como imagen de color plano en PNG o JPEG, en Full HD, 4K, vertical de móvil, cuadrado o a medida',
    'Nombre del color siempre informado: el exacto si está en la tabla, y el más parecido por distancia perceptual si no',
    'Exportación de código HTML/CSS listo para copiar y pegar en proyectos web',
    'Todo el procesamiento ocurre en el navegador: ningún color ni imagen se envía a un servidor',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo convierto un color HEX a RGB?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un color HEX como #2E86AB se convierte dividiendo el valor en tres pares: 2E (rojo), 86 (verde) y AB (azul), y pasando cada uno a decimal. El resultado es RGB(46, 134, 171). Con este convertidor basta con pegar el código HEX y obtienes al instante los valores RGB, HSL y CMYK equivalentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los modelos de color RGB, HSL y CMYK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RGB (rojo, verde, azul) es el modelo aditivo usado en pantallas. HSL (tono, saturación, luminosidad) es más intuitivo para ajustar colores manualmente. CMYK (cian, magenta, amarillo, negro) es el modelo sustractivo usado en impresión. Un mismo color puede expresarse en los tres modelos con valores distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el conversor de colores en diseño web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En diseño web, CSS acepta colores en HEX, RGB y HSL, pero las herramientas de diseño como Figma o Adobe suelen exportar en un formato específico. El conversor permite trasladar colores entre formatos sin cálculos manuales, garantizando que el color exacto definido en el diseño se usa correctamente en el código CSS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo convertir cualquier color, incluidos los con transparencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los formatos HEX, RGB, HSL y CMYK representan colores opacos. La transparencia (canal alfa) se gestiona con variantes como RGBA o HSLA. Este convertidor trabaja con los cuatro modelos estándar y muestra una vista previa visual del color, lo que permite verificar visualmente el resultado antes de usarlo en tu proyecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo descargo una imagen de un solo color para usarla de fondo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Elige el color y descárgalo como archivo de color plano en el tamaño que necesites: Full HD (1920×1080), 4K (3840×2160), vertical de móvil (1080×1920), cuadrado o a medida. Conviene usar PNG y no JPEG: un color plano en PNG ocupa unos pocos KB aunque sea 4K y conserva el valor exacto, mientras que JPEG comprime por bloques y altera ligeramente el color, de modo que el píxel del archivo ya no coincide con el código elegido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el código HEX del ocre, el lapislázuli o el verde oliva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ocre se representa convencionalmente como #CC7722, el azul lapislázuli como #26619C y el verde oliva como #808000. Son valores convencionales, no oficiales: los pigmentos históricos y los nombres de uso común no tienen un código único, y cada fuente los fija de forma algo distinta. Por eso conviene tomarlos como punto de partida y ajustar después el tono a lo que necesite el proyecto.',
      },
    },
  ],
};
