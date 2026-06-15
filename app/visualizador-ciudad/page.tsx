'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCiudad.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'subsuelo' | 'moverse' | 'servicios' | 'precio';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'subsuelo', titulo: 'Bajo el suelo', icono: '🕳️', subtitulo: 'Las capas invisibles que sostienen la ciudad' },
  { id: 'moverse', titulo: 'Moverse', icono: '🚌', subtitulo: 'Cómo se mueve un millón de personas cada día' },
  { id: 'servicios', titulo: 'Servicios', icono: '🏥', subtitulo: 'Lo que necesita una ciudad de 1 millón de habitantes' },
  { id: 'precio', titulo: 'El precio', icono: '💰', subtitulo: 'Cuánto cuesta mantener todo esto funcionando' },
];

// ─────────────────────────────────────────────
// Sección 1: Bajo el suelo
// ─────────────────────────────────────────────

interface CapaSubterranea {
  id: string;
  nombre: string;
  icono: string;
  profundidad: string;
  desde: string;
  color: string;
  descripcion: string;
  dato: string;
}

const CAPAS: CapaSubterranea[] = [
  { id: 'agua', nombre: 'Agua potable', icono: '💧', profundidad: '0,8 – 1,5 m', desde: '~1850', color: '#3B82F6', descripcion: 'Red de tuberías que lleva agua limpia a cada edificio.', dato: '4.500 km de tuberías en una ciudad media' },
  { id: 'saneamiento', nombre: 'Alcantarillado', icono: '🚿', profundidad: '1,5 – 4 m', desde: '~1860', color: '#6B7280', descripcion: 'Colectores que recogen aguas residuales y pluviales.', dato: '3.800 km de colectores — muchos del siglo XIX' },
  { id: 'gas', nombre: 'Gas natural', icono: '🔥', profundidad: '0,6 – 1,2 m', desde: '~1870', color: '#F59E0B', descripcion: 'Red de distribución de gas para calefacción y cocinas.', dato: '2.200 km de canalizaciones' },
  { id: 'electricidad', nombre: 'Electricidad', icono: '⚡', profundidad: '0,5 – 1 m', desde: '~1900', color: '#EF4444', descripcion: 'Cables de media y baja tensión enterrados.', dato: '12.000 km de cable (ida y vuelta a Japón)' },
  { id: 'fibra', nombre: 'Fibra óptica', icono: '🌐', profundidad: '0,4 – 0,8 m', desde: '~2000', color: '#8B5CF6', descripcion: 'La capa más reciente: internet de alta velocidad.', dato: '6.000 km de fibra — la capa que más crece' },
  { id: 'metro', nombre: 'Metro / túneles', icono: '🚇', profundidad: '10 – 40 m', desde: '~1920', color: '#2E86AB', descripcion: 'Túneles de transporte subterráneo, aparcamientos, galerías de servicio.', dato: '300 km de túneles en ciudades como Madrid' },
];

function SeccionSubsuelo() {
  const [capasActivas, setCapasActivas] = useState<Set<string>>(new Set(CAPAS.map(c => c.id)));

  const toggleCapa = (id: string) => {
    setCapasActivas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Debajo de cada calle hay <strong>6 capas de infraestructura</strong> acumuladas durante más de 170 años. Activa o desactiva cada capa para ver qué hay bajo tus pies.</p>
      </div>

      {/* Toggles */}
      <div className={styles.toggleGrid}>
        {CAPAS.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.toggleBtn} ${capasActivas.has(c.id) ? styles.toggleActivo : ''}`}
            onClick={() => toggleCapa(c.id)}
            aria-pressed={capasActivas.has(c.id)}
            style={{ '--capa-color': c.color } as React.CSSProperties}
          >
            <span aria-hidden="true">{c.icono}</span>
            <span className={styles.toggleLabel}>{c.nombre}</span>
          </button>
        ))}
      </div>

      {/* Visualización de profundidad */}
      <div className={styles.profundidadVisual}>
        <div className={styles.profundidadSuelo}>
          <span className={styles.profundidadNivel}>Superficie</span>
        </div>
        {CAPAS.filter(c => capasActivas.has(c.id)).map(c => (
          <div
            key={c.id}
            className={styles.capaRow}
            style={{ '--capa-color': c.color } as React.CSSProperties}
          >
            <div className={styles.capaIndicador} />
            <div className={styles.capaInfo}>
              <div className={styles.capaHeader}>
                <span className={styles.capaIcono} aria-hidden="true">{c.icono}</span>
                <strong className={styles.capaNombre}>{c.nombre}</strong>
                <span className={styles.capaFecha}>{c.desde}</span>
              </div>
              <div className={styles.capaDetalles}>
                <span className={styles.capaProfundidad}>{c.profundidad}</span>
                <span className={styles.capaDato}>{c.dato}</span>
              </div>
              <p className={styles.capaDesc}>{c.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Bajo una sola calle de 10 metros de ancho pueden convivir <strong>hasta 6 redes diferentes</strong>,
          cada una instalada en una época distinta. Por eso abrir una zanja siempre es una aventura:
          nadie sabe exactamente qué hay debajo hasta que se excava.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Moverse
// ─────────────────────────────────────────────

interface ModoTransporte {
  icono: string;
  nombre: string;
  tiempoMedio: number; // minutos para 10 km
  co2PorKm: number; // gramos
  capacidad: string;
  coste: string;
  color: string;
}

const MODOS: ModoTransporte[] = [
  { icono: '🚗', nombre: 'Coche', tiempoMedio: 25, co2PorKm: 120, capacidad: '1-5 personas', coste: '0,35 €/km', color: '#EF4444' },
  { icono: '🚌', nombre: 'Autobús', tiempoMedio: 35, co2PorKm: 68, capacidad: '80-120 personas', coste: '1,40 € billete', color: '#F59E0B' },
  { icono: '🚇', nombre: 'Metro', tiempoMedio: 18, co2PorKm: 30, capacidad: '1.200 por tren', coste: '1,50 € billete', color: '#2E86AB' },
  { icono: '🚲', nombre: 'Bicicleta', tiempoMedio: 30, co2PorKm: 0, capacidad: '1 persona', coste: '0 €', color: '#10B981' },
  { icono: '🚶', nombre: 'A pie', tiempoMedio: 120, co2PorKm: 0, capacidad: '1 persona', coste: '0 €', color: '#6B7280' },
  { icono: '🛴', nombre: 'Patinete eléc.', tiempoMedio: 25, co2PorKm: 5, capacidad: '1 persona', coste: '0,15 €/min', color: '#8B5CF6' },
];

const maxCO2 = Math.max(...MODOS.map(m => m.co2PorKm));

function SeccionMoverse() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada día, <strong>un millón de personas</strong> necesitan ir al trabajo, al colegio, al médico. Estos son los modos de transporte y lo que cuestan — en tiempo, dinero y CO₂.</p>
      </div>

      {/* Comparativa de modos */}
      <div className={styles.modosGrid}>
        {MODOS.map(m => (
          <div key={m.nombre} className={styles.modoCard}>
            <div className={styles.modoHeader}>
              <span className={styles.modoIcono} aria-hidden="true">{m.icono}</span>
              <strong className={styles.modoNombre}>{m.nombre}</strong>
            </div>

            <div className={styles.modoStats}>
              <div className={styles.modoStat}>
                <span className={styles.modoStatLabel}><span aria-hidden="true">⏱️</span> 10 km</span>
                <span className={styles.modoStatValor}>{m.tiempoMedio} min</span>
              </div>
              <div className={styles.modoStat}>
                <span className={styles.modoStatLabel}><span aria-hidden="true">💨</span> CO₂/km</span>
                <span className={styles.modoStatValor}>{formatNumber(m.co2PorKm, 0)} g</span>
              </div>
              <div className={styles.modoStat}>
                <span className={styles.modoStatLabel}><span aria-hidden="true">👥</span> Capacidad</span>
                <span className={styles.modoStatValor}>{m.capacidad}</span>
              </div>
              <div className={styles.modoStat}>
                <span className={styles.modoStatLabel}><span aria-hidden="true">💶</span> Coste</span>
                <span className={styles.modoStatValor}>{m.coste}</span>
              </div>
            </div>

            {/* Barra CO₂ */}
            <div className={styles.co2Barra}>
              <div
                className={styles.co2Relleno}
                style={{
                  width: maxCO2 > 0 ? `${(m.co2PorKm / maxCO2) * 100}%` : '0%',
                  backgroundColor: m.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El metro mueve a <strong>1.200 personas por tren</strong> emitiendo 30 g de CO₂/km. Para mover las mismas
          personas en coche harían falta ~900 coches emitiendo {formatNumber(120 * 10, 0)} g cada uno en 10 km.
          La diferencia es abismal: el transporte público no es solo más barato, es <strong>40 veces más eficiente</strong> en emisiones por pasajero.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Servicios
// ─────────────────────────────────────────────

interface ServicioUrbano {
  icono: string;
  nombre: string;
  cantidad: string;
  detalle: string;
  porHabitante?: string;
  escala: number; // 1-100 para bloque proporcional
}

const SERVICIOS: ServicioUrbano[] = [
  { icono: '💧', nombre: 'Agua potable', cantidad: '200 litros/persona/día', detalle: '200 millones de litros diarios para 1M de personas', porHabitante: '200 L/día', escala: 85 },
  { icono: '🗑️', nombre: 'Basura', cantidad: '1,3 kg/persona/día', detalle: '1.300 toneladas de residuos diarios que recoger y tratar', porHabitante: '1,3 kg/día', escala: 70 },
  { icono: '⚡', nombre: 'Electricidad', cantidad: '7,5 kWh/persona/día', detalle: '7,5 millones de kWh al día — equivalente a 3 centrales medianas', porHabitante: '7,5 kWh/día', escala: 80 },
  { icono: '🏥', nombre: 'Hospitales', cantidad: '8-12 hospitales', detalle: '3 camas por cada 1.000 habitantes (media española)', escala: 50 },
  { icono: '🏫', nombre: 'Colegios', cantidad: '~500 centros', detalle: 'Infantil, primaria y secundaria para ~150.000 alumnos', escala: 60 },
  { icono: '🚒', nombre: 'Bomberos', cantidad: '10-15 parques', detalle: '~800 bomberos para cubrir toda la ciudad en <8 minutos', escala: 35 },
  { icono: '👮', nombre: 'Policía', cantidad: '~5.000 agentes', detalle: 'Policía Local + Nacional, más protección civil', escala: 55 },
  { icono: '🌳', nombre: 'Parques', cantidad: '10-15 m²/habitante', detalle: '10-15 millones de m² de zonas verdes que mantener', escala: 45 },
];

function SeccionServicios() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Una ciudad de <strong>1 millón de habitantes</strong> es como un organismo vivo. Estos son los servicios que necesita para funcionar cada día, sin que nadie lo note.</p>
      </div>

      <div className={styles.serviciosGrid}>
        {SERVICIOS.map(s => (
          <div key={s.nombre} className={styles.servicioCard}>
            <div className={styles.servicioHeader}>
              <span className={styles.servicioIcono} aria-hidden="true">{s.icono}</span>
              <div>
                <strong className={styles.servicioNombre}>{s.nombre}</strong>
                <span className={styles.servicioCantidad}>{s.cantidad}</span>
              </div>
            </div>

            {/* Bloque proporcional */}
            <div className={styles.servicioBarra}>
              <div
                className={styles.servicioRelleno}
                style={{ width: `${s.escala}%` }}
              />
            </div>

            <p className={styles.servicioDetalle}>{s.detalle}</p>
            {s.porHabitante && (
              <span className={styles.servicioPorHab}>
                Por habitante: <strong>{s.porHabitante}</strong>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Cada mañana, antes de que te levantes, ya han circulado <strong>200 millones de litros de agua</strong>,
          se han recogido <strong>1.300 toneladas de basura</strong> y se ha generado electricidad equivalente a
          3 centrales. Una ciudad no duerme — su infraestructura trabaja 24 horas sin descanso.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: El precio
// ─────────────────────────────────────────────

interface PartidaPresupuesto {
  nombre: string;
  porcentaje: number;
  icono: string;
  color: string;
  euros: number; // €/habitante/año
}

const PRESUPUESTO: PartidaPresupuesto[] = [
  { nombre: 'Transporte', porcentaje: 25, icono: '🚌', color: '#2E86AB', euros: 250 },
  { nombre: 'Servicios sociales', porcentaje: 20, icono: '🤝', color: '#48A9A6', euros: 200 },
  { nombre: 'Limpieza y residuos', porcentaje: 15, icono: '🧹', color: '#F59E0B', euros: 150 },
  { nombre: 'Parques y jardines', porcentaje: 10, icono: '🌳', color: '#10B981', euros: 100 },
  { nombre: 'Policía y seguridad', porcentaje: 10, icono: '👮', color: '#EF4444', euros: 100 },
  { nombre: 'Cultura', porcentaje: 8, icono: '🎭', color: '#8B5CF6', euros: 80 },
  { nombre: 'Deuda', porcentaje: 7, icono: '📉', color: '#6B7280', euros: 70 },
  { nombre: 'Deportes', porcentaje: 5, icono: '⚽', color: '#EC4899', euros: 50 },
];

const TOTAL_POR_HABITANTE = 1000;

function SeccionPrecio() {
  const [partidaActiva, setPartidaActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Mantener una ciudad cuesta <strong>{formatCurrency(TOTAL_POR_HABITANTE)} por habitante al año</strong>. Este es el desglose típico de un municipio español de 1 millón de habitantes.</p>
      </div>

      {/* Barra de presupuesto horizontal */}
      <div className={styles.presupuestoBarra} role="img" aria-label="Desglose del presupuesto municipal">
        {PRESUPUESTO.map(p => (
          <div
            key={p.nombre}
            className={`${styles.presupuestoSegmento} ${partidaActiva === p.nombre ? styles.segmentoActivo : ''}`}
            style={{ width: `${p.porcentaje}%`, backgroundColor: p.color }}
            onMouseEnter={() => setPartidaActiva(p.nombre)}
            onMouseLeave={() => setPartidaActiva(null)}
            role="button"
            tabIndex={0}
            aria-label={`${p.nombre}: ${p.porcentaje}%`}
            onFocus={() => setPartidaActiva(p.nombre)}
            onBlur={() => setPartidaActiva(null)}
          >
            <span className={styles.segmentoTexto}>{p.porcentaje}%</span>
          </div>
        ))}
      </div>

      {/* Detalle de partidas */}
      <div className={styles.partidasGrid}>
        {PRESUPUESTO.map(p => (
          <div
            key={p.nombre}
            className={`${styles.partidaCard} ${partidaActiva === p.nombre ? styles.partidaDestacada : ''}`}
            style={{ '--partida-color': p.color } as React.CSSProperties}
            onMouseEnter={() => setPartidaActiva(p.nombre)}
            onMouseLeave={() => setPartidaActiva(null)}
          >
            <div className={styles.partidaHeader}>
              <span className={styles.partidaIndicador} />
              <span className={styles.partidaIcono} aria-hidden="true">{p.icono}</span>
              <strong className={styles.partidaNombre}>{p.nombre}</strong>
            </div>
            <div className={styles.partidaValores}>
              <span className={styles.partidaPct}>{p.porcentaje}%</span>
              <span className={styles.partidaEuros}>{formatCurrency(p.euros)}/hab</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className={styles.totalCard}>
        <div className={styles.totalHeader}>
          <span className={styles.totalIcono} aria-hidden="true">🏛️</span>
          <span className={styles.totalLabel}>Presupuesto total por habitante</span>
        </div>
        <span className={styles.totalValor}>{formatCurrency(TOTAL_POR_HABITANTE)}/año</span>
        <span className={styles.totalDetalle}>
          ≈ {formatCurrency(Math.round(TOTAL_POR_HABITANTE / 12))}/mes — menos que una factura de móvil
        </span>
      </div>

      <div className={styles.insight}>
        <p>
          Por <strong>{formatCurrency(Math.round(TOTAL_POR_HABITANTE / 12))} al mes por persona</strong>, una ciudad te ofrece
          transporte, seguridad, limpieza, parques, cultura y deporte. Lo que cuesta una suscripción de
          streaming financia un mes entero de servicios municipales. El verdadero chollo invisible.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCiudadPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('subsuelo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'subsuelo': return <SeccionSubsuelo />;
      case 'moverse': return <SeccionMoverse />;
      case 'servicios': return <SeccionServicios />;
      case 'precio': return <SeccionPrecio />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Anatomía de una Ciudad</h1>
          <p className={styles.subtitle}>Todo lo que hace funcionar una ciudad — y que nunca ves</p>
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
        <div className={styles.seccionHeader} aria-live="polite" aria-atomic="true">
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Lo que no ves de tu ciudad"
          subtitle="Conceptos clave sobre infraestructura urbana"
          defaultOpen={false}
        >
          <h3>¿Por qué siempre hay obras en la calle?</h3>
          <p>
            Porque bajo cada calle conviven 6 redes de distintas épocas, gestionadas por empresas
            diferentes (agua, gas, electricidad, telecomunicaciones). Cuando una necesita reparación,
            hay que abrir toda la calle. En ciudades como Madrid o Barcelona, se abren más de
            <strong> 15.000 zanjas al año</strong>.
          </p>

          <h3>¿Cuánta agua gasta realmente una ciudad?</h3>
          <p>
            Una ciudad de 1 millón de personas consume unos 200 millones de litros al día. Pero
            entre el 15% y el 25% se pierde por fugas en tuberías antiguas. Renovar toda la red
            costaría miles de millones — por eso se hace por tramos, a lo largo de décadas.
          </p>

          <h3>El problema del &quot;último kilómetro&quot;</h3>
          <p>
            El transporte público funciona bien para grandes distancias, pero el verdadero reto es
            el último kilómetro: de la estación a tu casa. Ahí compiten autobuses, patinetes,
            bicicletas y coches. Las ciudades que resuelven ese tramo reducen drásticamente el
            uso del coche privado.
          </p>

          <h3>¿Quién paga todo esto?</h3>
          <p>
            Los ayuntamientos se financian con el IBI (impuesto sobre inmuebles), tasas de basura,
            transferencias del Estado y otros impuestos locales. El presupuesto medio ronda los
            1.000 € por habitante al año — sorprendentemente poco para todo lo que ofrece.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son orientativos y representan una
            ciudad española media de ~1 millón de habitantes. Las cifras reales varían según el
            municipio, la comunidad autónoma y el año presupuestario.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ciudad')} />
        <ShareCard appName="visualizador-ciudad" />
        <Footer appName="visualizador-ciudad" />
      </div>
  );
}
