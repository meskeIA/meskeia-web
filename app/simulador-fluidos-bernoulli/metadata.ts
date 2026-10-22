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
  // Hallazgo 3409 (22/10/2026): tres de las siete prometían lo que la app no hace (un deslizador
  // de densidad, una «verificación de la conservación» que no se muestra, el aire como líquido).
  features: [
    'Tres geometrías: Venturi horizontal, tubería con desnivel y vena con estenosis',
    'Deslizadores de caudal (0,1-10 L/s), estrechamiento D₂/D₁ (0,25-1), desnivel (0-10 m) y presión de entrada',
    'Cuatro fluidos con su densidad: agua, aceite, sangre y aire',
    'Tabla por sección con diámetro, área, velocidad por continuidad y presión absoluta por Bernoulli',
    'Manómetros y vectores de velocidad dibujados en la tubería, con partículas animadas que siguen al caudal',
    'Aviso de cavitación cuando la presión cae por debajo de la de vapor del agua',
    '12 casos para clase con corrección automática y modo de práctica aleatorio',
  ],
  keywords: ['ecuación de Bernoulli', 'fluidos', 'efecto Venturi', 'presión', 'caudal', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'educación media', 'física'],
});

/**
 * Hallazgo 3245 (19/10/2026): estas dos preguntas estaban también en la FAQ visible con OTRA
 * respuesta. Sobre el avión se contradecían —aquí Bernoulli y Newton describían la misma fuerza,
 * allí eran dos aportaciones que se suman— y el umbral de la compresibilidad cambiaba de una boca
 * a otra. Ahora las dos bocas leen estas constantes (CLAUDE.md §1.ter). En el avión manda la
 * versión de aquí: la diferencia de presión ES la sustentación, y la desviación del aire hacia
 * abajo es la otra forma de contar la misma fuerza.
 */
export const PREGUNTA_AVION = '¿Por qué vuela un avión? ¿Es solo por Bernoulli?';
export const RESPUESTA_AVION =
  'Bernoulli es una parte de la explicación, no toda. El ala, por su forma y sobre todo por su ángulo de ataque, desvía el aire hacia abajo, y por la tercera ley de Newton el aire empuja el ala hacia arriba. Ese mismo flujo va más rápido sobre la cara superior que bajo la inferior, y Bernoulli relaciona esa mayor velocidad con una presión menor encima del ala: la diferencia de presión entre las dos caras es la sustentación, así que ambos enfoques describen la misma fuerza y se complementan. Por eso un avión puede volar invertido ajustando el ángulo de ataque, algo que una explicación basada solo en la curvatura del ala no justifica.';
export const PREGUNTA_LIMITACIONES = '¿Cuáles son las limitaciones reales de la ecuación de Bernoulli?';
export const RESPUESTA_LIMITACIONES =
  'Bernoulli asume fluido ideal (sin viscosidad), flujo estacionario (la velocidad no cambia con el tiempo), incompresible (densidad constante) y a lo largo de una línea de corriente. No se aplica directamente a fluidos viscosos (miel, aceite muy frío), al flujo turbulento, a tubos con codos bruscos ni a fluidos que se calientan o enfrían: la viscosidad disipa energía (pérdidas de Darcy-Weisbach). En los gases, la densidad varía notablemente a velocidades próximas a la del sonido, y con más razón a velocidades supersónicas. Para agua y aire a velocidades moderadas es una aproximación muy precisa.';

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
      // Hallazgo 2369 (28/09/2026): la respuesta anterior atribuía la mayor velocidad sobre el
      // ala a que el aire «recorre más distancia» por la cara curvada, la teoría del tiempo de
      // tránsito igual que la NASA da por errónea (Glenn Research Center, «Incorrect Lift
      // Theory #1»: el aire de arriba llega ANTES al borde de salida). Desde el hallazgo 3245 la
      // FAQ visible lee esta misma constante.
      name: PREGUNTA_AVION,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_AVION,
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
      name: PREGUNTA_LIMITACIONES,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_LIMITACIONES,
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
