'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraPotenciaCiclismo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { calcularPotenciaCiclismo, ResultadoPotenciaCiclismo } from '@/lib/calculadoras/deporte';

// ── Mapa de colores por nivel ─────────────────────────────────────────────────

const NIVEL_CLASE: Record<string, string> = {
  'Principiante':          styles.nivelPrincipiante,
  'Cicloturista':          styles.nivelCicloturista,
  'Amateur':               styles.nivelAmateur,
  'Amateur competitivo':   styles.nivelAmateur,
  'Semi-profesional':      styles.nivelSemiPro,
  'Profesional / Élite':   styles.nivelElite,
};

const NIVEL_VAM_CLASE: Record<string, string> = {
  'Principiante':          styles.nivelPrincipiante,
  'Cicloturista':          styles.nivelCicloturista,
  'Amateur':               styles.nivelAmateur,
  'Amateur fuerte':        styles.nivelAmateur,
  'Semi-profesional':      styles.nivelSemiPro,
  'Élite / Profesional':   styles.nivelElite,
};

const ZONA_COLORES: Record<string, string> = {
  Z1: '#48A9A6',
  Z2: '#27AE60',
  Z3: '#F39C12',
  Z4: '#E07B39',
  Z5: '#E74C3C',
  Z6: '#8E44AD',
};

// ─────────────────────────────────────────────────────────────────────────────

export default function CalculadoraPotenciaCiclismoPage() {
  const [peso, setPeso] = useState<number>(70);
  const [ftp, setFtp] = useState<number>(200);
  const [desnivel, setDesnivel] = useState<string>('');
  const [tiempoMin, setTiempoMin] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoPotenciaCiclismo | null>(null);
  const [mostrarVam, setMostrarVam] = useState<boolean>(false);

  const calcular = () => {
    const des = desnivel !== '' ? Number(desnivel) : undefined;
    const tMin = tiempoMin !== '' ? Number(tiempoMin) : undefined;
    const res = calcularPotenciaCiclismo(peso, ftp, des, tMin);
    setResultado(res);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🚴</span> Calculadora de Potencia en Ciclismo</h1>
        <p className={styles.subtitle}>
          Analiza tu FTP, W/kg y VAM para conocer tu nivel como ciclista
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Sección 1: Datos obligatorios ── */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos de rendimiento</h2>
          <div className={styles.inputGrid}>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="peso">
                Peso corporal
              </label>
              <div className={styles.inputRow}>
                <input
                  id="peso"
                  type="number"
                  min={30} max={150} value={peso}
                  onChange={e => { setPeso(Number(e.target.value)); setResultado(null); }}
                  className={styles.inputNumber}
                  aria-label="Peso en kilogramos"
                />
                <span className={styles.inputUnidad}>kg</span>
              </div>
              <input
                type="range" min={30} max={150} value={peso}
                onChange={e => { setPeso(Number(e.target.value)); setResultado(null); }}
                className={styles.slider}
                aria-hidden="true"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="ftp">
                FTP (Umbral de Potencia Funcional)
                <span className={styles.inputHint}>Potencia sostenible durante 1 hora</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  id="ftp"
                  type="number"
                  min={50} max={600} value={ftp}
                  onChange={e => { setFtp(Number(e.target.value)); setResultado(null); }}
                  className={styles.inputNumber}
                  aria-label="FTP en vatios"
                />
                <span className={styles.inputUnidad}>W</span>
              </div>
              <input
                type="range" min={50} max={600} value={ftp}
                onChange={e => { setFtp(Number(e.target.value)); setResultado(null); }}
                className={styles.slider}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* ── Sección 2: VAM opcional ── */}
          <div className={styles.vamToggle}>
            <button
              type="button"
              className={styles.vamToggleBtn}
              onClick={() => { setMostrarVam(v => !v); setResultado(null); }}
              aria-expanded={mostrarVam}
            >
              <span aria-hidden="true">{mostrarVam ? '▲' : '▼'}</span> Calcular VAM para subida cronometrada (opcional)
            </button>
          </div>

          {mostrarVam && (
            <div className={styles.vamGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="desnivel">
                  Desnivel positivo
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="desnivel"
                    type="number"
                    min={0} max={3000}
                    value={desnivel}
                    placeholder="850"
                    onChange={e => { setDesnivel(e.target.value); setResultado(null); }}
                    className={styles.inputNumber}
                    aria-label="Desnivel en metros"
                  />
                  <span className={styles.inputUnidad}>m</span>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="tiempoMin">
                  Tiempo empleado
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="tiempoMin"
                    type="number"
                    min={1} max={600}
                    value={tiempoMin}
                    placeholder="45"
                    onChange={e => { setTiempoMin(e.target.value); setResultado(null); }}
                    className={styles.inputNumber}
                    aria-label="Tiempo en minutos"
                  />
                  <span className={styles.inputUnidad}>min</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.btnWrapper}>
            <button type="button" onClick={calcular} className={styles.btnCalcular}>
              Calcular potencia →
            </button>
          </div>
        </div>

        {/* ── Resultados ── */}
        {resultado && (
          <div className={styles.resultados} role="region" aria-label="Resultados de potencia">

            {/* W/kg */}
            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>Ratio W/kg</span>
                <span className={`${styles.nivelBadge} ${NIVEL_CLASE[resultado.nivelWattsKg] ?? styles.nivelPrincipiante}`}>
                  {resultado.nivelWattsKg}
                </span>
              </div>
              <div className={styles.resultValor}>
                {formatNumber(resultado.wattsKg, 2)} <span className={styles.resultUnidad}>W/kg</span>
              </div>
              <p className={styles.resultDesc}>{resultado.descripcionNivel}</p>
            </div>

            {/* VAM (si se calculó) */}
            {resultado.vam !== null && resultado.nivelVam !== null && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>VAM (Velocidad Ascensional Media)</span>
                  <span className={`${styles.nivelBadge} ${NIVEL_VAM_CLASE[resultado.nivelVam] ?? styles.nivelPrincipiante}`}>
                    {resultado.nivelVam}
                  </span>
                </div>
                <div className={styles.resultValor}>
                  {formatNumber(resultado.vam, 0)} <span className={styles.resultUnidad}>m/h</span>
                </div>
                <p className={styles.resultDesc}>
                  Desnivel ganado por hora de esfuerzo sostenido en subida
                </p>
              </div>
            )}

            {/* Tabla de zonas */}
            <div className={styles.zonasCard}>
              <h3 className={styles.zonasTitle}>Zonas de Potencia (basadas en tu FTP: {ftp} W)</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.zonasTable}>
                  <thead>
                    <tr>
                      <th>Zona</th>
                      <th>Nombre</th>
                      <th>% FTP</th>
                      <th>Rango (W)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.zonasPotencia.map(z => (
                      <tr key={z.zona}>
                        <td>
                          <span
                            className={styles.zonaBadge}
                            style={{ backgroundColor: ZONA_COLORES[z.zona] ?? '#999' }}
                          >
                            {z.zona}
                          </span>
                        </td>
                        <td className={styles.zonaNombre}>{z.nombre}</td>
                        <td className={styles.zonaPorc}>{z.porcentajeFTP}</td>
                        <td className={styles.zonaRango}>
                          {z.wattsMin} – {z.wattsMax} W
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Sección educativa ── */}
        <EducationalSection
          title="Guía de Potencia en Ciclismo"
          subtitle="FTP, W/kg, VAM y zonas de entrenamiento explicados"
          icon="🚴"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el FTP y cómo medirlo?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
                  <h3>Qué es el FTP</h3>
                </div>
                <p className={styles.escenarioTip}>
                  El FTP (Functional Threshold Power) es la potencia máxima sostenible durante aproximadamente 1 hora de esfuerzo máximo. Es el indicador de referencia en el entrenamiento científico por potencia: determina todas las zonas de intensidad y permite comparar rendimientos entre ciclistas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🧪</span>
                  <h3>Test de 20 minutos</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Calienta 20 min a ritmo suave, luego da el máximo esfuerzo sostenible durante 20 minutos continuos. La potencia media de esos 20 minutos multiplicada por 0,95 es tu FTP estimado. El factor 0,95 corrige que un esfuerzo de 20 min es ligeramente más intenso que uno de 60 min.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🔁</span>
                  <h3>¿Cada cuánto actualizarlo?</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Se recomienda repetir el test FTP cada 6–8 semanas de entrenamiento estructurado. El FTP puede mejorar notablemente en principiantes (10–20% en los primeros meses) y de forma más gradual en ciclistas avanzados (2–5% por temporada).
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
                  <h3>Sin potenciómetro</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Si no dispones de potenciómetro, algunas aplicaciones de entrenamiento (Zwift, TrainerRoad, Garmin Connect) estiman el FTP mediante frecuencia cardíaca y velocidad en rodillos calibrados. Los valores estimados son orientativos; un potenciómetro físico ofrece la medición más precisa.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>¿Qué es el W/kg y para qué sirve?</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>W/kg</th>
                    <th>Perfil típico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong style={{color:'#888'}}>Principiante</strong></td>
                    <td>&lt; 1,5</td>
                    <td>Inicio en la bicicleta, salidas cortas</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#27AE60'}}>Cicloturista</strong></td>
                    <td>1,5 – 2,5</td>
                    <td>Salidas regulares en grupo, fondo recreativo</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#2E86AB'}}>Amateur</strong></td>
                    <td>2,5 – 3,5</td>
                    <td>Entrenamiento estructurado, marchas populares</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#E07B39'}}>Amateur competitivo</strong></td>
                    <td>3,5 – 4,5</td>
                    <td>Competición federada, escapadas en carrera</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#E74C3C'}}>Semi-profesional</strong></td>
                    <td>4,5 – 5,5</td>
                    <td>Ciclismo de élite regional o nacional</td>
                  </tr>
                  <tr>
                    <td><strong style={{color:'#8E44AD'}}>Profesional / Élite</strong></td>
                    <td>&gt; 5,5</td>
                    <td>Nivel World Tour (6,0–7,5 W/kg en grandes escaladores)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableNote}>
              El ratio W/kg es especialmente relevante en terreno montañoso, donde el peso del ciclista penaliza directamente la velocidad de ascenso. En llano, la potencia absoluta (W) tiene más peso que el ratio.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>¿Qué es el VAM?</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">📐</span> Definición y fórmula</h4>
                <p>
                  VAM son las siglas de Velocidad Ascensional Media (en italiano: Velocità Ascensionale Media). Fue popularizado por el fisiólogo Michele Ferrari como indicador del rendimiento en escalada. Se calcula: VAM (m/h) = Desnivel (m) × 60 / Tiempo (min).
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">📊</span> Valores de referencia en subida</h4>
                <p>
                  Ciclistas de nivel medio: 800–1.000 m/h. Amateurs fuertes: 1.000–1.200 m/h. Semi-profesionales: 1.200–1.400 m/h. Profesionales del World Tour: 1.600–1.800 m/h en grandes ascensiones. En el Tour de Francia, los mejores escaladores han superado 1.800 m/h.
                </p>
                <p className={styles.faqTip}>
                  El VAM varía según la pendiente: a mayor pendiente, mayor VAM para el mismo W/kg. Comparar VAMs de subidas con pendientes muy distintas puede inducir a error.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">🔗</span> Relación VAM y W/kg</h4>
                <p>
                  Existe una relación aproximada entre VAM y W/kg según la pendiente media de la subida. A 8% de pendiente: W/kg ≈ VAM / 255. Esta relación varía con la resistencia aerodinámica, el peso de la bici, la temperatura y la altura (altitud). Úsala como estimación orientativa, no como fórmula exacta.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Cómo entrenar por zonas de potencia</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Mide tu FTP de partida</h4>
                  <p>Realiza el test de 20 minutos en condiciones controladas (sin subidas ni semáforos, preferiblemente en rodillo). Este valor es tu punto de partida para definir todas las zonas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Entrena más tiempo en Z2 y Z3 (base aeróbica)</h4>
                  <p>La mayoría del volumen semanal (70–80%) debería realizarse en Z2 (Resistencia) y Z3 (Tempo). Esta base aeróbica es lo que permite luego expresar el rendimiento en zonas altas sin lesiones ni sobreentrenamiento.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Introduce intervalos en Z4 (umbral)</h4>
                  <p>1–2 sesiones por semana con bloques de 10–20 minutos en Z4 elevan el FTP progresivamente. Ejemplos: 3 × 10 min Z4 con 5 min recuperación, o 2 × 20 min Z4. Este trabajo es la clave para mejorar el umbral de lactato.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Reserva Z5–Z6 para trabajo de alta calidad</h4>
                  <p>Los intervalos VO2max (Z5, 3–5 min) y anaeróbicos (Z6, 30–90 seg) generan las mayores adaptaciones de potencia pico, pero requieren mayor recuperación. Ideal para preparar sprints, ataques y finales de carrera.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Repite el test FTP cada 6–8 semanas</h4>
                  <p>El progreso en FTP es la métrica objetiva de mejora. A medida que sube el FTP, todas las zonas se desplazan hacia arriba. Sin actualizar las zonas, entrenarías por debajo de tu nivel real.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Claves para mejorar el W/kg</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚡</span>
                <h4>Aumenta el FTP con consistencia</h4>
                <p>El FTP mejora con entrenamiento regular y progresivo, no con esfuerzos esporádicos máximos. La consistencia durante semanas y meses es más efectiva que picos de intensidad aislados.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <h4>El peso importa especialmente en subidas</h4>
                <p>Reducir 2–3 kg de peso corporal mejora el W/kg sin cambiar el FTP. En terreno llano este efecto es menor; en subidas largas puede suponer 1–2 min de diferencia por cada 500 m de desnivel.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌬️</span>
                <h4>La aerodinámica importa más en llano</h4>
                <p>En llano, la resistencia aerodinámica representa el 70–80% del esfuerzo total. Una postura más agresiva sobre la bici o componentes aerodinámicos pueden ser más rentables que mejorar el FTP para reducir tiempos en terreno plano.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">😴</span>
                <h4>El descanso es parte del entrenamiento</h4>
                <p>El FTP no mejora durante el esfuerzo, sino en la recuperación. Dormir 7–9 horas, incluir semanas de descarga cada 3–4 semanas y gestionar el estrés general son factores que afectan al rendimiento tanto como las sesiones de calidad.</p>
              </div>
            </div>
          </section>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Frecuentes en el Entrenamiento por Potencia</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong><span aria-hidden="true">❌</span> Usar el FTP de otra persona como referencia propia:</strong> El FTP es individual. Compararse con valores de referencia de ciclistas profesionales o de amigos puede llevar a entrenar en zonas incorrectas.</li>
              <li><strong><span aria-hidden="true">❌</span> Hacer el test FTP sin preparación adecuada:</strong> Un test realizado tras días de fatiga acumulada, enfermedad o sin un buen calentamiento dará un FTP subestimado y zonas demasiado conservadoras.</li>
              <li><strong><span aria-hidden="true">❌</span> Entrenar siempre en Z4-Z5 creyendo que "más intensidad = más mejora":</strong> Sin base aeróbica sólida (Z2), los intervalos de alta intensidad tienen efecto limitado y aumentan el riesgo de sobreentrenamiento.</li>
              <li><strong><span aria-hidden="true">❌</span> No actualizar las zonas al mejorar:</strong> Cuando el FTP sube, las zonas anteriores quedan obsoletas. Entrenar con zonas desfasadas significa hacerlo por debajo del estímulo necesario para seguir progresando.</li>
            </ul>
          </div>
        </EducationalSection>

      </main>

      <RelatedApps apps={getRelatedApps('calculadora-potencia-ciclismo')} />
      <ShareCard appName="calculadora-potencia-ciclismo" />
      <Footer appName="calculadora-potencia-ciclismo" />
    </div>
  );
}
