'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorCalendarioLiga.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

interface Enfrentamiento {
  local: string;
  visitante: string;
}

interface Jornada {
  numero: number;
  vuelta: 1 | 2;
  enfrentamientos: Enfrentamiento[];
  descansa: string | null;
}

interface Calendario {
  jornadas: Jornada[];
  participantes: string[];
  totalPartidos: number;
  semilla: number;
}

const DESCANSO = '__DESCANSO__';
const MAX_PARTICIPANTES = 24;

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador con semilla: el mismo número de sorteo produce siempre el mismo calendario */
function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Método del círculo: se fija el primer participante y los demás rotan.
 * Garantiza que cada uno se enfrenta exactamente una vez a cada rival.
 */
function generarCalendario(participantes: string[], idaYVuelta: boolean, semilla: number): Calendario {
  const aleatorio = crearAleatorio(semilla);
  const sorteados = barajar(participantes, aleatorio);

  // Con número impar se añade un puesto ficticio: quien se empareje con él, descansa
  const lista = sorteados.length % 2 === 0 ? [...sorteados] : [...sorteados, DESCANSO];
  const total = lista.length;
  const rondas = total - 1;

  const jornadas: Jornada[] = [];
  let orden = [...lista];

  for (let ronda = 0; ronda < rondas; ronda++) {
    const enfrentamientos: Enfrentamiento[] = [];
    let descansa: string | null = null;

    for (let i = 0; i < total / 2; i++) {
      let local = orden[i];
      let visitante = orden[total - 1 - i];

      // Alternar la condición de local para que nadie encadene salidas
      if (ronda % 2 === 1) {
        [local, visitante] = [visitante, local];
      }

      if (local === DESCANSO) {
        descansa = visitante;
      } else if (visitante === DESCANSO) {
        descansa = local;
      } else {
        enfrentamientos.push({ local, visitante });
      }
    }

    jornadas.push({ numero: ronda + 1, vuelta: 1, enfrentamientos, descansa });

    // Rotación: el primero queda fijo y el resto gira una posición
    orden = [orden[0], orden[total - 1], ...orden.slice(1, total - 1)];
  }

  if (idaYVuelta) {
    const vuelta: Jornada[] = jornadas.map((jornada, i) => ({
      numero: rondas + i + 1,
      vuelta: 2,
      descansa: jornada.descansa,
      enfrentamientos: jornada.enfrentamientos.map((e) => ({
        local: e.visitante,
        visitante: e.local,
      })),
    }));
    jornadas.push(...vuelta);
  }

  const totalPartidos = jornadas.reduce((suma, j) => suma + j.enfrentamientos.length, 0);

  return { jornadas, participantes: sorteados, totalPartidos, semilla };
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorCalendarioLigaPage() {
  const [titulo, setTitulo] = useState('Liga');
  const [entrada, setEntrada] = useState(
    'Los Invencibles\nAtlético Sofá\nRayo Vallecas\nDeportivo Merienda\nUnión Tardía\nCD Reservas',
  );
  const [idaYVuelta, setIdaYVuelta] = useState(false);
  const [semillaManual, setSemillaManual] = useState('');
  const [calendario, setCalendario] = useState<Calendario | null>(null);
  const [aviso, setAviso] = useState('');

  const participantes = useCallback((): string[] => {
    const limpios = entrada
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    return Array.from(new Set(limpios)).slice(0, MAX_PARTICIPANTES);
  }, [entrada]);

  const generar = useCallback(() => {
    const lista = participantes();

    if (lista.length < 3) {
      setAviso('Hacen falta al menos tres participantes, uno por línea.');
      setCalendario(null);
      return;
    }

    const base = Number(semillaManual.replace(/\D/g, ''));
    const semilla = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;

    setCalendario(generarCalendario(lista, idaYVuelta, semilla));
    setAviso('');
  }, [participantes, idaYVuelta, semillaManual]);

  const numParticipantes = participantes().length;

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🏆</span> Generador de Calendario de Liga
          </h1>
          <p className={styles.subtitle}>
            Todos contra todos en jornadas equilibradas. Escribe los participantes y llévate el
            calendario y la clasificación al papel.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Configura la liga
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nombre de la liga</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={50}
                placeholder="Liga"
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>
                Participantes <small>(uno por línea · {numParticipantes} detectados)</small>
              </span>
              <textarea
                className={styles.textarea}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                rows={9}
                placeholder={'Equipo 1\nEquipo 2\nEquipo 3'}
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Formato</span>
              <div className={styles.grupoBotones} role="group" aria-label="Formato de la liga">
                <button
                  type="button"
                  className={`${styles.btnOpcion} ${!idaYVuelta ? styles.btnOpcionActivo : ''}`}
                  aria-pressed={!idaYVuelta}
                  onClick={() => setIdaYVuelta(false)}
                >
                  <strong>Solo ida</strong>
                  <small>Cada pareja se enfrenta una vez</small>
                </button>
                <button
                  type="button"
                  className={`${styles.btnOpcion} ${idaYVuelta ? styles.btnOpcionActivo : ''}`}
                  aria-pressed={idaYVuelta}
                  onClick={() => setIdaYVuelta(true)}
                >
                  <strong>Ida y vuelta</strong>
                  <small>Doble enfrentamiento, uno en cada campo</small>
                </button>
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nº de sorteo (opcional)</span>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={semillaManual}
                onChange={(e) => setSemillaManual(e.target.value)}
                placeholder="Al azar"
                maxLength={7}
              />
            </label>

            <button type="button" className={styles.btnPrimary} onClick={generar}>
              <span aria-hidden="true">✨</span> Generar calendario
            </button>

            {aviso && (
              <p className={styles.aviso} role="alert" aria-live="polite">
                {aviso}
              </p>
            )}
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">📊</span> Resumen de la competición
            </h2>

            {!calendario ? (
              <p className={styles.vacio}>
                Escribe los participantes (mínimo tres, máximo {MAX_PARTICIPANTES}) y pulsa{' '}
                <strong>Generar</strong>. Verás el calendario completo debajo, listo para imprimir.
              </p>
            ) : (
              <>
                <div className={styles.metricas}>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{calendario.participantes.length}</span>
                    <span className={styles.metricaEtiqueta}>participantes</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{calendario.jornadas.length}</span>
                    <span className={styles.metricaEtiqueta}>jornadas</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>
                      {formatNumber(calendario.totalPartidos, 0)}
                    </span>
                    <span className={styles.metricaEtiqueta}>partidos en total</span>
                  </div>
                </div>

                <p className={styles.resumen}>
                  Sorteo n.º <strong>{calendario.semilla}</strong>
                  {calendario.participantes.length % 2 !== 0 && (
                    <> · número impar: en cada jornada descansa uno</>
                  )}
                </p>

                <div className={styles.acciones}>
                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir calendario
                  </button>
                  <button type="button" className={styles.btnSecundario} onClick={generar}>
                    <span aria-hidden="true">🔄</span> Repetir sorteo
                  </button>
                </div>

                <p className={styles.pista}>
                  La hoja impresa incluye una tabla de clasificación en blanco para ir anotando
                  resultados a mano durante la temporada.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {calendario && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <h2 className={styles.tituloHoja}>{titulo || 'Liga'}</h2>

          <div className={styles.jornadasGrid}>
            {calendario.jornadas.map((jornada) => (
              <div key={`${jornada.vuelta}-${jornada.numero}`} className={`${styles.jornada} ${impresion.bloque}`}>
                <h3 className={styles.jornadaTitulo}>
                  Jornada {jornada.numero}
                  {idaYVuelta && <span className={styles.vueltaEtiqueta}> · {jornada.vuelta}ª vuelta</span>}
                </h3>
                <ul className={styles.listaPartidos}>
                  {jornada.enfrentamientos.map((e, i) => (
                    <li key={i} className={styles.partido}>
                      <span className={styles.equipoLocal}>{e.local}</span>
                      <span className={styles.marcador}>___ - ___</span>
                      <span className={styles.equipoVisitante}>{e.visitante}</span>
                    </li>
                  ))}
                </ul>
                {jornada.descansa && <p className={styles.descansa}>Descansa: {jornada.descansa}</p>}
              </div>
            ))}
          </div>

          <h3 className={styles.tituloClasificacion}>Clasificación</h3>
          <table className={`${styles.tablaClasificacion} ${impresion.bloque} ${impresion.rejilla}`}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Participante</th>
                <th scope="col">PJ</th>
                <th scope="col">G</th>
                <th scope="col">E</th>
                <th scope="col">P</th>
                <th scope="col">A favor</th>
                <th scope="col">En contra</th>
                <th scope="col">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {calendario.participantes.map((p, i) => (
                <tr key={p}>
                  <td>{i + 1}</td>
                  <td className={styles.celdaNombre}>{p}</td>
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ))}
            </tbody>
          </table>

          <p className={styles.pieHoja}>
            Sorteo n.º {calendario.semilla} · {calendario.jornadas.length} jornadas ·{' '}
            {calendario.totalPartidos} partidos · meskeia.com
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Cómo se arma una liga que no se atasque"
          subtitle="El método del círculo, los números que conviene calcular antes y los fallos que arruinan una temporada"
        >
          <section className={styles.guideSection}>
            <h2>El método del círculo</h2>
            <p>
              Repartir a mano los enfrentamientos de una liga acaba casi siempre en el mismo problema:
              alguien juega dos veces contra el mismo rival y otro se queda sin jugar contra alguno. El
              procedimiento clásico para evitarlo es el <strong>método del círculo</strong>: se colocan
              los participantes en dos filas enfrentadas, se fija uno de ellos y los demás rotan una
              posición en cada jornada. Al cabo de tantas rondas como participantes menos uno, todas las
              parejas posibles se han enfrentado exactamente una vez.
            </p>
            <p>
              Cuando el número es impar se añade un puesto ficticio de descanso. Quien se empareja con él
              esa jornada no juega, y la rotación garantiza que el descanso vaya pasando por todos sin
              que nadie repita antes de que le haya tocado al resto.
            </p>

            <h2>Los números antes de empezar</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Participantes</th>
                    <th>Jornadas (una vuelta)</th>
                    <th>Partidos (una vuelta)</th>
                    <th>Partidos (ida y vuelta)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>4</strong>
                    </td>
                    <td>3</td>
                    <td>6</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>6</strong>
                    </td>
                    <td>5</td>
                    <td>15</td>
                    <td>30</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>8</strong>
                    </td>
                    <td>7</td>
                    <td>28</td>
                    <td>56</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>10</strong>
                    </td>
                    <td>9</td>
                    <td>45</td>
                    <td>90</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>12</strong>
                    </td>
                    <td>11</td>
                    <td>66</td>
                    <td>132</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>16</strong>
                    </td>
                    <td>15</td>
                    <td>120</td>
                    <td>240</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              La cifra que suele sorprender es la del total: el número de partidos crece con el cuadrado
              de los participantes, no de forma proporcional. Pasar de ocho a dieciséis equipos no dobla
              la competición, la multiplica por más de cuatro. Antes de aceptar al último inscrito
              conviene mirar esa columna y contar cuántas semanas hay disponibles.
            </p>

            <h2>Tres competiciones típicas</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎾
                  </span>
                  <h3>Liga de pádel o tenis entre amigos</h3>
                </div>
                <p>
                  Con seis u ocho parejas y una pista disponible por semana, la liga a una vuelta cabe en
                  un trimestre. Imprimir el calendario completo desde el primer día evita el clásico
                  grupo de mensajes preguntando quién juega contra quién.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    ⚽
                  </span>
                  <h3>Torneo de fútbol sala en el trabajo</h3>
                </div>
                <p>
                  Con número impar de equipos, la jornada de descanso resulta muy práctica: el equipo que
                  descansa se encarga del arbitraje o del control del tiempo, y así nadie se queda sin
                  ir.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎮
                  </span>
                  <h3>Liga de juegos de mesa o consola</h3>
                </div>
                <p>
                  Funciona igual con personas que con equipos: basta escribir los nombres. La tabla de
                  clasificación en blanco sirve para anotar puntos de cualquier sistema, no solo goles.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Conviene liga única o grupos?
                </h4>
                <p>
                  La referencia práctica está en torno a los doce participantes. Por debajo, la liga única
                  es más justa porque todos se miden con todos. Por encima, el calendario se alarga tanto
                  que la competición muere por abandono antes de terminar; en ese caso es preferible
                  dividir en dos grupos y jugar después una fase final entre los mejores de cada uno.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Cómo se reparten los puntos?
                </h4>
                <p>
                  El sistema más extendido en deportes de equipo es tres puntos por victoria, uno por
                  empate y cero por derrota, que premia ganar frente a especular. En deportes sin empate,
                  como el pádel o el tenis, basta dos por victoria y cero por derrota, y los desempates se
                  resuelven por diferencia de juegos o sets. Conviene fijarlo por escrito antes de la
                  primera jornada, no cuando ya hay dos empatados en cabeza.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Y si alguien abandona a mitad de liga?
                </h4>
                <p>
                  La solución más limpia y la que menos discusiones genera es anular todos sus resultados,
                  tanto los jugados como los pendientes, para que ningún rival salga beneficiado por haber
                  jugado contra él antes del abandono. La alternativa —dar por perdidos los partidos que
                  le quedaban— reparte victorias regaladas de forma desigual según el calendario.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué anotar el número de sorteo?
                </h4>
                <p>
                  Porque permite reproducir el calendario exacto en cualquier momento. Si se pierde la
                  hoja impresa, basta volver a introducir la misma lista de participantes con ese número
                  para recuperarlo idéntico. También sirve como prueba de que el sorteo no se rehízo a
                  mitad de temporada para favorecer a alguien.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores que arruinan una liga amateur</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>No calcular las semanas disponibles:</strong> doce participantes a ida y vuelta
                  son ciento treinta y dos partidos; si solo hay una pista los sábados, la liga no termina
                  en un año.
                </li>
                <li>
                  <strong>Improvisar el reglamento sobre la marcha:</strong> los criterios de desempate
                  deben estar escritos antes de la primera jornada, no cuando ya hay dos equipos igualados
                  arriba.
                </li>
                <li>
                  <strong>Aceptar inscritos con el calendario ya sorteado:</strong> añadir a alguien obliga
                  a rehacerlo entero, porque el método del círculo reparte todas las jornadas a la vez.
                </li>
                <li>
                  <strong>Olvidar quién descansa:</strong> con número impar hay que avisar expresamente cada
                  jornada, o alguien se presentará sin partido.
                </li>
                <li>
                  <strong>Dejar los resultados en un chat:</strong> la clasificación se pierde entre mensajes;
                  una hoja impresa en la pared o una tabla compartida evita la mitad de las discusiones.
                </li>
                <li>
                  <strong>Perder el número de sorteo:</strong> sin él, reimprimir genera un calendario distinto
                  al que ya está en juego.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-calendario-liga')} />

        <ShareCard appName="generador-calendario-liga" />

        <Footer appName="generador-calendario-liga" />
      </div>
    </div>
  );
}
