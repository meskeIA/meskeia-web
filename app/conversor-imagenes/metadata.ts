import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Imágenes - JPG, PNG, WebP | meskeIA',
  description: 'Convierte imágenes entre JPG, PNG y WebP. Redimensiona, comprime y ajusta la calidad. Presets para redes sociales Instagram, Facebook, Twitter.',
  keywords: 'conversor imagenes, convertir jpg png, webp, redimensionar imagen, comprimir imagen, instagram, facebook',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Imágenes',
    description: 'Convierte imágenes entre JPG, PNG y WebP. Redimensiona y comprime.',
    url: 'https://meskeia.com/conversor-imagenes/',
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
    title: 'Conversor de Imágenes',
    description: 'Convierte y redimensiona imágenes online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Imágenes",
  description: "Convierte imágenes entre JPG, PNG y WebP. Redimensiona, comprime y ajusta la calidad. Presets para redes sociales Instagram, Facebook, Twitter.",
  url: "https://meskeia.com/conversor-imagenes/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre JPG, PNG y WebP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JPG usa compresión con pérdida de calidad y es ideal para fotografías; genera archivos pequeños pero no admite transparencia. PNG usa compresión sin pérdida y admite transparencia, por lo que es mejor para logotipos, capturas de pantalla e imágenes con texto. WebP es un formato moderno de Google que ofrece archivos un 25-35% más ligeros que JPG o PNG con calidad similar, y también admite transparencia y animación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dimensiones necesitan las imágenes para Instagram, Facebook y Twitter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las dimensiones recomendadas son: Instagram cuadrado 1080×1080 px, Instagram historia 1080×1920 px; Facebook portada 820×312 px, publicación 1200×630 px; X (Twitter) cabecera 1500×500 px, publicación 1200×675 px. Usar las dimensiones exactas evita que la red social recorte o estire la imagen automáticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Pierdo calidad al convertir una imagen de JPG a PNG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al convertir de JPG a PNG no se recupera la calidad perdida en la compresión original de JPG, pero tampoco se produce nueva pérdida. El archivo PNG resultante conservará exactamente los píxeles del JPG de entrada. Si quieres la máxima calidad, parte siempre de la imagen original sin comprimir; convertir entre formatos no restaura información que ya se descartó.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo redimensionar una imagen sin que se deforme?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para redimensionar sin deformar hay que mantener la proporción de aspecto (aspect ratio). Si conoces el ancho deseado, calcula la altura como: altura_nueva = altura_original × (ancho_nuevo / ancho_original). La mayoría de conversores tienen una opción de "mantener proporciones" que hace este cálculo automáticamente cuando introduces solo una dimensión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las imágenes se suben a algún servidor al convertirlas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando la conversión se realiza en el navegador (client-side), las imágenes no salen de tu dispositivo: el procesamiento ocurre localmente usando la API Canvas de HTML5. Esto garantiza privacidad total y funcionamiento sin conexión a internet una vez cargada la página. Si la herramienta usa un servidor externo, los archivos sí se transmiten, así que conviene revisar la política de privacidad.',
      },
    },
  ],
};
