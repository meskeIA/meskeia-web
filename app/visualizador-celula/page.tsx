'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Celula.module.css';
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

type Seccion = 'animal' | 'vegetal' | 'comparativa' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'animal', titulo: 'Célula Animal', icono: '🔬', subtitulo: 'Orgánulos de la célula animal' },
  { id: 'vegetal', titulo: 'Célula Vegetal', icono: '🌿', subtitulo: 'Orgánulos de la célula vegetal' },
  { id: 'comparativa', titulo: 'Comparativa', icono: '⚖️', subtitulo: 'Animal vs Vegetal lado a lado' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '💡', subtitulo: 'Curiosidades sobre las células' },
];

// ─────────────────────────────────────────────
// Datos orgánulos
// ─────────────────────────────────────────────

interface Organulo {
  id: string;
  nombre: string;
  color: string;
  funcion: string;
  tamano: string;
  dato: string;
  top: string;
  left: string;
  width: string;
  height: string;
  borderRadius: string;
}

const ORGANULOS_ANIMAL: Organulo[] = [
  {
    id: 'nucleo', nombre: 'Núcleo', color: '#8B5CF6',
    funcion: 'Centro de control: contiene el ADN y dirige todas las actividades celulares. Aquí se replica el material genético.',
    tamano: '~5-10 μm de diámetro',
    dato: 'Si estiraras todo el ADN de una sola célula, mediría unos 2 metros.',
    top: '35%', left: '38%', width: '24%', height: '30%', borderRadius: '50%',
  },
  {
    id: 'mitocondria', nombre: 'Mitocondria', color: '#E74C3C',
    funcion: 'Central energética: produce ATP mediante respiración celular. Convierte glucosa y oxígeno en energía utilizable.',
    tamano: '~1-10 μm de largo',
    dato: 'Tiene su propio ADN y se hereda solo de la madre. Se cree que fue una bacteria independiente.',
    top: '20%', left: '12%', width: '18%', height: '12%', borderRadius: '40%',
  },
  {
    id: 'ribosomas', nombre: 'Ribosomas', color: '#F59E0B',
    funcion: 'Fábricas de proteínas: traducen el ARN mensajero para ensamblar aminoácidos en proteínas.',
    tamano: '~20-30 nm',
    dato: 'Una célula puede tener millones de ribosomas. Sin ellos, no se podría fabricar ninguna proteína.',
    top: '60%', left: '15%', width: '8%', height: '8%', borderRadius: '50%',
  },
  {
    id: 're-rugoso', nombre: 'RE Rugoso', color: '#3498DB',
    funcion: 'Red de membranas con ribosomas adheridos. Sintetiza y transporta proteínas destinadas a la membrana o exportación.',
    tamano: 'Red extensa en el citoplasma',
    dato: 'Se llama "rugoso" por los ribosomas pegados a su superficie. Es como una fábrica con cintas transportadoras.',
    top: '18%', left: '62%', width: '22%', height: '18%', borderRadius: '8px',
  },
  {
    id: 're-liso', nombre: 'RE Liso', color: '#2196F3',
    funcion: 'Sin ribosomas: sintetiza lípidos, almacena calcio y detoxifica sustancias. Importante en células hepáticas.',
    tamano: 'Red tubular en el citoplasma',
    dato: 'En las células del hígado, el RE liso detoxifica alcohol y fármacos. Por eso el hígado es tan importante.',
    top: '68%', left: '58%', width: '20%', height: '14%', borderRadius: '8px',
  },
  {
    id: 'golgi', nombre: 'Aparato de Golgi', color: '#27AE60',
    funcion: 'Centro de empaquetado y distribución: modifica, etiqueta y envía proteínas a su destino correcto dentro o fuera de la célula.',
    tamano: '~1-3 μm',
    dato: 'Funciona como una oficina de correos: recibe, empaqueta y envía. Procesa unas 300 vesículas por minuto.',
    top: '55%', left: '35%', width: '20%', height: '14%', borderRadius: '4px',
  },
  {
    id: 'lisosomas', nombre: 'Lisosomas', color: '#E67E22',
    funcion: 'Sistema de reciclaje: contienen enzimas que digieren materiales de desecho, bacterias y orgánulos dañados.',
    tamano: '~0,1-1,2 μm',
    dato: 'Si se rompieran todos los lisosomas a la vez, la célula se autodigestiría. Tienen un pH muy ácido (4,5-5).',
    top: '42%', left: '68%', width: '10%', height: '10%', borderRadius: '50%',
  },
  {
    id: 'centriolos', nombre: 'Centriolos', color: '#9B59B6',
    funcion: 'Organizan la división celular: forman el huso mitótico que separa los cromosomas durante la mitosis.',
    tamano: '~0,2 μm × 0,5 μm',
    dato: 'Solo están en células animales. Forman una estructura en "L" llamada centrosoma.',
    top: '25%', left: '30%', width: '8%', height: '8%', borderRadius: '2px',
  },
  {
    id: 'membrana', nombre: 'Membrana plasmática', color: '#1ABC9C',
    funcion: 'Barrera selectiva: controla qué entra y sale de la célula. Formada por una bicapa de fosfolípidos.',
    tamano: '~7-8 nm de grosor',
    dato: 'Es tan fina que mil membranas apiladas no llegarían al grosor de una hoja de papel.',
    top: '0%', left: '0%', width: '100%', height: '100%', borderRadius: '50% 48% 52% 46% / 50% 52% 48% 50%',
  },
  {
    id: 'citoplasma', nombre: 'Citoplasma', color: '#95A5A6',
    funcion: 'Medio gelatinoso que llena la célula. Contiene agua, sales, enzimas y moléculas orgánicas. Soporte para los orgánulos.',
    tamano: 'Ocupa todo el interior celular',
    dato: 'Está en constante movimiento (ciclosis). Las moléculas no "flotan" estáticas, sino que se mueven activamente.',
    top: '75%', left: '25%', width: '15%', height: '10%', borderRadius: '30%',
  },
];

const ORGANULOS_VEGETAL: Organulo[] = [
  {
    id: 'pared', nombre: 'Pared celular', color: '#8D6E63',
    funcion: 'Estructura rígida de celulosa que rodea la membrana. Da forma fija, soporte mecánico y protección contra presión osmótica.',
    tamano: '~0,1-10 μm de grosor',
    dato: 'La celulosa de la pared celular es el compuesto orgánico más abundante de la Tierra.',
    top: '0%', left: '0%', width: '100%', height: '100%', borderRadius: '8px',
  },
  {
    id: 'nucleo-v', nombre: 'Núcleo', color: '#8B5CF6',
    funcion: 'Centro de control con ADN. Igual que en la célula animal, dirige la síntesis de proteínas y la división celular.',
    tamano: '~5-10 μm',
    dato: 'Suele estar desplazado hacia un lado porque la vacuola central ocupa la mayor parte del espacio.',
    top: '20%', left: '15%', width: '20%', height: '22%', borderRadius: '50%',
  },
  {
    id: 'cloroplasto', nombre: 'Cloroplastos', color: '#27AE60',
    funcion: 'Realizan la fotosíntesis: convierten luz solar, CO₂ y agua en glucosa y oxígeno. Contienen clorofila.',
    tamano: '~3-10 μm',
    dato: 'Como la mitocondria, tienen ADN propio. Se cree que también fueron bacterias independientes (cianobacterias).',
    top: '55%', left: '10%', width: '18%', height: '14%', borderRadius: '40%',
  },
  {
    id: 'vacuola', nombre: 'Vacuola central', color: '#42A5F5',
    funcion: 'Gran compartimento lleno de agua: almacena nutrientes, pigmentos y desechos. Mantiene la presión de turgencia.',
    tamano: 'Puede ocupar hasta el 90% del volumen celular',
    dato: 'Cuando la vacuola pierde agua, la planta se marchita. Es literalmente lo que mantiene erguida a la planta.',
    top: '28%', left: '38%', width: '45%', height: '50%', borderRadius: '45%',
  },
  {
    id: 'mitocondria-v', nombre: 'Mitocondria', color: '#E74C3C',
    funcion: 'Central energética, igual que en la célula animal. Las plantas también necesitan ATP para sus procesos.',
    tamano: '~1-10 μm',
    dato: 'Las plantas hacen fotosíntesis Y respiración celular. De noche, sin luz, dependen solo de las mitocondrias.',
    top: '15%', left: '65%', width: '16%', height: '10%', borderRadius: '40%',
  },
  {
    id: 'golgi-v', nombre: 'Aparato de Golgi', color: '#FF9800',
    funcion: 'Modifica y distribuye proteínas y lípidos. En células vegetales, también produce materiales para la pared celular.',
    tamano: '~1-3 μm',
    dato: 'En células vegetales se llaman "dictiosomas". Pueden tener cientos de ellos, más que las células animales.',
    top: '72%', left: '55%', width: '18%', height: '12%', borderRadius: '4px',
  },
  {
    id: 're-v', nombre: 'Retículo Endoplasmático', color: '#3498DB',
    funcion: 'Red de membranas para transporte y síntesis. Conecta el núcleo con la membrana plasmática.',
    tamano: 'Red extensa',
    dato: 'En células vegetales, el RE tiene conexiones especiales llamadas plasmodesmos que comunican células vecinas.',
    top: '45%', left: '12%', width: '20%', height: '12%', borderRadius: '8px',
  },
  {
    id: 'ribosomas-v', nombre: 'Ribosomas', color: '#F59E0B',
    funcion: 'Sintetizan proteínas traduciendo el ARN mensajero, igual que en la célula animal.',
    tamano: '~20-30 nm',
    dato: 'Los ribosomas de cloroplastos y mitocondrias son más parecidos a los de bacterias que a los del citoplasma.',
    top: '78%', left: '30%', width: '8%', height: '8%', borderRadius: '50%',
  },
  {
    id: 'membrana-v', nombre: 'Membrana plasmática', color: '#1ABC9C',
    funcion: 'Igual que en la animal: bicapa de fosfolípidos que controla el transporte de sustancias.',
    tamano: '~7-8 nm',
    dato: 'En células vegetales está pegada a la pared celular. Juntas forman una doble barrera de protección.',
    top: '3%', left: '3%', width: '94%', height: '94%', borderRadius: '6px',
  },
];

// ─────────────────────────────────────────────
// Comparativa datos
// ─────────────────────────────────────────────

interface ComparativaItem {
  nombre: string;
  animal: boolean;
  vegetal: boolean;
  nota: string;
}

const COMPARATIVA: ComparativaItem[] = [
  { nombre: 'Núcleo', animal: true, vegetal: true, nota: 'Centro de control con ADN' },
  { nombre: 'Mitocondrias', animal: true, vegetal: true, nota: 'Producción de ATP' },
  { nombre: 'Ribosomas', animal: true, vegetal: true, nota: 'Síntesis de proteínas' },
  { nombre: 'Retículo Endoplasmático', animal: true, vegetal: true, nota: 'Transporte y síntesis' },
  { nombre: 'Aparato de Golgi', animal: true, vegetal: true, nota: 'Empaquetado y distribución' },
  { nombre: 'Membrana plasmática', animal: true, vegetal: true, nota: 'Barrera selectiva' },
  { nombre: 'Citoplasma', animal: true, vegetal: true, nota: 'Medio interno' },
  { nombre: 'Lisosomas', animal: true, vegetal: false, nota: 'Digestión celular' },
  { nombre: 'Centriolos', animal: true, vegetal: false, nota: 'División celular' },
  { nombre: 'Pared celular', animal: false, vegetal: true, nota: 'Celulosa rígida' },
  { nombre: 'Cloroplastos', animal: false, vegetal: true, nota: 'Fotosíntesis' },
  { nombre: 'Vacuola central', animal: false, vegetal: true, nota: 'Almacén + turgencia' },
];

// ─────────────────────────────────────────────
// Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '🔬', titulo: '37,2 billones de células', detalle: 'Tu cuerpo tiene aproximadamente 37,2 billones de células trabajando en equipo. Más que estrellas en la Vía Láctea.' },
  { icono: '⚡', titulo: '~36 ATP por glucosa', detalle: 'Una sola mitocondria puede producir unas 36 moléculas de ATP (energía) por cada molécula de glucosa procesada.' },
  { icono: '🧬', titulo: 'ADN de 2 metros', detalle: 'El ADN de una sola célula humana, estirado, mediría unos 2 metros. Si juntaras el ADN de todas tus células, llegaría al Sol y volvería unas 600 veces.' },
  { icono: '🔄', titulo: '330.000 millones/día mueren', detalle: 'Cada día mueren aproximadamente 330.000 millones de células en tu cuerpo y se reemplazan por nuevas. Te renuevas constantemente.' },
  { icono: '🥚', titulo: 'La más grande: huevo de avestruz', detalle: 'La célula más grande del mundo es el huevo de avestruz, con unos 15 cm de diámetro. Es una única célula gigante.' },
  { icono: '🦠', titulo: 'La más pequeña: Mycoplasma', detalle: 'Mycoplasma genitalium mide solo ~0,2 μm. Caben millones en la punta de un alfiler. Es la bacteria más pequeña conocida.' },
  { icono: '📏', titulo: 'Célula humana típica: 10-30 μm', detalle: 'La mayoría de tus células miden entre 10 y 30 micrómetros. Necesitas un microscopio para verlas.' },
  { icono: '🌊', titulo: '70% agua', detalle: 'Una célula típica está compuesta en un 70% de agua. El citoplasma es esencialmente un gel acuoso con miles de moléculas.' },
];

interface TimelineEvento {
  anio: string;
  evento: string;
  detalle: string;
}

const TIMELINE: TimelineEvento[] = [
  { anio: '1665', evento: 'Robert Hooke', detalle: 'Observa celdillas en corcho y acuña el término "célula" (cellula).' },
  { anio: '1674', evento: 'Leeuwenhoek', detalle: 'Primer humano en ver organismos unicelulares vivos con su microscopio artesanal.' },
  { anio: '1838', evento: 'Schleiden y Schwann', detalle: 'Formulan la teoría celular: todos los seres vivos están formados por células.' },
  { anio: '1855', evento: 'Virchow', detalle: '"Omnis cellula e cellula": toda célula proviene de otra célula preexistente.' },
  { anio: '1931', evento: 'Microscopio electrónico', detalle: 'Permite ver orgánulos con detalle por primera vez. Revolución en biología celular.' },
  { anio: '1953', evento: 'Watson y Crick', detalle: 'Descubren la estructura de doble hélice del ADN. Se abre la era de la genética molecular.' },
];

// ─────────────────────────────────────────────
// Sección 1: Célula Animal
// ─────────────────────────────────────────────

function SeccionCelulaAnimal() {
  const [organuloActivo, setOrganuloActivo] = useState<string | null>(null);
  const seleccionado = ORGANULOS_ANIMAL.find(o => o.id === organuloActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La célula animal es la unidad básica de todos los animales. Toca cada orgánulo para descubrir <strong>qué hace</strong> y un dato curioso.</p>
      </div>

      <div className={styles.celulaContainer}>
        <h3 className={styles.celulaLabel}>Toca un orgánulo para explorar</h3>
        <div className={styles.celulaVisual}>
          {ORGANULOS_ANIMAL.map(o => (
            <button
              key={o.id}
              type="button"
              className={`${styles.organulo} ${organuloActivo === o.id ? styles.organuloSelected : ''}`}
              style={{
                top: o.top,
                left: o.left,
                width: o.width,
                height: o.height,
                borderRadius: o.borderRadius,
                backgroundColor: organuloActivo === o.id ? o.color : `${o.color}33`,
                borderColor: o.color,
                zIndex: o.id === 'membrana' ? 0 : o.id === 'citoplasma' ? 1 : 2,
              }}
              onClick={() => setOrganuloActivo(organuloActivo === o.id ? null : o.id)}
              aria-pressed={organuloActivo === o.id}
              aria-label={`${o.nombre}: toca para ver función`}
            >
              {o.id !== 'membrana' && o.id !== 'citoplasma' && (
                <span className={styles.organuloNombre}>{o.nombre}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {seleccionado && (
        <div className={styles.infoPanel} style={{ borderLeftColor: seleccionado.color }}>
          <h4 className={styles.infoPanelTitulo} style={{ color: seleccionado.color }}>
            {seleccionado.nombre}
          </h4>
          <p className={styles.infoPanelFuncion}>{seleccionado.funcion}</p>
          <div className={styles.infoPanelMeta}>
            <span className={styles.infoPanelTag}><strong>Tamaño:</strong> {seleccionado.tamano}</span>
          </div>
          <p className={styles.infoPanelDato}>
            <span aria-hidden="true">💡</span> {seleccionado.dato}
          </p>
        </div>
      )}

      <div className={styles.insight}>
        <p>Una célula animal típica mide entre <strong>10 y 30 μm</strong>. A pesar de su tamaño microscópico, contiene toda la maquinaria necesaria para vivir, crecer y reproducirse.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Célula Vegetal
// ─────────────────────────────────────────────

function SeccionCelulaVegetal() {
  const [organuloActivo, setOrganuloActivo] = useState<string | null>(null);
  const seleccionado = ORGANULOS_VEGETAL.find(o => o.id === organuloActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La célula vegetal tiene todo lo de la animal y más: <strong>pared celular</strong>, <strong>cloroplastos</strong> y una <strong>vacuola central</strong> enorme. Toca cada orgánulo.</p>
      </div>

      <div className={styles.celulaContainer}>
        <h3 className={styles.celulaLabel}>Toca un orgánulo para explorar</h3>
        <div className={`${styles.celulaVisual} ${styles.celulaVegetal}`}>
          {ORGANULOS_VEGETAL.map(o => (
            <button
              key={o.id}
              type="button"
              className={`${styles.organulo} ${organuloActivo === o.id ? styles.organuloSelected : ''}`}
              style={{
                top: o.top,
                left: o.left,
                width: o.width,
                height: o.height,
                borderRadius: o.borderRadius,
                backgroundColor: organuloActivo === o.id ? o.color : `${o.color}33`,
                borderColor: o.color,
                zIndex: o.id === 'pared' ? 0 : o.id === 'membrana-v' ? 1 : o.id === 'vacuola' ? 2 : 3,
              }}
              onClick={() => setOrganuloActivo(organuloActivo === o.id ? null : o.id)}
              aria-pressed={organuloActivo === o.id}
              aria-label={`${o.nombre}: toca para ver función`}
            >
              {o.id !== 'pared' && o.id !== 'membrana-v' && (
                <span className={styles.organuloNombre}>{o.nombre}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {seleccionado && (
        <div className={styles.infoPanel} style={{ borderLeftColor: seleccionado.color }}>
          <h4 className={styles.infoPanelTitulo} style={{ color: seleccionado.color }}>
            {seleccionado.nombre}
          </h4>
          <p className={styles.infoPanelFuncion}>{seleccionado.funcion}</p>
          <div className={styles.infoPanelMeta}>
            <span className={styles.infoPanelTag}><strong>Tamaño:</strong> {seleccionado.tamano}</span>
          </div>
          <p className={styles.infoPanelDato}>
            <span aria-hidden="true">💡</span> {seleccionado.dato}
          </p>
        </div>
      )}

      <div className={styles.insight}>
        <p>La vacuola central puede ocupar hasta el <strong>90% del volumen</strong> de la célula vegetal. Cuando pierde agua, la planta se marchita — literalmente es lo que la mantiene erguida.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Comparativa
// ─────────────────────────────────────────────

function SeccionComparativa() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ambas células comparten orgánulos esenciales, pero la vegetal tiene <strong>3 estructuras exclusivas</strong> que le permiten hacer fotosíntesis y mantenerse rígida.</p>
      </div>

      {/* Tabla comparativa */}
      <div className={styles.comparativaCard}>
        <div className={styles.comparativaHeader}>
          <span className={styles.comparativaHeaderNombre}>Orgánulo</span>
          <span className={styles.comparativaHeaderTipo}><span aria-hidden="true">🔬</span> Animal</span>
          <span className={styles.comparativaHeaderTipo}><span aria-hidden="true">🌿</span> Vegetal</span>
        </div>
        {COMPARATIVA.map((item, i) => {
          const soloAnimal = item.animal && !item.vegetal;
          const soloVegetal = !item.animal && item.vegetal;
          return (
            <div
              key={i}
              className={`${styles.comparativaRow} ${soloAnimal ? styles.comparativaRowAnimal : ''} ${soloVegetal ? styles.comparativaRowVegetal : ''}`}
            >
              <div className={styles.comparativaNombre}>
                <span className={styles.comparativaOrgNombre}>{item.nombre}</span>
                <span className={styles.comparativaOrgNota}>{item.nota}</span>
              </div>
              <span className={styles.comparativaCheck} aria-label={item.animal ? 'Sí' : 'No'}>{item.animal ? '✅' : '❌'}</span>
              <span className={styles.comparativaCheck} aria-label={item.vegetal ? 'Sí' : 'No'}>{item.vegetal ? '✅' : '❌'}</span>
            </div>
          );
        })}
      </div>

      {/* Diagrama de Venn */}
      <div className={styles.vennContainer}>
        <h3 className={styles.vennTitulo}>Resumen visual</h3>
        <div className={styles.vennDiagrama}>
          <div className={styles.vennCirculo} style={{ left: '10%' }}>
            <span className={styles.vennLabel}>Solo Animal</span>
            <span className={styles.vennItems}>Centriolos<br />Lisosomas</span>
          </div>
          <div className={styles.vennInterseccion}>
            <span className={styles.vennLabel}>Ambas</span>
            <span className={styles.vennItems}>Núcleo, Mitocondrias<br />Ribosomas, RE<br />Golgi, Membrana</span>
          </div>
          <div className={styles.vennCirculo} style={{ right: '10%' }}>
            <span className={styles.vennLabel}>Solo Vegetal</span>
            <span className={styles.vennItems}>Pared celular<br />Cloroplastos<br />Vacuola central</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>Las diferencias clave reflejan estilos de vida opuestos: los animales <strong>se mueven para buscar comida</strong>, las plantas <strong>fabrican su propia comida</strong> con la luz del sol y necesitan rigidez para no caer.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las células son <strong>la unidad básica de la vida</strong>. Aquí tienes datos que ponen en perspectiva lo increíbles que son.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h3 className={styles.datoTitulo}>{d.titulo}</h3>
            <p className={styles.datoDetalle}>{d.detalle}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <h3 className={styles.subSeccionTitulo}>Historia del descubrimiento celular</h3>
      <div className={styles.timeline}>
        {TIMELINE.map((t, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineAnio}>{t.anio}</div>
            <div className={styles.timelineLine}>
              <div className={styles.timelineDot} />
            </div>
            <div className={styles.timelineContent}>
              <h4 className={styles.timelineEvento}>{t.evento}</h4>
              <p className={styles.timelineDetalle}>{t.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>Desde que Hooke acuñó el término &quot;célula&quot; en 1665, la biología celular ha revolucionado la medicina, la agricultura y nuestra comprensión de la vida. <strong>Todo ser vivo está hecho de células.</strong></p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCelulaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('animal');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'animal': return <SeccionCelulaAnimal />;
      case 'vegetal': return <SeccionCelulaVegetal />;
      case 'comparativa': return <SeccionComparativa />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Célula por Dentro</h1>
          <p className={styles.subtitle}>Animal vs Vegetal — orgánulos, funciones y datos fascinantes</p>
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
          title="Más sobre biología celular"
          subtitle="Preguntas frecuentes sobre las células"
          defaultOpen={false}
        >
          <h3>¿Qué diferencia hay entre célula procariota y eucariota?</h3>
          <p>
            Las células <strong>procariotas</strong> (bacterias, arqueas) no tienen núcleo definido ni orgánulos con membrana.
            Las <strong>eucariotas</strong> (animales, vegetales, hongos) tienen un núcleo rodeado de membrana y orgánulos
            especializados como mitocondrias y retículo endoplasmático. Las eucariotas son mucho más grandes y complejas.
          </p>

          <h3>¿Cómo se dividen las células?</h3>
          <p>
            Hay dos procesos principales: la <strong>mitosis</strong> (división para crecimiento y reparación, produce 2 células
            idénticas) y la <strong>meiosis</strong> (división para reproducción sexual, produce 4 células con la mitad
            de cromosomas). Una célula humana típica se divide cada 24 horas aproximadamente.
          </p>

          <h3>¿Por qué las células vegetales son cuadradas y las animales redondas?</h3>
          <p>
            Las células vegetales tienen una <strong>pared celular rígida de celulosa</strong> que les da forma angular y fija.
            Las células animales solo tienen membrana plasmática (flexible), por lo que adoptan formas redondeadas o irregulares
            según su función: los glóbulos rojos son discoidales, las neuronas tienen prolongaciones largas.
          </p>

          <h3>¿Cuántos tipos de células tiene el cuerpo humano?</h3>
          <p>
            Se estima que el cuerpo humano tiene más de <strong>200 tipos diferentes de células</strong>, desde
            glóbulos rojos (sin núcleo) hasta neuronas (con axones de hasta 1 metro). Cada tipo está especializado
            para una función concreta.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de biología celular con fines educativos.
            La biología celular es extraordinariamente compleja y muchos mecanismos siguen siendo objeto de
            investigación activa. Los datos presentados reflejan el consenso científico actual.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-celula')} />
        <ShareCard appName="visualizador-celula" />
        <Footer appName="visualizador-celula" />
    </div>
  );
}
