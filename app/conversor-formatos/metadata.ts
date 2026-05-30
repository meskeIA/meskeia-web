import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Conversor de Formatos de Archivo - JSON, CSV, Excel, XML, YAML | meskeIA',
  description: 'Convierte archivos entre JSON, CSV, Excel (.xlsx), XML y YAML. 100% privado, todo se procesa en tu navegador. Gratis y sin registro.',
  keywords: 'conversor formatos, json a csv, csv a excel, excel a json, xml a json, yaml a json, convertir archivos, exportar datos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Formatos de Archivo | meskeIA',
    description: 'Convierte entre JSON, CSV, Excel, XML y YAML. 100% privado, procesamiento local.',
    url: 'https://meskeia.com/conversor-formatos/',
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
    title: 'Conversor de Formatos de Archivo | meskeIA',
    description: 'Convierte entre JSON, CSV, Excel, XML y YAML. 100% privado.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Formatos de Archivo - JSON, CSV, Excel, XML, YAML",
  description: "Convierte archivos entre JSON, CSV, Excel (.xlsx), XML y YAML. 100% privado, todo se procesa en tu navegador. Gratis y sin registro.",
  url: 'https://meskeia.com/conversor-formatos/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué formatos de archivo puedo convertir con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes convertir entre JSON, CSV, Excel (.xlsx), XML y YAML. La herramienta admite todas las combinaciones posibles entre estos cinco formatos, tanto para importar datos como para exportarlos al formato que necesites.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro subir mis archivos para convertirlos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todo el procesamiento ocurre directamente en tu navegador, sin enviar ningún dato a servidores externos. Tus archivos nunca abandonan tu dispositivo, lo que garantiza total privacidad para datos sensibles como hojas de cálculo empresariales o bases de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo convierto un archivo JSON a CSV paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona "JSON" como formato de origen y "CSV" como formato de destino. Pega tu JSON en el área de texto o carga el archivo, y la herramienta generará automáticamente el CSV listo para descargar. El proceso es instantáneo y funciona con arrays de objetos de cualquier tamaño.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve convertir datos entre JSON y Excel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil cuando necesitas analizar respuestas de una API en una hoja de cálculo, compartir datos técnicos con personas no programadoras o importar tablas de Excel a una aplicación web. La conversión JSON ↔ Excel es una de las más habituales en entornos de desarrollo y análisis de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay límite de tamaño para los archivos que puedo convertir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El límite depende de la memoria disponible en tu navegador, no de un servidor externo. En la práctica, archivos de hasta varios megabytes se procesan sin problemas en ordenadores modernos. Para archivos muy grandes (cientos de MB), herramientas de línea de comandos como jq o csvkit pueden ser más adecuadas.',
      },
    },
  ],
};
