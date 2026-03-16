'use client';

import { useState } from 'react';
import styles from './OrientadorJubilacionAnticipada.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
  REQUISITOS_ANTICIPADA_INVOLUNTARIA,
  REQUISITOS_ANTICIPADA_VOLUNTARIA,
  EDAD_JUBILACION_2025,
  CoeficienteReductor,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoJubilacion = 'voluntaria' | 'involuntaria';

interface ResultadoAnticipada {
  posible: boolean;
  motivoImpedimento: string;
  cumpleEdad: boolean;
  cumpleCotizacion: boolean;
  mesesAnticipacion: number;
  trimestreAnticipacion: number;
  reduccionTotal: number;       // %
  pensionConReduccion: number;  // €/mes
  perdidaMensual: number;       // €/mes
  edadOrdinaria: string;
  maxMesesPermitidos: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularReduccionAnticipada(
  trimestreAnticipacion: number,
  tipo: TipoJubilacion
): number {
  const coeficientes: CoeficienteReductor[] = tipo === 'voluntaria'
    ? COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025
    : COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025;

  let reduccionTotal = 0;
  for (let t = 1; t <= trimestreAnticipacion; t++) {
    const tramo = coeficientes.find(c => t >= c.trimestreDesde && t <= c.trimestreHasta);
    if (tramo) reduccionTotal += tramo.reduccionPorTrimestre;
  }
  return reduccionTotal;
}

function orientarJubilacionAnticipada(
  edadActual: number,
  anosCotizados: number,
  mesesAnticipacion: number,
  tipo: TipoJubilacion,
  pensionOrdinaria: number
): ResultadoAnticipada {
  const requisitos = tipo === 'voluntaria'
    ? REQUISITOS_ANTICIPADA_VOLUNTARIA
    : REQUISITOS_ANTICIPADA_INVOLUNTARIA;

  const cumpleCotizacion = anosCotizados >= requisitos.anosMinimoCotizados;
  const edadOrdinariaAnos = anosCotizados >= (EDAD_JUBILACION_2025.mesesCotizadosParaJubilacion65 / 12) ? 65 : 66.5;
  const edadConAnticipacion = edadOrdinariaAnos - (mesesAnticipacion / 12);
  const cumpleEdad = edadConAnticipacion >= 60 && edadActual <= edadOrdinariaAnos;

  const maxPermitidos = requisitos.maxMesesAnticipacion;
  const mesesReales = Math.min(mesesAnticipacion, maxPermitidos);
  const trimestreAnticipacion = Math.ceil(mesesReales / 3);

  let motivoImpedimento = '';
  if (!cumpleCotizacion) {
    motivoImpedimento = `Se necesitan ${requisitos.anosMinimoCotizados} años cotizados. Tienes ${anosCotizados}.`;
  } else if (mesesAnticipacion > maxPermitidos) {
    motivoImpedimento = `La jubilación anticipada ${tipo} permite un máximo de ${maxPermitidos / 12} años de antelación.`;
  }

  const posible = cumpleCotizacion && mesesAnticipacion <= maxPermitidos;
  const reduccionTotal = posible ? calcularReduccionAnticipada(trimestreAnticipacion, tipo) : 0;
  const pensionConReduccion = pensionOrdinaria * (1 - reduccionTotal / 100);

  return {
    posible,
    motivoImpedimento,
    cumpleEdad,
    cumpleCotizacion,
    mesesAnticipacion: mesesReales,
    trimestreAnticipacion,
    reduccionTotal,
    pensionConReduccion,
    perdidaMensual: pensionOrdinaria - pensionConReduccion,
    edadOrdinaria: `${edadOrdinariaAnos === 65 ? '65' : '66 años y 6 meses'}`,
    maxMesesPermitidos: maxPermitidos,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorJubilacionAnticipada() {
  const [edadActual, setEdadActual] = useState('');
  const [anosCotizados, setAnosCotizados] = useState('');
  const [mesesAnticipacion, setMesesAnticipacion] = useState('');
  const [tipo, setTipo] = useState<TipoJubilacion>('voluntaria');
  const [pensionOrdinaria, setPensionOrdinaria] = useState('');
  const [resultado, setResultado] = useState<ResultadoAnticipada | null>(null);
  const [error, setError] = useState('');

  function orientar() {
    setError('');
    const edad = parseInt(edadActual);
    const anos = parseFloat(anosCotizados.replace(',', '.'));
    const meses = parseInt(mesesAnticipacion);
    const pension = parseFloat(pensionOrdinaria.replace(',', '.'));

    if (isNaN(edad) || edad < 50 || edad > 70) { setError('Introduce tu edad actual (entre 50 y 70).'); return; }
    if (isNaN(anos) || anos < 1 || anos > 50) { setError('Introduce los años cotizados.'); return; }
    if (isNaN(meses) || meses < 1 || meses > 48) { setError('Introduce los meses de anticipación (entre 1 y 48).'); return; }
    if (isNaN(pension) || pension <= 0) { setError('Introduce tu pensión ordinaria estimada.'); return; }

    setResultado(orientarJubilacionAnticipada(edad, anos, meses, tipo, pension));
  }

  const maxAnos = tipo === 'voluntaria' ? 2 : 4;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⏩</span>
        <h1 className={styles.title}>Orientador de Jubilación Anticipada</h1>
        <p className={styles.subtitle}>¿Puedes jubilarte antes? Descubre los requisitos y el impacto en tu pensión · SS 2025</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es SOLO orientativa. Los datos de la Seguridad Social pueden cambiar con cada reforma legislativa.
          <br /><strong>No es</strong> asesoramiento previsional ni jurídico personalizado.
          <br />Los coeficientes reductores se aplican de forma definitiva e irreversible sobre tu pensión. Verificado en {FISCAL_PENSIONES_META.vigencia}.
          <br /><strong>Consulta con la SS o un asesor previsional</strong> antes de solicitar la jubilación anticipada.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tipoJubilacion">Tipo de jubilación anticipada</label>
            <select
              id="tipoJubilacion"
              className={styles.select}
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoJubilacion)}
            >
              <option value="voluntaria">Voluntaria (a tu iniciativa)</option>
              <option value="involuntaria">Involuntaria (ERE, despido colectivo, cierre empresa...)</option>
            </select>
            <p className={styles.hint}>
              {tipo === 'voluntaria'
                ? `Hasta ${maxAnos} años antes. Requiere ${REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados} años cotizados.`
                : `Hasta ${maxAnos} años antes. Requiere ${REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados} años cotizados.`}
            </p>
          </div>

          <NumberInput
            value={edadActual}
            onChange={setEdadActual}
            label="Edad actual"
            placeholder="Ej: 60"
            min={50}
            max={70}
          />

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="Años cotizados"
            placeholder="Ej: 36"
            helperText="Consulta tu vida laboral en importass.seg-social.es"
            min={1}
            max={50}
          />

          <NumberInput
            value={mesesAnticipacion}
            onChange={setMesesAnticipacion}
            label={`Meses de anticipación deseados (máx. ${maxAnos * 12})`}
            placeholder={`${maxAnos * 6}`}
            helperText="Meses antes de tu edad de jubilación ordinaria."
            min={1}
            max={maxAnos * 12}
          />

          <NumberInput
            value={pensionOrdinaria}
            onChange={setPensionOrdinaria}
            label="Pensión ordinaria estimada (€/mes)"
            placeholder="Ej: 1.800"
            helperText="Obtenla del Estimador de Pensión Pública o del simulador oficial de la SS."
            min={100}
            max={10000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={orientar} aria-label="Calcular jubilación anticipada">
            Orientarme sobre mi jubilación anticipada
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para recibir orientación sobre tu jubilación anticipada.
            </p>
          ) : (
            <div className={styles.resultados}>
              {/* Estado */}
              {resultado.posible ? (
                <div className={styles.statusOk} role="status">
                  ✅ En principio, podrías jubilarte anticipadamente
                </div>
              ) : (
                <div className={styles.statusNok} role="alert">
                  ❌ No cumples los requisitos actuales
                  <br /><small className={styles.smallNormal}>{resultado.motivoImpedimento}</small>
                </div>
              )}

              {/* Requisitos */}
              <div className={styles.requisitosGrid}>
                <div className={`${styles.requisitoItem} ${resultado.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleCotizacion ? '✓' : '✗'} Años cotizados ({tipo === 'voluntaria' ? REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados : REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados} requeridos)
                </div>
                <div className={`${styles.requisitoItem} ${resultado.mesesAnticipacion <= resultado.maxMesesPermitidos ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.mesesAnticipacion <= resultado.maxMesesPermitidos ? '✓' : '✗'} Antelación (máx. {resultado.maxMesesPermitidos} meses)
                </div>
              </div>

              {resultado.posible && (
                <>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Edad de jubilación ordinaria</span>
                    <span className={styles.resultValue}>{resultado.edadOrdinaria}</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Anticipación solicitada</span>
                    <span className={styles.resultValue}>{resultado.mesesAnticipacion} meses ({resultado.trimestreAnticipacion} trimestres)</span>
                  </div>

                  <div className={`${styles.resultItem}`}>
                    <span className={styles.resultLabel}>Reducción total aplicada</span>
                    <span className={styles.resultValueDanger}>-{formatNumber(resultado.reduccionTotal, 2)}%</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Pensión con reducción</span>
                    <span className={styles.resultValueWarning}>{formatCurrency(resultado.pensionConReduccion)}/mes</span>
                  </div>

                  <div className={`${styles.resultItem}`}>
                    <span className={styles.resultLabel}>Pérdida mensual permanente</span>
                    <span className={styles.resultValueDanger}>-{formatCurrency(resultado.perdidaMensual)}/mes</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Pérdida anual (14 pagas)</span>
                    <span className={styles.resultValueDanger}>-{formatCurrency(resultado.perdidaMensual * 14)}/año</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo funciona la jubilación anticipada en España?" subtitle="Requisitos, tipos y coeficientes reductores SS 2025">
        <p>Existen dos tipos de jubilación anticipada con requisitos y penalizaciones distintas:</p>
        <h3>Voluntaria</h3>
        <p>A iniciativa del trabajador. Se puede solicitar hasta <strong>2 años antes</strong> de la edad ordinaria con al menos <strong>35 años cotizados</strong>. La reducción es del 2,04% por trimestre de anticipación en el primer año y del 1,92% en el segundo, aplicada de forma permanente e irreversible.</p>
        <h3>Involuntaria</h3>
        <p>Cuando el cese no es voluntario (ERE, ERTE extintivo, despido colectivo, cierre de empresa). Se puede solicitar hasta <strong>4 años antes</strong> con al menos <strong>33 años cotizados</strong>. La reducción es menor: del 1,56% al 1,20% por trimestre según la antelación.</p>
        <h3>¿Compensa jubilarse antes?</h3>
        <p>La reducción es permanente: si te jubilaste 2 años antes con una penalización del -10%, cobrarás ese 10% menos durante <em>toda tu jubilación</em>. El punto de equilibrio (breakeven) suele estar entre 10-15 años de jubilación, dependiendo del caso.</p>
        <h3>Consideraciones adicionales</h3>
        <ul>
          <li>La pensión mínima garantizada sigue aplicando aunque con reducción.</li>
          <li>Algunos convenios colectivos y EREs incluyen complementos del empleador.</li>
          <li>Consulta siempre con la SS tu historial exacto antes de decidir.</li>
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-jubilacion-anticipada')} />
      <ShareCard appName="orientador-jubilacion-anticipada" />
      <Footer appName="orientador-jubilacion-anticipada" />
    </div>
  );
}
