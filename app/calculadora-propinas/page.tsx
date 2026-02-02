'use client';

import { useState, useEffect } from 'react';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatCurrency } from '@/lib/formatters';
import { jsonLd } from './metadata';
import styles from './CalculadoraPropinas.module.css';
import { getRelatedApps } from '@/data/app-relations';

export default function CalculadoraPropinas() {
  // Estados
  const [monto, setMonto] = useState<number>(0);
  const [porcentaje, setPorcentaje] = useState<number>(15);
  const [personas, setPersonas] = useState<number>(1);
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('custom');

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

      {/* Logo meskeIA */}
      <MeskeiaLogo />

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

        <DisclaimerCard
          variant="financial"
          severity="medium"
          context="calculadora-propinas"
          collapsible={true}
        />

        <LastUpdated
          date="2026-02-02"
          changelog={[
            "Añadido disclaimer financiero con información de responsabilidad legal",
            "Advertencia sobre variaciones culturales en propinas según el país",
            "Mejorada accesibilidad con ARIA labels en componentes interactivos"
          ]}
        />

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="¿Quieres aprender más sobre Propinas?"
          subtitle="Descubre porcentajes por país, cuándo dejar más y consejos prácticos"
        >
          <section className={styles.guideSection}>
            <h2>Conceptos Clave</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🇪🇸 España: 5-10%</h4>
                <p>
                  Opcional, solo para servicio excepcional. No es obligatorio ni esperado.
                  Redondear al alza es lo más común.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>🇺🇸 Estados Unidos: 15-20%</h4>
                <p>
                  Obligatorio socialmente. Los camareros dependen de propinas ya que el
                  salario base es muy bajo. Menos del 15% es ofensivo.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>🇯🇵 Japón: 0%</h4>
                <p>
                  Dejar propina se considera ofensivo. El buen servicio es parte de la
                  cultura y está incluido en el precio.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>💡 Truco del 10%</h4>
                <p>
                  Mueve el decimal un lugar: 45€ → 4,50€. Para 15% suma la mitad: 4,50€ + 2,25€ = 6,75€.
                  Rápido y sin calculadora.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Debo dejar propina si el servicio ya está incluido?</summary>
                <p>
                  Si la cuenta ya incluye &quot;servicio&quot; o &quot;service charge&quot;, no es necesario
                  añadir más. Revisa siempre el desglose de la factura antes de calcular.
                  Si el servicio fue excepcional, puedes añadir algo extra.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cuánto dejar en grupos grandes?</summary>
                <p>
                  Para 6 o más personas, 15-18% es apropiado ya que requiere más trabajo
                  del personal. Algunos restaurantes añaden propina automática para grupos.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Es mejor propina en efectivo o tarjeta?</summary>
                <p>
                  Muchos camareros prefieren efectivo porque lo reciben directamente sin
                  esperar al cierre de caja. Sin embargo, tarjeta es perfectamente aceptable.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué hago si el servicio fue malo?</summary>
                <p>
                  Puedes reducir la propina, pero considera hablar con el gerente sobre el
                  problema. Un mal día del camarero no siempre justifica eliminar la propina
                  completamente.
                </p>
              </details>
            </div>
          </section>
        </EducationalSection>
      </main>

      {/* Footer meskeIA */}
      <RelatedApps apps={getRelatedApps('Calculadora de Propinas')} />
      <Footer appName="Calculadora de Propinas" />
    </>
  );
}
