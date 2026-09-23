/**
 * Motor del Simulador de Ecosistema: la cascada trófica.
 *
 * Vivía dentro de `page.tsx` y se MOVIÓ aquí el 23/09/2026, sin cambiar ni una cifra, al
 * añadir los casos para clase (`casos.ts`). La razón es la regla que gobierna esa
 * sistemática: si los casos evaluaran la predicción del alumno con un modelo y el simulador
 * pintara la cascada con otro, la app suspendería una respuesta que ella misma enseña en
 * pantalla. Con una sola implementación eso es imposible: `page.tsx` y `casos.ts` importan de
 * aquí `ECOSISTEMAS`, `EVENTOS`, `ATENUACION` y `aplicarEvento`.
 *
 * Y vive fuera de la vista por lo de siempre: el build compila la página sin comprobar si la
 * ecología está bien. Una cascada con el signo cambiado compila igual de limpia que la buena.
 *
 * Módulo puro: sin React ni DOM.
 */

// ============================================
// TIPOS
// ============================================
export interface NivelTrofico {
  nombre: string;
  emoji: string;
  ejemplos: string;
  poblacion: number;
  energiaPorcentaje: number;
}

export interface Ecosistema {
  id: string;
  nombre: string;
  emoji: string;
  niveles: [NivelTrofico, NivelTrofico, NivelTrofico, NivelTrofico];
}

export type TipoEvento = 'ninguno' | 'sequia' | 'caza-depredador' | 'plaga-herbivoro' | 'contaminacion';

export interface Evento {
  id: TipoEvento;
  nombre: string;
  descripcion: string;
  nivelAfectado: 0 | 1 | 2 | 3;
  impacto: number;
}

// ============================================
// DATOS DE ECOSISTEMAS
// ============================================
export const ECOSISTEMAS: Ecosistema[] = [
  {
    id: 'pradera',
    nombre: 'Pradera',
    emoji: '🌾',
    niveles: [
      { nombre: 'Productores', emoji: '🌿', ejemplos: 'Gramíneas, hierbas', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🐇', ejemplos: 'Conejos, ratones, insectos', poblacion: 40, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🦊', ejemplos: 'Zorros, serpientes', poblacion: 15, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🦅', ejemplos: 'Águilas, halcones', poblacion: 5, energiaPorcentaje: 0.1 },
    ],
  },
  {
    id: 'bosque',
    nombre: 'Bosque Templado',
    emoji: '🌲',
    niveles: [
      { nombre: 'Productores', emoji: '🌳', ejemplos: 'Robles, hayas, arbustos', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🦌', ejemplos: 'Ciervos, jabatos, orugas', poblacion: 35, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🐺', ejemplos: 'Lobos, linces, búhos', poblacion: 12, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🐻', ejemplos: 'Osos, águilas reales', poblacion: 4, energiaPorcentaje: 0.1 },
    ],
  },
  {
    id: 'oceano',
    nombre: 'Océano',
    emoji: '🌊',
    niveles: [
      { nombre: 'Productores', emoji: '🦠', ejemplos: 'Fitoplancton, algas', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🦐', ejemplos: 'Zooplancton, gambas, sardinas', poblacion: 38, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🐟', ejemplos: 'Peces medianos, calamares', poblacion: 14, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🦈', ejemplos: 'Tiburones, atunes, delfines', poblacion: 5, energiaPorcentaje: 0.1 },
    ],
  },
  {
    id: 'sabana',
    nombre: 'Sabana',
    emoji: '🌅',
    niveles: [
      { nombre: 'Productores', emoji: '🌾', ejemplos: 'Acacia, gramíneas tropicales', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🦓', ejemplos: 'Cebras, ñus, jirafas', poblacion: 42, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🐆', ejemplos: 'Guepardos, leopardos, hienas', poblacion: 16, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🦁', ejemplos: 'Leones, cocodrilos', poblacion: 6, energiaPorcentaje: 0.1 },
    ],
  },
];

// ============================================
// EVENTOS PERTURBADORES
// ============================================
export const EVENTOS: Evento[] = [
  { id: 'ninguno', nombre: 'Sin perturbación', descripcion: 'Ecosistema en equilibrio', nivelAfectado: 0, impacto: 0 },
  { id: 'sequia', nombre: 'Sequía', descripcion: 'La falta de lluvia reduce drásticamente los productores', nivelAfectado: 0, impacto: -0.6 },
  { id: 'caza-depredador', nombre: 'Caza excesiva del depredador', descripcion: 'La caza ilegal reduce la población de carnívoros', nivelAfectado: 2, impacto: -0.7 },
  { id: 'plaga-herbivoro', nombre: 'Plaga de herbívoros', descripcion: 'Una plaga hace crecer los herbívoros sin control', nivelAfectado: 1, impacto: 0.8 },
  // Hasta el 23/09/2026 decía «diezman a los productores y herbívoros», pero el modelo solo
  // golpea a los productores (nivelAfectado: 0): los herbívoros bajan por la cascada, como en
  // la sequía. Se alineó el TEXTO al modelo, no al revés, para no mover el acta del Inspector.
  { id: 'contaminacion', nombre: 'Contaminación del agua', descripcion: 'Pesticidas diezman a los productores', nivelAfectado: 0, impacto: -0.5 },
];

/**
 * Cuánto del cambio de un nivel llega al de al lado.
 *
 * Es lo que hace que una cascada trófica se vaya apagando en vez de propagarse intacta, y va
 * en LOS DOS SENTIDOS: hasta el 25/08/2026 la cascada hacia arriba atenuaba con este mismo
 * 0,7 y la de abajo no atenuaba nada, sin ninguna razón biológica detrás.
 */
export const ATENUACION = 0.7;

// ============================================
// MODELO DE CASCADA TRÓFICA
// ============================================
export function aplicarEvento(
  niveles: NivelTrofico[],
  evento: Evento,
  intensidad: number
): NivelTrofico[] {
  const result = niveles.map(n => ({ ...n }));

  if (evento.id === 'ninguno') return result;

  const idx = evento.nivelAfectado;
  const cambio = evento.impacto * intensidad;

  // Afectar el nivel directamente
  result[idx] = {
    ...result[idx],
    poblacion: Math.max(5, Math.min(100, niveles[idx].poblacion * (1 + cambio))),
  };

  // Efecto en cascada hacia arriba (depredadores): quedarse sin presa arrastra al depredador
  for (let i = idx + 1; i < result.length; i++) {
    const factorPresa = result[i - 1].poblacion / niveles[i - 1].poblacion;
    result[i] = {
      ...result[i],
      poblacion: Math.max(2, Math.min(100, niveles[i].poblacion * (1 - ATENUACION + ATENUACION * factorPresa))),
    };
  }

  // Efecto en cascada hacia abajo (presas): perder depredador libera a la presa
  for (let i = idx - 1; i >= 0; i--) {
    const factorDepred = result[i + 1].poblacion / niveles[i + 1].poblacion;
    // Con la MISMA atenuación que hacia arriba. Antes era `2 − factorDepred`, que traslada el
    // cambio con magnitud idéntica: un −50 % en el depredador daba un +50 % en la presa,
    // mientras el paso 3 del bloque educativo prometía «un cambio menor, del orden del
    // 20-30 %, en los niveles adyacentes» (hallazgo 324). La asimetría no tenía ninguna
    // justificación biológica: era la de arriba la que atenuaba y la de abajo la que no.
    result[i] = {
      ...result[i],
      poblacion: Math.max(5, Math.min(100, niveles[i].poblacion * (1 + ATENUACION * (1 - factorDepred)))),
    };
  }

  return result;
}
