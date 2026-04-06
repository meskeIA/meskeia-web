'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCiclosSueno.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'fases' | 'noche' | 'necesitas' | 'enemigos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'fases', titulo: 'Las fases', icono: '🧠', subtitulo: 'Las 4 etapas del sueño' },
  { id: 'noche', titulo: 'Una noche entera', icono: '🌙', subtitulo: 'Hipnograma de 8 horas' },
  { id: 'necesitas', titulo: '¿Cuánto necesitas?', icono: '⏰', subtitulo: 'Horas de sueño por edad' },
  { id: 'enemigos', titulo: 'Enemigos del sueño', icono: '⚠️', subtitulo: '6 factores que destruyen tu descanso' },
];

// ─────────────────────────────────────────────
// Datos de las fases
// ─────────────────────────────────────────────

interface FaseDetalle {
  id: string;
  nombre: string;
  porcentaje: number;
  color: string;
  descripcion: string;
  ondasCerebrales: string;
  temperaturaCorporal: string;
  tonoMuscular: string;
  movimientoOjos: string;
  datoExtra: string;
}

const FASES_DETALLE: FaseDetalle[] = [
  {
    id: 'n1',
    nombre: 'N1 — Transición',
    porcentaje: 5,
    color: '#FBBF24',
    descripcion: 'El paso entre la vigilia y el sueño. Dura apenas 5-10 minutos. Te despiertas con facilidad.',
    ondasCerebrales: 'Theta (4-7 Hz) — ondas lentas sustituyendo a las alfa',
    temperaturaCorporal: 'Empieza a descender ligeramente',
    tonoMuscular: 'Disminuye; pueden ocurrir sacudidas involuntarias (mioclonías)',
    movimientoOjos: 'Movimientos lentos, rodando bajo los párpados',
    datoExtra: 'La sensación de "caer al vacío" que a veces sientes al dormirte ocurre aquí. Se llama sacudida hípnica y es completamente normal.',
  },
  {
    id: 'n2',
    nombre: 'N2 — Sueño ligero',
    porcentaje: 45,
    color: '#34D399',
    descripcion: 'La fase más larga de la noche. Tu cerebro filtra estímulos externos y empieza a consolidar memorias.',
    ondasCerebrales: 'Husos del sueño (12-14 Hz) + Complejos K — ráfagas rápidas que bloquean ruidos',
    temperaturaCorporal: 'Desciende 1-2 °C respecto a la vigilia',
    tonoMuscular: 'Relajado pero no paralizado',
    movimientoOjos: 'Se detienen',
    datoExtra: 'Los husos del sueño son como un "portero" que decide qué sonidos te despiertan (tu nombre sí, un ruido aleatorio no). También transfieren recuerdos al almacenamiento a largo plazo.',
  },
  {
    id: 'n3',
    nombre: 'N3 — Sueño profundo',
    porcentaje: 25,
    color: '#1E40AF',
    descripcion: 'La fase de reparación física. Si te despiertan aquí, estarás desorientado y confuso durante minutos.',
    ondasCerebrales: 'Delta (0,5-4 Hz) — ondas muy lentas y amplias, actividad cerebral mínima',
    temperaturaCorporal: 'Punto más bajo de la noche (hasta 2 °C menos)',
    tonoMuscular: 'Muy relajado; no hay parálisis pero los músculos están casi inactivos',
    movimientoOjos: 'Ninguno',
    datoExtra: 'El cuerpo libera hormona del crecimiento (GH), repara tejidos, fortalece el sistema inmune y el sistema glinfático elimina toxinas del cerebro (incluida la proteína beta-amiloide asociada al Alzheimer).',
  },
  {
    id: 'rem',
    nombre: 'REM — Sueños',
    porcentaje: 25,
    color: '#8B5CF6',
    descripcion: 'Movimientos oculares rápidos. Aquí ocurren los sueños más vívidos, narrativos y emocionales.',
    ondasCerebrales: 'Beta-like (13-30 Hz) — similar a estar despierto; el cerebro está muy activo',
    temperaturaCorporal: 'Pierde capacidad de termorregulación (no suda ni tiembla)',
    tonoMuscular: 'Atonía muscular completa — el cuerpo está paralizado para que no actúes los sueños',
    movimientoOjos: 'Rápidos y conjugados bajo los párpados cerrados',
    datoExtra: 'El REM procesa emociones, consolida la memoria creativa y "recalibra" la respuesta emocional del día siguiente. Perder REM aumenta la irritabilidad y dificulta el aprendizaje complejo.',
  },
];

// ─────────────────────────────────────────────
// Datos del hipnograma
// ─────────────────────────────────────────────

interface BloqueHipnograma {
  fase: string;
  color: string;
  profundidad: number; // 0=despierto, 1=N1, 2=N2, 3=N3, 4=REM
  minutos: number;
  ciclo: number;
}

// 8 horas = 5 ciclos + dormirse + despertares breves
const BLOQUES_NOCHE: BloqueHipnograma[] = [
  // Dormirse
  { fase: 'Despierto', color: '#F59E0B', profundidad: 0, minutos: 10, ciclo: 0 },
  // Ciclo 1 (~90 min) — más sueño profundo
  { fase: 'N1', color: '#FBBF24', profundidad: 1, minutos: 5, ciclo: 1 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 20, ciclo: 1 },
  { fase: 'N3', color: '#1E40AF', profundidad: 3, minutos: 40, ciclo: 1 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 15, ciclo: 1 },
  { fase: 'REM', color: '#8B5CF6', profundidad: 4, minutos: 10, ciclo: 1 },
  // Ciclo 2 (~90 min)
  { fase: 'N1', color: '#FBBF24', profundidad: 1, minutos: 5, ciclo: 2 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 20, ciclo: 2 },
  { fase: 'N3', color: '#1E40AF', profundidad: 3, minutos: 30, ciclo: 2 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 15, ciclo: 2 },
  { fase: 'REM', color: '#8B5CF6', profundidad: 4, minutos: 15, ciclo: 2 },
  // Despertar breve
  { fase: 'Despierto', color: '#F59E0B', profundidad: 0, minutos: 5, ciclo: 0 },
  // Ciclo 3 (~90 min) — transición
  { fase: 'N1', color: '#FBBF24', profundidad: 1, minutos: 5, ciclo: 3 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 25, ciclo: 3 },
  { fase: 'N3', color: '#1E40AF', profundidad: 3, minutos: 15, ciclo: 3 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 15, ciclo: 3 },
  { fase: 'REM', color: '#8B5CF6', profundidad: 4, minutos: 20, ciclo: 3 },
  // Ciclo 4 (~90 min) — más REM
  { fase: 'N1', color: '#FBBF24', profundidad: 1, minutos: 5, ciclo: 4 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 25, ciclo: 4 },
  { fase: 'N3', color: '#1E40AF', profundidad: 3, minutos: 5, ciclo: 4 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 20, ciclo: 4 },
  { fase: 'REM', color: '#8B5CF6', profundidad: 4, minutos: 30, ciclo: 4 },
  // Ciclo 5 parcial (~50 min)
  { fase: 'N1', color: '#FBBF24', profundidad: 1, minutos: 5, ciclo: 5 },
  { fase: 'N2', color: '#34D399', profundidad: 2, minutos: 15, ciclo: 5 },
  { fase: 'REM', color: '#8B5CF6', profundidad: 4, minutos: 25, ciclo: 5 },
  // Despertarse
  { fase: 'Despierto', color: '#F59E0B', profundidad: 0, minutos: 5, ciclo: 0 },
];

// ─────────────────────────────────────────────
// Datos de horas por edad
// ─────────────────────────────────────────────

interface GrupoEdad {
  grupo: string;
  edad: string;
  icono: string;
  horasMin: number;
  horasMax: number;
  color: string;
  nota: string;
}

const GRUPOS_EDAD: GrupoEdad[] = [
  { grupo: 'Recién nacido', edad: '0-3 meses', icono: '👶', horasMin: 14, horasMax: 17, color: '#8B5CF6', nota: 'Duermen en bloques de 2-4h; no distinguen día y noche' },
  { grupo: 'Bebé', edad: '4-11 meses', icono: '🍼', horasMin: 12, horasMax: 15, color: '#6366F1', nota: 'Empiezan a consolidar sueño nocturno; necesitan 2-3 siestas' },
  { grupo: 'Niño pequeño', edad: '1-5 años', icono: '🧒', horasMin: 10, horasMax: 14, color: '#3B82F6', nota: 'Transición de 2 siestas a 1, y luego a ninguna hacia los 5' },
  { grupo: 'Niño', edad: '6-13 años', icono: '📚', horasMin: 9, horasMax: 11, color: '#2E86AB', nota: 'Sueño profundo abundante; fundamental para crecimiento y aprendizaje' },
  { grupo: 'Adolescente', edad: '14-17 años', icono: '🎮', horasMin: 8, horasMax: 10, color: '#48A9A6', nota: 'Reloj biológico retrasado 2h; se duermen tarde por biología, no por pereza' },
  { grupo: 'Adulto', edad: '18-64 años', icono: '💼', horasMin: 7, horasMax: 9, color: '#34D399', nota: '<1% tiene el gen DEC2 que permite funcionar con 6h; el resto necesita 7+' },
  { grupo: 'Mayor', edad: '65+ años', icono: '👴', horasMin: 7, horasMax: 8, color: '#FBBF24', nota: 'Menos sueño profundo; más despertares nocturnos; las siestas compensan' },
];

// ─────────────────────────────────────────────
// Datos de enemigos del sueño
// ─────────────────────────────────────────────

interface EnemigoSueno {
  nombre: string;
  icono: string;
  impacto: number; // 1-5
  colorImpacto: string;
  descripcion: string;
  ciencia: string;
  consejo: string;
}

const ENEMIGOS: EnemigoSueno[] = [
  {
    nombre: 'Luz azul de pantallas',
    icono: '📱',
    impacto: 5,
    colorImpacto: '#EF4444',
    descripcion: 'Las pantallas emiten luz azul (450-490 nm) que tu cerebro interpreta como luz diurna.',
    ciencia: 'La luz azul suprime la producción de melatonina hasta un 50%. Retrasa el inicio del sueño entre 30-60 minutos y reduce la duración del REM.',
    consejo: 'Activar modo noche 2h antes de dormir. Mejor aún: dejar las pantallas 1h antes de acostarte y leer en papel o libro electrónico sin retroiluminación.',
  },
  {
    nombre: 'Cafeína',
    icono: '☕',
    impacto: 4,
    colorImpacto: '#F97316',
    descripcion: 'La cafeína bloquea los receptores de adenosina, la molécula que te hace sentir sueño.',
    ciencia: 'Vida media de 5-6 horas. Un café a las 16:00 aún tiene el 50% de cafeína a las 22:00. Reduce el sueño profundo (N3) incluso si "puedes dormirte".',
    consejo: 'Última cafeína antes de las 14:00. Recuerda: el té, el chocolate negro y muchos refrescos también contienen cafeína.',
  },
  {
    nombre: 'Alcohol',
    icono: '🍷',
    impacto: 4,
    colorImpacto: '#F97316',
    descripcion: 'El alcohol te ayuda a dormirte más rápido, pero destruye la calidad del sueño.',
    ciencia: 'Fragmenta el REM drásticamente (hasta un 40% menos). Causa despertares en la segunda mitad de la noche cuando el cuerpo metaboliza el alcohol. Aumenta la apnea del sueño.',
    consejo: 'Si bebes, hazlo al menos 3-4h antes de dormir. Una copa de vino con la cena afecta mucho menos que una copa antes de acostarte.',
  },
  {
    nombre: 'Temperatura inadecuada',
    icono: '🌡️',
    impacto: 3,
    colorImpacto: '#FBBF24',
    descripcion: 'Tu cuerpo necesita enfriarse 1-2 °C para iniciar el sueño. Una habitación demasiado caliente lo impide.',
    ciencia: 'La temperatura ideal del dormitorio es 18-20 °C. El descenso de temperatura corporal es una señal clave para el núcleo supraquiasmático (tu reloj biológico).',
    consejo: 'Habitación fresca (18-20 °C). Una ducha caliente 1-2h antes funciona paradójicamente: dilata los vasos periféricos y ayuda a que el cuerpo se enfríe.',
  },
  {
    nombre: 'Horario irregular',
    icono: '🔄',
    impacto: 4,
    colorImpacto: '#F97316',
    descripcion: 'Acostarte y levantarte a horas distintas cada día desincroniza tu reloj circadiano.',
    ciencia: 'El "social jet lag" (horario diferente entre semana y fines de semana) equivale a viajar 2-3 husos horarios cada lunes. Se asocia con peor rendimiento cognitivo y mayor riesgo metabólico.',
    consejo: 'Mantener un horario fijo los 7 días de la semana (máximo 30 min de variación). Es el cambio con más impacto demostrado en la calidad del sueño.',
  },
  {
    nombre: 'Estrés y ansiedad',
    icono: '😰',
    impacto: 5,
    colorImpacto: '#EF4444',
    descripcion: 'El estrés activa el eje HPA (hipotálamo-pituitaria-adrenal), liberando cortisol que es incompatible con el sueño.',
    ciencia: 'El cortisol elevado por la noche retrasa el inicio del sueño, reduce el sueño profundo y puede causar despertares a las 3-4 AM (pico de cortisol). Es el inicio de un ciclo vicioso: menos sueño = más estrés.',
    consejo: 'Técnica 4-7-8: inhala 4s, retén 7s, exhala 8s (3-4 ciclos). Escribir preocupaciones en papel antes de dormir reduce el tiempo para conciliar el sueño en 9 minutos de media.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Las fases
// ─────────────────────────────────────────────

function SeccionFases() {
  const [faseActiva, setFaseActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sueño no es un estado uniforme. Tu cerebro alterna entre <strong>4 fases distintas</strong>, cada una con funciones diferentes. Haz clic en cada fase para explorar sus detalles.</p>
      </div>

      {/* Barra de distribución */}
      <div className={styles.distribucionBarra}>
        {FASES_DETALLE.map(f => (
          <div
            key={f.id}
            className={styles.distribucionSegmento}
            style={{ width: `${f.porcentaje}%`, background: f.color }}
            title={`${f.nombre}: ${f.porcentaje}%`}
          >
            <span className={styles.distribucionPct}>{f.porcentaje}%</span>
          </div>
        ))}
      </div>
      <p className={styles.distribucionCaption}>Distribución típica en una noche de 8 horas</p>

      {/* Tarjetas de fases */}
      <div className={styles.fasesGrid}>
        {FASES_DETALLE.map(f => {
          const activa = faseActiva === f.id;
          return (
            <button
              key={f.id}
              type="button"
              className={`${styles.faseCard} ${activa ? styles.faseCardActiva : ''}`}
              style={{ borderColor: activa ? f.color : undefined }}
              onClick={() => setFaseActiva(activa ? null : f.id)}
              aria-expanded={activa}
            >
              <div className={styles.faseHeader}>
                <span className={styles.faseDot} style={{ background: f.color }} />
                <span className={styles.faseNombre}>{f.nombre}</span>
                <span className={styles.fasePct}>{f.porcentaje}%</span>
              </div>
              <p className={styles.faseDescripcion}>{f.descripcion}</p>

              {activa && (
                <div className={styles.faseDetalle}>
                  <div className={styles.faseDetallesGrid}>
                    <div className={styles.faseDetalleItem}>
                      <span className={styles.faseDetalleLabel}>Ondas cerebrales</span>
                      <span className={styles.faseDetalleValor}>{f.ondasCerebrales}</span>
                    </div>
                    <div className={styles.faseDetalleItem}>
                      <span className={styles.faseDetalleLabel}>Temperatura corporal</span>
                      <span className={styles.faseDetalleValor}>{f.temperaturaCorporal}</span>
                    </div>
                    <div className={styles.faseDetalleItem}>
                      <span className={styles.faseDetalleLabel}>Tono muscular</span>
                      <span className={styles.faseDetalleValor}>{f.tonoMuscular}</span>
                    </div>
                    <div className={styles.faseDetalleItem}>
                      <span className={styles.faseDetalleLabel}>Movimiento ocular</span>
                      <span className={styles.faseDetalleValor}>{f.movimientoOjos}</span>
                    </div>
                  </div>
                  <p className={styles.faseExtraTexto}>{f.datoExtra}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          La primera mitad de la noche tiene <strong>más sueño profundo (N3)</strong> para la reparación física.
          La segunda mitad tiene <strong>más REM</strong> para el procesamiento emocional y la memoria creativa.
          Por eso madrugar demasiado roba REM, y acostarse tarde roba N3.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Una noche entera (hipnograma)
// ─────────────────────────────────────────────

function SeccionNoche() {
  const totalMinutos = BLOQUES_NOCHE.reduce((sum, b) => sum + b.minutos, 0);
  const profundidadLabels = ['Despierto', 'N1', 'N2', 'N3', 'REM'];

  // Calcular posiciones left acumulativas
  let acumulado = 0;
  const bloquesConPos = BLOQUES_NOCHE.map(b => {
    const left = acumulado;
    acumulado += b.minutos;
    return { ...b, leftPct: (left / totalMinutos) * 100, widthPct: (b.minutos / totalMinutos) * 100 };
  });

  // Marcas de hora
  const marcasHora = [];
  for (let h = 0; h <= 8; h++) {
    marcasHora.push({ hora: h, pct: (h * 60 / totalMinutos) * 100 });
  }

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Este hipnograma muestra <strong>8 horas de sueño reales</strong>: 4-5 ciclos de ~90 minutos. Observa cómo la primera mitad tiene más sueño profundo (azul) y la segunda más REM (violeta).</p>
      </div>

      {/* Hipnograma */}
      <div className={styles.hipnograma}>
        <div className={styles.hipnoLabels}>
          {profundidadLabels.map((label, i) => (
            <span
              key={label}
              className={styles.hipnoLabel}
              style={{ top: `${(i / (profundidadLabels.length - 1)) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className={styles.hipnoChart}>
          {/* Guías horizontales */}
          {profundidadLabels.map((_, i) => (
            <div
              key={`guide-${i}`}
              className={styles.hipnoGuia}
              style={{ top: `${(i / (profundidadLabels.length - 1)) * 100}%` }}
            />
          ))}
          {/* Marcas de hora */}
          {marcasHora.map(m => (
            <div
              key={`mark-${m.hora}`}
              className={styles.hipnoMarcaHora}
              style={{ left: `${m.pct}%` }}
            >
              <span className={styles.hipnoHoraTexto}>{m.hora}h</span>
            </div>
          ))}
          {/* Bloques */}
          {bloquesConPos.map((b, i) => {
            const posY = b.profundidad === 4 ? 1 : b.profundidad; // REM se muestra a nivel de N1
            const topPct = (posY / (profundidadLabels.length - 1)) * 100;
            const heightPct = 100 / (profundidadLabels.length - 1);
            return (
              <div
                key={i}
                className={styles.hipnoBloque}
                style={{
                  left: `${b.leftPct}%`,
                  width: `${b.widthPct}%`,
                  top: `${topPct}%`,
                  height: `${heightPct}%`,
                  backgroundColor: b.color,
                }}
                title={`${b.fase}: ${b.minutos} min${b.ciclo > 0 ? ` (ciclo ${b.ciclo})` : ''}`}
              >
                {b.minutos >= 15 && (
                  <span className={styles.hipnoBloqueTexto}>{b.fase}</span>
                )}
              </div>
            );
          })}
          {/* Divisores de ciclo */}
          {(() => {
            let acc = 0;
            const divisores: number[] = [];
            let prevCiclo = 0;
            for (const b of BLOQUES_NOCHE) {
              if (b.ciclo !== prevCiclo && b.ciclo > 0 && prevCiclo > 0) {
                divisores.push((acc / totalMinutos) * 100);
              }
              prevCiclo = b.ciclo;
              acc += b.minutos;
            }
            return divisores.map((pct, i) => (
              <div
                key={`div-${i}`}
                className={styles.hipnoDivisorCiclo}
                style={{ left: `${pct}%` }}
              />
            ));
          })()}
        </div>
      </div>

      {/* Leyenda */}
      <div className={styles.hipnoLeyenda}>
        <span className={styles.leyendaItem}><span className={styles.leyendaDot} style={{ background: '#F59E0B' }} /> Despierto</span>
        <span className={styles.leyendaItem}><span className={styles.leyendaDot} style={{ background: '#FBBF24' }} /> N1</span>
        <span className={styles.leyendaItem}><span className={styles.leyendaDot} style={{ background: '#34D399' }} /> N2</span>
        <span className={styles.leyendaItem}><span className={styles.leyendaDot} style={{ background: '#1E40AF' }} /> N3 (profundo)</span>
        <span className={styles.leyendaItem}><span className={styles.leyendaDot} style={{ background: '#8B5CF6' }} /> REM</span>
      </div>

      {/* Resumen por ciclo */}
      <div className={styles.cicloResumenGrid}>
        {[1, 2, 3, 4, 5].map(c => {
          const bloquesCiclo = BLOQUES_NOCHE.filter(b => b.ciclo === c);
          const minCiclo = bloquesCiclo.reduce((s, b) => s + b.minutos, 0);
          const n3Min = bloquesCiclo.filter(b => b.fase === 'N3').reduce((s, b) => s + b.minutos, 0);
          const remMin = bloquesCiclo.filter(b => b.fase === 'REM').reduce((s, b) => s + b.minutos, 0);
          return (
            <div key={c} className={styles.cicloCard}>
              <span className={styles.cicloNumero}>Ciclo {c}</span>
              <span className={styles.cicloDuracion}>{minCiclo} min</span>
              <div className={styles.cicloBarras}>
                <div className={styles.cicloBarra}>
                  <span className={styles.cicloBarraLabel}>N3</span>
                  <div className={styles.cicloBarraTrack}>
                    <div className={styles.cicloBarraFill} style={{ width: `${(n3Min / 45) * 100}%`, background: '#1E40AF' }} />
                  </div>
                  <span className={styles.cicloBarraValor}>{n3Min}m</span>
                </div>
                <div className={styles.cicloBarra}>
                  <span className={styles.cicloBarraLabel}>REM</span>
                  <div className={styles.cicloBarraTrack}>
                    <div className={styles.cicloBarraFill} style={{ width: `${(remMin / 35) * 100}%`, background: '#8B5CF6' }} />
                  </div>
                  <span className={styles.cicloBarraValor}>{remMin}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          Observa el patrón: los <strong>primeros ciclos</strong> tienen más sueño profundo (N3) para la reparación física,
          mientras que los <strong>últimos ciclos</strong> tienen más REM para procesar emociones y memorias.
          Por eso dormir solo 5-6 horas sacrifica principalmente el REM.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: ¿Cuánto necesitas?
// ─────────────────────────────────────────────

function SeccionNecesitas() {
  const maxHoras = 17;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las necesidades de sueño cambian drásticamente con la edad. Un recién nacido necesita <strong>más del doble</strong> que un adulto. Aquí tienes las recomendaciones de la National Sleep Foundation.</p>
      </div>

      {/* Barras horizontales por edad */}
      <div className={styles.edadGrid}>
        {GRUPOS_EDAD.map(g => (
          <div key={g.grupo} className={styles.edadCard}>
            <div className={styles.edadHeader}>
              <span className={styles.edadIcono} aria-hidden="true">{g.icono}</span>
              <div className={styles.edadInfo}>
                <span className={styles.edadGrupo}>{g.grupo}</span>
                <span className={styles.edadEdad}>{g.edad}</span>
              </div>
              <span className={styles.edadHoras}>{g.horasMin}-{g.horasMax}h</span>
            </div>
            <div className={styles.edadBarraContainer}>
              <div className={styles.edadBarraTrack}>
                <div
                  className={styles.edadBarraMin}
                  style={{ width: `${(g.horasMin / maxHoras) * 100}%`, background: g.color }}
                />
                <div
                  className={styles.edadBarraRango}
                  style={{
                    left: `${(g.horasMin / maxHoras) * 100}%`,
                    width: `${((g.horasMax - g.horasMin) / maxHoras) * 100}%`,
                    background: `${g.color}66`,
                  }}
                />
              </div>
            </div>
            <p className={styles.edadNota}>{g.nota}</p>
          </div>
        ))}
      </div>

      {/* Deuda de sueño */}
      <div className={styles.deudaCard}>
        <span className={styles.deudaIcono} aria-hidden="true">📉</span>
        <div>
          <h4 className={styles.deudaTitulo}>La deuda de sueño</h4>
          <p className={styles.deudaTexto}>
            Si duermes 6h en vez de 8h, acumulas <strong>2h de deuda por noche</strong>. Tras una semana,
            es como si hubieras pasado una noche entera sin dormir. La deuda de sueño crónica se asocia
            con mayor riesgo de diabetes tipo 2, enfermedades cardiovasculares y deterioro cognitivo acelerado.
            <strong> No se puede &quot;recuperar&quot; completamente durmiendo más el fin de semana.</strong>
          </p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Si necesitas una alarma para despertarte, probablemente no duermes lo suficiente.
          El <strong>test definitivo</strong>: si pudieras dormir sin alarma durante 2 semanas,
          el número de horas al que se estabiliza tu sueño es tu necesidad real.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Enemigos del sueño
// ─────────────────────────────────────────────

function SeccionEnemigos() {
  const [enemigoActivo, setEnemigoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Estos <strong>6 factores</strong> son los que más evidencia científica tienen como destructores del sueño. Cada uno incluye un medidor de impacto y un consejo basado en ciencia.</p>
      </div>

      <div className={styles.enemigosGrid}>
        {ENEMIGOS.map((e, i) => {
          const activo = enemigoActivo === i;
          return (
            <button
              key={i}
              type="button"
              className={`${styles.enemigoCard} ${activo ? styles.enemigoCardActivo : ''}`}
              onClick={() => setEnemigoActivo(activo ? null : i)}
              aria-expanded={activo}
            >
              <div className={styles.enemigoHeader}>
                <span className={styles.enemigoIcono} aria-hidden="true">{e.icono}</span>
                <div className={styles.enemigoTituloZona}>
                  <span className={styles.enemigoNombre}>{e.nombre}</span>
                  {/* Medidor de impacto */}
                  <div className={styles.impactoMedidor} aria-label={`Impacto: ${e.impacto} de 5`}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div
                        key={n}
                        className={styles.impactoBarra}
                        style={{ background: n <= e.impacto ? e.colorImpacto : 'var(--border)' }}
                      />
                    ))}
                    <span className={styles.impactoTexto}>{e.impacto}/5</span>
                  </div>
                </div>
              </div>
              <p className={styles.enemigoDesc}>{e.descripcion}</p>

              {activo && (
                <div className={styles.enemigoDetalle}>
                  <div className={styles.enemigoCienciaBox}>
                    <span className={styles.enemigoCienciaLabel}>La ciencia</span>
                    <p className={styles.enemigoCienciaTexto}>{e.ciencia}</p>
                  </div>
                  <div className={styles.enemigoConsejoBox}>
                    <span className={styles.enemigoConsejoLabel}>Consejo</span>
                    <p className={styles.enemigoConsejoTexto}>{e.consejo}</p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          El cambio más efectivo según la investigación es mantener un <strong>horario regular de sueño</strong> los 7 días
          de la semana. Es más importante que la duración: es mejor 7h regulares que 6h entre semana y 10h
          los fines de semana.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCiclosSuenoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('fases');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'fases': return <SeccionFases />;
      case 'noche': return <SeccionNoche />;
      case 'necesitas': return <SeccionNecesitas />;
      case 'enemigos': return <SeccionEnemigos />;
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
          <h1 className={styles.title}>Qué Pasa Cuando Duermes</h1>
          <p className={styles.subtitle}>La ciencia del sueño: fases, ciclos, necesidades y enemigos del descanso</p>
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
          title="Más sobre la ciencia del sueño"
          subtitle="Lo que la investigación nos dice sobre dormir"
          defaultOpen={false}
        >
          <h3>¿Por qué dormimos exactamente?</h3>
          <p>
            Tras décadas de investigación, la respuesta es &quot;para todo&quot;. El sueño repara tejidos,
            consolida memorias, procesa emociones, regula el metabolismo, fortalece el sistema inmune
            y limpia desechos del cerebro. No hay una sola función — son muchas simultáneas.
          </p>

          <h3>El reloj circadiano</h3>
          <p>
            Tu cerebro tiene un reloj interno (núcleo supraquiasmático) sincronizado con la luz solar.
            Produce melatonina cuando oscurece y cortisol al amanecer. Este ritmo de ~24 horas regula
            no solo el sueño, sino la temperatura corporal, el apetito y la presión arterial.
          </p>

          <h3>¿Qué son los sueños lúcidos?</h3>
          <p>
            El 55% de las personas ha tenido al menos un sueño lúcido (saber que estás soñando mientras sueñas).
            Ocurren durante el REM. Se pueden entrenar con técnicas como preguntarse &quot;¿estoy soñando?&quot;
            varias veces al día para crear el hábito también durante el sueño.
          </p>

          <h3>El cerebro se limpia mientras duermes</h3>
          <p>
            El sistema glinfático elimina proteínas tóxicas (beta-amiloide) durante el sueño profundo.
            Es hasta 10 veces más activo que durante la vigilia. La acumulación de estas proteínas
            se asocia con el desarrollo del Alzheimer, lo que podría explicar por qué la privación
            crónica de sueño es un factor de riesgo para esta enfermedad.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador tiene fines educativos y divulgativos. Los datos de
            porcentajes y duraciones son promedios poblacionales que varían entre individuos. Si tienes
            problemas crónicos de sueño (insomnio, apnea, narcolepsia), consulta a un profesional
            médico especialista en medicina del sueño.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ciclos-sueno')} />
        <ShareCard appName="visualizador-ciclos-sueno" />
        <Footer appName="visualizador-ciclos-sueno" />
      </div>
    </>
  );
}
