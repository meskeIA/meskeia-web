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
    slug: 'bienvenida-al-blog-de-delegum',
    titulo: 'Bienvenido al blog de Delegum',
    fecha: '2026-06-20',
    resumen:
      'Cada quincena, un resumen breve y claro de una novedad fiscal, laboral o financiera que te afecta, con su fuente y el enlace a nuestras herramientas.',
    cuerpo: [
      'Delegum reúne la fiscalidad, el derecho laboral y las finanzas de España en un solo sitio: datos verificados, calculadoras, guías paso a paso, un glosario y un asistente de IA. Este blog es la pieza que faltaba: la actualidad.',
      'Cada día se publican decenas de noticias fiscales, laborales y financieras, y no siempre es fácil saber cuáles importan de verdad ni qué significan. Aquí elegiremos una cada quince días y la explicaremos en pocas líneas: qué ha cambiado, a quién afecta y dónde calcularlo o consultarlo.',
      'Sin tecnicismos innecesarios y sin decidir por ti: solo información clara, con su fuente y, cuando proceda, el enlace a la ficha de datos o a la calculadora correspondiente. Nos vemos los días 1 y 15 de cada mes.',
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
