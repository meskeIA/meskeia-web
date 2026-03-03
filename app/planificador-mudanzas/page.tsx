'use client';

import { useState, useEffect } from 'react';
import styles from './PlanificadorMudanzas.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
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

      <LegalNotice />

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

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection title="📦 Guía completa para organizar tu mudanza sin estrés" subtitle="Todo lo que necesitas saber para planificar, presupuestar y ejecutar tu mudanza con éxito en España">

        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2>⚖️ ¿Contratar empresa, alquilar furgoneta o mudanza propia?</h2>
          <p className={styles.eduIntro}>
            La decisión más importante de tu mudanza. Cada opción tiene ventajas según tu volumen de pertenencias, distancia y presupuesto disponible.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>🏢 Empresa mudanzas</th>
                  <th>🚐 Furgoneta alquilada</th>
                  <th>🚗 Mudanza propia</th>
                  <th>📦 Empresa básica (solo transporte)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Coste aproximado</strong></td>
                  <td>800-3.000 €</td>
                  <td>150-400 €/día</td>
                  <td>0-100 € (combustible)</td>
                  <td>400-900 €</td>
                </tr>
                <tr>
                  <td><strong>Esfuerzo físico</strong></td>
                  <td>Mínimo</td>
                  <td>Muy alto</td>
                  <td>Muy alto</td>
                  <td>Alto (tú embala y sube)</td>
                </tr>
                <tr>
                  <td><strong>Seguro de daños</strong></td>
                  <td>✅ Incluido</td>
                  <td>⚠️ Opcional extra</td>
                  <td>❌ No incluido</td>
                  <td>⚠️ Limitado</td>
                </tr>
                <tr>
                  <td><strong>Distancia óptima</strong></td>
                  <td>Cualquier distancia</td>
                  <td>Local o regional</td>
                  <td>Muy local (&lt;20km)</td>
                  <td>Local o provincial</td>
                </tr>
                <tr>
                  <td><strong>Volumen de objetos</strong></td>
                  <td>Cualquier volumen</td>
                  <td>Piso completo (4-6 viajes)</td>
                  <td>Estudio o pocos muebles</td>
                  <td>Piso completo sin muebles grandes</td>
                </tr>
                <tr>
                  <td><strong>Muebles grandes</strong></td>
                  <td>✅ Desmontan/remontan</td>
                  <td>⚠️ Tú te encargas</td>
                  <td>❌ Complicado</td>
                  <td>⚠️ Solo transporte</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Familia completa, distancias largas, poco tiempo</td>
                  <td>Persona joven con ayuda de amigos</td>
                  <td>Estudiante con pocos objetos</td>
                  <td>Quien puede embalar pero no cargar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.eduEscenarios}>
          <h2>💼 4 perfiles de mudanza y sus estrategias</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Estudiante (piso compartido)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación típica:</strong></p>
                <code>{`- Volumen: 5-10 cajas + maletas\n- Distancia: 50-500km\n- Presupuesto: 200-400 €\n- Tiempo disponible: fin de semana`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Estrategia óptima:</strong> Alquiler de furgoneta + amigos. Vende muebles pesados antes (Facebook Marketplace) y compra nuevos en destino (Ikea). Muchas empresas como BlaBlaCar Cargo ofrecen transporte de cajas a bajo coste. Reserva con 3-4 semanas de antelación, especialmente en septiembre (temporada alta universitaria).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👔</span>
                <h3>Profesional soltero (cambio de ciudad)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación típica:</strong></p>
                <code>{`- Volumen: 1 dormitorio + salón completo\n- Distancia: 200-800km\n- Presupuesto: 600-1.200 €\n- Tiempo: muy limitado (trabaja)`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Estrategia óptima:</strong> Empresa de mudanzas básica (solo transporte) o servicio completo si el trabajo lo paga. Pide 3-5 presupuestos con 4-6 semanas de antelación. Muchas empresas negocian el precio si hay flexibilidad en la fecha (lunes-martes suelen ser 15-20% más baratos que fines de semana).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧‍👦</span>
                <h3>Familia con niños (primera vivienda)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación típica:</strong></p>
                <code>{`- Volumen: 3-4 dormitorios\n- Distancia: cualquier\n- Presupuesto: 1.500-3.500 €\n- Complejidad: muy alta (niños, mascotas)`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Estrategia óptima:</strong> Empresa de mudanzas completa con servicio de embalaje incluido. Vale la pena el extra porque protege los objetos con cobertura de seguro. Planifica con 8+ semanas de antelación. Organiza el cuidado de los niños para el día D (no pueden estar en casa durante la mudanza). Reserva un colchón de 500-1.000 € para gastos imprevistos de la nueva vivienda.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👴</span>
                <h3>Persona mayor (vaciado de vivienda)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación típica:</strong></p>
                <code>{`- Volumen: piso completo 40-60 años de objetos\n- Proceso: 3-6 semanas de organización\n- Necesidad: vaciado + donación + venta\n- Presupuesto variable`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Estrategia óptima:</strong> Empezar por el vaciado de objetos innecesarios (servicios de recogida gratuita de Cruz Roja, Caritas o Humana para ropa/libros). Para muebles de valor, considerar subastas online (Catawiki, eBay). Muchas empresas de mudanza ofrecen "servicio de vaciado" todo incluido por 500-1.500 €. Reservar contenedor de escombros si hay electrodomésticos viejos.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>❓ Preguntas frecuentes sobre mudanzas</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuánto tiempo de antelación necesito para planificar una mudanza?</h4>
              <p>
                Depende del tamaño y distancia. Para mudanzas locales pequeñas (estudiante), con <strong>2-3 semanas</strong> es suficiente. Para mudanzas de piso completo, lo ideal son <strong>6-8 semanas</strong>. Para mudanzas internacionales o de empresa, se recomienda <strong>3-6 meses</strong>. En temporada alta (junio-septiembre y enero-febrero), las empresas se reservan antes; planifica con el doble de tiempo habitual.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Solicita presupuestos de al menos 3-5 empresas en cuanto tengas la fecha confirmada. Las empresas suelen dar mejor precio cuando ven que estás comparando.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué documentos necesito cambiar al hacer una mudanza?</h4>
              <p>
                Los obligatorios por ley son: <strong>empadronamiento</strong> (30 días desde el cambio, Ayuntamiento), <strong>DNI/carnet de conducir</strong> (3 meses desde el empadronamiento), <strong>Hacienda/AEAT</strong> (antes de la siguiente declaración) y <strong>Seguridad Social</strong> (30 días). Los recomendados: banco, seguro del hogar, suscripciones (Amazon, Netflix), trabajo, médico de cabecera y colegio de los hijos.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Usa el planificador de tareas para no olvidar ninguna notificación. El cambio de empadronamiento es la base: muchos trámites posteriores lo requieren.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo sé si una empresa de mudanzas es fiable?</h4>
              <p>
                Verifica estos puntos antes de contratar: <strong>CIF/NIF visible</strong> en presupuesto, <strong>seguro de responsabilidad civil</strong> (mínimo 600.000 €, pídelo por escrito), <strong>reseñas verificadas</strong> en Google Maps (mínimo 20 reseñas, media &gt;4.0), <strong>presupuesto por escrito</strong> (nunca verbal), y <strong>dirección física verificable</strong> de la empresa. Desconfía de precios muy por debajo de la media: suelen añadir extras no comunicados.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Pide al menos 3 presupuestos. Si uno es más del 30% más barato que los demás, pregunta exactamente qué no incluye.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué debo hacer con los electrodomésticos antes de la mudanza?</h4>
              <p>
                <strong>Nevera/congelador:</strong> Vaciar y descongelar con 48 horas de antelación (coloca toallas para absorber el agua). <strong>Lavadora:</strong> Vaciar el tambor y poner los tornillos de transporte (si los conservas). <strong>Lavavajillas:</strong> Vaciar completamente. <strong>Horno:</strong> Limpiar bien para evitar olores. Los electrodomésticos deben transportarse en vertical (lavadora, nevera). Si la empresa de mudanzas los tumbara, pueden sufrir daños internos.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Si tu lavadora ya no tiene los tornillos de transporte, puedes comprarlos genéricos online por 5-15 €. Transportarla sin ellos puede dañar el tambor.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo empacar correctamente para que no se rompa nada?</h4>
              <p>
                Reglas básicas: <strong>objetos pesados en cajas pequeñas</strong> (libros, vajilla); <strong>objetos frágiles con papel de burbujas</strong> (mínimo 3 capas); <strong>ropa como relleno</strong> en cajas con objetos de vidrio; <strong>cajas siempre llenas</strong> (no dejar huecos, rellenar con papel periódico para que no se muevan). Etiqueta cada caja con: habitación de destino, contenido básico y si es frágil.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Supermercados y librerías regalan cajas de buena calidad. Solo compra el papel burbuja y la cinta de embalar. Ahorra 50-100 € en material de embalaje.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Es necesario hacer fotos de la vivienda antes de irse?</h4>
              <p>
                <strong>Sí, es fundamental si tienes contrato de alquiler.</strong> Documenta con fotos y vídeo (con fecha visible) el estado de cada habitación, electrodomésticos y paredes. Envía el archivo por email al propietario el mismo día de entrega de llaves. En caso de conflicto sobre la fianza, estas pruebas son determinantes. Si eres propietario que vende, las fotos del estado original también protegen ante posibles reclamaciones del comprador.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Fotografía especialmente los desperfectos ya existentes antes de tu mudanza de entrada. Son los que más conflictos generan al salir.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo gestiono los suministros (luz, agua, gas) en el cambio?</h4>
              <p>
                Para la vivienda que abandonas: solicita la <strong>baja</strong> o cambio de titular 15-30 días antes. Para la nueva vivienda: solicita el <strong>alta</strong> o cambio de titular 15-30 días antes. El día de la mudanza, anota las lecturas de los contadores (agua, luz, gas) con foto del marcador. Esto evita disputas sobre el consumo del período de transición. Los nuevos suministros pueden tardar 7-15 días laborables en darse de alta.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Compara tarifas de luz y gas antes de dar el alta en la nueva vivienda. Es el momento perfecto para cambiar a un proveedor más barato sin penalización.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cuánto dinero debo reservar como colchón extra para la mudanza?</h4>
              <p>
                Calcula el <strong>presupuesto de la empresa + 20-30% adicional</strong> para imprevistos. Los más frecuentes: piso origen con ascensor averiado (requiere más personal: +150-300 €), furgoneta adicional por volumen mayor al estimado (+200-400 €), reparaciones urgentes en vivienda nueva (cerradura, humedades, etc.), gastos de primeros días (comidas fuera, hotel si la mudanza se retrasa). Para una mudanza media de familia, reserva mínimo 500-1.000 € de colchón.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Usa la pestaña Presupuesto de este planificador para registrar estimados y reales. Así detectas desviaciones a tiempo.
              </p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2>📋 Plan de acción: 7 semanas para una mudanza perfecta</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>8 semanas antes: Decisiones estratégicas</h4>
                <p>
                  Decide si contratas empresa o te lo gestionas. Solicita 3-5 presupuestos. Define qué te llevas y qué vendes/donas/tiras. Haz el inventario general para estimar el volumen real. Este paso determina el presupuesto final: una mala estimación puede aumentar el coste un 30%.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>6 semanas antes: Contratación y notificaciones</h4>
                <p>
                  Contrata la empresa de mudanzas o reserva la furgoneta. Notifica el cambio de dirección a: banco, trabajo, Hacienda, Seguridad Social y suscripciones. Solicita la baja de suministros en origen y el alta en destino (los suministros tardan 2-4 semanas).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>4 semanas antes: Embalaje progresivo</h4>
                <p>
                  Empieza a embalar por los objetos que menos usas: libros, decoración, ropa de temporada, electrodomésticos secundarios. Etiqueta cada caja con habitación destino y contenido. Aprovecha para donar o vender objetos que no usas en Facebook Marketplace o Wallapop.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>1 semana antes: Preparación final</h4>
                <p>
                  Prepara la "maleta de emergencia": documentos importantes, medicamentos, cargadores, muda de ropa para 3 días, artículos de aseo. Descongela nevera y congelador (48h antes). Desmonta muebles que requieran. Confirma hora exacta con la empresa. Haz fotos del estado de la vivienda.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Día D: Supervisión y control</h4>
                <p>
                  Supervisa la carga del camión. Anota las lecturas de contadores (foto con fecha). Haz el inventario final de cajas. Revisa cada habitación antes de irte. Entrega las llaves con acta notarial o email confirmando el estado (crucial para la fianza). Supervisa también la descarga en destino.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Primeros 3 días: Esenciales primero</h4>
                <p>
                  Monta primero las camas y la cocina básica. Desembala por prioridades (no por habitaciones). Localiza: médico de cabecera más cercano, supermercado, farmacia y parada de transporte público. Haz el empadronamiento en los primeros 30 días (es obligatorio y base para otros trámites).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Primera semana: Trámites administrativos</h4>
                <p>
                  Actualiza el DNI/carnet de conducir (con cita previa, puede tardar 2-4 semanas). Actualiza la dirección en Hacienda (www.sede.hacienda.gob.es). Cambia la tarjeta sanitaria al centro de salud del nuevo domicilio. Notifica a tu seguro del hogar el cambio de dirección para mantener la cobertura.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.eduTips}>
          <h2>✅ 6 hábitos del mudador inteligente</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Etiqueta con colores por habitación</h4>
              <p>Asigna un color de cinta adhesiva a cada habitación destino. Los mozos de mudanza sabrán exactamente dónde colocar cada caja sin tener que preguntar. Ahorra 1-2 horas en la descarga.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Fotografía el interior de cada caja</h4>
              <p>Antes de cerrar cada caja, fotografía el contenido. Si algo llega roto, tienes prueba del estado original para reclamar al seguro o a la empresa. También ayuda a encontrar objetos sin abrir todas las cajas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Crea una "caja de primer día"</h4>
              <p>Una caja especial (color diferente, marcada como urgente) con: cafetera, tazas, sábanas, toallas, jabón, papel higiénico, servilletas, snacks y cargadores. Ábrela primero. El resto puede esperar días.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Pesa las cajas antes de cerrarlas</h4>
              <p>Las cajas no deben superar los 20kg (para poder manejarlas con seguridad). Cajas muy pesadas aumentan el riesgo de rotura y lesiones. Si supera 20kg, divide el contenido en dos cajas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Negocia el precio con flexibilidad de fecha</h4>
              <p>Las mudanzas de lunes a jueves cuestan un 15-25% menos que los fines de semana. Si puedes elegir la fecha, ahorra en este concepto. Algunas empresas también ofrecen descuento por pago al contado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Guarda todos los recibos de gastos</h4>
              <p>Si cambias de ciudad por motivos laborales, muchos gastos de mudanza son deducibles en el IRPF. Guarda facturas de: empresa de mudanzas, alquiler de furgoneta, material de embalaje, viaje, alojamiento temporal.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.eduWarning}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores costosos que arruinan las mudanzas</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Contratar sin pedir presupuesto por escrito:</strong> Un presupuesto verbal no tiene validez legal. Si la empresa añade extras no pactados el día de la mudanza, estarás en una posición muy débil para negarte. Siempre exige presupuesto detallado por email o documento firmado antes de confirmar.
              </li>
              <li>
                <strong>❌ No verificar el seguro de daños:</strong> Las empresas de mudanzas tienen cobertura limitada por defecto (suele ser solo 2-5 € por kilo transportado). Si tienes objetos valiosos (obras de arte, electrónica cara, instrumentos musicales), contrata cobertura adicional o un seguro específico de mudanza.
              </li>
              <li>
                <strong>❌ Olvidar notificar el cambio de dirección a Hacienda:</strong> Si no actualizas la dirección fiscal, las notificaciones importantes de la AEAT irán a tu domicilio anterior. Puedes perderte requerimientos con multas por no responder. El plazo legal es antes de la siguiente declaración de la renta.
              </li>
              <li>
                <strong>❌ Dejar los suministros sin gestionar:</strong> Si no solicitas la baja en la vivienda que abandonas, pueden seguir cargándote cuotas mínimas. Peor aún: si el nuevo inquilino/propietario no da de alta los suyos, los gastos se acumularán en tu nombre hasta que solicites la baja.
              </li>
              <li>
                <strong>❌ Transportar la nevera o lavadora tumbadas sin precaución:</strong> La nevera transportada tumbada necesita estar en vertical durante 24-48 horas antes de enchufarse (el compresor necesita que el aceite vuelva a su posición). La lavadora sin tornillos de transporte puede sufrir daños en el tambor que no son visibles inmediatamente.
              </li>
              <li>
                <strong>❌ No hacer inventario del nuevo piso antes de entrar:</strong> Documenta el estado de la vivienda nueva antes de llevar tus muebles. Si hay desperfectos preexistentes (manchas, grietas, electrodomésticos averiados), notifícalo al propietario ese mismo día. De lo contrario, al salir, pueden hacerte responsable de daños que ya existían.
              </li>
              <li>
                <strong>❌ Infravalorar el tiempo necesario para desembalar:</strong> El 80% de las familias subestima el tiempo de instalación. Una mudanza de piso completo requiere 1-3 semanas de trabajo parcial para quedar completamente organizada. No planifiques eventos sociales ni compromisos importantes en las dos semanas posteriores a la mudanza.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-mudanzas')} />
      <ShareCard appName="planificador-mudanzas" />
      <Footer appName="planificador-mudanzas" />
    </div>
  );
}
