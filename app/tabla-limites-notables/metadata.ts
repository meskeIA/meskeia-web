import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Límites Notables — Todas las Fórmulas con Ejemplos | meskeIA',
  description:
    'Tabla de límites notables con buscador instantáneo: trigonométricos, exponenciales y logarítmicos, el número e, las 7 indeterminaciones, equivalencias infinitesimales, jerarquía de infinitos y sucesiones, con justificación y ejemplo resuelto.',
  keywords:
    'límites notables, tabla de límites, equivalencias infinitesimales, infinitésimos equivalentes, indeterminaciones, límite sen x / x, número e, regla de L’Hôpital, jerarquía de infinitos, criterio de Stolz, cálculo, límites de sucesiones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-limites-notables/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Límites Notables y Equivalencias Infinitesimales | meskeIA',
    description:
      'Consulta cualquier límite notable en segundos: escribe «sen», «indeterminación» o «número e» y aparece la fórmula, por qué vale eso y un ejemplo resuelto paso a paso.',
    url: 'https://meskeia.com/tabla-limites-notables/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Límites Notables y Equivalencias Infinitesimales | meskeIA',
    description:
      'Formulario de límites notables con búsqueda instantánea, las 7 indeterminaciones con su técnica y la regla de oro de los infinitésimos equivalentes.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Límites Notables meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Límites Notables y Equivalencias Infinitesimales',
  description:
    'Formulario de consulta rápida de límites notables: trigonométricos, exponenciales y logarítmicos, el número e, las siete indeterminaciones con su técnica de resolución, equivalencias infinitesimales, comparación de infinitos y límites de sucesiones. Cada entrada incluye la justificación de por qué vale eso y un ejemplo resuelto paso a paso.',
  url: 'https://meskeia.com/tabla-limites-notables/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por nombre, expresión y sinónimos, tolerante a acentos',
    'Límites notables organizados en 7 categorías filtrables',
    'Las siete indeterminaciones con la técnica concreta para resolver cada una',
    'Tabla de equivalencias infinitesimales con la regla de uso y su contraejemplo',
    'Justificación en lenguaje llano de cada límite: geometría, Taylor o cambio de variable',
    'Ejemplo resuelto paso a paso en cada fila desplegable',
    'Jerarquía de infinitos y criterios para sucesiones (cociente, Stolz, raíz n-ésima)',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: [
    'límites notables',
    'equivalencias infinitesimales',
    'indeterminaciones',
    'número e',
    'cálculo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué el límite de sen x / x cuando x tiende a 0 vale 1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque para ángulos pequeños medidos en radianes el arco y su seno son casi iguales. La demostración clásica compara tres áreas en la circunferencia unidad: el triángulo interior, el sector circular y el triángulo exterior, lo que da cos x < sen x / x < 1; al hacer x → 0 el teorema del sándwich fuerza el valor 1. Solo es cierto en radianes: en grados el límite valdría π/180 ≈ 0,01745.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las siete indeterminaciones y cómo se resuelven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son 0/0, ∞/∞, 0·∞, ∞−∞, 1^∞, 0⁰ e ∞⁰. Las dos primeras admiten directamente la regla de L’Hôpital, factorización o infinitésimos equivalentes. Las de tipo producto y resta (0·∞ y ∞−∞) se transforman en cociente operando, sacando factor común o multiplicando por el conjugado. Las tres exponenciales (1^∞, 0⁰ e ∞⁰) se resuelven tomando logaritmos, y para 1^∞ existe además la fórmula directa e elevado al límite de g·(f−1).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se pueden usar las equivalencias infinitesimales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo dentro de productos y cocientes, nunca sustituyendo un sumando de una suma o de una resta. Por ejemplo, en el límite de (x − sen x)/x³ cuando x → 0, cambiar sen x por x daría 0, cuando el valor correcto es 1/6. La razón es que en la resta se cancelan los términos principales y el resultado lo decide el término siguiente del desarrollo, que la equivalencia ha descartado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué crece más deprisa, el logaritmo, la potencia o la exponencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jerarquía cuando la variable tiende a infinito es: logaritmo ≪ potencia ≪ exponencial ≪ factorial ≪ x elevado a x. Esto significa que el cociente de cualquier término entre otro situado a su derecha tiende a 0. En la práctica permite resolver de un vistazo límites como (ln x)¹⁰⁰ / x, que vale 0, o x¹⁰⁰⁰ / 2^x, que también vale 0.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula un límite de tipo 1 elevado a infinito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si f(x) → 1 y g(x) → ∞, el límite de f(x) elevado a g(x) es e elevado al límite de g(x)·(f(x) − 1). Es la generalización de (1 + 1/x)^x → e. Por ejemplo, para (1 + 3/x)^(2x) el exponente es 2x·(3/x) = 6, así que el resultado es e⁶. La alternativa siempre válida es tomar logaritmos y resolver el límite resultante, que es de tipo 0·∞.',
      },
    },
  ],
};
