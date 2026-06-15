'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorSesgosCognitivos.module.css';
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
// Datos de sesgos
// ─────────────────────────────────────────────

interface Sesgo {
  id: string;
  nombre: string;
  icono: string;
  categoria: string;
  color: string;
  definicion: string;
  ejemplo: string;
  pregunta: string;
  opciones: { texto: string; esSesgo: boolean; explicacion: string }[];
  contramedida: string;
}

const SESGOS: Sesgo[] = [
  {
    id: 'anclaje',
    nombre: 'Efecto anclaje',
    icono: '⚓',
    categoria: 'Dinero',
    color: '#2E86AB',
    definicion: 'La primera cifra que ves influye desproporcionadamente en tu estimación, aunque sea irrelevante.',
    ejemplo: 'En un estudio, preguntaron a un grupo si la población de Turquía era mayor o menor de 5 millones, y a otro si era mayor o menor de 65 millones. El primer grupo estimó ~17M, el segundo ~35M. La realidad: ~85M.',
    pregunta: 'Un restaurante ofrece vino a 80 €, 45 € y 22 €. ¿Cuál suele elegir la mayoría?',
    opciones: [
      { texto: 'El de 22 € (el más barato)', esSesgo: false, explicacion: 'Solo un ~20% elige el más barato. La mayoría se ancla al de 80 € y el de 45 € "parece razonable" en comparación.' },
      { texto: 'El de 45 € (el del medio)', esSesgo: true, explicacion: '¡Correcto! El vino de 80 € es el ancla. Su función es hacer que el de 45 € parezca "sensato". Sin el ancla, probablemente elegirías el de 22 €. Los restaurantes lo saben.' },
      { texto: 'El de 80 € (el más caro)', esSesgo: false, explicacion: 'Muy pocos eligen el más caro. Su función real es ser el ancla que hace atractivo el del medio.' },
    ],
    contramedida: 'Antes de evaluar un precio, investiga el rango real del mercado. La primera cifra que ves no debería definir tu referencia.',
  },
  {
    id: 'aversion-perdida',
    nombre: 'Aversión a la pérdida',
    icono: '😰',
    categoria: 'Dinero',
    color: '#e74c3c',
    definicion: 'El dolor de perder 100 € es psicológicamente el doble de intenso que la alegría de ganar 100 €.',
    ejemplo: 'Kahneman y Tversky demostraron que la mayoría prefiere no apostar 100 € con un 50% de ganar 200 €, aunque la esperanza matemática es positiva (+50 €). Perder duele más que ganar alegra.',
    pregunta: 'Has comprado acciones a 1.000 €. Ahora valen 700 €. ¿Qué haces?',
    opciones: [
      { texto: 'Mantener hasta recuperar los 1.000 €', esSesgo: true, explicacion: 'Esto es aversión a la pérdida: no quieres "realizar" la pérdida de 300 €, así que mantienes una inversión que quizás debas vender. La pregunta correcta no es "cuánto pagué" sino "¿invertiría 700 € aquí hoy?".' },
      { texto: 'Vender y aceptar la pérdida', esSesgo: false, explicacion: 'Es la decisión racional si crees que el valor seguirá bajando. Pero psicológicamente es muy difícil: tu cerebro interpreta vender como "confirmar que has perdido".' },
      { texto: 'Comprar más para bajar el precio medio', esSesgo: true, explicacion: 'Esto se llama "promediar a la baja" y puede ser correcto o un error. Si lo haces solo para "sentir" que no has perdido tanto, es aversión a la pérdida disfrazada de estrategia.' },
    ],
    contramedida: 'Pregúntate: "Si no tuviera esta inversión, ¿la compraría hoy a este precio?" Si la respuesta es no, vende.',
  },
  {
    id: 'coste-hundido',
    nombre: 'Falacia del coste hundido',
    icono: '🕳️',
    categoria: 'Lógica',
    color: '#e67e22',
    definicion: 'Continúas invirtiendo en algo porque ya has gastado mucho, aunque seguir no tenga sentido.',
    ejemplo: 'Has pagado 50 € por una entrada de teatro. Llevas 30 minutos y es insoportable. ¿Te quedas "para no desperdiciar los 50 €"? Esos 50 € ya se fueron — quedarte solo añade 90 minutos de sufrimiento.',
    pregunta: 'Llevas 3 años estudiando una carrera que no te gusta. ¿Qué pesa más en tu decisión de continuar?',
    opciones: [
      { texto: 'Los 3 años ya invertidos', esSesgo: true, explicacion: 'Esos 3 años ya se fueron — es coste hundido. No puedes recuperarlos. La pregunta real es: ¿los próximos 2 años te compensarán? Decidir por lo ya gastado es la falacia del coste hundido.' },
      { texto: 'Lo que puedo ganar terminando vs cambiando', esSesgo: false, explicacion: 'Esta es la evaluación racional: comparar el valor futuro de terminar vs el valor futuro de cambiar. El pasado es irrelevante para esta decisión.' },
      { texto: 'Lo que pensarán los demás', esSesgo: true, explicacion: 'La presión social amplifica el coste hundido: "¿cómo vas a dejar después de 3 años?". Pero la opinión de otros no cambia el análisis coste-beneficio futuro.' },
    ],
    contramedida: 'Ignora lo que ya has gastado. Pregúntate solo: "A partir de hoy, ¿cuál es la mejor opción mirando hacia adelante?".',
  },
  {
    id: 'dotacion',
    nombre: 'Efecto dotación',
    icono: '🎁',
    categoria: 'Dinero',
    color: '#9b59b6',
    definicion: 'Valoras más lo que ya posees que lo que no tienes, solo por el hecho de poseerlo.',
    ejemplo: 'En un experimento, dieron tazas a la mitad de los participantes. Los que tenían taza pedían ~7 € por venderla. Los que no la tenían solo ofrecían ~3 € por comprarla. La misma taza, el doble de valor por poseerla.',
    pregunta: 'Tienes un coche viejo. Un comprador ofrece su valor real de mercado. ¿Cómo reaccionas?',
    opciones: [
      { texto: '"Es poco, mi coche vale más"', esSesgo: true, explicacion: 'Efecto dotación: le asignas más valor porque es tuyo. Los recuerdos, el apego y el esfuerzo de comprarlo inflan su valor percibido por encima del mercado.' },
      { texto: '"Si ese es el precio de mercado, es justo"', esSesgo: false, explicacion: 'Aceptar el valor de mercado es racional, pero psicológicamente difícil. El efecto dotación te hace sentir que "debería valer más" solo porque es tuyo.' },
    ],
    contramedida: 'Pregúntate: "Si no tuviera esto, ¿cuánto pagaría por comprarlo hoy?" Esa cifra es más cercana a su valor real.',
  },
  {
    id: 'confirmacion',
    nombre: 'Sesgo de confirmación',
    icono: '🔍',
    categoria: 'Percepción',
    color: '#27ae60',
    definicion: 'Buscas, interpretas y recuerdas información que confirma lo que ya crees.',
    ejemplo: 'Si crees que "los lunes son terribles", notarás cada cosa mala que pasa un lunes y olvidarás las buenas. Los martes malos pasan desapercibidos. No es que los lunes sean peores — es que filtras la realidad.',
    pregunta: 'Crees que una marca de coches es fiable. Lees una reseña negativa. ¿Qué haces?',
    opciones: [
      { texto: 'Buscar más reseñas que confirmen que la marca es buena', esSesgo: true, explicacion: 'Sesgo de confirmación en acción: buscas datos que refuercen tu creencia previa e ignoras la evidencia contraria. Buscar "Toyota fiable" dará resultados diferentes a "problemas Toyota".' },
      { texto: 'Buscar reseñas tanto positivas como negativas', esSesgo: false, explicacion: 'Buscar evidencia en ambas direcciones es la contramedida del sesgo de confirmación. Es difícil porque tu cerebro se resiste a información que contradice tus creencias.' },
    ],
    contramedida: 'Busca activamente argumentos en contra de tu opinión. Si tu creencia es sólida, sobrevivirá al escrutinio.',
  },
  {
    id: 'bandwagon',
    nombre: 'Efecto arrastre (bandwagon)',
    icono: '🐑',
    categoria: 'Social',
    color: '#1abc9c',
    definicion: 'Tiendes a creer o hacer algo porque mucha gente lo cree o lo hace.',
    ejemplo: 'En bolsa: "Todo el mundo está comprando cripto, algo sabrán". En restaurantes: "El que tiene cola debe ser bueno". La popularidad no garantiza calidad ni acierto — pero tu cerebro lo interpreta como señal.',
    pregunta: 'Dos restaurantes vecinos: uno con cola de 20 personas, otro vacío. ¿Cuál eliges?',
    opciones: [
      { texto: 'El que tiene cola (si hay tanta gente, será bueno)', esSesgo: true, explicacion: 'Efecto arrastre: usas la popularidad como indicador de calidad. Pero la cola puede deberse a un influencer, a que es más barato, o a que abrió antes. El vacío puede ser nuevo y excelente.' },
      { texto: 'Miro las cartas de ambos y decido', esSesgo: false, explicacion: 'Evaluar la información objetiva (menú, precios, reseñas) en lugar de la señal social es la decisión más racional, aunque menos natural.' },
    ],
    contramedida: 'Pregúntate: "¿Elegiría esto si nadie más lo estuviera eligiendo?" La popularidad es una señal, no una prueba.',
  },
  {
    id: 'disponibilidad',
    nombre: 'Heurística de disponibilidad',
    icono: '📰',
    categoria: 'Percepción',
    color: '#34495e',
    definicion: 'Juzgas la probabilidad de algo según lo fácil que te resulta recordar un ejemplo.',
    ejemplo: '¿Qué mata más gente: los tiburones o los cocos? Los cocos matan ~150 personas/año vs ~5 los tiburones. Pero las películas y las noticias hacen que "ataque de tiburón" sea más fácil de recordar.',
    pregunta: '¿Qué causa más muertes al año en España?',
    opciones: [
      { texto: 'Accidentes de avión', esSesgo: true, explicacion: 'Cada accidente aéreo es noticia mundial durante días. Pero mueren ~0-2 personas/año en avión en España vs ~1.700 en carretera. Tu cerebro sobreestima lo mediático.' },
      { texto: 'Accidentes de tráfico', esSesgo: false, explicacion: 'Correcto: ~1.700 muertes/año en carretera. Los accidentes de tráfico son tan frecuentes que ya no son "noticia", lo que hace que tu cerebro subestime el riesgo real.' },
    ],
    contramedida: 'Cuando estimes un riesgo, busca datos reales en lugar de confiar en lo que "te suena" más frecuente.',
  },
  {
    id: 'status-quo',
    nombre: 'Sesgo del status quo',
    icono: '🪨',
    categoria: 'Lógica',
    color: '#f39c12',
    definicion: 'Prefieres que las cosas se queden como están, aunque cambiar sea objetivamente mejor.',
    ejemplo: 'La mayoría no cambia de banco, de compañía de teléfono ni de suministradora de luz, aunque podría ahorrar cientos de euros al año. El esfuerzo de cambiar se percibe como mayor que el ahorro real.',
    pregunta: 'Pagas 50 €/mes por móvil. Existe una oferta igual por 30 €. ¿Qué haces?',
    opciones: [
      { texto: 'Sigo con mi operador (no me fío del cambio)', esSesgo: true, explicacion: 'Status quo: prefieres perder 240 €/año antes que dedicar 30 minutos a cambiar de operador. Tu cerebro valora "no hacer nada" como más seguro que "actuar", aunque objetivamente es peor.' },
      { texto: 'Cambio o negocio con mi operador', esSesgo: false, explicacion: 'La decisión racional es actuar: cambiar o al menos usar la oferta como palanca de negociación. 240 €/año es un coste real que crece cada mes que no actúas.' },
    ],
    contramedida: 'Programa una revisión periódica (cada 6-12 meses) de tus contratos. Trátalo como una tarea, no como una decisión.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSesgosCognitivosPage() {
  const [sesgoActivo, setSesgoActivo] = useState<string>(SESGOS[0].id);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);

  const sesgo = SESGOS.find(s => s.id === sesgoActivo)!;

  const cambiarSesgo = (id: string) => {
    setSesgoActivo(id);
    setRespuestaSeleccionada(null);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona tu Cerebro al Decidir</h1>
          <p className={styles.subtitle}>8 sesgos cognitivos que distorsionan tus decisiones — sin que te des cuenta</p>
        </header>

        <LegalNotice />

        {/* Navegación de sesgos */}
        <div className={styles.sesgosNav}>
          {SESGOS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.sesgoNavBtn} ${sesgoActivo === s.id ? styles.sesgoNavActivo : ''}`}
              onClick={() => cambiarSesgo(s.id)}
              style={{ borderColor: sesgoActivo === s.id ? s.color : undefined }}
              aria-pressed={sesgoActivo === s.id}
            >
              <span className={styles.sesgoNavIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.sesgoNavNombre}>{s.nombre}</span>
            </button>
          ))}
        </div>

        {/* Contenido del sesgo activo */}
        <div className={styles.sesgoContent}>
          <div className={styles.sesgoHeader} style={{ borderLeftColor: sesgo.color }}>
            <span className={styles.sesgoCategoria} style={{ color: sesgo.color }}>{sesgo.categoria}</span>
            <h2 className={styles.sesgoTitulo}><span aria-hidden="true">{sesgo.icono}</span> {sesgo.nombre}</h2>
            <p className={styles.sesgoDefinicion}>{sesgo.definicion}</p>
          </div>

          <div className={styles.sesgoEjemplo}>
            <h3 className={styles.seccionTitulo}>El experimento</h3>
            <p>{sesgo.ejemplo}</p>
          </div>

          {/* Mini-test interactivo */}
          <div className={styles.sesgoTest}>
            <h3 className={styles.seccionTitulo}>Ponlo a prueba</h3>
            <p className={styles.testPregunta}>{sesgo.pregunta}</p>
            <div className={styles.testOpciones}>
              {sesgo.opciones.map((op, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.testOpcion} ${
                    respuestaSeleccionada === i
                      ? op.esSesgo ? styles.testSesgo : styles.testRacional
                      : ''
                  }`}
                  onClick={() => setRespuestaSeleccionada(i)}
                  aria-pressed={respuestaSeleccionada === i}
                >
                  {op.texto}
                </button>
              ))}
            </div>
            {respuestaSeleccionada !== null && (
              <div className={`${styles.testResultado} ${
                sesgo.opciones[respuestaSeleccionada].esSesgo ? styles.testResultadoSesgo : styles.testResultadoOk
              }`} role="status" aria-live="polite" aria-atomic="true">
                <p className={styles.testEtiqueta}>
                  {sesgo.opciones[respuestaSeleccionada].esSesgo
                    ? <><span aria-hidden="true">🧠</span> Sesgo detectado</>
                    : <><span aria-hidden="true">✅</span> Pensamiento racional</>}
                </p>
                <p className={styles.testExplicacion}>{sesgo.opciones[respuestaSeleccionada].explicacion}</p>
              </div>
            )}
          </div>

          {/* Contramedida */}
          <div className={styles.contramedida}>
            <h3 className={styles.seccionTitulo}>Cómo contrarrestarlo</h3>
            <p>{sesgo.contramedida}</p>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            Los sesgos cognitivos no son defectos — son <strong>atajos mentales</strong> que evolucionaron
            para tomar decisiones rápidas. El problema es que en el mundo moderno (inversiones, contratos,
            compras) estos atajos nos perjudican más de lo que nos ayudan. Conocerlos es el primer paso
            para neutralizarlos.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más reflexión → <a href="/diagnostico-pensamiento-critico/">Pensamiento Crítico</a> · <a href="/visualizador-precio-real-cosas/">El Precio Real de las Cosas</a>
        </div>

        <EducationalSection
          title="La psicología de las decisiones"
          subtitle="Por qué tu cerebro te engaña (y cómo dejar de caer)"
          defaultOpen={false}
        >
          <h3>Sistema 1 vs Sistema 2 (Kahneman)</h3>
          <p>
            Daniel Kahneman describió dos modos de pensar: el Sistema 1 (rápido, automático, intuitivo)
            y el Sistema 2 (lento, deliberado, analítico). Los sesgos cognitivos son producto del
            Sistema 1: atajos útiles en la sabana africana, problemáticos en una negociación de hipoteca.
          </p>

          <h3>No eres inmune por conocerlos</h3>
          <p>
            Conocer los sesgos reduce su efecto, pero no lo elimina. Incluso los psicólogos que los
            estudian caen en ellos. La clave no es &quot;ser racional siempre&quot; — es <strong>crear
            sistemas y hábitos</strong> que compensen los sesgos en las decisiones importantes
            (comparar antes de comprar, esperar 24h antes de una compra grande, pedir segunda opinión).
          </p>

          <h3>Los sesgos que más dinero cuestan</h3>
          <p>
            En finanzas personales, los más dañinos son: anclaje (aceptar precios inflados), coste
            hundido (no vender inversiones perdedoras), status quo (no cambiar de banco/operador) y
            efecto dotación (sobrevalorar lo que tienes). Juntos pueden costarte miles de euros al año.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los sesgos aquí descritos están simplificados con fines divulgativos.
            La investigación en psicología cognitiva es extensa y con matices. Para profundizar,
            recomendamos &quot;Pensar rápido, pensar despacio&quot; de Daniel Kahneman.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sesgos-cognitivos')} />
        <ShareCard appName="visualizador-sesgos-cognitivos" />
        <Footer appName="visualizador-sesgos-cognitivos" />
    </div>
  );
}
