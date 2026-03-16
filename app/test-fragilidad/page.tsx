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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-fragilidad')} />
      <ShareCard appName="test-fragilidad" />
      <Footer appName="test-fragilidad" />
    </div>
  );
}
