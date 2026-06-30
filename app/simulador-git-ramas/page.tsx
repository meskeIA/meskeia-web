'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorGitRamas.module.css';

// ============================================================
//  TIPOS Y ESTADO
// ============================================================

interface Commit {
  id: string;
  mensaje: string;
  parents: string[];
  lane: number;
  x: number;
}

interface EstadoGit {
  commits: Commit[];
  ramas: Record<string, string>; // rama -> id del commit al que apunta
  ordenRamas: string[];
  lanes: Record<string, number>;
  head: string; // rama actual
  proxLane: number;
  contador: number;
  log: string[];
}

const COLORES = ['#2E86AB', '#48A9A6', '#C0653A', '#7B5EA7', '#B0488A', '#5BAE7A'];

function estadoInicial(): EstadoGit {
  const c1: Commit = { id: 'C1', mensaje: 'commit inicial', parents: [], lane: 0, x: 0 };
  return {
    commits: [c1],
    ramas: { main: 'C1' },
    ordenRamas: ['main'],
    lanes: { main: 0 },
    head: 'main',
    proxLane: 1,
    contador: 1,
    log: ['git init', 'git commit -m "commit inicial"'],
  };
}

function clonar(e: EstadoGit): EstadoGit {
  return {
    commits: e.commits.map((c) => ({ ...c, parents: [...c.parents] })),
    ramas: { ...e.ramas },
    ordenRamas: [...e.ordenRamas],
    lanes: { ...e.lanes },
    head: e.head,
    proxLane: e.proxLane,
    contador: e.contador,
    log: [...e.log],
  };
}

function hacerCommit(prev: EstadoGit, mensaje?: string): EstadoGit {
  const e = clonar(prev);
  e.contador += 1;
  const id = `C${e.contador}`;
  const padre = e.ramas[e.head];
  const commit: Commit = {
    id,
    mensaje: mensaje ?? `cambios ${e.contador}`,
    parents: [padre],
    lane: e.lanes[e.head],
    x: e.commits.length,
  };
  e.commits.push(commit);
  e.ramas[e.head] = id;
  e.log.push(`git commit -m "${commit.mensaje}"`);
  return e;
}

function crearRama(prev: EstadoGit, nombreRaw: string): EstadoGit {
  const nombre = nombreRaw.trim().toLowerCase().replace(/[^a-z0-9._/-]/g, '');
  if (!nombre || prev.ramas[nombre] !== undefined) return prev;
  const e = clonar(prev);
  e.lanes[nombre] = e.proxLane;
  e.proxLane += 1;
  e.ramas[nombre] = e.ramas[e.head];
  e.ordenRamas.push(nombre);
  e.head = nombre; // crear y cambiar (como git checkout -b)
  e.log.push(`git checkout -b ${nombre}`);
  return e;
}

function checkout(prev: EstadoGit, rama: string): EstadoGit {
  if (prev.ramas[rama] === undefined || rama === prev.head) return prev;
  const e = clonar(prev);
  e.head = rama;
  e.log.push(`git checkout ${rama}`);
  return e;
}

function fusionar(prev: EstadoGit, otra: string): EstadoGit {
  if (otra === prev.head || prev.ramas[otra] === undefined) return prev;
  const e = clonar(prev);
  const destinoId = e.ramas[e.head];
  const origenId = e.ramas[otra];
  if (destinoId === origenId) {
    e.log.push(`git merge ${otra}  # ya estaban al día`);
    return e;
  }
  e.contador += 1;
  const id = `C${e.contador}`;
  const commit: Commit = {
    id,
    mensaje: `Merge ${otra} → ${e.head}`,
    parents: [destinoId, origenId],
    lane: e.lanes[e.head],
    x: e.commits.length,
  };
  e.commits.push(commit);
  e.ramas[e.head] = id;
  e.log.push(`git merge ${otra}`);
  return e;
}

// ============================================================
//  COMPONENTE
// ============================================================

const X_GAP = 72;
const LANE_GAP = 66;
const R = 17;
const MARGEN = 36;

export default function SimuladorGitRamas() {
  const [estado, setEstado] = useState<EstadoGit>(estadoInicial);
  const [nuevaRama, setNuevaRama] = useState<string>('');
  const [ramaFusion, setRamaFusion] = useState<string>('');

  const handleCommit = useCallback(() => setEstado((e) => hacerCommit(e)), []);
  const handleCrearRama = useCallback(() => {
    setEstado((e) => crearRama(e, nuevaRama));
    setNuevaRama('');
  }, [nuevaRama]);
  const handleCheckout = useCallback((rama: string) => setEstado((e) => checkout(e, rama)), []);
  const handleFusionar = useCallback(() => {
    if (ramaFusion) setEstado((e) => fusionar(e, ramaFusion));
  }, [ramaFusion]);
  const handleReiniciar = useCallback(() => setEstado(estadoInicial()), []);

  const handlePreset = useCallback(() => {
    let e = estadoInicial();
    e = hacerCommit(e, 'estructura base');
    e = crearRama(e, 'feature');
    e = hacerCommit(e, 'nueva función');
    e = hacerCommit(e, 'tests de la función');
    e = checkout(e, 'main');
    e = hacerCommit(e, 'corrección en main');
    e = fusionar(e, 'feature');
    setEstado(e);
  }, []);

  const posCommit = useMemo(() => {
    const m = new Map<string, Commit>();
    estado.commits.forEach((c) => m.set(c.id, c));
    return m;
  }, [estado.commits]);

  const ancho = Math.max(320, estado.commits.length * X_GAP + MARGEN * 2);
  const alto = estado.proxLane * LANE_GAP + MARGEN * 2;

  const cx = (c: Commit) => MARGEN + c.x * X_GAP + R;
  const cy = (c: Commit) => MARGEN + c.lane * LANE_GAP + R;

  // Etiquetas de rama agrupadas por commit al que apuntan
  const ramasPorCommit = useMemo(() => {
    const m = new Map<string, string[]>();
    estado.ordenRamas.forEach((rama) => {
      const id = estado.ramas[rama];
      if (!m.has(id)) m.set(id, []);
      m.get(id)?.push(rama);
    });
    return m;
  }, [estado.ramas, estado.ordenRamas]);

  const otrasRamas = estado.ordenRamas.filter((r) => r !== estado.head);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Git: Ramas y Merge</h1>
        <p className={styles.subtitle}>
          Crea commits, abre ramas, cambia entre ellas y fusiónalas mientras ves crecer el grafo de
          commits en tiempo real. Entiende HEAD y los punteros de rama sin tocar la terminal.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Controles */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Acciones</h2>
          <div className={styles.accionesFila}>
            <button type="button" className={styles.ctrlBtn} onClick={handleCommit}>
              + Commit
            </button>
            <div className={styles.grupoAccion}>
              <input
                type="text"
                value={nuevaRama}
                onChange={(e) => setNuevaRama(e.target.value)}
                placeholder="nombre-rama"
                className={styles.txtInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCrearRama();
                }}
              />
              <button type="button" className={`${styles.ctrlBtn} ${styles.ctrlBtnSecondary}`} onClick={handleCrearRama}>
                Crear rama
              </button>
            </div>
            <div className={styles.grupoAccion}>
              <select
                className={styles.txtInput}
                value={ramaFusion}
                onChange={(e) => setRamaFusion(e.target.value)}
                aria-label="Rama a fusionar en la rama actual"
              >
                <option value="">Fusionar rama…</option>
                {otrasRamas.map((r) => (
                  <option key={r} value={r}>
                    {r} → {estado.head}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`${styles.ctrlBtn} ${styles.ctrlBtnSecondary}`}
                onClick={handleFusionar}
                disabled={!ramaFusion}
              >
                Merge
              </button>
            </div>
            <button type="button" className={`${styles.ctrlBtn} ${styles.ctrlBtnSecondary}`} onClick={handlePreset}>
              Ejemplo
            </button>
            <button type="button" className={`${styles.ctrlBtn} ${styles.ctrlBtnDanger}`} onClick={handleReiniciar}>
              Reiniciar
            </button>
          </div>

          {/* Checkout de ramas */}
          <div className={styles.ramasFila}>
            <span className={styles.ramasLabel}>Rama actual (checkout):</span>
            {estado.ordenRamas.map((r) => (
              <button
                key={r}
                type="button"
                className={`${styles.ramaChip} ${estado.head === r ? styles.ramaChipActiva : ''}`}
                style={{ borderColor: COLORES[estado.lanes[r] % COLORES.length] }}
                onClick={() => handleCheckout(r)}
                aria-pressed={estado.head === r}
              >
                {estado.head === r && <span className={styles.headTag}>HEAD →</span>} {r}
              </button>
            ))}
          </div>
        </section>

        {/* Grafo */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Grafo de commits</h2>
          <div className={styles.grafoWrap}>
            <svg
              className={styles.grafoSvg}
              viewBox={`0 0 ${ancho} ${alto}`}
              width={ancho}
              height={alto}
              role="img"
              aria-label="Grafo de commits de Git"
            >
              {/* Aristas commit → padres */}
              {estado.commits.map((c) =>
                c.parents.map((pid) => {
                  const p = posCommit.get(pid);
                  if (!p) return null;
                  return (
                    <line
                      key={`e-${c.id}-${pid}`}
                      x1={cx(c)}
                      y1={cy(c)}
                      x2={cx(p)}
                      y2={cy(p)}
                      className={styles.arista}
                      stroke={COLORES[c.lane % COLORES.length]}
                    />
                  );
                })
              )}
              {/* Nodos */}
              {estado.commits.map((c) => {
                const esMerge = c.parents.length > 1;
                const color = COLORES[c.lane % COLORES.length];
                const etiquetas = ramasPorCommit.get(c.id) ?? [];
                return (
                  <g key={c.id}>
                    <circle
                      cx={cx(c)}
                      cy={cy(c)}
                      r={R}
                      fill={esMerge ? 'var(--bg-card)' : color}
                      stroke={color}
                      strokeWidth={esMerge ? 3 : 2}
                    />
                    <text x={cx(c)} y={cy(c)} className={styles.nodoLabel} fill={esMerge ? color : 'white'}>
                      {c.id}
                    </text>
                    {/* Etiquetas de rama */}
                    {etiquetas.map((rama, i) => (
                      <g key={`tag-${c.id}-${rama}`}>
                        <rect
                          x={cx(c) - 26}
                          y={cy(c) + R + 6 + i * 20}
                          width={52}
                          height={16}
                          rx={4}
                          fill={estado.head === rama ? color : 'var(--bg-primary)'}
                          stroke={color}
                        />
                        <text
                          x={cx(c)}
                          y={cy(c) + R + 14 + i * 20}
                          className={styles.ramaTagText}
                          fill={estado.head === rama ? 'white' : 'var(--text-primary)'}
                        >
                          {rama}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className={styles.leyenda}>
            <span><span className={styles.leyendaPunto} style={{ background: COLORES[0] }} /> Commit normal</span>
            <span><span className={styles.leyendaPuntoHueco} /> Commit de fusión (2 padres)</span>
          </div>
        </section>

        {/* Log de comandos */}
        <div className={styles.opLog}>
          <div className={styles.opLogTitle}>Comandos equivalentes de Git ({estado.log.length})</div>
          <ul className={styles.opLogList}>
            {estado.log.slice(-14).map((l, idx) => (
              <li key={`log-${idx}-${l}`}>$ {l}</li>
            ))}
          </ul>
        </div>
      </main>

      <EducationalSection
        title="Guía de Git: Ramas, Commits y Merge"
        subtitle="Cómo funcionan los punteros, HEAD y las fusiones por debajo"
      >
        <h3>Conceptos clave de Git</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Qué es</th>
                <th>Comando típico</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Commit</td><td>Instantánea del proyecto con uno o más padres</td><td>git commit -m</td></tr>
              <tr><td>Rama (branch)</td><td>Puntero móvil a un commit</td><td>git branch / git checkout -b</td></tr>
              <tr><td>HEAD</td><td>Puntero a la rama (y commit) actual</td><td>git checkout</td></tr>
              <tr><td>Merge</td><td>Une dos ramas; crea un commit con dos padres</td><td>git merge</td></tr>
              <tr><td>Fast-forward</td><td>Mover el puntero sin crear commit de fusión</td><td>git merge (sin divergencia)</td></tr>
              <tr><td>Rebase</td><td>Reaplica commits sobre otra base (historia lineal)</td><td>git rebase</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
              <strong>Ramas de característica</strong>
            </div>
            <div className={styles.escenarioExample}>
              Cada nueva función o corrección se desarrolla en su propia rama, aislada de main. Cuando
              está lista y probada, se fusiona. Así main siempre se mantiene estable.
            </div>
            <div className={styles.escenarioTip}>Tip: es la base de GitHub Flow, el flujo más común hoy.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
              <strong>Trabajo en equipo</strong>
            </div>
            <div className={styles.escenarioExample}>
              Varias personas trabajan a la vez en ramas distintas sin pisarse. Las pull requests
              revisan los cambios antes de fusionarlos a la rama principal.
            </div>
            <div className={styles.escenarioTip}>Tip: el merge commit deja constancia de cuándo se integró cada rama.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚑</span>
              <strong>Hotfix en producción</strong>
            </div>
            <div className={styles.escenarioExample}>
              Ante un fallo urgente, se abre una rama desde el código en producción, se corrige y se
              fusiona, sin arrastrar trabajo a medias de otras ramas de desarrollo.
            </div>
            <div className={styles.escenarioTip}>Tip: poder ramificar al instante es lo que hace esto viable.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧪</span>
              <strong>Experimentos</strong>
            </div>
            <div className={styles.escenarioExample}>
              Una rama desechable permite probar una idea arriesgada. Si funciona, se fusiona; si no,
              se borra sin dejar rastro en la historia principal.
            </div>
            <div className={styles.escenarioTip}>Tip: borrar una rama solo elimina el puntero, no los commits si están fusionados.</div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Una rama copia todos los archivos?</h4>
            <p>
              No. Una rama es solo un puntero a un commit (literalmente un archivo con un identificador).
              No se copia nada del proyecto, por eso crear ramas es instantáneo y prácticamente gratis en
              espacio. Cambiar de rama actualiza tu directorio de trabajo al commit al que apunta.
            </p>
            <p className={styles.faqTip}>En el simulador, crear una rama solo añade una etiqueta nueva.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es un fast-forward?</h4>
            <p>
              Si fusionas una rama en otra que no ha avanzado desde que se separaron, Git no necesita
              crear un commit de fusión: simplemente mueve el puntero hacia delante hasta el último commit
              de la otra rama. Es el merge más limpio, pero solo es posible cuando no hay divergencia.
            </p>
            <p className={styles.faqTip}>Si ambas ramas han avanzado, aparece un commit de fusión con dos padres.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué hace exactamente HEAD?</h4>
            <p>
              HEAD indica dónde estás. Normalmente apunta a una rama (HEAD → main), y esa rama apunta a un
              commit. Al hacer commit, avanza la rama y HEAD va con ella. Si haces checkout a un commit
              concreto en vez de a una rama, quedas en estado "detached HEAD".
            </p>
            <p className={styles.faqTip}>En el simulador, la etiqueta HEAD → marca tu rama actual.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Merge o rebase?</h4>
            <p>
              Merge conserva la historia tal como ocurrió, con sus bifurcaciones y un commit de fusión.
              Rebase reescribe tus commits sobre otra base para lograr una historia lineal y limpia, pero
              cambia sus identificadores. Usa merge para integrar ramas compartidas y rebase para ordenar
              tu trabajo local antes de compartirlo.
            </p>
            <p className={styles.faqTip}>Regla de oro: no hagas rebase de commits que ya estén en remoto compartido.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es un conflicto de merge?</h4>
            <p>
              Ocurre cuando dos ramas modifican las mismas líneas de un archivo de forma distinta. Git no
              puede decidir cuál vale y marca el conflicto para que lo resuelvas a mano. No es un error: es
              parte normal del trabajo en equipo cuando hay cambios solapados.
            </p>
            <p className={styles.faqTip}>Cuanto más pequeñas y frecuentes son las fusiones, menos conflictos aparecen.</p>
          </div>
        </div>

        <h3>Flujo con Rama de Característica — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Parte de main actualizada</strong>
              <p>Asegúrate de estar en main con los últimos cambios antes de empezar algo nuevo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Crea una rama para la tarea</strong>
              <p>git checkout -b feature. Trabajarás aislado sin tocar main.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Haz commits pequeños y frecuentes</strong>
              <p>Cada commit es un punto de guardado con un mensaje claro de qué cambiaste.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Vuelve a main y fusiona</strong>
              <p>git checkout main y git merge feature. Si ambas avanzaron, se crea un commit de fusión.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Borra la rama ya fusionada</strong>
              <p>Una vez integrada, la rama de característica ya no hace falta: se elimina el puntero.</p>
            </div>
          </div>
        </div>

        <h3>Buenas Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✍️</span>
            <strong>Mensajes de commit claros</strong>
            <p>Explica el porqué, no solo el qué. Tu yo futuro y tu equipo lo agradecerán.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧱</span>
            <strong>Commits pequeños</strong>
            <p>Un commit = un cambio lógico. Facilita revisar, revertir y entender la historia.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌿</span>
            <strong>Una rama por tarea</strong>
            <p>Aísla cada función o corrección. main se mantiene siempre desplegable.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Integra a menudo</strong>
            <p>Fusionar pronto y con frecuencia evita conflictos grandes y dolorosos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚫</span>
            <strong>No reescribas historia compartida</strong>
            <p>Evita rebase o force-push sobre commits que ya tienen otras personas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔖</span>
            <strong>Usa .gitignore</strong>
            <p>No versiones binarios, dependencias ni secretos. Mantén el repositorio limpio.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con Git</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Trabajar siempre en main sin ramas, mezclando cambios sin terminar.</li>
            <li>Hacer commits gigantes que mezclan muchos cambios distintos.</li>
            <li>Hacer rebase o force-push de ramas compartidas y romper el trabajo de otros.</li>
            <li>Confundir HEAD (dónde estás) con la rama (puntero a un commit).</li>
            <li>Versionar secretos, claves o archivos generados por no usar .gitignore.</li>
            <li>Resolver mal un conflicto y borrar cambios ajenos sin darse cuenta.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-git-ramas')} />
      <ShareCard appName="simulador-git-ramas" />
      <Footer appName="simulador-git-ramas" />
    </div>
  );
}
