#!/usr/bin/env node
/**
 * Instalador de hooks de git — meskeIA
 *
 * Git no versiona el directorio .git/hooks/, por lo que los hooks no viajan al
 * clonar el repositorio. Este script los reescribe a partir del contenido
 * definido aquí, que sí está versionado.
 *
 * Uso:  npm run hooks:install
 *
 * Ejecutar después de clonar el repositorio en una máquina nueva.
 */

import { writeFileSync, readFileSync, chmodSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = process.cwd();
const DIRECTORIO_HOOKS = join(RAIZ, '.git', 'hooks');

/** Contenido de cada hook, indexado por nombre de archivo. */
const HOOKS = {
  'pre-commit': `#!/bin/sh
# Guardián de secretos + goldens de cálculo — meskeIA
# Generado por scripts/install-hooks.mjs · reinstalar con: npm run hooks:install
#
# Bloquea el commit si detecta credenciales o rutas privadas en los cambios
# preparados. Saltarse este hook está PROHIBIDO y lo rechaza un hook PreToolUse de
# Claude Code: desarmaría las tres comprobaciones a la vez.

git -c core.quotepath=false diff --cached --unified=0 --no-color --no-renames --diff-filter=ACM |
  node scripts/check-secrets.mjs || exit 1

# ── El Cuadre: lo que se tocó frente a lo que se pidió ────────────────────────
#
# Cuenta y compara; no opina. Calla salvo que aparezca algo que nadie encargó: un test
# borrado, una dependencia nueva, un candado desenganchado del build, un disclaimer caído.
# Va aquí y no en \`npm run build\` porque necesita saber DÓNDE empezó la sesión, y porque
# este es el momento que importa: el commit que acaba en producción.
#
# Medido sobre los 400 commits anteriores a su creación: habla en 8. Si un día habla mucho
# más, la prueba dirá qué regla se ha vuelto habladora:  npm run cuadre:probar-candado
#
# Si bloquea y la sorpresa es correcta, se autoriza dejando la razón escrita —nunca con
# --no-verify, que desarmaría también las dos comprobaciones de arriba y de abajo:
#     CUADRE_OK="por qué es correcto" git commit -m "…"

node scripts/cuadre.mjs --pre-commit || exit 1

# ── Goldens de cálculo, solo cuando el commit toca lo que los alimenta ────────
#
# De dónde sale (2026-08-13): el commit d67fbef8 subió las pensiones mínimas de
# viudedad hasta 471 €/mes, tocó 7 ficheros y ninguno era de tests. Los goldens
# se quedaron afirmando las cifras viejas y \`test:calc\` acumuló 5 rojos fijos
# durante días. Cinco rojos permanentes entrenan a ignorar la suite entera, que
# es como se pierde el sexto —el que sí importa— entre los conocidos.
#
# No va en \`npm run build\` a propósito: ese script lo ejecuta también Vercel en
# cada deploy, y meter ahí el runner de tests añadiría un modo de fallo en
# producción ajeno al código. Aquí cuesta ~5 s y solo cuando procede.

ARCHIVOS=$(git diff --cached --name-only --diff-filter=ACM)

if echo "$ARCHIVOS" | grep -qE '^(data/fiscal/|lib/calculadoras/|lib/numeroALetras\\.ts|tests/)'; then
  echo "→ El commit toca datos o motores de cálculo: ejecutando test:calc…"
  if ! npm run test:calc --silent; then
    echo ""
    echo "✖ [goldens] Los tests de cálculo no pasan con estos cambios."
    echo "  Si el motor es ahora correcto, actualiza el golden y verifica la cifra"
    echo "  contra data/fiscal/ — nunca copiando lo que devuelve el motor."
    echo "  No hay salto: corrige el golden o la cifra."
    exit 1
  fi
fi
`,
};

if (!existsSync(join(RAIZ, '.git'))) {
  console.error('✖ No se encuentra el directorio .git — ejecuta el comando desde la raíz del repositorio.');
  process.exit(1);
}

mkdirSync(DIRECTORIO_HOOKS, { recursive: true });

for (const [nombre, contenido] of Object.entries(HOOKS)) {
  const destino = join(DIRECTORIO_HOOKS, nombre);
  writeFileSync(destino, contenido, { encoding: 'utf8' });
  chmodSync(destino, 0o755);
  console.log(`✓ Hook instalado: .git/hooks/${nombre}`);
}

// ── Los hooks de Claude Code, que son la otra mitad del Cuadre ───────────────
//
// El hook de git bloquea, pero quien recoge QUÉ se pidió —literal, sin pasar por el modelo— son
// los hooks de Claude Code. Viven en `~/.claude/settings.json`, que no se versiona, así que en
// una máquina nueva hay que declararlos a mano. Este script no los escribe: solo dice si están,
// porque ese fichero es del usuario y tocarlo sin avisar sería exactamente la clase de sorpresa
// que el Cuadre existe para contar.

const EVENTOS_CUADRE = ['SessionStart', 'UserPromptSubmit', 'SessionEnd', 'PreToolUse'];
const AJUSTES_CLAUDE = join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'settings.json');

try {
  const ajustes = JSON.parse(readFileSync(AJUSTES_CLAUDE, 'utf8'));
  const faltan = EVENTOS_CUADRE.filter(
    (evt) =>
      !(ajustes.hooks?.[evt] || []).some((grupo) =>
        (grupo.hooks || []).some((h) => JSON.stringify(h).includes('cuadre-hook.mjs')),
      ),
  );
  if (faltan.length === 0) {
    console.log('✓ Hooks de Claude Code del Cuadre: los cuatro declarados.');
  } else {
    console.log(`\n⚠ Al Cuadre le faltan hooks de Claude Code: ${faltan.join(', ')}`);
    console.log('  Sin ellos bloquea igual, pero no sabe qué se pidió. Declararlos en');
    console.log(`  ${AJUSTES_CLAUDE} apuntando a scripts/cuadre-hook.mjs (ver skill /cuadre).`);
  }
} catch {
  console.log('\n⚠ No se ha podido leer ~/.claude/settings.json: no sé si los hooks del Cuadre están.');
}

console.log('\nComprobación rápida:  npm run check:secrets');
console.log('El pre-commit ejecuta además test:calc (~5 s) cuando el commit toca');
console.log('data/fiscal/, lib/calculadoras/ o tests/.');
