import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Hashes Online - MD5, SHA-256, SHA-512 | meskeIA',
  description: 'Genera hashes MD5, SHA-256 y SHA-512 de textos y archivos. Verifica integridad de datos, compara checksums y aprende sobre funciones hash criptográficas.',
  keywords: 'hash, md5, sha256, sha512, sha-256, sha-512, checksum, integridad, verificar archivo, hash online, criptografia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Hashes Online - MD5, SHA-256, SHA-512 | meskeIA',
    description: 'Genera hashes MD5, SHA-256 y SHA-512 para verificar integridad de datos.',
    url: 'https://meskeia.com/generador-hashes/',
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
    title: 'Generador de Hashes - MD5, SHA-256, SHA-512',
    description: 'Genera y verifica hashes criptográficos de textos y archivos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Hashes",
  description: "Genera hashes MD5, SHA-256 y SHA-512 de textos y archivos. Verifica integridad de datos, compara checksums y aprende sobre funciones hash criptográficas.",
  url: "https://meskeia.com/generador-hashes/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un hash criptográfico y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un hash criptográfico es una función matemática que transforma cualquier cantidad de datos en una cadena de longitud fija (por ejemplo, 64 caracteres hexadecimales en SHA-256). Es determinista —el mismo texto siempre produce el mismo hash— e irreversible: no se puede reconstruir el original a partir del hash. Se usa para verificar integridad de archivos, almacenar contraseñas y firmar documentos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre MD5, SHA-256 y SHA-512?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MD5 produce 128 bits (32 caracteres hex) y está considerado inseguro para usos criptográficos porque se pueden generar colisiones artificialmente; solo sirve para checksums de integridad no críticos. SHA-256 produce 256 bits y es el estándar recomendado actualmente para la mayoría de aplicaciones. SHA-512 produce 512 bits y es más resistente, útil cuando se necesita margen de seguridad extra a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo verifico que un archivo descargado no ha sido modificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sitio oficial del software suele publicar el hash SHA-256 del archivo junto al enlace de descarga. Descarga el archivo, arrástralo a esta herramienta y compara el hash generado con el publicado: si coinciden carácter a carácter, el archivo es íntegro. Cualquier diferencia, por mínima que sea, indica que el archivo fue alterado o corrompido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede revertir un hash para obtener el texto original?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, por diseño. Los algoritmos hash son funciones de un solo sentido: computacionalmente es inviable reconstruir la entrada a partir del hash. Lo que sí es posible son los ataques de diccionario o tablas rainbow para textos cortos y predecibles, razón por la cual las contraseñas nunca deben hashearse directamente con SHA-256 sino con funciones específicas como bcrypt, scrypt o Argon2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un hash y un checksum como CRC32?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un checksum como CRC32 está diseñado para detectar errores accidentales de transmisión, pero no ofrece resistencia criptográfica: es trivial modificar un archivo y mantener el mismo CRC32. Los hashes criptográficos (SHA-256, SHA-512) están diseñados para resistir manipulaciones intencionales, por lo que son adecuados tanto para integridad como para autenticación digital.',
      },
    },
  ],
};
