import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Prueba de Cámara Web Online - Test Webcam Gratis | meskeIA',
  description: 'Prueba tu cámara web antes de videollamadas, en el ordenador (computadora), móvil o celular. Verifica resolución, brillo, contraste y toma fotos. Sin registro ni instalación. Totalmente privado.',
  keywords: 'prueba camara, test webcam, probar camara web, verificar camara, videollamada, zoom, meet, teams, camara ordenador, camara computadora, camara movil, camara celular, webcam test',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Prueba de Cámara Web Online - Test Webcam Gratis',
    description: 'Verifica tu cámara web antes de videollamadas. Test completo con captura de fotos.',
    url: 'https://meskeia.com/prueba-camara/',
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
    title: 'Prueba de Cámara Web Online',
    description: 'Test de webcam gratis antes de tus videollamadas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Prueba de Cámara Web",
  description: "Prueba tu cámara web antes de videollamadas, tanto en el ordenador (computadora) como en el móvil o celular. Verifica resolución, brillo, contraste y toma fotos. Sin registro ni instalación. Totalmente privado.",
  url: "https://meskeia.com/prueba-camara/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi cámara web funciona correctamente?',
      acceptedAnswer: { '@type': 'Answer', text: 'Puedes comprobarlo directamente en el navegador sin instalar nada. Al acceder a la herramienta, el navegador solicita permiso para usar la cámara y muestra la imagen en tiempo real. Si ves tu propia imagen con buena nitidez y sin parpadeos, la cámara funciona bien. Si no aparece imagen, el problema puede ser que el permiso fue denegado, un driver desactualizado o que la cámara esté siendo usada por otra aplicación.' },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la cámara no se activa antes de una videollamada de Zoom o Google Meet?',
      acceptedAnswer: { '@type': 'Answer', text: 'Lo más común es que otra aplicación esté ocupando la cámara en segundo plano (Teams, Skype, OBS, etc.) o que el navegador no tenga permiso de cámara. En Windows puedes verificar en Configuración → Privacidad → Cámara que la aplicación tenga acceso. En macOS, revisa Preferencias del Sistema → Seguridad y Privacidad → Cámara. Cerrar todas las apps que usen la cámara antes de la llamada suele resolver el problema.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué resolución debería tener una webcam para videollamadas profesionales?',
      acceptedAnswer: { '@type': 'Answer', text: 'Para videollamadas de trabajo se recomienda un mínimo de 720p (HD, 1280×720 píxeles). La mayoría de plataformas como Zoom y Teams limitan la transmisión a 1080p incluso si la cámara captura más. Una webcam 1080p a 30 fps es suficiente para el 99% de los casos profesionales. La iluminación del entorno influye más en la calidad percibida que la resolución de la cámara.' },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro probar la cámara en el navegador? ¿Se graba el vídeo?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí, es completamente seguro. La imagen de la cámara se procesa localmente en tu navegador mediante la API getUserMedia de HTML5; ningún vídeo se envía a ningún servidor. El acceso a la cámara solo se activa cuando el usuario concede permiso explícitamente, y se puede revocar en cualquier momento cerrando la pestaña o desactivando el permiso en el navegador.' },
    },
    {
      '@type': 'Question',
      name: '¿Puedo probar la cámara en móvil (celular) o tablet?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Los navegadores modernos en Android (Chrome) e iOS (Safari 14.3 o superior) soportan acceso a cámara vía WebRTC. En el móvil o celular, la herramienta suele ofrecer la opción de elegir entre la cámara frontal y la trasera. El comportamiento es idéntico al del ordenador o computadora: sin instalación, sin registro y sin almacenamiento de datos.' },
    },
  ],
};
