import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Actualización Alquiler 2026 — IRAV e IPC | meskeIA',
  description: 'Estima cuánto puede subir tu alquiler en 2026. Aplica el índice correcto: IRAV (contratos desde mayo 2023) o IPC interanual (contratos anteriores). Ley de Vivienda actualizada.',
  keywords: 'estimador alquiler 2026, IRAV alquiler, subida alquiler 2026, actualización renta alquiler, IPC alquiler, cuanto puede subir el alquiler, ley vivienda 2023 alquiler, indice actualizacion alquiler',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Actualización Alquiler 2026 — IRAV e IPC | meskeIA',
    description: 'Estima la subida máxima permitida de tu alquiler según la Ley de Vivienda. IRAV para contratos nuevos, IPC para los anteriores.',
    url: 'https://meskeia.com/estimador-actualizacion-alquiler/',
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
    title: 'Estimador Actualización Alquiler 2026 | meskeIA',
    description: '¿Cuánto puede subir tu alquiler? Estima con IRAV o IPC según tu tipo de contrato.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Actualización Alquiler 2026",
  description: "Estima cuánto puede subir tu alquiler en 2026. Aplica el índice correcto: IRAV (contratos desde mayo 2023) o IPC interanual (contratos anteriores). Ley de Vivienda actualizada.",
  url: "https://meskeia.com/estimador-actualizacion-alquiler/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto puede subir el alquiler en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2026 la subida máxima depende del índice aplicable al contrato. Para contratos firmados desde el 26 de mayo de 2023 se aplica el IRAV (Índice de Referencia de Actualización del Valor del Arrendamiento), publicado mensualmente por el INE. Para contratos anteriores a esa fecha se utiliza el IPC interanual del mes anterior a la fecha de actualización. En ningún caso el propietario puede aplicar un porcentaje superior al que establece la normativa vigente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el IRAV y en qué se diferencia del IPC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IRAV es el Índice de Referencia para la Actualización de los contratos de Arrendamiento de Vivienda, creado por la Ley de Vivienda 12/2023. A diferencia del IPC general, el IRAV excluye los componentes energéticos más volátiles para ofrecer una referencia más estable para el mercado del alquiler. Su valor se publica mensualmente por el INE y suele ser inferior al IPC en periodos de alta inflación energética.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El propietario está obligado a actualizar el alquiler cada año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La actualización anual de la renta no es automática: el contrato debe contemplarla expresamente mediante una cláusula de actualización. Si el contrato no incluye esa cláusula, la renta permanece igual durante toda la duración pactada. Cuando sí existe la cláusula, el propietario debe notificar la actualización al inquilino con al menos un mes de antelación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué índice aplica a mi contrato de alquiler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice aplicable depende de la fecha de firma del contrato. Si lo firmaste antes del 26 de mayo de 2023, se actualiza con el IPC interanual del mes anterior a la fecha de revisión. Si lo firmaste desde esa fecha, se aplica el IRAV. En ambos casos, la cláusula de actualización del contrato puede indicar el índice de referencia, aunque la Ley de Vivienda prevalece sobre lo pactado si hay contradicción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo negarme a pagar la subida del alquiler si el propietario no me ha notificado a tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si el propietario no te notifica la actualización con la antelación mínima exigida (generalmente un mes antes de la fecha de actualización), la subida no es exigible hasta el mes siguiente a la notificación. No obstante, la ley no establece que el propietario pierda el derecho a actualizar por notificar tarde; simplemente retrasa el momento desde el que puede cobrar la nueva renta. Ante cualquier duda, es recomendable consultar a un profesional.',
      },
    },
  ],
};
