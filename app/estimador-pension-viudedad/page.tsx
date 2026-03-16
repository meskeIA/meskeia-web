'use client';

import { useState } from 'react';
import styles from './EstimadorPensionViudedad.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { PENSION_VIUDEDAD_2026 } from '@/data/fiscal/pensiones';

// Alias para compatibilidad interna
const PENSION_VIUDEDAD_2025 = PENSION_VIUDEDAD_2026;

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
  pensionFinal: number;        // max(pensionBruta, pensionMinima), capped at máxima
  pensionNetaAprox: number;    // estimación tras IRPF ~10%
  requisitos: Requisito[];
  cumpleRequisitos: boolean;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularPension(form: FormData): Resultado | null {
  const edad = parseInt(form.edadBeneficiario) || 0;
  const aniosCotizados = parseFloat(form.aniosCotizadosCausante.replace(',', '.')) || 0;
  const ingresosMes = parseFloat(form.ingresosTrabajoMes.replace(/\./g, '').replace(',', '.')) || 0;

  // Base reguladora
  let baseReguladora = 0;
  if (form.situacionCausante === 'activo') {
    const baseMensual = parseFloat(form.baseCotizacionMedia.replace(/\./g, '').replace(',', '.')) || 0;
    // BR = (24 × base mensual) / 28
    baseReguladora = (24 * baseMensual) / PENSION_VIUDEDAD_2025.divisorBaseReguladora;
  } else if (form.situacionCausante === 'jubilado') {
    const pensionCausante = parseFloat(form.pensionCausante.replace(/\./g, '').replace(',', '.')) || 0;
    baseReguladora = pensionCausante; // La BR = la pensión que cobraba
  } else {
    // No en alta: estimación con la misma fórmula pero requiere cotizaciones
    const baseMensual = parseFloat(form.baseCotizacionMedia.replace(/\./g, '').replace(',', '.')) || 0;
    baseReguladora = (24 * baseMensual) / PENSION_VIUDEDAD_2025.divisorBaseReguladora;
  }

  if (baseReguladora <= 0) return null;

  // Porcentaje aplicable
  let porcentajeAplicable = PENSION_VIUDEDAD_2025.porcentajeGeneral;
  let razonPorcentaje = 'Porcentaje general (52%)';

  const tieneIngresosLimitados70 = ingresosMes < PENSION_VIUDEDAD_2025.limiteIngresos70;
  const tieneIngresosLimitados60 = ingresosMes < PENSION_VIUDEDAD_2025.smiMensual;

  if (form.tieneCargas && tieneIngresosLimitados70) {
    porcentajeAplicable = PENSION_VIUDEDAD_2025.porcentaje70;
    razonPorcentaje = `70%: tiene cargas familiares e ingresos del trabajo inferiores al 75% del SMI (${formatCurrency(PENSION_VIUDEDAD_2025.limiteIngresos70)}/mes)`;
  } else if (edad >= 65 && tieneIngresosLimitados60) {
    porcentajeAplicable = PENSION_VIUDEDAD_2025.porcentaje60;
    razonPorcentaje = `60%: tiene 65 años o más e ingresos del trabajo inferiores al SMI (${formatCurrency(PENSION_VIUDEDAD_2025.smiMensual)}/mes)`;
  }

  const pensionBruta = (baseReguladora * porcentajeAplicable) / 100;

  // Pensión mínima según edad y cargas
  let pensionMinima: number;
  if (edad >= 65) {
    pensionMinima = PENSION_VIUDEDAD_2025.minimo65SinDiscap;
  } else if (edad >= 60) {
    pensionMinima = PENSION_VIUDEDAD_2025.minimo60a64;
  } else if (form.tieneCargas) {
    pensionMinima = PENSION_VIUDEDAD_2025.minimoMenor60ConCargas;
  } else {
    pensionMinima = PENSION_VIUDEDAD_2025.minimoMenor60SinCargas;
  }

  const pensionFinal = Math.min(
    Math.max(pensionBruta, pensionMinima),
    PENSION_VIUDEDAD_2025.pensionMaxima
  );

  // IRPF estimado: pensiones de viudedad < 22.000€ anuales → tipo ~10-12%
  const pensionAnual = pensionFinal * 14; // 14 pagas
  const retencionEstimada = pensionAnual < 15000 ? 0 : pensionAnual < 22000 ? 0.08 : 0.12;
  const pensionNetaAprox = pensionFinal * (1 - retencionEstimada);

  // Requisitos
  const requisitos: Requisito[] = [
    {
      cumple: aniosCotizados >= 15 || form.situacionCausante === 'jubilado',
      texto: 'El causante tenía cotizados los períodos mínimos requeridos',
      nota: form.situacionCausante === 'activo'
        ? 'En alta laboral: 500 días cotizados en los últimos 5 años. Si no estaba en alta: 15 años cotizados en toda la vida laboral.'
        : form.situacionCausante === 'jubilado'
        ? 'Al ser pensionista, los requisitos de cotización ya estaban cumplidos.'
        : 'Sin estar en alta: se requieren 15 años cotizados en toda la vida laboral.',
    },
    {
      cumple: form.tipoVinculo === 'matrimonio' ? true : null,
      texto: form.tipoVinculo === 'matrimonio'
        ? 'Matrimonio: vínculo acreditado'
        : 'Pareja de hecho: inscrita en registro oficial con al menos 2 años de antelación y convivencia acreditada de 5 años',
      nota: form.tipoVinculo === 'pareja-hecho'
        ? 'La pareja de hecho debe estar inscrita en el registro autonómico o municipal con al menos 2 años antes del fallecimiento, y acreditar convivencia estable de al menos 5 años.'
        : undefined,
    },
    {
      cumple: true,
      texto: 'No haber sido condenado/a por violencia de género contra el causante',
      nota: 'Requisito general: la pensión queda extinguida si el beneficiario es condenado por causar el fallecimiento del causante.',
    },
  ];

  const cumpleRequisitos = requisitos.every(r => r.cumple !== false);

  return {
    baseReguladora,
    porcentajeAplicable,
    razonPorcentaje,
    pensionBruta,
    pensionMinima,
    pensionFinal,
    pensionNetaAprox,
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
        <p className={styles.subtitle}>Seguridad Social · Cuantía orientativa 2025 · Porcentajes 52% / 60% / 70%</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es <strong>SOLO orientativa</strong>. El cálculo real de la pensión de viudedad lo realiza el INSS con todos los datos de cotización del causante.
          <br /><strong>Solicita siempre la pensión</strong> en cualquier oficina de la Seguridad Social o a través de Import@SS, aunque no estés seguro de tener derecho: el INSS resolverá oficialmente.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Datos del causante y beneficiario</h2>

          {/* Situación del causante */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Situación del causante al fallecer</label>
            <div className={styles.optionGrid}>
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
            <label className={styles.label}>Vínculo con el causante</label>
            <div className={styles.switchRow}>
              {([
                { id: 'matrimonio',    label: '💒 Matrimonio' },
                { id: 'pareja-hecho', label: '🤝 Pareja de hecho' },
              ] as { id: TipoVinculo; label: string }[]).map(op => (
                <button
                  key={op.id}
                  type="button"
                  className={`${styles.switchBtn} ${form.tipoVinculo === op.id ? styles.switchActivo : ''}`}
                  onClick={() => update('tipoVinculo', op.id)}
                  aria-pressed={form.tipoVinculo === op.id}
                >
                  {op.label}
                </button>
              ))}
            </div>
            {form.tipoVinculo === 'pareja-hecho' && (
              <p className={styles.hint}>Requiere inscripción en registro oficial ≥ 2 años antes del fallecimiento y convivencia estable ≥ 5 años.</p>
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
            <p className={styles.hint}>La edad determina el porcentaje aplicable (60% si ≥65) y la pensión mínima garantizada.</p>
          </div>

          {/* Cargas familiares */}
          <div className={styles.formGroup}>
            <label className={styles.label}>¿Tiene hijos/as menores de 26 años o con discapacidad a cargo?</label>
            <div className={styles.switchRow}>
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
            helperText="Salario o rendimientos netos propios. Determina si se puede aplicar el 60% o 70%. Pon 0 si no trabajas."
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>⚠️ {error}</div>
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
                <div className={styles.pensionNeta}>≈ {formatCurrency(resultado.pensionNetaAprox)}/mes netos · {formatCurrency(resultado.pensionFinal * 14)}/año brutos</div>
              </div>

              {/* Desglose del cálculo */}
              <div className={styles.desgloseCard}>
                <div className={styles.desgloseTitle}>📋 Desglose del cálculo</div>
                <div className={styles.desgloseItem}>
                  <span>Base reguladora</span>
                  <strong>{formatCurrency(resultado.baseReguladora)}/mes</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Porcentaje aplicado</span>
                  <strong className={styles.porcentajeBadge}>{resultado.porcentajeAplicable}%</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Pensión calculada</span>
                  <strong>{formatCurrency(resultado.pensionBruta)}/mes</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>Pensión mínima garantizada</span>
                  <strong>{formatCurrency(resultado.pensionMinima)}/mes</strong>
                </div>
                {resultado.pensionFinal === resultado.pensionMinima && resultado.pensionBruta < resultado.pensionMinima && (
                  <div className={styles.minimoAplicado}>
                    ⬆️ Se aplica el mínimo garantizado por ser superior al porcentaje calculado
                  </div>
                )}
                {resultado.pensionFinal >= PENSION_VIUDEDAD_2025.pensionMaxima && (
                  <div className={styles.maximoAplicado}>
                    ⬇️ Se aplica la pensión máxima SS 2025 ({formatCurrency(PENSION_VIUDEDAD_2025.pensionMaxima)}/mes)
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
                <div className={styles.desgloseTitle}>✅ Verificación de requisitos</div>
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
                  <strong>52%</strong>
                  <span>Caso general</span>
                </div>
                <div className={`${styles.refItem} ${resultado.porcentajeAplicable === 60 ? styles.refActivo : ''}`}>
                  <strong>60%</strong>
                  <span>≥65 años + renta baja</span>
                </div>
                <div className={`${styles.refItem} ${resultado.porcentajeAplicable === 70 ? styles.refActivo : ''}`}>
                  <strong>70%</strong>
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
          <li><strong>52%</strong>: cuantía general, para la mayoría de los casos.</li>
          <li><strong>60%</strong>: si el beneficiario tiene 65 o más años, no recibe otra pensión pública y sus ingresos por trabajo no superan el SMI anual.</li>
          <li><strong>70%</strong>: si tiene cargas familiares (hijos menores de 26 o con discapacidad) y los rendimientos del trabajo son inferiores al 75% del SMI mensual. Desde 2022 este porcentaje se aplica con carácter general si se cumplen los requisitos.</li>
        </ul>
        <h3>¿Cómo se calcula la base reguladora?</h3>
        <p>Si el causante era pensionista: la base reguladora es igual al importe de su pensión. Si fallecía en activo: se toman las bases de cotización de los últimos 24 meses y se divide entre 28 (para obtener el equivalente mensual, incluyendo pagas extras).</p>
        <h3>Parejas de hecho</h3>
        <p>Desde 2007 las parejas de hecho tienen acceso a la pensión de viudedad, pero con requisitos adicionales: inscripción en el registro autonómico o municipal con al menos 2 años de antelación al fallecimiento, y convivencia estable y notoria de al menos 5 años. Los requisitos económicos también son más restrictivos que para matrimonios.</p>
        <h3>Compatibilidades e incompatibilidades</h3>
        <p>La pensión de viudedad es compatible con el trabajo y con la pensión de jubilación propia. Sin embargo, puede reducirse o extinguirse si el beneficiario contrae nuevo matrimonio (salvo excepciones para mayores de 61 años con pensión insuficiente).</p>
        <h3>¿Cómo solicitarla?</h3>
        <p>En cualquier oficina de la Seguridad Social, por teléfono (901 10 65 70) o a través de Import@SS (sede electrónica). Presentar: DNI, certificado de matrimonio/convivencia, libro de familia, certificado de defunción y documentación laboral del causante.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-pension-viudedad')} />
      <ShareCard appName="estimador-pension-viudedad" />
      <Footer appName="estimador-pension-viudedad" />
    </div>
  );
}
