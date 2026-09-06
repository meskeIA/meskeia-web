'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './SimuladorTeoremaPitagoras.module.css';
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
  TOTAL_CASOS,
  analizarReciproco,
  comprobarRespuesta,
  formatearFlexible,
  generarEjercicioAleatorio,
  hipotenusa,
  resolverPitagoras,
  type AnalisisReciproco,
  type Comprobacion,
  type EjercicioAleatorio,
  type FiguraCaso,
  type SolucionPitagoras,
} from './motor';

// ============================================================
// TIPOS DE LA VISTA
// ============================================================

type Pestana = 'explorar' | 'demostracion' | 'resolver' | 'casos';
type ModoResolver = 'hipotenusa' | 'cateto' | 'reciproco';

interface TrianguloProps {
  base: number;
  altura: number;
  etiquetaBase: string;
  etiquetaAltura: string;
  etiquetaHipotenusa: string;
  ancho?: number;
  alto?: number;
  descripcion: string;
}

// ============================================================
// FIGURA: TRIÁNGULO RECTÁNGULO A ESCALA
// ============================================================

/**
 * Dibuja el triángulo con el ángulo recto abajo a la izquierda y lo escala para que
 * siempre ocupe el lienzo, sea cual sea la proporción entre los catetos.
 */
function TrianguloRectangulo({
  base,
  altura,
  etiquetaBase,
  etiquetaAltura,
  etiquetaHipotenusa,
  ancho = 340,
  alto = 250,
  descripcion,
}: TrianguloProps) {
  const margen = 46;
  const baseSegura = Number.isFinite(base) && base > 0 ? base : 1;
  const alturaSegura = Number.isFinite(altura) && altura > 0 ? altura : 1;
  const escala = Math.min((ancho - 2 * margen) / baseSegura, (alto - 2 * margen) / alturaSegura);
  const anchoDibujo = baseSegura * escala;
  const altoDibujo = alturaSegura * escala;
  const x0 = (ancho - anchoDibujo) / 2;
  const y0 = (alto + altoDibujo) / 2;
  const xB = x0 + anchoDibujo;
  const yC = y0 - altoDibujo;
  const marca = Math.min(14, anchoDibujo * 0.2, altoDibujo * 0.2);

  return (
    <svg
      className={styles.figuraSvg}
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={descripcion}
    >
      <title>{descripcion}</title>
      <polygon
        className={styles.svgTriangulo}
        points={`${x0},${y0} ${xB},${y0} ${x0},${yC}`}
      />
      <polyline
        className={styles.svgAnguloRecto}
        points={`${x0},${y0 - marca} ${x0 + marca},${y0 - marca} ${x0 + marca},${y0}`}
      />
      <text className={styles.svgTexto} x={x0 + anchoDibujo / 2} y={y0 + 22} textAnchor="middle">
        {etiquetaBase}
      </text>
      <text
        className={styles.svgTexto}
        x={x0 - 10}
        y={y0 - altoDibujo / 2}
        textAnchor="end"
        dominantBaseline="middle"
      >
        {etiquetaAltura}
      </text>
      <text
        className={styles.svgTextoAcento}
        x={(x0 + xB) / 2 + 12}
        y={(y0 + yC) / 2 - 8}
        textAnchor="start"
      >
        {etiquetaHipotenusa}
      </text>
    </svg>
  );
}

// ============================================================
// FIGURA: DEMOSTRACIÓN CON LOS TRES CUADRADOS
// ============================================================

interface DemostracionProps {
  a: number;
  b: number;
  fase: number;
}

/**
 * Construye un cuadrado sobre cada lado y escribe su área dentro.
 *
 * El cuadrado de la hipotenusa se levanta hacia fuera del triángulo usando la normal
 * (b, a) del segmento que va del vértice B al C: es la única de las dos normales que
 * apunta en dirección contraria al ángulo recto, así que las tres figuras no se solapan.
 */
function DemostracionCuadrados({ a, b, fase }: DemostracionProps) {
  const ancho = 560;
  const alto = 500;
  const margen = 30;
  const c = hipotenusa(a, b);

  const xMin = -b;
  const xMax = a + b;
  const yMin = -a;
  const yMax = a + b;
  const anchoM = xMax - xMin;
  const altoM = yMax - yMin;
  const escala = Math.min((ancho - 2 * margen) / anchoM, (alto - 2 * margen) / altoM);
  const desX = (ancho - anchoM * escala) / 2;
  const desY = (alto - altoM * escala) / 2;

  const px = (x: number): number => desX + (x - xMin) * escala;
  const py = (y: number): number => desY + (yMax - y) * escala;
  const punto = (x: number, y: number): string => `${px(x)},${py(y)}`;

  const catetosActivos = fase === 1 || fase === 3;
  const hipotenusaActiva = fase === 2 || fase === 3;

  const tamanoTexto = (lado: number): number =>
    Math.max(9, Math.min(17, lado * escala * 0.2));

  return (
    <svg
      className={styles.figuraSvgAncha}
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={`Triángulo rectángulo de catetos ${formatNumber(a, 1)} y ${formatNumber(b, 1)} con un cuadrado construido sobre cada lado. El área del cuadrado de la hipotenusa, ${formatearFlexible(c * c)}, es igual a la suma de las áreas de los cuadrados de los catetos, ${formatearFlexible(a * a)} más ${formatearFlexible(b * b)}.`}
    >
      <title>Demostración visual del teorema de Pitágoras con los tres cuadrados</title>

      {/* Cuadrado sobre el cateto horizontal (a) */}
      <polygon
        className={`${styles.cuadradoA} ${catetosActivos ? styles.cuadradoResaltado : ''}`}
        points={`${punto(0, 0)} ${punto(a, 0)} ${punto(a, -a)} ${punto(0, -a)}`}
      />
      <text
        className={styles.svgTextoArea}
        x={px(a / 2)}
        y={py(-a / 2)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={tamanoTexto(a)}
      >
        {formatearFlexible(a * a)}
      </text>

      {/* Cuadrado sobre el cateto vertical (b) */}
      <polygon
        className={`${styles.cuadradoB} ${catetosActivos ? styles.cuadradoResaltado : ''}`}
        points={`${punto(0, 0)} ${punto(0, b)} ${punto(-b, b)} ${punto(-b, 0)}`}
      />
      <text
        className={styles.svgTextoArea}
        x={px(-b / 2)}
        y={py(b / 2)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={tamanoTexto(b)}
      >
        {formatearFlexible(b * b)}
      </text>

      {/* Cuadrado sobre la hipotenusa (c) */}
      <polygon
        className={`${styles.cuadradoC} ${hipotenusaActiva ? styles.cuadradoResaltado : ''}`}
        points={`${punto(a, 0)} ${punto(0, b)} ${punto(b, a + b)} ${punto(a + b, a)}`}
      />
      <text
        className={styles.svgTextoArea}
        x={px((a + b) / 2)}
        y={py((a + b) / 2)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={tamanoTexto(c)}
      >
        {formatearFlexible(c * c)}
      </text>

      {/* Triángulo central */}
      <polygon
        className={styles.svgTrianguloRelleno}
        points={`${punto(0, 0)} ${punto(a, 0)} ${punto(0, b)}`}
      />
    </svg>
  );
}

// ============================================================
// PÁGINA
// ============================================================

export default function SimuladorTeoremaPitagorasPage() {
  const [pestana, setPestana] = useState<Pestana>('explorar');

  // Explorar y Demostración comparten los mismos catetos a propósito: quien mueve un
  // slider en una pestaña encuentra la otra ya actualizada.
  const [catetoA, setCatetoA] = useState(6);
  const [catetoB, setCatetoB] = useState(8);
  const [faseDemo, setFaseDemo] = useState(0);

  // Resolver
  const [modoResolver, setModoResolver] = useState<ModoResolver>('hipotenusa');
  const [dato1, setDato1] = useState('');
  const [dato2, setDato2] = useState('');
  const [lado1, setLado1] = useState('');
  const [lado2, setLado2] = useState('');
  const [lado3, setLado3] = useState('');
  const [solucion, setSolucion] = useState<SolucionPitagoras | null>(null);
  const [analisis, setAnalisis] = useState<AnalisisReciproco | null>(null);
  const [errorResolver, setErrorResolver] = useState('');

  // Casos numerados
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [veredictos, setVeredictos] = useState<Record<number, Comprobacion>>({});
  const [solucionesAbiertas, setSolucionesAbiertas] = useState<Record<number, boolean>>({});

  // Práctica aleatoria
  const [ejercicio, setEjercicio] = useState<EjercicioAleatorio | null>(null);
  const [respuestaAleatoria, setRespuestaAleatoria] = useState('');
  const [veredictoAleatorio, setVeredictoAleatorio] = useState<Comprobacion | null>(null);
  const [solucionAleatoriaAbierta, setSolucionAleatoriaAbierta] = useState(false);

  const hipotenusaActual = useMemo(() => hipotenusa(catetoA, catetoB), [catetoA, catetoB]);
  const resueltos = useMemo(
    () => Object.values(veredictos).filter((v) => v.correcto).length,
    [veredictos],
  );

  // Secuencia de la demostración: catetos → hipotenusa → los tres a la vez.
  useEffect(() => {
    if (faseDemo === 0 || faseDemo === 3) return;
    const temporizador = window.setTimeout(() => setFaseDemo((f) => f + 1), 1400);
    return () => window.clearTimeout(temporizador);
  }, [faseDemo]);

  // ---------------------------------------------------------- Resolver

  const limpiarResultados = () => {
    setSolucion(null);
    setAnalisis(null);
    setErrorResolver('');
  };

  const cambiarModoResolver = (modo: ModoResolver) => {
    setModoResolver(modo);
    limpiarResultados();
  };

  const calcularResolver = () => {
    if (modoResolver === 'reciproco') {
      const l1 = parseSpanishNumber(lado1);
      const l2 = parseSpanishNumber(lado2);
      const l3 = parseSpanishNumber(lado3);
      if (!Number.isFinite(l1) || !Number.isFinite(l2) || !Number.isFinite(l3)) {
        setAnalisis(null);
        setSolucion(null);
        setErrorResolver('Escribe los tres lados como números. Se admite coma o punto decimal.');
        return;
      }
      const resultado = analizarReciproco(l1, l2, l3);
      setSolucion(null);
      setAnalisis(resultado.ok ? resultado : null);
      setErrorResolver(resultado.error ?? '');
      return;
    }

    const v1 = parseSpanishNumber(dato1);
    const v2 = parseSpanishNumber(dato2);
    if (!Number.isFinite(v1) || !Number.isFinite(v2)) {
      setSolucion(null);
      setAnalisis(null);
      setErrorResolver('Escribe los dos datos como números. Se admite coma o punto decimal.');
      return;
    }
    const resultado = resolverPitagoras(modoResolver, v1, v2);
    setAnalisis(null);
    setSolucion(resultado.ok ? resultado : null);
    setErrorResolver(resultado.error ?? '');
  };

  // ---------------------------------------------------------- Casos

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

  // ---------------------------------------------------------- Práctica aleatoria

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

  const textoVeredicto = (veredicto: Comprobacion, respuestaTexto: string, unidad: string) => {
    if (veredicto.motivo === 'no-numerico') {
      return 'Eso no es un número. Escribe solo la cifra, con coma o punto decimal (por ejemplo 12,5).';
    }
    if (veredicto.correcto) {
      return `Correcto: ${respuestaTexto} ${unidad}.`;
    }
    return `Todavía no. La respuesta correcta es ${respuestaTexto} ${unidad}. Abre la solución para ver dónde se tuerce la cuenta.`;
  };

  // El '?' de la etiqueta se lee fatal con un lector de pantalla: en la descripción
  // alternativa se sustituye por la palabra que de verdad significa.
  const legible = (etiqueta: string): string =>
    etiqueta === '?' ? 'longitud desconocida' : etiqueta;

  const figuraDescripcion = (figura: FiguraCaso): string =>
    `Triángulo rectángulo con un cateto de ${legible(figura.etiquetaBase)}, otro cateto de ${legible(figura.etiquetaAltura)} e hipotenusa de ${legible(figura.etiquetaHipotenusa)}.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📐</span> Simulador del Teorema de Pitágoras
        </h1>
        <p className={styles.subtitle}>
          Mueve los catetos y mira cómo responde la hipotenusa, proyecta la demostración de los tres
          cuadrados, resuelve cualquier lado paso a paso y practica con 12 casos numerados iguales
          para toda la clase.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ---------------------------------------------------- Pestañas */}
        <div className={styles.tabs} role="tablist" aria-label="Modos del simulador">
          <button
            type="button"
            role="tab"
            id="tab-explorar"
            aria-selected={pestana === 'explorar'}
            aria-controls="panel-explorar"
            className={`${styles.tab} ${pestana === 'explorar' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('explorar')}
          >
            <span aria-hidden="true">🔺</span> Explorar
          </button>
          <button
            type="button"
            role="tab"
            id="tab-demostracion"
            aria-selected={pestana === 'demostracion'}
            aria-controls="panel-demostracion"
            className={`${styles.tab} ${pestana === 'demostracion' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('demostracion')}
          >
            <span aria-hidden="true">🟦</span> Demostración visual
          </button>
          <button
            type="button"
            role="tab"
            id="tab-resolver"
            aria-selected={pestana === 'resolver'}
            aria-controls="panel-resolver"
            className={`${styles.tab} ${pestana === 'resolver' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('resolver')}
          >
            <span aria-hidden="true">🧮</span> Resolver
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

        {/* ---------------------------------------------------- Explorar */}
        {pestana === 'explorar' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-explorar"
            aria-labelledby="tab-explorar"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>El triángulo, cateto a cateto</h2>
            <p className={styles.panelDesc}>
              Los dos deslizadores cambian la longitud de cada cateto. La hipotenusa no se puede
              mover: sale de los otros dos y se recalcula sola. Fíjate en que crece siempre menos de
              lo que crecen los catetos por separado.
            </p>

            <div className={styles.exploradorGrid}>
              <div className={styles.figuraCaja}>
                <TrianguloRectangulo
                  base={catetoA}
                  altura={catetoB}
                  etiquetaBase={`a = ${formatNumber(catetoA, 1)}`}
                  etiquetaAltura={`b = ${formatNumber(catetoB, 1)}`}
                  etiquetaHipotenusa={`c = ${formatNumber(hipotenusaActual, 2)}`}
                  descripcion={`Triángulo rectángulo con catetos de ${formatNumber(catetoA, 1)} y ${formatNumber(catetoB, 1)} unidades e hipotenusa de ${formatNumber(hipotenusaActual, 2)} unidades.`}
                />
              </div>

              <div className={styles.controles}>
                <div className={styles.controlFila}>
                  <label className={styles.controlEtiqueta} htmlFor="slider-cateto-a">
                    Cateto a (horizontal)
                  </label>
                  <output className={styles.controlValor} htmlFor="slider-cateto-a">
                    {formatNumber(catetoA, 1)}
                  </output>
                  <input
                    id="slider-cateto-a"
                    className={styles.slider}
                    type="range"
                    min={1}
                    max={20}
                    step={0.1}
                    value={catetoA}
                    onChange={(e) => setCatetoA(Number(e.target.value))}
                  />
                </div>

                <div className={styles.controlFila}>
                  <label className={styles.controlEtiqueta} htmlFor="slider-cateto-b">
                    Cateto b (vertical)
                  </label>
                  <output className={styles.controlValor} htmlFor="slider-cateto-b">
                    {formatNumber(catetoB, 1)}
                  </output>
                  <input
                    id="slider-cateto-b"
                    className={styles.slider}
                    type="range"
                    min={1}
                    max={20}
                    step={0.1}
                    value={catetoB}
                    onChange={(e) => setCatetoB(Number(e.target.value))}
                  />
                </div>

                <div className={styles.ecuacion} aria-live="polite">
                  <p className={styles.ecuacionLinea}>a² + b² = c²</p>
                  <p className={styles.ecuacionLinea}>
                    {formatNumber(catetoA, 1)}² + {formatNumber(catetoB, 1)}² = c²
                  </p>
                  <p className={styles.ecuacionLinea}>
                    {formatearFlexible(catetoA * catetoA)} + {formatearFlexible(catetoB * catetoB)} ={' '}
                    {formatearFlexible(catetoA * catetoA + catetoB * catetoB)}
                  </p>
                  <p className={styles.ecuacionResultado}>
                    c = √{formatearFlexible(catetoA * catetoA + catetoB * catetoB)} ={' '}
                    <strong>{formatNumber(hipotenusaActual, 2)}</strong>
                  </p>
                </div>

                <div className={styles.valoresGrid}>
                  <div className={styles.valorCard}>
                    <span className={styles.valorEtiqueta}>Perímetro</span>
                    <span className={styles.valorNumero}>
                      {formatNumber(catetoA + catetoB + hipotenusaActual, 2)}
                    </span>
                  </div>
                  <div className={styles.valorCard}>
                    <span className={styles.valorEtiqueta}>Área</span>
                    <span className={styles.valorNumero}>
                      {formatNumber((catetoA * catetoB) / 2, 2)}
                    </span>
                  </div>
                  <div className={styles.valorCard}>
                    <span className={styles.valorEtiqueta}>a + b − c</span>
                    <span className={styles.valorNumero}>
                      {formatNumber(catetoA + catetoB - hipotenusaActual, 2)}
                    </span>
                  </div>
                </div>
                <p className={styles.notaPie}>
                  La última cifra es lo que se ahorra yendo en diagonal en vez de recorrer los dos
                  catetos. Nunca es cero, y por eso cortar por la diagonal siempre acorta camino.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------- Demostración */}
        {pestana === 'demostracion' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-demostracion"
            aria-labelledby="tab-demostracion"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>Un cuadrado sobre cada lado</h2>
            <p className={styles.panelDesc}>
              El teorema no habla de longitudes, habla de <strong>áreas</strong>: el cuadrado
              construido sobre la hipotenusa tiene exactamente la misma superficie que los dos
              cuadrados de los catetos juntos. Cambia los catetos y comprueba que la igualdad se
              mantiene siempre.
            </p>

            <div className={styles.figuraCaja}>
              <DemostracionCuadrados a={catetoA} b={catetoB} fase={faseDemo} />
            </div>

            <div className={styles.demoLeyenda}>
              <span className={styles.leyendaItem}>
                <span className={`${styles.leyendaColor} ${styles.leyendaA}`} aria-hidden="true" />
                Cuadrado del cateto a: {formatearFlexible(catetoA * catetoA)}
              </span>
              <span className={styles.leyendaItem}>
                <span className={`${styles.leyendaColor} ${styles.leyendaB}`} aria-hidden="true" />
                Cuadrado del cateto b: {formatearFlexible(catetoB * catetoB)}
              </span>
              <span className={styles.leyendaItem}>
                <span className={`${styles.leyendaColor} ${styles.leyendaC}`} aria-hidden="true" />
                Cuadrado de la hipotenusa: {formatearFlexible(hipotenusaActual * hipotenusaActual)}
              </span>
            </div>

            <p className={styles.igualdadAreas} aria-live="polite">
              {formatearFlexible(catetoA * catetoA)} + {formatearFlexible(catetoB * catetoB)} ={' '}
              <strong>{formatearFlexible(catetoA * catetoA + catetoB * catetoB)}</strong>, que es
              justo el área del cuadrado grande.
            </p>

            <div className={styles.acciones}>
              <button
                type="button"
                className={styles.btnPrimario}
                aria-pressed={faseDemo > 0}
                onClick={() => setFaseDemo(faseDemo > 0 ? 0 : 1)}
              >
                <span aria-hidden="true">✨</span>{' '}
                {faseDemo > 0 ? 'Detener la animación' : 'Animar la equivalencia'}
              </button>
            </div>

            <div className={styles.controlesCompactos}>
              <div className={styles.controlFila}>
                <label className={styles.controlEtiqueta} htmlFor="slider-demo-a">
                  Cateto a
                </label>
                <output className={styles.controlValor} htmlFor="slider-demo-a">
                  {formatNumber(catetoA, 1)}
                </output>
                <input
                  id="slider-demo-a"
                  className={styles.slider}
                  type="range"
                  min={1}
                  max={20}
                  step={0.1}
                  value={catetoA}
                  onChange={(e) => setCatetoA(Number(e.target.value))}
                />
              </div>
              <div className={styles.controlFila}>
                <label className={styles.controlEtiqueta} htmlFor="slider-demo-b">
                  Cateto b
                </label>
                <output className={styles.controlValor} htmlFor="slider-demo-b">
                  {formatNumber(catetoB, 1)}
                </output>
                <input
                  id="slider-demo-b"
                  className={styles.slider}
                  type="range"
                  min={1}
                  max={20}
                  step={0.1}
                  value={catetoB}
                  onChange={(e) => setCatetoB(Number(e.target.value))}
                />
              </div>
            </div>

            <p className={styles.notaPie}>
              Para proyectar en clase: prueba 3 y 4, donde las tres áreas son 9, 16 y 25, y después
              cualquier pareja con decimales. Que la igualdad aguante también con números feos es la
              mitad del argumento.
            </p>
          </section>
        )}

        {/* ---------------------------------------------------- Resolver */}
        {pestana === 'resolver' && (
          <section
            className={styles.panel}
            role="tabpanel"
            id="panel-resolver"
            aria-labelledby="tab-resolver"
            tabIndex={0}
          >
            <h2 className={styles.panelTitle}>Resuelve el lado que falta</h2>
            <p className={styles.panelDesc}>
              Elige qué buscas, escribe los dos datos conocidos y el simulador desarrolla la cuenta
              línea a línea, como se escribe en el cuaderno.
            </p>

            <div className={styles.selectorModos}>
              <button
                type="button"
                className={`${styles.modoBtn} ${modoResolver === 'hipotenusa' ? styles.modoActivo : ''}`}
                aria-pressed={modoResolver === 'hipotenusa'}
                onClick={() => cambiarModoResolver('hipotenusa')}
              >
                Buscar la hipotenusa
              </button>
              <button
                type="button"
                className={`${styles.modoBtn} ${modoResolver === 'cateto' ? styles.modoActivo : ''}`}
                aria-pressed={modoResolver === 'cateto'}
                onClick={() => cambiarModoResolver('cateto')}
              >
                Buscar un cateto
              </button>
              <button
                type="button"
                className={`${styles.modoBtn} ${modoResolver === 'reciproco' ? styles.modoActivo : ''}`}
                aria-pressed={modoResolver === 'reciproco'}
                onClick={() => cambiarModoResolver('reciproco')}
              >
                ¿Es rectángulo? (recíproco)
              </button>
            </div>

            {modoResolver !== 'reciproco' && (
              <div className={styles.formGrid}>
                <div className={styles.campo}>
                  <label className={styles.campoEtiqueta} htmlFor="entrada-dato-1">
                    {modoResolver === 'hipotenusa' ? 'Cateto a' : 'Hipotenusa c'}
                  </label>
                  <input
                    id="entrada-dato-1"
                    className={styles.campoInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={dato1}
                    placeholder={modoResolver === 'hipotenusa' ? '6' : '13'}
                    onChange={(e) => setDato1(e.target.value)}
                  />
                </div>
                <div className={styles.campo}>
                  <label className={styles.campoEtiqueta} htmlFor="entrada-dato-2">
                    {modoResolver === 'hipotenusa' ? 'Cateto b' : 'Cateto conocido a'}
                  </label>
                  <input
                    id="entrada-dato-2"
                    className={styles.campoInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={dato2}
                    placeholder={modoResolver === 'hipotenusa' ? '8' : '5'}
                    onChange={(e) => setDato2(e.target.value)}
                  />
                </div>
              </div>
            )}

            {modoResolver === 'reciproco' && (
              <div className={styles.formGrid}>
                <div className={styles.campo}>
                  <label className={styles.campoEtiqueta} htmlFor="entrada-lado-1">
                    Lado 1
                  </label>
                  <input
                    id="entrada-lado-1"
                    className={styles.campoInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={lado1}
                    placeholder="6"
                    onChange={(e) => setLado1(e.target.value)}
                  />
                </div>
                <div className={styles.campo}>
                  <label className={styles.campoEtiqueta} htmlFor="entrada-lado-2">
                    Lado 2
                  </label>
                  <input
                    id="entrada-lado-2"
                    className={styles.campoInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={lado2}
                    placeholder="8"
                    onChange={(e) => setLado2(e.target.value)}
                  />
                </div>
                <div className={styles.campo}>
                  <label className={styles.campoEtiqueta} htmlFor="entrada-lado-3">
                    Lado 3
                  </label>
                  <input
                    id="entrada-lado-3"
                    className={styles.campoInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={lado3}
                    placeholder="10"
                    onChange={(e) => setLado3(e.target.value)}
                  />
                </div>
              </div>
            )}

            <p className={styles.campoAyuda}>
              Se admiten decimales con coma o con punto (12,5 y 12.5 valen igual). Usa la misma
              unidad en todos los datos.
            </p>

            <div className={styles.acciones}>
              <button type="button" className={styles.btnPrimario} onClick={calcularResolver}>
                <span aria-hidden="true">🧮</span> Calcular
              </button>
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() => {
                  setDato1('');
                  setDato2('');
                  setLado1('');
                  setLado2('');
                  setLado3('');
                  limpiarResultados();
                }}
              >
                Limpiar
              </button>
            </div>

            {errorResolver !== '' && (
              <p className={styles.mensajeError} role="alert" aria-live="polite">
                {errorResolver}
              </p>
            )}

            {solucion !== null && (
              <div className={styles.resultadoCaja}>
                <p className={styles.resultadoEtiqueta}>
                  {modoResolver === 'hipotenusa' ? 'Hipotenusa' : 'Cateto que faltaba'}
                </p>
                <p className={styles.resultadoValor}>{formatNumber(solucion.valor, 4)}</p>
                <h3 className={styles.subtituloPasos}>Paso a paso</h3>
                <ol className={styles.pasosLista}>
                  {solucion.pasos.map((paso, indice) => (
                    <li key={indice} className={styles.pasoItem}>
                      {paso}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {analisis !== null && (
              <div className={styles.resultadoCaja}>
                <div className={styles.badgesFila}>
                  <span
                    className={`${styles.badge} ${analisis.esRectangulo ? styles.badgeOk : styles.badgeNo}`}
                  >
                    {analisis.esRectangulo ? 'Sí es rectángulo' : 'No es rectángulo'}
                  </span>
                  <span
                    className={`${styles.badge} ${analisis.esTerna ? styles.badgeOk : styles.badgeNeutro}`}
                  >
                    {analisis.esTerna
                      ? analisis.esTernaPrimitiva
                        ? 'Terna pitagórica primitiva'
                        : 'Terna pitagórica (no primitiva)'
                      : 'No es terna pitagórica'}
                  </span>
                  <span className={`${styles.badge} ${styles.badgeNeutro}`}>
                    {analisis.tipo === 'no-triangulo'
                      ? 'No llega a ser triángulo'
                      : analisis.tipo === 'rectangulo'
                        ? 'Triángulo rectángulo'
                        : analisis.tipo === 'acutangulo'
                          ? 'Triángulo acutángulo'
                          : 'Triángulo obtusángulo'}
                  </span>
                </div>
                <h3 className={styles.subtituloPasos}>Cómo se comprueba</h3>
                <ol className={styles.pasosLista}>
                  {analisis.pasos.map((paso, indice) => (
                    <li key={indice} className={styles.pasoItem}>
                      {paso}
                    </li>
                  ))}
                </ol>
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
              Los 12 casos son siempre los mismos, en el mismo orden y con los mismos números: el
              caso 3 es idéntico para cualquiera que abra esta página, hoy y dentro de un año. Así
              un encargo del tipo «resuelve el 3, el 7 y el 11» significa lo mismo para toda la
              clase.
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

                    {caso.figura !== null && (
                      <div className={styles.casoFigura}>
                        <TrianguloRectangulo
                          base={caso.figura.base}
                          altura={caso.figura.altura}
                          etiquetaBase={caso.figura.etiquetaBase}
                          etiquetaAltura={caso.figura.etiquetaAltura}
                          etiquetaHipotenusa={caso.figura.etiquetaHipotenusa}
                          ancho={300}
                          alto={200}
                          descripcion={figuraDescripcion(caso.figura)}
                        />
                      </div>
                    )}

                    <div className={styles.casoRespuesta}>
                      <label className={styles.campoEtiqueta} htmlFor={`respuesta-caso-${caso.id}`}>
                        Tu respuesta en {caso.unidad}
                        {caso.requiereRedondeo ? ' (redondea a 2 decimales)' : ''}
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
                        {textoVeredicto(veredicto, caso.respuestaTexto, caso.unidad)}
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
                          Resultado: <strong>{caso.respuestaTexto}</strong> {caso.unidad}
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
                Cuando los 12 casos se queden cortos, este botón inventa uno nuevo cada vez, con
                números distintos y con la solución explicada igual que los demás.
              </p>
              <div className={styles.acciones}>
                <button type="button" className={styles.btnPrimario} onClick={nuevoEjercicio}>
                  <span aria-hidden="true">🎲</span> Ejercicio aleatorio
                </button>
              </div>

              {ejercicio !== null && (
                <div className={styles.aleatorioEjercicio}>
                  <p className={styles.casoEnunciado}>{ejercicio.enunciado}</p>

                  <div className={styles.casoFigura}>
                    <TrianguloRectangulo
                      base={ejercicio.figura.base}
                      altura={ejercicio.figura.altura}
                      etiquetaBase={ejercicio.figura.etiquetaBase}
                      etiquetaAltura={ejercicio.figura.etiquetaAltura}
                      etiquetaHipotenusa={ejercicio.figura.etiquetaHipotenusa}
                      ancho={320}
                      alto={210}
                      descripcion={figuraDescripcion(ejercicio.figura)}
                    />
                  </div>

                  <div className={styles.casoRespuesta}>
                    <label className={styles.campoEtiqueta} htmlFor="respuesta-aleatoria">
                      Tu respuesta en {ejercicio.unidad}
                      {ejercicio.requiereRedondeo ? ' (redondea a 2 decimales)' : ''}
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
                    <button
                      type="button"
                      className={styles.btnPrimario}
                      onClick={comprobarAleatorio}
                    >
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
                        ejercicio.unidad,
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
                        Resultado: <strong>{ejercicio.respuestaTexto}</strong> {ejercicio.unidad}
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
        context="simulador-teorema-pitagoras"
      />

      <EducationalSection
        icon="📚"
        title="El teorema de Pitágoras, entero"
        subtitle="Qué dice, cómo se aplica en cada situación y dónde se tuerce"
      >
        <section className={styles.guideSection}>
          <h2>Qué afirma exactamente</h2>
          <p>
            En cualquier triángulo con un ángulo recto, el cuadrado construido sobre el lado opuesto
            a ese ángulo —la <strong>hipotenusa</strong>— tiene la misma área que los cuadrados
            construidos sobre los otros dos lados —los <strong>catetos</strong>— sumados. En símbolos,{' '}
            <code className={styles.codigoInline}>c² = a² + b²</code>. La hipotenusa es siempre el
            lado más largo, porque está enfrente del ángulo mayor.
          </p>
          <p>
            La relación es de doble sentido. Si un triángulo es rectángulo, sus lados cumplen esa
            igualdad; y si tres longitudes cumplen la igualdad, el triángulo que forman es
            rectángulo. Esa segunda mitad se llama <strong>recíproco</strong>, y es la que se usa
            fuera del aula para comprobar que una esquina está a escuadra sin necesidad de un
            transportador.
          </p>

          <h3>Qué fórmula toca según lo que te den</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Datos que tienes</th>
                  <th scope="col">Lo que buscas</th>
                  <th scope="col">Operación</th>
                  <th scope="col">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Los dos catetos</td>
                  <td>La hipotenusa</td>
                  <td>
                    <code className={styles.codigoInline}>c = √(a² + b²)</code>
                  </td>
                  <td>6 y 8 → 10</td>
                </tr>
                <tr>
                  <td>La hipotenusa y un cateto</td>
                  <td>El otro cateto</td>
                  <td>
                    <code className={styles.codigoInline}>b = √(c² − a²)</code>
                  </td>
                  <td>13 y 5 → 12</td>
                </tr>
                <tr>
                  <td>Los tres lados</td>
                  <td>Si es rectángulo</td>
                  <td>Comparar a² + b² con c²</td>
                  <td>6, 8 y 10 → sí lo es</td>
                </tr>
                <tr>
                  <td>Largo, ancho y alto de una caja</td>
                  <td>La diagonal del cuerpo</td>
                  <td>
                    <code className={styles.codigoInline}>D = √(l² + a² + h²)</code>
                  </td>
                  <td>60, 25 y 20 → 68,01</td>
                </tr>
                <tr>
                  <td>Dos desplazamientos perpendiculares</td>
                  <td>La distancia en línea recta</td>
                  <td>
                    <code className={styles.codigoInline}>d = √(Δx² + Δy²)</code>
                  </td>
                  <td>1,2 y 0,9 → 1,5</td>
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
                <strong>Quien está aprendiéndolo</strong>
              </div>
              <p className={styles.escenarioExample}>
                El teorema se entiende en cinco minutos y se aplica mal durante meses, casi siempre
                por confundir qué lado es la hipotenusa cuando el dibujo está girado.
              </p>
              <div className={styles.escenarioTip}>
                Empieza por la pestaña Explorar con catetos muy desiguales (1 y 20): ver que la
                hipotenusa se pega al cateto largo fija la idea mejor que memorizar la fórmula.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  👩‍🏫
                </span>
                <strong>Docencia con proyector</strong>
              </div>
              <p className={styles.escenarioExample}>
                Dibujar a mano los tres cuadrados en la pizarra cuesta varios minutos y solo sirve
                para un par de números concretos.
              </p>
              <div className={styles.escenarioTip}>
                La pestaña Demostración visual redibuja los tres cuadrados con cada movimiento del
                deslizador, y los números de las áreas se actualizan a la vez.
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📏
                </span>
                <strong>Medir sin poder medir</strong>
              </div>
              <p className={styles.escenarioExample}>
                La altura de un poste, la longitud de un cable tenso o si una tabla pasa por una
                puerta son medidas incómodas de tomar directamente.
              </p>
              <div className={styles.escenarioTip}>
                Casi siempre hay dos distancias fáciles de medir en el suelo que forman ángulo recto:
                con esas dos, la tercera sale sin subirse a ningún sitio.
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
                En las pruebas de acceso el teorema rara vez aparece solo: viene dentro de un
                problema de áreas, de semejanza o de geometría analítica.
              </p>
              <div className={styles.escenarioTip}>
                Los casos 9 y 12 son los dos disfraces más frecuentes: Pitágoras aplicado dos veces
                en tres dimensiones, y la distancia entre dos puntos por coordenadas.
              </div>
            </div>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo distingo la hipotenusa de los catetos si el dibujo está girado?</h4>
              <p>
                No mires la orientación, mira el ángulo recto. Los dos lados que forman el ángulo
                recto son los catetos; el que queda enfrente, sin tocarlo, es la hipotenusa. Es
                también el lado más largo de los tres, así que si tu «hipotenusa» es más corta que
                algún otro lado, la has identificado mal.
              </p>
              <p className={styles.faqTip}>
                Truco rápido: la hipotenusa es el único lado que no toca la marca del ángulo recto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué al buscar un cateto hay que restar?</h4>
              <p>
                Porque la fórmula sigue siendo la misma, solo que la incógnita ha cambiado de sitio.
                De <code className={styles.codigoInline}>c² = a² + b²</code> se despeja{' '}
                <code className={styles.codigoInline}>b² = c² − a²</code>, y el orden importa: se
                resta el cuadrado del cateto al de la hipotenusa, nunca al revés. Si sale un número
                negativo dentro de la raíz, es señal de que los datos están intercambiados.
              </p>
              <p className={styles.faqTip}>
                En la pestaña Resolver, poner una hipotenusa menor que el cateto devuelve un aviso en
                vez de un número, precisamente para que ese error se vea.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Vale el teorema para cualquier triángulo?</h4>
              <p>
                No. Necesita un ángulo de exactamente 90°. En un triángulo acutángulo, la suma de los
                cuadrados de los dos lados menores es mayor que el cuadrado del lado grande; en uno
                obtusángulo, es menor. Para triángulos cualesquiera existe una versión general, el
                teorema del coseno, que añade un término de corrección y se reduce a Pitágoras cuando
                el ángulo es recto.
              </p>
              <p className={styles.faqTip}>
                El modo recíproco de esta página clasifica el triángulo en las tres categorías, no
                solo responde sí o no.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son las ternas pitagóricas y por qué conviene conocerlas?</h4>
              <p>
                Son tríos de números enteros que cumplen la igualdad de forma exacta: 3-4-5, 5-12-13,
                8-15-17, 7-24-25, 20-21-29. Conocer tres o cuatro ahorra tiempo, porque los enunciados
                las usan mucho para que los resultados salgan redondos. Una terna es primitiva cuando
                sus números no comparten divisores: 6-8-10 es terna, pero se obtiene multiplicando
                3-4-5 por dos.
              </p>
              <p className={styles.faqTip}>
                Si ves 3 y 4, o 5 y 12, en un enunciado, sospecha: probablemente el resultado sea
                entero y puedas verificarlo de cabeza.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué mi resultado tiene tantos decimales?</h4>
              <p>
                Porque la raíz cuadrada de un número que no es cuadrado perfecto es irracional: tiene
                infinitos decimales sin periodo. La hipotenusa de dos catetos de 1 es √2, que ninguna
                calculadora escribe entera. Lo correcto es operar con todos los decimales y redondear
                <strong> solo al final</strong>, indicando cuántas cifras se conservan.
              </p>
              <p className={styles.faqTip}>
                Redondear a mitad de camino y seguir calculando arrastra el error: en un problema con
                dos pasos, como la diagonal de una caja, se nota en el segundo decimal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo se aplica en tres dimensiones?</h4>
              <p>
                Aplicándolo dos veces seguidas. Para la diagonal de una caja se calcula primero la
                diagonal del fondo con el largo y el ancho, y después se usa esa diagonal junto con la
                altura como catetos de un segundo triángulo rectángulo, este vertical. El atajo{' '}
                <code className={styles.codigoInline}>D = √(l² + a² + h²)</code> es exactamente esa
                misma cuenta condensada.
              </p>
              <p className={styles.faqTip}>
                El caso 9 lo desarrolla con los dos triángulos separados, que es como conviene
                entenderlo antes de usar el atajo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Sirve para comprobar que una esquina está bien escuadrada?</h4>
              <p>
                Sí, y es el uso práctico más antiguo del recíproco. Se miden 3 unidades por un lado y
                4 por el otro desde la esquina; si la distancia entre esas dos marcas es exactamente
                5, el ángulo es recto. Con múltiplos mayores —30, 40 y 50 centímetros— el método gana
                precisión, porque un error de medida pesa proporcionalmente menos.
              </p>
              <p className={styles.faqTip}>
                Es el mismo principio del &laquo;método 3-4-5&raquo; que se usa al replantear una obra
                o al montar un bastidor.
              </p>
            </div>
          </div>

          <h3>Cómo resolver un problema paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Dibuja y marca el ángulo recto</strong>
                <p>
                  Aunque el enunciado no traiga figura, hazla. Un croquis a mano alzada con el ángulo
                  recto señalado evita la mitad de los errores, porque deja a la vista cuál es la
                  hipotenusa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Nombra los tres lados</strong>
                <p>
                  Escribe sobre el dibujo qué mide cada lado y pon una interrogación en el que buscas.
                  Si dos datos vienen en unidades distintas —centímetros y metros—, conviértelos ahora,
                  no después.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Decide si sumas o restas</strong>
                <p>
                  Si la incógnita es la hipotenusa, sumas los cuadrados. Si es un cateto, restas al
                  cuadrado de la hipotenusa el del cateto conocido. No hay más casos: cualquier duda
                  se resuelve mirando dónde está el ángulo recto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Eleva al cuadrado antes de sumar</strong>
                <p>
                  El error clásico es sumar los lados y elevar después. No es lo mismo{' '}
                  <code className={styles.codigoInline}>3² + 4² = 25</code> que{' '}
                  <code className={styles.codigoInline}>(3 + 4)² = 49</code>. Los cuadrados van
                  primero, siempre.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Saca la raíz al final</strong>
                <p>
                  Lo que obtienes tras sumar o restar es el cuadrado del lado, no el lado. Olvidar la
                  raíz da resultados enormes que suelen delatarse solos: una escalera de 23 metros
                  donde se esperaban menos de 5.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Comprueba que el resultado tiene sentido</strong>
                <p>
                  La hipotenusa debe ser mayor que cualquier cateto y menor que su suma. Si buscabas un
                  cateto, tiene que salir menor que la hipotenusa. Ese repaso de dos segundos atrapa
                  casi cualquier error de signo.
                </p>
              </div>
            </div>
          </div>

          <h3>Buenas prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📐
              </span>
              <strong>Una sola unidad</strong>
              <p>
                Convierte todo a la misma unidad antes de elevar al cuadrado. Mezclar metros y
                centímetros da resultados que parecen razonables y no lo son.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <strong>Redondea solo al final</strong>
              <p>
                Arrastra los decimales durante toda la cuenta y recorta al escribir la respuesta. En
                problemas de dos pasos, redondear a mitad se nota en el resultado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <strong>Memoriza dos o tres ternas</strong>
              <p>
                Con 3-4-5 y 5-12-13 en la cabeza reconoces al vuelo la mitad de los enunciados y
                puedes verificar el resultado sin calculadora.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✏️
              </span>
              <strong>Dibuja siempre</strong>
              <p>
                Un croquis con los datos escritos encima convierte un problema de texto en un problema
                de geometría, que es mucho más fácil de leer.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Usa el recíproco para verificar</strong>
              <p>
                Si ya tienes los tres lados, comprobar que cumplen la igualdad confirma de paso que no
                te has equivocado al operar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧱
              </span>
              <strong>Divide los problemas en 3D</strong>
              <p>
                Ante una caja o una pirámide, busca primero un triángulo rectángulo plano que puedas
                resolver y usa su resultado como cateto del siguiente.
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
                <strong>Confundir la hipotenusa con un cateto.</strong> Ocurre casi siempre cuando la
                figura está girada. La hipotenusa es la que no toca el ángulo recto, y es la más larga.
              </li>
              <li>
                <strong>Sumar cuando había que restar.</strong> Si la incógnita es un cateto, la
                operación es una resta. Sumar da un número mayor que la hipotenusa, que es
                geométricamente imposible.
              </li>
              <li>
                <strong>Olvidar la raíz cuadrada.</strong> Tras sumar o restar tienes el cuadrado del
                lado. Dar 169 como longitud en vez de 13 es el despiste más repetido en los exámenes.
              </li>
              <li>
                <strong>Aplicarlo a triángulos que no son rectángulos.</strong> Sin ángulo de 90° la
                igualdad no se cumple, y el resultado no significa nada. Ahí hace falta el teorema del
                coseno.
              </li>
              <li>
                <strong>Mezclar unidades.</strong> Un cateto en metros y otro en centímetros producen
                un número sin sentido físico que además parece plausible.
              </li>
              <li>
                <strong>Elevar al cuadrado la suma de los lados.</strong>{' '}
                <code className={styles.codigoInline}>(a + b)²</code> no es{' '}
                <code className={styles.codigoInline}>a² + b²</code>: sobra el doble producto. Es el
                error algebraico que más se cuela en la sustitución.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-teorema-pitagoras')} />

      <ShareCard appName="simulador-teorema-pitagoras" />

      <Footer appName="simulador-teorema-pitagoras" />
    </div>
  );
}
