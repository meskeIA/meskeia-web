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
import { formatNumber, parseSpanishNumber } from '@/lib';
import {
  calcularSustitucionMasaMadre,
  FERMENTACION_MM_REF,
  type TipoLevaduraOrigen,
} from '@/lib/calculadoras/cocina';
import {
  ajustarRangoFermentacion,
  formatearTiempo,
  TEMP_MODELO_MAX,
  TEMP_MODELO_MIN,
} from '@/lib/calculadoras/fermentacionTemperatura';

const TIPOS: { id: TipoLevaduraOrigen; label: string; emoji: string; descripcion: string }[] = [
  { id: 'fresca',      label: 'Levadura fresca',      emoji: '🧊', descripcion: 'Bloques refrigerados, textura húmeda' },
  { id: 'seca',        label: 'Levadura seca',         emoji: '🫙', descripcion: 'Gránulos, requiere activación previa' },
  { id: 'instantanea', label: 'Levadura instantánea',  emoji: '⚡', descripcion: 'Mezcla directa, sin activación' },
];

/** El nombre del tipo dentro de una frase, en minúscula y sin repetir la palabra «levadura». */
const ETIQUETA_LEVADURA: Record<TipoLevaduraOrigen, string> = {
  fresca: 'fresca',
  seca: 'seca',
  instantanea: 'instantánea',
};

/**
 * Gramos con decimal SOLO si lo tiene: «6,7 g» pero «21 g», no «21,0 g».
 *
 * Forzar el decimal daba cifras que nadie escribe en una receta, y además hacía ruido justo
 * donde importa —quien busca la equivalencia quiere leer el número de un vistazo—. Lo destapó
 * el test de la equivalencia antes de desplegarla.
 */
const gramosLegibles = (g: number): string =>
  formatNumber(g, Number.isInteger(g) ? 0 : 1);

export default function CalculadoraMasaMadrePage() {
  const [tipoLevadura, setTipoLevadura] = useState<TipoLevaduraOrigen>('fresca');
  const [levaduraG, setLevaduraG] = useState<string>('10');
  const [hidratacion, setHidratacion] = useState<number>(100);
  // Arranca en la temperatura de referencia de la horquilla: mientras nadie diga a qué
  // temperatura tiene la cocina, el ajuste debe ser neutro y mostrar el mismo 4-6 h que
  // declara la receta, no adivinar una cocina que no sabemos cómo está.
  const [tempMasa, setTempMasa] = useState<string>(String(FERMENTACION_MM_REF.tempRefC));

  const resultado = useCallback(() => {
    // `parseSpanishNumber`, el parser canónico del proyecto, no `parseFloat`: aquel colaba
    // entradas que no son números —«12abc» daba 240 g y «1e3» daba 20.000 g— y leía el millar
    // español mil veces más pequeño, así que «1.500» (mil quinientos) se convertía en 1,5 g
    // (hallazgo 290).
    const g = parseSpanishNumber(levaduraG);
    if (!Number.isFinite(g) || g <= 0) return null;
    return calcularSustitucionMasaMadre(tipoLevadura, g, hidratacion);
  }, [tipoLevadura, levaduraG, hidratacion]);

  const res = resultado();

  /**
   * La horquilla de fermentación a la temperatura que haya dicho el usuario.
   *
   * Hasta el 13/09/2026 esta app imprimía un «4–6 h» FIJO mientras su propio texto repetía
   * ocho veces que el tiempo lo manda la temperatura: era un número que no dependía de la
   * única variable que la app declaraba decisiva. El ajuste (Q10 ≈ 2) ya estaba escrito y
   * probado en el motor de `fermentacion-temperatura`, una app con 4 usos en 30 días frente
   * a los 103 de esta: la capacidad se trae a la puerta por la que entra la gente.
   *
   * `null` cuando la temperatura no es un número o cae fuera del rango del modelo. Ahí se
   * dice que no se puede estimar y NO se da cifra, que es lo contrario de estirar el Q10
   * hasta producir un número de aspecto convincente.
   */
  const tempC = parseSpanishNumber(tempMasa);
  const rango = ajustarRangoFermentacion(
    FERMENTACION_MM_REF.horasMin,
    FERMENTACION_MM_REF.horasMax,
    FERMENTACION_MM_REF.tempRefC,
    tempC,
  );

  /**
   * Cierto cuando la cantidad es positiva pero tan pequeña que la conversión se redondea a
   * cero. Presentar «Masa madre a añadir: 0 g» con sus restas de 0 g es dar por buena una
   * respuesta que no lo es (hallazgo 291).
   */
  const cantidadNoConvertible = res !== null && res.masa_madre_g <= 0;

  function handleLevaduraChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLevaduraG(e.target.value);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🍞</span> Masa madre y equivalencias de levadura</h1>
        <p className={styles.subtitle}>
          Pasa de levadura fresca a seca, o sustituye cualquiera de las dos por masa madre, con
          los gramos exactos y el ajuste de harina y agua que eso obliga a hacer en la receta
        </p>
      </header>

      <LegalNotice />

      <div className={styles.card}>
        <div className={styles.tipoLabel}>Tipo de levadura en tu receta original</div>
        <div className={styles.tipoGroup}>
          {TIPOS.map(t => (
            <button
              type="button"
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
          Si tu masa madre está a otra hidratación, la cantidad cambia para que la <strong>harina
          prefermentada</strong> sea la misma —es donde vive el fermento—: al 50% hacen falta 15 g
          por cada 1 g de levadura seca, y al 150%, 25 g.
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

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="temp-masa">
              Temperatura de tu cocina o masa
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="temp-masa"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={tempMasa}
                onChange={e => setTempMasa(e.target.value)}
                placeholder="24"
                aria-describedby="temp-hint"
              />
              <span className={styles.inputSuffix}>°C</span>
            </div>
            <div id="temp-hint" className={styles.inputHint}>
              La horquilla de abajo está medida a {FERMENTACION_MM_REF.tempRefC} °C: en una
              cocina más fría la masa tarda más y en una más cálida, menos
            </div>
          </div>
        </div>

        {cantidadNoConvertible && (
          <div role="alert" className={styles.equivalenciasBox}>
            Esa cantidad es demasiado pequeña para convertirla: la masa madre equivalente no
            llega ni a un gramo. Prueba con la cantidad total de la receta.
          </div>
        )}

        {res && !cantidadNoConvertible && (
          <div className={styles.resultadoBox} role="status" aria-live="polite">
            <div className={styles.resultadoGrid}>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Masa madre a añadir</div>
                {/* Por `formatNumber`, no crudo: a partir de cuatro cifras faltaba el
                    separador de millar y salía «10000 g» donde toca «10.000 g»
                    (hallazgo 289, formato español obligatorio del CLAUDE.md §2). */}
                <div className={styles.resultValorGrande}>{formatNumber(res.masa_madre_g, 0)} <span className={styles.resultUnidad}>g</span></div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Hidratación aplicada</div>
                <div className={styles.resultValorGrande}>{formatNumber(res.hidratacion_mm_pct, 0)} <span className={styles.resultUnidad}>%</span></div>
              </div>
            </div>

            <div className={styles.resultadoAjustes}>
              <div className={styles.ajusteItem}>
                <span className={styles.ajusteLabel}>Harina a restar</span>
                <span className={styles.ajusteValor}>− {formatNumber(res.harina_restar_g, 0)} g</span>
              </div>
              <div className={styles.ajusteItem}>
                <span className={styles.ajusteLabel}>Agua a restar</span>
                <span className={styles.ajusteValor}>− {formatNumber(res.agua_restar_g, 0)} g</span>
              </div>
            </div>

            {/* La conversión ENTRE LEVADURAS, que el motor ya hacía como paso intermedio y la
                app solo enseñaba como regla escrita más arriba. Se calcula desde el
                14/09/2026: era la pregunta que más gente traía a esta página —«20 gramos de
                levadura fresca a seca» y variantes, 465 impresiones en 90 días y cero clics—
                y la app la respondía con una tabla que había que aplicar a mano. */}
            <div className={styles.equivalenciaLevaduras}>
              <h2 className={styles.equivalenciaTitulo}>
                Y si prefieres cambiar de levadura en vez de pasar a masa madre
              </h2>
              <p className={styles.equivalenciaFrase}>
                Tus <strong>{gramosLegibles(res.levadura_original_g)} g
                de levadura {ETIQUETA_LEVADURA[res.levadura_original_tipo]}</strong> equivalen a:
              </p>
              <ul className={styles.equivalenciaLista}>
                {res.levadura_original_tipo !== 'fresca' && (
                  <li>
                    <strong>{gramosLegibles(res.levadura_fresca_equivalente_g)} g</strong> de
                    levadura fresca <span className={styles.equivalenciaNota}>(el taco refrigerado; se desmenuza en el líquido)</span>
                  </li>
                )}
                {res.levadura_original_tipo !== 'seca' && (
                  <li>
                    <strong>{gramosLegibles(res.levadura_seca_equivalente_g)} g</strong> de
                    levadura seca <span className={styles.equivalenciaNota}>(un sobre son unos 7 g; se hidrata antes de usarla)</span>
                  </li>
                )}
                {res.levadura_original_tipo !== 'instantanea' && (
                  <li>
                    <strong>{gramosLegibles(res.levadura_seca_equivalente_g)} g</strong> de
                    levadura instantánea <span className={styles.equivalenciaNota}>(la misma dosis que la seca; va directa a la harina)</span>
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.notaBox}>
              <span aria-hidden="true">💡</span> {res.nota}
            </div>

            <div className={styles.tiempoBox}>
              <span className={styles.tiempoIcon} aria-hidden="true">⏱️</span>
              {rango ? (
                <>
                  <strong>Fermentación en bloque a {formatNumber(tempC, 0)} °C:</strong>{' '}
                  {formatearTiempo(rango.horasMin)} – {formatearTiempo(rango.horasMax)}
                  {rango.factor !== 1 && (
                    <> (×{formatNumber(rango.factor, 2)} sobre las{' '}
                    {FERMENTACION_MM_REF.horasMin}–{FERMENTACION_MM_REF.horasMax} h de
                    referencia a {FERMENTACION_MM_REF.tempRefC} °C)</>
                  )}
                  . Después, 1–2 h en frío. Es una estimación con masa madre activa: guíate
                  por el volumen de la masa, no solo por el reloj.
                </>
              ) : (
                <>
                  <strong>Fermentación:</strong> no se puede estimar el tiempo a esa
                  temperatura. La regla que usa esta calculadora (la actividad de la levadura
                  se duplica por cada +10 °C) solo vale entre {TEMP_MODELO_MIN} y{' '}
                  {TEMP_MODELO_MAX} °C: por debajo el fermento queda casi parado y por encima
                  se estresa y aparecen sabores ácidos.
                </>
              )}
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
            <div className={styles.escenarioIcon} aria-hidden="true">🥖</div>
            <h3>Baguette con 2 g levadura seca</h3>
            <p>Con MM al 100%: añadir 40 g de masa madre, restar 20 g harina y 20 g agua. Fermentación lenta en nevera 12–16h.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🍕</div>
            <h3>Pizza con 5 g levadura fresca</h3>
            <p>Con MM al 100%: añadir 33 g de masa madre, restar 17 g harina y 16 g agua. Retardo en nevera 24–48h para más sabor.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🫓</div>
            <h3>Pan de molde con 7 g levadura seca</h3>
            <p>Con MM al 100%: añadir 140 g masa madre, restar 70 g harina y 70 g agua. Fermentación a temperatura ambiente: 4–6h.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🥐</div>
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
            <div className={styles.tipIcon} aria-hidden="true">🌡️</div>
            <h4>Controla la temperatura</h4>
            <p>A 24–26°C la fermentación va bien. Por encima de 30°C se acelera mucho y puede volverse demasiado ácida.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">⏰</div>
            <h4>Paciencia con los tiempos</h4>
            <p>El rango 4–8h de fermentación en bloque puede variar. Observa el volumen y la textura, no el reloj.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🍞</div>
            <h4>Refresca antes de usar</h4>
            <p>Alimenta tu masa madre 4–12h antes de usarla para que esté en su máximo de actividad.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🧪</div>
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
