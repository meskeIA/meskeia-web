'use client';
// @disclaimer: DisclaimerCard severity="critical" — fiscal España estructural

import { useState, useMemo } from 'react';
import styles from './SimuladorLocalComercial.module.css';
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
  AvisoTerritorioSinIva,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import { calcularGananciaInmueble, IVA_INMUEBLES_2025, FISCAL_INMUEBLES_META } from '@/data/fiscal';
import {
  ITP_CCAA,
  ComunidadAutonoma,
  calcularITP,
  calcularAJD,
  calcularNotario,
  estimarFacturaNotarial,
  calcularRegistro,
  calcularPlusvaliaMunicipal,
  ENLACE_CATASTRO,
} from '@/data/itp-ccaa';

// ===== TIPOS =====
type TipoTransmision = 'segunda-mano' | 'primera-mano' | 'segunda-mano-renuncia';
type PerfilVendedor = 'particular' | 'afecto-actividad';

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
  ivaRecuperable: boolean; // true si el impuesto principal es IVA (deducible si el comprador es sujeto pasivo)
}

interface ResultadosVendedor {
  precioVenta: number;
  plusvaliaMunicipal: number;
  metodoPlusvalia: string;
  exentoPlusvalia: boolean;
  comisionInmobiliaria: number;
  gastosGestoria: number;
  valorAdquisicionCorregido: number;
  valorTransmision: number;
  amortizacionesRestadas: number;
  gananciaPatrimonial: number;
  esPerdida: boolean;
  irpfGanancia: number;
  totalGastos: number;
  netoVendedor: number;
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

// IVA local comercial: 21% (inmueble comercial, no residencial)
// Tipo de IVA de inmueble no residencial. Sale de data/fiscal para no divergir en
// silencio cuando cambie allí (hallazgo 163 del Inspector, del clúster entero).
const IVA_LOCAL_COMERCIAL = IVA_INMUEBLES_2025.local;

export default function SimuladorLocalComercialPage() {
  const [precioVenta, setPrecioVenta] = useState('');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [tipoTransmision, setTipoTransmision] = useState<TipoTransmision>('segunda-mano');
  const [gastosGestoria, setGastosGestoria] = useState('500');

  // Datos del vendedor
  const [precioCompraOriginal, setPrecioCompraOriginal] = useState('');
  const [gastosAdquisicion, setGastosAdquisicion] = useState('');
  const [aniosPropiedad, setAniosPropiedad] = useState('');
  const [valorCatastralSuelo, setValorCatastralSuelo] = useState('');
  const [valorCatastralTotal, setValorCatastralTotal] = useState('');
  const [comisionInmobiliaria, setComisionInmobiliaria] = useState('3');
  // Gestoria del VENDEDOR, separada de la del comprador: el art. 35.1 LIRPF solo admite
  // los gastos «satisfechos por el transmitente», y un unico campo compartido hacia que
  // la gestoria del comprador rebajara el IRPF de la otra parte (Inspector, 20/08/2026).
  const [gastosGestoriaVenta, setGastosGestoriaVenta] = useState('');
  const [perfilVendedor, setPerfilVendedor] = useState<PerfilVendedor>('particular');
  const [amortizacionesAcumuladas, setAmortizacionesAcumuladas] = useState('');

  const [pestanaActiva, setPestanaActiva] = useState<'comprador' | 'vendedor'>('comprador');

  const esRenuncia = tipoTransmision === 'segunda-mano-renuncia';

  // ===== CÁLCULOS =====
  const resultadosComprador = useMemo((): ResultadosComprador | null => {
    const precio = parseSpanishNumber(precioVenta);
    if (!Number.isFinite(precio) || precio <= 0) return null;

    const gestoria = parseSpanishNumberOr(gastosGestoria);

    let impuesto = 0;
    let tipoImpuesto = '';
    let porcentaje = 0;
    let ivaRecuperable = false;
    let ajd = 0;

    if (tipoTransmision === 'primera-mano') {
      // Obra nueva del promotor: IVA 21% + AJD
      tipoImpuesto = 'IVA';
      porcentaje = IVA_LOCAL_COMERCIAL;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else if (tipoTransmision === 'segunda-mano-renuncia') {
      // Segunda mano con renuncia a la exención de IVA (Art. 20.Dos LIVA)
      // → IVA 21% con inversión del sujeto pasivo + AJD (a menudo a tipo incrementado según CCAA)
      tipoImpuesto = 'IVA (renuncia · ISP)';
      porcentaje = IVA_LOCAL_COMERCIAL;
      impuesto = precio * (porcentaje / 100);
      ajd = calcularAJD(precio, ccaa);
      ivaRecuperable = true;
    } else {
      // Segunda mano sin renuncia → exenta de IVA → ITP tipo general de la CCAA
      const datosCcaa = ITP_CCAA[ccaa];
      const tipoAplicable = datosCcaa.tipoGeneral;
      // Sin tercer argumento: así se aplica la escala progresiva de las 7 CCAA
      // que la tienen, en vez del tipo plano del primer tramo.
      impuesto = calcularITP(precio, ccaa);
      tipoImpuesto = 'ITP';
      // Tipo EFECTIVO: con escala progresiva el importe no es un porcentaje plano del
      // precio, asi que mostrar el tipo nominal contradiria a la cifra de al lado.
      porcentaje = precio > 0 ? (impuesto / precio) * 100 : 0;
      ajd = 0;
    }

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
      ivaRecuperable,
    };
  }, [precioVenta, ccaa, tipoTransmision, gastosGestoria]);

  // ===== CÁLCULOS VENDEDOR =====
  // El vendedor de un local paga plusvalía municipal (es suelo urbano) e IRPF sobre la
  // ganancia patrimonial. La diferencia con la vivienda: no hay exención por reinversión
  // ni por mayores de 65 años, y si el local estuvo AFECTO a una actividad económica hay
  // que minorar el valor de adquisición en las amortizaciones deducidas (art. 40 RIRPF).
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

    // Plusvalía municipal (IIVTNU): el local está en suelo urbano, sí tributa
    let plusvalia = 0;
    let metodoPlusvalia = 'No calculada (faltan valor catastral del suelo, años y precio de compra)';
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

    // Si el local estuvo afecto a actividad, la amortización deducida MINORA el valor de
    // adquisición (art. 40 RIRPF) y aumenta la ganancia; los impuestos y gastos de la
    // compra lo aumentan y la reducen (art. 35.1 LIRPF). Ambos van al motor compartido.
    const amortizaciones = perfilVendedor === 'afecto-actividad'
      ? Math.max(0, parseSpanishNumber(amortizacionesAcumuladas))
      : 0;

    const g = calcularGananciaInmueble({
      precioVenta: precioV,
      precioCompra: precioC,
      gastosAdquisicion: parseSpanishNumberOr(gastosAdquisicion),
      amortizacionesDeducidas: amortizaciones,
      gastosTransmision: comision + gestoria,
      plusvaliaMunicipal: plusvalia,
    });

    const hayDatosGanancia = precioC > 0;
    const irpf = hayDatosGanancia ? g.cuotaIRPF : 0;
    const totalGastos = plusvalia + comision + gestoria + irpf;

    return {
      precioVenta: precioV,
      plusvaliaMunicipal: plusvalia,
      metodoPlusvalia,
      exentoPlusvalia,
      comisionInmobiliaria: comision,
      gastosGestoria: gestoria,
      valorAdquisicionCorregido: hayDatosGanancia ? g.valorAdquisicion : 0,
      valorTransmision: g.valorTransmision,
      amortizacionesRestadas: amortizaciones,
      gananciaPatrimonial: hayDatosGanancia ? g.ganancia : 0,
      esPerdida: hayDatosGanancia && g.esPerdida,
      irpfGanancia: irpf,
      totalGastos,
      netoVendedor: precioV - totalGastos,
    };
  }, [
    precioVenta, precioCompraOriginal, gastosAdquisicion, aniosPropiedad,
    valorCatastralSuelo, valorCatastralTotal,
    comisionInmobiliaria, gastosGestoria, perfilVendedor, amortizacionesAcumuladas,
  ]);

  const datosCcaaActual = ITP_CCAA[ccaa];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🏪</span>
        <h1 className={styles.title}>Simulador de Gastos de Compraventa de Local Comercial</h1>
        <p className={styles.subtitle}>
          Si compras: IVA, ITP, AJD, notaría y registro, incluida la renuncia a la exención de IVA con
          inversión del sujeto pasivo. Si vendes: plusvalía municipal, IRPF de la ganancia y neto que recibes
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice lastUpdated={FISCAL_INMUEBLES_META.verificado} />

      {/* Disclaimer Legal — CRÍTICO (fiscal España estructural) */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="simulador-gastos-compraventa-local-comercial"
        collapsible={false}
      />

      <DataReference
        normativa={`ITP/AJD/IVA ${FISCAL_INMUEBLES_META.vigencia}`}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
        nota={FISCAL_INMUEBLES_META.nota}
      />

      {/* Aviso IVA deducible */}
      <div className={styles.ivaAviso} role="note">
        <strong><span aria-hidden="true">💡</span> Si eres empresa o autónomo:</strong> el IVA soportado en la compra de un local comercial
        puede ser <strong>deducible</strong> si tu actividad está sujeta a IVA. Por eso, en segunda mano entre
        profesionales, muchas veces conviene <strong>renunciar a la exención de IVA</strong> para no pagar un ITP
        que no se recupera. Consulta con tu asesor fiscal antes de decidir.
      </div>

      {/* Formulario principal */}
      <section className={styles.mainContent}>
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Datos de la operación</h2>

          {/* Tipo de transmisión */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tipo de transmisión</label>
            <div className={styles.transmisionGrid}>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano')}
                aria-pressed={tipoTransmision === 'segunda-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🔄</span>
                <span>Segunda mano</span>
                <span className={styles.transmisionSub}>Paga ITP (tipo general)</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'segunda-mano-renuncia' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('segunda-mano-renuncia')}
                aria-pressed={tipoTransmision === 'segunda-mano-renuncia'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🤝</span>
                <span>2ª mano con renuncia IVA</span>
                <span className={styles.transmisionSub}>IVA 21% (ISP) + AJD</span>
              </button>
              <button
                type="button"
                className={`${styles.transmisionBtn} ${tipoTransmision === 'primera-mano' ? styles.active : ''}`}
                onClick={() => setTipoTransmision('primera-mano')}
                aria-pressed={tipoTransmision === 'primera-mano'}
              >
                <span className={styles.transmisionIcon} aria-hidden="true">🆕</span>
                <span>Obra nueva / Promotor</span>
                <span className={styles.transmisionSub}>Paga IVA 21% + AJD</span>
              </button>
            </div>
          </div>

          {esRenuncia && (
            <div className={styles.renunciaAviso} role="note">
              <strong><span aria-hidden="true">⚠️</span> Renuncia a la exención de IVA (Art. 20.Dos LIVA):</strong> solo es posible cuando
              comprador y vendedor son empresarios o profesionales con derecho a deducción. El IVA se autoliquida
              por <strong>inversión del sujeto pasivo</strong> (no se paga al vendedor) y es deducible si tienes
              derecho. A cambio, la escritura tributa por AJD, que <strong>muchas CCAA aplican a un tipo
              incrementado</strong> (a menudo 1,5%–2%) en caso de renuncia; este simulador usa el AJD general.
            </div>
          )}

          {/* Precio */}
          <NumberInput
            value={precioVenta}
            onChange={setPrecioVenta}
            label="Precio del local comercial"
            placeholder="200000"
            helperText="Precio escriturado o valor de referencia catastral (el mayor de ambos)"
            min={0}
          />

          {/* Comunidad autónoma */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="select-ccaa">
              Comunidad Autónoma (ubicación del local)
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

          <AvisoTerritorioSinIva ccaa={ccaa} aplica={tipoTransmision === 'primera-mano' || esRenuncia} />

          {/* Info CCAA */}
          <div className={styles.infoCcaa}>
            <div className={styles.infoCcaaHeader}>
              <span className={styles.infoCcaaIcon} aria-hidden="true">📍</span>
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
              <div className={styles.infoCcaaItem}>
                <span className={styles.infoCcaaLabel}>IVA (comercial)</span>
                <span className={styles.infoCcaaValue}>{IVA_LOCAL_COMERCIAL}%</span>
              </div>
            </div>
            {datosCcaaActual.tramosProgresivos && (
              <p className={styles.infoCcaaNote}>
                <span aria-hidden="true">⚠️</span> Esta CCAA aplica escala progresiva ({datosCcaaActual.tramosProgresivos.map(t => `${t.tipo}%`).join(' → ')})
              </p>
            )}
            <p className={styles.infoCcaaNote}>
              Los locales comerciales tributan por el <strong>tipo general</strong> de ITP, sin tipos reducidos
              (los tipos reducidos solo aplican a la vivienda habitual).
            </p>
          </div>

          {/* Gestoría */}
          <div className={styles.inputGroup}>
            <NumberInput
              value={gastosGestoria}
              onChange={setGastosGestoria}
              label="Gastos de gestoría del comprador (€)"
              placeholder="500"
              helperText="Típico en operaciones comerciales: 400-800 €. Solo afecta al presupuesto del comprador"
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
              <span aria-hidden="true">🔗</span> Consultar valor de referencia catastral en la Sede del Catastro
            </a>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultados}>
          {/* Pestañas comprador / vendedor */}
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

          {pestanaActiva === 'comprador' && (resultadosComprador ? (
            <div className={styles.resultsInner}>
              <ResultCard
                title="Precio del local comercial"
                value={formatCurrency(resultadosComprador.precioInmueble)}
                variant="default"
                icon="🏪"
              />

              <ResultCard
                title={`${resultadosComprador.tipoImpuesto} (${formatNumber(resultadosComprador.porcentajeImpuesto, 0)}%)`}
                value={formatCurrency(resultadosComprador.impuestoTransmision)}
                variant="warning"
                icon="📋"
                description={
                  esRenuncia
                    ? 'Autorrepercutido por inversión del sujeto pasivo — deducible si eres sujeto pasivo de IVA'
                    : resultadosComprador.ivaRecuperable
                      ? 'Potencialmente deducible si eres empresa/autónomo sujeto a IVA'
                      : 'Tipo general — los locales comerciales no tienen tipos reducidos'
                }
              />

              {resultadosComprador.ajd > 0 && (
                <ResultCard
                  title={`AJD (${formatNumber(datosCcaaActual.ajd, 2)}%)`}
                  value={formatCurrency(resultadosComprador.ajd)}
                  variant="warning"
                  icon="📄"
                  description={esRenuncia ? 'Algunas CCAA aplican un tipo de AJD incrementado en la renuncia' : undefined}
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
                description={`${formatNumber((resultadosComprador.totalGastos / resultadosComprador.precioInmueble) * 100, 2)}% sobre el precio de compra`}
              />

              <ResultCard
                title="COSTE TOTAL DE ADQUISICIÓN"
                value={formatCurrency(resultadosComprador.totalOperacion)}
                variant="highlight"
                icon="💳"
                description={
                  resultadosComprador.ivaRecuperable
                    ? 'Precio + todos los gastos (antes de deducir el IVA si tienes derecho)'
                    : 'Precio + todos los gastos de la operación'
                }
              />
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>Introduce el precio del local comercial para ver el desglose de gastos</p>
            </div>
          ))}

          {/* ===== VENDEDOR ===== */}
          {pestanaActiva === 'vendedor' && (
            <div className={styles.resultsInner}>
              <div className={styles.formVendedor}>
                <h3 className={styles.formVendedorTitle}>Datos para calcular plusvalía e IRPF</h3>

                <div className={styles.perfilGrid}>
                  <button
                    type="button"
                    aria-pressed={perfilVendedor === 'particular'}
                    className={`${styles.transmisionBtn} ${perfilVendedor === 'particular' ? styles.active : ''}`}
                    onClick={() => setPerfilVendedor('particular')}
                  >
                    <span className={styles.transmisionIcon} aria-hidden="true">🙋</span>
                    <span>Local no afecto</span>
                    <span className={styles.transmisionSub}>Patrimonio particular</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={perfilVendedor === 'afecto-actividad'}
                    className={`${styles.transmisionBtn} ${perfilVendedor === 'afecto-actividad' ? styles.active : ''}`}
                    onClick={() => setPerfilVendedor('afecto-actividad')}
                  >
                    <span className={styles.transmisionIcon} aria-hidden="true">🏪</span>
                    <span>Local afecto a actividad</span>
                    <span className={styles.transmisionSub}>Con amortizaciones</span>
                  </button>
                </div>

                <NumberInput
                  value={precioCompraOriginal}
                  onChange={setPrecioCompraOriginal}
                  label="Precio de compra original"
                  placeholder="150000"
                  helperText="Precio escriturado al adquirir el local, sin los gastos (van en el campo siguiente)"
                  min={0}
                />

                <NumberInput
                  value={gastosAdquisicion}
                  onChange={setGastosAdquisicion}
                  label="Impuestos y gastos que pagaste al comprarlo (€)"
                  placeholder="15000"
                  helperText="ITP o IVA no deducible, notaría, registro y gestoría de aquella compra: suman al valor de adquisición y REDUCEN la ganancia (art. 35.1 LIRPF)"
                  min={0}
                />

                {perfilVendedor === 'afecto-actividad' && (
                  <NumberInput
                    value={amortizacionesAcumuladas}
                    onChange={setAmortizacionesAcumuladas}
                    label="Amortizaciones acumuladas deducidas (€)"
                    placeholder="20000"
                    helperText="Suma de la amortización deducida en tu actividad. Se resta del valor de adquisición y aumenta la ganancia."
                    min={0}
                  />
                )}

                <NumberInput
                  value={aniosPropiedad}
                  onChange={setAniosPropiedad}
                  label="Años de propiedad"
                  placeholder="10"
                  helperText="Años completos desde la compra (máximo 20 para la plusvalía municipal)"
                  min={0}
                />

                <NumberInput
                  value={valorCatastralSuelo}
                  onChange={setValorCatastralSuelo}
                  label="Valor catastral del suelo (€)"
                  placeholder="40000"
                  helperText="Solo la parte de suelo, no la construcción. Aparece en el recibo del IBI."
                  min={0}
                />

                <NumberInput
                  value={valorCatastralTotal}
                  onChange={setValorCatastralTotal}
                  label="Valor catastral total (suelo + construcción) (€)"
                  placeholder="100000"
                  helperText="También en el recibo del IBI. Sin este dato no puede compararse el método real de la plusvalía y se aplica el objetivo"
                  min={0}
                />

                <NumberInput
                  value={comisionInmobiliaria}
                  onChange={setComisionInmobiliaria}
                  label="Comisión de la inmobiliaria (%)"
                  placeholder="3"
                  helperText="Habitual en locales: 3-5% del precio de venta"
                  min={0}
                />

                <NumberInput
                  value={gastosGestoriaVenta}
                  onChange={setGastosGestoriaVenta}
                  label="Gestoría y certificados del vendedor (€)"
                  placeholder="0"
                  helperText="Solo lo que pagas TÚ al vender (certificado energético, gestoría propia). La gestoría del comprador no reduce tu ganancia: art. 35.1 LIRPF"
                  min={0}
                />

                <div className={styles.enlaceCatastro}>
                  <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer" className={styles.catastroLink}>
                    <span aria-hidden="true">🔗</span> Consultar el valor catastral del suelo en la Sede del Catastro
                  </a>
                </div>
              </div>

              {resultadosVendedor ? (
                <>
                  <ResultCard
                    title="Precio de venta"
                    value={formatCurrency(resultadosVendedor.precioVenta)}
                    variant="default"
                    icon="🏪"
                  />

                  <ResultCard
                    title="Plusvalía municipal (IIVTNU)"
                    value={formatCurrency(resultadosVendedor.plusvaliaMunicipal)}
                    variant={resultadosVendedor.exentoPlusvalia ? 'info' : 'warning'}
                    icon="🏛️"
                    description={resultadosVendedor.metodoPlusvalia}
                  />

                  {resultadosVendedor.valorAdquisicionCorregido > 0 && (
                    <>
                      <ResultCard
                        title="Valor de adquisición"
                        value={formatCurrency(resultadosVendedor.valorAdquisicionCorregido)}
                        variant="default"
                        icon="📥"
                        description={
                          resultadosVendedor.amortizacionesRestadas > 0
                            ? `Compra + impuestos y gastos de aquella compra − ${formatCurrency(resultadosVendedor.amortizacionesRestadas)} de amortizaciones deducidas`
                            : 'Precio de compra + impuestos y gastos de aquella compra'
                        }
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
                    <ResultCard
                      title="Ganancia patrimonial"
                      value={formatCurrency(resultadosVendedor.gananciaPatrimonial)}
                      variant="default"
                      icon="📈"
                      description="Valor de transmisión menos valor de adquisición"
                    />
                  )}

                  <ResultCard
                    title="IRPF sobre la ganancia"
                    value={resultadosVendedor.irpfGanancia > 0 ? formatCurrency(resultadosVendedor.irpfGanancia) : 'SIN CUOTA'}
                    variant={resultadosVendedor.irpfGanancia > 0 ? 'warning' : 'success'}
                    icon="🧾"
                    description="Base del ahorro 2025. Un local no tiene exención por reinversión ni por edad."
                  />

                  <ResultCard
                    title="Comisión de la inmobiliaria"
                    value={formatCurrency(resultadosVendedor.comisionInmobiliaria)}
                    variant="default"
                    icon="🤝"
                  />

                  <div className={styles.separador} />

                  <ResultCard
                    title="Total gastos de la venta"
                    value={formatCurrency(resultadosVendedor.totalGastos)}
                    variant="info"
                    icon="➖"
                    description={`${formatNumber((resultadosVendedor.totalGastos / resultadosVendedor.precioVenta) * 100, 2)}% sobre el precio de venta`}
                  />

                  <ResultCard
                    title="NETO QUE RECIBES"
                    value={formatCurrency(resultadosVendedor.netoVendedor)}
                    variant="highlight"
                    icon="💰"
                    description="Precio de venta menos impuestos, comisión y gestoría"
                  />

                  <p className={styles.notaVendedor}>
                    Si el vendedor es una <strong>sociedad</strong>, la ganancia no tributa en el IRPF sino
                    en el <strong>Impuesto sobre Sociedades</strong>. Y si el local se vende con{' '}
                    <strong>renuncia a la exención de IVA</strong>, el vendedor no repercute el impuesto:
                    lo autoliquida el comprador por inversión del sujeto pasivo.
                  </p>
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                  <p>Introduce el precio de venta del local para ver lo que te queda tras impuestos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía fiscal para la compra de un local comercial"
        subtitle="IVA, ITP y la clave que las diferencia: la renuncia a la exención de IVA"
        icon="📚"
      >
        {/* Tabla comparativa de escenarios */}
        <section>
          <h2>Los tres escenarios fiscales de un local comercial</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Escenario</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Impuesto principal</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>AJD</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>¿IVA deducible?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-primary)' }}>Obra nueva (promotor)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', fontWeight: 700, color: 'var(--primary)' }}>IVA 21%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)' }}>Sí</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--bg-primary)', color: '#27ae60' }}>Sí (si sujeto pasivo)</td>
                </tr>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #e0e0e0' }}>Segunda mano (regla general)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', fontWeight: 700 }}>ITP (tipo general)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>No</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e0e0e0', color: '#c0392b' }}>No (ITP no se recupera)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px' }}>Segunda mano con renuncia a la exención</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>IVA 21% (ISP)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Sí (a menudo incrementado)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#27ae60' }}>Sí (si sujeto pasivo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Casos de uso habituales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🆕</span> Autónomo compra local nuevo al promotor</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Paga IVA 21% + AJD. Si está dado de alta en una actividad sujeta a IVA, deduce el IVA
                soportado en la declaración trimestral (modelo 303).
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🔄</span> Particular compra local para invertir</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Al no ser sujeto pasivo de IVA, la operación de segunda mano está exenta de IVA y paga ITP
                al tipo general de su CCAA. El ITP no se recupera, pero se añade al valor de adquisición.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">🤝</span> Empresa compra local usado a otra empresa</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si ambas partes tienen derecho a deducción, el vendedor puede renunciar a la exención de IVA.
                La operación pasa a IVA 21% con inversión del sujeto pasivo: el comprador lo autoliquida y
                deduce, evitando un ITP que no recuperaría.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
              <strong><span aria-hidden="true">📈</span> Vender el local con ganancia</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Si vendes como persona física, la ganancia tributa en el IRPF del ahorro (19%-30%). Si vendes
                como empresa, tributa en el Impuesto de Sociedades. En ambos casos hay plusvalía municipal.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ específica local comercial */}
        <section style={{ marginTop: '2rem' }}>
          <h2>Preguntas frecuentes — Compra de local comercial</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Se paga IVA o ITP al comprar un local comercial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                En obra nueva (primera entrega del promotor) se paga IVA al 21% más AJD. En segunda mano, por
                regla general la operación está exenta de IVA y se paga ITP al tipo general de la comunidad
                autónoma. La excepción es la renuncia a la exención de IVA entre empresarios. Nunca se pagan
                IVA e ITP a la vez.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué es la renuncia a la exención de IVA y a quién le interesa?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                La segunda transmisión de un inmueble está exenta de IVA (Art. 20.Uno.22º LIVA). Si comprador y
                vendedor son empresarios con derecho a deducción, el vendedor puede renunciar a esa exención
                (Art. 20.Dos): la compra tributa por IVA 21% con inversión del sujeto pasivo en lugar de ITP.
                Interesa al comprador que puede deducir el IVA, porque el ITP es un coste no recuperable.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Qué es la inversión del sujeto pasivo en la compra de un local?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Cuando hay renuncia a la exención de IVA, el comprador no paga el IVA al vendedor: lo declara él
                mismo como IVA devengado y, a la vez, como IVA soportado deducible en el modelo 303. Si tiene
                derecho a deducción plena, el efecto en caja es cercano a cero. Es un mecanismo antifraude.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Cuánto AJD se paga si hay renuncia a la exención de IVA?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                La escritura tributa por AJD y muchas comunidades aplican un tipo incrementado (habitualmente
                entre el 1,5% y el 2%) cuando existe renuncia a la exención de IVA, frente al tipo general
                (0,5%-1,5%). Este simulador aplica el AJD general de la CCAA; confirma el tipo incrementado
                exacto de tu comunidad antes de firmar.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
              <strong>¿Hay plusvalía municipal al vender un local comercial?</strong>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Sí. La plusvalía municipal (IIVTNU) grava el incremento de valor del suelo durante el tiempo de
                propiedad, sea el inmueble residencial o comercial. Si no ha habido incremento real del valor
                del terreno, puede acreditarse la exención con las escrituras de compra y venta.
              </p>
            </div>
          </div>
        </section>

        {/* Qué paga el vendedor */}
        <section>
          <h2>Si eres tú quien vende: lo que se lleva Hacienda</h2>
          <p>
            La compra y la venta de un local son dos operaciones fiscales distintas. El comprador
            soporta IVA o ITP; el vendedor responde de otros dos impuestos y, a diferencia de la
            vivienda habitual, sin ninguna de sus exenciones.
          </p>
          <ul>
            <li>
              <strong>Plusvalía municipal (IIVTNU).</strong> El local está sobre suelo urbano, así que
              la transmisión sí genera este impuesto. Puedes elegir entre el método objetivo (coeficientes
              sobre el valor catastral del suelo) y el real (ganancia efectiva del suelo): se aplica el
              que salga menor, y si vendes con pérdida no hay impuesto.
            </li>
            <li>
              <strong>IRPF de la ganancia patrimonial.</strong> Tributa en la base del ahorro con los
              tramos del 19% al 30% de 2025. <strong>No hay exención por reinversión ni por tener más
              de 65 años</strong>: esas dos ventajas son exclusivas de la vivienda habitual.
            </li>
            <li>
              <strong>Amortizaciones si el local estuvo afecto a una actividad.</strong> Si lo usaste en
              tu negocio o lo tuviste alquilado y deduciste amortización, el valor de adquisición se
              minora en la amortización deducida —o en la mínima, aunque no la dedujeras— según el
              artículo 40 del Reglamento del IRPF. La ganancia sube, y con ella el impuesto.
            </li>
            <li>
              <strong>Si el vendedor es una sociedad</strong>, la ganancia no va al IRPF sino al
              Impuesto sobre Sociedades, integrada en la base imponible del ejercicio.
            </li>
          </ul>
          <p>
            Un matiz frecuente: cuando la venta se hace con <strong>renuncia a la exención de IVA</strong>,
            el vendedor no repercute ni ingresa ese IVA. Lo autoliquida el comprador por inversión del
            sujeto pasivo, de modo que para el vendedor no supone ni coste ni cobro.
          </p>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">⚠️</span>
            <strong>Limitaciones de este simulador</strong>
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' }}>
            <li>La renuncia a la exención de IVA solo es válida entre empresarios o profesionales con derecho a deducción; no todos los compradores pueden acogerse.</li>
            <li>En la renuncia, muchas CCAA aplican un tipo de AJD incrementado; este simulador usa el AJD general, así que el coste real de AJD puede ser mayor.</li>
            <li>El IVA solo es deducible si el comprador es sujeto pasivo de IVA con actividad sujeta y no exenta.</li>
            <li>El valor de referencia catastral puede ser la base imponible real del ITP si supera el precio escriturado.</li>
            <li>En la pestaña de vendedor, el tipo municipal del IIVTNU se estima con un valor orientativo: cada ayuntamiento fija el suyo, así que confirma el de tu municipio.</li>
            <li>Si el local estuvo afecto a una actividad, la amortización que debe restarse es la deducida o la mínima, aunque no se hubiera deducido; el simulador usa la cifra que introduzcas.</li>
            <li>Los tipos de ITP y AJD pueden variar; verifica la normativa vigente de tu comunidad autónoma y consulta con tu asesor fiscal antes de cerrar la operación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-gastos-compraventa-local-comercial')} />
      <ShareCard appName="simulador-gastos-compraventa-local-comercial" />
      <Footer appName="simulador-gastos-compraventa-local-comercial" />
    </div>
  );
}
