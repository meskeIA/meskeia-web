'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorCuotaAutonomo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
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

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_AUTONOMOS_META.fuente}
        fuente={FISCAL_AUTONOMOS_META.fuente}
        verificado={FISCAL_AUTONOMOS_META.verificado}
        urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
      />

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
        subtitle="Entiende el sistema de cotización por ingresos reales, cómo se calcula tu cuota y cómo ajustarla a tu situación (cuota mínima legal vs prestaciones futuras)."
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

        {/* ============================================ */}
        {/* SECCIÓN 2: CASOS DE USO — 4 PERFILES REALES  */}
        {/* ============================================ */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso: 4 Perfiles Reales</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎨</span>
                <div>
                  <strong>Freelance diseñador gráfico</strong>
                  <span>18.000 € rendimiento neto/año</span>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Rendimiento mensual:</strong> 1.500 €/mes</p>
                <p><strong>Tramo aplicable:</strong> Tramo 6 (1.500 – 1.700 €)</p>
                <p><strong>Base mínima:</strong> 960,78 €</p>
                <p><strong>Cuota mensual:</strong> 302,65 €/mes · 3.631,80 €/año</p>
              </div>
              <p className={styles.escenarioTip}>
                💡 Los tramos 5 y 6 comparten la misma base mínima (960,78 €), así que cotizar por la base mínima no encarece la cuota al subir de tramo. Solo conviene elegir una base superior si interesa mejorar prestaciones futuras (jubilación, incapacidad).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <div>
                  <strong>Consultora independiente</strong>
                  <span>48.000 € rendimiento neto/año</span>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Rendimiento mensual:</strong> 4.000 €/mes</p>
                <p><strong>Tramo aplicable:</strong> Tramo 13 (3.620 – 4.050 €)</p>
                <p><strong>Base mínima:</strong> 1.601,31 €</p>
                <p><strong>Cuota mensual:</strong> 504,41 €/mes · 6.052,92 €/año</p>
              </div>
              <p className={styles.escenarioTip}>
                💡 Con ingresos altos y estables puede valorar subir la base hacia 2.000 €/mes: la cuota sube a 630 €, pero la prestación por IT o maternidad se multiplica.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <div>
                  <strong>Autónomo societario</strong>
                  <span>&gt; 6.000 €/mes rendimiento neto</span>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Rendimiento mensual:</strong> &gt; 6.000 €</p>
                <p><strong>Tramo aplicable:</strong> Tramo 15 (máximo)</p>
                <p><strong>Base mínima:</strong> 1.928,10 €</p>
                <p><strong>Cuota mínima:</strong> 607,35 €/mes · 7.288,20 €/año</p>
              </div>
              <p className={styles.escenarioTip}>
                💡 Los autónomos societarios tributan por los rendimientos del trabajo percibidos de la sociedad, no por los beneficios de la empresa. El tramo se calcula sobre el salario declarado.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🆕</span>
                <div>
                  <strong>Nuevo autónomo con tarifa plana</strong>
                  <span>Primer alta en el RETA</span>
                </div>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Cuota durante 12 meses:</strong> 80 €/mes</p>
                <p><strong>Ahorro vs. tramo 6:</strong> 222,65 €/mes · 2.671,80 €/año</p>
                <p><strong>Prórroga 12 meses adicionales:</strong> si los rendimientos anuales no superan el SMI (~17.094 € en 2026)</p>
                <p><strong>Requisito:</strong> sin alta en RETA en los últimos 2 años</p>
              </div>
              <p className={styles.escenarioTip}>
                💡 Si cumples los requisitos, la tarifa plana es la medida de mayor impacto en los primeros 2 años. Ahorro total potencial si se extiende: hasta 5.343,60 € en 24 meses.
              </p>
            </div>

          </div>
        </section>

        {/* ============================================ */}
        {/* SECCIÓN 3: FAQ — 8 PREGUNTAS FRECUENTES      */}
        {/* ============================================ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre la Cotización de Autónomos</h2>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h4>¿Qué es el rendimiento neto y cómo lo calculo para el RETA?</h4>
              <p>
                El rendimiento neto es el resultado de restar a tus ingresos brutos todos los gastos deducibles de la actividad:
                material, suministros, cuotas profesionales, seguros, amortizaciones, etc. Para actividades en estimación directa,
                es el resultado del modelo 130 (pagos fraccionados IRPF). Para módulos, se aplica una fórmula simplificada basada en índices.
                <strong> La cuota de autónomo del propio ejercicio también es gasto deducible</strong>, lo que reduce ligeramente el rendimiento final.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo cambiar de tramo si mis ingresos bajan inesperadamente?</h4>
              <p>
                Sí. Puedes modificar tu base de cotización hasta <strong>6 veces al año</strong> a través del sistema
                RED de la Seguridad Social o la sede electrónica. Los cambios tienen efecto el primer día del mes siguiente
                a la solicitud. Si prevés que tus ingresos van a caer de forma significativa (por ejemplo, al perder un cliente
                importante), solicita el cambio cuanto antes para evitar cotizar de más y acumular deuda de regularización inversa.
              </p>
              <p className={styles.faqTip}>Plazos de cambio: enero, marzo, mayo, julio, septiembre, noviembre (6 ventanas anuales).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa en la regularización anual si cotizé de más?</h4>
              <p>
                La Agencia Tributaria comunica a la TGSS tus rendimientos netos reales tras la Renta (modelo 100, presentada
                entre abril y junio). Si cotizaste por un tramo superior al que corresponde, la Seguridad Social te
                <strong> devuelve la diferencia</strong> antes del 31 de diciembre del año siguiente. Si cotizaste por menos,
                te reclaman el importe. No hay penalización si la diferencia se paga en el plazo indicado.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿La tarifa plana de 80 € se aplica a todos los nuevos autónomos?</h4>
              <p>
                No. La tarifa plana requiere: (1) no haber estado dado de alta en el RETA en los últimos 2 años
                (3 años si ya disfrutaste de tarifa plana anteriormente), y (2) ser el primer alta o haber transcurrido
                el periodo de carencia. Los autónomos colaboradores (familiares contratados) tienen condiciones distintas.
                La tarifa es de <strong>80 €/mes durante 12 meses</strong>, prorrogable otros 12 meses si los rendimientos
                netos anuales no superan el SMI (~17.094 € en 2026).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afecta la cotización a mi futura pensión de jubilación?</h4>
              <p>
                La pensión de jubilación se calcula sobre las bases cotizadas durante los últimos 25 años (ampliándose
                progresivamente hasta toda la vida laboral). Cotizar por la base mínima del tramo genera una pensión más baja.
                Por ejemplo, cotizar por 1.000 €/mes durante 25 años genera una pensión aproximada de <strong>~700–750 €/mes</strong>,
                mientras que hacerlo por 2.000 €/mes puede doblarla. Si tienes más de 45 años o planeas jubilarte en menos
                de 20 años, puede valer la pena subir la base progresivamente.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Tengo derecho a paro si soy autónomo y cierro el negocio?</h4>
              <p>
                Los autónomos no tienen acceso al desempleo como los trabajadores por cuenta ajena. Sin embargo, existe la
                <strong> prestación por cese de actividad</strong> (conocida popularmente como «paro de autónomos»), equivalente
                al 70% de la base reguladora, durante un período proporcional a los meses cotizados por esta contingencia
                (mínimo 12 meses cotizados para tener derecho). Cotizar por cese es <strong>voluntario</strong>, aunque desde
                2019 viene incluido en el tipo ordinario.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el cese de actividad y cuándo puedo solicitarlo?</h4>
              <p>
                El cese de actividad es la prestación equivalente al paro para autónomos. Puedes solicitarlo cuando se produce
                el cierre definitivo de la actividad por: pérdidas acumuladas superiores al 10% de los ingresos en un año
                (o al 20% en dos años consecutivos), ejecución judicial de deuda, pérdida de licencia, violencia de género,
                divorcio o separación con cese forzado, o declaración de concurso. El trámite se realiza en la mutua
                colaboradora correspondiente en un plazo de <strong>15 días hábiles</strong> tras el cese.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo conviene cotizar por una base mayor que la mínima del tramo?</h4>
              <p>
                Subir la base tiene sentido en estos escenarios concretos: (1) <strong>maternidad o paternidad próxima</strong>
                —la prestación es proporcional a la base cotizada en los 6 meses anteriores—; (2) <strong>baja por IT</strong>
                de larga duración prevista —misma regla—; (3) <strong>autónomos mayores de 50 años</strong> que quieran
                mejorar la pensión en los últimos tramos de su carrera; (4) <strong>ingresos variables con picos altos</strong>
                en los que la regularización podría ser elevada de todas formas. El coste adicional por subir 200 €
                la base es de aproximadamente <strong>63 €/mes</strong> adicionales (31,50%).
              </p>
            </div>

          </div>
        </section>

        {/* ============================================ */}
        {/* SECCIÓN 4: GUÍA PASO A PASO — 6 PASOS        */}
        {/* ============================================ */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Gestiona tu Cotización</h2>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Estima tus rendimientos netos para el año</h4>
                <p>
                  Suma todos los ingresos previstos (sin IVA) y réstalos los gastos deducibles de la actividad:
                  material, alquiler de espacio, suministros proporcionales, cuotas de colegios o asociaciones,
                  seguros de responsabilidad civil, amortizaciones, etc. El resultado es tu <strong>rendimiento neto anual previsto</strong>.
                  Divídelo entre 12 para obtener el mensual y localiza tu tramo en la tabla de 15 tramos RETA 2025.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Identifica tu tramo y la base mínima correspondiente</h4>
                <p>
                  Con el rendimiento neto mensual calculado, localiza en qué tramo (1 al 15) estás encuadrado.
                  La <strong>base mínima del tramo</strong> es el punto de partida de tu cuota. Recuerda que puedes
                  elegir cualquier base entre la mínima y la máxima del tramo. Si no tienes claro cuánto vas a ingresar,
                  empieza con la mínima y ajusta trimestralmente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Alta en el RETA — modelo TA.0521 o sede electrónica</h4>
                <p>
                  El alta se puede tramitar en la sede electrónica de la Seguridad Social (import.seg-social.gob.es)
                  o presencialmente en la oficina de la TGSS. El alta tiene <strong>efecto desde el primer día del mes</strong>
                  si se solicita antes del día 1; si se solicita durante el mes, surte efecto desde el día de solicitud.
                  Es fundamental darse de alta <em>antes</em> de iniciar la actividad —no retroactúa, pero Hacienda puede
                  detectar actividad anterior y sancionar.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Monitoriza trimestralmente y ajusta la base si es necesario</h4>
                <p>
                  Cada vez que presentes el modelo 130 (pago fraccionado del IRPF, trimestral), aprovecha para revisar
                  si tus rendimientos reales se están alejando de la previsión. Si han subido, solicita cambio de tramo
                  antes de fin del trimestre para evitar regularización alta. Si han bajado, redúcela para no pagar de más.
                  Recuerda: <strong>hasta 6 cambios anuales</strong> con efectividad el día 1 del mes siguiente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Declara en la Renta con los ingresos y gastos reales</h4>
                <p>
                  En el modelo 100 (IRPF, entre abril y junio del año siguiente) declararás todos los ingresos y gastos
                  reales de tu actividad. La cuota de autónomo pagada es <strong>gasto deducible en el IRPF</strong>,
                  lo que reduce tu base imponible. Una vez presentada la Renta, la AEAT comunica los datos a la TGSS
                  para iniciar el proceso de regularización.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Espera la regularización anual (devolución o cobro)</h4>
                <p>
                  La TGSS comunicará el resultado de la regularización normalmente entre julio y diciembre del año
                  siguiente a la presentación de la Renta. Si cotizaste de más, recibirás una <strong>devolución
                  automática</strong> en la cuenta bancaria asociada. Si cotizaste de menos, recibirás un cargo
                  (normalmente domiciliado). No hay recargo si se paga en el plazo indicado. El importe puede oscilar
                  entre decenas y varios miles de euros según la desviación.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================ */}
        {/* SECCIÓN 5: MEJORES PRÁCTICAS — 6 TIPS        */}
        {/* ============================================ */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas para Gestionar tu Cotización</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h4>Lleva contabilidad mensual</h4>
              <p>
                Registra ingresos y gastos cada mes, no al final del año. Así puedes ajustar la base a tiempo
                —hasta 6 cambios/año— y evitar sorpresas en la regularización. Un Excel básico o una app
                de facturación sirve para empezar.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <h4>No esperes a diciembre para ajustar</h4>
              <p>
                Si en octubre ves que has ingresado el doble de lo previsto, ajusta la base en noviembre.
                La regularización se calcula sobre todo el año, y cotizar muy por debajo puede suponer
                un cobro de <strong>más de 1.000 € en un solo recibo</strong> al año siguiente.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧾</span>
              <h4>Guarda todas las facturas de gastos</h4>
              <p>
                Los gastos deducibles reducen el rendimiento neto y, por tanto, el tramo de cotización.
                Una factura de 200 € en material puede reducir tu cuota mensual en varios euros al año siguiente.
                Digitaliza y archiva con herramientas como Holded, Quipu o simplemente Google Drive.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>👶</span>
              <h4>Sube la base antes de pedir maternidad/paternidad</h4>
              <p>
                La prestación por nacimiento se calcula sobre la <strong>base reguladora de los 6 meses anteriores</strong>.
                Si la subes con antelación suficiente, la prestación (que puede durar hasta 20 semanas) será más alta.
                Por ejemplo, pasar de base 960 € a 1.500 €/mes supone cobrar ~240 € más a la semana durante el permiso.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>Consulta tu historial en la sede de la SS</h4>
              <p>
                En <strong>sede.seg-social.gob.es</strong> puedes consultar tu vida laboral, bases cotizadas históricas
                y el resultado de regularizaciones anteriores. Antes de subir o bajar la base, revisa tus datos reales
                para no cometer errores de cálculo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h4>Si tienes pluriactividad, revisa la bonificación</h4>
              <p>
                Si cotizas al mismo tiempo como asalariado y como autónomo, puede aplicar la
                <strong> bonificación por pluriactividad</strong>: devolución de entre el 25% y el 50% de las cuotas
                de autónomo cuando la suma de bases supera cierto tope (en 2025, ~15.266 €/año). Solicítala
                a través de la TGSS antes del 30 de abril del año siguiente.
              </p>
            </div>

          </div>
        </section>

        {/* ============================================ */}
        {/* SECCIÓN 6: WARNING BOX — 6 ERRORES COMUNES   */}
        {/* ============================================ */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>6 errores frecuentes en la gestión de la cuota de autónomo</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No ajustar la base cuando los ingresos suben.</strong> Si facturas 3.000 €/mes y sigues
                cotizando por el tramo 6 (960 €/mes), la regularización anual puede superar <strong>1.200 €</strong>
                de golpe. Monitoriza cada trimestre y ajusta preventivamente.
              </li>
              <li>
                <strong>Olvidar que los gastos deducibles reducen el tramo.</strong> Muchos autónomos cotizan
                por un tramo superior al necesario porque no tienen en cuenta que los gastos (gestoría, material,
                suministros, cuota propia) reducen el rendimiento neto. Revisa tu base con los gastos reales incluidos.
              </li>
              <li>
                <strong>Darse de alta tarde en el RETA.</strong> La Seguridad Social no retroactúa el alta,
                pero Hacienda sí puede detectar actividad con facturas emitidas o ingresos previos. La sanción
                por inicio de actividad sin alta puede llegar al <strong>doble de las cuotas no ingresadas</strong>
                más recargos e intereses.
              </li>
              <li>
                <strong>Confundir base de cotización con cuota.</strong> La base es la cantidad sobre la que
                se aplica el tipo (31,50%). La cuota es el resultado: base × 31,50%. Por ejemplo, base 1.000 € →
                cuota 315 €. Base 2.000 € → cuota 630 €. El MEI (0,90% en 2026) ya está incluido en el tipo desde 2023.
              </li>
              <li>
                <strong>No solicitar el cese de actividad al cerrar.</strong> Si te das de baja en Hacienda
                (modelo 036/037) pero no te das de baja también en el RETA, los recibos de la cuota mensual
                seguirán cargándose en tu cuenta. La baja en el RETA debe tramitarse en los <strong>3 días naturales</strong>
                siguientes al cese real de la actividad.
              </li>
              <li>
                <strong>Ignorar el MEI en el cálculo.</strong> Desde enero de 2023, el tipo de cotización
                incluye la Aportación al Mecanismo de Equidad Intergeneracional (MEI), que sube cada año y en 2026
                es del 0,90% sobre la base de cotización. No es separado —viene integrado en el recibo— pero sí afecta
                al cálculo real de la cuota. Para una base de 1.000 €, representa <strong>9 €/mes adicionales</strong> que algunos autónomos
                no contabilizan.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-cuota-autonomo')} />
      <ShareCard appName="estimador-cuota-autonomo" />
      <Footer appName="estimador-cuota-autonomo" />
    </div>
  );
}
