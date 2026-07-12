import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Seguridad digital práctica. "Contraseña" es universal; "clave" se usa en Latam →
// se incluye de forma aditiva en keywords. No es fiscal-España, sin RegionBadge.

export const metadata: Metadata = {
  title: 'Evaluador de Fortaleza de Contraseñas — ¿Es Segura tu Clave? - meskeIA',
  description:
    'Comprueba lo segura que es tu contraseña: entropía en bits, tiempo estimado de descifrado y errores comunes. Todo se calcula en tu navegador, nada se envía a ningún servidor.',
  keywords:
    'evaluador contraseñas, fortaleza contraseña, seguridad contraseña, comprobar contraseña segura, medidor contraseñas, test contraseña, clave segura, entropía contraseña, tiempo descifrar contraseña, contraseña fuerte',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Evaluador de Fortaleza de Contraseñas — Comprueba si tu clave es segura',
    description:
      'Mide la fortaleza de tu contraseña con entropía, tiempo de descifrado y detección de patrones débiles. 100% en tu navegador, sin registro y sin enviar nada.',
    url: 'https://meskeia.com/evaluador-fortaleza-contrasena/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evaluador de Fortaleza de Contraseñas',
    description:
      'Comprueba si tu contraseña es segura: entropía, tiempo de descifrado y errores comunes. Todo local, nada se envía a servidores.',
  },
  other: {
    'application-name': 'Evaluador de Contraseñas meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Evaluador de Fortaleza de Contraseñas',
  description:
    'Herramienta para medir la seguridad de una contraseña. Calcula la entropía en bits a partir del conjunto de caracteres y la longitud, estima el tiempo que tardaría un ataque de fuerza bruta en descifrarla, detecta patrones débiles (secuencias, repeticiones, años, teclado) y comprueba si figura entre las contraseñas más filtradas. Devuelve un nivel de fortaleza y consejos accionables. Todo el análisis ocurre en el navegador: la contraseña nunca se envía a ningún servidor.',
  url: 'https://meskeia.com/evaluador-fortaleza-contrasena/',
  category: 'UtilityApplication',
  features: [
    'Cálculo de entropía en bits según conjunto de caracteres y longitud',
    'Estimación del tiempo de descifrado por fuerza bruta (varios escenarios de ataque)',
    'Detección de patrones débiles: secuencias, repeticiones, teclado, años y palabras comunes',
    'Comprobación contra una lista de contraseñas más filtradas del mundo',
    'Nivel de fortaleza en 5 tramos con consejos personalizados para mejorar',
    'Privacidad total: todo se calcula en tu navegador, sin enviar nada a servidores',
    'Gratuito, sin registro y sin publicidad',
  ],
  keywords: [
    'evaluador contraseñas',
    'fortaleza contraseña',
    'comprobar contraseña segura',
    'entropía contraseña',
    'clave segura',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué hace segura a una contraseña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sobre todo la longitud y la imprevisibilidad. Una contraseña larga y aleatoria genera muchísimas combinaciones posibles, lo que se mide como entropía (en bits): por debajo de 40 bits es débil, por encima de 70-80 bits es muy fuerte. La complejidad de símbolos ayuda menos que añadir longitud: una frase larga de palabras al azar suele ser más segura que "P@ssw0rd!".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro escribir mi contraseña real aquí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El análisis se ejecuta íntegramente en tu navegador con JavaScript: la contraseña no se envía a ningún servidor, no se guarda y no sale de tu dispositivo. Aun así, como norma general de seguridad, para tu contraseña real más crítica evita escribirla en webs desconocidas; puedes probar variantes equivalentes para hacerte una idea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la entropía de una contraseña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La entropía mide la incertidumbre de una contraseña en bits: cuántas combinaciones tendría que probar un atacante de media. Se calcula a partir del tamaño del conjunto de caracteres usados (minúsculas, mayúsculas, dígitos, símbolos) y la longitud. Cada bit adicional duplica el número de combinaciones, por eso alargar la contraseña es tan efectivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se tarda en descifrar una contraseña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la fortaleza y de la potencia del atacante. Un equipo moderno puede probar miles de millones de combinaciones por segundo contra un hash rápido. Una contraseña de 8 caracteres solo con minúsculas cae en segundos; una de 16 caracteres con mayúsculas, dígitos y símbolos puede resistir siglos. La herramienta muestra estimaciones para distintos escenarios de ataque.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo usar un gestor de contraseñas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Un gestor de contraseñas genera y guarda claves largas y únicas para cada servicio, de modo que no tienes que recordarlas ni reutilizarlas. Reutilizar la misma contraseña es uno de los mayores riesgos: si se filtra en un sitio, los atacantes la prueban en todos los demás. Combínalo siempre con la verificación en dos pasos (2FA).',
      },
    },
  ],
};
