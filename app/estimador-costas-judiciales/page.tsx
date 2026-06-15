'use client';

import { useState } from 'react';
import styles from './EstimadorCostasJudiciales.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoProcedimiento = 'ordinario' | 'verbal' | 'monitorio' | 'cambiario' | 'laboral' | 'contencioso';
type TipoPersona = 'fisica' | 'juridica';

interface ProcedimientoInfo {
  label: string;
  descripcion: string;
  requiereProcurador: boolean;
  requiereAbogado: boolean;
  nota?: string;
}

const PROCEDIMIENTOS: Record<TipoProcedimiento, ProcedimientoInfo> = {
  ordinario: { label: 'Juicio ordinario (> 6.000 €)', descripcion: 'Reclamaciones civiles superiores a 6.000 €', requiereProcurador: true, requiereAbogado: true },
  verbal: { label: 'Juicio verbal (≤ 6.000 €)', descripcion: 'Reclamaciones civiles hasta 6.000 €', requiereProcurador: false, requiereAbogado: false, nota: 'Abogado y procurador obligatorios si la cuantía supera 2.000 €' },
  monitorio: { label: 'Proceso monitorio', descripcion: 'Reclamación de deudas dinerarias documentadas', requiereProcurador: false, requiereAbogado: false, nota: 'Si el deudor se opone y la cuantía supera 2.000 €, se transforma en verbal/ordinario' },
  cambiario: { label: 'Juicio cambiario', descripcion: 'Reclamación de cheques, letras o pagarés', requiereProcurador: true, requiereAbogado: true },
  laboral: { label: 'Procedimiento laboral', descripcion: 'Despidos, reclamación de cantidades, conflictos laborales', requiereProcurador: false, requiereAbogado: false, nota: 'No hay tasas. Abogado recomendable pero no obligatorio. Sin procurador.' },
  contencioso: { label: 'Contencioso-administrativo', descripcion: 'Recursos contra la Administración', requiereProcurador: true, requiereAbogado: true },
};

interface Resultado {
  abogado: { min: number; max: number };
  procurador: number;
  tasas: number;
  perito: number;
  total: { min: number; max: number };
  notas: string[];
}

// ─── Estimación de honorarios ─────────────────────────────────────────────────

function estimarHonorariosAbogado(cuantia: number, tipo: TipoProcedimiento): { min: number; max: number } {
  // Honorarios orientativos basados en criterios orientadores de colegios de abogados
  // Los abogados fijan libremente sus honorarios; estas cifras son medias de mercado

  if (tipo === 'laboral') {
    // Laboral: suelen cobrar por resultado o tramo fijo
    if (cuantia <= 6000) return { min: 600, max: 1500 };
    if (cuantia <= 30000) return { min: 1200, max: 3000 };
    return { min: 2000, max: 5000 };
  }

  if (tipo === 'monitorio') {
    if (cuantia <= 2000) return { min: 200, max: 500 };
    if (cuantia <= 6000) return { min: 400, max: 1000 };
    return { min: 800, max: 2000 };
  }

  // Civil y contencioso: porcentaje decreciente sobre cuantía
  if (cuantia <= 2000) return { min: 400, max: 900 };
  if (cuantia <= 6000) return { min: 600, max: 1500 };
  if (cuantia <= 15000) return { min: 1000, max: 3000 };
  if (cuantia <= 30000) return { min: 1500, max: 4500 };
  if (cuantia <= 60000) return { min: 2500, max: 7000 };
  if (cuantia <= 150000) return { min: 4000, max: 12000 };
  if (cuantia <= 600000) return { min: 6000, max: 20000 };
  return { min: 10000, max: 35000 };
}

function estimarArancelesProcurador(cuantia: number): number {
  // Aranceles regulados por RD 1373/2003 (orientativos, tarifas reducidas habituales)
  if (cuantia <= 2000) return 150;
  if (cuantia <= 6000) return 250;
  if (cuantia <= 15000) return 450;
  if (cuantia <= 30000) return 700;
  if (cuantia <= 60000) return 1100;
  if (cuantia <= 150000) return 1800;
  if (cuantia <= 600000) return 3000;
  return 4500;
}

function estimarTasas(cuantia: number, tipo: TipoProcedimiento, persona: TipoPersona): number {
  // Desde 2015, las personas físicas están exentas de tasas judiciales
  // Solo pagan personas jurídicas (empresas, asociaciones)
  if (persona === 'fisica') return 0;
  if (tipo === 'laboral') return 0;

  // Personas jurídicas: cuota fija + variable
  let fija = 0;
  if (tipo === 'verbal') fija = 150;
  else if (tipo === 'ordinario') fija = 300;
  else if (tipo === 'monitorio') fija = 100;
  else if (tipo === 'cambiario') fija = 150;
  else if (tipo === 'contencioso') fija = 200;

  // Variable: 0,10% sobre la cuantía (máximo 10.000 €)
  const variable = Math.min(cuantia * 0.001, 10000);

  return Math.round(fija + variable);
}

function calcular(
  cuantia: number,
  tipo: TipoProcedimiento,
  persona: TipoPersona,
  incluirPerito: boolean,
): Resultado {
  const info = PROCEDIMIENTOS[tipo];
  const abogado = estimarHonorariosAbogado(cuantia, tipo);
  const notas: string[] = [];

  // Procurador
  let procurador = 0;
  if (info.requiereProcurador) {
    procurador = estimarArancelesProcurador(cuantia);
  } else if (tipo === 'verbal' && cuantia > 2000) {
    procurador = estimarArancelesProcurador(cuantia);
    notas.push('Cuantía > 2.000 €: procurador obligatorio en juicio verbal');
  }

  // Tasas
  const tasas = estimarTasas(cuantia, tipo, persona);
  if (persona === 'fisica' && tipo !== 'laboral') {
    notas.push('Las personas físicas están exentas de tasas judiciales desde 2015');
  }

  // Perito
  let perito = 0;
  if (incluirPerito) {
    if (cuantia <= 15000) perito = 600;
    else if (cuantia <= 60000) perito = 1200;
    else if (cuantia <= 150000) perito = 2500;
    else perito = 4000;
  }

  if (info.nota) notas.push(info.nota);

  return {
    abogado,
    procurador,
    tasas,
    perito,
    total: {
      min: abogado.min + procurador + tasas + perito,
      max: abogado.max + procurador + tasas + perito,
    },
    notas,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorCostasJudicialesPage() {
  const [tipo, setTipo] = useState<TipoProcedimiento>('ordinario');
  const [persona, setPersona] = useState<TipoPersona>('fisica');
  const [cuantia, setCuantia] = useState('');
  const [incluirPerito, setIncluirPerito] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleEstimar = () => {
    const val = parseFloat(cuantia.replace(/\./g, '').replace(',', '.')) || 0;
    if (val <= 0) return;
    setResultado(calcular(val, tipo, persona, incluirPerito));
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
          <h1 className={styles.title}>Estimador de Costas Judiciales</h1>
          <p className={styles.subtitle}>
            Cuánto puede costar un procedimiento judicial en España: abogado, procurador, tasas y peritos
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" context="estimador-costas-judiciales" />

        <div className={styles.mainContent}>
          {/* ── Formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Datos del procedimiento</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de procedimiento</label>
              <div className={styles.optionGrid}>
                {(Object.entries(PROCEDIMIENTOS) as [TipoProcedimiento, ProcedimientoInfo][]).map(([id, info]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.optionBtn} ${tipo === id ? styles.optionActivo : ''}`}
                    onClick={() => { setTipo(id); setResultado(null); }}
                    aria-pressed={tipo === id}
                  >
                    <strong>{info.label}</strong>
                    <span className={styles.optionDesc}>{info.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿Quién eres?</label>
              <div className={styles.switchRow}>
                <button type="button" className={`${styles.switchBtn} ${persona === 'fisica' ? styles.switchActivo : ''}`} onClick={() => { setPersona('fisica'); setResultado(null); }}>
                  Persona física
                </button>
                <button type="button" className={`${styles.switchBtn} ${persona === 'juridica' ? styles.switchActivo : ''}`} onClick={() => { setPersona('juridica'); setResultado(null); }}>
                  Empresa / persona jurídica
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="cuantia">Cuantía del pleito (€)</label>
              <input
                id="cuantia"
                type="text"
                inputMode="decimal"
                className={styles.input}
                placeholder="Ej: 15000"
                value={cuantia}
                onChange={e => { setCuantia(e.target.value); setResultado(null); }}
              />
              <p className={styles.hint}>Importe que se reclama o valor económico del litigio</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿Necesitarás perito?</label>
              <div className={styles.switchRow}>
                <button type="button" className={`${styles.switchBtn} ${!incluirPerito ? styles.switchActivo : ''}`} onClick={() => { setIncluirPerito(false); setResultado(null); }}>
                  No
                </button>
                <button type="button" className={`${styles.switchBtn} ${incluirPerito ? styles.switchActivo : ''}`} onClick={() => { setIncluirPerito(true); setResultado(null); }}>
                  Sí
                </button>
              </div>
            </div>

            <button type="button" className={styles.btn} onClick={handleEstimar}>
              Estimar costas
            </button>
          </div>

          {/* ── Resultados ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Estimación de costes</h2>

            {!resultado ? (
              <p className={styles.placeholder}>Completa los datos y pulsa &laquo;Estimar costas&raquo;</p>
            ) : (
              <div className={styles.resultados}>
                <div className={styles.totalHero}>
                  <div className={styles.totalLabel}>Coste total estimado</div>
                  <div className={styles.totalImporte}>
                    {formatCurrency(resultado.total.min)} – {formatCurrency(resultado.total.max)}
                  </div>
                </div>

                <div className={styles.desgloseCard}>
                  <h3 className={styles.desgloseTitle}>Desglose</h3>

                  <div className={styles.desgloseItem}>
                    <span>👨‍⚖️ Abogado</span>
                    <strong>{formatCurrency(resultado.abogado.min)} – {formatCurrency(resultado.abogado.max)}</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>📋 Procurador</span>
                    <strong>{resultado.procurador > 0 ? formatCurrency(resultado.procurador) : 'No requerido'}</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>🏛️ Tasas judiciales</span>
                    <strong>{resultado.tasas > 0 ? formatCurrency(resultado.tasas) : 'Exento'}</strong>
                  </div>
                  {incluirPerito && (
                    <div className={styles.desgloseItem}>
                      <span>🔍 Perito</span>
                      <strong>{formatCurrency(resultado.perito)}</strong>
                    </div>
                  )}
                </div>

                {resultado.notas.length > 0 && (
                  <div className={styles.notasCard}>
                    <h3 className={styles.desgloseTitle}>Notas</h3>
                    {resultado.notas.map((nota, i) => (
                      <p key={i} className={styles.nota}>
                        <span aria-hidden="true">ℹ️</span> {nota}
                      </p>
                    ))}
                  </div>
                )}

                <div className={styles.infoCard}>
                  <span aria-hidden="true">💡</span>
                  <p>
                    Si pierdes el juicio, podrías ser condenado a pagar también las costas de la parte contraria
                    (abogado y procurador del ganador), salvo excepciones.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <EducationalSection
          title="📚 ¿Cómo funcionan las costas judiciales?"
          subtitle="Conceptos clave antes de ir a juicio"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué son las costas procesales?</h2>
            <p>
              Son los gastos derivados de un procedimiento judicial. Incluyen los honorarios de abogado,
              aranceles de procurador, tasas judiciales (si aplican) y gastos periciales. En España,
              el juez puede condenar a la parte perdedora a pagar las costas de la parte ganadora
              (<strong>principio de vencimiento</strong>, art. 394 LEC).
            </p>

            <div className={styles.conceptosGrid}>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">👨‍⚖️</span>
                <strong>Abogado</strong>
                <p>Honorarios libres. Los Colegios de Abogados publican criterios orientadores, pero cada profesional fija sus tarifas.</p>
              </div>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">📋</span>
                <strong>Procurador</strong>
                <p>Aranceles regulados por RD 1373/2003. Representa al litigante ante el juzgado. Obligatorio en la mayoría de procedimientos.</p>
              </div>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">🏛️</span>
                <strong>Tasas judiciales</strong>
                <p>Desde 2015, las personas físicas están exentas. Solo pagan empresas y personas jurídicas.</p>
              </div>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">🔍</span>
                <strong>Perito</strong>
                <p>Informes técnicos especializados. No siempre necesario, pero imprescindible en casos de daños, construcción, etc.</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Puedo reclamar sin abogado?</summary>
                <p>En juicios verbales de hasta 2.000 € y en procesos monitorios, no es obligatorio. Sin embargo, es muy recomendable para proteger tus derechos. En el resto de procedimientos civiles es obligatorio.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si pierdo el juicio?</summary>
                <p>El juez puede condenarte en costas: tendrías que pagar tus propios gastos más los de la parte contraria (abogado y procurador del ganador). No es automático en todos los casos, pero es lo habitual.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo pedir justicia gratuita?</summary>
                <p>Sí, si cumples los requisitos de ingresos (por debajo de determinados múltiplos del IPREM según tu situación familiar). Cubre abogado, procurador, perito y exención de depósitos.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Los honorarios de abogado son orientativos: cada profesional fija sus propios precios</li>
                <li>Los aranceles de procurador están regulados pero tienen márgenes de aplicación</li>
                <li>Esta estimación NO incluye gastos de ejecución si la sentencia no se cumple voluntariamente</li>
                <li>Consulta siempre con un abogado antes de iniciar cualquier procedimiento</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimador-costas-judiciales')} />
        <ShareCard appName="estimador-costas-judiciales" />
        <Footer appName="estimador-costas-judiciales" />
    </div>
  );
}
