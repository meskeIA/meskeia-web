/**
 * Recetas que sobreviven al cierre de la pestaña, para las calculadoras de pan (S0190).
 *
 * Por qué existe: `calculadora-receta-pan` y `calculadora-porcentaje-panadero` están entre las
 * apps a las que más se VUELVE (59 % y 46 % de retorno a la misma app en septiembre de 2026),
 * y no guardaban nada: quien volvía tecleaba otra vez los ocho parámetros de su pan o rehacía
 * a mano su lista de ingredientes. Es el mismo hueco que tenía `generador-loteria` con sus
 * combinaciones favoritas (S0115), y se resuelve igual: solo `localStorage`, sin servidor ni
 * cuenta. Nada sale del dispositivo.
 *
 * Dos cosas distintas, cada una con su clave:
 *   · la ÚLTIMA receta, que se recupera sola al volver (`<clave>-ultima`);
 *   · las recetas guardadas CON NOMBRE, que el usuario decide (`<clave>-lista`).
 *
 * Lo que hay en el almacén es dato de fuera —otra versión de la app, otra pestaña, una edición
 * a mano—, así que cada app pasa su propio `validar`, que devuelve la receta saneada o `null`.
 * Una receta que no encaja se descarta en vez de tumbar la página al pintarla.
 *
 * Con varias pestañas abiertas se sigue la lección del hallazgo 1630 de la lotería: cada cambio
 * de la lista parte de lo que hay AHORA en el almacén, no de la copia en memoria, y se escucha
 * el evento `storage` para repintar lo que guarde otra pestaña.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface RecetaGuardada<T> {
  id: string;
  nombre: string;
  /** ISO 8601. Solo se usa para ordenar y para enseñarla en la lista. */
  fecha: string;
  datos: T;
}

export type Validador<T> = (crudo: unknown) => T | null;

/**
 * Tope de recetas con nombre. Al llegar a él NO se borra ninguna: la nueva no entra y se dice
 * (la misma regla que el hallazgo 1631 fijó para las favoritas de la lotería).
 */
export const MAX_RECETAS = 12;

/** Largo máximo del nombre: lo justo para «Hogaza de espelta 30 % de los domingos». */
export const MAX_NOMBRE = 60;

const claveUltima = (clave: string) => `${clave}-ultima`;
const claveLista = (clave: string) => `${clave}-lista`;

/** Devuelve `undefined` si el almacén no se puede leer (navegación privada, bloqueado). */
function leerCrudo(clave: string): string | null | undefined {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return undefined;
  }
}

/** Si el almacén está lleno o bloqueado, la sesión sigue funcionando en memoria. */
function escribirCrudo(clave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function leerUltima<T>(clave: string, validar: Validador<T>): T | null {
  const crudo = leerCrudo(claveUltima(clave));
  if (!crudo) return null;
  try {
    return validar(JSON.parse(crudo));
  } catch {
    return null; // JSON corrupto: mejor empezar con la receta de ejemplo que tumbar la página
  }
}

/**
 * Reconstruye la lista guardada validando cada receta una por una. Devuelve `null` si el
 * almacén no se puede leer, para distinguir «no hay nada guardado» de «no se puede guardar».
 */
export function leerLista<T>(clave: string, validar: Validador<T>): RecetaGuardada<T>[] | null {
  const crudo = leerCrudo(claveLista(clave));
  if (crudo === undefined) return null;
  if (!crudo) return [];
  try {
    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];
    const validas: RecetaGuardada<T>[] = [];
    for (const item of datos) {
      if (!item || typeof item !== 'object') continue;
      const r = item as Partial<RecetaGuardada<unknown>>;
      if (typeof r.nombre !== 'string' || !r.nombre.trim()) continue;
      const receta = validar(r.datos);
      if (receta === null) continue;
      const fecha = typeof r.fecha === 'string' && !Number.isNaN(Date.parse(r.fecha))
        ? r.fecha
        : new Date().toISOString();
      validas.push({
        id: typeof r.id === 'string' && r.id ? r.id : `${Date.now()}-${validas.length}`,
        nombre: r.nombre.trim().slice(0, MAX_NOMBRE),
        fecha,
        datos: receta,
      });
    }
    return validas.slice(0, MAX_RECETAS);
  } catch {
    return [];
  }
}

/** Mismo nombre sin distinguir mayúsculas ni espacios de más: «Hogaza » y «hogaza» son una. */
const mismoNombre = (a: string, b: string) =>
  a.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es') === b.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

export type ResultadoGuardar = 'nueva' | 'actualizada' | 'sin-nombre' | 'llena' | 'sin-almacen';

interface Opciones<T> {
  /** Prefijo de las dos claves de `localStorage`. */
  clave: string;
  validar: Validador<T>;
  /** La receta tal como está ahora en pantalla. Debe venir memoizada. */
  actual: T;
  /** Lleva una receta a los controles de la página. */
  aplicar: (datos: T) => void;
  /** La receta con la que arranca la página: si la recuperada es igual, no se avisa. */
  porDefecto: T;
}

export interface RecetasGuardadas<T> {
  lista: RecetaGuardada<T>[];
  /** `false` si el navegador no deja guardar (navegación privada, almacenamiento bloqueado). */
  disponible: boolean;
  /** Se ha recuperado al cargar una receta distinta de la de ejemplo. */
  recuperada: boolean;
  guardar: (nombre: string) => ResultadoGuardar;
  cargar: (id: string) => RecetaGuardada<T> | null;
  borrar: (id: string) => void;
  /** Vuelve a la receta de ejemplo y quita el aviso de receta recuperada. */
  empezarDeCero: () => void;
}

export function useRecetasGuardadas<T>({
  clave,
  validar,
  actual,
  aplicar,
  porDefecto,
}: Opciones<T>): RecetasGuardadas<T> {
  const [lista, setLista] = useState<RecetaGuardada<T>[]>([]);
  const [disponible, setDisponible] = useState(true);
  const [recuperada, setRecuperada] = useState(false);
  // Hasta haber leído el almacén no se escribe nada: el primer render lleva la receta de
  // ejemplo y, si se guardara, pisaría la del usuario antes de recuperarla.
  const [leido, setLeido] = useState(false);
  const listaRef = useRef<RecetaGuardada<T>[]>([]);

  // Las funciones de la página cambian en cada render; se leen por ref para que el efecto de
  // carga corra una sola vez.
  // Este efecto va el primero para que los de abajo lean siempre las versiones del render actual.
  const validarRef = useRef(validar);
  const aplicarRef = useRef(aplicar);
  const porDefectoRef = useRef(porDefecto);
  useEffect(() => {
    validarRef.current = validar;
    aplicarRef.current = aplicar;
  });

  /**
   * `localStorage` no existe en el servidor, y leerlo en el `useState` inicial haría que el HTML
   * servido y el primer render no coincidieran (error de hidratación): se lee al montar.
   */
  useEffect(() => {
    const guardadas = leerLista(clave, validarRef.current);
    setDisponible(guardadas !== null);
    listaRef.current = guardadas ?? [];
    setLista(listaRef.current);

    const ultima = leerUltima(clave, validarRef.current);
    if (ultima !== null) {
      aplicarRef.current(ultima);
      setRecuperada(JSON.stringify(ultima) !== JSON.stringify(porDefectoRef.current));
    }
    setLeido(true);

    const alCambiarEnOtraPestana = (e: StorageEvent) => {
      if (e.key !== null && e.key !== claveLista(clave)) return; // key null = se vació todo
      const nueva = leerLista(clave, validarRef.current) ?? [];
      listaRef.current = nueva;
      setLista(nueva);
    };
    window.addEventListener('storage', alCambiarEnOtraPestana);
    return () => window.removeEventListener('storage', alCambiarEnOtraPestana);
  }, [clave]);

  // La última receta se guarda sola en cuanto cambia algo.
  useEffect(() => {
    if (!leido) return;
    escribirCrudo(claveUltima(clave), actual);
  }, [leido, clave, actual]);

  /** Aplica un cambio a la lista partiendo de lo que hay AHORA en el almacén. */
  const modificar = useCallback(
    (cambio: (base: RecetaGuardada<T>[]) => RecetaGuardada<T>[]): boolean => {
      const base = leerLista(clave, validarRef.current) ?? listaRef.current;
      const nueva = cambio(base);
      const ok = escribirCrudo(claveLista(clave), nueva);
      listaRef.current = nueva;
      setLista(nueva);
      return ok;
    },
    [clave],
  );

  const guardar = useCallback(
    (nombreCrudo: string): ResultadoGuardar => {
      const nombre = nombreCrudo.trim().replace(/\s+/g, ' ').slice(0, MAX_NOMBRE);
      if (!nombre) return 'sin-nombre';
      const base = leerLista(clave, validarRef.current) ?? listaRef.current;
      const existente = base.find((r) => mismoNombre(r.nombre, nombre));
      if (!existente && base.length >= MAX_RECETAS) return 'llena';

      const fecha = new Date().toISOString();
      const ok = modificar((previa) => {
        const otra = previa.find((r) => mismoNombre(r.nombre, nombre));
        if (otra) {
          // Mismo nombre = la misma receta, retocada: se actualiza en su sitio.
          return previa.map((r) => (r.id === otra.id ? { ...r, nombre, fecha, datos: actual } : r));
        }
        return [{ id: `${Date.now()}`, nombre, fecha, datos: actual }, ...previa];
      });
      if (!ok) {
        setDisponible(false);
        return 'sin-almacen';
      }
      return existente ? 'actualizada' : 'nueva';
    },
    [clave, actual, modificar],
  );

  const cargar = useCallback(
    (id: string) => {
      const receta = listaRef.current.find((r) => r.id === id) ?? null;
      if (receta) {
        aplicarRef.current(receta.datos);
        setRecuperada(false);
      }
      return receta;
    },
    [],
  );

  const borrar = useCallback(
    (id: string) => {
      modificar((previa) => previa.filter((r) => r.id !== id));
    },
    [modificar],
  );

  const empezarDeCero = useCallback(() => {
    aplicarRef.current(porDefectoRef.current);
    setRecuperada(false);
  }, []);

  return { lista, disponible, recuperada, guardar, cargar, borrar, empezarDeCero };
}
