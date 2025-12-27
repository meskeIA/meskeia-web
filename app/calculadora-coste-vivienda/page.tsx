'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraCosteVivienda.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de vivienda
type TipoVivienda = 'habitual' | 'segunda' | 'heredada' | 'alquiler_vacacional';

// Categorías de gastos
interface GastosVivienda {
  // Gastos fijos obligatorios
  hipotecaMensual: number;
  ibiAnual: number;
  comunidadMensual: number;
  seguroHogarAnual: number;
  seguroVidaAnual: number; // Vinculado a hipoteca

  // Suministros
  electricidadMensual: number;
  gasMensual: number;
  aguaMensual: number;
  internetMensual: number;

  // Mantenimiento
  mantenimientoAnual: number; // Reparaciones, revisiones
  limpiezaMensual: number; // Servicio limpieza (segundas residencias)
  jardineriaMensual: number;
  piscinaMensual: number;

  // Otros
  basuraAnual: number; // Tasa municipal
  derramamensual: number; // Derramas comunidad
  alarmasMensual: number;
  otrosAnual: number;
}

// Valores por defecto según tipo de vivienda
const DEFAULTS_POR_TIPO: Record<TipoVivienda, Partial<GastosVivienda>> = {
  habitual: {
    electricidadMensual: 80,
    gasMensual: 40,
    aguaMensual: 30,
    internetMensual: 45,
    mantenimientoAnual: 600,
  },
  segunda: {
    electricidadMensual: 40,
    gasMensual: 20,
    aguaMensual: 20,
    internetMensual: 0,
    mantenimientoAnual: 400,
    limpiezaMensual: 80,
  },
  heredada: {
    electricidadMensual: 25,
    gasMensual: 0,
    aguaMensual: 15,
    internetMensual: 0,
    mantenimientoAnual: 800, // Suelen necesitar más mantenimiento
  },
  alquiler_vacacional: {
    electricidadMensual: 60,
    gasMensual: 30,
    aguaMensual: 40,
    internetMensual: 50,
    mantenimientoAnual: 1000,
    limpiezaMensual: 200,
  },
};

// Estimaciones de IBI según valor catastral
function estimarIBI(valorCatastral: number, esUrbano: boolean = true): number {
  // Tipo medio orientativo (varía mucho por municipio: 0.4% - 1.1%)
  const tipoMedio = esUrbano ? 0.006 : 0.003; // 0.6% urbano, 0.3% rústico
  return valorCatastral * tipoMedio;
}

// Estimación seguro hogar según valor
function estimarSeguroHogar(valorContenido: number, metrosCuadrados: number): number {
  // Aproximación: 80-150€/año para piso medio
  const baseContenido = valorContenido * 0.002; // 0.2% del contenido
  const baseMetros = metrosCuadrados * 0.5; // 0.5€/m²
  return Math.max(80, Math.min(baseContenido + baseMetros, 400));
}

export default function CalculadoraCosteViviendaPage() {
  // Tipo de vivienda
  const [tipoVivienda, setTipoVivienda] = useState<TipoVivienda>('habitual');

  // Datos básicos
  const [valorVivienda, setValorVivienda] = useState('');
  const [valorCatastral, setValorCatastral] = useState('');
  const [metrosCuadrados, setMetrosCuadrados] = useState('');

  // Gastos fijos
  const [hipoteca, setHipoteca] = useState('');
  const [ibi, setIbi] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [seguroHogar, setSeguroHogar] = useState('');
  const [seguroVida, setSeguroVida] = useState('');

  // Suministros
  const [electricidad, setElectricidad] = useState('');
  const [gas, setGas] = useState('');
  const [agua, setAgua] = useState('');
  const [internet, setInternet] = useState('');

  // Mantenimiento
  const [mantenimiento, setMantenimiento] = useState('');
  const [limpieza, setLimpieza] = useState('');
  const [jardineria, setJardineria] = useState('');
  const [piscina, setPiscina] = useState('');

  // Otros
  const [basura, setBasura] = useState('');
  const [derrama, setDerrama] = useState('');
  const [alarma, setAlarma] = useState('');
  const [otros, setOtros] = useState('');

  // Cambiar tipo y aplicar defaults
  const handleTipoChange = (nuevoTipo: TipoVivienda) => {
    setTipoVivienda(nuevoTipo);
    const defaults = DEFAULTS_POR_TIPO[nuevoTipo];

    // Solo aplicar defaults si el campo está vacío
    if (!electricidad) setElectricidad(String(defaults.electricidadMensual || 0));
    if (!gas) setGas(String(defaults.gasMensual || 0));
    if (!agua) setAgua(String(defaults.aguaMensual || 0));
    if (!internet) setInternet(String(defaults.internetMensual || 0));
    if (!mantenimiento) setMantenimiento(String(defaults.mantenimientoAnual || 0));
    if (!limpieza) setLimpieza(String(defaults.limpiezaMensual || 0));
  };

  // Estimar IBI si se proporciona valor catastral
  const handleEstimarIBI = () => {
    const vc = parseSpanishNumber(valorCatastral);
    if (vc > 0) {
      const ibiEstimado = estimarIBI(vc);
      setIbi(formatNumber(ibiEstimado, 0).replace('.', ''));
    }
  };

  // Estimar seguro hogar
  const handleEstimarSeguro = () => {
    const metros = parseSpanishNumber(metrosCuadrados);
    const valor = parseSpanishNumber(valorVivienda);
    if (metros > 0 || valor > 0) {
      const contenidoEstimado = valor * 0.1; // 10% del valor = contenido
      const seguroEstimado = estimarSeguroHogar(contenidoEstimado, metros);
      setSeguroHogar(formatNumber(seguroEstimado, 0).replace('.', ''));
    }
  };

  // Cálculos
  const resultados = useMemo(() => {
    // Parsear todos los valores
    const gastosFijos = {
      hipoteca: parseSpanishNumber(hipoteca),
      ibiMensual: parseSpanishNumber(ibi) / 12,
      comunidad: parseSpanishNumber(comunidad),
      seguroHogarMensual: parseSpanishNumber(seguroHogar) / 12,
      seguroVidaMensual: parseSpanishNumber(seguroVida) / 12,
    };

    const suministros = {
      electricidad: parseSpanishNumber(electricidad),
      gas: parseSpanishNumber(gas),
      agua: parseSpanishNumber(agua),
      internet: parseSpanishNumber(internet),
    };

    const mantenimientoGastos = {
      mantenimientoMensual: parseSpanishNumber(mantenimiento) / 12,
      limpieza: parseSpanishNumber(limpieza),
      jardineria: parseSpanishNumber(jardineria),
      piscina: parseSpanishNumber(piscina),
    };

    const otrosGastos = {
      basuraMensual: parseSpanishNumber(basura) / 12,
      derrama: parseSpanishNumber(derrama),
      alarma: parseSpanishNumber(alarma),
      otrosMensual: parseSpanishNumber(otros) / 12,
    };

    // Totales por categoría (mensual)
    const totalFijos = Object.values(gastosFijos).reduce((a, b) => a + b, 0);
    const totalSuministros = Object.values(suministros).reduce((a, b) => a + b, 0);
    const totalMantenimiento = Object.values(mantenimientoGastos).reduce((a, b) => a + b, 0);
    const totalOtros = Object.values(otrosGastos).reduce((a, b) => a + b, 0);

    const totalMensual = totalFijos + totalSuministros + totalMantenimiento + totalOtros;
    const totalAnual = totalMensual * 12;

    // Desglose detallado
    const desglose = {
      fijos: {
        hipoteca: gastosFijos.hipoteca,
        ibi: gastosFijos.ibiMensual,
        comunidad: gastosFijos.comunidad,
        seguroHogar: gastosFijos.seguroHogarMensual,
        seguroVida: gastosFijos.seguroVidaMensual,
        total: totalFijos,
      },
      suministros: {
        electricidad: suministros.electricidad,
        gas: suministros.gas,
        agua: suministros.agua,
        internet: suministros.internet,
        total: totalSuministros,
      },
      mantenimiento: {
        reparaciones: mantenimientoGastos.mantenimientoMensual,
        limpieza: mantenimientoGastos.limpieza,
        jardineria: mantenimientoGastos.jardineria,
        piscina: mantenimientoGastos.piscina,
        total: totalMantenimiento,
      },
      otros: {
        basura: otrosGastos.basuraMensual,
        derrama: otrosGastos.derrama,
        alarma: otrosGastos.alarma,
        varios: otrosGastos.otrosMensual,
        total: totalOtros,
      },
    };

    // Porcentajes
    const porcentajes = {
      fijos: totalMensual > 0 ? (totalFijos / totalMensual) * 100 : 0,
      suministros: totalMensual > 0 ? (totalSuministros / totalMensual) * 100 : 0,
      mantenimiento: totalMensual > 0 ? (totalMantenimiento / totalMensual) * 100 : 0,
      otros: totalMensual > 0 ? (totalOtros / totalMensual) * 100 : 0,
    };

    // Coste por día y por m²
    const valorViv = parseSpanishNumber(valorVivienda);
    const metros = parseSpanishNumber(metrosCuadrados);
    const costePorDia = totalAnual / 365;
    const costePorMetro = metros > 0 ? totalMensual / metros : 0;
    const rentabilidadImplicita = valorViv > 0 ? (totalAnual / valorViv) * 100 : 0;

    return {
      totalMensual,
      totalAnual,
      desglose,
      porcentajes,
      costePorDia,
      costePorMetro,
      rentabilidadImplicita,
      tieneHipoteca: gastosFijos.hipoteca > 0,
    };
  }, [hipoteca, ibi, comunidad, seguroHogar, seguroVida, electricidad, gas, agua, internet, mantenimiento, limpieza, jardineria, piscina, basura, derrama, alarma, otros, valorVivienda, metrosCuadrados]);

  const hayDatos = resultados.totalMensual > 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora Coste Real de Vivienda</h1>
        <p className={styles.subtitle}>
          Descubre cuánto cuesta realmente mantener una vivienda al mes.
          Ideal para segundas residencias, viviendas heredadas o decidir si comprar.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Tipo de vivienda */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tipo de vivienda</h2>
            <div className={styles.tipoGrid}>
              {[
                { value: 'habitual' as TipoVivienda, label: 'Vivienda habitual', icon: '🏠' },
                { value: 'segunda' as TipoVivienda, label: 'Segunda residencia', icon: '🏖️' },
                { value: 'heredada' as TipoVivienda, label: 'Vivienda heredada', icon: '🏚️' },
                { value: 'alquiler_vacacional' as TipoVivienda, label: 'Alquiler vacacional', icon: '🔑' },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  className={`${styles.tipoBtn} ${tipoVivienda === tipo.value ? styles.active : ''}`}
                  onClick={() => handleTipoChange(tipo.value)}
                >
                  <span className={styles.tipoIcon}>{tipo.icon}</span>
                  <span className={styles.tipoLabel}>{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Datos básicos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Datos básicos (opcional)</h2>
            <p className={styles.cardHint}>Para calcular ratios y estimaciones</p>

            <div className={styles.formRow}>
              <NumberInput
                value={valorVivienda}
                onChange={setValorVivienda}
                label="Valor de la vivienda"
                placeholder="200000"
                helperText="Precio de compra o valor actual"
              />
              <NumberInput
                value={metrosCuadrados}
                onChange={setMetrosCuadrados}
                label="Metros cuadrados"
                placeholder="90"
              />
            </div>

            <div className={styles.formRowWithBtn}>
              <NumberInput
                value={valorCatastral}
                onChange={setValorCatastral}
                label="Valor catastral"
                placeholder="80000"
                helperText="Aparece en el recibo del IBI"
              />
              <button onClick={handleEstimarIBI} className={styles.btnEstimar}>
                Estimar IBI
              </button>
            </div>
          </div>

          {/* Gastos fijos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📋</span>
              Gastos fijos mensuales
            </h2>

            <NumberInput
              value={hipoteca}
              onChange={setHipoteca}
              label="Hipoteca mensual"
              placeholder="0"
              helperText="Cuota mensual (0 si no tienes)"
            />

            <NumberInput
              value={ibi}
              onChange={setIbi}
              label="IBI anual"
              placeholder="500"
              helperText="Impuesto sobre Bienes Inmuebles"
            />

            <NumberInput
              value={comunidad}
              onChange={setComunidad}
              label="Comunidad mensual"
              placeholder="80"
              helperText="Cuota de la comunidad de propietarios"
            />

            <div className={styles.formRowWithBtn}>
              <NumberInput
                value={seguroHogar}
                onChange={setSeguroHogar}
                label="Seguro hogar anual"
                placeholder="150"
              />
              <button onClick={handleEstimarSeguro} className={styles.btnEstimar}>
                Estimar
              </button>
            </div>

            <NumberInput
              value={seguroVida}
              onChange={setSeguroVida}
              label="Seguro vida anual"
              placeholder="0"
              helperText="Vinculado a la hipoteca (si aplica)"
            />
          </div>

          {/* Suministros */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>💡</span>
              Suministros mensuales
            </h2>

            <div className={styles.formRow}>
              <NumberInput
                value={electricidad}
                onChange={setElectricidad}
                label="Electricidad"
                placeholder="80"
              />
              <NumberInput
                value={gas}
                onChange={setGas}
                label="Gas"
                placeholder="40"
              />
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={agua}
                onChange={setAgua}
                label="Agua"
                placeholder="30"
              />
              <NumberInput
                value={internet}
                onChange={setInternet}
                label="Internet/TV"
                placeholder="45"
              />
            </div>
          </div>

          {/* Mantenimiento */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🔧</span>
              Mantenimiento
            </h2>

            <NumberInput
              value={mantenimiento}
              onChange={setMantenimiento}
              label="Reparaciones y mantenimiento anual"
              placeholder="600"
              helperText="Revisiones, pequeñas reparaciones, etc."
            />

            <div className={styles.formRow}>
              <NumberInput
                value={limpieza}
                onChange={setLimpieza}
                label="Limpieza mensual"
                placeholder="0"
                helperText="Servicio de limpieza"
              />
              <NumberInput
                value={jardineria}
                onChange={setJardineria}
                label="Jardinería mensual"
                placeholder="0"
              />
            </div>

            <NumberInput
              value={piscina}
              onChange={setPiscina}
              label="Mantenimiento piscina mensual"
              placeholder="0"
            />
          </div>

          {/* Otros gastos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📦</span>
              Otros gastos
            </h2>

            <div className={styles.formRow}>
              <NumberInput
                value={basura}
                onChange={setBasura}
                label="Tasa basuras anual"
                placeholder="100"
              />
              <NumberInput
                value={derrama}
                onChange={setDerrama}
                label="Derramas mensual"
                placeholder="0"
                helperText="Promedio mensual"
              />
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={alarma}
                onChange={setAlarma}
                label="Alarma mensual"
                placeholder="0"
              />
              <NumberInput
                value={otros}
                onChange={setOtros}
                label="Otros anual"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {hayDatos ? (
            <>
              {/* Resultados principales */}
              <div className={styles.resultsGrid}>
                <ResultCard
                  title="Coste mensual total"
                  value={formatNumber(resultados.totalMensual, 2)}
                  unit="€"
                  variant="highlight"
                  icon="📊"
                />
                <ResultCard
                  title="Coste anual total"
                  value={formatNumber(resultados.totalAnual, 2)}
                  unit="€"
                  variant="info"
                  icon="📅"
                />
                <ResultCard
                  title="Coste por día"
                  value={formatNumber(resultados.costePorDia, 2)}
                  unit="€"
                  variant="default"
                  icon="☀️"
                />
                {parseSpanishNumber(metrosCuadrados) > 0 && (
                  <ResultCard
                    title="Coste por m²/mes"
                    value={formatNumber(resultados.costePorMetro, 2)}
                    unit="€"
                    variant="default"
                    icon="📐"
                  />
                )}
              </div>

              {/* Desglose por categorías */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Desglose mensual por categorías</h3>

                {/* Barra visual */}
                <div className={styles.barraContainer}>
                  <div className={styles.barra}>
                    <div
                      className={`${styles.barraSegmento} ${styles.fijos}`}
                      style={{ width: `${resultados.porcentajes.fijos}%` }}
                      title={`Gastos fijos: ${formatNumber(resultados.porcentajes.fijos, 1)}%`}
                    />
                    <div
                      className={`${styles.barraSegmento} ${styles.suministros}`}
                      style={{ width: `${resultados.porcentajes.suministros}%` }}
                      title={`Suministros: ${formatNumber(resultados.porcentajes.suministros, 1)}%`}
                    />
                    <div
                      className={`${styles.barraSegmento} ${styles.mantenimiento}`}
                      style={{ width: `${resultados.porcentajes.mantenimiento}%` }}
                      title={`Mantenimiento: ${formatNumber(resultados.porcentajes.mantenimiento, 1)}%`}
                    />
                    <div
                      className={`${styles.barraSegmento} ${styles.otros}`}
                      style={{ width: `${resultados.porcentajes.otros}%` }}
                      title={`Otros: ${formatNumber(resultados.porcentajes.otros, 1)}%`}
                    />
                  </div>
                  <div className={styles.leyenda}>
                    <span className={styles.leyendaItem}><span className={`${styles.leyendaColor} ${styles.fijos}`}></span> Fijos</span>
                    <span className={styles.leyendaItem}><span className={`${styles.leyendaColor} ${styles.suministros}`}></span> Suministros</span>
                    <span className={styles.leyendaItem}><span className={`${styles.leyendaColor} ${styles.mantenimiento}`}></span> Mantenimiento</span>
                    <span className={styles.leyendaItem}><span className={`${styles.leyendaColor} ${styles.otros}`}></span> Otros</span>
                  </div>
                </div>

                {/* Gastos fijos */}
                <div className={styles.desgloseSection}>
                  <h4>📋 Gastos fijos: {formatCurrency(resultados.desglose.fijos.total)}/mes</h4>
                  <div className={styles.desgloseGrid}>
                    {resultados.desglose.fijos.hipoteca > 0 && (
                      <div className={styles.desgloseRow}>
                        <span>Hipoteca</span>
                        <span>{formatCurrency(resultados.desglose.fijos.hipoteca)}</span>
                      </div>
                    )}
                    {resultados.desglose.fijos.ibi > 0 && (
                      <div className={styles.desgloseRow}>
                        <span>IBI</span>
                        <span>{formatCurrency(resultados.desglose.fijos.ibi)}</span>
                      </div>
                    )}
                    {resultados.desglose.fijos.comunidad > 0 && (
                      <div className={styles.desgloseRow}>
                        <span>Comunidad</span>
                        <span>{formatCurrency(resultados.desglose.fijos.comunidad)}</span>
                      </div>
                    )}
                    {resultados.desglose.fijos.seguroHogar > 0 && (
                      <div className={styles.desgloseRow}>
                        <span>Seguro hogar</span>
                        <span>{formatCurrency(resultados.desglose.fijos.seguroHogar)}</span>
                      </div>
                    )}
                    {resultados.desglose.fijos.seguroVida > 0 && (
                      <div className={styles.desgloseRow}>
                        <span>Seguro vida</span>
                        <span>{formatCurrency(resultados.desglose.fijos.seguroVida)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suministros */}
                {resultados.desglose.suministros.total > 0 && (
                  <div className={styles.desgloseSection}>
                    <h4>💡 Suministros: {formatCurrency(resultados.desglose.suministros.total)}/mes</h4>
                    <div className={styles.desgloseGrid}>
                      {resultados.desglose.suministros.electricidad > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Electricidad</span>
                          <span>{formatCurrency(resultados.desglose.suministros.electricidad)}</span>
                        </div>
                      )}
                      {resultados.desglose.suministros.gas > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Gas</span>
                          <span>{formatCurrency(resultados.desglose.suministros.gas)}</span>
                        </div>
                      )}
                      {resultados.desglose.suministros.agua > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Agua</span>
                          <span>{formatCurrency(resultados.desglose.suministros.agua)}</span>
                        </div>
                      )}
                      {resultados.desglose.suministros.internet > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Internet/TV</span>
                          <span>{formatCurrency(resultados.desglose.suministros.internet)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mantenimiento */}
                {resultados.desglose.mantenimiento.total > 0 && (
                  <div className={styles.desgloseSection}>
                    <h4>🔧 Mantenimiento: {formatCurrency(resultados.desglose.mantenimiento.total)}/mes</h4>
                    <div className={styles.desgloseGrid}>
                      {resultados.desglose.mantenimiento.reparaciones > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Reparaciones</span>
                          <span>{formatCurrency(resultados.desglose.mantenimiento.reparaciones)}</span>
                        </div>
                      )}
                      {resultados.desglose.mantenimiento.limpieza > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Limpieza</span>
                          <span>{formatCurrency(resultados.desglose.mantenimiento.limpieza)}</span>
                        </div>
                      )}
                      {resultados.desglose.mantenimiento.jardineria > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Jardinería</span>
                          <span>{formatCurrency(resultados.desglose.mantenimiento.jardineria)}</span>
                        </div>
                      )}
                      {resultados.desglose.mantenimiento.piscina > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Piscina</span>
                          <span>{formatCurrency(resultados.desglose.mantenimiento.piscina)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Otros */}
                {resultados.desglose.otros.total > 0 && (
                  <div className={styles.desgloseSection}>
                    <h4>📦 Otros: {formatCurrency(resultados.desglose.otros.total)}/mes</h4>
                    <div className={styles.desgloseGrid}>
                      {resultados.desglose.otros.basura > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Tasa basuras</span>
                          <span>{formatCurrency(resultados.desglose.otros.basura)}</span>
                        </div>
                      )}
                      {resultados.desglose.otros.derrama > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Derramas</span>
                          <span>{formatCurrency(resultados.desglose.otros.derrama)}</span>
                        </div>
                      )}
                      {resultados.desglose.otros.alarma > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Alarma</span>
                          <span>{formatCurrency(resultados.desglose.otros.alarma)}</span>
                        </div>
                      )}
                      {resultados.desglose.otros.varios > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Otros</span>
                          <span>{formatCurrency(resultados.desglose.otros.varios)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Análisis adicional */}
              {parseSpanishNumber(valorVivienda) > 0 && (
                <div className={styles.analisis}>
                  <h3 className={styles.analisisTitle}>Análisis de coste</h3>
                  <div className={styles.analisisCard}>
                    <p>
                      <strong>Coste de mantenimiento sobre valor:</strong>{' '}
                      {formatNumber(resultados.rentabilidadImplicita, 2)}% anual
                    </p>
                    <p className={styles.analisisHint}>
                      {resultados.rentabilidadImplicita < 2
                        ? 'El coste de mantenimiento es bajo respecto al valor del inmueble.'
                        : resultados.rentabilidadImplicita < 4
                        ? 'El coste de mantenimiento está en un rango normal.'
                        : 'El coste de mantenimiento es alto. Puede indicar necesidad de revisar gastos o rentabilizar la propiedad.'}
                    </p>
                  </div>

                  {tipoVivienda === 'segunda' || tipoVivienda === 'heredada' ? (
                    <div className={styles.analisisCard}>
                      <p>
                        <strong>Equivalente a alquilar:</strong>{' '}
                        {formatCurrency(resultados.totalMensual)}/mes
                      </p>
                      <p className={styles.analisisHint}>
                        Si alquilaras esta vivienda por menos de esta cantidad mensual,
                        estarías perdiendo dinero cada mes (sin contar la revalorización del inmueble).
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🏠</span>
              <p>Introduce los gastos de tu vivienda para calcular el coste real mensual</p>
              <p className={styles.placeholderHint}>
                Puedes empezar con los gastos que conozcas e ir añadiendo más.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> del coste
          de mantenimiento de una vivienda. Los valores reales pueden variar según:
        </p>
        <ul>
          <li>Tu municipio (IBI, tasas de basura varían significativamente)</li>
          <li>La antigüedad y estado del inmueble</li>
          <li>El consumo real de suministros</li>
          <li>Obras y reparaciones imprevistas</li>
        </ul>
        <p>
          <strong>NO constituye asesoramiento financiero.</strong> Consulta con un profesional
          para decisiones importantes sobre compra o mantenimiento de inmuebles.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los costes de tu vivienda?"
        subtitle="Descubre gastos ocultos, cómo reducir costes y tomar mejores decisiones inmobiliarias"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Los costes que muchos olvidan</h2>
          <p className={styles.introParagraph}>
            Cuando compramos una vivienda, solemos pensar solo en la hipoteca. Pero el coste real
            incluye muchos más conceptos que, sumados, pueden suponer un 30-50% adicional sobre la cuota mensual.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💰 Gastos ineludibles</h4>
              <ul>
                <li><strong>IBI:</strong> Impuesto municipal (0,4%-1,1% del valor catastral)</li>
                <li><strong>Comunidad:</strong> Obligatorio en edificios (50-200€/mes)</li>
                <li><strong>Seguro hogar:</strong> Obligatorio con hipoteca (80-200€/año)</li>
                <li><strong>Tasa de basuras:</strong> Variable por municipio (50-200€/año)</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🔧 Mantenimiento preventivo</h4>
              <ul>
                <li><strong>Revisión caldera:</strong> Obligatoria cada 2 años (80-120€)</li>
                <li><strong>Aire acondicionado:</strong> Revisión anual recomendada (60-100€)</li>
                <li><strong>Pintura:</strong> Cada 5-7 años (1.500-3.000€)</li>
                <li><strong>Electrodomésticos:</strong> Vida útil 10-15 años</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Segundas residencias: el coste real</h2>
          <p>
            Una segunda residencia tiene costes casi iguales que una vivienda habitual, pero la usas
            solo unos meses al año. Esto significa que el <strong>coste por día de uso</strong> puede
            ser muy alto.
          </p>

          <div className={styles.infoBox}>
            <h4>📌 Ejemplo práctico</h4>
            <p>Una segunda residencia con gastos de 400€/mes:</p>
            <ul>
              <li>Coste anual: 4.800€</li>
              <li>Si la usas 30 días/año: <strong>160€/día</strong></li>
              <li>Si la usas 60 días/año: <strong>80€/día</strong></li>
              <li>Si la usas 90 días/año: <strong>53€/día</strong></li>
            </ul>
            <p>
              Compara este coste con alquilar un apartamento vacacional.
              A veces, vender y alquilar cuando necesitas es más rentable.
            </p>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Viviendas heredadas: la trampa del coste cero</h2>
          <p>
            Muchas familias mantienen viviendas heredadas pensando que no les cuesta nada.
            Pero los gastos se acumulan silenciosamente:
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>❌ Costes inevitables</h4>
              <ul>
                <li>IBI: Hay que pagarlo aunque esté vacía</li>
                <li>Comunidad: Cuota mensual obligatoria</li>
                <li>Suministros mínimos: Potencias contratadas</li>
                <li>Mantenimiento: Las casas vacías se deterioran más</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>✅ Opciones a considerar</h4>
              <ul>
                <li><strong>Alquilar:</strong> Genera ingresos y alguien cuida la casa</li>
                <li><strong>Vender:</strong> Capital invertible que renta</li>
                <li><strong>Alquiler turístico:</strong> Si está en zona de demanda</li>
                <li><strong>Uso familiar:</strong> Cuantifica el valor del uso</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h4>¿Cuánto debería reservar para mantenimiento?</h4>
            <p>
              La regla general es reservar el <strong>1% del valor del inmueble</strong> anualmente
              para mantenimiento y reparaciones. Para viviendas antiguas (+30 años), sube al 1,5-2%.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Es más caro mantener una casa que un piso?</h4>
            <p>
              Generalmente sí. Una casa unifamiliar no tiene gastos de comunidad pero tiene más
              superficie exterior (jardín, fachada, tejado) que mantener. Suele ser un 20-30% más cara de mantener.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Cómo reducir los gastos de una vivienda?</h4>
            <p>
              Las mayores oportunidades de ahorro están en: revisar la potencia eléctrica contratada,
              comparar seguros cada año, mejorar el aislamiento térmico, y negociar las cuotas de
              servicios como alarmas o telecomunicaciones.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Cuándo compensa vender una vivienda heredada?</h4>
            <p>
              Si el coste anual de mantenerla supera lo que ganarías alquilándola (después de impuestos),
              y no tienes planes de usarla regularmente, probablemente sea mejor vender e invertir
              el capital de otra forma.
            </p>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-coste-vivienda')} />
      <Footer appName="calculadora-coste-vivienda" />
    </div>
  );
}
