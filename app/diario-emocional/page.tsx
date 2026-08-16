'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './DiarioEmocional.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Emocion {
  id: string;
  emoji: string;
  label: string;
  color: string;
  nivel: number; // 1 (muy mal) a 5 (muy bien)
}

interface EntradaDiario {
  fecha: string; // YYYY-MM-DD
  emocionId: string;
  nota: string;
  hora: string;
}

const EMOCIONES: Emocion[] = [
  { id: 'muy_bien', emoji: '😄', label: 'Muy bien', color: '#27AE60', nivel: 5 },
  { id: 'bien', emoji: '🙂', label: 'Bien', color: '#2E86AB', nivel: 4 },
  { id: 'normal', emoji: '😐', label: 'Normal', color: '#F39C12', nivel: 3 },
  { id: 'mal', emoji: '😔', label: 'Mal', color: '#E67E22', nivel: 2 },
  { id: 'muy_mal', emoji: '😢', label: 'Muy mal', color: '#E74C3C', nivel: 1 },
];

const STORAGE_KEY = 'meskeia_diario_emocional';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFechaCorta(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${dias[d.getDay()]} ${d.getDate()}`;
}

function formatFechaLarga(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
}

// `base` es la fecha de hoy en formato YYYY-MM-DD, y llega vacía hasta que el componente
// monta: en el servidor no se puede saber qué día es para quien visita (ver fechaHoy).
function getUltimos7Dias(base: string): string[] {
  if (!base) return [];
  const dias: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base + 'T12:00:00');
    d.setDate(d.getDate() - i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
}

function getUltimos30Dias(base: string): string[] {
  if (!base) return [];
  const dias: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base + 'T12:00:00');
    d.setDate(d.getDate() - i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DiarioEmocionalPage() {
  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [guardado, setGuardado] = useState(false);

  // Qué día es hoy. No puede calcularse durante el render: el HTML estático se genera una vez
  // en el build y el cliente lo evalúa el día de la visita, así que las fechas no coincidían y
  // React descartaba el árbol al hidratar (error #418). Se fija al montar, junto al resto del
  // estado que también vive en el navegador.
  const [fechaHoy, setFechaHoy] = useState('');

  // Cargar del localStorage
  useEffect(() => {
    setFechaHoy(hoy());
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntradas(JSON.parse(saved));
    } catch { /* localStorage no disponible */ }
  }, []);

  // Guardar en localStorage
  const guardar = useCallback(() => {
    if (!emocionSeleccionada) return;
    const nueva: EntradaDiario = {
      fecha: hoy(),
      emocionId: emocionSeleccionada,
      nota: nota.trim(),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    const actualizadas = [...entradas.filter(e => e.fecha !== hoy()), nueva];
    setEntradas(actualizadas);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas)); } catch { /* */ }
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }, [emocionSeleccionada, nota, entradas]);

  const entradaHoy = fechaHoy ? entradas.find(e => e.fecha === fechaHoy) : undefined;
  const ultimos7 = getUltimos7Dias(fechaHoy);
  const ultimos30 = getUltimos30Dias(fechaHoy);
  const diasRegistrados = entradas.length;

  // Estadísticas
  const entradasRecientes = entradas.filter(e => ultimos30.includes(e.fecha));
  const promedioNivel = entradasRecientes.length > 0
    ? entradasRecientes.reduce((sum, e) => {
        const emo = EMOCIONES.find(em => em.id === e.emocionId);
        return sum + (emo?.nivel || 3);
      }, 0) / entradasRecientes.length
    : 0;
  const emocionMasFrecuente = entradasRecientes.length > 0
    ? (() => {
        const conteo: Record<string, number> = {};
        entradasRecientes.forEach(e => { conteo[e.emocionId] = (conteo[e.emocionId] || 0) + 1; });
        const maxId = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0];
        return EMOCIONES.find(em => em.id === maxId);
      })()
    : null;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">📔</span>
          <h1 className={styles.title}>Diario Emocional Visual</h1>
          <p className={styles.subtitle}>
            Registra cómo te sientes cada día y descubre tus patrones emocionales
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="medical" severity="high" context="diario-emocional" />

        {/* ── Recurso de ayuda siempre visible ── */}
        <div className={styles.recursoAyuda} role="alert">
          <span aria-hidden="true">📞</span>
          <p>
            Si estás pasando por un momento difícil, <strong>no estás solo/a</strong>.
            Llama al <strong>024</strong> (Línea de Atención a la Conducta Suicida) o al
            <strong> 717 003 717</strong> (Teléfono de la Esperanza). Son gratuitos, confidenciales y 24h.
          </p>
        </div>

        {/* ── Registro de hoy ── */}
        <div className={styles.registroSection}>
          <h2 className={styles.seccionTitulo}>¿Cómo te sientes hoy?</h2>
          <p className={styles.fechaHoy}>{fechaHoy ? formatFechaLarga(fechaHoy) : ''}</p>

          <div className={styles.emocionesGrid}>
            {EMOCIONES.map(emo => (
              <button
                key={emo.id}
                type="button"
                className={`${styles.emocionBtn} ${(emocionSeleccionada || entradaHoy?.emocionId) === emo.id ? styles.emocionActiva : ''}`}
                onClick={() => { setEmocionSeleccionada(emo.id); setGuardado(false); }}
                aria-pressed={(emocionSeleccionada || entradaHoy?.emocionId) === emo.id}
                data-color={emo.id}
              >
                <span className={styles.emocionEmoji} aria-hidden="true">{emo.emoji}</span>
                <span className={styles.emocionLabel}>{emo.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.notaGroup}>
            <label className={styles.label} htmlFor="nota">¿Quieres añadir una nota? (opcional)</label>
            <textarea
              id="nota"
              className={styles.textarea}
              placeholder="¿Qué ha pasado hoy? ¿Qué te ha hecho sentir así?"
              value={nota || entradaHoy?.nota || ''}
              onChange={e => { setNota(e.target.value); setGuardado(false); }}
              rows={3}
            />
          </div>

          <button
            type="button"
            className={styles.btn}
            onClick={guardar}
            disabled={!emocionSeleccionada && !entradaHoy}
          >
            {guardado ? '✓ Guardado' : entradaHoy ? 'Actualizar registro de hoy' : 'Guardar'}
          </button>
          <p className={styles.privacidad}>
            <span aria-hidden="true">🔒</span> Tus datos se guardan solo en tu navegador. No enviamos nada a ningún servidor.
          </p>
        </div>

        {/* ── Vista semanal ── */}
        {diasRegistrados > 0 && (
          <div className={styles.semanalSection}>
            <h2 className={styles.seccionTitulo}>Última semana</h2>
            <div className={styles.semanalGrid}>
              {ultimos7.map(fecha => {
                const entrada = entradas.find(e => e.fecha === fecha);
                const emo = entrada ? EMOCIONES.find(em => em.id === entrada.emocionId) : null;
                return (
                  <div key={fecha} className={`${styles.diaCard} ${fecha === fechaHoy ? styles.diaHoy : ''}`}>
                    <span className={styles.diaLabel}>{formatFechaCorta(fecha)}</span>
                    <span className={styles.diaEmoji} aria-hidden="true">{emo ? emo.emoji : '·'}</span>
                    {entrada?.nota && <span className={styles.diaNota} title={entrada.nota}>📝</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Mapa mensual ── */}
        {diasRegistrados >= 3 && (
          <div className={styles.mensualSection}>
            <h2 className={styles.seccionTitulo}>Último mes</h2>
            <div className={styles.mensualGrid}>
              {ultimos30.map(fecha => {
                const entrada = entradas.find(e => e.fecha === fecha);
                const emo = entrada ? EMOCIONES.find(em => em.id === entrada.emocionId) : null;
                return (
                  <div
                    key={fecha}
                    className={styles.mensualCelda}
                    data-nivel={emo ? emo.id : 'vacio'}
                    title={`${formatFechaLarga(fecha)}${emo ? `: ${emo.label}` : ''}`}
                  />
                );
              })}
            </div>
            <div className={styles.leyenda}>
              {EMOCIONES.map(emo => (
                <div key={emo.id} className={styles.leyendaItem}>
                  <div className={styles.leyendaColor} data-nivel={emo.id} />
                  <span>{emo.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Estadísticas ── */}
        {entradasRecientes.length >= 3 && (
          <div className={styles.statsSection}>
            <h2 className={styles.seccionTitulo}>Tus patrones (últimos 30 días)</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcono} aria-hidden="true">📅</span>
                <div className={styles.statValor}>{entradasRecientes.length}</div>
                <div className={styles.statLabel}>días registrados</div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcono} aria-hidden="true">{emocionMasFrecuente?.emoji || '—'}</span>
                <div className={styles.statValor}>{emocionMasFrecuente?.label || '—'}</div>
                <div className={styles.statLabel}>emoción más frecuente</div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcono} aria-hidden="true">📊</span>
                <div className={styles.statValor}>{promedioNivel.toFixed(1)} / 5</div>
                <div className={styles.statLabel}>nivel promedio registrado</div>
              </div>
            </div>
          </div>
        )}

        <EducationalSection
          title="¿Por qué llevar un diario emocional?"
          subtitle="Beneficios y consejos de uso"
        >
          <section className={styles.guideSection}>
            <h2>Beneficios del registro emocional</h2>
            <p className={styles.notaIntro}>
              <strong>Nota:</strong> Las emociones no son buenas ni malas. Una semana con muchas emociones difíciles
              puede ser una respuesta sana a lo que está pasando en tu vida — el diario sirve para entenderte, no
              para puntuarte.
            </p>
            <p>
              Investigaciones en psicología sugieren que <strong>nombrar y registrar emociones</strong> (affect labeling)
              puede reducir su intensidad. Hay estudios de neuroimagen que asocian este acto a una mayor activación
              de la corteza prefrontal y menor activación de la amígdala, aunque el mecanismo exacto aún se está
              investigando.
            </p>

            <div className={styles.beneficiosGrid}>
              <div className={styles.beneficioCard}>
                <span aria-hidden="true">🔍</span>
                <strong>Autoconocimiento</strong>
                <p>Descubre qué situaciones, personas o hábitos influyen en tu estado de ánimo</p>
              </div>
              <div className={styles.beneficioCard}>
                <span aria-hidden="true">📈</span>
                <strong>Patrones</strong>
                <p>Identifica ciclos emocionales semanales o mensuales que no percibías</p>
              </div>
              <div className={styles.beneficioCard}>
                <span aria-hidden="true">💬</span>
                <strong>Comunicación</strong>
                <p>Si acudes a terapia, tu diario puede ayudar al profesional a entenderte mejor</p>
              </div>
              <div className={styles.beneficioCard}>
                <span aria-hidden="true">🧘</span>
                <strong>Regulación</strong>
                <p>Para muchas personas, registrar lo que sienten ayuda a regularse y procesar mejor lo que pasa</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Con qué frecuencia debería registrar?</summary>
                <p>Lo ideal es una vez al día, preferiblemente a la misma hora (por ejemplo, antes de dormir). Pero cualquier frecuencia es mejor que ninguna. No te presiones.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Las notas son importantes?</summary>
                <p>Mucho. El emoji te da el dato rápido, pero la nota te da el contexto. Dentro de un mes, no recordarás por qué estabas triste el martes, pero tu nota sí.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Mis datos son privados?</summary>
                <p>Sí, al 100%. Todo se guarda en el localStorage de tu navegador. No enviamos absolutamente nada a ningún servidor. Si borras los datos del navegador, se pierden.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Esta herramienta es de autoconocimiento personal — no es un instrumento clínico ni sustituye a un profesional</li>
                <li>Si te sientes mal de forma persistente, busca ayuda profesional (psicólogo, médico de cabecera)</li>
                <li>Línea 024 (conducta suicida) y 717 003 717 (Teléfono de la Esperanza): gratuitos, 24h, confidenciales</li>
                <li>No intentes autodiagnosticarte: un profesional puede ayudarte mucho más de lo que crees</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diario-emocional')} />
        <ShareCard appName="diario-emocional" />
        <Footer appName="diario-emocional" />
    </div>
  );
}
