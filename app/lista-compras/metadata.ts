import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lista de Compras - Organiza tu Supermercado | meskeIA',
  description: 'Lista de compras inteligente con organización automática por categorías del supermercado. Guarda tus listas en el navegador, comparte y exporta. Gratis y sin registro.',
  keywords: 'lista compras, supermercado, lista supermercado, organizar compras, lista compra online, shopping list, mercado, productos, categorias, offline',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lista de Compras Inteligente - Organiza tu Supermercado',
    description: 'Crea y organiza tu lista de compras por categorías. Guarda en el navegador y comparte fácilmente.',
    url: 'https://meskeia.com/lista-compras/',
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
    title: 'Lista de Compras | meskeIA',
    description: 'Lista de compras inteligente con organización por categorías',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Lista de Compras meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lista de Compras",
  description: "Lista de compras inteligente con organización automática por categorías del supermercado. Guarda tus listas en el navegador, comparte y exporta. Gratis y sin registro.",
  url: "https://meskeia.com/lista-compras/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo organizo la lista de compras por secciones del supermercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al añadir cada producto puedes asignarle una categoría (frutas, lácteos, carnicería, conservas…). La herramienta agrupa automáticamente los artículos por sección para que recorras el supermercado en orden y no tengas que volver atrás. Solo tienes que introducir el nombre del producto y seleccionar su categoría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se guarda la lista si cierro el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La lista se guarda automáticamente en el almacenamiento local del navegador (localStorage), sin necesidad de cuenta ni conexión a internet. Al volver a abrir la página encontrarás exactamente la misma lista. Solo se pierde si limpias los datos del navegador manualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo compartir la lista con otra persona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes exportar la lista en texto o copiarla al portapapeles y enviarla por WhatsApp, email o cualquier mensajería. No requiere que la otra persona tenga cuenta ni instale ninguna aplicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Funciona sin conexión a internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, una vez cargada la página funciona completamente sin conexión. Los datos se almacenan en el dispositivo, por lo que puedes consultarla y marcar productos en el supermercado aunque no tengas cobertura o WiFi.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo evito comprar de más y reducir el gasto en el supermercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Planificar el menú semanal antes de hacer la lista reduce el gasto entre un 20 y un 30% según estudios de consumo. Añadir solo lo que realmente necesitas, revisar el stock en casa antes de salir y establecer cantidades concretas por producto ayuda a evitar compras impulsivas y desperdicio alimentario.',
      },
    },
  ],
};
