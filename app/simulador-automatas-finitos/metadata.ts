import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Autómatas Finitos DFA y NFA | meskeIA',
  description:
    'Simula autómatas finitos deterministas (DFA) y no deterministas (NFA) con editor visual. Diseña estados y transiciones, prueba cadenas y observa la ejecución animada. Lenguajes formales.',
  keywords:
    'autómatas finitos, DFA NFA, lenguajes regulares, expresiones regulares, ε-transiciones epsilon, teoría computación, lenguajes formales, FP informática, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-automatas-finitos/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Autómatas Finitos DFA y NFA | meskeIA',
    description: 'Editor visual de autómatas con animación de validación de cadenas',
    url: 'https://meskeia.com/simulador-automatas-finitos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Autómatas Finitos | meskeIA',
    description: 'Aprende lenguajes formales con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Autómatas Finitos DFA y NFA',
  description:
    'Simulador interactivo de autómatas finitos deterministas y no deterministas con editor visual. Diseña estados y transiciones, prueba cadenas, valida en lote y observa la animación símbolo a símbolo.',
  url: 'https://meskeia.com/simulador-automatas-finitos/',
  category: 'EducationalApplication',
  features: [
    'Editor visual de DFA y NFA con drag & drop',
    'Soporte para ε-transiciones (autómatas no deterministas)',
    'Validación animada de cadenas paso a paso',
    'Modo batch: validar múltiples cadenas a la vez',
    '4 ejemplos clásicos predefinidos',
    'Estados iniciales y finales configurables',
    'En español',
  ],
  keywords: ['autómatas finitos', 'DFA NFA', 'lenguajes formales', 'teoría computación'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un autómata finito y para qué se utiliza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un autómata finito es un modelo matemático que procesa una cadena de símbolos cambiando de estado según reglas de transición predefinidas. Acepta o rechaza la cadena dependiendo de si termina en un estado final. Se usan en compiladores para el análisis léxico (tokenización), en motores de expresiones regulares, en validación de formularios, en protocolos de red y en el diseño de circuitos digitales secuenciales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un DFA y un NFA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un DFA (Autómata Finito Determinista) cada par (estado, símbolo) tiene exactamente una transición definida; la ejecución es unívoca. En un NFA (Autómata Finito No Determinista) puede haber cero, una o varias transiciones para el mismo par, e incluso ε-transiciones que cambian de estado sin consumir símbolo. Aunque el NFA parece más potente, ambos reconocen exactamente los mismos lenguajes regulares; cualquier NFA puede convertirse en un DFA equivalente (construcción de subconjuntos).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las ε-transiciones en un autómata no determinista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una ε-transición (epsilon-transición) permite al autómata pasar de un estado a otro sin consumir ningún símbolo de la cadena de entrada. Son especialmente útiles al construir autómatas a partir de expresiones regulares (construcción de Thompson), ya que simplifican la unión, concatenación y cierre de Kleene. Para simular un NFA con ε-transiciones se calcula la ε-clausura de cada estado: el conjunto de estados alcanzables solo por ε-transiciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué lenguajes reconocen los autómatas finitos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los autómatas finitos reconocen exactamente los lenguajes regulares, el nivel más bajo de la jerarquía de Chomsky. Son los lenguajes describibles con expresiones regulares. No pueden reconocer lenguajes que requieren memoria ilimitada, como aⁿbⁿ (igual número de aes y bes) o los palíndromos de longitud arbitraria; esos necesitan autómatas de pila o máquinas de Turing. Los compiladores usan autómatas finitos en la fase de análisis léxico pero necesitan gramáticas de contexto libre para el análisis sintáctico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas es útil este simulador de autómatas finitos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una herramienta directa para Lenguajes Formales y Autómatas, Teoría de la Computación y Compiladores en grados de Informática, Matemáticas e Ingeniería. Los 4 ejemplos predefinidos cubren los ejercicios habituales de examen: autómata que acepta cadenas con número par de ceros, cadenas que terminan en "ab", etc. El modo batch permite probar rápidamente un banco de cadenas de prueba, lo que acelera la verificación de diseños propios.',
      },
    },
  ],
};
