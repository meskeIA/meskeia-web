// ═══════════════════════════════════════════════════════════════════════
// DATOS DE LA TABLA DE GRUPOS FUNCIONALES
//
// Viven fuera de `page.tsx` desde el 12/10/2026 para que la ficha de aula (`casos.ts`) lea la
// MISMA tabla que pinta la página, y el MISMO buscador. Una copia aparte divergiría en silencio
// y la ficha acabaría dando por mala una respuesta que la tabla enseña en pantalla.
//
// Sin React ni DOM: solo datos y funciones puras.
// ═══════════════════════════════════════════════════════════════════════

/* ────────────────────────────────────────────────────────────────
   Utilidades
──────────────────────────────────────────────────────────────── */

/** Normaliza texto para buscar sin acentos, sin mayúsculas y con los subíndices en ASCII. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080))
    .replace(/[²³¹]/g, (d) => ({ '²': '2', '³': '3', '¹': '1' })[d] ?? d);
}

/**
 * ¿Coincide este grupo con lo que se ha tecleado?
 *
 * Nombre, fórmula, sufijo, prefijo y ejemplo se buscan por SUBCADENA: son campos cortos y
 * específicos, donde una coincidencia parcial siempre es informativa. Las palabras clave,
 * en cambio, se buscan por PREFIJO DE PALABRA, porque buscar subcadenas dentro de ellas
 * cuela resultados que nadie pidió: la fórmula general del alcano, «CnH2n+2», contiene la
 * subcadena «nh2», así que teclear NH2 devolvía alcano, alqueno y alquino por delante de la
 * amina, justo lo contrario de lo que promete el texto de ayuda (hallazgo 991).
 */
export function coincideConLaBusqueda(
  grupo: Pick<
    GrupoFuncional,
    'nombre' | 'formula' | 'sufijo' | 'prefijo' | 'ejemploNombre' | 'ejemploFormula' | 'busqueda'
  >,
  termino: string,
): boolean {
  if (termino === '') return true;

  const cabecera = normalizar(
    `${grupo.nombre} ${grupo.formula} ${grupo.sufijo} ${grupo.prefijo} ${grupo.ejemploNombre} ${grupo.ejemploFormula}`,
  );
  if (cabecera.includes(termino)) return true;

  return normalizar(grupo.busqueda)
    .split(/[^a-z0-9+]+/)
    .some((palabra) => palabra !== '' && palabra.startsWith(termino));
}

/* ────────────────────────────────────────────────────────────────
   Esquemas que dibuja la página (solo la forma: el SVG vive en page.tsx)
──────────────────────────────────────────────────────────────── */

export type TipoEnlace = 'simple' | 'doble' | 'triple';

export interface RamaDiagrama {
  etiqueta: string;
  enlace: TipoEnlace;
  direccion: 'arriba' | 'abajo';
  clave?: boolean;
}

export interface NodoDiagrama {
  etiqueta: string;
  /** Enlace hacia el nodo siguiente */
  enlace?: TipoEnlace;
  clave?: boolean;
  ramas?: RamaDiagrama[];
}

export type Diagrama =
  | { tipo: 'lineal'; nodos: NodoDiagrama[] }
  | { tipo: 'benceno'; sustituyente: string }
  | { tipo: 'ciclo3'; vertice: string };

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

export type CategoriaId =
  | 'hidrocarburos'
  | 'oxigenados'
  | 'nitrogenados'
  | 'azufrados'
  | 'halogenados';

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

export interface PropiedadesGrupo {
  polaridad: string;
  puentesH: string;
  solubilidad: string;
  ebullicion: string;
}

export interface GrupoFuncional {
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

export const CATEGORIAS: Categoria[] = [
  { id: 'hidrocarburos', nombre: 'Hidrocarburos', icono: '🛢️' },
  { id: 'oxigenados', nombre: 'Oxigenados', icono: '💧' },
  { id: 'nitrogenados', nombre: 'Nitrogenados', icono: '🔷' },
  { id: 'azufrados', nombre: 'Azufrados', icono: '🟡' },
  { id: 'halogenados', nombre: 'Halogenados y organometálicos', icono: '⚗️' },
];

export const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
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

export const GRUPOS: GrupoFuncional[] = [
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
      'Nomenclatura funcional: peróxido de dimetilo (o de dibenzoílo, si los restos son benzoílo, C₆H₅–CO–; con restos bencilo, C₆H₅–CH₂–, sería peróxido de dibencilo).',
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

export const TOTAL_GRUPOS = GRUPOS.length;
