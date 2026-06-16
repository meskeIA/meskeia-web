'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraPuntosAzucar.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularPuntosAzucar,
  FASES_AZUCAR,
  type ResultadoPuntosAzucar,
  type FaseAzucar,
} from '@/lib/calculadoras/cocina';

// Colores temáticos por fase (en el mismo orden que FASES_AZUCAR)
const COLORES_FASE: string[] = [
  '#F0C040', // Almíbar ligero — amarillo
  '#F0A030', // Bola blanda — naranja claro
  '#E88020', // Bola firme — naranja medio
  '#E06010', // Bola dura — naranja intenso
  '#CC4400', // Caramelo blando — rojo naranja
  '#BB2200', // Caramelo duro — rojo
  '#994400', // Caramelo rubio — marrón dorado
  '#6B2E00', // Caramelo oscuro — marrón ámbar
  '#2A1000', // Caramelo quemado — marrón casi negro
];

function getColorFase(fase: FaseAzucar | null): string {
  if (!fase) return '#888888';
  const idx = FASES_AZUCAR.indexOf(fase);
  return idx >= 0 ? COLORES_FASE[idx] : '#888888';
}

export default function CalculadoraPuntosAzucarPage() {
  const [temperatura, setTemperatura] = useState<number>(120);
  const [resultado, setResultado] = useState<ResultadoPuntosAzucar | null>(null);
  const [calculado, setCalculado] = useState(false);

  const calcular = useCallback(() => {
    const res = calcularPuntosAzucar(temperatura);
    setResultado(res);
    setCalculado(true);
  }, [temperatura]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperatura(Number(e.target.value));
    setCalculado(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 80 && val <= 220) {
      setTemperatura(val);
      setCalculado(false);
    }
  };

  const fahrenheit = Math.round((temperatura * 9 / 5 + 32) * 10) / 10;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🍬</span> Calculadora de Puntos del Azúcar</h1>
        <p className={styles.subtitle}>
          Introduce la temperatura de tu almíbar y descubre en qué fase se encuentra:
          desde el almíbar ligero hasta el caramelo quemado
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Temperatura del almíbar</h2>

          <div className={styles.sliderContainer}>
            <div className={styles.tempDisplay}>
              <span className={styles.tempValue}>{temperatura}°C</span>
              <span className={styles.tempFahrenheit}>{fahrenheit}°F</span>
            </div>

            <input
              type="range"
              min="80"
              max="220"
              step="1"
              value={temperatura}
              onChange={handleSlider}
              className={styles.slider}
              aria-label="Temperatura en grados Celsius"
            />

            <div className={styles.sliderLabels}>
              <span>80°C</span>
              <span>150°C</span>
              <span>220°C</span>
            </div>
          </div>

          <div className={styles.inputRow}>
            <label className={styles.inputLabel} htmlFor="temp-input">
              O introduce la temperatura exacta:
            </label>
            <div className={styles.inputGroup}>
              <input
                id="temp-input"
                type="number"
                min="80"
                max="220"
                value={temperatura}
                onChange={handleInput}
                className={styles.numericInput}
                aria-describedby="temp-hint"
              />
              <span className={styles.inputUnit}>°C</span>
            </div>
            <p id="temp-hint" className={styles.inputHint}>Rango habitual: 100–200°C</p>
          </div>

          <button
            type="button"
            onClick={calcular}
            className={styles.btnPrimary}
            aria-label="Calcular fase del azúcar"
          >
            Identificar fase
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {!calculado && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🌡️</span>
              <p>Ajusta la temperatura y pulsa <strong>Identificar fase</strong></p>
            </div>
          )}

          {calculado && resultado && (
            <div className={styles.resultadoWrapper}>
              {/* Advertencia si aplica */}
              {resultado.advertencia && (
                <div className={styles.warningBox} role="alert">
                  <span aria-hidden="true">⚠️</span> {resultado.advertencia}
                </div>
              )}

              {/* Fase actual */}
              {resultado.fase ? (
                <div
                  className={styles.faseCard}
                  style={{ borderColor: getColorFase(resultado.fase) }}
                >
                  <div
                    className={styles.faseHeader}
                    style={{ backgroundColor: getColorFase(resultado.fase) }}
                  >
                    <h3 className={styles.faseNombre}>{resultado.fase.nombre}</h3>
                    <p className={styles.faseNombreEn}>{resultado.fase.nombre_en}</p>
                    <p className={styles.faseTempRango}>
                      {resultado.fase.temp_min_c}–{resultado.fase.temp_max_c}°C
                      &nbsp;·&nbsp;
                      {Math.round(resultado.fase.temp_min_c * 9/5 + 32)}–{Math.round(resultado.fase.temp_max_c * 9/5 + 32)}°F
                    </p>
                  </div>

                  <div className={styles.faseBody}>
                    <p className={styles.faseDescripcion}>{resultado.fase.descripcion}</p>

                    <div className={styles.fasePrueba}>
                      <strong>Prueba del agua fría:</strong>
                      <p>{resultado.fase.prueba_agua_fria}</p>
                    </div>

                    <div className={styles.faseUsos}>
                      <strong>Usos típicos:</strong>
                      <ul className={styles.usosList}>
                        {resultado.fase.usosTipicos.map((uso, i) => (
                          <li key={i}>{uso}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.faseCard}>
                  <div className={styles.faseHeader} style={{ backgroundColor: '#888' }}>
                    <h3 className={styles.faseNombre}>Temperatura fuera de fase</h3>
                    <p className={styles.faseTempRango}>{temperatura}°C</p>
                  </div>
                  <div className={styles.faseBody}>
                    <p className={styles.faseDescripcion}>
                      Esta temperatura se encuentra en una zona de transición entre fases.
                      Consulta la tabla de referencia para ver las fases cercanas.
                    </p>
                  </div>
                </div>
              )}

              {/* Contexto: fase anterior y siguiente */}
              <div className={styles.contextNav}>
                {resultado.fase_anterior && (
                  <div className={styles.contextCard}>
                    <span className={styles.contextLabel}>← Fase anterior</span>
                    <span
                      className={styles.contextNombre}
                      style={{ color: getColorFase(resultado.fase_anterior) }}
                    >
                      {resultado.fase_anterior.nombre}
                    </span>
                    <span className={styles.contextRango}>
                      {resultado.fase_anterior.temp_min_c}–{resultado.fase_anterior.temp_max_c}°C
                    </span>
                  </div>
                )}
                {resultado.fase_siguiente && (
                  <div className={styles.contextCard}>
                    <span className={styles.contextLabel}>Siguiente fase →</span>
                    <span
                      className={styles.contextNombre}
                      style={{ color: getColorFase(resultado.fase_siguiente) }}
                    >
                      {resultado.fase_siguiente.nombre}
                    </span>
                    <span className={styles.contextRango}>
                      {resultado.fase_siguiente.temp_min_c}–{resultado.fase_siguiente.temp_max_c}°C
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Tabla de referencia completa */}
      <section className={styles.tablaSection} aria-label="Tabla de referencia de fases del azúcar">
        <h2 className={styles.tablaTitulo}><span aria-hidden="true">📊</span> Tabla de referencia: las 9 fases del azúcar</h2>
        <div className={styles.tablaWrapper}>
          <table className={styles.tablaFases}>
            <thead>
              <tr>
                <th>Fase</th>
                <th>Temperatura</th>
                <th>Prueba del agua</th>
                <th>Usos típicos</th>
              </tr>
            </thead>
            <tbody>
              {FASES_AZUCAR.map((fase, i) => (
                <tr
                  key={fase.nombre}
                  className={
                    resultado?.fase?.nombre === fase.nombre ? styles.filaActiva : ''
                  }
                >
                  <td>
                    <span
                      className={styles.faseDot}
                      style={{ backgroundColor: COLORES_FASE[i] }}
                      aria-hidden="true"
                    />
                    <strong>{fase.nombre}</strong>
                    <br />
                    <span className={styles.nombreEn}>{fase.nombre_en}</span>
                  </td>
                  <td className={styles.celdaTemp}>
                    {fase.temp_min_c}–{fase.temp_max_c}°C
                  </td>
                  <td>{fase.prueba_agua_fria}</td>
                  <td>{fase.usosTipicos.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <EducationalSection
        title="📚 Las fases del azúcar: guía completa"
        subtitle="Todo lo que necesitas saber sobre la cocción del almíbar"
      >
        <section className={styles.guideSection}>
          <h2>Las 9 fases del azúcar cocido: de almíbar ligero a caramelo quemado</h2>
          <p>
            Cuando calentamos una solución de azúcar y agua, el agua se va evaporando progresivamente.
            A medida que la concentración de azúcar aumenta, el almíbar alcanza distintas temperaturas
            que corresponden a texturas y propiedades diferentes. Estas fases son la base de toda la
            confitería y repostería avanzada.
          </p>
          <p>
            Las nueve fases van desde el <strong>almíbar ligero</strong> (100–106°C, 80% sólidos)
            hasta el <strong>caramelo quemado</strong> (183–200°C), pasando por la bola blanda ideal
            para fondant, la bola dura para turrón, el caramelo duro para piruletas y el caramelo
            rubio para crème brûlée.
          </p>

          <h2>Termómetros de cocina: tipos y cómo usarlos</h2>
          <p>
            Para trabajar el azúcar con precisión existen dos tipos principales de termómetros:
          </p>
          <ul>
            <li>
              <strong>Termómetro de sonda digital:</strong> de respuesta rápida (2–3 segundos),
              ideal para medir en cualquier punto del almíbar. Conviene introducir la sonda sin
              tocar el fondo del cazo para evitar lecturas falsas.
            </li>
            <li>
              <strong>Termómetro de caramelo (de clip):</strong> se sujeta al cazo, mide de forma
              continua y tiene marcas para cada fase. Más cómodo para vigilar la cocción sin
              intervenir constantemente.
            </li>
          </ul>
          <p>
            En ambos casos, a gran altitud el punto de ebullición del agua baja aproximadamente
            1°C por cada 300 metros sobre el nivel del mar, lo que desplaza todas las fases hacia
            abajo.
          </p>

          <h2>La prueba tradicional del vaso de agua fría</h2>
          <p>
            Antes de que existieran los termómetros de cocina, los confiteros usaban la prueba del
            agua fría: se deja caer una pequeña cantidad de almíbar caliente en un vaso con agua muy
            fría y se observa cómo se comporta.
          </p>
          <ul>
            <li><strong>Hilo que se rompe:</strong> almíbar ligero (100–106°C)</li>
            <li><strong>Bola blanda que se aplana:</strong> fondant o fudge (112–116°C)</li>
            <li><strong>Bola firme:</strong> caramelos de leche, turrón blando (118–121°C)</li>
            <li><strong>Bola dura:</strong> turrón duro, nougat (122–130°C)</li>
            <li><strong>Hilos blandos que se doblan:</strong> toffee (132–143°C)</li>
            <li><strong>Hilos rígidos que crujen:</strong> piruletas, caramelos duros (149–155°C)</li>
          </ul>
          <p>
            Por encima de 160°C el azúcar empieza a caramelizarse (reacción de Maillard y
            pirólisis) y la prueba del agua ya no es aplicable.
          </p>

          <h2>Por qué la temperatura determina la textura final</h2>
          <p>
            La temperatura es un indicador de la concentración de azúcar en la solución: a mayor
            temperatura, menos agua queda. Esta concentración determina la textura del producto
            final una vez que se enfría:
          </p>
          <ul>
            <li>Más agua (≈80% sólidos) → textura fluida, almíbar</li>
            <li>Concentración media (≈87%) → textura plástica, moldeable en frío</li>
            <li>Alta concentración (≈95–99%) → textura cristalina, rígida</li>
            <li>Sin agua (caramelización) → textura amorfa, vidriosa</li>
          </ul>

          <h2>Ejemplos gastronómicos por fase</h2>
          <ul>
            <li><strong>Almíbar ligero (100–106°C):</strong> mermeladas, frutas en almíbar, sorbetes, glaseados líquidos</li>
            <li><strong>Bola blanda (112–116°C):</strong> fondant, fudge, mazapán, caramelos de leche blandos</li>
            <li><strong>Bola firme (118–121°C):</strong> turrón blando (Jijona), nougat artesano</li>
            <li><strong>Bola dura (122–130°C):</strong> turrón de Alicante, caramelos duros rellenos</li>
            <li><strong>Caramelo blando (132–143°C):</strong> toffee, butterscotch, algunos pirulís</li>
            <li><strong>Caramelo duro (149–155°C):</strong> piruletas, manzanas caramelizadas, decoraciones de azúcar</li>
            <li><strong>Caramelo rubio (160–170°C):</strong> crème brûlée, pralinés, nougatine, flan</li>
            <li><strong>Caramelo oscuro (171–182°C):</strong> salsa de caramelo salado, tarta Tatin</li>
            <li><strong>Caramelo quemado (183–200°C):</strong> colorante E150, sabor amargo buscado en cocina de autor</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-puntos-azucar')} />
      <ShareCard appName="calculadora-puntos-azucar" />
      <Footer appName="calculadora-puntos-azucar" />
    </div>
  );
}
