'use client';

import { useState } from 'react';
import styles from './SelectorActividadesMovilidad.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type NivelMovilidad = 'alta' | 'media' | 'reducida' | 'muy_reducida';

interface Pregunta {
  id: string;
  texto: string;
  opciones: { valor: number; texto: string }[];
}

interface Actividad {
  nombre: string;
  icono: string;
  categoria: 'fisica' | 'cognitiva' | 'social' | 'creativa';
  descripcion: string;
  frecuencia: string;
  beneficios: string[];
  niveles: NivelMovilidad[];
}

// ─── Preguntas del test ───────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'caminar',
    texto: '¿Puedes caminar sin ayuda durante 15 minutos seguidos?',
    opciones: [
      { valor: 3, texto: 'Sí, sin dificultad' },
      { valor: 2, texto: 'Sí, pero con algo de esfuerzo' },
      { valor: 1, texto: 'Solo con bastón o apoyo' },
      { valor: 0, texto: 'No, necesito silla de ruedas o cama' },
    ],
  },
  {
    id: 'escaleras',
    texto: '¿Puedes subir un piso de escaleras?',
    opciones: [
      { valor: 3, texto: 'Sí, sin agarrarme' },
      { valor: 2, texto: 'Sí, agarrándome a la barandilla' },
      { valor: 1, texto: 'Solo con ayuda de otra persona' },
      { valor: 0, texto: 'No puedo' },
    ],
  },
  {
    id: 'equilibrio',
    texto: '¿Puedes mantenerte de pie sobre un solo pie 10 segundos?',
    opciones: [
      { valor: 3, texto: 'Sí, sin problema' },
      { valor: 2, texto: 'Sí, con algo de inestabilidad' },
      { valor: 1, texto: 'Solo apoyándome en algo' },
      { valor: 0, texto: 'No puedo' },
    ],
  },
  {
    id: 'brazos',
    texto: '¿Puedes levantar los brazos por encima de la cabeza?',
    opciones: [
      { valor: 3, texto: 'Sí, sin dolor ni limitación' },
      { valor: 2, texto: 'Sí, con algo de molestia' },
      { valor: 1, texto: 'Solo hasta la altura del hombro' },
      { valor: 0, texto: 'Muy limitado' },
    ],
  },
  {
    id: 'sentarse',
    texto: '¿Puedes levantarte de una silla sin usar las manos?',
    opciones: [
      { valor: 3, texto: 'Sí, fácilmente' },
      { valor: 2, texto: 'Sí, pero me cuesta' },
      { valor: 1, texto: 'Solo apoyándome con las manos' },
      { valor: 0, texto: 'Necesito ayuda de alguien' },
    ],
  },
  {
    id: 'fatiga',
    texto: '¿Cómo es tu nivel de energía general?',
    opciones: [
      { valor: 3, texto: 'Bueno, activo/a la mayor parte del día' },
      { valor: 2, texto: 'Aceptable, pero necesito descansos' },
      { valor: 1, texto: 'Me fatigo con facilidad' },
      { valor: 0, texto: 'Muy bajo, paso la mayor parte sentado/a' },
    ],
  },
  {
    id: 'dolor',
    texto: '¿Tienes dolor articular o muscular habitual?',
    opciones: [
      { valor: 3, texto: 'No tengo dolor' },
      { valor: 2, texto: 'Leve, no me limita' },
      { valor: 1, texto: 'Moderado, limita algunas actividades' },
      { valor: 0, texto: 'Intenso, limita mucho mi movimiento' },
    ],
  },
  {
    id: 'social',
    texto: '¿Sales de casa habitualmente?',
    opciones: [
      { valor: 3, texto: 'Sí, a diario' },
      { valor: 2, texto: 'Varias veces por semana' },
      { valor: 1, texto: 'Pocas veces, me cuesta salir' },
      { valor: 0, texto: 'Casi nunca' },
    ],
  },
];

// ─── Catálogo de actividades ──────────────────────────────────────────────────

const CATEGORIAS_LABEL: Record<Actividad['categoria'], { label: string; color: string }> = {
  fisica: { label: 'Física', color: '#27AE60' },
  cognitiva: { label: 'Cognitiva', color: '#2E86AB' },
  social: { label: 'Social', color: '#E67E22' },
  creativa: { label: 'Creativa', color: '#8E44AD' },
};

const ACTIVIDADES: Actividad[] = [
  // ── Movilidad alta ──
  { nombre: 'Caminatas al aire libre', icono: '🚶', categoria: 'fisica', descripcion: 'Paseos de 30-60 min por parques o rutas accesibles. Mejora cardiovascular y ánimo.', frecuencia: '4-5 veces/semana', beneficios: ['Cardiovascular', 'Estado de ánimo', 'Vitamina D'], niveles: ['alta', 'media'] },
  { nombre: 'Natación o aquagym', icono: '🏊', categoria: 'fisica', descripcion: 'Ejercicio en agua: bajo impacto articular, trabaja todo el cuerpo. Ideal para artritis.', frecuencia: '2-3 veces/semana', beneficios: ['Articulaciones', 'Fuerza muscular', 'Flexibilidad'], niveles: ['alta', 'media', 'reducida'] },
  { nombre: 'Baile (salón, sevillanas, zumba senior)', icono: '💃', categoria: 'fisica', descripcion: 'Combina ejercicio, coordinación, memoria y socialización. Adaptable a todos los niveles.', frecuencia: '2-3 veces/semana', beneficios: ['Coordinación', 'Memoria', 'Socialización'], niveles: ['alta', 'media'] },
  { nombre: 'Yoga o tai chi', icono: '🧘', categoria: 'fisica', descripcion: 'Trabajo de equilibrio, flexibilidad y respiración. Reduce estrés y mejora la postura.', frecuencia: '2-3 veces/semana', beneficios: ['Equilibrio', 'Flexibilidad', 'Relajación'], niveles: ['alta', 'media'] },
  { nombre: 'Ciclismo suave o bicicleta estática', icono: '🚴', categoria: 'fisica', descripcion: 'Ejercicio cardiovascular de bajo impacto. La estática elimina riesgo de caídas.', frecuencia: '3-4 veces/semana', beneficios: ['Cardiovascular', 'Piernas', 'Resistencia'], niveles: ['alta'] },

  // ── Movilidad media ──
  { nombre: 'Gimnasia de mantenimiento', icono: '🤸', categoria: 'fisica', descripcion: 'Ejercicios suaves guiados: estiramientos, fuerza ligera, equilibrio. En grupo.', frecuencia: '3 veces/semana', beneficios: ['Mantenimiento', 'Prevención caídas', 'Socialización'], niveles: ['alta', 'media'] },
  { nombre: 'Petanca o bolos', icono: '🎳', categoria: 'social', descripcion: 'Actividad social al aire libre con movimiento moderado. Fomenta la vida comunitaria.', frecuencia: '2-3 veces/semana', beneficios: ['Coordinación', 'Aire libre', 'Socialización'], niveles: ['alta', 'media'] },

  // ── Movilidad reducida ──
  { nombre: 'Ejercicios sentado (silla)', icono: '🪑', categoria: 'fisica', descripcion: 'Rutinas de fuerza y estiramiento sentado/a: brazos, piernas, cuello, espalda.', frecuencia: '4-5 veces/semana', beneficios: ['Fuerza', 'Flexibilidad', 'Circulación'], niveles: ['reducida', 'muy_reducida'] },
  { nombre: 'Ejercicios de manos y dedos', icono: '✋', categoria: 'fisica', descripcion: 'Apretar pelotas, estirar dedos, girar muñecas. Previene rigidez y mejora destreza.', frecuencia: 'A diario', beneficios: ['Destreza manual', 'Circulación', 'Artritis'], niveles: ['reducida', 'muy_reducida'] },
  { nombre: 'Ejercicios de respiración', icono: '🌬️', categoria: 'fisica', descripcion: 'Respiración diafragmática, técnicas de relajación. Mejora capacidad pulmonar.', frecuencia: 'A diario', beneficios: ['Capacidad pulmonar', 'Relajación', 'Sueño'], niveles: ['reducida', 'muy_reducida'] },

  // ── Cognitivas ──
  { nombre: 'Lectura en grupo o club de lectura', icono: '📖', categoria: 'cognitiva', descripcion: 'Leer y comentar libros en grupo. Estimula memoria, vocabulario y debate.', frecuencia: '1-2 veces/semana', beneficios: ['Memoria', 'Vocabulario', 'Socialización'], niveles: ['alta', 'media', 'reducida', 'muy_reducida'] },
  { nombre: 'Juegos de mesa y cartas', icono: '🃏', categoria: 'cognitiva', descripcion: 'Ajedrez, dominó, mus, parchís. Entrenan estrategia, cálculo mental y socialización.', frecuencia: '2-3 veces/semana', beneficios: ['Estrategia', 'Cálculo mental', 'Socialización'], niveles: ['alta', 'media', 'reducida', 'muy_reducida'] },
  { nombre: 'Pasatiempos (crucigramas, sudoku)', icono: '🧩', categoria: 'cognitiva', descripcion: 'Ejercicios de estimulación cognitiva: mantienen la agilidad mental y previenen deterioro.', frecuencia: 'A diario', beneficios: ['Agilidad mental', 'Concentración', 'Prevención deterioro'], niveles: ['alta', 'media', 'reducida', 'muy_reducida'] },
  { nombre: 'Aprender idiomas o informática', icono: '💻', categoria: 'cognitiva', descripcion: 'Cursos adaptados para mayores. Estimulan la neuroplasticidad y la autonomía digital.', frecuencia: '2-3 veces/semana', beneficios: ['Neuroplasticidad', 'Autonomía digital', 'Autoestima'], niveles: ['alta', 'media', 'reducida'] },

  // ── Sociales ──
  { nombre: 'Voluntariado', icono: '🤝', categoria: 'social', descripcion: 'Colaborar en asociaciones, bancos de alimentos, acompañamiento. Da propósito y conexión.', frecuencia: '1-2 veces/semana', beneficios: ['Propósito vital', 'Conexión social', 'Autoestima'], niveles: ['alta', 'media'] },
  { nombre: 'Excursiones y viajes organizados', icono: '🚌', categoria: 'social', descripcion: 'Viajes del Imserso o asociaciones locales. Turismo accesible y compañía.', frecuencia: 'Mensual', beneficios: ['Estimulación', 'Socialización', 'Bienestar'], niveles: ['alta', 'media'] },
  { nombre: 'Tertulias y grupos de conversación', icono: '☕', categoria: 'social', descripcion: 'Encuentros regulares para hablar de actualidad, recuerdos, aficiones. Previene aislamiento.', frecuencia: '2-3 veces/semana', beneficios: ['Prevención aislamiento', 'Memoria', 'Bienestar'], niveles: ['alta', 'media', 'reducida', 'muy_reducida'] },

  // ── Creativas ──
  { nombre: 'Pintura, dibujo o manualidades', icono: '🎨', categoria: 'creativa', descripcion: 'Talleres creativos: acuarela, punto de cruz, cerámica. Trabajan motricidad fina y expresión.', frecuencia: '1-2 veces/semana', beneficios: ['Motricidad fina', 'Expresión', 'Relajación'], niveles: ['alta', 'media', 'reducida'] },
  { nombre: 'Música (coro, instrumento)', icono: '🎵', categoria: 'creativa', descripcion: 'Cantar en coro o tocar un instrumento. Estimula memoria, coordinación y emociones.', frecuencia: '1-2 veces/semana', beneficios: ['Memoria', 'Coordinación', 'Emociones'], niveles: ['alta', 'media', 'reducida', 'muy_reducida'] },
  { nombre: 'Jardinería o huerto urbano', icono: '🌱', categoria: 'creativa', descripcion: 'Cuidar plantas, semilleros o huerto comunitario. Contacto con la naturaleza y actividad ligera.', frecuencia: '3-4 veces/semana', beneficios: ['Contacto naturaleza', 'Motricidad', 'Propósito'], niveles: ['alta', 'media'] },
];

// ─── Lógica ───────────────────────────────────────────────────────────────────

function determinarNivel(puntuacion: number): { nivel: NivelMovilidad; label: string; descripcion: string } {
  if (puntuacion >= 20) return { nivel: 'alta', label: 'Movilidad alta', descripcion: 'Tu capacidad funcional es buena. Puedes realizar la mayoría de actividades físicas adaptadas a tu edad.' };
  if (puntuacion >= 13) return { nivel: 'media', label: 'Movilidad media', descripcion: 'Tienes algunas limitaciones pero mantienes buena autonomía. Las actividades de intensidad moderada son ideales.' };
  if (puntuacion >= 6) return { nivel: 'reducida', label: 'Movilidad reducida', descripcion: 'Necesitas actividades de bajo impacto o sentadas. El ejercicio adaptado es especialmente importante para ti.' };
  return { nivel: 'muy_reducida', label: 'Movilidad muy reducida', descripcion: 'Las actividades deben ser muy suaves y adaptadas. Prioriza ejercicios sentado/a, cognitivos y sociales.' };
}

function filtrarActividades(nivel: NivelMovilidad): Actividad[] {
  return ACTIVIDADES.filter(a => a.niveles.includes(nivel));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SelectorActividadesMovilidadPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [filtroCategoria, setFiltroCategoria] = useState<Actividad['categoria'] | 'todas'>('todas');
  const testTerminado = Object.keys(respuestas).length === PREGUNTAS.length;

  const handleRespuesta = (preguntaId: string, valor: number) => {
    const nuevas = { ...respuestas, [preguntaId]: valor };
    setRespuestas(nuevas);
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const reiniciar = () => {
    setRespuestas({});
    setPreguntaActual(0);
    setFiltroCategoria('todas');
  };

  const puntuacion = Object.values(respuestas).reduce((sum, v) => sum + v, 0);
  const resultado = testTerminado ? determinarNivel(puntuacion) : null;
  const actividades = resultado ? filtrarActividades(resultado.nivel) : [];
  const actividadesFiltradas = filtroCategoria === 'todas'
    ? actividades
    : actividades.filter(a => a.categoria === filtroCategoria);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🏃</span>
          <h1 className={styles.title}>Selector de Actividades según Movilidad</h1>
          <p className={styles.subtitle}>
            Responde 8 preguntas y descubre actividades físicas, sociales y cognitivas adaptadas a tu nivel
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="medical" severity="critical" context="selector-actividades-movilidad" />

        {/* ── Test ── */}
        {!testTerminado ? (
          <div className={styles.testSection}>
            {/* Progreso */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(Object.keys(respuestas).length / PREGUNTAS.length) * 100}%` }}
              />
            </div>
            <p className={styles.progressText}>
              Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
            </p>

            {/* Pregunta actual */}
            <div className={styles.preguntaCard}>
              <h2 className={styles.preguntaTexto}>{PREGUNTAS[preguntaActual].texto}</h2>
              <div className={styles.opcionesGrid}>
                {PREGUNTAS[preguntaActual].opciones.map((op, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.opcionBtn} ${respuestas[PREGUNTAS[preguntaActual].id] === op.valor ? styles.opcionSeleccionada : ''}`}
                    onClick={() => handleRespuesta(PREGUNTAS[preguntaActual].id, op.valor)}
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className={styles.navBtns}>
              {preguntaActual > 0 && (
                <button type="button" className={styles.btnSecundario} onClick={() => setPreguntaActual(preguntaActual - 1)}>
                  Anterior
                </button>
              )}
              {respuestas[PREGUNTAS[preguntaActual].id] !== undefined && preguntaActual < PREGUNTAS.length - 1 && (
                <button type="button" className={styles.btn} onClick={() => setPreguntaActual(preguntaActual + 1)}>
                  Siguiente
                </button>
              )}
            </div>
          </div>
        ) : resultado && (
          <>
            {/* ── Resultado ── */}
            <div className={styles.resultadoSection}>
              <div className={styles.resultadoHero}>
                <div className={styles.nivelBadge} data-nivel={resultado.nivel}>
                  {resultado.label}
                </div>
                <p className={styles.nivelDescripcion}>{resultado.descripcion}</p>
                <p className={styles.nivelPuntuacion}>Puntuación: {puntuacion} / 24</p>
              </div>

              <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
                Repetir test
              </button>
            </div>

            {/* ── Filtros de categoría ── */}
            <div className={styles.filtrosSection}>
              <h2 className={styles.seccionTitulo}>
                <span aria-hidden="true">🎯</span> {actividades.length} actividades recomendadas para ti
              </h2>
              <div className={styles.filtrosGrid}>
                <button
                  type="button"
                  className={`${styles.filtroBtn} ${filtroCategoria === 'todas' ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltroCategoria('todas')}
                >
                  Todas ({actividades.length})
                </button>
                {(Object.keys(CATEGORIAS_LABEL) as Actividad['categoria'][]).map(cat => {
                  const count = actividades.filter(a => a.categoria === cat).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`${styles.filtroBtn} ${filtroCategoria === cat ? styles.filtroActivo : ''}`}
                      onClick={() => setFiltroCategoria(cat)}
                    >
                      {CATEGORIAS_LABEL[cat].label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Grid de actividades ── */}
            <div className={styles.actividadesGrid}>
              {actividadesFiltradas.map((act, i) => (
                <div key={i} className={styles.actividadCard}>
                  <div className={styles.actividadHeader}>
                    <span className={styles.actividadIcono} aria-hidden="true">{act.icono}</span>
                    <div>
                      <h3 className={styles.actividadNombre}>{act.nombre}</h3>
                      <span className={styles.categoriaBadge} data-cat={act.categoria}>
                        {CATEGORIAS_LABEL[act.categoria].label}
                      </span>
                    </div>
                  </div>
                  <p className={styles.actividadDesc}>{act.descripcion}</p>
                  <div className={styles.actividadMeta}>
                    <span className={styles.frecuencia}>
                      <span aria-hidden="true">📅</span> {act.frecuencia}
                    </span>
                  </div>
                  <div className={styles.beneficiosTags}>
                    {act.beneficios.map((b, j) => (
                      <span key={j} className={styles.beneficioTag}>{b}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Contenido educativo ── */}
        <EducationalSection
          title="📚 Envejecimiento activo: guía práctica"
          subtitle="Consejos y evidencia para mantenerte activo/a"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué es importante mantenerse activo?</h2>
            <p>
              La OMS recomienda al menos <strong>150 minutos semanales</strong> de actividad moderada
              para personas mayores de 65 años. El sedentarismo es uno de los principales factores
              de riesgo de deterioro funcional, caídas y aislamiento social.
            </p>

            <div className={styles.beneficiosGrid}>
              <div className={styles.beneficioCard}>
                <span className={styles.beneficioIcono} aria-hidden="true">🫀</span>
                <strong>Salud cardiovascular</strong>
                <p>Reduce riesgo de infarto, ictus e hipertensión</p>
              </div>
              <div className={styles.beneficioCard}>
                <span className={styles.beneficioIcono} aria-hidden="true">🧠</span>
                <strong>Salud cognitiva</strong>
                <p>Retrasa el deterioro y reduce riesgo de demencia</p>
              </div>
              <div className={styles.beneficioCard}>
                <span className={styles.beneficioIcono} aria-hidden="true">🦴</span>
                <strong>Huesos y músculos</strong>
                <p>Previene osteoporosis, sarcopenia y caídas</p>
              </div>
              <div className={styles.beneficioCard}>
                <span className={styles.beneficioIcono} aria-hidden="true">😊</span>
                <strong>Bienestar emocional</strong>
                <p>Reduce ansiedad, depresión y mejora el sueño</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Puedo empezar a hacer ejercicio a cualquier edad?</summary>
                <p>Sí. Nunca es tarde para empezar. Lo importante es comenzar de forma gradual, adaptada a tu estado físico actual, y ser constante. Consulta con tu médico antes de iniciar un programa nuevo.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué hago si tengo dolor articular?</summary>
                <p>El dolor no siempre impide la actividad. Ejercicios en agua (aquagym, natación) reducen el impacto articular. Los ejercicios sentados también son excelentes. Evita movimientos que agraven el dolor y consulta con un fisioterapeuta.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Dónde encontrar actividades para mayores?</summary>
                <p>Centros de día, centros de mayores municipales, polideportivos (programas senior), asociaciones de vecinos, programas del Imserso, universidades populares y casas de cultura.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Las actividades cognitivas realmente previenen el deterioro?</summary>
                <p>La evidencia científica apoya que la estimulación cognitiva regular (lectura, juegos, aprendizaje) se asocia con menor riesgo de deterioro cognitivo. No lo previene al 100%, pero sí lo retrasa significativamente.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Antes de empezar</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Consulta con tu médico antes de iniciar cualquier programa de ejercicio</li>
                <li>Empieza gradualmente: 10-15 minutos e incrementa poco a poco</li>
                <li>Si sientes dolor agudo, mareo o falta de aire, para inmediatamente</li>
                <li>Hidrátate bien antes, durante y después de la actividad</li>
                <li>Este test es orientativo y no sustituye la valoración de un profesional sanitario</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('selector-actividades-movilidad')} />
        <ShareCard appName="selector-actividades-movilidad" />
        <Footer appName="selector-actividades-movilidad" />
      </div>
    </>
  );
}
