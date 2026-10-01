'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './CalculadoraJugadaScrabble.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { parseSpanishNumber } from '@/lib';
import {
  BONUS_ATRIL_COMPLETO,
  buscarJugadas,
  COMODIN,
  DIGRAFOS,
  DISTRIBUCION,
  FICHAS_ATRIL,
  LETRAS_SIMPLES,
  VALORES,
  type CasillaLetra,
  type Ficha,
  type Jugada,
  type Modo,
  type MultiplicadorLetra,
  type MultiplicadorPalabra,
  type PosicionBonus,
} from './motor';

/**
 * Calculadora de jugada óptima. Reutiliza el mismo lemario del español
 * (Ismael Olea, dominio público) que sirve al buscador de palabras por patrón.
 */
const DICT_URL = '/data/diccionario-es.txt';
const DICT_CACHE_KEY = 'meskeia_dict_es_v1';
const MARCADOR_CACHE_KEY = 'meskeia_scrabble_marcador_v1';
const MAX_JUGADORES = 4;

type DictStatus = 'loading' | 'ready' | 'error';

/** Una jugada ya anotada al marcador. Guarda el ÍNDICE del jugador, no su nombre,
 *  para que renombrarlo a mitad de partida no desligue el historial de su autor. */
interface JugadaAnotada {
  jugadorIndice: number;
  palabra: string;
  puntos: number;
  /** De dónde sale: de la lista de resultados (por defecto, también en partidas guardadas
   *  antes de existir el campo), un turno pasado o un cambio de fichas, o una anotación a mano. */
  tipo?: 'lista' | 'pasa' | 'manual';
}

interface MarcadorGuardado {
  jugadores?: string[];
  turno?: number;
  historial?: JugadaAnotada[];
}

/** La partida tal y como estaba antes de pulsar «Nueva partida», para poder recuperarla. */
interface PartidaBorrada {
  turno: number;
  historial: JugadaAnotada[];
}

/** Casillas de palabra que se pueden marcar. ×4 y ×9: la palabra pisa dos (art. 15 FISE). */
const OPCIONES_PALABRA: Array<{ valor: MultiplicadorPalabra; etiqueta: string }> = [
  { valor: 1, etiqueta: 'Normal' },
  { valor: 2, etiqueta: '×2 palabra' },
  { valor: 3, etiqueta: '×3 palabra' },
  { valor: 4, etiqueta: '×4 · dos dobles' },
  { valor: 9, etiqueta: '×9 · dos triples' },
];

/** Casillas de letra que puede pisar una misma palabra en la calculadora. */
const MAX_CASILLAS_LETRA = 3;

/** Puntos que admite la anotación a mano: negativos para el ajuste final de la partida. */
const PUNTOS_MANUAL_MIN = -500;
const PUNTOS_MANUAL_MAX = 2000;

/** Fichas agrupadas por valor, para la tabla de referencia. */
const GRUPOS_VALOR: Array<{ puntos: number; fichas: string[] }> = [
  { puntos: 1, fichas: ['A', 'E', 'O', 'I', 'S', 'N', 'R', 'U', 'L', 'T'] },
  { puntos: 2, fichas: ['D', 'G'] },
  { puntos: 3, fichas: ['C', 'B', 'M', 'P'] },
  { puntos: 4, fichas: ['H', 'F', 'V', 'Y'] },
  { puntos: 5, fichas: ['CH', 'Q'] },
  { puntos: 8, fichas: ['J', 'LL', 'Ñ', 'RR', 'X'] },
  { puntos: 10, fichas: ['Z'] },
];

/** «1 punto», «9 puntos», «−3 puntos». */
function puntosEnTexto(puntos: number): string {
  return `${puntos.toLocaleString('es-ES')} ${Math.abs(puntos) === 1 ? 'punto' : 'puntos'}`;
}

export default function CalculadoraJugadaScrabblePage() {
  const [modo, setModo] = useState<Modo>('digrafos');
  const [atril, setAtril] = useState<Ficha[]>([]);
  const [gancho, setGancho] = useState('');
  // Primera casilla de letra (1 = ninguna) y su posición; las demás van en `casillasExtra`.
  const [multLetra, setMultLetra] = useState<1 | MultiplicadorLetra>(1);
  const [posicionBonus, setPosicionBonus] = useState<PosicionBonus>('auto');
  const [casillasExtra, setCasillasExtra] = useState<CasillaLetra[]>([]);
  const [multPalabra, setMultPalabra] = useState<MultiplicadorPalabra>(1);

  const [jugadas, setJugadas] = useState<Jugada[]>([]);
  // La casilla de palabra con la que se calculó la lista: el desglose no debe cambiar si
  // después se toca el selector sin volver a buscar.
  const [multPalabraResultado, setMultPalabraResultado] = useState<MultiplicadorPalabra>(1);
  const [calculando, setCalculando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const [diccionario, setDiccionario] = useState<string[]>([]);
  const [dictStatus, setDictStatus] = useState<DictStatus>('loading');

  // Marcador de partida: persiste en localStorage porque una partida real dura varios
  // turnos y el atril se limpia entre ellos (a diferencia del diccionario, que es
  // contenido estático y le basta con sessionStorage).
  const [jugadores, setJugadores] = useState<string[]>(['Jugador 1', 'Jugador 2']);
  const [turno, setTurno] = useState(0);
  const [historialMarcador, setHistorialMarcador] = useState<JugadaAnotada[]>([]);
  const [marcadorAbierto, setMarcadorAbierto] = useState(false);
  const [marcadorCargado, setMarcadorCargado] = useState(false);
  const [avisoMarcador, setAvisoMarcador] = useState('');
  const [partidaBorrada, setPartidaBorrada] = useState<PartidaBorrada | null>(null);
  const [puntosManual, setPuntosManual] = useState('');
  const [palabraManual, setPalabraManual] = useState('');
  const [errorManual, setErrorManual] = useState('');

  // En el móvil el botón de buscar y el de anotar quedan lejos de lo que cambian: tras
  // pulsarlos se lleva la vista a los resultados o al marcador (hallazgos 2593 y 2596).
  const anclaResultados = useRef<HTMLDivElement>(null);
  const seccionMarcador = useRef<HTMLElement>(null);
  const desplazarAResultados = useRef(false);
  const desplazarAMarcador = useRef(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(MARCADOR_CACHE_KEY);
      if (guardado) {
        const datos = JSON.parse(guardado) as MarcadorGuardado;
        if (Array.isArray(datos.jugadores) && datos.jugadores.length > 0) setJugadores(datos.jugadores);
        if (typeof datos.turno === 'number') setTurno(datos.turno);
        if (Array.isArray(datos.historial)) setHistorialMarcador(datos.historial);
      }
    } catch { /* localStorage no disponible o dato corrupto: se arranca en blanco */ }
    setMarcadorCargado(true);
  }, []);

  useEffect(() => {
    if (!marcadorCargado) return;
    try {
      localStorage.setItem(
        MARCADOR_CACHE_KEY,
        JSON.stringify({ jugadores, turno, historial: historialMarcador })
      );
    } catch { /* localStorage lleno o no disponible */ }
  }, [marcadorCargado, jugadores, turno, historialMarcador]);

  const totalesMarcador = useMemo(() => {
    const totales = jugadores.map(() => 0);
    for (const entrada of historialMarcador) {
      if (entrada.jugadorIndice < totales.length) totales[entrada.jugadorIndice] += entrada.puntos;
    }
    return totales;
  }, [jugadores, historialMarcador]);

  const ultimoJugadorTieneJugadas = historialMarcador.some(
    (j) => j.jugadorIndice === jugadores.length - 1
  );

  /** Nombre que se muestra: el campo puede quedar vacío mientras se reescribe. */
  const nombreDe = (indice: number): string =>
    jugadores[indice]?.trim() || `Jugador ${indice + 1}`;

  // Se guarda tal cual, también vacío: reponer «Jugador N» en cada pulsación impedía borrar
  // el nombre y pegaba lo tecleado detrás («Jugador 1Ana», hallazgo 2598). El nombre por
  // defecto vuelve al salir del campo, si se ha quedado vacío.
  const renombrarJugador = (indice: number, nombre: string) => {
    setJugadores((previo) => previo.map((j, i) => (i === indice ? nombre : j)));
  };

  const completarNombreVacio = (indice: number) => {
    setJugadores((previo) =>
      previo.map((j, i) => (i === indice && j.trim() === '' ? `Jugador ${i + 1}` : j))
    );
  };

  const añadirJugador = () => {
    if (jugadores.length >= MAX_JUGADORES) return;
    setJugadores((previo) => [...previo, `Jugador ${previo.length + 1}`]);
  };

  const quitarUltimoJugador = () => {
    if (jugadores.length <= 1 || ultimoJugadorTieneJugadas) return;
    setJugadores((previo) => previo.slice(0, -1));
    setTurno((previo) => (previo >= jugadores.length - 1 ? 0 : previo));
  };

  /** Anota una entrada al jugador al que le toca, pasa el turno y lleva la vista al marcador. */
  const anotarEntrada = (entrada: Omit<JugadaAnotada, 'jugadorIndice'>, aviso: string) => {
    const siguiente = (turno + 1) % jugadores.length;
    setHistorialMarcador((previo) => [...previo, { ...entrada, jugadorIndice: turno }]);
    setTurno(siguiente);
    setPartidaBorrada(null);
    setAvisoMarcador(`${aviso} Le toca a ${nombreDe(siguiente)}.`);
    setMarcadorAbierto(true);
    desplazarAMarcador.current = true;
  };

  const anotarJugada = (jugada: Jugada) => {
    // El aviso no repite la palabra: ya está en el historial, justo debajo.
    anotarEntrada(
      { palabra: jugada.palabra, puntos: jugada.puntos, tipo: 'lista' },
      `Anotados ${puntosEnTexto(jugada.puntos)} a ${nombreDe(turno)}.`
    );
    limpiar();
  };

  // Pasar el turno o cambiar fichas: 0 puntos y el turno pasa (arts. 25-26 FISE).
  const pasarTurno = () => {
    anotarEntrada({ palabra: '', puntos: 0, tipo: 'pasa' }, `${nombreDe(turno)} pasa o cambia fichas: 0 puntos.`);
  };

  // Para lo que la lista no trae: plurales y formas verbales que el lemario no recoge, la
  // puntuación con las palabras cruzadas (art. 18) o el ajuste final de la partida.
  const anotarManual = () => {
    const puntos = parseSpanishNumber(puntosManual);
    if (!Number.isInteger(puntos) || puntos < PUNTOS_MANUAL_MIN || puntos > PUNTOS_MANUAL_MAX) {
      setErrorManual(
        `Escribe los puntos como un número entero entre ${PUNTOS_MANUAL_MIN.toLocaleString('es-ES')} y ${PUNTOS_MANUAL_MAX.toLocaleString('es-ES')}.`
      );
      return;
    }
    setErrorManual('');
    anotarEntrada(
      { palabra: palabraManual.trim().toUpperCase(), puntos, tipo: 'manual' },
      `Anotados ${puntosEnTexto(puntos)} a mano a ${nombreDe(turno)}.`
    );
    setPuntosManual('');
    setPalabraManual('');
  };

  // El turno vuelve a QUIEN hizo la jugada deshecha. Restar uno con el número de jugadores
  // actual se lo daba a otro en cuanto se añadía un jugador a mitad de partida (hallazgo 2597).
  const deshacerUltimaAnotacion = () => {
    const ultima = historialMarcador[historialMarcador.length - 1];
    if (!ultima) return;
    setHistorialMarcador((previo) => previo.slice(0, -1));
    setTurno(ultima.jugadorIndice < jugadores.length ? ultima.jugadorIndice : 0);
    setAvisoMarcador(`Anotación deshecha: vuelve a tocarle a ${nombreDe(ultima.jugadorIndice)}.`);
  };

  // Sin diálogo de confirmación, pero recuperable: un toque de más en el móvil ya no se
  // lleva la partida entera (hallazgo 2599). La copia vive hasta la siguiente anotación.
  const nuevaPartida = () => {
    setPartidaBorrada({ turno, historial: historialMarcador });
    setHistorialMarcador([]);
    setTurno(0);
    setAvisoMarcador('Partida nueva: totales a cero. Si ha sido sin querer, puedes recuperar la anterior.');
  };

  const recuperarPartida = () => {
    if (!partidaBorrada) return;
    setHistorialMarcador(partidaBorrada.historial);
    setTurno(partidaBorrada.turno < jugadores.length ? partidaBorrada.turno : 0);
    setPartidaBorrada(null);
    setAvisoMarcador('Partida anterior recuperada.');
  };

  useEffect(() => {
    if (!desplazarAMarcador.current || !marcadorAbierto) return;
    desplazarAMarcador.current = false;
    seccionMarcador.current?.scrollIntoView({ block: 'start' });
  }, [marcadorAbierto, historialMarcador]);

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(DICT_CACHE_KEY) : null;
    if (cached) {
      setDiccionario(cached.split('\n').filter(Boolean));
      setDictStatus('ready');
      return;
    }

    fetch(DICT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setDiccionario(text.split('\n').filter(Boolean));
        setDictStatus('ready');
        try { sessionStorage.setItem(DICT_CACHE_KEY, text); } catch { /* sessionStorage lleno */ }
      })
      .catch(() => setDictStatus('error'));
  }, []);

  // Al desactivar los dígrafos hay que sacarlos del atril y del gancho.
  useEffect(() => {
    if (modo === 'simple') {
      setAtril((previo) => previo.filter((f) => !DIGRAFOS.includes(f)));
      setGancho((previo) => (DIGRAFOS.includes(previo) ? '' : previo));
    }
  }, [modo]);

  const fichasTeclado = useMemo(
    () => (modo === 'digrafos' ? [...LETRAS_SIMPLES, ...DIGRAFOS] : [...LETRAS_SIMPLES]),
    [modo]
  );

  // Mismo cómputo que `maxCasillas` en el motor (atril + la del gancho, si hay). Una posición
  // fuera de este rango nunca puede caer sobre ninguna ficha colocada: el motor la descarta en
  // silencio y el multiplicador se pierde sin avisar.
  const maxCasillasBonus = atril.length + (gancho !== '' ? 1 : 0);

  // Si el atril o el gancho cambian y la posición elegida deja de caber, no se queda fija en
  // un valor ahora inalcanzable.
  useEffect(() => {
    if (typeof posicionBonus === 'number' && posicionBonus > maxCasillasBonus) {
      setPosicionBonus('auto');
    }
    setCasillasExtra((previo) =>
      previo.some((c) => typeof c.posicion === 'number' && c.posicion > maxCasillasBonus)
        ? previo.map((c) =>
            typeof c.posicion === 'number' && c.posicion > maxCasillasBonus ? { ...c, posicion: 'auto' } : c
          )
        : previo
    );
  }, [maxCasillasBonus, posicionBonus]);

  /** Todas las casillas de letra marcadas: la primera y las añadidas. */
  const casillasLetra: CasillaLetra[] = useMemo(
    () => (multLetra === 1 ? [] : [{ multiplicador: multLetra, posicion: posicionBonus }, ...casillasExtra]),
    [multLetra, posicionBonus, casillasExtra]
  );

  /** Posiciones fijas que ya ocupa otra casilla de letra: una ficha no pisa dos casillas. */
  const posicionesOcupadas = (excepto: number): Set<number> => {
    const ocupadas = new Set<number>();
    casillasLetra.forEach((c, i) => {
      if (i !== excepto && typeof c.posicion === 'number') ocupadas.add(c.posicion);
    });
    return ocupadas;
  };

  const elegirMultLetra = (valor: 1 | MultiplicadorLetra) => {
    setMultLetra(valor);
    if (valor === 1) setCasillasExtra([]);
    setBuscado(false);
  };

  const añadirCasillaLetra = () => {
    if (multLetra === 1 || casillasLetra.length >= MAX_CASILLAS_LETRA) return;
    setCasillasExtra((previo) => [...previo, { multiplicador: 2, posicion: 'auto' }]);
    setBuscado(false);
  };

  const cambiarCasillaExtra = (indice: number, cambio: Partial<CasillaLetra>) => {
    setCasillasExtra((previo) => previo.map((c, i) => (i === indice ? { ...c, ...cambio } : c)));
    setBuscado(false);
  };

  const quitarCasillaExtra = (indice: number) => {
    setCasillasExtra((previo) => previo.filter((_, i) => i !== indice));
    setBuscado(false);
  };

  const añadirFicha = (ficha: Ficha) => {
    if (atril.length >= FICHAS_ATRIL) return;
    setAtril([...atril, ficha]);
    setBuscado(false);
  };

  const quitarFicha = (indice: number) => {
    setAtril(atril.filter((_, i) => i !== indice));
    setBuscado(false);
  };

  const limpiar = () => {
    setAtril([]);
    setGancho('');
    setMultLetra(1);
    setCasillasExtra([]);
    setMultPalabra(1);
    setPosicionBonus('auto');
    setJugadas([]);
    setBuscado(false);
  };

  const calcular = () => {
    if (atril.length === 0 || dictStatus !== 'ready') return;
    setCalculando(true);
    setBuscado(true);
    desplazarAResultados.current = true;

    // Se cede un frame al navegador para que pinte el estado "calculando".
    setTimeout(() => {
      const resultado = buscarJugadas(diccionario, atril, {
        modo,
        gancho,
        casillasLetra,
        multiplicadorPalabra: multPalabra,
      }, 40);
      setJugadas(resultado);
      setMultPalabraResultado(multPalabra);
      setCalculando(false);
    }, 30);
  };

  useEffect(() => {
    if (!desplazarAResultados.current || !buscado || calculando) return;
    desplazarAResultados.current = false;
    anclaResultados.current?.scrollIntoView({ block: 'start' });
  }, [buscado, calculando, jugadas]);

  const puntosDeFicha = (jugada: Jugada, indice: number): number => {
    if (jugada.indicesComodin.includes(indice)) return 0;
    return VALORES[jugada.fichas[indice]] ?? 0;
  };

  /** Lo que se anuncia al lector de pantalla al terminar la búsqueda: un resumen, no la lista. */
  const anuncioResultados = calculando
    ? 'Buscando jugadas…'
    : !buscado
      ? ''
      : jugadas.length === 0
        ? 'Sin jugadas: con esas fichas no sale ninguna palabra del lemario.'
        : `${jugadas.length} ${jugadas.length === 1 ? 'jugada encontrada' : 'jugadas encontradas'}. La mejor: ${jugadas[0].palabra}, ${puntosEnTexto(jugadas[0].puntos)}.`;

  const totalFichasBolsa = useMemo(
    () => Object.values(DISTRIBUCION).reduce((suma, n) => suma + n, 0),
    []
  );

  const dictSize = useMemo(() => diccionario.length.toLocaleString('es-ES'), [diccionario.length]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Jugada Óptima en Scrabble</h1>
        <p className={styles.subtitle}>
          Tus fichas y la letra del tablero en la que te apoyas: la palabra que más puntúa, con el tanteo desglosado.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <section ref={seccionMarcador} className={styles.marcadorSeccion}>
          <button
            type="button"
            className={styles.marcadorToggle}
            aria-expanded={marcadorAbierto}
            aria-controls="panel-marcador"
            onClick={() => {
              setMarcadorAbierto((previo) => !previo);
              setAvisoMarcador('');
            }}
          >
            <span><span aria-hidden="true">🏆</span> Marcador de partida</span>
            {historialMarcador.length > 0 && (
              <span className={styles.contador}>{historialMarcador.length} {historialMarcador.length === 1 ? 'jugada' : 'jugadas'}</span>
            )}
            <span className={styles.marcadorFlecha} aria-hidden="true">{marcadorAbierto ? '▲' : '▼'}</span>
          </button>

          {marcadorAbierto && (
            <div id="panel-marcador" className={styles.marcadorPanel}>
              <p className={styles.marcadorAviso} role="status">
                {avisoMarcador}
              </p>
              {partidaBorrada && (
                <button type="button" className={styles.btnAnotar} onClick={recuperarPartida}>
                  Recuperar la partida anterior
                </button>
              )}

              <p className={styles.ayuda}>
                Lleva el tanteo de la partida entre varios jugadores: anota cada jugada desde la
                lista de resultados, o a mano si la lista no la trae, y el turno pasa solo al
                siguiente. Se guarda en este navegador, así que sobrevive a cerrar la pestaña
                entre turnos.
              </p>

              <ul className={styles.marcadorJugadores}>
                {jugadores.map((nombre, i) => (
                  <li
                    key={i}
                    className={`${styles.marcadorJugador} ${i === turno ? styles.marcadorJugadorActivo : ''}`}
                  >
                    <label className={styles.marcadorNombreLabel}>
                      <span className={styles.srOnly}>Nombre del jugador {i + 1}</span>
                      <input
                        type="text"
                        className={styles.marcadorNombreInput}
                        value={nombre}
                        maxLength={24}
                        placeholder={`Jugador ${i + 1}`}
                        autoComplete="off"
                        onChange={(e) => renombrarJugador(i, e.target.value)}
                        onBlur={() => completarNombreVacio(i)}
                      />
                    </label>
                    <span className={styles.marcadorPuntos}>{totalesMarcador[i]}</span>
                    {i === turno && <span className={styles.marcadorTurno}>Le toca</span>}
                  </li>
                ))}
              </ul>

              <div className={styles.marcadorTurnoAcciones}>
                <button type="button" className={styles.btnSecondary} onClick={pasarTurno}>
                  Pasar turno o cambiar fichas (0 puntos)
                </button>
                <div className={styles.marcadorManual} role="group" aria-labelledby="titulo-anotar-mano">
                  <span id="titulo-anotar-mano" className={styles.marcadorManualTitulo}>
                    Anotar a mano a {nombreDe(turno)}
                  </span>
                  <div className={styles.marcadorManualCampos}>
                    <label className={styles.marcadorManualCampo}>
                      <span>Palabra (opcional)</span>
                      <input
                        type="text"
                        className={styles.marcadorManualInput}
                        value={palabraManual}
                        maxLength={20}
                        autoComplete="off"
                        autoCapitalize="characters"
                        onChange={(e) => setPalabraManual(e.target.value)}
                      />
                    </label>
                    <label className={styles.marcadorManualCampo}>
                      <span>Puntos</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.marcadorManualInput}
                        value={puntosManual}
                        maxLength={6}
                        autoComplete="off"
                        aria-invalid={errorManual !== ''}
                        aria-describedby={errorManual !== '' ? 'error-anotar-mano' : undefined}
                        onChange={(e) => { setPuntosManual(e.target.value); setErrorManual(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') anotarManual(); }}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={anotarManual}
                      disabled={puntosManual.trim() === ''}
                    >
                      Anotar a mano
                    </button>
                  </div>
                  <p className={styles.ayudaCampo}>
                    Para un plural o una forma verbal que la lista no trae, la puntuación con las
                    palabras cruzadas o el ajuste final de la partida (con signo menos para restar).
                  </p>
                  {errorManual !== '' && (
                    <p id="error-anotar-mano" className={styles.marcadorManualError} role="alert">
                      {errorManual}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.marcadorAcciones}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={añadirJugador}
                  disabled={jugadores.length >= MAX_JUGADORES}
                >
                  + Añadir jugador
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={quitarUltimoJugador}
                  disabled={jugadores.length <= 1 || ultimoJugadorTieneJugadas}
                  title={ultimoJugadorTieneJugadas ? 'Ese jugador ya tiene jugadas anotadas' : undefined}
                >
                  − Quitar último
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={deshacerUltimaAnotacion}
                  disabled={historialMarcador.length === 0}
                >
                  Deshacer última anotación
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={nuevaPartida}
                  disabled={historialMarcador.length === 0}
                >
                  Nueva partida
                </button>
              </div>

              {historialMarcador.length > 0 && (
                <ol className={styles.marcadorHistorial}>
                  {historialMarcador.map((entrada, i) => (
                    <li key={i} className={styles.marcadorHistorialItem}>
                      <span className={styles.marcadorHistorialJugador}>
                        {nombreDe(entrada.jugadorIndice)}
                      </span>
                      <span className={styles.marcadorHistorialPalabra}>
                        {entrada.tipo === 'pasa'
                          ? 'Pasa o cambia fichas'
                          : entrada.tipo === 'manual'
                            ? `${entrada.palabra}${entrada.palabra !== '' ? ' ' : ''}(a mano)`
                            : entrada.palabra}
                      </span>
                      <span className={styles.marcadorHistorialPuntos}>{entrada.puntos.toLocaleString('es-ES')} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </section>

        {dictStatus === 'loading' && (
          <div className={`${styles.dictStatus} ${styles.dictStatusLoading}`} role="status" aria-live="polite">
            <span className={styles.dictSpinner} aria-hidden="true" />
            <span>Cargando diccionario español…</span>
          </div>
        )}
        {dictStatus === 'ready' && (
          <div className={`${styles.dictStatus} ${styles.dictStatusReady}`}>
            <span aria-hidden="true">✓</span>
            <span>Diccionario cargado: {dictSize} palabras del español</span>
          </div>
        )}
        {dictStatus === 'error' && (
          <div className={`${styles.dictStatus} ${styles.dictStatusError}`} role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>No se pudo cargar el diccionario. Recarga la página para reintentar.</span>
          </div>
        )}

        {/* Modo de juego */}
        <section className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>1. Cómo son tus fichas</h2>
          <div className={styles.toggleGroup} role="group" aria-label="Modo de juego">
            <button
              type="button"
              className={`${styles.toggleBtn} ${modo === 'digrafos' ? styles.toggleBtnActivo : ''}`}
              aria-pressed={modo === 'digrafos'}
              onClick={() => setModo('digrafos')}
            >
              Con CH, LL y RR
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${modo === 'simple' ? styles.toggleBtnActivo : ''}`}
              aria-pressed={modo === 'simple'}
              onClick={() => setModo('simple')}
            >
              Solo letras sueltas
            </button>
          </div>
          <p className={styles.ayuda}>
            El Scrabble en español clásico trae fichas de CH, LL y RR que ocupan una sola casilla, y en ese
            modo no se pueden formar con dos fichas sueltas (C y H, dos L, dos R): solo con su ficha o con
            un comodín. Muchas versiones digitales las eliminaron: si tus fichas no las tienen, elige la
            segunda opción.
          </p>
        </section>

        {/* Atril */}
        <section className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>
            2. Tu atril <span className={styles.contador}>{atril.length}/{FICHAS_ATRIL}</span>
          </h2>

          <div className={styles.atril} aria-live="polite">
            {atril.length === 0 && (
              <p className={styles.atrilVacio}>Pulsa las fichas de abajo para montar tu atril.</p>
            )}
            {atril.map((ficha, i) => (
              <button
                type="button"
                key={`${ficha}-${i}`}
                className={styles.fichaAtril}
                onClick={() => quitarFicha(i)}
                aria-label={`Quitar la ficha ${ficha === COMODIN ? 'comodín' : ficha} del atril`}
              >
                <span className={styles.fichaLetra}>{ficha === COMODIN ? '★' : ficha}</span>
                <span className={styles.fichaValor}>{VALORES[ficha] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className={styles.teclado}>
            {fichasTeclado.map((ficha) => (
              <button
                type="button"
                key={ficha}
                className={`${styles.tecla} ${DIGRAFOS.includes(ficha) ? styles.teclaDigrafo : ''}`}
                onClick={() => añadirFicha(ficha)}
                disabled={atril.length >= FICHAS_ATRIL}
                aria-label={`Añadir ficha ${ficha} al atril (${VALORES[ficha]} ${VALORES[ficha] === 1 ? 'punto' : 'puntos'})`}
              >
                <span className={styles.teclaLetra}>{ficha}</span>
                <span className={styles.teclaValor}>{VALORES[ficha]}</span>
              </button>
            ))}
            <button
              type="button"
              className={`${styles.tecla} ${styles.teclaComodin}`}
              onClick={() => añadirFicha(COMODIN)}
              disabled={atril.length >= FICHAS_ATRIL}
              aria-label="Añadir comodín al atril"
            >
              <span className={styles.teclaLetra}>★</span>
              <span className={styles.teclaValor}>0</span>
            </button>
          </div>
        </section>

        {/* Gancho y casilla */}
        <section className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>3. Dónde vas a jugar</h2>

          <div className={styles.campos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="gancho">
                Letra del tablero en la que te apoyas
              </label>
              <select
                id="gancho"
                className={styles.select}
                value={gancho}
                onChange={(e) => { setGancho(e.target.value); setBuscado(false); }}
              >
                <option value="">Ninguna (palabra suelta)</option>
                {(modo === 'digrafos' ? [...LETRAS_SIMPLES, ...DIGRAFOS] : LETRAS_SIMPLES).map((letra) => (
                  <option key={letra} value={letra}>{letra}</option>
                ))}
              </select>
              <p className={styles.ayudaCampo}>
                Esa ficha ya está colocada: suma sus puntos pero no gasta atril ni recibe bonificación.
              </p>
            </div>

            <div className={styles.campo}>
              <span className={styles.label} id="label-mult-palabra">Casilla de palabra</span>
              <div className={styles.toggleGroup} role="group" aria-labelledby="label-mult-palabra">
                {OPCIONES_PALABRA.map(({ valor, etiqueta }) => (
                  <button
                    type="button"
                    key={valor}
                    className={`${styles.toggleBtn} ${multPalabra === valor ? styles.toggleBtnActivo : ''}`}
                    aria-pressed={multPalabra === valor}
                    onClick={() => { setMultPalabra(valor); setBuscado(false); }}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
              <p className={styles.ayudaCampo}>
                Si la palabra pisa dos casillas de doble palabra se multiplica ×4 (2×2), y si pisa dos de
                triple, ×9 (3×3): así lo cuenta el reglamento de la FISE.
              </p>
            </div>

            <div className={styles.campo}>
              <span className={styles.label} id="label-mult-letra">Casilla de letra</span>
              <div className={styles.toggleGroup} role="group" aria-labelledby="label-mult-letra">
                {([1, 2, 3] as const).map((valor) => (
                  <button
                    type="button"
                    key={valor}
                    className={`${styles.toggleBtn} ${multLetra === valor ? styles.toggleBtnActivo : ''}`}
                    aria-pressed={multLetra === valor}
                    onClick={() => elegirMultLetra(valor)}
                  >
                    {valor === 1 ? 'Ninguna' : `×${valor} letra`}
                  </button>
                ))}
              </div>
            </div>

            {multLetra > 1 && (
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="posicion-bonus">
                  Casilla que cae sobre la bonificación
                </label>
                <select
                  id="posicion-bonus"
                  className={styles.select}
                  value={String(posicionBonus)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPosicionBonus(v === 'auto' ? 'auto' : Number(v));
                    setBuscado(false);
                  }}
                >
                  <option value="auto">La ficha más valiosa (mejor caso)</option>
                  {Array.from({ length: maxCasillasBonus }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p} disabled={posicionesOcupadas(0).has(p)}>
                      Posición {p} de la palabra
                    </option>
                  ))}
                </select>
                <p className={styles.ayudaCampo}>
                  Las posiciones se cuentan desde la primera letra, hasta las {maxCasillasBonus} casillas que
                  tu atril{gancho !== '' ? ' y el gancho' : ''} pueden llegar a ocupar. Si eliges «la ficha más
                  valiosa», el resultado es el techo de la jugada: solo lo alcanzarás si la palabra encaja así
                  en el tablero.
                </p>
              </div>
            )}

            {multLetra > 1 && casillasExtra.map((casilla, i) => {
              const numero = i + 2;
              const idEtiqueta = `label-casilla-letra-${numero}`;
              return (
                <div className={styles.campo} key={numero}>
                  <span className={styles.label} id={idEtiqueta}>Otra casilla de letra ({numero}.ª)</span>
                  <div className={styles.casillaExtraFila}>
                    <div className={styles.toggleGroup} role="group" aria-labelledby={idEtiqueta}>
                      {([2, 3] as const).map((valor) => (
                        <button
                          type="button"
                          key={valor}
                          className={`${styles.toggleBtn} ${casilla.multiplicador === valor ? styles.toggleBtnActivo : ''}`}
                          aria-pressed={casilla.multiplicador === valor}
                          onClick={() => cambiarCasillaExtra(i, { multiplicador: valor })}
                        >
                          {`×${valor}`}
                        </button>
                      ))}
                    </div>
                    <select
                      className={styles.select}
                      aria-label={`Posición de la ${numero}.ª casilla de letra`}
                      value={String(casilla.posicion)}
                      onChange={(e) => {
                        const v = e.target.value;
                        cambiarCasillaExtra(i, { posicion: v === 'auto' ? 'auto' : Number(v) });
                      }}
                    >
                      <option value="auto">La siguiente ficha más valiosa</option>
                      {Array.from({ length: maxCasillasBonus }, (_, p) => p + 1).map((p) => (
                        <option key={p} value={p} disabled={posicionesOcupadas(i + 1).has(p)}>
                          Posición {p} de la palabra
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.btnQuitarCasilla}
                      onClick={() => quitarCasillaExtra(i)}
                      aria-label={`Quitar la ${numero}.ª casilla de letra`}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}

            {multLetra > 1 && casillasLetra.length < MAX_CASILLAS_LETRA && (
              <div className={styles.campo}>
                <button type="button" className={styles.btnAnotar} onClick={añadirCasillaLetra}>
                  + Otra casilla de letra en la misma palabra
                </button>
                <p className={styles.ayudaCampo}>
                  Una palabra larga puede pisar dos o tres casillas de letra a la vez. Cada ficha solo
                  puede caer en una, y la que ya estaba en el tablero no recibe ninguna.
                </p>
              </div>
            )}
          </div>

          <div className={styles.acciones}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={calcular}
              disabled={atril.length === 0 || dictStatus !== 'ready' || calculando}
            >
              {calculando ? 'Calculando…' : 'Buscar la mejor jugada'}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={limpiar}>
              Limpiar
            </button>
          </div>
        </section>

        {/* Resultados. Sin aria-live en la sección: con hasta 40 jugadas y 40 botones, el
            lector de pantalla leía la lista entera al pintarse. Se anuncia solo un resumen. */}
        <section id="resultados-jugada" className={styles.bloque}>
          <p className={styles.srOnly} role="status">{anuncioResultados}</p>
          <div ref={anclaResultados} className={styles.anclaResultados} />

          {calculando && <p className={styles.estado}>Revisando {dictSize} palabras…</p>}

          {!calculando && buscado && jugadas.length === 0 && (
            <div className={styles.sinResultados}>
              <p><strong>Ninguna palabra encaja con esas fichas.</strong></p>
              <p>
                Si has fijado una letra de apoyo, prueba a quitarla: obliga a que aparezca en la palabra.
                Recuerda también que el lemario recoge formas base, no conjugaciones ni plurales.
              </p>
            </div>
          )}

          {!calculando && jugadas.length > 0 && (
            <>
              <h2 className={styles.bloqueTitulo}>
                Mejores jugadas <span className={styles.contador}>{jugadas.length}</span>
              </h2>
              {jugadas.length > 1 && jugadas[0].puntos === jugadas[1].puntos && (
                <p className={styles.ayuda}>
                  Hay más de una jugada con {jugadas[0].puntos} puntos: en caso de empate se
                  ordenan alfabéticamente, no por lo reconocible que sea la palabra.
                </p>
              )}
              <ol className={styles.listaJugadas}>
                {jugadas.map((jugada, idx) => (
                  <li key={jugada.palabra} className={`${styles.jugada} ${idx === 0 ? styles.jugadaTop : ''}`}>
                    <div className={styles.jugadaCabecera}>
                      <span className={styles.jugadaPalabra}>{jugada.palabra}</span>
                      <span className={styles.jugadaPuntos}>
                        {jugada.puntos} <span className={styles.jugadaPuntosLabel}>pts</span>
                      </span>
                    </div>

                    <div className={styles.jugadaFichas}>
                      {jugada.fichas.map((ficha, i) => {
                        const esGancho = i === jugada.indiceGancho;
                        const esComodin = jugada.indicesComodin.includes(i);
                        const esBonus = jugada.bonos.some((b) => b.indice === i);
                        return (
                          <span
                            key={`${ficha}-${i}`}
                            className={[
                              styles.fichaMini,
                              esGancho ? styles.fichaGancho : '',
                              esComodin ? styles.fichaComodin : '',
                              esBonus ? styles.fichaBonus : '',
                            ].filter(Boolean).join(' ')}
                          >
                            <span className={styles.fichaMiniLetra}>{ficha}</span>
                            <span className={styles.fichaMiniValor}>{puntosDeFicha(jugada, i)}</span>
                          </span>
                        );
                      })}
                    </div>

                    <p className={styles.jugadaDetalle}>
                      Coloca {jugada.fichasUsadas} {jugada.fichasUsadas === 1 ? 'ficha' : 'fichas'} de tu atril
                      {jugada.indiceGancho !== -1 && <> y aprovecha la <strong>{jugada.fichas[jugada.indiceGancho]}</strong> del tablero</>}
                      {jugada.indicesComodin.length > 0 && (
                        <> · comodín sobre {jugada.indicesComodin.map((i) => jugada.fichas[i]).join(' y ')}</>
                      )}
                      {jugada.bonos.map((bono) => (
                        <span key={bono.indice}> · ×{bono.multiplicador} en la <strong>{jugada.fichas[bono.indice]}</strong></span>
                      ))}
                      {multPalabraResultado > 1 && (
                        <>
                          {' '}· palabra ×{multPalabraResultado}
                          {multPalabraResultado === 4 && ' (dos casillas de doble palabra)'}
                          {multPalabraResultado === 9 && ' (dos casillas de triple palabra)'}
                        </>
                      )}
                      {jugada.atrilCompleto && <> · <strong>+{BONUS_ATRIL_COMPLETO} por colocar las siete fichas</strong></>}
                    </p>
                    <button
                      type="button"
                      className={styles.btnAnotar}
                      onClick={() => anotarJugada(jugada)}
                    >
                      Anotar esta jugada a {nombreDe(turno)}
                    </button>
                  </li>
                ))}
              </ol>
              <p className={styles.ayuda}>
                Antes de jugarla, comprueba que la palabra cabe en el hueco y que las palabras que se formen
                de lado también son válidas: eso depende del tablero y la calculadora no puede verlo.
              </p>
            </>
          )}
        </section>

        {/* Tabla de referencia */}
        <section className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>Cuánto vale cada ficha</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.valoresTable}>
              <caption className={styles.tableCaption}>
                Valores y número de fichas de la edición española ({totalFichasBolsa} fichas en la bolsa)
              </caption>
              <thead>
                <tr>
                  <th scope="col">Puntos</th>
                  <th scope="col">Fichas</th>
                </tr>
              </thead>
              <tbody>
                {GRUPOS_VALOR.map((grupo) => (
                  <tr key={grupo.puntos}>
                    <th scope="row" className={styles.celdaPuntos}>{grupo.puntos}</th>
                    <td>
                      {grupo.fichas.map((f) => (
                        <span key={f} className={styles.chipFicha}>
                          {f}<span className={styles.chipCantidad}>×{DISTRIBUCION[f]}</span>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className={styles.celdaPuntos}>0</th>
                  <td>
                    <span className={styles.chipFicha}>
                      Comodín<span className={styles.chipCantidad}>×{DISTRIBUCION[COMODIN]}</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <EducationalSection
        icon="🔤"
        title="Cómo puntuar mejor en los juegos de palabras"
        subtitle="Reglas de tanteo, errores frecuentes y estrategia de casillas"
      >
        <section className={styles.guideSection}>
          <h2>De las fichas a los puntos</h2>
          <p>
            En un juego de palabras con fichas, la puntuación de una jugada no depende solo de la palabra:
            depende de <strong>qué fichas la componen</strong> y de <strong>sobre qué casillas caen</strong>. Una
            palabra de siete letras formada solo con vocales puede valer menos que una de tres letras con la Z
            sobre una casilla de triple letra. Esta calculadora recorre el lemario, descarta lo que no puedes
            formar con tu atril y ordena lo que queda por puntuación real, no por longitud.
          </p>

          <h3>Casillas: el orden de los multiplicadores</h3>
          <p>
            El tanteo sigue siempre la misma secuencia. Primero se suma el valor de cada ficha aplicando las
            casillas de letra (doble o triple letra). Después, ese subtotal se multiplica por las casillas de
            palabra. Y solo al final, si has colocado las siete fichas del atril, se suman los 50 puntos de
            bonificación, que <em>no</em> se multiplican por nada.
          </p>
          <p>
            Si la palabra pisa dos casillas de palabra, los multiplicadores se encadenan: dos de doble
            palabra multiplican por 4 y dos de triple, por 9. Una palabra larga también puede pisar varias
            casillas de letra; la calculadora admite hasta tres en la misma jugada, cada una sobre una ficha
            distinta. Lo que no cuenta son las palabras que se formen de lado al cruzar: esas se suman
            aparte, y su total puedes anotarlo a mano en el marcador.
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption className={styles.tableCaption}>
                Una misma palabra, cuatro posiciones distintas del tablero
              </caption>
              <thead>
                <tr>
                  <th scope="col">Situación</th>
                  <th scope="col">Cálculo</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">ZAPATO en casillas normales</th>
                  <td>10+1+3+1+1+1</td>
                  <td>17 puntos</td>
                </tr>
                <tr>
                  <th scope="row">Con la Z en doble letra</th>
                  <td>(10×2)+1+3+1+1+1</td>
                  <td>27 puntos</td>
                </tr>
                <tr>
                  <th scope="row">En casilla de triple palabra</th>
                  <td>17×3</td>
                  <td>51 puntos</td>
                </tr>
                <tr>
                  <th scope="row">Z en triple letra y palabra doble</th>
                  <td>((10×3)+7)×2</td>
                  <td>74 puntos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Cuatro formas de usar la calculadora</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🎯</span> Buscar la jugada del turno</h4>
              <p>
                Monta tu atril, indica la letra del tablero donde piensas engancharte y marca la casilla.
                La primera fila de resultados es la jugada que más puntúa de las que puedes formar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">⚖️</span> Resolver una duda de tanteo</h4>
              <p>
                ¿Discutís cuánto vale una palabra? Introduce sus fichas y las casillas que pisa, y el desglose
                muestra ficha a ficha de dónde sale cada punto, incluida la que ya estaba en el tablero. Las
                palabras que se forman de lado al cruzar no entran en la cuenta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">📖</span> Entrenar entre partidas</h4>
              <p>
                Prueba atriles difíciles (muchas consonantes, dos comodines) y observa qué palabras salen.
                Es la forma más rápida de ampliar el repertorio de palabras cortas con fichas caras.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🏆</span> Llevar el marcador entre varios</h4>
              <p>
                Abre el marcador de partida, ponle nombre a cada jugador y anota cada jugada desde la
                lista de resultados, o a mano si no está en ella. Pasar o cambiar fichas se anota con
                0 puntos, y el turno pasa solo al siguiente.
              </p>
            </div>
          </div>

          <h3>Cómo usarla paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Elige si tus fichas traen CH, LL y RR</h4>
                <p>
                  Cambia el tanteo y las palabras posibles. Con dígrafos, CH, LL y RR solo se forman con su
                  ficha o con un comodín: el reglamento no deja juntar una C y una H sueltas, ni dos L, ni dos R.
                  Así, CARRO necesita la ficha RR y ocupa cuatro casillas; sin dígrafos se escribe con dos R
                  sueltas y ocupa cinco.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Monta el atril</h4>
                <p>Pulsa cada ficha que tengas. El comodín es la estrella. Pulsa una ficha ya colocada para quitarla.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Indica dónde vas a jugar</h4>
                <p>La letra de apoyo obliga a que la palabra la contenga. Sin ella, verás las palabras que salen solo de tu atril.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Contrasta con el tablero</h4>
                <p>Comprueba que la palabra cabe y que los cruces laterales son válidos antes de colocarla.</p>
              </div>
            </div>
          </div>

          <h3>Cuatro ideas que suben el tanteo</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💎</span>
              <h4>La casilla manda sobre la longitud</h4>
              <p>Antes de buscar la palabra más larga, mira qué casilla tienes al alcance: multiplicar una Z o una J suele rendir más.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">★</span>
              <h4>Guarda el comodín</h4>
              <p>Gastarlo en una jugada de 12 puntos sale caro: sostiene las jugadas de siete fichas, que valen 50 extra.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h4>Vigila el equilibrio del atril</h4>
              <p>Quedarte con seis consonantes bloquea el turno siguiente. A veces conviene una jugada menor que descarga letras difíciles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <h4>Las palabras cortas abren huecos</h4>
              <p>Las de dos y tres letras permiten engancharse a casillas lejanas y formar dos palabras a la vez.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores de tanteo más frecuentes</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Multiplicar la ficha que ya estaba puesta</strong>: las casillas de bonificación solo
                cuentan para las fichas colocadas en ese turno.
              </li>
              <li>
                <strong>Multiplicar los 50 puntos</strong>: la bonificación por usar las siete fichas se suma
                al final y no la afecta una casilla de triple palabra.
              </li>
              <li>
                <strong>Dar puntos al comodín</strong>: vale cero aunque represente una Z. Lo que aporta es
                la posibilidad de completar la palabra, no puntos.
              </li>
              <li>
                <strong>Contar la bonificación por vaciar el atril</strong>: al final de la partida, colocar
                las cuatro fichas que te quedan no da los 50 puntos, porque no son siete.
              </li>
            </ul>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué no encuentra una palabra que sé que existe?</h4>
              <p>
                El lemario recoge unas 87.000 <strong>formas base</strong>: infinitivos y singulares. No incluye
                conjugaciones ni la mayoría de plurales, así que CANTAR aparece pero CANTABAS no. Tampoco
                contiene K ni W, porque la edición española no tiene esas fichas.
              </p>
              <p className={styles.faqTip}>
                Para partidas de torneo, el diccionario válido es el oficial del juego, no este lemario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Sirve para versiones digitales de juegos de palabras?</h4>
              <p>
                Las reglas de tanteo son las mismas, pero cada versión usa sus propios valores de ficha y
                algunas eliminaron CH, LL y RR. Si tu juego puntúa distinto, la lista de palabras te sigue
                valiendo; el tanteo, no necesariamente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué casillas de premio tiene en cuenta?</h4>
              <p>
                Una casilla de palabra por jugada (doble o triple) o dos iguales, que multiplican por 4 o
                por 9, y hasta tres casillas de letra, cada una sobre una ficha distinta. La ficha que ya
                estaba en el tablero no recibe bonificación. No suma las palabras que se forman de lado al
                cruzar, porque para eso hace falta el tablero entero.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué no le puedo dar el tablero entero?</h4>
              <p>
                Porque resolver el tablero completo obliga a validar todas las palabras perpendiculares que se
                formarían en cada cruce, y eso exige reproducir el estado íntegro de la partida. La herramienta
                se queda en el paso que resuelve la mayoría de turnos reales: tu atril y el punto de enganche.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se guarda lo que escribo?</h4>
              <p>
                Solo en tu navegador. El diccionario se descarga una vez y todo el cálculo ocurre en tu
                dispositivo: las fichas que introduces no se envían a ningún servidor. El marcador de partida
                sí se guarda en el almacenamiento local de este navegador (los nombres de los jugadores, las
                palabras anotadas y los puntos) para que sobreviva a cerrar la pestaña entre turnos. No sale
                de tu dispositivo, y lo borras con «Nueva partida» o limpiando los datos del sitio.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-jugada-scrabble')} />

      <ShareCard appName="calculadora-jugada-scrabble" />

      <Footer appName="calculadora-jugada-scrabble" />
    </div>
  );
}
