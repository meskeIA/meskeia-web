#!/usr/bin/env node
/**
 * memoria-ritmo.mjs — prueba del pronóstico de ritmo de `check:memoria`.
 *
 * Reinyecta series sintéticas y exige que el candado DISPARE donde debe y CALLE donde debe.
 * Es la regla del proyecto: un candado nuevo no vale hasta que se le devuelve el caso que lo
 * motivó y se comprueba que lo caza — verificar la salida, no que el script termine.
 *
 * El caso de origen (28/08/2026): tras recomponer el índice quedaron 16.001 B y parecía
 * resuelto, pero el ritmo real —1,55 fichas/día— agotaba el margen en ~33 días. El nivel no
 * lo veía venir; el ritmo sí. De ahí el caso 1.
 *
 * Uso:  npm run memoria:probar-ritmo
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const SCRIPT = path.join(REPO, 'scripts', 'check-memoria.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'memoria-ritmo-'));

/**
 * Serie sintética de `dias` lecturas que terminan AYER, con el ritmo pedido.
 *
 * ⚠️ Tienen que terminar ayer y encajar con el recuento REAL de fichas de hoy. `check-memoria`
 * añade siempre una lectura de hoy con los datos vivos antes de calcular la pendiente, así que
 * una serie que acabe en una fecha lejana queda estirada hasta hoy y la pendiente sale diluida.
 * La primera versión de esta prueba lo hacía así y daba 0,59 fichas/día donde pedía 1,55: los
 * dos casos que debían disparar callaban, y parecía un fallo del candado cuando lo era de la
 * prueba. Se descubrió ejecutándola, no leyéndola.
 */
function serie({ dias, fichasDia, fichasHoy, bytesHoy, podaEn = null }) {
  const lecturas = [];
  const hoy = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  for (let i = dias; i >= 1; i--) {
    const f = new Date(hoy.getTime() - i * 86400000);
    const fichas = Math.round(fichasHoy - fichasDia * i);
    let bytes = Math.round(bytesHoy - fichasDia * i * (bytesHoy / fichasHoy));
    if (podaEn !== null && i > podaEn) bytes += 5188;   // antes de la poda el índice era mayor
    lecturas.push({ fecha: f.toISOString().slice(0, 10), bytes, fichas });
  }
  return { lecturas };
}

const CASOS = [
  {
    nombre: 'CASO DE ORIGEN: 1,55 fichas/día con poco margen',
    porQue: 'es la situación del 28/08/2026 que motivó el candado',
    serie: serie({ dias: 22, fichasDia: 1.55, fichasHoy: 171, bytesHoy: 16001 }),
    debeAvisar: true,
  },
  {
    nombre: 'Ritmo bajo: 0,25 fichas/día',
    porQue: 'si la regla de destino funciona, el aviso TIENE que desaparecer',
    serie: serie({ dias: 40, fichasDia: 0.25, fichasHoy: 171, bytesHoy: 16001 }),
    debeAvisar: false,
  },
  {
    nombre: 'Ritmo alto PERO con una poda de 5.188 B por medio',
    porQue: 'una poda hunde los bytes; si el cálculo fuera por bytes, la pendiente saldría plana o negativa y callaría',
    serie: serie({ dias: 22, fichasDia: 1.55, fichasHoy: 171, bytesHoy: 16001, podaEn: 1 }),
    debeAvisar: true,
  },
  {
    nombre: 'Serie corta: 2 lecturas + la de hoy',
    porQue: 'con tan pocos puntos la pendiente es ruido y no debe pronunciarse',
    serie: serie({ dias: 2, fichasDia: 1.55, fichasHoy: 171, bytesHoy: 16001 }),
    debeAvisar: false,
  },
];

console.log('\n🧪 Prueba del pronóstico de ritmo de check:memoria\n');

let fallos = 0;
for (const [i, caso] of CASOS.entries()) {
  const ruta = path.join(TMP, `serie-${i}.json`);
  fs.writeFileSync(ruta, JSON.stringify(caso.serie));
  let salida;
  try {
    salida = execFileSync('node', [SCRIPT], {
      env: { ...process.env, SERIE_MEMORIA: ruta },
      encoding: 'utf8',
    });
  } catch (e) {
    salida = (e.stdout || '') + (e.stderr || '');   // exit 1 por errores ajenos al ritmo
  }
  const aviso = /llega al umbral de aviso en ~\d+ días/.test(salida);
  const ok = aviso === caso.debeAvisar;
  if (!ok) fallos++;
  console.log(`${ok ? '  ✅' : '  ❌'} ${caso.nombre}`);
  console.log(`      espera ${caso.debeAvisar ? 'AVISO' : 'silencio'} · obtiene ${aviso ? 'AVISO' : 'silencio'}`);
  console.log(`      ${caso.porQue}`);
  const linea = salida.split('\n').find(l => l.includes('Ritmo:'));
  if (linea) console.log(`     ${linea.trim()}`);
  console.log('');
}

fs.rmSync(TMP, { recursive: true, force: true });

if (fallos) {
  console.log(`✖ ${fallos} de ${CASOS.length} casos fallan: el pronóstico no distingue lo que dice distinguir.\n`);
  process.exit(1);
}
console.log(`✅ ${CASOS.length}/${CASOS.length}: dispara con el caso de origen, calla con ritmo bajo, y una poda no lo ciega.\n`);
