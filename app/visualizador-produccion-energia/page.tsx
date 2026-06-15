'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorProduccionEnergia.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'fuentes' | 'mix' | 'coste' | 'futuro';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'fuentes', titulo: 'Las fuentes', icono: '⚡', subtitulo: 'Cómo funciona cada tipo de energía' },
  { id: 'mix', titulo: 'El mix español', icono: '🇪🇸', subtitulo: 'De dónde viene nuestra electricidad' },
  { id: 'coste', titulo: 'Coste y CO₂', icono: '💰', subtitulo: 'Cuánto cuesta y cuánto contamina' },
  { id: 'futuro', titulo: 'El futuro', icono: '🔮', subtitulo: 'Almacenamiento, fusión y retos' },
];

// ─────────────────────────────────────────────
// Datos de fuentes de energía
// ─────────────────────────────────────────────

interface FuenteEnergia {
  id: string;
  nombre: string;
  icono: string;
  resumen: string;
  pasos: string[];
  datos: { label: string; valor: string }[];
  color: string;
}

const FUENTES: FuenteEnergia[] = [
  {
    id: 'nuclear',
    nombre: 'Nuclear',
    icono: '☢️',
    resumen: 'Fisión de átomos de uranio para generar calor',
    pasos: [
      'Pastillas de uranio-235 se colocan en barras de combustible dentro del reactor',
      'Se bombardean con neutrones: el átomo se rompe (fisión) liberando una enorme cantidad de calor',
      'El calor calienta agua, que se convierte en vapor a alta presión',
      'El vapor mueve una turbina conectada a un generador eléctrico',
    ],
    datos: [
      { label: 'Temperatura del reactor', valor: '300 °C' },
      { label: 'Vida útil central', valor: '40-60 años' },
      { label: 'Factor de capacidad', valor: '~90%' },
      { label: 'Residuos', valor: 'Radiactivos (miles de años)' },
    ],
    color: '#9B59B6',
  },
  {
    id: 'solar',
    nombre: 'Solar',
    icono: '☀️',
    resumen: 'Células fotovoltaicas de silicio convierten luz en electricidad',
    pasos: [
      'Los fotones de la luz solar golpean células de silicio en el panel',
      'Los electrones del silicio se liberan, creando una corriente eléctrica (efecto fotovoltaico)',
      'Un inversor transforma la corriente continua (DC) en alterna (AC) para la red',
      'La electricidad se distribuye directamente — sin turbinas ni combustión',
    ],
    datos: [
      { label: 'Eficiencia típica', valor: '20-23%' },
      { label: 'Vida útil panel', valor: '25-30 años' },
      { label: 'Horas pico España', valor: '~1.800 h/año' },
      { label: 'Residuos', valor: 'Reciclables (silicio, vidrio)' },
    ],
    color: '#F39C12',
  },
  {
    id: 'eolica',
    nombre: 'Eólica',
    icono: '🌬️',
    resumen: 'El viento mueve aspas que generan electricidad',
    pasos: [
      'El viento empuja las aspas del aerogenerador (hasta 80 m de largo cada una)',
      'Las aspas hacen girar un rotor conectado a una caja multiplicadora',
      'La caja aumenta las revoluciones: de ~15 rpm a ~1.500 rpm',
      'Un generador convierte la energía mecánica en electricidad',
    ],
    datos: [
      { label: 'Altura torre', valor: '80-160 m' },
      { label: 'Velocidad arranque', valor: '3-4 m/s' },
      { label: 'Potencia típica', valor: '2-5 MW' },
      { label: 'Factor de capacidad', valor: '~25-35%' },
    ],
    color: '#48A9A6',
  },
  {
    id: 'gas',
    nombre: 'Gas natural',
    icono: '🔥',
    resumen: 'Combustión de gas natural para mover turbinas',
    pasos: [
      'Se quema gas natural (metano, CH₄) en una cámara de combustión',
      'Los gases calientes a ~1.400 °C impulsan una turbina de gas (ciclo Brayton)',
      'El calor residual genera vapor que mueve una segunda turbina (ciclo combinado)',
      'Dos generadores producen electricidad — eficiencia del 55-60%',
    ],
    datos: [
      { label: 'Eficiencia ciclo combinado', valor: '55-60%' },
      { label: 'Arranque rápido', valor: '~30 minutos' },
      { label: 'Emisiones vs carbón', valor: '-50% CO₂' },
      { label: 'Dependencia externa', valor: 'Gas importado' },
    ],
    color: '#E67E22',
  },
  {
    id: 'hidraulica',
    nombre: 'Hidráulica',
    icono: '💧',
    resumen: 'Agua cayendo desde una presa mueve turbinas',
    pasos: [
      'Una presa retiene agua a gran altura, almacenando energía potencial',
      'Se abren compuertas: el agua cae por tuberías forzadas a gran velocidad',
      'La fuerza del agua hace girar turbinas (Francis, Pelton o Kaplan)',
      'Un generador acoplado produce electricidad — se puede regular al instante',
    ],
    datos: [
      { label: 'Eficiencia', valor: '85-90%' },
      { label: 'Arranque', valor: 'Segundos' },
      { label: 'Almacenamiento', valor: 'Sí (bombeo)' },
      { label: 'Dependencia', valor: 'Lluvia (variable)' },
    ],
    color: '#3498DB',
  },
  {
    id: 'carbon',
    nombre: 'Carbón',
    icono: '⛏️',
    resumen: 'Quemar carbón para calentar agua y mover turbinas',
    pasos: [
      'El carbón se tritura y se quema en una caldera a ~1.000 °C',
      'El calor hierve agua, generando vapor a alta presión',
      'El vapor mueve una turbina conectada a un generador',
      'Los gases se filtran (parcialmente), pero aún liberan mucho CO₂ y partículas',
    ],
    datos: [
      { label: 'Eficiencia', valor: '33-40%' },
      { label: 'Emisiones CO₂', valor: '820 g/kWh' },
      { label: 'Contaminantes', valor: 'SO₂, NOₓ, partículas' },
      { label: 'Tendencia España', valor: 'En extinción' },
    ],
    color: '#7F8C8D',
  },
];

// ─────────────────────────────────────────────
// Datos del mix eléctrico español
// ─────────────────────────────────────────────

interface MixItem {
  nombre: string;
  porcentaje: number;
  color: string;
}

const MIX_ACTUAL: MixItem[] = [
  { nombre: 'Eólica', porcentaje: 25, color: '#48A9A6' },
  { nombre: 'Nuclear', porcentaje: 21, color: '#9B59B6' },
  { nombre: 'Solar', porcentaje: 15, color: '#F39C12' },
  { nombre: 'Gas natural', porcentaje: 14, color: '#E67E22' },
  { nombre: 'Hidráulica', porcentaje: 10, color: '#3498DB' },
  { nombre: 'Cogeneración', porcentaje: 10, color: '#95A5A6' },
  { nombre: 'Carbón', porcentaje: 2, color: '#7F8C8D' },
  { nombre: 'Otros', porcentaje: 3, color: '#BDC3C7' },
];

interface EvolucionAnio {
  anio: string;
  renovables: number;
  nuclear: number;
  gas: number;
  carbon: number;
  otros: number;
}

const EVOLUCION: EvolucionAnio[] = [
  { anio: '2005', renovables: 19, nuclear: 20, gas: 25, carbon: 28, otros: 8 },
  { anio: '2010', renovables: 33, nuclear: 21, gas: 23, carbon: 8, otros: 15 },
  { anio: '2015', renovables: 37, nuclear: 21, gas: 11, carbon: 20, otros: 11 },
  { anio: '2020', renovables: 44, nuclear: 22, gas: 17, carbon: 2, otros: 15 },
  { anio: '2024', renovables: 50, nuclear: 21, gas: 14, carbon: 2, otros: 13 },
];

const COLORES_EVOLUCION: { nombre: string; color: string }[] = [
  { nombre: 'Renovables', color: '#27ae60' },
  { nombre: 'Nuclear', color: '#9B59B6' },
  { nombre: 'Gas', color: '#E67E22' },
  { nombre: 'Carbón', color: '#7F8C8D' },
  { nombre: 'Otros', color: '#BDC3C7' },
];

// ─────────────────────────────────────────────
// Datos de coste y CO2
// ─────────────────────────────────────────────

interface CosteEmisiones {
  nombre: string;
  costeMin: number;
  costeMax: number;
  co2: number;
  color: string;
}

const COSTES: CosteEmisiones[] = [
  { nombre: 'Solar', costeMin: 3, costeMax: 5, co2: 40, color: '#F39C12' },
  { nombre: 'Eólica', costeMin: 3, costeMax: 6, co2: 11, color: '#48A9A6' },
  { nombre: 'Nuclear', costeMin: 5, costeMax: 10, co2: 12, color: '#9B59B6' },
  { nombre: 'Gas', costeMin: 8, costeMax: 12, co2: 490, color: '#E67E22' },
  { nombre: 'Carbón', costeMin: 10, costeMax: 15, co2: 820, color: '#7F8C8D' },
];

const MAX_COSTE = 15;
const MAX_CO2 = 820;

// ─────────────────────────────────────────────
// Sección 1: Las fuentes
// ─────────────────────────────────────────────

function SeccionFuentes() {
  const [fuenteActiva, setFuenteActiva] = useState<string | null>(null);

  const fuente = FUENTES.find(f => f.id === fuenteActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Existen muchas formas de generar electricidad, pero todas (salvo la solar fotovoltaica) comparten un principio: <strong>mover una turbina conectada a un generador</strong>. Lo que cambia es la fuente de calor o movimiento.</p>
      </div>

      <div className={styles.fuentesGrid}>
        {FUENTES.map(f => (
          <div
            key={f.id}
            className={`${styles.fuenteCard} ${fuenteActiva === f.id ? styles.fuenteCardActiva : ''}`}
            onClick={() => setFuenteActiva(fuenteActiva === f.id ? null : f.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFuenteActiva(fuenteActiva === f.id ? null : f.id); } }}
            aria-expanded={fuenteActiva === f.id}
            aria-label={`Ver detalle de energía ${f.nombre}`}
          >
            <span className={styles.fuenteIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.fuenteNombre}>{f.nombre}</span>
            <span className={styles.fuenteResumen}>{f.resumen}</span>
          </div>
        ))}
      </div>

      {fuente && (
        <div className={styles.fuenteDetalle}>
          <div className={styles.fuenteDetalleTitulo}>
            <span aria-hidden="true">{fuente.icono}</span>{' '}Cómo funciona: {fuente.nombre}
          </div>
          <div className={styles.fuentePasos}>
            {fuente.pasos.map((paso, i) => (
              <div key={i} className={styles.fuentePaso}>
                <span className={styles.fuentePasoNum}>{i + 1}</span>
                <span className={styles.fuentePasoTexto}>{paso}</span>
              </div>
            ))}
          </div>
          <div className={styles.fuenteDatos}>
            {fuente.datos.map((d, i) => (
              <div key={i} className={styles.fuenteDato}>
                <span className={styles.fuenteDatoLabel}>{d.label}</span>
                <span className={styles.fuenteDatoValor}>{d.valor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          La clave: <strong>solar fotovoltaica</strong> es la única fuente que no necesita turbina — convierte
          la luz directamente en electricidad. Todas las demás calientan un fluido o usan un movimiento
          mecánico para girar un generador.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: El mix español
// ─────────────────────────────────────────────

function SeccionMix() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>España genera electricidad combinando varias fuentes. En los últimos 20 años, las <strong>renovables han pasado del 19% al 50%</strong> del total, mientras el carbón prácticamente ha desaparecido.</p>
      </div>

      {/* Barra apilada horizontal */}
      <div className={styles.mixContainer}>
        <div className={styles.mixTitulo}>Mix eléctrico de España (2024)</div>
        <div className={styles.mixBarra}>
          {MIX_ACTUAL.map((item, i) => (
            <div
              key={i}
              className={styles.mixSegmento}
              style={{ width: `${item.porcentaje}%`, background: item.color }}
              title={`${item.nombre}: ${item.porcentaje}%`}
            >
              {item.porcentaje >= 8 ? `${item.porcentaje}%` : ''}
            </div>
          ))}
        </div>
        <div className={styles.mixLeyenda}>
          {MIX_ACTUAL.map((item, i) => (
            <div key={i} className={styles.mixLeyendaItem}>
              <span className={styles.mixLeyendaColor} style={{ background: item.color }} />
              <span className={styles.mixLeyendaTexto}>{item.nombre} ({item.porcentaje}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolución temporal */}
      <div className={styles.evolucionCard}>
        <div className={styles.evolucionTitulo}>Evolución del mix eléctrico (2005-2024)</div>
        {EVOLUCION.map((anio, i) => (
          <div key={i} className={styles.evolucionFila}>
            <span className={styles.evolucionAnio}>{anio.anio}</span>
            <div className={styles.evolucionBarraContainer}>
              <div className={styles.evolucionSegmento} style={{ width: `${anio.renovables}%`, background: '#27ae60' }} title={`Renovables: ${anio.renovables}%`}>
                {anio.renovables >= 10 ? `${anio.renovables}%` : ''}
              </div>
              <div className={styles.evolucionSegmento} style={{ width: `${anio.nuclear}%`, background: '#9B59B6' }} title={`Nuclear: ${anio.nuclear}%`} />
              <div className={styles.evolucionSegmento} style={{ width: `${anio.gas}%`, background: '#E67E22' }} title={`Gas: ${anio.gas}%`} />
              <div className={styles.evolucionSegmento} style={{ width: `${anio.carbon}%`, background: '#7F8C8D' }} title={`Carbón: ${anio.carbon}%`} />
              <div className={styles.evolucionSegmento} style={{ width: `${anio.otros}%`, background: '#BDC3C7' }} title={`Otros: ${anio.otros}%`} />
            </div>
            <span className={styles.evolucionValor}>{anio.renovables}% <span style={{ fontSize: '0.65rem', color: '#27ae60' }}>ren.</span></span>
          </div>
        ))}
        <div className={styles.mixLeyenda} style={{ marginTop: '1rem' }}>
          {COLORES_EVOLUCION.map((item, i) => (
            <div key={i} className={styles.mixLeyendaItem}>
              <span className={styles.mixLeyendaColor} style={{ background: item.color }} />
              <span className={styles.mixLeyendaTexto}>{item.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Renovables 2005</span>
          <span className={styles.statValor}>19%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Renovables 2024</span>
          <span className={styles.statValor} style={{ color: '#27ae60' }}>50%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Carbón 2005 → 2024</span>
          <span className={styles.statValor}>28% → 2%</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          En solo 20 años, España ha <strong>triplicado la generación renovable</strong> y prácticamente
          eliminado el carbón. La eólica es hoy la primera fuente de electricidad del país, y la solar
          crece a un ritmo sin precedentes.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Coste y CO2
// ─────────────────────────────────────────────

function SeccionCoste() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>No todas las fuentes cuestan lo mismo ni contaminan igual. Las renovables ya son <strong>las más baratas</strong> y de las que menos CO₂ emiten en todo su ciclo de vida.</p>
      </div>

      <div className={styles.costeLeyenda}>
        <div className={styles.costeLeyendaItem}>
          <span className={styles.costeLeyendaColor} style={{ background: '#2E86AB' }} />
          <span className={styles.costeLeyendaTexto}>Coste (ct€/kWh)</span>
        </div>
        <div className={styles.costeLeyendaItem}>
          <span className={styles.costeLeyendaColor} style={{ background: '#e74c3c' }} />
          <span className={styles.costeLeyendaTexto}>CO₂ (g/kWh)</span>
        </div>
      </div>

      <div className={styles.costeContainer}>
        {COSTES.map((fuente, i) => {
          const costeMedio = (fuente.costeMin + fuente.costeMax) / 2;
          const anchuraCoste = (costeMedio / MAX_COSTE) * 100;
          const anchuraCo2 = (fuente.co2 / MAX_CO2) * 100;

          return (
            <div key={i} className={styles.costeFila}>
              <span className={styles.costeNombre}>{fuente.nombre}</span>
              <div className={styles.costeBarras}>
                <div className={styles.costeBarra}>
                  <div
                    className={styles.costeBarraFill}
                    style={{ width: `${anchuraCoste}%`, background: '#2E86AB' }}
                  >
                    <span className={styles.costeBarraLabel}>
                      {anchuraCoste > 15 ? `${fuente.costeMin}-${fuente.costeMax}` : ''}
                    </span>
                  </div>
                  <span className={styles.costeBarraValor}>{fuente.costeMin}-{fuente.costeMax} ct€</span>
                </div>
                <div className={styles.costeBarra}>
                  <div
                    className={styles.costeBarraFill}
                    style={{ width: `${anchuraCo2}%`, background: '#e74c3c' }}
                  >
                    <span className={styles.costeBarraLabel}>
                      {anchuraCo2 > 15 ? `${formatNumber(fuente.co2, 0)}` : ''}
                    </span>
                  </div>
                  <span className={styles.costeBarraValor}>{formatNumber(fuente.co2, 0)} g CO₂</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Más barata</span>
          <span className={styles.statValor} style={{ color: '#27ae60' }}>Solar (3-5 ct€)</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Menos CO₂</span>
          <span className={styles.statValor} style={{ color: '#27ae60' }}>Eólica (11 g)</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Más contaminante</span>
          <span className={styles.statValor} style={{ color: '#e74c3c' }}>Carbón (820 g)</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El carbón emite <strong>75 veces más CO₂</strong> que la eólica por cada kWh generado, y es
          además la fuente más cara. Nuclear y eólica tienen emisiones similares (~11-12 g), pero la
          nuclear es más cara y genera residuos radiactivos. Las renovables han ganado la batalla
          económica y ambiental.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: El futuro
// ─────────────────────────────────────────────

function SeccionFuturo() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las renovables son baratas y limpias, pero tienen un problema: <strong>el sol no siempre brilla y el viento no siempre sopla</strong>. El futuro pasa por resolver el almacenamiento y la estabilidad de la red.</p>
      </div>

      <div className={styles.futuroGrid}>
        <div className={styles.futuroCard}>
          <span className={styles.futuroIcono} aria-hidden="true">🔋</span>
          <div className={styles.futuroTitulo}>Baterías a gran escala</div>
          <p className={styles.futuroDesc}>
            Baterías de iones de litio (y próximamente de sodio o estado sólido) almacenan electricidad
            renovable sobrante para usarla cuando no hay sol ni viento. Australia ya tiene instalaciones
            de 300 MW.
          </p>
          <p className={styles.futuroDetalle}>
            Limitación actual: coste elevado para almacenar más de 4-8 horas. Se investigan baterías de flujo y hierro-aire para almacenamiento de larga duración.
          </p>
        </div>

        <div className={styles.futuroCard}>
          <span className={styles.futuroIcono} aria-hidden="true">💧</span>
          <div className={styles.futuroTitulo}>Bombeo hidráulico</div>
          <p className={styles.futuroDesc}>
            La &quot;batería&quot; más antigua y probada: cuando sobra electricidad, se bombea agua cuesta arriba
            a un embalse. Cuando falta, se deja caer para generar. España tiene 3.300 MW instalados.
          </p>
          <p className={styles.futuroDetalle}>
            Eficiencia del 75-80%. Requiere topografía adecuada (dos embalses a distinta altura). Es la forma de almacenamiento más madura del mundo.
          </p>
        </div>

        <div className={styles.futuroCard}>
          <span className={styles.futuroIcono} aria-hidden="true">🧪</span>
          <div className={styles.futuroTitulo}>Hidrógeno verde</div>
          <p className={styles.futuroDesc}>
            Usar electricidad renovable para separar el agua en hidrógeno y oxígeno (electrólisis).
            El hidrógeno se almacena y luego se usa para generar electricidad, mover vehículos pesados
            o producir calor industrial.
          </p>
          <p className={styles.futuroDetalle}>
            Todavía caro (3-6 €/kg vs 1-2 €/kg del gris). España quiere ser uno de los principales productores europeos gracias a su excedente solar.
          </p>
        </div>

        <div className={styles.futuroCard}>
          <span className={styles.futuroIcono} aria-hidden="true">🌟</span>
          <div className={styles.futuroTitulo}>Fusión nuclear (ITER)</div>
          <p className={styles.futuroDesc}>
            En vez de romper átomos (fisión), unir átomos de hidrógeno como hace el Sol. Energía
            prácticamente ilimitada, sin residuos radiactivos de larga vida ni riesgo de accidente nuclear.
          </p>
          <p className={styles.futuroDetalle}>
            ITER (Francia) busca demostrar la viabilidad en 2035. Producir electricidad comercial: 2050-2060 como muy pronto. El reto: confinar plasma a 150 millones de °C.
          </p>
        </div>
      </div>

      {/* Retos pendientes */}
      <div className={styles.futuroCard} style={{ marginBottom: '1.5rem' }}>
        <span className={styles.futuroIcono} aria-hidden="true">⚠️</span>
        <div className={styles.futuroTitulo}>Los 3 grandes retos</div>
        <p className={styles.futuroDesc}>
          <strong>1. Intermitencia:</strong> las renovables dependen del clima. Un anticiclón sin viento
          puede dejar a la eólica a mínimos durante días.
        </p>
        <p className={styles.futuroDesc}>
          <strong>2. Estabilidad de red:</strong> las centrales térmicas y nucleares proporcionan inercia
          rotacional que estabiliza la frecuencia (50 Hz). Las renovables no — se necesitan inversores
          avanzados y baterías que simulen esa inercia.
        </p>
        <p className={styles.futuroDesc}>
          <strong>3. Carga base:</strong> hospitales, fábricas y centros de datos necesitan electricidad
          24/7. Hasta que el almacenamiento masivo sea viable, las centrales de gas y nuclear cubren
          este papel.
        </p>
      </div>

      {/* Objetivos España 2030 */}
      <div className={styles.objetivosCard}>
        <div className={styles.objetivosTitulo}>Objetivos de España para 2030 (PNIEC)</div>
        <div className={styles.objetivosGrid}>
          <div className={styles.objetivoItem}>
            <span className={styles.objetivoValor}>74%</span>
            <span className={styles.objetivoLabel}>Renovables en electricidad</span>
          </div>
          <div className={styles.objetivoItem}>
            <span className={styles.objetivoValor}>48%</span>
            <span className={styles.objetivoLabel}>Renovables en energía total</span>
          </div>
          <div className={styles.objetivoItem}>
            <span className={styles.objetivoValor}>-32%</span>
            <span className={styles.objetivoLabel}>Emisiones GEI vs 1990</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La transición energética no es solo cuestión de instalar paneles y molinos — requiere
          <strong> reinventar cómo almacenamos y distribuimos electricidad</strong>. La buena noticia:
          España tiene sol, viento y una red eléctrica cada vez más inteligente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorProduccionEnergiaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('fuentes');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'fuentes': return <SeccionFuentes />;
      case 'mix': return <SeccionMix />;
      case 'coste': return <SeccionCoste />;
      case 'futuro': return <SeccionFuturo />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo se Produce la Energía</h1>
          <p className={styles.subtitle}>Del átomo al enchufe — las fuentes que encienden el mundo</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}</span>
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre producción de energía"
          subtitle="Conceptos clave del sistema eléctrico"
          defaultOpen={false}
        >
          <h3>¿Qué es un kWh?</h3>
          <p>
            Un <strong>kilovatio-hora (kWh)</strong> es la unidad estándar de energía eléctrica. Equivale
            a la energía que consume un aparato de 1.000 vatios funcionando durante 1 hora. Un hogar
            español medio consume unos 3.500 kWh al año.
          </p>

          <h3>¿Por qué se mide el CO₂ por kWh?</h3>
          <p>
            Para comparar fuentes de forma justa se miden las <strong>emisiones de ciclo de vida</strong>:
            no solo la combustión, sino también la fabricación de paneles, construcción de centrales,
            extracción de combustible y desmantelamiento. Por eso la solar (40 g) no es cero aunque
            no queme nada.
          </p>

          <h3>¿España puede funcionar solo con renovables?</h3>
          <p>
            Técnicamente sí, pero no hoy. Necesitamos almacenamiento masivo (baterías, bombeo, hidrógeno)
            para cubrir las horas sin sol ni viento. El objetivo del PNIEC es alcanzar el 74% renovable
            en generación eléctrica para 2030, manteniendo gas y nuclear como respaldo.
          </p>

          <h3>¿Qué pasa con la energía nuclear en España?</h3>
          <p>
            España tiene 5 reactores nucleares en funcionamiento que generan ~21% de la electricidad.
            Está previsto el cierre gradual entre 2027 y 2035 según el calendario del PNIEC. No hay
            planes de construir nuevas centrales. El debate sobre extender su vida útil sigue abierto.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de costes y emisiones son valores medios orientativos basados
            en informes de la AIE (Agencia Internacional de la Energía) y REE (Red Eléctrica de España).
            Los costes reales dependen de la ubicación, tecnología específica, regulación y mercado
            mayorista. Las cifras del mix eléctrico son aproximadas para 2024.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-produccion-energia')} />
        <ShareCard appName="visualizador-produccion-energia" />
        <Footer appName="visualizador-produccion-energia" />
      </div>
    </>
  );
}
