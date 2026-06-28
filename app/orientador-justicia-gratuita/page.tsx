'use client';

import { useState } from 'react';
import styles from './OrientadorJusticiaGratuita.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos IPREM 2026 ────────────────────────────────────────────────────────

// IPREM 2026: 600 €/mes (7.200 €/año en 12 pagas, 8.400 €/año en 14 pagas)
// Fuente: RDL IPREM 2026 (revalorizado ~3,3% desde 2025)
const IPREM_MENSUAL = 600;
const IPREM_ANUAL_14 = IPREM_MENSUAL * 14; // 8.400 €

// Umbrales de ingresos brutos anuales para justicia gratuita (Ley 1/1996, art. 3)
// Base: 2× IPREM anual (14 pagas) = 16.800 €
// Se incrementa por cada miembro adicional de la unidad familiar
const UMBRALES = {
  persona_sola: 2 * IPREM_ANUAL_14,           // 16.800 €
  familia_2: 2.5 * IPREM_ANUAL_14,            // 21.000 €
  familia_3: 3 * IPREM_ANUAL_14,              // 25.200 €
  familia_4_o_mas: 3.5 * IPREM_ANUAL_14,      // 29.400 €
};

// Casos con acceso automático (sin verificación de ingresos)
const ACCESO_AUTOMATICO = [
  { id: 'violencia', label: 'Víctima de violencia de género', ley: 'LO 1/2004' },
  { id: 'terrorismo', label: 'Víctima de terrorismo', ley: 'Ley 29/2011' },
  { id: 'trata', label: 'Víctima de trata de seres humanos', ley: 'Ley 1/1996 art. 2.g' },
  { id: 'menores', label: 'Menores de edad víctimas de abuso o maltrato', ley: 'LO 8/2021' },
  { id: 'discapacidad', label: 'Persona con discapacidad intelectual ≥ 33% (víctima)', ley: 'Ley 1/1996 art. 2.h' },
  { id: 'accidente', label: 'Víctima de accidente con secuelas graves permanentes', ley: 'Ley 1/1996 art. 2.f' },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TamanioFamilia = 'persona_sola' | 'familia_2' | 'familia_3' | 'familia_4_o_mas';

interface Resultado {
  elegible: boolean;
  motivo: string;
  umbral: number;
  ingresos: number;
  margen?: number;
  esAutomatico: boolean;
  prestaciones: string[];
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function evaluar(
  ingresosBrutos: number,
  tamanio: TamanioFamilia,
  casoAutomatico: string | null,
): Resultado {
  const prestaciones = [
    'Abogado de oficio (turno de oficio)',
    'Procurador de oficio',
    'Exención de tasas judiciales y depósitos',
    'Asistencia pericial gratuita',
    'Reducciones en aranceles notariales y registrales',
    'Obtención gratuita de copias, testimonios y actas notariales',
    'Inserción gratuita de anuncios o edictos',
  ];

  // Acceso automático
  if (casoAutomatico) {
    const caso = ACCESO_AUTOMATICO.find(c => c.id === casoAutomatico);
    return {
      elegible: true,
      motivo: `Acceso automático por ${caso?.label.toLowerCase()} (${caso?.ley})`,
      umbral: 0,
      ingresos: ingresosBrutos,
      esAutomatico: true,
      prestaciones,
    };
  }

  const umbral = UMBRALES[tamanio];

  if (ingresosBrutos <= umbral) {
    return {
      elegible: true,
      motivo: `Tus ingresos brutos anuales (${formatCurrency(ingresosBrutos)}) están por debajo del umbral de ${formatCurrency(umbral)} para tu unidad familiar.`,
      umbral,
      ingresos: ingresosBrutos,
      margen: umbral - ingresosBrutos,
      esAutomatico: false,
      prestaciones,
    };
  }

  // Margen del 10%: entre 2× y 2.2× se puede conceder excepcionalmente
  const umbralFlexible = umbral * 1.1;
  if (ingresosBrutos <= umbralFlexible) {
    return {
      elegible: true,
      motivo: `Tus ingresos superan ligeramente el umbral, pero la Comisión de Asistencia Jurídica Gratuita podría concedértelo excepcionalmente (margen del 10%). No es automático.`,
      umbral,
      ingresos: ingresosBrutos,
      esAutomatico: false,
      prestaciones,
    };
  }

  return {
    elegible: false,
    motivo: `Tus ingresos brutos anuales (${formatCurrency(ingresosBrutos)}) superan el umbral de ${formatCurrency(umbral)} para tu unidad familiar.`,
    umbral,
    ingresos: ingresosBrutos,
    esAutomatico: false,
    prestaciones: [],
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorJusticiaGratuitaPage() {
  const [ingresos, setIngresos] = useState('');
  const [tamanio, setTamanio] = useState<TamanioFamilia>('persona_sola');
  const [casoAutomatico, setCasoAutomatico] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleEvaluar = () => {
    const val = parseFloat(ingresos.replace(/\./g, '').replace(',', '.')) || 0;
    setResultado(evaluar(val, tamanio, casoAutomatico));
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🏛️</span>
          <h1 className={styles.title}>Orientador de Justicia Gratuita</h1>
          <p className={styles.subtitle}>
            Comprueba si cumples los requisitos para acceder a abogado y procurador de oficio en España (2026)
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" context="orientador-justicia-gratuita" />

        <div className={styles.mainContent}>
          {/* ── Formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tu situación</h2>

            {/* Caso automático */}
            <div className={styles.formGroup}>
              <label className={styles.label}>¿Te encuentras en alguna de estas situaciones?</label>
              <div className={styles.optionGrid}>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${casoAutomatico === null ? styles.optionActivo : ''}`}
                  onClick={() => { setCasoAutomatico(null); setResultado(null); }}
                  aria-pressed={casoAutomatico === null}
                >
                  Ninguna de las siguientes
                </button>
                {ACCESO_AUTOMATICO.map(caso => (
                  <button
                    key={caso.id}
                    type="button"
                    className={`${styles.optionBtn} ${casoAutomatico === caso.id ? styles.optionActivo : ''}`}
                    onClick={() => { setCasoAutomatico(caso.id); setResultado(null); }}
                    aria-pressed={casoAutomatico === caso.id}
                  >
                    {caso.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Si no es automático, pedir ingresos */}
            {casoAutomatico === null && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tamaño de tu unidad familiar</label>
                  <div className={styles.optionGrid}>
                    {([
                      { id: 'persona_sola' as const, label: 'Persona sola', umbral: UMBRALES.persona_sola },
                      { id: 'familia_2' as const, label: '2 miembros', umbral: UMBRALES.familia_2 },
                      { id: 'familia_3' as const, label: '3 miembros', umbral: UMBRALES.familia_3 },
                      { id: 'familia_4_o_mas' as const, label: '4 o más miembros', umbral: UMBRALES.familia_4_o_mas },
                    ]).map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`${styles.optionBtn} ${tamanio === opt.id ? styles.optionActivo : ''}`}
                        onClick={() => { setTamanio(opt.id); setResultado(null); }}
                        aria-pressed={tamanio === opt.id}
                      >
                        {opt.label}
                        <span className={styles.optionDesc}>Umbral: {formatCurrency(opt.umbral)}/año</span>
                      </button>
                    ))}
                  </div>
                  <p className={styles.hint}>Incluye cónyuge/pareja e hijos menores o dependientes que convivan contigo</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ingresos">Ingresos brutos anuales de la unidad familiar (€)</label>
                  <input
                    id="ingresos"
                    type="text"
                    inputMode="decimal"
                    className={styles.input}
                    placeholder="Ej: 14000"
                    value={ingresos}
                    onChange={e => { setIngresos(e.target.value); setResultado(null); }}
                  />
                  <p className={styles.hint}>Suma de todos los ingresos brutos anuales: nóminas, pensiones, prestaciones, rentas, etc.</p>
                </div>
              </>
            )}

            <button type="button" className={styles.btn} onClick={handleEvaluar}>
              Comprobar elegibilidad
            </button>
          </div>

          {/* ── Resultados ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Resultado</h2>

            {!resultado ? (
              <p className={styles.placeholder}>Completa los datos y pulsa &laquo;Comprobar elegibilidad&raquo;</p>
            ) : (
              <div className={styles.resultados}>
                <div className={resultado.elegible ? styles.resultHeroPositivo : styles.resultHeroNegativo}>
                  <div className={styles.resultIcon} aria-hidden="true">
                    {resultado.elegible ? '✅' : '❌'}
                  </div>
                  <div className={styles.resultTitulo}>
                    {resultado.elegible ? 'Probablemente sí tienes derecho' : 'Probablemente no cumples los requisitos'}
                  </div>
                  <p className={styles.resultMotivo}>{resultado.motivo}</p>
                </div>

                {resultado.elegible && !resultado.esAutomatico && resultado.margen !== undefined && (
                  <div className={styles.margenCard}>
                    <span aria-hidden="true">📊</span>
                    <div>
                      <strong>Margen disponible</strong>
                      <p>Tus ingresos están {formatCurrency(resultado.margen)} por debajo del umbral</p>
                    </div>
                  </div>
                )}

                {/* Tabla de umbrales */}
                <div className={styles.umbralCard}>
                  <h3 className={styles.desgloseTitle}>Umbrales de ingresos 2026 (IPREM: {formatCurrency(IPREM_MENSUAL)}/mes)</h3>
                  <div className={styles.umbralGrid}>
                    {([
                      { label: 'Persona sola', umbral: UMBRALES.persona_sola, id: 'persona_sola' },
                      { label: '2 miembros', umbral: UMBRALES.familia_2, id: 'familia_2' },
                      { label: '3 miembros', umbral: UMBRALES.familia_3, id: 'familia_3' },
                      { label: '4+ miembros', umbral: UMBRALES.familia_4_o_mas, id: 'familia_4_o_mas' },
                    ]).map(u => (
                      <div key={u.id} className={`${styles.umbralItem} ${tamanio === u.id ? styles.umbralActivo : ''}`}>
                        <span className={styles.umbralLabel}>{u.label}</span>
                        <strong>{formatCurrency(u.umbral)}/año</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prestaciones cubiertas */}
                {resultado.elegible && (
                  <div className={styles.prestacionesCard}>
                    <h3 className={styles.desgloseTitle}>Prestaciones cubiertas</h3>
                    <ul className={styles.prestacionesList}>
                      {resultado.prestaciones.map((p, i) => (
                        <li key={i}>
                          <span aria-hidden="true">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!resultado.elegible && (
                  <div className={styles.alternativasCard}>
                    <span aria-hidden="true">💡</span>
                    <div>
                      <strong>Alternativas</strong>
                      <p>Aunque no tengas derecho a justicia gratuita, puedes buscar abogados con primera consulta gratuita, servicios de orientación jurídica gratuita del Colegio de Abogados, o mediación como alternativa al juicio.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <EducationalSection
          title="Todo sobre la justicia gratuita"
          subtitle="Requisitos, trámites y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es la justicia gratuita?</h2>
            <p>
              Es un derecho constitucional (art. 119 CE) que garantiza que nadie se quede sin acceso a la
              justicia por falta de recursos económicos. La <strong>Ley 1/1996 de Asistencia Jurídica Gratuita</strong>
              regula quién puede acceder y qué prestaciones incluye.
            </p>

            <div className={styles.stepGuide}>
              <h3>¿Cómo se solicita?</h3>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Acude al Colegio de Abogados</strong>
                  <p>Del partido judicial donde se tramitará tu caso. También puedes hacerlo en el Servicio de Orientación Jurídica (SOJ) del juzgado.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Rellena el formulario y aporta documentación</strong>
                  <p>DNI, declaración de la renta, certificado de empadronamiento, libro de familia y documentación del caso.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Designación provisional inmediata</strong>
                  <p>El Colegio de Abogados designa abogado y procurador de forma provisional en un máximo de 15 días.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Resolución definitiva</strong>
                  <p>La Comisión de Asistencia Jurídica Gratuita resuelve en un máximo de 30 días. Si no hay respuesta, se entiende concedida (silencio positivo).</p>
                </div>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Puedo elegir abogado si me lo asignan de oficio?</summary>
                <p>No. Se asigna por turno del Colegio de Abogados. Sin embargo, si hay un conflicto justificado, puedes solicitar un cambio de abogado ante el Colegio.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Y si pierdo el juicio? ¿Tengo que devolver algo?</summary>
                <p>Si pierdes y eres condenado en costas, no tienes que pagar las costas de la otra parte (las asume el Estado). Sin embargo, si tus circunstancias económicas mejoran en los 3 años siguientes, podrían pedirte que devuelvas las prestaciones recibidas.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Sirve para cualquier tipo de procedimiento?</summary>
                <p>Sí: civil, penal, laboral, contencioso-administrativo, mercantil. También cubre mediación, arbitraje y procedimientos extrajudiciales cuando lo prevea la ley.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante</strong>
              </div>
              <ul className={styles.warningList}>
                <li>El IPREM y los umbrales se actualizan anualmente — los datos mostrados son para 2026</li>
                <li>La decisión final corresponde a la Comisión de Asistencia Jurídica Gratuita, no a esta herramienta</li>
                <li>Si declaras datos falsos para obtener justicia gratuita, puedes incurrir en responsabilidad penal</li>
                <li>Los autónomos deben acreditar ingresos netos, no facturación bruta</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-justicia-gratuita')} />
        <ShareCard appName="orientador-justicia-gratuita" />
        <Footer appName="orientador-justicia-gratuita" />
    </div>
  );
}
