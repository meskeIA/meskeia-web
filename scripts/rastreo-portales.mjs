// Rastreo propio de los portales verticales: ¿hay alguna URL NUESTRA que no responda 200?
//
// Uso: node scripts/rastreo-portales.mjs [dominio...]   (sin argumentos: los cuatro portales)
// Sale con código 1 si alguna URL del sitemap, o enlazada desde él, no da 200.
//
// Para qué: es el paso 2.3 de /audit-seo-meskeia ANTES de pedir al usuario el export de Indexación de
// GSC. `bing-stats.mjs` marca ⚠️ cuando los 4xx de 28 d suben más de un 25 %, y con cifras pequeñas
// salta solo: dos ciclos seguidos (18/10/2026, Stemum con 12 frente a 2; 17/11/2026, Cronicum con 31
// frente a 6 y Delegum con 6 frente a 1) el aviso se encendió, se rastreó a mano y todo respondía 200:
// eran URLs que Bing prueba por su cuenta, no enlaces rotos. El export solo dice algo cuando este
// rastreo, o la Ronda en meskeia.com, encuentran una URL nuestra rota, o cuando hay un 5xx.
//
// meskeia.com NO va aquí: lo barre cada madrugada la Ronda (`_private/rondas/`), con más URLs que
// las que este rastreo descubriría.
//
// Método: sitemap.xml de cada portal + su portada, y todos los enlaces internos de esas páginas, hasta
// que no aparezcan nuevos. Sin seguir redirecciones: un 3xx interno también es un hallazgo.
const PORTALES = ['cronicum.com', 'delegum.com', 'stemum.com', 'coquinum.com'];
const dominios = process.argv.slice(2).length ? process.argv.slice(2) : PORTALES;
const UA = 'Mozilla/5.0 (compatible; meskeia-rastreo-propio/1.0)';
const RECURSO = /\.(css|js|png|jpe?g|webp|svg|ico|webmanifest|xml|json|txt|pdf|woff2?)(\?|$)/i;

async function pedir(url) {
  try {
    const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA } });
    const tipo = r.headers.get('content-type') || '';
    const cuerpo = r.status === 200 && (tipo.includes('html') || tipo.includes('xml')) ? await r.text() : '';
    return { status: r.status, destino: r.headers.get('location'), cuerpo, html: tipo.includes('html') };
  } catch (e) {
    return { status: 'red', destino: e.message, cuerpo: '', html: false };
  }
}

async function enLotes(items, n, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += n) out.push(...(await Promise.all(items.slice(i, i + n).map(fn))));
  return out;
}

let totalMalas = 0;
for (const dom of dominios) {
  const base = `https://${dom}`;
  const sm = await pedir(`${base}/sitemap.xml`);
  const delSitemap = [...sm.cuerpo.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const vistas = new Map(); // url -> resultado
  const origen = new Map(); // url -> dónde se encontró
  let cola = [...new Set([`${base}/`, ...delSitemap])];
  for (const u of cola) origen.set(u, 'sitemap');
  while (cola.length) {
    const res = await enLotes(cola, 8, async (u) => [u, await pedir(u)]);
    const nuevas = [];
    for (const [u, r] of res) {
      vistas.set(u, r);
      if (!r.html || !r.cuerpo) continue;
      for (const m of r.cuerpo.matchAll(/href="([^"#]+)"/g)) {
        let h = m[1].replace(/&amp;/g, '&');
        if (h.startsWith('/') && !h.startsWith('//')) h = base + h;
        if (!h.startsWith(base) || RECURSO.test(h)) continue;
        if (!origen.has(h)) {
          origen.set(h, u);
          nuevas.push(h);
        }
      }
    }
    cola = nuevas;
  }
  // El proxy de Stemum y Coquinum manda con un 3xx a meskeia.com, a la MISMA ruta, la app que no es
  // del portal: un enlace relativo de sus apps (RelatedApps, /contacto/) acaba ahí por diseño. No es un
  // enlace roto (17/11/2026: 9 en los dos portales). Cualquier otro 3xx sí cuenta.
  const saltoAlCatalogo = (u, r) =>
    typeof r.status === 'number' && r.status >= 300 && r.status < 400 &&
    r.destino === `https://meskeia.com${new URL(u).pathname}`;
  const saltos = [...vistas].filter(([u, r]) => saltoAlCatalogo(u, r));
  const malas = [...vistas].filter(([u, r]) => r.status !== 200 && !saltoAlCatalogo(u, r));
  // Sin sitemap el rastreo apenas sale de la portada y daría verde sin haber mirado nada.
  if (sm.status !== 200 || !delSitemap.length) malas.push([`${base}/sitemap.xml`, { ...sm, destino: sm.destino ?? 'sin <loc>' }]);
  totalMalas += malas.length;
  const aviso = sm.status !== 200 || !delSitemap.length ? ` · ⚠️ sitemap.xml respondió ${sm.status} con ${delSitemap.length} URLs` : '';
  const conSaltos = saltos.length ? ` (+${saltos.length} saltos del proxy a meskeia.com, por diseño)` : '';
  console.log(`${malas.length ? '⚠️' : '✅'} ${dom}: ${delSitemap.length} en el sitemap · ${vistas.size} URLs rastreadas · ${malas.length} sin 200${conSaltos}${aviso}`);
  for (const [u, r] of malas.slice(0, 40)) {
    console.log(`   ${r.status} ${u}${r.destino ? ` -> ${r.destino}` : ''}   (desde ${origen.get(u) ?? 'la raíz del portal'})`);
  }
}
console.log(
  totalMalas
    ? '\nHay URLs nuestras sin 200: arreglarlas, y entonces sí pedir el export de GSC para ver si hay más.'
    : '\nTodas responden 200: los 4xx de Bing son URLs que prueba por su cuenta. No hace falta el export.',
);
process.exitCode = totalMalas ? 1 : 0;
