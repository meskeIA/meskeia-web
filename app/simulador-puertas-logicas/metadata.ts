import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema, combineSchemas } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Puertas Lógicas - AND, OR, NOT, NAND, XOR | meskeIA',
  description: 'Simulador interactivo de puertas lógicas y compuertas lógicas: tablas de verdad, circuitos predefinidos (Half Adder, Full Adder, Multiplexor) y expresiones booleanas. Para electrónica digital.',
  keywords: 'puertas lógicas, compuertas lógicas, AND, OR, NOT, NAND, NOR, XOR, XNOR, tabla de verdad, circuitos digitales, electrónica digital, álgebra booleana, half adder, full adder, multiplexor, simulador, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-puertas-logicas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Puertas Lógicas | meskeIA',
    description: 'Tablas de verdad, circuitos predefinidos y expresiones booleanas. Para estudiantes de electrónica digital.',
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
    title: 'Simulador de Puertas Lógicas | meskeIA',
    description: 'Simula puertas lógicas, genera tablas de verdad y prueba circuitos digitales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

const webAppSchema = generateWebAppSchema({
  name: 'Simulador de Puertas Lógicas',
  description: 'Simulador interactivo de puertas lógicas (AND, OR, NOT, NAND, NOR, XOR, XNOR) con tablas de verdad, circuitos digitales predefinidos (Half Adder, Full Adder, Multiplexor) y evaluador de expresiones booleanas.',
  url: 'https://meskeia.com/simulador-puertas-logicas/',
  category: 'EducationalApplication',
  features: [
    'Simulador interactivo de 7 tipos de puertas lógicas',
    'Tablas de verdad generadas automáticamente',
    'Circuitos predefinidos: Half Adder, Full Adder, Multiplexor',
    'Evaluador de expresiones booleanas',
    'Visualización paso a paso de la propagación de señales',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['puertas lógicas', 'electrónica digital', 'álgebra booleana', 'tablas verdad', 'universidad', 'FP'],
});

const faqSchema = generateFAQSchema({
  url: 'https://meskeia.com/simulador-puertas-logicas/',
  mainEntity: [
    {
      question: '¿Qué es el Álgebra de Boole y para qué sirve?',
      answer: 'El Álgebra de Boole (1854) es el sistema matemático que describe los circuitos digitales. Trabaja con solo dos valores (0 y 1) y tres operaciones básicas (AND, OR, NOT). Permite simplificar expresiones lógicas para reducir el número de puertas y ahorrar coste, energía y espacio en silicio.',
    },
    {
      question: '¿Por qué NAND y NOR se llaman puertas universales?',
      answer: 'Porque cualquier función lógica puede implementarse usando únicamente puertas NAND (o únicamente NOR). NOT(A) = A NAND A; AND(A,B) = NOT(A NAND B); OR(A,B) = (NOT A) NAND (NOT B). Los fabricantes de chips simplifican la producción usando una sola celda estándar.',
    },
    {
      question: '¿Qué es una tabla de verdad y cómo se construye?',
      answer: 'Una tabla de verdad lista todas las combinaciones posibles de entradas (2^n filas para n entradas) y la salida correspondiente. Para 2 entradas: 4 filas (00, 01, 10, 11). Para 3 entradas: 8 filas. Para 10 entradas: 1.024 filas.',
    },
    {
      question: '¿Qué diferencia hay entre XOR y XNOR?',
      answer: 'XOR da salida 1 cuando las entradas son DIFERENTES. XNOR da 1 cuando son IGUALES. Son complementarias: si A XOR B = Y, entonces A XNOR B = NOT(Y). XOR se usa en sumadores y detectores de paridad; XNOR en comparadores de igualdad.',
    },
    {
      question: '¿Cómo se aplican las Leyes de De Morgan?',
      answer: 'Primera ley: NOT(A AND B) = NOT(A) OR NOT(B). Segunda ley: NOT(A OR B) = NOT(A) AND NOT(B). Permiten convertir NAND en OR con entradas negadas y NOR en AND con entradas negadas. Son esenciales para simplificar circuitos.',
    },
    {
      question: '¿Qué es una expresión en Forma Normal Canónica?',
      answer: 'Existen dos formas: Suma de Minterms (SOP) y Producto de Maxterms (POS). SOP: para cada fila con salida 1, escribe el AND de variables y únelos con OR. Cualquier tabla de verdad puede expresarse en forma canónica.',
    },
    {
      question: '¿Para qué sirven los Mapas de Karnaugh?',
      answer: 'Los K-Maps son un método gráfico para simplificar expresiones booleanas. Organizan la tabla de verdad en cuadrícula donde celdas adyacentes difieren en una variable (código Gray). Agrupando celdas con valor 1 en potencias de 2, se obtiene la expresión mínima.',
    },
    {
      question: '¿Cómo se implementan las puertas en hardware real?',
      answer: 'Las puertas lógicas se implementan con transistores CMOS. Una puerta NAND básica usa 4 transistores (2 NMOS en serie + 2 PMOS en paralelo). Los microprocesadores modernos tienen miles de millones de transistores operando a frecuencias de GHz.',
    },
  ],
});

export const jsonLd = combineSchemas(webAppSchema, faqSchema);
