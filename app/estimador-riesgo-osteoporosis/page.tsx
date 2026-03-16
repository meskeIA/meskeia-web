'use client';

import { useState } from 'react';
import styles from './EstimadorRiesgoOsteoporosis.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos ────────────────────────────────────────────────────────────────────

interface Pregunta {
  id: string;
  texto: string;
  puntos: number;
  soloMujeres?: boolean;
}

const PREGUNTAS: Pregunta[] = [
  { id: 'q1',  texto: 'Tengo 65 años o más', puntos: 2 },
  { id: 'q2',  texto: 'Tengo 75 años o más (marca además la anterior si procede)', puntos: 2 },
  { id: 'q3',  texto: 'He sufrido una fractura de hueso tras un golpe leve (caída desde mi propia altura) después de los 40 años', puntos: 4 },
  { id: 'q4',  texto: 'Alguno de mis padres tuvo fractura de cadera o pronunciada curvatura de la espalda', puntos: 2 },
  { id: 'q5',  texto: 'Peso menos de 57 kg', puntos: 2 },
  { id: 'q6',  texto: 'Tuve la menopausia antes de los 45 años, o me extirparon los ovarios sin tomar terapia hormonal sustitutiva (solo mujeres)', puntos: 2, soloMujeres: true },
  { id: 'q7',  texto: 'He tomado pastillas de cortisona u otros corticoides durante más de 3 meses en total', puntos: 3 },
  { id: 'q8',  texto: 'Tengo artritis reumatoide u otra enfermedad reumática inflamatoria diagnosticada', puntos: 2 },
  { id: 'q9',  texto: 'Fumo actualmente', puntos: 1 },
  { id: 'q10', texto: 'Bebo más de 2 bebidas alcohólicas al día de forma habitual', puntos: 1 },
  { id: 'q11', texto: 'Hago menos de 30 minutos de actividad física moderada (caminar, nadar, bicicleta) menos de 3 días a la semana', puntos: 1 },
  { id: 'q12', texto: 'Mi dieta habitualmente es baja en lácteos, queso, yogur y otros alimentos ricos en calcio', puntos: 1 },
];

type NivelRiesgo = 'bajo' | 'moderado' | 'alto';

interface Resultado {
  puntuacion: number;
  nivel: NivelRiesgo;
  titulo: string;
  icono: string;
  descripcion: string;
  recomendaciones: { icono: string; texto: string }[];
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularRiesgo(respuestasPositivas: Set<string>): Resultado {
  const puntuacion = PREGUNTAS
    .filter(p => respuestasPositivas.has(p.id))
    .reduce((s, p) => s + p.puntos, 0);

  let nivel: NivelRiesgo;
  let titulo: string;
  let icono: string;
  let descripcion: string;
  let recomendaciones: { icono: string; texto: string }[];

  if (puntuacion <= 3) {
    nivel = 'bajo';
    icono = '🟢';
    titulo = 'Riesgo bajo';
    descripcion = 'No acumulas factores de riesgo significativos. Mantén hábitos saludables para proteger tus huesos a largo plazo.';
    recomendaciones = [
      { icono: '🥛', texto: 'Mantén una ingesta adecuada de calcio: al menos 1.000 mg/día (lácteos, sardinas, almendras, legumbres).' },
      { icono: '☀️', texto: 'Exponerte al sol con moderación favorece la producción de vitamina D, esencial para la absorción del calcio.' },
      { icono: '🏃', texto: 'El ejercicio de impacto moderado (caminar, bailar) fortalece los huesos. Sigue manteniéndolo.' },
      { icono: '🔁', texto: 'Repite este test cada 2-3 años o si aparece algún factor nuevo.' },
    ];
  } else if (puntuacion <= 7) {
    nivel = 'moderado';
    icono = '🟡';
    titulo = 'Riesgo moderado';
    descripcion = 'Tienes algunos factores de riesgo. Es recomendable una valoración médica y medidas preventivas activas.';
    recomendaciones = [
      { icono: '🩺', texto: 'Comenta estos resultados con tu médico de cabecera. Puede valorar si necesitas una densitometría ósea (DEXA).' },
      { icono: '🥛', texto: 'Revisa tu ingesta de calcio y vitamina D. Tu médico puede recomendar suplementación si es necesario.' },
      { icono: '🏋️', texto: 'El ejercicio de fuerza (gimnasia, pesas ligeras) es especialmente eficaz para frenar la pérdida ósea.' },
      { icono: '🚭', texto: 'Si fumas, dejarlo reduce significativamente el riesgo de fractura.' },
      { icono: '⚖️', texto: 'Un peso saludable protege los huesos. Evita dietas muy restrictivas que puedan afectar la densidad ósea.' },
    ];
  } else {
    nivel = 'alto';
    icono = '🔴';
    titulo = 'Riesgo alto';
    descripcion = 'Acumulas varios factores de riesgo significativos. Es importante consultar con tu médico para una evaluación completa.';
    recomendaciones = [
      { icono: '🩺', texto: 'Solicita a tu médico una densitometría ósea (DEXA). Es la prueba definitiva para diagnosticar osteoporosis.' },
      { icono: '💊', texto: 'Existen tratamientos médicos eficaces para prevenir fracturas. Tu médico evaluará si son necesarios en tu caso.' },
      { icono: '🏠', texto: 'Revisa tu hogar para reducir riesgos de caídas: elimina alfombras sueltas, mejora la iluminación, instala barras en el baño.' },
      { icono: '🥛', texto: 'Asegura una ingesta de calcio de al menos 1.200 mg/día y consulta sobre suplementos de vitamina D.' },
      { icono: '🏋️', texto: 'El ejercicio supervisado (fisioterapia, pilates adaptado) mejora el equilibrio y reduce el riesgo de caídas y fracturas.' },
      { icono: '⚠️', texto: 'Cualquier dolor de espalda repentino o fractura ante golpe leve requiere evaluación médica urgente.' },
    ];
  }

  return { puntuacion, nivel, titulo, icono, descripcion, recomendaciones };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorRiesgoOsteoporosis() {
  const [respuestas, setRespuestas] = useState<Set<string>>(new Set());
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function toggleRespuesta(id: string) {
    setRespuestas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setResultado(null);
  }

  function evaluar() {
    setResultado(calcularRiesgo(respuestas));
  }

  const contadorSi = respuestas.size;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🦴</span>
        <h1 className={styles.title}>Estimador de Riesgo de Osteoporosis</h1>
        <p className={styles.subtitle}>Test de factores de riesgo validados (FRAX/IOF) · Orientación preventiva</p>
      </header>

      <DisclaimerCard variant="medical">
        <span>
          Este test es <strong>SOLO orientativo</strong> basado en factores de riesgo validados internacionalmente (FRAX / IOF One-Minute Test).
          <br /><strong>No es</strong> un diagnóstico médico de osteoporosis. El diagnóstico requiere densitometría ósea (DEXA) interpretada por un médico.
          <br /><strong>Consulta siempre con tu médico</strong> si tienes dudas sobre tu salud ósea o si experimentas dolor de espalda repentino o fracturas.
          <br /><em>meskeIA no se responsabiliza de decisiones de salud basadas en este test orientativo.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Cuestionario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Cuestionario de factores de riesgo</h2>
          <p className={styles.instruccion}>
            Marca las afirmaciones que se apliquen a tu situación. Todas son Sí / No — no marques si no estás seguro.
          </p>

          {PREGUNTAS.map(pregunta => (
            <div
              key={pregunta.id}
              className={styles.preguntaItem}
              onClick={() => toggleRespuesta(pregunta.id)}
            >
              <input
                type="checkbox"
                className={styles.checkOsteo}
                checked={respuestas.has(pregunta.id)}
                onChange={() => toggleRespuesta(pregunta.id)}
                aria-label={pregunta.texto}
              />
              <label className={styles.preguntaTexto}>
                {pregunta.texto}
                {pregunta.soloMujeres && <em> (solo mujeres)</em>}
              </label>
            </div>
          ))}

          <button type="button" className={styles.btn} onClick={evaluar} aria-label="Evaluar riesgo de osteoporosis">
            Evaluar mi riesgo
          </button>

          <p className={styles.contadorRespuestas}>
            {contadorSi === 0 ? 'Ningún factor marcado' : `${contadorSi} factor${contadorSi > 1 ? 'es' : ''} marcado${contadorSi > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación preventiva</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Responde las preguntas del cuestionario y pulsa &ldquo;Evaluar mi riesgo&rdquo; para recibir orientación.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={`${styles.riesgoBox} ${styles[`riesgo${resultado.nivel.charAt(0).toUpperCase() + resultado.nivel.slice(1)}`]}`}
                role="status"
              >
                <span className={styles.riesgoIcono} aria-hidden="true">{resultado.icono}</span>
                <div className={styles.riesgoNivel}>{resultado.titulo}</div>
                <div className={styles.riesgoDescripcion}>{resultado.descripcion}</div>
              </div>

              <div className={styles.puntuacionRow}>
                <span>Factores de riesgo marcados</span>
                <strong>{contadorSi} de {PREGUNTAS.length}</strong>
              </div>

              <div>
                <div className={styles.cardSubtitle}>Recomendaciones preventivas</div>
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

      <EducationalSection title="¿Qué es la osteoporosis y por qué prevenirla?" subtitle="Factores de riesgo, diagnóstico y tratamiento">
        <p>La osteoporosis es una enfermedad que debilita los huesos haciéndolos más frágiles y susceptibles a fracturas. En España afecta a más de 3 millones de personas, principalmente mujeres posmenopáusicas y personas mayores.</p>
        <h3>¿Por qué es importante detectarla pronto?</h3>
        <p>La osteoporosis es silenciosa: no duele hasta que se produce una fractura. Las fracturas de cadera, vértebra y muñeca son las más frecuentes y pueden tener consecuencias graves en la calidad de vida y la independencia.</p>
        <h3>Diagnóstico: la densitometría ósea (DEXA)</h3>
        <p>La prueba definitiva es la densitometría ósea (DEXA), que mide la densidad mineral ósea. Se recomienda especialmente en mujeres mayores de 65 años, hombres mayores de 70 y cualquier persona con factores de riesgo significativos.</p>
        <h3>Prevención: tres pilares</h3>
        <ul>
          <li><strong>Calcio</strong>: 1.000–1.200 mg/día (lácteos, verduras de hoja verde, frutos secos, legumbres).</li>
          <li><strong>Vitamina D</strong>: esencial para la absorción del calcio. Se obtiene principalmente con exposición solar moderada. La deficiencia es muy frecuente en España, especialmente en invierno.</li>
          <li><strong>Ejercicio</strong>: el ejercicio de impacto (caminar, bailar) y el de fuerza son los más eficaces para mantener la densidad ósea.</li>
        </ul>
        <h3>Tratamiento si se diagnostica</h3>
        <p>Existen medicamentos eficaces (bifosfonatos, denosumab, ranelato de estroncio) que reducen significativamente el riesgo de fractura. Siempre bajo prescripción y seguimiento médico.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-riesgo-osteoporosis')} />
      <ShareCard appName="estimador-riesgo-osteoporosis" />
      <Footer appName="estimador-riesgo-osteoporosis" />
    </div>
  );
}
