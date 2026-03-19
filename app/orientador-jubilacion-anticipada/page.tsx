'use client';

import { useState } from 'react';
import styles from './OrientadorJubilacionAnticipada.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference,
} from '@/components';
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

      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Esta herramienta es SOLO orientativa. Los datos de la Seguridad Social pueden cambiar con cada reforma legislativa.
          <br /><strong>No es</strong> asesoramiento previsional ni jurídico personalizado.
          <br />Los coeficientes reductores se aplican de forma definitiva e irreversible sobre tu pensión. Verificado en {FISCAL_PENSIONES_META.vigencia}.
          <br /><strong>Consulta con la SS o un asesor previsional</strong> antes de solicitar la jubilación anticipada.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa={FISCAL_PENSIONES_META.fuente}
        fuente={FISCAL_PENSIONES_META.fuente}
        verificado={FISCAL_PENSIONES_META.verificado}
        urlOficial={FISCAL_PENSIONES_META.urlOficial}
      />

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
      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Jubilación anticipada voluntaria vs involuntaria</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Característica</th>
              <th>Voluntaria</th>
              <th>Involuntaria</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Años antes de la edad legal</td>
              <td>Hasta 2 años</td>
              <td>Hasta 4 años</td>
            </tr>
            <tr>
              <td>Años cotizados mínimos</td>
              <td>35 años</td>
              <td>33 años</td>
            </tr>
            <tr>
              <td>Coeficiente reductor mensual</td>
              <td>Mayor penalización</td>
              <td>Menor penalización</td>
            </tr>
            <tr>
              <td>Causa requerida</td>
              <td>Ninguna (decisión propia)</td>
              <td>Despido, ERTE, insolvencia empresarial...</td>
            </tr>
            <tr>
              <td>Pensión mínima requerida</td>
              <td>Superior a la pensión mínima</td>
              <td>No requerida</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👷</span>
            <strong>Trabajador con larga carrera (38+ años)</strong>
          </div>
          <p>Cumple requisito de 35 años y quiere jubilarse 2 años antes. El coeficiente reductor es bajo por su larga cotización.</p>
          <div className={styles.escenarioExample}>Ejemplo: 2 años antes → reducción ~6-7% de la pensión completa</div>
          <div className={styles.escenarioTip}>💡 Verificar si la reducción compensa los ingresos perdidos durante los 2 años.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>📉</span>
            <strong>Trabajador afectado por ERE/ERTE</strong>
          </div>
          <p>Despedido a los 60+ años con 33+ años cotizados. Puede acceder a jubilación anticipada involuntaria con menor penalización.</p>
          <div className={styles.escenarioExample}>Ejemplo: Despido a 61 años, 35 cotizados → jubilación con reducción 2,31%/trim</div>
          <div className={styles.escenarioTip}>💡 Comparar con prestación por desempleo antes de solicitar jubilación anticipada.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🩺</span>
            <strong>Trabajador con problemas de salud</strong>
          </div>
          <p>Si tiene reconocida discapacidad o realiza trabajos con coeficientes reductores, puede anticipar sin penalización o con menos años.</p>
          <div className={styles.escenarioExample}>Ejemplo: Miner, bombero, determinadas profesiones → antes de los 65 sin penalización</div>
          <div className={styles.escenarioTip}>💡 Consultar si el convenio colectivo o profesión tiene coeficientes reductores.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>💰</span>
            <strong>Persona con ahorro privado suficiente</strong>
          </div>
          <p>Tiene plan de pensiones, fondos e inmuebles. La reducción en pensión pública la compensa con rentas privadas durante los años anticipados.</p>
          <div className={styles.escenarioExample}>Estrategia: Reducción ~5% pensión pública + renta privada de 1.000 €/mes</div>
          <div className={styles.escenarioTip}>💡 Calcular el break-even: ¿cuántos años tarda en compensar la reducción?</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre jubilación anticipada</h3>
        <div className={styles.faqItem}>
          <strong>¿Cuáles son los coeficientes reductores exactos?</strong>
          <p>Para voluntaria: entre 1,625% y 2% por trimestre según años cotizados. Para involuntaria: entre 1,125% y 1,75% por trimestre. Se aplica sobre la pensión completa por cada trimestre adelantado.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La reducción es permanente?</strong>
          <p>Sí, la reducción por anticipación es permanente y se mantiene toda la vida. Solo se elimina si se llega a la edad legal sin haber cobrado aún la pensión.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué pasa con la pensión mínima?</strong>
          <p>Para la jubilación anticipada voluntaria, la pensión resultante DESPUÉS de aplicar los coeficientes debe ser superior a la pensión mínima garantizada. Si no, no se puede acceder a la modalidad voluntaria.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué se considera causa involuntaria?</strong>
          <p>Despido objetivo, colectivo (ERE), por extinción de empresa, por insolvencia/concurso del empresario, por muerte o jubilación del empresario individual, o fin de contrato temporal no renovado.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo combinar desempleo y jubilación anticipada?</strong>
          <p>No simultáneamente. Pero puedes agotar la prestación por desempleo primero y luego solicitar la jubilación anticipada, si aún cumples el requisito de edad.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo afecta a la pensión de viudedad futura del cónyuge?</strong>
          <p>La pensión de viudedad se calcula sobre la pensión del fallecido, incluyendo las reducciones por anticipación. Es un factor a considerar en la planificación familiar.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede revocar la solicitud de jubilación anticipada?</strong>
          <p>Antes de la resolución del INSS es posible desistir. Una vez reconocida y comenzada a cobrar, generalmente no es reversible.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Los períodos de cuidado de hijos cuentan para los 35 años?</strong>
          <p>Sí, los períodos de excedencia por cuidado de hijos (hasta 3 años por hijo) se computan como cotizados a efectos del acceso a la jubilación anticipada.</p>
          <div className={styles.faqTip}>💡 Verificar que todos estos períodos están correctamente registrados en la vida laboral.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo acceder a la jubilación anticipada paso a paso</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Verifica tu elegibilidad</strong>
            <p>Comprueba tu edad actual, años cotizados (vida laboral) y determina si tu caso es voluntario o involuntario. Asegúrate de cumplir el mínimo de cotización.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Calcula los coeficientes reductores</strong>
            <p>Usa este orientador para calcular exactamente qué reducción sufrirá tu pensión según los trimestres que te anticipas.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Valora la alternativa de esperar</strong>
            <p>Compara la pensión reducida durante X años extra versus la pensión completa. Calcula el punto de equilibrio (break-even) en número de años de cobro.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Prepara la documentación</strong>
            <p>DNI, vida laboral actualizada. Para involuntaria: documento acreditativo de la causa (carta de despido, certificado empresa en concurso, etc.).</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Solicita hasta 3 meses antes</strong>
            <p>Presenta la solicitud en el INSS con hasta 3 meses de antelación a la fecha deseada. La efectividad de la pensión es desde la fecha indicada en la solicitud.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Resolución y primer pago</strong>
            <p>El INSS resuelve en 30-90 días. La pensión se pagará con efectos desde el día solicitado, con retroactividad si la resolución tarda.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🧮</div>
          <strong>Calcula el break-even</strong>
          <p>Divide los años de pensión reducida que cobrarías antes por el importe que "pierdes" para saber cuándo sale rentable la anticipación.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📋</div>
          <strong>Revisa bien la causa</strong>
          <p>Si tu situación puede calificarse como involuntaria, los coeficientes son menores. Documentar correctamente la causa puede suponer cientos de euros más al mes.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏦</div>
          <strong>Considera el ahorro privado como puente</strong>
          <p>Si te queda poco para los 35 años de cotización, valorar esperar y mientras tanto usar ahorro privado como renta complementaria.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👨‍👩‍👧</div>
          <strong>Ten en cuenta el impacto en viudedad</strong>
          <p>La reducción permanente en tu pensión también reduce la pensión de viudedad de tu cónyuge. Inclúyelo en la decisión familiar.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📅</div>
          <strong>Solicítala con tiempo</strong>
          <p>El INSS puede tardar meses en resolver. Solicitar con 3 meses de antelación evita quedarse sin ingresos entre el cese y el cobro de la pensión.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💡</div>
          <strong>Consulta un asesor laboral</strong>
          <p>Las casuísticas son muy variadas. Un asesor laboral o gestor de SS puede analizar tu caso específico y calcular la mejor estrategia.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes en la jubilación anticipada</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>No verificar el mínimo de cotización</strong>: Solicitar jubilación anticipada sin tener los 35 años (voluntaria) o 33 años (involuntaria) resulta en denegación automática.</li>
          <li><strong>No acreditar la causa involuntaria</strong>: Presentarse como involuntario sin la documentación adecuada lleva a aplicar los coeficientes más altos de la voluntaria.</li>
          <li><strong>No calcular el impacto real en euros</strong>: La reducción porcentual abstracta puede parecer pequeña, pero en términos de euros mensuales durante 20+ años es muy significativa.</li>
          <li><strong>Solicitar demasiado tarde</strong>: Si se solicita sin antelación, puede haber un período sin ingresos entre el cese laboral y el inicio del pago de la pensión.</li>
          <li><strong>No agotar primero el desempleo en casos involuntarios</strong>: A veces es más rentable cobrar el desempleo completo y luego jubilarse (si aún cumplen la edad mínima).</li>
          <li><strong>Ignorar el impacto en el cónyuge</strong>: La reducción permanente afecta también a la futura pensión de viudedad del cónyuge, algo que raramente se considera.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-jubilacion-anticipada')} />
      <ShareCard appName="orientador-jubilacion-anticipada" />
      <Footer appName="orientador-jubilacion-anticipada" />
    </div>
  );
}
