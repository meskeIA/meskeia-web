'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './CalculadoraProductividad.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-productividad')} />
      <Footer appName="calculadora-productividad" />
    </div>
  );
}
