'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './TestPerfilInversor.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Definición de preguntas con puntuaciones
interface Option {
  text: string;
  points: number;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: '¿Cuál es tu horizonte temporal de inversión?',
    options: [
      { text: 'Menos de 2 años - Necesitaré el dinero pronto', points: 1 },
      { text: '2 a 5 años - Plazo medio', points: 2 },
      { text: '5 a 10 años - Largo plazo', points: 3 },
      { text: 'Más de 10 años - No tengo prisa', points: 4 },
    ],
  },
  {
    id: 2,
    text: 'Si tu cartera perdiera un 20% de su valor en un mes, ¿qué harías?',
    options: [
      { text: 'Vendería todo inmediatamente para evitar más pérdidas', points: 1 },
      { text: 'Vendería una parte para reducir el riesgo', points: 2 },
      { text: 'Mantendría la posición y esperaría la recuperación', points: 3 },
      { text: 'Aprovecharía para comprar más a precios más bajos', points: 4 },
    ],
  },
  {
    id: 3,
    text: '¿Cuánta experiencia tienes invirtiendo en bolsa o fondos de inversión?',
    options: [
      { text: 'Ninguna - Soy completamente nuevo/a', points: 1 },
      { text: 'Poca - He invertido alguna vez pero sin seguimiento', points: 2 },
      { text: 'Moderada - Invierto regularmente desde hace años', points: 3 },
      { text: 'Amplia - Llevo más de 10 años invirtiendo activamente', points: 4 },
    ],
  },
  {
    id: 4,
    text: '¿Qué porcentaje de tus ahorros totales vas a destinar a inversiones?',
    options: [
      { text: 'Menos del 20% - Solo una pequeña parte', points: 1 },
      { text: '20% a 40% - Una parte moderada', points: 2 },
      { text: '40% a 60% - Una parte significativa', points: 3 },
      { text: 'Más del 60% - La mayor parte de mis ahorros', points: 4 },
    ],
  },
  {
    id: 5,
    text: '¿Cuál es tu situación laboral y estabilidad de ingresos?',
    options: [
      { text: 'Ingresos variables o inestables', points: 1 },
      { text: 'Empleo estable pero sin grandes ahorros aún', points: 2 },
      { text: 'Empleo estable con buen colchón de emergencia', points: 3 },
      { text: 'Múltiples fuentes de ingresos o patrimonio consolidado', points: 4 },
    ],
  },
  {
    id: 6,
    text: '¿Cómo te sentirías si tu inversión cayera un 30% en un año?',
    options: [
      { text: 'Muy preocupado/a - No podría dormir tranquilo/a', points: 1 },
      { text: 'Preocupado/a - Me generaría ansiedad', points: 2 },
      { text: 'Algo inquieto/a pero entendería que es normal', points: 3 },
      { text: 'Tranquilo/a - Es parte del juego a largo plazo', points: 4 },
    ],
  },
  {
    id: 7,
    text: '¿Cuál es tu objetivo principal al invertir?',
    options: [
      { text: 'Preservar mi capital - No perder dinero', points: 1 },
      { text: 'Obtener algo más que la inflación', points: 2 },
      { text: 'Hacer crecer mi patrimonio a largo plazo', points: 3 },
      { text: 'Maximizar rentabilidad aunque implique más riesgo', points: 4 },
    ],
  },
  {
    id: 8,
    text: '¿Tienes otros ahorros o inversiones además de lo que vas a invertir ahora?',
    options: [
      { text: 'No, este es todo mi ahorro', points: 1 },
      { text: 'Tengo un pequeño fondo de emergencia', points: 2 },
      { text: 'Tengo fondo de emergencia + otras inversiones', points: 3 },
      { text: 'Tengo un patrimonio diversificado (inmuebles, fondos, etc.)', points: 4 },
    ],
  },
  {
    id: 9,
    text: '¿Cómo reaccionas normalmente ante noticias económicas negativas?',
    options: [
      { text: 'Me alarmo y pienso en proteger lo que tengo', points: 1 },
      { text: 'Me preocupo pero intento mantener la calma', points: 2 },
      { text: 'Las sigo pero no cambio mi estrategia', points: 3 },
      { text: 'Las veo como potenciales oportunidades', points: 4 },
    ],
  },
  {
    id: 10,
    text: '¿Qué afirmación te representa mejor?',
    options: [
      { text: '"Prefiero ganar poco pero seguro a arriesgarme a perder"', points: 1 },
      { text: '"Acepto algo de riesgo si la posible ganancia lo justifica"', points: 2 },
      { text: '"Estoy dispuesto a asumir volatilidad por mayores rendimientos"', points: 3 },
      { text: '"No me importa perder temporalmente si a largo plazo gano más"', points: 4 },
    ],
  },
];

// Perfiles de inversor
type ProfileType = 'conservador' | 'moderado' | 'equilibrado' | 'dinamico' | 'agresivo';

interface Profile {
  name: string;
  icon: string;
  range: [number, number];
  description: string;
  traits: {
    riesgo: string;
    horizonte: string;
    volatilidad: string;
    objetivo: string;
  };
  allocation: {
    rv: number;
    rf: number;
    liq: number;
    alt: number;
  };
  recommendations: string[];
}

const PROFILES: Record<ProfileType, Profile> = {
  conservador: {
    name: 'Conservador',
    icon: '🛡️',
    range: [10, 16],
    description: 'Priorizas la seguridad sobre la rentabilidad. Prefieres evitar pérdidas aunque eso signifique menores ganancias. Ideal para horizontes cortos o personas cercanas a la jubilación.',
    traits: {
      riesgo: 'Muy bajo',
      horizonte: '< 3 años',
      volatilidad: '5-8%',
      objetivo: 'Preservar capital',
    },
    allocation: { rv: 15, rf: 60, liq: 20, alt: 5 },
    recommendations: [
      'Fondos monetarios y depósitos a plazo',
      'Bonos gubernamentales de corto plazo',
      'ETFs de renta fija de alta calidad',
      'Mantener un colchón de emergencia amplio',
    ],
  },
  moderado: {
    name: 'Moderado',
    icon: '⚖️',
    range: [17, 22],
    description: 'Buscas un equilibrio entre seguridad y crecimiento. Aceptas algo de volatilidad pero sin excesos. Perfil común para quienes empiezan a invertir con prudencia.',
    traits: {
      riesgo: 'Bajo',
      horizonte: '3-5 años',
      volatilidad: '8-12%',
      objetivo: 'Batir inflación',
    },
    allocation: { rv: 30, rf: 50, liq: 15, alt: 5 },
    recommendations: [
      'Fondos mixtos conservadores',
      'Combinación de ETFs de renta fija y variable',
      'Planes de pensiones conservadores',
      'Diversificación geográfica moderada',
    ],
  },
  equilibrado: {
    name: 'Equilibrado',
    icon: '📊',
    range: [23, 28],
    description: 'Buscas crecimiento a largo plazo aceptando volatilidad moderada. Entiendes que las caídas son temporales y mantienes la calma. Perfil más común entre inversores experimentados.',
    traits: {
      riesgo: 'Medio',
      horizonte: '5-10 años',
      volatilidad: '12-15%',
      objetivo: 'Crecimiento sostenido',
    },
    allocation: { rv: 50, rf: 35, liq: 10, alt: 5 },
    recommendations: [
      'Fondos indexados globales (MSCI World)',
      'ETFs de acumulación',
      'Cartera 60/40 clásica',
      'Aportaciones periódicas (DCA)',
    ],
  },
  dinamico: {
    name: 'Dinámico',
    icon: '📈',
    range: [29, 34],
    description: 'Priorizas el crecimiento y toleras bien la volatilidad. Las caídas no te asustan y sabes que son oportunidades. Horizonte largo y capacidad de aguantar malos años.',
    traits: {
      riesgo: 'Alto',
      horizonte: '10-15 años',
      volatilidad: '15-20%',
      objetivo: 'Maximizar crecimiento',
    },
    allocation: { rv: 70, rf: 20, liq: 5, alt: 5 },
    recommendations: [
      'ETFs de renta variable global',
      'Fondos indexados de mercados desarrollados',
      'Exposición a mercados emergentes',
      'Small caps para mayor potencial',
    ],
  },
  agresivo: {
    name: 'Agresivo',
    icon: '🚀',
    range: [35, 40],
    description: 'Buscas máxima rentabilidad asumiendo alto riesgo. Tienes experiencia, horizonte muy largo y capacidad de no vender en pánico durante crisis. Perfil para inversores experimentados.',
    traits: {
      riesgo: 'Muy alto',
      horizonte: '> 15 años',
      volatilidad: '20-25%',
      objetivo: 'Máxima rentabilidad',
    },
    allocation: { rv: 90, rf: 5, liq: 0, alt: 5 },
    recommendations: [
      'ETFs 100% renta variable global',
      'Exposición significativa a mercados emergentes',
      'Factor investing (small value, momentum)',
      'Mantener disciplina de aportación periódica incluso en mercados volátiles.',
    ],
  },
};

// Determinar perfil según puntuación
function getProfile(score: number): ProfileType {
  if (score <= 16) return 'conservador';
  if (score <= 22) return 'moderado';
  if (score <= 28) return 'equilibrado';
  if (score <= 34) return 'dinamico';
  return 'agresivo';
}

// Calcular posición en la barra (0-100%)
function getBarPosition(score: number): number {
  // Score va de 10 a 40, mapeamos a 0-100%
  return Math.min(100, Math.max(0, ((score - 10) / 30) * 100));
}

export default function TestPerfilInversorPage() {
  const [phase, setPhase] = useState<'start' | 'questions' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleStart = () => {
    setPhase('questions');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: number, points: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: points }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setPhase('result');
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setPhase('start');
    setCurrentQuestion(0);
    setAnswers({});
  };

  // Calcular puntuación total
  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
  const profileType = getProfile(totalScore);
  const profile = PROFILES[profileType];

  // Renderizar pantalla de inicio
  if (phase === 'start') {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🎯 Test de Perfil Inversor</h1>
          <p className={styles.subtitle}>Descubre tu tolerancia al riesgo en 5 minutos</p>
        </header>

      <LegalNotice lastUpdated="2026-02-02" />

        <div className={styles.startScreen}>
          <div className={styles.startIcon}>📊</div>
          <h2 className={styles.startTitle}>¿Qué tipo de inversor eres?</h2>
          <p className={styles.startDescription}>
            Responde 10 preguntas sobre tu situación financiera, experiencia y actitud
            ante el riesgo. Al final recibirás tu perfil personalizado con recomendaciones
            de inversión adaptadas a ti.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>10 preguntas sencillas</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>5 minutos para completar</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Resultado inmediato</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Recomendaciones personalizadas</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>100% gratuito y privado</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>No requiere registro</span>
            </div>
          </div>

          <button className={styles.startButton} onClick={handleStart}>
            Comenzar Test →
          </button>
        </div>

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="test-perfil-inversor"
          collapsible={false}
        />

        <EducationalSection
          title="¿Quieres aprender más sobre perfiles de inversor?"
          subtitle="Descubre qué significan los perfiles, cómo influyen en tu estrategia y conceptos clave"
        >
          <section className={styles.guideSection}>
            <h2>Conceptos Clave</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🎯 ¿Qué es el perfil inversor?</h4>
                <p>
                  Es una clasificación que combina tu tolerancia al riesgo, horizonte temporal,
                  situación financiera y objetivos. Determina qué tipo de inversiones son
                  más adecuadas para ti y cómo distribuir tu cartera.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>📊 Renta Variable vs Renta Fija</h4>
                <p>
                  La renta variable (acciones, fondos) tiene mayor potencial de rentabilidad
                  pero más volatilidad. La renta fija (bonos, depósitos) es más estable pero
                  con menor rentabilidad esperada. Tu perfil determina la proporción ideal.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>⏰ Horizonte temporal</h4>
                <p>
                  El tiempo que puedes mantener la inversión es crucial. A más largo plazo,
                  puedes asumir más riesgo porque tienes tiempo de recuperarte de caídas.
                  A corto plazo, necesitas inversiones más conservadoras.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>💰 Diversificación</h4>
                <p>
                  No pongas todos los huevos en la misma cesta. Diversificar entre diferentes
                  tipos de activos, sectores y geografías reduce el riesgo global de tu
                  cartera sin sacrificar necesariamente la rentabilidad esperada.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Puede cambiar mi perfil inversor con el tiempo?</summary>
                <p>
                  Sí, es normal que cambie. A medida que te acercas a la jubilación, sueles
                  volverte más conservador. También puede cambiar por eventos vitales (herencia,
                  pérdida de empleo, matrimonio) o simplemente por más experiencia invirtiendo.
                  Se recomienda revisar el perfil anualmente.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Es malo ser conservador?</summary>
                <p>
                  No existe un perfil "mejor" o "peor". Lo importante es que se ajuste a tu
                  situación real. Un perfil conservador es perfectamente válido si tienes
                  horizonte corto, baja tolerancia a pérdidas, o necesitas preservar capital.
                  Lo malo sería invertir de forma agresiva cuando no puedes permitirte perder.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Debo invertir todo según mi perfil?</summary>
                <p>
                  El perfil es una guía, no una regla absoluta. Puedes tener una parte más
                  conservadora (fondo de emergencia, metas a corto plazo) y otra más agresiva
                  (jubilación lejana). Lo importante es entender por qué tomas cada decisión.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si mis respuestas están en el límite entre dos perfiles?</summary>
                <p>
                  Es normal. Los perfiles son un espectro, no categorías rígidas. Si estás entre
                  "moderado" y "equilibrado", puedes elegir una distribución intermedia. Además,
                  puedes ajustar según tu intuición personal y experiencia previa.
                </p>
              </details>
            </div>
          </section>

          {/* Tabla Comparativa de Perfiles */}
          <section className={styles.comparativaSection}>
            <h2>Comparativa de Perfiles de Inversor</h2>
            <p className={styles.comparativaSubtitle}>
              Compara los 5 perfiles en los criterios más relevantes para elegir la estrategia adecuada
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th>🛡️ Conservador</th>
                    <th>⚖️ Moderado</th>
                    <th>📊 Equilibrado</th>
                    <th>📈 Dinámico</th>
                    <th>🚀 Agresivo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Rentabilidad histórica orientativa</strong></td>
                    <td>1–3%</td>
                    <td>2–4%</td>
                    <td>3–6%</td>
                    <td>4–7%</td>
                    <td>5–9%</td>
                  </tr>
                  <tr>
                    <td colSpan={6} style={{ fontSize: '0.85em', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      Rentabilidades históricas nominales medias antes de inflación, comisiones e impuestos. Pasadas, no futuras.
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Volatilidad máxima</strong></td>
                    <td>5–8%</td>
                    <td>8–12%</td>
                    <td>12–15%</td>
                    <td>15–20%</td>
                    <td>20–25%+</td>
                  </tr>
                  <tr>
                    <td><strong>Renta variable (%)</strong></td>
                    <td>15%</td>
                    <td>30%</td>
                    <td>50%</td>
                    <td>70%</td>
                    <td>90%</td>
                  </tr>
                  <tr>
                    <td><strong>Horizonte mínimo</strong></td>
                    <td>1–3 años</td>
                    <td>3–5 años</td>
                    <td>5–10 años</td>
                    <td>10–15 años</td>
                    <td>+15 años</td>
                  </tr>
                  <tr>
                    <td><strong>Activos típicos</strong></td>
                    <td>Depósitos, bonos corto</td>
                    <td>Mixtos conservadores</td>
                    <td>ETFs globales 60/40</td>
                    <td>ETFs renta variable</td>
                    <td>100% acciones globales</td>
                  </tr>
                  <tr>
                    <td><strong>Pérdida máxima soportable</strong></td>
                    <td>–5%</td>
                    <td>–10%</td>
                    <td>–20%</td>
                    <td>–30%</td>
                    <td>–50%+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Casos de Uso Reales */}
          <section className={styles.escenariosSection}>
            <h2>Perfiles en la Vida Real</h2>
            <p className={styles.escenariosSubtitle}>
              Ejemplos concretos de qué perfil corresponde a cada situación vital
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>👤</span>
                  <h3>Joven de 25 años</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Primer empleo estable. Sin hijos. Puede ahorrar 200€/mes. No necesita el dinero hasta los 40+.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Perfil recomendado: Dinámico o Agresivo.</strong> El tiempo es su mayor aliado.
                  Puede soportar mercados bajistas de 2–3 años. Un crash a los 30 no importa si invierte hasta los 60.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                  <h3>Familia con hipoteca</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>Pareja de 40 años, 2 hijos. Hipoteca de 1.000€/mes. Quieren complementar la jubilación.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Perfil recomendado: Moderado o Equilibrado.</strong> Tienen obligaciones financieras fijas.
                  No pueden permitirse grandes caídas. Horizonte de 20–25 años permite algo de renta variable.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>👴</span>
                  <h3>Pre-jubilado de 55 años</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>10 años para jubilarse. 100.000€ ahorrados. Necesitará el dinero a partir de los 65.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Perfil recomendado: Conservador o Moderado.</strong> Un crash del 40% a los 60 años sería devastador.
                  La preservación de capital es prioritaria. Solo pequeña exposición a renta variable.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>💼</span>
                  <h3>Empresario con excedente</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p>Situación:</p>
                  <code>45 años. Ingresos variables pero altos. 200.000€ para invertir. Ya tiene inmuebles y negocio.</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Perfil recomendado: Equilibrado o Dinámico.</strong> Patrimonio diversificado reduce el riesgo global.
                  Los 200.000€ son solo una parte. Puede asumir más riesgo en este capital específico.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Avanzado */}
          <section className={styles.faqSection}>
            <h2>Preguntas Frecuentes Avanzadas</h2>
            <div className={styles.faqList}>
              <div className={styles.faqSectionItem}>
                <h3>¿Qué diferencia hay entre el perfil moderado y el equilibrado?</h3>
                <p>
                  La diferencia principal está en el <strong>porcentaje de renta variable</strong>: el moderado tiene
                  un 30% en bolsa frente al 50% del equilibrado. El moderado prefiere más bonos y estabilidad,
                  mientras que el equilibrado acepta más volatilidad a cambio de mayor crecimiento potencial.
                </p>
                <p className={styles.faqTip}>
                  💡 Si dudas entre ambos, elige el moderado. Es más fácil ser más agresivo en el futuro que
                  recuperarse de una pérdida que no soportas emocionalmente.
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Puedo tener dos perfiles diferentes para distintos objetivos?</h3>
                <p>
                  Sí, y de hecho es lo más inteligente. Puedes ser <strong>conservador para tu fondo de emergencia</strong>
                  (3–6 meses de gastos en cuenta remunerada) y <strong>dinámico para la jubilación</strong>
                  (que queda a 30+ años). Cada objetivo tiene su propio horizonte temporal y tolerancia al riesgo.
                </p>
                <p className={styles.faqTip}>
                  💡 Técnica &quot;bucket&quot;: Divide tu capital en cubos: corto plazo (conservador), medio plazo (equilibrado)
                  y largo plazo (agresivo).
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Cómo afecta la inflación a mi elección de perfil?</h3>
                <p>
                  La inflación es el &quot;riesgo invisible&quot; que erosiona el poder adquisitivo del dinero parado.
                  Con una inflación del 3%, un perfil <strong>demasiado conservador puede perder poder adquisitivo</strong>
                  en términos reales aunque no pierda dinero nominalmente. Por eso, incluso los más conservadores
                  deben buscar algo por encima de la inflación.
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Debería ser más agresivo por ser joven?</h3>
                <p>
                  El tiempo es la variable más importante. <strong>A los 25 años, un crash del 50% tiene 35 años
                  para recuperarse</strong>; a los 60 años, puede ser catastrófico. Sin embargo, ser joven no es
                  suficiente: también necesitas la estabilidad financiera para no vender en pánico durante caídas.
                </p>
                <p className={styles.faqTip}>
                  💡 La regla orientativa anglosajona de &quot;110 menos edad&quot; es una heurística simplificada,
                  no una recomendación MiFID II. Tu porcentaje real depende de tu situación completa: pensión pública,
                  patrimonio inmobiliario, ingresos y tolerancia emocional al riesgo.
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Qué pasa si el banco me asigna un perfil diferente?</h3>
                <p>
                  Los bancos hacen el test de MiFID II por obligación legal, pero a veces están sesgados hacia
                  productos propios o hacia perfiles más conservadores para reducir reclamaciones.
                  <strong>El perfil del banco es orientativo</strong>; el de este test busca darte una imagen más
                  objetiva de tu situación real.
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Con qué frecuencia debo revisar mi perfil?</h3>
                <p>
                  Se recomienda revisar el perfil <strong>al menos una vez al año</strong> y siempre que ocurra
                  un cambio vital significativo: nuevo trabajo, matrimonio, nacimiento de hijos, herencia,
                  compra de vivienda o jubilación próxima. Los mercados también cambian tu exposición real:
                  si la bolsa sube mucho, tu porcentaje en renta variable aumenta automáticamente.
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Existe un perfil &quot;perfecto&quot; para todos?</h3>
                <p>
                  No. El perfil óptimo es personal y depende de factores únicos: tu edad, ingresos, deudas,
                  dependientes a cargo, experiencia inversora y, sobre todo, cómo reaccionas emocionalmente
                  ante pérdidas. <strong>El mejor perfil es el que puedes mantener sin vender en pánico</strong>
                  durante una crisis de mercado.
                </p>
                <p className={styles.faqTip}>
                  💡 Warren Buffett: &quot;Nunca inviertas en algo que no puedas entender&quot;. Con tus inversiones:
                  nunca asumas un riesgo que no puedas soportar emocionalmente.
                </p>
              </div>

              <div className={styles.faqSectionItem}>
                <h3>¿Qué es la aversión al riesgo conductual?</h3>
                <p>
                  Es la tendencia humana a sentir las pérdidas el doble de intensamente que las ganancias
                  equivalentes (teoría de la perspectiva de Kahneman y Tversky). Esto lleva a <strong>vender en el peor
                  momento</strong> (en crisis) y comprar tarde (en euforia). Conocer tu perfil te ayuda a
                  tomar decisiones más racionales y menos emocionales.
                </p>
              </div>
            </div>
          </section>

          {/* Guía Paso a Paso */}
          <section className={styles.stepGuideSection}>
            <h2>Cómo Determinar tu Perfil Real en 7 Pasos</h2>
            <div className={styles.stepGuide}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Calcula tu colchón de emergencia</h3>
                  <p>
                    Antes de invertir, asegúrate de tener <strong>3–6 meses de gastos fijos</strong> en una
                    cuenta de fácil acceso. Este dinero nunca debe invertirse con riesgo. Sin colchón,
                    cualquier imprevisto te forzará a vender inversiones en el peor momento.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Identifica para qué inviertes</h3>
                  <p>
                    Define un objetivo concreto: <strong>jubilación, comprar casa en 10 años, educación de hijos
                    o independencia financiera</strong>. Cada objetivo tiene un horizonte temporal diferente,
                    lo que determinará cuánto riesgo puedes asumir en esa parte de tu patrimonio.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Determina cuándo necesitarás el dinero</h3>
                  <p>
                    Regla general: si necesitas el dinero en <strong>menos de 3 años → conservador</strong>;
                    en 3–7 años → moderado/equilibrado; en más de 10 años → dinámico/agresivo.
                    El horizonte temporal es el factor más objetivo para definir tu perfil.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Evalúa tu tolerancia emocional honestamente</h3>
                  <p>
                    Imagina que tu cartera de 10.000€ vale 6.000€ mañana. <strong>¿Vendes, mantienes o compras más?</strong>
                    Tu respuesta honesta vale más que cualquier teoría financiera. Muchos inversores creen ser
                    agresivos hasta que experimentan su primer mercado bajista real.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h3>Completa el test con sinceridad absoluta</h3>
                  <p>
                    Responde lo que <strong>harías de verdad</strong>, no lo que &quot;deberías&quot; hacer.
                    El test mide tu situación real, no tu conocimiento financiero teórico. Engañarse a uno mismo
                    conduce a tomar un perfil inadecuado y arrepentirse en la primera caída seria del mercado.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h3>Ajusta la distribución a tu situación concreta</h3>
                  <p>
                    El resultado del test es un <strong>punto de partida, no una sentencia</strong>.
                    Si tienes deudas de alto interés, págalas primero. Si tienes múltiples fuentes de ingresos,
                    puedes ser más agresivo. Si dependes de esta inversión para algo concreto, sé más conservador.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <h3>Empieza con pequeñas aportaciones periódicas</h3>
                  <p>
                    El <strong>DCA (aportación periódica)</strong> te permite probar tu tolerancia real al riesgo
                    con importes pequeños. Invierte 100€/mes durante 6 meses antes de poner grandes cantidades.
                    Si duermes bien con pérdidas del 15%, puede que seas más agresivo de lo que creías.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mejores Prácticas */}
          <section className={styles.tipsSection}>
            <h2>6 Reglas de Oro del Inversor Inteligente</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🧘</span>
                <h3>No cambies de perfil en crisis</h3>
                <p>
                  Vender en pánico durante una caída es el error más costoso. Tu perfil se elige en calma;
                  mantenlo en tormenta.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📅</span>
                <h3>Revisa tu perfil cada año</h3>
                <p>
                  Tu situación cambia: ingresos, dependientes, horizonte temporal. Un perfil correcto hoy
                  puede no serlo en 5 años.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🏦</span>
                <h3>Separa el fondo de emergencia</h3>
                <p>
                  El dinero de emergencias nunca debe invertirse. Tenerlo separado evita vender
                  inversiones en el peor momento.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌍</span>
                <h3>Diversifica globalmente</h3>
                <p>
                  No concentres en España ni en Europa. Un ETF global (MSCI World) te da exposición
                  a más de 1.500 empresas de 23 países desarrollados.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📚</span>
                <h3>Entiende lo que tienes</h3>
                <p>
                  No inviertas en lo que no entiendes. Si no sabes qué hay dentro de tu fondo,
                  investiga antes de poner dinero real.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⏳</span>
                <h3>Invierte solo lo que no necesitas</h3>
                <p>
                  Solo invierte dinero que no vayas a necesitar en el horizonte definido.
                  La necesidad urgente de liquidez provoca los peores errores inversores.
                </p>
              </div>
            </div>
          </section>

          {/* Errores Comunes */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Comunes al Elegir tu Perfil Inversor</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Mentirse a uno mismo en el test:</strong> Responder lo que &quot;debería&quot; hacer en vez de
                lo que harías de verdad lleva a un perfil inadecuado. Sé brutalmente honesto contigo mismo.
              </li>
              <li>
                <strong>Cambiar a conservador en cada caída:</strong> El &quot;market timing&quot; (intentar predecir los
                movimientos del mercado) destruye rentabilidad. Estadísticamente, los inversores que venden en
                caídas y recompran tarde obtienen un 2–4% menos anual.
              </li>
              <li>
                <strong>Invertir el fondo de emergencia:</strong> Mezclar el colchón de seguridad con inversiones
                es el error más peligroso. Te obliga a vender cuando el mercado está bajo para cubrir imprevistos.
              </li>
              <li>
                <strong>Elegir perfil agresivo por euforia del mercado:</strong> Muchos inversores se vuelven
                &quot;agresivos&quot; cuando la bolsa lleva 3 años subiendo y se arrepienten en el siguiente crash.
                El perfil debe reflejar tolerancia real al riesgo, no optimismo del momento.
              </li>
              <li>
                <strong>Compararse con otros inversores:</strong> El vecino que ganó 30% con criptomonedas tiene
                un horizonte, situación y tolerancia al riesgo distinta a la tuya. Tu perfil es personal e
                intransferible.
              </li>
              <li>
                <strong>No revisar el perfil tras cambios vitales:</strong> Casarse, tener hijos, cambiar de trabajo
                o acercarse a la jubilación cambian tu perfil óptimo. Un perfil agresivo a los 30 puede ser
                inadecuado a los 55.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-perfil-inversor')} />

        <ShareCard appName="test-perfil-inversor" />
      <Footer appName="test-perfil-inversor" />
      </div>
    );
  }

  // Renderizar preguntas
  if (phase === 'questions') {
    const question = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    const selectedAnswer = answers[question.id];

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🎯 Test de Perfil Inversor</h1>
          <p className={styles.subtitle}>Responde con sinceridad para obtener resultados precisos</p>
        </header>

        <div className={styles.progressText}>
          Pregunta {currentQuestion + 1} de {QUESTIONS.length}
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.questionCard}>
          <span className={styles.questionNumber}>Pregunta {question.id}</span>
          <h2 className={styles.questionText}>{question.text}</h2>

          <div className={styles.optionsGrid}>
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`${styles.optionButton} ${selectedAnswer === option.points ? styles.selected : ''}`}
                onClick={() => handleAnswer(question.id, option.points)}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={styles.optionText}>{option.text}</span>
              </button>
            ))}
          </div>

          <div className={styles.navigation}>
            <button
              className={`${styles.navButton} ${styles.prev}`}
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              ← Anterior
            </button>
            <button
              className={`${styles.navButton} ${styles.next}`}
              onClick={handleNext}
              disabled={selectedAnswer === undefined}
            >
              {currentQuestion === QUESTIONS.length - 1 ? 'Ver Resultado' : 'Siguiente →'}
            </button>
          </div>
        </div>

        <Footer appName="test-perfil-inversor" />
      </div>
    );
  }

  // Renderizar resultado
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎉 ¡Test Completado!</h1>
        <p className={styles.subtitle}>Aquí está tu perfil de inversor personalizado</p>
      </header>

      <div className={styles.resultScreen}>
        <div className={styles.resultHeader}>
          <div className={styles.resultIcon}>{profile.icon}</div>
          <h2 className={styles.resultTitle}>Tu perfil es:</h2>
          <p className={styles.resultProfile}>{profile.name}</p>
        </div>

        {/* Barra visual de perfil */}
        <div className={styles.profileBar}>
          <div className={`${styles.profileSegment} ${styles.conservador}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.moderado}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.equilibrado}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.dinamico}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.agresivo}`} style={{ width: '20%' }} />
        </div>
        <div className={styles.profileMarker}>
          <span
            className={styles.profileArrow}
            style={{ left: `${getBarPosition(totalScore)}%` }}
          >
            ▼
          </span>
        </div>
        <div className={styles.profileLabels}>
          <span>Conservador</span>
          <span>Moderado</span>
          <span>Equilibrado</span>
          <span>Dinámico</span>
          <span>Agresivo</span>
        </div>

        {/* Descripción */}
        <div className={styles.profileDescription}>
          <h4>Descripción de tu perfil</h4>
          <p>{profile.description}</p>
        </div>

        {/* Características */}
        <div className={styles.profileTraits}>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>⚠️</div>
            <span className={styles.traitLabel}>Nivel de riesgo</span>
            <span className={styles.traitValue}>{profile.traits.riesgo}</span>
          </div>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>📅</div>
            <span className={styles.traitLabel}>Horizonte ideal</span>
            <span className={styles.traitValue}>{profile.traits.horizonte}</span>
          </div>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>📊</div>
            <span className={styles.traitLabel}>Volatilidad esperada</span>
            <span className={styles.traitValue}>{profile.traits.volatilidad}</span>
          </div>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>🎯</div>
            <span className={styles.traitLabel}>Objetivo principal</span>
            <span className={styles.traitValue}>{profile.traits.objetivo}</span>
          </div>
        </div>

        {/* Distribución recomendada */}
        <div className={styles.allocationSection}>
          <h4>📊 Distribución de activos recomendada</h4>
          <div className={styles.allocationBar}>
            {profile.allocation.rv > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.rv}`}
                style={{ width: `${profile.allocation.rv}%` }}
              >
                {profile.allocation.rv}%
              </div>
            )}
            {profile.allocation.rf > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.rf}`}
                style={{ width: `${profile.allocation.rf}%` }}
              >
                {profile.allocation.rf}%
              </div>
            )}
            {profile.allocation.liq > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.liq}`}
                style={{ width: `${profile.allocation.liq}%` }}
              >
                {profile.allocation.liq}%
              </div>
            )}
            {profile.allocation.alt > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.alt}`}
                style={{ width: `${profile.allocation.alt}%` }}
              >
                {profile.allocation.alt}%
              </div>
            )}
          </div>
          <div className={styles.allocationLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.rv}`} />
              <span>Renta Variable ({profile.allocation.rv}%)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.rf}`} />
              <span>Renta Fija ({profile.allocation.rf}%)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.liq}`} />
              <span>Liquidez ({profile.allocation.liq}%)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.alt}`} />
              <span>Alternativos ({profile.allocation.alt}%)</span>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className={styles.profileDescription}>
          <h4>💡 Recomendaciones para tu perfil</h4>
          <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
            {profile.recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones */}
        <div className={styles.resultActions}>
          <Link
            href={`/simulador-cartera-inversion/?perfil=${profileType}`}
            className={`${styles.actionButton} ${styles.primary}`}
          >
            📊 Simular esta Cartera
          </Link>
          <Link href="/calculadora-inversiones/" className={`${styles.actionButton} ${styles.secondary}`}>
            💼 Calculadora de Inversiones
          </Link>
          <button type="button" onClick={handleRestart} className={`${styles.actionButton} ${styles.secondary}`}>
            🔄 Repetir Test
          </button>
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="test-perfil-inversor"
        collapsible={false}
      />

      

      <Footer appName="test-perfil-inversor" />
    </div>
  );
}
