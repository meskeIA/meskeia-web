import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Test de Hipótesis: α, β, p-valor y Potencia | meskeIA',
  description: 'Visualiza simultáneamente las distribuciones bajo H₀ y H₁, las regiones de rechazo, errores tipo I (α) y tipo II (β), p-valor y potencia. Tests bilateral y unilateral.',
  keywords: 'test de hipótesis, contraste de hipótesis, prueba de hipótesis, p-valor, alfa, beta, potencia, error tipo I, error tipo II, H0, H1, región de rechazo, estadística inferencial, EBAU, Bachillerato, preparatoria, secundaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-test-hipotesis/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Test de Hipótesis | meskeIA',
    description: 'Visualiza α, β, p-valor y potencia con dos distribuciones superpuestas (H₀ y H₁) y regiones de rechazo interactivas.',
    url: 'https://meskeia.com/simulador-test-hipotesis/',
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
    title: 'Simulador de Test de Hipótesis | meskeIA',
    description: 'Aprende α, β, p-valor y potencia con dos curvas N(μ₀,σ/√n) y N(μ₁,σ/√n) y regiones de rechazo en directo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Test de Hipótesis',
  description: 'Simulador interactivo de contraste de hipótesis para la media. Muestra simultáneamente la distribución de X̄ bajo H₀ (N(μ₀, σ/√n)) y bajo H₁ (N(μ₁, σ/√n)), con regiones de rechazo, p-valor sombreado, área α (riesgo de rechazar H₀ siendo cierta) y área β (riesgo de no rechazar H₀ siendo falsa). Permite elegir test bilateral o unilateral, ajustar μ₀, μ₁, σ, n, α y X̄ observado, y entender visualmente la potencia del contraste (1 − β). Ideal para Bachillerato y EBAU (España), preparatoria y educación media (Latinoamérica) y estadística inferencial universitaria.',
  url: 'https://meskeia.com/simulador-test-hipotesis/',
  category: 'EducationalApplication',
  features: [
    'Visualización de las dos distribuciones (H₀ y H₁) simultáneamente',
    'Regiones de rechazo y áreas α, β y p-valor sombreadas',
    'Tests bilateral, unilateral derecho y unilateral izquierdo',
    'Sliders para μ₀, μ₁, σ, n, α y X̄ observado',
    'Cálculo automático de estadístico z, p-valor y decisión',
    'Cálculo de potencia (1 − β) bajo diferentes escenarios',
    'Comprensión visual del trade-off α ↔ β',
  ],
  keywords: ['test de hipótesis', 'prueba de hipótesis', 'p-valor', 'alfa', 'beta', 'potencia', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'estadística'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el p-valor en un contraste de hipótesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El p-valor es la probabilidad de obtener un resultado tan extremo como el observado, o más, asumiendo que H₀ es cierta. No mide la probabilidad de que H₀ sea verdadera. Si el p-valor es menor que el nivel de significación α, se rechaza H₀. El simulador colorea el área del p-valor bajo la curva de H₀ para que la comparación con α sea inmediata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el error tipo I y el error tipo II?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El error tipo I (α) ocurre cuando rechazas H₀ siendo cierta —un falso positivo—. El error tipo II (β) ocurre cuando no rechazas H₀ siendo falsa —un falso negativo—. Reducir α (ser más exigente) aumenta automáticamente β porque las regiones de rechazo se encogen. El simulador muestra ambas áreas superpuestas para hacer visible ese compromiso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la potencia de un test estadístico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia es la probabilidad de rechazar H₀ cuando H₁ es realmente cierta, y se calcula como 1 − β. Una potencia del 80% significa que, si el efecto real existe, el test lo detectará el 80% de las veces. La potencia aumenta con muestras más grandes, con efectos más grandes (mayor diferencia entre μ₀ y μ₁) o usando un nivel α menos restrictivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se usa un test bilateral y cuándo uno unilateral?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un test bilateral comprueba si la media difiere de μ₀ en cualquier dirección (H₁: μ ≠ μ₀) y reparte α entre ambas colas. Un test unilateral (derecho o izquierdo) solo detecta diferencias en una dirección específica (H₁: μ > μ₀ o μ < μ₀) y concentra toda la región de rechazo en una cola. El test unilateral es más potente para detectar el efecto esperado, pero no detecta desviaciones en el sentido opuesto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este simulador de test de hipótesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a estudiantes de secundaria, Bachillerato o preparatoria y a universitarios que cursan estadística inferencial, a quienes preparan exámenes de admisión universitaria (la EBAU en España) con bloque de estadística y a profesores que buscan material visual para explicar conceptos abstractos como α, β y potencia. También es útil para investigadores que quieren intuir el efecto de cambiar el tamaño muestral o el nivel de significación antes de diseñar un experimento.',
      },
    },
  ],
};
