'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TestEstiloParental.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { ESTILOS_PARENTALES } from '@/data/fiscal';
import { jsonLd } from './metadata';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'control' | 'afecto';
  polaridad: 'positivo' | 'negativo'; // positivo = alto, negativo = bajo
}

// ─── Preguntas del test ────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  // Control/Exigencia (8 preguntas)
  { id: 1, texto: 'Cuando mi hijo/a no cumple una norma, siempre hay una consecuencia clara', dimension: 'control', polaridad: 'positivo' },
  { id: 2, texto: 'Establezco horarios fijos para comer, dormir y hacer deberes', dimension: 'control', polaridad: 'positivo' },
  { id: 3, texto: 'Si mi hijo/a quiere algo que no es adecuado, le explico por qué no puede ser', dimension: 'control', polaridad: 'positivo' },
  { id: 4, texto: 'Creo que los niños necesitan normas firmes para sentirse seguros', dimension: 'control', polaridad: 'positivo' },
  { id: 5, texto: 'Dejo que mi hijo/a decida la mayoría de las cosas por sí mismo/a', dimension: 'control', polaridad: 'negativo' },
  { id: 6, texto: 'Prefiero evitar los conflictos y cedo con frecuencia', dimension: 'control', polaridad: 'negativo' },
  { id: 7, texto: 'No suelo insistir mucho si mi hijo/a se niega a hacer algo', dimension: 'control', polaridad: 'negativo' },
  { id: 8, texto: 'Las rutinas en casa son bastante flexibles y cambian según el día', dimension: 'control', polaridad: 'negativo' },

  // Afecto/Responsividad (8 preguntas)
  { id: 9, texto: 'Dedico tiempo cada día a hablar con mi hijo/a sobre cómo le ha ido', dimension: 'afecto', polaridad: 'positivo' },
  { id: 10, texto: 'Cuando mi hijo/a llora o se enfada, intento entender qué siente antes de actuar', dimension: 'afecto', polaridad: 'positivo' },
  { id: 11, texto: 'Le digo a mi hijo/a con frecuencia que le quiero', dimension: 'afecto', polaridad: 'positivo' },
  { id: 12, texto: 'Celebro sus logros, por pequeños que sean', dimension: 'afecto', polaridad: 'positivo' },
  { id: 13, texto: 'A veces me cuesta encontrar momentos para estar a solas con mi hijo/a', dimension: 'afecto', polaridad: 'negativo' },
  { id: 14, texto: 'Me resulta difícil expresar mis emociones abiertamente', dimension: 'afecto', polaridad: 'negativo' },
  { id: 15, texto: 'Suelo estar ocupado/a y delego gran parte del cuidado en otros', dimension: 'afecto', polaridad: 'negativo' },
  { id: 16, texto: 'Creo que los niños se espabilan solos si les dejas', dimension: 'afecto', polaridad: 'negativo' },
];

const OPCIONES_LIKERT = [
  { valor: 1, texto: 'Muy en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Neutral' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Muy de acuerdo' },
];

// ─── Funciones de cálculo ──────────────────────────────────────────────────────

function calcularPuntuaciones(respuestas: Record<number, number>): { control: number; afecto: number } {
  // Suma de preguntas positivas (Q1-4) - Suma de negativas (Q5-8) + 20
  const controlPositivo = (respuestas[1] ?? 0) + (respuestas[2] ?? 0) + (respuestas[3] ?? 0) + (respuestas[4] ?? 0);
  const controlNegativo = (respuestas[5] ?? 0) + (respuestas[6] ?? 0) + (respuestas[7] ?? 0) + (respuestas[8] ?? 0);
  const control = controlPositivo - controlNegativo + 20;

  const afectoPositivo = (respuestas[9] ?? 0) + (respuestas[10] ?? 0) + (respuestas[11] ?? 0) + (respuestas[12] ?? 0);
  const afectoNegativo = (respuestas[13] ?? 0) + (respuestas[14] ?? 0) + (respuestas[15] ?? 0) + (respuestas[16] ?? 0);
  const afecto = afectoPositivo - afectoNegativo + 20;

  return { control, afecto };
}

function obtenerEstilo(control: number, afecto: number): string {
  if (control > 20 && afecto > 20) return 'democratico';
  if (control > 20 && afecto <= 20) return 'autoritario';
  if (control <= 20 && afecto > 20) return 'permisivo';
  return 'negligente';
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function TestEstiloParentalPage(): React.JSX.Element {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalRespondidas = Object.keys(respuestas).length;
  const todasRespondidas = totalRespondidas === 16;

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const handleVerResultado = () => {
    if (todasRespondidas) {
      setMostrarResultado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRepetir = () => {
    setRespuestas({});
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular puntuaciones
  const { control, afecto } = calcularPuntuaciones(respuestas);
  const estiloId = obtenerEstilo(control, afecto);
  const estiloData = ESTILOS_PARENTALES.find((e) => e.id === estiloId);

  // Posición del punto en el cuadrante (0-100%)
  const dotX = Math.min(100, Math.max(0, (control / 40) * 100));
  const dotY = Math.min(100, Math.max(0, 100 - (afecto / 40) * 100)); // invertido: Y alto = arriba

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">👨‍👩‍👧‍👦</span> Test de Estilo Parental
          </h1>
          <p className={styles.subtitle}>
            Descubre tu tendencia educativa con este test de autoconocimiento
          </p>
        </header>

      <RegionBadge variant="es-data" />


        <LegalNotice />


        {/* ─── RESULTADO ─── */}
        {mostrarResultado && estiloData && (
          <div className={styles.resultScreen}>
            <div className={styles.resultHeader}>
              <div className={styles.resultIcon}>{estiloData.icono}</div>
              <h2 className={styles.resultTitle}>Tu tendencia predominante</h2>
              <p className={styles.resultProfile}>{estiloData.nombre}</p>
            </div>

            {/* Cuadrante 2D */}
            <div className={styles.quadrantWrapper}>
              <div className={styles.quadrantContainer}>
                <div className={`${styles.quadrant} ${styles.quadrantTopLeft}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">👊</span>
                    <span className={styles.quadrantName}>Autoritario</span>
                  </div>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTopRight}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">🤝</span>
                    <span className={styles.quadrantName}>Democrático</span>
                  </div>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBottomLeft}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">😶</span>
                    <span className={styles.quadrantName}>Negligente</span>
                  </div>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBottomRight}`}>
                  <div>
                    <span className={styles.quadrantLabel} aria-hidden="true">🫶</span>
                    <span className={styles.quadrantName}>Permisivo</span>
                  </div>
                </div>

                <div className={styles.axisX} />
                <div className={styles.axisY} />

                <div
                  className={styles.userDot}
                  style={{ left: `${dotX}%`, top: `${dotY}%` }}
                  role="img"
                  aria-label={`Tu posición: Control ${control} de 40, Afecto ${afecto} de 40`}
                />
              </div>
              <div className={styles.axisLabelX}>
                <span>Bajo control</span>
                <span>Alto control</span>
              </div>
            </div>

            {/* Puntuaciones */}
            <div className={styles.scoresRow}>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Control / Exigencia</span>
                <span className={styles.scoreValue}>{control}/40</span>
              </div>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Afecto / Responsividad</span>
                <span className={styles.scoreValue}>{afecto}/40</span>
              </div>
            </div>

            {/* Tarjeta del estilo */}
            <div className={styles.styleCard}>
              <h3>{estiloData.icono} {estiloData.nombre}</h3>
              <p>{estiloData.descripcion}</p>

              <h4 className={styles.characteristicsTitle}>Características</h4>
              <ul className={styles.characteristicsList}>
                {estiloData.caracteristicas.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>

              <div className={styles.impactBox}>
                <h4>Impacto en los hijos</h4>
                <p>{estiloData.impactoHijos}</p>
              </div>

              <div className={styles.recommendationBox}>
                <h4>Recomendación</h4>
                <p>{estiloData.recomendacion}</p>
              </div>
            </div>

            <div className={styles.noteBox}>
              La mayoría de padres y madres combinan elementos de varios estilos.
              Este resultado refleja tu <strong>tendencia predominante</strong>, no una etiqueta fija.
            </div>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleRepetir}
            >
              Repetir test
            </button>
          </div>
        )}

        {/* ─── TEST ─── */}
        {!mostrarResultado && (
          <>
            <p className={styles.introText}>
              No hay respuestas correctas ni incorrectas. Responde según lo que realmente haces,
              no lo que crees que deberías hacer.
            </p>

            {/* Progreso */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(totalRespondidas / 16) * 100}%` }}
              />
            </div>
            <p className={styles.progressText}>{totalRespondidas} de 16 preguntas respondidas</p>

            {/* Preguntas */}
            {PREGUNTAS.map((pregunta) => (
              <div key={pregunta.id} className={styles.questionCard}>
                <span className={styles.questionNumber}>
                  Pregunta {pregunta.id} de 16
                </span>
                <p className={styles.questionText}>{pregunta.texto}</p>
                <div className={styles.likertScale} role="radiogroup" aria-label={`Pregunta ${pregunta.id}`}>
                  {OPCIONES_LIKERT.map((opcion) => (
                    <button
                      type="button"
                      key={opcion.valor}
                      className={`${styles.likertOption} ${respuestas[pregunta.id] === opcion.valor ? styles.selected : ''}`}
                      onClick={() => handleRespuesta(pregunta.id, opcion.valor)}
                      role="radio"
                      aria-checked={respuestas[pregunta.id] === opcion.valor ? 'true' : 'false'}
                      aria-label={opcion.texto}
                    >
                      {opcion.texto}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Botón ver resultado */}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleVerResultado}
              disabled={!todasRespondidas}
              aria-label={todasRespondidas ? 'Ver mi resultado' : `Responde las ${16 - totalRespondidas} preguntas restantes`}
            >
              {todasRespondidas ? 'Ver mi resultado' : `Responde las ${16 - totalRespondidas} preguntas restantes`}
            </button>
          </>
        )}

        {/* ─── CONTENIDO EDUCATIVO v2.0 ─── */}
        <EducationalSection
          title="Los 4 estilos parentales: guía completa"
          subtitle="Modelo de Baumrind (1966) y Maccoby & Martin (1983)"
        >
          {/* Los 4 estilos explicados */}
          <section className={styles.guideSection}>
            <h2>Los 4 estilos parentales</h2>
            <div className={styles.contentGrid}>
              {ESTILOS_PARENTALES.map((estilo) => (
                <div key={estilo.id} className={styles.contentCard}>
                  <h4>{estilo.icono} {estilo.nombre}</h4>
                  <p>
                    <strong>Control:</strong> {estilo.control === 'alto' ? 'Alto' : 'Bajo'} |{' '}
                    <strong>Afecto:</strong> {estilo.afecto === 'alto' ? 'Alto' : 'Bajo'}
                  </p>
                  <p>{estilo.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.comparativaSection}>
            <h2>Comparativa de los 4 estilos</h2>
            <p className={styles.comparativaSubtitle}>
              Resumen de las diferencias clave entre cada estilo parental
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th>🤝 Democrático</th>
                    <th>👊 Autoritario</th>
                    <th>🫶 Permisivo</th>
                    <th>😶 Negligente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Control</strong></td>
                    <td>Alto (flexible)</td>
                    <td>Alto (rígido)</td>
                    <td>Bajo</td>
                    <td>Bajo</td>
                  </tr>
                  <tr>
                    <td><strong>Afecto</strong></td>
                    <td>Alto</td>
                    <td>Bajo</td>
                    <td>Alto</td>
                    <td>Bajo</td>
                  </tr>
                  <tr>
                    <td><strong>Comunicación</strong></td>
                    <td>Bidireccional</td>
                    <td>Unidireccional</td>
                    <td>Permisiva</td>
                    <td>Escasa</td>
                  </tr>
                  <tr>
                    <td><strong>Normas</strong></td>
                    <td>Claras con explicación</td>
                    <td>Rígidas sin negociación</td>
                    <td>Pocas o inconsistentes</td>
                    <td>Ausentes</td>
                  </tr>
                  <tr>
                    <td><strong>Impacto en autoestima</strong></td>
                    <td>Positivo</td>
                    <td>Puede ser negativo</td>
                    <td>Variable</td>
                    <td>Negativo</td>
                  </tr>
                  <tr>
                    <td><strong>Recomendación</strong></td>
                    <td>Mantener coherencia</td>
                    <td>Incorporar escucha</td>
                    <td>Añadir límites claros</td>
                    <td>Buscar apoyo profesional</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios reales */}
          <section className={styles.escenariosSection}>
            <h2>Escenarios de la vida real</h2>
            <p className={styles.escenariosSubtitle}>
              Cómo influye el contexto familiar en el estilo parental
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                  <h3>Padres que trabajan a jornada completa</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Ambos progenitores trabajan. Poco tiempo entre semana. Cansancio acumulado. Tendencia a ceder para evitar conflictos.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Riesgo:</strong> Deslizarse hacia el estilo permisivo o negligente por falta de energía.
                  Establecer 3-4 normas clave (no negociables) y ser consistente ayuda más que intentar controlar todo.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💔</span>
                  <h3>Padres separados</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Custodia compartida. Normas diferentes en cada casa. El niño aprende a "negociar" entre ambos.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Clave:</strong> Intentar acordar normas básicas comunes (horarios, pantallas, deberes).
                  No compensar con permisividad el tiempo que no se pasa con el hijo. La coherencia entre casas es más valiosa que cualquier regalo.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
                  <h3>Abuelos como cuidadores principales</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Los abuelos cuidan al niño muchas horas. Su estilo puede diferir del de los padres. El niño recibe mensajes contradictorios.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Consejo:</strong> Agradecer su implicación y pactar las normas más importantes. Los abuelos tienen
                  un papel afectivo valioso, pero conviene que refuercen las mismas reglas básicas que los padres.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👶</span>
                  <h3>Padres primerizos</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Primer hijo. Mucha información contradictoria. Inseguridad sobre qué estilo es el "correcto". Presión social.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Tranquilidad:</strong> No existe el padre perfecto. Los niños necesitan padres
                  suficientemente buenos, no perfectos. Confiar en el sentido común, pedir ayuda cuando
                  sea necesario y recordar que el vínculo afectivo es la base de todo.
                </p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Puedo cambiar mi estilo parental?</summary>
                <p>
                  Sí, absolutamente. El estilo parental no es un rasgo fijo de personalidad, sino un conjunto de
                  hábitos que se pueden modificar con consciencia y práctica. Muchos padres evolucionan desde un
                  estilo autoritario (heredado de su propia crianza) hacia uno más democrático al informarse y
                  reflexionar. El primer paso es precisamente este: ser consciente de tu tendencia actual.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si los dos progenitores tienen estilos diferentes?</summary>
                <p>
                  Es muy común y no tiene por qué ser un problema si las diferencias son pequeñas. Lo importante
                  es acordar las normas fundamentales (horarios, pantallas, educación). Pequeñas diferencias en
                  el estilo pueden incluso enriquecer al niño. Lo perjudicial es la contradicción abierta
                  (un progenitor permite lo que el otro prohíbe sistemáticamente).
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿La cultura influye en el estilo parental?</summary>
                <p>
                  Sí, significativamente. Lo que se considera "autoritario" en Escandinavia puede ser la norma
                  en otras culturas. El modelo de Baumrind se desarrolló en un contexto occidental. Sin embargo,
                  la investigación intercultural confirma que la combinación de afecto + estructura (estilo
                  democrático) tiende a producir buenos resultados en la mayoría de contextos culturales.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿El estilo debe cambiar según la edad del hijo?</summary>
                <p>
                  Sí. Con niños pequeños (0-6) es normal más control directo. En la preadolescencia (9-12)
                  conviene ir cediendo autonomía progresivamente. En la adolescencia (13-18) el estilo
                  democrático funciona especialmente bien: mantener las normas importantes pero negociar
                  y explicar, dando cada vez más espacio para sus propias decisiones.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Ser democrático significa no castigar nunca?</summary>
                <p>
                  No. El estilo democrático incluye consecuencias, pero estas son proporcionales, coherentes
                  y se explican. La diferencia con el autoritario es que aquí el niño entiende el porqué
                  de la consecuencia y tiene oportunidad de expresar su punto de vista. No se trata de
                  ausencia de límites, sino de límites con explicación y afecto.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Este test es válido científicamente?</summary>
                <p>
                  Este test es una herramienta de autoconocimiento orientativa basada en el modelo
                  científico de Diana Baumrind (1966), ampliado por Maccoby y Martin (1983). No es un
                  instrumento clínico validado. Para una evaluación profesional del estilo parental,
                  consulta con un psicólogo especializado en familia.
                </p>
              </details>
            </div>
          </section>

          {/* Consejos para acercarse al estilo democrático */}
          <section className={styles.tipsSection}>
            <h2>Claves para un estilo más democrático</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👂</span>
                <h3>Escucha activa</h3>
                <p>
                  Antes de responder, repite lo que tu hijo ha dicho con tus propias palabras.
                  Sentirse escuchado reduce conflictos y fortalece el vínculo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📋</span>
                <h3>Normas claras y pocas</h3>
                <p>
                  Mejor 5 normas firmes y consistentes que 20 normas que nadie recuerda.
                  Escríbelas y ponlas en un lugar visible.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💬</span>
                <h3>Explica el porqué</h3>
                <p>
                  "Porque lo digo yo" genera obediencia a corto plazo pero resentimiento.
                  Explicar la razón enseña a pensar y a interiorizar valores.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🤗</span>
                <h3>Afecto visible</h3>
                <p>
                  Di "te quiero" a diario. Los niños necesitan oírlo aunque "ya lo sepan".
                  El afecto explícito es la base de la seguridad emocional.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <h3>Consecuencias, no castigos</h3>
                <p>
                  La consecuencia es lógica y proporcional ("no recoges, no puedes jugar").
                  El castigo es arbitrario ("te quedas sin postre porque sí").
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <h3>Coherencia entre adultos</h3>
                <p>
                  Si los adultos se contradicen, el niño aprende a manipular.
                  Acordar las normas básicas entre todos los cuidadores es esencial.
                </p>
              </div>
            </div>
          </section>

          {/* Warning Box - Mitos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Mitos sobre la crianza que conviene desterrar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>"Ser estricto es mejor que ser blando".</strong> La evidencia muestra que la
                combinación de firmeza + afecto (estilo democrático) supera tanto a la rigidez pura
                como a la permisividad. No se trata de elegir entre ser duro o blando, sino de
                encontrar el equilibrio.
              </li>
              <li>
                <strong>"Los niños necesitan mano dura".</strong> Los niños necesitan límites, pero
                los límites funcionan mejor cuando se explican y se aplican con respeto. La "mano dura"
                genera obediencia por miedo, no por comprensión.
              </li>
              <li>
                <strong>"Si le doy muchos abrazos, será débil".</strong> Exactamente al contrario.
                Los niños con apego seguro (mucho afecto) desarrollan mayor resiliencia,
                independencia y capacidad para afrontar adversidades.
              </li>
              <li>
                <strong>"Mi padre me educó así y yo salí bien".</strong> Cada generación tiene más
                conocimiento sobre desarrollo infantil. Que algo "funcionara" no significa que fuera
                óptimo. Siempre se puede mejorar sin juzgar cómo nos educaron a nosotros.
              </li>
              <li>
                <strong>"El estilo parental no importa, es genética".</strong> La genética influye
                en el temperamento, pero el ambiente familiar es determinante en habilidades
                sociales, regulación emocional y rendimiento académico. Ambos factores interactúan.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-estilo-parental')} />
        <ShareCard appName="test-estilo-parental" />
        <Footer appName="test-estilo-parental" />
      </div>
    </>
  );
}
