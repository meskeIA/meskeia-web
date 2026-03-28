'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorIdioma.module.css';

// ============================================================
// TIPOS
// ============================================================

type RecomendacionKey = 'ingles' | 'frances' | 'aleman' | 'portugues' | 'chino_japones';

interface OpcionPregunta {
  texto: string;
  icono: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: OpcionPregunta[];
}

interface Recomendacion {
  key: RecomendacionKey;
  emoji: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  caracteristicas: string[];
  usos: string[];
}

// ============================================================
// DATOS: PREGUNTAS
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es tu objetivo principal al aprender un idioma?',
    opciones: [
      {
        texto: 'Mejorar mis oportunidades laborales',
        icono: '💼',
        pesos: { ingles: 4, aleman: 3, frances: 2 },
      },
      {
        texto: 'Viajar y conectar con otras culturas',
        icono: '✈️',
        pesos: { ingles: 3, portugues: 3, frances: 3 },
      },
      {
        texto: 'Enriquecimiento cultural y personal',
        icono: '🎭',
        pesos: { frances: 4, chino_japones: 3, aleman: 2 },
      },
      {
        texto: 'Estudios académicos o investigación',
        icono: '🎓',
        pesos: { ingles: 4, aleman: 3, frances: 3 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿En qué sector laboral trabajas o quieres trabajar?',
    opciones: [
      {
        texto: 'Tecnología, informática o startups',
        icono: '💻',
        pesos: { ingles: 5, aleman: 2 },
      },
      {
        texto: 'Ingeniería, industria o automoción',
        icono: '⚙️',
        pesos: { aleman: 5, ingles: 2 },
      },
      {
        texto: 'Turismo, hostelería o comercio internacional',
        icono: '🏨',
        pesos: { ingles: 3, frances: 3, portugues: 3 },
      },
      {
        texto: 'Arte, cultura, diplomacia u organismos internacionales',
        icono: '🌐',
        pesos: { frances: 4, ingles: 3, chino_japones: 2 },
      },
      {
        texto: 'Comercio con Asia o manufactura',
        icono: '🏭',
        pesos: { chino_japones: 5, ingles: 2 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿A qué destinos viajas o te gustaría viajar más?',
    opciones: [
      {
        texto: 'Estados Unidos, Reino Unido, Australia o Canadá',
        icono: '🇬🇧',
        pesos: { ingles: 5 },
      },
      {
        texto: 'Francia, Bélgica, Suiza, Marruecos o África francófona',
        icono: '🇫🇷',
        pesos: { frances: 5 },
      },
      {
        texto: 'Alemania, Austria, Suiza alemana o países nórdicos',
        icono: '🇩🇪',
        pesos: { aleman: 5 },
      },
      {
        texto: 'Brasil, Portugal o Mozambique',
        icono: '🇧🇷',
        pesos: { portugues: 5 },
      },
      {
        texto: 'China, Japón, Taiwán o Corea',
        icono: '🇯🇵',
        pesos: { chino_japones: 5 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Cuál es tu nivel actual de inglés?',
    opciones: [
      {
        texto: 'Nulo o muy básico (A1)',
        icono: '🌱',
        pesos: { ingles: 5 },
      },
      {
        texto: 'Básico, me defiendo en situaciones simples (A2-B1)',
        icono: '📗',
        pesos: { ingles: 3 },
      },
      {
        texto: 'Intermedio-alto, me comunico bien (B2)',
        icono: '📘',
        pesos: { frances: 2, aleman: 2, portugues: 2 },
      },
      {
        texto: 'Avanzado o nativo, el inglés ya no me limita (C1-C2)',
        icono: '🏆',
        pesos: { frances: 3, aleman: 3, portugues: 3, chino_japones: 3 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Ya hablas algún otro idioma europeo además del español?',
    opciones: [
      {
        texto: 'No, el español es mi único idioma',
        icono: '🇪🇸',
        pesos: { ingles: 3, portugues: 3 },
      },
      {
        texto: 'Sí, hablo inglés con fluidez',
        icono: '✅',
        pesos: { frances: 3, aleman: 3, portugues: 2, chino_japones: 2 },
      },
      {
        texto: 'Sí, hablo francés o italiano',
        icono: '🇮🇹',
        pesos: { portugues: 4, aleman: 2 },
      },
      {
        texto: 'Sí, hablo alemán u otro idioma centroeuropeo',
        icono: '🇦🇹',
        pesos: { ingles: 2, chino_japones: 2 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes interés por la cultura, tecnología o empresas asiáticas?',
    opciones: [
      {
        texto: 'Sí, me fascina Japón: anime, tecnología, diseño',
        icono: '⛩️',
        pesos: { chino_japones: 5 },
      },
      {
        texto: 'Sí, me interesa China: economía, mandarín, negocios',
        icono: '🐉',
        pesos: { chino_japones: 5 },
      },
      {
        texto: 'Algo, pero no es mi prioridad principal',
        icono: '🌏',
        pesos: { chino_japones: 2, ingles: 1 },
      },
      {
        texto: 'No, prefiero enfocarse en otros mercados',
        icono: '🌍',
        pesos: { ingles: 2, frances: 2, aleman: 2, portugues: 2 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Cuántas horas semanales puedes dedicar al aprendizaje del idioma?',
    opciones: [
      {
        texto: 'Menos de 3 horas (muy poco tiempo)',
        icono: '⏱️',
        pesos: { portugues: 4, ingles: 3 },
      },
      {
        texto: 'Entre 3 y 7 horas (ritmo moderado)',
        icono: '📅',
        pesos: { ingles: 3, frances: 3, portugues: 2 },
      },
      {
        texto: 'Entre 7 y 15 horas (dedicación alta)',
        icono: '📚',
        pesos: { aleman: 3, ingles: 2, frances: 2 },
      },
      {
        texto: 'Más de 15 horas (aprendizaje intensivo)',
        icono: '🔥',
        pesos: { chino_japones: 4, aleman: 3 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Necesitas resultados prácticos en poco tiempo?',
    opciones: [
      {
        texto: 'Sí, necesito comunicarme en 6-12 meses',
        icono: '⚡',
        pesos: { portugues: 5, ingles: 3 },
      },
      {
        texto: 'Me lo tomo con calma, prefiero solidez',
        icono: '🏗️',
        pesos: { aleman: 4, frances: 3 },
      },
      {
        texto: 'Estoy dispuesto a dedicar 2-3 años si merece la pena',
        icono: '🎯',
        pesos: { chino_japones: 4, aleman: 3 },
      },
      {
        texto: 'Quiero un idioma que pueda usar de forma básica rápido',
        icono: '🚀',
        pesos: { portugues: 4, ingles: 3 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Te importa aprender un sistema de escritura completamente diferente?',
    opciones: [
      {
        texto: 'No me importa, es parte del reto y lo disfruto',
        icono: '🖊️',
        pesos: { chino_japones: 5 },
      },
      {
        texto: 'Lo acepto si hay beneficios claros',
        icono: '🤔',
        pesos: { chino_japones: 3, aleman: 1 },
      },
      {
        texto: 'Prefiero un idioma con alfabeto latino',
        icono: '🔤',
        pesos: { ingles: 2, frances: 2, aleman: 2, portugues: 2 },
      },
      {
        texto: 'Prefiero algo parecido al español',
        icono: '🇪🇸',
        pesos: { portugues: 5, frances: 2 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes vínculos familiares, pareja o amigos en algún país concreto?',
    opciones: [
      {
        texto: 'Sí, en países anglosajones (UK, USA, Australia...)',
        icono: '🇺🇸',
        pesos: { ingles: 5 },
      },
      {
        texto: 'Sí, en Francia, Bélgica, Quebec o África francófona',
        icono: '🇫🇷',
        pesos: { frances: 5 },
      },
      {
        texto: 'Sí, en Alemania, Austria o Suiza',
        icono: '🇩🇪',
        pesos: { aleman: 5 },
      },
      {
        texto: 'Sí, en Brasil, Portugal u otros países lusófonos',
        icono: '🇧🇷',
        pesos: { portugues: 5 },
      },
      {
        texto: 'Sí, en China, Japón u otro país asiático',
        icono: '🇨🇳',
        pesos: { chino_japones: 5 },
      },
      {
        texto: 'No tengo vínculos concretos en ningún país',
        icono: '🌐',
        pesos: { ingles: 2 },
      },
    ],
  },
];

// ============================================================
// DATOS: RECOMENDACIONES
// ============================================================

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  ingles: {
    key: 'ingles',
    emoji: '🇬🇧',
    titulo: 'Inglés',
    subtitulo: 'El idioma más universal para trabajo, tecnología y viajes globales',
    descripcion:
      'Tu perfil apunta claramente al inglés. Es el idioma más hablado como segunda lengua del mundo: más de 1.500 millones de personas lo usan. Es el estándar en tecnología, ciencia, negocios internacionales y turismo global. Si quieres ampliar oportunidades sin importar el sector, el inglés es el primer escalón imprescindible.',
    caracteristicas: [
      'Más de 1.500 M de hablantes',
      'Estándar en tecnología y ciencia',
      'Imprescindible en empresa internacional',
      'Alta oferta de recursos en español',
      'Certificaciones B2/C1 muy valoradas',
      'Nivel base en 12-18 meses',
      'Útil en casi cualquier país del mundo',
      'Puerta a otros idiomas germánicos',
    ],
    usos: [
      'Acceso a empleos tecnológicos, startups y multinacionales',
      'Comunicación en viajes a más de 60 países sin barrera',
      'Lectura directa de documentación científica y técnica',
      'Acceso a plataformas de aprendizaje, cursos y certificaciones',
      'Base para aprender otros idiomas germánicos más fácilmente',
    ],
  },
  frances: {
    key: 'frances',
    emoji: '🇫🇷',
    titulo: 'Francés',
    subtitulo: 'El segundo idioma más hablado en Europa, clave para organismos internacionales',
    descripcion:
      'El francés encaja con tu perfil. Es el idioma oficial de 29 países y lengua de trabajo de la ONU, la UE, la UNESCO y muchos otros organismos internacionales. Con más de 300 millones de hablantes, abre puertas en diplomacia, cultura, turismo de lujo, moda y el continente africano, el de mayor crecimiento demográfico mundial.',
    caracteristicas: [
      'Oficial en 29 países del mundo',
      'Lengua de trabajo en ONU y UE',
      '300 M de hablantes activos',
      'Muy valorado en diplomacia y cultura',
      'Acceso a África francófona',
      'Estructura similar al español',
      'Alto nivel cultural y literario',
      'Facilita el italiano y el rumano',
    ],
    usos: [
      'Trabajo en organismos internacionales y diplomacia europea',
      'Acceso a mercados emergentes del África francófona',
      'Sector turístico de alto nivel: hoteles, gastronomía, moda',
      'Investigación en ciencias sociales, filosofía y humanidades',
      'Ventaja competitiva en empresas franco-españolas',
    ],
  },
  aleman: {
    key: 'aleman',
    emoji: '🇩🇪',
    titulo: 'Alemán',
    subtitulo: 'El idioma con mayor demanda laboral en Europa Central, muy valorado en ingeniería',
    descripcion:
      'El alemán es tu idioma. Alemania es la mayor economía de Europa y alberga algunas de las empresas más importantes del mundo en automoción, ingeniería, química y finanzas. El alemán es el segundo idioma más usado en publicaciones científicas y tiene una altísima demanda en el mercado laboral europeo, con sueldos muy competitivos.',
    caracteristicas: [
      'Mayor economía de Europa',
      '2.º idioma más publicado en ciencia',
      'Alta demanda: ingeniería, industria',
      'BMW, Siemens, Volkswagen, SAP...',
      'Sueldos muy altos en DACH',
      'Nivel B2 muy valorado en empleo',
      'Estructura gramatical exigente',
      'Facilita holandés y lenguas nórdicas',
    ],
    usos: [
      'Empleo en empresas alemanas, austríacas y suizas en España y Europa',
      'Ingeniería, automoción, química y farmacia en mercado DACH',
      'Investigación científica y publicaciones académicas',
      'Programas de intercambio y becas en universidades alemanas',
      'Acceso a uno de los mercados con mayor poder adquisitivo del mundo',
    ],
  },
  portugues: {
    key: 'portugues',
    emoji: '🇧🇷',
    titulo: 'Portugués',
    subtitulo: 'Puerta a Brasil y Portugal, muy accesible para hispanohablantes',
    descripcion:
      'El portugués es una elección muy inteligente para hispanohablantes. Es el idioma más cercano al español y permite alcanzar un nivel comunicativo en muy poco tiempo. Con más de 260 millones de hablantes nativos, es el quinto idioma más hablado del mundo y la llave de acceso a Brasil, la mayor economía de América Latina, y a Portugal.',
    caracteristicas: [
      '260 M de hablantes nativos',
      'El más fácil para hispanohablantes',
      'Comunicación básica en meses',
      'Brasil: 8.ª economía mundial',
      'Portugal: puerta a la UE',
      'Comunidades en EE.UU. y UK',
      'Mercados emergentes lusófonos',
      'Cercanía cultural al español',
    ],
    usos: [
      'Negocios y empleo con Brasil, el mayor mercado de América Latina',
      'Trabajar o residir en Portugal con acceso a la UE',
      'Turismo, gastronomía y cultura en el mundo lusófono',
      'Acceso a mercados emergentes de Angola, Mozambique y Cabo Verde',
      'Mayor empleabilidad en empresas con presencia iberoamericana',
    ],
  },
  chino_japones: {
    key: 'chino_japones',
    emoji: '🀄',
    titulo: 'Chino Mandarín / Japonés',
    subtitulo: 'Para quienes buscan diferenciarse, con interés en Asia o tecnología',
    descripcion:
      'Tu perfil apunta a los idiomas asiáticos. El chino mandarín es el idioma nativo más hablado del mundo (900 M+) y la segunda economía global. El japonés abre las puertas a una de las culturas tecnológicas más avanzadas y creativas del planeta. Ambos requieren una inversión significativa de tiempo, pero ofrecen una diferenciación laboral enorme en mercados con poca competencia hispanohablante.',
    caracteristicas: [
      'Chino: 2.ª economía del mundo',
      'Japonés: 3.ª economía del mundo',
      'Diferenciación laboral máxima',
      'Poca competencia hispanohablante',
      'Sectores tech, manufactura, trade',
      'Escritura: kanji/hanzi (1-2 años)',
      'Muy valorado en comercio y logística',
      'Alto nivel en 3-5 años',
    ],
    usos: [
      'Negocios e importación/exportación con China y Japón',
      'Empleo en empresas multinacionales asiáticas en España',
      'Acceso a tecnología, videojuegos, anime y cultura asiática en original',
      'Docencia, traducción y mediación intercultural especializada',
      'Diferenciación radical en cualquier perfil profesional',
    ],
  },
};

const COLOR_BARRAS: Record<RecomendacionKey, string> = {
  ingles: '#2E86AB',
  frances: '#0057a8',
  aleman: '#4a4a4a',
  portugues: '#48A9A6',
  chino_japones: '#c0392b',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SelectorIdioma() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const opcionSeleccionada = respuestas[preguntaActual];
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const progresoPercent = Math.round(
    (respuestas.filter((r) => r !== null).length / totalPreguntas) * 100
  );

  // Calcular puntuaciones
  const calcularPuntuaciones = (): Record<RecomendacionKey, number> => {
    const puntos: Record<RecomendacionKey, number> = {
      ingles: 0,
      frances: 0,
      aleman: 0,
      portugues: 0,
      chino_japones: 0,
    };
    respuestas.forEach((idxOpcion, idxPregunta) => {
      if (idxOpcion === null) return;
      const opcion = PREGUNTAS[idxPregunta].opciones[idxOpcion];
      (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
        puntos[key] += opcion.pesos[key] ?? 0;
      });
    });
    return puntos;
  };

  const obtenerGanador = (puntos: Record<RecomendacionKey, number>): RecomendacionKey => {
    return (Object.keys(puntos) as RecomendacionKey[]).reduce((a, b) =>
      puntos[a] >= puntos[b] ? a : b
    );
  };

  // Handlers
  const seleccionarOpcion = (idx: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = idx;
    setRespuestas(nuevasRespuestas);
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  };

  const irSiguiente = () => {
    if (opcionSeleccionada === null) return;
    if (esUltimaPregunta) {
      setMostrarResultado(true);
    } else {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const reiniciar = () => {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setMostrarResultado(false);
  };

  // Resultado
  const renderResultado = () => {
    const puntos = calcularPuntuaciones();
    const ganadorKey = obtenerGanador(puntos);
    const recomendacion = RECOMENDACIONES[ganadorKey];
    const maxPuntos = Math.max(...(Object.values(puntos) as number[]));

    const etiquetas: Record<RecomendacionKey, string> = {
      ingles: 'Inglés',
      frances: 'Francés',
      aleman: 'Alemán',
      portugues: 'Portugués',
      chino_japones: 'Chino/Japonés',
    };

    return (
      <section className={styles.resultado} aria-label="Resultado del test">
        <div className={`${styles.resultadoCard} ${styles[`recomendacion_${ganadorKey}`]}`}>
          <div className={styles.resultadoHeader}>
            <span className={styles.resultadoEmoji} aria-hidden="true">
              {recomendacion.emoji}
            </span>
            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
          </div>

          <div className={styles.resultadoBody}>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            {/* Puntuación detallada */}
            <div className={styles.puntuacionDetalle}>
              <p className={styles.puntuacionTitulo}>Tu afinidad por idioma</p>
              {(Object.keys(RECOMENDACIONES) as RecomendacionKey[]).map((key) => (
                <div key={key} className={styles.puntuacionFila}>
                  <span className={styles.puntuacionEtiqueta}>{etiquetas[key]}</span>
                  <div className={styles.puntuacionBarraWrap}>
                    <div
                      className={styles.puntuacionBarra}
                      style={{
                        width: maxPuntos > 0 ? `${(puntos[key] / maxPuntos) * 100}%` : '0%',
                        backgroundColor: COLOR_BARRAS[key],
                      }}
                    />
                  </div>
                  <span className={styles.puntuacionValor}>{puntos[key]}</span>
                </div>
              ))}
            </div>

            {/* Características del idioma */}
            <p className={styles.usosTitulo}>Por qué este idioma para ti</p>
            <div className={styles.caracteristicasGrid}>
              {recomendacion.caracteristicas.map((caract) => (
                <div key={caract} className={styles.caracteristicaCard}>
                  {caract}
                </div>
              ))}
            </div>

            {/* Usos principales */}
            <div className={styles.usosSection}>
              <p className={styles.usosTitulo}>Principales usos y oportunidades</p>
              <ul className={styles.usosLista} aria-label="Usos principales del idioma">
                {recomendacion.usos.map((uso) => (
                  <li key={uso}>{uso}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={reiniciar}
              className={styles.btnReiniciar}
            >
              Repetir el test
            </button>
          </div>
        </div>
      </section>
    );
  };

  // Test
  const renderTest = () => (
    <section className={styles.testSection} aria-label="Test de selección de idioma">
      {/* Barra de progreso */}
      <div className={styles.progreso}>
        <span className={styles.progresoLabel}>
          Pregunta {preguntaActual + 1} de {totalPreguntas} — {progresoPercent}% completado
        </span>
        <div
          className={styles.progresoBar}
          role="progressbar"
          aria-valuenow={progresoPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progresoFill} style={{ width: `${progresoPercent}%` }} />
        </div>
      </div>

      {/* Tarjeta de pregunta */}
      <div className={styles.pregunta}>
        <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1}</p>
        <p className={styles.preguntaTexto} id={`pregunta-${pregunta.id}`}>
          {pregunta.texto}
        </p>

        <div className={styles.opciones} role="group" aria-labelledby={`pregunta-${pregunta.id}`}>
          {pregunta.opciones.map((opcion, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.opcion}${opcionSeleccionada === idx ? ` ${styles.seleccionada}` : ''}`}
              onClick={() => seleccionarOpcion(idx)}
              aria-pressed={opcionSeleccionada === idx}
            >
              <span className={styles.opcionIcono} aria-hidden="true">
                {opcion.icono}
              </span>
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación */}
      <div className={styles.navegacion}>
        <button
          type="button"
          className={styles.btnAnterior}
          onClick={irAnterior}
          disabled={preguntaActual === 0}
        >
          ← Anterior
        </button>

        {esUltimaPregunta ? (
          <button
            type="button"
            className={styles.btnResultado}
            onClick={irSiguiente}
            disabled={opcionSeleccionada === null}
            aria-describedby="instruccion-resultado"
          >
            Ver mi resultado →
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnSiguiente}
            onClick={irSiguiente}
            disabled={opcionSeleccionada === null}
          >
            Siguiente →
          </button>
        )}
      </div>
      {esUltimaPregunta && opcionSeleccionada === null && (
        <p
          id="instruccion-resultado"
          style={{
            textAlign: 'right',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
          }}
        >
          Selecciona una opción para ver el resultado
        </p>
      )}
    </section>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué idioma extranjero deberías aprender?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir qué idioma se adapta mejor a tus objetivos
          personales, laborales y de viaje: inglés, francés, alemán, portugués o chino/japonés.
        </p>
      </header>

      <LegalNotice />

      {mostrarResultado ? renderResultado() : renderTest()}

      <DisclaimerCard variant="educational" severity="low" />

      <EducationalSection
        title="Qué idioma aprender según tus objetivos: guía completa"
        subtitle="Comparativa de los 5 idiomas más útiles para hispanohablantes en España"
      >
        <h3>Inglés: el mínimo imprescindible para cualquier carrera</h3>
        <p>
          El inglés sigue siendo el idioma global por excelencia. Se usa como lengua franca en
          tecnología, ciencia, negocios internacionales y turismo. Si aún no tienes un nivel B2,
          el inglés debe ser tu primera prioridad independientemente de cualquier otro objetivo.
          La Unión Europea sitúa el inglés como la lengua más hablada como segunda lengua en todos
          sus estados miembros.
        </p>
        <ul>
          <li>
            <strong>Tiempo para nivel comunicativo:</strong> 12-18 meses con estudio constante (3-5
            h/semana) si partes de cero. Mucho menos si ya tienes base.
          </li>
          <li>
            <strong>Certificaciones reconocidas:</strong> Cambridge (B2 First, C1 Advanced), IELTS,
            TOEFL, TOEIC. El B2 Cambridge es el más solicitado en empleo en España.
          </li>
          <li>
            <strong>Recursos gratuitos en español:</strong> British Council, BBC Learning English,
            Duolingo, apps de idiomas con itinerario estructurado.
          </li>
        </ul>

        <h3>Alemán: el idioma del empleo europeo de alta cualificación</h3>
        <p>
          Alemania es la primera economía de Europa y tiene una de las tasas de desempleo más bajas
          de la UE. El alemán es el idioma más hablado como lengua materna en Europa (95 millones)
          y es el segundo idioma más publicado en publicaciones científicas. El mercado DACH
          (Alemania, Austria, Suiza) ofrece sueldos significativamente más altos que la media
          española para perfiles cualificados.
        </p>
        <ul>
          <li>
            <strong>Dificultad:</strong> Media-alta para hispanohablantes. El sistema de casos
            (nominativo, acusativo, dativo, genitivo) y el género de los sustantivos exigen
            esfuerzo sostenido.
          </li>
          <li>
            <strong>Certificaciones:</strong> Goethe-Institut (B1/B2), TestDaF (para universidades
            alemanas), telc Deutsch.
          </li>
          <li>
            <strong>Tiempo estimado:</strong> 18-24 meses para nivel B2 con 7-10 h/semana.
          </li>
        </ul>

        <h3>Francés: idioma diplomático y puerta a África</h3>
        <p>
          El francés es el único idioma presente en los 5 continentes. Es lengua oficial en 29
          países y lengua de trabajo en la ONU, la UE, la Unión Africana y la Cruz Roja. Tiene
          especial relevancia en diplomacia, derecho internacional, cooperación al desarrollo y en
          el sector del lujo (moda, gastronomía, turismo de alto nivel).
        </p>
        <ul>
          <li>
            <strong>África francófona:</strong> Con más de 300 millones de hablantes en 2023 y
            crecimiento demográfico acelerado, el África francófona es uno de los mercados con
            mayor potencial del siglo XXI.
          </li>
          <li>
            <strong>Cercanía al español:</strong> Comparte raíces latinas, lo que facilita el
            aprendizaje para hispanohablantes. Nivel B2 alcanzable en 12-18 meses.
          </li>
          <li>
            <strong>Certificaciones:</strong> DELF (B1/B2), DALF (C1/C2), TCF.
          </li>
        </ul>

        <h3>Portugués: el idioma más rentable por esfuerzo invertido</h3>
        <p>
          Para un hispanohablante, el portugués es el idioma con mejor ratio esfuerzo/beneficio.
          Su cercanía estructural con el español permite alcanzar un nivel comunicativo en pocos
          meses. Brasil es la novena economía mundial y el mayor país de América Latina, con un
          enorme potencial de negocio y una vibrante escena cultural y tecnológica.
        </p>
        <ul>
          <li>
            <strong>Variedades:</strong> El portugués europeo y el brasileño tienen diferencias
            fonéticas notables, pero son mutuamente inteligibles. Para negocios con Brasil, el
            portugués brasileño es la referencia.
          </li>
          <li>
            <strong>Tiempo estimado:</strong> Nivel comunicativo en 4-8 meses para
            hispanohablantes con dedicación.
          </li>
          <li>
            <strong>Certificaciones:</strong> CELPE-Bras (Brasil), CAPLE (Portugal).
          </li>
        </ul>

        <h3>Chino mandarín y japonés: idiomas de alta diferenciación</h3>
        <p>
          Estos idiomas no son para todo el mundo, pero ofrecen una diferenciación laboral
          extraordinaria. China es ya la segunda economía mundial y aspira a ser la primera. Japón
          es la tercera, con sectores tecnológicos y creativos únicos. La principal barrera es el
          sistema de escritura: el chino usa hanzi y el japonés combina kanji, hiragana y
          katakana.
        </p>
        <ul>
          <li>
            <strong>Chino mandarín:</strong> ~900 millones de hablantes nativos. La pronunciación
            tonal (4 tonos) es la mayor dificultad inicial. El HSK (Hanyu Shuiping Kaoshi) es la
            certificación oficial.
          </li>
          <li>
            <strong>Japonés:</strong> Cultura tecnológica y creativa única (anime, videojuegos,
            robótica). El JLPT (Japanese Language Proficiency Test) es la certificación estándar.
          </li>
          <li>
            <strong>Tiempo estimado:</strong> 3-5 años para nivel profesional con 15+ h/semana. No
            apto para quien busca resultados rápidos.
          </li>
        </ul>

        <div className={styles.warningBox}>
          <strong>Nota importante:</strong> Este test ofrece una orientación basada en tus
          respuestas, pero la elección del idioma ideal es muy personal. Considera factores como
          tu motivación intrínseca, los recursos disponibles en tu zona y tus circunstancias
          concretas antes de comprometerte con un idioma. La constancia es más importante que la
          elección perfecta.
        </div>

        <h3>Cómo aprender un idioma de forma eficaz: claves científicas</h3>
        <ul>
          <li>
            <strong>Exposición diaria:</strong> 20-30 minutos al día son más eficaces que 3 horas
            una vez por semana. La regularidad es la clave.
          </li>
          <li>
            <strong>Método de inmersión gradual:</strong> Cambiar el idioma del móvil, escuchar
            podcasts en el idioma objetivo y ver series con subtítulos aceleran el aprendizaje.
          </li>
          <li>
            <strong>Hablar desde el primer día:</strong> El miedo al error es el mayor obstáculo.
            Plataformas como iTalki, Tandem o HelloTalk permiten practicar con nativos desde el
            nivel A1.
          </li>
          <li>
            <strong>Vocabulario de alta frecuencia:</strong> Las 1.000 palabras más comunes de
            cualquier idioma representan el 85% del vocabulario usado en conversaciones cotidianas.
            Dominar ese núcleo es el primer objetivo.
          </li>
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-idioma')} />
      <ShareCard appName="selector-idioma" />
      <Footer appName="selector-idioma" />
    </div>
  );
}
