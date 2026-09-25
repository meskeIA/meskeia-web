'use client';

import { useState, useCallback } from 'react';
import styles from './EstimadorIRPF.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatNumber, formatCurrency, formatDate, parseISODateLocal, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  DEDUCCION_RENDIMIENTOS_TRABAJO_2025,
  MINIMOS_IRPF_2025,
  OBLIGACION_DECLARAR_2025,
  LIMITES_PLAN_PENSIONES_2025,
  APORTACIONES_PLAN_CONYUGE,
  DEDUCCION_MATERNIDAD_IRPF,
  calcularCuotaIntegraGeneral,
} from '@/data/fiscal';
import { EJERCICIO, estimarIRPF, type EntradaIRPF, type ResultadoIRPF, type SituacionFamiliar } from './motor';

// ─── Ejemplos del bloque educativo ────────────────────────────────────────────
//
// Salen del MISMO motor que la calculadora: hasta el 24/09/2026 eran cifras escritas a mano
// que restaban el mínimo de la base y arrastraban la reducción residual del art. 20 ya
// derogada, y contradecían a la propia app en más de 1.000 € (hallazgo 1314).

const ENTRADA_BASE: EntradaIRPF = {
  brutoTrabajo: 0,
  capitalMobiliario: 0,
  retenciones: 0,
  situacion: 'soltero',
  numHijos: 0,
  hijosMenores3: 0,
  conNomina: true,
};

const ESC_SOLTERO = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 28000 });
const ESC_CASADA = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 45000, situacion: 'casado_dos_ingresos', numHijos: 2 });
const ESC_CASADA_SIN_HIJOS = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 45000, situacion: 'casado_dos_ingresos' });
const ESC_PENSION = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 18000, conNomina: false });
const ESC_PENSION_65 = estimarIRPF({
  ...ENTRADA_BASE, brutoTrabajo: 18000, conNomina: false, minimoContribuyente: MINIMOS_IRPF_2025.personal_65,
});
const ESC_PENSION_24 = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 24000, conNomina: false });
const ESC_SUELDO_30 = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 30000 });
const ESC_SUELDO_50 = estimarIRPF({ ...ENTRADA_BASE, brutoTrabajo: 50000 });

// Autónomo: la calculadora no admite rendimientos de actividades económicas, así que el
// ejemplo aplica a mano la misma escala y el mismo método del mínimo (art. 63.1.2.º).
const AUTONOMO_RENDIMIENTO_NETO = 35000;
const AUTONOMO_CUOTA = calcularCuotaIntegraGeneral(AUTONOMO_RENDIMIENTO_NETO, MINIMOS_IRPF_2025.personal);

// FAQ del tipo marginal frente al efectivo
const FAQ_BASE = 35200;
const FAQ_CUOTA = calcularCuotaIntegraGeneral(FAQ_BASE, MINIMOS_IRPF_2025.personal);
const FAQ_MARGINAL = TRAMOS_IRPF_2025.find((t) => FAQ_BASE <= t.hasta)?.tipo ?? 0;

// Consejo del plan de pensiones: ahorro de una aportación al tipo marginal de un tramo real
// de la escala (el tercero, el de las rentas medias), no a un tipo escrito a mano.
const PLAN_MARGINAL = TRAMOS_IRPF_2025[2].tipo;
const PLAN_APORTACION = 1000;

/** Espacio duro entre la cifra y el %: separa sin dejar el signo solo en otra línea (RAE 2010). */
const NBSP = '\u00A0';
const pct = (n: number): string => `${formatNumber(n, 2)}${NBSP}%`;
/** Tipo de una escala (19, 24, 30…): sin decimales cuando no los tiene. */
const tipoPct = (n: number): string => `${formatNumber(n, Number.isInteger(n) ? 0 : 2)}${NBSP}%`;
const eur = (n: number): string => formatCurrency(n);
/** Importe normativo sin céntimos cuando no los tiene (19.747,5 € no se redondea). */
const eur0 = (n: number): string => `${formatNumber(n, Number.isInteger(n) ? 0 : 2)} €`;

/** Importe de un campo: vacío = 0 € · ilegible = null, que se rechaza (hallazgo 1854). */
function leerImporte(texto: string): number | null {
  if (texto.trim() === '') return 0;
  const n = parseSpanishNumber(texto);
  return Number.isNaN(n) ? null : n;
}

/** Número de hijos: vacío = 0 · no entero, negativo o ilegible = null (hallazgo 1855). */
function leerEntero(texto: string): number | null {
  if (texto.trim() === '') return 0;
  const n = parseSpanishNumber(texto);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Tabla de una escala (general o del ahorro) con los límites que trae data/fiscal. */
function filasEscala(escala: { hasta: number; tipo: number }[]) {
  return escala.map((t, i) => ({
    desde: i === 0 ? 0 : escala[i - 1].hasta,
    hasta: t.hasta === Infinity ? null : t.hasta,
    tipo: t.tipo,
  }));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorIRPFPage() {
  // Entradas
  const [rendimientosTrabajo, setRendimientosTrabajo] = useState('');
  const [rendimientosCapital, setRendimientosCapital] = useState('');
  const [situacion, setSituacion] = useState<SituacionFamiliar>('soltero');
  const [numHijos, setNumHijos] = useState('0');
  const [hijosMenores3, setHijosMenores3] = useState('0');
  const [retencionesPracticadas, setRetencionesPracticadas] = useState('');
  const [esTrabajador, setEsTrabajador] = useState(true);

  // Resultado
  const [resultado, setResultado] = useState<ResultadoIRPF | null>(null);
  const [aviso, setAviso] = useState('');

  const calcular = useCallback(() => {
    const bruto = leerImporte(rendimientosTrabajo);
    const capital = leerImporte(rendimientosCapital);
    const retenciones = leerImporte(retencionesPracticadas);
    const hijos = leerEntero(numHijos);
    const hijosM3 = leerEntero(hijosMenores3);

    // Una entrada que no se puede estimar BORRA el resultado anterior: si no, la cifra de la
    // entrada previa seguía a la vista como si fuera de la nueva (hallazgo 1313).
    const rechazar = (motivo: string) => {
      setResultado(null);
      setAviso(motivo);
    };

    // Un campo ilegible NO vale 0: hasta el 25/09/2026 `parseSpanishNumber(x) || 0` estimaba
    // unas retenciones «4.928.70» como 0 € retenidos y daba la cuota entera a pagar, con el
    // campo mostrando lo tecleado (hallazgo 1854).
    if (bruto === null || capital === null || retenciones === null) {
      const ilegibles = [
        { valor: bruto, texto: rendimientosTrabajo, campo: 'Rendimientos del trabajo' },
        { valor: capital, texto: rendimientosCapital, campo: 'Rendimientos del capital mobiliario' },
        { valor: retenciones, texto: retencionesPracticadas, campo: 'Retenciones ya practicadas' },
      ].filter((c) => c.valor === null);
      rechazar(
        `No se puede leer ${ilegibles.map((c) => `«${c.texto}» en «${c.campo}»`).join(' ni ')}. `
        + 'Escribe el importe con coma decimal, por ejemplo 4928,70 o 4.928,70.',
      );
      return;
    }

    // Tampoco un número de hijos no entero: parseInt('0,5') daba 0 y el hijo se perdía sin
    // aviso (hallazgo 1855). Cada hijo se cuenta entero; el prorrateo del mínimo entre los
    // progenitores (art. 61.1.ª) lo aplica el motor según la situación, no una fracción de hijo.
    if (hijos === null || hijosM3 === null) {
      rechazar('El número de hijos tiene que ser un número entero (0, 1, 2…): cada hijo se cuenta entero.');
      return;
    }
    if (hijosM3 > hijos) {
      rechazar('No puede haber más hijos menores de 3 años que hijos a cargo.');
      return;
    }

    if (bruto <= 0 && capital <= 0) {
      setResultado(null);
      setAviso('Introduce unos rendimientos del trabajo o del capital mayores que 0 para estimar el IRPF.');
      return;
    }

    setAviso('');
    setResultado(estimarIRPF({
      brutoTrabajo: Math.max(0, bruto),
      capitalMobiliario: Math.max(0, capital),
      retenciones: Math.max(0, retenciones),
      situacion,
      numHijos: hijos,
      hijosMenores3: hijosM3,
      conNomina: esTrabajador,
    }));
  }, [rendimientosTrabajo, rendimientosCapital, situacion, numHijos, hijosMenores3, retencionesPracticadas, esTrabajador]);

  const limpiar = () => {
    setRendimientosTrabajo('');
    setRendimientosCapital('');
    setRetencionesPracticadas('');
    setNumHijos('0');
    setHijosMenores3('0');
    setResultado(null);
    setAviso('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>{`Estimador IRPF ${EJERCICIO}`}</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre tu declaración de la renta del ejercicio {EJERCICIO} (se presenta en {EJERCICIO + 1}): cuota íntegra, retenciones y resultado orientativo
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={`IRPF ${EJERCICIO} (declaración de la renta de ${EJERCICIO + 1})`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota={`Todos los datos son del ejercicio ${EJERCICIO}: escala general y del ahorro, mínimos, reducciones y cotización del trabajador (tipos y bases de ${EJERCICIO}, Orden PJC/178/2025).`}
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tus datos orientativos</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={esTrabajador}
                  onChange={e => setEsTrabajador(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                  aria-describedby="ayuda-nomina"
                />
                Soy trabajador por cuenta ajena (con nómina)
              </label>
              <p id="ayuda-nomina" className={styles.ayuda}>
                Decide la cotización a la Seguridad Social y la deducción por obtención de rendimientos
                del trabajo, que exige prestar servicios. Desmárcala si es una pensión: los{' '}
                {eur0(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)} de gastos (art. 19.2.f) y
                la reducción del art. 20 se aplican igual.
              </p>
            </div>

            <NumberInput
              value={rendimientosTrabajo}
              onChange={setRendimientosTrabajo}
              label="Rendimientos del trabajo brutos anuales"
              placeholder="30000"
              helperText="Salario bruto total del año (sin descontar SS ni IRPF)"
              min={0}
            />

            <NumberInput
              value={rendimientosCapital}
              onChange={setRendimientosCapital}
              label="Rendimientos del capital mobiliario (opcional)"
              placeholder="0"
              helperText={`Dividendos e intereses del año. Van a la base del ahorro, con su propia escala (del ${tipoPct(TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo)} al ${tipoPct(TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo)})`}
              min={0}
            />

            <NumberInput
              value={retencionesPracticadas}
              onChange={setRetencionesPracticadas}
              label="Retenciones ya practicadas"
              placeholder="0"
              helperText="Total IRPF retenido en nómina + otros (ver certificado retenciones)"
              min={0}
            />

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="situacion">Situación personal</label>
              <select
                id="situacion"
                value={situacion}
                onChange={e => setSituacion(e.target.value as SituacionFamiliar)}
                className={styles.select}
              >
                <option value="soltero">Soltero/a o divorciado/a</option>
                <option value="casado_un_ingreso">Casado/a (único ingreso familiar)</option>
                <option value="casado_dos_ingresos">Casado/a (dos ingresos)</option>
                <option value="familia_monoparental">Familia monoparental</option>
              </select>
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={numHijos}
                onChange={setNumHijos}
                label="Hijos a cargo"
                placeholder="0"
                min={0}
                max={10}
              />
              <NumberInput
                value={hijosMenores3}
                onChange={setHijosMenores3}
                label="Hijos menores de 3 años"
                placeholder="0"
                min={0}
                max={leerEntero(numHijos) ?? 0}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" onClick={calcular} className={styles.btnPrimary}>
                Estimar IRPF
              </button>
              <button type="button" onClick={limpiar} className={styles.btnSecondary} aria-label="Limpiar formulario">
                Limpiar
              </button>
            </div>
            <div role="alert" aria-live="polite">
              {aviso && <p className={styles.aviso}>{aviso}</p>}
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Resultado principal */}
              <div className={styles.resultadoFinal}>
                <p className={styles.resultadoLabel}>
                  {resultado.cuotaDiferencial >= 0 ? 'Resultado estimado: A PAGAR' : 'Resultado estimado: A DEVOLVER'}
                </p>
                <div
                  className={resultado.cuotaDiferencial >= 0 ? styles.resultadoValorPagar : styles.resultadoValorDevolver}
                  role="status"
                  aria-live="polite"
                >
                  {formatCurrency(Math.abs(resultado.cuotaDiferencial))}
                </div>
                <span className={resultado.cuotaDiferencial >= 0 ? styles.resultadoBadgePagar : styles.resultadoBadgeDevolver}>
                  <span aria-hidden="true">{resultado.cuotaDiferencial >= 0 ? '📤' : '📥'}</span>{resultado.cuotaDiferencial >= 0 ? ' A ingresar en Hacienda' : ' Hacienda te devuelve'}
                </span>
              </div>

              {/* Tarjetas resumen */}
              <div className={styles.resultsGrid}>
                <ResultCard
                  title="Cuota íntegra"
                  value={formatNumber(resultado.cuotaIntegra, 2)}
                  unit="€"
                  variant="highlight"
                  icon="📊"
                  description={resultado.baseLiquidableAhorro > 0
                    ? 'Base general + base del ahorro, antes de deducciones y retenciones'
                    : 'IRPF antes de deducciones y retenciones'}
                />
                {resultado.deduccionRentasBajas > 0 && (
                  <ResultCard
                    title="Deducción rentas bajas"
                    value={`-${formatNumber(resultado.deduccionRentasBajas, 2)}`}
                    unit="€"
                    variant="success"
                    icon="🟢"
                    description={`Por obtención de rendimientos del trabajo (nóminas de menos de ${eur0(DEDUCCION_RENDIMIENTOS_TRABAJO_2025.limiteMaximo)} brutos)`}
                  />
                )}
                <ResultCard
                  title="Tipo efectivo"
                  value={formatNumber(resultado.tipoEfectivo, 2)}
                  unit={`${NBSP}%`}
                  variant="info"
                  icon="📈"
                  description={resultado.baseImponibleAhorro > 0
                    ? 'Porcentaje sobre la suma de las dos bases imponibles'
                    : 'Porcentaje sobre base imponible'}
                />
                <ResultCard
                  title="Base imponible general"
                  value={formatNumber(resultado.baseImponibleGeneral, 2)}
                  unit="€"
                  variant="default"
                  icon="📋"
                  description="Trabajo: bruto menos cotización, gastos y reducción del art. 20"
                />
                {resultado.baseImponibleAhorro > 0 && (
                  <ResultCard
                    title="Base del ahorro"
                    value={formatNumber(resultado.baseImponibleAhorro, 2)}
                    unit="€"
                    variant="default"
                    icon="🏦"
                    description="Dividendos e intereses (arts. 46 y 66 LIRPF)"
                  />
                )}
                <ResultCard
                  title="Mínimos personales"
                  value={formatNumber(resultado.minimosPersonalesFamiliares, 2)}
                  unit="€"
                  variant="success"
                  icon="👨‍👩‍👧"
                  description="No reducen la base: se gravan a tipo cero (art. 63.1.2.º)"
                />
              </div>

              {/* Desglose por tramos */}
              <div className={styles.tramosSection}>
                <h3 className={styles.tramosTitle}><span aria-hidden="true">📊</span> {`Desglose por tramos IRPF ${EJERCICIO} · base general`}</h3>
                {resultado.desgloseTramos.length > 0 ? (
                  <table className={styles.tramosTable}>
                    <thead>
                      <tr>
                        <th>Desde</th>
                        <th>Hasta</th>
                        <th>Tipo</th>
                        <th>Base aplicada</th>
                        <th>Cuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.desgloseTramos
                        .filter(t => t.baseAplicada > 0)
                        .map((t, i) => (
                          <tr key={i} className={styles.tramoAplicado}>
                            <td>{formatCurrency(t.desde)}</td>
                            <td>{t.hasta !== null ? formatCurrency(t.hasta) : 'En adelante'}</td>
                            <td>{tipoPct(t.tipo)}</td>
                            <td>{formatCurrency(t.baseAplicada)}</td>
                            <td>{formatCurrency(t.cuota)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.tramosNota}>La base liquidable general es 0: no hay cuota general.</p>
                )}
                <p className={styles.tramosNota}>
                  Los tramos se aplican a la base liquidable general <strong>entera</strong>{' '}
                  ({formatCurrency(resultado.baseLiquidableGeneral)}) y suman{' '}
                  {formatCurrency(resultado.cuotaEscalaGeneral)}. De ahí se resta la misma escala
                  aplicada al mínimo personal y familiar (
                  {formatCurrency(Math.min(resultado.minimosPersonalesFamiliares, resultado.baseLiquidableGeneral))} →{' '}
                  {formatCurrency(resultado.cuotaMinimoGeneral)}), que es la forma en que la ley lo
                  grava a tipo cero (art. 63.1.2.º LIRPF). Cuota íntegra general:{' '}
                  {formatCurrency(resultado.cuotaIntegraGeneral)}.
                  {resultado.reduccionConjunta > 0 && (
                    <>
                      {' '}Antes de todo eso se restó de la base la reducción por tributación
                      conjunta de {formatCurrency(resultado.reduccionConjunta)} (art. 84.2
                      LIRPF), que esa sí reduce la base.
                    </>
                  )}
                  {resultado.reduccionPerdidaPorOtrasRentas && (
                    <>
                      {' '}No se aplica la reducción por rendimientos del trabajo: tus otras rentas
                      superan {eur0(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limiteOtrasRentas)} (art. 20 LIRPF).
                    </>
                  )}
                </p>

                {resultado.baseLiquidableAhorro > 0 && (
                  <>
                    <h3 className={styles.tramosTitle}><span aria-hidden="true">🏦</span> {`Base del ahorro IRPF ${EJERCICIO}`}</h3>
                    <table className={styles.tramosTable}>
                      <thead>
                        <tr>
                          <th>Desde</th>
                          <th>Hasta</th>
                          <th>Tipo</th>
                          <th>Base aplicada</th>
                          <th>Cuota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.desgloseAhorro
                          .filter(t => t.baseAplicada > 0)
                          .map((t, i) => (
                            <tr key={i} className={styles.tramoAplicado}>
                              <td>{formatCurrency(t.desde)}</td>
                              <td>{t.hasta !== null ? formatCurrency(t.hasta) : 'En adelante'}</td>
                              <td>{tipoPct(t.tipo)}</td>
                              <td>{formatCurrency(t.baseAplicada)}</td>
                              <td>{formatCurrency(t.cuota)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <p className={styles.tramosNota}>
                      Los dividendos y los intereses no se suman a la base general: tributan en la
                      base del ahorro con su propia escala (art. 66 LIRPF), que suma{' '}
                      {formatCurrency(resultado.cuotaEscalaAhorro)}.
                      {resultado.minimoEnAhorro > 0 && (
                        <>
                          {' '}La parte del mínimo que no cabía en la base general (
                          {formatCurrency(resultado.minimoEnAhorro)}) se grava a tipo cero en esta
                          base (art. 56.2 LIRPF): {formatCurrency(resultado.cuotaMinimoAhorro)} menos.
                        </>
                      )}
                      {' '}Cuota íntegra del ahorro: {formatCurrency(resultado.cuotaIntegraAhorro)}.
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>Introduce tus datos y pulsa «Estimar IRPF» para ver el resultado orientativo</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Herramienta de Orientación — No es asesoramiento fiscal</h3>
        <p>
          Este estimador proporciona una <strong>aproximación orientativa</strong> basada en{' '}
          <a href={FISCAL_IRPF_META.urlOficial} target="_blank" rel="noopener noreferrer">
            {FISCAL_IRPF_META.fuente}
          </a>. El cálculo real puede variar significativamente según:
        </p>
        <ul>
          <li>Tu comunidad autónoma (la tarifa autonómica puede diferir del tipo medio usado aquí)</li>
          <li>Deducciones autonómicas y estatales aplicables a tu situación</li>
          <li>Tu edad, ascendientes a cargo o discapacidad, que aumentan el mínimo y esta calculadora no pide</li>
          <li>Otras fuentes de renta no incluidas (inmuebles, actividades económicas, plusvalías)</li>
          <li>Aportaciones a planes de pensiones, hipotecas antiguas, donativos, etc.</li>
          <li>Cambios normativos posteriores a la fecha de verificación</li>
        </ul>
        <p>
          <strong>NO constituye asesoramiento fiscal.</strong> Para un cálculo exacto, utiliza el{' '}
          <a href="https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml" target="_blank" rel="noopener noreferrer">
            simulador oficial de la Agencia Tributaria (Renta WEB)
          </a>{' '}
          o consulta con un asesor fiscal.
        </p>
        <p className={styles.disclaimerFecha}>
          Datos verificados: {formatDate(parseISODateLocal(FISCAL_IRPF_META.verificado))} | Ejercicio calculado: {EJERCICIO}
        </p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres entender mejor el IRPF?"
        subtitle="Cómo funciona la declaración de la renta, los tramos y cómo interpretar el resultado"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Cómo se calcula el IRPF?</h2>
          <p>
            El IRPF (Impuesto sobre la Renta de las Personas Físicas) grava la renta obtenida en el año.
            El proceso de cálculo tiene varios pasos:
          </p>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">1️⃣</span> Base imponible</h4>
              <p>
                En la base general, al sueldo bruto se le restan la cotización a la Seguridad Social,{' '}
                {eur0(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)} de otros gastos y la reducción por
                rendimientos del trabajo: hasta {eur0(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} en
                rentas bajas, que se agota con {eur0(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)} de
                rendimiento neto. Dividendos e intereses van aparte, a la base del ahorro.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">2️⃣</span> Mínimo personal y familiar</h4>
              <p>
                La parte de la renta que no tributa: {eur0(MINIMOS_IRPF_2025.personal)} por defecto, más
                cantidades por edad, hijos, ascendientes o discapacidad. <strong>No reduce la base</strong>:
                se grava a tipo cero (art. 63.1.2.º LIRPF). La escala se aplica a la base entera y
                también al mínimo, y la segunda cuota se resta de la primera.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">3️⃣</span> Cuota íntegra</h4>
              <p>
                El resultado de aplicar la escala general a la base liquidable general y la escala
                del ahorro a la del ahorro, menos la cuota del mínimo. Es un impuesto progresivo:
                cada tramo solo se aplica a la parte de renta que entra en él.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">4️⃣</span> Cuota diferencial</h4>
              <p>
                Cuota íntegra menos deducciones y menos las retenciones ya practicadas durante el año.
                Si es positiva, debes pagar a Hacienda. Si es negativa, Hacienda te devuelve.
              </p>
            </div>
          </div>

          <h3>{`Escala general IRPF ${EJERCICIO} (estatal + autonómica media)`}</h3>
          <table className={styles.tramosOrientativos}>
            <thead>
              <tr><th>Desde</th><th>Hasta</th><th>Tipo marginal</th></tr>
            </thead>
            <tbody>
              {filasEscala(TRAMOS_IRPF_2025).map((t) => (
                <tr key={t.desde}>
                  <td>{eur0(t.desde)}</td>
                  <td>{t.hasta !== null ? eur0(t.hasta) : 'En adelante'}</td>
                  <td>{tipoPct(t.tipo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            * Tipos orientativos que combinan tarifa estatal + autonómica media. Tu CCAA puede variar.
          </p>

          <h3>{`Escala de la base del ahorro IRPF ${EJERCICIO} (dividendos, intereses y ganancias)`}</h3>
          <table className={styles.tramosOrientativos}>
            <thead>
              <tr><th>Desde</th><th>Hasta</th><th>Tipo</th></tr>
            </thead>
            <tbody>
              {filasEscala(TRAMOS_GANANCIAS_PATRIMONIALES_2025).map((t) => (
                <tr key={t.desde}>
                  <td>{eur0(t.desde)}</td>
                  <td>{t.hasta !== null ? eur0(t.hasta) : 'En adelante'}</td>
                  <td>{tipoPct(t.tipo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── SECCIÓN 1: Tabla comparativa de perfiles ──────────────────── */}
        <section className={styles.guideSection}>
          <h2>¿Qué tipo de contribuyente eres? Comparativa de perfiles</h2>
          <p>El IRPF funciona de forma diferente según tu relación laboral y situación personal. Esta tabla resume las diferencias clave:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Trabajador cuenta ajena</th>
                  <th>Autónomo (RETA)</th>
                  <th>Pensionista</th>
                  <th>Dos perceptores en el hogar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Obligación de declarar</strong></td>
                  <td>
                    Un pagador: más de {eur0(OBLIGACION_DECLARAR_2025.trabajo.unPagador)} · varios pagadores:
                    más de {eur0(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)} si del 2.º y siguientes
                    llegan más de {eur0(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)}
                  </td>
                  <td>Siempre si ingresos &gt;1000 € (actividad económica)</td>
                  <td>Los mismos umbrales que el asalariado: la pensión es rendimiento del trabajo</td>
                  <td>Cada uno con su propio umbral si declaran por separado</td>
                </tr>
                <tr>
                  <td><strong>Cómo se retiene</strong></td>
                  <td>La empresa retiene automáticamente en nómina</td>
                  <td>Clientes retienen 15&nbsp;% (7&nbsp;% primeros 3 años); pagos propios trimestrales (mod. 130)</td>
                  <td>La entidad que paga la pensión retiene según su cuantía</td>
                  <td>Cada empleador retiene según sus datos; riesgo de infra-retención</td>
                </tr>
                <tr>
                  <td><strong>Deducciones típicas</strong></td>
                  <td>SS, reducción rendimientos trabajo, mínimos familiares</td>
                  <td>Todos los gastos de actividad, cuotas RETA, amortizaciones</td>
                  <td>
                    {eur0(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)} de gastos y reducción del art. 20
                    como cualquier rendimiento del trabajo; mínimo personal de{' '}
                    {eur0(MINIMOS_IRPF_2025.personal_65)} desde los 65 años
                  </td>
                  <td>Mínimo por hijos repartido a partes iguales si declaran por separado; puede convenir tributación conjunta</td>
                </tr>
                <tr>
                  <td><strong>Tipo efectivo orientativo</strong></td>
                  <td>{pct(ESC_SUELDO_30.tipoEfectivo)} con 30.000 € brutos; {pct(ESC_SUELDO_50.tipoEfectivo)} con 50.000 €</td>
                  <td>{pct((AUTONOMO_CUOTA / AUTONOMO_RENDIMIENTO_NETO) * 100)} con 35.000 € de rendimiento neto</td>
                  <td>{pct(ESC_PENSION.tipoEfectivo)} a {pct(ESC_PENSION_24.tipoEfectivo)} con pensiones de 18.000 a 24.000 € (menos desde los 65 años)</td>
                  <td>Individualmente menor; conjunta puede ser peor si ambos ingresos similares</td>
                </tr>
                <tr>
                  <td><strong>Complejidad declaración</strong></td>
                  <td>Baja-media. Borrador suele ser correcto</td>
                  <td>Alta. Requiere libro de facturas + contabilidad de gastos</td>
                  <td>Baja. Datos precompletados por la SS</td>
                  <td>Media. Conviene comparar individual vs conjunta antes de confirmar</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tipo efectivo: cuota tras deducciones sobre la base imponible, calculado con la escala
            general de esta página, soltero/a sin hijos y el mínimo personal de{' '}
            {eur0(MINIMOS_IRPF_2025.personal)}.
          </p>
        </section>

        {/* ── SECCIÓN 2: Casos de uso con ejemplos concretos ────────────── */}
        <section className={styles.guideSection}>
          <h2>Ejemplos reales: cuánto pagas según tu situación</h2>
          <p>
            Cuatro perfiles calculados con la misma fórmula que la calculadora de arriba, para el
            ejercicio {EJERCICIO} (tarifa estatal + autonómica media). Los tres primeros puedes
            reproducirlos introduciendo sus datos.
          </p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍💼</span>
                <h4>Asalariado soltero, 28.000 € brutos</h4>
              </div>
              <div className={styles.escenarioExample} data-escenario="soltero-28000">
                <p><strong>Cotización SS:</strong> {eur(ESC_SOLTERO.ssAnual)}/año</p>
                <p><strong>Otros gastos (art. 19.2.f):</strong> {eur(ESC_SOLTERO.gastosDeducibles)}</p>
                <p><strong>Reducción rendimientos trabajo:</strong> {eur(ESC_SOLTERO.reduccionTrabajo)} (se agota con {eur0(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)} de rendimiento neto)</p>
                <p><strong>Base imponible:</strong> {eur(ESC_SOLTERO.baseImponibleGeneral)}</p>
                <p><strong>Mínimo personal:</strong> {eur(ESC_SOLTERO.minimosPersonalesFamiliares)} (a tipo cero, no se resta de la base)</p>
                <p><strong>Cuota íntegra:</strong> {eur(ESC_SOLTERO.cuotaIntegra)}</p>
                <p><strong>Tipo efectivo:</strong> {pct(ESC_SOLTERO.tipoEfectivo)} de la base</p>
              </div>
              <div className={styles.escenarioTip}>
                Si la empresa retuvo bien durante el año —la retención se calcula con la misma escala y el mismo mínimo—, la declaración suele quedar cerca de cero. Si tiene dos pagadores (el segundo &gt;{eur0(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)}), puede salir a pagar.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍👧‍👦</span>
                <h4>Asalariada casada, 45.000 €, 2 hijos, declaración individual</h4>
              </div>
              <div className={styles.escenarioExample} data-escenario="casada-45000">
                <p><strong>SS:</strong> {eur(ESC_CASADA.ssAnual)}/año</p>
                <p><strong>Base imponible:</strong> {eur(ESC_CASADA.baseImponibleGeneral)}</p>
                <p>
                  <strong>Mínimo personal + familiar:</strong> {eur0(MINIMOS_IRPF_2025.personal)} + ({eur0(MINIMOS_IRPF_2025.hijo_1)} + {eur0(MINIMOS_IRPF_2025.hijo_2)}) ÷ 2 ={' '}
                  <strong>{eur(ESC_CASADA.minimosPersonalesFamiliares)}</strong>
                </p>
                <p><strong>Cuota íntegra:</strong> {eur(ESC_CASADA.cuotaIntegra)}</p>
                <p><strong>Tipo efectivo:</strong> {pct(ESC_CASADA.tipoEfectivo)} de la base</p>
              </div>
              <div className={styles.escenarioTip}>
                Si los dos progenitores declaran por separado, el mínimo por los hijos se reparte a partes iguales (art. 61.1.ª LIRPF): {eur((MINIMOS_IRPF_2025.hijo_1 + MINIMOS_IRPF_2025.hijo_2) / 2)} para cada uno, que le ahorran {eur(ESC_CASADA_SIN_HIJOS.cuotaIntegra - ESC_CASADA.cuotaIntegra)} de cuota. El mínimo no reduce la base: se le aplica la escala desde cero, así que se valora al {tipoPct(TRAMOS_IRPF_2025[0].tipo)} y no a su tipo marginal. En la calculadora corresponde a «Casado/a (dos ingresos)».
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧓</span>
                <h4>Pensionista, 18.000 € de pensión</h4>
              </div>
              <div className={styles.escenarioExample} data-escenario="pension-18000">
                <p><strong>Cotización:</strong> no hay (la pensión no cotiza)</p>
                <p><strong>Otros gastos (art. 19.2.f):</strong> {eur(ESC_PENSION.gastosDeducibles)}</p>
                <p><strong>Reducción rendimientos trabajo (art. 20):</strong> {eur(ESC_PENSION.reduccionTrabajo)}</p>
                <p><strong>Base imponible:</strong> {eur(ESC_PENSION.baseImponibleGeneral)}</p>
                <p><strong>Mínimo personal general:</strong> {eur(ESC_PENSION.minimosPersonalesFamiliares)}</p>
                <p><strong>Cuota íntegra:</strong> {eur(ESC_PENSION.cuotaIntegra)}</p>
                <p><strong>Tipo efectivo:</strong> {pct(ESC_PENSION.tipoEfectivo)} de la base</p>
                <p><strong>Desde los 65 años</strong> (mínimo de {eur0(MINIMOS_IRPF_2025.personal_65)}): cuota íntegra {eur(ESC_PENSION_65.cuotaIntegra)}</p>
              </div>
              <div className={styles.escenarioTip}>
                En la calculadora, desmarca «Soy trabajador por cuenta ajena»: la pensión no cotiza ni da derecho a la deducción por obtención de rendimientos del trabajo, pero sí a los gastos y a la reducción del art. 20. La calculadora no pide la edad; el mínimo de {eur0(MINIMOS_IRPF_2025.personal_65)} (≥65 años) o {eur0(MINIMOS_IRPF_2025.personal_75)} (≥75 años) lo aplica el{' '}
                <a href="/estimador-irpf-pensionista/">estimador IRPF para pensionistas</a>.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
                <h4>Autónomo, 35.000 € de rendimiento neto</h4>
              </div>
              <div className={styles.escenarioExample} data-escenario="autonomo-35000">
                <p><strong>Rendimiento neto de la actividad:</strong> {eur(AUTONOMO_RENDIMIENTO_NETO)}, ya descontados la cuota de autónomos y los gastos deducibles</p>
                <p><strong>Sin reducción por rendimientos del trabajo</strong> (es actividad económica)</p>
                <p><strong>Mínimo personal:</strong> {eur(MINIMOS_IRPF_2025.personal)} (a tipo cero)</p>
                <p><strong>Cuota íntegra:</strong> {eur(AUTONOMO_CUOTA)}</p>
                <p><strong>Tipo efectivo:</strong> {pct((AUTONOMO_CUOTA / AUTONOMO_RENDIMIENTO_NETO) * 100)} del rendimiento neto</p>
              </div>
              <div className={styles.escenarioTip}>
                Esta calculadora no admite rendimientos de actividades económicas: el ejemplo aplica a mano la misma escala y el mismo método del mínimo. La cuota de autónomos es gasto deducible de la actividad, y los pagos fraccionados trimestrales (mod. 130) anticipan parte de esta cuota.
              </div>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el IRPF</h2>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h4>¿Estoy obligado a declarar si solo tengo un pagador?</h4>
              <p>
                Con un único pagador, el umbral de obligación es <strong>{eur0(OBLIGACION_DECLARAR_2025.trabajo.unPagador)} brutos anuales</strong>. Por debajo, no estás obligado, aunque puede convenirte si tienes derecho a devolución (por ejemplo, deducciones autonómicas o por maternidad). Con dos o más pagadores, si del segundo y siguientes llegan más de {eur0(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)}, el umbral baja a <strong>{eur0(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)}</strong>.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre tipo marginal y tipo efectivo?</h4>
              <p>
                El <strong>tipo marginal</strong> es el porcentaje que se aplica al último euro que ganas (el del tramo más alto en el que entras). El <strong>tipo efectivo</strong> es el porcentaje real que pagas sobre toda tu base imponible. Por ejemplo, con una base de {eur0(FAQ_BASE)} tu tipo marginal es el {tipoPct(FAQ_MARGINAL)}, pero tu tipo efectivo es el {pct((FAQ_CUOTA / FAQ_BASE) * 100)} ({eur(FAQ_CUOTA)} de cuota, con el mínimo personal a tipo cero), porque los primeros tramos tributan a tipos menores.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afecta tener dos pagadores a la declaración?</h4>
              <p>
                Cada pagador retiene en función de los datos que le has comunicado, sin saber que existe otro. Si el segundo pagador ingresó más de {eur0(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)} y no ajustaste la retención del primero mediante el <strong>modelo 145</strong>, lo más probable es que la declaración salga <strong>a pagar</strong>. La solución: comunicar al pagador principal los ingresos del segundo para que aumente la retención durante el año.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo deducir el plan de pensiones?</h4>
              <p>
                Sí. Las aportaciones a planes de pensiones reducen directamente la <strong>base imponible general</strong>. El límite individual es <strong>{eur0(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)} anuales</strong> (desde 2022, art. 52.1 LIRPF). Si tu empresa también aporta, el límite conjunto sube a <strong>{eur0(LIMITES_PLAN_PENSIONES_2025.limiteTotalAnual)} anuales</strong> ({eur0(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)} individuales + hasta {eur0(LIMITES_PLAN_PENSIONES_2025.limiteEmpresaAnual)} de contribuciones de la empresa o de tus aportaciones al mismo plan de empleo). Esta reducción se aplica antes de calcular la cuota, por lo que el ahorro fiscal real depende de tu tipo marginal ({TRAMOS_IRPF_2025[0].tipo}–{tipoPct(TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1].tipo)}).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la deducción por maternidad y cuánto es?</h4>
              <p>
                Es una deducción en la cuota diferencial (no en la base) de hasta <strong>{eur0(DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo)} anuales</strong> ({eur0(DEDUCCION_MATERNIDAD_IRPF.importeMensualPorHijo)} al mes) por cada hijo menor de 3 años que te dé derecho al mínimo por descendientes. Desde 2023 (art. 81.1 LIRPF, en la redacción de la Ley 31/2022) no hace falta estar trabajando: basta con una de estas situaciones:{' '}
                {DEDUCCION_MATERNIDAD_IRPF.situacionesConDerecho.map((s, i, todas) => (
                  <span key={s.id}>
                    {i > 0 && (i === todas.length - 1 ? ' o ' : ', ')}
                    {s.titulo.charAt(0).toLowerCase() + s.titulo.slice(1)}
                  </span>
                ))}
                . Estar en paro cobrando la prestación o el subsidio de desempleo cuando nace el menor ya da derecho. Puede cobrarse por anticipado cada mes ({DEDUCCION_MATERNIDAD_IRPF.anticipado.formulario.toLowerCase()}) o deducirse en la declaración anual. Si pagas guardería o centro de educación infantil autorizado, se amplía hasta <strong>{eur0(DEDUCCION_MATERNIDAD_IRPF.incrementoGuarderia.importeMaximoAnual)} adicionales</strong> por hijo, sin superar lo pagado.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo presentar declaración conjunta con mi cónyuge?</h4>
              <p>
                Sí, los matrimonios pueden optar por la <strong>tributación conjunta</strong>, que aplica una reducción especial de <strong>{formatCurrency(REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental)} sobre la base imponible</strong> ({formatCurrency(REDUCCION_TRIBUTACION_CONJUNTA_2025.monoparental)} en unidades monoparentales, art. 84.2 reglas 3.ª y 4.ª LIRPF). A diferencia de los mínimos personales y familiares, esta sí reduce la base, de modo que se valora a tu tipo marginal. Sin embargo, la conjunta casi nunca conviene cuando los dos trabajan con ingresos similares, porque la escala de IRPF es progresiva y se aplica sobre la suma de ambas rentas. Conviene compararla con la individual antes de confirmar el borrador.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si no estoy obligado pero me conviene declarar?</h4>
              <p>
                Puedes presentar la declaración voluntariamente aunque no estés obligado. Es habitual que salga <strong>a devolver</strong> en estos casos, por ejemplo si tuviste retenciones en nómina o tienes derecho a deducciones (maternidad, alquiler autonómico, donativos). La AEAT tiene 6 meses desde el final del plazo de presentación para devolver (art. 103 LIRPF); si lo supera, debe abonarte intereses de demora.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo me devuelve Hacienda si la declaración sale a devolver?</h4>
              <p>
                La AEAT tiene un plazo máximo de <strong>6 meses desde el fin del período voluntario</strong> (normalmente hasta el 30 de junio, por lo que el plazo vence en diciembre). En la práctica, las declaraciones presentadas en abril suelen tener devolución en <strong>4–6 semanas</strong>. Si presentas en junio, puede tardar hasta noviembre-diciembre. La devolución se realiza en la cuenta bancaria que hayas indicado.
              </p>
              <div className={styles.faqTip}>
                Consejo: para cobrar antes, presenta la declaración en la primera quincena de abril, cuando abren el plazo.
              </div>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 4: Guía paso a paso ───────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Cómo hacer la declaración paso a paso</h2>
          <p>El proceso de declaración de la renta en Renta WEB (AEAT) tiene 6 etapas clave:</p>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Recopilar los documentos necesarios</h4>
                <p>
                  Antes de acceder a Renta WEB, ten a mano: <strong>certificado de retenciones</strong> del empleador (disponible en enero-febrero), datos de cuentas bancarias, referencia catastral de inmuebles en propiedad o alquiler, recibos de donaciones, aportaciones a planes de pensiones y cualquier operación patrimonial (venta de fondos, inmuebles, acciones).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Acceder a Renta WEB desde la sede de la AEAT</h4>
                <p>
                  El borrador y Renta WEB están disponibles desde <strong>principios de abril</strong> en <em>sede.agenciatributaria.gob.es</em>. Puedes identificarte con Cl@ve PIN, certificado digital o número de referencia (casilla 505 de la declaración anterior). El acceso mediante DNI electrónico también es válido.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Revisar los datos precargados — no confirmar a ciegas</h4>
                <p>
                  El borrador incluye datos aportados por terceros (empleadores, bancos, SS). Los errores más frecuentes son: <strong>rendimientos de años anteriores mal imputados</strong>, rentas de alquiler no declaradas por el inquilino, imputación de rentas inmobiliarias en inmuebles vendidos ese año, o pérdidas patrimoniales no compensadas de ejercicios previos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Incorporar datos no precargados manualmente</h4>
                <p>
                  Renta WEB no incluye automáticamente: <strong>aportaciones a planes de pensiones</strong> (si el gestor no las ha comunicado), <strong>deducciones autonómicas</strong> (alquiler, nacimiento, rehabilitación), donativos a ONG (aunque suelen venir precompletados), gastos de custodia de menores, o pérdidas patrimoniales de ejercicios anteriores pendientes de compensar.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Comparar tributación individual vs conjunta (si eres pareja)</h4>
                <p>
                  Renta WEB permite simular ambas modalidades sin confirmar. Hazlo siempre que estés casado/a. La <strong>conjunta suele convenir solo si uno de los dos no tiene ingresos o son muy bajos</strong>. Con dos sueldos similares, la individual es casi siempre mejor, porque en conjunta la unidad familiar tiene un solo mínimo del contribuyente ({eur0(MINIMOS_IRPF_2025.personal)}) y se pierde el del segundo cónyuge.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>Confirmar, domiciliar o fraccionar el pago</h4>
                <p>
                  Si sale a devolver, recibirás el importe en tu cuenta en 4–8 semanas. Si sale a pagar, puedes <strong>domiciliar el pago hasta el 25 de junio</strong> (cargo el 30 de junio) o <strong>fraccionar en dos plazos</strong>: 60&nbsp;% en junio y el 40&nbsp;% restante el 5 de noviembre, sin recargo ni intereses. El fraccionamiento es automático si lo marcas al confirmar.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 5: Mejores prácticas ──────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 consejos para cumplimentar correctamente tu declaración</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Revisa siempre el borrador antes de confirmarlo</h4>
              <p>
                El borrador no es definitivo ni necesariamente correcto. La AEAT lo genera con los datos que tiene, pero puede incluir rendimientos de años anteriores o errores en imputaciones. Confirmar sin revisar puede suponer pagar de más o, peor, una regularización posterior con recargos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h4>Con dos pagadores, ajusta la retención durante el año</h4>
              <p>
                Si el segundo pagador te paga más de {eur0(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)} anuales, comunica esa situación a tu pagador principal mediante el <strong>modelo 145</strong>. Así ajustará la retención al alza y evitarás una sorpresa en junio. Es mucho mejor que afrontar un pago inesperado en junio.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💼</span>
              <h4>Aporta al plan de pensiones antes del 31 de diciembre</h4>
              <p>
                Las aportaciones reducen la base imponible directamente: con tipo marginal del {tipoPct(PLAN_MARGINAL)}, cada {eur0(PLAN_APORTACION)} aportados suponen <strong>{eur0((PLAN_APORTACION * PLAN_MARGINAL) / 100)} menos de IRPF</strong>. El límite individual es {eur0(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/año. Si tu empresa también aporta, el límite conjunto es {eur0(LIMITES_PLAN_PENSIONES_2025.limiteTotalAnual)}. Si tu cónyuge no tiene rendimientos netos del trabajo ni de actividades económicas, o suman menos de {eur0(APORTACIONES_PLAN_CONYUGE.rendimientosMaximosConyuge)} al año, lo que tú aportes a <strong>su</strong> plan de pensiones también reduce tu base, hasta {eur0(APORTACIONES_PLAN_CONYUGE.limiteAnual)} al año (art. 51.7 LIRPF). Importante: el plan de pensiones difiere la tributación, no la elimina. Al rescatar, el importe tributa íntegro como rendimiento del trabajo. El ahorro real depende de la diferencia entre tu tipo marginal actual y el de la jubilación.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <h4>Guarda los justificantes durante 4 años</h4>
              <p>
                Hacienda puede revisar cualquier declaración dentro del plazo de prescripción de <strong>4 años</strong> (desde el final del plazo de presentación). Conserva recibos de donaciones, facturas de obras, certificados de plan de pensiones, contratos de alquiler y cualquier documento que justifique tus deducciones. Los documentos digitales con firma tienen la misma validez que los físicos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>Presenta en abril si sale a devolver</h4>
              <p>
                La AEAT tramita las devoluciones por orden de presentación. Los que presentan en abril (primeras dos semanas) suelen recibir la devolución en <strong>3–5 semanas</strong>. Los que presentan en junio pueden esperar hasta noviembre. Si tu declaración sale a pagar, puedes igualmente presentarla en abril y domiciliar el pago para el 30 de junio, sin coste adicional.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <h4>Comprueba las deducciones autonómicas de tu CCAA</h4>
              <p>
                Las comunidades autónomas tienen deducciones propias que pueden ser muy relevantes: por nacimiento o adopción de hijos, por alquiler de vivienda habitual (un porcentaje de lo pagado, con límites de renta y de importe distintos en cada comunidad), por gastos de guardería, por rehabilitación energética o por cuidado de familiares. Consulta el catálogo de tu comunidad en la web de la AEAT antes de confirmar.
              </p>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 6: Warning box — errores comunes ──────────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores frecuentes que pueden costarte dinero (o una sanción)</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confirmar el borrador sin revisarlo.</strong> El borrador puede incluir rendimientos de ejercicios anteriores imputados erróneamente, inmuebles vendidos que siguen generando imputación de renta, o retenciones mal cuantificadas. Confirmarlo sin revisar implica aceptar posibles errores como propios.
              </li>
              <li>
                <strong>Olvidar declarar cuentas o inmuebles en el extranjero.</strong> Si tienes cuentas bancarias, inmuebles o valores en el extranjero con saldo superior a 50.000 €, debes presentar el modelo 720. Tras la STJUE de 27/01/2022 y la Ley 5/2022, el régimen sancionador se ajustó al régimen general de la LGT; consulta el detalle vigente en la AEAT.
              </li>
              <li>
                <strong>No declarar el alquiler de tu vivienda (o segunda residencia).</strong> La AEAT cruza datos con los inquilinos: si tu inquilino se aplica una deducción por alquiler, declara tu NIF, y si tú no declaras los ingresos, Hacienda detectará la discrepancia. Si lo regularizas tú antes de que te lo pida, pagas la cuota más un recargo del 1&nbsp;% y otro 1&nbsp;% por cada mes completo de retraso, que pasa a ser del 15&nbsp;% más intereses de demora pasados 12 meses (art. 27 LGT); si llega antes Hacienda, la cuota va con intereses y sanción.
              </li>
              <li>
                <strong>Ignorar la exención por reinversión en vivienda habitual al vender.</strong> Si vendes tu vivienda habitual y reinviertes el total en otra en el plazo de <strong>2 años</strong>, la ganancia patrimonial queda exenta de IRPF. Si no lo declaras correctamente (aunque no debas pagar), la AEAT puede considerar que no has aplicado la exención correctamente.
              </li>
              <li>
                <strong>No fraccionar el pago si la cuota es alta.</strong> Si la declaración sale a pagar más de 1000 € y no tienes liquidez inmediata, el fraccionamiento automático (60&nbsp;% en junio + 40&nbsp;% en noviembre) <strong>no tiene coste ni recargo</strong>. Presentarla en plazo sin pagar sí genera recargos del periodo ejecutivo: del 5&nbsp;%, 10&nbsp;% o 20&nbsp;% según cuándo acabes pagando (art. 28 LGT).
              </li>
              <li>
                <strong>Presentar fuera de plazo aunque salga a devolver.</strong> Presentar la declaración después del 30 de junio, aunque el resultado sea a devolver, si estabas obligado a presentarla puede conllevar una <strong>multa de 200 €</strong>, que se queda en la mitad —100 €— si la presentas antes de que Hacienda te la requiera (art. 198 LGT). No existe ventaja fiscal en retrasar una declaración a devolver.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-irpf')} />
      <ShareCard appName="estimador-irpf" />
      <Footer appName="estimador-irpf" />
    </div>
  );
}
