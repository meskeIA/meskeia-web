'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './VerificadorComplementoBrechaGenero.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, DataReference, RegionBadge,
} from '@/components';
import { formatCurrency, formatFechaLarga, formatPercentage, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  COMPLEMENTO_BRECHA_GENERO_2026,
  COMPLEMENTO_BRECHA_GENERO_META,
  COMPLEMENTO_MATERNIDAD_DEROGADO,
  FISCAL_PENSIONES_META,
  LIMITES_PENSION_2025,
  RECLAMACION_PREVIA_SS_META,
} from '@/data/fiscal';
/**
 * El recuento de requisitos se importa del MOTOR del MCP, que es el gemelo de esta app: así
 * la web, las dos tools del MCP y el FAQPage cuentan lo mismo por construcción (hallazgo
 * 654, que había dejado «5 requisitos clave» donde el verificador evalúa cuatro).
 */
import {
  NUM_REQUISITOS_ART60,
  conCita,
  COMO_SE_COMPARA,
  EXCLUSION_ART60_3B,
  PASO_EXCLUSION_ART60_3B,
  PASO_SOLICITUD_CONCURRENCIA,
  PASO_EXTINCION,
} from '@/lib/calculadoras/complementoBrechaGenero';

/**
 * Las dos resoluciones que fijan la igualdad de trato, LEÍDAS del módulo fiscal. Iban
 * tecleadas a mano en siete sitios de esta página y en dos de `metadata.ts` (hallazgo 606).
 */
const DOCTRINA = COMPLEMENTO_BRECHA_GENERO_META.doctrina;

/** Escala del complemento de maternidad derogado, leída del módulo (hallazgo 607) */
const MATERNIDAD = COMPLEMENTO_MATERNIDAD_DEROGADO;
// El % va separado de la cifra con espacio duro U+00A0 (RAE 2010; norma del 25/09/2026,
// hallazgo 2244): así no salta solo a la línea siguiente.
const PORCENTAJE = (n: number) => `${n} %`;
const ESCALA_MATERNIDAD = MATERNIDAD.escala.map((t) => PORCENTAJE(t.porcentaje)).join(', ');
const MAXIMO_MATERNIDAD = MATERNIDAD.escala[MATERNIDAD.escala.length - 1];

/** Pagas en que se abona el complemento, leídas del módulo (hallazgo 2245) */
const PAGAS = COMPLEMENTO_BRECHA_GENERO_2026.pagasAnuales;

/**
 * Concurrencia de los dos progenitores (art. 60.1 y 60.2 LGSS), leída del módulo fiscal.
 *
 * Hasta el 26/09/2026 «el otro progenitor ya lo percibe» se contestaba con una denegación
 * cerrada, y la regla se enunciaba con «la pensión pública de menor cuantía». La norma
 * compara la SUMA de pensiones públicas de cada progenitor y prevé que reconocérselo al
 * segundo extinga el del primero: el veredicto depende de qué suma es menor, y eso es lo
 * que pregunta ahora la P5 bis (hallazgos 2239 y 2240).
 */
const CONCURRENCIA = COMPLEMENTO_BRECHA_GENERO_2026.concurrencia.entreProgenitores;
const REGLA_CONCURRENCIA =
  `Cada hijo o hija da derecho a un solo complemento (${CONCURRENCIA.unComplementoPorHijo.norma}), ` +
  `y el ${CONCURRENCIA.norma} lo asigna al progenitor ${CONCURRENCIA.criterio}.`;
/**
 * CÓMO se compara esa suma: art. 60.7 LGSS, importe inicial revalorizado y SIN complementos
 * (hallazgo 2538). Hasta el 01/10/2026 la P5 bis mandaba sumar «TODAS» las pensiones, y como
 * el propio complemento es pensión pública contributiva (art. 60.3), quien ya lo cobraba lo
 * sumaba y la respuesta se invertía: 900 + 73,80 € frente a 950 € daba el complemento al que
 * no le correspondía.
 */
const COMPARACION = CONCURRENCIA.comparacion;

/** Prorrata temporis del art. 60.3.f) LGSS (hallazgo 2541), leída del módulo */
const PRORRATA = COMPLEMENTO_BRECHA_GENERO_2026.prorrataTemporis;
/** Pensiones sobre las que se pregunta la prorrata: las que dan derecho al complemento */
const TIPOS_CON_PRORRATA: readonly TipoPension[] = ['jubilacion', 'incapacidad', 'viudedad'];

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

/**
 * Cómputo de hijos nacidos con vida que fallecen después — STS 748/2023 (hallazgo 505). Su
 * `norma` es el art. 60.3.a) LGSS desde el 01/10/2026: citaba el 60.1, que no dice «con
 * vida» (hallazgo 2542).
 */
const COMPUTO_HIJO_FALLECIDO = COMPLEMENTO_BRECHA_GENERO_2026.computoHijoFallecido;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoPension = 'jubilacion' | 'jubilacion_parcial' | 'incapacidad' | 'viudedad' | 'no_contributiva' | 'ninguna';
type Genero = 'mujer' | 'hombre';
type EstadoOtroProgenitor = 'no_aplica' | 'no_percibe' | 'percibe' | 'denegado';
type FechaCausante = 'antes_2021' | 'desde_2021' | 'sin_iniciar';
/** P5 bis: de quién es la SUMA de pensiones públicas menor (solo si el otro ya lo percibe) */
type SumaMenor = 'propia' | 'otro_progenitor' | 'desconocida';

interface OpcionRadio<T> {
  id: T;
  label: string;
  icon?: string;
}

interface GrupoRadioProps<T> {
  /** id del enunciado que nombra el grupo */
  idTitulo: string;
  /** id de la ayuda que lo describe, si la hay */
  idAyuda?: string;
  opciones: readonly OpcionRadio<T>[];
  valor: T;
  onElegir: (v: T) => void;
  apilado?: boolean;
}

/**
 * Pregunta de elección única como grupo de radio (patrón WAI-ARIA «Radio Group»).
 *
 * Hasta el 26/09/2026 eran `<button aria-pressed>` dentro de `role="group"`: un lector de
 * pantalla anunciaba conmutadores independientes, y al elegir otra opción la anterior se
 * desmarcaba sin anuncio (hallazgo 2243, el patrón de 950, 1341 y 2074). Ahora cada
 * opción es `role="radio"` con `aria-checked`, y el foco es itinerante: solo la opción
 * marcada entra en el orden de tabulación y las flechas mueven la selección y el foco.
 */
function GrupoRadio<T extends string | boolean>({
  idTitulo, idAyuda, opciones, valor, onElegir, apilado = false,
}: GrupoRadioProps<T>) {
  const tecla = (e: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const n = opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % n;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + n) % n;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = n - 1;
    else return;
    e.preventDefault();
    onElegir(opciones[destino].id);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  };

  return (
    <div
      className={apilado ? styles.optionGridStack : styles.optionGrid}
      role="radiogroup"
      aria-labelledby={idTitulo}
      aria-describedby={idAyuda}
    >
      {opciones.map((opt, i) => {
        const marcada = valor === opt.id;
        return (
          <button
            key={String(opt.id)}
            type="button"
            role="radio"
            aria-checked={marcada}
            tabIndex={marcada ? 0 : -1}
            className={`${styles.optionBtn} ${marcada ? styles.optionActivo : ''}`}
            onClick={() => onElegir(opt.id)}
            onKeyDown={(e) => tecla(e, i)}
          >
            {opt.icon && <span aria-hidden="true">{opt.icon}</span>} {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface Resultado {
  procede: boolean;
  /**
   * true cuando NO se ha podido evaluar (el campo de hijos no trae un número válido).
   *
   * No es lo mismo que `procede: false`, y hasta el 21/09/2026 la pantalla los decía con el
   * mismo titular: «No procede ahora / Revisa el motivo abajo», letra por letra igual al
   * rechazo real por el requisito 3 del art. 60 LGSS. En esta app el titular ES el producto
   * —responde «¿te corresponde?»—, así que se le contestaba que no a quien ni siquiera se
   * había llegado a evaluar, y el coste del malentendido en una app de riesgo 1 es dejar de
   * pedir un complemento que corresponde (hallazgo 1171).
   */
  sinCalcular?: boolean;
  /**
   * true cuando el derecho DEPENDE de un dato que falta: el otro progenitor ya lo percibe y
   * no se sabe qué suma de pensiones públicas es menor (hallazgo 2239). No es un «no»:
   * los importes son los que corresponderían si la suma propia es la menor.
   */
  condicionado?: boolean;
  /** true cuando procede porque la suma propia es la menor: se extingue el del otro */
  concurrenciaAFavor?: boolean;
  hijosComputables: number;
  /**
   * Prorrata de la pensión (%) aplicada al importe, si se causó por totalización
   * internacional a prorrata temporis (art. 60.3.f LGSS, hallazgo 2541).
   */
  prorrata?: number;
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
  sumaMenor: SumaMenor,
  denegacionPropia: boolean,
  /** P3 bis: le alcanza una exclusión del art. 60.3.b) LGSS (hallazgo 2540) */
  excluido: boolean,
  /** P1 bis: prorrata de la pensión en %, o null si no es a prorrata (hallazgo 2541) */
  prorrata: number | null,
): Resultado {
  const { cuantiaPorHijoMensual, maxHijos, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
  const hijosComputables = Math.min(numHijos, maxHijos);
  // Art. 60.3.f: con prorrata temporis, la cuantía por hijo es el importe TEÓRICO y se cobra
  // la prorrata de la pensión. Redondeado al céntimo, como el motor del MCP.
  const factorProrrata = prorrata !== null ? prorrata / 100 : 1;
  const importeMensual = Math.round(hijosComputables * cuantiaPorHijoMensual * factorProrrata * 100) / 100;
  const importeAnual = importeMensual * pagasAnuales;
  const conProrrata = prorrata !== null ? { prorrata } : {};

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
      // La cita del régimen derogado sale del módulo, como ya sale dos veces más abajo en esta
      // misma página: aquí iba tecleada y DEGRADADA —sin fecha y sin número de asunto— justo
      // donde se manda consultar a un profesional, que es cuando hace falta la cita completa
      // (hallazgo 1172).
      pasoSiguiente:
        'Si entonces percibías o se te denegó el antiguo complemento de maternidad, consulta a un ' +
        `profesional: la ${MATERNIDAD.doctrinaAcceso} también afectó a aquel régimen.`,
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

  /**
   * Caso 3.bis: exclusiones del art. 60.3.b) LGSS (hallazgo 2540). Hasta el 01/10/2026 no
   * se preguntaban ni se mencionaban, y a quien estaba privado de la patria potestad la app
   * le daba «+73,80 €/mes · Cumples los requisitos básicos». Un aviso debajo de esa cifra no
   * bastaba (quien lee se lleva el número), así que se pregunta y, si alcanza, no hay cifra.
   */
  if (excluido) {
    return {
      procede: false,
      hijosComputables: 0,
      importeMensual: 0,
      importeAnual: 0,
      motivo: `No procede por el ${EXCLUSION_ART60_3B.norma}. ${EXCLUSION_ART60_3B.detalle}`,
      esReclamacion: false,
      pasoSiguiente: PASO_EXCLUSION_ART60_3B,
    };
  }

  /**
   * Caso 4: el otro progenitor ya percibe el complemento por los mismos hijos.
   *
   * NO es una incompatibilidad (hallazgo 2239). Hasta el 26/09/2026 esta rama contestaba
   * «No procede ahora» y «no puede reconocerse de nuevo a ti», cuando el art. 60.1 LGSS lo
   * asigna al progenitor titular de pensiones públicas cuya SUMA sea de menor cuantía y el
   * 60.2 prevé que reconocérselo al segundo extinga el del primero. En una app de riesgo 1
   * cuyo titular es el producto, aquel «no» llevaba a no pedir un complemento que
   * corresponde. Ahora decide la P5 bis; si no se sabe qué suma es menor, el veredicto es
   * condicionado. Mismo árbol que el motor del MCP (`calcularComplementoBrechaGenero`).
   */
  const concurrenciaAFavor = otroProgenitor === 'percibe' && sumaMenor === 'propia';
  if (otroProgenitor === 'percibe' && sumaMenor === 'otro_progenitor') {
    return {
      procede: false,
      hijosComputables,
      importeMensual: 0,
      importeAnual: 0,
      motivo:
        `${REGLA_CONCURRENCIA} El otro progenitor ya lo percibe por los mismos hijos y su suma de ` +
        'pensiones públicas es menor que la tuya, así que le corresponde a él o a ella.',
      esReclamacion: false,
      pasoSiguiente: `Comprueba la comparación. ${COMO_SE_COMPARA} Si en realidad tu suma es la menor, puedes solicitarlo.`,
    };
  }
  if (otroProgenitor === 'percibe' && sumaMenor === 'desconocida') {
    return {
      procede: false,
      condicionado: true,
      hijosComputables,
      ...conProrrata,
      importeMensual,
      importeAnual,
      motivo:
        `${REGLA_CONCURRENCIA} Que el otro progenitor ya lo perciba no te lo cierra: si tu suma ` +
        `es la menor, se te reconoce a ti y se extingue el suyo (${CONCURRENCIA.extincion.norma}); ` +
        'si es la suya, lo conserva él o ella.',
      esReclamacion: false,
      // La regla del art. 60.7 va aquí, que es donde el usuario hace la cuenta (hallazgo 2538)
      pasoSiguiente:
        `${COMO_SE_COMPARA} Después contesta la pregunta 5 bis. Si la tuya es la menor, ` +
        `solicítalo ante el INSS citando el art. 60 LGSS. ${COMPARACION.desempate.detalle}`,
    };
  }
  /** Lo que se antepone al motivo y se añade al paso siguiente si la suma propia es la menor */
  const MOTIVO_A_FAVOR =
    `${REGLA_CONCURRENCIA} El otro progenitor ya lo percibe por los mismos hijos, pero tu suma de ` +
    'pensiones públicas es la menor, así que te corresponde a ti. ';
  /**
   * El paso siguiente de la concurrencia a favor NO es el de la rama general («si no aparece
   * en tu nómina…»): mientras lo cobra el otro progenitor no va a aparecer solo. Hace falta
   * solicitud expresa y una resolución, con audiencia al otro y efectos desde el mes
   * siguiente (art. 60.2, hallazgo 2543). Y la cita va antes del punto final, no colgada
   * detrás (hallazgo 2544). Las frases son las del motor del MCP: las dos vías dicen lo mismo.
   */
  const pasoAFavor = (r: Resultado): string =>
    `${r.esReclamacion ? r.pasoSiguiente : PASO_SOLICITUD_CONCURRENCIA} ${PASO_EXTINCION}`;

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
  const conConcurrencia = (r: Resultado): Resultado => {
    const conImporte = { ...r, ...conProrrata };
    return concurrenciaAFavor
      ? { ...conImporte, concurrenciaAFavor: true, motivo: MOTIVO_A_FAVOR + r.motivo, pasoSiguiente: pasoAFavor(r) }
      : conImporte;
  };

  if (denegacionPropia) {
    return conConcurrencia({
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
    });
  }

  // Caso general: procede
  return conConcurrencia({
    procede: true,
    hijosComputables,
    importeMensual,
    importeAnual,
    motivo:
      genero === 'hombre'
        // Misma cita que la rama de reclamación de arriba, que sí interpola el sello: dos ramas
        // del mismo motor, una leyendo el módulo y la otra escribiendo el año (hallazgo 1173).
        ? `Tras la STJUE de ${DOCTRINA.stjue.fecha} (${DOCTRINA.stjue.asunto}) y la doctrina del ` +
          `Tribunal Supremo (${DOCTRINA.ts.fecha}), los hombres tienen derecho al complemento en las ` +
          'mismas condiciones que las mujeres. Cumples los requisitos básicos del art. 60 LGSS.'
        // En la concurrencia a favor NO es automático: lo cobra el otro progenitor y hace
        // falta resolución con audiencia (art. 60.2, hallazgo 2543).
        : concurrenciaAFavor
          ? 'Cumples los requisitos básicos del art. 60 LGSS (pensión contributiva e hijos computables).'
          : 'Cumples los requisitos básicos del art. 60 LGSS para reconocimiento automático del ' +
            'complemento (mujer con pensión contributiva e hijos computables).',
    esReclamacion: false,
    pasoSiguiente:
      'Si ya cobras la pensión y no aparece el complemento en tu nómina, presenta una solicitud ' +
      'expresa ante el INSS (Sede Electrónica de la SS) citando el art. 60 LGSS.',
  });
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
  const [sumaMenor, setSumaMenor] = useState<SumaMenor>('desconocida');
  const [denegacionPropia, setDenegacionPropia] = useState<boolean>(false);
  /** P3 bis — exclusiones del art. 60.3.b) LGSS (hallazgo 2540) */
  const [excluido, setExcluido] = useState<boolean>(false);
  /**
   * P1 bis — pensión a prorrata temporis (art. 60.3.f LGSS, hallazgo 2541). La prorrata se
   * guarda como TEXTO, como el número de hijos, y se lee con `parseSpanishNumber`: «37,5»
   * es 37,5 % y lo que no es un número no se convierte en otro.
   */
  const [aProrrata, setAProrrata] = useState<boolean>(false);
  const [prorrataTexto, setProrrataTexto] = useState<string>('');
  const prorrataAplica = TIPOS_CON_PRORRATA.includes(tipo) && aProrrata;
  const prorrataLeida = parseSpanishNumber(prorrataTexto);
  const prorrataEsValida = Number.isFinite(prorrataLeida) && prorrataLeida > 0 && prorrataLeida <= 100;
  const [evaluado, setEvaluado] = useState(false);
  /**
   * Cuántas veces se ha pulsado «Verificar mi derecho». Es la señal para llevar el
   * veredicto a la vista: en móvil nace unos 230 px por debajo del borde inferior y ni el
   * scroll ni el foco lo seguían, así que a la vista no pasaba nada (hallazgo 2247). Un
   * contador y no `evaluado`, porque volver a pulsar con el veredicto ya pintado no cambia
   * `evaluado` y también tiene que llevarlo a la vista.
   */
  const [verificaciones, setVerificaciones] = useState(0);
  const veredictoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (verificaciones === 0) return;
    const el = veredictoRef.current;
    if (!el) return;
    const caja = el.getBoundingClientRect();
    // Salto directo y no suave: el veredicto tiene que estar a la vista al soltar el dedo,
    // y así tampoco hay animación que respetar para prefers-reduced-motion.
    if (caja.top < 0 || caja.bottom > window.innerHeight) {
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    el.focus({ preventScroll: true });
  }, [verificaciones]);

  const resultado = useMemo(
    (): Resultado => {
      // Con el campo de hijos sin un número válido, el veredicto NO puede ser el de fondo:
      // «no tienes hijos computables» y «lo que has escrito no es un número» son cosas
      // distintas, y confundirlas es la misma clase de error que el 0 silencioso de antes.
      if (!hijosEsValido) {
        return {
          procede: false,
          sinCalcular: true,
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
      const r = evaluar(
        tipo, fecha, hijos, genero, otroProgenitor, sumaMenor, denegacionPropia, excluido,
        prorrataAplica && prorrataEsValida ? prorrataLeida : null,
      );
      // Pensión a prorrata sin una prorrata válida: si el veredicto lleva cifra, no se da.
      // El importe íntegro sería falso, y un aviso debajo no lo arregla (hallazgo 2541).
      if (prorrataAplica && !prorrataEsValida && (r.procede || r.condicionado)) {
        return {
          procede: false,
          sinCalcular: true,
          hijosComputables: 0,
          importeMensual: 0,
          importeAnual: 0,
          motivo: prorrataTexto.trim() === ''
            ? 'Falta la prorrata de tu pensión, así que no hay importe que calcular todavía: con prorrata, el complemento se reduce en ella.'
            : `«${prorrataTexto}» no es una prorrata válida (un porcentaje mayor que 0 y no mayor que 100), así que no hay importe que calcular todavía.`,
          esReclamacion: false,
          pasoSiguiente:
            'Escribe en la pregunta 1 bis el porcentaje de prorrata que figura en la resolución de tu ' +
            'pensión y vuelve a verificar.',
        };
      }
      return r;
    },
    [tipo, fecha, hijos, hijosEsValido, hijosSuperaLimite, hijosTexto, genero, otroProgenitor, sumaMenor,
      denegacionPropia, excluido, prorrataAplica, prorrataEsValida, prorrataLeida, prorrataTexto],
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

      {/*
        TRES sellos, uno por módulo, porque la página publica datos de tres módulos fiscales
        sellados por separado y hasta el 09/09/2026 declaraba solo el primero: el lector veía
        «Art. 60 LGSS … verificado el 13/05/2026» debajo de unos plazos que salen de la LRJS
        y de la Ley 39/2015 y que se verificaron el 05/09/2026, y de un límite de pensión que
        se verificó el 12/08/2026 (hallazgo 652 — es el 610 con otro nombre).

        `DataReference` admite un solo módulo por tarjeta a propósito: cada sello tiene su
        fecha de verificación, y fundirlos obligaría a dar una sola, que es justamente lo que
        se quería evitar al separar `RECLAMACION_PREVIA_SS_META` del sello del complemento.
        Van los tres arriba y no junto a cada dato porque el resto de esa información vive
        dentro de la guía, que arranca colapsada: un sello que hay que desplegar para leerlo
        no ampara nada.
      */}
      <DataReference
        normativa={`Complemento por Brecha de Género ${COMPLEMENTO_BRECHA_GENERO_META.vigencia}`}
        fuente={COMPLEMENTO_BRECHA_GENERO_META.fuente}
        verificado={COMPLEMENTO_BRECHA_GENERO_META.verificado}
        urlOficial={COMPLEMENTO_BRECHA_GENERO_META.urlOficial}
      />

      <DataReference
        normativa="Reclamación previa ante el INSS"
        fuente={RECLAMACION_PREVIA_SS_META.fuente}
        verificado={RECLAMACION_PREVIA_SS_META.verificado}
        urlOficial={RECLAMACION_PREVIA_SS_META.urlOficial}
        nota={`El plazo se cuenta en ${RECLAMACION_PREVIA_SS_META.computo}.`}
      />

      <DataReference
        normativa={`Límite máximo de pensiones públicas ${FISCAL_PENSIONES_META.vigencia}`}
        fuente={FISCAL_PENSIONES_META.fuente}
        verificado={FISCAL_PENSIONES_META.verificado}
        urlOficial={FISCAL_PENSIONES_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {/* ─── Panel izquierdo: checklist ─── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          {/* P1: tipo de pensión */}
          {/* Los grupos de opciones no son un control con label: sin aria-labelledby, un
              lector de pantalla anuncia «Jubilación» sin decir a qué pregunta responde. Desde
              el 26/09/2026 son grupos de radio (hallazgo 2243, ver `GrupoRadio`). El único
              <label> con control asociado es el de P3. */}
          <div className={styles.formGroup}>
            <p className={styles.label} id="p1-titulo">
              1. ¿Qué pensión percibes (o vas a percibir)?
            </p>
            <GrupoRadio<TipoPension>
              idTitulo="p1-titulo"
              opciones={[
                { id: 'jubilacion', icon: '🌅', label: 'Jubilación (ordinaria o anticipada)' },
                { id: 'jubilacion_parcial', icon: '🕐', label: 'Jubilación parcial' },
                { id: 'incapacidad', icon: '♿', label: 'Incapacidad permanente' },
                { id: 'viudedad', icon: '💍', label: 'Viudedad' },
                { id: 'no_contributiva', icon: '🚫', label: 'No contributiva' },
                { id: 'ninguna', icon: '❓', label: 'Ninguna aún' },
              ]}
              valor={tipo}
              onElegir={(v) => { setTipo(v); reset(); }}
            />
          </div>

          {/* P1 bis: prorrata temporis (art. 60.3.f LGSS, hallazgo 2541). Solo para las
              pensiones que dan derecho al complemento. Se pregunta y se CALCULA: con un aviso
              bajo el importe íntegro, quien lee se llevaba el doble de lo que le corresponde
              con una prorrata del 50 %. */}
          {TIPOS_CON_PRORRATA.includes(tipo) && (
            <div className={styles.formGroup}>
              <p className={styles.label} id="p1bis-titulo">
                1 bis. ¿Tu pensión se calcula a prorrata por haber cotizado también en otro país?
              </p>
              <GrupoRadio<boolean>
                idTitulo="p1bis-titulo"
                idAyuda="p1bis-ayuda"
                apilado
                opciones={[
                  { id: false, label: 'No, solo con cotizaciones en España' },
                  { id: true, label: 'Sí, a prorrata (totalización internacional)' },
                ]}
                valor={aProrrata}
                onElegir={(v) => { setAProrrata(v); reset(); }}
              />
              <p className={styles.hint} id="p1bis-ayuda">
                {conCita(PRORRATA.detalle, PRORRATA.norma)}
              </p>
              {aProrrata && (
                <>
                  <label className={styles.label} htmlFor="prorrata">
                    Prorrata española de tu pensión (%)
                  </label>
                  <input
                    id="prorrata"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={styles.input}
                    value={prorrataTexto}
                    placeholder="Por ejemplo, 37,5"
                    onChange={e => { setProrrataTexto(e.target.value); reset(); }}
                    aria-invalid={prorrataTexto.trim() !== '' && !prorrataEsValida}
                    aria-describedby="prorrata-ayuda"
                  />
                  {prorrataTexto.trim() !== '' && !prorrataEsValida && (
                    <p className={styles.hint} role="alert">
                      <span aria-hidden="true">⚠️</span> Escribe un porcentaje mayor que 0 y no mayor que 100: «{prorrataTexto}» no se interpreta.
                    </p>
                  )}
                  <p className={styles.hint} id="prorrata-ayuda">
                    Figura en la resolución de tu pensión: es la parte que paga España por los períodos
                    cotizados aquí.
                  </p>
                </>
              )}
            </div>
          )}

          {/* P2: fecha del hecho causante */}
          <div className={styles.formGroup}>
            <p className={styles.label} id="p2-titulo">
              2. ¿Cuándo se causó (o se causará) tu pensión?
            </p>
            <GrupoRadio<FechaCausante>
              idTitulo="p2-titulo"
              idAyuda="p2-ayuda"
              opciones={[
                { id: 'antes_2021', label: `Antes del ${FECHA_MINIMA_CORTA}` },
                { id: 'desde_2021', label: `El ${FECHA_MINIMA_CORTA} o después` },
                { id: 'sin_iniciar', label: 'Aún sin solicitar' },
              ]}
              valor={fecha}
              onElegir={(v) => { setFecha(v); reset(); }}
            />
            <p className={styles.hint} id="p2-ayuda">
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

          {/* P3 bis: exclusiones del art. 60.3.b) LGSS (hallazgo 2540). Se preguntan porque
              un aviso bajo la cifra no basta: si alcanzan, no hay derecho y no hay importe. */}
          <div className={styles.formGroup}>
            <p className={styles.label} id="p3bis-titulo">
              3 bis. ¿Te alcanza alguna de las exclusiones del {EXCLUSION_ART60_3B.norma}?
            </p>
            <GrupoRadio<boolean>
              idTitulo="p3bis-titulo"
              idAyuda="p3bis-ayuda"
              apilado
              opciones={[
                { id: false, label: 'No me alcanza ninguna' },
                { id: true, label: 'Sí, me alcanza alguna' },
              ]}
              valor={excluido}
              onElegir={(v) => { setExcluido(v); reset(); }}
            />
            <p className={styles.hint} id="p3bis-ayuda">
              {EXCLUSION_ART60_3B.detalle}
            </p>
          </div>

          {/* P4: género */}
          <div className={styles.formGroup}>
            <p className={styles.label} id="p4-titulo">4. Sexo administrativo del solicitante</p>
            <GrupoRadio<Genero>
              idTitulo="p4-titulo"
              idAyuda="p4-ayuda"
              opciones={[
                { id: 'mujer', label: 'Mujer' },
                { id: 'hombre', label: 'Hombre' },
              ]}
              valor={genero}
              onElegir={(v) => { setGenero(v); reset(); }}
            />
            <p className={styles.hint} id="p4-ayuda">
              Desde la STJUE de {DOCTRINA.stjue.fecha} y la doctrina del TS, hombres y mujeres tienen derecho en
              igualdad de condiciones.
            </p>
          </div>

          {/* P5: estado del otro progenitor */}
          <div className={styles.formGroup}>
            <p className={styles.label} id="p5-titulo">
              5. Estado del otro progenitor respecto al complemento
            </p>
            <GrupoRadio<EstadoOtroProgenitor>
              idTitulo="p5-titulo"
              idAyuda="p5-ayuda"
              apilado
              opciones={[
                { id: 'no_percibe', label: 'No lo percibe ni lo ha solicitado' },
                { id: 'percibe', label: 'Ya lo percibe por los mismos hijos' },
                { id: 'denegado', label: 'Lo solicitó y se lo denegaron' },
                { id: 'no_aplica', label: 'No procede (sin otro progenitor)' },
              ]}
              valor={otroProgenitor}
              onElegir={(v) => { setOtroProgenitor(v); reset(); }}
            />
            <p className={styles.hint} id="p5-ayuda">
              Cada hijo/a solo puede generar un complemento para uno de los progenitores. Si los
              dos lo piden, la SS lo asigna al titular de la suma de pensiones públicas de menor
              cuantía ({CONCURRENCIA.norma}), aunque el otro ya lo cobre.
            </p>
          </div>

          {/* P5 bis: solo si el otro progenitor ya lo percibe. Decide el veredicto (art. 60.1
              y 60.2 LGSS, hallazgo 2239): sin ella, «ya lo percibe» era un «no» cerrado. */}
          {otroProgenitor === 'percibe' && (
            <div className={styles.formGroup}>
              <p className={styles.label} id="p5bis-titulo">
                5 bis. ¿Qué progenitor tiene la suma de pensiones públicas menor?
              </p>
              <GrupoRadio<SumaMenor>
                idTitulo="p5bis-titulo"
                idAyuda="p5bis-ayuda"
                apilado
                opciones={[
                  { id: 'propia', label: 'La mía es menor' },
                  { id: 'otro_progenitor', label: 'La del otro progenitor es menor' },
                  { id: 'desconocida', label: 'No lo sé' },
                ]}
                valor={sumaMenor}
                onElegir={(v) => { setSumaMenor(v); reset(); }}
              />
              {/* La regla del art. 60.7 decide la comparación (hallazgo 2538): sin ella, quien ya
                  cobra el complemento lo sumaba y la respuesta se invertía. */}
              <p className={styles.hint} id="p5bis-ayuda">
                Cuentan todas las pensiones públicas de cada uno, no solo la que da derecho al
                complemento, pero {COMPARACION.detalle} ({COMPARACION.norma}). Con jubilación de
                900 € más viudedad de 600 € (1.500 €) frente a una jubilación de 1.200 €, la suma
                menor es la segunda. {COMPARACION.desempate.detalle}
              </p>
            </div>
          )}

          {/* P6: denegación PROPIA — la que decide si procede reclamar. La P5 pregunta por la
              otra persona, así que no puede usarse para esto (ver `evaluar`, caso 5). */}
          <div className={styles.formGroup}>
            <p className={styles.label} id="p6-titulo">
              6. ¿Solicitaste tú el complemento y te lo denegaron?
            </p>
            <GrupoRadio<boolean>
              idTitulo="p6-titulo"
              idAyuda="p6-ayuda"
              opciones={[
                { id: false, label: 'No' },
                { id: true, label: 'Sí, tengo una resolución denegatoria' },
              ]}
              valor={denegacionPropia}
              onElegir={(v) => { setDenegacionPropia(v); reset(); }}
            />
            <p className={styles.hint} id="p6-ayuda">
              Se refiere a una denegación a TI, no al otro progenitor. Las denegaciones a hombres
              por «requisitos adicionales» anteriores a la {DOCTRINA.stjue.corto} ({DOCTRINA.stjue.fecha}) son
              revisables.
            </p>
          </div>

          <button
            type="button"
            className={styles.btn}
            onClick={() => { setEvaluado(true); setVerificaciones((n) => n + 1); }}
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
              {/* Cuatro titulares: procede, no procede, SIN CALCULAR y DEPENDE. El tercero es el
                  hallazgo 1171 — una entrada que no se puede evaluar recibía el mismo titular,
                  el mismo icono y el mismo estilo que una denegación del derecho. El cuarto, el
                  2239: la concurrencia sin saber qué suma de pensiones es menor no es un «no».
                  El bloque recibe el foco al verificar (tabIndex -1, hallazgo 2247). */}
              <div
                ref={veredictoRef}
                tabIndex={-1}
                className={
                  resultado.procede
                    ? styles.resultHeroPositivo
                    : resultado.sinCalcular
                      ? styles.resultHeroSinCalcular
                      : resultado.condicionado
                        ? styles.resultHeroCondicionado
                        : styles.resultHeroNegativo
                }
              >
                <div className={styles.resultIcon} aria-hidden="true">
                  {resultado.procede
                    ? (resultado.esReclamacion ? '🔄' : '✅')
                    : resultado.sinCalcular ? '✏️' : resultado.condicionado ? '⚖️' : 'ℹ️'}
                </div>
                <div className={styles.resultImporte}>
                  {resultado.procede
                    ? `+${formatCurrency(resultado.importeMensual)}/mes`
                    : resultado.sinCalcular
                      ? 'Sin calcular'
                      : resultado.condicionado
                        ? 'Depende de la suma de pensiones'
                        : 'No procede ahora'}
                </div>
                <p className={styles.resultLabel}>
                  {resultado.procede
                    ? resultado.esReclamacion
                      ? 'Posible reclamación retroactiva'
                      : resultado.concurrenciaAFavor
                        ? 'Te corresponde a ti: se extingue el del otro progenitor'
                        : 'Cumples los requisitos básicos'
                    : resultado.sinCalcular
                      ? 'Falta un dato: esto NO es una respuesta sobre tu derecho'
                      : resultado.condicionado
                        ? `Si tu suma de pensiones públicas es la menor, te corresponde: +${formatCurrency(resultado.importeMensual)}/mes`
                        : 'Revisa el motivo abajo'}
                </p>
              </div>

              {(resultado.procede || resultado.condicionado) && (
                <div className={styles.desgloseCard}>
                  <h3 className={styles.desgloseTitle}>
                    {resultado.condicionado ? 'Desglose, si te corresponde' : 'Desglose económico'}
                  </h3>
                  <div className={styles.desgloseItem}>
                    <span>Hijos computables</span>
                    <strong>{resultado.hijosComputables} (máx. {COMPLEMENTO_BRECHA_GENERO_2026.maxHijos})</strong>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Cuantía por hijo{resultado.prorrata !== undefined ? ' (importe teórico)' : ''}</span>
                    <strong>{formatCurrency(COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual)}/mes</strong>
                  </div>
                  {resultado.prorrata !== undefined && (
                    <div className={styles.desgloseItem}>
                      <span>Prorrata de tu pensión ({PRORRATA.norma})</span>
                      <strong>{formatPercentage(resultado.prorrata / 100)}</strong>
                    </div>
                  )}
                  <div className={styles.desgloseItem}>
                    <span>Mensual estimado</span>
                    <strong>{formatCurrency(resultado.importeMensual)}/mes</strong>
                  </div>
                  <div className={`${styles.desgloseItem} ${styles.desgloseFinal}`}>
                    <span>Anual ({PAGAS} pagas)</span>
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
                <strong>Aviso:</strong> esta herramienta orienta sobre los {NUM_REQUISITOS_ART60} requisitos
                clave del art. 60 LGSS. El reconocimiento definitivo lo realiza el INSS tras valorar tu
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
            Su naturaleza es la de pensión pública contributiva: se abona junto con la pensión en{' '}
            {PAGAS} pagas y <strong>no computa</strong> a efectos del límite máximo de pensiones públicas
            ({PENSION_MAXIMA_MES}/mes), por el {COMPLEMENTO_BRECHA_GENERO_2026.concurrencia.noComputaAlLimiteMaximo.norma}.
          </p>

          {/* ─── 1. Tabla comparativa ─── */}
          <h2>Comparativa: antiguo complemento de maternidad vs. complemento actual</h2>
          {/* La columna del régimen derogado publica sus cifras (5 %, 10 %, 15 %) sin decir de
              qué redacción salen: `.norma` y `.vigenteHasta` existían en el módulo y no tenían
              ningún consumidor en todo el catálogo, mientras el rótulo tecleaba «hasta
              feb-2021». Los tres sellos declarados de la página cubren el art. 60 vigente, los
              plazos de la LRJS y el límite de pensiones: ninguno ampara la redacción anterior.
              No hace falta un cuarto DataReference —es una norma derogada, sin caducidad ni
              vigilancia—, sino que la tabla cite su norma como el resto de la página cita el
              art. 60.4 LGSS o la STS 748/2023 (hallazgo 1174, residuo del 652). */}
          <p className={styles.tableNote}>
            Las cifras de la columna del régimen derogado son las del{' '}
            <strong>{MATERNIDAD.norma}</strong>, vigente hasta el{' '}
            {formatFechaLarga(MATERNIDAD.vigenteHasta)}. Quien lo tuviera reconocido lo conserva
            (DT 33.ª LGSS), y por eso sigue aquí.
          </p>
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
                  <td>{PORCENTAJE(MAXIMO_MATERNIDAD.porcentaje)} ({MAXIMO_MATERNIDAD.hijos} o más hijos)</td>
                  <td>{MAX_HIJOS} hijos × {CUANTIA_MES} = {MAX_MES}/mes</td>
                </tr>
                <tr>
                  <td>Acceso de hombres</td>
                  <td>Posible tras la {MATERNIDAD.doctrinaAcceso}</td>
                  <td>
                    Posible con requisitos adicionales hasta la {DOCTRINA.stjue.corto} ({DOCTRINA.stjue.fecha})
                  </td>
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
                acreditar &laquo;requisitos adicionales&raquo;. <strong>Resultado:</strong> la{' '}
                {DOCTRINA.stjue.corto} ({DOCTRINA.stjue.fecha}) y la STS de {DOCTRINA.ts.fecha} abren la
                vía a reclamar. Conviene revisar la resolución con un asesor laboralista y plantear
                nueva solicitud o reclamación previa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">👫</span> Concurrencia entre progenitores</h3>
              <p>
                <strong>Situación:</strong> ambos progenitores cobran pensión contributiva y ambos
                tienen 2 hijos comunes. <strong>Resultado:</strong> solo uno puede percibir el
                complemento por esos hijos: el que sea titular de pensiones públicas cuya suma sea
                de menor cuantía ({CONCURRENCIA.norma}). Cuenta la suma, no una sola pensión: con
                jubilación de 900 € más viudedad de 600 € (1.500 €) frente a una jubilación de
                1.200 €, le corresponde a quien cobra 1.200 €. Y en esa suma no entra ningún
                complemento: {COMPARACION.detalle} ({COMPARACION.norma}). Que el otro ya lo perciba
                no cierra nada: reconocérselo al segundo extingue el del primero, previa solicitud
                expresa ({CONCURRENCIA.extincion.norma}).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🧓</span> Pensión anterior a feb-2021</h3>
              <p>
                <strong>Situación:</strong> jubilación causada en 2019. <strong>Resultado:</strong>{' '}
                no aplica el complemento actual. Si entonces percibía o se le denegó el antiguo
                complemento de maternidad, conviene revisar la doctrina de la {MATERNIDAD.doctrinaAcceso}{' '}
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
                LGSS. Si el otro progenitor ya lo cobra por los mismos hijos, hay que pedirlo
                siempre: {conCita(CONCURRENCIA.extincion.detalle, CONCURRENCIA.extincion.norma)}{' '}
                {CONCURRENCIA.extincion.efectos}
              </p>
            </div>
            {/* Hallazgo 2540: el art. 60.3.b) no aparecía en ninguna parte de la página */}
            <div className={styles.faqItem}>
              <h3>¿Hay casos en que no se reconoce aunque se cumplan los requisitos?</h3>
              <p>
                Sí. {conCita(EXCLUSION_ART60_3B.detalle, EXCLUSION_ART60_3B.norma)} La norma no distingue
                por hijo: si la sentencia o la condena afecta solo a alguno, conviene consultarlo con
                un abogado laboralista.
              </p>
            </div>
            {/* Hallazgo 2541: la prorrata del art. 60.3.f) tampoco aparecía */}
            <div className={styles.faqItem}>
              <h3>¿Y si mi pensión se calcula a prorrata porque coticé en otro país?</h3>
              <p>
                {conCita(PRORRATA.detalle, PRORRATA.norma)} Con una prorrata española del {PORCENTAJE(50)} y 2 hijos,
                el complemento es 2 × {CUANTIA_MES} × 0,50 ={' '}
                {formatCurrency(2 * COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual * 0.5)}/mes.
                El verificador lo calcula si lo indicas en la pregunta 1 bis.
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
              {/* El titular enuncia la REGLA (nacer con vida), no una edad: hasta el
                  09/09/2026 decía «¿Y los hijos fallecidos antes de los 16 años?», un umbral
                  que no está ni en el art. 60.3.a) LGSS ni en la STS que la respuesta cita, y
                  que dejaba fuera —en apariencia— a quien perdió a un hijo más tarde, cuando
                  la regla también le da derecho (hallazgo 655). La norma se cita desde el
                  módulo: el art. 60.3.a), párrafo segundo, no el 60.1 (hallazgo 2542). */}
              <h3>¿Cuenta un hijo o hija que nació con vida y falleció después?</h3>
              <p>
                {COMPUTO_HIJO_FALLECIDO.detalle} Lo fija la {COMPUTO_HIJO_FALLECIDO.sentencia},
                que distingue este caso del hijo nacido sin vida, a quien el {COMPUTO_HIJO_FALLECIDO.norma}{' '}
                sí excluye. Lo que decide es el nacimiento con vida, no cuánto tiempo viviera
                después: la norma no fija ninguna edad. En supuestos dudosos, mejor acudir a un asesor.
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
                  Pensión contributiva, hecho causante el {FECHA_MINIMA_CORTA} o después y al menos un
                  hijo/a computable. Esta herramienta te orienta sobre los {NUM_REQUISITOS_ART60} puntos clave.
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
                  denegación previa a hombres ({DOCTRINA.stjue.corto} y {DOCTRINA.ts.corto}).
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
                todas las pensiones públicas de cada uno: la SS lo reconoce al titular de la suma de
                pensiones públicas de menor cuantía ({CONCURRENCIA.norma}).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h3>Aporta jurisprudencia si reclamas</h3>
              <p>
                En reclamaciones de hombres con denegaciones previas, citar la {DOCTRINA.stjue.corto}{' '}
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
                <strong>Dar por perdido el complemento porque el otro progenitor ya lo cobra.</strong>{' '}
                Si ambos lo solicitan por los mismos hijos, solo lo cobrará uno, y no es un reparto
                que se pacte entre ellos: la SS lo asigna al titular de pensiones públicas cuya
                suma sea de menor cuantía ({CONCURRENCIA.norma}). Si esa suma es la tuya, reconocértelo
                extingue el del otro progenitor ({CONCURRENCIA.extincion.norma}).
              </li>
              <li>
                <strong>No reclamar tras una denegación previa (hombres).</strong> Las denegaciones
                que aplicaban requisitos adicionales a los hombres son cuestionables tras la{' '}
                {DOCTRINA.stjue.corto} ({DOCTRINA.stjue.fecha}) y la STS de {DOCTRINA.ts.fecha}.
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
