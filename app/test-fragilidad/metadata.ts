import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Fragilidad (Escala FRAIL) - Evaluación para mayores | meskeIA',
  description: 'Test validado de 5 preguntas basado en la escala FRAIL para detectar fragilidad en personas mayores. Orientación preventiva sobre riesgo de caídas, dependencia y pérdida de autonomía.',
  keywords: 'test fragilidad mayores, escala FRAIL, fragilidad anciano, sarcopenia test, prevencion dependencia mayores, test pre-fragilidad, criterios Fried fragilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Fragilidad (Escala FRAIL) | meskeIA',
    description: 'Test validado de 5 ítems para evaluar el riesgo de fragilidad en personas mayores.',
    url: 'https://meskeia.com/test-fragilidad/',
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
    title: 'Test de Fragilidad (Escala FRAIL) | meskeIA',
    description: 'Detección precoz de fragilidad en mayores con la escala FRAIL validada',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test Fragilidad FRAIL meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Fragilidad (Escala FRAIL)",
  description: "Test validado de 5 preguntas basado en la escala FRAIL para detectar fragilidad en personas mayores. Orientación preventiva sobre riesgo de caídas, dependencia y pérdida de autonomía.",
  url: "https://meskeia.com/test-fragilidad/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la fragilidad en personas mayores y cómo se diferencia del envejecimiento normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fragilidad es un síndrome geriátrico caracterizado por una disminución de la reserva fisiológica que aumenta la vulnerabilidad ante eventos adversos (enfermedades, caídas, hospitalización). A diferencia del envejecimiento normal, la fragilidad implica pérdida de masa muscular (sarcopenia), cansancio crónico, lentitud al caminar, bajo nivel de actividad física y pérdida de peso involuntaria. Identificarla precozmente permite intervenir antes de que aparezca la dependencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la escala FRAIL y cómo evalúa la fragilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala FRAIL es un instrumento de cribado breve con 5 ítems: Fatiga (cansancio habitual), Resistencia (dificultad para subir un piso de escaleras), Ambulación (dificultad para caminar una manzana), Illnesses (presencia de 5 o más enfermedades crónicas) y Loss of weight (pérdida de más del 5% del peso en el último año). Cada ítem puntúa 1 punto: 0 = robusto, 1-2 = pre-frágil, 3-5 = frágil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está indicado realizar el test de fragilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está especialmente indicado para personas mayores de 65 años, aunque puede ser útil a partir de los 60 si existe algún factor de riesgo como enfermedad crónica, hospitalización reciente, caídas repetidas o pérdida de peso no explicada. Es una herramienta orientativa para cuidadores, familiares y para la persona misma, que puede ayudar a decidir si conviene una valoración geriátrica más completa por parte de un profesional sanitario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre fragilidad, sarcopenia y dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sarcopenia es la pérdida de masa y fuerza muscular relacionada con la edad y es uno de los componentes de la fragilidad, pero no la define por completo. La fragilidad es un concepto más amplio que incluye también factores como el agotamiento, la lentitud y la inactividad. La dependencia es la consecuencia final cuando la fragilidad no se trata: la persona necesita ayuda de terceros para actividades básicas de la vida diaria. Sarcopenia → fragilidad → dependencia es una secuencia frecuente pero reversible si se interviene a tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede revertir la fragilidad o solo se puede frenar su avance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fragilidad, especialmente en fase pre-frágil, es parcialmente reversible. Las intervenciones con mayor evidencia son el ejercicio de resistencia y equilibrio (el más efectivo), la suplementación proteica y de vitamina D cuando hay déficit, y el tratamiento de las enfermedades crónicas subyacentes. En personas ya frágiles, el objetivo suele ser frenar el avance y preservar la autonomía. La intervención temprana en la fase pre-frágil ofrece los mejores resultados.',
      },
    },
  ],
};
