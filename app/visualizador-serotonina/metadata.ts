import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Serotonina: Cómo Funciona | meskeIA',
  description: 'El 90% de la serotonina está en el intestino. Visualiza síntesis, funciones, mecanismo SSRI, eje intestino-cerebro y por qué no es simplemente la hormona de la felicidad.',
  keywords: ['serotonina como funciona', 'serotonina intestino cerebro', 'SSRI mecanismo', 'serotonina estado de animo', 'triptofano serotonina', 'serotonina y sueño', 'serotonina dopamina diferencia'],
  openGraph: {
    title: 'Serotonina: Mucho Más que la Hormona de la Felicidad',
    description: 'El 90% en el intestino, no en el cerebro. Síntesis, funciones y mecanismo de los SSRI.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Serotonina: Mucho Más que la Hormona de la Felicidad",
  description: "El 90% de la serotonina está en el intestino. Visualiza síntesis, funciones, mecanismo SSRI, eje intestino-cerebro y por qué no es simplemente la hormona de la felicidad.",
  url: "https://meskeia.com/visualizador-serotonina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la serotonina y qué hace en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La serotonina (5-HT) es un neurotransmisor y hormona producida a partir del aminoácido triptófano. Participa en la regulación del estado de ánimo, el sueño, el apetito, la digestión y la coagulación sanguínea. Contrariamente a la creencia popular, el 90% de la serotonina corporal se produce en el intestino, donde coordina los movimientos peristálticos, no en el cerebro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se llama a la serotonina la hormona de la felicidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El término se popularizó porque los niveles bajos de serotonina en el cerebro se asocian con síntomas depresivos y los fármacos que aumentan su disponibilidad (SSRI) mejoran el estado de ánimo en algunos pacientes. Sin embargo, la relación no es tan simple: la serotonina modula el procesamiento emocional, pero no es directamente la causa de la felicidad. Su función real es más amplia y compleja, afectando desde la digestión hasta la termorregulación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los antidepresivos SSRI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los inhibidores selectivos de la recaptación de serotonina (SSRI) bloquean el transportador SERT, que normalmente reabsorbe la serotonina desde la sinapsis de vuelta a la neurona emisora. Al inhibir este transportador, la serotonina permanece más tiempo en el espacio sináptico, aumentando su disponibilidad para activar los receptores postsinápticos. El efecto terapéutico tarda 2-4 semanas porque implica adaptaciones a largo plazo en la sensibilidad de los receptores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre serotonina y dopamina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas son neurotransmisores monoamínicos, pero con funciones distintas. La dopamina está vinculada principalmente a la motivación, la anticipación de recompensa y el movimiento (déficit en Parkinson). La serotonina interviene más en la regulación del humor, el sueño y la conducta social. Aunque interaccionan entre sí, no son intercambiables: aumentar una no equivale a aumentar la otra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tiene la serotonina con el intestino?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las células enterocromafines del intestino producen el 90-95% de toda la serotonina del organismo. Esta serotonina intestinal no cruza la barrera hematoencefálica (no llega al cerebro), sino que actúa localmente coordinando los movimientos peristálticos y modulando la comunicación entre el intestino y el sistema nervioso entérico. El eje intestino-cerebro permite que señales intestinales influyan indirectamente en el estado de ánimo, lo que explica el vínculo entre salud digestiva y bienestar mental.',
      },
    },
  ],
};
