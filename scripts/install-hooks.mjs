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

import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'node:fs';
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
# preparados. Para saltarlo puntualmente: git commit --no-verify

git -c core.quotepath=false diff --cached --unified=0 --no-color --no-renames --diff-filter=ACM |
  node scripts/check-secrets.mjs || exit 1

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
    echo "  Salto puntual: git commit --no-verify"
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

console.log('\nComprobación rápida:  npm run check:secrets');
console.log('El pre-commit ejecuta además test:calc (~5 s) cuando el commit toca');
console.log('data/fiscal/, lib/calculadoras/ o tests/.');
