import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Modelo Atómico de Bohr: Espectro del Hidrógeno | meskeIA',
  description: 'Elige el salto del electrón entre dos niveles del hidrógeno y calcula con el modelo de Bohr y la ecuación de Rydberg la energía de cada nivel, la del fotón, su longitud de onda y su color: series de Lyman, Balmer y Paschen.',
  keywords: 'modelo atomico de bohr, modelo de bohr, espectro del hidrogeno, ecuacion de rydberg, constante de rydberg, serie de balmer, serie de lyman, serie de paschen, niveles de energia, energia de ionizacion, simulador, quimica, fisica, bachillerato, preparatoria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-modelo-bohr/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Modelo Atómico de Bohr | meskeIA',
    description: 'Saltos del electrón en el hidrógeno: energía, longitud de onda y color del fotón, con las series de Lyman, Balmer y Paschen.',
    url: 'https://meskeia.com/simulador-modelo-bohr/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Modelo Atómico de Bohr | meskeIA',
    description: 'Niveles de energía del hidrógeno y su espectro con la ecuación de Rydberg',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Modelo Atómico de Bohr — Espectro del Hidrógeno',
  description: 'Simulador del modelo de Bohr para el átomo de hidrógeno. Elige el nivel de partida y el de llegada del electrón (de 1 a 7, o el electrón libre) y obtén la energía de cada nivel, el radio de su órbita, la energía, la frecuencia y la longitud de onda del fotón emitido o absorbido, la serie espectral y su color.',
  url: 'https://meskeia.com/simulador-modelo-bohr/',
  category: 'EducationalApplication',
  features: [
    'Energía de los niveles del hidrógeno, Eₙ = −13,6/n² eV, y radio de cada órbita',
    'Saltos de emisión y de absorción entre los niveles 1 a 7 y la ionización (n = ∞)',
    'Longitud de onda con la ecuación de Rydberg, frecuencia y energía del fotón en eV y J',
    'Serie espectral (Lyman, Balmer, Paschen, Brackett, Pfund, Humphreys) y región del espectro',
    'Diagrama de niveles de energía a escala con el salto y el fotón',
    'Espectro visible de emisión y de absorción del hidrógeno con la línea elegida marcada',
    'Comparación con el resultado que da la constante de Rydberg redondeada del libro de texto',
  ],
  keywords: ['modelo atómico de Bohr', 'espectro del hidrógeno', 'ecuación de Rydberg', 'serie de Balmer', 'niveles de energía', 'simulador de química'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice el modelo atómico de Bohr?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Que el electrón del hidrógeno solo puede ocupar ciertas órbitas, cada una con una energía fija, Eₙ = −13,6/n² eV, y que al saltar de una a otra emite o absorbe un fotón con exactamente la diferencia de energía entre ellas. Niels Bohr lo propuso en 1913 para explicar por qué el hidrógeno solo emite unas longitudes de onda concretas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la longitud de onda de un salto del electrón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con la ecuación de Rydberg, 1/λ = R·(1/n₁² − 1/n₂²), con n₁ el nivel inferior y R ≈ 1,097·10⁷ m⁻¹. Para el salto de 3 a 2 sale 1/λ = 1,097·10⁷·(1/4 − 1/9) y λ ≈ 656 nm, la línea roja Hα. También se puede calcular la energía, ΔE = 13,6·(1/4 − 1/9) = 1,89 eV, y pasar a longitud de onda con λ = 1240/ΔE en nm.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las series de Lyman, Balmer y Paschen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son los grupos de líneas del espectro del hidrógeno según el nivel al que llega (o del que sale) el electrón: Lyman acaba en el nivel 1 y cae entera en el ultravioleta; Balmer acaba en el 2 y es la única con líneas visibles; Paschen acaba en el 3 y está en el infrarrojo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la energía de los niveles es negativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque se toma como cero la energía del electrón libre, lejos del núcleo. Un electrón ligado tiene menos energía, así que es negativa: −13,6 eV en el nivel 1 y −3,4 eV en el 2. Para arrancarlo desde el fundamental hay que aportar 13,6 eV, la energía de ionización del hidrógeno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué mi resultado de Hα da 656,3 nm y otras fuentes dicen 656,5 nm?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con la constante de Rydberg redondeada del libro, 1,097·10⁷ m⁻¹, sale 656,3 nm. Con la del hidrógeno corregida por el movimiento del núcleo, 1,09678·10⁷ m⁻¹, sale 656,47 nm, que es la longitud de onda medida en el vacío. En el aire la línea se mide en 656,28 nm, porque la luz va algo más lenta.',
      },
    },
  ],
};
