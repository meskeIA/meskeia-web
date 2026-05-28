import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Avatares - Crea avatares únicos desde tu nombre | meskeIA',
  description: 'Genera avatares únicos y personalizados a partir de tu nombre o texto. 8 estilos diferentes, descarga PNG, sin subir fotos. 100% privado y gratuito.',
  keywords: 'generador avatares, avatar online, crear avatar, avatar desde nombre, identicon, avatar gratis, perfil, foto perfil, dicebear, gravatar alternativa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Avatares - Crea avatares únicos | meskeIA',
    description: 'Genera avatares únicos y personalizados a partir de tu nombre. 8 estilos, descarga PNG, 100% privado.',
    url: 'https://meskeia.com/generador-avatares/',
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
    title: 'Generador de Avatares | meskeIA',
    description: 'Crea avatares únicos desde tu nombre. 8 estilos, descarga PNG, sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Avatares meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Avatares",
  description: "Genera avatares únicos y personalizados a partir de tu nombre o texto. 8 estilos diferentes, descarga PNG, sin subir fotos. 100% privado y gratuito.",
  url: "https://meskeia.com/generador-avatares/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un generador de avatares y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de avatares crea imágenes de perfil únicas a partir de texto, como tu nombre o iniciales. Sirve para identificarte en plataformas digitales sin necesidad de subir una foto real. Es especialmente útil para proteger tu privacidad en foros, apps y redes sociales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la generación de avatares desde un nombre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El generador toma el texto que introduces (nombre, apodo o cualquier cadena) y aplica algoritmos de hash para producir un diseño visual consistente y único. El mismo texto siempre genera el mismo avatar, lo que lo hace identificable y reproducible en cualquier dispositivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un avatar generado y una foto de perfil real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un avatar generado no revela tu imagen personal, lo que protege tu anonimato en línea. A diferencia de una foto real, no requiere sesión fotográfica ni subir archivos; se crea al instante. Muchos servicios profesionales y comunidades técnicas usan avatares generados como Gravatar o identicons por su neutralidad visual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un generador de avatares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que necesite una imagen de perfil rápida sin exponer su rostro: desarrolladores que usan GitHub o Stack Overflow, usuarios de foros y comunidades online, personas que gestionan múltiples cuentas o quieren mantener su privacidad digital.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo descargar el avatar generado y usarlo en cualquier plataforma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los avatares se pueden descargar en formato PNG y usarse libremente en cualquier plataforma: redes sociales, aplicaciones de mensajería, herramientas de trabajo colaborativo o sitios web personales. Al ser imágenes estáticas, son compatibles con prácticamente cualquier servicio.',
      },
    },
  ],
};
