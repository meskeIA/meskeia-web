import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Intervalos de Confianza | meskeIA',
  description: 'Visualiza qué significa realmente un intervalo de confianza al 95%. Simula 100 IC sobre muestras y comprueba que ~95 contienen μ. Modo conceptual y calculadora con z y t de Student.',
  keywords: 'intervalo de confianza, IC, nivel de confianza, t de Student, z, error estándar, margen de error, estadística inferencial, EBAU, Bachillerato, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-intervalos-confianza/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Intervalos de Confianza | meskeIA',
    description: '¿Qué significa realmente "95% de confianza"? Genera 100 intervalos y mira cuántos contienen μ.',
    url: 'https://meskeia.com/simulador-intervalos-confianza/',
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
    title: 'Simulador de Intervalos de Confianza | meskeIA',
    description: 'Aprende qué significa realmente un IC al 95% generando 100 intervalos y contando los que contienen μ.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Intervalos de Confianza',
  description: 'Simulador interactivo para entender visualmente los intervalos de confianza para la media μ. En modo Conceptual genera 100 muestras de una población N(μ, σ) y dibuja 100 IC verticales, contando cuántos contienen μ (debe ser ~95% al nivel 95%). En modo Calculadora introduce X̄, s y n para obtener un IC concreto. Soporta z (σ conocido) y t de Student (σ desconocido), niveles 80/90/95/99% y tamaños muestrales de 5 a 500. Ideal para EBAU, Bachillerato y estadística inferencial universitaria.',
  url: 'https://meskeia.com/simulador-intervalos-confianza/',
  category: 'EducationalApplication',
  features: [
    'Modo Conceptual: 100 IC simulados sobre muestras independientes',
    'Modo Calculadora: IC concreto a partir de X̄, s y n',
    'Niveles de confianza 80%, 90%, 95% y 99%',
    'z (Z normal) cuando σ es conocido, t de Student cuando es estimado',
    'Tamaños muestrales de 5 a 500',
    'Visualización clara: IC que contienen μ vs IC que NO lo contienen',
    'Cálculo automático de error estándar y margen de error',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['intervalo de confianza', 'IC', 't de Student', 'z', 'inferencia estadística', 'EBAU', 'Bachillerato'],
});
