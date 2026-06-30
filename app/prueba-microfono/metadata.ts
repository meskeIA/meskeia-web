import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Prueba de Micrófono Online - Test Audio Gratis | meskeIA',
  description: 'Prueba tu micrófono antes de videollamadas, en el ordenador (computadora) o en el móvil (celular). Visualiza niveles de audio, graba tu voz y reproduce. Sin registro ni instalación. 100% privado.',
  keywords: 'prueba microfono, test microfono, probar micro, probar microfono celular, verificar audio, videollamada, zoom, meet, teams, micrófono ordenador, micrófono computadora, micrófono celular, audio test, grabar voz',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Prueba de Micrófono Online - Test Audio Gratis',
    description: 'Verifica tu micrófono antes de videollamadas, desde el ordenador (computadora) o el móvil (celular). Visualización de audio y grabación.',
    url: 'https://meskeia.com/prueba-microfono/',
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
    title: 'Prueba de Micrófono Online',
    description: 'Test de micrófono gratis antes de tus videollamadas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Prueba de Micrófono",
  description: "Prueba tu micrófono antes de videollamadas, en el ordenador (computadora) o en el móvil (celular). Visualiza niveles de audio, graba tu voz y reproduce. Sin registro ni instalación. 100% privado.",
  url: "https://meskeia.com/prueba-microfono/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi micrófono está funcionando correctamente?',
      acceptedAnswer: { '@type': 'Answer', text: 'La forma más rápida es usar una herramienta de test en el navegador que muestre el nivel de audio en tiempo real. Si el medidor de volumen sube cuando hablas, el micrófono está captando sonido correctamente. Si no reacciona nada, el problema suele ser que el micrófono está silenciado en el sistema, el permiso del navegador está denegado o el dispositivo no está seleccionado como entrada predeterminada.' },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los demás no me escuchan bien en Zoom o Teams?',
      acceptedAnswer: { '@type': 'Answer', text: 'Las causas más frecuentes son: micrófono con volumen de entrada demasiado bajo en la configuración del sistema, demasiada distancia al micrófono (lo ideal es 20-30 cm), eco producido por los altavoces si no usas auriculares, o ruido de fondo excesivo. En Windows, abre Configuración → Sistema → Sonido → Entrada y ajusta el volumen del micrófono al 80-100%. Usar auriculares con micrófono integrado suele mejorar notablemente la calidad percibida.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un micrófono de condensador y uno dinámico?',
      acceptedAnswer: { '@type': 'Answer', text: 'Los micrófonos de condensador son más sensibles y capturan con mayor detalle, pero también recogen más ruido ambiental; son ideales para podcasts, grabaciones y entornos tranquilos. Los dinámicos son más robustos y rechazan mejor el ruido de fondo; se recomiendan para streaming o trabajar en espacios con ruido. Para videollamadas cotidianas, cualquier micrófono de diadema o los integrados en portátiles modernos suelen ser suficientes.' },
    },
    {
      '@type': 'Question',
      name: '¿Se guarda la grabación de mi voz en el servidor?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. La grabación y reproducción de audio se realiza completamente en el navegador mediante la Web Audio API y MediaRecorder, sin enviar ningún dato a ningún servidor. El audio grabado se almacena temporalmente en la memoria del navegador solo mientras la pestaña está abierta y se elimina al cerrarla. Ningún tercero tiene acceso a las grabaciones.' },
    },
    {
      '@type': 'Question',
      name: '¿Puedo probar el micrófono del móvil o celular desde el navegador?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Los navegadores modernos del móvil o celular en Android (Chrome 60 o superior) y en iOS (Safari 14.3 o superior) permiten acceder al micrófono del dispositivo a través de la API getUserMedia. El funcionamiento es idéntico al del ordenador o computadora de escritorio: el navegador solicita permiso explícito al usuario y el audio se procesa localmente. En iPhone, asegúrate de usar Safari, ya que otros navegadores en iOS tienen restricciones de acceso al micrófono.' },
    },
  ],
};
