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
    url: 'https://meskeia.com/visualizador-modelos-epidemiologicos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modelos Epidemiológicos SIR/SEIR',
    description: 'Las matemáticas que predicen cómo se propagan las enfermedades. Simulador interactivo con curvas en tiempo real.',
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
