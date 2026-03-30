'use client';

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorCanalVenta.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CanalId =
  | 'marketplace_generalista'
  | 'plataforma_sectorial'
  | 'tienda_propia'
  | 'redes_sociales'
  | 'venta_directa';

interface Canal {
  id: CanalId;
  nombre: string;
  icono: string;
  tagline: string;
  descripcion: string;
}

interface PesoOpcion {
  canal: CanalId;
  peso: number;
}

interface Opcion {
  texto: string;
  pesos: PesoOpcion[];
}

interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: Opcion[];
}

type Puntuaciones = Record<CanalId, number>;

// ─── Datos ────────────────────────────────────────────────────────────────────

const CANALES: Canal[] = [
  {
    id: 'marketplace_generalista',
    nombre: 'Marketplace Generalista',
    icono: '🛒',
    tagline: 'Acceso inmediato a millones de compradores',
    descripcion:
      'Plataformas como Amazon, Ebay o Miravia te dan visibilidad masiva desde el primer día sin necesidad de inversión en marketing. Ideal para productos de consumo masivo, con alta competencia de precio pero gran volumen de tráfico. La curva de aprendizaje es baja y puedes validar rápidamente si tu producto tiene demanda.',
  },
  {
    id: 'plataforma_sectorial',
    nombre: 'Plataforma o Marketplace Sectorial',
    icono: '🎯',
    tagline: 'Audiencia segmentada y lista para comprar en tu categoría',
    descripcion:
      'Marketplaces especializados (Etsy para artesanía, Wallapop para segunda mano, Booking para alojamiento, Infojobs para talento…) reúnen a compradores con intención muy específica. Hay menos competencia de precio que en los generalistas y el cliente busca activamente tu tipo de producto o servicio. Requiere conocer bien cuál es la plataforma de referencia en tu nicho.',
  },
  {
    id: 'tienda_propia',
    nombre: 'Tienda Online Propia',
    icono: '🏪',
    tagline: 'Control total de la marca, datos y márgenes',
    descripcion:
      'Con Shopify, WooCommerce o Prestashop eres dueño del canal: diseño, precios, datos de clientes y relación directa. Los márgenes son mejores a largo plazo, pero requiere inversión inicial en tecnología y, sobre todo, en marketing para atraer tráfico. Recomendado cuando ya has validado el producto y tienes estrategia de SEO o publicidad pagada.',
  },
  {
    id: 'redes_sociales',
    nombre: 'Venta por Redes Sociales (Social Commerce)',
    icono: '📱',
    tagline: 'Bajo coste inicial, ideal para productos visuales y comunidades',
    descripcion:
      'Instagram Shopping, TikTok Shop o Pinterest permiten vender sin necesidad de web propia. El coste de arranque es mínimo y funciona especialmente bien para productos visuales, moda, alimentación artesanal o servicios creativos. El éxito depende de tu capacidad para crear contenido atractivo de forma constante y construir comunidad.',
  },
  {
    id: 'venta_directa',
    nombre: 'Venta Directa o Local',
    icono: '🤝',
    tagline: 'Relación personal y cercana con el cliente',
    descripcion:
      'La venta presencial, ferias, mercadillos, puerta a puerta o la red de contactos personales sigue siendo el canal más eficaz para servicios profesionales, productos artesanales de alta gama y negocios con público local. La relación de confianza es difícil de replicar digitalmente y los márgenes suelen ser los más altos al eliminar intermediarios.',
  },
];

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '📦',
    texto: '¿Qué tipo de producto o servicio ofreces?',
    opciones: [
      {
        texto: 'Producto físico de consumo masivo (electrónica, hogar, moda básica…)',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'tienda_propia', peso: 1 },
        ],
      },
      {
        texto: 'Producto físico artesanal, único o de autor',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 3 },
          { canal: 'venta_directa', peso: 2 },
          { canal: 'redes_sociales', peso: 2 },
        ],
      },
      {
        texto: 'Producto digital (cursos, plantillas, software…)',
        pesos: [
          { canal: 'tienda_propia', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'redes_sociales', peso: 1 },
        ],
      },
      {
        texto: 'Servicio profesional o consultoría',
        pesos: [
          { canal: 'venta_directa', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'tienda_propia', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 2,
    icono: '👥',
    texto: '¿Ya tienes audiencia propia (seguidores, lista de email, comunidad)?',
    opciones: [
      {
        texto: 'Sí, tengo una comunidad activa en redes o email',
        pesos: [
          { canal: 'redes_sociales', peso: 3 },
          { canal: 'tienda_propia', peso: 2 },
        ],
      },
      {
        texto: 'Tengo algunos contactos pero no una audiencia consolidada',
        pesos: [
          { canal: 'venta_directa', peso: 2 },
          { canal: 'plataforma_sectorial', peso: 2 },
        ],
      },
      {
        texto: 'No, parto de cero y necesito visibilidad inmediata',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 2 },
        ],
      },
    ],
  },
  {
    id: 3,
    icono: '💶',
    texto: '¿Cuál es tu presupuesto inicial para tecnología y marketing?',
    opciones: [
      {
        texto: 'Menos de 200 € — quiero empezar casi sin inversión',
        pesos: [
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'redes_sociales', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 2 },
        ],
      },
      {
        texto: 'Entre 200 € y 1.000 € — algo de inversión es viable',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'venta_directa', peso: 1 },
        ],
      },
      {
        texto: 'Más de 1.000 € — estoy dispuesto a invertir para crecer',
        pesos: [
          { canal: 'tienda_propia', peso: 3 },
          { canal: 'marketplace_generalista', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 4,
    icono: '🎯',
    texto: '¿Tu producto tiene un nicho específico o es de consumo general?',
    opciones: [
      {
        texto: 'Nicho muy concreto con comunidad propia (deportes extremos, coleccionismo, mascotas…)',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 3 },
          { canal: 'redes_sociales', peso: 2 },
        ],
      },
      {
        texto: 'Nicho moderado dentro de una categoría amplia',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'tienda_propia', peso: 2 },
          { canal: 'marketplace_generalista', peso: 1 },
        ],
      },
      {
        texto: 'Consumo masivo, muchos potenciales compradores',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'tienda_propia', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 5,
    icono: '🏷️',
    texto: '¿Qué importancia tiene para ti el control sobre la marca y la experiencia de compra?',
    opciones: [
      {
        texto: 'Crítico — quiero diseñar cada detalle de la experiencia',
        pesos: [
          { canal: 'tienda_propia', peso: 3 },
          { canal: 'venta_directa', peso: 2 },
        ],
      },
      {
        texto: 'Moderado — prefiero visibilidad a control total',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'redes_sociales', peso: 1 },
        ],
      },
      {
        texto: 'Bajo — lo que importa es vender, no la presentación',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'venta_directa', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 6,
    icono: '🚚',
    texto: '¿Puedes gestionar tú mismo la logística y el envío?',
    opciones: [
      {
        texto: 'Sí, tengo capacidad de almacén y envíos propios',
        pesos: [
          { canal: 'tienda_propia', peso: 2 },
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'venta_directa', peso: 1 },
        ],
      },
      {
        texto: 'Prefiero externalizar la logística (FBA, dropshipping…)',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 1 },
        ],
      },
      {
        texto: 'Producto digital o servicio — no hay envío físico',
        pesos: [
          { canal: 'tienda_propia', peso: 3 },
          { canal: 'redes_sociales', peso: 2 },
          { canal: 'plataforma_sectorial', peso: 2 },
        ],
      },
      {
        texto: 'Venta local o presencial — no necesito logística online',
        pesos: [
          { canal: 'venta_directa', peso: 3 },
        ],
      },
    ],
  },
  {
    id: 7,
    icono: '💻',
    texto: '¿Cuál es tu nivel técnico para mantener una tienda online?',
    opciones: [
      {
        texto: 'Alto — sé instalar plugins, gestionar hosting y hacer ajustes de código',
        pesos: [
          { canal: 'tienda_propia', peso: 3 },
        ],
      },
      {
        texto: 'Medio — puedo usar plataformas tipo Shopify sin programar',
        pesos: [
          { canal: 'tienda_propia', peso: 2 },
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'redes_sociales', peso: 1 },
        ],
      },
      {
        texto: 'Bajo — prefiero plataformas donde solo subo fotos y precio',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'redes_sociales', peso: 2 },
          { canal: 'venta_directa', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 8,
    icono: '🧪',
    texto: '¿Necesitas validar tu producto antes de hacer una gran inversión?',
    opciones: [
      {
        texto: 'Sí, quiero probar si hay mercado con el mínimo coste',
        pesos: [
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'redes_sociales', peso: 3 },
          { canal: 'venta_directa', peso: 2 },
        ],
      },
      {
        texto: 'Ya he validado la demanda y ahora quiero escalar',
        pesos: [
          { canal: 'tienda_propia', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 2 },
        ],
      },
      {
        texto: 'Tengo experiencia previa, no necesito validar',
        pesos: [
          { canal: 'tienda_propia', peso: 2 },
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'plataforma_sectorial', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 9,
    icono: '🏢',
    texto: '¿Vendes a consumidor final (B2C) o a empresas (B2B)?',
    opciones: [
      {
        texto: 'Solo a consumidores finales (particulares)',
        pesos: [
          { canal: 'marketplace_generalista', peso: 2 },
          { canal: 'redes_sociales', peso: 2 },
          { canal: 'tienda_propia', peso: 1 },
        ],
      },
      {
        texto: 'Principalmente a empresas o profesionales',
        pesos: [
          { canal: 'venta_directa', peso: 3 },
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'tienda_propia', peso: 1 },
        ],
      },
      {
        texto: 'Mixto, tanto particulares como empresas',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'tienda_propia', peso: 2 },
          { canal: 'venta_directa', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 10,
    icono: '📸',
    texto: '¿Tienes capacidad (tiempo, habilidades o equipo) para crear contenido y hacer marketing en redes sociales?',
    opciones: [
      {
        texto: 'Sí, puedo crear contenido visual atractivo de forma regular',
        pesos: [
          { canal: 'redes_sociales', peso: 3 },
          { canal: 'tienda_propia', peso: 1 },
        ],
      },
      {
        texto: 'Algo, pero no de forma constante ni profesional',
        pesos: [
          { canal: 'plataforma_sectorial', peso: 2 },
          { canal: 'marketplace_generalista', peso: 1 },
          { canal: 'redes_sociales', peso: 1 },
        ],
      },
      {
        texto: 'No, el marketing en redes no es mi punto fuerte',
        pesos: [
          { canal: 'marketplace_generalista', peso: 3 },
          { canal: 'venta_directa', peso: 2 },
          { canal: 'plataforma_sectorial', peso: 1 },
        ],
      },
    ],
  },
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

function calcularPuntuaciones(respuestas: number[]): Puntuaciones {
  const pts: Puntuaciones = {
    marketplace_generalista: 0,
    plataforma_sectorial: 0,
    tienda_propia: 0,
    redes_sociales: 0,
    venta_directa: 0,
  };

  respuestas.forEach((respIdx, pregIdx) => {
    const opcion = PREGUNTAS[pregIdx]?.opciones[respIdx];
    if (!opcion) return;
    opcion.pesos.forEach(({ canal, peso }) => {
      pts[canal] += peso;
    });
  });

  return pts;
}

function canalGanador(pts: Puntuaciones): CanalId {
  return (Object.entries(pts) as [CanalId, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];
}

function rankingCanales(pts: Puntuaciones): { canal: Canal; puntos: number }[] {
  const max = Math.max(...Object.values(pts));
  return CANALES.map((canal) => ({ canal, puntos: pts[canal.id] }))
    .sort((a, b) => b.puntos - a.puntos)
    .map((item) => ({ ...item, pct: max > 0 ? (item.puntos / max) * 100 : 0 }));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SelectorCanalVenta() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = ((preguntaActual) / totalPreguntas) * 100;
  const pregunta = PREGUNTAS[preguntaActual];

  function seleccionar(idx: number) {
    setRespuestaSeleccionada(idx);
  }

  function siguientePregunta() {
    if (respuestaSeleccionada === null) return;

    const nuevasRespuestas = [...respuestas, respuestaSeleccionada];
    setRespuestas(nuevasRespuestas);

    if (preguntaActual + 1 >= totalPreguntas) {
      setMostrarResultado(true);
    } else {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
    }
  }

  function preguntaAnterior() {
    if (preguntaActual === 0) return;
    const nuevasRespuestas = respuestas.slice(0, -1);
    setRespuestas(nuevasRespuestas);
    setPreguntaActual(preguntaActual - 1);
    setRespuestaSeleccionada(nuevasRespuestas[preguntaActual - 1] ?? null);
  }

  function reiniciar() {
    setPreguntaActual(0);
    setRespuestas([]);
    setRespuestaSeleccionada(null);
    setMostrarResultado(false);
  }

  // ── Resultado ──
  if (mostrarResultado) {
    const pts = calcularPuntuaciones(respuestas);
    const ganador = canalGanador(pts);
    const canalInfo = CANALES.find((c) => c.id === ganador)!;
    const ranking = rankingCanales(pts);
    const maxPuntos = ranking[0].puntos;

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1>Tu canal de venta ideal</h1>
          <p>Basado en tus respuestas, aquí tienes la recomendación personalizada</p>
        </header>

        <div className={styles.resultado}>
          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcono} aria-hidden="true">
              {canalInfo.icono}
            </span>
            <h2 className={styles.resultadoTitulo}>{canalInfo.nombre}</h2>
            <p className={styles.resultadoSubtitulo}>{canalInfo.tagline}</p>
            <p className={styles.resultadoDesc}>{canalInfo.descripcion}</p>

            <div className={styles.otrosCanales}>
              <p className={styles.otrosCanalesTitulo}>Puntuación de todos los canales</p>
              {ranking.map(({ canal, puntos }) => (
                <div key={canal.id} className={styles.rankingItem}>
                  <span aria-hidden="true">{canal.icono}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{canal.nombre}</span>
                  <div className={styles.rankingBarra}>
                    <div
                      className={styles.rankingRelleno}
                      style={{ width: `${maxPuntos > 0 ? (puntos / maxPuntos) * 100 : 0}%` }}
                    />
                  </div>
                  <span style={{ width: '2rem', textAlign: 'right' }}>{puntos}</span>
                </div>
              ))}
            </div>

            <div className={styles.btnReiniciar}>
              <button type="button" className={styles.btnPrimary} onClick={reiniciar}>
                Repetir el test
              </button>
            </div>
          </div>

          <DisclaimerCard variant="general" severity="high" />

          <EducationalSection
            title="Canales de venta online en España"
            subtitle="Elige el canal que mejor encaja con tu producto y recursos"
          >
            <h3>¿Qué es un canal de venta?</h3>
            <p>
              Un canal de venta es el medio a través del cual una empresa pone sus productos o servicios
              a disposición del comprador. La elección del canal correcto determina en gran medida el
              coste de adquisición de clientes, el margen por venta y la velocidad de crecimiento.
            </p>

            <h3>Marketplace generalista</h3>
            <p>
              Amazon, eBay, Miravia o PCComponentes generan millones de visitas diarias. Entrar como
              vendedor es rápido y barato, pero la competencia de precio es intensa y la comisión
              media oscila entre el 8 % y el 15 % del precio de venta. Son ideales para lanzar un
              producto nuevo y validar demanda sin inversión en tráfico propio.
            </p>

            <h3>Plataforma o marketplace sectorial</h3>
            <p>
              Etsy (artesanía y vintage), Vinted (moda de segunda mano), Airbnb (alojamiento), Fiverr
              (servicios digitales) o Fotocasa (inmobiliaria) reúnen a compradores con intención muy
              específica. La conversión suele ser más alta que en los generalistas porque el usuario ya
              sabe lo que busca. La clave está en identificar el marketplace de referencia en tu
              categoría.
            </p>

            <h3>Tienda online propia</h3>
            <p>
              Plataformas como Shopify, WooCommerce (sobre WordPress) o Prestashop permiten construir
              un ecommerce personalizado. El punto fuerte es el control total: diseño, datos de
              clientes, precios y experiencia de compra. El punto débil es que debes generar tú mismo
              el tráfico, normalmente mediante SEO, publicidad de pago (Google Ads, Meta Ads) o email
              marketing.
            </p>

            <h3>Social commerce (venta en redes sociales)</h3>
            <p>
              Instagram Shopping, TikTok Shop y Pinterest Buyable Pins integran la pasarela de pago
              directamente en la red social. El coste de arranque es mínimo, pero el éxito depende de
              la capacidad de generar contenido visual atractivo de forma constante. Funciona
              especialmente bien para moda, cosméticos, alimentación artesanal y productos de estilo
              de vida.
            </p>

            <h3>Venta directa o local</h3>
            <p>
              Ferias, mercadillos, visitas comerciales, referidos y redes de contactos personales
              siguen siendo el canal con mayor tasa de conversión para servicios profesionales y
              productos artesanales de alta gama. La relación de confianza es difícil de replicar en
              digital y los márgenes suelen ser superiores al eliminar intermediarios y comisiones de
              plataforma.
            </p>

            <h3>Cómo combinar canales</h3>
            <p>
              No tienes que elegir solo uno. La estrategia omnicanal consiste en empezar por el canal
              con menor barrera de entrada para validar y generar caja, e ir añadiendo canales
              propietarios (tienda online, email list) a medida que creces. De esta forma reduces la
              dependencia de terceros y construyes un activo duradero.
            </p>

            <div className={styles.warningBox}>
              <strong>Consejo:</strong> Antes de invertir en tecnología, valida que existe demanda
              real para tu producto. Un perfil de Instagram o una ficha en un marketplace es suficiente
              para conseguir los primeros diez ventas y confirmar el modelo de negocio.
            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('selector-canal-venta')} />
          <ShareCard appName="selector-canal-venta" />
          <Footer appName="selector-canal-venta" />
        </div>
      </div>
    );
  }

  // ── Quiz ──
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Selector de Canal de Venta</h1>
        <p>
          10 preguntas para descubrir si tu negocio encaja mejor en un marketplace,
          una tienda propia, redes sociales o la venta directa
        </p>
      </header>

      <LegalNotice />

      <div className={styles.quiz}>
        <div className={styles.progreso}>
          <span>
            {preguntaActual + 1} / {totalPreguntas}
          </span>
          <div className={styles.barraProgreso} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={totalPreguntas}>
            <div className={styles.barraRelleno} style={{ width: `${progresoPct}%` }} />
          </div>
        </div>

        <div className={styles.pregunta}>
          <div className={styles.preguntaHeader}>
            <span className={styles.preguntaIcono} aria-hidden="true">
              {pregunta.icono}
            </span>
            <span className={styles.preguntaTexto}>{pregunta.texto}</span>
          </div>

          <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
            {pregunta.opciones.map((opcion, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.opcion}${respuestaSeleccionada === idx ? ' ' + styles.seleccionada : ''}`}
                onClick={() => seleccionar(idx)}
                aria-pressed={respuestaSeleccionada === idx}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navegacion}>
          <button
            type="button"
            className={styles.btnSecundario}
            onClick={preguntaAnterior}
            disabled={preguntaActual === 0}
          >
            ← Anterior
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={siguientePregunta}
            disabled={respuestaSeleccionada === null}
          >
            {preguntaActual + 1 === totalPreguntas ? 'Ver resultado' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
