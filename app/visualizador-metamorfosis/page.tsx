'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Metamorfosis.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'completa' | 'incompleta' | 'anfibio' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'completa', titulo: 'Completa', icono: '🦋', subtitulo: 'Holometábola — mariposa' },
  { id: 'incompleta', titulo: 'Incompleta', icono: '🦗', subtitulo: 'Hemimetábola — saltamontes' },
  { id: 'anfibio', titulo: 'Anfibio', icono: '🐸', subtitulo: 'De renacuajo a rana' },
  { id: 'datos', titulo: 'Datos', icono: '🔬', subtitulo: 'Curiosidades fascinantes' },
];

// ─── Metamorfosis Completa ───

interface FaseCompleta {
  id: string;
  nombre: string;
  icono: string;
  duracion: string;
  alimentacion: string;
  tamano: string;
  descripcion: string;
  detalle: string;
}

const FASES_COMPLETA: FaseCompleta[] = [
  {
    id: 'huevo',
    nombre: 'Huevo',
    icono: '🥚',
    duracion: '3-5 días',
    alimentacion: 'No se alimenta',
    tamano: '~1 mm',
    descripcion: 'La hembra deposita los huevos en el envés de hojas de algodoncillo (Asclepias). Cada huevo es diminuto, acanalado y blanquecino.',
    detalle: 'Una mariposa monarca puede poner entre 300 y 500 huevos en su vida, pero solo uno de cada cien llegará a adulto.',
  },
  {
    id: 'larva',
    nombre: 'Larva / Oruga',
    icono: '🐛',
    duracion: '~2 semanas',
    alimentacion: 'Hojas de algodoncillo',
    tamano: 'De 2 mm a 5 cm',
    descripcion: 'La oruga come sin parar y muda su exoesqueleto 4-5 veces (estadios). Acumula toxinas del algodoncillo que la protegen de depredadores.',
    detalle: 'Aumenta su peso corporal 3.000 veces en solo 2 semanas. Es la fase de crecimiento más explosiva del reino animal.',
  },
  {
    id: 'pupa',
    nombre: 'Pupa / Crisálida',
    icono: '🫘',
    duracion: '10-14 días',
    alimentacion: 'No se alimenta',
    tamano: '~3 cm',
    descripcion: 'La oruga se cuelga en forma de J y forma una crisálida verde jade con puntos dorados. Dentro, su cuerpo se disuelve casi por completo.',
    detalle: 'Las células imaginales (latentes desde el huevo) dirigen la reconstrucción total: alas, antenas, aparato reproductor, ojos compuestos.',
  },
  {
    id: 'adulto',
    nombre: 'Adulto / Imago',
    icono: '🦋',
    duracion: '2-6 semanas de vida',
    alimentacion: 'Néctar de flores',
    tamano: '~10 cm (envergadura)',
    descripcion: 'Emerge con alas húmedas que se despliegan y endurecen en 1-2 horas. Ahora tiene aparato reproductor funcional y puede volar miles de km.',
    detalle: 'La generación migratoria (otoño) vive 8-9 meses y viaja 4.000 km desde Canadá hasta los bosques de oyamel en México.',
  },
];

const OTROS_COMPLETA = [
  { nombre: 'Escarabajo', icono: '🪲', nota: 'Larva subterránea — come raíces' },
  { nombre: 'Mosca', icono: '🪰', nota: 'Larva (gusano) en materia orgánica' },
  { nombre: 'Abeja', icono: '🐝', nota: 'Larva alimentada por nodrizas' },
  { nombre: 'Hormiga', icono: '🐜', nota: 'Pupa en capullo de seda' },
];

// ─── Metamorfosis Incompleta ───

interface FaseIncompleta {
  id: string;
  nombre: string;
  icono: string;
  duracion: string;
  descripcion: string;
  detalle: string;
}

const FASES_INCOMPLETA: FaseIncompleta[] = [
  {
    id: 'huevo-i',
    nombre: 'Huevo',
    icono: '🥚',
    duracion: '2-4 semanas',
    descripcion: 'La hembra deposita los huevos en el suelo, agrupados en una masa espumosa protectora llamada ooteca.',
    detalle: 'Un saltamontes puede poner entre 20 y 100 huevos por ooteca, y varias ootecas en su vida.',
  },
  {
    id: 'ninfa',
    nombre: 'Ninfa',
    icono: '🦗',
    duracion: '5-6 mudas, 2-3 meses',
    descripcion: 'Parece un adulto en miniatura pero sin alas funcionales. Crece gradualmente, mudando 5-6 veces. Cada muda la acerca al adulto.',
    detalle: 'A diferencia de la metamorfosis completa, NO hay fase de pupa. El cambio es continuo y gradual.',
  },
  {
    id: 'adulto-i',
    nombre: 'Adulto',
    icono: '🦗',
    duracion: '2-3 meses de vida',
    descripcion: 'Tras la última muda, desarrolla alas funcionales y capacidad reproductiva. Morfología similar a la ninfa pero con alas y madurez sexual.',
    detalle: 'El saltamontes adulto puede saltar 20 veces su longitud corporal — equivalente a un humano saltando 40 metros.',
  },
];

const OTROS_INCOMPLETA = [
  { nombre: 'Libélula', icono: '🪻', nota: 'Ninfa acuática y depredadora' },
  { nombre: 'Cucaracha', icono: '🪳', nota: 'Ninfa idéntica al adulto sin alas' },
  { nombre: 'Chinche', icono: '🐞', nota: 'Ninfa con aparato bucal picador' },
  { nombre: 'Grillo', icono: '🦗', nota: 'Ninfa sin alas ni canto' },
];

// ─── Metamorfosis Anfibio ───

interface FaseAnfibio {
  id: string;
  nombre: string;
  icono: string;
  duracion: string;
  respiracion: string;
  locomocion: string;
  alimentacion: string;
  descripcion: string;
  detalle: string;
}

const FASES_ANFIBIO: FaseAnfibio[] = [
  {
    id: 'huevo-a',
    nombre: 'Huevo / Puesta',
    icono: '🫧',
    duracion: '1-3 semanas',
    respiracion: 'Difusión',
    locomocion: 'Inmóvil',
    alimentacion: 'Vitelo interno',
    descripcion: 'La hembra deposita cientos a miles de huevos gelatinosos en el agua. La gelatina protege del frío, infecciones y depredadores.',
    detalle: 'Algunas especies ponen 20.000 huevos de una vez. La tasa de supervivencia es muy baja: menos del 1%.',
  },
  {
    id: 'renacuajo-temprano',
    nombre: 'Renacuajo temprano',
    icono: '🐟',
    duracion: '2-4 semanas',
    respiracion: 'Branquias externas',
    locomocion: 'Nada con cola',
    alimentacion: 'Herbívoro (algas)',
    descripcion: 'Tiene branquias externas visibles, cola larga y boca pequeña. Se alimenta raspando algas de las rocas.',
    detalle: 'En esta fase es esencialmente un pez: respira bajo el agua y no tiene patas.',
  },
  {
    id: 'renacuajo-tardio',
    nombre: 'Renacuajo tardío',
    icono: '🦎',
    duracion: '4-8 semanas',
    respiracion: 'Branquias internas',
    locomocion: 'Nada + patas traseras',
    alimentacion: 'Omnívoro',
    descripcion: 'Las branquias se internalizan. Aparecen las patas traseras. La dieta se diversifica. Comienza una transformación profunda.',
    detalle: 'Las patas traseras aparecen primero porque se desarrollan internamente antes de emerger.',
  },
  {
    id: 'metamorfosis-a',
    nombre: 'Metamorfosis activa',
    icono: '🔄',
    duracion: '1-2 semanas',
    respiracion: 'Branquias → Pulmones',
    locomocion: 'Patas + cola reduciéndose',
    alimentacion: 'Deja de comer',
    descripcion: 'Fase crítica: aparecen patas delanteras, la cola se reabsorbe, las branquias se cierran y los pulmones se activan. La boca se ensancha.',
    detalle: 'La cola no se cae — es reabsorbida por el propio cuerpo mediante apoptosis (muerte celular programada). Las proteínas se reciclan.',
  },
  {
    id: 'adulto-a',
    nombre: 'Adulto',
    icono: '🐸',
    duracion: '5-10 años',
    respiracion: 'Pulmonar + cutánea',
    locomocion: 'Salta + nada',
    alimentacion: 'Carnívoro (insectos)',
    descripcion: 'Terrestre o semiacuático. Respira por pulmones y piel. Lengua pegajosa para cazar insectos. Capacidad reproductiva completa.',
    detalle: 'Algunas ranas vuelven al mismo estanque donde nacieron para reproducirse, guiadas por el olor del agua.',
  },
];

// ─── Datos Fascinantes ───

interface DatoFascinante {
  icono: string;
  titulo: string;
  texto: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  {
    icono: '🐛',
    titulo: 'Peso x3.000',
    texto: 'Una oruga de mariposa monarca aumenta su peso 3.000 veces en 2 semanas.',
    detalle: 'Equivalente a un bebé humano que pesara 10 toneladas al cabo de 14 días.',
  },
  {
    icono: '🦋',
    titulo: 'Vuelo térmico',
    texto: 'Las mariposas no pueden volar si su temperatura corporal es menor a 30 °C.',
    detalle: 'Por eso las ves «tomando el sol» con las alas abiertas: necesitan calentarse antes de despegar.',
  },
  {
    icono: '🪲',
    titulo: '80% completa',
    texto: 'El 80% de los insectos tienen metamorfosis completa (holometábola).',
    detalle: 'La metamorfosis completa es una ventaja evolutiva: larva y adulto no compiten por los mismos recursos.',
  },
  {
    icono: '🐸',
    titulo: '6 semanas a 3 años',
    texto: 'Algunas ranas completan la metamorfosis en 6 semanas, otras en 3 años.',
    detalle: 'La rana toro americana (Lithobates catesbeianus) puede pasar hasta 3 años como renacuajo en climas fríos.',
  },
  {
    icono: '🦎',
    titulo: 'Neotenia',
    texto: 'Los axolotes son anfibios que NO completan la metamorfosis (neotenia).',
    detalle: 'Conservan branquias externas y viven permanentemente en el agua. Si se les inyecta hormona tiroidea, metamorfosean.',
  },
  {
    icono: '🐝',
    titulo: 'Jalea real',
    texto: 'La abeja reina es genéticamente idéntica a las obreras — la dieta cambia todo.',
    detalle: 'La jalea real activa genes que producen una larva un 60% más grande, fértil y con una esperanza de vida 40 veces mayor.',
  },
  {
    icono: '🦞',
    titulo: '11 fases',
    texto: 'Las larvas de langosta pasan por 11 fases antes de parecer una langosta.',
    detalle: 'Las primeras larvas son transparentes y planctónicas — ni remotamente parecidas al adulto con pinzas.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function MetamorfosisPage() {
  const [seccion, setSeccion] = useState<Seccion>('completa');
  const [faseCompleta, setFaseCompleta] = useState(0);
  const [faseIncompleta, setFaseIncompleta] = useState(0);
  const [faseAnfibio, setFaseAnfibio] = useState(0);
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  const seccionActual = SECCIONES.find(s => s.id === seccion)!;

  // ─── Navegación de fases ───

  const avanzarCompleta = () => setFaseCompleta(f => Math.min(f + 1, FASES_COMPLETA.length - 1));
  const retrocederCompleta = () => setFaseCompleta(f => Math.max(f - 1, 0));

  const avanzarIncompleta = () => setFaseIncompleta(f => Math.min(f + 1, FASES_INCOMPLETA.length - 1));
  const retrocederIncompleta = () => setFaseIncompleta(f => Math.max(f - 1, 0));

  const avanzarAnfibio = () => setFaseAnfibio(f => Math.min(f + 1, FASES_ANFIBIO.length - 1));
  const retrocederAnfibio = () => setFaseAnfibio(f => Math.max(f - 1, 0));

  // ─── Renders de sección ───

  const renderCompleta = () => {
    const fase = FASES_COMPLETA[faseCompleta];
    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <strong>Ejemplo:</strong> Mariposa monarca (<em>Danaus plexippus</em>) — 4 fases con transformación radical
        </p>

        {/* Barra de progreso visual */}
        <div className={styles.progreso}>
          {FASES_COMPLETA.map((f, i) => (
            <button
              key={f.id}
              className={`${styles.progresoFase} ${i === faseCompleta ? styles.progresoActivo : ''} ${i < faseCompleta ? styles.progresoCompletado : ''}`}
              onClick={() => setFaseCompleta(i)}
              aria-label={`Ir a fase ${f.nombre}`}
              aria-pressed={i === faseCompleta}
            >
              <span className={styles.progresoIcono}>{f.icono}</span>
              <span className={styles.progresoNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>

        {/* Fase activa con animación */}
        <div className={styles.faseCard} key={fase.id}>
          <div className={styles.faseHeader}>
            <span className={styles.faseIconoGrande}>{fase.icono}</span>
            <div>
              <h3 className={styles.faseTitulo}>{fase.nombre}</h3>
              <span className={styles.faseDuracion}>{fase.duracion}</span>
            </div>
          </div>
          <p className={styles.faseDesc}>{fase.descripcion}</p>

          <div className={styles.faseDatos}>
            <div className={styles.faseDato}>
              <span className={styles.faseDatoLabel}>Duración</span>
              <span className={styles.faseDatoValor}>{fase.duracion}</span>
            </div>
            <div className={styles.faseDato}>
              <span className={styles.faseDatoLabel}>Alimentación</span>
              <span className={styles.faseDatoValor}>{fase.alimentacion}</span>
            </div>
            <div className={styles.faseDato}>
              <span className={styles.faseDatoLabel}>Tamaño</span>
              <span className={styles.faseDatoValor}>{fase.tamano}</span>
            </div>
          </div>

          <div className={styles.faseDetalle}>
            <p>{fase.detalle}</p>
          </div>
        </div>

        {/* Botones avanzar/retroceder */}
        <div className={styles.navegacion}>
          <button
            className={styles.btnNav}
            onClick={retrocederCompleta}
            disabled={faseCompleta === 0}
            aria-label="Fase anterior"
          >
            ← Anterior
          </button>
          <span className={styles.navContador}>{faseCompleta + 1} / {FASES_COMPLETA.length}</span>
          <button
            className={styles.btnNav}
            onClick={avanzarCompleta}
            disabled={faseCompleta === FASES_COMPLETA.length - 1}
            aria-label="Fase siguiente"
          >
            Siguiente →
          </button>
        </div>

        <div className={styles.insight}>
          <p>💡 <strong>Insight:</strong> Dentro de la crisálida, la oruga se disuelve casi por completo y se reconstruye a partir de células imaginales latentes desde la fase de huevo.</p>
        </div>

        {/* Otros ejemplos */}
        <div className={styles.otrosCard}>
          <h4 className={styles.otrosTitulo}>Otros insectos con metamorfosis completa</h4>
          <div className={styles.otrosGrid}>
            {OTROS_COMPLETA.map(o => (
              <div key={o.nombre} className={styles.otroItem}>
                <span className={styles.otroIcono}>{o.icono}</span>
                <span className={styles.otroNombre}>{o.nombre}</span>
                <span className={styles.otroNota}>{o.nota}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderIncompleta = () => {
    const fase = FASES_INCOMPLETA[faseIncompleta];
    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <strong>Ejemplo:</strong> Saltamontes — 3 fases con cambio gradual (sin pupa)
        </p>

        <div className={styles.progreso}>
          {FASES_INCOMPLETA.map((f, i) => (
            <button
              key={f.id}
              className={`${styles.progresoFase} ${i === faseIncompleta ? styles.progresoActivo : ''} ${i < faseIncompleta ? styles.progresoCompletado : ''}`}
              onClick={() => setFaseIncompleta(i)}
              aria-label={`Ir a fase ${f.nombre}`}
              aria-pressed={i === faseIncompleta}
            >
              <span className={styles.progresoIcono}>{f.icono}</span>
              <span className={styles.progresoNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>

        <div className={styles.faseCard} key={fase.id}>
          <div className={styles.faseHeader}>
            <span className={styles.faseIconoGrande}>{fase.icono}</span>
            <div>
              <h3 className={styles.faseTitulo}>{fase.nombre}</h3>
              <span className={styles.faseDuracion}>{fase.duracion}</span>
            </div>
          </div>
          <p className={styles.faseDesc}>{fase.descripcion}</p>
          <div className={styles.faseDetalle}>
            <p>{fase.detalle}</p>
          </div>
        </div>

        <div className={styles.navegacion}>
          <button className={styles.btnNav} onClick={retrocederIncompleta} disabled={faseIncompleta === 0} aria-label="Fase anterior">← Anterior</button>
          <span className={styles.navContador}>{faseIncompleta + 1} / {FASES_INCOMPLETA.length}</span>
          <button className={styles.btnNav} onClick={avanzarIncompleta} disabled={faseIncompleta === FASES_INCOMPLETA.length - 1} aria-label="Fase siguiente">Siguiente →</button>
        </div>

        {/* Comparativa visual */}
        <div className={styles.comparativaCard}>
          <h4 className={styles.comparativaTitulo}>Completa vs Incompleta</h4>
          <div className={styles.comparativaGrid}>
            <div className={styles.comparativaCol}>
              <span className={styles.comparativaColTitulo}>🦋 Completa</span>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Fases</span><span className={styles.comparativaValor}>4 (huevo→larva→pupa→adulto)</span></div>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Cambio</span><span className={styles.comparativaValor}>Radical (disolución total)</span></div>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Pupa</span><span className={styles.comparativaValor}>Sí (inmovilidad)</span></div>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Larva vs adulto</span><span className={styles.comparativaValor}>Muy diferentes</span></div>
            </div>
            <div className={styles.comparativaCol}>
              <span className={styles.comparativaColTitulo}>🦗 Incompleta</span>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Fases</span><span className={styles.comparativaValor}>3 (huevo→ninfa→adulto)</span></div>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Cambio</span><span className={styles.comparativaValor}>Gradual (mudas sucesivas)</span></div>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Pupa</span><span className={styles.comparativaValor}>No</span></div>
              <div className={styles.comparativaFila}><span className={styles.comparativaLabel}>Ninfa vs adulto</span><span className={styles.comparativaValor}>Muy similares</span></div>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>💡 <strong>Insight:</strong> La ninfa de libélula es acuática y depredadora — muy diferente del adulto volador. Es uno de los casos más extremos de metamorfosis incompleta.</p>
        </div>

        <div className={styles.otrosCard}>
          <h4 className={styles.otrosTitulo}>Otros insectos con metamorfosis incompleta</h4>
          <div className={styles.otrosGrid}>
            {OTROS_INCOMPLETA.map(o => (
              <div key={o.nombre} className={styles.otroItem}>
                <span className={styles.otroIcono}>{o.icono}</span>
                <span className={styles.otroNombre}>{o.nombre}</span>
                <span className={styles.otroNota}>{o.nota}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAnfibio = () => {
    const fase = FASES_ANFIBIO[faseAnfibio];
    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <strong>Ejemplo:</strong> Rana común — 5 fases con cambios fisiológicos profundos
        </p>

        <div className={styles.progreso}>
          {FASES_ANFIBIO.map((f, i) => (
            <button
              key={f.id}
              className={`${styles.progresoFase} ${i === faseAnfibio ? styles.progresoActivo : ''} ${i < faseAnfibio ? styles.progresoCompletado : ''}`}
              onClick={() => setFaseAnfibio(i)}
              aria-label={`Ir a fase ${f.nombre}`}
              aria-pressed={i === faseAnfibio}
            >
              <span className={styles.progresoIcono}>{f.icono}</span>
              <span className={styles.progresoNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>

        <div className={styles.faseCard} key={fase.id}>
          <div className={styles.faseHeader}>
            <span className={styles.faseIconoGrande}>{fase.icono}</span>
            <div>
              <h3 className={styles.faseTitulo}>{fase.nombre}</h3>
              <span className={styles.faseDuracion}>{fase.duracion}</span>
            </div>
          </div>
          <p className={styles.faseDesc}>{fase.descripcion}</p>

          {/* Tabla de cambios fisiológicos */}
          <div className={styles.faseDatos}>
            <div className={styles.faseDato}>
              <span className={styles.faseDatoLabel}>Respiración</span>
              <span className={styles.faseDatoValor}>{fase.respiracion}</span>
            </div>
            <div className={styles.faseDato}>
              <span className={styles.faseDatoLabel}>Locomoción</span>
              <span className={styles.faseDatoValor}>{fase.locomocion}</span>
            </div>
            <div className={styles.faseDato}>
              <span className={styles.faseDatoLabel}>Alimentación</span>
              <span className={styles.faseDatoValor}>{fase.alimentacion}</span>
            </div>
          </div>

          <div className={styles.faseDetalle}>
            <p>{fase.detalle}</p>
          </div>
        </div>

        <div className={styles.navegacion}>
          <button className={styles.btnNav} onClick={retrocederAnfibio} disabled={faseAnfibio === 0} aria-label="Fase anterior">← Anterior</button>
          <span className={styles.navContador}>{faseAnfibio + 1} / {FASES_ANFIBIO.length}</span>
          <button className={styles.btnNav} onClick={avanzarAnfibio} disabled={faseAnfibio === FASES_ANFIBIO.length - 1} aria-label="Fase siguiente">Siguiente →</button>
        </div>

        {/* Tabla resumen de cambios */}
        <div className={styles.tablaCard}>
          <h4 className={styles.tablaTitulo}>Transformación completa: renacuajo vs adulto</h4>
          <div className={styles.tablaGrid}>
            <div className={styles.tablaHeader}>
              <span>Sistema</span>
              <span>Renacuajo</span>
              <span>Adulto</span>
            </div>
            <div className={styles.tablaFila}>
              <span className={styles.tablaLabel}>Respiración</span>
              <span className={styles.tablaValor}>Branquias</span>
              <span className={styles.tablaValor}>Pulmones + piel</span>
            </div>
            <div className={styles.tablaFila}>
              <span className={styles.tablaLabel}>Locomoción</span>
              <span className={styles.tablaValor}>Nada (cola)</span>
              <span className={styles.tablaValor}>Salta + nada (patas)</span>
            </div>
            <div className={styles.tablaFila}>
              <span className={styles.tablaLabel}>Alimentación</span>
              <span className={styles.tablaValor}>Herbívoro (algas)</span>
              <span className={styles.tablaValor}>Carnívoro (insectos)</span>
            </div>
            <div className={styles.tablaFila}>
              <span className={styles.tablaLabel}>Hábitat</span>
              <span className={styles.tablaValor}>Acuático</span>
              <span className={styles.tablaValor}>Terrestre / semiacuático</span>
            </div>
            <div className={styles.tablaFila}>
              <span className={styles.tablaLabel}>Cola</span>
              <span className={styles.tablaValor}>Larga, para nadar</span>
              <span className={styles.tablaValor}>Reabsorbida (apoptosis)</span>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>💡 <strong>Insight:</strong> La cola del renacuajo no se cae — es reabsorbida por su propio cuerpo mediante apoptosis (muerte celular programada). Las proteínas se reciclan para construir las patas.</p>
        </div>
      </div>
    );
  };

  const renderDatos = () => (
    <div className={styles.seccionContent}>
      <p className={styles.contexto}>
        Datos sorprendentes sobre la metamorfosis en el reino animal. Toca cada tarjeta para saber más.
      </p>

      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((dato, i) => (
          <button
            key={i}
            className={`${styles.datoCard} ${datoActivo === i ? styles.datoCardActivo : ''}`}
            onClick={() => setDatoActivo(datoActivo === i ? null : i)}
            aria-pressed={datoActivo === i}
          >
            <span className={styles.datoIcono}>{dato.icono}</span>
            <span className={styles.datoTitulo}>{dato.titulo}</span>
            <span className={styles.datoTexto}>{dato.texto}</span>
            {datoActivo === i && (
              <span className={styles.datoDetalle}>{dato.detalle}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>💡 <strong>¿Por qué existe la metamorfosis?</strong> Reduce la competencia entre larva y adulto por los mismos recursos. La larva y el adulto ocupan nichos ecológicos diferentes: distinto alimento, distinto hábitat, distinto comportamiento. Es una ventaja evolutiva enorme.</p>
      </div>
    </div>
  );

  const renderSeccion = () => {
    switch (seccion) {
      case 'completa': return renderCompleta();
      case 'incompleta': return renderIncompleta();
      case 'anfibio': return renderAnfibio();
      case 'datos': return renderDatos();
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🦋 Metamorfosis Animal</h1>
          <p className={styles.subtitle}>La transformación más radical de la naturaleza, paso a paso</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones}>
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono}>{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Header de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>{seccionActual.icono} {seccionActual.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{seccionActual.subtitulo}</p>
        </div>

        {/* Contenido de sección */}
        {renderSeccion()}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres aprender más sobre metamorfosis?"
          subtitle="Conceptos clave de biología animal"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es la metamorfosis?</h2>
            <p>
              La metamorfosis es un proceso biológico por el cual un animal experimenta cambios
              estructurales profundos después de nacer o eclosionar. No es solo crecer: es
              transformarse en un organismo con forma, función y comportamiento radicalmente diferentes.
            </p>

            <h2>Tipos principales</h2>
            <p>
              <strong>Metamorfosis completa (holometábola):</strong> 4 fases — huevo, larva, pupa y
              adulto. La larva es completamente diferente del adulto. Presente en el 80% de los insectos:
              mariposas, escarabajos, moscas, abejas y hormigas.
            </p>
            <p>
              <strong>Metamorfosis incompleta (hemimetábola):</strong> 3 fases — huevo, ninfa y adulto.
              La ninfa se parece al adulto pero sin alas. Presente en saltamontes, libélulas, cucarachas
              y chinches.
            </p>
            <p>
              <strong>Metamorfosis anfibio:</strong> Transición de vida acuática a terrestre con cambios
              en respiración (branquias a pulmones), locomoción (cola a patas) y dieta (herbívoro a
              carnívoro). Ranas, sapos y salamandras.
            </p>

            <h2>Control hormonal</h2>
            <p>
              La metamorfosis está controlada por hormonas. En insectos, la <strong>ecdisona</strong> desencadena
              la muda y la <strong>hormona juvenil</strong> determina si el resultado es otra larva o un adulto.
              En anfibios, la <strong>hormona tiroidea</strong> (T3/T4) controla toda la transformación.
            </p>

            <h2>Ventaja evolutiva</h2>
            <p>
              La metamorfosis reduce la competencia entre fases juveniles y adultas del mismo organismo.
              La oruga come hojas; la mariposa bebe néctar. El renacuajo come algas; la rana caza insectos.
              Al ocupar nichos diferentes, la especie aprovecha más recursos disponibles.
            </p>

            <div className={styles.warningBox}>
              <strong>Nota educativa:</strong> Los datos de duración y comportamiento mostrados son valores
              típicos que varían según la especie, el clima y las condiciones del hábitat. La biología
              real es más diversa y compleja de lo que cualquier esquema simplificado puede mostrar.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-metamorfosis')} />
        <ShareCard appName="visualizador-metamorfosis" />
        <Footer appName="visualizador-metamorfosis" />
    </div>
  );
}
