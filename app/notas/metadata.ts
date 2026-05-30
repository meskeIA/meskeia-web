import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Notas - Guarda tus Ideas y Apuntes | meskeIA',
  description: 'Guarda tus notas, ideas y apuntes organizados por categorías. Escribe o pega texto con guardado automático local. Gratis y sin registro.',
  keywords: 'notas, apuntes, ideas, guardar notas, notas online, bloc notas, organizar notas, categorias, texto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Notas - Guarda tus Ideas y Apuntes | meskeIA',
    description: 'Guarda tus notas organizadas por categorías con guardado automático.',
    url: 'https://meskeia.com/notas/',
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
    title: 'Notas - meskeIA',
    description: 'Notas y apuntes organizados por categorías.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Notas",
  description: "Guarda tus notas, ideas y apuntes organizados por categorías. Escribe o pega texto con guardado automático local. Gratis y sin registro.",
  url: "https://meskeia.com/notas/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Dónde se guardan las notas que escribo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las notas se guardan exclusivamente en el almacenamiento local del navegador (localStorage), directamente en tu dispositivo. No se envían a ningún servidor ni se almacenan en la nube. Esto significa que solo tú tienes acceso a ellas y que permanecen disponibles aunque no tengas conexión a internet.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se necesita crear una cuenta o registrarse para usar el bloc de notas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, la herramienta funciona sin registro ni inicio de sesión. Basta con abrir la página para empezar a escribir. Al no requerir cuenta, tampoco almacena datos personales ni instala cookies de seguimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las notas se borran si cierro el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, las notas persisten entre sesiones gracias al guardado automático en localStorage. Se conservan aunque cierres la pestaña o el navegador. La única forma de perderlas es limpiar manualmente los datos del navegador (historial y cookies) o borrarlas desde la propia aplicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo organizar las notas por categorías o etiquetas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la herramienta permite organizar las notas por categorías para mantener los apuntes ordenados. Puedes agrupar ideas, tareas, reflexiones o recordatorios en secciones distintas y acceder a cada categoría de forma independiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia esta herramienta de Google Keep o Notion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de Google Keep o Notion, esta herramienta no requiere cuenta, no sincroniza con servidores externos y no recopila datos de uso. Es una solución local y privada, ideal para apuntes rápidos cuando no se quiere depender de servicios en la nube ni aceptar términos de uso de terceros.',
      },
    },
  ],
};
