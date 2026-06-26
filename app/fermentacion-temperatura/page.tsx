'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './FermentacionTemperatura.module.css';
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
  ajustarFermentacion,
  formatearTiempo,
  TEMPERATURAS_REFERENCIA,
} from '@/lib/calculadoras/fermentacionTemperatura';
import { formatNumber } from '@/lib/formatters';

export default function FermentacionTemperaturaPage() {
  const [tiempoRef, setTiempoRef] = useState('3');
  const [tempRef, setTempRef] = useState('24');
  const [tempActual, setTempActual] = useState('20');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const resultado = useMemo(
    () => ajustarFermentacion(num(tiempoRef), num(tempRef), num(tempActual)),
    [tiempoRef, tempRef, tempActual],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tiempo de fermentación según la temperatura</h1>
        <p className={styles.subtitle}>
          Tu masa fermenta más rápido en verano y más lento en invierno: calcula el tiempo real
          de levado a la temperatura de tu masa
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora de fermentación">
          <p className={styles.instruccion}>
            Introduce el tiempo y la temperatura que indica tu receta, y la temperatura real de tu
            masa o ambiente:
          </p>
          <div className={styles.paramsGrid}>
            <div className={styles.campo}>
              <label htmlFor="tiempoRef" className={styles.label}>Tiempo de la receta (horas)</label>
              <input id="tiempoRef" type="text" inputMode="decimal" className={styles.input}
                value={tiempoRef} onChange={(e) => setTiempoRef(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="tempRef" className={styles.label}>Temperatura de la receta (°C)</label>
              <input id="tempRef" type="text" inputMode="decimal" className={styles.input}
                value={tempRef} onChange={(e) => setTempRef(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="tempActual" className={styles.label}>Temperatura de tu masa (°C)</label>
              <input id="tempActual" type="text" inputMode="decimal" className={styles.input}
                value={tempActual} onChange={(e) => setTempActual(e.target.value)} />
            </div>
          </div>

          {resultado ? (
            <div className={styles.resultado} role="status" aria-live="polite">
              <span className={styles.resultadoValor}>{formatearTiempo(resultado.tiempoHoras)}</span>
              <span className={styles.resultadoTexto}>
                fermentación estimada a {formatNumber(num(tempActual), 0)} °C ·{' '}
                {resultado.masRapido ? 'más rápido' : 'más lento'} que la receta
                {' '}(×{formatNumber(resultado.factor, 2)})
              </span>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce un tiempo de receta válido.</p>
          )}
        </section>

        {/* Tabla de referencia */}
        <section className={styles.refSection} aria-labelledby="ref-titulo">
          <h2 id="ref-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">🌡️</span> Temperaturas de fermentación
          </h2>
          <div className={styles.refLista}>
            {TEMPERATURAS_REFERENCIA.map((t) => (
              <div key={t.tempC} className={styles.refItem}>
                <span className={styles.refTemp}>{t.tempC} °C</span>
                <div>
                  <span className={styles.refEtiqueta}>{t.etiqueta}</span>
                  <span className={styles.refNota}>{t.nota}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className={styles.fuenteNota}>
          Aproximación basada en que la actividad de la levadura se duplica por cada +10 °C (regla
          Q10 ≈ 2). Es una guía: el sabor del fermento y la fuerza de la levadura también influyen.
          Fíjate siempre en el volumen de la masa, no solo en el reloj.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="La temperatura manda en la fermentación"
          subtitle="Por qué el calor acelera el levado y cómo usarlo a tu favor"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El reloj engaña, la temperatura no</h2>
              <p>
                Muchas recetas dicen «deja fermentar 2 horas», pero ese tiempo solo es cierto a la
                temperatura a la que lo midió quien escribió la receta. La levadura es un ser vivo:
                cuanto más calor, más rápido trabaja. Como regla práctica, su velocidad se duplica
                por cada 10 °C de aumento, así que el tiempo de fermentación se reduce a la mitad. Por
                eso la misma masa que tarda 3 horas en una cocina a 20 °C puede estar lista en hora y
                media a 30 °C, y al revés en invierno. Guiarte por la temperatura —y por el volumen
                de la masa— es mucho más fiable que seguir el reloj a ciegas.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Frío para sabor, calor para rapidez</h2>
              <p>
                La fermentación lenta en frío (la nevera, a unos 4 °C) no es solo una forma de ganar
                tiempo: desarrolla aromas y sabores que una fermentación rápida no consigue, y hace
                el pan más digestivo. Por eso muchos panaderos hacen un «retardo en frío» de toda la
                noche o varios días. El calor, en cambio, sirve cuando tienes prisa, pero pasado de
                vueltas (por encima de 32 °C) estresa la levadura y aporta sabores ácidos. El punto
                ideal para el día a día está entre 24 y 27 °C.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Cómo ajustar en cada estación</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">☀️</span>
                    <strong>Verano</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    La masa vuela. Usa agua más fría al amasar, reduce la levadura y vigila la masa
                    antes del tiempo de la receta para que no se sobrefermente.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">❄️</span>
                    <strong>Invierno</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Todo se ralentiza. Busca un sitio templado (el horno apagado con la luz
                    encendida) o asume que tardará bastante más que en la receta.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🌙</span>
                    <strong>Levado de noche</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Mete la masa en la nevera y olvídate hasta el día siguiente. Fermenta despacio y
                    ganarás sabor sin estar pendiente.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍕</span>
                    <strong>Masa de pizza</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Con poca levadura y 24-48 h en frío, la masa gana digestibilidad y sabor. Sácala
                    un rato antes de estirar para que se atempere.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes con la fermentación</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Seguir el reloj a ciegas.</strong> Si tu cocina está más fría o más caliente que la receta, el tiempo cambia mucho; mira la masa.</li>
                <li><strong>Buscar sitios demasiado calientes.</strong> Encima del radiador o al sol, la masa se pasa y coge sabor avinagrado.</li>
                <li><strong>No tapar la masa.</strong> Sin cubrir, se forma una costra seca que impide que crezca bien.</li>
                <li><strong>Sobrefermentar.</strong> Una masa pasada de fermentación se desinfla, pierde fuerza y sabe ácida; mejor quedarse algo corto.</li>
                <li><strong>Hornear la masa fría sin atemperar.</strong> Tras la nevera, deja que la masa coja temperatura para que arranque bien en el horno.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('fermentacion-temperatura')} />
      <ShareCard appName="fermentacion-temperatura" />
      <Footer appName="fermentacion-temperatura" />
    </div>
  );
}
