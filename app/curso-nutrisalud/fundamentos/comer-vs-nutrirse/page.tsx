'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function ComerVsNutrirsePage() {
  const sections = [
    {
      title: 'El Concepto Fundamental que Cambia Todo',
      icon: '🧠',
      content: (
        <>
          <p>
            <strong>Comer</strong> es un acto mecánico de introducir alimentos en tu
            cuerpo para obtener calorías y saciar el hambre. <strong>Nutrirse</strong> es
            proporcionar a cada célula de tu organismo exactamente lo que necesita para
            funcionar de manera óptima. La diferencia entre ambos conceptos determina si
            tu alimentación construye salud o simplemente llena espacio.
          </p>
          <p>
            En nuestra sociedad moderna, es perfectamente posible estar <strong>sobrealimentado
            pero desnutrido</strong>. Esto ocurre cuando consumimos suficientes (o excesivas)
            calorías, pero estas provienen de alimentos que no aportan los micronutrientes,
            fitonutrientes y compuestos bioactivos que nuestras células necesitan para la
            reparación, el metabolismo energético, la función inmune y la prevención del
            envejecimiento.
          </p>
          <p>
            El resultado es un cuerpo que sigue enviando señales de hambre porque, a nivel
            celular, no está recibiendo lo que necesita, creando un ciclo vicioso de
            sobrealimentación sin nutrición real.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧬 Paradoja moderna:</strong> Un adulto promedio puede consumir más de
              3.000 calorías diarias pero tener deficiencias de vitamina D, magnesio, omega-3
              y fibra. Su cuerpo está energéticamente saturado pero nutricionalmente hambriento,
              generando inflamación crónica, fatiga y antojos constantes.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Comer vs Nutrirse: Dos Paradigmas Opuestos',
      icon: '⚖️',
      content: (
        <>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍔</span>
              <h4 className={styles.exampleTitle}>COMER</h4>
              <p className={styles.exampleDesc}>
                Enfoque cuantitativo centrado en calorías, saciedad inmediata y
                satisfacción sensorial.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥗</span>
              <h4 className={styles.exampleTitle}>NUTRIRSE</h4>
              <p className={styles.exampleDesc}>
                Enfoque cualitativo centrado en densidad nutricional, biodisponibilidad
                y salud celular.
              </p>
            </div>
          </div>

          <h3>Características de &quot;Solo Comer&quot;:</h3>
          <ul>
            <li>Foco en calorías y macronutrientes básicos</li>
            <li>Saciedad temporal, hambre recurrente</li>
            <li>Objetivo: llenar el estómago</li>
            <li>Puede generar picos de glucosa e inflamación</li>
            <li>Ciclo: hambre → saciedad → hambre</li>
            <li>Decisiones impulsivas y emocionales</li>
          </ul>

          <h3>Características de &quot;Nutrirse&quot;:</h3>
          <ul>
            <li>Incluye micronutrientes, antioxidantes, fitonutrientes</li>
            <li>Saciedad duradera, menor frecuencia de hambre</li>
            <li>Objetivo: alimentar cada célula</li>
            <li>Estabiliza glucosa y reduce inflamación</li>
            <li>Ciclo: nutrición → equilibrio → bienestar</li>
            <li>Decisiones conscientes y planificadas</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Ejemplos Prácticos: Mismas Calorías, Diferente Impacto',
      icon: '📊',
      content: (
        <>
          <p>
            Veamos ejemplos concretos de cómo dos comidas con las mismas calorías
            pueden tener impactos metabólicos completamente diferentes:
          </p>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Almuerzo &quot;Comer&quot; (650 kcal)</th>
                <th>Almuerzo &quot;Nutrirse&quot; (650 kcal)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Comida</td>
                <td>Hamburguesa + patatas fritas + refresco</td>
                <td>Salmón + quinoa + verduras + aguacate</td>
              </tr>
              <tr>
                <td>Nutrientes esenciales</td>
                <td>~15</td>
                <td>40+</td>
              </tr>
              <tr>
                <td>Duración saciedad</td>
                <td>~3 horas</td>
                <td>~6 horas</td>
              </tr>
              <tr>
                <td>Pico glucémico</td>
                <td>Alto</td>
                <td>Estable</td>
              </tr>
              <tr>
                <td>Densidad nutricional</td>
                <td>Baja</td>
                <td>Alta</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Dato clave:</strong> Una comida con alta densidad nutricional
              mantiene la saciedad hasta el doble de tiempo porque tu cuerpo recibe
              lo que realmente necesita, reduciendo las señales de hambre prematuras.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Densidad Nutricional: El Concepto Clave',
      icon: '🎯',
      content: (
        <>
          <p>
            La <strong>densidad nutricional</strong> es la cantidad de nutrientes
            esenciales (vitaminas, minerales, antioxidantes, fibra) que un alimento
            proporciona en relación con su contenido calórico.
          </p>

          <h3>Alimentos de alta densidad nutricional:</h3>
          <ul>
            <li><strong>Verduras de hoja verde:</strong> Espinacas, kale, acelgas</li>
            <li><strong>Vegetales crucíferos:</strong> Brócoli, coliflor, coles de Bruselas</li>
            <li><strong>Frutos rojos:</strong> Arándanos, frambuesas, fresas</li>
            <li><strong>Pescados grasos:</strong> Salmón, sardinas, caballa</li>
            <li><strong>Legumbres:</strong> Lentejas, garbanzos, judías</li>
            <li><strong>Huevos:</strong> Especialmente la yema (rica en nutrientes)</li>
          </ul>

          <h3>Alimentos de baja densidad nutricional:</h3>
          <ul>
            <li>Bebidas azucaradas y refrescos</li>
            <li>Bollería industrial y galletas</li>
            <li>Patatas fritas y snacks procesados</li>
            <li>Pan blanco refinado</li>
            <li>Cereales de desayuno azucarados</li>
            <li>Comida rápida y ultraprocesados</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Cómo Hacer la Transición de Comer a Nutrirse',
      icon: '🚀',
      content: (
        <>
          <div className={styles.highlightBox}>
            <p>
              <strong>🎯 Regla del 80/20 nutricional:</strong> Busca que el 80% de tus
              calorías provengan de alimentos nutricionalmente densos (verduras, frutas,
              proteínas completas, grasas saludables). El 20% restante puede ser más
              flexible sin comprometer tu salud general.
            </p>
          </div>

          <h3>Estrategias prácticas:</h3>

          <div className={styles.infoBox}>
            <p>
              <strong>🌈 Diversidad cromática:</strong> Cada color en frutas y verduras
              representa diferentes fitonutrientes. Una comida que incluya 4-5 colores
              diferentes garantiza un espectro amplio de antioxidantes y compuestos bioactivos.
            </p>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>⏱️ Test de saciedad:</strong> Una comida nutritiva debe mantenerte
              saciado durante 3-4 horas sin antojos. Si tienes hambre antes, probablemente
              necesites más proteína, grasas saludables o fibra en tu próxima comida.
            </p>
          </div>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧠 Pregunta clave:</strong> Antes de cada comida pregúntate:
              &quot;¿Esto va a nutrir mis células o solo va a llenar mi estómago?&quot;
              Esta simple reflexión puede transformar gradualmente tus elecciones alimentarias.
            </p>
          </div>

          <h3>Pasos para la transición:</h3>
          <ol>
            <li>Aumenta progresivamente las verduras en cada comida</li>
            <li>Incluye una fuente de proteína de calidad en cada comida principal</li>
            <li>Añade grasas saludables (aguacate, aceite de oliva, frutos secos)</li>
            <li>Reduce gradualmente alimentos ultraprocesados</li>
            <li>Presta atención a cómo te sientes después de comer</li>
          </ol>
        </>
      ),
    },
  ];

  return <ChapterPage slug="comer-vs-nutrirse" sections={sections} />;
}
