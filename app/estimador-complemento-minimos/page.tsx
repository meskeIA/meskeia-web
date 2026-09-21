'use client';

import { useState } from 'react';
import styles from './EstimadorComplementoMinimos.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, DataReference, RegionBadge
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { PENSIONES_MINIMAS_2026, COMPLEMENTO_MINIMOS_LIMITES_2026, FISCAL_PENSIONES_META } from '@/data/fiscal';
import type { PensionMinimaEntry } from '@/data/fiscal/pensiones';

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
  /** Límite de ingresos que se ha aplicado de verdad, para poder rotularlo sin adivinar */
  limiteIngresos: number;
  /** Si el límite aplicado es el de «con cónyuge a cargo» */
  conConyugeACargo: boolean;
  /** El complemento sale de la regla diferencial del art. 9.2, no del mínimo íntegro */
  complementoDiferencial: boolean;
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
    // El orden importa: «con cargas familiares» es fila propia del Anexo I del
    // RD 241/2026 y prevalece sobre el tramo de edad, sea cual sea esta.
    { value: 'con_cargas', label: 'Con cargas familiares (cualquier edad)' },
    { value: '65_o_mas', label: '65 años o más, o discapacidad ≥ 65 %' },
    { value: '60_a_64', label: '60 a 64 años' },
    { value: 'menos_60_sin_cargas', label: 'Menos de 60 — sin cargas familiares' },
  ],
};

// ─── Lógica ───────────────────────────────────────────────────────────────────

/**
 * Las cuantías de PENSIONES_MINIMAS_2026 son mensuales porque el Anexo I del RD 241/2026
 * da importes ANUALES y el módulo los divide entre 14. Para aplicar la regla del art. 9.2,
 * que compara magnitudes anuales, hay que volver a multiplicar por las mismas 14.
 */
const PAGAS = 14;

function calcular(
  tipo: TipoPension,
  subtipo: string,
  situacion: SituacionFamiliar,
  pensionActual: number,
  ingresosAnuales: number,
): Resultado | null {
  const entry = PENSIONES_MINIMAS_2026.find(e => e.tipo === tipo && e.subtipo === subtipo);
  if (!entry) return null;

  // ⚠️ 2026-09-21 (hallazgo 1101): la situación familiar se leía de un estado INVISIBLE.
  //    En viudedad el selector ni se muestra, pero `situacion` conservaba lo pulsado antes
  //    y el LÍMITE seguía saliendo de ahí, así que quien pasara por «Con cónyuge a cargo»
  //    arrastraba el límite de 11.013 € a una pensión que no admite cónyuge a cargo. El
  //    mínimo sí se forzaba a unipersonal; el límite, no. Ahora la situación EFECTIVA se
  //    calcula una vez y manda sobre las dos cosas y sobre el rótulo.
  const situacionEfectiva: SituacionFamiliar = tipo === 'viudedad' ? 'unipersonal' : situacion;
  const pensionMinima = entry[situacionEfectiva];

  if (pensionMinima <= 0) return null;

  const conConyugeACargo = situacionEfectiva === 'conConyuge';
  const limiteIngresos = conConyugeACargo
    ? COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge
    : COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge;

  // ⚠️ 2026-09-21 (hallazgo 1103): aquí se cortaba a cero de golpe en cuanto las rentas
  //    pasaban del límite, y un euro de más costaba el complemento entero. El art. 9.2 del
  //    RD 241/2026 no funciona así: cuando la suma de rentas y pensión queda por debajo de
  //    la suma del límite y la cuantía mínima anual, se reconoce un complemento igual a esa
  //    diferencia, repartido entre las mensualidades. El corte existe, pero está más arriba
  //    y la caída es progresiva.
  const minimaAnual = pensionMinima * PAGAS;
  const pensionAnual = pensionActual * PAGAS;

  const complementoIntegroAnual = Math.max(0, minimaAnual - pensionAnual);
  const complementoDiferencialAnual = Math.max(
    0,
    (limiteIngresos + minimaAnual) - (ingresosAnuales + pensionAnual),
  );

  const superaLimite = ingresosAnuales > limiteIngresos;
  const complementoAnual = superaLimite
    ? Math.min(complementoIntegroAnual, complementoDiferencialAnual)
    : complementoIntegroAnual;
  const complemento = complementoAnual / PAGAS;

  const base = {
    pensionMinima,
    entry,
    limiteIngresos,
    conConyugeACargo,
    complementoDiferencial: superaLimite && complemento > 0,
  };

  if (complemento <= 0) {
    return {
      ...base,
      complemento: 0,
      pensionFinal: pensionActual,
      elegible: false,
      motivoNoElegible: superaLimite
        ? `Tus ingresos anuales (${formatCurrency(ingresosAnuales)}) superan el límite de ${formatCurrency(limiteIngresos)} en más de lo que te faltaba para llegar al mínimo, así que no queda complemento que reconocer.`
        : 'Tu pensión actual ya iguala o supera el mínimo garantizado para tu situación.',
    };
  }

  return {
    ...base,
    complemento,
    pensionFinal: pensionActual + complemento,
    elegible: true,
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
  const [error, setError] = useState('');

  const handleTipoChange = (nuevoTipo: TipoPension) => {
    setTipo(nuevoTipo);
    setSubtipo(SUBTIPOS[nuevoTipo][0].value);
    setResultado(null);
    setError('');
  };

  const handleEstimar = () => {
    setError('');
    // ⚠️ 2026-09-21 (hallazgos 1105-1107): el `|| 0` de `parseFloat` convertía un campo
    //    VACÍO en una pensión de 0 € y devolvía en verde el mínimo íntegro, una cifra
    //    rotunda nacida de cero información. Y «1100abc» entraba como 1.100 sin avisar.
    //    `parseSpanishNumber` devuelve NaN en lo que no es un número, así que basta con
    //    no taparlo.
    const pension = parseSpanishNumber(pensionActual);
    const ingresos = ingresosAnuales.trim() === '' ? NaN : parseSpanishNumber(ingresosAnuales);

    if (Number.isNaN(pension)) {
      setError('Introduce tu pensión mensual bruta actual. Si aún no cobras pensión, esta herramienta no puede estimar nada.');
      setResultado(null); return;
    }
    if (pension < 0) {
      setError('La pensión no puede ser negativa.');
      setResultado(null); return;
    }
    if (Number.isNaN(ingresos)) {
      setError('Introduce tus otros ingresos anuales. Si no tienes ninguno, escribe 0: es el dato que decide si te corresponde el complemento.');
      setResultado(null); return;
    }
    if (ingresos < 0) {
      setError('Los ingresos no pueden ser negativos.');
      setResultado(null); return;
    }

    setResultado(calcular(tipo, subtipo, situacion, pension, ingresos));
  };

  return (
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
            <fieldset className={styles.formGroup}>
              <legend className={styles.label}>Tipo de pensión</legend>
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
            </fieldset>

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
              <fieldset className={styles.formGroup}>
                <legend className={styles.label}>Situación familiar</legend>
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
                  &laquo;A cargo&raquo; = convives con tu cónyuge y depende económicamente de ti. El
                  art. 10.1.b) del RD 241/2026 lo fija en que la suma de vuestros rendimientos
                  anuales —los de los dos, excluida tu pensión— no llegue a{' '}
                  {formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.conConyuge)}.
                </p>
              </fieldset>
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

            {error && (
              <div role="alert" aria-live="assertive" className={styles.avisoError}>
                <span aria-hidden="true">⚠️</span> {error}
              </div>
            )}

            <button type="button" className={styles.btn} onClick={handleEstimar}>
              Estimar complemento
            </button>
          </div>

          {/* ── Panel derecho: resultados ── */}
          <div className={styles.card} role="status" aria-live="polite">
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
                    <strong>{formatCurrency(resultado.pensionFinal - resultado.complemento)}/mes</strong>
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
                    {formatCurrency(resultado.limiteIngresos)}/año{' '}
                    ({resultado.conConyugeACargo ? 'con cónyuge a cargo' : 'sin cónyuge a cargo'})
                    {resultado.complementoDiferencial && (
                      <>
                        {' · '}Tus ingresos lo superan, pero no tanto como para perder el
                        complemento entero: el art. 9.2 del RD 241/2026 reconoce la diferencia
                        entre lo que sumas (rentas + pensión) y la suma del límite más la
                        cuantía mínima anual.
                      </>
                    )}
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
          title="Todo sobre el complemento a mínimos"
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
  );
}
