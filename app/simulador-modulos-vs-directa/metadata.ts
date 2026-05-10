import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Módulos vs Estimación Directa Autónomos 2025 | meskeIA',
  description: 'Compara orientativamente cuál régimen fiscal te conviene como autónomo: Estimación Directa Simplificada o Estimación Objetiva (Módulos). Cálculo por actividad y comparativa de coste fiscal anual.',
  keywords: 'módulos vs estimación directa, autónomo régimen fiscal, EDS estimación directa simplificada, estimación objetiva módulos, IRPF autónomos, RETA autónomos 2025, qué régimen me conviene',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-modulos-vs-directa/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Módulos vs Estimación Directa | meskeIA',
    description: 'Compara los dos regímenes fiscales del autónomo y descubre cuál te conviene',
    url: 'https://meskeia.com/simulador-modulos-vs-directa/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Módulos vs Estimación Directa | meskeIA',
    description: 'Compara regímenes fiscales del autónomo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Módulos vs Estimación Directa para Autónomos',
  description: 'Comparador orientativo entre los dos regímenes fiscales del IRPF para autónomos en España: Estimación Directa Simplificada y Estimación Objetiva (Módulos). Cálculo por actividad.',
  url: 'https://meskeia.com/simulador-modulos-vs-directa/',
  category: 'FinanceApplication',
  features: [
    'Comparativa visual lado a lado de los dos regímenes',
    'Cálculo IRPF + RETA + IVA orientativo',
    '4 casos preconfigurados (bar rentable, bar con pérdidas, comercio, profesional)',
    'Aviso sobre actividades elegibles a módulos',
    'Datos basados en LPGE 2025 y Orden HFP de módulos 2024',
    'Solo orientativo — no sustituye al asesor fiscal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['módulos', 'estimación directa', 'autónomo', 'régimen fiscal'],
});
