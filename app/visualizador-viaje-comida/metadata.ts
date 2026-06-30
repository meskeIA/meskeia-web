import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de tu Comida — Sistema Digestivo Explicado | meskeIA',
  description: 'De la boca al intestino grueso: 6 etapas del sistema digestivo con tiempos reales, enzimas, y datos sorprendentes. Biología para secundaria, preparatoria y Bachillerato.',
  keywords: 'sistema digestivo, digestión, aparato digestivo, viaje de la comida, boca, estómago, intestino delgado, intestino grueso, amilasa, pepsina, peristaltismo, absorción nutrientes, biología, secundaria, preparatoria, bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de tu Comida — Sistema Digestivo Explicado',
    description: 'Sigue el recorrido de un bocado desde la boca hasta la eliminación. 6 etapas, enzimas, tiempos y datos sorprendentes.',
    url: 'https://meskeia.com/visualizador-viaje-comida/',
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
    title: 'El Viaje de tu Comida — Sistema Digestivo',
    description: 'El recorrido completo de un bocado por tu cuerpo. 6 etapas con enzimas, tiempos y datos sorprendentes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Viaje Comida meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de tu Comida — Sistema Digestivo',
  description: 'Explicador visual del sistema digestivo humano. Desde que metes comida en la boca hasta la eliminación: masticación, peristaltismo, ácido clorhídrico, pepsina, vellosidades intestinales, microbiota. Ideal para Biología de secundaria, preparatoria y Bachillerato.',
  url: 'https://meskeia.com/visualizador-viaje-comida/',
  features: [
    'Timeline visual de 6 etapas del sistema digestivo',
    'Tiempos reales de cada fase (minutos a horas)',
    'Explicación de enzimas digestivas y su función',
    'Datos sorprendentes sobre el sistema digestivo',
    'Navegación paso a paso interactiva',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en hacerse la digestión completa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La digestión completa, desde que ingerimos un alimento hasta que se eliminan los residuos, dura entre 24 y 72 horas en adultos sanos. La mayor parte del tiempo transcurre en el intestino grueso (12-48 h), mientras que el estómago retiene los alimentos entre 2 y 4 horas, y el intestino delgado absorbe los nutrientes en unas 4-6 horas adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué enzimas participan en la digestión y dónde actúan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La amilasa salival comienza a descomponer el almidón en la boca. En el estómago, la pepsina degrada las proteínas con la ayuda del ácido clorhídrico. En el intestino delgado actúan las enzimas pancreáticas (lipasa, proteasa, amilasa pancreática) y las enzimas del borde en cepillo intestinal, que completan la digestión de grasas, proteínas e hidratos de carbono antes de la absorción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el peristaltismo y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El peristaltismo son contracciones musculares rítmicas y coordinadas que impulsan el bolo alimenticio a lo largo del tubo digestivo. Estas ondas de contracción-relajación permiten que la comida avance desde el esófago hasta el intestino sin necesidad de la gravedad, por eso podemos comer incluso boca abajo. El sistema nervioso entérico del intestino coordina estas contracciones de forma autónoma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se absorben los nutrientes en el intestino delgado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pared del intestino delgado está cubierta de millones de vellosidades intestinales y microvellosidades que aumentan la superficie de absorción hasta unos 200 m². Los nutrientes digeridos (glucosa, aminoácidos, ácidos grasos) pasan a través del epitelio intestinal hacia los capilares sanguíneos y los vasos linfáticos (para las grasas), transportándose así a todo el organismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel tiene la microbiota intestinal en la digestión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La microbiota intestinal, formada por unos 100 billones de microorganismos, fermenta fibras que el intestino delgado no puede digerir, produciendo ácidos grasos de cadena corta beneficiosos para el colon. También sintetiza vitaminas (K, B12), refuerza la barrera intestinal y entrena al sistema inmunitario. Se estima que el 70 % de las células inmunes del cuerpo residen en el intestino.',
      },
    },
  ],
};
