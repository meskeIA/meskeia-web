'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorViajePaquete.module.css';
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
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'click' | 'almacen' | 'transporte' | 'espana';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'click', titulo: 'El click', icono: '🖱️', subtitulo: 'Qué pasa cuando pulsas Comprar' },
  { id: 'almacen', titulo: 'El almacén', icono: '🏭', subtitulo: 'Robots, picking y cintas a 2 m/s' },
  { id: 'transporte', titulo: 'El transporte', icono: '🚚', subtitulo: 'De hub a hub y la última milla' },
  { id: 'espana', titulo: 'España en números', icono: '📊', subtitulo: '700M+ paquetes al año' },
];

// ─────────────────────────────────────────────
// Sección 1: El click
// ─────────────────────────────────────────────

interface PasoClick {
  id: string;
  nombre: string;
  icono: string;
  tiempo: string;
  descripcion: string;
  detalle: string;
  color: string;
}

const PASOS_CLICK: PasoClick[] = [
  { id: 'validacion', nombre: 'Validación del pedido', icono: '✅', tiempo: '~200 ms', descripcion: 'El sistema verifica tu dirección, datos de contacto y que el producto existe en catálogo.', detalle: 'Se comprueban más de 15 campos en milisegundos', color: '#2E86AB' },
  { id: 'pago', nombre: 'Procesamiento del pago', icono: '💳', tiempo: '~500 ms', descripcion: 'Tu banco autoriza la operación, se reserva el importe y se genera un token de transacción seguro.', detalle: 'Intervienen: pasarela de pago, banco emisor, red VISA/Mastercard', color: '#48A9A6' },
  { id: 'almacen', nombre: 'Notificación al almacén', icono: '🔔', tiempo: '~300 ms', descripcion: 'El sistema WMS (Warehouse Management System) recibe el pedido y lo asigna al almacén más cercano.', detalle: 'Algoritmo elige entre 5-20 almacenes según stock y distancia', color: '#F59E0B' },
  { id: 'reserva', nombre: 'Reserva de stock', icono: '📦', tiempo: '~100 ms', descripcion: 'Las unidades se marcan como reservadas para evitar sobreventa. El stock se actualiza en tiempo real.', detalle: 'Miles de reservas simultáneas sin conflicto gracias a bases de datos distribuidas', color: '#10B981' },
];

function SeccionClick() {
  const [pasoActivo, setPasoActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Todo ocurre en <strong>menos de 2 segundos</strong>. Desde que pulsas &quot;Comprar&quot; hasta que el almacén recibe la orden, intervienen 4 sistemas coordinados a velocidad de milisegundos.</p>
      </div>

      {/* Línea de tiempo del click */}
      <div className={styles.flujoTimeline}>
        {PASOS_CLICK.map((p, i) => (
          <div
            key={p.id}
            className={`${styles.flujoStep} ${pasoActivo === p.id ? styles.flujoStepActivo : ''}`}
            style={{ '--step-color': p.color } as React.CSSProperties}
            onMouseEnter={() => setPasoActivo(p.id)}
            onMouseLeave={() => setPasoActivo(null)}
            role="button"
            tabIndex={0}
            onFocus={() => setPasoActivo(p.id)}
            onBlur={() => setPasoActivo(null)}
          >
            <div className={styles.flujoNumero}>{i + 1}</div>
            <div className={styles.flujoConector} />
            <div className={styles.flujoCard}>
              <div className={styles.flujoHeader}>
                <span aria-hidden="true">{p.icono}</span>
                <strong>{p.nombre}</strong>
                <span className={styles.flujoTiempo}>{p.tiempo}</span>
              </div>
              <p className={styles.flujoDesc}>{p.descripcion}</p>
              {pasoActivo === p.id && (
                <p className={styles.flujoDetalle}>{p.detalle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen total */}
      <div className={styles.totalCard}>
        <div className={styles.totalHeader}>
          <span className={styles.totalIcono} aria-hidden="true">⚡</span>
          <span className={styles.totalLabel}>Tiempo total del proceso</span>
        </div>
        <span className={styles.totalValor}>&lt; 2 segundos</span>
        <span className={styles.totalDetalle}>
          4 sistemas, 3 empresas diferentes, todo invisible para ti
        </span>
      </div>

      <div className={styles.insight}>
        <p>
          Cuando pulsas Comprar, <strong>no estás hablando con una tienda</strong>: estás activando una cadena
          de pasarelas de pago, sistemas de gestión de almacén y algoritmos de optimización de inventario
          que operan en paralelo. En menos de lo que tardas en parpadear, tu paquete ya tiene almacén asignado.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: El almacén
// ─────────────────────────────────────────────

interface EtapaAlmacen {
  id: string;
  nombre: string;
  icono: string;
  duracion: string;
  descripcion: string;
  dato: string;
  color: string;
}

const ETAPAS_ALMACEN: EtapaAlmacen[] = [
  { id: 'picking', nombre: 'Picking', icono: '🤖', duracion: '3-5 min', descripcion: 'Un robot o un operario localiza el producto en una estantería de entre miles de ubicaciones.', dato: 'Almacenes con 1.000+ robots: el producto llega al operario, no al revés', color: '#2E86AB' },
  { id: 'packing', nombre: 'Packing', icono: '📦', duracion: '1-2 min', descripcion: 'El producto se embala en la caja de tamaño óptimo, se protege con relleno y se sella.', dato: 'Algoritmos calculan la caja ideal para ahorrar espacio en el camión', color: '#48A9A6' },
  { id: 'etiquetado', nombre: 'Etiquetado', icono: '🏷️', duracion: '30 s', descripcion: 'Se imprime y pega la etiqueta con código de barras, dirección y tracking. Cada scan queda registrado.', dato: 'Un paquete se escanea entre 15 y 25 veces de origen a destino', color: '#F59E0B' },
  { id: 'clasificacion', nombre: 'Clasificación', icono: '🔄', duracion: '2-3 min', descripcion: 'Cintas transportadoras a 2 m/s llevan el paquete. Escáneres láser leen el código y lo desvían a la ruta correcta.', dato: 'Un centro de clasificación procesa 200.000+ paquetes/día', color: '#8B5CF6' },
  { id: 'carga', nombre: 'Carga en vehículo', icono: '🚛', duracion: '5-15 min', descripcion: 'Los paquetes se agrupan por zona de destino y se cargan en camiones siguiendo la ruta optimizada.', dato: 'Un camión lleva 2.000-3.000 paquetes agrupados por código postal', color: '#EF4444' },
];

function SeccionAlmacen() {
  const [etapaActiva, setEtapaActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El almacén moderno es una <strong>fábrica de logística</strong>. Un operario camina <strong>20 km al día</strong> entre estanterías — o los robots le traen el producto directamente.</p>
      </div>

      {/* Etapas del almacén */}
      <div className={styles.etapasGrid}>
        {ETAPAS_ALMACEN.map((e, i) => (
          <div
            key={e.id}
            className={`${styles.etapaCard} ${etapaActiva === e.id ? styles.etapaActiva : ''}`}
            style={{ '--etapa-color': e.color } as React.CSSProperties}
            onMouseEnter={() => setEtapaActiva(e.id)}
            onMouseLeave={() => setEtapaActiva(null)}
          >
            <div className={styles.etapaOrden}>
              <span className={styles.etapaNumero}>{i + 1}</span>
              <span className={styles.etapaDuracion}>{e.duracion}</span>
            </div>
            <div className={styles.etapaBody}>
              <div className={styles.etapaHeader}>
                <span aria-hidden="true">{e.icono}</span>
                <strong className={styles.etapaNombre}>{e.nombre}</strong>
              </div>
              <p className={styles.etapaDesc}>{e.descripcion}</p>
              <span className={styles.etapaDato}>{e.dato}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tiempo total almacén */}
      <div className={styles.totalCard}>
        <div className={styles.totalHeader}>
          <span className={styles.totalIcono} aria-hidden="true">🏭</span>
          <span className={styles.totalLabel}>Del pedido al camión</span>
        </div>
        <span className={styles.totalValor}>15 – 30 minutos</span>
        <span className={styles.totalDetalle}>
          En centros de alta tecnología, el paquete sale del almacén en menos de media hora
        </span>
      </div>

      <div className={styles.insight}>
        <p>
          Un operario de almacén recorre <strong>20 km al día</strong> entre pasillos, el equivalente a una media maratón.
          Por eso Amazon invirtió en robots Kiva: las estanterías se mueven solas hasta el operario. El resultado es
          que un pedido que antes tardaba 2 horas en prepararse ahora sale en <strong>15 minutos</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: El transporte
// ─────────────────────────────────────────────

interface ModoTransporte {
  icono: string;
  nombre: string;
  porcentaje: number;
  co2PorPaquete: number; // gramos
  velocidad: string;
  uso: string;
  color: string;
}

const MODOS_TRANSPORTE: ModoTransporte[] = [
  { icono: '🚛', nombre: 'Camión', porcentaje: 80, co2PorPaquete: 500, velocidad: '80 km/h', uso: 'Ruta nacional e interurbana', color: '#2E86AB' },
  { icono: '✈️', nombre: 'Avión', porcentaje: 15, co2PorPaquete: 2200, velocidad: '900 km/h', uso: 'Internacional y urgente', color: '#EF4444' },
  { icono: '🚂', nombre: 'Tren', porcentaje: 5, co2PorPaquete: 80, velocidad: '120 km/h', uso: 'Corredores fijos (poco usado)', color: '#10B981' },
];

interface EntregaStat {
  intento: string;
  porcentaje: number;
  descripcion: string;
  icono: string;
}

const ENTREGAS: EntregaStat[] = [
  { intento: 'Primer intento', porcentaje: 85, descripcion: 'El destinatario está en casa y recoge el paquete', icono: '✅' },
  { intento: 'Segundo intento', porcentaje: 10, descripcion: 'Se vuelve a intentar al día siguiente', icono: '🔄' },
  { intento: 'Punto de recogida', porcentaje: 5, descripcion: 'El paquete va a locker o tienda de conveniencia', icono: '📍' },
];

const maxCO2 = Math.max(...MODOS_TRANSPORTE.map(m => m.co2PorPaquete));

function SeccionTransporte() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>última milla</strong> — del centro de distribución a tu puerta — es la parte más cara: supone el <strong>53% del coste total</strong> del envío.</p>
      </div>

      {/* Modos de transporte hub-a-hub */}
      <h3 className={styles.subtituloSeccion}>Transporte hub a hub</h3>
      <div className={styles.modosGrid}>
        {MODOS_TRANSPORTE.map(m => (
          <div key={m.nombre} className={styles.modoCard}>
            <div className={styles.modoHeader}>
              <span className={styles.modoIcono} aria-hidden="true">{m.icono}</span>
              <strong className={styles.modoNombre}>{m.nombre}</strong>
              <span className={styles.modoPct}>{m.porcentaje}%</span>
            </div>

            <div className={styles.modoStats}>
              <div className={styles.modoStat}>
                <span className={styles.modoStatLabel}>💨 CO₂/paquete</span>
                <span className={styles.modoStatValor}>{formatNumber(m.co2PorPaquete, 0)} g</span>
              </div>
              <div className={styles.modoStat}>
                <span className={styles.modoStatLabel}>🚀 Velocidad</span>
                <span className={styles.modoStatValor}>{m.velocidad}</span>
              </div>
            </div>

            <p className={styles.modoUso}>{m.uso}</p>

            {/* Barra CO₂ */}
            <div className={styles.co2Barra}>
              <div
                className={styles.co2Relleno}
                style={{
                  width: maxCO2 > 0 ? `${(m.co2PorPaquete / maxCO2) * 100}%` : '0%',
                  backgroundColor: m.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Última milla: estadísticas de entrega */}
      <h3 className={styles.subtituloSeccion}>Última milla: intentos de entrega</h3>
      <div className={styles.entregasGrid}>
        {ENTREGAS.map(e => (
          <div key={e.intento} className={styles.entregaCard}>
            <div className={styles.entregaHeader}>
              <span aria-hidden="true">{e.icono}</span>
              <strong>{e.intento}</strong>
            </div>
            <div className={styles.entregaBarra}>
              <div
                className={styles.entregaRelleno}
                style={{ width: `${e.porcentaje}%` }}
              />
            </div>
            <div className={styles.entregaFooter}>
              <span className={styles.entregaPct}>{e.porcentaje}%</span>
              <span className={styles.entregaDesc}>{e.descripcion}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>53% del coste total</strong> de entregar un paquete se concentra en la última milla.
          Un repartidor hace 120-150 paradas al día en ciudad. Cada entrega fallida duplica el coste:
          hay que volver. Por eso los <strong>puntos de recogida y lockers</strong> crecen un 40% anual —
          son más baratos, más fiables y reducen emisiones.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: España en números
// ─────────────────────────────────────────────

interface DatoEspana {
  icono: string;
  titulo: string;
  valor: string;
  contexto: string;
  escala: number;
}

const DATOS_ESPANA: DatoEspana[] = [
  { icono: '📦', titulo: 'Paquetes al año', valor: '700M+', contexto: 'Más de 700 millones de paquetes entregados en 2024', escala: 95 },
  { icono: '🔥', titulo: 'Pico Black Friday', valor: '8M/día', contexto: '8 millones de paquetes diarios durante la semana de Black Friday', escala: 85 },
  { icono: '⏱️', titulo: 'Tiempo medio de entrega', valor: '2,3 días', contexto: 'Media nacional para envíos estándar peninsulares', escala: 60 },
  { icono: '🚐', titulo: 'Repartidores', valor: '150.000+', contexto: 'Más de 150.000 conductores de última milla en activo', escala: 75 },
  { icono: '📍', titulo: 'Puntos de recogida', valor: '+40%/año', contexto: 'Lockers y tiendas de conveniencia creciendo un 40% anual', escala: 70 },
  { icono: '↩️', titulo: 'Tasa de devolución', valor: '25% online', contexto: '25% en compras online vs 8% en tienda física — 3 veces más', escala: 65 },
];

function SeccionEspana() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>España mueve más de <strong>{formatNumber(700000000, 0)} paquetes al año</strong>. Estos son los números que definen la logística del e-commerce en nuestro país.</p>
      </div>

      <div className={styles.datosGrid}>
        {DATOS_ESPANA.map(d => (
          <div key={d.titulo} className={styles.datoCard}>
            <div className={styles.datoHeader}>
              <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
              <div>
                <strong className={styles.datoTitulo}>{d.titulo}</strong>
                <span className={styles.datoValor}>{d.valor}</span>
              </div>
            </div>

            <div className={styles.datoBarra}>
              <div
                className={styles.datoRelleno}
                style={{ width: `${d.escala}%` }}
              />
            </div>

            <p className={styles.datoContexto}>{d.contexto}</p>
          </div>
        ))}
      </div>

      {/* Comparativa devoluciones */}
      <div className={styles.comparativa}>
        <h3 className={styles.comparativaTitulo}>Devoluciones: online vs tienda</h3>
        <div className={styles.comparativaBarras}>
          <div className={styles.comparativaRow}>
            <span className={styles.comparativaLabel}>🛒 Online</span>
            <div className={styles.comparativaBarra}>
              <div className={styles.comparativaRelleno} style={{ width: '100%', backgroundColor: '#EF4444' }} />
            </div>
            <span className={styles.comparativaPct}>25%</span>
          </div>
          <div className={styles.comparativaRow}>
            <span className={styles.comparativaLabel}>🏪 Tienda</span>
            <div className={styles.comparativaBarra}>
              <div className={styles.comparativaRelleno} style={{ width: '32%', backgroundColor: '#10B981' }} />
            </div>
            <span className={styles.comparativaPct}>8%</span>
          </div>
        </div>
        <p className={styles.comparativaDetalle}>
          Cada devolución online implica recoger, transportar, inspeccionar y reembalar el producto — duplicando la huella de carbono del envío original.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          En Black Friday, la red logística española pasa de procesar <strong>{formatNumber(2000000, 0)} paquetes/día</strong> a
          <strong> {formatNumber(8000000, 0)}</strong> — un pico del 400%. Las empresas contratan miles de repartidores temporales
          y alquilan almacenes auxiliares semanas antes. Es el equivalente logístico de prepararse para un maratón.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorViajePaquetePage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('click');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'click': return <SeccionClick />;
      case 'almacen': return <SeccionAlmacen />;
      case 'transporte': return <SeccionTransporte />;
      case 'espana': return <SeccionEspana />;
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
          <h1 className={styles.title}>El Viaje de un Paquete</h1>
          <p className={styles.subtitle}>Del click al timbre — todo lo que pasa cuando compras online</p>
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
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="La logística invisible del e-commerce"
          subtitle="Lo que hay detrás de cada pedido online"
          defaultOpen={false}
        >
          <h3>El verdadero coste de la entrega gratuita</h3>
          <p>
            Cuando una tienda ofrece &quot;envío gratis&quot;, el coste no desaparece: se absorbe en el margen del producto.
            Entregar un paquete en última milla cuesta entre <strong>3 € y 8 €</strong> según la zona. En zonas rurales puede
            superar los 12 €. El &quot;envío gratis&quot; es el mayor coste oculto del e-commerce.
          </p>

          <h3>Por qué las devoluciones son un problema enorme</h3>
          <p>
            En moda online, la tasa de devolución alcanza el <strong>30-40%</strong>. Cada devolución implica: recogida,
            transporte de vuelta, inspección, reacondicionamiento y re-almacenamiento. Muchos productos devueltos
            acaban destruidos porque procesarlos cuesta más que su valor. Un problema medioambiental creciente.
          </p>

          <h3>El futuro: drones, robots y lockers</h3>
          <p>
            La última milla está evolucionando rápidamente. Los lockers automáticos eliminan los intentos fallidos
            (100% tasa de éxito). Los robots de reparto ya operan en algunas ciudades. Y los drones podrían reducir
            tiempos a minutos en zonas rurales. Pero la regulación va más lenta que la tecnología.
          </p>

          <h3>El impacto del e-commerce en las ciudades</h3>
          <p>
            Las furgonetas de reparto generan el <strong>25% del tráfico urbano</strong> en grandes ciudades durante
            horas punta. Algunas ciudades europeas están creando centros de consolidación urbana: un punto donde
            todas las empresas descargan, y desde ahí se reparte con vehículos eléctricos o bicis cargo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son orientativos y se basan en promedios del sector
            logístico español y europeo (2024). Las cifras reales varían según la empresa, la temporada y la zona geográfica.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-viaje-paquete')} />
        <ShareCard appName="visualizador-viaje-paquete" />
        <Footer appName="visualizador-viaje-paquete" />
      </div>
    </>
  );
}
