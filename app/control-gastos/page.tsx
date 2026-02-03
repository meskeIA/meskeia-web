'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './ControlGastos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, parseSpanishNumber } from '@/lib';

// Categorías de gastos
const CATEGORIAS_GASTOS = [
  { id: 'hogar', nombre: 'Hogar', icon: '🏠' },
  { id: 'alimentacion', nombre: 'Alimentación', icon: '🛒' },
  { id: 'transporte', nombre: 'Transporte', icon: '🚗' },
  { id: 'ocio', nombre: 'Ocio', icon: '🎬' },
  { id: 'salud', nombre: 'Salud', icon: '💊' },
  { id: 'educacion', nombre: 'Educación', icon: '📚' },
  { id: 'ropa', nombre: 'Ropa', icon: '👕' },
  { id: 'servicios', nombre: 'Servicios', icon: '📱' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

// Categorías de ingresos
const CATEGORIAS_INGRESOS = [
  { id: 'nomina', nombre: 'Nómina', icon: '💼' },
  { id: 'freelance', nombre: 'Freelance', icon: '💻' },
  { id: 'inversiones', nombre: 'Inversiones', icon: '📈' },
  { id: 'alquiler', nombre: 'Alquiler', icon: '🏢' },
  { id: 'otros_ing', nombre: 'Otros', icon: '💰' },
];

type TipoMovimiento = 'ingreso' | 'gasto';

interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  concepto: string;
  importe: number;
  categoria: string;
  fecha: string;
}

export default function ControlGastosPage() {
  // Estado del formulario
  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);

  // Lista de movimientos
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  // Filtro activo
  const [filtro, setFiltro] = useState<'todos' | 'ingresos' | 'gastos'>('todos');

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const datosGuardados = localStorage.getItem('meskeia_control_gastos');
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        setMovimientos(datos);
      } catch {
        // Si hay error, empezar vacío
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian los movimientos
  useEffect(() => {
    if (movimientos.length > 0) {
      localStorage.setItem('meskeia_control_gastos', JSON.stringify(movimientos));
    }
  }, [movimientos]);

  // Añadir movimiento
  const agregarMovimiento = () => {
    if (!concepto.trim() || !importe || !categoria) return;

    const nuevoMovimiento: Movimiento = {
      id: Date.now().toString(),
      tipo,
      concepto: concepto.trim(),
      importe: parseSpanishNumber(importe) || 0,
      categoria,
      fecha,
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);

    // Limpiar formulario
    setConcepto('');
    setImporte('');
    setCategoria('');
  };

  // Eliminar movimiento
  const eliminarMovimiento = (id: string) => {
    setMovimientos(movimientos.filter(m => m.id !== id));
  };

  // Exportar datos
  const exportarDatos = () => {
    const dataStr = JSON.stringify(movimientos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control-gastos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Limpiar todos los datos
  const limpiarDatos = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los movimientos?')) {
      setMovimientos([]);
      localStorage.removeItem('meskeia_control_gastos');
    }
  };

  // Calcular totales
  const totales = useMemo(() => {
    const ingresos = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.importe, 0);

    const gastos = movimientos
      .filter(m => m.tipo === 'gasto')
      .reduce((sum, m) => sum + m.importe, 0);

    const balance = ingresos - gastos;
    const tasaAhorro = ingresos > 0 ? (balance / ingresos) * 100 : 0;

    return { ingresos, gastos, balance, tasaAhorro };
  }, [movimientos]);

  // Gastos por categoría
  const gastosPorCategoria = useMemo(() => {
    const porCategoria: Record<string, number> = {};

    movimientos
      .filter(m => m.tipo === 'gasto')
      .forEach(m => {
        porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.importe;
      });

    return CATEGORIAS_GASTOS
      .map(cat => ({
        ...cat,
        total: porCategoria[cat.id] || 0,
      }))
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [movimientos]);

  // Filtrar movimientos
  const movimientosFiltrados = useMemo(() => {
    if (filtro === 'todos') return movimientos;
    if (filtro === 'ingresos') return movimientos.filter(m => m.tipo === 'ingreso');
    return movimientos.filter(m => m.tipo === 'gasto');
  }, [movimientos, filtro]);

  // Obtener icono de categoría
  const getIconCategoria = (categoriaId: string, tipo: TipoMovimiento) => {
    const categorias = tipo === 'ingreso' ? CATEGORIAS_INGRESOS : CATEGORIAS_GASTOS;
    return categorias.find(c => c.id === categoriaId)?.icon || '📦';
  };

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const categoriasActuales = tipo === 'ingreso' ? CATEGORIAS_INGRESOS : CATEGORIAS_GASTOS;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💰 Control de Gastos</h1>
        <p className={styles.subtitle}>
          Gestiona tu presupuesto mensual de forma sencilla
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Resumen */}
      <div className={styles.resumenGrid}>
        <div className={`${styles.resumenCard} ${styles.ingresos}`}>
          <div className={styles.resumenIcon}>📥</div>
          <span className={styles.resumenLabel}>Ingresos</span>
          <span className={styles.resumenValor}>{formatCurrency(totales.ingresos)}</span>
        </div>
        <div className={`${styles.resumenCard} ${styles.gastos}`}>
          <div className={styles.resumenIcon}>📤</div>
          <span className={styles.resumenLabel}>Gastos</span>
          <span className={styles.resumenValor}>{formatCurrency(totales.gastos)}</span>
        </div>
        <div className={`${styles.resumenCard} ${styles.balance}`}>
          <div className={styles.resumenIcon}>{totales.balance >= 0 ? '✅' : '⚠️'}</div>
          <span className={styles.resumenLabel}>Balance</span>
          <span className={styles.resumenValor}>{formatCurrency(totales.balance)}</span>
        </div>
        <div className={`${styles.resumenCard} ${styles.ahorro}`}>
          <div className={styles.resumenIcon}>🎯</div>
          <span className={styles.resumenLabel}>Tasa de Ahorro</span>
          <span className={styles.resumenValor}>{totales.tasaAhorro.toFixed(1)}%</span>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Panel Formulario */}
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>➕ Nuevo Movimiento</h2>

          {/* Toggle Tipo */}
          <div className={styles.tipoToggle}>
            <button
              className={`${styles.tipoBtn} ${styles.ingreso} ${tipo === 'ingreso' ? styles.activo : ''}`}
              onClick={() => { setTipo('ingreso'); setCategoria(''); }}
            >
              📥 Ingreso
            </button>
            <button
              className={`${styles.tipoBtn} ${styles.gasto} ${tipo === 'gasto' ? styles.activo : ''}`}
              onClick={() => { setTipo('gasto'); setCategoria(''); }}
            >
              📤 Gasto
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Concepto</label>
            <input
              type="text"
              className={styles.input}
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder={tipo === 'ingreso' ? 'Ej: Nómina marzo' : 'Ej: Supermercado'}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Importe</label>
            <input
              type="text"
              className={styles.input}
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Fecha</label>
            <input
              type="date"
              className={styles.input}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Categoría</label>
            <div className={styles.categoriaGrid}>
              {categoriasActuales.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.categoriaBtn} ${categoria === cat.id ? styles.activa : ''}`}
                  onClick={() => setCategoria(cat.id)}
                >
                  <span className={styles.categoriaIcon}>{cat.icon}</span>
                  <span className={styles.categoriaNombre}>{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className={`${styles.btnAnadir} ${tipo === 'ingreso' ? styles.ingreso : styles.gasto}`}
            onClick={agregarMovimiento}
            disabled={!concepto.trim() || !importe || !categoria}
          >
            {tipo === 'ingreso' ? '+ Añadir Ingreso' : '+ Añadir Gasto'}
          </button>

          {/* Estadísticas por categoría */}
          {gastosPorCategoria.length > 0 && (
            <div className={styles.categoriasStats}>
              <h3 className={styles.sectionTitle}>📊 Gastos por Categoría</h3>
              {gastosPorCategoria.map((cat) => (
                <div key={cat.id} className={styles.categoriaStatItem}>
                  <span className={styles.categoriaStatIcon}>{cat.icon}</span>
                  <div className={styles.categoriaStatBarra}>
                    <div
                      className={styles.categoriaStatProgreso}
                      style={{ width: `${(cat.total / totales.gastos) * 100}%` }}
                    />
                  </div>
                  <span className={styles.categoriaStatValor}>
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className={styles.accionesGuardado}>
            <button className={styles.btnSecundario} onClick={exportarDatos}>
              📥 Exportar
            </button>
            <button className={styles.btnSecundario} onClick={limpiarDatos}>
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Panel Lista */}
        <div className={styles.listaPanel}>
          <h2 className={styles.sectionTitle}>📋 Movimientos</h2>

          {/* Filtros */}
          <div className={styles.filtros}>
            <button
              className={`${styles.filtroBtn} ${filtro === 'todos' ? styles.activo : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos ({movimientos.length})
            </button>
            <button
              className={`${styles.filtroBtn} ${filtro === 'ingresos' ? styles.activo : ''}`}
              onClick={() => setFiltro('ingresos')}
            >
              Ingresos ({movimientos.filter(m => m.tipo === 'ingreso').length})
            </button>
            <button
              className={`${styles.filtroBtn} ${filtro === 'gastos' ? styles.activo : ''}`}
              onClick={() => setFiltro('gastos')}
            >
              Gastos ({movimientos.filter(m => m.tipo === 'gasto').length})
            </button>
          </div>

          {/* Lista de movimientos */}
          {movimientosFiltrados.length > 0 ? (
            <div className={styles.movimientosLista}>
              {movimientosFiltrados.map((mov) => (
                <div key={mov.id} className={styles.movimientoItem}>
                  <div className={styles.movimientoIcon}>
                    {getIconCategoria(mov.categoria, mov.tipo)}
                  </div>
                  <div className={styles.movimientoInfo}>
                    <div className={styles.movimientoConcepto}>{mov.concepto}</div>
                    <div className={styles.movimientoMeta}>
                      {formatearFecha(mov.fecha)} · {
                        (mov.tipo === 'ingreso' ? CATEGORIAS_INGRESOS : CATEGORIAS_GASTOS)
                          .find(c => c.id === mov.categoria)?.nombre
                      }
                    </div>
                  </div>
                  <div className={`${styles.movimientoImporte} ${mov.tipo === 'ingreso' ? styles.ingreso : styles.gasto}`}>
                    {mov.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(mov.importe)}
                  </div>
                  <button
                    className={styles.btnEliminar}
                    onClick={() => eliminarMovimiento(mov.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <p>No hay movimientos registrados</p>
              <p>Añade tu primer ingreso o gasto</p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="control-gastos"
        collapsible={true}
      />

      

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres mejorar tus finanzas personales?"
        subtitle="Aprende estrategias de ahorro y gestión del presupuesto familiar"
      >
        <section className={styles.guideSection}>
          <h2>Claves para un buen control de gastos</h2>
          <p className={styles.introParagraph}>
            Llevar un control de gastos es el primer paso para mejorar tu salud financiera.
            Saber exactamente en qué gastas tu dinero te permite identificar áreas de mejora
            y establecer metas de ahorro realistas.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 La Regla 50/30/20</h4>
              <p>
                Destina el 50% de tus ingresos a necesidades (vivienda, alimentación, transporte),
                el 30% a deseos (ocio, caprichos) y el 20% al ahorro e inversión.
                Es una guía flexible que puedes adaptar a tu situación.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 Fondo de Emergencia</h4>
              <p>
                Antes de invertir, crea un colchón de 3-6 meses de gastos esenciales.
                Este fondo te protege ante imprevistos como pérdida de empleo,
                averías o gastos médicos sin tener que endeudarte.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💡 Gastos Hormiga</h4>
              <p>
                Los pequeños gastos diarios (café, suscripciones, compras impulsivas)
                pueden sumar cientos de euros al mes. Identifícalos y decide
                conscientemente cuáles merecen la pena.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📈 Págate Primero</h4>
              <p>
                Al recibir tu nómina, transfiere automáticamente un porcentaje
                a tu cuenta de ahorro. Así ahorras antes de gastar,
                no lo que sobra al final del mes.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('control-gastos')} />
      <Footer appName="control-gastos" />
    </div>
  );
}
