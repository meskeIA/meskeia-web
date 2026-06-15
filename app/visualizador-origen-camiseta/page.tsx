'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorOrigenCamiseta.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Datos: cadena de producción de una camiseta de 15€
// Fuentes: Clean Clothes Campaign, War on Want, Business of Fashion
// ─────────────────────────────────────────────

interface Etapa {
  id: number;
  nombre: string;
  icono: string;
  pais: string;
  bandera: string;
  coste: number;        // €
  tiempo: string;
  color: string;
  impacto: string;      // dato laboral o ambiental
  descripcion: string;
}

const PRECIO_TOTAL = 15;

const ETAPAS: Etapa[] = [
  {
    id: 1,
    nombre: 'Cultivo del algodón',
    icono: '🌱',
    pais: 'India / Uzbekistán',
    bandera: '🇮🇳',
    coste: 0.60,
    tiempo: '6 meses',
    color: '#27ae60',
    impacto: 'El algodón usa el 2,4% de la tierra cultivable mundial pero el 24% de los insecticidas. En India, 350.000 agricultores trabajan en condiciones de endeudamiento crónico.',
    descripcion: 'El viaje comienza en los campos. Una camiseta necesita unos 200 g de algodón, lo que equivale a cultivar durante 6 meses con riego intensivo. India y Uzbekistán producen juntos el 25% del algodón mundial.',
  },
  {
    id: 2,
    nombre: 'Hilado y tejido',
    icono: '🧵',
    pais: 'Bangladesh / India',
    bandera: '🇧🇩',
    coste: 0.50,
    tiempo: '2 semanas',
    color: '#e67e22',
    impacto: 'Las hilanderías de Bangladesh emplean mayoritariamente mujeres con salarios de 70-90€ al mes. El polvo de algodón en el aire causa bissinosis (enfermedad pulmonar crónica).',
    descripcion: 'Las fibras de algodón se hilan y tejen para formar la tela. Bangladesh se ha convertido en el segundo mayor exportador textil del mundo, con más de 4 millones de trabajadores en el sector.',
  },
  {
    id: 3,
    nombre: 'Tinte y acabados',
    icono: '🎨',
    pais: 'China',
    bandera: '🇨🇳',
    coste: 0.45,
    tiempo: '1 semana',
    color: '#9b59b6',
    impacto: 'La industria textil genera el 20% de la contaminación del agua industrial mundial. Se necesitan entre 150 y 200 litros de agua para teñir 1 kg de tela. Los ríos cercanos a las fábricas cambian de color según la temporada de moda.',
    descripcion: 'La tela recibe su color y tratamientos de acabado (antiencogimiento, brillo, tacto suave). China concentra el 50% de la capacidad mundial de tinte textil. Los procesos usan centenares de químicos, muchos sin regulación estricta.',
  },
  {
    id: 4,
    nombre: 'Confección',
    icono: '✂️',
    pais: 'Turquía / Vietnam',
    bandera: '🇹🇷',
    coste: 2.00,
    tiempo: '3 días',
    color: '#e74c3c',
    impacto: 'En Turquía, una costurera gana entre 350-450€/mes (salario mínimo). En Vietnam, 200-250€/mes. El derrumbe del Rana Plaza (Bangladesh, 2013) mató a 1.134 trabajadores y cambió la regulación internacional de seguridad textil.',
    descripcion: 'Este es el paso más intensivo en mano de obra. Cortar, coser, planchar y controlar la calidad. Una camiseta requiere entre 11 y 18 minutos de trabajo manual. La confección representa el mayor coste laboral de toda la cadena.',
  },
  {
    id: 5,
    nombre: 'Transporte marítimo',
    icono: '🚢',
    pais: 'Océano / Logística global',
    bandera: '🌊',
    coste: 0.10,
    tiempo: '30 días',
    color: '#2980b9',
    impacto: 'El transporte marítimo emite el 2,5% del CO₂ global. Un barco portacontenedores puede transportar 20.000 cajas de camisetas de Asia a Europa. El combustible bunker (el más contaminante del mundo) impulsa estos gigantes.',
    descripcion: 'Las camisetas se empaquetan en contenedores y navegan desde los puertos de Estambul o Ho Chi Minh hasta el puerto de Valencia o Barcelona. 30 días en barco. El flete marítimo es tan barato que supone menos de 1€ por camiseta.',
  },
  {
    id: 6,
    nombre: 'Tienda y margen',
    icono: '🏪',
    pais: 'España',
    bandera: '🇪🇸',
    coste: 11.35,
    tiempo: '—',
    color: '#2E86AB',
    impacto: 'El margen minorista es del 60-70% del precio final. Incluye alquiler local premium, personal de tienda, marketing, devoluciones (30-40% en online) y beneficio empresarial. El consumidor paga 15€ por algo que costó fabricar y transportar menos de 4€.',
    descripcion: 'La camiseta llega al almacén logístico, se distribuye a tiendas y se pone a la venta. El precio se multiplica 4-5 veces respecto al coste de producción. Este margen financia la publicidad, los locales comerciales, la logística inversa y el beneficio de la marca.',
  },
];

// Precio de producción + transporte (todo excepto margen tienda)
const COSTE_PRODUCCION = ETAPAS.slice(0, 5).reduce((sum, e) => sum + e.coste, 0);

export default function VisualizadorOrigenCamisetaPage() {
  const [etapaActiva, setEtapaActiva] = useState<number>(0);
  const etapa = etapaActiva > 0 ? ETAPAS.find(e => e.id === etapaActiva) : null;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>De dónde Viene tu Camiseta</h1>
          <p className={styles.subtitle}>El viaje de una camiseta de 15€ por 4 países, 6 meses y millones de manos</p>
        </header>

        <LegalNotice />

        {/* Resumen de precio */}
        <div className={styles.resumenPrecio}>
          <div className={styles.resumenItem}>
            <span className={styles.resumenIcono} aria-hidden="true">🏭</span>
            <div>
              <p className={styles.resumenLabel}>Coste de fabricación + envío</p>
              <p className={styles.resumenValor} style={{ color: '#e74c3c' }}>{COSTE_PRODUCCION.toFixed(2).replace('.', ',')} €</p>
            </div>
          </div>
          <div className={styles.resumenSeparador} aria-hidden="true">→</div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenIcono} aria-hidden="true">🏷️</span>
            <div>
              <p className={styles.resumenLabel}>Precio en tienda</p>
              <p className={styles.resumenValor} style={{ color: '#2E86AB' }}>{PRECIO_TOTAL},00 €</p>
            </div>
          </div>
          <div className={styles.resumenSeparador} aria-hidden="true">→</div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenIcono} aria-hidden="true">📈</span>
            <div>
              <p className={styles.resumenLabel}>Multiplicador</p>
              <p className={styles.resumenValor} style={{ color: '#27ae60' }}>×{(PRECIO_TOTAL / COSTE_PRODUCCION).toFixed(1).replace('.', ',')}</p>
            </div>
          </div>
        </div>

        {/* Barra de composición del precio */}
        <section className={styles.barraSeccion} aria-label="Composición del precio por etapa">
          <h2 className={styles.barraTitulo}>¿A dónde va cada euro?</h2>
          <p className={styles.barraSubtitulo}>Porcentaje del precio final (15 €) que corresponde a cada etapa</p>
          <div className={styles.barraPrecio} role="img" aria-label="Barra de composición del precio">
            {ETAPAS.map(e => {
              const pct = (e.coste / PRECIO_TOTAL) * 100;
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`${styles.barraSegmento} ${etapaActiva === e.id ? styles.barraSegmentoActivo : ''}`}
                  style={{ width: `${pct}%`, backgroundColor: e.color }}
                  onClick={() => setEtapaActiva(etapaActiva === e.id ? 0 : e.id)}
                  title={`${e.nombre}: ${e.coste.toFixed(2).replace('.', ',')} € (${pct.toFixed(0)}%)`}
                  aria-pressed={etapaActiva === e.id}
                  aria-label={`${e.nombre}: ${e.coste.toFixed(2).replace('.', ',')} euros, ${pct.toFixed(0)}% del precio`}
                />
              );
            })}
          </div>
          <div className={styles.barraLeyenda}>
            {ETAPAS.map(e => (
              <div key={e.id} className={styles.barraLeyendaItem}>
                <span className={styles.barraLeyendaDot} style={{ backgroundColor: e.color }} aria-hidden="true" />
                <span className={styles.barraLeyendaTexto}>{e.icono} {e.nombre}</span>
                <span className={styles.barraLeyendaCoste}>{e.coste.toFixed(2).replace('.', ',')} €</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline de etapas */}
        <section className={styles.timelineSeccion} aria-label="Timeline de etapas de producción">
          <h2 className={styles.barraTitulo}>El viaje paso a paso</h2>
          <p className={styles.barraSubtitulo}>Haz clic en cada etapa para ver los detalles</p>

          <div className={styles.timeline}>
            {ETAPAS.map((e, i) => (
              <div key={e.id} className={styles.timelineEtapa}>
                <button
                  type="button"
                  className={`${styles.timelineNodo} ${etapaActiva === e.id ? styles.timelineNodoActivo : ''}`}
                  style={etapaActiva === e.id ? { borderColor: e.color, backgroundColor: e.color } : { borderColor: e.color }}
                  onClick={() => setEtapaActiva(etapaActiva === e.id ? 0 : e.id)}
                  aria-pressed={etapaActiva === e.id}
                  aria-label={`Etapa ${e.id}: ${e.nombre}`}
                >
                  <span className={styles.timelineIcono} aria-hidden="true">{e.icono}</span>
                  <span className={styles.timelineNum}>{e.id}</span>
                </button>
                {i < ETAPAS.length - 1 && (
                  <div className={styles.timelineLinea} aria-hidden="true" />
                )}
                <p className={styles.timelineLabel}>{e.nombre}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Panel de detalle */}
        {etapa && (
          <div
            className={styles.detallePanel}
            style={{ borderLeftColor: etapa.color }}
            role="region"
            aria-label={`Detalle de la etapa: ${etapa.nombre}`}
          >
            <div className={styles.detalleCabecera}>
              <span className={styles.detalleIconoGrande} aria-hidden="true">{etapa.icono}</span>
              <div className={styles.detalleTitulos}>
                <h3 className={styles.detalleNombre} style={{ color: etapa.color }}>
                  Etapa {etapa.id}: {etapa.nombre}
                </h3>
                <p className={styles.detallePais}>
                  <span aria-hidden="true">{etapa.bandera}</span> {etapa.pais}
                </p>
              </div>
            </div>

            <div className={styles.detalleMeta}>
              <div className={styles.detalleMetaItem}>
                <span className={styles.detalleMetaIcono} aria-hidden="true">💶</span>
                <div>
                  <p className={styles.detalleMetaLabel}>Coste de esta etapa</p>
                  <p className={styles.detalleMetaValor} style={{ color: etapa.color }}>
                    {etapa.coste.toFixed(2).replace('.', ',')} € de los 15 € totales
                    <span className={styles.detalleMetaPct}>
                      {' '}({((etapa.coste / PRECIO_TOTAL) * 100).toFixed(0)}%)
                    </span>
                  </p>
                </div>
              </div>
              <div className={styles.detalleMetaItem}>
                <span className={styles.detalleMetaIcono} aria-hidden="true">⏱️</span>
                <div>
                  <p className={styles.detalleMetaLabel}>Tiempo de esta etapa</p>
                  <p className={styles.detalleMetaValor}>{etapa.tiempo}</p>
                </div>
              </div>
            </div>

            <p className={styles.detalleDescripcion}>{etapa.descripcion}</p>

            <div className={styles.detalleImpacto}>
              <span className={styles.detalleImpactoIcono} aria-hidden="true">⚠️</span>
              <p className={styles.detalleImpactoTexto}>{etapa.impacto}</p>
            </div>

            <button
              type="button"
              className={styles.detalleCerrar}
              onClick={() => setEtapaActiva(0)}
              aria-label="Cerrar detalle de etapa"
            >
              Cerrar ✕
            </button>
          </div>
        )}

        {/* Dato destacado */}
        <div className={styles.insight}>
          <p>
            De los <strong>15 € que pagas</strong>, solo <strong>{COSTE_PRODUCCION.toFixed(2).replace('.', ',')} €</strong> cubren todo el proceso productivo
            y el transporte intercontinental. El resto —<strong>{(PRECIO_TOTAL - COSTE_PRODUCCION).toFixed(2).replace('.', ',')} €</strong>— financia el local,
            la publicidad, la logística de devoluciones y el beneficio de la marca.
          </p>
        </div>

        <EducationalSection
          title="La economía detrás de la moda rápida"
          subtitle="Geografía y Economía para Bachillerato"
          defaultOpen={false}
        >
          <h3>¿Por qué la producción textil está tan dispersa?</h3>
          <p>
            La cadena de producción de la ropa es un ejemplo perfecto de <strong>división internacional del trabajo</strong>.
            Cada etapa se localiza donde es más barato realizarla: el algodón donde hay tierra barata y sol,
            el hilado y confección donde hay mano de obra abundante y poco regulada, el tinte donde
            la regulación ambiental es laxa, y la venta donde está el poder adquisitivo.
          </p>

          <h3>El papel de los salarios en la competitividad</h3>
          <p>
            El coste laboral de confeccionar una camiseta es de unos <strong>2 €</strong> en Turquía o Vietnam.
            Si se fabricara en España, ese coste sería 5-8 veces mayor. Por eso, desde los años 80,
            la industria textil europea se deslocalizó masivamente hacia Asia, África del Norte y Europa del Este.
            La apertura comercial de la OMC aceleró este proceso en los años 90.
          </p>

          <h3>Precio de venta vs. coste de producción</h3>
          <p>
            El margen bruto del sector de moda rápida oscila entre el 60% y el 70% del precio de venta.
            Esto no es un dato escandaloso per se —el sector inverete mucho en tiendas, logística y marketing—
            pero sí muestra <strong>quién captura el valor</strong> en la cadena: las marcas (países ricos),
            no los productores (países en desarrollo).
          </p>

          <h3>Impacto ambiental: agua y químicos</h3>
          <p>
            La industria textil es la <strong>segunda industria más contaminante del mundo</strong> después del petróleo.
            El tinte requiere toneladas de agua y productos químicos; los ríos de Bangladesh, China e India
            llevan décadas pagando ese precio. La moda rápida (fast fashion) ha multiplicado el número
            de colecciones anuales de 2 a más de 50, acelerando el ciclo de producción y desecho.
          </p>

          <h3>¿Cambia algo si compras "sostenible"?</h3>
          <p>
            Las certificaciones como <em>GOTS</em> (algodón orgánico) o <em>Fair Trade</em> mejoran
            condiciones en producción, pero suponen una parte pequeña del mercado global.
            El verdadero cambio estructural requiere regulación internacional: salario mínimo global,
            responsabilidad ampliada del productor y trazabilidad obligatoria de la cadena de suministro.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota metodológica:</strong> Los costes son aproximaciones ilustrativas basadas en
            informes de Clean Clothes Campaign, War on Want y Business of Fashion (2022-2024).
            Varían según marca, tipo de prenda, país de fabricación y volumen de producción.
            El objetivo es educativo, no auditorial.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-origen-camiseta')} />
        <ShareCard appName="visualizador-origen-camiseta" />
        <Footer appName="visualizador-origen-camiseta" />
    </div>
  );
}
