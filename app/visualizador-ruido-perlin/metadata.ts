import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ruido Perlin: Generación Procedimental de Terreno | meskeIA',
  description:
    'Genera ruido de Perlin 2D en tu navegador y míralo en tiempo real. Ajusta escala, octavas y persistencia para crear terreno procedural estilo Minecraft, nubes o texturas. Cambia entre escala de grises y mapa de biomas (agua, arena, hierba, montaña, nieve) y prueba semillas distintas. Explica el ruido coherente y el fBm para programación de videojuegos.',
  keywords:
    'ruido perlin, perlin noise, generación procedimental, terreno procedural, ruido coherente, fBm, fractal brownian motion, octavas, mapa de biomas, generación de terreno Minecraft, noise, texturas procedurales, programación de videojuegos, Ken Perlin, generación de mapas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-ruido-perlin/',
  },
  openGraph: {
    type: 'website',
    title: 'Ruido Perlin: Generación Procedimental de Terreno',
    description:
      'Ruido de Perlin 2D en tiempo real: escala, octavas y persistencia para crear terreno procedural, nubes y texturas. Con mapa de biomas estilo Minecraft.',
    url: 'https://meskeia.com/visualizador-ruido-perlin/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruido Perlin',
    description: 'Genera terreno procedural con ruido de Perlin y fBm: octavas, persistencia y mapa de biomas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Ruido Perlin: Generación Procedimental',
  description:
    'Visualizador interactivo de ruido de Perlin 2D que genera terreno procedural en tiempo real sobre un canvas. Ajusta la escala (frecuencia), el número de octavas y la persistencia para construir ruido fractal (fBm), cambia entre escala de grises y un mapa de biomas estilo Minecraft (agua, arena, hierba, montaña, nieve) y prueba semillas distintas. Ideal para entender la generación procedimental en videojuegos.',
  url: 'https://meskeia.com/visualizador-ruido-perlin/',
  category: 'EducationalApplication',
  features: [
    'Ruido de Perlin 2D generado en el navegador, sin librerías',
    'Ruido fractal (fBm) con octavas configurables (1 a 8)',
    'Controles de escala, persistencia y semilla',
    'Semilla aleatoria reproducible con un clic',
    'Mapa de biomas: agua, arena, hierba, montaña y nieve',
    'Modo escala de grises para ver el ruido puro',
    'Render en canvas 256×256 escalado con píxeles nítidos',
    'En español',
  ],
  keywords: ['ruido perlin', 'generación procedimental', 'terreno procedural', 'fBm', 'videojuegos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ruido de Perlin y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ruido de Perlin es un tipo de ruido coherente: en lugar de valores aleatorios e independientes (como el ruido blanco), genera un patrón suave en el que puntos cercanos tienen valores parecidos. Lo creó Ken Perlin en 1983 para la película Tron y le valió un Oscar técnico en 1997. Se usa para generar terreno, nubes, texturas, fuego o movimiento orgánico de forma procedimental, es decir, calculada por algoritmo en lugar de dibujada a mano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre ruido aleatorio puro y ruido de Perlin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ruido aleatorio puro (ruido blanco) asigna a cada píxel un valor independiente, así que sale una textura granulada tipo "nieve" de televisión sin formas reconocibles. El ruido de Perlin interpola entre gradientes situados en una rejilla, de modo que el resultado es continuo y suave: aparecen colinas, valles y transiciones graduales que recuerdan a un paisaje natural. Esa suavidad es justo lo que lo hace útil para generar terreno y texturas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las octavas y la persistencia en el ruido fractal (fBm)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ruido fractal o fBm (movimiento browniano fraccional) suma varias capas de ruido de Perlin llamadas octavas. Cada octava tiene el doble de frecuencia (más detalle) y menos amplitud que la anterior. La persistencia controla cuánto baja la amplitud en cada octava: con persistencia alta el resultado es más rugoso y detallado, con persistencia baja queda más suave. Más octavas añaden detalle fino, como rocas y rugosidades sobre las montañas grandes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se genera terreno como el de Minecraft con ruido de Perlin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se genera un valor de ruido entre 0 y 1 para cada coordenada del mapa y se interpreta como altura. Luego se asignan biomas por rangos de altura: los valores bajos son agua, un poco más arriba arena de playa, después hierba, más arriba roca o montaña y los valores más altos nieve. Cambiar la semilla produce un mundo distinto pero con el mismo estilo, y ajustar la escala hace los continentes más grandes o más pequeños. Minecraft usa una variante llamada Simplex noise, también de Ken Perlin.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la semilla en la generación procedimental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La semilla es el número que inicializa el generador de números pseudoaleatorios que construye la tabla de permutación del ruido. Con la misma semilla y los mismos parámetros siempre se obtiene exactamente el mismo mapa, lo que permite reproducir un mundo o compartirlo con otros. Cambiar la semilla genera un terreno completamente distinto manteniendo el mismo estilo, y por eso los juegos permiten introducir una semilla para recrear un mundo concreto.',
      },
    },
  ],
};
