import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mecánica de Fluidos: Reynolds, Magnus, Bernoulli y Mach — meskeIA',
  description: 'Visualizador interactivo de mecánica de fluidos. Número de Reynolds (laminar vs turbulento), efecto Magnus (curva de la pelota), el mito de Bernoulli en la aviación y los números de Mach y cavitación. Con animaciones SVG en tiempo real.',
  keywords: [
    'número de Reynolds laminar turbulento',
    'efecto Magnus pelota curva fútbol',
    'principio Bernoulli avión mito',
    'Kutta-Joukowski sustentación',
    'número de Mach velocidad sonido',
    'cavitación burbujas presión',
    'mecánica de fluidos física',
    'flujo laminar turbulento visualizador',
    'aerodinámica ala avión',
    'física fluidos interactiva',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Mecánica de Fluidos: Reynolds, Magnus, Bernoulli y Mach — meskeIA',
    description: 'Visualiza en tiempo real el número de Reynolds, el efecto Magnus en deportes, por qué el avión NO vuela solo por Bernoulli, y los fenómenos de Mach y cavitación. Animaciones SVG interactivas.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-mecanica-fluidos/',
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
    title: 'Mecánica de Fluidos: Reynolds, Magnus y el mito de Bernoulli',
    description: 'Por qué la pelota curva, por qué el avión vuela de verdad, y qué es el número de Reynolds. Visualizador interactivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mecánica de Fluidos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mecánica de Fluidos: Reynolds, Magnus, Bernoulli y Mach',
  description: 'Visualizador interactivo de los grandes fenómenos de la mecánica de fluidos: número de Reynolds con animación laminar/turbulenta, efecto Magnus con cálculo de fuerza y trayectoria curva, el mito de Bernoulli en la aviación explicado con Kutta-Joukowski, y los números de Mach y cavitación.',
  url: 'https://meskeia.com/visualizador-mecanica-fluidos/',
  category: 'EducationalApplication',
  features: [
    'Número de Reynolds: fórmula Re = ρvL/μ con sliders de velocidad, longitud y viscosidad',
    'Animación SVG flujo laminar (azul, paralelo) vs turbulento (rojo, caótico)',
    'Zona de transición [2300-4000] con color naranja y texto dinámico',
    'Presets de fluidos: agua en tubería, miel, sangre en arteria',
    'Efecto Magnus: slider de rotación ω y velocidad v con trayectoria curva calculada',
    'Fuerza Magnus F = ρ·ω×v·r²·π con líneas de flujo y presión alta/baja',
    'Ejemplos deportivos: fútbol, tenis (topspin), béisbol (curveball)',
    'Bernoulli y el avión: perfil alar NACA simplificado con líneas de flujo',
    'Toggle Mito vs Realidad: Bernoulli solo vs Kutta-Joukowski completo',
    'Slider de ángulo de ataque 0°-20° con impacto en sustentación',
    'Número de Mach: M = v/c con regímenes subsónico, transónico, supersónico e hipersónico',
    'SVG de ondas de choque en régimen supersónico',
    'Cavitación: presión local vs presión de vapor con animación de burbujas',
    'Gratuito, sin registro, completamente en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el número de Reynolds y qué indica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El número de Reynolds es un parámetro adimensional definido como Re = ρvL/μ (densidad × velocidad × longitud característica / viscosidad dinámica). Indica si un fluido se mueve de forma laminar (capas ordenadas, Re < 2300) o turbulenta (caótica, Re > 4000). Entre 2300 y 4000 existe una zona de transición impredecible. Es fundamental en ingeniería hidráulica, aeronáutica y biomedicina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué curva la pelota en fútbol? ¿Qué es el efecto Magnus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto Magnus ocurre cuando un objeto gira mientras se desplaza por un fluido. La rotación arrastra el fluido hacia un lado, creando una diferencia de presiones: el lado donde el flujo va en el mismo sentido que la rotación experimenta menor presión, y el opuesto mayor presión. Esta diferencia genera una fuerza perpendicular a la trayectoria, desviando la pelota. La fuerza Magnus es F = ρ·ω×v·r²·π.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es cierto que los aviones vuelan gracias al principio de Bernoulli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una simplificación incorrecta. El principio de Bernoulli contribuye parcialmente, pero el mecanismo principal es la circulación descrita por el teorema de Kutta-Joukowski: el ala deflecta el flujo de aire hacia abajo y, por la tercera ley de Newton, el aire empuja el ala hacia arriba. La explicación del "camino igual" (las partículas de aire deben llegar al mismo tiempo por ambos lados) es un mito sin base física.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre vuelo subsónico, transónico y supersónico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los regímenes de vuelo se definen por el número de Mach (M = v/velocidad del sonido). Subsónico: M < 0,8 (aviones comerciales ~M 0,85). Transónico: 0,8 < M < 1,2, zona donde aparecen choques locales sobre el ala. Supersónico: M > 1,2, con ondas de choque cónicas bien definidas (caza militares, Concorde). Hipersónico: M > 5, con efectos aerotermodinámicos extremos (cápsulas de reentrada).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cavitación y por qué es problemática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cavitación ocurre cuando la presión local en un fluido cae por debajo de su presión de vapor: el líquido se evapora localmente formando burbujas. Al recuperar presión, esas burbujas colapsan violentamente generando microexplosiones que erosionan metales con el tiempo. Afecta a hélices de barcos, bombas hidráulicas y turbinas. Para evitarla se aumenta la presión de aspiración o se usan materiales más resistentes.',
      },
    },
  ],
};
