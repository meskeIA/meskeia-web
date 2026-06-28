'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SimuladorEstequiometria.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
interface Reactivo {
  nombre: string;
  formula: string;
  masaMolar: number; // g/mol
  coeficiente: number;
}

interface Producto {
  nombre: string;
  formula: string;
  masaMolar: number;
  coeficiente: number;
}

interface Reaccion {
  id: string;
  nombre: string;
  tipo: string;
  ecuacion: string;
  reactivos: [Reactivo, Reactivo];
  productos: Producto[];
  contexto: string;
}

interface ResultadoCalculo {
  limitante: string;
  molesA: number;
  molesB: number | null;
  molesProductoTeorico: number;
  masaProductoTeorica: number;
  masaProductoReal: number;
  exceso: string | null;
  molesExceso: number | null;
  gramosExceso: number | null;
}

// ============================================
// DATOS
// ============================================
const REACCIONES: Reaccion[] = [
  {
    id: 'combustion-metano',
    nombre: 'Combustión del metano',
    tipo: 'Combustión',
    ecuacion: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O',
    reactivos: [
      { nombre: 'Metano', formula: 'CH₄', masaMolar: 16.04, coeficiente: 1 },
      { nombre: 'Oxígeno', formula: 'O₂', masaMolar: 32.00, coeficiente: 2 },
    ],
    productos: [
      { nombre: 'Dióxido de carbono', formula: 'CO₂', masaMolar: 44.01, coeficiente: 1 },
      { nombre: 'Agua', formula: 'H₂O', masaMolar: 18.02, coeficiente: 2 },
    ],
    contexto: 'Gas natural ardiendo en una cocina o caldera',
  },
  {
    id: 'sintesis-agua',
    nombre: 'Síntesis del agua',
    tipo: 'Síntesis',
    ecuacion: '2 H₂ + O₂ → 2 H₂O',
    reactivos: [
      { nombre: 'Hidrógeno', formula: 'H₂', masaMolar: 2.016, coeficiente: 2 },
      { nombre: 'Oxígeno', formula: 'O₂', masaMolar: 32.00, coeficiente: 1 },
    ],
    productos: [
      { nombre: 'Agua', formula: 'H₂O', masaMolar: 18.02, coeficiente: 2 },
    ],
    contexto: 'Reacción en pila de hidrógeno para coches eléctricos',
  },
  {
    id: 'neutralizacion',
    nombre: 'Neutralización ácido-base',
    tipo: 'Neutralización',
    ecuacion: 'HCl + NaOH → NaCl + H₂O',
    reactivos: [
      { nombre: 'Ácido clorhídrico', formula: 'HCl', masaMolar: 36.46, coeficiente: 1 },
      { nombre: 'Hidróxido de sodio', formula: 'NaOH', masaMolar: 40.00, coeficiente: 1 },
    ],
    productos: [
      { nombre: 'Cloruro de sodio', formula: 'NaCl', masaMolar: 58.44, coeficiente: 1 },
      { nombre: 'Agua', formula: 'H₂O', masaMolar: 18.02, coeficiente: 1 },
    ],
    contexto: 'Neutralización en laboratorio o industria química',
  },
  {
    id: 'haber-bosch',
    nombre: 'Síntesis de amoniaco (Haber-Bosch)',
    tipo: 'Síntesis industrial',
    ecuacion: 'N₂ + 3 H₂ → 2 NH₃',
    reactivos: [
      { nombre: 'Nitrógeno', formula: 'N₂', masaMolar: 28.02, coeficiente: 1 },
      { nombre: 'Hidrógeno', formula: 'H₂', masaMolar: 2.016, coeficiente: 3 },
    ],
    productos: [
      { nombre: 'Amoniaco', formula: 'NH₃', masaMolar: 17.03, coeficiente: 2 },
    ],
    contexto: 'Producción industrial de fertilizantes: alimenta a ~4000 millones de personas',
  },
  {
    id: 'oxidacion-hierro',
    nombre: 'Oxidación del hierro (herrumbre)',
    tipo: 'Oxidación',
    ecuacion: '4 Fe + 3 O₂ → 2 Fe₂O₃',
    reactivos: [
      { nombre: 'Hierro', formula: 'Fe', masaMolar: 55.85, coeficiente: 4 },
      { nombre: 'Oxígeno', formula: 'O₂', masaMolar: 32.00, coeficiente: 3 },
    ],
    productos: [
      { nombre: 'Óxido de hierro (III)', formula: 'Fe₂O₃', masaMolar: 159.7, coeficiente: 2 },
    ],
    contexto: 'Corrosión de estructuras metálicas: el reactivo limitante determina cuánto herrumbre se forma',
  },
  {
    id: 'fermentacion',
    nombre: 'Fermentación alcohólica',
    tipo: 'Fermentación',
    ecuacion: 'C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂',
    reactivos: [
      { nombre: 'Glucosa', formula: 'C₆H₁₂O₆', masaMolar: 180.16, coeficiente: 1 },
      { nombre: 'Levadura (catalizador)', formula: '—', masaMolar: 1, coeficiente: 0 },
    ],
    productos: [
      { nombre: 'Etanol', formula: 'C₂H₅OH', masaMolar: 46.07, coeficiente: 2 },
      { nombre: 'Dióxido de carbono', formula: 'CO₂', masaMolar: 44.01, coeficiente: 2 },
    ],
    contexto: 'Producción de vino, cerveza y biocombustibles',
  },
];

// ============================================
// LÓGICA DE CÁLCULO
// ============================================
function calcular(reaccion: Reaccion, gramosA: number, gramosB: number, rendimiento: number): ResultadoCalculo {
  const rA = reaccion.reactivos[0];
  const rB = reaccion.reactivos[1];
  const producto = reaccion.productos[0];

  // Caso especial: B es catalizador (coef = 0) → solo un reactivo real
  if (rB.coeficiente === 0) {
    const molesA = gramosA / rA.masaMolar;
    const molesProducto = molesA * (producto.coeficiente / rA.coeficiente);
    const masaProductoTeorica = molesProducto * producto.masaMolar;
    const masaProductoReal = masaProductoTeorica * (rendimiento / 100);
    return {
      limitante: rA.nombre,
      molesA,
      molesB: null,
      molesProductoTeorico: molesProducto,
      masaProductoTeorica,
      masaProductoReal,
      exceso: null,
      molesExceso: null,
      gramosExceso: null,
    };
  }

  const molesA = gramosA / rA.masaMolar;
  const molesB = gramosB / rB.masaMolar;

  // Razón estequiométrica: el que tenga menor ratio es el limitante
  const ratioA = molesA / rA.coeficiente;
  const ratioB = molesB / rB.coeficiente;

  const limitanteEsA = ratioA <= ratioB;
  const molesLimitante = limitanteEsA ? molesA : molesB;
  const coefLimitante = limitanteEsA ? rA.coeficiente : rB.coeficiente;

  const molesProducto = molesLimitante * (producto.coeficiente / coefLimitante);
  const masaProductoTeorica = molesProducto * producto.masaMolar;
  const masaProductoReal = masaProductoTeorica * (rendimiento / 100);

  // Cálculo del exceso
  const rExceso = limitanteEsA ? rB : rA;
  const molesExcesoNecesarios = molesLimitante * (rExceso.coeficiente / coefLimitante);
  const molesDisponiblesExceso = limitanteEsA ? molesB : molesA;
  const molesExcesoRestante = molesDisponiblesExceso - molesExcesoNecesarios;
  const gramosExceso = molesExcesoRestante * rExceso.masaMolar;

  return {
    limitante: limitanteEsA ? rA.nombre : rB.nombre,
    molesA,
    molesB,
    molesProductoTeorico: molesProducto,
    masaProductoTeorica,
    masaProductoReal,
    exceso: rExceso.nombre,
    molesExceso: molesExcesoRestante,
    gramosExceso,
  };
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorEstequiometriaPage() {
  const [reaccionId, setReaccionId] = useState<string>('combustion-metano');
  const [gramosAStr, setGramosAStr] = useState<string>('16');
  const [gramosBStr, setGramosBStr] = useState<string>('64');
  const [rendimiento, setRendimiento] = useState<number>(100);

  const reaccion = REACCIONES.find(r => r.id === reaccionId) ?? REACCIONES[0];
  const esCatalizador = reaccion.reactivos[1].coeficiente === 0;

  const gramosA = parseFloat(gramosAStr.replace(',', '.'));
  const gramosB = parseFloat(gramosBStr.replace(',', '.'));

  const datosValidos = !isNaN(gramosA) && gramosA > 0 && (esCatalizador || (!isNaN(gramosB) && gramosB > 0));

  const resultado = useMemo<ResultadoCalculo | null>(() => {
    if (!datosValidos) return null;
    return calcular(reaccion, gramosA, esCatalizador ? 0 : gramosB, rendimiento);
  }, [reaccion, gramosA, gramosB, rendimiento, datosValidos, esCatalizador]);

  // Para las barras de moles: calcular moles necesarios (del limitante, cuántos necesita el otro)
  const barra = useMemo(() => {
    if (!resultado || !datosValidos) return null;
    const rA = reaccion.reactivos[0];
    const rB = reaccion.reactivos[1];

    const molesA = resultado.molesA;
    const molesB = resultado.molesB;

    if (esCatalizador || molesB === null) {
      return { molesA, molesANecesarios: molesA, molesB: null, molesBNecesarios: null };
    }

    // Moles necesarios de cada uno para consumir al otro totalmente
    const molesANecesarios = molesB * (rA.coeficiente / rB.coeficiente);
    const molesBNecesarios = molesA * (rB.coeficiente / rA.coeficiente);

    return { molesA, molesANecesarios, molesB, molesBNecesarios };
  }, [resultado, reaccion, datosValidos, esCatalizador]);

  const ajustar = (setter: (v: string) => void, valor: string, delta: number) => {
    const actual = parseFloat(valor.replace(',', '.'));
    if (isNaN(actual)) { setter(String(Math.max(1, delta))); return; }
    setter(String(Math.max(0.1, Math.round((actual + delta) * 10) / 10)));
  };

  const seleccionarReaccion = (id: string) => {
    setReaccionId(id);
    // Cargar valores predeterminados razonables por reacción
    const defaults: Record<string, [string, string]> = {
      'combustion-metano': ['16', '64'],
      'sintesis-agua': ['4', '32'],
      'neutralizacion': ['36.5', '40'],
      'haber-bosch': ['28', '6'],
      'oxidacion-hierro': ['100', '50'],
      'fermentacion': ['90', '0'],
    };
    const [a, b] = defaults[id] ?? ['10', '10'];
    setGramosAStr(a);
    setGramosBStr(b);
    setRendimiento(100);
  };

  // Calcula porcentaje de la barra (máx 100%)
  const pctBarra = (moles: number, molesNecesarios: number): number => {
    if (molesNecesarios <= 0) return 100;
    return Math.min(100, (moles / molesNecesarios) * 100);
  };

  const esLimitanteA = resultado !== null && resultado.limitante === reaccion.reactivos[0].nombre;
  const esLimitanteB = resultado !== null && resultado.limitante === reaccion.reactivos[1].nombre;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">⚗️</span> Simulador de Estequiometría</h1>
          <p className={styles.subtitle}>
            Introduce la masa de cada reactivo y descubre cuál es el <strong>reactivo limitante</strong>,
            cuánto producto se obtiene y cuánto exceso sobra.
          </p>
        </header>

        <LegalNotice />

        {/* SELECTOR DE REACCIÓN */}
        <div className={styles.reaccionSelector} role="group" aria-label="Seleccionar reacción">
          {REACCIONES.map(r => (
            <button
              key={r.id}
              type="button"
              className={`${styles.reaccionBtn} ${reaccionId === r.id ? styles.reaccionBtnActive : ''}`}
              onClick={() => seleccionarReaccion(r.id)}
              aria-pressed={reaccionId === r.id}
            >
              <span className={styles.tipoBadge}>{r.tipo}</span>
              <span>{r.nombre}</span>
            </button>
          ))}
        </div>

        {/* ECUACIÓN BALANCEADA */}
        <div className={styles.ecuacionPanel}>
          <p className={styles.ecuacionLabel}>Ecuación balanceada:</p>
          <p className={styles.ecuacionText} aria-label={`Ecuación: ${reaccion.ecuacion}`}>
            {reaccion.ecuacion.split(' ').map((token, i) => {
              const isCoef = /^[0-9]+$/.test(token);
              const rANombre = reaccion.reactivos[0].formula;
              const rBNombre = reaccion.reactivos[1].formula;
              const isLimitanteFormula =
                resultado !== null &&
                ((resultado.limitante === reaccion.reactivos[0].nombre && token === rANombre) ||
                  (resultado.limitante === reaccion.reactivos[1].nombre && token === rBNombre));
              return (
                <span
                  key={i}
                  className={
                    isCoef
                      ? styles.coeficiente
                      : isLimitanteFormula
                      ? styles.limitanteResaltado
                      : undefined
                  }
                >
                  {token}{' '}
                </span>
              );
            })}
          </p>
          <p className={styles.contextoReaccion}>{reaccion.contexto}</p>
        </div>

        {/* INPUTS DE REACTIVOS */}
        <div className={styles.inputsGrid}>
          {/* Reactivo A */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="inputA">
              {reaccion.reactivos[0].nombre} ({reaccion.reactivos[0].formula})
              <span className={styles.masaMolarTag}>M = {formatNumber(reaccion.reactivos[0].masaMolar, 3)} g/mol</span>
            </label>
            <div className={styles.inputRow}>
              <button
                type="button"
                className={styles.btnAjuste}
                onClick={() => ajustar(setGramosAStr, gramosAStr, -1)}
                aria-label="Reducir gramos de reactivo A"
              >−</button>
              <input
                id="inputA"
                type="number"
                min="0.1"
                step="0.1"
                value={gramosAStr}
                onChange={e => setGramosAStr(e.target.value)}
                className={styles.inputNumero}
                aria-label={`Gramos de ${reaccion.reactivos[0].nombre}`}
              />
              <span className={styles.inputUnidad}>g</span>
              <button
                type="button"
                className={styles.btnAjuste}
                onClick={() => ajustar(setGramosAStr, gramosAStr, 1)}
                aria-label="Aumentar gramos de reactivo A"
              >+</button>
            </div>
          </div>

          {/* Reactivo B — oculto si es catalizador */}
          {!esCatalizador ? (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="inputB">
                {reaccion.reactivos[1].nombre} ({reaccion.reactivos[1].formula})
                <span className={styles.masaMolarTag}>M = {formatNumber(reaccion.reactivos[1].masaMolar, 3)} g/mol</span>
              </label>
              <div className={styles.inputRow}>
                <button
                  type="button"
                  className={styles.btnAjuste}
                  onClick={() => ajustar(setGramosBStr, gramosBStr, -1)}
                  aria-label="Reducir gramos de reactivo B"
                >−</button>
                <input
                  id="inputB"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={gramosBStr}
                  onChange={e => setGramosBStr(e.target.value)}
                  className={styles.inputNumero}
                  aria-label={`Gramos de ${reaccion.reactivos[1].nombre}`}
                />
                <span className={styles.inputUnidad}>g</span>
                <button
                  type="button"
                  className={styles.btnAjuste}
                  onClick={() => ajustar(setGramosBStr, gramosBStr, 1)}
                  aria-label="Aumentar gramos de reactivo B"
                >+</button>
              </div>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <div className={styles.catalizadorTag}>
                <span aria-hidden="true">🧪</span>
                <span>Levadura = catalizador. No se consume en la reacción.</span>
              </div>
            </div>
          )}

          {/* Slider de rendimiento */}
          <div className={styles.rendimientoRow}>
            <label className={styles.inputLabel} htmlFor="sliderRendimiento">
              Rendimiento de la reacción: <strong>{rendimiento}%</strong>
            </label>
            <input
              id="sliderRendimiento"
              type="range"
              min={0}
              max={100}
              step={1}
              value={rendimiento}
              onChange={e => setRendimiento(parseInt(e.target.value))}
              className={styles.slider}
              aria-label="Rendimiento de la reacción en porcentaje"
            />
          </div>
        </div>

        {/* BARRAS DE MOLES */}
        {barra !== null && resultado !== null && (
          <div className={styles.barsSection}>
            <h2 className={styles.barsSectionTitle}>Comparativa de moles</h2>

            {/* Barra A */}
            <div className={styles.barGroup}>
              <div className={styles.barLabel}>
                <span>
                  {reaccion.reactivos[0].nombre} ({reaccion.reactivos[0].formula})
                  {esLimitanteA && (
                    <span className={styles.limitanteBadge} role="img" aria-label="Reactivo limitante">⚠️ Limitante</span>
                  )}
                </span>
                <span className={styles.barValor}>
                  {formatNumber(barra.molesA, 4)} mol disponibles
                  {barra.molesBNecesarios !== null && (
                    <> / {formatNumber(barra.molesBNecesarios, 4)} mol necesarios</>
                  )}
                </span>
              </div>
              <div className={styles.barTrack} role="progressbar" aria-valuenow={Math.round(pctBarra(barra.molesA, barra.molesBNecesarios ?? barra.molesA))} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`${styles.barFill} ${esLimitanteA ? styles.barFillLimitante : ''}`}
                  style={{ width: `${pctBarra(barra.molesA, barra.molesBNecesarios ?? barra.molesA)}%` }}
                />
              </div>
            </div>

            {/* Barra B — solo si no es catalizador */}
            {!esCatalizador && barra.molesB !== null && (
              <div className={styles.barGroup}>
                <div className={styles.barLabel}>
                  <span>
                    {reaccion.reactivos[1].nombre} ({reaccion.reactivos[1].formula})
                    {esLimitanteB && (
                      <span className={styles.limitanteBadge} role="img" aria-label="Reactivo limitante">⚠️ Limitante</span>
                    )}
                  </span>
                  <span className={styles.barValor}>
                    {formatNumber(barra.molesB, 4)} mol disponibles
                    {barra.molesANecesarios !== null && (
                      <> / {formatNumber(barra.molesANecesarios, 4)} mol necesarios</>
                    )}
                  </span>
                </div>
                <div className={styles.barTrack} role="progressbar" aria-valuenow={Math.round(pctBarra(barra.molesB, barra.molesANecesarios ?? barra.molesB))} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`${styles.barFill} ${esLimitanteB ? styles.barFillLimitante : ''}`}
                    style={{ width: `${pctBarra(barra.molesB, barra.molesANecesarios ?? barra.molesB)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL DE RESULTADOS */}
        {resultado !== null ? (
          <div className={styles.resultadoPanel}>
            {/* Reactivo limitante */}
            <div className={styles.resultadoCard}>
              <span className={styles.resultadoLabel}>Reactivo limitante</span>
              <span className={`${styles.resultadoValor} ${styles.limitanteBadge}`}>
                {resultado.limitante}
              </span>
            </div>

            {/* Masa teórica */}
            <div className={styles.resultadoCard}>
              <span className={styles.resultadoLabel}>
                Masa teórica de {reaccion.productos[0].nombre} ({reaccion.productos[0].formula})
              </span>
              <span className={styles.resultadoValor}>{formatNumber(resultado.masaProductoTeorica, 3)} g</span>
              <span className={styles.resultadoSubValor}>{formatNumber(resultado.molesProductoTeorico, 4)} mol</span>
            </div>

            {/* Masa real (con rendimiento) */}
            <div className={`${styles.resultadoCard} ${styles.resultadoCardDestacado}`}>
              <span className={styles.resultadoLabel}>Masa real obtenida (rendimiento {rendimiento}%)</span>
              <span className={`${styles.resultadoValor} ${styles.resultadoValorGrande}`}>
                {formatNumber(resultado.masaProductoReal, 3)} g
              </span>
            </div>

            {/* Reactivo en exceso */}
            {resultado.exceso !== null && resultado.gramosExceso !== null && resultado.molesExceso !== null ? (
              <div className={styles.resultadoCard}>
                <span className={styles.resultadoLabel}>Reactivo en exceso</span>
                <span className={`${styles.resultadoValor} ${styles.excesoBadge}`}>
                  {resultado.exceso}
                </span>
                <span className={styles.resultadoSubValor}>
                  Sobran {formatNumber(resultado.gramosExceso, 3)} g ({formatNumber(resultado.molesExceso, 4)} mol)
                </span>
              </div>
            ) : (
              !esCatalizador && (
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Reactivo en exceso</span>
                  <span className={styles.resultadoValor}>Ninguno (estequiométrico)</span>
                </div>
              )
            )}

            {/* Contexto */}
            <div className={styles.resultadoContexto}>
              <span aria-hidden="true">🌍</span>
              <span>{reaccion.contexto}</span>
            </div>
          </div>
        ) : (
          <div className={styles.resultadoPanel} role="alert">
            <p className={styles.mensajeEspera}>
              Introduce gramos válidos y positivos para ver los resultados.
            </p>
          </div>
        )}

        {/* BLOQUE EDUCATIVO v2.0 */}
        <EducationalSection
          title="Aprende sobre Estequiometría"
          subtitle="El reactivo limitante y el método de los moles explicados paso a paso"
        >
          {/* INTRO */}
          <section>
            <h3>¿Qué es la estequiometría?</h3>
            <p>
              La <strong>estequiometría</strong> es la rama de la química que estudia las proporciones
              cuantitativas en que reaccionan y se forman las sustancias en una reacción química. A partir
              de la masa de los reactivos (en gramos) y sus masas molares, calcula cuánto producto se obtiene.
            </p>
            <p>
              El concepto central es el <strong>reactivo limitante</strong>: en cualquier reacción real,
              un reactivo se agota antes que los demás. Ese reactivo determina la cantidad máxima de producto
              que puede formarse. Los demás reactivos sobran (reactivos en exceso).
            </p>
            <div className={styles.formulaBox}>
              mol = masa (g) / masa molar (g/mol) &nbsp;·&nbsp; moles_producto = mol_limitante × (coef_producto / coef_limitante)
            </div>
            <p>
              El <strong>rendimiento de reacción</strong> (η) indica qué fracción del producto teórico se
              obtiene realmente, por pérdidas, reacciones secundarias o equilibrio incompleto. La masa real
              es: m_real = m_teórica × (η / 100).
            </p>
          </section>

          {/* TABLA COMPARATIVA */}
          <section>
            <h3>Las 6 reacciones del simulador: comparativa</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Reacción</th>
                    <th>Tipo</th>
                    <th>Reactivo habitualmente limitante</th>
                    <th>Producto principal</th>
                    <th>Aplicación real</th>
                    <th>Rendimiento típico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Combustión del metano</td>
                    <td>Combustión</td>
                    <td>Metano (CH₄) — en interiores con poca ventilación</td>
                    <td>CO₂</td>
                    <td>Calefacción, cocinas de gas</td>
                    <td>~99%</td>
                  </tr>
                  <tr>
                    <td>Síntesis del agua</td>
                    <td>Síntesis</td>
                    <td>Hidrógeno (H₂) — más caro de producir</td>
                    <td>H₂O</td>
                    <td>Pilas de combustible de hidrógeno</td>
                    <td>~95-99%</td>
                  </tr>
                  <tr>
                    <td>Neutralización ácido-base</td>
                    <td>Neutralización</td>
                    <td>Depende de la dosis relativa</td>
                    <td>NaCl</td>
                    <td>Laboratorio, tratamiento de residuos</td>
                    <td>~99%</td>
                  </tr>
                  <tr>
                    <td>Síntesis de amoniaco (Haber-Bosch)</td>
                    <td>Síntesis industrial</td>
                    <td>Hidrógeno (H₂) — mayor coeficiente (×3)</td>
                    <td>NH₃</td>
                    <td>Fertilizantes que alimentan ~4000 millones de personas</td>
                    <td>~10-15% por paso (ciclo continuo)</td>
                  </tr>
                  <tr>
                    <td>Oxidación del hierro</td>
                    <td>Oxidación</td>
                    <td>Oxígeno (O₂) en piezas gruesas; Fe en láminas delgadas</td>
                    <td>Fe₂O₃</td>
                    <td>Corrosión estructural, recubrimientos anticorrosión</td>
                    <td>Variable (proceso lento)</td>
                  </tr>
                  <tr>
                    <td>Fermentación alcohólica</td>
                    <td>Fermentación</td>
                    <td>Glucosa (único reactivo; la levadura es catalizador)</td>
                    <td>Etanol (C₂H₅OH)</td>
                    <td>Vino, cerveza, biocombustibles</td>
                    <td>~85-90%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ESCENARIOS */}
          <section>
            <h3>4 escenarios donde la estequiometría es decisiva</h3>
            <div className={styles.scenariosGrid}>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🍳</span>
                <strong>Cocina de gas (metano + oxígeno del aire)</strong>
                <p>
                  El aire contiene ~21% de O₂. Si el quemador no mezcla bien, el metano puede ser excesivo
                  y no combustionar completamente, generando CO (tóxico). El reactivo limitante real en un
                  entorno mal ventilado es el oxígeno.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🏭</span>
                <strong>Proceso Haber-Bosch (NH₃ industrial)</strong>
                <p>
                  La reacción N₂ + 3 H₂ → 2 NH₃ se produce en condiciones de alta presión y temperatura
                  (150-300 atm, 400-500 °C). El H₂ (3 moles por cada N₂) es casi siempre el limitante
                  económico. El rendimiento por paso es bajo (~15%), pero el gas no reaccionado se recicla.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🍷</span>
                <strong>Fermentación vitivinícola</strong>
                <p>
                  La glucosa del mosto es el único reactivo consumido. La levadura actúa como biocatalizador.
                  El enólogo controla el rendimiento reduciendo la temperatura (fermentación lenta y aromática)
                  o añadiendo nutrientes. Un mosto con 180 g/L de azúcar puede producir teóricamente ~92 g/L
                  de etanol.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">💊</span>
                <strong>Control de calidad farmacéutico</strong>
                <p>
                  En síntesis de principios activos, el reactivo más caro o tóxico se usa como limitante
                  intencional. El rendimiento de reacción (% que pasa a producto) junto con la pureza
                  determinan el coste por kg de fármaco. Un rendimiento del 70% vs 90% puede marcar
                  la viabilidad económica del proceso.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h3>Preguntas frecuentes sobre estequiometría</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Qué es el reactivo limitante?</h4>
                <p>
                  El <strong>reactivo limitante</strong> es el que se agota primero en la reacción y, por tanto,
                  determina la cantidad máxima de producto que puede formarse. No es necesariamente el que
                  se añade en menor masa: depende también de su masa molar y del coeficiente estequiométrico.
                  El reactivo que no se agota se llama <strong>reactivo en exceso</strong>.
                </p>
                <p className={styles.faqTip}>
                  💡 Ejemplo: para CH₄ + 2 O₂ → CO₂ + 2 H₂O, si tienes 16 g de CH₄ (1 mol) y 64 g de O₂
                  (2 mol), ambos son exactamente estequiométricos. Si usas 32 g de O₂ en cambio, el O₂ es
                  el limitante.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Cómo calculo los moles a partir de los gramos?</h4>
                <p>
                  La relación fundamental es: <strong>moles = masa (g) / masa molar (g/mol)</strong>. La masa
                  molar es la suma de las masas atómicas de todos los átomos de la fórmula. Por ejemplo,
                  CH₄ tiene M = 12 + 4×1 = 16 g/mol. Si tienes 32 g de CH₄, son 32/16 = 2 mol.
                </p>
                <p className={styles.faqTip}>
                  💡 Las masas molares de los elementos están en la tabla periódica (peso atómico en u ≈ g/mol).
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Cómo encuentro el reactivo limitante con la razón estequiométrica?</h4>
                <p>
                  Divide los moles de cada reactivo entre su coeficiente estequiométrico. El reactivo cuya
                  razón <strong>(moles / coeficiente)</strong> sea menor es el limitante. Este método es
                  general para cualquier número de reactivos.
                </p>
                <div className={styles.formulaBox}>
                  ratio_A = n_A / c_A &nbsp;|&nbsp; ratio_B = n_B / c_B &nbsp;→&nbsp; limitante = el de menor ratio
                </div>
                <p className={styles.faqTip}>
                  💡 Ejemplo: N₂ + 3 H₂ → 2 NH₃. Tienes 2 mol N₂ y 5 mol H₂. Ratio N₂ = 2/1 = 2; Ratio H₂ = 5/3 ≈ 1,67.
                  El H₂ es el limitante.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué es el rendimiento de reacción?</h4>
                <p>
                  El <strong>rendimiento</strong> (η) es el cociente entre la masa real obtenida y la masa
                  teórica máxima: η = (m_real / m_teórica) × 100%. Una reacción con rendimiento del 80% significa
                  que se pierde un 20% por reacciones secundarias, equilibrio incompleto o pérdidas físicas
                  durante la separación. En laboratorio académico, rendimientos del 70-90% son habituales.
                </p>
                <p className={styles.faqTip}>
                  💡 En el simulador, el slider de rendimiento multiplica la masa teórica: m_real = m_teórica × η/100.
                  Prueba a bajar el rendimiento al 75% para ver la diferencia.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Puede haber más de un reactivo limitante?</h4>
                <p>
                  Formalmente, no: siempre hay un único reactivo limitante (el de menor ratio). Sin embargo,
                  si dos reactivos tienen exactamente la misma razón estequiométrica, ambos se agotan
                  simultáneamente. En ese caso se dice que la mezcla es <strong>estequiométrica</strong>
                  y no hay reactivo en exceso. En la práctica esto es muy raro de lograr exactamente.
                </p>
                <p className={styles.faqTip}>
                  💡 En el simulador, si el resultado muestra &quot;Ninguno (estequiométrico)&quot; como reactivo
                  en exceso, es que los ratios son iguales.
                </p>
              </div>
            </div>
          </section>

          {/* PASOS */}
          <section>
            <h3>Algoritmo paso a paso para resolver cualquier problema de estequiometría</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Escribe y balancea la ecuación química</strong>
                  <p>
                    Asegúrate de que los coeficientes estequiométricos están correctos (mismos átomos
                    de cada elemento a ambos lados). Sin ecuación balanceada, todos los cálculos son erróneos.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Convierte gramos a moles para cada reactivo</strong>
                  <p>
                    n = m / M. Calcula la masa molar M sumando los pesos atómicos de todos los átomos
                    de la fórmula. Anota los moles de A y de B por separado.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Calcula la razón estequiométrica de cada reactivo</strong>
                  <p>
                    Divide los moles de cada reactivo entre su coeficiente: ratio = n / coeficiente.
                    El reactivo con el ratio menor es el limitante.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Calcula los moles de producto a partir del limitante</strong>
                  <p>
                    n_producto = n_limitante × (coeficiente_producto / coeficiente_limitante).
                    Convierte a gramos: m = n × M_producto.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Aplica el rendimiento y calcula el exceso</strong>
                  <p>
                    m_real = m_teórica × (η / 100). Para el exceso: moles_exceso = moles_disponibles −
                    moles_necesarios (del reactivo no limitante). Convierte a gramos con su masa molar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TIPS */}
          <section>
            <h3>4 trucos para no equivocarse en estequiometría</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <strong>Siempre pasa por moles</strong>
                <p>
                  Nunca compares gramos directamente. 10 g de H₂ y 10 g de O₂ no son cantidades equivalentes:
                  son 4,96 mol vs 0,31 mol. Las proporciones estequiométricas son en moles, no en gramos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📐</span>
                <strong>Usa el ratio, no el número absoluto</strong>
                <p>
                  El reactivo limitante no es el que tiene menos moles, sino el que tiene menor
                  (moles / coeficiente). Un reactivo con coeficiente 3 necesita tres veces más moles
                  que uno con coeficiente 1.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <strong>El exceso se calcula con los moles realmente consumidos</strong>
                <p>
                  Exceso = moles_disponibles − moles_consumidos_del_no_limitante. Los moles consumidos
                  del no limitante = moles_limitante × (coef_no_limitante / coef_limitante).
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✅</span>
                <strong>Verifica con la conservación de masa</strong>
                <p>
                  La suma de masas de reactivos consumidos debe igual a la masa de productos formados
                  (ley de Lavoisier). Si hay discrepancia, revisa las masas molares y los coeficientes.
                </p>
              </div>
            </div>
          </section>

          {/* WARNING BOX */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>5 errores frecuentes en estequiometría</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Comparar moles directamente sin dividir por el coeficiente</strong> — El error más
                común en EBAU. Si N₂ + 3 H₂ y tienes 2 mol N₂ y 5 mol H₂, NO es limitante el H₂ por
                &quot;tener menos moles que 3×2=6&quot;: el ratio de H₂ = 5/3 ≈ 1,67 &lt; 2/1 = 2, así que
                sí es limitante, pero hay que hacer la división.
              </li>
              <li>
                <strong>Olvidar convertir gramos a moles antes de calcular</strong> — Las relaciones
                estequiométricas son siempre en moles. Trabajar en gramos directamente da resultados
                completamente incorrectos.
              </li>
              <li>
                <strong>Confundir rendimiento (η) con pureza</strong> — El rendimiento se refiere a la
                fracción de reactivo que se transforma en producto deseado. La pureza es la fracción de
                la mezcla final que es el producto deseado. Son conceptos distintos.
              </li>
              <li>
                <strong>Usar masa atómica en vez de masa molar</strong> — La masa molar de O₂ es 32 g/mol
                (2×16), no 16 g/mol. Siempre considera la fórmula molecular completa, no solo el átomo.
              </li>
              <li>
                <strong>Aplicar el rendimiento a los moles del limitante en vez de a la masa del producto</strong>
                — El rendimiento afecta al producto obtenido: m_real = m_teórica × η/100. No reduce los
                moles del reactivo que reacciona (eso es conversión, no rendimiento).
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-estequiometria')} />
        <ShareCard appName="simulador-estequiometria" />
        <Footer appName="simulador-estequiometria" />
    </div>
  );
}
