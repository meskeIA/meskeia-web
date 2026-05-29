import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Regla 500 y NPF (Astrofotografía) | meskeIA',
  description: 'Calcula el tiempo máximo de exposición sin estelas de estrellas. Regla 500 simple y fórmula NPF precisa (apertura + píxel + declinación). Visualización de estrellas en tiempo real.',
  keywords: 'regla 500 astrofotografía, fórmula NPF estrellas, exposición máxima sin estelas, star trail evitar, pixel pitch declinación, vía láctea cámara, tiempo exposición estrellas, astrofoto principiantes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Regla 500 y NPF para Astrofotografía',
    description: 'Tiempo máximo de exposición para fotos de cielo nocturno sin que las estrellas se conviertan en estelas.',
    url: 'https://meskeia.com/calculadora-regla-500-npf-astrofoto/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Regla 500 y NPF',
    description: 'Regla 500 simple + NPF precisa para astrofotografía.',
  },
  other: {
    'application-name': 'Regla 500 y NPF Astrofoto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Regla 500 y NPF para Astrofotografía',
  description: 'Herramienta para calcular el tiempo máximo de exposición fotográfica sin que las estrellas se conviertan en estelas. Implementa la regla 500 clásica (rápida) y la fórmula NPF moderna (más precisa, considera apertura, tamaño de píxel y declinación celeste). Incluye visualización SVG de estrellas que reaccionan al tiempo elegido.',
  url: 'https://meskeia.com/calculadora-regla-500-npf-astrofoto/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de tiempo máximo por regla 500 (clásica) y NPF (precisa)',
    '4 sensores: Full Frame, APS-C ×1,5, APS-C ×1,6, Micro 4/3',
    'Cálculo automático de pixel pitch desde megapíxeles del sensor',
    'Slider de declinación celeste con presets (Orión, Vía Láctea, Polaris)',
    'Visualización SVG: estrellas puntuales o con estela según el tiempo elegido',
    'Comparativa entre tiempo elegido y los dos límites',
    'Guía completa de astrofotografía nocturna',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la regla 500 en astrofotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla 500 es una fórmula rápida para calcular el tiempo máximo de exposición sin que las estrellas aparezcan como estelas en la foto. La fórmula es: tiempo (segundos) = 500 ÷ focal en mm (equivalente Full Frame). Por ejemplo, con un objetivo de 24 mm en Full Frame, el tiempo máximo sería 500 ÷ 24 ≈ 20 segundos. Es una aproximación práctica que no requiere conocer las especificaciones exactas del sensor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la regla 500 y la fórmula NPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla 500 es rápida pero imprecisa: no tiene en cuenta la apertura ni el tamaño del píxel del sensor. La fórmula NPF (desarrollada por Frédéric Michaud) es más precisa porque incorpora la focal, la apertura (f/), el tamaño de píxel del sensor y la declinación celeste del objeto fotografiado. En sensores de alta resolución (>24 MP) la NPF puede dar tiempos hasta un 50% más cortos que la regla 500, evitando microestelas visibles al ampliar la imagen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las estrellas se convierten en estelas en las fotos nocturnas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Tierra rota sobre su eje, y esa rotación hace que las estrellas se desplacen respecto al encuadre a una velocidad de unos 15 arcos de grado por hora. En exposiciones largas, ese movimiento relativo traza una línea (estela) sobre el sensor. Cuanto mayor es la focal, más ampliada está la imagen y más rápido aparece la estela. Para capturar la Vía Láctea con estrellas puntuales es necesario no superar cierto tiempo de exposición según la focal y el sensor usados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ajustes de ISO, apertura y focal son recomendables para fotografiar la Vía Láctea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una combinación habitual para principiantes es: focal gran angular (14-24 mm), apertura máxima del objetivo (f/1,8-f/2,8), ISO entre 1600 y 6400 según el sensor, y tiempo de exposición calculado con la regla 500 o NPF (típicamente 15-25 segundos con un 24 mm en Full Frame). El objetivo es capturar la mayor cantidad de luz posible antes de que aparezcan estelas o el ruido digital se vuelva inaceptable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la declinación celeste y por qué la fórmula NPF la tiene en cuenta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La declinación celeste es la coordenada astronómica equivalente a la latitud terrestre: mide cuántos grados está un objeto por encima o por debajo del ecuador celeste. Las estrellas cercanas al ecuador celeste (declinación 0°) se mueven más rápido en el encuadre y producen estelas antes que las cercanas al polo (Polaris, declinación ~89°). La fórmula NPF aplica el coseno de la declinación para ajustar el tiempo máximo: cerca del polo se puede exponer más tiempo sin estelas.',
      },
    },
  ],
};
