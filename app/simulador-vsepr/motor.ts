/**
 * Motor del Simulador VSEPR — datos y reglas puras, sin React ni DOM.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si la química está
 * bien, y porque los casos para clase (`casos.ts`) tienen que corregir con EXACTAMENTE las
 * mismas reglas que pinta el simulador. Si hubiera dos copias de la tabla, la app podría
 * suspender una predicción que ella misma enseña en pantalla.
 *
 * Qué hay aquí, MOVIDO de `page.tsx` el 26/09/2026 sin tocar un valor:
 *   - `TABLA_VSEPR` y `GeometriaInfo`: la geometría de cada combinación X-E.
 *   - `ATOMOS` y `MOLECULAS_PRESET`: los átomos centrales y las «moléculas famosas».
 * Y EXTRAÍDO de los manejadores `handleEnlaces` / `handleLibres`:
 *   - `aplicarCambioEnlaces` / `aplicarCambioLibres`: el tope X + E ≤ 6 de los deslizadores.
 *
 * La geometría 3D (vértices, proyección) sigue en `page.tsx`: es dibujo, no química.
 *
 * Nada lanza excepciones: una combinación fuera de la tabla sale como `null`.
 */

// ============================================
// TIPOS
// ============================================
export interface AtomoInfo {
  simbolo: string;
  nombre: string;
  color: string;
  textColor: string;
}

export interface MoleculaPreset {
  nombre: string;
  formula: string;
  atomo: string;
  enlaces: number;
  libres: number;
}

export interface GeometriaInfo {
  notacion: string;
  geomElectronica: string;
  geomMolecular: string;
  anguloIdeal: string;
  hibridacion: string;
  ejemplos: string;
}

// ============================================
// DATOS
// ============================================
export const ATOMOS: AtomoInfo[] = [
  { simbolo: 'C', nombre: 'Carbono', color: '#404040', textColor: '#ffffff' },
  { simbolo: 'N', nombre: 'Nitrógeno', color: '#3050f8', textColor: '#ffffff' },
  { simbolo: 'O', nombre: 'Oxígeno', color: '#ff0d0d', textColor: '#ffffff' },
  { simbolo: 'P', nombre: 'Fósforo', color: '#ff8000', textColor: '#ffffff' },
  { simbolo: 'S', nombre: 'Azufre', color: '#ffd000', textColor: '#1a1a1a' },
  { simbolo: 'Cl', nombre: 'Cloro', color: '#1ff01f', textColor: '#1a1a1a' },
  { simbolo: 'Br', nombre: 'Bromo', color: '#a62929', textColor: '#ffffff' },
  { simbolo: 'Xe', nombre: 'Xenón', color: '#429eb0', textColor: '#ffffff' },
  { simbolo: 'Si', nombre: 'Silicio', color: '#daa520', textColor: '#1a1a1a' },
  { simbolo: 'B', nombre: 'Boro', color: '#ffb5b5', textColor: '#1a1a1a' },
];

export const MOLECULAS_PRESET: MoleculaPreset[] = [
  { nombre: 'CO₂', formula: 'CO2', atomo: 'C', enlaces: 2, libres: 0 },
  { nombre: 'BF₃', formula: 'BF3', atomo: 'B', enlaces: 3, libres: 0 },
  { nombre: 'H₂O', formula: 'H2O', atomo: 'O', enlaces: 2, libres: 2 },
  { nombre: 'NH₃', formula: 'NH3', atomo: 'N', enlaces: 3, libres: 1 },
  { nombre: 'CH₄', formula: 'CH4', atomo: 'C', enlaces: 4, libres: 0 },
  { nombre: 'PCl₅', formula: 'PCl5', atomo: 'P', enlaces: 5, libres: 0 },
  { nombre: 'SF₆', formula: 'SF6', atomo: 'S', enlaces: 6, libres: 0 },
  { nombre: 'XeF₄', formula: 'XeF4', atomo: 'Xe', enlaces: 4, libres: 2 },
];

// Tabla VSEPR completa
export const TABLA_VSEPR: Record<string, GeometriaInfo> = {
  '2-0': {
    notacion: 'AX₂',
    geomElectronica: 'Lineal',
    geomMolecular: 'Lineal',
    anguloIdeal: '180°',
    hibridacion: 'sp',
    ejemplos: 'CO₂, BeCl₂, HCN',
  },
  '3-0': {
    notacion: 'AX₃',
    geomElectronica: 'Trigonal plana',
    geomMolecular: 'Trigonal plana',
    anguloIdeal: '120°',
    hibridacion: 'sp²',
    ejemplos: 'BF₃, BCl₃, SO₃',
  },
  '2-1': {
    notacion: 'AX₂E',
    geomElectronica: 'Trigonal plana',
    geomMolecular: 'Angular',
    anguloIdeal: '<120°',
    hibridacion: 'sp²',
    ejemplos: 'SO₂, O₃, NO₂⁻',
  },
  '4-0': {
    notacion: 'AX₄',
    geomElectronica: 'Tetraédrica',
    geomMolecular: 'Tetraédrica',
    anguloIdeal: '109,5°',
    hibridacion: 'sp³',
    ejemplos: 'CH₄, NH₄⁺, SiCl₄',
  },
  '3-1': {
    notacion: 'AX₃E',
    geomElectronica: 'Tetraédrica',
    geomMolecular: 'Pirámide trigonal',
    anguloIdeal: '<109,5° (~107°)',
    hibridacion: 'sp³',
    ejemplos: 'NH₃, PCl₃, H₃O⁺',
  },
  '2-2': {
    notacion: 'AX₂E₂',
    geomElectronica: 'Tetraédrica',
    geomMolecular: 'Angular',
    anguloIdeal: '<109,5° (~104,5°)',
    hibridacion: 'sp³',
    ejemplos: 'H₂O, H₂S, OF₂',
  },
  '5-0': {
    notacion: 'AX₅',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Bipirámide trigonal',
    anguloIdeal: '90° y 120°',
    hibridacion: 'sp³d',
    ejemplos: 'PCl₅, PF₅, AsF₅',
  },
  '4-1': {
    notacion: 'AX₄E',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Balancín (sube y baja)',
    anguloIdeal: '~90° y ~120°',
    hibridacion: 'sp³d',
    ejemplos: 'SF₄, IF₄⁺, IO₂F₂⁻',
  },
  '3-2': {
    notacion: 'AX₃E₂',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Forma T',
    anguloIdeal: '~90°',
    hibridacion: 'sp³d',
    ejemplos: 'ClF₃, BrF₃, IF₃',
  },
  '2-3': {
    notacion: 'AX₂E₃',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Lineal',
    anguloIdeal: '180°',
    hibridacion: 'sp³d',
    ejemplos: 'XeF₂, I₃⁻, ICl₂⁻',
  },
  '6-0': {
    notacion: 'AX₆',
    geomElectronica: 'Octaédrica',
    geomMolecular: 'Octaédrica',
    anguloIdeal: '90°',
    hibridacion: 'sp³d²',
    ejemplos: 'SF₆, PF₆⁻, [Co(NH₃)₆]³⁺',
  },
  '5-1': {
    notacion: 'AX₅E',
    geomElectronica: 'Octaédrica',
    geomMolecular: 'Pirámide cuadrada',
    anguloIdeal: '<90°',
    hibridacion: 'sp³d²',
    ejemplos: 'BrF₅, IF₅, XeOF₄',
  },
  '4-2': {
    notacion: 'AX₄E₂',
    geomElectronica: 'Octaédrica',
    geomMolecular: 'Cuadrada plana',
    anguloIdeal: '90°',
    hibridacion: 'sp³d²',
    ejemplos: 'XeF₄, ICl₄⁻, BrF₄⁻',
  },
};

// ============================================
// LÍMITES DE LOS DESLIZADORES
// ============================================
/** Rango del deslizador «Pares enlazantes (X)». */
export const MIN_ENLACES = 1;
export const MAX_ENLACES = 6;
/** Rango del deslizador «Pares libres (E)». */
export const MIN_LIBRES = 0;
export const MAX_LIBRES = 3;
/** Tope combinado X + E (máximo VSEPR común). */
export const MAX_PARES = 6;

/** El par de valores de los dos deslizadores. */
export interface ParesVsepr {
  enlaces: number;
  libres: number;
}

// ============================================
// GEOMETRÍA
// ============================================
/** Clave de `TABLA_VSEPR` para una combinación: «X-E». */
export function claveVsepr(enlaces: number, libres: number): string {
  return `${enlaces}-${libres}`;
}

/**
 * La geometría que pinta el simulador para X pares enlazantes y E pares libres, o `null` si la
 * combinación no está en la tabla (la app muestra entonces «Combinación poco común»). El átomo
 * central NO interviene: VSEPR solo cuenta dominios electrónicos.
 */
export function geometriaDe(enlaces: number, libres: number): GeometriaInfo | null {
  const clave = claveVsepr(enlaces, libres);
  return Object.prototype.hasOwnProperty.call(TABLA_VSEPR, clave) ? TABLA_VSEPR[clave] : null;
}

// ============================================
// EL TOPE X + E ≤ 6 (extraído de handleEnlaces / handleLibres)
// ============================================
/**
 * Lo que queda en los dos deslizadores al mover el de ENLACES a `nuevo`. El valor se acota a
 * 1-6 y, si X + E pasa de 6, se recortan los pares LIBRES (no se rechaza el cambio). Es la regla
 * de `handleEnlaces`, que ahora la llama. Un valor no finito deja el estado como estaba.
 */
export function aplicarCambioEnlaces(enlaces: number, libres: number, nuevo: number): ParesVsepr {
  if (!Number.isFinite(nuevo)) return { enlaces, libres };
  const enlacesNuevos = Math.max(MIN_ENLACES, Math.min(MAX_ENLACES, nuevo));
  const libresNuevos =
    enlacesNuevos + libres > MAX_PARES ? Math.max(MIN_LIBRES, MAX_PARES - enlacesNuevos) : libres;
  return { enlaces: enlacesNuevos, libres: libresNuevos };
}

/**
 * Lo que queda en los dos deslizadores al mover el de PARES LIBRES a `nuevo`. El valor se acota
 * a 0-3 y, si X + E pasa de 6, se recortan los ENLACES. Es la regla de `handleLibres`.
 */
export function aplicarCambioLibres(enlaces: number, libres: number, nuevo: number): ParesVsepr {
  if (!Number.isFinite(nuevo)) return { enlaces, libres };
  const libresNuevos = Math.max(MIN_LIBRES, Math.min(MAX_LIBRES, nuevo));
  const enlacesNuevos =
    enlaces + libresNuevos > MAX_PARES ? Math.max(MIN_ENLACES, MAX_PARES - libresNuevos) : enlaces;
  return { enlaces: enlacesNuevos, libres: libresNuevos };
}
