'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraResistenciasLed.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface ColorBanda {
  nombre: string;
  hex: string;
  digito: number | null;
  multiplicador: number;
  tolerancia: string | null;
  textColor: string;
}

const COLORES: ColorBanda[] = [
  { nombre: 'Negro',    hex: '#1a1a1a', digito: 0, multiplicador: 1,          tolerancia: null,      textColor: '#fff' },
  { nombre: 'Marrón',  hex: '#8B4513', digito: 1, multiplicador: 10,         tolerancia: '±1%',     textColor: '#fff' },
  { nombre: 'Rojo',    hex: '#CC0000', digito: 2, multiplicador: 100,        tolerancia: '±2%',     textColor: '#fff' },
  { nombre: 'Naranja', hex: '#E87000', digito: 3, multiplicador: 1000,       tolerancia: null,      textColor: '#000' },
  { nombre: 'Amarillo',hex: '#FFD700', digito: 4, multiplicador: 10000,      tolerancia: null,      textColor: '#000' },
  { nombre: 'Verde',   hex: '#007700', digito: 5, multiplicador: 100000,     tolerancia: '±0,5%',   textColor: '#fff' },
  { nombre: 'Azul',    hex: '#0055CC', digito: 6, multiplicador: 1000000,    tolerancia: '±0,25%',  textColor: '#fff' },
  { nombre: 'Violeta', hex: '#7B00B0', digito: 7, multiplicador: 10000000,   tolerancia: '±0,1%',   textColor: '#fff' },
  { nombre: 'Gris',    hex: '#808080', digito: 8, multiplicador: 100000000,  tolerancia: '±0,05%',  textColor: '#fff' },
  { nombre: 'Blanco',  hex: '#E8E8E8', digito: 9, multiplicador: 1000000000, tolerancia: null,      textColor: '#000' },
  { nombre: 'Dorado',  hex: '#DAA520', digito: null, multiplicador: 0.1,     tolerancia: '±5%',     textColor: '#000' },
  { nombre: 'Plateado',hex: '#A8A8A8', digito: null, multiplicador: 0.01,    tolerancia: '±10%',    textColor: '#000' },
];

const COLORES_DIGITO = COLORES.filter(c => c.digito !== null);
const COLORES_MULTIPLICADOR = COLORES;
const COLORES_TOLERANCIA = COLORES.filter(c => c.tolerancia !== null);

const E12_VALUES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

const LED_PRESETS = [
  { label: 'Rojo',     vf: 2.0 },
  { label: 'Naranja',  vf: 2.1 },
  { label: 'Amarillo', vf: 2.2 },
  { label: 'Verde',    vf: 2.1 },
  { label: 'Azul',     vf: 3.2 },
  { label: 'Blanco',   vf: 3.2 },
  { label: 'IR',       vf: 1.4 },
];

function formatResistencia(ohmios: number): string {
  if (ohmios >= 1_000_000) return `${formatNumber(ohmios / 1_000_000, 2)} MΩ`;
  if (ohmios >= 1_000)     return `${formatNumber(ohmios / 1_000, 2)} kΩ`;
  return `${formatNumber(ohmios, 2)} Ω`;
}

function valorEstandarE12(valor: number): number {
  let v = valor;
  let escala = 1;
  while (v >= 10)  { v /= 10;  escala *= 10; }
  while (v < 1)   { v *= 10;  escala /= 10; }
  let closest = E12_VALUES[0];
  let minDiff = Math.abs(v - E12_VALUES[0]);
  for (const e of E12_VALUES) {
    const diff = Math.abs(v - e);
    if (diff < minDiff) { minDiff = diff; closest = e; }
  }
  return closest * escala;
}

export default function CalculadoraResistenciasLedPage() {
  const [modoDecod, setModoDecod] = useState<'4' | '5'>('4');
  const [banda1, setBanda1] = useState<ColorBanda>(COLORES_DIGITO[1]);
  const [banda2, setBanda2] = useState<ColorBanda>(COLORES_DIGITO[0]);
  const [banda3, setBanda3] = useState<ColorBanda>(COLORES_DIGITO[0]);
  const [bandaMult4, setBandaMult4] = useState<ColorBanda>(COLORES_MULTIPLICADOR[1]);
  const [bandaMult5, setBandaMult5] = useState<ColorBanda>(COLORES_MULTIPLICADOR[1]);
  const [bandaTol4, setBandaTol4] = useState<ColorBanda>(COLORES_TOLERANCIA[0]);
  const [bandaTol5, setBandaTol5] = useState<ColorBanda>(COLORES_TOLERANCIA[0]);

  const [vcc, setVcc] = useState('5');
  const [vled, setVled] = useState('2,0');
  const [iled, setIled] = useState('20');

  const [seccion, setSeccion] = useState<'decoder' | 'led'>('decoder');

  const valorDecodificado = useCallback((): number => {
    const d1 = banda1.digito ?? 0;
    const d2 = banda2.digito ?? 0;
    if (modoDecod === '4') {
      const mult = bandaMult4.multiplicador;
      return (d1 * 10 + d2) * mult;
    } else {
      const d3 = banda3.digito ?? 0;
      const mult = bandaMult5.multiplicador;
      return (d1 * 100 + d2 * 10 + d3) * mult;
    }
  }, [banda1, banda2, banda3, bandaMult4, bandaMult5, modoDecod]);

  const toleranciaActual = modoDecod === '4' ? bandaTol4.tolerancia : bandaTol5.tolerancia;

  const calcularLed = useCallback(() => {
    const vccNum  = parseSpanishNumber(vcc);
    const vledNum = parseSpanishNumber(vled);
    const iledNum = parseSpanishNumber(iled) / 1000;
    if (!vccNum || !vledNum || !iledNum || vccNum <= vledNum || iledNum <= 0) return null;
    const r = (vccNum - vledNum) / iledNum;
    const potencia = (vccNum - vledNum) * iledNum;
    const rE12 = valorEstandarE12(r);
    return { r, potencia, rE12 };
  }, [vcc, vled, iled]);

  const resultadoLed = calcularLed();
  const valorDecod = valorDecodificado();

  function BandaSelector({
    label, color, opciones, onChange,
  }: { label: string; color: ColorBanda; opciones: ColorBanda[]; onChange: (c: ColorBanda) => void }) {
    return (
      <div className={styles.bandaSelector}>
        <div className={styles.bandaLabel}>{label}</div>
        <div
          className={styles.bandaActual}
          style={{ background: color.hex, color: color.textColor }}
        >
          {color.nombre}
        </div>
        <div className={styles.bandaOpciones}>
          {opciones.map(c => (
            <button
              key={c.nombre}
              className={`${styles.colorBtn} ${c.nombre === color.nombre ? styles.colorBtnActivo : ''}`}
              style={{ background: c.hex, color: c.textColor }}
              onClick={() => onChange(c)}
              aria-label={c.nombre}
              title={c.nombre}
            >
              {c.nombre.slice(0, 2)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔴 Calculadora de Resistencias para LED</h1>
        <p className={styles.subtitle}>
          Decodifica el código de colores de cualquier resistencia y calcula la resistencia limitadora exacta para tus circuitos con LED
        </p>
      </header>

      <LegalNotice />

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${seccion === 'decoder' ? styles.tabActivo : ''}`}
          onClick={() => setSeccion('decoder')}
        >
          🎨 Código de colores
        </button>
        <button
          className={`${styles.tab} ${seccion === 'led' ? styles.tabActivo : ''}`}
          onClick={() => setSeccion('led')}
        >
          💡 Calcular resistencia LED
        </button>
      </div>

      {seccion === 'decoder' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>🎨 Decodificador de Código de Colores</h2>
            <div className={styles.modoSwitch}>
              <button
                className={`${styles.modoBtn} ${modoDecod === '4' ? styles.modoBtnActivo : ''}`}
                onClick={() => setModoDecod('4')}
              >4 bandas</button>
              <button
                className={`${styles.modoBtn} ${modoDecod === '5' ? styles.modoBtnActivo : ''}`}
                onClick={() => setModoDecod('5')}
              >5 bandas</button>
            </div>
          </div>

          <div className={styles.resistorPreview}>
            <div className={styles.resistorBody}>
              <div className={styles.resistorWire} />
              <div className={styles.resistorCylinder}>
                <div className={styles.bandaVisual} style={{ background: banda1.hex }} />
                <div className={styles.bandaVisual} style={{ background: banda2.hex }} />
                {modoDecod === '5' && <div className={styles.bandaVisual} style={{ background: banda3.hex }} />}
                <div className={styles.bandaEspaciador} />
                <div className={styles.bandaVisual} style={{ background: modoDecod === '4' ? bandaMult4.hex : bandaMult5.hex }} />
                <div className={styles.bandaVisual} style={{ background: modoDecod === '4' ? bandaTol4.hex : bandaTol5.hex }} />
              </div>
              <div className={styles.resistorWire} />
            </div>
          </div>

          <div className={styles.bandasGrid}>
            <BandaSelector label="Banda 1" color={banda1} opciones={COLORES_DIGITO} onChange={setBanda1} />
            <BandaSelector label="Banda 2" color={banda2} opciones={COLORES_DIGITO} onChange={setBanda2} />
            {modoDecod === '5' && (
              <BandaSelector label="Banda 3" color={banda3} opciones={COLORES_DIGITO} onChange={setBanda3} />
            )}
            <BandaSelector
              label="Multiplicador"
              color={modoDecod === '4' ? bandaMult4 : bandaMult5}
              opciones={COLORES_MULTIPLICADOR}
              onChange={modoDecod === '4' ? setBandaMult4 : setBandaMult5}
            />
            <BandaSelector
              label="Tolerancia"
              color={modoDecod === '4' ? bandaTol4 : bandaTol5}
              opciones={COLORES_TOLERANCIA}
              onChange={modoDecod === '4' ? setBandaTol4 : setBandaTol5}
            />
          </div>

          <div className={styles.resultadoDecod}>
            <div className={styles.resultadoValor}>
              <span className={styles.resultadoNumero}>{formatResistencia(valorDecod)}</span>
              {toleranciaActual && (
                <span className={styles.resultadoTol}>{toleranciaActual}</span>
              )}
            </div>
            <div className={styles.resultadoRango}>
              Rango: {formatResistencia(valorDecod * (1 - parseFloat((toleranciaActual ?? '±5%').replace('±','').replace('%','').replace(',','.')) / 100))} –{' '}
              {formatResistencia(valorDecod * (1 + parseFloat((toleranciaActual ?? '±5%').replace('±','').replace('%','').replace(',','.')) / 100))}
            </div>
          </div>
        </div>
      )}

      {seccion === 'led' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>💡 Calculadora de Resistencia Limitadora para LED</h2>
          <p className={styles.cardDesc}>
            Calcula la resistencia necesaria para limitar la corriente que pasa por tu LED usando la Ley de Ohm.
          </p>

          <div className={styles.ledGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="vcc">
                Tensión de alimentación (V)
              </label>
              <input
                id="vcc"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={vcc}
                onChange={e => setVcc(e.target.value)}
                placeholder="5"
              />
              <div className={styles.inputHint}>Ejemplos: 3,3V · 5V · 9V · 12V</div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="vled">
                Tensión directa del LED (Vf)
              </label>
              <input
                id="vled"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={vled}
                onChange={e => setVled(e.target.value)}
                placeholder="2,0"
              />
              <div className={styles.presetsLed}>
                {LED_PRESETS.map(p => (
                  <button
                    key={p.label}
                    className={styles.presetBtn}
                    onClick={() => setVled(String(p.vf).replace('.', ','))}
                  >
                    {p.label} ({String(p.vf).replace('.', ',')}V)
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="iled">
                Corriente de LED (mA)
              </label>
              <input
                id="iled"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={iled}
                onChange={e => setIled(e.target.value)}
                placeholder="20"
              />
              <div className={styles.inputHint}>Típico: 10–20 mA (consulta el datasheet)</div>
            </div>
          </div>

          {resultadoLed ? (
            <div className={styles.resultadoLed}>
              <div className={styles.resultadoPrincipal}>
                <div className={styles.resultItem}>
                  <div className={styles.resultLabel}>Resistencia exacta</div>
                  <div className={styles.resultValorGrande}>{formatResistencia(resultadoLed.r)}</div>
                </div>
                <div className={styles.resultItem}>
                  <div className={styles.resultLabel}>Valor E12 recomendado</div>
                  <div className={styles.resultValorGrande} style={{ color: 'var(--secondary)' }}>
                    {formatResistencia(resultadoLed.rE12)}
                  </div>
                </div>
                <div className={styles.resultItem}>
                  <div className={styles.resultLabel}>Potencia disipada</div>
                  <div className={styles.resultValorGrande}>
                    {formatNumber(resultadoLed.potencia * 1000, 1)} mW
                  </div>
                </div>
              </div>
              <div className={styles.formulaBox}>
                <strong>Fórmula:</strong> R = (Vcc − Vf) / I = ({parseSpanishNumber(vcc)} − {parseSpanishNumber(vled)}) / {parseSpanishNumber(iled)/1000} = {formatResistencia(resultadoLed.r)}
              </div>
              {resultadoLed.potencia >= 0.25 && (
                <div className={styles.alertaBox} role="alert">
                  ⚠️ La potencia disipada ({formatNumber(resultadoLed.potencia * 1000, 0)} mW) supera los 250 mW típicos de una resistencia de ¼W. Usa una resistencia de mayor potencia.
                </div>
              )}
            </div>
          ) : (
            <div className={styles.errorBox} role="alert">
              Verifica los valores: la tensión de alimentación debe ser mayor que la tensión directa del LED.
            </div>
          )}
        </div>
      )}

      <EducationalSection title="📚 Electrónica práctica: resistencias y LEDs" subtitle="Todo lo que necesitas saber para no quemar tus componentes">
        <div className={styles.guideSection}>
          <h2>Cómo funciona el código de colores</h2>
          <p>
            Las resistencias de componente discreto (through-hole) usan bandas de color para indicar su valor. Cada color representa un dígito del 0 al 9. Las resistencias de 4 bandas tienen 2 dígitos significativos, un multiplicador y una tolerancia. Las de 5 bandas añaden un tercer dígito para mayor precisión.
          </p>
          <p>
            El multiplicador indica por cuánto hay que multiplicar el número formado por los dígitos. Por ejemplo, marrón (×10) con bandas rojo-negro significa 20 × 10 = 200 Ω.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Color</th>
                <th>Dígito</th>
                <th>Multiplicador</th>
                <th>Tolerancia</th>
              </tr>
            </thead>
            <tbody>
              {COLORES.map(c => (
                <tr key={c.nombre}>
                  <td>
                    <span className={styles.colorChip} style={{ background: c.hex, color: c.textColor }}>
                      {c.nombre}
                    </span>
                  </td>
                  <td>{c.digito !== null ? c.digito : '—'}</td>
                  <td>
                    {c.multiplicador >= 1_000_000
                      ? `×${formatNumber(c.multiplicador / 1_000_000, 0)} MΩ`
                      : c.multiplicador >= 1_000
                      ? `×${formatNumber(c.multiplicador / 1_000, 0)} kΩ`
                      : c.multiplicador < 1
                      ? `×${c.multiplicador}`
                      : `×${formatNumber(c.multiplicador, 0)}`}
                  </td>
                  <td>{c.tolerancia ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🔴</div>
            <h3>LED en Arduino (5V)</h3>
            <p>Vcc=5V, Vf=2V, I=20mA → R=150Ω. Valor E12: 150Ω. Una resistencia marrón-verde-marrón estándar.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>💡</div>
            <h3>LED azul/blanco (3,3V)</h3>
            <p>Vcc=3,3V, Vf=3,2V, I=10mA → R=10Ω. Margen mínimo: usa siempre al menos 33Ω para proteger el LED.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🔋</div>
            <h3>LED en pila de 9V</h3>
            <p>Vcc=9V, Vf=2V, I=20mA → R=350Ω. Valor E12: 330Ω o 390Ω. Potencia: 140mW (usa ¼W o ½W).</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>💡</div>
            <h3>LED IR para mando a distancia</h3>
            <p>Vcc=5V, Vf=1,4V, I=100mA (pico) → R=36Ω. Usar transistor si la corriente supera los 40mA del GPIO.</p>
          </div>
        </div>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa si no pongo resistencia con un LED?</strong>
            <p className={styles.faqTip}>El LED se quemará en segundos al circular una corriente sin límite. La resistencia limitadora es imprescindible en cualquier circuito con LED.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo usar una resistencia de mayor valor que el calculado?</strong>
            <p className={styles.faqTip}>Sí, solo brillará menos. Es mejor quedarse por encima que por debajo para prolongar la vida del LED.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es la serie E12?</strong>
            <p className={styles.faqTip}>Es el conjunto de valores de resistencia comerciales más comunes: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82 (y sus múltiplos). Cubre toda la gama con tolerancia ±10%.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo sé la tensión directa (Vf) de mi LED?</strong>
            <p className={styles.faqTip}>Consulta el datasheet del fabricante. Como orientación: rojo/naranja/amarillo ≈ 2V, verde ≈ 2-2,5V, azul/blanco ≈ 3-3,5V.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué potencia de resistencia debo usar?</strong>
            <p className={styles.faqTip}>Elige una resistencia cuya potencia nominal sea al menos el doble de la calculada. Para uso general, las de ¼W (250mW) son suficientes para corrientes de hasta 20mA.</p>
          </div>
        </div>

        <div className={styles.stepGuide}>
          <h3>Cómo leer una resistencia de 4 bandas paso a paso</h3>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>Orienta la resistencia con la banda de tolerancia (dorado o plateado) a la derecha.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>Lee la banda 1 (primer dígito) y la banda 2 (segundo dígito): forman un número de 2 cifras.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>Lee la banda 3 (multiplicador): multiplica el número de 2 cifras por el factor de color.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>Lee la banda 4 (tolerancia): indica la precisión del valor ±%. Dorado = ±5%, plateado = ±10%.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>Verifica con un multímetro si tienes dudas sobre la lectura visual.</div>
          </div>
        </div>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔬</div>
            <h4>Usa un multímetro</h4>
            <p>Mide la resistencia directamente si tienes dudas. El multímetro en modo Ω es la referencia definitiva.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📦</div>
            <h4>Organiza por valor</h4>
            <p>Guarda las resistencias en cajas organizadas por valor. Un kit E12 completo cubre el 90% de las necesidades.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>⚡</div>
            <h4>Respeta la potencia</h4>
            <p>Una resistencia de ¼W en aplicaciones de ½W se calentará y fallará. Siempre deja margen de seguridad ×2.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎨</div>
            <h4>Daltonismo</h4>
            <p>Si tienes dificultades con ciertos colores, usa un multímetro o una app de lupa para contrastar mejor las bandas.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            Errores frecuentes al trabajar con resistencias y LEDs
          </div>
          <ul className={styles.warningList}>
            <li>Confundir el sentido de lectura de las bandas (leer de derecha a izquierda en vez de izquierda a derecha).</li>
            <li>Usar la tensión de una batería sin tener en cuenta la caída bajo carga real.</li>
            <li>Olvidar que los LEDs azules y blancos tienen Vf mucho mayor (~3,2V): no funcionan bien con 3,3V sin ajustar la corriente.</li>
            <li>Sobredimensionar la corriente ({'>'} 20mA) creyendo que el LED brillará más; solo acortará su vida útil.</li>
            <li>No verificar si el pin GPIO del microcontrolador puede suministrar la corriente calculada (máx. 40mA en la mayoría).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-resistencias-led')} />
      <ShareCard appName="calculadora-resistencias-led" />
      <Footer appName="calculadora-resistencias-led" />
    </div>
  );
}
