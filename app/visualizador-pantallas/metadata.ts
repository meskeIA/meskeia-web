import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona una Pantalla - Tecnología de Displays | meskeIA',
  description: 'Descubre cómo funcionan las pantallas: de CRT a OLED y MicroLED, subpíxeles RGB, resoluciones 4K/8K, luz azul y salud visual. Explicador visual interactivo.',
  keywords: 'pantallas, display, OLED, LCD, CRT, MicroLED, píxel, subpíxel, RGB, resolución 4K, 8K, luz azul, salud visual, PPI, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona una Pantalla - Tecnología de Displays',
    description: 'De CRT a MicroLED: subpíxeles RGB, resoluciones, luz azul y salud visual explicados de forma visual e interactiva.',
    url: 'https://meskeia.com/visualizador-pantallas/',
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
    title: 'Cómo Funciona una Pantalla - Tecnología de Displays',
    description: 'Píxeles, resoluciones, OLED vs LCD, luz azul: todo lo que hay detrás de tu pantalla, explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Pantallas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona una Pantalla',
  description: 'Explicador visual interactivo sobre tecnología de pantallas: evolución de CRT a MicroLED, anatomía de un píxel RGB, resoluciones HD a 8K, PPI por dispositivo, luz azul y consejos de salud visual basados en evidencia.',
  url: 'https://meskeia.com/visualizador-pantallas/',
  category: 'EducationalApplication',
  features: [
    'Evolución de tecnologías de display: CRT, LCD, Plasma, OLED, MicroLED',
    'Mezcla interactiva de subpíxeles RGB con combinaciones de color',
    'Comparativa de resoluciones: HD, Full HD, 2K, 4K, 8K con número de píxeles',
    'PPI por dispositivo y resolución angular a distancia',
    'Datos sobre luz azul, regla 20-20-20 y salud visual',
    'Tabla de PPI por dispositivo y resolución angular a la distancia habitual de uso',
    'Datos clínicos sobre luz azul, ritmo circadiano y la regla 20-20-20',
    'Comparativa de tecnologías: tiempo de respuesta, contraste, consumo y durabilidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una pantalla OLED y una LCD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una pantalla LCD, una retroiluminación LED ilumina cristales líquidos que filtran el color, por lo que los negros nunca son completamente oscuros. En una pantalla OLED cada píxel emite su propia luz y puede apagarse por completo, logrando negros absolutos, mayor contraste y ángulos de visión más amplios. Como contrapartida, el OLED es más susceptible al "burn-in" si se muestra una imagen estática durante mucho tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el PPI y por qué importa al elegir una pantalla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PPI (píxeles por pulgada) mide la densidad de píxeles de una pantalla: a mayor PPI, menor es cada píxel y más nítida se percibe la imagen. Un monitor de escritorio suele rondar los 100-110 PPI, mientras que un smartphone de gama alta supera los 400 PPI. Por debajo de unos 90 PPI a distancia normal de uso los píxeles individuales pueden distinguirse a simple vista.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La luz azul de las pantallas realmente daña los ojos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La luz azul (longitud de onda 415-455 nm) emitida por las pantallas puede interferir con la producción de melatonina y dificultar el sueño cuando se usa por la noche. La fatiga visual está más relacionada con el parpadeo reducido y la distancia inadecuada que con la luz azul en sí. La regla 20-20-20 (cada 20 minutos, mirar a 6 metros durante 20 segundos) es la medida preventiva más recomendada por oftalmólogos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la tecnología MicroLED y en qué se diferencia del OLED?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MicroLED utiliza diminutos LEDs inorgánicos como píxeles emisores de luz, igual que el OLED, pero sin los materiales orgánicos que causan el burn-in. Ofrece mayor brillo máximo, mayor vida útil y no tiene riesgo de degradación de colores. Sin embargo, su fabricación es muy compleja y costosa, por lo que en 2025 aún está limitada a pantallas de gran tamaño y precio elevado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos píxeles tiene realmente una pantalla 4K?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una resolución 4K (UHD) tiene 3.840 × 2.160 píxeles, lo que suma aproximadamente 8,3 millones de píxeles en total, cuatro veces más que Full HD (1.920 × 1.080). Cada uno de esos píxeles se compone a su vez de tres subpíxeles (rojo, verde y azul) cuya mezcla aditiva genera cualquier color visible. La resolución 8K dobla nuevamente ese número hasta los 33 millones de píxeles.',
      },
    },
  ],
};
