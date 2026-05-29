import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Redes Neuronales e IA | Cómo Aprende una IA | meskeIA',
  description: 'Aprende cómo funciona una red neuronal: neurona artificial, capas, backpropagation, gradient descent y tipos de redes (CNN, Transformer, GAN). Del perceptrón a los LLMs como GPT.',
  keywords: ['redes neuronales', 'deep learning', 'inteligencia artificial', 'backpropagation', 'transformer', 'GPT', 'CNN', 'machine learning', 'perceptron'],
  openGraph: {
    title: 'Visualizador de Redes Neuronales e IA | meskeIA',
    description: 'Cómo aprende una IA: neuronas artificiales, capas, entrenamiento y backpropagation explicados visualmente.',
    url: 'https://meskeia.com/visualizador-ia-redes-neuronales/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Redes Neuronales e IA - Cómo Aprende una Inteligencia Artificial",
  description: "Aprende cómo funciona una red neuronal: neurona artificial, capas, backpropagation, gradient descent y tipos de redes (CNN, Transformer, GAN). Del perceptrón a los LLMs como GPT.",
  url: "https://meskeia.com/visualizador-ia-redes-neuronales/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una red neuronal artificial y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una red neuronal artificial es un modelo computacional inspirado en el funcionamiento del cerebro biológico. Está formada por nodos (neuronas artificiales) organizados en capas: una capa de entrada que recibe los datos, capas ocultas que transforman la información mediante pesos y funciones de activación, y una capa de salida que produce el resultado. Cada neurona recibe entradas, las pondera, aplica una función de activación (como ReLU o sigmoid) y transmite la señal a la siguiente capa. El comportamiento de la red emerge del ajuste iterativo de los millones de pesos durante el entrenamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el backpropagation y por qué es fundamental en el aprendizaje profundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La retropropagación (backpropagation) es el algoritmo que permite ajustar los pesos de una red neuronal para reducir el error en sus predicciones. Funciona en dos pasos: primero el paso hacia adelante (forward pass), donde los datos atraviesan la red y se genera una predicción; luego el paso hacia atrás (backward pass), donde se calcula el gradiente del error respecto a cada peso usando la regla de la cadena del cálculo diferencial, y se actualiza cada peso en la dirección que reduce el error (descenso por gradiente). Este ciclo se repite miles o millones de veces con lotes de datos hasta que el modelo converge.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una CNN y un Transformer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las CNN (Redes Neuronales Convolucionales) están diseñadas para procesar datos con estructura espacial, como imágenes: usan filtros convolucionales que detectan características locales (bordes, texturas, formas) de forma jerárquica. Los Transformers, introducidos en 2017 por Vaswani et al., utilizan un mecanismo de atención que relaciona directamente cualquier posición de la secuencia con cualquier otra, lo que los hace muy efectivos para texto, audio y también imágenes (Vision Transformers). Los LLMs como GPT o Llama son Transformers entrenados con enormes corpus de texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre machine learning, deep learning e inteligencia artificial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son tres conceptos en relación de subconjunto. La inteligencia artificial (IA) es el campo más amplio: cualquier técnica que permita a las máquinas realizar tareas que requieren inteligencia humana. El machine learning (aprendizaje automático) es una subdisciplina de la IA donde los sistemas aprenden de datos en lugar de seguir reglas explícitas programadas. El deep learning (aprendizaje profundo) es un subconjunto del machine learning que usa redes neuronales con muchas capas ocultas para aprender representaciones jerárquicas de los datos, siendo especialmente potente con imágenes, texto y audio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos parámetros tiene un modelo de lenguaje grande (LLM) como GPT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modelos de lenguaje grandes modernos tienen un número de parámetros que varía enormemente según su tamaño. GPT-2 (2019) tenía 1.500 millones de parámetros; GPT-3 (2020) escaló a 175.000 millones. Los modelos actuales de frontera superan los billones de parámetros en sus versiones más grandes, aunque los fabricantes no siempre publican cifras exactas. Existen también modelos compactos y eficientes (7B-70B parámetros) que pueden ejecutarse en hardware de consumo y son la base de muchas aplicaciones prácticas de código abierto.',
      },
    },
  ],
};
