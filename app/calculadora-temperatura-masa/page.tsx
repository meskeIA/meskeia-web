'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraTemperaturaMasa.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularDDT,
  type TipoAmasadora,
} from '@/lib/calculadoras/cocina';

interface AmasadoraOpcion {
  id: TipoAmasadora;
  label: string;
  icon: string;
  friccion: string;
}

const AMASADORAS: AmasadoraOpcion[] = [
  { id: 'manual',            label: 'Manual',      icon: '🙌', friccion: '0°C' },
  { id: 'kitchen_aid',       label: 'KitchenAid',  icon: '🔧', friccion: '8°C' },
  { id: 'amasadora_espiral', label: 'Espiral',     icon: '🌀', friccion: '5°C' },
  { id: 'thermomix',         label: 'Thermomix',   icon: '⚙️', friccion: '12°C' },
];

function getColorClass(tempC: number): string {
  if (tempC > 35) return styles.resultadoCaliente;
  if (tempC > 22) return styles.resultadoTibio;
  return styles.resultadoFrio;
}

function getTempEmoji(tempC: number): string {
  if (tempC < 0) return '🧊';
  if (tempC < 15) return '❄️';
  if (tempC < 25) return '💧';
  if (tempC <= 35) return '♨️';
  return '🔥';
}

export default function CalculadoraTemperaturaMasaPage() {
  const [ddtObjetivo, setDdtObjetivo] = useState<string>('24');
  const [tAmbiente, setTAmbiente] = useState<string>('22');
  const [tHarina, setTHarina] = useState<string>('');
  const [igualQueAmbiente, setIgualQueAmbiente] = useState<boolean>(true);
  const [amasadora, setAmasadora] = useState<TipoAmasadora>('manual');
  const [usaPreferment, setUsaPreferment] = useState<boolean>(false);
  const [tPreferment, setTPreferment] = useState<string>('20');

  const resultado = useCallback(() => {
    const ddt = parseFloat(ddtObjetivo.replace(',', '.'));
    const tam = parseFloat(tAmbiente.replace(',', '.'));
    if (isNaN(ddt) || isNaN(tam)) return null;
    const tHar = igualQueAmbiente ? tam : parseFloat(tHarina.replace(',', '.'));
    if (isNaN(tHar)) return null;
    const tPref = usaPreferment ? parseFloat(tPreferment.replace(',', '.')) : undefined;
    if (usaPreferment && (tPref === undefined || isNaN(tPref))) return null;
    return calcularDDT(ddt, tam, tHar, amasadora, tPref);
  }, [ddtObjetivo, tAmbiente, tHarina, igualQueAmbiente, amasadora, usaPreferment, tPreferment]);

  const res = resultado();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🌡️</span> Calculadora DDT para Pan</h1>
        <p className={styles.subtitle}>
          Calcula la temperatura exacta del agua para que tu masa llegue a la DDT ideal (Desired Dough Temperature)
        </p>
      </header>

      <LegalNotice />

      <div className={styles.card}>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="ddt-objetivo">
              DDT objetivo — temperatura final deseada de la masa
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="ddt-objetivo"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={ddtObjetivo}
                onChange={e => setDdtObjetivo(e.target.value)}
                placeholder="24"
                aria-describedby="ddt-hint"
              />
              <span className={styles.inputSuffix}>°C</span>
            </div>
            <div id="ddt-hint" className={styles.inputHint}>
              Rango habitual para pan: 23–26°C. Pan de centeno: 27–28°C.
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="t-ambiente">
              Temperatura ambiente (cocina)
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="t-ambiente"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={tAmbiente}
                onChange={e => setTAmbiente(e.target.value)}
                placeholder="22"
              />
              <span className={styles.inputSuffix}>°C</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="t-harina">
              Temperatura de la harina
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={igualQueAmbiente}
                onChange={e => setIgualQueAmbiente(e.target.checked)}
                aria-label="Igual que temperatura ambiente"
              />
              Igual que la temperatura ambiente
            </label>
            {!igualQueAmbiente && (
              <div className={styles.inputWrapper}>
                <input
                  id="t-harina"
                  type="text"
                  inputMode="decimal"
                  className={styles.inputField}
                  value={tHarina}
                  onChange={e => setTHarina(e.target.value)}
                  placeholder="22"
                  aria-describedby="harina-hint"
                />
                <span className={styles.inputSuffix}>°C</span>
              </div>
            )}
            <div id="harina-hint" className={styles.inputHint}>
              La harina almacenada en cocina suele estar a temperatura ambiente.
            </div>
          </div>
        </div>

        <div className={styles.amasadoraLabel}>Tipo de amasadora</div>
        <div className={styles.amasadoraGroup}>
          {AMASADORAS.map(a => (
            <button
              key={a.id}
              type="button"
              className={`${styles.amasadoraBtn} ${amasadora === a.id ? styles.amasadoraBtnActivo : ''}`}
              onClick={() => setAmasadora(a.id)}
              aria-pressed={amasadora === a.id}
              title={`Factor de fricción: +${a.friccion}`}
            >
              <span className={styles.amasadoraIcon} aria-hidden="true">{a.icon}</span>
              <span className={styles.amasadoraNombre}>{a.label}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>+{a.friccion}</span>
            </button>
          ))}
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>¿Usas preferment? (poolish, levain, biga)</span>
          <label className={styles.toggle} aria-label="Activar preferment">
            <input
              type="checkbox"
              checked={usaPreferment}
              onChange={e => setUsaPreferment(e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>

        {usaPreferment && (
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="t-preferment">
                Temperatura del preferment
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="t-preferment"
                  type="text"
                  inputMode="decimal"
                  className={styles.inputField}
                  value={tPreferment}
                  onChange={e => setTPreferment(e.target.value)}
                  placeholder="20"
                  aria-describedby="pref-hint"
                />
                <span className={styles.inputSuffix}>°C</span>
              </div>
              <div id="pref-hint" className={styles.inputHint}>
                Mide la temperatura de tu poolish, levain o biga antes de mezclar.
              </div>
            </div>
          </div>
        )}

        {res && (
          <>
            <div className={`${styles.resultadoBox} ${getColorClass(res.temperatura_agua_c)}`}>
              <div className={styles.resultadoTitulo}>Temperatura del agua necesaria</div>
              <div className={styles.resultadoTempC}>
                <span aria-hidden="true">{getTempEmoji(res.temperatura_agua_c)}</span> {res.temperatura_agua_c}°C
              </div>
              <div className={styles.resultadoTempF}>
                ({res.temperatura_agua_f}°F)
              </div>
              <div className={styles.resultadoInterpretacion}>
                {res.interpretacion}
              </div>
              {res.advertencia && (
                <div className={styles.advertenciaBox} role="alert">
                  <span aria-hidden="true">⚠️</span>
                  {res.advertencia}
                </div>
              )}
            </div>

            <div className={styles.detallesGrid}>
              <div className={styles.detalleItem}>
                <div className={styles.detalleLabel}>DDT objetivo</div>
                <div className={styles.detalleValor}>{res.ddt_objetivo_c}°C</div>
              </div>
              <div className={styles.detalleItem}>
                <div className={styles.detalleLabel}>Temperatura ambiente</div>
                <div className={styles.detalleValor}>{res.t_ambiente_c}°C</div>
              </div>
              <div className={styles.detalleItem}>
                <div className={styles.detalleLabel}>Temperatura harina</div>
                <div className={styles.detalleValor}>{res.t_harina_c}°C</div>
              </div>
              <div className={styles.detalleItem}>
                <div className={styles.detalleLabel}>Factor fricción</div>
                <div className={styles.detalleValor}>+{res.t_friccion_c}°C</div>
              </div>
              {usaPreferment && tPreferment && (
                <div className={styles.detalleItem}>
                  <div className={styles.detalleLabel}>Preferment</div>
                  <div className={styles.detalleValor}>{parseFloat(tPreferment.replace(',', '.'))}°C</div>
                </div>
              )}
            </div>
          </>
        )}

        {!res && (
          <div role="alert" aria-live="polite" style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Introduce la temperatura ambiente y el DDT objetivo para calcular la temperatura del agua.
          </div>
        )}
      </div>

      <EducationalSection
        title="📚 DDT: la técnica profesional de control de temperatura del pan"
        subtitle="Por qué los panaderos profesionales calculan la temperatura del agua antes de amasar"
      >
        <div className={styles.guideSection}>
          <h2>¿Qué es la DDT y por qué importa?</h2>
          <p>
            DDT (Desired Dough Temperature) es la temperatura final que quieres que tenga tu masa al terminar el amasado. La temperatura de la masa determina directamente la velocidad de fermentación: a mayor temperatura, las levaduras trabajan más rápido; a menor temperatura, más despacio.
          </p>
          <p>
            En panadería profesional, controlar la DDT permite reproducir resultados consistentes independientemente de la estación del año o la temperatura de la cocina. En verano (cocina a 28°C) necesitarás agua muy fría; en invierno (cocina a 16°C) agua tibia.
          </p>
        </div>

        <div className={styles.guideSection}>
          <h2>La fórmula DDT</h2>
          <p>La fórmula base para calcular la temperatura del agua (sin preferment) es:</p>
        </div>

        <div className={styles.formulaBox}>
          T_agua = DDT × 3 − T_ambiente − T_harina − T_fricción{'\n'}
          {'\n'}
          Con preferment (poolish, levain, biga):{'\n'}
          T_agua = DDT × 4 − T_ambiente − T_harina − T_fricción − T_preferment
        </div>

        <div className={styles.guideSection}>
          <p>
            El <strong>factor de fricción</strong> compensa el calor que genera el amasado mecánico. El amasado manual no genera calor significativo (0°C), mientras que una Thermomix puede calentar la masa hasta 12°C durante el proceso.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.tablaFriccion}>
            <thead>
              <tr>
                <th>Tipo de amasadora</th>
                <th>Factor de fricción</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🙌 Manual</td>
                <td>0°C</td>
                <td>El amasado a mano no calienta la masa de forma significativa</td>
              </tr>
              <tr>
                <td>🌀 Espiral profesional</td>
                <td>+5°C</td>
                <td>Menor fricción que las domésticas por su diseño de gancho lento</td>
              </tr>
              <tr>
                <td>🔧 KitchenAid / pie</td>
                <td>+8°C</td>
                <td>Gancho estándar doméstico a velocidad media</td>
              </tr>
              <tr>
                <td>⚙️ Thermomix</td>
                <td>+12°C</td>
                <td>Alta fricción por velocidad y resistencia del vaso</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.guideSection}>
          <h2>¿Cómo afecta la temperatura de la masa a la fermentación?</h2>
          <p>
            La fermentación de las levaduras sigue aproximadamente la <strong>regla de los 10°C</strong>: cada 10°C de aumento dobla la velocidad de fermentación (y cada 10°C de descenso la divide entre dos). En la práctica, pasar de 22°C a 27°C puede hacer que tu masa fermente un 40–50% más rápido.
          </p>
          <p>
            Una DDT de 23–25°C es el rango habitual para panes con masa madre o con levadura comercial a temperatura ambiente. DDT más bajas (18–21°C) se usan para fermentaciones largas en nevera; DDT más altas (27–28°C) para masas de centeno o en verano cuando se quiere acortar tiempos.
          </p>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">☀️</div>
            <h3>Verano — cocina a 28°C</h3>
            <p>DDT 24°C, KitchenAid: T_agua ≈ 40°C (agua tibia del grifo). Sin fricción: T_agua ≈ 16°C (frío del grifo). La amasadora importa mucho en verano.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">❄️</div>
            <h3>Invierno — cocina a 16°C</h3>
            <p>DDT 24°C, manual: T_agua ≈ 40°C. Las manos frías amasar en invierno puede bajar la DDT; usar agua algo más caliente como margen.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🥐</div>
            <h3>Poolish (preferment 20°C)</h3>
            <p>DDT 24°C, T_amb 22°C, KitchenAid: T_agua = 24×4 − 22 − 22 − 8 − 20 = 24°C. Con preferment la fórmula cambia a ×4.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🌾</div>
            <h3>Pan de centeno (DDT 28°C)</h3>
            <p>Las masas de centeno fermentan mejor a 27–28°C. Ajusta el DDT objetivo más alto y calcula con agua más caliente.</p>
          </div>
        </div>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Realmente necesito un termómetro para hacer pan?</strong>
            <p className={styles.faqTip}>Para pan casero esporádico no es imprescindible. Pero si quieres resultados consistentes y reproducibles, un termómetro de cocina de bajo coste (5–10€) es una de las mejores inversiones en panadería.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa si el agua sale demasiado caliente?</strong>
            <p className={styles.faqTip}>Por encima de 40°C empieza a debilitarse la levadura; por encima de 50°C puede morir. Si el cálculo te da más de 40°C, revisa que los inputs sean correctos o considera reducir la DDT objetivo.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿La temperatura del agua es lo único que puedo controlar?</strong>
            <p className={styles.faqTip}>También puedes refrigerar la harina en verano, usar hielo parcialmente, o amasar en nevera por fases. El agua es el factor más fácil de ajustar porque puedes mezclar agua fría y caliente con precisión.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué DDT uso si quiero fermentar en nevera?</strong>
            <p className={styles.faqTip}>Para retardo en frío (retardar la masa después de formar), usa una DDT normal de 24°C al mezclar. La nevera hará su trabajo independientemente de la temperatura de entrada de la masa.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿El preferment siempre cambia la fórmula?</strong>
            <p className={styles.faqTip}>Solo cuando el preferment supone una parte significativa de la masa final (típicamente más del 20% del peso total). En ese caso se usa la fórmula de 4 factores en lugar de 3.</p>
          </div>
        </div>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🌡️</div>
            <h4>Mide antes de amasar</h4>
            <p>Comprueba la temperatura del agua con el termómetro justo antes de añadirla. Un par de minutos esperando puede cambiar la lectura.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🧊</div>
            <h4>Agua fría en verano</h4>
            <p>En verano puedes necesitar agua de nevera (4–8°C). Si el cálculo da negativo, refrigera también la harina.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">📝</div>
            <h4>Lleva un registro</h4>
            <p>Anota la DDT obtenida y la temperatura real de la masa tras amasar. Con el tiempo afinarás los factores para tu cocina y amasadora específica.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">⚗️</div>
            <h4>Mezcla agua fría y caliente</h4>
            <p>La forma más fácil de conseguir una temperatura exacta es mezclar agua fría de nevera con agua caliente del grifo y medir con termómetro.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al calcular la DDT
          </div>
          <ul className={styles.warningList}>
            <li>Olvidar el factor de fricción de la amasadora: puede diferir hasta 12°C entre amasado manual y Thermomix.</li>
            <li>No medir la temperatura de la harina si está almacenada en un lugar frío o caliente (distinto de la cocina).</li>
            <li>Usar agua por encima de 45°C sin revisar: podría dañar o matar la levadura, especialmente la instantánea.</li>
            <li>Aplicar la fórmula de 3 factores cuando se usa preferment: en ese caso hay que usar la de 4 factores.</li>
            <li>No ajustar la DDT objetivo en verano: si la cocina está a 30°C y la DDT es 24°C, el agua necesaria puede ser irreal.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-temperatura-masa')} />
      <ShareCard appName="calculadora-temperatura-masa" />
      <Footer appName="calculadora-temperatura-masa" />
    </div>
  );
}
