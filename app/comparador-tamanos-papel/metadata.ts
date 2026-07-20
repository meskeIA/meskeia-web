import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// ─────────────────────────────────────────────────────────────────────────
// 🌎 App con público a ambos lados del Atlántico por definición: el conflicto
// A4 (norma ISO, España y casi todo el mundo) vs Carta/Letter (Norteamérica,
// México, buena parte de Centroamérica) es justo el problema que resuelve.
// Nombres SIEMPRE aditivos: "Carta (Letter)", "Oficio (Legal)", "Tabloide (Ledger)".
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Medidas de Papel: A4, Carta, Oficio y Cuartilla en cm y mm',
  description:
    'Cuánto mide un folio A4 (21 × 29,7 cm), una hoja tamaño Carta, un Oficio o una cuartilla. Compara los formatos superpuestos a escala real, convierte a mm, cm, pulgadas y píxeles según los DPI.',
  keywords:
    'medidas papel, cuanto mide un folio a4, tamaño a4 en cm, hoja tamaño carta medidas, cuanto es una cuartilla, diferencia carta y a4, tamaño oficio, formatos ISO 216, serie A B C, tamaño legal, medidas sobres',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/comparador-tamanos-papel/',
  },
  openGraph: {
    type: 'website',
    title: 'Medidas de Papel: A4, Carta, Oficio y Cuartilla en cm y mm',
    description:
      'Compara A4, Carta, Oficio, cuartilla y sobres superpuestos a escala real. Medidas exactas en mm, cm, pulgadas y píxeles.',
    url: 'https://meskeia.com/comparador-tamanos-papel/',
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
    title: 'Medidas de Papel: A4, Carta, Oficio y Cuartilla',
    description:
      'Ve los formatos de papel superpuestos a escala real y descubre por qué un Carta no encaja en un A4.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Comparador de Tamaños de Papel meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Comparador de Tamaños de Papel',
  category: 'UtilityApplication',
  description:
    'Herramienta visual para comparar formatos de papel superpuestos a escala real: series A, B y C de la norma ISO 216, formatos norteamericanos (Carta/Letter, Oficio/Legal, Tabloide/Ledger), formatos tradicionales españoles (folio, cuartilla, holandesa), tamaños de fotografía y tarjeta de visita. Incluye conversor de mm, cm, pulgadas y píxeles según los DPI, y un comprobador de escala para imprimir un documento en un formato distinto al original.',
  url: 'https://meskeia.com/comparador-tamanos-papel/',
  features: [
    'Comparador visual con los formatos superpuestos y dibujados a escala real',
    'Catálogo completo de series A, B y C (ISO 216) con medidas exactas',
    'Formatos norteamericanos: Carta (Letter), Oficio (Legal), Tabloide (Ledger)',
    'Formatos tradicionales en desuso: folio, cuartilla, holandesa y octavilla',
    'Conversor entre milímetros, centímetros, pulgadas y píxeles con DPI configurable',
    'Comprobador de impresión: porcentaje de escala y margen sobrante entre dos formatos',
    'Demostración visual de la proporción √2 y del doblado de la serie A',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto mide un folio A4 en centímetros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un A4 mide 210 × 297 milímetros, es decir 21 × 29,7 centímetros, o 8,27 × 11,69 pulgadas. Su superficie es de 623,7 cm² y su proporción es 1:√2 (aproximadamente 1:1,414). En el lenguaje corriente de España se le llama "folio", aunque el folio tradicional era un formato distinto de 215 × 315 mm hoy en desuso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el tamaño Carta y el A4?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Carta (Letter) mide 216 × 279 mm y el A4 mide 210 × 297 mm. El Carta es 6 mm más ancho pero 18 mm más corto, así que ninguno cabe dentro del otro: no son intercambiables. Por eso un documento maquetado en Carta impreso en A4 pierde 6 mm de ancho por los lados, y un A4 impreso en Carta se corta 18 mm por abajo salvo que se reduzca la escala al 97 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto mide una cuartilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuartilla mide aproximadamente 155 × 215 mm: es la mitad de un folio tradicional español (215 × 315 mm) doblado por su lado largo. No es un formato normalizado ISO, así que hay variaciones según el fabricante. El equivalente moderno más próximo es el A5 (148 × 210 mm), unos 7 mm más estrecho y 5 mm más corto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos píxeles tiene un A4?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de los DPI, porque el píxel no es una unidad física. Un A4 son 595 × 842 píxeles a 72 DPI (pantalla), 1.240 × 1.754 a 150 DPI, 2.480 × 3.508 a 300 DPI (calidad de imprenta) y 4.961 × 7.016 a 600 DPI. La fórmula es: píxeles = milímetros ÷ 25,4 × DPI.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un A0 tiene exactamente un metro cuadrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La norma ISO 216 define la serie A con dos condiciones: que la superficie del A0 sea 1 m² y que la proporción entre lado largo y corto sea √2. Resolviendo ambas se obtienen 841 × 1.189 mm. La proporción √2 hace que al doblar una hoja por la mitad se conserve la forma, de modo que dos A4 forman un A3 y el peso en gramos por m² permite calcular directamente lo que pesa cualquier hoja.',
      },
    },
  ],
};
