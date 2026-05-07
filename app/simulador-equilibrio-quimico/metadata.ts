import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Equilibrio Químico - Le Chatelier | meskeIA',
  description: 'Simula el equilibrio químico y aplica el Principio de Le Chatelier: cambia concentración, temperatura o presión y observa cómo se desplaza la reacción. Química Bachillerato.',
  keywords: 'equilibrio químico, Le Chatelier, Kc, cociente de reacción, perturbación equilibrio, Haber-Bosch, química bachillerato, principio Le Chatelier',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-equilibrio-quimico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Equilibrio Químico | meskeIA',
    description: 'Aplica Le Chatelier de forma interactiva en 6 reacciones reversibles famosas',
    url: 'https://meskeia.com/simulador-equilibrio-quimico',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Equilibrio Químico | meskeIA',
    description: 'Aprende equilibrio químico con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Equilibrio Químico y Le Chatelier',
  description:
    'Simulador interactivo del equilibrio químico. Elige una reacción reversible (Haber, contacto, esterificación, etc.), aplica perturbaciones de concentración, temperatura o presión y observa el desplazamiento del equilibrio.',
  url: 'https://meskeia.com/simulador-equilibrio-quimico/',
  category: 'EducationalApplication',
  features: [
    '6 reacciones reversibles famosas (Haber-Bosch, contacto, esterificación, etc.)',
    'Aplicación interactiva del Principio de Le Chatelier',
    'Perturbaciones: añadir/quitar especies, ΔT, ΔP, catalizador',
    'Cálculo del cociente Q y comparación con Kc',
    'Gráfico de concentraciones vs tiempo',
    'Predicción visual del desplazamiento',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['equilibrio químico', 'Le Chatelier', 'Kc', 'química bachillerato'],
});
