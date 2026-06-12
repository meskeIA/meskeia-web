'use client';

import { useState, useCallback } from 'react';
import styles from './PlanificadorItinerario.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard,
  DisclaimerCard,
} from '@/components';
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

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="planificador-itinerario-disclaimer"
      />

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

        {/* ── SECCIÓN 1: Tabla comparativa de ritmos de viaje ── */}
        <h3>Tipos de viaje según ritmo</h3>
        <p>El ritmo del viaje determina cuánto ves y cuánto disfrutas. Elige el que mejor encaje con tu perfil y destino.</p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Ritmo</th>
                <th>Actividades/día</th>
                <th>Pros</th>
                <th>Contras</th>
                <th>Perfil ideal</th>
                <th>Coste relativo</th>
                <th>Fatiga</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Intensivo</strong></td>
                <td>8–10</td>
                <td>Máximo aprovechamiento, ver mucho en poco tiempo</td>
                <td>Agotamiento físico, poco tiempo para improvisar</td>
                <td>Primera visita a una ciudad icónica, viajeros jóvenes</td>
                <td>Alto (más entradas, más transporte)</td>
                <td>Muy alta</td>
              </tr>
              <tr>
                <td><strong>Equilibrado</strong></td>
                <td>4–6</td>
                <td>Combina visitas planificadas con tiempo libre</td>
                <td>Puede quedarse corto en destinos grandes</td>
                <td>Parejas, grupos mixtos, viajes de 5–10 días</td>
                <td>Moderado</td>
                <td>Media</td>
              </tr>
              <tr>
                <td><strong>Relajado</strong></td>
                <td>2–3</td>
                <td>Profundiza en cada lugar, sin estrés</td>
                <td>Ves menos atracciones del destino</td>
                <td>Familias con niños, mayores, segunda visita</td>
                <td>Bajo-moderado</td>
                <td>Baja</td>
              </tr>
              <tr>
                <td><strong>Slow travel</strong></td>
                <td>1–2</td>
                <td>Integración cultural real, gastos mínimos de transporte</td>
                <td>Requiere estancias largas (1–2 semanas por ciudad)</td>
                <td>Nómadas digitales, jubilados, viajes de 1+ mes</td>
                <td>Bajo (alquiler mensual más barato)</td>
                <td>Muy baja</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── SECCIÓN 2: Casos de uso — 4 perfiles ── */}
        <h3>Casos de uso reales</h3>
        <p>Cómo planificarían su viaje cuatro perfiles diferentes con esta herramienta:</p>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>💑</span>
              <strong>Pareja en Roma · 3 días</strong>
            </div>
            <p className={styles.escenarioExample}>
              Ritmo equilibrado (5 actividades/día). Día 1: Vaticano (mañana, 3h mínimo) + Castel Sant&apos;Angelo + cena en Trastevere.
              Día 2: Coliseo + Foro Romano (4h combinado) + Palatino. Día 3: Piazza Navona + Panteón + Fontana di Trevi + compras.
              Desplazamientos en metro (1,50 €/viaje) o a pie — Roma centro es muy caminable.
            </p>
            <p className={styles.escenarioTip}>Reservar Vaticano y Coliseo con al menos 2 semanas de antelación; las entradas online se agotan.</p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍👩‍👧‍👦</span>
              <strong>Familia con niños en París · 5 días</strong>
            </div>
            <p className={styles.escenarioExample}>
              Ritmo relajado (3 actividades/día). El Louvre necesita mínimo 3h y agota a los niños pequeños; mejor dedicarle una mañana
              entera y terminar en el jardín. Incluir Disneyland París (1 día completo) + Torre Eiffel (reservar turno de subida).
              Metro París: el billete único &quot;t+&quot; cuesta unos 2,50 €/viaje — con varios trayectos al día, un pase turístico o de día suele salir más rentable para la familia.
            </p>
            <p className={styles.escenarioTip}>Evitar lunes en el Louvre (cerrado) y martes en el Museo d&apos;Orsay (cerrado).</p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎒</span>
              <strong>Mochilero en Japón · 15 días</strong>
            </div>
            <p className={styles.escenarioExample}>
              Itinerario en bloques geográficos: Tokio (5 días) → Kioto/Nara (4 días) → Osaka/Hiroshima (3 días) → Hakone (2 días) →
              vuelta a Tokio (1 día). Japan Rail Pass de 14 días (unos 80.000 ¥, aprox. 450-500 € según el cambio) cubre casi todos los shinkansen.
              Ritmo intensivo los primeros días, relajado al final para absorber el choque cultural.
            </p>
            <p className={styles.escenarioTip}>Descargar Google Maps offline de cada región antes de salir del hotel; el wifi en zonas rurales es limitado.</p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>💼</span>
              <strong>Viajero de negocios · Turismo añadido</strong>
            </div>
            <p className={styles.escenarioExample}>
              Conferencia en Berlín (lunes-miércoles). Extender vuelta al viernes y añadir 2 días de turismo.
              Jueves: Museo de Pérgamo (mañana, cerrado martes) + Muro de Berlín + Alexanderplatz. Viernes: Palacio de Charlottenburg +
              mercado de Mauerpark. El hotel de la empresa suele estar en el centro: aprovechar ubicación para ir a pie.
            </p>
            <p className={styles.escenarioTip}>Añadir en el planificador los horarios de reuniones como actividades de &quot;transporte/trabajo&quot; para ver el tiempo real disponible.</p>
          </div>
        </div>

        {/* ── SECCIÓN 3: FAQ — 8 preguntas ── */}
        <h3>Preguntas frecuentes sobre planificación de viajes</h3>
        <dl className={styles.faqList}>
          <div className={styles.faqItem}>
            <dt>¿Cuántas actividades por día es razonable?</dt>
            <dd>
              Depende del tipo de visita. 4–6 es el rango cómodo para la mayoría. Considera que una visita a un museo grande
              (Prado, Louvre, British Museum) consume 3–4h por sí sola. Si incluyes traslados y comidas, 3 visitas culturales
              importantes ya suponen un día completo sin holgura.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Cómo gestionar los tiempos de desplazamiento?</dt>
            <dd>
              Añádelos como actividades de tipo &quot;Transporte&quot; en el planificador. Usa Google Maps en modo tránsito para estimar tiempos reales:
              en ciudades como Londres o Ciudad de México, un trayecto de 5 km puede llevar 45 minutos en hora punta.
              La regla práctica: suma un 30% al tiempo estimado de Maps si viajas en hora punta.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Vale la pena el city pass o tarjeta turística?</dt>
            <dd>
              Rentable si visitas 4+ atracciones de pago en el mismo día. Ejemplo: Paris Museum Pass (2 días, 55 €) incluye
              Louvre (22 €), Versalles (20 €), D&apos;Orsay (16 €) y Pompidou (15 €) — ahorro de 18 € y sin colas de taquilla.
              No rentable si tu estilo es pasear y entrar solo a 1–2 museos.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué aplicaciones usar para organizar el itinerario?</dt>
            <dd>
              Este planificador para la estructura día a día. Complementar con: Google Maps (guardado de lugares y rutas offline),
              TripIt o TravelSpend para gastos, Airalo para eSIM local barata, y la app de la aerolínea para el boarding pass.
              Exporta el .txt de aquí y compártelo con el grupo por WhatsApp antes de salir.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Cómo priorizar si no hay tiempo para todo?</dt>
            <dd>
              Clasifica cada atracción en tres niveles: imprescindible (reservar antelación), deseable (si hay tiempo) y bonus
              (si llueve o hay un hueco). Los imprescindibles van en el planificador con hora fija; los otros quedan como notas
              sin hora asignada. Así, si se cae una actividad, tienes alternativas preparadas.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Cuándo reservar con antelación y qué dejar para improvisación?</dt>
            <dd>
              Reservar siempre: vuelos, alojamiento, atracciones con aforo limitado (Capilla Sixtina, Sagrada Família, cenas en
              restaurantes con estrella Michelin). Dejar libre: restaurantes informales, paseos por barrios, mercados, tiendas.
              La regla: si cierra si no reservas, resérvalo. Si puedes entrar cuando quieras, impróvisalo.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Cómo estructurar un itinerario por zonas geográficas?</dt>
            <dd>
              Antes de planificar, pinta en Google Maps todos los puntos que quieres visitar. Los que queden cerca forman un
              bloque para el mismo día. En Roma: día Vaticano (oeste), día Coliseo/Foro (sureste), día Centro Histórico (norte).
              Cada día se puede hacer casi todo a pie. Mezclar zonas lejanas en el mismo día es el error más común que dispara
              el cansancio y el gasto en transporte.
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué hacer si falla una actividad reservada?</dt>
            <dd>
              Ten siempre un plan B en las notas de cada día. Si un museo cierra por festivo imprevisto, sustituye por el parque
              o barrio más cercano. Guarda los números de teléfono de las atracciones reservadas en el planificador — muchas
              permiten cancelación gratuita hasta 24h antes. Contratar seguro de viaje con cobertura de cancelación cubre vuelos y hoteles.
            </dd>
          </div>
        </dl>
        <p className={styles.faqTip}>Consejo: exporta el itinerario como .txt y guárdalo en la nube (Google Drive, iCloud) antes de salir. Así tienes acceso offline sin depender del wifi del destino.</p>

        {/* ── SECCIÓN 4: Guía paso a paso — 7 pasos ── */}
        <h3>Guía paso a paso: cómo planificar un itinerario óptimo</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Define el marco del viaje</strong>
              <p>Fechas exactas, número de viajeros, presupuesto total y tipo de viaje (cultural, naturaleza, descanso, mezcla).
              Con esto claro, el resto de decisiones son más fáciles. Anota el nombre del viaje en el planificador desde el principio.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Investiga el destino y crea una lista larga</strong>
              <p>Apunta todo lo que quieres ver sin filtrar (Google Maps, guías Lonely Planet, TripAdvisor, blogs locales).
              En esta fase la cantidad es buena — ya filtrarás. Para una ciudad de 5 días, una lista de 30–40 puntos es normal.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Verifica horarios y días de cierre</strong>
              <p>Antes de poner nada en el planificador, comprueba horarios oficiales. El Museo del Prado cierra lunes; la Sagrada Família
              tiene aforo por franjas horarias; muchos mercados solo abren sábados. Esta información va en las Notas de cada actividad.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Agrupa por zonas y asigna días</strong>
              <p>Visualiza el mapa y agrupa atracciones cercanas en el mismo día (ver FAQ sobre zonas geográficas).
              Asigna cada grupo a un día teniendo en cuenta que los días de llegada y salida tienen tiempo recortado.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Ordena cada día cronológicamente</strong>
              <p>Empieza por lo que abre antes (museos populares: llegar 15 min antes de apertura para evitar colas).
              Coloca comidas y descansos de forma realista. Las visitas exigentes (museos grandes, excursiones) mejor por la mañana;
              las relajadas (paseos, compras, terrazas) por la tarde.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>6</span>
            <div className={styles.stepContent}>
              <strong>Reserva lo imprescindible</strong>
              <p>Con el itinerario estructurado, ya sabes exactamente qué días necesitas cada entrada. Reserva con al menos
              2–4 semanas de antelación en temporada alta. Guarda los códigos de reserva en las Notas de cada actividad.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>7</span>
            <div className={styles.stepContent}>
              <strong>Descarga y prepara el día a día</strong>
              <p>Exporta el .txt, descarga Google Maps offline de cada zona, guarda las entradas en Google Wallet o Apple Wallet.
              La noche anterior, revisa el plan del día siguiente: ajusta si hay cambios de clima o imprevistos. La flexibilidad
              dentro de la estructura es la clave de los buenos viajeros.</p>
            </div>
          </li>
        </ol>

        {/* ── SECCIÓN 5: Mejores prácticas — 6 tips ── */}
        <h3>Mejores prácticas para itinerarios perfectos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🗺️</span>
            <strong>Agrupa por zonas</strong>
            <p>Planifica cada día en un área geográfica concreta. Cruzar la ciudad dos veces al día es el mayor ladrón de tiempo y energía en un viaje.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎟️</span>
            <strong>Reserva solo lo imprescindible</strong>
            <p>Sobrereservar crea rigidez. Solo bloquea con anticipación lo que tiene aforo limitado o lo que se agota (Alhambra de Granada: entradas 3 meses antes).</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⏰</span>
            <strong>Deja tiempo libre real</strong>
            <p>Incluye al menos 1,5–2h de margen por día sin actividad asignada. Los mejores momentos de un viaje suelen ser los no planificados.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔍</span>
            <strong>Investiga horarios antes de ir</strong>
            <p>Comprueba siempre la web oficial del lugar. Los horarios de Google Maps se desactualizan. Festivos locales pueden cerrar toda una zona un día entero.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📵</span>
            <strong>Google Maps offline es obligatorio</strong>
            <p>Descarga el mapa de cada ciudad antes de llegar. El roaming en países fuera de la UE puede costar 10–30 €/día; una eSIM local (Airalo) suele ser 5–8 € por semana.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🌅</span>
            <strong>Llega temprano a las atracciones icónicas</strong>
            <p>Los 30 primeros minutos tras la apertura tienen un 60–70% menos de gente que a media mañana. En la Fontana di Trevi o el Coliseo, la diferencia es abismal.</p>
          </div>
        </div>

        {/* ── SECCIÓN 6: Warning Box — 6 errores ── */}
        <div className={styles.warningBox} role="alert">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>6 errores que arruinan un viaje</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Sobrecargar el itinerario.</strong> Planificar 10+ actividades al día es una garantía de llegar al hotel agotado y sin haber disfrutado ninguna. Menos es más.</li>
            <li><strong>Ignorar los tiempos de desplazamiento.</strong> En ciudades grandes (Londres, Tokio, Ciudad de México) moverse entre puntos puede consumir 1–2h al día. Añádelos siempre al planificador.</li>
            <li><strong>Reservar todo sin margen de flexibilidad.</strong> Un horario de 15 minutos en quince actividades encadenadas se desmorona al primer retraso. Deja siempre hueco entre bloques.</li>
            <li><strong>Ignorar cierres por festivos o mantenimiento.</strong> El Louvre cierra los martes; la Capilla Sixtina cierra varios domingos al mes; muchos monumentos cierran en enero. Verificar antes es obligatorio.</li>
            <li><strong>No descargar mapas offline.</strong> Quedarse sin conexión en un barrio desconocido, sin mapa y con la batería al 20%, es la pesadilla del viajero moderno. Siempre mapas offline antes de salir del alojamiento.</li>
            <li><strong>No tener plan B para actividades reservadas.</strong> Las cancelaciones de última hora existen: huelgas, mal tiempo, obras. Sin alternativa preparada, perderás horas buscando qué hacer en el momento.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-itinerario')} />
      <ShareCard appName="planificador-itinerario" />
      <Footer appName="planificador-itinerario" />
    </div>
  );
}
