'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './PlanificadorRutinas.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// Tipos
// ============================================

interface Tarea {
  id: string;
  emoji: string;
  nombre: string;
  duracion: number; // minutos, 0 = sin tiempo
  completada: boolean;
}

interface Rutina {
  id: string;
  nombre: string;
  tareas: Tarea[];
  creadaEn: string;
}

// ============================================
// Datos por defecto
// ============================================

const EMOJIS_FRECUENTES = [
  '☀️','🌙','🛏️','🚿','🪥','👕','👗','🍳','🥣','🥛','☕','🧃',
  '🎒','🚌','🏫','✏️','📚','🍎','🥪','💊','🏃','🚶','🚴',
  '🛁','🧹','🍽️','🍲','🥗','🎮','📺','📱','📖','🎨','🎵',
  '🧩','🐕','🐈','🌳','🛒','💊','🩺','😴','🙏','❤️','⭐',
];

const RUTINA_EJEMPLO: Rutina = {
  id: 'ejemplo',
  nombre: 'Mañana',
  creadaEn: new Date().toISOString(),
  tareas: [
    { id: '1', emoji: '⏰', nombre: 'Levantarse', duracion: 5, completada: false },
    { id: '2', emoji: '🚿', nombre: 'Ducharse', duracion: 10, completada: false },
    { id: '3', emoji: '👕', nombre: 'Vestirse', duracion: 10, completada: false },
    { id: '4', emoji: '🥣', nombre: 'Desayunar', duracion: 15, completada: false },
    { id: '5', emoji: '🎒', nombre: 'Preparar mochila', duracion: 5, completada: false },
    { id: '6', emoji: '🚌', nombre: 'Salir de casa', duracion: 0, completada: false },
  ],
};

const STORAGE_KEY = 'meskeia-rutinas-v1';

// ============================================
// Utilidades
// ============================================

const generarId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const cargarRutinas = (): Rutina[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Rutina[];
  } catch { /* ignorar */ }
  return [RUTINA_EJEMPLO];
};

const guardarRutinas = (rutinas: Rutina[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rutinas)); } catch { /* ignorar */ }
};

// ============================================
// Componente principal
// ============================================

type Vista = 'lista' | 'editor' | 'seguir';

export default function PlanificadorRutinasPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [rutinaActiva, setRutinaActiva] = useState<Rutina | null>(null);
  const [vista, setVista] = useState<Vista>('lista');
  const [tareaActualIdx, setTareaActualIdx] = useState(0);

  // Editor
  const [nombreRutina, setNombreRutina] = useState('');
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevoEmoji, setNuevoEmoji] = useState('⭐');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDuracion, setNuevaDuracion] = useState(0);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<'nueva' | string>('nueva'); // 'nueva' o id de rutina

  // Cargar desde localStorage
  useEffect(() => {
    setRutinas(cargarRutinas());
  }, []);

  // Guardar cuando cambian las rutinas
  useEffect(() => {
    if (rutinas.length > 0) guardarRutinas(rutinas);
  }, [rutinas]);

  // ——— EDITOR ———

  const abrirNuevaRutina = () => {
    setNombreRutina('Nueva rutina');
    setTareas([]);
    setNuevoEmoji('⭐');
    setNuevoNombre('');
    setNuevaDuracion(0);
    setModoEdicion('nueva');
    setVista('editor');
  };

  const abrirEditorRutina = (rutina: Rutina) => {
    setNombreRutina(rutina.nombre);
    setTareas(rutina.tareas.map(t => ({ ...t, completada: false })));
    setNuevoEmoji('⭐');
    setNuevoNombre('');
    setNuevaDuracion(0);
    setModoEdicion(rutina.id);
    setVista('editor');
  };

  const agregarTarea = () => {
    if (!nuevoNombre.trim()) return;
    const nueva: Tarea = {
      id: generarId(),
      emoji: nuevoEmoji,
      nombre: nuevoNombre.trim(),
      duracion: nuevaDuracion,
      completada: false,
    };
    setTareas(prev => [...prev, nueva]);
    setNuevoNombre('');
    setNuevaDuracion(0);
    setMostrarPicker(false);
  };

  const eliminarTarea = (id: string) => {
    setTareas(prev => prev.filter(t => t.id !== id));
  };

  const moverTarea = (idx: number, dir: 'arriba' | 'abajo') => {
    setTareas(prev => {
      const arr = [...prev];
      const destino = dir === 'arriba' ? idx - 1 : idx + 1;
      if (destino < 0 || destino >= arr.length) return arr;
      [arr[idx], arr[destino]] = [arr[destino], arr[idx]];
      return arr;
    });
  };

  const guardarRutina = () => {
    if (!nombreRutina.trim() || tareas.length === 0) return;
    if (modoEdicion === 'nueva') {
      const nueva: Rutina = {
        id: generarId(),
        nombre: nombreRutina.trim(),
        tareas: tareas.map(t => ({ ...t, completada: false })),
        creadaEn: new Date().toISOString(),
      };
      setRutinas(prev => [...prev, nueva]);
    } else {
      setRutinas(prev => prev.map(r =>
        r.id === modoEdicion
          ? { ...r, nombre: nombreRutina.trim(), tareas: tareas.map(t => ({ ...t, completada: false })) }
          : r
      ));
    }
    setVista('lista');
  };

  const eliminarRutina = (id: string) => {
    setRutinas(prev => prev.filter(r => r.id !== id));
  };

  // ——— MODO SEGUIR ———

  const iniciarRutina = (rutina: Rutina) => {
    setRutinaActiva({
      ...rutina,
      tareas: rutina.tareas.map(t => ({ ...t, completada: false })),
    });
    setTareaActualIdx(0);
    setVista('seguir');
  };

  const marcarCompletada = useCallback(() => {
    if (!rutinaActiva) return;

    // Tono de éxito
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignorar */ }

    setRutinaActiva(prev => {
      if (!prev) return prev;
      const nuevasTareas = prev.tareas.map((t, i) =>
        i === tareaActualIdx ? { ...t, completada: true } : t
      );
      return { ...prev, tareas: nuevasTareas };
    });

    const siguienteIdx = tareaActualIdx + 1;
    if (siguienteIdx < rutinaActiva.tareas.length) {
      setTareaActualIdx(siguienteIdx);
    } else {
      setTareaActualIdx(rutinaActiva.tareas.length); // Fin
    }
  }, [rutinaActiva, tareaActualIdx]);

  const rutinaTerminada = rutinaActiva && tareaActualIdx >= rutinaActiva.tareas.length;
  const tareasCompletadas = rutinaActiva?.tareas.filter(t => t.completada).length ?? 0;
  const totalTareas = rutinaActiva?.tareas.length ?? 0;

  // ============================================
  // RENDER
  // ============================================

  // ——— VISTA: SEGUIR RUTINA ———
  if (vista === 'seguir' && rutinaActiva) {
    const tareaActual = rutinaActiva.tareas[tareaActualIdx];

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Barra de progreso */}
        <div className={styles.progresoTop}>
          <div
            className={styles.progresoTopBar}
            style={{ width: `${(tareasCompletadas / totalTareas) * 100}%` }}
          />
        </div>

        <div className={styles.seguirWrapper}>
          {rutinaTerminada ? (
            // ——— FIN DE RUTINA ———
            <div className={styles.finRutina}>
              <div className={styles.finEmoji}>🎉</div>
              <h2 className={styles.finTitulo}>¡Rutina completada!</h2>
              <p className={styles.finSubtitulo}>Has completado todas las tareas de <strong>{rutinaActiva.nombre}</strong></p>
              <div className={styles.finAcciones}>
                <button
                  className={styles.btnFinPrimario}
                  onClick={() => iniciarRutina(rutinaActiva)}
                >
                  🔄 Repetir rutina
                </button>
                <button
                  className={styles.btnFinSecundario}
                  onClick={() => setVista('lista')}
                >
                  ↩ Volver al inicio
                </button>
              </div>
            </div>
          ) : (
            // ——— TAREA ACTUAL ———
            <>
              <div className={styles.rutinaHeader}>
                <span className={styles.rutinaHeaderNombre}>{rutinaActiva.nombre}</span>
                <span className={styles.rutinaHeaderProgreso}>{tareasCompletadas + 1} / {totalTareas}</span>
              </div>

              {/* Tarea actual — grande y clara */}
              <div className={styles.tareaActualCard}>
                <div className={styles.tareaActualEmoji} aria-hidden="true">{tareaActual.emoji}</div>
                <div className={styles.tareaActualNombre}>{tareaActual.nombre}</div>
                {tareaActual.duracion > 0 && (
                  <div className={styles.tareaActualDuracion}>⏱️ {tareaActual.duracion} min</div>
                )}
              </div>

              {/* Próxima tarea */}
              {tareaActualIdx + 1 < totalTareas && (
                <div className={styles.proximaTarea} aria-label="Próxima tarea">
                  <span className={styles.proximaLabel}>Después:</span>
                  <span className={styles.proximaEmoji}>{rutinaActiva.tareas[tareaActualIdx + 1].emoji}</span>
                  <span className={styles.proximaNombre}>{rutinaActiva.tareas[tareaActualIdx + 1].nombre}</span>
                </div>
              )}

              {/* Botón principal: HECHO */}
              <button
                className={styles.btnHecho}
                onClick={marcarCompletada}
                aria-label="Marcar tarea como completada"
              >
                ✓ ¡HECHO!
              </button>

              {/* Lista de tareas */}
              <div className={styles.listaTareasSeguir}>
                {rutinaActiva.tareas.map((t, i) => (
                  <div
                    key={t.id}
                    className={`${styles.tareaItemSeguir} ${t.completada ? styles.tareaCompletada : ''} ${i === tareaActualIdx ? styles.tareaEnCurso : ''}`}
                  >
                    <span className={styles.tareaItemEmoji}>{t.emoji}</span>
                    <span className={styles.tareaItemNombreSeguir}>{t.nombre}</span>
                    {t.completada && <span className={styles.tareaCheck} aria-hidden="true">✓</span>}
                    {i === tareaActualIdx && <span className={styles.tareaFlecha} aria-hidden="true">◀</span>}
                  </div>
                ))}
              </div>

              <button
                className={styles.btnSalir}
                onClick={() => setVista('lista')}
                aria-label="Salir del modo seguir rutina"
              >
                ✕ Salir
              </button>
            </>
          )}
        </div>

        <Footer appName="planificador-rutinas" />
      </div>
    );
  }

  // ——— VISTA: EDITOR ———
  if (vista === 'editor') {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <div className={styles.editorWrapper}>
          <div className={styles.editorHeader}>
            <button className={styles.btnVolver} onClick={() => setVista('lista')}>
              ← Volver
            </button>
            <h2 className={styles.editorTitulo}>
              {modoEdicion === 'nueva' ? 'Nueva rutina' : 'Editar rutina'}
            </h2>
          </div>

          {/* Nombre de la rutina */}
          <div className={styles.campoNombre}>
            <label className={styles.campoLabel} htmlFor="nombre-rutina">Nombre de la rutina</label>
            <input
              id="nombre-rutina"
              className={styles.inputNombre}
              type="text"
              value={nombreRutina}
              onChange={e => setNombreRutina(e.target.value)}
              placeholder="Ej: Mañana, Tarde, Noche..."
              maxLength={40}
            />
          </div>

          {/* Lista de tareas */}
          <div className={styles.tareasList}>
            <h3 className={styles.tareasListTitulo}>Tareas ({tareas.length})</h3>
            {tareas.length === 0 && (
              <p className={styles.tareasVacias}>Añade la primera tarea abajo ↓</p>
            )}
            {tareas.map((t, idx) => (
              <div key={t.id} className={styles.tareaEditorItem}>
                <span className={styles.tareaEditorEmoji}>{t.emoji}</span>
                <div className={styles.tareaEditorInfo}>
                  <span className={styles.tareaEditorNombre}>{t.nombre}</span>
                  {t.duracion > 0 && (
                    <span className={styles.tareaEditorDur}>{t.duracion} min</span>
                  )}
                </div>
                <div className={styles.tareaEditorAcciones}>
                  <button
                    className={styles.btnOrden}
                    onClick={() => moverTarea(idx, 'arriba')}
                    disabled={idx === 0}
                    aria-label="Mover arriba"
                  >▲</button>
                  <button
                    className={styles.btnOrden}
                    onClick={() => moverTarea(idx, 'abajo')}
                    disabled={idx === tareas.length - 1}
                    aria-label="Mover abajo"
                  >▼</button>
                  <button
                    className={styles.btnEliminarTarea}
                    onClick={() => eliminarTarea(t.id)}
                    aria-label={`Eliminar tarea ${t.nombre}`}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario nueva tarea */}
          <div className={styles.nuevaTareaForm}>
            <h3 className={styles.nuevaTareaTitulo}>Añadir tarea</h3>

            {/* Selector de emoji */}
            <div className={styles.emojiSelector}>
              <button
                className={styles.btnEmojiActual}
                onClick={() => setMostrarPicker(p => !p)}
                aria-label={`Emoji seleccionado: ${nuevoEmoji}. Pulsa para cambiar`}
                aria-expanded={mostrarPicker}
              >
                {nuevoEmoji}
              </button>
              {mostrarPicker && (
                <div className={styles.emojiPicker} role="listbox" aria-label="Seleccionar emoji">
                  {EMOJIS_FRECUENTES.map(e => (
                    <button
                      key={e}
                      className={`${styles.emojiOpcion} ${e === nuevoEmoji ? styles.emojiOpcionActiva : ''}`}
                      onClick={() => { setNuevoEmoji(e); setMostrarPicker(false); }}
                      role="option"
                      aria-selected={e === nuevoEmoji}
                      aria-label={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.nuevaTareaInputs}>
              <div className={styles.inputGrupo}>
                <label className={styles.campoLabel} htmlFor="nueva-tarea-nombre">Nombre de la tarea</label>
                <input
                  id="nueva-tarea-nombre"
                  className={styles.inputTarea}
                  type="text"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') agregarTarea(); }}
                  placeholder="Ej: Lavarse los dientes"
                  maxLength={50}
                />
              </div>
              <div className={styles.inputGrupo}>
                <label className={styles.campoLabel} htmlFor="nueva-tarea-dur">Duración (min, opcional)</label>
                <input
                  id="nueva-tarea-dur"
                  className={styles.inputDuracion}
                  type="number"
                  min={0}
                  max={120}
                  value={nuevaDuracion === 0 ? '' : nuevaDuracion}
                  onChange={e => setNuevaDuracion(Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <button
              className={styles.btnAgregarTarea}
              onClick={agregarTarea}
              disabled={!nuevoNombre.trim()}
            >
              + Añadir tarea
            </button>
          </div>

          {/* Guardar rutina */}
          <button
            className={styles.btnGuardarRutina}
            onClick={guardarRutina}
            disabled={!nombreRutina.trim() || tareas.length === 0}
          >
            💾 Guardar rutina
          </button>
        </div>

        <Footer appName="planificador-rutinas" />
      </div>
    );
  }

  // ——— VISTA: LISTA DE RUTINAS ———
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📅 Planificador Visual de Rutinas</h1>
        <p className={styles.subtitle}>
          Crea rutinas con pictogramas y sigue el paso a paso del día.
          Ideal para autismo, TDAH y estructuración de hábitos.
        </p>
      </header>

      <LegalNotice />

      {/* Lista de rutinas */}
      <section className={styles.rutinasSección} aria-label="Mis rutinas">
        <div className={styles.rutinasSectionHeader}>
          <h2 className={styles.seccionTitulo}>Mis rutinas</h2>
          <button
            className={styles.btnNuevaRutina}
            onClick={abrirNuevaRutina}
            aria-label="Crear nueva rutina"
          >
            + Nueva rutina
          </button>
        </div>

        {rutinas.length === 0 && (
          <div className={styles.sinRutinas}>
            <div className={styles.sinRutinasEmoji}>📋</div>
            <p>Aún no tienes rutinas. ¡Crea la primera!</p>
          </div>
        )}

        <div className={styles.rutinasGrid}>
          {rutinas.map(rutina => (
            <div key={rutina.id} className={styles.rutinaCard}>
              <div className={styles.rutinaCardHeader}>
                <h3 className={styles.rutinaCardNombre}>{rutina.nombre}</h3>
                <span className={styles.rutinaCardCount}>{rutina.tareas.length} tareas</span>
              </div>

              {/* Preview de las primeras tareas */}
              <div className={styles.rutinaCardPreview} aria-label="Tareas de la rutina">
                {rutina.tareas.slice(0, 6).map(t => (
                  <span key={t.id} className={styles.previewEmoji} title={t.nombre} aria-label={t.nombre}>
                    {t.emoji}
                  </span>
                ))}
                {rutina.tareas.length > 6 && (
                  <span className={styles.previewMas}>+{rutina.tareas.length - 6}</span>
                )}
              </div>

              <div className={styles.rutinaCardAcciones}>
                <button
                  className={styles.btnIniciarRutina}
                  onClick={() => iniciarRutina(rutina)}
                  aria-label={`Iniciar rutina ${rutina.nombre}`}
                >
                  ▶ Iniciar
                </button>
                <button
                  className={styles.btnEditarRutina}
                  onClick={() => abrirEditorRutina(rutina)}
                  aria-label={`Editar rutina ${rutina.nombre}`}
                >
                  ✏️ Editar
                </button>
                <button
                  className={styles.btnEliminarRutina}
                  onClick={() => eliminarRutina(rutina.id)}
                  aria-label={`Eliminar rutina ${rutina.nombre}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="📚 Sobre el apoyo visual en rutinas"
        subtitle="Beneficios de las agendas visuales para el día a día"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Por qué funcionan las rutinas visuales?</h2>
          <p>
            Las agendas visuales reducen la ansiedad ante lo desconocido y facilitan la
            autonomía. Al ver representada la secuencia del día con pictogramas, el cerebro
            anticipa lo que viene y procesa la información de forma más efectiva que con
            instrucciones verbales.
          </p>

          <h2>¿A quién beneficia?</h2>
          <ul>
            <li><strong>Personas con autismo (TEA)</strong>: Las rutinas visuales son una herramienta central en la intervención, reduciendo meltdowns y fomentando la independencia.</li>
            <li><strong>TDAH</strong>: Externalizar la secuencia de tareas libera la memoria de trabajo y reduce el olvido de pasos.</li>
            <li><strong>Discapacidad intelectual</strong>: Apoya la autonomía en actividades de la vida diaria (AVD) sin depender de instrucciones verbales continuas.</li>
            <li><strong>Demencias leves</strong>: Estructurar el día con pictogramas reduce la confusión temporal.</li>
            <li><strong>Niños pequeños</strong>: Cualquier niño se beneficia de anticipar la secuencia del día.</li>
          </ul>

          <h2>Consejos para crear buenas rutinas</h2>
          <ul>
            <li>Empieza con <strong>pocas tareas</strong> (4-6) y añade más cuando la rutina esté consolidada</li>
            <li>Elige emojis que la persona reconozca fácilmente y asocie con la actividad</li>
            <li>Incluye tiempos orientativos para gestionar mejor las transiciones</li>
            <li>Celebra cada tarea completada — el tono de éxito refuerza la conducta</li>
            <li>Crea rutinas separadas para mañana, tarde y noche</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-rutinas')} />
      <Footer appName="planificador-rutinas" />
    </div>
  );
}
