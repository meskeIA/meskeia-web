'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './GeneradorNonogramas.module.css';
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

type Dibujo = boolean[][];

type Verificacion =
  | { estado: 'unico' }
  | { estado: 'ambiguo'; sinResolver: number }
  | { estado: 'vacio' }
  | { estado: 'demasiado-complejo' };

interface Figura {
  id: string;
  nombre: string;
  icono: string;
  lado: number;
  filas: string[];
}

/** Figuras de ejemplo: '#' pintado, '.' vacío */
const FIGURAS: Figura[] = [
  {
    id: 'corazon',
    nombre: 'Corazón',
    icono: '❤️',
    lado: 10,
    filas: [
      '.##....##.',
      '####..####',
      '##########',
      '##########',
      '##########',
      '.########.',
      '..######..',
      '...####...',
      '....##....',
      '..........',
    ],
  },
  {
    id: 'casa',
    nombre: 'Casa',
    icono: '🏠',
    lado: 10,
    filas: [
      '....##....',
      '...####...',
      '..######..',
      '.########.',
      '##########',
      '.##....##.',
      '.##.##.##.',
      '.##.##.##.',
      '.##.##.##.',
      '.########.',
    ],
  },
  {
    id: 'gato',
    nombre: 'Gato',
    icono: '🐱',
    lado: 10,
    filas: [
      '.##....##.',
      '.####..###',
      '.########.',
      '.#.####.#.',
      '.########.',
      '..######..',
      '.########.',
      '.##.##.##.',
      '.########.',
      '..##..##..',
    ],
  },
  {
    id: 'ancla',
    nombre: 'Ancla',
    icono: '⚓',
    lado: 10,
    filas: [
      '....##....',
      '...#..#...',
      '....##....',
      '..######..',
      '....##....',
      '#...##...#',
      '#...##...#',
      '##..##..##',
      '.########.',
      '...####...',
    ],
  },
  {
    id: 'cruz',
    nombre: 'Cruz (5×5)',
    icono: '➕',
    lado: 5,
    filas: ['..#..', '..#..', '#####', '..#..', '..#..'],
  },
];

const LADOS = [5, 10, 15];

// ─────────────────────────────────────────────────────────────
// Cálculo de pistas y verificación por líneas
// ─────────────────────────────────────────────────────────────

/** Grupos consecutivos de casillas pintadas en una línea */
function pistasDeLinea(linea: boolean[]): number[] {
  const pistas: number[] = [];
  let racha = 0;
  linea.forEach((pintada) => {
    if (pintada) {
      racha += 1;
    } else if (racha > 0) {
      pistas.push(racha);
      racha = 0;
    }
  });
  if (racha > 0) pistas.push(racha);
  return pistas.length > 0 ? pistas : [0];
}

function pistasDeFilas(dibujo: Dibujo): number[][] {
  return dibujo.map(pistasDeLinea);
}

function pistasDeColumnas(dibujo: Dibujo): number[][] {
  const lado = dibujo.length;
  return Array.from({ length: lado }, (_, c) => pistasDeLinea(dibujo.map((fila) => fila[c])));
}

/** Estado de una casilla durante la resolución: desconocida, vacía o pintada */
const DESCONOCIDA = -1;
const VACIA = 0;
const PINTADA = 1;

const LIMITE_COLOCACIONES = 30000;

/**
 * Todas las formas de encajar las pistas en una línea que sean compatibles
 * con lo que ya se sabe de ella.
 */
function colocacionesCompatibles(pistas: number[], estado: number[]): number[][] | null {
  const longitud = estado.length;
  const resultado: number[][] = [];
  const activas = pistas.filter((p) => p > 0);

  const construir = (indice: number, posicion: number, actual: number[]) => {
    if (resultado.length > LIMITE_COLOCACIONES) return;

    if (indice === activas.length) {
      const completa = [...actual, ...Array(longitud - actual.length).fill(VACIA)];
      const compatible = completa.every((v, i) => estado[i] === DESCONOCIDA || estado[i] === v);
      if (compatible) resultado.push(completa);
      return;
    }

    const bloque = activas[indice];
    const restante = activas.slice(indice + 1).reduce((s, p) => s + p + 1, 0);

    for (let inicio = posicion; inicio + bloque + restante <= longitud; inicio++) {
      const tramo = [
        ...actual,
        ...Array(inicio - actual.length).fill(VACIA),
        ...Array(bloque).fill(PINTADA),
      ];
      // Poda temprana: si el tramo ya contradice lo conocido, no seguir por ahí
      const valido = tramo.every((v, i) => estado[i] === DESCONOCIDA || estado[i] === v);
      if (!valido) continue;

      const siguiente = indice === activas.length - 1 ? tramo : [...tramo, VACIA];
      construir(indice + 1, siguiente.length, siguiente);
    }
  };

  construir(0, 0, []);
  return resultado.length > LIMITE_COLOCACIONES ? null : resultado;
}

/** Casillas que valen lo mismo en todas las colocaciones posibles: son deducciones seguras */
function deducirLinea(pistas: number[], estado: number[]): number[] | null {
  const opciones = colocacionesCompatibles(pistas, estado);
  if (opciones === null) return null;
  if (opciones.length === 0) return estado;

  return estado.map((valor, i) => {
    if (valor !== DESCONOCIDA) return valor;
    const primera = opciones[0][i];
    return opciones.every((op) => op[i] === primera) ? primera : DESCONOCIDA;
  });
}

/**
 * Intenta resolver el nonograma solo con lógica de líneas, que es como lo
 * resolvería una persona. Si queda alguna casilla sin determinar, el puzzle
 * es ambiguo y no debería imprimirse.
 */
function verificar(dibujo: Dibujo): Verificacion {
  const lado = dibujo.length;
  if (dibujo.every((fila) => fila.every((celda) => !celda))) return { estado: 'vacio' };

  const filas = pistasDeFilas(dibujo);
  const columnas = pistasDeColumnas(dibujo);
  const tablero: number[][] = Array.from({ length: lado }, () => Array(lado).fill(DESCONOCIDA));

  let progreso = true;
  while (progreso) {
    progreso = false;

    for (let f = 0; f < lado; f++) {
      const deducida = deducirLinea(filas[f], tablero[f]);
      if (deducida === null) return { estado: 'demasiado-complejo' };
      deducida.forEach((valor, c) => {
        if (tablero[f][c] === DESCONOCIDA && valor !== DESCONOCIDA) {
          tablero[f][c] = valor;
          progreso = true;
        }
      });
    }

    for (let c = 0; c < lado; c++) {
      const columna = tablero.map((fila) => fila[c]);
      const deducida = deducirLinea(columnas[c], columna);
      if (deducida === null) return { estado: 'demasiado-complejo' };
      deducida.forEach((valor, f) => {
        if (tablero[f][c] === DESCONOCIDA && valor !== DESCONOCIDA) {
          tablero[f][c] = valor;
          progreso = true;
        }
      });
    }
  }

  const sinResolver = tablero.flat().filter((v) => v === DESCONOCIDA).length;
  return sinResolver === 0 ? { estado: 'unico' } : { estado: 'ambiguo', sinResolver };
}

// ─────────────────────────────────────────────────────────────
// Utilidades de dibujo
// ─────────────────────────────────────────────────────────────

function lienzoVacio(lado: number): Dibujo {
  return Array.from({ length: lado }, () => Array(lado).fill(false));
}

function figuraADibujo(figura: Figura): Dibujo {
  return figura.filas.map((fila) => fila.split('').map((c) => c === '#'));
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorNonogramasPage() {
  const [titulo, setTitulo] = useState('Nonograma');
  const [lado, setLado] = useState(10);
  const [dibujo, setDibujo] = useState<Dibujo>(() => figuraADibujo(FIGURAS[0]));
  const [verificacion, setVerificacion] = useState<Verificacion | null>(null);
  const [comprobando, setComprobando] = useState(false);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const pintando = useRef<boolean | null>(null);

  // Cualquier cambio del dibujo invalida la comprobación anterior
  useEffect(() => {
    setVerificacion(null);
  }, [dibujo]);

  useEffect(() => {
    const soltar = () => {
      pintando.current = null;
    };
    window.addEventListener('pointerup', soltar);
    return () => window.removeEventListener('pointerup', soltar);
  }, []);

  const alternarCelda = (fila: number, columna: number, valor?: boolean) => {
    setDibujo((previo) =>
      previo.map((f, i) =>
        i === fila ? f.map((c, j) => (j === columna ? (valor ?? !c) : c)) : f,
      ),
    );
  };

  const cambiarLado = (nuevo: number) => {
    setLado(nuevo);
    setDibujo(lienzoVacio(nuevo));
    setMostrarSolucion(false);
  };

  const cargarFigura = (figura: Figura) => {
    setLado(figura.lado);
    setDibujo(figuraADibujo(figura));
    setMostrarSolucion(false);
  };

  const rellenarAlAzar = (densidad: number) => {
    setDibujo(
      Array.from({ length: lado }, () =>
        Array.from({ length: lado }, () => Math.random() < densidad),
      ),
    );
    setMostrarSolucion(false);
  };

  const comprobar = useCallback(() => {
    setComprobando(true);
    window.setTimeout(() => {
      setVerificacion(verificar(dibujo));
      setComprobando(false);
    }, 30);
  }, [dibujo]);

  const filas = pistasDeFilas(dibujo);
  const columnas = pistasDeColumnas(dibujo);
  const maxPistasFila = Math.max(...filas.map((p) => p.filter((n) => n > 0).length), 1);
  const maxPistasColumna = Math.max(...columnas.map((p) => p.filter((n) => n > 0).length), 1);
  const pintadas = dibujo.flat().filter(Boolean).length;
  const densidadActual = Math.round((pintadas / (lado * lado)) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.noPrint}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🎨</span> Generador de Nonogramas
          </h1>
          <p className={styles.subtitle}>
            Dibuja una figura y conviértela en un crucigrama japonés. Antes de imprimir, la app
            comprueba si se puede resolver solo con lógica.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          {/* Editor */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">✏️</span> Dibuja la figura
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de la hoja</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={50}
                placeholder="Nonograma"
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Tamaño</span>
              <div className={styles.chips} role="group" aria-label="Tamaño de la cuadrícula">
                {LADOS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.chip} ${lado === n ? styles.chipActivo : ''}`}
                    aria-pressed={lado === n}
                    onClick={() => cambiarLado(n)}
                  >
                    {n} × {n}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Figuras de ejemplo</span>
              <div className={styles.chips}>
                {FIGURAS.map((figura) => (
                  <button
                    key={figura.id}
                    type="button"
                    className={styles.chip}
                    onClick={() => cargarFigura(figura)}
                  >
                    <span aria-hidden="true">{figura.icono}</span> {figura.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={styles.lienzo}
              style={{ gridTemplateColumns: `repeat(${lado}, 1fr)` }}
              role="group"
              aria-label={`Cuadrícula de dibujo de ${lado} por ${lado}`}
            >
              {dibujo.map((fila, f) =>
                fila.map((pintada, c) => (
                  <button
                    key={`${f}-${c}`}
                    type="button"
                    className={`${styles.celdaEditor} ${pintada ? styles.celdaPintada : ''} ${
                      (f + 1) % 5 === 0 && f !== lado - 1 ? styles.guiaInferior : ''
                    } ${(c + 1) % 5 === 0 && c !== lado - 1 ? styles.guiaDerecha : ''}`}
                    aria-pressed={pintada}
                    aria-label={`Fila ${f + 1}, columna ${c + 1}`}
                    onPointerDown={() => {
                      pintando.current = !pintada;
                      alternarCelda(f, c, !pintada);
                    }}
                    onPointerEnter={() => {
                      if (pintando.current !== null) alternarCelda(f, c, pintando.current);
                    }}
                  />
                )),
              )}
            </div>

            <div className={styles.acciones}>
              <button type="button" className={styles.btnSecundario} onClick={() => rellenarAlAzar(0.5)}>
                <span aria-hidden="true">🎲</span> Al azar
              </button>
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() => setDibujo(lienzoVacio(lado))}
              >
                <span aria-hidden="true">🧽</span> Borrar todo
              </button>
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() => setDibujo((d) => d.map((f) => f.map((c) => !c)))}
              >
                <span aria-hidden="true">🔃</span> Invertir
              </button>
            </div>

            <p className={styles.pista}>
              {pintadas} casillas pintadas de {lado * lado} ({densidadActual}% de relleno). Un relleno del
              40% al 60% da figuras reconocibles, pero lo que evita la ambigüedad es que las casillas
              estén <strong>agrupadas</strong>: las sueltas y dispersas son las que rompen el puzzle.
            </p>
          </div>

          {/* Verificación */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🔍</span> ¿Tiene solución única?
            </h2>

            <p className={styles.vacio}>
              Un nonograma solo es válido si sus pistas determinan una única figura. Esta comprobación
              intenta resolverlo por lógica de líneas, igual que haría una persona.
            </p>

            <button type="button" className={styles.btnPrimary} onClick={comprobar} disabled={comprobando}>
              <span aria-hidden="true">{comprobando ? '⏳' : '🧠'}</span>{' '}
              {comprobando ? 'Resolviendo por lógica…' : 'Comprobar el nonograma'}
            </button>

            {verificacion && (
              <div
                className={
                  verificacion.estado === 'unico' ? styles.resultadoBien : styles.resultadoAviso
                }
                role="status"
                aria-live="polite"
              >
                {verificacion.estado === 'unico' && (
                  <>
                    <strong>
                      <span aria-hidden="true">✅</span> Solución única
                    </strong>
                    <p>
                      Se resuelve entero analizando una fila o columna cada vez, sin suponer nada. Es un
                      nonograma correcto y se puede imprimir.
                    </p>
                  </>
                )}
                {verificacion.estado === 'ambiguo' && (
                  <>
                    <strong>
                      <span aria-hidden="true">⚠️</span> Ambiguo: {verificacion.sinResolver} casillas sin
                      determinar
                    </strong>
                    <p>
                      Las pistas no bastan para deducir esas casillas: quien lo resuelva tendría que
                      adivinar. Prueba a modificar el contorno de la figura o a rellenar algún hueco
                      suelto, que es lo que suele generar la ambigüedad.
                    </p>
                  </>
                )}
                {verificacion.estado === 'vacio' && (
                  <>
                    <strong>
                      <span aria-hidden="true">⚠️</span> La cuadrícula está vacía
                    </strong>
                    <p>Pinta algunas casillas antes de comprobar.</p>
                  </>
                )}
                {verificacion.estado === 'demasiado-complejo' && (
                  <>
                    <strong>
                      <span aria-hidden="true">⚠️</span> Demasiadas combinaciones
                    </strong>
                    <p>
                      Alguna línea admite tantas colocaciones que la comprobación se ha detenido. Suele
                      pasar con figuras muy dispersas en cuadrículas grandes; agrupa las casillas
                      pintadas y vuelve a intentarlo.
                    </p>
                  </>
                )}
              </div>
            )}

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
            </div>

            <p className={styles.pista}>
              Se imprime lo que ves: primero la cuadrícula en blanco con las pistas y, si quieres
              corregir, activa la solución y vuelve a imprimir.
            </p>
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      <div className={styles.printArea}>
        <h2 className={styles.tituloHoja}>{titulo || 'Nonograma'}</h2>

        <div className={styles.envoltorioPuzzle}>
          <table className={styles.tablaPuzzle}>
            <caption className={styles.srOnly}>
              Nonograma de {lado} por {lado} casillas con las pistas de cada fila y columna
            </caption>
            <thead>
              <tr>
                <th className={styles.esquina} aria-label="Pistas" />
                {columnas.map((pistas, c) => (
                  <th key={c} className={styles.pistaColumna} scope="col">
                    <span className={styles.numerosVerticales}>
                      {Array.from({ length: maxPistasColumna }, (_, i) => {
                        const activas = pistas.filter((n) => n > 0);
                        const desplazamiento = maxPistasColumna - activas.length;
                        const valor = i >= desplazamiento ? activas[i - desplazamiento] : null;
                        return (
                          <span key={i} className={styles.numeroPista}>
                            {valor ?? ''}
                          </span>
                        );
                      })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dibujo.map((fila, f) => (
                <tr key={f}>
                  <th className={styles.pistaFila} scope="row">
                    <span className={styles.numerosHorizontales}>
                      {Array.from({ length: maxPistasFila }, (_, i) => {
                        const activas = filas[f].filter((n) => n > 0);
                        const desplazamiento = maxPistasFila - activas.length;
                        const valor = i >= desplazamiento ? activas[i - desplazamiento] : null;
                        return (
                          <span key={i} className={styles.numeroPista}>
                            {valor ?? ''}
                          </span>
                        );
                      })}
                    </span>
                  </th>
                  {fila.map((pintada, c) => (
                    <td
                      key={c}
                      className={`${
                        mostrarSolucion && pintada ? styles.celdaSolucion : styles.celdaPuzzle
                      } ${(f + 1) % 5 === 0 && f !== lado - 1 ? styles.guiaInferior : ''} ${
                        (c + 1) % 5 === 0 && c !== lado - 1 ? styles.guiaDerecha : ''
                      }`}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.pieHoja}>
          {lado} × {lado} · {pintadas} casillas pintadas ·{' '}
          {mostrarSolucion ? 'CON SOLUCIÓN' : 'para resolver'} · meskeia.com
        </p>
      </div>

      <div className={styles.noPrint}>
        <EducationalSection
          icon="📚"
          title="Cómo se resuelve un nonograma"
          subtitle="Qué dicen las pistas, por qué algunos son irresolubles y qué figuras funcionan"
        >
          <section className={styles.guideSection}>
            <h2>Lo que dicen los números</h2>
            <p>
              Cada fila y cada columna llevan una lista de números que describen los{' '}
              <strong>grupos consecutivos</strong> de casillas pintadas, en orden y separados por al
              menos un hueco. Una línea marcada con «4 2» tiene cuatro casillas seguidas, luego al menos
              una vacía, y después dos seguidas. Lo que no dicen es dónde empiezan: eso es lo que hay que
              deducir cruzando la información de filas y columnas.
            </p>
            <p>
              El razonamiento básico se llama <em>solapamiento</em>. En una línea de diez casillas con una
              pista de ocho, el bloque puede empezar en tres posiciones distintas, pero en todas ellas las
              seis casillas centrales quedan pintadas. Esas seis son seguras aunque todavía no se sepa la
              posición exacta. Marcarlas desbloquea las columnas que las cruzan, y así avanza el puzzle.
            </p>

            <h2>El error que arruina un nonograma casero</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Situación</th>
                    <th>Qué ocurre</th>
                    <th>Cómo se arregla</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Casillas sueltas dispersas</strong>
                    </td>
                    <td>Varias figuras distintas producen las mismas pistas: el puzzle es irresoluble sin adivinar</td>
                    <td>Agrupar las casillas en bloques y contornos continuos</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Relleno por debajo del 30%</strong>
                    </td>
                    <td>Demasiadas colocaciones posibles por línea, ambigüedad casi segura</td>
                    <td>Engordar la figura o reducir el tamaño de la cuadrícula</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Relleno por encima del 70%</strong>
                    </td>
                    <td>Se resuelve casi solo y la figura no se distingue del fondo</td>
                    <td>Vaciar zonas interiores para dar forma reconocible</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Simetría perfecta</strong>
                    </td>
                    <td>Puede generar dos soluciones espejo compatibles con las mismas pistas</td>
                    <td>Romper la simetría con un detalle asimétrico</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Tres formas de usarlo</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🧑‍🏫
                  </span>
                  <h3>Lógica en el aula</h3>
                </div>
                <p>
                  El nonograma de 5×5 introduce el razonamiento deductivo sin necesidad de saber
                  aritmética: solo hay que contar y descartar. Es un buen primer contacto con la idea de
                  deducción segura frente a suposición.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎁
                  </span>
                  <h3>Mensaje escondido</h3>
                </div>
                <p>
                  Dibujando una inicial, un símbolo o una fecha, el puzzle se convierte en una invitación
                  o un regalo: quien lo resuelve descubre la figura al terminar. Aquí conviene comprobar
                  la unicidad antes de imprimir.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🧠
                  </span>
                  <h3>Entrenamiento visual</h3>
                </div>
                <p>
                  En estimulación cognitiva se usa por combinar conteo, atención sostenida y memoria de
                  trabajo. El tamaño de 10×10 con figura clara es el que mejor equilibrio ofrece entre
                  reto y frustración.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué mi dibujo sale ambiguo?
                </h4>
                <p>
                  Porque otro dibujo distinto genera exactamente las mismas pistas. El caso típico son las
                  casillas sueltas repartidas por la cuadrícula: si dos filas y dos columnas se cruzan
                  formando un rectángulo con dos casillas pintadas en diagonal, las otras dos esquinas dan
                  las mismas pistas y no hay forma de saber cuál es la buena. Agrupar las casillas
                  resuelve casi siempre el problema.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Se pueden marcar las casillas descartadas?
                </h4>
                <p>
                  Es imprescindible a partir de 10×10. La técnica habitual es pintar las casillas seguras
                  y marcar con una cruz o un punto las que se sabe que quedan vacías. Sin esa marca se
                  pierde la mitad de la información deducida y uno acaba recalculando la misma línea una y
                  otra vez.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Qué significa «demasiadas combinaciones»?
                </h4>
                <p>
                  La comprobación calcula todas las formas de encajar las pistas en cada línea. Con
                  figuras muy dispersas en cuadrículas de 15×15, una sola línea puede admitir decenas de
                  miles de colocaciones y el análisis se detiene para no bloquear el navegador. Es en sí
                  mismo un indicio de que ese puzzle sería muy difícil o ambiguo.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Nonograma, picross o hanjie?
                </h4>
                <p>
                  Son el mismo pasatiempo con distintos nombres. Nonograma es el término genérico, hanjie
                  el japonés, picross el nombre que popularizó Nintendo en los videojuegos y crucigrama
                  japonés la denominación más común en las revistas en español. También aparece como
                  griddler o pixel puzzle.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores al crear nonogramas</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Imprimir sin comprobar la unicidad:</strong> es el fallo más común de los
                  generadores automáticos y condena a quien resuelve a adivinar en algún punto.
                </li>
                <li>
                  <strong>Dibujar con trazos de una sola casilla:</strong> las líneas finas producen pistas
                  llenas de unos, que son las que más ambigüedad generan.
                </li>
                <li>
                  <strong>Buscar el detalle en 10×10:</strong> una cara con ojos y boca necesita al menos
                  15×15; en menos resolución la figura se vuelve irreconocible.
                </li>
                <li>
                  <strong>Confundir relleno con dificultad:</strong> un nonograma muy lleno se resuelve
                  antes que uno equilibrado, porque las pistas grandes fijan casillas desde el principio.
                </li>
                <li>
                  <strong>Olvidar que se imprime lo que se ve:</strong> con la solución activada, la hoja sale
                  resuelta.
                </li>
                <li>
                  <strong>Modificar el dibujo tras comprobarlo:</strong> cualquier cambio invalida el
                  análisis anterior; hay que volver a comprobar antes de imprimir.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-nonogramas')} />

        <ShareCard appName="generador-nonogramas" />

        <Footer appName="generador-nonogramas" />
      </div>
    </div>
  );
}
