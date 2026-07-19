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
# Guardián de secretos — meskeIA
# Generado por scripts/install-hooks.mjs · reinstalar con: npm run hooks:install
#
# Bloquea el commit si detecta credenciales o rutas privadas en los cambios
# preparados. Para saltarlo puntualmente: git commit --no-verify

git -c core.quotepath=false diff --cached --unified=0 --no-color --no-renames --diff-filter=ACM |
  node scripts/check-secrets.mjs
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
