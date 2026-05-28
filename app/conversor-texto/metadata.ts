import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Texto - Mayúsculas, Minúsculas, Invertir | meskeIA',
  description: 'Convierte texto a mayúsculas, minúsculas, capitalizado, formato título, invertido. Elimina acentos y espacios extra. Gratis, privado y sin registro.',
  keywords: 'conversor texto, mayusculas, minusculas, capitalizar, invertir texto, formato titulo, eliminar acentos, text converter, transformar texto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Texto Online - Transformaciones de texto',
    description: 'Transforma tu texto: mayúsculas, minúsculas, capitalizado, invertido, sin acentos y más.',
    url: 'https://meskeia.com/conversor-texto/',
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
    title: 'Conversor de Texto | meskeIA',
    description: 'Convierte texto a diferentes formatos: mayúsculas, minúsculas, invertido y más',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Texto",
  description: "Convierte texto a mayúsculas, minúsculas, capitalizado, formato título, invertido. Elimina acentos y espacios extra. Gratis, privado y sin registro.",
  url: "https://meskeia.com/conversor-texto/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué transformaciones de texto puedo hacer con un conversor online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un conversor de texto online permite aplicar transformaciones como convertir a mayúsculas o minúsculas completas, capitalizar la primera letra de cada palabra (formato título), invertir el orden de los caracteres, alternar mayúsculas y minúsculas, eliminar acentos y tildes, o comprimir espacios múltiples en uno solo. Todas las operaciones se realizan al instante en el navegador, sin enviar datos a ningún servidor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo convierto texto a mayúsculas o minúsculas rápidamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pega o escribe el texto en el área de entrada y selecciona la transformación deseada: "MAYÚSCULAS" para convertir todo a mayúsculas, o "minúsculas" para el efecto contrario. El resultado aparece de forma inmediata y puedes copiarlo con un clic. No es necesario instalar ninguna extensión ni crear una cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve eliminar los acentos de un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Eliminar acentos es útil cuando el texto de destino no admite caracteres Unicode o acentuados, como ciertos sistemas legacy, nombres de archivo, identificadores de código, URLs o formularios de importación en bases de datos. También se usa para normalizar texto antes de compararlo o indexarlo, evitando que "café" y "cafe" se traten como palabras distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué casos necesito un conversor de texto en lugar de hacerlo a mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el texto es largo (cientos o miles de palabras) o cuando la transformación afecta a muchas palabras a la vez, hacerlo a mano en un procesador de textos es lento o propenso a errores. Un conversor especializado procesa cualquier volumen de texto en milisegundos y aplica la transformación de forma uniforme sin excepciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El texto que pego en el conversor queda guardado o es privado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las transformaciones se ejecutan íntegramente en el navegador del usuario, sin que el texto viaje a ningún servidor. Nada de lo que escribas o pegues queda almacenado ni es accesible por terceros. Al cerrar la pestaña, el contenido desaparece por completo.',
      },
    },
  ],
};
