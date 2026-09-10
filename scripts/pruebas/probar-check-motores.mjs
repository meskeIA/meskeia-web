#!/usr/bin/env node
/**
 * probar-check-motores.mjs — le reinyecta a `check:motores` el caso del que nació
 *
 * Ejecutar:  npm run motores:probar-candado
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Un candado que nunca ha fallado no ha demostrado nada: puede estar comprobando algo que
 * siempre se cumple, o no estar mirando. La única prueba de que `check:motores` sirve es
 * reproducirle el commit del que salió y exigir que se encienda.
 *
 * Los tres casos son los tres que ocurrieron de verdad:
 *
 *   1. UN MOTOR SE QUEDA SIN LECTOR — es literalmente `49b4e691` (07/06/2026): se retiran las
 *      tools del MCP y el motor sobrevive sin que nada avise. Debe FALLAR.
 *   2. LA CABECERA PROMETE UNA TOOL QUE NO EXISTE — es cómo esos 87 motores parecieron vivos
 *      quince meses, porque su comentario decía «Usada por: MCP server (calcular_x)». FALLA.
 *   3. UN MOTOR CON LECTOR Y CABECERA CIERTA — el caso sano. NO debe fallar, porque un candado
 *      que salta siempre estorba y se acaba desactivando.
 *
 * Y uno más, que es el que evita que el candado se vuelva inútil por la puerta de atrás:
 *
 *   4. UN MOTOR SIN LECTOR PERO CON `// motor-ok: <razón>` — el escape declarado. NO falla,
 *      porque la excepción está escrita y firmada. Sin la razón, sí falla (caso 5).
 *
 * Trabaja sobre COPIAS en un directorio temporal: no toca `lib/calculadoras/`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-motores-consumidos.mjs');
const DIR_MOTORES = path.join(RAIZ, 'lib/calculadoras');

/** Ejecuta el candado y dice solo si se encendió. */
function ejecutar() {
  try {
    execFileSync(process.execPath, [CANDADO], { cwd: RAIZ, stdio: 'pipe' });
    return { falla: false, salida: '' };
  } catch (e) {
    return { falla: true, salida: String(e.stdout ?? '') + String(e.stderr ?? '') };
  }
}

const CASOS = [
  {
    n: 1,
    nombre: 'un motor se queda SIN LECTOR (el caso de 49b4e691)',
    fichero: 'zzz_prueba_sin_lector.ts',
    contenido: `/**\n * Motor de prueba del candado. No lo importa nadie, que es justo el caso.\n */\nexport function calcularNada(x: number): number {\n  return x;\n}\n`,
    debeFallar: true,
    esperado: /SIN LECTOR/,
  },
  {
    n: 2,
    nombre: 'la cabecera PROMETE UNA TOOL que no está registrada',
    fichero: 'zzz_prueba_tool_fantasma.ts',
    // Lleva un lector (lo importa el propio fichero de prueba 3), así que lo único que puede
    // encenderlo es la cabecera. Se le da lector artificial más abajo.
    contenido: `/**\n * Motor de prueba.\n * Usada por: MCP server (calcular_tool_que_no_existe_jamas)\n */\nexport function calcularFantasma(x: number): number {\n  return x;\n}\n`,
    debeFallar: true,
    esperado: /TOOL INEXISTENTE/,
    conLector: true,
  },
  {
    n: 3,
    nombre: 'un motor CON lector y cabecera cierta (el caso sano)',
    fichero: 'zzz_prueba_sano.ts',
    contenido: `/**\n * Motor de prueba.\n * Usada por: el fichero de prueba del candado\n */\nexport function calcularSano(x: number): number {\n  return x;\n}\n`,
    debeFallar: false,
    conLector: true,
  },
  {
    n: 4,
    nombre: 'sin lector pero con «// motor-ok: <razón>» declarado',
    fichero: 'zzz_prueba_escape.ts',
    contenido: `/**\n * Motor de prueba.\n */\n// motor-ok: pieza de una API a medio publicar, se conecta en la semana del 15/09\nexport function calcularConEscape(x: number): number {\n  return x;\n}\n`,
    debeFallar: false,
  },
  {
    n: 5,
    nombre: 'el escape SIN razón escrita no vale',
    fichero: 'zzz_prueba_escape_vacio.ts',
    contenido: `/**\n * Motor de prueba.\n */\n// motor-ok:\nexport function calcularEscapeVacio(x: number): number {\n  return x;\n}\n`,
    debeFallar: true,
    esperado: /SIN LECTOR/,
  },
];

// Fichero que da lector a los casos que lo necesitan. Va en tests/ para no ensuciar app/.
const LECTOR = path.join(RAIZ, 'tests/zzz_prueba_lector_candado.ts');

const creados = [];
let fallos = 0;

try {
  console.log('Reinyectando al candado los casos de los que nació:\n');

  for (const caso of CASOS) {
    const destino = path.join(DIR_MOTORES, caso.fichero);
    fs.writeFileSync(destino, caso.contenido, 'utf8');
    creados.push(destino);

    if (caso.conLector) {
      const nombre = caso.fichero.replace(/\.ts$/, '');
      fs.appendFileSync(
        LECTOR,
        fs.existsSync(LECTOR) ? '' : '// Fichero temporal de `npm run motores:probar-candado`. Se borra solo.\n',
        'utf8',
      );
      fs.appendFileSync(LECTOR, `import '@/lib/calculadoras/${nombre}';\n`, 'utf8');
      if (!creados.includes(LECTOR)) creados.push(LECTOR);
    }

    const r = ejecutar();
    const bien = r.falla === caso.debeFallar && (!caso.esperado || caso.esperado.test(r.salida));
    console.log(`  ${bien ? '✓' : '✗'} caso ${caso.n} — ${caso.nombre}`);
    if (!bien) {
      fallos++;
      console.log(`      esperado: ${caso.debeFallar ? 'que FALLE' : 'que PASE'} · obtenido: ${r.falla ? 'falló' : 'pasó'}`);
      if (caso.esperado && r.falla) console.log(`      no encontró el mensaje ${caso.esperado} en la salida`);
    }

    fs.rmSync(destino, { force: true });
    creados.splice(creados.indexOf(destino), 1);
    if (caso.conLector && fs.existsSync(LECTOR)) {
      const sin = fs.readFileSync(LECTOR, 'utf8')
        .split('\n').filter((l) => !l.includes(caso.fichero.replace(/\.ts$/, ''))).join('\n');
      fs.writeFileSync(LECTOR, sin, 'utf8');
    }
  }
} finally {
  for (const f of creados) fs.rmSync(f, { force: true });
  fs.rmSync(LECTOR, { force: true });
}

// Y que tras retirar los ficheros de prueba el candado vuelva a estar en verde: si se quedara
// rojo, la prueba habría dejado el repositorio peor de como lo encontró.
const final = ejecutar();
if (final.falla) {
  fallos++;
  console.log('\n  ✗ el candado quedó ROJO tras limpiar los ficheros de prueba');
  console.log(final.salida);
}

console.log(
  fallos === 0
    ? `\n✓ el candado se enciende en los ${CASOS.filter((c) => c.debeFallar).length} casos que debe y calla en los ${CASOS.filter((c) => !c.debeFallar).length} que debe`
    : `\n✗ ${fallos} comprobación(es) del candado no salieron como debían`,
);
process.exit(fallos === 0 ? 0 : 1);
