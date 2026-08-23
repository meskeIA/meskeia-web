/**
 * Tests unitarios de lib/formula-quimica.ts
 *
 * Ejecutar: npx playwright test tests/formula-quimica.spec.ts
 *
 * El parser anterior de `tabla-periodica` era una expresión regular
 * (`/([A-Z][a-z]?)(\d*)/g`) que saltaba los paréntesis y perdía el subíndice del grupo,
 * devolviendo un total plausible pero falso. Estos casos son los que aquel parser fallaba,
 * con la composición resuelta a mano:
 *
 *   Ca(OH)2      → Ca 1 · O 2 · H 2      (el 2 multiplica al grupo entero)
 *   Mg(NO3)2     → Mg 1 · N 2 · O 6
 *   Al2(SO4)3    → Al 2 · S 3 · O 12
 *   Ca3(PO4)2    → Ca 3 · P 2 · O 8
 *   K4[Fe(CN)6]  → K 4 · Fe 1 · C 6 · N 6  (anidado y con corchetes)
 */

import { test, expect } from '@playwright/test';
import { parsearFormulaQuimica, conIndice, OpcionesFormula } from '../lib/formula-quimica';

/** Acepta cualquier símbolo bien formado: aquí se prueba el parser, no una tabla concreta */
const TODOS: OpcionesFormula = { simboloValido: () => true };

/** Atajo: devuelve la composición o hace fallar el test con el error del parser */
function comp(formula: string, opciones: OpcionesFormula = TODOS): Record<string, number> {
  const r = parsearFormulaQuimica(formula, opciones);
  if (!r.ok) throw new Error(`«${formula}» no se pudo analizar: ${r.fallo.error}`);
  return r.parseo.comp;
}

test.describe('parsearFormulaQuimica — sin paréntesis', () => {
  test('elemento suelto y con subíndice', () => {
    expect(comp('H')).toEqual({ H: 1 });
    expect(comp('O2')).toEqual({ O: 2 });
    expect(comp('Fe')).toEqual({ Fe: 1 });
  });

  test('compuestos simples', () => {
    expect(comp('H2O')).toEqual({ H: 2, O: 1 });
    expect(comp('NaCl')).toEqual({ Na: 1, Cl: 1 });
    expect(comp('C6H12O6')).toEqual({ C: 6, H: 12, O: 6 });
    expect(comp('Fe2O3')).toEqual({ Fe: 2, O: 3 });
  });

  test('un símbolo repetido suma en vez de sobrescribir', () => {
    // CH3COOH: C 2 · H 4 · O 2 — el carbono y el hidrógeno aparecen dos veces cada uno
    expect(comp('CH3COOH')).toEqual({ C: 2, H: 4, O: 2 });
  });
});

test.describe('parsearFormulaQuimica — con paréntesis (el hallazgo 121)', () => {
  test('el subíndice multiplica al GRUPO, no al último símbolo', () => {
    expect(comp('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(comp('Mg(NO3)2')).toEqual({ Mg: 1, N: 2, O: 6 });
    expect(comp('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 });
    expect(comp('Ca3(PO4)2')).toEqual({ Ca: 3, P: 2, O: 8 });
  });

  test('un grupo sin subíndice cuenta una vez', () => {
    expect(comp('Na(OH)')).toEqual({ Na: 1, O: 1, H: 1 });
  });

  test('paréntesis anidados y corchetes', () => {
    // K4[Fe(CN)6]: el 6 multiplica a CN, y el corchete sin número no vuelve a multiplicar
    expect(comp('K4[Fe(CN)6]')).toEqual({ K: 4, Fe: 1, C: 6, N: 6 });
    // (NH4)2SO4 — sulfato de amonio: N 2 · H 8 · S 1 · O 4
    expect(comp('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 });
  });

  test('el mismo elemento dentro y fuera del paréntesis se acumula', () => {
    // HN(OH)2 → H 1+2 = 3 · N 1 · O 2
    expect(comp('HN(OH)2')).toEqual({ H: 3, N: 1, O: 2 });
  });

  test('los grupos quedan anotados con su multiplicador', () => {
    const r = parsearFormulaQuimica('Al2(SO4)3', TODOS);
    if (!r.ok) throw new Error('debería analizarse');
    expect(r.parseo.grupos).toEqual([{ formula: 'SO4', n: 3 }]);
  });
});

test.describe('parsearFormulaQuimica — entrada del usuario', () => {
  test('acepta espacios y subíndices unicode', () => {
    expect(comp(' H₂O ')).toEqual({ H: 2, O: 1 });
    expect(comp('Ca(OH)₂')).toEqual({ Ca: 1, O: 2, H: 2 });
  });

  test('normaliza corchetes y llaves a paréntesis', () => {
    const r = parsearFormulaQuimica('Ca{OH}2', TODOS);
    if (!r.ok) throw new Error('debería analizarse');
    expect(r.parseo.normalizada).toBe('Ca(OH)2');
  });
});

test.describe('parsearFormulaQuimica — lo que debe rechazar', () => {
  const falla = (formula: string, opciones: OpcionesFormula = TODOS) => {
    const r = parsearFormulaQuimica(formula, opciones);
    expect(r.ok).toBe(false);
    return r.ok ? '' : r.fallo.error;
  };

  test('entrada vacía', () => {
    expect(falla('')).toContain('Escribe una fórmula');
    expect(falla('   ')).toContain('Escribe una fórmula');
  });

  test('paréntesis desbalanceados, en los dos sentidos', () => {
    expect(falla('Ca(OH2')).toContain('Falta cerrar');
    expect(falla('CaOH)2')).toContain('se cierra sin haberse abierto');
  });

  test('subíndice cero, suelto o de grupo', () => {
    expect(falla('H0')).toContain('no puede valer 0');
    expect(falla('Ca(OH)0')).toContain('no puede valer 0');
  });

  test('caracteres que no son fórmula', () => {
    expect(falla('H2O + NaCl')).toContain('solo admite letras');
    expect(falla('2H2O')).toContain('No entiendo');
  });

  test('símbolo que no está en la tabla de quien llama', () => {
    // Una tabla que solo conoce el agua: el sodio debe rechazarse
    const soloAgua: OpcionesFormula = { simboloValido: (s: string) => s === 'H' || s === 'O' };
    expect(falla('NaCl', soloAgua)).toContain('Na');
    expect(comp('H2O', soloAgua)).toEqual({ H: 2, O: 1 });
  });

  test('el mensaje del símbolo desconocido se puede personalizar', () => {
    const r = parsearFormulaQuimica('Xx', {
      simboloValido: () => false,
      errorSimbolo: (s) => ({ error: `«${s}» no está en esta herramienta`, pista: null }),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fallo.error).toBe('«Xx» no está en esta herramienta');
  });
});

test.describe('conIndice', () => {
  test('omite el 1 y escribe el resto', () => {
    expect(conIndice('O', 1)).toBe('O');
    expect(conIndice('O', 3)).toBe('O3');
    expect(conIndice('Fe', 12)).toBe('Fe12');
  });
});
