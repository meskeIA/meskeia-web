import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Identificador de Color por Cámara: Nombre, HEX y RGB en Vivo | meskeIA',
  description: 'Apunta con la cámara del móvil a cualquier objeto y descubre el nombre del color, su código HEX, RGB y HSL en tiempo real. Pensado para daltonismo y baja visión. También identifica colores en una foto. El vídeo nunca sale de tu dispositivo.',
  keywords: 'identificar color camara, nombre de un color, detector de color, que color es, color hex de una foto, cuentagotas color online, identificar colores daltonismo, saber el color, color picker imagen, codigo de color',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Identificador de Color por Cámara | meskeIA',
    description: 'Descubre el nombre y el código HEX/RGB de cualquier color apuntando con la cámara o subiendo una foto. Útil para daltonismo, baja visión y diseño.',
    url: 'https://meskeia.com/identificador-color-camara/',
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
    title: 'Identificador de Color por Cámara | meskeIA',
    description: 'Nombre del color + HEX, RGB y HSL en tiempo real con la cámara. Para daltonismo, baja visión y diseño. Privacidad total: el vídeo no sale del dispositivo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Identificador de Color por Cámara - Nombre, HEX y RGB",
  description: "Herramienta que identifica en tiempo real el nombre de un color y sus códigos HEX, RGB y HSL a partir de la cámara del dispositivo o de una imagen. Diseñada como apoyo para personas con daltonismo o baja visión y para trabajo de diseño. Todo el procesamiento ocurre en el navegador, sin enviar imágenes a servidores.",
  url: 'https://meskeia.com/identificador-color-camara/',
  category: 'UtilityApplication',
  features: [
    'Identificación del color en el centro del encuadre en tiempo real mediante la cámara',
    'Nombre del color en español calculado por vecino más cercano (distancia perceptual redmean)',
    'Códigos HEX, RGB y HSL con botón de copia al portapapeles',
    'Modo imagen: sube una foto o captura y toca cualquier punto para leer su color',
    'Congelar la lectura para leer con calma un color inestable por la luz',
    'Historial de los últimos colores identificados para reutilizarlos',
    'Procesamiento 100% en el dispositivo: la cámara y las imágenes nunca salen del navegador',
  ],
  keywords: ['identificar color', 'nombre de color', 'codigo hex', 'rgb', 'daltonismo', 'cuentagotas'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se identifica el nombre de un color con la cámara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al activar la cámara, la herramienta toma la zona central del encuadre (marcada con una mira), promedia los píxeles de esa región y obtiene su valor RGB medio. Después compara ese valor con una paleta de colores con nombre en español y devuelve el más parecido usando una fórmula de distancia perceptual (redmean), que se aproxima mejor a cómo el ojo humano percibe las diferencias de color que una simple distancia matemática entre valores RGB. La lectura se actualiza varias veces por segundo, así que basta con apuntar al objeto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sirve para personas con daltonismo o baja visión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, es uno de sus usos principales. Una persona con daltonismo puede tener dificultad para distinguir, por ejemplo, un rojo de un verde o un azul de un morado; la herramienta pone nombre objetivo al color que tiene delante, además de su código exacto. El nombre se muestra en letra grande y con alto contraste. Es un apoyo cotidiano para elegir ropa, leer indicadores de colores o trabajar con materiales, aunque no sustituye una valoración oftalmológica del tipo y grado de daltonismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo identificar el color de una foto o de una captura de pantalla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Además del modo cámara existe un modo imagen: subes una fotografía o una captura de pantalla y tocas (o haces clic en) cualquier punto de la imagen para leer el color exacto de ese píxel, con su nombre y sus códigos HEX, RGB y HSL. Es la función típica de un cuentagotas o color picker, útil también para diseño, para copiar el color de una web o de un logotipo, o para reproducir el tono de una pintura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué precisión tiene y por qué a veces cambia el color?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El color que capta la cámara depende mucho de la iluminación y del balance de blancos del propio dispositivo: una misma pared parece más cálida con luz de bombilla y más fría con luz de día. Por eso la lectura puede variar. Para un resultado más fiable conviene iluminar bien el objeto con luz natural, acercar la cámara y usar el botón de congelar para fijar la lectura. El nombre siempre es el más cercano de una paleta finita, de modo que un tono intermedio se etiquetará con el nombre más próximo, no con un término inventado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se envían la cámara o las fotos a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Todo el procesamiento ocurre en tu propio navegador: la imagen de la cámara y las fotos que subes se analizan en el dispositivo y no se transmiten ni se guardan en ningún servidor. Cuando cierras la pestaña, no queda nada. El permiso de cámara que pide el navegador es únicamente para poder leer el vídeo localmente y se puede revocar en cualquier momento desde la barra de direcciones.',
      },
    },
  ],
};
