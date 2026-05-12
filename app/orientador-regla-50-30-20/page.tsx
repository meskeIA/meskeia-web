'use client';

import { useState } from 'react';
import styles from './OrientadorRegla503020.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, parseSpanishNumber, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Distribucion {
  necesidades: number;
  deseos: number;
  ahorro: number;
}

interface Resultado {
  ingresoNeto: number;
  ideal: Distribucion;
  real: Distribucion;
  diferencias: Distribucion;
  balance: 'equilibrado' | 'desequilibrado' | 'excelente';
  consejos: string[];
}

export default function CalculadoraRegla503020Page() {
  const [ingresoMensual, setIngresoMensual] = useState('');
  const [gastoNecesidades, setGastoNecesidades] = useState('');
  const [gastoDeseos, setGastoDeseos] = useState('');
  const [gastoAhorro, setGastoAhorro] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcularDistribucion = () => {
    const ingreso = parseSpanishNumber(ingresoMensual);
    const necesidades = parseSpanishNumber(gastoNecesidades);
    const deseos = parseSpanishNumber(gastoDeseos);
    const ahorro = parseSpanishNumber(gastoAhorro);

    if (ingreso <= 0) return;

    const ideal: Distribucion = {
      necesidades: ingreso * 0.5,
      deseos: ingreso * 0.3,
      ahorro: ingreso * 0.2,
    };

    const real: Distribucion = {
      necesidades,
      deseos,
      ahorro,
    };

    const diferencias: Distribucion = {
      necesidades: real.necesidades - ideal.necesidades,
      deseos: real.deseos - ideal.deseos,
      ahorro: real.ahorro - ideal.ahorro,
    };

    // Generar consejos
    const consejos: string[] = [];

    if (diferencias.necesidades > ingreso * 0.1) {
      consejos.push('Tus gastos en necesidades superan el 50% del ingreso. En zonas con alquileres altos esto es habitual. Si puedes negociar suministros o transporte, ahí suele haber margen; el alquiler es más estructural y suele requerir cambios mayores.');
    }

    if (diferencias.deseos > ingreso * 0.05) {
      consejos.push("Gastas más del 30% de referencia en la categoría 'deseos'. Si lo notas estructural, revisar suscripciones puede ser un buen punto de entrada; si responde a decisiones conscientes que valoras, no hay nada que ajustar.");
    }

    if (diferencias.ahorro < 0) {
      consejos.push('Tu ahorro está por debajo del 20% de referencia. Cualquier porcentaje constante construye seguridad financiera con el tiempo; el 20% es un objetivo orientativo, no un mínimo necesario.');
    }

    if (diferencias.ahorro > ingreso * 0.1) {
      consejos.push('¡Excelente! Ahorras más del 30%. Considera invertir parte de ese excedente.');
    }

    const totalReal = real.necesidades + real.deseos + real.ahorro;
    if (totalReal > ingreso) {
      consejos.push(`Gastas ${formatCurrency(totalReal - ingreso)} más de lo que ingresas. Esto no es sostenible.`);
    }

    // Determinar balance
    let balance: Resultado['balance'];
    const desviacionTotal = Math.abs(diferencias.necesidades) + Math.abs(diferencias.deseos) + Math.abs(diferencias.ahorro);

    if (desviacionTotal < ingreso * 0.1 && diferencias.ahorro >= 0) {
      balance = 'excelente';
    } else if (desviacionTotal < ingreso * 0.25 && diferencias.ahorro >= -ingreso * 0.05) {
      balance = 'equilibrado';
    } else {
      balance = 'desequilibrado';
    }

    if (consejos.length === 0) {
      consejos.push('Tu distribución está muy cerca del ideal. ¡Sigue así!');
    }

    setResultado({
      ingresoNeto: ingreso,
      ideal,
      real,
      diferencias,
      balance,
      consejos,
    });
  };

  const getPorcentaje = (valor: number, total: number) => {
    if (total === 0) return 0;
    return (valor / total) * 100;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Orientador Regla 50/30/20</h1>
        <p className={styles.subtitle}>
          Una referencia popular para repartir tus ingresos: 50% necesidades, 30% deseos, 20% ahorro. Funciona como guía orientativa; muchos casos reales requieren adaptaciones.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tus ingresos y gastos</h2>

          <NumberInput
            value={ingresoMensual}
            onChange={setIngresoMensual}
            label="Ingreso neto mensual"
            placeholder="2500"
            helperText="Tu salario después de impuestos y deducciones"
            min={0}
          />

          <div className={styles.categoriaHeader}>
            <span className={styles.categoriaIcon}>🏠</span>
            <span>Necesidades (50%)</span>
          </div>
          <NumberInput
            value={gastoNecesidades}
            onChange={setGastoNecesidades}
            label="Gastos en necesidades"
            placeholder="1250"
            helperText="Alquiler, comida, transporte, suministros, seguros..."
            min={0}
          />

          <div className={styles.categoriaHeader}>
            <span className={styles.categoriaIcon}>🎉</span>
            <span>Deseos (30%)</span>
          </div>
          <NumberInput
            value={gastoDeseos}
            onChange={setGastoDeseos}
            label="Gastos en deseos"
            placeholder="750"
            helperText="Ocio, restaurantes, suscripciones, viajes, hobbies..."
            min={0}
          />

          <div className={styles.categoriaHeader}>
            <span className={styles.categoriaIcon}>💰</span>
            <span>Ahorro (20%)</span>
          </div>
          <NumberInput
            value={gastoAhorro}
            onChange={setGastoAhorro}
            label="Ahorro mensual"
            placeholder="500"
            helperText="Lo que ahorras o inviertes cada mes"
            min={0}
          />

          <button onClick={calcularDistribucion} className={styles.btnPrimary}>
            Analizar mi presupuesto
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <>
              <ResultCard
                title="Balance general"
                value={resultado.balance === 'excelente' ? 'Excelente' : resultado.balance === 'equilibrado' ? 'Equilibrado' : 'Desequilibrado'}
                variant={resultado.balance === 'excelente' ? 'success' : resultado.balance === 'equilibrado' ? 'info' : 'warning'}
                icon={resultado.balance === 'excelente' ? '🏆' : resultado.balance === 'equilibrado' ? '✅' : '⚠️'}
              />

              <div className={styles.comparativaGrid}>
                <div className={styles.comparativaHeader}>
                  <span></span>
                  <span>Ideal</span>
                  <span>Real</span>
                  <span>Diferencia</span>
                </div>

                <div className={styles.comparativaRow}>
                  <span className={styles.comparativaLabel}>
                    <span className={styles.dot} style={{ background: '#2E86AB' }}></span>
                    Necesidades (50%)
                  </span>
                  <span>{formatCurrency(resultado.ideal.necesidades)}</span>
                  <span>{formatCurrency(resultado.real.necesidades)}</span>
                  <span className={resultado.diferencias.necesidades > 0 ? styles.negative : styles.positive}>
                    {resultado.diferencias.necesidades > 0 ? '+' : ''}{formatCurrency(resultado.diferencias.necesidades)}
                  </span>
                </div>

                <div className={styles.comparativaRow}>
                  <span className={styles.comparativaLabel}>
                    <span className={styles.dot} style={{ background: '#48A9A6' }}></span>
                    Deseos (30%)
                  </span>
                  <span>{formatCurrency(resultado.ideal.deseos)}</span>
                  <span>{formatCurrency(resultado.real.deseos)}</span>
                  <span className={resultado.diferencias.deseos > 0 ? styles.negative : styles.positive}>
                    {resultado.diferencias.deseos > 0 ? '+' : ''}{formatCurrency(resultado.diferencias.deseos)}
                  </span>
                </div>

                <div className={styles.comparativaRow}>
                  <span className={styles.comparativaLabel}>
                    <span className={styles.dot} style={{ background: '#7FB3D3' }}></span>
                    Ahorro (20%)
                  </span>
                  <span>{formatCurrency(resultado.ideal.ahorro)}</span>
                  <span>{formatCurrency(resultado.real.ahorro)}</span>
                  <span className={resultado.diferencias.ahorro < 0 ? styles.negative : styles.positive}>
                    {resultado.diferencias.ahorro > 0 ? '+' : ''}{formatCurrency(resultado.diferencias.ahorro)}
                  </span>
                </div>
              </div>

              <div className={styles.barrasContainer}>
                <div className={styles.barraGroup}>
                  <span className={styles.barraLabel}>Tu distribución real</span>
                  <div className={styles.barraStacked}>
                    <div
                      className={styles.barraNecesidades}
                      style={{ width: `${getPorcentaje(resultado.real.necesidades, resultado.ingresoNeto)}%` }}
                    >
                      {formatNumber(getPorcentaje(resultado.real.necesidades, resultado.ingresoNeto), 0)}%
                    </div>
                    <div
                      className={styles.barraDeseos}
                      style={{ width: `${getPorcentaje(resultado.real.deseos, resultado.ingresoNeto)}%` }}
                    >
                      {formatNumber(getPorcentaje(resultado.real.deseos, resultado.ingresoNeto), 0)}%
                    </div>
                    <div
                      className={styles.barraAhorro}
                      style={{ width: `${getPorcentaje(resultado.real.ahorro, resultado.ingresoNeto)}%` }}
                    >
                      {formatNumber(getPorcentaje(resultado.real.ahorro, resultado.ingresoNeto), 0)}%
                    </div>
                  </div>
                </div>

                <div className={styles.barraGroup}>
                  <span className={styles.barraLabel}>Distribución ideal</span>
                  <div className={styles.barraStacked}>
                    <div className={styles.barraNecesidades} style={{ width: '50%' }}>50%</div>
                    <div className={styles.barraDeseos} style={{ width: '30%' }}>30%</div>
                    <div className={styles.barraAhorro} style={{ width: '20%' }}>20%</div>
                  </div>
                </div>
              </div>

              <div className={styles.consejosCard}>
                <h4>Consejos personalizados</h4>
                <ul>
                  {resultado.consejos.map((consejo, index) => (
                    <li key={index}>{consejo}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="orientador-regla-50-30-20"
        collapsible={false}
      />

      

      <EducationalSection
        title="¿Quieres aprender más sobre la regla 50/30/20?"
        subtitle="Descubre cómo aplicar este método de presupuesto popularizado por Elizabeth Warren"
        icon="📚"
      >
        {/* Tabla Comparativa */}
        <section className={styles.eduComparativa}>
          <h2>Comparativa de métodos de presupuesto personal</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Para quién</th>
                  <th>Dificultad</th>
                  <th>Control</th>
                  <th>Recomendado si...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>50/30/20 clásico</strong></td>
                  <td>Ingresos medios</td>
                  <td>Fácil</td>
                  <td>Equilibrado</td>
                  <td>Empiezas a presupuestar</td>
                </tr>
                <tr>
                  <td><strong>70/20/10</strong></td>
                  <td>Ingresos bajos</td>
                  <td>Muy fácil</td>
                  <td>Básico</td>
                  <td>Gastos necesarios muy altos</td>
                </tr>
                <tr>
                  <td><strong>60/20/20</strong></td>
                  <td>Ciudad cara (Madrid/BCN)</td>
                  <td>Fácil</td>
                  <td>Moderado</td>
                  <td>Alquiler consume más del 50%</td>
                </tr>
                <tr>
                  <td><strong>40/30/30</strong></td>
                  <td>Alta renta</td>
                  <td>Moderado</td>
                  <td>Alto ahorro</td>
                  <td>Quieres jubilarte anticipado</td>
                </tr>
                <tr>
                  <td><strong>Págate primero</strong></td>
                  <td>Ahorradores disciplinados</td>
                  <td>Automático</td>
                  <td>Alto</td>
                  <td>Prefieres automatizar todo</td>
                </tr>
                <tr>
                  <td><strong>Presupuesto base cero</strong></td>
                  <td>Planificadores detallistas</td>
                  <td>Complejo</td>
                  <td>Máximo</td>
                  <td>Quieres control total de cada euro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduEscenarios}>
          <h2>La regla 50/30/20 aplicada a diferentes perfiles</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏙️</span>
                <strong>Mileurista en Madrid</strong>
              </div>
              <p className={styles.escenarioExample}>Con 1.000 € netos, el alquiler mínimo ya supera el 50%. Necesita adaptar la regla: 70% necesidades, 15% deseos, 15% ahorro como objetivo realista.</p>
              <span className={styles.escenarioTip}>Adaptar: 70/15/15</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💑</span>
                <strong>Pareja con hipoteca compartida</strong>
              </div>
              <p className={styles.escenarioExample}>Ingresos combinados de 4.000 €. La hipoteca compartida reduce el % de necesidades. Pueden aspirar a la distribución estándar o incluso 40/30/30.</p>
              <span className={styles.escenarioTip}>Regla: 50/30/20 o mejor</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <strong>Joven sin cargas (25-30 años)</strong>
              </div>
              <p className={styles.escenarioExample}>Viviendo en casa familiar o con compañeros, los gastos fijos son menores. Si te interesa adelantarte en ahorro o inversión, es un momento favorable; si prefieres priorizar otras experiencias en esta etapa, también es una decisión legítima.</p>
              <span className={styles.escenarioTip}>Objetivo: 40/20/40</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧‍👦</span>
                <strong>Familia con hijos en edad escolar</strong>
              </div>
              <p className={styles.escenarioExample}>Colegio, actividades extraescolares y gastos médicos aumentan las &quot;necesidades&quot;. El 50% puede quedarse corto. Reclasificar educación como necesidad prioritaria.</p>
              <span className={styles.escenarioTip}>Adaptar: 60/20/20</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <strong>Autónomo con ingresos variables</strong>
              </div>
              <p className={styles.escenarioExample}>Aplicar la regla sobre el ingreso mínimo garantizado (peor mes). Los meses buenos, todo el exceso va a ahorro/fondo de emergencia.</p>
              <span className={styles.escenarioTip}>Base: ingreso mínimo</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧓</span>
                <strong>Jubilado con pensión</strong>
              </div>
              <p className={styles.escenarioExample}>Hipoteca pagada, hijos independientes. Necesidades reducidas al 30-35%. Mayor margen para deseos (viajes, cultura) y menos necesidad de ahorro agresivo.</p>
              <span className={styles.escenarioTip}>Adaptar: 35/45/20</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre la regla 50/30/20</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿El 50% se calcula sobre ingresos brutos o netos?</h4>
              <p>Siempre sobre ingresos NETOS (después de IRPF, Seguridad Social y cualquier deducción). Es el dinero que realmente llega a tu cuenta. Usar el bruto distorsionaría la distribución real.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El gym es necesidad o deseo?</h4>
              <p>Depende de tu perspectiva. Si lo usas regularmente para salud, puede considerarse necesidad. Si es un capricho que podrías abandonar, es deseo. Lo importante es ser honesto con uno mismo, no optimizar las categorías para que cuadren.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El pago de deudas va en necesidades o en ahorro?</h4>
              <p>Las cuotas mínimas obligatorias (hipoteca, préstamo personal) van en necesidades. Los pagos extra para cancelar deuda más rápido van en ahorro, ya que reducen tu pasivo futuro y es como invertir en ti mismo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo adaptar los porcentajes a mi situación?</h4>
              <p>Sí y es completamente normal. La regla 50/30/20 es un marco orientativo, no una ley. Lo crítico es mantener el ahorro como prioridad. Si necesitas 60% en necesidades, reduce deseos antes que ahorro.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo aplico la regla si tengo pareja?</h4>
              <p>Dos enfoques: (1) Presupuesto conjunto: sumar ambos ingresos y aplicar la regla al total, con una cuenta común. (2) Presupuesto individual: cada uno aplica la regla a sus ingresos y acuerdan cómo cubrir gastos compartidos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué hago si me sobra dinero al final del mes?</h4>
              <p>Si ya cubres el 20% de ahorro, el exceso puede ir a un objetivo específico (vacaciones, fondo de emergencia, inversión extra). Si habitualmente te sobra mucho, replantea si estás siendo demasiado conservador en alguna categoría.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El plan de pensiones privado va en el 20% de ahorro?</h4>
              <p>Sí. Cualquier forma de ahorro para el futuro entra en ese 20%: fondo de emergencia, plan de pensiones, inversiones en ETFs, fondos indexados o ahorro para objetivos a largo plazo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo empezar si nunca he llevado un presupuesto?</h4>
              <p className={styles.faqTip}>El primer mes, solo registra. No cambies nada, solo anota tus gastos en las tres categorías. El segundo mes, ya tienes datos reales para ajustar. La regla 50/30/20 es perfecta para empezar por su simplicidad.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.eduGuia}>
          <h2>Cómo implementar la regla 50/30/20 en tu vida</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula tu ingreso neto mensual real</strong>
                <p>Suma todos tus ingresos después de impuestos. Si tienes ingresos variables, usa la media de los últimos 6 meses o el mes más bajo como base conservadora.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Registra todos tus gastos durante un mes</strong>
                <p>Sin cambiar nada todavía. Apunta cada gasto y clasifícalo: necesidades (gastos fijos esenciales: vivienda, alimentación, transporte), deseos (gastos que mejoran tu calidad de vida sin ser estrictamente imprescindibles) o ahorro/inversión. La línea entre &apos;necesidad&apos; y &apos;deseo&apos; la dibujas tú según tu situación y valores.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Compara tu distribución real con la ideal</strong>
                <p>Usa esta calculadora para ver dónde estás. Identifica qué categoría está más desequilibrada y cuánto tendrías que ajustar para acercarte al 50/30/20.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Automatiza el ahorro el día de cobro</strong>
                <p>Configura una transferencia automática al banco/broker de inversión el mismo día que cobras. &quot;Págate primero a ti mismo&quot; es el secreto de quienes ahorran consistentemente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Revisa y ajusta mensualmente</strong>
                <p>Los primeros 3 meses revisa semanalmente. Después mensualmente. Identifica gastos en &quot;deseos&quot; que podrías reducir sin sacrificar calidad de vida.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Trabaja para reducir las necesidades a largo plazo</strong>
                <p>Si tus necesidades superan el 50%, busca soluciones estructurales: mejor tarifa de luz, cambio de proveedor de internet, negociar el alquiler, o aumentar ingresos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Invierte el 20% de ahorro con propósito</strong>
                <p>Primero: fondo de emergencia (3-6 meses). Segundo: deudas de alto interés. Tercero: jubilación (plan pensiones, ETFs). Cuarto: objetivos específicos. Dar prioridades al ahorro multiplica su efecto.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.eduTips}>
          <h2>Tips para aplicar la regla 50/30/20 con éxito</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Empieza por el 20% de ahorro</strong>
              <p>Automatiza el ahorro antes de distribuir el resto. Lo que no ves, no lo gastas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📱</span>
              <strong>Usa una app de seguimiento</strong>
              <p>Fintonic, Money Manager o una hoja de cálculo. Lo que se mide, se puede mejorar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Revisa tus suscripciones cada trimestre</strong>
              <p>Las suscripciones olvidadas son la mayor fuga de la categoría &quot;deseos&quot;. Audítalas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📈</span>
              <strong>Aumenta el % de ahorro con cada subida</strong>
              <p>Cuando consigas un aumento, destina la mitad del incremento a ahorro antes de acostumbrarte a gastar más.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏆</span>
              <strong>Celebra los hitos</strong>
              <p>Llegar al primer mes con el 20% ahorrado merece reconocimiento. Usa la categoría &quot;deseos&quot; para celebrar el progreso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Adapta la regla, no la abandones</strong>
              <p>Si un mes no puedes cumplirla, analiza por qué. Un gasto extraordinario no es un fracaso, es información.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores comunes al aplicar la regla 50/30/20</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Calcular los porcentajes sobre el salario bruto en lugar del neto</li>
            <li>Clasificar los deseos como necesidades para que los números cuadren</li>
            <li>Reducir sistemáticamente el ahorro en lugar de revisar el resto del presupuesto. Un mes puntual de menor ahorro por un motivo real no es un error; el problema es si se vuelve regla.</li>
            <li>No tener una cuenta de ahorro separada (mezclar ahorro con gastos diarios)</li>
            <li>Obsesionarse con cumplir exactamente el 50/30/20 en lugar de usarlo como guía</li>
            <li>No revisar los gastos fijos periódicamente (seguros, suministros, suscripciones)</li>
            <li>Ignorar los gastos anuales o extraordinarios que descuadran el mes en que ocurren</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-regla-50-30-20')} />
      <ShareCard appName="orientador-regla-50-30-20" />
      <Footer appName="orientador-regla-50-30-20" />
    </div>
  );
}
