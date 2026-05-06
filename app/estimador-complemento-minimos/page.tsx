'use client';

import { useState } from 'react';
import styles from './EstimadorComplementoMinimos.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, DataReference, RegionBadge
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { PENSIONES_MINIMAS_2026, COMPLEMENTO_MINIMOS_LIMITES_2026, FISCAL_PENSIONES_META } from '@/data/fiscal';
import type { PensionMinimaEntry } from '@/data/fiscal/pensiones';
import { jsonLd } from './metadata';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoPension = 'jubilacion' | 'incapacidad' | 'viudedad';
type SituacionFamiliar = 'conConyuge' | 'sinConyuge' | 'unipersonal';

interface Resultado {
  pensionMinima: number;
  complemento: number;
  pensionFinal: number;
  elegible: boolean;
  motivoNoElegible?: string;
  entry: PensionMinimaEntry;
}

// ─── Opciones de subtipo por tipo ─────────────────────────────────────────────

const SUBTIPOS: Record<TipoPension, { value: string; label: string }[]> = {
  jubilacion: [
    { value: '65_o_mas', label: '65 años o más' },
    { value: 'menos_65', label: 'Menos de 65 años' },
  ],
  incapacidad: [
    { value: 'gran_invalidez', label: 'Gran Invalidez' },
    { value: 'absoluta', label: 'Absoluta' },
    { value: 'total_65_o_mas', label: 'Total — 65 o más años' },
    { value: 'total_60_64', label: 'Total — 60 a 64 años' },
    { value: 'total_menos_60', label: 'Total — menos de 60 (enf. común)' },
  ],
  viudedad: [
    { value: '65_o_mas', label: '65 años o más' },
    { value: '60_a_64', label: '60 a 64 años' },
    { value: 'menos_60_con_cargas', label: 'Menos de 60 — con cargas familiares' },
    { value: 'menos_60_sin_cargas', label: 'Menos de 60 — sin cargas familiares' },
  ],
};

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcular(
  tipo: TipoPension,
  subtipo: string,
  situacion: SituacionFamiliar,
  pensionActual: number,
  ingresosAnuales: number,
): Resultado | null {
  const entry = PENSIONES_MINIMAS_2026.find(e => e.tipo === tipo && e.subtipo === subtipo);
  if (!entry) return null;

  // Para viudedad solo se usa unipersonal
  const campo: SituacionFamiliar = tipo === 'viudedad' ? 'unipersonal' : situacion;
  const pensionMinima = entry[campo];

  if (pensionMinima <= 0) return null;

  // Elegibilidad por ingresos
  const limiteIngresos = situacion === 'conConyuge'
    ? COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge
    : COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge;

  if (ingresosAnuales > limiteIngresos) {
    return {
      pensionMinima,
      complemento: 0,
      pensionFinal: pensionActual,
      elegible: false,
      motivoNoElegible: `Tus ingresos anuales (${formatCurrency(ingresosAnuales).replace('€', '').trim()} €) superan el límite de ${formatCurrency(limiteIngresos)} para acceder al complemento.`,
      entry,
    };
  }

  const complemento = Math.max(0, pensionMinima - pensionActual);

  return {
    pensionMinima,
    complemento,
    pensionFinal: pensionActual + complemento,
    elegible: complemento > 0,
    motivoNoElegible: complemento === 0
      ? 'Tu pensión actual ya iguala o supera el mínimo garantizado para tu situación.'
      : undefined,
    entry,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorComplementoMinimosPage() {
  const [tipo, setTipo] = useState<TipoPension>('jubilacion');
  const [subtipo, setSubtipo] = useState(SUBTIPOS.jubilacion[0].value);
  const [situacion, setSituacion] = useState<SituacionFamiliar>('unipersonal');
  const [pensionActual, setPensionActual] = useState('');
  const [ingresosAnuales, setIngresosAnuales] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleTipoChange = (nuevoTipo: TipoPension) => {
    setTipo(nuevoTipo);
    setSubtipo(SUBTIPOS[nuevoTipo][0].value);
    setResultado(null);
  };

  const handleEstimar = () => {
    const pension = parseFloat(pensionActual.replace(/\./g, '').replace(',', '.')) || 0;
    const ingresos = parseFloat(ingresosAnuales.replace(/\./g, '').replace(',', '.')) || 0;
    setResultado(calcular(tipo, subtipo, situacion, pension, ingresos));
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🏛️</span>
          <h1 className={styles.title}>Estimador de Complemento a Mínimos</h1>
          <p className={styles.subtitle}>
            Comprueba si tu pensión puede completarse hasta el mínimo garantizado por la Seguridad Social (2026)
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical" context="estimador-complemento-minimos" />
        <DataReference
          normativa="Pensiones mínimas SS 2026"
          fuente={FISCAL_PENSIONES_META.fuente}
          verificado={FISCAL_PENSIONES_META.verificado}
          urlOficial={FISCAL_PENSIONES_META.urlOficial}
        />

        <div className={styles.mainContent}>
          {/* ── Panel izquierdo: formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tu situación</h2>

            {/* Tipo de pensión */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de pensión</label>
              <div className={styles.optionGrid}>
                {([
                  { id: 'jubilacion' as const, icon: '🌅', label: 'Jubilación' },
                  { id: 'incapacidad' as const, icon: '♿', label: 'Incapacidad permanente' },
                  { id: 'viudedad' as const, icon: '💍', label: 'Viudedad' },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.optionBtn} ${tipo === opt.id ? styles.optionActivo : ''}`}
                    onClick={() => handleTipoChange(opt.id)}
                    aria-pressed={tipo === opt.id}
                  >
                    <span aria-hidden="true">{opt.icon}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtipo */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="subtipo">
                {tipo === 'jubilacion' ? 'Edad' : tipo === 'incapacidad' ? 'Grado' : 'Edad y cargas'}
              </label>
              <select
                id="subtipo"
                className={styles.select}
                value={subtipo}
                onChange={e => { setSubtipo(e.target.value); setResultado(null); }}
              >
                {SUBTIPOS[tipo].map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Situación familiar (solo si no es viudedad) */}
            {tipo !== 'viudedad' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Situación familiar</label>
                <div className={styles.optionGrid}>
                  {([
                    { id: 'conConyuge' as const, label: 'Con cónyuge a cargo' },
                    { id: 'sinConyuge' as const, label: 'Cónyuge NO a cargo' },
                    { id: 'unipersonal' as const, label: 'Sin cónyuge' },
                  ] as const).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`${styles.optionBtn} ${situacion === opt.id ? styles.optionActivo : ''}`}
                      onClick={() => { setSituacion(opt.id); setResultado(null); }}
                      aria-pressed={situacion === opt.id}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className={styles.hint}>
                  &laquo;A cargo&raquo; = el cónyuge depende económicamente de ti (ingresos anuales &lt; 8.614 €)
                </p>
              </div>
            )}

            {/* Pensión actual */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="pensionActual">Tu pensión mensual bruta actual (€)</label>
              <input
                id="pensionActual"
                type="text"
                inputMode="decimal"
                className={styles.input}
                placeholder="Ej: 750"
                value={pensionActual}
                onChange={e => { setPensionActual(e.target.value); setResultado(null); }}
              />
              <p className={styles.hint}>Importe bruto mensual que aparece en tu nómina de pensión</p>
            </div>

            {/* Otros ingresos */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="ingresosAnuales">Otros ingresos anuales (€)</label>
              <input
                id="ingresosAnuales"
                type="text"
                inputMode="decimal"
                className={styles.input}
                placeholder="Ej: 3000"
                value={ingresosAnuales}
                onChange={e => { setIngresosAnuales(e.target.value); setResultado(null); }}
              />
              <p className={styles.hint}>Rentas de capital, alquileres, etc. (excluida tu pensión). Si no tienes, pon 0.</p>
            </div>

            <button type="button" className={styles.btn} onClick={handleEstimar}>
              Estimar complemento
            </button>
          </div>

          {/* ── Panel derecho: resultados ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Resultado</h2>

            {!resultado ? (
              <p className={styles.placeholder}>
                Completa los datos y pulsa &laquo;Estimar complemento&raquo; para ver el resultado
              </p>
            ) : (
              <div className={styles.resultados}>
                {/* Hero del resultado */}
                <div className={resultado.elegible ? styles.resultHeroPositivo : styles.resultHeroNegativo}>
                  <div className={styles.resultIcon} aria-hidden="true">
                    {resultado.elegible ? '✅' : resultado.motivoNoElegible?.includes('superan') ? '❌' : 'ℹ️'}
                  </div>
                  <div className={styles.resultImporte}>
                    {resultado.elegible
                      ? `+${formatCurrency(resultado.complemento)}/mes`
                      : 'Sin complemento'}
                  </div>
                  <p className={styles.resultLabel}>
                    {resultado.elegible
                      ? 'Complemento mensual estimado'
                      : resultado.motivoNoElegible}
                  </p>
                </div>

                {/* Desglose */}
                <div className={styles.desgloseCard}>
                  <h3 className={styles.desgloseTitle}>Desglose</h3>
                  <div className={styles.desgloseItem}>
                    <span>Pensión mínima garantizada</span>
                    <strong>{formatCurrency(resultado.pensionMinima)}/mes</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Tu pensión actual</span>
                    <strong>{formatCurrency(parseFloat(pensionActual.replace(/\./g, '').replace(',', '.')) || 0)}/mes</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Complemento a mínimos</span>
                    <strong className={resultado.complemento > 0 ? styles.importePositivo : ''}>
                      {resultado.complemento > 0 ? '+' : ''}{formatCurrency(resultado.complemento)}/mes
                    </strong>
                  </div>
                  <div className={`${styles.desgloseItem} ${styles.desgloseFinal}`}>
                    <span>Pensión final estimada</span>
                    <strong>{formatCurrency(resultado.pensionFinal)}/mes</strong>
                  </div>
                </div>

                {/* Datos anuales */}
                <div className={styles.anualCard}>
                  <span aria-hidden="true">📅</span>
                  <div>
                    <strong>Impacto anual (14 pagas)</strong>
                    <p>
                      Complemento: {formatCurrency(resultado.complemento * 14)}/año
                      {' · '}
                      Pensión total: {formatCurrency(resultado.pensionFinal * 14)}/año
                    </p>
                  </div>
                </div>

                {/* Límite de ingresos */}
                <div className={styles.infoCard}>
                  <span aria-hidden="true">💡</span>
                  <p>
                    <strong>Límite de ingresos 2026:</strong>{' '}
                    {situacion === 'conConyuge'
                      ? `${formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge)}/año (con cónyuge a cargo)`
                      : `${formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge)}/año (sin cónyuge a cargo)`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabla de referencia ── */}
        <div className={styles.tablaReferencia}>
          <h2 className={styles.tablaTitle}>
            <span aria-hidden="true">📊</span> Pensiones mínimas 2026 — Tabla completa
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de pensión</th>
                  <th>Con cónyuge a cargo</th>
                  <th>Cónyuge NO a cargo</th>
                  <th>Sin cónyuge</th>
                </tr>
              </thead>
              <tbody>
                {PENSIONES_MINIMAS_2026.map(entry => (
                  <tr key={`${entry.tipo}-${entry.subtipo}`}>
                    <td>{entry.label}</td>
                    <td>{entry.conConyuge > 0 ? formatCurrency(entry.conConyuge) : '—'}</td>
                    <td>{entry.sinConyuge > 0 ? formatCurrency(entry.sinConyuge) : '—'}</td>
                    <td>{formatCurrency(entry.unipersonal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Contenido educativo ── */}
        <EducationalSection
          title="📚 Todo sobre el complemento a mínimos"
          subtitle="Requisitos, trámites y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el complemento a mínimos?</h2>
            <p>
              Es una cantidad adicional que la Seguridad Social añade a tu pensión cuando esta
              queda por debajo del <strong>mínimo legal garantizado</strong> para tu situación.
              No es una prestación aparte: se integra directamente en tu nómina de pensión.
            </p>

            <div className={styles.stepGuide}>
              <h3>¿Cómo se solicita?</h3>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Solicitud de pensión</strong>
                  <p>Al pedir la pensión (jubilación, viudedad o incapacidad), la SS evalúa automáticamente si tienes derecho al complemento.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Declaración de ingresos</strong>
                  <p>Debes declarar tus ingresos anuales (rentas de capital, alquileres, etc.). La SS los comprueba con Hacienda.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Revisión anual</strong>
                  <p>Cada año la SS revisa tu derecho al complemento. Si tus ingresos cambian, el complemento puede ajustarse o retirarse.</p>
                </div>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿El complemento es compatible con trabajar?</summary>
                <p>Si estás jubilado y trabajas, generalmente pierdes el complemento a mínimos mientras dure la actividad laboral. En jubilación parcial hay matices.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué ingresos se tienen en cuenta?</summary>
                <p>Rentas de capital mobiliario e inmobiliario, ganancias patrimoniales, rendimientos de actividades económicas. No se cuenta la propia pensión.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo cobrar complemento con dos pensiones?</summary>
                <p>Si cobras más de una pensión pública, el complemento se aplica solo a una de ellas. La suma de ambas no debe superar el mínimo correspondiente.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Se actualiza cada año?</summary>
                <p>Sí. Los importes mínimos se revalorizan anualmente (normalmente con el IPC) y se publican en los Presupuestos Generales del Estado.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante sobre esta herramienta</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Los importes son orientativos y se basan en datos oficiales de la SS para 2026</li>
                <li>El cálculo real depende de tu historial completo, que solo la SS puede verificar</li>
                <li>El complemento a mínimos NO se hereda ni se transmite a beneficiarios</li>
                <li>Si resides fuera de España más de 90 días al año, puedes perder el complemento</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimador-complemento-minimos')} />
        <ShareCard appName="estimador-complemento-minimos" />
        <Footer appName="estimador-complemento-minimos" />
      </div>
    </>
  );
}
