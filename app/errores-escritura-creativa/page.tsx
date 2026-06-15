'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './ErroresEscrituraCreativa.module.css';

type Categoria = 'voz' | 'dialogos' | 'descripcion' | 'estructura' | 'personajes' | 'estilo';
type Nivel = 'basico' | 'intermedio' | 'avanzado';
type FiltroCategoria = Categoria | 'todos';

interface ErrorEscritura {
  id: string;
  nombre: string;
  categoria: Categoria;
  nivel: Nivel;
  descripcion: string;
  ejemploMalo: string;
  ejemploBueno: string;
  explicacion: string;
  tip: string;
}

const CATEGORIA_CONFIG: Record<Categoria, { label: string; color: string; bg: string }> = {
  voz:         { label: 'Voz',         color: '#2E86AB', bg: '#e8f4f9' },
  dialogos:    { label: 'Diálogos',    color: '#48A9A6', bg: '#e6f4f4' },
  descripcion: { label: 'Descripción', color: '#27AE60', bg: '#e8f7ee' },
  estructura:  { label: 'Estructura',  color: '#E67E22', bg: '#fdf0e3' },
  personajes:  { label: 'Personajes',  color: '#9B59B6', bg: '#f4ecf9' },
  estilo:      { label: 'Estilo',      color: '#C0392B', bg: '#fae8e7' },
};

const NIVEL_CONFIG: Record<Nivel, { label: string; color: string }> = {
  basico:     { label: 'Básico',     color: '#27AE60' },
  intermedio: { label: 'Intermedio', color: '#E67E22' },
  avanzado:   { label: 'Avanzado',   color: '#C0392B' },
};

const FILTROS: { id: FiltroCategoria; label: string }[] = [
  { id: 'todos',       label: 'Todos (15)' },
  { id: 'estilo',      label: 'Estilo' },
  { id: 'estructura',  label: 'Estructura' },
  { id: 'descripcion', label: 'Descripción' },
  { id: 'dialogos',    label: 'Diálogos' },
  { id: 'personajes',  label: 'Personajes' },
  { id: 'voz',         label: 'Voz narrativa' },
];

const ERRORES: ErrorEscritura[] = [
  {
    id: 'head-hopping',
    nombre: 'Head-hopping: saltar entre cabezas',
    categoria: 'voz',
    nivel: 'intermedio',
    descripcion: 'Cambiar el punto de vista entre personajes dentro de la misma escena sin transición, desorientando al lector.',
    ejemploMalo: `Lucía sintió que el corazón le fallaba. Juan, al otro lado de la mesa, pensó que ella parecía nerviosa. Lucía notó que él la miraba raro.`,
    ejemploBueno: `Lucía sintió que el corazón le fallaba. Las manos de Juan tamborilearon sobre la mesa, despacio; ella imaginó que él lo notaba todo.`,
    explicacion: 'En el primer ejemplo entramos primero en la cabeza de Lucía, luego en la de Juan y volvemos a Lucía. El lector pierde el ancla. En la corrección permanecemos en la perspectiva de Lucía: lo que Juan piensa lo inferimos a través de sus acciones, como haría ella en la vida real.',
    tip: 'Elige un POV por escena y no te muevas de él. Si necesitas entrar en otra cabeza, usa un salto de sección (***) o un nuevo capítulo.',
  },
  {
    id: 'tell-dont-show',
    nombre: 'Contar en lugar de mostrar (Tell, don\'t show)',
    categoria: 'descripcion',
    nivel: 'basico',
    descripcion: 'Decirle al lector cómo se siente un personaje en lugar de mostrar los síntomas físicos y conductuales que lo revelan.',
    ejemploMalo: `Andrés estaba muy nervioso. Era una persona muy tímida y no sabía qué decir.`,
    ejemploBueno: `Andrés se enrolló el hilo del bolsillo alrededor del dedo hasta que la punta se puso blanca. Abrió la boca dos veces antes de emitir ningún sonido.`,
    explicacion: '"Estaba nervioso" cierra la escena; el lector la recibe como un telegrama. La segunda versión convierte la emoción en imagen: el lector la experimenta en lugar de que se la expliquen.',
    tip: 'Cada vez que escribas una emoción directa (miedo, alegría, tristeza), pregúntate: ¿qué hace el cuerpo? ¿Qué hace la persona? Describe eso.',
  },
  {
    id: 'adverbios-dialogos',
    nombre: 'Adverbios en los verbos de habla',
    categoria: 'dialogos',
    nivel: 'basico',
    descripcion: 'Añadir adverbios como "dijo enfadadamente" para explicar el tono de un diálogo que debería ser evidente por sí mismo.',
    ejemploMalo: `—Nunca volveré a verte —dijo ella tristemente.\n—Ni falta que me haces —respondió él fríamente.`,
    ejemploBueno: `—Nunca volveré a verte —dijo ella. Se mordió el labio y miró hacia la ventana.\n—Ni falta que me haces —respondió él, sin levantar los ojos del periódico.`,
    explicacion: 'Si el diálogo necesita un adverbio para que el lector entienda el tono, el diálogo no está haciendo su trabajo. La acción después de las palabras (la beat) muestra el estado emocional y devuelve al personaje su espacio físico.',
    tip: 'Escribe el diálogo, borra todos los adverbios de habla y lee en voz alta. Si necesitas uno de vuelta, reescribe las palabras del personaje para que el tono sea obvio.',
  },
  {
    id: 'dialogo-exposicion',
    nombre: 'Diálogos de exposición (el "como ya sabes…")',
    categoria: 'dialogos',
    nivel: 'intermedio',
    descripcion: 'Usar la conversación para transmitir información que los personajes ya conocen, con el único propósito de informar al lector.',
    ejemploMalo: `—Como ya sabes, fuiste adoptado hace quince años —dijo la madre—. Tu padre biológico era el alcalde de este pueblo.\n—Sí, lo recuerdo. Tenía cuatro años cuando llegué a vuestra casa.`,
    ejemploBueno: `La madre dejó el sobre encima de la mesa sin mirarlo.\n—Hay cosas que debería haberte dicho antes.\nÉl conocía ese tono. Lo había oído la noche del accidente, la noche de la boda de su prima. Las noches en que algo se rompía para siempre.`,
    explicacion: 'Los personajes no se informan entre sí de cosas que ya saben. El "como ya sabes" es el síntoma más evidente. La información de fondo debe filtrarse a través de la acción, el pensamiento o fragmentos de conversación con su propia tensión dramática.',
    tip: 'Si una línea de diálogo empieza por "Como ya sabes..." o contiene información que ambos personajes conocen, bórrala. Busca otra forma de transmitirla.',
  },
  {
    id: 'truco-espejo',
    nombre: 'La descripción frente al espejo',
    categoria: 'descripcion',
    nivel: 'basico',
    descripcion: 'Usar el recurso del espejo para que el protagonista se describa a sí mismo en el primer capítulo.',
    ejemploMalo: `Me miré en el espejo del baño. Tenía los ojos azules de mi madre y el cabello castaño y rizado de mi padre. Mi nariz era algo respingona y tenía una pequeña cicatriz en la barbilla del accidente de bicicleta de cuando tenía ocho años.`,
    ejemploBueno: `La secretaria tardó un segundo de más en levantar la vista cuando entré. Era la tercera vez esta semana. Elena nunca había sido capaz de decidir si ese cabello rizado era un problema o su única gracia.`,
    explicacion: 'El espejo interrumpe la historia para hacer un inventario físico del protagonista. El lector no necesita la descripción completa en el primer capítulo: la construirá solo a partir de fragmentos dispersos filtrados por la experiencia del personaje.',
    tip: 'Borra toda descripción física extensa del protagonista en el primer capítulo. Introduce los rasgos más adelante, un detalle por escena, vistos a través de otros personajes.',
  },
  {
    id: 'protagonista-despertando',
    nombre: 'Empezar con el protagonista despertándose',
    categoria: 'estructura',
    nivel: 'basico',
    descripcion: 'Abrir la novela con el protagonista despertando, lo que retrasa la historia y raramente aporta tensión o información relevante.',
    ejemploMalo: `El despertador sonó a las siete. María estiró el brazo y lo apagó. Se quedó mirando el techo unos minutos antes de levantarse. Fue al baño, se lavó los dientes y bajó a desayunar.`,
    ejemploBueno: `El despertador llevaba sonando siete minutos cuando María por fin cogió el sobre de la mesilla. Ya sabía lo que contenía. Lo había sabido desde que lo encontró bajo la puerta la noche anterior.`,
    explicacion: 'Despertar + rutina matinal es la apertura más genérica posible. No introduce conflicto, no revela carácter y no ancla al lector en una pregunta. La segunda versión comienza en un momento de tensión: ¿qué hay en ese sobre?',
    tip: 'Empieza siempre en el momento en que algo cambia para el protagonista, no en el momento en que se levanta para que empiece a cambiar.',
  },
  {
    id: 'adjetivitis',
    nombre: 'Adjetivitis: demasiados adjetivos',
    categoria: 'estilo',
    nivel: 'basico',
    descripcion: 'Acumular dos o más adjetivos por sustantivo de forma sistemática, ralentizando el ritmo y diluyendo la fuerza de las imágenes.',
    ejemploMalo: `La antigua y majestuosa mansión se alzaba imponente sobre la verde y frondosa colina bajo el oscuro, tormentoso y amenazante cielo de noviembre.`,
    ejemploBueno: `La mansión se alzaba sobre la colina. El cielo de noviembre tenía el color del hierro.`,
    explicacion: 'Los adjetivos en cascada se anulan entre sí: el cerebro del lector los procesa como ruido y deja de "ver" la imagen. Un adjetivo bien elegido hace más que tres mediocres. El cielo "de hierro" evoca peso, frío y amenaza sin necesitar ningún adjetivo.',
    tip: 'En revisión, busca todos los sustantivos con dos o más adjetivos. Quédate con el más específico o el más inesperado; borra los demás.',
  },
  {
    id: 'redundancias',
    nombre: 'Redundancias y pleonasmos',
    categoria: 'estilo',
    nivel: 'basico',
    descripcion: 'Repetir información ya implícita en la palabra usada: "subir arriba", "susurró en voz baja", "asintió con la cabeza".',
    ejemploMalo: `—Sí —asintió con la cabeza—. Voy a subir arriba a buscar el libro —murmuró en voz baja—. Puedo verlo con mis propios ojos.`,
    ejemploBueno: `—Sí —asintió—. Voy a subir a buscar el libro —murmuró—. Puedo verlo.`,
    explicacion: 'Asentir ya implica mover la cabeza. Susurrar ya implica voz baja. Subir ya implica arriba. Estos errores crean microfrenos en la lectura y señalan falta de control del idioma.',
    tip: 'Busca en el texto "con la cabeza", "en voz baja", "en voz alta", "arriba/abajo", "propio/a" y "ojos". En la mayoría de casos se pueden eliminar sin perder nada.',
  },
  {
    id: 'ritmo-uniforme',
    nombre: 'Ritmo uniforme: frases del mismo tamaño',
    categoria: 'estilo',
    nivel: 'intermedio',
    descripcion: 'Escribir párrafos enteros con frases de longitud similar, creando un ritmo monótono que adormece al lector.',
    ejemploMalo: `Ella entró en la habitación. Miró a su alrededor. No había nadie. Fue hacia la ventana. La abrió despacio. La calle estaba vacía. Volvió al centro del cuarto.`,
    ejemploBueno: `Ella entró en la habitación. No había nadie. Fue hacia la ventana y la abrió: la calle estaba vacía, los adoquines mojados, un gato cruzando en diagonal sin apresurarse.`,
    explicacion: 'El ritmo uniforme parece una lista de acciones, no una escena. Variar la longitud de las frases —corta para tensión, larga para distensión— crea el equivalente literario de la música.',
    tip: 'Lee tu texto en voz alta. Si suena a redacción escolar, alterna: una frase corta tras dos largas, o viceversa. La frase más corta del párrafo suele ser la más importante.',
  },
  {
    id: 'flashback-mal-integrado',
    nombre: 'Flashbacks que paran la historia',
    categoria: 'estructura',
    nivel: 'avanzado',
    descripcion: 'Insertar un flashback extenso justo cuando la tensión de la escena presente alcanza su punto álgido, rompiendo el momentum narrativo.',
    ejemploMalo: `El disparo sonó. Elena se tiró al suelo. Mientras esperaba, recordó el verano de 1998, cuando tenía doce años y su padre la llevó por primera vez a la feria del pueblo. Había un tiovivo rojo...`,
    ejemploBueno: `El disparo sonó. Elena se tiró al suelo. El olor a pólvora le trajo algo, un verano, un tiovivo —y lo bloqueó. Ahora no.`,
    explicacion: 'Un flashback en medio de una escena de tensión rompe la urgencia. Si el recuerdo es necesario, aparece solo en un fragmento brevísimo que el personaje corta él mismo, o se traslada a una escena en calma antes o después.',
    tip: 'Antes de insertar un flashback, pregúntate: ¿puede esperar este recuerdo a que la escena presente termine? En la mayoría de casos, sí.',
  },
  {
    id: 'mary-sue',
    nombre: 'Protagonistas sin defectos (Mary Sue / Gary Stu)',
    categoria: 'personajes',
    nivel: 'intermedio',
    descripcion: 'Crear un protagonista que es bueno en todo, cae bien a todos y supera los obstáculos con facilidad, sin conflictos internos reales.',
    ejemploMalo: `Sofía era la más inteligente de la clase, pero también la más humilde. Todos la querían. Era buena en los deportes, tocaba el piano y nunca se equivocaba en nada importante. Cuando llegó la crisis, supo exactamente qué hacer.`,
    ejemploBueno: `Sofía era la más inteligente de la clase y lo sabía: ese era el problema. Cuando llegó la crisis, hizo lo que siempre hacía: calculó, decidió, ejecutó. Y falló. Y entonces no supo qué hacer.`,
    explicacion: 'Los personajes perfectos no generan tensión porque el lector sabe que van a superar cualquier obstáculo. Los defectos no son decorativos: son el motor del conflicto interno. La imperfección hace al personaje creíble.',
    tip: 'Define tres defectos del protagonista antes de escribir el primer capítulo. Uno de ellos debe ser directamente responsable del problema principal de la historia.',
  },
  {
    id: 'conflicto-interno-ausente',
    nombre: 'Solo conflicto externo, sin conflicto interno',
    categoria: 'personajes',
    nivel: 'avanzado',
    descripcion: 'Construir una trama con obstáculos externos sin que el protagonista tenga un dilema moral o psicológico que lo haga cambiar.',
    ejemploMalo: `Marcos tenía que encontrar el antídoto antes de que el veneno matara a su hermana. Fue al laboratorio, encontró las pistas, derrotó al villano y consiguió el antídoto. Su hermana se salvó. Marcos estaba contento.`,
    ejemploBueno: `Marcos tenía que encontrar el antídoto. El único que lo tenía era el hombre que había arruinado la vida de su padre. Para salvar a su hermana, tendría que pedirle ayuda.`,
    explicacion: 'En el primer ejemplo Marcos es un mensajero que ejecuta acciones. En el segundo tiene que elegir entre el rencor y el amor. La trama externa solo importa si tiene un coste interno.',
    tip: 'Para cada obstáculo externo, pregúntate: ¿qué le cuesta esto al protagonista por dentro? ¿A qué tiene que renunciar? ¿Qué creencia tiene que cuestionar?',
  },
  {
    id: 'deus-ex-machina',
    nombre: 'Final deus ex machina',
    categoria: 'estructura',
    nivel: 'avanzado',
    descripcion: 'Resolver el conflicto principal mediante un elemento externo que no estaba preparado en la historia y que el protagonista no merece narrativamente.',
    ejemploMalo: `El protagonista estaba acorralado sin salida posible. De repente, un personaje secundario que apenas había aparecido dos veces llegó con la solución exacta que necesitaban.`,
    ejemploBueno: `El protagonista estaba acorralado. Entonces recordó lo que la anciana le había dicho en el capítulo tres: "La cerradura de ese sótano lleva rota desde el incendio." Había estado ahí todo el tiempo.`,
    explicacion: 'Si la solución llega de fuera, el lector siente que le han hecho trampa. La diferencia entre deus ex machina y un giro legítimo es que el giro usa materiales que ya estaban en la historia.',
    tip: 'Antes de escribir el clímax, lista los elementos que han aparecido en la historia (objetos, información, habilidades). La solución debe salir de esa lista.',
  },
  {
    id: 'exceso-backstory',
    nombre: 'Exceso de backstory al inicio',
    categoria: 'estructura',
    nivel: 'intermedio',
    descripcion: 'Comenzar la historia con páginas de historia previa del protagonista antes de que ocurra nada en el presente narrativo.',
    ejemploMalo: `Julia tenía treinta y dos años. Había nacido en un pequeño pueblo del norte, hija de un pescador y una maestra. Su infancia había sido tranquila pero solitaria. A los dieciséis años se fue a estudiar a la capital...`,
    ejemploBueno: `Julia llegó al apartamento de su madre a las once de la noche con una maleta y sin llamar. En treinta y dos años, nunca lo había hecho.`,
    explicacion: 'La historia previa interesa al lector solo cuando ya le importa el personaje. Empezar con backstory es como presentar la infancia de alguien antes de que hayamos tenido ninguna razón para quedarnos.',
    tip: 'Escribe todo el backstory que necesites para conocer a tu personaje, pero en el texto definitivo empieza en el presente. Filtra la historia previa en pequeñas dosis a lo largo de la narración.',
  },
  {
    id: 'prologo-innecesario',
    nombre: 'El prólogo que debería ser el capítulo 1',
    categoria: 'estructura',
    nivel: 'avanzado',
    descripcion: 'Añadir un prólogo que en realidad es el inicio de la historia, retrasando el comienzo real o repitiendo lo que aparecerá en el capítulo 1.',
    ejemploMalo: `PRÓLOGO: [escena de acción trepidante]. CAPÍTULO 1: [vuelta al pasado para "explicar cómo llegamos aquí", con ritmo mucho más lento que el prólogo].`,
    ejemploBueno: `Usar la escena trepidante directamente como Capítulo 1, o eliminar el prólogo y comenzar donde la historia empieza de verdad, con la misma tensión desde la primera línea.`,
    explicacion: 'El prólogo es a menudo un intento de capturar al lector con una escena emocionante mientras se aplaza el verdadero inicio. Si esa escena es tan buena, debería ser el capítulo 1. Si no, el lector percibe la trampa.',
    tip: 'Pregúntate si tu prólogo podría borrarse sin que el lector pierda nada esencial. Si la respuesta es sí, bórralo. Si contiene información necesaria, incorpórala al capítulo 1.',
  },
];

export default function ErroresEscrituraCreativaPage() {
  const [filtro, setFiltro] = useState<FiltroCategoria>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<ErrorEscritura | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSeleccionado(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const erroresFiltrados = useMemo(() => {
    return ERRORES.filter((err) => {
      const matchCategoria = filtro === 'todos' || err.categoria === filtro;
      const query = busqueda.toLowerCase();
      const matchBusqueda =
        !query ||
        err.nombre.toLowerCase().includes(query) ||
        err.descripcion.toLowerCase().includes(query);
      return matchCategoria && matchBusqueda;
    });
  }, [filtro, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Errores de Escritura Creativa</h1>
        <p className={styles.heroSubtitle}>
          15 fallos frecuentes con ejemplo incorrecto, corrección explicada y consejo práctico.
          Cada error analizado para que no vuelva a aparecer en tu manuscrito.
        </p>
      </header>

      <LegalNotice />

      <section className={styles.controls}>
        <div className={styles.filterGroup}>
          {FILTROS.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${filtro === f.id ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar error..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar error de escritura"
        />
      </section>

      <div className={styles.erroresGrid}>
        {erroresFiltrados.map((err) => {
          const catConf = CATEGORIA_CONFIG[err.categoria];
          const nivConf = NIVEL_CONFIG[err.nivel];
          return (
            <article
              key={err.id}
              className={styles.errorCard}
              onClick={() => setSeleccionado(err)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSeleccionado(err)}
              aria-label={`Ver detalle: ${err.nombre}`}
            >
              <div className={styles.errorCardHeader}>
                <span
                  className={styles.categoryBadge}
                  style={{ backgroundColor: catConf.bg, color: catConf.color }}
                >
                  {catConf.label}
                </span>
                <span
                  className={styles.nivelBadge}
                  style={{ borderColor: nivConf.color, color: nivConf.color }}
                >
                  {nivConf.label}
                </span>
              </div>
              <h2 className={styles.errorNombre}>{err.nombre}</h2>
              <p className={styles.errorDescripcion}>{err.descripcion}</p>
            </article>
          );
        })}
      </div>

      {seleccionado && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSeleccionado(null)}
          role="dialog"
          aria-modal="true"
          aria-label={seleccionado.nombre}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalCategoria}>
                  {CATEGORIA_CONFIG[seleccionado.categoria].label} · {NIVEL_CONFIG[seleccionado.nivel].label}
                </p>
                <h2 className={styles.modalTitulo}>{seleccionado.nombre}</h2>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setSeleccionado(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <p className={styles.modalDescripcion}>{seleccionado.descripcion}</p>

            <div className={styles.ejemploMalo}>
              <span className={styles.ejemplosLabel}><span aria-hidden="true">❌</span> Ejemplo con el error</span>
              <p className={styles.ejemploTexto}>{seleccionado.ejemploMalo}</p>
            </div>

            <div className={styles.ejemploBueno}>
              <span className={styles.ejemplosLabel}><span aria-hidden="true">✅</span> Corrección</span>
              <p className={styles.ejemploTexto}>{seleccionado.ejemploBueno}</p>
            </div>

            <div className={styles.explicacion}>
              <span className={styles.explicacionTitulo}>Por qué funciona la corrección</span>
              <p className={styles.explicacionTexto}>{seleccionado.explicacion}</p>
            </div>

            <div className={styles.tipBox}>
              <span className={styles.tipBoxLabel}><span aria-hidden="true">💡</span> Consejo práctico</span>
              <p className={styles.tipTexto}>{seleccionado.tip}</p>
            </div>
          </div>
        </div>
      )}

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Quieres empezar con una hoja de ruta?</h2>
        <p className={styles.ctaSubtitle}>
          El Orientador de Escritura Creativa te guía paso a paso según tu género y perspectiva narrativa.
        </p>
        <a href="/orientador-escritura-creativa/" className={styles.ctaBtn}>
          Ir al Orientador →
        </a>
      </section>

      <EducationalSection
        title="Guía completa: errores de escritura creativa"
        subtitle="Todo lo que necesitas saber para revisar tu manuscrito con criterio"
      >
        <h3>Categorías de errores y dificultad de corrección</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Errores incluidos</th>
                <th>Frecuencia</th>
                <th>Dificultad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Estilo</td>
                <td>Adjetivitis, redundancias, ritmo uniforme</td>
                <td>Muy alta</td>
                <td>Baja — revisión mecánica con búsqueda</td>
              </tr>
              <tr>
                <td>Estructura</td>
                <td>Inicio, flashbacks, backstory, prólogo, deus ex</td>
                <td>Alta</td>
                <td>Media — puede requerir reescritura</td>
              </tr>
              <tr>
                <td>Descripción</td>
                <td>Tell vs. show, truco del espejo</td>
                <td>Muy alta</td>
                <td>Media — requiere práctica</td>
              </tr>
              <tr>
                <td>Diálogos</td>
                <td>Adverbios de habla, exposición</td>
                <td>Alta</td>
                <td>Baja a media</td>
              </tr>
              <tr>
                <td>Personajes</td>
                <td>Mary Sue, conflicto interno ausente</td>
                <td>Alta</td>
                <td>Alta — afecta al diseño de personaje</td>
              </tr>
              <tr>
                <td>Voz</td>
                <td>Head-hopping</td>
                <td>Media</td>
                <td>Alta — afecta al POV de toda la obra</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Para qué tipo de escritor es esta guía</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>✍️ Primer manuscrito</strong>
            <p>Empieza por los errores de nivel básico: adjetivitis, redundancias, truco del espejo e inicio despertando. Son los más frecuentes y los más fáciles de corregir.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📖 Escritor con varios borradores</strong>
            <p>Presta atención a los errores de nivel intermedio y avanzado: head-hopping, diálogos de exposición, flashbacks y conflicto interno. Aparecen cuando el escritor ya controla lo básico.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📝 Escritor de relato corto</strong>
            <p>El relato no perdona el exceso de backstory ni el deus ex machina. Cada frase debe justificar su presencia. El ritmo y los diálogos son especialmente críticos en textos breves.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🎯 Escritor que busca publicar</strong>
            <p>Los errores de nivel básico en las primeras páginas son causa de descarte inmediato. Protagonista despertando, adjetivitis y espejo son señales de alerta para agentes y editores.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Estos errores son siempre malos, sin excepción?</strong>
            <p>No. Los escritores experimentados los rompen conscientemente para crear un efecto específico. La diferencia es que lo hacen a propósito, sabiendo el riesgo. El error aparece cuando el escritor lo comete sin darse cuenta.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿En qué orden debo corregir los errores en mi manuscrito?</strong>
            <p>Primero los estructurales (inicio, flashbacks, backstory, deus ex), porque si cambias la estructura el resto puede desaparecer o aparecer en sitios distintos. Después personajes y voz. Por último, descripción, diálogos y estilo.</p>
            <div className={styles.faqTip}>Haz una pasada de revisión específica para cada categoría, nunca todo a la vez.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo sé si tengo head-hopping en mi texto?</strong>
            <p>Lee una escena e identifica desde qué cabeza se cuenta cada párrafo. Si en el mismo bloque has estado dentro de más de un personaje, tienes head-hopping. Colorear los párrafos según el POV puede ayudar a visualizarlo.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El "show, don't tell" es siempre mejor que contar?</strong>
            <p>No. Mostrar cuesta más espacio y ritmo. Hay momentos donde contar es más eficiente: pasos de tiempo, contexto menor, emociones secundarias. Muestra lo que importa dramáticamente; cuenta lo que solo necesita ser comunicado.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuántas revisiones hacen falta para eliminar estos errores?</strong>
            <p>Lo habitual son 3-5 revisiones enfocadas: una estructural, una de personajes y voz, una de escenas y diálogos, y una o dos de estilo. Con práctica, los errores básicos dejan de aparecer en el borrador.</p>
          </li>
        </ul>

        <h3>Proceso de revisión en 5 pasadas</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Lee en voz alta de principio a fin</strong>
              <p>Sin editar. Solo escucha. Marca los párrafos donde tropiezas, te aburres o algo "no suena". Esos son los puntos de intervención.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Revisa el inicio y la estructura global</strong>
              <p>¿Empieza donde debe? ¿Los flashbacks llegan en el momento oportuno? ¿El final usa materiales sembrados antes? Corrige primero lo estructural.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Revisa personajes y voz narrativa</strong>
              <p>¿Tu protagonista tiene defectos que importan? ¿El POV es consistente por escena? ¿El conflicto externo tiene un coste interno? Corrige el diseño antes de pulir el estilo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Revisa descripción y diálogos</strong>
              <p>Convierte los "tell" más importantes en "show". Borra los adverbios de habla. Elimina los diálogos de exposición. Añade beats de acción donde el diálogo necesita ancla física.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Revisión de estilo con búsqueda activa</strong>
              <p>Busca palabras señal: adjetivos dobles, "con la cabeza", "en voz baja", "muy", "bastante", "subir arriba". Para cada resultado, decide si se queda o se va.</p>
            </div>
          </li>
        </ol>

        <h3>Hábitos de revisión que marcan la diferencia</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏳</span>
            <strong>Deja reposar el manuscrito</strong>
            <p>Al menos dos semanas entre el final del borrador y la primera revisión. La distancia temporal es la mejor herramienta de edición.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Una pasada, un objetivo</strong>
            <p>No revises estilo y estructura al mismo tiempo. Cada pasada tiene un foco: los problemas se detectan mejor cuando sabes qué buscas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔊</span>
            <strong>Lee en voz alta siempre</strong>
            <p>El oído detecta problemas de ritmo, redundancia y diálogos que el ojo pasa por alto. Es la herramienta más barata y más eficaz.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👥</span>
            <strong>Lectores beta con objetivo claro</strong>
            <p>Pide que marquen los momentos donde se aburrieron o se perdieron. Esos son los errores que no puedes ver desde dentro.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <strong>Crea tu propio checklist</strong>
            <p>Con el tiempo sabrás cuáles son tus errores recurrentes. Haz una lista personalizada y revísala antes de cada pasada de edición.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <strong>Lee con ojo crítico</strong>
            <p>Cuando leas como lector, anota los momentos donde algo no funciona. Te enseñará a reconocer los mismos errores en tu propio texto.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores que destruyen la primera impresión — las primeras páginas
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Protagonista despertándose en la primera línea: señal inmediata de falta de experiencia.</li>
            <li><span aria-hidden="true">❌</span> Descripción ante el espejo en el primer capítulo: el inventario físico del protagonista puede esperar.</li>
            <li><span aria-hidden="true">❌</span> Más de dos adjetivos por sustantivo en las primeras páginas: el lector lo nota antes que tú.</li>
            <li><span aria-hidden="true">❌</span> Diálogo de exposición antes del capítulo 2: nadie habla así en la vida real.</li>
            <li><span aria-hidden="true">❌</span> Tres páginas de backstory antes de que pase algo: el lector no tiene motivo para seguir leyendo.</li>
            <li><span aria-hidden="true">❌</span> Prólogo de 10+ páginas seguido de un capítulo 1 mucho más lento: el lector se siente estafado.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('errores-escritura-creativa')} />
      <ShareCard appName="errores-escritura-creativa" />
      <Footer appName="errores-escritura-creativa" />
    </div>
  );
}
