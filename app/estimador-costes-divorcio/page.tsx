'use client';

import { useState } from 'react';
import styles from './EstimadorCostesDivorcio.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, RegionBadge, DataReference,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { COSTAS_JUDICIALES_META, ARANCEL_PROCURA } from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoDivorcio = 'mutuo_acuerdo_judicial' | 'mutuo_acuerdo_notarial' | 'contencioso';
type ComplejidadBienes = 'sin_bienes' | 'bienes_simples' | 'bienes_complejos';

interface Resultado {
  tipo: TipoDivorcio;
  abogado: { min: number; max: number };
  procurador: number;
  notario: number;
  registro: number;
  tasas: number;
  total: { min: number; max: number };
  duracionMeses: { min: number; max: number };
  notas: string[];
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcular(
  tipo: TipoDivorcio,
  tieneHijos: boolean,
  complejidad: ComplejidadBienes,
): Resultado {
  const notas: string[] = [];

  let abogado = { min: 0, max: 0 };
  let procurador = 0;
  let notario = 0;
  let registro = 0;
  const tasas = 0; // Personas físicas exentas desde 2015
  let duracionMeses = { min: 0, max: 0 };

  if (tipo === 'mutuo_acuerdo_notarial') {
    // Divorcio notarial: solo sin hijos menores ni incapacitados
    // Un solo abogado para ambos cónyuges
    if (complejidad === 'sin_bienes') {
      abogado = { min: 500, max: 1000 };
    } else if (complejidad === 'bienes_simples') {
      abogado = { min: 700, max: 1500 };
    } else {
      abogado = { min: 1000, max: 2500 };
    }
    notario = complejidad === 'bienes_complejos' ? 250 : 150;
    registro = 50;
    procurador = 0;
    duracionMeses = { min: 1, max: 2 };
    notas.push('Solo posible sin hijos menores ni personas con discapacidad a cargo');
    notas.push('Un solo abogado para ambos cónyuges (coste compartido)');
    notas.push('La escritura notarial tiene la misma validez que una sentencia judicial');

  } else if (tipo === 'mutuo_acuerdo_judicial') {
    // Divorcio de mutuo acuerdo judicial: un solo abogado y procurador
    if (complejidad === 'sin_bienes') {
      abogado = tieneHijos ? { min: 700, max: 1500 } : { min: 500, max: 1200 };
    } else if (complejidad === 'bienes_simples') {
      abogado = tieneHijos ? { min: 1000, max: 2000 } : { min: 800, max: 1800 };
    } else {
      abogado = tieneHijos ? { min: 1500, max: 3500 } : { min: 1200, max: 3000 };
    }
    procurador = 250;
    duracionMeses = { min: 2, max: 4 };
    notas.push('Un solo abogado y procurador para ambos (coste compartido)');
    if (tieneHijos) {
      notas.push('Se necesita convenio regulador con medidas sobre custodia, alimentos y uso de vivienda');
      notas.push('El Ministerio Fiscal revisará el convenio por haber hijos menores');
    }

  } else {
    // Divorcio contencioso: cada parte con su abogado y procurador
    if (complejidad === 'sin_bienes') {
      abogado = tieneHijos ? { min: 2000, max: 5000 } : { min: 1500, max: 4000 };
    } else if (complejidad === 'bienes_simples') {
      abogado = tieneHijos ? { min: 3000, max: 7000 } : { min: 2500, max: 6000 };
    } else {
      abogado = tieneHijos ? { min: 4000, max: 12000 } : { min: 3500, max: 10000 };
    }
    procurador = complejidad === 'bienes_complejos' ? 800 : 500;
    duracionMeses = tieneHijos ? { min: 6, max: 18 } : { min: 4, max: 12 };
    notas.push('Cada cónyuge necesita su propio abogado y procurador');
    notas.push('Los importes mostrados son por cónyuge — el coste total familiar sería el doble');
    if (tieneHijos) {
      notas.push('Posibles informes periciales psicosociales si hay disputa sobre custodia');
    }
  }

  notas.push('Las personas físicas están exentas de tasas judiciales desde 2015');

  return {
    tipo,
    abogado,
    procurador,
    notario,
    registro,
    tasas,
    total: {
      min: abogado.min + procurador + notario + registro + tasas,
      max: abogado.max + procurador + notario + registro + tasas,
    },
    duracionMeses,
    notas,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorCostesDivorcioPage() {
  const [tipo, setTipo] = useState<TipoDivorcio>('mutuo_acuerdo_judicial');
  const [tieneHijos, setTieneHijos] = useState(false);
  const [complejidad, setComplejidad] = useState<ComplejidadBienes>('sin_bienes');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleEstimar = () => {
    setResultado(calcular(tipo, tieneHijos, complejidad));
  };

  // Si elige notarial con hijos, desactivar hijos
  const handleTipo = (t: TipoDivorcio) => {
    setTipo(t);
    if (t === 'mutuo_acuerdo_notarial') setTieneHijos(false);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">📝</span>
          <h1 className={styles.title}>Estimador de Costes de Divorcio en España 2026</h1>
          <p className={styles.subtitle}>
            Cuánto cuesta divorciarse en España: precio del abogado, procurador y tarifa notarial según el
            tipo de procedimiento (mutuo acuerdo vs contencioso), hijos y bienes comunes
          </p>
        </header>

        <RegionBadge variant="es-only" />
        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" context="estimador-costes-divorcio" />
        <DataReference
          normativa="Tasas judiciales y arancel de Procura 2025-2026"
          fuente={COSTAS_JUDICIALES_META.fuente}
          verificado={COSTAS_JUDICIALES_META.verificado}
          urlOficial={COSTAS_JUDICIALES_META.urlOficial}
          nota={`Las tasas judiciales están exentas para personas físicas desde 2015 (Ley 10/2012 art. 4.2.a, tras el RDL 1/2015). El procurador tiene arancel de MÁXIMOS (RD 434/2024): ${formatCurrency(ARANCEL_PROCURA.cuantiaIndeterminada)} para cuantía indeterminada, o más si el divorcio acumula liquidación de bienes con cuantía propia. Los importes de procurador de esta app son orientativos de mercado, no el arancel exacto.`}
        />

        <div className={styles.mainContent}>
          {/* ── Formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tu situación</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de divorcio</label>
              <div className={styles.optionGrid}>
                <button type="button" className={`${styles.optionBtn} ${tipo === 'mutuo_acuerdo_judicial' ? styles.optionActivo : ''}`} onClick={() => handleTipo('mutuo_acuerdo_judicial')} aria-pressed={tipo === 'mutuo_acuerdo_judicial'}>
                  <strong>🤝 Mutuo acuerdo (judicial)</strong>
                  <span className={styles.optionDesc}>Ambos de acuerdo, trámite ante el juzgado. Con o sin hijos.</span>
                </button>
                <button type="button" className={`${styles.optionBtn} ${tipo === 'mutuo_acuerdo_notarial' ? styles.optionActivo : ''}`} onClick={() => handleTipo('mutuo_acuerdo_notarial')} aria-pressed={tipo === 'mutuo_acuerdo_notarial'}>
                  <strong>📄 Mutuo acuerdo (notarial)</strong>
                  <span className={styles.optionDesc}>Ante notario: más rápido y económico. Solo sin hijos menores.</span>
                </button>
                <button type="button" className={`${styles.optionBtn} ${tipo === 'contencioso' ? styles.optionActivo : ''}`} onClick={() => handleTipo('contencioso')} aria-pressed={tipo === 'contencioso'}>
                  <strong>⚔️ Contencioso</strong>
                  <span className={styles.optionDesc}>Sin acuerdo: cada parte con su abogado. Más largo y costoso.</span>
                </button>
              </div>
            </div>

            {tipo !== 'mutuo_acuerdo_notarial' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>¿Hay hijos menores o con discapacidad?</label>
                <div className={styles.switchRow}>
                  <button type="button" className={`${styles.switchBtn} ${!tieneHijos ? styles.switchActivo : ''}`} onClick={() => { setTieneHijos(false); setResultado(null); }} aria-pressed={!tieneHijos}>No</button>
                  <button type="button" className={`${styles.switchBtn} ${tieneHijos ? styles.switchActivo : ''}`} onClick={() => { setTieneHijos(true); setResultado(null); }} aria-pressed={tieneHijos}>Sí</button>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Complejidad patrimonial</label>
              <div className={styles.optionGrid}>
                <button type="button" className={`${styles.optionBtn} ${complejidad === 'sin_bienes' ? styles.optionActivo : ''}`} onClick={() => { setComplejidad('sin_bienes'); setResultado(null); }} aria-pressed={complejidad === 'sin_bienes'}>
                  <strong>Sin bienes comunes</strong>
                  <span className={styles.optionDesc}>Sin propiedades ni patrimonio relevante que repartir</span>
                </button>
                <button type="button" className={`${styles.optionBtn} ${complejidad === 'bienes_simples' ? styles.optionActivo : ''}`} onClick={() => { setComplejidad('bienes_simples'); setResultado(null); }} aria-pressed={complejidad === 'bienes_simples'}>
                  <strong>Bienes simples</strong>
                  <span className={styles.optionDesc}>Una vivienda, cuentas bancarias, vehículo</span>
                </button>
                <button type="button" className={`${styles.optionBtn} ${complejidad === 'bienes_complejos' ? styles.optionActivo : ''}`} onClick={() => { setComplejidad('bienes_complejos'); setResultado(null); }} aria-pressed={complejidad === 'bienes_complejos'}>
                  <strong>Bienes complejos</strong>
                  <span className={styles.optionDesc}>Múltiples propiedades, empresa, inversiones</span>
                </button>
              </div>
            </div>

            <button type="button" className={styles.btn} onClick={handleEstimar}>
              Estimar costes
            </button>
          </div>

          {/* ── Resultados ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Estimación de costes</h2>

            {!resultado ? (
              <p className={styles.placeholder}>Completa los datos y pulsa &laquo;Estimar costes&raquo;</p>
            ) : (
              <div className={styles.resultados}>
                <div className={styles.totalHero}>
                  <div className={styles.totalLabel}>
                    Coste total estimado{resultado.tipo === 'contencioso' ? ' (por cónyuge)' : ''}
                  </div>
                  <div className={styles.totalImporte}>
                    {formatCurrency(resultado.total.min)} – {formatCurrency(resultado.total.max)}
                  </div>
                  <div className={styles.duracion}>
                    Duración estimada: {resultado.duracionMeses.min}–{resultado.duracionMeses.max} meses
                  </div>
                </div>

                <div className={styles.desgloseCard}>
                  <h3 className={styles.desgloseTitle}>Desglose</h3>
                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">👨‍⚖️</span> Abogado</span>
                    <strong>{formatCurrency(resultado.abogado.min)} – {formatCurrency(resultado.abogado.max)}</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">📋</span> Procurador</span>
                    <strong>{resultado.procurador > 0 ? formatCurrency(resultado.procurador) : 'No necesario'}</strong>
                  </div>
                  {resultado.notario > 0 && (
                    <div className={styles.desgloseItem}>
                      <span><span aria-hidden="true">📄</span> Notario</span>
                      <strong>{formatCurrency(resultado.notario)}</strong>
                    </div>
                  )}
                  {resultado.registro > 0 && (
                    <div className={styles.desgloseItem}>
                      <span><span aria-hidden="true">🏢</span> Registro Civil</span>
                      <strong>{formatCurrency(resultado.registro)}</strong>
                    </div>
                  )}
                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">🏛️</span> Tasas judiciales</span>
                    <strong>Exento</strong>
                  </div>
                </div>

                {resultado.notas.length > 0 && (
                  <div className={styles.notasCard}>
                    <h3 className={styles.desgloseTitle}>Notas importantes</h3>
                    {resultado.notas.map((nota, i) => (
                      <p key={i} className={styles.nota}>
                        <span aria-hidden="true">ℹ️</span> {nota}
                      </p>
                    ))}
                  </div>
                )}

                {resultado.tipo === 'contencioso' && (
                  <div className={styles.alertCard}>
                    <span aria-hidden="true">⚠️</span>
                    <p>
                      <strong>En un divorcio contencioso, cada cónyuge paga sus propios gastos.</strong> El coste
                      total familiar puede ser el doble de lo mostrado. Además, si hay condena en costas,
                      el perdedor puede pagar también los gastos del otro.
                    </p>
                  </div>
                )}

                <div className={styles.comparativaCard}>
                  <h3 className={styles.desgloseTitle}>Comparativa rápida</h3>
                  <div className={styles.comparativaGrid}>
                    <div className={`${styles.comparativaItem} ${resultado.tipo === 'mutuo_acuerdo_notarial' ? styles.comparativaActivo : ''}`}>
                      <strong>Notarial</strong>
                      <span>700 – 2.800 €</span>
                      <span className={styles.comparativaTiempo}>1-2 meses</span>
                    </div>
                    <div className={`${styles.comparativaItem} ${resultado.tipo === 'mutuo_acuerdo_judicial' ? styles.comparativaActivo : ''}`}>
                      <strong>Mutuo acuerdo</strong>
                      <span>750 – 3.750 €</span>
                      <span className={styles.comparativaTiempo}>2-4 meses</span>
                    </div>
                    <div className={`${styles.comparativaItem} ${resultado.tipo === 'contencioso' ? styles.comparativaActivo : ''}`}>
                      <strong>Contencioso</strong>
                      <span>2.000 – 12.800 €</span>
                      <span className={styles.comparativaTiempo}>4-18 meses</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <EducationalSection
          title="Todo sobre los costes del divorcio"
          subtitle="Tipos, requisitos y cómo reducir costes innecesarios"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué tipo de divorcio me conviene?</h2>
            <p>
              Si hay acuerdo entre ambos cónyuges, el <strong>divorcio de mutuo acuerdo</strong> es siempre
              más rápido, económico y menos desgastante. Si además no hay hijos menores, se puede tramitar
              <strong>ante notario</strong> (Ley 15/2015), que es la opción más rápida.
            </p>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Cuánto cobra un abogado por un divorcio en España?</summary>
                <p>Los honorarios del abogado son la partida más importante. En un mutuo acuerdo sin bienes rondan los 500-1.500 € (compartido entre ambos cónyuges); en un contencioso suelen ir de 1.500 a 6.000 € por cónyuge, más si hay patrimonio complejo o peritajes. El procurador se suma aparte (unos 250-800 €). Con ingresos bajo el límite IPREM puedes pedir justicia gratuita.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cuánto cuesta un divorcio notarial?</summary>
                <p>El divorcio notarial (Ley 15/2015) es la vía más rápida y económica, posible solo sin hijos menores ni personas con discapacidad a cargo. El coste total ronda los 700-2.800 €: un único abogado para ambos, la tarifa notarial de la escritura (150-250 €) y la inscripción en el Registro Civil (unos 50 €). No hay procurador ni tasas judiciales.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo compartir abogado en un divorcio de mutuo acuerdo?</summary>
                <p>Sí. En el divorcio de mutuo acuerdo (tanto judicial como notarial), un solo abogado puede representar a ambos cónyuges. Esto reduce significativamente los costes.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cuánto tarda un divorcio de mutuo acuerdo?</summary>
                <p>El notarial puede resolverse en 2-4 semanas. El judicial de mutuo acuerdo suele tardar 2-4 meses, dependiendo del juzgado. El contencioso puede prolongarse 6-18 meses o más.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo pedir justicia gratuita para el divorcio?</summary>
                <p>Sí, si tus ingresos están por debajo del límite IPREM. Cubre abogado y procurador de oficio. Incluso en contencioso, cada parte puede solicitar justicia gratuita independientemente.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué es el convenio regulador?</summary>
                <p>Es el documento donde los cónyuges acuerdan las medidas del divorcio: custodia de hijos, pensión de alimentos, uso de la vivienda, reparto de bienes y pensión compensatoria si procede. Es obligatorio en el divorcio de mutuo acuerdo.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Los costes son orientativos y varían significativamente según la ciudad y el profesional</li>
                <li>No incluye posibles costes de mediación, terapia familiar o valoraciones periciales</li>
                <li>Si hay inmuebles comunes, pueden generarse costes adicionales de escritura y registro</li>
                <li>Consulta siempre con un abogado especializado en derecho de familia</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimador-costes-divorcio')} />
        <ShareCard appName="estimador-costes-divorcio" />
        <Footer appName="estimador-costes-divorcio" />
    </div>
  );
}
