import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Cámara Lenta (Slow Motion) | meskeIA',
  description: 'Calcula el factor de ralentización de tu vídeo a cámara lenta. Introduce los fps de grabación y reproducción para obtener el factor slow motion, la velocidad de obturación correcta (regla 180°) y la duración final del clip.',
  keywords: 'calculadora cámara lenta, slow motion fps, factor ralentización vídeo, regla 180 grados video, obturador slow motion, 120fps 240fps 960fps, velocidad obturación grabación, slow motion suave intenso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cámara Lenta (Slow Motion)',
    description: 'Factor de ralentización, obturador correcto y duración final del clip. Desde slow motion suave hasta ultra slow motion.',
    url: 'https://meskeia.com/calculadora-camara-lenta/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Cámara Lenta (Slow Motion)',
    description: 'Calcula el factor de ralentización y el obturador correcto para slow motion real.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Cámara Lenta meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Cámara Lenta (Slow Motion)',
  description: 'Herramienta para calcular el factor de ralentización de vídeo en cámara lenta. A partir de los fps de grabación y reproducción obtiene el multiplicador slow motion, la velocidad de obturación correcta según la regla 180°, el nivel de slow motion y la duración final del clip.',
  url: 'https://meskeia.com/calculadora-camara-lenta/',
  category: 'UtilityApplication',
  features: [
    'Factor de ralentización automático (ej. 4× más lento)',
    'Velocidad de obturación correcta para la grabación (regla 180°)',
    'Duración del clip resultante a partir de la grabación',
    'Niveles de slow motion: suave, marcado, intenso y ultra',
    'Selectores rápidos de fps comunes (60, 90, 120, 240, 480, 960)',
    'Guía educativa completa: interpolación vs slow motion real, casos de uso',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el factor de ralentización de un vídeo a cámara lenta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factor de ralentización se obtiene dividiendo los fps de grabación entre los fps de reproducción. Si grabas a 120 fps y reproduces a 25 fps, el factor es 4,8×, lo que significa que el vídeo se verá 4,8 veces más lento que en tiempo real. Un clip grabado en 10 segundos a 120 fps durará 48 segundos al reproducirse a 25 fps.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre slow motion real e interpolación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El slow motion real graba más fotogramas por segundo de los que se necesitan para la reproducción; cada fotograma tiene información real capturada por el sensor. La interpolación (como la IA slow motion de algunos móviles) genera fotogramas intermedios artificiales estimando el movimiento. El resultado del slow motion real es siempre más nítido y natural, sin artefactos en movimientos rápidos y complejos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué velocidad de obturación debo usar al grabar a cámara lenta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aplica la regla de los 180° sobre los fps de grabación, no los de reproducción. Si grabas a 120 fps, la velocidad de obturación correcta es 1/240 s. Esto significa que entrar mucha más luz al sensor que cuando grabas a 25 fps (1/50 s), por lo que en exteriores casi siempre necesitarás un filtro ND para evitar sobreexposición.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué fps necesito para conseguir un slow motion fluido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para slow motion suave (2× más lento) basta con 50 fps grabando para reproducir a 25 fps. Para slow motion marcado (4×) necesitas 100-120 fps. Para slow motion intenso (8-10×) se requieren 240-250 fps. El ultra slow motion (32-40×) que aparece en vídeos de impactos o gotas de agua se consigue con cámaras que graban a 960 fps o más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la cámara lenta a 60 fps se ve diferente a la de 240 fps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A mayor número de fps de grabación, mayor es el factor de ralentización disponible y menor motion blur por fotograma, lo que produce un efecto más cristalino y "sobrenatural". Los 60 fps reproducidos a 25 fps dan un factor de 2,4×, suficiente para deportes. Los 240 fps dan un factor de 9,6×, ideal para capturar detalles de movimientos muy rápidos como una pelota o el batir de alas de un insecto.',
      },
    },
  ],
};
