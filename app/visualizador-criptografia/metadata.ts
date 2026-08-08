import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Criptografía: AES, RSA, Firma Digital y HTTPS | meskeIA',
  description: 'Cómo funciona la criptografía: cifrado simétrico (AES), asimétrico (RSA, curvas elípticas), funciones hash (SHA-256), firma digital y el handshake TLS/HTTPS explicado visualmente.',
  keywords: ['criptografia', 'AES', 'RSA', 'SHA-256', 'firma digital', 'HTTPS', 'TLS', 'cifrado simetrico', 'clave publica', 'certificado digital'],
  openGraph: {
    title: 'Criptografía: AES, RSA, Firma Digital y HTTPS',
    description: 'AES, RSA, SHA-256, firma digital y TLS: cómo funciona la criptografía que protege tus datos cada día.',
    url: 'https://meskeia.com/visualizador-criptografia/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Criptografía - AES, RSA, ECDSA, SHA-256 y TLS",
  description: "Cómo funciona la criptografía: cifrado simétrico (AES), asimétrico (RSA, curvas elípticas), funciones hash (SHA-256), firma digital y el handshake TLS/HTTPS explicado visualmente.",
  url: "https://meskeia.com/visualizador-criptografia/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre cifrado simétrico y cifrado asimétrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el cifrado simétrico (como AES) se usa la misma clave para cifrar y descifrar; es muy rápido y adecuado para grandes volúmenes de datos, pero requiere que las dos partes compartan esa clave de forma segura de antemano. En el cifrado asimétrico (como RSA o ECDSA) cada persona tiene un par de claves: una pública, que puede compartir libremente, y una privada, que solo ella conoce. Lo que se cifra con la clave pública solo puede descifrarse con la clave privada correspondiente, lo que elimina el problema del intercambio seguro de claves.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es SHA-256 y para qué se usa una función hash?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SHA-256 es una función hash criptográfica que transforma cualquier cantidad de datos en una cadena de 256 bits (64 caracteres hexadecimales) de longitud fija. Es determinista (la misma entrada siempre produce la misma salida), irreversible (no se puede recuperar el original a partir del hash) y tiene efecto avalancha (un cambio mínimo en la entrada cambia completamente la salida). Se usa para verificar la integridad de archivos, almacenar contraseñas de forma segura, firmar digitalmente documentos y en la minería de Bitcoin.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el cifrado HTTPS cuando entro a una web segura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando tu navegador se conecta a un sitio HTTPS, se produce un handshake TLS: el servidor envía su certificado digital (que contiene su clave pública), el navegador verifica que está firmado por una autoridad de certificación de confianza y ambos negocian algoritmos y generan una clave de sesión simétrica mediante criptografía asimétrica. A partir de ese momento, toda la comunicación se cifra con esa clave de sesión usando AES, que es mucho más rápido que RSA para el flujo continuo de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una firma digital y cómo garantiza la autenticidad de un documento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una firma digital funciona al revés que el cifrado normal: el firmante calcula el hash del documento y lo cifra con su clave privada; ese cifrado es la firma. Cualquier persona puede verificarla descifrando la firma con la clave pública del firmante y comprobando que el hash resultante coincide con el del documento recibido. Si coinciden, se garantiza que el documento no ha sido alterado y que solo el poseedor de esa clave privada pudo firmarlo. Se usa en contratos electrónicos, facturas digitales y actualizaciones de software.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué RSA necesita claves de 2048 bits mientras que ECDSA funciona con 256 bits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RSA basa su seguridad en la dificultad de factorizar números enteros muy grandes; para que sea seguro frente a los ordenadores actuales se necesitan claves de al menos 2048 bits. ECDSA (criptografía de curva elíptica) se apoya en un problema matemático diferente y más complejo, el logaritmo discreto en curvas elípticas, lo que permite conseguir el mismo nivel de seguridad con claves mucho más cortas (256 bits equivalen aproximadamente a RSA de 3072 bits). Claves más cortas implican operaciones más rápidas y menor consumo energético, ventajas clave en dispositivos móviles y servidores de alta carga.',
      },
    },
  ],
};
