import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Seguridad digital / educativo. Ejemplos universales (banco, paquetería, redes)
// válidos para todo el público hispanohablante. No es fiscal-España, sin RegionBadge.

export const metadata: Metadata = {
  title: 'Test ¿Es Phishing? — Aprende a Detectar Estafas y Correos Falsos - meskeIA',
  description:
    'Pon a prueba tu ojo: ¿sabes distinguir un mensaje legítimo de un intento de phishing? Casos reales de correo, SMS y webs con explicación de cada señal de fraude. Gratis.',
  keywords:
    'test phishing, detectar phishing, reconocer phishing, correos falsos, estafas por correo, smishing, mensajes fraudulentos, señales de phishing, ejemplos de phishing, seguridad digital, fraude online, cómo detectar estafas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test ¿Es Phishing? — ¿Sabrías detectar el fraude?',
    description:
      'Un test interactivo con casos de correo, SMS y webs. Decide si es phishing o legítimo y aprende las señales que delatan cada estafa.',
    url: 'https://meskeia.com/test-phishing/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test ¿Es Phishing?',
    description:
      'Aprende a reconocer correos, SMS y webs fraudulentas con un test interactivo. Cada caso explica las señales del engaño.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Test ¿Es Phishing? meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Test ¿Es Phishing?',
  description:
    'Test interactivo para aprender a detectar el phishing. Presenta una serie de casos realistas (correos electrónicos, SMS, mensajes y páginas de acceso) y el usuario decide si son fraudulentos o legítimos. Tras cada respuesta se explican las señales concretas que delatan el engaño: dominios falsos, urgencia, remitentes sospechosos, enlaces disfrazados o peticiones de datos. Al final ofrece una puntuación y un perfil de tu capacidad para reconocer estafas. Educativo, sin registro y sin recoger datos personales.',
  url: 'https://meskeia.com/test-phishing/',
  category: 'EducationalApplication',
  features: [
    'Casos realistas de correo, SMS, mensajería y páginas de acceso falsas',
    'Feedback inmediato explicando las señales de fraude de cada caso',
    'Puntuación final y perfil de tu capacidad de detección',
    'Resumen educativo con las señales de phishing más frecuentes',
    'Ejemplos universales válidos para todo el público hispanohablante',
    'Sin registro, sin publicidad y sin recoger datos personales',
  ],
  keywords: [
    'test phishing',
    'detectar phishing',
    'reconocer estafas',
    'correos falsos',
    'seguridad digital',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el phishing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El phishing es una técnica de fraude en la que un atacante se hace pasar por una entidad de confianza (tu banco, una empresa de paquetería, una red social o un servicio público) para engañarte y conseguir que reveles datos sensibles —contraseñas, códigos, números de tarjeta— o que hagas clic en un enlace malicioso. Suele llegar por correo, SMS (smishing), llamada (vishing) o mensajería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reconocer un intento de phishing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales más habituales son: sensación de urgencia o amenaza ("tu cuenta se bloqueará en 24 horas"), remitentes y dominios que imitan a los reales con pequeñas variaciones, saludos genéricos, enlaces que apuntan a direcciones distintas de las que muestran, peticiones de datos que una empresa legítima nunca haría por ese canal, y faltas de ortografía o traducciones raras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hago si creo que he caído en un phishing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Actúa rápido: cambia de inmediato la contraseña del servicio afectado (y de cualquier otro donde la reutilizaras), activa la verificación en dos pasos, avisa a tu banco si compartiste datos financieros y revisa los movimientos de tus cuentas. Conserva el mensaje como prueba y repórtalo al servicio suplantado y a las autoridades de tu país.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el smishing del phishing por correo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mecanismo es el mismo, cambia el canal. El phishing clásico llega por correo electrónico; el smishing llega por SMS o mensajería, a menudo simulando avisos de paquetería, bancos o entregas. Los SMS resultan especialmente engañosos porque el espacio es corto, el enlace se ve acortado y en el móvil cuesta más comprobar la dirección real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Sirve de algo hacer un test de phishing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los estudios de concienciación en seguridad muestran que practicar con ejemplos reales mejora la capacidad de detectar fraudes, porque entrenas el ojo para fijarte en las señales correctas (el dominio, el tono de urgencia, el enlace) en lugar de en la apariencia del mensaje. Un test es una forma rápida y sin riesgo de hacer ese entrenamiento.',
      },
    },
  ],
};
