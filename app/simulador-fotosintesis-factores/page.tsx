'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorFotosintesisFactores.module.css';

// ============================================================================
// MODELO MATEMÁTICO
// ============================================================================

function factorLuz(intensidad: number): number {
  const Km = 30;
  return intensidad / (intensidad + Km);
}

function factorCO2(concentracion: number): number {
  const Km = 0.03;
  return concentracion / (concentracion + Km);
}

function factorTemperatura(temp: number): number {
  if (temp < 10) return ((temp - 5) / 5) * 0.3;
  if (temp <= 25) return 0.3 + ((temp - 10) / 15) * 0.7;
  if (temp <= 35) return 1 - ((temp - 25) / 10) * 0.5;
  return Math.max(0, 0.5 - ((temp - 35) / 5) * 0.5);
}

function calcularLimitante(
  fL: number,
  fC: number,
  fT: number
): 'luz' | 'co2' | 'temperatura' {
  const min = Math.min(fL, fC, fT);
  if (fL === min) return 'luz';
  if (fC === min) return 'co2';
  return 'temperatura';
}

// ============================================================================
// TIPOS
// ============================================================================

interface Burbuja {
  id: number;
  left: number;
  delay: number;
  size: number;
  duration: number;
}

// ============================================================================
// BURBUJAS O₂
// ============================================================================

function generarBurbujas(tasa: number): Burbuja[] {
  const cantidad = Math.floor(tasa * 12) + 1; // 1..13
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i,
    left: 15 + ((i * 37) % 60),
    delay: (i * 0.4) % 3,
    size: 6 + Math.floor(tasa * 8),
    duration: Math.max(1.2, 3.5 - tasa * 2.5),
  }));
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function SimuladorFotosintesisFactoresPage() {
  const [luz, setLuz] = useState<number>(50);
  const [co2, setCo2] = useState<number>(0.04);
  const [temp, setTemp] = useState<number>(25);
  const [burbujas, setBurbujas] = useState<Burbuja[]>([]);

  const fL = useMemo(() => factorLuz(luz), [luz]);
  const fC = useMemo(() => factorCO2(co2), [co2]);
  const fT = useMemo(() => factorTemperatura(temp), [temp]);
  const tasa = useMemo(() => Math.min(fL, fC, fT), [fL, fC, fT]);
  const limitante = useMemo(() => calcularLimitante(fL, fC, fT), [fL, fC, fT]);
  const tasaPct = useMemo(() => Math.round(tasa * 100), [tasa]);

  // Regenerar burbujas cuando cambia la tasa
  useEffect(() => {
    setBurbujas(generarBurbujas(tasa));
  }, [tasa]);

  const colorTasa = tasaPct >= 70 ? '#27ae60' : tasaPct >= 40 ? '#f39c12' : '#e74c3c';

  // Datos educativos v2.0
  const tablaComparativa = [
    {
      factor: 'Luz solar',
      rango: '2000–10 000 lux',
      deficiencia: 'Fotosíntesis lenta; plantas etioladas (pálidas y alargadas)',
      exceso: 'Fotoinhibición por daño al fotosistema II',
      ejemplo: 'Plantas de sombra saturan a 1000 lux; las de sol a 10 000 lux',
    },
    {
      factor: 'CO₂',
      rango: '0,03–0,1 %',
      deficiencia: 'Cierre de estomas; caída de la productividad neta',
      exceso: 'Mejora la productividad hasta ~0,1%; poco efecto adicional',
      ejemplo: 'Invernaderos enriquecen CO₂ a 0,08-0,1% para aumentar cosechas',
    },
    {
      factor: 'Temperatura',
      rango: '20–30 °C',
      deficiencia: 'Enzimas (RuBisCO) lentas; membranas rígidas',
      exceso: 'Desnaturalización enzimática; fotoRespiration aumenta',
      ejemplo: 'Tomates rinden mejor entre 20-26 °C; por encima baja la producción',
    },
    {
      factor: 'Agua (H₂O)',
      rango: 'Potencial hídrico > −1 MPa',
      deficiencia: 'Cierre estomático, interrupción fotólisis y cadena de electrones',
      exceso: 'Anoxia en raíces; reducción indirecta',
      ejemplo: 'Sequía reduce la fotosíntesis antes de que el suelo esté seco del todo',
    },
    {
      factor: 'Minerales (N, Mg)',
      rango: 'N: 2–4 g/kg hoja seca',
      deficiencia: 'Clorosis (amarillamiento); menos clorofila sintetizada',
      exceso: 'Toxicidad por sal; pocas mejoras extra',
      ejemplo: 'Magnesio es el átomo central de la clorofila: sin Mg, sin pigmento',
    },
    {
      factor: 'Clorofila',
      rango: 'Proporcional al contenido de N',
      deficiencia: 'Menor captación lumínica aunque aumente la intensidad',
      exceso: 'Autoabsorción; rendimiento cuántico máximo ya alcanzado',
      ejemplo: 'Plantas en sombra tienen más clorofila b para aprovechar luz difusa',
    },
  ];

  const escenarios = [
    {
      icono: '🏭',
      titulo: 'Invernaderos con CO₂ enriquecido',
      descripcion:
        'Elevar el CO₂ de 0,04% a 0,08–0,10% puede aumentar la productividad fotosintética hasta un 25-30%. Los invernaderos modernos inyectan CO₂ procedente de generadores de combustión o tanques criogénicos. El beneficio se amplifica si la luz y la temperatura están optimizadas simultáneamente.',
    },
    {
      icono: '💡',
      titulo: 'Cultivos hidropónicos con luz LED',
      descripcion:
        'Los LEDs de espectro rojo (660 nm) y azul (450 nm) coinciden con los máximos de absorción de clorofila a y b. Las granjas verticales controlan las 24 horas, eliminando el factor luz como limitante. El CO₂ y la temperatura se convierten entonces en los cuellos de botella a gestionar.',
    },
    {
      icono: '🌡️',
      titulo: 'Estrés hídrico y térmico en verano',
      descripcion:
        'En olas de calor (>35 °C), las plantas cierran estomas para evitar pérdida de agua, deteniendo la entrada de CO₂. Aunque la luz es abundante, la fotosíntesis cae bruscamente. El limitante deja de ser la luz y pasa a ser el CO₂ interior de la hoja. La fotorrespiración aumenta, consumiendo ATP sin fijar carbono.',
    },
    {
      icono: '🌍',
      titulo: 'Calentamiento global y productividad vegetal',
      descripcion:
        'Modelos del IPCC predicen que +2 °C podría aumentar la fotosíntesis en latitudes frías (factor temperatura deja de limitar) pero reducirla en zonas tropicales ya calientes. El aumento de CO₂ atmosférico beneficia a plantas C3 (trigo, arroz) más que a C4 (maíz, caña) que ya concentran CO₂ internamente.',
    },
  ];

  const faq = [
    {
      pregunta: '¿Qué diferencia hay entre fotosíntesis y respiración celular?',
      respuesta:
        'La fotosíntesis ocurre en los cloroplastos y convierte CO₂ + H₂O en glucosa usando energía lumínica, liberando O₂. La respiración celular ocurre en las mitocondrias (en todas las células) y hace lo contrario: consume O₂ y glucosa para obtener ATP, liberando CO₂ y H₂O. Las plantas realizan ambos procesos simultáneamente; solo durante el día la fotosíntesis supera a la respiración.',
    },
    {
      pregunta:
        '¿Por qué las plantas tienen hojas verdes y no negras (que absorberían más luz)?',
      respuesta:
        'Las clorofilas absorben sobre todo luz roja (660-700 nm) y azul (430-450 nm), pero reflejan el verde (~550 nm), que nos llega como el color "verde" de la hoja. Una hoja negra absorbería todas las longitudes de onda y se calentaría en exceso, desnaturalizando enzimas. El verde es un compromiso evolutivo entre captación y control térmico.',
    },
    {
      pregunta: '¿Qué es la fotorrespiración?',
      respuesta:
        'A temperaturas altas y baja concentración de CO₂, la enzima RuBisCO fija O₂ en lugar de CO₂ (proceso improductivo que consume energía sin producir glucosa). Puede reducir la fotosíntesis neta hasta en un 25% en plantas C3 en días calurosos. Las plantas C4 (maíz, sorgo) evolucionaron mecanismos para concentrar CO₂ en la célula y evitar este problema.',
    },
    {
      pregunta: '¿Cómo afecta la contaminación a la fotosíntesis?',
      respuesta:
        'El ozono troposférico (O₃) daña las membranas de las células del mesófilo, reduciendo la eficiencia del fotosistema II. El dióxido de azufre (SO₂) altera el pH del cloroplasto e inhibe enzimas del ciclo de Calvin. La contaminación lumínica nocturna puede interferir con los ritmos circadianos de las plantas en zonas urbanas.',
    },
    {
      pregunta: '¿Cuándo es la temperatura óptima para la fotosíntesis?',
      respuesta:
        'Depende de la especie. Las plantas de zonas templadas tienen óptimo entre 20-25 °C; las de zonas tropicales entre 30-35 °C. En general, por encima del óptimo, la tasa cae por inactivación de RuBisCO y aumento de la fotorrespiración. Por debajo, la velocidad de las reacciones enzimáticas (fase oscura) limita la tasa aunque la luz sea abundante.',
    },
  ];

  const pasos = [
    {
      n: 1,
      titulo: 'Definir la variable a medir',
      descripcion:
        'Elige un único factor a variar (luz, CO₂ o temperatura). Mantén los otros dos constantes en sus valores óptimos. Así aplicas el diseño experimental de "una variable a la vez" (OVAT).',
    },
    {
      n: 2,
      titulo: 'Preparar la muestra biológica',
      descripcion:
        'Usa discos de hoja (sacados con perforadora) sumergidos en bicarbonato sódico 0,2% (fuente de CO₂). Extrae el aire de los discos con una jeringa para que se hundan. Al recuperar la flotabilidad indican producción de O₂.',
    },
    {
      n: 3,
      titulo: 'Controlar las condiciones',
      descripcion:
        'Usa baños de temperatura controlada, lámparas con filtros de calor y concentraciones de CO₂ medidas con analizador de gas (o bicarbonato a distintas concentraciones). Registra la temperatura del agua con termómetro digital.',
    },
    {
      n: 4,
      titulo: 'Medir y registrar datos',
      descripcion:
        'Cuenta cuántos discos flotan a los 10 minutos para cada valor del factor. O mide con oxímetro la concentración de O₂ disuelto en agua. Repite el experimento tres veces para calcular la media y la desviación típica.',
    },
    {
      n: 5,
      titulo: 'Analizar y concluir',
      descripcion:
        'Representa en una gráfica el factor (eje X) frente a la tasa de fotosíntesis (eje Y). Identifica el punto de saturación, el óptimo y el punto de inhibición. Compara tus curvas con las curvas teóricas de Michaelis-Menten y discute las desviaciones observadas.',
    },
  ];

  const tips = [
    {
      icono: '🔍',
      titulo: 'Identifica el factor limitante',
      descripcion:
        'En un problema de EBAU busca cuál de los tres factores está en su nivel más bajo relativo a su punto de saturación. Ese es el limitante. Si te dan una gráfica, el factor que se varía es el del eje X; el limitante es el que sube la curva.',
    },
    {
      icono: '📈',
      titulo: 'Interpreta la forma de la curva',
      descripcion:
        'Una curva que sube rápido y luego se aplana indica saturación: el factor ya no limita. Si en ese punto subes otro factor (p.ej. CO₂), la curva vuelve a subir. Este patrón es la "firma" clásica de la Ley de Blackman en gráficas de examen.',
    },
    {
      icono: '🌡️',
      titulo: 'Temperatura: recuerda la forma de campana',
      descripcion:
        'A diferencia de luz y CO₂ (curvas de saturación), la temperatura forma una curva en campana asimétrica: sube hasta el óptimo (~25°C) y cae más bruscamente por encima. La caída se debe a desnaturalización enzimática, no solo a menor velocidad de reacción.',
    },
    {
      icono: '✏️',
      titulo: 'Fórmula clave para el examen',
      descripcion:
        'La ecuación global de la fotosíntesis (6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂) es el punto de partida. Si el examen pregunta por el cociente fotosintético (CO₂ absorbido / O₂ liberado), es igual a 1 para carbohidratos.',
    },
  ];

  const erroresFrecuentes = [
    'Confundir fotosíntesis (en cloroplastos, solo en células con clorofila) con respiración celular (en mitocondrias, en todas las células).',
    'Creer que más luz siempre aumenta la fotosíntesis: por encima del punto de saturación, no aporta nada; con exceso extremo produce fotoinhibición.',
    'No entender que es el MÍNIMO de los factores el que controla la tasa: si CO₂ es 0 aunque haya luz y calor óptimos, la fotosíntesis se detiene (Ley de Blackman).',
    'Confundir cloroplasto (orgánulo donde ocurre la fotosíntesis) con clorofila (el pigmento que captura la luz). Clorofila está dentro del cloroplasto.',
    'Olvidar que la temperatura también limita las reacciones enzimáticas de la fase oscura (ciclo de Calvin), aunque la fase luminosa no dependa de enzimas directamente.',
  ];

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌿 Simulador de Fotosíntesis: Factores Limitantes</h1>
          <p className={styles.subtitle}>
            Ajusta la luz, el CO₂ y la temperatura y descubre cuál limita la producción de glucosa.
            Basado en la Ley de Blackman (1905) y el modelo cinético Michaelis-Menten.
          </p>
        </header>

        <LegalNotice />

        {/* Ecuación química */}
        <div className={styles.ecuacionBox} role="img" aria-label="Ecuación de la fotosíntesis">
          <span className={styles.ecuacionTexto}>
            6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂
          </span>
        </div>

        {/* Indicador de tasa grande */}
        <div className={styles.tasaIndicador}>
          <span
            className={styles.tasaValor}
            style={{ color: colorTasa }}
            aria-live="polite"
            aria-label={`Tasa de fotosíntesis: ${tasaPct} por ciento`}
          >
            {tasaPct}%
          </span>
          <span className={styles.tasaLabel}>Tasa de fotosíntesis</span>
        </div>

        {/* Sliders de control */}
        <section className={styles.slidersPanel} aria-label="Controles de factores ambientales">
          {/* Luz */}
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-luz">
              ☀️ Intensidad lumínica
              <span className={styles.sliderValue}>{luz}%</span>
            </label>
            <input
              id="slider-luz"
              type="range"
              min={0}
              max={100}
              step={1}
              value={luz}
              onChange={(e) => setLuz(Number(e.target.value))}
              className={styles.slider}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={luz}
              aria-label="Intensidad lumínica"
            />
            <div className={styles.sliderTicks}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* CO₂ */}
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-co2">
              💨 Concentración de CO₂
              <span className={styles.sliderValue}>{formatNumber(co2 * 100, 2)}%</span>
            </label>
            <input
              id="slider-co2"
              type="range"
              min={0.01}
              max={0.10}
              step={0.005}
              value={co2}
              onChange={(e) => setCo2(Number(e.target.value))}
              className={styles.slider}
              aria-valuemin={0.01}
              aria-valuemax={0.10}
              aria-valuenow={co2}
              aria-label="Concentración de CO2"
            />
            <div className={styles.sliderTicks}>
              <span>0,01%</span>
              <span>0,05%</span>
              <span>0,10%</span>
            </div>
          </div>

          {/* Temperatura */}
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-temp">
              🌡️ Temperatura
              <span className={styles.sliderValue}>{temp} °C</span>
            </label>
            <input
              id="slider-temp"
              type="range"
              min={5}
              max={40}
              step={1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className={styles.slider}
              aria-valuemin={5}
              aria-valuemax={40}
              aria-valuenow={temp}
              aria-label="Temperatura en grados centígrados"
            />
            <div className={styles.sliderTicks}>
              <span>5 °C</span>
              <span>22 °C</span>
              <span>40 °C</span>
            </div>
          </div>
        </section>

        {/* Cards de factores */}
        <section className={styles.factoresGrid} aria-label="Estado de los factores limitantes">
          {/* Card Luz */}
          <div
            className={`${styles.factorCard} ${limitante === 'luz' ? styles.factorCardLimitante : ''}`}
            role="group"
            aria-label="Factor luz"
          >
            {limitante === 'luz' && (
              <span className={styles.limitanteBadge} aria-label="Factor limitante activo">
                FACTOR LIMITANTE
              </span>
            )}
            <span className={styles.factorIcon} aria-hidden="true">☀️</span>
            <span className={styles.factorNombre}>Luz</span>
            <div className={styles.factorBarra} role="progressbar" aria-valuenow={Math.round(fL * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Factor luz">
              <div className={styles.factorBarraFill} style={{ width: `${fL * 100}%` }} />
            </div>
            <span className={styles.factorValorNum}>
              Factor: {formatNumber(fL, 3)}
            </span>
          </div>

          {/* Card CO₂ */}
          <div
            className={`${styles.factorCard} ${limitante === 'co2' ? styles.factorCardLimitante : ''}`}
            role="group"
            aria-label="Factor CO2"
          >
            {limitante === 'co2' && (
              <span className={styles.limitanteBadge} aria-label="Factor limitante activo">
                FACTOR LIMITANTE
              </span>
            )}
            <span className={styles.factorIcon} aria-hidden="true">💨</span>
            <span className={styles.factorNombre}>CO₂</span>
            <div className={styles.factorBarra} role="progressbar" aria-valuenow={Math.round(fC * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Factor CO2">
              <div className={styles.factorBarraFill} style={{ width: `${fC * 100}%` }} />
            </div>
            <span className={styles.factorValorNum}>
              Factor: {formatNumber(fC, 3)}
            </span>
          </div>

          {/* Card Temperatura */}
          <div
            className={`${styles.factorCard} ${limitante === 'temperatura' ? styles.factorCardLimitante : ''}`}
            role="group"
            aria-label="Factor temperatura"
          >
            {limitante === 'temperatura' && (
              <span className={styles.limitanteBadge} aria-label="Factor limitante activo">
                FACTOR LIMITANTE
              </span>
            )}
            <span className={styles.factorIcon} aria-hidden="true">🌡️</span>
            <span className={styles.factorNombre}>Temperatura</span>
            <div className={styles.factorBarra} role="progressbar" aria-valuenow={Math.round(fT * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Factor temperatura">
              <div className={styles.factorBarraFill} style={{ width: `${fT * 100}%` }} />
            </div>
            <span className={styles.factorValorNum}>
              Factor: {formatNumber(fT, 3)}
            </span>
          </div>
        </section>

        {/* Hoja con animación de burbujas O₂ */}
        <section className={styles.hojaSection} aria-label="Visualización de producción de oxígeno">
          <div className={styles.hojaContainer}>
            {/* SVG hoja simplificada */}
            <svg
              className={styles.hojaSvg}
              viewBox="0 0 120 160"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Hoja */}
              <ellipse cx="60" cy="80" rx="45" ry="65" fill="#27ae60" opacity="0.85" />
              <ellipse cx="60" cy="80" rx="45" ry="65" fill="none" stroke="#1e8449" strokeWidth="2" />
              {/* Nervio central */}
              <line x1="60" y1="15" x2="60" y2="145" stroke="#1e8449" strokeWidth="2" opacity="0.6" />
              {/* Nervios laterales */}
              <line x1="60" y1="50" x2="35" y2="65" stroke="#1e8449" strokeWidth="1.2" opacity="0.5" />
              <line x1="60" y1="50" x2="85" y2="65" stroke="#1e8449" strokeWidth="1.2" opacity="0.5" />
              <line x1="60" y1="80" x2="28" y2="90" stroke="#1e8449" strokeWidth="1.2" opacity="0.5" />
              <line x1="60" y1="80" x2="92" y2="90" stroke="#1e8449" strokeWidth="1.2" opacity="0.5" />
              <line x1="60" y1="110" x2="38" y2="118" stroke="#1e8449" strokeWidth="1.2" opacity="0.5" />
              <line x1="60" y1="110" x2="82" y2="118" stroke="#1e8449" strokeWidth="1.2" opacity="0.5" />
            </svg>

            {/* Burbujas de O₂ */}
            {burbujas.map((b) => (
              <div
                key={b.id}
                className={styles.burbuja}
                style={{
                  left: `${b.left}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  animationDelay: `${b.delay}s`,
                  animationDuration: `${b.duration}s`,
                }}
                aria-hidden="true"
              />
            ))}

            <p className={styles.hojaLabel}>
              O₂ producido · {tasaPct}% de tasa máxima
            </p>
          </div>
        </section>

        {/* Bloque educativo v2.0 */}
        <EducationalSection
          title="📚 Guía completa: Fotosíntesis y Factores Limitantes"
          subtitle="Ley de Blackman, modelo cinético y estrategias para el examen"
          icon="🌿"
        >
          {/* Introducción */}
          <section className={styles.guideSection}>
            <h2>¿Qué son los factores limitantes de la fotosíntesis?</h2>
            <p>
              La <strong>fotosíntesis</strong> es el proceso por el que las plantas, algas y
              cianobacterias convierten energía lumínica en energía química almacenada como glucosa.
              La reacción global es: <code>6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂</code>.
            </p>
            <p>
              En 1905, el fisiólogo vegetal <strong>Frederick Frost Blackman</strong> formuló la
              Ley de los Factores Limitantes: <em>"Cuando un proceso está condicionado por varios
              factores, su velocidad está limitada por el factor que se encuentre en condiciones
              más desfavorables"</em>. En términos matemáticos, la tasa global es proporcional al
              mínimo de los factores parciales.
            </p>
            <p>
              Este simulador modela la respuesta de cada factor con una función de saturación
              tipo <strong>Michaelis-Menten</strong> (usada en enzimología), que describe cómo la
              velocidad de reacción satura al aumentar el sustrato. El punto de
              semi-saturación K<sub>m</sub> indica el valor del factor al que se alcanza la mitad
              de la respuesta máxima.
            </p>
          </section>

          {/* Tabla comparativa de factores */}
          <section className={styles.guideSection}>
            <h2>Tabla comparativa: los 6 principales factores</h2>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>Rango óptimo</th>
                    <th>Efecto de deficiencia</th>
                    <th>Efecto de exceso</th>
                    <th>Ejemplo práctico</th>
                  </tr>
                </thead>
                <tbody>
                  {tablaComparativa.map((fila) => (
                    <tr key={fila.factor}>
                      <td><strong>{fila.factor}</strong></td>
                      <td>{fila.rango}</td>
                      <td>{fila.deficiencia}</td>
                      <td>{fila.exceso}</td>
                      <td>{fila.ejemplo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios reales */}
          <section className={styles.guideSection}>
            <h2>Escenarios del mundo real</h2>
            <div className={styles.scenariosGrid}>
              {escenarios.map((s) => (
                <div key={s.titulo} className={styles.scenarioCard}>
                  <span className={styles.scenarioIcon} aria-hidden="true">{s.icono}</span>
                  <h3>{s.titulo}</h3>
                  <p>{s.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <dl className={styles.faqList}>
              {faq.map((item) => (
                <div key={item.pregunta} className={styles.faqItem}>
                  <dt className={styles.faqTip}>❓ {item.pregunta}</dt>
                  <dd>{item.respuesta}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Guía de experimento */}
          <section className={styles.guideSection}>
            <h2>Cómo diseñar un experimento para medir la fotosíntesis</h2>
            <ol className={styles.stepGuide} aria-label="Pasos del experimento">
              {pasos.map((p) => (
                <li key={p.n} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">{p.n}</span>
                  <div className={styles.stepContent}>
                    <strong>{p.titulo}</strong>
                    <p>{p.descripcion}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Tips para el examen */}
          <section className={styles.guideSection}>
            <h2>Tips para identificar el factor limitante en EBAU</h2>
            <div className={styles.tipsGrid}>
              {tips.map((t) => (
                <div key={t.titulo} className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">{t.icono}</span>
                  <strong>{t.titulo}</strong>
                  <p>{t.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Errores frecuentes */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>5 errores frecuentes en el examen</strong>
              </div>
              <ul className={styles.warningList}>
                {erroresFrecuentes.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-fotosintesis-factores')} />
        <ShareCard appName="simulador-fotosintesis-factores" />
        <Footer appName="simulador-fotosintesis-factores" />
    </div>
  );
}
