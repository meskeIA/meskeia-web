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

      <DisclaimerCard variant="medical"
        severity="critical">
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

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Factores de riesgo de osteoporosis</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Riesgo</th>
              <th>Modificable</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Edad &gt;65 años</td>
              <td>Alto</td>
              <td>No</td>
              <td>Cribado DEXA periódico</td>
            </tr>
            <tr>
              <td>Sexo femenino + menopausia</td>
              <td>Muy alto</td>
              <td>No</td>
              <td>Valorar THS con médico</td>
            </tr>
            <tr>
              <td>Antecedentes familiares fractura</td>
              <td>Alto</td>
              <td>No</td>
              <td>Seguimiento más estrecho</td>
            </tr>
            <tr>
              <td>Déficit de calcio/vitamina D</td>
              <td>Moderado-alto</td>
              <td>Sí</td>
              <td>Dieta + suplementación</td>
            </tr>
            <tr>
              <td>Sedentarismo</td>
              <td>Moderado</td>
              <td>Sí</td>
              <td>Ejercicio de carga regular</td>
            </tr>
            <tr>
              <td>Tabaquismo y alcohol</td>
              <td>Moderado</td>
              <td>Sí</td>
              <td>Abandono del hábito</td>
            </tr>
            <tr>
              <td>Corticoides crónicos</td>
              <td>Alto</td>
              <td>Parcial</td>
              <td>Revisión con especialista</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">👩</span>
            <strong>Mujer posmenopáusica de 55 años</strong>
          </div>
          <p>Menopausia precoz a los 48, madre con fractura de cadera. Riesgo alto. La densitometría DEXA es esencial para evaluar el estado óseo actual.</p>
          <div className={styles.escenarioExample}>Puntuación T-score: si &lt;-2,5 → diagnóstico osteoporosis establecida</div>
          <div className={styles.escenarioTip}>💡 En mujeres posmenopáusicas con factores de riesgo, la DEXA está cubierta por la Seguridad Social.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
            <strong>Persona con corticoterapia crónica</strong>
          </div>
          <p>Artritis reumatoide tratada con prednisona. Los corticoides inhiben la formación ósea. Requiere seguimiento estrecho y puede necesitar tratamiento preventivo desde el inicio.</p>
          <div className={styles.escenarioExample}>Corticoides &gt;7,5 mg/día por más de 3 meses → indicación de densitometría y valorar tratamiento</div>
          <div className={styles.escenarioTip}>💡 Comentar con el reumatólogo la mínima dosis de corticoides efectiva y suplementación de calcio/vitamina D.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏃</span>
            <strong>Hombre sedentario de 70 años</strong>
          </div>
          <p>La osteoporosis en hombres es menos frecuente pero existe. El sedentarismo acelera la pérdida ósea. El ejercicio de carga es la intervención más efectiva.</p>
          <div className={styles.escenarioExample}>Caminar 30 min/día + 2 sesiones de resistencia/semana = estímulo óseo significativo</div>
          <div className={styles.escenarioTip}>💡 El ejercicio de resistencia (pesas, bandas) es más eficaz que caminar para fortalecer el hueso.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🥛</span>
            <strong>Persona con intolerancia a lácteos</strong>
          </div>
          <p>Sin lácteos, la ingesta de calcio puede ser insuficiente. Alternativas: sardinas con espina, almendras, brócoli y bebidas vegetales fortificadas.</p>
          <div className={styles.escenarioExample}>Necesidades: 1.000-1.200 mg calcio/día. Sin lácteos, suplementación puede ser necesaria.</div>
          <div className={styles.escenarioTip}>💡 La vitamina D mejora la absorción del calcio. Sin exposición solar suficiente, suplementar con 1.000-2.000 UI/día.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre osteoporosis</h3>
        <div className={styles.faqItem}>
          <strong>¿Qué es la densitometría ósea (DEXA)?</strong>
          <p>Es la prueba diagnóstica de referencia para medir la densidad mineral ósea. Mide los huesos más vulnerables (cadera y columna lumbar). Es rápida (10-15 min), indolora y con baja radiación.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuándo está indicada la densitometría?</strong>
          <p>En mujeres posmenopáusicas ≥65 años (o antes con factores de riesgo), hombres ≥70 años, personas con corticoides crónicos, antecedentes de fractura por fragilidad o hiperparatiroidismo.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué diferencia hay entre osteopenia y osteoporosis?</strong>
          <p>La osteopenia (T-score entre -1 y -2,5) es una reducción de densidad ósea pero sin llegar al diagnóstico de osteoporosis (T-score &lt;-2,5). La osteopenia es un factor de riesgo de progresión.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué tratamientos existen para la osteoporosis?</strong>
          <p>Bifosfonatos (alendronato, risedronato), denosumab, raloxifeno, y para casos graves: teriparatida o romosozumab. Siempre con prescripción médica y combinados con calcio y vitamina D.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿El calcio solo es suficiente para prevenir la osteoporosis?</strong>
          <p>No. El calcio es necesario pero insuficiente. La vitamina D (absorción de calcio), el ejercicio de carga y evitar factores de riesgo son igual de importantes en la prevención.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede revertir la osteoporosis con tratamiento?</strong>
          <p>Los tratamientos pueden aumentar la densidad ósea entre un 3-10% y reducir el riesgo de fracturas significativamente. La mejora completa no es posible, pero la progresión sí puede frenarse.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Es peligroso caer con osteoporosis?</strong>
          <p>Sí, las fracturas por fragilidad (cadera, vertebrales, muñeca) son la consecuencia más grave. La prevención de caídas (entorno seguro, calzado adecuado, iluminación) es tan importante como el tratamiento.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Los suplementos de calcio tienen efectos secundarios?</strong>
          <p>A dosis elevadas pueden aumentar el riesgo de cálculos renales y, según algunos estudios, eventos cardiovasculares. Se recomienda obtener el calcio de la dieta siempre que sea posible.</p>
          <div className={styles.faqTip}>💡 Consultar con el médico antes de iniciar suplementación de calcio, especialmente si hay historial de cálculos renales.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Plan de prevención y seguimiento de la osteoporosis</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Evalúa tu riesgo con este estimador</strong>
            <p>Identifica cuántos factores de riesgo tienes. Los factores no modificables determinan el seguimiento; los modificables son tu área de acción inmediata.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Consulta con tu médico de atención primaria</strong>
            <p>Comenta tu riesgo estimado. Puede solicitar analítica (calcio, vitamina D, PTH) y derivarte a densitometría si procede.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Optimiza la ingesta de calcio y vitamina D</strong>
            <p>Objetivo: 1.000-1.200 mg calcio/día (dieta) y vitamina D 600-800 UI (sol + alimentos + suplemento si necesario). El médico determinará si precisas suplementos.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Inicia programa de ejercicio regular</strong>
            <p>Ejercicio de carga (caminar, remo, pesas) 3-4 días/semana. Ejercicio de equilibrio (yoga, tai chi) para prevenir caídas. Consulta con fisioterapeuta para programa personalizado.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Realiza la densitometría si está indicada</strong>
            <p>La DEXA da el diagnóstico definitivo. Con el T-score podrás calcular el riesgo FRAX (riesgo de fractura a 10 años) junto con tu médico.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Seguimiento periódico</strong>
            <p>La densitometría se repite cada 1-3 años según el riesgo y el tratamiento. Los análisis de calcio y vitamina D, anualmente. No abandones el tratamiento sin consultar.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">☀️</div>
          <strong>Exposición solar diaria moderada</strong>
          <p>15-20 minutos de sol en brazos y piernas entre las 10h-14h sintetiza vitamina D suficiente en verano. En invierno, suplementación puede ser necesaria.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🥗</div>
          <strong>Dieta rica en calcio variada</strong>
          <p>No solo lácteos: sardinas (espina), brocoli, almendras, tofu y bebidas vegetales con calcio añadido son excelentes fuentes alternativas.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🏋️</div>
          <strong>Ejercicio de resistencia como base</strong>
          <p>El ejercicio con carga (pesas, máquinas) estimula más la formación ósea que el ejercicio aeróbico. Incluirlo al menos 2 veces por semana.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🚭</div>
          <strong>Evitar tabaco y alcohol en exceso</strong>
          <p>El tabaco inhibe la absorción de calcio y reduce los niveles de estrógenos. El alcohol en exceso altera el metabolismo óseo directamente.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🏠</div>
          <strong>Prevenir caídas en casa</strong>
          <p>Eliminar obstáculos, alfombras resbaladizas, instalar barras en baño y mejorar la iluminación. Las caídas son el principal mecanismo de fractura.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">💊</div>
          <strong>No abandonar el tratamiento sin consultar</strong>
          <p>Los bifosfonatos y otros tratamientos requieren continuidad. Abandonarlos puede revertir la mejora de densidad ósea en pocos meses.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <strong>Errores frecuentes en la prevención y tratamiento de la osteoporosis</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Pensar que la osteoporosis es solo un problema femenino</strong>: Los hombres también la padecen. El 20% de los casos de fractura de cadera son en varones, con mayor mortalidad asociada.</li>
          <li><strong>Creer que el dolor de espalda es el primer síntoma</strong>: La osteoporosis es asintomática hasta la fractura. El dolor de espalda puede indicar fractura vertebral que ha ocurrido silenciosamente.</li>
          <li><strong>Confiar solo en el calcio</strong>: Tomar calcio sin vitamina D, sin ejercicio y sin control médico es insuficiente. El abordaje debe ser multifactorial.</li>
          <li><strong>Tomar suplementos de calcio en dosis excesivas</strong>: Más de 2.000 mg/día puede aumentar el riesgo de cálculos renales. La dosis óptima es lo que falta para llegar a 1.200 mg desde la dieta.</li>
          <li><strong>No comunicar al médico todos los medicamentos</strong>: Antiácidos, anticonvulsivos, antidepresivos y corticoides afectan la densidad ósea. El médico necesita saber todo para un tratamiento óptimo.</li>
          <li><strong>Evitar el ejercicio por miedo a fracturas</strong>: El ejercicio moderado y adecuado es preventivo. El sedentarismo acelera la pérdida ósea. Un fisioterapeuta puede diseñar un programa seguro.</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-riesgo-osteoporosis')} />
      <ShareCard appName="estimador-riesgo-osteoporosis" />
      <Footer appName="estimador-riesgo-osteoporosis" />
    </div>
  );
}
