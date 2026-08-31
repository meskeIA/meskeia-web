'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraJugadaScrabble.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  buscarJugadas,
  COMODIN,
  DIGRAFOS,
  DISTRIBUCION,
  FICHAS_ATRIL,
  LETRAS_SIMPLES,
  VALORES,
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

type DictStatus = 'loading' | 'ready' | 'error';

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

export default function CalculadoraJugadaScrabblePage() {
  const [modo, setModo] = useState<Modo>('digrafos');
  const [atril, setAtril] = useState<Ficha[]>([]);
  const [gancho, setGancho] = useState('');
  const [multLetra, setMultLetra] = useState<MultiplicadorLetra>(1);
  const [posicionBonus, setPosicionBonus] = useState<PosicionBonus>('auto');
  const [multPalabra, setMultPalabra] = useState<MultiplicadorPalabra>(1);

  const [jugadas, setJugadas] = useState<Jugada[]>([]);
  const [calculando, setCalculando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const [diccionario, setDiccionario] = useState<string[]>([]);
  const [dictStatus, setDictStatus] = useState<DictStatus>('loading');

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
  // silencio (`puntuar()` deja indiceBonus en -1) y el multiplicador se pierde sin avisar.
  const maxCasillasBonus = atril.length + (gancho !== '' ? 1 : 0);

  // Si el atril o el gancho cambian y la posición elegida deja de caber, no se queda fija en
  // un valor ahora inalcanzable.
  useEffect(() => {
    if (typeof posicionBonus === 'number' && posicionBonus > maxCasillasBonus) {
      setPosicionBonus('auto');
    }
  }, [maxCasillasBonus, posicionBonus]);

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
    setMultPalabra(1);
    setPosicionBonus('auto');
    setJugadas([]);
    setBuscado(false);
  };

  const calcular = () => {
    if (atril.length === 0 || dictStatus !== 'ready') return;
    setCalculando(true);
    setBuscado(true);

    // Se cede un frame al navegador para que pinte el estado "calculando".
    setTimeout(() => {
      const resultado = buscarJugadas(diccionario, atril, {
        modo,
        gancho,
        multiplicadorLetra: multLetra,
        posicionBonus,
        multiplicadorPalabra: multPalabra,
      }, 40);
      setJugadas(resultado);
      setCalculando(false);
    }, 30);
  };

  const puntosDeFicha = (jugada: Jugada, indice: number): number => {
    if (jugada.indicesComodin.includes(indice)) return 0;
    return VALORES[jugada.fichas[indice]] ?? 0;
  };

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
            El Scrabble en español clásico trae fichas de CH, LL y RR que ocupan una sola casilla. Muchas
            versiones digitales las eliminaron: si tus fichas no las tienen, elige la segunda opción.
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
                {([1, 2, 3] as MultiplicadorPalabra[]).map((valor) => (
                  <button
                    type="button"
                    key={valor}
                    className={`${styles.toggleBtn} ${multPalabra === valor ? styles.toggleBtnActivo : ''}`}
                    aria-pressed={multPalabra === valor}
                    onClick={() => { setMultPalabra(valor); setBuscado(false); }}
                  >
                    {valor === 1 ? 'Normal' : `×${valor} palabra`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <span className={styles.label} id="label-mult-letra">Casilla de letra</span>
              <div className={styles.toggleGroup} role="group" aria-labelledby="label-mult-letra">
                {([1, 2, 3] as MultiplicadorLetra[]).map((valor) => (
                  <button
                    type="button"
                    key={valor}
                    className={`${styles.toggleBtn} ${multLetra === valor ? styles.toggleBtnActivo : ''}`}
                    aria-pressed={multLetra === valor}
                    onClick={() => { setMultLetra(valor); setBuscado(false); }}
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
                    <option key={p} value={p}>Posición {p} de la palabra</option>
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

        {/* Resultados */}
        <section className={styles.bloque} aria-live="polite">
          {calculando && <p className={styles.estado}>Revisando {dictSize} palabras…</p>}

          {!calculando && buscado && jugadas.length === 0 && (
            <div className={styles.sinResultados} role="status">
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
                        const esBonus = i === jugada.indiceBonus;
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
                      {jugada.indiceBonus !== -1 && (
                        <> · ×{multLetra} en la <strong>{jugada.fichas[jugada.indiceBonus]}</strong></>
                      )}
                      {multPalabra > 1 && <> · palabra ×{multPalabra}</>}
                      {jugada.atrilCompleto && <> · <strong>+{50} por colocar las siete fichas</strong></>}
                    </p>
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

          <h3>Tres formas de usar la calculadora</h3>
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
                ¿Discutís cuánto vale una palabra? Introduce sus fichas y la casilla, y el desglose muestra
                ficha a ficha de dónde sale cada punto, incluida la que ya estaba en el tablero.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">📖</span> Entrenar entre partidas</h4>
              <p>
                Prueba atriles difíciles (muchas consonantes, dos comodines) y observa qué palabras salen.
                Es la forma más rápida de ampliar el repertorio de palabras cortas con fichas caras.
              </p>
            </div>
          </div>

          <h3>Cómo usarla paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Elige si tus fichas traen CH, LL y RR</h4>
                <p>Cambia el tanteo y las palabras posibles: con la ficha RR, CARRO ocupa cuatro casillas en vez de cinco.</p>
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
                No. El diccionario se descarga una vez y todo el cálculo ocurre en tu navegador: las fichas que
                introduces no salen de tu dispositivo ni quedan registradas en ningún sitio.
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
