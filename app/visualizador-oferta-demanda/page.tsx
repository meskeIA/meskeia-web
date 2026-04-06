'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorOfertaDemanda.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y datos
// ─────────────────────────────────────────────

type EscenarioId = 'petroleo' | 'sequia' | 'iphone' | 'tipos' | 'subvencion';
type CurvaAfectada = 'oferta' | 'demanda' | 'ambas';
type Direccion = 'sube' | 'baja';

interface Curva {
  desplazamiento: Direccion | 'ninguno';
  label: string;
}

interface Equilibrio {
  precio: number;
  cantidad: number;
  label: string;
}

interface Escenario {
  id: EscenarioId;
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  curvaAfectada: CurvaAfectada;
  oferta: Curva;
  demanda: Curva;
  equilibrioAntes: Equilibrio;
  equilibrioDespues: Equilibrio;
  mecanismo: string;
  consecuencia: string;
  ejemploVida: string;
}

const ESCENARIOS: Escenario[] = [
  {
    id: 'petroleo',
    icono: '🛢️',
    titulo: 'Sube el precio del petróleo',
    subtitulo: 'Shock de oferta negativo',
    descripcion: 'La OPEP recorta la producción. El petróleo encarece los costes de producción de casi todo: transporte, plásticos, fertilizantes, electricidad...',
    curvaAfectada: 'oferta',
    oferta: { desplazamiento: 'baja', label: 'La oferta se REDUCE — producir cuesta más' },
    demanda: { desplazamiento: 'ninguno', label: 'La demanda no cambia — seguimos necesitando energía' },
    equilibrioAntes: { precio: 50, cantidad: 80, label: 'Antes: precio bajo, producción normal' },
    equilibrioDespues: { precio: 75, cantidad: 55, label: 'Después: precio sube, producción baja' },
    mecanismo: 'Los productores necesitan cobrar más para cubrir sus mayores costes. A cada precio dado, están dispuestos a ofrecer MENOS cantidad que antes. La curva de oferta se desplaza hacia la izquierda.',
    consecuencia: 'El nuevo equilibrio tiene precio más alto y cantidad menor. Resultado: gasolina más cara, inflación generalizada, recesión económica en casos extremos.',
    ejemploVida: 'Crisis del petróleo de 1973: la OPEP cuadruplicó el precio. Resultado: gasolineras cerradas, coches sin combustible, recesión en todo Occidente. O el impacto de la guerra en Ucrania sobre el gas en 2022.',
  },
  {
    id: 'sequia',
    icono: '🍊',
    titulo: 'Sequía: la fruta escasea',
    subtitulo: 'Shock de oferta por fenómeno natural',
    descripcion: 'Un verano sin lluvias destruye parte de la cosecha de naranjas. Los agricultores tienen menos fruta para vender aunque quieran.',
    curvaAfectada: 'oferta',
    oferta: { desplazamiento: 'baja', label: 'La oferta CAE — hay menos naranjas físicamente' },
    demanda: { desplazamiento: 'ninguno', label: 'La demanda no cambia — seguimos queriendo naranjas' },
    equilibrioAntes: { precio: 1, cantidad: 90, label: 'Antes: naranjas baratas y abundantes' },
    equilibrioDespues: { precio: 1.8, cantidad: 45, label: 'Después: pocas naranjas, mucho más caras' },
    mecanismo: 'Con menos oferta y la misma demanda, los compradores compiten por las naranjas disponibles. Los precios suben hasta que la cantidad demandada baja lo suficiente para igualar la cantidad ofertada.',
    consecuencia: 'Las naranjas se encarecen. Los consumidores con menos recursos las dejan de comprar. Los agricultores que sí tienen cosecha obtienen más ingresos por kilo, aunque vendan menos total.',
    ejemploVida: 'En 2023, la sequía en España disparó el precio del aceite de oliva más del 100%. El mismo mecanismo: cosecha reducida + demanda constante = precio al alza.',
  },
  {
    id: 'iphone',
    icono: '📱',
    titulo: 'Sale el nuevo iPhone',
    subtitulo: 'Shock de demanda positivo',
    descripcion: 'Apple lanza un iPhone con IA revolucionaria. Millones de personas que tenían un modelo viejo deciden comprarlo ahora. La demanda explota.',
    curvaAfectada: 'demanda',
    oferta: { desplazamiento: 'ninguno', label: 'La oferta no cambia inmediatamente — Apple tarda en producir más' },
    demanda: { desplazamiento: 'sube', label: 'La demanda AUMENTA — todos quieren el nuevo modelo' },
    equilibrioAntes: { precio: 1000, cantidad: 40, label: 'Antes: ventas normales, precio estable' },
    equilibrioDespues: { precio: 1200, cantidad: 70, label: 'Después: listas de espera, precio premium' },
    mecanismo: 'Con más gente queriendo comprar el mismo producto, los vendedores pueden subir el precio. Apple (o los revendedores) suben precios hasta que la cantidad demandada vuelve a igualar la oferta disponible.',
    consecuencia: 'Precio más alto y mayor cantidad vendida cuando la oferta se adapta. En el corto plazo: listas de espera, scalpers, precios inflados en segunda mano.',
    ejemploVida: 'Las entradas de un concierto de Taylor Swift: la demanda supera con creces la oferta fija del estadio. Resultado: precio oficial agotado en segundos, reventa a 10x el precio. Mismo mecanismo.',
  },
  {
    id: 'tipos',
    icono: '🏦',
    titulo: 'El BCE sube los tipos de interés',
    subtitulo: 'Shock de demanda negativo',
    descripcion: 'El Banco Central Europeo sube los tipos al 4%. Las hipotecas y los préstamos se encarecen. Menos gente puede permitirse comprar una casa.',
    curvaAfectada: 'demanda',
    oferta: { desplazamiento: 'ninguno', label: 'La oferta de viviendas no cambia de golpe' },
    demanda: { desplazamiento: 'baja', label: 'La demanda de vivienda CAE — la financiación es más cara' },
    equilibrioAntes: { precio: 250, cantidad: 65, label: 'Antes: mercado activo, precios al alza' },
    equilibrioDespues: { precio: 195, cantidad: 35, label: 'Después: menos compras, precios bajan' },
    mecanismo: 'Con hipotecas más caras, muchos compradores potenciales quedan fuera del mercado. Con menos compradores, los vendedores tienen que bajar los precios para vender. La curva de demanda se desplaza a la izquierda.',
    consecuencia: 'Este es exactamente el objetivo del BCE: enfriar la economía bajando la demanda de bienes duraderos para reducir la inflación. Vivienda más barata, pero también menos actividad económica.',
    ejemploVida: 'En 2022-2023, el BCE subió tipos del 0% al 4,5% en tiempo récord. El mercado inmobiliario europeo se enfrió notablemente: menos operaciones y caída de precios en muchos mercados.',
  },
  {
    id: 'subvencion',
    icono: '☀️',
    titulo: 'Subvención a los paneles solares',
    subtitulo: 'Desplazamiento de oferta positivo',
    descripcion: 'El gobierno subvenciona la instalación de paneles solares con 3.000 € por hogar. Para los instaladores es como si el coste de producción bajara.',
    curvaAfectada: 'oferta',
    oferta: { desplazamiento: 'sube', label: 'La oferta AUMENTA — la subvención reduce el coste efectivo' },
    demanda: { desplazamiento: 'ninguno', label: 'La demanda también sube, pero el efecto oferta es el principal' },
    equilibrioAntes: { precio: 8000, cantidad: 20, label: 'Antes: mercado pequeño, precio elevado' },
    equilibrioDespues: { precio: 5500, cantidad: 60, label: 'Después: mercado masivo, precio accesible' },
    mecanismo: 'La subvención permite a los instaladores ofrecer el mismo servicio a menor precio neto para el cliente. Con precio más bajo, más hogares pueden permitírselo. La oferta efectiva se desplaza a la derecha: más cantidad a cada nivel de precio.',
    consecuencia: 'Precio más bajo para el consumidor y mayor cantidad instalada. El objetivo político se cumple: más adopción de energía solar. El coste real lo paga el conjunto de los contribuyentes.',
    ejemploVida: 'El plan MOVES para coches eléctricos o el bono cultura: la subvención hace que el precio efectivo para el comprador baje, disparando la demanda. En Alemania, los subsidios solares de 2010 crearon una industria que antes era marginal.',
  },
];

// ─────────────────────────────────────────────
// Componente de visualización de curva
// ─────────────────────────────────────────────

interface CurvaVisualProps {
  precio: number;
  cantidad: number;
  precioAntes: number;
  cantidadAntes: number;
  color: string;
  label: string;
}

function CurvaVisual({ precio, cantidad, precioAntes, cantidadAntes, color, label }: CurvaVisualProps) {
  const maxPrecio = Math.max(precio, precioAntes) * 1.3;
  const maxCantidad = Math.max(cantidad, cantidadAntes) * 1.3;
  const barAltura = Math.round((precio / maxPrecio) * 100);
  const barAncho = Math.round((cantidad / maxCantidad) * 100);

  return (
    <div className={styles.curvaVisual}>
      <div className={styles.curvaLabel} style={{ color }}>{label}</div>
      <div className={styles.curvaBarras}>
        <div className={styles.curvaEje}>
          <span className={styles.curvaEjeLabel}>Precio</span>
          <div className={styles.barraVertical}>
            <div
              className={styles.barraFill}
              style={{ height: `${barAltura}%`, background: color }}
              aria-label={`Precio: ${precio}`}
            />
          </div>
          <span className={styles.curvaValor}>{precio}</span>
        </div>
        <div className={styles.curvaEje}>
          <span className={styles.curvaEjeLabel}>Cantidad</span>
          <div className={styles.barraVertical}>
            <div
              className={styles.barraFill}
              style={{ height: `${barAncho}%`, background: color }}
              aria-label={`Cantidad: ${cantidad}`}
            />
          </div>
          <span className={styles.curvaValor}>{cantidad}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Diagrama de desplazamiento de curva
// ─────────────────────────────────────────────

interface DiagramaCurvaProps {
  tipo: 'oferta' | 'demanda';
  desplazamiento: Direccion | 'ninguno';
}

function DiagramaCurva({ tipo, desplazamiento }: DiagramaCurvaProps) {
  const colorBase = tipo === 'oferta' ? '#2E86AB' : '#e74c3c';
  const colorNueva = tipo === 'oferta' ? '#48A9A6' : '#e67e22';
  const esOferta = tipo === 'oferta';

  // Puntos de la curva en SVG (viewBox 100x100)
  // Oferta: pendiente positiva (↗), Demanda: pendiente negativa (↘)
  const curvaOriginal = esOferta
    ? 'M 15,85 L 85,15'
    : 'M 15,15 L 85,85';

  let curvaNueva = '';
  if (desplazamiento !== 'ninguno') {
    if (esOferta) {
      curvaNueva = desplazamiento === 'baja'
        ? 'M 35,85 L 85,30'   // desplazada a la izquierda (menos oferta)
        : 'M 10,75 L 75,10';  // desplazada a la derecha (más oferta)
    } else {
      curvaNueva = desplazamiento === 'sube'
        ? 'M 25,10 L 90,75'   // desplazada a la derecha (más demanda)
        : 'M 10,25 L 70,90';  // desplazada a la izquierda (menos demanda)
    }
  }

  const labelTipo = tipo === 'oferta' ? 'O' : 'D';
  const labelDir = desplazamiento === 'sube' ? '→' : desplazamiento === 'baja' ? '←' : '';

  return (
    <div className={styles.diagramaWrap}>
      <div className={styles.diagramaTitulo} style={{ color: colorBase }}>
        Curva de {esOferta ? 'Oferta' : 'Demanda'}
      </div>
      <svg
        viewBox="0 0 100 100"
        className={styles.diagramaSvg}
        role="img"
        aria-label={`Curva de ${tipo}${desplazamiento !== 'ninguno' ? ` se desplaza ${desplazamiento === 'sube' ? 'hacia arriba/derecha' : 'hacia abajo/izquierda'}` : ', sin cambio'}`}
      >
        {/* Ejes */}
        <line x1="10" y1="90" x2="95" y2="90" stroke="#ccc" strokeWidth="1.5" />
        <line x1="10" y1="90" x2="10" y2="5" stroke="#ccc" strokeWidth="1.5" />
        {/* Etiquetas ejes */}
        <text x="98" y="93" fontSize="6" fill="#999">Q</text>
        <text x="6" y="4" fontSize="6" fill="#999">P</text>
        {/* Curva original */}
        <path d={curvaOriginal} stroke={colorBase} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text
          x={esOferta ? '87' : '87'}
          y={esOferta ? '13' : '87'}
          fontSize="7" fill={colorBase} fontWeight="bold"
        >
          {labelTipo}₁
        </text>
        {/* Curva nueva (si hay desplazamiento) */}
        {desplazamiento !== 'ninguno' && curvaNueva && (
          <>
            <path
              d={curvaNueva}
              stroke={colorNueva}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="5,2"
            />
            <text
              x={esOferta ? (desplazamiento === 'baja' ? '87' : '73') : (desplazamiento === 'sube' ? '92' : '68')}
              y={esOferta ? (desplazamiento === 'baja' ? '28' : '8') : (desplazamiento === 'sube' ? '73' : '92')}
              fontSize="7" fill={colorNueva} fontWeight="bold"
            >
              {labelTipo}₂
            </text>
            {/* Flecha indicando dirección */}
            <text x="48" y="50" fontSize="10" fill={colorNueva} fontWeight="bold" textAnchor="middle">
              {labelDir}
            </text>
          </>
        )}
      </svg>
      <div className={styles.diagramaEstado} style={{ color: desplazamiento !== 'ninguno' ? colorNueva : '#999' }}>
        {desplazamiento === 'ninguno' ? 'Sin cambio' : desplazamiento === 'sube' ? '↑ Se desplaza a la derecha' : '↓ Se desplaza a la izquierda'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Comparador de equilibrio
// ─────────────────────────────────────────────

interface ComparadorEquilibrioProps {
  antes: Equilibrio;
  despues: Equilibrio;
}

function ComparadorEquilibrio({ antes, despues }: ComparadorEquilibrioProps) {
  const precioSube = despues.precio > antes.precio;
  const cantidadSube = despues.cantidad > antes.cantidad;
  const maxPrecio = Math.max(antes.precio, despues.precio);
  const maxCantidad = Math.max(antes.cantidad, despues.cantidad);

  return (
    <div className={styles.comparador}>
      <div className={styles.comparadorFila}>
        <div className={styles.comparadorBloque}>
          <div className={styles.comparadorEtiqueta}>Antes</div>
          <div className={styles.comparadorPrecio} style={{ color: '#666' }}>
            Precio: {antes.precio}
          </div>
          <div className={styles.comparadorCantidad} style={{ color: '#666' }}>
            Cantidad: {antes.cantidad}
          </div>
          <div className={styles.comparadorBarraPrecio}>
            <div
              className={styles.comparadorBarraFill}
              style={{ width: `${Math.round((antes.precio / maxPrecio) * 100)}%`, background: '#ccc' }}
            />
          </div>
          <div className={styles.comparadorBarraCantidad}>
            <div
              className={styles.comparadorBarraFill}
              style={{ width: `${Math.round((antes.cantidad / maxCantidad) * 100)}%`, background: '#ccc' }}
            />
          </div>
        </div>

        <div className={styles.comparadorFlecha} aria-hidden="true">→</div>

        <div className={styles.comparadorBloque}>
          <div className={styles.comparadorEtiqueta}>Después</div>
          <div
            className={styles.comparadorPrecio}
            style={{ color: precioSube ? '#e74c3c' : '#27ae60' }}
          >
            Precio: {despues.precio} {precioSube ? '↑' : '↓'}
          </div>
          <div
            className={styles.comparadorCantidad}
            style={{ color: cantidadSube ? '#27ae60' : '#e74c3c' }}
          >
            Cantidad: {despues.cantidad} {cantidadSube ? '↑' : '↓'}
          </div>
          <div className={styles.comparadorBarraPrecio}>
            <div
              className={styles.comparadorBarraFill}
              style={{
                width: `${Math.round((despues.precio / maxPrecio) * 100)}%`,
                background: precioSube ? '#e74c3c' : '#27ae60',
              }}
            />
          </div>
          <div className={styles.comparadorBarraCantidad}>
            <div
              className={styles.comparadorBarraFill}
              style={{
                width: `${Math.round((despues.cantidad / maxCantidad) * 100)}%`,
                background: cantidadSube ? '#27ae60' : '#e74c3c',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorOfertaDemandaPage() {
  const [escenarioActivo, setEscenarioActivo] = useState<EscenarioId>('petroleo');

  const escenario = ESCENARIOS.find(e => e.id === escenarioActivo)!;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Oferta, Demanda y por qué Suben los Precios</h1>
          <p className={styles.subtitle}>5 escenarios reales que explican cómo los mercados fijan los precios</p>
        </header>

        <LegalNotice />

        {/* Introducción rápida */}
        <div className={styles.intro}>
          <p className={styles.introTexto}>
            Cuando la oferta sube o la demanda baja, los precios caen. Cuando la oferta cae o la demanda sube,
            los precios suben. Pero el detalle está en <strong>por qué</strong> se producen esos desplazamientos.
            Elige un escenario para verlo en acción.
          </p>
        </div>

        {/* Selector de escenarios */}
        <div className={styles.escenariosGrid} role="list">
          {ESCENARIOS.map(e => (
            <button
              key={e.id}
              type="button"
              role="listitem"
              className={`${styles.escenarioBtn} ${escenarioActivo === e.id ? styles.escenarioActivo : ''}`}
              onClick={() => setEscenarioActivo(e.id)}
              aria-pressed={escenarioActivo === e.id}
            >
              <span className={styles.escenarioIcono} aria-hidden="true">{e.icono}</span>
              <span className={styles.escenarioTitulo}>{e.titulo}</span>
              <span className={styles.escenarioSubtitulo}>{e.subtitulo}</span>
            </button>
          ))}
        </div>

        {/* Panel principal del escenario */}
        <div className={styles.panel} key={escenario.id}>
          {/* Descripción del escenario */}
          <div className={styles.panelHeader}>
            <span className={styles.panelIcono} aria-hidden="true">{escenario.icono}</span>
            <div>
              <h2 className={styles.panelTitulo}>{escenario.titulo}</h2>
              <p className={styles.panelSubtitulo}>{escenario.subtitulo}</p>
            </div>
          </div>
          <p className={styles.panelDescripcion}>{escenario.descripcion}</p>

          {/* Diagramas de curvas */}
          <div className={styles.diagramasSeccion}>
            <h3 className={styles.seccionTitulo}>¿Qué curva se desplaza?</h3>
            <div className={styles.diagramasFila}>
              <DiagramaCurva tipo="oferta" desplazamiento={escenario.oferta.desplazamiento} />
              <DiagramaCurva tipo="demanda" desplazamiento={escenario.demanda.desplazamiento} />
            </div>
            <div className={styles.curvaLabels}>
              <div className={styles.curvaLabelItem} style={{ borderColor: '#2E86AB' }}>
                <span className={styles.curvaLabelIcono} aria-hidden="true">📦</span>
                <span>{escenario.oferta.label}</span>
              </div>
              <div className={styles.curvaLabelItem} style={{ borderColor: '#e74c3c' }}>
                <span className={styles.curvaLabelIcono} aria-hidden="true">🛒</span>
                <span>{escenario.demanda.label}</span>
              </div>
            </div>
          </div>

          {/* Mecanismo */}
          <div className={styles.mecanismoCard}>
            <div className={styles.mecanismoTitulo}>¿Por qué ocurre esto?</div>
            <p className={styles.mecanismoTexto}>{escenario.mecanismo}</p>
          </div>

          {/* Nuevo equilibrio */}
          <div className={styles.equilibrioSeccion}>
            <h3 className={styles.seccionTitulo}>Nuevo punto de equilibrio</h3>
            <ComparadorEquilibrio
              antes={escenario.equilibrioAntes}
              despues={escenario.equilibrioDespues}
            />
            <div className={styles.equilibrioLabels}>
              <div className={styles.equilibrioLabelAntes}>{escenario.equilibrioAntes.label}</div>
              <div className={styles.equilibrioLabelDespues}>{escenario.equilibrioDespues.label}</div>
            </div>
          </div>

          {/* Consecuencia */}
          <div className={styles.consecuenciaCard}>
            <div className={styles.consecuenciaTitulo}>Consecuencia real</div>
            <p className={styles.consecuenciaTexto}>{escenario.consecuencia}</p>
          </div>

          {/* Ejemplo de vida real */}
          <div className={styles.ejemploCard}>
            <div className={styles.ejemploTitulo}>
              <span aria-hidden="true">🌍</span> Caso real
            </div>
            <p className={styles.ejemploTexto}>{escenario.ejemploVida}</p>
          </div>
        </div>

        {/* Resumen rápido de los 5 escenarios */}
        <div className={styles.resumenCard}>
          <h3 className={styles.resumenTitulo}>Los 5 mecanismos de un vistazo</h3>
          <div className={styles.resumenGrid}>
            {ESCENARIOS.map(e => {
              const precioSube = e.equilibrioDespues.precio > e.equilibrioAntes.precio;
              return (
                <div key={e.id} className={styles.resumenItem}>
                  <span className={styles.resumenIcono} aria-hidden="true">{e.icono}</span>
                  <div className={styles.resumenInfo}>
                    <span className={styles.resumenNombre}>{e.titulo}</span>
                    <span
                      className={styles.resumenPrecio}
                      style={{ color: precioSube ? '#e74c3c' : '#27ae60' }}
                    >
                      Precio {precioSube ? '↑ sube' : '↓ baja'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección educativa */}
        <EducationalSection title="Economía en profundidad" subtitle="Oferta, demanda y mercados" defaultOpen={false}>
          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>¿Qué es la curva de demanda?</h3>
            <p className={styles.eduTexto}>
              La curva de demanda muestra cuántas unidades de un bien están dispuestos a comprar los consumidores
              a cada precio posible. Tiene pendiente negativa: a menor precio, más gente compra. A mayor precio,
              menos gente puede o quiere comprarlo.
            </p>
            <p className={styles.eduTexto}>
              Los desplazamientos de la curva ocurren cuando cambia algo <em>distinto al precio</em>: la renta de
              los consumidores, sus preferencias, el precio de bienes sustitutivos o complementarios, o las
              expectativas sobre el futuro.
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>¿Qué es la curva de oferta?</h3>
            <p className={styles.eduTexto}>
              La curva de oferta muestra cuántas unidades están dispuestos a vender los productores a cada precio.
              Tiene pendiente positiva: a mayor precio, más les compensa producir. A menor precio, solo producen
              los más eficientes.
            </p>
            <p className={styles.eduTexto}>
              Los desplazamientos ocurren cuando cambian los costes de producción (materias primas, energía,
              salarios), la tecnología disponible, el número de productores en el mercado, o las políticas
              gubernamentales (impuestos, subvenciones).
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>El precio de equilibrio</h3>
            <p className={styles.eduTexto}>
              El precio de equilibrio es aquel al que la cantidad que quieren comprar los consumidores
              coincide exactamente con la cantidad que quieren vender los productores. Si el precio está
              por encima del equilibrio, hay exceso de oferta (sobra producto). Si está por debajo, hay
              exceso de demanda (escasez).
            </p>
            <p className={styles.eduTexto}>
              En mercados competitivos, el precio tiende naturalmente hacia el equilibrio. Esta es la
              intuición central de la economía de mercado: los precios actúan como señales que coordinan
              las decisiones de millones de personas sin que nadie las dirija.
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>Desplazamientos vs. movimientos a lo largo de la curva</h3>
            <p className={styles.eduTexto}>
              Hay que distinguir dos cosas: (1) un <strong>movimiento a lo largo de la curva</strong>,
              causado por un cambio en el precio del propio bien, y (2) un <strong>desplazamiento de la curva</strong>,
              causado por un cambio en cualquier otro factor.
            </p>
            <p className={styles.eduTexto}>
              Ejemplo: si sube el precio de la gasolina, los consumidores compran menos gasolina (movimiento
              a lo largo de la curva de demanda). Pero si salen al mercado más coches eléctricos, la demanda
              de gasolina baja a todos los precios (desplazamiento de la curva).
            </p>
          </div>

          <div className={styles.eduBloque}>
            <h3 className={styles.eduTitulo}>Elasticidad: no todos los mercados reaccionan igual</h3>
            <p className={styles.eduTexto}>
              La elasticidad mide cuánto cambia la cantidad demandada (u ofertada) ante un cambio en el precio.
              Los bienes de primera necesidad (medicamentos, agua, gasolina) son inelásticos: aunque suba mucho
              el precio, seguimos comprando casi la misma cantidad. Los bienes de lujo o con muchos sustitutos
              son elásticos: una pequeña subida de precio hunde la demanda.
            </p>
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Nota educativa:</strong> Los valores numéricos de precio y cantidad en este explicador son
            ejemplos simplificados para ilustrar la dirección de los cambios, no datos estadísticos reales.
            En economía real, los desplazamientos y sus magnitudes dependen de múltiples factores y
            varían según el mercado, el contexto y el período de tiempo analizado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-oferta-demanda')} />
        <ShareCard appName="visualizador-oferta-demanda" />
        <Footer appName="visualizador-oferta-demanda" />
      </div>
    </>
  );
}
