'use client';

import { useState } from 'react';
import styles from './CalculadoraPorcentajes.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type CalculationType = 'percentOf' | 'whatPercent' | 'increase' | 'decrease' | 'variation';

interface CalculationMode {
  id: CalculationType;
  title: string;
  icon: string;
  description: string;
  input1Label: string;
  input2Label: string;
  resultLabel: string;
}

const MODES: CalculationMode[] = [
  {
    id: 'percentOf',
    title: '¿Cuánto es el X% de Y?',
    icon: '🔢',
    description: 'Calcular el porcentaje de una cantidad',
    input1Label: 'Porcentaje (%)',
    input2Label: 'Cantidad',
    resultLabel: 'Resultado',
  },
  {
    id: 'whatPercent',
    title: '¿Qué % es X de Y?',
    icon: '❓',
    description: 'Qué porcentaje representa una cantidad de otra',
    input1Label: 'Cantidad parcial',
    input2Label: 'Cantidad total',
    resultLabel: 'Porcentaje',
  },
  {
    id: 'increase',
    title: 'Aumentar X en Y%',
    icon: '📈',
    description: 'Aumentar una cantidad en un porcentaje',
    input1Label: 'Cantidad inicial',
    input2Label: 'Porcentaje de aumento (%)',
    resultLabel: 'Cantidad final',
  },
  {
    id: 'decrease',
    title: 'Disminuir X en Y%',
    icon: '📉',
    description: 'Disminuir una cantidad en un porcentaje',
    input1Label: 'Cantidad inicial',
    input2Label: 'Porcentaje de disminución (%)',
    resultLabel: 'Cantidad final',
  },
  {
    id: 'variation',
    title: 'Variación de X a Y',
    icon: '🔄',
    description: 'Calcular el cambio porcentual entre dos valores',
    input1Label: 'Valor inicial',
    input2Label: 'Valor final',
    resultLabel: 'Variación',
  },
];

export default function CalculadoraPorcentajesPage() {
  const [mode, setMode] = useState<CalculationType>('percentOf');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<string>('');

  const currentMode = MODES.find((m) => m.id === mode)!;

  const calcular = () => {
    const val1 = parseSpanishNumber(input1);
    const val2 = parseSpanishNumber(input2);

    if (isNaN(val1) || isNaN(val2)) {
      setResultado(null);
      return;
    }

    let result: number;
    let detail: string;

    switch (mode) {
      case 'percentOf':
        result = (val1 / 100) * val2;
        detail = `El ${formatNumber(val1, 2)}% de ${formatNumber(val2, 2)} es ${formatNumber(result, 2)}`;
        break;

      case 'whatPercent':
        if (val2 === 0) {
          setResultado('Error: división por cero');
          setDetalles('');
          return;
        }
        result = (val1 / val2) * 100;
        detail = `${formatNumber(val1, 2)} representa el ${formatNumber(result, 2)}% de ${formatNumber(val2, 2)}`;
        break;

      case 'increase':
        result = val1 * (1 + val2 / 100);
        const aumentoAbs = result - val1;
        detail = `${formatNumber(val1, 2)} + ${formatNumber(val2, 2)}% = ${formatNumber(result, 2)} (aumento de ${formatNumber(aumentoAbs, 2)})`;
        break;

      case 'decrease':
        result = val1 * (1 - val2 / 100);
        const disminucionAbs = val1 - result;
        detail = `${formatNumber(val1, 2)} - ${formatNumber(val2, 2)}% = ${formatNumber(result, 2)} (disminución de ${formatNumber(disminucionAbs, 2)})`;
        break;

      case 'variation':
        if (val1 === 0) {
          setResultado('Error: valor inicial cero');
          setDetalles('');
          return;
        }
        result = ((val2 - val1) / val1) * 100;
        const direccion = result >= 0 ? 'aumento' : 'disminución';
        detail = `De ${formatNumber(val1, 2)} a ${formatNumber(val2, 2)} hay un ${direccion} del ${formatNumber(Math.abs(result), 2)}%`;
        break;

      default:
        return;
    }

    if (mode === 'whatPercent' || mode === 'variation') {
      setResultado(`${formatNumber(result, 2)}%`);
    } else {
      setResultado(formatNumber(result, 2));
    }
    setDetalles(detail);
  };

  const limpiar = () => {
    setInput1('');
    setInput2('');
    setResultado(null);
    setDetalles('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Porcentajes</h1>
        <p className={styles.subtitle}>
          5 modos de cálculo para resolver cualquier problema con porcentajes
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="calculadora-porcentajes-disclaimer"
      />

      <div className={styles.modeSelector}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`${styles.modeBtn} ${mode === m.id ? styles.active : ''}`}
            onClick={() => {
              setMode(m.id);
              limpiar();
            }}
          >
            <span className={styles.modeIcon}>{m.icon}</span>
            <span className={styles.modeTitle}>{m.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <div className={styles.modeDescription}>
            <span className={styles.descIcon}>{currentMode.icon}</span>
            <p>{currentMode.description}</p>
          </div>

          <NumberInput
            value={input1}
            onChange={setInput1}
            label={currentMode.input1Label}
            placeholder="0"
          />

          <NumberInput
            value={input2}
            onChange={setInput2}
            label={currentMode.input2Label}
            placeholder="0"
          />

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <ResultCard
                title={currentMode.resultLabel}
                value={resultado}
                variant="highlight"
                icon="✅"
              />
              <div className={styles.detailBox}>
                <p>{detalles}</p>
              </div>

              <div className={styles.formulaBox}>
                <h4>Fórmula utilizada:</h4>
                {mode === 'percentOf' && <p>Resultado = (Porcentaje / 100) × Cantidad</p>}
                {mode === 'whatPercent' && <p>Porcentaje = (Parcial / Total) × 100</p>}
                {mode === 'increase' && <p>Final = Inicial × (1 + Porcentaje / 100)</p>}
                {mode === 'decrease' && <p>Final = Inicial × (1 - Porcentaje / 100)</p>}
                {mode === 'variation' && <p>Variación = ((Final - Inicial) / Inicial) × 100</p>}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>%</span>
              <p>Introduce los valores y pulsa &quot;Calcular&quot;</p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="Guía completa de porcentajes" subtitle="Domina los cinco tipos de cálculo con porcentajes: descuentos, IVA, variaciones, aumentos y disminuciones">

        {/* Tabla comparativa */}
        <h3 className={styles.eduTitle}>⚖️ Cuándo usar cada tipo de cálculo</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Situación</th>
                <th>Modo a usar</th>
                <th>Ejemplo real</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Calcular el IVA de un precio</strong></td>
                <td>¿Cuánto es el X% de Y?</td>
                <td>21% de 100 €</td>
                <td>21 €</td>
              </tr>
              <tr>
                <td><strong>Ver qué % es un descuento</strong></td>
                <td>¿Qué % es X de Y?</td>
                <td>15 € de 75 €</td>
                <td>20%</td>
              </tr>
              <tr>
                <td><strong>Aplicar una rebaja de rebajas</strong></td>
                <td>Disminuir X en Y%</td>
                <td>200 € – 30%</td>
                <td>140 €</td>
              </tr>
              <tr>
                <td><strong>Subida de sueldo o precio</strong></td>
                <td>Aumentar X en Y%</td>
                <td>1.800 € + 4%</td>
                <td>1.872 €</td>
              </tr>
              <tr>
                <td><strong>Inflación, cambio bursátil</strong></td>
                <td>Variación de X a Y</td>
                <td>De 80 € a 95 €</td>
                <td>+18,75%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3 className={styles.eduTitle}>💼 Usos cotidianos de los porcentajes</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🛍️</span>
              <h4>Rebajas y descuentos</h4>
            </div>
            <p className={styles.escenarioDesc}>Un artículo cuesta 79 € con un 25% de descuento. Usa «Disminuir X en Y%»: 79 × (1 – 0,25) = <strong>59,25 €</strong>. Ojo con los descuentos acumulados: un 30% + 20% no es un 50%, sino un 44%.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🧾</span>
              <h4>IVA y precios sin impuestos</h4>
            </div>
            <p className={styles.escenarioDesc}>Si el precio con IVA (21%) es 121 €, el precio sin IVA es 121 / 1,21 = <strong>100 €</strong>. Usa «¿Qué % es X de Y?» para comprobarlo: 21 de 121 = 17,36% (no 21% — el IVA se aplica sobre el neto, no sobre el total).</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📈</span>
              <h4>Inflación y variación de precios</h4>
            </div>
            <p className={styles.escenarioDesc}>Si la luz costaba 120 €/mes y ahora cuesta 156 €, usa «Variación de X a Y»: de 120 a 156 = <strong>+30%</strong>. Para saber cuánto subirá si se aplica un 8% de IPC al año que viene: «Aumentar 156 en 8%» = 168,48 €/mes.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎓</span>
              <h4>Notas y rendimiento académico</h4>
            </div>
            <p className={styles.escenarioDesc}>Has sacado 63 puntos de 80 posibles en un examen. Usa «¿Qué % es X de Y?»: 63 de 80 = <strong>78,75%</strong>. Si el aprobado es el 50%, necesitas al menos 40 puntos. Si ponderan 3 asignaturas: (7 × 40% + 6 × 35% + 8 × 25%) = 6,9 sobre 10.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3 className={styles.eduTitle}>❓ Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué un descuento del 30% + 20% no es un 50%?</h4>
            <p>Porque los porcentajes se aplican en cadena sobre el precio resultante, no sobre el original. Si un artículo cuesta 100 €: tras el 30% queda en 70 €; el 20% se aplica sobre 70 €, no sobre 100 €. Resultado: 70 × 0,8 = <strong>56 €</strong>, que equivale a un descuento real del 44%, no del 50%. Siempre calcula paso a paso o usa la fórmula: (1 – 0,30) × (1 – 0,20) = 0,56 = 56%.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo sé qué porcentaje me están reteniendo en la nómina?</h4>
            <p>Divide la retención IRPF entre el salario bruto y multiplica por 100. Si cobras 2.000 € brutos y retienen 300 €: (300 / 2.000) × 100 = <strong>15% de retención</strong>. Esta cifra debe coincidir con el porcentaje que te comunicó RRHH al inicio del año. Si hay discrepancia, solicita el modelo de retención.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre margen y markup (recargo)?</h4>
            <p>Son dos formas de expresar el beneficio: el <strong>margen</strong> se calcula sobre el precio de venta (beneficio / precio venta × 100); el <strong>markup</strong> se calcula sobre el coste (beneficio / coste × 100). Si compro a 80 € y vendo a 100 €: margen = 20 / 100 = 20%; markup = 20 / 80 = 25%. Usar la fórmula equivocada puede hacer que cobres de menos.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo calculo el precio sin IVA si solo tengo el precio final?</h4>
            <p>Divide el precio con IVA entre (1 + tipo de IVA). Para IVA al 21%: precio sin IVA = precio final / 1,21. Para IVA al 10%: precio final / 1,10. Para IVA al 4%: precio final / 1,04. Ejemplo: 121 € con IVA del 21% → 121 / 1,21 = <strong>100 € sin IVA</strong>.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se calcula una propina del 10–15%?</h4>
            <p>Para el 10%: mueve la coma decimal un lugar a la izquierda (85,40 € → 8,54 €). Para el 15%: calcula el 10% y súmale la mitad (8,54 + 4,27 = 12,81 €). Para el 20%: duplica el 10%. En España la propina no está regulada ni es obligatoria, pero es habitual entre el 5–10% en restaurantes de nivel medio-alto.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el percentil y cómo se diferencia del porcentaje?</h4>
            <p>El porcentaje es una fracción de 100 (qué parte es algo de un total). El percentil indica la posición relativa en una distribución. Si estás en el percentil 80 en una prueba, <strong>el 80% de los participantes sacó menos que tú</strong>, independientemente de la nota exacta. Se usan en medicina (curvas de crecimiento), educación (rankings) y estadística.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <h3 className={styles.eduTitle}>📋 Cómo resolver cualquier problema de porcentajes</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Identifica qué cantidad conoces y cuál buscas</h4>
              <p>Tienes: precio final, precio inicial, % o dos valores. Lo que buscas: ¿el porcentaje? ¿el resultado tras aplicarlo? ¿la variación? Esta clasificación determina qué modo usar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Selecciona el modo correcto</h4>
              <p>«¿Cuánto es X% de Y?» → tienes el porcentaje y la base. «¿Qué % es X de Y?» → tienes dos cantidades. «Aumentar/Disminuir» → tienes base y porcentaje de cambio. «Variación» → tienes valor inicial y final.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Introduce los valores y verifica el resultado</h4>
              <p>Antes de aceptar el resultado, haz una estimación mental: el 20% de 200 debe ser ~40. Si obtienes 400, algo está mal (quizás invertiste los campos). La estimación mental evita errores graves.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Cuidado con los porcentajes encadenados</h4>
              <p>Si aplicas varios porcentajes sucesivos (subida + descuento), calcúlalos en orden, usando el resultado del paso anterior como nueva base. Nunca los sumes directamente: 10% + 10% aplicado dos veces = 21%, no 20%.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Interpreta correctamente el signo en variaciones</h4>
              <p>Un resultado positivo en «Variación» indica aumento (subida de precio, inflación, ganancia). Un resultado negativo indica disminución (descuento, pérdida, deflación). El módulo del porcentaje indica la magnitud del cambio.</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <h3 className={styles.eduTitle}>✅ 6 trucos mentales con porcentajes</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔢</span>
            <h4>El truco del 1%</h4>
            <p>Para calcular cualquier porcentaje mentalmente, primero calcula el 1% (divide entre 100) y luego multiplica. El 7% de 350 = 3,50 × 7 = 24,50 €.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔄</span>
            <h4>La conmutatividad</h4>
            <p>El 18% de 50 es igual al 50% de 18. Usa la versión más fácil de calcular. El 50% de 18 = 9. Por eso el 18% de 50 también es 9.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📉</span>
            <h4>Descuentos en dos pasos</h4>
            <p>Un descuento del 25% = quitar la cuarta parte. Un 20% = quitar la quinta parte. Un 33% ≈ quitar un tercio. Más rápido que calcular el porcentaje exacto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚡</span>
            <h4>El método del complemento</h4>
            <p>Si hay un 30% de descuento, pagas el 70%. Multiplica directamente por 0,70 en lugar de calcular el 30% y restarlo. Un paso menos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📊</span>
            <h4>Porcentaje de aumento para volver al original</h4>
            <p>Si algo baja un 20% y quieres saber cuánto debe subir para recuperar el valor, no es un 20% — es un 25%. Porque ahora partes de una base menor.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💡</span>
            <h4>Porcentajes mayores de 100%</h4>
            <p>Un 150% de 40 = 60. Un aumento del 200% significa que algo se triplica (precio original + 200% más). Común en inversiones, precios de activos y crecimiento empresarial.</p>
          </div>
        </div>

        {/* Warning */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores frecuentes que cuestan dinero</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Sumar porcentajes de descuento directamente:</strong> Un 20% + 30% no es un 50% de descuento, sino un 44%. Siempre aplícalos en cadena sobre el precio resultante.</li>
            <li><strong>❌ Confundir «subir un X%» con «volver al precio original»:</strong> Si un precio baja un 20% y luego sube un 20%, NO vuelve al inicio. Baja de 100 → 80; sube 20% de 80 = 16 → 96. Hay una pérdida del 4%.</li>
            <li><strong>❌ No distinguir entre puntos porcentuales y porcentaje:</strong> Si el IPC pasa del 2% al 4%, ha subido 2 puntos porcentuales pero ha aumentado un 100% en términos relativos. En economía y finanzas esta distinción es crítica.</li>
            <li><strong>❌ Calcular el IVA sobre el precio final en lugar de sobre el neto:</strong> El IVA del 21% se aplica sobre el precio sin impuestos, no sobre el precio final. Sobre 100 € netos, el IVA son 21 €. Pero el 21% de 121 € son 25,41 € — ese cálculo está mal.</li>
            <li><strong>❌ Usar porcentajes sin especificar la base:</strong> «Ha subido un 50%» no dice nada sin saber de qué base. El 50% de 1.000 € son 500 €; el 50% de 10 € son 5 €. Siempre incluye el valor de referencia.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-porcentajes')} />

      <ShareCard appName="calculadora-porcentajes" />
      <Footer appName="calculadora-porcentajes" />
    </div>
  );
}
