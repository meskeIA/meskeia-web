import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Creador de Flashcards - Memoriza con Tarjetas de Estudio | meskeIA',
  description: 'Crea y estudia flashcards personalizadas. Organiza tus tarjetas por mazos, categorías y colores. Exporta e importa en JSON y CSV. Modo estudio con flip animado.',
  keywords: 'flashcards, tarjetas de estudio, memorización, anki, mazos, repetición espaciada, estudio, aprendizaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Creador de Flashcards | meskeIA',
    description: 'Crea flashcards, organiza mazos y estudia con animaciones flip.',
    url: 'https://meskeia.com/creador-flashcards/',
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
    title: 'Creador de Flashcards | meskeIA',
    description: 'Memoriza más rápido con tarjetas de estudio personalizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Creador de Flashcards",
  description: "Crea y estudia flashcards personalizadas. Organiza tus tarjetas por mazos, categorías y colores. Exporta e importa en JSON y CSV. Modo estudio con flip animado.",
  url: "https://meskeia.com/creador-flashcards/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las flashcards y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las flashcards son tarjetas de estudio con una pregunta o concepto en un lado y la respuesta en el otro. Se usan para memorizar vocabulario, fórmulas, fechas históricas o cualquier dato que requiera repetición. Al activar la recuperación activa de la memoria, son más eficaces que releer apuntes de forma pasiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el modo estudio con flip animado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el modo estudio, cada tarjeta se muestra con la pregunta visible. Al hacer clic, la tarjeta gira (flip) mostrando la respuesta. Puedes marcar si la has acertado o fallado para avanzar en el mazo y hacer un seguimiento de tu progreso en cada sesión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo exportar mis flashcards para usarlas en otro dispositivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Puedes exportar todos tus mazos en formato JSON o CSV. Luego puedes importar ese archivo desde otro navegador o dispositivo para continuar estudiando sin perder ninguna tarjeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este creador de flashcards de Anki?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de Anki, esta herramienta funciona directamente en el navegador sin necesidad de instalar software ni crear una cuenta. Es ideal para sesiones rápidas o para usuarios que buscan algo más sencillo. Anki ofrece algoritmos de repetición espaciada más avanzados; aquí el enfoque es la simplicidad y el acceso inmediato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas tarjetas puedo crear y están guardadas en la nube?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes crear tantas tarjetas y mazos como necesites. Los datos se guardan en el almacenamiento local del navegador (localStorage), no en servidores externos, por lo que no se requiere registro. Para no perder tu trabajo, usa la opción de exportar antes de borrar el caché del navegador.',
      },
    },
  ],
};
