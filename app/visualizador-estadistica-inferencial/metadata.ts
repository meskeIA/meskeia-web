import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estadística Inferencial: p-valor, Errores Tipo I/II e Intervalos de Confianza | meskeIA',
  description: 'Visualiza en tiempo real los conceptos más malinterpretados en ciencia: el p-valor, errores tipo I y tipo II, intervalos de confianza y potencia estadística. Entiende por qué p<0.05 no es suficiente.',
  keywords: [
    'p-valor', 'valor p', 'estadistica inferencial', 'error tipo I', 'error tipo II',
    'intervalo de confianza', 'potencia estadistica', 'hipotesis nula', 'test hipotesis',
    'nivel significacion', 'estadistica tests', 'crisis replicacion', 'estadistica ciencia',
    'inferencia estadistica', 'distribuccion normal contraste',
  ],
  openGraph: {
    title: 'Estadística Inferencial: p-valor e Intervalos de Confianza | meskeIA',
    description: 'Visualizador interactivo de los conceptos más malinterpretados en estadística científica.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estadística Inferencial: p-valor e Intervalos de Confianza | meskeIA',
    description: 'Visualizador interactivo de los conceptos más malinterpretados en estadística científica.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estadística Inferencial: p-valor, Errores y Confianza",
  description: "Visualiza en tiempo real los conceptos más malinterpretados en ciencia: el p-valor, errores tipo I y tipo II, intervalos de confianza y potencia estadística. Entiende por qué p<0.05 no es suficiente.",
  url: "https://meskeia.com/visualizador-estadistica-inferencial/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué significa realmente el p-valor en un test estadístico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El p-valor es la probabilidad de obtener un resultado tan extremo como el observado (o más) asumiendo que la hipótesis nula es verdadera. Un p = 0,03 significa que, si no hubiera efecto real, habría un 3% de probabilidad de ver datos tan extremos por azar. Lo que NO significa: no es la probabilidad de que la hipótesis nula sea verdadera, ni la probabilidad de que el resultado se replique, ni una medida del tamaño del efecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los errores tipo I y tipo II en estadística?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El error tipo I (falso positivo) ocurre cuando se rechaza la hipótesis nula siendo verdadera; su probabilidad es α (nivel de significación, habitualmente 0,05). El error tipo II (falso negativo) ocurre cuando no se rechaza la hipótesis nula siendo falsa; su probabilidad es β. Ambos errores están relacionados: reducir α (ser más exigente) aumenta β. La potencia estadística (1 − β) mide la capacidad del test para detectar un efecto real cuando existe.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué p < 0,05 no es suficiente para concluir que un resultado es significativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El umbral p < 0,05 es una convención arbitraria establecida por Fisher, no una barrera con significado biológico o práctico. Con muestras grandes, diferencias triviales pueden producir p muy pequeños. Además, si se realizan muchas comparaciones simultáneas (problema de comparaciones múltiples), el 5% de ellas producirá p < 0,05 por azar puro. Por eso, la estadística moderna exige también reportar el tamaño del efecto, el intervalo de confianza y la potencia del test.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un intervalo de confianza del 95% y cómo se interpreta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un intervalo de confianza del 95% (IC95%) es un rango calculado a partir de los datos de la muestra de tal modo que, si repitiéramos el experimento muchas veces, el 95% de los intervalos calculados contendrían el verdadero parámetro poblacional. Un error frecuente es pensar que hay un 95% de probabilidad de que el parámetro esté dentro del intervalo concreto obtenido; en realidad, el parámetro es fijo y el intervalo es el que varía entre muestras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel de estudios está pensado este visualizador de estadística inferencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de últimos años de grado y máster en ciencias, ingeniería, medicina, psicología, economía o cualquier disciplina que use tests estadísticos. También es valioso para investigadores que trabajan con datos pero no tienen formación estadística formal, y para quienes quieran entender de forma intuitiva por qué la crisis de replicación en ciencia está relacionada con el mal uso del p-valor.',
      },
    },
  ],
};
