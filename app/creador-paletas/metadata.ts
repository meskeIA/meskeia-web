import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Creador de Paletas de Colores - Armonías y Esquemas | meskeIA',
  description: 'Genera paletas de colores armónicas: complementarios, análogos, triádicos, monocromáticos. Explora esquemas de color y exporta CSS/SCSS variables.',
  keywords: 'creador paletas, paleta colores, color scheme, complementary, analogous, triadic, color harmony',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/creador-paletas/',
  },
  openGraph: {
    type: 'website',
    title: 'Creador de Paletas de Colores - meskeIA',
    description: 'Genera paletas de colores armónicas automáticamente',
    url: 'https://meskeia.com/creador-paletas/',
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
  name: 'Creador de Paletas de Colores',
  description: 'Generador de paletas de colores armónicas: complementarios, análogos, triádicos, tetrádicos y monocromáticos. Exporta los colores como variables CSS, SCSS o JSON.',
  url: 'https://meskeia.com/creador-paletas/',
  category: 'UtilityApplication',
  features: [
    'Generación automática de paletas armónicas',
    '5 esquemas: complementario, análogo, triádico, tetrádico, monocromático',
    'Selector de color base (HEX, RGB, HSL)',
    'Exportar como CSS, SCSS o JSON',
    'Visualización de cada color con código hex',
    'En español',
  ],
  keywords: ['paleta colores', 'color harmony', 'diseño', 'CSS', 'esquema cromático'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la teoría del color y cómo se aplica al diseño web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La teoría del color estudia cómo se relacionan los colores entre sí y cómo afectan emocionalmente al espectador. En diseño web se aplica eligiendo combinaciones armónicas: colores complementarios (opuestos en la rueda) crean contraste y energía; análogos (contiguos) dan armonía y serenidad; triádicos (equidistantes) aportan vivacidad; monocromáticos (misma tonalidad) transmiten elegancia. Cada combinación genera una percepción diferente de la marca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los formatos de color en CSS: HEX, RGB y HSL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HEX (#RRGGBB) es el más usado en diseño web; cada par hexadecimal representa rojo, verde y azul del 00 al FF. RGB (red, green, blue) usa valores de 0-255 y permite añadir opacidad con RGBA: rgba(255,0,0,0.5). HSL (hue, saturation, lightness) es el más intuitivo para diseñadores: hue es el ángulo en la rueda de color (0-360°), saturation la intensidad (0-100%) y lightness el brillo (0-100%). HSL facilita crear variantes de un mismo color cambiando solo lightness.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el contraste de color en accesibilidad web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El contraste de color mide la diferencia de luminosidad entre texto y fondo, expresado como ratio. Las WCAG (directrices de accesibilidad web) exigen: nivel AA mínimo 4.5:1 para texto normal, 3:1 para texto grande (≥18pt o ≥14pt bold); nivel AAA: 7:1 y 4.5:1 respectivamente. Un texto negro (#000) sobre blanco (#FFF) tiene ratio 21:1, el máximo posible. Texto gris claro sobre blanco suele fallar la verificación de accesibilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo crear una paleta de colores para una marca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso estándar: 1) Elige el color primario que represente los valores de la marca. 2) Genera variantes de ese color (más claro/oscuro para fondos y estados hover). 3) Añade un color secundario complementario o análogo. 4) Define un color de acento para CTAs y elementos destacados. 5) Completa con neutros (grises) para textos y fondos. Verifica siempre que las combinaciones superen el ratio de contraste WCAG 4.5:1.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las variables CSS de color y cómo exportarlas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las variables CSS (custom properties) permiten definir colores una vez y reutilizarlos en todo el CSS. Se declaran en :root { --color-primary: #2E86AB; } y se usan con var(--color-primary). Las variables SCSS ($color-primary: #2E86AB) funcionan igual pero requieren compilación. El creador de paletas de meskeIA genera automáticamente el código de variables CSS y SCSS listo para copiar e integrar en tu proyecto.',
      },
    },
  ],
};
