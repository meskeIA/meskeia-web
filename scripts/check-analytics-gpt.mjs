#!/usr/bin/env node
/**
 * Candado: ninguna API route de un GPT puede registrar uso sin decir QUIÉN llama.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * DE QUÉ CASO SALE (14/09/2026)
 *
 * Las 48 routes de `app/api/chatgpt/*` que registraban su uso escribían `modo='chatgpt'` sin
 * capturar el `user-agent` del llamante. Y el foso IA —la métrica que decide si se invierte en
 * el canal— contaba TODAS esas filas como canal IA. Como el endpoint es público (sus esquemas
 * se publican en `public/chatgpt-schema-*.json`) y el CORS no protege una llamada de servidor
 * a servidor, que es justo la forma de una Action de GPT, **cualquiera con un `curl` podía
 * inflar la métrica estratégica del proyecto**.
 *
 * No es hipotético: es literalmente lo que pasó con el MCP el 30/07/2026, cuando el escáner
 * `mcp-schema-probe/0.1` metió 121 llamadas y dejó el foso en «+1277 %». Allí se cerró con
 * lista blanca de UA; aquí faltaba la mitad previa —no había UA que mirar— y nadie lo vio
 * durante meses porque el número que salía era plausible.
 *
 * Cuando se destapó eran **71 de las 412 visitas de 30 días (17 %)**, 70 de ellas sobre una
 * sola app, justo mientras el foso cruzaba su umbral de reapertura.
 *
 * QUÉ EXIGE
 * Que toda route bajo `app/api/chatgpt/` que escriba en `uso_aplicaciones` use también
 * `datosLlamanteGpt()` de `@/lib/analytics-gpt`. No exige que registre: hay 22 que no lo hacen
 * y puede ser deliberado. Solo exige que, si registra, se sepa quién llamó.
 *
 * QUÉ **NO** MIRA
 * No comprueba que el UA sea de un cliente real, ni decide la lista blanca — eso es criterio y
 * vive en el clasificador (`scripts/digest-diario.mjs`, const FOSO). Tampoco vigila otras
 * familias de endpoints: si mañana nace `app/api/otra-ia/`, hay que añadirla a RAICES.
 *
 * SIN PASIVO: se drenó entero el 14/09/2026 (48 de 48), así que solo puede encenderlo código
 * nuevo. Escape para un falso positivo: `gpt-ua-ok: <razón>` en esa línea o en la anterior.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAICES = ['app/api/chatgpt'];
const ESCAPE = /gpt-ua-ok:/;

/** Devuelve las rutas de todos los route.ts bajo un directorio. */
function routesDe(base) {
  const abs = path.join(RAIZ, base);
  if (!existsSync(abs)) return [];
  const salida = [];
  for (const entrada of readdirSync(abs)) {
    const dir = path.join(abs, entrada);
    if (!statSync(dir).isDirectory()) continue;
    const route = path.join(dir, 'route.ts');
    if (existsSync(route)) salida.push(route);
  }
  return salida;
}

const fallos = [];
let conRegistro = 0;
let sinRegistro = 0;

for (const base of RAICES) {
  for (const route of routesDe(base)) {
    const texto = readFileSync(route, 'utf8');
    const lineas = texto.split('\n');

    const iInsert = lineas.findIndex((l) => l.includes('INSERT INTO uso_aplicaciones'));
    if (iInsert === -1) { sinRegistro++; continue; }
    conRegistro++;

    if (texto.includes('datosLlamanteGpt')) continue;

    // Escape en la línea del INSERT o en la anterior, como el resto de candados del proyecto.
    const anterior = iInsert > 0 ? lineas[iInsert - 1] : '';
    if (ESCAPE.test(lineas[iInsert]) || ESCAPE.test(anterior)) continue;

    fallos.push({ fichero: path.relative(RAIZ, route).replace(/\\/g, '/'), linea: iInsert + 1 });
  }
}

if (fallos.length) {
  console.error('\x1b[31m✖ [analytics-gpt]\x1b[0m routes de GPT que registran uso sin identificar al llamante:\n');
  for (const f of fallos) {
    console.error(`   ${f.fichero}:${f.linea}`);
  }
  console.error(`
   Una route que escribe modo='chatgpt' sin capturar el user-agent deja el foso IA
   —la métrica que decide inversión— abierto a que cualquiera lo infle con un curl:
   el endpoint es público y el CORS no protege las llamadas de servidor a servidor.

   Arreglo: importar { datosLlamanteGpt } de '@/lib/analytics-gpt' y añadirlo a
   datos_adicionales:

     JSON.stringify({ ...tusDatos, ...(await datosLlamanteGpt()) })

   Falso positivo: escribe \`gpt-ua-ok: <razón>\` en la línea del INSERT o en la anterior.
`);
  process.exit(1);
}

console.log(
  `\x1b[32m✓ [analytics-gpt]\x1b[0m\x1b[90m las ${conRegistro} routes de GPT que registran uso identifican al llamante` +
  ` (${sinRegistro} no registran, y puede ser deliberado).\x1b[0m`
);
