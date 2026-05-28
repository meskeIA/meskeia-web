import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Radio meskeIA - Emisoras Online en Español | meskeIA',
  description: 'Escucha emisoras de radio online gratis. Música, noticias, deportes y más. Reproductor minimalista con favoritos y control de volumen.',
  keywords: 'radio, online, emisoras, streaming, música, español, gratis, reproductor, en vivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Radio meskeIA - Emisoras Online en Español | meskeIA',
    description: 'Escucha tus emisoras favoritas online. Gratis y sin registro.',
    url: 'https://meskeia.com/radio-meskeia/',
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
    title: 'Radio meskeIA - Radio Online',
    description: 'Emisoras de radio online gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Radio meskeIA",
  description: "Escucha emisoras de radio online gratis. Música, noticias, deportes y más. Reproductor minimalista con favoritos y control de volumen.",
  url: "https://meskeia.com/radio-meskeia/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Puedo escuchar radio online gratis sin instalar nada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El reproductor funciona directamente en el navegador sin necesidad de descargar ninguna aplicación ni crear una cuenta. Basta con abrir la página, seleccionar la emisora que quieras escuchar y pulsar reproducir. Funciona en ordenador, tablet y móvil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de emisoras puedo escuchar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reproductor incluye emisoras de música, noticias, deportes y entretenimiento en español. La selección cubre distintos géneros musicales y varios países de habla hispana, de modo que puedes encontrar radio generalista, temática y musical según tu preferencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo guardo mis emisoras favoritas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes marcar como favorita cualquier emisora con un solo clic. Los favoritos se almacenan localmente en tu navegador, por lo que estarán disponibles la próxima vez que visites la página desde el mismo dispositivo sin necesidad de registrarte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué no suena una emisora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las emisoras de radio en streaming dependen de servidores externos que pueden estar temporalmente caídos o haber cambiado su URL de emisión. Si una emisora no carga, prueba a recargar la página o selecciona otra. Los fallos de reproducción no dependen del reproductor sino de la disponibilidad del servicio de la propia emisora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre escuchar radio online y la radio en AM/FM tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La radio online usa conexión a internet para transmitir el audio en formato digital (streaming), lo que permite una calidad de sonido más estable y acceder a emisoras de cualquier país sin limitaciones geográficas. La radio AM/FM usa ondas hertzianas y requiere un receptor físico, pero no consume datos de internet y funciona sin cobertura de red.',
      },
    },
  ],
};
