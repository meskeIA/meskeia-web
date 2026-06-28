import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Convolución y Kernels - Filtros de Imagen y CNN | meskeIA',
  description:
    'Aplica un kernel de convolución 3×3 a una imagen y compara el antes y el después en tiempo real. Prueba presets de desenfoque (blur), enfoque (sharpen), detección de bordes (Laplaciano), Sobel y relieve, o edita los 9 pesos a mano. La misma operación que usan Photoshop, el postprocesado de videojuegos y las redes neuronales convolucionales (CNN).',
  keywords:
    'convolución, kernel, filtro de imagen, blur, sharpen, detección de bordes, Sobel, Laplaciano, emboss, relieve, procesamiento de imágenes, CNN, redes neuronales convolucionales, visión por computador, postprocesado, shaders, máscara 3x3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-convolucion-kernels/',
  },
  openGraph: {
    type: 'website',
    title: 'Visualizador de Convolución y Kernels - Filtros de Imagen y CNN | meskeIA',
    description:
      'Aplica un kernel 3×3 a una imagen y compara antes/después: blur, sharpen, Sobel, bordes y relieve. La operación base de Photoshop, los videojuegos y las CNN.',
    url: 'https://meskeia.com/visualizador-convolucion-kernels/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Convolución y Kernels | meskeIA',
    description: 'Edita un kernel 3×3 y mira cómo cambia la imagen: blur, sharpen, bordes y Sobel',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Convolución y Kernels',
  description:
    'Herramienta interactiva para entender la convolución de imágenes. Aplica un kernel 3×3 a una imagen generada por código y compara el original con el resultado al instante. Incluye presets de desenfoque, desenfoque gaussiano, enfoque, detección de bordes (Laplaciano), Sobel horizontal y vertical y relieve, además de un editor de los 9 pesos con divisor de normalización. Es la misma operación que está detrás de los filtros de Photoshop, el postprocesado de videojuegos y las capas convolucionales de las redes neuronales (CNN).',
  url: 'https://meskeia.com/visualizador-convolucion-kernels/',
  category: 'EducationalApplication',
  features: [
    'Kernel 3×3 editable: 9 pesos con divisor de normalización',
    '8 presets: identidad, blur, gaussiano, sharpen, bordes, Sobel H/V y relieve',
    'Comparación lado a lado: original y resultado',
    'Imagen de muestra generada por código (sin cargar archivos)',
    'Convolución por canal RGB con bordes por extensión (clamp)',
    'Recálculo instantáneo al cambiar el kernel',
    'Puente conceptual hacia visión por computador y CNN',
    'En español',
  ],
  keywords: ['convolución', 'kernel', 'filtro de imagen', 'Sobel', 'CNN'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la convolución de una imagen y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La convolución es una operación que recorre cada píxel de la imagen y lo recalcula combinando su valor con el de sus vecinos según unos pesos. Esos pesos forman una pequeña matriz llamada kernel o máscara (aquí de 3×3). Según los valores del kernel, la misma operación puede desenfocar, enfocar, resaltar bordes o crear relieve. Es la base de los filtros de imagen, del postprocesado en videojuegos y de las redes neuronales convolucionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un kernel y qué hace cada preset (blur, sharpen, Sobel)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un kernel es la matriz de pesos que se aplica a cada vecindario de píxeles. Un kernel de desenfoque (blur) promedia los vecinos y suaviza la imagen; uno de enfoque (sharpen) resta los vecinos para realzar el detalle; el Laplaciano y los kernels de Sobel detectan bordes calculando diferencias de intensidad; el relieve (emboss) usa pesos opuestos en diagonal para simular luz lateral. Cambiando los 9 números cambias por completo el efecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué hay que dividir o normalizar un kernel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando se suman los nueve pesos multiplicados por los píxeles, el resultado puede ser mayor que 255 o menor que 0. Para mantener el brillo medio se divide la suma entre un divisor, que normalmente es la suma de los pesos del kernel (por ejemplo 9 en un desenfoque de promedio). Si la suma de pesos es 0, como en los kernels de bordes, se usa divisor 1 y a veces se añade un desplazamiento para centrar el resultado en gris.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tiene la convolución con las redes neuronales y la visión por computador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las redes neuronales convolucionales (CNN) usan exactamente esta operación: cada capa convolucional aplica muchos kernels a la imagen. La diferencia es que los pesos de esos kernels no se escriben a mano, sino que se aprenden durante el entrenamiento. Las primeras capas suelen aprender detectores de bordes y texturas muy parecidos a Sobel o al Laplaciano, y las capas más profundas combinan esas señales para reconocer objetos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se tratan los bordes de la imagen al aplicar un kernel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En los píxeles del borde, el kernel 3×3 se sale de la imagen porque no hay vecinos. Hay varias estrategias: rellenar con ceros, repetir el píxel más cercano (extensión o clamp) o reflejar la imagen. Este visualizador usa extensión por clamp: cuando una coordenada se sale, se limita al borde más próximo. Así se evitan marcos negros o artefactos en los bordes del resultado.',
      },
    },
  ],
};
