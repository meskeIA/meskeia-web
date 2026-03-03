'use client';

import { useState, useMemo } from 'react';
import styles from './ComparadorVehiculos.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice lastUpdated="2026-02-02" />

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

      

      <EducationalSection
        title="¿Quieres entender mejor cada opción?"
        subtitle="Descubre las diferencias clave entre contado, financiación, renting y leasing"
      >
        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2>🚗 Contado vs Financiación vs Renting vs Leasing: comparativa completa</h2>
          <p className={styles.eduIntro}>
            Elegir mal la forma de adquirir un vehículo puede costarte entre 5.000 y 20.000 € de diferencia en el mismo coche. Esta tabla te da los criterios clave para decidir según tu perfil.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>💵 Contado</th>
                  <th>🏦 Financiación</th>
                  <th>🔄 Renting</th>
                  <th>📑 Leasing</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>¿Eres propietario?</strong></td>
                  <td>✅ Desde el primer día</td>
                  <td>✅ Al acabar de pagar</td>
                  <td>❌ Nunca</td>
                  <td>⚠️ Solo si ejerces opción compra</td>
                </tr>
                <tr>
                  <td><strong>Desembolso inicial</strong></td>
                  <td>Alto (precio completo)</td>
                  <td>Medio (entrada 20-30%)</td>
                  <td>Bajo (0-1 cuota)</td>
                  <td>Bajo-medio (0-20%)</td>
                </tr>
                <tr>
                  <td><strong>Coste total real</strong></td>
                  <td>El más bajo (sin intereses)</td>
                  <td>Alto (+7-12% TAE en intereses)</td>
                  <td>Variable (todo incluido)</td>
                  <td>Medio-alto (intereses + opción compra)</td>
                </tr>
                <tr>
                  <td><strong>Gastos incluidos</strong></td>
                  <td>❌ Seguro, ITV, mantenimiento aparte</td>
                  <td>❌ Seguro, ITV, mantenimiento aparte</td>
                  <td>✅ Seguro, mantenimiento, impuestos, asistencia</td>
                  <td>❌ Solo el vehículo</td>
                </tr>
                <tr>
                  <td><strong>Ventaja fiscal (autónomos/empresa)</strong></td>
                  <td>⚠️ Solo amortización</td>
                  <td>⚠️ Solo intereses deducibles</td>
                  <td>✅ Cuota 100% deducible (IVA + IS/IRPF)</td>
                  <td>✅ Cuota 100% deducible + amortización acelerada</td>
                </tr>
                <tr>
                  <td><strong>Flexibilidad</strong></td>
                  <td>✅ Máxima (vendes cuando quieras)</td>
                  <td>⚠️ Puedes vender pagando la deuda</td>
                  <td>❌ Contrato fijo (penalización si cancelas)</td>
                  <td>❌ Contrato fijo</td>
                </tr>
                <tr>
                  <td><strong>Riesgo de depreciación</strong></td>
                  <td>🔴 Lo asumes tú</td>
                  <td>🔴 Lo asumes tú</td>
                  <td>✅ Lo asume la empresa</td>
                  <td>⚠️ Depende del valor residual pactado</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Quien tiene capital y planea usar el coche &gt;7 años</td>
                  <td>Quien quiere propiedad pero sin capital completo</td>
                  <td>Autónomos, empresas, quienes valoran la comodidad</td>
                  <td>Autónomos y empresas que quieren opción de compra</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.eduEscenarios}>
          <h2>💼 Tu perfil, tu opción: casos reales de decisión</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍💼</span>
                <h3>Particular con ahorros: prioridad libertad</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Coche de 28.000 €. Tiene 30.000 € ahorrados, usa el coche para ir al trabajo. Planea tenerlo 8 años.</p>
                <code>Contado: Coste total ~14.000 € (depreciación + gastos 8 años)
Financiación (TAE 9%, 60 meses): Coste total ~18.500 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Recomendación:</strong> Contado. El ahorro de intereses (4.500 €) compensa mantener menor liquidez. Negociar un 5-7% de descuento al contado puede ahorrar otros 1.500-2.000 €.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🚀</span>
                <h3>Freelance o autónomo: optimización fiscal</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Autónomo con IRPF del 30%. Renting de 400 €/mes (todo incluido). Vehículo afecto a la actividad.</p>
                <code>Cuota mensual bruta: 400 €
Ahorro fiscal: 400 × (21% IVA + 30% IRPF) = 204 €
Coste mensual real neto: 196 €/mes</code>
              </div>
              <p className={styles.escenarioTip}><strong>Recomendación:</strong> Renting para autónomos con vehículo afecto 100% a la actividad. El ahorro fiscal puede reducir el coste efectivo casi a la mitad. Compara con el coste real del contado descontando el ahorro fiscal de la amortización.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h3>Empresa con flota: gestión simplificada</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Empresa con 5 comerciales que cambian de coche cada 3 años. Coches de 25.000 € cada uno.</p>
                <code>Renting: 350 €/coche/mes × 36 meses = 63.000 € (todo gestionado)
Compra: 125.000 € inicial + gastos + gestión interna estimada 40.000 €</code>
              </div>
              <p className={styles.escenarioTip}><strong>Recomendación:</strong> Renting para flotas. Simplifica la gestión administrativa (seguro, ITV, mantenimiento centralizado), mejora el cash flow y hace predecible el gasto. IVA 100% deducible en vehículos de empresa.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Joven sin ahorros: primer coche</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> 27 años, primer trabajo estable. Coche de 18.000 €. Solo tiene 3.000 € ahorrados. Necesita coche para trabajar.</p>
                <code>Financiación: 3.000 € entrada + 280 €/mes × 60 = 18.800 €
Renting: 0 € entrada + 350 €/mes × 48 (todo incluido)</code>
              </div>
              <p className={styles.escenarioTip}><strong>Recomendación:</strong> Depende. Si quieres propiedad y el coche como activo, financiación. Si valoras predecibilidad de gastos y estrenar coche cada 4 años, renting. Evita TAEs superiores al 10%: compara siempre la TAE, no solo la cuota mensual.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔧</span>
                <h3>Alto kilometraje: cuidado con el renting</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Comercial que hace 40.000 km/año. Renting con 20.000 km incluidos a 0,09 €/km extra.</p>
                <code>Km exceso: 20.000 km × 0,09 € = 1.800 €/año = 150 €/mes extra
Coste real: 400 € cuota + 150 € = 550 €/mes (vs 350 € ofertado)</code>
              </div>
              <p className={styles.escenarioTip}><strong>Atención:</strong> Para altos kilometrajes, el renting puede ser engañoso. Negocia siempre los km incluidos antes de firmar. Un contrato de 40.000 km/año es más caro por cuota, pero más barato que pagar excesos. Para &gt;30.000 km/año, el contado o financiación suelen ganar.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📑</span>
                <h3>Autónomo que quiere quedarse el coche</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> Arquitecto autónomo, coche de 35.000 €. Quiere quedárselo 6 años pero también aprovechar deducciones fiscales.</p>
                <code>Leasing 48 meses + opción compra 8.000 €:
Cuota 550 €/mes deducible + ahorro IS ~30% = 385 €/mes neto
Total real con opción compra: ~26.200 € (vs 35.000 contado)</code>
              </div>
              <p className={styles.escenarioTip}><strong>Recomendación:</strong> Leasing para autónomos que quieren acabar siendo propietarios. Permite deducir las cuotas como gasto y el IVA completo, con la opción de compra a valor residual al final. Solo viable si el vehículo está afecto a la actividad.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>❓ Preguntas frecuentes sobre la compra de vehículos</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el concesionario insiste tanto en que financie?</h4>
              <p>
                Los concesionarios reciben <strong>comisiones de entre 2-5% del capital financiado</strong> por parte de las financieras (filiales de los propios fabricantes en la mayoría de casos). Por eso a veces ofrecen descuentos especiales si financias: el descuento lo recuperan con la comisión. Antes de aceptar financiación con &quot;descuento especial&quot;, calcula si el descuento supera los intereses totales que pagarás. Si financias 20.000 € al 8% TAE durante 5 años, pagas ~4.300 € en intereses.
              </p>
              <p className={styles.faqTip}>💡 <strong>Truco:</strong> Negocia el precio al contado primero (consigue el mejor precio posible), y luego decide si financias o no. No negocies cuota mensual: es la trampa para no ver el coste real.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo deducir el renting o el leasing como particular?</h4>
              <p>
                No. Las deducciones fiscales del renting y leasing son exclusivamente para <strong>autónomos y sociedades</strong> cuando el vehículo está afecto a la actividad económica. Como particular, no existe ninguna ventaja fiscal por financiar, rentar o hacer leasing de un vehículo. Lo único que puedes deducir como particular (si eres asalariado) son los gastos de vehículo si trabajas en actividades específicas con rendimientos del trabajo con gastos deducibles.
              </p>
              <p className={styles.faqTip}>💡 <strong>Excepción:</strong> Si eres autónomo persona física y el vehículo está afecto parcialmente a tu actividad, puedes deducir el porcentaje correspondiente. La afectación parcial es difícil de justificar ante Hacienda.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es la TAE y por qué es más importante que la cuota?</h4>
              <p>
                La TAE (Tasa Anual Equivalente) incluye el tipo de interés nominal <strong>más</strong> todas las comisiones y gastos de la financiación. La cuota mensual puede parecer baja pero esconder una TAE muy elevada. Ejemplo: 200.000 € financiados al 2% TIN con comisión apertura del 2% da una TAE real del ~3,8%. La normativa europea obliga a mostrar siempre la TAE en publicidad financiera. Nunca compares ofertas de financiación solo por la cuota mensual: compara siempre la TAE.
              </p>
              <p className={styles.faqTip}>💡 <strong>Referencia 2025:</strong> TAE competitiva para coche nuevo: 4-7%. TAE de concesionario típica: 7-12%. TAE de promociones especiales: puede llegar al 0% (el coste está en el precio del coche).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué pasa si me paso de kilómetros en renting?</h4>
              <p>
                Al devolver el vehículo al final del contrato, la empresa calcula los kilómetros reales recorridos y te cobra el exceso a un precio pactado (típicamente <strong>0,05-0,15 €/km según el vehículo</strong>). Este coste puede ser sustancial: 10.000 km de exceso a 0,10 €/km = 1.000 € de sorpresa. Si al llegar a los 2 años ya ves que te vas a pasar, contacta con la empresa de renting para renegociar el contrato: suelen preferir adaptar las condiciones a cobrar el exceso al final.
              </p>
              <p className={styles.faqTip}>💡 <strong>Estrategia:</strong> Sobreestima siempre los km que vas a hacer al contratar. Es más barato pagar algo más por cuota con más km incluidos que pagar el exceso al final (que tiene precio de penalización).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo conviene el leasing sobre el renting para autónomos?</h4>
              <p>
                El leasing conviene sobre el renting cuando quieres <strong>acabar siendo propietario del vehículo</strong>. Con el renting nunca eres propietario. Con el leasing tienes una opción de compra al final por el valor residual pactado. El leasing también permite la <strong>amortización acelerada</strong> del vehículo (deducción más agresiva al principio), lo que puede ser ventajoso si tienes mucha base imponible que reducir. Ojo: el leasing no incluye seguro ni mantenimiento, a diferencia del renting que sí los incluye.
              </p>
              <p className={styles.faqTip}>💡 <strong>Regla práctica:</strong> ¿Quieres la comodidad de &quot;todo incluido&quot; y cambiar de coche cada 3-4 años? → Renting. ¿Quieres ventajas fiscales Y acabar siendo propietario? → Leasing.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el valor residual y cómo afecta a mi decisión?</h4>
              <p>
                El valor residual es lo que vale el vehículo al final del periodo de uso. En compra/financiación, es lo que recuperas si vendes. Los coches que conservan mejor el valor (Toyota, Porsche, marcas premium alemanas) hacen que comprar al contado sea más rentable porque recuperas más. En leasing, es el precio de la opción de compra al final del contrato: si el mercado tasa el coche por encima del valor residual pactado, tienes un &quot;beneficio&quot; al ejercer la opción.
              </p>
              <p className={styles.faqTip}>💡 <strong>Dato:</strong> Un coche de 30.000 € puede valer entre 9.000 € (bajo valor residual, marca desconocida) y 18.000 € (alto valor residual, Toyota o BMW) a los 5 años. Esta diferencia de 9.000 € impacta enormemente en el coste total real del contado.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo cancelar un renting o leasing antes de tiempo?</h4>
              <p>
                Sí, pero tiene coste. En el renting, la penalización por cancelación anticipada suele ser <strong>el 3-5% de las cuotas pendientes</strong>, más a veces la devolución del descuento inicial. En el leasing, la cancelación anticipada puede implicar devolver todas las cuotas pendientes más el valor residual. Antes de firmar cualquier contrato de renting o leasing, revisa minuciosamente las condiciones de cancelación anticipada y asegúrate de que podrás cumplir el plazo.
              </p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Si tienes dudas sobre si seguirás usando el vehículo, la financiación o el contado ofrecen más flexibilidad. Puedes vender el coche con financiación pagando la deuda pendiente, lo que es menos costoso que cancelar un renting.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo afecta el IRPF y el IVA según la opción elegida?</h4>
              <p>
                Para <strong>particulares</strong>: ninguna opción tiene ventaja fiscal especial. Para <strong>autónomos</strong>: en renting y leasing, las cuotas son gasto deducible al 100% en IRPF (si vehículo afecto 100%) + IVA deducible 100%. En financiación, solo los intereses son deducibles. En contado, solo la amortización anual (~25% del valor en 4 años). Para <strong>sociedades</strong>: similar al autónomo pero con Impuesto de Sociedades (IS) en lugar de IRPF. Los vehículos de empresa permiten deducción del IVA al 50% salvo que se pruebe uso 100% empresarial.
              </p>
              <p className={styles.faqTip}>💡 <strong>Simulación práctica:</strong> Usa este comparador activando tu perfil (Particular/Autónomo/Empresa) para ver el ahorro fiscal calculado automáticamente en renting y leasing.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2>📋 Cómo elegir la mejor opción para tu vehículo paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define tu perfil fiscal (particular, autónomo o empresa)</h4>
                <p>Esta es la primera pregunta porque cambia radicalmente el análisis. Si eres autónomo o empresa y el vehículo va a estar afecto a tu actividad, las opciones con mayor ventaja fiscal (renting, leasing) pueden ser mucho más baratas en términos reales que comprar al contado. Si eres particular, el contado siempre tiene el menor coste total.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Decide si quieres ser propietario o no</h4>
                <p>Propiedad: contado o financiación. Sin propiedad pero total comodidad: renting. Propiedad futura con ventajas fiscales: leasing. Si eres particular, la propiedad suele importar (activo patrimonial, sin penalización por km). Si eres empresa, la propiedad importa menos que el flujo de caja y la deducción fiscal.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Calcula los kilómetros anuales reales que vas a hacer</h4>
                <p>Este dato es crítico para el renting. Si superas los km incluidos, el coste se dispara. Si haces más de 30.000 km/año, el renting raramente es la opción más económica. Para menos de 15.000 km/año, el renting tiene más sentido. Usa el contador del coche actual como referencia, o estima distancias reales (trabajo, viajes, etc.).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Introduce los datos reales en el comparador meskeIA</h4>
                <p>No compares con números inventados: pide al concesionario la oferta exacta (precio contado, TAE financiación, cuota renting, cuota leasing + valor residual). Introduce todos estos datos en el comparador para ver el coste total real en euros comparados. La diferencia entre opciones puede ser de 5.000-15.000 € en el mismo coche.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Negocia el precio base antes de elegir la modalidad</h4>
                <p>Siempre negocia primero el precio al contado, aunque no vayas a pagar al contado. El precio base negociado baja el coste de todas las modalidades. Los descuentos al contado suelen ser 5-8% del PVP en coches nuevos. En coches de segunda mano, negocia aún más agresivamente (10-15% es razonable en muchos casos).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Compara al menos 3 ofertas del mismo tipo de opción</h4>
                <p>No aceptes la primera oferta de financiación, renting o leasing. Pide oferta a la financiera del fabricante, a tu banco de confianza y a un comparador online. Las diferencias en TAE pueden ser de 3-5 puntos, lo que en un préstamo de 20.000 € a 5 años supone una diferencia de 1.500-2.500 € en intereses totales.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Lee el contrato antes de firmar, especialmente las cláusulas de penalización</h4>
                <p>En renting y leasing, revisa: penalización por cancelación anticipada, coste por km excedido, estado de devolución requerido (arañazos y daños que asumes vs los que cubre el seguro), condiciones del mantenimiento obligatorio. Un contrato de renting mal leído puede derivar en facturas de 2.000-5.000 € al devolver el vehículo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.eduTips}>
          <h2>✅ Claves para tomar la mejor decisión de compra</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h4>Compara TAE, no cuota</h4>
              <p>La cuota mensual baja puede esconder un TAE del 12%. Siempre calcula el coste total: entrada + todas las cuotas + comisiones. El comparador meskeIA lo hace automáticamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <h4>Estima los km reales, no los optimistas</h4>
              <p>En renting, multiplica tus km actuales por 1,2 para el contrato. Es mejor pagar algo más por cuota que enfrentarte a una factura de exceso al devolver el coche.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💶</span>
              <h4>Negocia precio antes que modalidad</h4>
              <p>Consigue el mejor precio posible al contado primero. Ese precio negociado es la base de todas las opciones. El concesionario no puede subir el precio si decides después financiar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h4>Considera el valor residual al elegir</h4>
              <p>Un coche que retiene bien su valor (Toyota, BMW) favorece la compra al contado. Uno que se deprecia rápido (marcas genéricas, diésel) favorece el renting para no asumir esa pérdida.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <h4>Para autónomos: simula el ahorro fiscal real</h4>
              <p>Activa el perfil &quot;Autónomo&quot; en el comparador. El ahorro fiscal puede reducir el coste efectivo del renting en un 40-50%. Sin calcularlo, es imposible comparar con el contado de forma justa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <h4>Lee la letra pequeña del renting</h4>
              <p>Revisa: km por año incluidos, coste km extra, estado de devolución exigido, mantenimiento oficial obligatorio. Los &quot;extras&quot; al devolver pueden sumar 2.000-4.000 € sorpresa.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores frecuentes al comprar un vehículo que cuestan miles de euros</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Negociar solo la cuota mensual:</strong> La cuota baja puede esconder TAE del 12-15%. Siempre calcula el coste total (cuota × meses + entrada + comisiones). Una cuota de 250 €/mes a 72 meses = 18.000 € en total, más de lo que vale muchos coches de segunda mano.</li>
            <li><strong>❌ No leer las condiciones del renting antes de firmar:</strong> Los contratos de renting tienen cláusulas de penalización por cancelación anticipada (3-5% cuotas pendientes), coste por km extra (0,05-0,15 €/km), y reclamaciones por estado de devolución. Una lectura superficial puede costarte 3.000-5.000 € adicionales.</li>
            <li><strong>❌ Asumir que el renting siempre sale más barato para autónomos:</strong> Depende de tu tipo marginal de IRPF, los km que hagas, y el valor residual del vehículo. Para autónomos con IRPF bajo (15-20%) y alto kilometraje, el contado puede salir más barato incluso sin las ventajas fiscales del renting.</li>
            <li><strong>❌ Elegir leasing sin entender la opción de compra:</strong> El leasing tiene sentido si vas a ejercer la opción de compra. Si al final decides no comprarlo, habrás pagado cuotas más altas que el renting por un coche que devuelves igualmente. Confirma desde el principio si quieres acabar siendo propietario o no.</li>
            <li><strong>❌ Ignorar el coste total de propiedad (TCO):</strong> El precio de compra es solo una parte. Seguro (~600-1.200 €/año), mantenimiento (~400-800 €/año), ITV (~50 €/2 años), combustible, impuesto circulación. Un coche &quot;barato&quot; de 15.000 € puede costar 4.000-5.000 € al año de total de propiedad.</li>
            <li><strong>❌ Financiar con tarjeta de crédito o crédito revolving:</strong> Las tarjetas de crédito tienen TAE del 20-30%. Usar tarjeta para comprar un coche o pagar entrada es el error más caro posible. Usa financiación de concesionario, banco o préstamo personal, siempre con TAE verificada.</li>
            <li><strong>❌ No comparar múltiples ofertas de financiación:</strong> La financiera del fabricante no siempre es la más barata. Tu banco habitual, entidades online (ING, Bankinter) o comparadores pueden ofrecer TAE 2-4 puntos más baja, lo que supone 1.000-2.500 € de ahorro en intereses totales.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-vehiculos')} />
      <ShareCard appName="comparador-vehiculos" />
      <Footer appName="comparador-vehiculos" />
    </div>
  );
}
