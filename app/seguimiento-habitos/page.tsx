'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './SeguimientoHabitos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Habito {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  categoria: string;
  frecuencia: 'diario' | 'semanal' | 'personalizado';
  diasSemana?: number[]; // 0=Lun, 1=Mar, etc.
  vecesxSemana?: number;
  objetivo: number;
  tipo: 'construir' | 'evitar'; // construir = hacer más, evitar = no hacer
  registros: Record<string, { completado: boolean; nota?: string }>;
  fechaCreacion: string;
}

interface Logro {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  dias: number;
}

// Colores disponibles
const COLORES = [
  '#2E86AB', '#48A9A6', '#E57373', '#FFB74D',
  '#9575CD', '#4DB6AC', '#FF8A65', '#81C784',
  '#64B5F6', '#F06292'
];

// Categorías
const CATEGORIAS = [
  { id: 'salud', nombre: 'Salud', icono: '💪' },
  { id: 'productividad', nombre: 'Productividad', icono: '📚' },
  { id: 'bienestar', nombre: 'Bienestar', icono: '🧘' },
  { id: 'finanzas', nombre: 'Finanzas', icono: '💰' },
  { id: 'relaciones', nombre: 'Relaciones', icono: '❤️' },
  { id: 'creatividad', nombre: 'Creatividad', icono: '🎨' },
  { id: 'otro', nombre: 'Otro', icono: '📌' },
];

// Logros
const LOGROS: Logro[] = [
  { id: 'racha_7', icono: '🏅', titulo: '7 Días', descripcion: 'Racha de 7 días', dias: 7 },
  { id: 'racha_21', icono: '🌟', titulo: '21 Días', descripcion: 'Primer mes en marcha (hito popular, los estudios estiman 2-8 meses para consolidar un hábito)', dias: 21 },
  { id: 'racha_30', icono: '🔥', titulo: '30 Días', descripcion: 'Un mes completo', dias: 30 },
  { id: 'racha_66', icono: '💎', titulo: '66 Días', descripcion: 'Hábito consolidado', dias: 66 },
  { id: 'racha_100', icono: '🎯', titulo: '100 Días', descripcion: 'Centenario', dias: 100 },
  { id: 'racha_365', icono: '👑', titulo: '1 Año', descripcion: '¡Un año entero!', dias: 365 },
];

// Iconos sugeridos
const ICONOS_SUGERIDOS = ['💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '🎯', '✍️', '🎸', '💰', '🚭', '📵', '🧹'];

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_SEMANA_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function SeguimientoHabitosPage() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [mesActual, setMesActual] = useState(new Date());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [habitoEditando, setHabitoEditando] = useState<Habito | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'habitos' | 'calendario' | 'estadisticas'>('habitos');
  const [celebracion, setCelebracion] = useState<{ logro: Logro; habito: Habito } | null>(null);

  // Form state
  const [formNombre, setFormNombre] = useState('');
  const [formIcono, setFormIcono] = useState('💪');
  const [formColor, setFormColor] = useState(COLORES[0]);
  const [formCategoria, setFormCategoria] = useState('salud');
  const [formFrecuencia, setFormFrecuencia] = useState<'diario' | 'semanal' | 'personalizado'>('diario');
  const [formDiasSemana, setFormDiasSemana] = useState<number[]>([0, 1, 2, 3, 4]); // L-V por defecto
  const [formObjetivo, setFormObjetivo] = useState(30);
  const [formTipo, setFormTipo] = useState<'construir' | 'evitar'>('construir');

  // Cargar datos de localStorage
  useEffect(() => {
    const datosGuardados = localStorage.getItem('meskeia_habitos_v2');
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        setHabitos(datos.habitos || []);
      } catch (e) {
        console.error('Error al cargar datos:', e);
      }
    }
  }, []);

  // Guardar datos
  const guardarDatos = useCallback((nuevosHabitos: Habito[]) => {
    const datos = {
      habitos: nuevosHabitos,
      version: '2.0',
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('meskeia_habitos_v2', JSON.stringify(datos));
  }, []);

  // Calcular racha actual
  const calcularRachaActual = useCallback((habito: Habito): number => {
    const hoy = new Date();
    let racha = 0;
    const fecha = new Date(hoy);

    while (true) {
      const fechaStr = fecha.toISOString().split('T')[0];

      // Verificar si este día aplica según la frecuencia
      const diaSemana = (fecha.getDay() + 6) % 7; // Convertir a L=0, D=6
      let aplicaHoy = true;

      if (habito.frecuencia === 'personalizado' && habito.diasSemana) {
        aplicaHoy = habito.diasSemana.includes(diaSemana);
      }

      if (aplicaHoy) {
        if (habito.registros[fechaStr]?.completado) {
          racha++;
        } else if (fechaStr !== hoy.toISOString().split('T')[0]) {
          // Si no está completado y no es hoy, rompe la racha
          break;
        }
      }

      fecha.setDate(fecha.getDate() - 1);

      // Limitar búsqueda a 1 año
      if (racha > 365) break;
    }

    return racha;
  }, []);

  // Calcular mejor racha
  const calcularMejorRacha = useCallback((habito: Habito): number => {
    const fechasOrdenadas = Object.keys(habito.registros)
      .filter(f => habito.registros[f]?.completado)
      .sort();

    if (fechasOrdenadas.length === 0) return 0;

    let mejorRacha = 1;
    let rachaActual = 1;

    for (let i = 1; i < fechasOrdenadas.length; i++) {
      const fechaAnterior = new Date(fechasOrdenadas[i - 1]);
      const fechaActual = new Date(fechasOrdenadas[i]);
      const diferenciaDias = Math.floor((fechaActual.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24));

      if (diferenciaDias === 1) {
        rachaActual++;
        mejorRacha = Math.max(mejorRacha, rachaActual);
      } else {
        rachaActual = 1;
      }
    }

    return mejorRacha;
  }, []);

  // Calcular tasa de cumplimiento
  const calcularTasaCumplimiento = useCallback((habito: Habito): number => {
    const fechaInicio = new Date(habito.fechaCreacion);
    const hoy = new Date();
    let diasAplicables = 0;
    let diasCompletados = 0;

    const fecha = new Date(fechaInicio);
    while (fecha <= hoy) {
      const diaSemana = (fecha.getDay() + 6) % 7;
      let aplica = true;

      if (habito.frecuencia === 'personalizado' && habito.diasSemana) {
        aplica = habito.diasSemana.includes(diaSemana);
      }

      if (aplica) {
        diasAplicables++;
        const fechaStr = fecha.toISOString().split('T')[0];
        if (habito.registros[fechaStr]?.completado) {
          diasCompletados++;
        }
      }

      fecha.setDate(fecha.getDate() + 1);
    }

    return diasAplicables > 0 ? Math.round((diasCompletados / diasAplicables) * 100) : 0;
  }, []);

  // Toggle día
  const toggleDia = useCallback((habitoId: string, fechaStr: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaStr > hoy) return; // No permitir marcar días futuros

    setHabitos(prev => {
      const nuevos = prev.map(h => {
        if (h.id === habitoId) {
          const nuevoRegistros = { ...h.registros };
          if (nuevoRegistros[fechaStr]?.completado) {
            delete nuevoRegistros[fechaStr];
          } else {
            nuevoRegistros[fechaStr] = { completado: true };
          }
          return { ...h, registros: nuevoRegistros };
        }
        return h;
      });

      guardarDatos(nuevos);

      // Verificar logros
      const habito = nuevos.find(h => h.id === habitoId);
      if (habito) {
        const rachaActual = calcularRachaActual(habito);
        const logroAlcanzado = LOGROS.find(l => l.dias === rachaActual);
        if (logroAlcanzado) {
          setCelebracion({ logro: logroAlcanzado, habito });
          setTimeout(() => setCelebracion(null), 5000);
        }
      }

      return nuevos;
    });
  }, [guardarDatos, calcularRachaActual]);

  // Abrir modal nuevo hábito
  const abrirModalNuevo = () => {
    setHabitoEditando(null);
    setFormNombre('');
    setFormIcono('💪');
    setFormColor(COLORES[0]);
    setFormCategoria('salud');
    setFormFrecuencia('diario');
    setFormDiasSemana([0, 1, 2, 3, 4]);
    setFormObjetivo(30);
    setFormTipo('construir');
    setModalAbierto(true);
  };

  // Abrir modal editar
  const abrirModalEditar = (habito: Habito) => {
    setHabitoEditando(habito);
    setFormNombre(habito.nombre);
    setFormIcono(habito.icono);
    setFormColor(habito.color);
    setFormCategoria(habito.categoria);
    setFormFrecuencia(habito.frecuencia);
    setFormDiasSemana(habito.diasSemana || [0, 1, 2, 3, 4]);
    setFormObjetivo(habito.objetivo);
    setFormTipo(habito.tipo);
    setModalAbierto(true);
  };

  // Guardar hábito
  const guardarHabito = () => {
    if (!formNombre.trim()) return;

    const nuevoHabito: Habito = {
      id: habitoEditando?.id || Date.now().toString(),
      nombre: formNombre.trim(),
      icono: formIcono,
      color: formColor,
      categoria: formCategoria,
      frecuencia: formFrecuencia,
      diasSemana: formFrecuencia === 'personalizado' ? formDiasSemana : undefined,
      objetivo: formObjetivo,
      tipo: formTipo,
      registros: habitoEditando?.registros || {},
      fechaCreacion: habitoEditando?.fechaCreacion || new Date().toISOString(),
    };

    setHabitos(prev => {
      let nuevos;
      if (habitoEditando) {
        nuevos = prev.map(h => h.id === habitoEditando.id ? nuevoHabito : h);
      } else {
        nuevos = [...prev, nuevoHabito];
      }
      guardarDatos(nuevos);
      return nuevos;
    });

    setModalAbierto(false);
  };

  // Eliminar hábito
  const eliminarHabito = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este hábito? Se perderán todos los registros.')) {
      setHabitos(prev => {
        const nuevos = prev.filter(h => h.id !== id);
        guardarDatos(nuevos);
        return nuevos;
      });
    }
  };

  // Toggle día de la semana en form
  const toggleDiaSemana = (dia: number) => {
    setFormDiasSemana(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia].sort()
    );
  };

  // Exportar datos
  const exportarDatos = () => {
    const datos = {
      habitos,
      version: '2.0',
      fecha: new Date().toISOString(),
      aplicacion: 'Seguimiento de Hábitos - meskeIA'
    };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitos-meskeia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar datos
  const importarDatos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const datos = JSON.parse(event.target?.result as string);
        if (datos.habitos && Array.isArray(datos.habitos)) {
          if (confirm('¿Reemplazar datos actuales con el respaldo?')) {
            setHabitos(datos.habitos);
            guardarDatos(datos.habitos);
          }
        }
      } catch {
        alert('Error al importar archivo');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Renderizar calendario
  const renderizarCalendario = () => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const hoy = new Date().toISOString().split('T')[0];

    // Calcular días vacíos al inicio (lunes = 0)
    let diaSemanaInicio = primerDia.getDay() - 1;
    if (diaSemanaInicio === -1) diaSemanaInicio = 6;

    const dias: React.ReactElement[] = [];

    // Días del mes anterior
    const ultimoDiaMesAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth(), 0);
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dia = ultimoDiaMesAnterior.getDate() - i;
      dias.push(
        <div key={`prev-${dia}`} className={`${styles.diaCelda} ${styles.diaOtroMes}`}>
          <span className={styles.diaNumero}>{dia}</span>
        </div>
      );
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
      const fechaStr = fecha.toISOString().split('T')[0];
      const esHoy = fechaStr === hoy;

      const indicadores = habitos.map(habito => {
        if (habito.registros[fechaStr]?.completado) {
          return (
            <div
              key={habito.id}
              className={styles.indicadorHabito}
              style={{ background: habito.color }}
              title={habito.nombre}
            />
          );
        }
        return null;
      }).filter(Boolean);

      dias.push(
        <div
          key={dia}
          className={`${styles.diaCelda} ${esHoy ? styles.diaHoy : ''}`}
        >
          <span className={styles.diaNumero}>{dia}</span>
          <div className={styles.diaIndicadores}>
            {indicadores}
          </div>
        </div>
      );
    }

    // Completar con días del siguiente mes
    const celdasRestantes = 35 - dias.length;
    for (let i = 1; i <= celdasRestantes && i <= 7; i++) {
      dias.push(
        <div key={`next-${i}`} className={`${styles.diaCelda} ${styles.diaOtroMes}`}>
          <span className={styles.diaNumero}>{i}</span>
        </div>
      );
    }

    return dias;
  };

  // Obtener logros desbloqueados
  const logrosDesbloqueados = new Set<string>();
  habitos.forEach(habito => {
    const mejorRacha = calcularMejorRacha(habito);
    LOGROS.forEach(logro => {
      if (mejorRacha >= logro.dias) {
        logrosDesbloqueados.add(logro.id);
      }
    });
  });

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📊</span> Seguimiento de Hábitos</h1>
        <p className={styles.subtitle}>Construye rutinas saludables con visualización de rachas</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="seguimiento-habitos-disclaimer"
      />

      {/* Navegación */}
      <div className={styles.navegacion}>
        <button
          type="button"
          className={`${styles.navBtn} ${vistaActiva === 'habitos' ? styles.navBtnActivo : ''}`}
          onClick={() => setVistaActiva('habitos')}
          aria-pressed={vistaActiva === 'habitos'}
        >
          <span aria-hidden="true">📋</span> Mis Hábitos
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${vistaActiva === 'calendario' ? styles.navBtnActivo : ''}`}
          onClick={() => setVistaActiva('calendario')}
          aria-pressed={vistaActiva === 'calendario'}
        >
          <span aria-hidden="true">📅</span> Calendario
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${vistaActiva === 'estadisticas' ? styles.navBtnActivo : ''}`}
          onClick={() => setVistaActiva('estadisticas')}
          aria-pressed={vistaActiva === 'estadisticas'}
        >
          <span aria-hidden="true">📈</span> Estadísticas
        </button>
      </div>

      {/* Acciones */}
      <div className={styles.acciones}>
        <button type="button" className={styles.btnPrimary} onClick={abrirModalNuevo}>
          <span aria-hidden="true">➕</span> Nuevo Hábito
        </button>
        <div className={styles.accionesSecundarias}>
          <button type="button" className={styles.btnSecondary} onClick={exportarDatos}>
            <span aria-hidden="true">💾</span> Exportar
          </button>
          <label className={styles.btnSecondary}>
            📥 Importar
            <input type="file" accept=".json" onChange={importarDatos} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Vista: Hábitos */}
      {vistaActiva === 'habitos' && (
        <div className={styles.habitosContainer}>
          {habitos.length === 0 ? (
            <div className={styles.estadoVacio}>
              <div className={styles.estadoVacioIcono}>📊</div>
              <p>Aún no tienes hábitos registrados</p>
              <button type="button" className={styles.btnPrimary} onClick={abrirModalNuevo}>
                Crear mi primer hábito
              </button>
            </div>
          ) : (
            habitos.map(habito => {
              const rachaActual = calcularRachaActual(habito);
              const mejorRacha = calcularMejorRacha(habito);
              const tasaCumplimiento = calcularTasaCumplimiento(habito);
              const hoy = new Date().toISOString().split('T')[0];
              const completadoHoy = habito.registros[hoy]?.completado;

              return (
                <div key={habito.id} className={styles.habitoCard}>
                  <div className={styles.habitoHeader}>
                    <div className={styles.habitoInfo}>
                      <div className={styles.habitoColor} style={{ background: habito.color }} />
                      <span className={styles.habitoNombre}>
                        <span aria-hidden="true">{habito.icono}</span> {habito.nombre}
                      </span>
                      {habito.tipo === 'evitar' && (
                        <span className={styles.habitoTipoEvitar}>Evitar</span>
                      )}
                    </div>
                    <div className={styles.habitoRacha}>
                      <span aria-hidden="true">🔥</span> {rachaActual} días
                    </div>
                  </div>

                  <div className={styles.habitoStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Mejor racha</span>
                      <span className={styles.statValue}>{mejorRacha} días</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Objetivo</span>
                      <span className={styles.statValue}>{habito.objetivo} días</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Cumplimiento</span>
                      <span className={styles.statValue}>{tasaCumplimiento}%</span>
                    </div>
                  </div>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.min((rachaActual / habito.objetivo) * 100, 100)}%` }}
                    />
                  </div>

                  {/* Últimos 7 días */}
                  <div className={styles.ultimosDias}>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const fecha = new Date();
                      fecha.setDate(fecha.getDate() - (6 - i));
                      const fechaStr = fecha.toISOString().split('T')[0];
                      const completado = habito.registros[fechaStr]?.completado;
                      const diaSemana = (fecha.getDay() + 6) % 7;

                      return (
                        <button
                          key={fechaStr}
                          type="button"
                          className={`${styles.diaCirculo} ${completado ? styles.diaCompletado : ''}`}
                          style={completado ? { background: habito.color, borderColor: habito.color } : {}}
                          onClick={() => toggleDia(habito.id, fechaStr)}
                          title={`${DIAS_SEMANA_LARGO[diaSemana]} ${fecha.getDate()}`}
                          aria-pressed={!!completado}
                        >
                          <span className={styles.diaCirculoLetra}>{DIAS_SEMANA[diaSemana]}</span>
                          {completado && <span className={styles.diaCirculoCheck}>✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.habitoAcciones}>
                    <button
                      type="button"
                      className={`${styles.btnMarcar} ${completadoHoy ? styles.btnMarcado : ''}`}
                      style={completadoHoy ? { background: habito.color, borderColor: habito.color } : {}}
                      onClick={() => toggleDia(habito.id, hoy)}
                      aria-pressed={!!completadoHoy}
                    >
                      {completadoHoy ? '✓ Completado hoy' : '○ Marcar hoy'}
                    </button>
                    <button type="button" className={styles.btnIcon} onClick={() => abrirModalEditar(habito)} title="Editar">
                      ✏️
                    </button>
                    <button type="button" className={styles.btnIcon} onClick={() => eliminarHabito(habito.id)} title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Vista: Calendario */}
      {vistaActiva === 'calendario' && (
        <div className={styles.calendarioSection}>
          <div className={styles.calendarioHeader}>
            <h2 className={styles.calendarioTitulo}>📅 Calendario Mensual</h2>
            <div className={styles.calendarioNav}>
              <button
                type="button"
                className={styles.navMesBtn}
                onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))}
              >
                ← Anterior
              </button>
              <span className={styles.mesActual}>
                {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
              </span>
              <button
                type="button"
                className={styles.navMesBtn}
                onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1))}
              >
                Siguiente →
              </button>
            </div>
          </div>

          <div className={styles.calendarioGrid}>
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className={styles.diaSemana}>{dia}</div>
            ))}
            {renderizarCalendario()}
          </div>

          <div className={styles.calendarioLeyenda}>
            {habitos.map(habito => (
              <div key={habito.id} className={styles.leyendaItem}>
                <div className={styles.leyendaColor} style={{ background: habito.color }} />
                <span><span aria-hidden="true">{habito.icono}</span> {habito.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista: Estadísticas */}
      {vistaActiva === 'estadisticas' && (
        <div className={styles.estadisticasSection}>
          {/* Resumen general */}
          <div className={styles.resumenGeneral}>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono} aria-hidden="true">📊</span>
              <span className={styles.resumenValor}>{habitos.length}</span>
              <span className={styles.resumenLabel}>Hábitos activos</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono} aria-hidden="true">🔥</span>
              <span className={styles.resumenValor}>
                {habitos.length > 0 ? Math.max(...habitos.map(h => calcularRachaActual(h))) : 0}
              </span>
              <span className={styles.resumenLabel}>Mejor racha actual</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono} aria-hidden="true">🏆</span>
              <span className={styles.resumenValor}>{logrosDesbloqueados.size}</span>
              <span className={styles.resumenLabel}>Logros desbloqueados</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono} aria-hidden="true">📈</span>
              <span className={styles.resumenValor}>
                {habitos.length > 0
                  ? Math.round(habitos.reduce((acc, h) => acc + calcularTasaCumplimiento(h), 0) / habitos.length)
                  : 0}%
              </span>
              <span className={styles.resumenLabel}>Cumplimiento promedio</span>
            </div>
          </div>

          {/* Logros */}
          <div className={styles.logrosSection}>
            <h3 className={styles.seccionTitulo}>🏆 Mis Logros</h3>
            <div className={styles.logrosGrid}>
              {LOGROS.map(logro => {
                const desbloqueado = logrosDesbloqueados.has(logro.id);
                return (
                  <div
                    key={logro.id}
                    className={`${styles.logroCard} ${desbloqueado ? styles.logroDesbloqueado : styles.logroBloqueado}`}
                  >
                    <div className={styles.logroIcono} aria-hidden="true">{logro.icono}</div>
                    <div className={styles.logroTitulo}>{logro.titulo}</div>
                    <div className={styles.logroDescripcion}>{logro.descripcion}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalle por hábito */}
          {habitos.length > 0 && (
            <div className={styles.detalleHabitos}>
              <h3 className={styles.seccionTitulo}>📋 Detalle por Hábito</h3>
              {habitos.map(habito => {
                const rachaActual = calcularRachaActual(habito);
                const mejorRacha = calcularMejorRacha(habito);
                const tasa = calcularTasaCumplimiento(habito);
                const totalDias = Object.keys(habito.registros).filter(f => habito.registros[f]?.completado).length;

                return (
                  <div key={habito.id} className={styles.detalleCard}>
                    <div className={styles.detalleHeader}>
                      <div className={styles.detalleColor} style={{ background: habito.color }} />
                      <span className={styles.detalleNombre}><span aria-hidden="true">{habito.icono}</span> {habito.nombre}</span>
                    </div>
                    <div className={styles.detalleStats}>
                      <div className={styles.detalleStat}>
                        <span className={styles.detalleStatValor}>{rachaActual}</span>
                        <span className={styles.detalleStatLabel}>Racha actual</span>
                      </div>
                      <div className={styles.detalleStat}>
                        <span className={styles.detalleStatValor}>{mejorRacha}</span>
                        <span className={styles.detalleStatLabel}>Mejor racha</span>
                      </div>
                      <div className={styles.detalleStat}>
                        <span className={styles.detalleStatValor}>{tasa}%</span>
                        <span className={styles.detalleStatLabel}>Cumplimiento</span>
                      </div>
                      <div className={styles.detalleStat}>
                        <span className={styles.detalleStatValor}>{totalDias}</span>
                        <span className={styles.detalleStatLabel}>Total días</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo/Editar Hábito */}
      {modalAbierto && (
        <div className={styles.modalOverlay} onClick={() => setModalAbierto(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{habitoEditando ? 'Editar Hábito' : 'Nuevo Hábito'}</h3>
              <button type="button" className={styles.modalClose} onClick={() => setModalAbierto(false)}>✕</button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre del hábito *</label>
              <input
                type="text"
                className={styles.formInput}
                value={formNombre}
                onChange={e => setFormNombre(e.target.value)}
                placeholder="Ej: Ejercicio diario"
                maxLength={50}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Icono</label>
              <div className={styles.iconosGrid}>
                {ICONOS_SUGERIDOS.map(icono => (
                  <button
                    key={icono}
                    type="button"
                    className={`${styles.iconoBtn} ${formIcono === icono ? styles.iconoSeleccionado : ''}`}
                    onClick={() => setFormIcono(icono)}
                    aria-pressed={formIcono === icono}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Color</label>
              <div className={styles.coloresGrid}>
                {COLORES.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorBtn} ${formColor === color ? styles.colorSeleccionado : ''}`}
                    style={{ background: color }}
                    onClick={() => setFormColor(color)}
                    aria-pressed={formColor === color}
                  />
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Categoría</label>
              <div className={styles.categoriasGrid}>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoriaBtn} ${formCategoria === cat.id ? styles.categoriaSeleccionada : ''}`}
                    onClick={() => setFormCategoria(cat.id)}
                    aria-pressed={formCategoria === cat.id}
                  >
                    <span aria-hidden="true">{cat.icono}</span> {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo de hábito</label>
              <div className={styles.tipoGrid}>
                <button
                  type="button"
                  className={`${styles.tipoBtn} ${formTipo === 'construir' ? styles.tipoSeleccionado : ''}`}
                  onClick={() => setFormTipo('construir')}
                  aria-pressed={formTipo === 'construir'}
                >
                  <span aria-hidden="true">✅</span> Construir
                  <span className={styles.tipoDesc}>Quiero hacer más</span>
                </button>
                <button
                  type="button"
                  className={`${styles.tipoBtn} ${formTipo === 'evitar' ? styles.tipoSeleccionado : ''}`}
                  onClick={() => setFormTipo('evitar')}
                  aria-pressed={formTipo === 'evitar'}
                >
                  <span aria-hidden="true">🚫</span> Evitar
                  <span className={styles.tipoDesc}>Quiero dejar de hacer</span>
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Frecuencia</label>
              <div className={styles.frecuenciaGrid}>
                <button
                  type="button"
                  className={`${styles.frecuenciaBtn} ${formFrecuencia === 'diario' ? styles.frecuenciaSeleccionada : ''}`}
                  onClick={() => setFormFrecuencia('diario')}
                  aria-pressed={formFrecuencia === 'diario'}
                >
                  Todos los días
                </button>
                <button
                  type="button"
                  className={`${styles.frecuenciaBtn} ${formFrecuencia === 'personalizado' ? styles.frecuenciaSeleccionada : ''}`}
                  onClick={() => setFormFrecuencia('personalizado')}
                  aria-pressed={formFrecuencia === 'personalizado'}
                >
                  Días específicos
                </button>
              </div>

              {formFrecuencia === 'personalizado' && (
                <div className={styles.diasSemanaGrid}>
                  {DIAS_SEMANA.map((dia, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.diaSemanaBtn} ${formDiasSemana.includes(i) ? styles.diaSemanaSeleccionado : ''}`}
                      onClick={() => toggleDiaSemana(i)}
                      aria-pressed={formDiasSemana.includes(i)}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Objetivo de días consecutivos</label>
              <input
                type="number"
                className={styles.formInput}
                value={formObjetivo}
                onChange={e => setFormObjetivo(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
              />
            </div>

            <div className={styles.modalAcciones}>
              <button type="button" className={styles.btnPrimary} onClick={guardarHabito}>
                {habitoEditando ? 'Guardar cambios' : 'Crear hábito'}
              </button>
              <button type="button" className={styles.btnSecondary} onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Celebración */}
      {celebracion && (
        <div className={styles.modalOverlay} onClick={() => setCelebracion(null)}>
          <div className={styles.modalCelebracion} onClick={e => e.stopPropagation()}>
            <div className={styles.celebracionIcono} aria-hidden="true">{celebracion.logro.icono}</div>
            <h2 className={styles.celebracionTitulo}>¡{celebracion.logro.titulo}!</h2>
            <p className={styles.celebracionMensaje}>
              Has alcanzado {celebracion.logro.dias} días consecutivos en &quot;{celebracion.habito.nombre}&quot;. ¡Sigue así!
            </p>
            <button type="button" className={styles.btnPrimary} onClick={() => setCelebracion(null)}>
              ¡Gracias!
            </button>
          </div>
        </div>
      )}

      <EducationalSection
        title="La Ciencia detrás de los Hábitos"
        subtitle="Psicología, neurociencia y estrategias basadas en evidencia para construir rutinas permanentes"
        icon="🧠"
      >
        {/* Tabla Comparativa */}
        <div className="edu-table-wrapper">
          <h3 className="edu-section-title">📊 Cronología real de formación de un hábito</h3>
          <div className="edu-table-scroll">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Hito</th>
                  <th>Días</th>
                  <th>¿Qué ocurre?</th>
                  <th>Evidencia</th>
                  <th>En esta app</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🏅 Inicio</strong></td>
                  <td>7 días</td>
                  <td>El cerebro empieza a reconocer el patrón</td>
                  <td>Primer logro desbloqueado</td>
                  <td>Logro &quot;7 Días&quot;</td>
                </tr>
                <tr>
                  <td><strong>🌟 Mito popular</strong></td>
                  <td>21 días</td>
                  <td>Mejora visible, pero NO es automatismo</td>
                  <td>Maxwell Maltz, 1960 (cirujano plástico)</td>
                  <td>Logro &quot;21 Días&quot;</td>
                </tr>
                <tr>
                  <td><strong>🔥 Un mes</strong></td>
                  <td>30 días</td>
                  <td>Rutina establecida, menor esfuerzo consciente</td>
                  <td>Hito psicológico ampliamente aceptado</td>
                  <td>Logro &quot;30 Días&quot;</td>
                </tr>
                <tr>
                  <td><strong>💎 Consolidación</strong></td>
                  <td>66 días</td>
                  <td>Media real de automatismo conductual</td>
                  <td>Phillippa Lally, UCL 2010 (96 participantes)</td>
                  <td>Logro &quot;66 Días&quot; ← objetivo real</td>
                </tr>
                <tr>
                  <td><strong>🎯 Centenario</strong></td>
                  <td>100 días</td>
                  <td>Hábito profundamente integrado</td>
                  <td>Rango superior del estudio UCL (18-254 días)</td>
                  <td>Logro &quot;100 Días&quot;</td>
                </tr>
                <tr>
                  <td><strong>👑 Un año</strong></td>
                  <td>365 días</td>
                  <td>Parte de la identidad personal</td>
                  <td>James Clear: &quot;Soy alguien que...&quot;</td>
                  <td>Logro &quot;1 Año&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Casos de Uso */}
        <div className="edu-escenarios-section">
          <h3 className="edu-section-title">🎯 ¿Para qué tipo de hábitos funciona mejor?</h3>
          <div className="edu-escenarios-grid">
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">💪</span>
              <h4>Salud y bienestar</h4>
              <p>Ejercicio, hidratación, sueño regulado, alimentación saludable. Son hábitos de construir con señal clara (mañana, noche) y recompensa inmediata medible. Los más efectivos para empezar.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">📚</span>
              <h4>Productividad y aprendizaje</h4>
              <p>Lectura diaria, práctica de idiomas, escritura, trabajo profundo (deep work). Se consolidan más rápido que los físicos pero requieren entorno sin distracciones para activar la señal correcta.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🚭</span>
              <h4>Hábitos a evitar</h4>
              <p>Tabaco, redes sociales en exceso, ultraprocesados, pantallas antes de dormir. Más difíciles: el &quot;éxito&quot; es ausencia de conducta. La estrategia clave es sustituir, no solo eliminar.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🌅</span>
              <h4>Rutinas de anclaje</h4>
              <p>Morning routine o evening routine: un bloque de hábitos encadenados. Usando habit stacking, cada hábito actúa como señal del siguiente, creando un sistema que se auto-activa.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="edu-faq-section">
          <h3 className="edu-section-title">❓ Preguntas Frecuentes</h3>
          <div className="edu-faq-list">
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Es verdad que un hábito se forma en 21 días?</summary>
              <div className="edu-faq-answer">
                <p>No. El mito de los 21 días viene de Maxwell Maltz, un cirujano plástico que en 1960 observó que sus pacientes tardaban ~21 días en acostumbrarse a su nueva apariencia — nada que ver con hábitos conductuales. El estudio científico real (Phillippa Lally, UCL 2010) encontró una media de <strong>66 días</strong>, con un rango de 18 a 254 días según la complejidad del hábito y la persona.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es el bucle del hábito y cómo lo uso a mi favor?</summary>
              <div className="edu-faq-answer">
                <p>Según Charles Duhigg (El poder de los hábitos), todo hábito sigue el bucle: <strong>Señal → Rutina → Recompensa</strong>. La señal activa el modo automático (una hora, lugar, emoción). La rutina es el comportamiento. La recompensa refuerza el bucle. Para crear un hábito nuevo: ancla la rutina a una señal existente y asegura una recompensa inmediata. Para romper uno: identifica la señal y sustituye la rutina manteniendo la misma recompensa.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es el habit stacking?</summary>
              <div className="edu-faq-answer">
                <p>El habit stacking (apilamiento de hábitos) es una técnica de James Clear: conecta un hábito nuevo a uno ya consolidado usando la fórmula <strong>&quot;Después de [hábito existente], haré [nuevo hábito]&quot;</strong>. Ejemplo: &quot;Después de cepillarme los dientes, meditaré 5 minutos.&quot; El hábito existente actúa como señal automática del nuevo, eliminando la necesidad de recordarlo.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuántos hábitos puedo trabajar a la vez?</summary>
              <div className="edu-faq-answer">
                <p>La recomendación basada en evidencia es <strong>máximo 2-3 hábitos simultáneos</strong>. El foco cognitivo y la fuerza de voluntad son recursos limitados. Iniciar demasiados hábitos a la vez provoca que ninguno se consolide. Mejor dominar uno antes de añadir otro. Los expertos en productividad como BJ Fogg recomiendan empezar incluso con un solo hábito muy pequeño.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es el efecto Seinfeld?</summary>
              <div className="edu-faq-answer">
                <p>Jerry Seinfeld marcaba con una gran X roja en un calendario cada día que escribía chistes. El objetivo visual era &quot;no romper la cadena&quot;. Este sistema activa la motivación extrínseca: la racha visual se convierte en recompensa en sí misma. Es exactamente el principio que usa esta app: el seguimiento diario y los logros por racha refuerzan la conducta de forma automática.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué diferencia hay entre hábitos de construir y de evitar?</summary>
              <div className="edu-faq-answer">
                <p>Los hábitos de <strong>construir</strong> (hacer más) son más fáciles: la señal activa una acción visible y la recompensa es inmediata. Los hábitos de <strong>evitar</strong> son más difíciles porque el &quot;éxito&quot; es la ausencia de conducta — el cerebro no tiene nada que reforzar. La estrategia recomendada para evitar: <em>sustituir</em>, no solo eliminar. En lugar de &quot;no fumar&quot;, defínelo como &quot;cuando sienta el impulso de fumar, respiraré profundo 5 veces&quot;.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué hago si rompo la racha?</summary>
              <div className="edu-faq-answer">
                <p>Aplica la regla de <strong>&quot;nunca falles dos veces seguidas&quot;</strong> (James Clear). Un día perdido es un accidente; dos seguidos es el inicio de un nuevo hábito: el de no hacerlo. Si fallas un día, el siguiente es obligatorio sin excusas. Además, recuerda que el hábito no se pierde al romper la racha: las conexiones neuronales formadas siguen ahí y se reactivan mucho más rápido que la primera vez.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es la regla del 1% de James Clear?</summary>
              <div className="edu-faq-answer">
                <p>En <em>Hábitos Atómicos</em> (2018), James Clear popularizó la matemática de las mejoras marginales: mejorar un 1% cada día durante un año te hace <strong>37 veces mejor</strong> (1,01³⁶⁵ = 37,78). Empeorar un 1% diario te deja en casi nada (0,99³⁶⁵ = 0,03). La clave no es la magnitud del hábito, sino la consistencia. Un hábito mediocre realizado todos los días supera a uno perfecto que se abandona a las tres semanas.</p>
              </div>
            </details>
          </div>
        </div>

        {/* Guía Paso a Paso */}
        <div className="edu-guide-section">
          <h3 className="edu-section-title">📋 Guía: Cómo crear un nuevo hábito con éxito</h3>
          <ol className="edu-steps-list">
            <li className="edu-step-item">
              <div className="edu-step-number">1</div>
              <div className="edu-step-content">
                <strong>Define el hábito de forma específica y mínima</strong>
                <span>No &quot;hacer ejercicio&quot;, sino &quot;salir a caminar 10 minutos después de comer&quot;. Cuanto más concreto y pequeño, más fácil es empezar y mantener.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">2</div>
              <div className="edu-step-content">
                <strong>Ancla a una señal existente (habit stacking)</strong>
                <span>Elige una actividad que ya haces automáticamente (café matutino, cepillado de dientes, llegar a casa) y declara: &quot;Después de [señal], haré [nuevo hábito].&quot;</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">3</div>
              <div className="edu-step-content">
                <strong>Diseña la recompensa inmediata</strong>
                <span>El cerebro necesita refuerzo inmediato. Puede ser el propio placer del hábito, marcar el día en esta app, o un mini-ritual que disfrutes. La recompensa demorada (salud futura) no es suficiente al principio.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">4</div>
              <div className="edu-step-content">
                <strong>Diseña el entorno a tu favor</strong>
                <span>Haz lo correcto más fácil y lo incorrecto más difícil. Deja las zapatillas junto a la cama; desactiva las notificaciones de redes sociales; prepara la fruta cortada en la nevera. El entorno impulsa más que la voluntad.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">5</div>
              <div className="edu-step-content">
                <strong>Configúralo en la app y marca diariamente</strong>
                <span>Crea el hábito con el objetivo de 66 días (evidencia real). Cada día que lo completes, márcalo. La racha visual activa el efecto Seinfeld y se convierte en motivación adicional.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">6</div>
              <div className="edu-step-content">
                <strong>Aplica &quot;nunca falles dos veces&quot; si te saltas un día</strong>
                <span>Un día perdido es humano. Dos seguidos es el comienzo del abandono. Si fallas, el siguiente día es prioritario sin excepciones. Revisa en estadísticas tu tasa de cumplimiento para detectar patrones de fallo.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">7</div>
              <div className="edu-step-content">
                <strong>Revisión mensual y evolución del sistema</strong>
                <span>Cada mes revisa tus hábitos: celebra los consolidados, ajusta la dificultad de los que se están quedando atrás y valora si añadir uno nuevo. Los sistemas de hábitos que no evolucionan pierden efectividad. Un hábito consolidado puede aumentarse gradualmente en intensidad o duración.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* Tips Grid */}
        <div className="edu-tips-section">
          <h3 className="edu-section-title">💡 Estrategias para Mantener los Hábitos</h3>
          <div className="edu-tips-grid">
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🔗</span>
              <h4>Habit stacking</h4>
              <p>&quot;Después de [hábito consolidado], haré [nuevo hábito].&quot; Usa tus automatismos existentes como señales. Es la técnica de creación de hábitos con mayor tasa de éxito documentada.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">📏</span>
              <h4>Empieza ridículamente pequeño</h4>
              <p>BJ Fogg (Stanford): empieza con 2 minutos o menos. &quot;Leer un párrafo&quot; antes que &quot;leer 30 minutos&quot;. Una vez que el comportamiento es automático, escalar es fácil.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🗓️</span>
              <h4>Efecto Seinfeld</h4>
              <p>La racha visual es motivación en sí misma. El objetivo de &quot;no romper la cadena&quot; activa la motivación extrínseca y convierte el seguimiento diario en una recompensa adicional.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🏠</span>
              <h4>Diseña el entorno</h4>
              <p>El entorno impulsa más que la fuerza de voluntad. Coloca los recordatorios visuales donde los verás (zapatillas junto a la cama, libro en el sofá, fruta en primer plano en la nevera).</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🤝</span>
              <h4>Compromiso social</h4>
              <p>Declara tu hábito públicamente o compártelo con alguien de confianza. El compromiso social añade una capa de motivación extrínseca que refuerza el cumplimiento en los días difíciles.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">📊</span>
              <h4>Revisa semanalmente</h4>
              <p>Usa la vista de Estadísticas cada domingo. Analiza tu tasa de cumplimiento por hábito. Los hábitos por debajo del 70% necesitan ajuste: señal más clara, menor complejidad o diferente momento del día.</p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="edu-warning-box">
          <h4 className="edu-warning-title">⚠️ Mitos y errores comunes sobre los hábitos</h4>
          <ul className="edu-warning-list">
            <li><strong>Los 21 días son un mito sin base científica</strong>: Ese número viene de un cirujano plástico en 1960. La media real es 66 días (rango 18-254). No te rindas al mes.</li>
            <li><strong>No empieces más de 2-3 hábitos a la vez</strong>: La fuerza de voluntad es un recurso limitado. Iniciar muchos hábitos simultáneamente garantiza que ninguno se consolide.</li>
            <li><strong>Los hábitos a evitar son mucho más difíciles</strong>: Necesitan un comportamiento sustituto concreto. Sin él, la señal original seguirá activándose sin encontrar respuesta.</li>
            <li><strong>Los datos se guardan solo en este navegador</strong>: Esta app usa localStorage. Si cambias de dispositivo o borras los datos del navegador, perderás tu historial. Usa la función Exportar regularmente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('seguimiento-habitos')} />

      <ShareCard appName="seguimiento-habitos" />
      <Footer appName="seguimiento-habitos" />
    </div>
  );
}
