/**
 * Fuente única del blog de Delegum.
 *
 * Cada post es una entrada de este array (no hay base de datos ni CMS: el repo
 * es el histórico). Publicar = añadir una entrada; editar = modificarla; borrar
 * = quitarla. Despliegue por git push (SSG).
 *
 * Política editorial: 2 posts/mes (días 1 y 15), cortos, basados en una noticia
 * real con su fuente. Histórico máximo ~25 posts (1 año): al añadir uno nuevo,
 * retirar el más antiguo si se supera ese tope.
 *
 * `cuerpo` es un array de párrafos (texto plano). `fichaSlug` enlaza (opcional)
 * con la ficha de Datos Fiscales relacionada.
 */

export interface Post {
  /** Ancla URL: /blog/<slug>/ — kebab-case, sin acentos. */
  slug: string;
  titulo: string;
  /** Fecha de publicación, ISO YYYY-MM-DD. */
  fecha: string;
  /** 1-2 frases: resumen para el índice, la metadescription y el JSON-LD. */
  resumen: string;
  /** Cuerpo del post, un elemento por párrafo. */
  cuerpo: string[];
  /** Nombre de la fuente/medio de la noticia (opcional). */
  fuente?: string;
  /** URL de la noticia original (opcional). */
  fuenteUrl?: string;
  /** Slug de la ficha de datos-fiscales relacionada (opcional, enlazado interno). */
  fichaSlug?: string;
}

export const POSTS: Post[] = [
  {
    slug: 'delegum-ya-esta-en-marcha',
    titulo: 'Delegum ya está en marcha',
    fecha: '2026-06-20',
    resumen:
      'Presentamos Delegum: la plataforma que reúne la fiscalidad, el derecho laboral y las finanzas de España en un solo sitio, con datos verificados y herramientas gratuitas para entender qué te afecta y por qué.',
    cuerpo: [
      'La fiscalidad, el derecho laboral y las finanzas se explican casi siempre en un idioma que solo entiende quien trabaja en ello. Saber qué impuesto te toca, cuánto vas a pagar, si un dato sigue vigente o qué significa un término concreto suele costar más de lo que debería. Delegum nace para cambiar eso.',
      'Hemos reunido en un solo sitio todo lo necesario para orientarte: datos fiscales verificados con su fuente y su fecha, calculadoras para hacer el número tú mismo, guías que acompañan decisiones completas como comprar una casa o gestionar una herencia, un glosario que traduce la jerga del gremio y un asistente de IA que resuelve consultas reales conectándose a Claude, ChatGPT o Mistral.',
      'Todo con el mismo compromiso: información clara y orientativa —nunca un sustituto del profesional cuando la decisión lo exige—, gratuita, sin registro y sin recopilar tus datos personales.',
      'Y a partir de ahora, cada quince días publicaremos aquí una novedad fiscal, laboral o financiera explicada en pocas líneas. Bienvenido a Delegum.',
    ],
  },
];

/** Posts ordenados del más reciente al más antiguo. */
export function getPostsOrdenados(): Post[] {
  return [...POSTS].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Devuelve un post por su slug, o undefined si no existe. */
export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
