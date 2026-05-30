import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sistemas Numéricos - Binario, Octal, Decimal, Hexadecimal | meskeIA',
  description: 'Convierte números entre sistemas numéricos: binario, octal, decimal y hexadecimal. Muestra el proceso paso a paso. Incluye operaciones aritméticas y lógicas en binario.',
  keywords: 'calculadora binario, conversor hexadecimal, decimal a binario, octal, sistemas numericos, base 2, base 8, base 10, base 16, informatica, arquitectura computadores',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sistemas Numéricos - Binario, Octal, Decimal, Hex',
    description: 'Convierte números entre binario, octal, decimal y hexadecimal con explicación paso a paso. Ideal para estudiantes de informática.',
    url: 'https://meskeia.com/calculadora-sistemas-numericos/',
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
    title: 'Calculadora de Sistemas Numéricos - meskeIA',
    description: 'Convierte entre binario, octal, decimal y hexadecimal con pasos detallados.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Sistemas Numéricos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Sistemas Numéricos",
  description: "Convierte números entre sistemas numéricos: binario, octal, decimal y hexadecimal. Muestra el proceso paso a paso. Incluye operaciones aritméticas y lógicas en binario.",
  url: "https://meskeia.com/calculadora-sistemas-numericos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se convierte un número decimal a binario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para convertir un número decimal a binario se divide sucesivamente entre 2 y se anotan los restos de cada división en orden inverso. Por ejemplo, 25 en decimal: 25÷2=12 resto 1, 12÷2=6 resto 0, 6÷2=3 resto 0, 3÷2=1 resto 1, 1÷2=0 resto 1. Leyendo los restos de abajo a arriba obtenemos 11001 en binario. La calculadora muestra este proceso paso a paso para cualquier número.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sistemas numéricos admite esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora convierte entre los cuatro sistemas numéricos más usados en informática: binario (base 2), octal (base 8), decimal (base 10) y hexadecimal (base 16). También incluye operaciones aritméticas básicas y operaciones lógicas (AND, OR, XOR, NOT) directamente en binario, lo que resulta útil para estudiar arquitectura de computadores y programación de bajo nivel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se usa el sistema hexadecimal en programación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hexadecimal (base 16) es un sistema compacto para representar valores binarios: cada dígito hexadecimal equivale exactamente a 4 bits (nibble). Esto facilita la lectura de direcciones de memoria, códigos de color RGB y valores de registros en lenguaje ensamblador. Por ejemplo, el color blanco en HTML es #FFFFFF, que en binario serían 24 dígitos. Los dígitos del 10 al 15 se representan con las letras A-F.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas es útil esta calculadora de sistemas numéricos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para las asignaturas de Fundamentos de Informática, Arquitectura de Computadores y Sistemas Digitales en ciclos formativos de Informática (SMR, ASIR, DAW, DAM) y en primero de carrera de Ingeniería Informática o Telecomunicaciones. También la usan quienes se preparan para oposiciones de informática o certificaciones como CompTIA A+.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el complemento a dos y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El complemento a dos es el método estándar para representar números negativos en sistemas binarios. Para obtener el complemento a dos de un número: se invierten todos sus bits (complemento a uno) y se suma 1 al resultado. Así, los procesadores pueden sumar y restar usando el mismo circuito, simplificando el hardware. Por ejemplo, -5 en complemento a dos con 8 bits es 11111011.',
      },
    },
  ],
};
