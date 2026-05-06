'use client';

import React, { useState, useCallback } from 'react';
import styles from './PlanificadorTurnosCuidadores.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

/* ─── Tipos ─── */
interface Cuidador {
  id: string;
  nombre: string;
  color: string;
}

type TurnoId = 'manana' | 'tarde' | 'noche';
type DiaId = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

interface Turno {
  id: TurnoId;
  label: string;
  horario: string;
  horas: number;
}

interface Dia {
  id: DiaId;
  label: string;
}

/* Clave para el mapa de asignaciones */
type CeldaKey = `${DiaId}-${TurnoId}`;

/* ─── Constantes ─── */
const COLORES_CUIDADORES = [
  '#2E86AB', '#48A9A6', '#E07A5F', '#81B29A',
  '#F2CC8F', '#9B5DE5', '#F15BB5', '#00BBF9',
];

const TURNOS: Turno[] = [
  { id: 'manana', label: 'Mañana', horario: '8:00–14:00', horas: 6 },
  { id: 'tarde', label: 'Tarde', horario: '14:00–20:00', horas: 6 },
  { id: 'noche', label: 'Noche', horario: '20:00–8:00', horas: 12 },
];

const DIAS: Dia[] = [
  { id: 'lun', label: 'Lunes' },
  { id: 'mar', label: 'Martes' },
  { id: 'mie', label: 'Miércoles' },
  { id: 'jue', label: 'Jueves' },
  { id: 'vie', label: 'Viernes' },
  { id: 'sab', label: 'Sábado' },
  { id: 'dom', label: 'Domingo' },
];

const TOTAL_HORAS_SEMANA = DIAS.length * TURNOS.reduce((s, t) => s + t.horas, 0); // 168

export default function PlanificadorTurnosCuidadoresPage() {
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [asignaciones, setAsignaciones] = useState<Partial<Record<CeldaKey, string>>>({});

  /* ─── Gestión de cuidadores ─── */
  const agregarCuidador = useCallback(() => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    if (cuidadores.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) return;
    if (cuidadores.length >= COLORES_CUIDADORES.length) return;

    setCuidadores(prev => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        nombre,
        color: COLORES_CUIDADORES[prev.length % COLORES_CUIDADORES.length],
      },
    ]);
    setNuevoNombre('');
  }, [nuevoNombre, cuidadores]);

  const eliminarCuidador = useCallback((id: string) => {
    setCuidadores(prev => prev.filter(c => c.id !== id));
    setAsignaciones(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next) as CeldaKey[]) {
        if (next[key] === id) delete next[key];
      }
      return next;
    });
  }, []);

  /* ─── Asignar turno ─── */
  const asignarTurno = useCallback((dia: DiaId, turno: TurnoId, cuidadorId: string) => {
    const key: CeldaKey = `${dia}-${turno}`;
    setAsignaciones(prev => {
      const next = { ...prev };
      if (cuidadorId === '') {
        delete next[key];
      } else {
        next[key] = cuidadorId;
      }
      return next;
    });
  }, []);

  /* ─── Resumen de horas ─── */
  const horasPorCuidador = cuidadores.map(c => {
    let horas = 0;
    for (const key of Object.keys(asignaciones) as CeldaKey[]) {
      if (asignaciones[key] === c.id) {
        const turnoId = key.split('-')[1] as TurnoId;
        const turno = TURNOS.find(t => t.id === turnoId);
        if (turno) horas += turno.horas;
      }
    }
    return { ...c, horas };
  });

  const horasCubiertas = horasPorCuidador.reduce((s, c) => s + c.horas, 0);
  const horasDescubiertas = TOTAL_HORAS_SEMANA - horasCubiertas;
  const maxHoras = Math.max(...horasPorCuidador.map(c => c.horas), 1);
  const minHorasAsignadas = horasPorCuidador.length > 0
    ? Math.min(...horasPorCuidador.map(c => c.horas))
    : 0;
  const maxHorasAsignadas = horasPorCuidador.length > 0
    ? Math.max(...horasPorCuidador.map(c => c.horas))
    : 0;
  const hayDesbalance = minHorasAsignadas > 0 && maxHorasAsignadas > minHorasAsignadas * 1.3;

  /* ─── Limpiar todo ─── */
  const limpiarTodo = useCallback(() => {
    setCuidadores([]);
    setAsignaciones({});
    setNuevoNombre('');
  }, []);

  /* ─── Buscar cuidador por id ─── */
  const getCuidador = (id: string): Cuidador | undefined =>
    cuidadores.find(c => c.id === id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">📅</span> Planificador de Turnos de Cuidadores
          </h1>
          <p className={styles.subtitle}>
            Organiza los turnos de cuidado entre familiares con un calendario semanal visual
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        {/* Disclaimer */}
        <DisclaimerCard variant="general" severity="high">
          <span>
            Esta herramienta es una <strong>ayuda organizativa</strong>. No sustituye la valoración
            profesional de las necesidades de cuidado ni el asesoramiento de los Servicios Sociales
            sobre la atención adecuada.
          </span>
        </DisclaimerCard>

        {/* Paso 1: Cuidadores */}
        <section className={styles.card} aria-labelledby="paso1-heading">
          <h2 id="paso1-heading" className={styles.cardTitle}>
            <span aria-hidden="true">👥</span> Paso 1: Añadir cuidadores
          </h2>
          <p className={styles.cardDesc}>
            Añade a las personas que participan en el cuidado (máximo {COLORES_CUIDADORES.length}).
          </p>

          <div className={styles.addRow}>
            <input
              type="text"
              className={styles.input}
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') agregarCuidador(); }}
              placeholder="Nombre del cuidador"
              aria-label="Nombre del cuidador"
              maxLength={30}
            />
            <button
              className={styles.btnPrimary}
              onClick={agregarCuidador}
              disabled={!nuevoNombre.trim() || cuidadores.length >= COLORES_CUIDADORES.length}
              aria-label="Añadir cuidador"
            >
              Añadir
            </button>
          </div>

          {cuidadores.length > 0 && (
            <ul className={styles.cuidadorList} aria-label="Lista de cuidadores">
              {cuidadores.map(c => (
                <li key={c.id} className={styles.cuidadorItem}>
                  <span
                    className={styles.cuidadorColor}
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.cuidadorNombre}>{c.nombre}</span>
                  <button
                    className={styles.btnRemove}
                    onClick={() => eliminarCuidador(c.id)}
                    aria-label={`Eliminar a ${c.nombre}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Paso 2: Calendario semanal */}
        {cuidadores.length > 0 && (
          <section className={styles.card} aria-labelledby="paso2-heading">
            <h2 id="paso2-heading" className={styles.cardTitle}>
              <span aria-hidden="true">📆</span> Paso 2: Asignar turnos
            </h2>
            <p className={styles.cardDesc}>
              Selecciona un cuidador para cada turno del día.
            </p>

            {/* Vista escritorio: tabla */}
            <div className={styles.calendarGrid} role="grid" aria-label="Calendario semanal de turnos">
              {/* Cabecera */}
              <div className={`${styles.gridCell} ${styles.gridHeader} ${styles.gridCorner}`} role="columnheader">
                Turno
              </div>
              {DIAS.map(dia => (
                <div key={dia.id} className={`${styles.gridCell} ${styles.gridHeader}`} role="columnheader">
                  {dia.label}
                </div>
              ))}

              {/* Filas de turnos */}
              {TURNOS.map(turno => (
                <React.Fragment key={turno.id}>
                  <div className={`${styles.gridCell} ${styles.gridRowHeader}`} role="rowheader">
                    <strong>{turno.label}</strong>
                    <span className={styles.horarioLabel}>{turno.horario}</span>
                  </div>
                  {DIAS.map(dia => {
                    const key: CeldaKey = `${dia.id}-${turno.id}`;
                    const asignado = asignaciones[key];
                    const cuidador = asignado ? getCuidador(asignado) : undefined;

                    return (
                      <div
                        key={key}
                        className={styles.gridCell}
                        style={cuidador ? { borderLeft: `4px solid ${cuidador.color}` } : undefined}
                      >
                        <select
                          className={styles.turnoSelect}
                          value={asignado || ''}
                          onChange={e => asignarTurno(dia.id, turno.id, e.target.value)}
                          aria-label={`${dia.label} ${turno.label}: asignar cuidador`}
                        >
                          <option value="">— Sin asignar —</option>
                          {cuidadores.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                        {cuidador && (
                          <span
                            className={styles.asignadoTag}
                            style={{ backgroundColor: cuidador.color }}
                          >
                            {cuidador.nombre}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Vista móvil: cards */}
            <div className={styles.calendarMobile} aria-label="Calendario semanal de turnos (vista móvil)">
              {DIAS.map(dia => (
                <div key={dia.id} className={styles.mobileDay}>
                  <h3 className={styles.mobileDayTitle}>{dia.label}</h3>
                  {TURNOS.map(turno => {
                    const key: CeldaKey = `${dia.id}-${turno.id}`;
                    const asignado = asignaciones[key];
                    const cuidador = asignado ? getCuidador(asignado) : undefined;

                    return (
                      <div
                        key={key}
                        className={styles.mobileShift}
                        style={cuidador ? { borderLeft: `4px solid ${cuidador.color}` } : undefined}
                      >
                        <div className={styles.mobileShiftLabel}>
                          <strong>{turno.label}</strong>
                          <span className={styles.horarioLabel}>{turno.horario}</span>
                        </div>
                        <select
                          className={styles.turnoSelect}
                          value={asignado || ''}
                          onChange={e => asignarTurno(dia.id, turno.id, e.target.value)}
                          aria-label={`${dia.label} ${turno.label}: asignar cuidador`}
                        >
                          <option value="">— Sin asignar —</option>
                          {cuidadores.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Paso 3: Resumen */}
        {cuidadores.length > 0 && (
          <section className={styles.card} aria-labelledby="paso3-heading">
            <h2 id="paso3-heading" className={styles.cardTitle}>
              <span aria-hidden="true">📊</span> Paso 3: Resumen de horas
            </h2>

            {/* Barras de horas */}
            <div className={styles.barsContainer} aria-label="Horas por cuidador">
              {horasPorCuidador.map(c => (
                <div key={c.id} className={styles.barRow}>
                  <span className={styles.barLabel}>{c.nombre}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${(c.horas / maxHoras) * 100}%`,
                        backgroundColor: c.color,
                      }}
                      role="progressbar"
                      aria-valuenow={c.horas}
                      aria-valuemin={0}
                      aria-valuemax={TOTAL_HORAS_SEMANA}
                      aria-label={`${c.nombre}: ${c.horas} horas`}
                    />
                  </div>
                  <span className={styles.barValue}>{c.horas}h</span>
                </div>
              ))}
            </div>

            {/* Indicadores */}
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Horas cubiertas</span>
                <span className={styles.summaryValue}>{horasCubiertas}h / {TOTAL_HORAS_SEMANA}h</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Horas sin cubrir</span>
                <span className={`${styles.summaryValue} ${horasDescubiertas > 0 ? styles.uncovered : ''}`}>
                  {horasDescubiertas}h
                </span>
              </div>
            </div>

            {hayDesbalance && (
              <div className={styles.alertBox} role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span> <strong>Desbalance detectado:</strong> hay más de un 30% de diferencia entre
                el cuidador con más horas ({maxHorasAsignadas}h) y el de menos ({minHorasAsignadas}h).
                Considera redistribuir los turnos.
              </div>
            )}

            <button
              className={styles.btnDanger}
              onClick={limpiarTodo}
              aria-label="Limpiar todo y empezar de nuevo"
            >
              Limpiar todo
            </button>
          </section>
        )}

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 Guía de organización del cuidado familiar"
          subtitle="Consejos, recursos y señales de alerta para cuidadores"
        >
          {/* Comparativa */}
          <section className={styles.guideSection}>
            <h2>Cuidador familiar vs. cuidador profesional</h2>
            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Cuidador familiar</th>
                    <th>Cuidador profesional</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Coste</td>
                    <td>Sin coste directo (pero coste de oportunidad)</td>
                    <td>900–1.500 €/mes (según horas y zona)</td>
                  </tr>
                  <tr>
                    <td>Vínculo emocional</td>
                    <td>Alto, puede ser positivo y agotador</td>
                    <td>Profesional, con distancia terapéutica</td>
                  </tr>
                  <tr>
                    <td>Formación</td>
                    <td>Normalmente autodidacta</td>
                    <td>Certificado de profesionalidad</td>
                  </tr>
                  <tr>
                    <td>Disponibilidad</td>
                    <td>Flexible, pero sin descanso pactado</td>
                    <td>Horario definido y sustituible</td>
                  </tr>
                  <tr>
                    <td>Riesgo de burnout</td>
                    <td>Alto si no hay relevos</td>
                    <td>Bajo si se respetan turnos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Casos de uso */}
          <section className={styles.guideSection}>
            <h2>Situaciones frecuentes</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">🏠</span> Padre mayor que vive solo</h3>
                <p>
                  Tres hermanos se turnan: uno cubre mañanas entre semana, otro las tardes y el
                  tercero los fines de semana. Un cuadrante claro evita malentendidos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">🧑‍🦽</span> Persona con dependencia severa</h3>
                <p>
                  Necesita cobertura 24 h. Combinar familiares con cuidador profesional nocturno
                  y usar el planificador para coordinar las franjas libres.
                </p>
              </div>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">👶</span> Cuidado compartido tras divorcio</h3>
                <p>
                  Organizar semanas alternas o turnos partidos con abuelos. Documentar las
                  asignaciones reduce conflictos y facilita la conciliación.
                </p>
              </div>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">🩺</span> Postoperatorio o convalecencia</h3>
                <p>
                  Cuidado temporal intensivo: familiares y amigos cubren turnos cortos durante
                  2-4 semanas. Un calendario compartido evita lagunas.
                </p>
              </div>
            </div>
          </section>

          {/* Señales de burnout */}
          <section className={styles.guideSection}>
            <h2>Señales de agotamiento del cuidador (burnout)</h2>
            <div className={styles.warningBox}>
              <p><strong>Presta atención si experimentas alguno de estos síntomas:</strong></p>
              <ul>
                <li>Cansancio constante que no mejora con descanso</li>
                <li>Irritabilidad o cambios de humor frecuentes</li>
                <li>Aislamiento social progresivo</li>
                <li>Descuido de tu propia salud (citas médicas, alimentación)</li>
                <li>Sentimiento de culpa permanente o sensación de no hacer suficiente</li>
                <li>Problemas de sueño o dolores físicos crónicos</li>
              </ul>
              <p>
                Si te identificas con varios puntos, <strong>busca ayuda</strong>. Los Servicios
                Sociales municipales ofrecen programas de respiro familiar, ayuda a domicilio y
                grupos de apoyo gratuitos.
              </p>
            </div>
          </section>

          {/* Consejos */}
          <section className={styles.guideSection}>
            <h2>Consejos para organizar los turnos</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">📋</span> Reparto equitativo</h3>
                <p>Distribuye las horas de forma justa teniendo en cuenta la disponibilidad real de cada persona. Los turnos nocturnos pesan más: compénsalos.</p>
              </div>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">🔄</span> Rotación regular</h3>
                <p>Rota los turnos semanalmente para que nadie se quede siempre con la noche o el fin de semana. La variedad reduce el agotamiento.</p>
              </div>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">📞</span> Comunicación abierta</h3>
                <p>Crea un grupo de mensajería para cambios de última hora. Establece reglas: avisar con 24 h de antelación si no se puede cubrir un turno.</p>
              </div>
              <div className={styles.tipCard}>
                <h3><span aria-hidden="true">💆</span> Descanso obligatorio</h3>
                <p>Programa al menos un día libre completo por semana para cada cuidador. El respiro no es un lujo, es una necesidad.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <details className={styles.faqItem}>
              <summary>¿Cuántas horas de cuidado puede asumir un familiar sin riesgo de burnout?</summary>
              <p>
                Los estudios recomiendan no superar 20-25 horas semanales de cuidado directo por persona.
                Si la persona dependiente necesita atención continua, es fundamental contar con varios
                cuidadores o apoyo profesional.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué ayudas públicas existen para cuidadores familiares en España?</summary>
              <p>
                La Ley de Dependencia contempla prestaciones económicas para cuidadores no profesionales,
                servicio de ayuda a domicilio, centros de día y programas de respiro. Solicita la
                valoración de dependencia en los Servicios Sociales de tu municipio.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo gestionar conflictos entre familiares sobre los turnos?</summary>
              <p>
                Estableced reglas por escrito desde el principio: horas mínimas por persona, protocolo
                de cambios y un responsable que coordine. Si hay conflicto, un mediador familiar
                profesional puede ayudar.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Es obligatorio cotizar por un cuidador familiar?</summary>
              <p>
                Si estás dado de alta como cuidador no profesional en la Seguridad Social (convenio
                especial tras reconocimiento de dependencia), el Estado asume parte de la cotización.
                Consulta con tu trabajador social.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué es el test de Zarit y para qué sirve?</summary>
              <p>
                La Escala de Sobrecarga del Cuidador de Zarit mide el nivel de agotamiento. Si
                obtienes puntuación alta, es señal de que necesitas más apoyo.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo combinar cuidado familiar con profesional?</summary>
              <p>
                Sí, es lo más recomendable en dependencia moderada-severa. Los profesionales cubren
                los turnos más exigentes (noches, higiene) y la familia aporta compañía y
                acompañamiento emocional.
              </p>
            </details>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('planificador-turnos-cuidadores')} />
        <ShareCard appName="planificador-turnos-cuidadores" />
        <Footer appName="planificador-turnos-cuidadores" />
      </div>
    </>
  );
}
