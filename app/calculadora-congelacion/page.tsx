'use client';

import { useMemo, useState } from 'react';
import styles from './CalculadoraCongelacion.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import {
  ALIMENTOS_CONGELACION, CATEGORIAS_CONGELACION, ETIQUETA_APTO,
  type CategoriaCongelacion, type AptoCongelar,
} from '@/lib/calculadoras/congelacion';

const CATEGORIAS = Object.keys(CATEGORIAS_CONGELACION) as CategoriaCongelacion[];
const BADGE: Record<AptoCongelar, string> = { bien: styles.badgeBien, regular: styles.badgeRegular, no: styles.badgeNo };

export default function CalculadoraCongelacionPage() {
  const [filtro, setFiltro] = useState<CategoriaCongelacion | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ALIMENTOS_CONGELACION.filter(
      (a) => (!filtro || a.categoria === filtro) && (!q || a.nombre.toLowerCase().includes(q)),
    );
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Qué se puede congelar y cuánto dura</h1>
        <p className={styles.subtitle}>Qué alimentos aguantan bien el congelador, cuáles no y cuánto tiempo se conservan</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Buscador">
          <input type="search" className={styles.buscador} placeholder="Busca un alimento (carne, leche, pan…)"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar alimento" />
          <div className={styles.filtroBtns} role="group" aria-label="Filtrar por categoría">
            <button type="button" aria-pressed={filtro === null}
              className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(null)}>Todos</button>
            {CATEGORIAS.map((c) => (
              <button key={c} type="button" aria-pressed={filtro === c}
                className={`${styles.filtroBtn} ${filtro === c ? styles.filtroBtnActivo : ''}`}
                onClick={() => setFiltro(c)}>{CATEGORIAS_CONGELACION[c]}</button>
            ))}
          </div>
        </section>

        <section className={styles.tablaSection} aria-live="polite">
          <div className={styles.tableWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr><th scope="col">Alimento</th><th scope="col">¿Congela?</th><th scope="col">Duración</th><th scope="col">Nota</th></tr>
              </thead>
              <tbody>
                {lista.map((a) => (
                  <tr key={a.nombre}>
                    <td className={styles.celNombre}><span aria-hidden="true">{a.emoji}</span> {a.nombre}</td>
                    <td><span className={`${styles.badge} ${BADGE[a.apto]}`}>{ETIQUETA_APTO[a.apto]}</span></td>
                    <td className={styles.celTemp}>{a.duracion}</td>
                    <td className={styles.celNota}>{a.nota}</td>
                  </tr>
                ))}
                {lista.length === 0 && <tr><td colSpan={4} className={styles.sinResultados}>Ningún alimento coincide con la búsqueda.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className={styles.fuenteNota}>
            Tiempos de calidad a −18 °C. Fuente: FoodSafety.gov (USDA/FDA). Nunca recongeles un
            alimento crudo ya descongelado.
          </p>
        </section>

        <EducationalSection title="Congelar con cabeza" subtitle="Qué aguanta el frío, qué no y cómo proteger los alimentos">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>No todo se congela igual</h2>
              <p>
                Congelar es una de las mejores formas de no tirar comida, pero no todos los alimentos
                lo llevan igual. El agua que contienen forma cristales de hielo que rompen las
                células: por eso una verdura de hoja o una patata cruda se vuelven mustias o
                harinosas, mientras que una carne o un pan apenas lo notan. La clave está en saber
                qué congelar tal cual, qué congelar ya cocinado y qué es mejor no congelar. Y en
                proteger bien cada alimento para que no se deshidrate ni coja sabores del congelador.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Buenas prácticas</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}><span className={styles.tipIcon} aria-hidden="true">🏷️</span><h4>Etiqueta y fecha</h4><p>Apunta qué es y cuándo lo congelaste para consumirlo en su mejor momento.</p></div>
                <div className={styles.tipCard}><span className={styles.tipIcon} aria-hidden="true">📦</span><h4>Saca el aire</h4><p>Envuelve bien o usa bolsas sin aire para evitar quemaduras por frío.</p></div>
                <div className={styles.tipCard}><span className={styles.tipIcon} aria-hidden="true">🍱</span><h4>Por raciones</h4><p>Congela en porciones para descongelar solo lo que vas a usar.</p></div>
                <div className={styles.tipCard}><span className={styles.tipIcon} aria-hidden="true">❄️</span><h4>Congela rápido</h4><p>Cuanto antes alcance −18 °C, cristales más pequeños y mejor textura.</p></div>
              </div>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>No recongeles en crudo.</strong> Lo descongelado solo se puede volver a congelar si lo cocinas antes.</li>
                <li><strong>Deja espacio a los líquidos.</strong> Sopas y guisos se expanden al congelarse; no llenes hasta el borde.</li>
                <li><strong>Huevos, nunca con cáscara.</strong> Revientan; bátelos antes si quieres congelarlos.</li>
                <li><strong>Respeta los tiempos.</strong> Pasados, sigue siendo seguro pero pierde mucho sabor y textura.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-congelacion')} />
      <ShareCard appName="calculadora-congelacion" />
      <Footer appName="calculadora-congelacion" />
    </div>
  );
}
