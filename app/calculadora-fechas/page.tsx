'use client';

import { useState, useEffect } from 'react';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import ResultCard from '@/components/ResultCard';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { jsonLd, faqSchema } from './metadata';
import styles from './CalculadoraFechas.module.css';

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

  // Estado para contenido educativo
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

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

      {/* Header meskeIA */}
      <FixedHeader />

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

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Cálculos de Fechas?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre casos de uso prácticos, trucos para plazos legales, ejemplos reales y
            respuestas a las preguntas más frecuentes
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            {/* Casos de uso prácticos */}
            <section className={styles.guideSection}>
              <h2>Casos de Uso Prácticos</h2>
              <div className={styles.contentGrid}>
                <div className={styles.contentCard}>
                  <h4>📄 Contratos y Plazos</h4>
                  <p>
                    <strong>Ejemplo:</strong> Firmaste un contrato el 15/01/2024 con duración
                    de 18 meses. ¿Cuándo vence?
                  </p>
                  <p>
                    <strong>Resultado:</strong> 15/07/2025
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>💼 Gestión de Proyectos</h4>
                  <p>
                    <strong>Ejemplo:</strong> Proyecto inicia 03/06/2024, entrega 25/11/2024.
                    ¿Cuántos días laborables?
                  </p>
                  <p>
                    <strong>Resultado:</strong> ~124 días hábiles
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>👶 Embarazo y Parto</h4>
                  <p>
                    <strong>Ejemplo:</strong> Última menstruación: 10/02/2024. Fecha probable
                    parto (280 días)?
                  </p>
                  <p>
                    <strong>Resultado:</strong> 17/11/2024
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>⚖️ Plazos Legales</h4>
                  <p>
                    <strong>Ejemplo:</strong> Notificación 05/03/2024, plazo 30 días hábiles.
                    ¿Vencimiento?
                  </p>
                  <p>
                    <strong>Resultado:</strong> 16/04/2024
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>🎓 Antigüedad Laboral</h4>
                  <p>
                    <strong>Ejemplo:</strong> Contratación: 01/06/2020. Antigüedad en
                    diciembre 2024?
                  </p>
                  <p>
                    <strong>Resultado:</strong> 4 años, 6 meses
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>🎂 Edad Precisa</h4>
                  <p>
                    <strong>Ejemplo:</strong> Naciste el 23/05/1995. ¿Edad exacta el
                    15/06/2024?
                  </p>
                  <p>
                    <strong>Resultado:</strong> 29 años, 23 días
                  </p>
                </div>
              </div>
            </section>

            {/* ¿Qué es una calculadora de fechas? */}
            <section className={styles.guideSection}>
              <h2>¿Qué es una Calculadora de Fechas?</h2>
              <p>
                Una calculadora de fechas es una herramienta digital que permite realizar
                cálculos precisos con fechas y periodos de tiempo. Facilita operaciones complejas
                como determinar la diferencia exacta entre dos fechas, calcular edades precisas,
                sumar o restar días laborables, y determinar qué día de la semana corresponde a
                cualquier fecha histórica o futura.
              </p>
              <p>
                Esta herramienta es esencial para profesionales de recursos humanos, contadores,
                project managers, historiadores y cualquier persona que necesite realizar cálculos
                temporales precisos. Nuestra calculadora considera años bisiestos, meses con
                diferentes cantidades de días y proporciona resultados exactos en múltiples
                formatos.
              </p>
            </section>

            {/* Aplicaciones principales */}
            <section className={styles.guideSection}>
              <h2>Aplicaciones Principales</h2>
              <div className={styles.contentGrid}>
                <div className={styles.contentCard}>
                  <h4>📊 Gestión de Proyectos</h4>
                  <p>
                    Calcular duraciones, fechas límite y plazos de entrega. Determinar días
                    laborables entre hitos del proyecto.
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>👥 Recursos Humanos</h4>
                  <p>
                    Determinar antigüedad laboral, calcular vacaciones proporcionales,
                    jubilaciones y periodos de prueba.
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>⚖️ Legal y Contable</h4>
                  <p>
                    Calcular vencimientos de contratos, prescripciones legales, periodos
                    fiscales y plazos procesales.
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>👨‍👩‍👧 Personal</h4>
                  <p>
                    Conocer edad exacta, planificar eventos, calcular aniversarios y fechas
                    especiales familiares.
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>🎓 Educación</h4>
                  <p>
                    Determinar duraciones de cursos, periodos académicos, calendarios escolares
                    y fechas de exámenes.
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h4>🏥 Salud</h4>
                  <p>
                    Calcular fechas de parto estimadas, periodos de tratamiento, seguimiento de
                    medicación y citas médicas.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className={styles.guideSection}>
              <h2>Preguntas Frecuentes (FAQ)</h2>
              <div className={styles.faqGrid}>
                <div className={styles.faqItem}>
                  <h4>¿Cómo calculo la diferencia entre dos fechas?</h4>
                  <p>
                    Simplemente selecciona la fecha inicial y la fecha final en la primera
                    calculadora. La herramienta te mostrará la diferencia en días, semanas,
                    meses y años, además del tiempo exacto en formato años-meses-días.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿La calculadora considera los años bisiestos?</h4>
                  <p>
                    Sí, nuestra calculadora tiene en cuenta los años bisiestos, los diferentes
                    días de cada mes y proporciona cálculos precisos considerando el calendario
                    gregoriano actual.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Puedo calcular fechas futuras?</h4>
                  <p>
                    Por supuesto. Puedes sumar días, semanas, meses o años a cualquier fecha
                    base para obtener una fecha futura. También puedes restar tiempo para
                    obtener fechas pasadas.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Cómo sé qué día de la semana fue una fecha histórica?</h4>
                  <p>
                    Usa la calculadora &quot;Día de la semana&quot; e introduce cualquier fecha desde
                    1900. Te dirá exactamente qué día de la semana fue y cuánto tiempo ha pasado
                    desde entonces.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿La calculadora de edad es precisa?</h4>
                  <p>
                    Totalmente. La calculadora de edad proporciona la edad exacta en años, meses
                    y días, además de información adicional como días totales vividos y días
                    hasta el próximo cumpleaños.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Puedo calcular días laborables?</h4>
                  <p>
                    La calculadora actual calcula días calendario completos. Para cálculos de
                    días laborables, te recomendamos usar herramientas especializadas que
                    consideren festivos específicos de tu localidad.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer meskeIA */}
      <Footer appName="Calculadora de Fechas" />
    </>
  );
}
