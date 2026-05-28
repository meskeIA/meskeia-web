import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Seguro de Viaje - Qué Cobertura Necesitas según Destino | meskeIA',
  description: 'Descubre qué coberturas de seguro de viaje necesitas según tu destino y tipo de viaje. Checklist completo de 12 puntos para verificar antes de contratar cualquier póliza.',
  keywords: 'seguro viaje, cobertura viaje, gastos medicos viaje, repatriacion, cancelacion viaje, TSJE tarjeta sanitaria europea, equipaje viaje, seguro aventura, checklist seguro viaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Seguro de Viaje según Destino | meskeIA',
    description: 'Qué cobertura necesitas según tu destino y tipo de viaje. Checklist completo antes de contratar.',
    url: 'https://meskeia.com/guia-seguro-viaje/',
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
    title: 'Guía de Seguro de Viaje | meskeIA',
    description: 'Coberturas recomendadas según destino y tipo de viaje. Checklist antes de contratar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Seguro de Viaje meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía de Seguro de Viaje",
  description: "Descubre qué coberturas de seguro de viaje necesitas según tu destino y tipo de viaje. Checklist completo de 12 puntos para verificar antes de contratar cualquier póliza.",
  url: "https://meskeia.com/guia-seguro-viaje/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué cubre un seguro de viaje básico?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un seguro de viaje básico suele cubrir gastos médicos de urgencia en el extranjero, repatriación sanitaria o de restos mortales, y asistencia en viaje 24 horas. Las coberturas de cancelación, pérdida de equipaje o responsabilidad civil suelen ser opcionales o incluidas solo en pólizas más completas.' },
    },
    {
      '@type': 'Question',
      name: '¿Necesito seguro de viaje si tengo la Tarjeta Sanitaria Europea (TSE)?',
      acceptedAnswer: { '@type': 'Answer', text: 'La Tarjeta Sanitaria Europea solo cubre atención médica pública en países de la UE/EEE en condiciones equivalentes a las de un ciudadano local. No cubre repatriación, cancelación de vuelos, pérdida de equipaje ni viajes fuera de Europa. Para destinos como EEUU, Asia o América Latina es imprescindible un seguro privado.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta un seguro de viaje y de qué depende el precio?',
      acceptedAnswer: { '@type': 'Answer', text: 'El precio varía principalmente según el destino, la duración del viaje, la edad del viajero y las coberturas incluidas. Un seguro básico para Europa puede costar entre 15 y 40 € por persona y semana. Para EEUU o Japón, con coberturas médicas altas, puede superar los 80-120 € por semana debido al coste de la atención sanitaria en esos países.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué cobertura médica es suficiente para viajar a Estados Unidos?',
      acceptedAnswer: { '@type': 'Answer', text: 'Para viajar a EEUU se recomienda una cobertura mínima de 250.000 USD, aunque muchos expertos aconsejan 500.000 USD o cobertura ilimitada. Una hospitalización en EEUU puede superar los 10.000 USD por noche. También es importante que incluya evacuación médica de emergencia, que puede costar más de 50.000 USD.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cobertura de cancelación y cuándo merece la pena contratarla?',
      acceptedAnswer: { '@type': 'Answer', text: 'La cobertura de cancelación reembolsa el coste del viaje si no puedes realizarlo por causas justificadas (enfermedad grave, fallecimiento familiar, despido laboral, etc.). Merece la pena cuando el importe del viaje es alto (más de 500 € por persona), cuando hay reservas no reembolsables, o en viajes planificados con mucha antelación.' },
    },
  ],
};
