'use client';

import { useState, useCallback } from 'react';
import styles from './EstimacionBajaMaternal.module.css';
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
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_MATERNIDAD_META,
  PERMISO_NACIMIENTO_2025,
  AMPLIACIONES_PERMISO,
} from '@/data/fiscal';

// ── Tipos ────────────────────────────────────────────────────────────────────

type TipoFamilia = 'biparental' | 'monoparental';
type Situacion = 'nacimiento' | 'adopcion' | 'acogimiento';

interface ResultadoBaja {
  semanasObligatorias: number;
  semanasVoluntarias: number;
  semanasExtras: number;
  semanasTotal: number;
  detalleExtras: string[];
  fechaInicio: Date | null;
  fechaFinObligatorias: Date | null;
  fechaFinTotal: Date | null;
  fechaLimiteVoluntarias: Date | null;
}

// ── Utilidades de fecha ──────────────────────────────────────────────────────

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatFecha(date: Date): string {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function EstimacionBajaMaternalPage() {
  const [tipoFamilia, setTipoFamilia] = useState<TipoFamilia>('biparental');
  const [situacion, setSituacion] = useState<Situacion>('nacimiento');
  const [partoMultiple, setPartoMultiple] = useState(false);
  const [numBebes, setNumBebes] = useState(2);
  const [discapacidad, setDiscapacidad] = useState(false);
  const [hospitalizacion, setHospitalizacion] = useState(false);
  const [diasHospitalizacion, setDiasHospitalizacion] = useState(7);
  const [fechaParto, setFechaParto] = useState('');
  const [resultado, setResultado] = useState<ResultadoBaja | null>(null);

  const calcular = useCallback(() => {
    // Buscar datos base segun el tipo de familia (RDL 9/2025)
    const datosBase = PERMISO_NACIMIENTO_2025.find(
      (p) => p.tipoFamilia === tipoFamilia
    ) ?? PERMISO_NACIMIENTO_2025[0];

    const semanasObligatorias = datosBase.semanasObligatorias;
    const semanasVoluntarias = datosBase.semanasVoluntarias;
    let semanasExtras = 0;
    const detalleExtras: string[] = [];

    // Parto multiple: +2 semanas por cada hijo adicional
    if (partoMultiple && numBebes > 1) {
      const hijosAdicionales = numBebes - 1;
      const extraMultiple = hijosAdicionales * (AMPLIACIONES_PERMISO[0].semanasExtra);
      semanasExtras += extraMultiple;
      detalleExtras.push(
        `Parto multiple (${numBebes} bebes): +${extraMultiple} semanas`
      );
    }

    // Discapacidad: +2 semanas
    if (discapacidad) {
      semanasExtras += AMPLIACIONES_PERMISO[1].semanasExtra;
      detalleExtras.push(
        `Discapacidad del bebe: +${AMPLIACIONES_PERMISO[1].semanasExtra} semanas`
      );
    }

    // Hospitalizacion neonatal: hasta 13 semanas (1 semana por cada 7 dias)
    if (hospitalizacion && diasHospitalizacion > 0) {
      const semanasHosp = Math.min(
        Math.ceil(diasHospitalizacion / 7),
        AMPLIACIONES_PERMISO[2].semanasExtra
      );
      semanasExtras += semanasHosp;
      detalleExtras.push(
        `Hospitalizacion neonatal (${diasHospitalizacion} dias): +${semanasHosp} semanas`
      );
    }

    // Adopcion/acogimiento internacional: +2 semanas (beneficio familiar, RDL 9/2025)
    if (situacion === 'adopcion' || situacion === 'acogimiento') {
      semanasExtras += AMPLIACIONES_PERMISO[3].semanasExtra;
      detalleExtras.push(
        `${situacion === 'adopcion' ? 'Adopcion' : 'Acogimiento'} (desplazamiento): +${AMPLIACIONES_PERMISO[3].semanasExtra} semanas`
      );
    }

    const semanasTotal = semanasObligatorias + semanasVoluntarias + semanasExtras;

    // Calcular fechas si se proporciono fecha de parto
    let fechaInicio: Date | null = null;
    let fechaFinObligatorias: Date | null = null;
    let fechaFinTotal: Date | null = null;
    let fechaLimiteVoluntarias: Date | null = null;

    if (fechaParto) {
      fechaInicio = new Date(fechaParto);
      fechaFinObligatorias = addWeeks(fechaInicio, semanasObligatorias);
      fechaFinTotal = addWeeks(fechaInicio, semanasTotal);
      fechaLimiteVoluntarias = addMonths(fechaInicio, datosBase.voluntariasHasta);
    }

    setResultado({
      semanasObligatorias,
      semanasVoluntarias,
      semanasExtras,
      semanasTotal,
      detalleExtras,
      fechaInicio,
      fechaFinObligatorias,
      fechaFinTotal,
      fechaLimiteVoluntarias,
    });
  }, [tipoFamilia, situacion, partoMultiple, numBebes, discapacidad, hospitalizacion, diasHospitalizacion, fechaParto]);

  const limpiar = useCallback(() => {
    setTipoFamilia('biparental');
    setSituacion('nacimiento');
    setPartoMultiple(false);
    setNumBebes(2);
    setDiscapacidad(false);
    setHospitalizacion(false);
    setDiasHospitalizacion(7);
    setFechaParto('');
    setResultado(null);
  }, []);

  // Porcentaje visual para la barra del timeline
  const getTimelineWidth = (semanas: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((semanas / total) * 100)}%`;
  };

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📅</span>
        <h1 className={styles.title}>Estimacion de Baja Maternal y Paternal</h1>
        <p className={styles.subtitle}>
          Calcula la duracion de tu permiso por nacimiento y cuidado del menor segun la legislacion espanola vigente
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial" severity="high">
        Esta herramienta muestra una estimacion <strong>ORIENTATIVA</strong> de la duracion
        del permiso por nacimiento segun la legislacion espanola vigente.
        Las condiciones especificas dependen del convenio colectivo, la empresa y la Seguridad Social.
        Consulta con tu empresa y la SS para confirmar tu situacion concreta.
      </DisclaimerCard>

      <DataReference
        normativa="Permiso por nacimiento y cuidado del menor 2025"
        fuente={FISCAL_MATERNIDAD_META.fuente}
        verificado={FISCAL_MATERNIDAD_META.verificado}
        urlOficial={FISCAL_MATERNIDAD_META.urlOficial}
      />

      {/* ── Formulario ───────────────────────────────────────────────────── */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">📋</span> Datos del permiso
          </h2>

          {/* Tipo de familia */}
          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>Tipo de familia</legend>
            <div className={styles.radioGroup}>
              {([
                { value: 'biparental' as const, label: 'Biparental (2 progenitores): 19 semanas por progenitor' },
                { value: 'monoparental' as const, label: 'Monoparental (1 progenitor): 32 semanas' },
              ]).map((opt) => (
                <label key={opt.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipoFamilia"
                    value={opt.value}
                    checked={tipoFamilia === opt.value}
                    onChange={() => setTipoFamilia(opt.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>{opt.label}</span>
                </label>
              ))}
            </div>
            <p className={styles.helpText}>
              Desde el RDL 9/2025 (en vigor 31-jul-2025), el permiso se calcula segun el tipo de
              familia: 19 semanas por progenitor en familias biparentales, o 32 semanas en
              familias monoparentales.
            </p>
          </fieldset>

          {/* Situacion */}
          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>Situacion</legend>
            <div className={styles.radioGroup}>
              {([
                { value: 'nacimiento' as const, label: 'Nacimiento' },
                { value: 'adopcion' as const, label: 'Adopcion' },
                { value: 'acogimiento' as const, label: 'Acogimiento' },
              ]).map((opt) => (
                <label key={opt.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="situacion"
                    value={opt.value}
                    checked={situacion === opt.value}
                    onChange={() => setSituacion(opt.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Parto multiple */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={partoMultiple}
                onChange={(e) => setPartoMultiple(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>
                Parto/adopcion multiple
              </span>
            </label>
            {partoMultiple && (
              <div className={styles.subInput}>
                <label className={styles.label} htmlFor="numBebes">
                  Numero de bebes
                </label>
                <input
                  id="numBebes"
                  type="number"
                  min={2}
                  max={6}
                  value={numBebes}
                  onChange={(e) => setNumBebes(Math.max(2, Math.min(6, Number(e.target.value))))}
                  className={styles.numberInput}
                />
              </div>
            )}
          </div>

          {/* Discapacidad */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={discapacidad}
                onChange={(e) => setDiscapacidad(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>
                El bebe tiene discapacidad reconocida
              </span>
            </label>
          </div>

          {/* Hospitalizacion */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hospitalizacion}
                onChange={(e) => setHospitalizacion(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>
                Hospitalizacion neonatal (parto prematuro u otra causa)
              </span>
            </label>
            {hospitalizacion && (
              <div className={styles.subInput}>
                <label className={styles.label} htmlFor="diasHosp">
                  Dias aproximados de hospitalizacion
                </label>
                <input
                  id="diasHosp"
                  type="number"
                  min={1}
                  max={91}
                  value={diasHospitalizacion}
                  onChange={(e) => setDiasHospitalizacion(Math.max(1, Math.min(91, Number(e.target.value))))}
                  className={styles.numberInput}
                />
                <p className={styles.helpText}>
                  Maximo 13 semanas adicionales (91 dias). Se calcula 1 semana extra por cada 7 dias.
                </p>
              </div>
            )}
          </div>

          {/* Fecha prevista */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="fechaParto">
              Fecha prevista del parto/nacimiento (opcional)
            </label>
            <input
              id="fechaParto"
              type="date"
              value={fechaParto}
              onChange={(e) => setFechaParto(e.target.value)}
              className={styles.dateInput}
            />
            <p className={styles.helpText}>
              Si la indicas, se calcularan las fechas clave de tu permiso.
            </p>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={calcular}
              aria-label="Estimar duracion de la baja"
            >
              Estimar baja
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
            <span aria-hidden="true">📊</span> Tu permiso estimado
          </h2>

          {!resultado ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📅</span>
              <p>Completa los datos y pulsa &quot;Estimar baja&quot; para ver tu permiso</p>
            </div>
          ) : (
            <>
              {/* Resumen numerico */}
              <div className={styles.resultadoFinal}>
                <p className={styles.resultadoLabel}>Duracion total del permiso</p>
                <p className={styles.resultadoValor}>{resultado.semanasTotal}</p>
                <span className={styles.resultadoBadge}>semanas</span>
              </div>

              {/* Tabla desglose */}
              <div className={styles.tableWrapper}>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Semanas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Obligatorias (ininterrumpidas tras el parto)</td>
                      <td>{resultado.semanasObligatorias}</td>
                    </tr>
                    <tr>
                      <td>Flexibles + cuidado prolongado (hasta los 12 meses / 8 anos)</td>
                      <td>{resultado.semanasVoluntarias}</td>
                    </tr>
                    {resultado.semanasExtras > 0 && (
                      <tr>
                        <td>
                          Extras
                          <ul className={styles.extrasList}>
                            {resultado.detalleExtras.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </td>
                        <td>{resultado.semanasExtras}</td>
                      </tr>
                    )}
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{resultado.semanasTotal}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Timeline visual */}
              <h3 className={styles.timelineTitle}>
                <span aria-hidden="true">📊</span> Timeline visual
              </h3>
              <div className={styles.timeline} role="img" aria-label={`Timeline del permiso: ${resultado.semanasObligatorias} semanas obligatorias, ${resultado.semanasVoluntarias} flexibles/cuidado prolongado${resultado.semanasExtras > 0 ? `, ${resultado.semanasExtras} extras` : ''}`}>
                <div className={styles.timelineBar}>
                  <div
                    className={styles.timelineObligatorias}
                    style={{ width: getTimelineWidth(resultado.semanasObligatorias, resultado.semanasTotal) }}
                  >
                    <span className={styles.timelineBarLabel}>
                      {resultado.semanasObligatorias} sem.
                    </span>
                  </div>
                  <div
                    className={styles.timelineVoluntarias}
                    style={{ width: getTimelineWidth(resultado.semanasVoluntarias, resultado.semanasTotal) }}
                  >
                    <span className={styles.timelineBarLabel}>
                      {resultado.semanasVoluntarias} sem.
                    </span>
                  </div>
                  {resultado.semanasExtras > 0 && (
                    <div
                      className={styles.timelineExtras}
                      style={{ width: getTimelineWidth(resultado.semanasExtras, resultado.semanasTotal) }}
                    >
                      <span className={styles.timelineBarLabel}>
                        +{resultado.semanasExtras}
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.timelineLegend}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotOblig} aria-hidden="true" />
                    Obligatorias (sem. 1-6)
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotVol} aria-hidden="true" />
                    Flexibles + cuidado prolongado
                  </span>
                  {resultado.semanasExtras > 0 && (
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotExtra} aria-hidden="true" />
                      Extras
                    </span>
                  )}
                </div>
              </div>

              {/* Fechas clave */}
              {resultado.fechaInicio && (
                <div className={styles.fechasGrid}>
                  <h3 className={styles.fechasTitle}>
                    <span aria-hidden="true">📆</span> Fechas clave
                  </h3>
                  <div className={styles.fechaItem}>
                    <span className={styles.fechaLabel}>Inicio del permiso</span>
                    <span className={styles.fechaValue}>{formatFecha(resultado.fechaInicio)}</span>
                  </div>
                  {resultado.fechaFinObligatorias && (
                    <div className={styles.fechaItem}>
                      <span className={styles.fechaLabel}>Fin semanas obligatorias</span>
                      <span className={styles.fechaValue}>{formatFecha(resultado.fechaFinObligatorias)}</span>
                    </div>
                  )}
                  {resultado.fechaLimiteVoluntarias && (
                    <div className={styles.fechaItem}>
                      <span className={styles.fechaLabel}>Limite para disfrutar las voluntarias</span>
                      <span className={styles.fechaValue}>{formatFecha(resultado.fechaLimiteVoluntarias)}</span>
                    </div>
                  )}
                  {resultado.fechaFinTotal && (
                    <div className={styles.fechaItem}>
                      <span className={styles.fechaLabel}>Fin si se toman todas consecutivas</span>
                      <span className={styles.fechaValue}>{formatFecha(resultado.fechaFinTotal)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Nota sobre voluntarias */}
              <div className={styles.resultNote} role="note">
                <span aria-hidden="true">💡</span>
                <p>
                  De las {resultado.semanasVoluntarias} semanas restantes, la mayoria son flexibles
                  y se pueden tomar en periodos semanales (no necesariamente consecutivos) hasta que
                  el menor cumpla 12 meses; el resto son de cuidado prolongado, distribuibles hasta
                  que cumpla 8 anos. Requieren preaviso de 15 dias a la empresa.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Seccion educativa v2.0 ─────────────────────────────────────── */}
      <EducationalSection
        title="Todo sobre el permiso por nacimiento en Espana"
        subtitle="Guia completa sobre la baja maternal y paternal (RDL 9/2025)"
      >
        {/* Como funciona */}
        <h3>Como funciona el permiso desde el RDL 9/2025?</h3>
        <p>
          Desde el 31 de julio de 2025, el permiso por nacimiento y cuidado del menor es
          <strong> igualitario e intransferible</strong> para ambos progenitores en familias
          biparentales: <strong>19 semanas cada uno</strong>. En familias monoparentales, el
          unico progenitor dispone de <strong>32 semanas</strong>. El RDL 9/2025 amplio el
          modelo igualitario establecido por el RDL 6/2019 (16 semanas desde 2021).
        </p>
        <p>
          Las 6 primeras semanas son obligatorias, ininterrumpidas y simultaneas para ambos
          progenitores (en familias biparentales). De las semanas restantes, 11 (22 en
          familias monoparentales) son flexibles y se pueden distribuir libremente en periodos
          semanales hasta que el bebe cumpla 12 meses, y 2 (4 en monoparental) son de cuidado
          prolongado, distribuibles hasta que el menor cumpla 8 anos.
        </p>

        {/* Tabla comparativa obligatorio vs voluntario */}
        <h3>Obligatorio vs. Flexible/Cuidado prolongado</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Obligatorio (6 sem.)</th>
                <th>Flexible + cuidado prolongado (13/26 sem.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Inicio</td>
                <td>Inmediato tras el parto</td>
                <td>Tras las 6 obligatorias</td>
              </tr>
              <tr>
                <td>Continuidad</td>
                <td>Ininterrumpido</td>
                <td>Puede fraccionarse en periodos semanales</td>
              </tr>
              <tr>
                <td>Plazo maximo</td>
                <td>6 semanas desde el parto</td>
                <td>12 meses (flexibles) / 8 anos (cuidado prolongado)</td>
              </tr>
              <tr>
                <td>Preaviso a la empresa</td>
                <td>No necesario (es automatico)</td>
                <td>Minimo 15 dias de antelacion</td>
              </tr>
              <tr>
                <td>Ambos progenitores a la vez</td>
                <td>Si, simultaneo obligatorio</td>
                <td>Se pueden alternar o simultanear</td>
              </tr>
              <tr>
                <td>Prestacion economica</td>
                <td>100% base reguladora</td>
                <td>100% base reguladora</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4 Escenarios */}
        <h3>Escenarios practicos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👶</span>
              <h4>Nacimiento estandar (1 bebe)</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Familia biparental: 19 semanas por progenitor (32 si es monoparental).</p>
              <p>6 semanas obligatorias simultaneas + 11 flexibles (22 en monoparental) + 2 de cuidado prolongado hasta los 8 anos (4 en monoparental).</p>
              <p><strong>Total familia biparental: hasta 38 semanas de cobertura</strong> si se alternan.</p>
            </div>
            <div className={styles.escenarioTip}>
              Consejo: alternar las semanas voluntarias maximiza el tiempo que al menos un progenitor esta con el bebe.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👶👶</span>
              <h4>Parto gemelar (2 bebes)</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>Cada progenitor (familia biparental): 19 + 1 = 20 semanas.</p>
              <p>Se anade 1 semana por el segundo bebe (RDL 9/2025).</p>
              <p><strong>Total familia: hasta 40 semanas de cobertura</strong> si se alternan.</p>
            </div>
            <div className={styles.escenarioTip}>
              Las semanas extra por multiple son para cada progenitor, no se comparten.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
              <h4>Parto prematuro con hospitalizacion</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>19 semanas base (32 si familia monoparental) + hasta 13 semanas adicionales.</p>
              <p>Se anade 1 semana por cada 7 dias de hospitalizacion neonatal.</p>
              <p><strong>Maximo posible: 32 semanas</strong> (45 en monoparental), para un solo progenitor.</p>
            </div>
            <div className={styles.escenarioTip}>
              La ampliacion por hospitalizacion corresponde a un solo progenitor, a elegir por la familia.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
              <h4>Adopcion internacional</h4>
            </div>
            <div className={styles.escenarioExample}>
              <p>19 semanas base (32 si familia monoparental) + hasta 2 semanas por desplazamiento.</p>
              <p>Las semanas de desplazamiento pueden disfrutarse antes de la resolucion judicial/administrativa.</p>
              <p><strong>Total: hasta 21 semanas</strong> (34 en monoparental).</p>
            </div>
            <div className={styles.escenarioTip}>
              En adopcion nacional: mismas 19/32 semanas, sin semanas de desplazamiento.
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>Puedo fraccionar las semanas flexibles?</h4>
            <p>
              Si. De las semanas no obligatorias, 11 (22 en familias monoparentales) son
              flexibles y se pueden tomar en periodos semanales completos, no necesariamente
              consecutivos, hasta que el menor cumpla 12 meses. Las 2 restantes (4 en
              monoparental) son de cuidado prolongado y se distribuyen hasta que el menor
              cumpla 8 anos. Debes preavisar a tu empresa con al menos 15 dias de antelacion
              para cada periodo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>Que pasa si soy autonomo/a?</h4>
            <p>
              Los autonomos tienen exactamente el mismo derecho: 19 semanas (32 en familias
              monoparentales) con prestacion del 100% de la base reguladora. La solicitud se
              tramita directamente con la Seguridad Social (mutua colaboradora si la tienes).
              Durante la baja no pagas cuota de autonomos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>Pueden ambos progenitores estar de baja a la vez?</h4>
            <p>
              Si. Las 6 primeras semanas son obligatoriamente simultaneas (en familias
              biparentales). Las semanas flexibles y de cuidado prolongado tambien pueden
              ser simultaneas o alternarse. No hay obligacion de turnarse, aunque alternarlas
              maximiza el tiempo total de cuidado.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>Puedo trabajar a tiempo parcial durante el permiso?</h4>
            <p>
              Las semanas voluntarias se pueden disfrutar a jornada completa o a tiempo
              parcial (minimo 50% de la jornada), previo acuerdo con la empresa.
              La prestacion se ajusta proporcionalmente.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>Y si mi bebe nace antes de la fecha prevista?</h4>
            <p>
              El permiso comienza el dia del parto, independientemente de la fecha prevista.
              Si el bebe es prematuro (menos de 37 semanas de gestacion) y requiere
              hospitalizacion, puedes solicitar hasta 13 semanas adicionales por los
              dias de hospitalizacion tras el parto.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>La prestacion esta exenta de IRPF?</h4>
            <p>
              Si. La prestacion por nacimiento y cuidado del menor esta <strong>exenta de IRPF</strong> (articulo
              7.h de la Ley del IRPF). No se incluye en la declaracion de la renta.
              Si tu empresa retiene IRPF por error durante la baja, reclama la devolucion.
            </p>
          </div>
        </div>

        {/* Guia paso a paso */}
        <h3>Como solicitar tu permiso: paso a paso</h3>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber} aria-hidden="true">1</span>
            <h4>Comunica a tu empresa</h4>
            <p>
              Informa a tu empresa de la fecha prevista del parto con la mayor
              antelacion posible. Para las semanas voluntarias, el preaviso minimo legal es de 15 dias.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber} aria-hidden="true">2</span>
            <h4>Solicita la prestacion a la SS</h4>
            <p>
              Tramita la solicitud en la Seguridad Social (sede electronica o cita previa).
              Necesitaras el certificado de empresa, DNI y libro de familia o inscripcion en el Registro Civil.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber} aria-hidden="true">3</span>
            <h4>Disfruta las 6 semanas obligatorias</h4>
            <p>
              Son automaticas e ininterrumpidas desde el dia del parto.
              Ambos progenitores las disfrutan simultaneamente. La empresa no puede negarse.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber} aria-hidden="true">4</span>
            <h4>Planifica las semanas flexibles y de cuidado prolongado</h4>
            <p>
              Decide con tu pareja como distribuir las semanas restantes: las flexibles
              (11 en biparental, 22 en monoparental) hasta los 12 meses del menor, y las de
              cuidado prolongado (2 o 4) hasta que cumpla 8 anos. Podeis alternarlas,
              simultanearlas o combinar jornada parcial. Comunicalo con 15 dias de antelacion
              a la empresa.
            </p>
          </div>
        </div>

        {/* Tips grid */}
        <h3>Consejos utiles</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <h4>Planifica con tu pareja</h4>
            <p>
              Acordar un plan de turnos antes del nacimiento reduce el estres.
              Alternarse maximiza el tiempo de cobertura familiar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💰</span>
            <h4>Revisa tu base de cotizacion</h4>
            <p>
              La prestacion es el 100% de tu base reguladora. Comprueba tu nomina
              para saber cuanto cobraras durante el permiso.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📑</span>
            <h4>Guarda toda la documentacion</h4>
            <p>
              Certificado medico, informe del hospital, libro de familia...
              Tenerlo todo preparado agiliza la tramitacion.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <h4>Consulta tu convenio colectivo</h4>
            <p>
              Algunos convenios mejoran las condiciones legales (dias adicionales,
              complemento salarial, etc.). Revisa el tuyo.
            </p>
          </div>
        </div>

        {/* Warning box v2.0 */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Limitaciones importantes de esta herramienta</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Estimacion general:</strong> la duracion real puede variar segun tu
              convenio colectivo, que puede mejorar las condiciones legales minimas.
            </li>
            <li>
              <strong>Hospitalizacion neonatal:</strong> el calculo de semanas extras es
              aproximado. La SS determina el numero exacto segun los dias reales de ingreso.
            </li>
            <li>
              <strong>Autonomos y regimenes especiales:</strong> las condiciones base son iguales,
              pero la tramitacion y plazos pueden diferir. Consulta con tu mutua.
            </li>
            <li>
              <strong>No sustituye al asesor laboral:</strong> ante situaciones complejas
              (ERE, ERTE, contratos temporales, pluriempleo), consulta con un profesional
              cualificado o con la propia Seguridad Social.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimacion-baja-maternal')} />
      <ShareCard appName="estimacion-baja-maternal" />
      <Footer appName="estimacion-baja-maternal" />
    </div>
  );
}
