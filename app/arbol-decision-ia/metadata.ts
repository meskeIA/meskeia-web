import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Árbol de Decisión Interactivo — Cómo Aprende una Máquina - meskeIA',
  description: 'Visualiza en tiempo real cómo un árbol de decisión clasifica ejemplos. Edita el dataset, añade o elimina ejemplos y observa cómo cambia el árbol. 3 datasets: clima, spam y fruta.',
  keywords: 'árbol de decisión, machine learning visual, clasificación interactiva, Gini impurity, ID3, cómo aprende la IA, inteligencia artificial educativa, aprendizaje automático ejemplos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Árbol de Decisión Interactivo — meskeIA',
    description: 'Añade ejemplos con características y observa cómo la IA construye un árbol de clasificación en tiempo real. Sin matemáticas complejas.',
    url: 'https://meskeia.com/arbol-decision-ia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Árbol de Decisión Interactivo — meskeIA',
    description: 'Visualiza cómo una IA aprende a clasificar ejemplos con un árbol de decisión interactivo.',
  },
  other: { 'application-name': 'Árbol de Decisión meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Árbol de Decisión Interactivo',
  description: 'Herramienta educativa interactiva que construye y visualiza un árbol de decisión en tiempo real a partir de ejemplos etiquetados. Incluye 3 datasets preconfigurados (clima, spam, fruta), tabla de ejemplos editable, algoritmo Gini/ID3 y clasificador para nuevos ejemplos.',
  url: 'https://meskeia.com/arbol-decision-ia/',
  category: 'EducationalApplication',
  features: [
    '3 datasets preconfigurados: clima, detección de spam y clasificación de frutas',
    'Árbol SVG que se recalcula en tiempo real al editar los ejemplos',
    'Algoritmo de clasificación Gini/ID3 implementado en el navegador',
    'Tabla de ejemplos interactiva: añadir, eliminar y modificar ejemplos',
    'Clasificador de nuevos ejemplos con trayectoria visual por el árbol',
    'Indicador de impureza Gini por nodo',
    'Explica visualmente cómo aprende una máquina a clasificar datos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un árbol de decisión en inteligencia artificial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un árbol de decisión es un algoritmo de machine learning que aprende a clasificar datos tomando decisiones secuenciales basadas en las características de cada ejemplo. Funciona como un diagrama de flujo: en cada nodo interno se pregunta por una característica (¿Está húmedo? ¿Menciona dinero?) y según la respuesta se sigue una rama hasta llegar a una hoja que contiene la predicción. Es uno de los algoritmos más interpretables del machine learning porque cualquier persona puede seguir su lógica paso a paso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la impureza Gini y cómo elige el árbol qué característica usar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La impureza Gini mide cuán mezcladas están las clases en un grupo de ejemplos. Un Gini de 0 significa pureza total (todos los ejemplos son de la misma clase); Gini de 0,5 significa máxima mezcla (50/50). El árbol prueba todas las características disponibles y elige la que produce la mayor reducción de Gini al dividir los ejemplos: es decir, la característica que mejor separa las clases. Este proceso se repite recursivamente en cada rama hasta que los nodos son puros o se alcanza el límite de profundidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si añado más ejemplos al árbol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al añadir nuevos ejemplos, el algoritmo recalcula qué característica produce la mejor separación en cada nodo. Si los nuevos ejemplos refuerzan el patrón existente, el árbol no cambia. Si introducen contradicciones o nuevos patrones, el árbol puede reorganizarse completamente: cambiar la característica de división en el nodo raíz, añadir niveles o simplificarse. Esta reconstrucción instantánea es exactamente lo que hace un algoritmo de árbol de decisión al entrenarse con datos reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un árbol de decisión y una red neuronal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un árbol de decisión usa reglas explícitas y comprensibles (como "si húmedo Y ventoso → No salir"). Una red neuronal usa miles de parámetros numéricos que no son interpretables directamente. El árbol es más fácil de explicar y auditar, pero suele ser menos preciso en tareas complejas como reconocimiento de imagen o lenguaje. Las redes neuronales son más potentes pero actúan como "cajas negras". Para tablas de datos estructurados, los árboles (especialmente en conjunto como Random Forest o XGBoost) compiten bien con las redes neuronales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan los árboles de decisión en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los árboles de decisión se usan ampliamente en diagnóstico médico (síntomas → posible enfermedad), detección de fraude bancario, aprobación de créditos, clasificación de correo spam, segmentación de clientes y sistemas de recomendación. Su ventaja principal es la interpretabilidad: un banco puede explicar por qué denegó un préstamo siguiendo la ruta del árbol. En versiones ensemble como Random Forest o Gradient Boosting son de los algoritmos más usados en competiciones de datos estructurados.',
      },
    },
  ],
};
