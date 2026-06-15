'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TransportePlantas.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'xilema-floema' | 'como-sube' | 'estomas' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'xilema-floema', titulo: 'Xilema y Floema', icono: '🌿', subtitulo: 'Dos autopistas de sentido único' },
  { id: 'como-sube', titulo: '¿Cómo Sube?', icono: '💧', subtitulo: 'El misterio del agua sin bomba' },
  { id: 'estomas', titulo: 'Los Estomas', icono: '🔬', subtitulo: 'Válvulas inteligentes de la planta' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '🌳', subtitulo: 'Cifras que impresionan' },
];

// ─────────────────────────────────────────────
// Datos: Sección 1 - Xilema y Floema
// ─────────────────────────────────────────────

interface SistemaVascular {
  id: 'xilema' | 'floema';
  nombre: string;
  color: string;
  icono: string;
  transporta: string;
  direccion: string;
  tipoCelulas: string;
  velocidad: string;
  descripcion: string;
  dato: string;
}

const SISTEMAS: SistemaVascular[] = [
  {
    id: 'xilema',
    nombre: 'Xilema',
    color: 'xilema',
    icono: '💧',
    transporta: 'Savia bruta (agua + minerales disueltos)',
    direccion: 'Raíz → Hojas (ascendente)',
    tipoCelulas: 'Células muertas — tubos rígidos y huecos',
    velocidad: '1-2 m/hora',
    descripcion: 'El xilema es el sistema de tuberías que lleva agua y minerales desde las raíces hasta las hojas. Sus células están muertas y lignificadas, formando tubos rígidos y huecos que soportan la columna de agua sin colapsar.',
    dato: 'El xilema también da soporte estructural a la planta — la madera es básicamente xilema envejecido.',
  },
  {
    id: 'floema',
    nombre: 'Floema',
    color: 'floema',
    icono: '🍬',
    transporta: 'Savia elaborada (azúcares de la fotosíntesis)',
    direccion: 'Hojas → Resto de la planta (descendente)',
    tipoCelulas: 'Células vivas — tubos cribosos con placas',
    velocidad: '0,5-1 m/hora',
    descripcion: 'El floema distribuye los azúcares producidos por la fotosíntesis desde las hojas hacia el resto de la planta: raíces, frutos, semillas y zonas de crecimiento. Sus células están vivas y conectadas por placas cribosas.',
    dato: 'Los pulgones perforan el floema con su estilete para succionar la savia elaborada, rica en azúcares.',
  },
];

// ─────────────────────────────────────────────
// Datos: Sección 2 - Cómo sube el agua
// ─────────────────────────────────────────────

interface Mecanismo {
  icono: string;
  titulo: string;
  etiqueta: string;
  descripcion: string;
  detalle: string;
  importancia: string;
  colorClass: string;
}

const MECANISMOS: Mecanismo[] = [
  {
    icono: '🌬️',
    titulo: 'Transpiración (motor principal)',
    etiqueta: '~90% de la fuerza',
    descripcion: 'El agua se evapora por los estomas de las hojas. Esto crea una tensión que tira de la columna de agua hacia arriba a través del xilema, como una cadena ininterrumpida.',
    detalle: 'La teoría de cohesión-tensión (Dixon-Joly, 1894) explica que las moléculas de agua están unidas entre sí por puentes de hidrógeno, formando una columna continua desde la raíz hasta la hoja. Al evaporarse agua en la hoja, se crea una presión negativa que tira de toda la columna.',
    importancia: 'Es el motor que permite a las secuoyas de 115 m subir agua contra la gravedad sin gastar energía metabólica.',
    colorClass: 'mecanismoTranspiracion',
  },
  {
    icono: '🧲',
    titulo: 'Capilaridad',
    etiqueta: 'Contribución menor',
    descripcion: 'El agua se adhiere a las paredes estrechas del xilema (adhesión) y las moléculas de agua se atraen entre sí (cohesión). En tubos muy finos, esto hace subir el líquido.',
    detalle: 'La capilaridad solo puede elevar agua hasta ~1 metro en los vasos más finos del xilema. Por sí sola no explica árboles altos, pero contribuye al inicio del ascenso y en plantas pequeñas.',
    importancia: 'Funciona por la atracción entre el agua y las paredes del vaso (adhesión) combinada con la tensión superficial del agua.',
    colorClass: 'mecanismoCapilaridad',
  },
  {
    icono: '🌱',
    titulo: 'Presión radicular',
    etiqueta: 'Solo en plantas pequeñas',
    descripcion: 'Las raíces absorben minerales activamente, creando una concentración mayor dentro que fuera. El agua entra por ósmosis y empuja la savia hacia arriba.',
    detalle: 'Este mecanismo se observa al amanecer cuando la transpiración es mínima: algunas plantas exudan gotas de agua en las puntas de las hojas (gutación). Genera presiones de hasta 0,1-0,5 MPa.',
    importancia: 'Es el único mecanismo que empuja desde abajo, pero solo funciona en plantas herbáceas y condiciones de alta humedad.',
    colorClass: 'mecanismoPresion',
  },
];

// ─────────────────────────────────────────────
// Datos: Sección 4 - Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  cifra: string;
  etiqueta: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  {
    icono: '🌳',
    cifra: '~400 L/día',
    etiqueta: 'Agua transpirada por un roble adulto',
    detalle: 'Un roble adulto puede transpirar hasta 400 litros de agua al día en verano. Eso es como vaciar 2 bañeras diarias a través de sus hojas.',
  },
  {
    icono: '🌽',
    cifra: '~30.000 L/día',
    etiqueta: 'Transpiración de 1 ha de maíz',
    detalle: 'Un campo de maíz de 1 hectárea transpira unos 30.000 litros diarios durante la temporada de crecimiento. Es un factor clave en el ciclo hidrológico local.',
  },
  {
    icono: '📏',
    cifra: '115 m',
    etiqueta: 'La secuoya más alta del mundo',
    detalle: 'Hyperion, la secuoya más alta (115,92 m en California), sube agua hasta su copa sin ninguna bomba mecánica. La presión negativa por transpiración alcanza -2 MPa en las hojas superiores.',
  },
  {
    icono: '🔬',
    cifra: '20-200 μm',
    etiqueta: 'Diámetro de los vasos del xilema',
    detalle: 'Los vasos del xilema miden entre 20 y 200 micrómetros de diámetro (un cabello humano mide ~70 μm). Los más anchos transportan más agua, pero son más vulnerables a embolias.',
  },
  {
    icono: '⚡',
    cifra: '1-2 m/h',
    etiqueta: 'Velocidad del xilema vs floema',
    detalle: 'El xilema transporta agua a 1-2 m/hora. El floema es más lento: 0,5-1 m/hora. Ambos funcionan sin bombas mecánicas, usando solo física y bioquímica.',
  },
  {
    icono: '🌵',
    cifra: 'Solo de noche',
    etiqueta: 'Estomas de cactus (metabolismo CAM)',
    detalle: 'Los cactus y las crasas abren sus estomas solo de noche para minimizar la pérdida de agua. Fijan CO₂ en ácido málico y lo usan de día para la fotosíntesis.',
  },
  {
    icono: '🍁',
    cifra: 'Burbujas de aire',
    etiqueta: 'Por qué caen las hojas en otoño',
    detalle: 'En otoño, el xilema de las hojas se bloquea con burbujas de aire (embolias). La hoja pierde su suministro de agua, la clorofila se degrada, aparecen los colores y la hoja cae.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Xilema y Floema
// ─────────────────────────────────────────────

function SeccionXilemaFloema() {
  const [sistemaActivo, setSistemaActivo] = useState<'xilema' | 'floema' | null>(null);

  const sistemaSeleccionado = SISTEMAS.find(s => s.id === sistemaActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las plantas tienen <strong>dos sistemas de tuberías</strong> que funcionan como autopistas de sentido único: el xilema sube y el floema baja.</p>
      </div>

      {/* Diagrama vertical de planta con flujos */}
      <div className={styles.plantaCard}>
        <h3 className={styles.plantaTitulo}>Sistema vascular de la planta</h3>
        <div className={styles.plantaDiagrama}>
          {/* Columna xilema */}
          <div className={styles.flujoColumna}>
            <div className={styles.flujoLabel}>Xilema</div>
            <div className={`${styles.flujoTubo} ${styles.flujoXilema}`}>
              <div className={styles.flechaSubida} aria-hidden="true">↑</div>
              <div className={styles.flechaSubida} aria-hidden="true">↑</div>
              <div className={styles.flechaSubida} aria-hidden="true">↑</div>
            </div>
            <div className={styles.flujoDetalle}>Savia bruta</div>
          </div>

          {/* Planta central */}
          <div className={styles.plantaCentral}>
            <div className={styles.plantaParte}>
              <span className={styles.plantaParteIcono} aria-hidden="true">🍃</span>
              <span className={styles.plantaParteNombre}>Hojas</span>
            </div>
            <div className={styles.plantaTallo}>
              <span className={styles.plantaTalloIcono} aria-hidden="true">🌿</span>
            </div>
            <div className={styles.plantaParte}>
              <span className={styles.plantaParteIcono} aria-hidden="true">🌱</span>
              <span className={styles.plantaParteNombre}>Raíz</span>
            </div>
          </div>

          {/* Columna floema */}
          <div className={styles.flujoColumna}>
            <div className={styles.flujoLabel}>Floema</div>
            <div className={`${styles.flujoTubo} ${styles.flujoFloema}`}>
              <div className={styles.flechaBajada} aria-hidden="true">↓</div>
              <div className={styles.flechaBajada} aria-hidden="true">↓</div>
              <div className={styles.flechaBajada} aria-hidden="true">↓</div>
            </div>
            <div className={styles.flujoDetalle}>Savia elaborada</div>
          </div>
        </div>
      </div>

      {/* Corte transversal */}
      <div className={styles.corteCard}>
        <h3 className={styles.corteTitulo}>Corte transversal del tallo</h3>
        <div className={styles.corteDiagrama}>
          <div className={styles.corteCapa} style={{ background: '#8B6914', color: 'white' }}>
            <span className={styles.corteCapaNombre}>Corteza</span>
          </div>
          <div
            className={`${styles.corteCapa} ${styles.corteCapaClickable} ${sistemaActivo === 'floema' ? styles.corteCapaActiva : ''}`}
            style={{ background: '#D4EDDA', color: '#155724' }}
            onClick={() => setSistemaActivo(sistemaActivo === 'floema' ? null : 'floema')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSistemaActivo(sistemaActivo === 'floema' ? null : 'floema'); } }}
            aria-pressed={sistemaActivo === 'floema'}
          >
            <span className={styles.corteCapaNombre}>Floema (exterior)</span>
          </div>
          <div className={styles.corteCapa} style={{ background: '#E8E8E8', color: '#555' }}>
            <span className={styles.corteCapaNombre}>Cambium</span>
          </div>
          <div
            className={`${styles.corteCapa} ${styles.corteCapaClickable} ${sistemaActivo === 'xilema' ? styles.corteCapaActiva : ''}`}
            style={{ background: '#D6EAF8', color: '#1A5276' }}
            onClick={() => setSistemaActivo(sistemaActivo === 'xilema' ? null : 'xilema')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSistemaActivo(sistemaActivo === 'xilema' ? null : 'xilema'); } }}
            aria-pressed={sistemaActivo === 'xilema'}
          >
            <span className={styles.corteCapaNombre}>Xilema (interior)</span>
          </div>
          <div className={styles.corteCapa} style={{ background: '#F5E6CC', color: '#7D6608' }}>
            <span className={styles.corteCapaNombre}>Médula</span>
          </div>
        </div>
        <p className={styles.instruccion}>Pulsa en Xilema o Floema para ver sus detalles</p>
      </div>

      {/* Panel de detalle del sistema seleccionado */}
      {sistemaSeleccionado && (
        <div className={styles.sistemaDetalle}>
          <div className={styles.sistemaHeader}>
            <span aria-hidden="true" className={styles.sistemaDetalleIcono}>{sistemaSeleccionado.icono}</span>
            <h3 className={styles.sistemaDetalleTitulo}>{sistemaSeleccionado.nombre}</h3>
          </div>
          <p className={styles.sistemaDetalleDesc}>{sistemaSeleccionado.descripcion}</p>
          <div className={styles.sistemaProps}>
            <div className={styles.sistemaProp}>
              <span className={styles.sistemaPropLabel}>Transporta</span>
              <span className={styles.sistemaPropValor}>{sistemaSeleccionado.transporta}</span>
            </div>
            <div className={styles.sistemaProp}>
              <span className={styles.sistemaPropLabel}>Dirección</span>
              <span className={styles.sistemaPropValor}>{sistemaSeleccionado.direccion}</span>
            </div>
            <div className={styles.sistemaProp}>
              <span className={styles.sistemaPropLabel}>Células</span>
              <span className={styles.sistemaPropValor}>{sistemaSeleccionado.tipoCelulas}</span>
            </div>
            <div className={styles.sistemaProp}>
              <span className={styles.sistemaPropLabel}>Velocidad</span>
              <span className={styles.sistemaPropValor}>{sistemaSeleccionado.velocidad}</span>
            </div>
          </div>
          <div className={styles.sistemaDato}>
            <strong>Dato:</strong> {sistemaSeleccionado.dato}
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>El xilema solo sube y el floema solo baja — <strong>dos autopistas de sentido único</strong> que mantienen viva a la planta sin necesidad de corazón.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: ¿Cómo Sube el Agua?
// ─────────────────────────────────────────────

function SeccionComoSube() {
  const [mecanismoActivo, setMecanismoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El misterio: el agua sube hasta <strong>más de 100 metros</strong> sin bomba mecánica. Tres mecanismos lo explican.</p>
      </div>

      {/* Diagrama de la cadena */}
      <div className={styles.cadenaCard}>
        <h3 className={styles.cadenaTitulo}>La cadena del agua</h3>
        <div className={styles.cadenaFlujo}>
          <div className={styles.cadenaPaso}>
            <span className={styles.cadenaPasoIcono} aria-hidden="true">🌱</span>
            <span className={styles.cadenaPasoTexto}>Raíz absorbe</span>
          </div>
          <div className={styles.cadenaFlecha} aria-hidden="true">
            <div className={styles.flechaAnimada}>→</div>
          </div>
          <div className={styles.cadenaPaso}>
            <span className={styles.cadenaPasoIcono} aria-hidden="true">🌿</span>
            <span className={styles.cadenaPasoTexto}>Xilema conduce</span>
          </div>
          <div className={styles.cadenaFlecha} aria-hidden="true">
            <div className={styles.flechaAnimada}>→</div>
          </div>
          <div className={styles.cadenaPaso}>
            <span className={styles.cadenaPasoIcono} aria-hidden="true">🍃</span>
            <span className={styles.cadenaPasoTexto}>Hoja transpira</span>
          </div>
        </div>
        <p className={styles.cadenaAnalogía}>
          <span aria-hidden="true">🥤</span> Analogía: como beber con pajita — la succión desde arriba tira del líquido
        </p>
      </div>

      {/* Los 3 mecanismos */}
      <h3 className={styles.subSeccionTitulo}>Tres mecanismos combinados</h3>
      <div className={styles.mecanismosContainer}>
        {MECANISMOS.map((m, i) => (
          <div key={i} className={styles.mecanismoWrapper}>
            <button
              type="button"
              className={`${styles.mecanismoCard} ${styles[m.colorClass]} ${mecanismoActivo === i ? styles.mecanismoActivo : ''}`}
              onClick={() => setMecanismoActivo(mecanismoActivo === i ? null : i)}
              aria-expanded={mecanismoActivo === i}
            >
              <div className={styles.mecanismoHeader}>
                <span className={styles.mecanismoIcono} aria-hidden="true">{m.icono}</span>
                <div>
                  <span className={styles.mecanismoTitulo}>{m.titulo}</span>
                  <span className={styles.mecanismoEtiqueta}>{m.etiqueta}</span>
                </div>
              </div>
              <p className={styles.mecanismoDesc}>{m.descripcion}</p>
              {mecanismoActivo === i && (
                <div className={styles.mecanismoDetalle}>
                  <p>{m.detalle}</p>
                  <div className={styles.mecanismoImportancia}>
                    <strong>Importancia:</strong> {m.importancia}
                  </div>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Dato secuoya */}
      <div className={styles.secuoyaCard}>
        <div className={styles.secuoyaVisual}>
          <div className={styles.secuoyaArbol} aria-hidden="true">
            <div className={styles.secuoyaCopa}>🌲</div>
            <div className={styles.secuoyaAltura}>115 m</div>
          </div>
          <div className={styles.secuoyaTexto}>
            <h4 className={styles.secuoyaTitulo}>La secuoya Hyperion</h4>
            <p className={styles.secuoyaDesc}>
              Con {formatNumber(115.92, 2)} metros de altura, sube agua contra la gravedad usando <strong>0 energía mecánica</strong>.
              Solo física: cohesión del agua, adhesión al xilema y transpiración en las hojas.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>La transpiración es <strong>el motor más eficiente de la naturaleza</strong> — mueve millones de litros de agua cada día en los bosques del planeta sin gastar una sola molécula de ATP.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Los Estomas
// ─────────────────────────────────────────────

function SeccionEstomas() {
  const [estomaAbierto, setEstomaAbierto] = useState(true);

  const factores = [
    { factor: 'Luz intensa', efecto: 'Abre', icono: '☀️', razon: 'Necesita CO₂ para fotosíntesis' },
    { factor: 'CO₂ alto interno', efecto: 'Cierra', icono: '💨', razon: 'Ya tiene suficiente CO₂' },
    { factor: 'Sequía / estrés hídrico', efecto: 'Cierra', icono: '🏜️', razon: 'Prioriza conservar agua' },
    { factor: 'Viento seco', efecto: 'Cierra', icono: '🌬️', razon: 'Evita pérdida excesiva de agua' },
    { factor: 'Oscuridad (noche)', efecto: 'Cierra', icono: '🌙', razon: 'Sin fotosíntesis, no necesita CO₂' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los estomas son <strong>microporos</strong> en la superficie de las hojas que regulan el intercambio de gases y la pérdida de agua.</p>
      </div>

      {/* Diagrama del estoma con toggle */}
      <div className={styles.estomaCard}>
        <h3 className={styles.estomaTitulo}>Anatomía de un estoma</h3>

        <div className={styles.estomaDiagrama}>
          <div className={`${styles.estomaVisual} ${estomaAbierto ? styles.estomaAbiertoVisual : styles.estomaCerradoVisual}`}>
            {/* Células oclusivas */}
            <div className={styles.celulaOclusiva} style={{ transform: estomaAbierto ? 'rotate(-20deg) translateX(-8px)' : 'rotate(0deg) translateX(0)' }}>
              <span className={styles.celulaTexto}>Célula oclusiva</span>
            </div>
            <div className={styles.ostioloContainer}>
              <div className={`${styles.ostiolo} ${estomaAbierto ? styles.ostioloAbierto : styles.ostioloCerrado}`}>
                <span className={styles.ostioloTexto}>{estomaAbierto ? 'Ostiolo abierto' : 'Ostiolo cerrado'}</span>
              </div>
            </div>
            <div className={styles.celulaOclusiva} style={{ transform: estomaAbierto ? 'rotate(20deg) translateX(8px)' : 'rotate(0deg) translateX(0)' }}>
              <span className={styles.celulaTexto}>Célula oclusiva</span>
            </div>
          </div>

          {/* Flujos cuando está abierto */}
          <div className={styles.estomaFlujos}>
            {estomaAbierto ? (
              <>
                <div className={styles.estomaFlujo}>
                  <span aria-hidden="true">💨</span> CO₂ entra
                </div>
                <div className={styles.estomaFlujo}>
                  <span aria-hidden="true">💧</span> H₂O sale (vapor)
                </div>
                <div className={styles.estomaFlujo}>
                  <span aria-hidden="true">🫧</span> O₂ sale
                </div>
              </>
            ) : (
              <div className={styles.estomaFlujo}>
                <span aria-hidden="true">🚫</span> Sin intercambio de gases
              </div>
            )}
          </div>
        </div>

        {/* Toggle día/noche */}
        <div className={styles.estomaToggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${estomaAbierto ? styles.toggleActivo : ''}`}
            onClick={() => setEstomaAbierto(true)}
            aria-pressed={estomaAbierto}
          >
            <span aria-hidden="true">☀️</span> Día (abierto)
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${!estomaAbierto ? styles.toggleActivo : ''}`}
            onClick={() => setEstomaAbierto(false)}
            aria-pressed={!estomaAbierto}
          >
            <span aria-hidden="true">🌙</span> Noche (cerrado)
          </button>
        </div>

        <div className={styles.estomaEstado}>
          {estomaAbierto ? (
            <p><strong>Día:</strong> Las células oclusivas se hinchan (turgentes) y se separan, abriendo el poro. Entra CO₂ para la fotosíntesis, pero se pierde agua por transpiración.</p>
          ) : (
            <p><strong>Noche:</strong> Las células oclusivas se desinflan (flácidas) y se juntan, cerrando el poro. Se conserva agua, pero no entra CO₂.</p>
          )}
        </div>
      </div>

      {/* El dilema del estoma */}
      <div className={styles.dilemaCard}>
        <h3 className={styles.dilemaTitulo}>El dilema del estoma</h3>
        <div className={styles.dilemaGrid}>
          <div className={styles.dilemaOpcion}>
            <span className={styles.dilemaIcono} aria-hidden="true">✅</span>
            <span className={styles.dilemaAccion}>Abrirse</span>
            <span className={styles.dilemaPro}>+ CO₂ para fotosíntesis</span>
            <span className={styles.dilemaContra}>- Pierde agua</span>
          </div>
          <div className={styles.dilemaVs}>vs</div>
          <div className={styles.dilemaOpcion}>
            <span className={styles.dilemaIcono} aria-hidden="true">🔒</span>
            <span className={styles.dilemaAccion}>Cerrarse</span>
            <span className={styles.dilemaPro}>+ Conserva agua</span>
            <span className={styles.dilemaContra}>- Sin CO₂ ni fotosíntesis</span>
          </div>
        </div>
      </div>

      {/* Factores */}
      <div className={styles.factoresCard}>
        <h3 className={styles.factoresTitulo}>¿Qué controla los estomas?</h3>
        <div className={styles.factoresGrid}>
          {factores.map((f, i) => (
            <div key={i} className={styles.factorItem}>
              <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
              <div className={styles.factorInfo}>
                <span className={styles.factorNombre}>{f.factor}</span>
                <span className={`${styles.factorEfecto} ${f.efecto === 'Abre' ? styles.factorAbre : styles.factorCierra}`}>
                  {f.efecto}
                </span>
              </div>
              <span className={styles.factorRazon}>{f.razon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dato: densidad de estomas */}
      <div className={styles.densidadCard}>
        <div className={styles.densidadVisual}>
          <span className={styles.densidadCifra}>{formatNumber(10000, 0)} - {formatNumber(100000, 0)}</span>
          <span className={styles.densidadUnidad}>estomas por cm²</span>
        </div>
        <p className={styles.densidadDesc}>
          Una sola hoja puede tener decenas de miles de estomas, la mayoría en el envés (parte inferior) donde hay menos sol directo y la evaporación es menor.
        </p>
      </div>

      <div className={styles.insight}>
        <p>Los estomas son <strong>las válvulas inteligentes de la planta</strong> — toman decisiones en tiempo real entre ganar carbono o conservar agua, sin cerebro ni sistema nervioso.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El transporte vegetal opera a una escala difícil de imaginar. Estos datos ayudan a <strong>dimensionar su impacto</strong>.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.datoCard} ${datoActivo === i ? styles.datoCardActivo : ''}`}
            onClick={() => setDatoActivo(datoActivo === i ? null : i)}
            aria-expanded={datoActivo === i}
          >
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoCifra}>{d.cifra}</span>
            <span className={styles.datoEtiqueta}>{d.etiqueta}</span>
            {datoActivo === i && (
              <span className={styles.datoDetalle}>{d.detalle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Por qué importa */}
      <div className={styles.importanciaCard}>
        <h3 className={styles.importanciaTitulo}>
          <span aria-hidden="true">🌍</span> ¿Por qué importa?
        </h3>
        <p className={styles.importanciaDesc}>
          Sin transporte vegetal no habría bosques. Sin bosques no habría ciclo del agua en los continentes.
          Sin ciclo del agua no habría ríos, ni agricultura, ni oxígeno suficiente para la vida terrestre.
        </p>
        <div className={styles.importanciaCadena}>
          <span className={styles.importanciaPaso}>Transporte vegetal</span>
          <span className={styles.importanciaFlecha} aria-hidden="true">→</span>
          <span className={styles.importanciaPaso}>Bosques</span>
          <span className={styles.importanciaFlecha} aria-hidden="true">→</span>
          <span className={styles.importanciaPaso}>Ciclo del agua</span>
          <span className={styles.importanciaFlecha} aria-hidden="true">→</span>
          <span className={styles.importanciaPaso}>Vida terrestre</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>El transporte en las plantas es <strong>uno de los procesos más subestimados de la biología</strong> — silencioso, constante y absolutamente esencial para toda la vida en la Tierra.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTransportePlantasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('xilema-floema');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'xilema-floema': return <SeccionXilemaFloema />;
      case 'como-sube': return <SeccionComoSube />;
      case 'estomas': return <SeccionEstomas />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Transporte en las Plantas</h1>
          <p className={styles.subtitle}>Agua que sube sin motor: el sistema vascular más eficiente de la naturaleza</p>
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
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el transporte vegetal"
          subtitle="Conceptos clave de fisiología vegetal"
          defaultOpen={false}
        >
          <h3>¿Qué es el transporte en las plantas?</h3>
          <p>
            El transporte vegetal es el conjunto de mecanismos por los que las plantas mueven agua,
            minerales y azúcares a lo largo de su cuerpo. A diferencia de los animales, las plantas
            no tienen corazón ni sistema circulatorio con bombas: usan la física (capilaridad, ósmosis,
            transpiración) para mover fluidos a largas distancias.
          </p>

          <h3>¿Qué diferencia hay entre xilema y floema?</h3>
          <p>
            El <strong>xilema</strong> transporta savia bruta (agua y minerales) desde las raíces hacia
            las hojas. Sus células están muertas y lignificadas. El <strong>floema</strong> transporta
            savia elaborada (azúcares de la fotosíntesis) desde las hojas hacia el resto de la planta.
            Sus células están vivas y conectadas por placas cribosas.
          </p>

          <h3>¿Por qué las plantas transpiran tanto agua?</h3>
          <p>
            La transpiración es el &quot;precio&quot; que pagan las plantas por hacer fotosíntesis: al abrir
            los estomas para captar CO₂, inevitablemente pierden agua. Por cada molécula de CO₂ que
            entra, la planta pierde cientos de moléculas de agua. Un roble puede perder 400 litros
            diarios, pero es el mecanismo que impulsa el ascenso del agua desde las raíces.
          </p>

          <h3>Adaptaciones extremas</h3>
          <p>
            Las plantas de ambientes secos han desarrollado adaptaciones notables: estomas hundidos
            en criptas (oleandro), cutículas cerosas gruesas (cactus), metabolismo CAM que abre estomas
            solo de noche (agave, piña), hojas reducidas a espinas (cactus) o raíces extremadamente
            profundas (acacia). Cada adaptación es un compromiso entre captar CO₂ y conservar agua.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador presenta una visión simplificada del transporte vegetal
            con fines educativos. Los datos numéricos son aproximaciones basadas en fuentes de fisiología
            vegetal general (Taiz &amp; Zeiger, Nobel). La realidad bioquímica es considerablemente más compleja.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-transporte-plantas')} />
        <ShareCard appName="visualizador-transporte-plantas" />
        <Footer appName="visualizador-transporte-plantas" />
    </div>
  );
}
