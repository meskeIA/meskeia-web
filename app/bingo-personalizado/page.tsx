'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './BingoPersonalizado.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  LARGO_RECOMENDADO,
  MAX_LINEAS_PROPIAS,
  TAMANOS,
  agruparRespuestas,
  casillasDe,
  comprobarCarton,
  enJuegoPara,
  leerListaPropia,
  minimoPara,
  prepararPartida,
  sacarBola,
  tamanoDisponible,
  type Partida,
  type Tamano,
} from './motor';
import {
  LISTAS,
  TABLAS_DISPONIBLES,
  TABLAS_POR_DEFECTO,
  elementosDeLista,
  type FamiliaLista,
} from './listas';

type GanarCon = 'linea' | 'lleno';

interface Salida {
  indice: number;
  pregunta: string;
}

/** La partida generada, con la configuración con que se generó (para la hoja y el bombo) */
interface PartidaGenerada extends Partida {
  semilla: number;
  tamano: Tamano;
  nombreLista: string;
  familia: FamiliaLista;
}

const ID_PROPIA = 'propia';

const EJEMPLO_PROPIA = 'capital de Perú = Lima\n7 × 8 = 56\ngato = cat\nsol\nluna';

/**
 * Clase de letra de una casilla según lo largo que es su texto. La letra grande es para las
 * partidas en que TODO es corto (números, símbolos químicos): en una de palabras, «oso» y «pez»
 * salían más grandes que el resto del cartón (vista de impresión del usuario, 09/11/2026).
 */
function claseLargo(texto: string, todoCorto: boolean): string {
  const n = texto.length;
  if (n <= 3 && todoCorto) return styles.textoCorto;
  if (n <= 8) return styles.textoMedio;
  if (n <= 14) return styles.textoLargo;
  return styles.textoMuyLargo;
}

export default function BingoPersonalizadoPage() {
  const [listaId, setListaId] = useState('tablas');
  const [tablas, setTablas] = useState<number[]>(TABLAS_POR_DEFECTO);
  const [textoPropio, setTextoPropio] = useState('');
  const [tamanoId, setTamanoId] = useState('3x5');
  const [ganarCon, setGanarCon] = useState<GanarCon>('linea');
  const [titulo, setTitulo] = useState('Bingo');
  const [cantidad, setCantidad] = useState(25);
  const [semillaManual, setSemillaManual] = useState('');
  const [partida, setPartida] = useState<PartidaGenerada | null>(null);
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [mostrarRespuestas, setMostrarRespuestas] = useState(false);
  const [numeroComprobar, setNumeroComprobar] = useState('');

  const esPropia = listaId === ID_PROPIA;
  const lista = LISTAS.find((l) => l.id === listaId);
  const familia: FamiliaLista = esPropia ? 'aula' : (lista?.familia ?? 'aula');

  const lecturaPropia = useMemo(() => leerListaPropia(textoPropio), [textoPropio]);

  const respuestas = useMemo(
    () => agruparRespuestas(esPropia ? lecturaPropia.elementos : elementosDeLista(listaId, tablas)),
    [esPropia, lecturaPropia, listaId, tablas],
  );

  // El tamaño elegido, o —si la lista no lo llena— el mayor disponible que no lo pase.
  const tamanoElegido = TAMANOS.find((t) => t.id === tamanoId) ?? TAMANOS[0];
  const tamanoActivo: Tamano | null = tamanoDisponible(respuestas.length, tamanoElegido)
    ? tamanoElegido
    : ([...TAMANOS]
        .filter((t) => tamanoDisponible(respuestas.length, t) && casillasDe(t) <= casillasDe(tamanoElegido))
        .sort((a, b) => casillasDe(b) - casillasDe(a))[0] ??
      TAMANOS.find((t) => tamanoDisponible(respuestas.length, t)) ??
      null);

  const olvidarPartida = () => {
    setPartida(null);
    setSalidas([]);
    setNumeroComprobar('');
  };

  const elegirLista = (id: string) => {
    setListaId(id);
    olvidarPartida();
  };

  const alternarTabla = (t: number) => {
    const nuevas = tablas.includes(t) ? tablas.filter((x) => x !== t) : [...tablas, t];
    if (nuevas.length === 0) return; // siempre queda al menos una tabla
    setTablas(nuevas);
    olvidarPartida();
  };

  /** `otraTirada` ignora el n.º escrito a mano: si no, «Otra tirada» repetiría los mismos cartones. */
  const generar = (otraTirada: boolean) => {
    if (!tamanoActivo) return;
    if (otraTirada) setSemillaManual('');
    const base = otraTirada ? 0 : Number(semillaManual.replace(/\D/g, ''));
    const semilla = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;
    const nueva = prepararPartida(respuestas, tamanoActivo, cantidad, semilla);
    setPartida({
      ...nueva,
      semilla,
      tamano: tamanoActivo,
      nombreLista: esPropia ? 'Lista propia' : (lista?.nombre ?? ''),
      familia,
    });
    setSalidas([]);
    setNumeroComprobar('');
    setMostrarRespuestas(familia === 'ocio');
  };

  const sacar = () => {
    if (!partida) return;
    const bola = sacarBola(partida, new Set(salidas.map((s) => s.indice)), Math.random);
    if (bola) setSalidas([...salidas, bola]);
  };

  const ultima = salidas.length > 0 ? salidas[salidas.length - 1] : null;
  const respuestaUltima = partida && ultima ? partida.enJuego[ultima.indice] : null;
  const totalBolas = partida?.enJuego.length ?? 0;
  const quedan = totalBolas - salidas.length;

  // Comprobación de un cartón por su número
  const comprobacion = useMemo(() => {
    if (!partida || numeroComprobar.trim() === '') return '';
    const n = Number(numeroComprobar.replace(/\D/g, ''));
    const carton = partida.cartones.find((c) => c.numero === n);
    if (!carton) return `En esta partida no hay cartón n.º ${n}: van del 1 al ${partida.cartones.length}.`;
    const r = comprobarCarton(carton, new Set(salidas.map((s) => s.indice)));
    if (r.lleno) return `Cartón ${n}: ✓ cartón lleno.`;
    const filas = r.filasCompletas.join(' y ');
    if (r.filasCompletas.length > 0 && ganarCon === 'linea') {
      return `Cartón ${n}: ✓ línea en la fila ${filas}.`;
    }
    if (r.filasCompletas.length > 0) {
      return `Cartón ${n}: tiene línea en la fila ${filas}, pero esta partida se gana con cartón lleno y le faltan ${r.faltan} casillas.`;
    }
    return `Cartón ${n}: todavía no. Le faltan ${r.faltan} de ${casillasDe(partida.tamano)} casillas y no tiene ninguna fila completa.`;
  }, [partida, numeroComprobar, salidas, ganarCon]);

  const avisoTamano = !tamanoActivo
    ? `Esta lista tiene ${respuestas.length} respuestas distintas y el cartón más pequeño (3×3) necesita ${minimoPara(TAMANOS[0])}. Añade más.`
    : tamanoActivo.id !== tamanoElegido.id
      ? `El ${tamanoElegido.id.replace('x', '×')} necesita ${minimoPara(tamanoElegido)} respuestas y esta lista tiene ${respuestas.length}: se usará el ${tamanoActivo.id.replace('x', '×')}.`
      : `${respuestas.length} respuestas distintas · en cada partida entran en juego ${enJuegoPara(respuestas.length, tamanoActivo)}.`;

  const avisosPropia: string[] = [];
  if (lecturaPropia.repetidas > 0) avisosPropia.push(`${lecturaPropia.repetidas} línea(s) repetida(s) descartada(s).`);
  if (lecturaPropia.respuestasCompartidas > 0) {
    avisosPropia.push(
      `${lecturaPropia.respuestasCompartidas} respuesta(s) salen de más de una pregunta: ocupan una sola casilla y el bombo canta una de sus preguntas.`,
    );
  }
  if (lecturaPropia.largas > 0) {
    avisosPropia.push(`${lecturaPropia.largas} casilla(s) de más de ${LARGO_RECOMENDADO} caracteres: saldrán con letra pequeña.`);
  }
  if (lecturaPropia.sobrantes > 0) {
    avisosPropia.push(`Solo se usan las ${MAX_LINEAS_PROPIAS} primeras líneas: ${lecturaPropia.sobrantes} se han quedado fuera.`);
  }

  const reglaGanar =
    ganarCon === 'lleno'
      ? 'Se gana con cartón lleno: todas las casillas tachadas.'
      : 'Se gana con línea: una fila horizontal completa.';

  const columnasHoja = partida && partida.tamano.columnas >= 5 ? styles.rejillaAncha : styles.rejillaEstrecha;
  const todoCorto = partida ? partida.enJuego.every((r) => r.carton.length <= 3) : false;

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🎯</span> Bingo Personalizado
          </h1>
          <p className={styles.subtitle}>
            Cartones con tus palabras o con juegos ya hechos: el bombo canta «7 × 8» y en el cartón está
            el 56; canta «gato» y en el cartón está «cat».
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          {/* ── Configuración ─────────────────────────────── */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Elige el juego
            </h2>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Para clase</span>
              <div className={styles.grupoListas} role="group" aria-label="Juegos para clase">
                {LISTAS.filter((l) => l.familia === 'aula').map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`${styles.btnLista} ${listaId === l.id ? styles.btnActivo : ''}`}
                    aria-pressed={listaId === l.id}
                    onClick={() => elegirLista(l.id)}
                  >
                    <span aria-hidden="true">{l.icono}</span> {l.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Para jugar en casa o con amigos</span>
              <div className={styles.grupoListas} role="group" aria-label="Juegos para casa">
                {LISTAS.filter((l) => l.familia === 'ocio').map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`${styles.btnLista} ${listaId === l.id ? styles.btnActivo : ''}`}
                    aria-pressed={listaId === l.id}
                    onClick={() => elegirLista(l.id)}
                  >
                    <span aria-hidden="true">{l.icono}</span> {l.nombre}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.btnLista} ${esPropia ? styles.btnActivo : ''}`}
                  aria-pressed={esPropia}
                  onClick={() => elegirLista(ID_PROPIA)}
                >
                  <span aria-hidden="true">✏️</span> Lista propia
                </button>
              </div>
            </div>

            <p className={styles.ejemplo}>
              {esPropia
                ? 'Una línea por casilla. Con «pregunta = respuesta», el bombo canta lo de la izquierda y el cartón lleva lo de la derecha.'
                : (lista?.ejemplo ?? '')}
            </p>

            {listaId === 'tablas' && (
              <div className={styles.campo}>
                <span className={styles.etiqueta}>Tablas que entran</span>
                <div className={styles.grupoTablas} role="group" aria-label="Tablas de multiplicar">
                  {TABLAS_DISPONIBLES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.btnTabla} ${tablas.includes(t) ? styles.btnActivo : ''}`}
                      aria-pressed={tablas.includes(t)}
                      aria-label={`Tabla del ${t}`}
                      onClick={() => alternarTabla(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {esPropia && (
              <div className={styles.campo}>
                <label htmlFor="lista-propia" className={styles.etiqueta}>
                  Tu lista
                </label>
                <textarea
                  id="lista-propia"
                  className={styles.areaTexto}
                  value={textoPropio}
                  onChange={(e) => {
                    setTextoPropio(e.target.value);
                    olvidarPartida();
                  }}
                  placeholder={EJEMPLO_PROPIA}
                  rows={8}
                />
                <ul className={styles.avisos} aria-live="polite">
                  {avisosPropia.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Tamaño del cartón</span>
              <div className={styles.gruposTamano}>
                {(['filas3', 'cuadrado'] as const).map((grupo) => (
                  <div key={grupo} className={styles.grupoTamano}>
                    <span className={styles.subetiqueta}>{grupo === 'filas3' ? '3 filas' : 'Cuadrado'}</span>
                    <div
                      className={styles.filaBotones}
                      role="group"
                      aria-label={grupo === 'filas3' ? 'Cartones de 3 filas' : 'Cartones cuadrados'}
                    >
                      {TAMANOS.filter((t) => t.grupo === grupo).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={`${styles.btnTamano} ${tamanoActivo?.id === t.id ? styles.btnActivo : ''}`}
                          aria-pressed={tamanoActivo?.id === t.id}
                          disabled={!tamanoDisponible(respuestas.length, t)}
                          title={`${casillasDe(t)} casillas · necesita ${minimoPara(t)} respuestas`}
                          onClick={() => {
                            setTamanoId(t.id);
                            olvidarPartida();
                          }}
                        >
                          {t.filas}×{t.columnas}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.nota} aria-live="polite">
                {avisoTamano}
              </p>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Se gana con</span>
              <div className={styles.filaBotones} role="group" aria-label="Cómo se gana">
                <button
                  type="button"
                  className={`${styles.btnTamano} ${ganarCon === 'linea' ? styles.btnActivo : ''}`}
                  aria-pressed={ganarCon === 'linea'}
                  onClick={() => setGanarCon('linea')}
                >
                  Línea (más corta)
                </button>
                <button
                  type="button"
                  className={`${styles.btnTamano} ${ganarCon === 'lleno' ? styles.btnActivo : ''}`}
                  aria-pressed={ganarCon === 'lleno'}
                  onClick={() => setGanarCon('lleno')}
                >
                  Cartón lleno (más larga)
                </button>
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de los cartones</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={40}
                placeholder="Bingo"
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Número de cartones: {cantidad}</span>
              <input
                type="range"
                className={styles.rango}
                min={1}
                max={40}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>N.º de partida (opcional)</span>
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

            <button type="button" className={styles.btnPrimary} onClick={() => generar(false)} disabled={!tamanoActivo}>
              <span aria-hidden="true">✨</span> Generar cartones
            </button>

            {partida && (
              <div className={styles.resumenBloque}>
                <p className={styles.resumen}>
                  <strong>{partida.cartones.length}</strong> cartones distintos de{' '}
                  {partida.tamano.filas}×{partida.tamano.columnas}. Partida n.º <strong>{partida.semilla}</strong>
                  {' '}(anótalo para reimprimir los mismos).
                </p>
                <div className={styles.acciones}>
                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir cartones
                  </button>
                  <button type="button" className={styles.btnSecundario} onClick={() => generar(true)}>
                    <span aria-hidden="true">🔄</span> Otra tirada
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bombo ──────────────────────────────────────── */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🎤</span> Bombo
            </h2>

            <div className={styles.bombo}>
              <div className={styles.pantallaBombo} aria-live="polite">
                <span className={styles.emojiBombo} aria-hidden="true">
                  {respuestaUltima?.emoji ?? ''}
                </span>
                <span className={styles.preguntaBombo}>{ultima?.pregunta ?? '—'}</span>
              </div>
              <p
                className={`${styles.respuestaBombo} ${
                  mostrarRespuestas && partida?.familia === 'aula' && respuestaUltima ? '' : styles.oculta
                }`}
              >
                Respuesta: {respuestaUltima?.carton ?? ''}
              </p>
              <p className={styles.contadorBolas}>
                {partida ? `${salidas.length} de ${totalBolas} han salido` : 'Genera los cartones para empezar'}
              </p>
            </div>

            <div className={styles.acciones}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={sacar}
                disabled={!partida || quedan <= 0}
              >
                <span aria-hidden="true">🎲</span> Sacar bola
              </button>
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() => setSalidas([])}
                disabled={!partida}
              >
                <span aria-hidden="true">♻️</span> Reiniciar
              </button>
            </div>

            <button
              type="button"
              className={`${styles.btnTamano} ${mostrarRespuestas ? styles.btnActivo : ''}`}
              aria-pressed={mostrarRespuestas}
              onClick={() => setMostrarRespuestas(!mostrarRespuestas)}
            >
              Mostrar respuestas
            </button>
            <p className={styles.nota}>
              Desactívalo si proyectas el bombo en clase: así los alumnos ven la pregunta, pero no la respuesta.
            </p>

            <h3 className={styles.subtitulo}>Han salido</h3>
            <ol className={styles.historial}>
              {salidas.map((s) => {
                const r = partida?.enJuego[s.indice];
                return (
                  <li key={s.indice}>
                    <span>{s.pregunta}</span>
                    <span className={mostrarRespuestas && r?.carton !== s.pregunta ? styles.flecha : styles.oculta}>
                      {' → '}
                      {r?.carton ?? ''}
                    </span>
                  </li>
                );
              })}
            </ol>

            <h3 className={styles.subtitulo}>Comprobar un cartón</h3>
            <label className={styles.campo}>
              <span className={styles.etiqueta}>N.º del cartón que canta</span>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={numeroComprobar}
                onChange={(e) => setNumeroComprobar(e.target.value)}
                placeholder="Por ejemplo, 7"
                maxLength={3}
                disabled={!partida}
              />
            </label>
            <p className={styles.comprobacion} role="status" aria-live="polite">
              {comprobacion}
            </p>
          </div>
        </div>
      </div>

      {/* ── Hoja imprimible ─────────────────────────────── */}
      {partida && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <h2 className={styles.tituloHoja}>
            {titulo || 'Bingo'} · partida n.º {partida.semilla}
          </h2>
          <p className={styles.reglaHoja}>{reglaGanar}</p>

          <div className={`${styles.rejillaCartones} ${columnasHoja}`}>
            {partida.cartones.map((carton) => (
              <div key={carton.numero} className={`${styles.carton} ${impresion.bloque}`}>
                <div className={styles.cartonCabecera}>
                  <span>{titulo || 'Bingo'}</span>
                  <span>Cartón {carton.numero}</span>
                </div>
                <table className={`${styles.tablaCarton} ${impresion.rejilla}`}>
                  <caption className={styles.srOnly}>
                    Cartón número {carton.numero} de la partida {partida.semilla}
                  </caption>
                  <tbody>
                    {carton.casillas.map((fila, f) => (
                      <tr key={f}>
                        {fila.map((indice) => {
                          const r = partida.enJuego[indice];
                          return (
                            <td
                              key={indice}
                              lang="es"
                              className={`${styles.casilla} ${claseLargo(r.carton, todoCorto)} ${
                                partida.tamano.columnas >= 5 ? styles.casillaEstrecha : ''
                              }`}
                            >
                              <span className={styles.emojiCasilla} aria-hidden="true">
                                {r.emoji ?? ''}
                              </span>
                              <span className={styles.textoCasilla}>{r.carton}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <p className={styles.pieHoja}>
            {partida.cartones.length} cartones · {partida.nombreLista} · cartón {partida.tamano.filas}×
            {partida.tamano.columnas} · meskeia.com/bingo-personalizado
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Cómo sacarle partido al bingo personalizado"
          subtitle="Duración, tamaños, juegos de clase y de casa, y los errores que estropean una partida"
        >
          <section className={styles.guideSection}>
            <h2>Cuánto dura una partida según el cartón</h2>
            <p>
              La duración no la decide el número de casillas, sino cuántas respuestas hay en juego y cómo se
              gana. Por eso la app pone en juego el doble de las casillas de un cartón. Cifras de una simulación
              de 3.000 partidas por tamaño, con 25 jugadores (con menos jugadores sale unas pocas bolas más tarde):
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Cartón</th>
                    <th scope="col">Casillas</th>
                    <th scope="col">En juego</th>
                    <th scope="col">Primera línea</th>
                    <th scope="col">Primer cartón lleno</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['3×3', 9, 18, 5, 14],
                    ['3×4', 12, 24, 9, 20],
                    ['3×5', 15, 30, 13, 26],
                    ['3×6', 18, 36, 18, 32],
                    ['4×4', 16, 32, 11, 28],
                    ['5×5', 25, 50, 19, 46],
                  ].map(([nombre, casillas, juego, linea, lleno]) => (
                    <tr key={String(nombre)}>
                      <td>
                        <strong>{nombre}</strong>
                      </td>
                      <td>{casillas}</td>
                      <td>{juego}</td>
                      <td>hacia la bola {linea}</td>
                      <td>
                        hacia la bola {lleno} de {juego}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              En clase, si cada pregunta lleva unos 20 segundos, un 3×5 a línea dura unos 4 minutos y a cartón
              lleno, unos 9. Para una sesión corta, 3×3 o 3×4 a línea; para una partida larga en casa, 3×6 o 5×5
              a cartón lleno.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Tres formas de montar una partida</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🧑‍🏫</span> Repaso en clase
                </h3>
                <p>
                  Tablas del 6 al 9, cartones de 3×4 y uno por alumno. Se proyecta el bombo con las respuestas
                  ocultas: cada «7 × 8» lo calcula toda la clase, porque todos necesitan saber si tienen el 56.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🗣️</span> Vocabulario de otro idioma
                </h3>
                <p>
                  Con la lista propia, «palabra en español = palabra en el otro idioma». El bombo canta en
                  español y el cartón lleva la traducción, o al revés si se escribe al revés.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🎄</span> Reunión familiar o de amigos
                </h3>
                <p>
                  Animales, comida o Navidad, con su dibujo en cada casilla para que jueguen también los que aún
                  no leen. Dos cartones por persona y la partida a cartón lleno.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Paso a paso</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Elige el juego o escribe tu lista.</strong> La app cuenta las respuestas distintas y
                  solo ofrece los tamaños que la lista puede llenar.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Elige tamaño, cómo se gana y cuántos cartones.</strong> Uno por jugador, o dos si son
                  pocos y quieres más emoción.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Genera, anota el n.º de partida e imprime.</strong> Con ese número y la misma lista
                  salen otra vez los mismos cartones.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Saca bolas y comprueba.</strong> Cuando alguien cante, escribe el número de su cartón
                  en «Comprobar un cartón» y la app dice si de verdad tiene línea o cartón lleno.
                </div>
              </li>
            </ol>
          </section>

          <section className={styles.guideSection}>
            <h2>Consejos</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📏</span>
                <p>
                  <strong>Escribe el doble de casillas.</strong> Una lista de 30 palabras
                  para un 3×5 da cartones variados; con 23, el mínimo, se parecen mucho.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔁</span>
                <p>
                  <strong>Las respuestas repetidas se juntan.</strong> Si 3 × 4 y 2 × 6 dan 12, el 12 es una sola
                  casilla y el bombo canta una de las dos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✂️</span>
                <p>
                  <strong>Casillas cortas.</strong> Hasta unos {LARGO_RECOMENDADO} caracteres se leen bien
                  impresas; una frase entera sale con letra pequeña.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🙈</span>
                <p>
                  <strong>Oculta las respuestas al proyectar.</strong> En los juegos de clase el bombo arranca
                  con ellas ocultas; en los de casa no hace falta.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores que estropean una partida</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Cambiar la lista después de imprimir.</strong> El n.º de partida reproduce los cartones
                solo con la misma lista, el mismo tamaño y las mismas tablas.
              </li>
              <li>
                <strong>Dos preguntas con respuestas que se confunden.</strong> «Perú = Lima» y «capital de Perú =
                Lima» son la misma casilla; «gato = cat» y «gata = cat», también.
              </li>
              <li>
                <strong>Contar una columna como línea.</strong> Aquí la línea es siempre una fila horizontal,
                también en los cartones cuadrados: dilo antes de empezar.
              </li>
              <li>
                <strong>Generar dos veces sin anotar el número.</strong> «Otra tirada» crea cartones nuevos; los
                que ya imprimiste solo se comprueban con su n.º de partida.
              </li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="bingo-personalizado" />
        <Footer appName="bingo-personalizado" />
      </div>
    </div>
  );
}
