'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorCrucigramas.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

type Direccion = 'horizontal' | 'vertical';

interface Entrada {
  palabra: string;
  definicion: string;
  fila: number;
  columna: number;
  direccion: Direccion;
  numero: number;
}

interface Crucigrama {
  celdas: (string | null)[][];
  entradas: Entrada[];
  descartadas: string[];
  filas: number;
  columnas: number;
  semilla: number;
}

const LADO_TRABAJO = 27; // rejilla interna, luego se recorta al mínimo

const EJEMPLO = `MERCURIO = El planeta más cercano al Sol
VENUS = El planeta más caliente del sistema solar
TIERRA = El único planeta con agua líquida en superficie
MARTE = Conocido como el planeta rojo
JUPITER = El planeta de mayor tamaño
SATURNO = Célebre por su sistema de anillos
URANO = Gira tumbado sobre su órbita
NEPTUNO = El planeta más alejado del Sol
LUNA = El satélite natural de la Tierra
COMETA = Cuerpo helado con cola visible al acercarse al Sol
ORBITA = Trayectoria de un cuerpo alrededor de otro
GALAXIA = Conjunto de estrellas, gas y polvo unidos por la gravedad`;

const SIN_TILDE: Record<string, string> = {
  'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A',
  'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
  'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I',
  'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O',
  'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U',
  'Ç': 'C',
};

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador con semilla: el mismo número reproduce la misma disposición */
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

/** Mayúsculas sin tildes ni signos; la ñ se conserva porque es letra propia */
function normalizar(texto: string): string {
  return texto
    .toUpperCase()
    .split('')
    .map((caracter) => SIN_TILDE[caracter] ?? caracter)
    .join('')
    .replace(/[^A-ZÑ]/g, '');
}

function analizarEntrada(texto: string): { palabra: string; definicion: string }[] {
  return texto
    .split('\n')
    .map((linea) => {
      const separador = linea.indexOf('=') >= 0 ? '=' : ':';
      const corte = linea.indexOf(separador);
      const bruta = corte >= 0 ? linea.slice(0, corte) : linea;
      const definicion = corte >= 0 ? linea.slice(corte + 1).trim() : '';
      return { palabra: normalizar(bruta), definicion };
    })
    .filter((e) => e.palabra.length >= 3);
}

// ─────────────────────────────────────────────────────────────
// Colocación de palabras
// ─────────────────────────────────────────────────────────────

type Celdas = (string | null)[][];

function crearCeldas(): Celdas {
  return Array.from({ length: LADO_TRABAJO }, () => Array<string | null>(LADO_TRABAJO).fill(null));
}

/**
 * Comprueba que la palabra cabe sin pegarse a otras: los extremos deben quedar
 * libres y cada letra nueva no puede tener vecinas laterales ocupadas.
 */
function puedeColocarse(
  celdas: Celdas,
  palabra: string,
  fila: number,
  columna: number,
  direccion: Direccion,
): number {
  const df = direccion === 'vertical' ? 1 : 0;
  const dc = direccion === 'horizontal' ? 1 : 0;
  const finFila = fila + df * (palabra.length - 1);
  const finColumna = columna + dc * (palabra.length - 1);

  if (fila < 0 || columna < 0 || finFila >= LADO_TRABAJO || finColumna >= LADO_TRABAJO) return -1;

  // Las casillas justo antes y justo después deben estar vacías
  const antesFila = fila - df;
  const antesColumna = columna - dc;
  if (antesFila >= 0 && antesColumna >= 0 && celdas[antesFila][antesColumna] !== null) return -1;
  const despuesFila = finFila + df;
  const despuesColumna = finColumna + dc;
  if (
    despuesFila < LADO_TRABAJO &&
    despuesColumna < LADO_TRABAJO &&
    celdas[despuesFila][despuesColumna] !== null
  ) {
    return -1;
  }

  let cruces = 0;

  for (let i = 0; i < palabra.length; i++) {
    const f = fila + df * i;
    const c = columna + dc * i;
    const ocupada = celdas[f][c];

    if (ocupada !== null) {
      if (ocupada !== palabra[i]) return -1;
      cruces += 1;
      continue;
    }

    // Sin cruce en esta letra: los laterales perpendiculares deben estar libres
    const lateral1 = direccion === 'horizontal' ? [f - 1, c] : [f, c - 1];
    const lateral2 = direccion === 'horizontal' ? [f + 1, c] : [f, c + 1];
    for (const [lf, lc] of [lateral1, lateral2]) {
      if (lf >= 0 && lc >= 0 && lf < LADO_TRABAJO && lc < LADO_TRABAJO && celdas[lf][lc] !== null) {
        return -1;
      }
    }
  }

  return cruces;
}

function escribir(celdas: Celdas, palabra: string, fila: number, columna: number, direccion: Direccion) {
  const df = direccion === 'vertical' ? 1 : 0;
  const dc = direccion === 'horizontal' ? 1 : 0;
  for (let i = 0; i < palabra.length; i++) {
    celdas[fila + df * i][columna + dc * i] = palabra[i];
  }
}

interface Colocacion {
  fila: number;
  columna: number;
  direccion: Direccion;
  cruces: number;
}

/** Busca el mejor sitio para una palabra: el que más se entrelaza y menos agranda la rejilla */
function mejorColocacion(
  celdas: Celdas,
  palabra: string,
  colocadas: Entrada[],
  aleatorio: () => number,
): Colocacion | null {
  const opciones: Colocacion[] = [];

  for (const entrada of colocadas) {
    const direccion: Direccion = entrada.direccion === 'horizontal' ? 'vertical' : 'horizontal';

    for (let i = 0; i < entrada.palabra.length; i++) {
      const letra = entrada.palabra[i];
      const filaCruce = entrada.direccion === 'vertical' ? entrada.fila + i : entrada.fila;
      const columnaCruce = entrada.direccion === 'horizontal' ? entrada.columna + i : entrada.columna;

      for (let j = 0; j < palabra.length; j++) {
        if (palabra[j] !== letra) continue;

        const fila = direccion === 'vertical' ? filaCruce - j : filaCruce;
        const columna = direccion === 'horizontal' ? columnaCruce - j : columnaCruce;
        const cruces = puedeColocarse(celdas, palabra, fila, columna, direccion);
        if (cruces > 0) opciones.push({ fila, columna, direccion, cruces });
      }
    }
  }

  if (opciones.length === 0) return null;

  // Se prefiere el máximo entrelazado; a igualdad, lo más cerca del centro
  // Se puntúa el entrelazado y la compacidad, y se elige al azar entre las mejores:
  // quedarse siempre con la óptima daría la misma rejilla en cada intento
  const centro = LADO_TRABAJO / 2;
  const distancia = (o: Colocacion) => Math.abs(o.fila - centro) + Math.abs(o.columna - centro);
  const puntos = (o: Colocacion) => o.cruces * 100 - distancia(o);
  const clasificadas = [...opciones].sort((a, b) => puntos(b) - puntos(a));
  const finalistas = clasificadas.slice(0, Math.min(4, clasificadas.length));

  return finalistas[Math.floor(aleatorio() * finalistas.length)];
}

function numerarYRecortar(
  celdas: Celdas,
  colocadas: Omit<Entrada, 'numero'>[],
): { celdas: Celdas; entradas: Entrada[]; filas: number; columnas: number } {
  // Recorte al rectángulo mínimo que contiene letras
  let filaMin = LADO_TRABAJO;
  let filaMax = 0;
  let columnaMin = LADO_TRABAJO;
  let columnaMax = 0;

  celdas.forEach((fila, f) =>
    fila.forEach((celda, c) => {
      if (celda === null) return;
      filaMin = Math.min(filaMin, f);
      filaMax = Math.max(filaMax, f);
      columnaMin = Math.min(columnaMin, c);
      columnaMax = Math.max(columnaMax, c);
    }),
  );

  const filas = filaMax - filaMin + 1;
  const columnas = columnaMax - columnaMin + 1;
  const recortadas: Celdas = Array.from({ length: filas }, (_, f) =>
    Array.from({ length: columnas }, (_, c) => celdas[f + filaMin][c + columnaMin]),
  );

  const desplazadas = colocadas.map((e) => ({
    ...e,
    fila: e.fila - filaMin,
    columna: e.columna - columnaMin,
  }));

  // Numeración estándar: de arriba abajo y de izquierda a derecha
  const entradas: Entrada[] = [];
  let numero = 0;

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (recortadas[f][c] === null) continue;
      const empiezan = desplazadas.filter((e) => e.fila === f && e.columna === c);
      if (empiezan.length === 0) continue;
      numero += 1;
      empiezan.forEach((e) => entradas.push({ ...e, numero }));
    }
  }

  return { celdas: recortadas, entradas, filas, columnas };
}

function construir(
  palabras: { palabra: string; definicion: string }[],
  semilla: number,
): Crucigrama {
  const aleatorio = crearAleatorio(semilla);
  // Se baraja antes de ordenar por longitud: así las palabras de igual tamaño
  // entran en distinto orden en cada intento y las rejillas no se repiten
  const ordenadas = [...palabras]
    .map((entrada) => ({ entrada, orden: aleatorio() }))
    .sort((a, b) => a.orden - b.orden)
    .map((x) => x.entrada)
    .sort((a, b) => b.palabra.length - a.palabra.length);
  const celdas = crearCeldas();
  const colocadas: Omit<Entrada, 'numero'>[] = [];
  const descartadas: string[] = [];

  // La primera palabra ancla el crucigrama en el centro, en horizontal
  const primera = ordenadas[0];
  const filaInicial = Math.floor(LADO_TRABAJO / 2);
  const columnaInicial = Math.floor((LADO_TRABAJO - primera.palabra.length) / 2);
  escribir(celdas, primera.palabra, filaInicial, columnaInicial, 'horizontal');
  colocadas.push({ ...primera, fila: filaInicial, columna: columnaInicial, direccion: 'horizontal' });

  // Varias pasadas: una palabra que no encaja ahora puede encajar más tarde
  let pendientes = ordenadas.slice(1);
  for (let pasada = 0; pasada < 3 && pendientes.length > 0; pasada++) {
    const siguientes: typeof pendientes = [];

    for (const entrada of pendientes) {
      const sitio = mejorColocacion(celdas, entrada.palabra, colocadas as Entrada[], aleatorio);
      if (!sitio) {
        siguientes.push(entrada);
        continue;
      }
      escribir(celdas, entrada.palabra, sitio.fila, sitio.columna, sitio.direccion);
      colocadas.push({
        ...entrada,
        fila: sitio.fila,
        columna: sitio.columna,
        direccion: sitio.direccion,
      });
    }

    if (siguientes.length === pendientes.length) {
      pendientes = siguientes;
      break; // ninguna encajó en esta pasada: no habrá progreso
    }
    pendientes = siguientes;
  }

  pendientes.forEach((e) => descartadas.push(e.palabra));

  const recortado = numerarYRecortar(celdas, colocadas);
  return { ...recortado, descartadas, semilla };
}

/**
 * Prueba varias disposiciones y se queda con la que más palabras coloca;
 * a igualdad, con la rejilla más compacta. Cada intento cuesta ~1 ms.
 */
function generarCrucigrama(
  palabras: { palabra: string; definicion: string }[],
  semilla: number,
): Crucigrama {
  const puntuar = (c: Crucigrama) => c.entradas.length * 1000 - (c.filas + c.columnas);
  let mejor: Crucigrama | null = null;

  for (let variante = 0; variante < 12; variante++) {
    const candidato = construir(palabras, semilla + variante * 104729);
    if (!mejor || puntuar(candidato) > puntuar(mejor)) mejor = candidato;
    if (mejor.descartadas.length === 0) break;
  }

  // Se conserva la semilla original: es la que el usuario anota para reproducirlo
  return { ...(mejor as Crucigrama), semilla };
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorCrucigramasPage() {
  const [titulo, setTitulo] = useState('Crucigrama');
  const [entrada, setEntrada] = useState(EJEMPLO);
  const [semillaManual, setSemillaManual] = useState('');
  const [crucigrama, setCrucigrama] = useState<Crucigrama | null>(null);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [aviso, setAviso] = useState('');

  const palabras = useCallback(() => {
    const lista = analizarEntrada(entrada);
    const vistas = new Set<string>();
    return lista.filter((e) => (vistas.has(e.palabra) ? false : (vistas.add(e.palabra), true)));
  }, [entrada]);

  const generar = useCallback(() => {
    const lista = palabras();

    if (lista.length < 2) {
      setAviso('Escribe al menos dos palabras de tres letras o más, una por línea.');
      setCrucigrama(null);
      return;
    }

    const base = Number(semillaManual.replace(/\D/g, ''));
    const semilla = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;
    const resultado = generarCrucigrama(lista, semilla);

    setCrucigrama(resultado);
    setMostrarSolucion(false);
    setAviso(
      resultado.descartadas.length > 0
        ? `No han podido cruzarse ${resultado.descartadas.length} palabra(s): ${resultado.descartadas.join(', ')}. Prueba a generar otra disposición o sustitúyelas por otras que compartan letras con el resto.`
        : '',
    );
  }, [palabras, semillaManual]);

  const numeroDeCelda = (fila: number, columna: number): number | null => {
    if (!crucigrama) return null;
    const entradaAqui = crucigrama.entradas.find((e) => e.fila === fila && e.columna === columna);
    return entradaAqui ? entradaAqui.numero : null;
  };

  const horizontales = crucigrama
    ? crucigrama.entradas.filter((e) => e.direccion === 'horizontal').sort((a, b) => a.numero - b.numero)
    : [];
  const verticales = crucigrama
    ? crucigrama.entradas.filter((e) => e.direccion === 'vertical').sort((a, b) => a.numero - b.numero)
    : [];

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">📝</span> Generador de Crucigramas
          </h1>
          <p className={styles.subtitle}>
            Escribe tus palabras con sus definiciones y obtén el crucigrama entrelazado, numerado y listo
            para imprimir.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Tus palabras
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título del crucigrama</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={50}
                placeholder="Crucigrama"
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>
                Palabra = definición <small>(una por línea · {palabras().length} válidas)</small>
              </span>
              <textarea
                className={styles.textarea}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                rows={12}
                placeholder={'MERCURIO = El planeta más cercano al Sol\nORBITA = Trayectoria alrededor de otro cuerpo'}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nº de crucigrama (opcional)</span>
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
              <span aria-hidden="true">✨</span> Generar crucigrama
            </button>

            {aviso && (
              <p className={styles.aviso} role="alert" aria-live="polite">
                {aviso}
              </p>
            )}
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🖨️</span> Resultado e impresión
            </h2>

            {!crucigrama ? (
              <p className={styles.vacio}>
                Escribe las palabras separadas de su definición por un signo igual y pulsa{' '}
                <strong>Generar</strong>. La rejilla aparecerá debajo con las definiciones numeradas.
              </p>
            ) : (
              <>
                <div className={styles.metricas}>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{crucigrama.entradas.length}</span>
                    <span className={styles.metricaEtiqueta}>palabras colocadas</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>
                      {crucigrama.columnas}×{crucigrama.filas}
                    </span>
                    <span className={styles.metricaEtiqueta}>tamaño de la rejilla</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{crucigrama.semilla}</span>
                    <span className={styles.metricaEtiqueta}>nº de crucigrama</span>
                  </div>
                </div>

                <div className={styles.acciones}>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    aria-pressed={mostrarSolucion}
                    onClick={() => setMostrarSolucion(!mostrarSolucion)}
                  >
                    <span aria-hidden="true">{mostrarSolucion ? '🙈' : '💡'}</span>{' '}
                    {mostrarSolucion ? 'Ocultar solución' : 'Ver solución'}
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir esta vista
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={generar}>
                    <span aria-hidden="true">🔄</span> Otra disposición
                  </button>
                </div>

                <p className={styles.pista}>
                  Cada disposición es distinta: si alguna palabra se queda fuera, generar de nuevo suele
                  colocarla. Anota el número si quieres poder reimprimir esta misma rejilla.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {crucigrama && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <h2 className={styles.tituloHoja}>{titulo || 'Crucigrama'}</h2>

          <div className={styles.envoltorioRejilla}>
            <table className={`${styles.rejilla} ${impresion.rejilla}`}>
              <caption className={styles.srOnly}>
                Crucigrama de {crucigrama.columnas} por {crucigrama.filas} casillas con{' '}
                {crucigrama.entradas.length} palabras
              </caption>
              <tbody>
                {crucigrama.celdas.map((fila, f) => (
                  <tr key={f}>
                    {fila.map((letra, c) => {
                      if (letra === null) {
                        return <td key={c} className={styles.celdaBloque} />;
                      }
                      const numero = numeroDeCelda(f, c);
                      return (
                        <td key={c} className={styles.celdaLetra}>
                          {/* El posicionamiento vive en este div, no en el <td>: una celda
                              posicionada rompe el pintado de los bordes colapsados al imprimir */}
                          <div className={styles.contenidoCasilla}>
                            {numero && <span className={styles.numeroCasilla}>{numero}</span>}
                            {mostrarSolucion && <span className={styles.letraSolucion}>{letra}</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${styles.definiciones} ${impresion.bloque}`}>
            <div className={styles.columnaDefiniciones}>
              <h3>Horizontales</h3>
              <ol className={styles.listaDefiniciones}>
                {horizontales.map((e) => (
                  <li key={`h-${e.numero}`}>
                    <strong>{e.numero}.</strong> {e.definicion || `(${e.palabra.length} letras)`}
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.columnaDefiniciones}>
              <h3>Verticales</h3>
              <ol className={styles.listaDefiniciones}>
                {verticales.map((e) => (
                  <li key={`v-${e.numero}`}>
                    <strong>{e.numero}.</strong> {e.definicion || `(${e.palabra.length} letras)`}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <p className={styles.pieHoja}>
            Crucigrama n.º {crucigrama.semilla} · {crucigrama.entradas.length} palabras ·{' '}
            {mostrarSolucion ? 'CON SOLUCIÓN' : 'para resolver'} · meskeia.com
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Cómo se arma un crucigrama"
          subtitle="Por qué unas palabras cruzan y otras no, cómo se numera y qué definiciones funcionan"
        >
          <section className={styles.guideSection}>
            <h2>El problema de encajar palabras</h2>
            <p>
              Colocar palabras entrelazadas no es simplemente ponerlas juntas: cada palabra nueva debe
              cruzarse con alguna ya colocada compartiendo una letra, y a la vez{' '}
              <strong>no quedar pegada</strong> a ninguna otra. Si dos palabras corren en paralelo pared
              con pared, se forman columnas de letras que no son palabras y el crucigrama deja de tener
              sentido.
            </p>
            <p>
              Por eso el generador comprueba tres cosas en cada intento: que las letras coincidan en el
              cruce, que las casillas anterior y posterior a la palabra estén libres, y que cada letra
              nueva no tenga vecinas laterales ocupadas. De todas las posiciones válidas se queda con la
              que más se entrelaza, y a igualdad de cruces, con la más cercana al centro, que es la que
              mantiene la rejilla compacta.
            </p>

            <h2>Qué palabras cruzan bien</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Efecto en el crucigrama</th>
                    <th>Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Vocales abundantes</strong>
                    </td>
                    <td>Multiplican los puntos de cruce posibles</td>
                    <td>Son las que mejor entrelazan: AEREO, OCEANO, IDEA</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Letras raras (K, W, X, Z)</strong>
                    </td>
                    <td>Casi nunca encuentran cruce y se quedan fuera</td>
                    <td>Usar como máximo una, y colocarla pronto</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Palabras de 3-4 letras</strong>
                    </td>
                    <td>Cruzan poco y llenan la rejilla de entradas cortas</td>
                    <td>Mejor entre 5 y 9 letras</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Palabras muy largas</strong>
                    </td>
                    <td>Estiran la rejilla y dejan zonas vacías</td>
                    <td>Una o dos como eje, no más</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Familias de la misma raíz</strong>
                    </td>
                    <td>Comparten muchas letras y cruzan con facilidad</td>
                    <td>Útiles para rellenar huecos difíciles</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Tres usos habituales</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🧑‍🏫
                  </span>
                  <h3>Repaso de un tema</h3>
                </div>
                <p>
                  Es el uso que mejor funciona: las palabras son los conceptos de la unidad y las
                  definiciones, la explicación que hay que aprender. A diferencia de un test, obliga a
                  recuperar el término exacto a partir de su significado.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎉
                  </span>
                  <h3>Celebraciones</h3>
                </div>
                <p>
                  Nombres de invitados, lugares compartidos o anécdotas convertidos en definiciones
                  privadas. Aquí las definiciones no tienen que ser de diccionario: cuanto más personales,
                  mejor funciona.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🌍
                  </span>
                  <h3>Vocabulario de idiomas</h3>
                </div>
                <p>
                  Con la palabra en el idioma que se aprende y la definición en el idioma propio, el
                  crucigrama fuerza a recordar la grafía exacta, incluidas las letras que no se pronuncian.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué se han quedado palabras fuera?
                </h4>
                <p>
                  Porque no encontraron ningún cruce válido con las ya colocadas. Ocurre sobre todo con
                  palabras que no comparten letras con el resto o cuyas coincidencias caen en posiciones
                  donde quedarían pegadas a otra palabra. Generar otra disposición suele resolverlo,
                  porque el orden en que se prueban los cruces cambia con cada número de crucigrama.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Cómo escribo una definición buena?
                </h4>
                <p>
                  Que apunte a una sola respuesta posible y no incluya la propia palabra ni su familia. Es
                  útil indicar la categoría gramatical implícita: «Trayectoria de un cuerpo alrededor de
                  otro» lleva claramente a un sustantivo. Para un público infantil conviene ser literal;
                  para adultos, el juego y la ambigüedad controlada es lo que hace disfrutar.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Qué pasa con las tildes y la ñ?
                </h4>
                <p>
                  Las tildes se eliminan al colocar las palabras en la rejilla, como en cualquier
                  crucigrama publicado, porque las casillas no admiten acentos gráficos. La ñ sí se
                  conserva, ya que es una letra distinta de la n. Las definiciones se respetan tal cual se
                  escriben, con su ortografía completa.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Puedo hacer un crucigrama clásico de rejilla llena?
                </h4>
                <p>
                  Este generador produce crucigramas entrelazados, con las palabras cruzándose sobre fondo
                  vacío, que es el formato habitual en material educativo y el que permite usar cualquier
                  lista de palabras. El crucigrama clásico de rejilla completa exige rellenar cada hueco
                  con palabras reales y se construye de otra manera, casi siempre partiendo de la rejilla
                  y no de las palabras.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores al preparar un crucigrama</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Meter treinta palabras de golpe:</strong> la rejilla crece, quedan zonas sueltas y
                  aumentan las descartadas; entre diez y quince es el punto dulce.
                </li>
                <li>
                  <strong>Usar solo palabras cortas:</strong> con tres y cuatro letras apenas hay cruces y el
                  resultado parece una lista, no un crucigrama.
                </li>
                <li>
                  <strong>Definiciones que contienen la palabra:</strong> «Órbita: la órbita de un planeta» no
                  define nada; hay que describir sin nombrar.
                </li>
                <li>
                  <strong>Definiciones con varias respuestas válidas:</strong> si encajan dos palabras distintas
                  del mismo número de letras, quien resuelve se atasca sin motivo.
                </li>
                <li>
                  <strong>No revisar las palabras descartadas:</strong> si eran las clave del tema, el crucigrama
                  ya no repasa lo que debía.
                </li>
                <li>
                  <strong>Imprimir con la solución activada:</strong> se imprime lo que hay en pantalla, letras
                  incluidas.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-crucigramas')} />

        <ShareCard appName="generador-crucigramas" />

        <Footer appName="generador-crucigramas" />
      </div>
    </div>
  );
}
