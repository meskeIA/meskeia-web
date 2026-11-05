'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './BuscadorEmojis.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import {
  buscarIntenciones,
  buscarPorEmoji,
  extraerEmojis,
  indexar,
  type Intencion,
} from '@/lib/calculadoras/buscadorEmojis';
import { AVISOS, DESTACADAS, GRUPOS, INTENCIONES } from './intenciones';
import { PREGUNTAS_FRECUENTES } from './metadata';

// El índice no cambia: se construye una vez al cargar el módulo.
const INDICE = indexar(INTENCIONES);
const NOMBRE_GRUPO = new Map(GRUPOS.map((g) => [g.id, g.nombre]));
const EJEMPLOS = ['me alegro', 'lo siento', 'qué bien', 'ánimo', 'feliz cumple', 'te extraño', 'gracias', 'qué vergüenza'];
const MAX_EMOJIS_PEGADOS = 3;

/**
 * Emoji citado dentro de un texto. Aquí el emoji ES la información (de qué se habla), así que no
 * va oculto con aria-hidden: se anuncia con su nombre en español, el mismo en todos los sistemas.
 */
function E({ e, n }: { e: string; n: string }) {
  return (
    <span role="img" aria-label={n}>
      {e}
    </span>
  );
}

export default function BuscadorEmojisPage() {
  const [consulta, setConsulta] = useState('');
  const [grupo, setGrupo] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [estadoCopia, setEstadoCopia] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  const hayConsulta = consulta.trim().length > 0;
  const emojisPegados = useMemo(() => extraerEmojis(consulta).slice(0, MAX_EMOJIS_PEGADOS), [consulta]);

  const lista: readonly Intencion[] = useMemo(() => {
    if (hayConsulta) return buscarIntenciones(consulta, INDICE, 8).map((r) => r.intencion);
    if (grupo) return INTENCIONES.filter((i) => i.grupo === grupo);
    return DESTACADAS.map((id) => INTENCIONES.find((i) => i.id === id)).filter((i): i is Intencion => !!i);
  }, [consulta, hayConsulta, grupo]);

  const tituloLista = hayConsulta
    ? `Para «${consulta.trim()}»`
    : grupo
      ? (NOMBRE_GRUPO.get(grupo) ?? '')
      : 'Lo que más se busca';

  const avisar = (texto: string) => {
    setEstadoCopia(texto);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstadoCopia(''), 2500);
  };

  const copiar = async (texto: string, descripcion: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      avisar(`Copiado: ${descripcion}`);
    } catch {
      avisar('No se ha podido copiar. Selecciónalo y cópialo a mano.');
    }
  };

  const anadir = (emoji: string) => {
    setMensaje((m) => m + emoji);
    avisar(`Añadido al mensaje: ${emoji}`);
  };

  const buscar = (texto: string) => {
    setConsulta(texto);
    setGrupo(null);
    campo.current?.focus();
  };

  const elegirGrupo = (id: string) => {
    setConsulta('');
    setGrupo((actual) => (actual === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>¿Qué emoji pongo?</h1>
        <p className={styles.subtitle}>
          Escribe lo que quieres decir y copia el emoji adecuado, sin poner por error uno que se lea al revés.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador */}
      <section className={styles.card} aria-labelledby="titulo-buscador">
        <h2 id="titulo-buscador" className={styles.cardTitulo}>
          ¿Qué quieres expresar?
        </h2>
        <label htmlFor="consulta-emoji" className={styles.etiqueta}>
          Escríbelo como lo dirías, o pega un emoji para saber qué significa
        </label>
        <input
          ref={campo}
          id="consulta-emoji"
          type="search"
          className={styles.campo}
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setGrupo(null);
          }}
          placeholder="Ej.: me alegro, lo siento, ánimo…"
          autoComplete="off"
          enterKeyHint="search"
        />
        <div className={styles.ejemplos}>
          <span className={styles.ejemplosEtiqueta}>Prueba con:</span>
          {EJEMPLOS.map((ej) => (
            <button key={ej} type="button" className={styles.chip} onClick={() => buscar(ej)}>
              {ej}
            </button>
          ))}
        </div>

        <h3 className={styles.temasTitulo}>O explora por tema</h3>
        <div className={styles.temas}>
          {GRUPOS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${styles.tema} ${grupo === g.id ? styles.temaActivo : ''}`}
              aria-pressed={grupo === g.id}
              onClick={() => elegirGrupo(g.id)}
            >
              <span aria-hidden="true">{g.icono}</span> {g.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Emojis pegados en el buscador */}
      {emojisPegados.length > 0 && (
        <section className={styles.pegados} aria-label="Qué significan los emojis que has pegado">
          {emojisPegados.map((emoji, n) => {
            const info = buscarPorEmoji(emoji, INTENCIONES, AVISOS);
            return (
              <article key={`${emoji}-${n}`} className={styles.pegado}>
                <div className={styles.pegadoCabecera}>
                  <span className={styles.pegadoEmoji}>{emoji}</span>
                  <h3>{info.aviso ? info.aviso.nombre : 'Sin nota especial'}</h3>
                </div>
                <p>
                  {info.aviso
                    ? info.aviso.lecturas
                    : 'No es de los que más se malinterpretan: lo normal es que se lea como lo que dibuja.'}
                </p>
                {info.recomendado.length > 0 && (
                  <div className={styles.pegadoBloque}>
                    <h4>Encaja para</h4>
                    <div className={styles.pegadoChips}>
                      {info.recomendado.slice(0, 8).map((i) => (
                        <button key={i.id} type="button" className={styles.chip} onClick={() => buscar(i.titulo)}>
                          {i.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {info.desaconsejado.length > 0 && (
                  <div className={styles.pegadoBloque}>
                    <h4>Mejor evitarlo en</h4>
                    <div className={styles.pegadoChips}>
                      {info.desaconsejado.slice(0, 8).map((i) => (
                        <button key={i.id} type="button" className={styles.chipAviso} onClick={() => buscar(i.titulo)}>
                          {i.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* Resultados */}
      <section className={styles.resultados} aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados" className={styles.resultadosTitulo}>
          {tituloLista}
        </h2>

        {hayConsulta && lista.length === 0 && emojisPegados.length === 0 && (
          <div className={styles.sinResultados}>
            <p>
              No encontramos esa frase en el diccionario. Prueba con otras palabras, más cortas, o explora por tema.
            </p>
          </div>
        )}

        <div className={styles.intenciones}>
          {lista.map((i) => (
            <article key={i.id} className={styles.intencion}>
              <header className={styles.intencionCabecera}>
                <h3>{i.titulo}</h3>
                <span className={styles.intencionGrupo}>{NOMBRE_GRUPO.get(i.grupo)}</span>
              </header>
              <ul className={styles.emojis}>
                {i.emojis.map(([emoji, nota]) => (
                  <li key={emoji} className={styles.emojiItem}>
                    <button
                      type="button"
                      className={styles.emojiBtn}
                      onClick={() => copiar(emoji, emoji)}
                      aria-label={`Copiar ${emoji}: ${nota}`}
                    >
                      <span className={styles.emojiGrande} aria-hidden="true">
                        {emoji}
                      </span>
                      <span className={styles.emojiNota}>{nota}</span>
                    </button>
                    <button
                      type="button"
                      className={styles.anadirBtn}
                      onClick={() => anadir(emoji)}
                      aria-label={`Añadir ${emoji} al mensaje`}
                      title="Añadir al mensaje"
                    >
                      +
                    </button>
                  </li>
                ))}
              </ul>
              {i.cuidado.length > 0 && (
                <div className={styles.cuidado}>
                  <h4 className={styles.cuidadoTitulo}>
                    <span aria-hidden="true">⚠️</span> Cuidado con
                  </h4>
                  <ul className={styles.cuidadoLista}>
                    {i.cuidado.map(([emoji, motivo]) => (
                      <li key={emoji}>
                        <span className={styles.cuidadoEmoji}>{emoji}</span>
                        <span>{motivo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Componer un mensaje */}
      <section className={styles.card} aria-labelledby="titulo-mensaje">
        <h2 id="titulo-mensaje" className={styles.cardTitulo}>
          Tu mensaje
        </h2>
        <label htmlFor="mensaje-emoji" className={styles.etiqueta}>
          Escribe aquí y añade emojis con el botón «+» de cada uno; después cópialo entero
        </label>
        <textarea
          id="mensaje-emoji"
          className={styles.mensaje}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          placeholder="Ej.: ¡Enhorabuena por el trabajo nuevo!"
        />
        <div className={styles.mensajeAcciones}>
          <button
            type="button"
            className={styles.btnPrimario}
            onClick={() => copiar(mensaje, 'el mensaje')}
            disabled={mensaje.trim().length === 0}
          >
            Copiar mensaje
          </button>
          <button
            type="button"
            className={styles.btnSecundario}
            onClick={() => setMensaje('')}
            disabled={mensaje.length === 0}
          >
            Vaciar
          </button>
        </div>
      </section>

      <p className={styles.estadoCopia} aria-live="polite" role="status">
        {estadoCopia}
      </p>

      {/* Emojis con más de una lectura */}
      <section className={styles.card} aria-labelledby="titulo-avisos">
        <h2 id="titulo-avisos" className={styles.cardTitulo}>
          Emojis que se malinterpretan
        </h2>
        <p className={styles.cardIntro}>
          {AVISOS.length} emojis que no todo el mundo lee igual. Si dudas, acompáñalos de palabras.
        </p>
        <details className={styles.avisosDetalle}>
          <summary className={styles.avisosResumen}>Ver los {AVISOS.length} emojis y sus lecturas</summary>
          <div className={styles.avisosGrid}>
            {AVISOS.map((a) => (
              <div key={a.emoji} className={styles.aviso}>
                <span className={styles.avisoEmoji}>{a.emoji}</span>
                <div>
                  <h3 className={styles.avisoNombre}>{a.nombre}</h3>
                  <p className={styles.avisoLecturas}>{a.lecturas}</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      <DisclaimerCard variant="educational" severity="low" context="buscador-emojis" collapsible={true}>
        <p>
          Las lecturas de cada emoji son orientativas: cambian según la persona, el país, la edad y la confianza entre
          quienes se escriben. Ante la duda, sobre todo en un pésame o en el trabajo, acompaña el emoji de palabras.
        </p>
      </DisclaimerCard>

      <EducationalSection
        title="Cómo elegir bien un emoji"
        subtitle="Las lecturas dobles, las palabras que cambian de país y los errores que más molestan"
      >
        <section className={styles.guideSection}>
          <h2>Un emoji no dice lo mismo para todo el mundo</h2>
          <p>
            Un emoji es un dibujo, y cada persona lo interpreta con su edad, su país y la relación que tiene con quien
            escribe. La mayoría no da problemas: un corazón, una tarta o un avión dicen lo que dibujan. Los delicados son
            las caras y los gestos, porque muchos se usan con un sentido distinto del que parece.
          </p>
          <p>
            Por eso este buscador no parte del nombre del emoji, sino de lo que quieres decir. Cada intención propone
            los emojis que mejor lo expresan y avisa de los que, en ese contexto, pueden entenderse al revés.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Mismo emoji, dos lecturas</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Emoji</th>
                  <th scope="col">Lo que suele querer decir</th>
                  <th scope="col">Cómo puede leerse</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.celdaEmoji}>
                    <E e="🙂" n="cara sonriente leve" />
                  </td>
                  <td>Una sonrisa amable</td>
                  <td>Distante o forzada, sobre todo como única respuesta</td>
                </tr>
                <tr>
                  <td className={styles.celdaEmoji}>
                    <E e="😭" n="cara llorando a mares" />
                  </td>
                  <td>Llanto o tristeza</td>
                  <td>Risa incontrolable o emoción exagerada</td>
                </tr>
                <tr>
                  <td className={styles.celdaEmoji}>
                    <E e="💀" n="calavera" />
                  </td>
                  <td>«Me muero de risa», en redes</td>
                  <td>Muerte o amenaza, para quien no conoce ese uso</td>
                </tr>
                <tr>
                  <td className={styles.celdaEmoji}>
                    <E e="👍" n="pulgar arriba" />
                  </td>
                  <td>Vale, de acuerdo</td>
                  <td>Seco o cortante en una conversación personal</td>
                </tr>
                <tr>
                  <td className={styles.celdaEmoji}>
                    <E e="🙏" n="manos juntas" />
                  </td>
                  <td>Gracias o por favor</td>
                  <td>Rezar, o chocar los cinco</td>
                </tr>
                <tr>
                  <td className={styles.celdaEmoji}>
                    <E e="🤗" n="cara con abrazo" />
                  </td>
                  <td>Un abrazo</td>
                  <td>Un gesto alegre, poco adecuado para un pésame</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Palabras que cambian de país</h2>
          <p>
            El buscador entiende las variantes de España y de Latinoamérica, y algunas cambian el sentido del mensaje:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Expresión</th>
                  <th scope="col">En España suele ser</th>
                  <th scope="col">En buena parte de Latinoamérica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>«Me da pena»</td>
                  <td>Me da tristeza</td>
                  <td>Me da vergüenza</td>
                </tr>
                <tr>
                  <td>«Qué violento»</td>
                  <td>Qué situación tan incómoda</td>
                  <td>Qué agresivo</td>
                </tr>
                <tr>
                  <td>«Ahorita»</td>
                  <td>Se oye poco, salvo en algunas zonas</td>
                  <td>Ahora mismo o dentro de un rato, según el país y el tono</td>
                </tr>
                <tr>
                  <td>«Qué guay», «qué padre», «chévere», «bacán»</td>
                  <td>«Qué guay»</td>
                  <td>«Qué padre» en México, «chévere» en Venezuela o Colombia, «bacán» en Chile o Perú</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Para quién es útil</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🕊️</div>
              <h3>Un pésame en el grupo de la familia</h3>
              <p>
                Es el mensaje donde más daño hace un emoji equivocado. La intención «pésame» propone <E e="🕊️" n="paloma" /> o{' '}
                <E e="🤍" n="corazón blanco" /> y avisa de que <E e="😭" n="cara llorando a mares" /> o{' '}
                <E e="💀" n="calavera" /> pueden leerse como risa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">💼</div>
              <h3>El chat del trabajo</h3>
              <p>
                Felicitar a un compañero o dar las gracias a un cliente pide otro tono. El grupo «Mensajes de trabajo»
                deja fuera los besos y los corazones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">👵</div>
              <h3>Escribir a otra generación</h3>
              <p>
                Lo que en un grupo de amigos es un chiste, a otra persona le puede sonar raro o frío. Las notas de cada
                emoji ayudan a elegir uno que entiendan los dos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🤝</div>
              <h3>Después de un malentendido</h3>
              <p>
                Para disculparte o hacer las paces, un <E e="😅" n="sonrisa con gota de sudor" /> o un{' '}
                <E e="🙃" n="cara al revés" /> pueden empeorarlo. Las intenciones de disculpa proponen emojis que no
                restan seriedad.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo usar el buscador paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                Escribe lo que quieres decir como lo dirías: «me alegro», «qué pena» o «feliz cumple». No hacen falta
                tildes.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                Lee la nota de cada emoji propuesto y elige el que encaje con el tono que buscas.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                Mira el apartado «Cuidado con» antes de enviar: son los emojis que, en ese contexto, pueden molestar.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                Pulsa el emoji para copiarlo, o el «+» para añadirlo a tu mensaje y copiarlo entero al final.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                Pégalo en WhatsApp, Telegram, Instagram o donde vayas a escribir.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Mejores prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">✍️</div>
              <h3>Palabras primero</h3>
              <p>En lo importante, el emoji acompaña al mensaje; no lo sustituye.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">👥</div>
              <h3>Piensa en quién lo recibe</h3>
              <p>La edad, el país y la confianza cambian la lectura más que el propio emoji.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🪞</div>
              <h3>Copia el estilo del otro</h3>
              <p>Si alguien usa pocos emojis, uno bien elegido dice más que cinco.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🧓</div>
              <h3>Prefiere los veteranos</h3>
              <p>Los emojis más nuevos no se ven en móviles y ordenadores antiguos: llegan como un cuadrado.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <span>Errores frecuentes con los emojis</span>
          </div>
          <ul className={styles.warningList}>
            <li>
              Responder a una mala noticia con <E e="😭" n="cara llorando a mares" /> o <E e="💀" n="calavera" />, que
              mucha gente usa para la risa.
            </li>
            <li>
              Disculparse con <E e="😅" n="sonrisa con gota de sudor" /> o <E e="🙃" n="cara al revés" />: le quitan
              seriedad a la disculpa.
            </li>
            <li>
              Contestar solo con <E e="👍" n="pulgar arriba" /> a alguien que se ha esforzado: puede sonar seco.
            </li>
            <li>
              Mandar <E e="😘" n="cara lanzando un beso" /> o <E e="❤️" n="corazón rojo" /> en el chat del trabajo a
              quien no tienes esa confianza.
            </li>
            <li>
              Usar <E e="🔥" n="fuego" />, <E e="😏" n="sonrisa de lado" /> o <E e="🍑" n="melocotón o durazno" /> sin
              pensar en su doble sentido.
            </li>
            <li>Dar por hecho que el otro ve el emoji: los más nuevos pueden llegarle como un cuadrado.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="buscador-emojis" />
      <Footer appName="buscador-emojis" />
    </div>
  );
}
