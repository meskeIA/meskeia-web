'use client';

import { useState, useEffect } from 'react';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { jsonLd, faqSchema } from './metadata';
import styles from './CalculadoraFechas.module.css';
import { getRelatedApps } from '@/data/app-relations';

type TimeUnit = 'days' | 'weeks' | 'months' | 'years';
type Operation = 'add' | 'subtract';

export default function CalculadoraFechas() {
  // Estados para calculadora 1: Diferencia entre fechas
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [diffResult, setDiffResult] = useState<any>(null);

  // Estados para calculadora 2: Sumar/Restar
  const [baseDate, setBaseDate] = useState<string>('');
  const [operation, setOperation] = useState<Operation>('add');
  const [timeValue, setTimeValue] = useState<number>(1);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  const [addSubResult, setAddSubResult] = useState<any>(null);

  // Estados para calculadora 3: Día de la semana
  const [dayDate, setDayDate] = useState<string>('');
  const [dayResult, setDayResult] = useState<any>(null);

  // Estados para calculadora 4: Edad
  const [birthDate, setBirthDate] = useState<string>('');
  const [referenceDate, setReferenceDate] = useState<string>('');
  const [ageResult, setAgeResult] = useState<any>(null);


  // Inicializar fechas
  useEffect(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    setEndDate(formatDate(today));
    setStartDate(formatDate(yesterday));
    setBaseDate(formatDate(today));
    setDayDate(formatDate(today));
    setReferenceDate(formatDate(today));
  }, []);

  /**
   * Formatea fecha a formato largo español
   */
  const formatDateLong = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Formatea fecha a formato corto español
   */
  const formatDateShort = (date: Date): string => {
    return date.toLocaleDateString('es-ES');
  };

  /**
   * Calcula diferencia entre dos fechas
   */
  const calculateDifference = () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecciona ambas fechas');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert('La fecha inicial debe ser anterior a la fecha final');
      return;
    }

    // Calcular diferencias
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);

    // Calcular diferencia exacta
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setDiffResult({
      diffDays,
      diffWeeks,
      diffMonths,
      diffYears,
      exactYears: years,
      exactMonths: months,
      exactDays: days,
    });
  };

  /**
   * Suma o resta tiempo a una fecha
   */
  const calculateAddSubtract = () => {
    if (!baseDate || !timeValue) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const base = new Date(baseDate);
    const result = new Date(base);
    const multiplier = operation === 'add' ? 1 : -1;

    switch (timeUnit) {
      case 'days':
        result.setDate(result.getDate() + timeValue * multiplier);
        break;
      case 'weeks':
        result.setDate(result.getDate() + timeValue * 7 * multiplier);
        break;
      case 'months':
        result.setMonth(result.getMonth() + timeValue * multiplier);
        break;
      case 'years':
        result.setFullYear(result.getFullYear() + timeValue * multiplier);
        break;
    }

    const unitText = {
      days: 'días',
      weeks: 'semanas',
      months: 'meses',
      years: 'años',
    };

    setAddSubResult({
      baseDate: base,
      resultDate: result,
      operationText: operation === 'add' ? 'Sumar' : 'Restar',
      timeValue,
      unitText: unitText[timeUnit],
    });
  };

  /**
   * Determina el día de la semana
   */
  const calculateDayOfWeek = () => {
    if (!dayDate) {
      alert('Por favor, selecciona una fecha');
      return;
    }

    const date = new Date(dayDate);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = dayNames[date.getDay()];

    // Calcular referencia temporal
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let timeAgoText = '';
    if (diffDays === 0) {
      timeAgoText = 'Hoy';
    } else if (diffDays === 1) {
      timeAgoText = 'Ayer';
    } else if (diffDays === -1) {
      timeAgoText = 'Mañana';
    } else if (diffDays > 0) {
      const diffYears = Math.floor(diffDays / 365.25);
      if (diffYears >= 1) {
        timeAgoText = `Hace ${diffYears} año${diffYears > 1 ? 's' : ''} y ${Math.floor(diffDays % 365.25)} días`;
      } else {
        timeAgoText = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      }
    } else {
      const futureDays = Math.abs(diffDays);
      timeAgoText = `En ${futureDays} día${futureDays > 1 ? 's' : ''}`;
    }

    setDayResult({
      date,
      dayOfWeek,
      timeAgoText,
    });
  };

  /**
   * Calcula edad exacta
   */
  const calculateAge = () => {
    if (!birthDate) {
      alert('Por favor, selecciona la fecha de nacimiento');
      return;
    }

    const birth = new Date(birthDate);
    const reference = referenceDate ? new Date(referenceDate) : new Date();

    if (birth > reference) {
      alert('La fecha de nacimiento debe ser anterior a la fecha de referencia');
      return;
    }

    // Calcular edad exacta
    let years = reference.getFullYear() - birth.getFullYear();
    let months = reference.getMonth() - birth.getMonth();
    let days = reference.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(reference.getFullYear(), reference.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Días totales vividos
    const totalDays = Math.floor((reference.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    // Próximo cumpleaños
    let nextBirthday = new Date(reference.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= reference) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysToNext = Math.floor((nextBirthday.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24));

    setAgeResult({
      birth,
      years,
      months,
      days,
      totalDays,
      daysToNext,
      nextBirthday,
    });
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Analytics */}
      <AnalyticsTracker applicationName="calculadora-fechas" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <LegalNotice />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>📅 Calculadora de Fechas Online</h1>
          <p className={styles.subtitle}>
            Herramienta profesional para cálculos temporales y cronológicos
          </p>
        </header>

        {/* Grid de 4 calculadoras */}
        <div className={styles.calculatorGrid}>
          {/* 1. Diferencia entre fechas */}
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>📅 Diferencia entre fechas</h2>

            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.label}>
                Fecha inicial:
              </label>
              <input
                type="date"
                id="startDate"
                className={styles.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min="1900-01-01"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.label}>
                Fecha final:
              </label>
              <input
                type="date"
                id="endDate"
                className={styles.input}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min="1900-01-01"
              />
            </div>

            <button type="button" onClick={calculateDifference} className={styles.btnPrimary}>
              🔢 Calcular Diferencia
            </button>

            {diffResult && (
              <div className={styles.resultsSection}>
                <ResultCard
                  title="Días totales"
                  value={diffResult.diffDays.toLocaleString('es-ES')}
                  variant="highlight"
                  icon="📆"
                />
                <ResultCard
                  title="Tiempo exacto"
                  value={`${diffResult.exactYears}a ${diffResult.exactMonths}m ${diffResult.exactDays}d`}
                  description="Años, meses y días"
                  variant="info"
                />
                <ResultCard
                  title="Semanas"
                  value={diffResult.diffWeeks.toLocaleString('es-ES')}
                  variant="default"
                />
                <ResultCard
                  title="Meses (aprox.)"
                  value={diffResult.diffMonths.toLocaleString('es-ES')}
                  variant="default"
                />
              </div>
            )}
          </article>

          {/* 2. Sumar/Restar tiempo */}
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>➕ Sumar/Restar tiempo</h2>

            <div className={styles.formGroup}>
              <label htmlFor="baseDate" className={styles.label}>
                Fecha base:
              </label>
              <input
                type="date"
                id="baseDate"
                className={styles.input}
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                min="1900-01-01"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="operation" className={styles.label}>
                Operación:
              </label>
              <select
                id="operation"
                className={styles.select}
                value={operation}
                onChange={(e) => setOperation(e.target.value as Operation)}
              >
                <option value="add">Sumar</option>
                <option value="subtract">Restar</option>
              </select>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="timeValue" className={styles.label}>
                  Cantidad:
                </label>
                <input
                  type="number"
                  id="timeValue"
                  className={styles.input}
                  value={timeValue}
                  onChange={(e) => setTimeValue(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10000}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="timeUnit" className={styles.label}>
                  Unidad:
                </label>
                <select
                  id="timeUnit"
                  className={styles.select}
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
                >
                  <option value="days">Días</option>
                  <option value="weeks">Semanas</option>
                  <option value="months">Meses</option>
                  <option value="years">Años</option>
                </select>
              </div>
            </div>

            <button type="button" onClick={calculateAddSubtract} className={styles.btnPrimary}>
              ⚡ Calcular
            </button>

            {addSubResult && (
              <div className={styles.resultsSection}>
                <ResultCard
                  title="Fecha resultado"
                  value={formatDateShort(addSubResult.resultDate)}
                  description={formatDateLong(addSubResult.resultDate)}
                  variant="highlight"
                  icon="📅"
                />
                <ResultCard
                  title="Operación"
                  value={`${addSubResult.operationText} ${addSubResult.timeValue} ${addSubResult.unitText}`}
                  variant="info"
                />
              </div>
            )}
          </article>

          {/* 3. Día de la semana */}
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>📆 Día de la semana</h2>

            <div className={styles.formGroup}>
              <label htmlFor="dayDate" className={styles.label}>
                Fecha a consultar:
              </label>
              <input
                type="date"
                id="dayDate"
                className={styles.input}
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
                min="1900-01-01"
              />
            </div>

            <button type="button" onClick={calculateDayOfWeek} className={styles.btnPrimary}>
              🗓️ ¿Qué día era?
            </button>

            {dayResult && (
              <div className={styles.resultsSection}>
                <ResultCard
                  title="Día de la semana"
                  value={dayResult.dayOfWeek}
                  description={formatDateLong(dayResult.date)}
                  variant="highlight"
                  icon="📆"
                />
                <ResultCard
                  title="Referencia temporal"
                  value={dayResult.timeAgoText}
                  variant="info"
                />
              </div>
            )}
          </article>

          {/* 4. Calcular edad */}
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>🎂 Calcular edad exacta</h2>

            <div className={styles.formGroup}>
              <label htmlFor="birthDate" className={styles.label}>
                Fecha de nacimiento:
              </label>
              <input
                type="date"
                id="birthDate"
                className={styles.input}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                min="1900-01-01"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="referenceDate" className={styles.label}>
                Fecha de referencia (opcional):
              </label>
              <input
                type="date"
                id="referenceDate"
                className={styles.input}
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
              />
            </div>

            <button type="button" onClick={calculateAge} className={styles.btnPrimary}>
              🎯 Calcular Edad
            </button>

            {ageResult && (
              <div className={styles.resultsSection}>
                <ResultCard
                  title="Edad exacta"
                  value={`${ageResult.years} años`}
                  description={`${ageResult.months} meses, ${ageResult.days} días`}
                  variant="highlight"
                  icon="🎂"
                />
                <ResultCard
                  title="Días vividos"
                  value={ageResult.totalDays.toLocaleString('es-ES')}
                  variant="success"
                />
                <ResultCard
                  title="Próximo cumpleaños"
                  value={`En ${ageResult.daysToNext} días`}
                  description={formatDateShort(ageResult.nextBirthday)}
                  variant="info"
                />
              </div>
            )}
          </article>
        </div>

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="¿Quieres aprender más sobre Cálculos de Fechas?"
          subtitle="Descubre casos de uso prácticos, mejores prácticas y respuestas a preguntas frecuentes"
        >
          {/* 1. TABLA COMPARATIVA - Comparación de tipos de cálculo */}
          <section className={styles.comparativaSection}>
            <h2>Comparativa de Tipos de Cálculo</h2>
            <p className={styles.comparativaSubtitle}>
              Elige la calculadora según tu necesidad
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Uso principal</th>
                    <th>Ideal para</th>
                    <th>Precisión</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Diferencia entre fechas</strong></td>
                    <td>Calcular tiempo transcurrido entre dos momentos</td>
                    <td>Plazos legales, antigüedad laboral, duración de proyectos</td>
                    <td>Exacta (considera bisiestos)</td>
                  </tr>
                  <tr>
                    <td><strong>Sumar/Restar tiempo</strong></td>
                    <td>Proyectar fechas futuras o pasadas</td>
                    <td>Vencimientos, plazos contractuales, planificación</td>
                    <td>Exacta (ajusta meses variables)</td>
                  </tr>
                  <tr>
                    <td><strong>Día de la semana</strong></td>
                    <td>Determinar qué día cayó/caerá una fecha</td>
                    <td>Verificar eventos históricos, planificar eventos futuros</td>
                    <td>Exacta (calendario gregoriano)</td>
                  </tr>
                  <tr>
                    <td><strong>Calcular edad</strong></td>
                    <td>Determinar edad exacta en años, meses y días</td>
                    <td>Trámites administrativos, seguros, jubilación, RRHH</td>
                    <td>Exacta (al día)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. CASOS DE USO - Escenarios reales */}
          <section className={styles.escenariosSection}>
            <h2>Casos de Uso Prácticos</h2>
            <p className={styles.escenariosSubtitle}>
              Ejemplos reales donde los cálculos de fechas son esenciales
            </p>
            <div className={styles.escenariosGrid}>
              {/* Escenario 1: Legal y Administrativo */}
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⚖️</span>
                  <h3>Legal y Administrativo</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Ejemplo:</p>
                  <code>
                    Presentar alegaciones ante la Agencia Tributaria (plazo: 10 días hábiles).
                    Fecha notificación: 15/01/2026 → Fecha límite: calcular +10 días excluyendo fines de semana.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Los plazos administrativos en España suelen ser días hábiles.
                  Resta sábados, domingos y festivos del resultado.
                </p>
              </div>

              {/* Escenario 2: Recursos Humanos */}
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>👔</span>
                  <h3>Recursos Humanos</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Ejemplo:</p>
                  <code>
                    Calcular vacaciones proporcionales. Empleado con fecha de alta: 01/06/2020.
                    Antigüedad actual: 4 años, 8 meses → 30 días de vacaciones completos.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Usa &quot;Diferencia entre fechas&quot; para antigüedad exacta
                  y &quot;Calcular edad&quot; para verificar jubilación.
                </p>
              </div>

              {/* Escenario 3: Finanzas e Inversiones */}
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>💰</span>
                  <h3>Finanzas e Inversiones</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Ejemplo:</p>
                  <code>
                    Depósito a plazo fijo de 90 días. Fecha contratación: 01/03/2026.
                    Fecha vencimiento: 01/03/2026 + 90 días = 30/05/2026.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Los productos financieros usan días naturales (incluye fines de semana).
                  Verifica el contrato para casos específicos.
                </p>
              </div>

              {/* Escenario 4: Gestión de Proyectos */}
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📊</span>
                  <h3>Gestión de Proyectos</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Ejemplo:</p>
                  <code>
                    Proyecto de 12 semanas iniciado el 01/02/2026.
                    Fecha entrega: 01/02/2026 + 12 semanas = 26/04/2026.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Para sprints ágiles, usa semanas. Para hitos concretos, días naturales.
                </p>
              </div>

              {/* Escenario 5: Educación y Academia */}
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎓</span>
                  <h3>Educación y Academia</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Ejemplo:</p>
                  <code>
                    Examen dentro de 45 días desde el 10/03/2026.
                    Fecha examen: 24/04/2026 (Jueves).
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Combina &quot;Sumar tiempo&quot; con &quot;Día de la semana&quot; para planificar evaluaciones.
                </p>
              </div>

              {/* Escenario 6: Personal y Salud */}
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏥</span>
                  <h3>Personal y Salud</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Ejemplo:</p>
                  <code>
                    Fecha probable de parto (FPP): última menstruación + 280 días.
                    Última regla: 01/01/2026 → FPP: 08/10/2026.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Para seguimiento médico, usa la calculadora de edad para control de desarrollo infantil.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ AMPLIADO - Preguntas frecuentes detalladas */}
          <section className={styles.faqSection}>
            <h2>Preguntas Frecuentes Ampliadas</h2>
            <div className={styles.faqList}>
              {/* Pregunta 1 */}
              <div className={styles.faqItem}>
                <h3>¿La calculadora considera años bisiestos y meses con diferente número de días?</h3>
                <p>
                  Sí, absolutamente. Nuestra calculadora implementa el <strong>calendario gregoriano</strong> completo,
                  que considera:
                </p>
                <ul>
                  <li><strong>Años bisiestos:</strong> Cada 4 años (ej: 2024, 2028), excepto los divisibles por 100 (ej: 1900),
                    salvo que sean divisibles por 400 (ej: 2000).</li>
                  <li><strong>Meses variables:</strong> Febrero (28/29 días), meses de 30 días (abril, junio, septiembre, noviembre),
                    meses de 31 días (resto).</li>
                  <li><strong>Cálculos exactos:</strong> Al sumar/restar meses, ajusta automáticamente si el día no existe
                    (ej: 31 de febrero → 28/29 de febrero).</li>
                </ul>
                <p className={styles.faqTip}>
                  <strong>Ejemplo práctico:</strong> Sumar 1 mes al 31/01/2026 devuelve 28/02/2026 (no 31/02, que no existe).
                </p>
              </div>

              {/* Pregunta 2 */}
              <div className={styles.faqItem}>
                <h3>¿Cómo calculo plazos legales en días hábiles (excluyendo fines de semana y festivos)?</h3>
                <p>
                  La calculadora actual muestra <strong>días naturales (calendario completo)</strong>. Para días hábiles:
                </p>
                <ol>
                  <li>Calcula la diferencia en días naturales.</li>
                  <li><strong>Resta fines de semana:</strong> Aproximadamente 2 días por cada 7 (28-29% del total).</li>
                  <li><strong>Resta festivos:</strong> Consulta el calendario oficial (España tiene ~14 festivos nacionales/autonómicos).</li>
                  <li><strong>Usa la calculadora de día de la semana:</strong> Verifica si la fecha límite cae en fin de semana.</li>
                </ol>
                <p className={styles.faqTip}>
                  <strong>Ejemplo:</strong> 30 días naturales = ~21 días hábiles (restando 8-9 días de fines de semana y festivos).
                </p>
              </div>

              {/* Pregunta 3 */}
              <div className={styles.faqItem}>
                <h3>¿Por qué hay diferencia entre &quot;meses exactos&quot; y &quot;meses aproximados&quot;?</h3>
                <p>
                  Cuando calculas diferencia entre fechas, verás dos valores:
                </p>
                <ul>
                  <li><strong>Meses exactos (ej: 2a 5m 10d):</strong> Cuenta meses completos desde la fecha inicial.
                    Ejemplo: De 15/01/2024 a 25/06/2024 = 5 meses y 10 días.</li>
                  <li><strong>Meses aproximados (ej: 17 meses):</strong> Divide días totales entre 30.44 (duración media de un mes).
                    Útil para estimaciones rápidas sin considerar meses específicos.</li>
                </ul>
                <p className={styles.faqTip}>
                  <strong>¿Cuál usar?</strong> Meses exactos para contratos/legal. Meses aproximados para estadísticas/estimaciones.
                </p>
              </div>

              {/* Pregunta 4 */}
              <div className={styles.faqItem}>
                <h3>¿Puedo usar la calculadora para fechas muy antiguas o muy lejanas en el futuro?</h3>
                <p>
                  La calculadora soporta fechas desde <strong>01/01/1900 hasta 31/12/2099</strong>. Limitaciones a considerar:
                </p>
                <ul>
                  <li><strong>Fechas antes de 1582:</strong> El calendario gregoriano se adoptó en 1582. Fechas anteriores
                    pueden tener discrepancias históricas (se omitieron 10 días en la transición del juliano al gregoriano).</li>
                  <li><strong>Fechas muy futuras:</strong> Cálculos precisos hasta 2099. Más allá, considera cambios hipotéticos
                    en el calendario (aunque son extremadamente improbables).</li>
                </ul>
                <p className={styles.faqTip}>
                  <strong>Uso recomendado:</strong> Fechas entre 1900-2099 para máxima fiabilidad en contextos legales/administrativos.
                </p>
              </div>

              {/* Pregunta 5 */}
              <div className={styles.faqItem}>
                <h3>¿Cómo afectan los husos horarios a los cálculos de fechas?</h3>
                <p>
                  La calculadora trabaja con <strong>fechas calendario (sin hora)</strong>, por lo que los husos horarios
                  NO afectan los resultados. Consideraciones importantes:
                </p>
                <ul>
                  <li><strong>Sin hora específica:</strong> Los cálculos se basan en días completos (00:00:00 a 23:59:59).</li>
                  <li><strong>Contratos internacionales:</strong> Si un contrato especifica hora exacta (ej: &quot;10:00 CET&quot;),
                    deberás verificar manualmente la conversión horaria.</li>
                  <li><strong>Cambio de horario (verano/invierno):</strong> No afecta a días calendario. Solo relevante si
                    trabajas con horas exactas.</li>
                </ul>
                <p className={styles.faqTip}>
                  <strong>Ejemplo:</strong> Diferencia entre 01/01/2026 (Madrid) y 10/01/2026 (Tokio) = 9 días, sin importar el huso.
                </p>
              </div>

              {/* Pregunta 6 */}
              <div className={styles.faqItem}>
                <h3>¿Puedo calcular la edad de alguien en una fecha histórica específica?</h3>
                <p>
                  Sí, la calculadora de edad incluye un campo <strong>&quot;Fecha de referencia&quot;</strong> opcional:
                </p>
                <ul>
                  <li><strong>Uso por defecto (campo vacío):</strong> Calcula edad a fecha de hoy.</li>
                  <li><strong>Uso con fecha personalizada:</strong> Calcula edad a una fecha específica en el pasado o futuro.</li>
                </ul>
                <p>
                  <strong>Ejemplo práctico:</strong>
                </p>
                <ul>
                  <li>Nacimiento: 15/05/1980</li>
                  <li>Referencia: 01/01/2000</li>
                  <li>Resultado: 19 años, 7 meses, 17 días (edad al entrar al año 2000)</li>
                </ul>
                <p className={styles.faqTip}>
                  <strong>Útil para:</strong> Verificar edades en contratos antiguos, seguros de vida históricos, genealogía.
                </p>
              </div>

              {/* Pregunta 7 */}
              <div className={styles.faqItem}>
                <h3>¿Qué diferencia hay entre &quot;semanas&quot; y &quot;semanas ISO 8601&quot;?</h3>
                <p>
                  Nuestra calculadora muestra <strong>semanas simples (cada 7 días)</strong>. Las semanas ISO 8601
                  son un estándar internacional con reglas específicas:
                </p>
                <ul>
                  <li><strong>Semanas simples:</strong> Divide días totales entre 7. Ejemplo: 50 días = 7 semanas completas.</li>
                  <li><strong>Semanas ISO 8601:</strong> La semana 1 del año contiene el primer jueves. Una semana completa va
                    de lunes a domingo. Puede haber 52 o 53 semanas ISO por año.</li>
                </ul>
                <p className={styles.faqTip}>
                  <strong>¿Cuándo usar cada una?</strong> Semanas simples para plazos/contratos. Semanas ISO para estadísticas
                  empresariales/académicas.
                </p>
              </div>

              {/* Pregunta 8 */}
              <div className={styles.faqItem}>
                <h3>¿Cómo verifico si mi cálculo de edad es correcto para trámites oficiales?</h3>
                <p>
                  Para documentos oficiales (DNI, pasaporte, pensiones), verifica lo siguiente:
                </p>
                <ol>
                  <li><strong>Fecha de nacimiento exacta:</strong> Usa la fecha del certificado de nacimiento (día/mes/año).</li>
                  <li><strong>Fecha de referencia:</strong> Normalmente es la fecha de presentación del trámite.</li>
                  <li><strong>Criterio de mayoría de edad:</strong> En España, 18 años se cumplen el día del cumpleaños
                    (no el día siguiente).</li>
                  <li><strong>Redondeo:</strong> La administración suele usar años completos, no meses/días adicionales.</li>
                </ol>
                <p className={styles.faqTip}>
                  <strong>Ejemplo:</strong> Nacido el 15/05/2006 → Mayoría de edad el 15/05/2024 (no el 16/05/2024).
                </p>
              </div>
            </div>
          </section>

          {/* 4. GUÍA PASO A PASO - Cómo usar cada calculadora */}
          <section className={styles.guideSection}>
            <h2>Guía de Uso Paso a Paso</h2>
            <div className={styles.stepGuide}>
              {/* Paso 1 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Selecciona el tipo de cálculo según tu objetivo</h3>
                  <p>
                    <strong>¿Cuánto tiempo ha pasado?</strong> → Usa &quot;Diferencia entre fechas&quot;.<br />
                    <strong>¿Qué fecha será en X días/meses?</strong> → Usa &quot;Sumar/Restar tiempo&quot;.<br />
                    <strong>¿Qué día de la semana fue/será?</strong> → Usa &quot;Día de la semana&quot;.<br />
                    <strong>¿Cuántos años tiene alguien?</strong> → Usa &quot;Calcular edad exacta&quot;.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Introduce las fechas con precisión</h3>
                  <p>
                    Verifica el formato <strong>DD/MM/AAAA</strong> (día/mes/año). El selector de fecha facilita
                    la selección correcta. Asegúrate de que el año es correcto (ej: 2026, no 1926).
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Revisa el resultado completo, no solo el primer valor</h3>
                  <p>
                    Cada calculadora muestra múltiples formatos del resultado. Ejemplo: &quot;Diferencia entre fechas&quot;
                    muestra días totales, semanas, meses aproximados y años/meses/días exactos. Elige el más útil para tu caso.
                  </p>
                </div>
              </div>

              {/* Paso 4 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Ajusta manualmente si trabajas con días hábiles</h3>
                  <p>
                    Si necesitas excluir fines de semana: divide el resultado entre 7, multiplica por 5 (días laborables
                    por semana) y resta festivos nacionales/autonómicos.
                  </p>
                </div>
              </div>

              {/* Paso 5 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h3>Combina calculadoras para análisis complejos</h3>
                  <p>
                    Ejemplo: Calcula &quot;Sumar 90 días&quot; para saber la fecha vencimiento, luego usa &quot;Día de la semana&quot;
                    para verificar si cae en fin de semana (y ajustar al lunes siguiente si es necesario).
                  </p>
                </div>
              </div>

              {/* Paso 6 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h3>Documenta los resultados para trámites formales</h3>
                  <p>
                    Si el cálculo es para un contrato, alegaciones o documento legal, anota la fecha de cálculo,
                    las fechas de entrada y el resultado obtenido. Algunos trámites requieren justificar los plazos.
                  </p>
                </div>
              </div>

              {/* Paso 7 */}
              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <h3>Verifica con fuentes oficiales si hay regulaciones específicas</h3>
                  <p>
                    En contextos legales/administrativos, consulta la normativa específica (ej: Ley de Procedimiento Administrativo
                    Común para plazos administrativos en España). Nuestra calculadora proporciona datos técnicos, no asesoramiento legal.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. MEJORES PRÁCTICAS - Tips y recomendaciones */}
          <section className={styles.tipsSection}>
            <h2>Mejores Prácticas y Consejos</h2>
            <div className={styles.tipsGrid}>
              {/* Tip 1 */}
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📅</span>
                <h3>Siempre especifica la unidad temporal</h3>
                <p>
                  Al comunicar plazos, especifica la unidad: &quot;90 días naturales&quot;, &quot;3 meses calendario&quot;,
                  &quot;20 días hábiles&quot;. Evita ambigüedades que puedan causar conflictos legales.
                </p>
              </div>

              {/* Tip 2 */}
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚠️</span>
                <h3>Cuidado con los fines de mes al sumar meses</h3>
                <p>
                  Sumar 1 mes al 31/01 devuelve 28/29 de febrero (no 31). Si necesitas mantener el día exacto, usa días
                  en lugar de meses (ej: +30 días).
                </p>
              </div>

              {/* Tip 3 */}
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌍</span>
                <h3>Contratos internacionales: especifica huso y normativa</h3>
                <p>
                  Si trabajas con empresas extranjeras, especifica el huso horario (ej: CET, UTC+1) y qué calendario
                  de festivos aplica (España, EU, país contraparte).
                </p>
              </div>

              {/* Tip 4 */}
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📊</span>
                <h3>Usa meses exactos para antigüedad laboral</h3>
                <p>
                  Para cálculos de RRHH (antigüedad, pagas extra prorrateadas), usa la opción de &quot;años, meses y días exactos&quot;
                  en lugar de meses aproximados.
                </p>
              </div>

              {/* Tip 5 */}
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔍</span>
                <h3>Doble verificación en plazos críticos</h3>
                <p>
                  Para vencimientos de contratos, alegaciones legales o trámites con consecuencias importantes,
                  verifica el cálculo dos veces y considera consultar con un profesional.
                </p>
              </div>

              {/* Tip 6 */}
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📆</span>
                <h3>Considera festivos nacionales y autonómicos</h3>
                <p>
                  España tiene ~12 festivos nacionales + 2-4 autonómicos. Para días hábiles, resta todos los festivos
                  aplicables según la comunidad autónoma del trámite.
                </p>
              </div>
            </div>
          </section>

          {/* 6. WARNING BOX - Errores comunes */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Comunes a Evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No confundir días naturales con días hábiles:</strong> Los plazos legales/administrativos
                en España suelen ser hábiles (excluyen fines de semana y festivos). Esta calculadora muestra días naturales por defecto.
              </li>
              <li>
                <strong>No asumir que todos los meses tienen 30 días:</strong> Febrero tiene 28/29, y 7 meses tienen 31 días.
                Usa la calculadora en lugar de cálculos mentales aproximados.
              </li>
              <li>
                <strong>Olvidar años bisiestos en cálculos largos:</strong> Un año bisiesto cada 4 años puede añadir 1 día extra
                en periodos de varios años. La calculadora lo considera automáticamente.
              </li>
              <li>
                <strong>No verificar el día de la semana de la fecha límite:</strong> Si tu plazo cae en sábado/domingo,
                verifica la normativa: algunos trámites se prorrogan al lunes siguiente, otros no.
              </li>
              <li>
                <strong>Usar meses aproximados para contratos formales:</strong> Los &quot;meses aproximados&quot; (basados en 30.44 días)
                son útiles para estimaciones, pero usa &quot;meses exactos&quot; en documentos legales.
              </li>
              <li>
                <strong>No considerar la zona horaria en contratos internacionales:</strong> Aunque la calculadora trabaja
                con fechas calendario (sin hora), contratos internacionales pueden especificar horas exactas y zonas horarias.
              </li>
              <li>
                <strong>Olvidar el cambio de horario (verano/invierno):</strong> Si trabajas con horas exactas (no solo fechas),
                recuerda que en España cambiamos la hora 2 veces al año (último domingo de marzo y octubre).
              </li>
              <li>
                <strong>No documentar la fuente del cálculo en trámites oficiales:</strong> Algunos organismos requieren
                justificar cómo se calculó un plazo. Anota las fechas de entrada y el método usado.
              </li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      {/* Footer meskeIA */}
      <RelatedApps apps={getRelatedApps('Calculadora de Fechas')} />
      <ShareCard appName="Calculadora de Fechas" />
      <Footer appName="Calculadora de Fechas" />
    </>
  );
}
