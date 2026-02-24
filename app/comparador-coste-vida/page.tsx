'use client';

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatNumber } from '@/lib/formatters';
import { jsonLd } from './metadata';
import styles from './ComparadorCosteVida.module.css';
import { getRelatedApps } from '@/data/app-relations';

interface DatosCosteVida {
  ciudad: string;
  pais: string;
  continente: string;
  alquiler: number;        // 1 habitación, centro ciudad, €/mes
  cena: number;            // Cena restaurante económico, €/persona
  supermercado: number;    // Cesta básica mensual estimada, €/mes
  transporte: number;      // Bono transporte público mensual, €/mes
  internet: number;        // Internet fibra mensual, €/mes
  indice: number;          // Índice total (Madrid = 100)
}

// Fuente: estimación basada en Numbeo y otras fuentes públicas · Datos 2024-2025
const CIUDADES: DatosCosteVida[] = [
  // EUROPA — Ibérica
  { ciudad: 'Madrid', pais: 'España', continente: 'Europa', alquiler: 1100, cena: 12, supermercado: 280, transporte: 55, internet: 35, indice: 100 },
  { ciudad: 'Barcelona', pais: 'España', continente: 'Europa', alquiler: 1300, cena: 14, supermercado: 300, transporte: 80, internet: 35, indice: 115 },
  { ciudad: 'Valencia', pais: 'España', continente: 'Europa', alquiler: 850, cena: 11, supermercado: 260, transporte: 45, internet: 32, indice: 87 },
  { ciudad: 'Sevilla', pais: 'España', continente: 'Europa', alquiler: 800, cena: 10, supermercado: 250, transporte: 42, internet: 32, indice: 83 },
  { ciudad: 'Lisboa', pais: 'Portugal', continente: 'Europa', alquiler: 1100, cena: 11, supermercado: 260, transporte: 40, internet: 28, indice: 94 },
  { ciudad: 'Porto', pais: 'Portugal', continente: 'Europa', alquiler: 800, cena: 10, supermercado: 240, transporte: 35, internet: 25, indice: 82 },
  // EUROPA — Occidental
  { ciudad: 'París', pais: 'Francia', continente: 'Europa', alquiler: 1800, cena: 18, supermercado: 350, transporte: 90, internet: 30, indice: 155 },
  { ciudad: 'Londres', pais: 'Reino Unido', continente: 'Europa', alquiler: 2400, cena: 18, supermercado: 380, transporte: 200, internet: 45, indice: 190 },
  { ciudad: 'Berlín', pais: 'Alemania', continente: 'Europa', alquiler: 1400, cena: 14, supermercado: 320, transporte: 90, internet: 35, indice: 125 },
  { ciudad: 'Múnich', pais: 'Alemania', continente: 'Europa', alquiler: 1900, cena: 16, supermercado: 340, transporte: 60, internet: 35, indice: 158 },
  { ciudad: 'Ámsterdam', pais: 'Países Bajos', continente: 'Europa', alquiler: 1900, cena: 18, supermercado: 350, transporte: 100, internet: 45, indice: 165 },
  { ciudad: 'Bruselas', pais: 'Bélgica', continente: 'Europa', alquiler: 1200, cena: 16, supermercado: 330, transporte: 60, internet: 40, indice: 118 },
  { ciudad: 'Viena', pais: 'Austria', continente: 'Europa', alquiler: 1200, cena: 14, supermercado: 310, transporte: 50, internet: 25, indice: 116 },
  { ciudad: 'Zúrich', pais: 'Suiza', continente: 'Europa', alquiler: 2800, cena: 28, supermercado: 500, transporte: 90, internet: 55, indice: 240 },
  { ciudad: 'Dublín', pais: 'Irlanda', continente: 'Europa', alquiler: 2200, cena: 18, supermercado: 350, transporte: 140, internet: 50, indice: 188 },
  // EUROPA — Nórdica
  { ciudad: 'Copenhague', pais: 'Dinamarca', continente: 'Europa', alquiler: 1800, cena: 22, supermercado: 400, transporte: 90, internet: 45, indice: 172 },
  { ciudad: 'Estocolmo', pais: 'Suecia', continente: 'Europa', alquiler: 1600, cena: 20, supermercado: 380, transporte: 100, internet: 30, indice: 158 },
  { ciudad: 'Oslo', pais: 'Noruega', continente: 'Europa', alquiler: 1900, cena: 28, supermercado: 450, transporte: 100, internet: 45, indice: 192 },
  // EUROPA — Sur
  { ciudad: 'Roma', pais: 'Italia', continente: 'Europa', alquiler: 1200, cena: 14, supermercado: 310, transporte: 35, internet: 28, indice: 113 },
  { ciudad: 'Milán', pais: 'Italia', continente: 'Europa', alquiler: 1500, cena: 16, supermercado: 330, transporte: 40, internet: 28, indice: 130 },
  { ciudad: 'Atenas', pais: 'Grecia', continente: 'Europa', alquiler: 700, cena: 10, supermercado: 250, transporte: 30, internet: 28, indice: 71 },
  // EUROPA — Este
  { ciudad: 'Praga', pais: 'Rep. Checa', continente: 'Europa', alquiler: 800, cena: 9, supermercado: 240, transporte: 25, internet: 15, indice: 76 },
  { ciudad: 'Varsovia', pais: 'Polonia', continente: 'Europa', alquiler: 800, cena: 9, supermercado: 230, transporte: 30, internet: 15, indice: 74 },
  { ciudad: 'Budapest', pais: 'Hungría', continente: 'Europa', alquiler: 650, cena: 8, supermercado: 210, transporte: 25, internet: 12, indice: 64 },
  { ciudad: 'Bucarest', pais: 'Rumanía', continente: 'Europa', alquiler: 550, cena: 7, supermercado: 190, transporte: 18, internet: 12, indice: 55 },
  { ciudad: 'Estambul', pais: 'Turquía', continente: 'Europa/Asia', alquiler: 500, cena: 5, supermercado: 200, transporte: 20, internet: 10, indice: 52 },
  // AMÉRICA — Norte
  { ciudad: 'Nueva York', pais: 'EE.UU.', continente: 'América', alquiler: 3200, cena: 22, supermercado: 450, transporte: 130, internet: 55, indice: 250 },
  { ciudad: 'Los Ángeles', pais: 'EE.UU.', continente: 'América', alquiler: 2800, cena: 20, supermercado: 420, transporte: 100, internet: 55, indice: 228 },
  { ciudad: 'Miami', pais: 'EE.UU.', continente: 'América', alquiler: 2600, cena: 20, supermercado: 400, transporte: 115, internet: 55, indice: 218 },
  { ciudad: 'Chicago', pais: 'EE.UU.', continente: 'América', alquiler: 1900, cena: 18, supermercado: 380, transporte: 100, internet: 45, indice: 175 },
  { ciudad: 'Toronto', pais: 'Canadá', continente: 'América', alquiler: 1900, cena: 18, supermercado: 380, transporte: 130, internet: 55, indice: 172 },
  { ciudad: 'Ciudad de México', pais: 'México', continente: 'América', alquiler: 600, cena: 6, supermercado: 200, transporte: 25, internet: 28, indice: 60 },
  // AMÉRICA — Sur
  { ciudad: 'Buenos Aires', pais: 'Argentina', continente: 'América', alquiler: 400, cena: 5, supermercado: 180, transporte: 10, internet: 15, indice: 40 },
  { ciudad: 'Santiago', pais: 'Chile', continente: 'América', alquiler: 700, cena: 8, supermercado: 260, transporte: 55, internet: 30, indice: 70 },
  { ciudad: 'Bogotá', pais: 'Colombia', continente: 'América', alquiler: 450, cena: 5, supermercado: 200, transporte: 30, internet: 18, indice: 46 },
  { ciudad: 'Lima', pais: 'Perú', continente: 'América', alquiler: 500, cena: 5, supermercado: 200, transporte: 28, internet: 25, indice: 49 },
  { ciudad: 'São Paulo', pais: 'Brasil', continente: 'América', alquiler: 600, cena: 6, supermercado: 220, transporte: 45, internet: 20, indice: 58 },
  { ciudad: 'Montevideo', pais: 'Uruguay', continente: 'América', alquiler: 700, cena: 9, supermercado: 270, transporte: 40, internet: 30, indice: 68 },
  // ASIA — Este
  { ciudad: 'Tokio', pais: 'Japón', continente: 'Asia', alquiler: 1100, cena: 10, supermercado: 290, transporte: 90, internet: 30, indice: 105 },
  { ciudad: 'Seúl', pais: 'Corea del Sur', continente: 'Asia', alquiler: 900, cena: 8, supermercado: 280, transporte: 55, internet: 20, indice: 86 },
  { ciudad: 'Shanghái', pais: 'China', continente: 'Asia', alquiler: 1100, cena: 8, supermercado: 280, transporte: 35, internet: 18, indice: 98 },
  { ciudad: 'Hong Kong', pais: 'China (RAE)', continente: 'Asia', alquiler: 2800, cena: 14, supermercado: 380, transporte: 75, internet: 25, indice: 205 },
  { ciudad: 'Singapur', pais: 'Singapur', continente: 'Asia', alquiler: 2500, cena: 12, supermercado: 350, transporte: 90, internet: 30, indice: 198 },
  // ASIA — Sudeste
  { ciudad: 'Bangkok', pais: 'Tailandia', continente: 'Asia', alquiler: 550, cena: 5, supermercado: 200, transporte: 30, internet: 18, indice: 51 },
  { ciudad: 'Bali', pais: 'Indonesia', continente: 'Asia', alquiler: 400, cena: 4, supermercado: 180, transporte: 25, internet: 15, indice: 40 },
  { ciudad: 'Ho Chi Minh', pais: 'Vietnam', continente: 'Asia', alquiler: 500, cena: 4, supermercado: 180, transporte: 20, internet: 12, indice: 43 },
  { ciudad: 'Kuala Lumpur', pais: 'Malasia', continente: 'Asia', alquiler: 550, cena: 5, supermercado: 200, transporte: 35, internet: 20, indice: 50 },
  // ASIA — Próximo Oriente
  { ciudad: 'Dubái', pais: 'EAU', continente: 'Asia', alquiler: 2000, cena: 18, supermercado: 380, transporte: 300, internet: 90, indice: 188 },
  { ciudad: 'Tel Aviv', pais: 'Israel', continente: 'Asia', alquiler: 2200, cena: 18, supermercado: 400, transporte: 75, internet: 40, indice: 195 },
  // OCEANÍA
  { ciudad: 'Sídney', pais: 'Australia', continente: 'Oceanía', alquiler: 2400, cena: 20, supermercado: 420, transporte: 130, internet: 55, indice: 205 },
  { ciudad: 'Melbourne', pais: 'Australia', continente: 'Oceanía', alquiler: 1900, cena: 18, supermercado: 380, transporte: 110, internet: 50, indice: 178 },
  // ÁFRICA
  { ciudad: 'El Cairo', pais: 'Egipto', continente: 'África', alquiler: 250, cena: 4, supermercado: 150, transporte: 15, internet: 12, indice: 28 },
  { ciudad: 'Casablanca', pais: 'Marruecos', continente: 'África', alquiler: 350, cena: 5, supermercado: 170, transporte: 25, internet: 15, indice: 35 },
  { ciudad: 'Ciudad del Cabo', pais: 'Sudáfrica', continente: 'África', alquiler: 550, cena: 8, supermercado: 220, transporte: 60, internet: 25, indice: 56 },
  { ciudad: 'Nairobi', pais: 'Kenia', continente: 'África', alquiler: 500, cena: 6, supermercado: 200, transporte: 30, internet: 20, indice: 49 },
];

type OrdenRanking = 'indice' | 'alquiler' | 'ciudad';

interface CategoriaComp {
  key: keyof DatosCosteVida;
  label: string;
  unidad: string;
}

const CATEGORIAS_COMP: CategoriaComp[] = [
  { key: 'alquiler', label: 'Alquiler (1 hab, centro)', unidad: '€/mes' },
  { key: 'cena', label: 'Cena restaurante económico', unidad: '€/pers.' },
  { key: 'supermercado', label: 'Supermercado mensual est.', unidad: '€/mes' },
  { key: 'transporte', label: 'Transporte público mensual', unidad: '€/mes' },
  { key: 'internet', label: 'Internet fibra mensual', unidad: '€/mes' },
];

const CONTINENTES = Array.from(new Set(CIUDADES.map(c => c.continente))).sort();
const MAX_INDICE = Math.max(...CIUDADES.map(c => c.indice));

const diffPct = (a: number, b: number): number => Math.round(((b - a) / a) * 100);

export default function ComparadorCosteVida() {
  const [ciudadA, setCiudadA] = useState<string>('Madrid');
  const [ciudadB, setCiudadB] = useState<string>('Londres');
  const [orden, setOrden] = useState<OrdenRanking>('indice');

  const datosA = CIUDADES.find(c => c.ciudad === ciudadA)!;
  const datosB = CIUDADES.find(c => c.ciudad === ciudadB)!;

  const ciudadesOrdenadas = useMemo(() => {
    return [...CIUDADES].sort((a, b) => {
      if (orden === 'indice') return a.indice - b.indice;
      if (orden === 'alquiler') return a.alquiler - b.alquiler;
      return a.ciudad.localeCompare(b.ciudad);
    });
  }, [orden]);

  const pctDiff = datosA && datosB ? diffPct(datosA.indice, datosB.indice) : 0;

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsTracker appName="comparador-coste-vida" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🏙️ Comparador de Coste de Vida</h1>
        <p>Alquiler, comida, transporte e internet en 55+ ciudades del mundo</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <DisclaimerCard variant="general" severity="medium">
          <strong>Datos de referencia 2024-2025.</strong> Las cifras son estimaciones basadas en Numbeo y otras fuentes públicas. Los precios reales varían según barrio, estilo de vida y momento del año. No usar como base única para decisiones de mudanza sin contrastar con fuentes actualizadas.
        </DisclaimerCard>

        {/* Comparador de dos ciudades */}
        <section className={styles.comparador}>
          <h2>Comparar dos ciudades</h2>

          <div className={styles.selectoresWrap}>
            <div className={styles.selectorGrupo}>
              <label htmlFor="ciudad-a" className={styles.selectorLabel}>Ciudad A</label>
              <select
                id="ciudad-a"
                className={styles.selectCiudad}
                value={ciudadA}
                onChange={e => setCiudadA(e.target.value)}
                aria-label="Primera ciudad para comparar"
              >
                {CONTINENTES.map(cont => (
                  <optgroup key={cont} label={cont}>
                    {CIUDADES.filter(c => c.continente === cont).map(c => (
                      <option key={c.ciudad} value={c.ciudad}>{c.ciudad}, {c.pais}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className={styles.vsLabel} aria-hidden="true">VS</div>

            <div className={styles.selectorGrupo}>
              <label htmlFor="ciudad-b" className={styles.selectorLabel}>Ciudad B</label>
              <select
                id="ciudad-b"
                className={styles.selectCiudad}
                value={ciudadB}
                onChange={e => setCiudadB(e.target.value)}
                aria-label="Segunda ciudad para comparar"
              >
                {CONTINENTES.map(cont => (
                  <optgroup key={cont} label={cont}>
                    {CIUDADES.filter(c => c.continente === cont).map(c => (
                      <option key={c.ciudad} value={c.ciudad}>{c.ciudad}, {c.pais}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {datosA && datosB && (
            <div aria-live="polite">
              {/* Banner resumen */}
              <div className={`${styles.bannerResumen} ${pctDiff > 0 ? styles.bannerMasCaro : pctDiff < 0 ? styles.bannerMasBarato : styles.bannerIgual}`}>
                {pctDiff > 0
                  ? `${datosB.ciudad} es un ${pctDiff}% más cara que ${datosA.ciudad}`
                  : pctDiff < 0
                  ? `${datosB.ciudad} es un ${Math.abs(pctDiff)}% más barata que ${datosA.ciudad}`
                  : `${datosA.ciudad} y ${datosB.ciudad} tienen un coste de vida similar`}
              </div>

              {/* Tabla comparativa */}
              <div className={styles.tablaComparacion} role="table" aria-label="Comparación de costes">
                {/* Cabecera */}
                <div className={`${styles.fila} ${styles.filaCabecera}`} role="row">
                  <span className={styles.celdaLabel} role="columnheader">Categoría</span>
                  <span className={styles.celdaValor} role="columnheader">{datosA.ciudad}</span>
                  <span className={styles.celdaDiff} role="columnheader">Dif.</span>
                  <span className={styles.celdaValor} role="columnheader">{datosB.ciudad}</span>
                </div>

                {CATEGORIAS_COMP.map(cat => {
                  const valA = datosA[cat.key] as number;
                  const valB = datosB[cat.key] as number;
                  const pct = diffPct(valA, valB);

                  return (
                    <div key={cat.key} className={styles.fila} role="row">
                      <span className={styles.celdaLabel} role="cell">{cat.label}</span>
                      <span
                        className={`${styles.celdaValor} ${valA < valB ? styles.ventaja : valA > valB ? styles.desventaja : ''}`}
                        role="cell"
                      >
                        {formatNumber(valA, 0)} {cat.unidad}
                      </span>
                      <span
                        className={`${styles.celdaDiff} ${pct > 0 ? styles.diffPos : pct < 0 ? styles.diffNeg : ''}`}
                        role="cell"
                        aria-label={`Diferencia: ${pct > 0 ? '+' : ''}${pct}%`}
                      >
                        {pct > 0 ? `+${pct}%` : pct < 0 ? `${pct}%` : '='}
                      </span>
                      <span
                        className={`${styles.celdaValor} ${valB < valA ? styles.ventaja : valB > valA ? styles.desventaja : ''}`}
                        role="cell"
                      >
                        {formatNumber(valB, 0)} {cat.unidad}
                      </span>
                    </div>
                  );
                })}

                {/* Fila de índice total */}
                <div className={`${styles.fila} ${styles.filaIndice}`} role="row">
                  <span className={styles.celdaLabel} role="cell">Índice total (Madrid = 100)</span>
                  <span
                    className={`${styles.celdaValor} ${datosA.indice < datosB.indice ? styles.ventaja : datosA.indice > datosB.indice ? styles.desventaja : ''}`}
                    role="cell"
                  >
                    {datosA.indice}
                  </span>
                  <span
                    className={`${styles.celdaDiff} ${pctDiff > 0 ? styles.diffPos : pctDiff < 0 ? styles.diffNeg : ''}`}
                    role="cell"
                  >
                    {pctDiff > 0 ? `+${pctDiff}%` : pctDiff < 0 ? `${pctDiff}%` : '='}
                  </span>
                  <span
                    className={`${styles.celdaValor} ${datosB.indice < datosA.indice ? styles.ventaja : datosB.indice > datosA.indice ? styles.desventaja : ''}`}
                    role="cell"
                  >
                    {datosB.indice}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Ranking completo */}
        <section className={styles.rankingSeccion}>
          <div className={styles.rankingHeader}>
            <h2>Ranking de ciudades</h2>
            <div className={styles.ordenWrap}>
              <label htmlFor="orden" className={styles.ordenLabel}>Ordenar</label>
              <select
                id="orden"
                className={styles.selectOrden}
                value={orden}
                onChange={e => setOrden(e.target.value as OrdenRanking)}
                aria-label="Criterio de ordenación"
              >
                <option value="indice">Por índice total</option>
                <option value="alquiler">Por alquiler</option>
                <option value="ciudad">Alfabético</option>
              </select>
            </div>
          </div>

          <div className={styles.listaRanking} role="list">
            {ciudadesOrdenadas.map((ciudad, i) => (
              <div key={ciudad.ciudad} className={styles.itemRanking} role="listitem">
                <span className={styles.rankNum} aria-label={`Posición ${i + 1}`}>{i + 1}</span>
                <div className={styles.rankInfo}>
                  <span className={styles.rankNombre}>{ciudad.ciudad}</span>
                  <span className={styles.rankPais}>{ciudad.pais}</span>
                </div>
                <div className={styles.rankBarra} aria-hidden="true">
                  <div
                    className={styles.rankBarraRelleno}
                    ref={el => { if (el) el.style.width = `${(ciudad.indice / MAX_INDICE) * 100}%`; }}
                  />
                </div>
                <span className={styles.rankIndice} aria-label={`Índice ${ciudad.indice}`}>
                  {ciudad.indice}
                </span>
              </div>
            ))}
          </div>

          <p className={styles.fuenteTexto}>
            Índice orientativo (Madrid = 100) · Estimación basada en Numbeo y otras fuentes públicas · Datos 2024-2025
          </p>
        </section>

        <EducationalSection
          title="Cómo interpretar el coste de vida entre ciudades"
          subtitle="Guía para comparar destinos y planificar una mudanza o estancia larga"
        >
          <h3>¿Qué significa el índice de coste de vida?</h3>
          <p>
            El índice toma Madrid como referencia (100). Una ciudad con índice 200 cuesta, en términos generales,
            el doble que Madrid. El índice pondera los principales gastos de una persona sin vehículo propio:
            vivienda, alimentación, transporte público e internet.
          </p>

          <h3>¿Por qué varía tanto el coste entre ciudades?</h3>
          <ul>
            <li><strong>Vivienda:</strong> suele ser el mayor factor diferencial, especialmente en ciudades globales como Zúrich, Nueva York o Singapur</li>
            <li><strong>Nivel de vida local:</strong> países con salarios más altos tienden a tener precios más altos en servicios</li>
            <li><strong>Tipo de cambio:</strong> los valores están convertidos a euros a tasas aproximadas de 2024-2025</li>
            <li><strong>Subsidios:</strong> algunos países subvencionan el transporte o la vivienda, lo que reduce el coste real</li>
          </ul>

          <h3>Coste de vida para nómadas digitales</h3>
          <p>
            Si trabajas en remoto y puedes elegir dónde vivir, ciudades como Bangkok, Bali, Medellín o Lisboa
            ofrecen una excelente combinación de calidad de vida, infraestructura digital y coste asequible.
            Ciudades como Zúrich, Oslo o Nueva York requieren ingresos muy superiores para el mismo nivel de vida.
          </p>

          <h3>Limitaciones de los datos</h3>
          <ul>
            <li>Los precios varían mucho según el barrio y el tipo de vivienda</li>
            <li>No incluyen impuestos sobre la renta, que pueden ser significativos</li>
            <li>El coste del ocio, sanidad y educación no está reflejado</li>
            <li>Ciudades con turismo estacional pueden tener precios muy distintos según la época</li>
          </ul>

          <h3>Recomendación antes de mudarse</h3>
          <p>
            Contrasta siempre con fuentes más detalladas (Numbeo, Expatistan, Mercer) y si es posible,
            visita la ciudad durante al menos un mes antes de tomar la decisión. El coste de vida es
            solo uno de los factores: calidad del sistema sanitario, clima, idioma e integración social
            también son determinantes.
          </p>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('comparador-coste-vida')} />
        <ShareCard appName="comparador-coste-vida" />
      <Footer appName="comparador-coste-vida" />
      </main>
    </div>
  );
}
