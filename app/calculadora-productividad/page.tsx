'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './CalculadoraProductividad.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface ProjectData {
  id: string;
  name: string;
  ingresos: string;
  horasTotales: string;
  horasReuniones: string;
  horasGestion: string;
  horasRevisiones: string;
}

interface ProjectResults {
  horasEfectivas: number;
  ingresosPorHoraTotal: number;
  ingresosPorHoraEfectiva: number;
  porcentajeEficiencia: number;
  tiempoNoFacturable: number;
}

const STORAGE_KEY = 'meskeia-calculadora-productividad';

const createEmptyProject = (): ProjectData => ({
  id: Date.now().toString(),
  name: '',
  ingresos: '',
  horasTotales: '',
  horasReuniones: '',
  horasGestion: '',
  horasRevisiones: '',
});

export default function CalculadoraProductividadPage() {
  const [projects, setProjects] = useState<ProjectData[]>([createEmptyProject()]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos de localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setProjects(parsed);
        }
      } catch {
        // Si hay error, usar estado inicial
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, isLoaded]);

  // Calcular resultados de un proyecto
  const calculateProject = useCallback((project: ProjectData): ProjectResults | null => {
    const ingresos = parseSpanishNumber(project.ingresos);
    const horasTotales = parseSpanishNumber(project.horasTotales);
    const horasReuniones = parseSpanishNumber(project.horasReuniones) || 0;
    const horasGestion = parseSpanishNumber(project.horasGestion) || 0;
    const horasRevisiones = parseSpanishNumber(project.horasRevisiones) || 0;

    if (isNaN(ingresos) || isNaN(horasTotales) || horasTotales <= 0 || ingresos <= 0) {
      return null;
    }

    const tiempoNoFacturable = horasReuniones + horasGestion + horasRevisiones;
    const horasEfectivas = Math.max(horasTotales - tiempoNoFacturable, 0.1);
    const ingresosPorHoraTotal = ingresos / horasTotales;
    const ingresosPorHoraEfectiva = ingresos / horasEfectivas;
    const porcentajeEficiencia = (horasEfectivas / horasTotales) * 100;

    return {
      horasEfectivas,
      ingresosPorHoraTotal,
      ingresosPorHoraEfectiva,
      porcentajeEficiencia,
      tiempoNoFacturable,
    };
  }, []);

  // Actualizar campo de proyecto
  const updateProject = (id: string, field: keyof ProjectData, value: string) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Añadir proyecto
  const addProject = () => {
    setProjects([...projects, createEmptyProject()]);
  };

  // Eliminar proyecto
  const removeProject = (id: string) => {
    if (projects.length > 1) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  // Limpiar todo
  const clearAll = () => {
    if (confirm('¿Eliminar todos los proyectos? Esta acción no se puede deshacer.')) {
      setProjects([createEmptyProject()]);
    }
  };

  // Calcular resumen global
  const calculateGlobalSummary = () => {
    let totalIngresos = 0;
    let totalHoras = 0;
    let totalHorasEfectivas = 0;
    let projectsWithData = 0;

    projects.forEach(project => {
      const results = calculateProject(project);
      if (results) {
        const ingresos = parseSpanishNumber(project.ingresos);
        const horas = parseSpanishNumber(project.horasTotales);
        totalIngresos += ingresos;
        totalHoras += horas;
        totalHorasEfectivas += results.horasEfectivas;
        projectsWithData++;
      }
    });

    if (projectsWithData === 0) return null;

    return {
      totalIngresos,
      totalHoras,
      totalHorasEfectivas,
      ingresosPorHoraGlobal: totalIngresos / totalHoras,
      ingresosPorHoraEfectivaGlobal: totalIngresos / totalHorasEfectivas,
      eficienciaGlobal: (totalHorasEfectivas / totalHoras) * 100,
      projectsWithData,
    };
  };

  const globalSummary = calculateGlobalSummary();

  // Obtener color según eficiencia
  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 80) return '#27ae60';
    if (efficiency >= 60) return '#f39c12';
    return '#e74c3c';
  };

  // Obtener variante según eficiencia
  const getEfficiencyVariant = (efficiency: number): 'success' | 'warning' | 'default' => {
    if (efficiency >= 80) return 'success';
    if (efficiency >= 60) return 'warning';
    return 'default';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📊</span>
        <h1 className={styles.title}>Calculadora de Productividad</h1>
        <p className={styles.subtitle}>
          Analiza tu productividad real como freelance. Calcula ingresos por hora efectiva
          descontando reuniones, gestión y tiempo no facturable.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-productividad"
        collapsible={false}
      />

      {/* Proyectos */}
      <div className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <h2>Tus Proyectos/Clientes</h2>
          <div className={styles.headerActions}>
            <button onClick={addProject} className={styles.addButton}>
              + Añadir proyecto
            </button>
            {projects.length > 1 && (
              <button onClick={clearAll} className={styles.clearButton}>
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        {projects.map((project, index) => {
          const results = calculateProject(project);
          return (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectHeader}>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                  placeholder={`Proyecto ${index + 1}`}
                  className={styles.projectNameInput}
                  aria-label="Nombre del proyecto"
                />
                {projects.length > 1 && (
                  <button
                    onClick={() => removeProject(project.id)}
                    className={styles.removeButton}
                    aria-label="Eliminar proyecto"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className={styles.projectInputs}>
                <div className={styles.inputRow}>
                  <NumberInput
                    value={project.ingresos}
                    onChange={(v) => updateProject(project.id, 'ingresos', v)}
                    label="Ingresos totales (€)"
                    placeholder="1500"
                    helperText="Lo que has cobrado/facturado"
                    min={0}
                  />
                  <NumberInput
                    value={project.horasTotales}
                    onChange={(v) => updateProject(project.id, 'horasTotales', v)}
                    label="Horas totales dedicadas"
                    placeholder="40"
                    helperText="Todo el tiempo invertido"
                    min={0}
                  />
                </div>

                <div className={styles.inputRowSecondary}>
                  <NumberInput
                    value={project.horasReuniones}
                    onChange={(v) => updateProject(project.id, 'horasReuniones', v)}
                    label="Horas reuniones"
                    placeholder="5"
                    helperText="Calls, presentaciones..."
                    min={0}
                  />
                  <NumberInput
                    value={project.horasGestion}
                    onChange={(v) => updateProject(project.id, 'horasGestion', v)}
                    label="Horas gestión"
                    placeholder="3"
                    helperText="Emails, admin, presupuestos..."
                    min={0}
                  />
                  <NumberInput
                    value={project.horasRevisiones}
                    onChange={(v) => updateProject(project.id, 'horasRevisiones', v)}
                    label="Horas revisiones"
                    placeholder="4"
                    helperText="Cambios, correcciones..."
                    min={0}
                  />
                </div>
              </div>

              {results && (
                <div className={styles.projectResults}>
                  <div className={styles.resultsGrid}>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>€/hora (total)</span>
                      <span className={styles.resultValue}>{formatCurrency(results.ingresosPorHoraTotal)}</span>
                    </div>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>€/hora (efectiva)</span>
                      <span className={styles.resultValueHighlight}>{formatCurrency(results.ingresosPorHoraEfectiva)}</span>
                    </div>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Horas efectivas</span>
                      <span className={styles.resultValue}>{formatNumber(results.horasEfectivas, 1)}h</span>
                    </div>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Eficiencia</span>
                      <span
                        className={styles.resultValue}
                        style={{ color: getEfficiencyColor(results.porcentajeEficiencia) }}
                      >
                        {formatNumber(results.porcentajeEficiencia, 0)}%
                      </span>
                    </div>
                  </div>
                  {results.tiempoNoFacturable > 0 && (
                    <p className={styles.resultNote}>
                      ⏱️ {formatNumber(results.tiempoNoFacturable, 1)}h de tiempo no facturable
                      ({formatNumber((results.tiempoNoFacturable / parseSpanishNumber(project.horasTotales)) * 100, 0)}% del total)
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen Global */}
      {globalSummary && globalSummary.projectsWithData > 0 && (
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>📈 Resumen Global</h2>
          <div className={styles.summaryGrid}>
            <ResultCard
              title="Ingresos totales"
              value={formatNumber(globalSummary.totalIngresos, 2)}
              unit="€"
              variant="default"
              icon="💰"
            />
            <ResultCard
              title="€/hora (todas las horas)"
              value={formatNumber(globalSummary.ingresosPorHoraGlobal, 2)}
              unit="€"
              variant="info"
              icon="⏱️"
              description="Calculado sobre horas totales"
            />
            <ResultCard
              title="€/hora REAL"
              value={formatNumber(globalSummary.ingresosPorHoraEfectivaGlobal, 2)}
              unit="€"
              variant="highlight"
              icon="🎯"
              description="Solo horas de trabajo efectivo"
            />
            <ResultCard
              title="Eficiencia global"
              value={formatNumber(globalSummary.eficienciaGlobal, 0)}
              unit="%"
              variant={getEfficiencyVariant(globalSummary.eficienciaGlobal)}
              icon="📊"
              description={`${formatNumber(globalSummary.totalHorasEfectivas, 0)}h efectivas de ${formatNumber(globalSummary.totalHoras, 0)}h totales`}
            />
          </div>

          {/* Interpretación */}
          <div className={styles.interpretation}>
            <h3>💡 Interpretación</h3>
            {globalSummary.eficienciaGlobal >= 80 ? (
              <p className={styles.interpretationGood}>
                <strong>Excelente eficiencia ({formatNumber(globalSummary.eficienciaGlobal, 0)}%)</strong>:
                Tu tiempo no facturable es bajo. Estás optimizando bien tu trabajo.
              </p>
            ) : globalSummary.eficienciaGlobal >= 60 ? (
              <p className={styles.interpretationWarning}>
                <strong>Eficiencia mejorable ({formatNumber(globalSummary.eficienciaGlobal, 0)}%)</strong>:
                Revisa si puedes reducir reuniones innecesarias o simplificar procesos de gestión.
              </p>
            ) : (
              <p className={styles.interpretationBad}>
                <strong>Eficiencia baja ({formatNumber(globalSummary.eficienciaGlobal, 0)}%)</strong>:
                Demasiado tiempo en tareas no facturables. Considera ajustar tarifas,
                establecer límites de revisiones o cobrar por reuniones.
              </p>
            )}
            <p className={styles.interpretationTip}>
              📌 <strong>Tu tarifa efectiva es {formatCurrency(globalSummary.ingresosPorHoraEfectivaGlobal)}/hora</strong>,
              no {formatCurrency(globalSummary.ingresosPorHoraGlobal)}/hora.
              Tenlo en cuenta al calcular presupuestos futuros.
            </p>
          </div>
        </div>
      )}

      {/* Contenido Educativo */}
      <EducationalSection
        title="¿Por qué calcular tu productividad real?"
        subtitle="Descubre cuánto ganas realmente por hora de trabajo"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>El problema del freelance: tiempo invisible</h2>
          <p className={styles.introParagraph}>
            Muchos freelancers calculan su tarifa dividiendo ingresos entre horas trabajadas.
            Pero olvidan un factor crucial: <strong>el tiempo no facturable</strong>.
            Reuniones, emails, presupuestos, gestión administrativa, revisiones extra...
            todo ese tiempo &quot;invisible&quot; reduce drásticamente tu rentabilidad real.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🕐 Horas totales vs efectivas</h4>
              <p>
                Las <strong>horas totales</strong> incluyen todo el tiempo que dedicas a un proyecto.
                Las <strong>horas efectivas</strong> son solo las de trabajo productivo y facturable.
              </p>
              <p><em>
                Ejemplo: Si trabajas 40h pero 10h son reuniones y gestión,
                tus horas efectivas son 30h.
              </em></p>
            </div>
            <div className={styles.contentCard}>
              <h4>💶 Tarifa aparente vs real</h4>
              <p>
                Tu <strong>tarifa aparente</strong> es lo que cobras por hora de trabajo.
                Tu <strong>tarifa real</strong> incluye todo el tiempo &quot;gratis&quot; que dedicas.
              </p>
              <p><em>
                Ejemplo: 1.500€ / 40h = 37,50€/h aparente.
                1.500€ / 30h efectivas = 50€/h real necesario.
              </em></p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 ¿Qué es buena eficiencia?</h4>
              <ul>
                <li><strong>+80%</strong>: Excelente, muy optimizado</li>
                <li><strong>60-80%</strong>: Normal, mejorable</li>
                <li><strong>-60%</strong>: Problemático, revisar procesos</li>
              </ul>
              <p><em>
                La media de freelancers está en torno al 65-75% de eficiencia.
              </em></p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 Cómo mejorar tu eficiencia</h4>
              <ul>
                <li>Limita revisiones incluidas en el precio</li>
                <li>Cobra las reuniones o inclúyelas en tarifa</li>
                <li>Usa plantillas para presupuestos y contratos</li>
                <li>Agrupa tareas administrativas</li>
              </ul>
            </div>
          </div>

          <h3>Ejemplo práctico</h3>
          <div className={styles.exampleBox}>
            <p><strong>Proyecto de diseño web:</strong></p>
            <ul>
              <li>Ingresos: 2.000€</li>
              <li>Horas totales: 50h</li>
              <li>Reuniones: 8h (briefing, presentaciones, calls)</li>
              <li>Gestión: 4h (emails, presupuesto, factura)</li>
              <li>Revisiones extra: 6h (cambios del cliente)</li>
            </ul>
            <p><strong>Resultado:</strong></p>
            <ul>
              <li>Horas efectivas: 50 - 18 = 32h</li>
              <li>Tarifa aparente: 2.000€ / 50h = <strong>40€/hora</strong></li>
              <li>Tarifa real: 2.000€ / 32h = <strong>62,50€/hora</strong></li>
              <li>Eficiencia: 64%</li>
            </ul>
            <p className={styles.exampleConclusion}>
              💡 Para cobrar realmente 40€/hora, deberías haber facturado <strong>3.125€</strong>
              por este proyecto (o reducir tiempo no facturable).
            </p>
          </div>
        </section>

        {/* SECCIÓN 1: Tabla Comparativa de métricas */}
        <section className={styles.guideSection}>
          <h2>Comparativa de métricas de productividad</h2>
          <p className={styles.introParagraph}>
            No todas las métricas de productividad miden lo mismo. Esta tabla compara las cuatro más
            relevantes para autónomos y freelancers en España, y cuándo usar cada una.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Qué mide</th>
                  <th>Fórmula</th>
                  <th>Para quién</th>
                  <th>Frecuencia recomendada</th>
                  <th>Benchmark típico en España</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Ingresos por hora (total)</strong></td>
                  <td>Rentabilidad bruta incluyendo todo el tiempo</td>
                  <td>Ingresos ÷ Horas totales</td>
                  <td>Todo tipo de autónomos</td>
                  <td>Por proyecto</td>
                  <td>25–45 €/h (servicios generales)</td>
                </tr>
                <tr>
                  <td><strong>Ingresos por hora efectiva</strong></td>
                  <td>Rentabilidad real del trabajo facturable</td>
                  <td>Ingresos ÷ Horas efectivas</td>
                  <td>Freelancers, consultores</td>
                  <td>Por proyecto y mensual</td>
                  <td>40–80 €/h (objetivo saludable)</td>
                </tr>
                <tr>
                  <td><strong>Tasa de utilización</strong></td>
                  <td>% del tiempo total que se convierte en ingresos</td>
                  <td>Horas facturables ÷ Horas disponibles × 100</td>
                  <td>Consultores, agencias</td>
                  <td>Semanal o mensual</td>
                  <td>65–75% (objetivo óptimo)</td>
                </tr>
                <tr>
                  <td><strong>Margen neto por hora</strong></td>
                  <td>Beneficio real después de gastos e impuestos</td>
                  <td>(Ingresos − Gastos − Impuestos) ÷ Horas</td>
                  <td>Emprendedores, autónomos con gastos altos</td>
                  <td>Mensual o trimestral</td>
                  <td>15–35 €/h (varía por sector)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.tableNote}>
            * Datos de referencia para el mercado español en 2025. Fuente: RETA, Infojobs y encuestas del sector.
            España cuenta con 1.642 horas laborables oficiales en 2025, aunque los autónomos trabajan de media 1.900–2.100 h/año.
          </p>
        </section>

        {/* SECCIÓN 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Quién usa esta calculadora y para qué</h2>
          <p className={styles.introParagraph}>
            Cuatro perfiles reales con casos de uso concretos en el mercado español.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧑‍💻</span>
                <h3>Autónomo / Freelance</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Cobra 2.000€ por un proyecto y quiere saber si su tarifa
                de 40€/h cubre sus gastos reales (cuota RETA 366€/mes, seguro, software, etc.).
              </p>
              <p>
                Introduce ingresos y horas totales incluyendo reuniones y gestión. La calculadora
                revela que su tarifa efectiva es 55€/h, no 40€/h, lo que indica que debe subir precios
                o reducir tiempo no facturable.
              </p>
              <p className={styles.escenarioTip}>
                Clave: Con la cuota RETA mínima de 2025 (200€/mes para ingresos bajos), necesitas
                al menos 25€/h solo para cubrir cotizaciones, antes de ningún gasto más.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📋</span>
                <h3>Consultor</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Gestiona varios proyectos simultáneos y quiere comparar
                qué cliente es más rentable por hora real invertida.
              </p>
              <p>
                Añade cada proyecto como entrada separada. El resumen global muestra que el cliente A
                (más pequeño) genera 80€/h efectiva, mientras el cliente B (mayor volumen) solo 35€/h
                porque exige muchas reuniones y revisiones.
              </p>
              <p className={styles.escenarioTip}>
                Clave: La tasa de utilización objetivo para consultores independientes es 65–75%.
                Por encima del 80% hay riesgo de agotamiento; por debajo del 55%, ingresos insuficientes.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h3>Empleado</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Quiere calcular su coste-hora real para la empresa,
                incluyendo reuniones improductivas y tiempo de desplazamiento.
              </p>
              <p>
                Usa su salario bruto mensual como &quot;ingresos&quot; y sus horas laborales como
                &quot;horas totales&quot;. Al incluir horas de reuniones internas, descubre que su
                coste-hora efectivo para la empresa supera los 35€/h, lo que justifica negociar teletrabajo.
              </p>
              <p className={styles.escenarioTip}>
                Clave: La productividad media española es un 20% inferior a la alemana y un 15% inferior
                a la francesa, en gran parte por exceso de reuniones presenciales.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🚀</span>
                <h3>Emprendedor</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Ofrece varios servicios (formación, consultoría, diseño)
                y quiere identificar cuál es más rentable por hora real.
              </p>
              <p>
                Crea un proyecto por cada línea de negocio. La calculadora revela que sus talleres
                presenciales (con preparación, desplazamiento y gestión) generan 28€/h efectiva, mientras
                sus cursos online grabados generan 120€/h efectiva una vez creados.
              </p>
              <p className={styles.escenarioTip}>
                Clave: Analizar la rentabilidad por línea de negocio permite tomar decisiones estratégicas:
                escalar lo que funciona y eliminar o reprecia lo que no.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre productividad y tarifas</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Cuál es la diferencia entre horas facturadas y horas trabajadas?</h3>
              <p>
                Las <strong>horas facturadas</strong> son las que aparecen en tu factura al cliente
                y por las que cobras directamente. Las <strong>horas trabajadas</strong> incluyen
                además todo el tiempo invertido en el proyecto pero no facturado: reuniones, gestión
                administrativa, revisiones extra, comunicaciones y prospección. La diferencia entre
                ambas define tu pérdida de rentabilidad real.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuál es la tasa de utilización ideal para freelancers?</h3>
              <p>
                El rango óptimo es <strong>65–75%</strong> de las horas disponibles. Si tienes 160h
                laborables al mes, deberías facturar entre 104–120h. Por encima del 80% entras en zona
                de agotamiento y no tienes tiempo para captar nuevos clientes ni formarte. Por debajo
                del 55% los ingresos son insuficientes para cubrir gastos fijos como la cuota RETA.
              </p>
              <p className={styles.faqTip}>
                Con 1.642 horas laborables anuales en España (2025), una tasa del 70% equivale a
                unas 1.150 horas facturables al año, o aproximadamente 96h/mes.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo calcular el coste-hora real incluyendo vacaciones y enfermedad?</h3>
              <p>
                Debes dividir tus ingresos anuales necesarios entre las <strong>horas realmente
                facturables</strong>, no entre las 1.642 horas del calendario laboral. Resta:
                23 días de vacaciones + 10–12 festivos nacionales + media de 5 días de enfermedad
                + tiempo de prospección (~10% del tiempo). Resultado típico: unas 1.050–1.150 horas
                facturables reales al año. Si necesitas 40.000€ brutos, tu tarifa mínima debe ser
                unos 35–38€/h antes de gastos e impuestos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo afectan las reuniones a la productividad real?</h3>
              <p>
                Una reunión de 1 hora no cuesta 1 hora. Hay que añadir preparación (~20 min),
                desplazamiento si es presencial, y el tiempo de &quot;reentrada&quot; al trabajo
                profundo después (~15–25 min según estudios de UC Irvine). En la práctica, una
                reunión de 1h puede costar 2–2,5h de productividad. Un freelance con 3 reuniones
                semanales pierde potencialmente 6–7h de trabajo efectivo, el equivalente a un día
                completo de trabajo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo mejorar la tasa de utilización sin trabajar más horas?</h3>
              <p>
                Las palancas principales son: (1) <strong>reducir tiempo no facturable</strong>:
                agrupar gestión administrativa en bloques de 30–60 min diarios en lugar de responder
                emails continuamente; (2) <strong>cobrar por reuniones</strong> o incluirlas
                explícitamente en el presupuesto; (3) <strong>limitar revisiones</strong> a un número
                concreto en el contrato (2 rondas es el estándar del sector); (4) <strong>usar
                plantillas</strong> para presupuestos, contratos y onboarding de clientes.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuál es la productividad española comparada con Europa?</h3>
              <p>
                Según Eurostat 2024, la productividad por hora trabajada en España es un <strong>20%
                inferior a la alemana</strong> y un 15% inferior a la francesa. Sin embargo, los
                trabajadores españoles trabajan de media más horas anuales (1.800h) que los alemanes
                (1.340h). Paradójicamente, trabajar más horas no equivale a mayor productividad:
                la clave está en la calidad y enfoque del tiempo, no en la cantidad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué herramientas existen para medir la productividad?</h3>
              <p>
                Para <strong>tracking de tiempo</strong>: Toggl Track (gratuito hasta 5 usuarios),
                Clockify (gratuito ilimitado), Harvest (integra facturación). Para <strong>gestión
                de proyectos</strong>: Notion, ClickUp o Asana. Para <strong>facturación</strong>:
                Holded, Billin o Quipu (adaptados a la normativa española y el SII). Lo esencial
                es registrar el tiempo REAL por tarea, no estimaciones, durante al menos 4 semanas
                para obtener datos fiables.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuándo debo subir mis tarifas según la productividad?</h3>
              <p>
                Hay tres señales claras para subir tarifas: (1) tu tasa de utilización supera el
                75% de forma sostenida durante 2–3 meses (demanda mayor que capacidad); (2) tu
                margen neto por hora no supera el IPC anual (inflación erosiona tu poder adquisitivo);
                (3) tus ingresos por hora efectiva están por debajo del benchmark de tu sector.
                La revisión trimestral es lo recomendado: alinea con el ciclo fiscal de pagos
                fraccionados de IRPF (modelo 130).
              </p>
              <p className={styles.faqTip}>
                Regla práctica: si llevas más de 12 meses sin subir tarifas, ya has perdido
                poder adquisitivo. El IPC acumulado 2022–2024 en España supera el 15%.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: calcula y mejora tu productividad real</h2>
          <p className={styles.introParagraph}>
            Siete pasos para transformar datos en decisiones de negocio concretas.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Registra todas las horas del último proyecto</h3>
                <p>
                  No solo las horas de trabajo en sí: anota también reuniones (preparación + llamada),
                  emails relacionados, elaboración de presupuesto, revisiones y cualquier gestión
                  administrativa. Usa una hoja de cálculo o Toggl. Sé honesto: la mayoría de freelancers
                  subestima el tiempo real en un 20–30%.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Clasifica el tiempo en facturable y no facturable</h3>
                <p>
                  Facturable: trabajo directo que entrega valor al cliente (diseño, código, redacción,
                  formación). No facturable: coordinación interna, gestión de la relación, administración,
                  corrección de errores propios. Esta clasificación revela dónde se &quot;pierde&quot; la rentabilidad.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Calcula tus métricas clave con esta herramienta</h3>
                <p>
                  Introduce los datos en la calculadora: ingresos totales del proyecto, horas totales,
                  y desglose de horas no facturables (reuniones, gestión, revisiones). Anota los
                  resultados: €/h total, €/h efectiva y porcentaje de eficiencia.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Compara con tu tarifa objetivo mínima</h3>
                <p>
                  Calcula cuánto necesitas ganar por hora real para cubrir: cuota RETA + IRPF estimado +
                  gastos fijos mensuales (software, seguros, gestoría) + sueldo neto deseado, dividido
                  entre tus horas facturables anuales reales (~1.100h). Si tu €/h efectiva es menor,
                  tienes un déficit que debes corregir.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Identifica los principales &quot;ladrones de tiempo&quot;</h3>
                <p>
                  Analiza cuál de las tres categorías no facturables (reuniones, gestión, revisiones)
                  consume más tiempo. Si las reuniones superan el 15% del total, considera cobrarlas.
                  Si las revisiones superan el 10%, revisa tu proceso de briefing inicial y añade
                  límites contractuales.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Diseña un plan de mejora con métricas concretas</h3>
                <p>
                  Establece un objetivo de eficiencia para el próximo trimestre (ej: pasar del 65% al 72%).
                  Define dos o tres acciones específicas: limitar reuniones a 2 por proyecto, usar plantilla
                  de briefing para reducir revisiones, agrupar gestión administrativa en 1h diaria al final
                  de la jornada.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Revisa y ajusta tarifas trimestralmente</h3>
                <p>
                  Coincidiendo con el pago de IRPF fraccionado (enero, abril, julio, octubre), revisa tus
                  datos de productividad. Si tu eficiencia mejoró pero los ingresos no aumentaron, es el
                  momento de subir tarifas a nuevos clientes. Si la eficiencia bajó, identifica el proyecto
                  que la arrastró y decide si ese tipo de cliente/proyecto es rentable para ti.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para maximizar tu productividad real</h2>
          <p className={styles.introParagraph}>
            Seis acciones concretas que marcan la diferencia entre un freelance que sobrevive
            y uno que crece de forma sostenible en el mercado español.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h3>Tasa de utilización objetivo: 70–75%</h3>
              <p>
                No intentes facturar el 100% de tu tiempo. Reserva el 25–30% restante para formación,
                captación de clientes, mejora de procesos y descanso. Los freelancers con tasa de
                utilización superior al 80% de forma sostenida acaban agotados o con trabajo de menor
                calidad. El objetivo es 70–75% de horas facturables sobre disponibles.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <h3>Bloques de trabajo profundo de 90 minutos</h3>
              <p>
                El trabajo de alto valor (código complejo, redacción creativa, diseño estratégico) requiere
                foco sostenido. Organiza tu jornada en bloques de 90 min sin interrupciones, seguidos de
                15–20 min de pausa. Este ciclo ultradiano, respaldado por investigación de Peretz Lavie,
                es especialmente eficaz para trabajo creativo e intelectual. Desactiva notificaciones
                durante estos bloques.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h3>Auditoría mensual de tiempo</h3>
              <p>
                Dedica 30–45 minutos al final de cada mes a revisar tu distribución real de tiempo.
                Compara horas facturables vs no facturables por proyecto y por tipo de tarea. Identifica
                qué clientes o tipos de proyecto tienen peor ratio. Esta auditoría es más valiosa que
                cualquier herramienta de productividad porque genera datos específicos de tu negocio,
                no estadísticas genéricas.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🚫</span>
              <h3>Elimina o cobra las reuniones innecesarias</h3>
              <p>
                Antes de aceptar una reunión, aplica el filtro: ¿podría resolverse esto con un email
                o mensaje de voz de 2 minutos? Si la reunión es necesaria, limítala a 30 minutos con
                agenda escrita previa. Para reuniones de seguimiento recurrentes con clientes, inclúyelas
                explícitamente en el presupuesto o factúralas a parte. Una reunión mensual de 1h a 60€/h
                son 720€/año que deberías cobrar.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💶</span>
              <h3>Calcula y comunica tu precio mínimo viable</h3>
              <p>
                Tu precio mínimo viable es: (gastos fijos mensuales + cuota RETA + IRPF estimado +
                sueldo neto mínimo deseado) ÷ horas facturables mensuales. Para un autónomo con gastos
                moderados en España, suele estar entre 30–45€/h. Por debajo de ese umbral, cada hora
                trabajada te empobrece. Conocer este número te da seguridad para rechazar proyectos
                mal pagados sin culpa.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h3>Revisión trimestral de tarifas como rutina</h3>
              <p>
                Alinea la revisión de tarifas con el calendario fiscal español: enero, abril, julio
                y octubre (coinciden con los pagos del modelo 130 de IRPF). En cada revisión,
                compara tu €/h efectiva actual con la del trimestre anterior y con la inflación
                acumulada. Si llevas 12 meses sin subir tarifas con el IPC actual, ya has perdido
                poder adquisitivo real. Aplica subidas graduales del 5–10% anual a clientes
                existentes con preaviso de 30–60 días.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h2>Errores frecuentes que destruyen tu rentabilidad</h2>
            </div>
            <p>
              Estos son los seis errores más comunes entre autónomos y freelancers en España.
              Identificarlos es el primer paso para corregirlos.
            </p>
            <ul className={styles.warningList}>
              <li>
                <strong>No incluir vacaciones ni festivos en el cálculo de tarifa.</strong> Si calculas
                tu tarifa dividiendo ingresos anuales deseados entre 1.642h (calendario laboral oficial),
                olvidas que no puedes facturar todas esas horas. Descontando vacaciones (23 días), festivos
                (12), enfermedad (5 días de media) y tiempo de prospección, las horas facturables reales
                son 1.050–1.150/año. Usar 1.642h hace que tu tarifa sea entre un 30–40% más baja de lo necesario.
              </li>
              <li>
                <strong>Ignorar el tiempo de administración al presupuestar.</strong> Gestión de facturación,
                contabilidad para la gestoría, declaraciones trimestrales, altas y bajas de clientes...
                Para un autónomo en España, esto supone entre 3–5 horas semanales. A 40€/h, son 6.000–10.000€
                anuales de trabajo no facturable que deben estar cubiertos por tus tarifas.
              </li>
              <li>
                <strong>Aceptar proyectos por debajo del coste-hora mínimo &quot;para no quedarte sin trabajo&quot;.</strong>
                Cada hora trabajada por debajo de tu umbral mínimo es dinero perdido, no ganado.
                Un proyecto mal pagado te impide dedicar ese tiempo a captar uno bien pagado.
                El coste de oportunidad es real y calculable.
              </li>
              <li>
                <strong>No separar contablemente el tiempo facturable del no facturable.</strong> Sin esta
                separación, no puedes tomar decisiones informadas sobre qué proyectos o clientes son
                realmente rentables. Registrar solo &quot;horas trabajadas&quot; sin clasificarlas es
                como llevar una empresa sin distinguir ingresos de gastos.
              </li>
              <li>
                <strong>No actualizar tarifas con la inflación.</strong> El IPC acumulado en España entre
                2022 y 2024 supera el 15%. Un freelance que no ha subido tarifas en ese periodo trabaja
                efectivamente un 15% más barato en términos reales. La inercia de &quot;no quiero perder
                clientes&quot; tiene un coste financiero concreto y compuesto año tras año.
              </li>
              <li>
                <strong>Confundir estar ocupado con ser productivo.</strong> Tener la agenda llena no
                significa ganar bien. Un freelance con 50 horas semanales pero 40% de eficiencia genera
                menos ingresos reales que uno con 35 horas y 75% de eficiencia. La densidad productiva
                (valor generado por hora) importa más que el volumen de horas. Medir tu €/h efectiva
                mensualmente te protege de esta trampa.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-productividad')} />
      <ShareCard appName="calculadora-productividad" />
      <Footer appName="calculadora-productividad" />
    </div>
  );
}
