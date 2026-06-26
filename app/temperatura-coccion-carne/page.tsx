'use client';

import { useState } from 'react';
import styles from './TemperaturaCoccionCarne.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import {
  ALIMENTOS_COCCION,
  ALIMENTO_COCCION_POR_ID,
  COCCION_META,
} from '@/lib/calculadoras/coccionCarne';

export default function TemperaturaCoccionCarnePage() {
  const [alimentoId, setAlimentoId] = useState('vacuno');
  const alimento = ALIMENTO_COCCION_POR_ID[alimentoId];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Temperatura interna de cocción</h1>
        <p className={styles.subtitle}>
          El punto exacto de la carne y el pescado, y la temperatura mínima segura para evitar
          riesgos. En °C y °F
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Alimento">
          <h2 className={styles.seccionTitulo}>Elige el alimento</h2>
          <div className={styles.alimentosGrid} role="group" aria-label="Alimento">
            {ALIMENTOS_COCCION.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={alimentoId === a.id}
                className={`${styles.alimentoBtn} ${alimentoId === a.id ? styles.alimentoBtnActivo : ''}`}
                onClick={() => setAlimentoId(a.id)}
              >
                <span className={styles.alimentoEmoji} aria-hidden="true">{a.emoji}</span>
                <span className={styles.alimentoNombre}>{a.nombre}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mínimo seguro */}
        <section className={styles.seguroBox} aria-live="polite">
          <span className={styles.seguroIcon} aria-hidden="true">✅</span>
          <div>
            <span className={styles.seguroValor}>
              {alimento.minSeguroC} °C / {alimento.minSeguroF} °F
            </span>
            <span className={styles.seguroTexto}>
              temperatura mínima segura (USDA)
              {alimento.reposoMin > 0 && <> · reposo de {alimento.reposoMin} min</>}
            </span>
          </div>
        </section>

        {/* Puntos de cocción */}
        <section className={styles.puntosSection} aria-labelledby="puntos-titulo">
          <h2 id="puntos-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">{alimento.emoji}</span> Puntos de cocción
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Punto</th>
                  <th scope="col">°C</th>
                  <th scope="col">°F</th>
                  <th scope="col">Cómo queda</th>
                </tr>
              </thead>
              <tbody>
                {alimento.puntos.map((p) => (
                  <tr key={p.nombre} className={!p.seguro ? styles.filaNoSegura : ''}>
                    <td className={styles.celPunto}>
                      {p.nombre}
                      {!p.seguro && <span className={styles.badgeRiesgo} title="Por debajo del mínimo seguro"> ⚠</span>}
                    </td>
                    <td className={styles.celTemp}>{p.tempC} °C</td>
                    <td>{p.tempF} °F</td>
                    <td>{p.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {alimento.avisoCrudo && (
            <p className={styles.avisoCrudo}>
              <span aria-hidden="true">⚠️</span> {alimento.avisoCrudo}
            </p>
          )}
        </section>

        <p className={styles.fuenteNota}>
          Mínimos seguros: {COCCION_META.fuente}. Verificado {COCCION_META.verificado}. Mide siempre
          con termómetro de cocina en la parte más gruesa, sin tocar el hueso.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Cómo medir el punto de la carne"
          subtitle="Temperatura interna, seguridad alimentaria y por qué el termómetro no falla"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El punto de la carne es una temperatura, no un tiempo</h2>
              <p>
                El grado de cocción de una carne depende de la temperatura que alcanza su interior,
                no de los minutos que pasa en el fuego: eso varía según el grosor, la temperatura de
                partida y la fuente de calor. Por eso el termómetro de cocina es la herramienta más
                fiable. Se mide en la parte más gruesa de la pieza, sin tocar el hueso, y se compara
                con la tabla. Además de acertar el punto, sirve para algo más importante: asegurarte
                de que la carne ha superado la temperatura mínima segura.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Seguridad: por qué hay un mínimo</h2>
              <p>
                Cocinar elimina los patógenos que pueden causar intoxicaciones, pero solo si la
                carne alcanza una temperatura suficiente durante el tiempo necesario. El USDA marca
                un mínimo seguro para cada tipo: 63 °C en piezas enteras de vacuno, cerdo y pescado
                (con reposo), 71 °C en carne picada y 74 °C en aves. Las personas más vulnerables
                —embarazadas, bebés, mayores y personas inmunodeprimidas— deben respetar siempre el
                mínimo y evitar los puntos poco hechos.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>No todas las carnes son iguales</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥩</span>
                    <strong>Filete entero</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Si está sellado por fuera, el interior está más protegido, por eso se admiten
                    puntos poco hechos en piezas de calidad. Aun así, hay cierto riesgo.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍔</span>
                    <strong>Carne picada</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Al picarla, los microorganismos de la superficie se reparten por dentro. Debe
                    cocinarse entera al mínimo seguro: nada de hamburguesas crudas por dentro.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍗</span>
                    <strong>Aves</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Siempre a 74 °C. El jugo debe salir transparente y no quedar zonas rosadas junto
                    al hueso. No hay término medio aceptable.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🐟</span>
                    <strong>Pescado</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Hecho a 63 °C, se desmiga con facilidad. Para crudo o jugoso (sushi, tataki), usa
                    pescado muy fresco y previamente congelado para prevenir el anisakis.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes al medir el punto</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Fiarse del color.</strong> El color engaña: la carne puede verse hecha y no haber alcanzado la temperatura segura, o al revés.</li>
                <li><strong>Medir tocando el hueso.</strong> El hueso conduce el calor distinto; mide en la parte carnosa más gruesa.</li>
                <li><strong>No contar la cocción residual.</strong> La temperatura sigue subiendo unos grados durante el reposo; retira la pieza un poco antes.</li>
                <li><strong>Reutilizar la tabla o el cuchillo del crudo.</strong> Lo que toca la carne cruda no debe tocar la cocinada sin lavarse (contaminación cruzada).</li>
                <li><strong>Servir picada o ave poco hecha.</strong> No es cuestión de gusto: es un riesgo real de intoxicación.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('temperatura-coccion-carne')} />
      <ShareCard appName="temperatura-coccion-carne" />
      <Footer appName="temperatura-coccion-carne" />
    </div>
  );
}
