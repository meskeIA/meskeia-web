import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Integrales: Área bajo la Curva | meskeIA',
  description: 'Visualiza la integral definida como sumas de Riemann interactivas. Ajusta el número de rectángulos n, los límites a y b, y compara izquierda, derecha, punto medio y trapecio con el valor exacto.',
  keywords: 'integral definida, suma de Riemann, área bajo la curva, integración numérica, regla del trapecio, punto medio, primitiva, teorema fundamental del cálculo, EBAU, Bachillerato, cálculo integral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-integral-area/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Integrales: Área bajo la Curva | meskeIA',
    description: 'Aproxima la integral definida con sumas de Riemann interactivas. Ajusta n, a y b, compara 4 métodos con el valor exacto.',
    url: 'https://meskeia.com/simulador-integral-area/',
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
    title: 'Simulador de Integrales: Área bajo la Curva | meskeIA',
    description: 'Visualiza la integral como suma de áreas de rectángulos cada vez más finos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Integrales: Área bajo la Curva',
  description: 'Simulador interactivo de la integral definida usando sumas de Riemann. Permite seleccionar entre 8 funciones (cuadrática, cúbica, parábola desplazada, seno, coseno, exponencial, hipérbola y gaussiana), ajustar los límites de integración a y b, el número de rectángulos n y comparar 4 métodos numéricos: izquierda, derecha, punto medio y trapecio. Muestra el valor exacto cuando hay primitiva analítica y calcula error absoluto y relativo. Ideal para entender el concepto de integral como límite de sumas y el teorema fundamental del cálculo.',
  url: 'https://meskeia.com/simulador-integral-area/',
  category: 'EducationalApplication',
  features: [
    '8 funciones predefinidas con primitiva analítica conocida',
    '4 métodos de aproximación: izquierda, derecha, punto medio, trapecio',
    'Ajuste interactivo de los límites a y b mediante sliders',
    'Hasta 500 rectángulos con visualización en tiempo real',
    'Comparación con el valor exacto (cuando hay primitiva elemental)',
    'Cálculo de error absoluto y relativo de la aproximación',
    'Distinción visual entre áreas positivas y negativas',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['integral definida', 'suma de Riemann', 'área', 'cálculo integral', 'trapecio', 'punto medio', 'EBAU', 'Bachillerato'],
});
