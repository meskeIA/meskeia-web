'use client';
// @disclaimer: exempt

import { useState } from 'react';
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
import {
  codificar,
  color,
  conUnidad,
  valorNormalizadoMasCercano,
} from '@/lib/calculadoras/codigoColoresResistencias';
import { PREGUNTAS_FRECUENTES } from './metadata';

const NBSP = ' ';

const LED_PRESETS = [
  { label: 'Rojo', vf: 2.0 },
  { label: 'Naranja', vf: 2.1 },
  { label: 'Amarillo', vf: 2.2 },
  { label: 'Verde', vf: 2.1 },
  { label: 'Azul', vf: 3.2 },
  { label: 'Blanco', vf: 3.2 },
  { label: 'IR', vf: 1.4 },
];

// Para la tabla de referencia: la resistencia de cada LED con 5 V y 20 mA, calculada con
// la misma fórmula que la herramienta (no escrita a mano).
const VCC_TABLA = 5;
const CORRIENTE_TABLA = 0.02;

function formatResistencia(ohmios: number): string {
  const u = conUnidad(ohmios);
  return `${formatNumber(u.valor, Math.min(u.decimales, 2))}${NBSP}${u.unidad}`;
}

interface ResultadoLed {
  r: number;
  potencia: number;
  rE12: number;
}

function calcularLed(vcc: number, vf: number, corriente: number): ResultadoLed | null {
  if (!(vcc > 0) || !(vf > 0) || !(corriente > 0) || vcc <= vf) return null;
  const r = (vcc - vf) / corriente;
  const e12 = valorNormalizadoMasCercano(r, 'E12');
  if (!e12) return null;
  return { r, potencia: (vcc - vf) * corriente, rE12: e12.ohmios };
}

export default function CalculadoraResistenciasLedPage() {
  const [vcc, setVcc] = useState('5');
  const [vled, setVled] = useState('2,0');
  const [iled, setIled] = useState('20');

  const vccNum = parseSpanishNumber(vcc);
  const vledNum = parseSpanishNumber(vled);
  const imA = parseSpanishNumber(iled);
  const resultadoLed = calcularLed(vccNum, vledNum, imA / 1000);
  const coloresE12 = resultadoLed ? codificar(resultadoLed.rE12, 4, 'dorado') : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💡</span> Calculadora de Resistencia para LED</h1>
        <p className={styles.subtitle}>
          Qué resistencia lleva tu LED: el valor exacto, el comercial más cercano con sus colores y la potencia que
          tiene que aguantar
        </p>
      </header>

      <LegalNotice />

      <div className={styles.card}>
        <h2 className={styles.cardTitle}><span aria-hidden="true">💡</span> Resistencia limitadora para LED</h2>
        <p className={styles.cardDesc}>
          Calcula la resistencia necesaria para limitar la corriente que pasa por tu LED usando la ley de Ohm.
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
            <div className={styles.inputHint}>Ejemplos: 3,3 V · 5 V · 9 V · 12 V</div>
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
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => setVled(formatNumber(p.vf, 1))}
                >
                  {`${p.label} (${formatNumber(p.vf, 1)} V)`}
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
          <div key="resultado" className={styles.resultadoLed}>
            <div className={styles.resultadoPrincipal}>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Resistencia exacta</div>
                <div className={styles.resultValorGrande}>{formatResistencia(resultadoLed.r)}</div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Valor E12 recomendado</div>
                <div className={`${styles.resultValorGrande} ${styles.resultValorE12}`}>
                  {formatResistencia(resultadoLed.rE12)}
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Potencia disipada</div>
                <div className={styles.resultValorGrande}>
                  {`${formatNumber(resultadoLed.potencia * 1000, 1)} mW`}
                </div>
              </div>
            </div>
            {coloresE12 && (
              <div className={styles.coloresE12}>
                <p className={styles.coloresTitulo}>
                  {`Colores de una de ${formatResistencia(resultadoLed.rE12)} ±5${NBSP}%:`}
                </p>
                <ul className={styles.listaColores}>
                  {coloresE12.claves.map((k, i) => (
                    <li key={`${i}-${k}`} className={styles.itemColor}>
                      <span className={styles.muestraColor} style={{ background: color(k).hex }} aria-hidden="true" />
                      <span>{color(k).nombre}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.enlaceCodigo}>
                  <a href="/codigo-colores-resistencias/">Leer o comprobar cualquier resistencia por sus colores</a>
                </p>
              </div>
            )}
            <div className={styles.formulaBox}>
              <strong>Fórmula:</strong>
              <span>
                {` R = (Vcc − Vf) / I = (${formatNumber(vccNum, 2)} − ${formatNumber(vledNum, 2)}) / ${formatNumber(imA / 1000, 3)} = ${formatResistencia(resultadoLed.r)}`}
              </span>
            </div>
            {resultadoLed.potencia >= 0.25 && (
              <div className={styles.alertaBox} role="alert">
                <span aria-hidden="true">⚠️</span>
                <span>
                  {` La potencia disipada (${formatNumber(resultadoLed.potencia * 1000, 0)} mW) supera los 250 mW típicos de una resistencia de ¼ W. Usa una resistencia de mayor potencia.`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div key="error" className={styles.errorBox} role="alert">
            Verifica los valores: la tensión de alimentación debe ser mayor que la tensión directa del LED.
          </div>
        )}
      </div>

      <EducationalSection title="Electrónica práctica: resistencias y LEDs" subtitle="Todo lo que necesitas saber para no quemar tus componentes">
        <div className={styles.guideSection}>
          <h2>Por qué un LED necesita resistencia</h2>
          <p>
            Un LED no se comporta como una bombilla: por debajo de su tensión directa apenas conduce, y en cuanto la
            supera la corriente se dispara. La resistencia en serie se queda con la tensión que sobra (Vcc − Vf) y, con
            ella, fija la corriente que pasa por el LED.
          </p>
          <p>
            Por eso el cálculo solo necesita tres datos: la tensión de la fuente, la tensión directa del LED, que
            depende sobre todo de su color, y la corriente que quieres que circule.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption className={styles.tablaCaption}>
              {`Resistencia de cada LED con ${formatNumber(VCC_TABLA, 0)} V y ${formatNumber(CORRIENTE_TABLA * 1000, 0)} mA`}
            </caption>
            <thead>
              <tr>
                <th>LED</th>
                <th>Vf típica</th>
                <th>Resistencia exacta</th>
                <th>Valor E12</th>
              </tr>
            </thead>
            <tbody>
              {LED_PRESETS.map(p => {
                const fila = calcularLed(VCC_TABLA, p.vf, CORRIENTE_TABLA);
                return (
                  <tr key={p.label}>
                    <td>{p.label}</td>
                    <td>{`${formatNumber(p.vf, 1)} V`}</td>
                    <td>{fila ? formatResistencia(fila.r) : '—'}</td>
                    <td>{fila ? formatResistencia(fila.rE12) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🔴</div>
            <h3>LED en Arduino (5 V)</h3>
            <p>Vcc = 5 V, Vf = 2 V, I = 20 mA → R = 150 Ω. Valor E12: 150 Ω, marrón-verde-marrón.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">💡</div>
            <h3>LED azul o blanco (3,3 V)</h3>
            <p>Vcc = 3,3 V, Vf = 3,2 V, I = 10 mA → R = 10 Ω. Margen mínimo: usa siempre al menos 33 Ω para proteger el LED.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🔋</div>
            <h3>LED en pila de 9 V</h3>
            <p>Vcc = 9 V, Vf = 2 V, I = 20 mA → R = 350 Ω. Valor E12: 330 Ω o 390 Ω. Potencia: 140 mW (usa ¼ W o ½ W).</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">💡</div>
            <h3>LED IR para mando a distancia</h3>
            <p>Vcc = 5 V, Vf = 1,4 V, I = 100 mA (pico) → R = 36 Ω. Usar transistor si la corriente supera los 40 mA del GPIO.</p>
          </div>
        </div>

        <div className={styles.faqList}>
          {PREGUNTAS_FRECUENTES.map(f => (
            <div key={f.question} className={styles.faqItem}>
              <h3 className={styles.faqPregunta}>{f.question}</h3>
              <p className={styles.faqTip}>{f.answer}</p>
            </div>
          ))}
        </div>

        <div className={styles.stepGuide}>
          <h3>Cómo calcular la resistencia de un LED paso a paso</h3>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>Anota la tensión de la fuente (Vcc): 5 V de un Arduino, 9 V de una pila, 12 V de un alimentador.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>Busca la tensión directa del LED (Vf) en su hoja de datos, o usa la típica de su color.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>Elige la corriente: 20 mA es lo habitual en un LED de 5 mm; 5-10 mA bastan como piloto.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>Divide la tensión que sobra entre la corriente en amperios: (5 − 2) / 0,02 = 150 Ω.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>Toma el valor comercial más cercano y comprueba que la potencia no pasa de la mitad de la que aguanta la resistencia.</div>
          </div>
        </div>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🔬</div>
            <h4>Usa un multímetro</h4>
            <p>Mide la resistencia antes de montarla si tienes dudas. El multímetro en modo Ω es la referencia definitiva.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">📦</div>
            <h4>Organiza por valor</h4>
            <p>Guarda las resistencias en cajas organizadas por valor. Un kit E12 completo cubre el 90 % de las necesidades.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">⚡</div>
            <h4>Respeta la potencia</h4>
            <p>Una resistencia de ¼ W en aplicaciones de ½ W se calentará y fallará. Siempre deja margen de seguridad ×2.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🎨</div>
            <h4>¿Qué resistencia es esta?</h4>
            <p>
              Para saber el valor de una resistencia suelta por sus bandas, usa el{' '}
              <a href="/codigo-colores-resistencias/">código de colores de resistencias</a>, que lee las de 3, 4, 5 y 6 bandas.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <span>Errores frecuentes al trabajar con resistencias y LEDs</span>
          </div>
          <ul className={styles.warningList}>
            <li>Conectar el LED al revés: la patilla larga (ánodo) va hacia el positivo.</li>
            <li>Usar la tensión de una batería sin tener en cuenta la caída bajo carga real.</li>
            <li>Olvidar que los LEDs azules y blancos tienen Vf mucho mayor (~3,2 V): no funcionan bien con 3,3 V sin ajustar la corriente.</li>
            <li>Sobredimensionar la corriente ({'>'} 20 mA) creyendo que el LED brillará más; solo acortará su vida útil.</li>
            <li>No verificar si el pin GPIO del microcontrolador puede suministrar la corriente calculada (máx. 40 mA en la mayoría).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="calculadora-resistencias-led" />
      <Footer appName="calculadora-resistencias-led" />
    </div>
  );
}
