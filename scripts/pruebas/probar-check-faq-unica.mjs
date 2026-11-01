#!/usr/bin/env node
/**
 * faq-unica:probar-candado — que `check:faq-unica` rompa con el caso de origen y calle donde debe
 *
 * Ejecutar:  npm run faq-unica:probar-candado
 *
 * CASO DE ORIGEN: hallazgo 624 (07/09/2026) de simulador-gastos-compraventa-garaje. La reparación
 * del 578 corrigió la respuesta del ITP en el `faqJsonLd` y dejó la redacción vieja en la FAQ
 * visible de `page.tsx`. Aquí se reinyecta en un repositorio desechable: una app con la FAQ escrita
 * dos veces a la que se le corrige SOLO la copia del JSON-LD. El candado tiene que fallar.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CANDADO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'check-faq-unica.mjs');
const RAIZ = fs.mkdtempSync(path.join(os.tmpdir(), 'faq-unica-'));
const git = (...a) => execFileSync('git', ['-C', RAIZ, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const escribir = (rel, texto) => { fs.mkdirSync(path.dirname(path.join(RAIZ, rel)), { recursive: true }); fs.writeFileSync(path.join(RAIZ, rel), texto); };
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const correr = (...a) => spawnSync(process.execPath, [CANDADO, '--raiz', RAIZ, ...a], { encoding: 'utf8', env: { ...process.env, VERCEL: '' } });

let fallos = 0;
const espera = (rompe, msg, ...a) => {
  const r = correr(...a);
  const roto = r.status !== 0;
  console.log(`  ${roto === rompe ? '✓' : '✗'} ${rompe ? 'rompe' : 'calla'}: ${msg}`);
  if (roto !== rompe) { fallos++; console.log(r.stdout + r.stderr); }
};
const deshacer = () => { git('checkout', '--', '.'); git('clean', '-fdq'); };

const METADATA_DOBLE = `export const metadata = { title: 'Garaje — gastos de compraventa' };
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué ITP paga un garaje de segunda mano?',
      acceptedAnswer: { '@type': 'Answer', text: 'El tipo reducido de la vivienda.' },
    },
  ],
};
`;
const PAGE_DOBLE = `export default function Pagina() {
  return (
    <main>
      <h1>Garaje</h1>
      <section>
        <h2>Preguntas frecuentes</h2>
        <div className="faqItem">
          <h3>¿Qué ITP paga un garaje de segunda mano?</h3>
          <p>💡 El tipo reducido de la vivienda.</p>
        </div>
      </section>
    </main>
  );
}
`;
const METADATA_UNICA = `export const metadata = { title: 'Garaje — gastos de compraventa' };
export const PREGUNTAS_FRECUENTES = [
  { question: '¿Qué ITP paga un garaje de segunda mano?', answer: 'El tipo reducido de la vivienda.' },
];
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
};
`;
const PAGE_UNICA = `import { PREGUNTAS_FRECUENTES } from './metadata';
export default function Pagina() {
  return (
    <main>
      <h1>Garaje</h1>
      <section>
        <h2>Preguntas frecuentes</h2>
        {PREGUNTAS_FRECUENTES.map((f) => (<div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>))}
      </section>
    </main>
  );
}
`;

git('init', '-q');
git('config', 'user.email', 'prueba@ejemplo.invalid');
git('config', 'user.name', 'prueba');
escribir('app/garaje/metadata.ts', METADATA_DOBLE);
escribir('app/garaje/page.tsx', PAGE_DOBLE);
escribir('app/garaje-unica/metadata.ts', METADATA_UNICA);
escribir('app/garaje-unica/page.tsx', PAGE_UNICA);
// Dos FAQ con preguntas DISTINTAS: lo normal en el catálogo (01/11/2026), y no es un defecto
escribir('app/distintas/metadata.ts', METADATA_DOBLE.replace('¿Qué ITP paga un garaje de segunda mano?', '¿Cuánto cuesta la notaría de un garaje?'));
escribir('app/distintas/page.tsx', PAGE_DOBLE);
git('add', '.');
git('commit', '-qm', 'base');

console.log('\ncheck:faq-unica — pruebas');
const CORREGIDA = 'El tipo general de su comunidad: el reducido exige vivienda habitual.';

escribir('app/garaje/metadata.ts', leer('app/garaje/metadata.ts').replace("'El tipo reducido de la vivienda.'", `'${CORREGIDA}'`));
espera(true, 'CASO DE ORIGEN (hallazgo 624): se corrige solo la respuesta del faqJsonLd');
deshacer();

escribir('app/garaje/page.tsx', leer('app/garaje/page.tsx').replace('💡 El tipo reducido de la vivienda.', `💡 ${CORREGIDA}`));
espera(true, 'se corrige solo la FAQ visible');
deshacer();

escribir('app/garaje/page.tsx', leer('app/garaje/page.tsx').replace('<p>💡 El tipo', '<p><span aria-hidden="true">💡</span> El tipo'));
espera(false, 'un arreglo de accesibilidad en la FAQ visible no cambia el texto que se lee');
deshacer();

escribir('app/distintas/metadata.ts', leer('app/distintas/metadata.ts').replace("'El tipo reducido de la vivienda.'", `'${CORREGIDA}'`));
espera(false, 'dos FAQ con preguntas distintas: corregir una no obliga a fusionarlas');
deshacer();

escribir('app/garaje/metadata.ts', leer('app/garaje/metadata.ts').replace('Garaje — gastos', 'Garaje: gastos'));
espera(false, 'tocar el title no toca la FAQ');
deshacer();

escribir('app/garaje-unica/metadata.ts', leer('app/garaje-unica/metadata.ts').replace("'El tipo reducido de la vivienda.'", `'${CORREGIDA}'`));
espera(false, 'en una app con PREGUNTAS_FRECUENTES, corregir la respuesta');
deshacer();

escribir('app/garaje/metadata.ts', `// faq-ok: comparte cada respuesta con constantes propias\n${leer('app/garaje/metadata.ts').replace("'El tipo reducido de la vivienda.'", `'${CORREGIDA}'`)}`);
espera(false, 'escape «faq-ok:» con razón');
deshacer();

escribir('app/garaje/metadata.ts', `// faq-ok:\n${leer('app/garaje/metadata.ts').replace("'El tipo reducido de la vivienda.'", `'${CORREGIDA}'`)}`);
espera(true, 'escape «faq-ok:» sin razón');
deshacer();

escribir('app/nueva/metadata.ts', METADATA_DOBLE);
escribir('app/nueva/page.tsx', PAGE_DOBLE);
espera(true, 'una app nueva que nace con la FAQ escrita dos veces');
deshacer();

escribir('app/nueva/metadata.ts', METADATA_UNICA);
escribir('app/nueva/page.tsx', PAGE_UNICA);
espera(false, 'una app nueva que nace con PREGUNTAS_FRECUENTES');
deshacer();

escribir('app/garaje/metadata.ts', leer('app/garaje/metadata.ts').replace("'El tipo reducido de la vivienda.'", `'${CORREGIDA}'`));
git('commit', '-qam', 'reparación a medias, ya commiteada');
espera(false, 'sin --desde, lo ya commiteado no se juzga (como los demás candados de líneas añadidas)');
espera(true, 'con --desde HEAD~1, la tarea de /reparar sí lo ve en su rama', '--desde', 'HEAD~1');

const todo = correr('--todo');
// Quedan garaje (pregunta repetida), garaje-unica y distintas: la nueva se retiró con deshacer()
const okTodo = todo.status === 0 && /1 de 3 apps/.test(todo.stdout);
console.log(`  ${okTodo ? '✓' : '✗'} --todo cuenta el pasivo sin romper (${todo.stdout.trim().split('\n')[0]})`);
if (!okTodo) fallos++;

fs.rmSync(RAIZ, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} pruebas FALLAN` : '\n✓ el candado rompe con el caso de origen y calla donde debe');
process.exit(fallos ? 1 : 0);
