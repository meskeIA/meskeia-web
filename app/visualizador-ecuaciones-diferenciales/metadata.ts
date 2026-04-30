import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Ecuaciones Diferenciales — Campo de Direcciones, Lotka-Volterra y Aplicaciones | meskeIA',
  description: 'Explora ecuaciones diferenciales interactivamente: campo de direcciones con soluciones Euler, sistema predador-presa Lotka-Volterra animado, ley de enfriamiento de Newton y circuitos RC como ODE. Alta demanda en ingeniería y ciencias.',
  keywords: 'ecuaciones diferenciales, campo de direcciones, Lotka-Volterra, predador-presa, método de Euler, Runge-Kutta, enfriamiento Newton, circuito RC, ODE, matemáticas, ingeniería, modelado matemático',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Ecuaciones Diferenciales — ODE Interactivo',
    description: '¿Cómo predice la ciencia la dinámica de poblaciones, el enfriamiento de un café o la carga de un condensador? Explora ecuaciones diferenciales con visualizaciones interactivas.',
    url: 'https://meskeia.com/visualizador-ecuaciones-diferenciales',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Ecuaciones Diferenciales',
    description: 'Campo de direcciones, Lotka-Volterra animado y aplicaciones reales: enfriamiento Newton y circuitos RC como ODE.',
  },
  other: { 'application-name': 'Ecuaciones Diferenciales meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Ecuaciones Diferenciales',
  description: 'Visualizador interactivo de ecuaciones diferenciales ordinarias: campo de direcciones SVG con solución por método de Euler, sistema predador-presa Lotka-Volterra con Runge-Kutta 4 y diagrama de fase, ley de enfriamiento de Newton y circuito RC.',
  url: 'https://meskeia.com/visualizador-ecuaciones-diferenciales/',
  features: [
    'Campo de direcciones SVG interactivo con 5 ODEs predefinidas',
    'Trazar solución por método de Euler desde condición inicial',
    'Sistema Lotka-Volterra animado con Runge-Kutta 4',
    'Diagrama de fase (trayectoria orbital conejos vs lobos)',
    'Ley de enfriamiento de Newton con solución exacta',
    'Circuito RC: constante de tiempo τ = RC visualizada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
  category: 'EducationalApplication',
});
