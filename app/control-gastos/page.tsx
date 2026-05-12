'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './ControlGastos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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
        collapsible={false}
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
                Los pequeños gastos recurrentes (café, suscripciones, compras pequeñas)
                suman cientos de euros al año aunque por sí solos parezcan invisibles.
                Revisarlos no significa eliminarlos: significa elegir conscientemente
                cuáles forman parte de tu vida.
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

        {/* Sección 1: Tabla Comparativa de Métodos de Presupuesto */}
        <section className={styles.guideSection}>
          <h2>⚖️ Comparativa de Métodos de Presupuesto</h2>
          <p className={styles.introParagraph}>
            No existe un único método válido. Elige el que mejor encaje con tu estilo de vida,
            tu disponibilidad de tiempo y tu nivel de disciplina financiera.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Dificultad</th>
                  <th>Tiempo/semana</th>
                  <th>Ideal para</th>
                  <th>Control</th>
                  <th>Herramienta</th>
                  <th>Resultado 6 meses</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>50/30/20</strong></td>
                  <td>Baja</td>
                  <td>5 min</td>
                  <td>Comenzar a ahorrar</td>
                  <td>Básico</td>
                  <td>Hoja de cálculo</td>
                  <td>Ahorro constante del 20 %</td>
                </tr>
                <tr>
                  <td><strong>Kakeibo japonés</strong></td>
                  <td>Media</td>
                  <td>15 min</td>
                  <td>Reflexión consciente</td>
                  <td>Alto</td>
                  <td>Libreta física</td>
                  <td>Reducción 25-35 % gasto ocio</td>
                </tr>
                <tr>
                  <td><strong>Presupuesto base cero</strong></td>
                  <td>Alta</td>
                  <td>30 min</td>
                  <td>Control total del euro</td>
                  <td>Muy alto</td>
                  <td>App especializada</td>
                  <td>Sin dinero &quot;sin destino&quot;</td>
                </tr>
                <tr>
                  <td><strong>Método del sobre</strong></td>
                  <td>Baja</td>
                  <td>10 min</td>
                  <td>Gastos con efectivo</td>
                  <td>Medio</td>
                  <td>Sobres físicos</td>
                  <td>Elimina el gasto impulsivo</td>
                </tr>
                <tr>
                  <td><strong>6 cuentas (Harv Eker)</strong></td>
                  <td>Media</td>
                  <td>10 min</td>
                  <td>Repartir con propósito</td>
                  <td>Alto</td>
                  <td>Múltiples cuentas bancarias</td>
                  <td>Ahorro + inversión + ocio</td>
                </tr>
                <tr>
                  <td><strong>Presupuesto porcentual</strong></td>
                  <td>Baja</td>
                  <td>5 min</td>
                  <td>Ingresos variables</td>
                  <td>Básico</td>
                  <td>Calculadora</td>
                  <td>Adaptación automática</td>
                </tr>
                <tr>
                  <td><strong>Revisión mensual + límites</strong></td>
                  <td>Media</td>
                  <td>20 min</td>
                  <td>Familias con varios gastos</td>
                  <td>Alto</td>
                  <td>Esta app + categorías</td>
                  <td>Visibilidad total del gasto familiar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 Casos de Uso Prácticos</h2>
          <p className={styles.introParagraph}>
            Cada perfil financiero tiene sus propios retos. Encuentra el tuyo y aplica
            la estrategia más adecuada a tu situación real.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <h4>Trabajador con nómina fija (2.000 €/mes)</h4>
              </div>
              <p>
                Aplica la regla 50/30/20 de forma directa. El día del cobro transfiere automáticamente
                400 € a una cuenta de ahorro separada. Destina máximo 1.000 € a necesidades fijas
                (hipoteca/alquiler, luz, agua, alimentación, transporte) y los 600 € restantes a
                ocio, ropa y caprichos.
              </p>
              <div className={styles.escenarioExample}>
                <strong>Distribución ejemplo:</strong> Alquiler 650 € · Alimentación 250 € ·
                Transporte 100 € · Ocio 300 € · Ropa 150 € · Ahorro 400 € · Seguros 150 €
              </div>
              <div className={styles.escenarioTip}>
                Tip: Crea una categoría &quot;Gastos extraordinarios&quot; y aporta 50 €/mes para
                ITV, vacaciones o regalos de Navidad.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <h4>Freelance con ingresos variables</h4>
              </div>
              <p>
                Crea un fondo de regularización: cuando ingreses más de lo habitual, guarda el
                excedente en una cuenta separada. Cuando ingreses menos, tira de ese fondo.
                Presupuesta siempre sobre tu ingreso mínimo garantizado, no el máximo posible.
              </p>
              <div className={styles.escenarioExample}>
                <strong>Estrategia:</strong> Fija un &quot;sueldo mensual propio&quot; de 1.500 €
                aunque factures 3.000 €. El resto al fondo de regularización y a la provisión
                trimestral de impuestos (20-25 % de cada factura).
              </div>
              <div className={styles.escenarioTip}>
                Tip: Registra gastos deducibles (suscripciones, material, formación) para
                optimizar tu declaración de IRPF.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <h4>Familia con dos sueldos</h4>
              </div>
              <p>
                Abre una cuenta común para gastos del hogar y mantén cuentas individuales para
                gastos personales. Cada miembro aporta a la cuenta común un porcentaje proporcional
                a su sueldo. Así se evitan conflictos sobre quién gasta más en qué.
              </p>
              <div className={styles.escenarioExample}>
                <strong>Modelo proporcional:</strong> Sueldo A 2.000 € (57 %) + Sueldo B 1.500 €
                (43 %). Gasto hogar 2.200 €. A aporta 1.254 €, B aporta 946 €. Resto: gasto
                personal sin rendir cuentas.
              </div>
              <div className={styles.escenarioTip}>
                Tip: Revisa juntos el presupuesto el primer domingo de cada mes. 20 minutos de
                conversación financiera mensual evitan la mayoría de conflictos por dinero.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Estudiante universitario</h4>
              </div>
              <p>
                Con ingresos bajos (beca, trabajo parcial, ayuda familiar), el control es
                especialmente importante. Prioriza las categorías de alimentación, transporte
                y material académico. Identifica qué gastos son fijos y cuáles puedes reducir.
              </p>
              <div className={styles.escenarioExample}>
                <strong>Presupuesto tipo 800 €/mes:</strong> Alquiler habitación 350 € ·
                Alimentación 180 € · Transporte 60 € · Material/libros 40 € ·
                Ocio 100 € · Reserva 70 €
              </div>
              <div className={styles.escenarioTip}>
                Tip: Aprovecha descuentos de estudiante (transporte, museos, software) y
                cocina en casa: puedes ahorrar hasta 150 €/mes frente a comer fuera.
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes sobre Control de Gastos</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué porcentaje de mis ingresos debo ahorrar?</h4>
              <p>
                La referencia más extendida es el 20 % (regla 50/30/20). Sin embargo, cualquier
                porcentaje positivo es un buen comienzo. Si ahora ahorras 0 %, empezar por el 5 %
                y aumentar un 1 % cada mes es más sostenible que intentar el 20 % desde el día uno.
                Como referencia, ahorrar un 10% sostenido a lo largo de la vida laboral puede generar una pensión complementaria notable. Si tu situación no permite ese porcentaje ahora, empezar con cantidades menores y aumentar cuando suba el ingreso también funciona.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo calculo mi tasa de ahorro real?</h4>
              <p>
                Tasa de ahorro = (Ingresos netos − Gastos totales) ÷ Ingresos netos × 100.
                Esta app lo calcula automáticamente en la tarjeta &quot;Tasa de Ahorro&quot;.
                Importante: incluye todos los gastos reales del mes, incluidos los extraordinarios
                (ropa de temporada, seguros anuales, regalos). Si solo registras los gastos fijos,
                la tasa aparecerá artificialmente alta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es un fondo de emergencia y cuánto necesito?</h4>
              <p>
                Es un colchón de liquidez para imprevistos: avería del coche, pérdida de empleo,
                reparación del hogar o gasto médico urgente. La recomendación estándar es entre
                3 y 6 meses de gastos esenciales. Para un trabajador con nómina fija en España,
                3 meses suelen ser suficientes. Para un freelance o alguien con ingresos variables,
                se recomienda llegar a 6 meses.
              </p>
              <div className={styles.faqTip}>
                Ejemplo: Si tus gastos esenciales son 1.200 €/mes, necesitas entre 3.600 € y 7.200 €
                en una cuenta de ahorro separada y accesible.
              </div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿En qué categorías suelen dispararse más los gastos?</h4>
              <p>
                Según estudios del INE, los tres grandes desequilibradores del presupuesto familiar
                español son: <strong>alimentación fuera del hogar</strong> (restaurantes, bares,
                delivery), <strong>ocio y suscripciones</strong> (streaming, gimnasio, apps) y
                <strong>ropa y calzado</strong>. A menudo se subestiman los gastos de servicios
                digitales acumulados: la media española supera los 180 €/año en suscripciones
                activas que apenas se usan.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo controlar los gastos hormiga sin obsesionarse?</h4>
              <p>
                No es necesario registrar cada café de 1,50 €. Establece un presupuesto semanal
                de &quot;pequeños gastos&quot; (por ejemplo, 50 €) y controla solo si lo superas.
                Otra estrategia: paga los gastos pequeños siempre con la misma tarjeta y revisa
                el extracto una vez a la semana. 10 minutos bastan para detectar patrones de
                gasto hormiga sin que se convierta en una obsesión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es mejor pagar con tarjeta o en efectivo para controlar gastos?</h4>
              <p>
                Para el control de gastos, la tarjeta es superior: deja registro automático
                de cada transacción y facilita la categorización posterior. Sin embargo, estudios
                de comportamiento financiero demuestran que el efectivo genera más &quot;dolor
                psicológico&quot; al gastar, lo que reduce el consumo impulsivo. La combinación
                óptima: tarjeta para gastos grandes y recurrentes, efectivo para ocio y pequeñas
                compras si tienes tendencia al gasto impulsivo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si el balance sale negativo todos los meses?</h4>
              <p>
                Es una señal de alerta que requiere acción inmediata. Primero, identifica si
                es un problema de ingresos (demasiado bajos) o de gastos (demasiado altos).
                Si es de gastos: analiza las 3 categorías más caras y busca reducirlas en un 20 %.
                Si es de ingresos: valora ingresos adicionales (freelance, venta de objetos,
                horas extra). Nunca cubras el déficit mensual con tarjeta de crédito a largo plazo:
                el coste financiero del TAE (15-25 %) agrava el problema.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo involucrar a la pareja o familia en el control de gastos?</h4>
              <p>
                La clave es que sea una conversación de equipo, no una auditoría. Propón una
                reunión mensual de 20 minutos con datos en pantalla (no de memoria). Usa metas
                compartidas concretas: &quot;en 8 meses tenemos los 4.000 € para la reforma&quot;.
                Evita señalar gastos del otro: habla de categorías, no de personas. El éxito
                financiero de pareja se basa en transparencia, metas comunes y autonomía
                individual dentro de un presupuesto acordado.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Guía Paso a Paso para Implantar el Control de Gastos</h2>
          <p className={styles.introParagraph}>
            Siete pasos ordenados para pasar de &quot;no sé en qué se va el dinero&quot; a tener
            un presupuesto claro y funcionar en piloto automático.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Registra TODOS los gastos del primer mes (sin juzgar)</h4>
                <p>
                  El primer mes es de observación, no de restricción. Apunta absolutamente todo:
                  el café, el parking, el copago médico, la suscripción anual de software.
                  No modifiques tus hábitos todavía. El objetivo es tener datos reales,
                  no datos idealizados.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Categoriza y analiza en qué se va el dinero</h4>
                <p>
                  Al final del mes, revisa los gastos por categoría. ¿Cuáles te sorprenden?
                  ¿Hay alguna categoría que supere el 30 % de tus ingresos sin ser el alquiler?
                  Esta visión panorámica es el diagnóstico que guiará tus decisiones.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Identifica los 3 mayores gastos no esenciales</h4>
                <p>
                  De todas las categorías, señala las tres que más podrías reducir sin afectar
                  significativamente tu calidad de vida. No las elimines de golpe: proponte
                  reducir cada una un 20 % el segundo mes. Cambios graduales son sostenibles;
                  los drásticos, no.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Establece límites por categoría (presupuesto mensual)</h4>
                <p>
                  Define un techo de gasto para cada categoría basándote en los datos del
                  mes anterior, no en cifras ideales. Si gastaste 350 € en alimentación,
                  tu objetivo el siguiente mes puede ser 300 €, no 150 €. Los límites
                  realistas se cumplen; los utópicos generan frustración y abandono.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Crea automatismos: domiciliaciones y ahorro automático el día de cobro</h4>
                <p>
                  El día que cobre tu nómina, programa una transferencia automática a tu cuenta
                  de ahorro. Domicilia todos los recibos fijos. Así el presupuesto se gestiona
                  solo y reduces las decisiones manuales que generan fricción y olvidos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Revisa semanalmente (10 minutos cada lunes)</h4>
                <p>
                  Un control semanal rápido evita sorpresas a final de mes. Comprueba cuánto
                  llevas gastado en cada categoría respecto al límite mensual. Si llevas el 80 %
                  del presupuesto de ocio a mitad de mes, puedes corregir antes de sobrepasar,
                  no después.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Ajusta cada trimestre según cambios vitales</h4>
                <p>
                  El presupuesto no es estático. Revisarlo cada tres meses permite adaptarlo
                  a cambios de sueldo, nuevos gastos fijos (seguro, cuota de gimnasio) o metas
                  financieras que hayas alcanzado. Un presupuesto obsoleto es tan poco útil
                  como ninguno.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas con Datos Concretos</h2>
          <p className={styles.introParagraph}>
            Pequeños hábitos, aplicados de forma consistente, generan grandes resultados
            financieros a largo plazo.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <h4>La regla de las 24 horas</h4>
              <p>
                Antes de cualquier compra no planificada superior a 50 €, espera 24 horas.
                Estudios muestran que el 60-70 % de las compras impulsivas se descartan tras
                una noche de reflexión. Ahorro potencial: 100-300 €/mes.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🤖</span>
              <h4>Automatiza el ahorro</h4>
              <p>
                Si tu situación lo permite, transfiere automáticamente un porcentaje fijo de tu nómina el día de cobro (el rango 10-20% es una referencia; lo importante es que sea sostenible). Cualquier cantidad estable funciona si se mantiene en el tiempo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>Audita suscripciones cada 6 meses</h4>
              <p>
                La media española acumula entre 8 y 12 suscripciones activas. El coste medio
                supera los 180 €/año en servicios que apenas se usan. Revisa tus extractos
                bancarios y cancela los que no hayas usado en el último mes.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <h4>Compara seguros anualmente</h4>
              <p>
                Hogar, coche y salud suelen ser los seguros más caros. Comparar ofertas una
                vez al año puede suponer un ahorro medio de 300-500 € sin reducir coberturas.
                Usa comparadores online y negocia con tu aseguradora actual antes de cambiar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛒</span>
              <h4>Planifica la compra semanal con lista</h4>
              <p>
                Ir al supermercado sin lista puede incrementar el gasto en alimentación hasta
                un 20 %. Planifica el menú semanal, elabora la lista y cíñete a ella.
                Consejo extra: no compres con hambre y evita la sección de ofertas centrales.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎉</span>
              <h4>Ocio consciente sin culpa</h4>
              <p>
                Fijar un presupuesto de ocio mensual no significa privarse: significa
                disfrutar sin ansiedad. Una vez establecido el límite (por ejemplo, 200 €),
                gástalo con plena consciencia. El ocio planificado es sostenible;
                el descontrolado genera estrés financiero.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box - Errores Frecuentes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>6 Errores Financieros que Impiden Ahorrar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No registrar gastos pequeños.</strong> Las tarjetas de crédito y el
                pago contactless difuminan la realidad del gasto diario. Sin registro, los
                gastos hormiga se invisibilizan y pueden suponer el 15-20 % del presupuesto
                mensual sin que te des cuenta.
              </li>
              <li>
                <strong>Confundir necesidad con deseo.</strong> Tener claro qué es necesidad y qué es deseo para ti. Productos premium (móvil de gama alta, suscripciones de pago, coche más caro de lo que necesitarías) son perfectamente legítimos si entran en tu categoría de deseos; el problema es etiquetarlos como necesidades para que el presupuesto cuadre.
              </li>
              <li>
                <strong>Ignorar los gastos extraordinarios.</strong> Vacaciones, regalos de Navidad,
                ITV, ropa de temporada, comunidad de vecinos anual... Son gastos predecibles
                que muchos no incluyen en el presupuesto mensual. Crea una categoría
                &quot;Extraordinarios&quot; y aporta mensualmente para no descuadrar el balance.
              </li>
              <li>
                <strong>Pagar solo el mínimo de la tarjeta de crédito.</strong> El coste real
                de financiar compras con tarjeta puede alcanzar el 20-25 % TAE. Una compra de
                500 € pagada en mínimos durante 2 años puede costar más de 700 €. Usa la
                tarjeta como herramienta de pago, no como línea de crédito permanente.
              </li>
              <li>
                <strong>No tener fondo de emergencia y endeudarse ante imprevistos.</strong>
                Sin colchón financiero, cualquier imprevisto (avería, enfermedad, despido) se
                convierte en deuda. El ciclo deuda → intereses → menos ahorro → más deuda es
                uno de los más difíciles de romper. El fondo de emergencia es el seguro
                financiero más rentable que existe.
              </li>
              <li>
                <strong>Compararse con otros y asumir el estilo de vida de Instagram.</strong>
                El nivel de consumo visible en redes sociales no refleja la realidad financiera
                de quienes lo muestran. Muchos de esos estilos de vida se financian con deuda
                o son pura apariencia. Tu referencia debe ser tu propio plan financiero,
                no el de tu entorno.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('control-gastos')} />
      <ShareCard appName="control-gastos" />
      <Footer appName="control-gastos" />
    </div>
  );
}
