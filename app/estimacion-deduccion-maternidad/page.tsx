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
  DataReference, RegionBadge
} from '@/components';
import NumberInput from '@/components/NumberInput';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_MATERNIDAD_META,
  DEDUCCION_MATERNIDAD_IRPF_2025,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HijoData {
  tieneGuarderia: boolean;
  gastoGuarderia: string;
}

/**
 * Situaciones del art. 81.1 LIRPF (redacción del art. 64 de la Ley 31/2022,
 * con efectos desde el 01-ene-2023). Las tres primeras dan derecho: no estar
 * de alta HOY no excluye por sí solo, porque la reforma de 2023 incorporó a
 * las perceptoras de desempleo y al alta posterior con 30 días cotizados.
 */
type SituacionLaboral = 'alta' | 'desempleo' | 'alta-posterior' | 'ninguna';

interface Resultado {
  esElegible: boolean;
  motivoNoElegible: string;
  numHijos: number;
  deduccionBase: number;
  incrementoGuarderia: number;
  incrementoAltaPosterior: number;
  totalAnual: number;
  mensualAnticipado: number;
  detalleHijos: { hijo: number; base: number; guarderia: number }[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimacionDeduccionMaternidadPage() {
  const [numHijos, setNumHijos] = useState(1);
  const [situacion, setSituacion] = useState<SituacionLaboral>('alta');
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
    // Solo queda fuera quien no encaja en ninguna de las tres vías del art. 81.1
    if (situacion === 'ninguna') {
      setResultado({
        esElegible: false,
        motivoNoElegible: 'Con los datos indicados no se cumple ninguna de las tres vias del articulo 81.1 de la Ley del IRPF: alta en la Seguridad Social o mutualidad, prestacion o subsidio de desempleo al nacer el menor, o alta posterior con 30 dias cotizados. Si tu situacion cambia durante el ano, la deduccion se calcula por los meses en que si se cumple.',
        numHijos,
        deduccionBase: 0,
        incrementoGuarderia: 0,
        incrementoAltaPosterior: 0,
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

    // Art. 81.3, párrafo 2: 150 € adicionales el mes en que se completan los
    // 30 días cotizados, cuando el derecho nace por un alta posterior al parto.
    const incrementoAltaPosterior =
      situacion === 'alta-posterior'
        ? DEDUCCION_MATERNIDAD_IRPF_2025.incrementoAltaPosterior.importe * numHijos
        : 0;

    const totalAnual = deduccionBase + incrementoGuarderia + incrementoAltaPosterior;

    setResultado({
      esElegible: true,
      motivoNoElegible: '',
      numHijos,
      deduccionBase,
      incrementoGuarderia,
      incrementoAltaPosterior,
      totalAnual,
      mensualAnticipado: totalAnual / 12,
      detalleHijos,
    });
  }, [numHijos, situacion, hijos]);

  const limpiar = useCallback(() => {
    setNumHijos(1);
    setSituacion('alta');
    setHijos([{ tieneGuarderia: false, gastoGuarderia: '' }]);
    setResultado(null);
  }, []);

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">&#x1F469;&#x200D;&#x1F467;</span>
        <h1 className={styles.title}>Estimacion de Deduccion por Maternidad IRPF</h1>
        <p className={styles.subtitle}>
          Estima la deduccion por maternidad o paternidad asimilada: {formatCurrency(1200)}/ano por hijo menor de 3 anos + guarderia
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical">
        Esta herramienta ofrece una estimacion <strong>ORIENTATIVA</strong> de la deduccion
        por maternidad en IRPF (art. 81 Ley 35/2006). <strong>NO constituye asesoramiento fiscal</strong>.
        Los requisitos y condiciones pueden variar. Verifica siempre con la Agencia Tributaria
        o un asesor fiscal cualificado.
      </DisclaimerCard>

      <DataReference
        normativa="Deduccion por maternidad — art. 81 Ley 35/2006 (IRPF)"
        fuente={FISCAL_MATERNIDAD_META.fuente}
        verificado={FISCAL_MATERNIDAD_META.verificado}
        urlOficial={FISCAL_MATERNIDAD_META.urlDeduccionIRPF}
      />

      {/* ── Formulario ───────────────────────────────────────────────────── */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">&#x1F4CB;</span> Datos de la situacion
          </h2>

          <div className={styles.resultNote} role="note" style={{ marginBottom: '1rem' }}>
            <span aria-hidden="true">&#x2139;&#xFE0F;</span>
            <p>
              Esta deduccion tambien aplica a padres viudos, con guarda exclusiva, adoptantes o tutores.
            </p>
          </div>

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

          {/* Situacion laboral: las tres vias del art. 81.1 LIRPF */}
          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>
              ¿Cual es tu situacion respecto a la Seguridad Social?
            </legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="situacion"
                  value="alta"
                  checked={situacion === 'alta'}
                  onChange={() => setSituacion('alta')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  Estoy de alta en la Seguridad Social o mutualidad
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="situacion"
                  value="desempleo"
                  checked={situacion === 'desempleo'}
                  onChange={() => setSituacion('desempleo')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  Cobraba prestacion o subsidio de desempleo cuando nacio el menor
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="situacion"
                  value="alta-posterior"
                  checked={situacion === 'alta-posterior'}
                  onChange={() => setSituacion('alta-posterior')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  Me di de alta despues del nacimiento y ya tengo 30 dias cotizados
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="situacion"
                  value="ninguna"
                  checked={situacion === 'ninguna'}
                  onChange={() => setSituacion('ninguna')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>Ninguna de las anteriores</span>
              </label>
            </div>
            <p className={styles.helpText}>
              Desde el 1 de enero de 2023 no hace falta estar trabajando: el articulo 81.1 de la Ley
              del IRPF incluye tambien a quien percibia prestacion o subsidio de desempleo al nacer el
              menor, y a quien se da de alta despues con 30 dias cotizados.
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
                  <strong>Alternativa:</strong> si te das de alta en la Seguridad Social (por cuenta
                  propia o ajena), tendras derecho a la deduccion al alcanzar los 30 dias cotizados, y
                  ese mes se suman {formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.incrementoAltaPosterior.importe)} adicionales.
                  Tambien aplica a padres viudos o tutores con la guarda y custodia exclusiva.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Requisitos cumplidos */}
              <div className={styles.requisitosGrid}>
                <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                  <span className={styles.requisitoIcon} aria-hidden="true">&#x2705;</span>
                  <span className={styles.requisitoText}>
                    {situacion === 'desempleo'
                      ? 'Prestacion o subsidio de desempleo al nacer el menor'
                      : situacion === 'alta-posterior'
                        ? 'Alta posterior al nacimiento con 30 dias cotizados'
                        : 'Alta en Seguridad Social o Mutualidad'}
                  </span>
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
                {resultado.incrementoAltaPosterior > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Incremento por alta posterior</span>
                    <span className={styles.resultValue}>
                      {formatCurrency(resultado.incrementoAltaPosterior)} (una vez, art. 81.3)
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.resultNote} role="note">
                <span aria-hidden="true">&#x26A0;&#xFE0F;</span>
                <p>
                  No se computan los meses en que alguno de los progenitores cobre por ese hijo/a el{' '}
                  <strong>complemento de ayuda para la infancia</strong> del ingreso minimo vital: la
                  deduccion y ese complemento son incompatibles mes a mes. El incremento por guarderia
                  tiene ademas un segundo tope: el gasto efectivo no subvencionado que hayas pagado al
                  centro.
                </p>
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
          Ley 35/2006 del IRPF. Permite deducir {formatCurrency(1200)} anuales de la cuota del IRPF
          por cada hijo menor de 3 anos. A diferencia de los minimos personales, esta deduccion se
          aplica directamente sobre la cuota del impuesto, euro por euro.
        </p>

        {/* Requisitos */}
        <h3>Requisitos en detalle</h3>
        <p>
          Hay que tener derecho al <strong>minimo por descendientes</strong> por un hijo menor de 3
          anos y encontrarse en <strong>una</strong> de estas tres situaciones (son alternativas, no
          acumulativas):
        </p>
        <ul>
          <li><strong>Estar de alta</strong> en la Seguridad Social o mutualidad alternativa, por cuenta propia o ajena.</li>
          <li><strong>Percibir prestacion o subsidio de desempleo</strong> en el momento del nacimiento del menor, sean prestaciones contributivas o asistenciales.</li>
          <li><strong>Darse de alta despues del nacimiento</strong> y alcanzar 30 dias cotizados: la deduccion del mes en que se cumplen se incrementa ademas en {formatCurrency(150)}.</li>
        </ul>
        <p>
          Esta redaccion es la que dio el articulo 64 de la Ley 31/2022, con efectos desde el 1 de
          enero de 2023. <strong>Antes de esa fecha</strong> la deduccion exigia realizar una actividad
          por cuenta propia o ajena, de modo que las desempleadas quedaban fuera; muchas guias siguen
          repitiendo aquel requisito, que ya no esta en vigor.
        </p>
        <p>
          La deduccion se calcula por meses. No cuentan los meses en que alguno de los progenitores
          perciba por ese descendiente el <strong>complemento de ayuda para la infancia</strong> del
          ingreso minimo vital (Ley 19/2021). El padre puede aplicarla en caso de fallecimiento de la
          madre o si tiene la guarda y custodia exclusiva, y tambien vale en adopcion o acogimiento.
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
              la deduccion se mantiene.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>Estoy en paro cobrando el subsidio, ¿tengo derecho?</h4>
            <p>
              Si percibias una prestacion o subsidio de desempleo cuando nacio tu hijo/a,{' '}
              <strong>si</strong>. Desde el 1 de enero de 2023 el articulo 81.1 de la Ley del IRPF
              incluye expresamente las prestaciones contributivas y asistenciales del sistema de
              proteccion por desempleo. Y si te das de alta mas adelante, tienes derecho al llegar a
              30 dias cotizados, con {formatCurrency(150)} adicionales ese mes.
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
              <strong>Darla por perdida al quedarte sin trabajo:</strong> es el error mas comun, y
              suele venir de guias escritas antes de 2023. Si al nacer el menor percibias prestacion o
              subsidio de desempleo, la deduccion te corresponde igual. Donde si se interrumpe es en
              los meses sin alta y sin prestacion (por ejemplo, una excedencia sin reserva o el fin de
              contrato sin derecho a paro).
            </li>
            <li>
              <strong>Cobrar a la vez el complemento de ayuda para la infancia:</strong> los meses en
              que se percibe ese complemento del ingreso minimo vital por el mismo hijo/a no se
              computan en la deduccion.
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
