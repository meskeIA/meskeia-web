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
import styles from './SelectorCarreraUniversitaria.module.css';

// ============================================================
// TIPOS
// ============================================================

type RecomendacionKey = 'ciencias' | 'salud' | 'humanidades' | 'tecnologia' | 'arte';

interface OpcionPregunta {
  texto: string;
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
  ejemplosCarreras: string[];
  salidasLaborales: string[];
}

// ============================================================
// DATOS: PREGUNTAS
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuáles son tus asignaturas favoritas en el instituto?',
    opciones: [
      { texto: 'Matemáticas y física', pesos: { ciencias: 4, tecnologia: 3 } },
      { texto: 'Biología y química', pesos: { salud: 4, ciencias: 3 } },
      { texto: 'Historia, filosofía y lengua', pesos: { humanidades: 4 } },
      { texto: 'Informática y tecnología', pesos: { tecnologia: 5 } },
      { texto: 'Plástica, música y dibujo', pesos: { arte: 4 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cómo prefieres resolver problemas?',
    opciones: [
      { texto: 'Con lógica, datos y análisis cuantitativo', pesos: { ciencias: 4, tecnologia: 3 } },
      { texto: 'Estudiando el cuerpo humano y la vida', pesos: { salud: 4 } },
      { texto: 'Interpretando textos, contextos y argumentos', pesos: { humanidades: 4 } },
      { texto: 'Programando o diseñando sistemas', pesos: { tecnologia: 4 } },
      { texto: 'Creando algo nuevo y expresivo', pesos: { arte: 4 } },
    ],
  },
  {
    id: 3,
    texto: '¿Qué tipo de trabajo futuro te atrae más?',
    opciones: [
      { texto: 'Investigación, ingeniería o industria', pesos: { ciencias: 4 } },
      { texto: 'Cuidar personas y mejorar su salud', pesos: { salud: 5 } },
      { texto: 'Enseñar, comunicar o trabajar en política/cultura', pesos: { humanidades: 4 } },
      { texto: 'Desarrollar tecnología o software', pesos: { tecnologia: 5 } },
      { texto: 'Crear objetos, imágenes o experiencias', pesos: { arte: 4 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cómo te sientes con las matemáticas avanzadas?',
    opciones: [
      { texto: 'Son mi punto fuerte', pesos: { ciencias: 4, tecnologia: 3 } },
      { texto: 'Las llevo bien sin ser lo mío', pesos: { ciencias: 2, tecnologia: 2 } },
      { texto: 'Regular, prefiero otras materias', pesos: { humanidades: 2, salud: 1 } },
      { texto: 'Mal, claramente no es mi área', pesos: { humanidades: 3, arte: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Cuánta importancia le das a las salidas laborales y el sueldo?',
    opciones: [
      { texto: 'Es lo más importante, quiero alta empleabilidad', pesos: { tecnologia: 4, salud: 3 } },
      { texto: 'Es importante pero no lo único', pesos: { ciencias: 2, salud: 2 } },
      { texto: 'Me importa la vocación más que el sueldo', pesos: { humanidades: 3, arte: 3 } },
      { texto: 'Busco emprender o crear algo propio', pesos: { tecnologia: 3, arte: 2 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuántos años de estudios estás dispuesto a afrontar?',
    opciones: [
      { texto: 'Quiero acabar cuanto antes', pesos: { tecnologia: 3, arte: 2 } },
      { texto: 'Grado estándar (4 años) está bien', pesos: { ciencias: 2, humanidades: 2 } },
      { texto: 'Acepto posgrado o máster', pesos: { ciencias: 2, salud: 2 } },
      {
        texto: 'Estoy dispuesto a estudiar 6+ años (medicina, arquitectura)',
        pesos: { salud: 4, ciencias: 2 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Cómo te describes en términos de habilidades?',
    opciones: [
      { texto: 'Analítico, preciso y metódico', pesos: { ciencias: 4, tecnologia: 3 } },
      { texto: 'Empático, comunicativo y orientado a personas', pesos: { salud: 4, humanidades: 3 } },
      { texto: 'Crítico, reflexivo y amante del debate', pesos: { humanidades: 4 } },
      { texto: 'Creativo e innovador con la tecnología', pesos: { tecnologia: 4 } },
      { texto: 'Artístico, visual y expresivo', pesos: { arte: 4 } },
    ],
  },
  {
    id: 8,
    texto: '¿Qué tipo de entorno laboral prefieres?',
    opciones: [
      { texto: 'Laboratorio, planta industrial o campo', pesos: { ciencias: 4 } },
      { texto: 'Hospital, clínica o entorno de salud', pesos: { salud: 5 } },
      { texto: 'Universidad, medios, administración o ONG', pesos: { humanidades: 4 } },
      { texto: 'Empresa tecnológica, startup o teletrabajo', pesos: { tecnologia: 4 } },
      { texto: 'Estudio, agencia creativa o mundo cultural', pesos: { arte: 4 } },
    ],
  },
  {
    id: 9,
    texto: '¿Te interesa el impacto social o humanitario de tu trabajo?',
    opciones: [
      { texto: 'Sí, quiero ayudar directamente a personas', pesos: { salud: 4, humanidades: 3 } },
      { texto: 'Sí, a través de innovación o tecnología', pesos: { tecnologia: 3, ciencias: 2 } },
      { texto: 'Sí, a través de la cultura y la educación', pesos: { humanidades: 4, arte: 3 } },
      { texto: 'Prefiero el impacto técnico y económico', pesos: { ciencias: 3, tecnologia: 3 } },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes alguna actividad extraescolar o hobby relevante?',
    opciones: [
      { texto: 'Robótica, programación o electrónica', pesos: { tecnologia: 4 } },
      { texto: 'Voluntariado sanitario o deportes', pesos: { salud: 3 } },
      { texto: 'Lectura, escritura o debates', pesos: { humanidades: 4 } },
      { texto: 'Videojuegos, diseño gráfico o música', pesos: { arte: 3, tecnologia: 2 } },
      { texto: 'Experimentos, astronomía o naturaleza', pesos: { ciencias: 4 } },
    ],
  },
];

// ============================================================
// DATOS: RECOMENDACIONES
// ============================================================

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  ciencias: {
    key: 'ciencias',
    emoji: '🔬',
    titulo: 'Ciencias e Ingeniería',
    subtitulo: 'Análisis, precisión y resolución de problemas complejos',
    descripcion:
      'Tu perfil encaja con las ramas científicas e ingenieriles. Tienes facilidad para el pensamiento abstracto, el cálculo y la resolución metódica de problemas. El mundo de las matemáticas, la física, la química y las ingenierías te ofrece una gran variedad de salidas en industria, investigación y tecnología aplicada.',
    ejemplosCarreras: [
      'Matemáticas',
      'Física',
      'Química',
      'Biología',
      'Ing. Industrial',
      'Ing. Aeronáutica',
      'Ing. Química',
      'Ing. Civil',
      'Geología',
      'Estadística',
    ],
    salidasLaborales: [
      'Investigación y desarrollo (I+D) en empresas e instituciones',
      'Ingeniería en sectores industrial, energético y aeroespacial',
      'Docencia e investigación universitaria',
      'Consultoría técnica y gestión de proyectos',
      'Sector medioambiental y sostenibilidad',
    ],
  },
  salud: {
    key: 'salud',
    emoji: '🩺',
    titulo: 'Ciencias de la Salud',
    subtitulo: 'Vocación de ayuda, ciencia aplicada y alta demanda laboral',
    descripcion:
      'Tu perfil muestra una clara orientación hacia las personas y la salud. Las carreras de este ámbito combinan ciencias biológicas con trato humano directo. Requieren dedicación y años de formación, pero ofrecen una de las mayores demandas laborales del mercado español y europeo.',
    ejemplosCarreras: [
      'Medicina',
      'Enfermería',
      'Farmacia',
      'Fisioterapia',
      'Psicología',
      'Odontología',
      'Terapia Ocupacional',
      'Nutrición',
      'Óptica y Optometría',
      'Veterinaria',
    ],
    salidasLaborales: [
      'Sistema sanitario público y privado (hospitales, clínicas, centros de salud)',
      'Farmacia comunitaria, hospitalaria e industria farmacéutica',
      'Psicología clínica, educativa y organizacional',
      'Investigación biomédica y ensayos clínicos',
      'Cooperación internacional y ONGs sanitarias',
    ],
  },
  humanidades: {
    key: 'humanidades',
    emoji: '📚',
    titulo: 'Humanidades y Ciencias Sociales',
    subtitulo: 'Pensamiento crítico, comunicación y comprensión del mundo',
    descripcion:
      'Tu perfil es reflexivo, comunicativo y orientado a entender la sociedad, la cultura y las personas. Las humanidades y ciencias sociales ofrecen una formación versátil que abre puertas en educación, comunicación, política, derecho, trabajo social y muchos otros sectores donde la comprensión humana es clave.',
    ejemplosCarreras: [
      'Derecho',
      'Historia',
      'Periodismo',
      'Sociología',
      'Educación',
      'Filosofía',
      'Relaciones Internacionales',
      'Trabajo Social',
      'Comunicación Audiovisual',
      'Filología',
    ],
    salidasLaborales: [
      'Docencia en educación secundaria y universidad',
      'Periodismo, medios de comunicación y marketing de contenidos',
      'Administración pública, política y diplomatica',
      'Gestión cultural, patrimonio y turismo cultural',
      'Trabajo social, ONGs y cooperación al desarrollo',
    ],
  },
  tecnologia: {
    key: 'tecnologia',
    emoji: '💻',
    titulo: 'Tecnología e Informática',
    subtitulo: 'La rama con mayor demanda y mejores sueldos del mercado actual',
    descripcion:
      'Tu perfil encaja perfectamente con el mundo digital. La tecnología y la informática son hoy las disciplinas con mayor demanda laboral global, mejores salarios de entrada y mayor proyección futura. Si te apasiona construir sistemas, resolver problemas con código o diseñar la tecnología del futuro, esta es tu rama.',
    ejemplosCarreras: [
      'Ing. Informática',
      'Ing. Software',
      'Telecomunicaciones',
      'Inteligencia Artificial',
      'Ciberseguridad',
      'Ciencia de Datos',
      'Ing. de Sistemas',
      'Videojuegos',
      'Robótica',
      'Doble Grado STEM+Informática',
    ],
    salidasLaborales: [
      'Desarrollo de software en empresas tecnológicas y startups',
      'Inteligencia artificial, machine learning y ciencia de datos',
      'Ciberseguridad e infraestructuras IT',
      'Teletrabajo y trabajo remoto para empresas internacionales',
      'Emprendimiento tecnológico y creación de productos digitales',
    ],
  },
  arte: {
    key: 'arte',
    emoji: '🎨',
    titulo: 'Arte, Diseño y Creatividad',
    subtitulo: 'Expresión, estética y creación de experiencias únicas',
    descripcion:
      'Tu perfil destaca por la creatividad, la sensibilidad estética y la capacidad de expresarte visualmente o artísticamente. Las carreras de arte y diseño requieren talento, esfuerzo en la construcción de un portfolio y, con frecuencia, una mentalidad emprendedora. Las salidas laborales son diversas aunque más competitivas.',
    ejemplosCarreras: [
      'Bellas Artes',
      'Diseño Gráfico',
      'Diseño de Moda',
      'Arquitectura',
      'Diseño de Interiores',
      'Com. Audiovisual',
      'Publicidad',
      'Animación 3D',
      'Diseño de Producto',
      'Fotografía',
    ],
    salidasLaborales: [
      'Diseño gráfico y dirección de arte en agencias y estudios creativos',
      'Arquitectura y diseño de interiores y espacios',
      'Sector audiovisual: cine, televisión, videojuegos y animación',
      'Publicidad, branding y comunicación visual para marcas',
      'Docencia artística y gestión de proyectos culturales',
    ],
  },
};

const COLOR_BARRAS: Record<RecomendacionKey, string> = {
  ciencias: '#2E86AB',
  salud: '#e74c3c',
  humanidades: '#8b7355',
  tecnologia: '#48A9A6',
  arte: '#e8a020',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SelectorCarreraUniversitaria() {
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
      ciencias: 0,
      salud: 0,
      humanidades: 0,
      tecnologia: 0,
      arte: 0,
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

    return (
      <section className={styles.resultadoSection} aria-label="Resultado del test">
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
              <p className={styles.puntuacionTitulo}>Tu afinidad por rama</p>
              {(Object.keys(RECOMENDACIONES) as RecomendacionKey[]).map((key) => (
                <div key={key} className={styles.puntuacionFila}>
                  <span className={styles.puntuacionEtiqueta}>{RECOMENDACIONES[key].titulo}</span>
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

            {/* Ejemplos de carreras */}
            <p className={styles.salidasTitulo}>Carreras de ejemplo</p>
            <div className={styles.carrerasGrid}>
              {recomendacion.ejemplosCarreras.map((carrera) => (
                <div key={carrera} className={styles.carreraCard}>
                  {carrera}
                </div>
              ))}
            </div>

            {/* Salidas laborales */}
            <div className={styles.salidasSection}>
              <p className={styles.salidasTitulo}>Salidas laborales principales</p>
              <ul className={styles.salidasLista} aria-label="Salidas laborales">
                {recomendacion.salidasLaborales.map((salida) => (
                  <li key={salida}>{salida}</li>
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
    <section className={styles.testSection} aria-label="Test de orientación universitaria">
      {/* Barra de progreso */}
      <div className={styles.progreso}>
        <span className={styles.progresoLabel}>
          Pregunta {preguntaActual + 1} de {totalPreguntas} — {progresoPercent}% completado
        </span>
        <div className={styles.progresoBar} role="progressbar" aria-valuenow={progresoPercent} aria-valuemin={0} aria-valuemax={100}>
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
              className={`${styles.opcionBtn}${opcionSeleccionada === idx ? ` ${styles.selected}` : ''}`}
              onClick={() => seleccionarOpcion(idx)}
              aria-pressed={opcionSeleccionada === idx ? true : false}
            >
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
        <p id="instruccion-resultado" style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Selecciona una opción para ver el resultado
        </p>
      )}
    </section>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué carrera universitaria te conviene?</h1>
        <p className={styles.heroSubtitle}>
          Test orientativo de 10 preguntas para descubrir qué rama de estudios (ciencias, salud,
          humanidades, tecnología o arte) se adapta mejor a tu perfil y vocación.
        </p>
      </header>

      <LegalNotice />

      {mostrarResultado ? renderResultado() : renderTest()}

      <DisclaimerCard variant="educational" severity="low" />

      <EducationalSection
        title="Ramas universitarias en España: guía orientativa"
        subtitle="Qué estudiar según tus habilidades, intereses y metas profesionales"
      >
        <h3>Las 5 grandes ramas universitarias</h3>
        <p>
          El sistema universitario español organiza las titulaciones en cinco grandes ámbitos:
        </p>
        <ul>
          <li>
            <strong>Ciencias e Ingeniería:</strong> Matemáticas, Física, Química, Biología,
            Geología y todas las ingenierías. Alta base matemática y científica.
          </li>
          <li>
            <strong>Ciencias de la Salud:</strong> Medicina, Enfermería, Farmacia, Fisioterapia,
            Psicología, Odontología y carreras afines. Vocación de servicio y fuerte demanda.
          </li>
          <li>
            <strong>Humanidades y Ciencias Sociales:</strong> Derecho, Historia, Periodismo,
            Sociología, Educación, Filosofía, Relaciones Internacionales. Gran versatilidad.
          </li>
          <li>
            <strong>Tecnología e Informática:</strong> Informática, Ingeniería de Software,
            Telecomunicaciones, IA, Ciberseguridad. La rama con mayor demanda laboral actualmente.
          </li>
          <li>
            <strong>Arte, Diseño y Creatividad:</strong> Bellas Artes, Diseño Gráfico,
            Arquitectura, Comunicación Audiovisual, Publicidad. Requiere portfolio y actitud
            emprendedora.
          </li>
        </ul>

        <h3>Vocación vs. empleabilidad: cómo equilibrarlas</h3>
        <p>
          Elegir carrera implica equilibrar dos factores que a veces entran en tensión:
        </p>
        <ul>
          <li>
            <strong>Vocación:</strong> lo que te apasiona, donde disfrutas aprendiendo y sientes
            que encajas. Estudiar algo que te motiva mejora el rendimiento académico y la
            satisfacción laboral a largo plazo.
          </li>
          <li>
            <strong>Empleabilidad:</strong> las salidas laborales, la demanda del mercado y el
            nivel salarial esperado. Hoy, las titulaciones STEM (ciencias, tecnología, ingeniería
            y matemáticas) tienen ventaja en empleabilidad y retribución.
          </li>
        </ul>
        <p>
          La solución no es elegir solo uno: busca la intersección entre lo que te gusta y lo que
          tiene demanda, o considera añadir especializaciones o posgrados que aumenten la
          empleabilidad de tu carrera base.
        </p>

        <div className={styles.warningBox}>
          <strong>Nota importante:</strong> Este test es una orientación basada en intereses y
          habilidades generales. La decisión de qué estudiar es muy personal y compleja. Te
          recomendamos complementarlo con orientación vocacional profesional y visitar las jornadas
          de puertas abiertas de las universidades de tu comunidad autónoma antes de tomar una
          decisión definitiva.
        </div>

        <h3>Cómo funciona la PAU/EVAU y la nota de corte en España</h3>
        <p>
          Para acceder a la universidad española, la mayoría de estudiantes pasan por la{' '}
          <strong>EVAU (Evaluación de Acceso a la Universidad)</strong>, también llamada
          selectividad o PAU en algunas comunidades. La nota final de admisión se calcula como:
        </p>
        <ul>
          <li>
            <strong>Nota de bachillerato (60%):</strong> la media de los dos cursos de bachillerato.
          </li>
          <li>
            <strong>Nota EVAU (40%):</strong> resultado de los exámenes de acceso. Con las materias
            de modalidad o de opción se puede subir la nota ponderada hasta 14.
          </li>
        </ul>
        <p>
          Cada universidad y titulación tiene una{' '}
          <strong>nota de corte</strong> diferente, que varía cada año según la demanda. Medicina y
          algunas ingenierías suelen tener las notas más altas. Consulta el portal de tu comunidad
          autónoma o el buscador de titulaciones del MEFP para conocer las notas oficiales.
        </p>

        <h3>La FP como alternativa válida y a veces más directa al empleo</h3>
        <p>
          No olvides la <strong>Formación Profesional (FP)</strong> como alternativa o complemento
          a la universidad. Los ciclos de grado superior ofrecen:
        </p>
        <ul>
          <li>Formación más práctica y orientada a un perfil laboral concreto.</li>
          <li>Menor duración (2 años) y menor coste económico.</li>
          <li>Alta inserción laboral en sectores como informática, sanidad, administración o electrónica.</li>
          <li>Posibilidad de acceder después a la universidad con reconocimiento de créditos.</li>
        </ul>
        <p>
          En España, sectores como la informática, la sanidad auxiliar o la electrónica industrial
          tienen ciclos de FP con tasas de inserción laboral superiores al 80% en el primer año
          tras finalizar.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-carrera-universitaria')} />
      <ShareCard appName="selector-carrera-universitaria" />
      <Footer appName="selector-carrera-universitaria" />
    </div>
  );
}
