'use client';

import { useState, useMemo } from 'react';
import styles from './VisualizadorVacunas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'inmune' | 'tipos' | 'rebano' | 'historia';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'inmune', titulo: 'Sistema inmune', icono: '🛡️', subtitulo: 'Tu ejército interior' },
  { id: 'tipos', titulo: 'Tipos de vacunas', icono: '💉', subtitulo: '5 estrategias, un objetivo' },
  { id: 'rebano', titulo: 'Inmunidad de rebaño', icono: '👥', subtitulo: 'Proteger a todos vacunando a muchos' },
  { id: 'historia', titulo: 'Historia', icono: '📜', subtitulo: 'De Jenner al ARNm' },
];

// ─────────────────────────────────────────────
// Datos: respuesta inmune
// ─────────────────────────────────────────────

interface PasoInmune {
  icono: string;
  titulo: string;
  duracion: string;
  descripcion: string;
  detalle: string;
}

const PASOS_RESPUESTA: PasoInmune[] = [
  {
    icono: '🦠',
    titulo: 'El patógeno entra',
    duracion: 'Hora 0',
    descripcion: 'Un virus o bacteria atraviesa las barreras físicas (piel, mucosas) y entra en el cuerpo. Lleva proteínas únicas en su superficie llamadas antígenos.',
    detalle: 'Las barreras físicas (piel, ácido estomacal, moco) detienen el 99% de los patógenos. Los que pasan activan la respuesta inmune.',
  },
  {
    icono: '🚨',
    titulo: 'Inmunidad innata: primera línea',
    duracion: 'Minutos a horas',
    descripcion: 'Los neutrófilos y macrófagos detectan al invasor y lo atacan sin necesidad de reconocerlo específicamente. Es una respuesta rápida pero genérica.',
    detalle: 'Los macrófagos engullen al patógeno (fagocitosis) y presentan fragmentos de él en su superficie, como una "foto policial" para el resto del sistema.',
  },
  {
    icono: '🔍',
    titulo: 'Reconocimiento específico',
    duracion: 'Días 1-3',
    descripcion: 'Las células dendríticas llevan la "foto" del patógeno a los ganglios linfáticos. Allí, los linfocitos T helper la analizan y activan la respuesta adaptativa.',
    detalle: 'Entre millones de linfocitos T, solo unos pocos reconocen este antígeno concreto. Esos pocos se multiplican exponencialmente.',
  },
  {
    icono: '⚔️',
    titulo: 'Respuesta adaptativa: ataque',
    duracion: 'Días 4-7',
    descripcion: 'Los linfocitos B producen anticuerpos específicos que neutralizan al patógeno. Los linfocitos T citotóxicos destruyen las células ya infectadas.',
    detalle: 'Un solo linfocito B puede generar hasta 2.000 anticuerpos por segundo. Los anticuerpos se adhieren al patógeno como llaves a cerraduras.',
  },
  {
    icono: '🧠',
    titulo: 'Memoria inmunológica',
    duracion: 'Semanas → años',
    descripcion: 'Tras vencer la infección, quedan células de memoria (linfocitos B y T de memoria). Si el mismo patógeno vuelve, la respuesta será mucho más rápida.',
    detalle: 'La segunda exposición genera una respuesta 10-100 veces más rápida y potente. Este es el principio en el que se basan las vacunas.',
  },
];

// ─────────────────────────────────────────────
// Datos: tipos de vacunas
// ─────────────────────────────────────────────

interface TipoVacuna {
  nombre: string;
  icono: string;
  mecanismo: string;
  ejemplos: string;
  ventajas: string[];
  desventajas: string[];
  color: string;
}

const TIPOS_VACUNAS: TipoVacuna[] = [
  {
    nombre: 'Atenuada (virus vivo debilitado)',
    icono: '🟢',
    mecanismo: 'Usa el patógeno real pero debilitado en laboratorio. Se replica un poco pero no causa enfermedad grave. Genera respuesta inmune muy completa.',
    ejemplos: 'Triple vírica (MMR), varicela, fiebre amarilla, rotavirus',
    ventajas: ['Respuesta inmune fuerte y duradera', 'A menudo basta 1-2 dosis', 'Imita infección natural'],
    desventajas: ['No apta para inmunodeprimidos', 'Requiere refrigeración estricta', 'Riesgo mínimo de reversión'],
    color: '#27ae60',
  },
  {
    nombre: 'Inactivada (virus muerto)',
    icono: '⚪',
    mecanismo: 'El patógeno se mata con calor o químicos. No puede replicarse pero sus antígenos siguen intactos para activar la respuesta inmune.',
    ejemplos: 'Gripe (inyectable), hepatitis A, rabia, polio (Salk)',
    ventajas: ['Muy segura (virus no viable)', 'Estable, fácil de almacenar', 'Apta para inmunodeprimidos'],
    desventajas: ['Respuesta inmune más débil', 'Requiere varias dosis + refuerzos', 'Costosa de producir'],
    color: '#95a5a6',
  },
  {
    nombre: 'Subunitaria (fragmento del patógeno)',
    icono: '🔵',
    mecanismo: 'Solo usa una proteína o fragmento del patógeno (normalmente una proteína de superficie). El cuerpo aprende a reconocer esa pieza.',
    ejemplos: 'Hepatitis B, tosferina (componente), VPH, meningococo',
    ventajas: ['Muy segura (sin material genético)', 'Respuesta dirigida y precisa', 'Menores efectos secundarios'],
    desventajas: ['Respuesta inmune limitada', 'Necesita adyuvantes y refuerzos', 'Diseño complejo'],
    color: '#2E86AB',
  },
  {
    nombre: 'ARNm (mensajero)',
    icono: '🟡',
    mecanismo: 'Inyecta instrucciones genéticas (ARNm) para que tus propias células fabriquen una proteína del virus (ej: espícula). El sistema inmune responde a esa proteína.',
    ejemplos: 'COVID-19 (Pfizer-BioNTech, Moderna)',
    ventajas: ['Desarrollo ultrarrápido', 'No usa virus real', 'Fácil de adaptar a variantes'],
    desventajas: ['Requiere ultracongelación (-70 °C para Pfizer)', 'Tecnología relativamente nueva', 'Necesita refuerzos'],
    color: '#f1c40f',
  },
  {
    nombre: 'Vector viral',
    icono: '🟠',
    mecanismo: 'Usa un virus inofensivo (adenovirus) como "vehículo" para llevar una instrucción genética del patógeno real. Las células producen la proteína y el sistema inmune reacciona.',
    ejemplos: 'AstraZeneca, Janssen (COVID-19), Ébola (rVSV-ZEBOV)',
    ventajas: ['Respuesta inmune robusta', 'Buena estabilidad (refrigeración normal)', 'Experiencia previa (ébola)'],
    desventajas: ['Inmunidad previa al vector puede reducir eficacia', 'Producción compleja', 'Reacciones más frecuentes'],
    color: '#e67e22',
  },
];

// ─────────────────────────────────────────────
// Datos: hitos históricos
// ─────────────────────────────────────────────

interface HitoHistorico {
  anio: number;
  titulo: string;
  descripcion: string;
  icono: string;
  impacto: string;
}

const HITOS: HitoHistorico[] = [
  {
    anio: 1796,
    titulo: 'Viruela — Edward Jenner',
    descripcion: 'Jenner inoculó a un niño con viruela bovina (cowpox) y demostró que quedaba protegido contra la viruela humana. Nació el concepto de "vacuna" (de vacca, vaca).',
    icono: '🐄',
    impacto: 'Primera vacuna de la historia',
  },
  {
    anio: 1885,
    titulo: 'Rabia — Louis Pasteur',
    descripcion: 'Pasteur desarrolló la vacuna contra la rabia y la probó en un niño mordido por un perro rabioso. Fue el inicio de la microbiología moderna.',
    icono: '🔬',
    impacto: 'Sentó las bases de la vacunología',
  },
  {
    anio: 1921,
    titulo: 'Tuberculosis — BCG',
    descripcion: 'Albert Calmette y Camille Guérin crearon la BCG, una cepa atenuada de Mycobacterium bovis. Se convirtió en una de las vacunas más administradas del mundo.',
    icono: '🫁',
    impacto: 'Más de 4.000 millones de dosis administradas',
  },
  {
    anio: 1955,
    titulo: 'Polio — Jonas Salk',
    descripcion: 'Salk desarrolló la primera vacuna contra la polio (inactivada). Albert Sabin creó después la versión oral. La polio pasó de paralizar a miles de niños al año a estar casi erradicada.',
    icono: '🦵',
    impacto: 'De 350.000 casos/año a menos de 100',
  },
  {
    anio: 1980,
    titulo: 'Viruela erradicada',
    descripcion: 'La OMS declaró la viruela oficialmente erradicada — la primera (y única) enfermedad humana eliminada mediante vacunación. La campaña tardó 13 años.',
    icono: '🏆',
    impacto: 'Única enfermedad humana erradicada',
  },
  {
    anio: 1986,
    titulo: 'Hepatitis B — Ingeniería genética',
    descripcion: 'Primera vacuna producida por ingeniería genética (recombinante). Marcó el inicio de las vacunas de subunidades modernas.',
    icono: '🧬',
    impacto: 'Inicio de la era biotecnológica',
  },
  {
    anio: 2020,
    titulo: 'COVID-19 — ARNm',
    descripcion: 'Pfizer-BioNTech y Moderna desarrollaron vacunas de ARNm en tiempo récord (11 meses). Una tecnología investigada durante 30 años encontró su momento.',
    icono: '💉',
    impacto: 'Vacuna más rápida de la historia',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Sistema inmune
// ─────────────────────────────────────────────

function SeccionInmune() {
  const celulas = [
    { nombre: 'Neutrófilos', icono: '🔴', tipo: 'Innata', rol: 'Primera línea. Engullen patógenos por miles. Viven solo horas.', porcentaje: '60-70% de leucocitos' },
    { nombre: 'Macrófagos', icono: '🟤', tipo: 'Innata', rol: 'Engullen invasores y presentan "fotos" al sistema adaptativo.', porcentaje: 'Patrullan todos los tejidos' },
    { nombre: 'Linfocitos T helper', icono: '🟢', tipo: 'Adaptativa', rol: 'Coordinadores. Activan a otras células inmunes.', porcentaje: 'CD4+' },
    { nombre: 'Linfocitos T citotóxicos', icono: '🔵', tipo: 'Adaptativa', rol: 'Asesinos. Destruyen células ya infectadas.', porcentaje: 'CD8+' },
    { nombre: 'Linfocitos B', icono: '🟡', tipo: 'Adaptativa', rol: 'Fábricas de anticuerpos. Producen hasta 2.000/segundo.', porcentaje: 'Generan memoria' },
    { nombre: 'Células de memoria', icono: '🧠', tipo: 'Adaptativa', rol: 'Recuerdan patógenos pasados. Respuesta 10-100x más rápida.', porcentaje: 'Duran años/décadas' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cuerpo tiene un ejército con <strong>dos divisiones</strong>: la inmunidad <strong>innata</strong> (rápida, genérica) y la <strong>adaptativa</strong> (lenta la primera vez, pero con memoria).</p>
      </div>

      {/* Células inmunes */}
      <h3 className={styles.subSeccionTitulo}>Las células de tu ejército</h3>
      <div className={styles.celulasGrid}>
        {celulas.map((c, i) => (
          <div key={i} className={styles.celulaCard}>
            <div className={styles.celulaHeader}>
              <span className={styles.celulaIcono} aria-hidden="true">{c.icono}</span>
              <div>
                <span className={styles.celulaNombre}>{c.nombre}</span>
                <span className={`${styles.celulaTipo} ${c.tipo === 'Innata' ? styles.tipoInnata : styles.tipoAdaptativa}`}>
                  {c.tipo}
                </span>
              </div>
            </div>
            <p className={styles.celulaRol}>{c.rol}</p>
            <span className={styles.celulaPorcentaje}>{c.porcentaje}</span>
          </div>
        ))}
      </div>

      {/* Timeline de respuesta */}
      <h3 className={styles.subSeccionTitulo}>Cómo responde tu cuerpo a una infección</h3>
      <div className={styles.timelineVertical}>
        {PASOS_RESPUESTA.map((p, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineDot}>
              <span aria-hidden="true">{p.icono}</span>
            </div>
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <h4 className={styles.timelineTitulo}>{p.titulo}</h4>
                <span className={styles.timelineDuracion}>{p.duracion}</span>
              </div>
              <p className={styles.timelineDesc}>{p.descripcion}</p>
              <p className={styles.timelineDetalle}>{p.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La clave de las vacunas es el <strong>paso 5: la memoria</strong>. Una vacuna
          &quot;entrena&quot; al sistema inmune con una versión inofensiva del patógeno, para que
          cuando llegue el real, el cuerpo ya sepa cómo actuar — sin pasar por la enfermedad.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Tipos de vacunas
// ─────────────────────────────────────────────

function SeccionTipos() {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Todas las vacunas tienen el mismo objetivo: <strong>enseñar al sistema inmune a reconocer un patógeno sin causar la enfermedad</strong>. Pero usan estrategias muy diferentes.</p>
      </div>

      <div className={styles.vacunasGrid}>
        {TIPOS_VACUNAS.map((v, i) => (
          <div
            key={i}
            className={`${styles.vacunaCard} ${seleccionada === i ? styles.vacunaActiva : ''}`}
            style={{ borderLeftColor: v.color }}
            onClick={() => setSeleccionada(seleccionada === i ? null : i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSeleccionada(seleccionada === i ? null : i); } }}
            tabIndex={0}
            role="button"
            aria-expanded={seleccionada === i}
            aria-label={`Ver detalles de vacuna ${v.nombre}`}
          >
            <div className={styles.vacunaHeaderRow}>
              <span className={styles.vacunaIcono} aria-hidden="true">{v.icono}</span>
              <h3 className={styles.vacunaNombre}>{v.nombre}</h3>
            </div>
            <p className={styles.vacunaMecanismo}>{v.mecanismo}</p>
            <p className={styles.vacunaEjemplos}><strong>Ejemplos:</strong> {v.ejemplos}</p>

            {seleccionada === i && (
              <div className={styles.vacunaDetalle}>
                <div className={styles.prosContras}>
                  <div className={styles.prosCol}>
                    <span className={styles.prosLabel}><span aria-hidden="true">✅</span> Ventajas</span>
                    <ul className={styles.prosList}>
                      {v.ventajas.map((pro, j) => <li key={j}>{pro}</li>)}
                    </ul>
                  </div>
                  <div className={styles.contrasCol}>
                    <span className={styles.contrasLabel}><span aria-hidden="true">⚠️</span> Desventajas</span>
                    <ul className={styles.contrasList}>
                      {v.desventajas.map((con, j) => <li key={j}>{con}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La revolución del <strong>ARNm</strong> no surgió de la nada: llevaba 30 años de investigación.
          La pandemia de COVID-19 proporcionó la financiación y urgencia para completar su desarrollo.
          Esta tecnología podría revolucionar las vacunas contra el cáncer, la malaria y el VIH.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Inmunidad de rebaño
// ─────────────────────────────────────────────

function SeccionRebano() {
  const [porcentajeVacunados, setPorcentajeVacunados] = useState(70);

  const simulacion = useMemo(() => {
    // Simulación determinista de 100 personas
    // Los vacunados no se infectan; los no vacunados cerca de un infectado pueden contagiarse
    const total = 100;
    const numVacunados = Math.round(total * porcentajeVacunados / 100);

    // Crear grid: primero vacunados, luego susceptibles, mezclados con seed fija
    const personas: ('vacunado' | 'susceptible' | 'infectado')[] = [];
    // Distribución determinista basada en posición
    for (let i = 0; i < total; i++) {
      // Patrón pseudo-aleatorio pero determinista
      const hash = ((i * 7 + 3) * 13) % total;
      personas.push(hash < numVacunados ? 'vacunado' : 'susceptible');
    }

    // Simular propagación: el paciente cero es la primera persona susceptible
    const primerSusceptible = personas.findIndex(p => p === 'susceptible');
    if (primerSusceptible !== -1) {
      personas[primerSusceptible] = 'infectado';

      // Propagación por vecinos (2 rondas de contagio)
      for (let ronda = 0; ronda < 3; ronda++) {
        const nuevosInfectados: number[] = [];
        for (let i = 0; i < total; i++) {
          if (personas[i] !== 'infectado') continue;
          // Intentar contagiar a vecinos en grid 10x10
          const fila = Math.floor(i / 10);
          const col = i % 10;
          const vecinos = [
            fila > 0 ? (fila - 1) * 10 + col : -1,
            fila < 9 ? (fila + 1) * 10 + col : -1,
            col > 0 ? fila * 10 + (col - 1) : -1,
            col < 9 ? fila * 10 + (col + 1) : -1,
          ];
          for (const v of vecinos) {
            if (v >= 0 && v < total && personas[v] === 'susceptible') {
              nuevosInfectados.push(v);
            }
          }
        }
        for (const idx of nuevosInfectados) {
          personas[idx] = 'infectado';
        }
      }
    }

    const infectados = personas.filter(p => p === 'infectado').length;
    const vacunados = personas.filter(p => p === 'vacunado').length;

    return { personas, infectados, vacunados };
  }, [porcentajeVacunados]);

  // Umbrales conocidos de inmunidad de rebaño
  const umbrales = [
    { enfermedad: 'Sarampión', umbral: 95, r0: '12-18' },
    { enfermedad: 'Tosferina', umbral: 92, r0: '12-17' },
    { enfermedad: 'Difteria', umbral: 85, r0: '6-7' },
    { enfermedad: 'Polio', umbral: 80, r0: '5-7' },
    { enfermedad: 'COVID-19', umbral: 70, r0: '2-3' },
    { enfermedad: 'Gripe', umbral: 50, r0: '1-2' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cuando <strong>suficientes personas</strong> están vacunadas, el patógeno no encuentra huéspedes susceptibles y deja de propagarse. Esto protege también a quienes <strong>no pueden vacunarse</strong> (bebés, inmunodeprimidos).</p>
      </div>

      {/* Slider vacunación */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Población vacunada</label>
          <span className={styles.sliderValor}>{porcentajeVacunados}%</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={100}
          value={porcentajeVacunados}
          onChange={(e) => setPorcentajeVacunados(parseInt(e.target.value))}
          aria-label={`Porcentaje de población vacunada: ${porcentajeVacunados}%`}
        />
        <div className={styles.sliderExtremos}>
          <span>0% (nadie vacunado)</span>
          <span>100% (todos vacunados)</span>
        </div>
      </div>

      {/* Grid visual de 100 personas */}
      <div className={styles.gridPersonas} role="img" aria-label={`Simulación: ${simulacion.vacunados} vacunados, ${simulacion.infectados} infectados de 100 personas`}>
        {simulacion.personas.map((p, i) => (
          <div
            key={i}
            className={`${styles.persona} ${p === 'vacunado' ? styles.personaVacunada : p === 'infectado' ? styles.personaInfectada : styles.personaSusceptible}`}
            title={p === 'vacunado' ? 'Vacunado (protegido)' : p === 'infectado' ? 'Infectado' : 'No vacunado (susceptible)'}
          />
        ))}
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaRebano}>
        <div className={styles.leyendaItem}>
          <span className={`${styles.leyendaColor} ${styles.leyendaVerde}`} />
          <span className={styles.leyendaTexto}>Vacunado ({simulacion.vacunados})</span>
        </div>
        <div className={styles.leyendaItem}>
          <span className={`${styles.leyendaColor} ${styles.leyendaRojo}`} />
          <span className={styles.leyendaTexto}>Infectado ({simulacion.infectados})</span>
        </div>
        <div className={styles.leyendaItem}>
          <span className={`${styles.leyendaColor} ${styles.leyendaGris}`} />
          <span className={styles.leyendaTexto}>Susceptible ({100 - simulacion.vacunados - simulacion.infectados})</span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Vacunados</span>
          <span className={styles.statValor} style={{ color: '#27ae60' }}>{simulacion.vacunados}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Infectados</span>
          <span className={styles.statValor} style={{ color: '#e74c3c' }}>{simulacion.infectados}</span>
        </div>
      </div>

      {/* Umbrales por enfermedad */}
      <h3 className={styles.subSeccionTitulo}>Umbral de inmunidad de rebaño por enfermedad</h3>
      <div className={styles.umbralGrid}>
        {umbrales.map((u, i) => (
          <div key={i} className={styles.umbralCard}>
            <span className={styles.umbralEnfermedad}>{u.enfermedad}</span>
            <div className={styles.umbralBarra}>
              <div
                className={styles.umbralProgreso}
                style={{
                  width: `${u.umbral}%`,
                  background: porcentajeVacunados >= u.umbral ? '#27ae60' : '#e74c3c',
                }}
              />
            </div>
            <div className={styles.umbralDatos}>
              <span className={styles.umbralPorcentaje}>{u.umbral}% necesario</span>
              <span className={styles.umbralR0}>R₀: {u.r0}</span>
            </div>
            {porcentajeVacunados >= u.umbral && (
              <span className={styles.umbralLogrado}><span aria-hidden="true">✅</span> Rebaño protegido</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>R₀</strong> (número reproductivo básico) indica a cuántas personas contagia
          un enfermo de media. Cuanto mayor es R₀, más gente necesita estar vacunada.
          El sarampión (R₀ = 12-18) es tan contagioso que necesita un {formatNumber(95, 0)}% de cobertura.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Historia
// ─────────────────────────────────────────────

function SeccionHistoria() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La historia de la vacunación es una de las mayores historias de éxito de la humanidad. <strong>Las vacunas han salvado más vidas que cualquier otro avance médico.</strong></p>
      </div>

      <div className={styles.timelineVertical}>
        {HITOS.map((h, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineDot}>
              <span aria-hidden="true">{h.icono}</span>
            </div>
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <h3 className={styles.timelineTitulo}>{h.titulo}</h3>
                <span className={styles.timelineDuracion}>{formatNumber(h.anio, 0)}</span>
              </div>
              <p className={styles.timelineDesc}>{h.descripcion}</p>
              <p className={styles.timelineDetalle}>{h.impacto}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enfermedades controladas */}
      <h3 className={styles.subSeccionTitulo}>Impacto global de la vacunación</h3>
      <div className={styles.impactoGrid}>
        <div className={styles.impactoCard}>
          <span className={styles.impactoIcono} aria-hidden="true">🏆</span>
          <span className={styles.impactoNumero}>1</span>
          <span className={styles.impactoLabel}>Enfermedad erradicada (viruela)</span>
        </div>
        <div className={styles.impactoCard}>
          <span className={styles.impactoIcono} aria-hidden="true">📉</span>
          <span className={styles.impactoNumero}>99%</span>
          <span className={styles.impactoLabel}>Reducción de la polio desde 1988</span>
        </div>
        <div className={styles.impactoCard}>
          <span className={styles.impactoIcono} aria-hidden="true">👶</span>
          <span className={styles.impactoNumero}>{formatNumber(154000000, 0)}</span>
          <span className={styles.impactoLabel}>Vidas salvadas en 50 años (OMS)</span>
        </div>
        <div className={styles.impactoCard}>
          <span className={styles.impactoIcono} aria-hidden="true">🌍</span>
          <span className={styles.impactoNumero}>86%</span>
          <span className={styles.impactoLabel}>Cobertura global DTP3 (2023)</span>
        </div>
      </div>

      <div className={styles.citaCard}>
        <p className={styles.citaTexto}>
          &ldquo;Las vacunas son las anclas de la salud pública preventiva.
          Si dejaran de utilizarse, enfermedades que hoy nos parecen cosa del pasado
          volverían en cuestión de meses.&rdquo;
        </p>
        <span className={styles.citaAutor}>— Organización Mundial de la Salud</span>
      </div>

      <div className={styles.insight}>
        <p>
          La vacunación previene entre <strong>3,5 y 5 millones de muertes al año</strong> según la OMS.
          Es, después del acceso a agua potable, la intervención sanitaria que más vidas ha salvado
          en la historia de la humanidad.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorVacunasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('inmune');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'inmune': return <SeccionInmune />;
      case 'tipos': return <SeccionTipos />;
      case 'rebano': return <SeccionRebano />;
      case 'historia': return <SeccionHistoria />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona una Vacuna</h1>
          <p className={styles.subtitle}>Sistema inmune, tipos de vacunas e inmunidad de rebaño — explicados visualmente</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre vacunas e inmunología"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Las vacunas causan la enfermedad?</h3>
          <p>
            No. Las vacunas inactivadas y de subunidades no contienen patógeno vivo. Las atenuadas usan
            versiones debilitadas que no pueden causar la enfermedad completa en personas sanas. Las de ARNm
            y vector viral ni siquiera contienen el patógeno — solo instrucciones para producir una proteína
            que entrena al sistema inmune.
          </p>

          <h3>¿Por qué algunas vacunas necesitan varias dosis?</h3>
          <p>
            La primera dosis activa la respuesta primaria (lenta). Las dosis de refuerzo activan la
            <strong> respuesta secundaria</strong> (mucho más potente), consolidando la memoria inmunológica.
            Algunas vacunas como la del tétanos necesitan refuerzos cada 10 años porque la memoria
            se debilita con el tiempo.
          </p>

          <h3>¿Qué son los adyuvantes?</h3>
          <p>
            Son sustancias que se añaden a algunas vacunas para potenciar la respuesta inmune.
            El más común es el <strong>aluminio</strong> (usado desde 1926). Los adyuvantes hacen que el
            cuerpo reaccione con más fuerza al antígeno, permitiendo usar menos cantidad de este
            y obtener mejor protección.
          </p>

          <h3>¿Qué es la inmunidad esterilizante?</h3>
          <p>
            Es cuando la vacuna impide completamente que el patógeno se replique en tu cuerpo — no solo
            evita la enfermedad sino también la transmisión. Pocas vacunas lo consiguen completamente.
            La mayoría reducen la transmisión significativamente sin eliminarla por completo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de inmunología y vacunología con
            fines educativos. La realidad del sistema inmune es enormemente más compleja. Para decisiones
            sobre vacunación, consulta siempre con profesionales sanitarios y fuentes oficiales (OMS, EMA,
            Ministerio de Sanidad).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-vacunas')} />
        <ShareCard appName="visualizador-vacunas" />
        <Footer appName="visualizador-vacunas" />
      </div>
    </>
  );
}
