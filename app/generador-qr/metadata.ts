import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Códigos QR - Crea QR Gratis Online | meskeIA',
  description: 'Generador de códigos QR gratuito para URLs, texto, WiFi, contactos, email y más. Descarga en PNG de alta resolución. Sin registro, sin límites, 100% privado.',
  keywords: 'generador qr, crear codigo qr, qr gratis, qr wifi, qr url, qr texto, codigo qr online, generar qr',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Códigos QR Gratis - meskeIA',
    description: 'Crea códigos QR para URLs, texto, WiFi y contactos. Descarga gratis en PNG.',
    url: 'https://meskeia.com/generador-qr/',
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
    title: 'Generador de Códigos QR Gratis',
    description: 'Crea códigos QR para URLs, texto, WiFi y contactos. Sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Códigos QR",
  description: "Generador de códigos QR gratuito para URLs, texto, WiFi, contactos, email y más. Descarga en PNG de alta resolución. Sin registro, sin límites, 100% privado.",
  url: "https://meskeia.com/generador-qr/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo crear un código QR gratis para una URL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona el tipo "URL", pega el enlace en el campo de texto y el código QR se genera al instante en tu navegador. Puedes descargarlo en PNG con un clic, sin necesidad de registrarte ni instalar nada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de contenido puedo codificar en un QR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes crear códigos QR para URLs, texto libre, redes WiFi (con SSID, contraseña y tipo de cifrado), contactos (vCard), direcciones de email y números de teléfono. Cada tipo genera un QR optimizado para que las apps lo lean correctamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los datos que introduzco se envían a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La generación del QR ocurre completamente en tu navegador; ningún dato sale de tu dispositivo. Es especialmente relevante si vas a codificar contraseñas WiFi o información de contacto personal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué resolución se descarga el código QR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El archivo PNG se exporta en alta resolución (512 × 512 píxeles por defecto), suficiente para imprimir en tarjetas de visita, carteles o folletos sin que el código pierda legibilidad al escanearlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los códigos QR generados caducan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Un QR estático codifica directamente el contenido; mientras el destino (por ejemplo, una URL) siga activo, el código funcionará indefinidamente. No hay suscripción ni servicio externo que pueda desactivarlo.',
      },
    },
  ],
};
