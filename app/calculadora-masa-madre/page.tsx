'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraMasaMadre.module.css';
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
  calcularSustitucionMasaMadre,
  type TipoLevaduraOrigen,
} from '@/lib/calculadoras/cocina';

const TIPOS: { id: TipoLevaduraOrigen; label: string; emoji: string; descripcion: string }[] = [
  { id: 'fresca',      label: 'Levadura fresca',      emoji: '🧊', descripcion: 'Bloques refrigerados, textura húmeda' },
  { id: 'seca',        label: 'Levadura seca',         emoji: '🫙', descripcion: 'Gránulos, requiere activación previa' },
  { id: 'instantanea', label: 'Levadura instantánea',  emoji: '⚡', descripcion: 'Mezcla directa, sin activación' },
];

export default function CalculadoraMasaMadrePage() {
  const [tipoLevadura, setTipoLevadura] = useState<TipoLevaduraOrigen>('fresca');
  const [levaduraG, setLevaduraG] = useState<string>('10');
  const [hidratacion, setHidratacion] = useState<number>(100);

  const resultado = useCallback(() => {
    const g = parseFloat(levaduraG.replace(',', '.'));
    if (!g || g <= 0) return null;
    return calcularSustitucionMasaMadre(tipoLevadura, g, hidratacion);
  }, [tipoLevadura, levaduraG, hidratacion]);

  const res = resultado();

  function handleLevaduraChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLevaduraG(e.target.value);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🍞</span> Calculadora de Masa Madre</h1>
        <p className={styles.subtitle}>
          Sustituye la levadura comercial por masa madre en cualquier receta con ajuste automático de harina y agua
        </p>
      </header>

      <LegalNotice />

      <div className={styles.card}>
        <div className={styles.tipoLabel}>Tipo de levadura en tu receta original</div>
        <div className={styles.tipoGroup}>
          {TIPOS.map(t => (
            <button
              key={t.id}
              className={`${styles.tipoBtn} ${tipoLevadura === t.id ? styles.tipoBtnActivo : ''}`}
              onClick={() => setTipoLevadura(t.id)}
              aria-pressed={tipoLevadura === t.id}
            >
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <div className={styles.equivalenciasBox}>
          <strong>Equivalencias orientativas:</strong> 1 g levadura seca ≈ 1 g levadura instantánea ≈ 3 g levadura fresca ≈ 20 g de masa madre activa al 100% de hidratación.
          Estas equivalencias pueden variar según la fuerza del fermento y la temperatura.
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="levadura-g">
              Gramos de levadura en la receta
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="levadura-g"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={levaduraG}
                onChange={handleLevaduraChange}
                placeholder="10"
                aria-describedby="levadura-hint"
              />
              <span className={styles.inputSuffix}>g</span>
            </div>
            <div id="levadura-hint" className={styles.inputHint}>
              {tipoLevadura === 'fresca' && 'Pan casero típico: 5–15 g por 500 g harina'}
              {tipoLevadura === 'seca' && 'Pan casero típico: 1–5 g (un sobre ≈ 7 g)'}
              {tipoLevadura === 'instantanea' && 'Recetas pan: 1–5 g por 500 g harina'}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="hidratacion-mm">
              Hidratación de tu masa madre
            </label>
            <div className={styles.sliderWrapper}>
              <input
                id="hidratacion-mm"
                type="range"
                className={styles.slider}
                min={50}
                max={150}
                step={5}
                value={hidratacion}
                onChange={e => setHidratacion(Number(e.target.value))}
                aria-valuenow={hidratacion}
                aria-valuemin={50}
                aria-valuemax={150}
              />
              <span className={styles.sliderValue}>{hidratacion}%</span>
            </div>
            <div className={styles.inputHint}>
              La mayoría de masas madre caseras son al 100% (partes iguales de harina y agua)
            </div>
          </div>
        </div>

        {res && (
          <div className={styles.resultadoBox} role="status" aria-live="polite">
            <div className={styles.resultadoGrid}>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Masa madre a añadir</div>
                <div className={styles.resultValorGrande}>{res.masa_madre_g} <span className={styles.resultUnidad}>g</span></div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Hidratación aplicada</div>
                <div className={styles.resultValorGrande}>{res.hidratacion_mm_pct} <span className={styles.resultUnidad}>%</span></div>
              </div>
            </div>

            <div className={styles.resultadoAjustes}>
              <div className={styles.ajusteItem}>
                <span className={styles.ajusteLabel}>Harina a restar</span>
                <span className={styles.ajusteValor}>− {res.harina_restar_g} g</span>
              </div>
              <div className={styles.ajusteItem}>
                <span className={styles.ajusteLabel}>Agua a restar</span>
                <span className={styles.ajusteValor}>− {res.agua_restar_g} g</span>
              </div>
            </div>

            <div className={styles.notaBox}>
              💡 {res.nota}
            </div>

            <div className={styles.tiempoBox}>
              <span className={styles.tiempoIcon}>⏱️</span>
              <strong>Fermentación:</strong> {res.tiempo_fermentacion}
            </div>
          </div>
        )}

        {!res && (
          <div role="status" aria-live="polite" className={styles.equivalenciasBox}>
            Introduce los gramos de levadura de tu receta original para ver el resultado.
          </div>
        )}
      </div>

      <EducationalSection
        title="Todo sobre la masa madre y la sustitución de levadura"
        subtitle="Entiende el proceso y consigue mejores resultados en tus panes"
      >
        <div className={styles.guideSection}>
          <h2>¿Qué es la masa madre y por qué funciona como levadura?</h2>
          <p>
            La masa madre (también llamada fermento o sourdough starter) es una mezcla de harina y agua donde conviven levaduras silvestres y bacterias lácticas. Las levaduras producen CO₂ que hace subir el pan; las bacterias lácticas generan ácido láctico y acético que dan el sabor característico, ligeramente ácido.
          </p>
          <p>
            A diferencia de la levadura comercial (Saccharomyces cerevisiae pura), la masa madre tiene una actividad más lenta y variable, lo que se traduce en fermentaciones más largas pero panes con mejor sabor, mayor vida útil y miga más compleja.
          </p>
        </div>

        <div className={styles.guideSection}>
          <h2>Equivalencias entre tipos de levadura</h2>
          <p>
            La referencia habitual para convertir entre levaduras es: <strong>1 g levadura seca = 1 g levadura instantánea = 3 g levadura fresca = 20 g masa madre activa al 100%</strong>. Estas proporciones son orientativas y dependen de la fuerza de tu fermento (lo activo que esté) y la temperatura de trabajo.
          </p>
          <p>
            Un masa madre muy activa (duplica en 4-6h tras refrescar) puede necesitar menos cantidad. Una masa madre poco activa puede necesitar hasta el 25-30% del peso de harina para dar resultados similares.
          </p>
        </div>

        <div className={styles.guideSection}>
          <h2>¿Por qué hay que ajustar harina y agua al sustituir?</h2>
          <p>
            La masa madre no es solo levadura: está compuesta de harina y agua en una proporción determinada (su hidratación). Cuando añades 200 g de masa madre al 100% a tu receta, estás añadiendo 100 g de harina y 100 g de agua extra que no estaban en la receta original.
          </p>
          <p>
            Si no compensas restando esa harina y agua de los ingredientes de la receta, la masa quedará más húmeda de lo planeado y la hidratación final será diferente. La calculadora ya hace este ajuste automáticamente.
          </p>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🥖</div>
            <h3>Baguette con 2 g levadura seca</h3>
            <p>Con MM al 100%: añadir 40 g de masa madre, restar 20 g harina y 20 g agua. Fermentación lenta en nevera 12–16h.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🍕</div>
            <h3>Pizza con 5 g levadura fresca</h3>
            <p>Con MM al 100%: añadir 33 g de masa madre, restar 17 g harina y 16 g agua. Retardo en nevera 24–48h para más sabor.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🫓</div>
            <h3>Pan de molde con 7 g levadura seca</h3>
            <p>Con MM al 100%: añadir 140 g masa madre, restar 70 g harina y 70 g agua. Fermentación a temperatura ambiente: 4–6h.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🥐</div>
            <h3>Brioche con 10 g levadura fresca</h3>
            <p>Con MM al 100%: añadir 67 g masa madre. Considera que la grasa y el azúcar ralentizan la fermentación: puede necesitar más tiempo.</p>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>¿Cómo saber si tu masa madre está lista para usar?</h2>
          <p>
            La señal más fiable es el test del flotador: pon una cucharadita de masa madre en un vaso de agua fría. Si flota, está activa y lista para usarse. Otro indicador: debe haber duplicado o más de volumen entre 4 y 8 horas después de un refresco (alimentación).
          </p>
          <p>
            Para conseguir resultados consistentes, usa siempre la masa madre en su punto álgido de actividad: justo cuando alcanza su máximo volumen antes de empezar a caer.
          </p>
        </div>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿El pan con masa madre es más difícil?</strong>
            <p className={styles.faqTip}>La técnica es similar, pero los tiempos son más largos e impredecibles. El mayor reto es conocer tu propia masa madre: su fuerza varía con la temperatura y los refrescos.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué hidratación de masa madre debo usar?</strong>
            <p className={styles.faqTip}>La más habitual en casa es el 100% (partes iguales de harina y agua). Algunas recetas usan masa madre stiff al 60–70%, que fermenta más despacio y da menos acidez. Adapta la calculadora a tu fermento real.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo sustituir levadura por masa madre en cualquier receta?</strong>
            <p className={styles.faqTip}>En la mayoría de panes, sí. En masas enriquecidas (brioche, roscón, panettone) la conversión es más compleja porque el azúcar y la grasa cambian la fermentación. Empieza con panes básicos para coger soltura.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué mi masa madre con levadura fresca necesita menos gramos?</strong>
            <p className={styles.faqTip}>La levadura fresca ya es una mezcla de levadura y agua (tiene alto contenido en humedad), por eso su equivalencia con la seca es de 3:1. La calculadora tiene en cuenta este factor en todos los tipos.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué hago si no tengo suficiente masa madre?</strong>
            <p className={styles.faqTip}>Puedes mezclar masa madre con una pequeña cantidad de levadura comercial. En ese caso, reduce la levadura a un 20–25% de la original y añade la masa madre que tengas. La fermentación será más corta que con solo masa madre.</p>
          </div>
        </div>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🌡️</div>
            <h4>Controla la temperatura</h4>
            <p>A 24–26°C la fermentación va bien. Por encima de 30°C se acelera mucho y puede volverse demasiado ácida.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>⏰</div>
            <h4>Paciencia con los tiempos</h4>
            <p>El rango 4–8h de fermentación en bloque puede variar. Observa el volumen y la textura, no el reloj.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🍞</div>
            <h4>Refresca antes de usar</h4>
            <p>Alimenta tu masa madre 4–12h antes de usarla para que esté en su máximo de actividad.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🧪</div>
            <h4>Anota tus resultados</h4>
            <p>Cada masa madre es única. Lleva un registro de tiempos y temperaturas para ajustar en futuras panificaciones.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al sustituir levadura por masa madre
          </div>
          <ul className={styles.warningList}>
            <li>Usar la masa madre recién sacada de la nevera sin refrescar: fermentará muy lento o no fermentará.</li>
            <li>No restar la harina y el agua que aporta la masa madre: la masa quedará más hidratada de lo planeado.</li>
            <li>Calcular para una masa madre poco activa como si fuera muy activa: el pan no subirá bien.</li>
            <li>Aplicar los mismos tiempos que con levadura comercial: la masa madre necesita el doble o más de tiempo.</li>
            <li>No adaptar la hidratación al tipo de harina: las harinas integrales absorben más agua y pueden necesitar ajuste.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-masa-madre')} />
      <ShareCard appName="calculadora-masa-madre" />
      <Footer appName="calculadora-masa-madre" />
    </div>
  );
}
