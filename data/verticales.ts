/**
 * Fuente única de los portales verticales de marca propia de meskeIA.
 *
 * Usada por la "constelación" de la home (components/home/VerticalesPortales).
 * Pensada para reutilizarse también en el footer global (opción B) sin duplicar:
 * añadir un 5º vertical = una entrada aquí + su paleta en el .module.css.
 *
 * El favicon es local (public/<id>/favicon.svg): nítido y sin peticiones
 * cross-domain. `?from=meskeia` permite atribuir en el portal destino el tráfico
 * que llega desde la marca madre.
 */
export interface VerticalPortal {
  /** id = clave de paleta en el CSS module y carpeta del favicon en public/. */
  id: 'delegum' | 'cronicum' | 'stemum' | 'coquinum';
  marca: string;
  /** Descripción corta (1-2 líneas) del nicho del portal. Usada en la home (A). */
  descripcion: string;
  /** Tema en una palabra. Usado en la tira del footer (B), 2ª línea de la card. */
  tema: string;
  /** Dominio destino con atribución. */
  url: string;
  /** Ruta local al favicon SVG. */
  favicon: string;
}

export const VERTICALES: VerticalPortal[] = [
  {
    id: 'delegum',
    marca: 'Delegum',
    descripcion: 'Fiscal, laboral y financiero de España',
    tema: 'Fiscalidad',
    url: 'https://delegum.com/?from=meskeia',
    favicon: '/delegum/favicon.svg',
  },
  {
    id: 'cronicum',
    marca: 'Cronicum',
    descripcion: 'La historia de la humanidad, contada de forma interactiva',
    tema: 'Historia',
    url: 'https://cronicum.com/?from=meskeia',
    favicon: '/cronicum/favicon.svg',
  },
  {
    id: 'stemum',
    marca: 'Stemum',
    descripcion: 'Ciencia y tecnología para entender visualizando',
    tema: 'Ciencia',
    url: 'https://stemum.com/?from=meskeia',
    favicon: '/stemum/favicon.svg',
  },
  {
    id: 'coquinum',
    marca: 'Coquinum',
    descripcion: 'Cocina y gastronomía con precisión',
    tema: 'Gastronomía',
    url: 'https://coquinum.com/?from=meskeia',
    favicon: '/coquinum/favicon.svg',
  },
];
