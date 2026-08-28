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
 * Los originales NO se modifican. El destino se regenera limpio cada vez.
 * Destino: C:\Users\jaceb\Documents\meskeIA_Critico\  (Proton lo sincroniza)
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

import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const DOCUMENTS = 'C:\\Users\\jaceb\\Documents';
const DESTINO = join(DOCUMENTS, 'meskeIA_Critico');

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

// Regenerar destino limpio (elimina obsoletos: p. ej. un doc borrado)
rmSync(DESTINO, { recursive: true, force: true });
mkdirSync(DESTINO, { recursive: true });

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
  const destino = join(DESTINO, rel);
  mkdirSync(dirname(destino), { recursive: true });
  cpSync(origen, destino, { recursive: true });
  registro.push(`  · ${entrada}`);
}

// --- 2. Último dump de Turso (vive en _backups/, excluido del barrido) ---
const dirTurso = join(RAIZ, '_backups', 'turso');
if (existsSync(dirTurso)) {
  const dumps = readdirSync(dirTurso)
    .filter((f) => f.startsWith('turso-dump-') && f.endsWith('.sql'))
    .sort();
  if (dumps.length) {
    const ultimo = dumps[dumps.length - 1];
    mkdirSync(join(DESTINO, 'turso'), { recursive: true });
    cpSync(join(dirTurso, ultimo), join(DESTINO, 'turso', ultimo));
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
  'Los originales NO se modifican. La tarea "Backup Critico meskeIA"',
  '(08:07 diaria) regenera esta carpeta y Proton la sube sola a la nube.',
].join('\n');
writeFileSync(join(DESTINO, 'LEEME.txt'), manifiesto, 'utf8');

console.log(`✅ Copia crítica actualizada en: ${DESTINO}`);
console.log(registro.join('\n'));
