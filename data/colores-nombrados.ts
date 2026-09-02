/**
 * Diccionario de colores con nombre en español.
 *
 * Vivía dentro de `app/identificador-color-camara/page.tsx` hasta el 02/09/2026, cuando el
 * Convertidor de Colores pasó a necesitar la misma tabla: allí se navega por nombre para
 * ELEGIR un color, y aquí se calcula el nombre a partir de un RGB para NOMBRARLO. Es la
 * misma tabla leída en las dos direcciones, así que se comparte en vez de duplicarse.
 *
 * ── DOS CONJUNTOS, Y LA DISTINCIÓN IMPORTA ────────────────────────────────────────────
 *
 * `basico: true` (48 colores) es un conjunto de COBERTURA: se eligió para que cualquier RGB
 * del mundo tenga un vecino razonablemente cercano, no para ser un catálogo bonito. Es el
 * único que usa `nombreDeColor()`, y por eso NO se le añaden nombres sin medir el efecto:
 * cada entrada nueva le roba territorio a sus vecinas y cambia el nombre que la app de
 * cámara le da a colores que hoy acierta.
 *
 * ⚠️ `tests/apps/identificador-color-camara.spec.ts` fija cinco nombres exactos resueltos a
 * mano (#FF0000 → «Rojo», #4682B4 → «Azul acero», #2E86AB → «Azul petróleo»…). Tocar un HEX
 * de los básicos, o marcar `basico: true` en uno nuevo, puede romperlo — que es exactamente
 * para lo que está ese test.
 *
 * `basico: false` (23 colores) son pigmentos y nombres de uso común que se AÑADEN a la lista
 * navegable del convertidor y no participan en el cálculo del vecino más cercano. Sirven
 * para teclear «ocre» y llegar a un color; no para que a alguien con daltonismo la cámara le
 * conteste «Púrpura de Tiro» cuando lo útil es oír «Morado».
 *
 * ── DE DÓNDE SALEN LOS VALORES ────────────────────────────────────────────────────────
 *
 * Muchos de estos nombres NO tienen un HEX canónico: son pigmentos históricos o palabras de
 * uso corriente, y cada fuente les da un valor algo distinto. Cuando es así, la entrada lo
 * declara en `nota` y la interfaz lo muestra, en vez de presentar el número como si fuera
 * oficial.
 *
 * ⚠️ Deliberadamente NO se incluyen nombres de carta comercial de pintura («azul báltico»,
 * «rojo carruaje» y similares). No es purismo: cada fabricante los mezcla distinto, así que
 * no existe un valor correcto que dar, y publicar uno sería inventarse una autoridad que no
 * tenemos. Si alguien pide añadirlos, esta es la razón por la que no están.
 */

export type FamiliaColor =
  | 'neutro'
  | 'rojo'
  | 'naranja'
  | 'marron'
  | 'amarillo'
  | 'verde'
  | 'azul'
  | 'violeta';

export interface ColorNombrado {
  /** Nombre en español, tal y como se muestra. */
  nombre: string;
  /** Siempre con almohadilla y en MAYÚSCULAS: '#2E86AB'. */
  hex: string;
  familia: FamiliaColor;
  /** true = entra en el conjunto de cobertura de `nombreDeColor()`. Leer la cabecera. */
  basico: boolean;
  /** Otras formas de teclearlo en el buscador (se comparan sin tildes ni mayúsculas). */
  alias?: string[];
  /** Referencia del valor cuando no hay un HEX canónico único. */
  nota?: string;
}

export const FAMILIAS_COLOR: ReadonlyArray<{ id: FamiliaColor; etiqueta: string }> = [
  { id: 'neutro', etiqueta: 'Neutros' },
  { id: 'rojo', etiqueta: 'Rojos y rosas' },
  { id: 'naranja', etiqueta: 'Naranjas' },
  { id: 'marron', etiqueta: 'Marrones' },
  { id: 'amarillo', etiqueta: 'Amarillos' },
  { id: 'verde', etiqueta: 'Verdes' },
  { id: 'azul', etiqueta: 'Azules' },
  { id: 'violeta', etiqueta: 'Violetas' },
];

export const COLORES_NOMBRADOS: ColorNombrado[] = [
  // ── Neutros ─────────────────────────────────────────────────────────────────────────
  { nombre: 'Negro', hex: '#000000', familia: 'neutro', basico: true },
  { nombre: 'Carbón', hex: '#36454F', familia: 'neutro', basico: false, alias: ['antracita'], nota: 'Gris muy oscuro con matiz azulado. Valor convencional.' },
  { nombre: 'Gris oscuro', hex: '#404040', familia: 'neutro', basico: true },
  { nombre: 'Pizarra', hex: '#708090', familia: 'neutro', basico: false, nota: 'Valor de la palabra CSS slategray.' },
  { nombre: 'Gris', hex: '#808080', familia: 'neutro', basico: true, alias: ['gris medio'] },
  { nombre: 'Gris claro', hex: '#C0C0C0', familia: 'neutro', basico: true, alias: ['plata', 'plateado'] },
  { nombre: 'Marfil', hex: '#FFFFF0', familia: 'neutro', basico: false, nota: 'Valor de la palabra CSS ivory.' },
  { nombre: 'Blanco', hex: '#FFFFFF', familia: 'neutro', basico: true },

  // ── Rojos y rosas ───────────────────────────────────────────────────────────────────
  { nombre: 'Rojo', hex: '#E01B24', familia: 'rojo', basico: true },
  { nombre: 'Bermellón', hex: '#E34234', familia: 'rojo', basico: false, alias: ['cinabrio'], nota: 'Pigmento de cinabrio (sulfuro de mercurio). Valor convencional.' },
  { nombre: 'Rojo oscuro', hex: '#8B0000', familia: 'rojo', basico: true },
  { nombre: 'Granate', hex: '#800020', familia: 'rojo', basico: true, alias: ['burdeos', 'borgoña'] },
  { nombre: 'Carmesí', hex: '#DC143C', familia: 'rojo', basico: true, alias: ['carmin'] },
  { nombre: 'Coral', hex: '#FF7F50', familia: 'rojo', basico: true },
  { nombre: 'Salmón', hex: '#FA8072', familia: 'rojo', basico: true },
  { nombre: 'Rosa', hex: '#FFC0CB', familia: 'rojo', basico: true },
  { nombre: 'Rosa fuerte', hex: '#FF69B4', familia: 'rojo', basico: true, alias: ['rosa chicle'] },
  { nombre: 'Fucsia', hex: '#FF00FF', familia: 'rojo', basico: true },
  { nombre: 'Magenta', hex: '#C71585', familia: 'rojo', basico: true },

  // ── Naranjas ────────────────────────────────────────────────────────────────────────
  { nombre: 'Naranja', hex: '#FF7F00', familia: 'naranja', basico: true },
  { nombre: 'Terracota', hex: '#E2725B', familia: 'naranja', basico: false, nota: 'Color del barro cocido. Valor convencional.' },
  { nombre: 'Naranja tostado', hex: '#D2691E', familia: 'naranja', basico: true },
  { nombre: 'Ocre', hex: '#CC7722', familia: 'naranja', basico: false, nota: 'Pigmento de tierra (óxido de hierro hidratado). Valor convencional.' },
  { nombre: 'Teja', hex: '#B7410E', familia: 'naranja', basico: false, alias: ['oxido', 'rojo teja'], nota: 'Óxido de hierro. Valor convencional.' },
  { nombre: 'Melocotón', hex: '#FFDAB9', familia: 'naranja', basico: true, alias: ['durazno'] },

  // ── Marrones ────────────────────────────────────────────────────────────────────────
  { nombre: 'Café', hex: '#6F4E37', familia: 'marron', basico: false, nota: 'Color del grano tostado. Valor convencional.' },
  { nombre: 'Marrón', hex: '#8B4513', familia: 'marron', basico: true },
  { nombre: 'Siena tostada', hex: '#8A3324', familia: 'marron', basico: false, alias: ['siena'], nota: 'Pigmento de tierra de Siena calcinada. Valor convencional.' },
  { nombre: 'Caoba', hex: '#C04000', familia: 'marron', basico: false, nota: 'Color de la madera de caoba. Valor convencional.' },
  { nombre: 'Marrón claro', hex: '#A0522D', familia: 'marron', basico: true },
  { nombre: 'Arena', hex: '#C2B280', familia: 'marron', basico: false, nota: 'Valor convencional.' },
  { nombre: 'Beige', hex: '#F5DEB3', familia: 'marron', basico: true },
  { nombre: 'Crema', hex: '#FFFDD0', familia: 'marron', basico: true },

  // ── Amarillos ───────────────────────────────────────────────────────────────────────
  { nombre: 'Dorado', hex: '#FFD700', familia: 'amarillo', basico: true, alias: ['oro'] },
  { nombre: 'Ámbar', hex: '#FFBF00', familia: 'amarillo', basico: false, nota: 'Color de la resina fósil. Valor convencional.' },
  { nombre: 'Amarillo', hex: '#FFFF00', familia: 'amarillo', basico: true },
  { nombre: 'Amarillo pálido', hex: '#FFFFE0', familia: 'amarillo', basico: true },
  { nombre: 'Azafrán', hex: '#F4C430', familia: 'amarillo', basico: false, nota: 'Color de la especia. Valor convencional.' },
  { nombre: 'Mostaza', hex: '#E1AD01', familia: 'amarillo', basico: true },

  // ── Verdes ──────────────────────────────────────────────────────────────────────────
  { nombre: 'Oliva', hex: '#808000', familia: 'verde', basico: true, alias: ['verde oliva'] },
  { nombre: 'Verde musgo', hex: '#8A9A5B', familia: 'verde', basico: false, alias: ['musgo'], nota: 'Valor convencional.' },
  { nombre: 'Verde lima', hex: '#BFFF00', familia: 'verde', basico: true, alias: ['lima'] },
  { nombre: 'Verde pistacho', hex: '#93C572', familia: 'verde', basico: false, alias: ['pistacho'], nota: 'Valor convencional.' },
  { nombre: 'Verde claro', hex: '#90EE90', familia: 'verde', basico: true },
  { nombre: 'Verde menta', hex: '#98FF98', familia: 'verde', basico: false, alias: ['menta'], nota: 'Valor convencional.' },
  { nombre: 'Verde', hex: '#008000', familia: 'verde', basico: true },
  { nombre: 'Verde oscuro', hex: '#006400', familia: 'verde', basico: true },
  { nombre: 'Verde esmeralda', hex: '#2ECC71', familia: 'verde', basico: true, alias: ['esmeralda'] },
  { nombre: 'Verde jade', hex: '#00A86B', familia: 'verde', basico: false, alias: ['jade'], nota: 'Color de la piedra. Valor convencional.' },
  { nombre: 'Verde botella', hex: '#006A4E', familia: 'verde', basico: false, nota: 'Valor convencional.' },
  { nombre: 'Verde azulado', hex: '#008080', familia: 'verde', basico: true, alias: ['teal'] },

  // ── Azules ──────────────────────────────────────────────────────────────────────────
  { nombre: 'Turquesa', hex: '#40E0D0', familia: 'azul', basico: true },
  { nombre: 'Cian', hex: '#00FFFF', familia: 'azul', basico: true, alias: ['aqua'] },
  { nombre: 'Celeste', hex: '#87CEEB', familia: 'azul', basico: true, alias: ['azul cielo'] },
  { nombre: 'Azul claro', hex: '#ADD8E6', familia: 'azul', basico: true },
  // Los tres azules MEDIOS que reparan el hallazgo 393: sin ellos la paleta saltaba del
  // «Azul» muy saturado al «Celeste» pastel y los azules cotidianos —vaqueros, loza,
  // señalética— salían «Gris». No quitarlos.
  { nombre: 'Azul acero', hex: '#4682B4', familia: 'azul', basico: true },
  { nombre: 'Azul grisáceo', hex: '#6A8CAF', familia: 'azul', basico: true },
  { nombre: 'Azul petróleo', hex: '#2E86AB', familia: 'azul', basico: true, alias: ['petroleo', 'azul meskeIA'] },
  { nombre: 'Azul lapislázuli', hex: '#26619C', familia: 'azul', basico: false, alias: ['lapislazuli', 'lapis'], nota: 'Pigmento de lapislázuli molido (ultramar natural). Valor convencional.' },
  { nombre: 'Azul cobalto', hex: '#0047AB', familia: 'azul', basico: false, alias: ['cobalto'], nota: 'Pigmento de aluminato de cobalto. Valor convencional.' },
  { nombre: 'Azul', hex: '#0057E7', familia: 'azul', basico: true },
  { nombre: 'Azul Prusia', hex: '#003153', familia: 'azul', basico: false, alias: ['prusia'], nota: 'Pigmento de ferrocianuro férrico. Valor convencional.' },
  { nombre: 'Azul marino', hex: '#000080', familia: 'azul', basico: true },
  { nombre: 'Azul oscuro', hex: '#00008B', familia: 'azul', basico: true },

  // ── Violetas ────────────────────────────────────────────────────────────────────────
  { nombre: 'Índigo', hex: '#4B0082', familia: 'violeta', basico: true, alias: ['anil'] },
  { nombre: 'Violeta', hex: '#8F00FF', familia: 'violeta', basico: true },
  { nombre: 'Morado', hex: '#800080', familia: 'violeta', basico: true, alias: ['purpura'] },
  { nombre: 'Púrpura de Tiro', hex: '#66023C', familia: 'violeta', basico: false, alias: ['tiro', 'murice'], nota: 'Tinte de múrice de la Antigüedad. Valor convencional.' },
  { nombre: 'Malva', hex: '#E0B0FF', familia: 'violeta', basico: false, nota: 'Valor convencional.' },
  { nombre: 'Lila', hex: '#C8A2C8', familia: 'violeta', basico: true },
  { nombre: 'Lavanda', hex: '#E6E6FA', familia: 'violeta', basico: true },
];

/** Solo el conjunto de cobertura. Es el que nombra colores; leer la cabecera antes de tocarlo. */
export const COLORES_BASE: ColorNombrado[] = COLORES_NOMBRADOS.filter((c) => c.basico);

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexARgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbAHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** Conjunto de cobertura con el RGB ya calculado, para no repetirlo en cada comparación. */
const COLORES_BASE_RGB = COLORES_BASE.map((c) => ({ ...c, ...hexARgb(c.hex) }));

/**
 * Distancia de color «redmean»: aproximación perceptual barata pero mucho mejor que la
 * distancia euclídea plana en RGB. Devuelve el cuadrado (basta para comparar).
 * Referencia: https://www.compuphase.com/cmetric.htm
 */
export function distanciaColor(r: number, g: number, b: number, c: RGB): number {
  const rmedia = (r + c.r) / 2;
  const dr = r - c.r;
  const dg = g - c.g;
  const db = b - c.b;
  return (2 + rmedia / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmedia) / 256) * db * db;
}

/** Nombre del color del conjunto de cobertura más cercano al RGB dado. Nunca devuelve vacío. */
export function nombreDeColor(r: number, g: number, b: number): string {
  let mejor = COLORES_BASE_RGB[0];
  let mejorDist = Infinity;
  for (const c of COLORES_BASE_RGB) {
    const d = distanciaColor(r, g, b, c);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = c;
    }
  }
  return mejor.nombre;
}

/** Quita tildes y mayúsculas para que «lapislazuli» encuentre «Azul lapislázuli». */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

const INDICE_POR_HEX = new Map(COLORES_NOMBRADOS.map((c) => [c.hex.toUpperCase(), c]));

/**
 * Color con ese HEX EXACTO, si lo hay, buscando en la lista entera (básicos y pigmentos).
 * Es lo que permite que al elegir «Ocre» la interfaz diga «Ocre» y no «lo más parecido a
 * Naranja tostado», que es lo que respondería el vecino más cercano.
 */
export function colorPorHex(hex: string): ColorNombrado | undefined {
  return INDICE_POR_HEX.get(hex.toUpperCase());
}

/**
 * Busca por nombre, alias o HEX. Sin consulta devuelve la familia entera (o todo).
 * El orden es el de `COLORES_NOMBRADOS`, que va de oscuro a claro dentro de cada familia.
 */
export function buscarColores(consulta: string, familia: FamiliaColor | 'todas' = 'todas'): ColorNombrado[] {
  const q = normalizar(consulta);
  return COLORES_NOMBRADOS.filter((c) => {
    if (familia !== 'todas' && c.familia !== familia) return false;
    if (!q) return true;
    if (normalizar(c.nombre).includes(q)) return true;
    if (c.alias?.some((a) => normalizar(a).includes(q))) return true;
    // Permite pegar un HEX con o sin almohadilla.
    return normalizar(c.hex).includes(q.startsWith('#') ? q : '#' + q);
  });
}
