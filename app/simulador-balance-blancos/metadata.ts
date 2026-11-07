import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Balance de Blancos: 2500K-10000K | meskeIA',
  description: 'Aprende balance de blancos moviendo la temperatura de color (2500K a 10000K) sobre 3 escenas con luz distinta. Indicador visual de WB correcto y guía completa con presets de cámara.',
  keywords: 'simulador balance de blancos, temperatura color Kelvin, WB cámara, tungsteno fluorescente sol nublado, corrección de color fotografía, dominante de color, RAW JPEG balance, color naranja azul foto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Balance de Blancos',
    description: 'Mueve el slider de temperatura sobre 3 escenas con luz distinta y aprende cuándo aciertas el balance correcto.',
    url: 'https://meskeia.com/simulador-balance-blancos/',
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
    title: 'Simulador de Balance de Blancos',
    description: 'Aprende balance de blancos con un slider Kelvin sobre 3 escenas distintas.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Simulador de Balance de Blancos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Balance de Blancos',
  description: 'Herramienta interactiva para aprender el balance de blancos de la cámara. Slider de temperatura de color (2500K a 10000K) aplicado sobre 3 escenas con luz dominante distinta (tungsteno interior, día nublado, atardecer). Indica visualmente cuándo aciertas el balance correcto.',
  url: 'https://meskeia.com/simulador-balance-blancos/',
  category: 'EducationalApplication',
  features: [
    'Slider de temperatura de color de 2500K a 10000K en escala Kelvin',
    '3 escenas con luz dominante distinta: interior tungsteno, día nublado, atardecer',
    'Visualización inmediata del tinte aplicado sobre la escena (cálido o frío)',
    'Indicador visual de WB correcto para cada escena',
    'Mensajes contextuales: demasiado cálido, demasiado frío, balance correcto',
    'Guía completa con presets de cámara (Tungsteno, Fluorescente, Sol, Nublado, Sombra)',
  ],
});

/** Una pregunta de la FAQ; el consejo solo se pinta en la página, no va al FAQPage. */
export interface PreguntaFrecuente extends FAQItem {
  consejo?: string;
  enlace?: { href: string; texto: string };
}

// FUENTE ÚNICA de la FAQ visible (page.tsx) y del FAQPage JSON-LD de abajo: hasta el 07/11/2026
// eran dos textos y dos preguntas se repetían con otra respuesta (hallazgo 4167). Cifras en el
// formato de es-ES: cuatro cifras sin agrupar y el K separado («3200 K», «10.000 K»).
export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    question: '¿Qué es el balance de blancos en fotografía y para qué sirve?',
    answer:
      'El balance de blancos (WB, White Balance) es el ajuste de la cámara que compensa la dominante de color de la fuente de luz para que los blancos aparezcan neutros en la imagen. Cada fuente de luz tiene una temperatura de color diferente medida en kelvin: una vela emite unos 1900 K (luz muy cálida y anaranjada), mientras que un cielo despejado puede llegar a 10.000 K (luz muy fría y azulada). Sin el ajuste correcto, las fotos de interior con bombillas incandescentes quedan con dominante naranja y las tomadas en sombra, con dominante azul.',
  },
  {
    question: '¿Cuál es la temperatura de color de la luz solar directa?',
    answer:
      'La luz solar directa a mediodía ronda los 5500-5600 K, la referencia de «luz neutra» en fotografía. Por eso el preset Luz día de las cámaras suele fijarse entre 5200 y 5600 K. Al amanecer o al atardecer la temperatura baja a 2500-3500 K (tonos muy cálidos y dorados), y en un día nublado sube a 6000-7000 K (tonos más fríos y azulados).',
  },
  {
    question: '¿Por qué mis fotos de interior con bombillas salen naranjas?',
    answer:
      'Porque la cámara probablemente está en automático (AWB) o en Luz día (5500 K) y las bombillas incandescentes (tungsteno) emiten unos 2700-3200 K. De 3200 a 5500 K van unos 130 mired, un dominante naranja muy fuerte. Pasa el WB al preset Tungsteno (3200 K) o fíjalo a mano entre 2700 y 3200 K, y la foto recupera el color natural.',
    consejo: 'O dispara en RAW y arréglalo después con un solo deslizador en tu editor.',
  },
  {
    question: '¿Es mejor corregir el balance de blancos en cámara o en postproceso con RAW?',
    answer:
      'Si disparas en RAW, el balance de blancos no queda fijado en el archivo y puede corregirse sin pérdida de calidad en cualquier editor RAW. Si disparas en JPEG, conviene acertarlo en cámara, porque corregirlo después degrada la imagen. En eventos o situaciones sin tiempo de edición, acertar el WB en cámara siempre facilita el trabajo.',
  },
  {
    question: '¿Cuándo es útil un WB «incorrecto» a propósito?',
    answer:
      'Para preservar la atmósfera: un atardecer ajustado al WB «correcto» pierde su naranja, y una escena nocturna ajustada pierde el frío. Subir el WB por encima de la luz real calienta la foto y potencia la luz dorada en retratos o atardeceres; bajarlo por debajo la enfría y crea atmósferas nocturnas o melancólicas. A veces el ambiente es el objetivo y el WB se elige con criterio creativo.',
  },
  {
    question: '¿El balance automático (AWB) es fiable?',
    answer:
      'Para luz mixta o cambiante, sí, sobre todo en cámaras modernas. Para escenas con un color dominante (atardecer, luz cálida intencional, fuego), no: la cámara intenta neutralizarlo y apaga el ambiente. En esos casos, un preset o el ajuste manual.',
  },
  {
    question: '¿Qué es una tarjeta gris y para qué sirve?',
    answer:
      'Una cartulina gris al 18 % colocada en la escena. Disparas una foto con ella y en edición usas el cuentagotas para indicar al programa que eso es gris; el programa ajusta el WB para toda la sesión. Es muy útil en bodas, foto de producto y catálogo.',
  },
  {
    question: '¿La hora dorada se beneficia del balance neutro?',
    answer:
      'Casi nunca. La hora dorada (unos 3500 K, naranja-rosa) se aprecia por su tinte: si la «corriges» con un WB de 3500 K, queda neutra y pierde el encanto. Para conservar el cálido, deja el WB por encima de la luz: entre 3800 y 4500 K se mantiene suave, y con Luz día (5500 K) muy intenso. Si el naranja se va de las manos, baja el WB hacia los 3500 K de la luz, no lo subas.',
    consejo: 'Combínalo con el calculador de hora dorada para saber cuándo disparar.',
    enlace: { href: '/golden-hour/', texto: 'calculador de hora dorada' },
  },
  {
    question: '¿Cómo afecta el balance al retrato?',
    answer:
      'Mucho, por los tonos de piel. Un WB demasiado cálido deja la piel amarillenta o enrojecida; uno demasiado frío, pálida, casi cadavérica. Por eso muchos retratistas calibran el WB con una tarjeta antes de empezar la sesión.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
