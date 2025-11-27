'use client';

import { useState } from 'react';
import styles from './CalculadoraHidratacion.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard } from '@/components';
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

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Estas recomendaciones son orientativas para adultos sanos. Las necesidades de hidratación
          pueden variar según condiciones médicas, medicamentos, embarazo o lactancia. Consulta con
          un profesional de la salud si tienes dudas sobre tu ingesta de líquidos. <strong>Personas
          con problemas renales o cardíacos deben seguir indicaciones médicas específicas</strong>.
        </p>
      </div>

      <Footer appName="calculadora-hidratacion" />
    </div>
  );
}
