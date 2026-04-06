'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorHistoriaDinero.module.css';
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

type Seccion = 'trueque' | 'monedas' | 'digital' | 'futuro';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'trueque', titulo: 'Antes del dinero', icono: '🐚', subtitulo: 'Del trueque a las primeras monedas' },
  { id: 'monedas', titulo: 'Monedas y billetes', icono: '🪙', subtitulo: '3.000 años de dinero físico' },
  { id: 'digital', titulo: 'Dinero invisible', icono: '💳', subtitulo: 'Cuando el dinero dejó de verse' },
  { id: 'futuro', titulo: 'El futuro', icono: '🔮', subtitulo: 'Cripto, CBDC y sociedades sin efectivo' },
];

// ─────────────────────────────────────────────
// Sección 1: Antes del dinero
// ─────────────────────────────────────────────

function SeccionTrueque() {
  const problemasTrueque = [
    { icono: '🐄', problema: 'Doble coincidencia', ejemplo: 'Tienes trigo y quieres pescado. Pero el pescador quiere leña, no trigo. Sin intermediario, no hay trato.' },
    { icono: '🍎', problema: 'Indivisibilidad', ejemplo: '¿Cómo pagas medio pollo con una vaca? No puedes partir la vaca por la mitad (sin perder su valor).' },
    { icono: '⏳', problema: 'Almacenamiento', ejemplo: 'La fruta se pudre, la leche se estropea. No puedes "ahorrar" para el futuro con bienes perecederos.' },
    { icono: '⚖️', problema: 'Valor relativo', ejemplo: '¿Una oveja vale 10 gallinas o 20? Sin unidad de medida, cada intercambio es una negociación interminable.' },
  ];

  const primerasDivisas = [
    { icono: '🐚', nombre: 'Conchas cauríes', epoca: '~1200 a.C.', donde: 'China, India, África', detalle: 'Las conchas cauríes fueron la moneda más longeva de la historia: se usaron durante más de 3.000 años en tres continentes.' },
    { icono: '🧂', nombre: 'Sal', epoca: '~800 a.C.', donde: 'Roma, África', detalle: 'Los soldados romanos recibían parte de su paga en sal — de ahí viene la palabra "salario".' },
    { icono: '🐄', nombre: 'Ganado', epoca: '~9000 a.C.', donde: 'Mesopotamia', detalle: 'La palabra "pecuniario" viene del latín pecunia (ganado). El ganado fue la primera forma de riqueza medible.' },
    { icono: '🫘', nombre: 'Cacao', epoca: '~1000 a.C.', donde: 'Mesoamérica', detalle: 'Los aztecas usaban granos de cacao como moneda. Un conejo costaba unos 10 granos; un esclavo, 100.' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Durante miles de años, los humanos intercambiaban bienes directamente: trigo por pescado, pieles por herramientas. Pero el trueque tenía <strong>problemas graves</strong>.</p>
      </div>

      <h3 className={styles.seccionSubtitulo}>Los 4 problemas del trueque</h3>
      <div className={styles.problemasGrid}>
        {problemasTrueque.map((p, i) => (
          <div key={i} className={styles.problemaCard}>
            <span className={styles.problemaIcono} aria-hidden="true">{p.icono}</span>
            <strong className={styles.problemaNombre}>{p.problema}</strong>
            <p className={styles.problemaEjemplo}>{p.ejemplo}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La solución fue encontrar un <strong>intermediario universal</strong>: algo que todos aceptaran, que fuera divisible, duradero y fácil de transportar. Así nació el concepto de dinero.
        </p>
      </div>

      <h3 className={styles.seccionSubtitulo}>Las primeras &quot;monedas&quot; de la historia</h3>
      <div className={styles.timelineVertical}>
        {primerasDivisas.map((d, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineDot} aria-hidden="true">{d.icono}</div>
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <strong>{d.nombre}</strong>
                <span className={styles.timelineEpoca}>{d.epoca}</span>
              </div>
              <span className={styles.timelineDonde}>{d.donde}</span>
              <p className={styles.timelineDetalle}>{d.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>Todos estos &quot;dineros&quot; funcionaban, pero tenían un problema: su valor dependía de la oferta natural. Si llegaba un cargamento enorme de conchas, la &quot;moneda&quot; perdía valor. Hacía falta algo <strong>más controlable</strong>.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Monedas y billetes
// ─────────────────────────────────────────────

function SeccionMonedas() {
  const [eraActiva, setEraActiva] = useState(0);

  const eras = [
    {
      icono: '🏛️',
      titulo: 'Las primeras monedas',
      epoca: '~600 a.C.',
      lugar: 'Lidia (actual Turquía)',
      descripcion: 'El rey Creso de Lidia acuñó las primeras monedas estandarizadas de electro (aleación de oro y plata). Su valor estaba garantizado por el sello del rey.',
      innovacion: 'Peso y pureza garantizados por una autoridad central — la base de la confianza monetaria.',
      dato: 'Las monedas lidias tenían un león estampado. Creso fue tan rico que la expresión "rico como Creso" sigue viva 2.600 años después.',
    },
    {
      icono: '📜',
      titulo: 'El papel moneda',
      epoca: '~700 d.C.',
      lugar: 'China (dinastía Tang)',
      descripcion: 'Los comerciantes chinos empezaron a depositar sus monedas en tiendas de confianza y recibían un recibo de papel. Esos recibos empezaron a circular como dinero.',
      innovacion: 'Separar el valor físico del soporte. El papel no vale nada — vale la promesa que representa.',
      dato: 'Marco Polo quedó asombrado al ver papel moneda en China en el s. XIII. Europa no lo adoptaría hasta 400 años después.',
    },
    {
      icono: '⚖️',
      titulo: 'El patrón oro',
      epoca: '1821-1971',
      lugar: 'Reino Unido → mundial',
      descripcion: 'Cada billete representaba una cantidad fija de oro guardada en un banco central. Podías ir al banco y cambiar tus billetes por oro real.',
      innovacion: 'Estabilidad total: el dinero tenía un valor objetivo y medible. Los gobiernos no podían "imprimir" sin respaldo.',
      dato: 'El patrón oro colapsó porque los gobiernos necesitaban gastar más de lo que tenían en oro — especialmente durante guerras mundiales.',
    },
    {
      icono: '💵',
      titulo: 'Dinero fíat',
      epoca: '1971 → hoy',
      lugar: 'Global (Nixon, EE.UU.)',
      descripcion: 'Nixon eliminó la convertibilidad del dólar en oro en 1971. Desde entonces, el dinero vale porque el gobierno dice que vale — no porque haya oro detrás.',
      innovacion: 'Flexibilidad total: los bancos centrales pueden ajustar la oferta monetaria según las necesidades económicas.',
      dato: 'El 97% del dinero que existe hoy no es físico: es digital, creado por los bancos a través de préstamos. Solo el 3% son billetes y monedas.',
    },
  ];

  const era = eras[eraActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>De las primeras monedas de oro a los billetes de papel y el fin del patrón oro — <strong>3.000 años de evolución</strong> en 4 momentos clave.</p>
      </div>

      <div className={styles.eraSelector}>
        {eras.map((e, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.eraBtn} ${eraActiva === i ? styles.eraBtnActivo : ''}`}
            onClick={() => setEraActiva(i)}
            aria-pressed={eraActiva === i}
          >
            <span aria-hidden="true">{e.icono}</span>
            <span className={styles.eraBtnTexto}>{e.epoca}</span>
          </button>
        ))}
      </div>

      <div className={styles.eraDetalle}>
        <div className={styles.eraDetalleHeader}>
          <span className={styles.eraDetalleIcono} aria-hidden="true">{era.icono}</span>
          <div>
            <h3 className={styles.eraDetalleTitulo}>{era.titulo}</h3>
            <span className={styles.eraDetalleEpoca}>{era.epoca} — {era.lugar}</span>
          </div>
        </div>
        <p className={styles.eraDetalleTexto}>{era.descripcion}</p>
        <div className={styles.eraInnovacion}>
          <strong>Innovación clave:</strong> {era.innovacion}
        </div>
        <div className={styles.eraDato}>
          <span className={styles.eraDatoIcono} aria-hidden="true">💡</span>
          <p>{era.dato}</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Cada salto fue una revolución en <strong>confianza</strong>: confiar en el sello del rey, confiar en un papel, confiar en que el oro existía, y finalmente confiar en que el gobierno no imprimirá demasiado. El dinero siempre ha sido una historia de fe colectiva.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Dinero invisible
// ─────────────────────────────────────────────

function SeccionDigital() {
  const hitos = [
    { anio: '1950', icono: '💳', titulo: 'Diners Club', descripcion: 'La primera tarjeta de crédito. Frank McNamara olvidó su cartera en un restaurante y pensó: "debería poder pagar sin efectivo". Nació Diners Club con 200 socios.' },
    { anio: '1967', icono: '🏧', titulo: 'Primer cajero automático', descripcion: 'Barclays instala el primer ATM en Londres. Por primera vez, puedes sacar dinero sin hablar con un humano. La idea se le ocurrió a John Shepherd-Barron en la bañera.' },
    { anio: '1973', icono: '🌐', titulo: 'Red SWIFT', descripcion: 'Se crea SWIFT: el sistema que permite a los bancos enviarse dinero entre países. Hoy conecta 11.000 instituciones en 200 países. Sin SWIFT, no hay comercio internacional.' },
    { anio: '1997', icono: '📱', titulo: 'Banca online', descripcion: 'Los bancos empiezan a ofrecer consultas de saldo por internet. En 10 años, la mayoría de transacciones ya no pasarán por una ventanilla.' },
    { anio: '2007', icono: '📲', titulo: 'M-Pesa (Kenya)', descripcion: 'Vodafone lanza M-Pesa en Kenya: pagos por SMS sin necesidad de cuenta bancaria. Revoluciona la inclusión financiera en África — 50 millones de usuarios.' },
    { anio: '2014', icono: '⌚', titulo: 'Apple Pay / contactless', descripcion: 'Pagar acercando el teléfono o el reloj. El efectivo empieza a ser opcional. En España, el pago contactless supera al efectivo en comercios en 2023.' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En solo 70 años, el dinero pasó de ser algo que tocabas con las manos a <strong>números en una pantalla</strong>. Hoy, el 97% del dinero mundial es digital.</p>
      </div>

      <div className={styles.timelineVertical}>
        {hitos.map((h, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineDot} aria-hidden="true">{h.icono}</div>
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <strong>{h.titulo}</strong>
                <span className={styles.timelineEpoca}>{h.anio}</span>
              </div>
              <p className={styles.timelineDetalle}>{h.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoDestacadoNum}>97%</span>
        <p className={styles.datoDestacadoTexto}>del dinero que existe hoy <strong>no es físico</strong>. Son registros digitales en bases de datos de bancos. Solo el 3% son billetes y monedas que puedes tocar.</p>
      </div>

      <div className={styles.insight}>
        <p>
          El dinero invisible es más rápido, más cómodo y más rastreable. Pero también es más vulnerable: un fallo informático, un ciberataque o una decisión política pueden <strong>congelar tus fondos en segundos</strong>. La comodidad tiene un precio.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: El futuro
// ─────────────────────────────────────────────

function SeccionFuturo() {
  const paises = [
    { nombre: 'Suecia', bandera: '🇸🇪', efectivo: 9, color: '#2E86AB' },
    { nombre: 'Noruega', bandera: '🇳🇴', efectivo: 12, color: '#48A9A6' },
    { nombre: 'Reino Unido', bandera: '🇬🇧', efectivo: 15, color: '#7FB3D3' },
    { nombre: 'Francia', bandera: '🇫🇷', efectivo: 28, color: '#27ae60' },
    { nombre: 'EE.UU.', bandera: '🇺🇸', efectivo: 37, color: '#f39c12' },
    { nombre: 'Alemania', bandera: '🇩🇪', efectivo: 58, color: '#e67e22' },
    { nombre: 'España', bandera: '🇪🇸', efectivo: 65, color: '#e74c3c' },
    { nombre: 'Japón', bandera: '🇯🇵', efectivo: 82, color: '#8e44ad' },
  ];

  const tendencias = [
    {
      icono: '₿',
      titulo: 'Criptomonedas',
      estado: 'Activo desde 2009',
      descripcion: 'Bitcoin creó dinero sin bancos ni gobiernos: descentralizado, limitado (solo 21 millones), verificado por matemáticas. Hoy hay más de 10.000 criptomonedas.',
      pros: 'Descentralizado, resistente a censura, oferta limitada',
      contras: 'Volatilidad extrema, consumo energético, uso especulativo',
    },
    {
      icono: '🏛️',
      titulo: 'Euro digital (CBDC)',
      estado: 'En fase de estudio (BCE, 2025)',
      descripcion: 'El BCE prepara el euro digital: una moneda electrónica emitida por el banco central. No es una cripto — es el euro de siempre, pero sin billetes.',
      pros: 'Estabilidad del euro, inclusión financiera, pagos offline',
      contras: 'Privacidad (rastreo total), competencia con bancos comerciales',
    },
    {
      icono: '🚫',
      titulo: 'Sociedades cashless',
      estado: 'Suecia lidera (9% efectivo)',
      descripcion: 'Algunos países se acercan a eliminar el efectivo. Suecia ya tiene comercios que no aceptan billetes. El debate: ¿eficiencia o control?',
      pros: 'Menos economía sumergida, más trazabilidad, menor coste',
      contras: 'Exclusión digital (mayores), vigilancia total, dependencia tecnológica',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El dinero está cambiando otra vez. Criptomonedas, monedas digitales de bancos centrales y sociedades sin efectivo — <strong>el futuro ya está aquí</strong>.</p>
      </div>

      <h3 className={styles.seccionSubtitulo}>% de transacciones en efectivo por país</h3>
      <div className={styles.barrasComparativa}>
        {paises.map((p, i) => (
          <div key={i} className={styles.barraItem}>
            <div className={styles.barraLabel}>
              <span aria-hidden="true">{p.bandera}</span>
              <span>{p.nombre}</span>
            </div>
            <div className={styles.barraTrack}>
              <div
                className={styles.barraFill}
                style={{ width: `${p.efectivo}%`, backgroundColor: p.color }}
                role="meter"
                aria-valuenow={p.efectivo}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.nombre}: ${p.efectivo}% efectivo`}
              />
            </div>
            <span className={styles.barraPct}>{formatNumber(p.efectivo, 0)}%</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          En Suecia, solo el <strong>9% de las transacciones</strong> son en efectivo. En Japón, el 82%. La cultura, la confianza en las instituciones y la infraestructura tecnológica determinan la velocidad de la transición.
        </p>
      </div>

      <h3 className={styles.seccionSubtitulo}>Las 3 grandes tendencias</h3>
      <div className={styles.tendenciasGrid}>
        {tendencias.map((t, i) => (
          <div key={i} className={styles.tendenciaCard}>
            <div className={styles.tendenciaHeader}>
              <span className={styles.tendenciaIcono} aria-hidden="true">{t.icono}</span>
              <div>
                <strong className={styles.tendenciaTitulo}>{t.titulo}</strong>
                <span className={styles.tendenciaEstado}>{t.estado}</span>
              </div>
            </div>
            <p className={styles.tendenciaDesc}>{t.descripcion}</p>
            <div className={styles.tendenciaProsCons}>
              <div className={styles.tendenciaPros}>
                <span className={styles.tendenciaTag} aria-hidden="true">+</span> {t.pros}
              </div>
              <div className={styles.tendenciaContras}>
                <span className={styles.tendenciaTag} aria-hidden="true">-</span> {t.contras}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>La gran pregunta no es técnica, sino política: <strong>¿quién debe controlar el dinero?</strong> Los gobiernos (CBDC), los algoritmos (cripto), o los ciudadanos (efectivo). La respuesta definirá las próximas décadas.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaDineroPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('trueque');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'trueque': return <SeccionTrueque />;
      case 'monedas': return <SeccionMonedas />;
      case 'digital': return <SeccionDigital />;
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
          <h1 className={styles.title}>La Evolución del Dinero</h1>
          <p className={styles.subtitle}>Del trueque al bitcoin — 10.000 años en 4 capítulos</p>
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
          title="Lo que no te cuentan sobre el dinero"
          subtitle="Conceptos clave para entender la economía moderna"
          defaultOpen={false}
        >
          <h3>¿El dinero tiene valor real?</h3>
          <p>
            Desde 1971, ninguna moneda del mundo está respaldada por oro u otro bien físico.
            El euro, el dólar y el yen valen porque los gobiernos declaran su validez legal
            (<em>fíat</em> = &quot;hágase&quot; en latín) y porque millones de personas los aceptan
            en intercambios. Es un acuerdo colectivo, no un hecho físico.
          </p>

          <h3>¿Por qué Japón sigue usando tanto efectivo?</h3>
          <p>
            La cultura japonesa valora la privacidad, la cortesía del intercambio físico y
            la fiabilidad del papel en caso de desastres naturales (terremotos, tifones).
            Además, Japón tiene una tasa de criminalidad extremadamente baja, lo que elimina
            el riesgo de robo como argumento contra el efectivo.
          </p>

          <h3>¿El euro digital reemplazará al efectivo?</h3>
          <p>
            No. El BCE ha declarado explícitamente que el euro digital sería un <strong>complemento</strong>,
            no un sustituto del efectivo. El Parlamento Europeo ha aprobado que los comercios
            deben seguir aceptando billetes y monedas. Pero la tendencia es clara: cada vez
            menos transacciones son en metálico.
          </p>

          <h3>Bitcoin: ¿dinero o especulación?</h3>
          <p>
            Bitcoin cumple algunas funciones del dinero (reserva de valor, transferencia) pero
            falla en otras (volatilidad como unidad de cuenta, velocidad como medio de pago).
            La mayoría de economistas lo consideran un <strong>activo especulativo</strong>
            más que una moneda funcional. Solo El Salvador y la República Centroafricana lo
            han declarado moneda de curso legal.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador resume 10.000 años de historia monetaria con fines
            educativos. La realidad incluye sistemas monetarios regionales, períodos de bimetalismo,
            hiperinflaciones, guerras de divisas y regulación financiera compleja que escapan a este resumen.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-historia-dinero')} />
        <ShareCard appName="visualizador-historia-dinero" />
        <Footer appName="visualizador-historia-dinero" />
      </div>
    </>
  );
}
