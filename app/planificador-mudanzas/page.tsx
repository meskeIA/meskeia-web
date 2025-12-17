'use client';

import { useState, useEffect } from 'react';
import styles from './PlanificadorMudanzas.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber } from '@/lib';

// ==================== TIPOS ====================

type TabType = 'tareas' | 'inventario' | 'presupuesto';
type FaseTarea = 'semanas8' | 'semanas4' | 'semana1' | 'diaD' | 'despues';
type EstadoObjeto = 'bueno' | 'regular' | 'malo';
type HabitacionType = 'salon' | 'dormitorio' | 'cocina' | 'bano' | 'despacho' | 'trastero' | 'otros';

interface Tarea {
  id: string;
  texto: string;
  fase: FaseTarea;
  completada: boolean;
  esPersonalizada: boolean;
}

interface ObjetoInventario {
  id: string;
  nombre: string;
  cantidad: number;
  habitacion: HabitacionType;
  estado: EstadoObjeto;
  valorEstimado: number;
  seLleva: boolean;
  notas: string;
}

interface GastoPresupuesto {
  id: string;
  concepto: string;
  estimado: number;
  real: number;
  pagado: boolean;
}

interface DatosMudanza {
  nombre: string;
  fechaMudanza: string;
  tareas: Tarea[];
  inventario: ObjetoInventario[];
  presupuesto: GastoPresupuesto[];
}

// ==================== DATOS PREDEFINIDOS ====================

const fasesInfo: Record<FaseTarea, { nombre: string; emoji: string }> = {
  semanas8: { nombre: '8-4 semanas antes', emoji: '📅' },
  semanas4: { nombre: '4-2 semanas antes', emoji: '📦' },
  semana1: { nombre: 'Semana previa', emoji: '⏰' },
  diaD: { nombre: 'Día de la mudanza', emoji: '🚚' },
  despues: { nombre: 'Después de mudarte', emoji: '🏠' },
};

const tareasPredefinidasBase: Omit<Tarea, 'id' | 'completada'>[] = [
  // 8-4 semanas antes
  { texto: 'Solicitar presupuestos de empresas de mudanza', fase: 'semanas8', esPersonalizada: false },
  { texto: 'Hacer inventario general de pertenencias', fase: 'semanas8', esPersonalizada: false },
  { texto: 'Decidir qué objetos vender, donar o tirar', fase: 'semanas8', esPersonalizada: false },
  { texto: 'Notificar cambio de dirección (banco, trabajo, suscripciones)', fase: 'semanas8', esPersonalizada: false },
  { texto: 'Reunir documentación importante en una carpeta', fase: 'semanas8', esPersonalizada: false },
  { texto: 'Contratar empresa de mudanzas o reservar furgoneta', fase: 'semanas8', esPersonalizada: false },
  // 4-2 semanas antes
  { texto: 'Comprar material de embalaje (cajas, cinta, papel burbuja)', fase: 'semanas4', esPersonalizada: false },
  { texto: 'Empezar a empacar objetos de uso poco frecuente', fase: 'semanas4', esPersonalizada: false },
  { texto: 'Etiquetar cajas con contenido y habitación destino', fase: 'semanas4', esPersonalizada: false },
  { texto: 'Solicitar baja de suministros en vivienda antigua', fase: 'semanas4', esPersonalizada: false },
  { texto: 'Solicitar alta de suministros en vivienda nueva', fase: 'semanas4', esPersonalizada: false },
  { texto: 'Confirmar fecha y hora con empresa de mudanzas', fase: 'semanas4', esPersonalizada: false },
  { texto: 'Avisar a vecinos de la mudanza', fase: 'semanas4', esPersonalizada: false },
  // Semana previa
  { texto: 'Preparar maleta con esenciales para primeros días', fase: 'semana1', esPersonalizada: false },
  { texto: 'Vaciar y descongelar nevera/congelador', fase: 'semana1', esPersonalizada: false },
  { texto: 'Desmontar muebles grandes', fase: 'semana1', esPersonalizada: false },
  { texto: 'Hacer fotos del estado de la vivienda antigua', fase: 'semana1', esPersonalizada: false },
  { texto: 'Preparar caja de herramientas básicas', fase: 'semana1', esPersonalizada: false },
  { texto: 'Confirmar llaves de vivienda nueva', fase: 'semana1', esPersonalizada: false },
  // Día D
  { texto: 'Supervisar carga del camión', fase: 'diaD', esPersonalizada: false },
  { texto: 'Hacer inventario final de cajas', fase: 'diaD', esPersonalizada: false },
  { texto: 'Anotar lecturas de contadores (agua, luz, gas)', fase: 'diaD', esPersonalizada: false },
  { texto: 'Revisar que no quede nada olvidado', fase: 'diaD', esPersonalizada: false },
  { texto: 'Entregar llaves de vivienda antigua', fase: 'diaD', esPersonalizada: false },
  { texto: 'Supervisar descarga en vivienda nueva', fase: 'diaD', esPersonalizada: false },
  // Después
  { texto: 'Desembalar cajas de primera necesidad', fase: 'despues', esPersonalizada: false },
  { texto: 'Montar muebles esenciales (camas, mesas)', fase: 'despues', esPersonalizada: false },
  { texto: 'Actualizar dirección en DNI/padrón municipal', fase: 'despues', esPersonalizada: false },
  { texto: 'Cambiar dirección en Seguridad Social y Hacienda', fase: 'despues', esPersonalizada: false },
  { texto: 'Presentarte a los nuevos vecinos', fase: 'despues', esPersonalizada: false },
  { texto: 'Localizar servicios cercanos (médico, supermercado)', fase: 'despues', esPersonalizada: false },
];

const habitacionesInfo: Record<HabitacionType, { nombre: string; emoji: string }> = {
  salon: { nombre: 'Salón', emoji: '🛋️' },
  dormitorio: { nombre: 'Dormitorio', emoji: '🛏️' },
  cocina: { nombre: 'Cocina', emoji: '🍳' },
  bano: { nombre: 'Baño', emoji: '🚿' },
  despacho: { nombre: 'Despacho', emoji: '💼' },
  trastero: { nombre: 'Trastero', emoji: '📦' },
  otros: { nombre: 'Otros', emoji: '🏷️' },
};

const gastosPredefinidasBase: Omit<GastoPresupuesto, 'id' | 'real' | 'pagado'>[] = [
  { concepto: 'Empresa de mudanzas', estimado: 0 },
  { concepto: 'Alquiler de furgoneta', estimado: 0 },
  { concepto: 'Material de embalaje', estimado: 0 },
  { concepto: 'Limpieza vivienda antigua', estimado: 0 },
  { concepto: 'Limpieza vivienda nueva', estimado: 0 },
  { concepto: 'Fianza/depósito nueva vivienda', estimado: 0 },
  { concepto: 'Alta de luz', estimado: 0 },
  { concepto: 'Alta de agua', estimado: 0 },
  { concepto: 'Alta de gas', estimado: 0 },
  { concepto: 'Alta de internet', estimado: 0 },
  { concepto: 'Pequeñas reparaciones', estimado: 0 },
  { concepto: 'Cerrajero (copias llaves)', estimado: 0 },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function PlanificadorMudanzasPage() {
  const [tabActiva, setTabActiva] = useState<TabType>('tareas');
  const [datos, setDatos] = useState<DatosMudanza>({
    nombre: 'Mi Mudanza',
    fechaMudanza: '',
    tareas: [],
    inventario: [],
    presupuesto: [],
  });
  const [mudanzasGuardadas, setMudanzasGuardadas] = useState<(DatosMudanza & { id: string; fechaGuardado: string })[]>([]);
  const [modoEdicionNombre, setModoEdicionNombre] = useState(false);

  // Estados para formularios
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [faseNuevaTarea, setFaseNuevaTarea] = useState<FaseTarea>('semanas8');

  const [nuevoObjeto, setNuevoObjeto] = useState({
    nombre: '',
    cantidad: '1',
    habitacion: 'salon' as HabitacionType,
    estado: 'bueno' as EstadoObjeto,
    valorEstimado: '',
    notas: '',
  });

  const [nuevoGasto, setNuevoGasto] = useState({
    concepto: '',
    estimado: '',
  });

  // Filtros
  const [filtroFase, setFiltroFase] = useState<FaseTarea | 'todas'>('todas');
  const [filtroHabitacion, setFiltroHabitacion] = useState<HabitacionType | 'todas'>('todas');
  const [mostrarSoloLlevar, setMostrarSoloLlevar] = useState(false);

  // ==================== EFECTOS ====================

  // Cargar datos al montar
  useEffect(() => {
    const datosGuardados = localStorage.getItem('meskeia_mudanza_actual');
    if (datosGuardados) {
      const parsed = JSON.parse(datosGuardados);
      setDatos(parsed);
    } else {
      // Inicializar con tareas predefinidas
      const tareasIniciales: Tarea[] = tareasPredefinidasBase.map((t, i) => ({
        ...t,
        id: `tarea-${i}`,
        completada: false,
      }));
      const gastosIniciales: GastoPresupuesto[] = gastosPredefinidasBase.map((g, i) => ({
        ...g,
        id: `gasto-${i}`,
        real: 0,
        pagado: false,
      }));
      setDatos(prev => ({
        ...prev,
        tareas: tareasIniciales,
        presupuesto: gastosIniciales,
      }));
    }

    const mudanzasStorage = localStorage.getItem('meskeia_mudanzas_guardadas');
    if (mudanzasStorage) {
      setMudanzasGuardadas(JSON.parse(mudanzasStorage));
    }
  }, []);

  // Guardar datos cuando cambian
  useEffect(() => {
    if (datos.tareas.length > 0 || datos.inventario.length > 0 || datos.presupuesto.length > 0) {
      localStorage.setItem('meskeia_mudanza_actual', JSON.stringify(datos));
    }
  }, [datos]);

  // ==================== FUNCIONES TAREAS ====================

  const toggleTarea = (id: string) => {
    setDatos(prev => ({
      ...prev,
      tareas: prev.tareas.map(t =>
        t.id === id ? { ...t, completada: !t.completada } : t
      ),
    }));
  };

  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;
    const nueva: Tarea = {
      id: `tarea-${Date.now()}`,
      texto: nuevaTarea.trim(),
      fase: faseNuevaTarea,
      completada: false,
      esPersonalizada: true,
    };
    setDatos(prev => ({
      ...prev,
      tareas: [...prev.tareas, nueva],
    }));
    setNuevaTarea('');
  };

  const eliminarTarea = (id: string) => {
    setDatos(prev => ({
      ...prev,
      tareas: prev.tareas.filter(t => t.id !== id),
    }));
  };

  // ==================== FUNCIONES INVENTARIO ====================

  const agregarObjeto = () => {
    if (!nuevoObjeto.nombre.trim()) return;
    const nuevo: ObjetoInventario = {
      id: `objeto-${Date.now()}`,
      nombre: nuevoObjeto.nombre.trim(),
      cantidad: parseInt(nuevoObjeto.cantidad) || 1,
      habitacion: nuevoObjeto.habitacion,
      estado: nuevoObjeto.estado,
      valorEstimado: parseFloat(nuevoObjeto.valorEstimado) || 0,
      seLleva: true,
      notas: nuevoObjeto.notas,
    };
    setDatos(prev => ({
      ...prev,
      inventario: [...prev.inventario, nuevo],
    }));
    setNuevoObjeto({
      nombre: '',
      cantidad: '1',
      habitacion: 'salon',
      estado: 'bueno',
      valorEstimado: '',
      notas: '',
    });
  };

  const toggleSeLleva = (id: string) => {
    setDatos(prev => ({
      ...prev,
      inventario: prev.inventario.map(o =>
        o.id === id ? { ...o, seLleva: !o.seLleva } : o
      ),
    }));
  };

  const eliminarObjeto = (id: string) => {
    setDatos(prev => ({
      ...prev,
      inventario: prev.inventario.filter(o => o.id !== id),
    }));
  };

  // ==================== FUNCIONES PRESUPUESTO ====================

  const actualizarGasto = (id: string, campo: 'estimado' | 'real', valor: number) => {
    setDatos(prev => ({
      ...prev,
      presupuesto: prev.presupuesto.map(g =>
        g.id === id ? { ...g, [campo]: valor } : g
      ),
    }));
  };

  const togglePagado = (id: string) => {
    setDatos(prev => ({
      ...prev,
      presupuesto: prev.presupuesto.map(g =>
        g.id === id ? { ...g, pagado: !g.pagado } : g
      ),
    }));
  };

  const agregarGasto = () => {
    if (!nuevoGasto.concepto.trim()) return;
    const nuevo: GastoPresupuesto = {
      id: `gasto-${Date.now()}`,
      concepto: nuevoGasto.concepto.trim(),
      estimado: parseFloat(nuevoGasto.estimado) || 0,
      real: 0,
      pagado: false,
    };
    setDatos(prev => ({
      ...prev,
      presupuesto: [...prev.presupuesto, nuevo],
    }));
    setNuevoGasto({ concepto: '', estimado: '' });
  };

  const eliminarGasto = (id: string) => {
    setDatos(prev => ({
      ...prev,
      presupuesto: prev.presupuesto.filter(g => g.id !== id),
    }));
  };

  // ==================== FUNCIONES GENERALES ====================

  const guardarMudanza = () => {
    const nuevaMudanza = {
      ...datos,
      id: Date.now().toString(),
      fechaGuardado: new Date().toLocaleDateString('es-ES'),
    };
    const nuevas = [...mudanzasGuardadas, nuevaMudanza];
    setMudanzasGuardadas(nuevas);
    localStorage.setItem('meskeia_mudanzas_guardadas', JSON.stringify(nuevas));
    alert('Mudanza guardada correctamente');
  };

  const cargarMudanza = (mudanza: DatosMudanza) => {
    setDatos(mudanza);
  };

  const eliminarMudanzaGuardada = (id: string) => {
    const nuevas = mudanzasGuardadas.filter(m => m.id !== id);
    setMudanzasGuardadas(nuevas);
    localStorage.setItem('meskeia_mudanzas_guardadas', JSON.stringify(nuevas));
  };

  const nuevaMudanza = () => {
    if (confirm('¿Empezar una nueva mudanza? Se perderán los datos no guardados.')) {
      const tareasIniciales: Tarea[] = tareasPredefinidasBase.map((t, i) => ({
        ...t,
        id: `tarea-${i}`,
        completada: false,
      }));
      const gastosIniciales: GastoPresupuesto[] = gastosPredefinidasBase.map((g, i) => ({
        ...g,
        id: `gasto-${i}`,
        real: 0,
        pagado: false,
      }));
      setDatos({
        nombre: 'Mi Mudanza',
        fechaMudanza: '',
        tareas: tareasIniciales,
        inventario: [],
        presupuesto: gastosIniciales,
      });
    }
  };

  const exportarResumen = async () => {
    const tareasCompletadas = datos.tareas.filter(t => t.completada).length;
    const objetosLlevar = datos.inventario.filter(o => o.seLleva);
    const totalEstimado = datos.presupuesto.reduce((acc, g) => acc + g.estimado, 0);
    const totalReal = datos.presupuesto.reduce((acc, g) => acc + g.real, 0);

    const texto = `📦 ${datos.nombre}
${datos.fechaMudanza ? `📅 Fecha: ${datos.fechaMudanza}` : ''}

✅ TAREAS: ${tareasCompletadas}/${datos.tareas.length} completadas

📋 INVENTARIO:
- Objetos a llevar: ${objetosLlevar.length}
- Valor total estimado: ${formatCurrency(objetosLlevar.reduce((acc, o) => acc + o.valorEstimado * o.cantidad, 0))}

💰 PRESUPUESTO:
- Estimado: ${formatCurrency(totalEstimado)}
- Real: ${formatCurrency(totalReal)}
- Diferencia: ${formatCurrency(totalEstimado - totalReal)}

📱 Creado con meskeIA`;

    if (navigator.share) {
      try {
        await navigator.share({ title: datos.nombre, text: texto });
      } catch {
        navigator.clipboard.writeText(texto);
        alert('Resumen copiado al portapapeles');
      }
    } else {
      navigator.clipboard.writeText(texto);
      alert('Resumen copiado al portapapeles');
    }
  };

  // ==================== CÁLCULOS ====================

  const tareasFiltradas = datos.tareas.filter(t =>
    filtroFase === 'todas' || t.fase === filtroFase
  );

  const tareasAgrupadas = (Object.keys(fasesInfo) as FaseTarea[]).map(fase => ({
    fase,
    ...fasesInfo[fase],
    tareas: tareasFiltradas.filter(t => t.fase === fase),
  })).filter(g => g.tareas.length > 0);

  const inventarioFiltrado = datos.inventario.filter(o => {
    if (filtroHabitacion !== 'todas' && o.habitacion !== filtroHabitacion) return false;
    if (mostrarSoloLlevar && !o.seLleva) return false;
    return true;
  });

  const inventarioAgrupado = (Object.keys(habitacionesInfo) as HabitacionType[]).map(hab => ({
    habitacion: hab,
    ...habitacionesInfo[hab],
    objetos: inventarioFiltrado.filter(o => o.habitacion === hab),
  })).filter(g => g.objetos.length > 0);

  const totalTareas = datos.tareas.length;
  const tareasCompletadas = datos.tareas.filter(t => t.completada).length;
  const progresoTareas = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

  const objetosTotal = datos.inventario.length;
  const objetosLlevar = datos.inventario.filter(o => o.seLleva).length;
  const valorTotal = datos.inventario.filter(o => o.seLleva).reduce((acc, o) => acc + o.valorEstimado * o.cantidad, 0);

  const totalEstimado = datos.presupuesto.reduce((acc, g) => acc + g.estimado, 0);
  const totalReal = datos.presupuesto.reduce((acc, g) => acc + g.real, 0);
  const diferencia = totalEstimado - totalReal;

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📦 Planificador de Mudanzas</h1>
        <p className={styles.subtitle}>
          Organiza tu mudanza paso a paso: tareas, inventario y presupuesto
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Cabecera con nombre y fecha */}
        <section className={styles.headerPanel}>
          <div className={styles.nombreMudanza}>
            {modoEdicionNombre ? (
              <input
                type="text"
                value={datos.nombre}
                onChange={(e) => setDatos(prev => ({ ...prev, nombre: e.target.value }))}
                onBlur={() => setModoEdicionNombre(false)}
                onKeyDown={(e) => e.key === 'Enter' && setModoEdicionNombre(false)}
                className={styles.inputNombre}
                autoFocus
              />
            ) : (
              <h2 onClick={() => setModoEdicionNombre(true)} className={styles.tituloMudanza}>
                {datos.nombre} <span className={styles.editIcon}>✏️</span>
              </h2>
            )}
          </div>
          <div className={styles.fechaContainer}>
            <label>Fecha de mudanza:</label>
            <input
              type="date"
              value={datos.fechaMudanza}
              onChange={(e) => setDatos(prev => ({ ...prev, fechaMudanza: e.target.value }))}
              className={styles.inputFecha}
            />
          </div>
        </section>

        {/* Tabs de navegación */}
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${tabActiva === 'tareas' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('tareas')}
          >
            <span className={styles.tabIcon}>✅</span>
            <span className={styles.tabText}>Tareas</span>
            <span className={styles.tabBadge}>{tareasCompletadas}/{totalTareas}</span>
          </button>
          <button
            className={`${styles.tab} ${tabActiva === 'inventario' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('inventario')}
          >
            <span className={styles.tabIcon}>📋</span>
            <span className={styles.tabText}>Inventario</span>
            <span className={styles.tabBadge}>{objetosTotal}</span>
          </button>
          <button
            className={`${styles.tab} ${tabActiva === 'presupuesto' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('presupuesto')}
          >
            <span className={styles.tabIcon}>💰</span>
            <span className={styles.tabText}>Presupuesto</span>
          </button>
        </nav>

        {/* ==================== TAB TAREAS ==================== */}
        {tabActiva === 'tareas' && (
          <section className={styles.tabContent}>
            {/* Progreso */}
            <div className={styles.progresoPanel}>
              <div className={styles.progresoBar}>
                <div className={styles.progresoFill} style={{ width: `${progresoTareas}%` }} />
              </div>
              <span className={styles.progresoTexto}>
                {tareasCompletadas} de {totalTareas} tareas completadas ({progresoTareas}%)
              </span>
            </div>

            {/* Filtros */}
            <div className={styles.filtrosPanel}>
              <span className={styles.filtroLabel}>Filtrar por fase:</span>
              <div className={styles.filtrosBotones}>
                <button
                  className={`${styles.filtroBtn} ${filtroFase === 'todas' ? styles.activo : ''}`}
                  onClick={() => setFiltroFase('todas')}
                >
                  Todas
                </button>
                {(Object.keys(fasesInfo) as FaseTarea[]).map(fase => (
                  <button
                    key={fase}
                    className={`${styles.filtroBtn} ${filtroFase === fase ? styles.activo : ''}`}
                    onClick={() => setFiltroFase(fase)}
                    title={fasesInfo[fase].nombre}
                  >
                    {fasesInfo[fase].emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Añadir tarea */}
            <div className={styles.addPanel}>
              <input
                type="text"
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarTarea()}
                placeholder="Añadir tarea personalizada..."
                className={styles.inputAdd}
              />
              <select
                value={faseNuevaTarea}
                onChange={(e) => setFaseNuevaTarea(e.target.value as FaseTarea)}
                className={styles.selectFase}
              >
                {(Object.keys(fasesInfo) as FaseTarea[]).map(fase => (
                  <option key={fase} value={fase}>
                    {fasesInfo[fase].emoji} {fasesInfo[fase].nombre}
                  </option>
                ))}
              </select>
              <button onClick={agregarTarea} className={styles.btnAdd}>
                + Añadir
              </button>
            </div>

            {/* Lista de tareas agrupadas */}
            <div className={styles.listaPanel}>
              {tareasAgrupadas.map(grupo => (
                <div key={grupo.fase} className={styles.grupoTareas}>
                  <h3 className={styles.grupoHeader}>
                    <span className={styles.grupoEmoji}>{grupo.emoji}</span>
                    {grupo.nombre}
                    <span className={styles.grupoCount}>
                      ({grupo.tareas.filter(t => t.completada).length}/{grupo.tareas.length})
                    </span>
                  </h3>
                  <ul className={styles.tareasLista}>
                    {grupo.tareas.map(tarea => (
                      <li key={tarea.id} className={`${styles.tareaItem} ${tarea.completada ? styles.completada : ''}`}>
                        <button
                          className={styles.checkBtn}
                          onClick={() => toggleTarea(tarea.id)}
                        >
                          {tarea.completada ? '✓' : '○'}
                        </button>
                        <span className={styles.tareaTexto}>
                          {tarea.texto}
                          {tarea.esPersonalizada && <span className={styles.badgePersonalizada}>✨</span>}
                        </span>
                        {tarea.esPersonalizada && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => eliminarTarea(tarea.id)}
                          >
                            ✕
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== TAB INVENTARIO ==================== */}
        {tabActiva === 'inventario' && (
          <section className={styles.tabContent}>
            {/* Resumen */}
            <div className={styles.resumenPanel}>
              <div className={styles.resumenCard}>
                <span className={styles.resumenIcon}>📦</span>
                <span className={styles.resumenValor}>{objetosTotal}</span>
                <span className={styles.resumenLabel}>Total objetos</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenIcon}>🚚</span>
                <span className={styles.resumenValor}>{objetosLlevar}</span>
                <span className={styles.resumenLabel}>A transportar</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenIcon}>💶</span>
                <span className={styles.resumenValor}>{formatCurrency(valorTotal)}</span>
                <span className={styles.resumenLabel}>Valor estimado</span>
              </div>
            </div>

            {/* Filtros */}
            <div className={styles.filtrosPanel}>
              <div className={styles.filtrosBotones}>
                <button
                  className={`${styles.filtroBtn} ${filtroHabitacion === 'todas' ? styles.activo : ''}`}
                  onClick={() => setFiltroHabitacion('todas')}
                >
                  Todas
                </button>
                {(Object.keys(habitacionesInfo) as HabitacionType[]).map(hab => (
                  <button
                    key={hab}
                    className={`${styles.filtroBtn} ${filtroHabitacion === hab ? styles.activo : ''}`}
                    onClick={() => setFiltroHabitacion(hab)}
                    title={habitacionesInfo[hab].nombre}
                  >
                    {habitacionesInfo[hab].emoji}
                  </button>
                ))}
              </div>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={mostrarSoloLlevar}
                  onChange={(e) => setMostrarSoloLlevar(e.target.checked)}
                />
                Solo objetos a llevar
              </label>
            </div>

            {/* Formulario añadir objeto */}
            <div className={styles.addPanelInventario}>
              <div className={styles.addRow}>
                <input
                  type="text"
                  value={nuevoObjeto.nombre}
                  onChange={(e) => setNuevoObjeto(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del objeto"
                  className={styles.inputNombreObjeto}
                />
                <input
                  type="number"
                  value={nuevoObjeto.cantidad}
                  onChange={(e) => setNuevoObjeto(prev => ({ ...prev, cantidad: e.target.value }))}
                  min="1"
                  className={styles.inputCantidad}
                />
                <select
                  value={nuevoObjeto.habitacion}
                  onChange={(e) => setNuevoObjeto(prev => ({ ...prev, habitacion: e.target.value as HabitacionType }))}
                  className={styles.selectHabitacion}
                >
                  {(Object.keys(habitacionesInfo) as HabitacionType[]).map(hab => (
                    <option key={hab} value={hab}>
                      {habitacionesInfo[hab].emoji} {habitacionesInfo[hab].nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.addRow}>
                <select
                  value={nuevoObjeto.estado}
                  onChange={(e) => setNuevoObjeto(prev => ({ ...prev, estado: e.target.value as EstadoObjeto }))}
                  className={styles.selectEstado}
                >
                  <option value="bueno">✅ Bueno</option>
                  <option value="regular">⚠️ Regular</option>
                  <option value="malo">❌ Malo</option>
                </select>
                <input
                  type="number"
                  value={nuevoObjeto.valorEstimado}
                  onChange={(e) => setNuevoObjeto(prev => ({ ...prev, valorEstimado: e.target.value }))}
                  placeholder="Valor (€)"
                  min="0"
                  className={styles.inputValor}
                />
                <button onClick={agregarObjeto} className={styles.btnAdd}>
                  + Añadir
                </button>
              </div>
            </div>

            {/* Lista de objetos agrupados */}
            <div className={styles.listaPanel}>
              {inventarioAgrupado.length === 0 ? (
                <div className={styles.listaVacia}>
                  <span className={styles.iconVacio}>📋</span>
                  <p>No hay objetos en el inventario</p>
                  <p className={styles.hint}>Añade objetos usando el formulario de arriba</p>
                </div>
              ) : (
                inventarioAgrupado.map(grupo => (
                  <div key={grupo.habitacion} className={styles.grupoInventario}>
                    <h3 className={styles.grupoHeader}>
                      <span className={styles.grupoEmoji}>{grupo.emoji}</span>
                      {grupo.nombre}
                      <span className={styles.grupoCount}>({grupo.objetos.length})</span>
                    </h3>
                    <div className={styles.objetosGrid}>
                      {grupo.objetos.map(objeto => (
                        <div
                          key={objeto.id}
                          className={`${styles.objetoCard} ${!objeto.seLleva ? styles.noLlevar : ''}`}
                        >
                          <div className={styles.objetoHeader}>
                            <span className={styles.objetoNombre}>{objeto.nombre}</span>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => eliminarObjeto(objeto.id)}
                            >
                              ✕
                            </button>
                          </div>
                          <div className={styles.objetoDetalles}>
                            <span>Cantidad: {objeto.cantidad}</span>
                            <span>
                              Estado: {objeto.estado === 'bueno' ? '✅' : objeto.estado === 'regular' ? '⚠️' : '❌'}
                            </span>
                            {objeto.valorEstimado > 0 && (
                              <span>Valor: {formatCurrency(objeto.valorEstimado * objeto.cantidad)}</span>
                            )}
                          </div>
                          <button
                            className={`${styles.btnLlevar} ${objeto.seLleva ? styles.llevar : styles.noLlevar}`}
                            onClick={() => toggleSeLleva(objeto.id)}
                          >
                            {objeto.seLleva ? '🚚 Se lleva' : '🚫 No se lleva'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ==================== TAB PRESUPUESTO ==================== */}
        {tabActiva === 'presupuesto' && (
          <section className={styles.tabContent}>
            {/* Resumen presupuesto */}
            <div className={styles.resumenPresupuesto}>
              <div className={`${styles.resumenCard} ${styles.estimado}`}>
                <span className={styles.resumenLabel}>Estimado</span>
                <span className={styles.resumenValor}>{formatCurrency(totalEstimado)}</span>
              </div>
              <div className={`${styles.resumenCard} ${styles.real}`}>
                <span className={styles.resumenLabel}>Real</span>
                <span className={styles.resumenValor}>{formatCurrency(totalReal)}</span>
              </div>
              <div className={`${styles.resumenCard} ${diferencia >= 0 ? styles.positivo : styles.negativo}`}>
                <span className={styles.resumenLabel}>Diferencia</span>
                <span className={styles.resumenValor}>
                  {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
                </span>
              </div>
            </div>

            {/* Añadir gasto */}
            <div className={styles.addPanel}>
              <input
                type="text"
                value={nuevoGasto.concepto}
                onChange={(e) => setNuevoGasto(prev => ({ ...prev, concepto: e.target.value }))}
                placeholder="Concepto del gasto"
                className={styles.inputConcepto}
              />
              <input
                type="number"
                value={nuevoGasto.estimado}
                onChange={(e) => setNuevoGasto(prev => ({ ...prev, estimado: e.target.value }))}
                placeholder="Estimado (€)"
                min="0"
                className={styles.inputEstimado}
              />
              <button onClick={agregarGasto} className={styles.btnAdd}>
                + Añadir
              </button>
            </div>

            {/* Lista de gastos */}
            <div className={styles.gastosPanel}>
              {datos.presupuesto.map(gasto => (
                <div
                  key={gasto.id}
                  className={`${styles.gastoRow} ${gasto.pagado ? styles.pagado : ''}`}
                >
                  <div className={styles.gastoInfo}>
                    <span className={styles.gastoConcepto}>{gasto.concepto}</span>
                    <button
                      className={`${styles.btnPagado} ${gasto.pagado ? styles.pagadoActivo : ''}`}
                      onClick={() => togglePagado(gasto.id)}
                    >
                      {gasto.pagado ? '✓ Pagado' : '○ Pendiente'}
                    </button>
                  </div>
                  <div className={styles.gastoInputs}>
                    <div className={styles.gastoInputGroup}>
                      <label>Estimado</label>
                      <input
                        type="number"
                        value={gasto.estimado || ''}
                        onChange={(e) => actualizarGasto(gasto.id, 'estimado', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        className={styles.inputGasto}
                      />
                    </div>
                    <div className={styles.gastoInputGroup}>
                      <label>Real</label>
                      <input
                        type="number"
                        value={gasto.real || ''}
                        onChange={(e) => actualizarGasto(gasto.id, 'real', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        className={styles.inputGasto}
                      />
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => eliminarGasto(gasto.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Acciones generales */}
        <section className={styles.accionesPanel}>
          <button onClick={exportarResumen} className={styles.btnAccion}>
            📤 Exportar resumen
          </button>
          <button onClick={guardarMudanza} className={styles.btnAccion}>
            💾 Guardar mudanza
          </button>
          <button onClick={nuevaMudanza} className={styles.btnAccionSecundario}>
            🆕 Nueva mudanza
          </button>
        </section>

        {/* Mudanzas guardadas */}
        {mudanzasGuardadas.length > 0 && (
          <section className={styles.mudanzasGuardadasPanel}>
            <h3 className={styles.seccionTitulo}>📁 Mudanzas guardadas</h3>
            <div className={styles.mudanzasGrid}>
              {mudanzasGuardadas.map(mudanza => (
                <div key={mudanza.id} className={styles.mudanzaCard}>
                  <div className={styles.mudanzaCardHeader}>
                    <span className={styles.mudanzaNombre}>{mudanza.nombre}</span>
                    <span className={styles.mudanzaFecha}>{mudanza.fechaGuardado}</span>
                  </div>
                  <p className={styles.mudanzaResumen}>
                    {mudanza.tareas.filter(t => t.completada).length}/{mudanza.tareas.length} tareas •
                    {mudanza.inventario.length} objetos •
                    {formatCurrency(mudanza.presupuesto.reduce((a, g) => a + g.real, 0))}
                  </p>
                  <div className={styles.mudanzaCardAcciones}>
                    <button onClick={() => cargarMudanza(mudanza)} className={styles.btnCargar}>
                      Cargar
                    </button>
                    <button onClick={() => eliminarMudanzaGuardada(mudanza.id)} className={styles.btnEliminar}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <RelatedApps apps={getRelatedApps('planificador-mudanzas')} />
      <Footer appName="planificador-mudanzas" />
    </div>
  );
}
