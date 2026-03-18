'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraActualizacionAlquiler.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, NumberInput, ResultCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  IRAV_POR_TRIMESTRE,
  IPC_INTERANUAL_POR_MES,
  mesATrimestreIRAV,
  mesAnteriorClave,
} from '@/data/fiscal';

// ──────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────
type TipoContrato = 'nuevo' | 'antiguo';

interface ResultadoCalculo {
  indiceAplicado: number;
  claveIndice: string;
  nuevaRenta: number;
  incrementoMensual: number;
  incrementoAnual: number;
  disponible: boolean;
}

// ──────────────────────────────────────────
// DATOS AUXILIARES
// ──────────────────────────────────────────
const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ANIOS_DISPONIBLES = [2023, 2024, 2025, 2026];

// Tabla resumen de índices recientes para mostrar al usuario
const TABLA_IRAV = [
  { periodo: 'Q1 2024 (ene-mar)', valor: 3.0 },
  { periodo: 'Q2 2024 (abr-jun)', valor: 3.3 },
  { periodo: 'Q3 2024 (jul-sep)', valor: 2.5 },
  { periodo: 'Q4 2024 (oct-dic)', valor: 1.9 },
  { periodo: 'Q1 2025 (ene-mar)', valor: 2.2 },
  { periodo: 'Q2 2025 (abr-jun)', valor: 2.1 },
  { periodo: 'Q3 2025 (jul-sep)', valor: 1.8 },
  { periodo: 'Q4 2025 (oct-dic)', valor: 1.8 },
];

// ──────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────
export default function CalculadoraActualizacionAlquilerPage() {
  const [tipoContrato, setTipoContrato] = useState<TipoContrato>('nuevo');
  const [rentaStr, setRentaStr] = useState('');
  const [mesAniversario, setMesAniversario] = useState<number>(new Date().getMonth() + 1);
  const [anioAniversario, setAnioAniversario] = useState<number>(2025);

  // Cálculo principal
  const resultado = useMemo((): ResultadoCalculo => {
    const renta = parseSpanishNumber(rentaStr);
    if (!renta || renta <= 0) {
      return { indiceAplicado: 0, claveIndice: '', nuevaRenta: 0, incrementoMensual: 0, incrementoAnual: 0, disponible: false };
    }

    let indice: number | undefined;
    let clave: string;

    if (tipoContrato === 'nuevo') {
      // IRAV: trimestre del mes de aniversario
      clave = mesATrimestreIRAV(anioAniversario, mesAniversario);
      indice = IRAV_POR_TRIMESTRE[clave];
    } else {
      // IPC: mes anterior al aniversario
      clave = mesAnteriorClave(anioAniversario, mesAniversario);
      indice = IPC_INTERANUAL_POR_MES[clave];
    }

    if (indice === undefined) {
      return { indiceAplicado: 0, claveIndice: clave, nuevaRenta: renta, incrementoMensual: 0, incrementoAnual: 0, disponible: false };
    }

    const factor = indice / 100;
    const nuevaRenta = renta * (1 + factor);
    const incrementoMensual = nuevaRenta - renta;
    const incrementoAnual = incrementoMensual * 12;

    return {
      indiceAplicado: indice,
      claveIndice: clave,
      nuevaRenta,
      incrementoMensual,
      incrementoAnual,
      disponible: true,
    };
  }, [rentaStr, tipoContrato, mesAniversario, anioAniversario]);

  const rentaValida = parseSpanishNumber(rentaStr) > 0;

  // Etiqueta del índice para mostrar al usuario
  const etiquetaIndice = tipoContrato === 'nuevo'
    ? `IRAV ${resultado.claveIndice}`
    : `IPC interanual ${resultado.claveIndice ? MESES_NOMBRES[parseInt(resultado.claveIndice.split('-')[1]) - 1] + ' ' + resultado.claveIndice.split('-')[0] : ''}`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏠 Calculadora Actualización del Alquiler 2026</h1>
        <p className={styles.subtitle}>
          Calcula la subida máxima permitida según tu tipo de contrato — IRAV o IPC
        </p>
      </header>

      <LegalNotice />

      {/* Selector tipo de contrato */}
      <div className={styles.tipoWrapper}>
        <h2 className={styles.tipoTitulo}>¿Cuándo se firmó el contrato?</h2>
        <div className={styles.tipoGrid}>
          <button
            type="button"
            onClick={() => setTipoContrato('nuevo')}
            className={`${styles.tipoBtn} ${tipoContrato === 'nuevo' ? styles.active : ''}`}
            aria-pressed={tipoContrato === 'nuevo'}
          >
            <span className={styles.tipoBtnIcono}>📄</span>
            <span className={styles.tipoBtnLabel}>Desde el 26 de mayo de 2023</span>
            <span className={styles.tipoBtnTag}>Índice IRAV</span>
            <span className={styles.tipoBtnDesc}>Ley de Vivienda (Ley 12/2023)</span>
          </button>

          <button
            type="button"
            onClick={() => setTipoContrato('antiguo')}
            className={`${styles.tipoBtn} ${tipoContrato === 'antiguo' ? styles.active : ''}`}
            aria-pressed={tipoContrato === 'antiguo'}
          >
            <span className={styles.tipoBtnIcono}>📑</span>
            <span className={styles.tipoBtnLabel}>Antes del 26 de mayo de 2023</span>
            <span className={styles.tipoBtnTag}>Índice IPC</span>
            <span className={styles.tipoBtnDesc}>IPC interanual del mes anterior</span>
          </button>
        </div>

        {/* Explicación del índice seleccionado */}
        <div className={`${styles.indiceBadge} ${tipoContrato === 'nuevo' ? styles.badgeIRAV : styles.badgeIPC}`}>
          {tipoContrato === 'nuevo' ? (
            <p>
              <strong>IRAV</strong> — publicado trimestralmente por el INE. Es la media de las 12 variaciones mensuales del IPC anteriores al trimestre de referencia. Más estable que el IPC puntual.
            </p>
          ) : (
            <p>
              <strong>IPC interanual</strong> — variación del Índice de Precios al Consumo respecto al mismo mes del año anterior. Se usa el IPC del mes <em>anterior</em> al aniversario del contrato.
            </p>
          )}
        </div>
      </div>

      {/* Panel de cálculo */}
      <div className={styles.calculoPanel}>
        <div className={styles.inputsArea}>
          <NumberInput
            value={rentaStr}
            onChange={setRentaStr}
            label="Renta mensual actual"
            placeholder="800"
            helperText="Importe que pagas actualmente cada mes"
            min={0}
          />

          <div className={styles.fechaRow}>
            <div className={styles.fechaField}>
              <label className={styles.fieldLabel}>Mes del aniversario del contrato</label>
              <select
                value={mesAniversario}
                onChange={e => setMesAniversario(parseInt(e.target.value))}
                className={styles.select}
                aria-label="Mes de aniversario"
              >
                {MESES_NOMBRES.map((nombre, i) => (
                  <option key={i + 1} value={i + 1}>{nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.fechaField}>
              <label className={styles.fieldLabel}>Año del aniversario</label>
              <select
                value={anioAniversario}
                onChange={e => setAnioAniversario(parseInt(e.target.value))}
                className={styles.select}
                aria-label="Año de aniversario"
              >
                {ANIOS_DISPONIBLES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Índice que se aplicará */}
          {rentaValida && (
            <div className={`${styles.indiceResultado} ${!resultado.disponible ? styles.indiceNoDisponible : ''}`}>
              {resultado.disponible ? (
                <>
                  <span className={styles.indiceLabel}>Índice aplicado ({etiquetaIndice}):</span>
                  <span className={styles.indiceValor}>+{formatNumber(resultado.indiceAplicado, 1)}%</span>
                </>
              ) : (
                <span className={styles.indiceLabel}>
                  ⚠️ No hay datos disponibles para {resultado.claveIndice}. Consulta el INE directamente.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Resultados */}
        {rentaValida && resultado.disponible && (
          <div className={styles.resultadosArea}>
            <ResultCard
              title="Nueva renta máxima"
              value={formatCurrency(resultado.nuevaRenta)}
              variant="highlight"
              icon="🏠"
              description={`Máximo permitido tras aplicar el ${tipoContrato === 'nuevo' ? 'IRAV' : 'IPC'}`}
            />
            <ResultCard
              title="Incremento mensual"
              value={`+${formatCurrency(resultado.incrementoMensual)}`}
              variant="info"
              icon="📈"
              description="Diferencia respecto a la renta actual"
            />
            <ResultCard
              title="Incremento anual"
              value={`+${formatCurrency(resultado.incrementoAnual)}`}
              variant="default"
              icon="📅"
              description="Impacto en 12 meses"
            />
          </div>
        )}

        {rentaValida && !resultado.disponible && (
          <div className={styles.noDisponible}>
            <p>
              No hay datos del {tipoContrato === 'nuevo' ? 'IRAV' : 'IPC'} para el período seleccionado.
              Consulta directamente el INE para obtener el índice actualizado.
            </p>
          </div>
        )}
      </div>

      {/* Aviso legal — SIEMPRE VISIBLE */}
      <div className={styles.avisoLegal} role="note">
        <strong>⚠️ Aviso importante</strong>
        <p>
          Los índices incorporados en esta herramienta son <strong>orientativos</strong> y pueden no reflejar el último valor
          publicado por el INE. La actualización de la renta está sujeta a lo pactado en el contrato de arrendamiento y
          a la normativa vigente (LAU y Ley 12/2023 de Vivienda). Verifica siempre el índice aplicable en{' '}
          <a href="https://www.ine.es" target="_blank" rel="noopener noreferrer" className={styles.enlaceAeat}>ine.es</a>{' '}
          antes de comunicar la actualización al inquilino o al propietario.
          Esta calculadora no constituye asesoramiento legal ni económico.
        </p>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Todo sobre la actualización del alquiler en España"
        subtitle="IRAV, IPC, Ley de Vivienda y derechos de propietarios e inquilinos"
        icon="🏠"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>IRAV vs IPC: diferencias clave</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>IRAV (contratos nuevos)</th>
                  <th>IPC interanual (contratos antiguos)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>¿Para qué contratos?</td>
                  <td>Firmados <strong>desde el 26/05/2023</strong></td>
                  <td>Firmados <strong>antes del 26/05/2023</strong></td>
                </tr>
                <tr>
                  <td>Base legal</td>
                  <td>Ley 12/2023 de Vivienda</td>
                  <td>LAU 1994 (art. 18) + IPC anterior</td>
                </tr>
                <tr>
                  <td>Qué mide</td>
                  <td>Media de 12 variaciones mensuales del IPC</td>
                  <td>Variación IPC en el último año natural</td>
                </tr>
                <tr>
                  <td>Frecuencia publicación</td>
                  <td>Trimestral (INE)</td>
                  <td>Mensual (INE)</td>
                </tr>
                <tr>
                  <td>Estabilidad</td>
                  <td className={styles.cellBien}>Mayor (suaviza picos)</td>
                  <td className={styles.cellNeutral}>Variable según inflación del mes</td>
                </tr>
                <tr>
                  <td>Ejemplo (aniversario oct 2024)</td>
                  <td>IRAV Q4 2024: +1,9%</td>
                  <td>IPC sep 2024: +1,5%</td>
                </tr>
                <tr>
                  <td>¿Puede ser 0 o negativo?</td>
                  <td className={styles.cellBien}>No (mínimo 0%)</td>
                  <td className={styles.cellMal}>Sí, si hay deflación</td>
                </tr>
                <tr>
                  <td>¿El propietario puede no aplicarlo?</td>
                  <td>Sí, es el <strong>máximo</strong> permitido, no la obligación</td>
                  <td>Sí, es el <strong>máximo</strong> permitido, no la obligación</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 1b. Tabla IRAV por trimestre */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Valores IRAV por trimestre (2024-2025)</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Trimestre</th>
                  <th>IRAV (%)</th>
                  <th>Aplicable a contratos con aniversario en…</th>
                </tr>
              </thead>
              <tbody>
                {TABLA_IRAV.map(row => (
                  <tr key={row.periodo}>
                    <td>{row.periodo}</td>
                    <td><strong>+{formatNumber(row.valor, 1)}%</strong></td>
                    <td>{row.periodo.split('(')[1]?.replace(')', '') || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tablaNota}>
            ⚠️ Valores orientativos. Verifica el dato oficial en{' '}
            <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=25171" target="_blank" rel="noopener noreferrer">ine.es</a>{' '}
            antes de comunicar la actualización.
          </p>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Situaciones frecuentes</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <strong>Inquilino con contrato desde 2020 (pre-Ley Vivienda)</strong>
              </div>
              <p className={styles.escenarioExample}>Firmó en septiembre de 2020, renta 750 €/mes. Aniversario en septiembre 2025.</p>
              <ul>
                <li>Aplica el IPC interanual: se usa el IPC de <strong>agosto 2025</strong> (mes anterior al aniversario).</li>
                <li>IPC agosto 2025: ~1,6% → renta máxima nueva: 750 × 1,016 = <strong>762 €</strong>.</li>
                <li>El propietario puede aplicar menos o no subir; no puede superar ese porcentaje.</li>
                <li>La actualización debe notificarse con al menos 30 días de antelación.</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Si el propietario no te notifica la actualización en plazo, pierde el derecho a aplicarla ese año.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔑</span>
                <strong>Propietario que alquila desde julio 2023 (post-Ley Vivienda)</strong>
              </div>
              <p className={styles.escenarioExample}>Firmó en julio de 2023, renta 950 €/mes. Aniversario en julio 2025.</p>
              <ul>
                <li>Aplica el IRAV: se usa el valor del <strong>Q3 2025</strong> (jul-sep 2025).</li>
                <li>IRAV Q3 2025: ~1,8% → renta máxima nueva: 950 × 1,018 = <strong>967,10 €</strong>.</li>
                <li>El IRAV es el techo máximo; puede pactar con el inquilino un porcentaje menor.</li>
                <li>El contrato debe incluir explícitamente la cláusula de actualización para poder aplicarla.</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Si el contrato no menciona actualización de renta, el propietario no puede subirla hasta la renovación del contrato.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <strong>Gran tenedor en zona tensionada</strong>
              </div>
              <p className={styles.escenarioExample}>Propietario con más de 10 inmuebles en una zona declarada tensionada por la CCAA.</p>
              <ul>
                <li>En zonas tensionadas declaradas por la comunidad autónoma aplican restricciones adicionales.</li>
                <li>La renta no puede superar ni el precio del contrato anterior ni el índice de precios de referencia de la CCAA.</li>
                <li>El IRAV/IPC sigue siendo el techo, pero con ese límite adicional más restrictivo.</li>
                <li>A 2026, Cataluña, Euskadi y algunas ciudades han declarado zonas tensionadas.</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Antes de actualizar la renta en una zona tensionada, consulta el índice de referencia de precios de la comunidad autónoma correspondiente.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📊</span>
                <strong>Contrato sin cláusula de actualización</strong>
              </div>
              <p className={styles.escenarioExample}>Firmaron el contrato en 2019 y no incluyeron cláusula de actualización de renta.</p>
              <ul>
                <li>La Ley de Arrendamientos Urbanos (LAU) permite actualizar la renta anualmente si el contrato lo prevé.</li>
                <li>Si el contrato no incluye ninguna cláusula de actualización, <strong>la renta no puede subirse</strong> mientras dure el período obligatorio.</li>
                <li>Llegada la prórroga tácita, las partes pueden negociar una nueva renta de mutuo acuerdo.</li>
                <li>Esta calculadora solo es útil si el contrato SÍ incluye cláusula de actualización.</li>
              </ul>
              <p className={styles.escenarioTip}>Consejo: Para contratos sin cláusula de actualización, la única vía de modificar la renta durante la vigencia es el acuerdo mutuo entre las partes.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Preguntas frecuentes</h4>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué es exactamente el IRAV y cómo se calcula?</dt>
              <dd>
                El IRAV (Índice de Referencia de Actualización de Vivienda) fue creado por la <strong>Ley 12/2023 de Vivienda</strong> y lo calcula y publica el INE trimestralmente. Se obtiene como la media aritmética de las variaciones mensuales del IPC de los últimos 12 meses. Esta metodología lo hace más suave y predecible que el IPC puntual, evitando que un mes de inflación alta dispare la renta. A diferencia del IPC, el IRAV nunca puede ser negativo.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo entró en vigor el IRAV y qué contratos afecta?</dt>
              <dd>
                El IRAV se aplica a los contratos de arrendamiento de vivienda habitual firmados <strong>desde el 26 de mayo de 2023</strong>, fecha de entrada en vigor de la Ley de Vivienda. Los contratos firmados antes de esa fecha siguen usando el IPC interanual del mes anterior al aniversario, tal como establecía la LAU de 1994.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El propietario está obligado a subir la renta según el IRAV/IPC?</dt>
              <dd>
                No. El IRAV o el IPC fijan el <strong>límite máximo</strong> de actualización, no la obligación. El propietario puede aplicar un porcentaje menor, o no subir la renta ese año. Lo que no puede hacer es superar ese techo. Para aplicar la actualización, además, debe estar expresamente prevista en el contrato y notificarla al inquilino con antelación suficiente.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Con cuánta antelación debe notificarse la actualización de la renta?</dt>
              <dd>
                La LAU no establece un plazo específico, pero la práctica habitual y recomendada es <strong>30 días antes</strong> del aniversario. Si la notificación llega después del aniversario, la actualización solo será exigible desde la fecha de notificación, no retroactivamente. Algunos contratos incluyen plazos específicos, que prevalecen sobre la práctica general.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Dónde encuentro el IRAV e IPC oficial más reciente?</dt>
              <dd>
                Ambos índices los publica el <strong>INE (Instituto Nacional de Estadística)</strong>:
                <ul>
                  <li>IRAV: <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=25171" target="_blank" rel="noopener noreferrer" className={styles.enlaceAeat}>ine.es → IRAV</a></li>
                  <li>IPC interanual: <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=22350" target="_blank" rel="noopener noreferrer" className={styles.enlaceAeat}>ine.es → IPC mensual</a></li>
                </ul>
                También puedes consultar el portal <a href="https://www.arrenta.es" target="_blank" rel="noopener noreferrer" className={styles.enlaceAeat}>arrenta.es</a> para calculadoras oficiales de la Comunidad de Madrid, o el portal de tu comunidad autónoma.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué pasa si el IPC es negativo (deflación)?</dt>
              <dd>
                Si el IPC interanual es negativo en el mes de referencia, el propietario <strong>no está obligado a bajar la renta</strong>, pero tampoco puede subirla ese año con ese mecanismo. El IRAV, al ser una media, nunca puede ser negativo por construcción matemática. La renta solo baja si ambas partes lo acuerdan voluntariamente.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué ocurre en las zonas tensionadas?</dt>
              <dd>
                En las áreas declaradas <strong>zona de mercado residencial tensionado</strong> por la comunidad autónoma correspondiente, la Ley de Vivienda impone restricciones adicionales: la renta del nuevo contrato no puede superar la renta del contrato anterior ni el índice de referencia de precios de la CCAA. El IRAV sigue siendo el techo para la actualización anual, pero se añade ese límite adicional. A 2026, Cataluña tiene el sistema más desarrollado con su índice de referencia propio.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿La actualización de renta aplica a locales comerciales?</dt>
              <dd>
                No. La Ley de Vivienda y el IRAV aplican exclusivamente a <strong>arrendamientos de vivienda habitual</strong>. Los contratos de locales comerciales o arrendamientos de uso distinto a vivienda se rigen por el artículo 4 de la LAU (con mayor libertad de pacto) y no están sujetos al IRAV. Para ellos, el mecanismo de actualización es el pactado en el contrato, habitualmente el IPC o el IPRI.
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>Cómo actualizar el alquiler correctamente: 6 pasos</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica la fecha del aniversario del contrato</strong>
                <p>La actualización de renta solo puede aplicarse en el aniversario anual del contrato, no en otro momento. Si el contrato se firmó el 15 de octubre de 2021, el aniversario es el 15 de octubre de cada año. Revisa la fecha exacta en la cláusula de inicio del arrendamiento.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Determina qué índice aplica según la fecha del contrato</strong>
                <p>Si el contrato se firmó antes del 26 de mayo de 2023 → IPC interanual del mes anterior al aniversario. Si se firmó desde esa fecha → IRAV del trimestre en que cae el aniversario. Ante duda, consulta la fecha de firma del contrato original (no las prórrogas).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Consulta el valor oficial del índice en el INE</strong>
                <p>Entra en ine.es y busca el IRAV trimestral o el IPC mensual según corresponda. Para el IPC, busca el dato de la variación anual del mes anterior al aniversario. Para el IRAV, busca el dato del trimestre en que cae el aniversario. Los datos suelen publicarse en el primer mes del trimestre o mes siguiente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcula la nueva renta máxima</strong>
                <p>Aplica la fórmula: <code>Nueva renta = Renta actual × (1 + índice / 100)</code>. Si la renta es 800 € y el IRAV es 2,1%, la nueva renta máxima sería 800 × 1,021 = 816,80 €. Esta calculadora lo hace automáticamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Notifica la actualización con antelación suficiente</strong>
                <p>El propietario debe comunicar la actualización al inquilino antes del aniversario, idealmente con 30 días de margen. La notificación debe incluir el porcentaje aplicado, el índice utilizado (con fuente INE) y la nueva cuota mensual. Se recomienda hacerlo por escrito (email, burofax) para dejar constancia.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Formaliza el cambio si ambas partes lo acuerdan</strong>
                <p>No es obligatorio firmar un addendum al contrato para la actualización anual de renta (si el contrato ya lo prevé), pero es recomendable dejar constancia escrita con la nueva cuota, la fecha de efecto y el índice aplicado. En caso de disputa, este documento puede ser clave en un juzgado.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Tips */}
        <section className={styles.eduSection}>
          <h4 className={styles.eduSectionTitle}>6 cosas que muchos no saben sobre la actualización del alquiler</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <div>
                <strong>El IRAV no es retroactivo</strong>
                <p>Si el propietario no notifica la actualización en el momento del aniversario, pierde el derecho a aplicarla ese año con carácter retroactivo. Solo puede cobrar la renta actualizada desde la fecha de notificación, no desde el aniversario.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📑</span>
              <div>
                <strong>Sin cláusula de actualización en el contrato, no hay subida</strong>
                <p>Para poder actualizar la renta, el contrato debe incluir explícitamente una cláusula que lo permita. Si el contrato guarda silencio sobre este punto, la renta queda congelada hasta que ambas partes acuerden cambiarla.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏘️</span>
              <div>
                <strong>Las prórrogas no cambian el tipo de índice</strong>
                <p>Si el contrato original se firmó antes del 26 de mayo de 2023 y se prorroga, sigue usando el IPC aunque la prórroga sea posterior a esa fecha. El índice depende de la <em>firma original</em>, no de la renovación.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📉</span>
              <div>
                <strong>El propietario puede aplicar menos del índice máximo</strong>
                <p>Propietarios que mantengan buena relación con inquilinos de larga duración a veces aplican un porcentaje menor al permitido para evitar rotación y los costes que conlleva (período vacío, obra, nueva agencia). Económicamente puede ser más rentable.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏙️</span>
              <div>
                <strong>En zonas tensionadas hay un doble límite</strong>
                <p>Además del IRAV/IPC, en zonas declaradas tensionadas la nueva renta no puede superar la del contrato anterior. Esto significa que si el piso cambió de inquilino, la renta de partida ya está limitada, independientemente de lo que marque el índice.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💬</span>
              <div>
                <strong>El inquilino puede negociar</strong>
                <p>El IRAV es el techo legal, pero nada impide que el inquilino negocie con el propietario una subida menor o nula, especialmente si lleva años en el piso sin incidencias. Un buen inquilino tiene valor económico real: no hay periodo de vacíos, sin gastos de agencia, sin reparaciones de entrada.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Warning */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 errores frecuentes en la actualización del alquiler</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Aplicar el IPC al contratos nuevos (post-mayo 2023).</strong> A partir de la Ley de Vivienda, los contratos nuevos usan el IRAV, no el IPC. Aplicar el IPC podría dar un resultado incorrecto (a veces superior, a veces inferior al permitido).
              </li>
              <li>
                <strong>Usar el IPC del mes del aniversario en lugar del mes anterior.</strong> La norma establece que se aplica el IPC del mes <em>anterior</em> al aniversario, no el del propio mes (que puede no estar publicado aún). Si el aniversario es en octubre, el IPC a usar es el de septiembre.
              </li>
              <li>
                <strong>Subir la renta sin cláusula de actualización en el contrato.</strong> Sin esa cláusula, cualquier subida unilateral es ilegal y el inquilino puede impugnarla. El propietario tendría que restituir las cantidades cobradas de más.
              </li>
              <li>
                <strong>Notificar la subida con menos de un mes de antelación.</strong> Aunque la ley no fija un plazo mínimo, la jurisprudencia considera que la actualización solo es exigible cuando ha habido tiempo suficiente para que el inquilino la pueda asumir. Con menos de 30 días, el cobro puede diferirse.
              </li>
              <li>
                <strong>Confundir actualización de renta con actualización del contrato.</strong> La actualización anual de renta es un mecanismo dentro del mismo contrato vigente. No es una novación del contrato ni una renegociación completa. El resto de condiciones (plazo, fianza, otros pactos) no se modifican.
              </li>
              <li>
                <strong>No guardar el justificante de la notificación.</strong> Si surge una disputa sobre si se notificó la actualización y cuándo, la carga de la prueba recae sobre el propietario. Sin justificante escrito (email, burofax, carta certificada), es difícil acreditar la fecha.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-actualizacion-alquiler')} />
      <ShareCard appName="calculadora-actualizacion-alquiler" />
      <Footer appName="calculadora-actualizacion-alquiler" />
    </div>
  );
}
