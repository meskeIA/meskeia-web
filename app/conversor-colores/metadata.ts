import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Convertidor de Colores - HEX, RGB, HSL, CMYK | meskeIA',
  description: 'Convierte colores entre HEX, RGB, HSL y CMYK al instante. Color picker visual, paletas automáticas y análisis de color para diseñadores web.',
  keywords: 'convertidor colores, HEX RGB, RGB HSL, color picker, CMYK, conversión colores, diseño web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Convertidor de Colores - meskeIA',
    description: 'Convierte colores entre HEX, RGB, HSL y CMYK al instante',
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
  description: "Convierte colores entre HEX, RGB, HSL y CMYK al instante. Color picker visual, paletas automáticas y análisis de color para diseñadores web.",
  url: 'https://meskeia.com/conversor-colores/',
  category: 'UtilityApplication',
  features: [
    'Conversión instantánea entre HEX, RGB, HSL y CMYK con actualización en tiempo real',
    'Color picker visual integrado para seleccionar cualquier color con el ratón o en pantalla táctil',
    'Sliders interactivos para ajustar canales RGB, tono/saturación/luminosidad HSL y CMYK',
    'Generación de paleta armónica: complementarios, análogos y triádicos desde el color base',
    'Exportación de código HTML/CSS listo para copiar y pegar en proyectos web',
    'Vista previa en tiempo real del color resultante con nombre aproximado',
    'Soporte de entrada directa en HEX con validación automática del formato',
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
      name: '¿Es posible encontrar colores similares o generar paletas a partir de un color base?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A partir de un color base es posible generar paletas armónicas usando relaciones como complementarios (tono opuesto en el círculo cromático), análogos (tonos adyacentes) o triádicos. Esta herramienta muestra sugerencias de paleta automáticas junto a la conversión, útiles para construir identidades visuales coherentes.',
      },
    },
  ],
};
