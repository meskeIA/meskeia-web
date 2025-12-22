'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorCompraventa.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, NumberInput, ResultCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularIVA,
  calcularAJD,
  calcularNotario,
  calcularRegistro,
  calcularPlusvaliaMunicipal,
  ENLACE_CATASTRO,
} from '@/data/itp-ccaa';

// ===== TIPOS =====
type TipoInmueble = 'vivienda' | 'garaje' | 'trastero';
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad' | 'vpo';

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  ajd: number;
  gastosNotario: number;
  gastosRegistro: number;
  comisionInmobiliaria: number;
  gastosGestoria: number;
  totalGastos: number;
  totalOperacion: number;
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
  gananciaPatrimonial: number;
  irpfGanancia: number;
  exentoIRPF: boolean;
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

const TIPOS_INMUEBLE: { value: TipoInmueble; label: string; icon: string }[] = [
  { value: 'vivienda', label: 'Vivienda', icon: '🏠' },
  { value: 'garaje', label: 'Garaje/Parking', icon: '🚗' },
  { value: 'trastero', label: 'Trastero', icon: '📦' },
];

const PERFILES_COMPRADOR: { value: PerfilComprador; label: string }[] = [
  { value: 'general', label: 'General (sin bonificaciones)' },
  { value: 'joven', label: 'Joven (< 35 años)' },
  { value: 'familia-numerosa', label: 'Familia numerosa' },
  { value: 'discapacidad', label: 'Persona con discapacidad' },
  { value: 'vpo', label: 'Vivienda de Protección Oficial' },
];

// Tramos IRPF para ganancias patrimoniales 2024
const TRAMOS_IRPF_AHORRO = [
  { hasta: 6000, tipo: 19 },
  { hasta: 50000, tipo: 21 },
  { hasta: 200000, tipo: 23 },
  { hasta: 300000, tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

export default function SimuladorCompraventaPage() {
  // Estado del formulario
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoInmueble, setTipoInmueble] = useState<TipoInmueble>('vivienda');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [perfilComprador, setPerfilComprador] = useState<PerfilComprador>('general');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');
  const [gastosGestoria, setGastosGestoria] = useState('300');

  // Datos del vendedor (para plusvalía)
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [vendedorMayor65, setVendedorMayor65] = useState(false);
  const [esViviendaHabitual, setEsViviendaHabitual] = useState(true);

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (precio <= 0) return null;

    const comisionPct = parseSpanishNumber(comisionInmobiliaria) / 100;
    const gestoria = parseSpanishNumber(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;

    if (tipoTransmision === 'primera-mano') {
      // IVA para vivienda nueva
      impuesto = calcularIVA(precio, tipoInmueble);
      tipoImpuesto = 'IVA';
      porcentaje = tipoInmueble === 'vivienda' || tipoInmueble === 'garaje' || tipoInmueble === 'trastero' ? 10 : 21;
    } else {
      // ITP para segunda mano
      const datosCcaa = ITP_CCAA[ccaa];

      // Buscar tipo reducido si aplica
      let tipoAplicable = datosCcaa.tipoGeneral;
      if (perfilComprador !== 'general' && datosCcaa.tiposReducidos.length > 0) {
        const reducido = datosCcaa.tiposReducidos.find(r => {
          if (perfilComprador === 'joven' && r.nombre.toLowerCase().includes('joven')) return true;
          if (perfilComprador === 'familia-numerosa' && r.nombre.toLowerCase().includes('familia')) return true;
          if (perfilComprador === 'discapacidad' && r.nombre.toLowerCase().includes('discapacidad')) return true;
          if (perfilComprador === 'vpo' && r.nombre.toLowerCase().includes('vpo')) return true;
          return false;
        });
        if (reducido) {
          // Verificar si cumple límite de valor
          if (!reducido.valorMaximo || precio <= reducido.valorMaximo) {
            tipoAplicable = reducido.tipo;
          }
        }
      }

      impuesto = calcularITP(precio, ccaa, tipoAplicable);
      tipoImpuesto = 'ITP';
      porcentaje = tipoAplicable;
    }

    // AJD (solo si es primera mano, ya está incluido en ITP para segunda mano)
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;

    const notario = calcularNotario(precio);
    const registro = calcularRegistro(precio);
    const comision = precio * comisionPct;

    const totalGastos = impuesto + ajd + notario + registro + comision + gestoria;

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      ajd,
      gastosNotario: notario,
      gastosRegistro: registro,
      comisionInmobiliaria: comision,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
    };
  }, [precioVenta, ccaa, tipoInmueble, tipoTransmision, perfilComprador, comisionInmobiliaria, gastosGestoria]);

  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    const anios = parseInt(aniosPropiedad) || 0;
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);

    if (precioV <= 0) return null;

    const comisionPct = parseSpanishNumber(comisionInmobiliaria) / 100;
    const gestoria = parseSpanishNumber(gastosGestoria);
    const comision = precioV * comisionPct;

    // Plusvalía municipal
    let plusvalia = 0;
    let metodoPlusvalia = 'No calculada';
    let exentoPlusvalia = false;

    if (valorSuelo > 0 && anios > 0 && precioC > 0) {
      const resultadoPlusvalia = calcularPlusvaliaMunicipal({
        valorCatastralSuelo: valorSuelo,
        aniosPropiedad: anios,
        precioCompra: precioC,
        precioVenta: precioV,
      });

      plusvalia = resultadoPlusvalia.recomendado;
      exentoPlusvalia = resultadoPlusvalia.exento;
      metodoPlusvalia = resultadoPlusvalia.exento
        ? 'Exento (sin ganancia)'
        : resultadoPlusvalia.metodoReal < resultadoPlusvalia.metodoObjetivo
          ? 'Método real (más favorable)'
          : 'Método objetivo';
    }

    // Ganancia patrimonial para IRPF
    const ganancia = precioC > 0 ? Math.max(0, precioV - precioC - comision - gestoria) : 0;

    // Exención IRPF para mayores de 65 años con vivienda habitual
    const exentoIRPF = vendedorMayor65 && esViviendaHabitual;

    // Calcular IRPF sobre ganancia patrimonial
    let irpf = 0;
    if (ganancia > 0 && !exentoIRPF) {
      let gananciaRestante = ganancia;
      let limiteAnterior = 0;
      for (const tramo of TRAMOS_IRPF_AHORRO) {
        const baseTramo = Math.min(gananciaRestante, tramo.hasta - limiteAnterior);
        if (baseTramo <= 0) break;
        irpf += baseTramo * (tramo.tipo / 100);
        gananciaRestante -= baseTramo;
        limiteAnterior = tramo.hasta;
      }
    }

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
      gananciaPatrimonial: ganancia,
      irpfGanancia: irpf,
      exentoIRPF,
    };
  }, [precioVenta, precioCompraOriginal, aniosPropiedad, valorCatastralSuelo, comisionInmobiliaria, gastosGestoria, vendedorMayor65, esViviendaHabitual]);

  const datosCcaaActual = ITP_CCAA[ccaa];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🏠</span>
        <h1 className={styles.title}>Simulador de Compraventa Inmobiliaria</h1>
        <p className={styles.subtitle}>
          Calcula todos los gastos de compra y venta de vivienda, garaje o trastero en España.
          ITP/IVA por comunidad autónoma, notaría, registro y plusvalía municipal.
        </p>
      </header>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>📋 Datos de la operación</h2>

          {/* Tipo de inmueble */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de inmueble</label>
            <div className={styles.tipoInmuebleGrid}>
              {TIPOS_INMUEBLE.map(tipo => (
                <button
                  key={tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon}>{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de transmisión</label>
            <div className={styles.transmisionGrid}>
              <button
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
              >
                <span className={styles.transmisionIcon}>🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
              >
                <span className={styles.transmisionIcon}>🆕</span>
                <span>Primera mano</span>
                <span className={styles.transmisionSub}>Paga IVA</span>
              </button>
            </div>
          </div>

          {/* Precio de venta */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio de venta del inmueble"
            placeholder="200000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor)"
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Comunidad Autónoma (ubicación del inmueble)</label>
            <select
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
              <span className={styles.infoCcaaIcon}>📍</span>
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
                ⚠️ Esta comunidad aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>{datosCcaaActual.notas}</p>
          </div>

          {/* Perfil del comprador (solo para ITP) */}
          {tipoTransmision === 'segunda-mano' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Perfil del comprador (para tipos reducidos)</label>
              <select
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
                        <strong>{tr.tipo}%</strong> - {tr.nombre}
                        {tr.valorMaximo && <span className={styles.limite}> (máx. {formatCurrency(tr.valorMaximo)})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gastos adicionales */}
          <div className={styles.gastosGrid}>
            <NumberInput
              value={comisionInmobiliaria}
              onChange={setComisionInmobiliaria}
              label="Comisión inmobiliaria (%)"
              placeholder="3"
              helperText="Típico: 3-5%"
              min={0}
              max={10}
            />
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría (€)"
              placeholder="300"
              helperText="Típico: 200-400€"
              min={0}
            />
          </div>

          {/* Enlace a Catastro */}
          <div className={styles.enlaceCatastro}>
            <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer" className={styles.catastroLink}>
              🔗 Consultar valor de referencia catastral en la Sede del Catastro
            </a>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {/* Pestañas */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${pestanaActiva === 'comprador' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('comprador')}
            >
              🛒 Comprador
            </button>
            <button
              className={`${styles.tab} ${pestanaActiva === 'vendedor' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('vendedor')}
            >
              💰 Vendedor
            </button>
          </div>

          {/* Resultados Comprador */}
          {pestanaActiva === 'comprador' && (
            <div className={styles.resultados}>
              {resultadosComprador ? (
                <>
                  <ResultCard
                    title="Precio del inmueble"
                    value={formatCurrency(resultadosComprador.precioInmueble)}
                    variant="default"
                    icon="🏠"
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

                  {resultadosComprador.comisionInmobiliaria > 0 && (
                    <ResultCard
                      title={`Comisión inmobiliaria (${comisionInmobiliaria}%)`}
                      value={formatCurrency(resultadosComprador.comisionInmobiliaria)}
                      variant="default"
                      icon="🏪"
                    />
                  )}

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
                    description={`${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio`}
                  />

                  <ResultCard
                    title="COSTE TOTAL DE ADQUISICIÓN"
                    value={formatCurrency(resultadosComprador.totalOperacion)}
                    variant="highlight"
                    icon="💳"
                    description="Precio + todos los gastos"
                  />
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon}>📊</span>
                  <p>Introduce el precio del inmueble para ver el desglose de gastos del comprador</p>
                </div>
              )}
            </div>
          )}

          {/* Resultados Vendedor */}
          {pestanaActiva === 'vendedor' && (
            <div className={styles.resultados}>
              {/* Formulario adicional vendedor */}
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos para calcular plusvalía e IRPF</h3>

                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original"
                  placeholder="150000"
                  helperText="Lo que pagaste cuando compraste"
                  min={0}
                />

                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="10"
                  helperText="Desde la compra hasta ahora"
                  min={1}
                  max={50}
                />

                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo"
                  placeholder="50000"
                  helperText="Aparece en el recibo del IBI (solo la parte del suelo)"
                  min={0}
                />

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={esViviendaHabitual}
                      onChange={(e) => setEsViviendaHabitual(e.target.checked)}
                    />
                    <span>Es mi vivienda habitual</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={vendedorMayor65}
                      onChange={(e) => setVendedorMayor65(e.target.checked)}
                    />
                    <span>Soy mayor de 65 años</span>
                  </label>
                </div>
              </div>

              {resultadosVendedor ? (
                <>
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

                  {resultadosVendedor.gananciaPatrimonial > 0 && (
                    <ResultCard
                      title="Ganancia patrimonial"
                      value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                      variant="info"
                      icon="📈"
                      description="Base para IRPF"
                    />
                  )}

                  <ResultCard
                    title="IRPF sobre ganancia"
                    value={resultadosVendedor.exentoIRPF ? 'EXENTO' : formatCurrency(resultadosVendedor.irpfGanancia)}
                    variant={resultadosVendedor.exentoIRPF ? 'success' : 'warning'}
                    icon="💸"
                    description={resultadosVendedor.exentoIRPF ? 'Mayor de 65 años + vivienda habitual' : 'Tributación en base del ahorro'}
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
                    description="Lo que realmente recibes"
                  />
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon}>📊</span>
                  <p>Introduce el precio de venta y los datos adicionales para calcular el neto del vendedor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona <strong>estimaciones orientativas</strong>. Los importes reales pueden variar según:
        </p>
        <ul>
          <li>El <strong>valor de referencia catastral</strong> (base mínima imponible desde 2022)</li>
          <li>Condiciones específicas de tu situación personal</li>
          <li>Coeficientes de plusvalía de cada municipio</li>
          <li>Aranceles notariales que pueden variar según la complejidad</li>
        </ul>
        <p>
          <strong>Consulta con un profesional</strong> (notario, asesor fiscal) antes de tomar decisiones.
          Los datos de ITP por comunidad están actualizados a diciembre 2024.
        </p>
        <p>
          <strong>Exención de plusvalía en IRPF:</strong> Los mayores de 65 años que venden su vivienda habitual
          están exentos de tributar por la ganancia patrimonial en IRPF.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los gastos de compraventa?"
        subtitle="Descubre qué impuestos se pagan, cómo funcionan los aranceles y las bonificaciones disponibles"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Impuestos en la compraventa inmobiliaria</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔄 Segunda mano → ITP</h4>
              <p>
                El <strong>Impuesto de Transmisiones Patrimoniales</strong> grava las compras de inmuebles de segunda mano.
                Cada comunidad autónoma fija su propio tipo, que va del 4% (País Vasco) al 11% (Cataluña, Valencia).
              </p>
              <p>
                La base imponible es el <strong>mayor valor</strong> entre el precio escriturado y el valor de referencia catastral.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🆕 Primera mano → IVA + AJD</h4>
              <p>
                Las viviendas nuevas (primera transmisión del promotor) pagan <strong>IVA al 10%</strong> (21% para locales y naves).
              </p>
              <p>
                Además, se paga <strong>AJD</strong> (Actos Jurídicos Documentados) que varía entre 0,5% y 1,5% según la comunidad.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🏛️ Plusvalía municipal</h4>
              <p>
                El vendedor debe pagar el <strong>Impuesto sobre el Incremento del Valor de los Terrenos</strong> (plusvalía municipal).
              </p>
              <p>
                Desde 2021, puede elegir entre el método <strong>objetivo</strong> (tradicional) o el <strong>real</strong> (plusvalía efectiva),
                pagando el que resulte más favorable.
              </p>
              <p>
                <strong>Si no hay ganancia, no se paga</strong> (sentencia del Tribunal Constitucional).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>💰 IRPF del vendedor</h4>
              <p>
                La ganancia patrimonial (diferencia entre precio de venta y compra) tributa en la <strong>base del ahorro</strong>
                con tipos del 19% al 28% según el importe.
              </p>
              <p>
                <strong>Exención total</strong> para mayores de 65 años que venden su vivienda habitual.
              </p>
            </div>
          </div>

          <h2>Tipos reducidos de ITP</h2>
          <p className={styles.introParagraph}>
            Muchas comunidades ofrecen tipos reducidos para determinados colectivos:
          </p>
          <ul className={styles.listaReducidos}>
            <li><strong>Jóvenes</strong> (generalmente menores de 35-36 años)</li>
            <li><strong>Familias numerosas</strong></li>
            <li><strong>Personas con discapacidad</strong> (≥33% o ≥65%)</li>
            <li><strong>VPO</strong> (Vivienda de Protección Oficial)</li>
            <li><strong>Municipios con despoblación</strong></li>
            <li><strong>Víctimas de violencia de género</strong></li>
          </ul>
          <p>
            Cada comunidad tiene sus propios requisitos y límites de valor del inmueble.
            Consulta la normativa específica de tu comunidad.
          </p>

          <h2>Gastos de notaría y registro</h2>
          <p className={styles.introParagraph}>
            Los aranceles están regulados por ley (Real Decreto 1426/1989 y 1427/1989) y se calculan
            según el valor del inmueble con una escala progresiva.
          </p>
          <ul>
            <li><strong>Notaría:</strong> Entre 600€ y 1.500€ para inmuebles típicos (+ 21% IVA)</li>
            <li><strong>Registro:</strong> Entre 200€ y 600€ (+ 21% IVA)</li>
            <li><strong>Gestoría:</strong> Opcional, entre 200€ y 400€ (tramitación de documentos)</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-compraventa-inmueble')} />
      <Footer appName="simulador-compraventa-inmueble" />
    </div>
  );
}
