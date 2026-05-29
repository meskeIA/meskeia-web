import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cifrado AES Online - Cifrado Simétrico Moderno | meskeIA',
  description: 'Cifra y descifra textos con AES-256, el estándar de cifrado más seguro. Modos GCM y CBC, generación de claves, todo en tu navegador sin enviar datos.',
  keywords: 'aes, cifrado aes, aes-256, cifrado simetrico, encriptar, desencriptar, gcm, cbc, criptografia moderna, seguridad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado AES Online | meskeIA',
    description: 'Cifra textos con AES-256, el estándar de cifrado más seguro del mundo.',
    url: 'https://meskeia.com/cifrado-aes/',
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
    title: 'Cifrado AES | meskeIA',
    description: 'Cifrado AES-256 online, seguro y privado',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cifrado AES",
  description: "Cifra y descifra textos con AES-256, el estándar de cifrado más seguro. Modos GCM y CBC, generación de claves, todo en tu navegador sin enviar datos.",
  url: "https://meskeia.com/cifrado-aes/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es AES y por qué se considera el cifrado más seguro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AES (Advanced Encryption Standard) es un algoritmo de cifrado simétrico adoptado como estándar mundial por el NIST en 2001. Con clave de 256 bits, no existe ningún ataque práctico conocido capaz de romperlo: se necesitarían más operaciones que átomos hay en el universo observable. Es el algoritmo que usa la banca, los gobiernos y las comunicaciones HTTPS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el modo GCM y el modo CBC en AES?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GCM (Galois/Counter Mode) combina cifrado y autenticación en un solo paso: además de proteger la confidencialidad, verifica que el mensaje no ha sido manipulado. CBC (Cipher Block Chaining) solo cifra pero no autentica; es más antiguo y requiere un HMAC adicional para ser seguro. Para la mayoría de usos modernos se recomienda GCM.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los datos que introduzco se envían a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El cifrado se ejecuta completamente en tu navegador usando la Web Crypto API nativa. Ningún texto ni clave sale de tu dispositivo. Puedes verificarlo desconectando la red: la herramienta sigue funcionando sin conexión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve cifrar un texto con AES si ya uso HTTPS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HTTPS protege el transporte entre tu dispositivo y el servidor, pero el servidor puede leer tus datos en texto claro. El cifrado AES en el cliente protege el contenido antes de enviarlo, de modo que aunque el servidor sea comprometido o malicioso, los datos permanecen ilegibles sin la clave. Es el principio del cifrado de extremo a extremo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué longitud de clave debería usar y cómo la almaceno de forma segura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AES-256 (clave de 256 bits) es el estándar recomendado para datos sensibles; AES-128 sigue siendo seguro para uso general. Nunca almacenes la clave junto al texto cifrado. Las opciones habituales son derivarla de una contraseña con PBKDF2 o Argon2, o guardarla en un gestor de contraseñas separado del archivo cifrado.',
      },
    },
  ],
};
