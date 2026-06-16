'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraCostesTeletrabajo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Días laborables por mes (aprox.)
const DIAS_MES = 21.7;

interface GastoItem {
  concepto: string;
  valorMes: number; // positivo = ahorro, negativo = coste extra
}

export default function CalculadoraCostesTeletrabajoPage() {
  // Inputs
  const [diasTeletrabajo, setDiasTeletrabajo] = useState(3);
  const [transporteMes, setTransporteMes] = useState('');      // coste transporte al mes si fueras todos los días
  const [almuerzoOficina, setAlmuerzoOficina] = useState('');  // coste almuerzo en oficina (por día)
  const [almuerzocasa, setAlmuerzocasa] = useState('');        // coste almuerzo en casa (por día)
  const [electricidad, setElectricidad] = useState('1.50');   // €/día extra en casa
  const [ropa, setRopa] = useState('');                        // presupuesto mensual ropa de trabajo

  // Helpers
  const parseNum = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const calculos = useMemo(() => {
    const fraccionTeletrabajo = diasTeletrabajo / 5;
    const diasTelesemana = diasTeletrabajo;
    const diasOficina = 5 - diasTeletrabajo;
    const diasOficinaAlMes = diasOficina * (DIAS_MES / 5);
    const diasTelaAlMes = diasTelesemana * (DIAS_MES / 5);

    // Transporte: se ahorra la parte proporcional al teletrabajo
    const transporteTotalMes = parseNum(transporteMes);
    const ahorroTransporte = transporteTotalMes * fraccionTeletrabajo;

    // Almuerzo: diferencia de coste (oficina vs casa) × días en casa
    const almuerzoDif = parseNum(almuerzoOficina) - parseNum(almuerzocasa);
    const ahorroAlmuerzo = almuerzoDif * diasTelaAlMes;

    // Electricidad: coste extra en casa × días en casa
    const costeElectricidad = -(parseNum(electricidad) * diasTelaAlMes);

    // Ropa de trabajo: ahorro proporcional
    const ahorroRopa = parseNum(ropa) * fraccionTeletrabajo;

    const total = ahorroTransporte + ahorroAlmuerzo + costeElectricidad + ahorroRopa;

    return {
      ahorroTransporte,
      ahorroAlmuerzo,
      costeElectricidad,
      ahorroRopa,
      total,
      totalAnual: total * 12,
    };
  }, [diasTeletrabajo, transporteMes, almuerzoOficina, almuerzocasa, electricidad, ropa]);

  const hayDatos = transporteMes !== '' || almuerzoOficina !== '' || ropa !== '';

  const formatSigno = (v: number) => {
    if (v === 0) return '0,00 €';
    return (v > 0 ? '+' : '') + formatCurrency(v);
  };

  const claseImporte = (v: number) => {
    if (v > 0) return styles.positivo;
    if (v < 0) return styles.negativo;
    return styles.cero;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">💻</div>
        <h1 className={styles.title}>Calculadora Teletrabajo vs Oficina</h1>
        <p className={styles.subtitle}>Descubre cuánto ahorras (o gastas) trabajando desde casa</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={false}
      />

      {/* Inputs */}
      <div className={styles.mainGrid}>
        {/* Izquierda — Días y Transporte */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">🏠</span> Tu situación</h2>

          <div className={styles.field}>
            <label className={styles.label}>
              Días de teletrabajo a la semana: <strong>{diasTeletrabajo}</strong>
            </label>
            <div className={styles.sliderRow}>
              <span>0</span>
              <input
                type="range"
                min={1}
                max={5}
                value={diasTeletrabajo}
                onChange={e => setDiasTeletrabajo(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label={`Días de teletrabajo: ${diasTeletrabajo}`}
              />
              <span>5</span>
            </div>
            <span className={styles.helperText}>
              {5 - diasTeletrabajo} día{5 - diasTeletrabajo !== 1 ? 's' : ''} en oficina
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="transporte">
              Coste mensual de transporte (si fueras todos los días)
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="transporte"
                type="number"
                min={0}
                step={5}
                value={transporteMes}
                onChange={e => setTransporteMes(e.target.value)}
                placeholder="80"
              />
              <span>€/mes</span>
            </div>
            <span className={styles.helperText}>Abono transporte, gasolina, parking…</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ropa">
              Presupuesto mensual en ropa de trabajo
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="ropa"
                type="number"
                min={0}
                step={5}
                value={ropa}
                onChange={e => setRopa(e.target.value)}
                placeholder="30"
              />
              <span>€/mes</span>
            </div>
            <span className={styles.helperText}>Ropa formal, tintorería…</span>
          </div>
        </section>

        {/* Derecha — Comidas y Energía */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">🍽️</span> Comidas y energía</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="almuerzoOficina">
              Coste del almuerzo en la oficina (por día)
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="almuerzoOficina"
                type="number"
                min={0}
                step={0.5}
                value={almuerzoOficina}
                onChange={e => setAlmuerzoOficina(e.target.value)}
                placeholder="10"
              />
              <span>€/día</span>
            </div>
            <span className={styles.helperText}>Menú del día, restaurante, delivery…</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="almuerzoHz">
              Coste del almuerzo en casa (por día)
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="almuerzoHz"
                type="number"
                min={0}
                step={0.5}
                value={almuerzocasa}
                onChange={e => setAlmuerzocasa(e.target.value)}
                placeholder="4"
              />
              <span>€/día</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="electricidad">
              Coste extra de electricidad en casa (por día teletrabajado)
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="electricidad"
                type="number"
                min={0}
                step={0.1}
                value={electricidad}
                onChange={e => setElectricidad(e.target.value)}
                placeholder="1.50"
              />
              <span>€/día</span>
            </div>
            <span className={styles.helperText}>Estimación media: 1,00-2,00 €/día</span>
          </div>
        </section>
      </div>

      {/* Resultados */}
      {hayDatos ? (
        <>
          <section className={styles.resultadoSection}>
            <h2 className={styles.resultadoTitulo}>Resultado: teletrabajo {diasTeletrabajo} día{diasTeletrabajo !== 1 ? 's' : ''} por semana</h2>

            <div className={styles.resultadoGrid}>
              <div className={`${styles.resultCard} ${calculos.ahorroTransporte > 0 ? styles.ahorro : styles.neutro}`}>
                <span className={styles.resultValor}>{formatSigno(calculos.ahorroTransporte)}</span>
                <span className={styles.resultLabel}>Ahorro transporte</span>
              </div>
              <div className={`${styles.resultCard} ${calculos.ahorroAlmuerzo > 0 ? styles.ahorro : calculos.ahorroAlmuerzo < 0 ? styles.coste : styles.neutro}`}>
                <span className={styles.resultValor}>{formatSigno(calculos.ahorroAlmuerzo)}</span>
                <span className={styles.resultLabel}>Dif. comidas</span>
              </div>
              <div className={`${styles.resultCard} ${styles.coste}`}>
                <span className={styles.resultValor}>{formatSigno(calculos.costeElectricidad)}</span>
                <span className={styles.resultLabel}>Extra electricidad</span>
              </div>
              <div className={`${styles.resultCard} ${calculos.ahorroRopa > 0 ? styles.ahorro : styles.neutro}`}>
                <span className={styles.resultValor}>{formatSigno(calculos.ahorroRopa)}</span>
                <span className={styles.resultLabel}>Ahorro ropa</span>
              </div>
            </div>

            <div className={`${styles.totalBox} ${calculos.total >= 0 ? styles.ahorroTotal : styles.costeTotal}`}>
              <p className={styles.totalLabel}>{calculos.total >= 0 ? 'Ahorro neto mensual' : 'Coste neto mensual'}</p>
              <p className={styles.totalValorMes}>{formatSigno(calculos.total)}/mes</p>
              <p className={styles.totalValorAnual}>{formatSigno(calculos.totalAnual)}/año</p>
            </div>
          </section>

          <section className={styles.desgloseSection}>
            <h3 className={styles.desgloseTitulo}>Desglose detallado</h3>
            <div className={styles.desgloseGrid}>
              <div className={styles.desgloseRow}>
                <span className={styles.desgloseConcepto}>Ahorro transporte</span>
                <span className={`${styles.desgloseImporte} ${claseImporte(calculos.ahorroTransporte)}`}>{formatSigno(calculos.ahorroTransporte)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span className={styles.desgloseConcepto}>Diferencia comidas (oficina vs casa)</span>
                <span className={`${styles.desgloseImporte} ${claseImporte(calculos.ahorroAlmuerzo)}`}>{formatSigno(calculos.ahorroAlmuerzo)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span className={styles.desgloseConcepto}>Coste extra de electricidad</span>
                <span className={`${styles.desgloseImporte} ${claseImporte(calculos.costeElectricidad)}`}>{formatSigno(calculos.costeElectricidad)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span className={styles.desgloseConcepto}>Ahorro ropa de trabajo</span>
                <span className={`${styles.desgloseImporte} ${claseImporte(calculos.ahorroRopa)}`}>{formatSigno(calculos.ahorroRopa)}</span>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className={styles.emptyState}>
          Introduce al menos un gasto para ver el cálculo
        </div>
      )}

      <EducationalSection
        title="📚 Teletrabajo: impacto económico real"
        subtitle="Todo lo que necesitas saber sobre los costes y beneficios del trabajo remoto"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Teletrabajo vs. Oficina: comparativa de gastos</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Trabajando en oficina</th>
                  <th>En teletrabajo</th>
                  <th>Diferencia típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Transporte</td>
                  <td>60-200 €/mes</td>
                  <td>0-30 €/mes</td>
                  <td>+50-170 €/mes ahorro</td>
                </tr>
                <tr>
                  <td>Comidas (almuerzo)</td>
                  <td>8-15 €/día</td>
                  <td>2-5 €/día</td>
                  <td>+3-10 €/día ahorro</td>
                </tr>
                <tr>
                  <td>Electricidad</td>
                  <td>Sin cambio</td>
                  <td>+1-2 €/día extra</td>
                  <td>-20-45 €/mes coste</td>
                </tr>
                <tr>
                  <td>Calefacción/aire</td>
                  <td>Sin cambio</td>
                  <td>+0,5-1,5 €/día extra</td>
                  <td>-10-30 €/mes coste</td>
                </tr>
                <tr>
                  <td>Ropa de trabajo</td>
                  <td>20-60 €/mes</td>
                  <td>0-10 €/mes</td>
                  <td>+10-50 €/mes ahorro</td>
                </tr>
                <tr>
                  <td>Café/desayuno</td>
                  <td>1-3 €/día</td>
                  <td>0-0,50 €/día</td>
                  <td>+0,5-2,5 €/día ahorro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>4 perfiles: ¿a quién beneficia más el teletrabajo?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚇</span>
              <h3>El que usa transporte público</h3>
              <p>Con abono de 70 €/mes y 3 días de teletrabajo, ahorra hasta 42 €/mes solo en transporte. Suma el almuerzo y puede superar los 100 €/mes.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <h3>El que viene en coche</h3>
              <p>Gasolina + parking puede superar los 200 €/mes. El ahorro proporcional al teletrabajo puede ser muy significativo, además del tiempo ganado.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏙️</span>
              <h3>El que vive lejos de la oficina</h3>
              <p>A mayor distancia, mayor ahorro en transporte y tiempo. Un desplazamiento de 1 hora puede representar 500 horas al año "ganadas".</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏠</span>
              <h3>El que ya trabaja 100% remoto</h3>
              <p>Máximo ahorro en transporte y comidas, pero mayor gasto en electricidad y calefacción. La vivienda debe tener espacio de trabajo adecuado.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el teletrabajo</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Puedo deducir los gastos de teletrabajo en el IRPF?</h3>
              <p>En España, los trabajadores asalariados no tienen una deducción específica por teletrabajo. Los autónomos sí pueden deducir proporcionalmente los gastos del hogar destinados al trabajo (electricidad, internet, alquiler) si trabajan desde casa.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto sube la factura de la luz con el teletrabajo?</h3>
              <p>Según la OCU, el teletrabajo puede suponer un incremento de entre 300 y 600 €/año en la factura eléctrica a tiempo completo (PC, iluminación, climatización). Aproximadamente 1-2 €/día de media.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es obligatorio para la empresa compensar los gastos del teletrabajo?</h3>
              <p>La Ley de Trabajo a Distancia (Ley 10/2021) establece que la empresa debe compensar o abonar los gastos relacionados con el teletrabajo (electricidad, internet). Sin embargo, la forma exacta de compensación debe acordarse en el convenio colectivo o en el contrato.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ocurre si vivo lejos del trabajo y me piden volver?</h3>
              <p>Si cambiaste de residencia durante el período de teletrabajo y la empresa te exige volver a la presencialidad, debes consultar con un abogado laboral. La ley protege ciertos derechos adquiridos, aunque depende de lo que se acordó contractualmente.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El teletrabajo afecta a la cotización a la Seguridad Social?</h3>
              <p>No, la modalidad de teletrabajo no afecta a la cotización a la Seguridad Social. Se cotiza igual que en modalidad presencial, incluyendo contingencias comunes, desempleo y formación profesional.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa con las horas extras en teletrabajo?</h3>
              <p>La Ley de Trabajo a Distancia obliga a registrar la jornada laboral también en teletrabajo. El empleador debe garantizar el registro horario y el derecho a la desconexión digital fuera del horario laboral.</p>
            </div>
          </div>
        </section>

        {/* Guía */}
        <section className={styles.guideSection}>
          <h2>Cómo optimizar el gasto en teletrabajo: 6 pasos</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>1</div>
              <h3>Revisa tu tarifa eléctrica</h3>
              <p>Cambia al plan tarifario adecuado para quienes consumen más en horario de trabajo (9:00-14:00). La tarifa PVPC por horas puede ser más económica según tus hábitos.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <h3>Pide la compensación legal</h3>
              <p>Si tu empresa no compensa los gastos de teletrabajo, tienes derecho a solicitarla. La Ley 10/2021 ampara este derecho. Habla con tu empresa o representante sindical.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <h3>Planifica las comidas semanalmente</h3>
              <p>El batch cooking (preparar comidas en lotes los fines de semana) puede reducir el coste diario de almuerzo a 2-3 €, mejorando también la calidad nutricional.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>4</div>
              <h3>Optimiza el espacio de trabajo</h3>
              <p>Un buen setup evita gastos futuros: silla ergonómica, monitor externo, iluminación adecuada. La inversión inicial se amortiza rápido si el teletrabajo es permanente.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>5</div>
              <h3>Usa el transporte ahorrado en ejercicio</h3>
              <p>El tiempo ganado en desplazamientos se puede invertir en actividad física, reduciendo gastos de gimnasio y mejorando la salud. El ahorro es doble.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>6</div>
              <h3>Revisa el seguro de hogar</h3>
              <p>Si usas equipo de empresa en casa, verifica que tu seguro de hogar cubra los equipos informáticos. Algunas pólizas requieren una cláusula específica para uso profesional.</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 datos sobre el teletrabajo en España</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h3>Ahorro medio estimado: 150 €/mes</h3>
              <p>Según varios estudios, un trabajador que teletrabaja a tiempo completo puede ahorrar entre 100 y 300 €/mes en transporte, comidas y ropa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <h3>+1 hora diaria recuperada</h3>
              <p>El desplazamiento medio en España es de 30-45 minutos por trayecto. El teletrabajo devuelve 1-1,5 horas diarias que se pueden invertir en familia, ocio o descanso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌱</span>
              <h3>Reducción de huella de carbono</h3>
              <p>Un trabajador que prescinde del coche para ir a la oficina 3 días/semana puede evitar unas 2-3 toneladas de CO₂ al año, equivalente a plantar 100 árboles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏗️</span>
              <h3>España: solo el 13% teletrabaja</h3>
              <p>Según Eurostat, España está por debajo de la media europea en adopción del teletrabajo (13% vs 24% UE). Países como Países Bajos superan el 50%.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <h3>Bienestar y productividad</h3>
              <p>Estudios de Stanford muestran incrementos de productividad del 13% en teletrabajadores. Sin embargo, el aislamiento social puede ser un factor negativo si no se gestiona bien.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h3>Coste energético: la gran incógnita</h3>
              <p>El coste extra de electricidad en teletrabajo varía mucho según el tipo de vivienda, la época del año y la tarifa contratada. En invierno, la calefacción puede representar el 60% del extra.</p>
            </div>
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Lo que no cuenta la calculadora</h2>
          <div className={styles.warningGrid}>
            <div className={styles.warningItem}>
              <strong>1. El coste del tiempo perdido en desplazamientos</strong>
              <p>La calculadora computa dinero, no tiempo. Si tardas 1 hora en cada trayecto, son 2 horas/día × 250 días laborables = 500 horas al año "devueltas" con el teletrabajo.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>2. La amortización del equipo (silla, escritorio, pantalla)</strong>
              <p>Trabajar desde casa sin ergonomía adecuada genera costes de salud a largo plazo (dolor de espalda, cervicales). La inversión en un buen espacio de trabajo es real.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>3. El coste de internet más rápido</strong>
              <p>Si necesitas mejorar tu tarifa de internet por el teletrabajo, ese sobrecoste debe sumarse. También los datos de móvil si el Wi-Fi de casa no es fiable.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>4. El impacto en el precio del alquiler o hipoteca</strong>
              <p>Teletrabajar puede justificar vivir más lejos (ciudad más barata) o en un piso más grande (necesitas despacho), cambiando profundamente la ecuación económica.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>5. Los beneficios o seguros vinculados a la oficina</strong>
              <p>Algunos puestos incluyen ticket restaurante, seguro médico de empresa, seguro de vida o planes de pensiones. Verifica que esos beneficios se mantienen en teletrabajo.</p>
            </div>
            <div className={styles.warningItem}>
              <strong>6. El impacto en la carrera profesional</strong>
              <p>La visibilidad en la oficina puede afectar a las posibilidades de ascenso. Algunos estudios apuntan a que quienes teletrabajan 100% progresionan más lentamente en ciertos entornos.</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-costes-teletrabajo')} />
      <ShareCard appName="calculadora-costes-teletrabajo" />
      <Footer appName="calculadora-costes-teletrabajo" />
    </div>
  );
}
