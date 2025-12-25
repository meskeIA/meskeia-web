'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraCuotaAutonomo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// CONFIGURACIÓN NORMATIVA
// ============================================

/**
 * BASE NORMATIVA:
 * - Real Decreto-ley 13/2022, de 26 de julio (nuevo sistema de cotización por ingresos reales)
 * - Orden ISM/835/2023 (bases y tipos de cotización 2024)
 * - Orden PCM/74/2025 (bases y tipos de cotización 2025) - PENDIENTE PUBLICACIÓN
 *
 * NOTA: Los datos de 2025 se basan en la proyección del RDL 13/2022.
 * La Orden definitiva de 2025 se publica habitualmente en enero.
 *
 * Última actualización de datos: Enero 2025
 */

const NORMATIVA = {
  titulo: 'Real Decreto-ley 13/2022 y Orden ISM/835/2023',
  descripcion: 'Sistema de cotización por ingresos reales para autónomos',
  vigencia: '2025',
  ultimaActualizacion: 'Enero 2025',
  nota: 'Datos basados en la tabla transitoria 2023-2025 del RDL 13/2022. La Orden definitiva de 2025 puede introducir ajustes menores.',
};

// Tipo de cotización general para autónomos (2025)
const TIPO_COTIZACION = 0.313; // 31,30%

// ============================================
// TABLA DE TRAMOS 2025 (RDL 13/2022)
// ============================================

interface TramoCotizacion {
  id: number;
  rendimientoMin: number;
  rendimientoMax: number | null; // null = sin límite
  baseMinima: number;
  baseMaxima: number;
  cuotaMinima: number;
  cuotaMaxima: number;
}

/**
 * Tabla de tramos para 2025 según RDL 13/2022
 * Rendimiento neto = Ingresos - Gastos deducibles
 *
 * TRAMOS REDUCIDOS (rendimientos bajos):
 * Para autónomos con rendimientos inferiores al SMI
 *
 * TRAMOS GENERALES (rendimientos medios-altos):
 * Escala progresiva según rendimiento neto mensual
 */
const TRAMOS_2025: TramoCotizacion[] = [
  // TABLA REDUCIDA (rendimientos inferiores al SMI)
  { id: 1, rendimientoMin: 0, rendimientoMax: 670, baseMinima: 653.59, baseMaxima: 718.95, cuotaMinima: 204.57, cuotaMaxima: 225.03 },
  { id: 2, rendimientoMin: 670, rendimientoMax: 900, baseMinima: 718.95, baseMaxima: 900, cuotaMinima: 225.03, cuotaMaxima: 281.70 },
  { id: 3, rendimientoMin: 900, rendimientoMax: 1166.70, baseMinima: 872.55, baseMaxima: 1166.70, cuotaMinima: 273.11, cuotaMaxima: 365.18 },
  // TABLA GENERAL (rendimientos >= SMI)
  { id: 4, rendimientoMin: 1166.70, rendimientoMax: 1300, baseMinima: 950.98, baseMaxima: 1300, cuotaMinima: 297.66, cuotaMaxima: 406.90 },
  { id: 5, rendimientoMin: 1300, rendimientoMax: 1500, baseMinima: 960.78, baseMaxima: 1500, cuotaMinima: 300.72, cuotaMaxima: 469.50 },
  { id: 6, rendimientoMin: 1500, rendimientoMax: 1700, baseMinima: 960.78, baseMaxima: 1700, cuotaMinima: 300.72, cuotaMaxima: 532.10 },
  { id: 7, rendimientoMin: 1700, rendimientoMax: 1850, baseMinima: 1045.75, baseMaxima: 1850, cuotaMinima: 327.32, cuotaMaxima: 579.05 },
  { id: 8, rendimientoMin: 1850, rendimientoMax: 2030, baseMinima: 1062.09, baseMaxima: 2030, cuotaMinima: 332.43, cuotaMaxima: 635.39 },
  { id: 9, rendimientoMin: 2030, rendimientoMax: 2330, baseMinima: 1078.43, baseMaxima: 2330, cuotaMinima: 337.55, cuotaMaxima: 729.29 },
  { id: 10, rendimientoMin: 2330, rendimientoMax: 2760, baseMinima: 1111.11, baseMaxima: 2760, cuotaMinima: 347.78, cuotaMaxima: 863.88 },
  { id: 11, rendimientoMin: 2760, rendimientoMax: 3190, baseMinima: 1176.47, baseMaxima: 3190, cuotaMinima: 368.23, cuotaMaxima: 998.47 },
  { id: 12, rendimientoMin: 3190, rendimientoMax: 3620, baseMinima: 1241.83, baseMaxima: 3620, cuotaMinima: 388.69, cuotaMaxima: 1133.06 },
  { id: 13, rendimientoMin: 3620, rendimientoMax: 4050, baseMinima: 1307.19, baseMaxima: 4050, cuotaMinima: 409.15, cuotaMaxima: 1267.65 },
  { id: 14, rendimientoMin: 4050, rendimientoMax: 6000, baseMinima: 1454.25, baseMaxima: 4720.50, cuotaMinima: 455.18, cuotaMaxima: 1477.52 },
  { id: 15, rendimientoMin: 6000, rendimientoMax: null, baseMinima: 1732.03, baseMaxima: 4720.50, cuotaMinima: 542.13, cuotaMaxima: 1477.52 },
];

// Usar directamente los tramos (ya corregidos)
const TRAMOS_2025_CORREGIDOS = TRAMOS_2025;

// ============================================
// TARIFA PLANA Y BONIFICACIONES
// ============================================

interface Bonificacion {
  id: string;
  nombre: string;
  descripcion: string;
  cuotaMensual: number;
  duracion: string;
  requisitos: string[];
  icon: string;
}

const BONIFICACIONES: Bonificacion[] = [
  {
    id: 'tarifa-plana',
    nombre: 'Tarifa Plana Nuevos Autónomos',
    descripcion: 'Cuota reducida para nuevos autónomos sin actividad previa en los últimos 2 años',
    cuotaMensual: 80,
    duracion: '12 meses (ampliable 12 meses más si ingresos < SMI)',
    requisitos: [
      'No haber estado de alta como autónomo en los últimos 2 años',
      'No haber disfrutado de tarifa plana anteriormente (o que hayan pasado 3 años)',
      'Alta inicial en el RETA',
    ],
    icon: '🎯',
  },
  {
    id: 'maternidad',
    nombre: 'Bonificación por Maternidad/Paternidad',
    descripcion: 'Bonificación del 100% de la cuota durante el descanso por nacimiento',
    cuotaMensual: 0,
    duracion: 'Durante el periodo de descanso (16-20 semanas)',
    requisitos: [
      'Estar al corriente de pago con la Seguridad Social',
      'Periodo de descanso por nacimiento, adopción o acogimiento',
    ],
    icon: '👶',
  },
  {
    id: 'discapacidad',
    nombre: 'Tarifa Plana Discapacidad',
    descripcion: 'Cuota reducida para autónomos con discapacidad ≥33%',
    cuotaMensual: 80,
    duracion: '24 meses',
    requisitos: [
      'Discapacidad reconocida igual o superior al 33%',
      'No haber estado de alta como autónomo en los últimos 2 años',
    ],
    icon: '♿',
  },
  {
    id: 'conciliacion',
    nombre: 'Bonificación por Conciliación',
    descripcion: 'Bonificación del 100% cuota por cuidado de menores de 12 años',
    cuotaMensual: 0,
    duracion: '12 meses',
    requisitos: [
      'Cuidado de menores de 12 años',
      'Contratación de trabajador a tiempo completo o parcial',
    ],
    icon: '👨‍👩‍👧',
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CalculadoraCuotaAutonomoPage() {
  // Estados de entrada
  const [ingresosAnuales, setIngresosAnuales] = useState('');
  const [gastosAnuales, setGastosAnuales] = useState('');
  const [tieneBonicacion, setTieneBonificacion] = useState(false);
  const [bonificacionSeleccionada, setBonificacionSeleccionada] = useState<string>('tarifa-plana');

  // Vista activa
  const [vistaActiva, setVistaActiva] = useState<'calculadora' | 'tramos' | 'bonificaciones'>('calculadora');

  // Cálculos
  const resultados = useMemo(() => {
    const ingresos = parseSpanishNumber(ingresosAnuales) || 0;
    const gastos = parseSpanishNumber(gastosAnuales) || 0;

    // Rendimiento neto anual
    const rendimientoNetoAnual = Math.max(0, ingresos - gastos);

    // Rendimiento neto mensual (para determinar tramo)
    const rendimientoNetoMensual = rendimientoNetoAnual / 12;

    // Encontrar el tramo correspondiente
    const tramo = TRAMOS_2025_CORREGIDOS.find(t => {
      if (t.rendimientoMax === null) {
        return rendimientoNetoMensual >= t.rendimientoMin;
      }
      return rendimientoNetoMensual >= t.rendimientoMin && rendimientoNetoMensual < t.rendimientoMax;
    }) || TRAMOS_2025_CORREGIDOS[0];

    // Calcular base de cotización (proporcional al rendimiento dentro del tramo)
    let baseCotizacion: number;
    if (rendimientoNetoMensual <= tramo.baseMinima) {
      baseCotizacion = tramo.baseMinima;
    } else if (rendimientoNetoMensual >= tramo.baseMaxima) {
      baseCotizacion = tramo.baseMaxima;
    } else {
      // La base puede elegirse entre la mínima y la máxima del tramo
      // Por defecto usamos la mínima (cuota más baja)
      baseCotizacion = tramo.baseMinima;
    }

    // Cuota mensual
    const cuotaMensual = baseCotizacion * TIPO_COTIZACION;
    const cuotaAnual = cuotaMensual * 12;

    // Si tiene bonificación
    const bonificacion = BONIFICACIONES.find(b => b.id === bonificacionSeleccionada);
    const cuotaConBonificacion = tieneBonicacion && bonificacion ? bonificacion.cuotaMensual : cuotaMensual;
    const cuotaAnualConBonificacion = cuotaConBonificacion * 12;
    const ahorroAnual = cuotaAnual - cuotaAnualConBonificacion;

    return {
      rendimientoNetoAnual,
      rendimientoNetoMensual,
      tramo,
      baseCotizacion,
      cuotaMensual,
      cuotaAnual,
      cuotaConBonificacion,
      cuotaAnualConBonificacion,
      ahorroAnual,
      bonificacion: tieneBonicacion ? bonificacion : null,
      tipoCotizacion: TIPO_COTIZACION * 100,
    };
  }, [ingresosAnuales, gastosAnuales, tieneBonicacion, bonificacionSeleccionada]);

  // Renderizar tabla de tramos
  const renderTablaTramos = () => (
    <div className={styles.tablaTramos}>
      <h3>📊 Tabla de Tramos 2025</h3>
      <p className={styles.tablaSubtitulo}>
        Base normativa: {NORMATIVA.titulo}
      </p>
      <div className={styles.tablaContainer}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Tramo</th>
              <th>Rendimiento Neto Mensual</th>
              <th>Base Mínima</th>
              <th>Base Máxima</th>
              <th>Cuota Mínima</th>
              <th>Cuota Máxima</th>
            </tr>
          </thead>
          <tbody>
            {TRAMOS_2025_CORREGIDOS.map((tramo, index) => (
              <tr
                key={tramo.id}
                className={resultados.tramo?.id === tramo.id ? styles.tramoActivo : ''}
              >
                <td>{tramo.id}</td>
                <td>
                  {formatCurrency(tramo.rendimientoMin)}
                  {tramo.rendimientoMax ? ` - ${formatCurrency(tramo.rendimientoMax)}` : ' o más'}
                </td>
                <td>{formatCurrency(tramo.baseMinima)}</td>
                <td>{formatCurrency(tramo.baseMaxima)}</td>
                <td>{formatCurrency(tramo.cuotaMinima)}</td>
                <td>{formatCurrency(tramo.cuotaMaxima)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.tablaNotaTramos}>
        * Los primeros 3 tramos corresponden a la <strong>tabla reducida</strong> (rendimientos inferiores al SMI).
        Los demás a la <strong>tabla general</strong>.
      </p>
    </div>
  );

  // Renderizar bonificaciones
  const renderBonificaciones = () => (
    <div className={styles.bonificacionesGrid}>
      {BONIFICACIONES.map(bonif => (
        <div key={bonif.id} className={styles.bonificacionCard}>
          <div className={styles.bonificacionHeader}>
            <span className={styles.bonificacionIcon}>{bonif.icon}</span>
            <h4>{bonif.nombre}</h4>
          </div>
          <p className={styles.bonificacionDescripcion}>{bonif.descripcion}</p>
          <div className={styles.bonificacionDetalles}>
            <div className={styles.bonificacionDetalle}>
              <span className={styles.detalleLabel}>Cuota mensual:</span>
              <span className={styles.detalleValor}>
                {bonif.cuotaMensual === 0 ? 'Bonificación 100%' : formatCurrency(bonif.cuotaMensual)}
              </span>
            </div>
            <div className={styles.bonificacionDetalle}>
              <span className={styles.detalleLabel}>Duración:</span>
              <span className={styles.detalleValor}>{bonif.duracion}</span>
            </div>
          </div>
          <div className={styles.bonificacionRequisitos}>
            <span className={styles.requisitosLabel}>Requisitos:</span>
            <ul>
              {bonif.requisitos.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>💼</span>
        <h1 className={styles.title}>Calculadora Cuota de Autónomo</h1>
        <p className={styles.subtitle}>
          Calcula tu cuota mensual según el sistema de cotización por ingresos reales
        </p>
      </header>

      {/* Referencia Normativa */}
      <div className={styles.normativaBox}>
        <div className={styles.normativaHeader}>
          <span>📜</span>
          <strong>Base Normativa</strong>
        </div>
        <p>{NORMATIVA.titulo}</p>
        <p className={styles.normativaVigencia}>
          Vigencia: {NORMATIVA.vigencia} | Última actualización: {NORMATIVA.ultimaActualizacion}
        </p>
        <p className={styles.normativaNota}>{NORMATIVA.nota}</p>
      </div>

      {/* Navegación de vistas */}
      <div className={styles.navTabs}>
        <button
          className={`${styles.navTab} ${vistaActiva === 'calculadora' ? styles.navTabActivo : ''}`}
          onClick={() => setVistaActiva('calculadora')}
        >
          🧮 Calculadora
        </button>
        <button
          className={`${styles.navTab} ${vistaActiva === 'tramos' ? styles.navTabActivo : ''}`}
          onClick={() => setVistaActiva('tramos')}
        >
          📊 Tabla de Tramos
        </button>
        <button
          className={`${styles.navTab} ${vistaActiva === 'bonificaciones' ? styles.navTabActivo : ''}`}
          onClick={() => setVistaActiva('bonificaciones')}
        >
          🎯 Bonificaciones
        </button>
      </div>

      {/* Vista: Calculadora */}
      {vistaActiva === 'calculadora' && (
        <>
          {/* Formulario de entrada */}
          <section className={styles.inputSection}>
            <h2>📝 Introduce tus datos</h2>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="ingresos">Ingresos anuales previstos</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="ingresos"
                    value={ingresosAnuales}
                    onChange={(e) => setIngresosAnuales(e.target.value)}
                    placeholder="30000"
                  />
                  <span className={styles.inputSuffix}>€/año</span>
                </div>
                <span className={styles.inputHint}>Facturación total prevista (sin IVA)</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="gastos">Gastos deducibles anuales</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="gastos"
                    value={gastosAnuales}
                    onChange={(e) => setGastosAnuales(e.target.value)}
                    placeholder="6000"
                  />
                  <span className={styles.inputSuffix}>€/año</span>
                </div>
                <span className={styles.inputHint}>Gastos de actividad (material, suministros, etc.)</span>
              </div>
            </div>

            {/* Bonificación */}
            <div className={styles.bonificacionSelector}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={tieneBonicacion}
                  onChange={(e) => setTieneBonificacion(e.target.checked)}
                />
                <span>¿Tienes derecho a alguna bonificación?</span>
              </label>

              {tieneBonicacion && (
                <div className={styles.selectBonificacion}>
                  <select
                    value={bonificacionSeleccionada}
                    onChange={(e) => setBonificacionSeleccionada(e.target.value)}
                  >
                    {BONIFICACIONES.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Resultados */}
          {(parseSpanishNumber(ingresosAnuales) > 0) && (
            <section className={styles.resultadosSection}>
              <h2>📊 Tu cuota estimada</h2>

              {/* Resumen principal */}
              <div className={styles.resultadoPrincipal}>
                <div className={styles.cuotaDestacada}>
                  <span className={styles.cuotaLabel}>Cuota mensual</span>
                  <span className={styles.cuotaValor}>
                    {formatCurrency(tieneBonicacion ? resultados.cuotaConBonificacion : resultados.cuotaMensual)}
                  </span>
                  {tieneBonicacion && resultados.bonificacion && (
                    <span className={styles.cuotaBonificada}>
                      (con {resultados.bonificacion.nombre})
                    </span>
                  )}
                </div>
              </div>

              {/* Desglose */}
              <div className={styles.desglose}>
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Rendimiento neto anual</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultados.rendimientoNetoAnual)}</span>
                </div>
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Rendimiento neto mensual</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultados.rendimientoNetoMensual)}</span>
                </div>
                <div className={styles.desgloseSeparador} />
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Tramo aplicable</span>
                  <span className={styles.desgloseValor}>Tramo {resultados.tramo?.id}</span>
                </div>
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Base de cotización</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultados.baseCotizacion)}</span>
                </div>
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Tipo de cotización</span>
                  <span className={styles.desgloseValor}>{formatNumber(resultados.tipoCotizacion, 2)}%</span>
                </div>
                <div className={styles.desgloseSeparador} />
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Cuota mensual (sin bonificación)</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultados.cuotaMensual)}</span>
                </div>
                <div className={styles.desgloseItem}>
                  <span className={styles.desgloseLabel}>Cuota anual (sin bonificación)</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultados.cuotaAnual)}</span>
                </div>

                {tieneBonicacion && resultados.bonificacion && (
                  <>
                    <div className={styles.desgloseSeparador} />
                    <div className={styles.desgloseItemDestacado}>
                      <span className={styles.desgloseLabel}>🎯 Cuota con bonificación</span>
                      <span className={styles.desgloseValor}>{formatCurrency(resultados.cuotaConBonificacion)}/mes</span>
                    </div>
                    <div className={styles.desgloseItemDestacado}>
                      <span className={styles.desgloseLabel}>💰 Ahorro anual</span>
                      <span className={styles.desgloseValorPositivo}>{formatCurrency(resultados.ahorroAnual)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Info del tramo */}
              <div className={styles.infoTramo}>
                <h4>📌 Tu tramo: {resultados.tramo?.id}</h4>
                <p>
                  Rendimiento neto mensual entre {formatCurrency(resultados.tramo?.rendimientoMin || 0)}
                  {resultados.tramo?.rendimientoMax
                    ? ` y ${formatCurrency(resultados.tramo.rendimientoMax)}`
                    : ' o más'
                  }
                </p>
                <p>
                  Base de cotización: entre {formatCurrency(resultados.tramo?.baseMinima || 0)} y {formatCurrency(resultados.tramo?.baseMaxima || 0)}
                </p>
                <p className={styles.infoTramoNota}>
                  💡 Puedes elegir una base mayor dentro del tramo para aumentar tus coberturas
                  (prestaciones, jubilación, etc.)
                </p>
              </div>
            </section>
          )}
        </>
      )}

      {/* Vista: Tabla de Tramos */}
      {vistaActiva === 'tramos' && renderTablaTramos()}

      {/* Vista: Bonificaciones */}
      {vistaActiva === 'bonificaciones' && (
        <section className={styles.bonificacionesSection}>
          <h2>🎯 Bonificaciones disponibles</h2>
          <p className={styles.bonificacionesIntro}>
            Existen diferentes bonificaciones que pueden reducir significativamente tu cuota de autónomo.
            Verifica si cumples los requisitos para acceder a alguna de ellas.
          </p>
          {renderBonificaciones()}
        </section>
      )}

      {/* Notas importantes */}
      <div className={styles.notas}>
        <h3>📝 Notas importantes</h3>
        <ul>
          <li>
            <strong>Rendimiento neto</strong> = Ingresos - Gastos deducibles. Es la base para determinar tu tramo.
          </li>
          <li>
            <strong>Base de cotización</strong>: Puedes elegir entre la mínima y la máxima de tu tramo.
            Una base mayor implica mayor cuota pero mejores prestaciones.
          </li>
          <li>
            <strong>Regularización anual</strong>: La Seguridad Social comparará tu rendimiento declarado
            con el real. Si hay diferencia, te reclamarán o devolverán la diferencia.
          </li>
          <li>
            <strong>Tarifa plana</strong>: Solo para nuevos autónomos sin actividad previa en los últimos 2 años.
          </li>
        </ul>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal - Exención de Responsabilidad</h3>
        <p>
          Esta calculadora es una <strong>herramienta orientativa con fines educativos</strong> basada en la
          normativa vigente ({NORMATIVA.titulo}). Los resultados son estimaciones que pueden variar según:
        </p>
        <ul>
          <li>Tu situación personal y profesional específica</li>
          <li>Bonificaciones adicionales que puedas tener derecho</li>
          <li>Cambios normativos posteriores a la última actualización</li>
          <li>Criterios de la Tesorería General de la Seguridad Social</li>
        </ul>
        <p>
          <strong>meskeIA no se responsabiliza de decisiones tomadas en base a estos cálculos.</strong>
          Antes de darte de alta o modificar tu base de cotización, consulta siempre con la
          Seguridad Social, tu gestoría o un asesor profesional.
        </p>
        <p className={styles.disclaimerFecha}>
          Última actualización de datos: {NORMATIVA.ultimaActualizacion}
        </p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre la cotización de autónomos?"
        subtitle="Entiende el sistema de cotización por ingresos reales, cómo se calcula tu cuota y estrategias para optimizarla"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>El Sistema de Cotización por Ingresos Reales</h2>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>📊 ¿Cómo funciona?</h4>
              <p>
                Desde 2023, los autónomos cotizan según sus ingresos reales (rendimiento neto),
                no según una base elegida libremente. El sistema divide los rendimientos en 15 tramos,
                cada uno con una base mínima y máxima de cotización.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>🔄 Regularización anual</h4>
              <p>
                Al año siguiente, Hacienda comunica a la Seguridad Social tus rendimientos reales
                declarados en la Renta. Si cotizaste de más, te devuelven; si cotizaste de menos,
                te reclaman la diferencia.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>💡 ¿Puedo elegir base mayor?</h4>
              <p>
                Sí, dentro de tu tramo puedes elegir una base superior a la mínima (hasta la máxima
                del tramo). Esto aumenta tu cuota pero también tus prestaciones: baja por enfermedad,
                maternidad/paternidad, jubilación, etc.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>📈 Cambios de tramo</h4>
              <p>
                Puedes modificar tu base de cotización hasta 6 veces al año a través del sistema
                RED de la Seguridad Social. Es importante ajustarla si tus ingresos varían
                significativamente para evitar regularizaciones grandes.
              </p>
            </div>
          </div>

          <h3>Estrategias de optimización</h3>
          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>🎯 Para nuevos autónomos</h4>
              <ul>
                <li>Aprovecha la tarifa plana (80€/mes durante 12-24 meses)</li>
                <li>Calcula bien tus gastos deducibles para estimar el rendimiento</li>
                <li>Considera darte de alta a principios de año para simplificar cálculos</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>💰 Para optimizar la cuota</h4>
              <ul>
                <li>Maximiza los gastos deducibles legítimos</li>
                <li>Si tus ingresos son estacionales, actualiza la base cada trimestre</li>
                <li>Valora si te compensa cotizar por base mayor (futuras prestaciones)</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-cuota-autonomo')} />
      <Footer appName="calculadora-cuota-autonomo" />
    </div>
  );
}
