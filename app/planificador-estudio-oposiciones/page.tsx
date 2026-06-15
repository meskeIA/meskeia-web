'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorEstudioOposiciones.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SemanaEstudio {
  semana: number;
  temasNuevos: number[];
  repasos: number[];
}

// ─── Lógica de planificación ──────────────────────────────────────────────────

function generarPlan(
  totalTemas: number,
  semanasDisponibles: number,
  diasEstudioSemana: number,
  incluirRepasos: boolean,
): SemanaEstudio[] {
  const plan: SemanaEstudio[] = [];

  if (totalTemas <= 0 || semanasDisponibles <= 0 || diasEstudioSemana <= 0) return plan;

  // Reservar ~25% de semanas finales para repasos si hay margen
  const semanasRepaso = incluirRepasos ? Math.max(1, Math.floor(semanasDisponibles * 0.2)) : 0;
  const semanasEstudio = semanasDisponibles - semanasRepaso;

  if (semanasEstudio <= 0) return plan;

  // Distribuir temas en semanas de estudio
  const temasBase = Math.floor(totalTemas / semanasEstudio);
  const temasExtra = totalTemas % semanasEstudio;

  let temaActual = 1;

  for (let s = 0; s < semanasEstudio; s++) {
    const temasSemana = temasBase + (s < temasExtra ? 1 : 0);
    const temasNuevos: number[] = [];
    for (let t = 0; t < temasSemana; t++) {
      temasNuevos.push(temaActual);
      temaActual++;
    }

    // Repasos espaciados: repasar temas de hace 2 y 4 semanas
    const repasos: number[] = [];
    if (incluirRepasos) {
      if (s >= 2 && plan[s - 2]) {
        repasos.push(...plan[s - 2].temasNuevos);
      }
      if (s >= 4 && plan[s - 4]) {
        repasos.push(...plan[s - 4].temasNuevos);
      }
    }

    plan.push({ semana: s + 1, temasNuevos, repasos });
  }

  // Semanas de repaso final: repasar todos los temas repartidos
  if (semanasRepaso > 0) {
    const todosTemas = Array.from({ length: totalTemas }, (_, i) => i + 1);
    const temasPorSemanaRepaso = Math.ceil(totalTemas / semanasRepaso);

    for (let r = 0; r < semanasRepaso; r++) {
      const inicio = r * temasPorSemanaRepaso;
      const repasos = todosTemas.slice(inicio, inicio + temasPorSemanaRepaso);
      plan.push({
        semana: semanasEstudio + r + 1,
        temasNuevos: [],
        repasos,
      });
    }
  }

  return plan;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PlanificadorEstudioOposicionesPage() {
  const [totalTemas, setTotalTemas] = useState('');
  const [semanasDisponibles, setSemanasDisponibles] = useState('');
  const [diasEstudio, setDiasEstudio] = useState('5');
  const [incluirRepasos, setIncluirRepasos] = useState(true);
  const [generado, setGenerado] = useState(false);

  const plan = useMemo(() => {
    if (!generado) return [];
    return generarPlan(
      parseInt(totalTemas) || 0,
      parseInt(semanasDisponibles) || 0,
      parseInt(diasEstudio) || 5,
      incluirRepasos,
    );
  }, [generado, totalTemas, semanasDisponibles, diasEstudio, incluirRepasos]);

  const temas = parseInt(totalTemas) || 0;
  const semanas = parseInt(semanasDisponibles) || 0;
  const semanasEstudio = plan.filter(s => s.temasNuevos.length > 0).length;
  const semanasRepaso = plan.length - semanasEstudio;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">📅</span>
          <h1 className={styles.title}>Planificador de Estudio para Oposiciones</h1>
          <p className={styles.subtitle}>
            Distribuye tu temario en semanas, con repasos espaciados y progreso visual
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="educational" severity="medium" context="planificador-estudio-oposiciones" />

        {/* ── Configuración ── */}
        <div className={styles.configSection}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Configura tu plan</h2>

            <div className={styles.configGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="temas">N.º total de temas</label>
                <input id="temas" type="text" inputMode="numeric" className={styles.input} placeholder="Ej: 60" value={totalTemas} onChange={e => { setTotalTemas(e.target.value); setGenerado(false); }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="semanas">Semanas disponibles</label>
                <input id="semanas" type="text" inputMode="numeric" className={styles.input} placeholder="Ej: 24" value={semanasDisponibles} onChange={e => { setSemanasDisponibles(e.target.value); setGenerado(false); }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="dias">Días de estudio/semana</label>
                <select id="dias" className={styles.select} value={diasEstudio} onChange={e => { setDiasEstudio(e.target.value); setGenerado(false); }}>
                  <option value="3">3 días</option>
                  <option value="4">4 días</option>
                  <option value="5">5 días</option>
                  <option value="6">6 días</option>
                  <option value="7">7 días</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Repasos espaciados</label>
                <div className={styles.switchRow}>
                  <button type="button" className={`${styles.switchBtn} ${incluirRepasos ? styles.switchActivo : ''}`} onClick={() => { setIncluirRepasos(true); setGenerado(false); }}>Sí (recomendado)</button>
                  <button type="button" className={`${styles.switchBtn} ${!incluirRepasos ? styles.switchActivo : ''}`} onClick={() => { setIncluirRepasos(false); setGenerado(false); }}>No</button>
                </div>
              </div>
            </div>

            <button type="button" className={styles.btn} onClick={() => setGenerado(true)} disabled={temas <= 0 || semanas <= 0}>
              Generar plan de estudio
            </button>
          </div>
        </div>

        {/* ── Plan generado ── */}
        {generado && plan.length > 0 && (
          <>
            {/* Resumen */}
            <div className={styles.resumenSection}>
              <div className={styles.resumenGrid}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenIcono} aria-hidden="true">📚</span>
                  <div className={styles.resumenValor}>{temas}</div>
                  <div className={styles.resumenLabel}>temas</div>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenIcono} aria-hidden="true">📅</span>
                  <div className={styles.resumenValor}>{semanasEstudio}</div>
                  <div className={styles.resumenLabel}>semanas estudio</div>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenIcono} aria-hidden="true">🔄</span>
                  <div className={styles.resumenValor}>{semanasRepaso}</div>
                  <div className={styles.resumenLabel}>semanas repaso</div>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenIcono} aria-hidden="true">📖</span>
                  <div className={styles.resumenValor}>
                    {semanasEstudio > 0 ? (temas / semanasEstudio).toFixed(1) : '—'}
                  </div>
                  <div className={styles.resumenLabel}>temas/semana</div>
                </div>
              </div>
            </div>

            {/* Tabla del plan */}
            <div className={styles.planSection}>
              <h2 className={styles.seccionTitulo}>Tu plan semana a semana</h2>
              <div className={styles.planGrid}>
                {plan.map(s => (
                  <div
                    key={s.semana}
                    className={`${styles.semanaCard} ${s.temasNuevos.length === 0 ? styles.semanaRepaso : ''}`}
                  >
                    <div className={styles.semanaHeader}>
                      <span className={styles.semanaBadge}>
                        Semana {s.semana}
                      </span>
                      {s.temasNuevos.length === 0 && (
                        <span className={styles.repasoTag}>Repaso general</span>
                      )}
                    </div>

                    {s.temasNuevos.length > 0 && (
                      <div className={styles.semanaBloque}>
                        <span className={styles.bloqueLabel}>Temas nuevos:</span>
                        <span className={styles.bloqueValor}>
                          {s.temasNuevos.length === 1
                            ? `Tema ${s.temasNuevos[0]}`
                            : `Temas ${s.temasNuevos[0]}–${s.temasNuevos[s.temasNuevos.length - 1]}`}
                        </span>
                      </div>
                    )}

                    {s.repasos.length > 0 && (
                      <div className={styles.semanaBloque}>
                        <span className={styles.bloqueLabel}>
                          {s.temasNuevos.length === 0 ? 'Repasar:' : 'Repasos:'}
                        </span>
                        <span className={styles.bloqueRepasos}>
                          {s.repasos.length <= 6
                            ? s.repasos.map(t => `T${t}`).join(', ')
                            : `Temas ${s.repasos[0]}–${s.repasos[s.repasos.length - 1]} (${s.repasos.length} temas)`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <EducationalSection
          title="📚 Técnicas de estudio para opositores"
          subtitle="Métodos probados para maximizar tu rendimiento"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué repasos espaciados?</h2>
            <p>
              La <strong>curva del olvido</strong> (Ebbinghaus) muestra que olvidamos el 70% de lo estudiado
              en 24 horas si no repasamos. Los repasos espaciados (2 semanas y 4 semanas después)
              consolidan la memoria a largo plazo y son la técnica más eficaz demostrada por la ciencia.
            </p>

            <div className={styles.tecnicasGrid}>
              <div className={styles.tecnicaCard}>
                <span className={styles.tecnicaIcono} aria-hidden="true">🔄</span>
                <strong>Repaso espaciado</strong>
                <p>Repasar a intervalos crecientes: 1 día, 3 días, 1 semana, 2 semanas, 1 mes</p>
              </div>
              <div className={styles.tecnicaCard}>
                <span className={styles.tecnicaIcono} aria-hidden="true">📝</span>
                <strong>Recuerdo activo</strong>
                <p>No releas: intenta recordar antes de mirar. Usa tarjetas o tests para practicar</p>
              </div>
              <div className={styles.tecnicaCard}>
                <span className={styles.tecnicaIcono} aria-hidden="true">🧩</span>
                <strong>Intercalado</strong>
                <p>Mezcla temas diferentes en una misma sesión. Mejora la capacidad de discriminación</p>
              </div>
              <div className={styles.tecnicaCard}>
                <span className={styles.tecnicaIcono} aria-hidden="true">⏰</span>
                <strong>Pomodoro</strong>
                <p>Estudia 25 min + 5 min descanso. Cada 4 ciclos, descanso largo de 15-30 min</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Cuántas horas al día debería estudiar?</summary>
                <p>Depende de tu situación personal, pero la mayoría de opositores exitosos estudian entre 4 y 8 horas diarias de estudio efectivo (sin distracciones). Más importante que la cantidad es la constancia y la calidad de la sesión.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Es mejor estudiar por la mañana o por la noche?</summary>
                <p>Cada persona tiene su ritmo. Lo importante es que el horario sea sostenible a largo plazo. La mayoría rinde mejor por la mañana para material nuevo y por la tarde para repasos.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Debo descansar un día completo a la semana?</summary>
                <p>Sí, es muy recomendable. El descanso es parte del aprendizaje: tu cerebro consolida lo estudiado mientras descansas. Estudiar 7 días sin parar lleva al agotamiento y reduce el rendimiento.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">💡</span>
                <strong>Consejos clave</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Este planificador es organizativo: adapta siempre el ritmo a tu situación personal</li>
                <li>No te obsesiones con cumplir el plan al 100% — ajústalo si es necesario</li>
                <li>La constancia importa más que la intensidad: mejor estudiar 5h cada día que 12h dos días</li>
                <li>Consulta la convocatoria oficial para conocer el temario exacto y la fecha de examen</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('planificador-estudio-oposiciones')} />
        <ShareCard appName="planificador-estudio-oposiciones" />
        <Footer appName="planificador-estudio-oposiciones" />
    </div>
  );
}
