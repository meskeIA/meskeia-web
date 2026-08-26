'use client';

import { useState } from 'react';
import styles from './EstimadorCostasJudiciales.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, DataReference,
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  ARANCEL_PROCURA, COSTAS_JUDICIALES_META, PORCENTAJES_IVA, UMBRALES_LEC,
} from '@/data/fiscal';
import {
  calcular, PROCEDIMIENTOS,
  type ProcedimientoInfo, type Resultado, type TipoPersona, type TipoProcedimiento,
} from './motor';

export default function EstimadorCostasJudicialesPage() {
  const [tipo, setTipo] = useState<TipoProcedimiento>('ordinario');
  const [persona, setPersona] = useState<TipoPersona>('fisica');
  const [cuantia, setCuantia] = useState('');
  const [indeterminada, setIndeterminada] = useState(false);
  const [incluirPerito, setIncluirPerito] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');

  const reiniciar = () => { setResultado(null); setError(''); };

  const handleEstimar = () => {
    if (indeterminada) {
      setError('');
      setResultado(calcular({ cuantia: null, tipo, persona, incluirPerito }));
      return;
    }

    const val = parseSpanishNumber(cuantia);
    if (isNaN(val)) {
      setResultado(null);
      setError('Escribe la cuantía como un número: 15.000 o 15000. Si no la conoces, marca «Cuantía indeterminada».');
      return;
    }
    if (val <= 0) {
      setResultado(null);
      setError('La cuantía del pleito tiene que ser mayor que 0 €. Si no se puede determinar, marca «Cuantía indeterminada».');
      return;
    }

    setError('');
    setResultado(calcular({ cuantia: val, tipo, persona, incluirPerito }));
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
          <h1 className={styles.title}>Estimador de Costas Judiciales</h1>
          <p className={styles.subtitle}>
            Cuánto puede costar un procedimiento judicial en España: abogado, procurador, tasas, peritos e IVA
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" context="estimador-costas-judiciales" />
        <DataReference
          normativa="Costas judiciales 2025-2026"
          fuente={COSTAS_JUDICIALES_META.fuente}
          verificado={COSTAS_JUDICIALES_META.verificado}
          urlOficial={COSTAS_JUDICIALES_META.urlOficial}
          nota={COSTAS_JUDICIALES_META.nota}
        />

        <div className={styles.mainContent}>
          {/* ── Formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Datos del procedimiento</h2>

            <div className={styles.formGroup} role="group" aria-labelledby="lbl-procedimiento">
              <span className={styles.label} id="lbl-procedimiento">Tipo de procedimiento</span>
              <div className={styles.optionGrid}>
                {(Object.entries(PROCEDIMIENTOS) as [TipoProcedimiento, ProcedimientoInfo][]).map(([id, info]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.optionBtn} ${tipo === id ? styles.optionActivo : ''}`}
                    onClick={() => { setTipo(id); reiniciar(); }}
                    aria-pressed={tipo === id}
                  >
                    <strong>{info.label}</strong>
                    <span className={styles.optionDesc}>{info.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup} role="group" aria-labelledby="lbl-persona">
              <span className={styles.label} id="lbl-persona">¿Quién eres?</span>
              <div className={styles.switchRow}>
                <button type="button" className={`${styles.switchBtn} ${persona === 'fisica' ? styles.switchActivo : ''}`} onClick={() => { setPersona('fisica'); reiniciar(); }} aria-pressed={persona === 'fisica'}>
                  Persona física
                </button>
                <button type="button" className={`${styles.switchBtn} ${persona === 'juridica' ? styles.switchActivo : ''}`} onClick={() => { setPersona('juridica'); reiniciar(); }} aria-pressed={persona === 'juridica'}>
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
                disabled={indeterminada}
                aria-describedby="hint-cuantia"
                aria-invalid={error !== ''}
                onChange={e => { setCuantia(e.target.value); reiniciar(); }}
              />
              <p className={styles.hint} id="hint-cuantia">Importe que se reclama o valor económico del litigio</p>
              <div className={styles.switchRow}>
                <button
                  type="button"
                  className={`${styles.switchBtn} ${indeterminada ? styles.switchActivo : ''}`}
                  onClick={() => { setIndeterminada(!indeterminada); reiniciar(); }}
                  aria-pressed={indeterminada}
                >
                  Cuantía indeterminada
                </button>
              </div>
              {error && (
                <p className={styles.errorMsg} role="alert">
                  <span aria-hidden="true">⚠️</span> {error}
                </p>
              )}
            </div>

            <div className={styles.formGroup} role="group" aria-labelledby="lbl-perito">
              <span className={styles.label} id="lbl-perito">¿Necesitarás perito?</span>
              <div className={styles.switchRow}>
                <button type="button" className={`${styles.switchBtn} ${!incluirPerito ? styles.switchActivo : ''}`} onClick={() => { setIncluirPerito(false); reiniciar(); }} aria-pressed={!incluirPerito}>
                  No
                </button>
                <button type="button" className={`${styles.switchBtn} ${incluirPerito ? styles.switchActivo : ''}`} onClick={() => { setIncluirPerito(true); reiniciar(); }} aria-pressed={incluirPerito}>
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
                  <div className={styles.totalLabel}>Coste total estimado (IVA incluido)</div>
                  <div className={styles.totalImporte}>
                    {formatCurrency(resultado.total.min)} – {formatCurrency(resultado.total.max)}
                  </div>
                </div>

                <div className={styles.desgloseCard}>
                  <h3 className={styles.desgloseTitle}>Desglose</h3>

                  <div className={styles.desgloseItem}>
                    <span>
                      <span aria-hidden="true">👨‍⚖️</span> Abogado
                      {resultado.abogadoOpcional && <span className={styles.optionDesc}> (no preceptivo)</span>}
                    </span>
                    <strong>{formatCurrency(resultado.abogado.min)} – {formatCurrency(resultado.abogado.max)}</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">📋</span> Procurador</span>
                    <strong>{resultado.procurador > 0 ? formatCurrency(resultado.procurador) : 'No requerido'}</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">🏛️</span> Tasas judiciales</span>
                    <strong>{resultado.tasas > 0 ? formatCurrency(resultado.tasas) : 'Exento'}</strong>
                  </div>
                  {incluirPerito && (
                    <div className={styles.desgloseItem}>
                      <span><span aria-hidden="true">🔍</span> Perito</span>
                      <strong>{formatCurrency(resultado.perito)}</strong>
                    </div>
                  )}
                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">🧾</span> IVA ({PORCENTAJES_IVA.general} %)</span>
                    <strong>{formatCurrency(resultado.iva.min)} – {formatCurrency(resultado.iva.max)}</strong>
                  </div>
                </div>

                <div className={styles.notasCard}>
                  <h3 className={styles.desgloseTitle}>Si te condenan en costas</h3>
                  <p className={styles.nota}>
                    <span aria-hidden="true">⚖️</span> El art. 394.3 LEC limita lo que pagarías de la
                    parte contraria por abogado y demás profesionales no sujetos a arancel a un{' '}
                    <strong>tercio de la cuantía del proceso</strong>: en tu caso,{' '}
                    <strong>{formatCurrency(resultado.limiteCostas)}</strong>
                    {resultado.cuantiaIndeterminada && ` (la pretensión inestimable se valora en ${formatCurrency(UMBRALES_LEC.valorPretensionInestimable)})`}.
                    {resultado.limiteCostasMuerde
                      ? ' Ese tope está por debajo del máximo estimado del abogado, así que aquí sí muerde.'
                      : ' Con esta cuantía el tope queda por encima del máximo estimado, así que no llega a aplicarse.'}
                  </p>
                  <p className={styles.nota}>
                    <span aria-hidden="true">ℹ️</span> El tope no rige si el tribunal declara la temeridad
                    del condenado, y los aranceles del procurador quedan fuera de él por estar sujetos a arancel.
                  </p>
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
                    El arancel del procurador es de <strong>máximos</strong> (RD 434/2024): puede cobrar
                    menos, nunca más. Los honorarios de abogado son libres y la horquilla es una estimación
                    de mercado, no una tarifa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <EducationalSection
          title="¿Cómo funcionan las costas judiciales?"
          subtitle="Conceptos clave antes de ir a juicio"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué son las costas procesales?</h2>
            <p>
              Son los gastos derivados de un procedimiento judicial. Incluyen los honorarios de abogado,
              aranceles de procurador, tasas judiciales (si aplican), gastos periciales y el IVA que
              gravan esos servicios profesionales. En España, el juez puede condenar a la parte perdedora
              a pagar las costas de la parte ganadora (<strong>principio de vencimiento</strong>, art. 394 LEC).
            </p>

            <div className={styles.conceptosGrid}>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">👨‍⚖️</span>
                <strong>Abogado</strong>
                <p>Honorarios libres desde la Ley 25/2009: ningún baremo los fija. Las cifras de esta app son estimaciones de mercado y cada profesional pone su precio.</p>
              </div>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">📋</span>
                <strong>Procurador</strong>
                <p>Arancel de máximos del RD 434/2024, en vigor desde mayo de 2024, que derogó el antiguo RD 1373/2003. Tope de {formatCurrency(ARANCEL_PROCURA.topeGlobalPorAsunto)} por profesional y asunto.</p>
              </div>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">🏛️</span>
                <strong>Tasas judiciales</strong>
                <p>Solo las paga la persona jurídica: la física está exenta desde 2015. Son cuotas fijas; la parte proporcional a la cuantía se anuló en 2016.</p>
              </div>
              <div className={styles.conceptoCard}>
                <span className={styles.conceptoIcono} aria-hidden="true">🔍</span>
                <strong>Perito</strong>
                <p>Informes técnicos especializados. No siempre necesario, pero imprescindible en casos de daños, construcción, etc.</p>
              </div>
            </div>

            <h2>El límite del tercio (art. 394.3 LEC)</h2>
            <p>
              Perder el pleito no significa pagar sin techo lo que la contraria haya gastado en abogado.
              El art. 394.3 LEC limita esa parte —abogado y demás profesionales <em>no sujetos a tarifa o
              arancel</em>— a <strong>un tercio de la cuantía del proceso</strong> por cada litigante que
              haya obtenido la condena en costas. En un verbal de 2.000 € el tope son 666,67 €, por debajo
              de lo que costaría el abogado del contrario. Dos matices que suelen omitirse:
            </p>
            <ul className={styles.warningList}>
              <li>El tope <strong>no se aplica</strong> si el tribunal declara la temeridad del condenado en costas.</li>
              <li>Los aranceles del procurador <strong>quedan fuera</strong> del tope, precisamente por estar sujetos a arancel.</li>
              <li>Si la pretensión es inestimable, a estos solos efectos se valora en {formatCurrency(UMBRALES_LEC.valorPretensionInestimable)}, salvo que el tribunal disponga otra cosa por la complejidad del asunto.</li>
            </ul>

            <h2>El IVA no es opcional</h2>
            <p>
              Los honorarios de abogado, los aranceles de procurador y el informe pericial son servicios
              profesionales sujetos al tipo general del <strong>{PORCENTAJES_IVA.general} %</strong> (Ley 37/1992).
              Para una persona física es coste real y no recuperable; una empresa que pueda deducirse el IVA
              soportado debe mirar la base, no el total. Las tasas judiciales son un tributo y no llevan IVA:
              por eso el {PORCENTAJES_IVA.general} % se aplica sobre abogado + procurador + perito, y no sobre el total.
            </p>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Puedo reclamar sin abogado?</summary>
                <p>En juicios verbales determinados por razón de la cuantía cuando ésta no supere los {formatCurrency(UMBRALES_LEC.sinAbogadoNiProcuradorHasta)} y en la petición inicial del monitorio, no es obligatorio (arts. 23.2.1.º y 31.2.1.º LEC). En el orden social puedes comparecer por ti mismo (art. 18 LRJS). Sigue siendo muy recomendable contar con abogado; en el resto de procedimientos civiles es obligatorio.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Verbal u ordinario? El umbral cambió en 2025</summary>
                <p>Desde el 3 de abril de 2025, el juicio verbal cubre las demandas cuya cuantía no exceda de {formatCurrency(UMBRALES_LEC.juicioVerbalHasta)}, no de 6.000 € como antes: lo elevó la Ley Orgánica 1/2025 al reformar el art. 250.2 LEC. Muchos estimadores que circulan por internet siguen con el umbral viejo.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si pierdo el juicio?</summary>
                <p>El juez puede condenarte en costas: pagarías tus propios gastos más los de la parte contraria. No es automático —cabe que el tribunal aprecie serias dudas de hecho o de derecho— y, cuando ocurre, la parte de abogado está limitada al tercio de la cuantía del proceso (art. 394.3 LEC). Desde la LO 1/2025, además, rehusar sin justa causa un medio adecuado de solución de controversias al que se te haya convocado puede costarte las costas aunque ganes.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cuánto se paga de tasa judicial?</summary>
                <p>Las personas físicas no pagan nada desde marzo de 2015. Las personas jurídicas pagan una cuota fija según el procedimiento: 150 € en verbal y cambiario, 300 € en ordinario, 100 € en monitorio y 350 € en el contencioso ordinario. La cuota proporcional a la cuantía que preveía el art. 7.2 de la Ley 10/2012 fue declarada inconstitucional y nula por la STC 140/2016: ya no existe. El monitorio y el verbal de cantidad hasta {formatCurrency(2000)} están además exentos por el objeto (art. 4.1.c).</p>
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
                <li>El arancel del procurador marca un máximo, no un precio: se puede pactar por debajo</li>
                <li>Esta estimación NO incluye gastos de ejecución si la sentencia no se cumple voluntariamente</li>
                <li>Desde el 3 de abril de 2025 muchos asuntos civiles exigen intentar un medio adecuado de solución de controversias antes de demandar (LO 1/2025): ese intento también tiene coste</li>
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
