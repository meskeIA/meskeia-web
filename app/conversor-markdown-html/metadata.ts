import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor Markdown a HTML - Convierte MD a HTML en Tiempo Real | meskeIA',
  description: 'Convierte Markdown a HTML limpio con vista previa en tiempo real. Soporte completo: títulos, listas, enlaces, imágenes, código y tablas. 100% gratis y privado.',
  keywords: 'markdown, html, convertidor, md to html, parser markdown, markdown online, conversor, vista previa, codigo, tablas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor Markdown a HTML | meskeIA',
    description: 'Convierte Markdown a HTML limpio en tiempo real. Soporte completo de sintaxis con vista previa instantánea.',
    url: 'https://meskeia.com/conversor-markdown-html/',
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
    title: 'Conversor Markdown a HTML | meskeIA',
    description: 'Convierte Markdown a HTML limpio en tiempo real con vista previa instantánea.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor Markdown-HTML",
  description: "Convierte Markdown a HTML limpio con vista previa en tiempo real. Soporte completo: títulos, listas, enlaces, imágenes, código y tablas. 100% gratis y privado.",
  url: "https://meskeia.com/conversor-markdown-html/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es Markdown y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Markdown es un lenguaje de marcado ligero creado en 2004 por John Gruber que permite dar formato a texto plano usando símbolos sencillos (# para títulos, ** para negrita, - para listas). Se usa ampliamente en documentación técnica, README de GitHub, blogs estáticos, wikis y plataformas como Reddit o Stack Overflow.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierte Markdown a HTML?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un parser Markdown lee el texto e interpreta su sintaxis para generar las etiquetas HTML equivalentes: # se convierte en <h1>, ** en <strong>, - en <li> dentro de <ul>, etc. El HTML resultante puede insertarse directamente en cualquier página web o CMS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué elementos de Markdown soporta el conversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El conversor soporta la especificación CommonMark completa: encabezados (h1-h6), párrafos, negrita, cursiva, código inline y bloques de código con resaltado, listas ordenadas y desordenadas, enlaces, imágenes, citas (blockquote), líneas horizontales y tablas GFM (GitHub Flavored Markdown).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene usar Markdown en lugar de escribir HTML directamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Markdown es más rápido de escribir y más legible que HTML cuando el contenido es principalmente texto con formato básico. HTML resulta necesario cuando se requiere control fino sobre atributos, clases CSS o estructuras complejas (formularios, grids). Para artículos, documentación y contenido editorial, Markdown reduce el tiempo de escritura entre un 30-50%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar el HTML generado directamente en mi web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El HTML generado es limpio y semántico, sin estilos inline ni dependencias. Puedes copiarlo y pegarlo en cualquier CMS (WordPress, Ghost, Webflow), framework (React, Vue, Angular) o editor de código. Solo necesitarás añadir tus propias clases CSS si quieres personalizar la apariencia.',
      },
    },
  ],
};
