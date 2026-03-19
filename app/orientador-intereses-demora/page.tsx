'use client';

import { useState } from 'react';
import styles from './OrientadorInteresesDemora.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  NumberInput,
  ResultCard,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  TIPOS_DEMORA_COMERCIAL,
  INTERES_LEGAL_DINERO_2025,
  FISCAL_INTERESES_META,
  getTipoDemoraComercialParaFecha,
  PLAZOS_RECLAMACION_COMERCIAL,
} from '@/data/fiscal';

type TipoDeuda = 'comercial' | 'civil';

interface Resultado {
  diasDemora: number;
  tipoInteres: number;
  tipoLabel: string;
  base: string;
  intereses: number;
  totalReclamar: number;
  semestre?: string;
}

const hoy = (): string => {
  const d = new Date();
  return d.toISOString().substring(0, 10);
};

const ayer = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().substring(0, 10);
};

export default function OrientadorInteresesDemoraPage() {
  const [importe, setImporte] = useState('');
  const [tipoDeuda, setTipoDeuda] = useState<TipoDeuda>('comercial');
  const [fechaInicio, setFechaInicio] = useState(ayer());
  const [fechaFin, setFechaFin] = useState(hoy());

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const calcular = () => {
    const nuevosErrores: string[] = [];

    const importeNum = parseSpanishNumber(importe);
    if (!importe || isNaN(importeNum) || importeNum <= 0) {
      nuevosErrores.push('Introduce el importe de la deuda (mayor que 0).');
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (!fechaInicio) {
      nuevosErrores.push('Indica la fecha de inicio de la demora.');
    }
    if (!fechaFin) {
      nuevosErrores.push('Indica la fecha fin del cálculo.');
    }
    if (fechaInicio && fechaFin && fin <= inicio) {
      nuevosErrores.push('La fecha fin debe ser posterior a la fecha de inicio.');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);
      return;
    }

    setErrores([]);

    const diasDemora = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    let tipoInteres: number;
    let tipoLabel: string;
    let base: string;
    let semestre: string | undefined;

    if (tipoDeuda === 'comercial') {
      const tipoCom = getTipoDemoraComercialParaFecha(inicio);
      tipoInteres = tipoCom.tipoTotal;
      tipoLabel = `${formatNumber(tipoCom.tipoTotal, 2)}% anual`;
      base = `BCE (${formatNumber(tipoCom.tipoBCE, 2)}%) + 8 pp — ${tipoCom.semestre}`;
      semestre = tipoCom.semestre;
    } else {
      tipoInteres = INTERES_LEGAL_DINERO_2025.tipo;
      tipoLabel = `${formatNumber(tipoInteres, 2)}% anual`;
      base = INTERES_LEGAL_DINERO_2025.base;
    }

    // Intereses = Importe × (tipo / 100) × (días / 365)
    const intereses = importeNum * (tipoInteres / 100) * (diasDemora / 365);
    const totalReclamar = importeNum + intereses;

    setResultado({
      diasDemora,
      tipoInteres,
      tipoLabel,
      base,
      intereses,
      totalReclamar,
      semestre,
    });
  };

  const resetear = () => {
    setImporte('');
    setTipoDeuda('comercial');
    setFechaInicio(ayer());
    setFechaFin(hoy());
    setResultado(null);
    setErrores([]);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>📄</div>
        <h1 className={styles.title}>Orientador de Intereses de Demora</h1>
        <p className={styles.subtitle}>
          Estima orientativamente los intereses que puedes reclamar por facturas impagadas o deudas vencidas.<br />
          Interés comercial (Ley 3/2004) e interés legal (Código Civil).
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>

        {/* Panel de datos */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📋 Datos de la deuda</h2>

          <NumberInput
            value={importe}
            onChange={setImporte}
            label="Importe de la deuda (€)"
            placeholder="5000"
            helperText="Importe principal pendiente, sin incluir intereses"
            min={0}
          />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tipo de deuda</label>
            <div className={styles.tipoSelector}>
              <button
                type="button"
                className={`${styles.tipoBtn} ${tipoDeuda === 'comercial' ? styles.tipoBtnActive : ''}`}
                onClick={() => setTipoDeuda('comercial')}
                aria-pressed={tipoDeuda === 'comercial' ? 'true' : 'false'}
              >
                <span className={styles.tipoBtnIcon}>🤝</span>
                <div>
                  <strong>Comercial</strong>
                  <span className={styles.tipoBtnDesc}>Entre empresas o autónomos (Ley 3/2004)</span>
                </div>
              </button>
              <button
                type="button"
                className={`${styles.tipoBtn} ${tipoDeuda === 'civil' ? styles.tipoBtnActive : ''}`}
                onClick={() => setTipoDeuda('civil')}
                aria-pressed={tipoDeuda === 'civil' ? 'true' : 'false'}
              >
                <span className={styles.tipoBtnIcon}>⚖️</span>
                <div>
                  <strong>Civil / General</strong>
                  <span className={styles.tipoBtnDesc}>Préstamos, arrendamientos, etc. (art. 1108 CC)</span>
                </div>
              </button>
            </div>
            {tipoDeuda === 'comercial' && (
              <p className={styles.helperText}>
                Tipo actual: <strong>{formatNumber(TIPOS_DEMORA_COMERCIAL[0].tipoTotal, 2)}%</strong> anual
                ({TIPOS_DEMORA_COMERCIAL[0].semestre})
              </p>
            )}
            {tipoDeuda === 'civil' && (
              <p className={styles.helperText}>
                Tipo actual: <strong>{formatNumber(INTERES_LEGAL_DINERO_2025.tipo, 2)}%</strong> anual
                (interés legal del dinero 2025)
              </p>
            )}
          </div>

          <div className={styles.fechasRow}>
            <div className={styles.fechaGroup}>
              <label htmlFor="fecha-inicio" className={styles.label}>
                Fecha de inicio de la demora
              </label>
              <input
                id="fecha-inicio"
                type="date"
                className={styles.inputDate}
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                aria-label="Fecha desde la que se devengan intereses"
              />
              <p className={styles.helperText}>Día siguiente al vencimiento de la factura o deuda</p>
            </div>

            <div className={styles.fechaGroup}>
              <label htmlFor="fecha-fin" className={styles.label}>
                Fecha fin del cálculo
              </label>
              <input
                id="fecha-fin"
                type="date"
                className={styles.inputDate}
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                aria-label="Fecha hasta la que calcular los intereses"
              />
              <p className={styles.helperText}>Fecha del cálculo (normalmente hoy)</p>
            </div>
          </div>

          {errores.length > 0 && (
            <div className={styles.errores} role="alert">
              {errores.map((e, i) => (
                <p key={i} className={styles.errorItem}>⚠️ {e}</p>
              ))}
            </div>
          )}

          <div className={styles.btnRow}>
            <button
              type="button"
              onClick={calcular}
              className={styles.btnPrimary}
              aria-label="Calcular intereses orientativos"
            >
              Obtener orientación
            </button>
            {resultado && (
              <button type="button" onClick={resetear} className={styles.btnSecondary} aria-label="Reiniciar formulario">
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Panel de resultados */}
        {resultado && (
          <div className={styles.resultsPanel}>
            <h2 className={styles.panelTitle}>📊 Estimación orientativa</h2>

            <div className={styles.resultadoGrid}>
              <ResultCard
                title="Días en demora"
                value={resultado.diasDemora.toString()}
                unit="días"
                variant="info"
                icon="📅"
                description="Días transcurridos entre inicio y fin"
              />
              <ResultCard
                title="Tipo de interés"
                value={formatNumber(resultado.tipoInteres, 2)}
                unit="% anual"
                variant="info"
                icon="📈"
                description={resultado.base}
              />
              <ResultCard
                title="Intereses estimados"
                value={formatCurrency(resultado.intereses)}
                variant="warning"
                icon="💰"
                description={`Importe × ${formatNumber(resultado.tipoInteres, 2)}% × ${resultado.diasDemora} días / 365`}
              />
              <ResultCard
                title="Total orientativo a reclamar"
                value={formatCurrency(resultado.totalReclamar)}
                variant="highlight"
                icon="📄"
                description="Principal + intereses orientativos"
              />
            </div>

            <div className={styles.notaCalculo}>
              <p>
                <strong>Base de cálculo:</strong> {resultado.base}
              </p>
              <p>
                <strong>Fórmula:</strong> {formatCurrency(parseSpanishNumber(importe))} ×{' '}
                {formatNumber(resultado.tipoInteres, 2)}% × {resultado.diasDemora} días / 365
              </p>
            </div>

            {tipoDeuda === 'comercial' && (
              <div className={styles.avisoSemestre}>
                <span>ℹ️</span>
                <p>
                  Si la deuda abarca <strong>varios semestres</strong>, el tipo de interés cambia en cada uno.
                  Esta orientación aplica el tipo del semestre de inicio. Para períodos largos, consulta
                  cada semestre por separado.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DisclaimerCard — siempre visible */}
      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_INTERESES_META.fuente}
        fuente={FISCAL_INTERESES_META.fuente}
        verificado={FISCAL_INTERESES_META.verificado}
        urlOficial={FISCAL_INTERESES_META.urlOficialLey3}
      />

      {/* Aviso específico */}
      <div className={styles.avisoEspecifico}>
        <h3 className={styles.avisoEspecificoTitle}>⚠️ Lo que esta orientación NO sustituye</h3>
        <ul className={styles.avisoLista}>
          <li>Esta herramienta usa el tipo vigente al <strong>inicio de la demora</strong>. Si el período abarca varios semestres, el tipo varía y debe recalcularse por tramos.</li>
          <li>Para deudas con <strong>tipo pactado expresamente en contrato</strong>, se aplica ese tipo, no el legal.</li>
          <li>El devengo automático de intereses (Ley 3/2004) aplica solo a operaciones comerciales entre empresas o autónomos. En deudas entre particulares, puede requerir reclamación previa.</li>
          <li>No incluye posibles <strong>indemnizaciones por costes de cobro</strong> (art. 8 Ley 3/2004: mínimo 40 € por factura impagada).</li>
          <li>Para reclamaciones judiciales, consulta siempre con un <strong>abogado o gestor</strong>.</li>
        </ul>
        <p className={styles.avisoConclusion}>
          Verifica los tipos vigentes en el BOE antes de usarlos en una reclamación real.
          Fuente: <strong>{FISCAL_INTERESES_META.fuente}</strong> — Verificado: {FISCAL_INTERESES_META.verificado}.
        </p>
      </div>

      <EducationalSection
        title="📚 ¿Qué son los intereses de demora y cómo funcionan?"
        subtitle="Conceptos clave sobre la Ley de Morosidad y el Código Civil"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué son los intereses de demora?</h2>
          <p>
            Son los intereses que se generan automáticamente cuando una deuda vence y no se paga en el plazo
            establecido. Su función es compensar al acreedor por el perjuicio económico del retraso.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Interés comercial (Ley 3/2004)</h2>
          <p>
            La Ley 3/2004 contra la morosidad protege a empresas y autónomos en operaciones comerciales
            (entre profesionales, no con consumidores finales). Sus características principales:
          </p>
          <ul>
            <li>El tipo es el <strong>tipo de referencia del BCE + 8 puntos porcentuales</strong>.</li>
            <li>Se actualiza cada 6 meses y se publica en el BOE (en enero y julio).</li>
            <li>El plazo máximo de pago es <strong>30 días</strong> desde recepción de factura o mercancía.</li>
            <li>Los intereses se devengan <strong>automáticamente</strong> sin necesidad de reclamar previamente.</li>
            <li>Además, el acreedor tiene derecho a <strong>40 € mínimos</strong> por costes de cobro por factura impagada.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Interés legal del dinero (art. 1108 CC)</h2>
          <p>
            Para deudas civiles o sin pacto expreso se aplica el interés legal del dinero, fijado anualmente
            por la Ley de Presupuestos Generales del Estado. En 2025 es del <strong>{formatNumber(INTERES_LEGAL_DINERO_2025.tipo, 2)}%</strong> anual
            (prórroga del ejercicio anterior por no haberse aprobado PGE). Es notablemente inferior al interés
            comercial, por lo que conviene verificar qué norma aplica a tu situación.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de demora comercial por semestre</h2>
          <div className={styles.tablaScroll}>
            <table className={styles.tablaIntereses}>
              <thead>
                <tr>
                  <th>Semestre</th>
                  <th>Tipo BCE</th>
                  <th>Incremento</th>
                  <th>Tipo total</th>
                </tr>
              </thead>
              <tbody>
                {TIPOS_DEMORA_COMERCIAL.map(t => (
                  <tr key={t.semestre}>
                    <td>{t.semestre}</td>
                    <td>{formatNumber(t.tipoBCE, 2)}%</td>
                    <td>+8 pp</td>
                    <td><strong>{formatNumber(t.tipoTotal, 2)}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tablaNote}>
            Fuente: {FISCAL_INTERESES_META.fuente}. Verificado: {FISCAL_INTERESES_META.verificado}.
            Verifica siempre en el BOE antes de usar en una reclamación.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Plazo de prescripción</h2>
          <p>
            La acción para reclamar créditos prescribe en <strong>{PLAZOS_RECLAMACION_COMERCIAL.prescripcionDeuda} años</strong> (art. 1967 CC).
            No dejes pasar el tiempo antes de reclamar. Con cada comunicación formal al deudor, el plazo se interrumpe.
          </p>
        </section>

        {/* ── Tabla comparativa ──────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de tipos de interés de demora</h2>
          <p>
            No todos los intereses de demora se calculan igual. La norma aplicable depende del tipo de relación jurídica
            y de quiénes son las partes. Esta tabla resume las diferencias clave para 2025:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Interés Comercial<br /><small>Ley 3/2004</small></th>
                  <th>Interés Legal CC<br /><small>Art. 1108 CC</small></th>
                  <th>Demora Tributario<br /><small>Art. 26 LGT</small></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Quién lo aplica</strong></td>
                  <td>Empresas y autónomos entre sí</td>
                  <td>Particulares, deudas civiles sin pacto</td>
                  <td>Hacienda (AEAT, CCAA)</td>
                </tr>
                <tr>
                  <td><strong>Tipo 2025</strong></td>
                  <td><strong>11,10%</strong> (1T/2025: BCE 3,10% + 8 pp)</td>
                  <td><strong>3,25%</strong> anual (prórroga PGE)</td>
                  <td><strong>4,0625%</strong> anual (LPE 2023 prorrogada)</td>
                </tr>
                <tr>
                  <td><strong>Se aplica automáticamente</strong></td>
                  <td>Sí, desde el día siguiente al vencimiento</td>
                  <td>No, requiere reclamación o mora</td>
                  <td>Sí, desde el fin del período voluntario</td>
                </tr>
                <tr>
                  <td><strong>Plazo máximo de pago</strong></td>
                  <td>30 días desde factura/entrega</td>
                  <td>El pactado o el que fije el juez</td>
                  <td>Fijado por liquidación o acto administrativo</td>
                </tr>
                <tr>
                  <td><strong>Costes adicionales mínimos</strong></td>
                  <td>40 € por factura (art. 8 Ley 3/2004)</td>
                  <td>No aplica</td>
                  <td>Recargo de apremio (5%–20% según fase)</td>
                </tr>
                <tr>
                  <td><strong>Prescripción</strong></td>
                  <td>3 años (art. 1967 CC)</td>
                  <td>3–5 años según tipo de acción</td>
                  <td>4 años (art. 66 LGT)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Casos de uso ───────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso prácticos</h2>
          <p>
            Cuatro situaciones reales que ilustran cuándo y cómo se aplica cada tipo de interés:
          </p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧾</span>
                <strong>Autónomo con factura impagada de 3.000 €</strong>
              </div>
              <p className={styles.escenarioExample}>
                Un diseñador freelance emite factura a una empresa el 1 de enero de 2025 con vencimiento 30 de enero.
                La empresa no paga. Aplica la <strong>Ley 3/2004</strong>: tipo del 11,10% anual + <strong>40 € mínimos</strong> por costes de cobro
                (independientemente de los intereses calculados). Por cada mes de retraso se generan aprox. 27,75 € de intereses.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: emite la factura de intereses tan pronto como sea posible; los 40 € se reclaman al mismo tiempo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🤝</span>
                <strong>Préstamo personal entre particulares sin tipo pactado</strong>
              </div>
              <p className={styles.escenarioExample}>
                Un particular presta 10.000 € a un amigo sin firmar contrato ni fijar intereses. El prestatario no devuelve
                el dinero al año. Sin pacto expreso, aplica el <strong>interés legal del dinero 2025: 3,25%</strong> anual
                (art. 1108 CC), pero solo desde que hay mora, es decir, desde la reclamación extrajudicial o judicial.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: envía un burofax reclamando el pago para constituir en mora al deudor y que empiecen a correr los intereses.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏛️</span>
                <strong>Deuda con Hacienda por declaración complementaria</strong>
              </div>
              <p className={styles.escenarioExample}>
                Un contribuyente presenta en mayo de 2025 una declaración complementaria del IRPF 2023 ingresando
                3.500 €. Hacienda aplica el <strong>interés de demora tributario del 4,0625%</strong> anual sobre
                los 3.500 € desde el fin del plazo voluntario (30 junio 2024) hasta la fecha del pago.
                En este caso, aprox. 119 € adicionales por ~10,5 meses.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: si presentas sin requerimiento previo, solo se aplica interés de demora; con requerimiento, además puede haber recargo o sanción.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <strong>Empresa reclamando a proveedor internacional</strong>
              </div>
              <p className={styles.escenarioExample}>
                Una empresa española compra materiales a un proveedor alemán. El contrato no especifica el tipo de interés aplicable en caso de impago.
                La <strong>Ley 3/2004 puede aplicarse</strong> si el contrato se rige por derecho español (art. 3 del Reglamento Roma I),
                pero si hay cláusula de elección de otro derecho, prevalece ese. Sin pacto, el Reglamento Roma I suele
                apuntar al país del vendedor.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: incluye siempre en contratos internacionales una cláusula de elección de ley y de tipo de interés aplicable.
              </p>
            </div>

          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>

            <div className={styles.faqItem}>
              <dt>¿Cuándo se aplica la Ley 3/2004 y cuándo el Código Civil?</dt>
              <dd>
                La Ley 3/2004 aplica a operaciones comerciales entre empresas y autónomos (B2B). Si alguna de las partes es un
                consumidor final (particular sin actividad profesional), la ley no aplica y se acude al art. 1108 del Código Civil,
                que establece el interés legal del dinero (3,25% en 2025) como referencia supletoria.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Los 40 € mínimos se aplican por factura o por deuda total?</dt>
              <dd>
                Por cada factura impagada de forma independiente (art. 8 Ley 3/2004). Si tienes 5 facturas impagadas de un mismo
                cliente, puedes reclamar 5 × 40 € = 200 € en concepto de costes mínimos de cobro, más los intereses de cada una.
                <span className={styles.faqTip}>Este importe mínimo es compatible con reclamar costes reales superiores si los puedes acreditar.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo pactar un tipo de interés diferente al legal?</dt>
              <dd>
                Sí, con dos límites importantes: (1) en contratos B2B, el tipo pactado no puede ser abusivamente bajo
                (art. 9 Ley 3/2004 prohíbe cláusulas abusivas para el acreedor); (2) en cualquier contrato, no puede superar
                el triple del interés legal del dinero sin justificación objetiva, bajo riesgo de usura (art. 1 Ley Azcárate 1908).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Los intereses de demora tributan en el IRPF?</dt>
              <dd>
                Depende del tipo: los intereses de demora que cobras de un deudor comercial o civil tributan como
                <strong> rendimiento del capital mobiliario</strong> (tipo del ahorro, 19%–28%). Los intereses de demora
                que abona Hacienda al contribuyente por devoluciones tardías están exentos desde 2015 (STS 3 diciembre 2020).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si el deudor paga parte de la deuda? ¿Siguen acumulándose intereses?</dt>
              <dd>
                Sí. Los intereses siguen acumulándose sobre el <strong>capital pendiente</strong> no pagado. El pago parcial
                se imputa primero a los gastos de cobro (40 €), luego a los intereses devengados, y por último al principal,
                salvo pacto distinto entre las partes (art. 1173 CC).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo reclamo los intereses de demora ante los tribunales?</dt>
              <dd>
                Para deudas dinerarias con cuantía determinada, el <strong>proceso monitorio</strong> (art. 812 LEC) es el
                cauce habitual: no requiere abogado ni procurador si la deuda es inferior a 2.000 €, y abarca hasta 250.000 €.
                Si el deudor no se opone en 20 días, el juez dicta decreto de ejecución directamente.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo reclamar intereses si no los incluí en la factura original?</dt>
              <dd>
                Sí. Los intereses de demora son un derecho legal que nace automáticamente por el solo incumplimiento del plazo.
                No es necesario haberlos incluido en la factura principal. Puedes emitir una <strong>factura complementaria
                de intereses</strong> en cualquier momento antes de que prescriba la acción (3 años desde el vencimiento).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuál es el plazo de prescripción para reclamar intereses?</dt>
              <dd>
                Para acciones personales sin plazo especial, la prescripción es de <strong>5 años</strong> (art. 1964 CC tras reforma 2015).
                Para créditos reconocidos judicialmente, 5 años desde la firmeza de la sentencia. Sin embargo, en el ámbito mercantil
                y para acciones de reclamación de deuda líquida, el plazo habitual citado es <strong>3 años</strong> (art. 1967 CC).
                Cada comunicación formal al deudor interrumpe el plazo.
              </dd>
            </div>

          </dl>
        </section>

        {/* ── Guía paso a paso ───────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: cómo reclamar intereses de demora</h2>
          <ol className={styles.stepGuide}>

            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo de deuda y la norma aplicable</strong>
                <p>
                  ¿Es una operación comercial B2B (Ley 3/2004), una deuda civil entre particulares (art. 1108 CC)
                  o una deuda con la Administración (LGT)? El tipo de interés y los plazos varían significativamente.
                  Comprueba también si existe un tipo pactado en el contrato que prevalezca sobre el legal supletorio.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Calcula los intereses desde la fecha de vencimiento hasta hoy</strong>
                <p>
                  Usa la fórmula: <em>Capital × (Tipo% / 100) × (Días / 365)</em>. Para el interés comercial,
                  el tipo cambia cada semestre (enero y julio), por lo que si la deuda abarca varios semestres,
                  debes calcular cada tramo con su tipo correspondiente. Usa esta herramienta para obtener
                  una estimación orientativa rápida.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Envía reclamación extrajudicial por burofax</strong>
                <p>
                  Antes de ir a juicio, envía un burofax con acuse de recibo y certificación de contenido al domicilio
                  social del deudor. Este acto <strong>interrumpe la prescripción</strong> (art. 1973 CC) y constituye
                  en mora al deudor, por lo que es el punto de partida oficial para deudas civiles. Conserva el justificante.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Emite la factura de intereses de demora</strong>
                <p>
                  Los intereses de demora entre empresas tributan a efectos del IVA de forma diferente:
                  si son indemnizatorios puros (no vinculados a una operación sujeta), están <strong>exentos de IVA</strong>.
                  Si son parte de la contraprestación de una operación comercial, puede aplicar IVA. Consulta con tu
                  asesor fiscal la calificación correcta antes de emitir la factura.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Si no pagan, inicia el proceso monitorio</strong>
                <p>
                  El proceso monitorio (art. 812 LEC) es el procedimiento judicial más ágil para reclamar deudas dinerarias
                  con documentación acreditativa (factura, contrato, albarán). No requiere abogado ni procurador si la
                  cuantía es inferior a <strong>2.000 €</strong>; para cuantías mayores hasta 250.000 €, sí son necesarios.
                  Si el deudor no se opone en 20 días hábiles, el juez despacha ejecución directamente.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Ejecución de sentencia para cobrar</strong>
                <p>
                  Con el decreto de ejecución, puedes solicitar al juzgado el <strong>embargo preventivo</strong> de cuentas
                  bancarias, vehículos o bienes inmuebles del deudor. El juzgado puede requerir a entidades financieras para
                  localizar cuentas. En caso de insolvencia declarada, pasarás a ser acreedor ordinario en el concurso de acreedores.
                </p>
              </div>
            </li>

          </ol>
        </section>

        {/* ── Mejores prácticas ──────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para protegerte de la morosidad</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <div>
                <strong>Incluye la cláusula de intereses en tus contratos</strong>
                <p>
                  Añade en todos tus presupuestos y contratos: «En caso de impago, se aplicarán los intereses de demora
                  previstos en la Ley 3/2004 más 40 € por costes de cobro por cada factura impagada». Esto refuerza
                  tu posición jurídica y actúa como elemento disuasorio.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📧</span>
              <div>
                <strong>Envía recordatorio escrito antes del vencimiento</strong>
                <p>
                  Un email de recordatorio 5 días antes del vencimiento no solo es buena práctica, sino que constituye
                  evidencia de que el deudor conocía la fecha de pago. En caso de disputa, demuestra tu diligencia y
                  buena fe como acreedor.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧮</span>
              <div>
                <strong>Calcula los 40 € mínimos por factura, no por cliente</strong>
                <p>
                  Un error común es reclamar 40 € por cliente con varias facturas pendientes. La ley los establece
                  por cada factura impagada individualmente. Si tienes 10 facturas de 100 € cada una, puedes reclamar
                  hasta 400 € en mínimos además de los intereses calculados sobre los 1.000 €.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <div>
                <strong>Interrumpe la prescripción con comunicaciones formales</strong>
                <p>
                  La acción para reclamar prescribe a los 3 años (o 5 según el tipo de acción). Cada reclamación fehaciente
                  —burofax, email certificado, acto de conciliación— reinicia el cómputo. Si una deuda es antigua, actúa
                  antes de que se cumpla el plazo: la prescripción se alega por el deudor, no la aplica el juez de oficio.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <div>
                <strong>En contratos internacionales, especifica la ley aplicable</strong>
                <p>
                  El Reglamento Roma I (CE 593/2008) permite elegir libremente la ley aplicable al contrato. Sin elección
                  expresa, se aplica la ley del país del prestador del servicio o vendedor del bien, que puede no ser la
                  española. Incluye siempre: «Este contrato se rige por la ley española y, en caso de mora, por la Ley 3/2004».
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💼</span>
              <div>
                <strong>Emite la factura de intereses pronto: tributan en IRPF</strong>
                <p>
                  Los intereses que cobres de deudores tributan como rendimiento del capital mobiliario. Si los cobras
                  en 2025, deben declararse en la renta 2025 (presentada en 2026). Emite la factura de intereses en el
                  mismo ejercicio fiscal en que se resuelva la deuda para simplificar la gestión tributaria.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Warning Box ────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores frecuentes que pueden costarte el cobro</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Esperar a que el deudor pague espontáneamente.</strong> Los intereses se acumulan a tu favor,
                pero la prescripción también corre. Si superas los 3–5 años sin reclamar formalmente, puedes perder
                el derecho a los intereses e incluso al principal.
              </li>
              <li>
                <strong>Aplicar la Ley 3/2004 a relaciones con consumidores finales.</strong> Esta ley solo aplica
                a operaciones entre empresarios y/o autónomos (B2B). Si tu cliente es un particular, la norma aplicable
                es el Código Civil, con un tipo de interés mucho más bajo (3,25% en 2025).
              </li>
              <li>
                <strong>No documentar la fecha de entrega de la factura o mercancía.</strong> El plazo de pago de 30 días
                (Ley 3/2004) comienza desde la recepción de la factura o la entrega del bien/servicio. Sin prueba de esa fecha,
                el deudor puede alegar que el plazo no ha vencido.
              </li>
              <li>
                <strong>Calcular los intereses sobre el importe con IVA incluido.</strong> Los intereses de demora
                en operaciones comerciales se calculan sobre la <strong>base imponible</strong>, no sobre el total
                facturado con IVA (salvo pacto expreso). Aplicar el tipo sobre el precio con IVA inflaría artificialmente
                los intereses y puede generar conflictos.
              </li>
              <li>
                <strong>Ignorar el plazo de prescripción de 3 años.</strong> Una vez prescrita la acción, el deudor
                puede alegar la prescripción en juicio y el juzgado no puede entrar en el fondo. La prescripción no
                la aplica el juez de oficio: debe alegarla el deudor, pero si lo hace, el juicio se pierde.
              </li>
              <li>
                <strong>Pactar intereses superiores al triple del interés legal sin justificación.</strong> El art. 1
                de la Ley Azcárate (1908) declara nulos los préstamos usurarios. Si el tipo pactado es
                notablemente superior al normal del dinero y desproporcionado con las circunstancias, un juez puede
                declarar nulo el interés y aplicar el legal supletorio, o incluso anular todo el contrato.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-intereses-demora')} />
      <ShareCard appName="orientador-intereses-demora" />
      <Footer appName="orientador-intereses-demora" />
    </div>
  );
}
