import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Autómata a Pila (AFP / PDA) | meskeIA',
  description:
    'Simula un autómata a pila (AFP o PDA) paso a paso: edita la tabla de transiciones, elige aceptar por estado final o por pila vacía y observa cómo crece y decrece la pila con cadenas como aⁿbⁿ o palíndromos. Con exploración no determinista de todos los caminos.',
  keywords:
    'autómata a pila, AFP, PDA, pushdown automata, lenguajes independientes del contexto, lenguajes libres de contexto, a^n b^n, aceptación por pila vacía, no determinismo, gramáticas libres de contexto, jerarquía de Chomsky, teoría de la computación, analizador sintáctico',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-automata-pila/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Autómata a Pila (AFP / PDA) | meskeIA',
    description:
      'Edita las transiciones, prueba una cadena y sigue la pila paso a paso. Reconoce aⁿbⁿ y palíndromos, que un autómata finito no puede.',
    url: 'https://meskeia.com/simulador-automata-pila/',
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
    title: 'Simulador de Autómata a Pila (AFP / PDA) | meskeIA',
    description: 'La pila que un autómata finito no tiene: aⁿbⁿ, palíndromos y traza paso a paso.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Autómata a Pila (AFP / PDA)',
  description:
    'Simulador interactivo de autómatas a pila con tabla de transiciones editable, los dos criterios de aceptación (estado final y pila vacía) y traza paso a paso de la pila. Explora todos los caminos posibles, así que reconoce correctamente lenguajes no deterministas como los palíndromos.',
  url: 'https://meskeia.com/simulador-automata-pila/',
  category: 'EducationalApplication',
  features: [
    'Tabla de transiciones editable con estado, entrada, cima, destino y lo que se apila',
    'Símbolo ε insertable con un botón, tanto en la entrada como en la pila',
    'Los dos criterios de aceptación: por estado final y por pila vacía',
    'Exploración no determinista en anchura: acepta si existe algún camino',
    'Traza paso a paso con la pila dibujada verticalmente, la cima arriba',
    'Aviso explícito cuando la exploración se trunca y la respuesta no es concluyente',
    'Tres ejemplos clásicos: aⁿbⁿ por estado final, aⁿbⁿ por pila vacía y palíndromos pares',
    'En español y sin registro',
  ],
  keywords: [
    'autómata a pila',
    'PDA',
    'pushdown automata',
    'lenguajes independientes del contexto',
    'a^n b^n',
    'jerarquía de Chomsky',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un autómata a pila y en qué se diferencia de un autómata finito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un autómata a pila (AFP, o PDA por pushdown automaton) es un autómata finito al que se le añade una memoria auxiliar con forma de pila: en cada transición mira el símbolo de entrada y también el símbolo que hay en la cima, y puede apilar, desapilar o dejar la pila igual. Esa pila es memoria ilimitada pero de acceso restringido, y es exactamente lo que le falta a un autómata finito, cuya única memoria es el estado en el que está. Con ella reconoce los lenguajes independientes del contexto, un nivel por encima de los regulares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el lenguaje aⁿbⁿ no es regular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque para comprobar que hay tantas «a» como «b» hay que contar sin límite, y un autómata finito con k estados solo distingue k situaciones. El lema del bombeo lo formaliza: si aⁿbⁿ fuera regular existiría una longitud p tal que la cadena a^p b^p podría partirse en xyz con y no vacía dentro del bloque de aes, y repetir y daría más aes que bes, una cadena que ya no pertenece al lenguaje. Con una pila el problema desaparece: se apila un símbolo por cada «a» y se desapila uno por cada «b».',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre aceptar por estado final y aceptar por pila vacía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por estado final se acepta cuando se ha consumido toda la entrada y el autómata está en un estado marcado como final, sin importar qué quede en la pila. Por pila vacía se acepta cuando se ha consumido toda la entrada y la pila ha quedado completamente vacía, incluido el símbolo de fondo, y entonces los estados finales no pintan nada. Las dos definiciones tienen la misma potencia: dado un autómata de un tipo se construye mecánicamente otro del otro tipo que reconoce el mismo lenguaje, añadiendo un símbolo de fondo nuevo y un estado que lo vacía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un autómata a pila necesita ser no determinista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque hay lenguajes independientes del contexto que ningún autómata a pila determinista reconoce, y el ejemplo típico son los palíndromos pares ww^R: el autómata tiene que adivinar en qué punto exacto termina la primera mitad y empieza la segunda, y esa decisión no puede tomarla mirando solo el símbolo actual y la cima. Por eso simular un AFP no es ejecutar un camino, sino explorar el árbol de todos los caminos posibles: la cadena se acepta si existe al menos uno que llegue al final, y se rechaza solo cuando fallan todos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven los autómatas a pila en un compilador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El análisis léxico de un compilador se hace con autómatas finitos, pero el análisis sintáctico necesita emparejar estructuras anidadas —paréntesis, llaves, bloques begin/end, expresiones aritméticas— y eso es justo lo que un autómata finito no puede hacer. Los autómatas a pila son equivalentes a las gramáticas independientes del contexto con las que se describe la sintaxis de un lenguaje de programación, y los analizadores LL y LR que generan herramientas como Yacc, Bison o ANTLR son autómatas a pila deterministas en la práctica.',
      },
    },
  ],
};
