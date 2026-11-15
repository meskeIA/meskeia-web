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
import {
  DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  FISCAL_IRPF_META,
  INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025,
  MINIMOS_IRPF_2025,
  NORMAS_MINIMOS_FAMILIARES_IRPF,
} from '@/data/fiscal';

import {
  calcularDeduccionDiscapacidadIRPF,
  type TitularDiscapacidad,
  type GradoDiscapacidad,
  type ResultadoDeduccionDiscapacidad,
} from '@/lib/calculadoras/deduccionDiscapacidadIRPF';

// ─── Datos de la guía, calculados con el mismo motor ─────────────────────────
// Hallazgo 4790 (15/11/2026): las cifras de la tabla y de los ejemplos iban escritas a mano.
// Ahora salen de data/fiscal y del motor, así que se mueven con ellos.

const D = DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente;
const MINIMO_PERSONAL = MINIMOS_IRPF_2025.personal;
const AHORRO_33 = calcularDeduccionDiscapacidadIRPF({ titular: 'contribuyente', grado: '33a65' }).ahorroEstimado;
const AHORRO_33_ASISTENCIA = calcularDeduccionDiscapacidadIRPF({
  titular: 'contribuyente', grado: '33a65', necesitaAsistencia: true,
}).ahorroEstimado;
const AHORRO_65 = calcularDeduccionDiscapacidadIRPF({ titular: 'contribuyente', grado: '65oMas' }).ahorroEstimado;
/** Rentas máximas del descendiente (art. 58.1 LIRPF, BOE-A-2006-20764, leído el 15/11/2026):
 * el mismo límite de 8.000 € que el art. 59.1 fija para el ascendiente. data/fiscal solo lo
 * declara con el nombre del ascendiente. */
const RENTAS_MAX_FAMILIAR = NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasAscendiente;
/** Porcentaje con espacio duro (U+00A0), como manda el formato español del proyecto. */
const PCT = ' %';

// ─── Tipos ────────────────────────────────────────────────────────────────────

// El cálculo vive en `lib/calculadoras/deduccionDiscapacidadIRPF.ts`, que es también lo que
// responde la tool `calcular_deduccion_discapacidad` del MCP de Delegum. Esta página es la
// interfaz: recoge las cuatro respuestas y muestra el desglose.
//
// Hasta el 10/09/2026 el cálculo estaba escrito dos veces. La regla del art. 60 LIRPF —los tres
// supuestos del incremento por gastos de asistencia son ALTERNATIVOS— llegó a estar mal en el
// motor y bien en esta página: quien preguntaba por un LLM perdía 3.000 € de mínimo que la web
// sí reconocía. Se reparó el 09/09 en los dos sitios; ahora ya solo hay uno que reparar.

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimacionDeduccionDiscapacidadPage() {
  const [titular, setTitular] = useState<TitularDiscapacidad>('contribuyente');
  const [grado, setGrado] = useState<GradoDiscapacidad>('33a65');
  const [necesitaAsistencia, setNecesitaAsistencia] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDeduccionDiscapacidad | null>(null);

  const calcular = useCallback(() => {
    setResultado(
      calcularDeduccionDiscapacidadIRPF({ titular, grado, necesitaAsistencia })
    );
  }, [titular, grado, necesitaAsistencia]);

  const limpiar = useCallback(() => {
    setTitular('contribuyente');
    setGrado('33a65');
    setNecesitaAsistencia(false);
    setResultado(null);
  }, []);

  return (
    <div className={styles.container}>

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
        normativa="Mínimos por discapacidad IRPF (arts. 60 y 61 de la Ley 35/2006)"
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
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
                  <li>Edad ≥ 65 años o discapacidad reconocida ≥ 33{PCT}</li>
                  <li>Rentas del ascendiente ≤ {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasAscendiente)} anuales (excluidas las exentas)</li>
                  <li>Convivencia con el contribuyente al menos {NORMAS_MINIMOS_FAMILIARES_IRPF.convivenciaMinima}.
                    Solo se asimila a la convivencia el ascendiente con discapacidad que, dependiendo
                    de ti, esté internado en un centro especializado (art. 59.1 LIRPF)</li>
                  <li>Si el ascendiente presenta declaración con rentas de más
                    de {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasDeclaracion)}, no hay
                    mínimo (art. 61.2.ª)</li>
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
                  <li>Menor de 25 años o discapacidad reconocida ≥ 33{PCT} (sin límite de edad)</li>
                  <li>Rentas del descendiente ≤ {formatCurrency(RENTAS_MAX_FAMILIAR)} anuales (excluidas las exentas)</li>
                  <li>Convivencia con el contribuyente (se asimila la dependencia económica, art. 58.1)</li>
                  <li>Si el descendiente presenta declaración con rentas de más
                    de {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasDeclaracion)}, no hay
                    mínimo (art. 61.2.ª)</li>
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
                <span className={styles.radioText}>Del 33{PCT} al 64{PCT}</span>
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
                <span className={styles.radioText}>65{PCT} o superior</span>
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
              Añade {formatCurrency(D.gastosAsistencia33a65)} adicionales al mínimo si se acredita la necesidad de ayuda
              de terceros o movilidad reducida (certificado oficial).
              <span>{grado === '65oMas' && (
                <span> Con un grado igual o superior al 65{PCT} estos {formatCurrency(D.gastosAsistencia65oMas)} se aplican
                  igualmente, aunque no marques la casilla: el grado es por sí solo uno de los tres
                  supuestos del artículo 60 de la Ley del IRPF.</span>
              )}</span>
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

          {/* Hallazgo 4788: región viva siempre montada, para que el lector anuncie el resultado. */}
          <div aria-live="polite">
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
                  <span className={styles.resultLabel}>Tipo al que se valora el mínimo</span>
                  <span className={styles.resultValue}>{formatNumber(resultado.tipoEfectivoAhorro, 2)}{PCT}</span>
                </div>
              </div>

              <div className={styles.resultadoFinal}>
                <p className={styles.resultadoLabel}>Ahorro fiscal estimado</p>
                <p className={styles.resultadoValor}>{formatCurrency(resultado.ahorroEstimado)}</p>
                <span className={styles.resultadoBadge}>al año</span>
              </div>

              <div className={styles.resultNote} role="note">
                <span aria-hidden="true">💡</span>
                <div>
                <p>
                  El mínimo por discapacidad <strong>no reduce la base liquidable</strong>: forma parte de
                  ella y se grava a <strong>tipo cero</strong>, aplicando la escala a la base completa y
                  restando de la cuota la misma escala aplicada al mínimo (art. 63.1.2.º LIRPF). Por eso el
                  ahorro <strong>no depende de tu tipo marginal</strong>: el mínimo se valora siempre a los
                  tipos bajos de la escala.
                </p>
                <p>
                  {/* Hallazgo 4783: la cifra solo es cierta si la base da cabida al mínimo entero. */}
                  La cifra supone que tu <strong>base liquidable general</strong> llega al menos
                  a <strong>{formatCurrency(MINIMO_PERSONAL + resultado.totalMinimo)}</strong> (el
                  mínimo personal de {formatCurrency(MINIMO_PERSONAL)} más este mínimo). Con una base
                  menor el mínimo no cabe entero y el ahorro es <strong>menor</strong>, hasta cero si
                  la base no pasa de {formatCurrency(MINIMO_PERSONAL)}. Con esa base o más, es una cota
                  inferior: si además tienes mínimos por descendientes o ascendientes, estos se apilan
                  debajo y el de discapacidad cae en tramos algo más altos.
                </p>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* ── Sección educativa v2.0 ─────────────────────────────────────── */}
      <EducationalSection title="Todo sobre los mínimos por discapacidad en IRPF" subtitle="Guía completa sobre deducciones y mínimos personales">
        {/* Conceptos clave */}
        <h3>¿Cómo funcionan los mínimos por discapacidad en IRPF?</h3>
        <p>
          Los mínimos personales y familiares por discapacidad <strong>no se restan de la base</strong>:
          forman parte de la base liquidable general y la ley los grava a <strong>tipo cero</strong>.
          Lo consigue aplicando la escala dos veces —a la base liquidable completa y a la parte
          que corresponde al mínimo— y restando la segunda cuota de la primera (art. 63.1.2.º LIRPF).
          La consecuencia es la que la norma persigue: el mínimo vale <strong>lo mismo para todo el
          mundo</strong> con las mismas circunstancias familiares, porque se valora a los tipos bajos
          de la escala y no al tipo marginal de quien declara.
        </p>
        <p>
          El certificado de discapacidad debe estar emitido por el organismo competente de tu
          Comunidad Autónoma (IMSERSO o equivalente autonómico) con un grado reconocido igual
          o superior al 33{PCT}.
        </p>

        <h3>Diferencia entre &quot;deducción&quot; y &quot;mínimo personal&quot;</h3>
        <p>
          Es habitual confundir ambos conceptos. Una <strong>deducción</strong> se resta directamente
          de la cuota del IRPF (euro por euro). Un <strong>mínimo personal o familiar</strong> no resta
          ni de la cuota ni de la base: se grava a tipo cero por la vía del art. 63.1.2.º, de modo que
          ahorra lo que la escala le aplicaría en los tramos donde cae, que son los bajos. Un mínimo
          de {formatCurrency(D.discapacidad33a65)} encima del mínimo personal no
          ahorra {formatCurrency(D.discapacidad33a65)}, sino {formatCurrency(AHORRO_33)} — el
          19{PCT}, tanto si ganas 20.000 € como si ganas 200.000 €.
        </p>

        <h3>Requisitos para ascendientes y descendientes</h3>
        <p>
          Para aplicar el mínimo por discapacidad de un familiar, este debe cumplir las condiciones
          generales del mínimo por ascendiente o descendiente:
        </p>
        <ul>
          <li><strong>Ascendiente:</strong> edad ≥ 65 años (o cualquier edad si tiene discapacidad ≥ 33{PCT}),
            rentas ≤ {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasAscendiente)}/año y
            convivencia con el contribuyente al menos {NORMAS_MINIMOS_FAMILIARES_IRPF.convivenciaMinima}.
            Solo se asimila a la convivencia el internamiento en un centro especializado del
            ascendiente con discapacidad que dependa de ti (art. 59.1).</li>
          <li><strong>Descendiente:</strong> menor de 25 años (o cualquier edad si tiene discapacidad ≥ 33{PCT}),
            rentas ≤ {formatCurrency(RENTAS_MAX_FAMILIAR)}/año, convivencia con el contribuyente o
            dependencia económica de él (art. 58.1).</li>
          <li>En los dos casos, no hay mínimo si el familiar presenta declaración con rentas de más
            de {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasDeclaracion)} (art. 61.2.ª).</li>
          <li>Si dos contribuyentes tienen derecho (ej. ambos padres), el mínimo se reparte a partes iguales.</li>
        </ul>

        <h3>¿Qué cuenta como &quot;gastos de asistencia&quot;?</h3>
        <p>
          Los {formatCurrency(D.gastosAsistencia33a65)} adicionales por gastos de asistencia se aplican ante cualquiera de
          estos <strong>tres supuestos alternativos</strong> (basta uno): acreditar
          <strong> necesidad de ayuda de terceras personas</strong>, acreditar
          <strong> movilidad reducida</strong>, o tener un <strong>grado de discapacidad igual o
          superior al 65{PCT}</strong>. No es necesario justificar gastos concretos: basta con que el
          certificado de discapacidad recoja la circunstancia, y con el grado ≥ 65{PCT} el propio grado
          da derecho al incremento sin acreditar nada más.
        </p>

        {/* Tabla comparativa */}
        <h3>Tabla comparativa de mínimos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>33{PCT} – 64{PCT}</th>
                <th>≥ 65{PCT}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mínimo por discapacidad</td>
                <td>{formatCurrency(D.discapacidad33a65)}</td>
                <td>{formatCurrency(D.discapacidad65oMas)}</td>
              </tr>
              <tr>
                <td>Gastos de asistencia (si procede)</td>
                <td>{formatCurrency(D.gastosAsistencia33a65)}</td>
                <td>{formatCurrency(D.gastosAsistencia65oMas)}</td>
              </tr>
              <tr>
                <td>Total máximo</td>
                <td><strong>{formatCurrency(D.discapacidad33a65 + D.gastosAsistencia33a65)}</strong></td>
                <td><strong>{formatCurrency(D.discapacidad65oMas + D.gastosAsistencia65oMas)}</strong></td>
              </tr>
              {/* Hallazgo 4781: el mínimo se grava a tipo cero (art. 63.1.2.º), así que hay UN
                  ahorro por columna, no uno por tipo marginal. */}
              <tr>
                <td>Ahorro en cuota con el total máximo (cualquier marginal)</td>
                <td>{formatCurrency(AHORRO_33_ASISTENCIA)}</td>
                <td>{formatCurrency(AHORRO_65)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          El ahorro es el mismo para cualquier tipo marginal porque el mínimo se valora en los tramos
          bajos de la escala, encima del mínimo personal. Supone una base liquidable general de al
          menos {formatCurrency(MINIMO_PERSONAL)} más el mínimo; con menos base, el ahorro es menor.
        </p>

        {/* Casos de uso */}
        <h3>Ejemplos prácticos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍💼</span>
              <h4>Trabajador con discapacidad del 40{PCT}</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Salario bruto: {formatCurrency(28000)}/año.</p>
              <p>Mínimo: {formatCurrency(D.discapacidad33a65)}. Sin asistencia de terceros.</p>
              <p><strong>Ahorro por el mínimo: {formatCurrency(AHORRO_33)}/año</strong> (el mínimo cae entero en el tramo del 19{PCT})</p>
            </div>
            <div className={styles.escenarioTip}>
              Esta herramienta solo calcula el mínimo. Como trabajador activo con discapacidad,
              el art. 19.2.f LIRPF le sube además los gastos deducibles del trabajo en{' '}
              {formatCurrency(INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025.general)} al año
              ({formatCurrency(INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025.asistenciaO65)} con
              ayuda de terceros, movilidad reducida o grado ≥ 65{PCT}), y ese incremento sí reduce
              la base y se valora a su tipo marginal. Revisa también las deducciones autonómicas.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👵</span>
              <h4>Madre con discapacidad del 70{PCT} que convive contigo</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Tu base imponible: {formatCurrency(40000)}.</p>
              <p>Mínimo: {formatCurrency(D.discapacidad65oMas)} + {formatCurrency(D.gastosAsistencia65oMas)} asistencia = {formatCurrency(D.discapacidad65oMas + D.gastosAsistencia65oMas)}.</p>
              <p><strong>Ahorro: {formatCurrency(AHORRO_65)}/año</strong> (parte al 19{PCT} y parte al 24{PCT}, no a tu marginal)</p>
            </div>
            <div className={styles.escenarioTip}>
              Recuerda: la madre debe tener rentas propias ≤ {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasAscendiente)}/año.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👧</span>
              <h4>Hija con discapacidad del 50{PCT} y movilidad reducida</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Tu base imponible: {formatCurrency(22000)}.</p>
              <p>Mínimo: {formatCurrency(D.discapacidad33a65)} + {formatCurrency(D.gastosAsistencia33a65)} asistencia = {formatCurrency(D.discapacidad33a65 + D.gastosAsistencia33a65)}.</p>
              <p><strong>Ahorro: {formatCurrency(AHORRO_33_ASISTENCIA)}/año</strong> (el mínimo cae entero en el tramo del 19{PCT})</p>
            </div>
            <div className={styles.escenarioTip}>
              Si ambos padres declaran, el mínimo se reparte al 50{PCT} cada uno.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🦽</span>
              <h4>Contribuyente con discapacidad ≥ 65{PCT}</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Base imponible: {formatCurrency(50000)}.</p>
              <p>Mínimo: {formatCurrency(D.discapacidad65oMas)} + {formatCurrency(D.gastosAsistencia65oMas)} asistencia = {formatCurrency(D.discapacidad65oMas + D.gastosAsistencia65oMas)}.</p>
              <p><strong>Ahorro: {formatCurrency(AHORRO_65)}/año</strong> — el mismo que con 40.000 € de base: el mínimo no se valora a tu marginal</p>
            </div>
            <div className={styles.escenarioTip}>
              Los {formatCurrency(D.gastosAsistencia65oMas)} de asistencia salen aquí del propio grado ≥ 65{PCT}: no hace falta
              acreditar además ayuda de terceros ni movilidad reducida. Comprueba también las deducciones
              autonómicas por discapacidad propia.
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
              No se prorratea. Las circunstancias personales y familiares se miran en la fecha de
              devengo del impuesto, normalmente el 31 de diciembre (art. 61.3.ª LIRPF): si a esa
              fecha tienes el grado reconocido, te corresponde el mínimo del año entero.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿La incapacidad permanente equivale a discapacidad a efectos del IRPF?</h4>
            <p>
              Los pensionistas de la Seguridad Social con incapacidad permanente total, absoluta
              o gran invalidez tienen acreditado un grado de discapacidad igual o superior al
              33{PCT} a efectos del IRPF, sin certificado adicional (art. 60.3 LIRPF): en la
              herramienta, «Del 33{PCT} al 64{PCT}». El grado igual o superior al 65{PCT} solo se
              presume cuando la incapacidad se declara judicialmente; para aplicarlo por otra vía
              hace falta el certificado con ese grado.
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
              Si es un ascendiente con discapacidad que depende de ti y está internado en un
              centro especializado, la ley lo considera conviviente (art. 59.1 LIRPF). Fuera de ese
              caso, el ascendiente que vive en otro sitio no genera el mínimo aunque dependa
              económicamente de ti. Un descendiente sí puede: el art. 58.1 asimila a la convivencia
              su dependencia económica. En los dos casos sus rentas no pueden pasar
              de {formatCurrency(NORMAS_MINIMOS_FAMILIARES_IRPF.rentasMaximasAscendiente)}/año.
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
            <h4>El reparto entre progenitores no se elige</h4>
            <p>
              Si ambos tenéis derecho al mínimo por un hijo con discapacidad, el art. 61.1.ª LIRPF
              obliga a prorratearlo <strong>por partes iguales</strong>: no es una opción que se
              negocie. Y tampoco habría nada que optimizar, porque el mínimo se grava a tipo cero
              y su valor no depende del tipo marginal de ninguno de los dos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <h4>Solicita la revisión de grado</h4>
            <p>
              Si tu situación funcional ha empeorado significativamente, tienes derecho a solicitar
              la revisión del grado. Si pasaras del tramo 33-64{PCT} al ≥ 65{PCT}, el mínimo fiscal aplicable
              pasa de {formatCurrency(D.discapacidad33a65)} a {formatCurrency(D.discapacidad65oMas)}.
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
              <strong>Solo el mínimo por discapacidad:</strong> no incluye el incremento de gastos
              deducibles para trabajadores activos con discapacidad (art. 19.2.f LIRPF:{' '}
              {formatCurrency(INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025.general)} al año, o{' '}
              {formatCurrency(INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025.asistenciaO65)} con
              ayuda de terceros, movilidad reducida o grado ≥ 65{PCT}), la
              deducción por descendiente o ascendiente con discapacidad a cargo (art. 81 bis), ni
              las deducciones autonómicas por discapacidad, que varían según la CCAA.
            </li>
            <li>
              <strong>Base suficiente:</strong> el ahorro se calcula apilando este mínimo sobre el
              mínimo personal de {formatCurrency(MINIMO_PERSONAL)}, y supone que tu base liquidable
              general da cabida a los dos. Con una base menor el ahorro es menor, hasta cero. Con
              base suficiente es una cota inferior: si además tienes mínimos por descendientes
              o ascendientes, estos se apilan debajo y el de discapacidad cae en tramos algo más
              altos, con lo que ahorrarías un poco más.
            </li>
            <li>
              <strong>No sustituye al asesor fiscal:</strong> ante situaciones complejas
              (varios familiares, separación, revisiones de grado), consulta siempre
              con un profesional cualificado.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="estimacion-deduccion-discapacidad" />
      <Footer appName="estimacion-deduccion-discapacidad" />
    </div>
  );
}
