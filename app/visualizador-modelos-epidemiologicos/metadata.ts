import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Modelos Epidemiológicos SIR/SEIR: Matemáticas de las Epidemias — meskeIA',
  description: 'Simulador interactivo de modelos SIR y SEIR. Visualiza en tiempo real cómo β, γ y R₀ determinan la dinámica de una epidemia. Curvas de infectados, número reproductivo efectivo Rₜ y comparativa de enfermedades reales.',
  keywords: [
    'modelo SIR epidemiología',
    'modelo SEIR ecuaciones diferenciales',
    'número reproductivo básico R0',
    'Rₜ número reproductivo efectivo',
    'simulador epidemia matemáticas',
    'kermack mckendrick modelo epidemiológico',
    'curva epidémica infectados susceptibles',
    'umbral inmunidad colectiva',
    'tasa transmisión tasa recuperación',
    'matemáticas propagación enfermedades',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Modelos Epidemiológicos SIR/SEIR: Matemáticas de las Epidemias — meskeIA',
    description: 'Simula modelos SIR y SEIR en tiempo real. Ajusta β, γ y σ con sliders y observa cómo cambian las curvas de infectados, R₀ y Rₜ. Compara gripe, COVID-19, sarampión y más.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-modelos-epidemiologicos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modelos Epidemiológicos SIR/SEIR',
    description: 'Las matemáticas que predicen cómo se propagan las enfermedades. Simulador interactivo con curvas en tiempo real.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Modelos Epidemiológicos SIR SEIR meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Modelos Epidemiológicos SIR/SEIR: Matemáticas de las Epidemias',
  description: 'Visualizador interactivo de la matemática de los modelos epidemiológicos. Simulador SIR/SEIR con sliders en tiempo real, curvas SVG de S(t)/I(t)/R(t), número reproductivo efectivo Rₜ y comparativa de enfermedades reales (gripe, COVID-19, sarampión, Ébola, viruela).',
  url: 'https://meskeia.com/visualizador-modelos-epidemiologicos/',
  category: 'EducationalApplication',
  features: [
    'Simulador SIR en tiempo real con sliders β, γ e I₀',
    'Modelo SEIR con periodo de incubación σ y comparativa SIR vs SEIR',
    'Curvas SVG de Susceptibles, Infectados y Recuperados (S/I/R)',
    'Gráfico de número reproductivo efectivo Rₜ a lo largo de la epidemia',
    'Slider de medidas de control: ver cómo Rₜ cae y el pico se aplana',
    'Métricas automáticas: R₀, pico infectados, día del pico, % población afectada',
    'Comparativa de 5 enfermedades reales: gripe, COVID-19, sarampión, Ébola, viruela',
    'Historia de los modelos: Ross (1911), Kermack-McKendrick (1927)',
    'Integración numérica Euler en el navegador — sin librerías externas',
    'Gratuito, sin registro, disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el número reproductivo básico R₀ y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'R₀ (R cero) es el número promedio de personas que puede infectar un solo caso en una población completamente susceptible. Si R₀ > 1, la epidemia crece; si R₀ < 1, se extingue. Por ejemplo, el sarampión tiene R₀ entre 12 y 18, mientras que la gripe estacional ronda 1,2–1,4. Este valor determina el umbral de inmunidad colectiva necesario (1 − 1/R₀).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el modelo SIR y el modelo SEIR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo SIR divide a la población en Susceptibles, Infectados y Recuperados. El modelo SEIR añade un compartimento Expuesto (E) para representar el periodo de incubación, es decir, el tiempo entre la infección y la capacidad de transmitir. El SEIR es más realista para enfermedades como COVID-19 o la gripe, donde hay un retraso notable antes de que el infectado sea contagioso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa "aplanar la curva" en términos matemáticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aplanar la curva consiste en reducir β (tasa de transmisión) mediante medidas de control: distanciamiento, mascarillas o vacunación. Al reducir β, el pico de infectados I(t) disminuye y se desplaza en el tiempo, aunque el área total bajo la curva cambia si la proporción vacunada supera el umbral de inmunidad colectiva. El simulador permite ajustar β en tiempo real para visualizar este efecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este simulador de epidemias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado para estudiantes de biología, matemáticas, medicina o epidemiología que quieran entender intuitivamente las ecuaciones diferenciales del modelo SIR/SEIR sin necesidad de software especializado. También resulta útil para docentes que buscan una demostración visual en clase, o para cualquier persona interesada en entender la dinámica de brotes infecciosos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué enfermedades reales se pueden comparar en el simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador incluye parámetros preconfigurados para cinco enfermedades: gripe estacional (R₀ ≈ 1,3), COVID-19 (R₀ ≈ 2,5–3), sarampión (R₀ ≈ 15), Ébola (R₀ ≈ 2) y viruela (R₀ ≈ 5–7). Cada una usa los valores de β y γ documentados en la literatura epidemiológica, lo que permite comparar directamente la velocidad y magnitud de cada brote.',
      },
    },
  ],
};
