'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorInternet60Segundos.module.css';
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

// ─────────────────────────────────────────────
// Los pasos del viaje de una petición web
// ─────────────────────────────────────────────

interface PasoInternet {
  id: string;
  numero: number;
  titulo: string;
  icono: string;
  tiempoMs: string;
  color: string;
  queOcurre: string;
  detalleTecnico: string;
  datoSorprendente: string;
}

const PASOS: PasoInternet[] = [
  {
    id: 'tecleo',
    numero: 1,
    titulo: 'Escribes la URL y pulsas Enter',
    icono: '⌨️',
    tiempoMs: '0 ms',
    color: '#2E86AB',
    queOcurre: 'Tu navegador (Chrome, Firefox, Safari) recibe la URL que has escrito. Antes de hacer nada en internet, comprueba si ya tiene la página guardada en su caché local.',
    detalleTecnico: 'El navegador parsea la URL separando protocolo (https://), dominio (meskeia.com) y ruta (/calculadora-irpf/). Si la página está en caché y no ha expirado, la muestra directamente sin contactar ningún servidor.',
    datoSorprendente: 'Chrome almacena hasta 80 MB de caché por sitio. Si ya visitaste la página recientemente, puede cargar en 0 ms — sin tocar internet.',
  },
  {
    id: 'dns',
    numero: 2,
    titulo: 'Tu ordenador busca la dirección IP (DNS)',
    icono: '📖',
    tiempoMs: '1-50 ms',
    color: '#48A9A6',
    queOcurre: 'Internet no entiende "meskeia.com" — necesita una dirección numérica (IP). Tu ordenador pregunta al servidor DNS: "¿cuál es la IP de meskeia.com?" Es como buscar un número de teléfono en una agenda.',
    detalleTecnico: 'La consulta DNS pasa por varias capas: caché del navegador → caché del sistema operativo → router → servidor DNS del proveedor (Movistar, Vodafone) → servidores raíz DNS si nadie tiene la respuesta.',
    datoSorprendente: 'Hay solo 13 grupos de servidores DNS raíz en todo el mundo (nombrados de A a M). Si cayeran todos, internet dejaría de funcionar en horas.',
  },
  {
    id: 'tcp',
    numero: 3,
    titulo: 'Se establece la conexión (TCP handshake)',
    icono: '🤝',
    tiempoMs: '10-100 ms',
    color: '#27ae60',
    queOcurre: 'Tu ordenador y el servidor se "saludan" con un apretón de manos de tres pasos: "¿Puedo conectar?" → "Sí, adelante" → "Perfecto, empezamos". Este ritual garantiza que ambos están listos.',
    detalleTecnico: 'El TCP three-way handshake (SYN → SYN-ACK → ACK) establece una conexión fiable. Cada paquete tiene números de secuencia para detectar pérdidas y reordenar datos. Si un paquete se pierde, se retransmite.',
    datoSorprendente: 'Este "apretón de manos" se inventó en 1974 (Vint Cerf y Bob Kahn) y sigue siendo la base de internet 50 años después. Cada vez que abres una web, ocurre este ritual.',
  },
  {
    id: 'tls',
    numero: 4,
    titulo: 'Se cifra la conexión (HTTPS/TLS)',
    icono: '🔒',
    tiempoMs: '20-100 ms',
    color: '#9b59b6',
    queOcurre: 'Si la URL empieza por "https" (la mayoría hoy), tu navegador y el servidor negocian un cifrado. Es como acordar un idioma secreto que solo vosotros dos entendéis, para que nadie pueda espiar la conversación.',
    detalleTecnico: 'El TLS handshake intercambia certificados digitales, verifica la identidad del servidor, y acuerda claves de cifrado simétricas. Usa matemáticas de curvas elípticas o RSA para generar claves compartidas sin transmitirlas.',
    datoSorprendente: 'El candado 🔒 de tu navegador significa que toda la comunicación está cifrada con matemáticas que tardarían miles de millones de años en romper con los ordenadores actuales.',
  },
  {
    id: 'peticion',
    numero: 5,
    titulo: 'Tu navegador envía la petición HTTP',
    icono: '📤',
    tiempoMs: '< 1 ms',
    color: '#e67e22',
    queOcurre: 'Tu navegador envía un mensaje al servidor: "Quiero la página /calculadora-irpf/, soy Chrome en Windows, acepto HTML y español". Es como pedir un plato en un restaurante.',
    detalleTecnico: 'La petición HTTP incluye: método (GET), ruta, cabeceras (User-Agent, Accept-Language, cookies, tokens de autenticación). Todo esto viaja cifrado dentro del túnel TLS.',
    datoSorprendente: 'Una petición HTTP típica ocupa menos de 1 KB — menos que este párrafo. Pero la respuesta puede ser de 1-5 MB (HTML + CSS + JavaScript + imágenes).',
  },
  {
    id: 'cables',
    numero: 6,
    titulo: 'Los datos viajan por cables (y cables submarinos)',
    icono: '🌊',
    tiempoMs: '10-200 ms',
    color: '#2E86AB',
    queOcurre: 'Tu petición viaja como pulsos de luz por fibra óptica: de tu casa al router del barrio, de ahí al proveedor, y de ahí a través de cables que cruzan océanos hasta el data center del servidor.',
    detalleTecnico: 'Los datos viajan a ~2/3 de la velocidad de la luz en fibra óptica. Un paquete transatlántico (~6.000 km de cable) tarda unos 30 ms en llegar. Pasa por 10-15 routers intermedios que lo redirigen.',
    datoSorprendente: 'Hay más de 550 cables submarinos activos que cruzan los océanos. Si se cortaran todos, los continentes quedarían incomunicados. Los tiburones a veces los muerden (Google tuvo que blindar los suyos).',
  },
  {
    id: 'servidor',
    numero: 7,
    titulo: 'El servidor procesa tu petición',
    icono: '🖥️',
    tiempoMs: '5-500 ms',
    color: '#e74c3c',
    queOcurre: 'Tu petición llega a un data center — un edificio lleno de miles de ordenadores. Uno de ellos recibe tu petición, ejecuta el código de la web, consulta bases de datos si hace falta, y prepara la respuesta.',
    detalleTecnico: 'El servidor web (Nginx, Apache, Next.js) recibe la petición, la enruta al código correspondiente, ejecuta la lógica (renderizar HTML, consultar DB), y genera la respuesta. En webs estáticas, solo sirve archivos. En dinámicas, ejecuta código.',
    datoSorprendente: 'Un solo data center de Google consume tanta electricidad como una ciudad de 100.000 habitantes. El de Facebook en Suecia usa el frío ártico para refrigerarse gratis.',
  },
  {
    id: 'cdn',
    numero: 8,
    titulo: 'La CDN acerca los datos (si existe)',
    icono: '🌐',
    tiempoMs: '1-20 ms',
    color: '#f39c12',
    queOcurre: 'Muchas webs usan CDNs (Content Delivery Networks): copias de la web distribuidas por todo el mundo. En lugar de ir al servidor original en EE.UU., tu petición puede ser servida desde un servidor mucho más cercano.',
    detalleTecnico: 'Las CDNs (Cloudflare, Vercel Edge, AWS CloudFront) cachean contenido estático en "nodos edge" distribuidos globalmente. Cuando pides una página, la CDN más cercana la sirve si la tiene en caché.',
    datoSorprendente: 'Cloudflare tiene servidores en más de 300 ciudades del mundo. Cuando visitas una web con Cloudflare, probablemente el servidor que te responde está a menos de 50 km de ti.',
  },
  {
    id: 'respuesta',
    numero: 9,
    titulo: 'La respuesta viaja de vuelta',
    icono: '📥',
    tiempoMs: '10-200 ms',
    color: '#48A9A6',
    queOcurre: 'El servidor (o la CDN) envía la respuesta: HTML, CSS, JavaScript, imágenes, fuentes. Todo viaja por el mismo camino de vuelta — cables, routers, fibra óptica — hasta llegar a tu navegador.',
    detalleTecnico: 'La respuesta se fragmenta en paquetes TCP (max ~1.500 bytes cada uno). Una página de 2 MB se divide en ~1.400 paquetes que pueden llegar por diferentes rutas y reensamblarse en tu navegador.',
    datoSorprendente: 'Los 1.400 paquetes de una página web pueden viajar por rutas diferentes: unos por un cable submarino, otros por otro. Tu navegador los reordena sin que tú notes nada.',
  },
  {
    id: 'renderizado',
    numero: 10,
    titulo: 'Tu navegador renderiza la página',
    icono: '🎨',
    tiempoMs: '50-500 ms',
    color: '#34495e',
    queOcurre: 'Tu navegador recibe el HTML y empieza a construir la página: lee el código, aplica los estilos CSS, ejecuta el JavaScript, descarga imágenes y fuentes, y finalmente pinta los píxeles en tu pantalla.',
    detalleTecnico: 'El proceso: parsear HTML → construir DOM → parsear CSS → construir CSSOM → combinar en Render Tree → calcular layout → pintar píxeles. El JavaScript puede modificar todo esto dinámicamente.',
    datoSorprendente: 'Tu navegador es uno de los programas más complejos jamás creados. Chrome tiene más de 35 millones de líneas de código — más que el software del transbordador espacial, Windows XP y el Gran Colisionador de Hadrones juntos.',
  },
];

// Tiempo total estimado
const TIEMPO_TOTAL_RAPIDO = '100-300 ms';
const TIEMPO_TOTAL_LENTO = '1-3 segundos';

// ─────────────────────────────────────────────
// Estadísticas globales de Internet
// ─────────────────────────────────────────────

interface DatoGlobal {
  icono: string;
  cifra: string;
  descripcion: string;
}

const DATOS_GLOBALES: DatoGlobal[] = [
  { icono: '🌊', cifra: '550+', descripcion: 'cables submarinos activos' },
  { icono: '🖥️', cifra: '~10.000', descripcion: 'data centers en el mundo' },
  { icono: '📡', cifra: '5.500 millones', descripcion: 'personas conectadas a internet' },
  { icono: '📊', cifra: '400+ TB/s', descripcion: 'tráfico global por segundo' },
  { icono: '🔍', cifra: '99.000', descripcion: 'búsquedas en Google por segundo' },
  { icono: '📧', cifra: '350.000 M', descripcion: 'emails enviados cada día' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorInternet60SegundosPage() {
  const [pasoActivo, setPasoActivo] = useState<string>(PASOS[0].id);
  const [vistaDetalle, setVistaDetalle] = useState<'simple' | 'tecnico'>('simple');

  const paso = PASOS.find(p => p.id === pasoActivo)!;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona Internet en 60 Segundos</h1>
          <p className={styles.subtitle}>El viaje invisible de tus datos: de tu navegador al servidor y vuelta — en milisegundos</p>
        </header>

        <LegalNotice />

        {/* Timeline de pasos */}
        <div className={styles.timeline}>
          {PASOS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.timelineStep} ${pasoActivo === p.id ? styles.timelineActivo : ''}`}
              onClick={() => setPasoActivo(p.id)}
              style={{ borderColor: pasoActivo === p.id ? p.color : undefined }}
              aria-pressed={pasoActivo === p.id}
            >
              <span className={styles.stepNum} style={pasoActivo === p.id ? { backgroundColor: p.color } : undefined}>{p.numero}</span>
              <span className={styles.stepIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.stepTiempo}>{p.tiempoMs}</span>
            </button>
          ))}
        </div>

        {/* Barra de progreso visual */}
        <div className={styles.progressBar}>
          {PASOS.map((p, i) => (
            <div
              key={p.id}
              className={`${styles.progressSegment} ${PASOS.findIndex(pp => pp.id === pasoActivo) >= i ? styles.progressFilled : ''}`}
              style={PASOS.findIndex(pp => pp.id === pasoActivo) >= i ? { backgroundColor: p.color } : undefined}
            />
          ))}
        </div>

        {/* Toggle simple/técnico */}
        <div className={styles.vistaToggle}>
          <button
            type="button"
            className={`${styles.vistaBtn} ${vistaDetalle === 'simple' ? styles.vistaActiva : ''}`}
            onClick={() => setVistaDetalle('simple')}
            aria-pressed={vistaDetalle === 'simple'}
          >
            Explicación simple
          </button>
          <button
            type="button"
            className={`${styles.vistaBtn} ${vistaDetalle === 'tecnico' ? styles.vistaActiva : ''}`}
            onClick={() => setVistaDetalle('tecnico')}
            aria-pressed={vistaDetalle === 'tecnico'}
          >
            Detalle técnico
          </button>
        </div>

        {/* Detalle del paso */}
        <div className={styles.pasoDetalle} style={{ borderLeftColor: paso.color }} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.pasoHeader}>
            <span className={styles.pasoIcono} aria-hidden="true">{paso.icono}</span>
            <div>
              <span className={styles.pasoNum} style={{ color: paso.color }}>Paso {paso.numero} · {paso.tiempoMs}</span>
              <h2 className={styles.pasoTitulo}>{paso.titulo}</h2>
            </div>
          </div>

          <p className={styles.pasoTexto}>
            {vistaDetalle === 'simple' ? paso.queOcurre : paso.detalleTecnico}
          </p>

          <div className={styles.pasoSorpresa}>
            <span className={styles.sorpresaLabel}>Dato sorprendente</span>
            <p>{paso.datoSorprendente}</p>
          </div>

          {/* Navegación */}
          <div className={styles.pasoNav}>
            <button
              type="button"
              className={styles.pasoNavBtn}
              onClick={() => {
                const idx = PASOS.findIndex(p => p.id === pasoActivo);
                if (idx > 0) setPasoActivo(PASOS[idx - 1].id);
              }}
              disabled={PASOS.findIndex(p => p.id === pasoActivo) === 0}
            >
              ← Anterior
            </button>
            <span className={styles.pasoNavInfo}>{paso.numero} / {PASOS.length}</span>
            <button
              type="button"
              className={styles.pasoNavBtn}
              onClick={() => {
                const idx = PASOS.findIndex(p => p.id === pasoActivo);
                if (idx < PASOS.length - 1) setPasoActivo(PASOS[idx + 1].id);
              }}
              disabled={PASOS.findIndex(p => p.id === pasoActivo) === PASOS.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Resumen temporal */}
        <div className={styles.resumenTiempo}>
          <h3 className={styles.resumenTitulo}>Tiempo total del viaje</h3>
          <div className={styles.resumenGrid}>
            <div className={styles.resumenCard}>
              <span className={styles.resumenValor} style={{ color: '#27ae60' }}>{TIEMPO_TOTAL_RAPIDO}</span>
              <span className={styles.resumenLabel}>Web rápida (CDN, cerca)</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenValor} style={{ color: '#e67e22' }}>{TIEMPO_TOTAL_LENTO}</span>
              <span className={styles.resumenLabel}>Web lenta (lejos, pesada)</span>
            </div>
          </div>
        </div>

        {/* Datos globales */}
        <div className={styles.globalesSection}>
          <h3 className={styles.globalesTitulo}>Internet ahora mismo</h3>
          <div className={styles.globalesGrid}>
            {DATOS_GLOBALES.map((d, i) => (
              <div key={i} className={styles.globalCard}>
                <span className={styles.globalIcono} aria-hidden="true">{d.icono}</span>
                <span className={styles.globalCifra}>{d.cifra}</span>
                <span className={styles.globalDesc}>{d.descripcion}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            Todo este viaje — DNS, conexión, cifrado, petición, cables submarinos, servidor, respuesta,
            renderizado — <strong>ocurre en menos de lo que tardas en parpadear</strong>. Y sucede miles
            de millones de veces por segundo en todo el planeta, sin que nadie lo note.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más perspectiva → <a href="/visualizador-escalas-tiempo/">Cuánto Tarda el Mundo</a> · <a href="/visualizador-peso-numeros/">El Peso de los Números</a>
        </div>

        <EducationalSection
          title="La infraestructura invisible"
          subtitle="Lo que hace posible que internet funcione"
          defaultOpen={false}
        >
          <h3>Los cables submarinos: las venas de internet</h3>
          <p>
            El 99% del tráfico intercontinental viaja por cables de fibra óptica en el fondo del océano,
            no por satélites. Algunos tienen el grosor de una manguera de jardín y recorren 10.000 km.
            Los instala y mantiene una flota de ~40 barcos especializados en todo el mundo.
          </p>

          <h3>¿Qué pasa si se corta un cable?</h3>
          <p>
            Ocurre ~100 veces al año (anclas de barcos, terremotos, animales marinos). Internet no cae
            porque los datos se redirigen automáticamente por rutas alternativas — pero la velocidad
            puede degradarse. En 2008, un corte en el Mediterráneo afectó a internet en todo Oriente Medio.
          </p>

          <h3>El DNS: el talón de Aquiles de internet</h3>
          <p>
            Si los servidores DNS dejan de funcionar, no puedes navegar — aunque los servidores web
            estén perfectamente operativos. Es como si perdieran todas las agendas de teléfono del mundo:
            sabes que la persona existe, pero no puedes llamarla. Por eso los ataques DDoS a DNS son
            los más temidos.
          </p>

          <h3>Latencia vs velocidad: no es lo mismo</h3>
          <p>
            La fibra de 1 Gbps no hace que una web cargue instantáneamente. La <strong>latencia</strong>
            (tiempo que tarda un paquete en ir y volver) depende de la distancia física y los routers
            intermedios. Desde Europa a un servidor en Tokio, la latencia mínima posible (velocidad de la
            luz) es ~70 ms — y en la práctica es ~200 ms.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los tiempos son orientativos y varían según ubicación geográfica,
            calidad de conexión, carga del servidor y uso de CDNs. Los datos de infraestructura
            provienen de TeleGeography, Cloudflare Radar y fuentes públicas (2024).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-internet-60-segundos')} />
        <ShareCard appName="visualizador-internet-60-segundos" />
        <Footer appName="visualizador-internet-60-segundos" />
    </div>
  );
}
