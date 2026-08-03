'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './FormuladorCompuestosInorganicos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  analizarFormula,
  nombreAFormula,
  generarEjercicio,
  respuestaCorrecta,
  embellecer,
  ETIQUETA_NOMENCLATURA,
  EJEMPLOS_FORMULA,
  EJEMPLOS_NOMBRE,
} from './motor';
import type { Analisis, ErrorAnalisis, Ejercicio } from './motor';

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

type Modo = 'formula' | 'nombre' | 'practicar';

export default function FormuladorCompuestosInorganicos() {
  const [modo, setModo] = useState<Modo>('formula');
  const [entradaFormula, setEntradaFormula] = useState('Fe2O3');
  const [entradaNombre, setEntradaNombre] = useState('');

  const [ejercicio, setEjercicio] = useState<Ejercicio | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [veredicto, setVeredicto] = useState<'acierto' | 'fallo' | null>(null);
  const [racha, setRacha] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [aciertos, setAciertos] = useState(0);

  const resultadoFormula = useMemo(() => analizarFormula(entradaFormula), [entradaFormula]);

  const resultadoNombre = useMemo(() => {
    if (!entradaNombre.trim()) return null;
    const conversion = nombreAFormula(entradaNombre);
    if (!conversion.ok) return { ok: false as const, fallo: conversion.fallo };
    const analisis = analizarFormula(conversion.formula);
    if (!analisis.ok) return { ok: false as const, fallo: analisis.fallo };
    return { ok: true as const, analisis: analisis.analisis };
  }, [entradaNombre]);

  const nuevoEjercicio = useCallback(() => {
    for (let intento = 0; intento < 40; intento++) {
      const e = generarEjercicio();
      if (e) {
        setEjercicio(e);
        setRespuesta('');
        setVeredicto(null);
        return;
      }
    }
  }, []);

  const comprobar = useCallback(() => {
    if (!ejercicio || !respuesta.trim() || veredicto) return;
    const bien = respuestaCorrecta(respuesta, ejercicio);
    setVeredicto(bien ? 'acierto' : 'fallo');
    setIntentos((n) => n + 1);
    if (bien) {
      setAciertos((n) => n + 1);
      setRacha((n) => n + 1);
    } else {
      setRacha(0);
    }
  }, [ejercicio, respuesta, veredicto]);

  const renderAnalisis = (analisis: Analisis) => (
    <div className={styles.resultadoPanel}>
      <p className={styles.resultadoEtiqueta}>{analisis.familiaEtiqueta}</p>
      <p className={styles.formulaGrande}>{analisis.formulaBonita}</p>

      <div className={styles.nombresGrid}>
        <div className={styles.nombreCard}>
          <span className={styles.nombreLabel}>Sistemática</span>
          <span className={styles.nombreValor}>{analisis.sistematica ?? 'no se usa en esta familia'}</span>
        </div>
        <div className={styles.nombreCard}>
          <span className={styles.nombreLabel}>Stock</span>
          <span className={styles.nombreValor}>{analisis.stock ?? 'no se usa en esta familia'}</span>
        </div>
        <div className={styles.nombreCard}>
          <span className={styles.nombreLabel}>Tradicional</span>
          <span className={styles.nombreValor}>{analisis.tradicional ?? 'no se usa en esta familia'}</span>
        </div>
      </div>

      {analisis.notaTradicional && <p className={styles.notaNomenclatura}>{analisis.notaTradicional}</p>}

      <div className={styles.oxidacionesFila}>
        <span className={styles.oxidacionesLabel}>Números de oxidación:</span>
        {analisis.oxidaciones.map((ox) => (
          <span key={ox.simbolo} className={styles.oxidacionChip}>
            {ox.simbolo} <strong>{ox.valor > 0 ? `+${ox.valor}` : ox.valor}</strong>
          </span>
        ))}
      </div>

      <div className={styles.razonamiento}>
        <h3>Cómo se llega hasta ahí</h3>
        <ol className={styles.pasosLista}>
          {analisis.pasos.map((paso) => (
            <li key={paso}>{paso}</li>
          ))}
        </ol>
      </div>

      {analisis.avisos.length > 0 && (
        <div className={styles.avisoCaja} role="alert">
          <strong>Revisa la fórmula:</strong>
          <ul>
            {analisis.avisos.map((aviso) => (
              <li key={aviso}>{aviso}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderError = (fallo: ErrorAnalisis) => (
    <div className={styles.errorPanel} role="alert">
      <h2>No he podido analizarlo</h2>
      <p>{fallo.error}</p>
      {fallo.pista && <p className={styles.errorPista}>{fallo.pista}</p>}
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Formulación y nomenclatura inorgánica</h1>
        <p className={styles.subtitle}>
          Escribe una fórmula y obtén los tres nombres con los números de oxidación razonados. O al
          revés: escribe el nombre y comprueba qué fórmula sale. Con modo de práctica para
          entrenarlo.
        </p>
      </header>

      <LegalNotice />

      {/* ══════════ SELECTOR DE MODO ══════════ */}
      <div className={styles.modoTabs} role="tablist" aria-label="Modo de trabajo">
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'formula'}
          className={`${styles.modoTab} ${modo === 'formula' ? styles.modoTabActivo : ''}`}
          onClick={() => setModo('formula')}
        >
          <span aria-hidden="true">🧪</span> Fórmula → nombre
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'nombre'}
          className={`${styles.modoTab} ${modo === 'nombre' ? styles.modoTabActivo : ''}`}
          onClick={() => setModo('nombre')}
        >
          <span aria-hidden="true">🔤</span> Nombre → fórmula
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'practicar'}
          className={`${styles.modoTab} ${modo === 'practicar' ? styles.modoTabActivo : ''}`}
          onClick={() => {
            setModo('practicar');
            if (!ejercicio) nuevoEjercicio();
          }}
        >
          <span aria-hidden="true">🎯</span> Practicar
        </button>
      </div>

      {/* ══════════ MODO 1: FÓRMULA → NOMBRE ══════════ */}
      {modo === 'formula' && (
        <>
          <section className={styles.panel} aria-label="Introducir fórmula">
            <label className={styles.campoLabel} htmlFor="entrada-formula">
              Fórmula del compuesto
            </label>
            <input
              id="entrada-formula"
              type="text"
              className={styles.inputTexto}
              value={entradaFormula}
              onChange={(e) => setEntradaFormula(e.target.value)}
              placeholder="Fe2O3, Ca(OH)2, Al2(SO4)3…"
              autoComplete="off"
              spellCheck={false}
            />
            <p className={styles.notaCampo}>
              Los subíndices se escriben como números normales: <strong>Fe2O3</strong>. Los
              paréntesis funcionan igual que en el cuaderno: <strong>Ca(OH)2</strong>.
            </p>
          </section>

          {resultadoFormula.ok ? renderAnalisis(resultadoFormula.analisis) : renderError(resultadoFormula.fallo)}

          <section className={styles.ejemplosPanel} aria-label="Ejemplos de fórmulas">
            <h2 className={styles.panelTitulo}>Prueba con estos</h2>
            <div className={styles.ejemplosGrid}>
              {EJEMPLOS_FORMULA.map((ej) => (
                <button
                  key={ej.formula}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => setEntradaFormula(ej.formula)}
                >
                  {ej.etiqueta}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ══════════ MODO 2: NOMBRE → FÓRMULA ══════════ */}
      {modo === 'nombre' && (
        <>
          <section className={styles.panel} aria-label="Introducir nombre">
            <label className={styles.campoLabel} htmlFor="entrada-nombre">
              Nombre del compuesto
            </label>
            <input
              id="entrada-nombre"
              type="text"
              className={styles.inputTexto}
              value={entradaNombre}
              onChange={(e) => setEntradaNombre(e.target.value)}
              placeholder="óxido de hierro(III), sulfato de sodio, ácido nítrico…"
              autoComplete="off"
            />
            <p className={styles.notaCampo}>
              Valen las tres nomenclaturas y da igual si escribes las tildes. Cuando el metal tiene
              varias valencias hay que decir cuál es: con romanos o con el sufijo tradicional.
            </p>
          </section>

          {resultadoNombre === null ? (
            <div className={styles.esperandoPanel}>
              <p>Escribe un nombre arriba y aquí aparecerá su fórmula con el razonamiento completo.</p>
            </div>
          ) : resultadoNombre.ok ? (
            renderAnalisis(resultadoNombre.analisis)
          ) : (
            renderError(resultadoNombre.fallo)
          )}

          <section className={styles.ejemplosPanel} aria-label="Ejemplos de nombres">
            <h2 className={styles.panelTitulo}>Prueba con estos</h2>
            <div className={styles.ejemplosGrid}>
              {EJEMPLOS_NOMBRE.map((nombre) => (
                <button
                  key={nombre}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => setEntradaNombre(nombre)}
                >
                  {nombre}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ══════════ MODO 3: PRACTICAR ══════════ */}
      {modo === 'practicar' && (
        <section className={styles.panel} aria-label="Ejercicio de práctica">
          <div className={styles.marcadorFila}>
            <span className={styles.marcadorItem}>
              <span aria-hidden="true">🔥</span> Racha: <strong>{racha}</strong>
            </span>
            <span className={styles.marcadorItem}>
              Aciertos: <strong>{aciertos}</strong> de {intentos}
            </span>
            <button type="button" className={styles.btnSecundario} onClick={nuevoEjercicio}>
              <span aria-hidden="true">🔄</span> Otro ejercicio
            </button>
          </div>

          {ejercicio ? (
            <>
              <p className={styles.enunciado}>
                {ejercicio.tipo === 'nombrar' ? (
                  <>
                    Nombra <strong className={styles.enunciadoDestacado}>{embellecer(ejercicio.formula)}</strong> en
                    nomenclatura <strong>{ETIQUETA_NOMENCLATURA[ejercicio.nomenclatura]}</strong>.
                  </>
                ) : (
                  <>
                    Escribe la fórmula de{' '}
                    <strong className={styles.enunciadoDestacado}>{ejercicio.solucion}</strong>.
                  </>
                )}
              </p>

              <input
                type="text"
                className={styles.inputTexto}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (veredicto) nuevoEjercicio();
                    else comprobar();
                  }
                }}
                placeholder={ejercicio.tipo === 'nombrar' ? 'Escribe el nombre…' : 'Escribe la fórmula…'}
                autoComplete="off"
                spellCheck={false}
                aria-label="Tu respuesta"
              />

              <div className={styles.botoneraPractica}>
                <button
                  type="button"
                  className={styles.btnPrimario}
                  onClick={comprobar}
                  disabled={!respuesta.trim() || veredicto !== null}
                >
                  Comprobar
                </button>
                {veredicto && (
                  <button type="button" className={styles.btnPrimario} onClick={nuevoEjercicio}>
                    Siguiente <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>

              {veredicto === 'acierto' && (
                <p className={styles.veredictoOk} role="status">
                  <span aria-hidden="true">✅</span> Correcto.{' '}
                  {ejercicio.tipo === 'nombrar'
                    ? `${embellecer(ejercicio.formula)} es ${ejercicio.solucion}.`
                    : `${ejercicio.solucion} es ${embellecer(ejercicio.formula)}.`}
                </p>
              )}
              {veredicto === 'fallo' && (
                <p className={styles.veredictoMal} role="status">
                  <span aria-hidden="true">❌</span> No es esa. La respuesta correcta es{' '}
                  <strong>
                    {ejercicio.tipo === 'nombrar' ? ejercicio.solucion : embellecer(ejercicio.formula)}
                  </strong>
                  .
                </p>
              )}

              {veredicto && renderAnalisis(ejercicio.analisis)}
            </>
          ) : (
            <p className={styles.notaCampo}>Preparando el primer ejercicio…</p>
          )}
        </section>
      )}

      {/* ══════════ ALCANCE ══════════ */}
      <section className={styles.alcancePanel} aria-label="Alcance de la herramienta">
        <h2>Hasta dónde llega</h2>
        <div className={styles.alcanceGrid}>
          <div className={styles.alcanceColumna}>
            <h3>Familias cubiertas</h3>
            <ul>
              <li>Óxidos metálicos y de no metal</li>
              <li>Peróxidos</li>
              <li>Hidruros metálicos y de no metal</li>
              <li>Hidrácidos en disolución</li>
              <li>Hidróxidos</li>
              <li>Oxoácidos</li>
              <li>Sales binarias</li>
              <li>Oxosales neutras</li>
            </ul>
          </div>
          <div className={styles.alcanceColumna}>
            <h3>Fuera de alcance</h3>
            <ul>
              <li>Sales ácidas (NaHCO₃) y sales dobles</li>
              <li>Compuestos de coordinación</li>
              <li>Hidratos y aductos</li>
              <li>Química orgánica: para eso está el nombrador de compuestos orgánicos</li>
            </ul>
          </div>
          <div className={styles.alcanceColumna}>
            <h3>Sobre las valencias</h3>
            <ul>
              <li>Se usan los números de oxidación habituales en secundaria</li>
              <li>Algunas editoriales incluyen otros (cromo con 6, manganeso con 4, 6 y 7)</li>
              <li>Esos aparecen aquí en sus aniones: cromato, manganato, permanganato</li>
              <li>Si tu libro difiere en algún caso, manda tu libro</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════ BLOQUE EDUCATIVO ══════════ */}
      <EducationalSection
        icon="⚗️"
        title="Cómo se formula y se nombra en química inorgánica"
        subtitle="Las tres nomenclaturas, el número de oxidación y los errores que más se repiten"
      >
        <section className={styles.introSection}>
          <h2>Todo sale de un número</h2>
          <p>
            La formulación inorgánica parece un ejercicio de memoria y en buena parte no lo es. Casi
            todo se deduce de un único dato: el <strong>número de oxidación</strong> con el que actúa
            cada elemento. Sabiendo eso, y que un compuesto neutro tiene que sumar cero, la fórmula
            sale sola y el nombre también.
          </p>
          <p>
            Lo que sí hay que memorizar es corto: qué valencias tiene cada elemento y cómo se llaman
            los aniones. El resto es procedimiento. Por eso esta herramienta no se limita a devolver
            el nombre: enseña <strong>de dónde sale cada número</strong>, que es justo lo que un
            listado de compuestos ya resueltos no puede dar.
          </p>
          <p>
            Las tres nomenclaturas conviven porque resuelven el mismo problema por caminos distintos.
            La sistemática cuenta átomos, la de stock escribe la valencia y la tradicional la
            codifica en un sufijo. Reconocer las tres importa porque los libros de texto, los
            exámenes y las etiquetas de laboratorio no usan siempre la misma.
          </p>
        </section>

        <section className={styles.comparativaSection}>
          <h2>Las tres nomenclaturas, compuesto a compuesto</h2>
          <p className={styles.comparativaSubtitle}>
            El mismo compuesto tiene tres nombres válidos. La IUPAC recomienda los dos primeros, pero
            el tercero es el que verás en la mayoría de ácidos y sales.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Fórmula</th>
                  <th>Familia</th>
                  <th>Sistemática</th>
                  <th>Stock</th>
                  <th>Tradicional</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fe₂O₃</strong></td>
                  <td>Óxido metálico</td>
                  <td>trióxido de dihierro</td>
                  <td>óxido de hierro(III)</td>
                  <td>óxido férrico</td>
                </tr>
                <tr>
                  <td><strong>SO₃</strong></td>
                  <td>Óxido de no metal</td>
                  <td>trióxido de azufre</td>
                  <td>óxido de azufre(VI)</td>
                  <td>anhídrido sulfúrico</td>
                </tr>
                <tr>
                  <td><strong>Ca(OH)₂</strong></td>
                  <td>Hidróxido</td>
                  <td>dihidróxido de calcio</td>
                  <td>hidróxido de calcio</td>
                  <td>hidróxido cálcico</td>
                </tr>
                <tr>
                  <td><strong>HNO₃</strong></td>
                  <td>Oxoácido</td>
                  <td>no se usa</td>
                  <td>trioxonitrato(V) de hidrógeno</td>
                  <td>ácido nítrico</td>
                </tr>
                <tr>
                  <td><strong>FeCl₃</strong></td>
                  <td>Sal binaria</td>
                  <td>tricloruro de hierro</td>
                  <td>cloruro de hierro(III)</td>
                  <td>cloruro férrico</td>
                </tr>
                <tr>
                  <td><strong>CaCO₃</strong></td>
                  <td>Oxosal</td>
                  <td>trioxocarbonato(IV) de calcio</td>
                  <td>carbonato de calcio</td>
                  <td>carbonato cálcico</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.escenariosSection}>
          <h2>Para qué sirve según en qué punto estés</h2>
          <p className={styles.escenariosSubtitle}>
            La misma herramienta se usa de formas distintas según lo que necesites resolver.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📓</span>
                <h3>Corregir los deberes</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Has resuelto veinte compuestos y quieres saber cuáles fallaste sin esperar a la clase
                siguiente. Pega cada fórmula y compara.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> cuando falles, no mires solo el nombre correcto. Lee el
                razonamiento y localiza en qué paso concreto te desviaste; suele ser siempre el mismo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎯</span>
                <h3>Preparar un examen</h3>
              </div>
              <p className={styles.escenarioDesc}>
                El modo de práctica genera ejercicios sin repetir siempre los mismos veinte compuestos
                del libro, y alterna entre nombrar y formular.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> la racha informa más que el porcentaje. Diez seguidos
                significa que el procedimiento está automatizado; alternar aciertos y fallos
                significa que aún estás adivinando.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
                <h3>Entender un enunciado</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Un problema de estequiometría menciona «sulfato de hierro(III)» y necesitas la fórmula
                para ajustar la reacción o calcular la masa molar.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> el modo nombre → fórmula devuelve también los números de
                oxidación, que es justo lo que hace falta para ajustar una reacción redox.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <h3>Preparar una clase</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Necesitas ejemplos variados de una familia concreta con sus tres nombres ya resueltos
                y el razonamiento escrito.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Truco:</strong> los casos que mejor funcionan en clase son los que rompen la
                regla aparente: H₂O₂ frente a H₂O, o KMnO₄ frente a K₂MnO₄.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guiaSection}>
          <h2>Cómo nombrar cualquier compuesto en cinco pasos</h2>
          <p className={styles.guiaSubtitle}>
            El mismo orden sirve para todas las familias. Lo que cambia de un ejercicio a otro es
            cuál de los pasos te da problemas.
          </p>
          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Cuenta los elementos distintos</h3>
                <p>
                  Dos elementos es un compuesto binario: óxido, hidruro o sal binaria. Tres, con
                  hidrógeno delante, apunta a oxoácido; con un metal delante y oxígeno, a oxosal. El
                  grupo OH repetido delata un hidróxido.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Fija los números de oxidación que ya conoces</h3>
                <p>
                  El oxígeno actúa con −2 salvo en peróxidos, donde es −1. El hidrógeno con +1 frente
                  a no metales y con −1 frente a metales. Los alcalinos siempre +1 y los
                  alcalinotérreos siempre +2.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Despeja el que falta</h3>
                <p>
                  La suma de todos los números de oxidación por sus subíndices debe dar cero. En
                  Fe₂O₃: 2x + 3(−2) = 0, luego x = +3. Ese número es el que va en romanos en la
                  nomenclatura de stock.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Comprueba que esa valencia existe</h3>
                <p>
                  Si sale un número que ese elemento no tiene, hay algo mal: o la fórmula está mal
                  ajustada o es un peróxido disfrazado. Es la señal de alarma más útil de todo el
                  proceso.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Escribe el nombre en la nomenclatura que te pidan</h3>
                <p>
                  Sistemática: prefijos que cuentan átomos. Stock: la valencia en romanos, y solo si
                  el elemento tiene más de una. Tradicional: el sufijo que corresponda según cuántas
                  valencias tenga ese elemento.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cuándo se pone el número romano y cuándo no?</h3>
              <p className={styles.faqAnswer}>
                Solo cuando el elemento puede actuar con más de un número de oxidación. «Óxido de
                calcio» no lleva paréntesis porque el calcio siempre actúa con +2, y añadirlo se
                considera redundante. «Óxido de hierro» sí lo necesita, porque sin él no se sabe si
                es FeO o Fe₂O₃.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Valencia y número de oxidación son lo mismo?</h3>
              <p className={styles.faqAnswer}>
                En secundaria se usan casi como sinónimos, pero no lo son. La valencia es el número
                de enlaces que forma un átomo y siempre es positiva. El número de oxidación lleva
                signo e indica la carga que tendría el átomo si los enlaces fueran iónicos. Para
                formular, el que importa es el segundo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué H₂O₂ no es «óxido de hidrógeno(II)»?</h3>
              <p className={styles.faqAnswer}>
                Porque el hidrógeno no puede actuar con +2: solo tiene un electrón. Cuando al despejar
                sale un número imposible, la explicación suele ser que el oxígeno no está actuando
                con −2 sino con −1, formando el grupo peróxido O₂²⁻. Por eso H₂O₂ es peróxido de
                hidrógeno.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Se sigue usando la nomenclatura tradicional?</h3>
              <p className={styles.faqAnswer}>
                La IUPAC recomienda la sistemática y la de stock desde 2005, pero la tradicional sigue
                viva donde resulta más cómoda: prácticamente nadie dice «tetraoxosulfato(VI) de
                hidrógeno» en vez de «ácido sulfúrico». En la práctica hay que reconocer las tres, y
                los exámenes suelen pedir precisamente eso.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué mi libro da valencias distintas?</h3>
              <p className={styles.faqAnswer}>
                Porque las tablas de valencias de secundaria son una simplificación pedagógica, no una
                lista cerrada. El nitrógeno tiene números de oxidación de −3 a +5, pero muchas
                editoriales solo enseñan tres. Si tu libro incluye alguno que aquí no aparece, sigue
                tu libro: es el criterio con el que te van a corregir.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿En qué orden se escriben los elementos?</h3>
              <p className={styles.faqAnswer}>
                Primero el más electropositivo y después el más electronegativo, que es lo contrario
                del orden en que se leen los nombres. NaCl se escribe con el sodio delante pero se lee
                «cloruro de sodio». Esa inversión causa buena parte de los errores al pasar del nombre
                a la fórmula.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.tipsSection}>
          <h2>Cuatro atajos que ahorran tiempo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✖️</span>
              <h3>Cruza y simplifica</h3>
              <p>
                Para formular, cruza las valencias como subíndices y simplifica al final. Al³⁺ con
                O²⁻ da Al₂O₃; Ca²⁺ con O²⁻ da Ca₂O₂, que se simplifica a CaO.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <h3>De ácido a sal, cambia el sufijo</h3>
              <p>
                −oso pasa a −ito y −ico pasa a −ato. Sabiendo los cuatro ácidos del cloro tienes
                gratis los cuatro aniones: hipoclorito, clorito, clorato y perclorato.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧭</span>
              <h3>Cuenta valencias antes de elegir sufijo</h3>
              <p>
                Con dos valencias solo hay −oso e −ico. Con cuatro entran hipo− y per−. Elegir el
                sufijo sin contar cuántas valencias tiene el elemento es el error más común.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h3>Desconfía de los números raros</h3>
              <p>
                Si al despejar sale una valencia fraccionaria o que ese elemento no tiene, casi
                siempre es un peróxido o una fórmula mal copiada. Vuelve a los subíndices.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Los errores que más se repiten</h2>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir Co con CO.</strong> Con mayúscula y minúscula es cobalto; con dos
              mayúsculas es carbono con oxígeno. Lo mismo pasa con Ni (níquel) frente a NI, o con Cs
              (cesio) frente a CS.
            </li>
            <li>
              <strong>Poner el romano cuando no hace falta.</strong> «Hidróxido de sodio(I)» está mal:
              el sodio solo actúa con +1, así que el paréntesis sobra.
            </li>
            <li>
              <strong>Olvidar simplificar los subíndices.</strong> Ca²⁺ con S²⁻ no da Ca₂S₂ sino CaS.
              Cruzar valencias es solo el primer paso; falta dividir por el máximo común divisor.
            </li>
            <li>
              <strong>Inventar sufijos para elementos de una sola valencia.</strong> Cuando el
              elemento tiene una única valencia, la forma con preposición («óxido de calcio») es tan
              válida como el adjetivo y evita el problema.
            </li>
            <li>
              <strong>Perder los paréntesis en los grupos repetidos.</strong> Fe(OH)₃ lleva tres
              grupos hidroxilo; escribir FeOH₃ significa otra cosa distinta y no cuadra.
            </li>
            <li>
              <strong>Tratar el anhídrido como una familia aparte.</strong> Un anhídrido es un óxido
              de no metal, no otra cosa: SO₃ es a la vez trióxido de azufre y anhídrido sulfúrico.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('formulador-compuestos-inorganicos')} />

      <ShareCard appName="formulador-compuestos-inorganicos" />

      <Footer appName="formulador-compuestos-inorganicos" />
    </div>
  );
}
