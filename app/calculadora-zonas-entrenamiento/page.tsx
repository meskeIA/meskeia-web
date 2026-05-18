'use client';

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './CalculadoraZonasEntrenamiento.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface ZonaFC {
  numero: number;
  nombre: string;
  pctMin: number;
  pctMax: number;
  fcMin: number;
  fcMax: number;
  color: string;
  descripcion: string;
  beneficios: string;
  cuandoUsarla: string;
}

type Metodo = 'simple' | 'karvonen';

// ─────────────────────────────────────────────────────────────────────────────
// Definición de zonas (porcentajes estándar ACSM)
// ─────────────────────────────────────────────────────────────────────────────

const ZONAS_DEF = [
  {
    numero: 1,
    nombre: 'Recuperación Activa',
    pctMin: 50, pctMax: 60,
    color: '#48A9A6',
    descripcion: 'Muy baja intensidad. Conversación fácil. Sin sensación de esfuerzo.',
    beneficios: 'Mejora la circulación, acelera la recuperación muscular, quema principalmente grasas.',
    cuandoUsarla: 'Días de recuperación, calentamiento y vuelta a la calma, principiantes.',
  },
  {
    numero: 2,
    nombre: 'Resistencia Base',
    pctMin: 60, pctMax: 70,
    color: '#27AE60',
    descripcion: 'Intensidad ligera. Puedes mantener una conversación cómoda.',
    beneficios: 'Desarrolla el motor aeróbico, eficiencia cardiaca, quema de grasa con alto porcentaje lipídico.',
    cuandoUsarla: 'Rodajes largos, fondo aeróbico, sesiones largas de baja intensidad (ciclismo, carrera, natación).',
  },
  {
    numero: 3,
    nombre: 'Aeróbico Medio',
    pctMin: 70, pctMax: 80,
    color: '#F39C12',
    descripcion: 'Intensidad moderada. Conversación posible pero limitada. Respiración más profunda.',
    beneficios: 'Mejora el VO₂max, capacidad aeróbica, umbral de lactato. Zona de "tempo".',
    cuandoUsarla: 'Rodajes a ritmo medio, entrenos de tempo, ciclismo a ritmo sostenido.',
  },
  {
    numero: 4,
    nombre: 'Umbral Anaeróbico',
    pctMin: 80, pctMax: 90,
    color: '#E07B39',
    descripcion: 'Alta intensidad. Difícil mantener conversación. Sensación de esfuerzo considerable.',
    beneficios: 'Eleva el umbral anaeróbico, mejora la tolerancia al lactato, aumenta la velocidad máxima sostenible.',
    cuandoUsarla: 'Intervalos, tempo runs, series largas. Limitada a segmentos cortos en sesiones.',
  },
  {
    numero: 5,
    nombre: 'Máximo / VO₂max',
    pctMin: 90, pctMax: 100,
    color: '#E74C3C',
    descripcion: 'Intensidad máxima. Respiración muy agitada. Solo sostenible segundos o pocos minutos.',
    beneficios: 'Maximiza el VO₂max, potencia anaeróbica, velocidad pico. Adaptaciones neuromusculares.',
    cuandoUsarla: 'Sprints, intervalos cortos de alta intensidad (HIIT). Solo para deportistas con base sólida.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Cálculo
// ─────────────────────────────────────────────────────────────────────────────

function calcularZonas(edad: number, fcRep: number, metodo: Metodo): { fcMax: number; zonas: ZonaFC[] } {
  const fcMax = 220 - edad;

  const zonas: ZonaFC[] = ZONAS_DEF.map(z => {
    let fcMin: number, fcMax2: number;
    if (metodo === 'karvonen') {
      const fcReserva = fcMax - fcRep;
      fcMin = Math.round(fcRep + (z.pctMin / 100) * fcReserva);
      fcMax2 = Math.round(fcRep + (z.pctMax / 100) * fcReserva);
    } else {
      fcMin = Math.round((z.pctMin / 100) * fcMax);
      fcMax2 = Math.round((z.pctMax / 100) * fcMax);
    }
    return { ...z, fcMin, fcMax: fcMax2 };
  });

  return { fcMax, zonas };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function CalculadoraZonasEntrenamientoPage() {
  const [edad, setEdad] = useState(30);
  const [fcRep, setFcRep] = useState(60);
  const [metodo, setMetodo] = useState<Metodo>('simple');
  const [calculado, setCalculado] = useState(false);

  const { fcMax, zonas } = calcularZonas(edad, fcRep, metodo);

  const calcular = () => setCalculado(true);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>❤️ Zonas de Entrenamiento</h1>
        <p className={styles.subtitle}>
          Calcula tus 5 zonas de frecuencia cardíaca y entrena con precisión
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Inputs ── */}
        <div className={styles.inputPanel}>
          <div className={styles.inputGrid}>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="edad">
                Edad
              </label>
              <div className={styles.inputRow}>
                <input
                  id="edad"
                  type="number"
                  min={15} max={80} value={edad}
                  onChange={e => { setEdad(Number(e.target.value)); setCalculado(false); }}
                  className={styles.inputNumber}
                  aria-label="Tu edad en años"
                />
                <span className={styles.inputUnidad}>años</span>
              </div>
              <input type="range" min={15} max={80} value={edad}
                onChange={e => { setEdad(Number(e.target.value)); setCalculado(false); }}
                className={styles.slider} aria-hidden="true" />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="fcrep">
                FC en reposo
                <span className={styles.inputHint}>(opcional, para Karvonen)</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  id="fcrep"
                  type="number"
                  min={40} max={100} value={fcRep}
                  onChange={e => { setFcRep(Number(e.target.value)); setCalculado(false); }}
                  className={styles.inputNumber}
                  aria-label="Frecuencia cardíaca en reposo"
                />
                <span className={styles.inputUnidad}>ppm</span>
              </div>
              <input type="range" min={40} max={100} value={fcRep}
                onChange={e => { setFcRep(Number(e.target.value)); setCalculado(false); }}
                className={styles.slider} aria-hidden="true" />
              <p className={styles.inputTip}>
                Mídela por la mañana antes de levantarte, en reposo absoluto.
              </p>
            </div>
          </div>

          <div className={styles.metodoSelector}>
            <p className={styles.metodoLabel}>Método de cálculo:</p>
            <div className={styles.metodoBtns}>
              <button
                onClick={() => { setMetodo('simple'); setCalculado(false); }}
                className={`${styles.metodoBtn} ${metodo === 'simple' ? styles.metodoBtnActivo : ''}`}
              >
                <strong>Fórmula simple</strong>
                <span>FCmáx = 220 − edad</span>
              </button>
              <button
                onClick={() => { setMetodo('karvonen'); setCalculado(false); }}
                className={`${styles.metodoBtn} ${metodo === 'karvonen' ? styles.metodoBtnActivo : ''}`}
              >
                <strong>Fórmula de Karvonen</strong>
                <span>Usa FC en reposo — más precisa</span>
              </button>
            </div>
          </div>

          <div className={styles.btnWrapper}>
            <button onClick={calcular} className={styles.btnCalcular}>
              Calcular mis zonas →
            </button>
          </div>
        </div>

        {/* ── Resultados ── */}
        {calculado && (
          <div className={styles.resultados}>
            <div className={styles.fcMaxBadge}>
              <span className={styles.fcMaxLabel}>Tu FCmáx estimada</span>
              <span className={styles.fcMaxValor}>{fcMax} ppm</span>
              <span className={styles.fcMaxSub}>Fórmula: 220 − {edad} años</span>
            </div>

            <div className={styles.zonasWrapper}>
              {zonas.map(z => (
                <div key={z.numero} className={styles.zonaCard}>
                  <div className={styles.zonaHeader} style={{ backgroundColor: z.color }}>
                    <span className={styles.zonaNumero}>Z{z.numero}</span>
                    <span className={styles.zonaNombre}>{z.nombre}</span>
                    <span className={styles.zonaPct}>{z.pctMin}–{z.pctMax}%</span>
                  </div>
                  <div className={styles.zonaBody}>
                    <div className={styles.zonaFc}>
                      <span className={styles.zonaFcValor} style={{ color: z.color }}>
                        {z.fcMin} – {z.fcMax} ppm
                      </span>
                    </div>
                    <div className={styles.zonaBarra}>
                      <div
                        className={styles.zonaBarraRelleno}
                        style={{
                          width: `${z.pctMax}%`,
                          backgroundColor: z.color,
                          opacity: 0.25,
                        }}
                      />
                      <div
                        className={styles.zonaBarraRelleno}
                        style={{
                          position: 'absolute',
                          left: `${z.pctMin}%`,
                          width: `${z.pctMax - z.pctMin}%`,
                          backgroundColor: z.color,
                        }}
                      />
                    </div>
                    <p className={styles.zonaDesc}>{z.descripcion}</p>
                    <p className={styles.zonaBeneficios}>
                      <strong>Beneficios:</strong> {z.beneficios}
                    </p>
                    <p className={styles.zonaCuando}>
                      <strong>Cuándo usarla:</strong> {z.cuandoUsarla}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {metodo === 'karvonen' && (
              <div className={styles.karvonenNota}>
                <strong>Fórmula de Karvonen aplicada:</strong>{' '}
                FC zona = FC reposo ({fcRep}) + % × (FCmáx − FC reposo) = {fcRep} + % × {fcMax - fcRep}
              </div>
            )}
          </div>
        )}

        <DisclaimerCard variant="medical" severity="high" collapsible={false} />

        {/* ── Sección educativa ── */}
        <EducationalSection
          title="Guía de Zonas de Entrenamiento"
          subtitle="Qué son, para qué sirven y cómo usarlas"
          icon="❤️"
        >
          <section className={styles.guideSection}>
            <h2>Las 5 Zonas en un Vistazo</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Zona</th><th>% FCmáx</th><th>Sensación</th><th>Beneficio principal</th><th>Objetivo ideal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong style={{color:'#48A9A6'}}>Z1 — Recuperación</strong></td>
                    <td>50–60%</td><td>Muy ligero</td>
                    <td>Quema de grasas, circulación</td><td>Recuperación, principiantes</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#27AE60'}}>Z2 — Resistencia base</strong></td>
                    <td>60–70%</td><td>Cómodo</td>
                    <td>Motor aeróbico, eficiencia</td><td>Fondo, larga distancia</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#F39C12'}}>Z3 — Aeróbico medio</strong></td>
                    <td>70–80%</td><td>Moderado</td>
                    <td>VO₂max, umbral lactato</td><td>Ritmo medio, tempo</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#E07B39'}}>Z4 — Umbral anaeróbico</strong></td>
                    <td>80–90%</td><td>Duro</td>
                    <td>Tolerancia al lactato</td><td>Competición, intervalos</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#E74C3C'}}>Z5 — Máximo</strong></td>
                    <td>90–100%</td><td>Máximo</td>
                    <td>Potencia, velocidad pico</td><td>Sprints, HIIT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>¿Qué Método Elegir?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📐</span>
                  <h3>Fórmula simple (220−edad)</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Rápida y universalmente usada. Sirve para la mayoría de deportistas recreativos. Subestima la FCmáx en personas muy entrenadas y la sobreestima en sedentarios. Desviación típica: ±10–12 ppm.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎯</span>
                  <h3>Fórmula de Karvonen</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Usa la "FC de reserva" (FCmáx − FC reposo) para ajustar las zonas según tu condición cardiovascular. Una persona con FC reposo baja (atleta) obtendrá zonas más altas que otra de la misma edad más sedentaria. Más precisa para uso real.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⌚</span>
                  <h3>Cómo medir la FC en reposo</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Justo al despertar, antes de levantarte, pon dos dedos en la muñeca o cuello y cuenta las pulsaciones durante 60 segundos. Hazlo 3 días seguidos y haz la media. Deportistas de resistencia: 35–50 ppm. Adulto sano: 60–80 ppm. Sedentario: 80–100 ppm.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⚠️</span>
                  <h3>Limitación de la fórmula 220−edad</h3>
                </div>
                <p className={styles.escenarioTip}>
                  La fórmula 220−edad es una media estadística de los años 70, revisada en 2001. Alternativas más precisas: FCmáx = 208 − 0,7 × edad (Tanaka, 2001) o FCmáx = 211 − 0,64 × edad (Gulati, mujeres). La única forma exacta es hacer una prueba de esfuerzo máxima.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuánto tiempo debería pasar en cada zona?</h4>
                <p>
                  Depende del objetivo. Para salud general: 70–80% del tiempo en Z1–Z2 y 20–30% en Z3–Z4. Para rendimiento deportivo: la pirámide de polarización (80% baja intensidad / 20% alta) ha demostrado ser más eficaz que el "entrenamiento en zona media" para la mayoría de deportes de resistencia.
                </p>
                <p className={styles.faqTip}>💡 El error más común de los amateurs es entrenar demasiado en Z3 — "demasiado duro para adaptarse, demasiado fácil para mejorar".</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿A qué zona corresponde caminar?</h4>
                <p>
                  Caminar a paso normal suele situarse en Z1–Z2 (50–70% FCmáx) para la mayoría de adultos. Caminar rápido o en subida puede llegar a Z2–Z3. Aunque la FC absoluta parezca baja, para personas sedentarias o mayores puede ser suficiente estímulo aeróbico.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Es cierto que la Z2 quema más grasa que la Z4?</h4>
                <p>
                  En términos de porcentaje de energía procedente de grasas, sí: Z2 usa ~70% grasas / 30% carbohidratos. Z4 usa ~20% grasas / 80% carbohidratos. Pero en total de calorías quemadas, Z4 gana. Para pérdida de peso, la zona importa menos que el déficit calórico total diario.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Puedo usar estas zonas con la bicicleta o la natación?</h4>
                <p>
                  Sí, la FC no depende del deporte. Sin embargo, en ciclismo la FC media suele ser 5–10 ppm inferior que corriendo (postura, menos masa muscular implicada). En natación, 10–15 ppm inferior. Si monitorizas con dispositivo, úsalo como referencia en el deporte que practiques.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Cómo Usar tus Zonas en la Práctica</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Mide tu FC en reposo con precisión</h4>
                  <p>3 mañanas consecutivas antes de levantarte. La media es tu FC basal real. Un pulsómetro de pecho es más fiable que la muñeca para registrar en tiempo real.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Elige Karvonen si entrenas con regularidad</h4>
                  <p>Si tienes FC reposo &lt; 60 ppm o llevas más de 6 meses entrenando, la fórmula de Karvonen dará zonas más ajustadas a tu nivel real de condición cardiovascular.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Entrena la mayoría del tiempo en Z2</h4>
                  <p>Si tu objetivo es salud general o preparar una prueba de resistencia, el 70–80% de tus sesiones deberían estar en Z2. Es la zona donde más se desarrolla el motor aeróbico sin fatiga excesiva.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Reserva Z4–Z5 para días específicos de calidad</h4>
                  <p>1–2 sesiones por semana con intervalos en Z4 o sprints en Z5 son suficientes para progresar. Más que eso sin base aeróbica aumenta el riesgo de lesión y sobreentrenamiento.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Recalcula cada 3–6 meses</h4>
                  <p>Tu FC en reposo bajará a medida que mejore tu condición. Una FC reposo de 65 ppm al empezar puede convertirse en 52 ppm en 6 meses — las zonas cambian y deben recalcularse.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Claves Prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📉</span>
                <h4>FC reposo baja = corazón eficiente</h4>
                <p>Cada latido bombea más sangre. Ciclistas y corredores de élite tienen FC reposos de 35–45 ppm. No es un objetivo en sí, es una consecuencia del entrenamiento.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎯</span>
                <h4>La Z2 es la zona más subestimada</h4>
                <p>La mayoría de amateurs va demasiado rápido los días "suaves". Si puedes mantener conversación completa y cómoda, estás en Z2. Si no, ve más despacio.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚡</span>
                <h4>La Z4 eleva el umbral de lactato</h4>
                <p>Entrenar justo en el umbral anaeróbico (Z4) permite sostener ritmos más altos antes de "acidificar". Es el trabajo clave para mejorar el ritmo de carrera o marcha.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>😴</span>
                <h4>El descanso también cuenta</h4>
                <p>La FC en reposo sube 5–10 ppm cuando hay sobreentrenamiento, mala calidad del sueño o inicio de enfermedad. Monitorízala cada mañana para detectar señales tempranas.</p>
              </div>
            </div>
          </section>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Frecuentes al Entrenar por Zonas</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Confiar solo en la sensación sin pulsómetro:</strong> La percepción del esfuerzo es muy subjetiva y variable. Un pulsómetro de pecho proporciona datos objetivos para respetar las zonas.</li>
              <li><strong>❌ Entrenar siempre en Z3 ("la zona gris"):</strong> Demasiado dura para recuperarse bien, demasiado fácil para generar adaptaciones de alta intensidad. El error más habitual en corredores populares.</li>
              <li><strong>❌ Aplicar las zonas de carrera al ciclismo o la natación sin ajuste:</strong> La FC en bici suele ser 5–10 ppm inferior para el mismo esfuerzo percibido. Ajusta mentalmente si cambias de deporte.</li>
              <li><strong>❌ No recalcular las zonas al mejorar:</strong> Con el entrenamiento, la FC en reposo baja y la condición mejora. Las zonas calculadas hace 6 meses pueden estar ya obsoletas.</li>
            </ul>
          </div>
        </EducationalSection>

      </main>

      <RelatedApps apps={getRelatedApps('calculadora-zonas-entrenamiento')} />
      <ShareCard appName="calculadora-zonas-entrenamiento" />
      <Footer appName="calculadora-zonas-entrenamiento" />
    </div>
  );
}
