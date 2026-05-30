import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Fotografía: Triángulo de Exposición (ISO, Apertura, Velocidad) | meskeIA',
  description: 'Simula cómo afectan ISO, apertura y velocidad de obturación a tus fotos. Modo libre y modo compensado. Ve el bokeh, el ruido y el motion blur en tiempo real.',
  keywords: 'simulador fotografía, triángulo exposición, ISO apertura velocidad, profundidad de campo, motion blur, bokeh, fotografía aficionados, aprender fotografía, simulador cámara DSLR',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador del Triángulo de Exposición Fotográfico',
    description: 'Aprende fotografía moviendo ISO, apertura y velocidad. Ve el resultado en una escena sintética interactiva con bokeh, ruido y motion blur.',
    url: 'https://meskeia.com/simulador-fotografia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Triángulo de Exposición Fotográfico',
    description: 'Aprende fotografía moviendo ISO, apertura y velocidad. Resultado visual en tiempo real.',
  },
  other: {
    'application-name': 'Simulador de Fotografía meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Fotografía: Triángulo de Exposición',
  description: 'Simulador interactivo del triángulo de exposición fotográfico. Permite ajustar ISO, apertura y velocidad de obturación y ver el resultado en una escena sintética con efectos reales: bokeh por apertura, ruido por ISO y motion blur por velocidad. Incluye modo libre y modo compensado para entender la relación entre los tres parámetros.',
  url: 'https://meskeia.com/simulador-fotografia/',
  category: 'EducationalApplication',
  features: [
    'Ajuste de los 3 parámetros del triángulo de exposición: ISO, apertura (f-stop) y velocidad de obturación',
    '3 escenas sintéticas: retrato (bokeh), paisaje (nitidez) y deportes (motion blur)',
    'Modo libre: mueve cada parámetro independientemente y observa la exposición resultante',
    'Modo compensado: fija un parámetro y los otros se reajustan automáticamente',
    'Indicador visual de exposición en stops (-3 a +3)',
    'Renderizado sintético en SVG: bokeh real, ruido y motion blur direccional',
    'Bloque educativo con guía paso a paso, casos de uso y errores frecuentes',
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
      name: '¿Qué es el triángulo de exposición en fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El triángulo de exposición es el modelo que relaciona los tres parámetros que determinan la exposición de una fotografía: ISO (sensibilidad del sensor), apertura de diafragma (f-stop, que controla la cantidad de luz que entra) y velocidad de obturación (tiempo que el sensor queda expuesto a la luz). Modificar cualquiera de los tres afecta a los otros dos si se quiere mantener la misma exposición, y cada uno produce efectos visuales distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el ISO a la calidad de una fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un ISO bajo (100-400) produce imágenes limpias con poco ruido digital, ideal para condiciones de buena luz. Un ISO alto (3200 o más) amplifica la señal del sensor para fotografiar con poca luz, pero introduce ruido (grano digital visible). En la práctica, conviene usar el ISO más bajo posible para la escena y compensar con apertura o velocidad de obturación cuando sea factible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el bokeh y cómo se controla con la apertura del diafragma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bokeh es el desenfoque estético del fondo de una imagen. Se produce porque una apertura grande (número f bajo, como f/1.8) crea una profundidad de campo muy reducida: el sujeto queda enfocado y el fondo aparece difuminado suavemente. Una apertura pequeña (f/11 o f/16) aumenta la profundidad de campo y mantiene nítido todo el plano, lo que se prefiere en fotografía de paisaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el modo compensado en el simulador de fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modo compensado permite fijar un parámetro (ISO, apertura o velocidad) mientras los otros dos se reajustan automáticamente para mantener una exposición correcta. Es la forma más didáctica de entender el triángulo de exposición: por ejemplo, si subes la velocidad de obturación para congelar movimiento, el simulador muestra cómo debe bajar el número f o subir el ISO para compensar la luz perdida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el modo automático de una cámara y el modo manual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En modo automático la cámara decide los tres parámetros del triángulo de exposición según el fotómetro interno, priorizando una exposición técnicamente correcta pero sin criterio creativo. En modo manual el fotógrafo controla ISO, apertura y velocidad de forma independiente, lo que permite decisiones creativas como congelar o mostrar movimiento, crear bokeh o controlar el grano. Los modos semimanuales (Av, Tv, P) son puntos intermedios.',
      },
    },
  ],
};
