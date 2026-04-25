'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './TeoriaJuegos.module.css';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Eleccion = 'C' | 'D';
type EstrategiaPC = 'aleatoria' | 'tit-for-tat' | 'siempre-D';

interface RondaHistorial {
  j: Eleccion;
  c: Eleccion;
  pJ: number;
  pC: number;
}

// ── Funciones auxiliares ───────────────────────────────────────────────────────

const calcularEleccionPC = (
  estrategia: EstrategiaPC,
  historial: RondaHistorial[]
): Eleccion => {
  if (estrategia === 'aleatoria') return Math.random() < 0.5 ? 'C' : 'D';
  if (estrategia === 'siempre-D') return 'D';
  // tit-for-tat: empieza C, luego copia la última jugada del jugador
  if (historial.length === 0) return 'C';
  return historial[historial.length - 1].j;
};

const getPayoff = (j: Eleccion, c: Eleccion): [number, number] => {
  if (j === 'C' && c === 'C') return [-1, -1];
  if (j === 'C' && c === 'D') return [-3, 0];
  if (j === 'D' && c === 'C') return [0, -3];
  return [-2, -2]; // ambos D
};

const getMensaje = (j: Eleccion, c: Eleccion): string => {
  if (j === 'C' && c === 'C')
    return '¡Ambos guardaron silencio! El resultado colectivo óptimo: 1 año cada uno.';
  if (j === 'C' && c === 'D')
    return 'Te delataron y cooperaste. El peor resultado para ti. La confianza fue castigada.';
  if (j === 'D' && c === 'C')
    return 'Delataste y cooperaron. Libre — pero a costa del otro.';
  return 'Ambos se delataron. Equilibrio de Nash: nadie puede mejorar cambiando solo su estrategia.';
};

const DESCRIPCIONES_ESTRATEGIA: Record<EstrategiaPC, string> = {
  aleatoria: 'Elige al azar en cada ronda. Sin patrón predecible.',
  'tit-for-tat': 'Empieza cooperando. Luego copia tu última jugada. Amable pero recíproco.',
  'siempre-D': 'Siempre delata. La estrategia más agresiva.',
};

// ── Componente principal ───────────────────────────────────────────────────────

export default function TeoriaJuegosPage() {
  const [eleccionJugador, setEleccionJugador] = useState<Eleccion | null>(null);
  const [eleccionPC, setEleccionPC] = useState<Eleccion | null>(null);
  const [estrategia, setEstrategia] = useState<EstrategiaPC>('aleatoria');
  const [historial, setHistorial] = useState<RondaHistorial[]>([]);
  const [revelado, setRevelado] = useState(false);
  const [pastores, setPastores] = useState(0);

  const jugar = useCallback(
    (eleccion: Eleccion) => {
      const pc = calcularEleccionPC(estrategia, historial);
      const [pJ, pC] = getPayoff(eleccion, pc);
      setEleccionJugador(eleccion);
      setEleccionPC(pc);
      setRevelado(true);
      setHistorial(prev => [...prev, { j: eleccion, c: pc, pJ, pC }]);
    },
    [estrategia, historial]
  );

  const reiniciarRonda = useCallback(() => {
    setEleccionJugador(null);
    setEleccionPC(null);
    setRevelado(false);
  }, []);

  const saludPasto = Math.max(0, 100 - pastores * 10);

  const getTextoPastores = (n: number): string => {
    if (n <= 2) return 'Recurso sostenible. Los pastores se autoregulam.';
    if (n <= 5) return 'Presión creciente. El pasto empieza a degradarse.';
    if (n <= 8) return 'Sobrepastoreo severo. El recurso se agota en pocos años.';
    return 'Colapso inminente. La tragedia de los comunes en acción.';
  };

  const payoffActual =
    eleccionJugador && eleccionPC ? getPayoff(eleccionJugador, eleccionPC) : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Economía · Matemáticas</span>
          <h1 className={styles.heroTitle}>Teoría de Juegos</h1>
          <p className={styles.heroSubtitle}>
            El Dilema del Prisionero, el Equilibrio de Nash y la ciencia de la estrategia
          </p>
          <p className={styles.heroDesc}>
            Juega rondas interactivas, explora la tabla de pagos, descubre por qué emerge la
            cooperación y cómo estos modelos explican la Guerra Fría, el cambio climático y
            el diseño de mercados.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── Sección 1: El Dilema del Prisionero ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🔒</span>
            <h2 className={styles.sectionTitle}>El Dilema del Prisionero</h2>
            <p className={styles.sectionSubtitle}>
              Eres el sospechoso A. La policía os tiene separados. El sospechoso B decide ahora.
            </p>
          </div>

          {/* Selector de estrategia */}
          <div className={styles.estrategiaContainer}>
            <p className={styles.estrategiaLabel}>Estrategia del ordenador (B):</p>
            <div className={styles.estrategiaSelector}>
              {(['aleatoria', 'tit-for-tat', 'siempre-D'] as EstrategiaPC[]).map(e => (
                <button
                  key={e}
                  type="button"
                  className={`${styles.estrategiaBtn} ${estrategia === e ? styles.estrategiaBtnActivo : ''}`}
                  onClick={() => setEstrategia(e)}
                  aria-pressed={estrategia === e}
                >
                  {e === 'aleatoria' ? 'Aleatoria' : e === 'tit-for-tat' ? 'Tit-for-tat' : 'Siempre delata'}
                </button>
              ))}
            </div>
            <p className={styles.estrategiaDesc}>{DESCRIPCIONES_ESTRATEGIA[estrategia]}</p>
          </div>

          {/* Panel de juego */}
          {!revelado ? (
            <div className={styles.dilemaPantalla} role="region" aria-label="Turno de juego">
              <p className={styles.narrativa}>
                ¿Qué haces? Ninguno de los dos puede comunicarse con el otro.
              </p>
              <div className={styles.eleccionBtns}>
                <button
                  type="button"
                  className={styles.btnCooperar}
                  onClick={() => jugar('C')}
                  aria-label="Cooperar: guardar silencio"
                >
                  🤝 Cooperar
                  <br />
                  <small>Guardar silencio</small>
                </button>
                <button
                  type="button"
                  className={styles.btnDelatar}
                  onClick={() => jugar('D')}
                  aria-label="Delatar: acusar al otro"
                >
                  🗣️ Delatar
                  <br />
                  <small>Acusar al otro</small>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.resultadoPantalla} role="region" aria-label="Resultado de la ronda" aria-live="polite">
              <div className={styles.eleccionReveal}>
                <span>
                  Tú elegiste:{' '}
                  <strong>{eleccionJugador === 'C' ? '🤝 Cooperar' : '🗣️ Delatar'}</strong>
                </span>
                <span>
                  B eligió:{' '}
                  <strong>{eleccionPC === 'C' ? '🤝 Cooperar' : '🗣️ Delatar'}</strong>
                </span>
              </div>
              <div className={styles.condenas}>
                <div className={styles.condenaTu}>
                  Tú: <strong>{Math.abs(payoffActual![0])} años</strong>
                </div>
                <div className={styles.condenaB}>
                  B: <strong>{Math.abs(payoffActual![1])} años</strong>
                </div>
              </div>
              <p className={styles.mensajeContexto}>
                {eleccionJugador && eleccionPC ? getMensaje(eleccionJugador, eleccionPC) : ''}
              </p>
              <button
                type="button"
                className={styles.btnOtraRonda}
                onClick={reiniciarRonda}
              >
                Jugar otra ronda →
              </button>
            </div>
          )}

          {/* Historial */}
          {historial.length > 0 && (
            <div className={styles.historialSection}>
              <p className={styles.historialLabel}>Historial (últimas 6 rondas)</p>
              <table className={styles.historialTabla} aria-label="Historial de rondas">
                <thead>
                  <tr>
                    <th>Ronda</th>
                    <th>Tú</th>
                    <th>B</th>
                    <th>Tus años</th>
                    <th>Años de B</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.slice(-6).map((r, i) => (
                    <tr
                      key={i}
                      className={r.j === 'D' && r.c === 'D' ? styles.filaNash : ''}
                    >
                      <td>{historial.length - Math.min(6, historial.length) + i + 1}</td>
                      <td>{r.j === 'C' ? '🤝' : '🗣️'}</td>
                      <td>{r.c === 'C' ? '🤝' : '🗣️'}</td>
                      <td>{Math.abs(r.pJ)}</td>
                      <td>{Math.abs(r.pC)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Sección 2: Tabla de pagos y equilibrio de Nash ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🎯</span>
            <h2 className={styles.sectionTitle}>Tabla de pagos y Equilibrio de Nash</h2>
          </div>

          <div className={styles.tablaContainer}>
            <h3 className={styles.tablaTitulo}>Tabla de pagos (años de condena)</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tablaPagos} aria-label="Tabla de pagos del Dilema del Prisionero">
                <thead>
                  <tr>
                    <th></th>
                    <th>B Coopera</th>
                    <th>B Delata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Tú Cooperas</th>
                    <td className={styles.celdaOptima}>
                      −1, −1<br /><small>Pareto óptimo</small>
                    </td>
                    <td className={styles.celdaMala}>
                      −3, 0<br /><small>Peor para ti</small>
                    </td>
                  </tr>
                  <tr>
                    <th>Tú Delatas</th>
                    <td className={styles.celdaMala}>
                      0, −3<br /><small>Peor para B</small>
                    </td>
                    <td className={styles.celdaNash}>
                      −2, −2<br /><small>Equilibrio Nash ★</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.nashExplicacion}>
            <p>
              El <strong>equilibrio de Nash (★)</strong> es la situación donde ningún jugador
              puede mejorar su resultado cambiando solo su estrategia, asumiendo que el otro no
              cambia la suya.
            </p>
            <p>
              En el Dilema del Prisionero: si B denuncia, ¿conviene a A callar (−3) o denunciar
              (−2)? → <strong>Denunciar</strong>. Si B calla, ¿conviene a A callar (−1) o denunciar
              (0)? → <strong>Denunciar</strong>. Por eso (D,D) es el equilibrio — aunque (C,C)
              sería mejor para ambos.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 3: Suma cero vs cooperativos ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">⚖️</span>
            <h2 className={styles.sectionTitle}>Suma cero vs Juegos cooperativos</h2>
          </div>

          <div className={styles.sumaZeroCoopGrid}>
            {/* Suma cero */}
            <div className={styles.sumaZeroCard}>
              <h3 className={styles.sumaZeroTitulo}>⚔️ Suma cero</h3>
              <p className={styles.sumaZeroDesc}>
                Lo que gana uno lo pierde el otro. La suma de los pagos es siempre 0.
              </p>
              <p className={styles.sumaZeroEjemplos}>
                <strong>Ejemplos:</strong> Ajedrez, póker, negociación de precio regateo puro
              </p>

              <div className={styles.miniTablaWrapper}>
                <p className={styles.miniTablaTitulo}>Piedra · Papel · Tijeras</p>
                <table className={styles.miniTabla} aria-label="Matriz de Piedra-Papel-Tijeras">
                  <thead>
                    <tr>
                      <th></th>
                      <th>✊</th>
                      <th>✋</th>
                      <th>✌️</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>✊</th>
                      <td>0, 0</td>
                      <td>−1, +1</td>
                      <td>+1, −1</td>
                    </tr>
                    <tr>
                      <th>✋</th>
                      <td>+1, −1</td>
                      <td>0, 0</td>
                      <td>−1, +1</td>
                    </tr>
                    <tr>
                      <th>✌️</th>
                      <td>−1, +1</td>
                      <td>+1, −1</td>
                      <td>0, 0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cooperativos */}
            <div className={styles.cooperativoCard}>
              <h3 className={styles.cooperativoTitulo}>🤝 Cooperativos</h3>
              <p className={styles.cooperativoDesc}>
                Las partes pueden comunicarse y hacer acuerdos vinculantes. Emergen coaliciones.
              </p>
              <p className={styles.cooperativoEjemplos}>
                <strong>Ejemplos:</strong> Fusiones de empresas, alianzas militares NATO, acuerdos
                climáticos
              </p>
              <div className={styles.cooperativoClave}>
                <p>
                  <strong>La clave</strong> no es si el juego tiene ganadores — es si se puede
                  negociar y comprometerse.
                </p>
                <p>
                  En juegos cooperativos, el objetivo es diseñar mecanismos que hagan que el interés
                  individual coincida con el colectivo. Esto es el{' '}
                  <em>diseño de mecanismos</em> (Hurwicz, Maskin, Myerson — Nobel 2007).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 4: Tragedia de los comunes ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🌱</span>
            <h2 className={styles.sectionTitle}>La Tragedia de los Comunes</h2>
          </div>

          <div className={styles.comunesSection}>
            <div className={styles.sliderContainer}>
              <label htmlFor="slider-pastores" className={styles.sliderLabel}>
                Número de pastores que sobrepastorean:{' '}
                <strong>{pastores} de 10</strong>
              </label>
              <input
                id="slider-pastores"
                type="range"
                min={0}
                max={10}
                value={pastores}
                onChange={e => setPastores(Number(e.target.value))}
                className={styles.slider}
                aria-label={`${pastores} pastores sobrepastoreando de 10`}
              />
            </div>

            {/* Vacas */}
            <div className={styles.vacasGrid} aria-label={`${pastores} vacas en rojo (sobrepastoreo), ${10 - pastores} en verde (sostenible)`}>
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={i < pastores ? styles.vacaRoja : styles.vacaVerde}
                  aria-hidden="true"
                >
                  🐄
                </span>
              ))}
            </div>

            {/* Barra de salud del pasto */}
            <div className={styles.barraRecursoContainer}>
              <p className={styles.barraRecursoLabel}>
                Salud del pasto: <strong>{saludPasto}%</strong>
              </p>
              <div className={styles.barraRecursoFondo} role="progressbar" aria-valuenow={saludPasto} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={styles.barraRecurso}
                  style={{ width: `${saludPasto}%` }}
                />
              </div>
            </div>

            <p className={styles.textoPastores} role="status" aria-live="polite">
              {getTextoPastores(pastores)}
            </p>

            <div className={styles.comunesExplicacion}>
              <p>
                <strong>Garrett Hardin (1968):</strong> cuando un recurso es de todos, cada
                individuo tiene incentivo a usarlo al máximo (yo no paro, pero otro tampoco
                parará). El resultado colectivo es el agotamiento del recurso.
              </p>
              <p>
                <strong>Soluciones:</strong> regulación externa, privatización del recurso,
                o normas comunitarias auto-gestionadas (<strong>Elinor Ostrom</strong>, Nobel
                Economía 2009).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Insight Box ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.insightBox} role="note">
            <p className={styles.insightLabel}>John Nash, 1928–2015</p>
            <p className={styles.insightTexto}>
              John Nash publicó su equilibrio en <strong>4 páginas</strong> a los 21 años, en su
              tesis doctoral. Recibió el Nobel de Economía en 1994 junto con Harsanyi y Selten. Su
              vida fue narrada en <em>Una mente maravillosa</em> (2001). Murió en un taxi de Nueva
              Jersey el mismo día que volvía de recoger el Premio Abel de matemáticas.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 5: 4 Aplicaciones reales ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🌍</span>
            <h2 className={styles.sectionTitle}>4 aplicaciones reales</h2>
            <p className={styles.sectionSubtitle}>
              De la Guerra Fría al diseño de mercados — la teoría de juegos en acción.
            </p>
          </div>

          <div className={styles.aplicacionesGrid}>
            <article className={styles.aplicacionCard}>
              <span className={styles.aplicacionIcono} aria-hidden="true">🚀</span>
              <h3 className={styles.aplicacionTitulo}>
                Guerra Fría — Destrucción Mutua Asegurada (MAD)
              </h3>
              <p className={styles.aplicacionTexto}>
                Juego suma cero con equilibrio Nash en &ldquo;ambos destruyen el mundo&rdquo;. La
                estrategia de la Unión Soviética y EEUU era exactamente el Dilema del Prisionero:
                si uno deja de armarse, el otro gana. Si ambos se arman, ambos arriesgan la
                destrucción. La disuasión nuclear convirtió la guerra en un juego de equilibrios.
              </p>
            </article>

            <article className={styles.aplicacionCard}>
              <span className={styles.aplicacionIcono} aria-hidden="true">🌍</span>
              <h3 className={styles.aplicacionTitulo}>
                Crisis Climática — Tragedia de los comunes planetaria
              </h3>
              <p className={styles.aplicacionTexto}>
                Cada país tiene incentivo a emitir CO₂ si los demás reducen (free-rider). El
                resultado sin coordinación: nadie reduce lo suficiente. El Acuerdo de París intenta
                convertir un juego no-cooperativo en uno cooperativo mediante compromisos
                verificables.
              </p>
            </article>

            <article className={styles.aplicacionCard}>
              <span className={styles.aplicacionIcono} aria-hidden="true">🦋</span>
              <h3 className={styles.aplicacionTitulo}>
                Evolución — Cómo emerge la cooperación
              </h3>
              <p className={styles.aplicacionTexto}>
                Robert Axelrod (1984) organizó torneos entre estrategias informáticas para el
                Dilema del Prisionero repetido. El ganador fue siempre{' '}
                <strong>Tit-for-tat</strong>: cooperar primero, luego imitar la última jugada del
                rival. La cooperación es evolutivamente estable en juegos repetidos con suficiente
                frecuencia de encuentros.
              </p>
            </article>

            <article className={styles.aplicacionCard}>
              <span className={styles.aplicacionIcono} aria-hidden="true">💰</span>
              <h3 className={styles.aplicacionTitulo}>
                Subastas — El diseño de mercados
              </h3>
              <p className={styles.aplicacionTexto}>
                ¿Cuánto pujar en una subasta ciega? Google usa la subasta de Vickrey (paga el
                segundo precio) para anuncios: cada anunciante puja su valor real, no
                estratégicamente. Diseñar las reglas del juego para obtener el resultado deseado
                es el <em>diseño de mecanismos</em>. Nobel Economía 2020 para Milgrom y Wilson.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="La ciencia de la estrategia"
        subtitle="Von Neumann, Nash y cómo las matemáticas explican el comportamiento humano"
        defaultOpen={false}
      >
        <h3>De Von Neumann a Nash: historia de una revolución matemática</h3>
        <p>
          John von Neumann y Oskar Morgenstern publicaron{' '}
          <em>Theory of Games and Economic Behavior</em> en 1944, fundando formalmente la teoría
          de juegos. Von Neumann demostró el <strong>minimax theorem</strong>: en juegos suma cero
          de dos jugadores, siempre existe una estrategia óptima.
        </p>
        <p>
          John Nash generalizó esto en 1950 con su equilibrio para juegos con cualquier número de
          jugadores y payoffs arbitrarios. A los 21 años, con una tesis doctoral de 28 páginas,
          cambió la economía, la biología evolutiva, la ciencia política y la teoría militar.
        </p>

        <h3>Thomas Schelling y la segregación</h3>
        <p>
          Thomas Schelling (Nobel 2005) demostró con su modelo de segregación que pequeñas
          preferencias individuales (cada persona quiere al menos un 30% de vecinos de su mismo
          grupo) producen segregación total a nivel de barrio — aunque nadie lo desee
          explícitamente. El resultado colectivo emerge de decisiones individuales racionales.
        </p>

        <h3>Elinor Ostrom y la gestión de los comunes</h3>
        <p>
          Elinor Ostrom (Nobel 2009) contradijo empíricamente la &ldquo;tragedia de los
          comunes&rdquo;: en el mundo real, las comunidades desarrollan normas, sanciones y
          mecanismos de coordinación que evitan el colapso. Su investigación mostró docenas de
          casos de gestión exitosa de recursos comunes sin privatización ni regulación estatal.
        </p>

        <h3>Estrategias mixtas y equilibrios múltiples</h3>
        <p>
          En muchos juegos no existe un equilibrio en estrategias puras. Nash demostró que siempre
          existe al menos uno en estrategias <em>mixtas</em> (probabilidades sobre las acciones).
          Piedra-papel-tijeras tiene equilibrio mixto: cada jugador elige cada opción con
          probabilidad 1/3. En fútbol, los penaltis son aproximadamente estrategias mixtas Nash.
        </p>

        <div className={styles.warningBox}>
          <strong>ℹ️ Nota:</strong> El Dilema del Prisionero es un modelo simplificado. Los
          juegos reales tienen más jugadores, información asimétrica y estrategias mixtas. La
          teoría de juegos es una herramienta de análisis, no una predicción exacta del
          comportamiento humano.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-teoria-juegos')} />
      <ShareCard appName="visualizador-teoria-juegos" />
      <Footer appName="visualizador-teoria-juegos" />
    </div>
  );
}
