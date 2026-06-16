'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './PiramidePoblacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Datos de población
// ─────────────────────────────────────────────

const GRUPOS_EDAD = [
  '0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39',
  '40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+'
];

interface DatosPoblacion {
  total: number;
  dependencia: number;
  edadMediana: number;
  hombres: number[];
  mujeres: number[];
}

const DATOS_POBLACION: Record<number, DatosPoblacion> = {
  1950: {
    total: 28117, dependencia: 52, edadMediana: 27,
    hombres: [1060, 985, 900, 860, 810, 765, 720, 660, 580, 510, 440, 360, 295, 225, 160, 100, 65],
    mujeres: [1030, 955, 875, 835, 790, 745, 700, 645, 570, 505, 435, 360, 300, 230, 170, 115, 100]
  },
  1975: {
    total: 35516, dependencia: 55, edadMediana: 29,
    hombres: [1280, 1230, 1190, 1150, 1100, 1050, 970, 890, 820, 750, 640, 530, 425, 320, 225, 135, 80],
    mujeres: [1225, 1175, 1140, 1100, 1055, 1010, 940, 870, 815, 745, 645, 545, 445, 345, 260, 175, 145]
  },
  2000: {
    total: 40499, dependencia: 45, edadMediana: 37,
    hombres: [970, 880, 885, 1055, 1200, 1380, 1490, 1540, 1420, 1300, 1150, 955, 755, 600, 445, 290, 230],
    mujeres: [925, 840, 850, 1015, 1155, 1330, 1445, 1500, 1395, 1285, 1155, 980, 795, 660, 515, 370, 400]
  },
  2024: {
    total: 48085, dependencia: 51, edadMediana: 45,
    hombres: [875, 960, 1010, 960, 910, 1020, 1165, 1715, 1930, 1875, 1680, 1520, 1265, 1105, 960, 745, 1200],
    mujeres: [830, 915, 965, 920, 880, 985, 1135, 1680, 1890, 1840, 1655, 1510, 1260, 1120, 985, 790, 1690]
  },
  2050: {
    total: 50023, dependencia: 73, edadMediana: 52,
    hombres: [770, 715, 760, 815, 870, 875, 870, 870, 920, 1020, 1075, 1180, 1680, 1895, 1740, 1430, 3000],
    mujeres: [735, 685, 730, 785, 840, 850, 850, 860, 920, 1025, 1090, 1210, 1760, 2010, 1910, 1680, 4150]
  },
  2100: {
    total: 37850, dependencia: 81, edadMediana: 58,
    hombres: [610, 565, 565, 570, 580, 580, 615, 660, 670, 720, 775, 785, 820, 875, 880, 880, 2000],
    mujeres: [580, 540, 540, 548, 560, 562, 595, 640, 660, 720, 775, 800, 860, 945, 980, 1020, 3235]
  }
};

const ANOS = [1950, 1975, 2000, 2024, 2050, 2100] as const;
type Ano = typeof ANOS[number];

// Máximo valor de todos los grupos en todos los años (para escala consistente)
const MAX_VALOR = 4200;
const ANCHO_MAX_PX = 200;

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function PiramidePoblacionPage() {
  const [anoSeleccionado, setAnoSeleccionado] = useState<Ano>(2024);

  const datos = DATOS_POBLACION[anoSeleccionado];

  const etiquetaAno = anoSeleccionado <= 2000
    ? '📜 Datos históricos (INE)'
    : anoSeleccionado === 2024
    ? '📊 Datos actuales (INE 2024)'
    : '🔮 Proyección (INE/EUROSTAT)';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Pirámide de Población</h1>
        <p className={styles.subtitle}>España 1950-2100: 75 años de transformación demográfica</p>
      </header>

      <LegalNotice />

      {/* Selector de año */}
      <section className={styles.selectorSection}>
        <div className={styles.selectorBotones}>
          {ANOS.map(ano => (
            <button
              key={ano}
              type="button"
              className={`${styles.btnAno} ${anoSeleccionado === ano ? styles.btnAnoActivo : ''}`}
              onClick={() => setAnoSeleccionado(ano)}
              aria-pressed={anoSeleccionado === ano}
            >
              {ano}
            </button>
          ))}
        </div>
        <p className={styles.etiquetaAno}>{etiquetaAno}</p>
      </section>

      {/* Pirámide */}
      <section className={styles.piramideSection}>
        <div className={styles.leyenda}>
          <span className={styles.leyendaHombres}>&#9632; Hombres</span>
          <span className={styles.leyendaMujeres}>&#9632; Mujeres</span>
        </div>

        <div className={styles.piramide} role="img" aria-label={`Pirámide de población de España en ${anoSeleccionado}`}>
          {/* La pirámide se muestra desde el grupo mayor (80+) arriba hasta 0-4 abajo,
              usando flex-direction: column (orden visual: 80+ primero en el DOM, 0-4 al final) */}
          {[...GRUPOS_EDAD].reverse().map((grupo, i) => {
            const idx = GRUPOS_EDAD.length - 1 - i;
            const anchoH = (datos.hombres[idx] / MAX_VALOR) * ANCHO_MAX_PX;
            const anchoM = (datos.mujeres[idx] / MAX_VALOR) * ANCHO_MAX_PX;
            return (
              <div key={grupo} className={styles.piramideFila}>
                <div className={styles.ladoHombres}>
                  <div
                    className={styles.barraHombres}
                    style={{ width: `${anchoH}px` }}
                    title={`Hombres ${grupo}: ${datos.hombres[idx].toLocaleString('es-ES')} miles`}
                  />
                </div>
                <span className={styles.etiquetaEdad}>{grupo}</span>
                <div className={styles.ladoMujeres}>
                  <div
                    className={styles.barraMujeres}
                    style={{ width: `${anchoM}px` }}
                    title={`Mujeres ${grupo}: ${datos.mujeres[idx].toLocaleString('es-ES')} miles`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.ejeX}>
          <span>&#8592; Miles de personas</span>
          <span>Miles de personas &#8594;</span>
        </div>
      </section>

      {/* Indicadores */}
      <section className={styles.indicadoresGrid} aria-label="Indicadores demográficos">
        <div className={styles.indicadorCard}>
          <span className={styles.indicadorValor}>{datos.total.toLocaleString('es-ES')}k</span>
          <span className={styles.indicadorLabel}>Población total</span>
        </div>
        <div className={styles.indicadorCard}>
          <span className={styles.indicadorValor}>{datos.dependencia}%</span>
          <span className={styles.indicadorLabel}>Tasa de dependencia</span>
        </div>
        <div className={styles.indicadorCard}>
          <span className={styles.indicadorValor}>{datos.edadMediana} años</span>
          <span className={styles.indicadorLabel}>Edad mediana</span>
        </div>
      </section>

      {/* Insight box */}
      <div className={styles.insightBox}>
        <strong><span aria-hidden="true">🔍</span> Radiografía 2024 vs 2100:</strong> Si se cumplen las proyecciones del INE, España pasará de 45 a 58 años de edad mediana. Por cada persona mayor de 64 años habrá menos de una en edad de trabajar. La inmigración es el único factor que puede moderar esta tendencia.
      </div>

      <EducationalSection title="¿Cómo leer una pirámide de población?" subtitle="Demografía, transición demográfica y proyecciones del INE" defaultOpen={false}>
        <p>
          La pirámide de población es una representación gráfica de la distribución por edad y sexo de una población. Los grupos de edad aparecen en el eje vertical (0-4 años abajo, 80+ arriba) y el número de personas en el eje horizontal (hombres a la izquierda, mujeres a la derecha).
        </p>
        <p>
          Una <strong>pirámide expansiva</strong> (base ancha) indica alta natalidad y mortalidad, propia de países jóvenes. Una <strong>pirámide regresiva o envejecida</strong> (base estrecha y cima ancha) como la proyectada para España en 2100, indica baja natalidad y alta esperanza de vida.
        </p>
        <p>
          La <strong>tasa de dependencia demográfica</strong> mide cuántas personas dependientes (menores de 16 y mayores de 64) hay por cada 100 personas en edad activa (16-64 años). Una tasa alta implica mayor presión sobre el sistema de pensiones, sanidad y servicios sociales.
        </p>
        <p>
          La <strong>edad mediana</strong> divide a la población en dos mitades iguales: la mitad es mayor y la mitad es menor que ese valor. España tenía una edad mediana de 27 años en 1950; las proyecciones apuntan a 58 años en 2100, una de las más altas del mundo.
        </p>
        <div className={styles.warningBox}>
          <strong><span aria-hidden="true">⚠️</span> Fuentes y limitaciones:</strong> Los datos históricos proceden del INE (Padrón Municipal, Censos de Población y Viviendas). Las proyecciones 2050-2100 corresponden al escenario central INE/EUROSTAT y pueden variar significativamente según evolución de la natalidad, esperanza de vida e inmigración. Todos los datos están expresados en miles de personas y son aproximados con fines educativos y divulgativos.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-piramide-poblacion')} />
      <ShareCard appName="visualizador-piramide-poblacion" />
      <Footer appName="visualizador-piramide-poblacion" />
    </div>
  );
}
