'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorFichasCalculo.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

type Operacion = 'suma' | 'resta' | 'multiplicacion' | 'division';
type Presentacion = 'horizontal' | 'columna';

interface Cuenta {
  a: number;
  b: number;
  simbolo: string;
  resultado: number;
  resto: number | null;
}

interface Nivel {
  id: string;
  nombre: string;
  detalle: string;
  /** Máximo para sumas y restas */
  maxAditivo: number;
  /** Factores de la multiplicación */
  maxFactorA: number;
  maxFactorB: number;
  /** Divisor y cociente máximos */
  maxDivisor: number;
  maxCociente: number;
}

const NIVELES: Nivel[] = [
  {
    id: 'iniciacion',
    nombre: 'Iniciación',
    detalle: 'Números hasta 10 · tablas del 1 al 5',
    maxAditivo: 10,
    maxFactorA: 5,
    maxFactorB: 5,
    maxDivisor: 5,
    maxCociente: 5,
  },
  {
    id: 'basico',
    nombre: 'Básico',
    detalle: 'Hasta 20 · tablas completas',
    maxAditivo: 20,
    maxFactorA: 10,
    maxFactorB: 10,
    maxDivisor: 10,
    maxCociente: 10,
  },
  {
    id: 'intermedio',
    nombre: 'Intermedio',
    detalle: 'Hasta 100 · dos cifras por una',
    maxAditivo: 100,
    maxFactorA: 99,
    maxFactorB: 9,
    maxDivisor: 9,
    maxCociente: 99,
  },
  {
    id: 'avanzado',
    nombre: 'Avanzado',
    detalle: 'Hasta 1.000 · tres cifras por dos',
    maxAditivo: 1000,
    maxFactorA: 999,
    maxFactorB: 99,
    maxDivisor: 99,
    maxCociente: 99,
  },
  {
    id: 'experto',
    nombre: 'Experto',
    detalle: 'Hasta 10.000 · cuatro cifras por dos',
    maxAditivo: 10000,
    maxFactorA: 9999,
    maxFactorB: 99,
    maxDivisor: 99,
    maxCociente: 999,
  },
];

const ETIQUETAS_OPERACION: Record<Operacion, { nombre: string; simbolo: string }> = {
  suma: { nombre: 'Sumas', simbolo: '+' },
  resta: { nombre: 'Restas', simbolo: '−' },
  multiplicacion: { nombre: 'Multiplicaciones', simbolo: '×' },
  division: { nombre: 'Divisiones', simbolo: ':' },
};

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador con semilla: la misma ficha se puede reimprimir idéntica */
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

function entero(aleatorio: () => number, minimo: number, maximo: number): number {
  return minimo + Math.floor(aleatorio() * (maximo - minimo + 1));
}

/** Suma sin llevadas: cada columna de dígitos debe sumar 9 o menos */
function sumaSinLlevadas(aleatorio: () => number, maximo: number): Cuenta {
  const cifras = String(maximo).length - 1 || 1;
  let a = 0;
  let b = 0;
  let potencia = 1;

  for (let i = 0; i < cifras; i++) {
    const digitoA = entero(aleatorio, i === cifras - 1 ? 1 : 0, 8);
    const digitoB = entero(aleatorio, 1, 9 - digitoA);
    a += digitoA * potencia;
    b += digitoB * potencia;
    potencia *= 10;
  }

  return { a, b, simbolo: '+', resultado: a + b, resto: null };
}

/** Resta sin llevadas: cada dígito del minuendo es mayor o igual que el del sustraendo */
function restaSinLlevadas(aleatorio: () => number, maximo: number): Cuenta {
  const cifras = String(maximo).length - 1 || 1;
  let a = 0;
  let b = 0;
  let potencia = 1;

  for (let i = 0; i < cifras; i++) {
    const digitoA = entero(aleatorio, i === cifras - 1 ? 1 : 0, 9);
    const digitoB = entero(aleatorio, 0, digitoA);
    a += digitoA * potencia;
    b += digitoB * potencia;
    potencia *= 10;
  }

  return { a, b, simbolo: '−', resultado: a - b, resto: null };
}

function generarCuenta(
  operacion: Operacion,
  nivel: Nivel,
  conLlevadas: boolean,
  divisionConResto: boolean,
  aleatorio: () => number,
): Cuenta {
  switch (operacion) {
    case 'suma': {
      if (!conLlevadas) return sumaSinLlevadas(aleatorio, nivel.maxAditivo);
      const a = entero(aleatorio, 2, nivel.maxAditivo);
      const b = entero(aleatorio, 2, nivel.maxAditivo);
      return { a, b, simbolo: '+', resultado: a + b, resto: null };
    }
    case 'resta': {
      if (!conLlevadas) return restaSinLlevadas(aleatorio, nivel.maxAditivo);
      // El minuendo siempre es mayor: el resultado nunca es negativo
      const mayor = entero(aleatorio, 3, nivel.maxAditivo);
      const menor = entero(aleatorio, 1, mayor);
      return { a: mayor, b: menor, simbolo: '−', resultado: mayor - menor, resto: null };
    }
    case 'multiplicacion': {
      const a = entero(aleatorio, 2, nivel.maxFactorA);
      const b = entero(aleatorio, 2, nivel.maxFactorB);
      return { a, b, simbolo: '×', resultado: a * b, resto: null };
    }
    case 'division':
    default: {
      const divisor = entero(aleatorio, 2, nivel.maxDivisor);
      const cociente = entero(aleatorio, 2, nivel.maxCociente);
      const resto = divisionConResto ? entero(aleatorio, 0, divisor - 1) : 0;
      return {
        a: divisor * cociente + resto,
        b: divisor,
        simbolo: ':',
        resultado: cociente,
        resto: divisionConResto ? resto : null,
      };
    }
  }
}

function generarFicha(
  operaciones: Operacion[],
  nivel: Nivel,
  cantidad: number,
  conLlevadas: boolean,
  divisionConResto: boolean,
  semilla: number,
): Cuenta[] {
  const aleatorio = crearAleatorio(semilla);
  const cuentas: Cuenta[] = [];

  for (let i = 0; i < cantidad; i++) {
    // Las operaciones se alternan en orden para que la ficha quede repartida
    const operacion = operaciones[i % operaciones.length];
    cuentas.push(generarCuenta(operacion, nivel, conLlevadas, divisionConResto, aleatorio));
  }

  return cuentas;
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorFichasCalculoPage() {
  const [titulo, setTitulo] = useState('Ficha de cálculo');
  const [operaciones, setOperaciones] = useState<Operacion[]>(['suma', 'resta']);
  const [nivelId, setNivelId] = useState('basico');
  const [cantidad, setCantidad] = useState(24);
  const [conLlevadas, setConLlevadas] = useState(true);
  const [divisionConResto, setDivisionConResto] = useState(false);
  const [presentacion, setPresentacion] = useState<Presentacion>('columna');
  const [semillaManual, setSemillaManual] = useState('');
  const [ficha, setFicha] = useState<Cuenta[]>([]);
  const [semilla, setSemilla] = useState(0);
  const [mostrarSoluciones, setMostrarSoluciones] = useState(false);
  const [aviso, setAviso] = useState('');

  const nivel = NIVELES.find((n) => n.id === nivelId) ?? NIVELES[1];

  const alternarOperacion = (operacion: Operacion) => {
    setOperaciones((previas) =>
      previas.includes(operacion)
        ? previas.filter((o) => o !== operacion)
        : [...previas, operacion],
    );
  };

  const generar = useCallback(() => {
    if (operaciones.length === 0) {
      setAviso('Selecciona al menos un tipo de operación.');
      setFicha([]);
      return;
    }

    const base = Number(semillaManual.replace(/\D/g, ''));
    const nuevaSemilla = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;

    setFicha(generarFicha(operaciones, nivel, cantidad, conLlevadas, divisionConResto, nuevaSemilla));
    setSemilla(nuevaSemilla);
    setMostrarSoluciones(false);
    setAviso('');
  }, [operaciones, nivel, cantidad, conLlevadas, divisionConResto, semillaManual]);

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">➗</span> Generador de Fichas de Cálculo
          </h1>
          <p className={styles.subtitle}>
            Sumas, restas, multiplicaciones y divisiones a la medida del nivel, listas para imprimir y
            con su hoja de soluciones.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Configura la ficha
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de la ficha</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={50}
                placeholder="Ficha de cálculo"
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Operaciones</span>
              <div className={styles.chips} role="group" aria-label="Tipos de operación">
                {(Object.keys(ETIQUETAS_OPERACION) as Operacion[]).map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`${styles.chip} ${operaciones.includes(op) ? styles.chipActivo : ''}`}
                    aria-pressed={operaciones.includes(op)}
                    onClick={() => alternarOperacion(op)}
                  >
                    <span aria-hidden="true">{ETIQUETAS_OPERACION[op].simbolo}</span>{' '}
                    {ETIQUETAS_OPERACION[op].nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Nivel</span>
              <div className={styles.grupoBotones} role="group" aria-label="Nivel de dificultad">
                {NIVELES.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`${styles.btnOpcion} ${nivelId === n.id ? styles.btnOpcionActivo : ''}`}
                    aria-pressed={nivelId === n.id}
                    onClick={() => setNivelId(n.id)}
                  >
                    <strong>{n.nombre}</strong>
                    <small>{n.detalle}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Número de operaciones: {cantidad}</span>
              <input
                type="range"
                className={styles.rango}
                min={10}
                max={60}
                step={2}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Ajustes</span>
              <div className={styles.chips}>
                <button
                  type="button"
                  className={`${styles.chip} ${conLlevadas ? styles.chipActivo : ''}`}
                  aria-pressed={conLlevadas}
                  onClick={() => setConLlevadas(!conLlevadas)}
                >
                  Con llevadas
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${divisionConResto ? styles.chipActivo : ''}`}
                  aria-pressed={divisionConResto}
                  onClick={() => setDivisionConResto(!divisionConResto)}
                >
                  División con resto
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${presentacion === 'columna' ? styles.chipActivo : ''}`}
                  aria-pressed={presentacion === 'columna'}
                  onClick={() => setPresentacion(presentacion === 'columna' ? 'horizontal' : 'columna')}
                >
                  {presentacion === 'columna' ? 'En columna' : 'Horizontal'}
                </button>
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nº de ficha (opcional)</span>
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
              <span aria-hidden="true">✨</span> Generar ficha
            </button>

            {aviso && (
              <p className={styles.aviso} role="alert" aria-live="polite">
                {aviso}
              </p>
            )}
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🖨️</span> Imprimir y corregir
            </h2>

            {ficha.length === 0 ? (
              <p className={styles.vacio}>
                Elige las operaciones y el nivel y pulsa <strong>Generar</strong>. La ficha aparecerá
                debajo, lista para imprimir.
              </p>
            ) : (
              <>
                <p className={styles.resumen}>
                  <strong>{ficha.length}</strong> operaciones de nivel <strong>{nivel.nombre}</strong>.
                  Ficha n.º <strong>{semilla}</strong>.
                </p>
                <p className={styles.pista}>
                  Con ese número puedes reimprimir esta misma ficha tantas veces como quieras: es lo que
                  permite repartir una hoja idéntica a todo un grupo y corregir con una sola plantilla.
                </p>

                <div className={styles.acciones}>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    aria-pressed={mostrarSoluciones}
                    onClick={() => setMostrarSoluciones(!mostrarSoluciones)}
                  >
                    <span aria-hidden="true">{mostrarSoluciones ? '🙈' : '💡'}</span>{' '}
                    {mostrarSoluciones ? 'Ocultar soluciones' : 'Ver soluciones'}
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir esta vista
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={generar}>
                    <span aria-hidden="true">🔄</span> Otra distinta
                  </button>
                </div>

                <p className={styles.pista}>
                  Se imprime exactamente lo que ves: primero la ficha en blanco para resolver y luego,
                  activando las soluciones, la plantilla de corrección.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {ficha.length > 0 && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <div className={styles.cabeceraHoja}>
            <h2 className={styles.tituloHoja}>{titulo || 'Ficha de cálculo'}</h2>
            <div className={styles.datosAlumno}>
              <span>Nombre: ______________________</span>
              <span>Fecha: ____________</span>
            </div>
          </div>

          <ol className={presentacion === 'columna' ? styles.rejillaColumna : styles.rejillaHorizontal}>
            {ficha.map((cuenta, i) => (
              <li key={i} className={`${styles.cuenta} ${impresion.bloque}`}>
                <span className={styles.numeroCuenta}>{i + 1}.</span>

                {presentacion === 'columna' ? (
                  <div className={styles.operacionColumna}>
                    <span className={styles.operandoA}>{formatNumber(cuenta.a, 0)}</span>
                    <span className={styles.operandoB}>
                      <span className={styles.simbolo}>{cuenta.simbolo}</span>
                      {formatNumber(cuenta.b, 0)}
                    </span>
                    <span className={styles.lineaOperacion} />
                    <span className={mostrarSoluciones ? styles.solucion : styles.huecoSolucion}>
                      {mostrarSoluciones ? formatNumber(cuenta.resultado, 0) : ''}
                    </span>
                    {mostrarSoluciones && cuenta.resto !== null && (
                      <span className={styles.restoSolucion}>resto {cuenta.resto}</span>
                    )}
                  </div>
                ) : (
                  <div className={styles.operacionHorizontal}>
                    {formatNumber(cuenta.a, 0)} {cuenta.simbolo} {formatNumber(cuenta.b, 0)} ={' '}
                    <span className={mostrarSoluciones ? styles.solucion : styles.huecoLinea}>
                      {mostrarSoluciones
                        ? `${formatNumber(cuenta.resultado, 0)}${
                            cuenta.resto !== null ? ` (resto ${cuenta.resto})` : ''
                          }`
                        : '________'}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>

          <p className={styles.pieHoja}>
            Ficha n.º {semilla} · nivel {nivel.nombre} · {ficha.length} operaciones ·{' '}
            {mostrarSoluciones ? 'PLANTILLA DE CORRECCIÓN' : 'para resolver'} · meskeia.com
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Cómo diseñar una ficha de cálculo que sirva de algo"
          subtitle="Qué entrena cada formato, cuándo activar las llevadas y cuántas operaciones poner"
        >
          <section className={styles.guideSection}>
            <h2>Dos destrezas distintas que conviene no mezclar</h2>
            <p>
              Resolver <strong>47 + 25</strong> escrito en horizontal y resolverlo colocado en columna no
              ejercitan lo mismo. El formato horizontal empuja al cálculo mental: hay que descomponer,
              apoyarse en números redondos y sostener resultados parciales en la cabeza. La disposición en
              columna entrena el algoritmo escrito, que es otra habilidad: alinear unidades con unidades,
              operar de derecha a izquierda y gestionar el arrastre.
            </p>
            <p>
              Las dos son necesarias y conviene alternarlas. Una ficha íntegramente en columna produce
              alumnado muy competente colocando cuentas y bastante torpe estimando si un resultado es
              razonable; una ficha solo horizontal, lo contrario.
            </p>

            <h2>Qué cambia en cada nivel</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Sumas y restas</th>
                    <th>Multiplicación</th>
                    <th>División</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Iniciación</strong>
                    </td>
                    <td>Hasta 10</td>
                    <td>Tablas del 1 al 5</td>
                    <td>Divisor hasta 5</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Básico</strong>
                    </td>
                    <td>Hasta 20</td>
                    <td>Tablas completas</td>
                    <td>Divisor hasta 10</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Intermedio</strong>
                    </td>
                    <td>Hasta 100</td>
                    <td>Dos cifras por una</td>
                    <td>Dividendo de dos cifras</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Avanzado</strong>
                    </td>
                    <td>Hasta 1.000</td>
                    <td>Tres cifras por dos</td>
                    <td>Divisor de dos cifras</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Experto</strong>
                    </td>
                    <td>Hasta 10.000</td>
                    <td>Cuatro cifras por dos</td>
                    <td>Divisor de dos cifras y cociente largo</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              La edad a la que corresponde cada nivel varía mucho de un país y un currículo a otro, así
              que la referencia útil no es el curso escolar sino el desempeño: si se resuelve la ficha con
              soltura y menos de dos fallos, toca subir de nivel o activar las llevadas.
            </p>

            <h2>Tres formas de usar las fichas</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    ⏱️
                  </span>
                  <h3>Rutina diaria corta</h3>
                </div>
                <p>
                  Veinte operaciones al día durante dos semanas consolidan más que una hoja de sesenta el
                  domingo. La práctica repartida en sesiones cortas es la que automatiza el cálculo y
                  libera atención para los problemas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎯
                  </span>
                  <h3>Refuerzo puntual</h3>
                </div>
                <p>
                  Si el fallo está en las llevadas, se genera una ficha de restas con llevadas y nada más.
                  Aislar la dificultad concreta rinde mucho más que una hoja mixta donde el error se
                  diluye entre operaciones que ya se dominan.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    📋
                  </span>
                  <h3>Prueba de velocidad</h3>
                </div>
                <p>
                  Con la misma ficha repetida cada semana —mismo número de ficha— se puede cronometrar y
                  comparar. La mejora se ve en el tiempo, no en el número de aciertos, que suele llegar al
                  máximo enseguida.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Cuándo conviene activar las llevadas?
                </h4>
                <p>
                  Cuando la colocación ya no falla. Sin llevadas, el ejercicio se centra en alinear bien
                  las cifras y en las combinaciones básicas; con llevadas entra en juego el arrastre, que
                  es el punto donde aparecen la mayoría de los errores persistentes. Mezclar las dos cosas
                  desde el principio hace difícil saber si el fallo es de colocación o de arrastre.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué no salen restas con resultado negativo?
                </h4>
                <p>
                  Porque el generador coloca siempre el número mayor como minuendo. En la etapa en la que
                  se practica el algoritmo escrito, los negativos aún no están introducidos y una resta
                  imposible se interpreta como un error de la hoja, no como un reto. Para practicar
                  números enteros con signo hace falta otro tipo de ejercicio.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Qué pasa si marco varias operaciones a la vez?
                </h4>
                <p>
                  Se reparten alternándose por orden, de modo que la ficha queda equilibrada entre los
                  tipos elegidos y no se agrupan todas las divisiones al final. Mezclar operaciones tiene
                  una ventaja pedagógica: obliga a leer el signo antes de calcular, algo que se pierde
                  cuando toda la hoja es del mismo tipo y se entra en piloto automático.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Los separadores de miles no confunden?
                </h4>
                <p>
                  Los números se muestran con el formato del español, con punto para los millares: 1.234.
                  Es el mismo formato que aparece en los libros de texto y en la vida cotidiana, así que
                  leerlo forma parte del aprendizaje. En los niveles bajos no llega a aparecer, porque no
                  se superan las tres cifras.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores frecuentes al preparar fichas</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Fichas de sesenta operaciones como tarea diaria:</strong> los últimos fallos son
                  de cansancio y no informan de nada; para práctica cotidiana, veinte o treinta bastan.
                </li>
                <li>
                  <strong>Subir de nivel por edad y no por desempeño:</strong> el nivel adecuado es aquel en
                  el que se falla poco pero no cero; si no hay ningún error, el ejercicio ya no enseña.
                </li>
                <li>
                  <strong>Mezclarlo todo desde el primer día:</strong> cuando aparece un fallo persistente
                  conviene aislar la operación concreta en una ficha monográfica.
                </li>
                <li>
                  <strong>Imprimir sin desactivar las soluciones:</strong> se imprime lo que hay en pantalla,
                  así que hay que revisar el botón antes de enviar la hoja a la impresora.
                </li>
                <li>
                  <strong>No anotar el número de ficha:</strong> sin él no se puede reimprimir la misma hoja
                  ni comparar tiempos entre semanas, que es lo que da sentido a la prueba de velocidad.
                </li>
                <li>
                  <strong>Corregir solo el resultado final:</strong> en las cuentas en columna, el error suele
                  estar en una llevada concreta; marcar dónde falló enseña mucho más que un aspa.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-fichas-calculo')} />

        <ShareCard appName="generador-fichas-calculo" />

        <Footer appName="generador-fichas-calculo" />
      </div>
    </div>
  );
}
