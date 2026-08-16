'use client';

import { useMemo, useState } from 'react';
import styles from './CalculadoraCaducidad.module.css';
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
  ALIMENTOS_CADUCIDAD,
  CATEGORIAS_CADUCIDAD,
  CADUCIDAD_META,
  type CategoriaCaducidad,
} from '@/lib/calculadoras/caducidadAlimentos';

const CATEGORIAS = Object.keys(CATEGORIAS_CADUCIDAD) as CategoriaCaducidad[];

export default function CalculadoraCaducidadPage() {
  const [filtro, setFiltro] = useState<CategoriaCaducidad | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ALIMENTOS_CADUCIDAD.filter(
      (a) =>
        (!filtro || a.categoria === filtro) &&
        (!q || a.nombre.toLowerCase().includes(q)),
    );
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>¿Cuánto dura cada alimento?</h1>
        <p className={styles.subtitle}>
          Tiempos de conservación en nevera, congelador y despensa para que nada se eche a perder
          (ni te juegues un disgusto)
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Buscador">
          <input
            type="search"
            className={styles.buscador}
            placeholder="Busca un alimento (pollo, leche, sobras…)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar alimento"
          />
          <div className={styles.filtroBtns} role="group" aria-label="Filtrar por categoría">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
            {CATEGORIAS.map((c) => (
              <button key={c} type="button" aria-pressed={filtro === c}
                className={`${styles.filtroBtn} ${filtro === c ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(c)}>{CATEGORIAS_CADUCIDAD[c]}</button>
            ))}
          </div>
        </section>

        <section className={styles.tablaSection} aria-live="polite">
          <div className={styles.tableWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Alimento</th>
                  <th scope="col"><span aria-hidden="true">❄️</span> Nevera</th>
                  <th scope="col"><span aria-hidden="true">🧊</span> Congelador</th>
                  <th scope="col"><span aria-hidden="true">🗄️</span> Despensa</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((a) => (
                  <tr key={a.nombre}>
                    <td className={styles.celNombre}><span aria-hidden="true">{a.emoji}</span> {a.nombre}</td>
                    <td>{a.nevera}</td>
                    <td>{a.congelador}</td>
                    <td>{a.despensa}</td>
                  </tr>
                ))}
                {lista.length === 0 && (
                  <tr><td colSpan={4} className={styles.sinResultados}>Ningún alimento coincide con la búsqueda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className={styles.fuenteNota}>
            Tiempos orientativos. Fuente: {CADUCIDAD_META.fuente}. Verificado {CADUCIDAD_META.verificado}.
            Ante cualquier signo de deterioro (olor, color, moho), desecha el alimento.
          </p>
        </section>

        <EducationalSection
          title="Conservar alimentos con cabeza"
          subtitle="Cómo alargar la vida de la comida sin arriesgar la salud"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El frío frena, no resucita</h2>
              <p>
                La nevera y el congelador ralentizan el crecimiento de las bacterias, pero no
                eliminan las que ya hay ni recuperan un alimento que empezó a estropearse. Por eso lo
                importante es enfriar pronto (las sobras, antes de 2 horas), mantener la nevera a 4 °C
                o menos y el congelador a −18 °C, y respetar los tiempos. Y por encima de cualquier
                tabla, hacer caso a los sentidos: si algo huele, sabe o se ve raro, no merece la pena
                arriesgarse.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Buenas prácticas</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
                  <h4>Etiqueta con la fecha</h4>
                  <p>Apunta el día al congelar o abrir; así sabes qué consumir antes sin adivinar.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🧊</span>
                  <h4>Enfría rápido</h4>
                  <p>No dejes la comida caliente fuera: refrigérala antes de 2 horas (1 si hace calor).</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🔁</span>
                  <h4>No recongeles en crudo</h4>
                  <p>Lo descongelado se puede recongelar solo si lo cocinas antes.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🍱</span>
                  <h4>Separa crudo y cocinado</h4>
                  <p>Guarda lo crudo abajo y tapado para evitar que gotee sobre lo demás.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Señales para desechar sin dudar</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Olor desagradable o ácido.</strong> El olfato es el mejor detector; si huele mal, fuera.</li>
                <li><strong>Moho o viscosidad.</strong> En carnes, quesos blandos o cocinados, no se quita «la parte mala».</li>
                <li><strong>Envase hinchado o lata abombada.</strong> Puede indicar bacterias peligrosas; no lo abras siquiera.</li>
                <li><strong>Cambio de color o textura.</strong> Sobre todo en pescado y carne; ante la duda, deséchalo.</li>
                <li><strong>Mucho tiempo a temperatura ambiente.</strong> Más de 2 horas fuera de la nevera es motivo de tirarlo.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-caducidad')} />
      <ShareCard appName="calculadora-caducidad" />
      <Footer appName="calculadora-caducidad" />
    </div>
  );
}
