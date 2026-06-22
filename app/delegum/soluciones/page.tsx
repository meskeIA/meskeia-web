import { Metadata } from 'next';
import Link from 'next/link';
import { applicationsDatabase } from '@/data/applications';
import { PUERTAS, type Puerta } from '@/data/delegum/soluciones';
import BuscadorSoluciones, { type ItemBuscador } from './BuscadorSoluciones';
import styles from './Soluciones.module.css';

export const metadata: Metadata = {
  title: 'Soluciones de fiscalidad, derecho laboral y finanzas | Delegum',
  description:
    'Entra por tu situación —trabajo, vivienda, ahorro e inversión, jubilación y herencias, familia o tu negocio— y te llevamos a las herramientas que resuelven tu caso: calculadoras, simuladores y orientadores para España.',
  alternates: { canonical: 'https://delegum.com/soluciones/' },
};

// Las herramientas viven físicamente en meskeia.com; Delegum enlaza en absoluto.
// El parámetro ?from=delegum permite atribuir en el Analytics de meskeIA el
// tráfico que llega desde Delegum (lo recoge AnalyticsTracker en datos_adicionales).
const MESKEIA = 'https://meskeia.com';
const FROM = '?from=delegum';

// Índice de metadatos por URL canónica para resolver nombre/icono/descripción
// sin duplicarlos (fuente única: data/applications.ts).
const META_BY_URL = new Map(applicationsDatabase.map((a) => [a.url, a]));

interface AppResuelta {
  icon: string;
  name: string;
  desc: string;
  href: string;
}

function resolverApps(puerta: Puerta): AppResuelta[] {
  return puerta.apps.flatMap((a) => {
    const meta = META_BY_URL.get(a.url);
    if (!meta) return [];
    return [
      {
        icon: meta.icon,
        name: meta.name,
        desc: a.desc ?? meta.description,
        href: `${MESKEIA}${a.url}${FROM}`,
      },
    ];
  });
}

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Índice de búsqueda acotado al universo Delegum (las apps de las 6 puertas,
// deduplicadas). Se construye en el servidor y se pasa al buscador cliente.
function construirIndice(): ItemBuscador[] {
  const vistos = new Set<string>();
  const out: ItemBuscador[] = [];
  for (const puerta of PUERTAS) {
    for (const a of puerta.apps) {
      if (vistos.has(a.url)) continue;
      const meta = META_BY_URL.get(a.url);
      if (!meta) continue;
      vistos.add(a.url);
      out.push({
        name: meta.name,
        icon: meta.icon,
        href: `${MESKEIA}${a.url}${FROM}`,
        hay: normalize(`${meta.name} ${meta.description} ${meta.keywords.join(' ')}`),
      });
    }
  }
  return out;
}

export default function SolucionesPage() {
  const particular = PUERTAS.filter((p) => p.grupo === 'particular');
  const profesional = PUERTAS.filter((p) => p.grupo === 'profesional');
  const indice = construirIndice();

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Soluciones</p>
        <h1 className={styles.title}>¿Qué necesitas resolver?</h1>
        <p className={styles.subtitle}>
          ¿Sabes qué necesitas? Búscalo aquí. Si no, entra por tu situación y te llevamos a la
          herramienta que resuelve tu caso.
        </p>
      </header>

      <BuscadorSoluciones items={indice} />

      {/* Índice de puertas (el "triaje": eliges tu situación) */}
      <nav className={styles.indice} aria-label="Situaciones">
        <div className={styles.indiceGrupo}>
          <p className={styles.indiceTitulo}>Para ti</p>
          <div className={styles.indiceGrid}>
            {particular.map((p) => (
              <a key={p.id} href={`#${p.id}`} className={styles.chip}>
                <span className={styles.chipIcon} aria-hidden="true">{p.icon}</span>
                <span className={styles.chipText}>
                  <span className={styles.chipTitulo}>{p.titulo}</span>
                  <span className={styles.chipVoz}>{p.voz}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className={styles.indiceGrupo}>
          <p className={styles.indiceTitulo}>Para tu actividad o empresa</p>
          <div className={styles.indiceGrid}>
            {profesional.map((p) => (
              <a key={p.id} href={`#${p.id}`} className={styles.chip}>
                <span className={styles.chipIcon} aria-hidden="true">{p.icon}</span>
                <span className={styles.chipText}>
                  <span className={styles.chipTitulo}>{p.titulo}</span>
                  <span className={styles.chipVoz}>{p.voz}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Secciones por puerta con sus herramientas */}
      {PUERTAS.map((puerta) => {
        const apps = resolverApps(puerta);
        return (
          <section key={puerta.id} id={puerta.id} className={styles.seccion}>
            <header className={styles.seccionHead}>
              <span className={styles.seccionIcon} aria-hidden="true">{puerta.icon}</span>
              <div>
                <h2 className={styles.seccionTitulo}>{puerta.titulo}</h2>
                <p className={styles.seccionVoz}>{puerta.voz}</p>
              </div>
            </header>
            <div className={styles.grid}>
              {apps.map((app) => (
                <a key={app.href} href={app.href} className={styles.card}>
                  <span className={styles.icon} aria-hidden="true">{app.icon}</span>
                  <div className={styles.cardText}>
                    <h3 className={styles.name}>{app.name}</h3>
                    <p className={styles.desc}>{app.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <p className={styles.foot}>
        ¿Prefieres el dato en bruto o el proceso completo?{' '}
        <Link href="/datos-fiscales" className={styles.link}>Datos fiscales</Link>
        {' · '}
        <Link href="/guias" className={styles.link}>Guías</Link>
      </p>
      <p className={styles.foot}>
        ¿Buscas otra herramienta?{' '}
        <a href="https://meskeia.com/apps/?from=delegum" className={styles.link}>Ver el catálogo completo en meskeIA →</a>
      </p>
    </main>
  );
}
