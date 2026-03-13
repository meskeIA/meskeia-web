'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './PlanificadorRutinas.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
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

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa: formatos de agenda visual</h2>
          <p>Existen distintas formas de implementar una agenda visual. Esta tabla ayuda a elegir la más adecuada según el contexto:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Sin preparación previa</th>
                  <th>Tono de éxito</th>
                  <th>Portátil</th>
                  <th>Indicado para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>📱 Esta app (meskeIA)</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td className={styles.celdaDestacada}>Sí (audio)</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td>Uso en dispositivo propio, cambios rápidos</td>
                </tr>
                <tr>
                  <td>Tablero de pictogramas físico</td>
                  <td>No (hay que imprimirlo)</td>
                  <td>No</td>
                  <td>Sí (portátil)</td>
                  <td>Sin dispositivo, mayor durabilidad</td>
                </tr>
                <tr>
                  <td>Pizarra blanca con imanes</td>
                  <td>No (materiales)</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Entorno fijo (aula, hogar)</td>
                </tr>
                <tr>
                  <td>Apps especializadas (Routine)</td>
                  <td>No (instalar)</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Usuarios con necesidades complejas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién es este planificador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🧩</span>
              <h3>Niño con TEA en casa</h3>
              <p>La rutina visual de la mañana (levantarse, desayunar, vestirse, mochila, salir) reduce los meltdowns en transiciones. El tono de éxito al marcar cada tarea es un refuerzo positivo inmediato.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>⚡</span>
              <h3>Adulto con TDAH</h3>
              <p>Externalizar la secuencia de pasos de tareas complejas (preparar la reunión, hacer la compra) elimina la carga de recordar el siguiente paso y reduce la parálisis por decisión.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🤝</span>
              <h3>Persona con discapacidad intelectual</h3>
              <p>Una rutina visual creada por el educador o familiar permite a la persona seguir las actividades del día de forma más autónoma, sin depender de instrucciones verbales constantes.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>👩‍🏫</span>
              <h3>Educador o terapeuta ocupacional</h3>
              <p>Crear rutinas personalizadas para cada alumno en el dispositivo del centro, con los emojis que ese alumno ya conoce. El modo seguimiento permite acompañar sin intervenir constantemente.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Las rutinas se guardan si cierro la app?</dt>
              <dd>Sí. Todas las rutinas y tareas se guardan en el almacenamiento local del navegador. La próxima vez que abras la app en el mismo dispositivo y navegador, encontrarás tus rutinas guardadas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuántas rutinas puedo crear?</dt>
              <dd>No hay límite técnico. Puedes crear rutinas separadas para mañana, tarde, noche, fin de semana, tareas del cole, etc. Cada una se gestiona de forma independiente.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El tono de éxito se puede desactivar?</dt>
              <dd>Actualmente el tono se reproduce con la API de audio del navegador y no tiene opción de silencio individual. Si necesitas silencio, puedes bajar el volumen del dispositivo antes de usar el modo seguimiento.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo usar los mismos emojis que usa mi hijo en su tablero AAC?</dt>
              <dd>Sí, siempre que los emojis de tu tablero físico o sistema AAC tengan equivalente en la selección de la app. El objetivo es la coherencia visual para que el usuario relacione ambos sistemas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿La app funciona sin internet?</dt>
              <dd>Sí, una vez cargada. Los emojis son del sistema operativo y no requieren descarga. Ideal para usar en entornos sin WiFi (residencias, aulas sin conexión, viajes).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo compartir una rutina entre varios dispositivos?</dt>
              <dd>No directamente: los datos se guardan en local en cada dispositivo. Para compartir, tendrías que replicar la rutina manualmente en el otro dispositivo. Una función de exportación/importación está prevista para futuras versiones.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuántas tareas debo incluir en una rutina?</dt>
              <dd>Para usuarios con TEA o DI, empieza con 4-6 tareas. Rutinas muy largas pueden resultar abrumadoras. Una vez que la rutina esté bien interiorizada (2-3 semanas), puedes añadir más pasos gradualmente.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es adecuado para personas con demencia?</dt>
              <dd>En demencias leves, una rutina visual sencilla (4-5 tareas básicas) puede ser útil para orientar la mañana y reducir la confusión temporal. En fases moderadas o avanzadas, la supervisión de un especialista es necesaria para determinar si las agendas visuales son adecuadas.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo crear y usar tu primera rutina</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Pulsa &quot;Nueva rutina&quot;</strong>
                <p>Desde la pantalla principal, pulsa el botón + para crear una nueva rutina. Ponle un nombre descriptivo: &quot;Mañana&quot;, &quot;Tarde cole&quot;, &quot;Noche&quot;.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Elige los emojis con el usuario presente</strong>
                <p>Muestra la paleta de emojis y deja que el usuario elija el que asocia con cada actividad. Su participación en la creación mejora la aceptación de la rutina.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Añade las tareas en orden</strong>
                <p>Empieza con pocas tareas (4-6). Puedes reordenarlas con los botones ▲▼. Añade tiempos orientativos si la rutina tiene pasos con duración variable.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Guarda la rutina</strong>
                <p>Pulsa Guardar y vuelve a la pantalla principal. La rutina estará disponible inmediatamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Activa el modo &quot;Seguir rutina&quot;</strong>
                <p>Pulsa el botón ▶ junto a la rutina. Aparecerá la primera tarea en grande. Muestra la pantalla al usuario.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Pulsa ✓ HECHO cuando complete cada tarea</strong>
                <p>El tono de éxito confirma la acción y la app pasa automáticamente a la siguiente tarea. Deja que el usuario pulse el botón siempre que sea posible para fomentar su autonomía.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Celebra al terminar</strong>
                <p>Al completar todas las tareas, la pantalla muestra un mensaje de fin de rutina. Refuerza verbalmente el logro antes de iniciar la siguiente actividad.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para una agenda visual efectiva</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>✏️</span>
              <p><strong>Crea la rutina con el usuario, no para el usuario.</strong> Su participación en la elección de emojis y el orden de tareas aumenta significativamente la aceptación y el seguimiento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🔄</span>
              <p><strong>Anticipa los cambios con tiempo.</strong> Si la rutina va a ser diferente (visita al médico, salida especial), avísalo antes con la propia app: muestra las tareas del día distinto con antelación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📏</span>
              <p><strong>Mantén la rutina estable al principio.</strong> Cambia el orden de las tareas solo cuando la rutina original está bien interiorizada. Los cambios frecuentes reducen la seguridad que la agenda visual proporciona.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📲</span>
              <p><strong>Asigna un dispositivo fijo para la app.</strong> Usar siempre el mismo tablet o móvil reduce la variable de aprender el dispositivo y permite que el usuario anticipe el ritual de consultar la agenda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🎵</span>
              <p><strong>El tono de éxito importa.</strong> El sonido de confirmación es un refuerzo positivo. Asegúrate de que el volumen sea audible pero no molesto. En entornos de grupo, considera bajar el volumen para no distraer a otros.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>👥</span>
              <p><strong>Informa a todo el equipo.</strong> Que familia, profesores y terapeutas usen la misma rutina y el mismo lenguaje en torno a ella (los mismos nombres de tareas) refuerza la consistencia y acelera el aprendizaje.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Errores comunes en la implementación de rutinas visuales</h3>
            <ul>
              <li><strong>Crear rutinas demasiado largas desde el inicio:</strong> más de 8-10 tareas puede resultar abrumador para usuarios con TEA o DI. Empieza siempre con pocas tareas y amplía gradualmente cuando la rutina corta esté consolidada.</li>
              <li><strong>Cambiar los emojis sin avisar:</strong> para muchos usuarios con TEA, el emoji específico es parte de la rutina. Cambiar 🥛 por 🍼 para representar el desayuno puede generar confusión o rechazo. Si necesitas cambiar un emoji, hazlo de forma gradual y explicada.</li>
              <li><strong>No dejar tiempo suficiente entre tareas:</strong> las personas con TEA o DI pueden necesitar más tiempo para completar cada paso. Una rutina ajustada al tiempo del adulto puede generar estrés en lugar de reducirlo.</li>
              <li><strong>Usar la app como castigo o presión:</strong> &quot;Si no pulsas HECHO, no salimos&quot; convierte una herramienta de apoyo en una fuente de estrés. La agenda visual debe asociarse con seguridad y autonomía, nunca con control o castigo.</li>
              <li><strong>Borrar las rutinas guardadas accidentalmente:</strong> si vas a dejar que el usuario use el dispositivo de forma autónoma, considera restringir el acceso al modo editor. Los datos se guardan localmente y si se borran, hay que volver a crearlos.</li>
              <li><strong>Esta app no es un sistema de gestión conductual:</strong> el planificador visual apoya las rutinas, pero no reemplaza un plan de intervención conductual diseñado por un especialista (psicólogo, terapeuta ocupacional, educador especial).</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-rutinas')} />
      <ShareCard appName="planificador-rutinas" />
      <Footer appName="planificador-rutinas" />
    </div>
  );
}
