'use client';

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import { formatNumber } from '@/lib/formatters';
import styles from './ComparadorCosteVida.module.css';
import { RESPUESTA_FAQ_COSTE_COSTO } from './metadata';
import {
  CIUDADES as DATOS_CIUDADES,
  CESTA,
  indiceDe,
  pesoAlquiler,
  type DatosCosteVida,
} from './ciudades';

// El índice sale de las partidas (cesta mensual frente a Madrid): ciudades.ts, hallazgo 4503.
type CiudadConIndice = DatosCosteVida & { indice: number };
const CIUDADES: CiudadConIndice[] = DATOS_CIUDADES.map((c) => ({ ...c, indice: indiceDe(c) }));

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

// Las cifras de la guía salen de CIUDADES (hallazgo 4504): antes traía su propio juego de
// cifras (Madrid ~1.400 € de alquiler frente a los 1100 del comparador) y mandaba a usar el
// comparador para ver un 37 % que el comparador no daba.
const NBSP = ' ';
const ciudad = (nombre: string): CiudadConIndice => {
  const c = CIUDADES.find((x) => x.ciudad === nombre);
  if (!c) throw new Error(`Ciudad desconocida: ${nombre}`);
  return c;
};
const MADRID = ciudad('Madrid');
const BARCELONA = ciudad('Barcelona');
const VALENCIA = ciudad('Valencia');
const SEVILLA = ciudad('Sevilla');
const ESPANOLAS = CIUDADES.filter((c) => c.pais === 'España');
const ESPANOLAS_POR_ALQUILER = [...ESPANOLAS].sort((a, b) => b.alquiler - a.alquiler);
const PESOS_ALQUILER = CIUDADES.map(pesoAlquiler);
const PESO_ALQUILER_MIN = Math.min(...PESOS_ALQUILER);
const PESO_ALQUILER_MAX = Math.max(...PESOS_ALQUILER);
const euros = (n: number): string => `${formatNumber(n, 0)}${NBSP}€`;

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
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🏙️</span> Comparador de Coste de Vida</h1>
        <p>Compara el coste de vida —o «costo de vida»— de 55+ ciudades: alquiler, comida, transporte e internet</p>
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
            El índice compara el coste de una cesta mensual de una persona sin vehículo propio con la de
            Madrid (= 100). La cesta suma las cinco partidas de la tabla: el alquiler de un piso de 1 habitación
            en el centro, el supermercado del mes, el abono de transporte público, la fibra e internet y{' '}
            {CESTA.cena} cenas en un restaurante económico (una por semana). Una ciudad con índice 200 tiene una
            cesta que cuesta el doble que la de Madrid. El alquiler es entre el {PESO_ALQUILER_MIN}{NBSP}% y
            el {PESO_ALQUILER_MAX}{NBSP}% de la cesta según la ciudad, así que es la partida que más mueve el índice.
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
          <h3>Coste de vida en las ciudades españolas del comparador</h3>
          <p>
            Las mismas cifras que da el comparador para las ciudades españolas de la lista. El índice compara
            la cesta mensual de cada ciudad con la de Madrid (= 100).
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Ciudad</th>
                  <th>Alquiler 1 hab. centro</th>
                  <th>Supermercado/mes</th>
                  <th>Transporte público/mes</th>
                  <th>Cena restaurante</th>
                  <th>Índice (Madrid=100)</th>
                </tr>
              </thead>
              <tbody>
                {ESPANOLAS.map((c) => (
                  <tr key={c.ciudad}>
                    <td><strong>{c.ciudad}</strong></td>
                    <td>{euros(c.alquiler)}</td>
                    <td>{euros(c.supermercado)}</td>
                    <td>{euros(c.transporte)}</td>
                    <td>{euros(c.cena)}</td>
                    <td><strong>{c.indice}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.fuenteTexto}>
            Estimación basada en Numbeo y otras fuentes públicas · Datos 2025-2026. El alquiler corresponde a un piso de 1 dormitorio en zona céntrica. Variaciones significativas según barrio.
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
                Con Valencia como ciudad A y Barcelona como B, el comparador da a Barcelona un índice un {diffPct(VALENCIA.indice, BARCELONA.indice)}{NBSP}% más alto ({VALENCIA.indice} frente a {BARCELONA.indice}). Con ese aumento salarial, lo que te sobra cada mes podría ser menor que ahora.
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
                La diferencia en alquiler entre Sevilla ({euros(SEVILLA.alquiler)}) y Madrid ({euros(MADRID.alquiler)}) supone unos {euros(MADRID.alquiler - SEVILLA.alquiler)} más al mes solo en vivienda. Un factor determinante para la beca o ayuda familiar.
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
                Con 1.500 €, vivir en Sevilla o Valencia ofrece un margen de ahorro mensual que en Madrid resultaría imposible. El índice {SEVILLA.indice} de Sevilla frente al 100 de Madrid es determinante.
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
              <dd>Aquí, el índice es el coste de la cesta mensual (alquiler de 1 habitación en el centro, supermercado, abono de transporte, internet y {CESTA.cena} cenas en un restaurante económico) dividido entre el de Madrid y multiplicado por 100. Otros índices publicados, como los de Numbeo o ECA International, usan cestas más amplias y sus propios pesos, así que sus cifras no coinciden con estas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué ciudad española es más cara en alquiler?</dt>
              <dd>Entre las ciudades españolas del comparador, {ESPANOLAS_POR_ALQUILER[0].ciudad} tiene el alquiler más alto en zona centro ({euros(ESPANOLAS_POR_ALQUILER[0].alquiler)}/mes por un piso de 1 dormitorio), seguida de {ESPANOLAS_POR_ALQUILER.slice(1).map((c) => `${c.ciudad} (${euros(c.alquiler)})`).join(', ')}. Fuera del centro los precios suelen ser más bajos.</dd>
              <p className={styles.faqTip}>Consejo: compara siempre el alquiler en relación al sueldo neto medio de cada ciudad, no en valor absoluto.</p>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué sueldo necesito para vivir bien en Madrid vs Valencia?</dt>
              <dd>Para un nivel de vida holgado (alquiler individual, ocio, ahorro), en Madrid se estima en torno a 2.500-3.000 €/mes netos, mientras que en Valencia basta con 1.800-2.200 €/mes. La diferencia proviene principalmente del alquiler y del coste del ocio.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Incluye el coste de vida los impuestos?</dt>
              <dd>No. El índice solo recoge las cinco partidas de la cesta mensual (alquiler, supermercado, transporte público, internet y cenas en un restaurante económico). Los impuestos sobre la renta, que varían por Comunidad Autónoma, no están incluidos y pueden alterar significativamente el poder adquisitivo real.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuánto más barato es el interior de España vs la costa?</dt>
              <dd>Las ciudades del interior como Salamanca, Valladolid, Zaragoza o Murcia no están entre las ciudades del comparador. El alquiler puede ser un 40-50% inferior al de Barcelona, con una calidad de vida comparable en términos de servicios públicos, sanidad y ocio.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo afecta el teletrabajo a la elección de ciudad?</dt>
              <dd>El teletrabajo ha desacoplado el salario del lugar de residencia. Un trabajador con sueldo de empresa madrileña que se traslada a Sevilla pagaría, según el comparador, unos {euros(MADRID.alquiler - SEVILLA.alquiler)} menos al mes solo en el alquiler de un piso de 1 habitación en el centro ({euros(SEVILLA.alquiler)} frente a {euros(MADRID.alquiler)}), manteniendo el mismo ingreso. Esto ha generado una migración interna notable desde 2021.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es lo mismo «coste de vida» que «costo de vida»?</dt>
              <dd>{RESPUESTA_FAQ_COSTE_COSTO}</dd>
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

        <RelatedApps />
        <ShareCard appName="comparador-coste-vida" />
      <Footer appName="comparador-coste-vida" />
      </main>
    </div>
  );
}
