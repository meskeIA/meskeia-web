import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Álgebra Abstracta - Grupos, Anillos, Cuerpos | meskeIA',
  description: 'Explora estructuras algebraicas: grupos, anillos y cuerpos. Operaciones modulares, tablas de Cayley y propiedades algebraicas.',
  keywords: 'álgebra abstracta, grupos, anillos, cuerpos, aritmética modular, tabla Cayley, estructuras algebraicas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Álgebra Abstracta | meskeIA',
    description: 'Grupos, anillos, cuerpos y estructuras algebraicas.',
    url: 'https://meskeia.com/calculadora-algebra-abstracta/',
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
    title: 'Calculadora Álgebra Abstracta | meskeIA',
    description: 'Herramienta de álgebra abstracta online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Álgebra Abstracta",
  description: "Explora estructuras algebraicas: grupos, anillos y cuerpos. Operaciones modulares, tablas de Cayley y propiedades algebraicas.",
  url: "https://meskeia.com/calculadora-algebra-abstracta/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el álgebra abstracta y en qué se diferencia del álgebra normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El álgebra abstracta estudia estructuras matemáticas generales como grupos, anillos y cuerpos, definidas por axiomas, en lugar de operar con números concretos. Mientras el álgebra elemental trabaja con ecuaciones numéricas, el álgebra abstracta generaliza esas operaciones para entender qué propiedades son comunes a distintos sistemas. Es la base de la criptografía moderna, la teoría de códigos y la geometría algebraica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un grupo en matemáticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un grupo es un conjunto con una operación binaria que cumple cuatro propiedades: clausura (el resultado siempre pertenece al conjunto), asociatividad, existencia de elemento neutro e inverso para cada elemento. Ejemplos sencillos son los enteros con la suma o las rotaciones de un triángulo. Esta herramienta genera la tabla de Cayley que resume toda la estructura del grupo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la aritmética modular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aritmética modular opera con restos de divisiones: dos números son equivalentes módulo n si tienen el mismo resto al dividir entre n. Por ejemplo, 17 ≡ 5 (mod 12) porque ambos dejan resto 5 al dividir entre 12. Es la base de los algoritmos de cifrado (RSA, AES), los códigos de verificación (ISBN, NIF) y los calendarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un anillo y un cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un anillo es una estructura con dos operaciones (suma y multiplicación) donde la suma forma un grupo conmutativo y la multiplicación es asociativa y distributiva. Un cuerpo es un anillo más restrictivo donde además todo elemento no nulo tiene inverso multiplicativo, lo que permite la división. Los números racionales forman un cuerpo; los enteros solo forman un anillo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensada esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está dirigida a estudiantes de último año de bachillerato con contenidos de ampliación, y principalmente a estudiantes universitarios de primer y segundo año en grados de Matemáticas, Ingeniería Informática o Física. También resulta útil para quienes se preparan para oposiciones con temario matemático avanzado.',
      },
    },
  ],
};
