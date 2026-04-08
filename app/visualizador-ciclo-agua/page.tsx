'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CicloAgua.module.css';
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
// Tipos y datos
// ─────────────────────────────────────────────

type Seccion = 'ciclo' | 'distribucion' | 'residencia' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'ciclo', titulo: 'El Ciclo Completo', icono: '\uD83D\uDD04', subtitulo: 'Evaporacion, condensacion, precipitacion, escorrentia e infiltracion' },
  { id: 'distribucion', titulo: 'Donde Esta el Agua', icono: '\uD83C\uDF0D', subtitulo: 'El 97,5% esta en los oceanos — solo el 0,03% es accesible' },
  { id: 'residencia', titulo: 'Tiempos de Residencia', icono: '\u23F3', subtitulo: 'Cuanto tarda una molecula de agua en cada reservorio' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '\uD83D\uDCA1', subtitulo: 'Cifras que cambian tu perspectiva sobre el agua' },
];

interface EtapaCiclo {
  nombre: string;
  icono: string;
  descripcion: string;
  dato: string;
  ejemplo: string;
}

const ETAPAS: EtapaCiclo[] = [
  { nombre: 'Evaporacion', icono: '\u2600\uFE0F', descripcion: 'El calor solar transforma agua liquida de oceanos, lagos y rios en vapor de agua que asciende a la atmosfera.', dato: 'Los oceanos aportan el 86% del vapor que alimenta el ciclo.', ejemplo: 'Un dia soleado de verano puede evaporar 5 mm de agua de un lago — equivale a 5 litros por metro cuadrado.' },
  { nombre: 'Transpiracion', icono: '\uD83C\uDF3F', descripcion: 'Las plantas absorben agua por las raices y la liberan como vapor por las hojas (estomas). Junto con la evaporacion, forma la evapotranspiracion.', dato: 'La selva amazonica libera 20.000 millones de toneladas de vapor al dia.', ejemplo: 'Un roble adulto transpira unos 400 litros de agua al dia, actuando como una bomba natural.' },
  { nombre: 'Condensacion', icono: '\u2601\uFE0F', descripcion: 'El vapor de agua se enfria al ascender y se condensa en diminutas gotas alrededor de particulas de polvo, formando nubes.', dato: 'Una nube tipica pesa unas 500.000 toneladas de agua.', ejemplo: 'Las nubes flotan porque sus gotas son tan pequenas (0,01 mm) que la resistencia del aire las mantiene suspendidas.' },
  { nombre: 'Precipitacion', icono: '\uD83C\uDF27\uFE0F', descripcion: 'Cuando las gotas de las nubes crecen lo suficiente, caen por gravedad en forma de lluvia, nieve, granizo o llovizna.', dato: 'Caen unos 505.000 km3 de precipitacion al ano en todo el planeta.', ejemplo: 'Una gota de lluvia tipica mide 1-2 mm y cae a unos 20 km/h. Tarda unos 2 minutos en llegar al suelo desde 500 m.' },
  { nombre: 'Escorrentia', icono: '\uD83C\uDF0A', descripcion: 'El agua que cae sobre la superficie fluye ladera abajo, formando arroyos y rios que desembocan en lagos y oceanos.', dato: 'El rio Amazonas descarga 209.000 m3 por segundo — el 20% del agua dulce que llega a los oceanos.', ejemplo: 'Tras una tormenta fuerte, la escorrentia puede arrastrar tierra y nutrientes, cambiando el paisaje.' },
  { nombre: 'Infiltracion', icono: '\uD83D\uDCA7', descripcion: 'Parte del agua penetra en el suelo a traves de grietas y poros, recargando acuiferos subterraneos que almacenan agua durante miles de anos.', dato: 'Los acuiferos contienen 100 veces mas agua dulce que todos los rios y lagos juntos.', ejemplo: 'El acuifero Guarani (Sudamerica) almacena 37.000 km3 de agua — suficiente para abastecer al mundo 250 dias.' },
];

interface DistribucionAgua {
  nombre: string;
  icono: string;
  porcentaje: number;
  color: string;
  sub?: { nombre: string; porcentaje: number; color: string }[];
}

const DISTRIBUCION: DistribucionAgua[] = [
  { nombre: 'Oceanos (agua salada)', icono: '\uD83C\uDF0A', porcentaje: 97.5, color: '#1a5276' },
  {
    nombre: 'Agua dulce', icono: '\uD83D\uDCA7', porcentaje: 2.5, color: '#2980b9',
    sub: [
      { nombre: 'Glaciares y casquetes polares', porcentaje: 68.7, color: '#85c1e9' },
      { nombre: 'Aguas subterraneas', porcentaje: 30.1, color: '#3498db' },
      { nombre: 'Agua superficial accesible (rios, lagos, humedad)', porcentaje: 1.2, color: '#2ecc71' },
    ],
  },
];

interface Reservorio {
  nombre: string;
  icono: string;
  tiempoDias: number;
  etiqueta: string;
}

const RESERVORIOS: Reservorio[] = [
  { nombre: 'Atmosfera', icono: '\u2601\uFE0F', tiempoDias: 9, etiqueta: '~9 dias' },
  { nombre: 'Rios', icono: '\uD83C\uDF0A', tiempoDias: 14, etiqueta: '~2 semanas' },
  { nombre: 'Lagos', icono: '\uD83D\uDEF6', tiempoDias: 3650, etiqueta: '~10 anos' },
  { nombre: 'Oceanos', icono: '\uD83C\uDF0D', tiempoDias: 1095000, etiqueta: '~3.000 anos' },
  { nombre: 'Aguas subterraneas profundas', icono: '\uD83D\uDCA7', tiempoDias: 3650000, etiqueta: '~10.000 anos' },
  { nombre: 'Glaciares', icono: '\uD83C\uDFD4\uFE0F', tiempoDias: 36500000, etiqueta: '10.000 - 100.000 anos' },
  { nombre: 'Antartida', icono: '\u2744\uFE0F', tiempoDias: 328500000, etiqueta: '~900.000 anos' },
];

interface DatoFascinante {
  icono: string;
  texto: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '\uD83D\uDCA7', texto: 'La Tierra tiene la misma cantidad de agua desde hace 4.000 millones de anos. Ni una gota mas, ni una gota menos.' },
  { icono: '\uD83C\uDF27\uFE0F', texto: 'Caen unos 505.000 km\u00B3 de lluvia al ano — llenarias el lago Baikal (el mas profundo del mundo) 20 veces.' },
  { icono: '\uD83C\uDF0A', texto: 'Los oceanos cubren el 71% de la superficie terrestre y contienen el 97,5% de toda el agua.' },
  { icono: '\uD83C\uDFD4\uFE0F', texto: 'Si se derritiera todo el hielo del planeta, el nivel del mar subiria unos 65 metros.' },
  { icono: '\uD83D\uDEB0', texto: 'Un ser humano necesita entre 2 y 3 litros de agua al dia para sobrevivir.' },
  { icono: '\uD83C\uDF3F', texto: 'Un roble adulto transpira unos 400 litros de agua al dia a traves de sus hojas.' },
  { icono: '\u26A1', texto: 'Una nube de tormenta (cumulonimbo) contiene unas 500.000 toneladas de agua en suspension.' },
];

// ─────────────────────────────────────────────
// Seccion 1: El Ciclo Completo
// ─────────────────────────────────────────────

function SeccionCiclo() {
  const [etapaIdx, setEtapaIdx] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El ciclo del agua es un viaje sin fin. La misma molecula de agua que cae hoy como lluvia puede haber estado en un glaciar hace miles de anos o en el estomago de un dinosaurio hace millones.</p>
      </div>

      {/* Diagrama SVG animado */}
      <div className={styles.diagramaContainer}>
        <svg className={styles.diagramaSvg} viewBox="0 0 800 500" aria-label="Diagrama del ciclo del agua con fases animadas">
          {/* Cielo */}
          <rect x="0" y="0" width="800" height="200" fill="#87CEEB" opacity="0.3" />

          {/* Mar */}
          <ellipse cx="650" cy="380" rx="180" ry="60" fill="#1a5276" opacity="0.7" />
          <ellipse cx="650" cy="370" rx="170" ry="50" fill="#2980b9" opacity="0.6" />

          {/* Montana */}
          <polygon points="100,380 200,200 300,380" fill="#6b7b3a" />
          <polygon points="170,280 200,200 230,280" fill="white" opacity="0.8" />

          {/* Vegetacion */}
          <circle cx="350" cy="360" r="30" fill="#27ae60" opacity="0.8" />
          <circle cx="380" cy="350" r="25" fill="#2ecc71" opacity="0.8" />
          <circle cx="320" cy="355" r="20" fill="#1abc9c" opacity="0.7" />
          <rect x="345" y="370" width="10" height="20" fill="#795548" />

          {/* Subsuelo */}
          <rect x="0" y="400" width="800" height="100" fill="#8B7355" opacity="0.4" />
          <text x="200" y="450" fontSize="11" fill="white" fontWeight="600" opacity="0.6" textAnchor="middle">Acuifero subterraneo</text>
          <ellipse cx="200" cy="460" rx="100" ry="20" fill="#3498db" opacity="0.3" />

          {/* Nubes */}
          <g>
            <ellipse cx="300" cy="80" rx="70" ry="30" fill="white" opacity="0.9" />
            <ellipse cx="340" cy="75" rx="50" ry="25" fill="white" opacity="0.9" />
            <ellipse cx="270" cy="85" rx="40" ry="20" fill="white" opacity="0.8" />
          </g>
          <g>
            <ellipse cx="550" cy="100" rx="60" ry="25" fill="#bdc3c7" opacity="0.85" />
            <ellipse cx="580" cy="95" rx="45" ry="22" fill="#bdc3c7" opacity="0.85" />
          </g>

          {/* Rio */}
          <path d="M230,350 Q350,370 450,360 Q550,350 630,370" fill="none" stroke="#3498db" strokeWidth="6" opacity="0.7" />

          {/* Flechas animadas — Evaporacion */}
          <circle className={styles.flechaArriba} cx="620" cy="320" r="4" style={{ animationDelay: '0s' }} />
          <circle className={styles.flechaArriba} cx="650" cy="310" r="4" style={{ animationDelay: '0.5s' }} />
          <circle className={styles.flechaArriba} cx="680" cy="325" r="4" style={{ animationDelay: '1s' }} />
          <circle className={styles.flechaArriba} cx="700" cy="315" r="3" style={{ animationDelay: '1.5s' }} />

          {/* Flechas — Transpiracion */}
          <circle className={styles.flechaArriba} cx="350" cy="330" r="3" style={{ animationDelay: '0.3s' }} />
          <circle className={styles.flechaArriba} cx="370" cy="325" r="3" style={{ animationDelay: '0.8s' }} />

          {/* Flechas — Precipitacion */}
          <circle className={styles.flechaAbajo} cx="290" cy="110" r="3" style={{ animationDelay: '0.2s' }} />
          <circle className={styles.flechaAbajo} cx="310" cy="115" r="3" style={{ animationDelay: '0.7s' }} />
          <circle className={styles.flechaAbajo} cx="330" cy="108" r="3" style={{ animationDelay: '1.2s' }} />
          <circle className={styles.flechaAbajo} cx="550" cy="125" r="3" style={{ animationDelay: '0.4s' }} />
          <circle className={styles.flechaAbajo} cx="570" cy="120" r="3" style={{ animationDelay: '0.9s' }} />

          {/* Flechas — Escorrentia */}
          <circle className={styles.flechaEscorrentia} cx="260" cy="360" r="3" style={{ animationDelay: '0.1s' }} />
          <circle className={styles.flechaEscorrentia} cx="400" cy="365" r="3" style={{ animationDelay: '0.6s' }} />
          <circle className={styles.flechaEscorrentia} cx="500" cy="358" r="3" style={{ animationDelay: '1.1s' }} />

          {/* Flechas — Infiltracion (hacia abajo en tierra) */}
          <circle className={styles.flechaAbajo} cx="180" cy="385" r="3" style={{ animationDelay: '0.5s' }} opacity="0.7" />
          <circle className={styles.flechaAbajo} cx="220" cy="390" r="3" style={{ animationDelay: '1.0s' }} opacity="0.7" />

          {/* Etiquetas */}
          <text x="690" y="280" className={styles.etapaLabelText}>Evaporacion</text>
          <text x="360" y="305" className={styles.etapaLabelText}>Transpiracion</text>
          <text x="440" y="60" className={styles.etapaLabelText}>Condensacion</text>
          <text x="310" y="155" className={styles.etapaLabelText}>Precipitacion</text>
          <text x="450" y="395" className={styles.etapaLabelText}>Escorrentia</text>
          <text x="120" y="430" className={styles.etapaLabelText}>Infiltracion</text>

          {/* Sol */}
          <circle cx="740" cy="50" r="35" fill="#f1c40f" opacity="0.9" />
          <circle cx="740" cy="50" r="30" fill="#f39c12" />
        </svg>
      </div>

      {/* Etapas clickables */}
      <div className={styles.etapasGrid}>
        {ETAPAS.map((e, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.etapaCard} ${etapaIdx === i ? styles.etapaActiva : ''}`}
            onClick={() => setEtapaIdx(etapaIdx === i ? null : i)}
            aria-pressed={etapaIdx === i}
          >
            <span className={styles.etapaCardIcono} aria-hidden="true">{e.icono}</span>
            <span className={styles.etapaCardNombre}>{e.nombre}</span>
          </button>
        ))}
      </div>

      {etapaIdx !== null && (
        <div className={styles.etapaDetalle} role="alert" aria-live="polite">
          <span className={styles.etapaDetalleIcono} aria-hidden="true">{ETAPAS[etapaIdx].icono}</span>
          <div>
            <strong>{ETAPAS[etapaIdx].nombre}</strong>
            <p>{ETAPAS[etapaIdx].descripcion}</p>
            <p><strong>Dato:</strong> {ETAPAS[etapaIdx].dato}</p>
            <p><strong>Ejemplo:</strong> {ETAPAS[etapaIdx].ejemplo}</p>
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          El agua que bebes hoy puede haber sido bebida por un dinosaurio hace 65 millones de anos. El ciclo del agua no tiene principio ni fin — es un <strong>viaje infinito</strong> que recicla la misma agua una y otra vez.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 2: Donde Esta el Agua
// ─────────────────────────────────────────────

function SeccionDistribucion() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La Tierra tiene <strong>1.386 millones de km&#xB3;</strong> de agua. Pero la inmensa mayoria es salada o esta atrapada en hielo. El agua que podemos beber es una fraccion minuscula.</p>
      </div>

      <div className={styles.distribucionVisual}>
        {DISTRIBUCION.map((d, i) => (
          <div key={i}>
            <div className={styles.distribucionFila}>
              <span className={styles.distribucionIcono} aria-hidden="true">{d.icono}</span>
              <div className={styles.distribucionInfo}>
                <span className={styles.distribucionNombre}>{d.nombre}</span>
                <span className={styles.distribucionPorcentaje}>{formatNumber(d.porcentaje, 1)}%</span>
                <div className={styles.barraContainer}>
                  <div className={styles.barraAgua} style={{ width: `${d.porcentaje}%` }} />
                </div>
              </div>
            </div>
            {d.sub && (
              <div className={styles.subDistribucion}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                  Del 2,5% de agua dulce:
                </p>
                {d.sub.map((s, j) => (
                  <div key={j} className={styles.distribucionFila}>
                    <div className={styles.distribucionInfo}>
                      <span className={styles.distribucionNombre}>{s.nombre}</span>
                      <span className={styles.distribucionPorcentaje}>{formatNumber(s.porcentaje, 1)}%</span>
                      <div className={styles.barraContainer}>
                        <div className={styles.barraAgua} style={{ width: `${s.porcentaje}%`, background: s.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.analogiaCard}>
        <span className={styles.analogiaIcono} aria-hidden="true">{'\uD83E\uDD44'}</span>
        <p className={styles.analogiaTexto}>
          Si toda el agua de la Tierra fueran <strong>100 litros</strong> en un cubo...
        </p>
        <span className={styles.analogiaDestacado}>
          Solo 1 cucharadita seria agua accesible para beber
        </span>
        <p className={styles.analogiaTexto} style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          97,5 litros serian agua salada. De los 2,5 litros de agua dulce, 1,7 estarian congelados en glaciares, 0,75 serian aguas subterraneas y solo 0,03 litros (una cucharadita) estarian en rios, lagos y atmosfera.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          Solo el <strong>0,03% del agua del planeta</strong> es accesible para beber. El resto esta en oceanos (salada), glaciares (congelada) o en acuiferos profundos (inaccesible a corto plazo). Cada gota de agua dulce accesible es un recurso extraordinariamente valioso.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 3: Tiempos de Residencia
// ─────────────────────────────────────────────

function SeccionResidencia() {
  // Escala logaritmica para las barras
  const maxLog = Math.log10(RESERVORIOS[RESERVORIOS.length - 1].tiempoDias);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Una molecula de agua no pasa el mismo tiempo en cada lugar. En la atmosfera dura <strong>9 dias</strong>. En un glaciar puede quedarse <strong>100.000 anos</strong>. Las barras usan escala logaritmica para mostrar estas diferencias enormes.</p>
      </div>

      <div className={styles.residenciaLista}>
        {RESERVORIOS.map((r, i) => {
          const logWidth = (Math.log10(r.tiempoDias) / maxLog) * 100;
          return (
            <div key={i} className={styles.residenciaItem}>
              <div className={styles.residenciaInfo}>
                <span className={styles.residenciaIcono} aria-hidden="true">{r.icono}</span>
                <span className={styles.residenciaNombre}>{r.nombre}</span>
                <span className={styles.residenciaTiempo}>{r.etiqueta}</span>
              </div>
              <div className={styles.barraContainer}>
                <div
                  className={styles.barraResidencia}
                  style={{ width: `${logWidth}%` }}
                  title={`${formatNumber(r.tiempoDias, 0)} dias`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.residenciaEscala}>
        <span>Dias</span>
        <span>Semanas</span>
        <span>Anos</span>
        <span>Milenios</span>
        <span>Eras geologicas</span>
      </div>

      <div className={styles.insight}>
        <p>
          Una gota en un glaciar puede estar atrapada <strong>100.000 anos</strong> antes de volver al ciclo. Mientras tanto, el agua de la atmosfera se recicla cada 9 dias. El ciclo del agua opera en escalas de tiempo radicalmente diferentes segun donde este la molecula.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El agua es la sustancia mas extraordinaria del planeta. Aqui tienes datos que cambian tu perspectiva sobre algo que damos por sentado.</p>
      </div>

      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoTexto}>{d.texto}</span>
          </div>
        ))}
      </div>

      <div className={styles.climaCard}>
        <div className={styles.climaTitulo}>
          <span aria-hidden="true">{'\uD83C\uDF21\uFE0F'}</span> Impacto del cambio climatico en el ciclo del agua
        </div>
        <p className={styles.climaTexto}>
          El calentamiento global acelera el ciclo hidrologico: <strong>mas evaporacion</strong> genera mas vapor en la atmosfera, lo que produce <strong>lluvias mas intensas</strong> pero tambien <strong>sequias mas prolongadas</strong>. Las regiones secas se vuelven mas secas y las humedas mas humedas. Los glaciares retroceden, liberando agua almacenada durante milenios y reduciendo las reservas futuras. Para 2050, se estima que <strong>5.000 millones de personas</strong> viviran en zonas con estres hidrico al menos un mes al ano.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          El agua no se crea ni se destruye — solo se transforma y se mueve. Cada vez que bebes un vaso de agua, participas en un ciclo que lleva funcionando <strong>4.000 millones de anos</strong>. Proteger el agua es proteger el motor mas antiguo del planeta.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCicloAguaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('ciclo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'ciclo': return <SeccionCiclo />;
      case 'distribucion': return <SeccionDistribucion />;
      case 'residencia': return <SeccionResidencia />;
      case 'datos': return <SeccionDatos />;
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
          <h1 className={styles.title}>El Ciclo del Agua</h1>
          <p className={styles.subtitle}>El viaje infinito de cada gota</p>
        </header>

        <LegalNotice />

        {/* Navegacion */}
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

        {/* Cabecera seccion */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">{'\uD83D\uDD17'}</span> Mas explicadores → <a href="/visualizador-agua-virtual/">Agua Virtual</a> · <a href="/visualizador-co2-diario/">Tu CO2 Diario</a> · <a href="/visualizador-clima-extremo/">Clima Extremo</a>
        </div>

        <EducationalSection
          title="El agua en la Tierra"
          subtitle="Conceptos clave sobre el ciclo hidrologico y los recursos hidricos"
          defaultOpen={false}
        >
          <h3>Un ciclo sin principio ni fin</h3>
          <p>
            El ciclo hidrologico es el proceso continuo por el cual el agua se mueve entre la atmosfera,
            la superficie terrestre y el subsuelo. No tiene inicio ni final — es un sistema cerrado que
            recicla la misma agua desde hace 4.000 millones de anos. La energia que lo impulsa proviene
            principalmente del Sol, que calienta la superficie y provoca la evaporacion.
          </p>

          <h3>Los numeros del ciclo</h3>
          <p>
            Cada ano se evaporan unos 502.800 km&#xB3; de agua de los oceanos y unos 72.000 km&#xB3; de los
            continentes. La precipitacion total es de unos 505.000 km&#xB3; anuales. La diferencia se
            equilibra mediante la escorrentia de los rios hacia el mar, cerrando el ciclo.
          </p>

          <h3>Agua dulce: un recurso escaso</h3>
          <p>
            Aunque el 71% de la superficie terrestre esta cubierta de agua, solo el 2,5% es agua dulce.
            Y de esa fraccion, la mayor parte esta atrapada en glaciares (68,7%) o en acuiferos
            profundos (30,1%). El agua superficial accesible — rios, lagos y humedad — representa
            apenas el 0,03% del total. Es este recurso minusculo el que sostiene toda la vida terrestre.
          </p>

          <h3>Fuentes y metodologia</h3>
          <p>
            Los datos de este explicador provienen del Servicio Geologico de los Estados Unidos (USGS),
            la UNESCO y el Panel Intergubernamental sobre Cambio Climatico (IPCC). Los tiempos de
            residencia son estimaciones medias que varian segun la region y las condiciones climaticas.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador utiliza datos promedio globales con fines educativos.
            Los valores reales varian segun la region, el clima y las condiciones locales.
            Fuentes: USGS Water Science School, UNESCO World Water Assessment Programme, IPCC AR6.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ciclo-agua')} />
        <ShareCard appName="visualizador-ciclo-agua" />
        <Footer appName="visualizador-ciclo-agua" />
      </div>
    </>
  );
}
