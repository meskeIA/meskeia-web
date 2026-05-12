'use client';

import { useState } from 'react';
import styles from './ImpuestosDivorcio.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  EducationalSection,
  RelatedApps,
  ShareCard,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  RegionBadge,
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';

// ─── Helpers IRPF ─────────────────────────────────────────────────────────────

function calcularCuotaIRPF(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let prevHasta = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= tramo.hasta) {
      cuota += (base - prevHasta) * (tramo.tipo / 100);
      break;
    }
    cuota += (tramo.hasta - prevHasta) * (tramo.tipo / 100);
    prevHasta = tramo.hasta;
  }
  return cuota;
}

function calcularBaseSimplificada(ingresosBrutos: number): number {
  const gastos = GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;
  const rnt = Math.max(0, ingresosBrutos - gastos);
  const rd = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  let reduccion: number;
  if (rnt <= rd.limite1) {
    reduccion = rd.reduccion1;
  } else if (rnt >= rd.limite2) {
    reduccion = rd.reduccion2;
  } else {
    reduccion = rd.reduccion1 - rd.factorInterpolacion * (rnt - rd.limite1);
  }
  return Math.max(0, rnt - reduccion);
}

function calcularMinimoHijos(numHijos: number): number {
  if (numHijos <= 0) return 0;
  const m = MINIMOS_IRPF_2025;
  if (numHijos === 1) return m.hijo_1;
  if (numHijos === 2) return m.hijo_1 + m.hijo_2;
  if (numHijos === 3) return m.hijo_1 + m.hijo_2 + m.hijo_3;
  return m.hijo_1 + m.hijo_2 + m.hijo_3 + m.hijo_4_mas * (numHijos - 3);
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Regimen = 'gananciales' | 'separacion' | 'participacion';
type Custodia = 'exclusiva-tengo' | 'exclusiva-otro' | 'compartida';
type PosVivienda = 'me-quedo' | 'salgo' | 'vendemos';
type RolPension = 'pago' | 'cobro';
type PosHipoteca = 'me-quedo' | 'otro-paga';

interface DatosDivorcio {
  regimen: Regimen | null;
  ingresos: string;
  tieneHijos: boolean | null;
  numHijos: number;
  custodia: Custodia | null;
  tieneVivienda: boolean | null;
  posVivienda: PosVivienda | null;
  valorCatastral: string;
  porcPropiedad: string;
  catastroRevisado: boolean | null;
  viviendasignadaHijos: boolean | null;
  tienePensionConyuge: boolean | null;
  rolPension: RolPension | null;
  pensionMensual: string;
  tieneHipotecaAntigua: boolean | null;
  posHipoteca: PosHipoteca | null;
  cuotaHipoteca: string;
}

interface ResultadoPension {
  pensionAnual: number;
  tipo: 'ahorro' | 'coste';
  importe: number;
}

interface ResultadoHijos {
  minimoTotal: number;
  minimoAplicable: number;
  porcentaje: number;
  ahorroEstimado: number;
  custodia: Custodia;
}

interface ResultadoVivienda {
  imputacionAnual: number;
  costeFiscal: number;
  exenta: boolean;
}

interface ResultadoHipoteca {
  deduccionAnual: number;
  tipo: 'mantiene' | 'pierde';
}

interface Resultados {
  pensionConyuge?: ResultadoPension;
  hijos?: ResultadoHijos;
  vivienda?: ResultadoVivienda;
  hipoteca?: ResultadoHipoteca;
  gananciales: boolean;
}

const DATOS_INICIALES: DatosDivorcio = {
  regimen: null, ingresos: '', tieneHijos: null, numHijos: 1, custodia: null,
  tieneVivienda: null, posVivienda: null, valorCatastral: '', porcPropiedad: '50',
  catastroRevisado: null, viviendasignadaHijos: null,
  tienePensionConyuge: null, rolPension: null, pensionMensual: '',
  tieneHipotecaAntigua: null, posHipoteca: null, cuotaHipoteca: '',
};

function calcularResultados(d: DatosDivorcio): Resultados {
  const ingresos = parseSpanishNumber(d.ingresos);
  const base = calcularBaseSimplificada(ingresos);
  const res: Resultados = { gananciales: d.regimen === 'gananciales' };

  if (d.tienePensionConyuge && d.rolPension && d.pensionMensual) {
    const pensionAnual = parseSpanishNumber(d.pensionMensual) * 12;
    if (pensionAnual > 0) {
      if (d.rolPension === 'pago') {
        const ahorro = calcularCuotaIRPF(base) - calcularCuotaIRPF(Math.max(0, base - pensionAnual));
        res.pensionConyuge = { pensionAnual, tipo: 'ahorro', importe: Math.max(0, ahorro) };
      } else {
        const baseCon = calcularBaseSimplificada(ingresos + pensionAnual);
        const coste = calcularCuotaIRPF(baseCon) - calcularCuotaIRPF(base);
        res.pensionConyuge = { pensionAnual, tipo: 'coste', importe: Math.max(0, coste) };
      }
    }
  }

  if (d.tieneHijos && d.custodia && d.numHijos > 0) {
    const minimoTotal = calcularMinimoHijos(d.numHijos);
    const porcentaje = d.custodia === 'exclusiva-otro' ? 0 : d.custodia === 'compartida' ? 50 : 100;
    const minimoAplicable = minimoTotal * porcentaje / 100;
    res.hijos = {
      minimoTotal, minimoAplicable, porcentaje,
      ahorroEstimado: minimoAplicable * 0.19,
      custodia: d.custodia,
    };
  }

  if (d.tieneVivienda && d.posVivienda === 'salgo') {
    const exenta = d.viviendasignadaHijos === true;
    if (exenta) {
      res.vivienda = { imputacionAnual: 0, costeFiscal: 0, exenta: true };
    } else {
      const catastral = parseSpanishNumber(d.valorCatastral);
      const porc = parseSpanishNumber(d.porcPropiedad) / 100;
      if (catastral > 0) {
        const tipoImputacion = d.catastroRevisado ? 0.011 : 0.02;
        const imputacionAnual = catastral * porc * tipoImputacion;
        const costeFiscal = calcularCuotaIRPF(base + imputacionAnual) - calcularCuotaIRPF(base);
        res.vivienda = { imputacionAnual, costeFiscal, exenta: false };
      }
    }
  }

  if (d.tieneHipotecaAntigua) {
    if (d.posHipoteca === 'me-quedo') {
      const cuotaAnual = parseSpanishNumber(d.cuotaHipoteca);
      const deduccionAnual = Math.min(cuotaAnual, 9040) * 0.15;
      res.hipoteca = { deduccionAnual, tipo: 'mantiene' };
    } else {
      res.hipoteca = { deduccionAnual: 0, tipo: 'pierde' };
    }
  }

  return res;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ImpuestosDivorcioPage() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<DatosDivorcio>(DATOS_INICIALES);

  const upd = <K extends keyof DatosDivorcio>(campo: K, valor: DatosDivorcio[K]) =>
    setDatos(prev => ({ ...prev, [campo]: valor }));

  const pasoValido = (): boolean => {
    switch (paso) {
      case 0:
        return datos.regimen !== null && parseSpanishNumber(datos.ingresos) > 0;
      case 1:
        return datos.tieneHijos !== null && (!datos.tieneHijos || datos.custodia !== null);
      case 2: {
        if (datos.tieneVivienda === null) return false;
        if (!datos.tieneVivienda) return true;
        if (datos.posVivienda === null) return false;
        if (datos.posVivienda !== 'salgo') return true;
        if (datos.viviendasignadaHijos === null) return false;
        if (datos.viviendasignadaHijos) return true;
        return (
          parseSpanishNumber(datos.valorCatastral) > 0 &&
          parseSpanishNumber(datos.porcPropiedad) > 0 &&
          datos.catastroRevisado !== null
        );
      }
      case 3:
        return datos.tienePensionConyuge !== null && (
          !datos.tienePensionConyuge ||
          (datos.rolPension !== null && parseSpanishNumber(datos.pensionMensual) > 0)
        );
      case 4:
        return datos.tieneHipotecaAntigua !== null && (
          !datos.tieneHipotecaAntigua ||
          (datos.posHipoteca !== null && (
            datos.posHipoteca !== 'me-quedo' || parseSpanishNumber(datos.cuotaHipoteca) > 0
          ))
        );
      default:
        return true;
    }
  };

  const TITULOS_PASOS = [
    'Régimen económico e ingresos',
    'Hijos menores',
    'Vivienda habitual',
    'Pensión compensatoria',
    'Hipoteca anterior a 2013',
  ];

  const resultados = paso === 5 ? calcularResultados(datos) : null;

  const regimenOpciones: { value: Regimen; label: string; desc: string }[] = [
    { value: 'gananciales', label: 'Sociedad de gananciales', desc: 'Los bienes adquiridos durante el matrimonio son comunes' },
    { value: 'separacion', label: 'Separación de bienes', desc: 'Cada cónyuge gestiona y es propietario de sus propios bienes' },
    { value: 'participacion', label: 'Régimen de participación', desc: 'Separación durante el matrimonio con participación en las ganancias al disolver' },
  ];

  const custodiaOpciones: { value: Custodia; label: string; desc: string }[] = [
    { value: 'exclusiva-tengo', label: 'Custodia exclusiva — yo tengo la custodia', desc: 'Los hijos conviven principalmente conmigo' },
    { value: 'exclusiva-otro', label: 'Custodia exclusiva — el otro progenitor tiene la custodia', desc: 'Yo no tengo la custodia. Habitualmente esto implica régimen de comunicación y estancias con los hijos, y, en función de las rentas, pensión de alimentos a su favor' },
    { value: 'compartida', label: 'Custodia compartida', desc: 'Los hijos conviven con ambos progenitores de forma equitativa' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚖️ Impuestos en el Divorcio</h1>
        <p className={styles.subtitle}>
          Orientación fiscal personalizada para tu proceso de separación o divorcio en España
        </p>
      </header>

      <RegionBadge variant="es-only" />
      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="impuestos-divorcio"
      />
      <DataReference
        normativa="IRPF 2025"
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {paso < 5 ? (
          <div className={styles.wizardContainer}>
            <div className={styles.progressBar} role="progressbar" aria-valuenow={paso + 1} aria-valuemin={1} aria-valuemax={5}>
              <div className={styles.progressFill} style={{ width: `${((paso + 1) / 5) * 100}%` }} />
            </div>
            <p className={styles.progressLabel}>
              Paso {paso + 1} de 5: {TITULOS_PASOS[paso]}
            </p>

            <div className={styles.wizardStep}>

              {paso === 0 && (
                <>
                  <h2 className={styles.stepTitle}>Tu situación económica</h2>
                  <p className={styles.stepDesc}>Esta información se usa para calcular el impacto fiscal de cada elemento del divorcio.</p>

                  <div className={styles.formGroup}>
                    <p className={styles.fieldLabel}>¿Cuál es tu régimen económico matrimonial?</p>
                    {regimenOpciones.map(opt => (
                      <label key={opt.value} className={`${styles.radioOption} ${datos.regimen === opt.value ? styles.radioSelected : ''}`}>
                        <input type="radio" name="regimen" value={opt.value}
                          checked={datos.regimen === opt.value}
                          onChange={() => upd('regimen', opt.value)} />
                        <div>
                          <strong>{opt.label}</strong>
                          <span className={styles.radioDesc}>{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className={styles.formGroup}>
                    <NumberInput
                      label="Tus ingresos brutos anuales (€)"
                      value={datos.ingresos}
                      onChange={val => upd('ingresos', val)}
                      placeholder="35.000"
                    />
                    <p className={styles.helpText}>Incluye salario, pensiones u otras rentas del trabajo. Se usa para estimar el impacto en tu cuota de IRPF.</p>
                  </div>
                </>
              )}

              {paso === 1 && (
                <>
                  <h2 className={styles.stepTitle}>Hijos menores</h2>

                  <div className={styles.formGroup}>
                    <p className={styles.fieldLabel}>¿Hay hijos menores de edad en el divorcio?</p>
                    <div className={styles.boolButtons}>
                      <button className={`${styles.boolBtn} ${datos.tieneHijos === true ? styles.boolSelected : ''}`}
                        onClick={() => upd('tieneHijos', true)}>Sí</button>
                      <button className={`${styles.boolBtn} ${datos.tieneHijos === false ? styles.boolSelected : ''}`}
                        onClick={() => { upd('tieneHijos', false); upd('custodia', null); }}>No</button>
                    </div>
                  </div>

                  {datos.tieneHijos && (
                    <>
                      <div className={styles.formGroup}>
                        <p className={styles.fieldLabel}>Número de hijos</p>
                        <div className={styles.numButtons}>
                          {[1, 2, 3, 4].map(n => (
                            <button key={n}
                              className={`${styles.numBtn} ${datos.numHijos === n ? styles.numSelected : ''}`}
                              onClick={() => upd('numHijos', n)}>
                              {n === 4 ? '4+' : n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <p className={styles.fieldLabel}>¿Cuál será el régimen de custodia?</p>
                        {custodiaOpciones.map(opt => (
                          <label key={opt.value} className={`${styles.radioOption} ${datos.custodia === opt.value ? styles.radioSelected : ''}`}>
                            <input type="radio" name="custodia" value={opt.value}
                              checked={datos.custodia === opt.value}
                              onChange={() => upd('custodia', opt.value)} />
                            <div>
                              <strong>{opt.label}</strong>
                              <span className={styles.radioDesc}>{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {paso === 2 && (
                <>
                  <h2 className={styles.stepTitle}>Vivienda habitual</h2>

                  <div className={styles.formGroup}>
                    <p className={styles.fieldLabel}>¿Tenéis vivienda habitual en propiedad (total o parcialmente)?</p>
                    <div className={styles.boolButtons}>
                      <button className={`${styles.boolBtn} ${datos.tieneVivienda === true ? styles.boolSelected : ''}`}
                        onClick={() => upd('tieneVivienda', true)}>Sí</button>
                      <button className={`${styles.boolBtn} ${datos.tieneVivienda === false ? styles.boolSelected : ''}`}
                        onClick={() => { upd('tieneVivienda', false); upd('posVivienda', null); }}>No</button>
                    </div>
                  </div>

                  {datos.tieneVivienda && (
                    <>
                      <div className={styles.formGroup}>
                        <p className={styles.fieldLabel}>Tras el divorcio, ¿cuál será tu situación con la vivienda?</p>
                        {[
                          { value: 'me-quedo' as PosVivienda, label: 'Me quedo viviendo en ella', desc: 'Mantengo la propiedad y resido en la vivienda' },
                          { value: 'salgo' as PosVivienda, label: 'Me voy pero mantengo parte de la propiedad', desc: 'Salgo de la vivienda pero sigo siendo copropietario/a' },
                          { value: 'vendemos' as PosVivienda, label: 'La vendemos o transmitimos completamente', desc: 'La vivienda sale del patrimonio de ambos durante el proceso' },
                        ].map(opt => (
                          <label key={opt.value} className={`${styles.radioOption} ${datos.posVivienda === opt.value ? styles.radioSelected : ''}`}>
                            <input type="radio" name="posVivienda" value={opt.value}
                              checked={datos.posVivienda === opt.value}
                              onChange={() => upd('posVivienda', opt.value)} />
                            <div>
                              <strong>{opt.label}</strong>
                              <span className={styles.radioDesc}>{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {datos.posVivienda === 'salgo' && (
                        <>
                          <div className={styles.formGroup}>
                            <p className={styles.fieldLabel}>¿La vivienda está asignada judicialmente a los hijos?</p>
                            <div className={styles.boolButtons}>
                              <button className={`${styles.boolBtn} ${datos.viviendasignadaHijos === true ? styles.boolSelected : ''}`}
                                onClick={() => upd('viviendasignadaHijos', true)}>Sí, asignada a los hijos</button>
                              <button className={`${styles.boolBtn} ${datos.viviendasignadaHijos === false ? styles.boolSelected : ''}`}
                                onClick={() => upd('viviendasignadaHijos', false)}>No</button>
                            </div>
                            <p className={styles.helpText}>Si la vivienda está asignada judicialmente a los hijos, el propietario ausente queda exento de imputación de rentas.</p>
                          </div>

                          {datos.viviendasignadaHijos === false && (
                            <>
                              <div className={styles.formGroup}>
                                <NumberInput
                                  label="Valor catastral de la vivienda (€)"
                                  value={datos.valorCatastral}
                                  onChange={val => upd('valorCatastral', val)}
                                  placeholder="80.000"
                                />
                                <p className={styles.helpText}>Lo encuentras en el recibo del IBI.</p>
                              </div>
                              <div className={styles.formGroup}>
                                <NumberInput
                                  label="Tu porcentaje de propiedad (%)"
                                  value={datos.porcPropiedad}
                                  onChange={val => upd('porcPropiedad', val)}
                                  placeholder="50"
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <p className={styles.fieldLabel}>¿El valor catastral fue revisado después de 2014?</p>
                                <div className={styles.boolButtons}>
                                  <button className={`${styles.boolBtn} ${datos.catastroRevisado === true ? styles.boolSelected : ''}`}
                                    onClick={() => upd('catastroRevisado', true)}>Sí (revisado desde 2014)</button>
                                  <button className={`${styles.boolBtn} ${datos.catastroRevisado === false ? styles.boolSelected : ''}`}
                                    onClick={() => upd('catastroRevisado', false)}>No / No sé</button>
                                </div>
                                <p className={styles.helpText}>Si no lo sabes, selecciona &quot;No&quot; — se aplicará el tipo más conservador (2%).</p>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {paso === 3 && (
                <>
                  <h2 className={styles.stepTitle}>Pensión compensatoria</h2>
                  <p className={styles.stepDesc}>
                    La pensión compensatoria es la que se paga entre los cónyuges para compensar el desequilibrio económico que produce el divorcio. Es distinta a la pensión de alimentos para los hijos.
                  </p>

                  <div className={styles.formGroup}>
                    <p className={styles.fieldLabel}>¿Hay pensión compensatoria acordada entre los cónyuges?</p>
                    <div className={styles.boolButtons}>
                      <button className={`${styles.boolBtn} ${datos.tienePensionConyuge === true ? styles.boolSelected : ''}`}
                        onClick={() => upd('tienePensionConyuge', true)}>Sí</button>
                      <button className={`${styles.boolBtn} ${datos.tienePensionConyuge === false ? styles.boolSelected : ''}`}
                        onClick={() => { upd('tienePensionConyuge', false); upd('rolPension', null); }}>No</button>
                    </div>
                  </div>

                  {datos.tienePensionConyuge && (
                    <>
                      <div className={styles.formGroup}>
                        <p className={styles.fieldLabel}>¿Eres quien la paga o quien la cobra?</p>
                        <div className={styles.boolButtons}>
                          <button className={`${styles.boolBtn} ${datos.rolPension === 'pago' ? styles.boolSelected : ''}`}
                            onClick={() => upd('rolPension', 'pago')}>La pago yo</button>
                          <button className={`${styles.boolBtn} ${datos.rolPension === 'cobro' ? styles.boolSelected : ''}`}
                            onClick={() => upd('rolPension', 'cobro')}>La cobro yo</button>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <NumberInput
                          label="Importe mensual de la pensión (€/mes)"
                          value={datos.pensionMensual}
                          onChange={val => upd('pensionMensual', val)}
                          placeholder="500"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {paso === 4 && (
                <>
                  <h2 className={styles.stepTitle}>Hipoteca con deducción transitoria (pre-2013)</h2>
                  <p className={styles.stepDesc}>
                    Si compraste la vivienda antes del 1 de enero de 2013 y aplicabas la deducción por vivienda habitual, el divorcio puede afectar a este beneficio fiscal.
                  </p>

                  <div className={styles.formGroup}>
                    <p className={styles.fieldLabel}>¿Tenéis hipoteca contratada antes del 1 de enero de 2013 con derecho a deducción transitoria?</p>
                    <div className={styles.boolButtons}>
                      <button className={`${styles.boolBtn} ${datos.tieneHipotecaAntigua === true ? styles.boolSelected : ''}`}
                        onClick={() => upd('tieneHipotecaAntigua', true)}>Sí</button>
                      <button className={`${styles.boolBtn} ${datos.tieneHipotecaAntigua === false ? styles.boolSelected : ''}`}
                        onClick={() => { upd('tieneHipotecaAntigua', false); upd('posHipoteca', null); }}>No / No aplica</button>
                    </div>
                  </div>

                  {datos.tieneHipotecaAntigua && (
                    <>
                      <div className={styles.formGroup}>
                        <p className={styles.fieldLabel}>¿Qué ocurre con la hipoteca tras el divorcio?</p>
                        {[
                          { value: 'me-quedo' as PosHipoteca, label: 'Yo me quedo con la hipoteca y vivo en la vivienda', desc: 'Puedes mantener la deducción al 100% de la base (hasta 9.040 €/año)' },
                          { value: 'otro-paga' as PosHipoteca, label: 'El otro cónyuge se queda con la hipoteca', desc: 'Pierdes la deducción de forma inmediata' },
                        ].map(opt => (
                          <label key={opt.value} className={`${styles.radioOption} ${datos.posHipoteca === opt.value ? styles.radioSelected : ''}`}>
                            <input type="radio" name="posHipoteca" value={opt.value}
                              checked={datos.posHipoteca === opt.value}
                              onChange={() => upd('posHipoteca', opt.value)} />
                            <div>
                              <strong>{opt.label}</strong>
                              <span className={styles.radioDesc}>{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {datos.posHipoteca === 'me-quedo' && (
                        <div className={styles.formGroup}>
                          <NumberInput
                            label="Cuota hipotecaria anual que pagas (€/año)"
                            value={datos.cuotaHipoteca}
                            onChange={val => upd('cuotaHipoteca', val)}
                            placeholder="7.200"
                          />
                          <p className={styles.helpText}>Suma de todas las cuotas mensuales del año. La base máxima deducible es 9.040 €/año.</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className={styles.wizardNav}>
              {paso > 0 && (
                <button className={styles.btnSecundario} onClick={() => setPaso(p => p - 1)}>
                  ← Anterior
                </button>
              )}
              {paso < 4 ? (
                <button className={styles.btnPrimary} onClick={() => { if (pasoValido()) setPaso(p => p + 1); }}
                  disabled={!pasoValido()}>
                  Siguiente →
                </button>
              ) : (
                <button className={styles.btnPrimary} onClick={() => { if (pasoValido()) setPaso(5); }}
                  disabled={!pasoValido()}>
                  Ver mi análisis fiscal →
                </button>
              )}
            </div>
          </div>
        ) : (
          resultados && (
            <div className={styles.resultados}>
              <div className={styles.resultHeader}>
                <h2>Tu análisis fiscal personalizado</h2>
                <p>Cifras orientativas basadas en IRPF 2025. Consulta obligatoriamente con un asesor fiscal.</p>
                <button className={styles.btnSecundario} onClick={() => setPaso(0)}>
                  ← Modificar respuestas
                </button>
              </div>

              {/* Pensión compensatoria */}
              {resultados.pensionConyuge && (
                <div className={`${styles.resultCard} ${resultados.pensionConyuge.tipo === 'ahorro' ? styles.cardBenefit : styles.cardCost}`}>
                  <div className={styles.resultCardIcon}>{resultados.pensionConyuge.tipo === 'ahorro' ? '📉' : '📈'}</div>
                  <div className={styles.resultCardBody}>
                    <h3>Pensión compensatoria — IRPF</h3>
                    <p className={styles.resultAmount}>
                      {resultados.pensionConyuge.tipo === 'ahorro' ? 'Ahorro estimado' : 'Coste adicional estimado'}:{' '}
                      <strong>{formatCurrency(resultados.pensionConyuge.importe)}/año</strong>
                    </p>
                    <p className={styles.resultDetail}>
                      Pensión anual: {formatCurrency(resultados.pensionConyuge.pensionAnual)}.{' '}
                      {resultados.pensionConyuge.tipo === 'ahorro'
                        ? 'Como pagador/a, reduces tu base imponible general en ese importe (art. 55 LIRPF). El ahorro depende de tu tipo marginal.'
                        : 'Como perceptor/a, debes declararlo como rendimiento del trabajo. El coste depende de tu tramo de IRPF.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Hijos */}
              {resultados.hijos && (
                <div className={`${styles.resultCard} ${resultados.hijos.porcentaje > 0 ? styles.cardBenefit : styles.cardNeutral}`}>
                  <div className={styles.resultCardIcon}>👨‍👧‍👦</div>
                  <div className={styles.resultCardBody}>
                    <h3>Mínimo por descendientes — IRPF</h3>
                    {resultados.hijos.porcentaje > 0 ? (
                      <>
                        <p className={styles.resultAmount}>
                          Ahorro estimado: <strong>{formatCurrency(resultados.hijos.ahorroEstimado)}/año</strong>
                        </p>
                        <p className={styles.resultDetail}>
                          Mínimo aplicable: {formatCurrency(resultados.hijos.minimoAplicable)}{' '}
                          ({resultados.hijos.porcentaje}% de {formatCurrency(resultados.hijos.minimoTotal)}).{' '}
                          {resultados.hijos.custodia === 'compartida'
                            ? 'Con custodia compartida, cada progenitor aplica el 50% del mínimo por descendientes.'
                            : 'Con custodia exclusiva, tú aplicas el 100% del mínimo.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className={styles.resultAmount}>Mínimo aplicable: <strong>{formatCurrency(0)}</strong></p>
                        <p className={styles.resultDetail}>
                          Al no tener la custodia, no aplicas el mínimo por descendientes. Sin embargo, si pagas pensión de alimentos establecida judicialmente, el art. 75 LIRPF establece un tratamiento especial: la parte de tu base imponible equivalente a esa pensión tributa al tipo mínimo. Consulta con tu asesor.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Vivienda */}
              {resultados.vivienda && (
                <div className={`${styles.resultCard} ${resultados.vivienda.exenta ? styles.cardBenefit : styles.cardCost}`}>
                  <div className={styles.resultCardIcon}>🏠</div>
                  <div className={styles.resultCardBody}>
                    <h3>Vivienda habitual — Imputación de rentas</h3>
                    {resultados.vivienda.exenta ? (
                      <p className={styles.resultDetail}>
                        <strong>Exento.</strong> La vivienda está asignada judicialmente a los hijos, por lo que el propietario ausente queda exento de imputar rentas (art. 85.1 LIRPF).
                      </p>
                    ) : (
                      <>
                        <p className={styles.resultAmount}>
                          Coste fiscal estimado: <strong>{formatCurrency(resultados.vivienda.costeFiscal)}/año</strong>
                        </p>
                        <p className={styles.resultDetail}>
                          Renta imputada: {formatCurrency(resultados.vivienda.imputacionAnual)}/año.{' '}
                          Al salir de la vivienda pero mantener la propiedad, debes declarar esta renta en el IRPF (art. 85 LIRPF). El coste fiscal depende de tu tramo.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Hipoteca */}
              {resultados.hipoteca && (
                <div className={`${styles.resultCard} ${resultados.hipoteca.tipo === 'mantiene' ? styles.cardBenefit : styles.cardCost}`}>
                  <div className={styles.resultCardIcon}>🏦</div>
                  <div className={styles.resultCardBody}>
                    <h3>Deducción hipotecaria transitoria (pre-2013)</h3>
                    {resultados.hipoteca.tipo === 'mantiene' ? (
                      <>
                        <p className={styles.resultAmount}>
                          Deducción anual: <strong>{formatCurrency(resultados.hipoteca.deduccionAnual)}/año</strong>
                        </p>
                        <p className={styles.resultDetail}>
                          Al quedarte con la hipoteca y la vivienda, puedes aplicar el 15% sobre hasta 9.040 €/año de cuota pagada. Si antes la deducción era al 50%, ahora la puedes aplicar al 100% (con el límite de base).
                        </p>
                      </>
                    ) : (
                      <p className={styles.resultDetail}>
                        <strong>Pierdes la deducción.</strong> Al no quedarte con la vivienda ni la hipoteca, pierdes el beneficio fiscal transitorio. El otro cónyuge la podrá aplicar si sigue siendo su vivienda habitual.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Gananciales */}
              {resultados.gananciales && (
                <div className={`${styles.resultCard} ${styles.cardBenefit}`}>
                  <div className={styles.resultCardIcon}>📋</div>
                  <div className={styles.resultCardBody}>
                    <h3>Liquidación de gananciales</h3>
                    <p className={styles.resultDetail}>
                      <strong>No tributa en IRPF ni en ITP.</strong> El reparto de bienes gananciales (vivienda, cuentas bancarias, vehículos, etc.) en la liquidación de la sociedad conyugal no es un hecho imponible. Sin embargo, si un cónyuge recibe bienes de mayor valor que el otro sin compensación económica, podría considerarse donación. Consulta con notario.
                    </p>
                  </div>
                </div>
              )}

              {/* Declaración conjunta */}
              <div className={`${styles.resultCard} ${styles.cardNeutral}`}>
                <div className={styles.resultCardIcon}>📄</div>
                <div className={styles.resultCardBody}>
                  <h3>Declaración conjunta → individual</h3>
                  <p className={styles.resultDetail}>
                    A partir del año en que se produce el divorcio legal, solo puedes presentar declaración individual. En el año de separación de hecho (sin divorcio legal todavía), aún es posible hacer declaración conjunta si ambos cónyuges están de acuerdo. <strong>Consejo: calcula ambas opciones ese año de transición</strong> — en rentas muy distintas puede haber diferencias significativas.
                  </p>
                </div>
              </div>

              {/* Fuera del alcance */}
              <div className={styles.outOfScope}>
                <h3>⚠️ Qué NO cubre esta orientación</h3>
                <ul className={styles.outOfScopeList}>
                  <li><strong>Acciones, fondos de inversión y planes de pensiones:</strong> el reparto en el divorcio no genera plusvalía. La tributación de estos activos ocurrirá en el momento de su venta futura, en un proceso independiente del divorcio.</li>
                  <li><strong>Empresas propias o participaciones societarias:</strong> requieren valoración pericial y asesoramiento especializado.</li>
                  <li><strong>Regímenes forales</strong> (País Vasco y Navarra): tienen normativa fiscal propia que puede diferir significativamente.</li>
                  <li><strong>Divorcios con elemento internacional:</strong> convenios de doble imposición y normativa extranjera aplicable.</li>
                  <li><strong>Cálculo exacto de la cuota:</strong> esta herramienta usa tramos estatales + autonómico medio ponderado. Tu CCAA puede tener variaciones.</li>
                </ul>
                <p className={styles.outOfScopeNote}>
                  <strong>Consulta obligatoria:</strong> Contacta con un asesor fiscal colegiado y un abogado de familia antes de tomar cualquier decisión.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="📚 Todo lo que debes saber sobre fiscalidad del divorcio"
        subtitle="Guía completa para entender y optimizar el impacto fiscal de tu divorcio"
      >
        {/* Tabla comparativa */}
        <section>
          <h2>Comparativa de los principales elementos fiscales</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Elemento</th>
                  <th>¿Tributa?</th>
                  <th>¿Quién lo declara?</th>
                  <th>Normativa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pensión compensatoria</strong></td>
                  <td>✅ Sí (IRPF)</td>
                  <td>Pagador: reduce base. Cobrador: rendimiento del trabajo</td>
                  <td>Art. 55 LIRPF</td>
                </tr>
                <tr>
                  <td><strong>Pensión de alimentos (hijos)</strong></td>
                  <td>⚠️ Parcial</td>
                  <td>Pagador: art. 75 especial. Cobrador: no declara</td>
                  <td>Art. 75 LIRPF</td>
                </tr>
                <tr>
                  <td><strong>Liquidación de gananciales</strong></td>
                  <td>❌ No tributa</td>
                  <td>Ninguno (adjudicación, no transmisión)</td>
                  <td>Art. 33.2 LIRPF</td>
                </tr>
                <tr>
                  <td><strong>Imputación de rentas (vivienda)</strong></td>
                  <td>✅ Sí (IRPF)</td>
                  <td>Propietario que no reside (salvo excepción hijos)</td>
                  <td>Art. 85 LIRPF</td>
                </tr>
                <tr>
                  <td><strong>Deducción hipoteca pre-2013</strong></td>
                  <td>— (deducción)</td>
                  <td>Quien vive en la vivienda y la paga</td>
                  <td>D.T. 18.ª LIRPF</td>
                </tr>
                <tr>
                  <td><strong>Acciones y fondos (reparto)</strong></td>
                  <td>❌ No tributa</td>
                  <td>Nadie (cambio de titularidad sin plusvalía)</td>
                  <td>Art. 33.2 LIRPF</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section>
          <h2>Casos frecuentes</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👫</span>
                <h3>Divorcio sin hijos, sin vivienda</h3>
              </div>
              <p className={styles.escenarioTip}>
                Si no hay hijos ni vivienda propia, el impacto fiscal es mínimo. Solo puede haber impacto por la pensión compensatoria si la hay, o por la liquidación de gananciales (que no tributa). El año de transición hacia declaración individual puede suponer diferencias si los ingresos de ambos son muy distintos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👩‍👧</span>
                <h3>Custodia exclusiva + pensión de alimentos</h3>
              </div>
              <p className={styles.escenarioTip}>
                El progenitor custodio aplica el 100% del mínimo por descendientes. El no custodio pierde ese mínimo pero el art. 75 LIRPF establece que la parte de su base equivalente a la pensión de alimentos tributa a los tipos mínimos, lo que reduce su carga fiscal.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <h3>Sale de la vivienda y mantiene propiedad</h3>
              </div>
              <p className={styles.escenarioTip}>
                Es uno de los errores fiscales más frecuentes: el cónyuge que se va olvida declarar la imputación de rentas. El importe es el 2% (o 1,1%) del valor catastral por su porcentaje de propiedad. Si la vivienda está asignada judicialmente a los hijos, queda exento.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💰</span>
                <h3>Pensión compensatoria alta + IRPF alto</h3>
              </div>
              <p className={styles.escenarioTip}>
                Cuanto mayor es el tipo marginal del pagador, mayor es el ahorro fiscal. Una pensión de 1.000 €/mes con tipo marginal del 37% supone un ahorro de ~4.440 €/año en IRPF. La persona que la cobra, si tiene rentas bajas, puede no pagar apenas impuestos sobre ella. Esto es un efecto colateral del diseño fiscal; el importe debe fijarse según el desequilibrio económico real, no como herramienta de planificación.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿La pensión compensatoria y la pensión de alimentos tributan igual?</h4>
              <p>No. La pensión compensatoria (entre cónyuges) es una reducción de base imponible para el pagador y rendimiento del trabajo para el cobrador. La pensión de alimentos (para los hijos) tiene un tratamiento especial: el pagador puede tributar esa parte a los tipos mínimos (art. 75), y el hijo que la recibe no la declara en IRPF.</p>
              <p className={styles.faqTip}>💡 <strong>Importante:</strong> Confundir ambas pensiones es uno de los errores más frecuentes en la declaración del año del divorcio.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿El reparto de la vivienda en la liquidación de gananciales genera plusvalía?</h4>
              <p>No. La adjudicación de bienes en la liquidación de la sociedad de gananciales no es una transmisión onerosa, por lo que no genera ganancia o pérdida patrimonial en IRPF (art. 33.2 LIRPF). Tampoco tributa en ITP. La futura venta de esos bienes sí tributará desde el precio de adquisición original.</p>
              <p className={styles.faqTip}>💡 <strong>Precaución:</strong> Si un cónyuge recibe bienes de valor significativamente mayor sin compensación en efectivo, el notario puede considerarlo donación parcial.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo presentar declaración conjunta el año del divorcio?</h4>
              <p>Depende del momento. En el año en que se inscribe el divorcio, ya no puedes hacer declaración conjunta por ese ejercicio completo. Si solo hay separación de hecho o separación legal sin divorcio, ambos cónyuges aún podrían optar por la declaración conjunta ese año si están de acuerdo. Es recomendable simular ambas opciones.</p>
              <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Si uno tiene rendimientos muy superiores al otro, la declaración individual suele salir más a cuenta para ambos en conjunto.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué pasa con las acciones y fondos que repartimos?</h4>
              <p>El reparto de acciones y fondos de inversión en el marco del divorcio no genera hecho imponible. Solo cambia la titularidad manteniendo el valor y la fecha de adquisición originales. La plusvalía se generará en el momento en que el nuevo titular venda esos activos, calculada desde el precio de compra original.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Tengo que seguir declarando la imputación de rentas si me fui de casa?</h4>
              <p>Sí, salvo excepciones. Si mantienes la propiedad de la vivienda pero no resides en ella, debes imputar como renta el 2% (o 1,1% si el valor catastral fue revisado desde 2014) del valor catastral en proporción a tu porcentaje de propiedad. La excepción más importante: si la vivienda está asignada judicialmente a los hijos, el propietario ausente queda exento.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo deducir el 100% de la hipoteca si antes era al 50%?</h4>
              <p>Si te quedas con la vivienda y la hipoteca, y la hipoteca es de antes de 2013, sí puedes aplicar la deducción sobre el 100% de lo que pagas tú (con el límite de base de 9.040 €/año). No es que el límite se duplique — es que antes cada uno deducía sobre su 50% de cuota, y ahora tú deduces sobre el 100% que pagas.</p>
              <p className={styles.faqTip}>💡 <strong>Comprueba:</strong> Si tu cuota anual supera los 9.040 €, la deducción se limita a ese importe base (1.356 €/año máximo al 15%).</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section>
          <h2>Cómo gestionar la fiscalidad del divorcio paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica tu régimen económico matrimonial</h4>
                <p>Antes de nada, revisa las capitulaciones matrimoniales (si las hay) o determina el régimen supletorio de tu comunidad autónoma. Esto define si habrá liquidación de gananciales o no, y condiciona el tratamiento fiscal de los bienes comunes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Negocia el convenio regulador con visión fiscal</h4>
                <p>El convenio regulador fija las pensiones, la custodia y el reparto de bienes. Cada cláusula tiene implicaciones fiscales directas. Es el momento de optimizar: por ejemplo, negociar si la pensión compensatoria compensa fiscalmente, o cómo asignar la vivienda para minimizar imputaciones.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Comunica el cambio a Hacienda y actualiza tus datos</h4>
                <p>Actualiza tu estado civil y situación familiar en el borrador de la declaración. Asegúrate de que el año del divorcio reflejes correctamente: cambio de modalidad (conjunta a individual), nuevas reducciones (pensión compensatoria) y mínimos familiares modificados.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Declara correctamente la pensión compensatoria</h4>
                <p>Si la pagas: inclúyela como reducción en la base imponible general (casilla 0465 en Renta Web). Si la cobras: inclúyela como rendimiento del trabajo (casilla 0011 o similar). Guarda la resolución judicial o convenio notarial como justificante.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Revisa la imputación de rentas por la vivienda</h4>
                <p>Si saliste de la vivienda pero mantienes la propiedad, no olvides declarar la imputación de rentas. Busca el valor catastral en el recibo del IBI y aplica el 2% (o 1,1% si fue revisado desde 2014) sobre tu porcentaje de propiedad. Si hay hijos asignados judicialmente a la vivienda, verifica si aplica la exención.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores prácticas */}
        <section>
          <h2>Consejos para gestionar correctamente la fiscalidad del divorcio</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <h4>Considera el efecto fiscal de la pensión compensatoria</h4>
              <p>El pagador reduce su base imponible y quien la cobra tributa por ella como rendimiento del trabajo. Tener en cuenta este efecto al cuantificarla puede ayudar a evitar sorpresas, pero la cuantía debe responder al desequilibrio económico real, no a una optimización tributaria.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏠</span>
              <h4>Evita mantener copropiedad sin resolver</h4>
              <p>Dejar la vivienda en copropiedad indefinida genera imputaciones de rentas al cónyuge ausente y posibles conflictos. Es mejor acordar el uso exclusivo o la venta en el convenio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📄</span>
              <h4>Simula la declaración individual y conjunta ese año</h4>
              <p>En el año de transición, puede haber diferencias significativas entre las modalidades. La herramienta de Renta Web de la AEAT permite simular ambas opciones antes de confirmar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <h4>Guarda toda la documentación del convenio</h4>
              <p>Las pensiones y deducciones del divorcio pueden ser objeto de comprobación años después. Guarda el convenio regulador, las resoluciones judiciales y los justificantes de pago.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>👨‍⚖️</span>
              <h4>Consulta siempre con asesor fiscal y abogado de familia</h4>
              <p>La fiscalidad del divorcio tiene muchas particularidades por CCAA, tipo de régimen matrimonial y circunstancias personales. Un error puede costar miles de euros en sanciones o beneficios no aplicados.</p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores fiscales frecuentes en el divorcio</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>No declarar la imputación de rentas:</strong> Si saliste de la vivienda pero sigues siendo propietario/a, debes imputarla aunque no obtengas ningún ingreso real. Es uno de los errores que más detecta Hacienda.</li>
              <li><strong>Confundir pensión compensatoria y pensión de alimentos:</strong> Tienen tratamientos fiscales completamente distintos. Aplicar el régimen equivocado puede derivar en sanciones.</li>
              <li><strong>No actualizar el borrador de la Renta:</strong> El año del divorcio, el borrador puede estar desactualizado. Revísalo manualmente antes de confirmarlo.</li>
              <li><strong>Olvidar el cambio en la deducción hipotecaria:</strong> Si antes la aplicabais al 50% y ahora uno de los dos la aplica al 100%, hay que ajustar la declaración para no reclamar más de lo que corresponde.</li>
              <li><strong>Asumir que el reparto de bienes no tiene consecuencias futuras:</strong> Aunque la liquidación de gananciales no tributa, los bienes adjudicados mantienen la fecha y precio de adquisición originales. Una futura venta tributará desde ese precio original.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('impuestos-divorcio')} />
      <ShareCard appName="impuestos-divorcio" />
      <Footer appName="impuestos-divorcio" />
    </div>
  );
}
