import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geometría de Fractales - Koch, Sierpinski y Mandelbrot | meskeIA',
  description: 'Explora los fractales interactivamente: copo de Koch, triángulo de Sierpinski, alfombra, curva de Hilbert. Autosimilitud, dimensión fractal y fractales en la naturaleza.',
  keywords: 'fractales, Sierpinski, Koch, Mandelbrot, autosimilitud, dimensión fractal, geometría fractal, Hilbert, fractales naturaleza, copo de nieve Koch',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Geometría de Fractales - Koch, Sierpinski y Mandelbrot',
    description: 'Genera fractales paso a paso con sliders interactivos: Sierpinski, Koch, alfombra y Hilbert. Descubre la autosimilitud y la dimensión fractal.',
    url: 'https://meskeia.com/visualizador-geometria-fractales',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geometría de Fractales - Explicador Visual Interactivo',
    description: 'Triángulo de Sierpinski, copo de Koch, alfombra y Hilbert: genera fractales paso a paso y descubre por qué la naturaleza los usa.',
  },
  other: { 'application-name': 'Geometría Fractales meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Geometría de Fractales - Koch, Sierpinski y Mandelbrot',
  description: 'Explicador visual interactivo sobre fractales: triángulo de Sierpinski, copo de Koch, alfombra de Sierpinski, curva de Hilbert. Autosimilitud, dimensión fractal, fractales en la naturaleza y aplicaciones tecnológicas.',
  url: 'https://meskeia.com/visualizador-geometria-fractales/',
  category: 'EducationalApplication',
  features: [
    'Genera 4 fractales clásicos con sliders de iteración interactivos',
    'Triángulo de Sierpinski, copo de Koch, alfombra y curva de Hilbert',
    'Cálculo de perímetro y área por iteración',
    'Fractales en la naturaleza: helechos, brócoli, costas, pulmones',
    'Conjunto de Mandelbrot y dimensión fractal de Hausdorff explicados',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
