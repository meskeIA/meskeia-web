import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Campo Magnético - Fuerza de Lorentz e Inducción | meskeIA',
  description:
    'Calcula la fuerza magnética sobre cargas y corrientes, el radio y el periodo del movimiento circular, el campo de hilos, espiras y solenoides, y la fem inducida por la ley de Faraday-Lenz.',
  keywords:
    'campo magnético, fuerza de Lorentz, ley de Faraday, ley de Lenz, inducción electromagnética, solenoide, espira, radio de ciclotrón, fem inducida, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-campo-magnetico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Campo Magnético | meskeIA',
    description:
      'Fuerza de Lorentz, movimiento circular de cargas, campo de corrientes e inducción electromagnética con animación',
    url: 'https://meskeia.com/simulador-campo-magnetico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Campo Magnético | meskeIA',
    description: 'Lorentz, Faraday y Lenz en un simulador interactivo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Campo Magnético',
  description:
    'Simulador interactivo de magnetismo en tres bloques: fuerza de Lorentz sobre una carga en movimiento con su trayectoria circular, campo creado por hilos, espiras y solenoides junto a la fuerza sobre un conductor, e inducción electromagnética con la fem generada por una espira giratoria o una barra deslizante.',
  url: 'https://meskeia.com/simulador-campo-magnetico/',
  category: 'EducationalApplication',
  features: [
    'Fuerza de Lorentz con ángulo entre velocidad y campo',
    'Radio, periodo y frecuencia del movimiento circular de una carga',
    'Partículas predefinidas: protón, electrón y partícula alfa',
    'Campo de hilo recto, espira circular y solenoide',
    'Fuerza sobre un conductor y entre dos hilos paralelos',
    'Fem inducida por espira giratoria y por barra sobre raíles',
    'Gráfica de flujo y fem en función del tiempo',
    'En español',
  ],
  keywords: ['campo magnético', 'fuerza de Lorentz', 'inducción', 'Faraday', 'Lenz', 'solenoide'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la fuerza magnética sobre una carga en movimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fuerza de Lorentz vale F = q·v·B·sen θ, donde q es la carga, v su velocidad, B el campo magnético y θ el ángulo entre la velocidad y el campo. Su dirección es perpendicular al plano que forman v y B, y se obtiene con el producto vectorial q·v×B. Dos consecuencias importantes: si la carga se mueve paralela al campo (θ = 0) la fuerza es nula, y como la fuerza es siempre perpendicular a la velocidad, nunca cambia el módulo de esta ni realiza trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué una carga describe una circunferencia dentro de un campo magnético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la fuerza magnética es siempre perpendicular a la velocidad, así que actúa como fuerza centrípeta: cambia la dirección del movimiento pero no su rapidez. Igualando q·v·B = m·v²/r se obtiene el radio r = m·v/(q·B) y el periodo T = 2π·m/(q·B). Lo llamativo del periodo es que no depende de la velocidad, y en eso se basa el funcionamiento del ciclotrón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la ley de Faraday sobre la inducción electromagnética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de Faraday establece que la fuerza electromotriz inducida en un circuito es igual a la variación del flujo magnético con el tiempo cambiada de signo: ε = −N·dΦ/dt, donde N es el número de espiras. Lo que induce corriente no es el campo en sí, sino su variación: un imán quieto junto a una bobina no genera nada, mientras que el mismo imán moviéndose sí. El flujo cambia si varía el campo, el área o la orientación entre ambos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el signo menos de la ley de Lenz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Indica que la corriente inducida circula en el sentido que se opone a la variación de flujo que la ha creado. Si el flujo aumenta, la corriente genera un campo que tiende a reducirlo; si disminuye, lo refuerza. No es un capricho: es la conservación de la energía. Si la corriente inducida favoreciera el cambio, el sistema se realimentaría y produciría energía de la nada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto vale el campo magnético dentro de un solenoide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el interior de un solenoide largo el campo es prácticamente uniforme y vale B = μ₀·n·I, donde n es el número de espiras por metro y μ₀ = 4π × 10⁻⁷ T·m/A. No depende del radio del solenoide ni de la posición dentro de él, siempre que se esté lejos de los extremos. Es la forma más habitual de generar un campo controlado en un laboratorio, y explica por qué un electroimán con más vueltas por centímetro es más potente con la misma corriente.',
      },
    },
  ],
};
