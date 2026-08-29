import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ecuaciones Diferenciales: Campo de Direcciones y Lotka-Volterra | meskeIA',
  description: 'Explora ecuaciones diferenciales interactivamente: campo de direcciones con soluciones Euler, sistema predador-presa Lotka-Volterra animado, ley de enfriamiento de Newton y circuitos RC como ODE. Alta demanda en ingeniería y ciencias.',
  keywords: 'ecuaciones diferenciales, campo de direcciones, Lotka-Volterra, predador-presa, método de Euler, Runge-Kutta, enfriamiento Newton, circuito RC, ODE, matemáticas, ingeniería, modelado matemático',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ecuaciones Diferenciales: Campo de Direcciones',
    description: '¿Cómo predice la ciencia la dinámica de poblaciones, el enfriamiento de un café o la carga de un condensador? Explora ecuaciones diferenciales con visualizaciones interactivas.',
    url: 'https://meskeia.com/visualizador-ecuaciones-diferenciales/',
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
    title: 'Ecuaciones Diferenciales',
    description: 'Campo de direcciones, Lotka-Volterra animado y aplicaciones reales: enfriamiento Newton y circuitos RC como ODE.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Ecuaciones Diferenciales meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Ecuaciones Diferenciales: Campo de Direcciones y Lotka-Volterra',
  description: 'Visualizador interactivo de ecuaciones diferenciales ordinarias: campo de direcciones SVG con solución por método de Euler, sistema predador-presa Lotka-Volterra con Runge-Kutta 4 y diagrama de fase, ley de enfriamiento de Newton y circuito RC.',
  url: 'https://meskeia.com/visualizador-ecuaciones-diferenciales/',
  features: [
    'Campo de direcciones SVG interactivo con 5 ODEs predefinidas',
    'Trazar solución por método de Euler desde condición inicial',
    'Sistema Lotka-Volterra animado con Runge-Kutta 4',
    'Diagrama de fase (trayectoria orbital conejos vs lobos)',
    'Ley de enfriamiento de Newton con solución exacta',
    'Circuito RC: constante de tiempo τ = RC visualizada',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una ecuación diferencial y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una ecuación diferencial relaciona una función con sus derivadas para describir cómo cambia algo en el tiempo o el espacio. Se usan para modelar fenómenos reales: el enfriamiento de un objeto (ley de Newton), el crecimiento de poblaciones, la carga de un condensador, la trayectoria de un cohete o la difusión de calor. Prácticamente toda ley física de la naturaleza se expresa como una ecuación diferencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el campo de direcciones de una ecuación diferencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El campo de direcciones es una cuadrícula de pequeñas flechas que muestra la pendiente dy/dx en cada punto (x,y) del plano. Permite visualizar el comportamiento cualitativo de la solución sin resolver analíticamente la ecuación. Las curvas de solución son líneas que siguen la dirección de esas flechas desde una condición inicial dada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el método de Euler y Runge-Kutta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método de Euler avanza paso a paso usando solo la pendiente al inicio de cada intervalo: y_{n+1} = y_n + h·f(x_n,y_n). Es simple pero acumula error rápidamente. Runge-Kutta de orden 4 (RK4) promedia cuatro estimaciones de pendiente por paso, obteniendo un error del orden O(h⁵) por paso, lo que lo hace mucho más preciso para el mismo tamaño de paso h.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué describe el modelo de Lotka-Volterra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo de Lotka-Volterra describe la dinámica depredador-presa mediante dos ecuaciones diferenciales acopladas. Las presas crecen exponencialmente sin depredadores y disminuyen al ser cazadas; los depredadores mueren sin presas y crecen al comerlas. El sistema produce oscilaciones periódicas: cuando hay muchas presas, los depredadores prosperan; al menguar las presas, los depredadores también disminuyen y el ciclo se repite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este visualizador de ecuaciones diferenciales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a estudiantes de segundo año de ingeniería, física o matemáticas que cursan Ecuaciones Diferenciales Ordinarias (EDO) por primera vez. También es útil para quienes estudian modelado matemático, biología matemática o control automático y quieren ver la intuición geométrica detrás de los métodos numéricos antes de profundizar en la teoría.',
      },
    },
  ],
};
