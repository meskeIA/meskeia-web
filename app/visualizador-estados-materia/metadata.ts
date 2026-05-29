import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estados de la Materia - Sólido, Líquido, Gas y Plasma | meskeIA',
  description: 'Descubre los 4 estados de la materia con partículas animadas, transiciones, diagrama de fases y datos curiosos. Explicador visual interactivo.',
  keywords: 'estados materia, sólido líquido gas plasma, transiciones, fusión, evaporación, sublimación, diagrama fases, punto triple, física visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estados de la Materia - Sólido, Líquido, Gas y Plasma',
    description: 'Partículas animadas, transiciones y diagrama de fases: la materia explicada visualmente.',
    url: 'https://meskeia.com/visualizador-estados-materia/',
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
    title: 'Estados de la Materia - Explicador Visual',
    description: 'De -273°C al plasma solar: los 4 estados de la materia con animaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estados Materia meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estados de la Materia - Sólido, Líquido, Gas y Plasma',
  description: 'Explicador visual interactivo sobre los 4 estados de la materia: partículas animadas, 6 transiciones, diagrama de fases del agua y datos curiosos.',
  url: 'https://meskeia.com/visualizador-estados-materia/',
  category: 'EducationalApplication',
  features: [
    'Partículas animadas en 4 estados diferentes',
    '6 transiciones con ejemplos cotidianos',
    'Diagrama de fases del agua interactivo',
    'Slider de temperatura con cambio de estado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los 4 estados de la materia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cuatro estados de la materia son sólido, líquido, gas y plasma. En el estado sólido las partículas están muy unidas y vibran en posición fija. En el líquido tienen movilidad pero mantienen contacto entre sí. En el gaseoso se mueven libremente y ocupan todo el espacio disponible. El plasma, el más abundante en el universo, es un gas ionizado a temperaturas extremadamente altas, como el interior del Sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se llaman los cambios de estado de la materia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los seis cambios de estado son: fusión (sólido → líquido), solidificación (líquido → sólido), vaporización (líquido → gas), condensación (gas → líquido), sublimación (sólido → gas) y deposición o sublimación inversa (gas → sólido). La mayoría ocurren al superar un punto de temperatura y presión determinado para cada sustancia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el diagrama de fases y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diagrama de fases es una gráfica de temperatura frente a presión que muestra en qué estado se encuentra una sustancia bajo cada combinación de condiciones. El punto triple es la única temperatura y presión en que los tres estados (sólido, líquido y gas) coexisten en equilibrio. Para el agua, el punto triple se encuentra a 0,01 °C y 611,7 Pa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el plasma se considera un cuarto estado de la materia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plasma se considera un estado diferente al gas porque sus átomos están ionizados: han perdido uno o más electrones y el conjunto está formado por iones positivos y electrones libres. Esto le otorga propiedades eléctricas únicas (conduce la electricidad y responde a campos magnéticos) que el gas neutro no tiene. Aproximadamente el 99% de la materia visible del universo se encuentra en estado de plasma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura pasa el agua de líquido a gas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A presión atmosférica estándar (1 atm / 101 325 Pa), el agua hierve a 100 °C. Sin embargo, esta temperatura varía con la presión: en la cima del Everest (≈ 0,34 atm) hierve a unos 70 °C, y en una olla a presión puede superar los 120 °C. La evaporación, a diferencia de la ebullición, ocurre a cualquier temperatura en la superficie del líquido.',
      },
    },
  ],
};
