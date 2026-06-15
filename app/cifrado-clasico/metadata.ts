import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cifrado Clásico Online - César, ROT13 y Atbash | meskeIA',
  description: 'Cifrados clásicos gratuitos: César, ROT13 y Atbash. Encripta y descifra mensajes con métodos históricos. Visualización del alfabeto cifrado y explicaciones educativas.',
  keywords: 'cifrado cesar, rot13, atbash, cifrado clasico, encriptar mensaje, desencriptar, criptografia, cifrado julio cesar, cifrado hebreo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado Clásico Online - César, ROT13, Atbash | meskeIA',
    description: 'Encripta mensajes con cifrados históricos: César, ROT13 y Atbash. Aprende criptografía clásica.',
    url: 'https://meskeia.com/cifrado-clasico/',
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
    title: 'Cifrado Clásico Online - César, ROT13, Atbash',
    description: 'Encripta y descifra mensajes con métodos clásicos de criptografía.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cifrado Clásico",
  description: "Cifrados clásicos gratuitos: César, ROT13 y Atbash. Encripta y descifra mensajes con métodos históricos. Visualización del alfabeto cifrado y explicaciones educativas.",
  url: "https://meskeia.com/cifrado-clasico/",
  category: 'EducationalApplication',
  features: [
    'Cifrado César con desplazamiento configurable de 1 a 25 posiciones',
    'ROT13 simétrico: la misma acción cifra y descifra',
    'Cifrado Atbash: inversión completa del alfabeto (A↔Z, B↔Y…)',
    'Tabla comparativa del alfabeto original vs. cifrado en tiempo real',
    'Análisis de frecuencias con guía para romper el cifrado por fuerza bruta',
    'Exportación del resultado como código HTML embebible',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el cifrado César y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado César es uno de los métodos de encriptación más antiguos, atribuido a Julio César, quien lo usaba para sus comunicaciones militares. Consiste en desplazar cada letra del alfabeto un número fijo de posiciones. Por ejemplo, con desplazamiento 3, la A se convierte en D, la B en E, etc. Es un cifrado de sustitución monoalfabética muy sencillo de romper por análisis de frecuencia, pero excelente para aprender los fundamentos de la criptografía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es ROT13 y en qué se diferencia del cifrado César?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ROT13 (Rotate 13) es una variante especial del cifrado César con desplazamiento fijo de 13 posiciones. Su particularidad es que, al aplicarlo dos veces seguidas, se obtiene el texto original: cifrar y descifrar son la misma operación. Se usa habitualmente en foros de internet para ocultar spoilers o respuestas sin necesidad de contraseña. No ofrece seguridad real, pero es útil como ofuscación ligera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el cifrado Atbash y cuál es su origen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cifrado Atbash es un sistema de sustitución que invierte el alfabeto: la primera letra se convierte en la última, la segunda en la penúltima, etc. Su nombre proviene del hebreo (alef-tav-bet-shin) y se usaba en el alfabeto hebreo en textos bíblicos. Al igual que ROT13, es simétrico: aplicarlo dos veces devuelve el mensaje original. Aparece citado en el libro de Jeremías en la Biblia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son seguros los cifrados clásicos para proteger información real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Los cifrados clásicos (César, ROT13, Atbash) son totalmente inseguros para proteger información sensible. Pueden romperse en segundos mediante análisis de frecuencia o fuerza bruta, ya que solo tienen 25 posibles claves (César) o incluso ninguna (ROT13 y Atbash son deterministas). Para comunicaciones reales se usan algoritmos modernos como AES-256, RSA o criptografía de curva elíptica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve aprender criptografía clásica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cifrados clásicos son la base pedagógica de la criptografía moderna. Aprenderlos permite entender conceptos fundamentales como cifrado por sustitución, análisis de frecuencia, clave secreta y criptoanálisis. Forman parte del currículo de informática y matemáticas en bachillerato y primeros cursos universitarios, y son la introducción habitual a la ciberseguridad y la teoría de la información.',
      },
    },
  ],
};
