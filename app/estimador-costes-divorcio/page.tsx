'use client';

import { useId, useState } from 'react';
import styles from './EstimadorCostesDivorcio.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, RegionBadge, DataReference, NumberInput,
} from '@/components';
import { formatCurrency, formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { COSTAS_JUDICIALES_META, ARANCEL_PROCURA_FAMILIA, PORCENTAJES_IVA } from '@/data/fiscal';
import {
  calcular, tipoPosible,
  type ComplejidadBienes, type Entrada, type PartidaArancel, type Resultado, type TipoDivorcio,
} from './motor';
import { PREGUNTAS_FRECUENTES } from './faq';

// ─── Textos que salen de los datos ────────────────────────────────────────────

const PCT_IVA = formatPercentage(PORCENTAJES_IVA.general / 100, 0);
const PCT_RECARGO = formatPercentage(ARANCEL_PROCURA_FAMILIA.recargoPorRepresentado, 0);

// Hallazgo 2793: la nota citaba el art. 3 del arancel (351 €, cuantía indeterminada), que es
// SUPLETORIO; los procesos matrimoniales tienen concepto propio en el art. 22.
const NOTA_REFERENCIA =
  `Procurador: arancel de MÁXIMOS del RD 434/2024, art. 22 (procesos matrimoniales): ` +
  `${formatCurrency(ARANCEL_PROCURA_FAMILIA.mutuoAcuerdo)} en el mutuo acuerdo (22.1.a), con un ${PCT_RECARGO} más por cónyuge si un ` +
  `procurador representa a los dos (art. 6.1); ${formatCurrency(ARANCEL_PROCURA_FAMILIA.contencioso)} por procurador en el contencioso ` +
  `(22.3.a) y ${formatCurrency(ARANCEL_PROCURA_FAMILIA.medidasProvisionales)} por medidas provisionales (22.2). Las pensiones y la ` +
  `liquidación de bienes suman la escala del art. 2. Son cifras sin IVA (${PCT_IVA} aparte). Notario: arancel del RD 1426/1989. ` +
  `Tasas judiciales: personas físicas exentas desde 2015 (Ley 10/2012 art. 4.2.a, tras el RDL 1/2015). ` +
  `Abogado: honorarios libres desde la Ley 25/2009, sin tarifa oficial.`;

const TIPOS: { id: TipoDivorcio; icono: string; nombre: string; descripcion: string }[] = [
  { id: 'mutuo_acuerdo_judicial', icono: '🤝', nombre: 'Mutuo acuerdo (judicial)', descripcion: 'Ambos de acuerdo, trámite ante el juzgado. Con o sin hijos.' },
  { id: 'mutuo_acuerdo_notarial', icono: '📄', nombre: 'Mutuo acuerdo (notarial)', descripcion: 'Ante notario: más rápido y económico. Sin hijos menores no emancipados ni con medidas de apoyo.' },
  { id: 'contencioso', icono: '⚔️', nombre: 'Contencioso', descripcion: 'Sin acuerdo: cada parte con su abogado. Más largo y costoso.' },
];

const COMPLEJIDADES: { id: ComplejidadBienes; nombre: string; descripcion: string }[] = [
  { id: 'sin_bienes', nombre: 'Sin bienes comunes', descripcion: 'Sin propiedades ni patrimonio relevante que repartir' },
  { id: 'bienes_simples', nombre: 'Bienes simples', descripcion: 'Una vivienda, cuentas bancarias, vehículo' },
  { id: 'bienes_complejos', nombre: 'Bienes complejos', descripcion: 'Múltiples propiedades, empresa, inversiones' },
];

const NOMBRE_COMPARATIVA: Record<TipoDivorcio, string> = {
  mutuo_acuerdo_notarial: 'Notarial',
  mutuo_acuerdo_judicial: 'Mutuo acuerdo',
  contencioso: 'Contencioso',
};

// ─── Lectura de los campos ────────────────────────────────────────────────────

interface Lectura {
  entrada: Entrada | null;
  errores: { valor?: string; pension?: string; presupuesto?: string };
}

function leerCampos(
  tipo: TipoDivorcio, hijos: boolean, complejidad: ComplejidadBienes,
  valorTexto: string, pensionTexto: string, presupuestoTexto: string,
): Lectura {
  const errores: Lectura['errores'] = {};

  let valorBienes = 0;
  if (complejidad !== 'sin_bienes') {
    valorBienes = parseSpanishNumber(valorTexto);
    if (!Number.isFinite(valorBienes) || valorBienes <= 0) {
      errores.valor = 'Indica el valor aproximado de los bienes comunes que se reparten (mayor que 0).';
    }
  }

  let pensionMensual = 0;
  if (tipo !== 'mutuo_acuerdo_notarial' && pensionTexto.trim() !== '') {
    pensionMensual = parseSpanishNumber(pensionTexto);
    if (!Number.isFinite(pensionMensual) || pensionMensual < 0) {
      errores.pension = 'La pensión debe ser un importe en euros al mes, 0 o mayor (déjalo vacío si no hay).';
    }
  }

  let presupuestoAbogado: number | null = null;
  if (presupuestoTexto.trim() !== '') {
    presupuestoAbogado = parseSpanishNumber(presupuestoTexto);
    if (!Number.isFinite(presupuestoAbogado) || presupuestoAbogado <= 0) {
      errores.presupuesto = 'El presupuesto debe ser un importe en euros mayor que 0 (déjalo vacío para usar la horquilla).';
    }
  }

  if (errores.valor || errores.pension || errores.presupuesto) return { entrada: null, errores };
  return { entrada: { tipo, hijos, complejidad, valorBienes, pensionMensual, presupuestoAbogado }, errores };
}

// ─── Piezas de la vista ───────────────────────────────────────────────────────

function DetalleArancel({ partida }: { partida: PartidaArancel }) {
  return (
    <ul className={styles.detallePartida}>
      {partida.conceptos.map((c) => (
        <li key={c.texto}>
          <span>{c.texto}</span>
          <span>{formatCurrency(c.importe)}</span>
        </li>
      ))}
      {partida.recargo && (
        <li>
          <span>{partida.recargo.texto}</span>
          <span>× {formatNumber(partida.recargo.factor, 2)}</span>
        </li>
      )}
      <li>
        <span>IVA ({PCT_IVA})</span>
        <span>{formatCurrency(partida.iva)}</span>
      </li>
    </ul>
  );
}

const rango = (r: { min: number; max: number }): string =>
  r.min === r.max ? formatCurrency(r.min) : `${formatCurrency(r.min)} – ${formatCurrency(r.max)}`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorCostesDivorcioPage() {
  const [tipo, setTipo] = useState<TipoDivorcio>('mutuo_acuerdo_judicial');
  const [tieneHijos, setTieneHijos] = useState(false);
  const [complejidad, setComplejidad] = useState<ComplejidadBienes>('sin_bienes');
  const [valorBienes, setValorBienes] = useState('');
  const [pension, setPension] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [errores, setErrores] = useState<Lectura['errores']>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [comparativa, setComparativa] = useState<{ tipo: TipoDivorcio; resultado: Resultado | null }[]>([]);

  const idTipo = useId();
  const idHijos = useId();
  const idBienes = useId();

  const limpiar = () => {
    setResultado(null);
    setErrores({});
  };

  const handleEstimar = () => {
    const lectura = leerCampos(tipo, tieneHijos, complejidad, valorBienes, pension, presupuesto);
    setErrores(lectura.errores);
    if (!lectura.entrada) {
      setResultado(null);
      return;
    }
    const entrada = lectura.entrada;
    setResultado(calcular(entrada));
    // La comparativa usa TUS datos con cada tipo; el presupuesto del abogado es de tu tipo, así
    // que en las demás se vuelve a la horquilla.
    setComparativa(
      TIPOS.map((t) => ({
        tipo: t.id,
        resultado: tipoPosible(t.id, entrada.hijos)
          ? calcular({ ...entrada, tipo: t.id, presupuestoAbogado: t.id === entrada.tipo ? entrada.presupuestoAbogado : null })
          : null,
      })),
    );
  };

  // Si elige notarial, la pregunta de hijos no cabe (CC arts. 82.2 y 87): se oculta y se resetea.
  const handleTipo = (t: TipoDivorcio) => {
    setTipo(t);
    if (t === 'mutuo_acuerdo_notarial') setTieneHijos(false);
    limpiar();
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">📝</span>
          <h1 className={styles.title}>Estimador de Costes de Divorcio en España 2026</h1>
          <p className={styles.subtitle}>
            Cuánto cuesta divorciarse en España: honorarios del abogado y arancel del procurador y del
            notario según el tipo de procedimiento (mutuo acuerdo vs contencioso), hijos y bienes comunes
          </p>
        </header>

        <RegionBadge variant="es-only" />
        <LegalNotice />
        <DisclaimerCard variant="financial" severity="critical" context="estimador-costes-divorcio" />
        <DataReference
          normativa="Arancel de la Procura (RD 434/2024), arancel notarial y tasas judiciales 2025-2026"
          fuente={COSTAS_JUDICIALES_META.fuente}
          verificado={COSTAS_JUDICIALES_META.verificado}
          urlOficial={COSTAS_JUDICIALES_META.urlOficial}
          nota={NOTA_REFERENCIA}
        />

        <div className={styles.mainContent}>
          {/* ── Formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tu situación</h2>

            <div className={styles.formGroup} role="group" aria-labelledby={idTipo}>
              <p className={styles.label} id={idTipo}>Tipo de divorcio</p>
              <div className={styles.optionGrid}>
                {TIPOS.map((t) => (
                  <button key={t.id} type="button" className={`${styles.optionBtn} ${tipo === t.id ? styles.optionActivo : ''}`} onClick={() => handleTipo(t.id)} aria-pressed={tipo === t.id}>
                    <strong><span aria-hidden="true">{t.icono}</span> {t.nombre}</strong>
                    <span className={styles.optionDesc}>{t.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            {tipo !== 'mutuo_acuerdo_notarial' && (
              <div className={styles.formGroup} role="group" aria-labelledby={idHijos}>
                <p className={styles.label} id={idHijos}>
                  ¿Hay hijos menores no emancipados, o hijos mayores con medidas judiciales de apoyo atribuidas a los padres?
                </p>
                <div className={styles.switchRow}>
                  <button type="button" className={`${styles.switchBtn} ${!tieneHijos ? styles.switchActivo : ''}`} onClick={() => { setTieneHijos(false); limpiar(); }} aria-pressed={!tieneHijos}>No</button>
                  <button type="button" className={`${styles.switchBtn} ${tieneHijos ? styles.switchActivo : ''}`} onClick={() => { setTieneHijos(true); limpiar(); }} aria-pressed={tieneHijos}>Sí</button>
                </div>
              </div>
            )}

            <div className={styles.formGroup} role="group" aria-labelledby={idBienes}>
              <p className={styles.label} id={idBienes}>Complejidad patrimonial</p>
              <div className={styles.optionGrid}>
                {COMPLEJIDADES.map((c) => (
                  <button key={c.id} type="button" className={`${styles.optionBtn} ${complejidad === c.id ? styles.optionActivo : ''}`} onClick={() => { setComplejidad(c.id); limpiar(); }} aria-pressed={complejidad === c.id}>
                    <strong>{c.nombre}</strong>
                    <span className={styles.optionDesc}>{c.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            {complejidad !== 'sin_bienes' && (
              <NumberInput
                label="Valor de los bienes comunes que se reparten (€)"
                value={valorBienes}
                onChange={(v) => { setValorBienes(v); limpiar(); }}
                placeholder="Ej: 150.000"
                min={0}
                acotarAlSalir={false}
                helperText="Activo total sin restar deudas (vivienda, cuentas, vehículos…). Con él se calculan el arancel del procurador y el del notario por la liquidación."
                error={errores.valor}
              />
            )}

            {tipo !== 'mutuo_acuerdo_notarial' && (
              <NumberInput
                label="Pensiones que se fijan: alimentos y compensatoria (€ al mes, opcional)"
                value={pension}
                onChange={(v) => { setPension(v); limpiar(); }}
                placeholder="Vacío si no hay"
                min={0}
                acotarAlSalir={false}
                helperText="Si hay pensiones, el procurador suma la escala del art. 2 del arancel sobre una anualidad (art. 22)."
                error={errores.pension}
              />
            )}

            <NumberInput
              label="Presupuesto de tu abogado (€, opcional)"
              value={presupuesto}
              onChange={(v) => { setPresupuesto(v); limpiar(); }}
              placeholder="Vacío para usar la horquilla"
              min={0}
              acotarAlSalir={false}
              helperText={`Los honorarios son libres (no hay tarifa oficial). Si ya tienes presupuesto, se usa en lugar de la horquilla${tipo === 'contencioso' ? '; en el contencioso, el de tu abogado' : ''}.`}
              error={errores.presupuesto}
            />

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
                    Coste total estimado{resultado.porConyuge ? ' (por cónyuge)' : ''}
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
                    <strong>{rango(resultado.abogado)}</strong>
                  </div>
                  <p className={styles.aclaracion}>
                    {resultado.abogado.esPresupuesto
                      ? 'Tu presupuesto. Los honorarios de abogado son libres desde la Ley 25/2009: no hay tarifa oficial.'
                      : 'Honorarios libres desde la Ley 25/2009, sin tarifa oficial: la horquilla es un supuesto de esta herramienta, no una muestra de precios. Pide presupuesto y ponlo arriba.'}
                  </p>

                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">📋</span> Procurador (máximo legal, con IVA)</span>
                    <strong>{resultado.procurador ? formatCurrency(resultado.procurador.total) : 'No necesario'}</strong>
                  </div>
                  {resultado.procurador && <DetalleArancel partida={resultado.procurador} />}

                  {resultado.notario && (
                    <>
                      <div className={styles.desgloseItem}>
                        <span><span aria-hidden="true">📄</span> Notario (arancel, con IVA)</span>
                        <strong>{formatCurrency(resultado.notario.total)}</strong>
                      </div>
                      <DetalleArancel partida={resultado.notario} />
                    </>
                  )}

                  <div className={styles.desgloseItem}>
                    <span><span aria-hidden="true">🏛️</span> Tasas judiciales</span>
                    <strong>Exento</strong>
                  </div>
                </div>

                {resultado.notas.length > 0 && (
                  <div className={styles.notasCard}>
                    <h3 className={styles.desgloseTitle}>Notas importantes</h3>
                    {resultado.notas.map((nota) => (
                      <p key={nota} className={styles.nota}>
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
                  <h3 className={styles.desgloseTitle}>Comparativa con tus datos</h3>
                  <div className={styles.comparativaGrid}>
                    {comparativa.map(({ tipo: t, resultado: r }) => (
                      <div key={t} className={`${styles.comparativaItem} ${resultado.tipo === t ? styles.comparativaActivo : ''}`}>
                        <strong>{NOMBRE_COMPARATIVA[t]}</strong>
                        {r ? (
                          <>
                            <span>{formatCurrency(r.total.min)} – {formatCurrency(r.total.max)}</span>
                            <span className={styles.comparativaTiempo}>
                              {r.porConyuge ? 'por cónyuge · ' : 'entre los dos · '}
                              {r.duracionMeses.min}–{r.duracionMeses.max} meses
                            </span>
                          </>
                        ) : (
                          <span className={styles.comparativaTiempo}>No cabe con hijos menores no emancipados o con medidas de apoyo</span>
                        )}
                      </div>
                    ))}
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
              Si hay acuerdo entre ambos cónyuges, el <strong>divorcio de mutuo acuerdo</strong> suele ser
              más rápido, económico y menos desgastante. Si además no hay hijos menores no emancipados ni
              hijos mayores con medidas judiciales de apoyo, se puede tramitar <strong>ante notario</strong>{' '}
              (Ley 15/2015), que es la opción más rápida.
            </p>

            <div className={styles.faqList}>
              {PREGUNTAS_FRECUENTES.map((p) => (
                <details key={p.pregunta} className={styles.faqItem}>
                  <summary>{p.pregunta}</summary>
                  <p>{p.respuesta}</p>
                </details>
              ))}
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Los honorarios de abogado son libres y varían mucho según la ciudad y el profesional</li>
                <li>El procurador figura por su máximo legal: puede cobrar menos, nunca más</li>
                <li>No incluye posibles costes de mediación, terapia familiar o valoraciones periciales</li>
                <li>Si se adjudican inmuebles, la inscripción en el Registro de la Propiedad y los impuestos de la operación van aparte</li>
                <li>En Canarias, Ceuta y Melilla no se aplica el IVA, sino el IGIC o el IPSI, que esta herramienta no calcula</li>
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
