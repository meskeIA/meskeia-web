import { test, expect } from '@playwright/test';
import { ELEMENTOS as CANONICO } from '../data/elementos-quimicos';
import { ELEMENTOS as CONFIGURACION } from '../app/calculadora-configuracion-electronica/motor';
import { ELEMENTOS as FORMULADOR } from '../app/formulador-compuestos-inorganicos/motor';
import { ELEMENTOS as VALENCIAS } from '../app/tabla-valencias/datos';
import { elementos as TABLA_PERIODICA } from '../app/tabla-periodica/elementos-data';
import { ELEMENTOS as TENDENCIAS } from '../app/simulador-tabla-periodica-tendencias/datos';

/**
 * Cabo C0504 (inspector de quiz-simbolos-quimicos, 28/10/2026): el sitio llamaba al W «Tungsteno»
 * en calculadora-configuracion-electronica y «Wolframio» en las demás tablas, y al Te «Teluro» en
 * tabla-valencias (y en el formulador) frente a «Telurio» en el resto. Las dos grafías de cada
 * par las admite el DLE; lo que no cuadra es que el mismo elemento tenga dos nombres según la app.
 * Referencia: data/elementos-quimicos.ts. Un sinónimo va en su sitio (otrosNombres, sinonimos),
 * no en el nombre.
 */
const clave = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

/**
 * Fuera, a sabiendas: el Zn. «Zinc» (data/, tabla-periodica, tendencias) y «cinc» (formulador,
 * tabla-solubilidad, tabla-potenciales-redox y la prosa de varias apps) se reparten el sitio, y
 * elegir uno toca la salida del formulador y los textos de media docena de apps: cabo aparte.
 */
const PENDIENTES = new Set(['Zn']);

const tablas: Array<[string, ReadonlyArray<{ simbolo: string; nombre: string }>]> = [
  ['calculadora-configuracion-electronica/motor.ts', CONFIGURACION],
  ['formulador-compuestos-inorganicos/motor.ts', FORMULADOR],
  ['tabla-valencias/datos.ts', VALENCIAS],
  ['tabla-periodica/elementos-data.ts', TABLA_PERIODICA],
  ['simulador-tabla-periodica-tendencias/datos.ts', TENDENCIAS],
];

test('C0504 · cada elemento se llama igual en todas las tablas que lo nombran', () => {
  const canonico = new Map(CANONICO.map((e) => [e.simbolo, e.nombre]));
  const distintos: string[] = [];
  for (const [fichero, lista] of tablas) {
    for (const e of lista) {
      const ref = canonico.get(e.simbolo);
      if (ref && !PENDIENTES.has(e.simbolo) && clave(ref) !== clave(e.nombre)) distintos.push(`${fichero}: ${e.simbolo} «${e.nombre}» frente a «${ref}»`);
    }
  }
  expect(distintos).toEqual([]);
});
