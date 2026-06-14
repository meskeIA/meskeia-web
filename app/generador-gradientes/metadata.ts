import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Generador de Gradientes CSS - Lineales, Radiales, Cónicos | meskeIA',
  description: 'Crea gradientes CSS profesionales: lineales, radiales y cónicos. Editor visual con múltiples colores, ángulos personalizables y código listo para copiar.',
  keywords: 'generador gradientes, CSS gradient, linear-gradient, radial-gradient, conic-gradient, degradados CSS, diseño web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Gradientes CSS - meskeIA',
    description: 'Crea gradientes CSS profesionales con editor visual',
    url: 'https://meskeia.com/generador-gradientes/',
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
  name: "Generador de Gradientes CSS - Lineales, Radiales, Cónicos",
  description: "Crea gradientes CSS profesionales: lineales, radiales y cónicos. Editor visual con múltiples colores, ángulos personalizables y código listo para copiar.",
  url: 'https://meskeia.com/generador-gradientes/',
  category: 'UtilityApplication',
  features: [
      "Editor visual de gradientes lineales, radiales y cónicos",
      "Hasta 10 color stops con selector visual y valor hexadecimal",
      "10 presets de gradientes profesionales incluidos",
      "Ángulo personalizable 0°–360° con presets rápidos",
      "Código CSS generado en tiempo real, listo para copiar",
      "Compatible con todos los navegadores modernos sin prefijos vendor",
      "Gratuito, sin registro ni instalación",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un gradiente CSS y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un gradiente CSS es una transición suave entre dos o más colores generada directamente por el navegador sin usar imágenes. Se usa en fondos, botones, cabeceras y cualquier elemento visual para dar profundidad y dinamismo al diseño. Al ser código puro, no añade peso a la página y escala perfectamente a cualquier resolución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre linear-gradient, radial-gradient y conic-gradient?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'linear-gradient crea una transición en línea recta con un ángulo configurable (0°–360°). radial-gradient irradia desde un punto central hacia el exterior en forma circular o elíptica. conic-gradient distribuye los colores alrededor de un punto central en forma de abanico o rueda de color, ideal para gráficos circulares decorativos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo copio el código CSS del gradiente generado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El editor muestra el código CSS listo para usar en tiempo real mientras ajustas colores y parámetros. Puedes copiarlo con el botón "Copiar CSS" y pegarlo directamente en tu hoja de estilos. El código es compatible con todos los navegadores modernos sin necesidad de prefijos vendor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar gradientes CSS en Figma, Webflow o WordPress?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El código CSS generado es estándar y funciona en cualquier herramienta o plataforma que admita CSS: Figma (vía plugin de código), Webflow (campo de CSS personalizado), WordPress (editor de bloque o CSS adicional del tema), Squarespace, Wix y cualquier proyecto web con acceso al CSS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos colores puedo añadir a un gradiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La especificación CSS no impone un límite práctico; los navegadores modernos admiten decenas de paradas de color en un mismo gradiente. Para un resultado visualmente limpio se recomienda usar entre 2 y 5 colores. Cada parada puede tener su posición personalizada en porcentaje para controlar la distribución exacta de la transición.',
      },
    },
  ],
};
