import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { existsSync } from 'fs';

config({ path: '.env.local', quiet: true });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const yaConJsonLd = new Set([
  'tabla-periodica', 'test-perfil-inversor', 'simulador-genetica', 'conversor-braille',
  'simulador-puertas-logicas', 'generador-anagramas', 'calculadora-notas', 'juego-memoria',
  'estimador-compraventa-inmueble', 'calculadora-cocina', 'calculadora-estadistica',
  'calculadora-geometria', 'contador-silabas', 'creador-paletas', 'generador-loteria',
  'generador-tonos', 'visualizador-algoritmos', 'curso-optimizacion-ia', 'curso-negociacion',
  'visualizador-sueldo-neto', 'visualizador-tipos-cliente-freelance',
  'visualizador-viaje-impuestos', 'visualizador-jubilacion-perspectiva',
  'visualizador-estructura-costes-autonomo', 'visualizador-ciclo-vida-freelance',
  'visualizador-coste-sanidad', 'simulador-colchon-emergencia-freelance',
  'simulador-jubilacion-publica', 'simulador-subvenciones-rehabilitacion',
  'test-estilo-parental', 'test-obligado-declarar-renta', 'test-zarit-cuidador',
  'visualizador-anatomia-nomina', 'planificador-turnos-cuidadores',
  'planificador-vacaciones-autonomo', 'orientador-deduccion-obras-energeticas',
  'planificador-ahorro-jubilacion', 'planificador-gastos-bebe',
  'planificador-trimestres-freelance',
]);

function existeApp(slug) {
  if (slug.startsWith('guia-')) {
    const guideName = slug.substring(5);
    return existsSync(`app/guia/${guideName}/page.tsx`);
  }
  return existsSync(`app/${slug}/page.tsx`);
}

const result = await client.execute({
  sql: `SELECT aplicacion, COUNT(*) as visitas
        FROM uso_aplicaciones
        WHERE modo IS NULL OR modo NOT IN ('bot', 'mcp', 'chatgpt')
        GROUP BY aplicacion
        ORDER BY visitas DESC
        LIMIT 300`,
  args: [],
});

const filtradas = result.rows
  .filter(r => !yaConJsonLd.has(String(r.aplicacion)))
  .filter(r => String(r.aplicacion) !== 'meskeIA')
  .filter(r => existeApp(String(r.aplicacion)))
  .slice(0, 50);

console.log(`Apps válidas encontradas: ${filtradas.length}`);
console.log('\nRank | Aplicación | Visitas');
console.log('-----|-----------|--------');
filtradas.forEach((r, i) => {
  console.log(`${(i + 1).toString().padStart(4)} | ${String(r.aplicacion).padEnd(45)} | ${r.visitas}`);
});

console.log(`\nLista para el patch:`);
console.log(JSON.stringify(filtradas.map(r => String(r.aplicacion))));
