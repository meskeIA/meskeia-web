'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './ComparadorVocesNarrativas.module.css';

interface Dimensiones {
  densidad: number;
  psicologismo: number;
  experimentacion: number;
  lirismo: number;
  linealidad: number;
}

interface AutorData {
  id: string;
  nombre: string;
  pais: string;
  vida: string;
  movimiento: string;
  color: string;
  obraPrincipal: string;
  obras: string[];
  vozResumen: string;
  tecnicas: string[];
  dimensiones: Dimensiones;
  fragmento: {
    texto: string;
    obra: string;
    nota: string;
  };
}

const AUTORES: AutorData[] = [
  {
    id: 'flaubert',
    nombre: 'Gustave Flaubert',
    pais: '🇫🇷 Francia',
    vida: '1821–1880',
    movimiento: 'Realismo',
    color: '#4A6741',
    obraPrincipal: 'Madame Bovary',
    obras: ['Madame Bovary', 'La educación sentimental', 'Salammbô'],
    vozResumen: 'Prosa cincelada hasta la perfección. Flaubert convierte cada frase en un objeto labrado. Su famoso «mot juste» y el estilo indirecto libre fusionan la voz del narrador con la conciencia del personaje sin marcas tipográficas. La distancia irónica nunca abandona su narración.',
    tecnicas: [
      'Estilo indirecto libre (fusión narrador/personaje)',
      'Mot juste: la palabra exacta y no su sinónimo',
      'Ironía narrativa sistémica',
      'Descripción objetivista sin comentario moral',
      'Contrapunto entre acción externa e interioridad',
    ],
    dimensiones: { densidad: 4, psicologismo: 3, experimentacion: 2, lirismo: 3, linealidad: 4 },
    fragmento: {
      texto: '«Era un hermoso domingo de octubre. Dos o tres hojas amarillentas caían, y las manzanas seguían madurando.»',
      obra: 'Madame Bovary (1857)',
      nota: 'La escena exterior refleja el estado interior sin que el narrador lo declare: técnica flaubertiana por excelencia.',
    },
  },
  {
    id: 'proust',
    nombre: 'Marcel Proust',
    pais: '🇫🇷 Francia',
    vida: '1871–1922',
    movimiento: 'Modernismo',
    color: '#7B5EA7',
    obraPrincipal: 'En busca del tiempo perdido',
    obras: ['Por el camino de Swann', 'A la sombra de las muchachas en flor', 'El tiempo recobrado'],
    vozResumen: 'La frase proustiana puede extenderse durante páginas, enrollándose en digresiones, matices y analogías. El tiempo no avanza: se dilata, se repite, se recupera involuntariamente. La memoria es el motor narrativo y el estilo se despliega como una partitura musical.',
    tecnicas: [
      'Memoria involuntaria (la madeleine)',
      'Frases de extensión extrema y sintaxis ramificada',
      'Analepsis radical: el pasado interrumpe el presente',
      'Sinestesia narrativa (el sabor que desencadena el recuerdo)',
      'Tiempo subjetivo frente al tiempo del reloj',
    ],
    dimensiones: { densidad: 5, psicologismo: 5, experimentacion: 4, lirismo: 5, linealidad: 1 },
    fragmento: {
      texto: '«Por largo tiempo me acosté temprano. A veces, apenas apagada la bujía, mis ojos se cerraban tan presto que no tenía tiempo ni para decirme: "Me estoy durmiendo."»',
      obra: 'Por el camino de Swann (1913)',
      nota: 'La apertura más famosa de la novela moderna: el tiempo disuelto en la conciencia del durmiente antes de que empiece ningún argumento.',
    },
  },
  {
    id: 'kafka',
    nombre: 'Franz Kafka',
    pais: '🇨🇿 Bohemia / Austria',
    vida: '1883–1924',
    movimiento: 'Expresionismo',
    color: '#2C3E50',
    obraPrincipal: 'El proceso',
    obras: ['El proceso', 'El castillo', 'La metamorfosis', 'América'],
    vozResumen: 'Kafka narra lo absurdo con la misma neutralidad burocrática con que un funcionario redacta un informe. La pesadilla es real, el horror es administrativo. Su prosa seca amplifica la desorientación existencial del protagonista sin que el narrador añada ningún comentario.',
    tecnicas: [
      'Realismo kafkiano: lo absurdo narrado con normalidad',
      'Narrador enigmático en tercera persona limitada',
      'Alegoría existencial sin resolución',
      'Incertidumbre ontológica deliberada',
      'Prosa funcional sin ornamentos líricos',
    ],
    dimensiones: { densidad: 3, psicologismo: 4, experimentacion: 3, lirismo: 1, linealidad: 3 },
    fragmento: {
      texto: '«Alguien debió de haber calumniado a Josef K., porque una mañana fue detenido sin haber hecho nada malo.»',
      obra: 'El proceso (1925)',
      nota: 'Causa desconocida, consecuencia implacable, narración sin alarmismo: la primera frase como manifiesto del estilo kafkiano.',
    },
  },
  {
    id: 'woolf',
    nombre: 'Virginia Woolf',
    pais: '🇬🇧 Reino Unido',
    vida: '1882–1941',
    movimiento: 'Modernismo',
    color: '#1A5276',
    obraPrincipal: 'Mrs. Dalloway',
    obras: ['Mrs. Dalloway', 'Las olas', 'Al faro', 'Orlando'],
    vozResumen: 'Woolf traslada el tiempo exterior al ritmo interior de la conciencia. Sus frases se pliegan y despliegan como olas, mezclando percepciones, recuerdos y sensaciones sin distinción entre pasado y presente. La narrativa como música: el ritmo importa tanto como el significado.',
    tecnicas: [
      'Flujo de conciencia (stream of consciousness)',
      'Tiempo interior frente al tiempo del reloj',
      'Perspectiva múltiple sin transición marcada',
      'Monólogo interior de alta intensidad lírica',
      'Impresionismo narrativo: la percepción como realidad',
    ],
    dimensiones: { densidad: 4, psicologismo: 5, experimentacion: 5, lirismo: 5, linealidad: 1 },
    fragmento: {
      texto: '«La señora Dalloway dijo que ella misma compraría las flores.»',
      obra: 'Mrs. Dalloway (1925)',
      nota: 'Una frase cotidiana que inmediatamente se sumerge en décadas de memoria, sensación y asociación sin aviso previo.',
    },
  },
  {
    id: 'hemingway',
    nombre: 'Ernest Hemingway',
    pais: '🇺🇸 Estados Unidos',
    vida: '1899–1961',
    movimiento: 'Modernismo americano',
    color: '#935116',
    obraPrincipal: 'El viejo y el mar',
    obras: ['El viejo y el mar', 'Por quién doblan las campanas', 'Fiesta', 'El sol también sale'],
    vozResumen: 'La teoría del iceberg: lo importante nunca se dice explícitamente. Diálogos escuetos, frases cortas, verbos activos. La emoción emerge de lo que no está escrito. La sencillez extrema es la técnica más difícil de dominar.',
    tecnicas: [
      'Teoría del iceberg: lo esencial permanece bajo la superficie',
      'Prosa periodística y objetivista',
      'Diálogos secos sin didascalias emocionales',
      'Economía extrema: ninguna palabra superflua',
      'Repetición rítmica coordinada («y... y... y»)',
    ],
    dimensiones: { densidad: 1, psicologismo: 2, experimentacion: 2, lirismo: 1, linealidad: 4 },
    fragmento: {
      texto: '«El viejo llevaba ochenta y cuatro días sin pescar un pez. Los primeros cuarenta días había tenido consigo a un muchacho.»',
      obra: 'El viejo y el mar (1952)',
      nota: 'Dos frases contienen soledades, temporada y relación humana sin ningún comentario emocional. Todo el peso está en lo no dicho.',
    },
  },
  {
    id: 'garcia-marquez',
    nombre: 'Gabriel García Márquez',
    pais: '🇨🇴 Colombia',
    vida: '1927–2014',
    movimiento: 'Realismo mágico',
    color: '#C0392B',
    obraPrincipal: 'Cien años de soledad',
    obras: ['Cien años de soledad', 'El amor en los tiempos del cólera', 'El coronel no tiene quien le escriba'],
    vozResumen: 'La voz de un narrador oral que cuenta lo extraordinario con la misma naturalidad que lo cotidiano. El tiempo es circular y genealógico. La hipérbole y la maravilla son el registro neutro del mundo narrado, no recursos de énfasis.',
    tecnicas: [
      'Realismo mágico: lo maravilloso narrado con naturalidad',
      'Narrador épico-oral omnisciente',
      'Tiempo circular, genealógico y profético',
      'Hipérbole como registro narrativo neutro',
      'Apertura con analepsis y prolepsis simultáneas',
    ],
    dimensiones: { densidad: 3, psicologismo: 2, experimentacion: 3, lirismo: 4, linealidad: 2 },
    fragmento: {
      texto: '«Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.»',
      obra: 'Cien años de soledad (1967)',
      nota: 'El tiempo narrativo colapsa en una sola frase: futuro, presente y pasado remotísimo simultáneos, narrados con serenidad oral.',
    },
  },
  {
    id: 'borges',
    nombre: 'Jorge Luis Borges',
    pais: '🇦🇷 Argentina',
    vida: '1899–1986',
    movimiento: 'Posmodernismo',
    color: '#16A085',
    obraPrincipal: 'Ficciones',
    obras: ['Ficciones', 'El Aleph', 'Laberintos', 'El libro de arena'],
    vozResumen: 'Precisión conceptual de ensayo aplicada a la ficción. Borges inventa bibliotecas, laberintos y enciclopedias de mundos posibles con la frialdad de un matemático. La metaficción y el fantástico filosófico son su territorio: los géneros se mezclan sin pedirlo.',
    tecnicas: [
      'Metaficción y mise en abyme (ficciones sobre ficciones)',
      'Falsa erudición con citas y autores inventados',
      'Narrador paradójico y autoconsciente',
      'Fantástico filosófico (no sobrenatural sino conceptual)',
      'El cuento como argumentación lógica',
    ],
    dimensiones: { densidad: 4, psicologismo: 1, experimentacion: 5, lirismo: 3, linealidad: 2 },
    fragmento: {
      texto: '«El universo (que otros llaman la Biblioteca) se compone de un número indefinido, y tal vez infinito, de galerías hexagonales.»',
      obra: 'La biblioteca de Babel, en Ficciones (1944)',
      nota: 'La ficción arranca como tratado filosófico: ningún narrador se presenta, ningún personaje aparece. Solo el sistema lógico.',
    },
  },
  {
    id: 'dostoievski',
    nombre: 'Fiódor Dostoievski',
    pais: '🇷🇺 Rusia',
    vida: '1821–1881',
    movimiento: 'Realismo psicológico',
    color: '#6C3483',
    obraPrincipal: 'Crimen y castigo',
    obras: ['Crimen y castigo', 'Los hermanos Karamázov', 'El idiota', 'Los demonios'],
    vozResumen: 'Dostoievski deja hablar a sus personajes hasta el agotamiento: diálogos torrenciales, confesiones, contradicciones. La novela polifónica (concepto de Bajtín): cada personaje es una voz autónoma con su propia verdad. La tensión moral y religiosa nunca se resuelve del todo.',
    tecnicas: [
      'Novela polifónica: voces autónomas sin jerarquía',
      'Diálogos de altísima intensidad dramática',
      'Personajes-idea (cada uno encarna una posición filosófica)',
      'Monólogo interior de gran carga emocional',
      'Tensión moral y religiosa como motor narrativo',
    ],
    dimensiones: { densidad: 4, psicologismo: 5, experimentacion: 3, lirismo: 2, linealidad: 3 },
    fragmento: {
      texto: '«Al principio del mes de julio, en un día de extremo calor, hacia el anochecer, un joven salió del cuartucho que tenía alquilado en la callejuela de S. y salió a la calle con paso lento e irresoluto.»',
      obra: 'Crimen y castigo (1866)',
      nota: 'La vacilación psicológica del protagonista está ya en el ritmo de la frase antes de que ocurra ninguna acción.',
    },
  },
  {
    id: 'camus',
    nombre: 'Albert Camus',
    pais: '🇫🇷 Francia / Argelia',
    vida: '1913–1960',
    movimiento: 'Existencialismo',
    color: '#1A3A4A',
    obraPrincipal: 'El extranjero',
    obras: ['El extranjero', 'La peste', 'La caída', 'El primer hombre'],
    vozResumen: 'Narración en primera persona con distancia emocional radical. Meursault registra hechos como un termómetro: sin valorarlos, sin interpretarlos. La escritura solar y seca del Mediterráneo. El absurdo como posición narrativa, no como recurso cómico.',
    tecnicas: [
      'Narrador distanciado emocionalmente (anti-psicologismo)',
      'Tiempo presente dramático y frases cortas',
      'Parataxis: frases coordinadas sin subordinación',
      'Absurdo existencial como postura narrativa',
      'Descripción sensorial sin interpretación moral',
    ],
    dimensiones: { densidad: 2, psicologismo: 3, experimentacion: 2, lirismo: 2, linealidad: 4 },
    fragmento: {
      texto: '«Hoy ha muerto mamá. O quizás ayer, no sé. Recibí un telegrama del asilo: "Su madre ha fallecido. Entierro mañana. Sentidas condolencias." Esto no aclara nada.»',
      obra: 'El extranjero (1942)',
      nota: 'La indiferencia de Meursault no se anuncia: se muestra en la propia textura seca y discontinua de las frases.',
    },
  },
  {
    id: 'austen',
    nombre: 'Jane Austen',
    pais: '🇬🇧 Reino Unido',
    vida: '1775–1817',
    movimiento: 'Neoclasicismo',
    color: '#8B6914',
    obraPrincipal: 'Orgullo y prejuicio',
    obras: ['Orgullo y prejuicio', 'Sentido y sensibilidad', 'Emma', 'Persuasión'],
    vozResumen: 'Ironía social sistemática: el narrador dice una cosa y significa otra, y el lector cómplice disfruta la distancia. Austen usa el estilo indirecto libre con fluidez antes de que Flaubert lo sistematizara, filtrando la realidad social a través de la conciencia de sus heroínas.',
    tecnicas: [
      'Ironía social como voz narrativa constante',
      'Free indirect speech avant la lettre',
      'Narrador omnisciente con personalidad propia',
      'Comedia de maneras y crítica social encubierta',
      'Diálogo como revelación de carácter y clase',
    ],
    dimensiones: { densidad: 2, psicologismo: 3, experimentacion: 1, lirismo: 2, linealidad: 5 },
    fragmento: {
      texto: '«Es una verdad universalmente reconocida que un hombre soltero, poseedor de una gran fortuna, necesita una esposa.»',
      obra: 'Orgullo y prejuicio (1813)',
      nota: 'La ironía se activa en la primera frase: la «verdad universal» es la opinión interesada de las madres casamenteras del vecindario.',
    },
  },
];

type DimensionKey = keyof Dimensiones;

const DIMENSION_KEYS: DimensionKey[] = [
  'densidad',
  'psicologismo',
  'experimentacion',
  'lirismo',
  'linealidad',
];

const DIMENSION_INFO: Record<DimensionKey, { label: string; min: string; max: string }> = {
  densidad: { label: 'Densidad próstica', min: 'Escueta', max: 'Densa' },
  psicologismo: { label: 'Psicologismo', min: 'Exterior / acción', max: 'Interior / mente' },
  experimentacion: { label: 'Experimentación', min: 'Convencional', max: 'Rupturista' },
  lirismo: { label: 'Lirismo', min: 'Funcional / seco', max: 'Poético / musical' },
  linealidad: { label: 'Linealidad', min: 'No lineal', max: 'Cronológica' },
};

interface Analisis {
  comun: string[];
  distintos: string[];
}

function calcularAnalisis(a: AutorData, b: AutorData): Analisis {
  const comun: string[] = [];
  const distintos: string[] = [];

  for (const key of DIMENSION_KEYS) {
    const aVal = a.dimensiones[key];
    const bVal = b.dimensiones[key];
    const diff = Math.abs(aVal - bVal);
    const label = DIMENSION_INFO[key].label.toLowerCase();

    if (diff <= 1) {
      if (aVal >= 4) comun.push(`Alta ${label} en ambos`);
      else if (aVal <= 2) comun.push(`Baja ${label} en ambos`);
    } else {
      const mas = aVal > bVal ? a.nombre.split(' ').slice(-1)[0] : b.nombre.split(' ').slice(-1)[0];
      const menos = aVal > bVal ? b.nombre.split(' ').slice(-1)[0] : a.nombre.split(' ').slice(-1)[0];
      distintos.push(`${DIMENSION_INFO[key].label}: mayor en ${mas}, menor en ${menos}`);
    }
  }

  if (a.movimiento === b.movimiento) {
    comun.push(`Ambos pertenecen al ${a.movimiento}`);
  } else {
    distintos.push(`Movimientos distintos: ${a.movimiento} vs ${b.movimiento}`);
  }

  return { comun, distintos };
}

export default function ComparadorVocesNarrativas() {
  const [autorA, setAutorA] = useState<string | null>(null);
  const [autorB, setAutorB] = useState<string | null>(null);

  const dataA = useMemo(() => AUTORES.find(a => a.id === autorA) ?? null, [autorA]);
  const dataB = useMemo(() => AUTORES.find(a => a.id === autorB) ?? null, [autorB]);

  const analisis = useMemo<Analisis | null>(() => {
    if (!dataA || !dataB) return null;
    return calcularAnalisis(dataA, dataB);
  }, [dataA, dataB]);

  function handleSelectA(id: string) {
    if (autorB === id) setAutorB(null);
    setAutorA(prev => (prev === id ? null : id));
  }

  function handleSelectB(id: string) {
    if (autorA === id) setAutorA(null);
    setAutorB(prev => (prev === id ? null : id));
  }

  function apellido(nombre: string): string {
    const partes = nombre.split(' ');
    return partes[partes.length - 1];
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Comparador de Voces Narrativas</h1>
        <p className={styles.heroSubtitle}>
          Selecciona dos novelistas y descubre cómo sus estilos, técnicas y visiones del mundo se entrelazan y divergen.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Slots activos */}
        <div className={styles.slots}>
          <div className={`${styles.slot} ${dataA ? styles.slotActivo : ''}`} style={dataA ? { borderColor: dataA.color } : {}}>
            <span className={styles.slotEtiqueta} style={dataA ? { background: dataA.color } : {}}>VOZ A</span>
            {dataA ? (
              <>
                <span className={styles.slotNombre}>{dataA.nombre}</span>
                <span className={styles.slotMeta}>{dataA.movimiento}</span>
              </>
            ) : (
              <span className={styles.slotVacio}>Haz clic en <strong>+A</strong> para elegir</span>
            )}
          </div>
          <div className={styles.vsCircle}>VS</div>
          <div className={`${styles.slot} ${dataB ? styles.slotActivo : ''}`} style={dataB ? { borderColor: dataB.color } : {}}>
            <span className={styles.slotEtiqueta} style={dataB ? { background: dataB.color } : {}}>VOZ B</span>
            {dataB ? (
              <>
                <span className={styles.slotNombre}>{dataB.nombre}</span>
                <span className={styles.slotMeta}>{dataB.movimiento}</span>
              </>
            ) : (
              <span className={styles.slotVacio}>Haz clic en <strong>+B</strong> para elegir</span>
            )}
          </div>
        </div>

        {/* Grid de selección */}
        <section className={styles.seleccion}>
          <h2 className={styles.seleccionTitle}>Elige dos novelistas</h2>
          <div className={styles.autoresGrid}>
            {AUTORES.map(autor => {
              const esA = autorA === autor.id;
              const esB = autorB === autor.id;
              return (
                <div
                  key={autor.id}
                  className={`${styles.autorCard} ${esA ? styles.autorCardA : ''} ${esB ? styles.autorCardB : ''}`}
                  style={{
                    borderColor: esA ? autor.color : esB ? autor.color : undefined,
                  }}
                >
                  <div className={styles.autorInfo}>
                    <p className={styles.autorNombre}>{autor.nombre}</p>
                    <p className={styles.autorMeta}>{autor.pais}</p>
                    <p className={styles.autorMeta}>{autor.vida} · {autor.movimiento}</p>
                    <p className={styles.autorObra}>{autor.obraPrincipal}</p>
                  </div>
                  <div className={styles.autorBotones}>
                    <button
                      className={`${styles.btnSlot} ${esA ? styles.btnSlotActivoA : ''}`}
                      style={esA ? { background: autor.color, borderColor: autor.color } : {}}
                      onClick={() => handleSelectA(autor.id)}
                      aria-pressed={esA}
                    >
                      {esA ? '✓ A' : '+ A'}
                    </button>
                    <button
                      className={`${styles.btnSlot} ${esB ? styles.btnSlotActivoB : ''}`}
                      style={esB ? { background: autor.color, borderColor: autor.color } : {}}
                      onClick={() => handleSelectB(autor.id)}
                      aria-pressed={esB}
                    >
                      {esB ? '✓ B' : '+ B'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Panel de comparación */}
        {dataA && dataB && (
          <section className={styles.comparacion}>
            {/* Cabeceras */}
            <div className={styles.compDual}>
              <div className={styles.compCabecera} style={{ borderTopColor: dataA.color }}>
                <div className={styles.compTag} style={{ background: dataA.color }}>VOZ A</div>
                <h2 className={styles.compNombre}>{dataA.nombre}</h2>
                <p className={styles.compMetaLine}>{dataA.pais} · {dataA.vida}</p>
                <span className={styles.compMovimiento} style={{ color: dataA.color }}>{dataA.movimiento}</span>
                <p className={styles.compVoz}>{dataA.vozResumen}</p>
              </div>
              <div className={styles.compCabecera} style={{ borderTopColor: dataB.color }}>
                <div className={styles.compTag} style={{ background: dataB.color }}>VOZ B</div>
                <h2 className={styles.compNombre}>{dataB.nombre}</h2>
                <p className={styles.compMetaLine}>{dataB.pais} · {dataB.vida}</p>
                <span className={styles.compMovimiento} style={{ color: dataB.color }}>{dataB.movimiento}</span>
                <p className={styles.compVoz}>{dataB.vozResumen}</p>
              </div>
            </div>

            {/* Dimensiones */}
            <div className={styles.compBloque}>
              <h3 className={styles.compBloqueTitle}>Dimensiones del estilo</h3>
              <div className={styles.dimensiones}>
                {DIMENSION_KEYS.map(key => (
                  <div key={key} className={styles.dimensionRow}>
                    <div className={styles.dimensionMeta}>
                      <span className={styles.dimensionLabel}>{DIMENSION_INFO[key].label}</span>
                      <div className={styles.dimensionPolos}>
                        <span>{DIMENSION_INFO[key].min}</span>
                        <span>{DIMENSION_INFO[key].max}</span>
                      </div>
                    </div>
                    <div className={styles.barrasDuo}>
                      <div className={styles.barraRow}>
                        <span className={styles.barraAutor}>{apellido(dataA.nombre)}</span>
                        <div className={styles.barraTrack}>
                          <div
                            className={styles.barraFill}
                            style={{
                              width: `${dataA.dimensiones[key] * 20}%`,
                              background: dataA.color,
                            }}
                          />
                        </div>
                        <span className={styles.barraVal}>{dataA.dimensiones[key]}/5</span>
                      </div>
                      <div className={styles.barraRow}>
                        <span className={styles.barraAutor}>{apellido(dataB.nombre)}</span>
                        <div className={styles.barraTrack}>
                          <div
                            className={styles.barraFill}
                            style={{
                              width: `${dataB.dimensiones[key] * 20}%`,
                              background: dataB.color,
                            }}
                          />
                        </div>
                        <span className={styles.barraVal}>{dataB.dimensiones[key]}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fragmentos */}
            <div className={styles.compBloque}>
              <h3 className={styles.compBloqueTitle}>Fragmentos representativos</h3>
              <div className={styles.compDual}>
                <blockquote className={styles.fragmento} style={{ borderLeftColor: dataA.color }}>
                  <p className={styles.fragmentoTexto}>{dataA.fragmento.texto}</p>
                  <footer className={styles.fragmentoFoot}>
                    <cite className={styles.fragmentoCita}>{dataA.fragmento.obra}</cite>
                    <span className={styles.fragmentoNota}>{dataA.fragmento.nota}</span>
                  </footer>
                </blockquote>
                <blockquote className={styles.fragmento} style={{ borderLeftColor: dataB.color }}>
                  <p className={styles.fragmentoTexto}>{dataB.fragmento.texto}</p>
                  <footer className={styles.fragmentoFoot}>
                    <cite className={styles.fragmentoCita}>{dataB.fragmento.obra}</cite>
                    <span className={styles.fragmentoNota}>{dataB.fragmento.nota}</span>
                  </footer>
                </blockquote>
              </div>
            </div>

            {/* Técnicas */}
            <div className={styles.compBloque}>
              <h3 className={styles.compBloqueTitle}>Técnicas narrativas clave</h3>
              <div className={styles.compDual}>
                <ul className={styles.tecnicasList}>
                  {dataA.tecnicas.map(t => (
                    <li key={t} className={styles.tecnicaItem} style={{ borderLeftColor: dataA.color }}>
                      {t}
                    </li>
                  ))}
                </ul>
                <ul className={styles.tecnicasList}>
                  {dataB.tecnicas.map(t => (
                    <li key={t} className={styles.tecnicaItem} style={{ borderLeftColor: dataB.color }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Obras */}
            <div className={styles.compBloque}>
              <h3 className={styles.compBloqueTitle}>Obras principales</h3>
              <div className={styles.compDual}>
                <div className={styles.obrasList}>
                  {dataA.obras.map(o => (
                    <span key={o} className={styles.obraTag} style={{ borderColor: dataA.color, color: dataA.color }}>
                      {o}
                    </span>
                  ))}
                </div>
                <div className={styles.obrasList}>
                  {dataB.obras.map(o => (
                    <span key={o} className={styles.obraTag} style={{ borderColor: dataB.color, color: dataB.color }}>
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Análisis */}
            {analisis && (
              <div className={styles.compBloque}>
                <h3 className={styles.compBloqueTitle}>Análisis comparativo</h3>
                <div className={styles.analisisDual}>
                  <div className={styles.analisisComun}>
                    <h4 className={styles.analisisTitleGreen}>🤝 Lo que comparten</h4>
                    {analisis.comun.length > 0 ? (
                      <ul className={styles.analisisList}>
                        {analisis.comun.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    ) : (
                      <p className={styles.analisisVacio}>Voces con perfiles muy distintos en todas las dimensiones.</p>
                    )}
                  </div>
                  <div className={styles.analisisDistinto}>
                    <h4 className={styles.analisisTitleBlue}>⚡ Lo que los diferencia</h4>
                    {analisis.distintos.length > 0 ? (
                      <ul className={styles.analisisList}>
                        {analisis.distintos.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    ) : (
                      <p className={styles.analisisVacio}>Perfiles muy similares en todas las dimensiones.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {!dataA && !dataB && (
          <div className={styles.instrucciones}>
            <p>Selecciona <strong>+A</strong> y <strong>+B</strong> en dos tarjetas para iniciar la comparación.</p>
          </div>
        )}

        <EducationalSection title="La voz narrativa en la novela" subtitle="Qué es el estilo, cómo analizarlo y qué diferencia a los grandes novelistas">
          <div className={styles.guideSection}>
            <p>La voz narrativa es el conjunto de rasgos estilísticos que hace reconocible a un escritor: ritmo de la frase, distancia emocional, manejo del tiempo, relación con el lector. No equivale al narrador (la instancia que cuenta la historia), sino a la textura misma del lenguaje con que está escrita.</p>

            {/* Tabla comparativa */}
            <h3>Los 10 novelistas de un vistazo</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Autor</th>
                    <th>Movimiento</th>
                    <th>País</th>
                    <th>Obra principal</th>
                    <th>Rasgo estilístico clave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Flaubert</td><td>Realismo</td><td>Francia</td><td>Madame Bovary</td><td>Mot juste · estilo indirecto libre</td></tr>
                  <tr><td>Proust</td><td>Modernismo</td><td>Francia</td><td>En busca del tiempo perdido</td><td>Memoria involuntaria · frase larga</td></tr>
                  <tr><td>Kafka</td><td>Expresionismo</td><td>Bohemia</td><td>El proceso</td><td>Absurdo burocrático · neutralidad</td></tr>
                  <tr><td>Woolf</td><td>Modernismo</td><td>Reino Unido</td><td>Mrs. Dalloway</td><td>Flujo de conciencia · lirismo</td></tr>
                  <tr><td>Hemingway</td><td>Modernismo americano</td><td>EEUU</td><td>El viejo y el mar</td><td>Teoría del iceberg · economía</td></tr>
                  <tr><td>García Márquez</td><td>Realismo mágico</td><td>Colombia</td><td>Cien años de soledad</td><td>Narrador oral épico · hipérbole</td></tr>
                  <tr><td>Borges</td><td>Posmodernismo</td><td>Argentina</td><td>Ficciones</td><td>Metaficción · falsa erudición</td></tr>
                  <tr><td>Dostoievski</td><td>Realismo psicológico</td><td>Rusia</td><td>Crimen y castigo</td><td>Novela polifónica · personajes-idea</td></tr>
                  <tr><td>Camus</td><td>Existencialismo</td><td>Francia/Argelia</td><td>El extranjero</td><td>Distancia emocional · absurdo</td></tr>
                  <tr><td>Austen</td><td>Neoclasicismo</td><td>Reino Unido</td><td>Orgullo y prejuicio</td><td>Ironía social · free indirect speech</td></tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3>¿Quién usa esta herramienta?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🎓</span>
                  <h4>Estudiante de Literatura</h4>
                </div>
                <p>Prepara un trabajo comparativo sobre el modernismo y necesita argumentar las diferencias de estilo entre Woolf y Proust.</p>
                <p className={styles.escenarioExample}>Ejemplo: compara las dimensiones y extrae 3 diferencias concretas para el ensayo.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>✍️</span>
                  <h4>Escritor en formación</h4>
                </div>
                <p>Busca un referente estilístico para su primera novela: ¿qué voz le resulta más natural, Hemingway o García Márquez?</p>
                <p className={styles.escenarioExample}>Ejemplo: usa las dimensiones para identificar qué registros se acercan a su propia escritura.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>📚</span>
                  <h4>Lector curioso</h4>
                </div>
                <p>Acaba de leer a Kafka y quiere entender por qué le impactó tanto, y qué autores tienen un estilo comparable.</p>
                <p className={styles.escenarioExample}>Ejemplo: compara Kafka con Camus para descubrir similitudes y diferencias en el absurdo.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono}>🏫</span>
                  <h4>Docente</h4>
                </div>
                <p>Diseña una clase de Bachillerato sobre la novela del siglo XX y necesita un recurso visual para mostrar las dimensiones del estilo.</p>
                <p className={styles.escenarioTip}>💡 Las barras de dimensiones sirven como soporte visual para la pizarra o proyección.</p>
              </div>
            </div>

            {/* FAQ */}
            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Qué es exactamente la «voz narrativa»?</h4>
                <p>Es la huella estilística del autor: el ritmo de sus frases, la distancia emocional que adopta, cómo maneja el tiempo y qué da por sabido el lector. No es lo mismo que el narrador (quien cuenta), sino la textura del lenguaje con que está contada la historia.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿En qué se diferencia el narrador del autor?</h4>
                <p>El autor es la persona real; el narrador, la instancia ficticia que cuenta la historia. Camus no es Meursault, aunque ambos hablen en primera persona. La voz narrativa pertenece al autor; el narrador es un personaje más, aunque sea invisible.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué es el estilo indirecto libre?</h4>
                <p>Técnica donde el narrador reproduce el pensamiento del personaje sin verbos introductorios («pensó que», «se dijo»). La frase «Era demasiado tarde para arrepentirse» puede ser del narrador o del personaje: la ambigüedad es el efecto buscado. Flaubert la sistematizó; Austen ya la usaba antes.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué es el flujo de conciencia?</h4>
                <p>Técnica que intenta reproducir el pensamiento tal como ocurre en la mente: asociativo, discontinuo, sin separación clara entre pasado y presente. Virginia Woolf y James Joyce son sus máximos exponentes. No debe confundirse con el monólogo interior, que puede ser más ordenado.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Por qué Hemingway y Proust suenan tan distintos?</h4>
                <p>Son casi antónimos estilísticos. Hemingway elimina todo lo que pueda estar implícito; Proust desarrolla cada matiz hasta sus últimas ramificaciones. Uno cree en la economía; el otro, en la exhaustividad. Ambas estrategias son deliberadas y responden a visiones del mundo diferentes.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué significan las 5 dimensiones del comparador?</h4>
                <p>Son ejes de análisis estilístico: densidad (complejidad de la prosa), psicologismo (atención a la vida interior), experimentación (ruptura con las convenciones), lirismo (musicalidad y poeticidad) y linealidad (estructura cronológica vs fragmentada). Son orientativas, no métricas absolutas.</p>
                <span className={styles.faqTip}>Las valoraciones son editoriales, no matemáticas: representan tendencias, no verdades.</span>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Puedo usar la voz de un autor como referente para escribir?</h4>
                <p>Sí, y es el modo en que han aprendido casi todos los escritores. Imitar conscientemente a un referente es un ejercicio de aprendizaje, no plagio. Lo importante es que la imitación se convierta en punto de partida, no en destino.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿El modernismo literario es lo mismo que el modernismo en español?</h4>
                <p>No. El Modernismo hispánico (Darío, Martí) es un movimiento de finales del XIX centrado en el esteticismo y el simbolismo. El High Modernism anglosajón (Woolf, Joyce) es de principios del XX y se centra en la experimentación formal. El nombre coincide, pero las tradiciones son distintas.</p>
              </div>
            </div>

            {/* Guía paso a paso */}
            <h3>Cómo sacarle partido al comparador</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Elige dos autores que conozcas (aunque sea de nombre)</h4>
                  <p>La comparación es más rica si ya tienes alguna intuición sobre ambos. Empieza por los que ya hayas leído.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Lee primero los fragmentos en voz alta</h4>
                  <p>El ritmo es la primera diferencia perceptible. Antes de analizar, escucha cómo suena cada voz.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Observa las dimensiones</h4>
                  <p>Las barras muestran de un vistazo el perfil estilístico de cada autor. Localiza las mayores diferencias.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Lee las técnicas narrativas</h4>
                  <p>Cada técnica tiene un nombre. Aprenderlos te permitirá hablar con precisión sobre lo que antes sentías de forma vaga.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Consulta el análisis comparativo</h4>
                  <p>El bloque «qué comparten / qué los diferencia» sintetiza los contrastes más relevantes entre ambas voces.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h4>Prueba combinaciones inesperadas</h4>
                  <p>Austen y Kafka, Borges y Hemingway, Dostoievski y Camus: los contrastes extremos revelan más que las comparaciones evidentes.</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <h3>Consejos para profundizar</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>👂</span>
                <h4>Lee en voz alta</h4>
                <p>El ritmo de la frase es la primera marca estilística. Lo que funciona ojo a ojo puede sonar distinto en voz alta.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>📖</span>
                <h4>Empieza por la primera página</h4>
                <p>La apertura de una novela concentra las decisiones estilísticas más deliberadas del autor. Es el mejor lugar para analizar la voz.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🔄</span>
                <h4>Ninguna voz es superior</h4>
                <p>La densidad proustiana y la economía hemingwayana son elecciones distintas ante el mismo desafío. El valor literario no está en la complejidad.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🔗</span>
                <h4>Las técnicas se transmiten</h4>
                <p>Woolf aprendió de James; Hemingway de Stein; García Márquez de Faulkner. Rastrear esas influencias es otra forma de entender los estilos.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>🌍</span>
                <h4>Cuenta la traducción</h4>
                <p>Leer a Proust, Kafka o Dostoievski en español es leerlos a través del filtro del traductor. La voz que percibes es parcialmente la de quien tradujo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono}>✍️</span>
                <h4>Imitar es aprender</h4>
                <p>Escribir dos párrafos imitando a Hemingway y luego dos imitando a Proust es el ejercicio de estilo más efectivo para entender la diferencia.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono}>⚠️</span>
                <h4>Errores frecuentes al analizar estilos literarios</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Confundir al autor con el narrador: Camus no es Meursault, Dostoievski no es Raskólnikov.</li>
                <li>Creer que la prosa simple es menos literaria: la economía de Hemingway exige más control que la densidad proustiana.</li>
                <li>Aplicar las características de un movimiento a todos sus autores: Woolf y Hemingway son ambos modernistas, pero sus voces son opuestas.</li>
                <li>Comparar traducciones de traductores distintos y atribuir las diferencias al autor.</li>
                <li>Leer solo fragmentos y extraer conclusiones sobre el estilo global de una obra larga.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('comparador-voces-narrativas')} />
      <ShareCard appName="comparador-voces-narrativas" />
      <Footer appName="comparador-voces-narrativas" />
    </div>
  );
}
