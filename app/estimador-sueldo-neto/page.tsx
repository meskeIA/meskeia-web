'use client';

import { useState, useCallback } from 'react';
import styles from './EstimadorSueldoNeto.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatNumber, formatCurrency, formatDate, parseISODateLocal, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { FISCAL_IRPF_META, FISCAL_SS_CUENTA_AJENA_META, TRAMOS_IRPF_2025, calcularCuotaIntegraGeneral, desglosarEscalaGeneral, cuotaEscalaGeneral, COTIZACIONES_SS_2026, BASES_SS_2026, MINIMOS_IRPF_2025, OBLIGACION_DECLARAR_2025, SMI_2026, LIMITES_PLAN_PENSIONES_2025 } from '@/data/fiscal';
import { calcularBrutoANeto, calcularNetoABruto, tipoMarginal, TIPO_SS_TRABAJADOR, type SituacionFamiliar } from './motor';

// Tipos de cálculo
type TipoCalculo = 'brutoANeto' | 'netoABruto';

// El motor de cálculo (IRPF + SS) vive en ./motor.ts desde el 25/09/2026: lo comparten la
// calculadora, los ejemplos del bloque educativo y el FAQPage de metadata.ts.

/** Ejercicio que se calcula (COTIZACIONES_SS_2026, BASES_SS_2026, DA 61.ª de 2026). */
const EJERCICIO = FISCAL_IRPF_META.vigencia;

/** «2026-09-09» → «09/09/2026», sin el desliz de día de `new Date(iso)` al oeste de Greenwich. */
const fechaES = (iso: string) => formatDate(parseISODateLocal(iso));

// ─── Cifras del bloque educativo ─────────────────────────────────────────────────────────
// Hallazgo 1651 (25/09/2026): la tabla «12 vs 14 pagas» y los perfiles estaban escritos a
// mano con el modelo anterior a 2b80033d y 6dda61c2 y contradecían a la calculadora de esta
// misma página. Ahora salen del MISMO motor: si el motor cambia, el texto lo sigue.

/** Tabla «12 pagas vs 14 pagas»: 30.000 € brutos, soltero/a sin hijos. */
const BRUTO_TABLA = 30000;
const TABLA = calcularBrutoANeto(BRUTO_TABLA, 'soltero', 0, 0, 12);

/** Perfil «Recién graduado»: 22.000 €, soltero/a, sin hijos. */
const BRUTO_GRADUADO = 22000;
const GRADUADO = calcularBrutoANeto(BRUTO_GRADUADO, 'soltero', 0, 0, 12);

/** Perfil «Técnico medio con familia»: 35.000 €, dos ingresos, 1 hijo (y el mismo sin hijos). */
const BRUTO_FAMILIA = 35000;
const FAMILIA = calcularBrutoANeto(BRUTO_FAMILIA, 'casado_dos_ingresos', 1, 0, 12);
const FAMILIA_SIN_HIJOS = calcularBrutoANeto(BRUTO_FAMILIA, 'casado_dos_ingresos', 0, 0, 12);
const AHORRO_HIJO = FAMILIA_SIN_HIJOS.irpfAnual - FAMILIA.irpfAnual;

/** Perfil «Directivo DINK»: 80.000 €, dos ingresos, sin hijos. */
const BRUTO_DIRECTIVO = 80000;
const DIRECTIVO = calcularBrutoANeto(BRUTO_DIRECTIVO, 'casado_dos_ingresos', 0, 0, 12);
const MARGINAL_DIRECTIVO = tipoMarginal(DIRECTIVO.baseLiquidable);

/** Perfil «Trabajadora a tiempo parcial»: 14.000 €, un hijo, declaración individual. */
const BRUTO_PARCIAL = 14000;
const PARCIAL = calcularBrutoANeto(BRUTO_PARCIAL, 'soltero', 1, 0, 12);

/**
 * «Pedir una subida sin tener en cuenta el salto de tramo» (hallazgo 1692): decía «~630 €
 * netos» por 1.000 € brutos en el tramo del 37 %, olvidando la SS que también paga la subida.
 * Sale ahora del motor: el mismo sueldo con y sin la subida.
 */
const BRUTO_SUBIDA = 45000;
const SUBIDA_BRUTA = 1000;
const SUBIDA_NETA =
  calcularBrutoANeto(BRUTO_SUBIDA + SUBIDA_BRUTA, 'soltero', 0, 0, 12).netoAnual -
  calcularBrutoANeto(BRUTO_SUBIDA, 'soltero', 0, 0, 12).netoAnual;
const MARGINAL_SUBIDA = tipoMarginal(calcularBrutoANeto(BRUTO_SUBIDA, 'soltero', 0, 0, 12).baseLiquidable);

/** Neto del SMI en 14 pagas, soltero/a sin hijos (FAQ avanzadas). */
const SMI_NETO = calcularBrutoANeto(SMI_2026.anual, 'soltero', 0, 0, 14);

/** MEI del trabajador sobre 30.000 € (FAQ avanzadas). */
const MEI_TABLA = TABLA.ssDesglose.mef * 12;

/**
 * «Ejemplo práctico» (hallazgo 1652): base liquidable de 30.000 € con el mínimo personal
 * DENTRO, como manda el art. 63.1.2.º — escala a la base, escala al mínimo, y se resta.
 */
const BASE_EJEMPLO = 30000;
const ESCALA_EJEMPLO = desglosarEscalaGeneral(BASE_EJEMPLO);
const CUOTA_MINIMO_EJEMPLO = cuotaEscalaGeneral(MINIMOS_IRPF_2025.personal);
const CUOTA_EJEMPLO = calcularCuotaIntegraGeneral(BASE_EJEMPLO, MINIMOS_IRPF_2025.personal);

/** Obligación de declarar (art. 96 LIRPF), hallazgo 1654. */
const LIMITE_UN_PAGADOR = OBLIGACION_DECLARAR_2025.trabajo.unPagador;
const LIMITE_VARIOS_PAGADORES = OBLIGACION_DECLARAR_2025.trabajo.variosPagadores;
const LIMITE_SEGUNDO_PAGADOR = OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador;

export default function EstimadorSueldoNetoPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('brutoANeto');
  const [salario, setSalario] = useState('');
  const [situacion, setSituacion] = useState<SituacionFamiliar>('soltero');
  const [numHijos, setNumHijos] = useState('0');
  const [hijosMenores3, setHijosMenores3] = useState('0');
  const [pagas, setPagas] = useState('12');
  const [calculado, setCalculado] = useState(false);
  const [resultado, setResultado] = useState<{
    brutoAnual: number;
    brutoMensual: number;
    netoAnual: number;
    netoMensual: number;
    irpfAnual: number;
    irpfPorcentaje: number;
    ssAnual: number;
    ssDesglose: Record<string, number>;
    tipoRetencion: number;
    deduccionRentasBajas: number;
  } | null>(null);

  const calcular = useCallback(() => {
    const salarioNum = parseSpanishNumber(salario);
    const hijosNum = parseInt(numHijos) || 0;
    const hijosMenores3Num = Math.min(parseInt(hijosMenores3) || 0, hijosNum);
    const pagasNum = parseInt(pagas) || 12;

    if (!(salarioNum > 0)) {
      // Hallazgo 1660: sin esto, tras un cálculo válido el resultado anterior seguía en
      // pantalla junto a un campo que decía otra cifra.
      setResultado(null);
      setCalculado(false);
      alert('Por favor, introduce un salario válido');
      return;
    }

    let res;
    if (tipoCalculo === 'brutoANeto') {
      const calc = calcularBrutoANeto(salarioNum, situacion, hijosNum, hijosMenores3Num, pagasNum);
      res = {
        brutoAnual: salarioNum,
        brutoMensual: salarioNum / pagasNum,
        netoAnual: calc.netoAnual,
        netoMensual: calc.netoMensual,
        irpfAnual: calc.irpfAnual,
        irpfPorcentaje: calc.irpfPorcentaje,
        ssAnual: calc.ssAnual,
        ssDesglose: calc.ssDesglose,
        tipoRetencion: calc.tipoRetencion,
        deduccionRentasBajas: calc.deduccionRentasBajas,
      };
    } else {
      const calc = calcularNetoABruto(salarioNum, situacion, hijosNum, hijosMenores3Num, pagasNum);
      res = {
        brutoAnual: calc.brutoAnual,
        brutoMensual: calc.brutoMensual,
        netoAnual: salarioNum,
        netoMensual: salarioNum / pagasNum,
        irpfAnual: calc.irpfAnual,
        irpfPorcentaje: calc.irpfPorcentaje,
        ssAnual: calc.ssAnual,
        ssDesglose: calc.ssDesglose,
        tipoRetencion: calc.tipoRetencion,
        deduccionRentasBajas: calc.deduccionRentasBajas,
      };
    }

    setResultado(res);
    setCalculado(true);
  }, [salario, tipoCalculo, situacion, numHijos, hijosMenores3, pagas]);

  const limpiar = () => {
    setSalario('');
    setNumHijos('0');
    setHijosMenores3('0');
    setResultado(null);
    setCalculado(false);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estimador Sueldo Neto ↔ Bruto</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre tu salario bruto a neto o viceversa. IRPF y Seguridad Social para España {EJERCICIO}.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" />

      {/* Hallazgo 1653: el cálculo depende de tres fuentes, no de una — la escala y los
          mínimos (LIRPF), la deducción de la DA 61.ª en su redacción de 2026 y los tipos y
          bases de cotización de la Orden de cotización del año. */}
      <DataReference
        normativa={`IRPF ${EJERCICIO}`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota={`La deducción por obtención de rendimientos del trabajo sigue la DA 61.ª LIRPF en la redacción del art. 28 del Real Decreto-ley 5/2026 (cuantías de ${EJERCICIO}). ${FISCAL_IRPF_META.nota}`}
      />
      <DataReference
        normativa={`Cotizaciones del trabajador ${FISCAL_SS_CUENTA_AJENA_META.vigencia}`}
        fuente={FISCAL_SS_CUENTA_AJENA_META.fuente}
        verificado={FISCAL_SS_CUENTA_AJENA_META.verificado}
        urlOficial={FISCAL_SS_CUENTA_AJENA_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tipo de cálculo</h2>

            <div className={styles.toggleGroup}>
              <button
                type="button"
                aria-pressed={tipoCalculo === 'brutoANeto'}
                className={`${styles.toggleBtn} ${tipoCalculo === 'brutoANeto' ? styles.active : ''}`}
                onClick={() => { setTipoCalculo('brutoANeto'); setCalculado(false); }}
              >
                Bruto → Neto
              </button>
              <button
                type="button"
                aria-pressed={tipoCalculo === 'netoABruto'}
                className={`${styles.toggleBtn} ${tipoCalculo === 'netoABruto' ? styles.active : ''}`}
                onClick={() => { setTipoCalculo('netoABruto'); setCalculado(false); }}
              >
                Neto → Bruto
              </button>
            </div>

            <NumberInput
              value={salario}
              onChange={setSalario}
              label={tipoCalculo === 'brutoANeto' ? 'Salario bruto anual' : 'Salario neto anual deseado'}
              placeholder="30000"
              helperText="Introduce el salario anual en euros"
              min={0}
            />

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="sueldo-neto-situacion">Situación familiar</label>
              <select
                id="sueldo-neto-situacion"
                value={situacion}
                onChange={(e) => setSituacion(e.target.value as SituacionFamiliar)}
                className={styles.select}
              >
                <option value="soltero">Soltero/a o divorciado/a</option>
                <option value="casado_un_ingreso">Casado/a (un solo ingreso)</option>
                <option value="casado_dos_ingresos">Casado/a (dos ingresos)</option>
                <option value="familia_monoparental">Familia monoparental</option>
              </select>
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={numHijos}
                onChange={setNumHijos}
                label="Número de hijos"
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
                max={parseInt(numHijos) || 0}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="sueldo-neto-pagas">Número de pagas</label>
              <select
                id="sueldo-neto-pagas"
                value={pagas}
                onChange={(e) => setPagas(e.target.value)}
                className={styles.select}
              >
                <option value="12">12 pagas</option>
                <option value="14">14 pagas</option>
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" onClick={calcular} className={styles.btnPrimary}>
                Calcular
              </button>
              <button type="button" onClick={limpiar} className={styles.btnSecondary}>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {calculado && resultado && (
            <>
              <div className={styles.resultsGrid}>
                <ResultCard
                  title="Salario Bruto Anual"
                  value={formatNumber(resultado.brutoAnual, 2)}
                  unit="€"
                  variant={tipoCalculo === 'netoABruto' ? 'highlight' : 'default'}
                  icon="💼"
                />
                <ResultCard
                  title="Salario Neto Anual"
                  value={formatNumber(resultado.netoAnual, 2)}
                  unit="€"
                  variant={tipoCalculo === 'brutoANeto' ? 'highlight' : 'default'}
                  icon="💰"
                />
                <ResultCard
                  title={`Bruto Mensual (${pagas} pagas)`}
                  value={formatNumber(resultado.brutoMensual, 2)}
                  unit="€"
                  variant="info"
                  icon="📅"
                />
                <ResultCard
                  title={`Neto Mensual (${pagas} pagas)`}
                  value={formatNumber(resultado.netoMensual, 2)}
                  unit="€"
                  variant="success"
                  icon="✅"
                />
              </div>

              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Desglose de Deducciones</h3>

                <div className={styles.desgloseSection}>
                  <h4>IRPF</h4>
                  <div className={styles.desgloseRow}>
                    <span>IRPF anual (cuota estimada)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.irpfAnual)}</span>
                  </div>
                  {resultado.deduccionRentasBajas > 0 && (
                    <div className={styles.desgloseRow}>
                      <span>Deducción por rendimientos del trabajo</span>
                      <span className={`${styles.desgloseValue} ${styles.importeDeduccion}`}>-{formatCurrency(resultado.deduccionRentasBajas)}</span>
                    </div>
                  )}
                  <div className={styles.desgloseRow}>
                    <span>Tipo efectivo de IRPF</span>
                    <span className={styles.desgloseValue}>{formatNumber(resultado.tipoRetencion, 2)}%</span>
                  </div>
                  {/* Hallazgo 1689: la cifra es la cuota anual de la LIRPF (con la reducción por
                      tributación conjunta y la deducción de la DA 61.ª), no la retención del
                      reglamento, que no aplica ninguna de las dos. Se rotula por lo que es. */}
                  <p className={styles.desgloseNota}>
                    Es el IRPF que te corresponde en el año, el que saldría en la declaración de la
                    renta. La retención de tu nómina la calcula la empresa con el procedimiento del
                    Reglamento del IRPF y puede ser algo distinta: la diferencia se regulariza al
                    presentar la declaración.
                  </p>
                </div>

                <div className={styles.desgloseSection}>
                  <h4>Seguridad Social (Trabajador)</h4>
                  <div className={styles.desgloseRow}>
                    <span>Contingencias comunes ({formatNumber(COTIZACIONES_SS_2026.contingenciasComunes, 2)}%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.contingenciasComunes * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>Desempleo ({formatNumber(COTIZACIONES_SS_2026.desempleo, 2)}%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.desempleo * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>Formación profesional ({formatNumber(COTIZACIONES_SS_2026.formacionProfesional, 2)}%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.formacionProfesional * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>MEF - Equidad Intergeneracional ({formatNumber(COTIZACIONES_SS_2026.mef, 2)}%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.mef * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow + ' ' + styles.desgloseTotal}>
                    <span>Total Seguridad Social</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssAnual)}</span>
                  </div>
                </div>

                <div className={styles.desgloseSection}>
                  <h4>Resumen Total</h4>
                  <div className={styles.desgloseRow + ' ' + styles.desgloseTotal}>
                    <span>Total deducciones anuales</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.irpfAnual + resultado.ssAnual)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>Porcentaje sobre bruto</span>
                    <span className={styles.desgloseValue}>
                      {formatNumber(((resultado.irpfAnual + resultado.ssAnual) / resultado.brutoAnual) * 100, 2)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!calculado && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>💶</span>
              <p>Introduce tu salario y pulsa Calcular para ver el resultado</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Herramienta de Orientación — No es asesoramiento profesional</h3>
        <p>
          Este estimador proporciona una <strong>estimación orientativa</strong> basada en{' '}
          <a href={FISCAL_IRPF_META.urlOficial} target="_blank" rel="noopener noreferrer">
            {FISCAL_IRPF_META.fuente}
          </a>. Los resultados pueden variar según:
        </p>
        <ul>
          <li>Tu comunidad autónoma (el IRPF autonómico puede diferir)</li>
          <li>Otras deducciones aplicables (discapacidad, ascendientes a cargo, etc.)</li>
          <li>Convenio colectivo y tipo de contrato</li>
          <li>Reducciones por aportaciones a planes de pensiones, etc.</li>
        </ul>
        <p>
          <strong>NO constituye asesoramiento fiscal ni laboral profesional.</strong> Para un cálculo exacto,
          consulta con un asesor fiscal o utiliza el{' '}
          <a href={FISCAL_IRPF_META.urlOficial} target="_blank" rel="noopener noreferrer">
            simulador oficial de la Agencia Tributaria
          </a>.
        </p>
        <p className={styles.disclaimerFecha}>
          Datos verificados: {fechaES(FISCAL_IRPF_META.verificado)} | Vigencia: {FISCAL_IRPF_META.vigencia}
        </p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres entender mejor tu nómina?"
        subtitle="Descubre cómo se calcula tu salario neto, qué son las cotizaciones y cómo optimizar tu retención"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el salario bruto y el salario neto?</h2>
          <p className={styles.introParagraph}>
            El <strong>salario bruto</strong> es la cantidad total que la empresa paga por tu trabajo antes de
            aplicar ninguna deducción. El <strong>salario neto</strong> es lo que realmente recibes en tu cuenta
            bancaria cada mes, después de descontar IRPF y Seguridad Social.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">💼</span> Salario Bruto</h4>
              <p>
                Incluye tu sueldo base más complementos (antigüedad, peligrosidad, etc.),
                pagas extras y cualquier retribución en especie. Es la cifra que aparece
                en tu contrato de trabajo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">💰</span> Salario Neto</h4>
              <p>
                Es el resultado de restar al bruto las cotizaciones a la Seguridad Social
                (un {formatNumber(TIPO_SS_TRABAJADOR, 2)}% en {EJERCICIO}) y la retención del IRPF (variable según tu situación).
                Es lo que ingresas realmente.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Cómo funciona el IRPF?</h2>
          <p>
            El IRPF (Impuesto sobre la Renta de las Personas Físicas) es un impuesto progresivo,
            lo que significa que cuanto más ganas, mayor porcentaje pagas. Pero ojo: los porcentajes
            se aplican por tramos, no a todo tu salario.
          </p>

          <div className={styles.tramosTable}>
            <h4>Tramos IRPF {EJERCICIO} (Estatal + Autonómico medio)</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {TRAMOS_IRPF_2025.map((tramo, i) => {
                  const desde = i === 0 ? 0 : TRAMOS_IRPF_2025[i - 1].hasta;
                  return (
                    <tr key={tramo.hasta}>
                      <td>{formatCurrency(desde)}</td>
                      <td>{tramo.hasta === Infinity ? 'En adelante' : formatCurrency(tramo.hasta)}</td>
                      <td>{formatNumber(tramo.tipo, 0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.infoBox}>
            <h4><span aria-hidden="true">📌</span> Ejemplo práctico</h4>
            {/* Hallazgo 1652: este ejemplo restaba el mínimo personal para llegar a la base
                liquidable, justo el método que prohíbe el art. 63.1.2.º. El mínimo va DENTRO de
                la base y se grava a tipo cero: la escala se aplica dos veces y se restan. */}
            <p>
              Si tu <strong>base liquidable</strong> (tu bruto menos la Seguridad Social, los gastos
              deducibles y la reducción por rendimientos del trabajo) es de {formatCurrency(BASE_EJEMPLO)},
              NO pagas el {formatNumber(ESCALA_EJEMPLO.tramos[ESCALA_EJEMPLO.tramos.length - 1].tipo, 0)}% de todo.
              Primero se aplica la escala a la base completa:
            </p>
            <ul>
              {ESCALA_EJEMPLO.tramos.map((t) => (
                <li key={t.desde}>
                  {formatNumber(t.tipo, 0)}% de {formatCurrency(t.desde)} a {formatCurrency(t.desde + t.base)} = {formatCurrency(t.cuota)}
                </li>
              ))}
              <li>Cuota de la base: <strong>{formatCurrency(ESCALA_EJEMPLO.cuota)}</strong></li>
            </ul>
            <p>
              El mínimo personal ({formatCurrency(MINIMOS_IRPF_2025.personal)} sin hijos) no se resta de la
              base: forma parte de ella y tributa a tipo cero (art. 63.1.2.º de la Ley del IRPF). Por eso
              la escala se aplica también al mínimo — {formatCurrency(CUOTA_MINIMO_EJEMPLO)} — y esa cuota
              se descuenta de la anterior:
            </p>
            <ul>
              <li>
                <strong>Cuota íntegra</strong>: {formatCurrency(ESCALA_EJEMPLO.cuota)} − {formatCurrency(CUOTA_MINIMO_EJEMPLO)} ={' '}
                <strong>{formatCurrency(CUOTA_EJEMPLO)}</strong> ({formatNumber((CUOTA_EJEMPLO / BASE_EJEMPLO) * 100, 2)}% efectivo
                sobre la base liquidable)
              </li>
            </ul>
            <p>
              Si en lugar de eso se restara el mínimo de la base, se ahorraría al tipo más alto que
              alcanzas y no al {formatNumber(TRAMOS_IRPF_2025[0].tipo, 0)}% del primer tramo, y la cuota
              saldría más baja de lo que es. Esa base liquidable corresponde a un salario bruto
              bastante más alto: la Seguridad Social, los gastos deducibles y la reducción se restan antes.
            </p>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cotizaciones a la Seguridad Social</h2>
          <p>
            Como trabajador por cuenta ajena, cotizas a la Seguridad Social para tener derecho a
            prestaciones como jubilación, desempleo, bajas por enfermedad, etc.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">👤</span> Lo que pagas tú (trabajador)</h4>
              <ul>
                <li>Contingencias comunes: {formatNumber(COTIZACIONES_SS_2026.contingenciasComunes, 2)}%</li>
                <li>Desempleo: {formatNumber(COTIZACIONES_SS_2026.desempleo, 2)}%</li>
                <li>Formación profesional: {formatNumber(COTIZACIONES_SS_2026.formacionProfesional, 2)}%</li>
                <li>MEF: {formatNumber(COTIZACIONES_SS_2026.mef, 2)}%</li>
                <li><strong>Total: {formatNumber(
                  COTIZACIONES_SS_2026.contingenciasComunes +
                  COTIZACIONES_SS_2026.desempleo +
                  COTIZACIONES_SS_2026.formacionProfesional +
                  COTIZACIONES_SS_2026.mef,
                  2
                )}%</strong></li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🏢</span> Lo que paga la empresa</h4>
              <ul>
                <li>Contingencias comunes: 23,60%</li>
                <li>Desempleo: 5,50%</li>
                <li>FOGASA: 0,20%</li>
                <li>Formación: 0,60%</li>
                <li><strong>Total: ~30%</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h4>¿Qué son las 12 y 14 pagas?</h4>
            <p>
              Con 12 pagas recibes tu salario mensualmente. Con 14 pagas, el salario anual se divide
              en 14 partes: 12 mensuales + 2 extras (normalmente en junio y diciembre). El neto anual
              es el mismo, pero las mensualidades son menores.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Por qué mi retención es diferente a la de un compañero?</h4>
            <p>
              La retención del IRPF depende de tu situación personal: estado civil, número de hijos,
              si tu cónyuge trabaja, discapacidades, etc. Dos personas con el mismo sueldo pueden
              tener retenciones muy diferentes.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Puedo pedir que me retengan más o menos?</h4>
            <p>
              Sí, puedes solicitar a tu empresa que te aplique una retención mayor (para no tener
              que pagar en la declaración). No puedes pedir menos del mínimo legal, pero si tu
              retención es excesiva, puedes ajustarla comunicándolo a RRHH.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué pasa si me retienen de más durante el año?</h4>
            <p>
              Si te han retenido más IRPF del que corresponde, Hacienda te lo devolverá al hacer
              la declaración de la renta. Si te han retenido de menos, tendrás que pagar la diferencia.
            </p>
          </div>
        </section>

        {/* SECCIÓN 1: Tabla comparativa 12 vs 14 pagas */}
        <section className={styles.guideSection}>
          <h2>12 pagas vs 14 pagas vs extras prorrateadas: ¿cuál te conviene?</h2>
          <p>
            El número de pagas no cambia tu neto anual total, pero sí afecta a cuánto ingresas cada
            mes. Estos son los tres escenarios para un sueldo bruto de {formatCurrency(BRUTO_TABLA)} anuales
            (soltero/a sin hijos, calculados con esta misma herramienta):
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>12 pagas</th>
                  <th>14 pagas</th>
                  <th>12 + extras prorrateadas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bruto mensual</td>
                  <td>{formatCurrency(BRUTO_TABLA / 12)}</td>
                  <td>{formatCurrency(BRUTO_TABLA / 14)} (ordinaria)</td>
                  <td>{formatCurrency(BRUTO_TABLA / 12)} (ya incluye extra)</td>
                </tr>
                <tr>
                  <td>Paga extra</td>
                  <td>No ({formatCurrency(0)})</td>
                  <td>{formatCurrency(BRUTO_TABLA / 14)} × 2 (jun/dic)</td>
                  <td>Incluida en mensual</td>
                </tr>
                <tr>
                  <td>Neto mensual estimado</td>
                  <td>{formatCurrency(TABLA.netoAnual / 12)}</td>
                  <td>{formatCurrency(TABLA.netoAnual / 14)} + 2 extras de {formatCurrency(TABLA.netoAnual / 14)}</td>
                  <td>{formatCurrency(TABLA.netoAnual / 12)}</td>
                </tr>
                <tr>
                  <td>IRPF por paga (cuota anual repartida)</td>
                  <td>{formatCurrency(TABLA.irpfAnual / 12)}</td>
                  <td>{formatCurrency(TABLA.irpfAnual / 14)} (mensualidad menor)</td>
                  <td>{formatCurrency(TABLA.irpfAnual / 12)}</td>
                </tr>
                <tr>
                  <td>Neto anual total</td>
                  <td>{formatCurrency(TABLA.netoAnual)}</td>
                  <td>{formatCurrency(TABLA.netoAnual)}</td>
                  <td>{formatCurrency(TABLA.netoAnual)}</td>
                </tr>
                <tr>
                  <td>Ventaja principal</td>
                  <td>Flujo mensual estable</td>
                  <td>Inyección de liquidez 2×/año</td>
                  <td>Previsibilidad total</td>
                </tr>
                <tr>
                  <td>Inconveniente</td>
                  <td>Sin extra para gastos grandes</td>
                  <td>Mensualidad menor, peor para hipoteca</td>
                  <td>Sin "sorpresa" de dinero extra</td>
                </tr>
                <tr>
                  <td>Quién lo prefiere</td>
                  <td>Freelancers habituados a ciclos irregulares</td>
                  <td>Familias con gastos concentrados (vuelta al cole, Navidad)</td>
                  <td>Personas con hipoteca o alquiler fijo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de uso con perfiles reales */}
        <section className={styles.guideSection}>
          <h2>Casos de uso: 4 perfiles con números reales</h2>
          <p>
            Cada situación personal genera un neto diferente aunque el bruto sea el mismo.
            Aquí tienes cuatro ejemplos concretos calculados con esta misma herramienta (ejercicio {EJERCICIO}):
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Recién graduado</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Perfil:</strong> {formatCurrency(BRUTO_GRADUADO)} brutos, soltero/a, sin hijos</p>
                <ul>
                  <li>SS trabajador ({formatNumber(TIPO_SS_TRABAJADOR, 2)}%): <strong>{formatCurrency(GRADUADO.ssAnual)}/año</strong></li>
                  <li>Base imponible IRPF (tras gastos deducibles y reducción): <strong>{formatCurrency(GRADUADO.baseImponible)}</strong></li>
                  <li>IRPF anual (mínimo personal {formatCurrency(GRADUADO.minimos)}, a tipo cero): <strong>{formatCurrency(GRADUADO.irpfAnual)}</strong></li>
                  <li>Tipo efectivo de IRPF: <strong>{formatNumber(GRADUADO.tipoRetencion, 2)}%</strong></li>
                  <li>Neto anual: <strong>{formatCurrency(GRADUADO.netoAnual)}</strong></li>
                  <li>Neto mensual (12 pagas): <strong>{formatCurrency(GRADUADO.netoMensual)}</strong></li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Consejo: Con rendimientos del trabajo de hasta {formatCurrency(LIMITE_UN_PAGADOR)} y un único pagador no estás obligado a declarar la renta.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <h4>Técnico medio con familia</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Perfil:</strong> {formatCurrency(BRUTO_FAMILIA)} brutos, casado/a (dos ingresos), 1 hijo</p>
                <ul>
                  <li>SS trabajador ({formatNumber(TIPO_SS_TRABAJADOR, 2)}%): <strong>{formatCurrency(FAMILIA.ssAnual)}/año</strong></li>
                  <li>Base imponible IRPF (tras gastos deducibles y reducción): <strong>{formatCurrency(FAMILIA.baseImponible)}</strong></li>
                  <li>Mínimo personal + la mitad del de hijo 1 ({formatCurrency(MINIMOS_IRPF_2025.personal)} + {formatCurrency(MINIMOS_IRPF_2025.hijo_1 / 2)}, porque con dos ingresos cada progenitor aplica la mitad): <strong>{formatCurrency(FAMILIA.minimos)}</strong></li>
                  <li>IRPF anual: <strong>{formatCurrency(FAMILIA.irpfAnual)}</strong></li>
                  <li>Tipo efectivo de IRPF: <strong>{formatNumber(FAMILIA.tipoRetencion, 2)}%</strong></li>
                  <li>Neto anual: <strong>{formatCurrency(FAMILIA.netoAnual)}</strong></li>
                  <li>
                    Impacto del mínimo por el hijo: {formatCurrency(AHORRO_HIJO)}/año menos de IRPF que la
                    misma persona sin hijos (el mínimo tributa a tipo cero, así que ahorra al {formatNumber(TRAMOS_IRPF_2025[0].tipo, 0)}%)
                  </li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Consejo: Actualizar el modelo 145 al tener un hijo puede reducir tu retención mensual unos {formatCurrency(AHORRO_HIJO / 12)}.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <h4>Directivo DINK</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Perfil:</strong> {formatCurrency(BRUTO_DIRECTIVO)} brutos, casado/a (dos ingresos), sin hijos</p>
                <ul>
                  <li>SS trabajador (base máx. {formatCurrency(BASES_SS_2026.maxima)}/mes): <strong>{formatCurrency(DIRECTIVO.ssAnual)}/año</strong></li>
                  <li>Base imponible IRPF (tras gastos deducibles y reducción): <strong>{formatCurrency(DIRECTIVO.baseImponible)}</strong></li>
                  <li>IRPF anual: <strong>{formatCurrency(DIRECTIVO.irpfAnual)}</strong></li>
                  <li>Tipo efectivo real: <strong>{formatNumber(DIRECTIVO.tipoRetencion, 2)}%</strong></li>
                  <li>Neto anual: <strong>{formatCurrency(DIRECTIVO.netoAnual)}</strong></li>
                  <li>Neto mensual (12 pagas): <strong>{formatCurrency(DIRECTIVO.netoMensual)}</strong></li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Consejo: Aportar al plan de pensiones reduce directamente la base imponible — cada 1.000 € aportados ahorran unos {formatCurrency((1000 * MARGINAL_DIRECTIVO) / 100)} en IRPF a este nivel de ingresos (tramo marginal {formatNumber(MARGINAL_DIRECTIVO, 0)}%).
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👩‍👧</span>
                <h4>Trabajadora a tiempo parcial</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Perfil:</strong> {formatCurrency(BRUTO_PARCIAL)} brutos, reducción por cuidado de hijos (50%), un hijo, declaración individual</p>
                <ul>
                  <li>SS trabajador ({formatNumber(TIPO_SS_TRABAJADOR, 2)}% de lo cobrado: a tiempo parcial se cotiza por el salario real, no por la base mínima de jornada completa): <strong>{formatCurrency(PARCIAL.ssAnual)}/año</strong></li>
                  <li>Base imponible IRPF (tras gastos deducibles y reducción): <strong>{formatCurrency(PARCIAL.baseImponible)}</strong></li>
                  <li>Mínimo personal + mínimo por un hijo: <strong>{formatCurrency(PARCIAL.minimos)}</strong></li>
                  <li>
                    IRPF anual: <strong>{formatCurrency(PARCIAL.irpfAnual)}</strong>
                    {PARCIAL.irpfAnual === 0 && PARCIAL.baseLiquidable <= PARCIAL.minimos && (
                      <> (la base no supera el mínimo personal y familiar, que tributa a tipo cero)</>
                    )}
                  </li>
                  <li>Tipo efectivo de IRPF: <strong>{formatNumber(PARCIAL.tipoRetencion, 2)}%</strong></li>
                  <li>Neto anual: <strong>{formatCurrency(PARCIAL.netoAnual)}</strong></li>
                </ul>
              </div>
              <div className={styles.escenarioTip}>
                Consejo: Si tienes reducción de jornada por cuidado de hijos, comunícalo en el modelo 145 — podrías tener derecho a la deducción por maternidad de hasta 1.200 €/año.
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ adicionales (8 preguntas nuevas) */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes avanzadas</h2>
          <div className={styles.faqListPro}>
            <div className={styles.faqItemPro}>
              <h4>¿Qué es el MEI (Mecanismo de Equidad Intergeneracional) y cuánto me descuentan?</h4>
              <p>
                El MEI es una cotización adicional a la Seguridad Social creada por la reforma de pensiones de 2023 para financiar el Fondo de Reserva. En 2026, el trabajador paga el <strong>{formatNumber(COTIZACIONES_SS_2026.mef, 2)}%</strong> y la empresa el <strong>0,75%</strong> sobre la base de cotización. Para un sueldo de {formatCurrency(BRUTO_TABLA)} brutos esto representa <strong>{formatCurrency(MEI_TABLA)} anuales a cargo del trabajador</strong>. Su tipo irá incrementándose gradualmente hasta 2032.
              </p>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Mi empresa puede pagarme menos del salario mínimo interprofesional?</h4>
              <p>
                No. El <strong>SMI 2026 es de {formatCurrency(SMI_2026.mensual14)}/mes en 14 pagas</strong> ({formatCurrency(SMI_2026.anual)} brutos anuales). Ningún convenio colectivo ni contrato puede establecer un salario inferior. Si tu empresa te paga menos, puedes reclamar ante la Inspección de Trabajo. Ojo: el SMI es la retribución bruta, antes de IRPF y SS.
              </p>
              <div className={styles.faqTipPro}>Referencia: {SMI_2026.boe}, publicado en el BOE.</div>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Qué ocurre con el IRPF si cambio de empresa a mitad de año?</h4>
              <p>
                Al cambiar de empresa, la nueva no conoce tus ingresos anteriores y puede aplicar una retención incorrecta (generalmente menor). Debes <strong>comunicar al nuevo empleador tu salario acumulado del año</strong> mediante el certificado de retenciones de la empresa anterior. Si no lo haces, en la declaración de la renta es probable que te salga a pagar.
              </p>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Los cheques comida y tickets guardería reducen mi IRPF?</h4>
              <p>
                Sí, son retribución en especie con límites exentos de IRPF. Los <strong>cheques restaurante</strong> están exentos hasta <strong>11 €/día</strong> de uso efectivo (límite anual ~2.640 € aprox.). Los <strong>cheques guardería</strong> están exentos sin límite de importe, siempre que el hijo sea menor de 3 años. Ambos sí cotizan a la Seguridad Social (incluyen en la base de cotización).
              </p>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Cuánto es el SMI 2026 y cómo afecta a mi neto?</h4>
              <p>
                El SMI 2026 es <strong>{formatCurrency(SMI_2026.mensual14)}/mes en 14 pagas = {formatCurrency(SMI_2026.anual)} brutos anuales</strong>. Aplicando las deducciones estándar (soltero/a, sin hijos), el neto mensual estimado es de <strong>{formatCurrency(SMI_NETO.netoMensual)}</strong>. Es importante saber que trabajadores con salarios de hasta el SMI que tengan rendimientos del trabajo de hasta {formatCurrency(LIMITE_UN_PAGADOR)} no están obligados a presentar la declaración de la renta (con un único pagador).
              </p>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Qué diferencia hay entre contingencias comunes y profesionales?</h4>
              <p>
                Las <strong>contingencias comunes</strong> ({formatNumber(COTIZACIONES_SS_2026.contingenciasComunes, 2)}% trabajador) cubren enfermedad común, maternidad, paternidad y jubilación. Las <strong>contingencias profesionales</strong> (variable, cotiza solo la empresa, entre 0,90% y 7,15% según actividad) cubren accidentes de trabajo y enfermedades profesionales. El trabajador no paga directamente por contingencias profesionales; es un coste exclusivamente empresarial.
              </p>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Cuánto cotizo si tengo dos empleos simultáneos?</h4>
              <p>
                Si tienes dos contratos simultáneos, cotizas a la SS en ambos por separado, pero existe una <strong>base de cotización máxima conjunta</strong> de <strong>{formatCurrency(BASES_SS_2026.maxima)}/mes en 2026</strong>. Si la suma de tus bases supera ese límite, puedes solicitar la <strong>devolución del exceso cotizado</strong> a la Tesorería General de la SS tras finalizar el año. En IRPF, ambos empleadores retienen de forma independiente, lo que suele generar una retención insuficiente y una deuda en la renta.
              </p>
            </div>

            <div className={styles.faqItemPro}>
              <h4>¿Puedo negociar que me suban el bruto sin que suba el neto?</h4>
              <p>
                No exactamente, pero sí puedes negociar <strong>retribución en especie</strong> (seguro médico, guardería, transporte, formación) que aumenta tu retribución total sin tributar (dentro de los límites legales). También puedes negociar <strong>aportaciones de la empresa a tu plan de pensiones de empleo</strong>: no tributan como renta del trabajo en el momento del cobro, aunque sí lo harán cuando retires el dinero.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: cómo optimizar tu salario neto</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Pide a RRHH el desglose completo de tu nómina</h4>
                <p>
                  Solicita el detalle de <strong>base + complementos + pagas extras + retribución en especie</strong>.
                  Muchos trabajadores desconocen que conceptos como plus de transporte, tickets comida o seguro médico
                  forman parte de su retribución total. Verifica también qué cotiza y qué está exento.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Revisa tu modelo 145 (situación familiar en Hacienda)</h4>
                <p>
                  El <strong>modelo 145</strong> es la declaración que entregas a tu empresa con tu situación personal
                  (hijos, discapacidad, ascendientes a cargo, etc.) para que calcule correctamente tu retención.
                  Debes actualizarlo cada vez que cambie tu situación: nuevo hijo, matrimonio, separación, cónyuge
                  que deja de trabajar. Si no lo actualizas, tu retención puede ser errónea y causarte problemas en la renta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Calcula si te conviene retribución en especie</h4>
                <p>
                  Conceptos como <strong>seguro médico privado (hasta 500 €/año por persona asegurada, exento de IRPF)</strong>,
                  guardería (exenta sin límite para menores de 3 años), tarjeta transporte (hasta 1.500 €/año) o
                  cheques restaurante (hasta 11 €/día) pueden reducir significativamente tu base imponible sin reducir
                  tu retribución real. Un seguro médico de 1.500 €/año que cubra a tres personas queda exento
                  entero (3 × 500 €) y, con un tipo marginal del 30 %, supone unos 450 € menos de IRPF
                  (1.500 × 30 %).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Valora aportar al plan de pensiones de empresa si hay matching</h4>
                <p>
                  Algunos empleadores aportan al plan de pensiones de empleo una cantidad equivalente a la que
                  aporta el trabajador (matching). Si tu empresa hace esto, es dinero gratis: contribuye hasta el
                  límite del matching. El límite conjunto empresa + trabajador es de <strong>{formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteTotalAnual)}/año</strong>:
                  {' '}{formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)} más {formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteEmpresaAnual)} que
                  exigen contribución de la empresa (art. 52.1 LIRPF), así que la empresa sola también puede llegar
                  a los {formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteTotalAnual)}. Estas aportaciones reducen tu base imponible del IRPF.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Solicita certificado de retenciones a tu empresa en enero</h4>
                <p>
                  Antes de presentar la declaración de la renta (abril-junio), solicita a tu empresa el
                  <strong> certificado de retenciones e ingresos</strong>. Este documento recoge el total de
                  lo cobrado y lo retenido durante el año. Es imprescindible para hacer la declaración y
                  detectar posibles errores de retención que puedas reclamar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Compara con el convenio colectivo de tu sector</h4>
                <p>
                  Los convenios colectivos establecen <strong>salarios mínimos por categoría profesional</strong>
                  en cada sector. Puedes consultar el convenio aplicable en el Registro de Convenios Colectivos
                  del MITES (mites.gob.es). Si tu salario está por debajo del mínimo convencional para tu
                  categoría, tienes derecho a reclamar la diferencia, con retroactividad de hasta 1 año.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para gestionar tu retención</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <p>
                <strong>Actualiza el modelo 145</strong> cada vez que cambie tu situación familiar
                (nuevo hijo, matrimonio, separación, cónyuge que deja de trabajar). Una retención
                incorrecta puede suponerte pagar cientos de euros de más en la renta de abril.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏥</span>
              <p>
                <strong>Solicita retribución flexible:</strong> hasta 500 € al año en seguro médico están
                exentos de IRPF por persona asegurada (tú, tu cónyuge y tus hijos), y 1.500 € por cada
                persona con discapacidad (art. 42.3.c LIRPF). Para una familia de 4 personas sin
                discapacidad, el límite exento es de 2.000 €/año; lo que lo supere tributa como
                retribución en especie.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏠</span>
              <p>
                <strong>El teletrabajo no reduce automáticamente tu retención</strong> aunque tengas
                gastos adicionales (electricidad, conexión, material). Solo existe una deducción
                específica para trabajadores autónomos. Como asalariado, necesitarías un acuerdo
                de teletrabajo con compensación económica explícita.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <p>
                <strong>Si cambias de empresa</strong>, comunica tu salario acumulado del año anterior
                mediante el certificado de retenciones. Sin este dato, la nueva empresa calculará tu
                retención solo sobre tu nuevo sueldo, lo que habitualmente resulta en retención
                insuficiente y una factura en la declaración de la renta.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <p>
                <strong>SMI 2026: {formatCurrency(SMI_2026.mensual14)}/mes en 14 pagas</strong> ({formatCurrency(SMI_2026.anual)} brutos anuales).
                Ningún contrato puede pactarse por debajo. Los trabajadores con rendimientos del trabajo de hasta {formatCurrency(LIMITE_UN_PAGADOR)}
                con un único pagador no están obligados a presentar declaración de la renta, aunque
                pueden hacerlo si el borrador les sale a devolver.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <p>
                <strong>Rendimientos del trabajo superiores a {formatCurrency(LIMITE_UN_PAGADOR)}</strong> con un solo pagador
                están obligados a declarar la renta. Con dos o más pagadores, el límite baja a{' '}
                {formatCurrency(LIMITE_VARIOS_PAGADORES)} si lo cobrado del segundo y restantes pagadores
                supera los {formatCurrency(LIMITE_SEGUNDO_PAGADOR)} anuales (art. 96 LIRPF). Presentarla fuera de plazo
                cuando estás obligado conlleva un recargo del 1 % al 15 % si sale a pagar (art. 27 LGT) o,
                si sale a devolver, una multa de 200 € que baja a 100 € si la presentas antes de que
                Hacienda te la pida (art. 198 LGT).
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores frecuentes que cuestan dinero real</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No actualizar el modelo 145 tras cambios familiares.</strong> Si tienes un hijo
                y no lo comunicas a RRHH, seguirás pagando retención como si fueras soltero/a.
                La diferencia puede superar los 400 €/año.
              </li>
              <li>
                <strong>Confundir salario bruto con coste empresa total.</strong> El coste real para
                la empresa es el bruto <em>más</em> aproximadamente un 30% adicional en cotizaciones
                empresariales. Para un sueldo de 30.000 € brutos, la empresa paga ~9.000 € más en SS.
                Saberlo es útil al negociar una subida.
              </li>
              <li>
                <strong>Pedir una subida de sueldo sin tener en cuenta el salto de tramo IRPF.</strong>
                Con {formatCurrency(BRUTO_SUBIDA)} brutos (tipo marginal del {formatNumber(MARGINAL_SUBIDA, 0)} %), un aumento de
                {' '}{formatCurrency(SUBIDA_BRUTA)} brutos se traduce en {formatCurrency(SUBIDA_NETA)} netos más, porque la subida
                paga IRPF y también Seguridad Social.
                Valora si es más interesante negociar retribución en especie exenta.
              </li>
              <li>
                <strong>Aceptar solo retribución variable sin base garantizada.</strong> La base de
                cotización a la SS se calcula sobre la retribución garantizada. Una base baja implica
                menor prestación por desempleo, baja por enfermedad o prestación por jubilación.
              </li>
              <li>
                <strong>Olvidar que las dietas por encima del límite legal tributan como salario.</strong>
                Los límites exentos son 26,67 €/día sin pernocta (53,34 € con pernocta en España;
                91,35 € en el extranjero). Todo lo que supere ese importe se suma a tu base imponible
                del IRPF.
              </li>
              <li>
                <strong>No pedir el finiquito desglosado al dejar la empresa.</strong> El finiquito
                debe incluir: salario pendiente del mes en curso, pagas proporcionales, vacaciones
                no disfrutadas y cualquier complemento pendiente. Pide el desglose por escrito y
                compáralo con tu nómina antes de firmar.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-sueldo-neto')} />
      <ShareCard appName="estimador-sueldo-neto" />
      <Footer appName="estimador-sueldo-neto" />
    </div>
  );
}
