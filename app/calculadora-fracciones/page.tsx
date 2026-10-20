'use client';
// @disclaimer: exempt

/**
 * Calculadora de Fracciones — vista. Aquí no se calcula NADA: toda la aritmética vive en
 * `@/lib/calculadoras/fracciones` (probado en tests/fracciones-motor.spec.ts) y los casos de aula en `./casos.ts`.
 */

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './CalculadoraFracciones.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { PREGUNTAS_FRECUENTES } from './metadata';
import CasosAula from './CasosAula';
import {
  aMixto,
  comparar,
  desarrolloDecimal,
  equivalentes,
  evaluarExpresion,
  explicarSimplificacion,
  leerFraccion,
  normalizar,
  simplificar,
  textoEntero,
  textoFraccion,
  textoMixto,
  MAX_LONGITUD,
  MENOS,
  type Fraccion,
  type Simplificacion,
} from '@/lib/calculadoras/fracciones';

type Pestana = 'operar' | 'simplificar' | 'equivalentes';

const PESTANAS: { id: Pestana; nombre: string }[] = [
  { id: 'operar', nombre: 'Operar' },
  { id: 'simplificar', nombre: 'Simplificar' },
  { id: 'equivalentes', nombre: 'Equivalentes y comparar' },
];

const EJEMPLOS = ['2/3 + 1/4', '1/3 + 2/5 × 5/6', '(3/4 − 1/2) ÷ 5/8', '(2/3)^2 − 1/9', '4 ÷ 2/3', '0,25 + 1/3'];

/** Teclas para escribir en el móvil lo que el teclado esconde. Insertan en la posición del cursor. */
const TECLAS: { texto: string; inserta: string; etiqueta: string }[] = [
  { texto: '/', inserta: '/', etiqueta: 'Insertar barra de fracción' },
  { texto: '+', inserta: ' + ', etiqueta: 'Insertar suma' },
  { texto: MENOS, inserta: ' − ', etiqueta: 'Insertar resta' },
  { texto: '×', inserta: ' × ', etiqueta: 'Insertar multiplicación' },
  { texto: '÷', inserta: ' ÷ ', etiqueta: 'Insertar división' },
  { texto: '(', inserta: '(', etiqueta: 'Abrir paréntesis' },
  { texto: ')', inserta: ')', etiqueta: 'Cerrar paréntesis' },
  { texto: 'xⁿ', inserta: '^', etiqueta: 'Insertar potencia' },
];

/* ─────────────────────────── Piezas de presentación ─────────────────────────── */

/** Fracción apilada: numerador sobre la raya y denominador debajo. */
function FraccionApilada({ f, grande = false }: { f: Fraccion; grande?: boolean }) {
  const n = normalizar(f);
  const clase = grande ? styles.apiladaGrande : styles.apilada;
  if (n.den === 1) {
    return <span className={`${clase} ${styles.apiladaEntera}`}>{textoEntero(n.num)}</span>;
  }
  return (
    <span className={clase} role="img" aria-label={`${textoEntero(n.num)} entre ${textoEntero(n.den)}`}>
      {n.num < 0 && <span className={styles.apiladaSigno}>{MENOS}</span>}
      <span className={styles.apiladaPila} aria-hidden="true">
        <span className={styles.apiladaNum}>{textoEntero(Math.abs(n.num))}</span>
        <span className={styles.apiladaDen}>{textoEntero(n.den)}</span>
      </span>
    </span>
  );
}

/** El decimal con el período subrayado por arriba, como se escribe a mano. */
function Decimal({ f }: { f: Fraccion }) {
  const d = desarrolloDecimal(f);
  const signo = d.negativo ? MENOS : '';
  if (!d.anteperiodo && !d.periodo) return <span>{signo + d.entera}</span>;
  const leido = d.periodo
    ? `${signo}${d.entera},${d.anteperiodo} con período ${d.periodo}`
    : `${signo}${d.entera},${d.anteperiodo}`;
  return (
    <span aria-label={leido}>
      <span aria-hidden="true">
        {signo}
        {d.entera},{d.anteperiodo}
        {d.periodo && <span className={styles.periodo}>{d.periodo}</span>}
        {d.truncado && <span>…</span>}
      </span>
    </span>
  );
}

/** Tope del dibujo de barras: más de 24 partes o de 4 unidades ya no se lee. */
const MAX_PARTES_DIBUJO = 24;
const MAX_UNIDADES_DIBUJO = 4;

/** Barras con la fracción coloreada: una barra por unidad entera (7/4 → dos barras). */
function BarrasFraccion({ f }: { f: Fraccion }) {
  const s = simplificar(f);
  const a = Math.abs(s.num);
  const unidades = Math.ceil(a / s.den);
  if (s.num === 0 || s.den > MAX_PARTES_DIBUJO || unidades > MAX_UNIDADES_DIBUJO) return null;
  const barras = Array.from({ length: unidades }, (_, u) => Math.min(s.den, a - u * s.den));
  return (
    <div className={styles.barras}>
      <div
        className={styles.barrasDibujo}
        role="img"
        aria-label={`Representación: ${textoEntero(a)} partes coloreadas de ${textoEntero(s.den)} en cada unidad${s.num < 0 ? ', en negativo' : ''}.`}
      >
        {barras.map((llenas, i) => (
          <div key={i} className={styles.barra} style={{ gridTemplateColumns: `repeat(${s.den}, 1fr)` }}>
            {Array.from({ length: s.den }, (_, j) => (
              <span key={j} className={j < llenas ? styles.celdaLlena : styles.celda} />
            ))}
          </div>
        ))}
      </div>
      {s.num < 0 && <p className={styles.barrasNota}>El valor es negativo: el dibujo muestra su valor absoluto.</p>}
    </div>
  );
}

/** Irreducible, mixto, decimal y barras de un valor. */
function DatosValor({ f }: { f: Fraccion }) {
  const s = simplificar(f);
  const m = aMixto(s);
  const hayMixto = m.entero !== 0 && m.parte.num !== 0;
  return (
    <>
      <div className={styles.resultadoPrincipal}>
        <FraccionApilada f={s} grande />
      </div>
      <dl className={styles.datos}>
        <div className={styles.dato}>
          <dt>Fracción irreducible</dt>
          <dd>{textoFraccion(s)}</dd>
        </div>
        {hayMixto && (
          <div className={styles.dato}>
            <dt>Número mixto</dt>
            <dd>{textoMixto(m)}</dd>
          </div>
        )}
        <div className={styles.dato}>
          <dt>Decimal</dt>
          <dd>
            <Decimal f={s} />
          </dd>
        </div>
      </dl>
      <BarrasFraccion f={s} />
    </>
  );
}

/* ─────────────────────────────── Página ─────────────────────────────── */

export default function CalculadoraFraccionesPage() {
  const [pestana, setPestana] = useState<Pestana>('operar');

  // Operar
  const [expresion, setExpresion] = useState('2/3 + 1/4 × (5/6 − 1/2)');
  const entradaRef = useRef<HTMLInputElement>(null);
  const resultado = useMemo(() => evaluarExpresion(expresion), [expresion]);

  // Simplificar
  const [numerador, setNumerador] = useState('84');
  const [denominador, setDenominador] = useState('126');
  const simplificacion = useMemo<{ error: string } | { s: Simplificacion }>(() => {
    const n = leerFraccion(numerador);
    const d = leerFraccion(denominador);
    if (!numerador.trim() || !denominador.trim()) return { error: 'Escribe el numerador y el denominador.' };
    if (!n.ok || n.forma !== 'entero') return { error: 'El numerador tiene que ser un número entero.' };
    if (!d.ok || d.forma !== 'entero') return { error: 'El denominador tiene que ser un número entero.' };
    if (d.valor.num === 0) return { error: 'El denominador no puede ser 0.' };
    return { s: explicarSimplificacion({ num: n.valor.num, den: d.valor.num }) };
  }, [numerador, denominador]);

  // Equivalentes y comparar
  const [textoA, setTextoA] = useState('2/3');
  const [textoB, setTextoB] = useState('8/12');
  const lecturaA = useMemo(() => leerFraccion(textoA), [textoA]);
  const lecturaB = useMemo(() => leerFraccion(textoB), [textoB]);

  // El cursor tras un botón de símbolo se coloca justo después de pintar el valor nuevo, en el
  // mismo evento del clic. Con requestAnimationFrame llegaba un fotograma tarde: lo que se
  // tecleaba en ese intervalo quedaba detrás del cursor, que volvía atrás (cabo C0336).
  const cursorPendiente = useRef<number | null>(null);
  useLayoutEffect(() => {
    const cursor = cursorPendiente.current;
    if (cursor === null) return;
    cursorPendiente.current = null;
    const el = entradaRef.current;
    el?.focus();
    el?.setSelectionRange(cursor, cursor);
  }, [expresion]);

  function insertar(texto: string) {
    const el = entradaRef.current;
    const inicio = el?.selectionStart ?? expresion.length;
    const fin = el?.selectionEnd ?? expresion.length;
    const nuevo = (expresion.slice(0, inicio) + texto + expresion.slice(fin)).slice(0, MAX_LONGITUD);
    const cursor = Math.min(inicio + texto.length, nuevo.length);
    if (nuevo === expresion) {
      // Sin cambio de valor (tope de longitud) no hay render que aplique el cursor.
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
      return;
    }
    cursorPendiente.current = cursor;
    setExpresion(nuevo);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">➗</span> Calculadora de Fracciones
        </h1>
        <p className={styles.subtitle}>
          Suma, resta, multiplica, divide y eleva fracciones con el procedimiento completo, como en el cuaderno:
          m.c.m., jerarquía de operaciones, paréntesis y simplificación.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.pestanas} role="tablist" aria-label="Qué quieres hacer">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={pestana === p.id}
            aria-controls={`panel-${p.id}`}
            className={`${styles.pestana} ${pestana === p.id ? styles.pestanaActiva : ''}`}
            onClick={() => setPestana(p.id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {pestana === 'operar' && (
        <section className={styles.panel} role="tabpanel" id="panel-operar" aria-labelledby="tab-operar">
          <label className={styles.label} htmlFor="fr-expresion">
            Escribe la operación
          </label>
          <input
            ref={entradaRef}
            id="fr-expresion"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_LONGITUD}
            className={styles.entradaExpresion}
            value={expresion}
            onChange={(e) => setExpresion(e.target.value)}
            placeholder="Por ejemplo: 1/3 + 2/5 × 5/6"
            aria-describedby="fr-ayuda"
          />
          <p className={styles.ayuda} id="fr-ayuda">
            La barra / escribe una fracción (3/4). Operaciones: + − × ÷ (también * y :), potencias con ^ y paréntesis.
            Admite enteros y decimales; un número mixto se escribe como suma (1 + 1/2).
          </p>
          <div className={styles.teclas} role="group" aria-label="Insertar símbolos">
            {TECLAS.map((t) => (
              <button key={t.etiqueta} type="button" className={styles.tecla} aria-label={t.etiqueta} onClick={() => insertar(t.inserta)}>
                {t.texto}
              </button>
            ))}
            <button type="button" className={`${styles.tecla} ${styles.teclaBorrar}`} onClick={() => setExpresion('')}>
              Borrar
            </button>
          </div>
          <div className={styles.ejemplos}>
            <span className={styles.ejemplosTitulo}>Ejemplos:</span>
            {EJEMPLOS.map((e) => (
              <button key={e} type="button" className={styles.ejemplo} onClick={() => setExpresion(e)}>
                {e}
              </button>
            ))}
          </div>

          {!resultado.ok && expresion.trim() !== '' && (
            <p className={styles.error} role="alert" aria-live="polite">
              {resultado.error}
            </p>
          )}

          {resultado.ok && (
            <div className={styles.resultado} aria-live="polite">
              <h2 className={styles.resultadoTitulo}>Resultado</h2>
              <p className={styles.operacionLeida}>
                <span className={styles.operacionEtiqueta}>Operación:</span> <span>{resultado.inicial}</span>
              </p>
              <DatosValor f={resultado.valor} />

              <h3 className={styles.pasosTitulo}>Paso a paso</h3>
              {resultado.pasos.length === 0 ? (
                <p className={styles.sinPasos}>No hay ninguna operación que hacer: el número ya es irreducible.</p>
              ) : (
                <ol className={styles.pasos}>
                  {resultado.pasos.map((p, i) => (
                    <li key={i} className={styles.paso}>
                      {p.explicacion.map((linea, j) => (
                        <p key={j} className={styles.pasoExplicacion}>
                          {linea}
                        </p>
                      ))}
                      <p className={styles.pasoExpresion}>= {p.expresion}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </section>
      )}

      {pestana === 'simplificar' && (
        <section className={styles.panel} role="tabpanel" id="panel-simplificar" aria-labelledby="tab-simplificar">
          <p className={styles.ayuda}>Escribe la fracción y se simplifica hasta la irreducible, con el m.c.d. por factores primos.</p>
          <div className={styles.fraccionEntrada}>
            <label className={styles.srOnly} htmlFor="fr-numerador">
              Numerador
            </label>
            <input
              id="fr-numerador"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={styles.campoFraccion}
              value={numerador}
              onChange={(e) => setNumerador(e.target.value)}
            />
            <span className={styles.rayaEntrada} aria-hidden="true" />
            <label className={styles.srOnly} htmlFor="fr-denominador">
              Denominador
            </label>
            <input
              id="fr-denominador"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={styles.campoFraccion}
              value={denominador}
              onChange={(e) => setDenominador(e.target.value)}
            />
          </div>

          {'error' in simplificacion && (
            <p className={styles.error} role="alert" aria-live="polite">
              {simplificacion.error}
            </p>
          )}

          {'s' in simplificacion && (
            <div className={styles.resultado} aria-live="polite">
              <h2 className={styles.resultadoTitulo}>Resultado</h2>
              <DatosValor f={simplificacion.s.resultado} />
              <h3 className={styles.pasosTitulo}>Cómo se simplifica</h3>
              <ol className={styles.pasos}>
                {simplificacion.s.lineas.map((l, i) => (
                  <li key={i} className={styles.paso}>
                    <p className={styles.pasoExplicacion}>{l}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {pestana === 'equivalentes' && (
        <section className={styles.panel} role="tabpanel" id="panel-equivalentes" aria-labelledby="tab-equivalentes">
          <div className={styles.dosCampos}>
            <div>
              <label className={styles.label} htmlFor="fr-a">
                Fracción A
              </label>
              <input
                id="fr-a"
                type="text"
                inputMode="text"
                autoComplete="off"
                className={styles.entradaCorta}
                value={textoA}
                onChange={(e) => setTextoA(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="fr-b">
                Fracción B
              </label>
              <input
                id="fr-b"
                type="text"
                inputMode="text"
                autoComplete="off"
                className={styles.entradaCorta}
                value={textoB}
                onChange={(e) => setTextoB(e.target.value)}
              />
            </div>
          </div>
          <p className={styles.ayuda}>Escribe cada una como 3/4, −2/5, un entero o un número mixto (1 1/2).</p>

          {!lecturaA.ok && (
            <p className={styles.error} role="alert" aria-live="polite">
              No reconozco la fracción A. Escríbela como numerador/denominador, por ejemplo 2/3.
            </p>
          )}

          {lecturaA.ok && (
            <div className={styles.resultado}>
              <h2 className={styles.resultadoTitulo}>Equivalentes a {textoFraccion(lecturaA.valor)}</h2>
              <p className={styles.pasoExplicacion}>
                Se obtienen multiplicando el numerador y el denominador por el mismo número. Todas valen lo mismo que la
                irreducible, {textoFraccion(simplificar(lecturaA.valor))}.
              </p>
              <ul className={styles.equivalentes}>
                <li className={styles.equivalente}>{textoFraccion(simplificar(lecturaA.valor))}</li>
                {equivalentes(lecturaA.valor).map((g) => (
                  <li key={g.den} className={styles.equivalente}>
                    {textoFraccion(g)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lecturaA.ok && !lecturaB.ok && textoB.trim() !== '' && (
            <p className={styles.error} role="alert" aria-live="polite">
              No reconozco la fracción B. Escríbela como numerador/denominador, por ejemplo 8/12.
            </p>
          )}

          {lecturaA.ok && lecturaB.ok && (
            <div className={styles.resultado} aria-live="polite">
              <h2 className={styles.resultadoTitulo}>Comparar A y B</h2>
              <ol className={styles.pasos}>
                {comparar(lecturaA.valor, lecturaB.valor).lineas.map((l, i) => (
                  <li key={i} className={styles.paso}>
                    <p className={styles.pasoExplicacion}>{l}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      <CasosAula />

      <EducationalSection
        icon="📚"
        title="Aprende a operar con fracciones"
        subtitle="Reglas, errores típicos y preguntas frecuentes"
      >
        <section className={styles.guideSection}>
          <h2>Las cuatro operaciones, de un vistazo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Operación</th>
                  <th scope="col">Regla</th>
                  <th scope="col">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Suma y resta</td>
                  <td>Mismo denominador (el m.c.m.) y se operan los numeradores</td>
                  <td>2/3 + 1/4 = 8/12 + 3/12 = 11/12</td>
                </tr>
                <tr>
                  <td>Multiplicación</td>
                  <td>Numerador por numerador y denominador por denominador</td>
                  <td>4/9 × 3/8 = 12/72 = 1/6</td>
                </tr>
                <tr>
                  <td>División</td>
                  <td>Se multiplica por la inversa de la segunda</td>
                  <td>6/7 ÷ 3/14 = 6/7 × 14/3 = 4</td>
                </tr>
                <tr>
                  <td>Potencia</td>
                  <td>Se elevan numerador y denominador; exponente negativo invierte</td>
                  <td>(2/3)² = 4/9 · (2/3)⁻² = 9/4</td>
                </tr>
                <tr>
                  <td>Simplificar</td>
                  <td>Dividir arriba y abajo entre el m.c.d.</td>
                  <td>84/126 = 2/3 (m.c.d. 42)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Para quién es</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3>Estudiantes de primaria y secundaria</h3>
              <p>Comprobar los ejercicios de la tarea y ver en qué paso se equivocaron, no solo el resultado.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Madres, padres y tutores</h3>
              <p>Repasar cómo se hace hoy en clase (m.c.m., jerarquía) antes de ayudar con los deberes.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Docentes</h3>
              <p>Asignar los casos numerados y corregir sin ambigüedad: siempre son los mismos y en el mismo orden.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Cocina, bricolaje y medidas</h3>
              <p>Sumar 3/4 de taza y 2/3 de taza, o repartir una tabla de 5/2 m en trozos de 5/12 m.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo resolver una operación combinada, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Paréntesis primero</h3>
                <p>Resuelve lo de dentro de cada paréntesis, empezando por el más interior.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Potencias</h3>
                <p>Eleva numerador y denominador. Si el exponente es negativo, invierte antes la fracción.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Multiplicaciones y divisiones</h3>
                <p>De izquierda a derecha. Para dividir, multiplica por la inversa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Sumas y restas</h3>
                <p>De izquierda a derecha, pasando antes cada fracción al denominador común (el m.c.m.).</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Simplifica</h3>
                <p>Divide numerador y denominador entre su m.c.d. hasta llegar a la fracción irreducible.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <p>Usa el m.c.m. y no el producto de los denominadores: los números son más pequeños y hay menos que simplificar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <p>Al multiplicar, simplifica en cruz antes de operar: 4/9 × 3/8 se reduce dividiendo 4 y 8 entre 4, y 3 y 9 entre 3.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <p>Simplifica cada resultado intermedio: evita arrastrar números grandes hasta el final.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <p>Comprueba el orden de magnitud: si sumas dos fracciones menores que 1/2, el resultado no puede pasar de 1.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores más frecuentes</h2>
            </div>
            <ul className={styles.warningList}>
              <li>Sumar numeradores con numeradores y denominadores con denominadores: 1/2 + 1/3 no es 2/5, es 5/6.</li>
              <li>Invertir la primera fracción al dividir en vez de la segunda.</li>
              <li>Saltarse la jerarquía: en 1/3 + 2/5 × 5/6 la multiplicación va antes que la suma.</li>
              <li>Olvidar que un menos delante de un paréntesis cambia el signo de todo lo de dentro.</li>
              <li>Simplificar sumandos en vez de factores: en (2 + 4)/4 no se puede tachar el 4 de arriba con el de abajo.</li>
              <li>Escribir 2/3^2 esperando (2/3)²: sin paréntesis solo se eleva el denominador.</li>
            </ul>
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
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="calculadora-fracciones" />
      <Footer appName="calculadora-fracciones" />
    </div>
  );
}
