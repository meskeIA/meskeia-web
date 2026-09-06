'use client';

import { useMemo, useState } from 'react';
import styles from './SimuladorProgresiones.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  CASOS,
  TERMINOS_VISIBLES,
  TOTAL_CASOS,
  comprobarRespuesta,
  convergeSerieGeometrica,
  formatearFlexible,
  generarEjercicioAleatorio,
  identificarProgresion,
  parsearListaNumeros,
  razonEsUno,
  resolverProgresion,
  subindice,
  sumaAritmetica,
  sumaGeometrica,
  sumaInfinitaGeometrica,
  terminoGeneralAritmetico,
  terminoGeneralGeometrico,
  terminosAritmeticos,
  terminosGeometricos,
  type Comprobacion,
  type EjercicioAleatorio,
  type ResultadoIdentificacion,
} from './motor';

// ============================================================
// TIPOS DE LA VISTA
// ============================================================

type Pestana = 'aritmetica' | 'geometrica' | 'identificar' | 'casos';

interface GraficaProps {
  serie: number[];
  serieComparacion?: number[];
  etiquetaSerie: string;
  etiquetaComparacion?: string;
  descripcion: string;
  mostrarRecta?: boolean;
}

// ============================================================
// GRÁFICA DE TÉRMINOS
// ============================================================

/**
 * Dibuja los términos como puntos numerados por su posición n.
 *
 * El eje vertical incluye SIEMPRE el cero: sin él, una geométrica y una aritmética se
 * verían igual de empinadas y la comparación —que es lo único que esta gráfica tiene que
 * enseñar— dejaría de significar nada.
 */
function GraficaProgresion({
  serie,
  serieComparacion,
  etiquetaSerie,
  etiquetaComparacion,
  descripcion,
  mostrarRecta = false,
}: GraficaProps) {
  const ancho = 520;
  const alto = 300;
  const margenIzq = 60;
  const margenDer = 18;
  const margenSup = 18;
  const margenInf = 36;

  const finitos = [...serie, ...(serieComparacion ?? [])].filter((v) => Number.isFinite(v));
  if (serie.length < 2 || finitos.length === 0) {
    return <p className={styles.notaPie}>No hay términos suficientes para dibujar la gráfica.</p>;
  }

  let minimo = Math.min(...finitos, 0);
  let maximo = Math.max(...finitos, 0);
  if (maximo - minimo < 1e-9) {
    maximo += 1;
    minimo -= 1;
  }

  const px = (indice: number): number =>
    margenIzq + (indice * (ancho - margenIzq - margenDer)) / (serie.length - 1);
  const py = (valor: number): number =>
    margenSup + ((maximo - valor) / (maximo - minimo)) * (alto - margenSup - margenInf);

  const puntos = (valores: number[]): string =>
    valores
      .map((v, i) => (Number.isFinite(v) ? `${px(i)},${py(v)}` : ''))
      .filter((p) => p !== '')
      .join(' ');

  const yCero = py(0);

  return (
    <figure className={styles.graficaCaja}>
      <svg className={styles.graficaSvg} viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={descripcion}>
        <title>{descripcion}</title>

        {/* Ejes */}
        <line className={styles.svgEje} x1={margenIzq} y1={margenSup} x2={margenIzq} y2={alto - margenInf} />
        <line
          className={styles.svgEjeCero}
          x1={margenIzq}
          y1={yCero}
          x2={ancho - margenDer}
          y2={yCero}
        />

        {/* Etiquetas del eje vertical */}
        <text className={styles.svgTextoEje} x={margenIzq - 8} y={margenSup + 10} textAnchor="end">
          {formatearFlexible(maximo, 1)}
        </text>
        <text className={styles.svgTextoEje} x={margenIzq - 8} y={yCero + 4} textAnchor="end">
          0
        </text>
        {minimo < -1e-9 && (
          <text className={styles.svgTextoEje} x={margenIzq - 8} y={alto - margenInf} textAnchor="end">
            {formatearFlexible(minimo, 1)}
          </text>
        )}

        {/* Etiquetas del eje horizontal */}
        <text className={styles.svgTextoEje} x={margenIzq} y={alto - margenInf + 20} textAnchor="middle">
          n = 1
        </text>
        <text
          className={styles.svgTextoEje}
          x={ancho - margenDer}
          y={alto - margenInf + 20}
          textAnchor="end"
        >
          n = {formatNumber(serie.length, 0)}
        </text>

        {/* Recta que une el primero con el último: en una aritmética pasa por todos */}
        {mostrarRecta && (
          <line
            className={styles.svgRectaGuia}
            x1={px(0)}
            y1={py(serie[0])}
            x2={px(serie.length - 1)}
            y2={py(serie[serie.length - 1])}
          />
        )}

        {/* Serie de comparación (la aritmética, en el panel geométrico) */}
        {serieComparacion && serieComparacion.length > 1 && (
          <>
            <polyline className={styles.svgLineaComparacion} points={puntos(serieComparacion)} />
            {serieComparacion.map((v, i) =>
              Number.isFinite(v) ? (
                <circle key={`comp-${i}`} className={styles.svgPuntoComparacion} cx={px(i)} cy={py(v)} r={3.5} />
              ) : null,
            )}
          </>
        )}

        {/* Serie principal */}
        <polyline className={styles.svgLineaSerie} points={puntos(serie)} />
        {serie.map((v, i) =>
          Number.isFinite(v) ? (
            <circle key={`serie-${i}`} className={styles.svgPunto} cx={px(i)} cy={py(v)} r={4.5} />
          ) : null,
        )}
      </svg>

      <figcaption className={styles.leyendaGrafica}>
        <span className={styles.leyendaItem}>
          <span className={`${styles.leyendaColor} ${styles.leyendaSerie}`} aria-hidden="true" />
          {etiquetaSerie}
        </span>
        {etiquetaComparacion && (
          <span className={styles.leyendaItem}>
            <span className={`${styles.leyendaColor} ${styles.leyendaComparacion}`} aria-hidden="true" />
            {etiquetaComparacion}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

// ============================================================
// LISTA DE TÉRMINOS
// ============================================================

function ListaTerminos({ terminos }: { terminos: number[] }) {
  return (
    <ol className={styles.terminosLista}>
      {terminos.map((valor, indice) => (
        <li key={indice} className={styles.terminoChip}>
          <span className={styles.terminoIndice}>a{subindice(indice + 1)}</span>
          <span className={styles.terminoValor}>{formatearFlexible(valor)}</span>
        </li>
      ))}
    </ol>
  );
}

// ============================================================
// PÁGINA
// ============================================================

export default function SimuladorProgresionesPage() {
  const [pestana, setPestana] = useState<Pestana>('aritmetica');

  // Progresión aritmética
  const [a1Aritmetica, setA1Aritmetica] = useState(4);
  const [diferencia, setDiferencia] = useState(7);
  const [nAritmetica, setNAritmetica] = useState('50');

  // Progresión geométrica. La razón se guarda como ENTERO y se divide entre 10 al usarla:
  // así r = 1 se alcanza exacto y la rama especial de la suma (r = 1) es accesible desde
  // el deslizador. Con `step={0.1}` el navegador puede entregar 0,9999999999999999.
  const [a1Geometrica, setA1Geometrica] = useState(2);
  const [razonDecima, setRazonDecima] = useState(20);
  const [nGeometrica, setNGeometrica] = useState('12');
  const razon = razonDecima / 10;

  // Identificar
  const [entradaSucesion, setEntradaSucesion] = useState('');
  const [analisis, setAnalisis] = useState<ResultadoIdentificacion | null>(null);
  const [errorIdentificar, setErrorIdentificar] = useState('');

  // Casos numerados
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [veredictos, setVeredictos] = useState<Record<number, Comprobacion>>({});
  const [solucionesAbiertas, setSolucionesAbiertas] = useState<Record<number, boolean>>({});

  // Práctica aleatoria
  const [ejercicio, setEjercicio] = useState<EjercicioAleatorio | null>(null);
  const [respuestaAleatoria, setRespuestaAleatoria] = useState('');
  const [veredictoAleatorio, setVeredictoAleatorio] = useState<Comprobacion | null>(null);
  const [solucionAleatoriaAbierta, setSolucionAleatoriaAbierta] = useState(false);

  // ---------------------------------------------------------- Derivados

  const terminosA = useMemo(
    () => terminosAritmeticos(a1Aritmetica, diferencia, TERMINOS_VISIBLES),
    [a1Aritmetica, diferencia],
  );
  const generalA = useMemo(
    () => terminoGeneralAritmetico(a1Aritmetica, diferencia),
    [a1Aritmetica, diferencia],
  );
  const sumaVisibleA = useMemo(
    () => sumaAritmetica(a1Aritmetica, diferencia, TERMINOS_VISIBLES),
    [a1Aritmetica, diferencia],
  );
  const consultaA = useMemo(() => {
    const n = parseSpanishNumber(nAritmetica);
    return {
      termino: resolverProgresion('termino-aritmetico', a1Aritmetica, diferencia, n),
      suma: resolverProgresion('suma-aritmetica', a1Aritmetica, diferencia, n),
      n,
    };
  }, [a1Aritmetica, diferencia, nAritmetica]);

  const terminosG = useMemo(
    () => terminosGeometricos(a1Geometrica, razon, TERMINOS_VISIBLES),
    [a1Geometrica, razon],
  );
  // La aritmética de contraste arranca en el mismo sitio y da el MISMO primer salto:
  // a₁·(r − 1). A partir del segundo término se separan, y esa separación es el concepto.
  const terminosContraste = useMemo(
    () => terminosAritmeticos(a1Geometrica, a1Geometrica * (razon - 1), TERMINOS_VISIBLES),
    [a1Geometrica, razon],
  );
  const generalG = useMemo(() => terminoGeneralGeometrico(a1Geometrica, razon), [a1Geometrica, razon]);
  const sumaVisibleG = useMemo(
    () => sumaGeometrica(a1Geometrica, razon, TERMINOS_VISIBLES),
    [a1Geometrica, razon],
  );
  const sumaInfinita = useMemo(() => sumaInfinitaGeometrica(a1Geometrica, razon), [a1Geometrica, razon]);
  const pasosInfinita = useMemo(
    () => resolverProgresion('suma-infinita', a1Geometrica, razon, 0),
    [a1Geometrica, razon],
  );
  const consultaG = useMemo(() => {
    const n = parseSpanishNumber(nGeometrica);
    return {
      termino: resolverProgresion('termino-geometrico', a1Geometrica, razon, n),
      suma: resolverProgresion('suma-geometrica', a1Geometrica, razon, n),
      n,
    };
  }, [a1Geometrica, razon, nGeometrica]);

  const resueltos = useMemo(
    () => Object.values(veredictos).filter((v) => v.correcto).length,
    [veredictos],
  );

  // ---------------------------------------------------------- Acciones

  const identificar = (texto: string) => {
    const lista = parsearListaNumeros(texto);
    if (!lista.ok) {
      setAnalisis(null);
      setErrorIdentificar(lista.error ?? 'No se ha podido leer la sucesión.');
      return;
    }
    const resultado = identificarProgresion(lista.numeros);
    if (!resultado.ok) {
      setAnalisis(null);
      setErrorIdentificar(resultado.error ?? 'No se ha podido analizar la sucesión.');
      return;
    }
    setAnalisis(resultado);
    setErrorIdentificar('');
  };

  const usarEjemplo = (texto: string) => {
    setEntradaSucesion(texto);
    identificar(texto);
  };

  const comprobarCaso = (id: number, esperado: number) => {
    const valor = parseSpanishNumber(respuestas[id] ?? '');
    setVeredictos((previos) => ({ ...previos, [id]: comprobarRespuesta(valor, esperado) }));
  };

  const alternarSolucion = (id: number) => {
    setSolucionesAbiertas((previas) => ({ ...previas, [id]: !previas[id] }));
  };

  const reiniciarCasos = () => {
    setRespuestas({});
    setVeredictos({});
    setSolucionesAbiertas({});
  };

  const nuevoEjercicio = () => {
    setEjercicio(generarEjercicioAleatorio());
    setRespuestaAleatoria('');
    setVeredictoAleatorio(null);
    setSolucionAleatoriaAbierta(false);
  };

  const comprobarAleatorio = () => {
    if (!ejercicio) return;
    const valor = parseSpanishNumber(respuestaAleatoria);
    setVeredictoAleatorio(comprobarRespuesta(valor, ejercicio.respuesta));
  };

  // ---------------------------------------------------------- Auxiliares de render

  const textoVeredicto = (veredicto: Comprobacion, respuestaTexto: string, etiqueta: string): string => {
    if (veredicto.motivo === 'no-numerico') {
      return 'Eso no es un número. Escribe solo la cifra, con coma o punto decimal (por ejemplo 137 o 1628,89).';
    }
    if (veredicto.correcto) {
      return `Correcto: ${respuestaTexto} (${etiqueta}).`;
    }
    return `Todavía no. La respuesta correcta es ${respuestaTexto}. Abre la solución para ver dónde se tuerce la cuenta.`;
  };

  const hayConsultaAritmetica = nAritmetica.trim() !== '';
  const hayConsultaGeometrica = nGeometrica.trim() !== '';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📈</span> Progresiones aritméticas y geométricas
        </h1>
        <p className={styles.subtitle}>
          Mueve el primer término y la diferencia o la razón, y mira cómo se comportan los términos, el
          término general y la suma. Identifica cualquier sucesión que escribas y practica con 12 casos
          numerados iguales para toda la clase.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ---------------------------------------------------- Pestañas */}
        <div className={styles.tabs} role="tablist" aria-label="Modos del simulador">
          <button
            type="button"
            role="tab"
            id="tab-aritmetica"
            aria-selected={pestana === 'aritmetica'}
            aria-controls="panel-aritmetica"
            className={`${styles.tab} ${pestana === 'aritmetica' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('aritmetica')}
          >
            <span aria-hidden="true">➕</span> Aritmética
          </button>
          <button
            type="button"
            role="tab"
            id="tab-geometrica"
            aria-selected={pestana === 'geometrica'}
            aria-controls="panel-geometrica"
            className={`${styles.tab} ${pestana === 'geometrica' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('geometrica')}
          >
            <span aria-hidden="true">✖️</span> Geométrica
          </button>
          <button
            type="button"
            role="tab"
            id="tab-identificar"
            aria-selected={pestana === 'identificar'}
            aria-controls="panel-identificar"
            className={`${styles.tab} ${pestana === 'identificar' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('identificar')}
          >
            <span aria-hidden="true">🔍</span> Identificar
          </button>
          <button
            type="button"
            role="tab"
            id="tab-casos"
            aria-selected={pestana === 'casos'}
            aria-controls="panel-casos"
            className={`${styles.tab} ${pestana === 'casos' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('casos')}
          >
            <span aria-hidden="true">📝</span> Casos ({resueltos}/{TOTAL_CASOS})
          </button>
        </div>

        {/* ---------------------------------------------------- Aritmética */}
        {pestana === 'aritmetica' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-aritmetica"
            aria-labelledby="tab-aritmetica"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>Se SUMA siempre la misma cantidad</h2>
            <p className={styles.panelDesc}>
              En una progresión aritmética cada término se obtiene sumando al anterior un número fijo,
              la diferencia <strong>d</strong>. Puede ser negativa: entonces la progresión baja. Mueve
              los deslizadores y fíjate en que los puntos de la gráfica quedan siempre en línea recta.
            </p>

            <div className={styles.controles}>
              <div className={styles.controlFila}>
                <label className={styles.controlEtiqueta} htmlFor="slider-a1-aritmetica">
                  Primer término a₁
                </label>
                <output className={styles.controlValor} htmlFor="slider-a1-aritmetica">
                  {formatNumber(a1Aritmetica, 0)}
                </output>
                <input
                  id="slider-a1-aritmetica"
                  className={styles.slider}
                  type="range"
                  min={-20}
                  max={20}
                  step={1}
                  value={a1Aritmetica}
                  onChange={(e) => setA1Aritmetica(Number(e.target.value))}
                />
              </div>

              <div className={styles.controlFila}>
                <label className={styles.controlEtiqueta} htmlFor="slider-diferencia">
                  Diferencia d (puede ser negativa)
                </label>
                <output className={styles.controlValor} htmlFor="slider-diferencia">
                  {formatNumber(diferencia, 1)}
                </output>
                <input
                  id="slider-diferencia"
                  className={styles.slider}
                  type="range"
                  min={-10}
                  max={10}
                  step={0.5}
                  value={diferencia}
                  onChange={(e) => setDiferencia(Number(e.target.value))}
                />
              </div>
            </div>

            <h3 className={styles.subtitulo}>Los {TERMINOS_VISIBLES} primeros términos</h3>
            <ListaTerminos terminos={terminosA} />

            <div className={styles.formulaCaja}>
              <p className={styles.formulaEtiqueta}>Término general</p>
              <p className={styles.formulaLinea}>aₙ = a₁ + (n − 1)·d</p>
              <p className={styles.formulaLinea}>{generalA.definicion}</p>
              <p className={styles.formulaResultado}>{generalA.simplificado}</p>
              <p className={styles.notaPie}>
                Con esta expresión se llega a cualquier término sin escribir los anteriores: para el
                término 500 basta con sustituir n por 500.
              </p>
            </div>

            <div className={styles.formulaCaja}>
              <p className={styles.formulaEtiqueta}>Suma de los {TERMINOS_VISIBLES} primeros</p>
              <p className={styles.formulaLinea}>Sₙ = n·(a₁ + aₙ)/2</p>
              <p className={styles.formulaResultado}>
                S{subindice(TERMINOS_VISIBLES)} = {formatearFlexible(sumaVisibleA)}
              </p>
            </div>

            <GraficaProgresion
              serie={terminosA}
              etiquetaSerie="Términos de la progresión aritmética"
              mostrarRecta
              descripcion={`Los ${TERMINOS_VISIBLES} primeros términos de la progresión aritmética que empieza en ${formatearFlexible(a1Aritmetica)} con diferencia ${formatearFlexible(diferencia)}. Todos los puntos caen sobre la misma recta.`}
            />
            <p className={styles.notaPie}>
              La línea discontinua une el primer término con el último. Los puntos intermedios caen
              exactamente encima: eso es lo que significa que una progresión aritmética crece de forma
              lineal.
            </p>

            <div className={styles.consulta}>
              <h3 className={styles.subtitulo}>¿Y cuánto vale el término 50?</h3>
              <p className={styles.panelDesc}>
                Para eso sirve el término general: no hace falta escribir los 49 anteriores. Escribe
                cualquier posición y el simulador desarrolla la cuenta.
              </p>
              <div className={styles.consultaFila}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-n-aritmetica">
                  Número de término n
                </label>
                <input
                  id="entrada-n-aritmetica"
                  className={styles.campoInput}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={nAritmetica}
                  placeholder="50"
                  onChange={(e) => setNAritmetica(e.target.value)}
                />
              </div>

              {hayConsultaAritmetica && consultaA.termino.error !== null && (
                <p className={styles.mensajeError} role="alert" aria-live="polite">
                  {consultaA.termino.error}
                </p>
              )}

              {hayConsultaAritmetica && consultaA.termino.ok && (
                <div className={styles.resultadoCaja}>
                  <p className={styles.resultadoEtiqueta}>Término a{subindice(consultaA.n)}</p>
                  <p className={styles.resultadoValor}>{formatearFlexible(consultaA.termino.valor)}</p>
                  <ol className={styles.pasosLista}>
                    {consultaA.termino.pasos.map((paso, indice) => (
                      <li key={indice} className={styles.pasoItem}>
                        {paso}
                      </li>
                    ))}
                  </ol>
                  {consultaA.suma.ok && (
                    <>
                      <h4 className={styles.subtituloPasos}>
                        Y la suma de esos {formatNumber(consultaA.n, 0)} términos
                      </h4>
                      <p className={styles.resultadoValor}>{formatearFlexible(consultaA.suma.valor)}</p>
                      <ol className={styles.pasosLista}>
                        {consultaA.suma.pasos.map((paso, indice) => (
                          <li key={indice} className={styles.pasoItem}>
                            {paso}
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------- Geométrica */}
        {pestana === 'geometrica' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-geometrica"
            aria-labelledby="tab-geometrica"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>Se MULTIPLICA siempre por la misma cantidad</h2>
            <p className={styles.panelDesc}>
              En una progresión geométrica cada término sale de multiplicar el anterior por un número
              fijo, la razón <strong>r</strong>. Con r entre 0 y 1 la progresión decrece sin llegar
              nunca a cero; con r negativa, los términos alternan de signo.
            </p>

            <div className={styles.controles}>
              <div className={styles.controlFila}>
                <label className={styles.controlEtiqueta} htmlFor="slider-a1-geometrica">
                  Primer término a₁
                </label>
                <output className={styles.controlValor} htmlFor="slider-a1-geometrica">
                  {formatNumber(a1Geometrica, 0)}
                </output>
                <input
                  id="slider-a1-geometrica"
                  className={styles.slider}
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={a1Geometrica}
                  onChange={(e) => setA1Geometrica(Number(e.target.value))}
                />
              </div>

              <div className={styles.controlFila}>
                <label className={styles.controlEtiqueta} htmlFor="slider-razon">
                  Razón r
                </label>
                <output className={styles.controlValor} htmlFor="slider-razon">
                  {formatNumber(razon, 1)}
                </output>
                <input
                  id="slider-razon"
                  className={styles.slider}
                  type="range"
                  min={-30}
                  max={30}
                  step={1}
                  value={razonDecima}
                  onChange={(e) => setRazonDecima(Number(e.target.value))}
                />
              </div>
            </div>

            <h3 className={styles.subtitulo}>Los primeros términos</h3>
            <ListaTerminos terminos={terminosG} />

            <div className={styles.formulaCaja}>
              <p className={styles.formulaEtiqueta}>Término general</p>
              <p className={styles.formulaLinea}>aₙ = a₁ · r^(n−1)</p>
              <p className={styles.formulaResultado}>{generalG}</p>
              <p className={styles.notaPie}>
                El exponente es n − 1 y no n: del primer término al término n se multiplica por la razón
                una vez menos de las que parece.
              </p>
            </div>

            <div className={styles.formulaCaja}>
              <p className={styles.formulaEtiqueta}>Suma de los primeros términos</p>
              {razonEsUno(razon) ? (
                <>
                  <p className={styles.formulaLinea}>
                    Con r = 1 la fórmula habitual dividiría entre r − 1 = 0, así que no sirve.
                  </p>
                  <p className={styles.formulaLinea}>
                    Todos los términos valen a₁, de modo que Sₙ = n·a₁.
                  </p>
                </>
              ) : (
                <p className={styles.formulaLinea}>Sₙ = a₁·(rⁿ − 1)/(r − 1), válida siempre que r ≠ 1</p>
              )}
              <p className={styles.formulaResultado}>
                S{subindice(TERMINOS_VISIBLES)} = {formatearFlexible(sumaVisibleG)}
              </p>
            </div>

            <div className={styles.formulaCaja}>
              <p className={styles.formulaEtiqueta}>Suma de INFINITOS términos</p>
              {convergeSerieGeometrica(razon) ? (
                <>
                  <p className={styles.formulaLinea}>S = a₁/(1 − r)</p>
                  <p className={styles.formulaResultado}>S = {formatearFlexible(sumaInfinita)}</p>
                </>
              ) : (
                <p className={styles.formulaLinea}>
                  Con |r| = {formatearFlexible(Math.abs(razon))} la serie DIVERGE: no existe ninguna suma
                  infinita.
                </p>
              )}
              <ol className={styles.pasosLista}>
                {pasosInfinita.pasos.map((paso, indice) => (
                  <li key={indice} className={styles.pasoItem}>
                    {paso}
                  </li>
                ))}
              </ol>
            </div>

            <GraficaProgresion
              serie={terminosG}
              serieComparacion={terminosContraste}
              etiquetaSerie="Geométrica (se multiplica)"
              etiquetaComparacion="Aritmética con el mismo primer salto (se suma)"
              descripcion={`Comparación de la progresión geométrica que empieza en ${formatearFlexible(a1Geometrica)} con razón ${formatearFlexible(razon)} frente a una progresión aritmética que empieza igual y da el mismo primer salto. A partir del segundo término se separan.`}
            />
            <p className={styles.notaPie}>
              Las dos series arrancan en el mismo punto y dan exactamente el mismo primer salto. A partir
              de ahí la aritmética sigue sumando siempre lo mismo —recta— mientras la geométrica
              multiplica sobre una cifra cada vez mayor —curva—. Ese despegue es toda la diferencia entre
              las dos familias.
            </p>

            <div className={styles.consulta}>
              <h3 className={styles.subtitulo}>Un término concreto</h3>
              <div className={styles.consultaFila}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-n-geometrica">
                  Número de término n
                </label>
                <input
                  id="entrada-n-geometrica"
                  className={styles.campoInput}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={nGeometrica}
                  placeholder="12"
                  onChange={(e) => setNGeometrica(e.target.value)}
                />
              </div>

              {hayConsultaGeometrica && consultaG.termino.error !== null && (
                <p className={styles.mensajeError} role="alert" aria-live="polite">
                  {consultaG.termino.error}
                </p>
              )}

              {hayConsultaGeometrica && consultaG.termino.ok && (
                <div className={styles.resultadoCaja}>
                  <p className={styles.resultadoEtiqueta}>Término a{subindice(consultaG.n)}</p>
                  <p className={styles.resultadoValor}>{formatearFlexible(consultaG.termino.valor)}</p>
                  <ol className={styles.pasosLista}>
                    {consultaG.termino.pasos.map((paso, indice) => (
                      <li key={indice} className={styles.pasoItem}>
                        {paso}
                      </li>
                    ))}
                  </ol>
                  {consultaG.suma.ok && (
                    <>
                      <h4 className={styles.subtituloPasos}>
                        Y la suma de esos {formatNumber(consultaG.n, 0)} términos
                      </h4>
                      <p className={styles.resultadoValor}>{formatearFlexible(consultaG.suma.valor)}</p>
                      <ol className={styles.pasosLista}>
                        {consultaG.suma.pasos.map((paso, indice) => (
                          <li key={indice} className={styles.pasoItem}>
                            {paso}
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------- Identificar */}
        {pestana === 'identificar' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-identificar"
            aria-labelledby="tab-identificar"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>¿Qué progresión es esta?</h2>
            <p className={styles.panelDesc}>
              Escribe una sucesión de al menos tres números y el simulador calcula todas las restas y
              todas las divisiones entre términos seguidos para decidir. Si no es aritmética ni
              geométrica, lo dice: hay muchísimas sucesiones que no son ni una cosa ni la otra.
            </p>

            <div className={styles.consultaFila}>
              <label className={styles.campoEtiqueta} htmlFor="entrada-sucesion">
                Tu sucesión
              </label>
              <input
                id="entrada-sucesion"
                className={styles.campoInput}
                type="text"
                inputMode="text"
                autoComplete="off"
                value={entradaSucesion}
                placeholder="3, 7, 11, 15"
                onChange={(e) => setEntradaSucesion(e.target.value)}
              />
            </div>

            <p className={styles.campoAyuda}>
              Separa los números con comas: <code className={styles.codigoInline}>3, 7, 11, 15</code>. Si
              tus números llevan decimales escritos con coma, separa la lista con punto y coma:{' '}
              <code className={styles.codigoInline}>1,5; 3; 4,5</code>. También valen los espacios.
            </p>

            <div className={styles.acciones}>
              <button type="button" className={styles.btnPrimario} onClick={() => identificar(entradaSucesion)}>
                <span aria-hidden="true">🔍</span> Identificar
              </button>
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() => {
                  setEntradaSucesion('');
                  setAnalisis(null);
                  setErrorIdentificar('');
                }}
              >
                Limpiar
              </button>
            </div>

            <div className={styles.ejemplos}>
              <span className={styles.ejemplosEtiqueta}>Prueba con:</span>
              <button type="button" className={styles.ejemploBtn} onClick={() => usarEjemplo('3, 7, 11, 15')}>
                3, 7, 11, 15
              </button>
              <button type="button" className={styles.ejemploBtn} onClick={() => usarEjemplo('2, 6, 18, 54')}>
                2, 6, 18, 54
              </button>
              <button type="button" className={styles.ejemploBtn} onClick={() => usarEjemplo('80, 40, 20, 10')}>
                80, 40, 20, 10
              </button>
              <button type="button" className={styles.ejemploBtn} onClick={() => usarEjemplo('1, 4, 9, 16, 25')}>
                1, 4, 9, 16, 25
              </button>
              <button
                type="button"
                className={styles.ejemploBtn}
                onClick={() => usarEjemplo('1, 1, 2, 3, 5, 8, 13')}
              >
                1, 1, 2, 3, 5, 8, 13
              </button>
              <button type="button" className={styles.ejemploBtn} onClick={() => usarEjemplo('5, -10, 20, -40')}>
                5, −10, 20, −40
              </button>
            </div>

            {errorIdentificar !== '' && (
              <p className={styles.mensajeError} role="alert" aria-live="polite">
                {errorIdentificar}
              </p>
            )}

            {analisis !== null && (
              <div className={styles.resultadoCaja} role="alert" aria-live="polite">
                <div className={styles.badgesFila}>
                  <span
                    className={`${styles.badge} ${analisis.tipo === 'ninguna' ? styles.badgeNo : styles.badgeOk}`}
                  >
                    {analisis.tipo === 'aritmetica'
                      ? 'Progresión aritmética'
                      : analisis.tipo === 'geometrica'
                        ? 'Progresión geométrica'
                        : 'Ni aritmética ni geométrica'}
                  </span>
                  {analisis.d !== undefined && (
                    <span className={`${styles.badge} ${styles.badgeNeutro}`}>
                      d = {formatearFlexible(analisis.d)}
                    </span>
                  )}
                  {analisis.r !== undefined && (
                    <span className={`${styles.badge} ${styles.badgeNeutro}`}>
                      r = {formatearFlexible(analisis.r)}
                    </span>
                  )}
                </div>

                {analisis.terminoGeneral !== '' && (
                  <p className={styles.formulaResultado}>{analisis.terminoGeneral}</p>
                )}

                {analisis.siguientes.length > 0 && (
                  <p className={styles.pistaTexto}>
                    Los tres términos siguientes serían{' '}
                    <strong>{analisis.siguientes.map((v) => formatearFlexible(v)).join(', ')}</strong>.
                  </p>
                )}

                {analisis.tipo === 'geometrica' &&
                  analisis.r !== undefined &&
                  convergeSerieGeometrica(analisis.r) && (
                    <p className={styles.pistaTexto}>
                      Como |r| &lt; 1, sus infinitos términos sí tienen suma. Cámbiate a la pestaña
                      Geométrica para verla desarrollada.
                    </p>
                  )}

                <h3 className={styles.subtituloPasos}>Cómo se ha decidido</h3>
                <ol className={styles.pasosLista}>
                  {analisis.pasos.map((paso, indice) => (
                    <li key={indice} className={styles.pasoItem}>
                      {paso}
                    </li>
                  ))}
                </ol>

                {analisis.diferencias.length > 0 && (
                  <div className={styles.tablaWrapper}>
                    <table className={styles.comparativaTable}>
                      <caption className={styles.tablaCaption}>
                        Las dos comprobaciones, término a término
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Paso</th>
                          <th scope="col">Resta aₖ₊₁ − aₖ</th>
                          <th scope="col">División aₖ₊₁ / aₖ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analisis.diferencias.map((dif, indice) => (
                          <tr key={indice}>
                            <td>
                              a{subindice(indice + 1)} → a{subindice(indice + 2)}
                            </td>
                            <td>{formatearFlexible(dif)}</td>
                            <td>
                              {analisis.cocientes[indice] !== undefined
                                ? formatearFlexible(analisis.cocientes[indice])
                                : 'no se puede dividir'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------------- Casos */}
        {pestana === 'casos' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-casos"
            aria-labelledby="tab-casos"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>12 casos numerados</h2>
            <p className={styles.panelDesc}>
              Los 12 casos son siempre los mismos, en el mismo orden y con los mismos números: el caso 3
              es idéntico para cualquiera que abra esta página, hoy y dentro de un año. Así un encargo
              del tipo «resuelve el 3, el 7 y el 11» significa lo mismo para toda la clase.
            </p>

            <div className={styles.contador}>
              <p className={styles.contadorTexto} aria-live="polite">
                Has resuelto <strong>{resueltos}</strong> de {TOTAL_CASOS}
              </p>
              <div
                className={styles.contadorBarra}
                role="progressbar"
                aria-valuenow={resueltos}
                aria-valuemin={0}
                aria-valuemax={TOTAL_CASOS}
                aria-label="Casos resueltos"
              >
                <div
                  className={styles.contadorRelleno}
                  style={{ width: `${(resueltos / TOTAL_CASOS) * 100}%` }}
                />
              </div>
              <button type="button" className={styles.btnSecundario} onClick={reiniciarCasos}>
                Empezar de nuevo
              </button>
            </div>

            <div className={styles.casosGrid}>
              {CASOS.map((caso) => {
                const veredicto = veredictos[caso.id];
                const abierta = solucionesAbiertas[caso.id] === true;
                return (
                  <article key={caso.id} className={styles.casoCard}>
                    <div className={styles.casoCabecera}>
                      <span className={styles.casoNumero}>{caso.id}</span>
                      <h3 className={styles.casoTitulo}>{caso.titulo}</h3>
                      <span className={styles.casoEtiqueta}>
                        {caso.categoria === 'abstracto' ? 'Cálculo directo' : 'Situación real'}
                      </span>
                    </div>

                    <p className={styles.casoEnunciado}>{caso.enunciado}</p>

                    <div className={styles.casoRespuesta}>
                      <label className={styles.campoEtiqueta} htmlFor={`respuesta-caso-${caso.id}`}>
                        Tu respuesta ({caso.etiquetaRespuesta})
                        {caso.requiereRedondeo ? ' — redondea a 2 decimales' : ''}
                      </label>
                      <input
                        id={`respuesta-caso-${caso.id}`}
                        className={styles.campoInput}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={respuestas[caso.id] ?? ''}
                        placeholder="Escribe solo el número"
                        onChange={(e) =>
                          setRespuestas((previas) => ({ ...previas, [caso.id]: e.target.value }))
                        }
                      />
                    </div>

                    <div className={styles.casoAcciones}>
                      <button
                        type="button"
                        className={styles.btnPrimario}
                        onClick={() => comprobarCaso(caso.id, caso.respuesta)}
                      >
                        Comprobar
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecundario}
                        aria-expanded={abierta}
                        aria-controls={`solucion-caso-${caso.id}`}
                        onClick={() => alternarSolucion(caso.id)}
                      >
                        {abierta ? 'Ocultar solución' : 'Ver solución'}
                      </button>
                    </div>

                    {veredicto !== undefined && (
                      <p
                        className={`${styles.casoFeedback} ${veredicto.correcto ? styles.feedbackOk : styles.feedbackKo}`}
                        role="alert"
                        aria-live="polite"
                      >
                        <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span>{' '}
                        {textoVeredicto(veredicto, caso.respuestaTexto, caso.etiquetaRespuesta)}
                      </p>
                    )}

                    <div id={`solucion-caso-${caso.id}`} hidden={!abierta}>
                      <div className={styles.solucionCaja}>
                        <p className={styles.pistaTexto}>
                          <span aria-hidden="true">💡</span> {caso.pista}
                        </p>
                        <ol className={styles.pasosLista}>
                          {caso.pasos.map((paso, indice) => (
                            <li key={indice} className={styles.pasoItem}>
                              {paso}
                            </li>
                          ))}
                        </ol>
                        <p className={styles.solucionFinal}>
                          Resultado: <strong>{caso.respuestaTexto}</strong> ({caso.etiquetaRespuesta})
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ------------------------------------------------ Práctica aleatoria */}
            <div className={styles.aleatorioPanel}>
              <h3 className={styles.panelTitle}>Práctica sin final</h3>
              <p className={styles.panelDesc}>
                Cuando los 12 casos se queden cortos, este botón inventa uno nuevo cada vez, con números
                distintos y con la solución explicada igual que los demás. Los valores están elegidos
                para que el resultado salga limpio.
              </p>
              <div className={styles.acciones}>
                <button type="button" className={styles.btnPrimario} onClick={nuevoEjercicio}>
                  <span aria-hidden="true">🎲</span> Ejercicio aleatorio
                </button>
              </div>

              {ejercicio !== null && (
                <div className={styles.aleatorioEjercicio}>
                  <p className={styles.casoEnunciado}>{ejercicio.enunciado}</p>

                  <div className={styles.casoRespuesta}>
                    <label className={styles.campoEtiqueta} htmlFor="respuesta-aleatoria">
                      Tu respuesta ({ejercicio.etiquetaRespuesta})
                      {ejercicio.requiereRedondeo ? ' — redondea a 2 decimales' : ''}
                    </label>
                    <input
                      id="respuesta-aleatoria"
                      className={styles.campoInput}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={respuestaAleatoria}
                      placeholder="Escribe solo el número"
                      onChange={(e) => setRespuestaAleatoria(e.target.value)}
                    />
                  </div>

                  <div className={styles.casoAcciones}>
                    <button type="button" className={styles.btnPrimario} onClick={comprobarAleatorio}>
                      Comprobar
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecundario}
                      aria-expanded={solucionAleatoriaAbierta}
                      aria-controls="solucion-aleatoria"
                      onClick={() => setSolucionAleatoriaAbierta(!solucionAleatoriaAbierta)}
                    >
                      {solucionAleatoriaAbierta ? 'Ocultar solución' : 'Ver solución'}
                    </button>
                  </div>

                  {veredictoAleatorio !== null && (
                    <p
                      className={`${styles.casoFeedback} ${veredictoAleatorio.correcto ? styles.feedbackOk : styles.feedbackKo}`}
                      role="alert"
                      aria-live="polite"
                    >
                      <span aria-hidden="true">{veredictoAleatorio.correcto ? '✅' : '❌'}</span>{' '}
                      {textoVeredicto(
                        veredictoAleatorio,
                        ejercicio.respuestaTexto,
                        ejercicio.etiquetaRespuesta,
                      )}
                    </p>
                  )}

                  <div id="solucion-aleatoria" hidden={!solucionAleatoriaAbierta}>
                    <div className={styles.solucionCaja}>
                      <ol className={styles.pasosLista}>
                        {ejercicio.pasos.map((paso, indice) => (
                          <li key={indice} className={styles.pasoItem}>
                            {paso}
                          </li>
                        ))}
                      </ol>
                      <p className={styles.solucionFinal}>
                        Resultado: <strong>{ejercicio.respuestaTexto}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <DisclaimerCard
        variant="educational"
        severity="low"
        collapsible
        context="simulador-progresiones"
      />

      <EducationalSection
        icon="📚"
        title="Progresiones, de la definición a la fórmula"
        subtitle="Qué las distingue, cuándo se usa cada fórmula y dónde se tuerce"
      >
        <section className={styles.guideSection}>
          <h2>Qué es una progresión</h2>
          <p>
            Una <strong>sucesión</strong> es una lista ordenada de números; cada uno ocupa una posición
            que se llama <strong>n</strong> y se escribe aₙ. Una <strong>progresión</strong> es una
            sucesión en la que se pasa de cada término al siguiente <em>siempre de la misma manera</em>.
            Hay dos formas básicas de hacerlo, y de ahí salen las dos familias.
          </p>
          <p>
            Si de un término al siguiente se <strong>suma</strong> siempre la misma cantidad, la
            progresión es <strong>aritmética</strong> y esa cantidad es la diferencia d. Si se{' '}
            <strong>multiplica</strong> siempre por la misma cantidad, es <strong>geométrica</strong> y
            esa cantidad es la razón r. Todo lo demás —el término general, las fórmulas de la suma— sale
            de ahí; no hay nada más que memorizar.
          </p>

          <h3>Aritmética frente a geométrica</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">&nbsp;</th>
                  <th scope="col">Progresión aritmética</th>
                  <th scope="col">Progresión geométrica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Cómo se pasa al siguiente</th>
                  <td>Se SUMA la diferencia d</td>
                  <td>Se MULTIPLICA por la razón r</td>
                </tr>
                <tr>
                  <th scope="row">Cómo se reconoce</th>
                  <td>Las restas entre términos seguidos son iguales</td>
                  <td>Las divisiones entre términos seguidos son iguales</td>
                </tr>
                <tr>
                  <th scope="row">Término general</th>
                  <td>
                    <code className={styles.codigoInline}>aₙ = a₁ + (n − 1)·d</code>
                  </td>
                  <td>
                    <code className={styles.codigoInline}>aₙ = a₁·r^(n−1)</code>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Suma de n términos</th>
                  <td>
                    <code className={styles.codigoInline}>Sₙ = n·(a₁ + aₙ)/2</code>
                  </td>
                  <td>
                    <code className={styles.codigoInline}>Sₙ = a₁·(rⁿ − 1)/(r − 1)</code>, salvo r = 1
                  </td>
                </tr>
                <tr>
                  <th scope="row">Suma de infinitos términos</th>
                  <td>No existe nunca (salvo la progresión de puros ceros)</td>
                  <td>
                    Existe solo si |r| &lt; 1: <code className={styles.codigoInline}>S = a₁/(1 − r)</code>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Forma de la gráfica</th>
                  <td>Puntos alineados: crecimiento lineal</td>
                  <td>Curva que se dispara o se aplasta: crecimiento exponencial</td>
                </tr>
                <tr>
                  <th scope="row">Ejemplo típico</th>
                  <td>2, 5, 8, 11, 14… (d = 3)</td>
                  <td>2, 6, 18, 54, 162… (r = 3)</td>
                </tr>
                <tr>
                  <th scope="row">Dónde aparece</th>
                  <td>Filas de asientos, cuotas fijas, numeración de páginas</td>
                  <td>Interés compuesto, poblaciones, rebotes, desintegración</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Para qué se usa de verdad</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🎓
                </span>
                <strong>Quien está aprendiéndolas</strong>
              </div>
              <p className={styles.escenarioExample}>
                Las dos fórmulas se parecen tanto que acaban mezclándose: el (n − 1) de la aritmética se
                cuela como exponente n en la geométrica y al revés.
              </p>
              <div className={styles.escenarioTip}>
                Empieza moviendo el deslizador de la diferencia hasta ponerla negativa y mira qué le pasa
                a la recta. Después haz lo mismo con la razón entre 0 y 1. Ver el efecto fija la fórmula
                mejor que repetirla.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  👩‍🏫
                </span>
                <strong>Clase con proyector</strong>
              </div>
              <p className={styles.escenarioExample}>
                Explicar por qué una geométrica «despega» exige dibujar dos series a la vez, y hacerlo en
                la pizarra come media clase.
              </p>
              <div className={styles.escenarioTip}>
                La pestaña Geométrica dibuja siempre, junto a la curva, la aritmética que empieza igual y
                da el mismo primer salto. La separación entre las dos se ve a partir del tercer término.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💰
                </span>
                <strong>Entender el interés compuesto</strong>
              </div>
              <p className={styles.escenarioExample}>
                Un ahorro que crece un porcentaje fijo cada año no es una suma repetida: es una
                progresión geométrica de razón 1 + porcentaje.
              </p>
              <div className={styles.escenarioTip}>
                El caso 12 pone lado a lado una subida fija y una porcentual sobre la misma cantidad
                inicial. La segunda empieza por detrás y acaba delante: es el mecanismo entero.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🧭
                </span>
                <strong>Preparar un examen de admisión</strong>
              </div>
              <p className={styles.escenarioExample}>
                En las pruebas de acceso las progresiones casi nunca vienen solas: aparecen dentro de un
                problema de porcentajes, de crecimiento o de sumas de series.
              </p>
              <div className={styles.escenarioTip}>
                Los casos 8, 9 y 11 son los tres disfraces más frecuentes: crecimiento porcentual,
                duplicación por periodos y suma infinita de una serie decreciente.
              </div>
            </div>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo sé si una sucesión es aritmética o geométrica?</h4>
              <p>
                Se hacen las dos comprobaciones, en este orden. Primero se restan los términos seguidos:
                si todas las restas dan lo mismo, es aritmética y ese valor es d. Si no, se dividen: si
                todas las divisiones dan lo mismo, es geométrica y ese valor es r. Si no ocurre ni una
                cosa ni la otra, no es ninguna de las dos, y eso es perfectamente normal.
              </p>
              <p className={styles.faqTip}>
                La pestaña Identificar hace las dos comprobaciones a la vez y enseña la tabla completa de
                restas y divisiones, aunque el veredicto sea negativo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el término general lleva n − 1 y no n?</h4>
              <p>
                Porque los saltos se cuentan entre términos, no sobre los términos. Para ir del primero al
                quinto se dan cuatro saltos: a₅ = a₁ + 4d en la aritmética y a₅ = a₁·r⁴ en la geométrica.
                Usar n en lugar de n − 1 da siempre un término de más, y es el error más frecuente en los
                dos casos.
              </p>
              <p className={styles.faqTip}>
                Truco de comprobación: sustituye n = 1 en tu fórmula. Tiene que salir exactamente a₁; si
                no, el exponente o el paréntesis están mal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa con la fórmula de la suma geométrica cuando r = 1?</h4>
              <p>
                Que no se puede usar: su denominador es r − 1, que valdría 0, y no se puede dividir entre
                cero. Con r = 1 todos los términos son iguales a a₁, así que la suma es simplemente n·a₁.
                Es un caso aparte, no una excepción rara: aparece en cuanto una magnitud «crece un 0 %».
              </p>
              <p className={styles.faqTip}>
                En la pestaña Geométrica, pon la razón exactamente en 1 y verás que el simulador cambia de
                fórmula y explica por qué.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo puede tener suma una lista infinita de números?</h4>
              <p>
                Solo si los términos se hacen cada vez más pequeños lo bastante deprisa, que en una
                geométrica ocurre exactamente cuando |r| &lt; 1. Entonces las sumas parciales se van
                acercando a un valor concreto sin llegar a superarlo nunca, y ese valor es S = a₁/(1 − r).
                Con 1 + 1/2 + 1/4 + 1/8 + … la suma se acerca a 2 por muchos términos que se añadan.
              </p>
              <p className={styles.faqTip}>
                Si |r| ≥ 1 la serie diverge: no es que la suma sea «muy grande», es que no existe ningún
                número que sea esa suma.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede una progresión ser decreciente?</h4>
              <p>
                Sí, de dos maneras distintas. Una aritmética decrece cuando su diferencia es negativa
                (100, 94, 88, 82…) y puede pasar de sobra al terreno negativo. Una geométrica decrece en
                valor absoluto cuando |r| &lt; 1 (80, 40, 20, 10…), pero si es positiva nunca llega a
                cero: se le acerca indefinidamente.
              </p>
              <p className={styles.faqTip}>
                Con r negativa pasa otra cosa distinta: los términos alternan de signo, así que ni crece
                ni decrece, va rebotando.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué relación tienen con el interés compuesto?</h4>
              <p>
                Es exactamente el mismo objeto. Un capital que crece un porcentaje p cada periodo forma
                una progresión geométrica de razón r = 1 + p/100: un 5 % anual es multiplicar por 1,05
                cada año. Por eso el interés compuesto se dispara con el tiempo mientras un ahorro de
                cantidad fija —una aritmética— crece siempre al mismo ritmo.
              </p>
              <p className={styles.faqTip}>
                Sumar el 5 % diez veces no es lo mismo que multiplicar diez veces por 1,05: la diferencia
                entre las dos cosas es justo la diferencia entre las dos familias.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Si una sucesión crece siempre, ¿ya es una progresión?</h4>
              <p>
                No. Los cuadrados 1, 4, 9, 16, 25 crecen sin parar y no son ni aritméticos —sus
                diferencias son 3, 5, 7, 9— ni geométricos —sus cocientes son 4; 2,25; 1,78—. La sucesión
                de Fibonacci tampoco lo es. Crecer no basta: hace falta crecer siempre de la misma manera.
              </p>
              <p className={styles.faqTip}>
                En los cuadrados, las diferencias de las diferencias sí son constantes (valen 2). Eso los
                convierte en una sucesión de segundo orden, que es otra familia distinta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo se calcula la suma sin escribir todos los términos?</h4>
              <p>
                Con la fórmula que corresponda. En una aritmética, Sₙ = n·(a₁ + aₙ)/2, que sale de
                emparejar el primero con el último: todas las parejas suman lo mismo. En una geométrica,
                Sₙ = a₁·(rⁿ − 1)/(r − 1). Sumar del 1 al 100 son 5.050 y se resuelve en una línea, sin
                escribir cien números.
              </p>
              <p className={styles.faqTip}>
                Ojo al exponente: en el término general de la geométrica es n − 1, pero en la fórmula de
                la suma es n. No es una errata.
              </p>
            </div>
          </div>

          <h3>Cómo resolver un problema paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Escribe los primeros términos</strong>
                <p>
                  Aunque el enunciado venga en palabras, pon cuatro o cinco números en fila. Casi todos
                  los errores de progresiones vienen de no haber mirado la sucesión real.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide de qué tipo es</strong>
                <p>
                  Resta términos seguidos; si las restas coinciden, es aritmética. Si no, divide; si las
                  divisiones coinciden, es geométrica. Si no coincide nada, no fuerces ninguna fórmula.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Identifica a₁ y n con cuidado</strong>
                <p>
                  En los problemas aplicados, a₁ suele ser el instante inicial (el saldo de hoy, la
                  población de partida). Entonces «al cabo de 10 años» es el término 11, no el 10. Escribe
                  qué representa cada índice antes de sustituir.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Pregúntate si te piden un término o una suma</strong>
                <p>
                  «¿Cuánto vale en el año 10?» es un término. «¿Cuánto suma en los 10 años?» es una suma.
                  Son fórmulas distintas y confundirlas es el error que más puntos cuesta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Sustituye y opera respetando la jerarquía</strong>
                <p>
                  Primero el paréntesis (n − 1) o la potencia r^(n−1), después la multiplicación y al
                  final la suma. En la fórmula de la suma geométrica, el numerador entero antes de
                  dividir.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Comprueba con un término pequeño</strong>
                <p>
                  Sustituye n = 1 y n = 2 en tu fórmula y compara con la sucesión que escribiste en el
                  paso 1. Si no coinciden, el fallo está en el término general, no en la cuenta final.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Mira si el resultado es razonable</strong>
                <p>
                  Una suma tiene que ser mayor que cualquiera de sus términos positivos; un término de una
                  geométrica decreciente no puede salir mayor que a₁. Ese repaso de dos segundos atrapa
                  casi cualquier error de exponente.
                </p>
              </div>
            </div>
          </div>

          <h3>Buenas prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <strong>Numera desde a₁</strong>
              <p>
                No existe el término 0. Todo el (n − 1) de las fórmulas depende de que la numeración
                empiece en 1: si cambias el convenio, cambian las fórmulas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✏️
              </span>
              <strong>Escribe el término general antes de calcular</strong>
              <p>
                Dejar por escrito aₙ con los números puestos convierte cualquier pregunta posterior en una
                sustitución, por grande que sea el índice.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📊
              </span>
              <strong>Dibuja cuatro puntos</strong>
              <p>
                Un croquis con los primeros términos distingue de un vistazo lo lineal de lo exponencial,
                y delata al instante una sucesión que no es progresión.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💯
              </span>
              <strong>Convierte los porcentajes en razón</strong>
              <p>
                Crecer un 5 % es multiplicar por 1,05; bajar un 5 %, por 0,95. Trabajar con la razón evita
                arrastrar porcentajes sobre porcentajes.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <strong>Redondea solo al final</strong>
              <p>
                Las potencias amplifican el redondeo: recortar decimales en r antes de elevarla desvía el
                resultado mucho más de lo que parece.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Verifica con la propia sucesión</strong>
              <p>
                Cuando termines, calcula con tu fórmula un término que ya conozcas. Es la comprobación más
                barata y detecta casi todos los errores de índice.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <strong>Errores frecuentes</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir el término general con la suma.</strong> aₙ es cuánto vale UN término;
                Sₙ es cuánto valen todos juntos. Responder con el término cuando piden el total (o al
                revés) es el error más caro de los dos temas.
              </li>
              <li>
                <strong>Usar n en vez de n − 1 en el exponente.</strong> aₙ = a₁·r^(n−1), no a₁·rⁿ.
                Comprobación inmediata: con n = 1 la fórmula tiene que devolver exactamente a₁.
              </li>
              <li>
                <strong>Aplicar la fórmula de la suma geométrica con r = 1.</strong> Su denominador sería
                cero. Con razón 1 la suma es n·a₁, sin más.
              </li>
              <li>
                <strong>Creer que toda sucesión creciente es una progresión.</strong> 1, 4, 9, 16 crece
                siempre y no es ni aritmética ni geométrica. Hay que comprobarlo, no suponerlo.
              </li>
              <li>
                <strong>Sumar infinitos términos cuando |r| ≥ 1.</strong> La fórmula S = a₁/(1 − r) solo
                vale si |r| &lt; 1. Fuera de ahí la serie diverge y no hay ninguna suma que calcular.
              </li>
              <li>
                <strong>Contar mal los periodos en los problemas aplicados.</strong> Si a₁ es el instante
                inicial, «al cabo de 10 años» es el término 11. Un año de desfase multiplica o divide el
                resultado por la razón entera.
              </li>
              <li>
                <strong>Sumar el porcentaje en vez de multiplicar por la razón.</strong> Un 5 % anual
                durante 10 años no es un 50 %: es multiplicar diez veces por 1,05.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-progresiones')} />

      <ShareCard appName="simulador-progresiones" />

      <Footer appName="simulador-progresiones" />
    </div>
  );
}
