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
  DisclaimerCard,
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
        <h1 className={styles.heroTitle}><span aria-hidden="true">🏘️</span> Estimador Gastos de Comunidad</h1>
        <p className={styles.heroSubtitle}>
          Reparte los gastos de tu comunidad de propietarios de forma justa. Por partes iguales o según coeficiente de participación.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={false}
      />

      {/* SELECTOR DE MODO */}
      <div className={styles.modeTabs} role="tablist" aria-label="Modo de reparto">
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'igual'}
          className={`${styles.modeTab} ${modo === 'igual' ? styles.active : ''}`}
          onClick={() => setModo('igual')}
        >
          <span aria-hidden="true">⚖️</span> Partes iguales
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'coeficiente'}
          className={`${styles.modeTab} ${modo === 'coeficiente' ? styles.active : ''}`}
          onClick={() => setModo('coeficiente')}
        >
          <span aria-hidden="true">📐</span> Por coeficiente
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
                    type="button"
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
        <button type="button" onClick={addVecino} className={styles.btnAddVecino} aria-label="Añadir propietario">
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
                    type="button"
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
        <button type="button" onClick={addConcepto} className={styles.btnAddVecino} aria-label="Añadir concepto de gasto">
          <span aria-hidden="true">+</span> Añadir concepto
        </button>
      </section>

      {/* BOTÓN CALCULAR */}
      <div className={styles.btnWrapper}>
        <button type="button" onClick={calcular} className={styles.btnCalcular} aria-label="Calcular reparto de gastos">
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

        {/* ===== TABLA COMPARATIVA ===== */}
        <section>
          <h2>Tabla comparativa de gastos comunitarios</h2>
          <p>Referencia orientativa de los principales gastos en comunidades de propietarios en España:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de gasto</th>
                  <th>Coste medio/piso/mes</th>
                  <th>Obligatorio por ley</th>
                  <th>Quién lo decide</th>
                  <th>Cómo se reparte</th>
                  <th>Deducible en alquiler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Portería / Conserjería</strong></td>
                  <td>25 – 80 €</td>
                  <td>No</td>
                  <td>Junta de propietarios</td>
                  <td>Por coeficiente</td>
                  <td>Sí (proporcional)</td>
                </tr>
                <tr>
                  <td><strong>Ascensor (mantenimiento)</strong></td>
                  <td>8 – 20 €</td>
                  <td>Sí (si existe)</td>
                  <td>Obligatorio por normativa</td>
                  <td>Por coeficiente</td>
                  <td>Sí (proporcional)</td>
                </tr>
                <tr>
                  <td><strong>Jardinería</strong></td>
                  <td>5 – 25 €</td>
                  <td>No</td>
                  <td>Junta de propietarios</td>
                  <td>Por coeficiente</td>
                  <td>Sí (proporcional)</td>
                </tr>
                <tr>
                  <td><strong>Limpieza zonas comunes</strong></td>
                  <td>10 – 30 €</td>
                  <td>No (recomendado)</td>
                  <td>Junta de propietarios</td>
                  <td>Por coeficiente o igual</td>
                  <td>Sí (proporcional)</td>
                </tr>
                <tr>
                  <td><strong>Seguro del edificio</strong></td>
                  <td>5 – 15 €</td>
                  <td>Sí (LPH)</td>
                  <td>Presidente / Junta</td>
                  <td>Por coeficiente</td>
                  <td>Sí (proporcional)</td>
                </tr>
                <tr>
                  <td><strong>Suministros comunes</strong></td>
                  <td>3 – 12 €</td>
                  <td>Sí (indirectamente)</td>
                  <td>Contratos colectivos</td>
                  <td>Por coeficiente</td>
                  <td>Sí (proporcional)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== CASOS DE USO ===== */}
        <section>
          <h2>¿Quién usa este estimador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Propietario nuevo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres comprar un piso y necesitas saber cuánto pagarás de comunidad al mes antes de decidir.
              </p>
              <p className={styles.escenarioTip}>
                Solicita el presupuesto anual de la comunidad y tu coeficiente de participación para obtener una cifra exacta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📋</span>
                <strong>Presidente de comunidad</strong>
              </div>
              <p className={styles.escenarioExample}>
                Gestionas el presupuesto anual y necesitas repartir los gastos de forma transparente entre todos los vecinos.
              </p>
              <p className={styles.escenarioTip}>
                Usa el modo «por coeficiente» para respetar la Ley de Propiedad Horizontal y evitar impugnaciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📄</span>
                <strong>Propietario arrendador</strong>
              </div>
              <p className={styles.escenarioExample}>
                Alquilas tu piso y quieres saber qué gastos de comunidad puedes deducir en la declaración de IRPF.
              </p>
              <p className={styles.escenarioTip}>
                Los gastos de comunidad son deducibles íntegramente cuando el inmueble está arrendado (rendimientos de capital inmobiliario).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔧</span>
                <strong>Comunidad con derramas</strong>
              </div>
              <p className={styles.escenarioExample}>
                La comunidad afronta una obra grande (ascensor nuevo, fachada) y necesita calcular cuánto paga cada vecino.
              </p>
              <p className={styles.escenarioTip}>
                Añade la derrama como un concepto de gasto extraordinario y elige si pagarla de una vez o fraccionarla mensualmente.
              </p>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Cómo se calcula el coeficiente de participación?</strong>
              <p>Se fija en la escritura de división horizontal y figura en el Registro de la Propiedad. Tiene en cuenta la superficie útil de la vivienda, su situación en el edificio (planta, orientación) y el uso que se le dará. La suma de todos los coeficientes debe ser 100.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puede la comunidad subir la cuota sin mi acuerdo?</strong>
              <p>Sí. Las cuotas se aprueban en junta por mayoría simple (más de la mitad de los propietarios y cuotas). Si votas en contra o estás ausente pero en desacuerdo, puedes impugnar el acuerdo judicialmente en un plazo de tres meses.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa si no pago las cuotas de comunidad?</strong>
              <p>La comunidad puede reclamarte la deuda mediante el procedimiento monitorio, que permite obtener una orden de pago rápida. Si persistes en el impago, pueden embargarte bienes. Además, la deuda queda afecta al inmueble durante tres años para el comprador.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué gastos puede deducir el propietario que alquila?</strong>
              <p>Todos los gastos de comunidad satisfechos durante el período de alquiler son deducibles como gasto necesario en el IRPF (rendimientos de capital inmobiliario), incluidas las derramas destinadas a conservación o reparación (no las de mejora).</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Quién paga los gastos si el piso está vacío?</strong>
              <p>El propietario siempre. La obligación de pagar los gastos de comunidad no depende de si el inmueble está habitado o arrendado. El dueño responde frente a la comunidad independientemente del uso que dé a la vivienda.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el fondo de reserva y es obligatorio?</strong>
              <p>Es una dotación económica que la comunidad debe mantener para hacer frente a obras urgentes o gastos imprevistos. La Ley de Propiedad Horizontal obliga a que sea de al menos el 10% del último presupuesto ordinario aprobado.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Pueden obligarme a pagar una derrama para obras que no quiero?</strong>
              <p>Sí, si la junta lo aprueba con la mayoría necesaria. Sin embargo, si la derrama supera tres mensualidades de cuota ordinaria y no es para obras de conservación obligatoria, los propietarios disidentes pueden renunciar al uso de la mejora y quedar exentos de pago.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué mayoría se necesita para aprobar una derrama?</strong>
              <p>Para obras de conservación o reparación necesarias: mayoría simple. Para obras de mejora no obligatorias: mayoría de 3/5 de propietarios y cuotas. Para obras que modifiquen la estructura o alteren el título constitutivo: unanimidad.</p>
              <p className={styles.faqTip}>Consulta siempre el artículo 17 de la Ley de Propiedad Horizontal para el tipo de mayoría exigida según la obra.</p>
            </div>
          </div>
        </section>

        {/* ===== GUÍA PASO A PASO ===== */}
        <section>
          <h2>Cómo calcular tu cuota paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <strong>Solicita los estatutos y el presupuesto anual</strong>
                <p>Pide al administrador de fincas o al presidente el presupuesto aprobado en la última junta ordinaria y los estatutos de la comunidad. Ahí figuran los importes reales de cada partida.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <strong>Calcula el coeficiente de participación de tu piso</strong>
                <p>Encuéntralo en tu escritura de propiedad o en el Registro de la Propiedad. Se expresa como porcentaje del total del edificio (la suma de todos los coeficientes es 100).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <strong>Revisa el desglose de gastos ordinarios</strong>
                <p>Identifica los conceptos del presupuesto: portería, limpieza, ascensor, seguro, suministros, administración… e introduce cada uno en el estimador.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <strong>Consulta el fondo de reserva disponible</strong>
                <p>Verifica el saldo actual del fondo de reserva. Si es inferior al 10% del presupuesto, la comunidad puede estar obligada a dotar más en los próximos ejercicios, lo que subirá las cuotas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <strong>Verifica si hay derramas pendientes o previstas</strong>
                <p>Pregunta expresamente si existen obras aprobadas o en estudio que puedan generar una derrama en los próximos 1-2 años. Este dato es crítico antes de comprar un inmueble.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu cuota mensual estimada</strong>
                <p>Introduce los datos en el estimador y selecciona el modo de reparto (partes iguales o por coeficiente) que aplique tu comunidad. Obtendrás el importe mensual y anual de tu piso.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">7</div>
              <div className={styles.stepContent}>
                <strong>Comprueba las posibles deducciones si alquilas</strong>
                <p>Si el inmueble está arrendado, guarda los recibos de la comunidad durante el año para incluirlos como gastos deducibles en tu declaración de IRPF (rendimientos de capital inmobiliario).</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MEJORES PRÁCTICAS ===== */}
        <section>
          <h2>Buenas prácticas para propietarios</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗳️</span>
              <strong>Asiste a las juntas o delega tu voto</strong>
              <p>Tu participación es fundamental para aprobar o rechazar gastos. Si no puedes asistir, otorga tu representación por escrito a otro propietario.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Revisa las cuentas anuales</strong>
              <p>Tienes derecho a examinar la contabilidad de la comunidad en cualquier momento. Solicita el balance anual y compara con el presupuesto aprobado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <strong>Pide 3 presupuestos para obras</strong>
              <p>La Ley de Propiedad Horizontal recomienda obtener varios presupuestos antes de contratar obras importantes. Es una garantía de transparencia y precio justo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏦</span>
              <strong>Mantén el fondo de reserva al 10% mínimo</strong>
              <p>Un fondo de reserva adecuado evita derramas urgentes y da solvencia a la comunidad. Es obligatorio por la Ley de Propiedad Horizontal y protege a todos los vecinos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <strong>Guarda todas las actas de junta</strong>
              <p>Las actas son el único registro legal de los acuerdos adoptados. Consérvalasen un lugar seguro; te serán imprescindibles si necesitas impugnar un acuerdo o acreditar pagos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <strong>Comprueba la cobertura del seguro comunitario</strong>
              <p>Verifica que el seguro del edificio cubre el continente (estructura, instalaciones) y que el capital asegurado está actualizado. Consulta si cubre también responsabilidad civil de la comunidad.</p>
            </div>
          </div>
        </section>

        {/* ===== WARNING BOX ===== */}
        <div className={styles.warningBox} role="alert">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes que debes evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No pedir información sobre derramas pendientes antes de comprar un piso: el comprador puede heredar deudas de hasta tres años.</li>
            <li>No asistir a juntas ni delegar el voto, perdiendo el derecho a impugnar acuerdos que te perjudiquen.</li>
            <li>Confundir gastos generales de comunidad con derramas al cumplimentar la declaración de IRPF (tienen tratamiento fiscal diferente).</li>
            <li>No reclamar por escrito si la comunidad adopta un acuerdo que crees ilegal: el plazo para impugnar es de tres meses y solo tres.</li>
            <li>Pagar cuotas de comunidad en efectivo sin solicitar recibo: en caso de disputa no tendrás justificante de pago.</li>
            <li>No comprobar si el vendedor dejó deudas pendientes con la comunidad: según la LPH, el nuevo propietario responde de las deudas de los últimos tres años anteriores a la transmisión.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-gastos-comunidad')} />

      <ShareCard appName="estimador-gastos-comunidad" />
      <Footer appName="estimador-gastos-comunidad" />
    </div>
  );
}
