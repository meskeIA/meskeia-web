'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './SimuladorMontyHall.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type AppMode = 'manual' | 'automatico';
type DoorState = 'cerrada' | 'seleccionada' | 'revelada' | 'win' | 'lose';
type GamePhase = 'elegir' | 'decidir' | 'resultado';

interface DoorInfo {
  numero: number;
  estado: DoorState;
  tieneCoche: boolean;
}

interface SesionStats {
  victorias: number;
  derrotas: number;
}

interface SimResult {
  victoriasConCambio: number;
  victoriasSinCambio: number;
  total: number;
}

// ============================================
// LÓGICA DE MONTY HALL
// ============================================

/** Genera 3 puertas con el coche colocado aleatoriamente */
function generarPuertas(): DoorInfo[] {
  const cochePuerta = Math.floor(Math.random() * 3);
  return [0, 1, 2].map(i => ({
    numero: i + 1,
    estado: 'cerrada' as DoorState,
    tieneCoche: i === cochePuerta,
  }));
}

/** Monty elige una puerta con cabra que no sea la seleccionada ni la del coche */
function elegirPuertaMonty(puertas: DoorInfo[], seleccionada: number): number {
  const candidatas = puertas.filter(
    p => p.numero !== seleccionada && !p.tieneCoche
  );
  const idx = Math.floor(Math.random() * candidatas.length);
  return candidatas[idx].numero;
}

/** Puerta alternativa (no seleccionada, no revelada) */
function puertaAlternativa(seleccionada: number, revelada: number): number {
  return [1, 2, 3].find(n => n !== seleccionada && n !== revelada) as number;
}

/** Simula N partidas y devuelve resultados */
function simularPartidas(n: number): SimResult {
  let victoriasConCambio = 0;
  let victoriasSinCambio = 0;
  for (let i = 0; i < n; i++) {
    const coche = Math.floor(Math.random() * 3);
    const eleccion = Math.floor(Math.random() * 3);
    // Sin cambio: gana si eligió el coche
    if (eleccion === coche) victoriasSinCambio++;
    // Con cambio: gana si NO eligió el coche (Monty elimina la cabra y el jugador cambia)
    else victoriasConCambio++;
  }
  return { victoriasConCambio, victoriasSinCambio, total: n };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorMontyHallPage() {
  // Modo general
  const [mode, setMode] = useState<AppMode>('manual');

  // Estado modo manual
  const [puertas, setPuertas] = useState<DoorInfo[]>(generarPuertas());
  const [fase, setFase] = useState<GamePhase>('elegir');
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [revelada, setRevelada] = useState<number | null>(null);
  const [sesion, setSesion] = useState<SesionStats>({ victorias: 0, derrotas: 0 });
  const [ultimaDecision, setUltimaDecision] = useState<'cambio' | 'mantiene' | null>(null);

  // Estado modo automático
  const [nSimulaciones, setNSimulaciones] = useState<number>(1000);
  const [resultados, setResultados] = useState<SimResult | null>(null);

  // ============================================
  // HANDLERS MODO MANUAL
  // ============================================

  const reiniciarJuego = useCallback(() => {
    setPuertas(generarPuertas());
    setFase('elegir');
    setSeleccionada(null);
    setRevelada(null);
    setUltimaDecision(null);
  }, []);

  const seleccionarPuerta = useCallback((numero: number) => {
    if (fase !== 'elegir') return;

    const montyRevela = elegirPuertaMonty(puertas, numero);
    setSeleccionada(numero);
    setRevelada(montyRevela);

    setPuertas(prev =>
      prev.map(p => {
        if (p.numero === numero) return { ...p, estado: 'seleccionada' as DoorState };
        if (p.numero === montyRevela) return { ...p, estado: 'revelada' as DoorState };
        return p;
      })
    );

    setFase('decidir');
  }, [fase, puertas]);

  const tomarDecision = useCallback((cambiar: boolean) => {
    if (fase !== 'decidir' || seleccionada === null || revelada === null) return;

    const puertaFinal = cambiar
      ? puertaAlternativa(seleccionada, revelada)
      : seleccionada;

    const gano = puertas.find(p => p.numero === puertaFinal)?.tieneCoche ?? false;
    setUltimaDecision(cambiar ? 'cambio' : 'mantiene');

    setPuertas(prev =>
      prev.map(p => {
        if (p.numero === puertaFinal) {
          return { ...p, estado: (gano ? 'win' : 'lose') as DoorState };
        }
        if (p.estado === 'cerrada') {
          // Revelar la puerta restante (no seleccionada y no la final)
          return { ...p, estado: 'revelada' as DoorState };
        }
        return p;
      })
    );

    setSesion(prev => ({
      victorias: prev.victorias + (gano ? 1 : 0),
      derrotas: prev.derrotas + (gano ? 0 : 1),
    }));

    setFase('resultado');
  }, [fase, seleccionada, revelada, puertas]);

  // ============================================
  // HANDLERS MODO AUTOMÁTICO
  // ============================================

  const ejecutarSimulacion = useCallback(() => {
    const res = simularPartidas(nSimulaciones);
    setResultados(res);
  }, [nSimulaciones]);

  // ============================================
  // HELPERS DE RENDER
  // ============================================

  function emojiFase(puerta: DoorInfo): string {
    if (puerta.estado === 'cerrada') return '🚪';
    if (puerta.estado === 'seleccionada') return '🤔';
    if (puerta.estado === 'revelada') return '🐐';
    if (puerta.estado === 'win') return '🚗';
    if (puerta.estado === 'lose') return '🐐';
    return '🚪';
  }

  function clasePuerta(puerta: DoorInfo): string {
    const base = styles.door;
    if (puerta.estado === 'seleccionada') return `${base} ${styles.doorSelected}`;
    if (puerta.estado === 'revelada') return `${base} ${styles.doorRevealed}`;
    if (puerta.estado === 'win') return `${base} ${styles.doorWin}`;
    if (puerta.estado === 'lose') return `${base} ${styles.doorLose}`;
    return base;
  }

  function mensajeResultado(): string {
    const puertaFinal = puertas.find(p => p.estado === 'win' || p.estado === 'lose');
    if (!puertaFinal) return '';
    const gano = puertaFinal.estado === 'win';
    const decision = ultimaDecision === 'cambio' ? 'cambiaste de puerta' : 'mantuviste tu puerta';
    return gano
      ? `¡Ganaste el coche! ${decision === 'cambiaste de puerta' ? 'Cambiar fue la jugada correcta.' : 'Esta vez mantener funcionó, pero estadísticamente es la peor opción.'}`
      : `Una cabra... ${decision === 'cambiaste de puerta' ? 'Esta vez no tuvo suerte el cambio, pero seguirá siendo la mejor estrategia.' : 'Mantener la puerta solo gana 1 de cada 3 veces.'}`;
  }

  const pctCambio = resultados
    ? ((resultados.victoriasConCambio / resultados.total) * 100).toFixed(1).replace('.', ',')
    : null;
  const pctSinCambio = resultados
    ? ((resultados.victoriasSinCambio / resultados.total) * 100).toFixed(1).replace('.', ',')
    : null;

  const barWidthCambio = resultados
    ? Math.round((resultados.victoriasConCambio / resultados.total) * 100)
    : 0;
  const barWidthSinCambio = resultados
    ? Math.round((resultados.victoriasSinCambio / resultados.total) * 100)
    : 0;

  const totalJugadas = sesion.victorias + sesion.derrotas;
  const pctVictorias = totalJugadas > 0
    ? ((sesion.victorias / totalJugadas) * 100).toFixed(0)
    : '—';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🚪</span> Simulador del Problema de Monty Hall</h1>
        <p className={styles.subtitle}>
          Elige una puerta. Monty revela una cabra. ¿Cambias? Descubre por qué la probabilidad
          de ganar cambiando es el <strong>doble</strong> que quedándote.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE MODO */}
      <div className={styles.modeSelector}>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('manual')}
          aria-pressed={mode === 'manual'}
        >
          <span aria-hidden="true">🎮</span> Modo manual
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'automatico' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('automatico')}
          aria-pressed={mode === 'automatico'}
        >
          <span aria-hidden="true">🤖</span> Simulación automática
        </button>
      </div>

      {/* ================================================
          MODO MANUAL
      ================================================ */}
      {mode === 'manual' && (
        <div className={styles.mainContent}>

          {/* INSTRUCCIÓN DINÁMICA */}
          <p className={styles.instruccion} role="status" aria-live="polite">
            {fase === 'elegir' && 'Haz clic en una puerta para elegirla.'}
            {fase === 'decidir' && 'Monty ha abierto una puerta con cabra. ¿Cambias de puerta o mantienes tu elección?'}
            {fase === 'resultado' && mensajeResultado()}
          </p>

          {/* PUERTAS */}
          <div className={styles.doorsGrid}>
            {puertas.map(puerta => (
              <button
                type="button"
                key={puerta.numero}
                className={clasePuerta(puerta)}
                onClick={() => seleccionarPuerta(puerta.numero)}
                disabled={fase !== 'elegir' || puerta.estado !== 'cerrada'}
                aria-label={`Puerta ${puerta.numero}`}
              >
                <span className={styles.doorNumber}>{puerta.numero}</span>
                <span className={styles.doorEmoji} aria-hidden="true">
                  {emojiFase(puerta)}
                </span>
                {puerta.estado === 'win' && (
                  <span className={styles.doorBadge}>¡Coche!</span>
                )}
                {puerta.estado === 'lose' && (
                  <span className={styles.doorBadge}>Cabra</span>
                )}
              </button>
            ))}
          </div>

          {/* BOTONES DECISIÓN */}
          {fase === 'decidir' && seleccionada !== null && revelada !== null && (
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => tomarDecision(true)}
              >
                <span aria-hidden="true">🔄</span> Cambiar de puerta (recomendado)
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => tomarDecision(false)}
              >
                <span aria-hidden="true">🔒</span> Mantener mi puerta
              </button>
            </div>
          )}

          {/* BOTÓN NUEVA PARTIDA */}
          {fase === 'resultado' && (
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={reiniciarJuego}
              >
                <span aria-hidden="true">▶</span> Nueva partida
              </button>
            </div>
          )}

          {/* ESTADÍSTICAS DE SESIÓN */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{sesion.victorias}</span>
              <span className={styles.statLabel}>Victorias</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{sesion.derrotas}</span>
              <span className={styles.statLabel}>Derrotas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{totalJugadas}</span>
              <span className={styles.statLabel}>Partidas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{pctVictorias}{totalJugadas > 0 ? ' %' : ''}</span>
              <span className={styles.statLabel}>% victorias</span>
            </div>
          </div>

          {totalJugadas > 0 && (
            <p className={styles.sesionHint}>
              Con muchas partidas el porcentaje de victorias se aproximará a <strong>66,7 %</strong> si siempre cambias, o a <strong>33,3 %</strong> si nunca cambias.
            </p>
          )}
        </div>
      )}

      {/* ================================================
          MODO AUTOMÁTICO
      ================================================ */}
      {mode === 'automatico' && (
        <div className={styles.mainContent}>
          <div className={styles.sliderSection}>
            <label className={styles.sliderLabel} htmlFor="nSimulaciones">
              Número de simulaciones: <strong>{nSimulaciones.toLocaleString('es-ES')}</strong>
            </label>
            <input
              id="nSimulaciones"
              type="range"
              min={10}
              max={10000}
              step={10}
              value={nSimulaciones}
              onChange={e => setNSimulaciones(Number(e.target.value))}
              className={styles.slider}
              aria-label="Número de simulaciones"
            />
            <div className={styles.sliderTicks}>
              <span>10</span>
              <span>2.500</span>
              <span>5.000</span>
              <span>7.500</span>
              <span>10.000</span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button type="button" className={styles.btnPrimary} onClick={ejecutarSimulacion}>
              <span aria-hidden="true">▶</span> Simular ahora
            </button>
          </div>

          {resultados && (
            <>
              <div className={styles.barChart}>
                {/* Barra "Cambiando siempre" */}
                <div className={styles.barRow}>
                  <span className={styles.barLabel}><span aria-hidden="true">🔄</span> Cambiando siempre</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFillPrimary}
                      style={{ width: `${barWidthCambio}%` }}
                      role="progressbar"
                      aria-valuenow={barWidthCambio}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className={styles.barValue}>{pctCambio} %</span>
                </div>
                {/* Barra "Sin cambiar" */}
                <div className={styles.barRow}>
                  <span className={styles.barLabel}><span aria-hidden="true">🔒</span> Sin cambiar</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFillSecondary}
                      style={{ width: `${barWidthSinCambio}%` }}
                      role="progressbar"
                      aria-valuenow={barWidthSinCambio}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className={styles.barValue}>{pctSinCambio} %</span>
                </div>
              </div>

              <div className={styles.resultsGrid}>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{resultados.victoriasConCambio.toLocaleString('es-ES')}</span>
                  <span className={styles.resultLabel}>Victorias cambiando</span>
                  <span className={styles.resultSub}>Esperado teórico: {Math.round(resultados.total * 2 / 3).toLocaleString('es-ES')}</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{resultados.victoriasSinCambio.toLocaleString('es-ES')}</span>
                  <span className={styles.resultLabel}>Victorias sin cambiar</span>
                  <span className={styles.resultSub}>Esperado teórico: {Math.round(resultados.total / 3).toLocaleString('es-ES')}</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultValue}>{resultados.total.toLocaleString('es-ES')}</span>
                  <span className={styles.resultLabel}>Simulaciones totales</span>
                  <span className={styles.resultSub}>Mitad con cambio · Mitad sin cambio</span>
                </div>
              </div>

              <p className={styles.sesionHint}>
                La <strong>ley de los grandes números</strong> predice que al aumentar N, los porcentajes se acercarán a los valores teóricos: <strong>66,7 %</strong> y <strong>33,3 %</strong>.
              </p>
            </>
          )}
        </div>
      )}

      {/* ================================================
          BLOQUE EDUCATIVO v2.0
      ================================================ */}
      <EducationalSection
        title="Aprende sobre el Problema de Monty Hall"
        subtitle="Por qué la intuición nos engaña y cómo la probabilidad condicional lo explica"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es el Problema de Monty Hall?</h3>
          <p>
            El <strong>Problema de Monty Hall</strong> toma su nombre del presentador del concurso
            televisivo estadounidense <em>Let&apos;s Make a Deal</em>. La situación es aparentemente sencilla:
            hay tres puertas, detrás de una hay un coche y detrás de las otras dos hay cabras.
            El concursante elige una puerta; después, el presentador (que sabe dónde está el coche)
            abre <em>otra</em> puerta revelando una cabra; finalmente el concursante puede quedarse
            con su elección o cambiar a la puerta que queda cerrada.
          </p>
          <p>
            La pregunta es: <strong>¿conviene cambiar?</strong> La respuesta sorprende a casi todo el mundo:
            sí, <strong>cambiar dobla la probabilidad de ganar</strong>. No es un truco, es matemática.
          </p>
          <div className={styles.formulaBox}>
            P(ganar | cambia) = 2/3 ≈ 66,7 %&nbsp;&nbsp;&nbsp;&nbsp;P(ganar | no cambia) = 1/3 ≈ 33,3 %
          </div>
        </section>

        {/* TABLA COMPARATIVA */}
        <section>
          <h3>Comparativa de estrategias</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Estrategia</th>
                  <th>Probabilidad de ganar</th>
                  <th>En 1.000 partidas</th>
                  <th>Intuición habitual</th>
                  <th>¿Es óptima?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cambiar siempre</strong></td>
                  <td>2/3 ≈ 66,7 %</td>
                  <td>~667 victorias</td>
                  <td>Parece arriesgado</td>
                  <td>✅ Sí</td>
                </tr>
                <tr>
                  <td>No cambiar nunca</td>
                  <td>1/3 ≈ 33,3 %</td>
                  <td>~333 victorias</td>
                  <td>Parece &quot;leal&quot; a tu elección</td>
                  <td>❌ No</td>
                </tr>
                <tr>
                  <td>Cambiar aleatoriamente</td>
                  <td>1/2 = 50,0 %</td>
                  <td>~500 victorias</td>
                  <td>Parece justo</td>
                  <td>⚠️ Intermedia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios que ayudan a entender el problema</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚪</span>
              <strong>Con 100 puertas</strong>
              <p>Imagina 100 puertas, solo una con coche. Eliges la número 37. Monty abre 98 puertas con cabras y deja cerrada la número 82. ¿Cambiarías? La probabilidad de que el coche esté en la 82 es del 99 %. Con solo 3 puertas el efecto es idéntico, aunque menos obvio.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎲</span>
              <strong>Monty elige aleatoriamente</strong>
              <p>Si Monty abriera una puerta <em>al azar</em> (y a veces revelara el coche por error), la probabilidad de ganar cambiando sí sería del 50 %. El problema clave es que Monty <em>siempre sabe</em> dónde está el coche y <em>nunca</em> lo revela. Esa información asimétrica lo cambia todo.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏆</span>
              <strong>En un concurso real</strong>
              <p>Marilyn vos Savant publicó la solución correcta en 1990 en <em>Parade Magazine</em>. Recibió más de 10.000 cartas de protesta, incluidas cientos de matemáticos. Una columna de respuesta con simulaciones físicas demostró que tenía razón. Hoy es uno de los ejemplos más citados de sesgo de confirmación.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📐</span>
              <strong>Versión generalizada: k puertas</strong>
              <p>Con k puertas, si Monty abre m de ellas (todas con cabras), la probabilidad de ganar cambiando es (k−1) / [k·(k−1−m)]. Con k=3 y m=1 obtenemos 2/3. Con k=100 y m=98 obtenemos 99/100. El principio es siempre el mismo: Monty transfiere información.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre el Problema de Monty Hall</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué no es 50/50 si quedan dos puertas?</h4>
              <p>
                Porque las dos puertas no tienen la misma historia. Al inicio elegiste con 1/3 de probabilidad.
                Esa probabilidad <em>no desaparece</em> porque Monty abra una puerta. La puerta que elegiste
                sigue teniendo probabilidad 1/3 y la restante concentra los 2/3 que antes estaban repartidos
                entre las otras dos. Quedan dos puertas físicas, pero su peso probabilístico es diferente.
              </p>
              <p className={styles.faqTip}>
                💡 Piénsalo así: si eligieras aleatoriamente entre las dos puertas restantes, sí sería 50/50.
                Pero &quot;no cambiar&quot; no es elegir aleatoriamente: es quedarte con tu elección original, que siempre tuvo 1/3.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué sabía Monty que el concursante no sabía?</h4>
              <p>
                Monty sabía exactamente dónde estaba el coche. Esta información asimétrica es la clave.
                Su acción (abrir una puerta con cabra) no es aleatoria: es siempre deliberada y restringida.
                Al actuar así, transfiere probabilidad implícita a la puerta que no abre.
                Si Monty eligiera al azar y a veces abriera el coche, el problema sería diferente.
              </p>
              <p className={styles.faqTip}>
                💡 Esta asimetría de información aparece constantemente en economía (mercados, subastas),
                medicina (diagnósticos diferenciales) y teoría de juegos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo lo demostró Marilyn vos Savant?</h4>
              <p>
                Vos Savant propuso un experimento mental: si 300 personas juegan siempre cambiando
                y 300 nunca cambian, al contarlo el primer grupo debería tener ~200 victorias y el segundo ~100.
                También se hicieron experimentos físicos con estudiantes, y los resultados confirmaron 2/3 vs 1/3.
                Hoy puedes reproducirlo con este simulador en segundos.
              </p>
              <p className={styles.faqTip}>
                💡 El debate de 1990–1991 es un caso de libro de texto sobre cómo la intuición humana falla
                sistemáticamente con la probabilidad condicional.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la probabilidad condicional y cómo se aplica aquí?</h4>
              <p>
                La probabilidad condicional P(A|B) mide la probabilidad de A dado que B ha ocurrido.
                En el problema de Monty Hall: P(coche en puerta 2 | Monty abre puerta 3) se calcula
                con el teorema de Bayes. El resultado es 2/3, no 1/2. El evento &quot;Monty abre la puerta 3&quot;
                actualiza nuestras creencias sobre dónde está el coche, y lo hace de forma asimétrica.
              </p>
              <p className={styles.faqTip}>
                💡 Bayes: P(coche en j | Monty abre k) = P(Monty abre k | coche en j) · P(coche en j) / P(Monty abre k).
                Para la puerta no elegida, P(Monty abre k | coche en j) = 1 (Monty siempre abre la única cabra disponible),
                lo que eleva la probabilidad posterior a 2/3.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cambia la respuesta si hay más puertas o más coches?</h4>
              <p>
                Sí. Con k puertas, c coches y m puertas abiertas por Monty (todas con cabras), la probabilidad
                de ganar cambiando es mayor que no cambiando siempre que c/k &lt; 1 (no todos los premios son coches)
                y m ≥ 1. La intuición del 50/50 solo funciona cuando la información que proporciona Monty
                es completamente aleatoria y simétrica, lo que no ocurre en el problema original.
              </p>
              <p className={styles.faqTip}>
                💡 En el caso límite c = k−1 (solo una cabra), cambiar siempre pierde: Monty revelaría
                k−2 coches y la única cabra estaría en la puerta que no elegiste. Aquí sí conviene quedarse.
              </p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo razonar el Problema de Monty Hall paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Calcula la probabilidad inicial</strong>
                <p>Al elegir una puerta al azar entre tres, la probabilidad de acertar es 1/3.
                La probabilidad de que el coche esté en una de las otras dos es 2/3. Anótatelo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Observa qué hace Monty</strong>
                <p>Monty siempre abre una puerta con cabra que no es la tuya. No actúa al azar:
                sabe dónde está el coche y su acción está restringida. Esto transfiere información.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica el teorema de Bayes</strong>
                <p>La probabilidad de tu puerta original (1/3) no cambia porque Monty abre otra.
                La probabilidad total de 2/3 que había en las otras dos puertas ahora se concentra
                en la única puerta que Monty dejó cerrada.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Toma la decisión óptima</strong>
                <p>Cambiar siempre: probabilidad 2/3. Quedarte siempre: 1/3. Si quieres maximizar
                tus ganancias a largo plazo, la respuesta racional es cambiar en cada partida.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con simulación</strong>
                <p>La ley de los grandes números garantiza que con suficientes partidas los porcentajes
                observados convergen a los teóricos. Usa el modo automático de este simulador:
                con 10.000 simulaciones obtendrás resultados muy cercanos a 66,7 % y 33,3 %.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 claves para ganar en situaciones similares</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <strong>Identifica quién tiene información asimétrica</strong>
              <p>En cualquier juego o negociación, si alguien que sabe más que tú te da una opción,
              esa opción lleva información implícita. Actualiza tus probabilidades según sus acciones, no solo sus palabras.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Confía en la estadística, no en la intuición</strong>
              <p>El cerebro humano sobrevalora la &quot;lealtad&quot; a la primera elección (efecto dotación).
              En probabilidad pura, lo que elegiste antes no tiene valor sentimental: solo importan las probabilidades actualizadas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <strong>Simula antes de decidir en la vida real</strong>
              <p>Ante decisiones bajo incertidumbre, puedes modelar el problema con simulaciones rápidas.
              Una hoja de cálculo o unos minutos de código son suficientes para validar si tu intuición coincide con los datos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <strong>Recuerda que más opciones ≠ más información</strong>
              <p>Que queden dos puertas no significa que cada una tenga 50 % de probabilidad.
              La distribución de probabilidades depende del proceso que generó la situación, no del número de opciones visibles.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores conceptuales frecuentes con el Problema de Monty Hall</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>El error del 50/50</strong> — &quot;Quedan dos puertas, así que cada una tiene el 50 %.&quot;
              Falso: la puerta original sigue teniendo 1/3 y la alternativa 2/3.
              Las probabilidades no se recalculan ignorando la historia del problema.
            </li>
            <li>
              <strong>Confundir &quot;nueva información&quot; con &quot;resetear probabilidades&quot;</strong> —
              Cuando Monty abre una puerta, aporta información que actualiza las probabilidades asimétricamente,
              no uniformemente. No es lo mismo que empezar de cero con dos puertas.
            </li>
            <li>
              <strong>Asumir que el anfitrión actúa aleatoriamente</strong> —
              Si Monty eligiera la puerta al azar (y pudiera revelar el coche), la situación sí sería 50/50.
              La restricción de que <em>nunca</em> revela el coche es esencial para que cambiar sea mejor.
            </li>
            <li>
              <strong>Generalizar mal el problema</strong> —
              El resultado 2/3 es específico de 3 puertas y 1 apertura. Con más puertas o más aperturas
              las probabilidades cambian. No aplicar la fórmula de 3 puertas a contextos distintos sin recalcular.
            </li>
            <li>
              <strong>Confundir probabilidad con certeza</strong> —
              Cambiar da 2/3 de probabilidad, no garantía. En cualquier partida individual puedes perder
              cambiando. La ventaja es estadística y se manifiesta en el largo plazo (ley de los grandes números).
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-monty-hall')} />
      <ShareCard appName="simulador-monty-hall" />
      <Footer appName="simulador-monty-hall" />
    </div>
  );
}
