'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizBiologiaMolecular.module.css';

// ============================================================================
// TIPOS
// ============================================================================

type Categoria = 'adn-arn' | 'replicacion' | 'transcripcion' | 'traduccion' | 'mutaciones';
type Modo = 'examen' | 'practica';
type EstadoQuiz = 'inicio' | 'jugando' | 'respondida' | 'fin';

interface Pregunta {
  id: number;
  categoria: Categoria;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

interface ResultadoCategoria {
  categoria: Categoria;
  correctas: number;
  total: number;
}

// ============================================================================
// DATOS: ETIQUETAS DE CATEGORÍAS
// ============================================================================

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  'adn-arn': '🧬 ADN y ARN',
  'replicacion': '🔄 Replicación',
  'transcripcion': '📋 Transcripción',
  'traduccion': '🔤 Traducción',
  'mutaciones': '⚠️ Mutaciones',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  'adn-arn': '#2E86AB',
  'replicacion': '#48A9A6',
  'transcripcion': '#5BA05A',
  'traduccion': '#C47D2A',
  'mutaciones': '#C0392B',
};

// ============================================================================
// DATOS: 30 PREGUNTAS
// ============================================================================

const PREGUNTAS: Pregunta[] = [
  // ---- ADN y ARN (6) ----
  {
    id: 1,
    categoria: 'adn-arn',
    pregunta: '¿Qué tipo de enlace une los nucleótidos en una cadena de ADN?',
    opciones: [
      'Enlace peptídico',
      'Enlace fosfodiéster',
      'Enlace glucosídico',
      'Puente de hidrógeno',
    ],
    correcta: 1,
    explicacion:
      'Los nucleótidos se unen mediante enlaces fosfodiéster entre el grupo 3\'-OH de un azúcar y el grupo 5\'-fosfato del siguiente. Los puentes de hidrógeno unen las dos hebras entre sí, pero no los nucleótidos de una misma cadena.',
  },
  {
    id: 2,
    categoria: 'adn-arn',
    pregunta: '¿Cuántos puentes de hidrógeno unen el par de bases G-C?',
    opciones: ['1', '2', '3', '4'],
    correcta: 2,
    explicacion:
      'G-C forma 3 puentes de hidrógeno, mientras que A-T solo forma 2. Por eso el ADN rico en G-C es más estable térmicamente (mayor temperatura de desnaturalización).',
  },
  {
    id: 3,
    categoria: 'adn-arn',
    pregunta: '¿Qué diferencia estructural tiene el ARN respecto al ADN?',
    opciones: [
      'El ARN usa adenina en lugar de timina',
      'El ARN contiene ribosa y uracilo en vez de desoxirribosa y timina',
      'El ARN es bicatenario',
      'El ARN tiene bases nitrogenadas distintas',
    ],
    correcta: 1,
    explicacion:
      'El ARN tiene ribosa (con OH en el C2\'), mientras que el ADN tiene desoxirribosa (sin ese OH). Además, el ARN usa uracilo (U) donde el ADN usa timina (T).',
  },
  {
    id: 4,
    categoria: 'adn-arn',
    pregunta: '¿Qué tipo de ARN transporta los aminoácidos al ribosoma?',
    opciones: ['ARNm', 'ARNr', 'ARNt', 'ARNhn'],
    correcta: 2,
    explicacion:
      'El ARNt (ARN de transferencia) tiene una estructura en trébol. Lleva el aminoácido en su extremo 3\' y reconoce el codón del ARNm mediante su anticodón.',
  },
  {
    id: 5,
    categoria: 'adn-arn',
    pregunta: '¿Cuál es la dirección de síntesis de una cadena de ADN?',
    opciones: [
      '3\' → 5\'',
      '5\' → 3\'',
      'Bidireccional en la misma hebra',
      'Desde el centrómero hacia los telómeros',
    ],
    correcta: 1,
    explicacion:
      'La ADN polimerasa solo puede añadir nucleótidos al extremo 3\'-OH libre, por lo que la síntesis siempre es 5\' → 3\'. La hebra retardada se sintetiza en fragmentos de Okazaki para mantener esta dirección.',
  },
  {
    id: 6,
    categoria: 'adn-arn',
    pregunta: '¿Qué enzima sintetiza ARN a partir de un molde de ADN?',
    opciones: ['ADN polimerasa', 'Ligasa', 'ARN polimerasa', 'Helicasa'],
    correcta: 2,
    explicacion:
      'La ARN polimerasa no necesita cebador (a diferencia de la ADN polimerasa) y sintetiza el ARN en dirección 5\' → 3\' leyendo la plantilla en dirección 3\' → 5\'.',
  },

  // ---- Replicación (6) ----
  {
    id: 7,
    categoria: 'replicacion',
    pregunta: '¿Cómo es la replicación del ADN?',
    opciones: ['Conservativa', 'Dispersiva', 'Semiconservativa', 'Asimétrica'],
    correcta: 2,
    explicacion:
      'En la replicación semiconservativa, cada molécula hija conserva una hebra parental y sintetiza una nueva. Demostrado por Meselson y Stahl (1958) usando isótopos de nitrógeno (¹⁴N y ¹⁵N).',
  },
  {
    id: 8,
    categoria: 'replicacion',
    pregunta: '¿Qué enzima rompe los puentes de hidrógeno entre las hebras en la replicación?',
    opciones: ['Primasa', 'ADN polimerasa III', 'Topoisomerasa', 'Helicasa'],
    correcta: 3,
    explicacion:
      'La helicasa desenvuelve la doble hélice rompiendo los puentes de hidrógeno. Actúa en la horquilla de replicación, moviéndose 5\' → 3\' a lo largo de la hebra.',
  },
  {
    id: 9,
    categoria: 'replicacion',
    pregunta: '¿Por qué se necesita un cebador (primer) en la replicación del ADN?',
    opciones: [
      'Para marcar el origen de replicación',
      'Para unir fragmentos de Okazaki',
      'Porque la ADN polimerasa no puede iniciar una cadena nueva sin extremo 3\'-OH libre',
      'Para estabilizar la horquilla de replicación',
    ],
    correcta: 2,
    explicacion:
      'La ADN polimerasa solo extiende cadenas existentes. La primasa (ARN polimerasa especial) sintetiza un cebador de ARN de ~10 nt que proporciona el 3\'-OH necesario.',
  },
  {
    id: 10,
    categoria: 'replicacion',
    pregunta: '¿Qué son los fragmentos de Okazaki?',
    opciones: [
      'Errores de replicación que se reparan',
      'Secuencias repetidas en los telómeros',
      'Fragmentos cortos sintetizados en la hebra retardada',
      'Los cebadores de ARN antes de ser eliminados',
    ],
    correcta: 2,
    explicacion:
      'La hebra retardada se sintetiza en dirección opuesta a la horquilla, por lo que debe hacerse en fragmentos discontinuos (Okazaki) de 100-200 nt en eucariotas.',
  },
  {
    id: 11,
    categoria: 'replicacion',
    pregunta: '¿Qué enzima une los fragmentos de Okazaki?',
    opciones: ['Helicasa', 'Primasa', 'Topoisomerasa', 'ADN ligasa'],
    correcta: 3,
    explicacion:
      'La ligasa une el extremo 3\'-OH de un fragmento con el 5\'-fosfato del siguiente mediante un enlace fosfodiéster, usando ATP (eucariotas) o NAD⁺ (procariotas) como cofactor.',
  },
  {
    id: 12,
    categoria: 'replicacion',
    pregunta: '¿Qué problema resuelve la telomerasa?',
    opciones: [
      'Errores de incorporación de bases',
      'Superenrollamiento del ADN',
      'El acortamiento de los telómeros en cada replicación',
      'La unión de fragmentos de Okazaki',
    ],
    correcta: 2,
    explicacion:
      'Cada ciclo de replicación acorta ligeramente los extremos cromosomales (telómeros). La telomerasa (activa en células germinales y muchas células cancerosas) los alarga usando su propio ARN como plantilla.',
  },

  // ---- Transcripción (6) ----
  {
    id: 13,
    categoria: 'transcripcion',
    pregunta: '¿Cuál de estas afirmaciones sobre la transcripción es correcta?',
    opciones: [
      'Ocurre en el citoplasma en eucariotas',
      'Produce ADN a partir de ARN',
      'La hebra molde se lee en dirección 3\' → 5\'',
      'No requiere enzimas',
    ],
    correcta: 2,
    explicacion:
      'La ARN polimerasa lee la hebra molde (template) en dirección 3\' → 5\' y sintetiza el ARNm en dirección 5\' → 3\', incorporando ribonucleótidos complementarios.',
  },
  {
    id: 14,
    categoria: 'transcripcion',
    pregunta: '¿Qué es el promotor en la transcripción?',
    opciones: [
      'La secuencia que señala el final de la transcripción',
      'La enzima que inicia la síntesis',
      'La secuencia de ADN a la que se une la ARN polimerasa para iniciar la transcripción',
      'El extremo 5\' del ARNm maduro',
    ],
    correcta: 2,
    explicacion:
      'En eucariotas, los promotores contienen la caja TATA (~-30 respecto al inicio) y otros elementos. Los factores de transcripción generales se unen al promotor y reclutan a la ARN polimerasa II.',
  },
  {
    id: 15,
    categoria: 'transcripcion',
    pregunta: '¿Qué modificación protege el extremo 5\' del ARNm maduro en eucariotas?',
    opciones: [
      'Cola poli-A',
      'Intrones eliminados',
      'Caperuza 7-metilguanosina (cap 5\')',
      'Señal de poliadenilación',
    ],
    correcta: 2,
    explicacion:
      'El cap 5\' (7mG) se añade cototranscripcionalmente. Protege el ARNm de la degradación, facilita el transporte al citoplasma y es reconocido por el complejo de iniciación de la traducción (eIF4E).',
  },
  {
    id: 16,
    categoria: 'transcripcion',
    pregunta: '¿Qué proceso elimina los intrones del pre-ARNm?',
    opciones: [
      'Poliadenilación',
      'Metilación',
      'Splicing (corte y empalme)',
      'Edición de ARN',
    ],
    correcta: 2,
    explicacion:
      'El splicing lo realiza el espliceosoma, un complejo de snRNPs. Los sitios de corte son conservados: GU al inicio del intrón y AG al final (regla GU-AG). El splicing alternativo permite generar múltiples proteínas desde un solo gen.',
  },
  {
    id: 17,
    categoria: 'transcripcion',
    pregunta: '¿Qué es el splicing alternativo?',
    opciones: [
      'Errores en la eliminación de intrones',
      'La transcripción en dirección inversa',
      'La edición de bases A→I en el ARN',
      'El proceso por el que diferentes combinaciones de exones generan distintas proteínas desde un mismo gen',
    ],
    correcta: 3,
    explicacion:
      'El splicing alternativo multiplica enormemente el proteoma: el gen DSCAM de Drosophila puede generar >38.000 proteínas distintas. En humanos, ~95% de genes multi-exónicos sufren splicing alternativo.',
  },
  {
    id: 18,
    categoria: 'transcripcion',
    pregunta: '¿Qué función tiene la cola poli-A en el ARNm?',
    opciones: [
      'Facilita el inicio de la traducción',
      'Marca el ARNm para degradación inmediata',
      'Protege el ARNm de la degradación y facilita su exportación al citoplasma',
      'Señala el codón de inicio',
    ],
    correcta: 2,
    explicacion:
      'La poliadenilación (adición de 150-250 adeninas al extremo 3\') prolonga la vida media del ARNm y es necesaria para la exportación nuclear. La PABP (proteína de unión a poli-A) interactúa con factores de iniciación.',
  },

  // ---- Traducción (6) ----
  {
    id: 19,
    categoria: 'traduccion',
    pregunta: '¿Cuántas bases forman un codón?',
    opciones: ['1', '2', '3', '4'],
    correcta: 2,
    explicacion:
      'Con 3 bases y 4 posibilidades por posición, hay 4³ = 64 codones posibles para codificar 20 aminoácidos. El código es degenerado (varios codones para el mismo aminoácido) pero no ambiguo (un codón solo codifica un aminoácido).',
  },
  {
    id: 20,
    categoria: 'traduccion',
    pregunta: '¿Cuál es el codón de inicio de la traducción?',
    opciones: ['UAA', 'UAG', 'UGA', 'AUG'],
    correcta: 3,
    explicacion:
      'AUG codifica metionina y señala el inicio de la traducción. En eucariotas, el ribosoma escanea desde el cap 5\' hasta el primer AUG en buen contexto Kozak. En procariotas, el ribosoma se une directamente a la secuencia Shine-Dalgarno cerca del AUG.',
  },
  {
    id: 21,
    categoria: 'traduccion',
    pregunta: '¿Cuántos codones de parada (stop) existen en el código genético estándar?',
    opciones: ['1', '2', '3', '4'],
    correcta: 2,
    explicacion:
      'Los 3 codones de parada son UAA ("ámbar"), UAG ("ocre") y UGA ("ópalo"). No codifican ningún aminoácido convencional. Son reconocidos por factores de liberación (eRF1 en eucariotas) que desencadenan la disociación del ribosoma.',
  },
  {
    id: 22,
    categoria: 'traduccion',
    pregunta: '¿Dónde ocurre la traducción en eucariotas?',
    opciones: [
      'Núcleo',
      'Mitocondria exclusivamente',
      'Nucleolo',
      'Citoplasma (ribosomas libres o unidos al RE rugoso)',
    ],
    correcta: 3,
    explicacion:
      'Las proteínas secretadas o de membrana se traducen en ribosomas del RE rugoso. Las proteínas citoplasmáticas se traducen en ribosomas libres. Las proteínas mitocondriales se traducen en los ribosomas mitocondriales (similares a bacterianos).',
  },
  {
    id: 23,
    categoria: 'traduccion',
    pregunta: '¿Qué es el sitio A del ribosoma?',
    opciones: [
      'El sitio donde sale el polipéptido',
      'El sitio donde se une el ARNm',
      'El sitio de aminoacil: donde entra el nuevo ARNt cargado',
      'El sitio de salida del ARNt descargado',
    ],
    correcta: 2,
    explicacion:
      'El ribosoma tiene 3 sitios: A (aminoacil, entrada del ARNt cargado), P (peptidil, donde está la cadena peptídica en crecimiento) y E (salida del ARNt descargado).',
  },
  {
    id: 24,
    categoria: 'traduccion',
    pregunta: '¿Qué enzima cataliza la formación del enlace peptídico?',
    opciones: [
      'ARN polimerasa',
      'Aminoacil-ARNt sintetasa',
      'Factor de elongación',
      'La peptidiltransferasa (actividad del ARNr 23S/28S)',
    ],
    correcta: 3,
    explicacion:
      'La peptidiltransferasa es una ribozima: su actividad catalítica reside en el ARN ribosomal (ARNr 23S en procariotas, 28S en eucariotas), no en las proteínas ribosomales. Descubrimiento clave para la hipótesis del "mundo de ARN".',
  },

  // ---- Mutaciones (6) ----
  {
    id: 25,
    categoria: 'mutaciones',
    pregunta: '¿Qué tipo de mutación cambia un codón que codifica un aminoácido por un codón de parada?',
    opciones: [
      'Mutación silenciosa',
      'Mutación de cambio de sentido',
      'Mutación sin sentido (nonsense)',
      'Mutación de cambio de marco',
    ],
    correcta: 2,
    explicacion:
      'Las mutaciones nonsense (sin sentido) truncan la proteína prematuramente al crear un codón stop. Son generalmente las más graves. El NMD (nonsense-mediated decay) degrada los ARNm con codones stop prematuros.',
  },
  {
    id: 26,
    categoria: 'mutaciones',
    pregunta: '¿Qué es una mutación sinónima (silenciosa)?',
    opciones: [
      'Una mutación que no cambia ninguna base',
      'Una mutación en una región no codificante',
      'Una mutación que cambia una base pero no cambia el aminoácido por degeneración del código',
      'Una mutación revertida por reparación',
    ],
    correcta: 2,
    explicacion:
      'Gracias a la degeneración del código genético, cambios en la tercera posición del codón (posición "tambaleo") frecuentemente no alteran el aminoácido. No siempre son neutras: pueden afectar el splicing o la velocidad de traducción.',
  },
  {
    id: 27,
    categoria: 'mutaciones',
    pregunta: '¿Qué mecanismo repara los daños causados por la radiación UV (dímeros de timina)?',
    opciones: [
      'Reparación por escisión de bases (BER)',
      'Recombinación homóloga',
      'Reparación por escisión de nucleótidos (NER)',
      'Reparación por apareamiento de bases mal emparejadas (MMR)',
    ],
    correcta: 2,
    explicacion:
      'La UV crea fotoproductos (dímeros ciclobutánicos de pirimidina). El NER los elimina escindiendo un fragmento de ~25-30 nt alrededor del daño. Mutaciones en genes NER causan xeroderma pigmentoso (fotosensibilidad extrema).',
  },
  {
    id: 28,
    categoria: 'mutaciones',
    pregunta: '¿Qué consecuencia tiene una inserción de 1 base en la región codificante?',
    opciones: [
      'Cambio de un aminoácido',
      'Truncamiento de la proteína',
      'Ningún efecto si es en posición 3 del codón',
      'Cambio de marco de lectura que altera todos los aminoácidos downstream',
    ],
    correcta: 3,
    explicacion:
      'Las inserciones/deleciones de bases que no sean múltiplos de 3 producen un frameshift: se desplaza el marco de lectura y todos los codones siguientes cambian. Suelen producir una proteína aberrante o un codón stop prematuro.',
  },
  {
    id: 29,
    categoria: 'mutaciones',
    pregunta: '¿Qué es una mutación de ganancia de función?',
    opciones: [
      'Una mutación que restaura el fenotipo salvaje',
      'Una mutación que inactiva un gen supresor de tumores',
      'Una mutación que hace que una proteína sea más activa, activa en condiciones erróneas o adquiera nueva función',
      'Una mutación que duplica un cromosoma entero',
    ],
    correcta: 2,
    explicacion:
      'Los oncogenes RAS con mutación de ganancia de función están activos constitutivamente (señalizan siempre "crecer" aunque no haya señal). Son dominantes: basta con una copia mutada para producir el fenotipo.',
  },
  {
    id: 30,
    categoria: 'mutaciones',
    pregunta: '¿Cuál es la base molecular de la anemia de células falciformes?',
    opciones: [
      'Deleción del gen de la beta-globina',
      'Mutación sin sentido en el codón 6',
      'Expansión de tripletes en el gen de la globina',
      'Mutación de cambio de sentido: Glu→Val en la posición 6 de la beta-globina',
    ],
    correcta: 3,
    explicacion:
      'Un cambio A→T en el codón 6 (GAG→GTG) convierte glutámico (hidrofílico) en valina (hidrofóbico). Esto provoca agregación de hemoglobina en condiciones de baja O₂, deformando los eritrocitos en forma de hoz. Es el ejemplo clásico de mutación puntual con efecto clínico grave.',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const CATEGORIAS_ORDEN: Categoria[] = [
  'adn-arn',
  'replicacion',
  'transcripcion',
  'traduccion',
  'mutaciones',
];

function mezclarArray<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function obtenerClasificacion(pct: number): { texto: string; emoji: string } {
  if (pct === 100) return { texto: '¡Perfecto!', emoji: '🏆' };
  if (pct >= 80) return { texto: 'Sobresaliente', emoji: '🌟' };
  if (pct >= 60) return { texto: 'Notable', emoji: '👍' };
  if (pct >= 40) return { texto: 'Aprobado', emoji: '😊' };
  return { texto: 'Insuficiente', emoji: '😟' };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function QuizBiologiaMolecularPage() {
  const [estado, setEstado] = useState<EstadoQuiz>('inicio');
  const [modo, setModo] = useState<Modo>('examen');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria>('adn-arn');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [racha, setRacha] = useState(0);
  const [rachaMax, setRachaMax] = useState(0);
  const [rachaActual, setRachaActual] = useState(0);

  const preguntaActual = preguntas[indice];
  const totalPreguntas = preguntas.length;
  const aciertos = resultados.filter(Boolean).length;

  const iniciarQuiz = useCallback(() => {
    let seleccionadas: Pregunta[];
    if (modo === 'examen') {
      seleccionadas = mezclarArray(PREGUNTAS);
    } else {
      seleccionadas = mezclarArray(
        PREGUNTAS.filter((p) => p.categoria === categoriaSeleccionada)
      );
    }
    setPreguntas(seleccionadas);
    setIndice(0);
    setRespuesta(null);
    setResultados([]);
    setRacha(0);
    setRachaMax(0);
    setRachaActual(0);
    setEstado('jugando');
  }, [modo, categoriaSeleccionada]);

  const responder = useCallback(
    (idx: number) => {
      if (estado !== 'jugando' || respuesta !== null) return;
      const esCorrecto = idx === preguntaActual.correcta;
      setRespuesta(idx);
      setResultados((prev) => [...prev, esCorrecto]);
      setEstado('respondida');

      if (esCorrecto) {
        const nuevaRacha = rachaActual + 1;
        setRachaActual(nuevaRacha);
        setRachaMax((prev) => Math.max(prev, nuevaRacha));
        setRacha(nuevaRacha);
      } else {
        setRachaActual(0);
        setRacha(0);
      }
    },
    [estado, respuesta, preguntaActual, rachaActual]
  );

  const siguiente = useCallback(() => {
    if (indice + 1 >= totalPreguntas) {
      setEstado('fin');
    } else {
      setIndice((p) => p + 1);
      setRespuesta(null);
      setEstado('jugando');
    }
  }, [indice, totalPreguntas]);

  const reiniciar = useCallback(() => {
    setEstado('inicio');
    setPreguntas([]);
    setIndice(0);
    setRespuesta(null);
    setResultados([]);
    setRacha(0);
    setRachaMax(0);
    setRachaActual(0);
  }, []);

  // Desglose por categoría para resultados
  const desgloseCategorias: ResultadoCategoria[] = CATEGORIAS_ORDEN.map((cat) => {
    const pregsCat = preguntas
      .map((p, i) => ({ pregunta: p, resultado: resultados[i] ?? false }))
      .filter(({ pregunta }) => pregunta.categoria === cat);
    return {
      categoria: cat,
      correctas: pregsCat.filter(({ resultado }) => resultado).length,
      total: pregsCat.length,
    };
  }).filter((d) => d.total > 0);

  const porcentaje = totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 0;
  const clasificacion = obtenerClasificacion(porcentaje);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🧬 Quiz Biología Molecular</h1>
        <p className={styles.heroSubtitle}>
          30 preguntas sobre ADN, ARN, replicación, transcripción, traducción y mutaciones
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ===== PANTALLA INICIO ===== */}
        {estado === 'inicio' && (
          <div className={styles.inicio}>
            <div className={styles.inicioCard}>
              <div className={styles.inicioEmoji}>🔬</div>
              <h2 className={styles.inicioTitulo}>¿Dominas la biología molecular?</h2>
              <p className={styles.inicioDesc}>
                Pon a prueba tus conocimientos sobre el dogma central: ADN → ARN → proteína.
                30 preguntas en 5 categorías con explicaciones detalladas.
              </p>

              {/* Selector de modo */}
              <div className={styles.modoSelector}>
                <button
                  className={`${styles.modoBtn} ${modo === 'examen' ? styles.modoBtnActivo : ''}`}
                  onClick={() => setModo('examen')}
                >
                  <span className={styles.modoBtnIcon}>📝</span>
                  <span className={styles.modoBtnLabel}>Examen completo</span>
                  <span className={styles.modoBtnSub}>30 preguntas</span>
                </button>
                <button
                  className={`${styles.modoBtn} ${modo === 'practica' ? styles.modoBtnActivo : ''}`}
                  onClick={() => setModo('practica')}
                >
                  <span className={styles.modoBtnIcon}>🎯</span>
                  <span className={styles.modoBtnLabel}>Práctica por categoría</span>
                  <span className={styles.modoBtnSub}>6 preguntas</span>
                </button>
              </div>

              {/* Selector de categoría (modo práctica) */}
              {modo === 'practica' && (
                <div className={styles.categoriaSelector}>
                  <p className={styles.categoriaSelectorLabel}>Elige la categoría:</p>
                  <div className={styles.categoriaBtns}>
                    {CATEGORIAS_ORDEN.map((cat) => (
                      <button
                        key={cat}
                        className={`${styles.categoriaBtn} ${categoriaSeleccionada === cat ? styles.categoriaBtnActiva : ''}`}
                        style={
                          categoriaSeleccionada === cat
                            ? { borderColor: COLORES_CATEGORIA[cat], background: `${COLORES_CATEGORIA[cat]}18` }
                            : {}
                        }
                        onClick={() => setCategoriaSeleccionada(cat)}
                      >
                        {ETIQUETAS_CATEGORIA[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges de categorías (modo examen) */}
              {modo === 'examen' && (
                <div className={styles.categoriasBadges}>
                  {CATEGORIAS_ORDEN.map((cat) => (
                    <span key={cat} className={styles.badge}>
                      {ETIQUETAS_CATEGORIA[cat]}
                    </span>
                  ))}
                </div>
              )}

              <button className={styles.btnPrimario} onClick={iniciarQuiz}>
                Comenzar quiz →
              </button>
            </div>
          </div>
        )}

        {/* ===== PANTALLA PREGUNTA ===== */}
        {(estado === 'jugando' || estado === 'respondida') && preguntaActual && (
          <div className={styles.quizArea}>
            {/* Progreso */}
            <div className={styles.progreso}>
              <div className={styles.progresoInfo}>
                <span>Pregunta {indice + 1} de {totalPreguntas}</span>
                <div className={styles.progresoStats}>
                  {rachaActual >= 2 && (
                    <span className={styles.rachaBadge}>
                      🔥 Racha: {rachaActual}
                    </span>
                  )}
                  <span className={styles.aciertosBadge}>
                    ✓ {aciertos} aciertos
                  </span>
                </div>
              </div>
              <div className={styles.barraProgreso}>
                <div
                  className={styles.barraRelleno}
                  style={{ width: `${((indice) / totalPreguntas) * 100}%` }}
                />
              </div>
            </div>

            {/* Tarjeta de pregunta */}
            <div className={styles.preguntaCard}>
              <span
                className={styles.categoriaBadge}
                style={{ color: COLORES_CATEGORIA[preguntaActual.categoria], borderColor: `${COLORES_CATEGORIA[preguntaActual.categoria]}40`, background: `${COLORES_CATEGORIA[preguntaActual.categoria]}12` }}
              >
                {ETIQUETAS_CATEGORIA[preguntaActual.categoria]}
              </span>

              <p className={styles.preguntaTexto}>{preguntaActual.pregunta}</p>

              <div className={styles.opcionesGrid}>
                {preguntaActual.opciones.map((opcion, i) => {
                  let claseExtra = '';
                  if (estado === 'respondida') {
                    if (i === preguntaActual.correcta) claseExtra = styles.opcionCorrecta;
                    else if (i === respuesta) claseExtra = styles.opcionIncorrecta;
                    else claseExtra = styles.opcionApagada;
                  }
                  return (
                    <button
                      key={i}
                      className={`${styles.opcion} ${claseExtra}`}
                      onClick={() => responder(i)}
                      disabled={estado === 'respondida'}
                      aria-label={`Opción ${['A', 'B', 'C', 'D'][i]}: ${opcion}`}
                    >
                      <span className={styles.opcionLetra}>{['A', 'B', 'C', 'D'][i]}</span>
                      <span>{opcion}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {estado === 'respondida' && (
                <div
                  className={`${styles.feedback} ${respuesta === preguntaActual.correcta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                  role="alert"
                  aria-live="polite"
                >
                  <p className={styles.feedbackResultado}>
                    {respuesta === preguntaActual.correcta ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                  </p>
                  <p className={styles.explicacion}>{preguntaActual.explicacion}</p>
                  <button className={styles.btnSiguiente} onClick={siguiente}>
                    {indice + 1 >= totalPreguntas ? 'Ver resultados →' : 'Siguiente pregunta →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PANTALLA RESULTADO ===== */}
        {estado === 'fin' && (
          <div className={styles.resultado}>
            <div className={styles.resultadoCard}>
              <div className={styles.puntuacionCirculo}>
                <span className={styles.puntuacionNumero}>{aciertos}</span>
                <span className={styles.puntuacionTotal}>/{totalPreguntas}</span>
              </div>

              <div className={styles.clasificacion}>
                <span className={styles.clasificacionEmoji}>{clasificacion.emoji}</span>
                <p className={styles.clasificacionTexto}>{clasificacion.texto}</p>
                <p className={styles.clasificacionPct}>{porcentaje}%</p>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{aciertos}</span>
                  <span className={styles.statLabel}>Aciertos</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{totalPreguntas - aciertos}</span>
                  <span className={styles.statLabel}>Errores</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{rachaMax}</span>
                  <span className={styles.statLabel}>Racha máx.</span>
                </div>
              </div>

              {/* Desglose por categoría */}
              <div className={styles.desgloseSection}>
                <h3 className={styles.desgloseTitulo}>Desglose por categoría</h3>
                <div className={styles.desgloseGrid}>
                  {desgloseCategorias.map((d) => {
                    const pct = d.total > 0 ? Math.round((d.correctas / d.total) * 100) : 0;
                    return (
                      <div key={d.categoria} className={styles.desgloseItem}>
                        <div className={styles.desgloseHeader}>
                          <span className={styles.desgloseCat}>{ETIQUETAS_CATEGORIA[d.categoria]}</span>
                          <span className={styles.desgloseScore}>{d.correctas}/{d.total}</span>
                        </div>
                        <div className={styles.desgloseBarra}>
                          <div
                            className={styles.desgloseBarraRelleno}
                            style={{ width: `${pct}%`, background: COLORES_CATEGORIA[d.categoria] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className={styles.btnPrimario} onClick={reiniciar}>
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sección educativa básica */}
      <EducationalSection
        title="Biología Molecular: conceptos clave"
        subtitle="Transcripción vs traducción, datos curiosos y nota de uso"
      >
        <section className={styles.eduSection}>
          <h3>Transcripción vs Traducción</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Transcripción</th>
                  <th>Traducción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lugar (eucariotas)</strong></td>
                  <td>Núcleo</td>
                  <td>Citoplasma / RE rugoso</td>
                </tr>
                <tr>
                  <td><strong>Enzima principal</strong></td>
                  <td>ARN polimerasa</td>
                  <td>Ribosoma (peptidiltransferasa)</td>
                </tr>
                <tr>
                  <td><strong>Producto</strong></td>
                  <td>ARNm (pre-ARNm → ARNm maduro)</td>
                  <td>Cadena polipeptídica</td>
                </tr>
                <tr>
                  <td><strong>Dirección síntesis</strong></td>
                  <td>5\' → 3\' (ARNm)</td>
                  <td>N-terminal → C-terminal</td>
                </tr>
                <tr>
                  <td><strong>Molde</strong></td>
                  <td>Hebra molde del ADN (3\' → 5\')</td>
                  <td>ARNm (5\' → 3\')</td>
                </tr>
                <tr>
                  <td><strong>Monómeros</strong></td>
                  <td>Ribonucleótidos (A, U, G, C)</td>
                  <td>Aminoácidos (20 canónicos)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Datos curiosos</h3>
          <ul className={styles.datosCuriosos}>
            <li>
              <strong>La peptidiltransferasa es una ribozima</strong>: el ribosoma cataliza la formación
              del enlace peptídico gracias al ARN ribosomal, no a las proteínas. Es evidencia del "mundo de ARN"
              primitivo, donde el ARN actuaba como enzima antes de que existieran las proteínas.
            </li>
            <li>
              <strong>Splicing alternativo en humanos</strong>: ~95% de los genes humanos con más de un exón
              se procesan de forma alternativa. Un solo gen puede codificar cientos de proteínas distintas.
              El proteoma humano (~100.000 proteínas) supera en mucho al número de genes (~20.000).
            </li>
            <li>
              <strong>La helicasa es increíblemente rápida</strong>: en procariotas, la helicasa puede
              desenvuelver la doble hélice a ~1.000 pb/segundo. La replicación completa del cromosoma
              de E. coli (4,6 Mpb) tarda aproximadamente 40 minutos.
            </li>
            <li>
              <strong>El código genético es casi universal</strong>: el mismo código (AUG = Met, UAA = stop...)
              se usa en bacterias, levaduras, plantas y humanos. Las pocas excepciones están en mitocondrias
              y algunos protozoos, lo que apoya un origen común de toda la vida.
            </li>
          </ul>

          <div className={styles.notaEdu}>
            <strong>Nota de uso:</strong> Este quiz es una herramienta educativa para repasar conceptos
            de biología molecular. No sustituye los apuntes ni los libros de texto. Para decisiones
            relacionadas con salud o diagnóstico genético, consulta siempre a profesionales sanitarios.
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-biologia-molecular')} />
      <ShareCard appName="quiz-biologia-molecular" />
      <Footer appName="quiz-biologia-molecular" />
    </div>
  );
}
