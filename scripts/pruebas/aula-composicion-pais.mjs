#!/usr/bin/env node
/**
 * aula-composicion-pais.mjs — casos de prueba del filtro de composición de país
 * que detectar-eventos-aula.mjs aplica a la forma A (aula distribuida).
 *
 * Cada caso lleva los NÚMEROS REALES medidos el 06/09/2026, no cifras inventadas:
 * si mañana alguien sube o baja DELTA_PAIS, esta prueba dice exactamente a quién
 * deja fuera y a quién mete. Los cuatro primeros son los que motivaron el filtro.
 *
 * Uso: node scripts/pruebas/aula-composicion-pais.mjs
 */

const DELTA_PAIS = parseFloat(process.env.DELTA_PAIS ?? '') || 0.20;

// Misma decisión que toma el detector: ¿el país dominante del día sobresale de la
// mezcla habitual de la app? La cuota habitual va SIN el día evaluado.
const esAnomalia = (concDiaPct, cuotaHabitual) => concDiaPct / 100 - cuotaHabitual >= DELTA_PAIS;

const CASOS = [
  // --- Los falsos positivos que destaparon el problema: apps MONOPAÍS ---
  { app: 'generador-loteria', dia: '2026-09-04', concDia: 100, habitual: 0.99,
    espera: false, porque: '99% España en toda su vida: un día al 100% es su normalidad, no un aula' },
  { app: 'generador-loteria', dia: '2026-09-01', concDia: 100, habitual: 0.99,
    espera: false, porque: 'el día de 40 visitas también: el volumen subió, la composición no' },
  { app: 'conversor-cnae-iae', dia: '2026-07-21', concDia: 96, habitual: 0.98,
    espera: false, porque: 'app fiscal española pura; 27 IPs distintas no la hacen un aula' },
  { app: 'simulador-gastos-compraventa-garaje', dia: '2026-07-07', concDia: 100, habitual: 0.98,
    espera: false, porque: '98% ES de base; aparecía en cuanto se relajaba el filtro de volumen' },

  // --- Los canónicos: tienen que seguir disparando, o el detector se queda ciego ---
  { app: 'simulador-equilibrio-quimico', dia: '2026-06-02', concDia: 99, habitual: 0.46,
    espera: true, porque: 'el caso fundacional, 290 visitas de México en un día' },
  { app: 'visualizador-sonido-ondas', dia: '2026-08-20', concDia: 100, habitual: 0.71,
    espera: true, porque: 'el falso NEGATIVO corregido el 05/09; el 77% de su tráfico de vida es aula' },
  { app: 'tabla-periodica', dia: '2026-08-18', concDia: 86, habitual: 0.37,
    espera: true, porque: '39% Colombia de base: un día al 86% CO sí es una desviación' },
  { app: 'simulador-genetica', dia: '2026-08-24', concDia: 80, habitual: 0.35,
    espera: true, porque: 'la app más recurrente del canal, 5 meses y 4 países distintos' },
  { app: 'simulador-movimiento-circular', dia: '2026-08-21', concDia: 79, habitual: 0.30,
    espera: true, porque: 'Nicaragua al 79% sobre una base del 30%' },

  // --- El borde: cuánto margen queda antes de empezar a colar ruido ---
  { app: '(sintético) app 70% ES, día al 88%', dia: '—', concDia: 88, habitual: 0.70,
    espera: false, porque: '+18 puntos se queda por debajo del listón de 20: el borde está aquí' },
  { app: '(sintético) app 70% ES, día al 91%', dia: '—', concDia: 91, habitual: 0.70,
    espera: true, porque: '+21 puntos ya pasa' },
];

let fallos = 0;
console.log(`Filtro de composición de país · DELTA_PAIS = ${(DELTA_PAIS * 100).toFixed(0)} puntos\n`);
for (const c of CASOS) {
  const real = esAnomalia(c.concDia, c.habitual);
  const ok = real === c.espera;
  if (!ok) fallos++;
  const delta = (c.concDia / 100 - c.habitual) * 100;
  console.log(
    `  ${ok ? 'OK  ' : 'FALLA'} ${(c.espera ? 'aula' : 'no  ').padEnd(5)}` +
    `${String(delta.toFixed(0) + ' pts').padStart(8)}  ${c.app.padEnd(38)} ${c.dia}`);
  if (!ok) console.log(`        esperaba ${c.espera ? 'aula' : 'NO aula'} — ${c.porque}`);
}

console.log(`\n${fallos === 0 ? '✅' : '❌'} ${CASOS.length - fallos}/${CASOS.length} casos correctos`);
if (fallos) {
  console.log('\nSi el cambio es deliberado, actualiza los casos Y la cabecera de');
  console.log('scripts/detectar-eventos-aula.mjs, que es donde vive la crónica del criterio.');
}
process.exit(fallos ? 1 : 0);
