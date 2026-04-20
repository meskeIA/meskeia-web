'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SistemaLinfatico.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'funciones' | 'organos' | 'flujo' | 'fallos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'funciones', titulo: '¿Qué es?', icono: '💧', subtitulo: 'Las 3 funciones del sistema linfático' },
  { id: 'organos', titulo: 'Órganos', icono: '🫁', subtitulo: 'Primarios y secundarios' },
  { id: 'flujo', titulo: 'Flujo de linfa', icono: '🔄', subtitulo: 'Cómo circula la linfa' },
  { id: 'fallos', titulo: 'Cuando falla', icono: '⚠️', subtitulo: 'Patologías del sistema linfático' },
];

// ─────────────────────────────────────────────
// Datos: 3 funciones principales
// ─────────────────────────────────────────────

interface FuncionLinfatica {
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  color: string;
}

const FUNCIONES: FuncionLinfatica[] = [
  {
    icono: '💧',
    titulo: 'Drenaje de fluidos',
    descripcion: 'Recoge el líquido intersticial (linfa) que los capilares sanguíneos filtran al tejido.',
    detalle: 'Sin este drenaje, los tejidos se hincharían permanentemente (edema). Cada día, los capilares sanguíneos filtran unos 20 litros de plasma hacia los tejidos, pero solo ~17 vuelven directamente por los capilares venosos. Los ~3 litros restantes son recogidos por el sistema linfático.',
    color: '#2E86AB',
  },
  {
    icono: '🛡️',
    titulo: 'Inmunidad',
    descripcion: 'Los ganglios linfáticos son "filtros" donde los linfocitos detectan y destruyen patógenos y células anormales.',
    detalle: 'La linfa pasa por los ganglios linfáticos antes de retornar a la sangre. Allí, los linfocitos B y T inspeccionan el contenido: si detectan un antígeno extraño, se multiplican y lanzan una respuesta inmune. Por eso los ganglios se hinchan cuando estás enfermo.',
    color: '#48A9A6',
  },
  {
    icono: '🍔',
    titulo: 'Absorción de grasas',
    descripcion: 'Los vasos linfáticos del intestino (quilíferos) absorben las grasas de la dieta y las transportan a la sangre.',
    detalle: 'La linfa intestinal se llama "quilo" y es de color blanco lechoso por las gotitas de grasa (quilomicrones) que transporta. Esta función hace que las grasas entren a la circulación sanguínea de forma más gradual que los azúcares o proteínas, que van directamente al hígado por la vena porta.',
    color: '#7FB3D3',
  },
];

// ─────────────────────────────────────────────
// Datos: órganos linfáticos
// ─────────────────────────────────────────────

type TipoOrgano = 'primario' | 'secundario';

interface OrganoLinfatico {
  id: string;
  nombre: string;
  tipo: TipoOrgano;
  icono: string;
  ubicacion: string;
  funcion: string;
  curiosidad: string;
  dato: string;
  color: string;
}

const ORGANOS: OrganoLinfatico[] = [
  {
    id: 'medula-osea',
    nombre: 'Médula ósea',
    tipo: 'primario',
    icono: '🦴',
    ubicacion: 'Interior de huesos largos y planos (fémur, esternón, costillas)',
    funcion: 'Genera todos los linfocitos B y las células NK (Natural Killer). Es la "fábrica" de las células del sistema inmune.',
    curiosidad: 'Produce aproximadamente 500 millones de células inmunes al día. Los linfocitos B maduran completamente aquí antes de salir a la circulación.',
    dato: '500 millones de células inmunes producidas al día',
    color: '#8e44ad',
  },
  {
    id: 'timo',
    nombre: 'Timo',
    tipo: 'primario',
    icono: '🫀',
    ubicacion: 'Detrás del esternón, entre los pulmones',
    funcion: 'Los linfocitos T migran aquí desde la médula ósea y "aprenden" a reconocer lo propio de lo extraño (tolerancia inmunológica).',
    curiosidad: 'Alcanza su máximo tamaño en la pubertad y se atrofia progresivamente. En adultos mayores queda casi vestigial, lo que reduce la capacidad de generar nuevos linfocitos T.',
    dato: 'Solo el 2-5% de los linfocitos T que entran al timo salen con vida (rigurosa selección)',
    color: '#e74c3c',
  },
  {
    id: 'ganglios',
    nombre: 'Ganglios linfáticos',
    tipo: 'secundario',
    icono: '🔮',
    ubicacion: 'Cuello, axilas, ingle, abdomen (cadenas ganglionares)',
    funcion: 'Filtran la linfa y presentan antígenos a los linfocitos. Si hay infección, se hinchan porque los linfocitos se multiplican para combatirla.',
    curiosidad: 'Hay más de 600 ganglios en el cuerpo humano. Un ganglio inflamado puede pasar de 5mm a 2-3cm en solo 24 horas durante una infección aguda.',
    dato: '+600 ganglios linfáticos en el cuerpo humano',
    color: '#2E86AB',
  },
  {
    id: 'bazo',
    nombre: 'Bazo',
    tipo: 'secundario',
    icono: '🫘',
    ubicacion: 'Bajo el diafragma izquierdo, junto al páncreas',
    funcion: 'Filtra la sangre (no la linfa), destruye glóbulos rojos envejecidos y activa linfocitos ante patógenos presentes en la sangre.',
    curiosidad: 'Puede funcionar como "reserva" de sangre. En esfuerzo físico intenso se contrae y libera hasta 0,5 litros de sangre extra a la circulación.',
    dato: 'Órgano linfático más grande del cuerpo (~150 g)',
    color: '#c0392b',
  },
  {
    id: 'amigdalas',
    nombre: 'Amígdalas',
    tipo: 'secundario',
    icono: '👅',
    ubicacion: 'Garganta (amígdalas palatinas) y base de la lengua (amígdala lingual)',
    funcion: 'Primera línea defensiva contra patógenos que entran por boca y nariz. Detectan agentes externos antes de que lleguen al tracto respiratorio.',
    curiosidad: 'Las amígdalas forman el "anillo de Waldeyer" junto con las adenoides. Son los únicos órganos linfáticos directamente expuestos al exterior del cuerpo.',
    dato: 'Primera defensa inmune contra patógenos aéreos y alimentarios',
    color: '#f39c12',
  },
  {
    id: 'placas-peyer',
    nombre: 'Placas de Peyer',
    tipo: 'secundario',
    icono: '🫀',
    ubicacion: 'Intestino delgado (íleon)',
    funcion: 'Vigilan el contenido intestinal y detectan patógenos antes de que crucen la mucosa. Trabajan en estrecha colaboración con el microbioma.',
    curiosidad: 'Son la razón por la que el intestino es el mayor órgano inmune del cuerpo. Coordinan la tolerancia a la microbiota beneficiosa y la defensa contra patógenos.',
    dato: 'El intestino alberga el 70% del sistema inmune del cuerpo',
    color: '#27ae60',
  },
];

// ─────────────────────────────────────────────
// Datos: pasos del flujo de linfa
// ─────────────────────────────────────────────

interface PasoFlujo {
  num: string;
  icono: string;
  titulo: string;
  descripcion: string;
  color: string;
}

const PASOS_FLUJO: PasoFlujo[] = [
  {
    num: '1',
    icono: '🩸',
    titulo: 'Filtración capilar',
    descripcion: 'Los capilares sanguíneos filtran ~20 L de plasma al día hacia los tejidos, aportando nutrientes y oxígeno a las células.',
    color: '#e74c3c',
  },
  {
    num: '2',
    icono: '🔄',
    titulo: 'Retorno venoso parcial',
    descripcion: 'Solo ~17 L vuelven directamente a la sangre por los capilares venosos. Los ~3 L restantes quedan en el espacio intersticial.',
    color: '#3498db',
  },
  {
    num: '3',
    icono: '💧',
    titulo: 'Captación linfática',
    descripcion: 'Los capilares linfáticos (cerrados en un extremo) recogen esos ~3 L de líquido intersticial, que ahora se llama "linfa".',
    color: '#2E86AB',
  },
  {
    num: '4',
    icono: '💪',
    titulo: 'Propulsión muscular',
    descripcion: 'La linfa viaja por los vasos linfáticos sin bomba propia. El movimiento muscular, la respiración y las válvulas antirretorno la impulsan.',
    color: '#48A9A6',
  },
  {
    num: '5',
    icono: '🔮',
    titulo: 'Filtrado en ganglios',
    descripcion: 'La linfa pasa por los ganglios linfáticos, donde es inspeccionada por linfocitos. Si hay patógenos, se lanza la respuesta inmune.',
    color: '#9b59b6',
  },
  {
    num: '6',
    icono: '🩺',
    titulo: 'Retorno a la sangre',
    descripcion: 'La linfa desemboca en la sangre por el conducto torácico (a la subclavia izquierda) y el conducto linfático derecho.',
    color: '#27ae60',
  },
];

// ─────────────────────────────────────────────
// Datos: patologías
// ─────────────────────────────────────────────

interface Patologia {
  icono: string;
  nombre: string;
  descripcion: string;
  mecanismo: string;
  color: string;
}

const PATOLOGIAS: Patologia[] = [
  {
    icono: '🦵',
    nombre: 'Linfedema',
    descripcion: 'Obstrucción o daño de los vasos linfáticos que provoca acumulación de linfa y edema crónico.',
    mecanismo: 'Puede ocurrir tras cirugía de ganglio (p.ej. mastectomía con vaciamiento axilar) o por parásitos (filariasis en regiones tropicales). El miembro afectado se hincha progresivamente.',
    color: '#e74c3c',
  },
  {
    icono: '🔬',
    nombre: 'Linfoma',
    descripcion: 'Proliferación maligna de linfocitos en los ganglios linfáticos.',
    mecanismo: 'Existen dos grandes grupos: Hodgkin (con células de Reed-Sternberg, frecuente en jóvenes, buen pronóstico) y no-Hodgkin (grupo heterogéneo de más de 70 subtipos). Educativo: solo mecanismo, sin diagnóstico.',
    color: '#9b59b6',
  },
  {
    icono: '🤒',
    nombre: 'Linfadenitis (ganglio inflamado)',
    descripcion: 'Respuesta normal a una infección local o sistémica: el ganglio se hincha porque los linfocitos se multiplican.',
    mecanismo: 'Es una respuesta fisiológica, no una enfermedad en sí misma. Ejemplo típico: anginas → ganglios del cuello inflamados. Cuando la infección remite, los ganglios vuelven a su tamaño normal.',
    color: '#f39c12',
  },
  {
    icono: '🧓',
    nombre: 'Inmunodeficiencia por timo atrofiado',
    descripcion: 'En adultos mayores el timo apenas funciona, reduciendo la capacidad de generar nuevos linfocitos T.',
    mecanismo: 'Esto hace que las vacunas sean menos eficaces en personas mayores y que el sistema inmune responda peor ante patógenos nuevos (como nuevas variantes de virus). Es una de las razones del mayor riesgo infeccioso en la tercera edad.',
    color: '#7FB3D3',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Funciones del sistema linfático
// ─────────────────────────────────────────────

function SeccionFunciones() {
  const [funcionActiva, setFuncionActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema linfático es una <strong>red de vasos y ganglios</strong> que recorre todo el cuerpo en paralelo al sistema circulatorio. A menudo se le olvida, pero cumple tres funciones vitales.</p>
      </div>

      <div className={styles.funcionesGrid}>
        {FUNCIONES.map(f => (
          <div
            key={f.titulo}
            className={`${styles.funcionCard} ${funcionActiva === f.titulo ? styles.funcionCardActiva : ''}`}
            style={{ borderTopColor: f.color }}
            onClick={() => setFuncionActiva(funcionActiva === f.titulo ? null : f.titulo)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFuncionActiva(funcionActiva === f.titulo ? null : f.titulo); } }}
            tabIndex={0}
            role="button"
            aria-expanded={funcionActiva === f.titulo}
            aria-label={`Ver detalles de ${f.titulo}`}
          >
            <div className={styles.funcionHeader}>
              <span className={styles.funcionIcono} aria-hidden="true">{f.icono}</span>
              <h3 className={styles.funcionTitulo} style={{ color: f.color }}>{f.titulo}</h3>
            </div>
            <p className={styles.funcionDesc}>{f.descripcion}</p>
            {funcionActiva === f.titulo && (
              <p className={styles.funcionDetalle}>{f.detalle}</p>
            )}
            <span className={styles.funcionToggle} aria-hidden="true">
              {funcionActiva === f.titulo ? '▲ Menos' : '▼ Más'}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoDestacadoIcono} aria-hidden="true">🫀</span>
        <div>
          <strong>Dato clave:</strong> El sistema linfático NO tiene bomba propia. A diferencia del corazón,
          no tiene un órgano que impulse la linfa. El ejercicio físico, la respiración profunda y el drenaje
          linfático manual son sus motores externos.
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Imagina el sistema linfático como el <strong>sistema de saneamiento</strong> del cuerpo: recoge los residuos
          y líquidos sobrantes, los filtra a través de "depuradoras" (los ganglios), y devuelve el agua limpia
          a la circulación. Sin él, los tejidos se inundarían en horas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Órganos linfáticos
// ─────────────────────────────────────────────

function SeccionOrganos() {
  const [organoActivo, setOrganoActivo] = useState<string>('ganglios');
  const organo = ORGANOS.find(o => o.id === organoActivo);

  const primarios = ORGANOS.filter(o => o.tipo === 'primario');
  const secundarios = ORGANOS.filter(o => o.tipo === 'secundario');

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los órganos linfáticos se dividen en <strong>primarios</strong> (donde maduran los linfocitos) y <strong>secundarios</strong> (donde se activan ante los antígenos).</p>
      </div>

      <div className={styles.organosCategoria}>
        <h3 className={styles.categoriaLabel}>
          <span className={styles.categoriaBadge} style={{ background: '#8e44ad' }}>Primarios</span>
          <span className={styles.categoriaDesc}>Donde maduran los linfocitos</span>
        </h3>
        <div className={styles.organosBtns}>
          {primarios.map(o => (
            <button
              key={o.id}
              type="button"
              className={`${styles.organoBtn} ${organoActivo === o.id ? styles.organoBtnActivo : ''}`}
              style={{ borderColor: organoActivo === o.id ? o.color : undefined }}
              onClick={() => setOrganoActivo(o.id)}
              aria-pressed={organoActivo === o.id}
            >
              <span aria-hidden="true">{o.icono}</span>
              <span>{o.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.organosCategoria}>
        <h3 className={styles.categoriaLabel}>
          <span className={styles.categoriaBadge} style={{ background: '#2E86AB' }}>Secundarios</span>
          <span className={styles.categoriaDesc}>Donde se activan los linfocitos</span>
        </h3>
        <div className={styles.organosBtns}>
          {secundarios.map(o => (
            <button
              key={o.id}
              type="button"
              className={`${styles.organoBtn} ${organoActivo === o.id ? styles.organoBtnActivo : ''}`}
              style={{ borderColor: organoActivo === o.id ? o.color : undefined }}
              onClick={() => setOrganoActivo(o.id)}
              aria-pressed={organoActivo === o.id}
            >
              <span aria-hidden="true">{o.icono}</span>
              <span>{o.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {organo && (
        <div className={styles.organoDetalle} style={{ borderLeftColor: organo.color }}>
          <div className={styles.organoDetalleHeader}>
            <span aria-hidden="true" className={styles.organoDetalleIcono}>{organo.icono}</span>
            <div>
              <h3 className={styles.organoNombre} style={{ color: organo.color }}>{organo.nombre}</h3>
              <span
                className={styles.organoTipoBadge}
                style={{ background: organo.tipo === 'primario' ? '#8e44ad' : '#2E86AB' }}
              >
                Órgano {organo.tipo}
              </span>
            </div>
          </div>

          <div className={styles.organoInfoGrid}>
            <div className={styles.organoInfoItem}>
              <span className={styles.organoInfoLabel}>📍 Ubicación</span>
              <span className={styles.organoInfoTexto}>{organo.ubicacion}</span>
            </div>
            <div className={styles.organoInfoItem}>
              <span className={styles.organoInfoLabel}>⚙️ Función</span>
              <span className={styles.organoInfoTexto}>{organo.funcion}</span>
            </div>
            <div className={styles.organoInfoItem}>
              <span className={styles.organoInfoLabel}>💡 Curiosidad</span>
              <span className={styles.organoInfoTexto}>{organo.curiosidad}</span>
            </div>
            <div className={styles.organoInfoItem}>
              <span className={styles.organoInfoLabel}>📊 Dato</span>
              <span className={styles.organoInfoTexto} style={{ color: organo.color, fontWeight: 700 }}>{organo.dato}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          La diferencia clave: los órganos <strong>primarios</strong> son escuelas (forman a los linfocitos),
          mientras que los <strong>secundarios</strong> son cuarteles (donde los linfocitos ya formados se
          despliegan para combatir infecciones). Sin los primarios, el sistema inmune no tendría soldados.
          Sin los secundarios, no tendría dónde organizarse para la batalla.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Flujo de la linfa
// ─────────────────────────────────────────────

function SeccionFlujo() {
  const [pasoActivo, setPasoActivo] = useState<number>(0);
  const paso = PASOS_FLUJO[pasoActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La linfa recorre un camino largo y silencioso antes de volver a la sangre. Sin bomba, sin prisa: el cuerpo en su ciclo continuo de limpieza.</p>
      </div>

      {/* Navegación de pasos */}
      <div className={styles.pasosNav}>
        {PASOS_FLUJO.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.pasoBtn} ${pasoActivo === i ? styles.pasoBtnActivo : ''}`}
            style={{ background: pasoActivo === i ? p.color : undefined, borderColor: pasoActivo === i ? p.color : undefined }}
            onClick={() => setPasoActivo(i)}
            aria-pressed={pasoActivo === i}
            aria-label={`Paso ${i + 1}: ${p.titulo}`}
          >
            <span className={styles.pasoBtnNum}>{p.num}</span>
            <span className={styles.pasoBtnTexto}>{p.titulo}</span>
          </button>
        ))}
      </div>

      {/* Detalle del paso */}
      <div className={styles.pasoDetalle} style={{ borderLeftColor: paso.color }}>
        <div className={styles.pasoDetalleHeader}>
          <span className={styles.pasoDetalleNum} style={{ background: paso.color }} aria-hidden="true">{paso.num}</span>
          <span className={styles.pasoDetalleIcono} aria-hidden="true">{paso.icono}</span>
          <h3 className={styles.pasoDetalleTitulo} style={{ color: paso.color }}>{paso.titulo}</h3>
        </div>
        <p className={styles.pasoDetalleDesc}>{paso.descripcion}</p>
      </div>

      {/* Diagrama de flujo lineal */}
      <div className={styles.flujoLineal}>
        {PASOS_FLUJO.map((p, i) => (
          <div key={i} className={styles.flujoNodo}>
            <div
              className={`${styles.flujoCirculo} ${pasoActivo === i ? styles.flujoCirculoActivo : ''}`}
              style={{ background: p.color }}
              onClick={() => setPasoActivo(i)}
              role="button"
              tabIndex={0}
              aria-label={`Ir al paso ${i + 1}: ${p.titulo}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPasoActivo(i); } }}
            >
              <span aria-hidden="true">{p.icono}</span>
            </div>
            <span className={styles.flujoLabel}>{p.titulo}</span>
            {i < PASOS_FLUJO.length - 1 && (
              <span className={styles.flujoFlecha} aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoDestacadoIcono} aria-hidden="true">⚡</span>
        <div>
          <strong>Sin corazón propio:</strong> a diferencia de la sangre, la linfa no tiene un órgano que la bombee.
          Depende del movimiento muscular, la respiración diafragmática y las válvulas antirretorno de los vasos
          linfáticos. El sedentarismo favorece la acumulación de linfa en los tejidos.
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El sistema linfático procesa <strong>~3 litros de linfa al día</strong>: el "excedente" de líquido
          que los tejidos no pueden retornar directamente a la sangre. Si estos 3 litros no se recogieran,
          el cuerpo sufriría un edema generalizado en menos de 24 horas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Cuando falla
// ─────────────────────────────────────────────

function SeccionFallos() {
  const [patologiaActiva, setPatologiaActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Comprender qué ocurre cuando el sistema linfático falla ayuda a entender mejor su función. Estas son las situaciones más frecuentes — con fines educativos.</p>
      </div>

      <div className={styles.patologiasGrid}>
        {PATOLOGIAS.map(p => (
          <div
            key={p.nombre}
            className={`${styles.patologiaCard} ${patologiaActiva === p.nombre ? styles.patologiaCardActiva : ''}`}
            style={{ borderLeftColor: p.color }}
            onClick={() => setPatologiaActiva(patologiaActiva === p.nombre ? null : p.nombre)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPatologiaActiva(patologiaActiva === p.nombre ? null : p.nombre); } }}
            tabIndex={0}
            role="button"
            aria-expanded={patologiaActiva === p.nombre}
            aria-label={`Ver información sobre ${p.nombre}`}
          >
            <div className={styles.patologiaHeader}>
              <span className={styles.patologiaIcono} aria-hidden="true">{p.icono}</span>
              <h3 className={styles.patologiaNombre} style={{ color: p.color }}>{p.nombre}</h3>
              <span className={styles.patologiaToggle} aria-hidden="true">
                {patologiaActiva === p.nombre ? '▲' : '▼'}
              </span>
            </div>
            <p className={styles.patologiaDesc}>{p.descripcion}</p>
            {patologiaActiva === p.nombre && (
              <div className={styles.patologiaMecanismo}>
                <strong>Mecanismo:</strong> {p.mecanismo}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.warningBox}>
        <strong>💡 Nota educativa:</strong> Este explicador describe mecanismos fisiológicos con fines divulgativos.
        Los ganglios inflamados son en la gran mayoría de casos una respuesta normal a una infección.
        Ante cualquier síntoma persistente, consulta siempre con un profesional sanitario.
      </div>

      <div className={styles.insight}>
        <p>
          El sistema linfático funciona en silencio la mayor parte del tiempo. Solo lo notamos cuando
          algo falla: un ganglio inflamado, un tobillo hinchado tras una lesión, o el cansancio extremo
          de una enfermedad grave. Que pase desapercibido es, en realidad, <strong>una señal de que funciona bien</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaLinfaticoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('funciones');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'funciones': return <SeccionFunciones />;
      case 'organos': return <SeccionOrganos />;
      case 'flujo': return <SeccionFlujo />;
      case 'fallos': return <SeccionFallos />;
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
          <h1 className={styles.title}>El Sistema Linfático</h1>
          <p className={styles.subtitle}>El Sistema Olvidado — Drenaje, inmunidad y equilibrio de fluidos en el cuerpo</p>
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
          title="Más sobre el sistema linfático"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>Tabla resumen de órganos linfáticos</h3>
          <table className={styles.tablaEducativa}>
            <thead>
              <tr>
                <th>Órgano</th>
                <th>Tipo</th>
                <th>Función principal</th>
                <th>Dato</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Médula ósea</td>
                <td>Primario</td>
                <td>Genera linfocitos B y células NK</td>
                <td>500 M células/día</td>
              </tr>
              <tr>
                <td>Timo</td>
                <td>Primario</td>
                <td>Maduración de linfocitos T</td>
                <td>2-5% de linfocitos T sobreviven</td>
              </tr>
              <tr>
                <td>Ganglios</td>
                <td>Secundario</td>
                <td>Filtrar linfa y activar linfocitos</td>
                <td>+600 en el cuerpo</td>
              </tr>
              <tr>
                <td>Bazo</td>
                <td>Secundario</td>
                <td>Filtrar sangre y destruir hematíes</td>
                <td>~150 g, el mayor órgano linfoide</td>
              </tr>
              <tr>
                <td>Amígdalas</td>
                <td>Secundario</td>
                <td>Primera defensa boca/nariz</td>
                <td>Única exposición directa al exterior</td>
              </tr>
              <tr>
                <td>Placas de Peyer</td>
                <td>Secundario</td>
                <td>Vigilar el intestino</td>
                <td>70% del sistema inmune en el intestino</td>
              </tr>
            </tbody>
          </table>

          <h3>¿Por qué se hinchan los ganglios cuando estoy enfermo?</h3>
          <p>
            Es una respuesta completamente normal. Cuando hay una infección, la linfa arrastra patógenos hasta
            los ganglios. Allí, los linfocitos los reconocen y <strong>se multiplican masivamente</strong> para
            combatirlos. Este aumento de células es lo que causa la inflamación del ganglio. Cuando la infección
            remite, el ganglio vuelve gradualmente a su tamaño normal.
          </p>

          <h3>¿El drenaje linfático manual funciona?</h3>
          <p>
            Sí, tiene evidencia en casos específicos. El drenaje linfático manual (DLM) es una técnica de
            masaje suave que estimula el movimiento de la linfa. Está indicado especialmente en el tratamiento
            del <strong>linfedema</strong> (por ejemplo, tras mastectomía). En personas sanas puede ayudar a
            reducir la retención de líquidos leve, pero no "elimina toxinas" como afirma la publicidad sin
            respaldo científico.
          </p>

          <h3>¿Qué es el linfedema?</h3>
          <p>
            El linfedema ocurre cuando los vasos linfáticos están dañados u obstruidos, y la linfa no puede
            drenar correctamente. El líquido se acumula en el tejido causando hinchazón crónica. Las causas
            más frecuentes en países desarrollados son: cirugía oncológica (extirpación de ganglios),
            radioterapia y, en menor medida, traumatismos. En países tropicales, la filariasis (parásitos)
            es la causa principal.
          </p>

          <h3>¿Por qué el timo se atrofia con la edad?</h3>
          <p>
            Es un proceso fisiológico llamado <strong>involución tímica</strong>. Después de la pubertad,
            el tejido activo del timo va siendo reemplazado por tejido graso. En adultos mayores, apenas
            queda tejido tímico funcional. Esto reduce la producción de nuevos linfocitos T, lo que
            explica en parte por qué las personas mayores responden peor a vacunas contra patógenos nuevos
            y son más vulnerables a ciertas infecciones.
          </p>

          <h3>¿La linfa y la sangre son lo mismo?</h3>
          <p>
            No, aunque están estrechamente relacionadas. La linfa es básicamente <strong>plasma sanguíneo filtrado</strong>:
            tiene una composición similar (agua, proteínas, glucosa, electrolitos) pero sin glóbulos rojos.
            Por eso es de color claro o amarillento, salvo la linfa intestinal (quilo), que es blanca lechosa
            por las grasas que transporta. La linfa termina desembocando en la sangre, cerrando el ciclo.
          </p>

          <h3>Los 5 pasos clave del recorrido de la linfa</h3>
          <ol>
            <li>Los capilares sanguíneos filtran ~20 L/día de plasma a los tejidos</li>
            <li>Solo ~17 L vuelven directamente por los capilares venosos</li>
            <li>Los ~3 L restantes son recogidos por los capilares linfáticos como "linfa"</li>
            <li>La linfa viaja por ganglios (inspección inmune) empujada por músculos y respiración</li>
            <li>Desemboca en la sangre por el conducto torácico (izquierdo) y el conducto linfático derecho</li>
          </ol>

          <h3>¿Para quién es útil esta información?</h3>
          <ul>
            <li><strong>Estudiantes de ciencias de la salud:</strong> visión clara de órganos, funciones y flujo antes de estudios más detallados</li>
            <li><strong>Personas que han experimentado ganglios inflamados:</strong> contexto para entender por qué es (generalmente) normal</li>
            <li><strong>Quienes conocen a alguien con linfoma o linfedema:</strong> entender el mecanismo biológico de su diagnóstico</li>
            <li><strong>Curiosidad general:</strong> uno de los sistemas corporales menos conocidos pero igualmente vital</li>
          </ul>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de anatomía y fisiología con fines educativos.
            Para decisiones sobre salud, síntomas persistentes o diagnósticos, consulta siempre con un profesional
            sanitario cualificado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-linfatico')} />
        <ShareCard appName="visualizador-sistema-linfatico" />
        <Footer appName="visualizador-sistema-linfatico" />
      </div>
    </>
  );
}
