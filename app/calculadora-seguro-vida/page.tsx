'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraSeguroVida.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface ResultadoCalculo {
  capitalMinimo: number;
  capitalRecomendado: number;
  capitalOptimo: number;
  desglose: {
    sustitucionIngresos: number;
    deudas: number;
    hipoteca: number;
    educacionHijos: number;
    gastosFunerarios: number;
    colchonEmergencia: number;
  };
}

export default function CalculadoraSeguroVidaPage() {
  // Datos personales
  const [edad, setEdad] = useState('');
  const [edadJubilacion, setEdadJubilacion] = useState('67');

  // Ingresos
  const [ingresoAnual, setIngresoAnual] = useState('');
  const [ingresoConyuge, setIngresoConyuge] = useState('');

  // Deudas y compromisos
  const [hipotecaPendiente, setHipotecaPendiente] = useState('');
  const [otrasDeudas, setOtrasDeudas] = useState('');

  // Familia
  const [numHijos, setNumHijos] = useState('');
  const [edadHijoMenor, setEdadHijoMenor] = useState('');

  // Patrimonio
  const [ahorrosActuales, setAhorrosActuales] = useState('');
  const [seguroVidaActual, setSeguroVidaActual] = useState('');

  const calcularNecesidades = useMemo((): ResultadoCalculo | null => {
    const edadNum = parseSpanishNumber(edad);
    const jubilacionNum = parseSpanishNumber(edadJubilacion);
    const ingresoNum = parseSpanishNumber(ingresoAnual);

    if (!edadNum || !ingresoNum || edadNum < 18 || edadNum > 70) {
      return null;
    }

    const hipotecaNum = parseSpanishNumber(hipotecaPendiente) || 0;
    const deudasNum = parseSpanishNumber(otrasDeudas) || 0;
    const hijosNum = parseSpanishNumber(numHijos) || 0;
    const edadHijoNum = parseSpanishNumber(edadHijoMenor) || 0;
    const ahorrosNum = parseSpanishNumber(ahorrosActuales) || 0;
    const seguroActualNum = parseSpanishNumber(seguroVidaActual) || 0;
    const ingresoConyugeNum = parseSpanishNumber(ingresoConyuge) || 0;

    // Años hasta jubilación
    const anosHastaJubilacion = Math.max(0, jubilacionNum - edadNum);

    // 1. Sustitución de ingresos (método DINK ajustado)
    // Se calcula el ingreso neto que hay que sustituir
    const ingresoNetoASustituir = ingresoNum - ingresoConyugeNum * 0.3; // El cónyuge aporta pero necesita apoyo
    const factorSustitucion = Math.min(anosHastaJubilacion, 15); // Máximo 15 años de cobertura completa
    const sustitucionIngresos = Math.max(0, ingresoNetoASustituir * factorSustitucion * 0.7); // 70% del ingreso

    // 2. Deudas totales
    const deudas = hipotecaNum + deudasNum;

    // 3. Educación de hijos
    // Coste estimado por hijo hasta los 23 años (universidad incluida)
    let educacionHijos = 0;
    if (hijosNum > 0 && edadHijoNum > 0) {
      const anosHastaIndependencia = Math.max(0, 23 - edadHijoNum);
      // Coste anual estimado: 8.000€ (colegio/actividades) + 15.000€ universidad (últimos 5 años)
      const costeBasico = anosHastaIndependencia * 8000;
      const costeUniversidad = Math.min(anosHastaIndependencia, 5) * 15000;
      educacionHijos = (costeBasico + costeUniversidad) * hijosNum;
    }

    // 4. Gastos funerarios y últimos gastos
    const gastosFunerarios = 10000;

    // 5. Colchón de emergencia (6 meses de gastos)
    const colchonEmergencia = (ingresoNum / 12) * 6;

    // Capital bruto necesario
    const capitalBruto = sustitucionIngresos + deudas + educacionHijos + gastosFunerarios + colchonEmergencia;

    // Restar recursos disponibles
    const recursosDisponibles = ahorrosNum + seguroActualNum;

    // Tres niveles de cobertura
    const capitalMinimo = Math.max(0, deudas + gastosFunerarios + colchonEmergencia - recursosDisponibles);
    const capitalRecomendado = Math.max(0, capitalBruto - recursosDisponibles);
    const capitalOptimo = Math.max(0, capitalBruto * 1.2 - recursosDisponibles); // 20% extra por inflación

    return {
      capitalMinimo: Math.round(capitalMinimo / 1000) * 1000, // Redondear a miles
      capitalRecomendado: Math.round(capitalRecomendado / 1000) * 1000,
      capitalOptimo: Math.round(capitalOptimo / 1000) * 1000,
      desglose: {
        sustitucionIngresos: Math.round(sustitucionIngresos),
        deudas: Math.round(deudas),
        hipoteca: Math.round(hipotecaNum),
        educacionHijos: Math.round(educacionHijos),
        gastosFunerarios,
        colchonEmergencia: Math.round(colchonEmergencia),
      },
    };
  }, [edad, edadJubilacion, ingresoAnual, ingresoConyuge, hipotecaPendiente, otrasDeudas, numHijos, edadHijoMenor, ahorrosActuales, seguroVidaActual]);

  const limpiarFormulario = () => {
    setEdad('');
    setEdadJubilacion('67');
    setIngresoAnual('');
    setIngresoConyuge('');
    setHipotecaPendiente('');
    setOtrasDeudas('');
    setNumHijos('');
    setEdadHijoMenor('');
    setAhorrosActuales('');
    setSeguroVidaActual('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🛡️</span>
        <h1 className={styles.title}>Calculadora de Seguro de Vida</h1>
        <p className={styles.subtitle}>
          Descubre cuánto capital necesitas para proteger a tu familia ante imprevistos
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.inputSection}>
            <h2 className={styles.sectionTitle}>👤 Datos Personales</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={edad}
                onChange={setEdad}
                label="Tu edad actual"
                placeholder="35"
                min={18}
                max={70}
                helperText="Entre 18 y 70 años"
              />
              <NumberInput
                value={edadJubilacion}
                onChange={setEdadJubilacion}
                label="Edad de jubilación prevista"
                placeholder="67"
                min={60}
                max={70}
              />
            </div>
          </div>

          <div className={styles.inputSection}>
            <h2 className={styles.sectionTitle}>💰 Ingresos Anuales</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={ingresoAnual}
                onChange={setIngresoAnual}
                label="Tus ingresos anuales brutos"
                placeholder="35000"
                helperText="Salario bruto anual en euros"
              />
              <NumberInput
                value={ingresoConyuge}
                onChange={setIngresoConyuge}
                label="Ingresos del cónyuge (si aplica)"
                placeholder="0"
                helperText="Déjalo en blanco si no aplica"
              />
            </div>
          </div>

          <div className={styles.inputSection}>
            <h2 className={styles.sectionTitle}>🏠 Deudas y Compromisos</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={hipotecaPendiente}
                onChange={setHipotecaPendiente}
                label="Hipoteca pendiente"
                placeholder="150000"
                helperText="Capital pendiente de pagar"
              />
              <NumberInput
                value={otrasDeudas}
                onChange={setOtrasDeudas}
                label="Otras deudas"
                placeholder="0"
                helperText="Préstamos, tarjetas, etc."
              />
            </div>
          </div>

          <div className={styles.inputSection}>
            <h2 className={styles.sectionTitle}>👨‍👩‍👧‍👦 Situación Familiar</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={numHijos}
                onChange={setNumHijos}
                label="Número de hijos dependientes"
                placeholder="0"
                min={0}
                max={10}
              />
              <NumberInput
                value={edadHijoMenor}
                onChange={setEdadHijoMenor}
                label="Edad del hijo menor"
                placeholder="0"
                helperText="Déjalo en blanco si no tienes hijos"
              />
            </div>
          </div>

          <div className={styles.inputSection}>
            <h2 className={styles.sectionTitle}>💼 Recursos Actuales</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={ahorrosActuales}
                onChange={setAhorrosActuales}
                label="Ahorros e inversiones"
                placeholder="20000"
                helperText="Patrimonio líquido disponible"
              />
              <NumberInput
                value={seguroVidaActual}
                onChange={setSeguroVidaActual}
                label="Seguro de vida actual"
                placeholder="0"
                helperText="Capital ya contratado (si tienes)"
              />
            </div>
          </div>

          <button onClick={limpiarFormulario} className={styles.btnSecondary}>
            🔄 Limpiar formulario
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {calcularNecesidades ? (
            <>
              <div className={styles.resultCards}>
                <ResultCard
                  title="Capital Mínimo"
                  value={formatCurrency(calcularNecesidades.capitalMinimo)}
                  variant="warning"
                  icon="⚠️"
                  description="Cubre deudas y gastos inmediatos"
                />
                <ResultCard
                  title="Capital Recomendado"
                  value={formatCurrency(calcularNecesidades.capitalRecomendado)}
                  variant="highlight"
                  icon="✅"
                  description="Protección completa para tu familia"
                />
                <ResultCard
                  title="Capital Óptimo"
                  value={formatCurrency(calcularNecesidades.capitalOptimo)}
                  variant="success"
                  icon="🌟"
                  description="Incluye margen para inflación"
                />
              </div>

              <div className={styles.desgloseSection}>
                <h3 className={styles.desgloseTitle}>📊 Desglose de Necesidades</h3>
                <div className={styles.desgloseGrid}>
                  <div className={styles.desgloseItem}>
                    <span className={styles.desgloseLabel}>Sustitución de ingresos</span>
                    <span className={styles.desgloseValue}>{formatCurrency(calcularNecesidades.desglose.sustitucionIngresos)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span className={styles.desgloseLabel}>Hipoteca pendiente</span>
                    <span className={styles.desgloseValue}>{formatCurrency(calcularNecesidades.desglose.hipoteca)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span className={styles.desgloseLabel}>Otras deudas</span>
                    <span className={styles.desgloseValue}>{formatCurrency(calcularNecesidades.desglose.deudas - calcularNecesidades.desglose.hipoteca)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span className={styles.desgloseLabel}>Educación hijos</span>
                    <span className={styles.desgloseValue}>{formatCurrency(calcularNecesidades.desglose.educacionHijos)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span className={styles.desgloseLabel}>Gastos funerarios</span>
                    <span className={styles.desgloseValue}>{formatCurrency(calcularNecesidades.desglose.gastosFunerarios)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span className={styles.desgloseLabel}>Fondo de emergencia</span>
                    <span className={styles.desgloseValue}>{formatCurrency(calcularNecesidades.desglose.colchonEmergencia)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.recomendacion}>
                <h3>💡 Recomendación</h3>
                <p>
                  {calcularNecesidades.capitalRecomendado === 0 ? (
                    'Con tus recursos actuales y seguro existente, ya tienes una cobertura adecuada. Revisa periódicamente si cambia tu situación.'
                  ) : calcularNecesidades.capitalRecomendado < 50000 ? (
                    'Tu necesidad de seguro es moderada. Un seguro de vida temporal sería una opción económica y eficaz.'
                  ) : calcularNecesidades.capitalRecomendado < 200000 ? (
                    'Te recomendamos un seguro de vida temporal renovable. Compara ofertas de varias aseguradoras.'
                  ) : (
                    'Tienes necesidades significativas de protección. Considera consultar con un asesor de seguros para encontrar la mejor combinación de coberturas.'
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🛡️</span>
              <h3>Calcula tu protección</h3>
              <p>Introduce tu edad e ingresos para ver cuánto seguro de vida necesitas</p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-seguro-vida"
        collapsible={true}
      />

      <LastUpdated
        date="2026-02-02"
        changelog={[
          "Migrado disclaimer antiguo a DisclaimerCard para consistencia visual",
          "Añadido componente LastUpdated con historial de cambios",
          "Mejorada accesibilidad con ARIA labels en componentes interactivos"
        ]}
      />

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres saber más sobre seguros de vida?"
        subtitle="Conceptos clave, tipos de seguros y criterios para elegir la mejor protección"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Por qué necesitas un seguro de vida?</h2>
          <p className={styles.introParagraph}>
            El seguro de vida no es para ti, es para quienes dependen de ti. Si mañana no estuvieras,
            ¿podría tu familia mantener su nivel de vida, pagar la hipoteca y costear la educación de tus hijos?
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🏠 Proteger la vivienda</h4>
              <p>
                Si tienes hipoteca, el banco exige un seguro de vida vinculado. Pero ojo: ese seguro solo
                cubre el préstamo, no las necesidades de tu familia.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>👨‍👩‍👧 Sustituir ingresos</h4>
              <p>
                El objetivo principal es reemplazar tus ingresos durante los años que tu familia los necesitaría
                hasta que puedan ser económicamente independientes.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎓 Educación de los hijos</h4>
              <p>
                Desde guardería hasta universidad, el coste total de educar un hijo puede superar los 100.000€.
                Un seguro de vida garantiza que no tendrán que renunciar a su formación.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💳 Cancelar deudas</h4>
              <p>
                Hipoteca, préstamo del coche, tarjetas de crédito... Las deudas no desaparecen al fallecer.
                El seguro evita que tu familia herede una carga financiera.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de Seguro de Vida</h2>

          <div className={styles.tiposGrid}>
            <div className={styles.tipoCard}>
              <h4>⏱️ Seguro Temporal (Riesgo)</h4>
              <p><strong>Cómo funciona:</strong> Pagas una prima anual y estás cubierto durante un período (10, 20, 30 años).</p>
              <p><strong>Ventaja:</strong> Es el más económico. Ideal si tu necesidad de protección disminuye con el tiempo.</p>
              <p><strong>Ejemplo:</strong> Persona de 35 años con hijos pequeños contrata 200.000€ a 20 años hasta que sean adultos.</p>
            </div>

            <div className={styles.tipoCard}>
              <h4>♾️ Seguro de Vida Entera</h4>
              <p><strong>Cómo funciona:</strong> Cobertura vitalicia. La prima es fija y acumula un valor de rescate.</p>
              <p><strong>Ventaja:</strong> Garantiza el pago siempre que fallezcas, no solo en un período.</p>
              <p><strong>Desventaja:</strong> Primas mucho más altas que el temporal.</p>
            </div>

            <div className={styles.tipoCard}>
              <h4>🏦 Seguro Vida-Ahorro</h4>
              <p><strong>Cómo funciona:</strong> Combina protección con un componente de inversión.</p>
              <p><strong>Tipos:</strong> Unit-linked, PIAS, PPA.</p>
              <p><strong>Consideración:</strong> Evalúa por separado el seguro y la inversión. A veces es mejor contratarlos por separado.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Métodos de Cálculo del Capital</h2>

          <div className={styles.metodosGrid}>
            <div className={styles.metodoCard}>
              <h4>📐 Regla del Múltiplo de Ingresos</h4>
              <p>Capital = Ingresos anuales × 10</p>
              <p className={styles.metodoNota}>Simple pero impreciso. No considera deudas ni situación familiar.</p>
            </div>

            <div className={styles.metodoCard}>
              <h4>📊 Método DINK (Dual Income No Kids)</h4>
              <p>Sustituye los ingresos necesarios durante X años ajustando por aportación del cónyuge.</p>
              <p className={styles.metodoNota}>Esta calculadora usa una versión mejorada de este método.</p>
            </div>

            <div className={styles.metodoCard}>
              <h4>🎯 Análisis de Necesidades</h4>
              <p>Suma: Deudas + Educación hijos + Sustitución ingresos + Gastos finales - Recursos disponibles</p>
              <p className={styles.metodoNota}>El método más preciso. Es el que usamos aquí.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Factores que Afectan a la Prima</h2>

          <div className={styles.factoresGrid}>
            <div className={styles.factorItem}>
              <span className={styles.factorIcon}>🎂</span>
              <div>
                <strong>Edad</strong>
                <p>A mayor edad, mayor prima. Cada año que esperes, más caro será.</p>
              </div>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorIcon}>🚬</span>
              <div>
                <strong>Tabaquismo</strong>
                <p>Fumadores pagan entre 50% y 100% más que no fumadores.</p>
              </div>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorIcon}>⚕️</span>
              <div>
                <strong>Estado de salud</strong>
                <p>Enfermedades preexistentes pueden aumentar la prima o causar exclusiones.</p>
              </div>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorIcon}>👷</span>
              <div>
                <strong>Profesión</strong>
                <p>Trabajos de riesgo (construcción, minería, pilotos) pagan más.</p>
              </div>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorIcon}>🏃</span>
              <div>
                <strong>Hobbies</strong>
                <p>Deportes extremos, buceo o paracaidismo pueden incrementar la prima.</p>
              </div>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorIcon}>⏳</span>
              <div>
                <strong>Duración</strong>
                <p>A mayor plazo de cobertura, mayor prima anual.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>¿Necesito seguro de vida si no tengo hijos?</h4>
              <p>
                Depende. Si tienes hipoteca compartida con tu pareja o si tu cónyuge depende económicamente de ti, sí.
                Si no tienes dependientes ni deudas compartidas, probablemente no es prioritario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo tener varios seguros de vida?</h4>
              <p>
                Sí, y a veces es recomendable. Puedes tener uno vinculado a la hipoteca y otro adicional
                para proteger a tu familia. Ambos pagarían en caso de fallecimiento.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si dejo de pagar las primas?</h4>
              <p>
                En seguros temporales, simplemente pierdes la cobertura. En seguros con ahorro,
                puedes tener derecho a un valor de rescate o a reducir el capital asegurado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto cuesta un seguro de vida?</h4>
              <p>
                Orientativamente: una persona de 35 años, no fumadora, puede asegurar 200.000€ a 20 años
                por unos 15-25€/mes. A los 45 años, la misma cobertura puede costar 30-50€/mes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El seguro de vida desgrava en la declaración?</h4>
              <p>
                El seguro de vida puro no desgrava. Sin embargo, los seguros de vida vinculados a
                planes de pensiones o PIAS sí pueden tener ventajas fiscales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo es mejor momento para contratarlo?</h4>
              <p>
                Cuanto antes, mejor. Las primas se calculan según tu edad y estado de salud al contratar.
                Si desarrollas una enfermedad después, no afectará a tu seguro existente.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-seguro-vida')} />
      <Footer appName="calculadora-seguro-vida" />
    </div>
  );
}
