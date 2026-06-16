'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency } from '@/lib';
import {
  BONIFICACIONES_CCAA_PATRIMONIO,
  FISCAL_PATRIMONIO_META,
  ITSGF_UMBRAL,
  LIMITE_CONJUNTO_PORCENTAJE,
  TOPE_REDUCCION_PORCENTAJE,
  orientarLimiteConjunto,
  type ResultadoOrientacion,
} from '@/data/fiscal';
import styles from './OrientadorLimiteConjuntoPatrimonio.module.css';

// ─── Tipos del formulario ─────────────────────────────────────────────────────

type ModoIRPF = 'individual' | 'conjunta';

interface FormState {
  modo: ModoIRPF;
  ccaaId: string;
  biIrpf: string;
  cuotaIrpf: string;
  cuotaPatrimonio: string;
  patrimonioNeto: string;
}

const ESTADO_INICIAL: FormState = {
  modo: 'individual',
  ccaaId: '',
  biIrpf: '',
  cuotaIrpf: '',
  cuotaPatrimonio: '',
  patrimonioNeto: '',
};

// Convierte un input numérico (con coma o punto decimal) a número
function toNumber(s: string): number {
  if (!s) return 0;
  const limpio = s.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : 0;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorLimiteConjuntoPatrimonioPage() {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [resultado, setResultado] = useState<ResultadoOrientacion | null>(null);
  const [error, setError] = useState<string>('');

  const setCampo = useCallback(<K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setResultado(null);
    setError('');
  }, []);

  const formularioValido = useMemo(() => {
    if (!form.ccaaId) return false;
    if (toNumber(form.biIrpf) <= 0) return false;
    if (toNumber(form.cuotaIrpf) < 0) return false;
    if (toNumber(form.cuotaPatrimonio) <= 0) return false;
    return true;
  }, [form]);

  const onComprobar = useCallback(() => {
    if (!form.ccaaId) {
      setError('Selecciona tu Comunidad Autónoma de residencia.');
      return;
    }
    const bi = toNumber(form.biIrpf);
    const cuotaIrpf = toNumber(form.cuotaIrpf);
    const cuotaPatrimonio = toNumber(form.cuotaPatrimonio);
    const patrimonio = toNumber(form.patrimonioNeto);

    if (bi <= 0) {
      setError('La base imponible del IRPF debe ser mayor que 0.');
      return;
    }
    if (cuotaPatrimonio <= 0) {
      setError('Indica una cuota íntegra del Impuesto sobre el Patrimonio mayor que 0. Si es 0, no hay nada que reducir.');
      return;
    }

    const r = orientarLimiteConjunto({
      ccaaId: form.ccaaId,
      bi_irpf: bi,
      cuota_irpf: cuotaIrpf,
      cuota_patrimonio: cuotaPatrimonio,
      patrimonioNeto: patrimonio,
    });
    setResultado(r);
    setError('');

    // Scroll suave al resultado en móvil
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        document.getElementById('resultado-orientacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [form]);

  const onReset = useCallback(() => {
    setForm(ESTADO_INICIAL);
    setResultado(null);
    setError('');
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>¿Puedes reducir tu cuota del Impuesto sobre el Patrimonio?</h1>
        <p className={styles.subtitle}>
          Orientador del límite conjunto IRPF-Patrimonio (Art. 31 Ley 19/1991). Comprueba en 1 minuto si te conviene
          consultar a tu asesor fiscal o si quedas excluido.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="orientador-limite-conjunto-patrimonio"
      />

      <DataReference
        normativa="Impuesto sobre el Patrimonio 2025"
        fuente={FISCAL_PATRIMONIO_META.fuente}
        verificado={FISCAL_PATRIMONIO_META.verificado}
        urlOficial={FISCAL_PATRIMONIO_META.urlOficial}
        nota={FISCAL_PATRIMONIO_META.nota}
      />

      <LegalNotice />

      <main className={styles.main}>

        {/* Cómo funciona */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}><span aria-hidden="true">📖</span> ¿Qué es el límite conjunto IRPF-Patrimonio?</h2>
          <p className={styles.panelDesc}>
            El Art. 31 de la Ley 19/1991 establece que la suma de tu cuota íntegra del IRPF más la cuota íntegra
            del Impuesto sobre el Patrimonio no puede superar el 60% de tu base imponible del IRPF. Si la supera,
            se reduce la cuota de Patrimonio (con un tope: siempre se paga al menos el 20%). Es una posibilidad
            poco conocida que puede ahorrar miles de euros en patrimonios medios-altos con poca renta declarada.
          </p>

          <div className={styles.comoFuncionaGrid}>
            <div className={styles.comoFuncionaCard}>
              <span className={styles.comoFuncionaIcon} aria-hidden="true">🏛️</span>
              <p className={styles.comoFuncionaTitle}>1. Tu CCAA</p>
              <p className={styles.comoFuncionaText}>
                Si tu CCAA bonifica el Patrimonio al 100%, no pagas cuota → el límite no aplica. Patrimonios
                superiores a {formatCurrency(ITSGF_UMBRAL)} pueden tributar por el ITSGF estatal.
              </p>
            </div>
            <div className={styles.comoFuncionaCard}>
              <span className={styles.comoFuncionaIcon} aria-hidden="true">📊</span>
              <p className={styles.comoFuncionaTitle}>2. La regla del 60%</p>
              <p className={styles.comoFuncionaText}>
                Sumamos cuota IRPF + cuota Patrimonio. Si supera el {Math.round(LIMITE_CONJUNTO_PORCENTAJE * 100)}%
                de tu base imponible IRPF, podrías beneficiarte de la reducción.
              </p>
            </div>
            <div className={styles.comoFuncionaCard}>
              <span className={styles.comoFuncionaIcon} aria-hidden="true">📉</span>
              <p className={styles.comoFuncionaTitle}>3. El tope del 80%</p>
              <p className={styles.comoFuncionaText}>
                La reducción nunca puede superar el {Math.round(TOPE_REDUCCION_PORCENTAJE * 100)}% de tu cuota de
                Patrimonio. Es decir, siempre pagarás al menos el 20%.
              </p>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section className={styles.panel} aria-label="Formulario de orientación">
          <h2 className={styles.panelTitle}><span aria-hidden="true">📋</span> Tus datos</h2>
          <p className={styles.panelDesc}>
            Indica los datos de tu última declaración (o de la que estés preparando). Todos los datos se procesan
            en tu navegador, no se envían a ningún servidor.
          </p>

          <div className={styles.formGrid}>
            {/* Modo IRPF */}
            <div className={`${styles.formGroup} ${styles.full}`}>
              <span className={styles.formLabel}>¿Cómo presentas el IRPF?</span>
              <div className={styles.toggleGroup} role="group" aria-label="Modo de declaración IRPF">
                <button
                  type="button"
                  onClick={() => setCampo('modo', 'individual')}
                  className={`${styles.toggleBtn} ${form.modo === 'individual' ? styles.toggleActive : ''}`}
                  aria-pressed={form.modo === 'individual'}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setCampo('modo', 'conjunta')}
                  className={`${styles.toggleBtn} ${form.modo === 'conjunta' ? styles.toggleActive : ''}`}
                  aria-pressed={form.modo === 'conjunta'}
                >
                  Conjunta (matrimonio)
                </button>
              </div>
              {form.modo === 'conjunta' && (
                <span className={styles.formHint}>
                  En IRPF conjunta: indica los datos sumados de ambos cónyuges. El cálculo exacto requiere
                  prorrateo individual; este orientador es agregado.
                </span>
              )}
            </div>

            {/* CCAA */}
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label htmlFor="ccaa" className={styles.formLabel}>
                Comunidad Autónoma de residencia
              </label>
              <select
                id="ccaa"
                className={styles.formSelect}
                value={form.ccaaId}
                onChange={(e) => setCampo('ccaaId', e.target.value)}
              >
                <option value="">Selecciona tu CCAA…</option>
                {BONIFICACIONES_CCAA_PATRIMONIO.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.bonificacion === 'total' ? ' (bonificación 100%)' : ''}
                    {c.bonificacion === 'parcial' ? ' (bonificación parcial)' : ''}
                  </option>
                ))}
              </select>
              <span className={styles.formHint}>
                Algunas CCAA bonifican el Patrimonio al 100%. En esos casos, el límite conjunto no aplica.
              </span>
            </div>

            {/* BI IRPF */}
            <div className={styles.formGroup}>
              <label htmlFor="bi-irpf" className={styles.formLabel}>
                Base imponible total IRPF (€)
              </label>
              <input
                id="bi-irpf"
                type="text"
                inputMode="decimal"
                className={styles.formInput}
                value={form.biIrpf}
                onChange={(e) => setCampo('biIrpf', e.target.value)}
                placeholder="Ej: 50.000"
              />
              <span className={styles.formHint}>Suma de la base general + base del ahorro.</span>
            </div>

            {/* Cuota IRPF */}
            <div className={styles.formGroup}>
              <label htmlFor="cuota-irpf" className={styles.formLabel}>
                Cuota íntegra IRPF (€)
              </label>
              <input
                id="cuota-irpf"
                type="text"
                inputMode="decimal"
                className={styles.formInput}
                value={form.cuotaIrpf}
                onChange={(e) => setCampo('cuotaIrpf', e.target.value)}
                placeholder="Ej: 10.000"
              />
              <span className={styles.formHint}>Cuota íntegra (suma estatal + autonómica), antes de deducciones.</span>
            </div>

            {/* Cuota Patrimonio */}
            <div className={styles.formGroup}>
              <label htmlFor="cuota-patrimonio" className={styles.formLabel}>
                Cuota íntegra Patrimonio (€)
              </label>
              <input
                id="cuota-patrimonio"
                type="text"
                inputMode="decimal"
                className={styles.formInput}
                value={form.cuotaPatrimonio}
                onChange={(e) => setCampo('cuotaPatrimonio', e.target.value)}
                placeholder="Ej: 8.000"
              />
              <span className={styles.formHint}>
                {form.modo === 'conjunta'
                  ? 'Suma la cuota íntegra de ambos cónyuges (Patrimonio es siempre individual).'
                  : 'Cuota antes de aplicar el límite conjunto. La calcula el programa Patrimonio AEAT.'}
              </span>
            </div>

            {/* Patrimonio neto opcional */}
            <div className={styles.formGroup}>
              <label htmlFor="patrimonio-neto" className={styles.formLabel}>
                Patrimonio neto total (opcional, €)
              </label>
              <input
                id="patrimonio-neto"
                type="text"
                inputMode="decimal"
                className={styles.formInput}
                value={form.patrimonioNeto}
                onChange={(e) => setCampo('patrimonioNeto', e.target.value)}
                placeholder="Ej: 2.500.000"
              />
              <span className={styles.formHint}>
                Solo se usa para detectar si te aplica el ITSGF (umbral {formatCurrency(ITSGF_UMBRAL)}).
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: 'var(--color-danger)', marginTop: '1rem', fontSize: '0.95rem' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="button"
            onClick={onComprobar}
            disabled={!formularioValido}
            className={styles.btnPrimary}
          >
            Comprobar mi situación
          </button>

          {(form.ccaaId || form.biIrpf) && (
            <button
              type="button"
              onClick={onReset}
              className={styles.toggleBtn}
              style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--border)' }}
            >
              Reiniciar formulario
            </button>
          )}
        </section>

        {/* Resultado */}
        {resultado && (
          <section
            id="resultado-orientacion"
            className={`${styles.resultadoCard} ${
              resultado.tipo === 'descarte-bonificacion' ? styles.descarteBonificacion :
              resultado.tipo === 'descarte-no-supera-limite' ? styles.descarteLimite :
              styles.posible
            }`}
            role="status"
            aria-live="polite"
          >
            <div className={styles.resultadoHeader}>
              <span className={styles.resultadoIcon} aria-hidden="true">
                {resultado.tipo === 'descarte-bonificacion' ? 'ℹ️' :
                 resultado.tipo === 'descarte-no-supera-limite' ? '⚠️' :
                 '✅'}
              </span>
              <h2 className={styles.resultadoTitle}>
                {resultado.tipo === 'descarte-bonificacion' ? 'No aplica en tu CCAA' :
                 resultado.tipo === 'descarte-no-supera-limite' ? 'La reducción no se activa en tu caso' :
                 'Podrías beneficiarte de la reducción'}
              </h2>
            </div>

            <p className={styles.resultadoMensaje}>{resultado.mensaje}</p>

            {resultado.tipo === 'posible' && (
              <>
                <div className={styles.resultadoCifras}>
                  <div className={styles.cifraItem}>
                    <span className={styles.cifraLabel}>Reducción orientativa estimada</span>
                    <span className={`${styles.cifraValue} ${styles.positivo}`}>
                      {formatCurrency(resultado.reduccionEstimada)}
                    </span>
                  </div>
                  <div className={styles.cifraItem}>
                    <span className={styles.cifraLabel}>Cuota Patrimonio orientativa tras reducción</span>
                    <span className={styles.cifraValue}>
                      {formatCurrency(resultado.cuotaPatrimonioEstimada)}
                    </span>
                  </div>
                </div>

                <div className={styles.ctaAsesor}>
                  <strong><span aria-hidden="true">👉</span> Próximo paso:</strong> acude a un asesor fiscal para que aplique el cálculo exacto.
                  El cálculo real puede variar por:
                  <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.2rem' }}>
                    <li>Prorrateo individual entre cónyuges (si IRPF conjunto)</li>
                    <li>Exclusión de bienes improductivos (Art. 31.1.b)</li>
                    <li>Aplicación correcta sobre la cuota íntegra (no la líquida)</li>
                  </ul>
                </div>

                <div className={styles.avisoBienes}>
                  <p className={styles.avisoTitulo}>
                    <span aria-hidden="true">⚠️</span> Si tienes bienes improductivos, la reducción real podría ser menor
                  </p>
                  <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6 }}>
                    Obras de arte, joyas, vehículos no afectos o inmuebles desocupados pueden quedar excluidos del
                    cálculo del límite (Art. 31.1.b). La STS de marzo 2024 ha flexibilizado esto: las acciones que
                    reparten dividendos NO son improductivas. Tu asesor fiscal aplicará la doctrina vigente.
                  </p>
                </div>
              </>
            )}

            {resultado.tipo === 'descarte-bonificacion' && resultado.aplicaItsgf && (
              <div className={styles.ctaAsesor}>
                <strong><span aria-hidden="true">⚠️</span> Atención al ITSGF:</strong> aunque tu CCAA bonifique el Patrimonio al 100%, los patrimonios
                netos superiores a {formatCurrency(ITSGF_UMBRAL)} pueden tributar por el Impuesto Temporal de
                Solidaridad de las Grandes Fortunas (estatal). Consulta a tu asesor fiscal para evaluarlo.
              </div>
            )}

            {resultado.tipo === 'descarte-no-supera-limite' && (
              <div className={styles.ctaAsesor}>
                <strong><span aria-hidden="true">💡</span> Aun así, conviene revisar:</strong> si tu situación cambia (más patrimonio, menor renta
                en años futuros), el límite podría activarse. Vuelve a comprobarlo cada ejercicio o consulta con
                tu asesor fiscal si hay grandes variaciones.
              </div>
            )}
          </section>
        )}

      </main>

      {/* ═════════ EducationalSection — Patrón v2.0 ═════════ */}
      <EducationalSection
        title="Todo sobre el Límite Conjunto IRPF-Patrimonio"
        subtitle="Art. 31 de la Ley 19/1991: cuándo aplica, cómo se calcula y qué hace tu asesor"
        icon="📚"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guideSection}>
          <h3>Tabla comparativa: ¿qué resultado te corresponde?</h3>
          <p>
            Tres situaciones excluyentes que el orientador detecta automáticamente. Identifica la tuya antes de
            decidir si conviene una consulta con asesor fiscal:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Situación</th>
                  <th>Cuándo se da</th>
                  <th>Resultado</th>
                  <th>Acción recomendada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Descartado por CCAA</strong></td>
                  <td>Resides en una CCAA con bonificación total (Madrid, Andalucía, Galicia, Cantabria, Extremadura, Castilla y León, Murcia)</td>
                  <td>No pagas Patrimonio → no hay nada que reducir</td>
                  <td>Si tu patrimonio supera 3M€, evaluar ITSGF con asesor</td>
                </tr>
                <tr>
                  <td><strong>Descartado por límite</strong></td>
                  <td>Cuota IRPF + cuota Patrimonio NO supera el 60% de tu BI IRPF</td>
                  <td>El Art. 31 no se activa</td>
                  <td>Revisar en años con menor renta o más patrimonio</td>
                </tr>
                <tr>
                  <td><strong>Posible reducción</strong></td>
                  <td>Cuota IRPF + cuota Patrimonio supera el 60% de tu BI IRPF</td>
                  <td>Reducción orientativa hasta el 80% de la cuota Patrimonio</td>
                  <td>Asesor fiscal para cálculo exacto y aplicación</td>
                </tr>
                <tr>
                  <td><strong>Caso especial: IRPF conjunto</strong></td>
                  <td>Matrimonio con IRPF conjunto y ambos declaran Patrimonio</td>
                  <td>Cada cónyuge calcula su límite individual prorrateando IRPF</td>
                  <td>Asesor fiscal obligatorio para el prorrateo correcto</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.notaTabla}>
            * Las CCAA con bonificación total pueden cambiar cada ejercicio. Verifica con tu CCAA o tu asesor.
          </p>
        </section>

        {/* 2. Casos de uso reales */}
        <section className={styles.guideSection}>
          <h3>Casos de uso reales</h3>
          <p>Cuatro perfiles típicos de contribuyente al que le interesa este orientador:</p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏖️</span>
                <h4>Jubilado con patrimonio inmobiliario</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> 72 años, pensión BI IRPF 25.000 €, vivienda + 2 inmuebles + ahorros (Patrimonio neto ~1.800.000 €)</p>
                <p><strong>CCAA:</strong> Cataluña (sin bonificación)</p>
                <p><strong>Resultado:</strong> probable activación del límite (renta baja, patrimonio alto)</p>
              </div>
              <div className={styles.escenarioTip}>
                Es el perfil clásico que más se beneficia: poca renta corriente y mucho patrimonio acumulado.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h4>Profesional con cartera de inversión</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> 50 años, BI IRPF 80.000 €, cartera de inversión 1.500.000 €</p>
                <p><strong>CCAA:</strong> Comunidad Valenciana (sin bonificación)</p>
                <p><strong>Resultado:</strong> probable descarte por no superar el límite (renta significativa)</p>
              </div>
              <div className={styles.escenarioTip}>
                Si la renta es proporcional al patrimonio, el 60% rara vez se supera.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👫</span>
                <h4>Matrimonio con IRPF conjunto</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> uno trabaja y aporta la mayoría de la renta, el otro tiene gran parte del patrimonio familiar</p>
                <p><strong>CCAA:</strong> Aragón (sin bonificación)</p>
                <p><strong>Resultado:</strong> requiere prorrateo individual; el cónyuge con poca renta puede beneficiarse mucho</p>
              </div>
              <div className={styles.escenarioTip}>
                El reparto desigual de renta y patrimonio entre cónyuges es donde más sentido tiene el límite.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
                <h4>Patrimonio alto en CCAA bonificada</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong> 60 años, BI IRPF 60.000 €, patrimonio neto 4.000.000 €</p>
                <p><strong>CCAA:</strong> Madrid (bonificación 100%)</p>
                <p><strong>Resultado:</strong> descarte del límite, pero posible ITSGF estatal por superar 3M€</p>
              </div>
              <div className={styles.escenarioTip}>
                El ITSGF se diseñó para CCAA con bonificación 100%. Tu asesor coordinará IP y ITSGF.
              </div>
            </div>

          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h4>¿Qué es exactamente el límite conjunto IRPF-Patrimonio?</h4>
              <p>
                Es una regla del Art. 31 de la Ley 19/1991 según la cual la suma de tu cuota íntegra de IRPF más
                la cuota íntegra del Impuesto sobre el Patrimonio no puede superar el 60% de la suma de las bases
                imponibles del IRPF. Si la supera, se reduce la cuota de Patrimonio hasta llegar al límite, con un
                tope: la reducción nunca puede exceder del 80% de la cuota de Patrimonio (siempre se paga al menos
                el 20%).
              </p>
              <div className={styles.faqTip}>
                Ejemplo: BI IRPF 100.000 €, cuota IRPF 35.000 €, cuota Patrimonio 40.000 €. Suma 75.000 € &gt; 60% × 100.000 € = 60.000 €. Exceso 15.000 € → reducción aplicable hasta el tope (80% de 40.000 = 32.000). Reducción real: 15.000 €.
              </div>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es la "reducción por declaración conjunta" del IRPF?</h4>
              <p>
                <strong>No, son cosas distintas.</strong> La reducción por tributación conjunta (3.400 € en
                matrimonios) opera sobre la base imponible del IRPF. El límite conjunto del Art. 31 opera sobre la
                cuota del Impuesto sobre el Patrimonio. La confusión es habitual porque ambas se llaman "conjuntas".
                El límite conjunto se llama así porque suma cuotas de dos impuestos (IRPF + Patrimonio), no porque
                requiera declaración conjunta.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo funciona si presento IRPF conjunta con mi cónyuge?</h4>
              <p>
                El Impuesto sobre el Patrimonio es <strong>siempre individual</strong>. Cuando hay IRPF conjunto y
                ambos cónyuges declaran Patrimonio, cada uno calcula su propio límite individual prorrateando la
                cuota y la base imponible del IRPF conjunto según sus rentas individuales. Esto requiere conocer
                qué parte de cada concepto del IRPF corresponde a cada cónyuge, algo que hace el asesor fiscal con
                los datos del programa Renta WEB.
              </p>
              <div className={styles.faqTip}>
                Este orientador trabaja con cifras agregadas. Para el cálculo exacto siempre necesitas un asesor.
              </div>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué son los bienes improductivos?</h4>
              <p>
                El Art. 31.1.b excluye del cálculo del límite conjunto los elementos patrimoniales que, por su
                naturaleza, no producen rendimientos gravados en IRPF: ciertos inmuebles desocupados, obras de
                arte, joyas, antigüedades… La idea es que la reducción no debe favorecer patrimonio "guardado" que
                no genera renta. Sin embargo, esto ha sido muy litigado: la STS de marzo 2024 (recursos 8728/2022
                y similares) ha aclarado que las acciones que reparten dividendos NO son improductivas, aunque
                el contribuyente no las venda ese año.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo aplicar el límite si tengo bonificación 100% en mi CCAA?</h4>
              <p>
                No tiene sentido: si tu CCAA bonifica al 100%, la cuota de Patrimonio queda en 0 € → no hay nada
                que reducir. Sin embargo, los patrimonios netos superiores a 3.000.000 € pueden quedar sujetos al
                <strong> ITSGF (Impuesto Temporal de Solidaridad de las Grandes Fortunas)</strong>, que es estatal.
                El ITSGF se diseñó precisamente para "rescatar" tributación en CCAA con bonificación 100%.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es obligatorio declarar Patrimonio?</h4>
              <p>
                No siempre. La obligación general aparece cuando el patrimonio bruto supera 2.000.000 € o cuando
                la cuota del Impuesto sobre el Patrimonio sale a pagar (tras aplicar mínimo exento). El mínimo
                exento estatal es 700.000 €, pero las CCAA pueden modificarlo (Cataluña: 500.000 €). La vivienda
                habitual está exenta hasta 300.000 € adicionales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿En qué casillas del modelo 714 se ve la reducción?</h4>
              <p>
                En el modelo 714 (Patrimonio) la cuota íntegra aparece en las primeras casillas del bloque de
                liquidación, y la reducción del límite conjunto se aplica en un bloque dedicado, después de la
                cuota íntegra y antes de la cuota a ingresar. Los números exactos cambian cada ejercicio, así que
                es preferible localizarlas por etiqueta ("Cuota íntegra", "Reducción límite conjunto Art. 31",
                "Cuota a ingresar"). El programa Patrimonio AEAT lo aplica automáticamente si introduces los datos
                del IRPF.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo solicitar la reducción si no la apliqué en su día?</h4>
              <p>
                Sí, mediante una solicitud de rectificación de autoliquidación dentro del plazo de prescripción
                (4 años desde el fin del periodo voluntario de presentación). Es habitual en ejercicios donde el
                contribuyente o su gestor no detectaron la activación del límite. Tu asesor fiscal puede revisar
                los últimos 4 ejercicios y solicitar la rectificación si procede.
              </p>
              <div className={styles.faqTip}>
                Si crees que pudiste perder esta reducción en años anteriores, todavía estás a tiempo de revisarlo.
              </div>
            </div>

          </div>
        </section>

        {/* 4. Step Guide */}
        <section className={styles.guideSection}>
          <h3>Cómo usar este orientador paso a paso</h3>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Reúne los datos de tu última declaración</h4>
                <p>
                  Necesitas tu base imponible IRPF, tu cuota íntegra IRPF y tu cuota íntegra de Patrimonio. Si
                  todavía no has declarado Patrimonio en algún ejercicio, esto no te concierne (el orientador
                  está pensado para quienes ya declaran o están a punto de hacerlo).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Indica tu modo de IRPF y tu CCAA</h4>
                <p>
                  Si presentas conjunta, suma los datos de ambos cónyuges. La CCAA es clave: en Madrid, Andalucía,
                  Galicia, Cantabria, Extremadura, Castilla y León y Murcia el Patrimonio está bonificado al 100%
                  y el orientador te lo dirá inmediatamente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Introduce las cifras y comprueba</h4>
                <p>
                  Pulsa "Comprobar mi situación". El orientador te dará uno de tres resultados: descarte por CCAA,
                  descarte por no superar el 60%, o posible beneficio. En este último caso, también verás una
                  estimación orientativa del ahorro.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Si el resultado es "posible", consulta a tu asesor</h4>
                <p>
                  El cálculo exacto requiere prorrateo individual entre cónyuges, exclusión correcta de bienes
                  improductivos, aplicación de la STS de marzo 2024 sobre acciones con dividendos y otros matices
                  técnicos. Tu asesor fiscal lo aplicará en el modelo 714.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Si el resultado es "descarte", revisa cada ejercicio</h4>
                <p>
                  El descarte de un año no implica el de los siguientes. Si tus circunstancias cambian (jubilación,
                  reducción de jornada, ventas patrimoniales que reducen renta), el límite puede activarse en
                  ejercicios posteriores. Revisa anualmente.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>Considera revisar los últimos 4 ejercicios</h4>
                <p>
                  Si descubres que pudiste haber aplicado la reducción en un ejercicio anterior y no se hizo, tu
                  asesor puede solicitar una rectificación de autoliquidación. El plazo de prescripción es de 4
                  años desde el fin del periodo voluntario.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 5. Tips */}
        <section className={styles.guideSection}>
          <h3>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <div>
                <h4>Revisa anualmente</h4>
                <p>
                  Tus circunstancias cambian. Lo que fue descarte un año puede activar el límite al siguiente.
                  Marca un recordatorio antes de la campaña Patrimonio (junio).
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <div>
                <h4>Conserva los datos del IRPF</h4>
                <p>
                  Antes de presentar Patrimonio, ten a mano tu modelo 100 (IRPF). El programa Patrimonio AEAT
                  necesita tus cifras del IRPF para aplicar correctamente el límite.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <div>
                <h4>Conoce las bonificaciones de tu CCAA</h4>
                <p>
                  Madrid, Andalucía, Galicia, Cantabria, Extremadura, Castilla y León y Murcia bonifican al 100%.
                  Pueden cambiar cada año. Verifica con tu Hacienda autonómica.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
              <div>
                <h4>Vigila el ITSGF si tu patrimonio supera 3M€</h4>
                <p>
                  Aunque tu CCAA bonifique el Patrimonio al 100%, los patrimonios netos sobre 3M€ pueden tributar
                  por el ITSGF estatal. No te confíes de la bonificación autonómica si tu patrimonio es alto.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👫</span>
              <div>
                <h4>Si declaras conjunta, pide prorrateo individual</h4>
                <p>
                  El reparto entre cónyuges es donde más diferencias hay entre el cálculo orientativo y el exacto.
                  Tu asesor fiscal aplicará el prorrateo individual obligatorio.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <h4>Revisa los últimos 4 ejercicios</h4>
                <p>
                  Si crees que pudiste haber aplicado la reducción y no se hizo, todavía estás dentro del plazo
                  de prescripción para rectificar autoliquidaciones de los últimos 4 años.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores frecuentes al pensar en el límite conjunto</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir "límite conjunto" con "tributación conjunta IRPF".</strong> No tienen relación
                directa. El límite conjunto se llama así por unir cuotas de dos impuestos (IRPF + Patrimonio), no
                por requerir declaración conjunta.
              </li>
              <li>
                <strong>Asumir que la reducción es automática sin verificar tu CCAA.</strong> Si vives en una CCAA
                con bonificación 100%, no pagas Patrimonio: la reducción es irrelevante, pero podrías estar sujeto
                al ITSGF si tu patrimonio supera 3M€.
              </li>
              <li>
                <strong>Calcular agregadamente cuando hay IRPF conjunto y dos declarantes Patrimonio.</strong> El
                cálculo correcto requiere prorrateo individual de cada cónyuge. Este orientador es agregado y
                solo orientativo.
              </li>
              <li>
                <strong>Olvidar la exclusión de bienes improductivos.</strong> Obras de arte, joyas, vehículos no
                afectos o inmuebles desocupados pueden quedar excluidos. La STS marzo 2024 aclaró que las acciones
                con dividendos NO son improductivas.
              </li>
              <li>
                <strong>Pensar que la reducción puede dejar la cuota de Patrimonio en 0 €.</strong> Imposible: el
                tope del 80% garantiza que siempre pagas al menos el 20% de la cuota íntegra de Patrimonio.
              </li>
              <li>
                <strong>No revisar ejercicios pasados.</strong> Si descubres que en un año anterior se debió
                aplicar y no se hizo, todavía puedes rectificar dentro del plazo de prescripción de 4 años.
              </li>
              <li>
                <strong>Tomar decisiones patrimoniales solo en base a este orientador.</strong> Las cifras son
                ilustrativas y agregadas. Cualquier decisión real exige confirmación de un asesor fiscal con tu
                situación personal y tus datos exactos.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-limite-conjunto-patrimonio')} />
      <ShareCard appName="orientador-limite-conjunto-patrimonio" />
      <Footer appName="orientador-limite-conjunto-patrimonio" />
    </div>
  );
}
