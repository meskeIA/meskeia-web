'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorSopaLetras.module.css';
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

type Nivel = 'facil' | 'medio' | 'dificil';

interface Celda {
  fila: number;
  col: number;
}

interface PalabraColocada {
  palabra: string;
  celdas: Celda[];
}

interface Sopa {
  cuadricula: string[][];
  colocadas: PalabraColocada[];
  descartadas: string[];
  semilla: number;
}

/** Direcciones como [deltaFila, deltaColumna] */
const DIRECCIONES: Record<Nivel, ReadonlyArray<readonly [number, number]>> = {
  // Solo izquierda→derecha y arriba→abajo (lectores principiantes)
  facil: [
    [0, 1],
    [1, 0],
  ],
  // Añade las dos diagonales descendentes
  medio: [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ],
  // Las ocho direcciones, incluidas las invertidas
  dificil: [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, -1],
    [-1, 1],
  ],
};

const ETIQUETAS_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil · derecha y abajo',
  medio: 'Medio · con diagonales',
  dificil: 'Difícil · las 8 direcciones',
};

/** Frecuencia aproximada de letras del español, para que el relleno no delate las palabras */
const LETRAS_RELLENO = 'EEEEEEEEEEEEAAAAAAAAAAAOOOOOOOOOSSSSSSSRRRRRRNNNNNNIIIIIIDDDDDLLLLLCCCCTTTTUUUUMMMPPPBBGGVVYYQQHHFFZJXKWÑ';

const LISTAS_TEMATICAS: { id: string; nombre: string; icono: string; palabras: string[] }[] = [
  {
    id: 'animales',
    nombre: 'Animales',
    icono: '🦁',
    palabras: ['ELEFANTE', 'JIRAFA', 'TORTUGA', 'DELFIN', 'CABALLO', 'ARDILLA', 'PINGUINO', 'COCODRILO', 'MARIPOSA', 'LOBO'],
  },
  {
    id: 'frutas',
    nombre: 'Frutas y verduras',
    icono: '🍎',
    palabras: ['SANDIA', 'AGUACATE', 'ZANAHORIA', 'CEREZA', 'ESPINACA', 'MANGO', 'CALABAZA', 'PLATANO', 'LECHUGA', 'PIMIENTO'],
  },
  {
    id: 'cuerpo',
    nombre: 'Cuerpo humano',
    icono: '🫀',
    palabras: ['PULMON', 'ESTOMAGO', 'RODILLA', 'CLAVICULA', 'HIGADO', 'MUNECA', 'CEREBRO', 'TOBILLO', 'COLUMNA', 'RETINA'],
  },
  {
    id: 'oficios',
    nombre: 'Oficios',
    icono: '🧰',
    palabras: ['CARPINTERO', 'ENFERMERA', 'PANADERO', 'MECANICO', 'ABOGADA', 'FONTANERO', 'PERIODISTA', 'ALBANIL', 'COCINERO', 'MAESTRA'],
  },
  {
    id: 'deportes',
    nombre: 'Deportes',
    icono: '⚽',
    palabras: ['NATACION', 'BALONCESTO', 'ATLETISMO', 'CICLISMO', 'JUDO', 'VOLEIBOL', 'ESGRIMA', 'PATINAJE', 'REMO', 'BOXEO'],
  },
  {
    id: 'geografia',
    nombre: 'Geografía',
    icono: '🌎',
    palabras: ['MONTANA', 'DESIERTO', 'PENINSULA', 'VOLCAN', 'ARCHIPIELAGO', 'MESETA', 'GLACIAR', 'ESTUARIO', 'SABANA', 'ARRECIFE'],
  },
];

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador congruencial con semilla: la misma semilla produce siempre la misma sopa */
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

/** Tabla de equivalencias: la Ñ no aparece porque debe conservarse tal cual */
const SIN_TILDE: Record<string, string> = {
  'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A',
  'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
  'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I',
  'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O',
  'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U',
  'Ç': 'C',
};

/** Mayúsculas sin tildes ni signos; la ñ se conserva porque es letra propia del español */
function normalizar(texto: string): string {
  return texto
    .toUpperCase()
    .split('')
    .map((caracter) => SIN_TILDE[caracter] ?? caracter)
    .join('')
    .replace(/[^A-ZÑ]/g, '');
}

function barajar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Coloca las palabras en la cuadrícula.
 * Estrategia: de la más larga a la más corta (las largas tienen menos huecos válidos),
 * probando posiciones y direcciones al azar y permitiendo cruces por letra compartida.
 */
function generarSopa(palabras: string[], lado: number, nivel: Nivel, semilla: number): Sopa {
  const aleatorio = crearAleatorio(semilla);
  const cuadricula: string[][] = Array.from({ length: lado }, () => Array<string>(lado).fill(''));
  const colocadas: PalabraColocada[] = [];
  const descartadas: string[] = [];

  const ordenadas = [...palabras].sort((a, b) => b.length - a.length);

  for (const palabra of ordenadas) {
    if (palabra.length > lado) {
      descartadas.push(palabra);
      continue;
    }

    const direcciones = barajar([...DIRECCIONES[nivel]], aleatorio);
    let colocada = false;

    for (const [df, dc] of direcciones) {
      // Rango de orígenes válidos para que la palabra entre completa
      const filaMin = df < 0 ? palabra.length - 1 : 0;
      const filaMax = df > 0 ? lado - palabra.length : lado - 1;
      const colMin = dc < 0 ? palabra.length - 1 : 0;
      const colMax = dc > 0 ? lado - palabra.length : lado - 1;

      const origenes: Celda[] = [];
      for (let fila = filaMin; fila <= filaMax; fila++) {
        for (let col = colMin; col <= colMax; col++) {
          origenes.push({ fila, col });
        }
      }

      for (const origen of barajar(origenes, aleatorio)) {
        const celdas: Celda[] = [];
        let cabe = true;

        for (let i = 0; i < palabra.length; i++) {
          const fila = origen.fila + df * i;
          const col = origen.col + dc * i;
          const ocupada = cuadricula[fila][col];
          if (ocupada !== '' && ocupada !== palabra[i]) {
            cabe = false;
            break;
          }
          celdas.push({ fila, col });
        }

        if (cabe) {
          celdas.forEach((celda, i) => {
            cuadricula[celda.fila][celda.col] = palabra[i];
          });
          colocadas.push({ palabra, celdas });
          colocada = true;
          break;
        }
      }

      if (colocada) break;
    }

    if (!colocada) descartadas.push(palabra);
  }

  // Relleno de huecos con letras sueltas
  for (let fila = 0; fila < lado; fila++) {
    for (let col = 0; col < lado; col++) {
      if (cuadricula[fila][col] === '') {
        cuadricula[fila][col] = LETRAS_RELLENO[Math.floor(aleatorio() * LETRAS_RELLENO.length)];
      }
    }
  }

  return { cuadricula, colocadas, descartadas, semilla };
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorSopaLetrasPage() {
  const [titulo, setTitulo] = useState('Sopa de letras');
  const [entrada, setEntrada] = useState(LISTAS_TEMATICAS[0].palabras.join('\n'));
  const [lado, setLado] = useState(12);
  const [nivel, setNivel] = useState<Nivel>('medio');
  const [semillaManual, setSemillaManual] = useState('');
  const [sopa, setSopa] = useState<Sopa | null>(null);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [aviso, setAviso] = useState('');

  const palabrasNormalizadas = useCallback((): string[] => {
    const brutas = entrada.split(/[\n,;]+/);
    const limpias = brutas.map(normalizar).filter((p) => p.length >= 2);
    return Array.from(new Set(limpias));
  }, [entrada]);

  const generar = useCallback(() => {
    const palabras = palabrasNormalizadas();

    if (palabras.length === 0) {
      setAviso('Escribe al menos una palabra de dos letras o más.');
      setSopa(null);
      return;
    }

    const semillaBase = Number(semillaManual.replace(/\D/g, ''));
    const semilla = semillaBase > 0 ? semillaBase : Math.floor(Math.random() * 900000) + 100000;

    const resultado = generarSopa(palabras, lado, nivel, semilla);
    setSopa(resultado);
    setMostrarSolucion(false);

    if (resultado.descartadas.length > 0) {
      setAviso(
        `No han cabido ${resultado.descartadas.length} palabra(s): ${resultado.descartadas.join(', ')}. Prueba con una cuadrícula mayor o quita alguna palabra.`,
      );
    } else {
      setAviso('');
    }
  }, [palabrasNormalizadas, lado, nivel, semillaManual]);

  const cargarLista = (id: string) => {
    const lista = LISTAS_TEMATICAS.find((l) => l.id === id);
    if (!lista) return;
    setEntrada(lista.palabras.join('\n'));
    setTitulo(`Sopa de letras · ${lista.nombre}`);
    setSopa(null);
    setAviso('');
  };

  /** Celdas que forman parte de alguna palabra, para pintar la solución */
  const celdasSolucion = new Set<string>();
  if (sopa && mostrarSolucion) {
    sopa.colocadas.forEach((p) => p.celdas.forEach((c) => celdasSolucion.add(`${c.fila}-${c.col}`)));
  }

  const numPalabras = palabrasNormalizadas().length;

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🔡</span> Generador de Sopas de Letras
          </h1>
          <p className={styles.subtitle}>
            Tus palabras, tu cuadrícula. Genera la sopa (o pupiletras), imprímela y resuélvela en papel.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          {/* Panel de configuración */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Configura tu sopa
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de la hoja</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={60}
                placeholder="Sopa de letras"
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Listas rápidas</span>
              <div className={styles.chips}>
                {LISTAS_TEMATICAS.map((lista) => (
                  <button
                    key={lista.id}
                    type="button"
                    className={styles.chip}
                    onClick={() => cargarLista(lista.id)}
                  >
                    <span aria-hidden="true">{lista.icono}</span> {lista.nombre}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>
                Tus palabras <small>(una por línea · {numPalabras} válidas)</small>
              </span>
              <textarea
                className={styles.textarea}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                rows={9}
                placeholder={'ELEFANTE\nJIRAFA\nTORTUGA'}
              />
            </label>

            <div className={styles.filaCampos}>
              <label className={styles.campo}>
                <span className={styles.etiqueta}>Tamaño</span>
                <select
                  className={styles.select}
                  value={lado}
                  onChange={(e) => setLado(Number(e.target.value))}
                >
                  <option value={8}>8 × 8 · muy pequeña</option>
                  <option value={10}>10 × 10 · infantil</option>
                  <option value={12}>12 × 12 · estándar</option>
                  <option value={15}>15 × 15 · amplia</option>
                  <option value={18}>18 × 18 · grande</option>
                  <option value={20}>20 × 20 · muy grande</option>
                </select>
              </label>

              <label className={styles.campo}>
                <span className={styles.etiqueta}>Nº de sopa (opcional)</span>
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
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Nivel</span>
              <div className={styles.grupoBotones} role="group" aria-label="Nivel de dificultad">
                {(Object.keys(ETIQUETAS_NIVEL) as Nivel[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.btnOpcion} ${nivel === n ? styles.btnOpcionActivo : ''}`}
                    aria-pressed={nivel === n}
                    onClick={() => setNivel(n)}
                  >
                    {ETIQUETAS_NIVEL[n]}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className={styles.btnPrimary} onClick={generar}>
              <span aria-hidden="true">✨</span> Generar sopa de letras
            </button>

            {aviso && (
              <p className={styles.aviso} role="alert" aria-live="polite">
                {aviso}
              </p>
            )}
          </div>

          {/* Panel de acciones sobre el resultado */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🖨️</span> Imprimir y resolver
            </h2>

            {!sopa ? (
              <p className={styles.vacio}>
                Aún no hay ninguna sopa generada. Ajusta las palabras y pulsa <strong>Generar</strong>:
                la cuadrícula aparecerá justo debajo, lista para imprimir.
              </p>
            ) : (
              <>
                <p className={styles.resumen}>
                  <strong>{sopa.colocadas.length}</strong> palabras colocadas en una cuadrícula de{' '}
                  <strong>
                    {lado} × {lado}
                  </strong>
                  . Número de sopa: <strong>{sopa.semilla}</strong>.
                </p>
                <p className={styles.pista}>
                  Anota ese número: si lo vuelves a introducir con la misma lista y los mismos ajustes,
                  obtendrás exactamente la misma cuadrícula.
                </p>

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
                    <span aria-hidden="true">🔄</span> Otra distinta
                  </button>
                </div>

                <p className={styles.pista}>
                  Se imprime lo que ves: primero la sopa limpia para resolver y, si quieres corregir,
                  vuelve a imprimir con la solución activada. En el diálogo de impresión puedes elegir
                  «Guardar como PDF».
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {sopa && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <h2 className={styles.tituloHoja}>{titulo || 'Sopa de letras'}</h2>

          <table className={`${styles.cuadricula} ${impresion.rejilla}`}>
            <caption className={styles.srOnly}>
              Cuadrícula de {lado} por {lado} letras con {sopa.colocadas.length} palabras escondidas
            </caption>
            <tbody>
              {sopa.cuadricula.map((fila, f) => (
                <tr key={f}>
                  {fila.map((letra, c) => {
                    const marcada = celdasSolucion.has(`${f}-${c}`);
                    return (
                      <td key={c} className={marcada ? `${styles.celdaMarcada} ${impresion.relleno}` : styles.celda}>
                        {letra}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.listaPalabras}>
            <h3>Palabras a buscar</h3>
            <ul>
              {sopa.colocadas.map((p) => (
                <li key={p.palabra}>{p.palabra}</li>
              ))}
            </ul>
          </div>

          <p className={styles.pieHoja}>
            Sopa n.º {sopa.semilla} · {ETIQUETAS_NIVEL[nivel]} · meskeia.com
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Cómo sacarle partido a una sopa de letras"
          subtitle="Para qué sirve de verdad, cómo graduar la dificultad y errores que arruinan la hoja"
        >
          <section className={styles.guideSection}>
            <h2>Qué entrena una sopa de letras</h2>
            <p>
              Buscar palabras en una cuadrícula no es solo un pasatiempo: es una tarea de{' '}
              <strong>rastreo visual sistemático</strong>. Quien resuelve tiene que mantener en memoria
              la palabra objetivo mientras recorre la rejilla con un patrón ordenado, y descartar
              coincidencias parciales. Por eso se usa como actividad de refuerzo de vocabulario, de
              atención sostenida y, cuando las palabras las elige quien enseña, como repaso de un tema
              concreto: los huesos del cuerpo, los accidentes geográficos o el vocabulario de una unidad.
            </p>
            <p>
              La diferencia entre una sopa útil y una sopa de relleno está casi siempre en la lista de
              palabras. Una sopa con diez términos elegidos al azar entretiene diez minutos; una sopa con
              los diez términos que hay que memorizar esta semana hace el mismo trabajo y además repasa.
            </p>

            <h2>Cómo graduar la dificultad de verdad</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Palanca</th>
                    <th>Efecto sobre la dificultad</th>
                    <th>Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Direcciones</strong>
                    </td>
                    <td>Es la palanca más fuerte: pasar de 2 a 8 direcciones multiplica el rastreo</td>
                    <td>Fácil hasta los 7 años, medio de 8 a 11, difícil a partir de ahí</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Tamaño de cuadrícula</strong>
                    </td>
                    <td>Aumenta el tiempo, no la astucia necesaria</td>
                    <td>Subir el tamaño solo si las palabras no caben o quedan amontonadas</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Longitud de las palabras</strong>
                    </td>
                    <td>Las palabras largas son más fáciles de ver, no más difíciles</td>
                    <td>Mezclar longitudes: las de 4-5 letras son las que cuestan</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Palabras que comparten letras</strong>
                    </td>
                    <td>Los cruces generan falsos positivos y obligan a comprobar</td>
                    <td>Incluir términos de la misma familia (CANTAR, CANTANTE, CANTO)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Ocultar la lista</strong>
                    </td>
                    <td>Cambia el ejercicio: de rastreo a recuperación de memoria</td>
                    <td>Recortar la lista al imprimir para un repaso avanzado</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Tres formas de usarla</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🧑‍🏫
                  </span>
                  <h3>Repaso de vocabulario</h3>
                </div>
                <p>
                  Se introducen los términos de la unidad y se imprime una copia por persona. Con el
                  mismo número de sopa, todas las hojas son idénticas y se corrigen a la vez con la
                  versión de la solución proyectada o impresa.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎉
                  </span>
                  <h3>Actividad personalizada</h3>
                </div>
                <p>
                  Los nombres de los invitados de un cumpleaños, los apellidos de una familia o los
                  destinos de un viaje convierten la sopa en un recuerdo. Es el uso donde la
                  personalización marca la diferencia frente a un cuadernillo comprado.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🧠
                  </span>
                  <h3>Estimulación cognitiva</h3>
                </div>
                <p>
                  En talleres de memoria se prefieren cuadrículas de 10×10 con letra grande y solo dos
                  direcciones. El objetivo no es la dificultad, sino completar la tarea sin frustración:
                  una sopa demasiado difícil se abandona y deja de entrenar nada.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Qué pasa con las tildes y la ñ?
                </h4>
                <p>
                  Las tildes se eliminan automáticamente porque en una cuadrícula de letras sueltas no
                  aportan nada y complican la búsqueda: MONTAÑA se escribe MONTAÑA sin acento gráfico. La
                  ñ sí se conserva, porque es una letra distinta de la n y suprimirla cambiaría la
                  palabra. Los espacios y guiones también se eliminan, de modo que una expresión de dos
                  palabras aparece unida en la rejilla.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué no ha cabido alguna palabra?
                </h4>
                <p>
                  Hay dos motivos. El primero es evidente: la palabra tiene más letras que el lado de la
                  cuadrícula. El segundo es la saturación: cuando la rejilla ya está muy ocupada, las
                  últimas palabras no encuentran ninguna posición compatible. Se resuelve subiendo el
                  tamaño, reduciendo la lista o generando otra distinta, porque cada número de sopa
                  reparte las palabras de otra manera.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Cuántas palabras admite una cuadrícula?
                </h4>
                <p>
                  Una regla práctica: la suma de letras de todas las palabras no debería pasar de la
                  mitad de las casillas. En una rejilla de 12×12 hay 144 casillas, así que unas 70 letras
                  repartidas en 10 o 12 palabras dejan una densidad cómoda. Por encima de ese umbral la
                  sopa se llena de cruces, el relleno aleatorio casi desaparece y las palabras empiezan a
                  verse a simple vista.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Se puede imprimir en blanco y negro sin gastar tinta?
                </h4>
                <p>
                  Sí: la vista de impresión ya está preparada en negro sobre blanco, sin fondos de color
                  ni elementos de la web. Solo se imprime la hoja con el título, la cuadrícula y la lista
                  de palabras. En el diálogo de impresión del navegador se puede elegir «Guardar como PDF»
                  para conservarla o enviarla por mensaje.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores que arruinan una sopa de letras</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Meter solo palabras largas:</strong> parece más difícil y es justo lo contrario,
                  porque una palabra de diez letras se detecta de un vistazo. Mezcla longitudes e incluye
                  varias de cuatro o cinco letras.
                </li>
                <li>
                  <strong>Usar la cuadrícula máxima «por si acaso»:</strong> con pocas palabras en 20×20 la
                  hoja queda vacía de contenido y llena de relleno, y la letra sale minúscula al imprimir.
                </li>
                <li>
                  <strong>Olvidar anotar el número de sopa:</strong> sin él no hay forma de reimprimir la
                  misma hoja, y una copia perdida obliga a repartir una versión distinta a la del resto.
                </li>
                <li>
                  <strong>Incluir palabras que contienen a otras:</strong> si están MAR y MARIPOSA, quien
                  resuelve marcará MAR dentro de MARIPOSA y dará por buena una posición que no cuenta.
                </li>
                <li>
                  <strong>Imprimir con la solución activada sin darse cuenta:</strong> se imprime siempre lo
                  que hay en pantalla. Conviene revisar que el botón esté en «Ver solución» y no al revés.
                </li>
                <li>
                  <strong>Dar por hecho que todas las palabras entraron:</strong> si el aviso indica
                  descartes, esas palabras no están en la cuadrícula y quien resuelva las buscará en vano.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-sopa-letras')} />

        <ShareCard appName="generador-sopa-letras" />

        <Footer appName="generador-sopa-letras" />
      </div>
    </div>
  );
}
