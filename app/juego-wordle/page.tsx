'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './JuegoWordle.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/**
 * Pool de palabras del día (~530 palabras curadas) y diccionario completo de
 * validación (~87k lemas, Lemario General del Español de Ismael Olea, dominio
 * público — https://github.com/olea/lemarios) servidos como archivos estáticos.
 */
const POOL_URL = '/data/palabras-wordle.txt';
const DICT_URL = '/data/diccionario-es.txt';
const POOL_CACHE_KEY = 'meskeia_wordle_pool_v1';
const DICT_CACHE_KEY = 'meskeia_dict_es_v1';

// Normaliza para comparar: mayúsculas + sin tildes (el wordle juega sin tildes)
const normalizar = (s: string): string =>
  s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');


type Estado = 'correcto' | 'presente' | 'ausente' | 'vacio';

interface Letra {
  char: string;
  estado: Estado;
}

// Evaluar intento
const evaluarIntento = (intento: string, palabra: string): Letra[] => {
  const resultado: Letra[] = [];
  const palabraArray = palabra.split('');
  const intentoArray = intento.split('');
  const usadas = new Array(5).fill(false);

  // Primero marcar correctos
  for (let i = 0; i < 5; i++) {
    if (intentoArray[i] === palabraArray[i]) {
      resultado[i] = { char: intentoArray[i], estado: 'correcto' };
      usadas[i] = true;
    }
  }

  // Luego marcar presentes y ausentes
  for (let i = 0; i < 5; i++) {
    if (resultado[i]) continue;

    const char = intentoArray[i];
    let encontrado = false;

    for (let j = 0; j < 5; j++) {
      if (!usadas[j] && palabraArray[j] === char) {
        resultado[i] = { char, estado: 'presente' };
        usadas[j] = true;
        encontrado = true;
        break;
      }
    }

    if (!encontrado) {
      resultado[i] = { char, estado: 'ausente' };
    }
  }

  return resultado;
};

const TECLADO = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function JuegoWordlePage() {
  const [palabra, setPalabra] = useState('');
  const [intentos, setIntentos] = useState<Letra[][]>([]);
  const [intentoActual, setIntentoActual] = useState('');
  const [ganado, setGanado] = useState(false);
  const [perdido, setPerdido] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [estadoTeclas, setEstadoTeclas] = useState<Record<string, Estado>>({});
  const [palabrasPool, setPalabrasPool] = useState<string[]>([]);
  const [dictionarySet, setDictionarySet] = useState<Set<string> | null>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Cargar pool de palabras del día desde /data/palabras-wordle.txt
  useEffect(() => {
    const cached = sessionStorage.getItem(POOL_CACHE_KEY);
    if (cached) {
      setPalabrasPool(cached.split('\n').filter(Boolean));
      return;
    }
    fetch(POOL_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const arr = text.split('\n').filter(Boolean);
        setPalabrasPool(arr);
        try { sessionStorage.setItem(POOL_CACHE_KEY, text); } catch { /* sessionStorage lleno */ }
      })
      .catch(() => setLoadStatus('error'));
  }, []);

  // Cargar diccionario completo (~87k lemas) para validación del input
  useEffect(() => {
    const procesar = (text: string): Set<string> => {
      const set = new Set<string>();
      for (const word of text.split('\n')) {
        if (word.length === 5) set.add(normalizar(word));
      }
      return set;
    };

    const cached = sessionStorage.getItem(DICT_CACHE_KEY);
    if (cached) {
      setDictionarySet(procesar(cached));
      return;
    }
    fetch(DICT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setDictionarySet(procesar(text));
        try { sessionStorage.setItem(DICT_CACHE_KEY, text); } catch { /* sessionStorage lleno */ }
      })
      .catch(() => {
        // Si el diccionario falla, el juego sigue funcionando sin validación
        setDictionarySet(new Set());
      });
  }, []);

  // Calcular palabra del día cuando el pool está cargado
  useEffect(() => {
    if (palabrasPool.length === 0) return;
    const inicio = new Date('2024-01-01').getTime();
    const hoy = new Date().setHours(0, 0, 0, 0);
    const dias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    setPalabra(palabrasPool[dias % palabrasPool.length]);
    setLoadStatus('ready');
  }, [palabrasPool]);

  // Set combinado: pool ∪ diccionario. El pool contiene plurales (CASAS, AGUAS)
  // que no aparecen como lemas en el diccionario pero son palabras válidas.
  const palabrasValidas = useMemo(() => {
    if (!dictionarySet || dictionarySet.size === 0) return null;
    const set = new Set(dictionarySet);
    for (const p of palabrasPool) set.add(p);
    return set;
  }, [dictionarySet, palabrasPool]);

  // Cargar estado guardado
  useEffect(() => {
    const hoy = new Date().toDateString();
    const saved = localStorage.getItem('wordle-state');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.fecha === hoy) {
        setIntentos(data.intentos);
        setGanado(data.ganado);
        setPerdido(data.perdido);
        setEstadoTeclas(data.estadoTeclas || {});
      }
    }
  }, []);

  // Guardar estado
  useEffect(() => {
    const hoy = new Date().toDateString();
    localStorage.setItem('wordle-state', JSON.stringify({
      fecha: hoy,
      intentos,
      ganado,
      perdido,
      estadoTeclas,
    }));
  }, [intentos, ganado, perdido, estadoTeclas]);

  // Mostrar mensaje temporal
  const mostrarMensaje = useCallback((msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 2000);
  }, []);

  // Enviar intento
  const enviarIntento = useCallback(() => {
    if (intentoActual.length !== 5) {
      mostrarMensaje('La palabra debe tener 5 letras');
      return;
    }

    // Validar que el intento existe como palabra del español
    if (palabrasValidas && !palabrasValidas.has(intentoActual)) {
      mostrarMensaje('Esa palabra no está en el diccionario');
      return;
    }

    const resultado = evaluarIntento(intentoActual, palabra);
    const nuevosIntentos = [...intentos, resultado];
    setIntentos(nuevosIntentos);

    // Actualizar estado de teclas
    const nuevoEstado = { ...estadoTeclas };
    resultado.forEach(({ char, estado }) => {
      const estadoActual = nuevoEstado[char];
      if (estado === 'correcto' || !estadoActual) {
        nuevoEstado[char] = estado;
      } else if (estado === 'presente' && estadoActual !== 'correcto') {
        nuevoEstado[char] = estado;
      }
    });
    setEstadoTeclas(nuevoEstado);

    if (intentoActual === palabra) {
      setGanado(true);
      mostrarMensaje('🎉 ¡Excelente!');
    } else if (nuevosIntentos.length >= 6) {
      setPerdido(true);
      mostrarMensaje(`La palabra era: ${palabra}`);
    }

    setIntentoActual('');
  }, [intentoActual, palabra, intentos, estadoTeclas, mostrarMensaje, palabrasValidas]);

  // Manejar tecla
  const handleTecla = useCallback((tecla: string) => {
    if (ganado || perdido) return;
    if (loadStatus !== 'ready') return;

    if (tecla === 'ENTER') {
      enviarIntento();
    } else if (tecla === '⌫' || tecla === 'BACKSPACE') {
      setIntentoActual(prev => prev.slice(0, -1));
    } else if (tecla.length === 1 && /[A-ZÑ]/.test(tecla) && intentoActual.length < 5) {
      setIntentoActual(prev => prev + tecla);
    }
  }, [ganado, perdido, enviarIntento, intentoActual, loadStatus]);

  // Teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-ZÑ]$/.test(key)) {
        e.preventDefault();
        handleTecla(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTecla]);

  // Renderizar tablero
  const renderTablero = () => {
    const filas = [];
    for (let i = 0; i < 6; i++) {
      const celdas = [];
      for (let j = 0; j < 5; j++) {
        let contenido = '';
        let estado: Estado = 'vacio';

        if (i < intentos.length) {
          contenido = intentos[i][j].char;
          estado = intentos[i][j].estado;
        } else if (i === intentos.length && j < intentoActual.length) {
          contenido = intentoActual[j];
        }

        celdas.push(
          <div
            key={j}
            className={`${styles.celda} ${styles[estado]} ${contenido ? styles.llena : ''}`}
          >
            {contenido}
          </div>
        );
      }
      filas.push(
        <div key={i} className={styles.fila}>
          {celdas}
        </div>
      );
    }
    return filas;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Wordle</h1>
        <p className={styles.subtitle}>
          Adivina la palabra de 5 letras en 6 intentos
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Indicador de carga */}
        {loadStatus === 'loading' && (
          <div className={styles.loadingBanner} role="status" aria-live="polite">
            Cargando palabra del día…
          </div>
        )}
        {loadStatus === 'error' && (
          <div className={styles.errorBanner} role="alert">
            No se pudo cargar el juego. Recarga la página para reintentar.
          </div>
        )}

        {/* Mensaje */}
        {mensaje && (
          <div className={styles.mensaje}>{mensaje}</div>
        )}

        {/* Tablero */}
        <div className={styles.tablero}>
          {renderTablero()}
        </div>

        {/* Teclado */}
        <div className={styles.teclado}>
          {TECLADO.map((fila, i) => (
            <div key={i} className={styles.tecladoFila}>
              {fila.map((tecla) => (
                <button
                  key={tecla}
                  onClick={() => handleTecla(tecla)}
                  className={`${styles.tecla} ${tecla.length > 1 ? styles.teclaEspecial : ''} ${estadoTeclas[tecla] ? styles[estadoTeclas[tecla]] : ''}`}
                  disabled={ganado || perdido}
                >
                  {tecla}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className={styles.leyenda}>
          <div className={styles.leyendaItem}>
            <span className={`${styles.ejemplo} ${styles.correcto}`}>A</span>
            <span>Letra correcta</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={`${styles.ejemplo} ${styles.presente}`}>B</span>
            <span>Letra en otra posición</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={`${styles.ejemplo} ${styles.ausente}`}>C</span>
            <span>Letra no está</span>
          </div>
        </div>
      </div>

      <EducationalSection
        title="¿Quieres dominar el Wordle en español?"
        subtitle="Estrategias, variantes, preguntas frecuentes y guía paso a paso para resolver cada palabra"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section>
          <h2>Variantes del Wordle: comparativa</h2>
          <p>
            El Wordle original se juega con 5 letras y 6 intentos, pero existen variantes
            que aumentan el reto o la diversión. Aquí las principales:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Letras</th>
                  <th>Intentos</th>
                  <th>Información revelada</th>
                  <th>Dificultad</th>
                  <th>Estrategia inicial</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Wordle clásico</td>
                  <td>5</td>
                  <td>6</td>
                  <td>Color por posición y presencia</td>
                  <td>Media</td>
                  <td>Palabra con 4-5 vocales distintas (AUDIO, REINA)</td>
                </tr>
                <tr>
                  <td>Wordle difícil</td>
                  <td>5</td>
                  <td>6</td>
                  <td>Igual, pero obliga a usar pistas</td>
                  <td>Alta</td>
                  <td>Máxima cobertura consonántica desde el turno 2</td>
                </tr>
                <tr>
                  <td>Wordle doble</td>
                  <td>5</td>
                  <td>7</td>
                  <td>Dos tableros simultáneos</td>
                  <td>Muy alta</td>
                  <td>Primera palabra que informe ambos tableros a la vez</td>
                </tr>
                <tr>
                  <td>Wordle ilimitado</td>
                  <td>5</td>
                  <td>6</td>
                  <td>Igual al clásico, sin límite diario</td>
                  <td>Media</td>
                  <td>Practicar con palabras poco frecuentes del español</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>Tres usos habituales del Wordle en español</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📖</span>
                <h4>Ejercicio diario de vocabulario</h4>
              </div>
              <p className={styles.escenarioExample}>
                Jugar una partida cada mañana activa el léxico pasivo: palabras que
                reconoces pero rara vez usas. El formato de pistas obliga a razonar
                sobre la estructura de las palabras.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: anota las palabras que no conocías y búscalas en el diccionario
                de la RAE para fijar su significado.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
                <h4>Reto compartido con amigos y familia</h4>
              </div>
              <p className={styles.escenarioExample}>
                Todos intentan adivinar la misma palabra del día. Al terminar, cada
                jugador comparte su resultado en emojis de colores para comparar
                estrategias sin revelar la solución.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: compartir el tablero de emojis permite comparar estrategias
                sin desvelar la palabra a quienes aún no han jugado.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔤</span>
                <h4>Aprendizaje de palabras poco frecuentes</h4>
              </div>
              <p className={styles.escenarioExample}>
                Palabras como ZARPA, SURCO o TARJA aparecen en el juego pero pocas
                veces en conversación cotidiana. El Wordle las incorpora de forma
                natural en el vocabulario activo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: si la palabra solución te era desconocida, es una oportunidad
                de aprendizaje, no un fracaso. El juego amplía el vocabulario jugando.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes sobre el Wordle</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la mejor primera palabra en español?</summary>
                <p>
                  Las mejores palabras iniciales cubren la mayor cantidad de letras
                  frecuentes del español. Palabras como <strong>AUDIO</strong>,{' '}
                  <strong>REINA</strong> o <strong>CAIRE</strong> incluyen 4-5 vocales
                  distintas (A, E, I, O, U) y consonantes habituales. Así, en el primer
                  intento ya sabrás qué vocales contiene la palabra objetivo.
                </p>
                <p className={styles.faqTip}>
                  Dato: las letras más frecuentes en palabras de 5 letras del español
                  son A, E, O, R, S, L, N, C, T.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué significan los colores verde, amarillo y gris?</summary>
                <p>
                  <strong>Verde (correcto):</strong> la letra está en la palabra y en
                  la posición exacta que la pusiste.
                  <br />
                  <strong>Amarillo (presente):</strong> la letra está en la palabra,
                  pero en una posición diferente.
                  <br />
                  <strong>Gris (ausente):</strong> la letra no aparece en ninguna
                  posición de la palabra objetivo.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántas palabras de 5 letras hay en español?</summary>
                <p>
                  El diccionario de la RAE contiene aproximadamente 8.000-10.000 palabras
                  de 5 letras. Sin embargo, los juegos de Wordle en español suelen
                  trabajar con un subconjunto de 2.000-3.000 palabras de uso común para
                  que las soluciones sean reconocibles por la mayoría de jugadores.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Existe estrategia para siempre resolver en 3-4 intentos?</summary>
                <p>
                  No existe una estrategia infalible, pero sí una que maximiza las
                  probabilidades: usar el intento 1 para cubrir vocales, el intento 2
                  para consonantes frecuentes no usadas, y a partir del intento 3,
                  aplicar razonamiento deductivo puro. Con buenas elecciones iniciales,
                  resolver en 3-4 intentos es lo habitual.
                </p>
                <p className={styles.faqTip}>
                  Consejo: en cada turno, elige la palabra que elimine el mayor número
                  de candidatas posibles, no la que crees que podría ser la solución.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué es el modo difícil?</summary>
                <p>
                  En el modo difícil, estás obligado a usar en cada intento todas las
                  letras que ya has confirmado (verdes y amarillas). No puedes probar
                  una palabra que ignore una letra verde ya confirmada. Esto elimina la
                  estrategia de usar &quot;palabras de descarte&quot; y obliga a jugar
                  con información incompleta desde el principio.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Estrategia en 5 pasos para resolver el Wordle</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Empieza con una palabra rica en vocales</strong>
                <p>
                  Usa AUDIO, REINA o EUROS como primera palabra. Estas palabras cubren
                  las cinco vocales del español (A, E, I, O, U) o muy cerca de eso,
                  revelando de inmediato cuáles vocales contiene la solución.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Usa el intento 2 para consonantes frecuentes</strong>
                <p>
                  En el segundo intento, prueba consonantes habituales que no hayas
                  usado: R, S, L, N, C, T. Una buena segunda palabra es TRINO, CLARO
                  o SALTO. Así cubres el espectro de consonantes más comunes del español.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Confirma la posición de las letras amarillas</strong>
                <p>
                  Una letra amarilla indica presencia pero posición incorrecta. En el
                  siguiente intento, coloca esa letra en una posición diferente. Nunca
                  repitas una letra amarilla en la misma posición: es intento desperdiciado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Elimina letras grises en todos los intentos siguientes</strong>
                <p>
                  Las letras grises no están en la palabra. Descártalas completamente.
                  Cada nuevo intento debe evitar todas las letras ya marcadas en gris.
                  Usar una letra gris de nuevo es perder una oportunidad valiosa.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>En los últimos intentos, prioriza información sobre acierto</strong>
                <p>
                  Si en el intento 4 o 5 aún tienes varias candidatas posibles, elige
                  la palabra que distinga mejor entre ellas, aunque no sea la que crees
                  que es la solución. Maximizar información aumenta las posibilidades
                  de acertar en el último intento.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>4 claves para mejorar tu puntuación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>Primera palabra con A, E, I, O</h4>
              <p>
                Las cuatro vocales principales cubren el 85 % de frecuencia vocálica
                en palabras de 5 letras. Una sola palabra que las incluya todas elimina
                la incertidumbre más básica desde el primer turno.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>No repitas letras descartadas</h4>
              <p>
                Cada letra gris es información confirmada: esa letra no existe en la
                palabra. Usarla de nuevo en otro intento significa perder ese turno
                sin ganar ningún dato nuevo. Es el error más frecuente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📍</span>
              <h4>En modo difícil, usa verdes en su posición</h4>
              <p>
                En modo difícil, las letras verdes deben mantenerse en su posición
                en todos los intentos siguientes. Planifica ya desde el turno 1 qué
                posiciones quieres confirmar para no quedarte sin opciones.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <h4>Maximiza información en cada turno</h4>
              <p>
                Antes de escribir, pregúntate: &quot;¿esta palabra me da nueva información
                aunque no sea la solución?&quot;. Un intento que confirma 3 letras nuevas
                vale más que uno que solo prueba si tu hipótesis actual es correcta.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que arruinan tu partida</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Repetir letras grises.</strong> Una letra gris confirma que
                no está en la palabra. Volver a usarla desperdicia un intento entero
                sin aportar ninguna información nueva.
              </li>
              <li>
                <strong>No usar letras amarillas en posición diferente.</strong> Una
                letra amarilla debe aparecer en el siguiente intento en otra posición.
                Ignorarla o repetirla en la misma posición es un error de deducción básico.
              </li>
              <li>
                <strong>Adivinar aleatoriamente sin lógica deductiva.</strong> Con 3
                intentos consumidos ya tienes mucha información. Escribir una palabra
                al azar en lugar de aplicar lo que sabes suele terminar en fracaso.
              </li>
              <li>
                <strong>Ignorar las letras verdes confirmadas.</strong> Una letra verde
                ocupa su posición de forma definitiva. Moverla o sustituirla en el
                siguiente intento descarta una certeza y reduce el espacio de búsqueda
                por la mitad innecesariamente.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-wordle')} />

      <ShareCard appName="juego-wordle" />
      <Footer appName="juego-wordle" />
    </div>
  );
}
