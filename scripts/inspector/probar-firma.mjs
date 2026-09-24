/**
 * Prueba de la firma de rotura de `firma.mjs`, sobre una base SINTÉTICA en memoria.
 *
 * Ejecutar con:  npm run inspector:probar-firma
 *
 * ── Por qué existe ────────────────────────────────────────────────────────────
 * Un detector que nadie ha visto disparar no vale nada, y uno que dispara siempre tampoco:
 * aquí se le exige las dos cosas. Tiene que MARCAR la app rota y la que se rompe, y CALLAR
 * en las cinco formas de «muchas visitas cortas» que no son una rotura: la consulta rápida
 * que se resuelve a la primera, el aula con veinte ordenadores idénticos, la app con pocas
 * visitas, la portada (no está en el catálogo) y el bot.
 *
 * La parte de CAMBIO solo se puede probar así: en los datos reales no hay ninguna rotura
 * con fecha dentro de la serie (ver la cabecera de `firma.mjs`).
 *
 * Si hay un dump en `_backups/turso`, además se reinyecta el caso de ORIGEN con datos
 * reales: `lupa-digital` debe salir marcada en los 30 días hasta el 20/07/2026 —rota por
 * `camera=()`— y sin marcar en los 30 días hasta el 23/09/2026, ya reparada.
 */
import { DatabaseSync } from 'node:sqlite';
import { calcularFirma, cargarDump, dumpMasReciente } from './firma.mjs';

const HASTA = '2026-03-31';
const db = new DatabaseSync(':memory:');
db.prepare(`CREATE TABLE uso_aplicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT, aplicacion TEXT, navegador TEXT, resolucion TEXT,
  duracion_segundos INTEGER, ip_address TEXT, modo TEXT, sesion_id TEXT, es_propio INTEGER DEFAULT 0,
  created_at TEXT)`).run();
db.prepare(`CREATE TABLE analytics_config (clave TEXT, valor TEXT)`).run();
db.prepare(`INSERT INTO analytics_config VALUES ('ip_excluida', '10.0.0.1')`).run();

const insertar = db.prepare(`INSERT INTO uso_aplicaciones
  (aplicacion, navegador, resolucion, duracion_segundos, ip_address, modo, sesion_id, created_at)
  VALUES (?, 'Chrome', '1920x1080', ?, ?, ?, ?, ?)`);
let sesiones = 0;

/** Fecha 'YYYY-MM-DD HH:MM:SS' a `diasAtras` de HASTA, con los minutos que se pidan. */
function momento(diasAtras, minutos) {
  const d = new Date(`${HASTA}T10:00:00Z`);
  d.setUTCDate(d.getUTCDate() - diasAtras);
  d.setUTCMinutes(d.getUTCMinutes() + minutos);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Siembra `n` visitas de `slug` repartidas entre los días [desde, hasta] (en días atrás), con
 * la proporción pedida de visitas cortas y de reintentos: un reintento es una SEGUNDA carga
 * en la misma sesión a los 3 minutos de una visita corta.
 * `aula`: todas desde la misma IP y el mismo navegador, cada una en su sesión.
 */
function sembrar(slug, { n, cortas, reintentos, desde = 29, hasta = 0, aula = false, modo = 'web' }) {
  const nReint = Math.round(n * reintentos);
  let nCortas = Math.round(n * cortas) - 2 * nReint;
  if (nCortas < 0) throw new Error(`${slug}: cada reintento necesita dos visitas cortas`);
  const dias = desde - hasta + 1;
  const ip = i => (aula ? '200.1.1.1' : `100.0.${i % 250}.${sesiones % 250}`);
  let i = 0;
  const dia = () => desde - (i % dias);
  for (let k = 0; k < nReint; k++, i++) {
    const s = `s${++sesiones}`;
    insertar.run(slug, 8, ip(i), modo, s, momento(dia(), k % 300));
    insertar.run(slug, 10, ip(i), modo, s, momento(dia(), (k % 300) + 3));
    i++;
  }
  for (; i < n; i++) {
    const corta = nCortas-- > 0;
    // En el aula, cada alumno entra a los pocos minutos del anterior: si la persona se
    // identificase por IP + navegador, todo esto contaría como reintentos
    insertar.run(slug, corta ? 12 : 180, ip(i), modo, `s${++sesiones}`, momento(dia(), aula ? i % 60 : i % 600));
  }
}

// El catálogo «normal»: 60 % de cortas y 4 % de reintentos, como el real
for (let k = 1; k <= 10; k++) sembrar(`normal-${k}`, { n: 200, cortas: 0.6, reintentos: 0.04 });

sembrar('rota', { n: 150, cortas: 0.85, reintentos: 0.3 });
sembrar('consulta-rapida', { n: 150, cortas: 0.85, reintentos: 0.02 });
sembrar('aula', { n: 150, cortas: 0.85, reintentos: 0, aula: true });
sembrar('pocas', { n: 40, cortas: 0.9, reintentos: 0.4 });
sembrar('portada', { n: 300, cortas: 0.95, reintentos: 0.4 });
sembrar('bot', { n: 300, cortas: 0.95, reintentos: 0.4, modo: 'bot' });
// Se rompe: seis semanas sana y las dos últimas con muchas más visitas cortas
sembrar('se-rompe', { n: 150, cortas: 0.55, reintentos: 0.04, desde: 55, hasta: 14 });
sembrar('se-rompe', { n: 100, cortas: 0.82, reintentos: 0.04, desde: 13, hasta: 0 });
// Siempre igual, aunque con más cortas que el catálogo: no hay cambio que avisar
sembrar('estable', { n: 250, cortas: 0.66, reintentos: 0.04, desde: 55, hasta: 0 });

// Ida y vuelta: visita corta, salto a otra herramienta y «atrás» a los dos minutos. Es la
// forma que tenían las cinco apps que marcó la segunda versión del detector, y es navegación
// sana. 45 de sus 150 visitas son vueltas; si contasen como recarga, sería la app «rota».
for (let k = 0; k < 45; k++) {
  const s = `s${++sesiones}`;
  insertar.run('ida-y-vuelta', 8, `100.1.${k}.1`, 'web', s, momento(k % 30, 0));
  insertar.run('normal-1', 40, `100.1.${k}.1`, 'web', s, momento(k % 30, 1));
  insertar.run('ida-y-vuelta', 15, `100.1.${k}.1`, 'web', s, momento(k % 30, 3));
}
sembrar('ida-y-vuelta', { n: 60, cortas: 0.7, reintentos: 0 });

const catalogo = [...Array.from({ length: 10 }, (_, k) => `normal-${k + 1}`),
  'rota', 'consulta-rapida', 'aula', 'pocas', 'bot', 'se-rompe', 'estable', 'ida-y-vuelta'];
const r = calcularFirma(db, { slugs: catalogo, hasta: HASTA });

let fallos = 0;
function exigir(slug, esperado, porque) {
  const obtenido = r.apps.get(slug)?.firma ?? null;
  const ok = obtenido === esperado;
  if (!ok) fallos++;
  console.log(`  ${ok ? '✓' : '✗'} ${slug.padEnd(16)} ${String(obtenido).padEnd(13)} ${ok ? '' : `(se esperaba ${esperado}) `}— ${porque}`);
}

const pct = x => x.toLocaleString('es-ES', { maximumFractionDigits: 1 });
console.log(`\nBase sintética · catálogo ${pct(r.catalogo.cortas)} % cortas · ${pct(r.catalogo.reintentos)} % reintentos\n`);
exigir('rota', 'nivel', 'muchas cortas y la gente recarga: la firma de la lupa');
exigir('se-rompe', 'cambio', 'sus cortas saltan del 55 % al 82 % en las dos últimas semanas');
exigir('consulta-rapida', null, 'muchas cortas pero se resuelve a la primera: nadie recarga');
exigir('aula', null, 'misma IP y navegador, pero cada alumno en su sesión');
exigir('pocas', null, 'por debajo de 60 visitas no se juzga');
exigir('estable', null, 'más cortas que el catálogo, pero sin reintentos ni cambio');
exigir('ida-y-vuelta', null, 'vuelve tras pasar por otra app: es navegación, no recarga');
exigir('normal-1', null, 'una app corriente');
if (r.apps.has('portada')) { fallos++; console.log('  ✗ portada: está fuera del catálogo y no debe evaluarse'); }
else console.log('  ✓ portada          fuera        — no está en el catálogo');
if (r.apps.has('bot')) { fallos++; console.log('  ✗ bot: el filtro humano debía excluir sus visitas'); }
else console.log('  ✓ bot              fuera        — modo=bot no cuenta');

// ── El caso de origen, con datos reales ──
// Con el catálogo de la base del Inspector, como en `inspector:sync`: sin él, la referencia
// incluiría las portadas, que son casi todo visitas cortas, y el umbral no sería el real.
const ruta = dumpMasReciente();
const { abrir } = await import('./db.mjs');
const slugsReales = abrir().prepare('SELECT slug FROM apps').all().map(f => f.slug);
if (!ruta || !slugsReales.length) {
  console.log('\n  (sin dump en _backups/turso o sin base del Inspector: se omite el caso real de lupa-digital)');
} else {
  const real = cargarDump(ruta);
  for (const [hasta, esperado, porque] of [
    ['2026-07-20', 'nivel', 'rota por camera=() hasta el 21/07/2026'],
    ['2026-09-23', null, 'reparada el 21/07/2026'],
  ]) {
    const f = calcularFirma(real, { slugs: slugsReales, hasta }).apps.get('lupa-digital');
    const obtenido = f?.firma ?? null;
    const ok = obtenido === esperado;
    if (!ok) fallos++;
    console.log(`  ${ok ? '✓' : '✗'} lupa-digital hasta ${hasta}: ${String(obtenido).padEnd(6)} ${ok ? '' : `(se esperaba ${esperado}) `}— ${porque}`);
  }
}

console.log(fallos ? `\n✗ ${fallos} caso(s) fallan\n` : '\n✓ La firma marca lo que debe y calla donde debe\n');
process.exit(fallos ? 1 : 0);
