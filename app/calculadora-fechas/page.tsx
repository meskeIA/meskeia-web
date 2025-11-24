'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './CalculadoraFechas.module.css';

export default function CalculadoraFechasPage() {
  const today = new Date().toISOString().split('T')[0];

  // Estados para diferencia entre fechas
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [diffResult, setDiffResult] = useState<string>('');

  // Estados para sumar/restar
  const [baseDate, setBaseDate] = useState<string>(today);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [timeValue, setTimeValue] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<'days' | 'months' | 'years'>('days');
  const [addSubResult, setAddSubResult] = useState<string>('');

  // Estados para día de la semana
  const [dayDate, setDayDate] = useState<string>(today);
  const [dayOfWeekResult, setDayOfWeekResult] = useState<string>('');

  // Estados para edad
  const [birthDate, setBirthDate] = useState<string>('');
  const [referenceDate, setReferenceDate] = useState<string>(today);
  const [ageResult, setAgeResult] = useState<string>('');

  // Estado para contenido educativo
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDifference = () => {
    if (!startDate || !endDate) {
      alert('Por favor, introduce ambas fechas');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);

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

    setDiffResult(`
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Total de días:</span>
        <span class="${styles.resultValue}">${diffDays.toLocaleString('es-ES')} días</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Semanas:</span>
        <span class="${styles.resultValue}">${diffWeeks.toLocaleString('es-ES')} semanas</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Meses (aprox.):</span>
        <span class="${styles.resultValue}">${diffMonths.toLocaleString('es-ES')} meses</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Años (aprox.):</span>
        <span class="${styles.resultValue}">${diffYears.toLocaleString('es-ES')} años</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Diferencia exacta:</span>
        <span class="${styles.resultValue} ${styles.highlight}">${years} años, ${months} meses y ${days} días</span>
      </div>
    `);
  };

  const calculateAddSubtract = () => {
    if (!baseDate || !timeValue) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const base = new Date(baseDate);
    const value = parseInt(timeValue);
    const multiplier = operation === 'add' ? 1 : -1;
    let resultDate = new Date(base);

    if (timeUnit === 'days') {
      resultDate.setDate(resultDate.getDate() + (value * multiplier));
    } else if (timeUnit === 'months') {
      resultDate.setMonth(resultDate.getMonth() + (value * multiplier));
    } else if (timeUnit === 'years') {
      resultDate.setFullYear(resultDate.getFullYear() + (value * multiplier));
    }

    const operationText = operation === 'add' ? 'sumar' : 'restar';
    const unitText = {
      days: 'días',
      months: 'meses',
      years: 'años'
    }[timeUnit];

    setAddSubResult(`
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Operación:</span>
        <span class="${styles.resultValue}">${operationText} ${value} ${unitText}</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Fecha inicial:</span>
        <span class="${styles.resultValue}">${formatDate(base)}</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Fecha resultado:</span>
        <span class="${styles.resultValue} ${styles.highlight}">${formatDate(resultDate)}</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Formato ISO:</span>
        <span class="${styles.resultValue}">${resultDate.toISOString().split('T')[0]}</span>
      </div>
    `);
  };

  const calculateDayOfWeek = () => {
    if (!dayDate) {
      alert('Por favor, introduce una fecha');
      return;
    }

    const date = new Date(dayDate);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = dayNames[date.getDay()];

    const todayDate = new Date();
    const diffTime = todayDate.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365.25);

    let timeAgoText = '';
    if (diffDays > 0) {
      if (diffYears > 1) {
        timeAgoText = `Fue hace ${diffYears.toLocaleString('es-ES')} años (${diffDays.toLocaleString('es-ES')} días)`;
      } else {
        timeAgoText = `Fue hace ${diffDays.toLocaleString('es-ES')} días`;
      }
    } else if (diffDays < 0) {
      const futureDays = Math.abs(diffDays);
      timeAgoText = `Será dentro de ${futureDays.toLocaleString('es-ES')} días`;
    } else {
      timeAgoText = '¡Es hoy!';
    }

    setDayOfWeekResult(`
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Fecha consultada:</span>
        <span class="${styles.resultValue}">${formatDate(date)}</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Día de la semana:</span>
        <span class="${styles.resultValue} ${styles.highlight}">${dayOfWeek}</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Relativo a hoy:</span>
        <span class="${styles.resultValue}">${timeAgoText}</span>
      </div>
    `);
  };

  const calculateAge = () => {
    if (!birthDate) {
      alert('Por favor, introduce tu fecha de nacimiento');
      return;
    }

    const birth = new Date(birthDate);
    const reference = referenceDate ? new Date(referenceDate) : new Date();

    if (birth > reference) {
      alert('La fecha de nacimiento no puede ser posterior a la fecha de referencia');
      return;
    }

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

    const totalDays = Math.floor((reference.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    let nextBirthday = new Date(reference.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < reference) {
      nextBirthday.setFullYear(reference.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.floor((nextBirthday.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24));

    setAgeResult(`
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Edad exacta:</span>
        <span class="${styles.resultValue} ${styles.highlight}">${years} años, ${months} meses y ${days} días</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Total de días vividos:</span>
        <span class="${styles.resultValue}">${totalDays.toLocaleString('es-ES')} días</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Días para próximo cumpleaños:</span>
        <span class="${styles.resultValue}">${daysToNextBirthday.toLocaleString('es-ES')} días</span>
      </div>
      <div class="${styles.resultItem}">
        <span class="${styles.resultLabel}">Fecha de referencia:</span>
        <span class="${styles.resultValue}">${formatDate(reference)}</span>
      </div>
    `);
  };

  return (
    <>
      <AnalyticsTracker appName="calculadora-fechas" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calculadora de Fechas",
            "description": "Herramienta online gratuita para calcular diferencias entre fechas, edades, sumar o restar días y determinar días de la semana",
            "url": "https://meskeia.com/beta/calculadora-fechas",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "author": {
              "@type": "Organization",
              "name": "meskeIA",
              "url": "https://meskeia.com"
            }
          })
        }}
      />

      <MeskeiaLogo />

      <div className={styles.container}>
        <h1>Calculadora de Fechas Online</h1>
        <p className={styles.subtitle}>
          Calcula diferencias entre fechas, suma o resta días, y determina edades exactas
        </p>

        <div className={styles.calculatorGrid}>
          {/* Diferencia entre fechas */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>📅 Diferencia entre Fechas</div>

            <div className={styles.formGroup}>
              <label>Fecha inicial:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fecha final:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={calculateDifference}>
              Calcular Diferencia
            </button>

            {diffResult && (
              <div className={`${styles.resultSection} ${styles.show}`}>
                <div className={styles.resultTitle}>Resultado:</div>
                <div dangerouslySetInnerHTML={{ __html: diffResult }} />
              </div>
            )}
          </div>

          {/* Sumar/Restar fechas */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>➕ Sumar o Restar Tiempo</div>

            <div className={styles.formGroup}>
              <label>Fecha base:</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Operación:</label>
              <select value={operation} onChange={(e) => setOperation(e.target.value as 'add' | 'subtract')}>
                <option value="add">Sumar</option>
                <option value="subtract">Restar</option>
              </select>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.formGroup}>
                <label>Cantidad:</label>
                <input
                  type="number"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  placeholder="Ej: 30"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Unidad:</label>
                <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value as 'days' | 'months' | 'years')}>
                  <option value="days">Días</option>
                  <option value="months">Meses</option>
                  <option value="years">Años</option>
                </select>
              </div>
            </div>

            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={calculateAddSubtract}>
              Calcular Nueva Fecha
            </button>

            {addSubResult && (
              <div className={`${styles.resultSection} ${styles.show}`}>
                <div className={styles.resultTitle}>Resultado:</div>
                <div dangerouslySetInnerHTML={{ __html: addSubResult }} />
              </div>
            )}
          </div>

          {/* Día de la semana */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>📆 Día de la Semana</div>

            <div className={styles.formGroup}>
              <label>Selecciona una fecha:</label>
              <input
                type="date"
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
              />
            </div>

            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={calculateDayOfWeek}>
              ¿Qué día fue/será?
            </button>

            {dayOfWeekResult && (
              <div className={`${styles.resultSection} ${styles.show}`}>
                <div className={styles.resultTitle}>Resultado:</div>
                <div dangerouslySetInnerHTML={{ __html: dayOfWeekResult }} />
              </div>
            )}
          </div>

          {/* Calculadora de edad */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>🎂 Calculadora de Edad</div>

            <div className={styles.formGroup}>
              <label>Fecha de nacimiento:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fecha de referencia (opcional):</label>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
              />
            </div>

            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={calculateAge}>
              Calcular Edad
            </button>

            {ageResult && (
              <div className={`${styles.resultSection} ${styles.show}`}>
                <div className={styles.resultTitle}>Resultado:</div>
                <div dangerouslySetInnerHTML={{ __html: ageResult }} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>¿Cómo usar esta Calculadora de Fechas?</h2>
          <p>
            Nuestra herramienta te permite realizar cuatro tipos de cálculos con fechas de forma rápida y precisa:
          </p>
          <ul>
            <li><strong>Diferencia entre fechas:</strong> Calcula exactamente cuántos días, semanas, meses o años hay entre dos fechas.</li>
            <li><strong>Sumar o restar tiempo:</strong> Añade o quita días, meses o años a cualquier fecha.</li>
            <li><strong>Día de la semana:</strong> Descubre qué día de la semana fue o será una fecha específica.</li>
            <li><strong>Edad exacta:</strong> Calcula tu edad en años, meses y días, y cuándo será tu próximo cumpleaños.</li>
          </ul>

          <h3>Casos de uso comunes:</h3>
          <ul>
            <li>Calcular plazos legales o administrativos</li>
            <li>Planificar eventos futuros con precisión</li>
            <li>Determinar la edad exacta para documentos oficiales</li>
            <li>Calcular aniversarios y fechas especiales</li>
            <li>Gestionar proyectos con plazos específicos</li>
          </ul>
        </div>

        <div className={styles.faqSection}>
          <h2>Preguntas Frecuentes</h2>

          <div className={styles.faqItem}>
            <h3>¿Cómo se calcula la diferencia exacta entre fechas?</h3>
            <p>
              La calculadora considera los días calendario reales, teniendo en cuenta los diferentes números de días en cada mes y los años bisiestos. La diferencia exacta se expresa en años, meses y días completos.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Puedo calcular fechas futuras?</h3>
            <p>
              Sí, puedes usar la función "Sumar o Restar Tiempo" para calcular fechas futuras añadiendo días, meses o años a cualquier fecha base.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Cómo funciona la calculadora de edad?</h3>
            <p>
              Introduce tu fecha de nacimiento y, opcionalmente, una fecha de referencia. La calculadora te mostrará tu edad exacta en años, meses y días, cuántos días has vivido y cuándo será tu próximo cumpleaños.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿La calculadora considera años bisiestos?</h3>
            <p>
              Sí, todos los cálculos tienen en cuenta los años bisiestos automáticamente, garantizando resultados precisos.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Puedo usar esta herramienta para calcular plazos legales?</h3>
            <p>
              Sí, la calculadora es útil para calcular plazos administrativos y legales. Sin embargo, consulta siempre con un profesional legal para asegurarte de que estás interpretando correctamente los plazos específicos de tu caso.
            </p>
          </div>
        </div>

        {/* Toggle para contenido educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Cálculos de Fechas?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre aplicaciones prácticas, consejos útiles y respuestas a las preguntas más frecuentes sobre cálculos de fechas
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
            <section className={styles.guideSection}>
              <h2>Guía Práctica de Cálculos de Fechas</h2>

              {/* Aplicaciones Prácticas */}
              <div className={styles.useCasesSection}>
                <h3>Aplicaciones Prácticas del Día a Día</h3>
                <div className={styles.useCasesGrid}>
                  <div className={styles.useCaseCard}>
                    <h4>💼 Plazos Laborales</h4>
                    <p>
                      Calcula fechas de vencimiento de contratos, periodos de prueba (normalmente 6 meses),
                      preaviso de despido (15 días naturales), o períodos de vacaciones acumulados.
                      Fundamental para RR.HH. y gestión de personal.
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>📋 Trámites Administrativos</h4>
                    <p>
                      Determina plazos legales como los 20 días hábiles para alegaciones, los 3 meses para
                      reclamaciones, o la validez de documentos (ej: certificados de empadronamiento válidos
                      por 3 meses). Esencial para no perder derechos por expiración de plazos.
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>✈️ Planificación de Viajes</h4>
                    <p>
                      Calcula cuántos días faltan para tus vacaciones, verifica la validez del pasaporte
                      (muchos países exigen 6 meses de validez mínima), o planifica itinerarios calculando
                      días entre vuelos y conexiones internacionales.
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>💰 Finanzas Personales</h4>
                    <p>
                      Determina fechas de vencimiento de préstamos, calcula intereses diarios en cuentas de ahorro,
                      planifica pagos mensuales, o verifica los 90 días de carencia típicos en hipotecas.
                      Útil para gestión presupuestaria y ahorro.
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>🏥 Salud y Embarazo</h4>
                    <p>
                      Calcula la fecha probable de parto (280 días desde la última menstruación), determina
                      semanas de gestación exactas, planifica citas médicas periódicas, o verifica períodos
                      de tratamiento médico (ej: antibióticos de 7-10 días).
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>🎓 Educación y Formación</h4>
                    <p>
                      Planifica cursos académicos, calcula días hasta exámenes, determina períodos de
                      matriculación, o verifica requisitos de edad para inscripciones (ej: "tener 18 años
                      cumplidos antes del 31 de diciembre").
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>🏗️ Gestión de Proyectos</h4>
                    <p>
                      Calcula duración real de proyectos, determina hitos intermedios, verifica retrasos
                      en entregas, o planifica sprints de desarrollo. Herramienta clave para project managers
                      y equipos ágiles que necesitan precisión en plazos.
                    </p>
                  </div>

                  <div className={styles.useCaseCard}>
                    <h4>📜 Conmemoraciones Históricas</h4>
                    <p>
                      Descubre qué día de la semana naciste, calcula aniversarios exactos de eventos históricos,
                      o determina días especiales (ej: "¿qué día fue el 20 de julio de 1969, la llegada a la Luna?").
                      Perfecto para curiosidades y celebraciones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consejos Útiles */}
              <div className={styles.tipsSection}>
                <h3>Consejos para Cálculos Precisos</h3>
                <div className={styles.tipsGrid}>
                  <div className={styles.tipCard}>
                    <h4>⏰ Diferencia entre días naturales y hábiles</h4>
                    <p>
                      <strong>Días naturales:</strong> Incluyen todos los días del calendario (lunes a domingo,
                      festivos incluidos). Usados en plazos legales como preaviso de despido.<br/><br/>
                      <strong>Días hábiles:</strong> Excluyen sábados, domingos y festivos. Comunes en
                      administración pública (ej: 20 días hábiles para alegaciones = aproximadamente 1 mes).
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>📆 Cómo contar plazos correctamente</h4>
                    <p>
                      En plazos legales, el <strong>día inicial NO se cuenta</strong>. Si recibes una notificación
                      el 15 de enero con plazo de 10 días, empiezas a contar desde el 16. El plazo vence el 25 de enero.
                      Si el último día es festivo, se traslada automáticamente al siguiente día hábil.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>🔄 Meses comerciales vs meses calendario</h4>
                    <p>
                      <strong>Mes calendario:</strong> Del día X de un mes al día X del siguiente mes (ej: del 15
                      de marzo al 15 de abril).<br/><br/>
                      <strong>Mes comercial:</strong> Siempre 30 días, usado en finanzas. Importante en contratos de
                      alquiler y préstamos donde "1 mes" = exactamente 30 días.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>🎯 Años bisiestos y su impacto</h4>
                    <p>
                      Los años bisiestos (como 2024, 2028) tienen 366 días en lugar de 365. Febrero tiene 29 días.
                      Esto afecta cálculos de edad (un día extra), intereses bancarios, y plazos que cruzan febrero.
                      <strong>Regla:</strong> Año bisiesto si es divisible por 4, excepto centenares (2100 NO es bisiesto).
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>⚖️ Plazos de prescripción importantes</h4>
                    <p>
                      <strong>Reclamaciones laborales:</strong> 1 año<br/>
                      <strong>Deudas generales:</strong> 5 años<br/>
                      <strong>Delitos leves:</strong> 1 año<br/>
                      <strong>IVA y declaraciones fiscales:</strong> 4 años<br/>
                      Conocer estos plazos te ayuda a no perder derechos o enfrentar obligaciones ya prescritas.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>🌍 Zonas horarias en fechas internacionales</h4>
                    <p>
                      Al trabajar con fechas de diferentes países, considera las zonas horarias. Una reunión a las
                      15:00 CET (España) es a las 09:00 EST (Nueva York), 6 horas de diferencia. Usa formato ISO 8601
                      (YYYY-MM-DD) para evitar confusiones entre DD/MM/YYYY (Europa) y MM/DD/YYYY (EE.UU.).
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Extendido */}
              <div className={styles.faqExtendedSection}>
                <h3>Preguntas Frecuentes Extendidas</h3>
                <div className={styles.faqContainer}>
                  <div className={styles.faqItem}>
                    <h4>¿Por qué febrero tiene 28 o 29 días?</h4>
                    <p>
                      El calendario juliano original tenía años de 365.25 días. Para corregir el desfase acumulado
                      entre el año solar real (365.242 días) y el calendario, el papa Gregorio XIII instituyó el
                      calendario gregoriano en 1582. Se decidió añadir un día extra cada 4 años (año bisiesto),
                      pero excluir los años centenarios no divisibles por 400. Febrero fue elegido para el ajuste
                      por ser el mes más corto. Así, 2000 fue bisiesto, pero 1900 y 2100 no lo son.
                    </p>
                  </div>

                  <div className={styles.faqItem}>
                    <h4>¿Cómo calcular edad legal para conducir o votar?</h4>
                    <p>
                      En España, puedes votar a partir del día de tu 18º cumpleaños (inclusive). Para conducir,
                      necesitas tener 18 años cumplidos el día del examen práctico. Ejemplo: Si naciste el 20 de
                      mayo de 2006, puedes votar el 20 de mayo de 2024 y presentarte al examen de conducir ese mismo
                      día. Usa la calculadora de edad con la fecha del evento como referencia para verificar si cumples
                      el requisito.
                    </p>
                  </div>

                  <div className={styles.faqItem}>
                    <h4>¿Qué son los días juliano y cómo se usan?</h4>
                    <p>
                      El día juliano (no confundir con el calendario juliano) es un sistema de numeración continua
                      de días usado en astronomía, agricultura y logística. Cuenta los días consecutivos desde el
                      1 de enero como día 1 hasta el 365 (o 366). Ejemplo: el 15 de febrero de 2024 es el día juliano 46.
                      Útil en agricultura para calcular fechas de siembra o en programación para operaciones de fechas
                      sin preocuparse por meses de diferente longitud.
                    </p>
                  </div>

                  <div className={styles.faqItem}>
                    <h4>¿Cómo se calculan los intereses diarios en préstamos?</h4>
                    <p>
                      Los bancos usan la fórmula: <strong>Interés diario = (Capital × TAE anual) / 365</strong>.
                      Ejemplo: Un préstamo de 10.000 € al 5% TAE genera 10.000 × 0.05 / 365 = 1.37 € de interés diario.
                      Para calcular intereses acumulados entre dos fechas, usa nuestra calculadora de diferencia entre
                      fechas para obtener los días exactos, luego multiplica: Interés diario × Número de días. Esto es
                      especialmente útil en hipotecas con amortización anticipada.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
