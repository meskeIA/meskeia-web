'use client';

import { useState } from 'react';
import styles from './CalculadoraIMC.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';

type Clasificacion = {
  texto: string;
  color: string;
  descripcion: string;
  icono: string;
};

const clasificaciones: Record<string, Clasificacion> = {
  bajo: {
    texto: 'Bajo peso',
    color: '#3498db',
    descripcion: 'IMC inferior a 18,5. Puede indicar desnutrición o problemas de salud.',
    icono: '⚠️',
  },
  normal: {
    texto: 'Peso normal',
    color: '#27ae60',
    descripcion: 'IMC entre 18,5 y 24,9. Peso saludable según la OMS.',
    icono: '✅',
  },
  sobrepeso: {
    texto: 'Sobrepeso',
    color: '#f39c12',
    descripcion: 'IMC entre 25 y 29,9. Riesgo aumentado de enfermedades.',
    icono: '⚡',
  },
  obesidad1: {
    texto: 'Obesidad grado I',
    color: '#e67e22',
    descripcion: 'IMC entre 30 y 34,9. Se recomienda consultar con un profesional.',
    icono: '🔶',
  },
  obesidad2: {
    texto: 'Obesidad grado II',
    color: '#e74c3c',
    descripcion: 'IMC entre 35 y 39,9. Riesgo alto de complicaciones de salud.',
    icono: '🔴',
  },
  obesidad3: {
    texto: 'Obesidad grado III',
    color: '#c0392b',
    descripcion: 'IMC igual o superior a 40. Requiere atención médica especializada.',
    icono: '🚨',
  },
};

function obtenerClasificacion(imc: number): Clasificacion {
  if (imc < 18.5) return clasificaciones.bajo;
  if (imc < 25) return clasificaciones.normal;
  if (imc < 30) return clasificaciones.sobrepeso;
  if (imc < 35) return clasificaciones.obesidad1;
  if (imc < 40) return clasificaciones.obesidad2;
  return clasificaciones.obesidad3;
}

function calcularPesoIdeal(alturaCm: number): { min: number; max: number } {
  const alturaM = alturaCm / 100;
  return {
    min: 18.5 * alturaM * alturaM,
    max: 24.9 * alturaM * alturaM,
  };
}

export default function CalculadoraIMCPage() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState<{
    imc: number;
    clasificacion: Clasificacion;
    pesoIdeal: { min: number; max: number };
    diferencia: number;
  } | null>(null);

  const calcular = () => {
    const pesoNum = parseSpanishNumber(peso);
    const alturaNum = parseSpanishNumber(altura);

    if (pesoNum <= 0 || alturaNum <= 0) {
      return;
    }

    const alturaM = alturaNum / 100;
    const imc = pesoNum / (alturaM * alturaM);
    const clasificacion = obtenerClasificacion(imc);
    const pesoIdeal = calcularPesoIdeal(alturaNum);

    // Diferencia respecto al peso ideal más cercano
    let diferencia = 0;
    if (pesoNum < pesoIdeal.min) {
      diferencia = pesoNum - pesoIdeal.min;
    } else if (pesoNum > pesoIdeal.max) {
      diferencia = pesoNum - pesoIdeal.max;
    }

    setResultado({ imc, clasificacion, pesoIdeal, diferencia });
  };

  const limpiar = () => {
    setPeso('');
    setAltura('');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚖️ Calculadora de IMC</h1>
        <p className={styles.subtitle}>
          Calcula tu Índice de Masa Corporal y conoce tu clasificación según la OMS
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
            max={500}
          />

          <NumberInput
            value={altura}
            onChange={setAltura}
            label="Altura"
            placeholder="175"
            helperText="Tu altura en centímetros"
            min={50}
            max={250}
          />

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular IMC
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          <div className={styles.formula}>
            <h3>📐 Fórmula del IMC</h3>
            <p className={styles.formulaText}>
              IMC = Peso (kg) ÷ Altura² (m)
            </p>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div
                className={styles.imcDisplay}
                style={{ borderColor: resultado.clasificacion.color }}
              >
                <span className={styles.imcLabel}>Tu IMC</span>
                <span
                  className={styles.imcValue}
                  style={{ color: resultado.clasificacion.color }}
                >
                  {formatNumber(resultado.imc, 1)}
                </span>
                <span
                  className={styles.imcClasificacion}
                  style={{ backgroundColor: resultado.clasificacion.color }}
                >
                  {resultado.clasificacion.icono} {resultado.clasificacion.texto}
                </span>
              </div>

              <p className={styles.descripcion}>
                {resultado.clasificacion.descripcion}
              </p>

              <div className={styles.resultCards}>
                <ResultCard
                  title="Peso ideal"
                  value={`${formatNumber(resultado.pesoIdeal.min, 1)} - ${formatNumber(resultado.pesoIdeal.max, 1)}`}
                  unit="kg"
                  variant="info"
                  icon="🎯"
                  description="Rango de peso saludable para tu altura"
                />

                {resultado.diferencia !== 0 && (
                  <ResultCard
                    title={resultado.diferencia > 0 ? 'Exceso de peso' : 'Peso a ganar'}
                    value={formatNumber(Math.abs(resultado.diferencia), 1)}
                    unit="kg"
                    variant={resultado.diferencia > 0 ? 'warning' : 'info'}
                    icon={resultado.diferencia > 0 ? '📉' : '📈'}
                    description={
                      resultado.diferencia > 0
                        ? 'Kilos por encima del peso ideal máximo'
                        : 'Kilos por debajo del peso ideal mínimo'
                    }
                  />
                )}
              </div>

              <div className={styles.tablaIMC}>
                <h3>📊 Clasificación OMS</h3>
                <table>
                  <thead>
                    <tr>
                      <th>IMC</th>
                      <th>Clasificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={resultado.imc < 18.5 ? styles.activo : ''}>
                      <td>&lt; 18,5</td>
                      <td>Bajo peso</td>
                    </tr>
                    <tr className={resultado.imc >= 18.5 && resultado.imc < 25 ? styles.activo : ''}>
                      <td>18,5 - 24,9</td>
                      <td>Peso normal</td>
                    </tr>
                    <tr className={resultado.imc >= 25 && resultado.imc < 30 ? styles.activo : ''}>
                      <td>25 - 29,9</td>
                      <td>Sobrepeso</td>
                    </tr>
                    <tr className={resultado.imc >= 30 && resultado.imc < 35 ? styles.activo : ''}>
                      <td>30 - 34,9</td>
                      <td>Obesidad grado I</td>
                    </tr>
                    <tr className={resultado.imc >= 35 && resultado.imc < 40 ? styles.activo : ''}>
                      <td>35 - 39,9</td>
                      <td>Obesidad grado II</td>
                    </tr>
                    <tr className={resultado.imc >= 40 ? styles.activo : ''}>
                      <td>≥ 40</td>
                      <td>Obesidad grado III</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⚖️</span>
              <p>Introduce tu peso y altura para calcular tu IMC</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          El IMC es un indicador general que no tiene en cuenta factores como la masa muscular,
          la distribución de grasa corporal, la edad o el sexo. Los deportistas con alta masa
          muscular pueden tener un IMC elevado sin tener sobrepeso real. Esta calculadora es
          orientativa y <strong>no sustituye la valoración de un profesional de la salud</strong>.
        </p>
      </div>

      <Footer appName="calculadora-imc" />
    </div>
  );
}
