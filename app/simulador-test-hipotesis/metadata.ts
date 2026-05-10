import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Test de Hipótesis: α, β, p-valor y Potencia | meskeIA',
  description: 'Visualiza simultáneamente las distribuciones bajo H₀ y H₁, las regiones de rechazo, errores tipo I (α) y tipo II (β), p-valor y potencia. Tests bilateral y unilateral.',
  keywords: 'test de hipótesis, contraste de hipótesis, p-valor, alfa, beta, potencia, error tipo I, error tipo II, H0, H1, región de rechazo, estadística inferencial, EBAU, Bachillerato',
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
  description: 'Simulador interactivo de contraste de hipótesis para la media. Muestra simultáneamente la distribución de X̄ bajo H₀ (N(μ₀, σ/√n)) y bajo H₁ (N(μ₁, σ/√n)), con regiones de rechazo, p-valor sombreado, área α (riesgo de rechazar H₀ siendo cierta) y área β (riesgo de no rechazar H₀ siendo falsa). Permite elegir test bilateral o unilateral, ajustar μ₀, μ₁, σ, n, α y X̄ observado, y entender visualmente la potencia del contraste (1 − β). Ideal para EBAU, Bachillerato y estadística inferencial universitaria.',
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
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['test de hipótesis', 'p-valor', 'alfa', 'beta', 'potencia', 'EBAU', 'Bachillerato', 'estadística'],
});
