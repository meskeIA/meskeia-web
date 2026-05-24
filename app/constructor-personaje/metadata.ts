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
