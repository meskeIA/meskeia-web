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
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo usar la cámara frontal como espejo en el ordenador o computadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Abre la herramienta en tu navegador y concede permiso de acceso a la cámara cuando se solicite. La imagen de la cámara frontal se muestra en tiempo real y con efecto espejo (volteo horizontal), igual que un espejo convencional. No necesitas instalar ninguna aplicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La cámara graba o guarda el vídeo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La imagen de la cámara se procesa directamente en tu navegador sin enviarse a ningún servidor ni grabarse en ningún archivo. Al cerrar la pestaña o revocar el permiso de cámara, el acceso cesa inmediatamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Funciona en móvil (celular) y en tableta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La herramienta es compatible con navegadores modernos en Android e iOS (Chrome, Safari, Firefox). En el móvil o celular activa automáticamente la cámara frontal, aunque en algunos dispositivos puede ser necesario seleccionarla manualmente si el navegador abre la trasera por defecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo ampliar o ajustar el zoom de la imagen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El zoom disponible depende de las capacidades del navegador y la cámara del dispositivo. En la mayoría de casos puedes usar el gesto de pellizco (pinch-to-zoom) en móvil o la función de zoom del navegador en escritorio para acercar la imagen según necesites.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué situaciones es útil un espejo digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es práctico para retocarse antes de una videollamada, comprobar el maquillaje o peinado cuando no hay un espejo físico disponible, verificar el aspecto antes de salir o usarlo como espejo de mano adicional en viajes. En ordenadores de escritorio, donde no hay cámara orientada hacia el usuario, puede resultar especialmente útil.',
      },
    },
  ],
};
