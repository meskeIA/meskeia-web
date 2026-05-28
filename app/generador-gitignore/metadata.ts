import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de .gitignore - Plantillas para Git | meskeIA',
  description: 'Generador de archivos .gitignore profesional con plantillas para Node.js, Python, Java, React y más. Combina tecnologías, descarga y copia tu configuración Git personalizada.',
  keywords: 'gitignore, git, github, plantillas git, node gitignore, python gitignore, java gitignore, react gitignore, gitignore generator, control de versiones, desarrollo web, programación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de .gitignore - Plantillas para Git | meskeIA',
    description: 'Crea archivos .gitignore profesionales combinando plantillas para tus tecnologías. Node.js, Python, Java, React y más.',
    url: 'https://meskeia.com/generador-gitignore/',
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
    title: 'Generador de .gitignore - Plantillas para Git',
    description: 'Crea archivos .gitignore profesionales combinando plantillas para tus tecnologías.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de .gitignore meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de .gitignore",
  description: "Generador de archivos .gitignore profesional con plantillas para Node.js, Python, Java, React y más. Combina tecnologías, descarga y copia tu configuración Git personalizada.",
  url: "https://meskeia.com/generador-gitignore/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un archivo .gitignore y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un archivo .gitignore indica a Git qué archivos y carpetas debe ignorar y no incluir en el control de versiones. Evita subir al repositorio archivos temporales, dependencias (como node_modules), claves de API, configuraciones locales o artefactos de compilación. Es una práctica esencial en cualquier proyecto de desarrollo de software.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo generar un .gitignore para Node.js o Python?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la tecnología correspondiente (Node.js, Python, Java, React, etc.) y la herramienta genera automáticamente el contenido del archivo .gitignore adaptado a esa pila tecnológica. Puedes combinar varias tecnologías en un mismo archivo si tu proyecto usa más de una. Luego descarga o copia el resultado y colócalo en la raíz de tu repositorio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo combinar plantillas para proyectos con múltiples tecnologías?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La herramienta permite seleccionar varias tecnologías a la vez y fusiona las plantillas en un único archivo .gitignore sin duplicados. Esto es especialmente útil en proyectos fullstack con, por ejemplo, Node.js en el backend y React en el frontend, o proyectos Python con entornos virtuales y Jupyter Notebooks.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre este generador y el de gitignore.io?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas herramientas generan plantillas .gitignore por tecnología. Esta opción está integrada en el navegador sin necesidad de salir a otra web, permite previsualizar el contenido antes de descargar y está disponible en español. Gitignore.io (toptal) ofrece una base de datos más amplia de tecnologías soportadas, por lo que para stacks muy específicos puede ser más completo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El archivo .gitignore afecta a archivos que ya están rastreados por Git?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No directamente. El .gitignore solo evita que Git empiece a rastrear archivos nuevos que coincidan con los patrones. Si un archivo ya está siendo rastreado (fue añadido con git add en algún momento), seguirá en el repositorio aunque lo añadas al .gitignore. Para dejar de rastrearlo debes ejecutar git rm --cached <archivo> y luego hacer commit.',
      },
    },
  ],
};
