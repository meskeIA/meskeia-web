'use client';

import { useState } from 'react';
import styles from './CalculadoraPercentiles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type Sexo = 'nino' | 'nina';

// Datos OMS simplificados para peso (kg) por edad en meses - Percentiles P3, P15, P50, P85, P97
const PESO_NINOS: Record<number, number[]> = {
  0: [2.5, 2.9, 3.3, 3.9, 4.4],
  1: [3.4, 3.9, 4.5, 5.1, 5.8],
  2: [4.3, 4.9, 5.6, 6.3, 7.1],
  3: [5.0, 5.7, 6.4, 7.2, 8.0],
  6: [6.4, 7.1, 7.9, 8.8, 9.8],
  9: [7.2, 8.0, 8.9, 9.9, 11.0],
  12: [7.8, 8.6, 9.6, 10.8, 12.0],
  18: [8.8, 9.7, 10.9, 12.2, 13.7],
  24: [9.7, 10.8, 12.2, 13.6, 15.3],
  36: [11.3, 12.7, 14.3, 16.2, 18.3],
  48: [12.7, 14.4, 16.3, 18.6, 21.2],
  60: [14.1, 16.0, 18.3, 21.0, 24.2],
};

const PESO_NINAS: Record<number, number[]> = {
  0: [2.4, 2.8, 3.2, 3.7, 4.2],
  1: [3.2, 3.6, 4.2, 4.8, 5.5],
  2: [3.9, 4.5, 5.1, 5.8, 6.6],
  3: [4.5, 5.2, 5.8, 6.6, 7.5],
  6: [5.7, 6.5, 7.3, 8.2, 9.3],
  9: [6.5, 7.3, 8.2, 9.3, 10.5],
  12: [7.0, 7.9, 8.9, 10.1, 11.5],
  18: [8.1, 9.1, 10.2, 11.6, 13.2],
  24: [9.0, 10.2, 11.5, 13.0, 14.8],
  36: [10.8, 12.3, 14.0, 16.0, 18.3],
  48: [12.3, 14.0, 16.1, 18.5, 21.5],
  60: [13.7, 15.8, 18.2, 21.2, 24.9],
};

// Datos OMS simplificados para talla (cm) por edad en meses
const TALLA_NINOS: Record<number, number[]> = {
  0: [46.1, 48.0, 49.9, 51.8, 53.7],
  1: [50.8, 52.8, 54.7, 56.7, 58.6],
  2: [54.4, 56.4, 58.4, 60.4, 62.4],
  3: [57.3, 59.4, 61.4, 63.5, 65.5],
  6: [63.3, 65.5, 67.6, 69.8, 71.9],
  9: [67.5, 69.7, 72.0, 74.2, 76.5],
  12: [71.0, 73.4, 75.7, 78.1, 80.5],
  18: [76.9, 79.6, 82.3, 85.0, 87.7],
  24: [81.7, 84.8, 87.8, 90.9, 94.0],
  36: [89.9, 93.5, 96.1, 99.8, 103.5],
  48: [96.1, 100.3, 103.3, 107.5, 111.7],
  60: [102.0, 106.7, 110.0, 114.6, 119.2],
};

const TALLA_NINAS: Record<number, number[]> = {
  0: [45.4, 47.3, 49.1, 51.0, 52.9],
  1: [49.8, 51.7, 53.7, 55.6, 57.6],
  2: [53.0, 55.0, 57.1, 59.1, 61.1],
  3: [55.6, 57.7, 59.8, 61.9, 64.0],
  6: [61.2, 63.5, 65.7, 68.0, 70.3],
  9: [65.3, 67.7, 70.1, 72.6, 75.0],
  12: [68.9, 71.4, 74.0, 76.6, 79.2],
  18: [74.9, 77.8, 80.7, 83.6, 86.5],
  24: [80.0, 83.2, 86.4, 89.6, 92.9],
  36: [88.4, 91.9, 95.1, 99.1, 102.7],
  48: [94.9, 98.9, 102.7, 106.9, 111.3],
  60: [101.1, 105.5, 109.4, 114.2, 118.9],
};

export default function CalculadoraPercentilesPage() {
  const [sexo, setSexo] = useState<Sexo>('nino');
  const [edadMeses, setEdadMeses] = useState('');
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [resultado, setResultado] = useState<{
    percentilPeso: string;
    percentilTalla: string;
    interpretacionPeso: string;
    interpretacionTalla: string;
  } | null>(null);

  const obtenerEdadMasCercana = (meses: number): number => {
    const edades = [0, 1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60];
    return edades.reduce((prev, curr) =>
      Math.abs(curr - meses) < Math.abs(prev - meses) ? curr : prev
    );
  };

  const calcularPercentil = (valor: number, referencias: number[]): string => {
    // referencias = [P3, P15, P50, P85, P97]
    if (valor < referencias[0]) return '< 3';
    if (valor < referencias[1]) return '3-15';
    if (valor < referencias[2]) return '15-50';
    if (valor < referencias[3]) return '50-85';
    if (valor < referencias[4]) return '85-97';
    return '> 97';
  };

  const obtenerInterpretacion = (percentil: string): string => {
    if (percentil === '< 3') return 'Por debajo del rango normal. Consultar pediatra.';
    if (percentil === '3-15') return 'Rango bajo-normal.';
    if (percentil === '15-50') return 'Rango normal.';
    if (percentil === '50-85') return 'Rango normal.';
    if (percentil === '85-97') return 'Rango alto-normal.';
    return 'Por encima del rango normal. Consultar pediatra.';
  };

  const calcular = () => {
    const meses = parseInt(edadMeses);
    const pesoNum = parseFloat(peso.replace(',', '.'));
    const tallaNum = parseFloat(talla.replace(',', '.'));

    if (isNaN(meses) || meses < 0 || meses > 60) return;
    if (isNaN(pesoNum) || pesoNum <= 0) return;
    if (isNaN(tallaNum) || tallaNum <= 0) return;

    const edadRef = obtenerEdadMasCercana(meses);
    const tablaPeso = sexo === 'nino' ? PESO_NINOS : PESO_NINAS;
    const tablaTalla = sexo === 'nino' ? TALLA_NINOS : TALLA_NINAS;

    const refPeso = tablaPeso[edadRef];
    const refTalla = tablaTalla[edadRef];

    if (!refPeso || !refTalla) return;

    const percentilPeso = calcularPercentil(pesoNum, refPeso);
    const percentilTalla = calcularPercentil(tallaNum, refTalla);

    setResultado({
      percentilPeso,
      percentilTalla,
      interpretacionPeso: obtenerInterpretacion(percentilPeso),
      interpretacionTalla: obtenerInterpretacion(percentilTalla),
    });
  };

  const limpiar = () => {
    setEdadMeses('');
    setPeso('');
    setTalla('');
    setResultado(null);
  };

  const getColorPercentil = (percentil: string): string => {
    if (percentil === '< 3' || percentil === '> 97') return styles.alerta;
    if (percentil === '3-15' || percentil === '85-97') return styles.atencion;
    return styles.normal;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Percentiles Infantiles</h1>
        <p className={styles.subtitle}>
          Compara el peso y talla de tu hijo con las tablas de la OMS
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Datos del niño/a</h2>

          {/* Selector de sexo */}
          <div className={styles.sexoSelector}>
            <button
              className={`${styles.sexoBtn} ${sexo === 'nino' ? styles.active : ''}`}
              onClick={() => setSexo('nino')}
            >
              👦 Niño
            </button>
            <button
              className={`${styles.sexoBtn} ${sexo === 'nina' ? styles.active : ''}`}
              onClick={() => setSexo('nina')}
            >
              👧 Niña
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label>Edad (meses)</label>
            <div className={styles.inputConUnidad}>
              <input
                type="number"
                value={edadMeses}
                onChange={(e) => setEdadMeses(e.target.value)}
                placeholder="12"
                min="0"
                max="60"
                className={styles.input}
              />
              <span className={styles.unidad}>meses</span>
            </div>
            <span className={styles.hint}>De 0 a 60 meses (5 años)</span>
          </div>

          <div className={styles.inputGroup}>
            <label>Peso</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="10,5"
                className={styles.input}
              />
              <span className={styles.unidad}>kg</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Talla / Altura</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
                placeholder="75"
                className={styles.input}
              />
              <span className={styles.unidad}>cm</span>
            </div>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular Percentiles
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Percentil de Peso */}
              <div className={`${styles.resultadoCard} ${getColorPercentil(resultado.percentilPeso)}`}>
                <div className={styles.resultadoHeader}>
                  <span className={styles.resultadoIcon}>⚖️</span>
                  <span className={styles.resultadoTipo}>Percentil de Peso</span>
                </div>
                <div className={styles.resultadoValor}>
                  P{resultado.percentilPeso}
                </div>
                <div className={styles.resultadoInterpretacion}>
                  {resultado.interpretacionPeso}
                </div>
              </div>

              {/* Percentil de Talla */}
              <div className={`${styles.resultadoCard} ${getColorPercentil(resultado.percentilTalla)}`}>
                <div className={styles.resultadoHeader}>
                  <span className={styles.resultadoIcon}>📏</span>
                  <span className={styles.resultadoTipo}>Percentil de Talla</span>
                </div>
                <div className={styles.resultadoValor}>
                  P{resultado.percentilTalla}
                </div>
                <div className={styles.resultadoInterpretacion}>
                  {resultado.interpretacionTalla}
                </div>
              </div>

              {/* Escala visual */}
              <div className={styles.escalaVisual}>
                <h4>Escala de Percentiles</h4>
                <div className={styles.escala}>
                  <div className={styles.escalaBarra}>
                    <span className={styles.escalaMarca} style={{ left: '3%' }}>P3</span>
                    <span className={styles.escalaMarca} style={{ left: '15%' }}>P15</span>
                    <span className={styles.escalaMarca} style={{ left: '50%' }}>P50</span>
                    <span className={styles.escalaMarca} style={{ left: '85%' }}>P85</span>
                    <span className={styles.escalaMarca} style={{ left: '97%' }}>P97</span>
                  </div>
                  <div className={styles.escalaLabels}>
                    <span>Bajo</span>
                    <span>Normal</span>
                    <span>Alto</span>
                  </div>
                </div>
              </div>

              {/* Info percentiles */}
              <div className={styles.infoPercentiles}>
                <h4>¿Qué significa el percentil?</h4>
                <p>
                  El percentil indica la posición de tu hijo comparado con otros niños de su misma
                  edad y sexo. Por ejemplo, un percentil 50 significa que está en la media: el 50%
                  de los niños pesan/miden menos y el 50% más.
                </p>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>👶</span>
              <p>Introduce los datos para calcular los percentiles</p>
            </div>
          )}
        </div>
      </div>

      {/* Enlace relacionado */}
      <div className={styles.enlaceRelacionado}>
        <p>🤰 <strong>¿Esperando un bebé?</strong> Planifica todo con el{' '}
          <a href="/planificador-embarazo/">Planificador de Embarazo y Bebé</a>
          {' '}(calculadora FPP, checklist, lista de compras y vacunas)
        </p>
      </div>

      {/* DISCLAIMER - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Médico Importante</h3>
        <p>
          Esta calculadora utiliza tablas simplificadas basadas en los estándares de crecimiento de la OMS
          y proporciona una <strong>estimación orientativa</strong>. Los resultados no son un diagnóstico médico.
        </p>
        <p>
          <strong>El crecimiento infantil debe ser evaluado por un profesional de la salud</strong> que considere
          múltiples factores: genética, alimentación, desarrollo general, etc. Un solo valor fuera del rango
          &quot;normal&quot; no indica necesariamente un problema. Consulta siempre con tu pediatra.
        </p>
      </div>

      <Footer appName="calculadora-percentiles" />
    </div>
  );
}
