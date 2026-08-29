import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Fluidos: Ecuación de Bernoulli | meskeIA',
  description: 'Visualiza cómo la presión cae cuando un fluido se acelera en un estrechamiento (efecto Venturi). Tubería con manómetros, partículas animadas y ecuación de Bernoulli en directo.',
  keywords: 'ecuación de Bernoulli, mecánica de fluidos, efecto Venturi, presión dinámica, continuidad, caudal, Hidrodinámica, hidrostática, EBAU, Bachillerato, preparatoria, secundaria, educación media, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-fluidos-bernoulli/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Fluidos: Bernoulli y Venturi | meskeIA',
    description: 'Aceleración + caída de presión: la paradoja que explica los aviones, los venturímetros y las arterias.',
    url: 'https://meskeia.com/simulador-fluidos-bernoulli/',
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
    title: 'Simulador de Fluidos: Bernoulli | meskeIA',
    description: 'Tubería Venturi animada con manómetros: visualiza cómo más velocidad implica menos presión.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Fluidos: Ecuación de Bernoulli',
  description: 'Simulador interactivo del flujo de fluidos ideales según la ecuación de Bernoulli (P + ½ρv² + ρgh = constante). Selecciona entre 3 geometrías (tubería Venturi horizontal, tubería con desnivel, vena con estenosis), ajusta caudal Q, densidad ρ, ratio de estrechamiento y altura, y observa partículas animadas fluyendo, manómetros midiendo presión local y vectores de velocidad. Aplica la ecuación de continuidad (A·v = constante) y Bernoulli para calcular v y P en cada sección. Ideal para EBAU de Física y Bachillerato (España), preparatoria, secundaria y educación media (Latinoamérica), examen de admisión universitaria, biofísica y primero de Universidad.',
  url: 'https://meskeia.com/simulador-fluidos-bernoulli/',
  category: 'EducationalApplication',
  features: [
    'Tubería interactiva con 3 geometrías predefinidas',
    'Animación de partículas cuya velocidad sigue al caudal y a la sección del tubo',
    'Manómetros mostrando presión local en cada sección',
    'Aplicación automática de continuidad (A·v = cte) y Bernoulli',
    'Sliders para caudal, densidad, ratio de estrechamiento y altura',
    'Cálculo de velocidad, presión y verificación de la conservación',
    'Comparación con líquidos reales (agua, aceite, sangre, aire)',
  ],
  keywords: ['ecuación de Bernoulli', 'fluidos', 'efecto Venturi', 'presión', 'caudal', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'educación media', 'física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice la ecuación de Bernoulli y cuál es su significado físico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ecuación de Bernoulli establece que en un fluido ideal en movimiento la suma P + ½ρv² + ρgh es constante a lo largo de una línea de corriente. Físicamente, expresa la conservación de la energía por unidad de volumen: la presión estática P, la presión dinámica ½ρv² y la presión hidrostática ρgh se intercambian entre sí sin pérdidas. Cuando el fluido se acelera (por ejemplo, al entrar en un tubo más estrecho), su presión cae para mantener la suma constante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un avión vuela gracias a Bernoulli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El perfil alar de un avión tiene la cara superior más curvada que la inferior, lo que obliga al aire a recorrer más distancia y a fluir más rápido por encima del ala. Según Bernoulli, a mayor velocidad, menor presión, por lo que la presión bajo el ala supera a la de encima y genera una fuerza neta hacia arriba llamada sustentación. En la práctica intervienen también la deflexión de aire hacia abajo (principio de acción-reacción) y la viscosidad, pero Bernoulli es la aproximación más intuitiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el efecto Venturi y dónde se aplica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto Venturi es la caída de presión que experimenta un fluido al pasar por un estrechamiento de la tubería: al reducirse la sección, la velocidad aumenta (ecuación de continuidad A·v = cte) y la presión desciende. Se aplica en carburadores de motores, inyectores de combustible, venturímetros de medición de caudal, nebulizadores médicos y en el diseño de arterias artificiales para predecir zonas de trombosis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las limitaciones reales de la ecuación de Bernoulli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bernoulli asume fluido ideal (sin viscosidad), flujo estacionario (la velocidad no cambia con el tiempo), incompresible (densidad constante) y a lo largo de una línea de corriente. En la realidad, la viscosidad disipa energía (pérdidas de Darcy-Weisbach), el flujo turbulento invalida el modelo, y a velocidades próximas a la del sonido la densidad varía notablemente. Para agua y aire a velocidades moderadas es una aproximación muy precisa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se relacionan la ecuación de continuidad y Bernoulli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas ecuaciones se aplican juntas para resolver cualquier problema de fluidos. La ecuación de continuidad (A₁v₁ = A₂v₂ para fluido incompresible) impone la conservación de la masa: si la sección se reduce a la mitad, la velocidad se duplica. Ese cambio de velocidad se sustituye luego en Bernoulli para calcular la presión resultante. Son complementarias: continuidad dice cuánto cambia la velocidad; Bernoulli dice cuánto cambia la presión en consecuencia.',
      },
    },
  ],
};
