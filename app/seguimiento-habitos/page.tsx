'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './SeguimientoHabitos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
  { id: 'racha_21', icono: '🌟', titulo: '21 Días', descripcion: 'Hábito en formación', dias: 21 },
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
        <h1 className={styles.title}>📊 Seguimiento de Hábitos</h1>
        <p className={styles.subtitle}>Construye rutinas saludables con visualización de rachas</p>
      </header>

      <LegalNotice />

      {/* Navegación */}
      <div className={styles.navegacion}>
        <button
          className={`${styles.navBtn} ${vistaActiva === 'habitos' ? styles.navBtnActivo : ''}`}
          onClick={() => setVistaActiva('habitos')}
        >
          📋 Mis Hábitos
        </button>
        <button
          className={`${styles.navBtn} ${vistaActiva === 'calendario' ? styles.navBtnActivo : ''}`}
          onClick={() => setVistaActiva('calendario')}
        >
          📅 Calendario
        </button>
        <button
          className={`${styles.navBtn} ${vistaActiva === 'estadisticas' ? styles.navBtnActivo : ''}`}
          onClick={() => setVistaActiva('estadisticas')}
        >
          📈 Estadísticas
        </button>
      </div>

      {/* Acciones */}
      <div className={styles.acciones}>
        <button className={styles.btnPrimary} onClick={abrirModalNuevo}>
          ➕ Nuevo Hábito
        </button>
        <div className={styles.accionesSecundarias}>
          <button className={styles.btnSecondary} onClick={exportarDatos}>
            💾 Exportar
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
              <button className={styles.btnPrimary} onClick={abrirModalNuevo}>
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
                        {habito.icono} {habito.nombre}
                      </span>
                      {habito.tipo === 'evitar' && (
                        <span className={styles.habitoTipoEvitar}>Evitar</span>
                      )}
                    </div>
                    <div className={styles.habitoRacha}>
                      🔥 {rachaActual} días
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
                          className={`${styles.diaCirculo} ${completado ? styles.diaCompletado : ''}`}
                          style={completado ? { background: habito.color, borderColor: habito.color } : {}}
                          onClick={() => toggleDia(habito.id, fechaStr)}
                          title={`${DIAS_SEMANA_LARGO[diaSemana]} ${fecha.getDate()}`}
                        >
                          <span className={styles.diaCirculoLetra}>{DIAS_SEMANA[diaSemana]}</span>
                          {completado && <span className={styles.diaCirculoCheck}>✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.habitoAcciones}>
                    <button
                      className={`${styles.btnMarcar} ${completadoHoy ? styles.btnMarcado : ''}`}
                      style={completadoHoy ? { background: habito.color, borderColor: habito.color } : {}}
                      onClick={() => toggleDia(habito.id, hoy)}
                    >
                      {completadoHoy ? '✓ Completado hoy' : '○ Marcar hoy'}
                    </button>
                    <button className={styles.btnIcon} onClick={() => abrirModalEditar(habito)} title="Editar">
                      ✏️
                    </button>
                    <button className={styles.btnIcon} onClick={() => eliminarHabito(habito.id)} title="Eliminar">
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
                className={styles.navMesBtn}
                onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))}
              >
                ← Anterior
              </button>
              <span className={styles.mesActual}>
                {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
              </span>
              <button
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
                <span>{habito.icono} {habito.nombre}</span>
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
              <span className={styles.resumenIcono}>📊</span>
              <span className={styles.resumenValor}>{habitos.length}</span>
              <span className={styles.resumenLabel}>Hábitos activos</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono}>🔥</span>
              <span className={styles.resumenValor}>
                {habitos.length > 0 ? Math.max(...habitos.map(h => calcularRachaActual(h))) : 0}
              </span>
              <span className={styles.resumenLabel}>Mejor racha actual</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono}>🏆</span>
              <span className={styles.resumenValor}>{logrosDesbloqueados.size}</span>
              <span className={styles.resumenLabel}>Logros desbloqueados</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenIcono}>📈</span>
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
                    <div className={styles.logroIcono}>{logro.icono}</div>
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
                      <span className={styles.detalleNombre}>{habito.icono} {habito.nombre}</span>
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
              <button className={styles.modalClose} onClick={() => setModalAbierto(false)}>✕</button>
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
                  >
                    {cat.icono} {cat.nombre}
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
                >
                  ✅ Construir
                  <span className={styles.tipoDesc}>Quiero hacer más</span>
                </button>
                <button
                  type="button"
                  className={`${styles.tipoBtn} ${formTipo === 'evitar' ? styles.tipoSeleccionado : ''}`}
                  onClick={() => setFormTipo('evitar')}
                >
                  🚫 Evitar
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
                >
                  Todos los días
                </button>
                <button
                  type="button"
                  className={`${styles.frecuenciaBtn} ${formFrecuencia === 'personalizado' ? styles.frecuenciaSeleccionada : ''}`}
                  onClick={() => setFormFrecuencia('personalizado')}
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
              <button className={styles.btnPrimary} onClick={guardarHabito}>
                {habitoEditando ? 'Guardar cambios' : 'Crear hábito'}
              </button>
              <button className={styles.btnSecondary} onClick={() => setModalAbierto(false)}>
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
            <div className={styles.celebracionIcono}>{celebracion.logro.icono}</div>
            <h2 className={styles.celebracionTitulo}>¡{celebracion.logro.titulo}!</h2>
            <p className={styles.celebracionMensaje}>
              Has alcanzado {celebracion.logro.dias} días consecutivos en &quot;{celebracion.habito.nombre}&quot;. ¡Sigue así!
            </p>
            <button className={styles.btnPrimary} onClick={() => setCelebracion(null)}>
              ¡Gracias!
            </button>
          </div>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('seguimiento-habitos')} />

      <ShareCard appName="seguimiento-habitos" />
      <Footer appName="seguimiento-habitos" />
    </div>
  );
}
