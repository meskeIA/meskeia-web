'use client';

import { useState, useMemo } from 'react';
import styles from './VerificadorComplementoBrechaGenero.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, DataReference, RegionBadge,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  COMPLEMENTO_BRECHA_GENERO_2026,
  COMPLEMENTO_BRECHA_GENERO_META,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoPension = 'jubilacion' | 'incapacidad' | 'viudedad' | 'no_contributiva' | 'ninguna';
type Genero = 'mujer' | 'hombre';
type EstadoOtroProgenitor = 'no_aplica' | 'no_percibe' | 'percibe' | 'denegado';
type FechaCausante = 'antes_2021' | 'desde_2021' | 'sin_iniciar';

interface Resultado {
  procede: boolean;
  hijosComputables: number;
  importeMensual: number;
  importeAnual: number;
  motivo: string;
  esReclamacion: boolean;
  pasoSiguiente: string;
}

// ─── Lógica de elegibilidad ───────────────────────────────────────────────────

function evaluar(
  tipo: TipoPension,
  fecha: FechaCausante,
  numHijos: number,
  genero: Genero,
  otroProgenitor: EstadoOtroProgenitor,
): Resultado {
  const { cuantiaPorHijoMensual, maxHijos, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
  const hijosComputables = Math.min(numHijos, maxHijos);
  const importeMensual = hijosComputables * cuantiaPorHijoMensual;
  const importeAnual = importeMensual * pagasAnuales;

  // Caso 1: no tiene pensión contributiva elegible
  if (tipo === 'no_contributiva') {
    return {
      procede: false,
      hijosComputables: 0,
      importeMensual: 0,
      importeAnual: 0,
      motivo:
        'El complemento solo se aplica a pensiones contributivas (jubilación, ' +
        'incapacidad permanente o viudedad). Las pensiones no contributivas no dan acceso.',
      esReclamacion: false,
      pasoSiguiente:
        'Si en el futuro accedes a una pensión contributiva y tienes hijos, revisa entonces tu derecho.',
    };
  }
  if (tipo === 'ninguna') {
    return {
      procede: false,
      hijosComputables: 0,
      importeMensual: 0,
      importeAnual: 0,
      motivo: 'El complemento se reconoce únicamente sobre una pensión ya causada.',
      esReclamacion: false,
      pasoSiguiente:
        'Cuando solicites jubilación, IP o quedes como viudo/a, recuerda revisar este derecho.',
    };
  }

  // Caso 2: hecho causante anterior al 4-feb-2021
  if (fecha === 'antes_2021') {
    return {
      procede: false,
      hijosComputables,
      importeMensual: 0,
      importeAnual: 0,
      motivo:
        'Tu pensión se causó antes del 4 de febrero de 2021, fecha en que entró en vigor el ' +
        'complemento por brecha de género. Para hechos causantes anteriores se aplicaba el antiguo ' +
        'complemento de maternidad, con reglas distintas.',
      esReclamacion: false,
      pasoSiguiente:
        'Si entonces percibías o se te denegó el antiguo complemento de maternidad, consulta a un ' +
        'profesional: la doctrina TJUE 2019 (caso WA) también afectó a aquel régimen.',
    };
  }
  if (fecha === 'sin_iniciar') {
    return {
      procede: false,
      hijosComputables,
      importeMensual: 0,
      importeAnual: 0,
      motivo: 'Aún no tienes una pensión causada. El complemento se reconoce al solicitar la pensión.',
      esReclamacion: false,
      pasoSiguiente:
        'Al solicitar la pensión, marca expresamente que pides el complemento del art. 60 LGSS.',
    };
  }

  // Caso 3: 0 hijos
  if (numHijos === 0) {
    return {
      procede: false,
      hijosComputables: 0,
      importeMensual: 0,
      importeAnual: 0,
      motivo:
        'El complemento exige al menos un hijo o hija nacido con vida o adoptado antes del ' +
        'hecho causante de la pensión.',
      esReclamacion: false,
      pasoSiguiente: 'Sin hijos computables no procede este complemento.',
    };
  }

  // Caso 4: el otro progenitor ya percibe el complemento → incompatible
  if (otroProgenitor === 'percibe') {
    return {
      procede: false,
      hijosComputables,
      importeMensual: 0,
      importeAnual: 0,
      motivo:
        'Cada hijo o hija solo genera el complemento para uno de los progenitores. Si el otro ' +
        'progenitor ya lo percibe por los mismos hijos, no puede reconocerse de nuevo a ti.',
      esReclamacion: false,
      pasoSiguiente:
        'En caso de concurrencia, la SS lo reconoce al progenitor con la pensión pública de menor ' +
        'cuantía. Si tu pensión es inferior, conviene revisar la asignación con un asesor.',
    };
  }

  // Caso 5: hombre con denegación previa antes de la doctrina TJUE/TS 2025
  if (genero === 'hombre' && otroProgenitor === 'denegado') {
    return {
      procede: true,
      hijosComputables,
      importeMensual,
      importeAnual,
      motivo:
        'Tras la STJUE 15-may-2025 y la doctrina del Tribunal Supremo (9-jul-2025), las denegaciones ' +
        'previas a hombres por no cumplir requisitos adicionales son revisables. El complemento debe ' +
        'reconocerse en las mismas condiciones que a las mujeres.',
      esReclamacion: true,
      pasoSiguiente:
        'Procede valorar reclamación: nueva solicitud o reclamación previa contra la resolución ' +
        'denegatoria, citando la STJUE C-623/23 y la doctrina TS. Recomendable acudir a un abogado ' +
        'laboralista o al sindicato.',
    };
  }

  // Caso general: procede
  return {
    procede: true,
    hijosComputables,
    importeMensual,
    importeAnual,
    motivo:
      genero === 'hombre'
        ? 'Tras la doctrina TJUE 2025 y TS 2025, los hombres tienen derecho al complemento en las ' +
          'mismas condiciones que las mujeres. Cumples los requisitos básicos del art. 60 LGSS.'
        : 'Cumples los requisitos básicos del art. 60 LGSS para reconocimiento automático del ' +
          'complemento (mujer con pensión contributiva e hijos computables).',
    esReclamacion: false,
    pasoSiguiente:
      'Si ya cobras la pensión y no aparece el complemento en tu nómina, presenta una solicitud ' +
      'expresa ante el INSS (Sede Electrónica de la SS) citando el art. 60 LGSS.',
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function VerificadorComplementoBrechaGeneroPage() {
  const [tipo, setTipo] = useState<TipoPension>('jubilacion');
  const [fecha, setFecha] = useState<FechaCausante>('desde_2021');
  const [hijos, setHijos] = useState<number>(2);
  const [genero, setGenero] = useState<Genero>('mujer');
  const [otroProgenitor, setOtroProgenitor] = useState<EstadoOtroProgenitor>('no_percibe');
  const [evaluado, setEvaluado] = useState(false);

  const resultado = useMemo(
    () => evaluar(tipo, fecha, hijos, genero, otroProgenitor),
    [tipo, fecha, hijos, genero, otroProgenitor],
  );

  const reset = () => {
    setEvaluado(false);
  };

  const relatedApps = getRelatedApps('verificador-complemento-brecha-genero');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Verificador del Complemento por Brecha de Género</h1>
        <p className={styles.subtitle}>
          5 preguntas para saber si te corresponde el complemento de 36,90 €/mes por hijo en
          tu pensión pública (2026)
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="verificador-complemento-brecha-genero"
      />

      <DataReference
        normativa="Complemento por Brecha de Género 2026"
        fuente={COMPLEMENTO_BRECHA_GENERO_META.fuente}
        verificado={COMPLEMENTO_BRECHA_GENERO_META.verificado}
        urlOficial={COMPLEMENTO_BRECHA_GENERO_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {/* ─── Panel izquierdo: checklist ─── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          {/* P1: tipo de pensión */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              1. ¿Qué pensión percibes (o vas a percibir)?
            </label>
            <div className={styles.optionGrid}>
              {([
                { id: 'jubilacion' as const, icon: '🌅', label: 'Jubilación' },
                { id: 'incapacidad' as const, icon: '♿', label: 'Incapacidad permanente' },
                { id: 'viudedad' as const, icon: '💍', label: 'Viudedad' },
                { id: 'no_contributiva' as const, icon: '🚫', label: 'No contributiva' },
                { id: 'ninguna' as const, icon: '❓', label: 'Ninguna aún' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${tipo === opt.id ? styles.optionActivo : ''}`}
                  onClick={() => { setTipo(opt.id); reset(); }}
                  aria-pressed={tipo === opt.id}
                >
                  <span aria-hidden="true">{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* P2: fecha del hecho causante */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              2. ¿Cuándo se causó (o se causará) tu pensión?
            </label>
            <div className={styles.optionGrid}>
              {([
                { id: 'antes_2021' as const, label: 'Antes del 4-feb-2021' },
                { id: 'desde_2021' as const, label: 'El 4-feb-2021 o después' },
                { id: 'sin_iniciar' as const, label: 'Aún sin solicitar' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${fecha === opt.id ? styles.optionActivo : ''}`}
                  onClick={() => { setFecha(opt.id); reset(); }}
                  aria-pressed={fecha === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className={styles.hint}>
              El 4 de febrero de 2021 es la fecha de entrada en vigor del complemento (RDL 3/2021).
            </p>
          </div>

          {/* P3: hijos */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="hijos">
              3. ¿Cuántos hijos o hijas (biológicos o adoptados antes del hecho causante)?
            </label>
            <input
              id="hijos"
              type="number"
              min={0}
              max={20}
              className={styles.input}
              value={hijos}
              onChange={e => { setHijos(Math.max(0, parseInt(e.target.value) || 0)); reset(); }}
            />
            <p className={styles.hint}>
              Cuentan hijos/as nacidos con vida o adoptados antes del hecho causante de la pensión.
              El complemento se calcula como máximo sobre 4 hijos.
            </p>
          </div>

          {/* P4: género */}
          <div className={styles.formGroup}>
            <label className={styles.label}>4. Sexo administrativo del solicitante</label>
            <div className={styles.optionGrid}>
              {([
                { id: 'mujer' as const, label: 'Mujer' },
                { id: 'hombre' as const, label: 'Hombre' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${genero === opt.id ? styles.optionActivo : ''}`}
                  onClick={() => { setGenero(opt.id); reset(); }}
                  aria-pressed={genero === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className={styles.hint}>
              Desde la STJUE 15-may-2025 y la doctrina del TS, hombres y mujeres tienen derecho en
              igualdad de condiciones.
            </p>
          </div>

          {/* P5: estado del otro progenitor */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              5. Estado del otro progenitor respecto al complemento
            </label>
            <div className={styles.optionGridStack}>
              {([
                { id: 'no_percibe' as const, label: 'No lo percibe ni lo ha solicitado' },
                { id: 'percibe' as const, label: 'Ya lo percibe por los mismos hijos' },
                { id: 'denegado' as const, label: 'Lo solicitó y se lo denegaron' },
                { id: 'no_aplica' as const, label: 'No procede (sin otro progenitor)' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${otroProgenitor === opt.id ? styles.optionActivo : ''}`}
                  onClick={() => { setOtroProgenitor(opt.id); reset(); }}
                  aria-pressed={otroProgenitor === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className={styles.hint}>
              Cada hijo/a solo puede generar un complemento para uno de los progenitores. Si hay
              concurrencia, la SS lo asigna al de pensión pública menor.
            </p>
          </div>

          <button
            type="button"
            className={styles.btn}
            onClick={() => setEvaluado(true)}
          >
            Verificar mi derecho
          </button>
        </div>

        {/* ─── Panel derecho: resultado ─── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Resultado orientativo</h2>

          {!evaluado ? (
            <p className={styles.placeholder}>
              Completa las 5 preguntas y pulsa &laquo;Verificar mi derecho&raquo; para revisar
              tu situación.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={resultado.procede ? styles.resultHeroPositivo : styles.resultHeroNegativo}>
                <div className={styles.resultIcon} aria-hidden="true">
                  {resultado.procede ? (resultado.esReclamacion ? '🔄' : '✅') : 'ℹ️'}
                </div>
                <div className={styles.resultImporte}>
                  {resultado.procede
                    ? `+${formatCurrency(resultado.importeMensual)}/mes`
                    : 'No procede ahora'}
                </div>
                <p className={styles.resultLabel}>
                  {resultado.procede
                    ? resultado.esReclamacion
                      ? 'Posible reclamación retroactiva'
                      : 'Cumples los requisitos básicos'
                    : 'Revisa el motivo abajo'}
                </p>
              </div>

              {resultado.procede && (
                <div className={styles.desgloseCard}>
                  <h3 className={styles.desgloseTitle}>Desglose económico</h3>
                  <div className={styles.desgloseItem}>
                    <span>Hijos computables</span>
                    <strong>{resultado.hijosComputables} (máx. {COMPLEMENTO_BRECHA_GENERO_2026.maxHijos})</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Cuantía por hijo</span>
                    <strong>{formatCurrency(COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual)}/mes</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Mensual estimado</span>
                    <strong>{formatCurrency(resultado.importeMensual)}/mes</strong>
                  </div>
                  <div className={`${styles.desgloseItem} ${styles.desgloseFinal}`}>
                    <span>Anual (14 pagas)</span>
                    <strong>{formatCurrency(resultado.importeAnual)}/año</strong>
                  </div>
                </div>
              )}

              <div className={styles.motivoCard}>
                <h3 className={styles.desgloseTitle}>¿Por qué?</h3>
                <p>{resultado.motivo}</p>
              </div>

              <div className={styles.siguienteCard}>
                <span aria-hidden="true">👉</span>
                <div>
                  <strong>Paso siguiente</strong>
                  <p>{resultado.pasoSiguiente}</p>
                </div>
              </div>

              <p className={styles.notaFinal}>
                <strong>Aviso:</strong> esta herramienta orienta sobre los 5 requisitos clave del
                art. 60 LGSS. El reconocimiento definitivo lo realiza el INSS tras valorar tu
                expediente completo. Si tu caso es complejo (denegaciones previas, concurrencia
                entre progenitores, situaciones de adopción) consulta con un abogado laboralista.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Contenido educativo v2.0 ─── */}
      <EducationalSection
        title="📚 Guía completa del complemento por brecha de género"
        subtitle="Qué es, quién puede pedirlo, cuánto se cobra y cómo reclamar"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el complemento por brecha de género?</h2>
          <p>
            Es una cuantía adicional que se añade a determinadas pensiones públicas contributivas para
            compensar el impacto que el cuidado de los hijos ha tenido en las carreras de cotización.
            Sustituyó en 2021 al antiguo complemento de maternidad. Está regulado en el artículo 60
            de la Ley General de la Seguridad Social (LGSS), tras su reforma por el RDL 3/2021.
          </p>
          <p>
            Su naturaleza es la de pensión pública contributiva: se abona junto con la pensión en 14
            pagas y <strong>no computa</strong> a efectos del límite máximo de pensiones públicas
            (3.359,60 €/mes en 2026).
          </p>

          {/* ─── 1. Tabla comparativa ─── */}
          <h2>Comparativa: antiguo complemento de maternidad vs. complemento actual</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Complemento de maternidad (hasta feb-2021)</th>
                  <th>Brecha de género (desde feb-2021)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Naturaleza del cálculo</td>
                  <td>% sobre la pensión (5%, 10% o 15% según nº hijos)</td>
                  <td>Importe fijo por hijo/a (36,90 €/mes en 2026)</td>
                </tr>
                <tr>
                  <td>Nº de hijos exigido</td>
                  <td>2 o más hijos</td>
                  <td>Desde 1 hijo/a</td>
                </tr>
                <tr>
                  <td>Máximo</td>
                  <td>15% (4 o más hijos)</td>
                  <td>4 hijos × 36,90 € = 147,60 €/mes</td>
                </tr>
                <tr>
                  <td>Acceso de hombres</td>
                  <td>Posible tras STJUE 2019 (caso WA)</td>
                  <td>Posible con requisitos adicionales hasta 2025</td>
                </tr>
                <tr>
                  <td>Tras STJUE 15-may-2025</td>
                  <td>—</td>
                  <td>Igualdad plena de trato hombre/mujer</td>
                </tr>
                <tr>
                  <td>Pensiones cubiertas</td>
                  <td>Jubilación, IP, viudedad</td>
                  <td>Jubilación, IP, viudedad (contributivas)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ─── 2. Casos de uso (3-4 perfiles) ─── */}
          <h2>Casos típicos</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3>👩 Mujer con 3 hijos, jubilación 2024</h3>
              <p>
                <strong>Situación:</strong> hecho causante posterior al 4-feb-2021, sin que el padre
                lo perciba. <strong>Resultado:</strong> 3 × 36,90 € = <strong>110,70 €/mes</strong>
                (1.549,80 €/año en 14 pagas). El INSS suele reconocerlo de oficio o con solicitud
                expresa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>👨 Hombre con denegación previa</h3>
              <p>
                <strong>Situación:</strong> solicitó el complemento en 2022 y se lo denegaron por no
                acreditar &laquo;requisitos adicionales&raquo;. <strong>Resultado:</strong> la doctrina
                TJUE/TS de 2025 abre la vía a reclamar. Conviene revisar la resolución con un asesor
                laboralista y plantear nueva solicitud o reclamación previa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>👫 Concurrencia entre progenitores</h3>
              <p>
                <strong>Situación:</strong> ambos progenitores cobran pensión contributiva y ambos
                tienen 2 hijos comunes. <strong>Resultado:</strong> solo uno puede percibir el
                complemento por esos hijos. La SS lo reconoce al progenitor con pensión pública de
                menor cuantía.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>🧓 Pensión anterior a feb-2021</h3>
              <p>
                <strong>Situación:</strong> jubilación causada en 2019. <strong>Resultado:</strong>
                no aplica el complemento actual. Si entonces percibía o se le denegó el antiguo
                complemento de maternidad, conviene revisar la doctrina de la STJUE 2019 (caso WA)
                con un profesional.
              </p>
            </div>
          </div>

          {/* ─── 3. FAQ ─── */}
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Hay que pedirlo expresamente o se reconoce de oficio?</h3>
              <p>
                En muchos casos el INSS lo reconoce automáticamente al resolver la pensión. Si no
                aparece en la nómina, conviene pedirlo por escrito ante el INSS citando el art. 60
                LGSS.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Sirve para pensiones no contributivas o PCI?</h3>
              <p>
                No. El complemento exige que la pensión sea <strong>contributiva</strong> (jubilación,
                incapacidad permanente o viudedad). Pensiones no contributivas, PNC, IMV o PCI quedan
                fuera.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuentan los hijos adoptados?</h3>
              <p>
                Sí. La norma habla de hijos &laquo;nacidos con vida o adoptados&raquo;, siempre que
                la adopción sea anterior al hecho causante de la pensión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Y los hijos fallecidos antes de los 16 años?</h3>
              <p>
                La doctrina administrativa también los computa si nacieron con vida, siempre que
                concurran el resto de requisitos. En supuestos dudosos, mejor acudir a un asesor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo cobrarlo si ya tengo la pensión máxima?</h3>
              <p>
                Sí. El complemento no computa para el límite máximo de pensiones públicas; se añade
                aunque ya percibas la pensión máxima.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo reclamar retroactivamente si soy hombre y me lo denegaron en 2022?</h3>
              <p>
                Sí, tras la STJUE 15-may-2025 y la doctrina TS de 9-jul-2025. La estrategia procesal
                concreta (nueva solicitud, reclamación previa, demanda) depende de las fechas y de tu
                resolución anterior. Es recomendable acudir a un abogado laboralista o al sindicato.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo se actualiza la cuantía cada año?</h3>
              <p>
                La cuantía se revaloriza según la Ley de Presupuestos y los Reales Decretos-Ley de
                pensiones de cada año. Para 2026, el RDL 3/2026 fijó 36,90 €/mes por hijo.
              </p>
              <p className={styles.faqTip}>
                💡 Si llevas tiempo cobrando el complemento, comprueba que tu nómina refleja la
                actualización anual.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es compatible con el complemento a mínimos?</h3>
              <p>
                Sí. Son complementos distintos con requisitos independientes. Puedes percibir ambos
                simultáneamente si cumples las condiciones de cada uno.
              </p>
            </div>
          </div>

          {/* ─── 4. Guía paso a paso ─── */}
          <h2>Cómo solicitarlo o reclamarlo</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Verifica los requisitos básicos</h3>
                <p>
                  Pensión contributiva, hecho causante posterior al 4-feb-2021 y al menos un hijo/a
                  computable. Esta herramienta te orienta sobre los 5 puntos clave.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Revisa tu nómina de pensión</h3>
                <p>
                  Comprueba si el complemento ya aparece como concepto separado. Si percibes la
                  pensión y no figura, lo más probable es que no se haya reconocido.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Presenta la solicitud en la Sede Electrónica de la SS</h3>
                <p>
                  Acceso con certificado digital, Cl@ve o DNI electrónico. Busca el trámite de
                  &laquo;revisión de pensión&raquo; o solicítalo por escrito en una oficina del
                  INSS, citando el art. 60 LGSS.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Aporta documentación de los hijos</h3>
                <p>
                  Libro de familia, certificaciones del Registro Civil, o auto de adopción. Si los
                  hijos viven en el extranjero, certificados consulares equivalentes.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Espera la resolución (≈ 90 días)</h3>
                <p>
                  Si la respuesta es favorable, el complemento se abona con efectos desde la fecha
                  que reconozca la SS. Si es desfavorable, se puede plantear reclamación previa en
                  30 días.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h3>Reclamación judicial (si procede)</h3>
                <p>
                  Si la reclamación previa también se desestima, queda la vía del Juzgado de lo
                  Social. Es momento de contar con un abogado laboralista, especialmente en casos
                  de denegación previa a hombres (doctrina TJUE/TS 2025).
                </p>
              </div>
            </li>
          </ol>

          {/* ─── 5. Mejores prácticas ─── */}
          <h2>Buenas prácticas al gestionar el complemento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📑</span>
              <h3>Guarda la resolución del INSS</h3>
              <p>
                Tanto si te lo reconocen como si te lo deniegan, conserva la resolución íntegra:
                marca los plazos para reclamar y es la base de cualquier defensa posterior.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
              <h3>Vigila la revalorización anual</h3>
              <p>
                La cuantía cambia cada año por LPGE o RDL. Comprueba en enero que tu nómina refleja
                la nueva cifra (en 2026, 36,90 €/mes por hijo).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <h3>Documenta la concurrencia familiar</h3>
              <p>
                Si el otro progenitor también solicita el complemento, ten claras las cuantías de
                ambas pensiones: la SS reconoce el complemento al de pensión menor.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h3>Aporta jurisprudencia si reclamas</h3>
              <p>
                En reclamaciones de hombres con denegaciones previas, citar la STJUE C-623/23
                (15-may-2025) y la doctrina del TS de 9-jul-2025 refuerza la solicitud.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <h3>Respeta los plazos</h3>
              <p>
                30 días naturales para reclamación previa tras una denegación. Pasado ese plazo, la
                resolución gana firmeza y la reclamación se complica.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <h3>Consulta antes de actuar</h3>
              <p>
                Un sindicato o abogado laboralista puede orientarte gratis (turno de oficio, asesoría
                sindical) sobre si tu caso justifica una reclamación.
              </p>
            </div>
          </div>

          {/* ─── 6. Errores frecuentes ─── */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores frecuentes que conviene evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Dar por hecho que no procede.</strong> Muchos pensionistas no lo solicitan
                pensando que se reconoce automáticamente. No siempre es así: revisa tu nómina.
              </li>
              <li>
                <strong>Confundirlo con el complemento de maternidad.</strong> Son figuras distintas
                con cálculos y requisitos diferentes. El antiguo se aplica solo a pensiones causadas
                antes del 4-feb-2021.
              </li>
              <li>
                <strong>Olvidar la incompatibilidad entre progenitores.</strong> Si ambos lo
                solicitan por los mismos hijos, solo lo cobrará uno. Acordadlo previamente.
              </li>
              <li>
                <strong>No reclamar tras una denegación previa (hombres).</strong> Las denegaciones
                previas a 2025 que aplicaban requisitos adicionales son cuestionables tras la
                doctrina TJUE/TS.
              </li>
              <li>
                <strong>Reclamar fuera de plazo.</strong> La reclamación previa tiene 30 días desde
                la notificación. Pasado ese plazo, hay que recurrir a vías más complejas.
              </li>
              <li>
                <strong>No actualizar el cálculo cada año.</strong> El importe se revaloriza: 30,40
                € en 2023, 33,20 € en 2024, 35,90 € en 2025, 36,90 € en 2026.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />

      <ShareCard appName="verificador-complemento-brecha-genero" />

      <Footer appName="verificador-complemento-brecha-genero" />
    </div>
  );
}
