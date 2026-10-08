#!/usr/bin/env node
/**
 * Pruebas de la entrada de cabos (`cabos.mjs`), sobre bases DESECHABLES.
 *
 * Ejecutar con:  npm run cabos:probar
 *
 * Comprueba las reglas que dejan un cabo encontrable y su cierre comprobable, y el principio
 * que justifica la entrada: NINGÚN DESTINO SIN CONSUMIDOR. Ese último mira las skills
 * (`.claude/skills/<consumidor>/SKILL.md`), que no se versionan: en una máquina sin ellas se
 * omite y lo dice.
 *
 * Caso de origen (08/10/2026): `SOSPECHAS.md` tenía 105 de 164 líneas que su único lector no
 * podía recoger, y nada lo decía. La prueba del consumidor se escribió ANTES de cambiar las
 * skills y se vio fallar con los cuatro destinos.
 *
 * Ninguna base toca `_private/cabos/cabos.db`: van por un directorio temporal.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { abrir, alta, listar, clasificar, anotar, cerrar, resumen, movimientosDe, leerId, DESTINOS, RAIZ } from './cabos.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cabos-'));
let fallos = 0;
let pasos = 0;

function caso(nombre, fn) {
  pasos++;
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallos++;
    console.log(`  ✗ ${nombre}\n      ${e.message}`);
  }
}

function igual(obtenido, esperado, que) {
  if (JSON.stringify(obtenido) !== JSON.stringify(esperado)) {
    throw new Error(`${que}: esperado ${JSON.stringify(esperado)}, obtenido ${JSON.stringify(obtenido)}`);
  }
}

function falla(fn, contiene) {
  try {
    fn();
  } catch (e) {
    if (!e.message.includes(contiene)) throw new Error(`falló, pero con otro mensaje: «${e.message}»`);
    return;
  }
  throw new Error(`debía fallar (${contiene}) y no falló`);
}

// Windows no deja borrar una base abierta: se cierran todas antes de limpiar
const abiertas = [];
const nueva = (n) => { const db = abrir(path.join(TMP, `${n}.db`)); abiertas.push(db); return db; };

console.log('\nAlta');
{
  const db = nueva('alta');
  caso('sin origen no se admite', () => falla(() => alta(db, { sujeto: 'x', texto: 't' }), 'falta «origen»'));
  caso('un destino inventado no se admite', () => falla(() => alta(db, { sujeto: 'x', texto: 't', origen: 'o', destino: 'cola' }), 'desconocido'));
  caso('una fecha que no es AAAA-MM-DD no se admite', () => falla(() => alta(db, { sujeto: 'x', texto: 't', origen: 'o', fecha: '08/10/2026' }), 'AAAA-MM-DD'));
  caso('sin destino entra SIN CLASIFICAR', () => {
    const { id } = alta(db, { sujeto: 'simulador-oferta-demanda', texto: 'el lienzo sale en blanco', origen: 'prueba' });
    igual(id, 1, 'id');
    igual(resumen(db).sinClasificar, 1, 'sin clasificar');
  });
  caso('un sujeto parecido se avisa, sin bloquear', () => {
    const { id, parecidos } = alta(db, { sujeto: 'simulador-oferta-demanda (tests)', texto: 'otra cosa', origen: 'prueba', destino: 'reparar' });
    igual(id, 2, 'id');
    igual(parecidos.map((p) => p.id), [1], 'parecidos');
  });
  caso('las palabras genéricas no emparejan', () => {
    alta(db, { sujeto: 'familia selectores', texto: 't', origen: 'o' });
    igual(alta(db, { sujeto: 'familia quizzes', texto: 't', origen: 'o' }).parecidos, [], 'parecidos');
  });
  caso('la fecha original se conserva (migraciones)', () => {
    const { id } = alta(db, { sujeto: 'x', texto: 't', origen: 'o', fecha: '2026-09-24' });
    igual(listar(db, { sujeto: 'x' }).find((c) => c.id === id).fecha, '2026-09-24', 'fecha');
  });
}

console.log('\nClasificar y anotar');
{
  const db = nueva('clasificar');
  alta(db, { sujeto: 'a', texto: 't', origen: 'o' });
  caso('clasificar mueve el cabo a su destino', () => {
    clasificar(db, 1, 'inspector', 'es de una app');
    igual(resumen(db).porDestino.inspector, 1, 'inspector');
    igual(resumen(db).sinClasificar, 0, 'sin clasificar');
  });
  caso('reclasificar deja rastro de los dos destinos', () => {
    clasificar(db, 1, 'reparar');
    igual(movimientosDe(db, 1).at(-1).detalle, 'inspector → reparar', 'movimiento');
  });
  caso('una nota vacía no se admite', () => falla(() => anotar(db, 1, '  '), 'vacía'));
  caso('lista por destino', () => igual(listar(db, { destino: 'reparar' }).length, 1, 'reparar'));
}

console.log('\nCerrar');
{
  const db = nueva('cerrar');
  for (let i = 0; i < 6; i++) alta(db, { sujeto: `s${i}`, texto: 't', origen: 'o' });
  caso('«enviado» sin referencia no se admite', () => falla(() => cerrar(db, 1, { como: 'enviado' }), 'exige --ref'));
  caso('«enviado» a una bandeja que no existe no se admite', () => falla(() => cerrar(db, 1, { como: 'enviado', ref: 'backlog:5' }), 'exige --ref'));
  caso('«enviado» con una referencia mal formada no se admite', () => falla(() => cerrar(db, 1, { como: 'enviado', ref: 'hallazgo:mil' }), 'no tiene la forma'));
  caso('«enviado» a un hallazgo con su número', () => cerrar(db, 1, { como: 'enviado', ref: 'hallazgo:3120' }));
  caso('«descartado» sin motivo no se admite', () => falla(() => cerrar(db, 2, { como: 'descartado' }), 'exige --motivo'));
  caso('«duplicado» de sí mismo no se admite', () => falla(() => cerrar(db, 3, { como: 'duplicado', ref: 'C0003' }), 'sí mismo'));
  caso('«duplicado» de uno que no existe no se admite', () => falla(() => cerrar(db, 3, { como: 'duplicado', ref: 'C0099' }), 'no existe'));
  caso('«duplicado» normaliza la referencia', () => {
    cerrar(db, 3, { como: 'duplicado', ref: '4' });
    igual(listar(db, { todos: true }).find((c) => c.id === 3).ref, 'C0004', 'ref');
  });
  caso('un cabo cerrado no se vuelve a cerrar ni a clasificar', () => {
    falla(() => cerrar(db, 1, { como: 'resuelto', motivo: 'm' }), 'ya está cerrado');
    falla(() => clasificar(db, 1, 'reparar'), 'ya está cerrado');
  });
  caso('NADA SE BORRA: el cerrado sigue en la base, con su historia', () => {
    igual(listar(db, { todos: true }).length, 6, 'total');
    igual(listar(db).length, 4, 'abiertos');
    igual(movimientosDe(db, 1).map((m) => m.accion), ['alta', 'cerrar'], 'movimientos');
    igual(resumen(db).cerrados, 2, 'cerrados');
  });
}

console.log('\nNúmeros de cabo');
caso('C0012, c12 y 12 son el mismo', () => igual([leerId('C0012'), leerId('c12'), leerId('12')], [12, 12, 12], 'ids'));
caso('un texto cualquiera no es un número', () => falla(() => leerId('doce'), 'no es un número'));

console.log('\nLínea de órdenes');
caso('resumen --json se puede leer', () => {
  const env = { ...process.env, CABOS_DB: path.join(TMP, 'cli.db') };
  const cli = path.join(RAIZ, 'scripts', 'cabos', 'cabos.mjs');
  execFileSync(process.execPath, [cli, 'alta', '--sujeto', 'x', '--origen', 'o', '--texto', 'el 0,75 % no cuadra'], { env });
  const r = JSON.parse(execFileSync(process.execPath, [cli, 'resumen', '--json'], { env, encoding: 'utf8' }));
  igual(r.abiertos, 1, 'abiertos');
});
caso('una orden mal escrita sale con error', () => {
  const env = { ...process.env, CABOS_DB: path.join(TMP, 'cli.db') };
  const cli = path.join(RAIZ, 'scripts', 'cabos', 'cabos.mjs');
  falla(() => execFileSync(process.execPath, [cli, 'cerrar', '1', '--como', 'olvidado'], { env, stdio: 'pipe' }), 'Command failed');
});

console.log('\nNingún destino sin consumidor');
{
  const dirSkills = path.join(RAIZ, '.claude', 'skills');
  if (!fs.existsSync(dirSkills)) {
    console.log('  · omitido: esta máquina no tiene las skills (no se versionan)');
  } else {
    for (const [destino, { consumidor }] of Object.entries(DESTINOS)) {
      caso(`«${destino}» lo lee /${consumidor}`, () => {
        const ruta = path.join(dirSkills, consumidor, 'SKILL.md');
        if (!fs.existsSync(ruta)) throw new Error(`no existe la skill ${consumidor}`);
        if (!fs.readFileSync(ruta, 'utf8').includes(`--destino ${destino}`)) {
          throw new Error(`${consumidor}/SKILL.md no contiene «--destino ${destino}»: ese destino no tiene quien lo vacíe`);
        }
      });
    }
  }
}

for (const db of abiertas) db.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${pasos - fallos} de ${pasos} correctas${fallos ? ` · ${fallos} FALLAN` : ''}`);
process.exitCode = fallos ? 1 : 0;
