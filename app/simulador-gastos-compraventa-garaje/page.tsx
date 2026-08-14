'use client';
// @disclaimer: NO — DisclaimerCard severity="critical" (fiscal España)

import { useState, useMemo } from 'react';
import styles from './SimuladorGarajeCompraventa.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  NumberInput,
  ResultCard,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  ShareCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { IVA_INMUEBLES_2025, FISCAL_INMUEBLES_META, calcularGananciaInmueble } from '@/data/fiscal';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  calcularRegistro,
  calcularPlusvaliaMunicipal,
  elegirTipoITP,
  TipoElegido,
  ENLACE_CATASTRO,
} from '@/data/itp-ccaa';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type TipoGaraje = 'vinculado' | 'independiente';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad';

interface ResultadosComprador {
  precioGaraje: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  ajd: number;
  gastosNotario: number;
  gastosRegistro: number;
  gastosGestoria: number;
  totalGastos: number;
  totalOperacion: number;
  /** null en primera mano (allí es IVA, no ITP) */
  tipoElegido: TipoElegido | null;
}

interface ResultadosVendedor {
  precioVenta: number;
  plusvaliaMunicipal: number;
  metodoPlusvalia: string;
  exentoPlusvalia: boolean;
  comisionInmobiliaria: number;
  gastosGestoria: number;
  totalGastos: number;
  netoVendedor: number;
  valorAdquisicion: number;
  valorTransmision: number;
  gananciaPatrimonial: number;
  esPerdida: boolean;
  irpfGanancia: number;
}

// ===== CONSTANTES =====
const COMUNIDADES: { value: ComunidadAutonoma; label: string }[] = [
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'baleares', label: 'Islas Baleares' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla-leon', label: 'Castilla y León' },
  { value: 'castilla-mancha', label: 'Castilla-La Mancha' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'valencia', label: 'Comunidad Valenciana' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'madrid', label: 'Comunidad de Madrid' },
  { value: 'murcia', label: 'Región de Murcia' },
  { value: 'navarra', label: 'Navarra' },
  { value: 'pais-vasco', label: 'País Vasco' },
  { value: 'rioja', label: 'La Rioja' },
  { value: 'ceuta', label: 'Ceuta' },
  { value: 'melilla', label: 'Melilla' },
];

const PERFILES_COMPRADOR: { value: PerfilComprador; label: string }[] = [
  { value: 'general', label: 'General (sin bonificaciones)' },
  { value: 'joven', label: 'Joven (< 35 años)' },
  { value: 'familia-numerosa', label: 'Familia numerosa' },
  { value: 'discapacidad', label: 'Persona con discapacidad' },
];


// ===== COMPONENTE PRINCIPAL =====
export default function SimuladorGarajeCompraventaPage() {
  // Estado del formulario — comprador
  const [precioGaraje, setPrecioGaraje] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [tipoGaraje, setTipoGaraje] = useState<TipoGaraje>('vinculado');
  const [perfilComprador, setPerfilComprador] = useState<PerfilComprador>('general');
  const [gastosGestoria, setGastosGestoria] = useState('300');

  // Estado del formulario — vendedor
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  // ===== CÁLCULOS COMPRADOR =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioGaraje);
    if (precio <= 0) return null;

    const gestoria = parseSpanishNumber(gastosGestoria);
    const datosCcaa = ITP_CCAA[ccaa];

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    /** Qué tipo de ITP se ha aplicado y cuáles NO se han podido comprobar */
    let elegido: TipoElegido | null = null;

    if (tipoTransmision === 'primera-mano') {
      // Garaje nuevo: IVA reducido (10%) si va vinculado a la vivienda (máx. 2 plazas);
      // IVA general (21%) si es independiente o está en un edificio no residencial
      tipoImpuesto = 'IVA';
      porcentaje = tipoGaraje === 'vinculado' ? IVA_INMUEBLES_2025.garageCon : IVA_INMUEBLES_2025.garaje;
      impuesto = precio * (porcentaje / 100);
    } else {
      // Garaje segunda mano: ITP.
      // `viviendaHabitual: false` porque un garaje suelto NO lo es nunca, y esa condición
      // aparece en 53 de los tipos reducidos. Antes se aplicaba el primer reducido que
      // casara por nombre sin mirar sus condiciones, y en Madrid eso daba ITP del 0 %.
      elegido = elegirTipoITP(ccaa, perfilComprador, precio, { viviendaHabitual: false });
      impuesto = calcularITP(precio, ccaa, elegido.tipo);
      tipoImpuesto = 'ITP';
      porcentaje = elegido.tipo;
    }

    // AJD solo aplica en primera mano (junto con IVA)
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;
    const notario = calcularNotario(precio);
    const registro = calcularRegistro(precio);
    const totalGastos = impuesto + ajd + notario + registro + gestoria;

    return {
      precioGaraje: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      ajd,
      gastosNotario: notario,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
      tipoElegido: elegido,
    };
  }, [precioGaraje, ccaa, tipoTransmision, tipoGaraje, perfilComprador, gastosGestoria]);

  // ===== CÁLCULOS VENDEDOR =====
  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioGaraje);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    const anios = parseInt(aniosPropiedad) || 0;
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);
    const valorTotal = parseSpanishNumber(valorCatastralTotal);

    if (precioV <= 0) return null;

    const comisionPct = parseSpanishNumber(comisionInmobiliaria) / 100;
    const gestoria = parseSpanishNumber(gastosGestoria);
    const comision = precioV * comisionPct;

    // Plusvalía municipal
    let plusvalia = 0;
    let metodoPlusvalia = 'No calculada (falta valor catastral del suelo)';
    let exentoPlusvalia = false;

    if (valorSuelo > 0 && anios > 0 && precioC > 0) {
      const resultadoPlusvalia = calcularPlusvaliaMunicipal({
        valorCatastralSuelo: valorSuelo,
        aniosPropiedad: anios,
        precioCompra: precioC,
        precioVenta: precioV,
        valorCatastralTotal: valorTotal > 0 ? valorTotal : undefined,
      });
      plusvalia = resultadoPlusvalia.recomendado;
      exentoPlusvalia = resultadoPlusvalia.exento;
      metodoPlusvalia = resultadoPlusvalia.exento
        ? 'No sujeta (sin incremento de valor)'
        : !resultadoPlusvalia.metodoRealDisponible
          ? 'Método objetivo (falta el valor catastral total para comparar)'
          : resultadoPlusvalia.metodoReal < resultadoPlusvalia.metodoObjetivo
            ? 'Método real (más favorable)'
            : 'Método objetivo (más favorable)';
    }

    // Ganancia patrimonial e IRPF (garaje: sin exención por vivienda habitual ni edad).
    // Motor único del art. 35 LIRPF: los impuestos y gastos de la compra suman al valor
    // de adquisición y la plusvalía municipal resta del valor de transmisión.
    const g = calcularGananciaInmueble({
      precioVenta: precioV,
      precioCompra: precioC,
      gastosAdquisicion: parseSpanishNumber(gastosAdquisicion),
      gastosTransmision: comision + gestoria,
      plusvaliaMunicipal: plusvalia,
    });

    const hayDatosGanancia = precioC > 0;
    const irpf = hayDatosGanancia ? g.cuotaIRPF : 0;
    const totalGastos = plusvalia + comision + gestoria + irpf;
    const neto = precioV - totalGastos;

    return {
      precioVenta: precioV,
      plusvaliaMunicipal: plusvalia,
      metodoPlusvalia,
      exentoPlusvalia,
      comisionInmobiliaria: comision,
      gastosGestoria: gestoria,
      totalGastos,
      netoVendedor: neto,
      valorAdquisicion: hayDatosGanancia ? g.valorAdquisicion : 0,
      valorTransmision: g.valorTransmision,
      gananciaPatrimonial: hayDatosGanancia ? g.ganancia : 0,
      esPerdida: hayDatosGanancia && g.esPerdida,
      irpfGanancia: irpf,
    };
  }, [precioGaraje, precioCompraOriginal, aniosPropiedad, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, gastosGestoria, gastosAdquisicion]);

  const datosCcaaActual = ITP_CCAA[ccaa];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🚗</span>
        <h1 className={styles.title}>Simulador de Gastos de Compraventa de Garaje</h1>
        <p className={styles.subtitle}>
          Calcula el ITP, notaría, registro y plusvalía al comprar o vender una plaza de parking en España
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal - CRÍTICO (app fiscal España) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-garaje"
        collapsible={false}
      />
      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={FISCAL_INMUEBLES_META.nota}
      />

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        {/* Panel izquierdo: datos */}
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>📋 Datos del garaje</h2>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de transmisión</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
                aria-pressed={tipoTransmision === 'segunda-mano'}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                type="button"                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={tipoTransmision === 'primera-mano'}
              >
                <span aria-hidden="true" className={styles.transmisionIcon}>🆕</span>
                <span>Primera mano (obra nueva)</span>
                <span className={styles.transmisionSub}>Paga IVA</span>
              </button>
            </div>
          </div>

          {/* Tipo de garaje (solo primera mano: determina el tipo de IVA) */}
          {tipoTransmision === 'primera-mano' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Tipo de garaje</label>
              <div className={styles.transmisionGrid}>
                <button
                  type="button"                  className={`${styles.transmisionBtn} ${tipoGaraje === 'vinculado' ? styles.active : ''}`}
                  onClick={() => setTipoGaraje('vinculado')}
                  aria-pressed={tipoGaraje === 'vinculado'}
                >
                  <span aria-hidden="true" className={styles.transmisionIcon}>🏠</span>
                  <span>Vinculado a vivienda</span>
                  <span className={styles.transmisionSub}>IVA {IVA_INMUEBLES_2025.garageCon}%</span>
                </button>
                <button
                  type="button"                  className={`${styles.transmisionBtn} ${tipoGaraje === 'independiente' ? styles.active : ''}`}
                  onClick={() => setTipoGaraje('independiente')}
                  aria-pressed={tipoGaraje === 'independiente'}
                >
                  <span aria-hidden="true" className={styles.transmisionIcon}>🅿️</span>
                  <span>Independiente</span>
                  <span className={styles.transmisionSub}>IVA {IVA_INMUEBLES_2025.garaje}%</span>
                </button>
              </div>
              <p className={styles.infoCcaaNote}>
                Un garaje vinculado a la vivienda (máx. 2 plazas, mismo edificio y promotor) tributa al {IVA_INMUEBLES_2025.garageCon}% de IVA. Un garaje independiente, comprado por separado o en un edificio de uso no residencial, tributa al {IVA_INMUEBLES_2025.garaje}%.
              </p>
            </div>
          )}

          {/* Precio del garaje */}
          <NumberInput
            value={precioGaraje}
            onChange={setPrecioGaraje}
            label="Precio del garaje / plaza de parking"
            placeholder="25000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor)"
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">
              Comunidad Autónoma (ubicación del garaje)
            </label>
            <select
              id="select-ccaa"
              value={ccaa}
              onChange={(e) => setCcaa(e.target.value as ComunidadAutonoma)}
              className={styles.select}
            >
              {COMUNIDADES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span aria-hidden="true" className={styles.infoCcaaIcon}>📍</span>
              <span className={styles.infoCcaaNombre}>{datosCcaaActual.nombre}</span>
            </div>
            <div className={styles.infoCcaaGrid}>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>ITP General</span>
                <span className={styles.infoCcaaValue}>{datosCcaaActual.tipoGeneral}%</span>
              </div>
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>AJD</span>
                <span className={styles.infoCcaaValue}>{datosCcaaActual.ajd}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                Esta comunidad aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>{datosCcaaActual.notas}</p>
          </div>

          {/* Perfil del comprador (solo ITP segunda mano) */}
          {tipoTransmision === 'segunda-mano' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="select-perfil">
                Perfil del comprador (tipos reducidos de ITP)
              </label>
              <select
                id="select-perfil"
                value={perfilComprador}
                onChange={(e) => setPerfilComprador(e.target.value as PerfilComprador)}
                className={styles.select}
              >
                {PERFILES_COMPRADOR.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {perfilComprador !== 'general' && datosCcaaActual.tiposReducidos.length > 0 && (
                <div className={styles.tiposReducidosInfo}>
                  <h4>Tipos reducidos disponibles en {datosCcaaActual.nombre}:</h4>
                  <ul>
                    {datosCcaaActual.tiposReducidos.map((tr, idx) => (
                      <li key={idx}>
                        <strong>{tr.tipo}%</strong> — {tr.nombre}
                        {tr.valorMaximo && (
                          <span className={styles.limite}> (máx. {formatCurrency(tr.valorMaximo)})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gestoría comprador */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="300"
              helperText="Típico: 200-400 € (tramitación de escrituras)"
              min={0}
            />
          </div>

          {/* Enlace Catastro */}
          <div className={styles.enlaceCatastro}>
            <a
              href={ENLACE_CATASTRO}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.catastroLink}
            >
              Consultar valor de referencia catastral en la Sede del Catastro
            </a>
          </div>
        </div>

        {/* Panel derecho: resultados */}
        <div className={styles.resultados}>
          {/* Pestañas */}
          <div className={styles.tabs} role="tablist">
            <button
              type="button"              role="tab"
              aria-selected={pestanaActiva === 'comprador'}
              className={`${styles.tab} ${pestanaActiva === 'comprador' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('comprador')}
            >
              Comprador
            </button>
            <button
              type="button"              role="tab"
              aria-selected={pestanaActiva === 'vendedor'}
              className={`${styles.tab} ${pestanaActiva === 'vendedor' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('vendedor')}
            >
              Vendedor
            </button>
          </div>

          {/* Resultados Comprador */}
          {pestanaActiva === 'comprador' && (
            <div role="tabpanel">
              {resultadosComprador ? (
                <div className={styles.resultsInner}>
                  <ResultCard
                    title="Precio del garaje"
                    value={formatCurrency(resultadosComprador.precioGaraje)}
                    variant="default"
                    icon="🚗"
                  />
                  <ResultCard
                    title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 1)}%)`}
                    value={formatCurrency(resultadosComprador.impuestoTransmision)}
                    variant="warning"
                    icon="📋"
                  />
                  {resultadosComprador.ajd > 0 && (
                    <ResultCard
                      title={`AJD (${formatNumber(datosCcaaActual.ajd, 2)}%)`}
                      value={formatCurrency(resultadosComprador.ajd)}
                      variant="warning"
                      icon="📄"
                    />
                  )}
                  <ResultCard
                    title="Gastos de notaría (+ IVA)"
                    value={formatCurrency(resultadosComprador.gastosNotario)}
                    variant="default"
                    icon="📝"
                  />
                  <ResultCard
                    title="Registro de la Propiedad (+ IVA)"
                    value={formatCurrency(resultadosComprador.gastosRegistro)}
                    variant="default"
                    icon="🏛️"
                  />
                  {resultadosComprador.gastosGestoria > 0 && (
                    <ResultCard
                      title="Gastos de gestoría"
                      value={formatCurrency(resultadosComprador.gastosGestoria)}
                      variant="default"
                      icon="📂"
                    />
                  )}
                  <div className={styles.separador} />
                  <ResultCard
                    title="Total gastos adicionales"
                    value={formatCurrency(resultadosComprador.totalGastos)}
                    variant="info"
                    icon="➕"
                    description={`${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioGaraje) * 100, 2)}% sobre el precio`}
                  />
                  <ResultCard
                    title="COSTE TOTAL DE ADQUISICIÓN"
                    value={formatCurrency(resultadosComprador.totalOperacion)}
                    variant="highlight"
                    icon="💳"
                    description="Precio + todos los gastos"
                  />
                  {/*
                    Tipos reducidos que encajan con el perfil pero exigen requisitos que
                    esta herramienta no pregunta. NO se aplican al cálculo —presupuestar
                    de menos es el error caro— pero se enseñan, porque el comprador puede
                    cumplirlos y tiene derecho a saber que existen.
                  */}
                  {resultadosComprador.tipoElegido && resultadosComprador.tipoElegido.noComprobables.length > 0 && (
                    <div className={styles.avisoReducidos} role="note">
                      <p className={styles.avisoReducidosTitulo}>
                        <span aria-hidden="true">💡</span> Podrías pagar menos, pero depende de requisitos que no preguntamos
                      </p>
                      <p className={styles.avisoReducidosTexto}>
                        El cálculo usa el tipo general ({formatNumber(datosCcaaActual.tipoGeneral, 2)}%) porque no
                        podemos comprobar tu situación. En {datosCcaaActual.nombre} existe:
                      </p>
                      <ul className={styles.avisoReducidosLista}>
                        {resultadosComprador.tipoElegido.noComprobables.map(r => (
                          <li key={r.nombre}>
                            <strong>{formatNumber(r.tipo, 2)}% — {r.nombre}</strong>
                            <br />
                            Requisitos: {r.condiciones.join(' · ')}
                            {r.valorMaximo ? ` · Valor máximo ${formatCurrency(r.valorMaximo)}` : ''}
                          </li>
                        ))}
                      </ul>
                      <p className={styles.avisoReducidosTexto}>
                        Un garaje comprado por separado no es vivienda habitual, así que los tipos que
                        exigen esa condición no suelen aplicarse. Confírmalo con la oficina liquidadora
                        de tu comunidad antes de contar con la rebaja.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <span aria-hidden="true" className={styles.placeholderIcon}>🚗</span>
                  <p>Introduce el precio del garaje para ver el desglose de gastos del comprador</p>
                </div>
              )}
            </div>
          )}

          {/* Resultados Vendedor */}
          {pestanaActiva === 'vendedor' && (
            <div role="tabpanel">
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos adicionales del vendedor</h3>
                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original del garaje"
                  placeholder="18000"
                  helperText="Lo que pagaste cuando lo compraste"
                  min={0}
                />
                <NumberInput
                  value={gastosAdquisicion}
                  onChange={setGastosAdquisicion}
                  label="Impuestos y gastos que pagaste al comprarlo (€)"
                  placeholder="1800"
                  helperText="ITP o IVA, notaría, registro y gestoría de aquella compra: suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                  min={0}
                />
                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="8"
                  helperText="Desde la compra hasta la venta actual"
                  min={1}
                  max={50}
                />
                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo (€)"
                  placeholder="5000"
                  helperText="Figura en el recibo del IBI (solo la parte del suelo)"
                  min={0}
                />
                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción) (€)"
                  placeholder="12000"
                  helperText="También en el recibo del IBI. Sin este dato no puede compararse el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />
                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión inmobiliaria del vendedor (%)"
                  placeholder="3"
                  helperText="Típico: 3-5%. La paga el vendedor"
                  min={0}
                  max={10}
                />
              </div>

              {resultadosVendedor ? (
                <div className={styles.resultsInner}>
                  <ResultCard
                    title="Precio de venta"
                    value={formatCurrency(resultadosVendedor.precioVenta)}
                    variant="default"
                    icon="🏷️"
                  />
                  <ResultCard
                    title="Plusvalía municipal"
                    value={resultadosVendedor.exentoPlusvalia ? 'EXENTO' : formatCurrency(resultadosVendedor.plusvaliaMunicipal)}
                    variant={resultadosVendedor.exentoPlusvalia ? 'success' : 'warning'}
                    icon="🏛️"
                    description={resultadosVendedor.metodoPlusvalia}
                  />
                  {resultadosVendedor.valorAdquisicion > 0 && (
                    <>
                      <ResultCard
                        title="Valor de adquisición"
                        value={formatCurrency(resultadosVendedor.valorAdquisicion)}
                        variant="default"
                        icon="📥"
                        description="Precio de compra + impuestos y gastos de aquella compra"
                      />
                      <ResultCard
                        title="Valor de transmisión"
                        value={formatCurrency(resultadosVendedor.valorTransmision)}
                        variant="default"
                        icon="📤"
                        description="Precio de venta − comisión, gestoría y plusvalía municipal"
                      />
                    </>
                  )}
                  {resultadosVendedor.esPerdida ? (
                    <ResultCard
                      title="Pérdida patrimonial"
                      value={formatCurrency(Math.abs(resultadosVendedor.gananciaPatrimonial))}
                      variant="success"
                      icon="📉"
                      description="Vendes por debajo del valor de adquisición: no hay IRPF y la pérdida se puede compensar en la declaración"
                    />
                  ) : (
                    resultadosVendedor.gananciaPatrimonial > 0 && (
                      <ResultCard
                        title="Ganancia patrimonial"
                        value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                        variant="info"
                        icon="📈"
                        description="Base para IRPF"
                      />
                    )
                  )}
                  <ResultCard
                    title="IRPF sobre ganancia"
                    value={resultadosVendedor.irpfGanancia > 0 ? formatCurrency(resultadosVendedor.irpfGanancia) : 'SIN CUOTA'}
                    variant={resultadosVendedor.irpfGanancia > 0 ? 'warning' : 'success'}
                    icon="💸"
                    description="Tributación en base del ahorro (19%-30%)"
                  />
                  {resultadosVendedor.comisionInmobiliaria > 0 && (
                    <ResultCard
                      title={`Comisión inmobiliaria (${comisionInmobiliaria}%)`}
                      value={formatCurrency(resultadosVendedor.comisionInmobiliaria)}
                      variant="default"
                      icon="🏪"
                    />
                  )}
                  {resultadosVendedor.gastosGestoria > 0 && (
                    <ResultCard
                      title="Gastos de gestoría"
                      value={formatCurrency(resultadosVendedor.gastosGestoria)}
                      variant="default"
                      icon="📂"
                    />
                  )}
                  <div className={styles.separador} />
                  <ResultCard
                    title="Total gastos vendedor"
                    value={formatCurrency(resultadosVendedor.totalGastos)}
                    variant="warning"
                    icon="➖"
                  />
                  <ResultCard
                    title="IMPORTE NETO VENDEDOR"
                    value={formatCurrency(resultadosVendedor.netoVendedor)}
                    variant="highlight"
                    icon="💰"
                    description="Lo que realmente recibes tras gastos e impuestos"
                  />
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <span aria-hidden="true" className={styles.placeholderIcon}>📊</span>
                  <p>Introduce el precio de venta y los datos adicionales para calcular el neto del vendedor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="Todo lo que necesitas saber sobre la compraventa de garajes"
        subtitle="Diferencias fiscales con vivienda, cuándo pagar ITP o IVA, plusvalía municipal y consejos prácticos"
        icon="🚗"
      >
        {/* Tabla diferencias garaje vs vivienda */}
        <section className={styles.eduSection}>
          <h2>¿Qué diferencia fiscal hay entre un garaje y una vivienda?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Garaje / Plaza parking</th>
                  <th>Vivienda</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ITP segunda mano</td>
                  <td>Tipo general CCAA (igual)</td>
                  <td>Tipo general CCAA</td>
                </tr>
                <tr>
                  <td>IVA obra nueva</td>
                  <td>10% (residencial)</td>
                  <td>10% (residencial)</td>
                </tr>
                <tr>
                  <td>Tipos reducidos ITP</td>
                  <td>Sí (joven, discapacidad…)</td>
                  <td>Sí (joven, discapacidad…)</td>
                </tr>
                <tr>
                  <td>Plusvalía municipal vendedor</td>
                  <td>Sí (igual que vivienda)</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td>Exención IRPF mayor 65 años</td>
                  <td>NO (solo vivienda habitual)</td>
                  <td>Sí (vivienda habitual)</td>
                </tr>
                <tr>
                  <td>Reinversión vivienda habitual</td>
                  <td>NO aplica</td>
                  <td>Sí, puede eximir ganancia</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.notaTabla}>
            Nota: la exención de IRPF para mayores de 65 años solo se aplica a la vivienda habitual, NO a garajes o trasteros independientes.
          </p>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos habituales de compraventa de garaje</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>🚗</span>
                <span className={styles.casoTag}>Comprar garaje solo (segunda mano)</span>
              </div>
              <p>Luis compra una plaza de parking en Madrid por 25.000 €. Paga el ITP general de Madrid (6%), más notaría (~400 €), registro (~150 €) y gestoría (300 €). El coste total real asciende a ~27.350 €.</p>
              <div className={styles.casoResultado}>ITP + gastos = aprox. 10-12% del precio</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>🏗️</span>
                <span className={styles.casoTag}>Garaje de obra nueva con vivienda</span>
              </div>
              <p>Elena compra un piso nuevo con garaje incluido por 200.000 €. El conjunto tributa al 10% de IVA sobre el precio total. Si el garaje se escritura por separado (20.000 €) y está vinculado a la vivienda (máx. 2 plazas), el IVA del garaje es también el 10%. Si lo compra de forma independiente o en un edificio no residencial, el IVA sube al 21%.</p>
              <div className={styles.casoResultado}>IVA 10% (vinculado) o 21% (independiente) en garaje de obra nueva</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>💸</span>
                <span className={styles.casoTag}>Vender garaje con ganancia</span>
              </div>
              <p>Ana compró un garaje por 15.000 € hace 10 años y lo vende por 22.000 €. Debe pagar plusvalía municipal al ayuntamiento y tributar por la ganancia de 7.000 € en IRPF (base del ahorro: 19% los primeros 6.000 €, 21% el resto). Además abona la comisión si usa inmobiliaria.</p>
              <div className={styles.casoResultado}>Ganancia tributa: IRPF ahorro + plusvalía municipal</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span aria-hidden="true" className={styles.casoEmoji}>🎯</span>
                <span className={styles.casoTag}>Tipos reducidos de ITP para garaje</span>
              </div>
              <p>Carlos, 28 años, compra un garaje en Andalucía por 18.000 €. Al ser joven, puede aplicar el tipo reducido autonómico. El simulador detecta el tipo reducido disponible y lo aplica automáticamente al seleccionar "Joven" en el perfil del comprador.</p>
              <div className={styles.casoResultado}>Tipos reducidos: aplican igual que en vivienda residencial</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre compraventa de garaje</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Se puede comprar un garaje sin ser propietario de una vivienda?</h4>
              <p>Sí. En España no existe ninguna restricción legal que obligue al comprador de un garaje a ser propietario de una vivienda. Cualquier persona puede adquirir una plaza de parking de forma independiente. La única excepción son los garajes vinculados a una promoción específica donde el promotor exige comprarlo junto con la vivienda del mismo edificio.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué ITP paga un garaje de segunda mano?</h4>
              <p>El garaje tributa por el Impuesto de Transmisiones Patrimoniales (ITP) al mismo tipo que los inmuebles residenciales de su comunidad autónoma, que oscila entre el 4% (País Vasco) y el 11% (Cataluña, Comunidad Valenciana). El garaje se considera inmueble residencial y puede beneficiarse de tipos reducidos para jóvenes, familias numerosas o personas con discapacidad si los cumple.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Garaje nuevo o de segunda mano: qué impuesto se paga?</h4>
              <p>Un garaje de primera transmisión (nuevo, del promotor) paga IVA más AJD (entre 0,5% y 1,5% según la comunidad). El IVA es del 10% si el garaje va vinculado a la vivienda (máximo 2 plazas, mismo edificio y promotor) y del 21% si se adquiere de forma independiente o en un edificio de uso no residencial. Un garaje de segunda mano paga ITP al tipo general de la comunidad autónoma. No pueden coexistir ITP e IVA en la misma operación.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El vendedor de un garaje paga plusvalía municipal?</h4>
              <p>Sí. El vendedor debe pagar el Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (plusvalía municipal) al ayuntamiento donde esté ubicado el garaje. Desde 2021, puede elegir entre el método objetivo y el real, pagando el más favorable. Si vende por menos de lo que compró, puede quedar exento acreditando la pérdida.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Existen tipos reducidos de ITP para garajes?</h4>
              <p>Sí, en muchas comunidades autónomas los tipos reducidos aplicables a inmuebles residenciales también se pueden aplicar a garajes, siempre que el garaje se compre junto con o en el mismo acto que la vivienda, o cuando se cumplan los requisitos del comprador (edad, ingresos, discapacidad). Conviene consultar la normativa específica de tu comunidad, ya que los requisitos varían.</p>
            </div>
          </div>
        </section>

        {/* Consejos */}
        <section className={styles.eduSection}>
          <h2>Consejos prácticos para la compraventa de un garaje</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>🔍</span>
              <strong>Consulta el valor catastral antes de negociar</strong>
              <p>La base del ITP es el mayor entre el precio escriturado y el valor de referencia catastral. Si el catastral supera el precio de mercado, puedes pagar más ITP del esperado. Consulta en la Sede Electrónica del Catastro antes de firmar.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>📋</span>
              <strong>Verifica si la plaza está registrada independientemente</strong>
              <p>Asegúrate de que el garaje tiene referencia catastral y número de finca registral propios. Si no está inscrito por separado, puede haber complicaciones en la escrituración y en el pago de impuestos.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>📅</span>
              <strong>Liquida el ITP en el plazo legal</strong>
              <p>El ITP debe liquidarse en 30 días hábiles desde la firma de la escritura. El retraso genera recargos del 5% al 20% más intereses de demora. Planifica la liquidación desde el día de la firma.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcon}>👨‍💼</span>
              <strong>Consulta con asesor fiscal si hay ganancia significativa</strong>
              <p>Si la ganancia patrimonial al vender es importante, un asesor puede identificar gastos deducibles (reformas, mejoras documentadas) que reduzcan la base imponible del IRPF.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span aria-hidden="true" className={styles.warningIcon}>⚠️</span>
            <strong>Limitaciones de esta calculadora</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Estimaciones orientativas:</strong> Los importes reales pueden diferir según el valor de referencia catastral del inmueble, los coeficientes de plusvalía de cada municipio y los aranceles notariales concretos aplicados.</li>
            <li><strong>Sin exención IRPF por vivienda habitual:</strong> Esta calculadora no aplica la exención por reinversión en vivienda habitual ni la exención para mayores de 65 años, ya que estas exenciones aplican a vivienda, no a garajes independientes.</li>
            <li><strong>Tipos fiscales pueden cambiar:</strong> Los tipos de ITP, AJD e IVA corresponden a la normativa vigente indicada en el aviso de fuentes al inicio de la página. Verifica con tu comunidad autónoma antes de tomar decisiones.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-garaje')} />
      <ShareCard appName="simulador-gastos-compraventa-garaje" />
      <Footer appName="simulador-gastos-compraventa-garaje" />
    </div>
  );
}
