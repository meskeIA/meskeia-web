'use client';

import { useState } from 'react';
import styles from './CalculadoraCalorias.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
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

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Los valores MET (Equivalente Metabólico de Tarea) son promedios científicos que pueden variar
          según la intensidad real, condición física, edad y otros factores individuales. Esta calculadora
          proporciona estimaciones orientativas y <strong>no sustituye el asesoramiento de un profesional
          de la salud o entrenador personal</strong>.
        </p>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre calorías y ejercicio?"
        subtitle="Descubre cómo funcionan los MET, optimiza tu entrenamiento y entiende el gasto energético"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔥 ¿Qué son los MET?</h4>
              <p>
                MET significa Equivalente Metabólico de Tarea. 1 MET equivale al consumo de
                oxígeno en reposo (3,5 ml O₂/kg/min). Una actividad de 5 MET significa que
                quemas 5 veces más calorías que estando en reposo absoluto.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>⚡ Efecto EPOC</h4>
              <p>
                El EPOC (Excess Post-exercise Oxygen Consumption) es el consumo extra de
                calorías después del ejercicio. El entrenamiento HIIT y pesas generan mayor
                EPOC que el cardio suave, quemando calorías hasta 24-48h después.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Factores que afectan al gasto</h4>
              <p>
                El gasto calórico real depende de: peso corporal (más peso = más gasto),
                intensidad real (no solo tipo de ejercicio), condición física (más eficiente
                = menos gasto), temperatura ambiente y altitud.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 Déficit vs Superávit</h4>
              <p>
                Para perder 1 kg de grasa necesitas un déficit de ~7.700 kcal. Para ganar
                músculo, un superávit moderado de 300-500 kcal con entrenamiento de fuerza.
                El ejercicio ayuda, pero la alimentación es el factor principal.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Por qué quemo menos calorías que mi amigo haciendo lo mismo?</summary>
              <p>
                El gasto calórico depende principalmente del peso corporal. Una persona de
                90 kg quema más calorías que una de 60 kg haciendo el mismo ejercicio.
                También influye la eficiencia: personas entrenadas son más eficientes y
                pueden quemar menos calorías en la misma actividad.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Es mejor cardio o pesas para quemar calorías?</summary>
              <p>
                El cardio quema más calorías durante el ejercicio. Pero las pesas generan
                mayor EPOC y aumentan la masa muscular, lo que eleva el metabolismo basal.
                Lo ideal es combinar ambos: entrenamiento de fuerza 2-3 veces/semana y
                cardio 2-3 veces/semana para resultados óptimos.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo confiar en las calorías que marca mi smartwatch?</summary>
              <p>
                Los dispositivos wearables tienen un margen de error del 15-30%. Son útiles
                para comparar entre días o actividades, pero no como valor absoluto. Los
                pulsómetros de pecho son más precisos que los de muñeca.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuánto ejercicio necesito para compensar una comida?</summary>
              <p>
                Mejor enfoque: no "compensar" comidas con ejercicio (crea una relación
                insana). Una hamburguesa (~540 kcal) requiere ~1 hora de running. Es más
                práctico mantener un déficit moderado diario que intentar quemar excesos
                puntuales.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-calorias-ejercicio" />
    </div>
  );
}
