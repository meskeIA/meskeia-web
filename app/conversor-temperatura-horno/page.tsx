'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './ConversorTemperaturaHorno.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  MARCAS_GAS,
  convertirTemperatura,
  celsiusAFahrenheit,
  celsiusVentilador,
  type UnidadEntrada,
} from '@/lib/calculadoras/temperaturaHorno';

const UNIDADES: { id: UnidadEntrada; etiqueta: string }[] = [
  { id: 'celsius', etiqueta: '°C Celsius' },
  { id: 'fahrenheit', etiqueta: '°F Fahrenheit' },
  { id: 'gas', etiqueta: 'Gas mark' },
];

// Índice de gas mark 4 (180 °C), el valor por defecto más habitual.
const GAS_DEFECTO = MARCAS_GAS.findIndex((m) => m.gas === '4');

export default function ConversorTemperaturaHornoPage() {
  const [unidad, setUnidad] = useState<UnidadEntrada>('celsius');
  const [valorCelsius, setValorCelsius] = useState('180');
  const [valorFahrenheit, setValorFahrenheit] = useState('350');
  const [gasIdx, setGasIdx] = useState(GAS_DEFECTO);

  const resultado = useMemo(() => {
    if (unidad === 'celsius') {
      return convertirTemperatura('celsius', parseFloat(valorCelsius.replace(',', '.')) || 0);
    }
    if (unidad === 'fahrenheit') {
      return convertirTemperatura('fahrenheit', parseFloat(valorFahrenheit.replace(',', '.')) || 0);
    }
    return convertirTemperatura('gas', gasIdx);
  }, [unidad, valorCelsius, valorFahrenheit, gasIdx]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de temperatura de horno</h1>
        <p className={styles.subtitle}>
          Celsius, Fahrenheit y gas mark en un solo paso, con el ajuste para horno de ventilador
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Conversor">
          {/* Selector de unidad */}
          <div className={styles.unidadTabs} role="tablist" aria-label="Unidad de entrada">
            {UNIDADES.map((u) => (
              <button
                key={u.id}
                type="button"
                role="tab"
                aria-selected={unidad === u.id}
                className={`${styles.unidadTab} ${unidad === u.id ? styles.unidadTabActivo : ''}`}
                onClick={() => setUnidad(u.id)}
              >
                {u.etiqueta}
              </button>
            ))}
          </div>

          {/* Entrada según unidad */}
          <div className={styles.campo}>
            {unidad === 'celsius' && (
              <>
                <label htmlFor="celsius" className={styles.label}>
                  Temperatura en grados Celsius
                </label>
                <input
                  id="celsius"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={valorCelsius}
                  onChange={(e) => setValorCelsius(e.target.value)}
                  placeholder="180"
                />
              </>
            )}
            {unidad === 'fahrenheit' && (
              <>
                <label htmlFor="fahrenheit" className={styles.label}>
                  Temperatura en grados Fahrenheit
                </label>
                <input
                  id="fahrenheit"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={valorFahrenheit}
                  onChange={(e) => setValorFahrenheit(e.target.value)}
                  placeholder="350"
                />
              </>
            )}
            {unidad === 'gas' && (
              <>
                <label htmlFor="gas" className={styles.label}>
                  Gas mark
                </label>
                <select
                  id="gas"
                  className={styles.select}
                  value={gasIdx}
                  onChange={(e) => setGasIdx(Number(e.target.value))}
                >
                  {MARCAS_GAS.map((m, i) => (
                    <option key={m.gas} value={i}>
                      Gas mark {m.gas} ({m.c} °C)
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Resultado */}
          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={`${styles.resCard} ${unidad === 'celsius' ? styles.resCardActivo : ''}`}>
                <span className={styles.resValor}>{resultado.celsius}</span>
                <span className={styles.resUnidad}>°C convencional</span>
              </div>
              <div className={`${styles.resCard} ${unidad === 'fahrenheit' ? styles.resCardActivo : ''}`}>
                <span className={styles.resValor}>{resultado.fahrenheit}</span>
                <span className={styles.resUnidad}>°F Fahrenheit</span>
              </div>
              <div className={`${styles.resCard} ${unidad === 'gas' ? styles.resCardActivo : ''}`}>
                <span className={styles.resValor}>{resultado.gas.gas}</span>
                <span className={styles.resUnidad}>gas mark</span>
              </div>
              <div className={styles.resCard}>
                <span className={styles.resValor}>{resultado.ventilador}</span>
                <span className={styles.resUnidad}>°C con ventilador</span>
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>
              Introduce una temperatura de horno válida (entre 50 y 320 °C).
            </p>
          )}

          {resultado && (
            <div className={styles.nivelBox}>
              <span className={styles.nivelEtiqueta}>Horno {resultado.nivel.nombre.toLowerCase()}</span>
              <span className={styles.nivelUsos}>{resultado.nivel.usos}</span>
            </div>
          )}
        </section>

        {/* Tabla de equivalencias */}
        <section className={styles.tablaSection} aria-labelledby="tabla-titulo">
          <h2 id="tabla-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">📋</span> Tabla de equivalencias completa
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Gas mark</th>
                  <th scope="col">°C</th>
                  <th scope="col">°F</th>
                  <th scope="col">Ventilador</th>
                </tr>
              </thead>
              <tbody>
                {MARCAS_GAS.map((m) => (
                  <tr key={m.gas}>
                    <td className={styles.celGas}>{m.gas}</td>
                    <td>{m.c} °C</td>
                    <td>{celsiusAFahrenheit(m.c)} °F</td>
                    <td>{celsiusVentilador(m.c)} °C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.fuenteNota}>
            Gas mark según la escala estándar británica. El horno de ventilador (aire forzado) va
            unos 20 °C por encima de la convencional para el mismo resultado; ajústalo según tu horno.
          </p>
        </section>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Temperaturas de horno, explicadas"
          subtitle="Celsius, Fahrenheit, gas mark, ventilador y a qué temperatura va cada cosa"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Tres formas de decir lo mismo</h2>
              <p>
                Una misma temperatura de horno se expresa de varias maneras según el país. En
                Latinoamérica y Europa se usan los grados Celsius; en Estados Unidos, los Fahrenheit;
                y en Reino Unido e Irlanda, además, la escala numérica «gas mark» de los hornos de
                gas. Cuando sigues una receta extranjera, el primer paso es traducir la temperatura
                a la unidad de tu horno. Las tres escalas miden el mismo calor: solo cambia la regla
                con la que se nombra.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Por qué el horno de ventilador va aparte</h2>
              <p>
                Los hornos modernos suelen tener modo de ventilador (aire forzado o convección): un
                ventilador reparte el calor de forma uniforme, por lo que cocina más rápido y por
                igual en todas las bandejas. Como rinde más, para obtener el mismo resultado que una
                receta pensada para horno convencional conviene bajar la temperatura unos 20 °C. Si
                la receta dice 200 °C de horno convencional, con ventilador pon unos 180 °C.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>A qué temperatura va cada preparación</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍪</span>
                    <strong>170–180 °C · Repostería</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Bizcochos, magdalenas, galletas y tartas. Es el rango más usado: suficiente para
                    que suban y se doren sin quemarse por fuera antes de cocerse por dentro.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍗</span>
                    <strong>190–210 °C · Asados</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Carnes, aves, verduras al horno y panes de molde. Calor medio-alto que dora la
                    superficie y mantiene el interior jugoso.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍕</span>
                    <strong>230–250 °C · Pizza y pan</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Pizza, pan de corteza crujiente y gratinados. Temperatura fuerte para una costra
                    rápida; en pizza, cuanto más caliente, mejor.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍮</span>
                    <strong>100–130 °C · Cocción lenta</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Merengues, flanes al baño maría y deshidratados. Calor muy suave para secar o
                    cuajar sin dorar.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes con la temperatura del horno</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Confundir 350 °F con 350 °C.</strong> 350 °F son solo 180 °C. Hornear a 350
                  °C de verdad carbonizaría casi cualquier preparación.
                </li>
                <li>
                  <strong>No bajar la temperatura con horno de ventilador.</strong> Si usas la
                  temperatura de la receta convencional con el ventilador puesto, se dorará de más.
                </li>
                <li>
                  <strong>No precalentar.</strong> Casi todas las temperaturas suponen el horno ya
                  caliente; meter la masa en frío altera el tiempo y la subida.
                </li>
                <li>
                  <strong>Fiarse solo del dial.</strong> Muchos hornos domésticos se desvían 10–20
                  °C. Un termómetro de horno barato te dice la temperatura real.
                </li>
                <li>
                  <strong>Abrir la puerta a cada rato.</strong> Cada apertura baja la temperatura de
                  golpe y puede hundir bizcochos y suflés.
                </li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('conversor-temperatura-horno')} />
      <ShareCard appName="conversor-temperatura-horno" />
      <Footer appName="conversor-temperatura-horno" />
    </div>
  );
}
