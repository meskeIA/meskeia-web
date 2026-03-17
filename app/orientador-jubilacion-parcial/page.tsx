'use client';

import { useState } from 'react';
import styles from './OrientadorJubilacionParcial.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  REQUISITOS_JUBILACION_PARCIAL,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ResultadoJubilacionParcial {
  posible: boolean;
  cumpleEdad: boolean;
  cumpleCotizacion: boolean;
  cumpleReduccion: boolean;
  motivoImpedimento: string;
  pensionParcialMensual: number;
  salarioParcialMensual: number;
  ingresosTotalesMensual: number;
  diferenciaVsJubilacionCompleta: number;
  diferenciaVsTrabajo: number;
  porcentajeIngresosSobreSueldo: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function orientarJubilacionParcial(
  edadActual: number,
  anosCotizados: number,
  reduccionJornada: number,
  salarioBrutoMensual: number,
  pensionOrdinaria: number
): ResultadoJubilacionParcial {
  const req = REQUISITOS_JUBILACION_PARCIAL;

  const cumpleEdad = edadActual >= req.edadMinima;
  const cumpleCotizacion = anosCotizados >= req.anosCotizadosMinimos;
  const cumpleReduccion = reduccionJornada >= req.reduccionJornadaMin && reduccionJornada <= req.reduccionJornadaMax;

  let motivoImpedimento = '';
  if (!cumpleEdad) {
    motivoImpedimento = `Se necesitan al menos ${req.edadMinima} años de edad. Tienes ${edadActual}.`;
  } else if (!cumpleCotizacion) {
    motivoImpedimento = `Se necesitan ${req.anosCotizadosMinimos} años cotizados. Tienes ${anosCotizados}.`;
  } else if (!cumpleReduccion) {
    motivoImpedimento = `La reducción de jornada debe estar entre ${req.reduccionJornadaMin}% y ${req.reduccionJornadaMax}%.`;
  }

  const posible = cumpleEdad && cumpleCotizacion && cumpleReduccion;

  // Pensión parcial = fracción de reducción de jornada × pensión ordinaria
  const fraccion = reduccionJornada / 100;
  const pensionParcialMensual = pensionOrdinaria * fraccion;

  // Salario parcial = jornada restante × salario
  const salarioParcialMensual = salarioBrutoMensual * (1 - fraccion);

  const ingresosTotalesMensual = pensionParcialMensual + salarioParcialMensual;
  const diferenciaVsJubilacionCompleta = ingresosTotalesMensual - pensionOrdinaria;
  const diferenciaVsTrabajo = ingresosTotalesMensual - salarioBrutoMensual;
  const porcentajeIngresosSobreSueldo = salarioBrutoMensual > 0
    ? (ingresosTotalesMensual / salarioBrutoMensual) * 100
    : 0;

  return {
    posible,
    cumpleEdad,
    cumpleCotizacion,
    cumpleReduccion,
    motivoImpedimento,
    pensionParcialMensual,
    salarioParcialMensual,
    ingresosTotalesMensual,
    diferenciaVsJubilacionCompleta,
    diferenciaVsTrabajo,
    porcentajeIngresosSobreSueldo,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorJubilacionParcial() {
  const [edadActual, setEdadActual] = useState('');
  const [anosCotizados, setAnosCotizados] = useState('');
  const [reduccionJornada, setReduccionJornada] = useState('50');
  const [salarioBruto, setSalarioBruto] = useState('');
  const [pensionOrdinaria, setPensionOrdinaria] = useState('');
  const [resultado, setResultado] = useState<ResultadoJubilacionParcial | null>(null);
  const [error, setError] = useState('');

  function orientar() {
    setError('');
    const edad = parseInt(edadActual);
    const anos = parseFloat(anosCotizados.replace(',', '.'));
    const reduccion = parseFloat(reduccionJornada.replace(',', '.'));
    const salario = parseFloat(salarioBruto.replace(',', '.'));
    const pension = parseFloat(pensionOrdinaria.replace(',', '.'));

    if (isNaN(edad) || edad < 55 || edad > 70) { setError('Introduce tu edad actual (entre 55 y 70).'); return; }
    if (isNaN(anos) || anos < 1 || anos > 50) { setError('Introduce los años cotizados (entre 1 y 50).'); return; }
    if (isNaN(reduccion) || reduccion < 25 || reduccion > 75) { setError('La reducción de jornada debe estar entre 25% y 75%.'); return; }
    if (isNaN(salario) || salario <= 0) { setError('Introduce tu salario bruto mensual actual.'); return; }
    if (isNaN(pension) || pension <= 0) { setError('Introduce tu pensión ordinaria estimada.'); return; }

    setResultado(orientarJubilacionParcial(edad, anos, reduccion, salario, pension));
  }

  const req = REQUISITOS_JUBILACION_PARCIAL;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Orientador de Jubilación Parcial</h1>
        <p className={styles.subtitle}>Trabaja y cobra pensión a la vez · Requisitos y cálculo SS 2025</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es SOLO orientativa. Los requisitos concretos dependen de tu situación personal, convenio colectivo y acuerdo con el empleador.
          <br /><strong>No es</strong> asesoramiento previsional ni laboral personalizado.
          <br />El contrato de relevo es obligatorio para el empleador y su incumplimiento impide la jubilación parcial. Verificado en {FISCAL_PENSIONES_META.vigencia}.
          <br /><strong>Consulta con la Seguridad Social y tu empresa</strong> antes de solicitar la jubilación parcial.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          <NumberInput
            value={edadActual}
            onChange={setEdadActual}
            label="Edad actual"
            placeholder="Ej: 62"
            helperText={`Requisito mínimo: ${req.edadMinima} años cumplidos.`}
            min={55}
            max={70}
          />

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="Años cotizados"
            placeholder="Ej: 35"
            helperText={`Requisito mínimo: ${req.anosCotizadosMinimos} años. Consúltalos en importass.seg-social.es`}
            min={1}
            max={50}
          />

          <NumberInput
            value={reduccionJornada}
            onChange={setReduccionJornada}
            label={`Porcentaje de reducción de jornada (${req.reduccionJornadaMin}%–${req.reduccionJornadaMax}%)`}
            placeholder="50"
            helperText="Porcentaje de tu jornada habitual que dejarás de trabajar."
            min={25}
            max={75}
          />

          <NumberInput
            value={salarioBruto}
            onChange={setSalarioBruto}
            label="Salario bruto mensual actual (€/mes)"
            placeholder="Ej: 2.500"
            helperText="Tu salario bruto mensual completo (jornada 100%)."
            min={100}
            max={50000}
          />

          <NumberInput
            value={pensionOrdinaria}
            onChange={setPensionOrdinaria}
            label="Pensión ordinaria estimada (€/mes)"
            placeholder="Ej: 1.600"
            helperText="Obtenla del Estimador de Pensión Pública o del simulador oficial de la SS."
            min={100}
            max={10000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={orientar} aria-label="Orientar jubilación parcial">
            Orientarme sobre jubilación parcial
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para recibir orientación sobre la jubilación parcial.
            </p>
          ) : (
            <div className={styles.resultados}>
              {/* Estado */}
              {resultado.posible ? (
                <div className={styles.statusOk} role="status">
                  ✅ En principio, podrías acogerte a la jubilación parcial
                </div>
              ) : (
                <div className={styles.statusNok} role="alert">
                  ❌ No cumples los requisitos actuales
                  <br /><small className={styles.smallNormal}>{resultado.motivoImpedimento}</small>
                </div>
              )}

              {/* Requisitos */}
              <div className={styles.requisitosGrid}>
                <div className={`${styles.requisitoItem} ${resultado.cumpleEdad ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleEdad ? '✓' : '✗'} Edad (≥ {req.edadMinima} años)
                </div>
                <div className={`${styles.requisitoItem} ${resultado.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleCotizacion ? '✓' : '✗'} Cotización (≥ {req.anosCotizadosMinimos} años)
                </div>
                <div className={`${styles.requisitoItem} ${resultado.cumpleReduccion ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleReduccion ? '✓' : '✗'} Jornada reducida ({req.reduccionJornadaMin}%–{req.reduccionJornadaMax}%)
                </div>
                <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                  ℹ Contrato de relevo (empleador)
                </div>
              </div>

              {resultado.posible && (
                <>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Pensión parcial mensual</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.pensionParcialMensual)}/mes</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Salario parcial bruto mensual</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.salarioParcialMensual)}/mes</span>
                  </div>

                  <div className={`${styles.resultItem}`}>
                    <span className={styles.resultLabel}>Ingresos totales mensuales combinados</span>
                    <span className={styles.resultValueBig}>{formatCurrency(resultado.ingresosTotalesMensual)}/mes</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>% sobre tu sueldo actual</span>
                    <span className={styles.resultValuePositive}>{formatNumber(resultado.porcentajeIngresosSobreSueldo, 1)}%</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                    Comparativa con otras opciones:
                  </p>

                  <div className={styles.comparativaGrid}>
                    <div className={styles.comparativaItem}>
                      <div className={styles.comparativaLabel}>Solo trabajar</div>
                      <div className={styles.comparativaValue}>{formatCurrency(parseFloat(salarioBruto.replace(',', '.')) || 0)}</div>
                    </div>
                    <div className={`${styles.comparativaItem} ${styles.comparativaHighlight}`}>
                      <div className={styles.comparativaLabel}>Jubilación parcial</div>
                      <div className={styles.comparativaValue}>{formatCurrency(resultado.ingresosTotalesMensual)}</div>
                    </div>
                    <div className={styles.comparativaItem}>
                      <div className={styles.comparativaLabel}>Jubilación completa</div>
                      <div className={styles.comparativaValue}>{formatCurrency(parseFloat(pensionOrdinaria.replace(',', '.')) || 0)}</div>
                    </div>
                    <div className={styles.comparativaItem}>
                      <div className={styles.comparativaLabel}>Diferencia vs trabajar</div>
                      <div className={styles.comparativaValue}>{formatCurrency(resultado.diferenciaVsTrabajo)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué es la jubilación parcial en España?" subtitle="Compatibilidad trabajo y pensión, contrato de relevo · SS 2025">
        <p>La jubilación parcial permite acceder a una parte de la pensión de jubilación mientras se sigue trabajando a jornada reducida. El porcentaje de pensión que se recibe equivale al porcentaje de reducción de jornada acordado.</p>
        <h3>Requisitos principales (régimen general)</h3>
        <ul>
          <li><strong>Edad mínima</strong>: {req.edadMinima} años cumplidos.</li>
          <li><strong>Cotización mínima</strong>: {req.anosCotizadosMinimos} años (con contrato de relevo simultáneo).</li>
          <li><strong>Reducción de jornada</strong>: entre {req.reduccionJornadaMin}% y {req.reduccionJornadaMax}% de la jornada habitual.</li>
          <li><strong>Contrato de relevo</strong>: el empleador está obligado a contratar a un relevista que cubra la parte de jornada liberada.</li>
        </ul>
        <h3>¿Cómo se calcula la pensión parcial?</h3>
        <p>La pensión parcial equivale al porcentaje de reducción de jornada aplicado sobre la pensión que te correspondería si te jubilaras completamente. No se aplican coeficientes reductores por anticipación.</p>
        <h3>Ventajas e inconvenientes</h3>
        <ul>
          <li><strong>Ventaja</strong>: Transición suave entre trabajo pleno y jubilación completa, con ingresos combinados generalmente superiores a la pensión sola.</li>
          <li><strong>Ventaja</strong>: Se siguen acumulando años de cotización, lo que puede mejorar la pensión definitiva.</li>
          <li><strong>Inconveniente</strong>: Requiere acuerdo del empleador y formalización de contrato de relevo, lo que no siempre es posible.</li>
        </ul>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Jubilación parcial: requisitos según modalidad</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Característica</th>
              <th>Con contrato de relevo</th>
              <th>Sin contrato de relevo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Edad mínima</td>
              <td>62 años (o 60 con 33+ años cotizados)</td>
              <td>Edad legal de jubilación</td>
            </tr>
            <tr>
              <td>Años cotizados mínimos</td>
              <td>25 años</td>
              <td>15 años</td>
            </tr>
            <tr>
              <td>Reducción de jornada</td>
              <td>25%-75% (hasta 85% en ciertos casos)</td>
              <td>50% máximo</td>
            </tr>
            <tr>
              <td>% pensión cobrada</td>
              <td>Proporcional a reducción de jornada</td>
              <td>Proporcional a reducción de jornada</td>
            </tr>
            <tr>
              <td>Cotización durante parcial</td>
              <td>Al 100% (por el relevista también)</td>
              <td>Solo por tiempo trabajado</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👷</span>
            <strong>Trabajador industrial con 63 años</strong>
          </div>
          <p>30 años cotizados, quiere reducir jornada al 50% y cobra el 50% de la pensión mientras sigue trabajando. La empresa contrata relevista.</p>
          <div className={styles.escenarioExample}>Ejemplo: Pensión estimada 1.500 €/mes → cobra 750 € + salario 50% jornada</div>
          <div className={styles.escenarioTip}>💡 Durante la parcial, sigue cotizando al 100%, mejorando la pensión final.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👩‍💼</span>
            <strong>Directiva que quiere transición gradual</strong>
          </div>
          <p>62 años, 28 cotizados. Prefiere reducir al 25% de jornada los últimos 3 años. Cobra 25% de pensión y sigue siendo directiva parcial.</p>
          <div className={styles.escenarioExample}>Ingresos: Salario 25% + pensión parcial 25% = ~75-80% ingreso anterior</div>
          <div className={styles.escenarioTip}>💡 La reducción mínima del 25% es la opción menos penalizadora en términos de ingresos.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏢</span>
            <strong>Empresa con problemas para retener talento sénior</strong>
          </div>
          <p>La jubilación parcial permite a la empresa retener conocimiento sénior mientras incorpora nuevo talento (relevista) con menor coste salarial.</p>
          <div className={styles.escenarioExample}>Win-win: empresa mantiene conocimiento, trabajador hace transición gradual</div>
          <div className={styles.escenarioTip}>💡 El relevista puede ser un contrato indefinido o temporal según el caso y la normativa vigente.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👴</span>
            <strong>Persona con dificultad para trabajo a jornada completa</strong>
          </div>
          <p>Problemas de salud o fatiga que impiden la jornada completa pero no la incapacidad. La jubilación parcial es una solución intermedia adecuada.</p>
          <div className={styles.escenarioExample}>Reducción 50%: media jornada + 50% pensión = ingresos dignos con menos esfuerzo</div>
          <div className={styles.escenarioTip}>💡 Valorar también la incapacidad parcial si las limitaciones son reconocibles médicamente.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre jubilación parcial</h3>
        <div className={styles.faqItem}>
          <strong>¿Qué es el contrato de relevo?</strong>
          <p>Es el contrato que obliga a la empresa a contratar a un relevista (nuevo trabajador) cuando el jubilado parcial reduce su jornada. El relevista cubre la jornada liberada.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La empresa está obligada a aceptar la jubilación parcial?</strong>
          <p>No, requiere acuerdo entre trabajador y empresa. El trabajador no puede imponerla unilateralmente. Sin embargo, la empresa tampoco puede negarla sin causa si hay convenio colectivo que la regule.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo se calcula la pensión final al jubilarse definitivamente?</strong>
          <p>Durante la jubilación parcial se sigue cotizando al 100%, lo que mejora la base reguladora final. La pensión definitiva será mayor que si se hubiera jubilado parcialmente sin cotización completa.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo cambiar el porcentaje de reducción de jornada?</strong>
          <p>Sí, con acuerdo entre empresa y trabajador, se puede modificar el porcentaje de reducción dentro de los márgenes legales (25%-75% con relevo).</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La jubilación parcial afecta a la pensión de viudedad del cónyuge?</strong>
          <p>No, la cotización al 100% durante la jubilación parcial protege la base reguladora. La pensión definitiva no se reduce por haber estado en jubilación parcial.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede compatibilizar con trabajo en otra empresa?</strong>
          <p>Durante la jubilación parcial sigues siendo trabajador activo. No puedes trabajar para otra empresa en la actividad reducida, pero sí en actividades distintas si el contrato lo permite.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo tributa la pensión parcial en IRPF?</strong>
          <p>La pensión parcial tributa como rendimiento del trabajo igual que la pensión completa. Al cobrar también salario, ambos se acumulan en la base imponible general del IRPF.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede pasar de jubilación parcial a total antes de la edad legal?</strong>
          <p>Si cumples los requisitos de jubilación anticipada (voluntaria o involuntaria), sí es posible. En caso contrario, debes esperar a la edad legal para la jubilación total.</p>
          <div className={styles.faqTip}>💡 Planificar con el asesor laboral antes de iniciar la jubilación parcial para prever todas las opciones.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo acceder a la jubilación parcial paso a paso</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Verifica si cumples los requisitos</strong>
            <p>Comprueba tu edad, años cotizados y convenio colectivo aplicable. Este orientador te ayuda con el cálculo. La edad mínima con relevo es 62 años (en 2025).</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Negocia con la empresa el porcentaje de reducción</strong>
            <p>Decide qué porcentaje de jornada reducirás (25%-75%). Esto determinará la pensión parcial y el salario que cobrarás simultáneamente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>La empresa contrata al relevista</strong>
            <p>La empresa debe contratar a un trabajador relevista para cubrir la jornada liberada. Sin relevista no hay jubilación parcial con relevo.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Firma el novación contractual</strong>
            <p>Se modifica tu contrato de trabajo para reflejar la reducción de jornada. Firma también el contrato de relevo con el nuevo trabajador como testigo.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Solicita la pensión parcial al INSS</strong>
            <p>Con la documentación del nuevo contrato de trabajo a tiempo parcial, solicita la pensión de jubilación parcial en el INSS. Puedes hacerlo online o presencialmente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Inicio del cobro</strong>
            <p>Tras la resolución del INSS, empiezas a cobrar la pensión parcial simultáneamente con el salario reducido. La cotización se mantiene al 100%.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🗓️</div>
          <strong>Negocia con tiempo</strong>
          <p>La empresa necesita tiempo para buscar al relevista. Planifica la jubilación parcial con 3-6 meses de antelación para facilitar la transición.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📊</div>
          <strong>Calcula el impacto real en ingresos</strong>
          <p>Suma el salario reducido más la pensión parcial y compáralo con el salario actual. En muchos casos el total es el 80-85% del ingreso anterior.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏦</div>
          <strong>Mantén la cotización al 100%</strong>
          <p>El gran beneficio de la jubilación parcial con relevo es seguir cotizando al 100% aunque trabajes menos. Esto mejora la pensión final definitiva.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💡</div>
          <strong>Aprovecha el período para planificar</strong>
          <p>Los años de jubilación parcial son ideales para planificar la transición a la jubilación total: organiza finanzas, hobbies y rutinas antes del retiro completo.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>⚖️</div>
          <strong>Consulta el convenio colectivo</strong>
          <p>Algunos convenios tienen condiciones más favorables para la jubilación parcial que la ley general. Verifica el tuyo antes de negociar con la empresa.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👥</div>
          <strong>Involucra a los representantes sindicales</strong>
          <p>En empresas con representación sindical, los delegados pueden facilitar la negociación y asegurar que se respetan todos los derechos en el proceso.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes en la jubilación parcial</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Confundir jubilación parcial con reducción de jornada ordinaria</strong>: Son figuras distintas. La reducción de jornada no genera pensión parcial; la jubilación parcial sí, pero requiere relevo.</li>
          <li><strong>No verificar que la empresa contrata al relevista correctamente</strong>: Si el contrato de relevo no cumple los requisitos legales, el INSS puede denegar la pensión parcial.</li>
          <li><strong>Desconocer que la empresa puede negarse</strong>: A diferencia de la reducción de jornada por conciliación, la jubilación parcial requiere acuerdo. La empresa puede negarse si no es conveniente operativamente.</li>
          <li><strong>No calcular el impacto fiscal</strong>: Cobrar salario y pensión simultáneamente puede elevar el tipo efectivo de IRPF. Calcular la retención adecuada evita sorpresas en la declaración.</li>
          <li><strong>Iniciar sin asesoramiento laboral</strong>: Los detalles del contrato de relevo, la cotización y los cálculos de pensión son complejos. Un gestor laboral evita errores costosos.</li>
          <li><strong>No planificar la transición a jubilación total</strong>: La jubilación parcial es temporal. No planificar cuándo y cómo pasar a la jubilación total puede generar incertidumbre económica.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-jubilacion-parcial')} />
      <ShareCard appName="orientador-jubilacion-parcial" />
      <Footer appName="orientador-jubilacion-parcial" />
    </div>
  );
}
