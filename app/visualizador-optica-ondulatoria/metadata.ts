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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la óptica ondulatoria y en qué se diferencia de la óptica geométrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La óptica ondulatoria estudia la luz como una onda electromagnética, lo que permite explicar fenómenos como la interferencia, la difracción y la polarización. La óptica geométrica, en cambio, trata la luz como rayos rectilíneos y funciona bien solo cuando los obstáculos son mucho mayores que la longitud de onda. Cuando la luz pasa por rendijas o aberturas pequeñas, los efectos ondulatorios se vuelven imprescindibles para predecir el patrón observado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el experimento de la doble rendija de Young?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el experimento de Young, la luz pasa por dos rendijas separadas una distancia d, generando dos frentes de onda coherentes que interfieren entre sí. Las franjas brillantes aparecen donde las diferencias de camino óptico son múltiplos enteros de la longitud de onda (d·sin θ = m·λ) y las oscuras donde son semienteros. La separación entre franjas aumenta al acercar las rendijas o al usar luz de mayor longitud de onda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la ley de Malus sobre la polarización de la luz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de Malus establece que cuando luz polarizada linealmente atraviesa un polarizador, la intensidad transmitida es I = I₀·cos²θ, donde θ es el ángulo entre el plano de polarización de la luz incidente y el eje de transmisión del polarizador. A 0° pasa toda la intensidad, a 45° la mitad y a 90° no pasa nada. Se aplica en pantallas LCD, filtros de fotografía y gafas de sol polarizadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre luz coherente (láser) y luz incoherente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La luz coherente, como la del láser, tiene todas sus ondas en fase y con la misma longitud de onda, lo que permite observar interferencias estables y nítidas. La luz incoherente, como la solar o la incandescente, combina múltiples longitudes de onda con fases aleatorias; sus patrones de interferencia se promedian y desaparecen. Por eso los experimentos de interferencia requieren fuentes láser o iluminación a través de una rendija muy estrecha.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de óptica ondulatoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de Bachillerato y primer curso universitario que preparan física ondulatoria o óptica. También sirve a docentes que quieren mostrar en clase cómo varían los patrones de difracción e interferencia al cambiar parámetros como la longitud de onda o la separación entre rendijas. Todo funciona en el navegador sin instalar nada.',
      },
    },
  ],
};
