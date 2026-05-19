/**
 * Auditoría: schemas OpenAPI de ChatGPT vs endpoints reales
 *
 * Detecta desincronizaciones entre los nombres de campos `required` en
 * cada `public/chatgpt-schema-*.json` y los campos que el endpoint
 * correspondiente desestructura del body.
 *
 * Origen del bug que motivó este script (2026-05-08):
 *   `chatgpt-schema-salario-irpf.json` declaraba `salarioBrutoAnual`
 *   pero `app/api/chatgpt/sueldo-neto/route.ts` esperaba `brutoAnual`.
 *   ChatGPT recibía siempre "falta brutoAnual" sin posibilidad de éxito.
 *
 * Uso:
 *   node scripts/audit-chatgpt-schemas.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ROUTES_DIR = path.join(ROOT, 'app', 'api', 'chatgpt');

function findSchemaFiles() {
  return fs
    .readdirSync(PUBLIC_DIR)
    .filter(
      (f) =>
        f.startsWith('chatgpt-schema') &&
        f.endsWith('.json')
    )
    .map((f) => path.join(PUBLIC_DIR, f));
}

function extractDestructuredFields(routeSource) {
  // Detecta dos patrones de extracción del body:
  //   A) `const { a, b, c } = body;` (destructuring, posiblemente multi-línea)
  //   B) `body.a`, `body.b` (acceso directo a propiedades)
  // Devuelve el conjunto unión de nombres de campo encontrados.
  const fields = new Set();

  // Patrón A — destructuring
  const destrRe = /const\s*\{([^}]*)\}\s*=\s*body\s*;/gm;
  let dmatch;
  while ((dmatch = destrRe.exec(routeSource)) !== null) {
    dmatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => {
        const [key] = s.split(':');
        fields.add(key.trim());
      });
  }

  // Patrón B — body.<campo>
  const dotRe = /\bbody\.([a-zA-Z_$][\w$]*)/g;
  let match;
  while ((match = dotRe.exec(routeSource)) !== null) {
    fields.add(match[1]);
  }

  return [...fields];
}

function loadRouteForPath(apiPath) {
  // apiPath ejemplo: "/api/chatgpt/sueldo-neto"
  const tail = apiPath.replace(/^\/api\/chatgpt\//, '').replace(/^\//, '');
  const routePath = path.join(ROUTES_DIR, tail, 'route.ts');
  if (!fs.existsSync(routePath)) return null;
  return {
    routePath,
    source: fs.readFileSync(routePath, 'utf8'),
  };
}

function auditSchema(schemaPath) {
  const raw = fs.readFileSync(schemaPath, 'utf8');
  const schema = JSON.parse(raw);
  const schemaName = path.basename(schemaPath);
  const operations = [];

  for (const [apiPath, methods] of Object.entries(schema.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (method.toLowerCase() !== 'post') continue;
      const operationId = op.operationId || '(sin operationId)';
      const requestBody = op.requestBody || {};
      const jsonSchema =
        requestBody.content?.['application/json']?.schema || {};
      const requiredFields = jsonSchema.required || [];
      const allProps = Object.keys(jsonSchema.properties || {});

      const route = loadRouteForPath(apiPath);
      if (!route) {
        operations.push({
          apiPath,
          operationId,
          requiredFields,
          allProps,
          status: 'route_missing',
          missing: requiredFields,
          extra: [],
          destructured: null,
        });
        continue;
      }

      const destructured = extractDestructuredFields(route.source) || [];

      // Required del schema que NO están en el destructuring del endpoint
      const missing = requiredFields.filter(
        (f) => !destructured.includes(f)
      );
      // Campos del schema (todos, no solo required) que faltan
      const allMissing = allProps.filter(
        (f) => !destructured.includes(f)
      );

      let status;
      if (missing.length === 0) {
        status = allMissing.length === 0 ? 'ok' : 'ok_with_warnings';
      } else {
        status = 'mismatch';
      }

      operations.push({
        apiPath,
        operationId,
        requiredFields,
        allProps,
        status,
        missing,
        warnings: allMissing,
        destructured,
      });
    }
  }

  return { schemaName, operations };
}

function colorize(s, color) {
  const codes = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
  };
  return `${codes[color] || ''}${s}${codes.reset}`;
}

function printReport(audits) {
  console.log(colorize('\n=== AUDITORÍA SCHEMAS ChatGPT vs ENDPOINTS ===\n', 'bold'));

  let totalOps = 0;
  let totalMismatches = 0;
  let totalMissingRoutes = 0;
  let totalWarnings = 0;

  for (const audit of audits) {
    console.log(colorize(`📄 ${audit.schemaName}`, 'cyan'));
    if (audit.operations.length === 0) {
      console.log('   (sin operaciones POST)\n');
      continue;
    }

    for (const op of audit.operations) {
      totalOps++;
      const opLabel = `   ${op.operationId.padEnd(30)} ${op.apiPath}`;
      if (op.status === 'route_missing') {
        totalMissingRoutes++;
        console.log(colorize(`${opLabel}  ❌ ROUTE MISSING`, 'red'));
        console.log(`      required en schema: ${op.requiredFields.join(', ')}`);
      } else if (op.status === 'mismatch') {
        totalMismatches++;
        console.log(colorize(`${opLabel}  ❌ MISMATCH`, 'red'));
        console.log(`      Schema requiere: ${op.requiredFields.join(', ')}`);
        console.log(`      Endpoint extrae: ${op.destructured.join(', ') || '(ninguno)'}`);
        console.log(colorize(`      Falta en endpoint: ${op.missing.join(', ')}`, 'red'));
      } else if (op.status === 'ok_with_warnings') {
        totalWarnings++;
        console.log(colorize(`${opLabel}  ⚠️  OK (con avisos)`, 'yellow'));
        console.log(`      Required del schema OK ✓`);
        console.log(colorize(
          `      Propiedades opcionales del schema no extraídas: ${op.warnings.join(', ')}`,
          'yellow'
        ));
      } else {
        console.log(colorize(`${opLabel}  ✅ OK`, 'green'));
      }
    }
    console.log('');
  }

  console.log(colorize('=== RESUMEN ===', 'bold'));
  console.log(`Operaciones auditadas: ${totalOps}`);
  console.log(colorize(`✅ OK: ${totalOps - totalMismatches - totalMissingRoutes - totalWarnings}`, 'green'));
  console.log(colorize(`⚠️  OK con avisos: ${totalWarnings}`, 'yellow'));
  console.log(colorize(`❌ MISMATCHES (críticos): ${totalMismatches}`, totalMismatches > 0 ? 'red' : 'green'));
  console.log(colorize(`❌ Rutas faltantes: ${totalMissingRoutes}`, totalMissingRoutes > 0 ? 'red' : 'green'));
  console.log('');

  if (totalMismatches > 0) {
    console.log(colorize('Acción requerida: corrige cada MISMATCH', 'red'));
    console.log('Opción A: hacer el endpoint tolerante a ambos nombres (sin tocar GPT)');
    console.log('Opción B: editar el schema y re-importar en el GPT publicado\n');
    process.exit(1);
  }
}

const schemaFiles = findSchemaFiles();
const audits = schemaFiles.map(auditSchema);
printReport(audits);
