'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaGruposFuncionales.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import {
  CATEGORIAS,
  GRUPOS,
  NOMBRE_CATEGORIA,
  TOTAL_GRUPOS,
  coincideConLaBusqueda,
  normalizar,
  type CategoriaId,
  type Diagrama,
  type TipoEnlace,
} from './datos';
import {
  CASOS,
  TOTAL_CASOS,
  NOTA_CONVENIO,
  comprobarRespuesta,
  generarPreguntaAleatoria,
} from './casos';
import { formatNumber } from '@/lib';

/* ────────────────────────────────────────────────────────────────
   Diagramas esquemáticos (SVG inline, sin librerías externas:
   la CSP del sitio está en modo enforcement). Todos los trazos
   usan currentColor para verse bien en claro y en oscuro.
──────────────────────────────────────────────────────────────── */

interface PropsEnlace {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tipo: TipoEnlace;
  margen?: number;
}

/** Traza un enlace simple, doble o triple entre dos puntos. */
function EnlaceSvg({ x1, y1, x2, y2, tipo, margen = 21 }: PropsEnlace) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longitud = Math.hypot(dx, dy) || 1;
  const ux = dx / longitud;
  const uy = dy / longitud;
  const ax = x1 + ux * margen;
  const ay = y1 + uy * margen;
  const bx = x2 - ux * margen;
  const by = y2 - uy * margen;
  const px = -uy;
  const py = ux;
  const desplazamientos =
    tipo === 'simple' ? [0] : tipo === 'doble' ? [-3.5, 3.5] : [-6, 0, 6];

  return (
    <>
      {desplazamientos.map((desp) => (
        <line
          key={desp}
          x1={ax + px * desp}
          y1={ay + py * desp}
          x2={bx + px * desp}
          y2={by + py * desp}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

const PASO_X = 78;
const X_INICIAL = 32;
const Y_PRINCIPAL = 60;
const Y_ARRIBA = 16;
const Y_ABAJO = 104;

/** Dibuja el esquema del grupo funcional. Decorativo: aria-hidden. */
function DiagramaGrupo({ diagrama }: { diagrama: Diagrama }) {
  if (diagrama.tipo === 'benceno') {
    return (
      <svg
        className={styles.diagrama}
        viewBox="0 0 170 112"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <polygon
          points="82,55 66,82.7 34,82.7 18,55 34,27.3 66,27.3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <circle cx={50} cy={55} r={17} fill="none" stroke="currentColor" strokeWidth={2} />
        <line
          x1={86}
          y1={55}
          x2={104}
          y2={55}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <text
          x={124}
          y={55}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          className={styles.atomoClave}
        >
          {diagrama.sustituyente}
        </text>
      </svg>
    );
  }

  if (diagrama.tipo === 'ciclo3') {
    return (
      <svg
        className={styles.diagrama}
        viewBox="0 0 104 84"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <EnlaceSvg x1={52} y1={20} x2={26} y2={62} tipo="simple" margen={15} />
        <EnlaceSvg x1={52} y1={20} x2={78} y2={62} tipo="simple" margen={15} />
        <EnlaceSvg x1={26} y1={62} x2={78} y2={62} tipo="simple" margen={15} />
        <text
          x={52}
          y={20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          className={styles.atomoClave}
        >
          {diagrama.vertice}
        </text>
        <text
          x={26}
          y={62}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          fill="currentColor"
        >
          C
        </text>
        <text
          x={78}
          y={62}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          fill="currentColor"
        >
          C
        </text>
      </svg>
    );
  }

  const nodos = diagrama.nodos;
  const hayArriba = nodos.some((n) => n.ramas?.some((r) => r.direccion === 'arriba'));
  const hayAbajo = nodos.some((n) => n.ramas?.some((r) => r.direccion === 'abajo'));
  const ancho = X_INICIAL * 2 + (nodos.length - 1) * PASO_X;
  const yMin = hayArriba ? 0 : 34;
  const yMax = hayAbajo ? 122 : 86;

  return (
    <svg
      className={styles.diagrama}
      viewBox={`0 ${yMin} ${ancho} ${yMax - yMin}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {nodos.map((nodo, indice) => {
        const x = X_INICIAL + indice * PASO_X;
        return (
          <g key={`${nodo.etiqueta}-${indice}`}>
            {nodo.enlace && indice < nodos.length - 1 && (
              <EnlaceSvg
                x1={x}
                y1={Y_PRINCIPAL}
                x2={x + PASO_X}
                y2={Y_PRINCIPAL}
                tipo={nodo.enlace}
              />
            )}
            {nodo.ramas?.map((rama) => {
              const yRama = rama.direccion === 'arriba' ? Y_ARRIBA : Y_ABAJO;
              return (
                <g key={`${rama.etiqueta}-${rama.direccion}`}>
                  <EnlaceSvg
                    x1={x}
                    y1={Y_PRINCIPAL}
                    x2={x}
                    y2={yRama}
                    tipo={rama.enlace}
                    margen={16}
                  />
                  <text
                    x={x}
                    y={yRama}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={18}
                    fontWeight={600}
                    className={rama.clave ? styles.atomoClave : undefined}
                    fill="currentColor"
                  >
                    {rama.etiqueta}
                  </text>
                </g>
              );
            })}
            <text
              x={x}
              y={Y_PRINCIPAL}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight={600}
              className={nodo.clave ? styles.atomoClave : undefined}
              fill="currentColor"
            >
              {nodo.etiqueta}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

type ModoOrden = 'categoria' | 'prioridad';

export default function TablaGruposFuncionalesPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [orden, setOrden] = useState<ModoOrden>('categoria');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático: quien llega con ejercicios delante escribe directamente
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    const filtrados = GRUPOS.filter((grupo) => {
      const coincideCategoria =
        categoriaActiva === 'todas' || grupo.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      return coincideConLaBusqueda(grupo, termino);
    });

    if (orden === 'categoria') return filtrados;

    // Orden por prioridad IUPAC: los que solo pueden ser prefijo van al final
    return [...filtrados].sort((a, b) => {
      const pa = a.prioridad ?? 999;
      const pb = b.prioridad ?? 999;
      if (pa !== pb) return pa - pb;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
  }, [consulta, categoriaActiva, orden]);

  const alternarFila = (id: string) => {
    setAbiertas((previas) =>
      previas.includes(id) ? previas.filter((item) => item !== id) : [...previas, id],
    );
  };

  // ── Ficha de búsqueda de aula ──────────────────────────────────────
  // Las 12 preguntas son FIJAS y numeradas para que un profesor pueda asignarlas por su
  // número («resuelve la 3, la 7 y la 11»). La pestaña de práctica genera otra distinta a
  // partir de una semilla, y la semilla se escribe en pantalla para poder dictarla igual.
  const [pestanaAula, setPestanaAula] = useState<'preguntas' | 'practica'>('preguntas');
  const [casoActivo, setCasoActivo] = useState(1);
  const [respuestaAula, setRespuestaAula] = useState('');
  const [veredictoAula, setVeredictoAula] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [pistaAbierta, setPistaAbierta] = useState(false);
  const [pasosAbiertos, setPasosAbiertos] = useState(false);

  // Semilla inicial fija: con Math.random() aquí, el servidor y el navegador pintarían
  // preguntas distintas y la hidratación de React no cuadraría.
  const [semillaPractica, setSemillaPractica] = useState(1);
  const [respuestaPractica, setRespuestaPractica] = useState('');
  const [veredictoPractica, setVeredictoPractica] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [pasosPracticaAbiertos, setPasosPracticaAbiertos] = useState(false);

  const caso = CASOS.find((c) => c.id === casoActivo) ?? CASOS[0];
  const preguntaPractica = useMemo(() => generarPreguntaAleatoria(semillaPractica), [semillaPractica]);

  const elegirCaso = (id: number) => {
    setCasoActivo(id);
    setRespuestaAula('');
    setVeredictoAula(null);
    setPistaAbierta(false);
    setPasosAbiertos(false);
  };

  const comprobarCaso = () => setVeredictoAula(comprobarRespuesta(respuestaAula, caso));

  const comprobarPractica = () =>
    setVeredictoPractica(comprobarRespuesta(respuestaPractica, preguntaPractica));

  const otraPregunta = () => {
    setSemillaPractica(Math.floor(Math.random() * 99999) + 1);
    setRespuestaPractica('');
    setVeredictoPractica(null);
    setPasosPracticaAbiertos(false);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚗️</span> Tabla de Grupos Funcionales
        </h1>
        <p className={styles.subtitle}>
          {TOTAL_GRUPOS} grupos funcionales de química orgánica con su fórmula, su sufijo y su
          prefijo IUPAC, un ejemplo con el nombre construido paso a paso y sus propiedades
          características. Ordena la tabla por prioridad y descubre qué grupo manda cuando hay
          varios en la misma molécula.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros + orden */}
      <section className={styles.buscadorPanel} aria-label="Buscador de grupos funcionales">
        <label className={styles.buscadorLabel} htmlFor="buscador-grupos">
          Busca un grupo funcional por nombre, fórmula o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-grupos"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="COOH, cetona, amina, éster, OH, nitrilo…"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.limpiarBtn}
            onClick={() => {
              setConsulta('');
              setCategoriaActiva('todas');
              buscadorRef.current?.focus({ preventScroll: true });
            }}
          >
            <span aria-hidden="true">✕</span> Limpiar
          </button>
        </div>
        <p className={styles.ayudaBusqueda}>
          Funciona con acentos o sin ellos y con sinónimos: <strong>COOH</strong> encuentra el ácido
          carboxílico, <strong>CHO</strong> el aldehído, <strong>NH2</strong> la amina y{' '}
          <strong>mercaptano</strong> el tiol.
        </p>

        <div className={styles.filtros}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${
              categoriaActiva === 'todas' ? styles.filtroBtnActivo : ''
            }`}
            aria-pressed={categoriaActiva === 'todas'}
            onClick={() => setCategoriaActiva('todas')}
          >
            Todas
          </button>
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={`${styles.filtroBtn} ${
                categoriaActiva === categoria.id ? styles.filtroBtnActivo : ''
              }`}
              aria-pressed={categoriaActiva === categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
            >
              <span aria-hidden="true">{categoria.icono}</span> {categoria.nombre}
            </button>
          ))}
        </div>

        <div className={styles.ordenPanel}>
          <span className={styles.ordenEtiqueta}>Ordenar por:</span>
          <button
            type="button"
            className={`${styles.ordenBtn} ${orden === 'categoria' ? styles.ordenBtnActivo : ''}`}
            aria-pressed={orden === 'categoria'}
            onClick={() => setOrden('categoria')}
          >
            <span aria-hidden="true">🗂️</span> Categoría
          </button>
          <button
            type="button"
            className={`${styles.ordenBtn} ${orden === 'prioridad' ? styles.ordenBtnActivo : ''}`}
            aria-pressed={orden === 'prioridad'}
            onClick={() => setOrden('prioridad')}
          >
            <span aria-hidden="true">🏆</span> Prioridad IUPAC
          </button>
        </div>
        {orden === 'prioridad' && (
          <p className={styles.ordenAviso}>
            De arriba abajo, del grupo que siempre manda al que nunca puede dar el sufijo. El
            primero de la lista es el que fija el sufijo y numera la cadena; todos los demás pasan a
            prefijo.
          </p>
        )}

        <p className={styles.contador} role="status" aria-live="polite">
          {resultados.length} de {TOTAL_GRUPOS} grupos funcionales
        </p>
      </section>

      {/* Tabla de grupos */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> Ningún grupo funcional coincide con «{consulta}».
            Prueba con <strong>carbonilo</strong>, <strong>COOH</strong>, <strong>amida</strong>,{' '}
            <strong>tiol</strong> o <strong>aromático</strong>, o quita el filtro de categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((grupo) => {
            const abierta = abiertas.includes(grupo.id);
            return (
              <li key={grupo.id} className={styles.fila}>
                <button
                  type="button"
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${grupo.id}`}
                  onClick={() => alternarFila(grupo.id)}
                >
                  <span className={styles.filaNombre}>
                    {grupo.nombre}
                    <span className={styles.filaCategoria}>
                      {NOMBRE_CATEGORIA[grupo.categoria]}
                    </span>
                    <span
                      className={`${styles.prioridadBadge} ${
                        grupo.prioridad === null ? styles.prioridadBadgePrefijo : ''
                      }`}
                    >
                      {grupo.prioridad === null
                        ? 'Solo prefijo'
                        : `Prioridad ${grupo.prioridad}`}
                    </span>
                  </span>
                  <span className={styles.filaDatos}>
                    <span className={styles.par}>
                      <span className={styles.etq}>Grupo</span>
                      <span className={`${styles.expr} ${styles.exprFormula}`}>
                        {grupo.formula}
                      </span>
                    </span>
                    <span className={styles.par}>
                      <span className={styles.etq}>Sufijo</span>
                      <span className={styles.expr}>{grupo.sufijo}</span>
                    </span>
                    <span className={styles.par}>
                      <span className={styles.etq}>Prefijo</span>
                      <span className={styles.expr}>{grupo.prefijo}</span>
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${grupo.id}`} className={styles.detalle}>
                    <div className={styles.detalleSuperior}>
                      <div className={styles.diagramaCaja}>
                        <DiagramaGrupo diagrama={grupo.diagrama} />
                        <p className={styles.diagramaTexto}>{grupo.descripcionDiagrama}</p>
                      </div>
                      <div className={styles.ejemploCaja}>
                        <h3>
                          <span aria-hidden="true">🧪</span> Ejemplo
                        </h3>
                        <p className={styles.ejemploFormula}>{grupo.ejemploFormula}</p>
                        <p className={styles.ejemploNombre}>{grupo.ejemploNombre}</p>
                      </div>
                    </div>

                    <div className={styles.prioridadCaja}>
                      <h3>
                        <span aria-hidden="true">🏆</span>{' '}
                        {grupo.prioridad === null
                          ? 'Fuera de la escalera de sufijos'
                          : `Prioridad IUPAC ${grupo.prioridad}`}
                      </h3>
                      <p>{grupo.prioridadNota}</p>
                    </div>

                    <h3>Cómo se nombra, paso a paso</h3>
                    <ol className={styles.pasosNombre}>
                      {grupo.comoSeNombra.map((paso) => (
                        <li key={paso}>{paso}</li>
                      ))}
                    </ol>

                    <h3>Propiedades que permiten reconocerlo</h3>
                    <ul className={styles.propiedadesLista}>
                      <li>
                        <strong>Polaridad:</strong> {grupo.propiedades.polaridad}
                      </li>
                      <li>
                        <strong>Puentes de hidrógeno:</strong> {grupo.propiedades.puentesH}
                      </li>
                      <li>
                        <strong>Solubilidad en agua:</strong> {grupo.propiedades.solubilidad}
                      </li>
                      <li>
                        <strong>Punto de ebullición:</strong> {grupo.propiedades.ebullicion}
                      </li>
                    </ul>

                    {grupo.nota && (
                      <p className={styles.notaGrupo}>
                        <span aria-hidden="true">💡</span> {grupo.nota}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ═══════════ FICHA DE BÚSQUEDA DE AULA ═══════════ */}
      {/*
        Tarea asignable (12/10/2026). No es un cuestionario de resolver: las 12 preguntas se
        contestan LOCALIZANDO el dato en esta misma tabla, que es lo que un profesor quiere que
        el alumno aprenda a hacer con ella. Son fijas y numeradas para que la consigna
        «resuelve la 3, la 7 y la 11» signifique lo mismo para toda la clase. La respuesta de
        cada una la lee `casos.ts` de los MISMOS datos que pinta la tabla (`datos.ts`).
      */}
      <section id="casos-aula" className={styles.aulaPanel} aria-label="Ficha de búsqueda para el aula">
        <h2 className={styles.aulaTitulo}>
          <span aria-hidden="true">🎒</span> Ficha de búsqueda para clase
        </h2>
        <p className={styles.aulaSubtitulo}>
          {TOTAL_CASOS} preguntas numeradas que no se resuelven de memoria, sino buscando el dato
          en esta misma tabla. Son siempre las mismas para todo el mundo, así que valen como
          tarea: «entra y resuelve la 3, la 7 y la 11».
        </p>
        <p className={styles.aulaConvenio}>
          <span aria-hidden="true">📏</span> {NOTA_CONVENIO}
        </p>

        <div className={styles.aulaTabs} role="tablist" aria-label="Modo de la ficha">
          <button
            type="button"
            role="tab"
            id="aula-tab-preguntas"
            aria-selected={pestanaAula === 'preguntas'}
            aria-controls="aula-panel-preguntas"
            className={`${styles.aulaTab} ${pestanaAula === 'preguntas' ? styles.aulaTabActiva : ''}`}
            onClick={() => setPestanaAula('preguntas')}
          >
            Las {TOTAL_CASOS} preguntas
          </button>
          <button
            type="button"
            role="tab"
            id="aula-tab-practica"
            aria-selected={pestanaAula === 'practica'}
            aria-controls="aula-panel-practica"
            className={`${styles.aulaTab} ${pestanaAula === 'practica' ? styles.aulaTabActiva : ''}`}
            onClick={() => setPestanaAula('practica')}
          >
            Práctica al azar
          </button>
        </div>

        {pestanaAula === 'preguntas' && (
          <div id="aula-panel-preguntas" role="tabpanel" aria-labelledby="aula-tab-preguntas">
            <div className={styles.aulaSelector} role="group" aria-label="Elegir pregunta">
              {CASOS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.aulaNumero} ${casoActivo === c.id ? styles.aulaNumeroActivo : ''}`}
                  aria-pressed={casoActivo === c.id}
                  aria-label={`Pregunta ${c.id}: ${c.titulo}`}
                  onClick={() => elegirCaso(c.id)}
                >
                  {c.id}
                </button>
              ))}
            </div>

            <div className={styles.aulaCaso}>
              <p className={styles.aulaCasoCabecera}>
                <span className={styles.aulaCasoNumero}>Pregunta {caso.id}</span>
                <span className={styles.aulaEtiquetaTipo}>
                  {caso.categoria === 'localizar'
                    ? 'localizar un dato'
                    : caso.categoria === 'comparar'
                      ? 'comparar dos grupos'
                      : 'caso aplicado'}
                </span>
              </p>
              <h3 className={styles.aulaCasoTitulo}>{caso.titulo}</h3>
              <p className={styles.aulaEnunciado}>{caso.enunciado}</p>

              <div className={styles.aulaCampo}>
                <label htmlFor="aula-respuesta" className={styles.aulaLabel}>
                  {caso.etiquetaRespuesta}
                </label>
                <input
                  id="aula-respuesta"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  className={styles.aulaInput}
                  value={respuestaAula}
                  placeholder="Escribe lo que encuentres en la tabla"
                  onChange={(e) => setRespuestaAula(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') comprobarCaso();
                  }}
                />
              </div>

              <div className={styles.aulaAcciones}>
                <button type="button" className={styles.btnComprobar} onClick={comprobarCaso}>
                  Comprobar
                </button>
                <button
                  type="button"
                  className={styles.btnAulaSecundario}
                  aria-expanded={pistaAbierta}
                  aria-controls="aula-pista"
                  onClick={() => setPistaAbierta(!pistaAbierta)}
                >
                  {pistaAbierta ? 'Ocultar la pista' : 'Ver la pista'}
                </button>
                <button
                  type="button"
                  className={styles.btnAulaSecundario}
                  aria-expanded={pasosAbiertos}
                  aria-controls="aula-pasos"
                  onClick={() => setPasosAbiertos(!pasosAbiertos)}
                >
                  {pasosAbiertos ? 'Ocultar dónde mirar' : 'Dónde mirar'}
                </button>
              </div>

              {veredictoAula && (
                <p
                  className={`${styles.aulaVeredicto} ${veredictoAula.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
                  role="alert"
                  aria-live="polite"
                >
                  {veredictoAula.motivo}
                </p>
              )}

              {pistaAbierta && (
                <p id="aula-pista" className={styles.aulaPista}>
                  {caso.pista}
                </p>
              )}

              {pasosAbiertos && (
                <div id="aula-pasos" className={styles.aulaPasos}>
                  <h4 className={styles.aulaPasosTitulo}>El recorrido por la tabla</h4>
                  <ol className={styles.aulaPasosLista}>
                    {caso.pasos.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                  <p className={styles.aulaDato}>
                    <strong>{caso.etiquetaRespuesta}:</strong> {caso.respuesta}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {pestanaAula === 'practica' && (
          <div id="aula-panel-practica" role="tabpanel" aria-labelledby="aula-tab-practica">
            <div className={styles.aulaCaso}>
              <p className={styles.aulaCasoCabecera}>
                <span className={styles.aulaCasoNumero}>Pregunta de práctica</span>
                <span className={styles.aulaSemilla}>
                  semilla {formatNumber(preguntaPractica.semilla, 0)}
                </span>
              </p>
              <p className={styles.aulaEnunciado}>{preguntaPractica.enunciado}</p>

              <div className={styles.aulaCampo}>
                <label htmlFor="aula-respuesta-practica" className={styles.aulaLabel}>
                  {preguntaPractica.etiquetaRespuesta}
                </label>
                <input
                  id="aula-respuesta-practica"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  className={styles.aulaInput}
                  value={respuestaPractica}
                  placeholder="Escribe lo que encuentres en la tabla"
                  onChange={(e) => setRespuestaPractica(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') comprobarPractica();
                  }}
                />
              </div>

              <div className={styles.aulaAcciones}>
                <button type="button" className={styles.btnComprobar} onClick={comprobarPractica}>
                  Comprobar
                </button>
                <button type="button" className={styles.btnAulaSecundario} onClick={otraPregunta}>
                  Otra pregunta
                </button>
                <button
                  type="button"
                  className={styles.btnAulaSecundario}
                  aria-expanded={pasosPracticaAbiertos}
                  aria-controls="aula-pasos-practica"
                  onClick={() => setPasosPracticaAbiertos(!pasosPracticaAbiertos)}
                >
                  {pasosPracticaAbiertos ? 'Ocultar dónde mirar' : 'Dónde mirar'}
                </button>
              </div>

              {veredictoPractica && (
                <p
                  className={`${styles.aulaVeredicto} ${veredictoPractica.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
                  role="alert"
                  aria-live="polite"
                >
                  {veredictoPractica.motivo}
                </p>
              )}

              {pasosPracticaAbiertos && (
                <div id="aula-pasos-practica" className={styles.aulaPasos}>
                  <h4 className={styles.aulaPasosTitulo}>El recorrido por la tabla</h4>
                  <ol className={styles.aulaPasosLista}>
                    {preguntaPractica.pasos.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                  <p className={styles.aulaDato}>
                    <strong>{preguntaPractica.etiquetaRespuesta}:</strong> {preguntaPractica.respuesta}
                  </p>
                </div>
              )}
            </div>

            <p className={styles.aulaNota}>
              Cada semilla da siempre la misma pregunta: si la dictas en voz alta, toda la clase
              trabaja sobre la misma. Los datos salen de esta tabla, no de una lista aparte.
            </p>
          </div>
        )}
      </section>

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender la nomenclatura, no memorizarla"
        subtitle="Qué es un grupo funcional, cómo decide la IUPAC quién manda y cómo construir un nombre completo"
      >
        <section className={styles.guideSection}>
          <h2>Qué es un grupo funcional</h2>
          <p>
            Un grupo funcional es el conjunto de átomos que concentra la reactividad de una molécula
            orgánica. El esqueleto de carbonos aporta el tamaño y la forma, pero es el grupo
            funcional el que decide cómo se comporta el compuesto: si es ácido o básico, si se
            disuelve en agua, con qué reacciona y a qué temperatura hierve. Dos moléculas con el
            mismo número de carbonos y distinto grupo funcional pueden tener propiedades opuestas.
          </p>
          <p>
            El caso más claro es el par etanol / éter dimetílico. Ambos responden a la fórmula
            molecular C₂H₆O, pero el primero es un alcohol que hierve a 78 °C y se mezcla con agua
            en cualquier proporción, y el segundo es un éter que hierve a −24 °C y es un gas. La
            única diferencia es dónde está colocado el oxígeno.
          </p>
          <div className={styles.formulaBox}>
            CH₃–CH₂–OH (etanol, 78 °C) &nbsp; frente a &nbsp; CH₃–O–CH₃ (éter dimetílico, −24 °C)
          </div>

          <h2>La escalera de prioridad IUPAC, de un vistazo</h2>
          <p>
            Cuando una molécula tiene varios grupos funcionales, solo uno se nombra como sufijo: el
            de mayor prioridad. Ese grupo, además, es el que fija la numeración de la cadena. Todos
            los demás pasan a prefijo y se citan por orden alfabético. Esta es la duda más frecuente
            al nombrar compuestos y la razón de que la tabla de arriba se pueda ordenar por
            prioridad.
          </p>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Grupo funcional</th>
                  <th>Sufijo</th>
                  <th>Prefijo cuando pierde</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <strong>Ácido carboxílico</strong>
                  </td>
                  <td>ácido …-oico</td>
                  <td>carboxi-</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Ácido sulfónico</td>
                  <td>ácido …-sulfónico</td>
                  <td>sulfo-</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Anhídrido</td>
                  <td>anhídrido …-oico</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Éster</td>
                  <td>-oato de …ilo</td>
                  <td>alcoxicarbonil- / aciloxi-</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Haluro de acilo</td>
                  <td>haluro de …-oílo</td>
                  <td>halocarbonil-</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Amida</td>
                  <td>-amida</td>
                  <td>carbamoíl-</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Nitrilo</td>
                  <td>-nitrilo</td>
                  <td>ciano-</td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>Aldehído</td>
                  <td>-al</td>
                  <td>oxo- / formil-</td>
                </tr>
                <tr>
                  <td>9</td>
                  <td>Cetona</td>
                  <td>-ona</td>
                  <td>oxo-</td>
                </tr>
                <tr>
                  <td>10</td>
                  <td>Alcohol y fenol</td>
                  <td>-ol</td>
                  <td>hidroxi-</td>
                </tr>
                <tr>
                  <td>11</td>
                  <td>Tiol</td>
                  <td>-tiol</td>
                  <td>sulfanil-</td>
                </tr>
                <tr>
                  <td>13</td>
                  <td>Amina</td>
                  <td>-amina</td>
                  <td>amino-</td>
                </tr>
                <tr>
                  <td>14</td>
                  <td>Imina</td>
                  <td>-imina</td>
                  <td>imino-</td>
                </tr>
                <tr>
                  <td>15</td>
                  <td>Éter</td>
                  <td>—</td>
                  <td>alcoxi-</td>
                </tr>
                <tr>
                  <td>16-17</td>
                  <td>Alqueno, alquino, alcano y areno</td>
                  <td>-eno / -ino / -ano</td>
                  <td>alquenil- / alquinil- / alquil- / fenil-</td>
                </tr>
                <tr>
                  <td>Sin nivel</td>
                  <td>Halógenos, nitro, azo, isocianato, epóxido</td>
                  <td>—</td>
                  <td>cloro-, nitro-, azo-, isocianato-, epoxi-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            El nivel 12 corresponde a los hidroperóxidos (–OOH), poco frecuentes en los ejercicios
            de clase, y por eso no aparece en la tabla de arriba como fila propia.
          </p>

          <h2>Dónde se usa esto de verdad</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📝
              </span>
              <strong>Nombrar un compuesto en un examen</strong>
              <p>
                Es el uso directo: identificar el grupo de mayor prioridad, escoger el sufijo,
                numerar la cadena desde el extremo correcto y colocar el resto como prefijos por
                orden alfabético.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🔬
              </span>
              <strong>Predecir propiedades sin datos</strong>
              <p>
                Ver un –COOH permite anticipar que el compuesto será ácido, soluble si la cadena es
                corta y de punto de ebullición alto. El grupo funcional es un atajo para razonar
                sobre una molécula desconocida.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💊
              </span>
              <strong>Leer una etiqueta o un prospecto</strong>
              <p>
                Los nombres de medicamentos, aditivos y cosméticos son nomenclatura orgánica. Saber
                que un «-oato» es un éster o que una «-amida» procede de un ácido cambia por completo
                lo que se entiende al leerlos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎓
              </span>
              <strong>Preparar un examen de admisión universitaria</strong>
              <p>
                La formulación orgánica aparece en las pruebas de acceso a la universidad de
                prácticamente todos los países hispanohablantes, y casi siempre con la misma
                estructura: nombrar cinco compuestos y formular otros cinco.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué en el ácido láctico el –OH se llama «hidroxi» y no «ol»?</h4>
              <p>
                Porque en CH₃–CH(OH)–COOH conviven un alcohol y un ácido carboxílico, y el ácido
                tiene prioridad 1 frente a la prioridad 10 del alcohol. El ácido se lleva el sufijo
                (-oico) y el carbono del carboxilo es el número 1. Al alcohol solo le queda el
                prefijo con su localizador: ácido 2-hidroxipropanoico.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla mental: solo hay un sufijo por nombre. Todo
                lo demás son prefijos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo distingo un aldehído de una cetona en la fórmula?</h4>
              <p>
                Mira dónde está el carbonilo. Si el carbono del C=O tiene un hidrógeno y está en el
                extremo de la cadena, es un aldehído (–CHO) y no necesita localizador porque siempre
                es el carbono 1. Si está entre dos carbonos, es una cetona y sí lleva número. Además
                el aldehído se oxida con facilidad a ácido y la cetona no.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Escrito en línea, CH₃CHO es aldehído y CH₃COCH₃
                es cetona.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el grupo nitro nunca da sufijo si parece muy importante?</h4>
              <p>
                La IUPAC reserva los sufijos para las clases de compuestos que definen una función
                química reconocida. Un puñado de grupos quedan fuera por convenio y solo pueden ser
                prefijos: los halógenos, el nitro (–NO₂), el nitroso, el azo, los isocianatos y los
                epóxidos. Da igual cuántos haya en la molécula: siempre irán delante.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Ordena la tabla de arriba por prioridad: estos
                grupos aparecen agrupados al final, marcados como «solo prefijo».
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Los nombres tradicionales como acetona o ácido acético siguen valiendo?</h4>
              <p>
                Sí. La IUPAC mantiene una lista de nombres retenidos de uso tan extendido que
                sustituirlos sería contraproducente: ácido acético, ácido fórmico, acetona, tolueno,
                fenol, anilina, urea o glicerol. En un examen conviene escribir el nombre
                sistemático y, si acaso, el tradicional entre paréntesis.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Los nombres tradicionales que la IUPAC ya no
                acepta son otros, como «mercaptano» en lugar de tiol.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué significa exactamente que un grupo «numera la cadena»?</h4>
              <p>
                Que se cuentan los carbonos desde el extremo que dé el número más bajo al grupo
                principal, no al primer sustituyente que se encuentre. En CH₃–CH(Cl)–CH₂–OH la
                cadena se numera desde el –OH aunque el cloro quede así en la posición 2: el nombre
                es 2-cloropropan-1-ol y nunca 2-cloropropan-3-ol.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> El orden de decisión es: grupo principal, luego
                insaturaciones, luego sustituyentes.
              </p>
            </div>
          </div>

          <h2>Cómo nombrar cualquier compuesto sin bloquearte</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Localiza todos los grupos funcionales</strong>
                <p>
                  Recorre la fórmula buscando heteroátomos (O, N, S, halógenos) y enlaces múltiples.
                  Anótalos todos antes de decidir nada; el error más común es empezar a nombrar con
                  el primero que se ve.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide cuál manda</strong>
                <p>
                  Compara sus prioridades en la escalera. El más alto será el sufijo; todos los
                  demás, prefijos. Si solo hay grupos «sin nivel», la cadena se nombra como
                  hidrocarburo y todo va delante.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Elige y numera la cadena principal</strong>
                <p>
                  La cadena más larga que contenga el grupo principal. Numérala desde el extremo que
                  dé el localizador más bajo a ese grupo, aunque perjudique a los sustituyentes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Monta el nombre</strong>
                <p>
                  Prefijos por orden alfabético con sus localizadores, después la raíz del número de
                  carbonos, después la insaturación si la hay y, al final, el sufijo del grupo
                  principal.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba dibujando el nombre al revés</strong>
                <p>
                  Formula tu propio nombre desde cero y compara con el enunciado. Si no coincide,
                  el fallo casi siempre está en la numeración o en un sufijo que debía ser prefijo.
                </p>
              </div>
            </div>
          </div>

          <h2>Consejos para reconocer grupos de un vistazo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Empieza por el heteroátomo</strong>
              <p>
                Encuentra el O, el N o el S y mira qué tiene alrededor: eso identifica el grupo en
                un segundo, sin recorrer toda la fórmula.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧲
              </span>
              <strong>Agrupa por el carbonilo</strong>
              <p>
                Aldehído, cetona, ácido, éster, amida, anhídrido y haluro de acilo comparten el C=O.
                Lo que cambia es qué hay al otro lado, y ese detalle fija el orden de prioridad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💧
              </span>
              <strong>Usa el punto de ebullición como pista</strong>
              <p>
                Si dona puentes de hidrógeno (–OH, –NH, –COOH) hierve alto. Si solo los acepta
                (éter, éster, cetona), bastante menos. Si no los forma (alcano, haluro), lo más bajo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔄
              </span>
              <strong>Relaciona el azufre con el oxígeno</strong>
              <p>
                Tiol y alcohol, tioéter y éter son análogos: cambia S por O. Pero el azufre casi no
                forma puentes de hidrógeno, así que las propiedades no se copian.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes al nombrar compuestos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Poner dos sufijos en el mismo nombre:</strong> «ácido hidroxipropanoico» es
                correcto, «ácido propanoicol» no existe. Solo el grupo de mayor prioridad da sufijo.
              </li>
              <li>
                <strong>Numerar desde el sustituyente y no desde el grupo principal:</strong> en
                CH₃–CH(Cl)–CH₂–OH el nombre es 2-cloropropan-1-ol, no 2-cloropropan-3-ol.
              </li>
              <li>
                <strong>Olvidar que el carbono del –COOH, –CHO y –C≡N cuenta:</strong> CH₃–CHO tiene
                dos carbonos y se llama etanal, no metanal.
              </li>
              <li>
                <strong>Confundir éter y éster:</strong> el éter es R–O–R′ sin carbonilo; el éster
                es R–CO–O–R′ y procede de un ácido. Una sola letra, dos familias muy distintas.
              </li>
              <li>
                <strong>Tratar el fenol como un alcohol cualquiera:</strong> el –OH unido al anillo
                aromático es unas mil veces más ácido y tiene su propio nombre de clase.
              </li>
              <li>
                <strong>Dar sufijo a un halógeno o al grupo nitro:</strong> no existe el sufijo
                «-cloro» ni «-nitro». Siempre van delante, como prefijos.
              </li>
              <li>
                <strong>Colocar los prefijos por orden de aparición:</strong> se ordenan
                alfabéticamente, no por su posición en la cadena: 3-etil-2-metilpentano.
              </li>
              <li>
                <strong>Suponer que la amina es tan polar como el alcohol:</strong> el nitrógeno es
                menos electronegativo que el oxígeno, así que las aminas hierven bastante por debajo
                de los alcoholes equivalentes.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde los primeros cursos de química orgánica de la educación media y
            la preparatoria hasta la química orgánica de primer curso universitario en carreras de
            ciencias, ingeniería, farmacia o medicina. Los grupos de las categorías de
            hidrocarburos, oxigenados y nitrogenados son los que aparecen en cualquier examen de
            admisión universitaria; los azufrados y los organometálicos suelen entrar ya en la
            universidad.
          </p>
          <p>
            La nomenclatura recogida sigue las recomendaciones IUPAC de 2013, que son las vigentes.
            Cuando un nombre tradicional sigue estando aceptado (ácido acético, acetona, tolueno,
            fenol) aparece entre paréntesis junto al sistemático.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="tabla-grupos-funcionales" />

      <Footer appName="tabla-grupos-funcionales" />
    </div>
  );
}
