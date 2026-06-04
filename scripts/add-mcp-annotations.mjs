import { readFileSync, writeFileSync } from 'fs';

const filePath = './app/api/mcp/route.ts';
const raw = readFileSync(filePath, 'utf8');

// Normalizar a LF para que los regex funcionen (el archivo usa CRLF en Windows)
const hasCRLF = raw.includes('\r\n');
let content = hasCRLF ? raw.replace(/\r\n/g, '\n') : raw;

function generateTitle(name, descStart) {
  if (!descStart || descStart.length < 5) {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  let title = descStart;
  const colonIdx = title.search(/:/);
  if (colonIdx > 10 && colonIdx <= 65) return title.substring(0, colonIdx).trim();
  const periodIdx = title.search(/\.\s/);
  if (periodIdx > 10 && periodIdx <= 70) return title.substring(0, periodIdx).trim();
  if (title.length > 65) {
    const spaceIdx = title.lastIndexOf(' ', 65);
    return title.substring(0, spaceIdx > 20 ? spaceIdx : 65).trim();
  }
  return title.trim();
}

// Paso 1: extraer nombres + primer fragmento de descripción
const toolInfoRegex = /  servidor\.tool\(\n    '([^']+)',\n    '([^']*)'/g;
const titleMap = {};
let m;
while ((m = toolInfoRegex.exec(content)) !== null) {
  titleMap[m[1]] = generateTitle(m[1], m[2]);
}
console.log(`Títulos extraídos: ${Object.keys(titleMap).length}`);

// Paso 2: posiciones de cada tool
const toolPosRegex = /  servidor\.tool\(\n    '([^']+)',/g;
const toolPositions = [];
while ((m = toolPosRegex.exec(content)) !== null) {
  toolPositions.push({ name: m[1], start: m.index });
}
console.log(`Tools encontradas: ${toolPositions.length}`);

// Paso 3: calcular puntos de inserción (antes del callback async)
const insertions = [];
let warnings = 0;
for (let i = 0; i < toolPositions.length; i++) {
  const tool = toolPositions[i];
  const nextStart = i + 1 < toolPositions.length ? toolPositions[i + 1].start : content.length;
  const toolSection = content.substring(tool.start, nextStart);
  const asyncMatch = toolSection.match(/\n    async \(/);
  if (!asyncMatch) { console.error(`Sin callback async: ${tool.name}`); warnings++; continue; }
  const insertOffset = tool.start + asyncMatch.index + 1;
  const title = (titleMap[tool.name] || tool.name).replace(/'/g, "\'");
  insertions.push({ position: insertOffset, text: `    { title: '${title}', readOnlyHint: true },\n` });
}
console.log(`Inserciones preparadas: ${insertions.length}  |  Advertencias: ${warnings}`);

// Paso 4: aplicar en orden inverso
insertions.sort((a, b) => b.position - a.position);
for (const ins of insertions) {
  content = content.substring(0, ins.position) + ins.text + content.substring(ins.position);
}

// Paso 5: actualizar AVISO_FISCAL con referencia al año normativo
const oldPattern = "automáticamente. ' +\n  'No constituye asesoramiento fiscal";
const newPattern = "automáticamente. Datos normativos: ejercicio fiscal 2025 — verificar vigencia antes de actuar. ' +\n  'No constituye asesoramiento fiscal";
if (content.includes(oldPattern)) {
  content = content.replace(oldPattern, newPattern);
  console.log('AVISO_FISCAL actualizado.');
} else {
  console.warn('AVISO_FISCAL no encontrado con el patrón esperado.');
  // Mostrar contexto para diagnóstico
  const idx = content.indexOf('AVISO_FISCAL');
  if (idx > -1) console.log('Contexto AVISO_FISCAL:', JSON.stringify(content.substring(idx, idx + 200)));
}

// Paso 6: restaurar CRLF si el original lo usaba y escribir
const finalContent = hasCRLF ? content.replace(/\n/g, '\r\n') : content;
writeFileSync(filePath, finalContent, 'utf8');
console.log('\nTransformación completada.');

// Muestra de títulos
console.log('\n--- Muestra de títulos generados ---');
Object.entries(titleMap).slice(0, 15).forEach(([name, title]) => {
  console.log(`  ${name.padEnd(45)} -> "${title}"`);
});
