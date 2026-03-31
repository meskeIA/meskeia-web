'use client';

import { useState, useCallback } from 'react';
import styles from './EstimacionDeduccionMaternidad.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  DataReference,
} from '@/components';
import NumberInput from '@/components/NumberInput';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_MATERNIDAD_META,
  DEDUCCION_MATERNIDAD_IRPF_2025,
} from '@/data/fiscal';
import { jsonLd } from './metadata';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HijoData {
  tieneGuarderia: boolean;
  gastoGuarderia: string;
}

interface Resultado {
  esElegible: boolean;
  motivoNoElegible: string;
  numHijos: number;
  deduccionBase: number;
  incrementoGuarderia: number;
  totalAnual: number;
  mensualAnticipado: number;
  detalleHijos: { hijo: number; base: number; guarderia: number }[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimacionDeduccionMaternidadPage() {
  const [numHijos, setNumHijos] = useState(1);
  const [altaSS, setAltaSS] = useState<'si' | 'no'>('si');
  const [hijos, setHijos] = useState<HijoData[]>([
    { tieneGuarderia: false, gastoGuarderia: '' },
  ]);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Sincronizar array de hijos cuando cambia el selector
  const cambiarNumHijos = useCallback((n: number) => {
    setNumHijos(n);
    setHijos((prev) => {
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, () => ({
            tieneGuarderia: false,
            gastoGuarderia: '',
          })),
        ];
      }
      return prev.slice(0, n);
    });
    setResultado(null);
  }, []);

  const actualizarHijo = useCallback((index: number, campo: keyof HijoData, valor: boolean | string) => {
    setHijos((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }, []);

  const calcular = useCallback(() => {
    // Verificar elegibilidad
    if (altaSS === 'no') {
      setResultado({
        esElegible: false,
        motivoNoElegible: 'Es necesario estar dada de alta en la Seguridad Social o Mutualidad para aplicar la deduccion por maternidad.',
        numHijos,
        deduccionBase: 0,
        incrementoGuarderia: 0,
        totalAnual: 0,
        mensualAnticipado: 0,
        detalleHijos: [],
      });
      return;
    }

    const importeBase = DEDUCCION_MATERNIDAD_IRPF_2025.importeAnualPorHijo;
    const maxGuarderia = DEDUCCION_MATERNIDAD_IRPF_2025.incrementoGuarderia.importeMaximoAnual;

    let deduccionBase = 0;
    let incrementoGuarderia = 0;
    const detalleHijos: { hijo: number; base: number; guarderia: number }[] = [];

    for (let i = 0; i < numHijos; i++) {
      const hijo = hijos[i];
      const base = importeBase;
      let guarderia = 0;

      if (hijo && hijo.tieneGuarderia) {
        const gastoStr = hijo.gastoGuarderia.replace(/\./g, '').replace(',', '.');
        const gastoNum = parseFloat(gastoStr) || 0;
        guarderia = Math.min(gastoNum, maxGuarderia);
      }

      deduccionBase += base;
      incrementoGuarderia += guarderia;
      detalleHijos.push({ hijo: i + 1, base, guarderia });
    }

    const totalAnual = deduccionBase + incrementoGuarderia;

    setResultado({
      esElegible: true,
      motivoNoElegible: '',
      numHijos,
      deduccionBase,
      incrementoGuarderia,
      totalAnual,
      mensualAnticipado: totalAnual / 12,
      detalleHijos,
    });
  }, [numHijos, altaSS, hijos]);

  const limpiar = useCallback(() => {
    setNumHijos(1);
    setAltaSS('si');
    setHijos([{ tieneGuarderia: false, gastoGuarderia: '' }]);
    setResultado(null);
  }, []);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">&#x1F469;&#x200D;&#x1F467;</span>
        <h1 className={styles.title}>Estimacion de Deduccion por Maternidad IRPF</h1>
        <p className={styles.subtitle}>
          Estima la deduccion por maternidad: {formatCurrency(1200)}/ano por hijo menor de 3 anos + guarderia
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical">
        Esta herramienta ofrece una estimacion <strong>ORIENTATIVA</strong> de la deduccion
        por maternidad en IRPF (art. 81 Ley 35/2006). <strong>NO constituye asesoramiento fiscal</strong>.
        Los requisitos y condiciones pueden variar. Verifica siempre con la Agencia Tributaria
        o un asesor fiscal cualificado.
      </DisclaimerCard>

      <DataReference
        normativa="Deduccion por maternidad IRPF 2025"
        fuente={FISCAL_MATERNIDAD_META.fuente}
        verificado={FISCAL_MATERNIDAD_META.verificado}
        urlOficial={FISCAL_MATERNIDAD_META.urlOficial}
      />

      {/* ── Formulario ───────────────────────────────────────────────────── */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">&#x1F4CB;</span> Datos de la situacion
          </h2>

          {/* Numero de hijos */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="numHijos">
              Numero de hijos menores de 3 anos
            </label>
            <select
              id="numHijos"
              className={styles.select}
              value={numHijos}
              onChange={(e) => cambiarNumHijos(Number(e.target.value))}
            >
              <option value={1}>1 hijo/a</option>
              <option value={2}>2 hijos/as</option>
              <option value={3}>3 hijos/as</option>
              <option value={4}>4 o mas hijos/as</option>
            </select>
          </div>

          {/* Alta en SS */}
          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>
              ¿Estas dada de alta en la Seguridad Social o Mutualidad?
            </legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="altaSS"
                  value="si"
                  checked={altaSS === 'si'}
                  onChange={() => setAltaSS('si')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>Si, estoy de alta</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="altaSS"
                  value="no"
                  checked={altaSS === 'no'}
                  onChange={() => setAltaSS('no')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>No, actualmente no estoy de alta</span>
              </label>
            </div>
            <p className={styles.helpText}>
              Es requisito imprescindible estar dada de alta en la SS o Mutualidad al menos 1 dia del mes.
            </p>
          </fieldset>

          {/* Datos por hijo */}
          {hijos.map((hijo, index) => (
            <div key={index} className={styles.childCard}>
              <p className={styles.childCardTitle}>
                <span aria-hidden="true">&#x1F476;</span> Hijo/a {index + 1}
              </p>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hijo.tieneGuarderia}
                  onChange={(e) => actualizarHijo(index, 'tieneGuarderia', e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxText}>
                  Tiene gastos de guarderia o centro infantil autorizado
                </span>
              </label>

              {hijo.tieneGuarderia && (
                <div style={{ marginTop: '0.75rem' }}>
                  <NumberInput
                    label="Gasto anual aproximado en guarderia"
                    value={hijo.gastoGuarderia}
                    onChange={(val) => actualizarHijo(index, 'gastoGuarderia', val)}
                    placeholder="0"
                    min={0}
                    max={10000}
                    suffix="euro"
                    helperText={`Maximo deducible: ${formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.incrementoGuarderia.importeMaximoAnual)}/ano por hijo`}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={calcular}
              aria-label="Estimar deduccion por maternidad"
            >
              Estimar deduccion
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={limpiar}
              aria-label="Limpiar formulario"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Resultados ──────────────────────────────────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">&#x1F4CA;</span> Resultado estimado
          </h2>

          {!resultado ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">&#x1F469;&#x200D;&#x1F467;</span>
              <p>Completa los datos y pulsa &quot;Estimar deduccion&quot; para ver el resultado</p>
            </div>
          ) : !resultado.esElegible ? (
            <>
              {/* Requisitos no cumplidos */}
              <div className={styles.requisitosGrid}>
                <div className={`${styles.requisitoItem} ${styles.requisitoFail}`}>
                  <span className={styles.requisitoIcon} aria-hidden="true">&#x274C;</span>
                  <span className={styles.requisitoText}>Alta en Seguridad Social o Mutualidad</span>
                </div>
                <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                  <span className={styles.requisitoIcon} aria-hidden="true">&#x2705;</span>
                  <span className={styles.requisitoText}>Hijos menores de 3 anos ({resultado.numHijos})</span>
                </div>
              </div>

              <div className={styles.noEligibleBox}>
                <h3>No cumples los requisitos actualmente</h3>
                <p>{resultado.motivoNoElegible}</p>
                <p style={{ marginTop: '0.75rem' }}>
                  <strong>Alternativa:</strong> Si te das de alta en la SS (por cuenta propia o ajena),
                  podras aplicar la deduccion desde ese mismo mes. Tambien aplica a padres viudos o tutores.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Requisitos cumplidos */}
              <div className={styles.requisitosGrid}>
                <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                  <span className={styles.requisitoIcon} aria-hidden="true">&#x2705;</span>
                  <span className={styles.requisitoText}>Alta en Seguridad Social o Mutualidad</span>
                </div>
                <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                  <span className={styles.requisitoIcon} aria-hidden="true">&#x2705;</span>
                  <span className={styles.requisitoText}>Hijos menores de 3 anos ({resultado.numHijos})</span>
                </div>
              </div>

              <div className={styles.resultGrid}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Deduccion base</span>
                  <span className={styles.resultValue}>
                    {resultado.numHijos} x {formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.importeAnualPorHijo)} = {formatCurrency(resultado.deduccionBase)}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Incremento guarderia</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.incrementoGuarderia)}</span>
                </div>
                {resultado.detalleHijos.map((d) => (
                  d.guarderia > 0 && (
                    <div key={d.hijo} className={styles.resultItem}>
                      <span className={styles.resultLabel}>Guarderia hijo/a {d.hijo}</span>
                      <span className={styles.resultValue}>
                        {formatCurrency(d.guarderia)} (max {formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.incrementoGuarderia.importeMaximoAnual)})
                      </span>
                    </div>
                  )
                ))}
              </div>

              <div className={styles.resultadoFinal}>
                <p className={styles.resultadoLabel}>Total deduccion anual</p>
                <p className={styles.resultadoValor}>{formatCurrency(resultado.totalAnual)}</p>
                <span className={styles.resultadoBadge}>al ano</span>
              </div>

              <div className={styles.resultGrid}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cobro anticipado mensual</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.mensualAnticipado)}/mes</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Formulario</span>
                  <span className={styles.resultValue}>Modelo 140 (AEAT)</span>
                </div>
              </div>

              <div className={styles.modeloBox} role="note">
                <span aria-hidden="true">&#x1F4DD;</span>
                <p>
                  Puedes solicitar el <strong>cobro anticipado mensual</strong> de{' '}
                  {formatCurrency(resultado.mensualAnticipado)}/mes presentando el{' '}
                  <strong>Modelo 140</strong> en la Agencia Tributaria. Tambien puedes incluirlo
                  directamente en la declaracion de la renta anual.
                </p>
              </div>

              <div className={styles.resultNote} role="note" style={{ marginTop: '1rem' }}>
                <span aria-hidden="true">&#x1F4A1;</span>
                <p>
                  La deduccion por maternidad es una <strong>deduccion en cuota</strong>: se resta directamente
                  del impuesto a pagar, euro por euro. No depende del tipo marginal.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Seccion educativa v2.0 ─────────────────────────────────────── */}
      <EducationalSection
        title="Todo sobre la deduccion por maternidad en IRPF"
        subtitle="Guia completa: requisitos, cobro anticipado y guarderia"
      >
        {/* Concepto */}
        <h3>¿Que es la deduccion por maternidad?</h3>
        <p>
          La deduccion por maternidad es un beneficio fiscal regulado en el articulo 81 de la
          Ley 35/2006 del IRPF. Permite a las madres trabajadoras (o padres viudos/tutores)
          deducir {formatCurrency(1200)} anuales de la cuota del IRPF por cada hijo menor
          de 3 anos. A diferencia de los minimos personales, esta deduccion se aplica directamente
          sobre la cuota del impuesto, euro por euro.
        </p>

        {/* Requisitos */}
        <h3>Requisitos en detalle</h3>
        <p>Para poder aplicar la deduccion por maternidad debes cumplir <strong>todos</strong> estos requisitos:</p>
        <ul>
          <li><strong>Ser madre trabajadora</strong> (o padre viudo/tutor legal del menor).</li>
          <li><strong>Estar dada de alta</strong> en la Seguridad Social o Mutualidad alternativa al menos 1 dia del mes.</li>
          <li><strong>Tener hijos menores de 3 anos</strong>. La deduccion se aplica desde el mes de nacimiento hasta el mes en que el hijo cumple 3 anos (inclusive).</li>
          <li><strong>Realizar una actividad por cuenta propia o ajena</strong>. Las desempleadas con prestacion (sin cotizacion) no pueden aplicarla.</li>
        </ul>
        <p>
          El padre puede aplicarla en caso de fallecimiento de la madre o si tiene la guarda
          y custodia exclusiva. Tambien aplica en caso de adopcion o acogimiento.
        </p>

        {/* Cobro anticipado */}
        <h3>Como solicitar el cobro anticipado (Modelo 140)</h3>
        <p>
          En lugar de esperar a la declaracion de la renta, puedes solicitar el cobro anticipado
          de {formatCurrency(100)}/mes por hijo presentando el <strong>Modelo 140</strong> en la
          Agencia Tributaria. Se puede hacer por:
        </p>
        <ul>
          <li><strong>Sede electronica AEAT</strong>: Con certificado digital, DNI electronico o Cl@ve.</li>
          <li><strong>Telefono</strong>: Llamando al 901 200 345.</li>
          <li><strong>Presencialmente</strong>: En cualquier oficina de la AEAT.</li>
        </ul>
        <p>
          Si cobras el anticipo y luego dejas de cumplir los requisitos (por ejemplo, baja de la SS),
          deberas devolver las cantidades cobradas indebidamente en la declaracion de la renta.
        </p>

        {/* Tabla comparativa */}
        <h3>Comparativa: deduccion base vs. con guarderia</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Solo deduccion base</th>
                <th>Con incremento guarderia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Deduccion por hijo/ano</td>
                <td>{formatCurrency(1200)}</td>
                <td>Hasta {formatCurrency(2200)}</td>
              </tr>
              <tr>
                <td>Anticipo mensual</td>
                <td>{formatCurrency(100)}/mes</td>
                <td>Hasta {formatCurrency(183.33)}/mes</td>
              </tr>
              <tr>
                <td>2 hijos/ano</td>
                <td>{formatCurrency(2400)}</td>
                <td>Hasta {formatCurrency(4400)}</td>
              </tr>
              <tr>
                <td>Requisitos adicionales</td>
                <td>Alta SS + hijo &lt; 3 anos</td>
                <td>+ Guarderia/centro autorizado</td>
              </tr>
              <tr>
                <td>Comunicacion AEAT</td>
                <td>No necesaria</td>
                <td>El centro debe informar a AEAT</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios */}
        <h3>Ejemplos practicos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">&#x1F469;&#x200D;&#x1F4BC;</span>
              <h4>1 hijo, sin guarderia</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Madre trabajadora por cuenta ajena, 1 hijo de 1 ano.</p>
              <p>Deduccion base: {formatCurrency(1200)}/ano.</p>
              <p>Anticipo: {formatCurrency(100)}/mes via Modelo 140.</p>
              <p><strong>Total: {formatCurrency(1200)}/ano</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              Si el hijo nace en julio, ese ano solo corresponden 6 meses ({formatCurrency(600)}).
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">&#x1F468;&#x200D;&#x1F467;&#x200D;&#x1F466;</span>
              <h4>2 hijos con guarderia</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Madre con 2 hijos de 1 y 2 anos. Guarderia {formatCurrency(3000)}/ano cada uno.</p>
              <p>Base: 2 x {formatCurrency(1200)} = {formatCurrency(2400)}.</p>
              <p>Guarderia: 2 x {formatCurrency(1000)} = {formatCurrency(2000)} (tope).</p>
              <p><strong>Total: {formatCurrency(4400)}/ano</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              El incremento por guarderia se limita a {formatCurrency(1000)}/hijo aunque el gasto real sea mayor.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">&#x1F4BC;</span>
              <h4>Autonoma con 1 hijo</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Madre autonoma, cotizando en RETA, 1 hijo de 2 anos.</p>
              <p>Misma deduccion que por cuenta ajena: {formatCurrency(1200)}/ano.</p>
              <p>Puede solicitar anticipo mensual igualmente.</p>
              <p><strong>Total: {formatCurrency(1200)}/ano</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              Las autonomas deben estar al corriente de pago con la SS para mantener el alta.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">&#x1F468;&#x200D;&#x1F467;</span>
              <h4>Padre viudo con 1 hijo</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Padre viudo, trabajador, 1 hijo de 6 meses en guarderia ({formatCurrency(2500)}/ano).</p>
              <p>Base: {formatCurrency(1200)}. Guarderia: {formatCurrency(1000)} (tope).</p>
              <p><strong>Total: {formatCurrency(2200)}/ano</strong></p>
            </div>
            <div className={styles.escenarioTip}>
              El padre viudo tiene exactamente los mismos derechos que la madre trabajadora.
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Puedo cobrar la deduccion si estoy de baja por maternidad?</h4>
            <p>
              Si. Durante la baja por maternidad/paternidad sigues de alta en la SS, por lo que
              la deduccion se mantiene. Solo se interrumpe si causas baja definitiva.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Que pasa si trabajo a tiempo parcial?</h4>
            <p>
              La deduccion es la misma ({formatCurrency(1200)}/ano) independientemente de la
              jornada. Lo importante es estar de alta en la SS al menos 1 dia del mes.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cualquier guarderia vale para el incremento?</h4>
            <p>
              No. El centro debe ser una <strong>guarderia o centro de educacion infantil autorizado</strong> por
              la administracion educativa competente. Ademas, el centro debe comunicar los datos
              del menor a la AEAT (modelo 233).
            </p>
            <div className={styles.faqTip}>
              Pregunta a tu guarderia si presenta el modelo 233 a Hacienda.
            </div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hasta cuando puedo aplicar la deduccion?</h4>
            <p>
              Hasta el mes en que el hijo cumple 3 anos (inclusive). El incremento por guarderia
              se aplica hasta el mes anterior al inicio del segundo ciclo de educacion infantil
              (generalmente septiembre del ano en que cumple 3).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Si adopto un hijo tambien puedo aplicarla?</h4>
            <p>
              Si. La deduccion se aplica igualmente en adopcion y acogimiento. Los 3 anos se
              cuentan desde la fecha de inscripcion en el Registro Civil o resolucion judicial.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Puedo aplicar la deduccion y cobrar el anticipo a la vez?</h4>
            <p>
              No exactamente. Si cobras el anticipo mensual ({formatCurrency(100)}/mes via Modelo 140),
              en la declaracion de la renta se regulariza: la deduccion total menos lo ya cobrado
              por anticipo. El resultado es el mismo importe anual.
            </p>
          </div>
        </div>

        {/* Tips */}
        <h3>Consejos practicos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">&#x1F4DD;</span>
            <h4>Solicita el Modelo 140 cuanto antes</h4>
            <p>
              Desde el mes de nacimiento puedes solicitar el cobro anticipado. No esperes
              a la declaracion de la renta para beneficiarte de los {formatCurrency(100)}/mes.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">&#x1F3EB;</span>
            <h4>Verifica que tu guarderia es autorizada</h4>
            <p>
              Solo las guarderias autorizadas que presentan el modelo 233 a la AEAT permiten
              aplicar el incremento de hasta {formatCurrency(1000)}/ano.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">&#x1F4C5;</span>
            <h4>Controla las fechas</h4>
            <p>
              La deduccion se aplica mes a mes. Si tu hijo cumple 3 anos en marzo, solo
              corresponden 3 meses de deduccion ese ano ({formatCurrency(300)}).
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">&#x1F46A;</span>
            <h4>Familias monoparentales: revisa otras deducciones</h4>
            <p>
              Si eres familia monoparental, puedes beneficiarte de la tributacion conjunta
              y otros beneficios fiscales adicionales a la deduccion por maternidad.
            </p>
          </div>
        </div>

        {/* Warning box v2.0 */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">&#x26A0;&#xFE0F;</span>
            <h3>Errores frecuentes y limitaciones</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>No estar de alta en la SS:</strong> es el error mas comun. Si pierdes el alta
              (excedencia sin reserva, fin de contrato sin prestacion contributiva), pierdes la
              deduccion desde ese mes.
            </li>
            <li>
              <strong>Guarderia no autorizada:</strong> las ludotecas, cuidadores particulares o
              centros sin autorizacion educativa no dan derecho al incremento de {formatCurrency(1000)}.
            </li>
            <li>
              <strong>No comunicar cambios:</strong> si cobraste el anticipo y dejaste de cumplir
              requisitos, debes devolver las cantidades indebidas en la declaracion de la renta.
            </li>
            <li>
              <strong>Confundir con el cheque guarderia de empresa:</strong> la retribucion en especie
              por guarderia (exenta hasta {formatCurrency(1000)}) es compatible pero diferente de la
              deduccion por maternidad.
            </li>
            <li>
              <strong>Esta herramienta no considera meses parciales:</strong> si el hijo nace o cumple
              3 anos a mitad de ano, el calculo real sera proporcional a los meses de derecho.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimacion-deduccion-maternidad')} />
      <ShareCard appName="estimacion-deduccion-maternidad" />
      <Footer appName="estimacion-deduccion-maternidad" />
    </div>
  );
}
