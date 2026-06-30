import { execSync } from 'node:child_process';
const det = execSync('node scripts/seo-latam/detectar-candidatas-latam.mjs --falta-latam',{encoding:'utf8'});
const done = new Set(['lupa-digital','calculadora-piscinas','comparador-electrico','tabla-periodica','simulador-lentes-opticas','simulador-termodinamica-carnot','simulador-colisiones','simulador-conservacion-energia','simulador-distribucion-normal','simulador-ecosistema-trofico','comparador-transporte-viaje','visualizador-tipos-interes-bce','simulador-integral-area','simulador-oferta-demanda','simulador-tabla-periodica-tendencias','simulador-cifrado-cesar','simulador-curva-phillips','simulador-mitosis-meiosis','simulador-intervalos-confianza','visualizador-arquitectura-computador','calculadora-notas']);
const lines=det.split('\n');
const apps={}; let cur=null;
for(const l of lines){
  const m=l.match(/^\s{4}(\/[a-z0-9-]+\/)\s*$/);
  if(m){cur=m[1].replace(/\//g,'');apps[cur]=apps[cur]||{slug:cur,terms:[],esonly:false};continue;}
  const t=l.match(/usa "([^"]+)"\s+->\s+anadir sinonimo Latam:\s*(.+?)(\s*⚠ es-only.*)?$/);
  if(t&&cur){apps[cur].terms.push({es:t[1],latam:t[2].trim()});if(t[3])apps[cur].esonly=true;}
}
const pend=Object.values(apps).filter(a=>!done.has(a.slug)&&!a.esonly);
const eso=Object.values(apps).filter(a=>a.esonly).map(a=>a.slug);
console.log('PENDIENTES (no es-only, no hechas):',pend.length);
for(const a of pend) console.log(`  ${a.slug.padEnd(42)} ${a.terms.map(t=>t.es+'→'+t.latam.split(',')[0]).join(' | ')}`);
console.log('\nES-ONLY excluidas:',eso.length, eso.join(', '));
