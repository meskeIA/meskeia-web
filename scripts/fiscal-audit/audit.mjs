/**
 * Auditor de frescura normativa — data/fiscal/ (Capa 2: Versionado normativo)
 *
 * Qué hace:
 *   Para cada módulo de data/fiscal/ dentro del "scope" indicado, lee su código
 *   fuente y pide a Claude (Messages API + herramientas server-side web_search y
 *   web_fetch) que CONTRASTE cada valor contra las fuentes oficiales (BOE, AEAT,
 *   Seguridad Social, BCE...) para el año indicado. Genera un informe Markdown.
 *
 * Qué NO hace:
 *   NO edita data/fiscal/. Los datos fiscales son de nivel CRÍTICO: el informe es
 *   para que TÚ (o Claude Code) revise y aplique los cambios a mano. Auto-editar
 *   datos normativos con un LLM está prohibido por política del proyecto.
 *
 * Dos salidas posibles por valor:
 *   1. Cambió   → propone el nuevo valor con cita oficial (⚠️)
 *   2. Vigente  → confirma que sigue en vigor y recomienda RE-SELLAR `verificado`
 *                 a la fecha de hoy (✅). Esto es lo que mantiene la credibilidad
 *                 ("verificado 2026" en vez de "2025") aunque el valor no cambie.
 *
 * Periodicidad (disparo MANUAL desde los apuntes del usuario):
 *   - 15 enero   → npm run audit:fiscal -- --scope=enero
 *   - 1 julio    → npm run audit:fiscal -- --scope=julio
 *   - 15 octubre → npm run audit:fiscal -- --scope=octubre
 *
 * Uso:
 *   npm run audit:fiscal -- --scope=enero
 *   npm run audit:fiscal -- --modules=intereses,irpf
 *   npm run audit:fiscal -- --scope=julio --year=2026
 *   npm run audit:fiscal -- --list
 *
 * Requiere ANTHROPIC_API_KEY en .env.local (o en el entorno).
 */

import { config } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Cargar variables de entorno: primero .env.local (convención Next.js), luego .env
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
config({ path: join(ROOT, '.env.local') });
config({ path: join(ROOT, '.env') });

const FISCAL_DIR = join(ROOT, 'data', 'fiscal');
const REPORTS_DIR = join(__dirname, 'reports');

// ─── Mapa scope → módulos ─────────────────────────────────────────────────────
// Alineado con el calendario legislativo español real. Un módulo puede estar en
// varios scopes (p. ej. patrimonio: parte estatal en enero, parte autonómica en
// octubre). Entre los tres scopes se cubren los 14 módulos al menos una vez/año.
const SCOPES = {
  // 15 enero — tras LPGE/RDL: impuestos estatales, Seguridad Social, IPREM/SMI,
  // interés legal del dinero y demora comercial del 1er semestre.
  enero: [
    'irpf', 'autonomos', 'sociedades', 'pensiones', 'dependencia',
    'maternidad', 'smi', 'intereses', 'alquiler', 'nomada-digital', 'patrimonio',
  ],
  // 1 julio — demora comercial del 2º semestre (Ley 3/2004 = tipo BCE + 8 pp).
  julio: ['intereses'],
  // 15 octubre — tras el verano legislativo: tributos cedidos a las CCAA.
  octubre: ['sucesiones', 'donaciones', 'inmuebles', 'patrimonio'],
};

// ─── Parseo de argumentos ─────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { scope: null, modules: null, year: String(new Date().getFullYear()), list: false };
  for (const a of argv.slice(2)) {
    if (a === '--list') args.list = true;
    else if (a.startsWith('--scope=')) args.scope = a.slice('--scope='.length).trim();
    else if (a.startsWith('--modules=')) args.modules = a.slice('--modules='.length).split(',').map(s => s.trim()).filter(Boolean);
    else if (a.startsWith('--year=')) args.year = a.slice('--year='.length).trim();
  }
  return args;
}

function resolverModulos(args) {
  if (args.modules) return args.modules;
  if (args.scope) {
    const mods = SCOPES[args.scope];
    if (!mods) {
      console.error(`❌ Scope desconocido: "${args.scope}". Válidos: ${Object.keys(SCOPES).join(', ')}`);
      process.exit(1);
    }
    return mods;
  }
  return null;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un auditor de datos normativos fiscales y laborales de España para meskeIA. Tu tarea es verificar si los valores codificados en un módulo de datos siguen vigentes contrastándolos con las FUENTES OFICIALES (BOE, AEAT, Seguridad Social, BCE, boletines autonómicos).

REGLAS:
- Usa web_fetch sobre las URLs oficiales declaradas en el módulo y web_search para localizar las cifras vigentes del año indicado.
- NO propongas editar el código tú mismo: solo informas. La edición la hace una persona.
- Para cada valor relevante decide: ✅ VIGENTE (sigue en vigor) o ⚠️ CAMBIO (hay un valor oficial distinto) o ❓ NO CONCLUYENTE (no has podido confirmarlo con fuente fiable).
- Si un valor está VIGENTE pero la fecha 'verificado' del módulo es anterior al año en curso, recomienda RE-SELLAR 'verificado' a hoy (es clave para la credibilidad de cara al usuario).
- Cita SIEMPRE la fuente concreta (URL + fecha de la norma) de cada afirmación. Sin cita verificable, marca ❓.
- Sé conciso y factual. No inventes cifras: ante la duda, ❓.
- Responde en español, solo con el informe en Markdown pedido (sin preámbulos ni despedidas).`;

function buildUserPrompt(modulo, year, source) {
  return `Módulo a auditar: **${modulo}.ts** · Año a verificar: **${year}**

A continuación tienes el contenido actual de \`data/fiscal/${modulo}.ts\`. Contrasta sus valores normativos (tipos, tramos, topes, coeficientes, importes, fechas) con las fuentes oficiales vigentes en ${year}.

\`\`\`typescript
${source}
\`\`\`

Devuelve EXACTAMENTE esta estructura Markdown:

## ${modulo}
**Veredicto:** <✅ vigente sin cambios | ⚠️ cambios detectados | ❓ no concluyente>
**\`verificado\` actual:** <fecha que figura en el módulo> · **Recomendación:** <re-sellar a ${year} | actualizar valores | revisar manualmente>

| Parámetro | Valor en código | Valor oficial ${year} | Estado | Fuente (URL + norma) |
|---|---|---|---|---|
| ... | ... | ... | ✅/⚠️/❓ | ... |

**Notas:** <1-3 frases con lo más relevante: qué cambió, qué prórroga aplica, o por qué no es concluyente>`;
}

// ─── Llamada a la API con herramientas web server-side ────────────────────────
async function auditarModulo(client, modulo, year, source) {
  const tools = [
    { type: 'web_search_20260209', name: 'web_search' },
    { type: 'web_fetch_20260209', name: 'web_fetch' },
  ];

  let messages = [{ role: 'user', content: buildUserPrompt(modulo, year, source) }];
  let texto = '';
  let tokensSalida = 0;

  // Las herramientas server-side corren en bucle en Anthropic; si alcanza su
  // límite interno devuelve stop_reason "pause_turn" y hay que reenviar para
  // continuar (sin añadir un mensaje de usuario nuevo).
  for (let intento = 0; intento < 6; intento++) {
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      // Adaptive thinking: el razonamiento y la narración entre búsquedas van a
      // bloques 'thinking' (que NO recogemos), no al texto visible del informe.
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    for (const block of resp.content) {
      if (block.type === 'text') texto += block.text;
    }
    tokensSalida += resp.usage?.output_tokens ?? 0;

    if (resp.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: resp.content });
      continue;
    }
    break;
  }

  // Red de seguridad: recortar cualquier preámbulo previo al encabezado del
  // módulo, por si se cuela narración del modelo antes del informe.
  texto = texto.trim();
  const idx = texto.indexOf(`## ${modulo}`);
  if (idx > 0) texto = texto.slice(idx);

  return { texto, tokensSalida };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);

  if (args.list) {
    console.log('Scopes disponibles (disparo manual desde tus apuntes):\n');
    for (const [scope, mods] of Object.entries(SCOPES)) {
      console.log(`  --scope=${scope}\n    ${mods.join(', ')}\n`);
    }
    return;
  }

  const modulos = resolverModulos(args);
  if (!modulos) {
    console.error('❌ Indica --scope=enero|julio|octubre, --modules=a,b o --list');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Falta ANTHROPIC_API_KEY. Añádela a .env.local:\n   ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  const client = new Anthropic();
  const fechaHoy = new Date().toISOString().slice(0, 10);
  const etiqueta = args.scope ?? 'modulos';

  console.log(`\n🔍 Auditoría de frescura normativa — data/fiscal/`);
  console.log(`   Scope: ${etiqueta} · Año: ${args.year} · Módulos: ${modulos.length}\n`);

  const secciones = [];
  for (const modulo of modulos) {
    const ruta = join(FISCAL_DIR, `${modulo}.ts`);
    if (!existsSync(ruta)) {
      console.warn(`   ⚠️  ${modulo}: no existe data/fiscal/${modulo}.ts — omitido`);
      secciones.push(`## ${modulo}\n**Veredicto:** ❓ no concluyente · fichero no encontrado.\n`);
      continue;
    }
    const source = readFileSync(ruta, 'utf8');
    process.stdout.write(`   • Auditando ${modulo}... `);
    try {
      const { texto, tokensSalida } = await auditarModulo(client, modulo, args.year, source);
      secciones.push(texto || `## ${modulo}\n**Veredicto:** ❓ sin respuesta del modelo.\n`);
      console.log(`✓ (${tokensSalida} tokens)`);
    } catch (err) {
      const msg = err?.message ?? String(err);
      console.log(`✗ ${msg}`);
      secciones.push(`## ${modulo}\n**Veredicto:** ❓ error en la auditoría: ${msg}\n`);
    }
  }

  // Ensamblar informe
  const cabecera = [
    `# Informe de auditoría normativa — data/fiscal/`,
    ``,
    `- **Fecha de la auditoría:** ${fechaHoy}`,
    `- **Scope:** ${etiqueta} · **Año verificado:** ${args.year}`,
    `- **Módulos auditados:** ${modulos.join(', ')}`,
    ``,
    `> ⚠️ Informe ORIENTATIVO generado con web_search/web_fetch. Verifica cada ⚠️ contra el BOE/AEAT/SS antes de editar \`data/fiscal/\`. Para los ✅, recuerda re-sellar la fecha \`verificado\` del módulo.`,
    ``,
    `---`,
    ``,
  ].join('\n');

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });
  const destino = join(REPORTS_DIR, `fiscal-audit-${etiqueta}-${fechaHoy}.md`);
  writeFileSync(destino, cabecera + secciones.join('\n\n---\n\n') + '\n', 'utf8');

  console.log(`\n📄 Informe guardado en:\n   ${destino}\n`);
  console.log(`   Revisa los ⚠️ contra la fuente oficial y re-sella 'verificado' en los ✅.\n`);
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err?.message ?? err);
  process.exit(1);
});
