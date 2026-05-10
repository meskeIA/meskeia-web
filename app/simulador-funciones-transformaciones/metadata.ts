import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Transformaciones de Funciones — Gráficas Interactivas | meskeIA',
  description: 'Explora cómo a·g(b·(x−c))+d transforma cualquier función. Mueve amplitud, frecuencia y desfase en tiempo real. Ideal para secundaria, Bachillerato y cualquier estudiante de álgebra.',
  keywords: 'funciones, transformaciones de funciones, traslación, amplitud, frecuencia, desfase, Bachillerato, álgebra, gráficas, seno, coseno, cuadrática, valor absoluto, raíz cuadrada',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-funciones-transformaciones/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Transformaciones de Funciones | meskeIA',
    description: 'Visualiza en tiempo real cómo a, b, c y d transforman una función base. Sin registro, gratis.',
    url: 'https://meskeia.com/simulador-funciones-transformaciones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Transformaciones de Funciones | meskeIA',
    description: 'Ajusta amplitud, frecuencia y desfase para ver cómo se transforma cualquier función.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Transformaciones de Funciones',
  description: 'Simulador interactivo para explorar las transformaciones de funciones matemáticas mediante la fórmula f(x) = a·g(b·(x−c))+d. Selecciona una función base (seno, coseno, cuadrática, valor absoluto, raíz cuadrada) y ajusta los parámetros a, b, c y d con sliders para ver el efecto en la gráfica en tiempo real.',
  url: 'https://meskeia.com/simulador-funciones-transformaciones/',
  category: 'EducationalApplication',
  features: [
    'Selección de función base: sin, cos, x², |x|, √x',
    'Control interactivo de amplitud (a), frecuencia (b), desfase horizontal (c) y vertical (d)',
    'Visualización simultánea de la función original y la transformada',
    'Etiqueta dinámica con la ecuación completa en el canvas',
    'Panel descriptivo con el efecto de cada parámetro en lenguaje natural',
    'Detección automática de modo oscuro/claro',
    'Escala Retina/HiDPI para pantallas de alta resolución',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: ['funciones', 'transformaciones', 'traslación', 'amplitud', 'frecuencia', 'Bachillerato', 'álgebra', 'gráficas'],
});
