'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import DisclaimerCard from '@/components/DisclaimerCard';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './RegimenesPoliticos.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface CeldaSeleccionada {
  regimenIndex: number;
  caractIndex: number;
}

interface TransicionTipo {
  titulo: string;
  icono: string;
  definicion: string;
  mecanismo: string;
  ejemplos: string[];
}

// ─────────────────────────────────────────────
// Datos: Tipos de régimen (columnas)
// ─────────────────────────────────────────────

const REGIMENES = [
  { nombre: 'Democracia\nliberal', abrev: 'Dem.\nliberal' },
  { nombre: 'República\nconstitucional', abrev: 'Rep.\nconstit.' },
  { nombre: 'Monarquía\nconstitucional', abrev: 'Mon.\nconstit.' },
  { nombre: 'Autocracia\nelectoral', abrev: 'Autocr.\nelectoral' },
  { nombre: 'Autoritarismo', abrev: 'Autorit.' },
  { nombre: 'Totalitarismo', abrev: 'Totalit.' },
];

// ─────────────────────────────────────────────
// Datos: Características estructurales (filas)
// ─────────────────────────────────────────────

const CARACTERISTICAS = [
  'Elecciones competitivas regulares',
  'Separación de poderes',
  'Independencia judicial',
  'Pluralismo de partidos',
  'Libertad de prensa institucional',
  'Protección de derechos civiles',
  'Alternancia en el poder',
  'Control civil de las fuerzas armadas',
];

// ─────────────────────────────────────────────
// Matriz de valores: 0=presente ✅ 1=parcial ⚠️ 2=ausente ❌
// ─────────────────────────────────────────────

const MATRIZ: number[][] = [
  // DemLib   RepConst  MonConst  AutocrElec  Autorit  Totalit
  [0,        0,        0,         1,          2,       2], // Elecciones competitivas
  [0,        0,        0,         1,          2,       2], // Separación de poderes
  [0,        0,        0,         1,          2,       2], // Independencia judicial
  [0,        0,        0,         1,          1,       2], // Pluralismo de partidos
  [0,        0,        0,         1,          2,       2], // Libertad de prensa
  [0,        0,        0,         1,          2,       2], // Protección derechos civiles
  [0,        0,        0,         1,          2,       2], // Alternancia en el poder
  [0,        0,        0,         1,          1,       2], // Control civil FF.AA.
];

const ICONOS_MATRIZ = ['✅', '⚠️', '❌'];

// ─────────────────────────────────────────────
// Explicaciones de cada celda (característica × régimen)
// ─────────────────────────────────────────────

const EXPLICACIONES: string[][] = [
  // Elecciones competitivas
  [
    'En la democracia liberal las elecciones son la fuente central de legitimidad. Existen garantías institucionales para la competencia libre: pluralismo de candidatos, independencia electoral, secreto del voto y recursos judiciales en caso de fraude.',
    'La república constitucional define en su texto fundamental los procedimientos electorales. Las elecciones son el mecanismo de renovación del poder ejecutivo y legislativo, sujetas a escrutinio judicial y garantías constitucionales.',
    'En la monarquía constitucional el jefe de Estado es hereditario, pero el poder político efectivo se renueva mediante elecciones parlamentarias regulares. La legitimidad democrática reside en el parlamento, no en el monarca.',
    'Las autocracias electorales celebran elecciones periódicas, pero las condiciones de competencia son desiguales: acceso desigual a medios, restricciones a la oposición, o manipulación del padrón. La forma electoral coexiste con ventajas estructurales para el gobernante.',
    'En el autoritarismo clásico las elecciones se suprimen, se sustituyen por plebiscitos sin alternativa real, o se celebran de forma meramente ceremonial. La legitimidad no descansa en el voto sino en otros mecanismos (ideología, represión, eficiencia económica).',
    'El totalitarismo elimina la competencia electoral genuina. Si existen consultas formales, son instrumentos de movilización y ratificación del partido-Estado, no de elección real. La legitimidad se basa en la ideología totalizante.',
  ],
  // Separación de poderes
  [
    'La separación entre ejecutivo, legislativo y judicial es un principio estructural en la democracia liberal (inspirado en Montesquieu). Cada poder actúa como freno y contrapeso de los demás, impidiendo la concentración arbitraria de autoridad.',
    'El republicanismo constitucional es históricamente uno de los mayores promotores de la separación de poderes como garantía antitiránica. La constitución asigna competencias diferenciadas a cada rama y establece mecanismos de control mutuo.',
    'La monarquía constitucional moderna mantiene una separación funcional entre la corona (jefatura del Estado, función simbólica y protocolaria), el gobierno (ejecutivo electo) y el parlamento (legislativo). El monarca no interviene en la dirección política ordinaria.',
    'Las autocracias electorales erosionan la separación formal: el ejecutivo coloniza gradualmente el poder judicial (nombramientos discrecionales) y el legislativo (mayorías cooptadas). La arquitectura institucional persiste, pero los controles reales se debilitan.',
    'El autoritarismo concentra el poder en el ejecutivo o en una junta. El poder judicial y el legislativo quedan subordinados o son puramente consultivos. La separación de poderes, si existe en el texto legal, no opera en la práctica.',
    'El totalitarismo fusiona los poderes en la dirección del partido o del líder. No existe separación institucional real: la misma estructura ideológica domina el ejecutivo, el legislativo, el judicial y también la sociedad civil y la economía.',
  ],
  // Independencia judicial
  [
    'La independencia de los jueces respecto del poder político es condición estructural de la democracia liberal. Se garantiza mediante mandatos fijos, inamovilidad en el cargo, selección por méritos y mecanismos que evitan la presión política sobre las sentencias.',
    'En la república constitucional la independencia judicial se establece como principio en la propia constitución. El poder judicial actúa como árbitro último de la constitucionalidad de las leyes y de los actos del ejecutivo.',
    'La monarquía constitucional cuenta con sistemas judiciales independientes equiparables a los de otras democracias liberales. El monarca no interviene en decisiones judiciales; el rule of law se aplica por igual a todos los ciudadanos e instituciones.',
    'En la autocracia electoral la independencia judicial se erosiona de forma progresiva: nombramiento de jueces afines, presión sobre tribunales constitucionales, o reformas legales que reducen la competencia de los órganos de control. La erosión es gradual, no rupturista.',
    'El autoritarismo subordina la judicatura al poder político. Los tribunales funcionan como instrumentos de control social y represión de la disidencia, no como garantes de derechos. La impunidad del aparato estatal es estructural.',
    'En el totalitarismo el derecho es un instrumento del partido-Estado. Los tribunales aplican la ideología oficial; los procesos políticos son rituales de condena. La independencia judicial no existe como categoría conceptual en el sistema.',
  ],
  // Pluralismo de partidos
  [
    'El pluralismo partidista es un elemento definitorio de la democracia liberal: múltiples partidos compiten libremente por el poder. La ley garantiza el derecho de asociación política y prohíbe la ventaja legal para ningún partido.',
    'La república constitucional garantiza la libre formación de partidos políticos como expresión del pluralismo ideológico. La competencia entre partidos canaliza los conflictos de interés de forma pacífica e institucional.',
    'Las monarquías constitucionales funcionan como democracias parlamentarias en lo que respecta al sistema de partidos: pluripartidismo, coaliciones de gobierno y alternancia entre fuerzas políticas distintas son norma habitual.',
    'Las autocracias electorales permiten formalmente la existencia de partidos de oposición, pero crean condiciones estructurales desiguales: financiación discriminatoria, acceso desigual a medios, hostigamiento judicial. La oposición existe pero opera en condiciones de desventaja.',
    'El autoritarismo restringe o prohíbe los partidos de oposición. Puede haber un partido oficial dominante (partido-Estado) con partidos satélites sin capacidad real de cuestionamiento. La oposición organizada se ilegaliza o tolera de forma muy limitada.',
    'El totalitarismo es estructuralmente monopartidista: un solo partido concentra el poder político, económico y social. La existencia de otros partidos es incompatible con la lógica totalizante del sistema.',
  ],
  // Libertad de prensa
  [
    'La democracia liberal garantiza institucionalmente la libertad de prensa como derecho fundamental. Los medios pueden criticar al gobierno, investigar la corrupción y difundir información sin censura previa. La pluralidad mediática es un contrapeso del poder.',
    'En la república constitucional la libertad de expresión y de prensa se protege como derecho constitucional. Los medios de comunicación operan con independencia editorial del poder político, aunque pueden existir tensiones regulatorias.',
    'Las monarquías constitucionales tienen prensa libre como parte del sistema democrático. La cobertura mediática incluye, como norma, a la familia real y a las instituciones del Estado sin restricciones legales de censura.',
    'Las autocracias electorales ejercen presión sobre los medios sin suprimirlos formalmente: concentración de propiedad mediática en oligarcas afines al poder, presión publicitaria del Estado, procesos judiciales por difamación usados como herramienta de acoso. Coexiste prensa independiente y medios capturados.',
    'El autoritarismo controla o suprime los medios independientes. Puede existir prensa oficial, censura previa o restricciones legales amplias. La crítica al poder no tiene espacio seguro de difusión masiva.',
    'En el totalitarismo los medios de comunicación son un instrumento de propaganda del partido-Estado. No existe prensa independiente; la información es gestionada centralmente para reforzar la ideología oficial y movilizar a la población.',
  ],
  // Protección de derechos civiles
  [
    'La democracia liberal define un conjunto de derechos civiles (libertad, seguridad, igualdad ante la ley, privacidad) que el Estado no puede vulnerar y que los ciudadanos pueden reclamar judicialmente. Estos derechos limitan el poder del Estado sobre los individuos.',
    'La república constitucional recoge una carta de derechos que establece los límites entre el Estado y los ciudadanos. El control de constitucionalidad garantiza que la ley ordinaria no vulnere estos derechos fundamentales.',
    'Las monarquías constitucionales contemporáneas tienen sistemas robustos de protección de derechos civiles, generalmente reforzados por tratados internacionales (como el Convenio Europeo de Derechos Humanos para los países del Consejo de Europa).',
    'En la autocracia electoral la protección formal de derechos coexiste con su vulneración práctica selectiva: los ciudadanos que se oponen al poder tienen mayor riesgo de ver sus derechos restringidos. La protección es asimétrica y no universalmente garantizada.',
    'El autoritarismo vulnera sistemáticamente los derechos civiles de disidentes, minorías o grupos considerados amenazas. La detención arbitraria, la tortura y la desaparición forzada son instrumentos de control político, no excepciones.',
    'El totalitarismo niega estructuralmente los derechos civiles como categoría: el individuo existe en función del colectivo definido por la ideología. No hay esfera privada que el Estado deba respetar; la movilización total penetra todos los aspectos de la vida.',
  ],
  // Alternancia en el poder
  [
    'La alternancia es una prueba empírica de la democracia real: diferentes fuerzas políticas han ocupado el poder en distintos momentos. Sin alternancia histórica, la democracia puede ser formal pero no efectiva. La transferencia pacífica del poder tras elecciones es un criterio definitorio.',
    'La república constitucional garantiza los mecanismos institucionales para la alternancia: límites de mandato, imposibilidad de autoperpetuación, y transferencia regulada del poder. El rechazo a dejar el cargo es considerado un quiebre constitucional.',
    'Las monarquías constitucionales tienen alternancia en los cargos elegidos (primer ministro, gobierno, parlamento). La continuidad del jefe de Estado hereditario no afecta a la alternancia política real, que opera en el ámbito parlamentario y gubernamental.',
    'Las autocracias electorales presentan dificultades estructurales para la alternancia: el incumbente dispone de ventajas institucionales que hacen muy improbable su derrota electoral. La alternancia es formalmente posible pero empíricamente rara o inexistente durante largos períodos.',
    'El autoritarismo elimina la alternancia: quien tiene el poder lo mantiene por medios coercitivos. El relevo solo ocurre por muerte, golpe interno, o colapso del régimen. No existe mecanismo electoral o legal que garantice la transferencia pacífica del poder.',
    'El totalitarismo es estructuralmente incompatible con la alternancia. El líder o el partido es el Estado; su sustitución solo ocurre por muerte o por implosión del sistema. Los mecanismos de sucesión son internos al partido y sin competencia externa.',
  ],
  // Control civil de FF.AA.
  [
    'En la democracia liberal las fuerzas armadas están subordinadas al poder civil electo. Los militares no participan en la política; el gobierno determina la política de defensa y la cadena de mando civil es indiscutible. El control civil es a la vez un principio legal y una práctica consolidada.',
    'La república constitucional establece formalmente el control civil de las fuerzas armadas en su texto constitucional. Los civiles dirigen el ministerio de defensa y aprueban el presupuesto militar. La intervención militar en política es inconstitucional.',
    'Las monarquías constitucionales tienen control civil de las FF.AA. equiparable al de otras democracias. El monarca puede ser comandante en jefe ceremonial, pero las decisiones reales de política de defensa corresponden al gobierno electo.',
    'Las autocracias electorales mantienen formalmente el control civil, pero el poder militar puede ganar influencia informal o actuar como árbitro en momentos de crisis política. El gobierno manipula las lealtades militares mediante ascensos y beneficios.',
    'En muchos regímenes autoritarios las fuerzas armadas son actores políticos con poder propio, o el propio régimen tiene origen castrense. El control civil en el sentido democrático no existe; los militares son pilares del régimen, no instrumentos subordinados.',
    'En el totalitarismo las fuerzas armadas están completamente politizadas e integradas en la estructura del partido-Estado. Los oficiales son miembros del partido; la lealtad ideológica es un requisito de mando. La distinción entre fuerzas armadas y aparato político se difumina.',
  ],
];

// ─────────────────────────────────────────────
// Colores para el espectro y la leyenda
// ─────────────────────────────────────────────

const COLORES_REGIMENES = [
  { color: 'rgba(46, 134, 171, 0.65)', borde: '#2E86AB', nombre: 'Democracia liberal' },
  { color: 'rgba(72, 169, 166, 0.55)', borde: '#48A9A6', nombre: 'República constitucional' },
  { color: 'rgba(127, 179, 211, 0.55)', borde: '#7FB3D3', nombre: 'Monarquía constitucional' },
  { color: 'rgba(240, 180, 40, 0.45)', borde: '#d97706', nombre: 'Autocracia electoral' },
  { color: 'rgba(220, 100, 60, 0.45)', borde: '#dc2626', nombre: 'Autoritarismo' },
  { color: 'rgba(150, 40, 40, 0.5)', borde: '#7f1d1d', nombre: 'Totalitarismo' },
];

// ─────────────────────────────────────────────
// Datos históricos: % población bajo cada tipo (estimaciones académicas)
// Períodos: Antigüedad, Edad Media, s.XVIII, s.XIX, 1900, 1945, 1975, 2000, 2024
// ─────────────────────────────────────────────

const PERIODOS = ['Ant.', 'E.Med.', 'XVIII', 'XIX', '1900', '1945', '1975', '2000', '2024'];

// Filas: [Democracia/Rep.Const., MonConst., AutocrElec., Autoritarismo, Totalitarismo]
// Los valores suman ~100 por columna (estimaciones aproximadas)
const DATOS_HISTORICOS: number[][] = [
  [2, 1, 1, 3, 5, 18, 28, 42, 44], // Democracia liberal + Rep.Const.
  [0, 0, 2, 5, 8, 12, 10, 8, 7],   // Monarquía constitucional
  [0, 0, 1, 4, 6, 6, 8, 14, 18],   // Autocracia electoral
  [50, 60, 72, 65, 62, 38, 36, 28, 22], // Autoritarismo
  [0, 0, 0, 0, 2, 22, 14, 4, 5],   // Totalitarismo (inc. regímenes de partido único cerrados)
  [48, 39, 24, 23, 17, 4, 4, 4, 4], // Otras formas (imperios, feudalismo, teocracias) → sin clasificar
];

const COLORES_HISTORICOS = [
  '#2E86AB',  // Democracia
  '#48A9A6',  // Monarquía const.
  '#f59e0b',  // Autocracia electoral
  '#ef4444',  // Autoritarismo
  '#7f1d1d',  // Totalitarismo
  '#9ca3af',  // No clasificados
];

const ETIQUETAS_HISTORICAS = [
  'Democracia/República',
  'Monarquía const.',
  'Autocracia electoral',
  'Autoritarismo',
  'Totalitarismo',
  'Otras formas',
];

// ─────────────────────────────────────────────
// Datos: Mecanismos de transición
// ─────────────────────────────────────────────

const TRANSICIONES: TransicionTipo[] = [
  {
    titulo: 'Revolución',
    icono: '🔥',
    definicion:
      'Cambio rupturista y rápido del orden político, a menudo con movilización popular masiva y quiebre institucional completo. El régimen anterior no transfiere el poder; es desplazado o destruido.',
    mecanismo:
      'Movilización masiva que desborda las instituciones. Las élites del régimen pierden el control del aparato coercitivo o este se fragmenta. El nuevo poder emerge de la organización revolucionaria.',
    ejemplos: [
      'Revolución Francesa (1789): derrumbe del Antiguo Régimen monárquico-absolutista',
      'Revolución Rusa (1917): caída del Imperio zarista y posterior toma bolchevique',
      'Revolución Cubana (1959): derrota militar del régimen Batista por guerrilla rural',
    ],
  },
  {
    titulo: 'Reforma pactada',
    icono: '🤝',
    definicion:
      'Transición negociada entre élites del régimen saliente y fuerzas de la oposición. Preserva parte del orden institucional. También llamada "transición por transacción" en la ciencia política comparada.',
    mecanismo:
      'Los actores del régimen aceptan ceder poder a cambio de garantías (no persecución, mantenimiento de intereses). La oposición acepta límites a la velocidad del cambio. El resultado es un acuerdo constituyente.',
    ejemplos: [
      'Transición española (1975-1978): de la dictadura franquista a la monarquía parlamentaria',
      'Pacto de la Moncloa (1977): acuerdo económico-político entre fuerzas antagónicas',
      'Mesa de diálogo en Polonia (1989): Acuerdos de la Mesa Redonda que abrieron elecciones',
    ],
  },
  {
    titulo: 'Golpe de Estado',
    icono: '⚔️',
    definicion:
      'Destitución del gobierno por parte de un grupo minoritario (generalmente militar) mediante el uso o amenaza de la fuerza. No requiere movilización popular; es una acción de élites.',
    mecanismo:
      'Una facción del aparato coercitivo (ejército, guardia pretoriana) neutraliza al gobierno. El éxito depende de si las demás fuerzas armadas se suman o permanecen neutrales. Puede instalar un régimen autoritario o abrir una transición.',
    ejemplos: [
      'Golpe de Mussolini (1922): "Marcha sobre Roma" y toma del poder con consentimiento real',
      'Golpe en Chile (1973): derrumbe del gobierno constitucional por junta militar',
      'Golpe de Portugal (1974): "Revolução dos Cravos", abrió una transición democrática',
    ],
  },
  {
    titulo: 'Colapso',
    icono: '🏚️',
    definicion:
      'Implosión del régimen por pérdida de legitimidad, quiebre económico, fraccionamiento interno o derrota militar. No hay transferencia del poder sino vacío institucional seguido de reorganización.',
    mecanismo:
      'El régimen pierde la capacidad de gobernar: el aparato coercitivo se desintegra, las élites abandonan el barco, y la población deja de obedecer. La transición posterior puede ser democrática o caótica.',
    ejemplos: [
      'Caída del Imperio Romano de Occidente (476 d.C.): desintegración gradual, no conquista única',
      'Colapso de la URSS (1991): disolución formal tras años de erosión económica e ideológica',
      'Caída del régimen de Ceaușescu (1989): desbordamiento popular y fractura del aparato',
    ],
  },
  {
    titulo: 'Conquista exterior',
    icono: '🏴',
    definicion:
      'El régimen es desplazado por una potencia extranjera mediante invasión militar. El cambio político es impuesto desde fuera, no generado internamente.',
    mecanismo:
      'La derrota militar elimina al gobierno existente. La potencia vencedora impone o facilita un nuevo orden institucional, que puede reproducir su propio sistema o crear un régimen satélite.',
    ejemplos: [
      'Ocupación aliada de Alemania (1945): desmantelamiento del Tercer Reich y rediseño institucional',
      'Ocupación de Japón (1945): MacArthur supervisa la redacción de una nueva constitución',
      'Invasión soviética de países bálticos (1940): instalación de regímenes satélites comunistas',
    ],
  },
];

// ─────────────────────────────────────────────
// Función: calcular polilíneas para gráfico de área apilada
// ─────────────────────────────────────────────

const calcularAreasApiladas = (
  svgW: number,
  svgH: number,
  paddingLeft: number,
  paddingTop: number,
  paddingBottom: number,
  paddingRight: number,
): { puntos: string; color: string; etiqueta: string }[] => {
  const areaW = svgW - paddingLeft - paddingRight;
  const areaH = svgH - paddingTop - paddingBottom;
  const nCols = PERIODOS.length;
  const nFilas = DATOS_HISTORICOS.length;

  // Calcular acumulados por columna
  const acumulados: number[][] = [];
  for (let col = 0; col < nCols; col++) {
    const acc: number[] = [0];
    for (let fila = 0; fila < nFilas; fila++) {
      acc.push(acc[fila] + DATOS_HISTORICOS[fila][col]);
    }
    acumulados.push(acc);
  }

  const xPos = (col: number) => paddingLeft + (col / (nCols - 1)) * areaW;
  const yPos = (val: number) => paddingTop + areaH - (val / 100) * areaH;

  const areas: { puntos: string; color: string; etiqueta: string }[] = [];

  for (let fila = 0; fila < nFilas; fila++) {
    // Borde superior (izquierda a derecha)
    const superior = Array.from({ length: nCols }, (_, col) =>
      `${xPos(col)},${yPos(acumulados[col][fila + 1])}`
    ).join(' ');
    // Borde inferior (derecha a izquierda)
    const inferior = Array.from({ length: nCols }, (_, col) =>
      `${xPos(nCols - 1 - col)},${yPos(acumulados[nCols - 1 - col][fila])}`
    ).join(' ');

    areas.push({
      puntos: `${superior} ${inferior}`,
      color: COLORES_HISTORICOS[fila],
      etiqueta: ETIQUETAS_HISTORICAS[fila],
    });
  }

  return areas;
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorRegimenesPoliticos() {
  const [celdaActiva, setCeldaActiva] = useState<CeldaSeleccionada | null>(null);

  const toggleCelda = (ri: number, ci: number) => {
    if (celdaActiva && celdaActiva.regimenIndex === ri && celdaActiva.caractIndex === ci) {
      setCeldaActiva(null);
    } else {
      setCeldaActiva({ regimenIndex: ri, caractIndex: ci });
    }
  };

  // Calcular gráfico histórico
  const SVG_W = 620;
  const SVG_H = 260;
  const PAD_L = 36;
  const PAD_T = 16;
  const PAD_B = 32;
  const PAD_R = 12;
  const areas = calcularAreasApiladas(SVG_W, SVG_H, PAD_L, PAD_T, PAD_B, PAD_R);

  const areaW = SVG_W - PAD_L - PAD_R;
  const areaH = SVG_H - PAD_T - PAD_B;
  const xPos = (col: number) => PAD_L + (col / (PERIODOS.length - 1)) * areaW;
  const yPos = (val: number) => PAD_T + areaH - (val / 100) * areaH;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ─── Hero ───────────────────────────────── */}
      <header className={styles.hero}>
        <span className={styles.heroIcono} aria-hidden="true">🏛️</span>
        <h1>Regímenes Políticos</h1>
        <p>
          Tipología estructural y características que definen cada sistema de gobierno según la
          ciencia política académica — enfoque puramente definitorio, sin ranking de países actuales
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="general" severity="medium" collapsible={true} />

      {/* ─── Sección 1: Matriz de características ─── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Matriz de características estructurales</h2>
        <p className={styles.subtituloSeccion}>
          Qué características definen estructuralmente cada tipo de régimen según la ciencia política comparada.
          Pulsa cada celda para ver la explicación académica.
        </p>

        <p className={styles.notaMetodologica}>
          <strong>Enfoque tipológico:</strong> Esta matriz describe tipos ideales en sentido weberiano,
          no clasificaciones de países concretos. Los regímenes reales combinan características de
          distintos tipos y pueden ser objeto de debate legítimo.
        </p>

        <div className={styles.matrizWrapper} role="region" aria-label="Matriz de características de regímenes políticos">
          <table className={styles.matrizTabla}>
            <thead>
              <tr>
                <th scope="col">Característica</th>
                {REGIMENES.map((r, ri) => (
                  <th key={ri} scope="col" style={{ whiteSpace: 'pre-line' }}>
                    {r.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CARACTERISTICAS.map((caract, ci) => (
                <tr key={ci}>
                  <td className={styles.celdaCaracteristica}>{caract}</td>
                  {REGIMENES.map((_, ri) => {
                    const val = MATRIZ[ci][ri];
                    const activa = celdaActiva?.regimenIndex === ri && celdaActiva?.caractIndex === ci;
                    return (
                      <td
                        key={ri}
                        className={styles.celdaValor}
                        onClick={() => toggleCelda(ri, ci)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${caract} en ${REGIMENES[ri].nombre}: ${val === 0 ? 'presente' : val === 1 ? 'parcial' : 'ausente'}. Pulsa para más detalle.`}
                        aria-pressed={activa}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCelda(ri, ci); } }}
                        style={{ outline: activa ? '2px solid #2E86AB' : undefined, borderRadius: 6 }}
                      >
                        <span aria-hidden="true">{ICONOS_MATRIZ[val]}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel de explicación de celda activa */}
        {celdaActiva !== null && (
          <div className={styles.panelCelda} role="region" aria-live="polite">
            <div className={styles.panelCeldaHeader}>
              <span className={styles.panelCeldaRegimen}>
                {REGIMENES[celdaActiva.regimenIndex].nombre.replace('\n', ' ')}
              </span>
              <span className={styles.panelCeldaCaract}>
                — {CARACTERISTICAS[celdaActiva.caractIndex]}
              </span>
            </div>
            <p className={styles.panelCeldaTexto}>
              {EXPLICACIONES[celdaActiva.caractIndex][celdaActiva.regimenIndex]}
            </p>
            <button
              type="button"
              className={styles.btnCerrar}
              onClick={() => setCeldaActiva(null)}
              aria-label="Cerrar explicación"
            >
              Cerrar
            </button>
          </div>
        )}
      </section>

      {/* ─── Sección 2: Espectro de sistemas ─────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Espectro de sistemas: dos ejes estructurales</h2>
        <p className={styles.subtituloSeccion}>
          Los 6 tipos posicionados en los ejes de concentración del poder y fuente de legitimidad.
          Las zonas son difusas porque los regímenes reales son gradaciones, no categorías rígidas.
        </p>

        <div className={styles.svgContainer}>
          <svg
            viewBox="0 0 620 380"
            className={styles.svgEspectro}
            role="img"
            aria-label="Espectro bidimensional de regímenes políticos: concentración del poder vs fuente de legitimidad"
          >
            <defs>
              <radialGradient id="gradDemLib" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(46,134,171,0.55)" />
                <stop offset="100%" stopColor="rgba(46,134,171,0)" />
              </radialGradient>
              <radialGradient id="gradRepConst" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(72,169,166,0.5)" />
                <stop offset="100%" stopColor="rgba(72,169,166,0)" />
              </radialGradient>
              <radialGradient id="gradMonConst" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(127,179,211,0.5)" />
                <stop offset="100%" stopColor="rgba(127,179,211,0)" />
              </radialGradient>
              <radialGradient id="gradAutocr" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(240,180,40,0.5)" />
                <stop offset="100%" stopColor="rgba(240,180,40,0)" />
              </radialGradient>
              <radialGradient id="gradAutorit" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(220,100,60,0.55)" />
                <stop offset="100%" stopColor="rgba(220,100,60,0)" />
              </radialGradient>
              <radialGradient id="gradTotal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(150,40,40,0.6)" />
                <stop offset="100%" stopColor="rgba(150,40,40,0)" />
              </radialGradient>
            </defs>

            {/* Área de fondo */}
            <rect x="60" y="30" width="500" height="300" rx="12" fill="var(--bg-card)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

            {/* Ejes */}
            {/* Eje X: concentración (horizontal) */}
            <line x1="60" y1="180" x2="560" y2="180" stroke="#ccc" strokeWidth="1.5" />
            <text x="60" y="175" fontSize="11" fill="#999" textAnchor="start">← Poder distribuido</text>
            <text x="560" y="175" fontSize="11" fill="#999" textAnchor="end">Poder concentrado →</text>

            {/* Eje Y: legitimidad (vertical) */}
            <line x1="310" y1="30" x2="310" y2="330" stroke="#ccc" strokeWidth="1.5" />
            <text x="312" y="42" fontSize="11" fill="#999" textAnchor="start">Legitimidad electoral ↑</text>
            <text x="312" y="325" fontSize="11" fill="#999" textAnchor="start">↓ Imposición/tradición/ideología</text>

            {/* Zonas difusas para cada tipo */}
            {/* Democracia liberal: distribuido + electoral */}
            <ellipse cx="155" cy="80" rx="90" ry="55" fill="url(#gradDemLib)" />
            <text x="155" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2E86AB">Democracia</text>
            <text x="155" y="80" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2E86AB">liberal</text>

            {/* República constitucional: distribuido-centro + electoral */}
            <ellipse cx="210" cy="100" rx="80" ry="50" fill="url(#gradRepConst)" />
            <text x="270" y="92" textAnchor="start" fontSize="9" fill="#2c7873">República</text>
            <text x="270" y="103" textAnchor="start" fontSize="9" fill="#2c7873">constitucional</text>

            {/* Monarquía constitucional: distribuido-centro + mixto */}
            <ellipse cx="200" cy="145" rx="80" ry="48" fill="url(#gradMonConst)" />
            <text x="82" y="152" textAnchor="start" fontSize="9" fill="#4a7fa5">Monarquía</text>
            <text x="82" y="163" textAnchor="start" fontSize="9" fill="#4a7fa5">constitucional</text>

            {/* Autocracia electoral: centro-concentrado + parcialmente electoral */}
            <ellipse cx="390" cy="130" rx="85" ry="52" fill="url(#gradAutocr)" />
            <text x="390" y="120" textAnchor="middle" fontSize="9" fill="#92400e">Autocracia</text>
            <text x="390" y="131" textAnchor="middle" fontSize="9" fill="#92400e">electoral</text>

            {/* Autoritarismo: concentrado + imposición */}
            <ellipse cx="450" cy="230" rx="80" ry="55" fill="url(#gradAutorit)" />
            <text x="450" y="223" textAnchor="middle" fontSize="9" fill="#991b1b">Autoritarismo</text>

            {/* Totalitarismo: muy concentrado + ideología */}
            <ellipse cx="495" cy="295" rx="68" ry="42" fill="url(#gradTotal)" />
            <text x="495" y="291" textAnchor="middle" fontSize="9" fill="#7f1d1d">Totalitarismo</text>

            {/* Conexión aristotélica */}
            <rect x="62" y="240" width="205" height="78" rx="8" fill="rgba(46,134,171,0.05)" stroke="rgba(46,134,171,0.2)" strokeWidth="1" />
            <text x="70" y="254" fontSize="9" fill="#2E86AB" fontWeight="700">Tipología aristotélica:</text>
            <text x="70" y="266" fontSize="8.5" fill="#666">Monarquía → Aristocracia → Politeia</text>
            <text x="70" y="278" fontSize="8.5" fill="#666">(formas rectas: bien común)</text>
            <text x="70" y="290" fontSize="8.5" fill="#666">Tiranía → Oligarquía → Demagogia</text>
            <text x="70" y="302" fontSize="8.5" fill="#666">(formas desviadas: interés propio)</text>
          </svg>
        </div>

        <div className={styles.leyendaEspectro}>
          {COLORES_REGIMENES.map((c, i) => (
            <div key={i} className={styles.leyendaItem}>
              <div className={styles.leyendaColor} style={{ background: c.color, border: `1.5px solid ${c.borde}` }} />
              <span>{c.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sección 3: Evolución histórica agregada ── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Evolución histórica agregada</h2>
        <p className={styles.subtituloSeccion}>
          Porcentaje estimado de la población mundial bajo distintos tipos de régimen por período histórico.
          Estimaciones académicas aproximadas — los valores concretos varían según metodología y definición.
        </p>

        <div className={styles.graficaWrapper}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className={styles.svgHistorico}
            role="img"
            aria-label="Gráfico de área apilada: evolución histórica de regímenes políticos por porcentaje de población"
          >
            {/* Áreas apiladas */}
            {areas.map((a, i) => (
              <polygon key={i} points={a.puntos} fill={a.color} opacity="0.82" />
            ))}

            {/* Líneas de rejilla horizontales */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <g key={pct}>
                <line
                  x1={PAD_L}
                  y1={yPos(pct)}
                  x2={SVG_W - PAD_R}
                  y2={yPos(pct)}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <text x={PAD_L - 4} y={yPos(pct) + 4} fontSize="8.5" fill="#999" textAnchor="end">
                  {pct}%
                </text>
              </g>
            ))}

            {/* Etiquetas de períodos */}
            {PERIODOS.map((p, i) => (
              <text
                key={i}
                x={xPos(i)}
                y={SVG_H - PAD_B + 14}
                fontSize="8.5"
                fill="#888"
                textAnchor="middle"
              >
                {p}
              </text>
            ))}
          </svg>

          {/* Leyenda del gráfico histórico */}
          <div className={styles.leyendaEspectro}>
            {ETIQUETAS_HISTORICAS.map((etiq, i) => (
              <div key={i} className={styles.leyendaItem}>
                <div className={styles.leyendaColor} style={{ background: COLORES_HISTORICOS[i] }} />
                <span>{etiq}</span>
              </div>
            ))}
          </div>

          <p className={styles.notaGrafica}>
            Estimaciones basadas en ciencia política comparada e historia política (Polity Project histórico,
            Dahl, Lijphart). Los valores son aproximaciones ilustrativas; las metodologías de clasificación
            varían significativamente entre escuelas académicas. «Otras formas» incluye imperios,
            feudalismos, teocracias y sistemas sin equivalente moderno directo.
          </p>
        </div>
      </section>

      {/* ─── Sección 4: Mecanismos de transición ─── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Mecanismos de transición política</h2>
        <p className={styles.subtituloSeccion}>
          Tipos de procesos documentados mediante los cuales un régimen político se transforma en otro,
          con ejemplos de períodos históricos cerrados.
        </p>

        <div className={styles.transicionGrid}>
          {TRANSICIONES.map((t, i) => (
            <div key={i} className={styles.transicionCard}>
              <span className={styles.transicionIcono} aria-hidden="true">{t.icono}</span>
              <h3 className={styles.transicionTitulo}>{t.titulo}</h3>
              <p className={styles.transicionDefinicion}>{t.definicion}</p>
              <div className={styles.transicionMecanismo}>
                <strong>Mecanismo político:</strong>
                {t.mecanismo}
              </div>
              <div className={styles.transicionEjemplos}>
                <strong>Ejemplos históricos:</strong>
                {t.ejemplos.map((ej, j) => (
                  <span key={j} style={{ display: 'block', marginTop: '0.25rem' }}>• {ej}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sección educativa v2.0 ─────────────── */}
      <EducationalSection
        title="Regímenes Políticos: Tipología y Características Estructurales"
        subtitle="Cómo clasifican los sistemas de gobierno la ciencia política y la filosofía política clásica"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h4>La tipología de Aristóteles: el punto de partida</h4>
            <p>
              En la <em>Política</em>, Aristóteles clasifica los regímenes según dos criterios: quién
              gobierna (uno, pocos, muchos) y en beneficio de quién (del bien común o del interés propio).
              Esto genera seis tipos: monarquía, aristocracia y politeia (formas rectas) frente a tiranía,
              oligarquía y demagogia (formas desviadas).
            </p>
            <p>
              Esta tipología sigue siendo el punto de partida de la ciencia política comparada moderna.
              Aunque los regímenes contemporáneos son más complejos, los ejes aristotélicos —concentración
              del poder y orientación hacia el bien común— siguen siendo analíticamente útiles.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>La legitimidad según Max Weber: tres tipos puros</h4>
            <p>
              Weber distingue tres fuentes de legitimidad del poder: <strong>tradicional</strong>
              (costumbre, herencia — monarquías históricas), <strong>carismática</strong>
              (cualidades extraordinarias del líder — muchos autoritarismos y totalitarismos),
              y <strong>racional-legal</strong> (normas y procedimientos — democracias y repúblicas modernas).
            </p>
            <p>
              Los regímenes reales mezclan estos tipos. Una monarquía constitucional combina legitimidad
              tradicional (corona) con racional-legal (parlamento). Una autocracia electoral puede invocar
              legitimidad carismática del líder y legitimidad electoral al mismo tiempo.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>La separación de poderes como criterio estructural (Montesquieu)</h4>
            <p>
              En <em>El espíritu de las leyes</em> (1748), Montesquieu argumenta que la libertad política
              solo es posible cuando el poder ejecutivo, legislativo y judicial están separados y se
              controlan mutuamente. Ningún poder debe concentrarse en las mismas manos.
            </p>
            <p>
              Este principio se convirtió en el criterio estructural más operativo para clasificar regímenes:
              donde la separación funciona en la práctica (no solo en el texto), hay democracia o república;
              donde colapsa, el régimen se desplaza hacia el autoritarismo.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Los regímenes híbridos y la zona gris</h4>
            <p>
              La categoría de "autocracia electoral" (Levitsky y Way, Schedler) describe una zona gris
              entre democracia y autoritarismo: regímenes que conservan la forma electoral como fuente
              de legitimidad, pero erosionan sus condiciones de funcionamiento real.
            </p>
            <p>
              Esta categoría desafía la dicotomía binaria democracia/no-democracia. Los indicadores
              de <em>democratic backsliding</em> (retroceso democrático) buscan medir cuándo un régimen
              con forma democrática está evolucionando estructuralmente hacia la autocracia.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Por qué las definiciones varían según la tradición académica</h4>
            <p>
              El republicanismo clásico enfatiza la no-dominación (Pettit) y la participación cívica
              como criterios. El liberalismo político insiste en los derechos individuales y el estado
              de derecho. La teoría democrática procedimental (Schumpeter, Dahl) centra el análisis en
              la competencia electoral y la poliarquía. La teoría deliberativa (Habermas) añade la
              calidad del debate público.
            </p>
            <p>
              Cada tradición produce definiciones diferentes, lo que explica por qué la clasificación
              de un régimen concreto puede ser objeto de debate académico legítimo.
            </p>
          </div>

          <div className={styles.enlaceCurso}>
            <p>
              Esta app es una visualización complementaria al curso de Teoría Política de meskeIA,
              que cubre la evolución histórica del pensamiento político: Platón, Aristóteles, Maquiavelo,
              Hobbes, Locke, Montesquieu, Rousseau, Marx y Rawls.
            </p>
            <a href="/curso-teoria-politica" aria-label="Ir al Curso de Teoría Política">
              Ver Curso de Teoría Política →
            </a>
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          La clasificación de regímenes políticos es un campo académico con múltiples escuelas y criterios.
          Las tipologías presentadas aquí son marcos conceptuales de la ciencia política, no juicios sobre
          estados específicos. Cualquier clasificación de un país concreto depende de la definición empleada
          y puede ser objeto de debate legítimo. Esta app es un recurso educativo, no un índice político
          ni una evaluación de gobiernos actuales.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-regimenes-politicos')} />
      <ShareCard appName="visualizador-regimenes-politicos" />
      <Footer appName="visualizador-regimenes-politicos" />
    </div>
  );
}
