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
import { formatCurrency, parseSpanishNumber } from '@/lib';
import {
  FISCAL_MATERNIDAD_META,
  PRESTACION_NACIMIENTO,
  PERMISO_NACIMIENTO,
  AMPLIACION_POR_ID,
  DEDUCCION_MATERNIDAD_IRPF,
} from '@/data/fiscal';

// ===== TIPOS =====
type RangoEdad = 'menor21' | '21a25' | 'mayor26';
type Situacion = 'nacimiento' | 'adopcion' | 'acogimiento';
type TipoFamilia = 'biparental' | 'monoparental';

/** Una línea del desglose. La etiqueta dice qué es: hasta el 09/11/2026 todas salían como «Extra», también la nota de carencia (hallazgo 4294). */
interface LineaDesglose {
  texto: string;
  etiqueta: 'Ampliación' | 'Nota' | 'Aparte';
}

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
  detalleAmpliaciones: LineaDesglose[];
  esContributiva: boolean;
  /** Subsidio especial por parto múltiple (RD 295/2009, art. 6.2): aparte del total, para uno de los progenitores. */
  subsidioEspecial: number;
}

// Cifras del permiso desde data/fiscal, no escritas a mano en el JSX (hallazgo 4293)
const PERMISO_BI = PERMISO_NACIMIENTO.find((p) => p.tipoFamilia === 'biparental') ?? PERMISO_NACIMIENTO[0];
const PERMISO_MONO = PERMISO_NACIMIENTO.find((p) => p.tipoFamilia === 'monoparental') ?? PERMISO_NACIMIENTO[1];
const SEMANAS_PARTO_MULTIPLE = AMPLIACION_POR_ID['parto-multiple'].semanasExtra;
const SEMANAS_HOSPITAL_MAX = AMPLIACION_POR_ID['hospitalizacion-neonatal'].semanasExtra;

/** «20 semanas», «1 semana», «20 semanas y 3 días»: la hospitalización amplía en DÍAS (ET 48.4). */
function textoDuracion(dias: number): string {
  const semanas = Math.floor(dias / 7);
  const resto = dias % 7;
  const textoSemanas = `${semanas} semana${semanas === 1 ? '' : 's'}`;
  return resto === 0 ? textoSemanas : `${textoSemanas} y ${resto} día${resto === 1 ? '' : 's'}`;
}

// ===== COMPONENTE PRINCIPAL =====
export default function EstimacionPrestacionNacimiento() {
  const [edad, setEdad] = useState<RangoEdad>('mayor26');
  const [diasUltimos7Anios, setDiasUltimos7Anios] = useState<string>('');
  const [diasVidaLaboral, setDiasVidaLaboral] = useState<string>('');
  const [baseCotizacion, setBaseCotizacion] = useState<string>('');
  const [tipoFamilia, setTipoFamilia] = useState<TipoFamilia>('biparental');
  const [situacion, setSituacion] = useState<Situacion>('nacimiento');
  const [partoMultiple, setPartoMultiple] = useState(false);
  const [numHijos, setNumHijos] = useState<number>(2);
  const [hospitalizacion, setHospitalizacion] = useState(false);
  const [diasHospital, setDiasHospital] = useState<string>('');
  const [errorBase, setErrorBase] = useState<string>('');
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Parsear la base de cotización con el parser canónico: el casero (quitar todos los
  // puntos y luego parseFloat) leía «1850.40» como 185.040 (hallazgo 4281).
  const baseMensual = useMemo(() => {
    const num = parseSpanishNumber(baseCotizacion);
    return isNaN(num) ? 0 : num;
  }, [baseCotizacion]);

  // Días de hospitalización del recién nacido (ET 48.4)
  const diasIngreso = useMemo(() => {
    const num = parseSpanishNumber(diasHospital);
    return isNaN(num) || num < 0 ? 0 : Math.floor(num);
  }, [diasHospital]);

  // Días cotizados declarados (art. 178 LGSS)
  const dias7Anios = useMemo(() => {
    const num = parseInt(diasUltimos7Anios.replace(/\./g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [diasUltimos7Anios]);

  const diasTotales = useMemo(() => {
    const num = parseInt(diasVidaLaboral.replace(/\./g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [diasVidaLaboral]);

  // Calcular resultado
  const resultado: ResultadoEstimacion | null = useMemo(() => {
    if (!mostrarResultados || baseMensual <= 0) return null;

    const { basesReferencia, cotizacionMinima, noContributiva } = PRESTACION_NACIMIENTO;

    // La base reguladora es la base REAL del mes anterior, sin suelo: una base inferior a la
    // mínima del régimen general es la de un contrato a tiempo parcial, y subirla a la mínima
    // inflaba la prestación (hallazgo 4282; RD 295/2009, art. 7, solo pone suelo a la
    // formación y a artistas). El techo sí existe: no se cotiza por encima de la máxima.
    const baseAplicable = Math.min(baseMensual, basesReferencia.baseMaximaMensual);
    const brDiaria = baseAplicable / 30;

    // Carencia del art. 178.1 LGSS: la decide la EDAD en la fecha del parto y
    // los DÍAS COTIZADOS, no el importe de la base. Los dos umbrales de cada
    // tramo son alternativos: basta cumplir uno.
    const umbral =
      edad === 'menor21' ? cotizacionMinima.menores21
      : edad === '21a25' ? cotizacionMinima.entre21y25
      : cotizacionMinima.mayores26;

    // Si no se han declarado días, NO se concluye que falte carencia: se asume
    // cumplida y se advierte. Dar por incumplido lo que el usuario no ha dicho
    // sería negarle la prestación por omisión.
    const carenciaDeclarada = diasUltimos7Anios.trim() !== '' || diasVidaLaboral.trim() !== '';

    const esContributiva =
      umbral.diasUltimos7Anios === 0 ||
      !carenciaDeclarada ||
      dias7Anios >= umbral.diasUltimos7Anios ||
      diasTotales >= umbral.diasVidaLaboral;

    if (!esContributiva) {
      // Prestación no contributiva (art. 182 LGSS). Los 42 días del descanso
      // obligatorio se amplían en 14 naturales por monoparentalidad, parto
      // múltiple, familia numerosa o discapacidad >=65 %, y el incremento NO se
      // acumula aunque concurran varios supuestos (art. 182.3 in fine).
      const supuestosNoContributiva: string[] = [];
      if (tipoFamilia === 'monoparental') {
        supuestosNoContributiva.push('monoparentalidad');
      }
      if (partoMultiple && numHijos >= 2) {
        supuestosNoContributiva.push('parto múltiple');
      }

      const diasExtra = supuestosNoContributiva.length > 0 ? noContributiva.incrementoDias : 0;
      const diasTotal = noContributiva.duracion + diasExtra;
      const detalle: LineaDesglose[] = diasExtra > 0
        ? [{
            texto: `+${diasExtra} días naturales por ${supuestosNoContributiva.join(' y ')} (el incremento se aplica una sola vez)`,
            etiqueta: 'Ampliación',
          }]
        : [];

      // Art. 182.2 LGSS y RD 295/2009, art. 16.2: el 100 % del IPREM, salvo que la base
      // reguladora diaria sea inferior, en cuyo caso se cobra esta (hallazgo 4283).
      const cuantiaDiaria = Math.min(noContributiva.cuantiaDiaria, brDiaria);

      return {
        baseReguladoraDiaria: brDiaria,
        prestacionDiaria: cuantiaDiaria,
        semanasBase: noContributiva.duracion / 7,
        semanasExtra: diasExtra / 7,
        // Las semanas salen de los días: 42 + 14 son 8 semanas, no 6 (hallazgo 4284)
        semanasTotal: diasTotal / 7,
        diasTotal,
        prestacionTotal: cuantiaDiaria * diasTotal,
        semanasObligatorias: noContributiva.duracion / 7,
        semanasVoluntarias: 0,
        detalleAmpliaciones: detalle,
        esContributiva: false,
        subsidioEspecial: 0,
      };
    }

    // Prestación contributiva
    const prestacionDiaria = brDiaria; // 100 % de la BR

    const permiso = PERMISO_NACIMIENTO.find((p) => p.tipoFamilia === tipoFamilia) ?? PERMISO_NACIMIENTO[0];
    let semanasExtra = 0;
    const detalleAmpliaciones: LineaDesglose[] = [];

    if (umbral.diasUltimos7Anios > 0 && !carenciaDeclarada) {
      detalleAmpliaciones.push({
        texto: `Calculado asumiendo que cumples la carencia (${umbral.nota}). Rellena los días cotizados para comprobarlo.`,
        etiqueta: 'Nota',
      });
    }

    // Ampliaciones (por identificador: ni el orden ni la redacción del motivo
    // pueden desviar el cálculo en silencio)
    let subsidioEspecial = 0;
    if (partoMultiple && numHijos >= 2) {
      const hijosExtra = numHijos - 1;
      // ET 48.6: dos semanas por cada hijo distinto del primero, «una para cada una de las
      // personas progenitoras»; la única persona progenitora disfruta «las ampliaciones
      // completas», es decir, las dos (hallazgo 4285).
      const factorFamilia = tipoFamilia === 'monoparental' ? 2 : 1;
      const semanas = SEMANAS_PARTO_MULTIPLE * hijosExtra * factorFamilia;
      semanasExtra += semanas;
      detalleAmpliaciones.push({
        texto: `+${semanas} semana${semanas === 1 ? '' : 's'} por parto múltiple (${hijosExtra} hijo${hijosExtra > 1 ? 's' : ''} adicional${hijosExtra > 1 ? 'es' : ''})`,
        etiqueta: 'Ampliación',
      });
      // RD 295/2009, art. 6.2: subsidio especial por cada hijo a partir del segundo, igual al
      // del primero, durante las 6 semanas posteriores al parto; lo cobra UNO de los
      // progenitores (art. 3.9), en un solo pago (art. 12.3). Va aparte del total (hallazgo 4286).
      subsidioEspecial = prestacionDiaria * 42 * hijosExtra;
      detalleAmpliaciones.push({
        texto: `Subsidio especial por parto múltiple: ${formatCurrency(subsidioEspecial)} (6 semanas por cada hijo a partir del segundo, para uno solo de los progenitores, en un pago al terminar esas 6 semanas)`,
        etiqueta: 'Aparte',
      });
    }

    // ET 48.4: la hospitalización de más de siete días amplía el permiso «en tantos días como
    // el nacido se encuentre hospitalizado», con un máximo de trece semanas. Hasta el
    // 09/11/2026 se sumaban siempre las 13 semanas máximas (hallazgo 4287).
    let diasExtraHospital = 0;
    if (hospitalizacion) {
      const maxDias = SEMANAS_HOSPITAL_MAX * 7;
      if (diasIngreso > 7) {
        diasExtraHospital = Math.min(diasIngreso, maxDias);
        detalleAmpliaciones.push({
          texto: `+${diasExtraHospital} días por hospitalización neonatal (${diasIngreso} días de ingreso; máximo ${maxDias})`,
          etiqueta: 'Ampliación',
        });
      } else {
        detalleAmpliaciones.push({
          texto: diasHospital.trim() === ''
            ? `Hospitalización neonatal: escribe los días de ingreso para sumarlos (amplía un día por día de ingreso si pasa de 7, hasta ${maxDias})`
            : 'Hospitalización neonatal de 7 días o menos: no amplía el permiso',
          etiqueta: 'Nota',
        });
      }
    }

    if (situacion === 'adopcion') {
      detalleAmpliaciones.push({
        texto: `Posible +${AMPLIACION_POR_ID['adopcion-internacional'].semanasExtra} semanas si adopción internacional (desplazamiento)`,
        etiqueta: 'Nota',
      });
    }

    const diasTotal = (permiso.semanasTotal + semanasExtra) * 7 + diasExtraHospital;
    const semanasTotal = diasTotal / 7;

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
      subsidioEspecial,
    };
  }, [mostrarResultados, baseMensual, partoMultiple, numHijos, hospitalizacion, diasIngreso, diasHospital, situacion, tipoFamilia, edad, dias7Anios, diasTotales, diasUltimos7Anios, diasVidaLaboral]);

  // Requisitos de cotización por edad
  const requisitoEdad = useMemo(() => {
    const { cotizacionMinima } = PRESTACION_NACIMIENTO;
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
    // El rechazo se dice: con la base vacía, a cero o ilegible no había ni resultado ni aviso
    // (hallazgo 4296).
    const num = parseSpanishNumber(baseCotizacion);
    if (baseCotizacion.trim() === '') {
      setErrorBase('Escribe tu base de cotización mensual para estimar la prestación.');
      setMostrarResultados(false);
      return;
    }
    if (isNaN(num)) {
      setErrorBase('No se ha podido leer la base: escribe solo la cifra, por ejemplo 2.000.');
      setMostrarResultados(false);
      return;
    }
    if (num <= 0) {
      setErrorBase('La base de cotización tiene que ser mayor que 0.');
      setMostrarResultados(false);
      return;
    }
    setErrorBase('');
    setMostrarResultados(true);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">👶</span>
        <h1 className={styles.title}>Estimación de prestación por nacimiento</h1>
        <p className={styles.subtitle}>
          Calcula una estimación de la prestación que cobrarás de la Seguridad Social
          durante el permiso por nacimiento y cuidado del menor en España.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      {/* Disclaimer */}
      <DisclaimerCard variant="financial" severity="critical" collapsible={false}>
        <p>
          Esta herramienta ofrece una estimación <strong>ORIENTATIVA</strong> de la
          prestación por nacimiento de la Seguridad Social. La cuantía real depende de
          tu base reguladora individual, que calcula la SS a partir de tu historial de
          cotización. No constituye asesoramiento laboral ni de la Seguridad Social.
        </p>
        <p>
          <strong>La prestación por nacimiento está exenta de IRPF</strong> (art. 7.h Ley IRPF).
        </p>
      </DisclaimerCard>

      {/* Referencia de datos */}
      <DataReference
        normativa={`Permiso por nacimiento ${FISCAL_MATERNIDAD_META.vigencia}`}
        fuente={FISCAL_MATERNIDAD_META.fuente}
        verificado={FISCAL_MATERNIDAD_META.verificado}
        urlOficial={FISCAL_MATERNIDAD_META.urlOficial}
      />

      {/* Formulario */}
      <form className={styles.formSection} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>
          <span aria-hidden="true">📋</span> Datos para la estimación
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
            Desde el RDL 9/2025 (en vigor desde el 31/07/2025): {tipoFamilia === 'monoparental' ? `${PERMISO_MONO.semanasTotal} semanas para el único progenitor` : `${PERMISO_BI.semanasTotal} semanas por progenitor`}.
          </p>
        </div>

        {/* Edad */}
        <div className={styles.formGroup}>
          <span className={styles.formLabel} id="label-edad">Edad del progenitor</span>
          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="label-edad">
            {([
              { value: 'menor21' as RangoEdad, label: 'Menor de 21 años' },
              { value: '21a25' as RangoEdad, label: '21 a 25 años' },
              { value: 'mayor26' as RangoEdad, label: '26 o más años' },
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
            Cotización mínima requerida: {requisitoEdad.nota}
          </p>
        </div>

        {/* Días cotizados — solo si la edad exige carencia (art. 178.1 LGSS) */}
        {edad !== 'menor21' && (
          <>
            <div className={styles.formGroup}>
              <NumberInput
                value={diasUltimos7Anios}
                onChange={(val) => {
                  setDiasUltimos7Anios(val);
                  setMostrarResultados(false);
                }}
                label="Días cotizados en los últimos 7 años"
                placeholder="Ej: 365"
                min={0}
                max={2555}
                helperText="Los tienes en el informe de vida laboral de la Seguridad Social."
              />
            </div>

            <div className={styles.formGroup}>
              <NumberInput
                value={diasVidaLaboral}
                onChange={(val) => {
                  setDiasVidaLaboral(val);
                  setMostrarResultados(false);
                }}
                label="Días cotizados en toda tu vida laboral"
                placeholder="Ej: 1.500"
                min={0}
                max={20000}
                helperText={`Vale como alternativa: basta cumplir uno de los dos umbrales. ${requisitoEdad.nota}.`}
              />
            </div>
          </>
        )}

        {/* Base de cotización */}
        <div className={styles.formGroup}>
          <NumberInput
            value={baseCotizacion}
            onChange={(val) => {
              setBaseCotizacion(val);
              setErrorBase('');
              setMostrarResultados(false);
            }}
            error={errorBase || undefined}
            label="Base de cotización mensual"
            placeholder="Ej: 2.000"
            min={0}
            max={10000}
            suffix="€"
            helperText={`Aparece en tu nómina o en el informe de vida laboral. En ${FISCAL_MATERNIDAD_META.vigencia}, a jornada completa: mínima ${formatCurrency(PRESTACION_NACIMIENTO.basesReferencia.baseMinimaMensual)}, máxima ${formatCurrency(PRESTACION_NACIMIENTO.basesReferencia.baseMaximaMensual)}. A tiempo parcial puede ser menor.`}
            required
          />
        </div>

        {/* Situación */}
        <div className={styles.formGroup}>
          <span className={styles.formLabel} id="label-situacion">Situación</span>
          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="label-situacion">
            {([
              { value: 'nacimiento' as Situacion, label: 'Nacimiento' },
              { value: 'adopcion' as Situacion, label: 'Adopción' },
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

        {/* Parto múltiple */}
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
            Parto múltiple (gemelos, trillizos...)
          </label>
          {partoMultiple && (
            <div className={styles.subField}>
              <span className={styles.formLabel} id="label-numhijos">Número de hijos en este parto</span>
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
                  3 o más (trillizos+)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Hospitalización neonatal */}
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
            Hospitalización neonatal o parto prematuro
          </label>
          {hospitalizacion && (
            <div className={styles.subField}>
              <NumberInput
                value={diasHospital}
                onChange={(val) => {
                  setDiasHospital(val);
                  setMostrarResultados(false);
                }}
                label="Días de hospitalización tras el parto"
                placeholder="Ej: 10"
                min={0}
                max={365}
                helperText={`Si pasan de 7, el permiso se amplía un día por cada día de ingreso, hasta ${SEMANAS_HOSPITAL_MAX} semanas (ET art. 48.4).`}
              />
            </div>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>
          Estimar prestación
        </button>
      </form>

      {/* La región viva existe ANTES del resultado y se llena después: una que nace llena no
          la anuncian los lectores de pantalla de forma fiable (hallazgo 4297). */}
      <div aria-live="polite">
      {resultado && (
        <section className={styles.resultados}>
          <h2 className={styles.resultadosTitle}>
            <span aria-hidden="true">📊</span> Resultado de la estimación
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
              <span className={styles.resultLabel}>
                {resultado.esContributiva ? 'Prestación diaria (100 % BR)' : 'Subsidio diario (IPREM, o la BR si es menor)'}
              </span>
              <span className={styles.resultValue}>
                {formatCurrency(resultado.prestacionDiaria)}
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Duración total</span>
              <span className={styles.resultValue}>
                {`${textoDuracion(resultado.diasTotal)} (${resultado.diasTotal} días)`}
              </span>
            </div>
            <div className={`${styles.resultItem} ${styles.resultTotal}`}>
              <span className={styles.resultLabel}>
                Prestación total estimada
                <span className={styles.exentaTag}>EXENTA IRPF</span>
              </span>
              <span className={styles.resultValue}>
                {formatCurrency(resultado.prestacionTotal)}
              </span>
            </div>
            {resultado.subsidioEspecial > 0 && (
              <div key="subsidio-especial" className={styles.resultItem}>
                <span className={styles.resultLabel}>Subsidio especial por parto múltiple (aparte, para uno de los progenitores)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.subsidioEspecial)}</span>
              </div>
            )}
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
            {resultado.esContributiva && (
              <div key="voluntarias" className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Semanas flexibles + cuidado prolongado (hasta los 12 meses / 8 años del menor)</span>
                <span className={styles.breakdownValue}>{resultado.semanasVoluntarias} semanas</span>
              </div>
            )}
            {resultado.detalleAmpliaciones.map((detalle, i) => (
              <div key={i} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{detalle.texto}</span>
                <span
                  className={styles.breakdownValue}
                  style={{ color: detalle.etiqueta === 'Nota' ? 'var(--text-muted)' : 'var(--secondary-texto)' }}
                >
                  {detalle.etiqueta}
                </span>
              </div>
            ))}
            <div className={styles.breakdownItem} style={{ fontWeight: 600 }}>
              <span className={styles.breakdownLabel}>Total</span>
              <span className={styles.breakdownValue}>{`${textoDuracion(resultado.diasTotal)} = ${resultado.diasTotal} días`}</span>
            </div>
          </div>

          {/* Notas */}
          <div className={styles.resultNote}>
            <strong><span aria-hidden="true">ℹ️</span> Notas importantes:</strong>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', listStyle: 'disc' }}>
              {resultado.esContributiva && (
                <li key="tope">
                  La prestación es el <strong>100&nbsp;% de la base reguladora</strong>, sin topes adicionales
                  (el tope es la base máxima de cotización: {formatCurrency(PRESTACION_NACIMIENTO.basesReferencia.baseMaximaMensual)}/mes).
                  A tiempo parcial, la Seguridad Social suma las bases de los 12 meses anteriores y las
                  divide entre 365, así que la cifra puede variar un poco.
                </li>
              )}
              {resultado.esContributiva && (
                <li key="semanas">
                  {tipoFamilia === 'monoparental' ? (
                    <>En familias monoparentales, el progenitor tiene derecho a <strong>{resultado.semanasBase} semanas</strong> (RDL 9/2025, en vigor desde el 31/07/2025).</>
                  ) : (
                    <>Cada progenitor tiene derecho, de forma individual e intransferible, a <strong>{resultado.semanasBase} semanas</strong> (RDL 9/2025, en vigor desde el 31/07/2025).</>
                  )}
                </li>
              )}
              {!resultado.esContributiva && (
                <li key="permiso-nc">
                  El permiso sigue siendo de {tipoFamilia === 'monoparental' ? PERMISO_MONO.semanasTotal : PERMISO_BI.semanasTotal} semanas
                  (RDL 9/2025): lo que dura {resultado.diasTotal} días es el subsidio no contributivo, no el permiso.
                </li>
              )}
              <li>
                Esta prestación está <strong>exenta de IRPF</strong> y no se incluye en la declaración de la renta.
              </li>
              {!resultado.esContributiva && (
                <li>
                  <strong>Prestación no contributiva:</strong> al no alcanzar la cotización mínima, se
                  cobra el 100&nbsp;% del IPREM ({formatCurrency(PRESTACION_NACIMIENTO.noContributiva.cuantiaMensual)}/mes)
                  durante {PRESTACION_NACIMIENTO.noContributiva.duracion} días naturales, salvo que
                  tu base reguladora sea inferior, en cuyo caso se cobra esta. Se amplía en{' '}
                  {PRESTACION_NACIMIENTO.noContributiva.incrementoDias} días por familia numerosa,
                  monoparentalidad, parto múltiple o discapacidad del 65&nbsp;% o más, una sola vez aunque
                  coincidan varios supuestos (art. 182 LGSS).
                </li>
              )}
            </ul>
          </div>
        </section>
      )}
      </div>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Todo sobre la prestación por nacimiento en España"
        subtitle="Guía completa sobre el permiso, la prestación y cómo solicitarla"
      >
        {/* Cómo funciona */}
        <section className={styles.eduSection}>
          <h2>Cómo funciona la prestación por nacimiento</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Desde la entrada en vigor del RDL 9/2025 (31 de julio de 2025), cada progenitor tiene
            derecho a <strong>{PERMISO_BI.semanasTotal} semanas de permiso retribuido</strong> por nacimiento, adopción o
            acogimiento en familias biparentales (<strong>{PERMISO_MONO.semanasTotal} semanas</strong> en familias
            monoparentales). La prestación económica equivale al <strong>100&nbsp;% de la base
            reguladora</strong>, que se calcula dividiendo la base de cotización del mes anterior
            al inicio del descanso entre 30 (a tiempo parcial, las bases de los 12 meses anteriores
            entre 365). Las {PERMISO_BI.semanasObligatorias} primeras semanas son obligatorias e
            ininterrumpidas tras el parto. De las semanas restantes, {PERMISO_BI.semanasFlexiblesHasta12Meses} ({PERMISO_MONO.semanasFlexiblesHasta12Meses} en familias
            monoparentales) se disfrutan de forma flexible hasta que el menor cumpla 12 meses, y{' '}
            {PERMISO_BI.semanasCuidadoProlongadoHasta8Anios} ({PERMISO_MONO.semanasCuidadoProlongadoHasta8Anios} en monoparentales) son de cuidado prolongado, distribuibles hasta que el menor
            cumpla 8 años.
          </p>
        </section>

        {/* Tabla comparativa: contributiva vs no contributiva */}
        <section className={styles.eduSection}>
          <h2>Comparativa: prestación contributiva vs no contributiva</h2>
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
                  <td>Cotización mínima según edad</td>
                  <td>Sin cotización suficiente</td>
                </tr>
                <tr>
                  <td><strong>Cuantía</strong></td>
                  <td>100&nbsp;% de la base reguladora</td>
                  <td>
                    100&nbsp;% del IPREM ({formatCurrency(PRESTACION_NACIMIENTO.noContributiva.cuantiaMensual)}/mes),
                    o la base reguladora si fuese inferior
                  </td>
                </tr>
                <tr>
                  <td><strong>Duración</strong></td>
                  <td>
                    {PERMISO_BI.semanasTotal} semanas/progenitor ({PERMISO_BI.semanasTotal * 7} días);{' '}
                    {PERMISO_MONO.semanasTotal} semanas ({PERMISO_MONO.semanasTotal * 7} días) si familia monoparental
                  </td>
                  <td>
                    {PRESTACION_NACIMIENTO.noContributiva.duracion} días ({PRESTACION_NACIMIENTO.noContributiva.duracion / 7} semanas), +
                    {PRESTACION_NACIMIENTO.noContributiva.incrementoDias} en familia numerosa,
                    monoparentalidad, parto múltiple o discapacidad &ge; 65&nbsp;%
                  </td>
                </tr>
                <tr>
                  <td><strong>Cotización mínima &lt; 21 años</strong></td>
                  <td>{PRESTACION_NACIMIENTO.cotizacionMinima.menores21.nota}</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Cotización mínima 21-25 años</strong></td>
                  <td>{PRESTACION_NACIMIENTO.cotizacionMinima.entre21y25.nota}</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Cotización mínima 26+ años</strong></td>
                  <td>{PRESTACION_NACIMIENTO.cotizacionMinima.mayores26.nota}</td>
                  <td>No aplica</td>
                </tr>
                <tr>
                  <td><strong>Exenta de IRPF</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
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
                <span className={styles.escenarioEmoji} aria-hidden="true">👩‍💼</span>
                <span className={styles.escenarioTag}>Nacimiento simple</span>
              </div>
              <p>
                Laura, 32 años, base de cotización de {formatCurrency(2200)}/mes. Su base reguladora
                diaria es {formatCurrency(2200 / 30)}. Cobra el 100&nbsp;%: {formatCurrency(2200 / 30)}/día
                durante {PERMISO_BI.semanasTotal} semanas ({PERMISO_BI.semanasTotal * 7} días), su parte individual del permiso biparental.
                Total estimado: {formatCurrency((2200 / 30) * PERMISO_BI.semanasTotal * 7)}.
              </p>
              <div className={styles.escenarioResultado}>
                {PERMISO_BI.semanasTotal} semanas al 100&nbsp;% de la BR, exentas de IRPF ({PERMISO_MONO.semanasTotal} si familia monoparental)
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">👶👶</span>
                <span className={styles.escenarioTag}>Gemelos</span>
              </div>
              <p>
                Carlos, 28 años, base de {formatCurrency(1800)}/mes. Al ser parto de gemelos,
                obtiene +{SEMANAS_PARTO_MULTIPLE} semana adicional (1 hijo extra, RDL 9/2025; el otro progenitor
                tiene la suya). Total: {PERMISO_BI.semanasTotal + SEMANAS_PARTO_MULTIPLE} semanas ({(PERMISO_BI.semanasTotal + SEMANAS_PARTO_MULTIPLE) * 7} días).
                Prestación diaria: {formatCurrency(1800 / 30)}. Total: {formatCurrency((1800 / 30) * (PERMISO_BI.semanasTotal + SEMANAS_PARTO_MULTIPLE) * 7)}.
                Además, uno de los dos cobra el subsidio especial de 6 semanas por el segundo hijo:{' '}
                {formatCurrency((1800 / 30) * 42)}.
              </p>
              <div className={styles.escenarioResultado}>
                {PERMISO_BI.semanasTotal + SEMANAS_PARTO_MULTIPLE} semanas = {PERMISO_BI.semanasTotal} base + {SEMANAS_PARTO_MULTIPLE} por parto múltiple
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">✈️</span>
                <span className={styles.escenarioTag}>Adopción internacional</span>
              </div>
              <p>
                Ana y Pedro adoptan en Colombia. Cada uno tiene 19 semanas de permiso (32 si fuera
                familia monoparental). Además, pueden solicitar hasta 2 semanas adicionales por
                desplazamiento al país de origen. La prestación se calcula igual: 100&nbsp;% de la base
                reguladora.
              </p>
              <div className={styles.escenarioResultado}>
                Hasta 21 semanas si hay desplazamiento internacional (34 si monoparental)
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">🏥</span>
                <span className={styles.escenarioTag}>Prematuro con hospitalización</span>
              </div>
              <p>
                María, 35 años. Su hijo nace prematuro y permanece 45 días hospitalizado.
                A las {PERMISO_BI.semanasTotal} semanas base ({PERMISO_MONO.semanasTotal} si familia monoparental) se añaden esos 45 días,
                un día por cada día de ingreso, con un máximo de {SEMANAS_HOSPITAL_MAX} semanas (ET art. 48.4). La
                prestación no se interrumpe.
              </p>
              <div className={styles.escenarioResultado}>
                Hasta {PERMISO_BI.semanasTotal + SEMANAS_HOSPITAL_MAX} semanas si hay hospitalización neonatal prolongada ({PERMISO_MONO.semanasTotal + SEMANAS_HOSPITAL_MAX} si monoparental)
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre la prestación por nacimiento</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuándo debo solicitar la prestación?</h4>
              <p>
                Lo ideal es solicitarla en los 15 días siguientes al inicio del descanso (fecha
                de parto, adopción o acogimiento). Se puede tramitar online con certificado
                digital en la Sede Electrónica de la Seguridad Social, o presencialmente en
                una oficina del INSS con cita previa. El subsidio se cobra desde el día en que
                empieza el descanso, aunque lo pidas después. El derecho prescribe a los 5 años,
                pero si la solicitud llega tarde, los efectos económicos solo se retrotraen a los
                3 meses anteriores a la fecha de solicitud (art. 53.1 LGSS).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Pueden ambos progenitores cobrar la prestación a la vez?</h4>
              <p>
                Sí. Desde el RDL 9/2025 (en vigor el 31/07/2025), cada progenitor tiene derecho{' '}
                <strong>individual e intransferible</strong> a {PERMISO_BI.semanasTotal} semanas ({PERMISO_MONO.semanasTotal} si la familia es
                monoparental). Las {PERMISO_BI.semanasObligatorias} primeras semanas son obligatorias y simultáneas (ambos de
                baja a la vez). De las restantes, {PERMISO_BI.semanasFlexiblesHasta12Meses} semanas ({PERMISO_MONO.semanasFlexiblesHasta12Meses} en monoparental) son flexibles
                hasta que el menor cumple 12 meses, y {PERMISO_BI.semanasCuidadoProlongadoHasta8Anios} semanas ({PERMISO_MONO.semanasCuidadoProlongadoHasta8Anios} en monoparental) son de cuidado
                prolongado, distribuibles hasta que el menor cumple 8 años. Esto permite que la
                familia tenga cobertura durante más tiempo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si soy autónomo?</h4>
              <p>
                Los trabajadores autónomos tienen exactamente el mismo derecho: {PERMISO_BI.semanasTotal} semanas ({PERMISO_MONO.semanasTotal} en
                familias monoparentales) al 100&nbsp;% de la base reguladora. La diferencia es que la
                base de cotización depende
                de la cuota que pagues al RETA. Si cotizas por la base mínima, tu prestación
                será menor que la de un asalariado con sueldo alto. Se solicita igualmente al INSS.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La prestación tributa en la declaración de la renta?</h4>
              <p>
                <strong>No.</strong> La prestación por nacimiento y cuidado del menor está exenta
                de IRPF según el artículo 7.h de la Ley del IRPF. No se incluye como ingreso en
                la declaración de la renta. Esto aplica tanto a la prestación contributiva como a
                la no contributiva.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo fraccionar las semanas flexibles?</h4>
              <p>
                Sí. De las semanas no obligatorias, {PERMISO_BI.semanasFlexiblesHasta12Meses} ({PERMISO_MONO.semanasFlexiblesHasta12Meses} en familias monoparentales) son
                flexibles y pueden disfrutarse de forma continua o en periodos semanales (semanas
                completas), de forma acumulada o interrumpida, hasta que el menor cumpla 12
                meses. Las {PERMISO_BI.semanasCuidadoProlongadoHasta8Anios} restantes ({PERMISO_MONO.semanasCuidadoProlongadoHasta8Anios} en monoparental) son de cuidado prolongado y se pueden
                distribuir hasta que el menor cumpla 8 años. Necesitas acuerdo con la empresa y
                preaviso de 15 días. También es posible disfrutarlas a jornada completa o parcial
                (mínimo 50&nbsp;%).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué documentación necesito para solicitarla?</h4>
              <p>
                DNI/NIE del solicitante, libro de familia o certificado del Registro Civil,
                certificado de empresa con las bases de cotización de los últimos meses, y el
                informe de maternidad del SPS (lo emite el médico del servicio público de salud).
                En adopción: resolución judicial o administrativa. Todo se puede presentar online
                con certificado digital.
              </p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo solicitar la prestación: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Comunica el nacimiento a tu empresa</strong>
                <p>
                  Informa a tu empresa con la mayor antelación posible. Para las semanas
                  voluntarias, se requiere un preaviso de 15 días. La empresa debe emitir
                  el certificado de empresa con las bases de cotización.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Reúne la documentación</strong>
                <p>
                  DNI/NIE, libro de familia o inscripción en el Registro Civil, certificado
                  de empresa, e informe de maternidad (lo solicitas en tu centro de salud).
                  Si es adopción, la resolución judicial.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Presenta la solicitud al INSS</strong>
                <p>
                  Puedes hacerlo online en la Sede Electrónica de la Seguridad Social
                  (con certificado digital o Cl@ve) o presencialmente en una oficina del
                  INSS con cita previa (cita.seg-social.es). Plazo recomendado: 15 días
                  desde el parto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Recibe la resolución del INSS</strong>
                <p>
                  El INSS resuelve en un plazo de 30 días. Si es favorable, empezarás a
                  cobrar por transferencia bancaria. Si hay incidencias, te comunicarán qué
                  documentación adicional necesitan.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Gestiona las semanas flexibles y de cuidado prolongado</strong>
                <p>
                  Una vez completadas las {PERMISO_BI.semanasObligatorias} semanas obligatorias, puedes distribuir las{' '}
                  {PERMISO_BI.semanasFlexiblesHasta12Meses} semanas flexibles ({PERMISO_MONO.semanasFlexiblesHasta12Meses} en familias monoparentales) antes de que el menor cumpla
                  12 meses, y las {PERMISO_BI.semanasCuidadoProlongadoHasta8Anios} semanas de cuidado prolongado ({PERMISO_MONO.semanasCuidadoProlongadoHasta8Anios} en monoparental) hasta que
                  cumpla 8 años. Cada periodo requiere solicitud adicional al INSS y preaviso a
                  la empresa.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Consejos */}
        <section className={styles.eduSection}>
          <h2>Consejos prácticos sobre el permiso por nacimiento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>No la dejes pasar de 3 meses</strong>
              <p>
                El subsidio se cobra desde el primer día del descanso aunque lo pidas
                después. Pero si la solicitud se retrasa más de 3 meses, los días anteriores
                a esos 3 meses se pierden (art. 53.1 LGSS).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💻</span>
              <strong>Tramita online</strong>
              <p>
                Con certificado digital o Cl@ve es más rápido. Evitas desplazamientos y
                la resolución suele ser más ágil.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <strong>Revisa tu vida laboral</strong>
              <p>
                Comprueba que tienes la cotización mínima para tu edad. Puedes consultar
                tu informe de vida laboral en la web de la SS.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <strong>Coordina con tu pareja</strong>
              <p>
                Las {PERMISO_BI.semanasObligatorias} semanas obligatorias son simultáneas. Planificad el resto (semanas
                flexibles hasta los 12 meses y de cuidado prolongado hasta los 8 años) para
                maximizar el tiempo con el bebé.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💰</span>
              <strong>Comprueba la deducción por maternidad</strong>
              <p>
                Las madres de alta en la Seguridad Social, o que cobraban prestación o subsidio
                de desempleo al nacer el menor, pueden deducir{' '}
                {formatCurrency(DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo)}/año por hijo
                menor de 3 años, y cobrarla por anticipado
                ({formatCurrency(DEDUCCION_MATERNIDAD_IRPF.importeMensualPorHijo)}/mes, {DEDUCCION_MATERNIDAD_IRPF.anticipado.formulario}).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Conoce tus derechos</strong>
              <p>
                Tu puesto de trabajo está protegido durante el permiso. El despido durante
                el permiso se considera nulo.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al gestionar la prestación por nacimiento</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir base de cotización con salario neto:</strong> la prestación
              se calcula sobre la base de cotización (bruto), no sobre lo que recibes en
              cuenta. Revisa tu nómina: la base de cotización figura en la parte inferior.
            </li>
            <li>
              <strong>Dejar pasar la solicitud más de 3 meses:</strong> el derecho prescribe
              a los 5 años y se cobra desde el inicio del descanso, pero los efectos
              económicos solo se retrotraen a los 3 meses anteriores a la solicitud
              (art. 53.1 LGSS): lo que quede antes se pierde.
            </li>
            <li>
              <strong>Creer que el permiso es transferible:</strong> desde el RDL 9/2025
              (31/07/2025), las {PERMISO_BI.semanasTotal} semanas ({PERMISO_MONO.semanasTotal} en familias monoparentales) son individuales
              e intransferibles. Un progenitor no puede ceder sus semanas al otro.
            </li>
            <li>
              <strong>No pedir el informe de maternidad:</strong> es un documento que
              emite el médico del servicio público de salud y es obligatorio para la
              solicitud. Pídelo en tu centro de salud lo antes posible.
            </li>
            <li>
              <strong>Olvidar la deducción por maternidad:</strong> las madres de alta, o que
              cobraban prestación o subsidio de desempleo al nacer el menor, tienen derecho a{' '}
              {formatCurrency(DEDUCCION_MATERNIDAD_IRPF.importeMensualPorHijo)}/mes por hijo menor de 3 años
              ({DEDUCCION_MATERNIDAD_IRPF.anticipado.formulario}). Es compatible con la prestación por nacimiento.
            </li>
            <li>
              <strong>No comunicar a la empresa con antelación:</strong> las semanas
              voluntarias requieren preaviso de 15 días. Sin preaviso, la empresa puede
              denegarte el disfrute en las fechas solicitadas.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="estimacion-prestacion-nacimiento" />
      <Footer appName="estimacion-prestacion-nacimiento" />
    </div>
  );
}
