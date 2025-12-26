'use client';

import { useState, useCallback } from 'react';
import styles from './CalculadoraSueldoNeto.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de cálculo
type TipoCalculo = 'brutoANeto' | 'netoABruto';

// Situación familiar para IRPF
type SituacionFamiliar = 'soltero' | 'casado_un_ingreso' | 'casado_dos_ingresos' | 'familia_monoparental';

// Tramos IRPF 2025 (estatal + autonómica media)
const TRAMOS_IRPF_2025 = [
  { hasta: 12450, tipo: 19 },
  { hasta: 20200, tipo: 24 },
  { hasta: 35200, tipo: 30 },
  { hasta: 60000, tipo: 37 },
  { hasta: 300000, tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

// Cotizaciones Seguridad Social 2025 (trabajador por cuenta ajena)
const COTIZACIONES_SS_2025 = {
  contingenciasComunes: 4.70,
  desempleo: 1.55,
  formacionProfesional: 0.10,
  mef: 0.12, // Mecanismo de Equidad Intergeneracional
};

// Bases de cotización 2025
const BASES_COTIZACION_2025 = {
  minima: 1184.40, // mensual
  maxima: 4720.50, // mensual
};

// Mínimos personales y familiares IRPF 2025
const MINIMOS_IRPF_2025 = {
  personal: 5550,
  personal_65: 6700,
  personal_75: 8100,
  hijo_1: 2400,
  hijo_2: 2700,
  hijo_3: 4000,
  hijo_4_mas: 4500,
  hijo_menor_3: 2800, // adicional
  ascendiente_65: 1150,
  ascendiente_75: 2550,
  discapacidad_33_65: 3000,
  discapacidad_65_mas: 9000,
};

// Función para calcular el IRPF
function calcularIRPF(baseImponible: number, minimos: number): number {
  const baseLiquidable = Math.max(0, baseImponible - minimos);
  let cuota = 0;
  let baseRestante = baseLiquidable;
  let limiteAnterior = 0;

  for (const tramo of TRAMOS_IRPF_2025) {
    const baseTramo = Math.min(baseRestante, tramo.hasta - limiteAnterior);
    if (baseTramo <= 0) break;
    cuota += baseTramo * (tramo.tipo / 100);
    baseRestante -= baseTramo;
    limiteAnterior = tramo.hasta;
  }

  return cuota;
}

// Función para calcular la Seguridad Social
function calcularSeguridadSocial(salarioBrutoAnual: number): { anual: number; mensual: number; desglose: Record<string, number> } {
  const salarioMensual = salarioBrutoAnual / 12;

  // Aplicar bases de cotización
  const baseCotizacion = Math.max(
    BASES_COTIZACION_2025.minima,
    Math.min(salarioMensual, BASES_COTIZACION_2025.maxima)
  );

  const desglose: Record<string, number> = {};
  let totalMensual = 0;

  // Calcular cada concepto
  desglose.contingenciasComunes = baseCotizacion * (COTIZACIONES_SS_2025.contingenciasComunes / 100);
  desglose.desempleo = baseCotizacion * (COTIZACIONES_SS_2025.desempleo / 100);
  desglose.formacionProfesional = baseCotizacion * (COTIZACIONES_SS_2025.formacionProfesional / 100);
  desglose.mef = baseCotizacion * (COTIZACIONES_SS_2025.mef / 100);

  totalMensual = Object.values(desglose).reduce((a, b) => a + b, 0);

  return {
    mensual: totalMensual,
    anual: totalMensual * 12,
    desglose,
  };
}

// Función para calcular mínimos personales
function calcularMinimosPersonales(
  situacion: SituacionFamiliar,
  numHijos: number,
  hijosMenores3: number
): number {
  let minimos = MINIMOS_IRPF_2025.personal;

  // Añadir por hijos
  if (numHijos >= 1) minimos += MINIMOS_IRPF_2025.hijo_1;
  if (numHijos >= 2) minimos += MINIMOS_IRPF_2025.hijo_2;
  if (numHijos >= 3) minimos += MINIMOS_IRPF_2025.hijo_3;
  if (numHijos >= 4) minimos += MINIMOS_IRPF_2025.hijo_4_mas * (numHijos - 3);

  // Adicional por hijos menores de 3 años
  minimos += hijosMenores3 * MINIMOS_IRPF_2025.hijo_menor_3;

  // En familia monoparental, los mínimos por descendientes se incrementan
  if (situacion === 'familia_monoparental' && numHijos > 0) {
    minimos += 2150; // Incremento primer descendiente
  }

  return minimos;
}

// Calcular neto a partir del bruto
function calcularBrutoANeto(
  brutoAnual: number,
  situacion: SituacionFamiliar,
  numHijos: number,
  hijosMenores3: number,
  pagas: number
): {
  netoAnual: number;
  netoMensual: number;
  irpfAnual: number;
  irpfPorcentaje: number;
  ssAnual: number;
  ssDesglose: Record<string, number>;
  tipoRetencion: number;
} {
  const ss = calcularSeguridadSocial(brutoAnual);
  const baseImponible = brutoAnual - ss.anual;
  const minimos = calcularMinimosPersonales(situacion, numHijos, hijosMenores3);
  const irpfAnual = calcularIRPF(baseImponible, minimos);
  const tipoRetencion = brutoAnual > 0 ? (irpfAnual / brutoAnual) * 100 : 0;
  const netoAnual = brutoAnual - ss.anual - irpfAnual;

  return {
    netoAnual,
    netoMensual: netoAnual / pagas,
    irpfAnual,
    irpfPorcentaje: (irpfAnual / brutoAnual) * 100,
    ssAnual: ss.anual,
    ssDesglose: ss.desglose,
    tipoRetencion,
  };
}

// Calcular bruto a partir del neto (aproximación iterativa)
function calcularNetoABruto(
  netoAnualObjetivo: number,
  situacion: SituacionFamiliar,
  numHijos: number,
  hijosMenores3: number,
  pagas: number
): {
  brutoAnual: number;
  brutoMensual: number;
  irpfAnual: number;
  irpfPorcentaje: number;
  ssAnual: number;
  ssDesglose: Record<string, number>;
  tipoRetencion: number;
} {
  // Estimación inicial: neto / 0.7 (asumiendo ~30% de deducciones)
  let brutoEstimado = netoAnualObjetivo / 0.7;
  const tolerancia = 0.01;
  const maxIteraciones = 100;

  for (let i = 0; i < maxIteraciones; i++) {
    const resultado = calcularBrutoANeto(brutoEstimado, situacion, numHijos, hijosMenores3, pagas);
    const diferencia = resultado.netoAnual - netoAnualObjetivo;

    if (Math.abs(diferencia) < tolerancia) {
      return {
        brutoAnual: brutoEstimado,
        brutoMensual: brutoEstimado / pagas,
        irpfAnual: resultado.irpfAnual,
        irpfPorcentaje: resultado.irpfPorcentaje,
        ssAnual: resultado.ssAnual,
        ssDesglose: resultado.ssDesglose,
        tipoRetencion: resultado.tipoRetencion,
      };
    }

    // Ajustar estimación
    brutoEstimado -= diferencia * 0.8;
  }

  // Devolver mejor aproximación
  const resultadoFinal = calcularBrutoANeto(brutoEstimado, situacion, numHijos, hijosMenores3, pagas);
  return {
    brutoAnual: brutoEstimado,
    brutoMensual: brutoEstimado / pagas,
    irpfAnual: resultadoFinal.irpfAnual,
    irpfPorcentaje: resultadoFinal.irpfPorcentaje,
    ssAnual: resultadoFinal.ssAnual,
    ssDesglose: resultadoFinal.ssDesglose,
    tipoRetencion: resultadoFinal.tipoRetencion,
  };
}

export default function CalculadoraSueldoNetoPage() {
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
  } | null>(null);

  const calcular = useCallback(() => {
    const salarioNum = parseSpanishNumber(salario);
    const hijosNum = parseInt(numHijos) || 0;
    const hijosMenores3Num = Math.min(parseInt(hijosMenores3) || 0, hijosNum);
    const pagasNum = parseInt(pagas) || 12;

    if (salarioNum <= 0) {
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
        <h1 className={styles.title}>Calculadora Sueldo Neto ↔ Bruto</h1>
        <p className={styles.subtitle}>
          Convierte tu salario bruto a neto o viceversa. IRPF y Seguridad Social actualizados para España 2025.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tipo de cálculo</h2>

            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${tipoCalculo === 'brutoANeto' ? styles.active : ''}`}
                onClick={() => { setTipoCalculo('brutoANeto'); setCalculado(false); }}
              >
                Bruto → Neto
              </button>
              <button
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
              <label className={styles.label}>Situación familiar</label>
              <select
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
              <label className={styles.label}>Número de pagas</label>
              <select
                value={pagas}
                onChange={(e) => setPagas(e.target.value)}
                className={styles.select}
              >
                <option value="12">12 pagas</option>
                <option value="14">14 pagas</option>
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={calcular} className={styles.btnPrimary}>
                Calcular
              </button>
              <button onClick={limpiar} className={styles.btnSecondary}>
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
                    <span>Retención IRPF anual</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.irpfAnual)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>Tipo de retención efectivo</span>
                    <span className={styles.desgloseValue}>{formatNumber(resultado.tipoRetencion, 2)}%</span>
                  </div>
                </div>

                <div className={styles.desgloseSection}>
                  <h4>Seguridad Social (Trabajador)</h4>
                  <div className={styles.desgloseRow}>
                    <span>Contingencias comunes (4,70%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.contingenciasComunes * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>Desempleo (1,55%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.desempleo * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>Formación profesional (0,10%)</span>
                    <span className={styles.desgloseValue}>{formatCurrency(resultado.ssDesglose.formacionProfesional * 12)}</span>
                  </div>
                  <div className={styles.desgloseRow}>
                    <span>MEF - Equidad Intergeneracional (0,12%)</span>
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
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> basada en los tramos de IRPF
          y cotizaciones a la Seguridad Social para 2025. Los resultados pueden variar según:
        </p>
        <ul>
          <li>Tu comunidad autónoma (el IRPF autonómico puede diferir)</li>
          <li>Otras deducciones aplicables (discapacidad, ascendientes a cargo, etc.)</li>
          <li>Convenio colectivo y tipo de contrato</li>
          <li>Reducciones por aportaciones a planes de pensiones, etc.</li>
        </ul>
        <p>
          <strong>NO constituye asesoramiento fiscal ni laboral profesional.</strong> Para un cálculo exacto,
          consulta con un asesor fiscal o utiliza el simulador oficial de la Agencia Tributaria.
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
              <h4>💼 Salario Bruto</h4>
              <p>
                Incluye tu sueldo base más complementos (antigüedad, peligrosidad, etc.),
                pagas extras y cualquier retribución en especie. Es la cifra que aparece
                en tu contrato de trabajo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💰 Salario Neto</h4>
              <p>
                Es el resultado de restar al bruto las cotizaciones a la Seguridad Social
                (aproximadamente 6,47%) y la retención del IRPF (variable según tu situación).
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
            <h4>Tramos IRPF 2025 (Estatal + Autonómico medio)</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0 €</td><td>12.450 €</td><td>19%</td></tr>
                <tr><td>12.450 €</td><td>20.200 €</td><td>24%</td></tr>
                <tr><td>20.200 €</td><td>35.200 €</td><td>30%</td></tr>
                <tr><td>35.200 €</td><td>60.000 €</td><td>37%</td></tr>
                <tr><td>60.000 €</td><td>300.000 €</td><td>45%</td></tr>
                <tr><td>300.000 €</td><td>En adelante</td><td>47%</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.infoBox}>
            <h4>📌 Ejemplo práctico</h4>
            <p>
              Si ganas 30.000 € brutos, NO pagas el 30% de todo. Pagas:
            </p>
            <ul>
              <li>19% de los primeros 12.450 € = 2.365,50 €</li>
              <li>24% de 12.450 € a 20.200 € = 1.860 €</li>
              <li>30% de 20.200 € a 30.000 € = 2.940 €</li>
              <li><strong>Total IRPF</strong>: 7.165,50 € (23,88% efectivo, no 30%)</li>
            </ul>
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
              <h4>👤 Lo que pagas tú (trabajador)</h4>
              <ul>
                <li>Contingencias comunes: 4,70%</li>
                <li>Desempleo: 1,55%</li>
                <li>Formación profesional: 0,10%</li>
                <li>MEF: 0,12%</li>
                <li><strong>Total: 6,47%</strong></li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🏢 Lo que paga la empresa</h4>
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-sueldo-neto')} />
      <Footer appName="calculadora-sueldo-neto" />
    </div>
  );
}
