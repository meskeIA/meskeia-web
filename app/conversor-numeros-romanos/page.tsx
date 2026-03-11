'use client';

import { useState } from 'react';
import styles from './ConversorNumerosRomanos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'arabigo-romano' | 'romano-arabigo';

const VALORES_ROMANOS: [string, number][] = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
  ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
];

const SIMBOLOS_ROMANOS: Record<string, number> = {
  'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
};

export default function ConversorNumerosRomanosPage() {
  const [modo, setModo] = useState<ModoType>('arabigo-romano');
  const [entrada, setEntrada] = useState('');
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const [desglose, setDesglose] = useState<string[]>([]);

  const arabigoARomano = (num: number): { romano: string; pasos: string[] } => {
    if (num < 1 || num > 3999) {
      throw new Error('El número debe estar entre 1 y 3999');
    }

    let resultado = '';
    let restante = num;
    const pasos: string[] = [];

    for (const [simbolo, valor] of VALORES_ROMANOS) {
      while (restante >= valor) {
        resultado += simbolo;
        restante -= valor;
        pasos.push(`${simbolo} = ${formatNumber(valor, 0)}`);
      }
    }

    return { romano: resultado, pasos };
  };

  const romanoAArabigo = (romano: string): { numero: number; pasos: string[] } => {
    const input = romano.toUpperCase().trim();
    if (!/^[IVXLCDM]+$/.test(input)) {
      throw new Error('Solo se permiten los símbolos I, V, X, L, C, D, M');
    }

    let resultado = 0;
    const pasos: string[] = [];

    for (let i = 0; i < input.length; i++) {
      const actual = SIMBOLOS_ROMANOS[input[i]];
      const siguiente = SIMBOLOS_ROMANOS[input[i + 1]] || 0;

      if (actual < siguiente) {
        resultado -= actual;
        pasos.push(`${input[i]} (resta ${formatNumber(actual, 0)})`);
      } else {
        resultado += actual;
        pasos.push(`${input[i]} = ${formatNumber(actual, 0)}`);
      }
    }

    return { numero: resultado, pasos };
  };

  const convertir = () => {
    setError('');
    setResultado('');
    setDesglose([]);

    try {
      if (modo === 'arabigo-romano') {
        const num = parseInt(entrada, 10);
        if (isNaN(num)) {
          throw new Error('Introduce un número válido');
        }
        const { romano, pasos } = arabigoARomano(num);
        setResultado(romano);
        setDesglose(pasos);
      } else {
        const { numero, pasos } = romanoAArabigo(entrada);
        setResultado(formatNumber(numero, 0));
        setDesglose(pasos);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const intercambiar = () => {
    setModo(modo === 'arabigo-romano' ? 'romano-arabigo' : 'arabigo-romano');
    setEntrada('');
    setResultado('');
    setDesglose([]);
    setError('');
  };

  const ejemploRapido = (valor: number | string) => {
    setEntrada(String(valor));
    setError('');
  };

  const ejemplos = modo === 'arabigo-romano'
    ? [2024, 1999, 500, 49, 14, 9]
    : ['MMXXIV', 'MCMXCIX', 'XLIX', 'XIV', 'IX', 'IV'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Números Romanos</h1>
        <p className={styles.subtitle}>
          Convierte entre números arábigos (1, 2, 3...) y romanos (I, II, III...)
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'arabigo-romano' ? styles.active : ''}`}
            onClick={() => { setModo('arabigo-romano'); setEntrada(''); setResultado(''); setDesglose([]); setError(''); }}
          >
            Arábigo → Romano
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'romano-arabigo' ? styles.active : ''}`}
            onClick={() => { setModo('romano-arabigo'); setEntrada(''); setResultado(''); setDesglose([]); setError(''); }}
          >
            Romano → Arábigo
          </button>
        </div>

        <div className={styles.converterBox}>
          <div className={styles.inputSection}>
            <label className={styles.label}>
              {modo === 'arabigo-romano' ? 'Número arábigo (1-3999)' : 'Número romano'}
            </label>
            <input
              type="text"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder={modo === 'arabigo-romano' ? 'Ej: 2024' : 'Ej: MMXXIV'}
              className={styles.input}
            />
            <div className={styles.quickExamples}>
              <span className={styles.quickLabel}>Ejemplos:</span>
              {ejemplos.map((ej) => (
                <button
                  type="button"
                  key={String(ej)}
                  onClick={() => ejemploRapido(ej)}
                  className={styles.quickBtn}
                >
                  {ej}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.buttonRow}>
            <button type="button" onClick={convertir} className={styles.btnPrimary}>
              Convertir
            </button>
            <button type="button" onClick={intercambiar} className={styles.btnSwap} title="Intercambiar">
              ⇄
            </button>
          </div>

          {resultado && (
            <div className={styles.resultSection}>
              <div className={styles.resultBox}>
                <span className={styles.resultLabel}>Resultado:</span>
                <span className={styles.resultValue}>{resultado}</span>
              </div>

              {desglose.length > 0 && (
                <div className={styles.breakdown}>
                  <h4>Desglose:</h4>
                  <div className={styles.breakdownItems}>
                    {desglose.map((paso, i) => (
                      <span key={i} className={styles.breakdownItem}>{paso}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <section className={styles.referenceSection}>
        <h2>Tabla de Símbolos Romanos</h2>
        <div className={styles.symbolsGrid}>
          {[
            { s: 'I', v: 1 }, { s: 'V', v: 5 }, { s: 'X', v: 10 },
            { s: 'L', v: 50 }, { s: 'C', v: 100 }, { s: 'D', v: 500 }, { s: 'M', v: 1000 }
          ].map(({ s, v }) => (
            <div key={s} className={styles.symbolCard}>
              <span className={styles.symbol}>{s}</span>
              <span className={styles.value}>{formatNumber(v, 0)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.rulesSection}>
        <h2>Reglas de los Números Romanos</h2>
        <div className={styles.rulesGrid}>
          <div className={styles.ruleCard}>
            <h3>📝 Suma</h3>
            <p>Si un símbolo va seguido de otro de igual o menor valor, se suman.</p>
            <code>VI = 5 + 1 = 6</code>
          </div>
          <div className={styles.ruleCard}>
            <h3>➖ Resta</h3>
            <p>Si un símbolo de menor valor precede a uno mayor, se resta.</p>
            <code>IV = 5 - 1 = 4</code>
          </div>
          <div className={styles.ruleCard}>
            <h3>🔢 Repetición</h3>
            <p>Un símbolo puede repetirse hasta 3 veces consecutivas (I, X, C, M).</p>
            <code>III = 3, XXX = 30</code>
          </div>
          <div className={styles.ruleCard}>
            <h3>⚠️ Límites</h3>
            <p>V, L y D nunca se repiten. El máximo representable es 3999 (MMMCMXCIX).</p>
            <code>No: VV, LL, DD</code>
          </div>
        </div>
      </section>

      <EducationalSection
        title="Aprende sobre los Números Romanos"
        subtitle="Historia, reglas avanzadas, usos modernos y curiosidades del sistema de numeración romano"
        defaultOpen={false}
      >
        <section>

          {/* SECCIÓN 1: Comparativa de sistemas */}
          <div className={styles.comparativaSection}>
            <h3>📊 Sistemas de Numeración: Romano vs Árabe vs Otros</h3>
            <div className={styles.comparativaGrid}>
              <div className={styles.comparativaCard}>
                <h4>🏛️ Romano (I, V, X...)</h4>
                <ul>
                  <li><strong>Origen:</strong> Roma, ~500 a.C.</li>
                  <li><strong>Base:</strong> Aditivo/sustractivo (no posicional)</li>
                  <li><strong>Rango:</strong> 1 a 3.999</li>
                  <li><strong>Cero:</strong> No existe</li>
                  <li><strong>Uso hoy:</strong> Ornamental, siglos, reyes, capítulos</li>
                </ul>
              </div>
              <div className={styles.comparativaCard}>
                <h4>🔢 Árabe/Hindu (0, 1, 2...)</h4>
                <ul>
                  <li><strong>Origen:</strong> India, ~500 d.C. → Europa ~1200</li>
                  <li><strong>Base:</strong> Posicional en base 10</li>
                  <li><strong>Rango:</strong> Ilimitado</li>
                  <li><strong>Cero:</strong> Sí (concepto clave)</li>
                  <li><strong>Uso hoy:</strong> Universal para matemáticas y ciencia</li>
                </ul>
              </div>
              <div className={styles.comparativaCard}>
                <h4>🔣 Binario (0, 1)</h4>
                <ul>
                  <li><strong>Origen:</strong> Leibniz ~1700, usado en computing desde 1940</li>
                  <li><strong>Base:</strong> Posicional en base 2</li>
                  <li><strong>Rango:</strong> Ilimitado</li>
                  <li><strong>Cero:</strong> Sí</li>
                  <li><strong>Uso hoy:</strong> Hardware digital, chips, memoria</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Historia */}
          <div className={styles.historiaSection}>
            <h3>🏛️ Historia de los Números Romanos</h3>
            <div className={styles.historiaTimeline}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>~500 a.C.</span>
                <div className={styles.timelineContent}>
                  <strong>Origen etrusco y romano</strong>
                  <p>Los primeros símbolos romanos probablemente derivaron de las muescas usadas para contar en palos (tally sticks). El símbolo V representaba una mano abierta, X dos manos cruzadas. Los etruscos, predecesores de los romanos, ya usaban símbolos similares.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>Siglos I-V d.C.</span>
                <div className={styles.timelineContent}>
                  <strong>El Imperio Romano estandariza el sistema</strong>
                  <p>El sistema romano se formalizó y extendió por todo el Imperio. Se usaba para fechas, precios, cuentas militares y monumentos. Las reglas de sustracción (IV, IX, XL...) se adoptaron gradualmente para acortar representaciones.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>Siglos V-XV</span>
                <div className={styles.timelineContent}>
                  <strong>Europa medieval: uso dominante</strong>
                  <p>Durante la Edad Media, los números romanos eran el sistema estándar en Europa occidental para documentos legales, manuscritos y calendarios. El sistema árabe llegó a Europa a través de Al-Ándalus pero tardó siglos en adoptarse.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>Siglo XIII</span>
                <div className={styles.timelineContent}>
                  <strong>Fibonacci introduce los números árabes en Europa</strong>
                  <p>Leonardo de Pisa (Fibonacci) publicó Liber Abaci (1202), promoviendo el sistema de numeración árabe. El sistema posicional con cero era enormemente superior para cálculos comerciales y matemáticos.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>Hoy</span>
                <div className={styles.timelineContent}>
                  <strong>Uso ornamental y convencional</strong>
                  <p>Los números romanos persisten en contextos específicos: Super Bowl (LVIII), reyes y papas (Juan Pablo II), siglos (siglo XXI), capítulos de libros, estrenos de películas, relojes de lujo y monumentos arquitectónicos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.faqSection}>
            <h3>❓ Preguntas Frecuentes sobre Números Romanos</h3>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Por qué el sistema romano solo llega hasta 3.999?</summary>
                <p className={styles.faqAnswer}>El sistema estándar usa M como símbolo máximo (1000). Para representar 4.000 necesitarías MMMM, lo que viola la regla de máximo 3 repeticiones. Los romanos solucionaban esto con notaciones especiales: una barra sobre un símbolo lo multiplicaba por 1.000 (V̄ = 5.000, M̄ = 1.000.000), pero esas extensiones no son parte del sistema básico moderno.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Cuál es la diferencia entre IV y IIII en los relojes?</summary>
                <p className={styles.faqAnswer}>En los relojes romanos clásicos, el 4 se escribe IIII, no IV. Hay varias teorías: razones estéticas (IIII es más simétrico con VIII del lado opuesto), razones de fundición (IIII requiere más moldes del mismo símbolo, más eficiente), y teoría del respeto al dios Júpiter (cuya abreviatura en latín era IV). El reloj del Big Ben también usa IIII.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Los romanos usaban realmente IV para el 4 o solo IIII?</summary>
                <p className={styles.faqAnswer}>Históricamente, los romanos usaban principalmente la forma aditiva (IIII, VIIII, XXXX). Las formas sustractivas (IV, IX, XL, XC, CD, CM) se volvieron comunes en la Edad Media, no en la Roma clásica. Por eso en muchos documentos medievales y renacentistas se mezclan ambas formas. El sistema sustractivo que usamos hoy es una simplificación medieval, no el original romano.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Por qué el año 1999 en romano es tan largo (MCMXCIX)?</summary>
                <p className={styles.faqAnswer}>MCMXCIX = 1000 + (1000-100) + (100-10) + (10-1) = 1000 + 900 + 90 + 9. Los años cercanos a finales de siglo o milenio son los más largos porque acumulan múltiples sustracciones. 1999 requiere 9 símbolos, mientras que 2000 (MM) solo necesita 2. El año más corto es 1 (I) y el más largo varía, pero 1888 (MDCCCLXXXVIII) con 13 símbolos es históricamente el más largo del sistema estándar.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Se pueden hacer operaciones matemáticas con números romanos?</summary>
                <p className={styles.faqAnswer}>Sí, pero es muy ineficiente. La suma y resta son posibles reordenando y cancelando símbolos. La multiplicación y división son extremadamente tediosas. Esta limitación explica por qué los romanos y medievales usaban el ábaco para cálculos, y los números escritos eran principalmente para registro, no para calcular. La superioridad del sistema posicional árabe es precisamente que hace los cálculos escritos posibles.</p>
              </details>
            </div>
          </div>

          {/* SECCIÓN 4: Usos modernos */}
          <div className={styles.usosSection}>
            <h3>🎯 Dónde Se Usan Hoy los Números Romanos</h3>
            <div className={styles.usosGrid}>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>🏟️</span>
                <h4>Eventos deportivos</h4>
                <p>Juegos Olímpicos (París 2024 = MMXXIV), Super Bowl (LVIII), Juegos Europeos. Es tradición desde los primeros Juegos Olímpicos modernos de 1896.</p>
              </div>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>👑</span>
                <h4>Monarquías y papas</h4>
                <p>Carlos III, Juan Pablo II, Enrique VIII. Distinguen monarcas del mismo nombre en distintas épocas. Sin esta convención, habría ambigüedad histórica.</p>
              </div>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>🎬</span>
                <h4>Fechas en créditos</h4>
                <p>Hollywood usa números romanos en los créditos finales de películas para indicar el año de producción (© MMXXIV). Tradición que comenzó a principios del cine sonoro.</p>
              </div>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>🕰️</span>
                <h4>Relojes de lujo</h4>
                <p>Las marcas de alta relojería (Rolex, Patek Philippe, Cartier) usan romanos en sus esferas como símbolo de tradición y artesanía. Los dígitos arábigos son considerados más &quot;modernos&quot; y &quot;deportivos&quot;.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips para memorizar */}
          <div className={styles.tipsSection}>
            <h3>💡 Trucos para Memorizar y Convertir Rápido</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🧠</span>
                <h4>Memoriza los 7 símbolos base</h4>
                <p>I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Mnemotécnico: <strong>I Value Xylophones Like Cows Drink Milk</strong>. Con solo estos 7 puedes convertir cualquier número del 1 al 3999.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚡</span>
                <h4>Regla de sustracción rápida</h4>
                <p>Solo hay 6 formas sustractivas: <strong>IV=4, IX=9, XL=40, XC=90, CD=400, CM=900</strong>. Si ves I antes de V o X, X antes de L o C, C antes de D o M → siempre es resta.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔢</span>
                <h4>Reconoce los &quot;bloques&quot; del año actual</h4>
                <p>2024 = MM (2000) + XXIV (24). Descompón el número en miles, centenas, decenas y unidades. Cada bloque tiene su propio patrón de 1-9 usando I/V/X → X/L/C → C/D/M → M.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📺</span>
                <h4>Practica con lo que ya ves</h4>
                <p>Los títulos de películas, capítulos de series, relojes analógicos y monumentos son práctica constante. Cuando veas &quot;Super Bowl LVIII&quot;, tradúcelo mentalmente: L(50)+V(5)+I(1)+I(1)+I(1) = 58.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Limitaciones del Sistema Romano y de este Conversor</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ El sistema romano no tiene cero:</strong> Los romanos no tenían concepto de cero como número. &quot;Nulla&quot; significaba &quot;nada&quot; pero no era un símbolo matemático operable. Esto hacía imposible la notación posicional y limitaba gravemente las matemáticas avanzadas.</li>
              <li><strong>❌ Solo funciona entre 1 y 3.999:</strong> El sistema estándar no representa el 0 ni números negativos ni fracciones. Los romanos tenían fracciones propias (basadas en el as de 12 partes: semis=½, triens=⅓...) pero no forman parte del sistema romano convencional moderno.</li>
              <li><strong>❌ El sistema romano no es universal ni totalmente estandarizado:</strong> Antes del siglo XVI coexistían muchas variantes: IIII y IV ambos válidos para el 4, algunas reglas sustractivas que no todos seguían. El &quot;sistema romano estándar&quot; que usamos hoy es una codificación medieval y renacentista, no el sistema original romano clásico.</li>
              <li><strong>❌ No apto para cálculos:</strong> Nunca uses números romanos para operaciones matemáticas reales. Son representaciones de escritura/display, no un sistema de cálculo. Si ves MCMXCIX + I = MM, estás haciendo la conversión mentalmente a números arábigos, no operando en romano.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-numeros-romanos')} />

      <ShareCard appName="conversor-numeros-romanos" />
      <Footer appName="conversor-numeros-romanos" />
    </div>
  );
}
