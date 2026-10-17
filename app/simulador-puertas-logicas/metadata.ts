import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Compuertas Lógicas (Puertas) - AND, OR, NOT, XOR | meskeIA',
  description: 'Simulador de puertas lógicas y compuertas lógicas online: tablas de verdad, circuitos predefinidos (Half Adder, Full Adder, Multiplexor) y expresiones booleanas. Para electrónica digital.',
  keywords: 'simulador de compuertas lógicas, simulador de puertas lógicas, compuertas lógicas, puertas lógicas, AND, OR, NOT, NAND, NOR, XOR, XNOR, tabla de verdad, circuitos digitales, electrónica digital, álgebra booleana, half adder, full adder, multiplexor, simulador, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-puertas-logicas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Puertas Lógicas (Compuertas) | meskeIA',
    description: 'Tablas de verdad, circuitos predefinidos y expresiones booleanas. Puertas o compuertas lógicas para estudiantes de electrónica digital.',
    url: 'https://meskeia.com/simulador-puertas-logicas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Puertas Lógicas (Compuertas) | meskeIA',
    description: 'Simula puertas o compuertas lógicas, genera tablas de verdad y prueba circuitos digitales.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Puertas Lógicas (Compuertas)',
  description: 'Simulador interactivo de puertas lógicas, también llamadas compuertas lógicas (AND, OR, NOT, NAND, NOR, XOR, XNOR), con tablas de verdad, circuitos digitales predefinidos (Half Adder, Full Adder, Multiplexor) y evaluador de expresiones booleanas.',
  url: 'https://meskeia.com/simulador-puertas-logicas/',
  category: 'EducationalApplication',
  // Hallazgo 3358 (16/10/2026): prometía una «visualización paso a paso de la propagación de
  // señales» que ningún modo hace. Cada línea dice ahora algo que la app hace, visto en ella.
  features: [
    'Tablas de verdad y símbolo de las 7 puertas: AND, OR, NOT, NAND, NOR, XOR y XNOR',
    'Cinco circuitos con entradas conmutables y salidas al instante: semisumador, sumador completo, multiplexor 2:1, comparador de 1 bit y decodificador 2:4',
    'Tabla completa de cada circuito con la fila de las entradas actuales resaltada',
    'Evaluador de expresiones booleanas de hasta 4 variables (A-D), con palabras o con símbolos',
    'Avisos que explican por qué una expresión no es válida',
    '9 retos: encontrar la expresión que produce una tabla dada, con corrección fila a fila y recuento de operadores',
    'Retos con puertas restringidas (solo NAND o solo NOR), con pista y solución de referencia',
  ],
  keywords: ['compuertas lógicas', 'puertas lógicas', 'electrónica digital', 'álgebra booleana', 'tablas verdad', 'universidad', 'FP'],
});

/**
 * Las 6 preguntas que se publican en DOS bocas: el FAQPage de abajo y la FAQ visible de
 * `page.tsx`, que las importa. Hallazgo 3359 (16/10/2026): estaban escritas dos veces a mano y
 * 4 de 6 ya divergían (una incluso con otro enunciado). §1.ter: nunca escribirla dos veces.
 * La FAQ visible añade un consejo propio debajo de cada una, y tres preguntas más que no van al
 * FAQPage.
 */
export const PREGUNTAS_FRECUENTES = {
  puertaCompuerta: {
    pregunta: '¿Es lo mismo una puerta lógica que una compuerta lógica?',
    respuesta: 'Sí, son exactamente el mismo componente: un circuito que recibe una o varias entradas binarias (0 y 1) y devuelve una salida según una operación lógica (AND, OR, NOT...). La diferencia es solo el término regional: en España se dice «puerta lógica» y en buena parte de Hispanoamérica (México, Colombia, Argentina...) se dice «compuerta lógica». Ambas traducen el inglés «logic gate».',
  },
  algebraBoole: {
    pregunta: '¿Qué es el Álgebra de Boole y para qué sirve?',
    respuesta: 'El Álgebra de Boole (1854) es el sistema matemático que describe los circuitos digitales. Trabaja con solo dos valores (0 y 1) y tres operaciones básicas (AND, OR, NOT). Permite simplificar expresiones lógicas para reducir el número de puertas y ahorrar coste, energía y espacio en silicio.',
  },
  universales: {
    pregunta: '¿Por qué NAND y NOR se llaman puertas universales?',
    respuesta: 'Porque cualquier función lógica puede implementarse usando únicamente puertas NAND (o únicamente NOR). NOT(A) = A NAND A; AND(A,B) = NOT(A NAND B); OR(A,B) = (NOT A) NAND (NOT B). Los fabricantes de chips simplifican la producción usando una sola celda estándar.',
  },
  tablaVerdad: {
    pregunta: '¿Qué es una tabla de verdad y cómo se construye?',
    respuesta: 'Una tabla de verdad lista todas las combinaciones posibles de entradas (2^n filas para n entradas) y la salida correspondiente. Para 2 entradas hay 4 filas (00, 01, 10, 11). Para 3 entradas: 8 filas. Para 10 entradas: 1024 filas.',
  },
  xorXnor: {
    pregunta: '¿Qué diferencia hay entre XOR y XNOR?',
    respuesta: 'XOR da salida 1 cuando las entradas son DIFERENTES. XNOR da 1 cuando son IGUALES. Son complementarias: si A XOR B = Y, entonces A XNOR B = NOT(Y). XOR se usa en sumadores y detectores de paridad; XNOR en comparadores de igualdad.',
  },
  hardware: {
    pregunta: '¿Cómo se implementan las puertas lógicas en hardware real?',
    respuesta: 'Las puertas lógicas se implementan con transistores CMOS. Una puerta NAND básica usa 4 transistores (2 NMOS en serie + 2 PMOS en paralelo). Los microprocesadores modernos contienen miles de millones de transistores operando a frecuencias de varios GHz.',
  },
} as const;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: Object.values(PREGUNTAS_FRECUENTES).map(({ pregunta, respuesta }) => ({
    '@type': 'Question',
    name: pregunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: respuesta,
    },
  })),
};
