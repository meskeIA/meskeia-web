'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorCuotaAutonomo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { FISCAL_AUTONOMOS_META, TRAMOS_RETA_2025, TIPO_COTIZACION_RETA } from '@/data/fiscal';

// Datos fiscales centralizados en data/fiscal/autonomos.ts
// FISCAL_AUTONOMOS_META, TRAMOS_RETA_2025, TIPO_COTIZACION_RETA importados al inicio

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

export default function EstimadorCuotaAutonomoPage() {
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
    const tramo = TRAMOS_RETA_2025.find(t => {
      if (t.rendimientoMax === null) {
        return rendimientoNetoMensual >= t.rendimientoMin;
      }
      return rendimientoNetoMensual >= t.rendimientoMin && rendimientoNetoMensual < t.rendimientoMax;
    }) || TRAMOS_RETA_2025[0];

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
    const cuotaMensual = baseCotizacion * TIPO_COTIZACION_RETA;
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
      tipoCotizacion: TIPO_COTIZACION_RETA * 100,
    };
  }, [ingresosAnuales, gastosAnuales, tieneBonicacion, bonificacionSeleccionada]);

  // Renderizar tabla de tramos
  const renderTablaTramos = () => (
    <div className={styles.tablaTramos}>
      <h3>📊 Tabla de Tramos 2025</h3>
      <p className={styles.tablaSubtitulo}>
        Base normativa: {FISCAL_AUTONOMOS_META.fuente}
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
            {TRAMOS_RETA_2025.map((tramo, index) => (
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
        <h1 className={styles.title}>Estimador de Cuota de Autónomo</h1>
        <p className={styles.subtitle}>
          Estima tu cuota mensual orientativa según el sistema de cotización por ingresos reales
        </p>
      </header>

      <DisclaimerCard variant="financial" severity="medium" />

      {/* Referencia Normativa */}
      <div className={styles.normativaBox}>
        <div className={styles.normativaHeader}>
          <span>📜</span>
          <strong>Base Normativa</strong>
        </div>
        <p>{FISCAL_AUTONOMOS_META.fuente}</p>
        <p className={styles.normativaVigencia}>
          Vigencia: {FISCAL_AUTONOMOS_META.vigencia} | Datos verificados: {FISCAL_AUTONOMOS_META.verificado}
        </p>
        <p className={styles.normativaNota}>{FISCAL_AUTONOMOS_META.nota}</p>
        <p className={styles.normativaNota}>
          <a href={FISCAL_AUTONOMOS_META.urlOficial} target="_blank" rel="noopener noreferrer">
            Consultar fuente oficial (Seguridad Social) →
          </a>
        </p>
      </div>

      {/* Navegación de vistas */}
      <div className={styles.navTabs}>
        <button
          className={`${styles.navTab} ${vistaActiva === 'calculadora' ? styles.navTabActivo : ''}`}
          onClick={() => setVistaActiva('calculadora')}
        >
          🧮 Estimador
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
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento profesional</h3>
        <p>
          Este estimador es una <strong>herramienta de orientación educativa</strong> basada en{' '}
          <a href={FISCAL_AUTONOMOS_META.urlOficial} target="_blank" rel="noopener noreferrer">
            {FISCAL_AUTONOMOS_META.fuente}
          </a>. Los resultados son <strong>estimaciones orientativas</strong> que pueden variar según:
        </p>
        <ul>
          <li>Tu situación personal y profesional específica</li>
          <li>Bonificaciones adicionales a las que puedas tener derecho</li>
          <li>Cambios normativos posteriores a la fecha de verificación</li>
          <li>Criterios de la Tesorería General de la Seguridad Social</li>
        </ul>
        <p>
          <strong>meskeIA no se responsabiliza de decisiones tomadas en base a estas estimaciones.</strong>{' '}
          Antes de darte de alta o modificar tu base de cotización, consulta siempre con la{' '}
          <a href={FISCAL_AUTONOMOS_META.urlOficial} target="_blank" rel="noopener noreferrer">
            Seguridad Social
          </a>, tu gestoría o un asesor profesional.
        </p>
        <p className={styles.disclaimerFecha}>
          Datos verificados: {FISCAL_AUTONOMOS_META.verificado} | Vigencia: {FISCAL_AUTONOMOS_META.vigencia}
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

      <RelatedApps apps={getRelatedApps('estimador-cuota-autonomo')} />
      <ShareCard appName="estimador-cuota-autonomo" />
      <Footer appName="estimador-cuota-autonomo" />
    </div>
  );
}
