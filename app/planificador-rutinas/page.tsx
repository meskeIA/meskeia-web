'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeyboardEvent as EventoTeclado } from 'react';
import styles from './PlanificadorRutinas.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { enfocarALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import { PREGUNTA_CUANTAS_TAREAS } from './metadata';

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
  '🧩','🐕','🐈','🌳','🛒','🩺','😴','🙏','❤️','⭐',
];

/** Duración de una tarea: minutos enteros entre 0 y 120, lo que declara el campo (min y max). */
const acotarDuracion = (valor: string): number => {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 0;
  return Math.min(120, Math.max(0, Math.round(n)));
};

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

/** Lo que dura el aviso «Deshacer» tras borrar una rutina, sin contar el rato que tiene el foco */
const SEGUNDOS_DESHACER = 8;

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
  const [cargado, setCargado] = useState(false);

  // Borrar una rutina deja unos segundos «Deshacer» (hallazgo 5294; decidido por el usuario el
  // 20/11/2026, cabo C0853): no frena a quien borra a propósito y salva el toque accidental. El
  // plazo no corre mientras «Deshacer» tiene el foco, para que con teclado no desaparezca bajo él.
  const [borrada, setBorrada] = useState<{ rutina: Rutina; indice: number } | null>(null);
  const [deshacerConFoco, setDeshacerConFoco] = useState(false);
  const deshacerRef = useRef<HTMLButtonElement>(null);

  // Las tres vistas son ramas del mismo componente: al pasar de una a otra el control pulsado
  // desaparece (el foco caía a <body>) y la vista nueva heredaba el desplazamiento de la anterior
  // (en móvil, la tarea actual quedaba por encima de la pantalla). Cada cambio deja aquí a qué
  // elemento va el foco, y el efecto de abajo lo enfoca y lo trae a la vista tras pintar.
  const focoPendiente = useRef<(() => HTMLElement | null) | null>(null);
  const pedirFoco = (destino: () => HTMLElement | null) => { focoPendiente.current = destino; };
  const tareaCardRef = useRef<HTMLDivElement>(null);
  const finTituloRef = useRef<HTMLHeadingElement>(null);
  const editorTituloRef = useRef<HTMLHeadingElement>(null);
  const misRutinasRef = useRef<HTMLHeadingElement>(null);
  const tareasTituloRef = useRef<HTMLHeadingElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const nuevoNombreRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  // El 2.º toque de una ráfaga caía sobre ¡HECHO! en la tarea siguiente y la marcaba sin verla
  const marcarCambioPantalla = useGuardaRafaga();

  useEffect(() => {
    const destino = focoPendiente.current;
    if (!destino) return;
    focoPendiente.current = null;
    enfocarALaVista(destino());
  });

  useEffect(() => {
    if (!borrada || deshacerConFoco) return;
    const plazo = window.setTimeout(() => setBorrada(null), SEGUNDOS_DESHACER * 1000);
    return () => window.clearTimeout(plazo);
  }, [borrada, deshacerConFoco]);

  // Al salir de la lista, el aviso se retira: «Deshacer» deja de estar montado y su blur no llega
  const olvidarBorrado = () => {
    setBorrada(null);
    setDeshacerConFoco(false);
  };

  // Cargar desde localStorage
  useEffect(() => {
    setRutinas(cargarRutinas());
    setCargado(true);
  }, []);

  // Guardar cuando cambian las rutinas, también la lista vacía (antes solo con length > 0,
  // y la última rutina borrada volvía al recargar)
  useEffect(() => {
    if (cargado) guardarRutinas(rutinas);
  }, [rutinas, cargado]);

  const irALista = (enfocar?: () => HTMLElement | null) => {
    marcarCambioPantalla();
    setVista('lista');
    pedirFoco(enfocar ?? (() => misRutinasRef.current));
  };

  // ——— EDITOR ———

  const abrirNuevaRutina = () => {
    olvidarBorrado();
    setNombreRutina('Nueva rutina');
    setTareas([]);
    setNuevoEmoji('⭐');
    setNuevoNombre('');
    setNuevaDuracion(0);
    setModoEdicion('nueva');
    marcarCambioPantalla();
    setVista('editor');
    pedirFoco(() => editorTituloRef.current);
  };

  const abrirEditorRutina = (rutina: Rutina) => {
    olvidarBorrado();
    setNombreRutina(rutina.nombre);
    setTareas(rutina.tareas.map(t => ({ ...t, completada: false })));
    setNuevoEmoji('⭐');
    setNuevoNombre('');
    setNuevaDuracion(0);
    setModoEdicion(rutina.id);
    marcarCambioPantalla();
    setVista('editor');
    pedirFoco(() => editorTituloRef.current);
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
    // «+ Añadir tarea» se deshabilita con el nombre vacío: el foco vuelve al campo del nombre
    pedirFoco(() => nuevoNombreRef.current);
  };

  const eliminarTarea = (id: string) => {
    setTareas(prev => prev.filter(t => t.id !== id));
    pedirFoco(() => tareasTituloRef.current);
  };

  const moverTarea = (idx: number, dir: 'arriba' | 'abajo') => {
    const id = tareas[idx]?.id;
    setTareas(prev => {
      const arr = [...prev];
      const destino = dir === 'arriba' ? idx - 1 : idx + 1;
      if (destino < 0 || destino >= arr.length) return arr;
      [arr[idx], arr[destino]] = [arr[destino], arr[idx]];
      return arr;
    });
    // El foco sigue a la tarea movida; si su botón se deshabilita (llegó al extremo), al otro
    pedirFoco(() => {
      const item = document.querySelector(`[data-tarea-id="${id}"]`);
      const mismo = item?.querySelector<HTMLButtonElement>(`button[data-dir="${dir}"]`);
      if (mismo && !mismo.disabled) return mismo;
      return item?.querySelector<HTMLButtonElement>('button[data-dir]:not(:disabled)') ?? null;
    });
  };

  const guardarRutina = () => {
    if (!nombreRutina.trim() || tareas.length === 0) return;
    let idGuardada = modoEdicion;
    if (modoEdicion === 'nueva') {
      const nueva: Rutina = {
        id: generarId(),
        nombre: nombreRutina.trim(),
        tareas: tareas.map(t => ({ ...t, completada: false })),
        creadaEn: new Date().toISOString(),
      };
      idGuardada = nueva.id;
      setRutinas(prev => [...prev, nueva]);
    } else {
      setRutinas(prev => prev.map(r =>
        r.id === modoEdicion
          ? { ...r, nombre: nombreRutina.trim(), tareas: tareas.map(t => ({ ...t, completada: false })) }
          : r
      ));
    }
    // La tarjeta recién guardada, a la vista y con el foco en su nombre
    irALista(() => document.querySelector<HTMLElement>(`[data-rutina-id="${idGuardada}"] h3`));
  };

  const eliminarRutina = (id: string) => {
    const indice = rutinas.findIndex(r => r.id === id);
    if (indice < 0) return;
    setBorrada({ rutina: rutinas[indice], indice });
    setRutinas(prev => prev.filter(r => r.id !== id));
    pedirFoco(() => deshacerRef.current);
  };

  const deshacerBorrado = () => {
    if (!borrada) return;
    const { rutina, indice } = borrada;
    setRutinas(prev => {
      const copia = [...prev];
      copia.splice(Math.min(indice, copia.length), 0, rutina);
      return copia;
    });
    olvidarBorrado();
    // La tarjeta recuperada, en su sitio, a la vista y con el foco en su nombre
    pedirFoco(() => document.querySelector<HTMLElement>(`[data-rutina-id="${rutina.id}"] h3`));
  };

  // ——— MODO SEGUIR ———

  const iniciarRutina = (rutina: Rutina) => {
    olvidarBorrado();
    setRutinaActiva({
      ...rutina,
      tareas: rutina.tareas.map(t => ({ ...t, completada: false })),
    });
    setTareaActualIdx(0);
    marcarCambioPantalla();
    setVista('seguir');
    pedirFoco(() => tareaCardRef.current);
  };

  // ——— SELECTOR DE EMOJI ———

  const elegirEmoji = (e: string) => {
    setNuevoEmoji(e);
    setMostrarPicker(false);
    pedirFoco(() => emojiBtnRef.current);
  };

  /** Flechas, Inicio y Fin recorren las opciones del listbox; Escape lo cierra. */
  const teclaEnPicker = (e: EventoTeclado<HTMLDivElement>) => {
    const opciones = Array.from(pickerRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const actual = opciones.indexOf(document.activeElement as HTMLButtonElement);
    let destino = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') destino = Math.min(opciones.length - 1, actual + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') destino = Math.max(0, actual - 1);
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = opciones.length - 1;
    else if (e.key === 'Escape') {
      e.preventDefault();
      setMostrarPicker(false);
      pedirFoco(() => emojiBtnRef.current);
      return;
    } else return;
    e.preventDefault();
    opciones[destino]?.focus();
  };

  const marcarCompletada = useCallback(() => {
    if (!rutinaActiva) return;
    marcarCambioPantalla();

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
      // Un contexto por tono: se cierra al acabar, o se acumulan uno por tarea completada (C0038).
      osc.onended = () => { ctx.close().catch(() => {}); };
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
      // ¡HECHO! desaparece con la última tarea: el foco va al título del fin de rutina
      focoPendiente.current = () => finTituloRef.current;
    }
  }, [rutinaActiva, tareaActualIdx, marcarCambioPantalla]);

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
            <div className={styles.finRutina} role="status" aria-live="polite">
              <div className={styles.finEmoji} aria-hidden="true">🎉</div>
              <h2 className={styles.finTitulo} ref={finTituloRef} tabIndex={-1}>¡Rutina completada!</h2>
              <p className={styles.finSubtitulo}>Has completado todas las tareas de <strong>{rutinaActiva.nombre}</strong></p>
              <div className={styles.finAcciones}>
                <button
                  type="button"
                  className={styles.btnFinPrimario}
                  onClick={() => iniciarRutina(rutinaActiva)}
                >
                  <span aria-hidden="true">🔄</span> Repetir rutina
                </button>
                <button
                  type="button"
                  className={styles.btnFinSecundario}
                  onClick={() => irALista()}
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

              {/* Tarea actual — grande y clara. Región viva: al pulsar ¡HECHO! el foco se queda en
                  el botón y esto anuncia la tarea nueva */}
              <div
                className={styles.tareaActualCard}
                ref={tareaCardRef}
                tabIndex={-1}
                aria-live="polite"
                aria-atomic="true"
              >
                <div className={styles.tareaActualEmoji} aria-hidden="true">{tareaActual.emoji}</div>
                <h2 className={styles.tareaActualNombre}>{tareaActual.nombre}</h2>
                {tareaActual.duracion > 0 && (
                  <div className={styles.tareaActualDuracion}><span aria-hidden="true">⏱️</span> {tareaActual.duracion} min</div>
                )}
              </div>

              {/* Próxima tarea */}
              {tareaActualIdx + 1 < totalTareas && (
                <div className={styles.proximaTarea} aria-label="Próxima tarea">
                  <span className={styles.proximaLabel}>Después:</span>
                  <span className={styles.proximaEmoji} aria-hidden="true">{rutinaActiva.tareas[tareaActualIdx + 1].emoji}</span>
                  <span className={styles.proximaNombre}>{rutinaActiva.tareas[tareaActualIdx + 1].nombre}</span>
                </div>
              )}

              {/* Botón principal: HECHO */}
              <button
                type="button"
                className={styles.btnHecho}
                onClick={marcarCompletada}
              >
                {/* Sin aria-label: el nombre accesible es lo que se ve (WCAG 2.5.3) */}
                <span aria-hidden="true">✓</span> ¡HECHO!
              </button>

              {/* Puntos de progreso — menos ruido visual para usuarios con DI/TEA */}
              <div
                className={styles.progresoPuntos}
                role="progressbar"
                aria-label={`Tarea ${tareasCompletadas + 1} de ${totalTareas}`}
                aria-valuemin={0}
                aria-valuemax={totalTareas}
                aria-valuenow={tareasCompletadas}
                aria-valuetext={`${tareasCompletadas} de ${totalTareas} tareas hechas`}
              >
                {rutinaActiva.tareas.map((t, i) => (
                  <div
                    key={t.id}
                    className={`${styles.progresoPunto} ${t.completada ? styles.puntoCompletado : ''} ${i === tareaActualIdx ? styles.puntoActual : ''}`}
                    title={t.nombre}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <button
                type="button"
                className={styles.btnSalir}
                onClick={() => irALista()}
                aria-label="Salir del modo seguir rutina"
              >
                <span aria-hidden="true">✕</span> Salir
              </button>
            </>
          )}
        </div>

        <Footer key="pie" appName="planificador-rutinas" />
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
            <button type="button" className={styles.btnVolver} onClick={() => irALista()}>
              ← Volver
            </button>
            <h2 className={styles.editorTitulo} ref={editorTituloRef} tabIndex={-1}>
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
            <h3 className={styles.tareasListTitulo} ref={tareasTituloRef} tabIndex={-1}>Tareas ({tareas.length})</h3>
            {tareas.length === 0 && (
              <p className={styles.tareasVacias}>Añade la primera tarea abajo ↓</p>
            )}
            {tareas.map((t, idx) => (
              <div key={t.id} className={styles.tareaEditorItem} data-tarea-id={t.id}>
                <span className={styles.tareaEditorEmoji} aria-hidden="true">{t.emoji}</span>
                <div className={styles.tareaEditorInfo}>
                  <span className={styles.tareaEditorNombre}>{t.nombre}</span>
                  {t.duracion > 0 && (
                    <span className={styles.tareaEditorDur}>{t.duracion} min</span>
                  )}
                </div>
                <div className={styles.tareaEditorAcciones}>
                  <button
                    type="button"
                    className={styles.btnOrden}
                    onClick={() => moverTarea(idx, 'arriba')}
                    disabled={idx === 0}
                    data-dir="arriba"
                    aria-label="Mover arriba"
                  >▲</button>
                  <button
                    type="button"
                    className={styles.btnOrden}
                    onClick={() => moverTarea(idx, 'abajo')}
                    disabled={idx === tareas.length - 1}
                    data-dir="abajo"
                    aria-label="Mover abajo"
                  >▼</button>
                  <button
                    type="button"
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
                type="button"
                ref={emojiBtnRef}
                className={styles.btnEmojiActual}
                onClick={() => setMostrarPicker(p => !p)}
                aria-label={`Emoji seleccionado: ${nuevoEmoji}. Pulsa para cambiar`}
                aria-expanded={mostrarPicker}
              >
                {nuevoEmoji}
              </button>
              {mostrarPicker && (
                <div
                  className={styles.emojiPicker}
                  role="listbox"
                  aria-label="Seleccionar emoji"
                  ref={pickerRef}
                  onKeyDown={teclaEnPicker}
                >
                  {EMOJIS_FRECUENTES.map(e => (
                    <button
                      type="button"
                      key={e}
                      className={`${styles.emojiOpcion} ${e === nuevoEmoji ? styles.emojiOpcionActiva : ''}`}
                      onClick={() => elegirEmoji(e)}
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
                  ref={nuevoNombreRef}
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
                  step={1}
                  onChange={e => setNuevaDuracion(acotarDuracion(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="button"
              className={styles.btnAgregarTarea}
              onClick={agregarTarea}
              disabled={!nuevoNombre.trim()}
            >
              + Añadir tarea
            </button>
          </div>

          {/* Guardar rutina */}
          <button
            type="button"
            className={styles.btnGuardarRutina}
            onClick={guardarRutina}
            disabled={!nombreRutina.trim() || tareas.length === 0}
          >
            <span aria-hidden="true">💾</span> Guardar rutina
          </button>
        </div>

        <Footer key="pie" appName="planificador-rutinas" />
      </div>
    );
  }

  // ——— VISTA: LISTA DE RUTINAS ———
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📅</span> Planificador Visual de Rutinas</h1>
        <p className={styles.subtitle}>
          Crea rutinas con pictogramas y sigue el paso a paso del día.
          Ideal para autismo, TDAH y estructuración de hábitos.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="general" severity="high" context="planificador-rutinas">
        Este planificador visual es un <strong>apoyo para la organización de rutinas</strong>. No sustituye la intervención de educadores especiales, terapeutas ocupacionales ni psicólogos especializados en TEA, TDAH o discapacidad cognitiva.
      </DisclaimerCard>

      {/* Lista de rutinas */}
      <section className={styles.rutinasSección} aria-label="Mis rutinas">
        <div className={styles.rutinasSectionHeader}>
          <h2 className={styles.seccionTitulo} ref={misRutinasRef} tabIndex={-1}>Mis rutinas</h2>
          <button
            type="button"
            className={styles.btnNuevaRutina}
            onClick={abrirNuevaRutina}
            aria-label="Crear nueva rutina"
          >
            + Nueva rutina
          </button>
        </div>

        {rutinas.length === 0 && (
          <div className={styles.sinRutinas}>
            <div className={styles.sinRutinasEmoji} aria-hidden="true">📋</div>
            <p>Aún no tienes rutinas. ¡Crea la primera!</p>
          </div>
        )}

        {/* Región viva siempre montada: el aviso entra y sale dentro de ella */}
        <div role="status" aria-live="polite">
          {borrada && (
            <p className={styles.avisoBorrado}>
              <span>Rutina «{borrada.rutina.nombre}» borrada.</span>
              <button
                type="button"
                ref={deshacerRef}
                className={styles.btnDeshacer}
                onClick={deshacerBorrado}
                onFocus={() => setDeshacerConFoco(true)}
                onBlur={() => setDeshacerConFoco(false)}
              >
                Deshacer
              </button>
            </p>
          )}
        </div>

        <div className={styles.rutinasGrid}>
          {rutinas.map(rutina => (
            <div key={rutina.id} className={styles.rutinaCard} data-rutina-id={rutina.id}>
              <div className={styles.rutinaCardHeader}>
                <h3 className={styles.rutinaCardNombre} tabIndex={-1}>{rutina.nombre}</h3>
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
                  type="button"
                  className={styles.btnIniciarRutina}
                  onClick={() => iniciarRutina(rutina)}
                  aria-label={`Iniciar rutina ${rutina.nombre}`}
                >
                  <span aria-hidden="true">▶</span> Iniciar
                </button>
                <button
                  type="button"
                  className={styles.btnEditarRutina}
                  onClick={() => abrirEditorRutina(rutina)}
                  aria-label={`Editar rutina ${rutina.nombre}`}
                >
                  <span aria-hidden="true">✏️</span> Editar
                </button>
                <button
                  type="button"
                  className={styles.btnEliminarRutina}
                  onClick={() => eliminarRutina(rutina.id)}
                  aria-label={`Eliminar rutina ${rutina.nombre}`}
                >
                  <span aria-hidden="true">🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="Sobre el apoyo visual en rutinas"
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
                  <td><span aria-hidden="true">📱</span> Esta app (meskeIA)</td>
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
              <span aria-hidden="true" className={styles.escenarioIcono}>🧩</span>
              <h3>Niño con TEA en casa</h3>
              <p>La rutina visual de la mañana (levantarse, desayunar, vestirse, mochila, salir) reduce los meltdowns en transiciones. El tono de éxito al marcar cada tarea es un refuerzo positivo inmediato.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>⚡</span>
              <h3>Adulto con TDAH</h3>
              <p>Externalizar la secuencia de pasos de tareas complejas (preparar la reunión, hacer la compra) elimina la carga de recordar el siguiente paso y reduce la parálisis por decisión.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>🤝</span>
              <h3>Persona con discapacidad intelectual</h3>
              <p>Una rutina visual creada por el educador o familiar permite a la persona seguir las actividades del día de forma más autónoma, sin depender de instrucciones verbales constantes.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>👩‍🏫</span>
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
              <dd>No directamente: los datos se guardan en local en cada dispositivo. Para compartir, tendrías que replicar la rutina manualmente en el otro dispositivo.</dd>
            </div>
            <div className={styles.faqItem}>
              {/* La misma pregunta va en el FAQPage: una sola fuente, en metadata.ts */}
              <dt>{PREGUNTA_CUANTAS_TAREAS.question}</dt>
              <dd>{PREGUNTA_CUANTAS_TAREAS.answer}</dd>
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
                <p>Pulsa el botón <span aria-hidden="true">▶</span> junto a la rutina. Aparecerá la primera tarea en grande. Muestra la pantalla al usuario.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Pulsa <span aria-hidden="true">✓</span> HECHO cuando complete cada tarea</strong>
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
              <span aria-hidden="true" className={styles.tipIcono}>✏️</span>
              <p><strong>Crea la rutina con el usuario, no para el usuario.</strong> Su participación en la elección de emojis y el orden de tareas aumenta significativamente la aceptación y el seguimiento.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>🔄</span>
              <p><strong>Anticipa los cambios con tiempo.</strong> Si la rutina va a ser diferente (visita al médico, salida especial), avísalo antes con la propia app: muestra las tareas del día distinto con antelación.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>📏</span>
              <p><strong>Mantén la rutina estable al principio.</strong> Cambia el orden de las tareas solo cuando la rutina original está bien interiorizada. Los cambios frecuentes reducen la seguridad que la agenda visual proporciona.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>📲</span>
              <p><strong>Asigna un dispositivo fijo para la app.</strong> Usar siempre el mismo tablet o móvil reduce la variable de aprender el dispositivo y permite que el usuario anticipe el ritual de consultar la agenda.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>🎵</span>
              <p><strong>El tono de éxito importa.</strong> El sonido de confirmación es un refuerzo positivo. Asegúrate de que el volumen sea audible pero no molesto. En entornos de grupo, considera bajar el volumen para no distraer a otros.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>👥</span>
              <p><strong>Informa a todo el equipo.</strong> Que familia, profesores y terapeutas usen la misma rutina y el mismo lenguaje en torno a ella (los mismos nombres de tareas) refuerza la consistencia y acelera el aprendizaje.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3><span aria-hidden="true">⚠️</span> Errores comunes en la implementación de rutinas visuales</h3>
            <ul>
              <li><strong>Crear rutinas demasiado largas desde el inicio:</strong> más de 8-10 tareas puede resultar abrumador para usuarios con TEA o DI. Empieza siempre con pocas tareas y amplía gradualmente cuando la rutina corta esté consolidada.</li>
              <li><strong>Cambiar los emojis sin avisar:</strong> para muchos usuarios con TEA, el emoji específico es parte de la rutina. Cambiar <span role="img" aria-label="vaso de leche">🥛</span> por <span role="img" aria-label="biberón">🍼</span> para representar el desayuno puede generar confusión o rechazo. Si necesitas cambiar un emoji, hazlo de forma gradual y explicada.</li>
              <li><strong>No dejar tiempo suficiente entre tareas:</strong> las personas con TEA o DI pueden necesitar más tiempo para completar cada paso. Una rutina ajustada al tiempo del adulto puede generar estrés en lugar de reducirlo.</li>
              <li><strong>Usar la app como castigo o presión:</strong> &quot;Si no pulsas HECHO, no salimos&quot; convierte una herramienta de apoyo en una fuente de estrés. La agenda visual debe asociarse con seguridad y autonomía, nunca con control o castigo.</li>
              <li><strong>Borrar las rutinas guardadas accidentalmente:</strong> si vas a dejar que el usuario use el dispositivo de forma autónoma, considera restringir el acceso al modo editor. Al borrar una rutina, «Deshacer» la recupera durante unos segundos; pasado ese rato, o si se borran los datos del navegador, hay que volver a crearla.</li>
              <li><strong>Esta app no es un sistema de gestión conductual:</strong> el planificador visual apoya las rutinas, pero no reemplaza un plan de intervención conductual diseñado por un especialista (psicólogo, terapeuta ocupacional, educador especial).</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="planificador-rutinas" />
      {/* key="pie" en los tres Footer: sin ella React lo remonta al cambiar de vista y el
          AnalyticsTracker registra otra visita (cabo C0042). */}
      <Footer key="pie" appName="planificador-rutinas" />
    </div>
  );
}
