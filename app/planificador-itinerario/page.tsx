'use client';

import { useState, useCallback } from 'react';
import styles from './PlanificadorItinerario.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Actividad {
  id: string;
  hora: string;
  titulo: string;
  lugar: string;
  duracion: string;
  notas: string;
  categoria: CategoriaActividad;
}

interface Dia {
  id: string;
  fecha: string;
  titulo: string;
  actividades: Actividad[];
}

type CategoriaActividad = 'transporte' | 'alojamiento' | 'gastronomia' | 'cultura' | 'naturaleza' | 'compras' | 'ocio' | 'otro';

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIA_CONFIG: Record<CategoriaActividad, { icono: string; label: string; color: string }> = {
  transporte:  { icono: '✈️', label: 'Transporte',   color: 'var(--cat-transporte)'  },
  alojamiento: { icono: '🏨', label: 'Alojamiento',  color: 'var(--cat-alojamiento)' },
  gastronomia: { icono: '🍽️', label: 'Gastronomía',  color: 'var(--cat-gastronomia)' },
  cultura:     { icono: '🏛️', label: 'Cultura',       color: 'var(--cat-cultura)'     },
  naturaleza:  { icono: '🌿', label: 'Naturaleza',    color: 'var(--cat-naturaleza)'  },
  compras:     { icono: '🛍️', label: 'Compras',       color: 'var(--cat-compras)'     },
  ocio:        { icono: '🎭', label: 'Ocio',          color: 'var(--cat-ocio)'        },
  otro:        { icono: '📌', label: 'Otro',          color: 'var(--cat-otro)'        },
};

const CATEGORIAS_ACTIVIDAD = Object.keys(CATEGORIA_CONFIG) as CategoriaActividad[];

// ─── Utilidades ──────────────────────────────────────────────────────────────

function generarId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function crearActividad(): Actividad {
  return { id: generarId(), hora: '', titulo: '', lugar: '', duracion: '', notas: '', categoria: 'otro' };
}

function crearDia(fechaBase?: string, numeroDia?: number): Dia {
  return {
    id: generarId(),
    fecha: fechaBase ?? '',
    titulo: numeroDia != null ? `Día ${numeroDia}` : 'Nuevo día',
    actividades: [],
  };
}

function formatearFecha(fechaIso: string): string {
  if (!fechaIso) return '';
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function exportarTexto(nombre: string, dias: Dia[]): string {
  const lineas: string[] = [];
  lineas.push(`ITINERARIO: ${nombre || 'Mi Viaje'}`);
  lineas.push('='.repeat(50));
  lineas.push('');
  dias.forEach((dia, i) => {
    lineas.push(`DÍA ${i + 1}${dia.fecha ? ` — ${formatearFecha(dia.fecha)}` : ''}${dia.titulo ? ` — ${dia.titulo}` : ''}`);
    lineas.push('-'.repeat(40));
    if (dia.actividades.length === 0) {
      lineas.push('  Sin actividades');
    } else {
      dia.actividades.forEach(a => {
        const hora = a.hora ? `[${a.hora}] ` : '';
        const duracion = a.duracion ? ` (${a.duracion})` : '';
        const cat = CATEGORIA_CONFIG[a.categoria];
        lineas.push(`  ${cat.icono} ${hora}${a.titulo || 'Sin título'}${duracion}`);
        if (a.lugar) lineas.push(`     📍 ${a.lugar}`);
        if (a.notas) lineas.push(`     📝 ${a.notas}`);
      });
    }
    lineas.push('');
  });
  return lineas.join('\n');
}

// ─── Formulario de actividad ──────────────────────────────────────────────────

interface FormActividadProps {
  actividad: Actividad;
  onGuardar: (a: Actividad) => void;
  onCancelar: () => void;
}

function FormActividad({ actividad, onGuardar, onCancelar }: FormActividadProps) {
  const [form, setForm] = useState<Actividad>({ ...actividad });

  function actualizar<K extends keyof Actividad>(campo: K, valor: Actividad[K]) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  return (
    <div className={styles.formActividad} role="dialog" aria-label="Formulario de actividad">
      <div className={styles.formGrid}>
        <div className={styles.formFila}>
          <label className={styles.label} htmlFor={`titulo-${actividad.id}`}>Actividad *</label>
          <input
            id={`titulo-${actividad.id}`}
            className={styles.input}
            type="text"
            placeholder="ej. Visita al Coliseo"
            value={form.titulo}
            onChange={e => actualizar('titulo', e.target.value)}
            autoFocus
          />
        </div>
        <div className={styles.formFila}>
          <label className={styles.label} htmlFor={`cat-${actividad.id}`}>Categoría</label>
          <select
            id={`cat-${actividad.id}`}
            className={styles.select}
            value={form.categoria}
            onChange={e => actualizar('categoria', e.target.value as CategoriaActividad)}
          >
            {CATEGORIAS_ACTIVIDAD.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORIA_CONFIG[cat].icono} {CATEGORIA_CONFIG[cat].label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formFila}>
          <label className={styles.label} htmlFor={`hora-${actividad.id}`}>Hora</label>
          <input
            id={`hora-${actividad.id}`}
            className={styles.input}
            type="time"
            value={form.hora}
            onChange={e => actualizar('hora', e.target.value)}
          />
        </div>
        <div className={styles.formFila}>
          <label className={styles.label} htmlFor={`duracion-${actividad.id}`}>Duración</label>
          <input
            id={`duracion-${actividad.id}`}
            className={styles.input}
            type="text"
            placeholder="ej. 2 horas"
            value={form.duracion}
            onChange={e => actualizar('duracion', e.target.value)}
          />
        </div>
        <div className={`${styles.formFila} ${styles.formFilaFull}`}>
          <label className={styles.label} htmlFor={`lugar-${actividad.id}`}>Lugar</label>
          <input
            id={`lugar-${actividad.id}`}
            className={styles.input}
            type="text"
            placeholder="ej. Foro Romano, Roma"
            value={form.lugar}
            onChange={e => actualizar('lugar', e.target.value)}
          />
        </div>
        <div className={`${styles.formFila} ${styles.formFilaFull}`}>
          <label className={styles.label} htmlFor={`notas-${actividad.id}`}>Notas</label>
          <textarea
            id={`notas-${actividad.id}`}
            className={styles.textarea}
            placeholder="Añade notas, precios, reservas..."
            rows={2}
            value={form.notas}
            onChange={e => actualizar('notas', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.formAcciones}>
        <button className={styles.btnSecundario} onClick={onCancelar} type="button">Cancelar</button>
        <button
          className={styles.btnPrimario}
          onClick={() => onGuardar(form)}
          type="button"
          disabled={!form.titulo.trim()}
        >
          Guardar actividad
        </button>
      </div>
    </div>
  );
}

// ─── Tarjeta de actividad ─────────────────────────────────────────────────────

interface TarjetaActividadProps {
  actividad: Actividad;
  onEditar: () => void;
  onEliminar: () => void;
  onMoverArriba: () => void;
  onMoverAbajo: () => void;
  esPrimera: boolean;
  esUltima: boolean;
}

function TarjetaActividad({ actividad, onEditar, onEliminar, onMoverArriba, onMoverAbajo, esPrimera, esUltima }: TarjetaActividadProps) {
  const cat = CATEGORIA_CONFIG[actividad.categoria];
  return (
    <div className={styles.tarjetaActividad} style={{ borderLeftColor: cat.color }}>
      <div className={styles.actividadCabecera}>
        <span className={styles.actividadCategoria} title={cat.label}>{cat.icono}</span>
        <div className={styles.actividadInfo}>
          <span className={styles.actividadTitulo}>{actividad.titulo || 'Sin título'}</span>
          {actividad.hora && <span className={styles.actividadHora}>⏰ {actividad.hora}</span>}
          {actividad.duracion && <span className={styles.actividadDuracion}>⌛ {actividad.duracion}</span>}
        </div>
        <div className={styles.actividadAcciones}>
          <button
            className={styles.btnIcono}
            onClick={onMoverArriba}
            disabled={esPrimera}
            aria-label="Mover actividad arriba"
            title="Subir"
          >▲</button>
          <button
            className={styles.btnIcono}
            onClick={onMoverAbajo}
            disabled={esUltima}
            aria-label="Mover actividad abajo"
            title="Bajar"
          >▼</button>
          <button className={styles.btnIcono} onClick={onEditar} aria-label="Editar actividad" title="Editar">✏️</button>
          <button className={`${styles.btnIcono} ${styles.btnEliminar}`} onClick={onEliminar} aria-label="Eliminar actividad" title="Eliminar">✕</button>
        </div>
      </div>
      {actividad.lugar && <div className={styles.actividadLugar}>📍 {actividad.lugar}</div>}
      {actividad.notas && <div className={styles.actividadNotas}>📝 {actividad.notas}</div>}
    </div>
  );
}

// ─── Panel de día ─────────────────────────────────────────────────────────────

interface PanelDiaProps {
  dia: Dia;
  indiceDia: number;
  totalDias: number;
  onActualizar: (d: Dia) => void;
  onEliminar: () => void;
  onMoverArriba: () => void;
  onMoverAbajo: () => void;
}

function PanelDia({ dia, indiceDia, totalDias, onActualizar, onEliminar, onMoverArriba, onMoverAbajo }: PanelDiaProps) {
  const [editandoActividad, setEditandoActividad] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState<Actividad>(crearActividad);

  function actualizarTitulo(titulo: string) {
    onActualizar({ ...dia, titulo });
  }

  function actualizarFecha(fecha: string) {
    onActualizar({ ...dia, fecha });
  }

  function guardarNuevaActividad(a: Actividad) {
    onActualizar({ ...dia, actividades: [...dia.actividades, a] });
    setAgregando(false);
    setNuevaActividad(crearActividad());
  }

  function guardarEdicionActividad(a: Actividad) {
    onActualizar({ ...dia, actividades: dia.actividades.map(x => x.id === a.id ? a : x) });
    setEditandoActividad(null);
  }

  function eliminarActividad(id: string) {
    onActualizar({ ...dia, actividades: dia.actividades.filter(a => a.id !== id) });
  }

  function moverActividad(indice: number, direccion: -1 | 1) {
    const nuevas = [...dia.actividades];
    const destino = indice + direccion;
    if (destino < 0 || destino >= nuevas.length) return;
    [nuevas[indice], nuevas[destino]] = [nuevas[destino], nuevas[indice]];
    onActualizar({ ...dia, actividades: nuevas });
  }

  const fechaFormateada = formatearFecha(dia.fecha);

  return (
    <section className={styles.panelDia} aria-label={`Día ${indiceDia + 1}`}>
      <div className={styles.diaCabecera}>
        <div className={styles.diaNumero}>Día {indiceDia + 1}</div>
        <div className={styles.diaControles}>
          <input
            className={styles.inputDiaTitulo}
            type="text"
            placeholder="Nombre del día"
            value={dia.titulo}
            onChange={e => actualizarTitulo(e.target.value)}
            aria-label="Título del día"
          />
          <input
            className={styles.inputFecha}
            type="date"
            value={dia.fecha}
            onChange={e => actualizarFecha(e.target.value)}
            aria-label="Fecha del día"
          />
        </div>
        <div className={styles.diaAcciones}>
          <button className={styles.btnIcono} onClick={onMoverArriba} disabled={indiceDia === 0} aria-label="Mover día arriba" title="Subir día">▲</button>
          <button className={styles.btnIcono} onClick={onMoverAbajo} disabled={indiceDia === totalDias - 1} aria-label="Mover día abajo" title="Bajar día">▼</button>
          <button className={`${styles.btnIcono} ${styles.btnEliminar}`} onClick={onEliminar} aria-label="Eliminar día" title="Eliminar día">✕</button>
        </div>
      </div>

      {fechaFormateada && (
        <div className={styles.diaFechaFormateada} aria-hidden="true">{fechaFormateada}</div>
      )}

      <div className={styles.listaActividades}>
        {dia.actividades.map((actividad, i) => (
          editandoActividad === actividad.id ? (
            <FormActividad
              key={actividad.id}
              actividad={actividad}
              onGuardar={guardarEdicionActividad}
              onCancelar={() => setEditandoActividad(null)}
            />
          ) : (
            <TarjetaActividad
              key={actividad.id}
              actividad={actividad}
              onEditar={() => setEditandoActividad(actividad.id)}
              onEliminar={() => eliminarActividad(actividad.id)}
              onMoverArriba={() => moverActividad(i, -1)}
              onMoverAbajo={() => moverActividad(i, 1)}
              esPrimera={i === 0}
              esUltima={i === dia.actividades.length - 1}
            />
          )
        ))}

        {agregando ? (
          <FormActividad
            actividad={nuevaActividad}
            onGuardar={guardarNuevaActividad}
            onCancelar={() => { setAgregando(false); setNuevaActividad(crearActividad()); }}
          />
        ) : (
          <button className={styles.btnAgregarActividad} onClick={() => setAgregando(true)}>
            + Añadir actividad
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanificadorItinerario() {
  const [nombreViaje, setNombreViaje] = useState('');
  const [dias, setDias] = useState<Dia[]>([crearDia('', 1)]);

  const totalActividades = dias.reduce((acc, d) => acc + d.actividades.length, 0);

  const agregarDia = useCallback(() => {
    setDias(prev => [...prev, crearDia('', prev.length + 1)]);
  }, []);

  const actualizarDia = useCallback((id: string, dia: Dia) => {
    setDias(prev => prev.map(d => d.id === id ? dia : d));
  }, []);

  const eliminarDia = useCallback((id: string) => {
    setDias(prev => {
      const nuevos = prev.filter(d => d.id !== id);
      return nuevos.length === 0 ? [crearDia('', 1)] : nuevos;
    });
  }, []);

  const moverDia = useCallback((indice: number, direccion: -1 | 1) => {
    setDias(prev => {
      const nuevos = [...prev];
      const destino = indice + direccion;
      if (destino < 0 || destino >= nuevos.length) return prev;
      [nuevos[indice], nuevos[destino]] = [nuevos[destino], nuevos[indice]];
      return nuevos;
    });
  }, []);

  const reiniciar = useCallback(() => {
    if (!confirm('¿Seguro que quieres borrar todo el itinerario?')) return;
    setNombreViaje('');
    setDias([crearDia('', 1)]);
  }, []);

  const descargarTxt = useCallback(() => {
    const contenido = exportarTexto(nombreViaje, dias);
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerario-${(nombreViaje || 'viaje').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nombreViaje, dias]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Planificador de Itinerario</h1>
        <p className={styles.heroSubtitulo}>Organiza tu viaje día a día: actividades, horarios y notas</p>
      </header>

      <LegalNotice />

      {/* Cabecera del viaje */}
      <div className={styles.cabeceraViaje}>
        <div className={styles.cabeceraViajeFila}>
          <div className={styles.campoNombreViaje}>
            <label className={styles.label} htmlFor="nombre-viaje">Nombre del viaje</label>
            <input
              id="nombre-viaje"
              className={styles.inputNombreViaje}
              type="text"
              placeholder="ej. Italia 2026, Semana Santa en Sevilla…"
              value={nombreViaje}
              onChange={e => setNombreViaje(e.target.value)}
            />
          </div>
          <div className={styles.resumenViaje}>
            <span className={styles.statViaje}>
              <strong>{dias.length}</strong> {dias.length === 1 ? 'día' : 'días'}
            </span>
            <span className={styles.statViaje}>
              <strong>{totalActividades}</strong> {totalActividades === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>
        </div>
      </div>

      {/* Días */}
      <div className={styles.listaDias}>
        {dias.map((dia, i) => (
          <PanelDia
            key={dia.id}
            dia={dia}
            indiceDia={i}
            totalDias={dias.length}
            onActualizar={d => actualizarDia(dia.id, d)}
            onEliminar={() => eliminarDia(dia.id)}
            onMoverArriba={() => moverDia(i, -1)}
            onMoverAbajo={() => moverDia(i, 1)}
          />
        ))}

        <button className={styles.btnAgregarDia} onClick={agregarDia}>
          + Añadir día
        </button>
      </div>

      {/* Acciones globales */}
      <div className={styles.accionesGlobales}>
        <button className={styles.btnSecundario} onClick={reiniciar}>Limpiar todo</button>
        <button className={styles.btnPrimario} onClick={descargarTxt} disabled={totalActividades === 0}>
          ⬇ Descargar itinerario (.txt)
        </button>
      </div>

      {/* Leyenda de categorías */}
      <div className={styles.leyenda}>
        <span className={styles.leyendaTitulo}>Categorías:</span>
        {CATEGORIAS_ACTIVIDAD.map(cat => (
          <span key={cat} className={styles.leyendaItem} style={{ borderColor: CATEGORIA_CONFIG[cat].color }}>
            {CATEGORIA_CONFIG[cat].icono} {CATEGORIA_CONFIG[cat].label}
          </span>
        ))}
      </div>

      <EducationalSection title="¿Cómo organizar un itinerario de viaje?" subtitle="Consejos prácticos para planificar tu viaje día a día" icon="📋">
        <h3>Consejos para planificar tu viaje</h3>
        <ul>
          <li><strong>Agrupa por zonas geográficas</strong>: organiza cada día en torno a un barrio o área para minimizar desplazamientos.</li>
          <li><strong>No sobreplanifiques</strong>: deja márgenes libres de 1-2 horas por día para imprevistos y paseos espontáneos.</li>
          <li><strong>Ordena por apertura</strong>: visita museos y monumentos al abrir (menos colas) y deja compras y restaurantes para la tarde.</li>
          <li><strong>Incluye tiempos reales de desplazamiento</strong>: el tiempo entre puntos es parte del viaje.</li>
          <li><strong>Anota reservas obligatorias</strong>: algunos lugares requieren entrada con antelación; apúntalo en las notas.</li>
          <li><strong>Equilibra el ritmo</strong>: alterna días intensos con días más tranquilos para no llegar al final del viaje agotado.</li>
        </ul>

        <h3>Categorías disponibles</h3>
        <ul>
          <li>✈️ <strong>Transporte</strong>: vuelos, trenes, traslados al aeropuerto, rutas en coche.</li>
          <li>🏨 <strong>Alojamiento</strong>: check-in, check-out, cambio de hotel.</li>
          <li>🍽️ <strong>Gastronomía</strong>: restaurantes, mercados, bodegas, catas.</li>
          <li>🏛️ <strong>Cultura</strong>: museos, monumentos, visitas guiadas, iglesias.</li>
          <li>🌿 <strong>Naturaleza</strong>: senderismo, playas, parques nacionales, miradores.</li>
          <li>🛍️ <strong>Compras</strong>: mercadillos, tiendas locales, souvenirs.</li>
          <li>🎭 <strong>Ocio</strong>: espectáculos, nightlife, excursiones, actividades.</li>
        </ul>

        <h3>Exportar y compartir</h3>
        <p>
          Descarga tu itinerario en formato texto (.txt) para compartirlo fácilmente por WhatsApp,
          correo o imprimirlo. Toda la información se procesa en tu navegador: ningún dato sale de tu dispositivo.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-itinerario')} />
      <ShareCard appName="planificador-itinerario" />
      <Footer appName="planificador-itinerario" />
    </div>
  );
}
