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
      <DisclaimerCard variant="financial" />

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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-intereses-demora')} />
      <ShareCard appName="orientador-intereses-demora" />
      <Footer appName="orientador-intereses-demora" />
    </div>
  );
}
