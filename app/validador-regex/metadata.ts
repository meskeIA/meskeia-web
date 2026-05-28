import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Validador de Expresiones Regulares (RegEx) | meskeIA',
  description: 'Testa y valida expresiones regulares online. Resaltado de coincidencias, flags interactivos y biblioteca de patrones comunes para email, teléfono, URL y más.',
  keywords: 'regex, expresiones regulares, validar regex, tester regex, patrones, programacion, javascript regex',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Validador de Expresiones Regulares',
    description: 'Testa y valida expresiones regulares con resaltado de coincidencias.',
    url: 'https://meskeia.com/validador-regex/',
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
    title: 'Validador RegEx',
    description: 'Testa expresiones regulares online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Validador RegEx",
  description: "Testa y valida expresiones regulares online. Resaltado de coincidencias, flags interactivos y biblioteca de patrones comunes para email, teléfono, URL y más.",
  url: "https://meskeia.com/validador-regex/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una expresión regular y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una expresión regular (regex) es una secuencia de caracteres que define un patrón de búsqueda. Se usa para validar formatos (emails, teléfonos, contraseñas), buscar y reemplazar texto en código, o extraer información de cadenas. Son compatibles con la mayoría de lenguajes de programación como JavaScript, Python, PHP, Java y muchos otros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un validador de expresiones regulares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un validador de regex permite escribir una expresión regular y probarla contra un texto de ejemplo en tiempo real. Resalta las coincidencias encontradas, muestra los grupos de captura y permite activar o desactivar flags como "g" (global), "i" (insensible a mayúsculas) o "m" (multilínea). Esto facilita depurar patrones complejos sin tener que ejecutar código.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los flags más habituales en expresiones regulares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los flags más comunes son: "g" (global, encuentra todas las coincidencias en lugar de solo la primera), "i" (ignora mayúsculas y minúsculas), "m" (multilínea, trata ^ y $ como inicio/fin de línea en lugar de todo el texto) y "s" (dotAll, hace que el punto . también coincida con saltos de línea). En JavaScript se añaden al final de la expresión: /patrón/gi.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el patrón regex para validar un correo electrónico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un patrón básico y ampliamente usado para emails es /^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$/. Verifica que haya caracteres antes del @, un dominio con punto y una extensión de al menos 2 letras. Para casos más complejos (etiquetas, dominios internacionales) se necesitan patrones más elaborados, aunque en producción suele ser más fiable enviar un email de verificación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un validador de regex online de usar la consola del navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un validador dedicado ofrece resaltado visual de coincidencias, desglose de grupos de captura, biblioteca de patrones predefinidos y retroalimentación inmediata sin necesidad de escribir código. La consola del navegador requiere ejecutar manualmente líneas como str.match(/patrón/g) y no muestra las coincidencias de forma gráfica. Para aprender o depurar patrones complejos, una herramienta visual es significativamente más rápida.',
      },
    },
  ],
};
