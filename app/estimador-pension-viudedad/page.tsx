'use client';

import { useState } from 'react';
import styles from './EstimadorPensionViudedad.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import {
  PENSION_VIUDEDAD_2026, RECLAMACION_PREVIA_SS, MINIMOS_VIUDEDAD_2026,
  COMPLEMENTO_MINIMOS_LIMITES_2026, TOPE_COMPLEMENTO_MINIMOS_2026,
} from '@/data/fiscal/pensiones';
import { FISCAL_PENSIONES_META } from '@/data/fiscal';
import { calcularPensionViudedad, type EstadoComplemento } from '@/lib/calculadoras/pensionViudedad';

// Alias corto para legibilidad interna
const PV = PENSION_VIUDEDAD_2026;

/** Espacio duro entre la cifra y el % (Ortografía de la RAE, 2010; decisión del 25/09/2026). */
const pct = (n: number): string => `${n} %`;

/** La pensión se cobra en 14 pagas: el Anexo I del RD 241/2026 da los mínimos en €/año. */
const PAGAS = 14;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SituacionCausante = 'activo' | 'jubilado' | 'no-alta';
type TipoVinculo = 'matrimonio' | 'pareja-hecho';

interface FormData {
  situacionCausante: SituacionCausante;
  baseCotizacionMedia: string;   // Si activo: media últimas 24 bases/mes
  pensionCausante: string;       // Si jubilado: importe mensual de su pensión
  edadBeneficiario: string;
  tieneCargas: boolean;          // Hijos < 26 años o discapacitados a cargo
  ingresosTrabajoMes: string;    // Ingresos propios del trabajo del beneficiario
  tipoVinculo: TipoVinculo;
  aniosCotizadosCausante: string; // Para validar requisito mínimo
}

interface Requisito {
  cumple: boolean | null; // null = no determinable sin más datos
  texto: string;
  nota?: string;
}

interface Resultado {
  baseReguladora: number;
  porcentajeAplicable: number;
  razonPorcentaje: string;
  pensionBruta: number;
  pensionMinima: number;
  complemento: number;
  estadoComplemento: EstadoComplemento;
  pensionFinal: number;
  pensionNetaAprox: number;    // tras el IRPF de la propia pensión (escala general)
  requisitos: Requisito[];
  cumpleRequisitos: boolean;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

/** Número en formato español; lo vacío o ilegible cuenta como 0. */
function leer(texto: string): number {
  const v = parseSpanishNumber(texto);
  return Number.isFinite(v) ? v : 0;
}

function calcularPension(form: FormData): Resultado | null {
  const edad = parseInt(form.edadBeneficiario) || 0;
  const aniosCotizados = leer(form.aniosCotizadosCausante);
  const situacion = form.situacionCausante;

  // El cálculo vive en el motor compartido con el MCP de Delegum (hallazgos 2811, 2812 y 2815):
  // complemento a mínimos con prueba de rentas y tope de la PNC, y neto con el IRPF real.
  const importe = leer(situacion === 'jubilado' ? form.pensionCausante : form.baseCotizacionMedia);
  if (importe <= 0) return null;
  const calculo = calcularPensionViudedad({
    situacionCausante: situacion,
    baseCotizacionMedia: situacion === 'jubilado' ? undefined : importe,
    pensionCausante: situacion === 'jubilado' ? importe : undefined,
    edadBeneficiario: edad,
    tieneCargas: form.tieneCargas,
    ingresosMensualesPropios: leer(form.ingresosTrabajoMes),
  });

  // Requisitos
  // ⚠️ 2026-10-04 (hallazgo 2814): con el causante en activo se exigían 15 años y salía ❌.
  //    El art. 219.1 LGSS solo pide 500 días dentro de los 5 años anteriores si estaba en alta,
  //    y ninguno si la muerte fue por accidente o enfermedad profesional. Con los años totales
  //    no se puede saber si esos 500 días caen en la ventana: queda «por comprobar».
  const requisitoCotizacion: Requisito = situacion === 'jubilado'
    ? {
      cumple: true,
      texto: 'El causante tenía cotizados los períodos mínimos requeridos',
      nota: 'Al ser pensionista, los requisitos de cotización ya estaban cumplidos.',
    }
    : situacion === 'activo'
      ? {
        cumple: null,
        texto: 'El causante tenía cotizados los períodos mínimos requeridos (por comprobar)',
        nota: 'En alta laboral: 500 días cotizados dentro de los 5 años anteriores al fallecimiento (art. 219.1 LGSS). Compruébalo en su vida laboral: con los años totales no se puede saber. Si la muerte se debió a un accidente, sea o no de trabajo, o a una enfermedad profesional, no se exige ningún período.',
      }
      : {
        cumple: aniosCotizados >= 15,
        texto: 'El causante tenía cotizados los períodos mínimos requeridos',
        nota: 'Sin estar en alta: se requieren 15 años cotizados en toda la vida laboral (art. 219.1 LGSS).',
      };

  const requisitos: Requisito[] = [
    requisitoCotizacion,
    {
      cumple: form.tipoVinculo === 'matrimonio' ? true : null,
      texto: form.tipoVinculo === 'matrimonio'
        ? 'Matrimonio: vínculo acreditado'
        : 'Pareja de hecho: inscrita en registro oficial con al menos 2 años de antelación y convivencia acreditada de 5 años',
      nota: form.tipoVinculo === 'pareja-hecho'
        ? 'La pareja de hecho debe estar inscrita en el registro autonómico o municipal (o constituida en documento público) al menos 2 años antes del fallecimiento, y acreditar con el empadronamiento una convivencia estable de al menos 5 años, salvo que haya hijos en común (art. 221.2 LGSS).'
        : undefined,
    },
    {
      // ⚠️ 2026-10-04 (hallazgo 2822): decía «condenado/a por violencia de género», que no es
      //    el impedimento de la ley.
      cumple: true,
      texto: 'No haber sido condenado/a por sentencia firme por un delito doloso de homicidio contra el causante',
      nota: 'Impedimento del art. 231.1 LGSS para cobrar cualquier prestación de muerte y supervivencia.',
    },
  ];

  const cumpleRequisitos = requisitos.every(r => r.cumple !== false);

  return {
    baseReguladora: calculo.baseReguladora,
    porcentajeAplicable: calculo.porcentajeAplicable,
    razonPorcentaje: calculo.razonPorcentaje,
    pensionBruta: calculo.pensionBruta,
    pensionMinima: calculo.pensionMinima,
    complemento: calculo.complemento,
    estadoComplemento: calculo.estadoComplemento,
    pensionFinal: calculo.pensionFinal,
    pensionNetaAprox: calculo.pensionNetaAprox,
    requisitos,
    cumpleRequisitos,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorPensionViudedad() {
  const [form, setForm] = useState<FormData>({
    situacionCausante: 'jubilado',
    baseCotizacionMedia: '2000',
    pensionCausante: '1400',
    edadBeneficiario: '67',
    tieneCargas: false,
    ingresosTrabajoMes: '0',
    tipoVinculo: 'matrimonio',
    aniosCotizadosCausante: '35',
  });
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');

  function update<K extends keyof FormData>(campo: K, valor: FormData[K]) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setResultado(null);
  }

  function calcular() {
    setError('');
    const res = calcularPension(form);
    if (!res) {
      setError('Introduce la base reguladora o la pensión del causante para calcular.');
      return;
    }
    setResultado(res);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">💍</span>
        <h1 className={styles.title}>Estimador Pensión de Viudedad</h1>
        <p className={styles.subtitle}>Seguridad Social · Cuantía orientativa 2026 · Porcentajes 52&nbsp;% / 60&nbsp;% / 70&nbsp;%</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Esta herramienta es <strong>SOLO orientativa</strong>. El cálculo real de la pensión de viudedad lo realiza el INSS con todos los datos de cotización del causante.
          <br /><strong>Solicita siempre la pensión</strong> en cualquier oficina de la Seguridad Social o a través de Import@SS, aunque no estés seguro de tener derecho: el INSS resolverá oficialmente.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa={`Pensión de Viudedad ${FISCAL_PENSIONES_META.vigencia}`}
        fuente={FISCAL_PENSIONES_META.fuente}
        verificado={FISCAL_PENSIONES_META.verificado}
        urlOficial={FISCAL_PENSIONES_META.urlOficial}
        nota={FISCAL_PENSIONES_META.nota}
      />

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Datos del causante y beneficiario</h2>

          {/* Situación del causante */}
          <div className={styles.formGroup}>
            <span className={styles.label} id="grupo-situacion">Situación del causante al fallecer</span>
            <div className={styles.optionGrid} role="group" aria-labelledby="grupo-situacion">
              {([
                { id: 'jubilado', icon: '🏖️', label: 'Jubilado/pensionista' },
                { id: 'activo',   icon: '👷', label: 'Trabajando (en activo)' },
                { id: 'no-alta', icon: '📋', label: 'Sin trabajar / baja laboral' },
              ] as { id: SituacionCausante; icon: string; label: string }[]).map(op => (
                <button
                  key={op.id}
                  type="button"
                  className={`${styles.optionBtn} ${form.situacionCausante === op.id ? styles.optionActivo : ''}`}
                  onClick={() => update('situacionCausante', op.id)}
                  aria-pressed={form.situacionCausante === op.id}
                >
                  <span aria-hidden="true">{op.icon}</span>
                  <span>{op.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input según situación */}
          {form.situacionCausante === 'jubilado' ? (
            <NumberInput
              value={form.pensionCausante}
              onChange={v => update('pensionCausante', v)}
              label="Pensión mensual que cobraba el causante (€/mes)"
              placeholder="1400"
              helperText="Importe bruto mensual de la pensión de jubilación. La base reguladora de viudedad es igual a esta cifra."
            />
          ) : (
            <NumberInput
              value={form.baseCotizacionMedia}
              onChange={v => update('baseCotizacionMedia', v)}
              label="Base de cotización media de los últimos 2 años (€/mes)"
              placeholder="2000"
              helperText="Media mensual de las bases de cotización de los últimos 24 meses. Puedes consultarla en tu informe de vida laboral (Seguridad Social)."
            />
          )}

          {/* Años cotizados */}
          {form.situacionCausante !== 'jubilado' && (
            <NumberInput
              value={form.aniosCotizadosCausante}
              onChange={v => update('aniosCotizadosCausante', v)}
              label="Años cotizados totales del causante"
              placeholder="35"
              helperText="Años totales de cotización a lo largo de toda su vida laboral. Si estaba en activo, es orientativo para la validación de requisitos."
            />
          )}

          {/* Tipo de vínculo */}
          <div className={styles.formGroup}>
            <span className={styles.label} id="grupo-vinculo">Vínculo con el causante</span>
            <div className={styles.switchRow} role="group" aria-labelledby="grupo-vinculo">
              {([
                { id: 'matrimonio',    icon: '💒', label: 'Matrimonio' },
                { id: 'pareja-hecho', icon: '🤝', label: 'Pareja de hecho' },
              ] as { id: TipoVinculo; icon: string; label: string }[]).map(op => (
                <button
                  key={op.id}
                  type="button"
                  className={`${styles.switchBtn} ${form.tipoVinculo === op.id ? styles.switchActivo : ''}`}
                  onClick={() => update('tipoVinculo', op.id)}
                  aria-pressed={form.tipoVinculo === op.id}
                >
                  <span aria-hidden="true">{op.icon}</span> {op.label}
                </button>
              ))}
            </div>
            {form.tipoVinculo === 'pareja-hecho' && (
              <p className={styles.hint}>Requiere inscripción en registro oficial (o documento público) ≥ 2 años antes del fallecimiento y convivencia estable ≥ 5 años, salvo hijos en común.</p>
            )}
          </div>

          {/* Edad beneficiario */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="edad">Edad del beneficiario (viudo/a)</label>
            <select
              id="edad"
              className={styles.select}
              value={form.edadBeneficiario}
              onChange={e => update('edadBeneficiario', e.target.value)}
            >
              <option value="45">Menos de 60 años</option>
              <option value="62">Entre 60 y 64 años</option>
              <option value="67">65 años o más</option>
            </select>
            <p className={styles.hint}>La edad determina el porcentaje aplicable (60&nbsp;% si ≥65) y la cuantía mínima de viudedad.</p>
          </div>

          {/* Cargas familiares */}
          <div className={styles.formGroup}>
            <span className={styles.label} id="grupo-cargas">¿Tiene hijos/as menores de 26 años o con discapacidad a cargo?</span>
            <div className={styles.switchRow} role="group" aria-labelledby="grupo-cargas">
              <button
                type="button"
                className={`${styles.switchBtn} ${form.tieneCargas ? styles.switchActivo : ''}`}
                onClick={() => update('tieneCargas', true)}
                aria-pressed={form.tieneCargas}
              >Sí</button>
              <button
                type="button"
                className={`${styles.switchBtn} ${!form.tieneCargas ? styles.switchActivo : ''}`}
                onClick={() => update('tieneCargas', false)}
                aria-pressed={!form.tieneCargas}
              >No</button>
            </div>
          </div>

          {/* Ingresos propios */}
          <NumberInput
            value={form.ingresosTrabajoMes}
            onChange={v => update('ingresosTrabajoMes', v)}
            label="Ingresos propios del trabajo o actividad (€/mes)"
            placeholder="0"
            helperText="Salario o rendimientos propios al mes, con las pagas extra prorrateadas. Deciden si se aplica el 60 % o el 70 % y si hay complemento a mínimos. Pon 0 si no tienes."
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}><span aria-hidden="true">⚠️</span> {error}</div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular pensión de viudedad">
            Calcular pensión de viudedad
          </button>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estimación orientativa</h2>

          {!resultado ? (
            <p className={styles.placeholder}>Introduce los datos y pulsa el botón para ver la estimación de la pensión de viudedad.</p>
          ) : (
            <div className={styles.resultados}>
              {/* Pensión principal */}
              <div className={styles.pensionHero}>
                <div className={styles.pensionImporte}>{formatCurrency(resultado.pensionFinal)}</div>
                <div className={styles.pensionLabel}>Pensión mensual estimada (bruta)</div>
                <div className={styles.pensionNeta}>≈ {formatCurrency(resultado.pensionNetaAprox)}/mes netos · {formatCurrency(resultado.pensionFinal * PAGAS)}/año brutos</div>
                <div className={styles.pensionNota}>Neto con el IRPF de la pensión sola (escala general y mínimo personal)</div>
              </div>

              {/* Desglose del cálculo */}
              <div className={styles.desgloseCard}>
                <div className={styles.desgloseTitle}><span aria-hidden="true">📋</span> Desglose del cálculo</div>
                <div className={styles.desgloseItem}>
                  <span>Base reguladora</span>
                  <strong>{formatCurrency(resultado.baseReguladora)}/mes</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Porcentaje aplicado</span>
                  <strong className={styles.porcentajeBadge}>{pct(resultado.porcentajeAplicable)}</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Pensión calculada</span>
                  <strong>{formatCurrency(resultado.pensionBruta)}/mes</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Cuantía mínima de viudedad</span>
                  <strong>{formatCurrency(resultado.pensionMinima)}/mes</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Complemento a mínimos</span>
                  <strong>{formatCurrency(resultado.complemento)}/mes</strong>
                </div>
                {resultado.estadoComplemento === 'integro' && (
                  <div className={styles.minimoAplicado}>
                    <span aria-hidden="true">⬆️</span> Se completa hasta la cuantía mínima: tus rentas no pasan de {formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)}/año (art. 59.1 LGSS)
                  </div>
                )}
                {resultado.estadoComplemento === 'diferencial' && (
                  <div className={styles.minimoAplicado}>
                    <span aria-hidden="true">⬆️</span> Complemento reducido: tus rentas pasan de {formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)}/año y solo se reconoce la diferencia hasta ese límite más la cuantía mínima (art. 9.2 RD 241/2026)
                  </div>
                )}
                {resultado.estadoComplemento === 'tope' && (
                  <div className={styles.maximoAplicado}>
                    <span aria-hidden="true">⬇️</span> El complemento no puede superar la pensión no contributiva ({formatCurrency(TOPE_COMPLEMENTO_MINIMOS_2026.sinConyugeMensual)}/mes) en las pensiones causadas desde el 01/01/2013 (art. 59.4 LGSS), así que no se llega a la cuantía mínima
                  </div>
                )}
                {resultado.estadoComplemento === 'rentas' && (
                  <div className={styles.maximoAplicado}>
                    <span aria-hidden="true">⬇️</span> Sin complemento a mínimos: tus rentas superan el límite de {formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)}/año en más de lo que faltaba para llegar a la cuantía mínima (art. 59.1 LGSS)
                  </div>
                )}
                {resultado.pensionBruta >= PV.pensionMaxima && (
                  <div className={styles.maximoAplicado}>
                    <span aria-hidden="true">⬇️</span> Se aplica la pensión máxima SS 2026 ({formatCurrency(PV.pensionMaxima)}/mes)
                  </div>
                )}
              </div>

              {/* Razón del porcentaje */}
              <div className={styles.porcentajeExplicacion}>
                <span aria-hidden="true">ℹ️</span>
                <span>{resultado.razonPorcentaje}</span>
              </div>

              {/* Requisitos */}
              <div className={styles.requisitosCard}>
                <div className={styles.desgloseTitle}><span aria-hidden="true">✅</span> Verificación de requisitos</div>
                {resultado.requisitos.map((req, i) => (
                  <div key={i} className={styles.requisitoItem}>
                    <span className={styles.requisitoIcono} aria-hidden="true">
                      {req.cumple === true ? '✅' : req.cumple === false ? '❌' : '⚠️'}
                    </span>
                    <div className={styles.requisitoTexto}>
                      <span>{req.texto}</span>
                      {req.nota && <p className={styles.requisitoNota}>{req.nota}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Referencia porcentajes */}
              <div className={styles.referenciaGrid}>
                <div className={`${styles.refItem} ${resultado.porcentajeAplicable === 52 ? styles.refActivo : ''}`}>
                  <strong>52&nbsp;%</strong>
                  <span>Caso general</span>
                </div>
                <div className={`${styles.refItem} ${resultado.porcentajeAplicable === 60 ? styles.refActivo : ''}`}>
                  <strong>60&nbsp;%</strong>
                  <span>≥65 años + renta baja</span>
                </div>
                <div className={`${styles.refItem} ${resultado.porcentajeAplicable === 70 ? styles.refActivo : ''}`}>
                  <strong>70&nbsp;%</strong>
                  <span>Cargas + renta muy baja</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo funciona la pensión de viudedad en España?" subtitle="Requisitos, cuantías, porcentajes y compatibilidades">
        <p>La pensión de viudedad es una prestación de la Seguridad Social que se reconoce al cónyuge o pareja de hecho superviviente cuando el causante cumple los requisitos de cotización y vinculación establecidos por la ley (LGSS arts. 219-231).</p>
        <h3>Requisitos principales del causante</h3>
        <ul>
          <li><strong>Fallecimiento por enfermedad común sin estar en alta</strong>: debe tener al menos 15 años cotizados en toda su vida laboral.</li>
          <li><strong>En alta o situación asimilada</strong>: 500 días cotizados en los últimos 5 años inmediatamente anteriores al fallecimiento.</li>
          <li><strong>Si era pensionista</strong>: los requisitos ya estaban cumplidos al reconocerse la pensión de jubilación o incapacidad.</li>
        </ul>
        <h3>Los tres porcentajes</h3>
        <ul>
          <li><strong>52&nbsp;%</strong>: cuantía general, para la mayoría de los casos.</li>
          <li><strong>60&nbsp;%</strong>: si el beneficiario tiene 65 o más años, no recibe otra pensión pública y sus ingresos por trabajo no superan el SMI anual.</li>
          <li><strong>70&nbsp;%</strong>: si tiene cargas familiares (hijos menores de 26 o con discapacidad) y los rendimientos del trabajo son inferiores al 75&nbsp;% del SMI mensual. Desde 2022 este porcentaje se aplica con carácter general si se cumplen los requisitos.</li>
        </ul>
        <h3>¿Cómo se calcula la base reguladora?</h3>
        <p>Si el causante era pensionista: la base reguladora es igual al importe de su pensión. Si fallecía en activo: se toman las bases de cotización de los últimos 24 meses y se divide entre 28 (para obtener el equivalente mensual, incluyendo pagas extras).</p>
        <h3>Parejas de hecho</h3>
        <p>Desde 2007 las parejas de hecho tienen acceso a la pensión de viudedad, con requisitos adicionales: inscripción en el registro autonómico o municipal (o constitución en documento público) con al menos 2 años de antelación al fallecimiento, y convivencia estable y notoria de al menos 5 años, acreditada con el empadronamiento, salvo que haya hijos en común. Desde la Ley 21/2021 ya no se exige ningún requisito de ingresos al superviviente (art. 221 LGSS).</p>
        <h3>Compatibilidades e incompatibilidades</h3>
        <p>La pensión de viudedad es compatible con el trabajo y con la pensión de jubilación propia. Sin embargo, puede reducirse o extinguirse si el beneficiario contrae nuevo matrimonio (salvo excepciones para mayores de 61 años con pensión insuficiente).</p>
        <h3>¿Cómo solicitarla?</h3>
        <p>En cualquier oficina de la Seguridad Social, por teléfono (901 10 65 70) o a través de Import@SS (sede electrónica). Presentar: DNI, certificado de matrimonio/convivencia, libro de familia, certificado de defunción y documentación laboral del causante.</p>

        {/* SECCIÓN 1: Tabla Comparativa */}
        <div className={styles.tableWrapper}>
          <h3>Porcentajes de pensión de viudedad según circunstancias</h3>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Situación del viudo/a</th>
                <th>Porcentaje</th>
                <th>Condición principal</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>General (sin cargas familiares)</td><td>52&nbsp;%</td><td>Cualquier circunstancia</td><td>Vitalicia</td></tr>
              <tr><td>Con hijos menores o discapacitados</td><td>70&nbsp;%</td><td>Mientras existan cargas familiares</td><td>Mientras dure la situación</td></tr>
              <tr><td>Mayor de 65 años sin otras rentas</td><td>60&nbsp;%</td><td>Ingresos &lt; límite legal (anual)</td><td>Vitalicia</td></tr>
              <tr><td>Pareja de hecho reconocida</td><td>52&nbsp;%</td><td>5 años de convivencia (salvo hijos en común) + inscripción 2 años antes</td><td>Vitalicia</td></tr>
              <tr><td>Ex cónyuge divorciado/separado</td><td>Proporcional</td><td>Pensión compensatoria activa</td><td>Según pensión compensatoria</td></tr>
            </tbody>
          </table>
        </div>

        {/* SECCIÓN 2: Casos de Uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👩‍👧‍👦</span>
              <strong>Viuda con hijos menores a cargo</strong>
            </div>
            <p className={styles.escenarioExample}>Carmen, 45 años, pierde a su marido. Tiene 2 hijos de 8 y 11 años. Recibe el 70&nbsp;% de la BR del fallecido, más la pensión de orfandad de cada hijo (20&nbsp;% BR por hijo). Cuando ya no conviva con hijos menores de 26 años (o cesen las cargas), el porcentaje baja al 52&nbsp;%.</p>
            <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> El 70&nbsp;% se mantiene mientras conviva con hijos menores de 26 años o con discapacidad y las rentas de la familia sigan por debajo del límite.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
              <strong>Viudo mayor de 65 años sin otros ingresos</strong>
            </div>
            <p className={styles.escenarioExample}>Manuel, 70 años, queda viudo. No tiene pensión propia. No trabaja y no tiene derecho a otra pensión pública, así que percibirá el 60&nbsp;% de la BR de su esposa fallecida en lugar del 52&nbsp;% general. Si con ese 60&nbsp;% no llega a la cuantía mínima, puede pedir el complemento a mínimos.</p>
            <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> El 60&nbsp;% es para mayores de 65 sin otra pensión pública ni ingresos del trabajo; el 70&nbsp;% exige cargas familiares.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💑</span>
              <strong>Pareja de hecho con inscripción previa</strong>
            </div>
            <p className={styles.escenarioExample}>Laura y Pedro llevan 5 años juntos, inscritos en el registro de parejas de hecho hace 3 años. Al fallecer Pedro, Laura tiene derecho al 52&nbsp;% de su BR: acredita los 5 años de convivencia con el empadronamiento y la inscripción tiene más de 2 años. Sus ingresos no cuentan para el derecho.</p>
            <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> La inscripción en el registro de parejas de hecho debe ser previa al fallecimiento y con al menos 2 años de antelación.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
              <strong>Ex cónyuge divorciado con pensión compensatoria</strong>
            </div>
            <p className={styles.escenarioExample}>Ana y Jordi se divorciaron hace 10 años. Jordi pagaba pensión compensatoria a Ana. Al fallecer Jordi, Ana puede acceder a una parte de la pensión de viudedad proporcional a la pensión compensatoria, compitiendo con la nueva esposa (si la hubiera).</p>
            <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Si hay nuevo cónyuge, la pensión de viudedad se reparte proporcionalmente al tiempo de matrimonio.</p>
          </div>
        </div>

        {/* SECCIÓN 3: FAQ */}
        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary>¿Cuánto tiempo hay para solicitar la pensión de viudedad?</summary>
            <p>No hay plazo de caducidad para solicitarla, pero el reconocimiento de la pensión solo tiene efectos retroactivos de hasta 3 meses desde la fecha de solicitud. Por tanto, cuanto antes se solicite tras el fallecimiento, menos prestación se pierde. Se recomienda solicitar en el plazo de 3 meses.</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> La solicitud puede hacerse telemáticamente en Importass (sede.seg-social.gob.es) o presencialmente en el INSS.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Es compatible la pensión de viudedad con trabajar?</summary>
            <p>Sí, la pensión de viudedad es compatible con el trabajo por cuenta propia o ajena. También es compatible con otras pensiones (jubilación, incapacidad permanente). Sin embargo, si se supera el límite de ingresos establecido, puede afectar al porcentaje (especialmente para el acceso al 70&nbsp;%).</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> Tus ingresos no quitan el derecho a la pensión, pero deciden el porcentaje (52&nbsp;%, 60&nbsp;% o 70&nbsp;%) y si hay complemento a mínimos: con más de {formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)} al año de rentas, el complemento se reduce o desaparece.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Qué ocurre si me vuelvo a casar?</summary>
            <p>Si el beneficiario contrae nuevo matrimonio, pierde el derecho a la pensión de viudedad. No obstante, puede recuperarla si el nuevo matrimonio se disuelve (fallecimiento, divorcio, separación), siempre que se cumplan los requisitos. En viudas mayores de 61 años, la norma es más flexible.</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> Desde 2010, existen excepciones: viudas/viudos mayores de 61 años o con pensión de viudedad superior al 75&nbsp;% de sus ingresos pueden mantenerla tras nuevo matrimonio.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Cuáles son los requisitos de cotización del fallecido?</summary>
            <p>Depende de la situación: si el fallecido estaba dado de alta o en situación asimilada, debe tener 500 días cotizados en los últimos 5 años. Si no estaba en alta, necesita al menos 15 años cotizados a lo largo de su vida laboral. Si fallece por accidente laboral o enfermedad profesional, no se exige período mínimo.</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> Los fallecimientos por accidente de trabajo o enfermedad profesional generan derecho sin requisito de cotización previa.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Tienen derecho las parejas del mismo sexo?</summary>
            <p>Sí. Desde la Ley 13/2005, el matrimonio entre personas del mismo sexo tiene los mismos derechos, incluyendo la pensión de viudedad. Las parejas de hecho del mismo sexo también tienen derecho si cumplen los requisitos (inscripción y convivencia).</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> Los mismos criterios de cotización y convivencia se aplican independientemente del género.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Qué pasa si el fallecido era autónomo?</summary>
            <p>Los trabajadores autónomos (RETA) también generan derecho a pensión de viudedad para su cónyuge o pareja de hecho, con los mismos requisitos de cotización. La base reguladora se calcula sobre las bases de cotización del RETA del fallecido, igual que para trabajadores por cuenta ajena.</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> Los autónomos societarios (en régimen general por ser administradores) cotizan como trabajadores por cuenta ajena.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Cuánto es la pensión mínima de viudedad en 2026?</summary>
            <p>La cuantía mínima de viudedad varía según la edad y las cargas familiares. En 2026 es de {formatCurrency(MINIMOS_VIUDEDAD_2026.menor60)}/mes por debajo de 60 años sin cargas; {formatCurrency(MINIMOS_VIUDEDAD_2026.entre60y64)}/mes entre 60 y 64; {formatCurrency(MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65)}/mes con 65 años o más (o discapacidad del 65&nbsp;%); y {formatCurrency(MINIMOS_VIUDEDAD_2026.conCargasFamiliares)}/mes con cargas familiares, a cualquier edad (14 pagas en todos los casos; Anexo I del RD 241/2026).</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> No es una cantidad garantizada para todos: el complemento que lleva hasta ella exige rentas propias por debajo de {formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)} al año y no puede superar la pensión no contributiva ({formatCurrency(TOPE_COMPLEMENTO_MINIMOS_2026.sinConyugeMensual)}/mes) si la pensión se causa desde 2013.</p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Pueden cobrar la pensión de viudedad los hijos huérfanos?</summary>
            <p>No, la pensión de viudedad corresponde exclusivamente al cónyuge o pareja de hecho superviviente. Los hijos tienen derecho a una prestación diferente: la pensión de orfandad (20&nbsp;% de la BR por cada huérfano de padre o madre; 52&nbsp;% si es huérfano absoluto). Ambas prestaciones son independientes.</p>
            <p className={styles.faqTip}><span aria-hidden="true">💡</span> La pensión de orfandad se extiende hasta los 21 años o 25 si estudia y no trabaja.</p>
          </details>
        </div>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <div className={styles.stepGuide}>
          <h3>Cómo solicitar la pensión de viudedad paso a paso</h3>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Reúne la documentación necesaria</strong>
              <p>Necesitarás: certificado de defunción, libro de familia o certificado de matrimonio/pareja de hecho, DNI del solicitante, vida laboral del fallecido, y documentación de ingresos propios si solicitas el 70&nbsp;%. Si hay hijos, también sus DNIs y datos académicos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Verifica los requisitos de cotización del fallecido</strong>
              <p>Consulta la vida laboral del fallecido para confirmar que cumple el requisito de cotización (500 días en los últimos 5 años si estaba en alta; 15 años totales si no estaba en alta). Este paso determina si existe derecho a la prestación.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Solicita en el plazo de 3 meses</strong>
              <p>Para no perder retroactividad, presenta la solicitud en los 3 meses siguientes al fallecimiento. Puedes hacerlo por internet en Importass, por teléfono (901 106 570) o presencialmente en el INSS o mutuas colaboradoras.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Declara tus ingresos con exactitud</strong>
              <p>Si quieres optar al 70&nbsp;%, debes declarar que tus ingresos propios del trabajo no superan el límite legal (aproximadamente {formatCurrency(PV.limiteIngresos70)}/mes, el 75&nbsp;% del SMI 2026). El INSS verificará esta información con la AEAT.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Espera la resolución del INSS</strong>
              <p>El INSS tiene un plazo de 90 días para resolver. En la práctica, suele tardar entre 1 y 3 meses. Si la resolución es denegatoria, tienes {RECLAMACION_PREVIA_SS.dias} días {RECLAMACION_PREVIA_SS.tipoDias} —no cuentan sábados, domingos ni festivos— para presentar reclamación previa ante el INSS ({RECLAMACION_PREVIA_SS.norma}). {RECLAMACION_PREVIA_SS.resolucion.detalle} ({RECLAMACION_PREVIA_SS.resolucion.norma}). {RECLAMACION_PREVIA_SS.reiteracion.detalle} ({RECLAMACION_PREVIA_SS.reiteracion.norma}).</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>6</span>
            <div className={styles.stepContent}>
              <strong>Revisa la notificación y primer pago</strong>
              <p>Comprueba que el importe reconocido coincide con tu cálculo. Si hay discrepancias, solicita un desglose de la base reguladora calculada por el INSS. El primer pago incluye los atrasos desde la fecha de efectos económicos.</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏰</span>
            <strong>Solicita cuanto antes, no lo postergues</strong>
            <p>El dolor del duelo puede llevar a aplazar trámites, pero la retroactividad es solo de 3 meses. Solicitar tarde supone perder prestación a la que tienes derecho desde el primer momento.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📂</span>
            <strong>Guarda toda la documentación de convivencia</strong>
            <p>Para parejas de hecho, los empadronamientos conjuntos, contratos de arrendamiento compartidos o escrituras de propiedad son prueba de convivencia. Conservar estos documentos facilitará la tramitación.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💰</span>
            <strong>Revisa si tienes derecho al 60&nbsp;% o 70&nbsp;%</strong>
            <p>Muchos beneficiarios cobran el 52&nbsp;% sin saber que cumplen los requisitos para el 70&nbsp;%. Verifica tu situación de ingresos y cargas familiares antes de aceptar el porcentaje inicial reconocido.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <strong>Comunica cambios de circunstancias al INSS</strong>
            <p>Si cambia tu estado civil, tus ingresos aumentan, o cesan las cargas familiares, debes comunicarlo al INSS. No hacerlo puede generar obligación de devolución de cantidades cobradas indebidamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
            <strong>Consulta con un gestor o asesor si la situación es compleja</strong>
            <p>Si hay divorcio previo, múltiples cónyuges, parejas de hecho y matrimonial, o situaciones especiales de cotización, la ayuda de un profesional puede maximizar la prestación obtenida.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Verifica el IRPF de la pensión</strong>
            <p>La pensión de viudedad tributa como rendimiento del trabajo. Si es tu único ingreso y es inferior al mínimo personal, es posible que no estés obligado a declarar, pero conviene confirmarlo con Hacienda o un asesor fiscal.</p>
          </div>
        </div>

        {/* SECCIÓN 6: Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al solicitar la pensión de viudedad</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Solicitar fuera del plazo de 3 meses:</strong> Pasado ese plazo, se pierde retroactividad y la prestación empieza desde la fecha de solicitud, no desde el fallecimiento.</li>
            <li><strong>No acreditar la convivencia en parejas de hecho:</strong> Sin la inscripción en el registro con al menos 2 años de antelación al fallecimiento, no hay derecho a pensión de viudedad para parejas no casadas.</li>
            <li><strong>Confundir pensión de viudedad con pensión de orfandad:</strong> Son prestaciones distintas. Los hijos no cobran viudedad; el cónyuge no cobra orfandad. Cada uno solicita la suya por separado.</li>
            <li><strong>Asumir que el nuevo matrimonio siempre extingue el derecho:</strong> Hay excepciones para mayores de 61 años o cuando la pensión representa la mayor parte de los ingresos.</li>
            <li><strong>No declarar cambios de ingresos:</strong> Si tus ingresos aumentan significativamente (herencia, nueva nómina, etc.) y no lo comunicas, puede generarse una deuda con la Seguridad Social.</li>
            <li><strong>Olvidar solicitar la pensión de orfandad para los hijos:</strong> La pensión de viudedad no incluye automáticamente la de orfandad. Es una solicitud separada que debe tramitarse también, evitando así perder retroactividad también en esa prestación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="estimador-pension-viudedad" />
      <Footer appName="estimador-pension-viudedad" />
    </div>
  );
}
