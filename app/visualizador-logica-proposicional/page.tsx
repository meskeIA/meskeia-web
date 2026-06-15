'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './LogicaProposicional.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActiva = 'conectores' | 'evaluador' | 'karnaugh' | 'formas';
type Conector = 'AND' | 'OR' | 'XOR' | 'IMPL' | 'EQUIV';

interface FilaTruth {
  p: boolean;
  q: boolean;
  r: boolean;
  resultado: boolean;
}

// ─────────────────────────────────────────────
// Helpers lógicos
// ─────────────────────────────────────────────

function aplicarConector(p: boolean, q: boolean, conector: Conector): boolean {
  switch (conector) {
    case 'AND':   return p && q;
    case 'OR':    return p || q;
    case 'XOR':   return p !== q;
    case 'IMPL':  return !p || q;
    case 'EQUIV': return p === q;
  }
}

function simboloConector(conector: Conector): string {
  switch (conector) {
    case 'AND':   return '∧';
    case 'OR':    return '∨';
    case 'XOR':   return '⊕';
    case 'IMPL':  return '→';
    case 'EQUIV': return '↔';
  }
}

function nombreConector(conector: Conector): string {
  switch (conector) {
    case 'AND':   return 'Conjunción (AND)';
    case 'OR':    return 'Disyunción (OR)';
    case 'XOR':   return 'Disyunción exclusiva (XOR)';
    case 'IMPL':  return 'Implicación (→)';
    case 'EQUIV': return 'Equivalencia (↔)';
  }
}

// Genera tabla de verdad completa para 3 variables con una fórmula dada
function generarTabla(formula: string, variables: { p: boolean; q: boolean; r: boolean }[]): FilaTruth[] {
  return variables.map(({ p, q, r }) => {
    let resultado = false;
    try {
      // Evaluación segura de fórmula con palabras clave
      const expr = formula
        .toUpperCase()
        .replace(/\bNOT\s+P\b/g, (!p).toString())
        .replace(/\bNOT\s+Q\b/g, (!q).toString())
        .replace(/\bNOT\s+R\b/g, (!r).toString())
        .replace(/\bP\b/g, p.toString())
        .replace(/\bQ\b/g, q.toString())
        .replace(/\bR\b/g, r.toString())
        .replace(/\bAND\b/g, '&&')
        .replace(/\bOR\b/g, '||');
      // eslint-disable-next-line no-new-func
      resultado = Boolean(new Function('return ' + expr)());
    } catch {
      resultado = false;
    }
    return { p, q, r, resultado };
  });
}

const TODAS_COMBINACIONES: { p: boolean; q: boolean; r: boolean }[] = [];
for (let i = 0; i < 8; i++) {
  TODAS_COMBINACIONES.push({
    p: !!(i & 4),
    q: !!(i & 2),
    r: !!(i & 1),
  });
}

// Karnaugh 2x4 para 3 variables (orden Gray: 00,01,11,10 para QR, P en filas)
// Filas: P=0, P=1 | Columnas: QR=00,01,11,10
const KARNAUGH_ORDEN: number[][] = [
  [0, 1, 3, 2],   // P=0
  [4, 5, 7, 6],   // P=1
];
const KARNAUGH_HEADERS_COL = ['QR=00', 'QR=01', 'QR=11', 'QR=10'];
const KARNAUGH_HEADERS_ROW = ['P=0', 'P=1'];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function Badge({ valor }: { valor: boolean }) {
  return (
    <span className={valor ? styles.badgeVerdadero : styles.badgeFalso}>
      {valor ? '1' : '0'}
    </span>
  );
}

function Toggle({ valor, onChange, label }: { valor: boolean; onChange: () => void; label: string }) {
  return (
    <button
      className={`${styles.toggle} ${valor ? styles.toggleOn : styles.toggleOff}`}
      onClick={onChange}
      aria-pressed={valor}
      aria-label={`${label}: ${valor ? 'Verdadero' : 'Falso'}`}
    >
      <span className={styles.toggleLabel}>{label}</span>
      <span className={styles.toggleValor}>{valor ? 'V' : 'F'}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Conectores Lógicos
// ─────────────────────────────────────────────

function TabConectores({
  valorP, valorQ, setValorP, setValorQ,
  conectorSeleccionado, setConectorSeleccionado,
}: {
  valorP: boolean;
  valorQ: boolean;
  setValorP: () => void;
  setValorQ: () => void;
  conectorSeleccionado: Conector;
  setConectorSeleccionado: (c: Conector) => void;
}) {
  const conectores: Conector[] = ['AND', 'OR', 'XOR', 'IMPL', 'EQUIV'];

  const tablaCompleta: { p: boolean; q: boolean; resultado: boolean }[] = [
    { p: false, q: false, resultado: aplicarConector(false, false, conectorSeleccionado) },
    { p: false, q: true,  resultado: aplicarConector(false, true, conectorSeleccionado) },
    { p: true,  q: false, resultado: aplicarConector(true, false, conectorSeleccionado) },
    { p: true,  q: true,  resultado: aplicarConector(true, true, conectorSeleccionado) },
  ];

  const resultadoActual = aplicarConector(valorP, valorQ, conectorSeleccionado);

  return (
    <div className={styles.tabContent}>
      {/* Selector de conector */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Selecciona el conector</h3>
        <div className={styles.conectoresBtns}>
          {conectores.map((c) => (
            <button
              key={c}
              className={`${styles.conectorBtn} ${conectorSeleccionado === c ? styles.conectorBtnActivo : ''}`}
              onClick={() => setConectorSeleccionado(c)}
            >
              <span className={styles.conectorSimbolo}>{simboloConector(c)}</span>
              <span className={styles.conectorNombre}>{c}</span>
            </button>
          ))}
        </div>
        <p className={styles.formulaVis}>
          P {simboloConector(conectorSeleccionado)} Q — {nombreConector(conectorSeleccionado)}
        </p>
      </div>

      {/* Toggles P y Q */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Asigna valores</h3>
        <div className={styles.togglesRow}>
          <Toggle valor={valorP} onChange={setValorP} label="P" />
          <span className={styles.operadorDisplay}>{simboloConector(conectorSeleccionado)}</span>
          <Toggle valor={valorQ} onChange={setValorQ} label="Q" />
          <span className={styles.operadorDisplay}>=</span>
          <span className={`${styles.resultadoGrande} ${resultadoActual ? styles.resultadoV : styles.resultadoF}`}>
            {resultadoActual ? 'V' : 'F'}
          </span>
        </div>
        {/* NOT P */}
        <p className={styles.notaTexto}>
          ¬P = <Badge valor={!valorP} /> &nbsp; ¬Q = <Badge valor={!valorQ} />
        </p>
      </div>

      {/* Tabla de verdad completa */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Tabla de verdad completa</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.truthTable}>
            <thead>
              <tr>
                <th>P</th>
                <th>Q</th>
                <th>¬P</th>
                <th>¬Q</th>
                <th>P {simboloConector(conectorSeleccionado)} Q</th>
              </tr>
            </thead>
            <tbody>
              {tablaCompleta.map((fila, i) => {
                const esActual = fila.p === valorP && fila.q === valorQ;
                return (
                  <tr key={i} className={esActual ? styles.filaActiva : ''}>
                    <td><Badge valor={fila.p} /></td>
                    <td><Badge valor={fila.q} /></td>
                    <td><Badge valor={!fila.p} /></td>
                    <td><Badge valor={!fila.q} /></td>
                    <td><Badge valor={fila.resultado} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.leyenda}>
          <span className={styles.badgeVerdadero}>1</span> = Verdadero &nbsp;
          <span className={styles.badgeFalso}>0</span> = Falso &nbsp;
          <span className={styles.filaActivaLeyenda}>▌</span> Fila activa
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Evaluador de Fórmulas
// ─────────────────────────────────────────────

const EJEMPLOS_FORMULA = [
  { label: 'Tautología', formula: 'P OR NOT P' },
  { label: 'Contradicción', formula: 'P AND NOT P' },
  { label: 'Contingencia', formula: 'P AND Q OR NOT R' },
  { label: 'Implicación', formula: 'NOT P OR Q' },
];

function TabEvaluador({
  valorP, valorQ, valorR, setValorP, setValorQ, setValorR,
}: {
  valorP: boolean; valorQ: boolean; valorR: boolean;
  setValorP: () => void; setValorQ: () => void; setValorR: () => void;
}) {
  const [formula, setFormula] = useState('P AND Q OR NOT R');

  let tabla: FilaTruth[] = [];
  let error = '';
  try {
    tabla = generarTabla(formula, TODAS_KOMBINACIONES_PQR());
  } catch {
    error = 'Fórmula inválida';
  }

  const resultadoActual = (() => {
    try {
      const fila = generarTabla(formula, [{ p: valorP, q: valorQ, r: valorR }]);
      return fila[0]?.resultado ?? false;
    } catch {
      return false;
    }
  })();

  const esTautologia = tabla.length > 0 && tabla.every(f => f.resultado);
  const esContradiccion = tabla.length > 0 && tabla.every(f => !f.resultado);
  const tipoFormula = esTautologia ? 'Tautología' : esContradiccion ? 'Contradicción' : 'Contingencia';

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Escribe una fórmula</h3>
        <p className={styles.notaTexto}>Usa: P, Q, R, AND, OR, NOT (ej: P AND NOT Q OR R)</p>
        <input
          className={styles.formulaInput}
          value={formula}
          onChange={e => setFormula(e.target.value)}
          placeholder="P AND Q OR NOT R"
          aria-label="Fórmula lógica"
        />
        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        <div className={styles.ejemplosBtns}>
          {EJEMPLOS_FORMULA.map(ej => (
            <button
              key={ej.label}
              className={styles.ejemploBtn}
              onClick={() => setFormula(ej.formula)}
            >
              {ej.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Asigna valores a las variables</h3>
        <div className={styles.togglesRow}>
          <Toggle valor={valorP} onChange={setValorP} label="P" />
          <Toggle valor={valorQ} onChange={setValorQ} label="Q" />
          <Toggle valor={valorR} onChange={setValorR} label="R" />
        </div>
        <div className={styles.resultadoBox}>
          <span className={styles.resultadoLabel}>Resultado con P={valorP ? 'V' : 'F'}, Q={valorQ ? 'V' : 'F'}, R={valorR ? 'V' : 'F'}:</span>
          <span className={`${styles.resultadoGrande} ${resultadoActual ? styles.resultadoV : styles.resultadoF}`}>
            {resultadoActual ? 'Verdadero' : 'Falso'}
          </span>
        </div>
        <div className={styles.tipoBadge}>
          Tipo de fórmula: <strong>{tipoFormula}</strong>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Tabla de verdad completa (8 filas)</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.truthTable}>
            <thead>
              <tr>
                <th>P</th><th>Q</th><th>R</th><th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((fila, i) => {
                const esActual = fila.p === valorP && fila.q === valorQ && fila.r === valorR;
                return (
                  <tr key={i} className={esActual ? styles.filaActiva : ''}>
                    <td><Badge valor={fila.p} /></td>
                    <td><Badge valor={fila.q} /></td>
                    <td><Badge valor={fila.r} /></td>
                    <td><Badge valor={fila.resultado} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper necesario para TabEvaluador (evita captura de closure con TODAS_COMBINACIONES)
function TODAS_KOMBINACIONES_PQR(): { p: boolean; q: boolean; r: boolean }[] {
  return TODAS_COMBINACIONES;
}

// ─────────────────────────────────────────────
// Tab 3: Mapa de Karnaugh
// ─────────────────────────────────────────────

function TabKarnaugh() {
  // 8 minterms para 3 variables (índices 0-7)
  const [celdas, setCeldas] = useState<boolean[]>(Array(8).fill(false));

  const toggleCelda = useCallback((minterm: number) => {
    setCeldas(prev => {
      const next = [...prev];
      next[minterm] = !next[minterm];
      return next;
    });
  }, []);

  // Calcular expresión SOP: OR de minterms activos
  const mintermsActivos = celdas
    .map((v, i) => (v ? i : -1))
    .filter(i => i >= 0);

  function mintermASOP(minterm: number): string {
    const p = !!(minterm & 4) ? 'P' : "P'";
    const q = !!(minterm & 2) ? 'Q' : "Q'";
    const r = !!(minterm & 1) ? 'R' : "R'";
    return `${p}${q}${r}`;
  }

  const expresionSOP = mintermsActivos.length === 0
    ? '0 (función siempre falsa)'
    : mintermsActivos.length === 8
    ? '1 (función siempre verdadera — tautología)'
    : mintermsActivos.map(mintermASOP).join(' + ');

  // Detectar grupos simples (pares adyacentes en el mapa de Karnaugh)
  const gruposDetectados: string[] = [];
  // Verificar pares de columnas adyacentes (en orden Gray)
  const ordenGray = [[0,1,3,2],[4,5,7,6]];
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 4; col++) {
      const colSig = (col + 1) % 4;
      const m1 = ordenGray[fila][col];
      const m2 = ordenGray[fila][colSig];
      if (celdas[m1] && celdas[m2]) {
        gruposDetectados.push(`Grupo par: m${m1}+m${m2}`);
      }
    }
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Mapa de Karnaugh — 3 variables (P, Q, R)</h3>
        <p className={styles.notaTexto}>Haz clic en las celdas para marcar minterms (1). El orden de columnas sigue el código Gray.</p>
        <div className={styles.karnaughWrapper}>
          <table className={styles.karnaughTable}>
            <thead>
              <tr>
                <th className={styles.karnaughCorner}>P＼QR</th>
                {KARNAUGH_HEADERS_COL.map(h => (
                  <th key={h} className={styles.karnaughHeader}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KARNAUGH_ORDEN.map((fila, rowIdx) => (
                <tr key={rowIdx}>
                  <td className={styles.karnaughRowHeader}>{KARNAUGH_HEADERS_ROW[rowIdx]}</td>
                  {fila.map((minterm) => (
                    <td
                      key={minterm}
                      className={`${styles.karnaughCelda} ${celdas[minterm] ? styles.karnaughCeldaActiva : ''}`}
                      onClick={() => toggleCelda(minterm)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && toggleCelda(minterm)}
                      aria-pressed={celdas[minterm]}
                      aria-label={`Minterm ${minterm}: ${celdas[minterm] ? '1' : '0'}`}
                    >
                      <span className={styles.karnaughMinterm}>{minterm}</span>
                      <span className={styles.karnaughVal}>{celdas[minterm] ? '1' : '0'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className={styles.btnSecundario}
          onClick={() => setCeldas(Array(8).fill(false))}
        >
          Limpiar mapa
        </button>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Expresión SOP (Suma de Productos)</h3>
        <div className={styles.formulaVis}>
          <span aria-live="polite">{expresionSOP}</span>
        </div>
        {mintermsActivos.length > 0 && mintermsActivos.length < 8 && (
          <ul className={styles.mintermsList}>
            {mintermsActivos.map(m => (
              <li key={m}>m{m} = {mintermASOP(m)}</li>
            ))}
          </ul>
        )}
        {gruposDetectados.length > 0 && (
          <div className={styles.gruposInfo}>
            <strong>Grupos adyacentes detectados:</strong>
            <ul>
              {gruposDetectados.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>¿Por qué se agrupan potencias de 2?</h3>
        <p className={styles.parrafoExpl}>
          En el mapa de Karnaugh, los grupos de 1, 2, 4 u 8 celdas adyacentes corresponden
          a que una o más variables <strong>se cancelan</strong> en el álgebra booleana.
          Un grupo de 2 elimina una variable, un grupo de 4 elimina dos, y un grupo de 8
          elimina las tres (tautología). Agrupar siempre potencias de 2 garantiza que
          la simplificación sea válida y la expresión resultante sea mínima.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Formas Normales
// ─────────────────────────────────────────────

// Tabla de verdad interactiva de 3 variables
// El usuario puede activar/desactivar filas (valores de salida)
function TabFormasNormales() {
  // Estado inicial: semisumador XOR (P XOR Q, ignorando R)
  const [salidas, setSalidas] = useState<boolean[]>([
    false, true, true, false, false, true, true, false,
  ]);
  const [mostrarFND, setMostrarFND] = useState(true);

  const toggleSalida = (i: number) => {
    setSalidas(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  // FND: OR de minterms (filas con salida=1) → mintérminos
  const minterms = TODAS_COMBINACIONES
    .map((combo, i) => ({ ...combo, i }))
    .filter((_, i) => salidas[i]);

  // FNC: AND de maxterms (filas con salida=0) → maxtérminos
  const maxterms = TODAS_COMBINACIONES
    .map((combo, i) => ({ ...combo, i }))
    .filter((_, i) => !salidas[i]);

  function mintermToExpr(combo: { p: boolean; q: boolean; r: boolean }): string {
    return `(${combo.p ? 'P' : '¬P'} ∧ ${combo.q ? 'Q' : '¬Q'} ∧ ${combo.r ? 'R' : '¬R'})`;
  }

  function maxtermToExpr(combo: { p: boolean; q: boolean; r: boolean }): string {
    return `(${combo.p ? '¬P' : 'P'} ∨ ${combo.q ? '¬Q' : 'Q'} ∨ ${combo.r ? '¬R' : 'R'})`;
  }

  const fnd = minterms.length === 0
    ? '0 (función siempre falsa)'
    : minterms.length === 8
    ? '1 (tautología)'
    : minterms.map(m => mintermToExpr(m)).join('\n∨ ');

  const fnc = maxterms.length === 0
    ? '1 (tautología)'
    : maxterms.length === 8
    ? '0 (contradicción)'
    : maxterms.map(m => maxtermToExpr(m)).join('\n∧ ');

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Tabla de verdad — Define la función</h3>
        <p className={styles.notaTexto}>Haz clic en la columna "Salida" para cambiar el valor de cada fila. Ejemplo cargado: XOR (P ⊕ Q).</p>
        <div className={styles.tableWrapper}>
          <table className={styles.truthTable}>
            <thead>
              <tr>
                <th>P</th><th>Q</th><th>R</th><th>Salida (clic)</th>
              </tr>
            </thead>
            <tbody>
              {TODAS_COMBINACIONES.map((combo, i) => (
                <tr key={i}>
                  <td><Badge valor={combo.p} /></td>
                  <td><Badge valor={combo.q} /></td>
                  <td><Badge valor={combo.r} /></td>
                  <td>
                    <button
                      className={`${styles.salidaBtn} ${salidas[i] ? styles.salidaBtnV : styles.salidaBtnF}`}
                      onClick={() => toggleSalida(i)}
                      aria-pressed={salidas[i]}
                      aria-label={`Fila ${i}: salida ${salidas[i] ? '1' : '0'}`}
                    >
                      {salidas[i] ? '1' : '0'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Formas Normales</h3>
        <div className={styles.formaToggle}>
          <button
            className={`${styles.formaBtn} ${mostrarFND ? styles.formaBtnActivo : ''}`}
            onClick={() => setMostrarFND(true)}
          >
            FND — Disyuntiva
          </button>
          <button
            className={`${styles.formaBtn} ${!mostrarFND ? styles.formaBtnActivo : ''}`}
            onClick={() => setMostrarFND(false)}
          >
            FNC — Conjuntiva
          </button>
        </div>

        <div className={styles.formaNormal}>
          {mostrarFND ? (
            <>
              <p className={styles.formaNormalTitulo}>
                FND — Forma Normal Disyuntiva (OR de ANDs / suma de minterms)
              </p>
              <pre className={styles.formaNormalExpr} aria-live="polite">{fnd}</pre>
              <p className={styles.notaTexto}>
                La FND es el OR de todos los minterms donde la salida es 1.
                Cada minterm es el AND de todas las variables (negadas si la variable vale 0).
              </p>
            </>
          ) : (
            <>
              <p className={styles.formaNormalTitulo}>
                FNC — Forma Normal Conjuntiva (AND de ORs / producto de maxterms)
              </p>
              <pre className={styles.formaNormalExpr} aria-live="polite">{fnc}</pre>
              <p className={styles.notaTexto}>
                La FNC es el AND de todos los maxterms donde la salida es 0.
                Cada maxterm es el OR de todas las variables (negadas si la variable vale 1).
              </p>
            </>
          )}
        </div>

        <div className={styles.infoBox}>
          <strong>Ejemplo clásico — Semisumador (XOR):</strong> La salida es 1 cuando P y Q
          tienen valores distintos (independientemente de R). FND: (¬P ∧ Q) ∨ (P ∧ ¬Q) (si se ignora R).
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección educativa
// ─────────────────────────────────────────────

const contenidoEducativo = (
  <div>
    <p>
      La <strong>lógica proposicional</strong> es la rama de la lógica matemática que estudia
      las relaciones entre proposiciones (afirmaciones que pueden ser verdaderas o falsas)
      mediante <strong>conectores lógicos</strong>. Es la base del álgebra de Boole, los circuitos
      digitales y la programación.
    </p>
    <p>
      Los seis conectores fundamentales son: la <strong>conjunción (∧/AND)</strong>, que es verdadera
      solo cuando ambas proposiciones lo son; la <strong>disyunción (∨/OR)</strong>, verdadera cuando
      al menos una lo es; la <strong>negación (¬/NOT)</strong>, que invierte el valor; la
      <strong> disyunción exclusiva (⊕/XOR)</strong>, verdadera cuando exactamente una lo es;
      la <strong>implicación (→)</strong>, falsa solo cuando el antecedente es verdadero y el
      consecuente falso; y la <strong>equivalencia (↔)</strong>, verdadera cuando ambas
      proposiciones tienen el mismo valor.
    </p>
    <p>
      Las <strong>formas normales</strong> (FND y FNC) son representaciones canónicas de cualquier
      función booleana. El <strong>mapa de Karnaugh</strong> es una herramienta visual para
      simplificar expresiones booleanas agrupando minterms adyacentes en potencias de 2,
      lo que equivale a aplicar el álgebra de Boole de forma sistemática.
    </p>

    {/* ── 1. Tabla comparativa de conectores ── */}
    <h3 className={styles.eduSectionTitle}>Los 6 conectores lógicos fundamentales</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.comparativaTable}>
        <thead>
          <tr>
            <th>Conector</th>
            <th>Símbolo</th>
            <th>Tipo</th>
            <th>Verdadero cuando</th>
            <th>Falso cuando</th>
            <th>Ejemplo cotidiano</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>AND</strong></td>
            <td className={styles.simboloCell}>∧</td>
            <td>Conjunción</td>
            <td>P y Q son verdaderos</td>
            <td>Al menos uno es falso</td>
            <td>«Llueve Y hace frío»</td>
          </tr>
          <tr>
            <td><strong>OR</strong></td>
            <td className={styles.simboloCell}>∨</td>
            <td>Disyunción</td>
            <td>P, Q o ambos son verdaderos</td>
            <td>P y Q son falsos</td>
            <td>«Viene Juan O viene Ana»</td>
          </tr>
          <tr>
            <td><strong>NOT</strong></td>
            <td className={styles.simboloCell}>¬</td>
            <td>Negación</td>
            <td>P es falso</td>
            <td>P es verdadero</td>
            <td>«NO llueve»</td>
          </tr>
          <tr>
            <td><strong>XOR</strong></td>
            <td className={styles.simboloCell}>⊕</td>
            <td>Excl. exclusiva</td>
            <td>Exactamente uno es verdadero</td>
            <td>Ambos iguales (00 ó 11)</td>
            <td>«O uno O el otro, no los dos»</td>
          </tr>
          <tr>
            <td><strong>IMPL</strong></td>
            <td className={styles.simboloCell}>→</td>
            <td>Implicación</td>
            <td>P es falso, o Q es verdadero</td>
            <td>P=V y Q=F (solo este caso)</td>
            <td>«Si estudias, apruebas»</td>
          </tr>
          <tr>
            <td><strong>EQUIV</strong></td>
            <td className={styles.simboloCell}>↔</td>
            <td>Equivalencia</td>
            <td>P y Q tienen el mismo valor</td>
            <td>P y Q tienen distinto valor</td>
            <td>«Llueve si y solo si hay nubes»</td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* ── 2. Casos de uso — 4 perfiles ── */}
    <h3 className={styles.eduSectionTitle}>¿Quién usa la lógica proposicional?</h3>
    <div className={styles.escenariosGrid}>
      <div className={styles.escenarioCard}>
        <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
        <strong>Estudiante de bachillerato</strong>
        <p>Usa tablas de verdad en matemáticas e informática para demostrar equivalencias y analizar fórmulas en los exámenes de selectividad.</p>
      </div>
      <div className={styles.escenarioCard}>
        <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
        <strong>Ingeniero de software</strong>
        <p>Diseña condiciones booleanas en código: validaciones de formularios, control de flujo y expresiones en lenguajes de programación como Python, Java o C.</p>
      </div>
      <div className={styles.escenarioCard}>
        <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
        <strong>Electricista / técnico digital</strong>
        <p>Aplica puertas lógicas (AND, OR, NOT, XOR) para diseñar y analizar circuitos digitales, desde decodificadores hasta microprocesadores.</p>
      </div>
      <div className={styles.escenarioCard}>
        <span className={styles.escenarioIcon} aria-hidden="true">📝</span>
        <strong>Opositor a matemáticas o informática</strong>
        <p>Domina las formas normales FND/FNC y los mapas de Karnaugh para minimizar funciones booleanas, tema habitual en oposiciones del cuerpo de profesores.</p>
      </div>
    </div>

    {/* ── 3. FAQ ── */}
    <h3 className={styles.eduSectionTitle}>Preguntas frecuentes</h3>
    <ul className={styles.faqList}>
      <li className={styles.faqItem}>
        <strong>¿Qué diferencia hay entre OR exclusivo (XOR) y OR inclusivo?</strong>
        <p>
          El OR inclusivo (∨) es verdadero cuando al menos uno de los operandos es verdadero, incluido el caso en que ambos lo sean (V∨V = V).
          El XOR (⊕) es verdadero solo cuando <em>exactamente uno</em> de los dos es verdadero: si ambos son iguales (VV o FF), el resultado es falso.
          En circuitos digitales, el XOR se usa para detectar diferencias y en operaciones de suma binaria (bit de suma del semisumador).
        </p>
        <p className={styles.faqTip}>Regla rápida: XOR = «uno u otro, pero no los dos».</p>
      </li>
      <li className={styles.faqItem}>
        <strong>¿Cuándo es verdadera una implicación lógica?</strong>
        <p>
          La implicación P→Q es <em>falsa únicamente</em> cuando el antecedente (P) es verdadero y el consecuente (Q) es falso.
          En todos los demás casos (P=F, o Q=V) la implicación es verdadera, aunque pueda parecer contraintuitivo.
          Ejemplo: «Si llueve, el suelo está mojado». Si no llueve (P=F), la proposición no se incumple sea cual sea el estado del suelo.
        </p>
        <p className={styles.faqTip}>Solo una fila es falsa: (V → F).</p>
      </li>
      <li className={styles.faqItem}>
        <strong>¿Para qué sirve el mapa de Karnaugh?</strong>
        <p>
          El mapa de Karnaugh es una herramienta visual para simplificar funciones booleanas sin usar álgebra.
          Organizando los minterms en un cuadrícula con código Gray (donde celdas adyacentes difieren en un solo bit),
          los grupos de 1, 2, 4 u 8 celdas contiguas permiten cancelar variables y obtener la expresión mínima.
          Es especialmente útil en diseño de circuitos para reducir el número de puertas lógicas necesarias.
        </p>
        <p className={styles.faqTip}>Siempre agrupa potencias de 2: 1, 2, 4 u 8 celdas.</p>
      </li>
      <li className={styles.faqItem}>
        <strong>¿Qué es una tautología? ¿Y una contradicción?</strong>
        <p>
          Una <strong>tautología</strong> es una fórmula que es siempre verdadera independientemente de los valores de sus variables (ej.: P ∨ ¬P).
          Una <strong>contradicción</strong> (o antilogía) es siempre falsa (ej.: P ∧ ¬P).
          Cualquier otra fórmula que sea verdadera en algunos casos y falsa en otros se llama <strong>contingencia</strong>.
          Verificar si una fórmula es tautología es equivalente a comprobar si su negación es insatisfacible, un problema central en lógica y computación (SAT).
        </p>
        <p className={styles.faqTip}>Tautología → todas las filas de la tabla de verdad dan 1.</p>
      </li>
      <li className={styles.faqItem}>
        <strong>¿La lógica proposicional es lo mismo que la lógica del sentido común?</strong>
        <p>
          No exactamente. La lógica proposicional es formal y bivalente (solo admite Verdadero o Falso), mientras que el lenguaje natural es ambiguo y contextual.
          Por ejemplo, en el habla cotidiana «o uno o el otro» suele ser excluyente (XOR), pero «puedes pagar con tarjeta o en efectivo» es inclusivo (OR).
          Además, la implicación formal (→) se comporta de forma diferente a la causalidad natural: «Si la Luna es de queso, soy rico» es verdadera en lógica formal.
        </p>
        <p className={styles.faqTip}>La lógica formal es más estricta y menos ambigua que el lenguaje cotidiano.</p>
      </li>
      <li className={styles.faqItem}>
        <strong>¿Qué relación tiene con la programación?</strong>
        <p>
          Los conectores lógicos son la base de las condiciones en cualquier lenguaje de programación: <code>&&</code> (AND), <code>||</code> (OR), <code>!</code> (NOT).
          Las expresiones booleanas en if/while/for aplican exactamente las mismas reglas que las tablas de verdad.
          La evaluación en cortocircuito (<em>short-circuit evaluation</em>) que usan lenguajes como Python o JavaScript también es lógica proposicional optimizada.
        </p>
        <p className={styles.faqTip}>En Python: <code>and</code>/<code>or</code>/<code>not</code>. En C/Java: <code>&amp;&amp;</code>/<code>||</code>/<code>!</code>.</p>
      </li>
    </ul>

    {/* ── 4. Guía paso a paso ── */}
    <h3 className={styles.eduSectionTitle}>Cómo analizar cualquier fórmula lógica</h3>
    <ol className={styles.stepGuide}>
      <li className={styles.step}>
        <span className={styles.stepNumber}>1</span>
        <div className={styles.stepContent}>
          <strong>Identifica las variables y los conectores</strong>
          <p>Lee la fórmula y localiza las proposiciones atómicas (P, Q, R…) y los conectores que las unen (∧, ∨, ¬, →, ↔, ⊕). Anota cuántas variables distintas hay: con 2 variables hay 4 filas, con 3 hay 8, con n hay 2ⁿ.</p>
        </div>
      </li>
      <li className={styles.step}>
        <span className={styles.stepNumber}>2</span>
        <div className={styles.stepContent}>
          <strong>Construye la tabla de verdad con todas las combinaciones</strong>
          <p>Empieza asignando todas las combinaciones posibles de V/F a las variables. La primera columna alterna cada fila, la segunda cada dos filas, la tercera cada cuatro, etc. Añade columnas intermedias para subexpresiones complejas.</p>
        </div>
      </li>
      <li className={styles.step}>
        <span className={styles.stepNumber}>3</span>
        <div className={styles.stepContent}>
          <strong>Evalúa de dentro hacia fuera, respetando la precedencia</strong>
          <p>El orden de precedencia habitual es: ¬ (NOT) &gt; ∧ (AND) &gt; ∨ (OR) &gt; → (IMPL) &gt; ↔ (EQUIV). Evalúa primero las subexpresiones entre paréntesis, luego las negaciones, después las conjunciones, etc.</p>
        </div>
      </li>
      <li className={styles.step}>
        <span className={styles.stepNumber}>4</span>
        <div className={styles.stepContent}>
          <strong>Clasifica el resultado final</strong>
          <p>Si todas las filas dan 1 → tautología. Si todas dan 0 → contradicción. Si hay mezcla → contingencia. Esta clasificación determina si la fórmula es siempre cierta, siempre falsa, o depende del contexto.</p>
        </div>
      </li>
      <li className={styles.step}>
        <span className={styles.stepNumber}>5</span>
        <div className={styles.stepContent}>
          <strong>Simplifica si es necesario (Karnaugh o álgebra de Boole)</strong>
          <p>Si la fórmula proviene de un circuito o función booleana, usa el mapa de Karnaugh para obtener la expresión mínima equivalente. Agrupa los unos en el mapa en grupos de potencias de 2 lo más grandes posible.</p>
        </div>
      </li>
    </ol>

    {/* ── 5. Mejores prácticas ── */}
    <h3 className={styles.eduSectionTitle}>Consejos para dominar tablas de verdad y Karnaugh</h3>
    <div className={styles.tipsGrid}>
      <div className={styles.tipCard}>
        <span className={styles.tipIcon} aria-hidden="true">📐</span>
        <strong>Memoriza solo la implicación</strong>
        <p>AND, OR y NOT son intuitivos. El que más confunde es P→Q: recuerda que solo falla cuando «prometes algo (P=V) y no lo cumples (Q=F)».</p>
      </div>
      <div className={styles.tipCard}>
        <span className={styles.tipIcon} aria-hidden="true">🔢</span>
        <strong>Rellena las columnas de variables en binario</strong>
        <p>Para n variables, trata los índices de fila como números binarios: la variable más a la derecha alterna cada fila (bit menos significativo). Esto garantiza que no te olvidas ninguna combinación.</p>
      </div>
      <div className={styles.tipCard}>
        <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
        <strong>En Karnaugh, agrupa siempre el mayor grupo posible</strong>
        <p>Un grupo de 4 celdas elimina 2 variables; uno de 8 las elimina todas. Empieza por los grupos más grandes aunque se solapen; los solapamientos son válidos y ayudan a simplificar.</p>
      </div>
      <div className={styles.tipCard}>
        <span className={styles.tipIcon} aria-hidden="true">🔄</span>
        <strong>Las celdas del borde se tocan</strong>
        <p>El mapa de Karnaugh es toroidal: la primera columna y la última son adyacentes (igual que la primera y la última fila). No ignores esos grupos que «cruzan el borde».</p>
      </div>
      <div className={styles.tipCard}>
        <span className={styles.tipIcon} aria-hidden="true">✅</span>
        <strong>Verifica con un caso concreto</strong>
        <p>Tras simplificar, sustituye un conjunto de valores en la expresión original y en la simplificada. Si el resultado coincide en varios casos, la simplificación probablemente es correcta.</p>
      </div>
    </div>

    {/* ── 6. Warning box — errores comunes ── */}
    <div className={styles.warningBoxEdu}>
      <strong>Errores frecuentes al trabajar con lógica proposicional</strong>
      <ul>
        <li><strong>Confundir OR con XOR:</strong> en lógica formal, OR es inclusivo (V∨V = V). Si necesitas «uno u otro pero no los dos», debes usar XOR explícitamente.</li>
        <li><strong>Dar la implicación por intuitiva:</strong> muchos estudiantes asumen que P→Q es falsa cuando P=F, pero es verdadera. Solo falla cuando P=V y Q=F.</li>
        <li><strong>Olvidar agrupar celdas que cruzan el borde en Karnaugh:</strong> el mapa es toroidal; ignorar esos grupos produce expresiones no minimizadas.</li>
        <li><strong>No respetar la precedencia de operadores:</strong> ¬ se aplica antes que ∧, que se aplica antes que ∨. Sin paréntesis, «¬P ∧ Q» es «(¬P) ∧ Q», no «¬(P ∧ Q)».</li>
        <li><strong>Mezclar notaciones distintas:</strong> ∧/AND/&amp;&amp;, ∨/OR/||, ¬/NOT/! son equivalentes según el contexto (matemático, lógico, informático). Usar la misma notación dentro de un mismo ejercicio evita confusiones.</li>
      </ul>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorLogicaProposicional() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('conectores');
  const [valorP, setValorP] = useState(true);
  const [valorQ, setValorQ] = useState(false);
  const [valorR, setValorR] = useState(true);
  const [conectorSeleccionado, setConectorSeleccionado] = useState<Conector>('AND');

  const toggleP = useCallback(() => setValorP(v => !v), []);
  const toggleQ = useCallback(() => setValorQ(v => !v), []);
  const toggleR = useCallback(() => setValorR(v => !v), []);

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'conectores', label: 'Conectores' },
    { id: 'evaluador', label: 'Evaluador' },
    { id: 'karnaugh', label: 'Karnaugh' },
    { id: 'formas', label: 'Formas Normales' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Lógica Proposicional</h1>
        <p className={styles.heroSubtitle}>
          Tablas de verdad, evaluador de fórmulas, mapas de Karnaugh y formas normales FNC/FND
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Pestañas */}
        <nav className={styles.tabNav} aria-label="Secciones del visualizador">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-current={tabActiva === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Contenido de cada pestaña */}
        {tabActiva === 'conectores' && (
          <TabConectores
            valorP={valorP}
            valorQ={valorQ}
            setValorP={toggleP}
            setValorQ={toggleQ}
            conectorSeleccionado={conectorSeleccionado}
            setConectorSeleccionado={setConectorSeleccionado}
          />
        )}
        {tabActiva === 'evaluador' && (
          <TabEvaluador
            valorP={valorP}
            valorQ={valorQ}
            valorR={valorR}
            setValorP={toggleP}
            setValorQ={toggleQ}
            setValorR={toggleR}
          />
        )}
        {tabActiva === 'karnaugh' && <TabKarnaugh />}
        {tabActiva === 'formas' && <TabFormasNormales />}

        {/* Sección educativa */}
        <EducationalSection
          title="Fundamentos de la lógica proposicional"
          subtitle="Conectores lógicos, tablas de verdad, mapas de Karnaugh y formas normales"
        >
          {contenidoEducativo}
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('visualizador-logica-proposicional')} />
      <ShareCard appName="visualizador-logica-proposicional" />
      <Footer appName="visualizador-logica-proposicional" />
    </div>
  );
}
