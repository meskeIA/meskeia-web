'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './OrientadorTensionArterial.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, DisclaimerCard, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatDate } from '@/lib';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ClasificacionId =
  | 'hipotension'
  | 'optima'
  | 'normal'
  | 'normal-alta'
  | 'hta-grado-1'
  | 'hta-grado-2'
  | 'hta-grado-3'
  | 'crisis-hipertensiva'
  | 'sistolica-aislada';

interface Clasificacion {
  id: ClasificacionId;
  nombre: string;
  descripcion: string;
  recomendacion: string;
  color: string;
  urgencia: 'normal' | 'atencion' | 'alerta' | 'urgente' | 'emergencia';
}

interface Medicion {
  id: string;
  fecha: string; // ISO string
  sistolica: number;
  diastolica: number;
  pulso: number | null;
  clasificacionId: ClasificacionId;
}

// ─── Clasificaciones ESH/ESC 2018 ────────────────────────────────────────────

const CLASIFICACIONES: Record<ClasificacionId, Clasificacion> = {
  hipotension: {
    id: 'hipotension',
    nombre: 'Hipotensión',
    descripcion: 'Tensión arterial por debajo de los valores normales (< 90/60 mmHg)',
    recomendacion: 'Consulta con tu médico si presentas síntomas como mareos, cansancio o desmayos.',
    color: 'var(--cl-hipotension)',
    urgencia: 'atencion',
  },
  optima: {
    id: 'optima',
    nombre: 'Tensión Óptima',
    descripcion: 'Tensión arterial en los valores más saludables (< 120/80 mmHg)',
    recomendacion: 'Excelente. Mantén tus hábitos de vida saludable.',
    color: 'var(--cl-optima)',
    urgencia: 'normal',
  },
  normal: {
    id: 'normal',
    nombre: 'Tensión Normal',
    descripcion: 'Tensión arterial dentro del rango normal (120–129 / 80–84 mmHg)',
    recomendacion: 'Bien. Continúa con hábitos saludables y revisiones periódicas.',
    color: 'var(--cl-normal)',
    urgencia: 'normal',
  },
  'normal-alta': {
    id: 'normal-alta',
    nombre: 'Normal-Alta',
    descripcion: 'Tensión en el límite superior de la normalidad (130–139 / 85–89 mmHg)',
    recomendacion: 'Presta atención a tu dieta, reduce el sodio y haz ejercicio regular. Consulta a tu médico.',
    color: 'var(--cl-normal-alta)',
    urgencia: 'atencion',
  },
  'hta-grado-1': {
    id: 'hta-grado-1',
    nombre: 'HTA Grado 1',
    descripcion: 'Hipertensión leve (140–159 / 90–99 mmHg)',
    recomendacion: 'Consulta a tu médico. Pueden recomendarse cambios en el estilo de vida o tratamiento.',
    color: 'var(--cl-hta1)',
    urgencia: 'alerta',
  },
  'hta-grado-2': {
    id: 'hta-grado-2',
    nombre: 'HTA Grado 2',
    descripcion: 'Hipertensión moderada (160–179 / 100–109 mmHg)',
    recomendacion: 'Consulta a tu médico con prontitud. Suele requerir tratamiento farmacológico.',
    color: 'var(--cl-hta2)',
    urgencia: 'urgente',
  },
  'hta-grado-3': {
    id: 'hta-grado-3',
    nombre: 'HTA Grado 3',
    descripcion: 'Hipertensión severa (≥ 180 / ≥ 110 mmHg)',
    recomendacion: 'Busca atención médica urgente. No esperes para consultar.',
    color: 'var(--cl-hta3)',
    urgencia: 'emergencia',
  },
  'crisis-hipertensiva': {
    id: 'crisis-hipertensiva',
    nombre: 'Crisis Hipertensiva',
    descripcion: 'Tensión sistólica > 180 mmHg y/o diastólica > 120 mmHg',
    recomendacion: '⚠️ Acude a urgencias inmediatamente o llama al 112.',
    color: 'var(--cl-crisis)',
    urgencia: 'emergencia',
  },
  'sistolica-aislada': {
    id: 'sistolica-aislada',
    nombre: 'HTA Sistólica Aislada',
    descripcion: 'Sistólica elevada con diastólica normal (≥ 140 / < 90 mmHg)',
    recomendacion: 'Consulta a tu médico. Es frecuente en personas mayores y requiere seguimiento.',
    color: 'var(--cl-hta1)',
    urgencia: 'alerta',
  },
};

const URGENCIA_ETIQUETAS: Record<Clasificacion['urgencia'], string> = {
  normal:     '✅ Normal',
  atencion:   '👀 Atención',
  alerta:     '⚠️ Alerta',
  urgente:    '🔶 Urgente',
  emergencia: '🚨 Emergencia',
};

// ─── Lógica de clasificación ESH/ESC 2018 ────────────────────────────────────

function clasificarTension(sis: number, dia: number): ClasificacionId {
  // Crisis hipertensiva (prioridad máxima)
  if (sis > 180 || dia > 120) return 'crisis-hipertensiva';

  // Hipotensión
  if (sis < 90 || dia < 60) return 'hipotension';

  // HTA Grado 3
  if (sis >= 180 || dia >= 110) return 'hta-grado-3';

  // HTA Grado 2
  if (sis >= 160 || dia >= 100) return 'hta-grado-2';

  // HTA Sistólica aislada: sistólica >= 140 pero diastólica < 90
  if (sis >= 140 && dia < 90) return 'sistolica-aislada';

  // HTA Grado 1
  if (sis >= 140 || dia >= 90) return 'hta-grado-1';

  // Normal-alta
  if (sis >= 130 || dia >= 85) return 'normal-alta';

  // Normal
  if (sis >= 120 || dia >= 80) return 'normal';

  // Óptima
  return 'optima';
}

function calcularTAM(sis: number, dia: number): number {
  // TAM = diastólica + (sistólica - diastólica) / 3
  return Math.round(dia + (sis - dia) / 3);
}

function calcularPresionPulso(sis: number, dia: number): number {
  return sis - dia;
}

function valorarPresionPulso(pp: number): string {
  if (pp < 25) return 'Muy baja (< 25 mmHg)';
  if (pp < 40) return 'Baja (< 40 mmHg)';
  if (pp <= 60) return 'Normal (40–60 mmHg)';
  if (pp <= 80) return 'Elevada (> 60 mmHg)';
  return 'Muy elevada (> 80 mmHg)';
}

// ─── Historial (localStorage) ─────────────────────────────────────────────────

const STORAGE_KEY = 'meskeia-tension-historial';
const MAX_HISTORIAL = 20;

function cargarHistorial(): Medicion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Medicion[]) : [];
  } catch {
    return [];
  }
}

function guardarHistorial(mediciones: Medicion[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediciones.slice(0, MAX_HISTORIAL)));
  } catch {
    // Ignorar errores de localStorage (modo privado, cuota, etc.)
  }
}

// ─── Componente resultado ─────────────────────────────────────────────────────

interface ResultadoProps {
  sistolica: number;
  diastolica: number;
  pulso: number | null;
}

function Resultado({ sistolica, diastolica, pulso }: ResultadoProps) {
  const clId = clasificarTension(sistolica, diastolica);
  const cl = CLASIFICACIONES[clId];
  const tam = calcularTAM(sistolica, diastolica);
  const pp = calcularPresionPulso(sistolica, diastolica);
  const ppLabel = valorarPresionPulso(pp);

  return (
    <div className={styles.resultado} style={{ borderColor: cl.color }}>
      <div className={styles.resultadoCabecera} style={{ background: cl.color }}>
        <span className={styles.resultadoUrgencia}>{URGENCIA_ETIQUETAS[cl.urgencia]}</span>
        <h2 className={styles.resultadoNombre}>{cl.nombre}</h2>
        <p className={styles.resultadoDescripcion}>{cl.descripcion}</p>
      </div>

      <div className={styles.resultadoMetricas}>
        <div className={styles.metrica}>
          <span className={styles.metricaValor} style={{ color: cl.color }}>
            {sistolica}
            <span className={styles.metricaUnidad}>mmHg</span>
          </span>
          <span className={styles.metricaLabel}>Sistólica</span>
        </div>
        <div className={styles.metricaSeparador}>/</div>
        <div className={styles.metrica}>
          <span className={styles.metricaValor} style={{ color: cl.color }}>
            {diastolica}
            <span className={styles.metricaUnidad}>mmHg</span>
          </span>
          <span className={styles.metricaLabel}>Diastólica</span>
        </div>
        {pulso !== null && (
          <>
            <div className={styles.metricaSeparador}>·</div>
            <div className={styles.metrica}>
              <span className={styles.metricaValor}>
                {pulso}
                <span className={styles.metricaUnidad}>ppm</span>
              </span>
              <span className={styles.metricaLabel}>Pulso</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.resultadoDerivados}>
        <div className={styles.derivado}>
          <span className={styles.derivadoNombre}>TAM</span>
          <span className={styles.derivadoValor}>{tam} <small>mmHg</small></span>
          <span className={styles.derivadoNota}>Tensión Arterial Media</span>
        </div>
        <div className={styles.derivado}>
          <span className={styles.derivadoNombre}>Presión de pulso</span>
          <span className={styles.derivadoValor}>{pp} <small>mmHg</small></span>
          <span className={styles.derivadoNota}>{ppLabel}</span>
        </div>
      </div>

      <div className={styles.resultadoRecomendacion} role="alert" aria-live="polite">
        <strong>Recomendación:</strong> {cl.recomendacion}
      </div>
    </div>
  );
}

// ─── Tabla de clasificaciones ─────────────────────────────────────────────────

function TablaClasificaciones() {
  const filas: Array<{ rango: string; sis: string; dia: string; id: ClasificacionId }> = [
    { rango: 'Hipotensión',          sis: '< 90',      dia: '< 60',      id: 'hipotension'        },
    { rango: 'Tensión Óptima',       sis: '< 120',     dia: '< 80',      id: 'optima'             },
    { rango: 'Normal',               sis: '120–129',   dia: '80–84',     id: 'normal'             },
    { rango: 'Normal-Alta',          sis: '130–139',   dia: '85–89',     id: 'normal-alta'        },
    { rango: 'HTA Grado 1',          sis: '140–159',   dia: '90–99',     id: 'hta-grado-1'        },
    { rango: 'HTA Grado 2',          sis: '160–179',   dia: '100–109',   id: 'hta-grado-2'        },
    { rango: 'HTA Grado 3',          sis: '≥ 180',     dia: '≥ 110',     id: 'hta-grado-3'        },
    { rango: 'Crisis Hipertensiva',  sis: '> 180',     dia: '> 120',     id: 'crisis-hipertensiva' },
    { rango: 'HTA Sistólica Aislada',sis: '≥ 140',     dia: '< 90',      id: 'sistolica-aislada'  },
  ];

  return (
    <div className={styles.tablaWrapper}>
      <table className={styles.tabla} aria-label="Clasificación de tensión arterial ESH/ESC 2018">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Sistólica (mmHg)</th>
            <th>Diastólica (mmHg)</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(f => {
            const cl = CLASIFICACIONES[f.id];
            return (
              <tr key={f.id}>
                <td>
                  <span className={styles.tablaIndicador} style={{ background: cl.color }} aria-hidden="true" />
                  {f.rango}
                </td>
                <td>{f.sis}</td>
                <td>{f.dia}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={styles.tablaFuente}>Fuente: Guías ESH/ESC 2018 para el manejo de la hipertensión arterial</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraTensionArterial() {
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [pulso, setPulso] = useState('');
  const [resultado, setResultado] = useState<{ sis: number; dia: number; pulso: number | null } | null>(null);
  const [errores, setErrores] = useState<{ sis?: string; dia?: string; pulso?: string }>({});
  const [historial, setHistorial] = useState<Medicion[]>([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  useEffect(() => {
    setHistorial(cargarHistorial());
  }, []);

  const validar = useCallback((): boolean => {
    const nuevosErrores: typeof errores = {};
    const sisNum = parseInt(sistolica, 10);
    const diaNum = parseInt(diastolica, 10);

    if (!sistolica || isNaN(sisNum)) {
      nuevosErrores.sis = 'Introduce la tensión sistólica (número entero)';
    } else if (sisNum < 50 || sisNum > 300) {
      nuevosErrores.sis = 'Valor fuera de rango (50–300 mmHg)';
    }

    if (!diastolica || isNaN(diaNum)) {
      nuevosErrores.dia = 'Introduce la tensión diastólica (número entero)';
    } else if (diaNum < 30 || diaNum > 200) {
      nuevosErrores.dia = 'Valor fuera de rango (30–200 mmHg)';
    }

    if (!nuevosErrores.sis && !nuevosErrores.dia && sisNum <= diaNum) {
      nuevosErrores.sis = 'La sistólica debe ser mayor que la diastólica';
    }

    if (pulso) {
      const pulsoNum = parseInt(pulso, 10);
      if (isNaN(pulsoNum) || pulsoNum < 20 || pulsoNum > 300) {
        nuevosErrores.pulso = 'Valor fuera de rango (20–300 ppm)';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [sistolica, diastolica, pulso]);

  const calcular = useCallback(() => {
    if (!validar()) return;

    const sisNum = parseInt(sistolica, 10);
    const diaNum = parseInt(diastolica, 10);
    const pulsoNum = pulso ? parseInt(pulso, 10) : null;

    setResultado({ sis: sisNum, dia: diaNum, pulso: pulsoNum });

    // Guardar en historial
    const clId = clasificarTension(sisNum, diaNum);
    const nuevaMedicion: Medicion = {
      id: Math.random().toString(36).slice(2, 9),
      fecha: new Date().toISOString(),
      sistolica: sisNum,
      diastolica: diaNum,
      pulso: pulsoNum,
      clasificacionId: clId,
    };
    const nuevoHistorial = [nuevaMedicion, ...historial].slice(0, MAX_HISTORIAL);
    setHistorial(nuevoHistorial);
    guardarHistorial(nuevoHistorial);
  }, [sistolica, diastolica, pulso, validar, historial]);

  const limpiar = useCallback(() => {
    setSistolica('');
    setDiastolica('');
    setPulso('');
    setResultado(null);
    setErrores({});
  }, []);

  const eliminarMedicion = useCallback((id: string) => {
    const nuevo = historial.filter(m => m.id !== id);
    setHistorial(nuevo);
    guardarHistorial(nuevo);
  }, [historial]);

  const limpiarHistorial = useCallback(() => {
    if (!confirm('¿Borrar todo el historial de mediciones?')) return;
    setHistorial([]);
    guardarHistorial([]);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calcular();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Orientador Tensión Arterial</h1>
        <p className={styles.heroSubtitulo}>Clasifica tu presión según las guías ESH/ESC 2018 · Calcula TAM y presión de pulso</p>
      </header>

      <LegalNotice />

      {/* Aviso médico — visible siempre, no colapsable */}
      <div className={styles.disclaimerWrapper}>
        <DisclaimerCard
          variant="medical"
          severity="critical"
          title="Aviso Médico — Sin responsabilidad sobre el uso de los resultados"
          showTermsLink={false}
          collapsible={false}
        >
          <p>
            Esta herramienta es <strong>exclusivamente orientativa y educativa</strong>. Los resultados que ofrece
            se basan en las guías ESH/ESC 2018 y <strong>no constituyen ni sustituyen un diagnóstico médico</strong>,
            una consulta profesional ni ningún tipo de prescripción o consejo clínico.
          </p>
          <p>
            meskeIA <strong>no asume ninguna responsabilidad</strong> por decisiones tomadas en base a los
            resultados de esta calculadora, ni por un uso inadecuado de la misma. Ante cualquier duda
            sobre tu salud cardiovascular, <strong>consulta siempre a tu médico o especialista</strong>.
          </p>
          <p>
            En caso de síntomas graves (dolor en el pecho, dificultad para respirar, visión borrosa,
            cefalea intensa) o lecturas muy elevadas, <strong>acude a urgencias o llama al 112</strong>.
          </p>
        </DisclaimerCard>
      </div>

      {/* Formulario */}
      <div className={styles.formularioCard}>
        <h2 className={styles.formularioTitulo}>Introduce tu medición</h2>

        <div className={styles.formularioGrid}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="sistolica">
              Sistólica <span className={styles.labelUnidad}>(mmHg)</span>
            </label>
            <input
              id="sistolica"
              className={`${styles.input} ${errores.sis ? styles.inputError : ''}`}
              type="number"
              inputMode="numeric"
              placeholder="ej. 120"
              min={50}
              max={300}
              value={sistolica}
              onChange={e => { setSistolica(e.target.value); setErrores(p => ({ ...p, sis: undefined })); }}
              onKeyDown={handleKeyDown}
              aria-describedby={errores.sis ? 'error-sis' : undefined}
              autoComplete="off"
            />
            {errores.sis && <span id="error-sis" className={styles.error} role="alert">{errores.sis}</span>}
            <span className={styles.inputHint}>Número alto (el primero)</span>
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="diastolica">
              Diastólica <span className={styles.labelUnidad}>(mmHg)</span>
            </label>
            <input
              id="diastolica"
              className={`${styles.input} ${errores.dia ? styles.inputError : ''}`}
              type="number"
              inputMode="numeric"
              placeholder="ej. 80"
              min={30}
              max={200}
              value={diastolica}
              onChange={e => { setDiastolica(e.target.value); setErrores(p => ({ ...p, dia: undefined })); }}
              onKeyDown={handleKeyDown}
              aria-describedby={errores.dia ? 'error-dia' : undefined}
              autoComplete="off"
            />
            {errores.dia && <span id="error-dia" className={styles.error} role="alert">{errores.dia}</span>}
            <span className={styles.inputHint}>Número bajo (el segundo)</span>
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="pulso">
              Pulso <span className={styles.labelUnidad}>(ppm) — opcional</span>
            </label>
            <input
              id="pulso"
              className={`${styles.input} ${errores.pulso ? styles.inputError : ''}`}
              type="number"
              inputMode="numeric"
              placeholder="ej. 72"
              min={20}
              max={300}
              value={pulso}
              onChange={e => { setPulso(e.target.value); setErrores(p => ({ ...p, pulso: undefined })); }}
              onKeyDown={handleKeyDown}
              aria-describedby={errores.pulso ? 'error-pulso' : undefined}
              autoComplete="off"
            />
            {errores.pulso && <span id="error-pulso" className={styles.error} role="alert">{errores.pulso}</span>}
            <span className={styles.inputHint}>Pulsaciones por minuto</span>
          </div>
        </div>

        <div className={styles.formularioAcciones}>
          <button className={styles.btnSecundario} onClick={limpiar} type="button">Limpiar</button>
          <button className={styles.btnPrimario} onClick={calcular} type="button">Calcular</button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={styles.resultadoWrapper}>
          <Resultado sistolica={resultado.sis} diastolica={resultado.dia} pulso={resultado.pulso} />
        </div>
      )}

      {/* Tabla de referencia */}
      <div className={styles.tablaSeccion}>
        <button
          className={styles.btnTabla}
          onClick={() => setMostrarTabla(p => !p)}
          type="button"
          aria-expanded={mostrarTabla}
        >
          {mostrarTabla ? '▲ Ocultar' : '▼ Ver'} tabla de clasificación ESH/ESC 2018
        </button>
        {mostrarTabla && <TablaClasificaciones />}
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div className={styles.historialCard}>
          <div className={styles.historialCabecera}>
            <h2 className={styles.historialTitulo}>Historial de mediciones</h2>
            <button className={styles.btnPeligro} onClick={limpiarHistorial} type="button">
              Borrar historial
            </button>
          </div>
          <div className={styles.historialWrapper}>
            <table className={styles.historialTabla} aria-label="Historial de mediciones de tensión arterial">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Sistólica</th>
                  <th>Diastólica</th>
                  <th>Pulso</th>
                  <th>Clasificación</th>
                  <th aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody>
                {historial.map(m => {
                  const cl = CLASIFICACIONES[m.clasificacionId];
                  const fecha = new Date(m.fecha);
                  const fechaFormateada = formatDate(fecha);
                  const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={m.id}>
                      <td className={styles.historialFecha}>{fechaFormateada} {horaFormateada}</td>
                      <td><strong>{m.sistolica}</strong></td>
                      <td><strong>{m.diastolica}</strong></td>
                      <td>{m.pulso ?? '—'}</td>
                      <td>
                        <span
                          className={styles.historialBadge}
                          style={{ background: cl.color }}
                        >
                          {cl.nombre}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => eliminarMedicion(m.id)}
                          type="button"
                          aria-label={`Eliminar medición del ${fechaFormateada}`}
                          title="Eliminar"
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={styles.historialNota}>
            El historial se guarda localmente en tu dispositivo. Nadie más tiene acceso a estos datos.
          </p>
        </div>
      )}

      <EducationalSection
        title="¿Cómo interpretar tu tensión arterial?"
        subtitle="Guía educativa sobre presión arterial, medición correcta y factores de riesgo"
        icon="🩺"
      >
        {/* Tabla comparativa - Clasificación ESH/ESC 2018 */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Sistólica (mmHg)</th>
                <th>Diastólica (mmHg)</th>
                <th>TAM aprox.</th>
                <th>Acción recomendada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Óptima</strong></td>
                <td>&lt; 120</td>
                <td>&lt; 80</td>
                <td>&lt; 93 mmHg</td>
                <td>Mantener estilo de vida saludable</td>
              </tr>
              <tr>
                <td><strong>Normal</strong></td>
                <td>120–129</td>
                <td>80–84</td>
                <td>93–99 mmHg</td>
                <td>Revisión periódica, hábitos saludables</td>
              </tr>
              <tr>
                <td><strong>Normal-Alta</strong></td>
                <td>130–139</td>
                <td>85–89</td>
                <td>100–106 mmHg</td>
                <td>Control, cambios de estilo de vida</td>
              </tr>
              <tr>
                <td><strong>HTA Grado 1</strong></td>
                <td>140–159</td>
                <td>90–99</td>
                <td>107–119 mmHg</td>
                <td>Consultar médico; posible tratamiento</td>
              </tr>
              <tr>
                <td><strong>HTA Grado 2</strong></td>
                <td>160–179</td>
                <td>100–109</td>
                <td>120–133 mmHg</td>
                <td>Tratamiento farmacológico recomendado</td>
              </tr>
              <tr>
                <td><strong>HTA Grado 3</strong></td>
                <td>≥ 180</td>
                <td>≥ 110</td>
                <td>≥ 133 mmHg</td>
                <td>Tratamiento urgente; riesgo muy alto</td>
              </tr>
              <tr>
                <td><strong>HTA sistólica aislada</strong></td>
                <td>≥ 140</td>
                <td>&lt; 90</td>
                <td>Variable</td>
                <td>Frecuente en mayores; consultar médico</td>
              </tr>
              <tr>
                <td><strong>Crisis hipertensiva</strong></td>
                <td>≥ 180</td>
                <td>≥ 120</td>
                <td>≥ 140 mmHg</td>
                <td>🚨 Urgencias / llamar al 112</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🩺 Hipertenso en tratamiento</h3>
            <p>Si tomas antihipertensivos, monitoriza si tus valores están en el rango objetivo (&lt;130/80 mmHg según las guías ESH/ESC 2018 para pacientes en tratamiento). Lleva un registro para tu médico.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🏠 Medición domiciliaria</h3>
            <p>La medición en casa evita el efecto de &quot;bata blanca&quot; (tensión alta solo en la consulta). Toma mediciones a las mismas horas durante 7 días y calcula la media para un resultado más fiable.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🏃 Deportista</h3>
            <p>Los deportistas de resistencia suelen tener tensión sistólica ligeramente más alta en reposo pero excelente respuesta al ejercicio. La presión de pulso amplia puede ser normal en atletas con buena forma cardíaca.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>👴 Persona mayor</h3>
            <p>En mayores de 65 años es frecuente la hipertensión sistólica aislada (sistólica ≥140 con diastólica normal). Los objetivos de tratamiento pueden ser menos estrictos para evitar hipotensión ortostática.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🤰 Embarazada</h3>
            <p>La tensión arterial se controla estrechamente durante el embarazo. La preeclampsia (sistólica ≥140 o diastólica ≥90 después de la semana 20) es una emergencia obstétrica que requiere atención inmediata.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>📱 Primera medición</h3>
            <p>Si es tu primera vez midiendo la tensión y obtienes un valor elevado, no te alarmes: el estrés de la situación puede subir temporalmente la tensión (&quot;hipertensión de bata blanca&quot;). Repite la medición varios días en reposo.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Cuál es la diferencia entre hipertensión grado 1 y grado 2?</h3>
            <p>La HTA Grado 1 (140-159/90-99 mmHg) puede manejarse inicialmente con cambios de estilo de vida durante 3-6 meses si no hay factores de riesgo adicionales. La HTA Grado 2 (≥160/100 mmHg) generalmente requiere tratamiento farmacológico inmediato desde el diagnóstico, además de cambios en el estilo de vida.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Es mejor medir la tensión por la mañana o por la noche?</h3>
            <p>Las guías recomiendan medir por la mañana (antes de tomar medicación, antes de desayunar) y por la noche (antes de dormir). La tensión tiene un ritmo circadiano: sube al levantarse, alcanza su pico a media mañana, y baja por la noche. Las guías ESH/ESC recomiendan la media de ambas sesiones durante 7 días.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es la &quot;hipertensión de bata blanca&quot;?</h3>
            <p>Es un fenómeno por el que la tensión sube de forma ansiosa solo en el entorno médico, pero es normal en casa. Afecta al 15-30% de personas. Se diagnostica comparando mediciones en consulta con el MAPA (monitor ambulatorio de 24h) o con mediciones domiciliarias sistemáticas. No siempre requiere tratamiento.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo tomar la tensión con tensiómetro de muñeca?</h3>
            <p>Los tensiómetros de muñeca son menos precisos que los de brazo porque la posición de la muñeca puede variar. Si usas uno de muñeca, mantén el brazo a la altura del corazón durante la medición. Para seguimiento médico formal, los tensiómetros de brazo validados (brazo no dominante) son más fiables.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿La hipertensión se puede curar definitivamente?</h3>
            <p>En la mayoría de casos, la hipertensión esencial (sin causa identificable, el 90% de los casos) es crónica y requiere control de por vida. Sin embargo, con cambios en el estilo de vida (reducción de peso, ejercicio, dieta baja en sodio) algunos pacientes con HTA leve consiguen normalizar sus valores sin medicación. La hipertensión secundaria (5-10%) puede resolverse tratando la causa subyacente.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuánto sodio debo limitar si tengo hipertensión?</h3>
            <p>Las guías recomiendan menos de 5 g de sal al día (2 g de sodio) para la población general, y especialmente para hipertensos. El 70-75% del sodio que consumimos viene de alimentos procesados, pan y embutidos, no del salero. Leer etiquetas y reducir alimentos procesados es más efectivo que simplemente no añadir sal al cocinar.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuándo debo ir a urgencias por la tensión arterial?</h3>
            <p>Ante una crisis hipertensiva (sistólica ≥180 mmHg O diastólica ≥120 mmHg), especialmente si va acompañada de síntomas: dolor de cabeza intenso, visión borrosa o doble, dolor en el pecho, dificultad para respirar, confusión, debilidad unilateral. Llama al 112. Sin síntomas, una lectura elevada aislada puede repetirse tras descansar 15-30 minutos antes de actuar.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es la TAM (Tensión Arterial Media) y por qué importa?</h3>
            <p>La TAM estima la presión de perfusión promedio de los órganos durante un ciclo cardíaco completo. Se calcula como: TAM = Diastólica + (Sistólica − Diastólica) / 3. Una TAM normal está entre 70 y 105 mmHg. En medicina intensiva, mantener una TAM superior a 65 mmHg es el objetivo mínimo de perfusión en pacientes críticos.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Reposa 5 minutos antes de medir</h3>
              <p>Siéntate en silencio con la espalda apoyada, pies en el suelo, sin cruzar las piernas. El estrés o el ejercicio reciente pueden elevar la tensión hasta 20-30 mmHg temporalmente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Prepara las condiciones correctas</h3>
              <p>No comas, fumes, ni consumas cafeína en los 30 minutos previos. Vacía la vejiga (una vejiga llena puede subir la sistólica ~10 mmHg). No hables durante la medición.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Coloca el manguito correctamente</h3>
              <p>El borde inferior del manguito debe quedar 2-3 cm por encima del codo. El brazo apoyado a la altura del corazón. El manguito debe quedar ni muy apretado ni muy suelto (cabe 1-2 dedos).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Toma 2-3 mediciones con 1 minuto de pausa</h3>
              <p>La primera medición suele ser algo más alta (efecto de alerta). La media de 2-3 mediciones consecutivas es más representativa que una sola lectura.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Introduce los valores en la calculadora</h3>
              <p>Usa la media de tus mediciones. Introduce sistólica, diastólica y opcionalmente el pulso. La app calculará la clasificación ESH/ESC 2018, la TAM y la presión de pulso.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Interpreta la clasificación</h3>
              <p>Consulta la tabla de clasificación ESH/ESC 2018 para entender en qué categoría estás. Recuerda que un valor aislado no es diagnóstico — se necesitan mediciones repetidas.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Lleva un registro y compártelo con tu médico</h3>
              <p>Anota fecha, hora, brazo y valores de cada medición. Un registro de 7 días (mañana y noche) es mucho más informativo para tu médico que una sola medición en consulta.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>🕐 Mide a la misma hora</h3>
            <p>La tensión varía a lo largo del día. Para comparar valores, mide siempre a las mismas horas: típicamente por la mañana (antes del desayuno) y por la noche (antes de dormir).</p>
          </div>
          <div className={styles.tipCard}>
            <h3>💪 Siempre el mismo brazo</h3>
            <p>Puede haber diferencias de 5-10 mmHg entre brazos. Mide ambos en la primera ocasión y usa siempre el que dé valores más altos para el seguimiento.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🧂 Reduce el sodio</h3>
            <p>Reducir el sodio de 3,5 g/día a 2 g/día puede bajar la sistólica entre 5-8 mmHg. El impacto es mayor en personas &quot;sal-sensibles&quot;, especialmente mayores y personas con diabetes.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🏃 Ejercicio aeróbico regular</h3>
            <p>150 minutos/semana de actividad moderada reduce la sistólica entre 5-8 mmHg en hipertensos. Caminar a paso rápido, nadar o montar en bici son opciones excelentes y seguras.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🍷 Limita el alcohol</h3>
            <p>El consumo de más de 2 unidades de alcohol al día (hombres) o 1 unidad (mujeres) eleva la tensión arterial de forma consistente. La reducción tiene efecto en 2-4 semanas.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>😴 Duerme bien</h3>
            <p>Dormir menos de 6 horas aumenta el riesgo de hipertensión. La apnea del sueño no tratada es una causa frecuente de hipertensión resistente al tratamiento.</p>
          </div>
        </div>

        {/* Aviso médico importante */}
        <div className={styles.warningBox}>
          <h3>⚠️ Esta herramienta no reemplaza la atención médica</h3>
          <ul className={styles.warningList}>
            <li>Los resultados son orientativos basados en guías ESH/ESC 2018. No constituyen diagnóstico ni prescripción médica.</li>
            <li>Ante lecturas repetidamente elevadas (HTA Grado 1 o superior), consulta a tu médico. No modifiques ni suspendas medicación antihipertensiva por tu cuenta.</li>
            <li>En crisis hipertensiva (sistólica ≥180 o diastólica ≥120), especialmente con síntomas (dolor de cabeza intenso, visión borrosa, dolor en el pecho), llama al 112 o acude a urgencias inmediatamente.</li>
            <li>Una sola medición elevada no es diagnóstico de hipertensión. Se requieren mediciones repetidas en condiciones correctas a lo largo de varios días.</li>
          </ul>
        </div>

        <h3>¿Qué es la tensión arterial?</h3>
        <p>
          La tensión arterial mide la fuerza con la que la sangre empuja contra las paredes de las arterias.
          Se expresa con dos valores: <strong>sistólica</strong> (cuando el corazón late) y <strong>diastólica</strong> (entre latidos).
        </p>

        <h3>¿Cómo medirla correctamente?</h3>
        <ul>
          <li>Reposa 5 minutos sentado antes de medir.</li>
          <li>No comas, fumes ni hagas ejercicio en los 30 minutos previos.</li>
          <li>Apoya el brazo a la altura del corazón, sin cruzar las piernas.</li>
          <li>Toma 2-3 mediciones con 1-2 minutos de diferencia y calcula la media.</li>
          <li>Mide siempre en el mismo brazo (el que dé valores más altos).</li>
        </ul>

        <h3>¿Qué es la Tensión Arterial Media (TAM)?</h3>
        <p>
          La TAM estima la presión promedio en las arterias durante un ciclo cardíaco completo.
          Se calcula como: <strong>TAM = Diastólica + (Sistólica − Diastólica) / 3</strong>.
          Un valor normal está entre 70 y 105 mmHg.
        </p>

        <h3>¿Qué es la presión de pulso?</h3>
        <p>
          Es la diferencia entre sistólica y diastólica (Sistólica − Diastólica).
          Un rango normal es de <strong>40–60 mmHg</strong>. Valores elevados ({'>'}60 mmHg) se asocian
          a mayor rigidez arterial y riesgo cardiovascular.
        </p>

        <h3>Factores que elevan la tensión arterial</h3>
        <ul>
          <li><strong>Dieta alta en sodio</strong>: reduce la sal a menos de 5 g/día.</li>
          <li><strong>Sedentarismo</strong>: 150 min/semana de actividad moderada ayuda a reducirla.</li>
          <li><strong>Estrés crónico</strong>: técnicas de relajación y sueño adecuado.</li>
          <li><strong>Tabaco y alcohol</strong>: ambos elevan la tensión de forma significativa.</li>
          <li><strong>Sobrepeso</strong>: perder 5 kg puede reducir la sistólica ~5 mmHg.</li>
        </ul>

        <h3>¿Cuándo ir al médico?</h3>
        <p>
          Ante cualquier lectura en rango HTA Grado 1 o superior de forma repetida,
          o si presentas síntomas como dolor de cabeza intenso, visión borrosa, mareos,
          dolor en el pecho o dificultad para respirar.
          En caso de crisis hipertensiva ({'>'}180/120), acude a urgencias o llama al 112.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-tension-arterial')} />
      <ShareCard appName="orientador-tension-arterial" />
      <Footer appName="orientador-tension-arterial" />
    </div>
  );
}
