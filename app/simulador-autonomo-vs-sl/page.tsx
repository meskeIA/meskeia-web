'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorAutonomoVsSL.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// CONFIGURACIÓN FISCAL 2024/2025
// ============================================

// Tramos IRPF 2024 (estatales + estimación autonómicos)
const TRAMOS_IRPF = [
  { hasta: 12450, tipo: 0.19 },
  { hasta: 20200, tipo: 0.24 },
  { hasta: 35200, tipo: 0.30 },
  { hasta: 60000, tipo: 0.37 },
  { hasta: 300000, tipo: 0.45 },
  { hasta: Infinity, tipo: 0.47 },
];

// Impuesto de Sociedades
const TIPO_IS_GENERAL = 0.25;
const TIPO_IS_PYMES = 0.23; // Empresas con cifra negocios < 1M€

// Cuota autónomo (estimación media - varía según ingresos reales)
const CUOTA_AUTONOMO_MEDIA_MENSUAL = 300; // Estimación para rendimientos medios

// Cuota mínima RETA administrador SL
const CUOTA_RETA_ADMIN_SL_MENSUAL = 380; // Base mínima administrador societario

// Gastos fijos estimados SL (gestoría, registro, etc.)
const GASTOS_FIJOS_SL_ANUAL = 1500;

// Mínimo personal IRPF
const MINIMO_PERSONAL = 5550;

// Reducción por rendimientos del trabajo (aplicable a nómina en SL)
const calcularReduccionRendimientosTrabajo = (rendimientoNeto: number): number => {
  if (rendimientoNeto <= 14852) return 6498;
  if (rendimientoNeto <= 17673.52) return 6498 - (rendimientoNeto - 14852) * 1.14;
  return 0;
};

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

/**
 * Calcula el IRPF por tramos
 */
const calcularIRPF = (baseImponible: number): number => {
  if (baseImponible <= 0) return 0;

  let impuesto = 0;
  let baseRestante = baseImponible;
  let limiteAnterior = 0;

  for (const tramo of TRAMOS_IRPF) {
    const baseTramo = Math.min(baseRestante, tramo.hasta - limiteAnterior);
    if (baseTramo <= 0) break;

    impuesto += baseTramo * tramo.tipo;
    baseRestante -= baseTramo;
    limiteAnterior = tramo.hasta;
  }

  return impuesto;
};

/**
 * Calcula tipo medio efectivo de IRPF
 */
const calcularTipoMedioIRPF = (baseImponible: number): number => {
  if (baseImponible <= 0) return 0;
  const impuesto = calcularIRPF(baseImponible);
  return (impuesto / baseImponible) * 100;
};

/**
 * Calcula el escenario AUTÓNOMO
 */
const calcularEscenarioAutonomo = (
  ingresosBrutos: number,
  gastosDeducibles: number,
  cotizacionAnual: number
) => {
  // Rendimiento neto = Ingresos - Gastos - Cotización SS (deducible)
  const rendimientoNeto = Math.max(0, ingresosBrutos - gastosDeducibles - cotizacionAnual);

  // Base imponible = Rendimiento neto - Mínimo personal
  const baseImponible = Math.max(0, rendimientoNeto - MINIMO_PERSONAL);

  // IRPF a pagar
  const irpf = calcularIRPF(baseImponible);

  // Tipo medio efectivo
  const tipoMedio = rendimientoNeto > 0 ? (irpf / rendimientoNeto) * 100 : 0;

  // Neto disponible = Ingresos - Gastos - Cotización - IRPF
  const netoDisponible = ingresosBrutos - gastosDeducibles - cotizacionAnual - irpf;

  return {
    ingresosBrutos,
    gastosDeducibles,
    cotizacionAnual,
    rendimientoNeto,
    baseImponible,
    irpf,
    tipoMedio,
    netoDisponible,
    totalImpuestos: irpf + cotizacionAnual,
  };
};

/**
 * Calcula el escenario SL
 * Asume que el socio se paga una nómina y el resto queda en la sociedad
 */
const calcularEscenarioSL = (
  ingresosBrutos: number,
  gastosDeducibles: number,
  cotizacionAnual: number,
  nominaAnual: number
) => {
  // Gastos totales de la sociedad
  const gastosTotalesSL = gastosDeducibles + GASTOS_FIJOS_SL_ANUAL + nominaAnual + cotizacionAnual;

  // Beneficio antes de impuestos
  const beneficioAnteIS = Math.max(0, ingresosBrutos - gastosTotalesSL);

  // Impuesto de Sociedades (tipo pymes para < 1M€)
  const tipoIS = ingresosBrutos < 1000000 ? TIPO_IS_PYMES : TIPO_IS_GENERAL;
  const impuestoSociedades = beneficioAnteIS * tipoIS;

  // Beneficio neto de la sociedad (disponible para dividendos o reservas)
  const beneficioNetoSociedad = beneficioAnteIS - impuestoSociedades;

  // IRPF de la nómina del administrador
  const reduccionRT = calcularReduccionRendimientosTrabajo(nominaAnual);
  const rendimientoNetoTrabajo = Math.max(0, nominaAnual - reduccionRT);
  const baseImponibleNomina = Math.max(0, rendimientoNetoTrabajo - MINIMO_PERSONAL);
  const irpfNomina = calcularIRPF(baseImponibleNomina);

  // Si se reparten dividendos (tributación del 19-23% sobre dividendos)
  // Simplificamos: asumimos que NO se reparten dividendos (se reinvierten)
  const dividendosRepartidos = 0;
  const irpfDividendos = 0;

  // Neto disponible = Nómina neta + Beneficio en sociedad
  const nominaNeta = nominaAnual - irpfNomina;
  const netoDisponible = nominaNeta + beneficioNetoSociedad;

  // Tipo medio efectivo total
  const totalImpuestos = impuestoSociedades + irpfNomina + cotizacionAnual;
  const tipoMedio = ingresosBrutos > 0 ? (totalImpuestos / ingresosBrutos) * 100 : 0;

  return {
    ingresosBrutos,
    gastosDeducibles,
    gastosFijosSL: GASTOS_FIJOS_SL_ANUAL,
    cotizacionAnual,
    nominaAnual,
    beneficioAnteIS,
    tipoIS: tipoIS * 100,
    impuestoSociedades,
    beneficioNetoSociedad,
    irpfNomina,
    nominaNeta,
    dividendosRepartidos,
    irpfDividendos,
    netoDisponible,
    totalImpuestos,
    tipoMedio,
  };
};

export default function SimuladorAutonomoVsSLPage() {
  // Inputs del usuario
  const [ingresosBrutos, setIngresosBrutos] = useState('60000');
  const [gastosDeducibles, setGastosDeducibles] = useState('15000');
  const [nominaSL, setNominaSL] = useState('24000');

  // Parsear valores
  const ingresos = parseSpanishNumber(ingresosBrutos) || 0;
  const gastos = parseSpanishNumber(gastosDeducibles) || 0;
  const nomina = parseSpanishNumber(nominaSL) || 0;

  // Cotizaciones anuales
  const cotizacionAutonomo = CUOTA_AUTONOMO_MEDIA_MENSUAL * 12;
  const cotizacionAdminSL = CUOTA_RETA_ADMIN_SL_MENSUAL * 12;

  // Calcular escenarios
  const escenarioAutonomo = useMemo(() =>
    calcularEscenarioAutonomo(ingresos, gastos, cotizacionAutonomo),
    [ingresos, gastos, cotizacionAutonomo]
  );

  const escenarioSL = useMemo(() =>
    calcularEscenarioSL(ingresos, gastos, cotizacionAdminSL, nomina),
    [ingresos, gastos, cotizacionAdminSL, nomina]
  );

  // Determinar recomendación
  const diferencia = escenarioSL.netoDisponible - escenarioAutonomo.netoDisponible;
  const mejorOpcion = diferencia > 500 ? 'sl' : diferencia < -500 ? 'autonomo' : 'similar';

  // Calcular punto de equilibrio aproximado
  const puntoEquilibrio = useMemo(() => {
    // Buscar facturación donde ambos son similares
    for (let facturacion = 20000; facturacion <= 200000; facturacion += 1000) {
      const autoTest = calcularEscenarioAutonomo(facturacion, facturacion * 0.25, cotizacionAutonomo);
      const slTest = calcularEscenarioSL(facturacion, facturacion * 0.25, cotizacionAdminSL, Math.min(facturacion * 0.4, 40000));
      if (slTest.netoDisponible > autoTest.netoDisponible) {
        return facturacion;
      }
    }
    return 60000; // Valor por defecto si no se encuentra
  }, [cotizacionAutonomo, cotizacionAdminSL]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>⚖️</span>
        <h1 className={styles.title}>Simulador Autónomo vs SL</h1>
        <p className={styles.subtitle}>
          Compara fiscalmente ambas opciones y descubre cuál te conviene más según tu facturación
        </p>
      </header>

      {/* Formulario de entrada */}
      <section className={styles.inputSection}>
        <h2>📊 Datos de tu actividad</h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="ingresos">Facturación anual bruta</label>
            <div className={styles.inputWrapper}>
              <input
                id="ingresos"
                type="text"
                value={ingresosBrutos}
                onChange={(e) => setIngresosBrutos(e.target.value)}
                placeholder="60000"
              />
              <span className={styles.inputSuffix}>€</span>
            </div>
            <span className={styles.inputHint}>Total de ingresos antes de gastos</span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="gastos">Gastos deducibles anuales</label>
            <div className={styles.inputWrapper}>
              <input
                id="gastos"
                type="text"
                value={gastosDeducibles}
                onChange={(e) => setGastosDeducibles(e.target.value)}
                placeholder="15000"
              />
              <span className={styles.inputSuffix}>€</span>
            </div>
            <span className={styles.inputHint}>Gastos de la actividad (sin cotización SS)</span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nomina">Nómina anual como administrador SL</label>
            <div className={styles.inputWrapper}>
              <input
                id="nomina"
                type="text"
                value={nominaSL}
                onChange={(e) => setNominaSL(e.target.value)}
                placeholder="24000"
              />
              <span className={styles.inputSuffix}>€</span>
            </div>
            <span className={styles.inputHint}>Sueldo bruto que te pagarías en la SL</span>
          </div>
        </div>
      </section>

      {/* Resultado principal */}
      <section className={styles.resultadoPrincipal}>
        <div className={`${styles.recomendacion} ${styles[mejorOpcion]}`}>
          {mejorOpcion === 'sl' && (
            <>
              <span className={styles.recomendacionIcon}>🏢</span>
              <div>
                <h3>Te conviene más la SL</h3>
                <p>Ahorrarías aproximadamente <strong>{formatCurrency(Math.abs(diferencia))}</strong> al año</p>
              </div>
            </>
          )}
          {mejorOpcion === 'autonomo' && (
            <>
              <span className={styles.recomendacionIcon}>💼</span>
              <div>
                <h3>Te conviene más ser Autónomo</h3>
                <p>Ahorrarías aproximadamente <strong>{formatCurrency(Math.abs(diferencia))}</strong> al año</p>
              </div>
            </>
          )}
          {mejorOpcion === 'similar' && (
            <>
              <span className={styles.recomendacionIcon}>⚖️</span>
              <div>
                <h3>Ambas opciones son similares</h3>
                <p>La diferencia es de solo <strong>{formatCurrency(Math.abs(diferencia))}</strong> al año</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Comparativa detallada */}
      <section className={styles.comparativa}>
        <h2>📋 Comparativa detallada</h2>

        <div className={styles.comparativaGrid}>
          {/* Columna Autónomo */}
          <div className={styles.columna}>
            <div className={styles.columnaHeader} style={{ backgroundColor: '#2E86AB' }}>
              <span className={styles.columnaIcon}>💼</span>
              <h3>Autónomo</h3>
            </div>

            <div className={styles.columnaBody}>
              <div className={styles.lineaDetalle}>
                <span>Ingresos brutos</span>
                <span>{formatCurrency(escenarioAutonomo.ingresosBrutos)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Gastos deducibles</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioAutonomo.gastosDeducibles)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Cotización RETA</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioAutonomo.cotizacionAnual)}</span>
              </div>
              <div className={styles.lineaSeparador}></div>
              <div className={styles.lineaDetalle}>
                <span>Rendimiento neto</span>
                <span>{formatCurrency(escenarioAutonomo.rendimientoNeto)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>IRPF a pagar</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioAutonomo.irpf)}</span>
              </div>
              <div className={`${styles.lineaDetalle} ${styles.tipoMedio}`}>
                <span>Tipo medio IRPF</span>
                <span>{formatNumber(escenarioAutonomo.tipoMedio, 1)}%</span>
              </div>
              <div className={styles.lineaSeparador}></div>
              <div className={`${styles.lineaDetalle} ${styles.totalImpuestos}`}>
                <span>Total impuestos + SS</span>
                <span>{formatCurrency(escenarioAutonomo.totalImpuestos)}</span>
              </div>
              <div className={`${styles.lineaDetalle} ${styles.netoFinal}`}>
                <span>NETO DISPONIBLE</span>
                <span>{formatCurrency(escenarioAutonomo.netoDisponible)}</span>
              </div>
            </div>
          </div>

          {/* Columna SL */}
          <div className={styles.columna}>
            <div className={styles.columnaHeader} style={{ backgroundColor: '#48A9A6' }}>
              <span className={styles.columnaIcon}>🏢</span>
              <h3>Sociedad Limitada</h3>
            </div>

            <div className={styles.columnaBody}>
              <div className={styles.lineaDetalle}>
                <span>Ingresos brutos</span>
                <span>{formatCurrency(escenarioSL.ingresosBrutos)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Gastos deducibles</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioSL.gastosDeducibles)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Gastos fijos SL</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioSL.gastosFijosSL)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Tu nómina (gasto SL)</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioSL.nominaAnual)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Cotización RETA admin.</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioSL.cotizacionAnual)}</span>
              </div>
              <div className={styles.lineaSeparador}></div>
              <div className={styles.lineaDetalle}>
                <span>Beneficio antes IS</span>
                <span>{formatCurrency(escenarioSL.beneficioAnteIS)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Impuesto Sociedades ({formatNumber(escenarioSL.tipoIS, 0)}%)</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioSL.impuestoSociedades)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Beneficio neto sociedad</span>
                <span>{formatCurrency(escenarioSL.beneficioNetoSociedad)}</span>
              </div>
              <div className={styles.lineaSeparador}></div>
              <div className={styles.lineaDetalle}>
                <span>IRPF de tu nómina</span>
                <span className={styles.negativo}>-{formatCurrency(escenarioSL.irpfNomina)}</span>
              </div>
              <div className={styles.lineaDetalle}>
                <span>Tu nómina neta</span>
                <span>{formatCurrency(escenarioSL.nominaNeta)}</span>
              </div>
              <div className={styles.lineaSeparador}></div>
              <div className={`${styles.lineaDetalle} ${styles.totalImpuestos}`}>
                <span>Total impuestos + SS</span>
                <span>{formatCurrency(escenarioSL.totalImpuestos)}</span>
              </div>
              <div className={`${styles.lineaDetalle} ${styles.netoFinal}`}>
                <span>NETO DISPONIBLE</span>
                <span>{formatCurrency(escenarioSL.netoDisponible)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen visual */}
      <section className={styles.resumenVisual}>
        <h2>📈 Resumen</h2>
        <div className={styles.barrasComparativa}>
          <div className={styles.barraContainer}>
            <div className={styles.barraLabel}>
              <span>💼 Autónomo</span>
              <span>{formatCurrency(escenarioAutonomo.netoDisponible)}</span>
            </div>
            <div className={styles.barraFondo}>
              <div
                className={styles.barra}
                style={{
                  width: `${Math.min(100, (escenarioAutonomo.netoDisponible / Math.max(escenarioAutonomo.netoDisponible, escenarioSL.netoDisponible)) * 100)}%`,
                  backgroundColor: '#2E86AB'
                }}
              ></div>
            </div>
          </div>
          <div className={styles.barraContainer}>
            <div className={styles.barraLabel}>
              <span>🏢 SL</span>
              <span>{formatCurrency(escenarioSL.netoDisponible)}</span>
            </div>
            <div className={styles.barraFondo}>
              <div
                className={styles.barra}
                style={{
                  width: `${Math.min(100, (escenarioSL.netoDisponible / Math.max(escenarioAutonomo.netoDisponible, escenarioSL.netoDisponible)) * 100)}%`,
                  backgroundColor: '#48A9A6'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.puntoEquilibrio}>
          <h4>📍 Punto de equilibrio aproximado</h4>
          <p>
            Con los parámetros actuales, la SL empieza a ser más ventajosa a partir de
            aproximadamente <strong>{formatCurrency(puntoEquilibrio)}</strong> de facturación anual.
          </p>
        </div>
      </section>

      {/* Notas importantes */}
      <section className={styles.notas}>
        <h3>📝 Notas sobre este cálculo</h3>
        <ul>
          <li>
            <strong>Cotización autónomo:</strong> Se usa una estimación media de {formatCurrency(CUOTA_AUTONOMO_MEDIA_MENSUAL)}/mes.
            Tu cuota real depende de tus rendimientos netos (sistema de cotización por ingresos reales).
          </li>
          <li>
            <strong>Cotización administrador SL:</strong> Base mínima de {formatCurrency(CUOTA_RETA_ADMIN_SL_MENSUAL)}/mes
            (régimen especial de administradores societarios).
          </li>
          <li>
            <strong>Gastos fijos SL:</strong> Se estiman {formatCurrency(GASTOS_FIJOS_SL_ANUAL)}/año
            (gestoría, depósito cuentas, libros, etc.).
          </li>
          <li>
            <strong>Dividendos:</strong> Este cálculo asume que el beneficio queda en la sociedad.
            Si repartes dividendos, tributarán al 19-23% adicional.
          </li>
          <li>
            <strong>Tramos IRPF:</strong> Se usan los tramos estatales + estimación autonómica media.
          </li>
        </ul>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este simulador proporciona <strong>estimaciones orientativas</strong> para ayudarte a comparar ambas opciones.
          Los resultados NO constituyen asesoramiento fiscal profesional.
          Cada situación es única (deducciones, bonificaciones, CCAA, etc.).
          <strong>Consulta con un asesor fiscal</strong> antes de tomar decisiones.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor la comparativa fiscal?"
        subtitle="Guía sobre cuándo conviene ser autónomo y cuándo crear una SL"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Guía: Autónomo vs SL</h2>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>🎯 ¿Cuándo conviene ser Autónomo?</h4>
              <ul>
                <li>Facturación inferior a 40.000-50.000€/año</li>
                <li>Pocos gastos deducibles</li>
                <li>Actividad de bajo riesgo patrimonial</li>
                <li>Quieres simplicidad administrativa</li>
                <li>Aprovechas tarifa plana (primeros 12 meses)</li>
                <li>No necesitas reinvertir beneficios en el negocio</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>🏢 ¿Cuándo conviene crear una SL?</h4>
              <ul>
                <li>Facturación superior a 50.000-60.000€/año</li>
                <li>Beneficios altos que quieres reinvertir</li>
                <li>Necesitas proteger tu patrimonio personal</li>
                <li>Vas a contratar empleados</li>
                <li>Buscas inversores o socios</li>
                <li>El tipo fijo del IS (23-25%) es menor que tu IRPF</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>📊 Claves de la fiscalidad</h4>
              <ul>
                <li><strong>IRPF:</strong> Progresivo (19%-47%), tributa todo el beneficio</li>
                <li><strong>IS:</strong> Fijo (23-25%), solo tributa el beneficio de la sociedad</li>
                <li><strong>Dividendos:</strong> Si sacas dinero de la SL, tributas 19-23% adicional</li>
                <li><strong>Nómina:</strong> Puedes pagarte sueldo (deducible para la SL) y tributar por IRPF</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>💡 Estrategias comunes</h4>
              <ul>
                <li><strong>Empezar como autónomo:</strong> Probar el negocio sin costes de constitución</li>
                <li><strong>Pasar a SL al crecer:</strong> Cuando el IRPF supera al IS + dividendos</li>
                <li><strong>Optimizar nómina:</strong> Equilibrar sueldo y beneficio en SL</li>
                <li><strong>Reinvertir en SL:</strong> Si no necesitas todo el dinero, déjalo en la sociedad</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-autonomo-vs-sl')} />
      <Footer appName="simulador-autonomo-vs-sl" />
    </div>
  );
}
