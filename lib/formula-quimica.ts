/**
 * Parser de fórmulas químicas — con paréntesis, que es lo que distingue a uno que sirve
 *
 * DE DÓNDE SALE (2026-08-23)
 * ──────────────────────────
 * El Inspector encontró el 21/08 (hallazgo 121) que la calculadora de masa molar de
 * `tabla-periodica` no entendía los paréntesis: su parser era `/([A-Z][a-z]?)(\d*)/g`, que
 * salta el «(» y el «)» y pierde entero el subíndice del grupo. Y no fallaba: devolvía un
 * total plausible pero falso, con su desglose. Ca(OH)₂ daba 57,0850 g/mol en vez de 74,0920
 * —un 23 % por debajo— y Al₂(SO₄)₃, 150,0250 en vez de 342,1470. Afecta a los grupos
 * poliatómicos: hidróxidos, nitratos, sulfatos, carbonatos y fosfatos, que son la mitad de
 * las fórmulas de secundaria.
 *
 * El algoritmo correcto —una pila, no una expresión regular— ya existía en el catálogo,
 * dentro de `app/formulador-compuestos-inorganicos/motor.ts`. Vive aquí para que las dos
 * apps usen el mismo y no puedan volver a divergir; el formulador lo consume desde su
 * `parsearFormula`, que conserva su interfaz y sus mensajes.
 *
 * QUÉ TABLA DE ELEMENTOS SE USA
 * ─────────────────────────────
 * Ninguna: el parser no sabe de elementos, se le pasa el validador. Es lo que permite
 * compartirlo, porque las dos apps NO cubren lo mismo — el formulador declara 42 símbolos
 * (los de formulación de secundaria) y la tabla periódica, los 118. Un parser con su propia
 * tabla habría rechazado en una lo que la otra acepta.
 */

/** Composición de una fórmula ya analizada. */
export interface ComposicionFormula {
  /** Composición total, con los paréntesis ya multiplicados: Al2(SO4)3 → {Al: 2, S: 3, O: 12} */
  comp: Record<string, number>;
  /** Símbolos en orden de aparición */
  orden: string[];
  /** Grupos que iban entre paréntesis, con su multiplicador */
  grupos: { formula: string; n: number }[];
  /** Fórmula normalizada: sin espacios, sin subíndices unicode y con todo en paréntesis */
  normalizada: string;
}

export interface ErrorFormula {
  error: string;
  pista: string | null;
}

export type ResultadoFormula =
  | { ok: true; parseo: ComposicionFormula }
  | { ok: false; fallo: ErrorFormula };

export interface OpcionesFormula {
  /** ¿Existe este símbolo en la tabla de quien llama? */
  simboloValido: (simbolo: string) => boolean;
  /** Mensaje cuando el símbolo no está en esa tabla */
  errorSimbolo?: (simbolo: string) => ErrorFormula;
  /** Mensaje cuando la entrada está vacía */
  errorVacia?: () => ErrorFormula;
}

const SUBINDICES_UNICODE = '₀₁₂₃₄₅₆₇₈₉';

/**
 * ── Un subíndice no puede empezar por 0 (hallazgo 3559, 27/10/2026) ─────────────────────
 * `parseInt('02')` da 2, así que «C02» —la errata de manual al teclear CO₂ con un cero en vez
 * de la O— pasaba por C₂ con su desglose y sin aviso, mientras «H0» sí se rechazaba. Ningún
 * subíndice químico se escribe con un cero delante: se rechaza y se apunta a la O.
 */
function errorSubindice(digitos: string): ErrorFormula | null {
  if (!digitos) return null;
  if (/^0+$/.test(digitos)) return { error: 'Un subíndice no puede valer 0.', pista: null };
  if (digitos.startsWith('0')) {
    // El aviso de la O va en el propio error: tabla-periodica solo pinta `error`.
    return {
      error: `Un subíndice no puede empezar por 0 («${digitos}»): si querías la letra O, escríbela en mayúscula (CO2, no C02).`,
      pista: null,
    };
  }
  return null;
}

/** Escribe un símbolo con su subíndice: ('O', 3) → 'O3' */
export function conIndice(simbolo: string, n: number): string {
  return n > 1 ? `${simbolo}${n}` : simbolo;
}

/**
 * Analiza una fórmula química y devuelve cuántos átomos hay de cada elemento.
 *
 * Admite paréntesis anidados, corchetes y llaves (se normalizan a paréntesis), subíndices
 * en unicode (H₂O) y espacios sueltos. Rechaza los paréntesis desbalanceados, el subíndice
 * cero o con un cero delante (C02) y cualquier carácter que no sea letra, dígito o paréntesis.
 */
export function parsearFormulaQuimica(entrada: string, opciones: OpcionesFormula): ResultadoFormula {
  const { simboloValido } = opciones;
  const errorSimbolo = opciones.errorSimbolo ?? ((s: string) => ({
    error: `Elemento "${s}" no reconocido`,
    pista: 'Los símbolos llevan la primera letra en mayúscula y la segunda en minúscula: Fe, Na, Cl, Ca.',
  }));
  const errorVacia = opciones.errorVacia ?? (() => ({
    error: 'Escribe una fórmula para analizarla.',
    pista: null,
  }));

  const f = entrada
    .replace(/\s+/g, '')
    .replace(/[₀-₉]/g, (d) => String(SUBINDICES_UNICODE.indexOf(d)))
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')');

  if (!f) return { ok: false, fallo: errorVacia() };
  if (!/^[A-Za-z0-9()]+$/.test(f)) {
    return {
      ok: false,
      fallo: {
        error: 'La fórmula solo admite letras, números y paréntesis.',
        pista: 'Ejemplos válidos: Fe2O3, Ca(OH)2, Al2(SO4)3.',
      },
    };
  }

  // Una pila por nivel de paréntesis: al cerrar uno, su composición se multiplica por el
  // subíndice y se vuelca en el nivel de abajo. Es justo lo que una expresión regular no
  // puede hacer, porque los paréntesis anidan y las regex no cuentan.
  const pilaComp: Record<string, number>[] = [{}];
  const pilaOrden: string[][] = [[]];
  const grupos: { formula: string; n: number }[] = [];
  let i = 0;

  while (i < f.length) {
    const c = f[i];

    if (c === '(') {
      pilaComp.push({});
      pilaOrden.push([]);
      i++;
      continue;
    }

    if (c === ')') {
      if (pilaComp.length === 1) {
        return { ok: false, fallo: { error: 'Hay un paréntesis que se cierra sin haberse abierto.', pista: null } };
      }
      i++;
      let num = '';
      while (i < f.length && /\d/.test(f[i])) {
        num += f[i];
        i++;
      }
      const falloMult = errorSubindice(num);
      if (falloMult) return { ok: false, fallo: falloMult };
      const mult = num ? parseInt(num, 10) : 1;

      const comp = pilaComp.pop() as Record<string, number>;
      const orden = pilaOrden.pop() as string[];
      grupos.push({ formula: orden.map((s) => conIndice(s, comp[s])).join(''), n: mult });

      const destino = pilaComp[pilaComp.length - 1];
      const ordenDestino = pilaOrden[pilaOrden.length - 1];
      for (const s of orden) {
        if (!(s in destino)) ordenDestino.push(s);
        destino[s] = (destino[s] ?? 0) + comp[s] * mult;
      }
      continue;
    }

    const m = f.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
    if (!m) {
      return {
        ok: false,
        fallo: {
          error: `No entiendo «${f.slice(i, i + 3)}».`,
          pista: 'Los símbolos llevan la primera letra en mayúscula y la segunda en minúscula: Fe, Na, Cl, Ca.',
        },
      };
    }
    const simbolo = m[1];
    const digitos = m[2];
    if (!simboloValido(simbolo)) return { ok: false, fallo: errorSimbolo(simbolo) };

    const falloSub = errorSubindice(digitos);
    if (falloSub) return { ok: false, fallo: falloSub };
    const n = digitos ? parseInt(digitos, 10) : 1;

    const destino = pilaComp[pilaComp.length - 1];
    const ordenDestino = pilaOrden[pilaOrden.length - 1];
    if (!(simbolo in destino)) ordenDestino.push(simbolo);
    destino[simbolo] = (destino[simbolo] ?? 0) + n;
    i += m[0].length;
  }

  if (pilaComp.length > 1) {
    return { ok: false, fallo: { error: 'Falta cerrar un paréntesis.', pista: null } };
  }

  return { ok: true, parseo: { comp: pilaComp[0], orden: pilaOrden[0], grupos, normalizada: f } };
}
