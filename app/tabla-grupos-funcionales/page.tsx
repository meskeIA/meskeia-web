'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaGruposFuncionales.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ────────────────────────────────────────────────────────────────
   Utilidades
──────────────────────────────────────────────────────────────── */

/** Normaliza texto para buscar sin acentos ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/* ────────────────────────────────────────────────────────────────
   Diagramas esquemáticos (SVG inline, sin librerías externas:
   la CSP del sitio está en modo enforcement). Todos los trazos
   usan currentColor para verse bien en claro y en oscuro.
──────────────────────────────────────────────────────────────── */

type TipoEnlace = 'simple' | 'doble' | 'triple';

interface RamaDiagrama {
  etiqueta: string;
  enlace: TipoEnlace;
  direccion: 'arriba' | 'abajo';
  clave?: boolean;
}

interface NodoDiagrama {
  etiqueta: string;
  /** Enlace hacia el nodo siguiente */
  enlace?: TipoEnlace;
  clave?: boolean;
  ramas?: RamaDiagrama[];
}

type Diagrama =
  | { tipo: 'lineal'; nodos: NodoDiagrama[] }
  | { tipo: 'benceno'; sustituyente: string }
  | { tipo: 'ciclo3'; vertice: string };

interface PropsEnlace {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tipo: TipoEnlace;
  margen?: number;
}

/** Traza un enlace simple, doble o triple entre dos puntos. */
function EnlaceSvg({ x1, y1, x2, y2, tipo, margen = 21 }: PropsEnlace) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longitud = Math.hypot(dx, dy) || 1;
  const ux = dx / longitud;
  const uy = dy / longitud;
  const ax = x1 + ux * margen;
  const ay = y1 + uy * margen;
  const bx = x2 - ux * margen;
  const by = y2 - uy * margen;
  const px = -uy;
  const py = ux;
  const desplazamientos =
    tipo === 'simple' ? [0] : tipo === 'doble' ? [-3.5, 3.5] : [-6, 0, 6];

  return (
    <>
      {desplazamientos.map((desp) => (
        <line
          key={desp}
          x1={ax + px * desp}
          y1={ay + py * desp}
          x2={bx + px * desp}
          y2={by + py * desp}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

const PASO_X = 78;
const X_INICIAL = 32;
const Y_PRINCIPAL = 60;
const Y_ARRIBA = 16;
const Y_ABAJO = 104;

/** Dibuja el esquema del grupo funcional. Decorativo: aria-hidden. */
function DiagramaGrupo({ diagrama }: { diagrama: Diagrama }) {
  if (diagrama.tipo === 'benceno') {
    return (
      <svg
        className={styles.diagrama}
        viewBox="0 0 170 112"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <polygon
          points="82,55 66,82.7 34,82.7 18,55 34,27.3 66,27.3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <circle cx={50} cy={55} r={17} fill="none" stroke="currentColor" strokeWidth={2} />
        <line
          x1={86}
          y1={55}
          x2={104}
          y2={55}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <text
          x={124}
          y={55}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          className={styles.atomoClave}
        >
          {diagrama.sustituyente}
        </text>
      </svg>
    );
  }

  if (diagrama.tipo === 'ciclo3') {
    return (
      <svg
        className={styles.diagrama}
        viewBox="0 0 104 84"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <EnlaceSvg x1={52} y1={20} x2={26} y2={62} tipo="simple" margen={15} />
        <EnlaceSvg x1={52} y1={20} x2={78} y2={62} tipo="simple" margen={15} />
        <EnlaceSvg x1={26} y1={62} x2={78} y2={62} tipo="simple" margen={15} />
        <text
          x={52}
          y={20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          className={styles.atomoClave}
        >
          {diagrama.vertice}
        </text>
        <text
          x={26}
          y={62}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          fill="currentColor"
        >
          C
        </text>
        <text
          x={78}
          y={62}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={600}
          fill="currentColor"
        >
          C
        </text>
      </svg>
    );
  }

  const nodos = diagrama.nodos;
  const hayArriba = nodos.some((n) => n.ramas?.some((r) => r.direccion === 'arriba'));
  const hayAbajo = nodos.some((n) => n.ramas?.some((r) => r.direccion === 'abajo'));
  const ancho = X_INICIAL * 2 + (nodos.length - 1) * PASO_X;
  const yMin = hayArriba ? 0 : 34;
  const yMax = hayAbajo ? 122 : 86;

  return (
    <svg
      className={styles.diagrama}
      viewBox={`0 ${yMin} ${ancho} ${yMax - yMin}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {nodos.map((nodo, indice) => {
        const x = X_INICIAL + indice * PASO_X;
        return (
          <g key={`${nodo.etiqueta}-${indice}`}>
            {nodo.enlace && indice < nodos.length - 1 && (
              <EnlaceSvg
                x1={x}
                y1={Y_PRINCIPAL}
                x2={x + PASO_X}
                y2={Y_PRINCIPAL}
                tipo={nodo.enlace}
              />
            )}
            {nodo.ramas?.map((rama) => {
              const yRama = rama.direccion === 'arriba' ? Y_ARRIBA : Y_ABAJO;
              return (
                <g key={`${rama.etiqueta}-${rama.direccion}`}>
                  <EnlaceSvg
                    x1={x}
                    y1={Y_PRINCIPAL}
                    x2={x}
                    y2={yRama}
                    tipo={rama.enlace}
                    margen={16}
                  />
                  <text
                    x={x}
                    y={yRama}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={18}
                    fontWeight={600}
                    className={rama.clave ? styles.atomoClave : undefined}
                    fill="currentColor"
                  >
                    {rama.etiqueta}
                  </text>
                </g>
              );
            })}
            <text
              x={x}
              y={Y_PRINCIPAL}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight={600}
              className={nodo.clave ? styles.atomoClave : undefined}
              fill="currentColor"
            >
              {nodo.etiqueta}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

type CategoriaId =
  | 'hidrocarburos'
  | 'oxigenados'
  | 'nitrogenados'
  | 'azufrados'
  | 'halogenados';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface PropiedadesGrupo {
  polaridad: string;
  puentesH: string;
  solubilidad: string;
  ebullicion: string;
}

interface GrupoFuncional {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  /** Fórmula esquemática del grupo */
  formula: string;
  /** Sufijo IUPAC cuando el grupo es el principal */
  sufijo: string;
  /** Prefijo IUPAC cuando el grupo es sustituyente */
  prefijo: string;
  /** Posición en el orden de prioridad IUPAC; null = solo puede ser prefijo */
  prioridad: number | null;
  prioridadNota: string;
  ejemploNombre: string;
  ejemploFormula: string;
  /** Texto plano para el buscador: nombre, fórmula y sinónimos regionales */
  busqueda: string;
  diagrama: Diagrama;
  descripcionDiagrama: string;
  /** El nombre construido paso a paso sobre un ejemplo concreto */
  comoSeNombra: string[];
  propiedades: PropiedadesGrupo;
  nota?: string;
}

const CATEGORIAS: Categoria[] = [
  { id: 'hidrocarburos', nombre: 'Hidrocarburos', icono: '🛢️' },
  { id: 'oxigenados', nombre: 'Oxigenados', icono: '💧' },
  { id: 'nitrogenados', nombre: 'Nitrogenados', icono: '🔷' },
  { id: 'azufrados', nombre: 'Azufrados', icono: '🟡' },
  { id: 'halogenados', nombre: 'Halogenados y organometálicos', icono: '⚗️' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  hidrocarburos: 'Hidrocarburos',
  oxigenados: 'Oxigenados',
  nitrogenados: 'Nitrogenados',
  azufrados: 'Azufrados',
  halogenados: 'Halogenados y organometálicos',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE GRUPOS FUNCIONALES
   Nomenclatura IUPAC (recomendaciones de 2013). El campo
   «prioridad» sigue la tabla de orden de preferencia de clases:
   1 = el grupo que manda sobre todos los demás.
──────────────────────────────────────────────────────────────── */

const GRUPOS: GrupoFuncional[] = [
  /* ── Hidrocarburos ────────────────────────────────────────── */
  {
    id: 'alcano',
    categoria: 'hidrocarburos',
    nombre: 'Alcano',
    formula: 'C–C',
    sufijo: '-ano',
    prefijo: 'alquil- (metil-, etil-, propil-…)',
    prioridad: 17,
    prioridadNota: 'Es la cadena base: nunca desplaza a ningún grupo funcional.',
    ejemploNombre: 'Propano',
    ejemploFormula: 'CH₃–CH₂–CH₃',
    busqueda:
      'alcano alcanos hidrocarburo saturado enlace simple parafina metano etano propano butano cadena ano alquilo metil etil CnH2n+2',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'C', enlace: 'simple' },
        { etiqueta: 'C', enlace: 'simple' },
        { etiqueta: 'C' },
      ],
    },
    descripcionDiagrama:
      'Tres carbonos unidos en fila por enlaces simples; los hidrógenos no se dibujan.',
    comoSeNombra: [
      'Cuenta los carbonos de la cadena más larga: CH₃–CH₂–CH₃ tiene 3.',
      'Aplica la raíz correspondiente: 3 carbonos → prop-.',
      'Añade el sufijo -ano porque solo hay enlaces simples: propano.',
      'Si hubiera ramas, se nombrarían como prefijos: CH₃–CH(CH₃)–CH₃ es 2-metilpropano.',
    ],
    propiedades: {
      polaridad: 'Apolar: solo enlaces C–C y C–H, casi sin diferencia de electronegatividad.',
      puentesH: 'No forma puentes de hidrógeno.',
      solubilidad: 'Insoluble en agua; soluble en disolventes apolares como el hexano.',
      ebullicion:
        'La más baja de todas las familias con el mismo número de carbonos (solo fuerzas de dispersión).',
    },
  },
  {
    id: 'alqueno',
    categoria: 'hidrocarburos',
    nombre: 'Alqueno',
    formula: 'C=C',
    sufijo: '-eno',
    prefijo: 'alquenil- (vinil-, alil-)',
    prioridad: 16,
    prioridadNota:
      'Los dobles enlaces solo mandan sobre la cadena saturada: cualquier grupo funcional los relega a la numeración.',
    ejemploNombre: 'Propeno',
    ejemploFormula: 'CH₂=CH–CH₃',
    busqueda:
      'alqueno alquenos doble enlace insaturado olefina eteno etileno propeno vinilo alilo eno CnH2n insaturacion',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'C', enlace: 'doble', clave: true },
        { etiqueta: 'C', enlace: 'simple', clave: true },
        { etiqueta: 'C' },
      ],
    },
    descripcionDiagrama:
      'Dos carbonos unidos por un doble enlace y un tercer carbono enlazado de forma simple.',
    comoSeNombra: [
      'Elige la cadena más larga que contenga el doble enlace: 3 carbonos.',
      'Numera empezando por el extremo que dé el localizador más bajo al doble enlace: aquí, el 1.',
      'Sustituye -ano por -eno e indica la posición: prop-1-eno, que se abrevia propeno porque no hay ambigüedad.',
      'Si hay dos dobles enlaces se usa -dieno: CH₂=CH–CH=CH₂ es buta-1,3-dieno.',
    ],
    propiedades: {
      polaridad: 'Prácticamente apolar, aunque la nube π es una zona rica en electrones.',
      puentesH: 'No forma puentes de hidrógeno.',
      solubilidad: 'Insoluble en agua.',
      ebullicion:
        'Muy parecida a la del alcano equivalente; el doble enlace apenas cambia las fuerzas intermoleculares.',
    },
  },
  {
    id: 'alquino',
    categoria: 'hidrocarburos',
    nombre: 'Alquino',
    formula: 'C≡C',
    sufijo: '-ino',
    prefijo: 'alquinil- (etinil-)',
    prioridad: 16,
    prioridadNota:
      'Empata con el doble enlace; si hay los dos y la elección es dudosa, el doble enlace recibe el localizador más bajo.',
    ejemploNombre: 'Propino',
    ejemploFormula: 'CH≡C–CH₃',
    busqueda:
      'alquino alquinos triple enlace acetileno etino propino insaturado ino etinilo CnH2n-2',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'C', enlace: 'triple', clave: true },
        { etiqueta: 'C', enlace: 'simple', clave: true },
        { etiqueta: 'C' },
      ],
    },
    descripcionDiagrama: 'Dos carbonos unidos por un triple enlace más un carbono adicional.',
    comoSeNombra: [
      'Cadena principal con el triple enlace: 3 carbonos.',
      'Numera para que el triple enlace tenga el número más bajo: posición 1.',
      'Cambia el sufijo a -ino: prop-1-ino (propino).',
      'El hidrógeno del carbono terminal es débilmente ácido, algo único entre los hidrocarburos.',
    ],
    propiedades: {
      polaridad: 'Apolar; el carbono con hibridación sp es algo más electronegativo.',
      puentesH: 'No los forma, pero el H terminal puede ser arrancado por bases fuertes.',
      solubilidad: 'Insoluble en agua.',
      ebullicion: 'Ligeramente superior a la del alqueno equivalente por la forma lineal.',
    },
  },
  {
    id: 'areno',
    categoria: 'hidrocarburos',
    nombre: 'Areno (aromático)',
    formula: 'C₆H₅–',
    sufijo: 'se nombra como benceno o areno',
    prefijo: 'fenil- (C₆H₅–), bencil- (C₆H₅–CH₂–)',
    prioridad: 17,
    prioridadNota:
      'El anillo aromático actúa como cadena base; cede el sufijo a cualquier grupo funcional presente.',
    ejemploNombre: 'Metilbenceno (tolueno)',
    ejemploFormula: 'C₆H₅–CH₃',
    busqueda:
      'areno arenos aromatico aromaticos benceno anillo bencenico fenilo bencilo tolueno xileno naftaleno resonancia aromaticidad huckel',
    diagrama: { tipo: 'benceno', sustituyente: 'R' },
    descripcionDiagrama:
      'Hexágono con un círculo interior, símbolo del anillo aromático, unido a un sustituyente R.',
    comoSeNombra: [
      'Reconoce el anillo de seis carbonos con electrones deslocalizados: benceno.',
      'Nombra los sustituyentes como prefijos: el CH₃ es metil-.',
      'Une ambos: metilbenceno (el nombre tradicional tolueno sigue aceptado).',
      'Con dos sustituyentes se numera el anillo: 1,2- (orto), 1,3- (meta) y 1,4- (para).',
    ],
    propiedades: {
      polaridad: 'Apolar, aunque la nube π lo hace polarizable.',
      puentesH: 'No los forma; puede participar en interacciones π débiles.',
      solubilidad: 'Insoluble en agua; excelente disolvente de compuestos orgánicos.',
      ebullicion: 'Elevada para un hidrocarburo por su masa y su superficie plana de contacto.',
    },
  },

  /* ── Oxigenados ───────────────────────────────────────────── */
  {
    id: 'alcohol',
    categoria: 'oxigenados',
    nombre: 'Alcohol',
    formula: 'R–OH',
    sufijo: '-ol',
    prefijo: 'hidroxi-',
    prioridad: 10,
    prioridadNota:
      'Pierde frente a todos los carbonilos; solo manda sobre tioles, aminas, éteres y los hidrocarburos.',
    ejemploNombre: 'Etanol',
    ejemploFormula: 'CH₃–CH₂–OH',
    busqueda:
      'alcohol alcoholes OH hidroxilo hidroxi oxhidrilo grupo oh etanol metanol propanol glicerina primario secundario terciario ol',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'H', clave: true },
      ],
    },
    descripcionDiagrama: 'Un resto R unido a un oxígeno, que a su vez lleva un hidrógeno.',
    comoSeNombra: [
      'Caso simple: CH₃–CH₂–OH tiene 2 carbonos → etan- + -ol = etanol.',
      'Caso con competencia: CH₃–CH(OH)–COOH tiene un alcohol y un ácido carboxílico.',
      'El ácido gana (prioridad 1 frente a 10), así que el sufijo es -oico y el carbono del COOH es el número 1.',
      'El –OH pasa a prefijo «hidroxi» con su localizador: ácido 2-hidroxipropanoico (el conocido ácido láctico).',
    ],
    propiedades: {
      polaridad: 'Muy polar: el enlace O–H tiene una diferencia de electronegatividad grande.',
      puentesH: 'Dona y acepta puentes de hidrógeno; por eso se asocian entre sí.',
      solubilidad:
        'Los de 1 a 3 carbonos son miscibles con agua; a partir de 5-6 carbonos la cola apolar gana y la solubilidad cae.',
      ebullicion:
        'Muy alta para su masa: el etanol hierve a 78 °C frente a los −24 °C del éter dimetílico, que tiene la misma fórmula molecular.',
    },
  },
  {
    id: 'fenol',
    categoria: 'oxigenados',
    nombre: 'Fenol',
    formula: 'Ar–OH',
    sufijo: '-ol',
    prefijo: 'hidroxi-',
    prioridad: 10,
    prioridadNota: 'Comparte rango con el alcohol: ambos pertenecen a la clase de los hidroxi.',
    ejemploNombre: '4-metilfenol (p-cresol)',
    ejemploFormula: 'CH₃–C₆H₄–OH',
    busqueda:
      'fenol fenoles OH aromatico hidroxilo unido al anillo cresol acidez pka 10 antioxidante hidroxibenceno',
    diagrama: { tipo: 'benceno', sustituyente: 'OH' },
    descripcionDiagrama: 'Anillo aromático con un grupo hidroxilo unido directamente a un carbono.',
    comoSeNombra: [
      'El –OH unido al anillo convierte el compuesto en un fenol, no en un alcohol aromático.',
      'El carbono que lleva el –OH es siempre el 1 del anillo.',
      'Numera hacia el sustituyente más cercano: el metilo queda en 4.',
      'Nombre: 4-metilfenol (el tradicional p-cresol sigue siendo habitual en la industria).',
    ],
    propiedades: {
      polaridad: 'Polar, con el añadido de un anillo aromático apolar.',
      puentesH: 'Dona y acepta; además el anión formado se estabiliza por resonancia.',
      solubilidad: 'Parcialmente soluble en agua; se disuelve bien en disolución básica.',
      ebullicion: 'Alta (182 °C el fenol) por los puentes de hidrógeno y la masa del anillo.',
    },
    nota: 'Es un ácido débil (pKa ≈ 10) mucho más fuerte que un alcohol (pKa ≈ 16): esa es la diferencia química clave.',
  },
  {
    id: 'eter',
    categoria: 'oxigenados',
    nombre: 'Éter',
    formula: 'R–O–R′',
    sufijo: '— (nunca es sufijo en la nomenclatura sustitutiva)',
    prefijo: 'alcoxi- (metoxi-, etoxi-)',
    prioridad: 15,
    prioridadNota:
      'El más bajo de los grupos con heteroátomo: siempre se nombra como prefijo alcoxi o con nomenclatura funcional («éter dietílico»).',
    ejemploNombre: 'Metoximetano (éter dimetílico)',
    ejemploFormula: 'CH₃–O–CH₃',
    busqueda:
      'eter eteres oxigeno puente R-O-R alcoxi metoxi etoxi eter dietilico eter dimetilico anisol disolvente',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Un oxígeno que une dos restos orgánicos, sin hidrógeno propio.',
    comoSeNombra: [
      'Elige como cadena principal la más larga de las dos: aquí ambas tienen 1 carbono.',
      'La otra, junto con el oxígeno, forma el prefijo: CH₃–O– es metoxi-.',
      'Nombre sustitutivo: metoximetano.',
      'Nomenclatura funcional aceptada: éter dimetílico (o dimetiléter).',
    ],
    propiedades: {
      polaridad: 'Débilmente polar: el oxígeno crea un momento dipolar pequeño.',
      puentesH: 'Solo acepta puentes de hidrógeno, no los dona (no tiene H sobre el oxígeno).',
      solubilidad:
        'Algo soluble en agua (el éter dietílico, unos 6 g por 100 mL) porque acepta puentes.',
      ebullicion:
        'Mucho más baja que la del alcohol isómero, al no poder asociarse entre sus propias moléculas.',
    },
  },
  {
    id: 'aldehido',
    categoria: 'oxigenados',
    nombre: 'Aldehído',
    formula: '–CHO',
    sufijo: '-al',
    prefijo: 'oxo- (o formil- si el carbono queda fuera de la cadena)',
    prioridad: 8,
    prioridadNota: 'Manda sobre cetonas, alcoholes y aminas; cede ante ácidos, ésteres y amidas.',
    ejemploNombre: 'Etanal (acetaldehído)',
    ejemploFormula: 'CH₃–CHO',
    busqueda:
      'aldehido aldehidos CHO carbonilo terminal formilo oxo etanal acetaldehido formaldehido metanal aldehido al tollens fehling',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'H' },
      ],
    },
    descripcionDiagrama:
      'Un carbono unido por doble enlace a un oxígeno, con un hidrógeno a un lado y el resto R al otro.',
    comoSeNombra: [
      'El carbono del –CHO forma parte de la cadena y es siempre el número 1.',
      'Cuenta los carbonos: CH₃–CHO tiene 2 → etan-.',
      'Añade el sufijo -al sin localizador (es innecesario): etanal.',
      'Si el aldehído no puede entrar en la cadena principal se usa el prefijo formil-, y si es la cadena la que lleva otro grupo mayor, oxo-.',
    ],
    propiedades: {
      polaridad: 'Muy polar por el carbonilo C=O.',
      puentesH: 'Acepta puentes de hidrógeno, no los dona.',
      solubilidad: 'Los ligeros son solubles en agua; el metanal se vende en disolución acuosa.',
      ebullicion:
        'Intermedia: superior a la de alcanos y éteres de masa parecida, pero inferior a la de los alcoholes.',
    },
    nota: 'Se oxida con facilidad a ácido carboxílico, algo que la cetona no hace: es la base de los ensayos de Tollens y Fehling.',
  },
  {
    id: 'cetona',
    categoria: 'oxigenados',
    nombre: 'Cetona',
    formula: 'R–CO–R′',
    sufijo: '-ona',
    prefijo: 'oxo-',
    prioridad: 9,
    prioridadNota: 'Justo por debajo del aldehído; por encima de alcoholes, tioles y aminas.',
    ejemploNombre: 'Propanona (acetona)',
    ejemploFormula: 'CH₃–CO–CH₃',
    busqueda:
      'cetona cetonas carbonilo interno C=O oxo acetona propanona butanona ona grupo carbonilo cuerpos cetonicos',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama:
      'Un carbono con doble enlace a oxígeno situado entre dos restos orgánicos R y R prima.',
    comoSeNombra: [
      'El carbonilo está en el interior de la cadena, unido a dos carbonos.',
      'Cadena de 3 carbonos → propan-.',
      'Numera para dar el localizador más bajo al carbonilo: posición 2.',
      'Nombre: propan-2-ona, casi siempre escrito propanona (acetona en lenguaje corriente).',
    ],
    propiedades: {
      polaridad: 'Muy polar, como el aldehído.',
      puentesH: 'Solo acepta puentes de hidrógeno.',
      solubilidad: 'La propanona es miscible con agua; a partir de 5-6 carbonos la solubilidad cae.',
      ebullicion:
        'Similar a la del aldehído isómero y bastante por debajo de la del alcohol equivalente.',
    },
  },
  {
    id: 'acido-carboxilico',
    categoria: 'oxigenados',
    nombre: 'Ácido carboxílico',
    formula: '–COOH',
    sufijo: 'ácido …-oico',
    prefijo: 'carboxi-',
    prioridad: 1,
    prioridadNota: 'El grupo de máxima prioridad: si está presente, siempre da el sufijo.',
    ejemploNombre: 'Ácido etanoico (acético)',
    ejemploFormula: 'CH₃–COOH',
    busqueda:
      'acido carboxilico acidos carboxilicos COOH carboxilo carboxi acido acetico etanoico formico metanoico oico vinagre pka 4.8 acidez',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'H', clave: true },
      ],
    },
    descripcionDiagrama:
      'Un carbono con doble enlace a un oxígeno y enlace simple a un grupo O–H: el carboxilo completo.',
    comoSeNombra: [
      'El carbono del carboxilo entra en la cadena y es obligatoriamente el número 1.',
      'CH₃–COOH tiene 2 carbonos → etan-.',
      'Antepón la palabra ácido y añade el sufijo -oico: ácido etanoico.',
      'Cuando el COOH no puede formar parte de la cadena (por ejemplo en un anillo) se usa el prefijo carboxi- o el sufijo -carboxílico.',
    ],
    propiedades: {
      polaridad: 'El grupo más polar de la tabla: combina un carbonilo y un O–H.',
      puentesH: 'Dona y acepta; en fase líquida forma dímeros unidos por dos puentes a la vez.',
      solubilidad: 'Los de 1 a 4 carbonos son miscibles con agua.',
      ebullicion:
        'La más alta a igualdad de masa: el ácido etanoico hierve a 118 °C frente a los 78 °C del etanol.',
    },
    nota: 'Es un ácido débil real (pKa ≈ 4,8): reacciona con NaHCO₃ desprendiendo CO₂, prueba sencilla que lo distingue de un fenol.',
  },
  {
    id: 'ester',
    categoria: 'oxigenados',
    nombre: 'Éster',
    formula: '–COO–R′',
    sufijo: '-oato de …ilo',
    prefijo: 'alcoxicarbonil- / aciloxi-',
    prioridad: 4,
    prioridadNota: 'Por debajo de ácidos y anhídridos, por encima de haluros de acilo y amidas.',
    ejemploNombre: 'Etanoato de etilo (acetato de etilo)',
    ejemploFormula: 'CH₃–COO–CH₂–CH₃',
    busqueda:
      'ester esteres COO acetato de etilo etanoato oato de ilo esterificacion aroma frutal triglicerido aciloxi alcoxicarbonilo',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama:
      'Carbonilo unido a un oxígeno que enlaza con un segundo resto orgánico, sin hidrógeno libre.',
    comoSeNombra: [
      'Separa mentalmente las dos partes: la del ácido (CH₃–CO–) y la del alcohol (–O–CH₂CH₃).',
      'La parte del ácido da la primera palabra con el sufijo -oato: etanoato.',
      'La parte del alcohol da la segunda con la terminación -ilo: etilo.',
      'Une con la preposición «de»: etanoato de etilo.',
    ],
    propiedades: {
      polaridad: 'Polar, pero menos que el ácido del que procede.',
      puentesH: 'Solo acepta puentes de hidrógeno.',
      solubilidad: 'Baja en agua; los ésteres pequeños son algo solubles.',
      ebullicion:
        'Bastante más baja que la del ácido de partida, porque ya no puede formar dímeros.',
    },
    nota: 'Muchos aromas frutales son ésteres sencillos; las grasas son triésteres de glicerina.',
  },
  {
    id: 'anhidrido',
    categoria: 'oxigenados',
    nombre: 'Anhídrido de ácido',
    formula: '–CO–O–CO–',
    sufijo: 'anhídrido …-oico',
    prefijo: '— (raro como sustituyente)',
    prioridad: 3,
    prioridadNota: 'Solo por debajo de los ácidos carboxílicos y sulfónicos.',
    ejemploNombre: 'Anhídrido etanoico (acético)',
    ejemploFormula: 'CH₃–CO–O–CO–CH₃',
    busqueda:
      'anhidrido anhidridos de acido acetico etanoico dos carbonilos unidos por oxigeno derivado de acido acilante',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        {
          etiqueta: 'C',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
      ],
    },
    descripcionDiagrama: 'Dos grupos carbonilo enlazados entre sí a través de un oxígeno puente.',
    comoSeNombra: [
      'Identifica los dos ácidos de los que procede: en este caso, dos moléculas de ácido etanoico.',
      'Sustituye la palabra «ácido» por «anhídrido»: anhídrido etanoico.',
      'Si los dos ácidos son distintos se citan por orden alfabético: anhídrido etanoico y propanoico.',
      'Formalmente resulta de unir dos ácidos perdiendo una molécula de agua, de ahí el nombre.',
    ],
    propiedades: {
      polaridad: 'Polar, con dos carbonilos muy reactivos.',
      puentesH: 'Solo acepta puentes de hidrógeno.',
      solubilidad: 'Reacciona con el agua en lugar de disolverse: la hidrólisis devuelve el ácido.',
      ebullicion: 'Alta por la masa y los dos dipolos, pero sin la asociación de los ácidos.',
    },
  },
  {
    id: 'haluro-acilo',
    categoria: 'oxigenados',
    nombre: 'Haluro de acilo',
    formula: '–CO–X',
    sufijo: 'haluro de …-oílo',
    prefijo: 'halocarbonil- (clorocarbonil-)',
    prioridad: 5,
    prioridadNota: 'Entre el éster y la amida en la escalera de prioridad.',
    ejemploNombre: 'Cloruro de etanoílo (acetilo)',
    ejemploFormula: 'CH₃–CO–Cl',
    busqueda:
      'haluro de acilo cloruro de acilo cloruro de acetilo etanoilo oilo COCl derivado de acido halogenuro acilacion',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'Cl', clave: true },
      ],
    },
    descripcionDiagrama: 'Carbonilo unido directamente a un átomo de halógeno, aquí un cloro.',
    comoSeNombra: [
      'Parte del nombre del ácido: ácido etanoico.',
      'Cambia la terminación -oico por -oílo: etanoílo.',
      'Antepón el nombre del halogenuro: cloruro de etanoílo.',
      'El nombre tradicional cloruro de acetilo sigue siendo el más usado en el laboratorio.',
    ],
    propiedades: {
      polaridad: 'Muy polar y extremadamente reactivo.',
      puentesH: 'No dona; acepta débilmente.',
      solubilidad: 'Se hidroliza con el agua desprendiendo HCl; no se puede hablar de solubilidad.',
      ebullicion: 'Moderada, inferior a la del ácido correspondiente.',
    },
  },
  {
    id: 'epoxido',
    categoria: 'oxigenados',
    nombre: 'Epóxido (oxirano)',
    formula: 'C–O–C en anillo de 3',
    sufijo: '-oxirano (nomenclatura de anillo)',
    prefijo: 'epoxi-',
    prioridad: null,
    prioridadNota:
      'No aparece en la escalera de sufijos: se cita como prefijo epoxi- o se nombra el anillo (oxirano).',
    ejemploNombre: 'Oxirano (óxido de etileno)',
    ejemploFormula: 'C₂H₄O',
    busqueda:
      'epoxido epoxidos oxirano oxido de etileno anillo de tres tension epoxi eter ciclico resina epoxi',
    diagrama: { tipo: 'ciclo3', vertice: 'O' },
    descripcionDiagrama:
      'Triángulo formado por dos carbonos y un oxígeno: un éter cíclico de tres miembros.',
    comoSeNombra: [
      'Es un éter cíclico de tres átomos: el nombre sistemático del anillo es oxirano.',
      'Cuando forma parte de una molécula mayor se usa el prefijo epoxi- con dos localizadores.',
      'Ejemplo: 1,2-epoxipropano indica el oxígeno puente entre los carbonos 1 y 2.',
      'El nombre industrial óxido de etileno sigue siendo el habitual.',
    ],
    propiedades: {
      polaridad: 'Polar; la tensión del anillo lo hace mucho más reactivo que un éter normal.',
      puentesH: 'Solo acepta puentes de hidrógeno.',
      solubilidad: 'El oxirano es miscible con agua, con la que reacciona en medio ácido o básico.',
      ebullicion: 'Baja (10,7 °C el oxirano): es un gas a temperatura ambiente.',
    },
  },
  {
    id: 'peroxido',
    categoria: 'oxigenados',
    nombre: 'Peróxido',
    formula: 'R–O–O–R′',
    sufijo: '-peroxol (solo en hidroperóxidos R–O–OH)',
    prefijo: 'peroxi- / hidroperoxi-',
    prioridad: null,
    prioridadNota:
      'Como peróxido dialquílico solo funciona de prefijo; el hidroperóxido (–OOH) sí tiene sufijo y se sitúa entre el tiol y la amina.',
    ejemploNombre: 'Peróxido de dimetilo',
    ejemploFormula: 'CH₃–O–O–CH₃',
    busqueda:
      'peroxido peroxidos enlace O-O hidroperoxido peroxi agua oxigenada peroxido de benzoilo radicales iniciador',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Dos oxígenos enlazados entre sí, cada uno unido a un resto orgánico.',
    comoSeNombra: [
      'Reconoce el enlace O–O, muy débil y fácil de romper en dos radicales.',
      'Nomenclatura funcional: peróxido de dimetilo (o de dibenzoílo, si los restos son bencílicos).',
      'Como sustituyente se usa el prefijo peroxi-: (metilperoxi)etano.',
      'Si un extremo lleva hidrógeno es un hidroperóxido: CH₃–O–OH es metanoperoxol.',
    ],
    propiedades: {
      polaridad: 'Moderadamente polar.',
      puentesH: 'El hidroperóxido dona y acepta; el peróxido dialquílico solo acepta.',
      solubilidad: 'Baja en agua salvo en moléculas pequeñas.',
      ebullicion: 'Parecida a la del éter equivalente.',
    },
    nota: 'El enlace O–O es térmicamente inestable: muchos peróxidos son explosivos o iniciadores de polimerización.',
  },

  /* ── Nitrogenados ─────────────────────────────────────────── */
  {
    id: 'amina-primaria',
    categoria: 'nitrogenados',
    nombre: 'Amina primaria',
    formula: 'R–NH₂',
    sufijo: '-amina',
    prefijo: 'amino-',
    prioridad: 13,
    prioridadNota: 'Por debajo del alcohol y del tiol; por encima de la imina y del éter.',
    ejemploNombre: 'Etanamina (etilamina)',
    ejemploFormula: 'CH₃–CH₂–NH₂',
    busqueda:
      'amina primaria aminas NH2 amino grupo amino etilamina etanamina metilamina aminoacido basica nitrogeno amina',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'N',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'H', enlace: 'simple', direccion: 'arriba' }],
        },
        { etiqueta: 'H', clave: true },
      ],
    },
    descripcionDiagrama: 'Un nitrógeno con dos hidrógenos unido a un único resto orgánico.',
    comoSeNombra: [
      'Un solo carbono unido al nitrógeno: es una amina primaria.',
      'Cadena de 2 carbonos → etan-.',
      'Añade el sufijo -amina: etanamina (el tradicional etilamina sigue vigente).',
      'Si hay un grupo de mayor prioridad, pasa a prefijo: H₂N–CH₂–COOH es ácido 2-aminoetanoico (glicina).',
    ],
    propiedades: {
      polaridad: 'Polar, aunque menos que el alcohol: el N es menos electronegativo que el O.',
      puentesH: 'Dona y acepta, pero los puentes N···H son más débiles que los O···H.',
      solubilidad: 'Las de hasta 5-6 carbonos son solubles en agua.',
      ebullicion:
        'Intermedia: por encima del alcano equivalente y por debajo del alcohol equivalente.',
    },
    nota: 'Es el grupo básico por excelencia de la química orgánica: capta protones y forma sales de amonio.',
  },
  {
    id: 'amina-secundaria',
    categoria: 'nitrogenados',
    nombre: 'Amina secundaria',
    formula: 'R–NH–R′',
    sufijo: '-amina (con localizador N-)',
    prefijo: 'N-alquilamino-',
    prioridad: 13,
    prioridadNota: 'Misma clase que la amina primaria dentro del orden de prioridad.',
    ejemploNombre: 'N-metiletanamina',
    ejemploFormula: 'CH₃–CH₂–NH–CH₃',
    busqueda:
      'amina secundaria dos sustituyentes nitrogeno NH dimetilamina N-metil aminas secundarias',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'N', enlace: 'simple', clave: true, ramas: [{ etiqueta: 'H', enlace: 'simple', direccion: 'arriba' }] },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Nitrógeno con un hidrógeno unido a dos restos orgánicos distintos.',
    comoSeNombra: [
      'Cuenta los carbonos unidos al nitrógeno: dos → amina secundaria.',
      'Elige como cadena principal la más larga: la de 2 carbonos, etanamina.',
      'El otro resto se cita como prefijo con el localizador N-, que indica que va sobre el nitrógeno.',
      'Nombre: N-metiletanamina.',
    ],
    propiedades: {
      polaridad: 'Polar, algo menos que la primaria.',
      puentesH: 'Dona un solo puente de hidrógeno (le queda un H) y acepta.',
      solubilidad: 'Buena en moléculas pequeñas, decreciente al crecer las cadenas.',
      ebullicion: 'Inferior a la de la amina primaria isómera: menos puentes disponibles.',
    },
  },
  {
    id: 'amina-terciaria',
    categoria: 'nitrogenados',
    nombre: 'Amina terciaria',
    formula: 'R₃N',
    sufijo: '-amina (con localizadores N,N-)',
    prefijo: 'N,N-dialquilamino-',
    prioridad: 13,
    prioridadNota: 'Misma clase que las demás aminas.',
    ejemploNombre: 'N,N-dimetiletanamina',
    ejemploFormula: 'CH₃–CH₂–N(CH₃)₂',
    busqueda:
      'amina terciaria tres sustituyentes nitrogeno sin hidrogeno trimetilamina N,N-dimetil aminas terciarias',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'N',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'R″', enlace: 'simple', direccion: 'arriba' }],
        },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Nitrógeno sin hidrógenos, unido a tres restos orgánicos.',
    comoSeNombra: [
      'Tres carbonos unidos al nitrógeno y ningún hidrógeno: amina terciaria.',
      'Cadena principal: la más larga, de 2 carbonos → etanamina.',
      'Los dos metilos sobre el nitrógeno se citan con localizador N,N-.',
      'Nombre: N,N-dimetiletanamina.',
    ],
    propiedades: {
      polaridad: 'Polar por el par de electrones libre del nitrógeno.',
      puentesH: 'No los dona (no tiene H sobre el N); solo los acepta.',
      solubilidad: 'Menor que la de las aminas primarias de masa parecida.',
      ebullicion:
        'Claramente inferior a la de la primaria isómera; ese salto es la prueba de que no se asocia consigo misma.',
    },
  },
  {
    id: 'amida',
    categoria: 'nitrogenados',
    nombre: 'Amida',
    formula: '–CO–NH₂',
    sufijo: '-amida',
    prefijo: 'carbamoíl- (o amido-)',
    prioridad: 6,
    prioridadNota: 'Por debajo del haluro de acilo y por encima del nitrilo.',
    ejemploNombre: 'Etanamida (acetamida)',
    ejemploFormula: 'CH₃–CO–NH₂',
    busqueda:
      'amida amidas CONH2 carbonilo con nitrogeno enlace peptidico etanamida acetamida urea carbamoilo nailon proteina',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'C',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        {
          etiqueta: 'N',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'H', enlace: 'simple', direccion: 'abajo' }],
        },
        { etiqueta: 'H', clave: true },
      ],
    },
    descripcionDiagrama: 'Carbonilo unido a un nitrógeno que lleva dos hidrógenos.',
    comoSeNombra: [
      'El carbono del carbonilo pertenece a la cadena y es el número 1.',
      'CH₃–CO–NH₂ tiene 2 carbonos → etan-.',
      'Sufijo -amida: etanamida.',
      'Los sustituyentes sobre el nitrógeno llevan localizador N-: CH₃–CO–NH–CH₃ es N-metiletanamida.',
    ],
    propiedades: {
      polaridad: 'Muy polar; el enlace C–N tiene carácter parcial de doble enlace y la molécula es plana.',
      puentesH: 'Dona (si quedan H sobre el N) y acepta con fuerza.',
      solubilidad: 'Alta en las amidas pequeñas.',
      ebullicion:
        'La más alta entre los derivados de ácido: la etanamida funde a 82 °C y hierve a 221 °C.',
    },
    nota: 'El enlace peptídico de las proteínas y el enlace del nailon son amidas.',
  },
  {
    id: 'nitrilo',
    categoria: 'nitrogenados',
    nombre: 'Nitrilo',
    formula: '–C≡N',
    sufijo: '-nitrilo',
    prefijo: 'ciano-',
    prioridad: 7,
    prioridadNota: 'Por debajo de la amida y por encima del aldehído.',
    ejemploNombre: 'Etanonitrilo (acetonitrilo)',
    ejemploFormula: 'CH₃–C≡N',
    busqueda:
      'nitrilo nitrilos CN ciano cianuro triple enlace carbono nitrogeno acetonitrilo etanonitrilo nitrilo disolvente',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'C', enlace: 'triple', clave: true },
        { etiqueta: 'N', clave: true },
      ],
    },
    descripcionDiagrama: 'Carbono unido por triple enlace a un nitrógeno, en el extremo de la cadena.',
    comoSeNombra: [
      'El carbono del –C≡N cuenta como carbono de la cadena y es el número 1.',
      'CH₃–C≡N tiene 2 carbonos en total → etano-.',
      'Añade el sufijo -nitrilo: etanonitrilo.',
      'Si el nitrilo no puede entrar en la cadena principal se usa el prefijo ciano-.',
    ],
    propiedades: {
      polaridad: 'Muy polar: el acetonitrilo tiene uno de los momentos dipolares más altos de los disolventes comunes.',
      puentesH: 'Acepta puentes de hidrógeno; no los dona.',
      solubilidad: 'El acetonitrilo es miscible con agua.',
      ebullicion: 'Alta para su masa (82 °C el acetonitrilo) por las fuertes fuerzas dipolo-dipolo.',
    },
  },
  {
    id: 'nitro',
    categoria: 'nitrogenados',
    nombre: 'Grupo nitro',
    formula: '–NO₂',
    sufijo: '— (nunca)',
    prefijo: 'nitro-',
    prioridad: null,
    prioridadNota:
      'Solo puede ser prefijo: aunque sea el grupo más llamativo de la molécula, jamás da el sufijo.',
    ejemploNombre: 'Nitrobenceno',
    ejemploFormula: 'C₆H₅–NO₂',
    busqueda:
      'nitro NO2 nitrogrupo nitrobenceno nitracion nitroglicerina TNT explosivo prefijo nitro solo prefijo',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'N',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'O', clave: true },
      ],
    },
    descripcionDiagrama:
      'Nitrógeno unido a dos oxígenos equivalentes por resonancia y a un resto orgánico.',
    comoSeNombra: [
      'El –NO₂ no tiene sufijo propio en ningún caso.',
      'Se cita siempre como prefijo nitro-, colocado por orden alfabético con los demás.',
      'Sobre benceno: nitrobenceno; con dos grupos, 1,3-dinitrobenceno.',
      'Ejemplo con competencia: O₂N–CH₂–COOH es ácido nitroetanoico, donde manda el ácido.',
    ],
    propiedades: {
      polaridad: 'Extremadamente polar y fuertemente atractor de electrones.',
      puentesH: 'Acepta puentes de hidrógeno; no los dona.',
      solubilidad: 'Baja en agua; el nitrobenceno es prácticamente insoluble.',
      ebullicion: 'Alta (211 °C el nitrobenceno) por el gran momento dipolar.',
    },
  },
  {
    id: 'imina',
    categoria: 'nitrogenados',
    nombre: 'Imina (base de Schiff)',
    formula: 'C=N–H',
    sufijo: '-imina',
    prefijo: 'imino-',
    prioridad: 14,
    prioridadNota: 'Justo por debajo de la amina y por encima del éter.',
    ejemploNombre: 'Etanimina',
    ejemploFormula: 'CH₃–CH=NH',
    busqueda:
      'imina iminas base de schiff C=N doble enlace carbono nitrogeno imino condensacion aldehido amina',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'C', enlace: 'doble', clave: true },
        { etiqueta: 'N', clave: true, ramas: [{ etiqueta: 'H', enlace: 'simple', direccion: 'arriba' }] },
      ],
    },
    descripcionDiagrama: 'Carbono unido por doble enlace a un nitrógeno que lleva un hidrógeno.',
    comoSeNombra: [
      'Localiza el doble enlace C=N: el carbono implicado entra en la cadena.',
      'CH₃–CH=NH tiene 2 carbonos → etan-.',
      'Sufijo -imina: etanimina.',
      'Si el nitrógeno lleva un sustituyente se indica con N-: CH₃–CH=N–C₆H₅ es N-feniletanimina.',
    ],
    propiedades: {
      polaridad: 'Polar, con un par libre sobre el nitrógeno.',
      puentesH: 'Acepta; dona solo si conserva el H sobre el nitrógeno.',
      solubilidad: 'Moderada; las iminas pequeñas se hidrolizan con facilidad en medio acuoso.',
      ebullicion: 'Parecida a la de la cetona de la que procede.',
    },
    nota: 'Se forma al condensar un aldehído o cetona con una amina primaria, perdiendo agua.',
  },
  {
    id: 'azo',
    categoria: 'nitrogenados',
    nombre: 'Grupo azo',
    formula: '–N=N–',
    sufijo: '— (nunca)',
    prefijo: 'azo-',
    prioridad: null,
    prioridadNota: 'Solo prefijo: se nombra como azo- uniendo los dos restos.',
    ejemploNombre: 'Azobenceno',
    ejemploFormula: 'C₆H₅–N=N–C₆H₅',
    busqueda:
      'azo azoico colorante N=N doble enlace nitrogeno nitrogeno azobenceno tinte diazo cromoforo',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'N', enlace: 'doble', clave: true },
        { etiqueta: 'N', enlace: 'simple', clave: true },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Dos nitrógenos unidos por un doble enlace, cada uno con un resto orgánico.',
    comoSeNombra: [
      'El grupo –N=N– se nombra siempre como prefijo azo-.',
      'Con dos restos iguales: azobenceno.',
      'Con restos distintos se citan por orden alfabético: 4-metilazobenceno.',
      'Nunca aparece como sufijo, por muy determinante que sea del color del compuesto.',
    ],
    propiedades: {
      polaridad: 'Poco polar en el caso simétrico; muy polarizable.',
      puentesH: 'Acepta débilmente; no los dona.',
      solubilidad: 'Baja en agua salvo que se añadan grupos sulfónicos.',
      ebullicion: 'Alta: la mayoría son sólidos coloreados.',
    },
    nota: 'Absorbe luz visible: la mayor parte de los colorantes textiles sintéticos son compuestos azoicos.',
  },
  {
    id: 'isocianato',
    categoria: 'nitrogenados',
    nombre: 'Isocianato',
    formula: '–N=C=O',
    sufijo: '— (nomenclatura funcional: isocianato de …)',
    prefijo: 'isocianato-',
    prioridad: null,
    prioridadNota:
      'Se trata como un pseudohalógeno: siempre prefijo, nunca sufijo en la nomenclatura sustitutiva.',
    ejemploNombre: 'Isocianato de metilo',
    ejemploFormula: 'CH₃–N=C=O',
    busqueda:
      'isocianato NCO poliuretano espuma isocianato de metilo pseudohalogeno cumulado reactivo',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'N', enlace: 'doble', clave: true },
        { etiqueta: 'C', enlace: 'doble', clave: true },
        { etiqueta: 'O', clave: true },
      ],
    },
    descripcionDiagrama:
      'Cadena de nitrógeno, carbono y oxígeno con dos dobles enlaces consecutivos (enlaces acumulados).',
    comoSeNombra: [
      'El grupo –N=C=O no admite sufijo.',
      'Nomenclatura funcional: isocianato de metilo.',
      'Como sustituyente sobre un anillo: isocianatobenceno (fenilisocianato).',
      'Con dos grupos: diisocianato de hexano-1,6-diílo, materia prima de los poliuretanos.',
    ],
    propiedades: {
      polaridad: 'Muy polar y muy electrófilo.',
      puentesH: 'Acepta; no dona.',
      solubilidad: 'Reacciona con el agua liberando CO₂ y formando una amina.',
      ebullicion: 'Baja en los isocianatos pequeños (39 °C el de metilo).',
    },
  },

  /* ── Azufrados ────────────────────────────────────────────── */
  {
    id: 'tiol',
    categoria: 'azufrados',
    nombre: 'Tiol',
    formula: 'R–SH',
    sufijo: '-tiol',
    prefijo: 'sulfanil- (antes mercapto-)',
    prioridad: 11,
    prioridadNota:
      'Justo por debajo del alcohol y del fenol: el análogo de azufre siempre va detrás del de oxígeno.',
    ejemploNombre: 'Etanotiol',
    ejemploFormula: 'CH₃–CH₂–SH',
    busqueda:
      'tiol tioles SH mercaptano sulfhidrilo sulfanilo etanotiol olor gas natural cisteina puente disulfuro',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'S', enlace: 'simple', clave: true },
        { etiqueta: 'H', clave: true },
      ],
    },
    descripcionDiagrama: 'Un azufre con un hidrógeno unido a un resto orgánico.',
    comoSeNombra: [
      'Cuenta los carbonos: CH₃–CH₂–SH tiene 2 → etano-.',
      'Añade el sufijo -tiol conservando la vocal: etanotiol.',
      'Como sustituyente, el prefijo actual es sulfanil-: 2-sulfaniletanol.',
      'El nombre tradicional «mercaptano» está en desuso en la nomenclatura formal.',
    ],
    propiedades: {
      polaridad: 'Poco polar: azufre y carbono tienen electronegatividad parecida.',
      puentesH: 'Prácticamente no forma puentes de hidrógeno, a diferencia del alcohol.',
      solubilidad: 'Muy baja en agua.',
      ebullicion:
        'Bastante más baja que la del alcohol equivalente: el etanotiol hierve a 35 °C y el etanol a 78 °C.',
    },
    nota: 'Es más ácido que el alcohol equivalente y detectable por el olfato en cantidades ínfimas: por eso se añade al gas doméstico.',
  },
  {
    id: 'tioeter',
    categoria: 'azufrados',
    nombre: 'Tioéter (sulfuro)',
    formula: 'R–S–R′',
    sufijo: '— (nomenclatura funcional: sulfuro de …)',
    prefijo: 'alquilsulfanil- (metilsulfanil-)',
    prioridad: null,
    prioridadNota:
      'Igual que el éter: se cita como prefijo o con nomenclatura funcional, nunca como sufijo.',
    ejemploNombre: '(Metilsulfanil)metano — sulfuro de dimetilo',
    ejemploFormula: 'CH₃–S–CH₃',
    busqueda:
      'tioeter tioeteres sulfuro sulfuros R-S-R metilsulfanilo sulfuro de dimetilo tioanisol metionina azufre puente',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'S', enlace: 'simple', clave: true },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Un azufre que une dos restos orgánicos, sin hidrógeno propio.',
    comoSeNombra: [
      'Elige la cadena principal más larga: aquí ambas tienen 1 carbono.',
      'La otra, con el azufre, da el prefijo metilsulfanil-.',
      'Nombre sustitutivo: (metilsulfanil)metano.',
      'Nomenclatura funcional aceptada: sulfuro de dimetilo.',
    ],
    propiedades: {
      polaridad: 'Poco polar.',
      puentesH: 'Acepta muy débilmente; no los dona.',
      solubilidad: 'Baja en agua.',
      ebullicion: 'Superior a la del éter equivalente por la mayor masa y polarizabilidad del azufre.',
    },
  },
  {
    id: 'sulfoxido',
    categoria: 'azufrados',
    nombre: 'Sulfóxido',
    formula: 'R–SO–R′',
    sufijo: '— (nomenclatura funcional: sulfóxido de …)',
    prefijo: 'sulfinil-',
    prioridad: null,
    prioridadNota: 'Se cita como prefijo sulfinil- o con el nombre funcional del sulfóxido.',
    ejemploNombre: 'Sulfóxido de dimetilo (DMSO)',
    ejemploFormula: 'CH₃–SO–CH₃',
    busqueda:
      'sulfoxido sulfoxidos DMSO dimetilsulfoxido S=O sulfinilo disolvente aprotico polar azufre oxidado',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'S',
          enlace: 'simple',
          clave: true,
          ramas: [{ etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true }],
        },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Azufre con un oxígeno unido por doble enlace, situado entre dos restos.',
    comoSeNombra: [
      'Es el producto de oxidar un sulfuro con un solo oxígeno.',
      'Nomenclatura funcional: sulfóxido de dimetilo (o dimetilsulfóxido).',
      'Como sustituyente: (metilsulfinil)metano.',
      'La forma abreviada DMSO es la habitual en el laboratorio.',
    ],
    propiedades: {
      polaridad: 'Muy polar: el enlace S=O genera un momento dipolar grande.',
      puentesH: 'Acepta puentes de hidrógeno con mucha fuerza; no los dona.',
      solubilidad: 'El DMSO es miscible con agua y con casi todos los disolventes orgánicos.',
      ebullicion: 'Muy alta: 189 °C el DMSO.',
    },
  },
  {
    id: 'sulfona',
    categoria: 'azufrados',
    nombre: 'Sulfona',
    formula: 'R–SO₂–R′',
    sufijo: '— (nomenclatura funcional: sulfona de …)',
    prefijo: 'sulfonil-',
    prioridad: null,
    prioridadNota: 'Como el sulfóxido: prefijo sulfonil- o nombre funcional.',
    ejemploNombre: 'Sulfona de dimetilo (dimetilsulfona)',
    ejemploFormula: 'CH₃–SO₂–CH₃',
    busqueda:
      'sulfona sulfonas SO2 sulfonilo dimetilsulfona sulfolano azufre doblemente oxidado sulfamida',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'S',
          enlace: 'simple',
          clave: true,
          ramas: [
            { etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true },
            { etiqueta: 'O', enlace: 'doble', direccion: 'abajo', clave: true },
          ],
        },
        { etiqueta: 'R′' },
      ],
    },
    descripcionDiagrama: 'Azufre con dos oxígenos unidos por dobles enlaces, uno arriba y otro abajo.',
    comoSeNombra: [
      'Resulta de oxidar el sulfuro con dos oxígenos.',
      'Nomenclatura funcional: sulfona de dimetilo.',
      'Como sustituyente: (metilsulfonil)metano.',
      'El grupo –SO₂– unido a un nitrógeno da las sulfamidas, base de un grupo clásico de antibióticos.',
    ],
    propiedades: {
      polaridad: 'Muy polar, aunque los dos dipolos S=O se compensan parcialmente.',
      puentesH: 'Acepta; no dona.',
      solubilidad: 'La dimetilsulfona es soluble en agua.',
      ebullicion: 'Muy alta; muchas sulfonas son sólidas a temperatura ambiente.',
    },
  },
  {
    id: 'acido-sulfonico',
    categoria: 'azufrados',
    nombre: 'Ácido sulfónico',
    formula: '–SO₃H',
    sufijo: 'ácido …-sulfónico',
    prefijo: 'sulfo-',
    prioridad: 2,
    prioridadNota:
      'Solo por debajo del ácido carboxílico: es el segundo escalón de la escalera de prioridad.',
    ejemploNombre: 'Ácido bencenosulfónico',
    ejemploFormula: 'C₆H₅–SO₃H',
    busqueda:
      'acido sulfonico SO3H sulfo sulfonacion detergente resina de intercambio ionico acido fuerte bencenosulfonico',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        {
          etiqueta: 'S',
          enlace: 'simple',
          clave: true,
          ramas: [
            { etiqueta: 'O', enlace: 'doble', direccion: 'arriba', clave: true },
            { etiqueta: 'O', enlace: 'doble', direccion: 'abajo', clave: true },
          ],
        },
        { etiqueta: 'O', enlace: 'simple', clave: true },
        { etiqueta: 'H', clave: true },
      ],
    },
    descripcionDiagrama:
      'Azufre con dos oxígenos por doble enlace y un tercero unido a un hidrógeno ácido.',
    comoSeNombra: [
      'El grupo –SO₃H se añade al nombre del hidrocarburo completo, sin quitarle carbonos.',
      'Sobre benceno: benceno + sulfónico.',
      'Antepón la palabra ácido: ácido bencenosulfónico.',
      'Como sustituyente frente a un carboxilo, pasa a prefijo sulfo-: ácido 4-sulfobenzoico.',
    ],
    propiedades: {
      polaridad: 'Extremadamente polar e iónico en disolución.',
      puentesH: 'Dona y acepta con gran intensidad.',
      solubilidad: 'Muy alta en agua; su sal sódica es la base de los detergentes sintéticos.',
      ebullicion: 'Muy alta: son sólidos que descomponen antes de hervir.',
    },
    nota: 'Es un ácido fuerte, comparable en fuerza al sulfúrico, muy por encima del ácido carboxílico.',
  },

  /* ── Halogenados y organometálicos ────────────────────────── */
  {
    id: 'haluro-alquilo',
    categoria: 'halogenados',
    nombre: 'Haluro de alquilo',
    formula: 'R–X (F, Cl, Br, I)',
    sufijo: '— (nunca)',
    prefijo: 'fluoro-, cloro-, bromo-, yodo-',
    prioridad: null,
    prioridadNota:
      'Los halógenos son siempre prefijo, sin excepción: no compiten nunca por el sufijo.',
    ejemploNombre: '2-cloropropano',
    ejemploFormula: 'CH₃–CHCl–CH₃',
    busqueda:
      'haluro de alquilo halogenuro halogeno cloro bromo yodo fluor cloropropano cloroformo sustitucion nucleofila SN1 SN2 prefijo halo',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'X', clave: true },
      ],
    },
    descripcionDiagrama: 'Un resto orgánico unido directamente a un átomo de halógeno.',
    comoSeNombra: [
      'Cadena principal: 3 carbonos → propano.',
      'El halógeno es solo prefijo: cloro-.',
      'Numera para darle el localizador más bajo posible: aquí el carbono central, 2.',
      'Nombre: 2-cloropropano (el tradicional cloruro de isopropilo es nomenclatura funcional).',
    ],
    propiedades: {
      polaridad:
        'Polar, decreciente al bajar en el grupo: el C–F es muy polar y el C–I casi apolar pero muy polarizable.',
      puentesH: 'No los forma.',
      solubilidad: 'Insoluble en agua; buenos disolventes orgánicos.',
      ebullicion:
        'Aumenta mucho con la masa del halógeno: CH₃Cl hierve a −24 °C y CH₃I a 42 °C.',
    },
  },
  {
    id: 'organometalico',
    categoria: 'halogenados',
    nombre: 'Organometálico (reactivo de Grignard)',
    formula: 'R–Mg–X',
    sufijo: '— (nomenclatura funcional: haluro de alquilmagnesio)',
    prefijo: '— (no se usa como sustituyente)',
    prioridad: null,
    prioridadNota: 'Fuera de la escalera de prioridad: se nombra con nomenclatura funcional propia.',
    ejemploNombre: 'Bromuro de etilmagnesio',
    ejemploFormula: 'CH₃–CH₂–MgBr',
    busqueda:
      'organometalico organometalicos grignard magnesio RMgX bromuro de etilmagnesio organolitico carbanion enlace carbono metal sintesis',
    diagrama: {
      tipo: 'lineal',
      nodos: [
        { etiqueta: 'R', enlace: 'simple' },
        { etiqueta: 'Mg', enlace: 'simple', clave: true },
        { etiqueta: 'X', clave: true },
      ],
    },
    descripcionDiagrama:
      'Un resto orgánico unido a un átomo de magnesio que a su vez lleva un halógeno.',
    comoSeNombra: [
      'Nombra primero el halogenuro: bromuro.',
      'Después el resto orgánico unido al metal: etil-.',
      'Añade el nombre del metal: -magnesio.',
      'Resultado: bromuro de etilmagnesio. Con litio sería etil-litio.',
    ],
    propiedades: {
      polaridad:
        'El enlace C–Mg está muy polarizado hacia el carbono, que queda con carga parcial negativa.',
      puentesH: 'No aplica; se prepara y se maneja en disolventes anhidros.',
      solubilidad:
        'Reacciona de forma violenta con el agua y con cualquier grupo con hidrógeno ácido.',
      ebullicion: 'No procede: se usa siempre en disolución de éter o THF.',
    },
    nota: 'Invierte la polaridad habitual del carbono: por eso permite formar enlaces C–C nuevos con aldehídos y cetonas.',
  },
];

const TOTAL_GRUPOS = GRUPOS.length;

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

type ModoOrden = 'categoria' | 'prioridad';

export default function TablaGruposFuncionalesPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [orden, setOrden] = useState<ModoOrden>('categoria');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático: quien llega con ejercicios delante escribe directamente
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    const filtrados = GRUPOS.filter((grupo) => {
      const coincideCategoria =
        categoriaActiva === 'todas' || grupo.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(
        `${grupo.nombre} ${grupo.formula} ${grupo.sufijo} ${grupo.prefijo} ${grupo.ejemploNombre} ${grupo.ejemploFormula} ${grupo.busqueda}`,
      ).includes(termino);
    });

    if (orden === 'categoria') return filtrados;

    // Orden por prioridad IUPAC: los que solo pueden ser prefijo van al final
    return [...filtrados].sort((a, b) => {
      const pa = a.prioridad ?? 999;
      const pb = b.prioridad ?? 999;
      if (pa !== pb) return pa - pb;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
  }, [consulta, categoriaActiva, orden]);

  const alternarFila = (id: string) => {
    setAbiertas((previas) =>
      previas.includes(id) ? previas.filter((item) => item !== id) : [...previas, id],
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚗️</span> Tabla de Grupos Funcionales
        </h1>
        <p className={styles.subtitle}>
          {TOTAL_GRUPOS} grupos funcionales de química orgánica con su fórmula, su sufijo y su
          prefijo IUPAC, un ejemplo con el nombre construido paso a paso y sus propiedades
          características. Ordena la tabla por prioridad y descubre qué grupo manda cuando hay
          varios en la misma molécula.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros + orden */}
      <section className={styles.buscadorPanel} aria-label="Buscador de grupos funcionales">
        <label className={styles.buscadorLabel} htmlFor="buscador-grupos">
          Busca un grupo funcional por nombre, fórmula o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-grupos"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="COOH, cetona, amina, éster, OH, nitrilo…"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.limpiarBtn}
            onClick={() => {
              setConsulta('');
              setCategoriaActiva('todas');
              buscadorRef.current?.focus({ preventScroll: true });
            }}
          >
            <span aria-hidden="true">✕</span> Limpiar
          </button>
        </div>
        <p className={styles.ayudaBusqueda}>
          Funciona con acentos o sin ellos y con sinónimos: <strong>COOH</strong> encuentra el ácido
          carboxílico, <strong>CHO</strong> el aldehído, <strong>NH2</strong> la amina y{' '}
          <strong>mercaptano</strong> el tiol.
        </p>

        <div className={styles.filtros}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${
              categoriaActiva === 'todas' ? styles.filtroBtnActivo : ''
            }`}
            aria-pressed={categoriaActiva === 'todas'}
            onClick={() => setCategoriaActiva('todas')}
          >
            Todas
          </button>
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={`${styles.filtroBtn} ${
                categoriaActiva === categoria.id ? styles.filtroBtnActivo : ''
              }`}
              aria-pressed={categoriaActiva === categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
            >
              <span aria-hidden="true">{categoria.icono}</span> {categoria.nombre}
            </button>
          ))}
        </div>

        <div className={styles.ordenPanel}>
          <span className={styles.ordenEtiqueta}>Ordenar por:</span>
          <button
            type="button"
            className={`${styles.ordenBtn} ${orden === 'categoria' ? styles.ordenBtnActivo : ''}`}
            aria-pressed={orden === 'categoria'}
            onClick={() => setOrden('categoria')}
          >
            <span aria-hidden="true">🗂️</span> Categoría
          </button>
          <button
            type="button"
            className={`${styles.ordenBtn} ${orden === 'prioridad' ? styles.ordenBtnActivo : ''}`}
            aria-pressed={orden === 'prioridad'}
            onClick={() => setOrden('prioridad')}
          >
            <span aria-hidden="true">🏆</span> Prioridad IUPAC
          </button>
        </div>
        {orden === 'prioridad' && (
          <p className={styles.ordenAviso}>
            De arriba abajo, del grupo que siempre manda al que nunca puede dar el sufijo. El
            primero de la lista es el que fija el sufijo y numera la cadena; todos los demás pasan a
            prefijo.
          </p>
        )}

        <p className={styles.contador} role="status" aria-live="polite">
          {resultados.length} de {TOTAL_GRUPOS} grupos funcionales
        </p>
      </section>

      {/* Tabla de grupos */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> Ningún grupo funcional coincide con «{consulta}».
            Prueba con <strong>carbonilo</strong>, <strong>COOH</strong>, <strong>amida</strong>,{' '}
            <strong>tiol</strong> o <strong>aromático</strong>, o quita el filtro de categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((grupo) => {
            const abierta = abiertas.includes(grupo.id);
            return (
              <li key={grupo.id} className={styles.fila}>
                <button
                  type="button"
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${grupo.id}`}
                  onClick={() => alternarFila(grupo.id)}
                >
                  <span className={styles.filaNombre}>
                    {grupo.nombre}
                    <span className={styles.filaCategoria}>
                      {NOMBRE_CATEGORIA[grupo.categoria]}
                    </span>
                    <span
                      className={`${styles.prioridadBadge} ${
                        grupo.prioridad === null ? styles.prioridadBadgePrefijo : ''
                      }`}
                    >
                      {grupo.prioridad === null
                        ? 'Solo prefijo'
                        : `Prioridad ${grupo.prioridad}`}
                    </span>
                  </span>
                  <span className={styles.filaDatos}>
                    <span className={styles.par}>
                      <span className={styles.etq}>Grupo</span>
                      <span className={`${styles.expr} ${styles.exprFormula}`}>
                        {grupo.formula}
                      </span>
                    </span>
                    <span className={styles.par}>
                      <span className={styles.etq}>Sufijo</span>
                      <span className={styles.expr}>{grupo.sufijo}</span>
                    </span>
                    <span className={styles.par}>
                      <span className={styles.etq}>Prefijo</span>
                      <span className={styles.expr}>{grupo.prefijo}</span>
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${grupo.id}`} className={styles.detalle}>
                    <div className={styles.detalleSuperior}>
                      <div className={styles.diagramaCaja}>
                        <DiagramaGrupo diagrama={grupo.diagrama} />
                        <p className={styles.diagramaTexto}>{grupo.descripcionDiagrama}</p>
                      </div>
                      <div className={styles.ejemploCaja}>
                        <h3>
                          <span aria-hidden="true">🧪</span> Ejemplo
                        </h3>
                        <p className={styles.ejemploFormula}>{grupo.ejemploFormula}</p>
                        <p className={styles.ejemploNombre}>{grupo.ejemploNombre}</p>
                      </div>
                    </div>

                    <div className={styles.prioridadCaja}>
                      <h3>
                        <span aria-hidden="true">🏆</span>{' '}
                        {grupo.prioridad === null
                          ? 'Fuera de la escalera de sufijos'
                          : `Prioridad IUPAC ${grupo.prioridad}`}
                      </h3>
                      <p>{grupo.prioridadNota}</p>
                    </div>

                    <h3>Cómo se nombra, paso a paso</h3>
                    <ol className={styles.pasosNombre}>
                      {grupo.comoSeNombra.map((paso) => (
                        <li key={paso}>{paso}</li>
                      ))}
                    </ol>

                    <h3>Propiedades que permiten reconocerlo</h3>
                    <ul className={styles.propiedadesLista}>
                      <li>
                        <strong>Polaridad:</strong> {grupo.propiedades.polaridad}
                      </li>
                      <li>
                        <strong>Puentes de hidrógeno:</strong> {grupo.propiedades.puentesH}
                      </li>
                      <li>
                        <strong>Solubilidad en agua:</strong> {grupo.propiedades.solubilidad}
                      </li>
                      <li>
                        <strong>Punto de ebullición:</strong> {grupo.propiedades.ebullicion}
                      </li>
                    </ul>

                    {grupo.nota && (
                      <p className={styles.notaGrupo}>
                        <span aria-hidden="true">💡</span> {grupo.nota}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender la nomenclatura, no memorizarla"
        subtitle="Qué es un grupo funcional, cómo decide la IUPAC quién manda y cómo construir un nombre completo"
      >
        <section className={styles.guideSection}>
          <h2>Qué es un grupo funcional</h2>
          <p>
            Un grupo funcional es el conjunto de átomos que concentra la reactividad de una molécula
            orgánica. El esqueleto de carbonos aporta el tamaño y la forma, pero es el grupo
            funcional el que decide cómo se comporta el compuesto: si es ácido o básico, si se
            disuelve en agua, con qué reacciona y a qué temperatura hierve. Dos moléculas con el
            mismo número de carbonos y distinto grupo funcional pueden tener propiedades opuestas.
          </p>
          <p>
            El caso más claro es el par etanol / éter dimetílico. Ambos responden a la fórmula
            molecular C₂H₆O, pero el primero es un alcohol que hierve a 78 °C y se mezcla con agua
            en cualquier proporción, y el segundo es un éter que hierve a −24 °C y es un gas. La
            única diferencia es dónde está colocado el oxígeno.
          </p>
          <div className={styles.formulaBox}>
            CH₃–CH₂–OH (etanol, 78 °C) &nbsp; frente a &nbsp; CH₃–O–CH₃ (éter dimetílico, −24 °C)
          </div>

          <h2>La escalera de prioridad IUPAC, de un vistazo</h2>
          <p>
            Cuando una molécula tiene varios grupos funcionales, solo uno se nombra como sufijo: el
            de mayor prioridad. Ese grupo, además, es el que fija la numeración de la cadena. Todos
            los demás pasan a prefijo y se citan por orden alfabético. Esta es la duda más frecuente
            al nombrar compuestos y la razón de que la tabla de arriba se pueda ordenar por
            prioridad.
          </p>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Grupo funcional</th>
                  <th>Sufijo</th>
                  <th>Prefijo cuando pierde</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <strong>Ácido carboxílico</strong>
                  </td>
                  <td>ácido …-oico</td>
                  <td>carboxi-</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Ácido sulfónico</td>
                  <td>ácido …-sulfónico</td>
                  <td>sulfo-</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Anhídrido</td>
                  <td>anhídrido …-oico</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Éster</td>
                  <td>-oato de …ilo</td>
                  <td>alcoxicarbonil- / aciloxi-</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Haluro de acilo</td>
                  <td>haluro de …-oílo</td>
                  <td>halocarbonil-</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Amida</td>
                  <td>-amida</td>
                  <td>carbamoíl-</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Nitrilo</td>
                  <td>-nitrilo</td>
                  <td>ciano-</td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>Aldehído</td>
                  <td>-al</td>
                  <td>oxo- / formil-</td>
                </tr>
                <tr>
                  <td>9</td>
                  <td>Cetona</td>
                  <td>-ona</td>
                  <td>oxo-</td>
                </tr>
                <tr>
                  <td>10</td>
                  <td>Alcohol y fenol</td>
                  <td>-ol</td>
                  <td>hidroxi-</td>
                </tr>
                <tr>
                  <td>11</td>
                  <td>Tiol</td>
                  <td>-tiol</td>
                  <td>sulfanil-</td>
                </tr>
                <tr>
                  <td>13</td>
                  <td>Amina</td>
                  <td>-amina</td>
                  <td>amino-</td>
                </tr>
                <tr>
                  <td>14</td>
                  <td>Imina</td>
                  <td>-imina</td>
                  <td>imino-</td>
                </tr>
                <tr>
                  <td>15</td>
                  <td>Éter</td>
                  <td>—</td>
                  <td>alcoxi-</td>
                </tr>
                <tr>
                  <td>16-17</td>
                  <td>Alqueno, alquino, alcano y areno</td>
                  <td>-eno / -ino / -ano</td>
                  <td>alquenil- / alquinil- / alquil- / fenil-</td>
                </tr>
                <tr>
                  <td>Sin nivel</td>
                  <td>Halógenos, nitro, azo, isocianato, epóxido</td>
                  <td>—</td>
                  <td>cloro-, nitro-, azo-, isocianato-, epoxi-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            El nivel 12 corresponde a los hidroperóxidos (–OOH), poco frecuentes en los ejercicios
            de clase, y por eso no aparece en la tabla de arriba como fila propia.
          </p>

          <h2>Dónde se usa esto de verdad</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📝
              </span>
              <strong>Nombrar un compuesto en un examen</strong>
              <p>
                Es el uso directo: identificar el grupo de mayor prioridad, escoger el sufijo,
                numerar la cadena desde el extremo correcto y colocar el resto como prefijos por
                orden alfabético.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🔬
              </span>
              <strong>Predecir propiedades sin datos</strong>
              <p>
                Ver un –COOH permite anticipar que el compuesto será ácido, soluble si la cadena es
                corta y de punto de ebullición alto. El grupo funcional es un atajo para razonar
                sobre una molécula desconocida.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                💊
              </span>
              <strong>Leer una etiqueta o un prospecto</strong>
              <p>
                Los nombres de medicamentos, aditivos y cosméticos son nomenclatura orgánica. Saber
                que un «-oato» es un éster o que una «-amida» procede de un ácido cambia por completo
                lo que se entiende al leerlos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎓
              </span>
              <strong>Preparar un examen de admisión universitaria</strong>
              <p>
                La formulación orgánica aparece en las pruebas de acceso a la universidad de
                prácticamente todos los países hispanohablantes, y casi siempre con la misma
                estructura: nombrar cinco compuestos y formular otros cinco.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué en el ácido láctico el –OH se llama «hidroxi» y no «ol»?</h4>
              <p>
                Porque en CH₃–CH(OH)–COOH conviven un alcohol y un ácido carboxílico, y el ácido
                tiene prioridad 1 frente a la prioridad 10 del alcohol. El ácido se lleva el sufijo
                (-oico) y el carbono del carboxilo es el número 1. Al alcohol solo le queda el
                prefijo con su localizador: ácido 2-hidroxipropanoico.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla mental: solo hay un sufijo por nombre. Todo
                lo demás son prefijos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo distingo un aldehído de una cetona en la fórmula?</h4>
              <p>
                Mira dónde está el carbonilo. Si el carbono del C=O tiene un hidrógeno y está en el
                extremo de la cadena, es un aldehído (–CHO) y no necesita localizador porque siempre
                es el carbono 1. Si está entre dos carbonos, es una cetona y sí lleva número. Además
                el aldehído se oxida con facilidad a ácido y la cetona no.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Escrito en línea, CH₃CHO es aldehído y CH₃COCH₃
                es cetona.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el grupo nitro nunca da sufijo si parece muy importante?</h4>
              <p>
                La IUPAC reserva los sufijos para las clases de compuestos que definen una función
                química reconocida. Un puñado de grupos quedan fuera por convenio y solo pueden ser
                prefijos: los halógenos, el nitro (–NO₂), el nitroso, el azo, los isocianatos y los
                epóxidos. Da igual cuántos haya en la molécula: siempre irán delante.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Ordena la tabla de arriba por prioridad: estos
                grupos aparecen agrupados al final, marcados como «solo prefijo».
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Los nombres tradicionales como acetona o ácido acético siguen valiendo?</h4>
              <p>
                Sí. La IUPAC mantiene una lista de nombres retenidos de uso tan extendido que
                sustituirlos sería contraproducente: ácido acético, ácido fórmico, acetona, tolueno,
                fenol, anilina, urea o glicerol. En un examen conviene escribir el nombre
                sistemático y, si acaso, el tradicional entre paréntesis.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Los nombres tradicionales que la IUPAC ya no
                acepta son otros, como «mercaptano» en lugar de tiol.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué significa exactamente que un grupo «numera la cadena»?</h4>
              <p>
                Que se cuentan los carbonos desde el extremo que dé el número más bajo al grupo
                principal, no al primer sustituyente que se encuentre. En CH₃–CH(Cl)–CH₂–OH la
                cadena se numera desde el –OH aunque el cloro quede así en la posición 2: el nombre
                es 2-cloropropan-1-ol y nunca 2-cloropropan-3-ol.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> El orden de decisión es: grupo principal, luego
                insaturaciones, luego sustituyentes.
              </p>
            </div>
          </div>

          <h2>Cómo nombrar cualquier compuesto sin bloquearte</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Localiza todos los grupos funcionales</strong>
                <p>
                  Recorre la fórmula buscando heteroátomos (O, N, S, halógenos) y enlaces múltiples.
                  Anótalos todos antes de decidir nada; el error más común es empezar a nombrar con
                  el primero que se ve.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide cuál manda</strong>
                <p>
                  Compara sus prioridades en la escalera. El más alto será el sufijo; todos los
                  demás, prefijos. Si solo hay grupos «sin nivel», la cadena se nombra como
                  hidrocarburo y todo va delante.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Elige y numera la cadena principal</strong>
                <p>
                  La cadena más larga que contenga el grupo principal. Numérala desde el extremo que
                  dé el localizador más bajo a ese grupo, aunque perjudique a los sustituyentes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Monta el nombre</strong>
                <p>
                  Prefijos por orden alfabético con sus localizadores, después la raíz del número de
                  carbonos, después la insaturación si la hay y, al final, el sufijo del grupo
                  principal.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba dibujando el nombre al revés</strong>
                <p>
                  Formula tu propio nombre desde cero y compara con el enunciado. Si no coincide,
                  el fallo casi siempre está en la numeración o en un sufijo que debía ser prefijo.
                </p>
              </div>
            </div>
          </div>

          <h2>Consejos para reconocer grupos de un vistazo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Empieza por el heteroátomo</strong>
              <p>
                Encuentra el O, el N o el S y mira qué tiene alrededor: eso identifica el grupo en
                un segundo, sin recorrer toda la fórmula.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧲
              </span>
              <strong>Agrupa por el carbonilo</strong>
              <p>
                Aldehído, cetona, ácido, éster, amida, anhídrido y haluro de acilo comparten el C=O.
                Lo que cambia es qué hay al otro lado, y ese detalle fija el orden de prioridad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💧
              </span>
              <strong>Usa el punto de ebullición como pista</strong>
              <p>
                Si dona puentes de hidrógeno (–OH, –NH, –COOH) hierve alto. Si solo los acepta
                (éter, éster, cetona), bastante menos. Si no los forma (alcano, haluro), lo más bajo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔄
              </span>
              <strong>Relaciona el azufre con el oxígeno</strong>
              <p>
                Tiol y alcohol, tioéter y éter son análogos: cambia S por O. Pero el azufre casi no
                forma puentes de hidrógeno, así que las propiedades no se copian.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes al nombrar compuestos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Poner dos sufijos en el mismo nombre:</strong> «ácido hidroxipropanoico» es
                correcto, «ácido propanoicol» no existe. Solo el grupo de mayor prioridad da sufijo.
              </li>
              <li>
                <strong>Numerar desde el sustituyente y no desde el grupo principal:</strong> en
                CH₃–CH(Cl)–CH₂–OH el nombre es 2-cloropropan-1-ol, no 2-cloropropan-3-ol.
              </li>
              <li>
                <strong>Olvidar que el carbono del –COOH, –CHO y –C≡N cuenta:</strong> CH₃–CHO tiene
                dos carbonos y se llama etanal, no metanal.
              </li>
              <li>
                <strong>Confundir éter y éster:</strong> el éter es R–O–R′ sin carbonilo; el éster
                es R–CO–O–R′ y procede de un ácido. Una sola letra, dos familias muy distintas.
              </li>
              <li>
                <strong>Tratar el fenol como un alcohol cualquiera:</strong> el –OH unido al anillo
                aromático es unas mil veces más ácido y tiene su propio nombre de clase.
              </li>
              <li>
                <strong>Dar sufijo a un halógeno o al grupo nitro:</strong> no existe el sufijo
                «-cloro» ni «-nitro». Siempre van delante, como prefijos.
              </li>
              <li>
                <strong>Colocar los prefijos por orden de aparición:</strong> se ordenan
                alfabéticamente, no por su posición en la cadena: 3-etil-2-metilpentano.
              </li>
              <li>
                <strong>Suponer que la amina es tan polar como el alcohol:</strong> el nitrógeno es
                menos electronegativo que el oxígeno, así que las aminas hierven bastante por debajo
                de los alcoholes equivalentes.
              </li>
            </ul>
          </div>

          <h2>¿Para qué nivel sirve esta tabla?</h2>
          <p>
            El contenido cubre desde los primeros cursos de química orgánica de la educación media y
            la preparatoria hasta la química orgánica de primer curso universitario en carreras de
            ciencias, ingeniería, farmacia o medicina. Los grupos de las categorías de
            hidrocarburos, oxigenados y nitrogenados son los que aparecen en cualquier examen de
            admisión universitaria; los azufrados y los organometálicos suelen entrar ya en la
            universidad.
          </p>
          <p>
            La nomenclatura recogida sigue las recomendaciones IUPAC de 2013, que son las vigentes.
            Cuando un nombre tradicional sigue estando aceptado (ácido acético, acetona, tolueno,
            fenol) aparece entre paréntesis junto al sistemático.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-grupos-funcionales')} />

      <ShareCard appName="tabla-grupos-funcionales" />

      <Footer appName="tabla-grupos-funcionales" />
    </div>
  );
}
