'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';
import {
  MAX_ELEMENTOS,
  construir,
  insertar,
  extraerRaiz,
  heapsort,
  comprobar,
  padreDe,
  type PasoMonticulo,
  type TipoMonticulo,
} from './motor';
import styles from './SimuladorMonticuloBinario.module.css';

/** Qué operación produjo los pasos que se están reproduciendo. */
type Operacion = 'construir' | 'insertar' | 'extraer' | 'heapsort';

interface Ejemplo {
  id: string;
  titulo: string;
  descripcion: string;
  valores: number[];
}

const EJEMPLOS: Ejemplo[] = [
  {
    id: 'clasico',
    titulo: 'El arreglo de clase',
    descripcion: '4, 10, 3, 5, 1 — el ejemplo con el que casi todos los libros explican heapify',
    valores: [4, 10, 3, 5, 1],
  },
  {
    id: 'ascendente',
    titulo: 'Ya ordenado de menor a mayor',
    descripcion: '1, 2, 3, 4, 5, 6, 7 — con mínimos no se mueve nada; con máximos se reordena entero',
    valores: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'heapsort',
    titulo: 'Para ver el heapsort',
    descripcion: '12, 11, 13, 5, 6, 7 — seis valores, suficientes para seguir la ordenación entera',
    valores: [12, 11, 13, 5, 6, 7],
  },
  {
    id: 'quince',
    titulo: 'Árbol completo de 15',
    descripcion: '15 valores desordenados — cuatro niveles llenos, el caso más vistoso',
    valores: [23, 8, 41, 4, 16, 35, 50, 2, 6, 12, 19, 28, 39, 45, 60],
  },
];

/**
 * Marca del paso en el que el heapsort saca la raíz al final del arreglo.
 *
 * Sirve para saber cuántas posiciones del final ya están fijas y han salido del montículo:
 * el motor no lo publica como dato, y sin esto el árbol seguiría dibujando nodos que ya no
 * pertenecen al montículo, mostrando una propiedad rota que en realidad no lo está.
 * Si el texto del motor cambiara, el sombreado sencillamente dejaría de aplicarse: nunca
 * puede producir un resultado incorrecto, solo una ayuda visual de menos.
 */
const MARCA_RAIZ_FIJADA = 'Llevo la raíz';

const VALORES_INICIALES = [4, 10, 3, 5, 1];
const CONSTRUCCION_INICIAL = construir(VALORES_INICIALES, 'max');

const RADIO_NODO = 18;
const ALTO_NIVEL = 76;
const ANCHO_HOJA = 48;

interface NodoDibujo {
  indice: number;
  valor: number;
  x: number;
  y: number;
}

interface LayoutArbol {
  nodos: NodoDibujo[];
  ancho: number;
  alto: number;
}

/** Coloca cada índice del arreglo en su nivel del árbol: nivel = ⌊log2(i+1)⌋. */
function calcularLayout(arreglo: number[]): LayoutArbol {
  if (arreglo.length === 0) return { nodos: [], ancho: 320, alto: 160 };
  const niveles = Math.floor(Math.log2(arreglo.length)) + 1;
  const hojas = 2 ** (niveles - 1);
  const ancho = Math.max(hojas * ANCHO_HOJA, 320);
  const alto = niveles * ALTO_NIVEL + 24;
  const nodos: NodoDibujo[] = arreglo.map((valor, indice) => {
    const nivel = Math.floor(Math.log2(indice + 1));
    const posicion = indice - (2 ** nivel - 1);
    const anchoRanura = ancho / 2 ** nivel;
    return {
      indice,
      valor,
      x: anchoRanura * (posicion + 0.5),
      y: 36 + nivel * ALTO_NIVEL,
    };
  });
  return { nodos, ancho, alto };
}

/** Altura del montículo en niveles (un montículo vacío tiene 0). */
function nivelesDe(longitud: number): number {
  return longitud === 0 ? 0 : Math.floor(Math.log2(longitud)) + 1;
}

/**
 * Formatea un valor del montículo en formato español.
 *
 * Los enteros van sin decimales —un nodo con «10,00» dentro sería ilegible— y los decimales
 * conservan hasta dos, porque el campo de construcción admite «3,5» y redondearlo a 4 en
 * pantalla mostraría un montículo distinto del que el motor está manejando.
 */
function formatValor(valor: number): string {
  return formatNumber(valor, Number.isInteger(valor) ? 0 : 2);
}

export default function SimuladorMonticuloBinario() {
  const [tipo, setTipo] = useState<TipoMonticulo>('max');
  const [arreglo, setArreglo] = useState<number[]>(CONSTRUCCION_INICIAL.arreglo);
  const [pasos, setPasos] = useState<PasoMonticulo[]>(CONSTRUCCION_INICIAL.pasos);
  const [indicePaso, setIndicePaso] = useState<number>(
    Math.max(CONSTRUCCION_INICIAL.pasos.length - 1, 0),
  );
  const [operacion, setOperacion] = useState<Operacion>('construir');
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidad, setVelocidad] = useState(700);

  const [entradaConstruir, setEntradaConstruir] = useState('4, 10, 3, 5, 1');
  const [valorInsertar, setValorInsertar] = useState('');

  const [mensaje, setMensaje] = useState(
    'Montículo de máximos construido a partir de 4, 10, 3, 5, 1. Usa el reproductor para ver cómo se ha llegado hasta aquí.',
  );
  const [descartes, setDescartes] = useState<string[]>([]);
  const [ordenado, setOrdenado] = useState<number[] | null>(null);

  // ── Reproducción automática ────────────────────────────────────────────────
  useEffect(() => {
    if (!reproduciendo) return;
    if (indicePaso >= pasos.length - 1) {
      setReproduciendo(false);
      return;
    }
    const temporizador = window.setTimeout(() => {
      setIndicePaso((i) => Math.min(i + 1, pasos.length - 1));
    }, velocidad);
    return () => window.clearTimeout(temporizador);
  }, [reproduciendo, indicePaso, pasos.length, velocidad]);

  /** Aplica el resultado de una operación del motor y arranca la reproducción. */
  const aplicarPasos = useCallback(
    (nuevosPasos: PasoMonticulo[], nuevoArreglo: number[], quien: Operacion, texto: string) => {
      setArreglo(nuevoArreglo);
      setPasos(nuevosPasos);
      setIndicePaso(0);
      setOperacion(quien);
      setMensaje(texto);
      setReproduciendo(nuevosPasos.length > 1);
    },
    [],
  );

  // ── Estado visible (el del paso actual, no el final) ───────────────────────
  const pasoActual: PasoMonticulo | null = pasos.length > 0 ? pasos[Math.min(indicePaso, pasos.length - 1)] : null;
  const arregloVisible = pasoActual ? pasoActual.arreglo : arreglo;
  const comparados = pasoActual ? pasoActual.comparados : [];
  const intercambiados = pasoActual ? pasoActual.intercambiados : [];

  /**
   * Posiciones del final que el heapsort ya ha fijado: han salido del montículo, así que
   * no se dibujan en el árbol aunque sigan en el arreglo.
   */
  const fijos = useMemo(() => {
    if (operacion !== 'heapsort') return 0;
    let cuenta = 0;
    for (let i = 0; i <= indicePaso && i < pasos.length; i++) {
      if (pasos[i].descripcion.startsWith(MARCA_RAIZ_FIJADA)) cuenta++;
    }
    return cuenta;
  }, [operacion, pasos, indicePaso]);

  const parteActiva = useMemo(
    () => arregloVisible.slice(0, Math.max(arregloVisible.length - fijos, 0)),
    [arregloVisible, fijos],
  );

  const layout = useMemo(() => calcularLayout(parteActiva), [parteActiva]);
  const comprobacion = useMemo(() => comprobar(parteActiva, tipo), [parteActiva, tipo]);

  // ── Manejadores ────────────────────────────────────────────────────────────

  const handleCambiarTipo = (nuevoTipo: TipoMonticulo) => {
    if (nuevoTipo === tipo) return;
    setTipo(nuevoTipo);
    setOrdenado(null);
    setDescartes([]);
    const etiqueta = nuevoTipo === 'max' ? 'máximos' : 'mínimos';
    if (arreglo.length === 0) {
      setPasos([]);
      setIndicePaso(0);
      setMensaje(`Montículo de ${etiqueta} seleccionado. Escribe valores y pulsa «Construir».`);
      return;
    }
    const resultado = construir(arreglo, nuevoTipo);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? 'No he podido reconstruir el montículo.');
      return;
    }
    aplicarPasos(
      resultado.pasos,
      resultado.arreglo,
      'construir',
      `He cambiado a montículo de ${etiqueta} y he vuelto a construirlo con los mismos valores.`,
    );
  };

  const handleConstruir = () => {
    const trozos = entradaConstruir.split(/[,;\s]+/).filter((t) => t.trim() !== '');
    const valores: number[] = [];
    const noNumeros: string[] = [];
    for (const trozo of trozos) {
      const numero = parseSpanishNumber(trozo);
      if (Number.isFinite(numero)) valores.push(numero);
      else noNumeros.push(trozo);
    }
    setDescartes(noNumeros);
    setOrdenado(null);

    if (valores.length === 0) {
      setMensaje('No he encontrado ningún número en lo que has escrito. Prueba con algo como «4, 10, 3, 5, 1».');
      return;
    }
    const resultado = construir(valores, tipo);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? 'No he podido construir el montículo.');
      return;
    }
    aplicarPasos(
      resultado.pasos,
      resultado.arreglo,
      'construir',
      `Construcción por heapify de ${formatNumber(valores.length, 0)} valores, hundiendo cada nodo desde el último con hijos hasta la raíz.`,
    );
  };

  const handleInsertar = () => {
    const numero = parseSpanishNumber(valorInsertar);
    setOrdenado(null);
    setDescartes([]);
    if (!Number.isFinite(numero)) {
      setMensaje(
        valorInsertar.trim() === ''
          ? 'Escribe un número antes de insertar.'
          : `«${valorInsertar.trim()}» no es un número, así que no lo he insertado.`,
      );
      return;
    }
    const resultado = insertar(arreglo, numero, tipo);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? 'No he podido insertar el valor.');
      return;
    }
    aplicarPasos(
      resultado.pasos,
      resultado.arreglo,
      'insertar',
      `Inserto ${formatValor(numero)}: entra por la última posición libre y sube mientras sea prioritario frente a su padre.`,
    );
    setValorInsertar('');
  };

  const handleExtraer = () => {
    setOrdenado(null);
    setDescartes([]);
    const resultado = extraerRaiz(arreglo, tipo);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? 'No he podido extraer la raíz.');
      return;
    }
    aplicarPasos(
      resultado.pasos,
      resultado.arreglo,
      'extraer',
      `Extraigo la raíz: sale ${formatValor(resultado.extraido ?? 0)}. El último elemento ocupa su sitio y baja hasta cumplir la propiedad.`,
    );
  };

  const handleHeapsort = () => {
    setDescartes([]);
    if (arreglo.length < 2) {
      setOrdenado(null);
      setMensaje('Con menos de dos elementos no hay nada que ordenar.');
      return;
    }
    const resultado = heapsort(arreglo, tipo);
    if (!resultado.ok) {
      setOrdenado(null);
      setMensaje(resultado.error ?? 'No he podido ordenar.');
      return;
    }
    setOrdenado(resultado.ordenado);
    aplicarPasos(
      resultado.pasos,
      resultado.ordenado,
      'heapsort',
      tipo === 'max'
        ? 'Heapsort con montículo de máximos: cada vuelta lleva el mayor al final, así que el arreglo queda de menor a mayor.'
        : 'Heapsort con montículo de mínimos: cada vuelta lleva el menor al final, así que el arreglo queda de mayor a menor.',
    );
  };

  const handleEjemplo = (ejemplo: Ejemplo) => {
    setEntradaConstruir(ejemplo.valores.join(', '));
    setDescartes([]);
    setOrdenado(null);
    const resultado = construir(ejemplo.valores, tipo);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? 'No he podido cargar el ejemplo.');
      return;
    }
    aplicarPasos(
      resultado.pasos,
      resultado.arreglo,
      'construir',
      `Ejemplo «${ejemplo.titulo}» cargado y construido como montículo de ${tipo === 'max' ? 'máximos' : 'mínimos'}.`,
    );
  };

  const handleAleatorio = () => {
    const cuantos = 10;
    const valores = Array.from({ length: cuantos }, () => Math.floor(Math.random() * 90) + 10);
    setEntradaConstruir(valores.join(', '));
    setDescartes([]);
    setOrdenado(null);
    const resultado = construir(valores, tipo);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? 'No he podido construir el montículo.');
      return;
    }
    aplicarPasos(
      resultado.pasos,
      resultado.arreglo,
      'construir',
      `Diez valores al azar entre 10 y 99, construidos como montículo de ${tipo === 'max' ? 'máximos' : 'mínimos'}.`,
    );
  };

  const handleVaciar = () => {
    setArreglo([]);
    setPasos([]);
    setIndicePaso(0);
    setReproduciendo(false);
    setOrdenado(null);
    setDescartes([]);
    setEntradaConstruir('');
    setMensaje('Montículo vacío. Escribe unos valores separados por comas y pulsa «Construir».');
  };

  const hayPasos = pasos.length > 0;
  const enElFinal = indicePaso >= pasos.length - 1;
  const progreso = pasos.length > 1 ? (indicePaso / (pasos.length - 1)) * 100 : 100;

  const nombreOperacion =
    operacion === 'construir'
      ? 'Construcción (heapify)'
      : operacion === 'insertar'
        ? 'Inserción (sift-up)'
        : operacion === 'extraer'
          ? 'Extracción de la raíz (sift-down)'
          : 'Heapsort';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Montículo Binario (Heap)</h1>
        <p className={styles.subtitle}>
          Construye un montículo de máximos o de mínimos, inserta valores, extrae la raíz y ejecuta
          un heapsort completo. Cada comparación y cada intercambio se ven a la vez en el árbol y en
          el arreglo con sus índices.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tipo de montículo */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tipo de montículo</h2>
          <p className={styles.panelNota}>
            Al cambiar de tipo el montículo se vuelve a construir con los mismos valores, para que
            puedas comparar las dos formas del mismo arreglo.
          </p>
          <div className={styles.tipoSelector}>
            <button
              type="button"
              onClick={() => handleCambiarTipo('max')}
              className={`${styles.tipoBtn} ${tipo === 'max' ? styles.tipoActive : ''}`}
              aria-pressed={tipo === 'max'}
            >
              <span className={styles.tipoNombre}>Máximos (max-heap)</span>
              <span className={styles.tipoDesc}>
                Cada padre es mayor o igual que sus hijos. En la raíz está el valor mayor.
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleCambiarTipo('min')}
              className={`${styles.tipoBtn} ${tipo === 'min' ? styles.tipoActive : ''}`}
              aria-pressed={tipo === 'min'}
            >
              <span className={styles.tipoNombre}>Mínimos (min-heap)</span>
              <span className={styles.tipoDesc}>
                Cada padre es menor o igual que sus hijos. En la raíz está el valor menor.
              </span>
            </button>
          </div>
        </section>

        {/* Operaciones */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Operaciones</h2>
          <div className={styles.opControls}>
            <div className={styles.opGroup}>
              <label htmlFor="entrada-construir">Construir desde una lista de valores</label>
              <textarea
                id="entrada-construir"
                value={entradaConstruir}
                onChange={(e) => setEntradaConstruir(e.target.value)}
                placeholder="Ej: 4, 10, 3, 5, 1"
                className={styles.opTextarea}
              />
              <span className={styles.opAyuda}>
                Separa los valores con comas o espacios. Máximo {formatNumber(MAX_ELEMENTOS, 0)}{' '}
                elementos, que es lo que cabe en pantalla.
              </span>
              <div className={styles.opRow}>
                <button type="button" className={styles.opBtn} onClick={handleConstruir}>
                  Construir
                </button>
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnSecondary}`}
                  onClick={handleAleatorio}
                >
                  Al azar (10)
                </button>
              </div>
            </div>

            <div className={styles.opGroup}>
              <label htmlFor="valor-insertar">Insertar un valor</label>
              <div className={styles.opRow}>
                <input
                  id="valor-insertar"
                  type="text"
                  inputMode="decimal"
                  value={valorInsertar}
                  onChange={(e) => setValorInsertar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                />
                <button type="button" className={styles.opBtn} onClick={handleInsertar}>
                  Insertar
                </button>
              </div>
              <span className={styles.opAyuda}>
                El valor entra por la última posición libre del arreglo y sube hasta su sitio.
              </span>
            </div>

            <div className={styles.opGroup}>
              <span className={styles.opTitulo}>Sobre el montículo actual</span>
              <div className={styles.opRow}>
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnSecondary}`}
                  onClick={handleExtraer}
                >
                  Extraer raíz
                </button>
                <button type="button" className={styles.opBtn} onClick={handleHeapsort}>
                  Heapsort
                </button>
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnDanger}`}
                  onClick={handleVaciar}
                >
                  Vaciar
                </button>
              </div>
              <span className={styles.opAyuda}>
                El heapsort deja el arreglo ordenado; al terminar ya no es un montículo del tipo
                elegido, y eso también es parte de lo que se aprende.
              </span>
            </div>
          </div>
        </section>

        {/* Ejemplos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Ejemplos precargados</h2>
          <div className={styles.presetGrid}>
            {EJEMPLOS.map((ejemplo) => (
              <button
                key={ejemplo.id}
                type="button"
                className={styles.presetBtn}
                onClick={() => handleEjemplo(ejemplo)}
              >
                <span className={styles.presetTitle}>{ejemplo.titulo}</span>
                <span className={styles.presetDesc}>{ejemplo.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mensajes */}
        <div className={styles.statusMessage} role="status" aria-live="polite">
          <strong>{nombreOperacion}:</strong> {mensaje}
        </div>

        {descartes.length > 0 && (
          <div className={styles.avisoDescartes} role="alert">
            He descartado {formatNumber(descartes.length, 0)}{' '}
            {descartes.length === 1 ? 'entrada que no es un número' : 'entradas que no son números'}:{' '}
            {descartes.map((d) => `«${d}»`).join(', ')}. El resto sí se ha usado.
          </div>
        )}

        {/* Reproductor de pasos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Pasos de la operación</h2>
          <div className={styles.reproductor}>
            <div className={styles.reproductorBotones}>
              <button
                type="button"
                className={styles.reproductorBtn}
                onClick={() => {
                  setReproduciendo(false);
                  setIndicePaso(0);
                }}
                disabled={!hayPasos || indicePaso === 0}
              >
                Inicio
              </button>
              <button
                type="button"
                className={styles.reproductorBtn}
                onClick={() => {
                  setReproduciendo(false);
                  setIndicePaso((i) => Math.max(i - 1, 0));
                }}
                disabled={!hayPasos || indicePaso === 0}
              >
                Anterior
              </button>
              <button
                type="button"
                className={`${styles.reproductorBtn} ${reproduciendo ? styles.reproductorBtnActivo : ''}`}
                onClick={() => {
                  if (!hayPasos) return;
                  if (enElFinal) setIndicePaso(0);
                  setReproduciendo((r) => !r);
                }}
                aria-pressed={reproduciendo}
                disabled={pasos.length < 2}
              >
                {reproduciendo ? 'Pausar' : 'Reproducir'}
              </button>
              <button
                type="button"
                className={styles.reproductorBtn}
                onClick={() => {
                  setReproduciendo(false);
                  setIndicePaso((i) => Math.min(i + 1, pasos.length - 1));
                }}
                disabled={!hayPasos || enElFinal}
              >
                Siguiente
              </button>
              <button
                type="button"
                className={styles.reproductorBtn}
                onClick={() => {
                  setReproduciendo(false);
                  setIndicePaso(Math.max(pasos.length - 1, 0));
                }}
                disabled={!hayPasos || enElFinal}
              >
                Final
              </button>
            </div>

            <div className={styles.pasoContador}>
              {hayPasos
                ? `Paso ${formatNumber(indicePaso + 1, 0)} de ${formatNumber(pasos.length, 0)}`
                : 'Sin pasos que mostrar'}
            </div>
            <p className={styles.pasoTexto} role="status" aria-live="polite">
              {pasoActual ? pasoActual.descripcion : 'Construye un montículo para ver los pasos.'}
            </p>
            <div className={styles.barraProgreso}>
              <div className={styles.barraProgresoRelleno} style={{ width: `${progreso}%` }} />
            </div>

            <div className={styles.speedControl}>
              <label htmlFor="velocidad">Velocidad de reproducción:</label>
              <input
                id="velocidad"
                type="range"
                min="150"
                max="2000"
                step="50"
                value={velocidad}
                onChange={(e) => setVelocidad(Number(e.target.value))}
              />
              <span className={styles.speedValue}>{formatNumber(velocidad, 0)} ms por paso</span>
            </div>
          </div>
        </section>

        {/* Visualización */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>El montículo, visto como árbol</h2>
          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaPunto} ${styles.puntoRaiz}`} aria-hidden="true" />
              Raíz (índice 0)
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaPunto} ${styles.puntoNormal}`} aria-hidden="true" />
              Nodo del montículo
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaPunto} ${styles.puntoComparado}`} aria-hidden="true" />
              Se compara en este paso
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaPunto} ${styles.puntoIntercambiado}`} aria-hidden="true" />
              Se intercambia en este paso
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaPunto} ${styles.puntoFijo}`} aria-hidden="true" />
              Ya fijado por el heapsort
            </span>
          </div>

          <div className={styles.arbolContainer}>
            {layout.nodos.length === 0 ? (
              <span className={styles.arbolEmpty}>
                El montículo está vacío. Escribe unos valores y pulsa «Construir».
              </span>
            ) : (
              <svg
                className={styles.arbolSvg}
                viewBox={`0 0 ${layout.ancho} ${layout.alto}`}
                width={layout.ancho}
                height={layout.alto}
                role="img"
                aria-label={`Árbol del montículo con ${formatNumber(layout.nodos.length, 0)} nodos, de la raíz hacia abajo: ${layout.nodos.map((n) => formatValor(n.valor)).join(', ')}`}
              >
                {layout.nodos.map((nodo) => {
                  if (nodo.indice === 0) return null;
                  const padre = layout.nodos[padreDe(nodo.indice)];
                  const activa =
                    (comparados.includes(nodo.indice) && comparados.includes(padre.indice)) ||
                    (intercambiados.includes(nodo.indice) && intercambiados.includes(padre.indice));
                  return (
                    <line
                      key={`arista-${nodo.indice}`}
                      x1={padre.x}
                      y1={padre.y}
                      x2={nodo.x}
                      y2={nodo.y}
                      className={`${styles.aristaLinea} ${activa ? styles.aristaActiva : ''}`}
                    />
                  );
                })}
                {layout.nodos.map((nodo) => {
                  let clase = styles.nodoNormal;
                  if (nodo.indice === 0) clase = styles.nodoRaiz;
                  if (comparados.includes(nodo.indice)) clase = styles.nodoComparado;
                  if (intercambiados.includes(nodo.indice)) clase = styles.nodoIntercambiado;
                  return (
                    <g key={`nodo-${nodo.indice}`}>
                      <circle
                        cx={nodo.x}
                        cy={nodo.y}
                        r={RADIO_NODO}
                        className={`${styles.nodoCircle} ${clase}`}
                      />
                      <text x={nodo.x} y={nodo.y} className={styles.nodoLabel}>
                        {formatValor(nodo.valor)}
                      </text>
                      <text x={nodo.x} y={nodo.y + RADIO_NODO + 13} className={styles.indiceLabel}>
                        [{nodo.indice}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          <h3 className={styles.panelTitle}>Y el mismo montículo, como arreglo</h3>
          <div className={styles.arregloStrip}>
            {arregloVisible.length === 0 ? (
              <span className={styles.arregloVacio}>El arreglo está vacío.</span>
            ) : (
              arregloVisible.map((valor, indice) => {
                const esFijo = indice >= arregloVisible.length - fijos;
                let clase = '';
                if (esFijo) clase = styles.celdaFija;
                else if (intercambiados.includes(indice)) clase = styles.celdaIntercambiada;
                else if (comparados.includes(indice)) clase = styles.celdaComparada;
                else if (indice === 0) clase = styles.celdaRaiz;
                return (
                  <span className={styles.celda} key={`celda-${indice}`}>
                    <span className={`${styles.celdaValor} ${clase}`}>{formatValor(valor)}</span>
                    <span className={styles.celdaIndice}>[{indice}]</span>
                  </span>
                );
              })
            )}
          </div>

          <div
            className={`${styles.comprobacion} ${comprobacion.esMonticulo ? styles.comprobacionOk : styles.comprobacionMal}`}
            role="status"
            aria-live="polite"
          >
            <strong>Comprobación del estado visible:</strong> {comprobacion.mensaje}
            {fijos > 0 && (
              <>
                {' '}
                Las {formatNumber(fijos, 0)} últimas posiciones ya están fijadas por el heapsort y
                han salido del montículo, por eso no aparecen en el árbol.
              </>
            )}
          </div>

          <div className={styles.infoLayout}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Elementos en el montículo</span>
              <span className={styles.infoValue}>{formatNumber(parteActiva.length, 0)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Niveles del árbol</span>
              <span className={styles.infoValue}>{formatNumber(nivelesDe(parteActiva.length), 0)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                {tipo === 'max' ? 'Raíz (el mayor)' : 'Raíz (el menor)'}
              </span>
              <span className={styles.infoValue}>
                {parteActiva.length > 0 ? formatValor(parteActiva[0]) : '—'}
              </span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Tipo</span>
              <span className={styles.infoValue}>{tipo === 'max' ? 'Máximos' : 'Mínimos'}</span>
            </div>
          </div>

          {ordenado !== null && (
            <div className={styles.resultadoOrden}>
              <div className={styles.resultadoOrdenTitulo}>
                Resultado del heapsort ({tipo === 'max' ? 'de menor a mayor' : 'de mayor a menor'})
              </div>
              <div className={styles.ordenLista}>{ordenado.map(formatValor).join(', ')}</div>
            </div>
          )}
        </section>
      </main>

      <EducationalSection
        title="Guía del montículo binario"
        subtitle="Qué es, en qué se diferencia de un árbol de búsqueda y por qué es la base de una cola de prioridad"
      >
        <h3>Qué es un montículo binario</h3>
        <p>
          Un montículo binario (en inglés <em>heap</em>) es un árbol binario <strong>casi completo</strong>:
          todos los niveles están llenos salvo el último, que se rellena de izquierda a derecha sin
          dejar huecos. Sobre esa forma impone una única regla, la <strong>propiedad de montículo</strong>:
        </p>
        <ul>
          <li>
            <strong>Montículo de máximos:</strong> todo padre es mayor o igual que sus dos hijos. El
            valor mayor de toda la colección está siempre en la raíz.
          </li>
          <li>
            <strong>Montículo de mínimos:</strong> todo padre es menor o igual que sus dos hijos. El
            valor menor está siempre en la raíz.
          </li>
        </ul>
        <p>
          Como el árbol no tiene huecos, no hace falta guardar punteros: cabe entero en un arreglo, y
          las relaciones familiares se calculan con aritmética de índices. Es la razón de que sea tan
          rápido en la práctica, más allá de lo que diga la notación asintótica: los datos van
          seguidos en memoria.
        </p>
        <pre className={styles.codigoBloque}>
{`padre(i)            = ⌊(i − 1) / 2⌋
hijo_izquierdo(i)   = 2i + 1
hijo_derecho(i)     = 2i + 2

Arreglo:  [ 50, 30, 40, 10, 20, 35 ]
Índices:     0   1   2   3   4   5

              50 [0]
             /      \\
        30 [1]        40 [2]
        /    \\        /
   10 [3]  20 [4]  35 [5]`}
        </pre>

        <h3>La confusión más habitual: un montículo NO está ordenado</h3>
        <p>
          Quien viene de estudiar el árbol binario de búsqueda (BST) suele esperar que el recorrido en
          inorden de un montículo devuelva los valores ordenados. <strong>No es así.</strong> En el
          ejemplo de arriba, el inorden da 10, 30, 20, 50, 35, 40: ni ascendente ni descendente. El
          montículo solo ordena la relación <em>vertical</em> entre un padre y sus hijos; entre
          hermanos, o entre ramas distintas, no promete absolutamente nada.
        </p>
        <p>
          Esa es la razón de que buscar un valor cualquiera en un montículo cueste <strong>O(n)</strong>:
          no hay forma de descartar media estructura en cada paso, porque el 20 puede estar tanto a la
          izquierda como a la derecha. A cambio, el montículo sabe sin buscar dónde está el máximo (o
          el mínimo), y eso es justo lo que hace falta en una cola de prioridad.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>Montículo binario</th>
                <th>Árbol binario de búsqueda (BST)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Qué ordena</td>
                <td>Padre frente a sus hijos (orden vertical)</td>
                <td>Izquierda menor, derecha mayor (orden total)</td>
              </tr>
              <tr>
                <td>Recorrido en inorden</td>
                <td>Sin ningún orden útil</td>
                <td>Devuelve los valores ordenados</td>
              </tr>
              <tr>
                <td>Encontrar el máximo o el mínimo</td>
                <td>O(1): está en la raíz</td>
                <td>O(log n): hay que bajar hasta el extremo</td>
              </tr>
              <tr>
                <td>Buscar un valor cualquiera</td>
                <td>O(n)</td>
                <td>O(log n) si está equilibrado</td>
              </tr>
              <tr>
                <td>Insertar</td>
                <td>O(log n)</td>
                <td>O(log n) equilibrado, O(n) degenerado</td>
              </tr>
              <tr>
                <td>Forma del árbol</td>
                <td>Siempre casi completo, equilibrado por construcción</td>
                <td>Puede degenerar en una lista si no se rebalancea</td>
              </tr>
              <tr>
                <td>Representación habitual</td>
                <td>Arreglo, sin punteros</td>
                <td>Nodos enlazados con punteros</td>
              </tr>
              <tr>
                <td>Para qué se usa</td>
                <td>Colas de prioridad, heapsort, top-k</td>
                <td>Índices, búsquedas por rango, iteración ordenada</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Las cuatro operaciones, y lo que cuesta cada una</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Operación</th>
                <th>Qué hace</th>
                <th>Coste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consultar la raíz</td>
                <td>Leer el índice 0 sin tocar nada</td>
                <td>O(1)</td>
              </tr>
              <tr>
                <td>Insertar (sift-up)</td>
                <td>Poner el valor al final y subirlo mientras sea prioritario frente a su padre</td>
                <td>O(log n)</td>
              </tr>
              <tr>
                <td>Extraer la raíz (sift-down)</td>
                <td>Sacar el índice 0, subir el último elemento a la raíz y hundirlo</td>
                <td>O(log n)</td>
              </tr>
              <tr>
                <td>Construir (heapify de Floyd)</td>
                <td>Hundir cada nodo desde el índice ⌊n/2⌋−1 hacia la raíz</td>
                <td>O(n)</td>
              </tr>
              <tr>
                <td>Buscar un valor</td>
                <td>Recorrer todo: no hay atajo</td>
                <td>O(n)</td>
              </tr>
              <tr>
                <td>Heapsort</td>
                <td>Construir y extraer n−1 veces al final del arreglo</td>
                <td>O(n log n)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          El dato que más sorprende es el de la construcción. Insertar los n valores uno a uno cuesta
          O(n log n), pero el método de Floyd —el que reproduce el botón «Construir»— cuesta{' '}
          <strong>O(n)</strong>: la mitad de los nodos son hojas y no bajan nada, un cuarto baja como
          mucho un nivel, un octavo como mucho dos… y la suma de esa serie converge a un múltiplo de
          n, no a n·log n. Es una de las demostraciones más elegantes de un primer curso de
          algoritmia.
        </p>

        <h3>Cómo se sigue una inserción, paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Coloca el valor en la primera posición libre</strong>
              <p>
                Es el final del arreglo, índice n. Así el árbol sigue siendo casi completo, que es la
                condición que no se puede romper en ningún momento.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Compáralo con su padre</strong>
              <p>
                El padre está en ⌊(i−1)/2⌋. En un montículo de máximos, si el nuevo valor es mayor que
                su padre, la propiedad está rota justo ahí.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Intercámbialo y repite</strong>
              <p>
                Sube al índice del padre y vuelve a comparar. Como el árbol tiene ⌊log₂ n⌋ + 1
                niveles, no puede haber más de log n intercambios.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Para en cuanto el padre gane la comparación</strong>
              <p>
                Si el padre ya es mayor (o menor, en un montículo de mínimos), no hace falta seguir:
                todos los de arriba también lo son, por transitividad. Es el error más común dejarlo
                subir hasta la raíz siempre.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>La extracción es la misma jugada al revés</strong>
              <p>
                Se saca la raíz, el último elemento ocupa su hueco y se hunde eligiendo en cada nivel
                al <em>más prioritario de los dos hijos</em>. Hundir hacia el hijo equivocado es el
                otro fallo clásico.
              </p>
            </div>
          </div>
        </div>

        <h3>El heapsort, y por qué un montículo de máximos ordena de menor a mayor</h3>
        <p>
          El heapsort aprovecha que la raíz siempre es el valor extremo. Construye el montículo y
          después repite n−1 veces la misma jugada: intercambia la raíz con el último elemento del
          tramo activo, encoge ese tramo en uno —esa posición ya queda fija— y hunde la nueva raíz.
        </p>
        <p>
          Con un montículo de <strong>máximos</strong>, cada vuelta deposita el mayor de los que
          quedan en la posición más a la derecha: el arreglo va quedando <strong>ascendente</strong>.
          Con uno de mínimos ocurre lo simétrico y queda descendente. Es contraintuitivo la primera
          vez, y es exactamente lo que se ve marcado en gris en el simulador cuando pulsas «Heapsort».
        </p>
        <p>
          El heapsort ordena en O(n log n) también en el peor caso y <strong>sin memoria auxiliar</strong>,
          dos garantías que quicksort no da. Aun así, en la práctica suele perder frente a quicksort
          porque salta por el arreglo en lugar de recorrerlo seguido, y eso desaprovecha la caché del
          procesador. Tampoco es estable: dos valores iguales pueden acabar en orden intercambiado.
        </p>

        <h3>Dónde se usa de verdad</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
              <strong>Dijkstra y A* (rutas más cortas)</strong>
            </div>
            <p className={styles.escenarioExample}>
              La cola de prioridad decide qué nodo se explora antes. Con un montículo binario, Dijkstra
              pasa de O(V²) a O((V+E)·log V), que es lo que hace viable calcular rutas sobre un mapa
              con millones de intersecciones.
            </p>
            <p className={styles.escenarioTip}>
              Aquí interesa un montículo de <strong>mínimos</strong>: el siguiente nodo es el de menor
              distancia acumulada.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⚙️</span>
              <strong>Planificador de un sistema operativo</strong>
            </div>
            <p className={styles.escenarioExample}>
              Qué proceso entra ahora en el procesador, y qué temporizador vence antes. El núcleo
              necesita responder «el más urgente» miles de veces por segundo, y consultarlo cuesta
              O(1).
            </p>
            <p className={styles.escenarioTip}>
              Linux usa un árbol rojo-negro en su planificador CFS, pero los temporizadores del núcleo
              sí se apoyan en estructuras de tipo montículo.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
              <strong>Los k mayores de un flujo de datos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Para quedarte con los 100 productos más vendidos de un flujo de millones de eventos,
              mantienes un montículo de <em>mínimos</em> de tamaño 100: si el nuevo evento supera a la
              raíz, sustituye a la raíz; si no, se descarta.
            </p>
            <p className={styles.escenarioTip}>
              Coste O(n·log k) y memoria O(k), sin necesidad de ordenar los n elementos ni de
              guardarlos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗜️</span>
              <strong>Compresión de Huffman</strong>
            </div>
            <p className={styles.escenarioExample}>
              El algoritmo saca repetidamente los dos símbolos menos frecuentes para fusionarlos. Un
              montículo de mínimos entrega esos dos en O(log n) por vuelta y devuelve el nodo fusionado
              a la misma estructura.
            </p>
            <p className={styles.escenarioTip}>
              Está detrás de formatos tan cotidianos como ZIP, JPEG o los antiguos MP3.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📅</span>
              <strong>Simulación de eventos discretos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Colas de un supermercado, tráfico de red, líneas de producción: la simulación avanza
              sacando siempre el evento con la marca de tiempo menor de una cola de prioridad.
            </p>
            <p className={styles.escenarioTip}>
              Insertar el evento que ese propio evento genera cuesta también O(log n), así que la
              simulación no se degrada al crecer.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔀</span>
              <strong>Mezclar k listas ya ordenadas</strong>
            </div>
            <p className={styles.escenarioExample}>
              Con un montículo de mínimos de tamaño k que guarda el primer elemento pendiente de cada
              lista, se fusionan k listas en O(N·log k). Es el corazón del mezclado externo cuando los
              datos no caben en memoria.
            </p>
            <p className={styles.escenarioTip}>
              El mismo patrón aparece al unir resultados parciales de varios servidores en un buscador.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Un montículo admite valores repetidos?</h4>
            <p>
              Sí, y sin ninguna precaución especial: la propiedad se enuncia con «mayor o igual» (o
              «menor o igual»), así que dos valores iguales pueden ser padre e hijo. Es una diferencia
              práctica frente al árbol binario de búsqueda, donde hay que decidir a qué lado van los
              duplicados y una decisión incoherente rompe las búsquedas.
            </p>
            <p className={styles.faqTip}>
              Pruébalo cargando 7, 7, 3, 9, 3, 9, 1 en el campo de construcción.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se borra un elemento que no es la raíz?</h4>
            <p>
              Localizas su índice —eso ya cuesta O(n) si no lo tienes guardado—, lo sustituyes por el
              último elemento del arreglo, acortas el arreglo y desde esa posición aplicas{' '}
              <em>una</em> de las dos: si el valor nuevo es más prioritario que su padre, sube; si no,
              hunde. Las colas de prioridad serias mantienen un diccionario de valor a índice para
              evitar ese O(n).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Y cómo se cambia la prioridad de un elemento ya insertado?</h4>
            <p>
              Es la operación <em>decrease-key</em> que necesita Dijkstra. Modificas el valor en su
              índice y aplicas sift-up o sift-down según haya subido o bajado su prioridad: O(log n).
              Muchas implementaciones sencillas evitan esta operación insertando una entrada nueva y
              descartando las obsoletas al sacarlas, lo que a cambio hace crecer la cola.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Existen montículos que no sean binarios?</h4>
            <p>
              Sí. El montículo <em>d</em>-ario da d hijos a cada nodo: el árbol es más bajo, así que
              insertar es más rápido, pero hundir compara con d hijos en cada nivel. El montículo
              binomial y el de Fibonacci mejoran la fusión de dos colas y el <em>decrease-key</em>{' '}
              amortizado, a cambio de constantes altas que los hacen poco prácticos salvo en tamaños
              muy grandes.
            </p>
            <p className={styles.faqTip}>
              Para la inmensa mayoría de los casos reales, el binario en arreglo sigue ganando por
              simplicidad y por localidad de memoria.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hay montículos en las bibliotecas estándar?</h4>
            <p>
              Sí, y conviene conocer su sentido por defecto, porque no coinciden. En Python,{' '}
              <code>heapq</code> es de <strong>mínimos</strong>. En C++, <code>priority_queue</code> y
              las funciones <code>make_heap</code>/<code>push_heap</code> son de{' '}
              <strong>máximos</strong>. En Java, <code>PriorityQueue</code> es de mínimos según el
              orden natural. JavaScript no trae ninguno en su biblioteca estándar.
            </p>
            <p className={styles.faqTip}>
              Truco clásico para invertir el sentido sin escribir un comparador: insertar los valores
              con el signo cambiado.
            </p>
          </div>
        </div>

        <h3>Recomendaciones al implementarlo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧮</span>
            <strong>Empieza el arreglo en el índice 0</strong>
            <p>
              Muchos libros empiezan en 1 para que el padre sea ⌊i/2⌋ y quede más limpio. Mezclar las
              dos convenciones en el mismo código es una fuente inagotable de errores por uno.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔽</span>
            <strong>Hunde comparando con los dos hijos</strong>
            <p>
              El intercambio debe hacerse con el <em>más prioritario</em> de los dos, no con el primero
              que gane al padre. Elegir mal el hijo rompe la propiedad un nivel más abajo y el fallo
              tarda en aparecer.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📏</span>
            <strong>Comprueba siempre el límite del tramo</strong>
            <p>
              En el heapsort, hundir usa el tamaño del tramo activo, no la longitud del arreglo. Usar
              la longitud completa vuelve a mezclar la parte ya ordenada y arruina el resultado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Prueba con el arreglo ya ordenado y con el invertido</strong>
            <p>
              Son los casos que destapan los errores de límites. Y con 0, 1 y 2 elementos: la mayoría
              de fallos de un montículo recién escrito están en esos tres tamaños.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Escribe un validador de la propiedad</strong>
            <p>
              Una función que recorra los índices y compare cada padre con sus hijos ocupa cinco
              líneas y detecta al instante cualquier operación mal implementada. Es lo que hace el
              recuadro «Comprobación» de esta página.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <strong>Si necesitas orden total, no uses un montículo</strong>
            <p>
              Un montículo solo responde bien a «dame el más prioritario». Si además necesitas
              recorrer los elementos en orden o buscar por rangos, la estructura adecuada es un árbol
              equilibrado.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al trabajar con montículos</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Esperar que el recorrido en inorden devuelva los valores ordenados: eso es del BST, no del montículo.</li>
            <li>Hundir intercambiando con el primer hijo que gane al padre, en vez de con el más prioritario de los dos.</li>
            <li>Olvidar comprobar que el hijo existe antes de compararlo, y leer fuera del arreglo en la última fila.</li>
            <li>Usar la longitud total del arreglo en lugar del tramo activo durante el heapsort.</li>
            <li>Construir insertando uno a uno cuando el heapify de Floyd resuelve lo mismo en O(n).</li>
            <li>Confundir el sentido de la biblioteca del lenguaje: heapq es de mínimos y priority_queue de C++ es de máximos.</li>
            <li>Dar por estable el heapsort: dos valores iguales pueden salir en orden distinto al de entrada.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-monticulo-binario')} />
      <ShareCard appName="simulador-monticulo-binario" />
      <Footer appName="simulador-monticulo-binario" />
    </div>
  );
}
