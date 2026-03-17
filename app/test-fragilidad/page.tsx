'use client';

import { useState } from 'react';
import styles from './TestFragilidad.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos ────────────────────────────────────────────────────────────────────

// Escala FRAIL: 5 ítems validados internacionalmente (Morley JE et al., 2012)
// F-atigue, R-esistance, A-mbulation, I-llnesses, L-oss of weight

interface ItemFRAIL {
  id: string;
  letra: string;
  titulo: string;
  pregunta: string;
  ayuda: string;
}

const ITEMS_FRAIL: ItemFRAIL[] = [
  {
    id: 'fatiga',
    letra: 'F',
    titulo: 'Fatiga',
    pregunta: '¿Se ha sentido cansado/a o agotado/a la mayor parte del tiempo durante las últimas 4 semanas?',
    ayuda: 'Referido a cansancio que no se alivia con el reposo habitual y limita las actividades cotidianas.',
  },
  {
    id: 'resistencia',
    letra: 'R',
    titulo: 'Resistencia',
    pregunta: '¿Tiene dificultad para subir un tramo de escaleras (unos 10 escalones) sin detenerse ni ayuda?',
    ayuda: 'Evalúa la fuerza muscular y la resistencia cardiorrespiratoria para un esfuerzo moderado.',
  },
  {
    id: 'ambulacion',
    letra: 'A',
    titulo: 'Ambulación',
    pregunta: '¿Tiene dificultad para caminar unos 100 metros (aproximadamente una manzana) por terreno llano?',
    ayuda: 'Evalúa la capacidad de deambulación básica. No se considera si la dificultad es por dolor puntual.',
  },
  {
    id: 'enfermedades',
    letra: 'I',
    titulo: 'Enfermedades',
    pregunta: '¿Tiene 5 o más enfermedades crónicas diagnosticadas por un médico?',
    ayuda: 'Ejemplos: diabetes, hipertensión, artrosis, EPOC, insuficiencia cardíaca, osteoporosis, demencia, depresión, enfermedad renal crónica, ictus, cáncer…',
  },
  {
    id: 'peso',
    letra: 'L',
    titulo: 'Pérdida de peso',
    pregunta: '¿Ha perdido más del 5% de su peso corporal en el último año sin habérselo propuesto?',
    ayuda: 'Un 5% equivale, por ejemplo, a perder más de 3,5 kg si se pesa 70 kg. La pérdida involuntaria es un signo de alerta.',
  },
];

type NivelFragilidad = 'robusto' | 'prefragil' | 'fragil';

interface Resultado {
  puntuacion: number;
  nivel: NivelFragilidad;
  titulo: string;
  icono: string;
  descripcion: string;
  recomendaciones: { icono: string; texto: string }[];
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularFragilidad(positivos: Set<string>): Resultado {
  const puntuacion = positivos.size; // 1 punto por ítem positivo (máx 5)

  let nivel: NivelFragilidad;
  let titulo: string;
  let icono: string;
  let descripcion: string;
  let recomendaciones: { icono: string; texto: string }[];

  if (puntuacion === 0) {
    nivel = 'robusto';
    icono = '🟢';
    titulo = 'Robusto — Sin fragilidad detectada';
    descripcion = 'No se detectan criterios de fragilidad en la escala FRAIL. Mantén tus hábitos saludables para preservar la vitalidad y la autonomía.';
    recomendaciones = [
      { icono: '🏃', texto: 'Mantén actividad física regular: al menos 150 min/semana de ejercicio moderado (caminar, nadar, bicicleta).' },
      { icono: '🥗', texto: 'Dieta rica en proteínas (legumbres, pescado, huevos, lácteos) para preservar la masa muscular.' },
      { icono: '🩺', texto: 'Revisiones médicas periódicas para detectar cambios de salud a tiempo.' },
      { icono: '🔁', texto: 'Repite este test anualmente o si notas cambios en tu energía o movilidad.' },
    ];
  } else if (puntuacion <= 2) {
    nivel = 'prefragil';
    icono = '🟡';
    titulo = 'Pre-frágil — Riesgo moderado';
    descripcion = 'Presentas 1 o 2 criterios de fragilidad. La pre-fragilidad es reversible con intervención adecuada: es el momento ideal para actuar.';
    recomendaciones = [
      { icono: '🩺', texto: 'Comenta estos resultados con tu médico de cabecera para una evaluación más completa de tu estado funcional.' },
      { icono: '💪', texto: 'El ejercicio de fuerza (sentadillas, bandas elásticas, pesas ligeras) es la intervención más eficaz para revertir la pre-fragilidad.' },
      { icono: '🥩', texto: 'Aumenta la ingesta de proteínas: 1,2-1,5 g por kg de peso corporal al día. Consulta con un dietista si es posible.' },
      { icono: '😴', texto: 'Asegura un sueño reparador (7-8h). El sueño insuficiente acelera la pérdida muscular y la fatiga.' },
      { icono: '👥', texto: 'La actividad social y el estímulo cognitivo también reducen el riesgo de fragilidad: grupos, talleres, voluntariado.' },
    ];
  } else {
    nivel = 'fragil';
    icono = '🔴';
    titulo = 'Frágil — Riesgo alto';
    descripcion = 'Presentas 3 o más criterios de fragilidad. Es importante una evaluación geriátrica completa para planificar intervenciones específicas.';
    recomendaciones = [
      { icono: '🏥', texto: 'Solicita una Valoración Geriátrica Integral (VGI) a tu médico. Esta evaluación multidimensional diseña un plan personalizado.' },
      { icono: '🦺', texto: 'Evalúa el riesgo de caídas en el hogar: iluminación, alfombras, barras de apoyo, calzado adecuado.' },
      { icono: '💊', texto: 'Revisa con tu médico la medicación actual: algunos fármacos aumentan la fatiga o el riesgo de caídas (sedantes, antihipertensivos).' },
      { icono: '🥗', texto: 'La desnutrición agrava la fragilidad. Un dietista puede ayudar a cubrir las necesidades nutricionales con la dieta o suplementos.' },
      { icono: '🏋️', texto: 'Fisioterapia supervisada para recuperar fuerza, equilibrio y seguridad en la marcha.' },
      { icono: '👨‍👩‍👧', texto: 'Informa a la familia o cuidadores de los resultados. La fragilidad requiere un entorno de apoyo y vigilancia.' },
    ];
  }

  return { puntuacion, nivel, titulo, icono, descripcion, recomendaciones };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TestFragilidad() {
  const [respuestas, setRespuestas] = useState<Set<string>>(new Set());
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function toggleItem(id: string) {
    setRespuestas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setResultado(null);
  }

  function evaluar() {
    setResultado(calcularFragilidad(respuestas));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🧓</span>
        <h1 className={styles.title}>Test de Fragilidad</h1>
        <p className={styles.subtitle}>Escala FRAIL · 5 ítems validados · Orientación preventiva para mayores</p>
      </header>

      <DisclaimerCard variant="medical">
        <span>
          Este test es <strong>SOLO orientativo</strong> basado en la escala FRAIL (Morley et al., 2012), validada internacionalmente para la detección precoz de fragilidad.
          <br /><strong>No sustituye</strong> a una Valoración Geriátrica Integral realizada por un profesional sanitario.
          <br /><strong>Consulta siempre con tu médico</strong> si tienes dudas sobre tu estado de salud o capacidad funcional.
          <br /><em>meskeIA no se responsabiliza de decisiones de salud basadas en este test orientativo.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Cuestionario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Escala FRAIL — 5 preguntas</h2>
          <p className={styles.instruccion}>
            Responde Sí o No según cómo te has encontrado en los últimos meses. Sé honesto/a: solo así el resultado será útil.
          </p>

          {ITEMS_FRAIL.map(item => (
            <div
              key={item.id}
              className={`${styles.itemCard} ${respuestas.has(item.id) ? styles.itemActivo : ''}`}
              onClick={() => toggleItem(item.id)}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemLetra} aria-hidden="true">{item.letra}</span>
                <span className={styles.itemTitulo}>{item.titulo}</span>
                <input
                  type="checkbox"
                  className={styles.checkFrail}
                  checked={respuestas.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  aria-label={item.pregunta}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <p className={styles.itemPregunta}>{item.pregunta}</p>
              <p className={styles.itemAyuda}>{item.ayuda}</p>
            </div>
          ))}

          <button
            type="button"
            className={styles.btn}
            onClick={evaluar}
            aria-label="Evaluar nivel de fragilidad"
          >
            Evaluar fragilidad
          </button>

          <p className={styles.contadorItems}>
            {respuestas.size === 0
              ? 'Ningún ítem marcado como Sí'
              : `${respuestas.size} de 5 ítems marcados como Sí`}
          </p>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Resultado orientativo</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Responde las 5 preguntas de la escala FRAIL y pulsa &ldquo;Evaluar fragilidad&rdquo; para obtener la orientación.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div
                className={`${styles.nivelBox} ${styles[`nivel${resultado.nivel.charAt(0).toUpperCase() + resultado.nivel.slice(1)}`]}`}
                role="status"
              >
                <span className={styles.nivelIcono} aria-hidden="true">{resultado.icono}</span>
                <div className={styles.nivelTitulo}>{resultado.titulo}</div>
                <div className={styles.nivelDescripcion}>{resultado.descripcion}</div>
              </div>

              <div className={styles.puntuacionRow}>
                <span>Puntuación FRAIL</span>
                <strong>{resultado.puntuacion} / 5</strong>
              </div>

              <div className={styles.itemsMarcados}>
                {ITEMS_FRAIL.map(item => (
                  <div key={item.id} className={`${styles.resumenItem} ${respuestas.has(item.id) ? styles.resumenSi : styles.resumenNo}`}>
                    <span className={styles.resumenLetra}>{item.letra}</span>
                    <span className={styles.resumenTitulo}>{item.titulo}</span>
                    <span className={styles.resumenValor}>{respuestas.has(item.id) ? 'Sí' : 'No'}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className={styles.cardSubtitle}>Recomendaciones</div>
                <div className={styles.recomendacionesList}>
                  {resultado.recomendaciones.map((rec, i) => (
                    <div key={i} className={styles.recomendacionItem}>
                      <span className={styles.recomendacionIcono} aria-hidden="true">{rec.icono}</span>
                      <span>{rec.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué es la fragilidad y por qué detectarla pronto?" subtitle="Escala FRAIL, criterios de Fried y prevención de la dependencia">
        <p>La fragilidad es un síndrome geriátrico caracterizado por la reducción de la reserva funcional del organismo, lo que hace a la persona más vulnerable a pequeños estresores (infecciones, caídas, cirugías) con un riesgo elevado de pérdida de autonomía.</p>
        <h3>¿Qué es la escala FRAIL?</h3>
        <p>La escala FRAIL (Morley et al., 2012) es una herramienta de cribado validada internacionalmente con 5 ítems simples: Fatiga, Resistencia, Ambulación, enfermedades (Illnesses) y pérdida de peso (Loss of weight). Con 0 puntos: robusto; 1-2: pre-frágil; 3-5: frágil.</p>
        <h3>¿Por qué es importante detectarla?</h3>
        <p>La fragilidad precede a la discapacidad y la dependencia. La <strong>pre-fragilidad es reversible</strong>: las intervenciones de ejercicio físico, nutrición y revisión farmacológica han demostrado revertirla en múltiples estudios. Una vez establecida la dependencia, la intervención es mucho más difícil y costosa.</p>
        <h3>Los tres pilares de la intervención</h3>
        <ul>
          <li><strong>Ejercicio físico</strong>: el entrenamiento de fuerza (2-3 sesiones/semana) es la intervención con mayor evidencia. Complementar con ejercicios de equilibrio y marcha.</li>
          <li><strong>Nutrición</strong>: cubrir 1,2-1,5 g de proteína/kg/día. La malnutrición proteica acelera la sarcopenia (pérdida de masa muscular).</li>
          <li><strong>Revisión médica integral</strong>: polimedicación, caídas previas, déficit visual/auditivo, soledad y depresión son factores tratables que agravan la fragilidad.</li>
        </ul>
        <h3>Valoración Geriátrica Integral (VGI)</h3>
        <p>Si el test indica fragilidad, el siguiente paso es una VGI con el médico o geriatra. Evalúa de forma integral la situación funcional, cognitiva, emocional, social y farmacológica para diseñar un plan de intervención personalizado.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Niveles de fragilidad según escala FRAIL</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Puntuación FRAIL</th>
              <th>Características</th>
              <th>Intervención recomendada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Robusto / No frágil</td>
              <td>0 puntos</td>
              <td>Sin limitaciones, activo independiente</td>
              <td>Mantenimiento preventivo</td>
            </tr>
            <tr>
              <td>Pre-frágil</td>
              <td>1-2 puntos</td>
              <td>Limitaciones leves, reversible</td>
              <td>Intervención temprana prioritaria</td>
            </tr>
            <tr>
              <td>Frágil</td>
              <td>3-5 puntos</td>
              <td>Múltiples limitaciones, riesgo alto</td>
              <td>Plan de atención integral urgente</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🚶</span>
            <strong>Persona mayor activa (no frágil)</strong>
          </div>
          <p>72 años, camina 30 min diarios, sin limitaciones funcionales, bien nutrida. La prevención es la estrategia: mantener hábitos y vigilancia periódica.</p>
          <div className={styles.escenarioExample}>Objetivo: mantener robustez con ejercicio, socialización y dieta mediterránea</div>
          <div className={styles.escenarioTip}>💡 El test FRAIL anual permite detectar transición a pre-fragilidad cuando aún es reversible.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>⚠️</span>
            <strong>Persona pre-frágil (1-2 puntos)</strong>
          </div>
          <p>75 años, refiere cansancio frecuente y ha bajado 4 kg en el último año. Pre-fragilidad: estado reversible con intervención adecuada. Ventana de oportunidad.</p>
          <div className={styles.escenarioExample}>Intervención: programa ejercicio supervisado + valoración nutricional + revisión medicación</div>
          <div className={styles.escenarioTip}>💡 La pre-fragilidad tiene alta reversibilidad. Intervenir ahora evita la progresión a fragilidad establecida.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏥</span>
            <strong>Persona frágil (3+ puntos)</strong>
          </div>
          <p>80 años, múltiples caídas, pérdida de fuerza muscular significativa, cansancio severo. Necesita valoración geriátrica integral y plan de cuidados multidisciplinar.</p>
          <div className={styles.escenarioExample}>Plan: fisioterapia + adaptación hogar + revisión polifarmacia + soporte nutricional</div>
          <div className={styles.escenarioTip}>💡 El geriatra puede solicitar Valoración Geriátrica Integral (VGI) para un plan de cuidados personalizado.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🔄</span>
            <strong>Tras una hospitalización o enfermedad aguda</strong>
          </div>
          <p>Una hospitalización puede precipitar fragilidad en una persona que antes era robusta. El test post-hospitalización orienta la recuperación funcional necesaria.</p>
          <div className={styles.escenarioExample}>Post-caída o post-infección: re-evaluación FRAIL a las 4-6 semanas para ajustar el plan</div>
          <div className={styles.escenarioTip}>💡 El síndrome post-UCI es especialmente frecuente en mayores y requiere rehabilitación precoz.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre fragilidad</h3>
        <div className={styles.faqItem}>
          <strong>¿Qué es exactamente la fragilidad?</strong>
          <p>Es un síndrome geriátrico de vulnerabilidad fisiológica aumentada, resultado del envejecimiento de múltiples sistemas. No es lo mismo que discapacidad ni que enfermedad crónica, aunque puede coexistir con ambas.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La fragilidad es inevitable con la edad?</strong>
          <p>No. Hay personas de 90 años robustas y de 70 años frágiles. El estilo de vida, la actividad física, la nutrición y el manejo de enfermedades crónicas influyen enormemente en la trayectoria.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué diferencia hay entre fragilidad y sarcopenia?</strong>
          <p>La sarcopenia es la pérdida de masa y fuerza muscular (un componente de la fragilidad). La fragilidad es un concepto más amplio que incluye también agotamiento, lentitud, baja actividad y pérdida de peso.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿El ejercicio puede revertir la fragilidad?</strong>
          <p>Sí, el ejercicio de resistencia y equilibrio es la intervención más efectiva para la pre-fragilidad y fragilidad leve-moderada. Mejora la fuerza, el equilibrio y reduce el riesgo de caídas.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es la polifarmacia y por qué agrava la fragilidad?</strong>
          <p>Polifarmacia es tomar 5 o más medicamentos. Algunos medicamentos causan debilidad, caídas, confusión o pérdida de apetito en personas mayores. Revisar la medicación con el médico puede mejorar la fragilidad.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuándo debería consultar a un geriatra?</strong>
          <p>Cuando hay fragilidad establecida (3+ puntos), tras una hospitalización, ante múltiples enfermedades crónicas o cuando la atención primaria no puede abordar la complejidad del caso.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es la Valoración Geriátrica Integral (VGI)?</strong>
          <p>Es una evaluación multidimensional que valora el estado funcional, cognitivo, nutricional, emocional y social. Permite crear un plan de cuidados individualizado y detectar problemas no identificados previamente.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puede una persona frágil mejorar con tratamiento?</strong>
          <p>Sí, aunque la mejora es más lenta que en pre-fragilidad. Con ejercicio adaptado, soporte nutricional, revisión de medicación y apoyo social, es posible recuperar funcionalidad.</p>
          <div className={styles.faqTip}>💡 La motivación del paciente es clave. Los programas de ejercicio grupal en mayores tienen mejor adherencia que los individuales.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Plan de acción según el resultado del test</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Realiza el test FRAIL y anota el resultado</strong>
            <p>Los 5 ítems (Fatigue, Resistance, Aerobic, Illnesses, Loss of weight) dan una puntuación de 0-5. Guarda la fecha para comparar en futuras evaluaciones.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Comenta el resultado con tu médico</strong>
            <p>Presenta la puntuación en la próxima visita. El médico puede complementar con otras pruebas (velocidad de marcha, fuerza prensil, análisis) para confirmación diagnóstica.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Inicia un programa de ejercicio adaptado</strong>
            <p>Independientemente del resultado, el ejercicio es beneficioso. Para pre-frágil o frágil, fisioterapia y programas específicos de fuerza y equilibrio son la base del tratamiento.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Valora el estado nutricional</strong>
            <p>La desnutrición y sarcopenia están muy relacionadas. Un dietista puede evaluar la ingesta proteica (objetivo: 1,2-1,5 g/kg/día) y las necesidades calóricas.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Revisa la medicación con el médico</strong>
            <p>Algunos fármacos contribuyen a la fragilidad. La deprescripción supervisada puede mejorar el estado funcional, el apetito y reducir el riesgo de caídas.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Repite el test cada 6-12 meses</strong>
            <p>La fragilidad es dinámica. Monitorizar la evolución permite ajustar el plan. En personas robustas, anualmente; en pre-frágiles o frágiles, cada 6 meses.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏋️</div>
          <strong>Prioriza el ejercicio de fuerza</strong>
          <p>Las personas mayores necesitan especialmente ejercicio de resistencia (pesas, bandas elásticas). El músculo se recupera a cualquier edad con el estímulo adecuado.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🥩</div>
          <strong>Aumenta la ingesta proteica</strong>
          <p>La proteína es esencial para mantener el músculo. Objetivo: 1,2-1,5 g/kg de peso/día. Distribuir en las tres comidas principales, no solo en la cena.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👥</div>
          <strong>Mantén la red social activa</strong>
          <p>El aislamiento social acelera la fragilidad. Actividades en grupo, voluntariado, clubes de mayores o clases colectivas son tan importantes como el ejercicio.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💊</div>
          <strong>Revisa la polifarmacia regularmente</strong>
          <p>Llevar una lista actualizada de todos los medicamentos al médico permite detectar interacciones y fármacos que ya no son necesarios o que perjudican.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>😴</div>
          <strong>Cuida el sueño y el bienestar emocional</strong>
          <p>Los trastornos del sueño y la depresión se asocian fuertemente con la fragilidad. Tratarlos mejora la energía, la movilidad y el apetito simultáneamente.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🎯</div>
          <strong>Actúa en pre-fragilidad, no en fragilidad</strong>
          <p>La pre-fragilidad es la ventana de mayor oportunidad. En este estadio, las intervenciones tienen más probabilidad de revertir el proceso que cuando la fragilidad ya está establecida.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes ante la fragilidad</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Confundir fragilidad con vejez normal</strong>: La fragilidad no es inevitable. Aceptarla como &quot;cosas de la edad&quot; impide intervenir cuando aún es reversible.</li>
          <li><strong>Reducir la actividad por miedo a caídas</strong>: El sedentarismo agrava la fragilidad. El miedo a caer lleva a reducir la actividad, lo que a su vez debilita más la musculatura y el equilibrio.</li>
          <li><strong>No informar al médico de la pérdida de peso no intencionada</strong>: Perder más de 4,5 kg sin proponérselo es una señal de alarma que requiere evaluación médica urgente.</li>
          <li><strong>Ignorar el estado nutricional</strong>: Muchas personas mayores frágiles están desnutridas sin saberlo. Una dieta monótona o escasa en proteínas contribuye directamente a la pérdida muscular.</li>
          <li><strong>No revisar la medicación periódicamente</strong>: Algunos fármacos prescritos hace años pueden ser contraproducentes en la actualidad. La revisión anual de la medicación es fundamental.</li>
          <li><strong>Esperar a la hospitalización para actuar</strong>: La fragilidad multiplica el riesgo de complicaciones graves tras una hospitalización. Intervenir antes reduce drásticamente ese riesgo.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-fragilidad')} />
      <ShareCard appName="test-fragilidad" />
      <Footer appName="test-fragilidad" />
    </div>
  );
}
