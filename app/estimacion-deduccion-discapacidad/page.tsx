'use client';

import { useState, useCallback } from 'react';
import styles from './EstimacionDeduccionDiscapacidad.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  FISCAL_DEPENDENCIA_META,
  TRAMOS_IRPF_2025,
} from '@/data/fiscal';
import { jsonLd } from './metadata';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TitularDiscapacidad = 'contribuyente' | 'ascendiente' | 'descendiente';
type GradoDiscapacidad = '33a65' | '65oMas';

interface Resultado {
  minimoDiscapacidad: number;
  gastosAsistencia: number;
  totalMinimo: number;
  tipoMarginal: number;
  ahorroEstimado: number;
}

// ─── Tipos marginales disponibles ─────────────────────────────────────────────

const TIPOS_MARGINALES = TRAMOS_IRPF_2025.map((t) => t.tipo);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimacionDeduccionDiscapacidadPage() {
  const [titular, setTitular] = useState<TitularDiscapacidad>('contribuyente');
  const [grado, setGrado] = useState<GradoDiscapacidad>('33a65');
  const [necesitaAsistencia, setNecesitaAsistencia] = useState(false);
  const [tipoMarginal, setTipoMarginal] = useState(24);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcular = useCallback(() => {
    const datos = titular === 'contribuyente'
      ? DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente
      : DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar;

    const minimoDiscapacidad = grado === '33a65'
      ? datos.discapacidad33a65
      : datos.discapacidad65oMas;

    const gastosAsistencia = necesitaAsistencia
      ? (grado === '33a65' ? datos.gastosAsistencia33a65 : datos.gastosAsistencia65oMas)
      : 0;

    const totalMinimo = minimoDiscapacidad + gastosAsistencia;
    const ahorroEstimado = totalMinimo * (tipoMarginal / 100);

    setResultado({
      minimoDiscapacidad,
      gastosAsistencia,
      totalMinimo,
      tipoMarginal,
      ahorroEstimado,
    });
  }, [titular, grado, necesitaAsistencia, tipoMarginal]);

  const limpiar = useCallback(() => {
    setTitular('contribuyente');
    setGrado('33a65');
    setNecesitaAsistencia(false);
    setTipoMarginal(24);
    setResultado(null);
  }, []);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">♿</span>
        <h1 className={styles.title}>Estimación de Deducción IRPF por Discapacidad</h1>
        <p className={styles.subtitle}>
          Calcula el ahorro fiscal aproximado por los mínimos de discapacidad en tu declaración de la renta
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical">
        Esta herramienta ofrece una estimación <strong>ORIENTATIVA</strong> del ahorro fiscal
        por los mínimos de discapacidad en IRPF. <strong>NO constituye asesoramiento fiscal</strong> ni
        sustituye la intervención de un asesor tributario cualificado. Los importes reales dependen
        de la situación personal completa. Verifica siempre con la Agencia Tributaria o un profesional.
      </DisclaimerCard>

      <DataReference
        normativa="Mínimos por discapacidad IRPF 2025"
        fuente={FISCAL_DEPENDENCIA_META.fuente}
        verificado={FISCAL_DEPENDENCIA_META.verificado}
        urlOficial={FISCAL_DEPENDENCIA_META.urlOficial}
      />

      {/* ── Formulario ───────────────────────────────────────────────────── */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">📋</span> Datos de la discapacidad
          </h2>

          {/* Titular */}
          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>¿Quién tiene la discapacidad?</legend>
            <div className={styles.radioGroup}>
              {([
                { value: 'contribuyente', label: 'El contribuyente' },
                { value: 'ascendiente', label: 'Un ascendiente (padre/madre)' },
                { value: 'descendiente', label: 'Un descendiente (hijo/a)' },
              ] as const).map((opt) => (
                <label key={opt.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="titular"
                    value={opt.value}
                    checked={titular === opt.value}
                    onChange={() => setTitular(opt.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Nota requisitos ascendiente */}
          {titular === 'ascendiente' && (
            <div className={styles.infoBox} role="note">
              <span aria-hidden="true">ℹ️</span>
              <div>
                <strong>Requisitos para aplicar el mínimo por ascendiente:</strong>
                <ul>
                  <li>Edad ≥ 65 años o discapacidad reconocida ≥ 33%</li>
                  <li>Rentas del ascendiente ≤ {formatCurrency(DEDUCCIONES_IRPF_DISCAPACIDAD_2025.requisitosAscendiente.rentaMaxima)} anuales (excluidas las exentas)</li>
                  <li>Convivencia con el contribuyente o dependencia económica</li>
                </ul>
              </div>
            </div>
          )}

          {/* Nota requisitos descendiente */}
          {titular === 'descendiente' && (
            <div className={styles.infoBox} role="note">
              <span aria-hidden="true">ℹ️</span>
              <div>
                <strong>Requisitos para aplicar el mínimo por descendiente:</strong>
                <ul>
                  <li>Menor de 25 años o discapacidad reconocida ≥ 33% (sin límite de edad)</li>
                  <li>Rentas del descendiente ≤ {formatCurrency(8000)} anuales (excluidas las exentas)</li>
                  <li>Convivencia con el contribuyente</li>
                </ul>
              </div>
            </div>
          )}

          {/* Grado */}
          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>Grado de discapacidad reconocida</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="grado"
                  value="33a65"
                  checked={grado === '33a65'}
                  onChange={() => setGrado('33a65')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>Del 33% al 64%</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="grado"
                  value="65oMas"
                  checked={grado === '65oMas'}
                  onChange={() => setGrado('65oMas')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>65% o superior</span>
              </label>
            </div>
          </fieldset>

          {/* Asistencia */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={necesitaAsistencia}
                onChange={(e) => setNecesitaAsistencia(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>
                Necesita asistencia de terceras personas o tiene movilidad reducida
              </span>
            </label>
            <p className={styles.helpText}>
              Añade {formatCurrency(3000)} adicionales al mínimo si se acredita la necesidad de ayuda
              de terceros o movilidad reducida (certificado oficial).
            </p>
          </div>

          {/* Tipo marginal */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tipoMarginal">
              Tipo marginal IRPF aproximado
            </label>
            <select
              id="tipoMarginal"
              className={styles.select}
              value={tipoMarginal}
              onChange={(e) => setTipoMarginal(Number(e.target.value))}
            >
              {TIPOS_MARGINALES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {formatNumber(tipo, 0)}% {tipo === 19 ? '(hasta 12.450 €)' :
                    tipo === 24 ? '(12.450 – 20.200 €)' :
                    tipo === 30 ? '(20.200 – 35.200 €)' :
                    tipo === 37 ? '(35.200 – 60.000 €)' :
                    tipo === 45 ? '(60.000 – 300.000 €)' :
                    '(más de 300.000 €)'}
                </option>
              ))}
            </select>
            <p className={styles.helpText}>
              Si no conoces tu tipo marginal, selecciona el tramo que corresponda a tu base imponible anual.
            </p>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={calcular}
              aria-label="Estimar ahorro fiscal por discapacidad"
            >
              Estimar ahorro
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={limpiar}
              aria-label="Limpiar formulario"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Resultados ──────────────────────────────────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">📊</span> Resultado estimado
          </h2>

          {!resultado ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">♿</span>
              <p>Completa los datos y pulsa &quot;Estimar ahorro&quot; para ver el resultado</p>
            </div>
          ) : (
            <>
              <div className={styles.resultGrid}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Mínimo por discapacidad</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.minimoDiscapacidad)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Gastos de asistencia</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.gastosAsistencia)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Total mínimo aplicable</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.totalMinimo)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Tipo marginal aplicado</span>
                  <span className={styles.resultValue}>{formatNumber(resultado.tipoMarginal, 0)}%</span>
                </div>
              </div>

              <div className={styles.resultadoFinal}>
                <p className={styles.resultadoLabel}>Ahorro fiscal estimado</p>
                <p className={styles.resultadoValor}>{formatCurrency(resultado.ahorroEstimado)}</p>
                <span className={styles.resultadoBadge}>al año</span>
              </div>

              <div className={styles.resultNote} role="note">
                <span aria-hidden="true">💡</span>
                <p>
                  El mínimo por discapacidad <strong>reduce la base liquidable</strong>, no la cuota directamente.
                  El ahorro real depende de la situación personal completa (otros mínimos, deducciones
                  autonómicas, reducciones aplicables, etc.).
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Sección educativa v2.0 ─────────────────────────────────────── */}
      <EducationalSection title="Todo sobre los mínimos por discapacidad en IRPF" subtitle="Guía completa sobre deducciones y mínimos personales">
        {/* Conceptos clave */}
        <h3>¿Cómo funcionan los mínimos por discapacidad en IRPF?</h3>
        <p>
          Los mínimos personales y familiares por discapacidad son cantidades que se restan
          de la base liquidable del IRPF antes de calcular la cuota. No son una deducción directa
          sobre lo que pagas, sino una reducción de la base sobre la que se aplican los tipos
          impositivos. En la práctica, el ahorro real es el mínimo multiplicado por tu tipo
          marginal.
        </p>
        <p>
          El certificado de discapacidad debe estar emitido por el organismo competente de tu
          Comunidad Autónoma (IMSERSO o equivalente autonómico) con un grado reconocido igual
          o superior al 33%.
        </p>

        <h3>Diferencia entre &quot;deducción&quot; y &quot;mínimo personal&quot;</h3>
        <p>
          Es habitual confundir ambos conceptos. Una <strong>deducción</strong> se resta directamente
          de la cuota del IRPF (euro por euro). Un <strong>mínimo personal o familiar</strong> se
          resta de la base imponible, por lo que su efecto depende del tipo marginal. Un mínimo
          de {formatCurrency(3000)} no ahorra {formatCurrency(3000)}, sino {formatCurrency(3000)} × tipo marginal
          (por ejemplo, al 24% ahorrarías {formatCurrency(720)}).
        </p>

        <h3>Requisitos para ascendientes y descendientes</h3>
        <p>
          Para aplicar el mínimo por discapacidad de un familiar, este debe cumplir las condiciones
          generales del mínimo por ascendiente o descendiente:
        </p>
        <ul>
          <li><strong>Ascendiente:</strong> edad ≥ 65 años (o cualquier edad si tiene discapacidad ≥ 33%),
            rentas ≤ {formatCurrency(8000)}/año, convivencia con el contribuyente.</li>
          <li><strong>Descendiente:</strong> menor de 25 años (o cualquier edad si tiene discapacidad ≥ 33%),
            rentas ≤ {formatCurrency(8000)}/año, convivencia con el contribuyente.</li>
          <li>Si dos contribuyentes tienen derecho (ej. ambos padres), el mínimo se reparte a partes iguales.</li>
        </ul>

        <h3>¿Qué cuenta como &quot;gastos de asistencia&quot;?</h3>
        <p>
          Los {formatCurrency(3000)} adicionales por gastos de asistencia se aplican cuando la persona
          con discapacidad acredita <strong>necesidad de ayuda de terceras personas</strong> o
          <strong> movilidad reducida</strong>. No es necesario justificar gastos concretos:
          basta con que el certificado de discapacidad recoja esta circunstancia. Las personas con
          discapacidad ≥ 65% también pueden aplicar este adicional.
        </p>

        {/* Tabla comparativa */}
        <h3>Tabla comparativa de mínimos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>33% – 64%</th>
                <th>≥ 65%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mínimo por discapacidad</td>
                <td>{formatCurrency(3000)}</td>
                <td>{formatCurrency(9000)}</td>
              </tr>
              <tr>
                <td>Gastos de asistencia (si procede)</td>
                <td>{formatCurrency(3000)}</td>
                <td>{formatCurrency(3000)}</td>
              </tr>
              <tr>
                <td>Total máximo</td>
                <td><strong>{formatCurrency(6000)}</strong></td>
                <td><strong>{formatCurrency(12000)}</strong></td>
              </tr>
              <tr>
                <td>Ahorro al 19%</td>
                <td>{formatCurrency(1140)}</td>
                <td>{formatCurrency(2280)}</td>
              </tr>
              <tr>
                <td>Ahorro al 30%</td>
                <td>{formatCurrency(1800)}</td>
                <td>{formatCurrency(3600)}</td>
              </tr>
              <tr>
                <td>Ahorro al 45%</td>
                <td>{formatCurrency(2700)}</td>
                <td>{formatCurrency(5400)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3>Ejemplos prácticos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍💼</span>
              <h4>Trabajador con discapacidad del 40%</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Salario bruto: {formatCurrency(28000)}/año. Tipo marginal: 30%.</p>
              <p>Mínimo: {formatCurrency(3000)}. Sin asistencia de terceros.</p>
              <p><strong>Ahorro: {formatCurrency(900)}/año</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              Revisa si tu CCAA tiene deducciones autonómicas adicionales por discapacidad.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👵</span>
              <h4>Madre con discapacidad del 70% que convive contigo</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Tu base imponible: {formatCurrency(40000)}. Tipo marginal: 37%.</p>
              <p>Mínimo: {formatCurrency(9000)} + {formatCurrency(3000)} asistencia = {formatCurrency(12000)}.</p>
              <p><strong>Ahorro: {formatCurrency(4440)}/año</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              Recuerda: la madre debe tener rentas propias ≤ {formatCurrency(8000)}/año.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👧</span>
              <h4>Hija con discapacidad del 50% y movilidad reducida</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Tu base imponible: {formatCurrency(22000)}. Tipo marginal: 30%.</p>
              <p>Mínimo: {formatCurrency(3000)} + {formatCurrency(3000)} asistencia = {formatCurrency(6000)}.</p>
              <p><strong>Ahorro: {formatCurrency(1800)}/año</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              Si ambos padres declaran, el mínimo se reparte al 50% cada uno.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🦽</span>
              <h4>Contribuyente con discapacidad ≥ 65% y asistencia</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Base imponible: {formatCurrency(50000)}. Tipo marginal: 37%.</p>
              <p>Mínimo: {formatCurrency(9000)} + {formatCurrency(3000)} asistencia = {formatCurrency(12000)}.</p>
              <p><strong>Ahorro: {formatCurrency(4440)}/año</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              Además del mínimo estatal, comprueba las deducciones autonómicas por discapacidad propia.
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Necesito presentar el certificado de discapacidad a Hacienda?</h4>
            <p>
              No es necesario adjuntarlo a la declaración, pero la AEAT puede requerirlo
              en caso de comprobación. Debes tener el certificado emitido por el organismo
              competente de tu CCAA antes de presentar la declaración.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Se puede aplicar el mínimo por discapacidad y el de edad a la vez?</h4>
            <p>
              Sí. Los mínimos por discapacidad son <strong>compatibles</strong> con los mínimos
              por edad (mayores de 65 o 75 años), por descendientes y por ascendientes.
              Se acumulan todos en la base liquidable.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa si la discapacidad se reconoce a mitad de año?</h4>
            <p>
              El mínimo se aplica proporcionalmente al período del año en que se tenga
              reconocida la discapacidad, excepto si es sobrevenida, en cuyo caso se puede
              aplicar por el ejercicio completo si la resolución tiene efectos retroactivos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿La incapacidad permanente equivale a discapacidad a efectos del IRPF?</h4>
            <p>
              La incapacidad permanente total, absoluta o gran invalidez reconocida por la
              Seguridad Social se asimila a un grado de discapacidad ≥ 33% (total) o ≥ 65%
              (absoluta/gran invalidez) a efectos del IRPF, sin necesidad de certificado
              adicional de discapacidad.
            </p>
            <div className={styles.faqTip}>
              Conserva la resolución del INSS como justificante.
            </div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Las Comunidades Autónomas tienen beneficios adicionales?</h4>
            <p>
              Sí. Muchas CCAA ofrecen deducciones autonómicas por discapacidad (propias o
              de familiares) que se suman a los mínimos estatales. Consulta la normativa de
              tu comunidad para maximizar el ahorro.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Puedo aplicar el mínimo si mi familiar vive en una residencia?</h4>
            <p>
              Depende. Si el familiar depende económicamente de ti y no tiene rentas superiores
              a {formatCurrency(8000)}/año, puede considerarse que existe dependencia a efectos
              del mínimo, aunque no haya convivencia física. Consulta con tu asesor fiscal.
            </p>
          </div>
        </div>

        {/* Tips */}
        <h3>Consejos para optimizar tu declaración</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📄</span>
            <h4>Solicita el certificado de discapacidad</h4>
            <p>
              Es el paso imprescindible. Sin certificado oficial no puedes aplicar ningún
              mínimo. El trámite es gratuito en tu CCAA.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <h4>Revisa las deducciones autonómicas</h4>
            <p>
              Además de los mínimos estatales, tu CCAA puede ofrecer deducciones adicionales
              por discapacidad del contribuyente o familiares.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👥</span>
            <h4>Acuerda con tu pareja el reparto</h4>
            <p>
              Si ambos tenéis derecho al mínimo por un hijo con discapacidad, se reparte
              al 50%. A veces conviene que lo aplique quien tenga mayor tipo marginal.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <h4>Solicita la revisión de grado</h4>
            <p>
              Si tu situación funcional ha empeorado significativamente, tienes derecho a solicitar
              la revisión del grado. Si pasaras del tramo 33-64% al ≥65%, el mínimo fiscal aplicable
              pasa de {formatCurrency(3000)} a {formatCurrency(9000)}.
            </p>
          </div>
        </div>

        {/* Warning box v2.0 */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Limitaciones importantes de esta herramienta</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Estimación simplificada:</strong> el ahorro real depende de la declaración
              completa (otros mínimos, reducciones, deducciones autonómicas y situación familiar).
            </li>
            <li>
              <strong>Solo mínimos estatales:</strong> no incluye las deducciones autonómicas
              por discapacidad que varían según la CCAA.
            </li>
            <li>
              <strong>Tipo marginal fijo:</strong> en la realidad, el mínimo puede abarcar
              dos tramos de IRPF, alterando ligeramente el ahorro efectivo.
            </li>
            <li>
              <strong>No sustituye al asesor fiscal:</strong> ante situaciones complejas
              (varios familiares, separación, revisiones de grado), consulta siempre
              con un profesional cualificado.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimacion-deduccion-discapacidad')} />
      <ShareCard appName="estimacion-deduccion-discapacidad" />
      <Footer appName="estimacion-deduccion-discapacidad" />
    </div>
  );
}
