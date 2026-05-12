'use client';

import { useState } from 'react';
import styles from './EstimadorFondoEmergencia.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type SituacionLaboral = 'estable' | 'moderada' | 'inestable' | 'autonomo';
type CargasFamiliares = 'sin_cargas' | 'pareja' | 'hijos' | 'dependientes';

interface Resultado {
  mesesRecomendados: number;
  fondoMinimo: number;
  fondoRecomendado: number;
  fondoMaximo: number;
  nivelActual: 'insuficiente' | 'minimo' | 'adecuado' | 'excelente';
  porcentajeCubierto: number;
}

export default function CalculadoraFondoEmergenciaPage() {
  const [gastosMensuales, setGastosMensuales] = useState('');
  const [ahorroActual, setAhorroActual] = useState('');
  const [situacionLaboral, setSituacionLaboral] = useState<SituacionLaboral>('estable');
  const [cargasFamiliares, setCargasFamiliares] = useState<CargasFamiliares>('sin_cargas');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcularFondo = () => {
    const gastos = parseSpanishNumber(gastosMensuales);
    const ahorro = parseSpanishNumber(ahorroActual);

    if (gastos <= 0) return;

    // Calcular meses recomendados según situación
    let mesesBase = 3;

    // Ajuste por situación laboral
    switch (situacionLaboral) {
      case 'estable':
        mesesBase = 3;
        break;
      case 'moderada':
        mesesBase = 6;
        break;
      case 'inestable':
        mesesBase = 9;
        break;
      case 'autonomo':
        mesesBase = 9;
        break;
    }

    // Ajuste por cargas familiares
    switch (cargasFamiliares) {
      case 'sin_cargas':
        // Sin cambio
        break;
      case 'pareja':
        mesesBase += 1;
        break;
      case 'hijos':
        mesesBase += 2;
        break;
      case 'dependientes':
        mesesBase += 3;
        break;
    }

    const mesesRecomendados = mesesBase;
    const fondoMinimo = gastos * 3;
    const fondoRecomendado = gastos * mesesRecomendados;
    const fondoMaximo = gastos * 12;

    // Evaluar nivel actual
    let nivelActual: Resultado['nivelActual'];
    const porcentajeCubierto = (ahorro / fondoRecomendado) * 100;

    if (ahorro < fondoMinimo) {
      nivelActual = 'insuficiente';
    } else if (ahorro < fondoRecomendado) {
      nivelActual = 'minimo';
    } else if (ahorro < fondoMaximo) {
      nivelActual = 'adecuado';
    } else {
      nivelActual = 'excelente';
    }

    setResultado({
      mesesRecomendados,
      fondoMinimo,
      fondoRecomendado,
      fondoMaximo,
      nivelActual,
      porcentajeCubierto: Math.min(porcentajeCubierto, 100),
    });
  };

  const getNivelColor = (nivel: Resultado['nivelActual']) => {
    switch (nivel) {
      case 'insuficiente':
        return 'warning';
      case 'minimo':
        return 'info';
      case 'adecuado':
        return 'success';
      case 'excelente':
        return 'highlight';
    }
  };

  const getNivelTexto = (nivel: Resultado['nivelActual']) => {
    switch (nivel) {
      case 'insuficiente':
        return 'Por debajo del mínimo (3 meses)';
      case 'minimo':
        return 'Cobertura mínima alcanzada';
      case 'adecuado':
        return 'Cobertura adecuada';
      case 'excelente':
        return 'Cobertura amplia — el exceso puede invertirse si lo deseas';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estimador Fondo de Emergencia</h1>
        <p className={styles.subtitle}>
          Calcula cuánto dinero necesitas ahorrar como colchón de seguridad
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu situación</h2>

          <NumberInput
            value={gastosMensuales}
            onChange={setGastosMensuales}
            label="Gastos mensuales totales"
            placeholder="2000"
            helperText="Incluye alquiler/hipoteca, comida, suministros, transporte..."
            min={0}
          />

          <NumberInput
            value={ahorroActual}
            onChange={setAhorroActual}
            label="Ahorro actual disponible"
            placeholder="5000"
            helperText="Dinero que tienes ahorrado ahora mismo"
            min={0}
          />

          <div className={styles.selectGroup}>
            <label className={styles.label}>Situación laboral</label>
            <select
              value={situacionLaboral}
              onChange={(e) => setSituacionLaboral(e.target.value as SituacionLaboral)}
              className={styles.select}
            >
              <option value="estable">Empleo estable (funcionario, indefinido antiguo)</option>
              <option value="moderada">Moderadamente estable (indefinido reciente)</option>
              <option value="inestable">Inestable (temporal, sector volátil)</option>
              <option value="autonomo">Autónomo / Freelance</option>
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Cargas familiares</label>
            <select
              value={cargasFamiliares}
              onChange={(e) => setCargasFamiliares(e.target.value as CargasFamiliares)}
              className={styles.select}
            >
              <option value="sin_cargas">Sin cargas (vivo solo/a)</option>
              <option value="pareja">Con pareja (sin hijos)</option>
              <option value="hijos">Con hijos</option>
              <option value="dependientes">Con personas dependientes a cargo</option>
            </select>
          </div>

          <button onClick={calcularFondo} className={styles.btnPrimary}>
            Calcular fondo necesario
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <>
              <ResultCard
                title="Tu nivel actual"
                value={getNivelTexto(resultado.nivelActual)}
                variant={getNivelColor(resultado.nivelActual)}
                icon={resultado.nivelActual === 'excelente' ? '🏆' : resultado.nivelActual === 'adecuado' ? '✅' : resultado.nivelActual === 'minimo' ? '⚠️' : '🚨'}
              />

              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Progreso hacia tu objetivo</span>
                  <span>{resultado.porcentajeCubierto.toFixed(0)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${resultado.porcentajeCubierto}%` }}
                  />
                </div>
              </div>

              <ResultCard
                title="Fondo recomendado"
                value={formatCurrency(resultado.fondoRecomendado)}
                variant="highlight"
                icon="🎯"
                description={`${resultado.mesesRecomendados} meses de gastos cubiertos`}
              />

              <div className={styles.rangoFondos}>
                <div className={styles.rangoItem}>
                  <span className={styles.rangoLabel}>Mínimo (3 meses)</span>
                  <span className={styles.rangoValor}>{formatCurrency(resultado.fondoMinimo)}</span>
                </div>
                <div className={styles.rangoItem}>
                  <span className={styles.rangoLabel}>Máximo (12 meses)</span>
                  <span className={styles.rangoValor}>{formatCurrency(resultado.fondoMaximo)}</span>
                </div>
              </div>

              {resultado.nivelActual === 'insuficiente' && (
                <div className={styles.consejoCard}>
                  <h4>Consejo</h4>
                  <p>
                    Te faltan <strong>{formatCurrency(resultado.fondoRecomendado - parseSpanishNumber(ahorroActual))}</strong> para
                    alcanzar tu objetivo. Considera apartar el porcentaje de ingresos que te resulte sostenible —idealmente un 10-20%, pero cualquier cantidad constante construye el colchón con el tiempo.
                  </p>
                </div>
              )}

              {resultado.nivelActual === 'excelente' && (
                <div className={styles.consejoCardSuccess}>
                  <h4>Excelente situación</h4>
                  <p>
                    Tienes más de 12 meses cubiertos. El exceso sobre {formatCurrency(resultado.fondoMaximo)} podrías
                    invertirlo para que no pierda valor por la inflación.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-fondo-emergencia"
        collapsible={false}
      />


      <EducationalSection
        title="¿Quieres aprender más sobre el fondo de emergencia?"
        subtitle="Descubre por qué es el primer paso de cualquier plan financiero"
        icon="📚"
      >
        {/* Tabla Comparativa */}
        <section className={styles.eduComparativa}>
          <h2>Comparativa de productos para guardar el fondo de emergencia</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Liquidez</th>
                  <th>Rentabilidad</th>
                  <th>Ventaja</th>
                  <th>Recomendado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cuenta corriente</strong></td>
                  <td>Inmediata</td>
                  <td>0-0,1%</td>
                  <td>Máxima disponibilidad</td>
                  <td>✅ Parcial</td>
                </tr>
                <tr>
                  <td><strong>Cuenta de ahorro</strong></td>
                  <td>24-48h</td>
                  <td>0,5-3%</td>
                  <td>Rentabilidad + liquidez</td>
                  <td>✅ Sí</td>
                </tr>
                <tr>
                  <td><strong>Depósito a plazo</strong></td>
                  <td>Al vencimiento</td>
                  <td>2-4%</td>
                  <td>Mayor rentabilidad fija</td>
                  <td>⚠️ Parcial</td>
                </tr>
                <tr>
                  <td><strong>Fondo monetario</strong></td>
                  <td>1-2 días</td>
                  <td>2,5-3,5%</td>
                  <td>Diversificado y líquido</td>
                  <td>✅ Sí</td>
                </tr>
                <tr>
                  <td><strong>Letras del Tesoro</strong></td>
                  <td>Al vencimiento</td>
                  <td>2,5-3,5%</td>
                  <td>Sin riesgo de entidad</td>
                  <td>⚠️ Parcial</td>
                </tr>
                <tr>
                  <td><strong>Bolsa / fondos renta variable</strong></td>
                  <td>Variable</td>
                  <td>Variable</td>
                  <td>Alta rentabilidad potencial</td>
                  <td>❌ No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduEscenarios}>
          <h2>¿Cuánto necesitas según tu situación?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏛️</span>
                <strong>Funcionario o indefinido antiguo</strong>
              </div>
              <p className={styles.escenarioExample}>Estabilidad alta, sin cargas. 3 meses suele ser suficiente como colchón para imprevistos.</p>
              <span className={styles.escenarioTip}>Fondo: 3 meses de gastos</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <strong>Autónomo / freelance</strong>
              </div>
              <p className={styles.escenarioExample}>Ingresos variables. El colchón recomendado es mayor que para empleados (idealmente 9-12 meses). Construirlo lleva tiempo: empieza por un mínimo de 3 meses y amplía gradualmente.</p>
              <span className={styles.escenarioTip}>Fondo: 9-12 meses de gastos</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <strong>Familia con hijos pequeños</strong>
              </div>
              <p className={styles.escenarioExample}>Gastos imprevistos frecuentes (médicos, reparaciones). Las cargas familiares exigen mayor cobertura.</p>
              <span className={styles.escenarioTip}>Fondo: 6-9 meses de gastos</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📋</span>
                <strong>Contrato temporal o por obra</strong>
              </div>
              <p className={styles.escenarioExample}>Alta rotación laboral. El paro puede durar meses y los contratos terminar de golpe.</p>
              <span className={styles.escenarioTip}>Fondo: 6-9 meses de gastos</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💑</span>
                <strong>Pareja con doble ingreso</strong>
              </div>
              <p className={styles.escenarioExample}>El segundo ingreso actúa como amortiguador. Podéis dividir responsabilidad del fondo.</p>
              <span className={styles.escenarioTip}>Fondo: 4-6 meses de gastos</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📈</span>
                <strong>Inversor con activos líquidos</strong>
              </div>
              <p className={styles.escenarioExample}>Si tienes fondos monetarios o ETFs que puedes vender en días, el fondo de emergencia puede ser menor.</p>
              <span className={styles.escenarioTip}>Fondo: 3-4 meses de gastos</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre el fondo de emergencia</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿El fondo de emergencia es lo mismo que el ahorro general?</h4>
              <p>No. El fondo de emergencia es una reserva específica, separada e intocable salvo emergencias reales. Tu ahorro general puede destinarse a objetivos (vacaciones, coche, casa). Mezclarlos es un error común.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo invertir mi fondo de emergencia en bolsa para que rinda más?</h4>
              <p>No es recomendable. Si el mercado cae un 30% justo cuando necesitas el dinero, tu "fondo" se ha reducido drásticamente. El fondo de emergencia debe estar en productos seguros y líquidos aunque rindan menos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si tengo que usar parte del fondo?</h4>
              <p>Es exactamente para lo que sirve. Úsalo sin culpa. Luego, como prioridad número 1, reconstitúyelo antes de volver a otros objetivos de ahorro o inversión.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Los meses se calculan sobre gastos totales o solo los básicos?</h4>
              <p>Sobre los gastos totales mensuales reales: alquiler/hipoteca, comida, suministros, transporte, seguros y cualquier gasto recurrente. No reduzcas artificialmente la cifra; en una emergencia necesitas vivir normalmente.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El seguro de desempleo puede sustituir al fondo de emergencia?</h4>
              <p>Parcialmente. El paro tarda semanas en activarse, no cubre el 100% del salario y tiene duración limitada. Además, hay muchas emergencias que no son pérdida de empleo (averías, salud). El fondo es complementario, no sustituto.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo tener fondo de emergencia si tengo deudas con interés alto?</h4>
              <p>Construye primero un fondo mínimo de 1 mes (seguridad básica), luego agresivamente cancela deudas de alto interés (tarjetas, préstamos), y finalmente completa el fondo. Sin ninguna reserva, cualquier imprevisto te obligaría a endeudarte más.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La inflación reduce el valor de mi fondo?</h4>
              <p>En periodos de inflación alta, el poder adquisitivo del dinero quieto se reduce. Para el fondo de emergencia esto es asumible: priorizar liquidez es legítimo. Si quieres mitigarlo, una cuenta remunerada o fondo monetario ofrecen rendimiento sin perder acceso.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo puedo considerar que el fondo está "completo"?</h4>
              <p className={styles.faqTip}>Cuando tienes el número de meses recomendado para tu situación completamente cubierto. A partir de ahí, el exceso sobre 12 meses puede canalizarse hacia inversión. Recuerda revisar el fondo si cambia tu nivel de gastos o situación laboral.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.eduGuia}>
          <h2>Cómo construir tu fondo de emergencia paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula tus gastos mensuales reales</strong>
                <p>Suma todos tus gastos recurrentes: alquiler/hipoteca, comida, transporte, suministros, seguros y cualquier gasto fijo. Esta calculadora te ayuda a determinarlo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Determina cuántos meses necesitas</strong>
                <p>Según tu estabilidad laboral y cargas familiares: 3 meses (empleo estable, sin cargas), 6 meses (situación moderada), 9-12 meses (autónomo, temporal, cargas altas).</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Abre una cuenta separada</strong>
                <p>Crea una cuenta específica solo para el fondo de emergencia. Separarla visualmente del dinero del día a día reduce la tentación de gastarlo en no-emergencias.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Automatiza el ahorro mensual</strong>
                <p>Configura una transferencia automática el día de cobro (o justo después). Empieza con el 10-20% de tus ingresos o lo que puedas. La constancia es más importante que la cantidad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Elige el producto adecuado</strong>
                <p>Cuenta ahorro remunerada o fondo monetario. Que tenga liquidez en 24-48h y una rentabilidad que mitigue la inflación. Evita depósitos a largo plazo o inversiones en bolsa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Revisa y ajusta anualmente</strong>
                <p>Si tus gastos suben o cambia tu situación laboral, recalcula. El fondo debe crecer al ritmo de tu estilo de vida.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Invierte el exceso una vez completo</strong>
                <p>Con el fondo completo, el dinero adicional puede destinarse a inversión (ETFs, fondos indexados, plan de pensiones). No acumules más de 12 meses sin invertir el exceso.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.eduTips}>
          <h2>Tips para mantener tu fondo de emergencia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Reconstruye después de usarlo</strong>
              <p>Si usas el fondo, reconstitúyelo antes de cualquier otro objetivo financiero.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Revisa anualmente</strong>
              <p>Tus gastos cambian. Si te mudas o cambias de trabajo, recalcula cuánto necesitas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔒</span>
              <strong>No lo toques salvo emergencias reales</strong>
              <p>Las vacaciones o una TV nueva no son emergencias. Define tus criterios antes de necesitarlo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💡</span>
              <strong>Busca rentabilidad sin perder liquidez</strong>
              <p>Cuentas ahorro remuneradas o fondos monetarios ofrecen rendimiento sin sacrificar acceso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Empieza aunque sea pequeño</strong>
              <p>100 € al mes durante 20 meses = 2.000 €. El hábito importa más que la cifra inicial.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛡️</span>
              <strong>Es seguro de tranquilidad, no inversión</strong>
              <p>Su función es darte paz mental y protegerte. No lo optimices en exceso buscando más rentabilidad.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores comunes que debes evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Invertir el fondo en bolsa o activos de riesgo (puede caer justo cuando más lo necesitas)</li>
            <li>Mezclar el fondo de emergencia con el ahorro para vacaciones u objetivos</li>
            <li>No reconstituirlo después de una emergencia (quedas desprotegido)</li>
            <li>Considerar el límite de la tarjeta de crédito como fondo de emergencia</li>
            <li>No ajustar el fondo cuando cambian tus gastos o situación laboral</li>
            <li>Usar el fondo para compras planificadas aunque sean necesarias (eso es otra categoría)</li>
            <li>No tener ningún colchón por priorizar cancelar todas las deudas primero</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-fondo-emergencia')} />
      <ShareCard appName="estimador-fondo-emergencia" />
      <Footer appName="estimador-fondo-emergencia" />
    </div>
  );
}
