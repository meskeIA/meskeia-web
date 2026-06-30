'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './MercadoInmobiliario.module.css';

// ── Tipos ──────────────────────────────────────────────────────────────────
type ModoOfertaDemanda = 'base' | 'demanda' | 'oferta';

interface DatoBurbuja {
  anio: number;
  indice: number;
  nota?: string;
}

interface CiudadRatio {
  ciudad: string;
  anios: number;
  precio: string;
  salario: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────
const DATOS_BURBUJA: DatoBurbuja[] = [
  { anio: 2000, indice: 100 },
  { anio: 2002, indice: 125 },
  { anio: 2004, indice: 160 },
  { anio: 2006, indice: 200 },
  { anio: 2007, indice: 210, nota: 'Pico burbuja' },
  { anio: 2008, indice: 195, nota: 'Lehman Brothers' },
  { anio: 2010, indice: 165 },
  { anio: 2012, indice: 140, nota: 'Mínimo 2012' },
  { anio: 2014, indice: 130 },
  { anio: 2016, indice: 135 },
  { anio: 2018, indice: 155 },
  { anio: 2020, indice: 160 },
  { anio: 2022, indice: 185 },
  { anio: 2024, indice: 210, nota: 'Nuevos máximos' },
];

const CIUDADES: CiudadRatio[] = [
  { ciudad: 'San Sebastián', anios: 14.5, precio: '390.000€', salario: '26.900€' },
  { ciudad: 'Barcelona',     anios: 14.2, precio: '380.000€', salario: '26.800€' },
  { ciudad: 'Palma',         anios: 13.1, precio: '354.000€', salario: '27.000€' },
  { ciudad: 'Madrid',        anios: 12.8, precio: '345.000€', salario: '26.950€' },
  { ciudad: 'Valencia',      anios: 9.8,  precio: '265.000€', salario: '27.000€' },
  { ciudad: 'Sevilla',       anios: 8.2,  precio: '222.000€', salario: '27.100€' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function colorRatio(anios: number): string {
  if (anios < 8) return '#22c55e';
  if (anios <= 12) return '#f59e0b';
  return '#ef4444';
}

function pctRatio(anios: number): number {
  // Normaliza de 0 a 100 sobre un máximo de 16 años
  return Math.min((anios / 16) * 100, 100);
}

// ── SVG: Curvas Oferta/Demanda ─────────────────────────────────────────────
function GraficaOfertaDemanda({ modo }: { modo: ModoOfertaDemanda }) {
  // Dimensiones del SVG interno
  const W = 340;
  const H = 240;
  const PAD = 40;

  // Offset según modo
  const demandaOffset = modo === 'demanda' ? -40 : 0;   // demanda se desplaza derecha (x+)
  const ofertaOffset  = modo === 'oferta'  ?  40 : 0;   // oferta se desplaza izquierda (x-)

  // Curva de demanda (descendente): p1 arriba-izquierda → p2 abajo-derecha
  const dX1 = PAD + demandaOffset;
  const dY1 = PAD;
  const dX2 = W - PAD + demandaOffset;
  const dY2 = H - PAD;

  // Curva de oferta (ascendente): p1 abajo-izquierda → p2 arriba-derecha
  const oX1 = PAD - ofertaOffset;
  const oY1 = H - PAD;
  const oX2 = W - PAD - ofertaOffset;
  const oY2 = PAD;

  // Punto de equilibrio: intersección aproximada de las dos líneas rectas
  // Demanda: y = dY1 + (dY2-dY1)/(dX2-dX1) * (x - dX1)
  // Oferta:  y = oY1 + (oY2-oY1)/(oX2-oX1) * (x - oX1)
  const mD = (dY2 - dY1) / (dX2 - dX1);
  const mO = (oY2 - oY1) / (oX2 - oX1);
  const eqX = (oY1 - dY1 + mD * dX1 - mO * oX1) / (mD - mO);
  const eqY = dY1 + mD * (eqX - dX1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-label="Gráfica de curvas de oferta y demanda"
      role="img"
    >
      {/* Ejes */}
      <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD + 10} stroke="var(--text-secondary)" strokeWidth="1.5" />
      <line x1={PAD - 10} y1={H - PAD} x2={W - PAD + 10} y2={H - PAD} stroke="var(--text-secondary)" strokeWidth="1.5" />
      {/* Etiqueta eje Y */}
      <text x={PAD - 6} y={PAD - 14} fontSize="10" fill="var(--text-secondary)" textAnchor="middle">Precio</text>
      {/* Etiqueta eje X */}
      <text x={(W - PAD + 10) + 2} y={H - PAD + 4} fontSize="9" fill="var(--text-secondary)" textAnchor="start">Cantidad</text>

      {/* Curva de demanda */}
      <line
        x1={dX1} y1={dY1}
        x2={dX2} y2={dY2}
        stroke="#2E86AB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text x={dX2 + 4} y={dY2 + 4} fontSize="11" fill="#2E86AB" fontWeight="700">D</text>

      {/* Curva de oferta */}
      <line
        x1={oX1} y1={oY1}
        x2={oX2} y2={oY2}
        stroke="#48A9A6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text x={oX2 + 4} y={oY2 + 4} fontSize="11" fill="#48A9A6" fontWeight="700">O</text>

      {/* Punto de equilibrio */}
      {eqX > PAD && eqX < W - PAD && eqY > PAD && eqY < H - PAD && (
        <>
          <circle cx={eqX} cy={eqY} r={6} fill="#F4A261" stroke="white" strokeWidth="1.5" />
          <text x={eqX + 8} y={eqY - 4} fontSize="10" fill="#F4A261" fontWeight="700">E</text>
          {/* Líneas punteadas al equilibrio */}
          <line x1={PAD} y1={eqY} x2={eqX} y2={eqY} stroke="#F4A261" strokeWidth="1" strokeDasharray="4 3" />
          <line x1={eqX} y1={H - PAD} x2={eqX} y2={eqY} stroke="#F4A261" strokeWidth="1" strokeDasharray="4 3" />
        </>
      )}
    </svg>
  );
}

// ── SVG: Gráfica de Burbuja ────────────────────────────────────────────────
function GraficaBurbuja() {
  const W = 560;
  const H = 240;
  const PAD_L = 44;
  const PAD_R = 20;
  const PAD_T = 24;
  const PAD_B = 32;

  const minAnio = DATOS_BURBUJA[0].anio;
  const maxAnio = DATOS_BURBUJA[DATOS_BURBUJA.length - 1].anio;
  const minIdx = 80;
  const maxIdx = 230;

  function xPx(anio: number) {
    return PAD_L + ((anio - minAnio) / (maxAnio - minAnio)) * (W - PAD_L - PAD_R);
  }
  function yPx(idx: number) {
    return PAD_T + ((maxIdx - idx) / (maxIdx - minIdx)) * (H - PAD_T - PAD_B);
  }

  const puntos = DATOS_BURBUJA.map(d => `${xPx(d.anio)},${yPx(d.indice)}`).join(' ');

  // Línea de referencia: índice 100 (año 2000)
  const yBase = yPx(100);

  // Hitos a marcar
  const hitos = DATOS_BURBUJA.filter(d => d.nota);

  // Líneas de guía horizontales
  const guias = [100, 140, 180, 210];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-label="Gráfico histórico de índice de precios de vivienda en España 2000-2024"
      role="img"
    >
      {/* Líneas de guía */}
      {guias.map(g => (
        <g key={g}>
          <line x1={PAD_L} y1={yPx(g)} x2={W - PAD_R} y2={yPx(g)} stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="3 3" />
          <text x={PAD_L - 4} y={yPx(g) + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">{g}</text>
        </g>
      ))}

      {/* Eje X: años */}
      {[2000, 2004, 2008, 2012, 2016, 2020, 2024].map(a => (
        <text key={a} x={xPx(a)} y={H - PAD_B + 14} fontSize="9" fill="var(--text-secondary)" textAnchor="middle">{a}</text>
      ))}

      {/* Etiqueta eje Y */}
      <text x={6} y={H / 2} fontSize="9" fill="var(--text-secondary)" textAnchor="middle" transform={`rotate(-90, 6, ${H / 2})`}>Índice (2000=100)</text>

      {/* Zona burbuja sombreada (2004–2008) */}
      <rect
        x={xPx(2004)} y={PAD_T}
        width={xPx(2008) - xPx(2004)}
        height={H - PAD_T - PAD_B}
        fill="rgba(239,68,68,0.07)"
      />

      {/* Línea base 100 */}
      <line x1={PAD_L} y1={yBase} x2={W - PAD_R} y2={yBase} stroke="#2E86AB" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.5" />

      {/* Polilínea de precios */}
      <polyline
        points={puntos}
        fill="none"
        stroke="#2E86AB"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Puntos de datos */}
      {DATOS_BURBUJA.map(d => (
        <circle
          key={d.anio}
          cx={xPx(d.anio)} cy={yPx(d.indice)}
          r={d.nota ? 5 : 3}
          fill={d.nota ? '#F4A261' : '#2E86AB'}
          stroke="white"
          strokeWidth="1"
        />
      ))}

      {/* Etiquetas de hitos */}
      {hitos.map((d, i) => {
        const cx = xPx(d.anio);
        const cy = yPx(d.indice);
        // Alternar arriba/abajo para evitar solapamientos
        const dy = i % 2 === 0 ? -12 : 14;
        return (
          <text
            key={d.anio}
            x={cx}
            y={cy + dy}
            fontSize="8.5"
            fill="#F4A261"
            fontWeight="700"
            textAnchor="middle"
          >
            {d.nota}
          </text>
        );
      })}
    </svg>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────
export default function VisualizadorMercadoInmobiliario() {
  const [modo, setModo] = useState<ModoOfertaDemanda>('base');

  const etiquetasModo: Record<ModoOfertaDemanda, string> = {
    base: 'Equilibrio base: oferta y demanda en balance.',
    demanda: 'Aumenta la demanda (inmigración, millennials en edad de compra): la curva D se desplaza a la derecha → precio sube.',
    oferta: 'Restricción de oferta (suelo protegido, burocracia, costes): la curva O se desplaza a la izquierda → precio sube.',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Mercado Inmobiliario</h1>
        <p>Burbuja 2008, accesibilidad generacional y ratio precio/renta por ciudad</p>
      </header>

      <div className={styles.main}>
        <LegalNotice />

        {/* ── Sección 1: Oferta y Demanda ── */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Curvas de oferta y demanda</h2>
          <p className={styles.descripcionSeccion}>
            El precio de la vivienda lo determina la intersección entre quienes quieren comprar
            (demanda) y quienes ponen viviendas en el mercado (oferta). Interactúa con los botones
            para ver cómo se desplazan las curvas.
          </p>

          <div className={styles.botonesOfertaDemanda}>
            <button
              type="button"
              className={`${styles.btnModo} ${modo === 'base' ? styles.btnModoActivo : ''}`}
              onClick={() => setModo('base')}
              aria-pressed={modo === 'base'}
            >
              Equilibrio base
            </button>
            <button
              type="button"
              className={`${styles.btnModo} ${modo === 'demanda' ? styles.btnModoActivo : ''}`}
              onClick={() => setModo('demanda')}
              aria-pressed={modo === 'demanda'}
            >
              Aumentar demanda
            </button>
            <button
              type="button"
              className={`${styles.btnModo} ${modo === 'oferta' ? styles.btnModoActivo : ''}`}
              onClick={() => setModo('oferta')}
              aria-pressed={modo === 'oferta'}
            >
              Restricción de oferta
            </button>
          </div>

          <div className={styles.graficaWrapper}>
            <GraficaOfertaDemanda modo={modo} />
          </div>

          <p className={styles.etiquetaModo} role="status" aria-live="polite">
            {etiquetasModo[modo]}
          </p>

          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaColorD} aria-hidden="true" /> Demanda (D)
            </span>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaColorO} aria-hidden="true" /> Oferta (O)
            </span>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaColorE} aria-hidden="true" /> Equilibrio (E)
            </span>
          </div>
        </section>

        {/* ── Sección 2: Burbuja 2008 ── */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>La burbuja inmobiliaria de 2008</h2>
          <p className={styles.descripcionSeccion}>
            Índice de precios de vivienda en España (base 100 en el año 2000). La zona sombreada en
            rojo marca los años de mayor sobrecalentamiento del mercado.
          </p>

          <div className={styles.graficaWrapper}>
            <GraficaBurbuja />
          </div>

          <p className={styles.notaGrafica}>
            <strong>Nota:</strong> los precios reales (ajustados por IPC) siguen por debajo del
            pico nominal de 2007. Los nuevos máximos de 2024 son nominales.
          </p>

          <div className={styles.hitosGrid}>
            {[
              { anio: '2007', icono: '📈', texto: 'Pico burbuja: índice 210. Crédito hipotecario sin control, suelos sobrevalorados.' },
              { anio: '2008', icono: '🏦', texto: 'Lehman Brothers (sept 2008): el crédito se congela y los precios inician la caída.' },
              { anio: '2012', icono: '📉', texto: 'Mínimo post-burbuja: índice 130. Rescate bancario europeo a España.' },
              { anio: '2024', icono: '🔴', texto: 'Nuevos máximos nominales: índice 210. La oferta sigue sin crecer al ritmo de la demanda.' },
            ].map(h => (
              <div key={h.anio} className={styles.hitoCard}>
                <span className={styles.hitoIcono} aria-hidden="true">{h.icono}</span>
                <strong className={styles.hitoAnio}>{h.anio}</strong>
                <p className={styles.hitoTexto}>{h.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sección 3: Ratio precio/renta ── */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Ratio precio/renta por ciudad</h2>
          <p className={styles.descripcionSeccion}>
            Años de salario bruto medio necesarios para comprar un piso de 80 m² (precio total ÷
            salario medio bruto anual). El BCE y la ONU consideran saludable un ratio de 4–5 años.
          </p>

          <div className={styles.ciudadesLista}>
            {CIUDADES.map(c => (
              <div key={c.ciudad} className={styles.ciudadFila}>
                <div className={styles.ciudadEncabezado}>
                  <span className={styles.ciudadNombre}>{c.ciudad}</span>
                  <span
                    className={styles.ciudadAnios}
                    style={{ color: colorRatio(c.anios) }}
                  >
                    {c.anios} años
                  </span>
                </div>
                <div className={styles.barraContenedor} role="progressbar" aria-valuenow={c.anios} aria-valuemin={0} aria-valuemax={16} aria-label={`${c.ciudad}: ${c.anios} años`}>
                  <div
                    className={styles.barraRelleno}
                    style={{ width: `${pctRatio(c.anios)}%`, background: colorRatio(c.anios) }}
                  />
                </div>
                <div className={styles.ciudadDetalle}>
                  <span>Piso 80m²: <strong>{c.precio}</strong></span>
                  <span>Salario medio: <strong>{c.salario}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.notaGrafica}>
            Referencia ONU/BCE: ratio saludable = 4–5 años. España supera ampliamente ese umbral
            en todas las grandes ciudades.
          </p>
        </section>

        {/* ── Sección 4: Accesibilidad generacional ── */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Accesibilidad generacional</h2>
          <p className={styles.descripcionSeccion}>
            El esfuerzo necesario para comprar una vivienda ha cambiado radicalmente entre
            generaciones, aunque los tipos de interés sean hoy más bajos.
          </p>

          <div className={styles.generacionesGrid}>
            <div className={styles.generacionCard}>
              <div className={styles.generacionHeader} style={{ background: 'rgba(46,134,171,0.12)' }}>
                <span className={styles.generacionIcono} aria-hidden="true">👨‍👩‍👧</span>
                <h3 className={styles.generacionTitulo}>Generación X</h3>
                <p className={styles.generacionEra}>Compraron en los años 90</p>
              </div>
              <ul className={styles.generacionLista}>
                <li><strong>Precio medio:</strong> ~3× el salario anual</li>
                <li><strong>Tipos de interés:</strong> 8–15% (alto)</li>
                <li><strong>Cuota hipoteca:</strong> ~25% del salario</li>
                <li><strong>Financiación:</strong> posible con un sueldo</li>
              </ul>
              <div className={styles.esfuerzoMeter}>
                <span className={styles.esfuerzoLabel}>Esfuerzo hipotecario</span>
                <div className={styles.esfuerzoBarra}>
                  <div className={styles.esfuerzoRelleno} style={{ width: '25%', background: '#22c55e' }} />
                </div>
                <span className={styles.esfuerzoPct}>~25%</span>
              </div>
            </div>

            <div className={styles.generacionCard}>
              <div className={styles.generacionHeader} style={{ background: 'rgba(239,68,68,0.10)' }}>
                <span className={styles.generacionIcono} aria-hidden="true">🧑‍💻</span>
                <h3 className={styles.generacionTitulo}>Millennials</h3>
                <p className={styles.generacionEra}>Compran en los años 2020s</p>
              </div>
              <ul className={styles.generacionLista}>
                <li><strong>Precio medio:</strong> 8–12× el salario anual</li>
                <li><strong>Tipos de interés:</strong> 3–4,5% (bajo)</li>
                <li><strong>Cuota hipoteca:</strong> 40–50% del salario</li>
                <li><strong>Financiación:</strong> requiere 2 sueldos + ahorro previo</li>
              </ul>
              <div className={styles.esfuerzoMeter}>
                <span className={styles.esfuerzoLabel}>Esfuerzo hipotecario</span>
                <div className={styles.esfuerzoBarra}>
                  <div className={styles.esfuerzoRelleno} style={{ width: '45%', background: '#ef4444' }} />
                </div>
                <span className={styles.esfuerzoPct}>~40–50%</span>
              </div>
            </div>
          </div>

          <p className={styles.notaGrafica}>
            El banco recomendado es no superar el 30–35% del salario neto en hipoteca. Los
            millennials en grandes ciudades superan sistemáticamente ese umbral.
          </p>
        </section>

        {/* ── Sección 5: Alquiler vs Compra ── */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Alquiler vs compra — ¿qué compensa?</h2>
          <p className={styles.descripcionSeccion}>
            El alquiler (arriendo) frente a la compra no tiene una respuesta universal. Depende del
            mercado local, el horizonte temporal y la situación personal. Aquí los factores clave de
            cada opción.
          </p>

          <div className={styles.vsGrid}>
            <div className={styles.vsCard}>
              <div className={styles.vsHeader} style={{ background: 'rgba(46,134,171,0.12)' }}>
                <span aria-hidden="true">🏠</span>
                <h3>A favor de comprar</h3>
              </div>
              <ul className={styles.vsLista}>
                <li>Patrimonio propio a largo plazo</li>
                <li>Protección frente a inflación inmobiliaria</li>
                <li>Sin riesgo de desahucio por decisión del propietario</li>
                <li>Deducción fiscal (si comprada antes de 2013)</li>
                <li>Estabilidad y arraigo familiar</li>
              </ul>
            </div>

            <div className={styles.vsCard}>
              <div className={styles.vsHeader} style={{ background: 'rgba(72,169,166,0.12)' }}>
                <span aria-hidden="true">🔑</span>
                <h3>A favor de alquilar</h3>
              </div>
              <ul className={styles.vsLista}>
                <li>Flexibilidad geográfica y laboral</li>
                <li>Sin costes de mantenimiento ni comunidad a cargo</li>
                <li>Capital libre para invertir si la diferencia mensual se ahorra</li>
                <li>Sin riesgo de caída del valor del activo</li>
                <li>
                  <strong>Regla del 5%:</strong> si el alquiler anual es inferior al 5% del
                  precio de compra, alquilar puede ser más rentable a corto-medio plazo
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Bloque educativo v2.0 ── */}
        <EducationalSection
          title="Economía del mercado de vivienda"
          subtitle="Por qué los pisos son caros y qué factores lo determinan"
        >
          <h3>Qué determina el precio de la vivienda</h3>
          <p>
            La vivienda tiene una <strong>oferta rígida</strong>: construir lleva años, requiere
            suelo disponible y superar una burocracia compleja. Por el contrario, la demanda puede
            cambiar rápidamente (llegada de nuevas generaciones en edad de compra, inmigración,
            cambios demográficos). Esta asimetría explica por qué los precios suben con más facilidad
            de lo que bajan.
          </p>

          <h3>Por qué la vivienda no es como otros mercados</h3>
          <p>
            La vivienda es simultáneamente un <strong>bien de primera necesidad</strong> (todo el
            mundo necesita dónde vivir) y un <strong>activo de inversión</strong> (los inversores la
            compran para obtener rentas o revalorización). Esta doble naturaleza genera tensiones: los
            propietarios desean que los precios suban, mientras los no propietarios necesitan que sean
            asequibles.
          </p>

          <h3>El papel del suelo: el recurso que no se puede fabricar</h3>
          <p>
            El principal limitante de la oferta de vivienda no es el ladrillo ni el cemento, sino el
            <strong> suelo edificable</strong>. En las grandes ciudades, el suelo disponible en zonas
            céntricas o bien comunicadas es finito. Las leyes de protección del suelo, los planeamientos
            urbanísticos y los intereses de los actuales propietarios limitan la conversión de suelo
            rústico o industrial en residencial.
          </p>

          <div className={styles.warningBox} role="note">
            Los datos de precios mostrados en este visualizador son aproximaciones representativas con
            fines exclusivamente educativos. Antes de tomar cualquier decisión de compra, alquiler
            (arriendo) o inversión inmobiliaria, consulta fuentes oficiales (INE, Banco de España, Ministerio de
            Vivienda) y asesórate con profesionales del sector.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-mercado-inmobiliario')} />
        <ShareCard appName="visualizador-mercado-inmobiliario" />
        <Footer appName="visualizador-mercado-inmobiliario" />
      </div>
    </div>
  );
}
