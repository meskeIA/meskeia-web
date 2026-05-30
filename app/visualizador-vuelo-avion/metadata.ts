import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Por qué Vuelan los Aviones — Bernoulli y el Ángulo de Ataque | meskeIA',
  description: 'La explicación correcta del vuelo: por qué Bernoulli solo es parte de la historia, qué es el ángulo de ataque y cómo los aviones pueden volar invertidos.',
  keywords: ['vuelo avión física', 'bernoulli vuelo', 'ángulo de ataque', 'sustentación aerodinámica', 'perfil alar', 'física bachillerato', 'aerodinámica', 'cómo vuelan los aviones'],
  openGraph: {
    title: 'Por qué Vuelan los Aviones — Bernoulli y el Ángulo de Ataque',
    description: 'Lo que los libros no explican bien sobre el vuelo: Bernoulli es real pero incompleto. La verdadera clave es el ángulo de ataque y la 3ª ley de Newton.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Vuelo de Aviones',
  description: 'Explicación física del vuelo: Bernoulli, ángulo de ataque, sustentación y por qué los aviones pueden volar invertidos.',
  educationalLevel: 'secondary',
  inLanguage: 'es',
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué vuelan los aviones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los aviones vuelan gracias a la sustentación aerodinámica generada por las alas. Cuando el ala se mueve a través del aire, desvía el flujo de aire hacia abajo (por su geometría y su ángulo de ataque). Por la tercera ley de Newton, el aire empuja el ala hacia arriba con una fuerza igual y opuesta. El efecto Bernoulli también contribuye: la forma curva del ala hace que el aire sobre ella viaje más rápido y a menor presión que el aire bajo ella, añadiendo presión ascendente. En la práctica, el ángulo de ataque es el factor dominante, especialmente en maniobras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es correcto explicar el vuelo solo con el principio de Bernoulli?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No completamente. La explicación clásica de los libros escolares dice que el aire de arriba recorre una distancia mayor por la forma curva del ala y por eso va más rápido, creando menor presión. Pero esto asume incorrectamente que las dos mitades del flujo deben reencontrarse al mismo tiempo (teoría del "tiempo igual"), lo cual no ocurre. La realidad es que el efecto Bernoulli sí genera parte de la sustentación, pero la causa principal es la deflexión del flujo de aire por el ángulo de ataque, explicada por la tercera ley de Newton. La prueba es que los aviones pueden volar con alas simétricas e incluso en posición invertida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ángulo de ataque y qué ocurre si es demasiado grande?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ángulo de ataque es el ángulo entre la cuerda del ala (línea imaginaria entre el borde de ataque y el de salida) y la dirección del flujo de aire que llega. A mayor ángulo, mayor desviación del aire hacia abajo y mayor sustentación, hasta cierto límite. Si el ángulo supera el ángulo crítico (generalmente entre 15° y 20°), el flujo de aire se separa de la superficie superior del ala de forma turbulenta: es la entrada en pérdida (stall). En pérdida, la sustentación cae bruscamente y la resistencia aumenta. La recuperación requiere reducir el ángulo de ataque, normalmente bajando el morro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puede un avión volar invertido si el ala tiene una curva asimétrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un avión puede volar invertido porque la sustentación depende principalmente del ángulo de ataque, no de la asimetría del perfil alar. Al volar invertido, el piloto inclina el morro hacia abajo para mantener un ángulo de ataque positivo respecto al aire relativo, lo que genera la deflexión necesaria. Los aviones de acrobacia usan perfiles simétricos (igual curvatura arriba y abajo) para facilitar el vuelo invertido sostenido. Los aviones comerciales, con perfiles muy asimétricos y mayor eficiencia en vuelo normal, pueden volar invertidos pero de forma menos eficiente y durante tiempo limitado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre sustentación y empuje en un avión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son dos fuerzas independientes con funciones distintas. La sustentación es la fuerza perpendicular a la trayectoria de vuelo que mantiene el avión en el aire; la generan las alas al interactuar con el flujo de aire. El empuje es la fuerza que propulsa el avión hacia adelante; lo generan los motores (reactores o hélices). Para mantener vuelo nivelado, la sustentación debe equilibrar el peso y el empuje debe superar la resistencia aerodinámica (drag). En el despegue y el ascenso se necesita más empuje que en crucero, donde los motores trabajan a un régimen menor.',
      },
    },
  ],
};
