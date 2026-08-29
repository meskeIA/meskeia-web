import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Constructor de Personaje — Ficha completa para escritores | meskeIA',
  description: 'Crea personajes literarios completos: deseo, necesidad, miedo, herida, voz y arco. 19 dimensiones organizadas en 5 secciones. Genera una ficha copiable lista para usar en tu novela o guión.',
  keywords: ['constructor de personaje', 'ficha de personaje', 'creación de personajes', 'arco de personaje', 'escritura creativa', 'cómo crear personajes', 'desarrollo de personaje', 'personaje literario', 'protagonista', 'antagonista'],
  openGraph: {
    title: 'Constructor de Personaje — Ficha para escritores | meskeIA',
    description: 'Deseo, necesidad, miedo, herida, voz y arco en 19 dimensiones. Genera la ficha completa de tu personaje.',
    url: 'https://meskeia.com/constructor-personaje/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Constructor de Personaje — Ficha para escritores | meskeIA',
    description: 'Deseo, necesidad, miedo, herida, voz y arco en 19 dimensiones. Genera la ficha completa de tu personaje.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Constructor de Personaje — Ficha completa para escritores',
  description: 'Herramienta interactiva para crear personajes literarios: cubre 19 dimensiones en 5 secciones (superficie, psicología, voz, herida y arco). Genera una ficha copiable para tu novela o guión.',
  url: 'https://meskeia.com/constructor-personaje/',
  category: 'EducationalApplication',
  features: [
    'Sección Superficie: nombre, edad, profesión, origen y apariencia',
    'Sección Psicología: deseo, necesidad, miedo, mentira y contradicción',
    'Sección Voz: forma de hablar, tic verbal y lo que nunca diría',
    'Sección Herida: evento formativo, secreto y patrón en relaciones',
    'Sección Arco: punto de partida interno, destino y obstáculo',
    'Ficha final copiable con todas las dimensiones',
    'Personaje de ejemplo (Hamlet) para entender cada campo',
    'Indicador de progreso con campos completados',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el deseo y la necesidad de un personaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El deseo es lo que el personaje cree querer conscientemente: un objetivo externo y concreto que impulsa la acción. La necesidad es lo que realmente le falta a nivel interno para crecer como persona, aunque él mismo no lo sepa al principio. Un buen arco dramático surge precisamente de la tensión entre ambos: el personaje persigue su deseo pero el viaje le obliga a enfrentarse a su necesidad real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo crear un personaje literario con profundidad psicológica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un personaje con profundidad psicológica necesita al menos tres capas: una superficie visible (apariencia, profesión, forma de hablar), una psicología interna (deseo, miedo, mentira que se cuenta a sí mismo) y una herida de fondo (evento del pasado que explica sus patrones relacionales). La contradicción entre capas —por ejemplo, alguien que predica valentía pero actúa desde el miedo— es lo que hace al personaje creíble y memorable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el arco de personaje y cuántos tipos existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El arco de personaje describe la transformación interna que experimenta el protagonista a lo largo de la historia. Los tres tipos fundamentales son: el arco positivo (el personaje supera su mentira interna y crece), el arco negativo o de caída (sucumbe a ella o empeora) y el arco plano (no cambia él, sino el mundo que le rodea). No todos los personajes secundarios necesitan un arco; reservarlo para los protagonistas y antagonistas principales hace más eficaz la narrativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve definir el "tic verbal" y la "voz" de un personaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La voz del personaje es el conjunto de rasgos que hacen reconocible su diálogo: vocabulario, longitud de frases, uso de metáforas, registro formal o coloquial. El tic verbal (una muletilla, una expresión recurrente, un tema que siempre evita) añade autenticidad y permite distinguir personajes solo leyendo sus líneas, sin etiquetas de diálogo. En guion, un personaje con voz propia reduce la necesidad de stage directions y acelera la lectura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la "mentira" del personaje en la construcción narrativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mentira del personaje es la creencia falsa que sostiene sobre sí mismo o el mundo como mecanismo de defensa, generalmente originada en su herida de fondo. Por ejemplo, un personaje que vivió un abandono puede creer que "no merece ser querido". Esa creencia errónea guía sus decisiones de forma inconsciente y es el núcleo del conflicto interno. El clímax de la historia suele ser el momento en que el personaje acepta o rechaza definitivamente esa mentira.',
      },
    },
  ],
};
