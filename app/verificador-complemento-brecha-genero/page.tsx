'use client';

import { useState, useMemo } from 'react';
import styles from './VerificadorComplementoBrechaGenero.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, DataReference, RegionBadge,
} from '@/components';
import { formatCurrency, formatFechaLarga } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  COMPLEMENTO_BRECHA_GENERO_2026,
  COMPLEMENTO_BRECHA_GENERO_META,
  COMPLEMENTO_MATERNIDAD_DEROGADO,
  LIMITES_PENSION_2025,
} from '@/data/fiscal';

/**
 * Las dos resoluciones que fijan la igualdad de trato, LEÍDAS del módulo fiscal. Iban
 * tecleadas a mano en siete sitios de esta página y en dos de `metadata.ts` (hallazgo 606).
 */
const DOCTRINA = COMPLEMENTO_BRECHA_GENERO_META.doctrina;

/** Escala del complemento de maternidad derogado, leída del módulo (hallazgo 607) */
const MATERNIDAD = COMPLEMENTO_MATERNIDAD_DEROGADO;
const ESCALA_MATERNIDAD = MATERNIDAD.escala.map((t) => `${t.porcentaje}%`).join(', ');
const MAXIMO_MATERNIDAD = MATERNIDAD.escala[MATERNIDAD.escala.length - 1];

/**
 * Las cifras del complemento se escriben UNA vez, aquí, y se interpolan en toda la página.
 *
 * Antes estaban tecleadas a mano en once sitios (hero, hint, tabla comparativa, casos
 * típicos, FAQ, tips, metadata y la ficha de `data/applications.ts`) mientras el desglose
 * del resultado sí leía `data/fiscal`. Hoy coinciden todas, así que no había error visible:
 * el problema es la próxima revalorización, en la que el veredicto diría una cifra y el
 * resto de la página la anterior, sin que nada fallara.
 */
const CUANTIA_MES = formatCurrency(COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual);
const MAX_HIJOS = COMPLEMENTO_BRECHA_GENERO_2026.maxHijos;
const MAX_MES = formatCurrency(COMPLEMENTO_BRECHA_GENERO_2026.maxMensual);
const PENSION_MAXIMA_MES = formatCurrency(LIMITES_PENSION_2025.maximaMensual);
/**
 * Fecha mínima del hecho causante, leída de `data/fiscal` y no tecleada aquí (hallazgo 504):
 * hasta esta reparación el dato vivía declarado en el módulo fiscal sin ningún consumidor,
 * mientras la página repetía «4 de febrero de 2021» a mano en seis sitios.
 */
const FECHA_MINIMA = formatFechaLarga(COMPLEMENTO_BRECHA_GENERO_2026.fechaMinimaHechoCausante);
/** Igual que arriba, en formato corto DD-mes-AAAA para las opciones del formulario */
const FECHA_MINIMA_CORTA = FECHA_MINIMA.replace(/ de (\w+) de /, (_, mes) => `-${mes.slice(0, 3)}-`);

/** La exclusión del art. 60.4 LGSS, leída del módulo fiscal y no tecleada aquí. */
const EXCLUSION_PARCIAL = COMPLEMENTO_BRECHA_GENERO_2026.exclusiones.find(
  e => e.supuesto === 'jubilacion_parcial',
)!;

/** Cómputo de hijos nacidos con vida que fallecen después — STS 748/2023 (hallazgo 505) */
const COMPUTO_HIJO_FALLECIDO = COMPLEMENTO_BRECHA_GENERO_2026.computoHijoFallecido;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoPension = 'jubilacion' | 'jubilacion_parcial' | 'incapacidad' | 'viudedad' | 'no_contributiva' | 'ninguna';
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
  denegacionPropia: boolean,
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
  // Caso 1.bis: jubilación parcial. Es contributiva y es jubilación, así que hasta el
  // 24/08/2026 el cuestionario ni la distinguía ni la excluía: quien la percibía recibía
  // un «cumples los requisitos» y un importe, mientras el FAQPage de esta misma página
  // declaraba lo contrario a los buscadores (hallazgo 280 del Inspector).
  if (tipo === 'jubilacion_parcial') {
    return {
      procede: false,
      hijosComputables: 0,
      importeMensual: 0,
      importeAnual: 0,
      motivo: `${EXCLUSION_PARCIAL.norma} excluye expresamente el complemento en la jubilación parcial. ${EXCLUSION_PARCIAL.detalle}`,
      esReclamacion: false,
      pasoSiguiente:
        'Cuando pases de la jubilación parcial a la jubilación plena, solicita entonces el ' +
        'complemento ante el INSS citando el art. 60 LGSS.',
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
        `Tu pensión se causó antes del ${FECHA_MINIMA}, fecha en que entró en vigor el ` +
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

  /**
   * Caso 5: al SOLICITANTE le denegaron el complemento en su día.
   *
   * Esta rama miraba antes `otroProgenitor === 'denegado'`, que es una respuesta sobre la
   * OTRA persona: al hombre al que le habían denegado a él no había forma de decirlo, y el
   * que llegaba aquí lo hacía contestando por su ex pareja. El importe no cambiaba, pero el
   * encuadre sí —y en una app de riesgo crítico el encuadre es el producto: mandaba a un
   * abogado a impugnar una resolución denegatoria que el usuario no tenía—. Ahora lo
   * pregunta la P6, y la respuesta de la P5 sobre el otro progenitor no dispara nada.
   */
  if (denegacionPropia) {
    return {
      procede: true,
      hijosComputables,
      importeMensual,
      importeAnual,
      motivo:
        genero === 'hombre'
          ? `Tras la STJUE de ${DOCTRINA.stjue.fecha} (${DOCTRINA.stjue.asunto}) y la doctrina del Tribunal Supremo (${DOCTRINA.ts.fecha}), ` +
            'las denegaciones previas a hombres por no cumplir requisitos adicionales son revisables. ' +
            'El complemento debe reconocerse en las mismas condiciones que a las mujeres.'
          : 'Cumples los requisitos básicos del art. 60 LGSS, así que conviene revisar por qué se te ' +
            'denegó: el motivo de la resolución decide si cabe reclamar o si hay que subsanar algo.',
      esReclamacion: true,
      pasoSiguiente:
        genero === 'hombre'
          ? 'Procede valorar reclamación: nueva solicitud o reclamación previa contra la resolución ' +
            `denegatoria, citando la ${DOCTRINA.stjue.corto} y la doctrina TS. Recomendable acudir a un abogado ` +
            'laboralista o al sindicato.'
          : 'Recupera la resolución denegatoria y revisa su motivo con un abogado laboralista o con tu ' +
            'sindicato antes de volver a solicitarlo.',
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
  /**
   * El número de hijos se guarda como TEXTO y el número se deriva.
   *
   * ── Por qué (27/08/2026, hallazgo 470) ──────────────────────────────────────
   * Antes el estado era `number` y el `onChange` hacía `Math.max(0, parseInt(e.target.value) || 0)`
   * sobre un `<input type="number">`. Mientras el contenido no es un número válido el navegador
   * devuelve cadena vacía en `.value`, así que el 0 volvía al campo y el dígito ya escrito
   * desaparecía: tecleando «2.5» la traza era 2 → 0 → 05, y una entrada de dos hijos se
   * convertía en una de cinco. Como el módulo topa en 4, el importe se DUPLICABA —de 73,80 a
   * 147,60 €/mes— y el panel lo presentaba con «Cumples los requisitos básicos». Guardando el
   * texto, lo tecleado se queda donde el usuario lo puso y lo que no es un número se RECHAZA
   * en vez de convertirse en otro.
   */
  const [hijosTexto, setHijosTexto] = useState<string>('2');
  // Tope del CAMPO, no de la norma: es una guarda de interfaz contra valores disparatados
  // (la propia tool del MCP no lo aplica). Separado de "es un entero" para el hallazgo 506:
  // un texto que SÍ es un entero pero supera el tope no puede decir "no es un número entero".
  const LIMITE_HIJOS_CAMPO = 20;
  const hijosEsEntero = /^\d+$/.test(hijosTexto.trim());
  const hijosSuperaLimite = hijosEsEntero && Number(hijosTexto) > LIMITE_HIJOS_CAMPO;
  const hijosEsValido = hijosEsEntero && !hijosSuperaLimite;
  const hijos = hijosEsValido ? Number(hijosTexto) : 0;
  const [genero, setGenero] = useState<Genero>('mujer');
  const [otroProgenitor, setOtroProgenitor] = useState<EstadoOtroProgenitor>('no_percibe');
  const [denegacionPropia, setDenegacionPropia] = useState<boolean>(false);
  const [evaluado, setEvaluado] = useState(false);

  const resultado = useMemo(
    (): Resultado => {
      // Con el campo de hijos sin un número válido, el veredicto NO puede ser el de fondo:
      // «no tienes hijos computables» y «lo que has escrito no es un número» son cosas
      // distintas, y confundirlas es la misma clase de error que el 0 silencioso de antes.
      if (!hijosEsValido) {
        return {
          procede: false,
          hijosComputables: 0,
          importeMensual: 0,
          importeAnual: 0,
          // El campo VACÍO tiene su propia frase: citar la cadena vacía entre comillas
          // («" "» no se interpreta) es ruido, no información (hallazgo 608).
          motivo: hijosSuperaLimite
            ? `«${hijosTexto}» supera el tope de ${LIMITE_HIJOS_CAMPO} hijos de este campo, así que no hay nada que calcular todavía.`
            : hijosTexto.trim() === ''
              ? 'Falta el número de hijos, así que no hay nada que calcular todavía.'
              : `«${hijosTexto}» no es un número entero de hijos, así que no hay nada que calcular todavía.`,
          esReclamacion: false,
          pasoSiguiente: `Escribe en la pregunta 3 un número entero de 0 a ${LIMITE_HIJOS_CAMPO} y vuelve a verificar.`,
        };
      }
      return evaluar(tipo, fecha, hijos, genero, otroProgenitor, denegacionPropia);
    },
    [tipo, fecha, hijos, hijosEsValido, hijosSuperaLimite, hijosTexto, genero, otroProgenitor, denegacionPropia],
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
          6 preguntas para saber si te corresponde el complemento de {CUANTIA_MES}/mes por hijo
          en tu pensión pública
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
          {/* Los grupos de botones no son un control con label: sin role="group" +
              aria-labelledby, un lector de pantalla anuncia «Jubilación, botón» sin decir a
              qué pregunta responde. El único <label> con control asociado es el de P3. */}
          <div className={styles.formGroup} role="group" aria-labelledby="p1-titulo">
            <p className={styles.label} id="p1-titulo">
              1. ¿Qué pensión percibes (o vas a percibir)?
            </p>
            <div className={styles.optionGrid}>
              {([
                { id: 'jubilacion' as const, icon: '🌅', label: 'Jubilación (ordinaria o anticipada)' },
                { id: 'jubilacion_parcial' as const, icon: '🕐', label: 'Jubilación parcial' },
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
          <div className={styles.formGroup} role="group" aria-labelledby="p2-titulo">
            <p className={styles.label} id="p2-titulo">
              2. ¿Cuándo se causó (o se causará) tu pensión?
            </p>
            <div className={styles.optionGrid}>
              {([
                { id: 'antes_2021' as const, label: `Antes del ${FECHA_MINIMA_CORTA}` },
                { id: 'desde_2021' as const, label: `El ${FECHA_MINIMA_CORTA} o después` },
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
              El {FECHA_MINIMA} es la fecha de entrada en vigor del complemento (RDL 3/2021).
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
              max={LIMITE_HIJOS_CAMPO}
              className={styles.input}
              value={hijosTexto}
              onChange={e => { setHijosTexto(e.target.value); reset(); }}
              aria-invalid={!hijosEsValido}
              aria-describedby="hijos-ayuda"
            />
            {!hijosEsValido && (
              <p className={styles.hint} role="alert">
                <span aria-hidden="true">⚠️</span> {hijosSuperaLimite
                  ? `«${hijosTexto}» supera el tope de ${LIMITE_HIJOS_CAMPO} hijos de este campo: el cálculo no se hace.`
                  : hijosTexto.trim() === ''
                    ? `Escribe un número entero de hijos, de 0 a ${LIMITE_HIJOS_CAMPO}.`
                    : `Escribe un número entero de hijos, de 0 a ${LIMITE_HIJOS_CAMPO}: «${hijosTexto}» no se interpreta.`}
              </p>
            )}
            <p className={styles.hint} id="hijos-ayuda">
              Cuentan hijos/as nacidos con vida o adoptados antes del hecho causante de la pensión.
              El complemento se calcula como máximo sobre {MAX_HIJOS} hijos.
            </p>
          </div>

          {/* P4: género */}
          <div className={styles.formGroup} role="group" aria-labelledby="p4-titulo">
            <p className={styles.label} id="p4-titulo">4. Sexo administrativo del solicitante</p>
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
              Desde la STJUE de {DOCTRINA.stjue.fecha} y la doctrina del TS, hombres y mujeres tienen derecho en
              igualdad de condiciones.
            </p>
          </div>

          {/* P5: estado del otro progenitor */}
          <div className={styles.formGroup} role="group" aria-labelledby="p5-titulo">
            <p className={styles.label} id="p5-titulo">
              5. Estado del otro progenitor respecto al complemento
            </p>
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

          {/* P6: denegación PROPIA — la que decide si procede reclamar. La P5 pregunta por la
              otra persona, así que no puede usarse para esto (ver `evaluar`, caso 5). */}
          <div className={styles.formGroup} role="group" aria-labelledby="p6-titulo">
            <p className={styles.label} id="p6-titulo">
              6. ¿Solicitaste tú el complemento y te lo denegaron?
            </p>
            <div className={styles.optionGrid}>
              {([
                { id: false, label: 'No' },
                { id: true, label: 'Sí, tengo una resolución denegatoria' },
              ] as const).map(opt => (
                <button
                  key={String(opt.id)}
                  type="button"
                  className={`${styles.optionBtn} ${denegacionPropia === opt.id ? styles.optionActivo : ''}`}
                  onClick={() => { setDenegacionPropia(opt.id); reset(); }}
                  aria-pressed={denegacionPropia === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className={styles.hint}>
              Se refiere a una denegación a TI, no al otro progenitor. Las denegaciones a hombres
              anteriores a 2025 por «requisitos adicionales» son revisables tras la {DOCTRINA.stjue.corto}.
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
        {/* El veredicto es el producto entero de la app: sin región anunciable, pulsar
            «Verificar mi derecho» con lector de pantalla no decía absolutamente nada. */}
        <div className={styles.card} role="status" aria-live="polite">
          <h2 className={styles.cardTitle}>Resultado orientativo</h2>

          {!evaluado ? (
            <p className={styles.placeholder}>
              Completa las 6 preguntas y pulsa &laquo;Verificar mi derecho&raquo; para revisar
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
        title="Guía completa del complemento por brecha de género"
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
            ({PENSION_MAXIMA_MES}/mes), por el {COMPLEMENTO_BRECHA_GENERO_2026.concurrencia.noComputaAlLimiteMaximo.norma}.
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
                  <td>% sobre la pensión ({ESCALA_MATERNIDAD} según nº hijos)</td>
                  <td>Importe fijo por hijo/a ({CUANTIA_MES}/mes)</td>
                </tr>
                <tr>
                  <td>Nº de hijos exigido</td>
                  <td>{MATERNIDAD.minimoHijos} o más hijos</td>
                  <td>Desde 1 hijo/a</td>
                </tr>
                <tr>
                  <td>Máximo</td>
                  <td>{MAXIMO_MATERNIDAD.porcentaje}% ({MAXIMO_MATERNIDAD.hijos} o más hijos)</td>
                  <td>{MAX_HIJOS} hijos × {CUANTIA_MES} = {MAX_MES}/mes</td>
                </tr>
                <tr>
                  <td>Acceso de hombres</td>
                  <td>Posible tras la {MATERNIDAD.doctrinaAcceso}</td>
                  <td>Posible con requisitos adicionales hasta 2025</td>
                </tr>
                <tr>
                  <td>Tras la STJUE de {DOCTRINA.stjue.fecha}</td>
                  <td>—</td>
                  <td>Igualdad plena de trato hombre/mujer</td>
                </tr>
                <tr>
                  <td>Pensiones cubiertas</td>
                  <td>Jubilación, IP, viudedad</td>
                  <td>
                    Jubilación, IP, viudedad (contributivas), salvo la{' '}
                    <strong>jubilación parcial</strong>, excluida por el{' '}
                    {EXCLUSION_PARCIAL.norma}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ─── 2. Casos de uso (3-4 perfiles) ─── */}
          <h2>Casos típicos</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">👩</span> Mujer con 3 hijos, jubilación 2024</h3>
              <p>
                <strong>Situación:</strong> hecho causante posterior al {FECHA_MINIMA_CORTA}, sin que el padre
                lo perciba. <strong>Resultado:</strong> 3 × {CUANTIA_MES} ={' '}
                <strong>{formatCurrency(3 * COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual)}/mes</strong>{' '}
                ({formatCurrency(3 * COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual * COMPLEMENTO_BRECHA_GENERO_2026.pagasAnuales)}/año
                en {COMPLEMENTO_BRECHA_GENERO_2026.pagasAnuales} pagas). El INSS suele reconocerlo de oficio o con
                solicitud expresa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">👨</span> Hombre con denegación previa</h3>
              <p>
                <strong>Situación:</strong> solicitó el complemento en 2022 y se lo denegaron por no
                acreditar &laquo;requisitos adicionales&raquo;. <strong>Resultado:</strong> la doctrina
                TJUE/TS de 2025 abre la vía a reclamar. Conviene revisar la resolución con un asesor
                laboralista y plantear nueva solicitud o reclamación previa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">👫</span> Concurrencia entre progenitores</h3>
              <p>
                <strong>Situación:</strong> ambos progenitores cobran pensión contributiva y ambos
                tienen 2 hijos comunes. <strong>Resultado:</strong> solo uno puede percibir el
                complemento por esos hijos. La SS lo reconoce al progenitor con pensión pública de
                menor cuantía.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🧓</span> Pensión anterior a feb-2021</h3>
              <p>
                <strong>Situación:</strong> jubilación causada en 2019. <strong>Resultado:</strong>
                no aplica el complemento actual. Si entonces percibía o se le denegó el antiguo
                complemento de maternidad, conviene revisar la doctrina de la {MATERNIDAD.doctrinaAcceso}
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
                fuera. Y hay una modalidad contributiva que también queda fuera: la{' '}
                <strong>jubilación parcial</strong>. {EXCLUSION_PARCIAL.detalle}{' '}
                ({EXCLUSION_PARCIAL.norma}).
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
                {COMPUTO_HIJO_FALLECIDO.detalle} Lo fija la {COMPUTO_HIJO_FALLECIDO.sentencia},
                que distingue este caso del hijo nacido sin vida, a quien el {COMPUTO_HIJO_FALLECIDO.norma}{' '}
                sí excluye. En supuestos dudosos, mejor acudir a un asesor.
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
                Sí, tras la STJUE de {DOCTRINA.stjue.fecha} y la doctrina del TS de {DOCTRINA.ts.fecha}. La estrategia procesal
                concreta (nueva solicitud, reclamación previa, demanda) depende de las fechas y de tu
                resolución anterior. Es recomendable acudir a un abogado laboralista o al sindicato.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo se actualiza la cuantía cada año?</h3>
              <p>
                La cuantía se revaloriza según la Ley de Presupuestos y los Reales Decretos-Ley de
                pensiones de cada año. La cuantía vigente que aplica esta herramienta es de{' '}
                {CUANTIA_MES}/mes por hijo.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si llevas tiempo cobrando el complemento, comprueba que tu nómina refleja la
                actualización anual.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es compatible con el complemento a mínimos?</h3>
              <p>
                Sí, y el {COMPLEMENTO_BRECHA_GENERO_2026.concurrencia.compatibleConComplementoAMinimos.norma} lo dice expresamente: el importe de este complemento{' '}
                <strong>no cuenta como ingreso</strong> para decidir si tienes derecho al complemento
                por mínimos del art. 59. Cuando procede, se reconoce primero la cuantía mínima que
                fije la Ley de Presupuestos y a ese importe <strong>se le suma</strong> el
                complemento por brecha de género.
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
                  Pensión contributiva, hecho causante posterior al {FECHA_MINIMA_CORTA} y al menos un hijo/a
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
                <h3>Espera la resolución (≈ {COMPLEMENTO_BRECHA_GENERO_2026.plazos.resolucionInssDiasOrientativo} días)</h3>
                <p>
                  Si la respuesta es favorable, el complemento se abona con efectos desde la fecha
                  que reconozca la SS. Si es desfavorable, se puede plantear reclamación previa en{' '}
                  {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaDias} días{' '}
                  {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaTipoDias}{' '}
                  ({COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaNorma}).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h3>Reclamación judicial (si procede)</h3>
                <p>
                  Si la reclamación previa también se desestima, queda la vía del Juzgado de lo
                  Social. No hace falta esperar a una respuesta:{' '}
                  {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaResolucion.detalle}{' '}
                  ({COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaResolucion.norma}). Es
                  momento de contar con un abogado laboralista, especialmente en casos de
                  denegación previa a hombres (doctrina TJUE/TS 2025).
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
                la nueva cifra (hoy, {CUANTIA_MES}/mes por hijo).
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
                En reclamaciones de hombres con denegaciones previas, citar la {DOCTRINA.stjue.corto}
                ({DOCTRINA.stjue.fecha}) y la doctrina del TS de {DOCTRINA.ts.fecha} refuerza la solicitud.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <h3>Respeta los plazos</h3>
              <p>
                {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaDias} días{' '}
                {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaTipoDias} para reclamación previa
                tras una denegación ({COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaNorma}):
                no cuentan sábados, domingos ni festivos, así que el plazo real es más largo que
                un mes de calendario.{' '}
                {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaReiterable.detalle}{' '}
                ({COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaReiterable.norma})
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <h3>Consulta antes de actuar</h3>
              <p>
                Un abogado laboralista o un sindicato pueden orientarte sobre si tu caso justifica
                una reclamación, pero ninguno de los dos es gratis sin condición: el turno de
                oficio exige que se te reconozca el derecho a la asistencia jurídica gratuita
                (Ley 1/1996, por umbrales de renta), y la asesoría sindical suele requerir estar
                afiliado. Si no cumples ninguna de las dos, infórmate del coste antes de consultar.
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
                antes del {FECHA_MINIMA_CORTA}.
              </li>
              <li>
                <strong>Olvidar la incompatibilidad entre progenitores.</strong> Si ambos lo
                solicitan por los mismos hijos, solo lo cobrará uno. No es un reparto que se
                pacte entre ellos: en caso de concurrencia, la SS lo asigna de oficio al
                progenitor con la pensión pública de menor cuantía.
              </li>
              <li>
                <strong>No reclamar tras una denegación previa (hombres).</strong> Las denegaciones
                previas a 2025 que aplicaban requisitos adicionales son cuestionables tras la
                doctrina TJUE/TS.
              </li>
              <li>
                <strong>Contar el plazo en días naturales.</strong> La reclamación previa tiene{' '}
                {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaDias} días{' '}
                {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaTipoDias} desde la notificación
                ({COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaNorma}), no naturales: al
                descontar sábados, domingos y festivos, quien cuenta del calendario se da por fuera
                de plazo antes de tiempo.{' '}
                {COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaReiterable.detalle}{' '}
                ({COMPLEMENTO_BRECHA_GENERO_2026.plazos.reclamacionPreviaReiterable.norma})
              </li>
              {/* La serie 30,40 / 33,20 / 35,90 que había aquí no estaba en data/fiscal ni
                  citaba fuente: solo el valor vigente es verificable, y es el que se usa. */}
              <li>
                <strong>No actualizar el cálculo cada año.</strong> El importe se revaloriza en cada
                ejercicio, así que una estimación hecha con la cuantía de hace dos años se queda
                corta. La vigente hoy es {CUANTIA_MES}/mes por hijo.
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
