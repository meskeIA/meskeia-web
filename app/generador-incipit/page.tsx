'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GeneradorIncipit.module.css';

type Genero = 'literaria' | 'negra' | 'terror' | 'romantica' | 'aventura' | 'ciencia-ficcion' | 'historica' | 'infantil-juvenil';
type Tono = 'oscuro' | 'esperanzador' | 'misterioso' | 'humoristico' | 'epico' | 'intimo' | 'nostalgico' | 'ironico';
type Era = 'contemporaneo' | 'siglo-xx' | 'clasico';
type FiltroGenero = Genero | 'todos';
type FiltroTono = Tono | 'todos';

interface Incipit {
  id: string;
  texto: string;
  genero: Genero;
  tono: Tono;
  era: Era;
  real?: { autor: string; obra: string };
}

const GENERO_CONFIG: Record<Genero, { label: string; color: string; bg: string }> = {
  literaria:        { label: 'Literaria',        color: '#2E86AB', bg: '#e8f4f9' },
  negra:            { label: 'Negra',             color: '#1a1a2e', bg: '#e8e8f0' },
  terror:           { label: 'Terror',            color: '#C0392B', bg: '#fae8e7' },
  romantica:        { label: 'Romántica',         color: '#E91E8C', bg: '#fde8f3' },
  aventura:         { label: 'Aventura',          color: '#E67E22', bg: '#fdf0e3' },
  'ciencia-ficcion': { label: 'Ciencia ficción',  color: '#9B59B6', bg: '#f4ecf9' },
  historica:        { label: 'Histórica',         color: '#795548', bg: '#f5ede8' },
  'infantil-juvenil': { label: 'Infantil/Juvenil', color: '#27AE60', bg: '#e8f7ee' },
};

const TONO_CONFIG: Record<Tono, string> = {
  oscuro:       '🌑',
  esperanzador: '🌅',
  misterioso:   '🔮',
  humoristico:  '😄',
  epico:        '⚔️',
  intimo:       '🤍',
  nostalgico:   '🍂',
  ironico:      '😏',
};

const ERA_LABEL: Record<Era, string> = {
  contemporaneo: 'Contemporáneo',
  'siglo-xx': 'Siglo XX',
  clasico: 'Clásico',
};

const FILTROS_GENERO: { id: FiltroGenero; label: string }[] = [
  { id: 'todos',           label: 'Todos los géneros' },
  { id: 'literaria',       label: 'Literaria' },
  { id: 'negra',           label: 'Negra' },
  { id: 'terror',          label: 'Terror' },
  { id: 'romantica',       label: 'Romántica' },
  { id: 'aventura',        label: 'Aventura' },
  { id: 'ciencia-ficcion', label: 'Ciencia ficción' },
  { id: 'historica',       label: 'Histórica' },
  { id: 'infantil-juvenil', label: 'Infantil/Juvenil' },
];

const FILTROS_TONO: { id: FiltroTono; label: string }[] = [
  { id: 'todos',       label: 'Todos los tonos' },
  { id: 'oscuro',      label: '🌑 Oscuro' },
  { id: 'esperanzador', label: '🌅 Esperanzador' },
  { id: 'misterioso',  label: '🔮 Misterioso' },
  { id: 'humoristico', label: '😄 Humorístico' },
  { id: 'epico',       label: '⚔️ Épico' },
  { id: 'intimo',      label: '🤍 Íntimo' },
  { id: 'nostalgico',  label: '🍂 Nostálgico' },
  { id: 'ironico',     label: '😏 Irónico' },
];

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const INCIPITS: Incipit[] = [
  // LITERARIA — CLÁSICO
  { id: 'lit-cl-1', texto: 'Llamadme Ismael.', genero: 'literaria', tono: 'epico', era: 'clasico', real: { autor: 'Herman Melville', obra: 'Moby-Dick' } },
  { id: 'lit-cl-2', texto: 'Era el mejor de los tiempos, era el peor de los tiempos, era la edad de la sabiduría, era la edad de la necedad.', genero: 'literaria', tono: 'ironico', era: 'clasico', real: { autor: 'Charles Dickens', obra: 'Historia de dos ciudades' } },
  { id: 'lit-cl-3', texto: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.', genero: 'literaria', tono: 'ironico', era: 'clasico', real: { autor: 'Miguel de Cervantes', obra: 'Don Quijote de la Mancha' } },
  { id: 'lit-cl-4', texto: 'Las familias felices se parecen todas; las familias desgraciadas son desgraciadas cada una a su manera.', genero: 'literaria', tono: 'intimo', era: 'clasico', real: { autor: 'Lev Tolstói', obra: 'Ana Karénina' } },
  // LITERARIA — SIGLO XX
  { id: 'lit-s20-1', texto: 'Hoy mamá ha muerto. O quizá ayer, no lo sé.', genero: 'literaria', tono: 'oscuro', era: 'siglo-xx', real: { autor: 'Albert Camus', obra: 'El extranjero' } },
  { id: 'lit-s20-2', texto: 'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.', genero: 'literaria', tono: 'nostalgico', era: 'siglo-xx', real: { autor: 'Gabriel García Márquez', obra: 'Cien años de soledad' } },
  { id: 'lit-s20-3', texto: 'Si de verdad les interesa lo que voy a contarles, lo primero que querrán saber es dónde nací, cómo fue mi infancia, qué hacían mis padres antes de tenerme, y toda esa sarta de gilipolleces al estilo de David Copperfield.', genero: 'literaria', tono: 'ironico', era: 'siglo-xx', real: { autor: 'J. D. Salinger', obra: 'El guardián entre el centeno' } },
  { id: 'lit-s20-4', texto: 'Cuando Gregor Samsa se despertó una mañana después de un sueño agitado, se encontró sobre su cama convertido en un monstruoso insecto.', genero: 'literaria', tono: 'oscuro', era: 'siglo-xx', real: { autor: 'Franz Kafka', obra: 'La metamorfosis' } },
  // LITERARIA — CONTEMPORÁNEO
  { id: 'lit-c-1', texto: 'El día que me convertí en escritor fue el mismo día que dejé de creerme capaz de escribir.', genero: 'literaria', tono: 'intimo', era: 'contemporaneo' },
  { id: 'lit-c-2', texto: 'Hay ciudades que se aprenden y ciudades que te aprenden a ti.', genero: 'literaria', tono: 'intimo', era: 'contemporaneo' },
  { id: 'lit-c-3', texto: 'Escribo esto desde una habitación que ya no existe en una ciudad que tampoco reconocería.', genero: 'literaria', tono: 'nostalgico', era: 'contemporaneo' },
  { id: 'lit-c-4', texto: 'El verano que cumplí dieciséis años aprendí que los secretos de familia son los únicos que nunca se cuentan completos.', genero: 'literaria', tono: 'nostalgico', era: 'contemporaneo' },
  // NEGRA — CONTEMPORÁNEO
  { id: 'neg-c-1', texto: 'Lo primero que noté fue que el muerto llevaba mis zapatos.', genero: 'negra', tono: 'ironico', era: 'contemporaneo' },
  { id: 'neg-c-2', texto: 'Mentir me resulta fácil. Lo que nunca aprendí fue a mentirme a mí mismo.', genero: 'negra', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'neg-c-3', texto: 'El caso más sencillo de mi carrera empezó con una llamada equivocada a las tres de la madrugada.', genero: 'negra', tono: 'misterioso', era: 'contemporaneo' },
  { id: 'neg-c-4', texto: 'La víctima era inocente, cosa rara en este negocio.', genero: 'negra', tono: 'ironico', era: 'contemporaneo' },
  { id: 'neg-c-5', texto: 'Me pagaron por encontrar al asesino. Nadie me dijo que el asesino me había contratado a mí.', genero: 'negra', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'neg-c-6', texto: 'El cuerpo llevaba tres días en el apartamento antes de que los vecinos llamaran. No por el olor: por el ruido.', genero: 'negra', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'neg-c-7', texto: 'Era medianoche en julio, hacía un calor brutal y la ciudad olía a gasolina y a mentira.', genero: 'negra', tono: 'oscuro', era: 'contemporaneo' },
  // TERROR — CONTEMPORÁNEO
  { id: 'ter-c-1', texto: 'La casa llevaba vacía veinte años, pero esa noche todas las luces estaban encendidas.', genero: 'terror', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'ter-c-2', texto: 'Mi hija empezó a hablar con alguien que yo no podía ver tres días después del entierro.', genero: 'terror', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'ter-c-3', texto: 'El bebé llevaba tres semanas sin llorar, y eso era lo que me tenía aterrado.', genero: 'terror', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'ter-c-4', texto: 'La señal de wifi de mis vecinos desapareció el mismo día que desaparecieron ellos.', genero: 'terror', tono: 'misterioso', era: 'contemporaneo' },
  { id: 'ter-c-5', texto: 'El psiquiatra me dijo que los monstruos no existen. Eso fue antes de que conociera al psiquiatra.', genero: 'terror', tono: 'ironico', era: 'contemporaneo' },
  { id: 'ter-c-6', texto: 'La bisabuela había muerto dos veces y la segunda vez estaba de mucho peor humor.', genero: 'terror', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'ter-c-7', texto: 'Llegué al pueblo de noche y la única gasolinera estaba abierta pero no había nadie dentro, aunque la caja registradora seguía encendida.', genero: 'terror', tono: 'misterioso', era: 'contemporaneo' },
  // ROMÁNTICA — CONTEMPORÁNEO
  { id: 'rom-c-1', texto: 'La primera regla de mi vida era no enamorarme de personas que llevan la camisa mal abrochada; la segunda regla también era esa.', genero: 'romantica', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'rom-c-2', texto: 'Llevábamos tres años sin hablarnos cuando me llamó para pedirme que fuera a su boda.', genero: 'romantica', tono: 'intimo', era: 'contemporaneo' },
  { id: 'rom-c-3', texto: 'El problema de los reencuentros es que nunca sabes si estás recordando a la persona o a la historia que te contaste sobre ella.', genero: 'romantica', tono: 'nostalgico', era: 'contemporaneo' },
  { id: 'rom-c-4', texto: 'Me dijo que no creía en el amor y pensé: qué conveniente.', genero: 'romantica', tono: 'ironico', era: 'contemporaneo' },
  { id: 'rom-c-5', texto: 'Tardé veinte años en entender que lo que sentía por ella no era solo amistad.', genero: 'romantica', tono: 'nostalgico', era: 'contemporaneo' },
  { id: 'rom-c-6', texto: 'La primera mentira que le dije fue que no me acordaba de su nombre.', genero: 'romantica', tono: 'intimo', era: 'contemporaneo' },
  { id: 'rom-c-7', texto: 'Nos conocimos en un funeral y desde entonces le gusté cuando estaba triste.', genero: 'romantica', tono: 'intimo', era: 'contemporaneo' },
  { id: 'rom-c-8', texto: 'Me dijo que era muy fácil no enamorarse de mí. No supe si era un insulto o un cumplido.', genero: 'romantica', tono: 'humoristico', era: 'contemporaneo' },
  // AVENTURA — CLÁSICO
  { id: 'aven-cl-1', texto: 'En el año 1632, en la ciudad de York, nací de una familia muy buena, aunque no de este país.', genero: 'aventura', tono: 'epico', era: 'clasico', real: { autor: 'Daniel Defoe', obra: 'Robinson Crusoe' } },
  // AVENTURA — CONTEMPORÁNEO
  { id: 'aven-c-1', texto: 'Cuando el capitán anunció que el mapa era falso, llevábamos seis semanas en alta mar.', genero: 'aventura', tono: 'epico', era: 'contemporaneo' },
  { id: 'aven-c-2', texto: 'Hay tres cosas que nunca deberías hacer en una ciudad desconocida: perder el pasaporte, confiar en el primer taxista y enamorarte.', genero: 'aventura', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'aven-c-3', texto: 'El desierto no perdona, pero tampoco miente.', genero: 'aventura', tono: 'epico', era: 'contemporaneo' },
  { id: 'aven-c-4', texto: 'El mapa terminaba justo donde empezaba lo que de verdad queríamos encontrar.', genero: 'aventura', tono: 'epico', era: 'contemporaneo' },
  { id: 'aven-c-5', texto: 'Soy el único pirata documentado de la historia que era terriblemente propenso al mareo.', genero: 'aventura', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'aven-c-6', texto: 'Me contrató para encontrar a su hermano desaparecido, pero no me dijo que el hermano se había marchado voluntariamente.', genero: 'aventura', tono: 'misterioso', era: 'contemporaneo' },
  // CIENCIA FICCIÓN — SIGLO XX
  { id: 'cf-s20-1', texto: 'Era un día luminoso y frío de abril y los relojes daban las trece.', genero: 'ciencia-ficcion', tono: 'oscuro', era: 'siglo-xx', real: { autor: 'George Orwell', obra: '1984' } },
  // CIENCIA FICCIÓN — CONTEMPORÁNEO
  { id: 'cf-c-1', texto: 'El último ser humano sobre la Tierra estaba sentado tranquilamente cuando sonó el timbre de la puerta.', genero: 'ciencia-ficcion', tono: 'ironico', era: 'contemporaneo' },
  { id: 'cf-c-2', texto: 'La primera generación nacida en el espacio nunca entendió por qué los ancianos lloraban cuando miraban por los portales.', genero: 'ciencia-ficcion', tono: 'nostalgico', era: 'contemporaneo' },
  { id: 'cf-c-3', texto: 'Cuando las máquinas aprendieron a soñar, el gobierno prohibió el sueño.', genero: 'ciencia-ficcion', tono: 'oscuro', era: 'contemporaneo' },
  { id: 'cf-c-4', texto: 'Le trasplantaron los recuerdos de otra persona un martes, y el miércoles ya empezaba a echar de menos una vida que nunca había vivido.', genero: 'ciencia-ficcion', tono: 'intimo', era: 'contemporaneo' },
  { id: 'cf-c-5', texto: 'Le pregunté a la IA si era feliz. Me respondió: eso depende de qué entiende usted por feliz.', genero: 'ciencia-ficcion', tono: 'ironico', era: 'contemporaneo' },
  { id: 'cf-c-6', texto: 'El planeta tenía dos lunas y ningún idioma que valiera la pena aprender.', genero: 'ciencia-ficcion', tono: 'intimo', era: 'contemporaneo' },
  { id: 'cf-c-7', texto: 'El viajero del tiempo siempre llega con hambre. Dicen que es por el esfuerzo.', genero: 'ciencia-ficcion', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'cf-c-8', texto: 'Nos comunicamos mediante sueños compartidos hasta que alguien aprendió a mentir en sueños.', genero: 'ciencia-ficcion', tono: 'oscuro', era: 'contemporaneo' },
  // HISTÓRICA — CLÁSICO
  { id: 'hist-cl-1', texto: 'Llegué a la corte con veinte años, tres trajes y una carta de recomendación firmada por un hombre al que todos odiaban.', genero: 'historica', tono: 'ironico', era: 'clasico' },
  { id: 'hist-cl-2', texto: 'El Imperio llevaba trescientos años en pie y aquel invierno empezó a hacer demasiado frío.', genero: 'historica', tono: 'oscuro', era: 'clasico' },
  // HISTÓRICA — SIGLO XX
  { id: 'hist-s20-1', texto: 'En el año en que murió el rey, mi padre abrió una tienda de telas en el barrio de los curtidores.', genero: 'historica', tono: 'epico', era: 'siglo-xx' },
  { id: 'hist-s20-2', texto: 'La guerra terminó y nadie en nuestro pueblo sabía qué hacer con tanto silencio.', genero: 'historica', tono: 'nostalgico', era: 'siglo-xx' },
  { id: 'hist-s20-3', texto: 'Llegamos al nuevo continente con una maleta y la convicción de que todo iba a estar bien.', genero: 'historica', tono: 'esperanzador', era: 'siglo-xx' },
  // HISTÓRICA — CONTEMPORÁNEO
  { id: 'hist-c-1', texto: 'El asedio duró noventa días. El centésimo fue el más largo.', genero: 'historica', tono: 'epico', era: 'contemporaneo' },
  { id: 'hist-c-2', texto: 'La condesa tenía tres secretos y yo descubrí el primero por accidente, el segundo por necesidad y el tercero demasiado tarde.', genero: 'historica', tono: 'misterioso', era: 'contemporaneo' },
  { id: 'hist-c-3', texto: 'Fui a la guerra con diecinueve años convencido de que era la causa justa. Volví con veinte convencido de que no existe ninguna.', genero: 'historica', tono: 'oscuro', era: 'contemporaneo' },
  // INFANTIL-JUVENIL — CONTEMPORÁNEO
  { id: 'inf-c-1', texto: 'El día que encontré la puerta en el fondo del armario, mi vida dejó de ser aburrida para siempre.', genero: 'infantil-juvenil', tono: 'esperanzador', era: 'contemporaneo' },
  { id: 'inf-c-2', texto: 'Mi abuela era la persona más valiente que conocía, y eso que le tenía miedo a las palomas.', genero: 'infantil-juvenil', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'inf-c-3', texto: 'Nadie me creyó cuando dije que el dragón era mío. Pero el dragón sabía a quién pertenecía.', genero: 'infantil-juvenil', tono: 'epico', era: 'contemporaneo' },
  { id: 'inf-c-4', texto: 'A los doce años descubrí que podía hablar con los muertos. Lo difícil fue aprender a dejar de hacerlo.', genero: 'infantil-juvenil', tono: 'misterioso', era: 'contemporaneo' },
  { id: 'inf-c-5', texto: 'La carta llegó un martes, con un sello que ningún cartero del mundo había visto antes.', genero: 'infantil-juvenil', tono: 'misterioso', era: 'contemporaneo' },
  { id: 'inf-c-6', texto: 'Hay reglas en el colegio de brujos que nadie te explica hasta que ya las has roto.', genero: 'infantil-juvenil', tono: 'humoristico', era: 'contemporaneo' },
  { id: 'inf-c-7', texto: 'Mi mejor amigo era invisible para todo el mundo excepto para mí, y eso no siempre es una ventaja.', genero: 'infantil-juvenil', tono: 'esperanzador', era: 'contemporaneo' },
  { id: 'inf-c-8', texto: 'El verano que encontré el libro mágico también fue el verano en que aprendí que algunas puertas es mejor no abrir.', genero: 'infantil-juvenil', tono: 'misterioso', era: 'contemporaneo' },
];

export default function GeneradorIncipitPage() {
  const [filtroGenero, setFiltroGenero] = useState<FiltroGenero>('todos');
  const [filtroTono, setFiltroTono] = useState<FiltroTono>('todos');
  const [mostrados, setMostrados] = useState<Incipit[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [verTodos, setVerTodos] = useState(false);

  const generar = useCallback(() => {
    const filtrados = INCIPITS.filter((inc) => {
      const matchGenero = filtroGenero === 'todos' || inc.genero === filtroGenero;
      const matchTono = filtroTono === 'todos' || inc.tono === filtroTono;
      return matchGenero && matchTono;
    });
    setMostrados(mezclar(filtrados).slice(0, 5));
    setCopiado(null);
  }, [filtroGenero, filtroTono]);

  useEffect(() => {
    generar();
  }, [generar]);

  const copiar = async (texto: string, id: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  const totalFiltrados = INCIPITS.filter((inc) => {
    const matchGenero = filtroGenero === 'todos' || inc.genero === filtroGenero;
    const matchTono = filtroTono === 'todos' || inc.tono === filtroTono;
    return matchGenero && matchTono;
  }).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Generador de Íncipit</h1>
        <p className={styles.heroSubtitle}>
          62 primeras frases para desbloquear el inicio de tu historia.
          Filtra por género y tono, genera, copia e inspírate.
        </p>
      </header>

      <LegalNotice />

      <section className={styles.filtrosPanel}>
        <div className={styles.filtrosRow}>
          <span className={styles.filtrosLabel}>Género</span>
          <div className={styles.filtroGroup}>
            {FILTROS_GENERO.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`${styles.filtroBtn} ${filtroGenero === f.id ? styles.filtroBtnActive : ''}`}
                onClick={() => setFiltroGenero(f.id)}
                aria-pressed={filtroGenero === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filtrosRow}>
          <span className={styles.filtrosLabel}>Tono</span>
          <div className={styles.filtroGroup}>
            {FILTROS_TONO.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`${styles.filtroBtn} ${filtroTono === f.id ? styles.filtroBtnActive : ''}`}
                onClick={() => setFiltroTono(f.id)}
                aria-pressed={filtroTono === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.generarRow}>
          <button type="button" className={styles.generarBtn} onClick={generar} aria-label="Generar nuevos íncipit">
            🎲 Generar
          </button>
          <span className={styles.contadorInfo}>
            {totalFiltrados} íncipit{totalFiltrados !== 1 ? 's' : ''} en esta combinación
          </span>
        </div>
      </section>

      {mostrados.length > 0 ? (
        <div className={styles.incipitGrid}>
          {mostrados.map((inc) => {
            const genConf = GENERO_CONFIG[inc.genero];
            return (
              <article key={inc.id} className={styles.incipitCard}>
                <div className={styles.incipitMeta}>
                  <span
                    className={styles.generoBadge}
                    style={{ backgroundColor: genConf.bg, color: genConf.color }}
                  >
                    {genConf.label}
                  </span>
                  <span className={styles.tonoBadge} aria-label={`Tono: ${filtroTono}`}>
                    {TONO_CONFIG[inc.tono]}
                  </span>
                  <span className={styles.eraBadge}>{ERA_LABEL[inc.era]}</span>
                </div>

                <blockquote className={styles.incipitTexto}>
                  {inc.texto}
                </blockquote>

                {inc.real && (
                  <p className={styles.incipitReal}>
                    — {inc.real.autor}, <em>{inc.real.obra}</em>
                  </p>
                )}

                <button
                  type="button"
                  className={`${styles.copyBtn} ${copiado === inc.id ? styles.copyBtnOk : ''}`}
                  onClick={() => copiar(inc.texto, inc.id)}
                  aria-label="Copiar al portapapeles"
                >
                  {copiado === inc.id ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No hay íncipit con esta combinación. Prueba otro género o tono.</p>
        </div>
      )}

      <div className={styles.verTodosSection}>
        <button
          type="button"
          className={styles.verTodosBtn}
          onClick={() => setVerTodos(!verTodos)}
          aria-expanded={verTodos}
        >
          {verTodos ? '▲ Ocultar colección completa' : `▼ Ver los ${INCIPITS.length} íncipit`}
        </button>

        {verTodos && (
          <ul className={styles.todosLista}>
            {INCIPITS.map((inc) => {
              const genConf = GENERO_CONFIG[inc.genero];
              return (
                <li key={inc.id} className={styles.todosItem}>
                  <span
                    className={styles.todosGenero}
                    style={{ backgroundColor: genConf.bg, color: genConf.color }}
                  >
                    {genConf.label}
                  </span>
                  <span className={styles.todosTono} aria-hidden="true">{TONO_CONFIG[inc.tono]}</span>
                  <span className={styles.todosTexto}>
                    {inc.texto}
                    {inc.real && (
                      <em className={styles.todosAtrib}> — {inc.real.autor}, {inc.real.obra}</em>
                    )}
                  </span>
                  <button
                    type="button"
                    className={styles.todosBtn}
                    onClick={() => copiar(inc.texto, inc.id)}
                    aria-label="Copiar"
                  >
                    {copiado === inc.id ? '✓' : '📋'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <EducationalSection
        title="Cómo usar el íncipit en tu escritura"
        subtitle="Técnica, función y los errores más frecuentes al empezar un texto"
      >
        <h3>Funciones del íncipit y cómo conseguirlas</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Función</th>
                <th>Técnica</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Capturar atención inmediata</td><td>In medias res</td><td>"Llamadme Ismael" (Melville)</td></tr>
              <tr><td>Establecer voz distintiva</td><td>1.ª persona directa</td><td>"Si de verdad les interesa..." (Salinger)</td></tr>
              <tr><td>Crear tensión emocional</td><td>Situación perturbadora</td><td>"Hoy mamá ha muerto" (Camus)</td></tr>
              <tr><td>Formular el tema de la obra</td><td>Sentencia memorable</td><td>"Las familias felices..." (Tolstói)</td></tr>
              <tr><td>Generar curiosidad intelectual</td><td>Paradoja o ironía</td><td>"Era el mejor de los tiempos..." (Dickens)</td></tr>
              <tr><td>Introducir la voz del género</td><td>Convención genérica</td><td>"Eran las dos de la madrugada..." (noir)</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Para qué tipo de escritor es este generador</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🔓 Escritor bloqueado</strong>
            <p>Usa el generador para romper el bloqueo. No tienes que usar el incipit tal cual: basta con que te dé impulso para escribir la primera frase propia.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📖 Estudiante de técnica</strong>
            <p>Analiza los incipits reales: ¿qué prometen? ¿qué tono establecen? ¿cómo relacionan género y apertura? La respuesta a esas preguntas vale más que el incipit.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>✍️ Escritor de taller</strong>
            <p>Usa los incipits como ejercicio de continuación: elige uno que no has escrito tú y escribe las 10 frases siguientes. El incipit ajeno libera el control y la autocrítica.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🎯 Escritor en revisión</strong>
            <p>Compara tu incipit actual con los de tu género. ¿Cumple alguna de las funciones de la tabla? ¿Hace una promesa? ¿Tiene tensión o voz? Si no, es candidato a reescritura.</p>
          </div>
        </div>

        <h3>Preguntas sobre el íncipit</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué hace que un íncipit funcione?</strong>
            <p>Un buen íncipit hace una promesa (de tono, de conflicto, de voz) que el texto cumplirá. No necesita ser espectacular; necesita ser el inicio correcto de este texto concreto.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Debo escribir el íncipit al principio o al final del proceso?</strong>
            <p>Muchos escritores escriben el íncipit definitivo al final, cuando ya saben qué promesa puede cumplir el texto. El íncipit del primer borrador es un punto de partida, no un compromiso.</p>
            <div className={styles.faqTip}>Escribe el íncipit que necesites para arrancar. Revísalo cuando el texto esté completo.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puedo usar los íncipit de esta colección en mi texto?</strong>
            <p>Los inventados (sin atribución) son de inspiración libre: puedes adaptarlos o usarlos como punto de partida. Los reales son de sus autores — cítalos como cita literaria si los usas explícitamente.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuánto debe durar el íncipit?</strong>
            <p>No hay longitud canónica. "Llamadme Ismael" tiene tres palabras; el de García Márquez tiene más de cuarenta. Lo que importa es que sea completo como unidad de significado y tono.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Los íncipit reales aparecen en traducción al español?</strong>
            <p>Sí, en la traducción más habitual al español para facilitar la lectura. El íncipit original puede variar según la edición.</p>
          </li>
        </ul>

        <h3>Cómo escribir tu íncipit en 5 pasos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Define qué quieres conseguir</strong>
              <p>¿Tensión? ¿Voz? ¿Curiosidad? ¿Humor? Elige una función antes de escribir. Un íncipit que intenta conseguirlo todo suele no conseguir nada.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Elige el modo de apertura</strong>
              <p>In medias res, sentencia memorable, presentación de la voz narradora, situación perturbadora, pregunta sin respuesta. Cada modo tiene un ritmo y una promesa diferente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Escribe 10 versiones sin autocensura</strong>
              <p>No busques la perfecta desde el principio. Escribe versiones rápidas, malas si hace falta. La cantidad genera variantes; la variante 7 puede ser la buena.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Lee cada versión en voz alta</strong>
              <p>El íncipit tiene que funcionar como música. Si al leerlo en voz alta no te obliga a continuar, no está listo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Elige el que más te obliga a seguir escribiendo</strong>
              <p>El mejor íncipit no es el más bonito: es el que más ganas te da de saber qué pasa después. Si tú tienes esas ganas, el lector también las tendrá.</p>
            </div>
          </li>
        </ol>

        <h3>Hábitos que mejoran tus aperturas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <strong>Lee los primeros párrafos</strong>
            <p>Abre los libros que más te han marcado y lee solo la primera página. Analiza qué prometen y cómo lo hacen.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📓</span>
            <strong>Colecciona tus incipits fallidos</strong>
            <p>Guarda todos los intentos de apertura, incluidos los malos. Son material para otros textos futuros.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏰</span>
            <strong>El íncipit definitivo va al final</strong>
            <p>Cuando termines el borrador, vuelve al inicio. Ahora sabes qué promesa puede cumplir el texto y cuál no.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎭</span>
            <strong>El tono del íncipit es el tono del texto</strong>
            <p>Si el primer párrafo es humorístico y el libro es oscuro, el lector se sentirá engañado. El íncipit establece un contrato de lectura.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚫</span>
            <strong>Evita el contexto genérico</strong>
            <p>Lugar + fecha + clima sin tensión dramática es el íncipit más habitual y el menos efectivo. El mundo del texto puede esperar hasta la segunda frase.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Los anti-incipits más frecuentes
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Empezar con el despertador sonando — el anti-incipit por excelencia.</li>
            <li><span aria-hidden="true">❌</span> Descripción de lugar genérica sin tensión: "El sol se ponía sobre las colinas de..."</li>
            <li><span aria-hidden="true">❌</span> Fecha + lugar sin gancho: "Era el 15 de marzo de 1987 en la ciudad de..."</li>
            <li><span aria-hidden="true">❌</span> Protagonista mirándose al espejo para describirse a sí mismo.</li>
            <li><span aria-hidden="true">❌</span> Empezar con un sueño que "en realidad" no está pasando — el lector se siente estafado.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-incipit')} />
      <ShareCard appName="generador-incipit" />
      <Footer appName="generador-incipit" />
    </div>
  );
}
