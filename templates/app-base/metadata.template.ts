import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// ─────────────────────────────────────────────────────────────────────────
// 🌎 LENGUAJE LATAM-FRIENDLY (OBLIGATORIO — nacer bien desde el origen)
// meskeIA sirve a todo el público hispanohablante (~50% del tráfico es Latam).
// Si tu app usa algún término que se dice distinto a cada lado del Atlántico,
// incluye AMBAS variantes de forma aditiva (nunca reemplaces la de España).
// Pares frecuentes en scripts/seo-latam/glosario-es-latam.json:
//   coche→carro/auto · móvil→celular · ordenador→computadora · portátil→laptop/notebook
//   piscina→alberca/pileta · alquiler→arriendo · tipo de interés→tasa de interés
//   tarta→torta/pastel · puerta lógica→compuerta lógica · nómina→planilla
// REGLA DE ORO — distingue dónde va cada término:
//   • Término-NÚCLEO (la keyword que la gente busca): ambas variantes en title/H1,
//     liderando por demanda. Ej. "Seguro de Coche, Carro o Auto".
//   • Descriptor-de-AUDIENCIA (bachillerato/EBAU/selectividad → preparatoria/
//     secundaria/educación media): NO lo metas en el H1; basta en keywords,
//     description y cuerpo. La keyword núcleo de un simulador STEM es universal.
// Apps fiscales-España estructurales (IRPF, RETA, nómina, ITP…): NO aplicar
// (público correcto = España; ver <RegionBadge variant="es-only" />).
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '[Nombre App] - [Descripción Corta] | meskeIA',
  description: '[Descripción detallada 150-160 caracteres]',
  keywords: 'keyword1, keyword2, keyword3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '[Título OG]',
    description: '[Descripción para redes sociales]',
    url: 'https://meskeia.com/[nombre-app]',
    siteName: 'meskeIA',
    locale: 'es_ES',
    // OBLIGATORIO. Next NO hereda la imagen del layout raíz: el merge de metadata
    // es *shallow*, así que declarar `openGraph` aquí reemplaza entero el del padre
    // y la `ogImage` de `generateBaseMetadata()` no llega. Sin ella, X, WhatsApp o
    // LinkedIn degradan la tarjeta a la pequeña con icono de documento pese al
    // `summary_large_image` de abajo. Si la app entra en un portal vertical, usa la
    // og de ese portal (p. ej. `/coquinum/og-image.png`) — lo vigila `check:og-image`.
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
    title: '[Título para Twitter]',
    description: '[Descripción para Twitter]',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Nombre App meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: '[Nombre App]',
  description: '[Descripción detallada de la app, qué hace y para quién es útil]',
  url: 'https://meskeia.com/[nombre-app]/',
  features: [
    '[Característica principal 1]',
    '[Característica principal 2]',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

// ─────────────────────────────────────────────────────────────────────────
// ❓ FAQ — FUENTE ÚNICA de las dos bocas: la FAQ VISIBLE de page.tsx (que importa este
// array y lo pinta) y el FAQPage JSON-LD de abajo (Bing Copilot, ChatGPT, Perplexity, Gemini).
// NO escribas la FAQ visible a mano en page.tsx: medido el 07/10/2026, en 59 apps la misma
// pregunta tenía dos respuestas distintas, y el texto del JSON-LD no lo revisa nadie porque
// no se ve. En el garaje, la que faltaba en el JSON-LD era la que avisaba de que el
// simulador se abstiene en Canarias, Ceuta y Melilla.
// Texto plano, sin JSX: el JSON-LD no admite marcado. Interpolar cifras SÍ
// (`${formatNumber(…)}` sobre datos de data/fiscal) — así las dos bocas cambian a la vez.
// ─────────────────────────────────────────────────────────────────────────
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿[Pregunta real que haría un usuario sobre esta app]?',
    answer: '[Respuesta 2-4 frases con datos concretos]',
  },
  { question: '¿[Cómo funciona / qué calcula / para quién es útil]?', answer: '[Respuesta]' },
  { question: '¿[Diferencia con alternativas / dato clave]?', answer: '[Respuesta]' },
  { question: '¿[Pregunta sobre nivel educativo / audiencia objetivo]?', answer: '[Respuesta]' },
  { question: '¿[Pregunta técnica o conceptual específica del tema]?', answer: '[Respuesta]' },
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
