import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Máquina de Turing | meskeIA',
  description: 'Simula una máquina de Turing con cinta animada, reglas editables y 4 programas clásicos: incrementador binario, lenguaje aⁿbⁿ, duplicar cadena y palíndromos. Teoría de la Computación.',
  keywords: 'máquina de Turing, Alan Turing, computabilidad, autómatas, lenguajes formales, teoría de la computación, FP informática, universidad, decidible, lenguaje recursivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-maquina-turing/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Máquina de Turing | meskeIA',
    description: 'Cinta, reglas y 4 programas clásicos animados paso a paso',
    url: 'https://meskeia.com/simulador-maquina-turing/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Máquina de Turing | meskeIA',
    description: 'Aprende computabilidad con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Máquina de Turing',
  description:
    'Simulador interactivo de máquina de Turing con cinta visual, tabla de reglas editable y programas clásicos: incrementador binario, lenguaje aⁿbⁿ, duplicador unario y reconocedor de palíndromos.',
  url: 'https://meskeia.com/simulador-maquina-turing/',
  category: 'EducationalApplication',
  features: [
    'Cinta animada con cabezal y símbolos',
    'Tabla de reglas (transiciones) editable',
    '4 programas predefinidos clásicos',
    'Estados iniciales y finales configurables',
    'Velocidad ajustable y modo paso a paso',
    'Métricas: pasos, símbolos escritos, ACEPTADO/RECHAZADO',
    'En español',
  ],
  keywords: ['máquina de Turing', 'computabilidad', 'autómatas', 'teoría computación'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una máquina de Turing y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una máquina de Turing es un modelo matemático abstracto propuesto por Alan Turing en 1936 que formaliza el concepto de computación. Consta de una cinta infinita dividida en celdas, un cabezal que lee y escribe símbolos, y una tabla de reglas de transición que dicta el siguiente estado. Su importancia radica en que establece los límites teóricos de lo que puede computarse: todo problema resoluble por un ordenador puede resolverse con una máquina de Turing.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se define una máquina de Turing formalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Formalmente una máquina de Turing se define como una 7-tupla (Q, Σ, Γ, δ, q₀, q_aceptar, q_rechazar): Q es el conjunto finito de estados, Σ el alfabeto de entrada, Γ el alfabeto de la cinta (Σ ⊆ Γ), δ la función de transición δ: Q×Γ → Q×Γ×{L,R}, q₀ el estado inicial, y q_aceptar / q_rechazar los estados finales. En cada paso el cabezal lee un símbolo, escribe uno nuevo, cambia de estado y se desplaza a la izquierda o derecha.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un problema decidible y uno no decidible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un problema es decidible si existe una máquina de Turing que siempre se detiene y responde sí o no. Un problema no decidible no tiene tal algoritmo: la máquina puede entrar en un bucle infinito para algunas entradas. El ejemplo más famoso es el Problema de la Parada (Halting Problem), demostrado no decidible por Turing en 1936: no es posible construir un programa que determine, para cualquier programa y entrada, si ese programa termina o no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas sirve este simulador de máquina de Turing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una herramienta directa para las asignaturas de Teoría de la Computación, Lenguajes Formales y Autómatas, y Modelos de Computación de grados en Informática, Matemáticas e Ingeniería. Los 4 programas predefinidos (incrementador binario, lenguaje aⁿbⁿ, duplicador unario y palíndromos) cubren los ejercicios clásicos de examen. Al poder editar la tabla de reglas directamente, también sirve para depurar implementaciones propias paso a paso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tiene la máquina de Turing con los ordenadores actuales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tesis de Church-Turing establece que cualquier proceso computable puede simularse con una máquina de Turing. Los ordenadores modernos son equivalentes en poder computacional a la máquina de Turing (aunque mucho más rápidos y con memoria práctica finita). Esto significa que los límites teóricos encontrados por Turing (problemas no decidibles, indecidibilidad) aplican también a cualquier ordenador real, independientemente de su velocidad o memoria disponible.',
      },
    },
  ],
};
