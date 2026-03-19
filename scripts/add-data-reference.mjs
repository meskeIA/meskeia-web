/**
 * add-data-reference.mjs
 *
 * Añade DataReference a las apps fiscales que importan data/fiscal
 * pero no tienen aún el componente.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT, 'app');

// Mapping: slug → META constant a usar
const APP_META = {
  'comparador-autonomo-vs-sl':        'FISCAL_AUTONOMOS_META',
  'estimador-actualizacion-alquiler': 'ALQUILER_META',
  'estimador-cuota-autonomo':         'FISCAL_AUTONOMOS_META',
  'estimador-impuesto-donaciones':    'FISCAL_DONACIONES_META',
  'estimador-impuesto-sucesiones':    'FISCAL_SUCESIONES_META',
  'estimador-irpf':                   'FISCAL_IRPF_META',
  'estimador-irpf-pensionista':       'FISCAL_IRPF_META',
  'estimador-pension-publica':        'FISCAL_PENSIONES_META',
  'estimador-pension-viudedad':       'FISCAL_PENSIONES_META',
  'estimador-plusvalia-municipal':    'PLUSVALIA_MUNICIPAL_META',
  'estimador-plusvalias-irpf':        'FISCAL_INMUEBLES_META',
  'estimador-sueldo-neto':            'FISCAL_IRPF_META',
  'optimizador-rentas-60':            'FISCAL_IRPF_META',
  'orientador-intereses-demora':      'FISCAL_INTERESES_META',
  'orientador-jubilacion-anticipada': 'FISCAL_PENSIONES_META',
  'orientador-jubilacion-parcial':    'JUBILACION_PARCIAL_META',
  'orientador-plan-pensiones':        'FISCAL_PLAN_PENSIONES_META',
  'requisitos-nomada-digital':        'NOMADA_DIGITAL_META',
};

let fixedCount = 0;

for (const [slug, meta] of Object.entries(APP_META)) {
  const filePath = path.join(APP_DIR, slug, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  No encontrado: ${slug}`);
    continue;
  }

  let c = fs.readFileSync(filePath, 'utf8');

  // ─── 1. Añadir DataReference al import de @/components ───
  if (!c.includes('DataReference')) {
    // Caso: import multilínea  {  ...  } from '@/components'
    if (/import \{[^}]+\} from '@\/components'/s.test(c)) {
      c = c.replace(
        /(import \{[^}]+)(} from '@\/components')/s,
        (match, imports, end) => {
          // Añadir DataReference antes del cierre }
          return imports + '  DataReference,\n' + end;
        }
      );
    }
  }

  // ─── 2. Añadir META al import de @/data/fiscal ───
  if (!c.includes(meta)) {
    // Caso A: import { ...cosas... } from '@/data/fiscal'  (multilínea)
    const multiLineMatch = c.match(/import \{([^}]+)\} from '@\/data\/fiscal'/s);
    if (multiLineMatch) {
      c = c.replace(
        /import \{([^}]+)\} from '@\/data\/fiscal'/s,
        (match, imports) => `import {${imports}  ${meta},\n} from '@/data/fiscal'`
      );
    } else {
      // Caso B: import directo de sub-módulo (ej: @/data/fiscal/pensiones)
      // Buscar última línea con from '@/data/fiscal y añadir después
      const lastFiscalIdx = c.lastIndexOf("from '@/data/fiscal");
      if (lastFiscalIdx !== -1) {
        const lineEnd = c.indexOf('\n', lastFiscalIdx);
        const insertPos = lineEnd + 1;
        c = c.slice(0, insertPos) +
            `import { ${meta} } from '@/data/fiscal';\n` +
            c.slice(insertPos);
      }
    }
  }

  // ─── 3. Añadir <DataReference> JSX después de <DisclaimerCard> ───
  if (!c.includes('<DataReference')) {
    const dataRefJSX = `\n\n      <DataReference\n        normativa={${meta}.fuente}\n        fuente={${meta}.fuente}\n        verificado={${meta}.verificado}\n        urlOficial={${meta}.urlOficial}\n      />`;

    // Patrón 1: DisclaimerCard en una línea  <DisclaimerCard ... />
    if (/<DisclaimerCard[^>]*\/>/.test(c)) {
      c = c.replace(
        /(<DisclaimerCard[^>]*\/>)/,
        (match) => match + dataRefJSX
      );
    }
    // Patrón 2: DisclaimerCard multilínea — termina en collapsible={false}  />
    else if (/collapsible=\{false\}\s*\/>/.test(c)) {
      c = c.replace(
        /(collapsible=\{false\}\s*\/>)/,
        (match) => match + dataRefJSX
      );
    }
    // Patrón 3: DisclaimerCard multilínea — termina en context= />
    else if (/context="[^"]+"\s*\/>/.test(c)) {
      c = c.replace(
        /(context="[^"]+"\s*\/>)/,
        (match) => match + dataRefJSX
      );
    }
    else {
      console.warn(`  ⚠️  No encontrado patrón DisclaimerCard en ${slug}`);
      continue;
    }
  }

  fs.writeFileSync(filePath, c);
  fixedCount++;
  console.log(`✅ ${slug}`);
}

console.log(`\nTotal: ${fixedCount} apps actualizadas`);
