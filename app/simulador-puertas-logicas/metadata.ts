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
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Puertas Lógicas (Compuertas) | meskeIA',
    description: 'Simula puertas o compuertas lógicas, genera tablas de verdad y prueba circuitos digitales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Puertas Lógicas (Compuertas)',
  description: 'Simulador interactivo de puertas lógicas, también llamadas compuertas lógicas (AND, OR, NOT, NAND, NOR, XOR, XNOR), con tablas de verdad, circuitos digitales predefinidos (Half Adder, Full Adder, Multiplexor) y evaluador de expresiones booleanas.',
  url: 'https://meskeia.com/simulador-puertas-logicas/',
  category: 'EducationalApplication',
  features: [
    'Simulador interactivo de 7 tipos de puertas lógicas',
    'Tablas de verdad generadas automáticamente',
    'Circuitos predefinidos: Half Adder, Full Adder, Multiplexor',
    'Evaluador de expresiones booleanas',
    'Visualización paso a paso de la propagación de señales',
    'En español',
  ],
  keywords: ['compuertas lógicas', 'puertas lógicas', 'electrónica digital', 'álgebra booleana', 'tablas verdad', 'universidad', 'FP'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Es lo mismo una puerta lógica que una compuerta lógica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, son exactamente el mismo componente: un circuito que recibe una o varias entradas binarias (0 y 1) y devuelve una salida según una operación lógica (AND, OR, NOT...). La diferencia es solo el término regional: en España se dice "puerta lógica" y en gran parte de Hispanoamérica (México, Colombia, Argentina...) se dice "compuerta lógica". Ambas traducen el inglés "logic gate".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Álgebra de Boole y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Álgebra de Boole (1854) es el sistema matemático que describe los circuitos digitales. Trabaja con solo dos valores (0 y 1) y tres operaciones básicas (AND, OR, NOT). Permite simplificar expresiones lógicas para reducir el número de puertas y ahorrar coste, energía y espacio en silicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué NAND y NOR se llaman puertas universales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque cualquier función lógica puede implementarse usando únicamente puertas NAND (o únicamente NOR). NOT(A) = A NAND A; AND(A,B) = NOT(A NAND B); OR(A,B) = (NOT A) NAND (NOT B). Los fabricantes de chips simplifican la producción usando una sola celda estándar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una tabla de verdad y cómo se construye?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una tabla de verdad lista todas las combinaciones posibles de entradas (2^n filas para n entradas) y la salida correspondiente. Para 2 entradas hay 4 filas (00, 01, 10, 11). Para 3 entradas: 8 filas. Para 10 entradas: 1.024 filas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre XOR y XNOR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'XOR da salida 1 cuando las entradas son diferentes. XNOR da 1 cuando son iguales. Son complementarias: si A XOR B = Y, entonces A XNOR B = NOT(Y). XOR se usa en sumadores y detectores de paridad; XNOR en comparadores de igualdad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se implementan las puertas lógicas en hardware real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las puertas lógicas se implementan con transistores CMOS. Una puerta NAND básica usa 4 transistores (2 NMOS en serie + 2 PMOS en paralelo). Los microprocesadores modernos contienen miles de millones de transistores operando a frecuencias de varios GHz.',
      },
    },
  ],
};
