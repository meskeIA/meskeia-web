'use client';

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatNumber } from '@/lib/formatters';
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

// Fuente: estimación basada en Numbeo y otras fuentes públicas · Datos 2025-2026
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
  { ciudad: 'Buenos Aires', pais: 'Argentina', continente: 'América', alquiler: 600, cena: 9, supermercado: 220, transporte: 20, internet: 20, indice: 60 },
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
      <AnalyticsTracker appName="comparador-coste-vida" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🏙️ Comparador de Coste de Vida</h1>
        <p>Alquiler, comida, transporte e internet en 55+ ciudades del mundo</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <DisclaimerCard variant="financial" severity="high" collapsible={false}>
          <strong>Datos de referencia 2025-2026.</strong> Las cifras son estimaciones basadas en Numbeo y otras fuentes públicas. Los precios reales varían según barrio, estilo de vida y momento del año. No usar como base única para decisiones de mudanza sin contrastar con fuentes actualizadas. Los países con alta inflación o devaluación reciente (p. ej. Argentina) pueden cambiar de rango de precio en euros en pocos meses: contrasta siempre con fuentes recientes.
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
            Índice orientativo (Madrid = 100) · Estimación basada en Numbeo y otras fuentes públicas · Datos 2025-2026
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
            <li><strong>Tipo de cambio:</strong> los valores están convertidos a euros a tasas aproximadas de 2025-2026</li>
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

          {/* ===== SECCIÓN 1: TABLA COMPARATIVA CIUDADES ESPAÑOLAS ===== */}
          <h3>Coste de vida en las principales ciudades españolas (2025)</h3>
          <p>
            Comparativa de las ciudades más representativas de España. El índice toma Madrid como referencia (100).
            Datos orientativos basados en estimaciones de mercado para 2025.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Ciudad</th>
                  <th>Alquiler 1 hab. centro</th>
                  <th>Cesta básica/mes</th>
                  <th>Transporte público/mes</th>
                  <th>Cena restaurante</th>
                  <th>Índice (Madrid=100)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Madrid</strong></td>
                  <td>~1.400 €</td>
                  <td>~290 €</td>
                  <td>~55 €</td>
                  <td>~12 €</td>
                  <td><strong>100</strong></td>
                </tr>
                <tr>
                  <td><strong>Barcelona</strong></td>
                  <td>~1.550 €</td>
                  <td>~310 €</td>
                  <td>~80 €</td>
                  <td>~14 €</td>
                  <td><strong>118</strong></td>
                </tr>
                <tr>
                  <td><strong>Bilbao</strong></td>
                  <td>~1.050 €</td>
                  <td>~280 €</td>
                  <td>~50 €</td>
                  <td>~13 €</td>
                  <td><strong>95</strong></td>
                </tr>
                <tr>
                  <td><strong>Valencia</strong></td>
                  <td>~900 €</td>
                  <td>~265 €</td>
                  <td>~45 €</td>
                  <td>~11 €</td>
                  <td><strong>86</strong></td>
                </tr>
                <tr>
                  <td><strong>Palma</strong></td>
                  <td>~1.100 €</td>
                  <td>~275 €</td>
                  <td>~48 €</td>
                  <td>~12 €</td>
                  <td><strong>92</strong></td>
                </tr>
                <tr>
                  <td><strong>Sevilla</strong></td>
                  <td>~800 €</td>
                  <td>~255 €</td>
                  <td>~42 €</td>
                  <td>~10 €</td>
                  <td><strong>82</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.fuenteTexto}>
            Estimaciones de mercado 2025. El alquiler corresponde a un piso de 1 dormitorio en zona céntrica. Variaciones significativas según barrio.
          </p>

          {/* ===== SECCIÓN 2: CASOS DE USO ===== */}
          <h3>¿Para quién es útil este comparador?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Profesional con oferta en otra ciudad</strong>
              </div>
              <p className={styles.escenarioExample}>
                Te ofrecen un trabajo en Barcelona con un 20% más de sueldo. ¿Compensa el traslado desde Valencia?
              </p>
              <p className={styles.escenarioTip}>
                Usa el comparador para ver que Barcelona tiene un índice ~37% más alto que Valencia. Con ese aumento salarial, tu poder adquisitivo real disminuiría.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Estudiante que elige ciudad</strong>
              </div>
              <p className={styles.escenarioExample}>
                Admisión en Madrid y en Sevilla. ¿Cuánto más necesitarás al mes en Madrid?
              </p>
              <p className={styles.escenarioTip}>
                La diferencia en alquiler entre Sevilla (~800 €) y Madrid (~1.400 €) supone unos 600 € más al mes solo en vivienda. Un factor determinante para la beca o ayuda familiar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏖️</span>
                <strong>Jubilado que busca ciudad más económica</strong>
              </div>
              <p className={styles.escenarioExample}>
                Jubilación de 1.500 €/mes. ¿En qué ciudad española se vive mejor con esa pensión?
              </p>
              <p className={styles.escenarioTip}>
                Con 1.500 €, vivir en Sevilla o Valencia ofrece un margen de ahorro mensual que en Madrid resultaría imposible. El índice 82 de Sevilla frente al 100 de Madrid es determinante.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <strong>Nómada digital que elige base en España</strong>
              </div>
              <p className={styles.escenarioExample}>
                Ingresos remotos de 3.000 €/mes netos. ¿Dónde en España obtienes más calidad de vida?
              </p>
              <p className={styles.escenarioTip}>
                Valencia, Sevilla o ciudades medias como Málaga o Alicante combinan buen clima, infraestructura digital, comunidad expat y un índice de coste muy inferior a Madrid o Barcelona.
              </p>
            </div>
          </div>

          {/* ===== SECCIÓN 3: FAQ ===== */}
          <h3>Preguntas frecuentes sobre coste de vida</h3>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cómo se calcula el índice de coste de vida?</dt>
              <dd>El índice agrega varios componentes (vivienda, alimentación, transporte, servicios) ponderados por su peso en el gasto medio de un hogar. La metodología más extendida (Numbeo, ECA International) toma una ciudad de referencia —aquí Madrid = 100— y expresa el resto de ciudades en relación a ella.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué ciudad española es más cara en alquiler?</dt>
              <dd>Barcelona lidera el alquiler en zona centro (~1.550 €/mes para 1 dormitorio en 2025), seguida de Madrid (~1.400 €), Palma (~1.100 €) y Bilbao (~1.050 €). En zonas periféricas, los precios pueden ser un 30-40% inferiores.</dd>
              <p className={styles.faqTip}>Consejo: compara siempre el alquiler en relación al sueldo neto medio de cada ciudad, no en valor absoluto.</p>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué sueldo necesito para vivir bien en Madrid vs Valencia?</dt>
              <dd>Para un nivel de vida holgado (alquiler individual, ocio, ahorro), en Madrid se estima en torno a 2.500-3.000 €/mes netos, mientras que en Valencia basta con 1.800-2.200 €/mes. La diferencia proviene principalmente del alquiler y del coste del ocio.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Incluye el coste de vida los impuestos?</dt>
              <dd>No. El índice refleja el coste de bienes y servicios de consumo directo (alquiler, comida, transporte, ocio). Los impuestos sobre la renta, que varían por Comunidad Autónoma, no están incluidos y pueden alterar significativamente el poder adquisitivo real.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuánto más barato es el interior de España vs la costa?</dt>
              <dd>Las ciudades del interior como Salamanca, Valladolid, Zaragoza o Murcia suelen tener un índice entre 65 y 80 (Madrid=100). El alquiler puede ser un 40-50% inferior al de Barcelona, con una calidad de vida comparable en términos de servicios públicos, sanidad y ocio.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo afecta el teletrabajo a la elección de ciudad?</dt>
              <dd>El teletrabajo ha desacoplado el salario del lugar de residencia. Un trabajador con sueldo de empresa madrileña que se traslada a Sevilla puede ahorrar 600-900 €/mes solo en vivienda, manteniendo el mismo ingreso. Esto ha generado una migración interna notable desde 2021.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre coste de vida y poder adquisitivo?</dt>
              <dd>El coste de vida mide cuánto cuestan las cosas. El poder adquisitivo mide cuánto puedes comprar con tu sueldo. Una ciudad puede tener alto coste de vida pero también salarios más altos, resultando en un poder adquisitivo similar o mayor. Siempre analiza ambas variables juntas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Merece la pena una subida de sueldo del 15% si la ciudad es un 25% más cara?</dt>
              <dd>No, en términos de poder adquisitivo puro. Si tu sueldo sube un 15% pero el coste de vida sube un 25%, perderás aproximadamente un 8% de capacidad de gasto real. Necesitarías una subida de al menos el 25% para mantener el mismo nivel de vida, y más para mejorar.</dd>
            </div>
          </dl>

          {/* ===== SECCIÓN 4: GUÍA PASO A PASO ===== */}
          <h3>Cómo evaluar si un traslado laboral compensa económicamente</h3>
          <p>Sigue estos 7 pasos para tomar la decisión con datos, no con intuición:</p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Calcula tu sueldo neto actual</strong>
                <p>Descuenta IRPF, Seguridad Social y cualquier deducción autonómica. Es la cifra real con la que operas, no el bruto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Calcula el sueldo neto en la ciudad destino</strong>
                <p>Atención: el IRPF varía por Comunidad Autónoma. Un mismo bruto puede suponer entre 50 y 300 € netos de diferencia según la CCAA.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Compara el alquiler equivalente</strong>
                <p>Busca el coste de un piso similar (zona, tamaño, calidades) en la ciudad destino. Es el mayor factor diferencial: puede suponer 400-800 €/mes más o menos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Suma los costes de transporte</strong>
                <p>Incluye bono mensual de transporte público, parking si aplica y desplazamientos frecuentes a tu ciudad de origen para visitar familia.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Estima alimentación y ocio</strong>
                <p>Usa el índice de supermercado y restaurantes de este comparador como referencia. Una diferencia del 10-15% en alimentación puede suponer 30-50 €/mes.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Calcula el ahorro resultante en ambas ciudades</strong>
                <p>Sueldo neto − (alquiler + transporte + alimentación + ocio + suministros) = ahorro mensual. Compara el resultado en origen y destino.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Incluye factores no económicos</strong>
                <p>Calidad del sistema sanitario, red de contactos profesionales, clima, idioma local y conciliación familiar también determinan si el traslado vale la pena a largo plazo.</p>
              </div>
            </li>
          </ol>

          {/* ===== SECCIÓN 5: MEJORES PRÁCTICAS ===== */}
          <h3>6 claves para comparar ciudades correctamente</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Trabaja siempre en porcentaje de sueldo neto</strong>
              <p>Que un alquiler cueste 800 € o 1.400 € no dice nada sin saber si cobras 1.800 € o 3.500 € netos. Usa el porcentaje: lo recomendable es destinar menos del 30% del neto a vivienda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚇</span>
              <strong>Incluye el coste real de los desplazamientos</strong>
              <p>Vivir en la periferia para ahorrar alquiler puede compensarse con 60-120 €/mes en transporte y 1-2 horas diarias. Calcula el coste total del trayecto, incluyendo tu tiempo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏘️</span>
              <strong>Compara también zonas periféricas</strong>
              <p>El precio del centro es el peor caso. Barrios bien conectados a 20 min del centro pueden costar un 25-40% menos en alquiler, con calidad de vida comparable o mejor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏥</span>
              <strong>Valora la calidad de los servicios públicos</strong>
              <p>Una ciudad más barata con peor sanidad pública, educación o seguridad puede implicar gastos privados que no aparecen en el índice. Consulta rankings de calidad de vida municipal.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Actualiza los datos antes de decidir</strong>
              <p>El mercado del alquiler en España ha variado un 15-30% en algunas ciudades en los últimos 2 años. Los índices son orientativos; contrasta con portales actualizados (Idealista, Fotocasa) para el barrio concreto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <strong>Considera el coste energético estacional</strong>
              <p>Ciudades del interior peninsular tienen veranos muy calurosos e inviernos fríos, lo que incrementa el gasto en climatización. En la costa mediterránea, el coste energético doméstico suele ser más estable y menor.</p>
            </div>
          </div>

          {/* ===== SECCIÓN 6: WARNING BOX — ERRORES FRECUENTES ===== */}
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes al comparar ciudades</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Comparar precios sin ajustar por sueldo local.</strong> Un alquiler de 800 € en Sevilla y uno de 1.400 € en Madrid pueden representar el mismo porcentaje del sueldo medio local — o ser radicalmente distintos según tu situación concreta.</li>
              <li><strong>Ignorar el coste de suministros en ciudades con clima extremo.</strong> Calefacción en Burgos o aire acondicionado en Sevilla pueden añadir 80-150 €/mes al presupuesto, un coste invisible en los índices estándar.</li>
              <li><strong>Olvidar que el IPC varía por categoría de gasto.</strong> El IPC de alimentación puede subir un 8% mientras el de transporte sube solo un 2%. Si tu gasto principal es alimentación, el impacto real es mayor que el IPC general.</li>
              <li><strong>No incluir ocio y salidas en el presupuesto.</strong> El ocio nocturno, restauración y actividades culturales varían enormemente entre ciudades. En Madrid o Barcelona, un presupuesto de ocio moderado puede suponer 300-500 €/mes; en Salamanca o Valladolid, la mitad.</li>
              <li><strong>Tomar el precio del centro como referencia única.</strong> Los índices de coste de vida suelen usar precios céntricos. La realidad del 80% de los residentes es vivir en zonas periféricas con precios significativamente inferiores.</li>
              <li><strong>Ignorar el impacto del IRPF autonómico al comparar sueldos.</strong> Un sueldo bruto idéntico puede generar hasta 400 €/mes netos de diferencia entre la Comunidad de Madrid (bonificaciones) y otras CCAA con tipos más altos. El sueldo neto real es lo que importa.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('comparador-coste-vida')} />
        <ShareCard appName="comparador-coste-vida" />
      <Footer appName="comparador-coste-vida" />
      </main>
    </div>
  );
}
