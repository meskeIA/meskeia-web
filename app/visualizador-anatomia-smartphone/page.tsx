'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorAnatomiaSmartphone.module.css';
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
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'componentes' | 'minerales' | 'precio' | 'obsolescencia';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'componentes', titulo: 'Por dentro', icono: '🔧', subtitulo: 'Los componentes que hacen funcionar tu móvil' },
  { id: 'minerales', titulo: 'De dónde vienen', icono: '🌍', subtitulo: 'Los minerales de 15 países que lleva dentro' },
  { id: 'precio', titulo: 'El precio real', icono: '💰', subtitulo: 'Cuánto cuesta fabricar un móvil de 1.000 €' },
  { id: 'obsolescencia', titulo: 'Obsolescencia', icono: '♻️', subtitulo: 'Qué pasa cuando lo tiras' },
];

// ─────────────────────────────────────────────
// Sección 1: Componentes
// ─────────────────────────────────────────────

interface Componente {
  id: string;
  nombre: string;
  icono: string;
  tipo: string;
  funcion: string;
  materiales: string;
  dato: string;
  color: string;
}

const COMPONENTES: Componente[] = [
  { id: 'pantalla', nombre: 'Pantalla OLED', icono: '📱', tipo: 'Visualización', funcion: 'Muestra imagen mediante millones de píxeles orgánicos que emiten luz propia.', materiales: 'Vidrio Gorilla, indio, estaño (ITO), compuestos orgánicos', dato: '6,1" → 2.556 × 1.179 px = 3 millones de píxeles', color: '#3B82F6' },
  { id: 'soc', nombre: 'Procesador (SoC)', icono: '🧠', tipo: 'Cerebro', funcion: 'Chip que integra CPU, GPU, módem 5G, IA y controladores en un solo circuito de 3 nm.', materiales: 'Silicio ultrapuro, cobre, hafnio, cobalto', dato: '~19.000 millones de transistores en 3 nm', color: '#EF4444' },
  { id: 'ram', nombre: 'RAM (8 GB)', icono: '⚡', tipo: 'Memoria rápida', funcion: 'Almacena datos temporales de las apps abiertas para acceso instantáneo.', materiales: 'Silicio, tantalio, oro (contactos)', dato: 'Lee/escribe a ~50 GB/s — 500× más rápido que el SSD', color: '#F59E0B' },
  { id: 'almacenamiento', nombre: 'Almacenamiento (256 GB)', icono: '💾', tipo: 'Memoria permanente', funcion: 'Guarda el sistema operativo, fotos, apps y datos de forma persistente.', materiales: 'Silicio, óxido de silicio, tungsteno', dato: '256 GB = ~50.000 fotos o ~60 horas de vídeo 4K', color: '#8B5CF6' },
  { id: 'bateria', nombre: 'Batería Li-ion', icono: '🔋', tipo: 'Energía', funcion: 'Celda de iones de litio que almacena energía química y la convierte en eléctrica.', materiales: 'Litio, cobalto, níquel, manganeso, grafito', dato: '~4.500 mAh → ~18 horas de uso mixto', color: '#10B981' },
  { id: 'camaras', nombre: 'Cámaras (3 sensores)', icono: '📷', tipo: 'Imagen', funcion: 'Sensor CMOS que convierte luz en señal eléctrica + procesado por IA.', materiales: 'Silicio, vidrio óptico, tierras raras (lentes), oro', dato: '48-200 MP — más resolución que muchas réflex', color: '#EC4899' },
  { id: 'antenas', nombre: 'Antenas (5G/WiFi/BT/GPS)', icono: '📡', tipo: 'Conectividad', funcion: '4+ antenas para redes móviles, WiFi 6E, Bluetooth 5.3, GPS, NFC y UWB.', materiales: 'Cobre, oro (contactos), cerámica', dato: '5G descarga a ~1 Gbps — una película en 8 segundos', color: '#2E86AB' },
  { id: 'altavoces', nombre: 'Altavoces estéreo', icono: '🔊', tipo: 'Audio', funcion: 'Transductores que convierten señales eléctricas en ondas de sonido.', materiales: 'Neodimio (imán), cobre, membrana de polímero', dato: 'Rango: 100 Hz – 20 kHz en 2 altavoces de 11 mm', color: '#6B7280' },
  { id: 'motor', nombre: 'Motor háptico', icono: '📳', tipo: 'Vibración', funcion: 'Motor lineal que genera vibraciones precisas para feedback táctil.', materiales: 'Neodimio, cobre, acero', dato: '~150 patrones de vibración diferentes', color: '#48A9A6' },
];

function SeccionComponentes() {
  const [componenteActivo, setComponenteActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un smartphone moderno contiene <strong>más de 200 componentes</strong> miniaturizados. Estos son los 9 principales — pulsa para ver qué hacen y de qué están hechos.</p>
      </div>

      <div className={styles.componentesGrid}>
        {COMPONENTES.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.componenteCard} ${componenteActivo === c.id ? styles.componenteActivo : ''}`}
            onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
            aria-expanded={componenteActivo === c.id}
            style={{ '--comp-color': c.color } as React.CSSProperties}
          >
            <div className={styles.compHeader}>
              <span className={styles.compIcono} aria-hidden="true">{c.icono}</span>
              <div>
                <strong className={styles.compNombre}>{c.nombre}</strong>
                <span className={styles.compTipo}>{c.tipo}</span>
              </div>
            </div>

            {componenteActivo === c.id && (
              <div className={styles.compDetalle}>
                <p className={styles.compFuncion}>{c.funcion}</p>
                <div className={styles.compMeta}>
                  <span className={styles.compMetaLabel}>Materiales:</span>
                  <span className={styles.compMetaValor}>{c.materiales}</span>
                </div>
                <div className={styles.compMeta}>
                  <span className={styles.compMetaLabel}>Dato:</span>
                  <span className={styles.compMetaValor}>{c.dato}</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Un smartphone de 200 gramos contiene <strong>más de 60 elementos</strong> de la tabla periódica —
          casi el doble que un coche. Es el objeto más denso en tecnología que ha existido nunca.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Minerales
// ─────────────────────────────────────────────

interface Mineral {
  nombre: string;
  icono: string;
  uso: string;
  paisPrincipal: string;
  bandera: string;
  cuotaMundial: string;
  problema: string;
  color: string;
}

const MINERALES: Mineral[] = [
  { nombre: 'Litio', icono: '🔋', uso: 'Batería (cátodo y electrolito)', paisPrincipal: 'Australia / Chile', bandera: '🇦🇺🇨🇱', cuotaMundial: 'Australia 47%, Chile 30%', problema: 'Extracción consume 2 millones de litros de agua por tonelada', color: '#10B981' },
  { nombre: 'Cobalto', icono: '⛏️', uso: 'Batería (estabilidad del cátodo)', paisPrincipal: 'Rep. Dem. del Congo', bandera: '🇨🇩', cuotaMundial: 'Congo 70% de producción mundial', problema: 'Minería artesanal con trabajo infantil documentado', color: '#EF4444' },
  { nombre: 'Tierras raras', icono: '🧲', uso: 'Imanes, vibrador, altavoces, pantalla', paisPrincipal: 'China', bandera: '🇨🇳', cuotaMundial: 'China 60% de producción mundial', problema: 'Procesado genera residuos radiactivos y ácidos', color: '#F59E0B' },
  { nombre: 'Silicio', icono: '🧠', uso: 'Procesador, memoria, sensores de cámara', paisPrincipal: 'China / EE.UU.', bandera: '🇨🇳🇺🇸', cuotaMundial: 'China 67% del silicio metalúrgico', problema: 'Purificación a 99,9999999% requiere enormes cantidades de energía', color: '#3B82F6' },
  { nombre: 'Oro', icono: '✨', uso: 'Conectores, circuitos (no se corroe)', paisPrincipal: 'China / Australia', bandera: '🇨🇳🇦🇺', cuotaMundial: '~0,034 g por smartphone', problema: 'Extracción con mercurio y cianuro en minería informal', color: '#D97706' },
  { nombre: 'Cobre', icono: '🔌', uso: 'Cableado, antenas, placa base', paisPrincipal: 'Chile / Perú', bandera: '🇨🇱🇵🇪', cuotaMundial: 'Chile 27%, Perú 10%', problema: 'Minas a cielo abierto alteran ecosistemas completos', color: '#B45309' },
  { nombre: 'Tantalio', icono: '💾', uso: 'Condensadores (miniaturización)', paisPrincipal: 'Congo / Ruanda', bandera: '🇨🇩🇷🇼', cuotaMundial: 'África Central ~60%', problema: 'Mineral de conflicto — financia guerras civiles', color: '#6B7280' },
  { nombre: 'Indio', icono: '📱', uso: 'Pantalla táctil (ITO transparente conductor)', paisPrincipal: 'China / Corea del Sur', bandera: '🇨🇳🇰🇷', cuotaMundial: 'China 60% de refinado', problema: 'Subproducto del zinc — reservas mundiales limitadas', color: '#8B5CF6' },
  { nombre: 'Tungsteno', icono: '📳', uso: 'Motor de vibración (peso)', paisPrincipal: 'China / Vietnam', bandera: '🇨🇳🇻🇳', cuotaMundial: 'China 80% de producción', problema: 'Mineral de conflicto en la región de los Grandes Lagos', color: '#48A9A6' },
  { nombre: 'Grafito', icono: '🔋', uso: 'Batería (ánodo)', paisPrincipal: 'China / Mozambique', bandera: '🇨🇳🇲🇿', cuotaMundial: 'China 65% natural, 100% sintético', problema: 'Polvo de grafito contamina aire y agua en zonas mineras', color: '#374151' },
  { nombre: 'Níquel', icono: '🔋', uso: 'Batería (densidad energética)', paisPrincipal: 'Indonesia / Filipinas', bandera: '🇮🇩🇵🇭', cuotaMundial: 'Indonesia 48% de producción', problema: 'Deforestación de selva tropical para minas de laterita', color: '#059669' },
  { nombre: 'Estaño', icono: '🔗', uso: 'Soldaduras (unir componentes)', paisPrincipal: 'China / Indonesia', bandera: '🇨🇳🇮🇩', cuotaMundial: 'China 31%, Indonesia 20%', problema: 'Minería en islas Bangka destruye fondos marinos', color: '#9CA3AF' },
];

function SeccionMinerales() {
  const [mineralActivo, setMineralActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu smartphone contiene <strong>más de 30 minerales</strong> extraídos en más de 15 países. Cada uno con su propia cadena de suministro — y su propio problema.</p>
      </div>

      <div className={styles.mineralesGrid}>
        {MINERALES.map(m => (
          <button
            key={m.nombre}
            type="button"
            className={`${styles.mineralCard} ${mineralActivo === m.nombre ? styles.mineralActivo : ''}`}
            onClick={() => setMineralActivo(mineralActivo === m.nombre ? null : m.nombre)}
            aria-expanded={mineralActivo === m.nombre}
            style={{ '--mineral-color': m.color } as React.CSSProperties}
          >
            <div className={styles.mineralHeader}>
              <span className={styles.mineralIcono} aria-hidden="true">{m.icono}</span>
              <div className={styles.mineralTitulo}>
                <strong className={styles.mineralNombre}>{m.nombre}</strong>
                <span className={styles.mineralPais}>{m.bandera} {m.paisPrincipal}</span>
              </div>
            </div>

            {mineralActivo === m.nombre && (
              <div className={styles.mineralDetalle}>
                <div className={styles.mineralMeta}>
                  <span className={styles.mineralMetaLabel}>Se usa en:</span>
                  <span className={styles.mineralMetaValor}>{m.uso}</span>
                </div>
                <div className={styles.mineralMeta}>
                  <span className={styles.mineralMetaLabel}>Producción:</span>
                  <span className={styles.mineralMetaValor}>{m.cuotaMundial}</span>
                </div>
                <div className={styles.mineralProblema}>
                  <span className={styles.mineralProblemaLabel}>⚠️ Problema:</span>
                  <span>{m.problema}</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Para fabricar un solo smartphone se necesitan materiales de <strong>más de 15 países</strong>,
          en una cadena de suministro que da la vuelta al mundo 3 veces antes de llegar a tu bolsillo.
          El 70% del cobalto mundial viene de un solo país — la Rep. Dem. del Congo — donde parte se
          extrae en minas artesanales con condiciones laborales documentadas como inaceptables.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: El precio real
// ─────────────────────────────────────────────

interface PartidaCoste {
  nombre: string;
  euros: number;
  icono: string;
  color: string;
  detalle: string;
}

const PRECIO_FINAL = 1000;

const COSTES: PartidaCoste[] = [
  { nombre: 'Componentes', euros: 350, icono: '🔧', color: '#2E86AB', detalle: 'Pantalla ~70 €, SoC ~110 €, cámaras ~50 €, batería ~15 €, memoria ~40 €, resto ~65 €' },
  { nombre: 'Ensamblaje', euros: 10, icono: '🏭', color: '#48A9A6', detalle: '~30 minutos de mano de obra en China. El trabajador cobra ~2-3 € por teléfono ensamblado' },
  { nombre: 'I+D', euros: 150, icono: '🔬', color: '#8B5CF6', detalle: 'Diseño, ingeniería, software, patentes. Se amortiza entre millones de unidades vendidas' },
  { nombre: 'Marketing', euros: 100, icono: '📢', color: '#F59E0B', detalle: 'Publicidad, eventos de lanzamiento, influencers, tiendas flagship, web' },
  { nombre: 'Logística', euros: 30, icono: '🚢', color: '#6B7280', detalle: 'Transporte desde China, almacenes, distribución a tiendas, embalaje' },
  { nombre: 'Margen', euros: 360, icono: '💎', color: '#EF4444', detalle: 'Beneficio bruto del fabricante. En Apple ~42%, en Samsung ~17%, en Xiaomi ~5%' },
];

function SeccionPrecio() {
  const [partidaActiva, setPartidaActiva] = useState<string | null>(null);
  const maxEuros = Math.max(...COSTES.map(c => c.euros));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un smartphone que cuesta <strong>{formatCurrency(PRECIO_FINAL)}</strong> en la tienda tiene un coste de componentes de apenas {formatCurrency(350)}. ¿A dónde va el resto?</p>
      </div>

      {/* Barra apilada horizontal */}
      <div className={styles.costeBarra} role="img" aria-label="Desglose de costes de un smartphone de 1.000 €">
        {COSTES.map(c => (
          <div
            key={c.nombre}
            className={`${styles.costeSegmento} ${partidaActiva === c.nombre ? styles.costeSegmentoActivo : ''}`}
            style={{ width: `${(c.euros / PRECIO_FINAL) * 100}%`, backgroundColor: c.color }}
            onMouseEnter={() => setPartidaActiva(c.nombre)}
            onMouseLeave={() => setPartidaActiva(null)}
            role="button"
            tabIndex={0}
            aria-label={`${c.nombre}: ${formatCurrency(c.euros)}`}
            onFocus={() => setPartidaActiva(c.nombre)}
            onBlur={() => setPartidaActiva(null)}
          >
            <span className={styles.costeSegmentoTexto}>
              {c.euros >= 50 ? `${formatCurrency(c.euros)}` : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Cards detalle */}
      <div className={styles.costesGrid}>
        {COSTES.map(c => (
          <div
            key={c.nombre}
            className={`${styles.costeCard} ${partidaActiva === c.nombre ? styles.costeCardActivo : ''}`}
            style={{ '--coste-color': c.color } as React.CSSProperties}
            onMouseEnter={() => setPartidaActiva(c.nombre)}
            onMouseLeave={() => setPartidaActiva(null)}
          >
            <div className={styles.costeCardHeader}>
              <span className={styles.costeIndicador} />
              <span className={styles.costeCardIcono} aria-hidden="true">{c.icono}</span>
              <strong className={styles.costeCardNombre}>{c.nombre}</strong>
              <span className={styles.costeCardEuros}>{formatCurrency(c.euros)}</span>
            </div>

            {/* Barra proporcional */}
            <div className={styles.costeBarraMini}>
              <div
                className={styles.costeRellenoMini}
                style={{ width: `${(c.euros / maxEuros) * 100}%`, backgroundColor: c.color }}
              />
            </div>

            <p className={styles.costeCardDetalle}>{c.detalle}</p>
          </div>
        ))}
      </div>

      {/* Comparativa trabajador */}
      <div className={styles.comparativaCard}>
        <div className={styles.comparativaHeader}>
          <span className={styles.comparativaIcono} aria-hidden="true">🏭</span>
          <strong>Lo que gana el trabajador que lo ensambla</strong>
        </div>
        <div className={styles.comparativaBarras}>
          <div className={styles.comparativaFila}>
            <span className={styles.comparativaLabel}>Trabajador de fábrica</span>
            <div className={styles.comparativaBarra}>
              <div className={styles.comparativaRelleno} style={{ width: '0.3%', backgroundColor: '#48A9A6', minWidth: '4px' }} />
            </div>
            <span className={styles.comparativaValor}>~{formatCurrency(3)}</span>
          </div>
          <div className={styles.comparativaFila}>
            <span className={styles.comparativaLabel}>Precio de venta</span>
            <div className={styles.comparativaBarra}>
              <div className={styles.comparativaRelleno} style={{ width: '100%', backgroundColor: '#EF4444' }} />
            </div>
            <span className={styles.comparativaValor}>{formatCurrency(PRECIO_FINAL)}</span>
          </div>
        </div>
        <p className={styles.comparativaTexto}>
          El trabajador que ensambla tu móvil durante ~30 minutos cobra entre 2 y 3 €.
          Eso es el <strong>0,3%</strong> del precio final.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          El coste de los componentes físicos es solo el <strong>35%</strong> del precio final.
          El margen del fabricante ({formatCurrency(360)}) supera al coste de todos los componentes juntos ({formatCurrency(350)}).
          En marcas premium como Apple, el margen puede llegar al 42% — es decir, de cada {formatCurrency(PRECIO_FINAL)},
          se queda con <strong>{formatCurrency(420)}</strong> de beneficio bruto.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Obsolescencia
// ─────────────────────────────────────────────

interface DatoObsolescencia {
  icono: string;
  etiqueta: string;
  valor: string;
  detalle: string;
  color: string;
}

const DATOS_OBSOLESCENCIA: DatoObsolescencia[] = [
  { icono: '📱', etiqueta: 'Vida media en España', valor: '2,7 años', detalle: 'El 40% de usuarios cambia de móvil con el anterior aún funcionando', color: '#2E86AB' },
  { icono: '🗑️', etiqueta: 'Basura electrónica global', valor: '62M toneladas/año', detalle: 'Equivale a ~5.000 torres Eiffel de residuos electrónicos (2022)', color: '#EF4444' },
  { icono: '♻️', etiqueta: 'Tasa de reciclaje', valor: 'Solo 17%', detalle: 'El 83% de los dispositivos acaba en vertederos o se exporta ilegalmente', color: '#F59E0B' },
  { icono: '💰', etiqueta: 'Valor en los vertederos', valor: '62.000 M€/año', detalle: 'Oro, plata, cobre y tierras raras que se pierden sin reciclar', color: '#10B981' },
  { icono: '🔧', etiqueta: 'Derecho a reparar (UE)', valor: 'Desde 2025', detalle: 'Baterías reemplazables obligatorias, piezas disponibles 5 años, índice de reparabilidad', color: '#8B5CF6' },
  { icono: '🔄', etiqueta: 'Actualizaciones de software', valor: '3-7 años', detalle: 'Apple: ~6 años, Samsung: ~5 años, resto: 2-3 años. Sin actualizaciones = inseguro', color: '#6B7280' },
];

interface DestinoMovil {
  destino: string;
  porcentaje: number;
  icono: string;
  color: string;
}

const DESTINOS: DestinoMovil[] = [
  { destino: 'Guardado en un cajón', porcentaje: 40, icono: '🗄️', color: '#6B7280' },
  { destino: 'Entregado / vendido segunda mano', porcentaje: 22, icono: '🤝', color: '#10B981' },
  { destino: 'Reciclado correctamente', porcentaje: 17, icono: '♻️', color: '#2E86AB' },
  { destino: 'Tirado a la basura normal', porcentaje: 12, icono: '🗑️', color: '#EF4444' },
  { destino: 'Exportado (legal/ilegalmente)', porcentaje: 9, icono: '🚢', color: '#F59E0B' },
];

function SeccionObsolescencia() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En España cambiamos de móvil cada <strong>2,7 años</strong>. La mayoría siguen funcionando. ¿Qué pasa con los que descartamos?</p>
      </div>

      {/* Datos clave */}
      <div className={styles.obsolescenciaGrid}>
        {DATOS_OBSOLESCENCIA.map(d => (
          <div
            key={d.etiqueta}
            className={styles.obsolescenciaCard}
            style={{ '--obs-color': d.color } as React.CSSProperties}
          >
            <div className={styles.obsHeader}>
              <span className={styles.obsIcono} aria-hidden="true">{d.icono}</span>
              <span className={styles.obsEtiqueta}>{d.etiqueta}</span>
            </div>
            <span className={styles.obsValor}>{d.valor}</span>
            <p className={styles.obsDetalle}>{d.detalle}</p>
          </div>
        ))}
      </div>

      {/* Destino de los móviles */}
      <h3 className={styles.subSeccionTitulo}>¿Qué hacemos con el móvil viejo?</h3>
      <div className={styles.destinosLista}>
        {DESTINOS.map(d => (
          <div key={d.destino} className={styles.destinoFila}>
            <div className={styles.destinoInfo}>
              <span className={styles.destinoIcono} aria-hidden="true">{d.icono}</span>
              <span className={styles.destinoNombre}>{d.destino}</span>
              <span className={styles.destinoPct}>{formatNumber(d.porcentaje, 0)}%</span>
            </div>
            <div className={styles.destinoBarra}>
              <div
                className={styles.destinoRelleno}
                style={{ width: `${d.porcentaje}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Cada año se generan <strong>62 millones de toneladas</strong> de basura electrónica en el mundo —
          y solo se recicla el 17%. En cada millón de móviles hay ~16 toneladas de cobre, 350 kg de plata
          y 34 kg de oro. Reciclar 1 tonelada de móviles produce <strong>300 veces más oro</strong> que
          1 tonelada de mineral de mina. La basura electrónica es literalmente una mina de oro — que tiramos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAnatomiaSmartphonePage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('componentes');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'componentes': return <SeccionComponentes />;
      case 'minerales': return <SeccionMinerales />;
      case 'precio': return <SeccionPrecio />;
      case 'obsolescencia': return <SeccionObsolescencia />;
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
          <h1 className={styles.title}>Anatomía de un Smartphone</h1>
          <p className={styles.subtitle}>Lo que esconde el objeto que llevas siempre encima</p>
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
          title="El smartphone que cambió el mundo"
          subtitle="Contexto y claves para entender tu dispositivo"
          defaultOpen={false}
        >
          <h3>¿Por qué hay 60 elementos de la tabla periódica en tu bolsillo?</h3>
          <p>
            Un smartphone es el objeto más complejo que la humanidad ha producido en masa.
            Requiere <strong>silicio ultrapuro</strong> (99,9999999%) para los chips, <strong>tierras raras</strong> para
            los imanes y la pantalla, <strong>litio y cobalto</strong> para la batería, y <strong>oro</strong> para los
            conectores porque es el único metal que no se corroe. Ningún otro objeto de consumo concentra
            tanta diversidad de materiales en tan poco espacio.
          </p>

          <h3>La paradoja del cobalto</h3>
          <p>
            El 70% del cobalto mundial viene de la República Democrática del Congo, donde parte se extrae
            en minas artesanales con condiciones laborales inaceptables, incluyendo trabajo infantil
            documentado por Amnistía Internacional. Los fabricantes han creado programas de trazabilidad,
            pero la cadena de suministro tiene tantos intermediarios que la transparencia total sigue
            siendo un reto.
          </p>

          <h3>¿Es real la obsolescencia programada?</h3>
          <p>
            La obsolescencia tiene múltiples caras: <strong>software</strong> (dejan de llegar actualizaciones),
            <strong>batería</strong> (pierde capacidad tras 500-800 ciclos), <strong>percibida</strong> (el nuevo
            modelo es &quot;mejor&quot;) y <strong>ecosistema</strong> (apps nuevas exigen más recursos). La legislación
            europea de 2025 obliga a baterías reemplazables y piezas de repuesto durante 5 años,
            lo que podría extender la vida útil media de 2,7 a 4-5 años.
          </p>

          <h3>El reciclaje que no estamos haciendo</h3>
          <p>
            Solo el 17% de los dispositivos electrónicos se recicla formalmente. El resto acaba en
            cajones (~40%), basura normal o exportado a países en desarrollo donde se &quot;recicla&quot;
            quemando componentes al aire libre — liberando plomo, mercurio y dioxinas. Reciclar
            un millón de móviles recupera 16 toneladas de cobre, 350 kg de plata y 34 kg de oro:
            una &quot;mina urbana&quot; que estamos desperdiciando.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son orientativos y provienen de fuentes
            públicas (USGS, ONU, Fairphone, iFixit). Las cifras de costes son estimaciones basadas en
            análisis de desmontaje (teardown) publicados. Los porcentajes de minerales por país pueden
            variar según el año de referencia.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-anatomia-smartphone')} />
        <ShareCard appName="visualizador-anatomia-smartphone" />
        <Footer appName="visualizador-anatomia-smartphone" />
      </div>
    </>
  );
}
