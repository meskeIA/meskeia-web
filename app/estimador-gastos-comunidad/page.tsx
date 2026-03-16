'use client';

import { useState } from 'react';
import styles from './EstimadorGastosComunidad.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber } from '@/lib';

// ===== TIPOS =====
type ModoReparto = 'igual' | 'coeficiente';

interface Vecino {
  id: number;
  nombre: string;
  coeficiente: number; // Solo usado en modo coeficiente
}

interface VecinoResultado extends Vecino {
  cuotaMensual: number;
  cuotaAnual: number;
  porcentajeReal: number;
}

interface ConceptoGasto {
  id: number;
  nombre: string;
  importeAnual: number;
}

// ===== HELPERS =====
function calcularReparto(
  vecinos: Vecino[],
  conceptos: ConceptoGasto[],
  modo: ModoReparto
): { vecinos: VecinoResultado[]; totalAnual: number; totalMensual: number } {
  const totalAnual = conceptos.reduce((sum, c) => sum + c.importeAnual, 0);
  const totalMensual = totalAnual / 12;

  const totalCoeficiente = vecinos.reduce((sum, v) => sum + v.coeficiente, 0);

  const vecinosResultado: VecinoResultado[] = vecinos.map(v => {
    let porcentajeReal: number;

    if (modo === 'igual') {
      porcentajeReal = vecinos.length > 0 ? 100 / vecinos.length : 0;
    } else {
      porcentajeReal = totalCoeficiente > 0 ? (v.coeficiente / totalCoeficiente) * 100 : 0;
    }

    const cuotaAnual = totalAnual * (porcentajeReal / 100);
    const cuotaMensual = cuotaAnual / 12;

    return { ...v, cuotaMensual, cuotaAnual, porcentajeReal };
  });

  return { vecinos: vecinosResultado, totalAnual, totalMensual };
}

let nextId = 1;
function nuevoId(): number {
  return nextId++;
}

export default function CalculadoraGastosComunidadPage() {
  const [modo, setModo] = useState<ModoReparto>('igual');

  // Vecinos
  const [vecinos, setVecinos] = useState<Vecino[]>([
    { id: nuevoId(), nombre: 'Piso 1A', coeficiente: 10 },
    { id: nuevoId(), nombre: 'Piso 1B', coeficiente: 10 },
    { id: nuevoId(), nombre: 'Piso 2A', coeficiente: 12 },
    { id: nuevoId(), nombre: 'Piso 2B', coeficiente: 8 },
  ]);

  // Conceptos de gasto
  const [conceptos, setConceptos] = useState<ConceptoGasto[]>([
    { id: nuevoId(), nombre: 'Portero / Limpieza', importeAnual: 3600 },
    { id: nuevoId(), nombre: 'Seguro del edificio', importeAnual: 800 },
    { id: nuevoId(), nombre: 'Mantenimiento ascensor', importeAnual: 1200 },
    { id: nuevoId(), nombre: 'Suministros (luz, agua zonas comunes)', importeAnual: 600 },
  ]);

  const [resultado, setResultado] = useState<{
    vecinos: VecinoResultado[];
    totalAnual: number;
    totalMensual: number;
  } | null>(null);

  // ===== GESTIÓN VECINOS =====
  const addVecino = () => {
    setVecinos(prev => [
      ...prev,
      { id: nuevoId(), nombre: `Piso ${prev.length + 1}`, coeficiente: 10 },
    ]);
  };

  const removeVecino = (id: number) => {
    setVecinos(prev => prev.filter(v => v.id !== id));
  };

  const updateVecino = (id: number, field: keyof Vecino, value: string) => {
    setVecinos(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, [field]: field === 'coeficiente' ? parseFloat(value.replace(',', '.')) || 0 : value }
          : v
      )
    );
  };

  // ===== GESTIÓN CONCEPTOS =====
  const addConcepto = () => {
    setConceptos(prev => [
      ...prev,
      { id: nuevoId(), nombre: 'Nuevo concepto', importeAnual: 0 },
    ]);
  };

  const removeConcepto = (id: number) => {
    setConceptos(prev => prev.filter(c => c.id !== id));
  };

  const updateConcepto = (id: number, field: keyof ConceptoGasto, value: string) => {
    setConceptos(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              [field]: field === 'importeAnual'
                ? parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
                : value,
            }
          : c
      )
    );
  };

  const calcular = () => {
    const res = calcularReparto(vecinos, conceptos, modo);
    setResultado(res);
  };

  const totalCoeficientes = vecinos.reduce((sum, v) => sum + v.coeficiente, 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🏘️ Estimador Gastos de Comunidad</h1>
        <p className={styles.heroSubtitle}>
          Reparte los gastos de tu comunidad de propietarios de forma justa. Por partes iguales o según coeficiente de participación.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE MODO */}
      <div className={styles.modeTabs} role="tablist" aria-label="Modo de reparto">
        <button
          role="tab"
          aria-selected={modo === 'igual'}
          className={`${styles.modeTab} ${modo === 'igual' ? styles.active : ''}`}
          onClick={() => setModo('igual')}
        >
          ⚖️ Partes iguales
        </button>
        <button
          role="tab"
          aria-selected={modo === 'coeficiente'}
          className={`${styles.modeTab} ${modo === 'coeficiente' ? styles.active : ''}`}
          onClick={() => setModo('coeficiente')}
        >
          📐 Por coeficiente
        </button>
      </div>

      {/* SECCIÓN VECINOS */}
      <section className={styles.formSection} aria-labelledby="sec-vecinos">
        <h2 className={styles.sectionTitle} id="sec-vecinos">
          <span aria-hidden="true">🏠</span> Propietarios / Viviendas
          {modo === 'coeficiente' && (
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              Total coeficientes: {formatNumber(totalCoeficientes, 2)}%
            </span>
          )}
        </h2>
        <table className={styles.vecinosTable} aria-label="Lista de propietarios">
          <thead>
            <tr>
              <th>Propietario / Vivienda</th>
              {modo === 'coeficiente' && <th>Coeficiente (%)</th>}
              <th aria-label="Eliminar">–</th>
            </tr>
          </thead>
          <tbody>
            {vecinos.map((v, idx) => (
              <tr key={v.id}>
                <td>
                  <input
                    type="text"
                    value={v.nombre}
                    onChange={e => updateVecino(v.id, 'nombre', e.target.value)}
                    className={styles.vecinoInput}
                    aria-label={`Nombre del propietario ${idx + 1}`}
                  />
                </td>
                {modo === 'coeficiente' && (
                  <td>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={v.coeficiente}
                      onChange={e => updateVecino(v.id, 'coeficiente', e.target.value)}
                      className={styles.vecinoInput}
                      aria-label={`Coeficiente del propietario ${idx + 1}`}
                      style={{ maxWidth: '80px' }}
                    />
                  </td>
                )}
                <td>
                  <button
                    onClick={() => removeVecino(v.id)}
                    className={styles.btnRemove}
                    aria-label={`Eliminar ${v.nombre}`}
                    disabled={vecinos.length <= 2}
                    title={vecinos.length <= 2 ? 'Mínimo 2 propietarios' : ''}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addVecino} className={styles.btnAddVecino} aria-label="Añadir propietario">
          <span aria-hidden="true">+</span> Añadir propietario
        </button>
      </section>

      {/* SECCIÓN GASTOS */}
      <section className={styles.formSection} aria-labelledby="sec-gastos">
        <h2 className={styles.sectionTitle} id="sec-gastos">
          <span aria-hidden="true">💶</span> Conceptos de gasto anuales
        </h2>
        <table className={styles.vecinosTable} aria-label="Conceptos de gasto">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Importe anual (€)</th>
              <th aria-label="Eliminar">–</th>
            </tr>
          </thead>
          <tbody>
            {conceptos.map((c, idx) => (
              <tr key={c.id}>
                <td>
                  <input
                    type="text"
                    value={c.nombre}
                    onChange={e => updateConcepto(c.id, 'nombre', e.target.value)}
                    className={styles.vecinoInput}
                    aria-label={`Nombre del concepto ${idx + 1}`}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={c.importeAnual}
                    onChange={e => updateConcepto(c.id, 'importeAnual', e.target.value)}
                    className={styles.vecinoInput}
                    aria-label={`Importe anual del concepto ${idx + 1}`}
                    style={{ maxWidth: '120px' }}
                  />
                </td>
                <td>
                  <button
                    onClick={() => removeConcepto(c.id)}
                    className={styles.btnRemove}
                    aria-label={`Eliminar ${c.nombre}`}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addConcepto} className={styles.btnAddVecino} aria-label="Añadir concepto de gasto">
          <span aria-hidden="true">+</span> Añadir concepto
        </button>
      </section>

      {/* BOTÓN CALCULAR */}
      <div className={styles.btnWrapper}>
        <button onClick={calcular} className={styles.btnCalcular} aria-label="Calcular reparto de gastos">
          Calcular reparto
        </button>
      </div>

      {/* RESULTADOS */}
      {resultado && (
        <section className={styles.resultsSection} aria-live="polite" aria-label="Resultados del reparto">
          {/* Resumen */}
          <div className={styles.resumenGrid}>
            <div className={`${styles.resumenCard} ${styles.highlight}`}>
              <span className={styles.resumenIcon} aria-hidden="true">💶</span>
              <div className={styles.resumenLabel}>Total anual comunidad</div>
              <div className={styles.resumenValue}>{formatCurrency(resultado.totalAnual)}</div>
              <div className={styles.resumenSub}>Todos los conceptos</div>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcon} aria-hidden="true">📅</span>
              <div className={styles.resumenLabel}>Total mensual comunidad</div>
              <div className={styles.resumenValue}>{formatCurrency(resultado.totalMensual)}</div>
              <div className={styles.resumenSub}>Presupuesto mensual</div>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcon} aria-hidden="true">🏠</span>
              <div className={styles.resumenLabel}>Número de propietarios</div>
              <div className={styles.resumenValue}>{resultado.vecinos.length}</div>
              <div className={styles.resumenSub}>
                {modo === 'igual' ? 'Reparto equitativo' : 'Por coeficiente'}
              </div>
            </div>
          </div>

          {/* Tabla de reparto */}
          <div className={styles.resultTable} role="table" aria-label="Reparto de gastos por propietario">
            <div className={styles.resultTableHeader} role="row">
              <span role="columnheader">Propietario</span>
              <span role="columnheader" style={{ textAlign: 'right' }}>% cuota</span>
              <span role="columnheader" style={{ textAlign: 'right' }}>Mensual</span>
              <span role="columnheader" style={{ textAlign: 'right' }}>Anual</span>
            </div>
            {resultado.vecinos.map(v => (
              <div key={v.id} className={styles.resultTableRow} role="row">
                <span className={styles.colName} role="cell">{v.nombre}</span>
                <span className={styles.colValue} role="cell">{formatNumber(v.porcentajeReal, 2)}%</span>
                <span className={styles.colCuota} role="cell">{formatCurrency(v.cuotaMensual)}</span>
                <span className={styles.colValue} role="cell">{formatCurrency(v.cuotaAnual)}</span>
              </div>
            ))}
            <div className={`${styles.resultTableRow} ${styles.total}`} role="row">
              <span className={styles.colName} role="cell">TOTAL</span>
              <span className={styles.colValue} role="cell">100%</span>
              <span className={styles.colCuota} role="cell">{formatCurrency(resultado.totalMensual)}</span>
              <span className={styles.colValue} role="cell">{formatCurrency(resultado.totalAnual)}</span>
            </div>
          </div>
        </section>
      )}

      {/* CONTENIDO EDUCATIVO */}
      <EducationalSection
        title="📚 Guía de gastos de comunidad"
        subtitle="Todo lo que necesitas saber como propietario"
      >
        <section>
          <h2>¿Qué son los gastos de comunidad?</h2>
          <p>
            Los gastos de comunidad son los costes compartidos entre todos los propietarios de un edificio o urbanización para el mantenimiento y funcionamiento de las zonas comunes. Están regulados por la <strong>Ley de Propiedad Horizontal (LPH)</strong>.
          </p>

          <h2>¿Cómo se reparten los gastos?</h2>
          <p>
            Según la LPH, los gastos generales se reparten entre los propietarios según el <strong>coeficiente de participación</strong> de cada vivienda o local, salvo que los estatutos de la comunidad establezcan otro sistema (como partes iguales).
          </p>
          <p>
            El coeficiente de participación aparece en la escritura de división horizontal y está en el Registro de la Propiedad. Suele expresarse como porcentaje y tiene en cuenta la superficie, situación y uso del inmueble.
          </p>

          <h2>Gastos más habituales en una comunidad</h2>
          <ul>
            <li><strong>Portero/Conserje</strong>: En comunidades grandes, puede suponer el mayor gasto.</li>
            <li><strong>Limpieza de zonas comunes</strong>: Escaleras, portal, garaje, jardines.</li>
            <li><strong>Mantenimiento del ascensor</strong>: Contrato de mantenimiento obligatorio.</li>
            <li><strong>Seguro del edificio</strong>: Obligatorio. Cubre el continente (estructura) del edificio.</li>
            <li><strong>Suministros</strong>: Luz y agua de zonas comunes (portal, escalera, garaje).</li>
            <li><strong>Administrador de fincas</strong>: Gestión contable y legal de la comunidad.</li>
            <li><strong>Fondo de reserva</strong>: Obligatorio por ley, mínimo el 10% del presupuesto anual.</li>
            <li><strong>Derramas extraordinarias</strong>: Obras o reparaciones no previstas.</li>
          </ul>

          <h2>¿Qué es una derrama?</h2>
          <p>
            Una <strong>derrama</strong> es un pago extraordinario que se cobra a los propietarios para afrontar gastos no previstos o que superan el fondo de reserva: reparación del tejado, sustitución del ascensor, rehabilitación de fachada...
          </p>
          <p>
            Las derramas también se reparten según el coeficiente de participación. Pueden pagarse de una sola vez o en plazos, según acuerdo de la junta.
          </p>

          <h2>¿Qué pasa si un vecino no paga?</h2>
          <p>
            Los propietarios que no pagan las cuotas de comunidad son <strong>morosos</strong>. La comunidad puede reclamarles la deuda por vía judicial (juicio monitorio). Además, en la escritura de compraventa, el nuevo propietario responde de las deudas con la comunidad de los últimos 3 años.
          </p>

          <h2>Consejos para gestionar la comunidad</h2>
          <ul>
            <li>Mantén un <strong>fondo de reserva</strong> adecuado para evitar derramas sorpresa.</li>
            <li>Aprueba el presupuesto anual en la junta ordinaria y repártelo entre los propietarios.</li>
            <li>Contrata un <strong>administrador de fincas</strong> colegiado si la comunidad es grande.</li>
            <li>Lleva un registro de actas y cuentas actualizado.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-gastos-comunidad')} />

      <ShareCard appName="estimador-gastos-comunidad" />
      <Footer appName="estimador-gastos-comunidad" />
    </div>
  );
}
