import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Escritura Creativa — ¿Por dónde empezar? | meskeIA',
  description: 'Guía interactiva para escritores principiantes. Elige tu género literario, perspectiva narrativa y recibe tu hoja de ruta personalizada para empezar a escribir con confianza.',
  keywords: 'escritura creativa, como escribir un libro, escritor principiante, género literario, perspectiva narrativa, primera persona, novela, cuento, poesía, memorias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Escritura Creativa | meskeIA',
    description: 'Elige tu género, perspectiva narrativa y recibe tu hoja de ruta personalizada para empezar a escribir.',
    url: 'https://meskeia.com/orientador-escritura-creativa',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador de Escritura Creativa | meskeIA',
    description: 'Guía para escritores principiantes. Elige tu género y obtén tu hoja de ruta personalizada.',
  },
  other: {
    'application-name': 'Orientador de Escritura Creativa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Escritura Creativa',
  description: 'Guía interactiva para escritores principiantes. Selecciona tu género literario, perspectiva narrativa y recibe una hoja de ruta personalizada con estructura, kit de arranque y errores frecuentes a evitar.',
  url: 'https://meskeia.com/orientador-escritura-creativa/',
  category: 'EducationalApplication',
  features: [
    'Selección de 6 géneros literarios con descripción, extensión y ejemplos',
    'Orientación sobre perspectiva narrativa (1.ª, 3.ª omnisciente, 3.ª limitada, 2.ª persona)',
    'Estructura básica personalizada según el género elegido',
    'Kit de arranque con preguntas clave antes de escribir la primera línea',
    'Errores frecuentes del escritor principiante específicos por género',
    'Hoja de ruta personalizada con tus respuestas del kit de arranque',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por dónde empiezo a escribir si soy principiante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo más importante antes de escribir es elegir el género que te resulte más natural y una perspectiva narrativa con la que te sientas cómodo. Define el conflicto central de tu historia y el perfil básico de tu protagonista. Con esos elementos mínimos ya puedes escribir la primera escena sin bloqueos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre primera persona y tercera persona en una novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La primera persona ("yo") ofrece acceso inmediato a los pensamientos del narrador y crea intimidad con el lector, pero limita lo que puedes mostrar a lo que el narrador conoce. La tercera persona omnisciente permite moverse entre múltiples personajes y escenas con libertad total. La tercera limitada combina ambas ventajas: sigue a un solo personaje pero en voz externa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas páginas debe tener una novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una novela convencional tiene entre 70.000 y 100.000 palabras (unas 250-350 páginas en formato estándar). Las novelas juveniles o de género suelen ser más cortas (50.000-80.000 palabras), mientras que la fantasía épica puede superar las 150.000. Para un primer libro, lo más recomendable es apuntar a entre 80.000 y 100.000 palabras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el error más frecuente del escritor principiante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El error más habitual es intentar que el primer borrador sea perfecto. El primer borrador existe para explorar la historia, no para publicar. Otros errores frecuentes incluyen comenzar la historia demasiado antes del conflicto real, dar demasiada información al lector en los primeros capítulos (infodump) y crear personajes sin motivaciones claras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor planificar la novela antes de escribir o ir improvisando?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del estilo de cada escritor. Los "plotters" planifican estructura, arcos y personajes antes de escribir la primera página; los "pantsers" descubren la historia mientras la escriben. La mayoría de escritores usa un enfoque intermedio: un esquema flexible con puntos clave y libertad para improvisar. Lo importante es conocer al menos el final antes de empezar.',
      },
    },
  ],
};
