'use client';

import { useState } from 'react';
import styles from './CalculadoraHidratacion.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';

type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
type Clima = 'frio' | 'templado' | 'calido' | 'muy_calido';

interface FactorActividad {
  nombre: string;
  factor: number;
  descripcion: string;
  icono: string;
}

interface FactorClima {
  nombre: string;
  factor: number;
  descripcion: string;
  icono: string;
}

const nivelesActividad: Record<NivelActividad, FactorActividad> = {
  sedentario: {
    nombre: 'Sedentario',
    factor: 1.0,
    descripcion: 'Trabajo de oficina, poco movimiento',
    icono: '🪑',
  },
  ligero: {
    nombre: 'Actividad ligera',
    factor: 1.15,
    descripcion: 'Caminatas cortas, tareas domésticas',
    icono: '🚶',
  },
  moderado: {
    nombre: 'Actividad moderada',
    factor: 1.3,
    descripcion: 'Ejercicio 2-3 veces por semana',
    icono: '🏃',
  },
  activo: {
    nombre: 'Muy activo',
    factor: 1.5,
    descripcion: 'Ejercicio diario o trabajo físico',
    icono: '💪',
  },
  muy_activo: {
    nombre: 'Atleta/Deportista',
    factor: 1.75,
    descripcion: 'Entrenamiento intensivo diario',
    icono: '🏆',
  },
};

const tiposClima: Record<Clima, FactorClima> = {
  frio: {
    nombre: 'Frío',
    factor: 0.9,
    descripcion: 'Menos de 15°C',
    icono: '❄️',
  },
  templado: {
    nombre: 'Templado',
    factor: 1.0,
    descripcion: '15-25°C',
    icono: '🌤️',
  },
  calido: {
    nombre: 'Cálido',
    factor: 1.2,
    descripcion: '25-35°C',
    icono: '☀️',
  },
  muy_calido: {
    nombre: 'Muy cálido',
    factor: 1.4,
    descripcion: 'Más de 35°C',
    icono: '🔥',
  },
};

export default function CalculadoraHidratacionPage() {
  const [peso, setPeso] = useState('');
  const [actividad, setActividad] = useState<NivelActividad>('moderado');
  const [clima, setClima] = useState<Clima>('templado');
  const [resultado, setResultado] = useState<{
    litrosBase: number;
    litrosTotal: number;
    vasos: number;
    distribucion: { momento: string; cantidad: string; icono: string }[];
  } | null>(null);

  const calcular = () => {
    const pesoNum = parseSpanishNumber(peso);

    if (pesoNum <= 0) {
      return;
    }

    // Fórmula base: 35ml por kg de peso corporal
    const mlBase = pesoNum * 35;
    const litrosBase = mlBase / 1000;

    // Aplicar factores de actividad y clima
    const factorActividad = nivelesActividad[actividad].factor;
    const factorClima = tiposClima[clima].factor;

    const litrosTotal = litrosBase * factorActividad * factorClima;
    const vasos = Math.ceil((litrosTotal * 1000) / 250); // Vasos de 250ml

    // Distribución recomendada a lo largo del día
    const porVaso = litrosTotal / vasos;
    const distribucion = [
      { momento: 'Al despertar', cantidad: formatNumber(porVaso * 2, 1) + ' L', icono: '🌅' },
      { momento: 'Mañana', cantidad: formatNumber(porVaso * 3, 1) + ' L', icono: '☀️' },
      { momento: 'Con comidas', cantidad: formatNumber(porVaso * 2, 1) + ' L', icono: '🍽️' },
      { momento: 'Tarde', cantidad: formatNumber(porVaso * 2, 1) + ' L', icono: '🌤️' },
      { momento: 'Noche', cantidad: formatNumber(porVaso * 1, 1) + ' L', icono: '🌙' },
    ];

    setResultado({ litrosBase, litrosTotal, vasos, distribucion });
  };

  const limpiar = () => {
    setPeso('');
    setActividad('moderado');
    setClima('templado');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💧 Calculadora de Hidratación</h1>
        <p className={styles.subtitle}>
          Descubre cuánta agua necesitas beber al día para mantener una hidratación óptima
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

          <div className={styles.selectSection}>
            <label className={styles.label}>Nivel de actividad física</label>
            <div className={styles.opcionesGrid}>
              {(Object.entries(nivelesActividad) as [NivelActividad, FactorActividad][]).map(
                ([key, valor]) => (
                  <button
                    key={key}
                    className={`${styles.opcionCard} ${actividad === key ? styles.seleccionada : ''}`}
                    onClick={() => setActividad(key)}
                  >
                    <span className={styles.opcionIcono}>{valor.icono}</span>
                    <span className={styles.opcionNombre}>{valor.nombre}</span>
                    <span className={styles.opcionDesc}>{valor.descripcion}</span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className={styles.selectSection}>
            <label className={styles.label}>Clima habitual</label>
            <div className={styles.climaGrid}>
              {(Object.entries(tiposClima) as [Clima, FactorClima][]).map(([key, valor]) => (
                <button
                  key={key}
                  className={`${styles.climaCard} ${clima === key ? styles.seleccionada : ''}`}
                  onClick={() => setClima(key)}
                >
                  <span className={styles.climaIcono}>{valor.icono}</span>
                  <span className={styles.climaNombre}>{valor.nombre}</span>
                  <span className={styles.climaTemp}>{valor.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary} disabled={!peso}>
              Calcular Hidratación
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.aguaIcono}>💧</span>
                <div className={styles.litrosDisplay}>
                  <span className={styles.litrosValor}>{formatNumber(resultado.litrosTotal, 1)}</span>
                  <span className={styles.litrosUnidad}>litros/día</span>
                </div>
                <span className={styles.vasosInfo}>
                  ≈ {resultado.vasos} vasos de 250ml
                </span>
              </div>

              <div className={styles.resultCards}>
                <ResultCard
                  title="Hidratación base"
                  value={formatNumber(resultado.litrosBase, 1)}
                  unit="L"
                  variant="info"
                  icon="📊"
                  description="Sin ajustes por actividad o clima"
                />
                <ResultCard
                  title="Factor actividad"
                  value={`×${nivelesActividad[actividad].factor}`}
                  variant="default"
                  icon={nivelesActividad[actividad].icono}
                  description={nivelesActividad[actividad].nombre}
                />
                <ResultCard
                  title="Factor clima"
                  value={`×${tiposClima[clima].factor}`}
                  variant="default"
                  icon={tiposClima[clima].icono}
                  description={tiposClima[clima].nombre}
                />
              </div>

              <div className={styles.distribucionSection}>
                <h3>📅 Distribución recomendada</h3>
                <div className={styles.distribucionGrid}>
                  {resultado.distribucion.map((item, index) => (
                    <div key={index} className={styles.distribucionCard}>
                      <span className={styles.distIcono}>{item.icono}</span>
                      <span className={styles.distMomento}>{item.momento}</span>
                      <span className={styles.distCantidad}>{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.tipsSection}>
                <h3>💡 Consejos de hidratación</h3>
                <ul className={styles.tipsList}>
                  <li>Bebe un vaso de agua al despertar para activar el metabolismo</li>
                  <li>No esperes a tener sed; cuando la sientes, ya hay deshidratación leve</li>
                  <li>Aumenta la ingesta durante el ejercicio (150-250ml cada 15-20 min)</li>
                  <li>El color de la orina indica hidratación: amarillo claro es óptimo</li>
                  <li>Frutas y verduras también aportan agua (sandía, pepino, naranja)</li>
                </ul>
              </div>

              <div className={styles.formulaBox}>
                <h4>📐 Fórmula utilizada</h4>
                <p className={styles.formulaText}>
                  Agua = (Peso × 35ml) × Factor Actividad × Factor Clima
                </p>
                <p className={styles.formulaDetalle}>
                  {formatNumber(resultado.litrosTotal, 2)}L = ({peso} × 0,035) × {nivelesActividad[actividad].factor} × {tiposClima[clima].factor}
                </p>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>💧</span>
              <p>Introduce tu peso y selecciona tu nivel de actividad para calcular tu hidratación diaria</p>
            </div>
          )}
        </div>
      </div>


      {/* Disclaimer Médico */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        context="calculadora-hidratacion"
      >
        <p>
          Estas recomendaciones son <strong>orientativas para adultos sanos</strong>. La hidratación adecuada
          varía mucho según tu situación individual:
        </p>

        <ul className={styles.disclaimerList}>
          <li><strong>NO aplicable a personas con restricción de líquidos</strong>: Insuficiencia cardíaca, insuficiencia renal o cirrosis hepática pueden requerir LIMITAR la ingesta de agua. Sigue las indicaciones de tu nefrólogo/cardiólogo</li>
          <li><strong>Embarazo y lactancia</strong>: Las necesidades de líquidos aumentan significativamente. Consulta con tu matrona o médico</li>
          <li><strong>Medicamentos diuréticos</strong>: Si tomas diuréticos, tu médico debe indicarte la ingesta de líquidos apropiada</li>
          <li><strong>Condiciones que alteran la sed</strong>: Diabetes insípida, diabetes mellitus no controlada o edad avanzada pueden afectar la sensación de sed</li>
        </ul>

        <p className={styles.highlight}>
          <strong>⚕️ Si tienes enfermedad renal, cardíaca o hepática, NO uses esta calculadora.</strong>
          Sigue estrictamente las indicaciones médicas sobre ingesta de líquidos. El exceso de agua puede ser peligroso en estas condiciones.
        </p>
      </DisclaimerCard>

      <EducationalSection
        title="¿Quieres aprender más sobre hidratación?"
        subtitle="Tablas comparativas, casos reales, preguntas frecuentes y guía paso a paso para hidratarte correctamente"
        defaultOpen={false}
      >
        <div className={styles.eduComparativa}>
          <h2>Necesidades de hidratación según actividad y condición</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr><th>Perfil</th><th>Agua base (L/día)</th><th>Extra actividad</th><th>Extra calor/humedad</th><th>Señal de alerta</th></tr>
              </thead>
              <tbody>
                <tr><td>Adulto sedentario</td><td>2,0–2,5 L</td><td>—</td><td>+0,5 L por cada 10°C extra</td><td>Orina oscura (amarillo intenso)</td></tr>
                <tr><td>Deportista moderado (1h/día)</td><td>2,5–3,0 L</td><td>+0,5–0,75 L por hora</td><td>+0,5–1 L adicional</td><td>Pérdida de más del 2% peso corporal</td></tr>
                <tr><td>Deportista de alto rendimiento</td><td>3,0–4,0 L</td><td>+1–1,5 L por hora intensa</td><td>+1–2 L adicional</td><td>Calambres, mareo, bajada de rendimiento</td></tr>
                <tr><td>Embarazada</td><td>2,3–3,0 L</td><td>+0,3 L extra base</td><td>+0,5 L</td><td>Orina concentrada, edemas en piernas</td></tr>
                <tr><td>Persona mayor +65</td><td>1,8–2,5 L</td><td>+0,3 L por actividad moderada</td><td>Alto riesgo: +0,5 L mínimo</td><td>Confusión, sequedad de boca intensa</td></tr>
                <tr><td>Trabajador en calor extremo</td><td>3,0–4,0 L</td><td>+1–2 L por turno</td><td>Reposición cada 15–20 min</td><td>Golpe de calor: emergencia médica</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.eduEscenarios}>
          <h2>Casos reales de hidratación</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏃</span><h3>Corredor de maratón</h3></div>
              <p className={styles.escenarioExample}>En una maratón se pierden 1–2 L/hora por sudor. Beber solo agua puede provocar hiponatremia (sodio bajo). Lo correcto: bebidas isotónicas + agua, 150–200 ml cada 20 min.</p>
              <span className={styles.escenarioTip}>Demasiada agua sin sales = hiponatremia</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>💼</span><h3>Oficinista con AC</h3></div>
              <p className={styles.escenarioExample}>El aire acondicionado reseca el ambiente y aumenta la pérdida insensible de agua. Muchos no sienten sed porque están en ambiente frío. Resultado: deshidratación crónica leve que reduce concentración y energía.</p>
              <span className={styles.escenarioTip}>Pon un vaso de agua en tu escritorio, visible</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>👵</span><h3>Anciano en verano</h3></div>
              <p className={styles.escenarioExample}>La percepción de sed disminuye con la edad. Los mayores pueden estar significativamente deshidratados sin sentir sed. Con calor extremo, el riesgo de golpe de calor es muy alto. Hidratación proactiva, no reactiva.</p>
              <span className={styles.escenarioTip}>Beber aunque no tengan sed: vital en verano</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🤒</span><h3>Persona con fiebre o diarrea</h3></div>
              <p className={styles.escenarioExample}>Fiebre de 38°C aumenta las pérdidas en ~0,5 L/día. La diarrea puede causar deshidratación aguda en horas. Solución de rehidratación oral (agua + sal + azúcar) es más efectiva que agua sola en estos casos.</p>
              <span className={styles.escenarioTip}>Suero oral &gt; agua sola en enfermedad</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🤰</span><h3>Embarazada en tercer trimestre</h3></div>
              <p className={styles.escenarioExample}>El volumen sanguíneo aumenta un 50% durante el embarazo. La deshidratación puede provocar contracciones prematuras. Necesidad mínima: 2,3 L/día de todas las fuentes, más en calor o actividad física.</p>
              <span className={styles.escenarioTip}>La deshidratación puede provocar contracciones</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏗️</span><h3>Trabajador en obra en verano</h3></div>
              <p className={styles.escenarioExample}>Con 35°C y trabajo físico intenso, las pérdidas pueden superar 2 L/hora. El protocolo de prevención: 250 ml cada 15–20 min, no esperar a tener sed, reponer electrolitos, pausas en la sombra.</p>
              <span className={styles.escenarioTip}>250 ml cada 20 min en calor extremo</span>
            </div>
          </div>
        </div>

        <div className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre hidratación</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}><h4>¿El café y el té deshidratan?</h4><p>Mito desmentido. Aunque la cafeína tiene efecto diurético leve, el agua que contienen el café y el té compensa con creces. Contribuyen positivamente a la hidratación diaria. Solo dosis muy altas de cafeína (&gt;500 mg/día) tienen efecto neto deshidratante.</p></div>
            <div className={styles.faqItem}><h4>¿Cuánta agua debo beber exactamente?</h4><p>La recomendación de "8 vasos al día" es un mito simplificado. Las necesidades varían según peso corporal, actividad, clima y dieta. Una guía práctica: 35 ml/kg de peso corporal. Además, el 20–30% de la hidratación proviene de los alimentos.</p></div>
            <div className={styles.faqItem}><h4>¿Cómo sé si estoy bien hidratado?</h4><p>El mejor indicador gratuito es el color de la orina: amarillo pálido (paja) = bien hidratado. Amarillo oscuro o ámbar = bebe más agua. Incolora = posible sobrehidratación. También: no sentir sed intensa, orina 4–6 veces al día.</p></div>
            <div className={styles.faqItem}><h4>¿Es posible beber demasiada agua?</h4><p>Sí. La hiponatremia (exceso de agua que diluye el sodio) puede ser peligrosa o mortal. Ocurre principalmente en deportistas de resistencia que beben solo agua sin reponer sales. En personas sanas con actividad normal, los riñones regulan el exceso eficientemente.</p></div>
            <div className={styles.faqItem}><h4>¿Las bebidas isotónicas son necesarias?</h4><p>Solo en ejercicio intenso de más de 60–90 minutos o en condiciones de calor extremo. Para actividad moderada o hidratación diaria, el agua es suficiente. Las bebidas isotónicas contienen azúcares y calorías que en ejercicio ligero son innecesarias.</p></div>
            <div className={styles.faqItem}><h4>¿Contar el agua de los alimentos?</h4><p>Sí. La fruta y verdura aportan mucha agua: sandía (92% agua), pepino (97%), tomate (95%), lechuga (96%). Una dieta rica en frutas y verduras puede aportar 0,5–1 L de agua al día. Por eso la recomendación de "2 L de agua pura" ya incluye este aporte en algunas guías.</p></div>
            <div className={styles.faqItem}><h4>¿La hidratación afecta al rendimiento cognitivo?</h4><p>Sí, significativamente. Una deshidratación del 1–2% del peso corporal ya deteriora la atención, la memoria a corto plazo y el tiempo de reacción. En oficinas con AC, donde no se siente calor ni sed, la deshidratación leve crónica es muy común y reduce la productividad.</p></div>
            <div className={styles.faqItem}><h4>¿Necesito más agua si tomo medicamentos?</h4><p>Depende del medicamento. Diuréticos, antihistamínicos, laxantes y algunos antidepresivos aumentan las necesidades de agua. Consulta con tu médico o farmacéutico. En general, si tomas medicación crónica, err por el lado de beber un poco más.</p></div>
          </div>
        </div>

        <div className={styles.eduGuia}>
          <h2>Cómo hidratarte correctamente en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><strong>Calcula tu necesidad base</strong><p>Multiplica tu peso en kg × 35 ml. Ejemplo: 70 kg × 35 ml = 2.450 ml/día como base. Ajusta según actividad, clima y condición de salud usando esta calculadora.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><strong>Empieza el día con agua</strong><p>Un vaso de 250–300 ml al despertar rehidrata tras 7–8 horas sin beber, activa el metabolismo y mejora la concentración matutina. Hazlo antes del café.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><strong>Distribuye la ingesta a lo largo del día</strong><p>No bebas todo de golpe. Lo ideal es beber regularmente cada 1–2 horas. Un truco: lleva una botella de 500 ml y complétala 4 veces al día. El cuerpo absorbe mejor agua distribuida que en grandes cantidades.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>4</div><div className={styles.stepContent}><strong>Ajusta según el ejercicio</strong><p>Bebe 500 ml en las 2h previas al ejercicio, 150–200 ml cada 15–20 min durante, y rehidrata después: 1,5 L por cada kg de peso perdido durante el ejercicio (pésate antes y después si haces ejercicio intenso).</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>5</div><div className={styles.stepContent}><strong>Monitoriza el color de tu orina</strong><p>Establece el hábito de comprobar el color una vez al día. Amarillo pálido = bien. Amarillo oscuro = bebe más. Adapta tu ingesta diaria según esta señal natural del cuerpo.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>6</div><div className={styles.stepContent}><strong>Incluye alimentos ricos en agua</strong><p>Frutas (sandía, melón, naranja, fresa) y verduras (pepino, lechuga, tomate, calabacín) contribuyen 500–1.000 ml/día. Una dieta mediterránea rica en estos alimentos facilita enormemente cumplir los objetivos de hidratación.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>7</div><div className={styles.stepContent}><strong>Ajusta en situaciones especiales</strong><p>Fiebre (+0,5 L por grado sobre 37°C), diarrea/vómitos (reposición urgente con suero oral), vuelos de larga distancia (+0,5–1 L por cada 4h de vuelo), calor extremo (protocolo 250 ml/20 min en exterior).</p></div></div>
          </div>
        </div>

        <div className={styles.eduTips}>
          <h2>Trucos para beber más agua sin esfuerzo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🍋</span><strong>Aromatiza tu agua</strong><p>Añade rodajas de limón, pepino, menta o jengibre. El sabor suave hace que bebas más sin añadir azúcar ni calorías. Infusiones frías también cuentan.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📱</span><strong>Apps de recordatorio</strong><p>Usa WaterMinder, Hydro Coach o simplemente alarmas en el móvil cada 1–2 horas. Los primeros 21 días necesitas el recordatorio; luego se convierte en hábito.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🫙</span><strong>Botella visible en tu mesa</strong><p>El principio de "lo que ves, lo haces". Una botella de 1L en tu escritorio que vacíes dos veces al día es más efectiva que cualquier app.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🍽️</span><strong>Agua antes de cada comida</strong><p>Un vaso de agua 15–20 min antes de comer mejora la hidratación y reduce ligeramente el apetito. Crea un ritual automático ligado a algo que ya haces.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🫧</span><strong>Agua con gas si no te gusta la natural</strong><p>El agua carbonatada hidrata igual que el agua plana. Si el agua natural te parece aburrida, el agua con gas (sin azúcar) es una alternativa perfectamente válida.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🌿</span><strong>Sopa e infusiones en invierno</strong><p>En invierno la sed disminuye pero las necesidades no. Sopas, caldos e infusiones calientes son una forma excelente de mantener la hidratación cuando el agua fría no apetece.</p></div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Señales de deshidratación y errores frecuentes</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Esperar a tener sed para beber — la sed es ya un signo de deshidratación leve (1–2% del peso corporal perdido)</li>
            <li>Beber solo refrescos o zumos como fuente principal de líquidos — el azúcar aumenta la carga renal y no hidrata tan eficientemente como el agua</li>
            <li>Ignorar la hidratación en invierno o en ambientes fríos — la pérdida insensible de agua por respiración continúa aunque no sudes</li>
            <li>Compensar toda la hidratación del día en una sola vez — el riñón elimina el exceso y no lo "guarda" para más tarde</li>
            <li>No reponer electrolitos tras ejercicio intenso prolongado — el agua sola sin sales puede provocar hiponatremia en deportes de resistencia</li>
            <li>Confundir hambre con sed — el centro de la saciedad y la sed están muy próximos en el hipotálamo; bebe agua antes de picar</li>
            <li>No aumentar la ingesta durante enfermedad con fiebre, vómitos o diarrea — estas situaciones pueden provocar deshidratación aguda en pocas horas</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-hidratacion')} />
      <ShareCard appName="calculadora-hidratacion" />
      <Footer appName="calculadora-hidratacion" />
    </div>
  );
}
