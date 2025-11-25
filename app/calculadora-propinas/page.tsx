'use client';

import { useState, useEffect } from 'react';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import ResultCard from '@/components/ResultCard';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatCurrency } from '@/lib/formatters';
import { jsonLd } from './metadata';
import styles from './CalculadoraPropinas.module.css';

export default function CalculadoraPropinas() {
  // Estados
  const [monto, setMonto] = useState<number>(0);
  const [porcentaje, setPorcentaje] = useState<number>(15);
  const [personas, setPersonas] = useState<number>(1);
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('custom');
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Cargar preferencias guardadas
  useEffect(() => {
    const prefs = localStorage.getItem('prefs-propinas');
    if (prefs) {
      try {
        const datos = JSON.parse(prefs);
        if (datos.porcentaje) setPorcentaje(datos.porcentaje);
        if (datos.personas) setPersonas(datos.personas);
        if (datos.pais) setPaisSeleccionado(datos.pais);
      } catch (e) {
        console.error('Error al cargar preferencias:', e);
      }
    }
  }, []);

  // Guardar preferencias
  useEffect(() => {
    const prefs = {
      porcentaje,
      personas,
      pais: paisSeleccionado,
    };
    localStorage.setItem('prefs-propinas', JSON.stringify(prefs));
  }, [porcentaje, personas, paisSeleccionado]);

  // Cálculos
  const propina = monto * (porcentaje / 100);
  const total = monto + propina;
  const totalPorPersona = total / personas;

  // Función para establecer porcentaje desde botones
  const establecerPorcentaje = (valor: number) => {
    setPorcentaje(valor);
    setPaisSeleccionado('custom');
  };

  // Función para manejar cambio de país
  const cambiarPais = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setPaisSeleccionado(valor);

    if (valor !== 'custom') {
      setPorcentaje(parseInt(valor));
    }
  };

  // Función para resetear
  const resetear = () => {
    setMonto(0);
    setPorcentaje(15);
    setPersonas(1);
    setPaisSeleccionado('custom');
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="calculadora-propinas" />

      {/* Header meskeIA */}
      <FixedHeader />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            💶 Calculadora de Propinas
          </h1>
          <p className={styles.subtitle}>
            Calcula la propina automáticamente según el país y divide la cuenta entre varias personas
          </p>
        </header>

        {/* Formulario */}
        <div className={styles.formSection}>
          {/* Input de monto */}
          <div className={styles.inputGroup}>
            <label htmlFor="monto" className={styles.label}>
              Monto de la cuenta (€)
            </label>
            <input
              type="number"
              id="monto"
              className={styles.input}
              value={monto || ''}
              onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>

          {/* Botones de porcentaje */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Selecciona porcentaje:</label>
            <div className={styles.porcentajes}>
              <button
                type="button"
                className={`${styles.btnPorcentaje} ${
                  porcentaje === 10 ? styles.activo : ''
                }`}
                onClick={() => establecerPorcentaje(10)}
              >
                10%
              </button>
              <button
                type="button"
                className={`${styles.btnPorcentaje} ${
                  porcentaje === 15 ? styles.activo : ''
                }`}
                onClick={() => establecerPorcentaje(15)}
              >
                15%
              </button>
              <button
                type="button"
                className={`${styles.btnPorcentaje} ${
                  porcentaje === 20 ? styles.activo : ''
                }`}
                onClick={() => establecerPorcentaje(20)}
              >
                20%
              </button>
            </div>
          </div>

          {/* Porcentaje personalizado */}
          <div className={styles.inputGroup}>
            <label htmlFor="porcentaje" className={styles.label}>
              Porcentaje personalizado (%)
            </label>
            <input
              type="number"
              id="porcentaje"
              className={styles.input}
              value={porcentaje || ''}
              onChange={(e) => {
                setPorcentaje(parseFloat(e.target.value) || 0);
                setPaisSeleccionado('custom');
              }}
              min={0}
              max={100}
              step={0.5}
            />
          </div>

          {/* Selector de país */}
          <div className={styles.inputGroup}>
            <label htmlFor="pais" className={styles.label}>
              País/Contexto de propina
            </label>
            <select
              id="pais"
              className={styles.select}
              value={paisSeleccionado}
              onChange={cambiarPais}
            >
              <option value="10">🇪🇸 España (10%)</option>
              <option value="18">🇺🇸 Estados Unidos (18%)</option>
              <option value="12">🇲🇽 México (12%)</option>
              <option value="10">🇬🇧 Reino Unido (10%)</option>
              <option value="8">🇫🇷 Francia (8%)</option>
              <option value="8">🇩🇪 Alemania (8%)</option>
              <option value="0">🇯🇵 Japón (0% - No propina)</option>
              <option value="custom">✏️ Personalizado</option>
            </select>
          </div>

          {/* División de cuenta */}
          <div className={styles.inputGroup}>
            <label htmlFor="personas" className={styles.label}>
              Número de personas
            </label>
            <input
              type="number"
              id="personas"
              className={styles.input}
              value={personas || ''}
              onChange={(e) => setPersonas(parseInt(e.target.value) || 1)}
              min={1}
              max={50}
              step={1}
            />
          </div>

          {/* Botón Reset */}
          <button
            type="button"
            className={styles.btnReset}
            onClick={resetear}
          >
            🔄 Limpiar
          </button>
        </div>

        {/* Resultados usando ResultCard */}
        <div className={styles.resultsSection}>
          <ResultCard
            title="Monto original"
            value={formatCurrency(monto)}
            variant="default"
          />
          <ResultCard
            title="Propina total"
            value={formatCurrency(propina)}
            description={`${porcentaje}%`}
            variant="info"
          />
          <ResultCard
            title="Total a pagar"
            value={formatCurrency(total)}
            variant="highlight"
          />
          {personas > 1 && (
            <ResultCard
              title="Por persona"
              value={formatCurrency(totalPorPersona)}
              description={`${personas} ${personas === 1 ? 'persona' : 'personas'}`}
              variant="success"
            />
          )}
        </div>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Propinas y Costumbres Internacionales?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre cómo calcular propinas correctamente, porcentajes por país, cuándo dejar más y consejos prácticos
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            {/* Secciones educativas */}
            <section className={styles.guideSection}>
              <h2>¿Cómo usar la Calculadora de Propinas?</h2>
              <p>
                Calcular propinas correctamente es muy sencillo con esta herramienta
                gratuita. Sigue estos pasos para obtener el cálculo perfecto:
              </p>
              <ul>
                <li>
                  <strong>Paso 1</strong>: Introduce el monto total de la cuenta en
                  euros (ejemplo: 45,50 €)
                </li>
                <li>
                  <strong>Paso 2</strong>: Selecciona un país/contexto para aplicar
                  el porcentaje recomendado, o usa los botones rápidos (10%, 15%,
                  20%)
                </li>
                <li>
                  <strong>Paso 3</strong>: Si estás en grupo, indica el número de
                  personas para dividir la cuenta automáticamente
                </li>
                <li>
                  <strong>Paso 4</strong>: La calculadora muestra al instante el
                  total con propina y el monto que debe pagar cada persona
                </li>
              </ul>
              <p>
                Tus preferencias se guardan automáticamente para la próxima vez. Usa
                el botón "Limpiar" para resetear todos los valores.
              </p>
            </section>

            <section className={styles.guideSection}>
              <h2>Porcentajes de Propina por País</h2>
              <p>
                Las costumbres de propinas varían significativamente según el país y
                la cultura. Aquí tienes una guía rápida de los porcentajes más
                comunes:
              </p>
              <div className={styles.contentGrid}>
                <div className={styles.contentCard}>
                  <h4>🇪🇸 España</h4>
                  <p><strong>5-10%</strong> (opcional, servicio excepcional. No es obligatorio)</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🇺🇸 Estados Unidos</h4>
                  <p><strong>15-20%</strong> (esperado y parte del salario del camarero)</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🇲🇽 México</h4>
                  <p><strong>10-15%</strong> (común en restaurantes, a veces incluido en cuenta)</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🇬🇧 Reino Unido</h4>
                  <p><strong>10-15%</strong> (discrecional, a veces incluido como "service charge")</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🇫🇷 Francia</h4>
                  <p><strong>5-10%</strong> (el servicio suele estar incluido en la cuenta)</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🇩🇪 Alemania</h4>
                  <p><strong>5-10%</strong> (costumbre redondear al alza el total)</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🇯🇵 Japón</h4>
                  <p><strong>0%</strong> (dejar propina se considera ofensivo culturalmente)</p>
                </div>
              </div>
              <p className={styles.note}>
                <strong>Importante:</strong> Siempre revisa si el servicio ya está incluido en la cuenta
                antes de añadir propina adicional.
              </p>
            </section>

            <section className={styles.guideSection}>
              <h2>¿Cuándo dejar más propina?</h2>
              <p>
                Hay situaciones donde es apropiado aumentar el porcentaje de propina
                como reconocimiento al servicio:
              </p>
              <div className={styles.contentGrid}>
                <div className={styles.contentCard}>
                  <h4>⭐ Servicio excepcional</h4>
                  <p>Si el servicio superó tus expectativas, considera 20% o más</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>👥 Grupos grandes</h4>
                  <p>Para 6 o más personas, 15-18% es apropiado (requiere más trabajo del personal)</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🍽️ Pedidos complejos</h4>
                  <p>Alergias alimentarias, personalizaciones o requerimientos especiales del menú</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🌙 Horarios difíciles</h4>
                  <p>Servicio en madrugada, festivos o condiciones climáticas adversas</p>
                </div>
                <div className={styles.contentCard}>
                  <h4>🚗 Servicio a domicilio</h4>
                  <p>Los repartidores merecen 10-15% por el esfuerzo del transporte</p>
                </div>
              </div>
              <p className={styles.note}>
                Por el contrario, si el servicio fue deficiente, es aceptable reducir
                la propina o hablar con el gerente sobre el problema.
              </p>
            </section>

            <section className={styles.guideSection}>
              <h2>Consejos para calcular propinas</h2>
              <ul>
                <li>
                  <strong>Método rápido 10%</strong>: Mueve el decimal un lugar a la
                  izquierda (45,00€ → 4,50€ de propina)
                </li>
                <li>
                  <strong>Para 15%</strong>: Calcula 10% y súmale la mitad (10% =
                  4,50€ → 15% = 4,50€ + 2,25€ = 6,75€)
                </li>
                <li>
                  <strong>Divide antes o después</strong>: Puedes calcular la propina
                  del total y luego dividir, o dividir la cuenta primero y que cada
                  uno añada su propina
                </li>
                <li>
                  <strong>Usa efectivo cuando puedas</strong>: Algunos camareros
                  prefieren propinas en efectivo en lugar de tarjeta
                </li>
                <li>
                  <strong>Revisa la cuenta</strong>: En algunos países la propina ya
                  está incluida como "servicio" o "service charge"
                </li>
              </ul>
            </section>
          </div>
        )}
      </main>

      {/* Footer meskeIA */}
      <Footer appName="Calculadora de Propinas" />
    </>
  );
}
