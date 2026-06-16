'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorSesgosInversor.module.css';

type Fase = 'inicio' | 'test' | 'resultado';
type NivelSesgo = 'alto' | 'moderado' | 'ninguno';

interface SesgoDetectado {
  id: string;
  nivel: NivelSesgo;
}

interface Opcion {
  texto: string;
  sesgoId: string | null;
  nivel: NivelSesgo;
  feedbackInmediato: string;
}

interface Escenario {
  id: number;
  titulo: string;
  contexto: string;
  pregunta: string;
  opciones: Opcion[];
}

interface InfoSesgo {
  nombre: string;
  emoji: string;
  descripcion: string;
  impacto: string;
  comoEvitar: string;
}

const INFO_SESGOS: Record<string, InfoSesgo> = {
  'aversion-perdidas': {
    nombre: 'Aversión a las pérdidas',
    emoji: '😨',
    descripcion: 'El dolor de perder 100€ es psicológicamente más intenso que la satisfacción de ganar 100€. Daniel Kahneman demostró que las pérdidas pesan aproximadamente el doble que las ganancias equivalentes.',
    impacto: 'Vendes activos ganadores demasiado pronto para "asegurar" la ganancia. Aguantas posiciones perdedoras esperando recuperar. Evitas inversiones con buena rentabilidad esperada por miedo a la volatilidad.',
    comoEvitar: 'Define stop-loss antes de entrar. Evalúa siempre el valor futuro esperado, no el precio de compra. Automatiza las decisiones periódicas (p.ej. aportaciones mensuales) para eliminar la emoción del momento.',
  },
  'efecto-disposicion': {
    nombre: 'Efecto de disposición',
    emoji: '📉',
    descripcion: 'La tendencia a vender activos que han subido (para "asegurar la ganancia") y a mantener los que han bajado (esperando que se recuperen). Es una mezcla de aversión a pérdidas y contabilidad mental.',
    impacto: 'Vendes tus mejores inversiones antes de tiempo y te quedas con las peores. El resultado es una cartera progresivamente peor. En acciones individuales este sesgo puede ser muy costoso.',
    comoEvitar: 'La pregunta correcta no es "¿cuánto pagué?" sino "¿si tuviera hoy el efectivo, compraría esto?". Si la respuesta es no, probablemente deberías vender independientemente del precio de compra.',
  },
  'confirmacion': {
    nombre: 'Sesgo de confirmación',
    emoji: '🔍',
    descripcion: 'La tendencia a buscar, interpretar y recordar la información que confirma lo que ya creemos, ignorando la que lo contradice. En inversión, refuerza las convicciones existentes y cierra la mente a señales de alerta.',
    impacto: 'Concentras demasiado en pocas posiciones convencido de que "sabes" lo que va a pasar. Ignorar información contraria puede hacer que mantengas inversiones malas demasiado tiempo.',
    comoEvitar: 'Busca activamente el argumento contrario ("¿por qué podría estar equivocado?"). Lee analistas con opinión diferente a la tuya. El desacuerdo informado es una señal de buen análisis.',
  },
  'manada': {
    nombre: 'Efecto manada',
    emoji: '🐑',
    descripcion: 'Seguir las decisiones de la mayoría asumiendo que "si todo el mundo lo hace, algo sabrán". En mercados financieros, este comportamiento crea burbujas especulativas y su posterior colapso.',
    impacto: 'Compras en máximos cuando el entusiasmo es máximo y vendes en mínimos cuando el pánico es generalizado. Es el patrón exactamente inverso al "compra barato, vende caro".',
    comoEvitar: 'Pregúntate cuál es el argumento fundamental para esta inversión, más allá del precio que marque el mercado o lo que diga tu entorno. Warren Buffett lo resume en: "sé temeroso cuando otros son codiciosos, y codicioso cuando otros son temerosos".',
  },
  'recencia': {
    nombre: 'Sesgo de recencia',
    emoji: '📅',
    descripcion: 'Dar más peso a los eventos recientes que a los datos históricos al formar expectativas. Si el mercado lleva subiendo 3 años, esperas que siga subiendo. Si acaba de caer, esperas más caídas.',
    impacto: 'Aumentas la exposición a riesgo justo antes de una corrección (tras un mercado alcista prolongado) y la reduces en el peor momento (tras una caída, cuando los activos están baratos).',
    comoEvitar: 'Recuerda que la rentabilidad pasada no garantiza la futura. Mantén una asignación de activos fija y rebalancea periódicamente en lugar de perseguir tendencias recientes.',
  },
  'exceso-confianza': {
    nombre: 'Exceso de confianza',
    emoji: '🎯',
    descripcion: 'La tendencia a sobreestimar la propia habilidad, conocimiento y capacidad de predicción. Los estudios muestran que el 80% de los inversores se creen por encima de la media, lo que matemáticamente es imposible.',
    impacto: 'Haces más operaciones de las necesarias (generando más costes y errores). Concentras la cartera en pocas posiciones creyendo que "sabes" qué va a pasar. Hay evidencia sólida de que la mayoría de inversores individuales no baten al índice de referencia a largo plazo.',
    comoEvitar: 'Lleva un registro honesto de tus decisiones y compáralas con un índice pasivo. La humildad epistémica es una ventaja real: si no tienes información que el mercado no tiene, probablemente el índice sea tu mejor opción.',
  },
  'anclaje': {
    nombre: 'Sesgo de anclaje',
    emoji: '⚓',
    descripcion: 'La tendencia a dar un peso desproporcionado al primer dato que recibimos (el "ancla") al tomar decisiones posteriores. En inversión, el precio de compra suele actuar de ancla irracional.',
    impacto: 'Te niegas a vender a un precio razonable porque "lo compré más caro". Estableces objetivos de precio arbitrarios basados en el precio inicial en lugar de en el valor fundamental.',
    comoEvitar: 'El precio que pagaste es irrelevante para la decisión actual. La pregunta es: dado el precio de hoy, ¿compraría esto si tuviera el dinero en efectivo? El mercado no sabe ni le importa cuánto pagaste tú.',
  },
  'statu-quo': {
    nombre: 'Sesgo del statu quo',
    emoji: '🪨',
    descripcion: 'La preferencia por el estado actual de las cosas. Cualquier cambio se percibe como una pérdida potencial en lugar de una oportunidad de mejora. La inercia emocional supera al análisis racional.',
    impacto: 'Mantienes una cartera subóptima por años sin rebalancear. No ajustas la estrategia cuando cambian tus circunstancias vitales (herencia, cambio de trabajo, jubilación próxima). La inacción puede ser tan costosa como una mala decisión activa.',
    comoEvitar: 'Revisa tu cartera al menos una vez al año con criterios predefinidos. Pregúntate: "si hoy construyera esta cartera desde cero, ¿la haría igual?" Si la respuesta es no, actúa en consecuencia.',
  },
};

const ESCENARIOS: Escenario[] = [
  {
    id: 1,
    titulo: 'La oferta segura',
    contexto: 'Tienes 10.000€ para invertir. Tu asesor te presenta dos opciones con exactamente el mismo valor esperado matemático.',
    pregunta: '¿Cuál eliges?',
    opciones: [
      {
        texto: 'A) Ganar 2.000€ asegurados',
        sesgoId: 'aversion-perdidas',
        nivel: 'alto',
        feedbackInmediato: 'Elegir la opción segura cuando el valor esperado es idéntico revela aversión a la incertidumbre. En inversión, esta preferencia lleva a evitar activos volátiles con mejor rentabilidad a largo plazo.',
      },
      {
        texto: 'B) 50% de probabilidad de ganar 4.000€ y 50% de no ganar nada',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Elección racional. Ambas opciones tienen el mismo valor esperado (2.000€). No mostrar preferencia irracional por la seguridad es una ventaja en inversión a largo plazo.',
      },
    ],
  },
  {
    id: 2,
    titulo: 'La acción que no sube',
    contexto: 'Compraste acciones de una empresa a 50€/acción hace un año. Hoy cotizan a 33€ (-34%). Un análisis independiente indica que la empresa tiene problemas estructurales serios.',
    pregunta: '¿Qué haces?',
    opciones: [
      {
        texto: 'A) Vendo. La pérdida ya está hecha y los fundamentales no mejoran',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Decisión racional. La pérdida ya es real independientemente de si vendes o no. Lo relevante es dónde estará el valor en el futuro, no dónde estuvo en el pasado.',
      },
      {
        texto: 'B) Espero a que vuelvan a 50€ para vender sin pérdidas',
        sesgoId: 'efecto-disposicion',
        nivel: 'alto',
        feedbackInmediato: 'Clásico efecto de disposición combinado con anclaje. El precio de compra no es relevante para la decisión actual. El mercado no sabe ni le importa cuánto pagaste tú.',
      },
      {
        texto: 'C) Compro más para bajar mi precio medio de compra',
        sesgoId: 'efecto-disposicion',
        nivel: 'moderado',
        feedbackInmediato: '"Promediar a la baja" puede tener sentido si tienes convicción fundamentada, pero hacerlo por reducir el precio medio psicológico es una señal del efecto de disposición.',
      },
    ],
  },
  {
    id: 3,
    titulo: 'La investigación sesgada',
    contexto: 'Llevas 6 meses invertido en un fondo de energías renovables. El fondo ha bajado un 22%. Te planteas si mantener o salir.',
    pregunta: '¿Qué información buscas para decidir?',
    opciones: [
      {
        texto: 'A) Artículos que expliquen por qué el sector se va a recuperar',
        sesgoId: 'confirmacion',
        nivel: 'alto',
        feedbackInmediato: 'Buscar solo información que confirme lo que quieres creer (que tu inversión se recuperará) es el sesgo de confirmación en acción. Es una de las formas más silenciosas de destruir rentabilidad.',
      },
      {
        texto: 'B) Tanto argumentos a favor como en contra de mantener el sector',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Enfoque correcto. Buscar activamente información que contradiga tu hipótesis es una señal de pensamiento crítico. El desacuerdo informado protege de errores costosos.',
      },
      {
        texto: 'C) El consenso de analistas independientes que no tengan posición en el fondo',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Buena práctica. Recurrir a fuentes sin conflicto de interés y sin posición preestablecida ayuda a reducir el sesgo de confirmación.',
      },
    ],
  },
  {
    id: 4,
    titulo: 'La fiebre del Bitcoin',
    contexto: 'El Bitcoin ha subido un 240% en 8 meses. Todos tus conocidos hablan de él. Un compañero de trabajo dice que ha ganado 15.000€.',
    pregunta: '¿Qué decides?',
    opciones: [
      {
        texto: 'A) Si tanta gente está ganando dinero, algo tiene. Entro ahora',
        sesgoId: 'manada',
        nivel: 'alto',
        feedbackInmediato: 'Clásico efecto manada. Las mayores burbujas financieras de la historia (Tulipanes 1637, Punto-com 2000, Inmobiliaria 2008) se alimentaron exactamente de este razonamiento. La popularidad no es un argumento de inversión.',
      },
      {
        texto: 'B) Una subida tan rápida me preocupa. Esperaré a que haya una corrección o lo evitaré',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Prudencia razonable. La velocidad de subida de un activo no es un argumento para comprarlo. Cuanto más tiempo lleva subiendo y más gente habla de ello, mayor puede ser el riesgo.',
      },
      {
        texto: 'C) Me interesa, pero analizo los fundamentos antes de poner dinero',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Enfoque correcto. Separar el ruido social del análisis fundamental es una ventaja real en mercados impulsados por el comportamiento de masas.',
      },
    ],
  },
  {
    id: 5,
    titulo: 'Los cuatro años buenos',
    contexto: 'La bolsa española ha tenido 4 años consecutivos con rentabilidades positivas (media del +13% anual). Te preguntan qué esperas para los próximos 2 años.',
    pregunta: '¿Cuál es tu expectativa?',
    opciones: [
      {
        texto: 'A) Más subidas. El mercado está en buena racha y la economía va bien',
        sesgoId: 'recencia',
        nivel: 'alto',
        feedbackInmediato: 'Sesgo de recencia claro. Los mercados no tienen memoria: 4 años buenos no hacen más probable un 5º año bueno. De hecho, tras períodos prolongados de subidas las valoraciones suelen ser más exigentes.',
      },
      {
        texto: 'B) No lo sé. El rendimiento pasado no garantiza el futuro',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Respuesta honesta y correcta. La incertidumbre genuina es la postura más realista. Los mercados pueden seguir subiendo, corregir o moverse lateralmente — y nadie lo sabe con certeza.',
      },
      {
        texto: 'C) Probablemente habrá una corrección después de tanto tiempo subiendo',
        sesgoId: 'recencia',
        nivel: 'moderado',
        feedbackInmediato: 'También puede ser un sesgo de recencia en sentido contrario ("mean reversion"). Los mercados pueden seguir subiendo más tiempo del que parece razonable. El tiempo en el mercado supera al timing del mercado.',
      },
    ],
  },
  {
    id: 6,
    titulo: 'El stock picker',
    contexto: 'Llevas 3 años eligiendo acciones individuales de forma activa. Crees que tu análisis y criterio te dan ventaja sobre el mercado.',
    pregunta: '¿Cómo compararías tu rentabilidad con la del índice S&P 500 en ese período?',
    opciones: [
      {
        texto: 'A) Mejor que el índice. Selecciono las empresas con criterio y veo cosas que el mercado no ve',
        sesgoId: 'exceso-confianza',
        nivel: 'alto',
        feedbackInmediato: 'El 85-90% de los fondos de gestión activa no baten al índice a 10 años (datos SPIVA). Para los inversores individuales el porcentaje es aún menor. La confianza en tu capacidad de superar al mercado puede ser muy costosa.',
      },
      {
        texto: 'B) Probablemente similar o inferior. Es muy difícil batir al mercado de forma consistente',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Humildad calibrada con los datos reales. Reconocer que batir al mercado es difícil es el primer paso para tomar decisiones más racionales (y posiblemente más rentables).',
      },
      {
        texto: 'C) No lo he comparado con ningún índice de referencia',
        sesgoId: 'exceso-confianza',
        nivel: 'moderado',
        feedbackInmediato: 'Invertir sin una referencia objetiva es una señal de exceso de confianza implícito. No medir el rendimiento real respecto a una alternativa pasiva hace imposible saber si estás creando o destruyendo valor.',
      },
    ],
  },
  {
    id: 7,
    titulo: 'El precio de compra',
    contexto: 'Compraste un apartamento para invertir por 230.000€ hace 7 años. El mercado actual lo valora en 180.000€. Recibes una oferta en firme de 192.000€.',
    pregunta: '¿Qué decides?',
    opciones: [
      {
        texto: 'A) La rechazo. Yo pagué 230.000€ y no vendo con pérdidas',
        sesgoId: 'anclaje',
        nivel: 'alto',
        feedbackInmediato: 'Sesgo de anclaje claro. El precio que pagaste es un dato del pasado que no cambia el valor actual del activo. La oferta de 192.000€ está por encima del valor de mercado (180.000€) — es objetivamente una buena oferta.',
      },
      {
        texto: 'B) La acepto. Está por encima del precio de mercado actual',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Decisión racional. Evalúas la oferta respecto al valor actual, no respecto al precio que pagaste en el pasado. El mercado no sabe ni le importa tu precio de compra.',
      },
      {
        texto: 'C) Negocio al alza, teniendo como referencia el mercado actual, no lo que pagué',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Correcto. Negociar con el mercado como referencia (no el precio de compra) es el enfoque racional. Si consigues más, mejor — pero la referencia adecuada es el valor actual, no el histórico.',
      },
    ],
  },
  {
    id: 8,
    titulo: 'La cartera abandonada',
    contexto: 'Tu cartera lleva 3 años sin tocar: 60% renta fija, 40% acciones. Con los cambios de mercado, la asignación ha derivado a 45% renta fija, 55% acciones. Tu horizonte y perfil no han cambiado.',
    pregunta: '¿Qué haces?',
    opciones: [
      {
        texto: 'A) No toco nada. Funciona razonablemente y cambiarla implica pensar mucho',
        sesgoId: 'statu-quo',
        nivel: 'alto',
        feedbackInmediato: 'Sesgo del statu quo. La inercia no es una estrategia. Si tu cartera ha derivado de tu asignación objetivo, no rebalancear significa asumir más (o menos) riesgo del que decidiste tomar.',
      },
      {
        texto: 'B) Reviso si la asignación actual sigue siendo adecuada para mis objetivos y ajusto si es necesario',
        sesgoId: null,
        nivel: 'ninguno',
        feedbackInmediato: 'Gestión correcta. Revisar periódicamente y rebalancear cuando la asignación se aleja del objetivo es una práctica básica y eficaz de gestión de carteras.',
      },
      {
        texto: 'C) La dejo como está. Los costes de transacción no justifican el cambio',
        sesgoId: 'statu-quo',
        nivel: 'moderado',
        feedbackInmediato: 'Los costes de transacción son un argumento válido, pero con fondos modernos suelen ser mínimos. Si la desviación es significativa, el coste de no rebalancear (más riesgo del deseado) suele superar al de hacerlo.',
      },
    ],
  },
];

export default function SimuladorSesgosInversorPage() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [sesgosDetectados, setSesgosDetectados] = useState<SesgoDetectado[]>([]);

  const escenario = ESCENARIOS[indice];
  const haRespondido = seleccionada !== null;
  const opcionElegida = seleccionada !== null ? escenario?.opciones[seleccionada] : null;

  function iniciar() {
    setIndice(0);
    setSeleccionada(null);
    setSesgosDetectados([]);
    setFase('test');
  }

  function elegir(i: number) {
    if (haRespondido) return;
    setSeleccionada(i);
    const opcion = escenario.opciones[i];
    if (opcion.sesgoId && opcion.nivel !== 'ninguno') {
      setSesgosDetectados(prev => {
        const existe = prev.find(s => s.id === opcion.sesgoId);
        if (existe) return prev;
        return [...prev, { id: opcion.sesgoId!, nivel: opcion.nivel }];
      });
    }
  }

  function siguiente() {
    if (indice + 1 >= ESCENARIOS.length) {
      setFase('resultado');
    } else {
      setIndice(p => p + 1);
      setSeleccionada(null);
    }
  }

  const sesgosOrdenados = sesgosDetectados.sort((a, b) =>
    a.nivel === 'alto' ? -1 : b.nivel === 'alto' ? 1 : 0
  );

  const sesgosNoDetectados = Object.keys(INFO_SESGOS).filter(
    id => !sesgosDetectados.find(s => s.id === id)
  );

  function getResumenPerfil(): string {
    const altos = sesgosDetectados.filter(s => s.nivel === 'alto').length;
    const total = sesgosDetectados.length;
    if (total === 0) return 'Inversor muy racional. Tus respuestas no revelan sesgos cognitivos evidentes. Sigue así y complementa con una estrategia clara a largo plazo.';
    if (altos >= 4) return 'Alta influencia emocional en tus decisiones financieras. Los sesgos detectados pueden estar costándote rentabilidad de forma sistemática. Prioriza estrategias automáticas y reglas predefinidas.';
    if (altos >= 2) return 'Presencia moderada-alta de sesgos. Como la mayoría de inversores, tus decisiones tienen componentes emocionales que vale la pena trabajar. La toma de conciencia es el primer paso.';
    return 'Sesgos leves o moderados. Tienes una base razonable de pensamiento racional en finanzas, aunque hay aspectos que puedes refinar para mejorar tu toma de decisiones.';
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">🧠</span> Sesgos del Inversor</h1>
        <p className={styles.heroSubtitle}>
          8 escenarios reales para descubrir qué frena tu rentabilidad
        </p>
      </header>

      <LegalNotice />

      <div className={styles.disclaimerWrapper}>
        <DisclaimerCard variant="financial" severity="high" collapsible={false} />
      </div>

      <main className={styles.main}>

        {/* ===== INICIO ===== */}
        {fase === 'inicio' && (
          <div className={styles.inicio}>
            <div className={styles.inicioCard}>
              <p className={styles.inicioIntro}>
                Las finanzas conductuales llevan décadas demostrando que los inversores no somos racionales: tomamos decisiones influenciados por emociones, atajos mentales y sesgos cognitivos que reducen nuestra rentabilidad de forma sistemática.
              </p>
              <p className={styles.inicioIntro}>
                Este simulador presenta <strong>8 escenarios reales</strong> para detectar tus sesgos principales. No hay respuestas correctas ni incorrectas desde el punto de vista moral — solo patrones de comportamiento que conviene conocer.
              </p>
              <div className={styles.sesgosGrid}>
                {Object.entries(INFO_SESGOS).map(([id, info]) => (
                  <div key={id} className={styles.sesgoBadgeInicio}>
                    <span aria-hidden="true">{info.emoji}</span>
                    <span>{info.nombre}</span>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.btnPrimario} onClick={iniciar}>
                Empezar simulación →
              </button>
            </div>
          </div>
        )}

        {/* ===== TEST ===== */}
        {fase === 'test' && escenario && (
          <div className={styles.testArea}>
            <div className={styles.progreso}>
              <div className={styles.progresoInfo}>
                <span>Escenario {indice + 1} de {ESCENARIOS.length}</span>
                <span className={styles.sesgosProgreso}>
                  {sesgosDetectados.length} sesgo{sesgosDetectados.length !== 1 ? 's' : ''} detectado{sesgosDetectados.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className={styles.barraProgreso}>
                <div
                  className={styles.barraRelleno}
                  style={{ width: `${(indice / ESCENARIOS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}><span aria-hidden="true">📋</span> {escenario.titulo}</p>
              <div className={styles.contexto}>
                <p>{escenario.contexto}</p>
              </div>
              <p className={styles.pregunta}>{escenario.pregunta}</p>

              <div className={styles.opcionesLista}>
                {escenario.opciones.map((op, i) => {
                  let clase = styles.opcion;
                  if (haRespondido) {
                    if (i === seleccionada && op.sesgoId) clase = `${styles.opcion} ${styles.opcionSesgo}`;
                    else if (i === seleccionada && !op.sesgoId) clase = `${styles.opcion} ${styles.opcionNeutral}`;
                    else clase = `${styles.opcion} ${styles.opcionApagada}`;
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      className={clase}
                      onClick={() => elegir(i)}
                      disabled={haRespondido}
                      aria-pressed={seleccionada === i}
                    >
                      {op.texto}
                    </button>
                  );
                })}
              </div>

              {haRespondido && opcionElegida && (
                <div className={`${styles.feedback} ${opcionElegida.sesgoId ? styles.feedbackSesgo : styles.feedbackNeutral}`}>
                  {opcionElegida.sesgoId && (
                    <p className={styles.feedbackSesgoNombre}>
                      <span aria-hidden="true">{opcionElegida.nivel === 'alto' ? '🔴' : '🟡'}</span> {INFO_SESGOS[opcionElegida.sesgoId].nombre} detectado
                    </p>
                  )}
                  {!opcionElegida.sesgoId && (
                    <p className={styles.feedbackSesgoNombre}><span aria-hidden="true">✅</span> Decisión racional</p>
                  )}
                  <p className={styles.feedbackTexto}>{opcionElegida.feedbackInmediato}</p>
                  <button type="button" className={styles.btnSiguiente} onClick={siguiente}>
                    {indice + 1 >= ESCENARIOS.length ? 'Ver mi perfil →' : 'Siguiente escenario →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RESULTADO ===== */}
        {fase === 'resultado' && (
          <div className={styles.resultado}>
            <div className={styles.resumenCard}>
              <div className={styles.resumenHeader}>
                <span className={styles.resumenEmoji} aria-hidden="true">
                  {sesgosDetectados.length === 0 ? '🏆' : sesgosDetectados.filter(s => s.nivel === 'alto').length >= 3 ? '⚠️' : '📊'}
                </span>
                <h2 className={styles.resumenTitulo}>
                  {sesgosDetectados.length === 0
                    ? 'Sin sesgos detectados'
                    : `${sesgosDetectados.length} sesgo${sesgosDetectados.length > 1 ? 's' : ''} detectado${sesgosDetectados.length > 1 ? 's' : ''}`}
                </h2>
                <p className={styles.resumenPerfil}>{getResumenPerfil()}</p>
              </div>

              <div className={styles.nivelStats}>
                <div className={styles.nivelStat}>
                  <span className={styles.nivelNum} style={{ color: '#dc2626' }}>
                    {sesgosDetectados.filter(s => s.nivel === 'alto').length}
                  </span>
                  <span className={styles.nivelLabel}><span aria-hidden="true">🔴</span> Alto impacto</span>
                </div>
                <div className={styles.nivelStat}>
                  <span className={styles.nivelNum} style={{ color: '#ca8a04' }}>
                    {sesgosDetectados.filter(s => s.nivel === 'moderado').length}
                  </span>
                  <span className={styles.nivelLabel}><span aria-hidden="true">🟡</span> Moderado</span>
                </div>
                <div className={styles.nivelStat}>
                  <span className={styles.nivelNum} style={{ color: '#16a34a' }}>
                    {sesgosNoDetectados.length}
                  </span>
                  <span className={styles.nivelLabel}><span aria-hidden="true">✅</span> No detectados</span>
                </div>
              </div>
            </div>

            {sesgosOrdenados.length > 0 && (
              <div className={styles.sesgosResultado}>
                <h3 className={styles.seccionTitulo}>Tus sesgos detectados</h3>
                {sesgosOrdenados.map(({ id, nivel }) => {
                  const info = INFO_SESGOS[id];
                  return (
                    <div key={id} className={`${styles.sesgoCard} ${nivel === 'alto' ? styles.sesgoAlto : styles.sesgoModerado}`}>
                      <div className={styles.sesgoCardHeader}>
                        <span className={styles.sesgoEmoji} aria-hidden="true">{info.emoji}</span>
                        <div className={styles.sesgoHeaderTexto}>
                          <h4 className={styles.sesgoNombre}>{info.nombre}</h4>
                          <span className={`${styles.nivelBadge} ${nivel === 'alto' ? styles.nivelBadgeAlto : styles.nivelBadgeModerado}`}>
                            <span aria-hidden="true">{nivel === 'alto' ? '🔴' : '🟡'}</span>{nivel === 'alto' ? ' Impacto alto' : ' Impacto moderado'}
                          </span>
                        </div>
                      </div>
                      <p className={styles.sesgoDesc}>{info.descripcion}</p>
                      <div className={styles.sesgoDetalle}>
                        <div className={styles.sesgoDetalleItem}>
                          <strong>Cómo te afecta:</strong>
                          <p>{info.impacto}</p>
                        </div>
                        <div className={styles.sesgoDetalleItem}>
                          <strong>Cómo mitigarlo:</strong>
                          <p>{info.comoEvitar}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {sesgosNoDetectados.length > 0 && (
              <div className={styles.noDetectados}>
                <h3 className={styles.seccionTitulo}>Sin evidencia de estos sesgos</h3>
                <div className={styles.noDetectadosGrid}>
                  {sesgosNoDetectados.map(id => (
                    <div key={id} className={styles.noDetectadoItem}>
                      <span aria-hidden="true">{INFO_SESGOS[id].emoji}</span>
                      <span>{INFO_SESGOS[id].nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="button" className={styles.btnReiniciar} onClick={iniciar}>
              Repetir simulación
            </button>
          </div>
        )}
      </main>

      <EducationalSection
        title="Psicología del inversor"
        subtitle="Por qué el cerebro humano no está diseñado para invertir — y qué hacer al respecto"
      >
        <p>
          Las finanzas conductuales, impulsadas por los trabajos de Daniel Kahneman y Amos Tversky, demostraron que los inversores no son los agentes racionales que asumía la teoría económica clásica. Operamos con dos sistemas de pensamiento: uno rápido, intuitivo y emocional, y otro lento, analítico y racional. En situaciones de incertidumbre financiera, el primero domina con frecuencia al segundo. El resultado es predecible: compramos caro y vendemos barato, exactamente al revés de lo que maximizaría la rentabilidad.
        </p>

        <h3>Los 8 sesgos y su impacto real</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Sesgo</th>
                <th>Comportamiento típico</th>
                <th>Coste habitual</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>😨 Aversión a pérdidas</strong></td><td>Evitar volatilidad aunque la rentabilidad esperada sea mayor</td><td>Carteras demasiado conservadoras para el horizonte temporal</td></tr>
              <tr><td><strong>📉 Efecto de disposición</strong></td><td>Vender ganadoras pronto, aguantar perdedoras</td><td>Cartera progresivamente peor con el tiempo</td></tr>
              <tr><td><strong>🔍 Sesgo de confirmación</strong></td><td>Buscar solo información que valide la decisión ya tomada</td><td>Mantener inversiones malas ignorando señales de alerta</td></tr>
              <tr><td><strong>🐑 Efecto manada</strong></td><td>Comprar cuando hay euforia generalizada</td><td>Comprar en máximos y vender en mínimos</td></tr>
              <tr><td><strong>📅 Sesgo de recencia</strong></td><td>Extrapolar el pasado reciente al futuro</td><td>Aumentar riesgo antes de correcciones</td></tr>
              <tr><td><strong>🎯 Exceso de confianza</strong></td><td>Creer que se bate al mercado de forma sistemática</td><td>Más operaciones, más costes, menor rentabilidad neta</td></tr>
              <tr><td><strong>⚓ Sesgo de anclaje</strong></td><td>Tomar el precio de compra como referencia para vender</td><td>Mantener activos malos esperando recuperar el precio inicial</td></tr>
              <tr><td><strong>🪨 Statu quo</strong></td><td>No rebalancear por inercia</td><td>Asumir más o menos riesgo del deseado según deriva el mercado</td></tr>
            </tbody>
          </table>
        </div>

        <h3>¿A quién afectan más estos sesgos?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
            <h4>Inversor activo en apps</h4>
            <p>Alta frecuencia de operaciones amplifica el exceso de confianza y el efecto de disposición. Cada operación genera costes y oportunidades de error.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📺</span>
            <h4>Seguidor de noticias financieras</h4>
            <p>Los medios amplifican el sesgo de recencia y el efecto manada. La narrativa del momento domina sobre los fundamentos a largo plazo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💬</span>
            <h4>Inversor por recomendación social</h4>
            <p>El entorno social (amigos, foros, redes) es el principal motor del efecto manada. La presión social deforma la percepción de riesgo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧓</span>
            <h4>Inversor con cartera "heredada"</h4>
            <p>Las carteras que nadie ha revisado en años son el hábitat natural del sesgo de statu quo y del efecto de disposición acumulado.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <p className={styles.faqTip}><strong>¿Tener sesgos significa que soy mal inversor?</strong></p>
            <p>No. Los sesgos cognitivos son universales — afectan incluso a gestores profesionales. La diferencia está en ser consciente de ellos y diseñar procesos que los mitiguen. El autoconocimiento es el primer paso.</p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqTip}><strong>¿Los inversores profesionales también tienen estos sesgos?</strong></p>
            <p>Sí, y hay estudios que lo documentan. De hecho, el 85-90% de los fondos de gestión activa no baten al índice a 10 años (datos SPIVA). La ventaja de un buen proceso no es eliminar los sesgos, sino sistematizar las decisiones para que interfieran menos.</p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqTip}><strong>¿La indexación pasiva elimina los sesgos?</strong></p>
            <p>Elimina muchos de los que se activan en la selección de valores (exceso de confianza, disposición, confirmación). Pero no elimina los relacionados con el timing: el inversor indexado también puede vender en pánico o comprar en euforia. La disciplina de aportación periódica es la mejor vacuna.</p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqTip}><strong>¿Cómo puedo mejorar mis decisiones financieras?</strong></p>
            <p>Automatiza lo que puedas (aportaciones periódicas, rebalanceo automático). Escribe tus tesis de inversión antes de decidir y reléelas después. Compara tu rendimiento con un índice de referencia. Busca activamente el argumento contrario al tuyo antes de actuar.</p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqTip}><strong>¿Cuál es el sesgo más costoso para el inversor medio?</strong></p>
            <p>La aversión a pérdidas combinada con el efecto manada. Este par lleva a comprar tarde (cuando hay euforia) y vender pronto (cuando hay caídas), que es exactamente la secuencia más destructiva de rentabilidad a largo plazo.</p>
          </div>
        </div>

        <h3>Cómo reducir el impacto de tus sesgos</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Escribe tu tesis antes de invertir</strong>
              <p>Anota por qué inviertes en algo, qué precio pagarías, cuándo venderías y qué te haría cambiar de opinión. Releerlo después reduce el sesgo de confirmación.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Automatiza las aportaciones periódicas</strong>
              <p>El Dollar Cost Averaging (aportación fija mensual) elimina las decisiones de timing y neutraliza el efecto manada y el sesgo de recencia.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Define reglas de rebalanceo por adelantado</strong>
              <p>Establece una asignación objetivo y un umbral de desviación (p.ej. 5%) que active el rebalanceo. Así la inercia del statu quo se convierte en una regla, no en una excusa.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Mide tu rentabilidad vs. el índice</strong>
              <p>Compara tu cartera con un índice pasivo comparable cada año. Si llevas 3 años por debajo, el exceso de confianza puede estar costándote más de lo que crees.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Busca el argumento contrario</strong>
              <p>Antes de cualquier decisión importante, pregúntate: "¿por qué podría estar equivocado?". Busca activamente analistas con la opinión opuesta. Si no puedes rebatirlos, reduce tu convicción.</p>
            </div>
          </div>
        </div>

        <h3>Principios para invertir con más racionalidad</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>El precio de compra es irrelevante</strong>
            <p>La única pregunta que importa es: dado el precio de hoy, ¿compraría esto? El pasado no cambia el valor actual.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>La popularidad no es un argumento</strong>
            <p>Que "todo el mundo" invierta en algo suele ser una señal de que el precio ya incorpora el optimismo. Las mejores oportunidades suelen ser incómodas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏳</span>
            <strong>El tiempo en el mercado supera al timing</strong>
            <p>Intentar acertar el momento de entrada y salida es estadísticamente perdedor. La permanencia disciplinada supera al market timing en la gran mayoría de casos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🤖</span>
            <strong>Automatiza para protegerte de ti mismo</strong>
            <p>Las decisiones automatizadas (aportaciones, rebalanceo) eliminan el componente emocional que genera los peores errores de timing.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📝</span>
            <strong>Lleva un diario de decisiones</strong>
            <p>Registrar las decisiones y sus razonamientos permite aprender de los errores reales, no de los que recuerdas selectivamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Revisa, no reacciones</strong>
            <p>Hay diferencia entre revisar la cartera con criterios predefinidos (revisión) y mirar el precio cuando hay noticias y actuar (reacción). La primera es sana; la segunda, peligrosa.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes que amplifican los sesgos</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Mirar la cartera a diario:</strong> la volatilidad a corto plazo activa la aversión a pérdidas sin aportar información útil para decisiones a largo plazo.</li>
            <li><strong>Seguir foros y redes sociales de inversión:</strong> son el amplificador perfecto del efecto manada y del sesgo de confirmación.</li>
            <li><strong>Mezclar el precio de compra con el valor actual:</strong> son dos cosas distintas. Solo el segundo es relevante para decidir qué hacer hoy.</li>
            <li><strong>No tener un benchmark:</strong> sin referencia objetiva, el exceso de confianza crece sin control. Compara siempre con un índice comparable.</li>
            <li><strong>Tomar decisiones bajo estrés o euforia:</strong> las emociones intensas degradan la calidad del pensamiento racional. Si el mercado está en pánico o euforia, es el peor momento para actuar.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-sesgos-inversor')} />
      <ShareCard appName="simulador-sesgos-inversor" />
      <Footer appName="simulador-sesgos-inversor" />
    </div>
  );
}
