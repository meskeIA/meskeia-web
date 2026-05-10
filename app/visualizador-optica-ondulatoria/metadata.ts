import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Óptica Ondulatoria: Interferencia, Difracción y Polarización — meskeIA',
  description: 'Visualizador interactivo de la naturaleza ondulatoria de la luz. Experimenta con la doble rendija de Young, difracción en rendija simple, polarización y propiedades del láser. Simulaciones SVG en tiempo real.',
  keywords: [
    'óptica ondulatoria',
    'interferencia luz doble rendija Young',
    'difracción rendija simple',
    'polarización luz ley Malus',
    'experimento Young franjas',
    'patrón interferencia',
    'longitud de onda color',
    'red de difracción',
    'luz coherente incoherente láser',
    'física ondulatoria interactiva',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Óptica Ondulatoria: Interferencia, Difracción y Polarización — meskeIA',
    description: 'Simula la doble rendija de Young, patrones de difracción, polarización con ley de Malus y propiedades del láser. Animaciones SVG en tiempo real.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-optica-ondulatoria/',
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
    title: 'Óptica Ondulatoria — Interferencia y Difracción',
    description: 'La naturaleza ondulatoria de la luz en acción: Young, difracción, polarización y coherencia láser.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Óptica Ondulatoria Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Óptica Ondulatoria: Interferencia, Difracción y Polarización',
  description: 'Visualizador interactivo de la física ondulatoria de la luz. Incluye simulación de la doble rendija de Young con cálculo de franjas brillantes y oscuras, difracción en rendija simple con patrón sinc², polarización con ley de Malus (I = I₀·cos²θ) y comparativa luz coherente/incoherente.',
  url: 'https://meskeia.com/visualizador-optica-ondulatoria/',
  category: 'EducationalApplication',
  features: [
    'Doble rendija de Young: patrón de franjas SVG con λ real y colores del espectro',
    'Sliders de separación d, longitud de onda λ (380-780 nm) y distancia pantalla D',
    'Difracción en rendija simple: intensidad sinc² vs ángulo en tiempo real',
    'Polarización con ley de Malus: I = I₀·cos²(θ), gráfica interactiva',
    'Comparativa luz coherente (láser) vs incoherente con propiedades visuales',
    'Colores reales del espectro visible (380-780 nm) mapeados a HSL',
    'Animaciones SVG de ondas circulares expandiéndose desde rendijas',
    'Gratuito, sin registro, disponible en español',
  ],
});
