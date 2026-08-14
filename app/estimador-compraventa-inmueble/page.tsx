'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorCompraventa.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, NumberInput, ResultCard, LegalNotice, DisclaimerCard, DataReference, ShareCard, RegionBadge } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { FISCAL_INMUEBLES_META, calcularGananciaInmueble } from '@/data/fiscal';
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
type TipoInmueble = 'vivienda' | 'garaje' | 'trastero' | 'local' | 'nave' | 'terreno';
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad' | 'vpo';

// Inmuebles que pueden optar a tipos reducidos de ITP (solo residenciales)
const INMUEBLES_RESIDENCIALES: TipoInmueble[] = ['vivienda', 'garaje', 'trastero'];

// Normaliza tildes para comparar nombres de tipos reducidos (ej: "Jóvenes" → "jovenes")
const normalizarTexto = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

interface ResultadosComprador {
  precioInmueble: number;
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
  otrosGastosVenta: number;
  totalGastos: number;
  netoVendedor: number;
  valorAdquisicion: number;
  valorTransmision: number;
  gananciaPatrimonial: number;
  esPerdida: boolean;
  baseImponibleIRPF: number;
  irpfGanancia: number;
  exentoIRPF: boolean;
  motivoExencion: string | null;
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

// El grupo determina la jerarquía VISUAL del selector, no la fiscal: la vivienda es
// el caso principal de esta calculadora y ocupa su propio bloque; el resto se ofrece
// como alcance secundario con derivación a su app especializada.
const TIPOS_INMUEBLE: { value: TipoInmueble; label: string; icon: string; grupo: 'principal' | 'anejo' | 'comercial' }[] = [
  { value: 'vivienda', label: 'Vivienda (piso o casa)', icon: '🏠', grupo: 'principal' },
  // Anejos residenciales (IVA 10% si se transmiten con la vivienda)
  { value: 'garaje', label: 'Garaje/Parking', icon: '🚗', grupo: 'anejo' },
  { value: 'trastero', label: 'Trastero', icon: '📦', grupo: 'anejo' },
  // Comerciales/Industriales y suelo (IVA 21%)
  { value: 'local', label: 'Local comercial', icon: '🏪', grupo: 'comercial' },
  { value: 'nave', label: 'Nave industrial', icon: '🏭', grupo: 'comercial' },
  { value: 'terreno', label: 'Terreno', icon: '🌍', grupo: 'comercial' },
];

/**
 * Derivación a la calculadora especializada de cada tipo.
 *
 * Este estimador es el hub del clúster y cubre el caso general, pero cada tipo de
 * inmueble tiene ramas fiscales que aquí se simplifican (renuncia a la exención de
 * IVA, exención del suelo rústico, IVA del anejo independiente…). En lugar de
 * duplicar esas ramas, se avisa del matiz y se enlaza a la app que sí lo calcula.
 */
const DERIVACIONES: Partial<Record<TipoInmueble, { url: string; nombre: string; matiz: string }[]>> = {
  garaje: [{
    url: '/simulador-gastos-compraventa-garaje/',
    nombre: 'Simulador de gastos de compraventa de garaje',
    matiz: 'en obra nueva distingue el garaje transmitido con la vivienda (IVA 10%, hasta 2 plazas) del garaje independiente (IVA 21%). Aquí se aplica siempre el 10%.',
  }],
  trastero: [{
    url: '/simulador-gastos-compraventa-trastero/',
    nombre: 'Simulador de gastos de compraventa de trastero',
    matiz: 'en obra nueva distingue el trastero transmitido con la vivienda (IVA 10%) del trastero independiente (IVA 21%). Aquí se aplica siempre el 10%.',
  }],
  local: [{
    url: '/simulador-gastos-compraventa-local-comercial/',
    nombre: 'Simulador de gastos de compra de local comercial',
    matiz: 'contempla la renuncia a la exención de IVA con inversión del sujeto pasivo (art. 20.Dos LIVA) cuando comprador y vendedor son empresarios con derecho a deducción. Aquí la segunda mano se calcula siempre por ITP.',
  }],
  nave: [{
    url: '/simulador-gastos-compraventa-nave-industrial/',
    nombre: 'Simulador de gastos de compra de nave industrial',
    matiz: 'contempla la renuncia a la exención de IVA con inversión del sujeto pasivo (art. 20.Dos LIVA) entre empresarios. Aquí la segunda mano se calcula siempre por ITP.',
  }],
  terreno: [
    {
      url: '/simulador-gastos-compraventa-terreno-rustico/',
      nombre: 'Simulador de gastos de compra de finca rústica',
      matiz: 'el suelo rústico está exento de IVA (art. 20.Uno.20º LIVA): paga ITP incluso cuando el vendedor es un empresario, y no genera plusvalía municipal, porque el IIVTNU solo grava suelo urbano.',
    },
    {
      url: '/simulador-gastos-compraventa-solar/',
      nombre: 'Simulador de gastos de compra de solar',
      matiz: 'en el suelo edificable el impuesto depende de quién vende: IVA 21% + AJD si vende un promotor o empresario, ITP si vende un particular.',
    },
  ],
};

const PERFILES_COMPRADOR: { value: PerfilComprador; label: string }[] = [
  { value: 'general', label: 'General (sin bonificaciones)' },
  { value: 'joven', label: 'Joven (< 35 años)' },
  { value: 'familia-numerosa', label: 'Familia numerosa' },
  { value: 'discapacidad', label: 'Persona con discapacidad' },
  { value: 'vpo', label: 'Vivienda de Protección Oficial' },
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
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [vendedorMayor65, setVendedorMayor65] = useState(false);
  const [esViviendaHabitual, setEsViviendaHabitual] = useState(true);

  // Datos del vendedor que corrigen el valor de adquisición (art. 35.1 LIRPF)
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [mejoras, setMejoras] = useState('');
  const [otrosGastosVenta, setOtrosGastosVenta] = useState('');

  // Exención por reinversión en vivienda habitual (art. 38 LIRPF)
  const [reinvierte, setReinvierte] = useState(false);
  const [importeReinversion, setImporteReinversion] = useState('');
  const [hipotecaPendiente, setHipotecaPendiente] = useState('');

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (precio <= 0) return null;

    const gestoria = parseSpanishNumber(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    /** Qué tipo de ITP se ha aplicado y cuáles NO se han podido comprobar */
    let tipoElegido: TipoElegido | null = null;

    // Determinar si es inmueble residencial (para IVA y tipos reducidos)
    const esResidencial = INMUEBLES_RESIDENCIALES.includes(tipoInmueble);

    if (tipoTransmision === 'primera-mano') {
      // IVA: 10% residencial, 21% comercial/industrial/terrenos
      tipoImpuesto = 'IVA';
      porcentaje = esResidencial ? 10 : 21;
      impuesto = precio * (porcentaje / 100);
    } else {
      // ITP para segunda mano
      const datosCcaa = ITP_CCAA[ccaa];

      // Los tipos reducidos exigen condiciones que hay que comprobar una a una: antes se
      // aplicaba el primero que casara por nombre mirando solo su valorMaximo, y en Madrid
      // eso daba un ITP del 0 % por un tipo reservado a municipios de menos de 2.500
      // habitantes que la app no pregunta. `viviendaHabitual` solo se da por cierta en
      // inmuebles residenciales; en local, nave o terreno esa condición no se cumple.
      const elegido = elegirTipoITP(ccaa, perfilComprador, precio, {
        viviendaHabitual: esResidencial,
      });
      tipoElegido = elegido;
      impuesto = calcularITP(precio, ccaa, elegido.tipo);
      tipoImpuesto = 'ITP';
      porcentaje = elegido.tipo;
    }

    // AJD: Solo aplica en primera mano (junto con IVA). En segunda mano se paga ITP, no AJD
    // El AJD en segunda mano solo aplicaría sobre la escritura de hipoteca (no sobre la compraventa)
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;

    const notario = calcularNotario(precio);
    const registro = calcularRegistro(precio);
    // Nota: La comisión inmobiliaria la paga el vendedor, no el comprador

    const totalGastos = impuesto + ajd + notario + registro + gestoria;

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      ajd,
      gastosNotario: notario,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
      tipoElegido,
    };
  }, [precioVenta, ccaa, tipoInmueble, tipoTransmision, perfilComprador, gastosGestoria]);

  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    const anios = parseInt(aniosPropiedad) || 0;
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);
    const valorTotal = parseSpanishNumber(valorCatastralTotal);

    if (precioV <= 0) return null;

    const comisionPct = parseSpanishNumber(comisionInmobiliaria) / 100;
    const gestoria = parseSpanishNumber(gastosGestoria);
    const otrosVenta = parseSpanishNumber(otrosGastosVenta);
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

    // Ganancia patrimonial e IRPF: motor único del art. 35 LIRPF. La plusvalía
    // municipal y los gastos de venta minoran el valor de transmisión; los impuestos
    // y gastos de la compra en su día lo suman al valor de adquisición.
    const exentoIRPF = vendedorMayor65 && esViviendaHabitual;
    const puedeReinvertir = esViviendaHabitual && reinvierte && !exentoIRPF;

    const g = calcularGananciaInmueble({
      precioVenta: precioV,
      precioCompra: precioC,
      gastosAdquisicion: parseSpanishNumber(gastosAdquisicion),
      mejoras: parseSpanishNumber(mejoras),
      gastosTransmision: comision + gestoria + otrosVenta,
      plusvaliaMunicipal: plusvalia,
      exentoPorEdad: exentoIRPF,
      reinversion: puedeReinvertir
        ? {
            importeReinvertido: parseSpanishNumber(importeReinversion),
            principalPendiente: parseSpanishNumber(hipotecaPendiente),
          }
        : undefined,
    });

    // Sin precio de compra no hay ganancia que calcular (el IRPF queda a 0)
    const hayDatosGanancia = precioC > 0;
    const irpf = hayDatosGanancia ? g.cuotaIRPF : 0;

    const totalGastos = plusvalia + comision + gestoria + otrosVenta + irpf;
    const neto = precioV - totalGastos;

    return {
      precioVenta: precioV,
      plusvaliaMunicipal: plusvalia,
      metodoPlusvalia,
      exentoPlusvalia,
      comisionInmobiliaria: comision,
      gastosGestoria: gestoria,
      otrosGastosVenta: otrosVenta,
      totalGastos,
      netoVendedor: neto,
      valorAdquisicion: hayDatosGanancia ? g.valorAdquisicion : 0,
      valorTransmision: g.valorTransmision,
      gananciaPatrimonial: hayDatosGanancia ? g.ganancia : 0,
      esPerdida: hayDatosGanancia && g.esPerdida,
      baseImponibleIRPF: hayDatosGanancia ? g.baseImponible : 0,
      irpfGanancia: irpf,
      exentoIRPF,
      motivoExencion: hayDatosGanancia ? g.motivoExencion : null,
    };
  }, [precioVenta, precioCompraOriginal, aniosPropiedad, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, gastosGestoria, otrosGastosVenta, gastosAdquisicion, mejoras, vendedorMayor65, esViviendaHabitual, reinvierte, importeReinversion, hipotecaPendiente]);

  /**
   * Estima los impuestos y gastos que el vendedor pagó al comprar el inmueble, para
   * que no tenga que buscarlos en una escritura de hace años. Usa el mismo motor que
   * la pestaña Comprador (ITP del tipo general de la CCAA + notaría + registro),
   * aplicado sobre el precio de compra original.
   */
  const estimarGastosAdquisicion = () => {
    const precioC = parseSpanishNumber(precioCompraOriginal);
    if (precioC <= 0) return;
    const itp = calcularITP(precioC, ccaa, ITP_CCAA[ccaa].tipoGeneral);
    const estimado = itp + calcularNotario(precioC) + calcularRegistro(precioC);
    setGastosAdquisicion(formatNumber(estimado, 0));
  };

  const datosCcaaActual = ITP_CCAA[ccaa];
  const esInmuebleResidencial = INMUEBLES_RESIDENCIALES.includes(tipoInmueble);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏠</span>
        <h1 className={styles.title}>Estimador de Gastos de Compraventa de Vivienda</h1>
        <p className={styles.subtitle}>
          Cuánto cuesta comprar o vender un piso o una casa en España: ITP o IVA por comunidad autónoma,
          notaría, registro, plusvalía municipal e IRPF del vendedor.
        </p>
        <p className={styles.subtitleSecundario}>
          También te orienta sobre garaje, trastero, local comercial, nave industrial y terreno, con enlace
          a la calculadora especializada de cada uno.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal - CRÍTICO */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="estimador-compraventa-inmueble"
        collapsible={false}
      />
      <DataReference
        normativa={`ITP/AJD ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={FISCAL_INMUEBLES_META.nota}
      />

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>📋 Datos de la operación</h2>

          {/* Tipo de inmueble */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de inmueble</label>
            <div className={styles.tipoInmuebleGrid}>
              {/* Caso principal: la vivienda, a ancho completo */}
              {TIPOS_INMUEBLE.filter(t => t.grupo === 'principal').map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  aria-pressed={tipoInmueble === tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${styles.tipoPrincipal} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}

              <span className={styles.tipoSeparador}>Anejos de la vivienda</span>
              {TIPOS_INMUEBLE.filter(t => t.grupo === 'anejo').map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  aria-pressed={tipoInmueble === tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${styles.tipoAnejo} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}

              <span className={styles.tipoSeparador}>Comercial, industrial y suelo</span>
              {TIPOS_INMUEBLE.filter(t => t.grupo === 'comercial').map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  aria-pressed={tipoInmueble === tipo.value}
                  className={`${styles.tipoInmuebleBtn} ${tipoInmueble === tipo.value ? styles.active : ''}`}
                  onClick={() => setTipoInmueble(tipo.value)}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </button>
              ))}
            </div>

            {/* Derivación a la calculadora especializada del tipo elegido */}
            {DERIVACIONES[tipoInmueble] && (
              <div className={styles.derivacionBox}>
                <p className={styles.derivacionTitulo}>
                  <span aria-hidden="true">🎯</span> Hay una calculadora específica para este caso
                </p>
                <ul className={styles.derivacionLista}>
                  {DERIVACIONES[tipoInmueble]!.map(d => (
                    <li key={d.url}>
                      <a href={d.url} className={styles.derivacionEnlace}>{d.nombre}</a>: {d.matiz}
                    </li>
                  ))}
                </ul>
                <p className={styles.derivacionPie}>
                  Este estimador te da el orden de magnitud del caso general. Para la operación
                  concreta, usa la calculadora especializada.
                </p>
              </div>
            )}
          </div>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de transmisión</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"
                aria-pressed={tipoTransmision === 'segunda-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                type="button"
                aria-pressed={tipoTransmision === 'primera-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Primera mano</span>
                <span className={styles.transmisionSub}>Paga IVA</span>
              </button>
            </div>
          </div>

          {/* Precio de venta */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label={tipoInmueble === 'vivienda' ? 'Precio de la vivienda' : 'Precio del inmueble'}
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

          {/* Perfil del comprador (solo para ITP y solo inmuebles residenciales) */}
          {tipoTransmision === 'segunda-mano' && esInmuebleResidencial && (
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

          {/* Gastos adicionales comprador */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="300"
              helperText="Típico: 200-400€ (tramitación de escrituras)"
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
              type="button"
              aria-pressed={pestanaActiva === 'comprador'}
              className={`${styles.tab} ${pestanaActiva === 'comprador' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('comprador')}
            >
              <span aria-hidden="true">🛒</span> Comprador
            </button>
            <button
              type="button"
              aria-pressed={pestanaActiva === 'vendedor'}
              className={`${styles.tab} ${pestanaActiva === 'vendedor' ? styles.active : ''}`}
              onClick={() => setPestanaActiva('vendedor')}
            >
              <span aria-hidden="true">💰</span> Vendedor
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
                  {resultadosComprador.tipoElegido && resultadosComprador.tipoElegido.noComprobables.length > 0 && (
                    <div className={styles.avisoReducidos} role="note">
                      <p className={styles.avisoReducidosTitulo}>
                        <span aria-hidden="true">💡</span> Podrías pagar menos, pero depende de requisitos que no preguntamos
                      </p>
                      <p className={styles.avisoReducidosTexto}>
                        El cálculo usa el tipo general porque no podemos comprobar tu situación.
                        En {datosCcaaActual.nombre} existe:
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
                        Comprueba los requisitos con la oficina liquidadora de tu comunidad antes de contar con la rebaja: la mayoría exigen que sea tu vivienda habitual, y algunos añaden límites de renta, superficie o municipio.
                      </p>
                    </div>
                  )}
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

                {/* La plusvalía municipal (IIVTNU) solo grava el suelo urbano */}
                {tipoInmueble === 'terreno' && (
                  <p className={styles.derivacionPie} role="note">
                    <span aria-hidden="true">⚠️</span> La plusvalía municipal que se calcula aquí
                    solo procede si el terreno es <strong>suelo urbano o urbanizable</strong>. La
                    venta de una <strong>finca rústica no genera IIVTNU</strong>, aunque sí tributa
                    en el IRPF del vendedor. Para ese caso usa el{' '}
                    <a href="/simulador-gastos-compraventa-terreno-rustico/" className={styles.derivacionEnlace}>
                      simulador de finca rústica
                    </a>.
                  </p>
                )}

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

                <div className={styles.campoConAccion}>
                  <NumberInput
                    value={gastosAdquisicion}
                    onChange={setGastosAdquisicion}
                    label="Impuestos y gastos que pagaste al comprar"
                    placeholder="20000"
                    helperText="ITP o IVA, notaría, registro y gestoría de aquella compra. Suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                    min={0}
                  />
                  <button
                    type="button"
                    className={styles.btnEstimar}
                    onClick={estimarGastosAdquisicion}
                    disabled={parseSpanishNumber(precioCompraOriginal) <= 0}
                  >
                    <span aria-hidden="true">✨</span> Estimar por mí
                  </button>
                </div>

                <NumberInput
                  value={mejoras}
                  onChange={setMejoras}
                  label="Inversiones y mejoras (opcional)"
                  placeholder="0"
                  helperText="Ampliaciones o instalaciones nuevas con factura. No cuentan pintura, sustituciones ni reparaciones de conservación"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo"
                  placeholder="50000"
                  helperText="Aparece en el recibo del IBI (solo la parte del suelo)"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción)"
                  placeholder="120000"
                  helperText="También en el recibo del IBI. Sin este dato no se puede comparar el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />

                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión inmobiliaria (%)"
                  placeholder="3"
                  helperText="Típico: 3-5%. La paga el vendedor"
                  min={0}
                  max={10}
                />

                <NumberInput
                  value={otrosGastosVenta}
                  onChange={setOtrosGastosVenta}
                  label="Otros gastos de la venta (opcional)"
                  placeholder="0"
                  helperText="Certificado energético, cédula de habitabilidad, cancelación registral de la hipoteca"
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
                  {esViviendaHabitual && !vendedorMayor65 && (
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={reinvierte}
                        onChange={(e) => setReinvierte(e.target.checked)}
                      />
                      <span>Voy a reinvertir en otra vivienda habitual</span>
                    </label>
                  )}
                </div>

                {esViviendaHabitual && reinvierte && !vendedorMayor65 && (
                  <>
                    <NumberInput
                      value={importeReinversion}
                      onChange={setImporteReinversion}
                      label="Importe que reinviertes en la nueva vivienda"
                      placeholder="250000"
                      helperText="Tienes 2 años para hacerlo. Si reinviertes todo lo obtenido, la ganancia queda exenta por completo"
                      min={0}
                    />
                    <NumberInput
                      value={hipotecaPendiente}
                      onChange={setHipotecaPendiente}
                      label="Hipoteca pendiente de la vivienda que vendes"
                      placeholder="0"
                      helperText="Se resta del importe obtenido a efectos de la reinversión, así que reinvertir el resto ya basta para la exención total (art. 41 RIRPF)"
                      min={0}
                    />
                  </>
                )}
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

                  {resultadosVendedor.valorAdquisicion > 0 && (
                    <ResultCard
                      title="Valor de adquisición"
                      value={formatCurrency(resultadosVendedor.valorAdquisicion)}
                      variant="default"
                      icon="📥"
                      description="Precio de compra + impuestos y gastos de aquella compra + mejoras"
                    />
                  )}

                  {resultadosVendedor.valorAdquisicion > 0 && (
                    <ResultCard
                      title="Valor de transmisión"
                      value={formatCurrency(resultadosVendedor.valorTransmision)}
                      variant="default"
                      icon="📤"
                      description="Precio de venta − comisión, gestoría, otros gastos y plusvalía municipal"
                    />
                  )}

                  {resultadosVendedor.esPerdida ? (
                    <ResultCard
                      title="Pérdida patrimonial"
                      value={formatCurrency(Math.abs(resultadosVendedor.gananciaPatrimonial))}
                      variant="success"
                      icon="📉"
                      description="Vendes por debajo del valor de adquisición: no hay IRPF que pagar y la pérdida se puede compensar en la declaración"
                    />
                  ) : (
                    resultadosVendedor.gananciaPatrimonial > 0 && (
                      <ResultCard
                        title="Ganancia patrimonial"
                        value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                        variant="info"
                        icon="📈"
                        description={
                          resultadosVendedor.baseImponibleIRPF < resultadosVendedor.gananciaPatrimonial
                            ? `Tributa ${formatCurrency(resultadosVendedor.baseImponibleIRPF)} tras aplicar la exención`
                            : 'Base para IRPF'
                        }
                      />
                    )
                  )}

                  <ResultCard
                    title="IRPF sobre ganancia"
                    value={resultadosVendedor.exentoIRPF || resultadosVendedor.irpfGanancia === 0 ? 'EXENTO' : formatCurrency(resultadosVendedor.irpfGanancia)}
                    variant={resultadosVendedor.exentoIRPF || resultadosVendedor.irpfGanancia === 0 ? 'success' : 'warning'}
                    icon="💸"
                    description={
                      resultadosVendedor.exentoIRPF
                        ? 'Mayor de 65 años + vivienda habitual'
                        : resultadosVendedor.motivoExencion ?? 'Tributación en base del ahorro'
                    }
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

                  {resultadosVendedor.otrosGastosVenta > 0 && (
                    <ResultCard
                      title="Otros gastos de la venta"
                      value={formatCurrency(resultadosVendedor.otrosGastosVenta)}
                      variant="default"
                      icon="📄"
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

      {/* Disclaimer Educativo */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Información Importante sobre Estimaciones</h3>
        <p>
          Esta calculadora proporciona <strong>estimaciones orientativas</strong>. Los importes reales pueden variar según:
        </p>
        <ul>
          <li>El <strong>valor de referencia catastral</strong> (base mínima imponible desde 2022)</li>
          <li>Condiciones específicas de tu situación personal</li>
          <li>Coeficientes de plusvalía de cada municipio</li>
          <li>Aranceles notariales que pueden variar según la complejidad</li>
        </ul>

        <h4>⚠️ Verificación de Datos Tributarios</h4>
        <p>
          Los tipos de <strong>ITP, AJD y aranceles notariales</strong> pueden haber cambiado desde la última verificación
          de esta herramienta (ver fecha en &quot;Datos de referencia&quot; más arriba). <strong>Verifica los tipos vigentes</strong> con tu comunidad autónoma
          antes de tomar decisiones.
        </p>

        <h4>⚠️ NO Sustituye Asesoramiento Profesional</h4>
        <p>
          Esta calculadora <strong>NO sustituye el asesoramiento</strong> de un notario, abogado o asesor fiscal.
          Usa los resultados como <strong>estimación orientativa</strong>, NO como base para decisiones legales
          o financieras definitivas.
        </p>

        <h4>📋 Fuentes Oficiales de Consulta</h4>
        <ul>
          <li><strong>ITP/IVA/AJD:</strong> Consulta la normativa tributaria de tu comunidad autónoma</li>
          <li><strong>Aranceles:</strong> Real Decreto 1426/1989 (notarías) y 1427/1989 (registros)</li>
          <li><strong>Valor de referencia:</strong> <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer">Sede Electrónica del Catastro</a></li>
          <li><strong>Agencia Tributaria:</strong> <a href="https://www.agenciatributaria.es" target="_blank" rel="noopener noreferrer">www.agenciatributaria.es</a></li>
        </ul>

        <h4>💡 Exenciones y Bonificaciones</h4>
        <p>
          <strong>Plusvalía en IRPF:</strong> Los mayores de 65 años que venden su vivienda habitual
          están exentos de tributar por la ganancia patrimonial en IRPF. Existen otras bonificaciones
          autonómicas según perfil (jóvenes, familias numerosas, discapacidad). <strong>Consulta con tu asesor fiscal.</strong>
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los gastos de comprar o vender una vivienda?"
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
                Las viviendas nuevas (primera transmisión del promotor) pagan <strong>IVA al 10%</strong>.
                Los locales comerciales, naves industriales y terrenos pagan <strong>IVA al 21%</strong>.
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
                Desde 2021, puede elegir entre el método <strong>objetivo</strong> (valor catastral del suelo × coeficiente
                según los años de tenencia) o el <strong>real</strong>, pagando el que resulte más favorable.
              </p>
              <p>
                En el método real, el incremento de la operación (venta menos compra) <strong>no tributa entero</strong>:
                solo la parte que corresponde al suelo, en la misma proporción que el suelo representa sobre el valor
                catastral total. Por eso hacen falta las dos cifras del recibo del IBI, no solo la del suelo.
              </p>
              <p>
                <strong>Si no hay incremento de valor, no se paga</strong> (sentencia del Tribunal Constitucional
                de 26 de octubre de 2021).
              </p>
              <p>
                Esta calculadora aplica un <strong>tipo del 25%</strong> como referencia orientativa habitual;
                cada ayuntamiento fija su propio tipo, con un <strong>máximo legal del 30%</strong>.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>💰 IRPF del vendedor</h4>
              <p>
                La ganancia patrimonial tributa en la <strong>base del ahorro</strong> con tipos del 19% al 30%
                según el importe.
              </p>
              <p>
                No es la simple diferencia entre lo que pagaste y lo que cobras: al precio de compra se le suman
                los <strong>impuestos y gastos de aquella compra</strong> y las mejoras, y del precio de venta se
                restan la comisión, la gestoría y la <strong>plusvalía municipal</strong> (art. 35 LIRPF). Declararlos
                puede rebajar la factura varios miles de euros.
              </p>
              <p>
                <strong>Exención total</strong> para mayores de 65 años que venden su vivienda habitual, y
                <strong> exención por reinversión</strong> —total o proporcional a lo reinvertido— para quien
                vende su vivienda habitual y compra otra en los 2 años siguientes.
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

        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Comparativa de impuestos en compraventa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Vivienda nueva</th>
                  <th>Vivienda segunda mano</th>
                  <th>¿Quién paga?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IVA</td>
                  <td>10% (21% locales/terrenos)</td>
                  <td>No aplica</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>ITP</td>
                  <td>No aplica</td>
                  <td>4% – 11% (según CC.AA.)</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>AJD</td>
                  <td>0,5% – 1,5%</td>
                  <td>0,5% – 1,5% (con hipoteca)</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>Plusvalía municipal</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Vendedor</td>
                </tr>
                <tr>
                  <td>IRPF ganancia patrimonial</td>
                  <td>19% – 30%</td>
                  <td>19% – 30%</td>
                  <td>Vendedor</td>
                </tr>
                <tr>
                  <td>Notaría</td>
                  <td>600 € – 1.500 €</td>
                  <td>600 € – 1.500 €</td>
                  <td>Comprador</td>
                </tr>
                <tr>
                  <td>Registro de la propiedad</td>
                  <td>200 € – 600 €</td>
                  <td>200 € – 600 €</td>
                  <td>Comprador</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos de uso reales</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🏠</span>
                <span className={styles.casoTag}>Comprador primera vivienda</span>
              </div>
              <p>Marta, 29 años, compra su primera vivienda habitual de segunda mano en Andalucía por
              140.000 €. Al ser menor de 35 años y no superar los 150.000 €, se aplica el tipo
              reducido de ITP del 3,5% (4.900 €) en lugar del tipo general del 7%. Además paga
              unos 790 € en notaría, registro y gestoría.</p>
              <div className={styles.casoResultado}>Ahorra 4.900 € frente al tipo general del 7%</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🏗️</span>
                <span className={styles.casoTag}>Comprador obra nueva</span>
              </div>
              <p>Carlos compra un piso nuevo en Valencia por 180.000 €. Paga el 10% de IVA (18.000 €)
              más el 1,5% de AJD (2.700 €) al ser la primera transmisión del promotor.
              El total de impuestos asciende a 20.700 €.</p>
              <div className={styles.casoResultado}>IVA + AJD frente a ITP en segunda mano</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>💸</span>
                <span className={styles.casoTag}>Vendedor con ganancia</span>
              </div>
              <p>Ana vende su piso por 250.000 €. Lo compró hace 8 años por 180.000 €. Tras restar
              la comisión inmobiliaria (3%) y la gestoría, su ganancia patrimonial es de 62.200 €,
              que tributa al 19% los primeros 6.000 €, al 21% hasta 50.000 € y al 23% el resto.
              Además paga la plusvalía municipal por el método más favorable.</p>
              <div className={styles.casoResultado}>Ganancia patrimonial sujeta a IRPF del ahorro</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>👴</span>
                <span className={styles.casoTag}>Vendedor mayor de 65 años</span>
              </div>
              <p>Pedro, 67 años, vende su vivienda habitual por 300.000 €. Al ser mayor de 65 años
              y tratarse de la residencia habitual, está exento de tributar la ganancia patrimonial
              en IRPF. Solo debe abonar la plusvalía municipal.</p>
              <div className={styles.casoResultado}>Exención total de IRPF por edad y vivienda habitual</div>
            </div>
          </div>
        </section>

        {/* FAQ ampliado */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre gastos de compraventa</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre ITP e IVA en la compra de una vivienda?</h4>
              <p>El ITP se aplica a viviendas de segunda mano (transmisiones entre particulares), mientras que
              el IVA al 10% se paga en viviendas nuevas (primera entrega del promotor). No pueden coexistir
              en la misma operación: o se paga uno u otro, nunca ambos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo negociar quién paga cada gasto?</h4>
              <p>En principio, salvo los gastos del vendedor (plusvalía municipal, IRPF), el resto son del comprador
              por ley. Sin embargo, es posible pactar condiciones distintas en el contrato privado. Lo que no puede
              modificarse es la obligación tributaria frente a Hacienda.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el valor de referencia catastral y cómo afecta al ITP?</h4>
              <p>Desde 2022, la base imponible del ITP es el mayor valor entre el precio escriturado y el valor
              de referencia catastral (publicado por el Catastro). Si el valor de referencia supera el precio
              de compra, deberás pagar ITP sobre ese valor mayor, aunque hayas comprado más barato.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo se está exento de pagar plusvalía municipal?</h4>
              <p>Desde la sentencia del Tribunal Constitucional de 2021, si no existe ganancia real en el valor
              del terreno (vendes por menos de lo que compraste), puedes acreditar la pérdida y quedar exento.
              El vendedor puede elegir el método de cálculo más favorable: objetivo o real.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué gastos puede deducir el comprador en la declaración de la renta?</h4>
              <p>Si compras con hipoteca, los gastos financieros no son deducibles en IRPF desde 2013
              (solo para contratos anteriores). Sin embargo, los gastos de compraventa (notaría, registro, ITP)
              incrementan el valor de adquisición, reduciendo la ganancia patrimonial futura al vender.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son los tipos reducidos de ITP y cómo acceder a ellos?</h4>
              <p>Muchas comunidades aplican tipos reducidos para jóvenes (menores de 35-36 años), familias numerosas,
              personas con discapacidad (≥33%), VPO o municipios en riesgo de despoblación. Los requisitos
              (edad, ingresos, valor máximo del inmueble) varían por comunidad. Consulta la normativa de tu CC.AA.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La gestoría es obligatoria en la compraventa?</h4>
              <p>No es obligatoria por ley, pero los bancos suelen exigirla cuando hay hipoteca para asegurarse
              de que la documentación se tramita correctamente. Su coste oscila entre 200 € y 400 €.
              Sin hipoteca, puedes presentar los impuestos directamente o contratar una gestoría por comodidad.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo gestionar los gastos de una compraventa: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula el presupuesto total antes de firmar</strong>
                <p>Suma al precio del inmueble entre un 10% y 15% adicional para gastos e impuestos.
                Usa el simulador para obtener una estimación personalizada según tu comunidad y perfil.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Comprueba si tienes derecho a tipos reducidos de ITP</strong>
                <p>Verifica los requisitos de tu comunidad autónoma: edad, ingresos, discapacidad, familia numerosa.
                Un tipo reducido puede suponerte miles de euros de ahorro en el impuesto principal.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Firma el contrato de arras con condiciones claras</strong>
                <p>En el contrato de arras, especifica quién asume cada gasto. Aunque los impuestos del comprador
                no son negociables frente a Hacienda, sí puedes acordar que el vendedor asuma ciertos gastos notariales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Firma ante notario y recibe la escritura</strong>
                <p>En el momento de la firma, el notario calcula sus honorarios según los aranceles oficiales.
                La gestoría (o tú mismo) se encargará de tramitar los impuestos en los plazos legales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Liquida los impuestos en el plazo establecido</strong>
                <p>El ITP o IVA+AJD debe liquidarse en un plazo de 30 días hábiles desde la firma.
                El incumplimiento genera recargos del 5% al 20% e intereses de demora.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Inscribe la propiedad en el Registro</strong>
                <p>Una vez pagados los impuestos, presenta la escritura en el Registro de la Propiedad.
                Guarda todos los justificantes de pago para futuras ventas, ya que incrementan el valor
                de adquisición y reducen la posible ganancia patrimonial tributable.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.eduSection}>
          <h2>Consejos para reducir los gastos de compraventa</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Verifica el valor de referencia catastral</strong>
              <p>Consulta el valor catastral antes de negociar el precio. Si supera el precio de mercado,
              prepara documentación para impugnar la base imponible del ITP.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <strong>Solicita varios presupuestos de notaría</strong>
              <p>Aunque los aranceles notariales están regulados, los complementos y servicios adicionales
              pueden variar. Compara y elige la notaría con mejor relación calidad-precio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Planifica los plazos fiscales</strong>
              <p>Liquida los impuestos en los 30 días hábiles legales. Un retraso, aunque sea breve,
              genera recargos automáticos. Tenlo agendado desde el día de la firma.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <strong>Negocia quién asume la gestoría</strong>
              <p>En operaciones con hipoteca bancaria, el banco a veces incluye la gestoría en sus servicios.
              Verifica si puedes elegir tu propia gestoría para reducir costes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📁</span>
              <strong>Guarda todos los justificantes</strong>
              <p>Conserva las facturas de notaría, registro, impuestos y reformas. Cuando vendas en el futuro,
              estos gastos incrementan el valor de adquisición y reducen la ganancia patrimonial tributable:
              es justo lo que recoge el campo &laquo;impuestos y gastos que pagaste al comprar&raquo; de la
              pestaña Vendedor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>👨‍💼</span>
              <strong>Consulta a un asesor fiscal</strong>
              <p>Este simulador aplica la exención por reinversión en vivienda habitual y la de mayores de 65 años,
              pero hay situaciones que no cubre: herencias, divorcios, no residentes, varios titulares y los
              coeficientes de abatimiento de las compras anteriores a 1995. Ahí un asesor fiscal sí marca la diferencia.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores comunes al calcular los gastos de compraventa</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No incluir el IVA de notaría y registro:</strong> Los honorarios de notaría y registro llevan IVA al 21%, que a menudo se olvida en el presupuesto inicial.</li>
            <li><strong>Ignorar el valor de referencia catastral:</strong> Si supera el precio escriturado, Hacienda aplicará ITP sobre ese valor mayor y podrás recibir una comprobación de valores.</li>
            <li><strong>Confundir ITP con AJD en segunda mano:</strong> En segunda mano solo se paga ITP; el AJD solo aplica en escrituras con hipoteca. No se duplican.</li>
            <li><strong>Olvidar los gastos del vendedor:</strong> La plusvalía municipal y la posible ganancia patrimonial en IRPF son cargas del vendedor que deben negociarse antes de fijar el precio final.</li>
            <li><strong>No comprobar bonificaciones autonómicas:</strong> Cada comunidad tiene tipos reducidos para ciertos colectivos. Ignorarlos puede costar miles de euros en impuestos innecesarios.</li>
            <li><strong>Liquidar fuera de plazo:</strong> El ITP o IVA+AJD debe pagarse en 30 días hábiles desde la escritura. Pasado ese plazo, se generan recargos automáticos del 5% al 20%.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-compraventa-inmueble')} />
      <ShareCard appName="estimador-compraventa-inmueble" />
      <Footer appName="estimador-compraventa-inmueble" />
    </div>
  );
}
