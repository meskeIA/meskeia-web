'use client';
// @disclaimer: fiscal-critical

import { useState, useMemo } from 'react';
import styles from './SimuladorTrasteroCompraventa.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  NumberInput,
  ResultCard,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import { IVA_INMUEBLES_2025, calcularGananciaInmueble } from '@/data/fiscal';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  estimarFacturaNotarial,
  calcularRegistro,
  calcularPlusvaliaMunicipal,
  elegirTipoITP,
  importeITP,
  TipoElegido,
  ENLACE_CATASTRO,
  RANGO_AJD,
} from '@/data/itp-ccaa';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano';
type PerfilComprador = 'general' | 'joven' | 'familia-numerosa' | 'discapacidad';
type ModalidadTrastero = 'vinculado' | 'independiente';

interface ResultadosComprador {
  precioInmueble: number;
  impuestoTransmision: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  ajd: number;
  gastosNotario: number;
  gastosNotarioMin: number;
  gastosNotarioMax: number;
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
  /** Falso cuando faltan años de propiedad o valor catastral del suelo: entonces la
   *  plusvalía no es 0 €, es desconocida, y el neto que se muestra es un techo. */
  plusvaliaCalculada: boolean;
  comisionInmobiliaria: number;
  gastosGestoria: number;
  totalGastos: number;
  netoVendedor: number;
  valorAdquisicion: number;
  valorTransmision: number;
  esPerdida: boolean;
  gananciaPatrimonial: number;
  irpfGanancia: number;
}

/**
 * Cifras de los ejemplos del bloque educativo, DERIVADAS del mismo motor que usa la
 * calculadora. Estaban escritas a mano y habian divergido: la tarjeta de segunda mano
 * seguia anunciando ~160 EUR de notaria cuando la app ya calculaba 305,14 EUR, y la de
 * la venta prometia 1.330 EUR de IRPF donde el motor da 1.255,50 EUR (Inspector,
 * 20/08/2026). Derivarlas es lo unico que impide que la reparacion de hoy vuelva a
 * envejecer sola: en cuanto cambie un arancel o el ITP de una comunidad, el ejemplo
 * cambia con el.
 */
const EJEMPLOS = (() => {
  // 1 - Obra nueva en Madrid: trastero de 12.000 EUR transmitido junto a la vivienda
  const nuevoPrecio = 12000;
  const nuevoIva = nuevoPrecio * (IVA_INMUEBLES_2025.garageCon / 100);
  const nuevoAjd = calcularAJD(nuevoPrecio, 'madrid');

  // 2 - Segunda mano en Cataluna: trastero independiente de 18.000 EUR
  const usadoPrecio = 18000;
  const usadoItp = importeITP(
    usadoPrecio,
    'cataluna',
    elegirTipoITP('cataluna', 'general', usadoPrecio, { viviendaHabitual: false }),
  );
  const usadoNotaria = estimarFacturaNotarial(usadoPrecio).medio;
  const usadoRegistro = calcularRegistro(usadoPrecio);

  // 3 - Venta por 15.000 EUR de lo comprado por 8.000 EUR, con la comision del 3 % que
  //     trae el simulador por defecto y sin gastos propios de gestoria del vendedor
  const ventaComision = 15000 * 0.03;
  const venta = calcularGananciaInmueble({
    precioVenta: 15000,
    precioCompra: 8000,
    gastosTransmision: ventaComision,
  });

  // 4 - Galicia, comprador joven: el reducido del 3 % exige vivienda habitual y un
  //     trastero suelto nunca lo es, asi que la app aplica el tipo general
  const galiciaPrecio = 12000;
  const galiciaElegido = elegirTipoITP('galicia', 'joven', galiciaPrecio, { viviendaHabitual: false });
  const galiciaItp = importeITP(galiciaPrecio, 'galicia', galiciaElegido);
  const galiciaReducido = ITP_CCAA['galicia'].tiposReducidos.find(r => r.nombre.toLowerCase().includes('joven'));

  return {
    nuevoPrecio,
    nuevoIva,
    nuevoAjd,
    nuevoTotal: nuevoIva + nuevoAjd,
    usadoPrecio,
    usadoItp,
    usadoNotaria,
    usadoRegistro,
    usadoTotal: usadoItp + usadoNotaria + usadoRegistro,
    ventaComision,
    ventaGanancia: venta.ganancia,
    ventaIrpf: venta.cuotaIRPF,
    galiciaPrecio,
    galiciaItp,
    galiciaTipoGeneral: ITP_CCAA['galicia'].tipoGeneral,
    galiciaTipoReducido: galiciaReducido?.tipo ?? 0,
  };
})();

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


export default function SimuladorTrasteroCompraventaPage() {
  // Estado del formulario
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [modalidadTrastero, setModalidadTrastero] = useState<ModalidadTrastero>('vinculado');
  const [perfilComprador, setPerfilComprador] = useState<PerfilComprador>('general');
  const [gastosGestoria, setGastosGestoria] = useState('300');

  // Datos del vendedor (para plusvalía)
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');
  // Gestoría del VENDEDOR, separada de la del comprador: el art. 35.1 LIRPF solo admite
  // los gastos «satisfechos por el transmitente», y un único campo compartido hacía que
  // los 300 € del comprador rebajaran el IRPF de la otra parte (Inspector 20/08/2026).
  const [gastosGestoriaVenta, setGastosGestoriaVenta] = useState('');

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  // ===== CÁLCULOS COMPRADOR =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    const gestoria = parseSpanishNumberOr(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    /** Qué tipo de ITP se ha aplicado y cuáles NO se han podido comprobar */
    let elegido: TipoElegido | null = null;

    if (tipoTransmision === 'primera-mano') {
      // Trastero nuevo: IVA reducido (10%) solo si se transmite CONJUNTAMENTE con la
      // vivienda como anejo (art. 91.Uno.1.7º LIVA). El trastero independiente —finca
      // registral propia, comprado por separado— tributa al tipo general del 21%.
      tipoImpuesto = 'IVA';
      porcentaje = modalidadTrastero === 'vinculado'
        ? IVA_INMUEBLES_2025.garageCon
        : IVA_INMUEBLES_2025.garaje;
      impuesto = precio * (porcentaje / 100);
    } else {
      // ITP para segunda mano
      const datosCcaa = ITP_CCAA[ccaa];

      // `viviendaHabitual: false`: un trastero suelto no lo es nunca, y esa condición
      // aparece en 53 de los tipos reducidos. Antes se aplicaba el primer reducido que
      // casara por nombre sin mirar sus condiciones, y en Madrid eso daba ITP del 0 %.
      elegido = elegirTipoITP(ccaa, perfilComprador, precio, { viviendaHabitual: false });
      impuesto = importeITP(precio, ccaa, elegido);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
    }

    // AJD solo aplica en primera mano
    const ajd = tipoTransmision === 'primera-mano' ? calcularAJD(precio, ccaa) : 0;

    const notaria = estimarFacturaNotarial(precio);

    const notario = notaria.medio;
    const registro = calcularRegistro(precio);
    const totalGastos = impuesto + ajd + notario + registro + gestoria;

    return {
      precioInmueble: precio,
      impuestoTransmision: impuesto,
      tipoImpuesto,
      porcentajeImpuesto: porcentaje,
      ajd,
      gastosNotario: notario,
      gastosNotarioMin: notaria.min,
      gastosNotarioMax: notaria.max,
      gastosRegistro: registro,
      gastosGestoria: gestoria,
      totalGastos,
      totalOperacion: precio + totalGastos,
      tipoElegido: elegido,
    };
  }, [precioVenta, ccaa, tipoTransmision, perfilComprador, gastosGestoria, modalidadTrastero]);

  // ===== CÁLCULOS VENDEDOR =====
  const resultadosVendedor = useMemo((): ResultadosVendedor | null => {
    const precioV = parseSpanishNumber(precioVenta);
    const precioC = parseSpanishNumber(precioCompraOriginal);
    const anios = parseInt(aniosPropiedad) || 0;
    const valorSuelo = parseSpanishNumber(valorCatastralSuelo);
    const valorTotal = parseSpanishNumber(valorCatastralTotal);

    if (!Number.isFinite(precioV) || precioV <= 0) return null;

    const comisionPct = parseSpanishNumberOr(comisionInmobiliaria) / 100;
    const gestoria = parseSpanishNumberOr(gastosGestoriaVenta);
    const comision = precioV * comisionPct;

    // Plusvalía municipal
    let plusvalia = 0;
    let metodoPlusvalia = 'No calculada (faltan datos)';
    let exentoPlusvalia = false;
    let plusvaliaCalculada = false;

    if (valorSuelo > 0 && anios > 0 && precioC > 0) {
      plusvaliaCalculada = true;
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

    // Ganancia patrimonial e IRPF con el motor único del art. 35 LIRPF: los impuestos
    // y gastos de la compra suman al valor de adquisición y la plusvalía municipal
    // resta del valor de transmisión.
    const g = calcularGananciaInmueble({
      precioVenta: precioV,
      precioCompra: precioC,
      gastosAdquisicion: parseSpanishNumberOr(gastosAdquisicion),
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
      plusvaliaCalculada,
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
  }, [precioVenta, precioCompraOriginal, aniosPropiedad, valorCatastralSuelo, valorCatastralTotal, comisionInmobiliaria, gastosGestoriaVenta, gastosAdquisicion]);

  const datosCcaaActual = ITP_CCAA[ccaa];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📦</span>
        <h1 className={styles.title}>Simulador de Gastos de Compraventa de Trastero</h1>
        <p className={styles.subtitle}>
          Calcula el ITP, notaría, registro y gastos al comprar o vender un trastero en España
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated="2024-12-20" />

      {/* Disclaimer Legal - CRÍTICO */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-trastero"
        collapsible={false}
      />

      {/* Nota informativa sobre trastero */}
      <div className={styles.trasteroNote}>
        <span className={styles.trasteroNoteIcon}>ℹ️</span>
        <p>
          <strong>Trastero vinculado a vivienda:</strong> tributa como anejo residencial (IVA 10% en obra nueva,
          ITP residencial en segunda mano). <strong>Trastero vendido de forma independiente:</strong> en obra nueva
          pierde el tipo reducido y paga el IVA general del 21%, una diferencia estatal (art. 91.Uno.1.7º LIVA)
          que no depende de la comunidad autónoma. En segunda mano paga el mismo ITP que el vinculado.
        </p>
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>📋 Datos de la operación</h2>

          {/* Modalidad de trastero */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Modalidad del trastero</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"
                aria-pressed={modalidadTrastero === 'vinculado'}
                className={`${styles.transmisionBtn} ${modalidadTrastero === 'vinculado' ? styles.active : ''}`}
                onClick={() => setModalidadTrastero('vinculado')}
              >
                <span className={styles.transmisionIcon}>🏠</span>
                <span>Vinculado a vivienda</span>
                <span className={styles.transmisionSub}>Anejo residencial</span>
              </button>
              <button
                type="button"
                aria-pressed={modalidadTrastero === 'independiente'}
                className={`${styles.transmisionBtn} ${modalidadTrastero === 'independiente' ? styles.active : ''}`}
                onClick={() => setModalidadTrastero('independiente')}
              >
                <span className={styles.transmisionIcon}>📦</span>
                <span>Independiente</span>
                <span className={styles.transmisionSub}>Finca registral propia</span>
              </button>
            </div>
            {modalidadTrastero === 'independiente' && (
              <p className={styles.infoCcaaNote} style={{ marginTop: '0.5rem', color: '#856404' }}>
                <span aria-hidden="true">⚠️</span> En obra nueva, el trastero independiente tributa al{' '}
                <strong>IVA general del 21%</strong>, no al 10%: el tipo reducido solo se aplica a los anejos
                transmitidos junto con la vivienda. En segunda mano paga ITP, pero los tipos reducidos por
                perfil (joven, familia numerosa) suelen exigir que la compra sea de vivienda habitual.
                Confirma tu caso con un asesor fiscal.
              </p>
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
                <span className={styles.transmisionIcon}>🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP</span>
              </button>
              <button
                type="button"
                aria-pressed={tipoTransmision === 'primera-mano'}
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
              >
                <span className={styles.transmisionIcon}>🆕</span>
                <span>Primera mano</span>
                <span className={styles.transmisionSub}>
                  Paga IVA {modalidadTrastero === 'vinculado' ? '10%' : '21%'}
                </span>
              </button>
            </div>
          </div>

          {/* Precio de venta */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio del trastero"
            placeholder="15000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor)"
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">Comunidad Autónoma (ubicación del trastero)</label>
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
              <label className={styles.label} htmlFor="select-perfil">Perfil del comprador (para tipos reducidos)</label>
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
              <p className={styles.infoCcaaNote} style={{ marginTop: '0.4rem' }}>
                Los tipos reducidos aplican si la CCAA los reconoce para anejos residenciales
              </p>
            </div>
          )}

          {/* Gastos de gestoría */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="300"
              helperText="Típico: 200-400 € (tramitación de escrituras). Solo afecta al presupuesto del comprador"
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
              🛒 Comprador
            </button>
            <button
              type="button"
              aria-pressed={pestanaActiva === 'vendedor'}
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
                    title="Precio del trastero"
                    value={formatCurrency(resultadosComprador.precioInmueble)}
                    variant="default"
                    icon="📦"
                  />

                  <ResultCard
                    title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 1)}%)`}
                    value={formatCurrency(resultadosComprador.impuestoTransmision)}
                    variant="warning"
                    icon="📋"
                    description={
                      tipoTransmision === 'primera-mano'
                        ? (modalidadTrastero === 'vinculado'
                            ? 'IVA 10% — anejo transmitido con la vivienda (obra nueva)'
                            : 'IVA 21% — trastero independiente (obra nueva)')
                        : `ITP ${datosCcaaActual.nombre}`
                    }
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
                    title="Gastos de notaría (IVA incluido)"
                    value={formatCurrency(resultadosComprador.gastosNotario)}
                    description={`Factura estimada entre ${formatCurrency(resultadosComprador.gastosNotarioMin)} y ${formatCurrency(resultadosComprador.gastosNotarioMax)}. El arancel cubre la matriz y una copia; las copias adicionales y los folios se facturan aparte y dependen de la extensión de la escritura.`}
                    variant="default"
                    icon="📝"
                  />

                  <ResultCard
                    title="Registro de la Propiedad (IVA incluido)"
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
                    description="Precio del trastero + todos los gastos"
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
                        Un trastero comprado por separado no es vivienda habitual, así que los tipos que exigen esa condición no suelen aplicarse. Confírmalo con la oficina liquidadora de tu comunidad antes de contar con la rebaja.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon}>📊</span>
                  <p>Introduce el precio del trastero para ver el desglose de gastos del comprador</p>
                </div>
              )}
            </div>
          )}

          {/* Resultados Vendedor */}
          {pestanaActiva === 'vendedor' && (
            <div className={styles.resultados}>
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos para calcular plusvalía e IRPF</h3>

                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original"
                  placeholder="10000"
                  helperText="Lo que pagaste cuando compraste el trastero"
                  min={0}
                />

                <NumberInput
                  value={gastosAdquisicion}
                  onChange={setGastosAdquisicion}
                  label="Impuestos y gastos que pagaste al comprarlo"
                  placeholder="1000"
                  helperText="ITP o IVA, notaría, registro y gestoría de aquella compra: suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                  min={0}
                />

                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="5"
                  helperText="Desde la compra hasta ahora"
                  min={1}
                  max={50}
                />

                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo"
                  placeholder="4000"
                  helperText="Solo la parte del suelo (en el recibo del IBI o en Catastro)"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción)"
                  placeholder="9000"
                  helperText="También en el recibo del IBI. Sin este dato no puede compararse el método real de la plusvalía y se aplica el objetivo"
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
                  value={gastosGestoriaVenta}
                  onChange={setGastosGestoriaVenta}
                  label="Gestoría y certificados del vendedor (€)"
                  placeholder="0"
                  helperText="Solo lo que pagas TÚ al vender (certificado energético, cédula, gestoría propia). La gestoría del comprador no reduce tu ganancia: art. 35.1 LIRPF"
                  min={0}
                />
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
                    value={
                      resultadosVendedor.exentoPlusvalia
                        ? 'EXENTO'
                        : resultadosVendedor.plusvaliaCalculada
                          ? formatCurrency(resultadosVendedor.plusvaliaMunicipal)
                          : 'SIN CALCULAR'
                    }
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
                        description="Base para IRPF (base del ahorro)"
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
                    description={
                      resultadosVendedor.plusvaliaCalculada || resultadosVendedor.exentoPlusvalia
                        ? 'Lo que realmente recibes tras los gastos'
                        : 'Techo: aún NO incluye la plusvalía municipal. Añade los años de propiedad y el valor catastral del suelo para calcularla'
                    }
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

      {/* Contenido educativo */}
      <EducationalSection
        title="Todo sobre los gastos de compraventa de trastero"
        subtitle="Fiscalidad del trastero: ITP, IVA, plusvalía municipal y diferencias según la modalidad"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Comparativa fiscal: trastero vinculado vs independiente vs garaje</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Trastero vinculado a vivienda</th>
                  <th>Trastero independiente</th>
                  <th>Garaje / Plaza de parking</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IVA en obra nueva</td>
                  <td>10% (anejo de la vivienda)</td>
                  <td>21% (tipo general)</td>
                  <td>10% con la vivienda (máx. 2 plazas) · 21% independiente</td>
                </tr>
                <tr>
                  <td>ITP en segunda mano</td>
                  <td>Tipo general CCAA (residencial)</td>
                  <td>Tipo general CCAA (puede variar)</td>
                  <td>Tipo general CCAA (residencial)</td>
                </tr>
                <tr>
                  <td>Tipos reducidos ITP</td>
                  <td>Según CCAA (anejo residencial)</td>
                  <td>Variable según CCAA</td>
                  <td>Según CCAA (anejo residencial)</td>
                </tr>
                <tr>
                  <td>AJD en primera mano</td>
                  <td>{formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}% según CCAA</td>
                  <td>{formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}% según CCAA</td>
                  <td>{formatNumber(RANGO_AJD.min, 0)}% – {formatNumber(RANGO_AJD.max, 1)}% según CCAA</td>
                </tr>
                <tr>
                  <td>Plusvalía municipal</td>
                  <td>Sí (parte proporcional del suelo)</td>
                  <td>Sí (suelo del trastero)</td>
                  <td>Sí (parte proporcional del suelo)</td>
                </tr>
                <tr>
                  <td>IRPF ganancia patrimonial</td>
                  <td>19% – 30%</td>
                  <td>19% – 30%</td>
                  <td>19% – 30%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos de uso habituales</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🏗️</span>
                <span className={styles.casoTag}>Trastero con vivienda nueva</span>
              </div>
              <p>Al comprar un piso de obra nueva en Madrid por 280.000 € con trastero incluido por {formatCurrency(EJEMPLOS.nuevoPrecio)},
              el trastero tributa al {formatNumber(IVA_INMUEBLES_2025.garageCon, 0)}% de IVA ({formatCurrency(EJEMPLOS.nuevoIva)}) más AJD
              al {formatNumber(ITP_CCAA['madrid'].ajd, 2)}% ({formatCurrency(EJEMPLOS.nuevoAjd)}). El promotor lo vende
              como anejo de la vivienda, por lo que se aplica el mismo tipo reducido.</p>
              <div className={styles.casoResultado}>IVA + AJD: {formatCurrency(EJEMPLOS.nuevoTotal)} de gastos fiscales</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🔄</span>
                <span className={styles.casoTag}>Trastero de segunda mano</span>
              </div>
              <p>Una persona compra un trastero independiente en Cataluña por {formatCurrency(EJEMPLOS.usadoPrecio)}. Al ser segunda mano,
              paga ITP por {formatCurrency(EJEMPLOS.usadoItp)} (primer tramo de la escala progresiva catalana),
              más notaría ({formatCurrency(EJEMPLOS.usadoNotaria)}) y registro ({formatCurrency(EJEMPLOS.usadoRegistro)}), ambos con el IVA ya incluido.</p>
              <div className={styles.casoResultado}>ITP + notaría + registro: {formatCurrency(EJEMPLOS.usadoTotal)} en gastos</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>💰</span>
                <span className={styles.casoTag}>Vender un trastero</span>
              </div>
              <p>El vendedor debe calcular la plusvalía municipal (si la hay) y la posible ganancia patrimonial
              en IRPF. Si compró el trastero por 8.000 € y lo vende por 15.000 €, la diferencia bruta son 7.000 €,
              pero el art. 35 LIRPF descuenta antes los gastos de la venta: con la comisión del 3% que trae el
              simulador ({formatCurrency(EJEMPLOS.ventaComision)}) la ganancia queda en {formatCurrency(EJEMPLOS.ventaGanancia)} y
              el IRPF en {formatCurrency(EJEMPLOS.ventaIrpf)}, porque la base del ahorro no es plana: 19% hasta 6.000 € y 21% sobre el resto.</p>
              <div className={styles.casoResultado}>Ganancia de {formatCurrency(EJEMPLOS.ventaGanancia)} → {formatCurrency(EJEMPLOS.ventaIrpf)} de IRPF</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🎯</span>
                <span className={styles.casoTag}>Tipos reducidos de ITP</span>
              </div>
              <p>Un joven de 30 años que compra un trastero en Galicia por {formatCurrency(EJEMPLOS.galiciaPrecio)} paga
              el tipo general del {formatNumber(EJEMPLOS.galiciaTipoGeneral, 0)}% ({formatCurrency(EJEMPLOS.galiciaItp)}), y no
              el reducido del {formatNumber(EJEMPLOS.galiciaTipoReducido, 0)}% para jóvenes: la Xunta lo condiciona a que el inmueble sea
              <strong> vivienda habitual</strong>, y un trastero comprado por separado nunca lo es. El reducido sí entra si el
              trastero se adquiere como anejo de la vivienda en la misma escritura.</p>
              <div className={styles.casoResultado}>Trastero independiente: tipo general del {formatNumber(EJEMPLOS.galiciaTipoGeneral, 0)}%, sin reducción por edad</div>
            </div>
          </div>
        </section>

        {/* FAQ específica de trastero */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre el trastero</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué IVA paga un trastero nuevo?</h4>
              <p>Depende de si se compra con la vivienda o por separado. Si el promotor lo transmite
              <strong> conjuntamente con la vivienda</strong> como anejo, se aplica el tipo reducido del
              <strong> 10%</strong> (art. 91.Uno.1.7º de la Ley del IVA). Si se compra de forma
              <strong> independiente</strong> —finca registral propia, operación separada— tributa al tipo
              general del <strong>21%</strong>. Es el mismo criterio que rige para las plazas de garaje.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre trastero vinculado y trastero independiente?</h4>
              <p>El <strong>trastero vinculado</strong> forma parte de la misma finca registral que la vivienda y se vende
              junto a ella como anejo. El <strong>trastero independiente</strong> tiene su propia referencia catastral
              y escritura y puede venderse por separado. La diferencia fiscal principal está en la obra nueva:
              el vinculado paga <strong>IVA al 10%</strong> como anejo de la vivienda y el independiente al
              <strong> 21%</strong>. En segunda mano ambos pagan ITP al tipo de la comunidad autónoma, aunque los
              tipos reducidos por perfil del comprador suelen exigir que la compra sea de vivienda habitual.
              Consulta siempre con un asesor fiscal antes de la operación.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se puede comprar un trastero sin comprar también la vivienda?</h4>
              <p>Sí. Si el trastero tiene finca registral propia (trastero independiente), se puede comprar y vender
              de forma autónoma sin necesidad de adquirir la vivienda a la que originalmente estuvo vinculado.
              Esta es una operación habitual, especialmente en comunidades de propietarios donde el trastero
              sale a la venta de forma separada.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se paga plusvalía municipal al vender un trastero?</h4>
              <p>Sí. La plusvalía municipal (Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana)
              se aplica también a la venta de trasteros. Desde 2021, el vendedor puede elegir el método más favorable:
              el <strong>objetivo</strong> (basado en el valor catastral del suelo y el tiempo de tenencia) o el
              <strong> real</strong> (basado en la ganancia efectiva). Si no hay ganancia, se puede acreditar la pérdida
              y quedar exento.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Tienen tipos reducidos de ITP los trasteros?</h4>
              <p>Depende de cada comunidad autónoma. La mayoría de los tipos reducidos de ITP (jóvenes, familias
              numerosas, discapacidad) se diseñaron para vivienda habitual. No obstante, como el trastero vinculado
              se considera anejo residencial, algunas CCAA pueden extenderlos. En el caso del trastero independiente,
              el tratamiento es menos claro y varía según la normativa autonómica. Verifica los requisitos específicos
              de tu comunidad antes de la compra.</p>
            </div>
          </div>
        </section>

        {/* Consejos específicos */}
        <section className={styles.eduSection}>
          <h2>Consejos para comprar o vender un trastero</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Comprueba el tipo de finca</strong>
              <p>Antes de comprar, consulta en el Registro de la Propiedad si el trastero tiene finca propia
              o está vinculado a otra. Esto afecta a la operación y a los impuestos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏛️</span>
              <strong>Consulta el valor catastral</strong>
              <p>El ITP se calcula sobre el mayor valor entre el precio escriturado y el valor de referencia
              catastral. Compruébalo en la Sede Electrónica del Catastro antes de acordar el precio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Liquida los impuestos a tiempo</strong>
              <p>El ITP o el IVA+AJD debe liquidarse en 30 días hábiles desde la firma de la escritura.
              El incumplimiento genera recargos automáticos del 5% al 20%.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📁</span>
              <strong>Guarda todos los justificantes</strong>
              <p>Conserva la escritura, el ITP pagado y los gastos de notaría. Si en el futuro vendes,
              estos gastos se suman al valor de adquisición y reducen la ganancia patrimonial en IRPF.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Limitaciones de esta calculadora de gastos de trastero</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>La vinculación a la vivienda puede cambiar la fiscalidad:</strong> Si el trastero se vende vinculado a la vivienda en una misma operación, la operación conjunta puede tributar de forma distinta. Consulta con un notario o asesor fiscal.</li>
            <li><strong>Los tipos reducidos de ITP no están garantizados para trasteros:</strong> Muchas bonificaciones autonómicas aplican solo a vivienda habitual. Para trasteros, verifica la normativa específica de tu comunidad.</li>
            <li><strong>La plusvalía municipal varía por municipio:</strong> Los coeficientes reales de cada municipio pueden diferir de los estimados en esta calculadora. El resultado es orientativo.</li>
            <li><strong>Los aranceles de notaría y registro son orientativos:</strong> Pueden variar según la complejidad de la operación, el número de folios o copias adicionales.</li>
            <li><strong>Esta herramienta no sustituye el asesoramiento profesional:</strong> Consulta con un notario, abogado o asesor fiscal antes de tomar decisiones en una operación inmobiliaria.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-trastero')} />
      <ShareCard appName="simulador-gastos-compraventa-trastero" />
      <Footer appName="simulador-gastos-compraventa-trastero" />
    </div>
  );
}
