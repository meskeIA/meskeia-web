'use client';

import { useState, useEffect } from 'react';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps} from '@/components';
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
          subtitle="Descubre casos de uso prácticos y respuestas a preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2>Conceptos Clave</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>📅 Años Bisiestos</h4>
                <p>
                  La calculadora considera automáticamente los años bisiestos (cada 4 años,
                  excepto los divisibles por 100, salvo los divisibles por 400).
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>📊 Días vs Días Hábiles</h4>
                <p>
                  Esta herramienta calcula días naturales (calendario). Para días laborables,
                  resta fines de semana y festivos según tu localidad.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>⚖️ Plazos Legales</h4>
                <p>
                  En España, los plazos administrativos suelen ser hábiles (excluyendo sábados,
                  domingos y festivos nacionales/autonómicos).
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>🎂 Edad Exacta</h4>
                <p>
                  La edad se calcula considerando si ya ha pasado el cumpleaños del año actual.
                  Incluye años, meses y días exactos.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿La calculadora considera los años bisiestos?</summary>
                <p>
                  Sí, nuestra calculadora tiene en cuenta los años bisiestos, los diferentes
                  días de cada mes y proporciona cálculos precisos considerando el calendario
                  gregoriano actual.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cómo sé qué día de la semana fue una fecha histórica?</summary>
                <p>
                  Usa la calculadora &quot;Día de la semana&quot; e introduce cualquier fecha desde
                  1900. Te dirá exactamente qué día de la semana fue y cuánto tiempo ha pasado
                  desde entonces.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo calcular fechas futuras?</summary>
                <p>
                  Por supuesto. Puedes sumar días, semanas, meses o años a cualquier fecha
                  base para obtener una fecha futura. También puedes restar tiempo para
                  obtener fechas pasadas.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo calcular días laborables?</summary>
                <p>
                  La calculadora actual calcula días calendario completos. Para días laborables,
                  deberías restar manualmente fines de semana (~2 días por cada 7) y festivos
                  según tu localidad.
                </p>
              </details>
            </div>
          </section>
        </EducationalSection>
      </main>

      {/* Footer meskeIA */}
      <RelatedApps apps={getRelatedApps('Calculadora de Fechas')} />
      <Footer appName="Calculadora de Fechas" />
    </>
  );
}
