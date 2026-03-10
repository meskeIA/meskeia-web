'use client';

import { useState } from 'react';
import styles from './SeguimientoCicloMenstrual.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ===== TIPOS =====
interface CicloPrediccion {
  numero: number;
  inicioPeriodo: Date;
  finPeriodo: Date;
  inicioVentanaFertil: Date;
  finVentanaFertil: Date;
  ovulacion: Date;
}

interface FaseActual {
  nombre: string;
  icon: string;
  descripcion: string;
  diaDelCiclo: number;
}

// ===== HELPERS =====
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatFecha(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFechaCorta(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function calcularCiclos(
  ultimoPeriodo: Date,
  duracionCiclo: number,
  duracionPeriodo: number,
  numeroCiclos: number
): CicloPrediccion[] {
  const ciclos: CicloPrediccion[] = [];

  for (let i = 1; i <= numeroCiclos; i++) {
    const inicioPeriodo = addDays(ultimoPeriodo, duracionCiclo * i);
    const finPeriodo = addDays(inicioPeriodo, duracionPeriodo - 1);
    // Ovulación: ~14 días antes del siguiente período
    const ovulacion = addDays(inicioPeriodo, duracionCiclo - 14);
    // Ventana fértil: 5 días antes de la ovulación + día de ovulación
    const inicioVentanaFertil = addDays(ovulacion, -5);
    const finVentanaFertil = addDays(ovulacion, 1);

    ciclos.push({
      numero: i,
      inicioPeriodo,
      finPeriodo,
      inicioVentanaFertil,
      finVentanaFertil,
      ovulacion,
    });
  }

  return ciclos;
}

function getFaseActual(ultimoPeriodo: Date, duracionCiclo: number, duracionPeriodo: number): FaseActual | null {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(ultimoPeriodo);
  inicio.setHours(0, 0, 0, 0);

  const diffMs = hoy.getTime() - inicio.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Si es antes del período o más de 2 ciclos después, no mostramos
  if (diffDias < 0 || diffDias > duracionCiclo * 2) return null;

  const diaEnCiclo = (diffDias % duracionCiclo) + 1;

  // Ovulación aprox día (duracionCiclo - 14)
  const diaOvulacion = duracionCiclo - 14;

  if (diaEnCiclo <= duracionPeriodo) {
    return {
      nombre: 'Fase menstrual',
      icon: '🔴',
      descripcion: 'Estás en tu período. El útero elimina el endometrio. Es normal sentir calambres y cansancio.',
      diaDelCiclo: diaEnCiclo,
    };
  } else if (diaEnCiclo <= diaOvulacion - 5) {
    return {
      nombre: 'Fase folicular',
      icon: '🌱',
      descripcion: 'Los folículos crecen y el cuerpo se prepara para ovular. Los niveles de estrógeno aumentan y sueles sentirte con más energía.',
      diaDelCiclo: diaEnCiclo,
    };
  } else if (diaEnCiclo <= diaOvulacion + 1) {
    return {
      nombre: 'Ventana fértil / Ovulación',
      icon: '✨',
      descripcion: 'Estás en tu período más fértil. El óvulo es liberado y puede ser fecundado durante las próximas 24-48 horas. Los espermatozoides pueden sobrevivir hasta 5 días.',
      diaDelCiclo: diaEnCiclo,
    };
  } else {
    return {
      nombre: 'Fase lútea',
      icon: '🌙',
      descripcion: 'El cuerpo lúteo produce progesterona. Si no hay fecundación, el endometrio se prepara para desprenderse en la próxima menstruación. Puedes experimentar síntomas SPM.',
      diaDelCiclo: diaEnCiclo,
    };
  }
}

export default function SeguimientoCicloMenstrualPage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [ultimoPeriodo, setUltimoPeriodo] = useState<string>(todayStr);
  const [duracionCiclo, setDuracionCiclo] = useState<number>(28);
  const [duracionPeriodo, setDuracionPeriodo] = useState<number>(5);
  const [ciclos, setCiclos] = useState<CicloPrediccion[]>([]);
  const [faseActual, setFaseActual] = useState<FaseActual | null>(null);
  const [calculado, setCalculado] = useState(false);

  const calcular = () => {
    const fechaBase = new Date(ultimoPeriodo + 'T00:00:00');
    const predicciones = calcularCiclos(fechaBase, duracionCiclo, duracionPeriodo, 4);
    const fase = getFaseActual(fechaBase, duracionCiclo, duracionPeriodo);
    setCiclos(predicciones);
    setFaseActual(fase);
    setCalculado(true);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🌸 Seguimiento Ciclo Menstrual</h1>
        <p className={styles.heroSubtitle}>
          Calcula tu ventana fértil, predicción de ovulación y próximas fechas. Cálculo 100% local: ningún dato sale de tu navegador.
        </p>
      </header>

      <LegalNotice />

      {/* AVISO DE PRIVACIDAD */}
      <div className={styles.privacyNotice} role="note">
        <span className={styles.privacyIcon} aria-hidden="true">🔒</span>
        <span>
          <strong>Privacidad garantizada:</strong> Esta herramienta funciona completamente en tu navegador.
          No enviamos ni almacenamos ningún dato de salud en nuestros servidores.
        </span>
      </div>

      {/* FORMULARIO */}
      <section className={styles.formSection} aria-labelledby="sec-datos">
        <h2 className={styles.sectionTitle} id="sec-datos">
          <span aria-hidden="true">📅</span> Datos de tu ciclo
        </h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="ultimoPeriodo">
              Primer día de tu último período
            </label>
            <input
              id="ultimoPeriodo"
              type="date"
              value={ultimoPeriodo}
              onChange={e => setUltimoPeriodo(e.target.value)}
              max={todayStr}
              className={styles.dateInput}
              aria-label="Primer día del último período menstrual"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duracion-ciclo">
              Duración del ciclo: <strong style={{ color: 'var(--primary)' }}>{duracionCiclo} días</strong>
            </label>
            <div className={styles.rangeContainer}>
              <input
                id="duracion-ciclo"
                type="range"
                min={21}
                max={35}
                step={1}
                value={duracionCiclo}
                onChange={e => setDuracionCiclo(parseInt(e.target.value))}
                className={styles.rangeInput}
                aria-label={`Duración del ciclo: ${duracionCiclo} días`}
              />
              <span className={styles.rangeValue}>{duracionCiclo}d</span>
            </div>
            <span className={styles.rangeHint}>Media: 28 días (rango normal: 21-35)</span>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duracion-periodo">
              Duración del período: <strong style={{ color: 'var(--primary)' }}>{duracionPeriodo} días</strong>
            </label>
            <div className={styles.rangeContainer}>
              <input
                id="duracion-periodo"
                type="range"
                min={2}
                max={8}
                step={1}
                value={duracionPeriodo}
                onChange={e => setDuracionPeriodo(parseInt(e.target.value))}
                className={styles.rangeInput}
                aria-label={`Duración del período: ${duracionPeriodo} días`}
              />
              <span className={styles.rangeValue}>{duracionPeriodo}d</span>
            </div>
            <span className={styles.rangeHint}>Media: 5 días (rango normal: 2-8)</span>
          </div>
        </div>
      </section>

      <div className={styles.btnWrapper}>
        <button onClick={calcular} className={styles.btnCalcular} aria-label="Calcular ciclo y ventana fértil">
          Calcular ciclo y fertilidad
        </button>
      </div>

      {/* RESULTADOS */}
      {calculado && (
        <section aria-live="polite" aria-label="Resultados del ciclo menstrual">

          {/* FASE ACTUAL */}
          {faseActual && (
            <div className={styles.faseActual} role="status">
              <span className={styles.faseIcon} aria-hidden="true">{faseActual.icon}</span>
              <div className={styles.faseInfo}>
                <p className={styles.faseTitulo}>{faseActual.nombre}</p>
                <p className={styles.faseDes}>{faseActual.descripcion}</p>
              </div>
              <div>
                <div className={styles.faseDia}>{faseActual.diaDelCiclo}</div>
                <div className={styles.faseDiaLabel}>día del ciclo</div>
              </div>
            </div>
          )}

          {/* LEYENDA FASES */}
          <div className={styles.leyenda} role="list" aria-label="Fases del ciclo menstrual">
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">🔴</span>
              <div className={styles.leyendaNombre}>Menstrual</div>
              <div className={styles.leyendaDias}>Días 1-{duracionPeriodo}</div>
            </div>
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">🌱</span>
              <div className={styles.leyendaNombre}>Folicular</div>
              <div className={styles.leyendaDias}>Días {duracionPeriodo + 1}-{duracionCiclo - 19}</div>
            </div>
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">✨</span>
              <div className={styles.leyendaNombre}>Ovulación</div>
              <div className={styles.leyendaDias}>~Día {duracionCiclo - 14}</div>
            </div>
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">🌙</span>
              <div className={styles.leyendaNombre}>Lútea</div>
              <div className={styles.leyendaDias}>Días {duracionCiclo - 13}-{duracionCiclo}</div>
            </div>
          </div>

          {/* PRÓXIMOS CICLOS */}
          <div className={styles.ciclosCard}>
            <h3 className={styles.ciclosTitle}>📅 Próximas predicciones (4 ciclos)</h3>
            <div role="list" aria-label="Próximos ciclos menstruales">
              {ciclos.map(ciclo => (
                <div key={ciclo.numero} className={styles.cicloRow} role="listitem">
                  <div className={styles.cicloNum} aria-label={`Ciclo ${ciclo.numero}`}>{ciclo.numero}</div>
                  <div className={styles.cicloFechas}>
                    <div className={styles.cicloFechaPeriodo}>
                      🔴 Período: {formatFecha(ciclo.inicioPeriodo)} – {formatFechaCorta(ciclo.finPeriodo)}
                    </div>
                    <div className={styles.cicloFechaOvulacion}>
                      ✨ Ovulación probable: {formatFecha(ciclo.ovulacion)}
                    </div>
                  </div>
                  <div className={styles.cicloFertil} aria-label={`Ventana fértil: ${formatFechaCorta(ciclo.inicioVentanaFertil)} al ${formatFechaCorta(ciclo.finVentanaFertil)}`}>
                    💚 {formatFechaCorta(ciclo.inicioVentanaFertil)} – {formatFechaCorta(ciclo.finVentanaFertil)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DISCLAIMER SALUD */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        context="seguimiento-ciclo-menstrual"
        collapsible={false}
      />

      {/* CONTENIDO EDUCATIVO */}
      <EducationalSection
        title="📚 Guía completa del ciclo menstrual"
        subtitle="Todo lo que necesitas saber sobre las fases, fertilidad y seguimiento"
      >
        {/* Tabla comparativa: fases del ciclo */}
        <h2>Las 4 fases del ciclo menstrual</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Fase</th>
                <th>Días (ciclo 28d)</th>
                <th>Hormonas dominantes</th>
                <th>Cómo te sientes</th>
                <th>Fertilidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🔴 Menstrual</td>
                <td>1-5</td>
                <td>Estrógeno y progesterona bajos</td>
                <td>Cansancio, calambres, introspección</td>
                <td>Muy baja</td>
              </tr>
              <tr>
                <td>🌱 Folicular</td>
                <td>1-13</td>
                <td>Estrógeno en ascenso (FSH)</td>
                <td>Energía y optimismo crecientes</td>
                <td>Baja → moderada</td>
              </tr>
              <tr>
                <td>✨ Ovulatoria</td>
                <td>14 (±2)</td>
                <td>Pico de LH, estrógeno máximo</td>
                <td>Vitalidad, sociabilidad, libido alta</td>
                <td>Alta (ventana fértil)</td>
              </tr>
              <tr>
                <td>🌙 Lútea</td>
                <td>15-28</td>
                <td>Progesterona dominante</td>
                <td>Calma, posible SPM en últimos días</td>
                <td>Baja</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h2>Casos reales de uso del seguimiento</h2>
        <div className={styles.casosGrid}>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji}>👶</span>
              <h3>Buscar embarazo</h3>
              <span className={styles.casoTag}>Fertilidad</span>
            </div>
            <p>Ana, 30 años, lleva 3 meses intentando concebir. Con el seguimiento identifica su ventana fértil real (días 11-16 de su ciclo de 30 días) y ajusta el momento de relaciones.</p>
            <p className={styles.casoResultado}>✅ Identifica los días óptimos con precisión</p>
          </div>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji}>🏋️</span>
              <h3>Optimizar entrenamiento</h3>
              <span className={styles.casoTag}>Deporte</span>
            </div>
            <p>Laura, deportista amateur, adapta su entrenamiento al ciclo: entrenamientos de fuerza en fase folicular, HIIT en ovulación y yoga/recuperación en fase lútea tardía.</p>
            <p className={styles.casoResultado}>✅ Mejor rendimiento sin sobreentrenamiento</p>
          </div>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji}>📅</span>
              <h3>Planificar eventos importantes</h3>
              <span className={styles.casoTag}>Productividad</span>
            </div>
            <p>Marta programa presentaciones laborales y entrevistas en su fase folicular/ovulatoria, cuando se siente más segura y comunicativa, evitando los días de mayor fatiga.</p>
            <p className={styles.casoResultado}>✅ Mayor rendimiento en momentos clave</p>
          </div>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji}>⚠️</span>
              <h3>Detectar irregularidades</h3>
              <span className={styles.casoTag}>Salud</span>
            </div>
            <p>Sofía nota que sus ciclos varían entre 22 y 40 días. El seguimiento durante 3 meses le permite mostrar datos objetivos a su ginecóloga, que diagnostica SOP.</p>
            <p className={styles.casoResultado}>✅ Diagnóstico más rápido con datos reales</p>
          </div>
        </div>

        {/* FAQ */}
        <h2>Preguntas frecuentes</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cada cuánto debo tener el período para considerarlo normal?</h4>
            <p>Un ciclo normal oscila entre 21 y 35 días. Lo más importante no es que sea exactamente de 28 días, sino que sea regular para ti. Variaciones de ±3 días de un mes a otro son habituales.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Puedo quedarme embarazada durante la menstruación?</h4>
            <p>Es poco probable pero no imposible. Si tienes ciclos cortos (21-23 días), puedes ovular muy pronto tras el período. Los espermatozoides pueden vivir hasta 5 días, por lo que las relaciones durante la menstruación podrían coincidir con la ovulación.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la ovulación no siempre ocurre el día 14?</h4>
            <p>El día 14 es la media de un ciclo de 28 días. La ovulación ocurre aproximadamente 14 días ANTES del siguiente período, independientemente de la duración del ciclo. En un ciclo de 35 días, ovularías alrededor del día 21.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Es fiable este método para evitar embarazos?</h4>
            <p>No. El método del calendario tiene una tasa de fallo del 9-25% con uso típico. Los ciclos pueden variar por estrés, enfermedad o cambios de peso. Para anticoncepción, consulta a tu médico sobre métodos con mayor eficacia.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué síntomas del SPM son normales y cuáles no?</h4>
            <p>Molestias leves (sensibilidad mamaria, cambios de humor, retención de líquidos) en los días previos al período son normales. Si los síntomas interfieren gravemente con tu vida diaria, consulta: podría ser TDPM (trastorno disfórico premenstrual).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuántos ciclos debo registrar para tener datos fiables?</h4>
            <p>Mínimo 3-6 ciclos para identificar tu patrón personal. Con más datos la predicción mejora. Si buscas embarazo o tienes irregularidades, registra al menos 6 meses antes de sacar conclusiones.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo hacer un seguimiento efectivo de tu ciclo</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Marca el primer día de tu período</strong>
                <p>El día 1 es el primer día de sangrado activo (no el manchado previo). Anota la fecha cada mes de forma consistente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Registra la duración del sangrado</strong>
                <p>Apunta cuántos días dura y la intensidad (leve, moderada, intensa). Esto ayuda a detectar cambios con el tiempo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Anota síntomas asociados</strong>
                <p>Dolor, cambios de humor, energía, libido, migrañas. Usa un sistema simple: emojis o escala 1-5 para cada síntoma.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcula tu ciclo promedio</strong>
                <p>Suma la duración de tus últimos 3-6 ciclos y divídela entre el número de ciclos. Usa ese promedio para las predicciones.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Identifica señales de ovulación</strong>
                <p>Moco cervical elástico (tipo clara de huevo), ligero dolor en un lado del abdomen (mittelschmerz) o aumento leve de temperatura basal.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Lleva los datos a tu ginecóloga</strong>
                <p>Con 3-6 meses de registros podrás mostrar patrones claros que facilitan el diagnóstico de irregularidades o planificación familiar.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <h2>Consejos para cada fase del ciclo</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔴</div>
            <h4>Fase menstrual</h4>
            <p>Descansa más, aplica calor en el abdomen, evita el exceso de sal y cafeína, hidrátate bien.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🌱</div>
            <h4>Fase folicular</h4>
            <p>Aprovecha la energía creciente para proyectos nuevos y entrenamientos de mayor intensidad.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>✨</div>
            <h4>Ovulación</h4>
            <p>Tu pico de vitalidad y comunicación: ideal para presentaciones, reuniones importantes y socializar.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🌙</div>
            <h4>Fase lútea</h4>
            <p>Prioriza el descanso, reduce azúcar y alcohol, practica yoga o meditación para gestionar el SPM.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📱</div>
            <h4>Registro consistente</h4>
            <p>Usa siempre el mismo criterio para el día 1 y registra en las primeras 24 horas para mayor precisión.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🩺</div>
            <h4>Revisión anual</h4>
            <p>Comparte tu historial con tu ginecóloga en la revisión anual. Los datos longitudinales son muy valiosos.</p>
          </div>
        </div>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Señales que requieren consulta médica urgente</h3>
          </div>
          <ul className={styles.warningList}>
            <li>Ausencia de período por más de 3 meses sin embarazo (amenorrea)</li>
            <li>Sangrado muy abundante (empapas una compresa/tampón por hora durante varias horas)</li>
            <li>Dolor menstrual tan intenso que impide las actividades diarias</li>
            <li>Sangrado entre períodos o tras relaciones sexuales</li>
            <li>Ciclos que se vuelven muy irregulares de forma repentina</li>
            <li>Menstruaciones con coágulos grandes (mayores que una moneda de 50 céntimos)</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('seguimiento-ciclo-menstrual')} />

      <ShareCard appName="seguimiento-ciclo-menstrual" />
      <Footer appName="seguimiento-ciclo-menstrual" />
    </div>
  );
}
