/**
 * Genera las apps HTML de la extensión MCP Apps que sirve el servidor MCP.
 *
 * Toma cada fuente de scripts/mcp-ui/*.html y le incrusta, en el marcador
 * __SDK_MCP_APPS__, el bundle de navegador de @modelcontextprotocol/ext-apps
 * (dist/src/app-with-deps.js, autónomo y sin imports).
 *
 * Por qué incrustarlo y no leerlo en runtime: el host renderiza estas páginas
 * en un iframe aislado sin acceso a la red, y la función serverless de Vercel
 * no puede contar con que node_modules viaje en el bundle. El HTML tiene que
 * salir entero desde el propio código.
 *
 * Salida: lib/mcp/ui/generado/*.ts (se commitea, no se edita a mano).
 *
 * Uso: node scripts/build-mcp-ui.mjs
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_FUENTES = path.join(raiz, 'scripts', 'mcp-ui');
const DIR_SALIDA = path.join(raiz, 'lib', 'mcp', 'ui', 'generado');
const BUNDLE_SDK = path.join(
  raiz, 'node_modules', '@modelcontextprotocol', 'ext-apps', 'dist', 'src', 'app-with-deps.js'
);
const MARCADOR = '/*__SDK_MCP_APPS__*/';

/** kebab-case → CONSTANTE_EN_MAYUSCULAS */
const nombreConstante = (slug) => 'HTML_' + slug.replace(/-/g, '_').toUpperCase();

/**
 * Deja el bundle listo para vivir dentro de un <script type="module"> inline:
 * quita su sentencia final `export{...}` (un script inline no exporta a nadie)
 * y expone como `App` el identificador minificado que esa sentencia mapeaba.
 */
function prepararBundle(bundle) {
  const exportFinal = bundle.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
  if (!exportFinal) {
    throw new Error('El bundle del SDK no termina en una sentencia export{...}: revisa si ha cambiado de formato.');
  }

  const alias = exportFinal[1]
    .split(',')
    .map((par) => par.trim().match(/^(\S+)\s+as\s+App$/))
    .find(Boolean);

  if (!alias) {
    throw new Error('No se encuentra la exportación `App` en el bundle del SDK.');
  }

  const cuerpo = bundle.slice(0, exportFinal.index);

  // Un </script> literal dentro del código cerraría la etiqueta antes de tiempo.
  if (/<\/script/i.test(cuerpo)) {
    throw new Error('El bundle contiene "</script>": habría que escaparlo antes de incrustarlo.');
  }

  return `${cuerpo}\nconst App = ${alias[1]};`;
}

const bundle = prepararBundle(await readFile(BUNDLE_SDK, 'utf-8'));
const version = JSON.parse(
  await readFile(path.join(raiz, 'node_modules', '@modelcontextprotocol', 'ext-apps', 'package.json'), 'utf-8')
).version;

await mkdir(DIR_SALIDA, { recursive: true });

const fuentes = (await readdir(DIR_FUENTES)).filter((f) => f.endsWith('.html'));
if (fuentes.length === 0) throw new Error(`No hay fuentes .html en ${DIR_FUENTES}`);

for (const fuente of fuentes) {
  const slug = path.basename(fuente, '.html');
  const html = await readFile(path.join(DIR_FUENTES, fuente), 'utf-8');

  if (!html.includes(MARCADOR)) {
    throw new Error(`${fuente} no contiene el marcador ${MARCADOR}`);
  }

  const completo = html.replace(MARCADOR, () => bundle);

  const ts = [
    '// GENERADO por scripts/build-mcp-ui.mjs — NO EDITAR A MANO.',
    `// Fuente: scripts/mcp-ui/${fuente}`,
    `// SDK incrustado: @modelcontextprotocol/ext-apps ${version}`,
    '',
    `export const ${nombreConstante(slug)} = ${JSON.stringify(completo)};`,
    '',
  ].join('\n');

  const destino = path.join(DIR_SALIDA, `${slug}.ts`);
  await writeFile(destino, ts, 'utf-8');

  const kb = (Buffer.byteLength(completo, 'utf-8') / 1024).toFixed(0);
  console.log(`✓ ${slug}.ts (${kb} KB, SDK ${version})`);
}
