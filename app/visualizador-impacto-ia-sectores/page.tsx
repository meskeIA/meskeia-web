'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorImpactoIASectores.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface DetalleSector {
  enRiesgo: string[];
  emergentes: string[];
  timeline: string;
  habilidades: string[];
}

interface Sector {
  id: string;
  nombre: string;
  icono: string;
  riesgo: number;
  detalle: DetalleSector;
}

interface HitoTimeline {
  año: string;
  titulo: string;
  ejemplos: string[];
  sectores: string[];
}

interface HabilidadFuturo {
  icono: string;
  nombre: string;
  descripcion: string;
  razon: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const SECTORES: Sector[] = [
  {
    id: 'transporte',
    nombre: 'Transporte y logística',
    icono: '🚚',
    riesgo: 85,
    detalle: {
      enRiesgo: ['Conductor de camión', 'Repartidor de última milla', 'Operador de almacén'],
      emergentes: ['Técnico de flotas autónomas', 'Gestor de rutas IA', 'Supervisor de drones'],
      timeline: '2025-2030: primeras flotas semi-autónomas en autopistas y almacenes',
      habilidades: ['Mantenimiento de vehículos autónomos', 'Gestión logística digital', 'Ciberseguridad industrial'],
    },
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas y banca',
    icono: '💰',
    riesgo: 72,
    detalle: {
      enRiesgo: ['Analista financiero junior', 'Gestor de riesgos rutinario', 'Cajero bancario'],
      emergentes: ['Prompt engineer financiero', 'Auditor de modelos IA', 'Asesor de IA financiera'],
      timeline: '2024-2026: análisis crediticio automatizado y trading algorítmico masivo',
      habilidades: ['Interpretación de modelos IA', 'Ética financiera', 'Relación con cliente compleja'],
    },
  },
  {
    id: 'industria',
    nombre: 'Producción industrial',
    icono: '🏭',
    riesgo: 68,
    detalle: {
      enRiesgo: ['Operario de línea repetitiva', 'Inspector de calidad visual', 'Programador CNC básico'],
      emergentes: ['Técnico de robots colaborativos', 'Ingeniero de gemelo digital', 'Supervisor de producción IA'],
      timeline: '2025-2028: cobots en pymes y mantenimiento predictivo generalizado',
      habilidades: ['Robótica colaborativa', 'Mantenimiento predictivo', 'Análisis de datos industriales'],
    },
  },
  {
    id: 'comercio',
    nombre: 'Comercio minorista',
    icono: '🛒',
    riesgo: 65,
    detalle: {
      enRiesgo: ['Cajero de supermercado', 'Reponedor básico', 'Agente de compras rutinario'],
      emergentes: ['Especialista en experiencia cliente', 'Gestor de comercio omnicanal', 'Analista de comportamiento de compra'],
      timeline: '2024-2027: cajas automáticas y recomendación personalizada IA',
      habilidades: ['Gestión de experiencia cliente', 'Análisis de datos de ventas', 'Servicio personalizado'],
    },
  },
  {
    id: 'atencion',
    nombre: 'Atención al cliente',
    icono: '📞',
    riesgo: 78,
    detalle: {
      enRiesgo: ['Agente call center básico', 'Gestor de reclamaciones rutinarias', 'Soporte técnico nivel 1'],
      emergentes: ['Entrenador de chatbots', 'Especialista en casos complejos', 'Diseñador de experiencia conversacional'],
      timeline: '2024-2026: chatbots IA avanzados que resuelven el 80% de consultas',
      habilidades: ['Empatía en situaciones complejas', 'Escalada de conflictos', 'Diseño de flujos conversacionales'],
    },
  },
  {
    id: 'salud',
    nombre: 'Salud',
    icono: '⚕️',
    riesgo: 38,
    detalle: {
      enRiesgo: ['Radiólogo de cribado básico', 'Transcriptor médico', 'Técnico de laboratorio rutinario'],
      emergentes: ['Médico asistido por IA', 'Especialista en IA diagnóstica', 'Gestor de datos de salud'],
      timeline: '2026-2030: diagnóstico por imagen asistido en hospitales de referencia',
      habilidades: ['Interpretación de IA diagnóstica', 'Ética médica en IA', 'Medicina de precisión'],
    },
  },
  {
    id: 'educacion',
    nombre: 'Educación',
    icono: '🎓',
    riesgo: 30,
    detalle: {
      enRiesgo: ['Tutor de contenido estándar', 'Corrector de exámenes', 'Formador de habilidades básicas'],
      emergentes: ['Diseñador de aprendizaje adaptativo', 'Mentor de habilidades blandas', 'Curador de contenido educativo IA'],
      timeline: '2025-2028: tutores personalizados IA en educación superior y FP',
      habilidades: ['Aprendizaje adaptativo', 'Mentoría y acompañamiento', 'Diseño curricular'],
    },
  },
  {
    id: 'creatividad',
    nombre: 'Creatividad y diseño',
    icono: '🎨',
    riesgo: 45,
    detalle: {
      enRiesgo: ['Diseñador gráfico de plantillas', 'Redactor de contenido genérico', 'Ilustrador de stock'],
      emergentes: ['Director creativo IA', 'Prompt designer', 'Curador y editor de contenido generado'],
      timeline: '2024-2026: generación de imágenes y texto IA en producción comercial',
      habilidades: ['Dirección creativa', 'Criterio estético y narrativo', 'Estrategia de contenido'],
    },
  },
];

const DATOS_GRAFICO = {
  labels: ['Transporte', 'Finanzas', 'Industria', 'Comercio', 'Atención cliente', 'Salud', 'Educación', 'Creatividad'],
  enRiesgo: [-15, -8, -12, -10, -9, -2, -1, -3],
  emergentes: [3, 4, 6, 3, 2, 7, 4, 2],
};

const HITOS_TIMELINE: HitoTimeline[] = [
  {
    año: '2024',
    titulo: 'LLMs en productividad empresarial',
    ejemplos: ['Código asistido por IA en el 50% de devs', 'Generación de imágenes comerciales', 'Resumen y análisis de documentos masivo'],
    sectores: ['Creatividad', 'Finanzas', 'Tecnología'],
  },
  {
    año: '2026',
    titulo: 'Agentes IA autónomos en empresas',
    ejemplos: ['Chatbots que resuelven el 80% de consultas', 'Automatización de flujos administrativos', 'Análisis crediticio sin intervención humana'],
    sectores: ['Atención cliente', 'Banca', 'Seguros'],
  },
  {
    año: '2028',
    titulo: 'Automatización física y diagnóstico IA',
    ejemplos: ['Flotas logísticas semi-autónomas en autopistas', 'Diagnóstico por imagen IA en hospitales', 'Cobots en el 40% de pymes industriales'],
    sectores: ['Transporte', 'Salud', 'Industria'],
  },
  {
    año: '2030+',
    titulo: 'Robótica general y educación personalizada',
    ejemplos: ['Robots de propósito general en almacenes y hospitales', 'Educación 100% adaptativa por alumno', 'IA como colega de trabajo estándar'],
    sectores: ['Industria', 'Educación', 'Salud'],
  },
];

const HABILIDADES_FUTURO: HabilidadFuturo[] = [
  {
    icono: '🤝',
    nombre: 'Inteligencia social compleja',
    descripcion: 'Empatía, negociación y liderazgo en situaciones ambiguas y de alta tensión.',
    razon: 'La IA carece de comprensión emocional genuina y no puede gestionar relaciones humanas complejas.',
  },
  {
    icono: '🎯',
    nombre: 'Pensamiento crítico y juicio',
    descripcion: 'Evaluar información contradictoria y tomar decisiones con incertidumbre y consecuencias.',
    razon: 'Los LLMs generan respuestas plausibles, pero no comprenden el impacto real de sus errores.',
  },
  {
    icono: '🔧',
    nombre: 'Trabajo físico no repetitivo',
    descripcion: 'Plomería, electricidad, cuidados: contextos físicos impredecibles con alta variabilidad.',
    razon: 'La robótica general aún no domina entornos no estructurados ni el tacto preciso.',
  },
  {
    icono: '🎨',
    nombre: 'Creatividad estratégica',
    descripcion: 'Dirección creativa, narrativa de marca e innovación de producto con criterio cultural.',
    razon: 'La IA imita patrones existentes; la creatividad disruptiva requiere comprensión cultural profunda.',
  },
  {
    icono: '🤖',
    nombre: 'Colaboración con IA',
    descripcion: 'Dirigir, auditar y complementar sistemas de IA para maximizar su valor de forma ética.',
    razon: 'Quien sabe usar IA es más productivo. Quien sabe auditarla es indispensable.',
  },
];

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function colorBarra(riesgo: number): string {
  if (riesgo > 70) return styles.barraAlta;
  if (riesgo > 50) return styles.barraMedia;
  return styles.barraBaja;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorImpactoIASectores() {
  const [sectorActivo, setSectorActivo] = useState<string | null>(null);
  const [chartMontado, setChartMontado] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChartMontado(true);
  }, []);

  function handleSectorClick(id: string) {
    if (sectorActivo === id) {
      setSectorActivo(null);
    } else {
      setSectorActivo(id);
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  const sectorSeleccionado = SECTORES.find((s) => s.id === sectorActivo) ?? null;

  const datosGrafico = {
    labels: DATOS_GRAFICO.labels,
    datasets: [
      {
        label: 'Empleos en riesgo (millones)',
        data: DATOS_GRAFICO.enRiesgo,
        backgroundColor: 'rgba(220, 53, 69, 0.75)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1,
      },
      {
        label: 'Empleos emergentes estimados (millones)',
        data: DATOS_GRAFICO.emergentes,
        backgroundColor: 'rgba(72, 169, 166, 0.75)',
        borderColor: 'rgba(72, 169, 166, 1)',
        borderWidth: 1,
      },
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: never) => {
            const item = ctx as { dataset: { label?: string }; parsed: { x: number | null } };
            const val = Math.abs(item.parsed.x ?? 0);
            return `${item.dataset.label ?? ''}: ${val}M`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (val: number | string) => `${Math.abs(Number(val))}M`,
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Impacto de la IA en los sectores</h1>
        <p>Automatización, empleos en riesgo y el futuro del trabajo con inteligencia artificial</p>
      </header>

      <LegalNotice />

      {/* Bloque 1: Sectores por nivel de automatización */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sectores por nivel de automatización</h2>
        <p className={styles.sectionDesc}>
          Haz clic en un sector para ver los empleos en riesgo, roles emergentes y habilidades que te protegen.
        </p>

        <div className={styles.gridSectores}>
          {SECTORES.map((sector) => (
            <button
              key={sector.id}
              className={`${styles.sectorCard} ${sectorActivo === sector.id ? styles.sectorCardActivo : ''}`}
              onClick={() => handleSectorClick(sector.id)}
              aria-pressed={sectorActivo === sector.id}
            >
              <span className={styles.sectorIcono} aria-hidden="true">{sector.icono}</span>
              <span className={styles.sectorNombre}>{sector.nombre}</span>
              <div className={styles.barraRiesgoWrapper}>
                <div
                  className={`${styles.barraRiesgo} ${colorBarra(sector.riesgo)}`}
                  style={{ width: `${sector.riesgo}%` }}
                  role="progressbar"
                  aria-valuenow={sector.riesgo}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Riesgo de automatización: ${sector.riesgo}%`}
                />
              </div>
              <span className={styles.sectorPorcentaje}>{sector.riesgo}% riesgo</span>
            </button>
          ))}
        </div>

        {/* Panel de detalle */}
        <div ref={panelRef}>
          {sectorSeleccionado && (
            <div className={styles.panelDetalle} role="region" aria-label={`Detalle de ${sectorSeleccionado.nombre}`}>
              <div className={styles.panelHeader}>
                <span aria-hidden="true">{sectorSeleccionado.icono}</span>
                <h3>{sectorSeleccionado.nombre}</h3>
                <button className={styles.btnCerrar} onClick={() => setSectorActivo(null)} aria-label="Cerrar panel">✕</button>
              </div>

              <div className={styles.panelGrid}>
                <div className={styles.panelBloque}>
                  <h4 className={styles.panelBloqueTitle}>
                    <span aria-hidden="true">⚠️</span> En riesgo
                  </h4>
                  <ul className={styles.listaBadges}>
                    {sectorSeleccionado.detalle.enRiesgo.map((item) => (
                      <li key={item}><span className={styles.badgeRiesgo}>{item}</span></li>
                    ))}
                  </ul>
                </div>

                <div className={styles.panelBloque}>
                  <h4 className={styles.panelBloqueTitle}>
                    <span aria-hidden="true">✨</span> Roles emergentes
                  </h4>
                  <ul className={styles.listaBadges}>
                    {sectorSeleccionado.detalle.emergentes.map((item) => (
                      <li key={item}><span className={styles.badgeEmergente}>{item}</span></li>
                    ))}
                  </ul>
                </div>

                <div className={styles.panelBloque}>
                  <h4 className={styles.panelBloqueTitle}>
                    <span aria-hidden="true">📅</span> Cronología
                  </h4>
                  <p className={styles.panelTexto}>{sectorSeleccionado.detalle.timeline}</p>
                </div>

                <div className={styles.panelBloque}>
                  <h4 className={styles.panelBloqueTitle}>
                    <span aria-hidden="true">🛡️</span> Habilidades clave
                  </h4>
                  <ul className={styles.listaBadges}>
                    {sectorSeleccionado.detalle.habilidades.map((item) => (
                      <li key={item}><span className={styles.badgeHabilidad}>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bloque 2: Gráfico empleos en riesgo vs emergentes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empleos en riesgo vs. empleos emergentes</h2>
        <p className={styles.sectionDesc}>Estimación del impacto neto por sector (millones de empleos a escala global).</p>

        <div className={styles.chartContainer}>
          {chartMontado && (
            <Bar data={datosGrafico} options={opcionesGrafico as never} />
          )}
        </div>

        <p className={styles.fuenteNota}>
          Datos estimados. Fuente: McKinsey Global Institute, WEF Future of Jobs 2024.
        </p>
      </section>

      {/* Bloque 3: Timeline de adopción IA */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Timeline de adopción de la IA</h2>
        <p className={styles.sectionDesc}>Los grandes hitos de transformación laboral por año.</p>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineLinea} aria-hidden="true" />
          <div className={styles.timeline}>
            {HITOS_TIMELINE.map((hito) => (
              <div key={hito.año} className={styles.timelineHito}>
                <div className={styles.timelinePunto} aria-hidden="true" />
                <div className={styles.timelineTarjeta}>
                  <span className={styles.timelineAnio}>{hito.año}</span>
                  <h3 className={styles.timelineTitulo}>{hito.titulo}</h3>
                  <ul className={styles.timelineEjemplos}>
                    {hito.ejemplos.map((ej) => (
                      <li key={ej}>{ej}</li>
                    ))}
                  </ul>
                  <div className={styles.timelineSectores}>
                    {hito.sectores.map((s) => (
                      <span key={s} className={styles.badgeSector}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloque 4: Las 5 habilidades que más protegen */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Las 5 habilidades que más protegen</h2>
        <p className={styles.sectionDesc}>Capacidades humanas que la IA no puede reemplazar fácilmente.</p>

        <div className={styles.gridHabilidades}>
          {HABILIDADES_FUTURO.map((hab) => (
            <div key={hab.nombre} className={styles.habilidadCard}>
              <span className={styles.habilidadIcono} aria-hidden="true">{hab.icono}</span>
              <h3 className={styles.habilidadNombre}>{hab.nombre}</h3>
              <p className={styles.habilidadDesc}>{hab.descripcion}</p>
              <p className={styles.habilidadRazon}>
                <strong>Por qué la IA no la reemplaza:</strong> {hab.razon}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection title="Comprender el impacto real de la IA en el empleo" subtitle="Automatización, task displacement y reconversión profesional">
        <p>
          <strong>¿Automatización o sustitución?</strong> La automatización elimina <em>tareas</em>, no siempre
          empleos completos. Un médico pierde la tarea de transcribir notas, pero gana tiempo para el diagnóstico
          complejo. Esto se llama <em>task displacement</em>, distinto del <em>job displacement</em> (eliminación
          del puesto completo).
        </p>
        <p>
          <strong>¿Por qué los economistas discrepan?</strong> El impacto neto depende de tres factores que
          nadie puede predecir con certeza: el coste real de adopción tecnológica en cada empresa, la velocidad
          de regulación laboral y la capacidad de reconversión de los trabajadores afectados. Estudios como el
          de Daron Acemoglu (MIT) apuntan a un impacto neto negativo a corto plazo, mientras McKinsey ve
          creación neta de empleo a largo plazo.
        </p>
        <p>
          <strong>Casos de reconversión exitosa:</strong> La industria del automóvil en los 80 perdió empleos
          de ensamblaje y generó nuevos en mantenimiento, diseño y electrónica. Los operadores de telefonista
          se reconvirtieron en gestores de centralitas digitales. La historia tecnológica muestra que la
          transición es dolorosa para quienes la viven, pero crea más puestos de los que destruye a escala global.
        </p>
        <div className={styles.warningBox} role="note">
          <strong>Nota metodológica:</strong> Las proyecciones de automatización varían enormemente según el
          estudio y el año. El impacto real depende de la regulación, el coste tecnológico y la velocidad de
          adopción empresarial en cada país. Los datos de este visualizador son estimaciones educativas basadas
          en informes de referencia (McKinsey, WEF, Oxford Economics), no predicciones precisas.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-impacto-ia-sectores')} />
      <ShareCard appName="visualizador-impacto-ia-sectores" />
      <Footer appName="visualizador-impacto-ia-sectores" />
    </div>
  );
}
