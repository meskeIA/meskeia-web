'use client';

import { useState } from 'react';
import styles from './CalculadoraCalorias.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';

interface Actividad {
  nombre: string;
  met: number;
  icono: string;
  categoria: string;
}

const actividades: Actividad[] = [
  // Cardio
  { nombre: 'Caminar (5 km/h)', met: 3.5, icono: '🚶', categoria: 'Cardio' },
  { nombre: 'Caminar rápido (6,5 km/h)', met: 5.0, icono: '🚶‍♂️', categoria: 'Cardio' },
  { nombre: 'Correr (8 km/h)', met: 8.3, icono: '🏃', categoria: 'Cardio' },
  { nombre: 'Correr (10 km/h)', met: 10.0, icono: '🏃‍♂️', categoria: 'Cardio' },
  { nombre: 'Correr (12 km/h)', met: 11.8, icono: '🏃‍♀️', categoria: 'Cardio' },
  { nombre: 'Sprint (16+ km/h)', met: 14.5, icono: '⚡', categoria: 'Cardio' },
  { nombre: 'Ciclismo suave (16 km/h)', met: 6.0, icono: '🚴', categoria: 'Cardio' },
  { nombre: 'Ciclismo moderado (20 km/h)', met: 8.0, icono: '🚴‍♂️', categoria: 'Cardio' },
  { nombre: 'Ciclismo intenso (25+ km/h)', met: 10.0, icono: '🚴‍♀️', categoria: 'Cardio' },
  { nombre: 'Natación suave', met: 5.8, icono: '🏊', categoria: 'Cardio' },
  { nombre: 'Natación moderada', met: 7.0, icono: '🏊‍♂️', categoria: 'Cardio' },
  { nombre: 'Natación intensa', met: 10.0, icono: '🏊‍♀️', categoria: 'Cardio' },
  { nombre: 'Saltar a la comba', met: 12.3, icono: '⏭️', categoria: 'Cardio' },
  { nombre: 'Subir escaleras', met: 8.8, icono: '🪜', categoria: 'Cardio' },
  { nombre: 'Elíptica moderada', met: 5.0, icono: '🔄', categoria: 'Cardio' },
  { nombre: 'Remo (máquina)', met: 7.0, icono: '🚣', categoria: 'Cardio' },

  // Deportes
  { nombre: 'Fútbol', met: 7.0, icono: '⚽', categoria: 'Deportes' },
  { nombre: 'Baloncesto', met: 6.5, icono: '🏀', categoria: 'Deportes' },
  { nombre: 'Tenis individual', met: 7.3, icono: '🎾', categoria: 'Deportes' },
  { nombre: 'Tenis dobles', met: 5.0, icono: '🎾', categoria: 'Deportes' },
  { nombre: 'Pádel', met: 6.0, icono: '🏸', categoria: 'Deportes' },
  { nombre: 'Voleibol', met: 4.0, icono: '🏐', categoria: 'Deportes' },
  { nombre: 'Golf (caminando)', met: 4.8, icono: '⛳', categoria: 'Deportes' },
  { nombre: 'Boxeo (entrenamiento)', met: 7.8, icono: '🥊', categoria: 'Deportes' },
  { nombre: 'Artes marciales', met: 10.3, icono: '🥋', categoria: 'Deportes' },

  // Gimnasio
  { nombre: 'Pesas (ligero)', met: 3.5, icono: '🏋️', categoria: 'Gimnasio' },
  { nombre: 'Pesas (moderado)', met: 5.0, icono: '🏋️‍♂️', categoria: 'Gimnasio' },
  { nombre: 'Pesas (intenso)', met: 6.0, icono: '🏋️‍♀️', categoria: 'Gimnasio' },
  { nombre: 'CrossFit', met: 8.0, icono: '💪', categoria: 'Gimnasio' },
  { nombre: 'HIIT', met: 9.0, icono: '🔥', categoria: 'Gimnasio' },
  { nombre: 'Yoga', met: 2.5, icono: '🧘', categoria: 'Gimnasio' },
  { nombre: 'Pilates', met: 3.0, icono: '🧘‍♀️', categoria: 'Gimnasio' },
  { nombre: 'Spinning', met: 8.5, icono: '🚲', categoria: 'Gimnasio' },
  { nombre: 'Aeróbic', met: 6.5, icono: '🤸', categoria: 'Gimnasio' },
  { nombre: 'Zumba', met: 6.0, icono: '💃', categoria: 'Gimnasio' },

  // Actividades cotidianas
  { nombre: 'Tareas domésticas', met: 3.5, icono: '🧹', categoria: 'Cotidianas' },
  { nombre: 'Jardinería', met: 4.0, icono: '🌱', categoria: 'Cotidianas' },
  { nombre: 'Pasear al perro', met: 3.0, icono: '🐕', categoria: 'Cotidianas' },
  { nombre: 'Bailar', met: 4.5, icono: '🕺', categoria: 'Cotidianas' },
  { nombre: 'Senderismo', met: 6.0, icono: '🥾', categoria: 'Cotidianas' },
];

const categorias = ['Todas', 'Cardio', 'Deportes', 'Gimnasio', 'Cotidianas'];

export default function CalculadoraCaloriasPage() {
  const [peso, setPeso] = useState('');
  const [duracion, setDuracion] = useState('');
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [resultado, setResultado] = useState<{
    calorias: number;
    caloriasHora: number;
    equivalencias: { nombre: string; cantidad: string; icono: string }[];
  } | null>(null);

  const actividadesFiltradas = categoriaFiltro === 'Todas'
    ? actividades
    : actividades.filter(a => a.categoria === categoriaFiltro);

  const calcular = () => {
    const pesoNum = parseSpanishNumber(peso);
    const duracionNum = parseSpanishNumber(duracion);

    if (pesoNum <= 0 || duracionNum <= 0 || !actividadSeleccionada) {
      return;
    }

    // Fórmula: Calorías = MET × peso (kg) × tiempo (horas)
    const horas = duracionNum / 60;
    const calorias = actividadSeleccionada.met * pesoNum * horas;
    const caloriasHora = actividadSeleccionada.met * pesoNum;

    // Equivalencias alimenticias aproximadas
    const equivalencias = [
      { nombre: 'Manzanas', cantidad: formatNumber(calorias / 52, 1), icono: '🍎' },
      { nombre: 'Rebanadas de pizza', cantidad: formatNumber(calorias / 285, 1), icono: '🍕' },
      { nombre: 'Cervezas', cantidad: formatNumber(calorias / 150, 1), icono: '🍺' },
      { nombre: 'Chocolatinas', cantidad: formatNumber(calorias / 230, 1), icono: '🍫' },
      { nombre: 'Hamburguesas', cantidad: formatNumber(calorias / 540, 1), icono: '🍔' },
    ];

    setResultado({ calorias, caloriasHora, equivalencias });
  };

  const limpiar = () => {
    setPeso('');
    setDuracion('');
    setActividadSeleccionada(null);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔥 Calculadora de Calorías</h1>
        <p className={styles.subtitle}>
          Calcula las calorías quemadas según tu actividad física usando valores MET científicos
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tus datos</h2>

          <NumberInput
            value={peso}
            onChange={setPeso}
            label="Peso"
            placeholder="70"
            helperText="Tu peso en kilogramos"
            min={1}
            max={300}
          />

          <NumberInput
            value={duracion}
            onChange={setDuracion}
            label="Duración"
            placeholder="30"
            helperText="Tiempo de ejercicio en minutos"
            min={1}
            max={480}
          />

          <div className={styles.actividadSection}>
            <label className={styles.label}>Actividad</label>

            <div className={styles.categoriasTabs}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  className={`${styles.categoriaTab} ${categoriaFiltro === cat ? styles.activo : ''}`}
                  onClick={() => setCategoriaFiltro(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.actividadesGrid}>
              {actividadesFiltradas.map((actividad, index) => (
                <button
                  key={index}
                  className={`${styles.actividadCard} ${actividadSeleccionada?.nombre === actividad.nombre ? styles.seleccionada : ''}`}
                  onClick={() => setActividadSeleccionada(actividad)}
                  title={`MET: ${actividad.met}`}
                >
                  <span className={styles.actividadIcono}>{actividad.icono}</span>
                  <span className={styles.actividadNombre}>{actividad.nombre}</span>
                  <span className={styles.actividadMet}>MET {actividad.met}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={calcular}
              className={styles.btnPrimary}
              disabled={!actividadSeleccionada || !peso || !duracion}
            >
              Calcular Calorías
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && actividadSeleccionada ? (
            <>
              <div className={styles.actividadResumen}>
                <span className={styles.resumenIcono}>{actividadSeleccionada.icono}</span>
                <div>
                  <h3>{actividadSeleccionada.nombre}</h3>
                  <p>{duracion} minutos • {peso} kg</p>
                </div>
              </div>

              <div className={styles.caloriasPrincipales}>
                <ResultCard
                  title="Calorías quemadas"
                  value={formatNumber(resultado.calorias, 0)}
                  unit="kcal"
                  variant="highlight"
                  icon="🔥"
                  description={`${formatNumber(resultado.caloriasHora, 0)} kcal/hora`}
                />
              </div>

              <div className={styles.equivalenciasSection}>
                <h3>💡 Esto equivale a:</h3>
                <div className={styles.equivalenciasGrid}>
                  {resultado.equivalencias.map((eq, index) => (
                    <div key={index} className={styles.equivalenciaCard}>
                      <span className={styles.eqIcono}>{eq.icono}</span>
                      <span className={styles.eqCantidad}>{eq.cantidad}</span>
                      <span className={styles.eqNombre}>{eq.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formulaBox}>
                <h4>📐 Fórmula MET</h4>
                <p className={styles.formulaText}>
                  Calorías = MET × Peso (kg) × Tiempo (horas)
                </p>
                <p className={styles.formulaDetalle}>
                  {formatNumber(resultado.calorias, 1)} = {actividadSeleccionada.met} × {peso} × {formatNumber(parseSpanishNumber(duracion) / 60, 2)}
                </p>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔥</span>
              <p>Selecciona una actividad e introduce tus datos para calcular las calorías quemadas</p>
            </div>
          )}
        </div>
      </div>


      {/* Disclaimer Médico */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={true}
        context="calculadora-calorias-ejercicio"
      >
        <p>
          Esta calculadora utiliza <strong>valores MET (Equivalente Metabólico de Tarea)</strong> que son promedios
          científicos. Las estimaciones pueden variar significativamente según:
        </p>

        <ul className={styles.disclaimerList}>
          <li><strong>Intensidad real del ejercicio</strong>: La misma actividad puede tener gasto muy diferente según el esfuerzo (correr 8 km/h vs 12 km/h)</li>
          <li><strong>Condición física individual</strong>: Una persona entrenada quema menos calorías haciendo la misma actividad que una persona sedentaria</li>
          <li><strong>Composición corporal</strong>: La masa muscular aumenta el gasto calórico basal y durante el ejercicio</li>
          <li><strong>Edad y metabolismo</strong>: El gasto energético disminuye con la edad y varía por factores hormonales</li>
        </ul>

        <p className={styles.highlight}>
          <strong>⚕️ Antes de iniciar un programa de ejercicio intenso, consulta con tu médico</strong>,
          especialmente si tienes más de 40 años, sobrepeso, hipertensión, diabetes o antecedentes cardíacos.
          Un entrenador personal puede ayudarte a planificar rutinas seguras y efectivas.
        </p>
      </DisclaimerCard>

      <EducationalSection
        title="📚 Guía completa de calorías, ejercicio y gasto energético"
        subtitle="Aprende cómo funcionan los MET, el EPOC y cómo optimizar tu entrenamiento para tus objetivos reales"
      >
        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2>⚖️ Comparativa de actividades: MET, calorías y beneficios</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>MET</th>
                  <th>Kcal/hora (70kg)</th>
                  <th>EPOC</th>
                  <th>Mejor para...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Caminar suave</strong></td>
                  <td>2.5-3.5</td>
                  <td>175-245 kcal</td>
                  <td>Mínimo</td>
                  <td>Salud cardiovascular básica, recuperación</td>
                </tr>
                <tr>
                  <td><strong>Ciclismo moderado</strong></td>
                  <td>6-8</td>
                  <td>420-560 kcal</td>
                  <td>Bajo</td>
                  <td>Resistencia, articulaciones</td>
                </tr>
                <tr>
                  <td><strong>Running moderado</strong></td>
                  <td>8-10</td>
                  <td>560-700 kcal</td>
                  <td>Moderado</td>
                  <td>Pérdida de peso, resistencia</td>
                </tr>
                <tr>
                  <td><strong>HIIT</strong></td>
                  <td>10-14</td>
                  <td>700-980 kcal</td>
                  <td>Alto (24-48h)</td>
                  <td>Pérdida de grasa, tiempo limitado</td>
                </tr>
                <tr>
                  <td><strong>Natación intensa</strong></td>
                  <td>8-10</td>
                  <td>560-700 kcal</td>
                  <td>Moderado</td>
                  <td>Lesionados, cuerpo completo</td>
                </tr>
                <tr>
                  <td><strong>Pesas / fuerza</strong></td>
                  <td>5-8</td>
                  <td>350-560 kcal</td>
                  <td>Alto (24-48h)</td>
                  <td>Masa muscular, metabolismo largo plazo</td>
                </tr>
                <tr>
                  <td><strong>Yoga / pilates</strong></td>
                  <td>2-4</td>
                  <td>140-280 kcal</td>
                  <td>Mínimo</td>
                  <td>Flexibilidad, estrés, recuperación activa</td>
                </tr>
                <tr>
                  <td><strong>Fútbol / baloncesto</strong></td>
                  <td>7-10</td>
                  <td>490-700 kcal</td>
                  <td>Moderado</td>
                  <td>Adherencia, motivación, social</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section className={styles.eduEscenarios}>
          <h2>🎯 Ejemplos reales de gasto calórico por objetivo</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <h3>Perder 1 kg de grasa al mes</h3>
              </div>
              <p className={styles.escenarioExample}>
                Déficit necesario: ~7.700 kcal/mes = 257 kcal/día. Estrategia mixta: correr 30 min (280 kcal) + reducir 100 kcal en dieta. Persona de 75kg en 30 días.
                <br /><strong>Sin matarte en el gimnasio: media hora de running diaria combinada con pequeños ajustes alimentarios.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 El 70-80% del déficit calórico debe venir de la dieta, no del ejercicio.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💪</span>
                <h3>Ganar músculo (recomposición)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Superávit: +300 kcal/día sobre el TDEE. Fuerza 3x/semana (450 kcal × 3 = 1.350 kcal/sem gastadas). El EPOC de las pesas eleva el metabolismo basal en 50-100 kcal/día.
                <br /><strong>Resultado: el ejercicio consume calorías Y el músculo ganado quema más en reposo.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 Cada kg de músculo quema 13 kcal/día adicionales en reposo (metabolismo basal).</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏃</span>
                <h3>Corredor de 10k (principiante)</h3>
              </div>
              <p className={styles.escenarioExample}>
                Persona de 70kg, 10km en 60 min (ritmo 6 min/km). MET: ~10. Gasto: 10 × 70 × 0.0175 × 60 min = ~735 kcal. Con EPOC adicional: ~800 kcal totales.
                <br /><strong>Equivalente calórico: 2 hamburguesas. El ejercicio ayuda, pero la dieta decide.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 A mayor condición física, el cuerpo se vuelve más eficiente y quema MENOS calorías en la misma distancia.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🕐</span>
                <h3>Trabajador sedentario activo en pausas</h3>
              </div>
              <p className={styles.escenarioExample}>
                8h sentado (trabajo) + 3 pausas activas de 10 min (caminar, sentadillas). Gasto extra pausa activa: ~80 kcal × 3 = 240 kcal adicionales al día. En un mes: ~7.200 kcal = casi 1 kg de grasa.
                <br /><strong>Sin ir al gimnasio: las pausas activas tienen un impacto real acumulado.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 El NEAT (gasto calórico no deportivo: andar, subir escaleras, moverse) puede suponer 300-600 kcal/día.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔥</span>
                <h3>Sesión HIIT de 20 minutos</h3>
              </div>
              <p className={styles.escenarioExample}>
                Persona de 80kg, HIIT intenso 20 min. Durante: ~350 kcal (MET≈14). EPOC en 24h: +150-200 kcal adicionales. Total real: ~520 kcal con solo 20 min de ejercicio.
                <br /><strong>El HIIT es el más eficiente por tiempo: quema más calorías en menos tiempo incluyendo el EPOC.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 HIIT no es para todos: no recomendado con lesiones articulares o principiantes sin base cardio.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👵</span>
                <h3>Persona mayor (65+) con objetivo salud</h3>
              </div>
              <p className={styles.escenarioExample}>
                Mujer de 68 años, 62kg. Natación 45 min (MET=8): ~325 kcal. Caminar 30 min diarios: ~160 kcal. Total semanal: ~1.600 kcal ejercicio. Objetivo: mantener masa muscular y salud cardiovascular.
                <br /><strong>El objetivo no es quemar calorías sino preservar función muscular y calidad de vida.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 La pérdida de músculo (sarcopenia) tras los 60 es el factor de salud más importante. Prioriza fuerza sobre cardio.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>❓ Preguntas frecuentes sobre calorías y ejercicio</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué quemo menos calorías que mi compañero haciendo lo mismo?</h4>
              <p>
                El gasto calórico depende principalmente del peso corporal (más peso = más gasto), la eficiencia metabólica (personas entrenadas son más eficientes y queman menos en la misma actividad), la composición corporal (más músculo = más gasto basal), y factores individuales como la genética y la masa muscular. Una persona de 90 kg quema aproximadamente un 50% más que una de 60 kg haciendo el mismo ejercicio.
              </p>
              <p className={styles.faqTip}>💡 <strong>Clave:</strong> Los valores de la calculadora son estimaciones basadas en promedios. Tu gasto real puede variar ±20% según tu fisiología individual.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Es mejor el cardio o la fuerza para quemar grasa?</h4>
              <p>
                Cardio quema más calorías durante el ejercicio (500-700 kcal/hora vs 300-500 de pesas). Pero las pesas generan mayor EPOC (quema extra 24-48h después), aumentan la masa muscular (que eleva el metabolismo basal permanentemente) y son más efectivas a largo plazo. La combinación óptima para pérdida de grasa: 2-3 sesiones de fuerza + 2-3 de cardio semanal. Solo cardio sin fuerza lleva a pérdida de músculo junto con la grasa.
              </p>
              <p className={styles.faqTip}>💡 <strong>Evidencia:</strong> Estudios muestran que añadir 2 sesiones de fuerza semanales a un programa de cardio acelera la pérdida de grasa un 20-30% más que solo cardio.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo confiar en las calorías que marca mi smartwatch o pulsómetro?</h4>
              <p>
                Los dispositivos wearables tienen un margen de error del 15-30% en el cálculo de calorías. Los pulsómetros de pecho (banda torácica) son más precisos que los de muñeca por la mejor lectura de frecuencia cardíaca. Las máquinas de cardio del gimnasio (sin datos personales) pueden tener errores del 30-40%. Los valores de la calculadora meskeIA basada en MET son tan precisos o más que la mayoría de wearables para la mayoría de actividades.
              </p>
              <p className={styles.faqTip}>💡 <strong>Uso correcto:</strong> Úsalos para comparar entre días (tendencias) o entre actividades, no como valor absoluto exacto. La variabilidad entre sesiones importa más que el número exacto.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuánto ejercicio necesito para compensar una comida copiosa?</h4>
              <p>
                Una hamburguesa completa con patatas y bebida (~900 kcal) requeriría ~75 minutos de running a ritmo moderado. Un trozo de pizza (~280 kcal) equivale a ~25 minutos de carrera. Pero el enfoque de "compensar" comidas con ejercicio es psicológicamente dañino y matemáticamente ineficiente. Es mucho más fácil no comer 300 kcal que quemarlas después. El ejercicio es para la salud; la dieta, para el peso.
              </p>
              <p className={styles.faqTip}>💡 <strong>Perspectiva sana:</strong> No uses el ejercicio como castigo ni la comida como recompensa. El ejercicio mejora la salud, el estado de ánimo y el metabolismo. La gestión del peso viene de hábitos sostenibles, no de compensaciones puntuales.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el NEAT y por qué es tan importante?</h4>
              <p>
                El NEAT (Non-Exercise Activity Thermogenesis) es el gasto calórico de todas las actividades físicas que no son ejercicio estructurado: caminar al trabajo, subir escaleras, gesticular, limpiar la casa, hacer recados. Puede representar entre 200 y 800 kcal/día según el estilo de vida. Personas activas en su vida diaria (NEAT alto) pueden quemar hasta 600 kcal/día más que personas sedentarias, aunque ambas hagan la misma sesión de gimnasio.
              </p>
              <p className={styles.faqTip}>💡 <strong>Hack fácil:</strong> Un podómetro o app de pasos con objetivo de 8.000-10.000 pasos diarios puede añadir 300-400 kcal de gasto extra sin esfuerzo percibido. El NEAT acumulado supera en muchos casos al gasto del gimnasio.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el efecto meseta y cómo romperlo?</h4>
              <p>
                El efecto meseta ocurre cuando el cuerpo se adapta al ejercicio y la dieta, reduciendo el gasto calórico para compensar el déficit. El metabolismo basal puede bajar un 10-15% en dietas restrictivas prolongadas. Para romperlo: varía la intensidad y tipo de ejercicio cada 4-6 semanas, introduce días de "recarga" calórica (refeed), aumenta el NEAT diario, y asegúrate de dormir 7-9 horas (el sueño insuficiente eleva el cortisol y reduce la quema de grasa).
              </p>
              <p className={styles.faqTip}>💡 <strong>Señal de meseta:</strong> Si llevas 3 semanas sin cambios en peso ni medidas pese a mantener déficit y ejercicio, es el momento de variar el estímulo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo influye la temperatura y la altitud en el gasto calórico?</h4>
              <p>
                Frío: el cuerpo gasta más energía para mantener la temperatura corporal (termogénesis), especialmente en agua fría (natación en agua fría puede incrementar el gasto un 10-20%). Calor extremo: el gasto también aumenta ligeramente pero la hidratación y el rendimiento se ven más afectados. Altitud: con menos oxígeno disponible, el cuerpo trabaja más para el mismo esfuerzo, incrementando el gasto un 5-15% en altitudes de 2.000-4.000m.
              </p>
              <p className={styles.faqTip}>💡 <strong>Dato práctico:</strong> Nadar en piscina exterior en invierno puede quemar un 15% más que en piscina climatizada al mismo ritmo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es el ejercicio más eficiente para una persona sin tiempo?</h4>
              <p>
                Para maximizar el gasto calórico por unidad de tiempo: HIIT (10-20 min, máxima quema incluyendo EPOC), seguido de circuitos de fuerza-resistencia (20-30 min). Para maximizar beneficios de salud con mínimo tiempo: 2 sesiones semanales de fuerza de 30-40 min + 150 min semanales de actividad moderada (puede ser caminar). Para principiantes: caminar 30 min diarios es más sostenible y saludable que una sesión de HIIT que abandones en semana 3.
              </p>
              <p className={styles.faqTip}>💡 <strong>La mejor rutina:</strong> La que harás consistentemente durante meses. La adherencia supera siempre a la "eficiencia" teórica de cualquier protocolo.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2>📋 Cómo usar el gasto calórico para alcanzar tu objetivo</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Calcula tu gasto energético total diario (TDEE)</h4>
                <p>El TDEE = Metabolismo Basal (BMR) + Gasto por Actividad Física + NEAT. Usa la calculadora de calorías meskeIA para estimar el gasto de tu ejercicio. Para el BMR, usa la fórmula de Harris-Benedict o Mifflin-St Jeor. Suma ambos para obtener tu TDEE aproximado y úsalo como referencia para planificar tu ingesta.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Define tu objetivo específico y el déficit/superávit necesario</h4>
                <p>Perder peso: déficit de 300-500 kcal/día (0,5-1 kg/semana sostenible). Ganar músculo: superávit de 200-300 kcal/día con fuerza. Mantenimiento: ingesta = TDEE. Evita déficits mayores de 700-800 kcal/día: pierdes músculo, el metabolismo se adapta a la baja y el rebote es casi inevitable.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Elige actividades adecuadas a tu nivel y objetivo</h4>
                <p>Principiante (sin base): caminar 30 min + 2 sesiones fuerza básica. Intermedio: 3 sesiones fuerza + 2-3 cardio moderado. Avanzado: programa periodizado con variación de estímulos. Considera también tu historial de lesiones, disponibilidad de tiempo real y qué actividades te resultan más sostenibles a largo plazo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Registra tu actividad y ajusta según resultados reales</h4>
                <p>Usa la calculadora para estimar el gasto semanal. Lleva un diario de entrenamiento (app, libreta) durante 4 semanas. Si tu peso no se mueve en la dirección esperada, el problema está en la estimación de calorías consumidas (generalmente se subestima un 20-30%) o en el TDEE real. Ajusta en pasos de ±200 kcal/día.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Optimiza la recuperación: sueño, proteína y descanso</h4>
                <p>El ejercicio estimula las adaptaciones, pero estas ocurren en la recuperación. 7-9 horas de sueño son no negociables. Proteína adecuada (1,6-2g/kg de peso corporal) para preservar y construir músculo. Al menos 1 día de descanso por cada 2-3 de entrenamiento intenso. Sin recuperación adecuada, el mismo ejercicio produce menos resultado con más riesgo de lesión.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Evalúa progreso con métricas más allá de la báscula</h4>
                <p>El peso puede mantenerse estable mientras ganas músculo y pierdes grasa (recomposición corporal), especialmente en principiantes. Mide también: perímetro cintura/cadera, fotografías mensuales (misma luz y hora), marcas de rendimiento (velocidad, peso levantado), sensación de energía y calidad del sueño. La báscula es un indicador entre muchos, no el único.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section className={styles.eduTips}>
          <h2>✅ Claves para optimizar tu entrenamiento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧬</span>
              <h4>La dieta hace el 70-80%</h4>
              <p>No puedes superar una mala dieta con ejercicio. Una hora de running quema ~600 kcal; una pizza las repone en 5 minutos. Enfoca la energía en hábitos alimentarios sostenibles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💤</span>
              <h4>El sueño es el suplemento gratuito</h4>
              <p>Dormir 7-9 horas optimiza hormona de crecimiento, cortisol y leptina. Dormir 6h reduce el rendimiento un 20-30% y aumenta el apetito por alimentos calóricos al día siguiente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h4>Varía el estímulo cada 4-6 semanas</h4>
              <p>El cuerpo se adapta al ejercicio repetitivo y reduce su gasto. Cambia intensidad, duración, tipo de ejercicio o patrón de descanso para seguir progresando y evitar la meseta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏃</span>
              <h4>Más pasos, no solo más gimnasio</h4>
              <p>8.000-10.000 pasos diarios (NEAT) pueden quemar más calorías que una sesión de gym semanal. Sube escaleras, aparca lejos, camina en las llamadas. El movimiento cotidiano suma.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🥗</span>
              <h4>Proteína primero en cada comida</h4>
              <p>La proteína tiene efecto termogénico (quema el 20-30% de sus calorías en digestión), sacia más y preserva el músculo en déficit. 1,6-2g/kg de peso es el rango óptimo para deportistas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📈</span>
              <h4>Consistencia supera intensidad</h4>
              <p>3 sesiones semanales durante 6 meses superan siempre a 6 sesiones semanales durante 3 semanas. El hábito sostenible es la única estrategia que funciona a largo plazo.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores frecuentes que sabotean tus resultados de fitness</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Sobreestimar el gasto calórico del ejercicio:</strong> La mayoría de personas creen quemar el doble de lo real. Una hora de gym suele queman 300-400 kcal (no 800). Esto lleva a comer "de más" justificado por el ejercicio, anulando el déficit creado.</li>
            <li><strong>❌ Hacer solo cardio para perder peso:</strong> Sin entrenamiento de fuerza, hasta el 30-40% del peso perdido puede ser músculo. Menos músculo = metabolismo más lento = más difícil mantener el peso perdido. El cardio sin fuerza es la receta del "efecto rebote".</li>
            <li><strong>❌ No comer suficiente proteína en déficit calórico:</strong> Con menos de 1,2g/kg de proteína en déficit, el cuerpo cataboliza músculo para obtener energía. El músculo perdido reduce el metabolismo basal, haciendo cada vez más difícil el déficit. Prioriza proteína aunque reduzcas carbohidratos y grasas.</li>
            <li><strong>❌ Usar la báscula como único indicador de progreso:</strong> El peso puede aumentar en las primeras semanas de entrenamiento por retención hídrica y ganancia muscular, aunque se esté perdiendo grasa. Abandonar por ver la báscula estancada o subir es el error más común entre principiantes.</li>
            <li><strong>❌ Entrenar demasiado sin recuperación:</strong> Más no es siempre mejor. El sobreentrenamiento eleva el cortisol, degrada músculo, aumenta el riesgo de lesión y reduce el rendimiento. Señales de alerta: rendimiento decreciente, sueño peor, irritabilidad, lesiones frecuentes. El descanso es parte del entrenamiento.</li>
            <li><strong>❌ Buscar el ejercicio "que más quema" sin considerar la adherencia:</strong> El mejor ejercicio es el que harás consistentemente. Un running de 30 min que odias y abandonas en 2 semanas vale menos que caminar 45 min al día porque te gusta y lo mantienes un año.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-calorias-ejercicio')} />
      <ShareCard appName="calculadora-calorias-ejercicio" />
      <Footer appName="calculadora-calorias-ejercicio" />
    </div>
  );
}
