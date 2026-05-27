import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Sombras CSS - Box Shadow y Text Shadow | meskeIA',
  description: 'Crea sombras CSS profesionales para cajas y textos. Editor visual con múltiples capas, presets listos y código CSS listo para copiar.',
  keywords: 'generador sombras, CSS box-shadow, text-shadow, sombras CSS, drop shadow, diseño web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Sombras CSS - meskeIA',
    description: 'Crea sombras CSS profesionales con editor visual',
    url: 'https://meskeia.com/generador-sombras/',
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
  name: 'Generador de Sombras CSS - Box Shadow y Text Shadow',
  description: 'Crea sombras CSS profesionales para cajas y textos. Editor visual con múltiples capas, presets listos y código CSS listo para copiar.',
  url: 'https://meskeia.com/generador-sombras/',
  category: 'UtilityApplication',
  features: [
    'Editor visual de box-shadow con múltiples capas',
    'Editor de text-shadow con previsualización en tiempo real',
    'Presets de sombras profesionales listos para usar',
    'Código CSS generado listo para copiar',
    'Gratuito, en español, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es box-shadow en CSS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'box-shadow es una propiedad CSS que añade sombras a un elemento HTML. Su sintaxis es: box-shadow: offset-x offset-y blur-radius spread-radius color. Por ejemplo, box-shadow: 4px 4px 8px 0px rgba(0,0,0,0.3) crea una sombra desplazada 4px hacia la derecha y abajo, con 8px de difuminado y color negro al 30% de opacidad. Se pueden apilar múltiples sombras separadas por comas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre box-shadow y text-shadow?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'box-shadow aplica sombras al contorno del elemento HTML completo (div, botón, tarjeta), siguiendo su forma rectangular o su border-radius. text-shadow aplica sombras directamente a los caracteres del texto. Comparten la misma lógica de desplazamiento horizontal, vertical y difuminado, pero text-shadow no tiene parámetro spread-radius. Ambas admiten múltiples sombras apiladas separadas por comas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo hacer una sombra suave y realista en CSS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para una sombra suave y realista: usa valores pequeños de offset (2-6px), un blur-radius grande (8-24px), spread-radius negativo o 0, y un color con baja opacidad (rgba(0,0,0,0.1) a rgba(0,0,0,0.2)). Ejemplo: box-shadow: 0 4px 16px rgba(0,0,0,0.12). Para mayor realismo puedes apilar 2 sombras: una de contacto (offset pequeño, poco blur) y una de ambiente (offset mayor, mucho blur).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa inset en box-shadow CSS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La palabra clave inset convierte la sombra exterior en una sombra interior. Sin inset, la sombra aparece fuera del elemento. Con inset, la sombra se proyecta hacia el interior del elemento, creando un efecto de hundimiento o relieve negativo. Es útil para simular campos de formulario, botones presionados o efectos de grabado. Ejemplo: box-shadow: inset 0 2px 4px rgba(0,0,0,0.2).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo copiar el código CSS de una sombra generada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El generador de sombras CSS de meskeIA muestra en tiempo real el código CSS resultante mientras ajustas los parámetros visualmente. Una vez satisfecho con el resultado, haz clic en el botón de copiar junto al bloque de código. El valor se copia al portapapeles y puedes pegarlo directamente en tu archivo CSS o en los estilos inline de tu proyecto.',
      },
    },
  ],
};
