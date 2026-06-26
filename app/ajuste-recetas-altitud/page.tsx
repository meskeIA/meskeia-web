'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './AjusteRecetasAltitud.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  CIUDADES,
  puntoEbullicion,
  ajustarPorAltitud,
  ALTITUD_META,
} from '@/lib/calculadoras/altitudCocina';
import { formatNumber } from '@/lib/formatters';

export default function AjusteRecetasAltitudPage() {
  const [altitud, setAltitud] = useState('2240'); // Ciudad de México por defecto

  const altitudNum = Math.max(0, parseFloat(altitud.replace(',', '.')) || 0);

  // Ciudad seleccionada en el desplegable (coincidencia exacta de altitud).
  const ciudadActual = useMemo(
    () => CIUDADES.find((c) => c.altitud === altitudNum)?.nombre ?? 'manual',
    [altitudNum],
  );

  const tbAgua = useMemo(() => puntoEbullicion(altitudNum), [altitudNum]);
  const ajuste = useMemo(() => ajustarPorAltitud(altitudNum), [altitudNum]);

  const handleCiudad = (nombre: string) => {
    if (nombre === 'manual') return;
    const ciudad = CIUDADES.find((c) => c.nombre === nombre);
    if (ciudad) setAltitud(String(ciudad.altitud));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Ajuste de recetas por altitud</h1>
        <p className={styles.subtitle}>
          En altura el agua hierve más fría y las masas se desinflan. Adapta tu receta de
          nivel del mar a la altitud a la que cocinas
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Tu altitud">
          <div className={styles.filaEntrada}>
            <div className={styles.campo}>
              <label htmlFor="ciudad" className={styles.label}>
                Tu ciudad
              </label>
              <select
                id="ciudad"
                className={styles.select}
                value={ciudadActual}
                onChange={(e) => handleCiudad(e.target.value)}
              >
                {ciudadActual === 'manual' && (
                  <option value="manual">Altitud personalizada</option>
                )}
                {CIUDADES.map((c) => (
                  <option key={c.nombre} value={c.nombre}>
                    {c.nombre}
                    {c.pais !== '—' ? ` (${c.pais})` : ''} · {formatNumber(c.altitud, 0)} m
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.campo}>
              <label htmlFor="altitud" className={styles.label}>
                Altitud (metros)
              </label>
              <input
                id="altitud"
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={altitud}
                onChange={(e) => setAltitud(e.target.value)}
                placeholder="2240"
              />
            </div>
          </div>
        </section>

        {/* Punto de ebullición */}
        <section className={styles.resultadoEbullicion} aria-live="polite">
          <span className={styles.ebullicionIcon} aria-hidden="true">🌡️</span>
          <div>
            <span className={styles.ebullicionValor}>{formatNumber(tbAgua, 1)} °C</span>
            <span className={styles.ebullicionTexto}>
              hierve el agua a {formatNumber(altitudNum, 0)} m
              {altitudNum > 0 && (
                <> · {formatNumber(100 - tbAgua, 1)} °C menos que al nivel del mar</>
              )}
            </span>
          </div>
        </section>

        {/* Ajustes */}
        <section className={styles.ajustesSection} aria-labelledby="ajustes-titulo">
          <h2 id="ajustes-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">🧁</span> Repostería con leudante
          </h2>
          <p className={styles.bandaEtiqueta}>{ajuste.banda}</p>

          {ajuste.significativo ? (
            <div className={styles.chipsGrid}>
              <div className={styles.chip}>
                <span className={styles.chipValor}>+{ajuste.hornoMasC} °C</span>
                <span className={styles.chipLabel}>temperatura del horno</span>
              </div>
              <div className={styles.chip}>
                <span className={styles.chipValor}>−{ajuste.leudanteReduccionPct}%</span>
                <span className={styles.chipLabel}>polvo de hornear / bicarbonato</span>
              </div>
              <div className={styles.chip}>
                <span className={styles.chipValor}>+{ajuste.liquidoMasMlPorTaza} ml</span>
                <span className={styles.chipLabel}>líquido por cada taza (240 ml)</span>
              </div>
              <div className={styles.chip}>
                <span className={styles.chipValor}>−{ajuste.azucarMenosGPorTaza} g</span>
                <span className={styles.chipLabel}>azúcar por cada taza (200 g)</span>
              </div>
              {ajuste.harinaMasGPorTaza > 0 && (
                <div className={styles.chip}>
                  <span className={styles.chipValor}>+{ajuste.harinaMasGPorTaza} g</span>
                  <span className={styles.chipLabel}>harina por cada taza (120 g)</span>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.sinAjustes}>{ajuste.resumen}</p>
          )}
        </section>

        {/* Notas pan y cocción */}
        <div className={styles.notasGrid}>
          <section className={styles.notaCard}>
            <h3 className={styles.notaTitulo}>
              <span aria-hidden="true">🍞</span> Pan y masas con levadura
            </h3>
            <p className={styles.notaTexto}>{ajuste.levaduraNota}</p>
          </section>
          <section className={styles.notaCard}>
            <h3 className={styles.notaTitulo}>
              <span aria-hidden="true">🍲</span> Cocción en agua
            </h3>
            <p className={styles.notaTexto}>{ajuste.coccionAguaNota}</p>
            {ajuste.ollaPresion && (
              <p className={styles.notaDestacada}>
                <span aria-hidden="true">♨️</span> Olla a presión muy recomendable
              </p>
            )}
          </section>
        </div>

        <p className={styles.fuenteNota}>
          Punto de ebullición: aproximación Tb ≈ 100 − altitud/285. Ajustes de horneado según{' '}
          {ALTITUD_META.fuente}. Son orientativos: la masa manda, ajusta a ojo según el resultado.
          Verificado {ALTITUD_META.verificado}.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Cocinar en altura, explicado"
          subtitle="Por qué cambia todo en altitud y cómo adaptar repostería, pan y guisos"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Qué pasa con la comida en altura</h2>
              <p>
                A mayor altitud, menor presión atmosférica. Eso tiene dos consecuencias en la
                cocina. Primera: el agua hierve a menos temperatura (a 2500 m ronda los 92 °C en
                vez de 100 °C), así que todo lo que se cuece en agua —legumbres, huevos, pasta,
                verduras— tarda más en hacerse, porque el agua está más fría. Segunda: los gases
                se expanden con más facilidad, de modo que las masas con leudante o levadura suben
                más rápido y más alto, y se desinflan si la estructura no se ha fijado a tiempo.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>El agua según la altitud</h2>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Lugar</th>
                    <th scope="col">Altitud</th>
                    <th scope="col">Hierve a</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Nivel del mar</td><td>0 m</td><td>100 °C</td></tr>
                  <tr><td>Ciudad de México</td><td>2240 m</td><td>≈ 92 °C</td></tr>
                  <tr><td>Bogotá</td><td>2640 m</td><td>≈ 91 °C</td></tr>
                  <tr><td>Quito</td><td>2850 m</td><td>≈ 90 °C</td></tr>
                  <tr><td>La Paz</td><td>3640 m</td><td>≈ 87 °C</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Cómo adaptar según lo que cocines</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🎂</span>
                    <strong>Bizcochos y magdalenas</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Es lo que más sufre. Reduce el leudante, sube algo el horno para que la miga
                    cuaje antes y refuerza con un poco de harina para que aguante la subida.
                  </p>
                  <p className={styles.escenarioTip}>Llena los moldes solo hasta la mitad.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥖</span>
                    <strong>Pan y masas fermentadas</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Fermentan más rápido. Usa menos levadura, vigila el volumen en vez del reloj y
                    haz un plegado extra para que la masa no se sobrefermente.
                  </p>
                  <p className={styles.escenarioTip}>La masa manda, no el cronómetro.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🫘</span>
                    <strong>Legumbres y guisos</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    El agua hierve más fría, así que los garbanzos o las lentejas pueden tardar el
                    doble. La olla a presión es la mejor aliada por encima de los 2000 m.
                  </p>
                  <p className={styles.escenarioTip}>Remojar la víspera ayuda aún más.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍝</span>
                    <strong>Pasta, arroz y huevos</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Cuecen a menor temperatura, así que necesitan un poco más de tiempo. Tapa la
                    olla para no perder calor y guíate por el punto, no por los minutos del paquete.
                  </p>
                  <p className={styles.escenarioTip}>Prueba antes de escurrir.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes al cocinar en altura</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>No tocar el leudante.</strong> Es la causa número uno de bizcochos
                  hundidos: la misma cantidad que a nivel del mar sube demasiado y colapsa.
                </li>
                <li>
                  <strong>Fiarse del tiempo de fermentación de la receta.</strong> En altura la
                  masa sube antes; si esperas el tiempo escrito, se sobrefermenta.
                </li>
                <li>
                  <strong>Esperar que las legumbres se hagan en el tiempo de siempre.</strong> Con
                  el agua a 90 °C tardan mucho más; sin olla a presión pueden quedar duras.
                </li>
                <li>
                  <strong>Llenar los moldes hasta arriba.</strong> Como la masa sube más, rebosa.
                  Llénalos hasta la mitad o dos tercios.
                </li>
                <li>
                  <strong>Aplicar todos los ajustes a la vez sin probar.</strong> Cambia de uno en
                  uno y anota qué funciona: cada receta y cada horno reaccionan distinto.
                </li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('ajuste-recetas-altitud')} />
      <ShareCard appName="ajuste-recetas-altitud" />
      <Footer appName="ajuste-recetas-altitud" />
    </div>
  );
}
