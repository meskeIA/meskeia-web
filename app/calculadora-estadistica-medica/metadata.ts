import { Metadata } from 'next';

import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Estadística Médica - Sensibilidad, Especificidad, VPP, VPN | meskeIA',
  description: 'Calcula sensibilidad, especificidad, valores predictivos (VPP/VPN), razones de verosimilitud, odds ratio, riesgo relativo y NNT. Herramienta gratuita para estudiantes de medicina y epidemiología.',
  keywords: 'estadística médica, sensibilidad, especificidad, valor predictivo positivo, VPP, valor predictivo negativo, VPN, odds ratio, riesgo relativo, NNT, razón verosimilitud, epidemiología, pruebas diagnósticas, tabla 2x2, medicina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Estadística Médica | meskeIA',
    description: 'Sensibilidad, especificidad, VPP, VPN, odds ratio, riesgo relativo y NNT. Para estudiantes de medicina y epidemiología.',
    url: 'https://meskeia.com/calculadora-estadistica-medica/',
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
    title: 'Calculadora de Estadística Médica | meskeIA',
    description: 'Calcula métricas de pruebas diagnósticas y estudios epidemiológicos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Estadística Médica - Sensibilidad, Especificidad, VPP, VPN",
  description: "Calcula sensibilidad, especificidad, valores predictivos (VPP/VPN), razones de verosimilitud, odds ratio, riesgo relativo y NNT. Herramienta gratuita para estudiantes de medicina y epidemiología.",
  url: 'https://meskeia.com/calculadora-estadistica-medica/',
  category: 'EducationalApplication',
  // ⚠️ 07/10/2026 (hallazgo 3030): prometía un «IC 95 % automático» del NNT que la app no da. El
  // IC se da del OR y del RR; la RRR sí se pinta ahora también en el modo Epidemiología.
  features: [
    'Tabla 2×2 diagnóstica: sensibilidad, especificidad, VPP, VPN y exactitud global',
    'Cocientes de probabilidad (LR+ y LR-) para interpretar la utilidad de una prueba',
    'Calculadora epidemiológica: riesgo relativo y odds ratio con su IC 95 %, y reducción de riesgo (RAR/RRR)',
    'NNT directo desde la tasa de eventos del grupo control y del grupo tratado',
    'Tres modos independientes: diagnóstico, epidemiología y NNT',
    'Ejemplos precargados para pruebas de laboratorio, ensayos clínicos y estudios de casos y controles',
  ],
});

// ─── FAQ — FUENTE ÚNICA de las dos bocas ─────────────────────────────────
// La FAQ visible de page.tsx pinta este array y el FAQPage se deriva de él: las preguntas del
// NNT y del VPP tenían dos respuestas distintas, y la del FAQPage callaba el horizonte temporal
// (hallazgo 3032); la del OR describía la tabla del modo diagnóstico (3031).
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué diferencia hay entre sensibilidad y especificidad en una prueba diagnóstica?',
    answer: 'La sensibilidad mide la capacidad de una prueba para detectar correctamente a los enfermos: es el porcentaje de verdaderos positivos entre todos los enfermos reales. La especificidad mide la capacidad de descartar la enfermedad en personas sanas: el porcentaje de verdaderos negativos entre todos los sanos. Una prueba muy sensible minimiza los falsos negativos; una muy específica minimiza los falsos positivos.',
  },
  {
    question: '¿Por qué el VPP depende de la prevalencia?',
    answer: 'El VPP es la probabilidad de estar enfermo si la prueba da positivo, y se ve arrastrado por la proporción de enfermos reales en la población. Ejemplo: un test con sensibilidad del 99 % y especificidad del 99 %. Con una prevalencia del 1 % (10 enfermos de cada 1.000) hay 9,9 verdaderos positivos y 9,9 falsos positivos, así que el VPP es del 50 %: solo la mitad de los positivos están enfermos. Con una prevalencia del 50 % (500 de cada 1.000) hay 495 verdaderos positivos y 5 falsos, y el VPP sube al 99 %. Lo mismo vale para el VPN, en sentido contrario.',
  },
  {
    question: '¿Cómo interpreto un NNT de 50?',
    answer: 'Que hay que tratar a 50 pacientes durante el tiempo del ensayo (por ejemplo, 5 años) para prevenir 1 evento adicional. El NNT se calcula como 1 / ARR y siempre va ligado a ese horizonte temporal: un NNT de 20 a 1 año no es comparable con uno de 20 a 10 años. Cuanto más cercano a 1, más eficaz es la intervención. Si el tratamiento es barato y seguro y el evento es grave, un NNT de 50 puede ser aceptable; con un tratamiento caro o con efectos adversos frecuentes, probablemente no. Conviene compararlo con el NNH (número necesario para dañar) del mismo tratamiento.',
  },
  {
    question: '¿Cuándo se usa la razón de verosimilitud (likelihood ratio) en lugar de la sensibilidad?',
    answer: 'Las razones de verosimilitud (LR+ y LR−) combinan sensibilidad y especificidad y, a diferencia del VPP y el VPN, no dependen de la prevalencia. El LR+ indica cuántas veces es más probable un resultado positivo en enfermos que en sanos; el LR−, lo mismo para un negativo. Sirven para actualizar la probabilidad pretest de un paciente con el teorema de Bayes y para comparar pruebas entre sí.',
  },
  {
    question: '¿Qué datos necesito para calcular el odds ratio y el riesgo relativo?',
    answer: 'Una tabla 2×2 de exposición × evento con cuatro recuentos: a (expuestos con el evento), b (expuestos sin él), c (no expuestos con el evento) y d (no expuestos sin él). El riesgo relativo compara la incidencia del evento entre expuestos y no expuestos, a/(a+b) frente a c/(c+d), y solo es estimable en estudios de cohortes. El odds ratio, (a×d)/(b×c), compara los odds y es la medida de los estudios de casos y controles.',
  },
  {
    question: '¿Cuándo usar OR en lugar de RR?',
    answer: 'Usa el OR en estudios de casos y controles, donde no puedes calcular la incidencia real, y cuando el evento es raro (menos del 10 %) en ambos grupos. Usa el RR en estudios de cohortes, donde conoces la incidencia acumulada. Cuando el evento es frecuente (más del 10 %), el OR sobreestima el RR, a veces duplicando el efecto aparente.',
  },
  {
    question: '¿Qué sensibilidad mínima exige un test de cribado?',
    answer: 'Depende de las consecuencias de un falso negativo. Para enfermedades graves y tratables se buscan sensibilidades muy altas, porque cada falso negativo es un caso sin diagnosticar: un test de cribado de tuberculosis con sensibilidad del 85 % dejaría sin diagnosticar al 15 % de los enfermos. En la práctica, se acepta una sensibilidad menor si el coste del seguimiento es muy alto o la prevalencia es bajísima.',
  },
  {
    question: '¿Qué es la curva ROC y para qué sirve?',
    answer: 'La curva ROC representa todos los pares (sensibilidad, 1 − especificidad) posibles al variar el punto de corte de una prueba cuantitativa (por ejemplo, el nivel de troponina). El área bajo la curva (AUC) resume la capacidad discriminativa: un AUC de 0,5 equivale al azar y uno de 0,9 o más es excelente. Se usa para elegir el punto de corte según se priorice la sensibilidad (descartar) o la especificidad (confirmar).',
  },
  {
    question: '¿Cuál es la diferencia entre riesgo absoluto y relativo?',
    answer: 'La reducción absoluta del riesgo (ARR) es la diferencia real de probabilidades: si el grupo control tiene un 8 % de infartos y el tratado un 4 %, la ARR es del 4 %. La reducción relativa (RRR) es esa diferencia dividida por el riesgo del control: 4 % / 8 % = 50 %. «50 % de reducción» suena mucho más que «4 infartos menos por cada 100 pacientes tratados»: ambas son correctas, pero la RRR puede inflar la percepción del beneficio cuando el riesgo basal es bajo.',
  },
  {
    question: '¿Qué significa el intervalo de confianza del OR?',
    answer: 'El IC 95 % del OR es el rango de valores compatibles con los datos con un 95 % de confianza. Si el IC no incluye el 1 (por ejemplo, 1,8 – 4,2), la asociación es estadísticamente significativa; si lo incluye (por ejemplo, 0,7 – 2,3), no hay evidencia suficiente de asociación. Un IC muy amplio (por ejemplo, 0,9 – 18,5) indica mucha incertidumbre, generalmente por un tamaño muestral pequeño.',
  },
  {
    question: '¿Cuándo tiene un test buena discriminación?',
    answer: 'Cuando separa claramente enfermos de sanos. Los criterios habituales del AUC son: 0,90 o más, excelente; 0,80-0,89, bueno; 0,70-0,79, aceptable; menos de 0,70, pobre. Complementariamente, un LR+ de 10 o más (o un LR− de 0,1 o menos) indica un cambio relevante en la probabilidad post-test.',
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
