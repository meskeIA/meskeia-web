import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Teorema Central del Límite | meskeIA',
  description: 'Visualiza cómo la media muestral converge a una normal sea cual sea la distribución original. Simulación Monte Carlo en directo con 5 distribuciones (uniforme, exponencial, Bernoulli, bimodal).',
  keywords: 'teorema central del límite, TCL, CLT, distribución muestral, media muestral, Monte Carlo, estadística inferencial, ley de los grandes números, intervalo de confianza, EBAU, Bachillerato, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-teorema-central-limite/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Teorema Central del Límite | meskeIA',
    description: 'Lanza muestras de cualquier distribución y mira la magia: la media muestral converge a una normal. Visualiza el TCL en directo.',
    url: 'https://meskeia.com/simulador-teorema-central-limite/',
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
    title: 'Simulador del Teorema Central del Límite | meskeIA',
    description: 'Visualiza el TCL: cómo la media muestral converge a una normal sea cual sea la distribución original.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Teorema Central del Límite',
  description: 'Simulador Monte Carlo del Teorema Central del Límite (TCL). Genera muestras de cinco distribuciones poblacionales muy distintas (uniforme, exponencial, Bernoulli, Bernoulli sesgada, bimodal) y observa cómo la distribución de la media muestral converge siempre a una normal de media μ y desviación σ/√n. Permite ajustar el tamaño muestral n y el número de muestras, comparar con la curva normal teórica y ver estadísticos empíricos en tiempo real.',
  url: 'https://meskeia.com/simulador-teorema-central-limite/',
  category: 'EducationalApplication',
  features: [
    'Simulación Monte Carlo en directo de la distribución de la media muestral',
    '5 distribuciones poblacionales (uniforme, exponencial, Bernoulli p=0.5, Bernoulli p=0.9, bimodal)',
    'Tamaño muestral n configurable (1, 2, 5, 10, 30, 100)',
    'Comparación con la N(μ, σ/√n) teórica superpuesta',
    'Estadísticos empíricos: media, desviación, asimetría y curtosis',
    'Visualiza la velocidad de convergencia según la asimetría original',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y en español, ideal para EBAU, Bachillerato y estadística universitaria',
  ],
  keywords: ['teorema central del límite', 'TCL', 'CLT', 'Monte Carlo', 'estadística', 'distribución muestral', 'EBAU', 'Bachillerato'],
});
