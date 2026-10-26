/**
 * Prueba de la línea de base de la Ronda (`scripts/ronda-base.mjs`, cabo C0466)
 *
 * Ejecutar con:  node scripts/pruebas/probar-ronda-base.mjs
 *
 * Reinyecta el caso de origen —dos vueltas el 26/10/2026, /playground-sql/ rota en la primera—
 * y exige que la segunda la siga dando como NUEVA, comparada con la ronda del día anterior.
 * Con la base de antes (la última vuelta, la que fuera) salía «0 nuevas · 1 persistentes».
 */
import assert from 'node:assert/strict';
import { lineaDeBase, nuevasDelDia, nuevasQueYaNoAparecen } from '../ronda-base.mjs';

const comparar = (ahora, base) => {
  const antes = new Set(base ? base.conIncidencia : []);
  return { nuevas: ahora.filter((u) => !antes.has(u)), persistentes: ahora.filter((u) => antes.has(u)) };
};

let fallos = 0;
function caso(nombre, fn) {
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`  ✗ ${nombre}\n    ${e.message}`);
  }
}

// Estado que dejó la ronda del 25/10: una URL con aviso de siempre
const ayer = { fecha: '2026-10-25', conIncidencia: ['/ruido-conocido/'] };

// Primera vuelta del 26/10: /playground-sql/ rota por primera vez
const base1 = lineaDeBase(ayer, '2026-10-26');
const v1 = ['/ruido-conocido/', '/playground-sql/'];
const dif1 = comparar(v1, base1);
const estado1 = {
  fecha: '2026-10-26',
  base: base1,
  nuevasDelDia: nuevasDelDia(ayer, '2026-10-26', dif1.nuevas),
  conIncidencia: v1,
};

caso('la primera vuelta del día se compara con la ronda de ayer', () => {
  assert.equal(base1.fecha, '2026-10-25');
  assert.deepEqual(dif1.nuevas, ['/playground-sql/']);
});

caso('C0466 · la segunda vuelta del mismo día sigue dando /playground-sql/ como nueva', () => {
  const base2 = lineaDeBase(estado1, '2026-10-26');
  assert.equal(base2.fecha, '2026-10-25', 'la base tiene que seguir siendo la de ayer');
  const dif2 = comparar(v1, base2);
  assert.deepEqual(dif2.nuevas, ['/playground-sql/']);
});

caso('una nueva de la primera vuelta que la segunda ya no ve no se pierde', () => {
  const base2 = lineaDeBase(estado1, '2026-10-26');
  const dif2 = comparar(['/ruido-conocido/'], base2);
  const delDia = nuevasDelDia(estado1, '2026-10-26', dif2.nuevas);
  assert.deepEqual(delDia, ['/playground-sql/']);
  assert.deepEqual(nuevasQueYaNoAparecen(delDia, dif2.nuevas), ['/playground-sql/']);
});

caso('al día siguiente la base pasa a ser la última vuelta del día anterior', () => {
  const base3 = lineaDeBase(estado1, '2026-10-27');
  assert.deepEqual(base3, { fecha: '2026-10-26', conIncidencia: v1 });
  assert.deepEqual(nuevasDelDia(estado1, '2026-10-27', []), [], 'las nuevas del día no pasan al siguiente');
});

caso('un estado de hoy escrito antes del cambio (sin base) se compara con él, no con nada', () => {
  const viejo = { fecha: '2026-10-26', conIncidencia: v1 };
  assert.deepEqual(lineaDeBase(viejo, '2026-10-26'), { fecha: '2026-10-26', conIncidencia: v1 });
});

caso('sin estado previo no hay comparación', () => {
  assert.equal(lineaDeBase(null, '2026-10-26'), null);
});

console.log(fallos ? `\n${fallos} caso(s) en rojo` : '\nLínea de base de la Ronda: todo en verde');
process.exit(fallos ? 1 : 0);
