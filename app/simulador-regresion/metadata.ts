import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Regresión Lineal y Logística | meskeIA',
  description: 'Simula regresión lineal, polinómica y logística añadiendo puntos al plano. Observa cómo se ajusta el modelo en tiempo real con OLS o descenso de gradiente. Estadística e Inteligencia Artificial.',
  keywords: 'regresión lineal, regresión logística, regresión polinómica, descenso de gradiente, OLS mínimos cuadrados, R², machine learning básico, IA universidad, FP informática, ajuste de curvas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-regresion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Regresión Lineal y Logística | meskeIA',
    description: 'Añade puntos y observa el modelo ajustarse en tiempo real',
    url: 'https://meskeia.com/simulador-regresion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Regresión | meskeIA',
    description: 'Aprende ML básico con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Regresión Lineal y Logística',
  description: 'Simulador interactivo de regresión lineal, polinómica y logística. Añade puntos al plano con clic, elige el método (OLS analítico o descenso de gradiente), observa el ajuste en tiempo real y compara métricas.',
  url: 'https://meskeia.com/simulador-regresion/',
  category: 'EducationalApplication',
  features: [
    '4 modelos: lineal, lineal múltiple, polinómica (grado 1-5) y logística',
    'Editor de puntos con clic y arrastre',
    'OLS analítico vs descenso de gradiente animado',
    'Métricas: R², MSE, accuracy, precision, recall',
    'Curva de pérdida durante el entrenamiento',
    '4 datasets predefinidos',
    'En español',
  ],
  keywords: ['regresión', 'machine learning', 'descenso gradiente', 'IA universidad'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la regresión lineal y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regresión lineal es un algoritmo de aprendizaje automático supervisado que modela la relación entre una variable dependiente y una o más variables independientes mediante una línea recta. Se usa para predecir valores continuos, como estimar el precio de una vivienda en función de su superficie o predecir ventas futuras a partir de datos históricos. Es uno de los modelos más sencillos e interpretables del machine learning.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre OLS y el descenso de gradiente en regresión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OLS (Mínimos Cuadrados Ordinarios) es un método analítico que calcula directamente los coeficientes óptimos resolviendo una ecuación matemática, sin iteraciones. Es exacto pero costoso computacionalmente cuando hay muchas variables. El descenso de gradiente es un método iterativo que ajusta los coeficientes poco a poco en la dirección que reduce el error; es más flexible y escala mejor a grandes conjuntos de datos, aunque requiere ajustar la tasa de aprendizaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide el coeficiente R² en un modelo de regresión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coeficiente de determinación R² indica qué proporción de la variabilidad de los datos queda explicada por el modelo. Toma valores entre 0 y 1: un R² de 0,85 significa que el modelo explica el 85% de la varianza. Un R² cercano a 1 indica buen ajuste, aunque valores muy altos pueden señalar sobreajuste si el modelo es demasiado complejo para los datos disponibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo usar regresión logística en lugar de regresión lineal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regresión logística se usa cuando la variable a predecir es categórica binaria (sí/no, aprobado/suspenso, spam/no spam), mientras que la regresión lineal predice valores continuos. La logística aplica una función sigmoide que transforma la salida en una probabilidad entre 0 y 1, y clasifica el resultado según un umbral, habitualmente 0,5. No debe usarse regresión lineal para clasificación porque puede generar predicciones fuera del rango válido de probabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regresión polinómica y cuándo conviene usarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regresión polinómica extiende la regresión lineal añadiendo términos de potencias de las variables independientes (x², x³…), lo que permite ajustar relaciones curvilíneas no lineales. Conviene usarla cuando los datos muestran una curvatura clara que una recta no puede capturar. Sin embargo, a mayor grado del polinomio, mayor riesgo de sobreajuste: el modelo se adapta demasiado a los puntos de entrenamiento y falla con datos nuevos.',
      },
    },
  ],
};
