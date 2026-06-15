'use client';

import { useState, useMemo } from 'react';
import styles from './EstimacionPrestacionNacimiento.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  LegalNotice,
  NumberInput, RegionBadge
} from '@/components';
import DataReference from '@/components/DataReference';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency } from '@/lib';
import {
  FISCAL_MATERNIDAD_META,
  PRESTACION_NACIMIENTO_2025,
  PERMISO_NACIMIENTO_2025,
  AMPLIACIONES_PERMISO,
} from '@/data/fiscal';

// ===== TIPOS =====
type RangoEdad = 'menor21' | '21a25' | 'mayor26';
type Situacion = 'nacimiento' | 'adopcion' | 'acogimiento';
type TipoFamilia = 'biparental' | 'monoparental';

interface ResultadoEstimacion {
  baseReguladoraDiaria: number;
  prestacionDiaria: number;
  semanasBase: number;
  semanasExtra: number;
  semanasTotal: number;
  diasTotal: number;
  prestacionTotal: number;
  semanasObligatorias: number;
  semanasVoluntarias: number;
  detalleAmpliaciones: string[];
  esContributiva: boolean;
}

// ===== COMPONENTE PRINCIPAL =====
export default function EstimacionPrestacionNacimiento() {
  const [edad, setEdad] = useState<RangoEdad>('mayor26');
  const [baseCotizacion, setBaseCotizacion] = useState<string>('');
  const [tipoFamilia, setTipoFamilia] = useState<TipoFamilia>('biparental');
  const [situacion, setSituacion] = useState<Situacion>('nacimiento');
  const [partoMultiple, setPartoMultiple] = useState(false);
  const [numHijos, setNumHijos] = useState<number>(2);
  const [hospitalizacion, setHospitalizacion] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Parsear la base de cotizacion
  const baseMensual = useMemo(() => {
    const limpio = baseCotizacion.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
  }, [baseCotizacion]);

  // Calcular resultado
  const resultado: ResultadoEstimacion | null = useMemo(() => {
    if (!mostrarResultados || baseMensual <= 0) return null;

    const { basesReferencia, cotizacionMinima, noContributiva } = PRESTACION_NACIMIENTO_2025;

    // Verificar si cumple requisitos de cotizacion (simplificado: asumimos que si)
    // En la realidad, habria que comprobar los dias cotizados
    const baseAplicable = Math.min(
      Math.max(baseMensual, basesReferencia.baseMinimaMensual),
      basesReferencia.baseMaximaMensual
    );

    // Determinar si es contributiva (simplificado: si la base es razonable)
    const esContributiva = baseMensual >= basesReferencia.baseMinimaMensual * 0.5;

    if (!esContributiva) {
      // Prestacion no contributiva
      return {
        baseReguladoraDiaria: noContributiva.cuantiaDiaria,
        prestacionDiaria: noContributiva.cuantiaDiaria,
        semanasBase: 6,
        semanasExtra: 0,
        semanasTotal: 6,
        diasTotal: noContributiva.duracion,
        prestacionTotal: noContributiva.cuantiaDiaria * noContributiva.duracion,
        semanasObligatorias: 6,
        semanasVoluntarias: 0,
        detalleAmpliaciones: [],
        esContributiva: false,
      };
    }

    // Prestacion contributiva
    const brDiaria = baseAplicable / 30;
    const prestacionDiaria = brDiaria; // 100% de la BR

    const permiso = PERMISO_NACIMIENTO_2025.find((p) => p.tipoFamilia === tipoFamilia) ?? PERMISO_NACIMIENTO_2025[0];
    let semanasExtra = 0;
    const detalleAmpliaciones: string[] = [];

    // Ampliaciones
    if (partoMultiple && numHijos >= 2) {
      const hijosExtra = numHijos - 1;
      const ampMultiple = AMPLIACIONES_PERMISO.find((a) => a.motivo === 'Parto m\u00FAltiple');
      if (ampMultiple) {
        const semanas = ampMultiple.semanasExtra * hijosExtra;
        semanasExtra += semanas;
        detalleAmpliaciones.push(
          `+${semanas} semanas por parto multiple (${hijosExtra} hijo${hijosExtra > 1 ? 's' : ''} adicional${hijosExtra > 1 ? 'es' : ''})`
        );
      }
    }

    if (hospitalizacion) {
      const ampHosp = AMPLIACIONES_PERMISO.find((a) =>
        a.motivo.includes('hospitalizaci\u00F3n neonatal') || a.motivo.includes('Parto prematuro')
      );
      if (ampHosp) {
        semanasExtra += ampHosp.semanasExtra;
        detalleAmpliaciones.push(
          `Hasta +${ampHosp.semanasExtra} semanas por hospitalizacion neonatal (segun dias reales)`
        );
      }
    }

    if (situacion === 'adopcion') {
      const ampAdopcion = AMPLIACIONES_PERMISO.find((a) =>
        a.motivo.includes('internacional')
      );
      if (ampAdopcion) {
        detalleAmpliaciones.push(
          `Posible +${ampAdopcion.semanasExtra} semanas si adopcion internacional (desplazamiento)`
        );
      }
    }

    const semanasTotal = permiso.semanasTotal + semanasExtra;
    const diasTotal = semanasTotal * 7;

    return {
      baseReguladoraDiaria: brDiaria,
      prestacionDiaria,
      semanasBase: permiso.semanasTotal,
      semanasExtra,
      semanasTotal,
      diasTotal,
      prestacionTotal: prestacionDiaria * diasTotal,
      semanasObligatorias: permiso.semanasObligatorias,
      semanasVoluntarias: permiso.semanasVoluntarias,
      detalleAmpliaciones,
      esContributiva: true,
    };
  }, [mostrarResultados, baseMensual, partoMultiple, numHijos, hospitalizacion, situacion, tipoFamilia]);

  // Requisitos de cotizacion por edad
  const requisitoEdad = useMemo(() => {
    const { cotizacionMinima } = PRESTACION_NACIMIENTO_2025;
    switch (edad) {
      case 'menor21':
        return cotizacionMinima.menores21;
      case '21a25':
        return cotizacionMinima.entre21y25;
      case 'mayor26':
        return cotizacionMinima.mayores26;
    }
  }, [edad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMostrarResultados(true);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">👶</span>
        <h1 className={styles.title}>Estimacion de Prestacion por Nacimiento</h1>
        <p className={styles.subtitle}>
          Calcula una estimacion de la prestacion que cobraras de la Seguridad Social
          durante el permiso por nacimiento y cuidado del menor en Espana.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      {/* Disclaimer */}
      <DisclaimerCard variant="financial" severity="high" collapsible={false}>
        <p>
          Esta herramienta ofrece una estimacion <strong>ORIENTATIVA</strong> de la
          prestacion por nacimiento de la Seguridad Social. La cuantia real depende de
          tu base reguladora individual, que calcula la SS a partir de tu historial de
          cotizacion. No constituye asesoramiento laboral ni de la Seguridad Social.
        </p>
        <p>
          <strong>La prestacion por nacimiento esta exenta de IRPF</strong> (art. 7.h Ley IRPF).
        </p>
      </DisclaimerCard>

      {/* Referencia de datos */}
      <DataReference
        normativa="Permiso por nacimiento 2025"
        fuente={FISCAL_MATERNIDAD_META.fuente}
        verificado={FISCAL_MATERNIDAD_META.verificado}
        urlOficial={FISCAL_MATERNIDAD_META.urlOficial}
      />

      {/* Formulario */}
      <form className={styles.formSection} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>
          <span aria-hidden="true">📋</span> Datos para la estimacion
        </h2>

        {/* Tipo de familia */}
        <div className={styles.formGroup}>
          <span className={styles.formLabel} id="label-tipofamilia">Tipo de familia</span>
          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="label-tipofamilia">
            {([
              { value: 'biparental' as TipoFamilia, label: 'Biparental (2 progenitores)' },
              { value: 'monoparental' as TipoFamilia, label: 'Monoparental (1 progenitor)' },
            ]).map((opcion) => (
              <label
                key={opcion.value}
                className={`${styles.radioOption} ${tipoFamilia === opcion.value ? styles.radioOptionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="tipofamilia"
                  value={opcion.value}
                  checked={tipoFamilia === opcion.value}
                  onChange={() => {
                    setTipoFamilia(opcion.value);
                    setMostrarResultados(false);
                  }}
                />
                {opcion.label}
              </label>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
            Desde el RDL 9/2025 (en vigor desde el 31/07/2025): {tipoFamilia === 'monoparental' ? '32 semanas para el unico progenitor' : '19 semanas por progenitor'}.
          </p>
        </div>

        {/* Edad */}
        <div className={styles.formGroup}>
          <span className={styles.formLabel} id="label-edad">Edad del progenitor</span>
          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="label-edad">
            {([
              { value: 'menor21' as RangoEdad, label: 'Menor de 21 anos' },
              { value: '21a25' as RangoEdad, label: '21 a 25 anos' },
              { value: 'mayor26' as RangoEdad, label: '26 o mas anos' },
            ]).map((opcion) => (
              <label
                key={opcion.value}
                className={`${styles.radioOption} ${edad === opcion.value ? styles.radioOptionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="edad"
                  value={opcion.value}
                  checked={edad === opcion.value}
                  onChange={() => {
                    setEdad(opcion.value);
                    setMostrarResultados(false);
                  }}
                />
                {opcion.label}
              </label>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
            Cotizacion minima requerida: {requisitoEdad.nota}
          </p>
        </div>

        {/* Base de cotizacion */}
        <div className={styles.formGroup}>
          <NumberInput
            value={baseCotizacion}
            onChange={(val) => {
              setBaseCotizacion(val);
              setMostrarResultados(false);
            }}
            label="Base de cotizacion mensual"
            placeholder="Ej: 2.000"
            min={0}
            max={10000}
            suffix="\u20AC"
            helperText="Aparece en tu nomina o en el informe de vida laboral. En 2025: minima 1.381,20 \u20AC, maxima 4.909,50 \u20AC."
            required
          />
        </div>

        {/* Situacion */}
        <div className={styles.formGroup}>
          <span className={styles.formLabel} id="label-situacion">Situacion</span>
          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="label-situacion">
            {([
              { value: 'nacimiento' as Situacion, label: 'Nacimiento' },
              { value: 'adopcion' as Situacion, label: 'Adopcion' },
              { value: 'acogimiento' as Situacion, label: 'Acogimiento' },
            ]).map((opcion) => (
              <label
                key={opcion.value}
                className={`${styles.radioOption} ${situacion === opcion.value ? styles.radioOptionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="situacion"
                  value={opcion.value}
                  checked={situacion === opcion.value}
                  onChange={() => {
                    setSituacion(opcion.value);
                    setMostrarResultados(false);
                  }}
                />
                {opcion.label}
              </label>
            ))}
          </div>
        </div>

        {/* Parto multiple */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={partoMultiple}
              onChange={(e) => {
                setPartoMultiple(e.target.checked);
                setMostrarResultados(false);
              }}
            />
            Parto multiple (gemelos, trillizos...)
          </label>
          {partoMultiple && (
            <div className={styles.subField}>
              <span className={styles.formLabel} id="label-numhijos">Numero de hijos en este parto</span>
              <div className={styles.radioGroup} role="radiogroup" aria-labelledby="label-numhijos">
                <label className={`${styles.radioOption} ${numHijos === 2 ? styles.radioOptionSelected : ''}`}>
                  <input
                    type="radio"
                    name="numhijos"
                    value="2"
                    checked={numHijos === 2}
                    onChange={() => {
                      setNumHijos(2);
                      setMostrarResultados(false);
                    }}
                  />
                  2 (gemelos)
                </label>
                <label className={`${styles.radioOption} ${numHijos === 3 ? styles.radioOptionSelected : ''}`}>
                  <input
                    type="radio"
                    name="numhijos"
                    value="3"
                    checked={numHijos === 3}
                    onChange={() => {
                      setNumHijos(3);
                      setMostrarResultados(false);
                    }}
                  />
                  3 o mas (trillizos+)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Hospitalizacion neonatal */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={hospitalizacion}
              onChange={(e) => {
                setHospitalizacion(e.target.checked);
                setMostrarResultados(false);
              }}
            />
            Hospitalizacion neonatal o parto prematuro
          </label>
        </div>

        <button type="submit" className={styles.submitButton}>
          Estimar prestacion
        </button>
      </form>

      {/* Resultados */}
      {resultado && (
        <section className={styles.resultados} aria-live="polite">
          <h2 className={styles.resultadosTitle}>
            <span aria-hidden="true">📊</span> Resultado de la estimacion
            {!resultado.esContributiva && (
              <span style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                (No contributiva)
              </span>
            )}
          </h2>

          <div className={styles.resultadosGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Base reguladora diaria</span>
              <span className={styles.resultValue}>
                {formatCurrency(resultado.baseReguladoraDiaria)}
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Prestacion diaria (100% BR)</span>
              <span className={styles.resultValue}>
                {formatCurrency(resultado.prestacionDiaria)}
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Duracion total</span>
              <span className={styles.resultValue}>
                {resultado.semanasTotal} semanas ({resultado.diasTotal} dias)
              </span>
            </div>
            <div className={`${styles.resultItem} ${styles.resultTotal}`}>
              <span className={styles.resultLabel}>
                Prestacion total estimada
                <span className={styles.exentaTag}>EXENTA IRPF</span>
              </span>
              <span className={styles.resultValue}>
                {formatCurrency(resultado.prestacionTotal)}
              </span>
            </div>
          </div>

          {/* Desglose */}
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Desglose del permiso
          </h3>
          <div className={styles.breakdownList}>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Semanas obligatorias (ininterrumpidas tras el parto)</span>
              <span className={styles.breakdownValue}>{resultado.semanasObligatorias} semanas</span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Semanas flexibles + cuidado prolongado (hasta los 12 meses / 8 anos del menor)</span>
              <span className={styles.breakdownValue}>{resultado.semanasVoluntarias} semanas</span>
            </div>
            {resultado.detalleAmpliaciones.map((detalle, i) => (
              <div key={i} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{detalle}</span>
                <span className={styles.breakdownValue} style={{ color: 'var(--secondary)' }}>Extra</span>
              </div>
            ))}
            <div className={styles.breakdownItem} style={{ fontWeight: 600 }}>
              <span className={styles.breakdownLabel}>Total</span>
              <span className={styles.breakdownValue}>{resultado.semanasTotal} semanas = {resultado.diasTotal} dias</span>
            </div>
          </div>

          {/* Notas */}
          <div className={styles.resultNote}>
            <strong><span aria-hidden="true">ℹ️</span> Notas importantes:</strong>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', listStyle: 'disc' }}>
              <li>
                La prestacion es el <strong>100% de la base reguladora</strong>, sin topes adicionales
                (el tope es la base maxima de cotizacion: {formatCurrency(PRESTACION_NACIMIENTO_2025.basesReferencia.baseMaximaMensual)}/mes).
              </li>
              <li>
                {tipoFamilia === 'monoparental' ? (
                  <>En familias monoparentales, el progenitor tiene derecho a <strong>{resultado.semanasBase} semanas</strong> (RDL 9/2025, en vigor desde el 31/07/2025).</>
                ) : (
                  <>Cada progenitor tiene derecho, de forma individual e intransferible, a <strong>{resultado.semanasBase} semanas</strong> (RDL 9/2025, en vigor desde el 31/07/2025).</>
                )}
              </li>
              <li>
                Esta prestacion esta <strong>exenta de IRPF</strong> y no se incluye en la declaracion de la renta.
              </li>
              {!resultado.esContributiva && (
                <li>
                  <strong>Prestacion no contributiva:</strong> al no alcanzar la cotizacion minima,
                  se cobra el 100% del IPREM durante 42 dias ({formatCurrency(PRESTACION_NACIMIENTO_2025.noContributiva.cuantiaMensual)}/mes).
                </li>
              )}
            </ul>
          </div>
        </section>
      )}

      {/* Seccion educativa v2.0 */}
      <EducationalSection
        title="Todo sobre la prestacion por nacimiento en Espana"
        subtitle="Guia completa sobre el permiso, la prestacion y como solicitarla"
      >
        {/* Como funciona */}
        <section className={styles.eduSection}>
          <h2>Como funciona la prestacion por nacimiento</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Desde la entrada en vigor del RDL 9/2025 (31 de julio de 2025), cada progenitor tiene
            derecho a <strong>19 semanas de permiso retribuido</strong> por nacimiento, adopcion o
            acogimiento en familias biparentales (<strong>32 semanas</strong> en familias
            monoparentales). La prestacion economica equivale al <strong>100% de la base
            reguladora</strong>, que se calcula dividiendo la base de cotizacion del mes anterior
            al inicio del descanso entre 30. Las 6 primeras semanas son obligatorias e
            ininterrumpidas tras el parto. De las semanas restantes, 11 (22 en familias
            monoparentales) se disfrutan de forma flexible hasta que el menor cumpla 12 meses, y
            2 (4 en monoparentales) son de cuidado prolongado, distribuibles hasta que el menor
            cumpla 8 anos.
          </p>
        </section>

        {/* Tabla comparativa: contributiva vs no contributiva */}
        <section className={styles.eduSection}>
          <h2>Comparativa: prestacion contributiva vs no contributiva</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Contributiva</th>
                  <th>No contributiva</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Requisito</strong></td>
                  <td>Cotizacion minima segun edad</td>
                  <td>Sin cotizacion suficiente</td>
                </tr>
                <tr>
                  <td><strong>Cuantia</strong></td>
                  <td>100% de la base reguladora</td>
                  <td>100% del IPREM ({formatCurrency(PRESTACION_NACIMIENTO_2025.noContributiva.cuantiaMensual)}/mes)</td>
                </tr>
                <tr>
                  <td><strong>Duracion</strong></td>
                  <td>19 semanas/progenitor (133 dias); 32 semanas (224 dias) si familia monoparental</td>
                  <td>42 dias (6 semanas)</td>
                </tr>
                <tr>
                  <td><strong>Cotizacion minima &lt; 21 anos</strong></td>
                  <td>{PRESTACION_NACIMIENTO_2025.cotizacionMinima.menores21.nota}</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Cotizacion minima 21-25 anos</strong></td>
                  <td>{PRESTACION_NACIMIENTO_2025.cotizacionMinima.entre21y25.nota}</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Cotizacion minima 26+ anos</strong></td>
                  <td>{PRESTACION_NACIMIENTO_2025.cotizacionMinima.mayores26.nota}</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Exenta de IRPF</strong></td>
                  <td>Si</td>
                  <td>Si</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduSection}>
          <h2>Escenarios habituales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji}>👩‍💼</span>
                <span className={styles.escenarioTag}>Nacimiento simple</span>
              </div>
              <p>
                Laura, 32 anos, base de cotizacion de {formatCurrency(2200)}/mes. Su base reguladora
                diaria es {formatCurrency(2200 / 30)}. Cobra el 100%: {formatCurrency(2200 / 30)}/dia
                durante 19 semanas (133 dias), su parte individual del permiso biparental.
                Total estimado: {formatCurrency((2200 / 30) * 133)}.
              </p>
              <div className={styles.escenarioResultado}>
                19 semanas al 100% de la BR, exentas de IRPF (32 si familia monoparental)
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji}>👶👶</span>
                <span className={styles.escenarioTag}>Gemelos</span>
              </div>
              <p>
                Carlos, 28 anos, base de {formatCurrency(1800)}/mes. Al ser parto de gemelos,
                obtiene +1 semana adicional (1 hijo extra, RDL 9/2025). Total: 20 semanas (140 dias).
                Prestacion diaria: {formatCurrency(1800 / 30)}. Total: {formatCurrency((1800 / 30) * 140)}.
              </p>
              <div className={styles.escenarioResultado}>
                20 semanas = 19 base + 1 por parto multiple
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji}>✈️</span>
                <span className={styles.escenarioTag}>Adopcion internacional</span>
              </div>
              <p>
                Ana y Pedro adoptan en Colombia. Cada uno tiene 19 semanas de permiso (32 si fuera
                familia monoparental). Ademas, pueden solicitar hasta 2 semanas adicionales por
                desplazamiento al pais de origen. La prestacion se calcula igual: 100% de la base
                reguladora.
              </p>
              <div className={styles.escenarioResultado}>
                Hasta 21 semanas si hay desplazamiento internacional (34 si monoparental)
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji}>🏥</span>
                <span className={styles.escenarioTag}>Prematuro con hospitalizacion</span>
              </div>
              <p>
                Maria, 35 anos. Su hijo nace prematuro y permanece 45 dias hospitalizado.
                A las 19 semanas base (32 si familia monoparental) se anaden hasta 13 semanas mas
                (segun los dias reales de hospitalizacion tras el parto). La prestacion no se
                interrumpe.
              </p>
              <div className={styles.escenarioResultado}>
                Hasta 32 semanas si hay hospitalizacion neonatal prolongada (45 si monoparental)
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre la prestacion por nacimiento</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>Cuando debo solicitar la prestacion?</h4>
              <p>
                Lo ideal es solicitarla en los 15 dias siguientes al inicio del descanso (fecha
                de parto, adopcion o acogimiento). Se puede tramitar online con certificado
                digital en la Sede Electronica de la Seguridad Social, o presencialmente en
                una oficina del INSS con cita previa. No pierdas el plazo: el derecho prescribe
                a los 5 anos, pero cobras desde la fecha de solicitud, no desde el parto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Pueden ambos progenitores cobrar la prestacion a la vez?</h4>
              <p>
                Si. Desde el RDL 9/2025 (en vigor 31-jul-2025), cada progenitor tiene derecho{' '}
                <strong>individual e intransferible</strong> a 19 semanas (32 si la familia es
                monoparental). Las 6 primeras semanas son obligatorias y simultaneas (ambos de
                baja a la vez). De las restantes, 11 semanas (22 en monoparental) son flexibles
                hasta que el menor cumple 12 meses, y 2 semanas (4 en monoparental) son de cuidado
                prolongado, distribuibles hasta que el menor cumple 8 anos. Esto permite que la
                familia tenga cobertura durante mas tiempo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Que pasa si soy autonomo?</h4>
              <p>
                Los trabajadores autonomos tienen exactamente el mismo derecho: 19 semanas (32 en
                familias monoparentales) al 100% de la base reguladora. La diferencia es que la
                base de cotizacion depende
                de la cuota que pagues al RETA. Si cotizas por la base minima, tu prestacion
                sera menor que la de un asalariado con sueldo alto. Se solicita igualmente al INSS.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>La prestacion tributa en la declaracion de la renta?</h4>
              <p>
                <strong>No.</strong> La prestacion por nacimiento y cuidado del menor esta exenta
                de IRPF segun el articulo 7.h de la Ley del IRPF. No se incluye como ingreso en
                la declaracion de la renta. Esto aplica tanto a la prestacion contributiva como a
                la no contributiva.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Puedo fraccionar las semanas flexibles?</h4>
              <p>
                Si. De las semanas no obligatorias, 11 (22 en familias monoparentales) son
                flexibles y pueden disfrutarse de forma continua o en periodos semanales (semanas
                completas), de forma acumulada o interrumpida, hasta que el menor cumpla 12
                meses. Las 2 restantes (4 en monoparental) son de cuidado prolongado y se pueden
                distribuir hasta que el menor cumpla 8 anos. Necesitas acuerdo con la empresa y
                preaviso de 15 dias. Tambien es posible disfrutarlas a jornada completa o parcial
                (minimo 50%).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Que documentacion necesito para solicitarla?</h4>
              <p>
                DNI/NIE del solicitante, libro de familia o certificado del Registro Civil,
                certificado de empresa con las bases de cotizacion de los ultimos meses, y el
                informe de maternidad del SPS (lo emite el medico del servicio publico de salud).
                En adopcion: resolucion judicial o administrativa. Todo se puede presentar online
                con certificado digital.
              </p>
            </div>
          </div>
        </section>

        {/* Guia paso a paso */}
        <section className={styles.guideSection}>
          <h2>Como solicitar la prestacion: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Comunica el nacimiento a tu empresa</strong>
                <p>
                  Informa a tu empresa con la mayor antelacion posible. Para las semanas
                  voluntarias, se requiere un preaviso de 15 dias. La empresa debe emitir
                  el certificado de empresa con las bases de cotizacion.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Reune la documentacion</strong>
                <p>
                  DNI/NIE, libro de familia o inscripcion en el Registro Civil, certificado
                  de empresa, e informe de maternidad (lo solicitas en tu centro de salud).
                  Si es adopcion, la resolucion judicial.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Presenta la solicitud al INSS</strong>
                <p>
                  Puedes hacerlo online en la Sede Electronica de la Seguridad Social
                  (con certificado digital o Cl@ve) o presencialmente en una oficina del
                  INSS con cita previa (cita.seg-social.es). Plazo recomendado: 15 dias
                  desde el parto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Recibe la resolucion del INSS</strong>
                <p>
                  El INSS resuelve en un plazo de 30 dias. Si es favorable, empezaras a
                  cobrar por transferencia bancaria. Si hay incidencias, te comunicaran que
                  documentacion adicional necesitan.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Gestiona las semanas flexibles y de cuidado prolongado</strong>
                <p>
                  Una vez completadas las 6 semanas obligatorias, puedes distribuir las 11
                  semanas flexibles (22 en familias monoparentales) antes de que el menor cumpla
                  12 meses, y las 2 semanas de cuidado prolongado (4 en monoparental) hasta que
                  cumpla 8 anos. Cada periodo requiere solicitud adicional al INSS y preaviso a
                  la empresa.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Consejos */}
        <section className={styles.eduSection}>
          <h2>Consejos practicos sobre el permiso por nacimiento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Solicita cuanto antes</strong>
              <p>
                Aunque el plazo es amplio (5 anos), cobras desde la fecha de solicitud.
                Cada dia de retraso es un dia sin prestacion.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💻</span>
              <strong>Tramita online</strong>
              <p>
                Con certificado digital o Cl@ve es mas rapido. Evitas desplazamientos y
                la resolucion suele ser mas agil.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <strong>Revisa tu vida laboral</strong>
              <p>
                Comprueba que tienes la cotizacion minima para tu edad. Puedes consultar
                tu informe de vida laboral en la web de la SS.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🤝</span>
              <strong>Coordina con tu pareja</strong>
              <p>
                Las 6 semanas obligatorias son simultaneas. Planificad el resto (semanas
                flexibles hasta los 12 meses y de cuidado prolongado hasta los 8 anos) para
                maximizar el tiempo con el bebe.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💰</span>
              <strong>Comprueba la deduccion por maternidad</strong>
              <p>
                Las madres trabajadoras pueden cobrar {formatCurrency(1200)}/ano por hijo
                menor de 3 anos (Modelo 140, pago anticipado mensual).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <strong>Conoce tus derechos</strong>
              <p>
                Tu puesto de trabajo esta protegido durante el permiso. El despido durante
                el permiso se considera nulo.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores comunes al gestionar la prestacion por nacimiento</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir base de cotizacion con salario neto:</strong> la prestacion
              se calcula sobre la base de cotizacion (bruto), no sobre lo que recibes en
              cuenta. Revisa tu nomina: la base de cotizacion figura en la parte inferior.
            </li>
            <li>
              <strong>No solicitar la prestacion a tiempo:</strong> aunque el derecho no
              prescribe en 5 anos, la prestacion se cobra desde la fecha de solicitud,
              no desde el parto. Retrasar la solicitud supone perder dias de cobro.
            </li>
            <li>
              <strong>Creer que el permiso es transferible:</strong> desde el RDL 9/2025
              (31-jul-2025), las 19 semanas (32 en familias monoparentales) son individuales
              e intransferibles. Un progenitor no puede ceder sus semanas al otro.
            </li>
            <li>
              <strong>No pedir el informe de maternidad:</strong> es un documento que
              emite el medico del servicio publico de salud y es obligatorio para la
              solicitud. Pidelo en tu centro de salud lo antes posible.
            </li>
            <li>
              <strong>Olvidar la deduccion por maternidad:</strong> las madres trabajadoras
              tienen derecho a {formatCurrency(100)}/mes por hijo menor de 3 anos (Modelo
              140). Es compatible con la prestacion por nacimiento.
            </li>
            <li>
              <strong>No comunicar a la empresa con antelacion:</strong> las semanas
              voluntarias requieren preaviso de 15 dias. Sin preaviso, la empresa puede
              denegarte el disfrute en las fechas solicitadas.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimacion-prestacion-nacimiento')} />
      <ShareCard appName="estimacion-prestacion-nacimiento" />
      <Footer appName="estimacion-prestacion-nacimiento" />
    </div>
  );
}
