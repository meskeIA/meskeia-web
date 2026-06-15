import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asistente de Reclamaciones al Consumidor - meskeIA',
  description: 'Guía interactiva para reclamar tus derechos como consumidor en España. Árbol de decisión, plazos legales, organismos y modelos de carta.',
  keywords: 'reclamaciones consumidor, derechos consumidor España, OMIC, hoja de reclamaciones, garantía productos, devoluciones, derecho desistimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente de Reclamaciones al Consumidor - meskeIA',
    description: 'Guía interactiva para reclamar tus derechos como consumidor en España',
    url: 'https://meskeia.com/asistente-reclamaciones/',
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
    title: 'Asistente de Reclamaciones al Consumidor',
    description: 'Guía interactiva para reclamar tus derechos como consumidor en España',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Asistente de Reclamaciones al Consumidor",
  description: "Guía interactiva para reclamar tus derechos como consumidor en España. Árbol de decisión, plazos legales, organismos y modelos de carta.",
  url: "https://meskeia.com/asistente-reclamaciones/",
  category: 'EducationalApplication',
  features: [
    'Árbol de decisión en 3 pasos para identificar tu tipo de reclamación y vía más adecuada',
    'Plazos legales actualizados: garantía 3 años (Directiva 2019/771/UE), desistimiento 14 días',
    'Directorio de organismos: OMIC, Consumo autonómico, arbitraje y plataforma ODR europea',
    'Modelo de carta de reclamación personalizable según tipo de problema y canal',
    'Comparativa de vías de reclamación: coste, plazo y carácter vinculante',
    'Cobertura de 5 tipos de incidencia: garantía, desistimiento, servicio defectuoso, factura incorrecta y vuelo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo puedo reclamar mis derechos como consumidor en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes reclamar ante el vendedor por escrito, solicitar una hoja de reclamaciones oficial en el establecimiento o acudir a la OMIC (Oficina Municipal de Información al Consumidor) de tu municipio. Si no obtienes respuesta, puedes presentar una reclamación ante la Dirección General de Consumo de tu comunidad autónoma o iniciar un arbitraje de consumo gratuito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el plazo para reclamar la garantía de un producto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, los productos nuevos tienen una garantía legal de 3 años desde la entrega (ampliada de 2 a 3 años en 2022). Los productos de segunda mano tienen 1 año salvo pacto en contrario. El plazo para ejercer la acción de responsabilidad es de 3 años desde que el consumidor conoce el defecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el derecho de desistimiento y cuándo se puede ejercer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El derecho de desistimiento permite devolver un producto comprado a distancia (internet, teléfono) sin necesidad de dar ningún motivo, en un plazo de 14 días naturales desde la recepción. No aplica a compras en tiendas físicas ni a productos personalizados, perecederos o contenidos digitales descargados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la hoja de reclamaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hoja de reclamaciones es un documento oficial con el que el consumidor puede dejar constancia escrita de su queja ante un establecimiento. Todos los comercios y empresas que prestan servicios en España están obligados a tenerla disponible. Una copia se envía a la administración de consumo correspondiente, que puede iniciar un procedimiento de inspección.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una reclamación y una denuncia de consumo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una reclamación busca resolver un conflicto concreto entre el consumidor y la empresa (devolución, reparación, indemnización). Una denuncia, en cambio, pone en conocimiento de la administración una infracción que puede afectar a otros consumidores, sin que el denunciante sea necesariamente parte del conflicto. Ambas pueden presentarse ante los servicios de consumo de tu comunidad autónoma.',
      },
    },
  ],
};
