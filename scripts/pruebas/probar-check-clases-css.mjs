#!/usr/bin/env node
/**
 * probar-check-clases-css.mjs — le reinyecta a `check:clases-css` el caso del que nació y las
 * formas que NO debe encender.
 *
 * Ejecutar:  npm run clases-css:probar-candado
 *
 * El candado juzga lo que el commit AÑADE, así que cada caso monta un repositorio git temporal:
 * `antes` se commitea, `despues` se deja en el árbol de trabajo, y el candado mira el diff.
 *
 *   1. CASO DE ORIGEN · estimador-cartera-inversion antes de c465b811 (28 clases que su
 *      .module.css no declara), como fichero NUEVO. Debe FALLAR.
 *   2. El mismo, reparado en c465b811. Debe CALLAR.
 *   3. El de antes ya commiteado, y el commit solo añade un comentario. Debe CALLAR: es pasivo.
 *   4. El reparado ya commiteado, y el commit añade una línea con una clase inexistente. FALLAR.
 *   5. generador-firma-email tal como está: un `const styles = {…}` de estilos en línea tapa al
 *      import dentro de una función. Debe CALLAR.
 *   6. Dos módulos importados (`@/styles/…` y `./…`): cada clase se busca en el suyo. CALLAR.
 *   7. Lo mismo, pero la clase se lee del módulo equivocado. Debe FALLAR.
 *   8. `composes:` local. Debe CALLAR.
 *   9. Acceso dinámico `styles[variable]`. Debe CALLAR.
 *  10. `styles['con-guion']` declarada con guion. Debe CALLAR.
 *  11. Clase con tilde (`.colorLeptón`). Debe CALLAR.
 *  12. `clases-ok: <razón>` en la línea anterior. Debe CALLAR.
 *  13. `clases-ok:` a secas. Debe FALLAR.
 *  14. El commit quita una clase del .module.css y el .tsx que la usa no se toca. Debe FALLAR.
 *  15. Un import de .module.css citado dentro de una cadena. Debe CALLAR.
 *  16. `import * as styles from '….module.css'`: no sabe ligarlo, así que se PLANTA (falla).
 *
 * No escribe NADA en el repositorio: todo vive en directorios temporales.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-clases-css.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const CARTERA_TSX = 'app/estimador-cartera-inversion/page.tsx';
const CARTERA_CSS = 'app/estimador-cartera-inversion/EstimadorCartera.module.css';
const cartera = (rev) => ({ [CARTERA_TSX]: deGit(rev, CARTERA_TSX), [CARTERA_CSS]: deGit(rev, CARTERA_CSS) });
const ANTES = cartera('c465b811^');
const DESPUES = cartera('c465b811');
if (!ANTES[CARTERA_TSX].includes('styles.comparativaTable') || ANTES[CARTERA_CSS].includes('.comparativaTable')) {
  console.error('❌ El caso de origen ya no es el que era: estimador-cartera-inversion antes de c465b811 no usa styles.comparativaTable sin declararla');
  process.exit(1);
}
const FIRMA = 'app/generador-firma-email/page.tsx';
const FIRMA_CSS = 'app/generador-firma-email/GeneradorFirmaEmail.module.css';
const firma = { [FIRMA]: fs.readFileSync(path.join(RAIZ, FIRMA), 'utf8'), [FIRMA_CSS]: fs.readFileSync(path.join(RAIZ, FIRMA_CSS), 'utf8') };

const TSX = 'app/prueba/page.tsx';
const CSS = 'app/prueba/Prueba.module.css';
const pagina = (cuerpo, imports = "import styles from './Prueba.module.css';") =>
  `'use client';\n${imports}\n\nexport default function Prueba() {\n  const clave = 'caja';\n  return (\n    <div>\n${cuerpo}\n    </div>\n  );\n}\n`;
const modulo = (css = '.caja { padding: 1rem; }\n') => ({ [CSS]: css });

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · estimador-cartera-inversion antes de c465b811, fichero nuevo', debeFallar: true, despues: ANTES },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · estimador-cartera-inversion en c465b811', debeFallar: false, despues: DESPUES },
  {
    n: 3, nombre: 'pasivo: el commit solo añade un comentario', debeFallar: false,
    antes: ANTES,
    despues: { [CARTERA_TSX]: ANTES[CARTERA_TSX].replace("'use client';", "'use client';\n// retocado") },
  },
  {
    n: 4, nombre: 'el commit añade una línea con una clase inexistente', debeFallar: true,
    antes: DESPUES,
    despues: { [CARTERA_TSX]: DESPUES[CARTERA_TSX].replace(/(\n\s*<MeskeiaLogo \/>)/, '$1\n      <div className={styles.noExiste} />') },
  },
  { n: 5, nombre: 'generador-firma-email: const styles en línea que tapa al import', debeFallar: false, despues: firma },
  {
    n: 6, nombre: 'dos módulos, cada clase en el suyo', debeFallar: false,
    despues: {
      ...modulo(), 'styles/impresion.module.css': '.hoja { color: black; }\n',
      [TSX]: pagina('      <p className={styles.caja} />\n      <p className={impresion.hoja} />',
        "import styles from './Prueba.module.css';\nimport impresion from '@/styles/impresion.module.css';"),
    },
  },
  {
    n: 7, nombre: 'clase leída del módulo equivocado', debeFallar: true,
    despues: {
      ...modulo(), 'styles/impresion.module.css': '.hoja { color: black; }\n',
      [TSX]: pagina('      <p className={styles.hoja} />',
        "import styles from './Prueba.module.css';\nimport impresion from '@/styles/impresion.module.css';"),
    },
  },
  {
    n: 8, nombre: 'composes local', debeFallar: false,
    despues: { ...modulo('.caja { padding: 1rem; }\n.cajaActiva {\n  composes: caja;\n  color: red;\n}\n'), [TSX]: pagina('      <p className={styles.cajaActiva} />') },
  },
  { n: 9, nombre: 'acceso dinámico styles[clave]', debeFallar: false, despues: { ...modulo(), [TSX]: pagina('      <p className={styles[clave]} />') } },
  {
    n: 10, nombre: "styles['con-guion'] declarada", debeFallar: false,
    despues: { ...modulo('.con-guion { padding: 0; }\n'), [TSX]: pagina("      <p className={styles['con-guion']} />") },
  },
  {
    n: 11, nombre: 'clase con tilde (.colorLeptón)', debeFallar: false,
    despues: { ...modulo('.colorLeptón { color: blue; }\n'), [TSX]: pagina('      <p className={styles.colorLeptón} />') },
  },
  {
    n: 12, nombre: 'clases-ok: con razón', debeFallar: false,
    despues: { ...modulo(), [TSX]: pagina('      {/* clases-ok: la pone un tema externo que se inyecta en tiempo de ejecución */}\n      <p className={styles.externa} />') },
  },
  {
    n: 13, nombre: 'clases-ok: a secas', debeFallar: true,
    despues: { ...modulo(), [TSX]: pagina('      {/* clases-ok: */}\n      <p className={styles.externa} />') },
  },
  {
    n: 14, nombre: 'el commit quita la clase del .module.css', debeFallar: true,
    antes: { ...modulo('.caja { padding: 1rem; }\n.borde { border: 1px solid; }\n'), [TSX]: pagina('      <p className={styles.borde} />') },
    despues: modulo(),
  },
  {
    n: 15, nombre: 'import citado dentro de una cadena', debeFallar: false,
    despues: { [TSX]: "export const ejemplo = 'import styles from \"./Button.module.css\"; <button className={styles.primary}>';\n" },
  },
  {
    n: 16, nombre: 'import * as styles: no sabe ligarlo y se planta', debeFallar: true,
    despues: { ...modulo(), [TSX]: pagina('      <p className={styles.caja} />', "import * as styles from './Prueba.module.css';") },
  },
];

const escribir = (dir, ficheros) => {
  for (const [rel, contenido] of Object.entries(ficheros)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), contenido);
  }
};
const gitEn = (dir, args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-clases-css-'));
  try {
    gitEn(dir, ['init', '-q']);
    gitEn(dir, ['config', 'user.email', 'pruebas@localhost']);
    gitEn(dir, ['config', 'user.name', 'pruebas']);
    gitEn(dir, ['config', 'core.autocrlf', 'false']);
    escribir(dir, { 'LEEME.txt': 'base\n', ...(c.antes ?? {}) });
    gitEn(dir, ['add', '-A']);
    gitEn(dir, ['commit', '-q', '-m', 'base']);
    escribir(dir, c.despues);

    let fallo = false;
    let salida = '';
    try {
      salida = execFileSync(process.execPath, [CANDADO, '--raiz', dir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      fallo = true;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    const bien = fallo === c.debeFallar;
    if (!bien) fallos++;
    console.log(`${bien ? '✅' : '❌'} ${String(c.n).padStart(2)}. ${c.nombre} — ${c.debeFallar ? 'debe FALLAR' : 'debe CALLAR'}, ${fallo ? 'falla' : 'calla'}`);
    if (!bien || process.env.VER) console.log(salida.split('\n').map((l) => `      ${l}`).join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log(fallos ? `\n❌ ${fallos} caso(s) no se comportan como deben` : `\n✅ Los ${CASOS.length} casos se comportan como deben`);
process.exit(fallos ? 1 : 0);
