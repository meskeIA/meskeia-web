import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Itinerario de Viaje - Organiza Días y Actividades | meskeIA',
  description: 'Crea y organiza tu itinerario de viaje día a día. Añade actividades, tiempos, notas y exporta tu plan de viaje. 100% gratis y sin registro.',
  keywords: 'planificador itinerario, organizar viaje, itinerario viaje, agenda viaje, actividades viaje, plan de viaje, dias viaje, organizador vacaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Itinerario de Viaje | meskeIA',
    description: 'Organiza tu viaje día a día con actividades, horarios y notas. Exporta tu itinerario completo.',
    url: 'https://meskeia.com/planificador-itinerario/',
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
    title: 'Planificador de Itinerario de Viaje | meskeIA',
    description: 'Organiza tu viaje día a día con actividades, horarios y notas. Gratis y sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Itinerario Viaje meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Itinerario",
  description: "Crea y organiza tu itinerario de viaje día a día. Añade actividades, tiempos, notas y exporta tu plan de viaje. 100% gratis y sin registro.",
  url: "https://meskeia.com/planificador-itinerario/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo organizar un itinerario de viaje día a día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para organizar un itinerario por días, define primero el número de jornadas y las actividades principales de cada una. Agrupa las visitas por zona geográfica para minimizar desplazamientos, asigna un horario aproximado a cada actividad y deja margen para imprevistos. Esta herramienta te permite añadir, reordenar y anotar cada bloque de tiempo de forma visual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo añadir notas y horarios a cada actividad del itinerario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Por cada actividad puedes especificar la hora de inicio y fin, añadir notas adicionales (direcciones, precios, reservas) y categorizarla. Esto permite tener toda la información del viaje concentrada en un único documento organizado por jornada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito registrarme o crear una cuenta para usar el planificador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El planificador es completamente gratuito y no requiere registro. Los datos se guardan en el navegador de forma local. Para conservar el itinerario fuera del navegador, usa la función de exportación antes de cerrar o limpiar el caché.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo exportar el itinerario completo para compartirlo o imprimirlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Puedes exportar el plan de viaje completo para guardarlo fuera del navegador o compartirlo con otras personas del grupo. El formato exportado incluye todos los días, actividades, horarios y notas que hayas introducido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos días y actividades puedo añadir a un itinerario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes añadir tantos días y actividades como necesites, sin límite predefinido. Tanto si planificas un fin de semana como un viaje de varias semanas, la estructura por jornadas se adapta al número de días que indiques al crear el itinerario.',
      },
    },
  ],
};
