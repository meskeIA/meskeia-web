import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Deriva Genética y Selección Natural | meskeIA',
  description:
    'Simula la evolución de frecuencias alélicas: deriva genética, selección natural, mutación y migración. Compara con el equilibrio de Hardy-Weinberg. Biología y genética de poblaciones Universidad.',
  keywords:
    'deriva genética, selección natural, frecuencias alélicas, Hardy-Weinberg, evolución poblaciones, fitness, mutación, fijación alelo, biología universidad, genética poblaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-deriva-genetica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Deriva Genética y Selección Natural | meskeIA',
    description: 'Genética de poblaciones interactiva: deriva, selección, Hardy-Weinberg',
    url: 'https://meskeia.com/simulador-deriva-genetica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Deriva Genética | meskeIA',
    description: 'Aprende genética de poblaciones con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Deriva Genética y Selección Natural',
  description:
    'Simulador de genética de poblaciones que combina deriva, selección, mutación y migración. Ajusta el tamaño poblacional, los fitness por genotipo y las tasas de mutación; compara las trayectorias de frecuencias alélicas con el equilibrio de Hardy-Weinberg.',
  url: 'https://meskeia.com/simulador-deriva-genetica/',
  category: 'EducationalApplication',
  features: [
    'Modelo Wright-Fisher con selección, mutación y deriva',
    'Hasta 50 simulaciones independientes superpuestas',
    'Cálculo automático de probabilidad de fijación y pérdida',
    'Comparación con Hardy-Weinberg',
    '4 modos preestablecidos (deriva pura, selección direccional, equilibradora, HW)',
    'Histograma de frecuencias finales',
  ],
  keywords: ['deriva genética', 'selección natural', 'Hardy-Weinberg', 'biología universidad'],
});

// FUENTE ÚNICA de la FAQ visible (page.tsx) y del FAQPage de abajo. Hasta el 09/11/2026 eran dos
// FAQ distintas: ninguna pregunta del FAQPage estaba en la página, dos se repetían con otras
// palabras y la tasa de mutación salía «10⁻⁵–10⁻⁶» en una y «10⁻⁶ a 10⁻⁴» en la otra
// (hallazgo 4351). Queda la de la página, la misma de la tabla y del consejo de la guía. La regla
// 4Ns lleva ahora el 4 en su condición (hallazgo 4352).
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es la deriva genética y por qué es más fuerte en poblaciones pequeñas?',
    answer:
      'La deriva genética es el cambio aleatorio de las frecuencias alélicas causado por el sorteo de los gametos en cada generación. La varianza de ese cambio es pq/(2N) por generación: con N pequeño es grande, porque se sortean pocos alelos, y un alelo puede fijarse o perderse en pocas generaciones sin ninguna ventaja selectiva. Regla 4Ns: si |4Ns| ≪ 1, la deriva domina sobre la selección.',
  },
  {
    question: '¿Cuál es la diferencia entre selección natural y deriva genética?',
    answer:
      'La selección natural es un proceso determinista: favorece a los genotipos con mayor fitness reproductivo y produce cambios predecibles en la dirección del alelo favorecido. La deriva genética es un proceso estocástico (aleatorio): las frecuencias alélicas fluctúan independientemente del fitness. En poblaciones grandes predomina la selección; en pequeñas, la deriva puede superar el efecto selectivo.',
  },
  {
    question: '¿Qué establece el principio de Hardy-Weinberg y cuáles son sus condiciones?',
    answer:
      'Que las frecuencias alélicas y genotípicas se mantienen constantes generación tras generación, con p² + 2pq + q² = 1, si se cumplen cinco condiciones: población muy grande (sin deriva), apareamiento aleatorio (panmixia), sin mutación, sin migración y sin selección natural. Es el modelo nulo: si una población se desvía, alguna fuerza evolutiva está actuando.',
  },
  {
    question: '¿Cuándo se rompe Hardy-Weinberg?',
    answer:
      'Cuando hay selección (fitness desiguales), mutación significativa, flujo génico, tamaño poblacional pequeño (deriva) o apareamiento no aleatorio (endogamia, apareamiento asortativo). En la práctica casi ninguna población real cumple Hardy-Weinberg de forma estricta.',
  },
  {
    question: '¿Cuál es la diferencia entre selección direccional y equilibradora?',
    answer:
      'En la direccional un homocigoto es el más apto y el alelo correspondiente tiende a fijarse (p→0 o p→1). En la equilibradora el heterocigoto tiene ventaja y los dos alelos se mantienen en una frecuencia intermedia estable p*.',
  },
  {
    question: '¿Qué es la fijación de un alelo y cuándo ocurre?',
    answer:
      'La fijación ocurre cuando la frecuencia de un alelo llega al 100 % (todos los individuos son homocigotos para ese alelo) y el alelo alternativo se pierde. En ausencia de selección, la probabilidad de fijación de un alelo es igual a su frecuencia inicial. Con selección positiva, la probabilidad aumenta; con selección negativa, disminuye. Cuanto menor es la población, antes se alcanza la fijación.',
  },
  {
    question: '¿Qué es la heterocigosis y por qué importa?',
    answer:
      'H = 2pq es la proporción de heterocigotos esperada y mide la diversidad genética: H = 0 en una población fijada, sin variación, y es máxima (0,5) cuando p = q = 0,5. La deriva reduce H con el tiempo: Hₜ ≈ H₀(1−1/(2N))ᵗ. En el simulador, «H final» es la media de 2pq de cada población.',
  },
  {
    question: '¿En qué se diferencian la mutación y la migración?',
    answer:
      'La mutación es interna: cambia un alelo en otro al copiar el ADN, a una tasa muy baja (del orden de 10⁻⁶ a 10⁻⁴ por gen y generación). La migración es externa: llegan individuos de otra población con otra frecuencia, y homogeneiza las poblaciones. Las dos introducen variación y contrarrestan la deriva, pero la migración suele actuar mucho más deprisa.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
