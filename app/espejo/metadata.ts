import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Espejo Digital Online - Espejo de Bolsillo Gratis | meskeIA',
  description: 'Espejo digital gratuito que usa la cámara frontal de tu dispositivo (móvil o celular, ordenador o computadora). Ideal para retocarte, maquillarte o comprobar tu aspecto cuando no tienes un espejo a mano.',
  keywords: 'espejo digital, espejo online, espejo gratis, espejo cámara, espejo móvil, espejo celular, espejo en el ordenador, espejo en la computadora, mirror online, espejo de bolsillo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Espejo Digital Online - Espejo de Bolsillo',
    description: 'Espejo digital gratuito que usa la cámara frontal de tu móvil (celular) u ordenador (computadora). Comprueba tu aspecto en cualquier momento.',
    url: 'https://meskeia.com/espejo/',
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
    title: 'Espejo Digital Online - Espejo de Bolsillo',
    description: 'Espejo digital gratuito que usa la cámara frontal.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Espejo Digital",
  description: "Espejo digital gratuito que usa la cámara frontal de tu dispositivo (móvil o celular, ordenador o computadora). Ideal para retocarte, maquillarte o comprobar tu aspecto cuando no tienes un espejo a mano.",
  url: "https://meskeia.com/espejo/",
  category: 'UtilityApplication',
  // Hallazgo 4752: la lista estaba vacía. Solo lo que se ha visto hacer a la app.
  features: [
    'Imagen de la cámara frontal en tiempo real',
    'Espejada por defecto, con conmutador a imagen normal (como te ven los demás)',
    'Zoom de la imagen de 1x a 2x',
    'Ajuste de brillo de la imagen del 50 al 150 %',
    'Pantalla completa',
    'Botón para apagar la cámara y liberarla',
    'La imagen no se graba ni se envía: se procesa solo en el navegador',
  ],
});

interface PreguntaFrecuente {
  question: string;
  answer: string;
}

/**
 * Hallazgo 4753: la pregunta sobre si se guarda la imagen estaba escrita dos veces, con dos
 * respuestas. Ahora la FAQ visible de page.tsx y el FAQPage leen esta misma constante.
 */
export const PREGUNTA_PRIVACIDAD: PreguntaFrecuente = {
  question: '¿Guarda alguna imagen o vídeo?',
  answer:
    'No. El espejo digital muestra la imagen de la cámara en tiempo real pero no captura, almacena ni envía ninguna imagen o vídeo: se procesa solo en tu navegador, sin pasar por ningún servidor. Al apagar la cámara, cerrar la pestaña o retirar el permiso, el acceso cesa y no queda ningún archivo guardado.',
};

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    question: '¿Cómo usar la cámara frontal como espejo en el ordenador o computadora?',
    answer:
      'Abre la herramienta en tu navegador y concede permiso de acceso a la cámara cuando se solicite. La imagen de la cámara frontal se muestra en tiempo real y con efecto espejo (volteo horizontal), igual que un espejo convencional. No necesitas instalar ninguna aplicación.',
  },
  PREGUNTA_PRIVACIDAD,
  {
    question: '¿Funciona en móvil (celular) y en tableta?',
    answer:
      'Sí. La herramienta es compatible con navegadores modernos en Android e iOS (Chrome, Safari, Firefox). En el móvil o celular pide siempre la cámara frontal, la que te mira; no tiene selector de cámara.',
  },
  {
    // Hallazgo 4749: mandaba a pellizcar o al zoom del navegador, que amplían la página
    question: '¿Puedo ampliar o ajustar el zoom de la imagen?',
    answer:
      'Sí. Con el espejo activo, el control de zoom de la app amplía la imagen de 1x a 2x. Es un zoom digital: agranda el centro de la imagen, no acerca la lente. Al lado tienes también el control de brillo.',
  },
  {
    // Hallazgo 4750: decía que es «especialmente útil» donde no hay cámara, y sin cámara no funciona
    question: '¿Para qué situaciones es útil un espejo digital?',
    answer:
      'Es práctico para retocarse antes de una videollamada, comprobar el maquillaje o peinado cuando no hay un espejo físico disponible, verificar el aspecto antes de salir o usarlo como espejo de mano adicional en viajes. Necesita una cámara que te mire: la frontal del móvil o la cámara web del ordenador.',
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
