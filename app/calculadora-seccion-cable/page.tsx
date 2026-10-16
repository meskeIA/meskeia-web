'use client';

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import DataReference from '@/components/DataReference';
import { formatNumber } from '@/lib';
import {
  INTENSIDADES_ITC_BT_19_META,
  METODOS_ITC_BT_19,
  type Aislamiento,
  type MetodoInstalacion,
} from '@/data/rebt-intensidades-admisibles';
import {
  calcularLinea,
  conductoresDeSistema,
  metodosDisponibles,
  SECCIONES_NORMALIZADAS,
  TEMPERATURA_SERVICIO,
  type EntradaCarga,
  type MaterialId,
  type Modo,
  type Sistema,
} from './motor';
import styles from './CalculadoraSeccionCable.module.css';

// ============================================================
// Tipos
// ============================================================
interface LimiteCaida {
  id: string;
  nombre: string;
  porcentaje: number;
  detalle: string;
}

// ============================================================
// Datos técnicos — el cálculo vive en motor.ts y la tabla de
// intensidades admisibles en data/rebt-intensidades-admisibles.ts
// ============================================================
const MATERIALES: { id: MaterialId; nombre: string }[] = [
  { id: 'cobre', nombre: 'Cobre' },
  { id: 'aluminio', nombre: 'Aluminio' },
];

const AISLAMIENTOS: { id: Aislamiento; nombre: string }[] = [
  { id: 'PVC', nombre: 'PVC' },
  { id: 'XLPE', nombre: 'XLPE o EPR' },
];

// Secciones e intensidades de tabla sin decimales forzados: «10 mm²», «50 A», pero «2,5 mm²»
const fmtValor = (v: number) => formatNumber(v, Number.isInteger(v) ? 0 : 1);

const LIMITES: LimiteCaida[] = [
  { id: 'alumbrado', nombre: 'Alumbrado', porcentaje: 3, detalle: 'Circuitos de alumbrado en instalación interior' },
  { id: 'fuerza', nombre: 'Otros usos', porcentaje: 5, detalle: 'Tomas de corriente y receptores de fuerza' },
  { id: 'derivacion', nombre: 'Derivación individual', porcentaje: 1.5, detalle: 'Tramo entre la centralización de contadores y el cuadro' },
  { id: 'libre', nombre: 'Personalizado', porcentaje: 0, detalle: 'Introduce tu propio criterio de cálculo' },
];

export default function CalculadoraSeccionCable() {
  const [modo, setModo] = useState<Modo>('seccion');
  const [sistema, setSistema] = useState<Sistema>('monofasico');
  const [tension, setTension] = useState(230);
  const [entradaCarga, setEntradaCarga] = useState<EntradaCarga>('potencia');
  const [potencia, setPotencia] = useState(3500);
  const [corrienteManual, setCorrienteManual] = useState(16);
  const [cosPhi, setCosPhi] = useState(1);
  const [longitud, setLongitud] = useState(25);
  const [materialId, setMaterialId] = useState<MaterialId>('cobre');
  const [aislamiento, setAislamiento] = useState<Aislamiento>('PVC');
  const [metodoId, setMetodoId] = useState<MetodoInstalacion>('B');
  const [limiteId, setLimiteId] = useState('fuerza');
  const [limitePersonalizado, setLimitePersonalizado] = useState(5);
  const [seccionElegida, setSeccionElegida] = useState(2.5);

  // F y G solo existen en la tabla con 3 conductores cargados: en monofásico se ocultan
  const metodos = useMemo(
    () => metodosDisponibles(aislamiento, conductoresDeSistema(sistema)),
    [aislamiento, sistema],
  );
  const metodo = metodos.includes(metodoId) ? metodoId : 'B';
  const metodoTabla = METODOS_ITC_BT_19.find((m) => m.id === metodo);

  const limite = useMemo(() => {
    const encontrado = LIMITES.find((l) => l.id === limiteId) ?? LIMITES[1];
    if (encontrado.id === 'libre') {
      return { ...encontrado, porcentaje: limitePersonalizado };
    }
    return encontrado;
  }, [limiteId, limitePersonalizado]);

  // ── Cálculo eléctrico ───────────────────────────────────
  const resultado = useMemo(
    () =>
      calcularLinea({
        modo,
        sistema,
        tension,
        entradaCarga,
        potencia,
        corrienteManual,
        cosPhi,
        longitud,
        material: materialId,
        aislamiento,
        metodo,
        limitePorcentaje: limite.porcentaje,
        seccionElegida,
      }),
    [
      modo,
      sistema,
      tension,
      entradaCarga,
      potencia,
      corrienteManual,
      cosPhi,
      longitud,
      materialId,
      aislamiento,
      metodo,
      limite,
      seccionElegida,
    ],
  );

  const handleSistema = (nuevo: Sistema) => {
    setSistema(nuevo);
    setTension(nuevo === 'monofasico' ? 230 : 400);
  };

  // ── Veredicto ───────────────────────────────────────────
  const { intensidad } = resultado;
  const amperios = `${fmtValor(resultado.corriente)} A`;
  const instalacion = `método ${metodo} con aislamiento ${aislamiento === 'PVC' ? 'de PVC' : 'XLPE o EPR'}`;
  const textoSinTabla =
    intensidad.estado === 'sin-tabla'
      ? intensidad.motivo === 'aluminio'
        ? 'La tabla de intensidades admisibles del REBT (ITC-BT-19, Tabla 1) solo recoge conductores de cobre, así que falta comprobar que el aluminio no se calienta con esa corriente: consulta la UNE 20460-5-523.'
        : intensidad.motivo === 'metodo'
          ? 'La tabla de intensidades admisibles no recoge esta combinación de método, aislamiento y número de conductores.'
          : `Con ${amperios} ninguna sección de la tabla aguanta la corriente con el ${instalacion} (el máximo es ${formatNumber(intensidad.izMaxima ?? 0, 0)} A). Hay que repartir la carga en varias líneas o cambiar el método de instalación.`
      : '';

  let veredictoTitulo: string;
  let veredictoDetalle: string;
  let veredictoTono: 'ok' | 'aviso' | 'error';
  if (modo === 'seccion') {
    if (resultado.seccionPorCaida === null) {
      veredictoTono = 'error';
      veredictoTitulo = 'La sección necesaria supera las secciones comerciales habituales';
      veredictoDetalle = `La caída de tensión pide ${formatNumber(resultado.seccionTeorica, 1)} mm². Conviene reducir la longitud, subir la tensión o repartir la carga en varias líneas.`;
    } else if (resultado.seccionRecomendada !== null && intensidad.estado === 'ok') {
      const caida = formatNumber(resultado.caidaPorcentaje, 2);
      veredictoTono = 'ok';
      veredictoTitulo = `Sección recomendada: ${fmtValor(resultado.seccionRecomendada)} mm²`;
      veredictoDetalle =
        resultado.criterioDominante === 'intensidad'
          ? `Por caída de tensión bastarían ${fmtValor(resultado.seccionPorCaida)} mm², pero con ${amperios} el cable se calentaría: con el ${instalacion}, la primera sección que admite esa corriente es ${fmtValor(intensidad.seccion)} mm² (${fmtValor(intensidad.iz)} A). La caída queda en el ${caida} %.`
          : resultado.criterioDominante === 'caida'
            ? `Por calentamiento bastarían ${fmtValor(intensidad.seccion)} mm² (admiten ${fmtValor(intensidad.iz)} A), pero la caída de tensión pide ${fmtValor(resultado.seccionRecomendada)} mm²: el cálculo teórico da ${formatNumber(resultado.seccionTeorica, 2)} mm² y con la sección comercial la caída queda en el ${caida} %.`
            : `Los dos criterios piden la misma sección: admite ${fmtValor(intensidad.iz)} A con el ${instalacion} y la caída queda en el ${caida} %.`;
    } else if (intensidad.estado === 'sin-tabla' && intensidad.motivo === 'excede') {
      veredictoTono = 'error';
      veredictoTitulo = 'La corriente supera la tabla de intensidades admisibles';
      veredictoDetalle = textoSinTabla;
    } else {
      veredictoTono = 'aviso';
      veredictoTitulo = `Sección por caída de tensión: ${fmtValor(resultado.seccionPorCaida)} mm²`;
      veredictoDetalle = `No es una sección recomendada: solo cubre la caída de tensión. ${textoSinTabla}`;
    }
  } else {
    const seccion = `${fmtValor(resultado.seccionUsada)} mm²`;
    const caidaTexto = `pierde ${formatNumber(resultado.caidaV, 2)} V y al receptor le llegan ${formatNumber(resultado.tensionReceptor, 1)} V`;
    if (resultado.cumpleIntensidad === false) {
      veredictoTono = 'error';
      veredictoTitulo = `${seccion} no aguanta ${amperios}: el cable se calienta`;
      veredictoDetalle =
        intensidad.estado === 'ok'
          ? resultado.izSeccionUsada !== null
            ? `Con el ${instalacion}, ${seccion} admite ${fmtValor(resultado.izSeccionUsada)} A. La sección mínima para esa corriente es ${fmtValor(intensidad.seccion)} mm² (${fmtValor(intensidad.iz)} A).`
            : `La tabla no da valor para ${seccion} con el ${instalacion}: empieza en ${fmtValor(intensidad.seccion)} mm², que admite ${fmtValor(intensidad.iz)} A.`
          : textoSinTabla;
    } else if (!resultado.cumpleCaida) {
      veredictoTono = 'error';
      veredictoTitulo = `Caída del ${formatNumber(resultado.caidaPorcentaje, 2)} %: supera el ${formatNumber(limite.porcentaje, 1)} % admisible`;
      veredictoDetalle = `Con ${seccion} la línea ${caidaTexto}.`;
    } else if (resultado.cumpleIntensidad === null) {
      veredictoTono = 'aviso';
      veredictoTitulo = `Caída del ${formatNumber(resultado.caidaPorcentaje, 2)} %: dentro del límite`;
      veredictoDetalle = `Con ${seccion} la línea ${caidaTexto}. ${textoSinTabla}`;
    } else {
      veredictoTono = 'ok';
      veredictoTitulo = `Caída del ${formatNumber(resultado.caidaPorcentaje, 2)} % y ${fmtValor(resultado.izSeccionUsada ?? 0)} A admisibles: la sección cumple`;
      veredictoDetalle = `Con ${seccion} la línea ${caidaTexto}, y el cable admite ${fmtValor(resultado.izSeccionUsada ?? 0)} A con el ${instalacion} frente a los ${amperios} que circulan.`;
    }
  }
  const claseVeredicto =
    veredictoTono === 'ok'
      ? styles.veredictoOk
      : veredictoTono === 'aviso'
        ? styles.veredictoAviso
        : styles.veredictoError;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Calculadora de Sección de Cable y Caída de Tensión</h1>
        <p>Cuántos mm² necesita la línea y cuánta tensión se pierde por el camino</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Veredicto */}
        <section
          className={`${styles.veredicto} ${claseVeredicto}`}
          role="status"
          aria-live="polite"
        >
          <strong>{veredictoTitulo}</strong>
          <span>{veredictoDetalle}</span>
        </section>

        <DisclaimerCard variant="technical" severity="critical" collapsible={false}>
          <p>
            La sección recomendada es la mayor de dos comprobaciones: la <strong>caída de
            tensión</strong> y la <strong>intensidad máxima admisible</strong> del conductor de cobre
            según la Tabla 1 de la ITC-BT-19, que vale para <strong>un solo circuito al aire a
            40 °C</strong>. Si varios circuitos comparten tubo o bandeja, o el cable va enterrado o a
            otra temperatura, la intensidad admisible baja y hay que aplicar los factores de
            corrección de la UNE 20460-5-523. Tampoco se comprueba la resistencia al cortocircuito ni
            la coordinación con la protección (la corriente del magnetotérmico no debe superar la
            admisible del cable).
          </p>
          <p>
            El resultado es orientativo y no sustituye al proyecto o memoria técnica de un instalador
            autorizado. La tabla y los porcentajes de caída propuestos corresponden al REBT español;
            en otros países los fija su propia normativa.
          </p>
        </DisclaimerCard>
        <DataReference
          normativa="REBT, ITC-BT-19 (Tabla 1)"
          fuente={INTENSIDADES_ITC_BT_19_META.fuente}
          verificado={INTENSIDADES_ITC_BT_19_META.verificado}
          urlOficial={INTENSIDADES_ITC_BT_19_META.urlOficial}
          nota={INTENSIDADES_ITC_BT_19_META.nota}
        />

        {/* Modo de cálculo */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>¿Qué quieres calcular?</h2>
          <div className={styles.modoGrid}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'seccion' ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === 'seccion'}
              onClick={() => setModo('seccion')}
            >
              <span className={styles.modoTitulo}>La sección necesaria</span>
              <span className={styles.modoDetalle}>Sé la caída que puedo permitirme</span>
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'caida' ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === 'caida'}
              onClick={() => setModo('caida')}
            >
              <span className={styles.modoTitulo}>La caída de tensión</span>
              <span className={styles.modoDetalle}>Ya tengo una sección y quiero comprobarla</span>
            </button>
          </div>
        </section>

        {/* Datos de la línea */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos de la línea</h2>

          <div className={styles.botoneraGrupo}>
            <span className={styles.grupoEtiqueta}>Sistema</span>
            <div className={styles.botonera}>
              <button
                type="button"
                className={`${styles.chip} ${sistema === 'monofasico' ? styles.chipActivo : ''}`}
                aria-pressed={sistema === 'monofasico'}
                onClick={() => handleSistema('monofasico')}
              >
                Monofásico
              </button>
              <button
                type="button"
                className={`${styles.chip} ${sistema === 'trifasico' ? styles.chipActivo : ''}`}
                aria-pressed={sistema === 'trifasico'}
                onClick={() => handleSistema('trifasico')}
              >
                Trifásico
              </button>
            </div>
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="tension">
                Tensión
                <span className={styles.valueBadge}>{formatNumber(tension, 0)} V</span>
              </label>
              <input
                id="tension"
                type="number"
                inputMode="decimal"
                min={12}
                step={1}
                value={tension}
                onChange={(ev) => setTension(Number(ev.target.value) || 12)}
                className={styles.numberInput}
              />
              <span className={styles.inputHint}>
                {sistema === 'monofasico'
                  ? 'Tensión entre fase y neutro (230 V en España)'
                  : 'Tensión entre fases (400 V en España)'}
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="longitud">
                Longitud de la línea
                <span className={styles.valueBadge}>{formatNumber(longitud, 1)} m</span>
              </label>
              <input
                id="longitud"
                type="number"
                inputMode="decimal"
                min={0.1}
                step={0.5}
                value={longitud}
                onChange={(ev) => setLongitud(Number(ev.target.value) || 0.1)}
                className={styles.numberInput}
              />
              <span className={styles.inputHint}>
                Distancia en un solo sentido: la ida y la vuelta ya están en la fórmula.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="cosphi">
                Factor de potencia (cos φ)
                <span className={styles.valueBadge}>{formatNumber(cosPhi, 2)}</span>
              </label>
              <input
                id="cosphi"
                type="range"
                min={0.5}
                max={1}
                step={0.01}
                value={cosPhi}
                onChange={(ev) => setCosPhi(Number(ev.target.value))}
                className={styles.slider}
              />
              <span className={styles.inputHint}>
                1 en cargas resistivas; 0,8-0,9 con motores o equipos electrónicos.
              </span>
            </div>
          </div>
        </section>

        {/* Carga */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Carga a alimentar</h2>

          <div className={styles.botoneraGrupo}>
            <span className={styles.grupoEtiqueta}>Dato de partida</span>
            <div className={styles.botonera}>
              <button
                type="button"
                className={`${styles.chip} ${entradaCarga === 'potencia' ? styles.chipActivo : ''}`}
                aria-pressed={entradaCarga === 'potencia'}
                onClick={() => setEntradaCarga('potencia')}
              >
                Potencia (W)
              </button>
              <button
                type="button"
                className={`${styles.chip} ${entradaCarga === 'corriente' ? styles.chipActivo : ''}`}
                aria-pressed={entradaCarga === 'corriente'}
                onClick={() => setEntradaCarga('corriente')}
              >
                Corriente (A)
              </button>
            </div>
          </div>

          <div className={styles.inputGrid}>
            {entradaCarga === 'potencia' ? (
              <div className={styles.inputGroup}>
                <label htmlFor="potencia">
                  Potencia activa
                  <span className={styles.valueBadge}>{formatNumber(potencia, 0)} W</span>
                </label>
                <input
                  id="potencia"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={100}
                  value={potencia}
                  onChange={(ev) => setPotencia(Number(ev.target.value) || 1)}
                  className={styles.numberInput}
                />
                <span className={styles.inputHint}>
                  Corriente resultante: {formatNumber(resultado.corriente, 2)} A
                </span>
              </div>
            ) : (
              <div className={styles.inputGroup}>
                <label htmlFor="corriente">
                  Corriente de cálculo
                  <span className={styles.valueBadge}>{formatNumber(corrienteManual, 1)} A</span>
                </label>
                <input
                  id="corriente"
                  type="number"
                  inputMode="decimal"
                  min={0.01}
                  step={1}
                  value={corrienteManual}
                  onChange={(ev) => setCorrienteManual(Number(ev.target.value) || 0.01)}
                  className={styles.numberInput}
                />
                <span className={styles.inputHint}>
                  Suele tomarse la del dispositivo de protección de la línea.
                </span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <span className={styles.grupoEtiqueta}>Conductor</span>
              <div className={styles.botonera}>
                {MATERIALES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.chip} ${materialId === m.id ? styles.chipActivo : ''}`}
                    aria-pressed={materialId === m.id}
                    onClick={() => setMaterialId(m.id)}
                  >
                    {m.nombre}
                  </button>
                ))}
              </div>
              <span className={styles.inputHint}>
                Conductividad aplicada: {formatNumber(resultado.gamma, 0)} m/(Ω·mm²)
              </span>
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.grupoEtiqueta}>Aislamiento</span>
              <div className={styles.botonera}>
                {AISLAMIENTOS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`${styles.chip} ${aislamiento === a.id ? styles.chipActivo : ''}`}
                    aria-pressed={aislamiento === a.id}
                    onClick={() => setAislamiento(a.id)}
                  >
                    {a.nombre}
                  </button>
                ))}
              </div>
              <span className={styles.inputHint}>
                Trabaja hasta {formatNumber(TEMPERATURA_SERVICIO[aislamiento], 0)} °C: la caída se
                calcula con la conductividad a esa temperatura.
              </span>
            </div>
          </div>
        </section>

        {/* Instalación */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Cómo va instalado el cable</h2>
          <div className={styles.botoneraGrupo}>
            <span className={styles.grupoEtiqueta}>Método de instalación (ITC-BT-19)</span>
            <div className={styles.botonera}>
              {metodos.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.chip} ${metodo === id ? styles.chipActivo : ''}`}
                  aria-pressed={metodo === id}
                  onClick={() => setMetodoId(id)}
                >
                  {id}
                </button>
              ))}
            </div>
            <span className={styles.inputHint}>
              {metodoTabla?.descripcion}. Con {resultado.conductoresCargados} conductores cargados
              ({sistema === 'monofasico' ? 'fase y neutro' : 'tres fases'}).
              {sistema === 'monofasico' &&
                ' Los métodos F y G solo aparecen en la tabla para líneas trifásicas.'}
            </span>
          </div>
          <p className={styles.resultNota}>
            Conductores sueltos en tubo empotrado en ladrillo o yeso, o en tubo o canaleta por
            encima de la pared, son el método B. Si la pared lleva aislamiento térmico (un tabique
            de placa con lana mineral, por ejemplo), es el A: el calor sale peor y el cable admite
            menos corriente.
          </p>
        </section>

        {/* Criterio */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {modo === 'seccion' ? 'Caída de tensión admisible' : 'Sección instalada y límite'}
          </h2>

          {modo === 'caida' && (
            <div className={styles.botoneraGrupo}>
              <span className={styles.grupoEtiqueta}>Sección del conductor</span>
              <div className={styles.botonera}>
                {SECCIONES_NORMALIZADAS.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.chip} ${seccionElegida === s ? styles.chipActivo : ''}`}
                    aria-pressed={seccionElegida === s}
                    onClick={() => setSeccionElegida(s)}
                  >
                    {fmtValor(s)} mm²
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.botoneraGrupo}>
            <span className={styles.grupoEtiqueta}>Criterio de caída máxima</span>
            <div className={styles.botonera}>
              {LIMITES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`${styles.chip} ${limiteId === l.id ? styles.chipActivo : ''}`}
                  aria-pressed={limiteId === l.id}
                  onClick={() => setLimiteId(l.id)}
                >
                  {l.nombre}
                  {l.id !== 'libre' && ` · ${formatNumber(l.porcentaje, 1)} %`}
                </button>
              ))}
            </div>
            <span className={styles.inputHint}>
              {LIMITES.find((l) => l.id === limiteId)?.detalle}
            </span>
          </div>

          {limiteId === 'libre' && (
            <div className={styles.inputGroup}>
              <label htmlFor="limitelibre">
                Caída máxima
                <span className={styles.valueBadge}>{formatNumber(limitePersonalizado, 1)} %</span>
              </label>
              <input
                id="limitelibre"
                type="range"
                min={0.5}
                max={10}
                step={0.1}
                value={limitePersonalizado}
                onChange={(ev) => setLimitePersonalizado(Number(ev.target.value))}
                className={styles.slider}
              />
            </div>
          )}
        </section>

        {/* Resultados */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Resultados</h2>

          <div className={styles.resultGrid}>
            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Sección</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Corriente de cálculo</span>
                <span className={styles.resultValue}>{formatNumber(resultado.corriente, 2)} A</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Sección teórica por caída</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.seccionTeorica, 2)} mm²
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Mínima por intensidad admisible</span>
                <span className={styles.resultValue}>
                  {intensidad.estado === 'ok'
                    ? `${fmtValor(intensidad.seccion)} mm²`
                    : 'Sin tabla'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>
                  {modo === 'caida'
                    ? 'Sección instalada'
                    : resultado.seccionRecomendada !== null
                      ? 'Sección recomendada'
                      : 'Sección por caída (normalizada)'}
                </span>
                <span className={styles.resultValueAccent}>
                  {fmtValor(resultado.seccionUsada)} mm²
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Intensidad admisible de esa sección</span>
                <span className={styles.resultValue}>
                  {resultado.izSeccionUsada !== null
                    ? `${fmtValor(resultado.izSeccionUsada)} A`
                    : 'Sin tabla'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Densidad de corriente</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.densidadCorriente, 2)} A/mm²
                </span>
              </div>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Caída de tensión</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Caída</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(resultado.caidaV, 2)} V
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Sobre la tensión nominal</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.caidaPorcentaje, 2)} %
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Admisible ({formatNumber(limite.porcentaje, 1)} %)</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.caidaAdmisibleV, 2)} V
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Tensión en el receptor</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.tensionReceptor, 1)} V
                </span>
              </div>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Pérdidas en el conductor</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Resistencia (un conductor)</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.resistenciaLinea, 4)} Ω
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Pérdida por efecto Joule</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(resultado.perdidas, 1)} W
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Equivale al año (8 h/día)</span>
                <span className={styles.resultValue}>
                  {formatNumber((resultado.perdidas * 8 * 365) / 1000, 1)} kWh
                </span>
              </div>
              <p className={styles.resultNota}>
                Ese calor se disipa en el cable y lo paga el titular de la instalación: subir una
                sección suele amortizarse en líneas largas de uso continuo.
              </p>
            </div>
          </div>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía del cálculo de líneas eléctricas"
          subtitle="Caída de tensión, conductividad y los tres criterios que deciden la sección"
        >
          <p>
            Un conductor no es un cable ideal: tiene resistencia, y esa resistencia hace que la
            tensión que llega al receptor sea menor que la del origen. Si la caída es excesiva, los
            motores arrancan con dificultad, las luminarias pierden flujo y los equipos electrónicos
            se comportan de forma errática. Por eso toda línea se dimensiona comprobando cuánta
            tensión pierde por el camino, además de comprobar que no se caliente en exceso.
          </p>

          <h3 className={styles.eduSubtitle}>Fórmulas clave</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Monofásico</th>
                  <th>Trifásico equilibrado</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Corriente</td>
                  <td>I = P/(V·cos φ)</td>
                  <td>I = P/(√3·V·cos φ)</td>
                  <td>V es fase-neutro en mono y entre fases en trifásico</td>
                </tr>
                <tr>
                  <td>Caída de tensión</td>
                  <td>ΔV = 2·L·I·cos φ/(γ·S)</td>
                  <td>ΔV = √3·L·I·cos φ/(γ·S)</td>
                  <td>El 2 aparece porque la corriente va y vuelve</td>
                </tr>
                <tr>
                  <td>Sección mínima</td>
                  <td>S = 2·L·I·cos φ/(γ·ΔV)</td>
                  <td>S = √3·L·I·cos φ/(γ·ΔV)</td>
                  <td>Es la misma fórmula despejando S</td>
                </tr>
                <tr>
                  <td>Sección desde la potencia</td>
                  <td>S = 2·L·P/(γ·ΔV·V)</td>
                  <td>S = L·P/(γ·ΔV·V)</td>
                  <td>Sustituyendo I; el cos φ se cancela</td>
                </tr>
                <tr>
                  <td>Resistencia del tramo</td>
                  <td colSpan={2}>R = L/(γ·S)</td>
                  <td>Por conductor, con L en metros y S en mm²</td>
                </tr>
                <tr>
                  <td>Pérdidas</td>
                  <td>P = 2·I²·R</td>
                  <td>P = 3·I²·R</td>
                  <td>Calor disipado por efecto Joule</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Conductividad según material y temperatura</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>20 °C</th>
                  <th>70 °C (PVC)</th>
                  <th>90 °C (XLPE/EPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cobre</td>
                  <td>56 m/(Ω·mm²)</td>
                  <td>48 m/(Ω·mm²)</td>
                  <td>44 m/(Ω·mm²)</td>
                </tr>
                <tr>
                  <td>Aluminio</td>
                  <td>35 m/(Ω·mm²)</td>
                  <td>30 m/(Ω·mm²)</td>
                  <td>28 m/(Ω·mm²)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Situaciones habituales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Toma de corriente lejana</h4>
              <p>
                Una línea monofásica larga hasta un garaje o una caseta. Aquí manda casi siempre la
                caída de tensión: con 40 o 50 metros, la sección que pide el cálculo eléctrico supera
                a la que pediría el calentamiento.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Motor trifásico</h4>
              <p>
                Con cos φ de 0,8 y arranques frecuentes. La corriente de arranque puede multiplicar
                por varias veces la nominal, así que conviene ser generoso con la sección aunque el
                régimen permanente no lo exija.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Tramo corto con mucha carga</h4>
              <p>
                Pocos metros y decenas de amperios. Aquí la caída sale ridícula y el criterio que
                decide es el térmico: 40 A en 5 metros apenas pierden tensión con 1,5 mm², pero ese
                cable admite unos 15 A en tubo empotrado y se calentaría. Hacen falta 10 mm² con PVC.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Línea de alumbrado</h4>
              <p>
                Límite más estricto, del 3 %, porque la caída se nota directamente en el nivel de
                iluminación. Con tecnología LED el consumo es bajo y rara vez es un problema, pero el
                criterio sigue vigente.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué el monofásico lleva un 2 y el trifásico un √3?</strong>
              <p>
                En monofásico la corriente recorre el conductor de ida y el de vuelta, así que la
                longitud efectiva es el doble. En un sistema trifásico equilibrado no hay retorno por
                el neutro y la relación entre la tensión de línea y la de fase introduce el factor
                √3.
              </p>
              <p className={styles.faqTip}>
                Consecuencia práctica: para la misma potencia y distancia, el trifásico necesita
                bastante menos cobre.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La longitud es de ida o de ida y vuelta?</strong>
              <p>
                Se introduce la distancia en un solo sentido, desde el origen hasta el receptor. El
                recorrido de vuelta ya está contemplado en el factor 2 de la fórmula monofásica, así
                que doblarla sería contarla dos veces.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa si elijo una sección menor de la calculada?</strong>
              <p>
                La caída aumenta de forma inversamente proporcional: bajar de 6 a 4 mm² multiplica la
                caída por 1,5. El receptor recibe menos tensión, las pérdidas por calor crecen con el
                cuadrado de la corriente y el cable trabaja más caliente, lo que a su vez empeora la
                conductividad.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuánto cuesta realmente una caída de tensión alta?</strong>
              <p>
                La energía perdida se disipa como calor y se factura igual que la consumida. En una
                línea con pérdidas de 60 W funcionando ocho horas al día son unos 175 kWh al año, que
                a los precios habituales del mercado doméstico suponen varias decenas de euros
                anuales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Sirve este cálculo fuera de España?</strong>
              <p>
                Las fórmulas y las conductividades son universales, porque son física. Lo que cambia
                de un país a otro son los porcentajes de caída admisible, las tensiones normalizadas
                y las tablas de intensidad máxima. Usa el modo personalizado para introducir el
                criterio de caída que aplique en tu país, y contrasta la intensidad admisible con su
                tabla: la de aquí es la del REBT español.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo dimensionar una línea, paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Determina la corriente de cálculo</strong>
                <p>A partir de la potencia prevista y el factor de potencia, o de la protección que va a llevar la línea.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Mide la longitud real del recorrido</strong>
                <p>Siguiendo el trazado por canalizaciones, no en línea recta. Es el dato que más se subestima.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Fija el límite de caída que te aplica</strong>
                <p>Alumbrado, otros usos o derivación individual, según el tramo y la normativa vigente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la sección y sube a la normalizada</strong>
                <p>Nunca se redondea a la baja: se toma siempre la primera sección comercial igual o superior.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba el criterio térmico y el cortocircuito</strong>
                <p>
                  La calculadora contrasta la sección con la tabla de intensidad admisible de la
                  ITC-BT-19 para tu método de instalación. Si hay varios circuitos juntos, aplica
                  además el factor de agrupamiento, y comprueba el cortocircuito. La sección final es
                  la mayor de todas.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Calcula en caliente</strong>
                <p>Usa la conductividad de la temperatura de servicio, no la de 20 °C: la diferencia ronda el 15 %.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📈</span>
              <div>
                <strong>Prevé el crecimiento</strong>
                <p>Cambiar un cable enterrado cuesta mucho más que instalar una sección mayor desde el principio.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <div>
                <strong>Suma las caídas del recorrido</strong>
                <p>La caída total desde el origen es acumulativa: derivación individual más circuito interior.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <div>
                <strong>Reparte cargas grandes</strong>
                <p>Dos líneas de sección media suelen salir mejor que una enorme difícil de curvar y conectar.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Quedarse solo con la caída de tensión. En un tramo corto sale una sección diminuta
                que se calentaría: la definitiva es la mayor entre este criterio, el térmico y el de
                cortocircuito.
              </li>
              <li>
                Introducir la longitud de ida y vuelta. La fórmula monofásica ya incluye el factor 2.
              </li>
              <li>
                Usar la conductividad de 20 °C para un cable que va a trabajar a 70 u 80 °C, lo que
                deja la caída real por encima de la calculada.
              </li>
              <li>
                Aplicar la fórmula monofásica a una línea trifásica: el factor correcto es √3, no 2.
              </li>
              <li>
                Confundir la tensión entre fases (400 V) con la de fase-neutro (230 V) al introducir
                los datos de un sistema trifásico.
              </li>
              <li>
                Redondear la sección hacia abajo porque el resultado queda «casi» en la sección
                inferior. Siempre se sube a la siguiente normalizada.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="calculadora-seccion-cable" />
      </main>

      <Footer appName="calculadora-seccion-cable" />
    </div>
  );
}
