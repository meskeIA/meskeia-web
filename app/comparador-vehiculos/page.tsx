'use client';

import { useState, useMemo } from 'react';
import styles from './ComparadorVehiculos.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

type PerfilUsuario = 'particular' | 'autonomo' | 'empresa';

interface DatosVehiculo {
  precioVenta: string;
  descuentoContado: string;
  kmAnuales: string;
  anyosUso: string;
  valorResidualPct: string;
}

interface DatosFinanciacion {
  entrada: string;
  cuotaMensual: string;
  plazoMeses: string;
  tae: string;
  comisionApertura: string;
}

interface DatosRenting {
  cuotaMensual: string;
  duracionMeses: string;
  entrada: string;
  kmIncluidos: string;
  costeKmExtra: string;
}

interface DatosLeasing {
  cuotaMensual: string;
  duracionMeses: string;
  valorResidual: string;
  entrada: string;
}

interface DatosGastos {
  seguroAnual: string;
  mantenimientoAnual: string;
  impuestoCirculacion: string;
}

interface ResultadoOpcion {
  nombre: string;
  costeTotal: number;
  costeMensualEquiv: number;
  propiedadFinal: 'Sí' | 'No' | 'Opción';
  incluye: string[];
  noIncluye: string[];
  ahorroFiscal?: number;
  detalles: {
    label: string;
    valor: number;
  }[];
}

export default function ComparadorVehiculosPage() {
  // Perfil del usuario
  const [perfil, setPerfil] = useState<PerfilUsuario>('particular');

  // Datos del vehículo
  const [vehiculo, setVehiculo] = useState<DatosVehiculo>({
    precioVenta: '',
    descuentoContado: '',
    kmAnuales: '15000',
    anyosUso: '5',
    valorResidualPct: '40',
  });

  // Opciones de adquisición
  const [financiacion, setFinanciacion] = useState<DatosFinanciacion>({
    entrada: '',
    cuotaMensual: '',
    plazoMeses: '60',
    tae: '',
    comisionApertura: '',
  });

  const [renting, setRenting] = useState<DatosRenting>({
    cuotaMensual: '',
    duracionMeses: '48',
    entrada: '0',
    kmIncluidos: '15000',
    costeKmExtra: '0,08',
  });

  const [leasing, setLeasing] = useState<DatosLeasing>({
    cuotaMensual: '',
    duracionMeses: '48',
    valorResidual: '',
    entrada: '0',
  });

  // Gastos adicionales (para contado y financiación)
  const [gastos, setGastos] = useState<DatosGastos>({
    seguroAnual: '600',
    mantenimientoAnual: '400',
    impuestoCirculacion: '150',
  });

  // Opciones activas para comparar
  const [opcionesActivas, setOpcionesActivas] = useState({
    contado: true,
    financiacion: true,
    renting: true,
    leasing: false,
  });

  const toggleOpcion = (opcion: keyof typeof opcionesActivas) => {
    setOpcionesActivas(prev => ({ ...prev, [opcion]: !prev[opcion] }));
  };

  // Cálculos
  const resultados = useMemo(() => {
    const precioVenta = parseSpanishNumber(vehiculo.precioVenta);
    const descuentoContado = parseSpanishNumber(vehiculo.descuentoContado);
    const anyosUso = parseSpanishNumber(vehiculo.anyosUso);
    const valorResidualPct = parseSpanishNumber(vehiculo.valorResidualPct);
    const kmAnuales = parseSpanishNumber(vehiculo.kmAnuales);

    const seguroAnual = parseSpanishNumber(gastos.seguroAnual);
    const mantenimientoAnual = parseSpanishNumber(gastos.mantenimientoAnual);
    const impuestoCirculacion = parseSpanishNumber(gastos.impuestoCirculacion);
    const gastosAnuales = seguroAnual + mantenimientoAnual + impuestoCirculacion;

    if (precioVenta <= 0 || anyosUso <= 0) return null;

    const mesesUso = anyosUso * 12;
    const resultadosArray: ResultadoOpcion[] = [];

    // CONTADO
    if (opcionesActivas.contado) {
      const precioContado = precioVenta - descuentoContado;
      const valorResidual = precioContado * (valorResidualPct / 100);
      const depreciacion = precioContado - valorResidual;
      const gastosTotal = gastosAnuales * anyosUso;
      const costeTotal = depreciacion + gastosTotal;

      resultadosArray.push({
        nombre: 'Contado',
        costeTotal,
        costeMensualEquiv: costeTotal / mesesUso,
        propiedadFinal: 'Sí',
        incluye: ['Propiedad inmediata', 'Sin intereses', 'Libertad total'],
        noIncluye: ['Seguro', 'Mantenimiento', 'Impuestos'],
        detalles: [
          { label: 'Precio con descuento', valor: precioContado },
          { label: 'Valor residual estimado', valor: valorResidual },
          { label: 'Depreciación', valor: depreciacion },
          { label: `Gastos (${anyosUso} años)`, valor: gastosTotal },
        ],
      });
    }

    // FINANCIACIÓN
    if (opcionesActivas.financiacion) {
      const entrada = parseSpanishNumber(financiacion.entrada);
      const cuotaMensual = parseSpanishNumber(financiacion.cuotaMensual);
      const plazoMeses = parseSpanishNumber(financiacion.plazoMeses);
      const comisionApertura = parseSpanishNumber(financiacion.comisionApertura);

      if (cuotaMensual > 0 && plazoMeses > 0) {
        const totalCuotas = cuotaMensual * plazoMeses;
        const capitalFinanciado = precioVenta - entrada;
        const interesesPagados = (entrada + totalCuotas + comisionApertura) - precioVenta;
        const valorResidual = precioVenta * (valorResidualPct / 100);
        const depreciacion = precioVenta - valorResidual;

        // Gastos proporcionales al tiempo de financiación
        const anyosFinanciacion = plazoMeses / 12;
        const gastosFinanciacion = gastosAnuales * Math.max(anyosFinanciacion, anyosUso);

        const costeTotal = depreciacion + interesesPagados + comisionApertura + gastosFinanciacion;

        resultadosArray.push({
          nombre: 'Financiación',
          costeTotal,
          costeMensualEquiv: costeTotal / mesesUso,
          propiedadFinal: 'Sí',
          incluye: ['Propiedad al finalizar', 'Uso inmediato'],
          noIncluye: ['Seguro', 'Mantenimiento', 'Impuestos'],
          detalles: [
            { label: 'Entrada', valor: entrada },
            { label: 'Total cuotas', valor: totalCuotas },
            { label: 'Intereses pagados', valor: interesesPagados },
            { label: 'Comisión apertura', valor: comisionApertura },
            { label: 'Valor residual estimado', valor: valorResidual },
            { label: `Gastos adicionales`, valor: gastosFinanciacion },
          ],
        });
      }
    }

    // RENTING
    if (opcionesActivas.renting) {
      const cuotaRenting = parseSpanishNumber(renting.cuotaMensual);
      const duracionRenting = parseSpanishNumber(renting.duracionMeses);
      const entradaRenting = parseSpanishNumber(renting.entrada);
      const kmIncluidos = parseSpanishNumber(renting.kmIncluidos);
      const costeKmExtra = parseSpanishNumber(renting.costeKmExtra);

      if (cuotaRenting > 0 && duracionRenting > 0) {
        const totalCuotas = cuotaRenting * duracionRenting;
        const kmTotales = kmAnuales * (duracionRenting / 12);
        const kmExceso = Math.max(0, kmTotales - (kmIncluidos * (duracionRenting / 12)));
        const costeExceso = kmExceso * costeKmExtra;
        const costeTotal = entradaRenting + totalCuotas + costeExceso;

        // Ahorro fiscal para autónomos/empresas (IVA deducible + gasto deducible)
        let ahorroFiscal = 0;
        if (perfil === 'autonomo') {
          ahorroFiscal = totalCuotas * 0.21 + totalCuotas * 0.25; // IVA 21% + IRPF ~25%
        } else if (perfil === 'empresa') {
          ahorroFiscal = totalCuotas * 0.21 + totalCuotas * 0.25; // IVA + IS ~25%
        }

        resultadosArray.push({
          nombre: 'Renting',
          costeTotal: costeTotal - ahorroFiscal,
          costeMensualEquiv: (costeTotal - ahorroFiscal) / duracionRenting,
          propiedadFinal: 'No',
          incluye: ['Seguro todo riesgo', 'Mantenimiento', 'Impuestos', 'Asistencia', 'Vehículo sustitución'],
          noIncluye: ['Combustible', 'Multas', 'Km exceso'],
          ahorroFiscal: ahorroFiscal > 0 ? ahorroFiscal : undefined,
          detalles: [
            { label: 'Entrada', valor: entradaRenting },
            { label: 'Total cuotas', valor: totalCuotas },
            { label: 'Coste km exceso', valor: costeExceso },
            ...(ahorroFiscal > 0 ? [{ label: 'Ahorro fiscal estimado', valor: -ahorroFiscal }] : []),
          ],
        });
      }
    }

    // LEASING
    if (opcionesActivas.leasing) {
      const cuotaLeasing = parseSpanishNumber(leasing.cuotaMensual);
      const duracionLeasing = parseSpanishNumber(leasing.duracionMeses);
      const valorResidualLeasing = parseSpanishNumber(leasing.valorResidual);
      const entradaLeasing = parseSpanishNumber(leasing.entrada);

      if (cuotaLeasing > 0 && duracionLeasing > 0) {
        const totalCuotas = cuotaLeasing * duracionLeasing;
        const anyosLeasing = duracionLeasing / 12;
        const gastosLeasing = gastosAnuales * anyosLeasing;

        // Si ejerce opción de compra
        const costeTotalConCompra = entradaLeasing + totalCuotas + valorResidualLeasing + gastosLeasing;

        // Ahorro fiscal
        let ahorroFiscal = 0;
        if (perfil === 'autonomo' || perfil === 'empresa') {
          // En leasing se puede deducir cuota + amortización acelerada
          ahorroFiscal = totalCuotas * 0.21 + totalCuotas * 0.30;
        }

        resultadosArray.push({
          nombre: 'Leasing',
          costeTotal: costeTotalConCompra - ahorroFiscal,
          costeMensualEquiv: (costeTotalConCompra - ahorroFiscal) / duracionLeasing,
          propiedadFinal: 'Opción',
          incluye: ['Uso del vehículo', 'Opción de compra', 'Ventajas fiscales (empresas)'],
          noIncluye: ['Seguro', 'Mantenimiento', 'Impuestos'],
          ahorroFiscal: ahorroFiscal > 0 ? ahorroFiscal : undefined,
          detalles: [
            { label: 'Entrada', valor: entradaLeasing },
            { label: 'Total cuotas', valor: totalCuotas },
            { label: 'Opción de compra', valor: valorResidualLeasing },
            { label: `Gastos adicionales`, valor: gastosLeasing },
            ...(ahorroFiscal > 0 ? [{ label: 'Ahorro fiscal estimado', valor: -ahorroFiscal }] : []),
          ],
        });
      }
    }

    return resultadosArray.length > 0 ? resultadosArray : null;
  }, [vehiculo, financiacion, renting, leasing, gastos, opcionesActivas, perfil]);

  // Encontrar la opción más económica
  const mejorOpcion = useMemo(() => {
    if (!resultados || resultados.length === 0) return null;
    return resultados.reduce((mejor, actual) =>
      actual.costeTotal < mejor.costeTotal ? actual : mejor
    );
  }, [resultados]);

  const limpiar = () => {
    setVehiculo({
      precioVenta: '',
      descuentoContado: '',
      kmAnuales: '15000',
      anyosUso: '5',
      valorResidualPct: '40',
    });
    setFinanciacion({
      entrada: '',
      cuotaMensual: '',
      plazoMeses: '60',
      tae: '',
      comisionApertura: '',
    });
    setRenting({
      cuotaMensual: '',
      duracionMeses: '48',
      entrada: '0',
      kmIncluidos: '15000',
      costeKmExtra: '0,08',
    });
    setLeasing({
      cuotaMensual: '',
      duracionMeses: '48',
      valorResidual: '',
      entrada: '0',
    });
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🚗 Comparador de Compra de Vehículos</h1>
        <p className={styles.subtitle}>
          Contado vs Financiación vs Renting vs Leasing: descubre cuál te conviene más
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo: Datos */}
        <div className={styles.inputPanel}>
          {/* Perfil del usuario */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>👤 Tu perfil</h2>
            <div className={styles.perfilBtns}>
              <button
                type="button"
                className={`${styles.perfilBtn} ${perfil === 'particular' ? styles.activo : ''}`}
                onClick={() => setPerfil('particular')}
              >
                Particular
              </button>
              <button
                type="button"
                className={`${styles.perfilBtn} ${perfil === 'autonomo' ? styles.activo : ''}`}
                onClick={() => setPerfil('autonomo')}
              >
                Autónomo
              </button>
              <button
                type="button"
                className={`${styles.perfilBtn} ${perfil === 'empresa' ? styles.activo : ''}`}
                onClick={() => setPerfil('empresa')}
              >
                Empresa
              </button>
            </div>
            {perfil !== 'particular' && (
              <p className={styles.infoFiscal}>
                💡 Se calculará el ahorro fiscal en renting y leasing
              </p>
            )}
          </div>

          {/* Datos del vehículo */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>🚙 Datos del vehículo</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={vehiculo.precioVenta}
                onChange={(v) => setVehiculo({ ...vehiculo, precioVenta: v })}
                label="Precio de venta (PVP)"
                placeholder="30000"
                helperText="Precio del vehículo con IVA"
              />
              <NumberInput
                value={vehiculo.descuentoContado}
                onChange={(v) => setVehiculo({ ...vehiculo, descuentoContado: v })}
                label="Descuento al contado"
                placeholder="2000"
                helperText="Descuento si pagas al contado"
              />
              <NumberInput
                value={vehiculo.kmAnuales}
                onChange={(v) => setVehiculo({ ...vehiculo, kmAnuales: v })}
                label="Km anuales previstos"
                placeholder="15000"
              />
              <NumberInput
                value={vehiculo.anyosUso}
                onChange={(v) => setVehiculo({ ...vehiculo, anyosUso: v })}
                label="Años de uso"
                placeholder="5"
                helperText="Tiempo que usarás el coche"
              />
            </div>
          </div>

          {/* Selector de opciones */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>📋 Opciones a comparar</h2>
            <div className={styles.opcionesToggle}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={opcionesActivas.contado}
                  onChange={() => toggleOpcion('contado')}
                />
                <span className={styles.toggleText}>💵 Contado</span>
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={opcionesActivas.financiacion}
                  onChange={() => toggleOpcion('financiacion')}
                />
                <span className={styles.toggleText}>🏦 Financiación</span>
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={opcionesActivas.renting}
                  onChange={() => toggleOpcion('renting')}
                />
                <span className={styles.toggleText}>🔄 Renting</span>
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={opcionesActivas.leasing}
                  onChange={() => toggleOpcion('leasing')}
                />
                <span className={styles.toggleText}>📑 Leasing</span>
              </label>
            </div>
          </div>

          {/* Datos Financiación */}
          {opcionesActivas.financiacion && (
            <div className={styles.seccion}>
              <h3 className={styles.opcionTitulo}>🏦 Financiación</h3>
              <div className={styles.inputGrid}>
                <NumberInput
                  value={financiacion.entrada}
                  onChange={(v) => setFinanciacion({ ...financiacion, entrada: v })}
                  label="Entrada inicial"
                  placeholder="5000"
                />
                <NumberInput
                  value={financiacion.cuotaMensual}
                  onChange={(v) => setFinanciacion({ ...financiacion, cuotaMensual: v })}
                  label="Cuota mensual"
                  placeholder="350"
                />
                <NumberInput
                  value={financiacion.plazoMeses}
                  onChange={(v) => setFinanciacion({ ...financiacion, plazoMeses: v })}
                  label="Plazo (meses)"
                  placeholder="60"
                />
                <NumberInput
                  value={financiacion.comisionApertura}
                  onChange={(v) => setFinanciacion({ ...financiacion, comisionApertura: v })}
                  label="Comisión apertura"
                  placeholder="300"
                />
              </div>
            </div>
          )}

          {/* Datos Renting */}
          {opcionesActivas.renting && (
            <div className={styles.seccion}>
              <h3 className={styles.opcionTitulo}>🔄 Renting</h3>
              <div className={styles.inputGrid}>
                <NumberInput
                  value={renting.cuotaMensual}
                  onChange={(v) => setRenting({ ...renting, cuotaMensual: v })}
                  label="Cuota mensual"
                  placeholder="399"
                  helperText="Todo incluido"
                />
                <NumberInput
                  value={renting.duracionMeses}
                  onChange={(v) => setRenting({ ...renting, duracionMeses: v })}
                  label="Duración (meses)"
                  placeholder="48"
                />
                <NumberInput
                  value={renting.kmIncluidos}
                  onChange={(v) => setRenting({ ...renting, kmIncluidos: v })}
                  label="Km incluidos/año"
                  placeholder="15000"
                />
                <NumberInput
                  value={renting.costeKmExtra}
                  onChange={(v) => setRenting({ ...renting, costeKmExtra: v })}
                  label="€/km extra"
                  placeholder="0,08"
                />
              </div>
            </div>
          )}

          {/* Datos Leasing */}
          {opcionesActivas.leasing && (
            <div className={styles.seccion}>
              <h3 className={styles.opcionTitulo}>📑 Leasing</h3>
              <div className={styles.inputGrid}>
                <NumberInput
                  value={leasing.cuotaMensual}
                  onChange={(v) => setLeasing({ ...leasing, cuotaMensual: v })}
                  label="Cuota mensual"
                  placeholder="320"
                />
                <NumberInput
                  value={leasing.duracionMeses}
                  onChange={(v) => setLeasing({ ...leasing, duracionMeses: v })}
                  label="Duración (meses)"
                  placeholder="48"
                />
                <NumberInput
                  value={leasing.valorResidual}
                  onChange={(v) => setLeasing({ ...leasing, valorResidual: v })}
                  label="Valor residual (opción compra)"
                  placeholder="8000"
                />
                <NumberInput
                  value={leasing.entrada}
                  onChange={(v) => setLeasing({ ...leasing, entrada: v })}
                  label="Entrada"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Gastos adicionales */}
          {(opcionesActivas.contado || opcionesActivas.financiacion || opcionesActivas.leasing) && (
            <div className={styles.seccion}>
              <h3 className={styles.opcionTitulo}>💰 Gastos anuales (contado/financiación/leasing)</h3>
              <p className={styles.infoGastos}>El renting ya incluye estos gastos en la cuota</p>
              <div className={styles.inputGrid}>
                <NumberInput
                  value={gastos.seguroAnual}
                  onChange={(v) => setGastos({ ...gastos, seguroAnual: v })}
                  label="Seguro anual"
                  placeholder="600"
                />
                <NumberInput
                  value={gastos.mantenimientoAnual}
                  onChange={(v) => setGastos({ ...gastos, mantenimientoAnual: v })}
                  label="Mantenimiento anual"
                  placeholder="400"
                />
                <NumberInput
                  value={gastos.impuestoCirculacion}
                  onChange={(v) => setGastos({ ...gastos, impuestoCirculacion: v })}
                  label="Impuesto circulación"
                  placeholder="150"
                />
              </div>
            </div>
          )}

          <button type="button" onClick={limpiar} className={styles.btnSecondary}>
            Limpiar todo
          </button>
        </div>

        {/* Panel derecho: Resultados */}
        <div className={styles.resultsPanel}>
          {resultados && resultados.length > 0 ? (
            <>
              {/* Recomendación */}
              {mejorOpcion && (
                <div className={styles.recomendacion}>
                  <div className={styles.recomendacionIcono}>🏆</div>
                  <div className={styles.recomendacionTexto}>
                    <h3>Opción más económica: {mejorOpcion.nombre}</h3>
                    <p>Coste total: {formatCurrency(mejorOpcion.costeTotal)} ({formatCurrency(mejorOpcion.costeMensualEquiv)}/mes)</p>
                  </div>
                </div>
              )}

              {/* Tabla comparativa */}
              <div className={styles.tablaWrapper}>
                <h3 className={styles.tablaTitulo}>📊 Comparativa de costes</h3>
                <table className={styles.tablaComparativa}>
                  <thead>
                    <tr>
                      <th>Opción</th>
                      <th>Coste Total</th>
                      <th>€/mes equiv.</th>
                      <th>Propiedad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados
                      .sort((a, b) => a.costeTotal - b.costeTotal)
                      .map((resultado, idx) => (
                        <tr
                          key={resultado.nombre}
                          className={idx === 0 ? styles.mejorOpcion : ''}
                        >
                          <td>
                            {idx === 0 && <span className={styles.badge}>Mejor</span>}
                            {resultado.nombre}
                          </td>
                          <td className={styles.costeTotal}>
                            {formatCurrency(resultado.costeTotal)}
                          </td>
                          <td>{formatCurrency(resultado.costeMensualEquiv)}</td>
                          <td>
                            <span className={`${styles.propiedadTag} ${styles[`propiedad${resultado.propiedadFinal}`]}`}>
                              {resultado.propiedadFinal}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Detalle por opción */}
              <div className={styles.detallesGrid}>
                {resultados.map((resultado) => (
                  <div key={resultado.nombre} className={styles.detalleCard}>
                    <h4 className={styles.detalleNombre}>
                      {resultado.nombre}
                      {resultado.ahorroFiscal && (
                        <span className={styles.ahorroFiscalBadge}>
                          Ahorro fiscal: {formatCurrency(resultado.ahorroFiscal)}
                        </span>
                      )}
                    </h4>

                    <div className={styles.detalleNumeros}>
                      {resultado.detalles.map((detalle, idx) => (
                        <div key={idx} className={styles.detalleLinea}>
                          <span>{detalle.label}</span>
                          <span className={detalle.valor < 0 ? styles.valorNegativo : ''}>
                            {formatCurrency(Math.abs(detalle.valor))}
                            {detalle.valor < 0 && ' ✓'}
                          </span>
                        </div>
                      ))}
                      <div className={`${styles.detalleLinea} ${styles.detalleTotal}`}>
                        <span>COSTE TOTAL</span>
                        <span>{formatCurrency(resultado.costeTotal)}</span>
                      </div>
                    </div>

                    <div className={styles.incluyeNoIncluye}>
                      <div className={styles.incluye}>
                        <strong>✅ Incluye:</strong>
                        <ul>
                          {resultado.incluye.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.noIncluye}>
                        <strong>❌ No incluye:</strong>
                        <ul>
                          {resultado.noIncluye.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🚗</span>
              <p>Introduce el precio del vehículo y los datos de las opciones que quieras comparar</p>
              <p className={styles.placeholderTip}>
                💡 Puedes pedir al concesionario los datos exactos de cada opción
              </p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="comparador-vehiculos"
        collapsible={true}
      />

      <LastUpdated
        date="2026-02-02"
        changelog={[
          "Migrado disclaimer antiguo a DisclaimerCard para consistencia visual",
          "Añadido componente LastUpdated con historial de cambios",
          "Mejorada accesibilidad con ARIA labels en componentes interactivos"
        ]}
      />

      <EducationalSection
        title="¿Quieres entender mejor cada opción?"
        subtitle="Descubre las diferencias clave entre contado, financiación, renting y leasing"
      >
        <section className={styles.guideSection}>
          <h2>Las 4 formas de adquirir un vehículo</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💵 Compra al Contado</h4>
              <p>
                <strong>Ventajas:</strong> Sin intereses, descuentos adicionales, libertad total
                para vender cuando quieras, sin compromisos de permanencia.
              </p>
              <p>
                <strong>Inconvenientes:</strong> Desembolso inicial grande, pierdes liquidez,
                asumes la depreciación completa.
              </p>
              <p>
                <strong>Ideal para:</strong> Quien tiene el dinero disponible y planea usar
                el coche muchos años.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏦 Financiación</h4>
              <p>
                <strong>Ventajas:</strong> Acceso inmediato sin capital, propiedad al finalizar,
                puedes vender antes de terminar de pagar.
              </p>
              <p>
                <strong>Inconvenientes:</strong> Pagas intereses (TAE 7-12% típico), el coche
                actúa como garantía, cuotas fijas aunque no uses el coche.
              </p>
              <p>
                <strong>Ideal para:</strong> Quien quiere ser propietario pero no tiene todo
                el capital o prefiere mantener liquidez.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 Renting</h4>
              <p>
                <strong>Ventajas:</strong> Cuota fija todo incluido (seguro, mantenimiento,
                impuestos), sin preocupaciones, cambias de coche cada 3-4 años.
              </p>
              <p>
                <strong>Inconvenientes:</strong> Nunca eres propietario, penalización por km
                excedidos, compromiso de permanencia, no puedes modificar el coche.
              </p>
              <p>
                <strong>Ideal para:</strong> Quien valora la comodidad, quiere coche nuevo
                frecuentemente o es autónomo/empresa (deducible).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📑 Leasing</h4>
              <p>
                <strong>Ventajas:</strong> Cuotas más bajas que financiación, opción de compra
                al final, grandes ventajas fiscales para empresas y autónomos.
              </p>
              <p>
                <strong>Inconvenientes:</strong> Solo para profesionales (principalmente),
                el coche no es tuyo hasta ejercer la opción, no incluye mantenimiento ni seguro.
              </p>
              <p>
                <strong>Ideal para:</strong> Autónomos y empresas que quieren deducir el
                vehículo y pueden acabar comprándolo.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Por qué el concesionario insiste tanto en la financiación?</summary>
              <p>
                Los concesionarios obtienen comisiones de las financieras (entre 2-5% del capital
                financiado). Además, el renting genera ingresos recurrentes. Por eso a veces
                ofrecen descuentos especiales si financias, pero hay que calcular si el
                descuento compensa los intereses que pagarás.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo deducir el renting como particular?</summary>
              <p>
                No. El renting solo es deducible fiscalmente para autónomos (si el vehículo
                se usa para la actividad) y empresas. Como particular, el renting no tiene
                ventaja fiscal, aunque sí la comodidad de la cuota todo incluido.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué pasa si me paso de kilómetros en renting?</summary>
              <p>
                Pagarás un coste por km excedido (típicamente 0,05-0,15 €/km) al devolver
                el vehículo. Si vas a hacer muchos km, negocia un contrato con más km
                incluidos desde el principio, sale más barato que pagar el exceso.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuándo conviene el leasing sobre la financiación?</summary>
              <p>
                El leasing conviene principalmente a autónomos y empresas porque permite
                deducir las cuotas como gasto y el IVA es deducible. Para particulares,
                la financiación suele ser mejor opción porque el leasing tiene restricciones
                adicionales y no ofrece ventaja fiscal.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué es el valor residual y por qué importa?</summary>
              <p>
                Es lo que vale el coche al final del periodo. En compra/financiación, es
                lo que recuperas si vendes. En leasing, es el precio de la opción de compra.
                Un coche que retiene bien su valor (Toyota, Porsche) hace que el contado
                sea más atractivo porque recuperas más al vender.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-vehiculos')} />
      <Footer appName="comparador-vehiculos" />
    </div>
  );
}
