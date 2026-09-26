/**
 * backup-critico.mjs
 * ------------------------------------------------------------------
 * Copia off-site (Proton Drive, vía Documents) de TODO lo que está en
 * .gitignore EXCEPTO lo regenerable/pesado. Es decir: exactamente los
 * ficheros que NO están en GitHub y no se pueden recuperar de otro sitio
 * (secretos, credenciales, docs estratégicos, scripts locales…).
 *
 * Regla: "si está en .gitignore y NO es regenerable → se copia".
 * Así, cualquier fichero privado futuro (nuevo .md, .env, carpeta de
 * secretos, en raíz o en subcarpeta) entra AUTOMÁTICAMENTE, sin tocar
 * este script. La lista se obtiene de git en cada ejecución.
 *
 * Los originales NO se modifican. Destino:
 * C:\Users\jaceb\Documents\meskeIA_Critico\  (Proton lo sincroniza)
 *
 * En DOS pasos, y el orden es la protección:
 *   1. La copia se prepara entera en una carpeta de %TEMP%, que Proton NO ve.
 *   2. Solo si ha salido completa, `robocopy /MIR` la vuelca al destino:
 *      copia lo que cambió, borra lo que ya no existe y no toca lo demás.
 * Si algo falla en el paso 1, el script termina sin haber tocado el
 * destino y en Proton sigue la copia buena del día anterior.
 *
 * Hasta el 26/09/2026 se borraba el destino y se regeneraba en el sitio.
 * Dos consecuencias: (a) si git o una copia fallaban a mitad, la carpeta
 * quedaba vacía y Proton subía ese vacío —la copia off-site acababa en la
 * papelera—, y (b) cada día los ~69 MB iban a la papelera de Proton, que
 * NO caduca: 3,73 GB acumulados en tres meses, de una cuota de 15 GB.
 *
 * ⚠️ El destino TIENE que estar dentro de `Documents`. El cliente de Proton
 * Drive en Windows NO sincroniza la carpeta `C:\Users\jaceb\Proton Drive`
 * —esa no sube nada—: funciona en modo "carpetas sincronizadas de este
 * dispositivo", y solo están Documents y Archivo Histórico. Mover el destino
 * a un sitio de nombre más lógico deja este script corriendo bien cada día y
 * sin copia off-site, sin dar ningún error. Lo mismo vale para los otros dos
 * backups del mismo patrón, en `Mis Desarrollos\Backups\`.
 *
 * Uso:   node scripts/backup-critico.mjs
 * ------------------------------------------------------------------
 */

import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const DOCUMENTS = 'C:\\Users\\jaceb\\Documents';
const DESTINO = join(DOCUMENTS, 'meskeIA_Critico');
// Fuera de Documents a propósito: lo que pase aquí Proton no lo ve
const PREPARACION = join(tmpdir(), 'meskeIA_Critico_preparacion');

// Entradas ignoradas que NO se copian (regenerables desde build/npm o gestionadas aparte)
const NO_COPIAR = new Set([
  'node_modules',            // se regenera con npm install
  '.next',                   // build
  '.vercel',                 // build/deploy
  'out', 'build', 'coverage',
  '_backups',                // dumps Turso: el último se copia aparte (abajo)
  '.claude/worktrees',       // worktrees temporales de git
  'public/ai-index.json',    // auto-generado en build
  'public/llm-index.json',   // auto-generado en build
  'next-env.d.ts',           // regenerable
  'test-results',            // playwright
  'playwright-report',
  'scripts/cursos-generados', // salida generada (recuperable)
]);

if (!existsSync(DOCUMENTS)) {
  console.error(`❌ No existe la carpeta sincronizada por Proton: ${DOCUMENTS}`);
  process.exit(1);
}

// La preparación sí se regenera limpia: así un doc borrado en el repo
// desaparece también de la copia (robocopy /MIR lo quitará del destino)
rmSync(PREPARACION, { recursive: true, force: true });
mkdirSync(PREPARACION, { recursive: true });

// --- 1. Obtener de git TODO lo ignorado (carpetas completas colapsadas) ---
// execFileSync (sin shell) con argumentos en array: seguro y sin inyección.
let ignorados;
try {
  ignorados = execFileSync(
    'git',
    ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory'],
    { cwd: RAIZ, encoding: 'utf8' }
  )
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
} catch (err) {
  console.error('❌ No se pudo ejecutar git (¿está en el PATH?):', err.message);
  process.exit(1);
}

const registro = [];
for (const entrada of ignorados) {
  const rel = entrada.replace(/\/$/, '');       // quitar barra final de carpetas
  if (NO_COPIAR.has(rel)) continue;             // saltar regenerables/pesados
  const origen = join(RAIZ, rel);
  if (!existsSync(origen)) continue;
  const destino = join(PREPARACION, rel);
  mkdirSync(dirname(destino), { recursive: true });
  // Conservar la fecha original: robocopy decide por tamaño y fecha qué ha
  // cambiado, y con la fecha de hoy lo daría todo por nuevo cada día
  cpSync(origen, destino, { recursive: true, preserveTimestamps: true });
  registro.push(`  · ${entrada}`);
}

// Una lista vacía no es «nada que copiar», es git respondiendo mal: volcarla
// con /MIR vaciaría la copia off-site, que es justo lo que se quiere evitar
if (registro.length === 0) {
  console.error('❌ git no ha devuelto nada que copiar: el destino se deja como estaba');
  process.exit(1);
}

// --- 2. Último dump de Turso (vive en _backups/, excluido del barrido) ---
const dirTurso = join(RAIZ, '_backups', 'turso');
if (existsSync(dirTurso)) {
  const dumps = readdirSync(dirTurso)
    .filter((f) => f.startsWith('turso-dump-') && f.endsWith('.sql'))
    .sort();
  if (dumps.length) {
    const ultimo = dumps[dumps.length - 1];
    mkdirSync(join(PREPARACION, 'turso'), { recursive: true });
    cpSync(join(dirTurso, ultimo), join(PREPARACION, 'turso', ultimo), { preserveTimestamps: true });
    registro.push(`  · turso/${ultimo} (último dump)`);
  }
}

// --- 3. Manifiesto ---
const ahora = new Date().toISOString();
const manifiesto = [
  'COPIA CRÍTICA meskeIA — off-site en Proton Drive (vía Documents)',
  '='.repeat(55),
  `Última actualización: ${ahora}`,
  '',
  'Regla: se copia TODO lo que está en .gitignore excepto lo regenerable',
  '(node_modules, .next, dumps antiguos, índices de build…). Cualquier',
  'fichero privado NUEVO se captura solo, sin tocar el script.',
  '',
  'Contenido copiado:',
  ...registro,
  '',
  'Los originales NO se modifican. La Rutina Matinal (05:30 diaria)',
  'actualiza esta carpeta y Proton la sube sola a la nube.',
].join('\n');
writeFileSync(join(PREPARACION, 'LEEME.txt'), manifiesto, 'utf8');

// --- 4. Volcado al destino ---
// /MIR: copia lo nuevo o cambiado y borra lo que ya no está en la preparación.
// Sin /NFL, para que el log diga QUÉ ficheros se movieron (suelen ser pocos).
// /UNILOG y no la consola: robocopy escribe la consola en la página de códigos
// OEM y los acentos llegaban rotos («M s reciente»); el log Unicode, no.
const LOG_ROBOCOPY = join(tmpdir(), 'meskeIA_Critico_robocopy.log');
const robocopy = spawnSync('robocopy', [
  PREPARACION, DESTINO, '/MIR', '/R:2', '/W:5', '/XJ', '/COPY:DAT', '/DCOPY:T',
  '/NJH', '/NJS', '/NDL', '/NP', `/UNILOG:${LOG_ROBOCOPY}`,
]);
const movidos = existsSync(LOG_ROBOCOPY)
  ? readFileSync(LOG_ROBOCOPY, 'utf16le')
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .map((l) => l.replaceAll(`${PREPARACION}\\`, '').replaceAll(`${DESTINO}\\`, '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  : [];
rmSync(LOG_ROBOCOPY, { force: true });

// robocopy: 0-7 = éxito (bits 1 copiado, 2 extras borrados, 4 desajustes); 8 o más = fallo
if (robocopy.error || robocopy.status === null || robocopy.status >= 8) {
  console.error(`❌ robocopy falló (código ${robocopy.status ?? robocopy.error?.message})`);
  console.error(movidos.join('\n'));
  process.exit(1);
}

rmSync(PREPARACION, { recursive: true, force: true });

console.log(`✅ Copia crítica actualizada en: ${DESTINO}`);
console.log(registro.join('\n'));
console.log(movidos.length ? `Cambios volcados (${movidos.length}):\n  ${movidos.join('\n  ')}` : 'Sin cambios que volcar');
