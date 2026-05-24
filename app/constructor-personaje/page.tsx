'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './ConstructorPersonaje.module.css';

type TabId = 'superficie' | 'psicologia' | 'voz' | 'herida' | 'arco' | 'ficha';

interface PersonajeData {
  nombre: string;
  edad: string;
  profesion: string;
  origen: string;
  apariencia: string;
  deseo: string;
  necesidad: string;
  miedo: string;
  mentira: string;
  contradiccion: string;
  comoHabla: string;
  ticVerbal: string;
  nuncaDiria: string;
  eventoFormativo: string;
  secreto: string;
  relaciones: string;
  dondeEmpieza: string;
  dondePodria: string;
  obstaculoInterno: string;
}

const VACIO: PersonajeData = {
  nombre: '', edad: '', profesion: '', origen: '', apariencia: '',
  deseo: '', necesidad: '', miedo: '', mentira: '', contradiccion: '',
  comoHabla: '', ticVerbal: '', nuncaDiria: '',
  eventoFormativo: '', secreto: '', relaciones: '',
  dondeEmpieza: '', dondePodria: '', obstaculoInterno: '',
};

const HAMLET: PersonajeData = {
  nombre: 'Hamlet, Príncipe de Dinamarca',
  edad: '30 años',
  profesion: 'Príncipe heredero, estudiante de filosofía en Wittenberg',
  origen: 'Elsinore, Dinamarca. Corte real; privilegio y responsabilidad dinástica',
  apariencia: 'Viste de luto incluso cuando ya no procede. Aspecto de quien no ha dormido bien en meses',
  deseo: 'Vengar la muerte de su padre y restaurar el orden moral en Dinamarca',
  necesidad: 'Aceptar la imperfección del mundo y actuar a pesar de la incertidumbre',
  miedo: 'Que la acción, en lugar de reparar el daño, solo genere más caos y corrupción',
  mentira: '"La inacción es sabiduría. Actuar sin certeza absoluta es hacerse cómplice del mal"',
  contradiccion: 'El hombre más inteligente de la obra es también el más paralizado por su propia inteligencia',
  comoHabla: 'Brillante y poético en soliloquios; cambia de registro con facilidad; capaz de fingir locura de forma convincente',
  ticVerbal: 'Preguntas filosóficas en voz alta dirigidas a sí mismo: "¿Soy cobarde?", "¿Ser o no ser?"',
  nuncaDiria: '"No voy a pensar demasiado en esto" o "Manos a la obra, sin más"',
  eventoFormativo: 'La muerte repentina de su padre y el rápido nuevo matrimonio de su madre con el asesino',
  secreto: 'Duda de que el fantasma sea real. ¿Y si es un demonio enviado para que cometa un asesinato injusto?',
  relaciones: 'Usa la crueldad y el rechazo para alejar a quienes ama (Ofelia, Gertrudis) creyendo que los protege',
  dondeEmpieza: 'Paralizado entre el deber de actuar y el terror a actuar con información insuficiente',
  dondePodria: 'La acción llega, pero demasiado tarde para salvar a los inocentes que lo rodeaban',
  obstaculoInterno: 'Su incapacidad para actuar sin certeza absoluta en un mundo donde la certeza no existe',
};

interface CampoProps {
  label: string;
  ayuda: string;
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  placeholder?: string;
}

function Campo({ label, ayuda, valor, onChange, multiline = false, placeholder = '' }: CampoProps) {
  return (
    <div className={styles.campo}>
      <label className={styles.campoLabel}>{label}</label>
      <p className={styles.campoAyuda}>{ayuda}</p>
      {multiline ? (
        <textarea
          className={styles.campoTextarea}
          value={valor}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          type="text"
          className={styles.campoInput}
          value={valor}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function fichaTexto(p: PersonajeData): string {
  const lineas: string[] = [];
  const sep = '═'.repeat(44);

  lineas.push(sep);
  lineas.push(p.nombre || '(Sin nombre)');
  lineas.push(sep);

  const seccion = (titulo: string, campos: [string, string][]) => {
    const activos = campos.filter(([, v]) => v.trim());
    if (!activos.length) return;
    lineas.push('');
    lineas.push(titulo);
    activos.forEach(([k, v]) => lineas.push(`• ${k}: ${v}`));
  };

  seccion('🧍 SUPERFICIE', [
    ['Edad', p.edad],
    ['Profesión', p.profesion],
    ['Origen', p.origen],
    ['Apariencia', p.apariencia],
  ]);
  seccion('🧠 PSICOLOGÍA', [
    ['Deseo (lo que busca)', p.deseo],
    ['Necesidad (lo que necesita de verdad)', p.necesidad],
    ['Miedo central', p.miedo],
    ['Mentira que se cree', p.mentira],
    ['Contradicción principal', p.contradiccion],
  ]);
  seccion('🗣️ VOZ', [
    ['Cómo habla', p.comoHabla],
    ['Tic verbal', p.ticVerbal],
    ['Nunca diría', p.nuncaDiria],
  ]);
  seccion('🩹 HERIDA', [
    ['Evento formativo', p.eventoFormativo],
    ['Secreto', p.secreto],
    ['En sus relaciones', p.relaciones],
  ]);
  seccion('🔄 ARCO', [
    ['Al inicio de la historia', p.dondeEmpieza],
    ['Destino potencial', p.dondePodria],
    ['Obstáculo interno', p.obstaculoInterno],
  ]);

  return lineas.join('\n');
}

const TOTAL_CAMPOS = Object.keys(VACIO).length;

export default function ConstructorPersonajePage() {
  const [tab, setTab] = useState<TabId>('superficie');
  const [personaje, setPersonaje] = useState<PersonajeData>(VACIO);
  const [copiado, setCopiado] = useState(false);

  const actualizar = useCallback(
    (campo: keyof PersonajeData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPersonaje((prev) => ({ ...prev, [campo]: e.target.value }));
      },
    []
  );

  const camposRellenos = Object.values(personaje).filter((v) => v.trim().length > 0).length;
  const progreso = Math.round((camposRellenos / TOTAL_CAMPOS) * 100);

  const copiar = useCallback(() => {
    const texto = fichaTexto(personaje);
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }, [personaje]);

  const TABS: { id: TabId; icono: string; titulo: string }[] = [
    { id: 'superficie', icono: '🧍', titulo: 'Superficie' },
    { id: 'psicologia', icono: '🧠', titulo: 'Psicología' },
    { id: 'voz', icono: '🗣️', titulo: 'Voz' },
    { id: 'herida', icono: '🩹', titulo: 'Herida' },
    { id: 'arco', icono: '🔄', titulo: 'Arco' },
    { id: 'ficha', icono: '📋', titulo: 'Ficha' },
  ];

  const seccionesFicha: { titulo: string; icono: string; campos: [string, keyof PersonajeData][] }[] = [
    {
      titulo: 'Superficie',
      icono: '🧍',
      campos: [
        ['Edad', 'edad'],
        ['Profesión', 'profesion'],
        ['Origen', 'origen'],
        ['Apariencia', 'apariencia'],
      ],
    },
    {
      titulo: 'Psicología',
      icono: '🧠',
      campos: [
        ['Deseo (lo que busca)', 'deseo'],
        ['Necesidad (lo que necesita de verdad)', 'necesidad'],
        ['Miedo central', 'miedo'],
        ['Mentira que se cree', 'mentira'],
        ['Contradicción principal', 'contradiccion'],
      ],
    },
    {
      titulo: 'Voz',
      icono: '🗣️',
      campos: [
        ['Cómo habla', 'comoHabla'],
        ['Tic verbal', 'ticVerbal'],
        ['Nunca diría', 'nuncaDiria'],
      ],
    },
    {
      titulo: 'Herida',
      icono: '🩹',
      campos: [
        ['Evento formativo', 'eventoFormativo'],
        ['Secreto', 'secreto'],
        ['En sus relaciones', 'relaciones'],
      ],
    },
    {
      titulo: 'Arco',
      icono: '🔄',
      campos: [
        ['Al inicio de la historia', 'dondeEmpieza'],
        ['Destino potencial', 'dondePodria'],
        ['Obstáculo interno', 'obstaculoInterno'],
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Constructor de Personaje</h1>
        <p className={styles.heroSubtitle}>
          19 dimensiones para crear personajes que el lector no olvida.
          Psicología, voz, herida y arco interno en una ficha lista para usar.
        </p>
      </header>

      <LegalNotice />

      {/* Barra de acciones y progreso */}
      <div className={styles.accionesBar}>
        <div className={styles.accionesBtns}>
          <button
            className={styles.btnEjemplo}
            onClick={() => { setPersonaje(HAMLET); setTab('superficie'); }}
          >
            <span aria-hidden="true">📖</span> Ver ejemplo (Hamlet)
          </button>
          <button
            className={styles.btnLimpiar}
            onClick={() => { setPersonaje(VACIO); setTab('superficie'); }}
          >
            <span aria-hidden="true">🗑️</span> Nuevo personaje
          </button>
        </div>
        <div className={styles.progreso}>
          <div className={styles.progresoBar}>
            <div
              className={styles.progresoRelleno}
              style={{ width: `${progreso}%` }}
              role="progressbar"
              aria-valuenow={camposRellenos}
              aria-valuemin={0}
              aria-valuemax={TOTAL_CAMPOS}
            />
          </div>
          <span className={styles.progresoTexto}>{camposRellenos}/{TOTAL_CAMPOS} campos</span>
        </div>
      </div>

      {/* Tabs */}
      <nav className={styles.tabsNav} role="tablist" aria-label="Secciones del constructor">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
          >
            <span aria-hidden="true">{t.icono}</span>
            <span className={styles.tabNombre}>{t.titulo}</span>
          </button>
        ))}
      </nav>

      {/* Contenido de tabs */}
      <div className={styles.tabContent} role="tabpanel">
        {tab === 'superficie' && (
          <>
            <Campo
              label="Nombre"
              ayuda="El nombre que usa en el mundo. Puede ser apodo, nombre completo o nombre artístico."
              valor={personaje.nombre}
              onChange={actualizar('nombre')}
              placeholder="Ej: Elena Varga, El Capitán, Lola"
            />
            <Campo
              label="Edad"
              ayuda="Edad aproximada o rango. La edad define qué generación marcó su infancia y qué le queda por delante."
              valor={personaje.edad}
              onChange={actualizar('edad')}
              placeholder="Ej: 34 años, entre 40 y 45, adolescente tardía"
            />
            <Campo
              label="Profesión u ocupación"
              ayuda="Qué hace para ganarse la vida o cómo ocupa su tiempo. Revela posición social, rutinas y qué sabe hacer bien."
              valor={personaje.profesion}
              onChange={actualizar('profesion')}
              placeholder="Ej: detective privado, médica rural, estudiante de arquitectura"
            />
            <Campo
              label="Origen y contexto social"
              ayuda="De dónde viene y qué clase o entorno lo formó. El origen explica muchas de sus contradicciones."
              valor={personaje.origen}
              onChange={actualizar('origen')}
              multiline
              placeholder="Ej: Buenos Aires, clase media venida a menos. Hijo único de padres divorciados."
            />
            <Campo
              label="Apariencia y presencia"
              ayuda="Cómo lo ve el mundo: no solo su aspecto físico, sino la impresión que deja. ¿Qué intenta mostrar? ¿Qué no puede ocultar?"
              valor={personaje.apariencia}
              onChange={actualizar('apariencia')}
              multiline
              placeholder="Ej: Siempre bien vestida, pero los zapatos revelan que no llega a todo."
            />
          </>
        )}

        {tab === 'psicologia' && (
          <>
            <Campo
              label="Deseo (lo que busca conscientemente)"
              ayuda="El objetivo externo y concreto que el personaje persigue a lo largo de la historia. Lo que cree que lo hará feliz o le resolverá el problema."
              valor={personaje.deseo}
              onChange={actualizar('deseo')}
              multiline
              placeholder="Ej: Encontrar al asesino de su hermano. Conseguir el ascenso. Que su hija vuelva a casa."
            />
            <Campo
              label="Necesidad (lo que necesita de verdad)"
              ayuda="Lo que el personaje realmente necesita para estar completo, aunque no lo sepa. Suele ser opuesto o complementario al deseo. El arco consiste en descubrirla."
              valor={personaje.necesidad}
              onChange={actualizar('necesidad')}
              multiline
              placeholder="Ej: Aprender a delegar el control. Perdonarse a sí mismo. Confiar en los demás."
            />
            <Campo
              label="Miedo central"
              ayuda="El miedo que determina sus decisiones más importantes, aunque no siempre sea consciente de él. Es lo que lo paraliza o lo mueve de forma irracional."
              valor={personaje.miedo}
              onChange={actualizar('miedo')}
              multiline
              placeholder="Ej: Ser abandonado de nuevo. Descubrir que no es tan bueno como cree. Perder el control."
            />
            <Campo
              label="Mentira que se cree"
              ayuda="La creencia falsa sobre sí mismo, los demás o el mundo que el personaje sostiene como verdad. El arco del personaje suele consistir en cuestionar esta mentira."
              valor={personaje.mentira}
              onChange={actualizar('mentira')}
              multiline
              placeholder='Ej: "Solo puedo contar conmigo mismo." / "No merezco ser querido." / "El fin justifica los medios."'
            />
            <Campo
              label="Contradicción o paradoja interna"
              ayuda="La tensión más interesante del personaje: dos rasgos opuestos que conviven en él. Los mejores personajes son contradictorios porque las personas lo son."
              valor={personaje.contradiccion}
              onChange={actualizar('contradiccion')}
              multiline
              placeholder="Ej: Cuida con devoción a los demás pero es incapaz de pedir ayuda. Valiente en batalla, cobarde en el amor."
            />
          </>
        )}

        {tab === 'voz' && (
          <>
            <Campo
              label="Cómo habla"
              ayuda="Registro, ritmo, vocabulario característico. ¿Usa frases cortas o largas? ¿Sarcasmo? ¿Vocabulario técnico? ¿Evita ciertos temas? La voz revela quién es sin decirlo explícitamente."
              valor={personaje.comoHabla}
              onChange={actualizar('comoHabla')}
              multiline
              placeholder="Ej: Directo, sin rodeos, sarcasmo defensivo. Cambia al modo formal cuando se siente inseguro."
            />
            <Campo
              label="Tic verbal o expresión recurrente"
              ayuda="Una frase, muletilla o giro que usa a menudo. No tiene que ser un cliché: puede ser una pregunta que siempre hace, una metáfora que repite, una forma particular de empezar las frases."
              valor={personaje.ticVerbal}
              onChange={actualizar('ticVerbal')}
              placeholder='Ej: "Ya sabes cómo es esto..." / empieza las frases con "Mira," / termina con "¿entiendes?"'
            />
            <Campo
              label="Lo que nunca diría"
              ayuda="Una frase que este personaje específico no pronunciaría jamás. Ayuda a fijar sus límites de carácter y detectar cuando algo suena falso al escribirlo."
              valor={personaje.nuncaDiria}
              onChange={actualizar('nuncaDiria')}
              placeholder='Ej: "Te necesito." / "No sé, tú decides." / "Estoy muy bien, gracias."'
            />
          </>
        )}

        {tab === 'herida' && (
          <>
            <Campo
              label="Evento formativo o herida del pasado"
              ayuda="El acontecimiento (o período) que lo marcó de forma definitiva y que explica su miedo central, su mentira y su forma de relacionarse. No tiene que ser traumático en sentido clínico: puede ser una ausencia, una traición o una pérdida de fe."
              valor={personaje.eventoFormativo}
              onChange={actualizar('eventoFormativo')}
              multiline
              placeholder="Ej: Su madre lo dejó en casa de unos tíos cuando tenía 8 años y tardó dos años en volver."
            />
            <Campo
              label="Secreto que guarda"
              ayuda="Algo que el personaje no ha contado a nadie, o casi nadie. El secreto puede ser una acción, una creencia o una experiencia. No hace falta que sea dramático: a veces los secretos cotidianos son los más reveladores."
              valor={personaje.secreto}
              onChange={actualizar('secreto')}
              multiline
              placeholder="Ej: Fue él quien denunció a su mejor amigo hace diez años. Aún no sabe si hizo lo correcto."
            />
            <Campo
              label="Patrón en sus relaciones"
              ayuda="Qué hace de forma repetida en sus relaciones que acaba dañándolas o protegiéndolas. El patrón viene de la herida y del miedo, y se repite hasta que el personaje lo reconoce."
              valor={personaje.relaciones}
              onChange={actualizar('relaciones')}
              multiline
              placeholder="Ej: Se vuelve imprescindible para los demás hasta que los ahoga. O: desaparece justo cuando la relación se vuelve importante."
            />
          </>
        )}

        {tab === 'arco' && (
          <>
            <Campo
              label="Estado interno al inicio de la historia"
              ayuda="No lo que le pasa externamente, sino cómo está por dentro cuando empieza la historia. Su punto de partida emocional o moral: lo que el lector ve antes de que nada cambie."
              valor={personaje.dondeEmpieza}
              onChange={actualizar('dondeEmpieza')}
              multiline
              placeholder="Ej: Cínico y cerrado, convencido de que nadie cambia de verdad. Funcional pero vacío."
            />
            <Campo
              label="Destino potencial del arco"
              ayuda="Adónde podría llegar internamente si la historia hace su trabajo. No tiene que ser un final feliz: puede ser una caída, una revelación o una elección trágica. El arco es la distancia entre el inicio y aquí."
              valor={personaje.dondePodria}
              onChange={actualizar('dondePodria')}
              multiline
              placeholder="Ej: Aprende a pedir ayuda, aunque le cueste la vida. / Elige la seguridad sobre el amor y vive sabiendo lo que perdió."
            />
            <Campo
              label="Obstáculo interno principal"
              ayuda="Lo que el personaje debe superar dentro de sí mismo para completar su arco. Suele ser la mentira que se cree convertida en comportamiento: la forma en que su propio carácter le impide conseguir lo que necesita."
              valor={personaje.obstaculoInterno}
              onChange={actualizar('obstaculoInterno')}
              multiline
              placeholder="Ej: Su necesidad de tener razón le impide escuchar a quien podría salvarle. / Su miedo al abandono le hace abandonar primero."
            />
          </>
        )}

        {tab === 'ficha' && (
          <div className={styles.fichaPanel}>
            {camposRellenos === 0 ? (
              <div className={styles.fichaVacio}>
                <p>La ficha aparecerá aquí a medida que rellenes los campos.</p>
                <button className={styles.btnEjemplo} onClick={() => { setPersonaje(HAMLET); setTab('superficie'); }}>
                  <span aria-hidden="true">📖</span> Cargar ejemplo (Hamlet)
                </button>
              </div>
            ) : (
              <>
                <div className={styles.fichaAcciones}>
                  <h2 className={styles.fichaNombre}>{personaje.nombre || '(Sin nombre)'}</h2>
                  <button
                    className={`${styles.copyBtn} ${copiado ? styles.copyBtnOk : ''}`}
                    onClick={copiar}
                  >
                    {copiado ? '✓ Copiada' : '📋 Copiar ficha'}
                  </button>
                </div>
                {seccionesFicha.map((seccion) => {
                  const camposActivos = seccion.campos.filter(([, k]) => personaje[k].trim());
                  if (!camposActivos.length) return null;
                  return (
                    <div key={seccion.titulo} className={styles.fichaSeccion}>
                      <h3 className={styles.fichaSeccionTitulo}>
                        <span aria-hidden="true">{seccion.icono}</span> {seccion.titulo}
                      </h3>
                      <dl className={styles.fichaItems}>
                        {camposActivos.map(([label, key]) => (
                          <div key={key} className={styles.fichaItem}>
                            <dt className={styles.fichaItemLabel}>{label}</dt>
                            <dd className={styles.fichaItemValor}>{personaje[key]}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      <EducationalSection
        title="El arte de crear personajes memorables"
        subtitle="Por qué algunos personajes nos siguen durante años y otros se olvidan al terminar el libro"
      >
        <h3>Tipos de personajes según su complejidad</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Características</th>
                <th>Cuándo usarlo</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Personaje plano</td><td>Una dimensión dominante, predecible, sin contradicción</td><td>Personajes secundarios, antagonistas funcionales</td><td>El mayordomo leal de una novela victoriana</td></tr>
              <tr><td>Personaje redondo</td><td>Múltiples dimensiones, contradictorio, sorprende de forma creíble</td><td>Protagonistas, personajes que cargan el peso de la historia</td><td>Hamlet, Anna Karénina, Walter White</td></tr>
              <tr><td>Personaje estático</td><td>No cambia internamente, permanece igual al final</td><td>Cuando el entorno cambia, no el personaje; sátira</td><td>Don Quijote (su locura es constante)</td></tr>
              <tr><td>Personaje dinámico</td><td>Cambia de forma significativa como resultado de los eventos</td><td>Protagonistas con arco completo</td><td>Frodo, Raskolnikov, Jay Gatsby</td></tr>
              <tr><td>Personaje foil</td><td>Contrasta con el protagonista para destacar sus rasgos</td><td>Mejor amigo, rival, mentor</td><td>Horacio frente a Hamlet</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Para qué tipo de escritor es esta herramienta</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>📖 Escritor de novela</strong>
            <p>Rellena la ficha antes de escribir el primer capítulo. Las dimensiones de psicología y arco te evitarán incoherencias de carácter en el tercer acto.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🎬 Guionista</strong>
            <p>El deseo y la necesidad son los dos motores del guión. Si tienes ambos claros desde el principio, el conflicto se escribe casi solo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📝 Escritor de relato corto</strong>
            <p>No tienes que rellenar los 19 campos: con nombre, deseo, miedo y un tic verbal ya tienes un personaje coherente para una historia corta.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🎲 Jugador o narrador de rol</strong>
            <p>La sección de Voz y el tic verbal son especialmente útiles para interpretar en mesa. El secreto y el evento formativo dan material para sesiones de trasfondo.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes sobre la creación de personajes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Tengo que rellenar todos los campos para que funcione?</strong>
            <p>No. Los campos más importantes para un arco funcional son: deseo, necesidad, miedo y obstáculo interno. El resto enriquece pero no es indispensable. Un personaje coherente puede construirse con 6-8 dimensiones bien pensadas.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre deseo y necesidad?</strong>
            <p>El deseo es lo que el personaje persigue conscientemente (ganar el juicio, encontrar el tesoro, recuperar a la persona amada). La necesidad es lo que necesita para estar completo como ser humano, y generalmente no lo sabe. La tensión entre ambos crea el arco dramático.</p>
            <div className={styles.faqTip}>En El diablo viste de Prada: Andy desea triunfar en la moda. Necesita entender qué cosas no está dispuesta a sacrificar. El arco la lleva a elegir.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la "mentira que se cree"?</strong>
            <p>Es la creencia falsa que el personaje sostiene sobre sí mismo o el mundo, generalmente como mecanismo de defensa ante su herida. El arco del personaje consiste en que esa mentira sea cuestionada — y elegir si la abandona o se aferra a ella.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puede un personaje tener varios miedos o contradicciones?</strong>
            <p>Sí, pero es mejor identificar el miedo central y la contradicción principal antes de añadir capas. Un personaje con diez miedos igualmente importantes resulta difuso. Elige el que determina sus decisiones más importantes.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Tiene que haber un arco en todos los personajes?</strong>
            <p>No. Los personajes secundarios pueden ser planos y estáticos sin problema. El personaje protagonista suele tener un arco, pero existen protagonistas estáticos muy efectivos (James Bond, Sherlock Holmes) cuyo valor está en cómo revelan a los personajes secundarios.</p>
          </li>
        </ul>

        <h3>Cómo construir un personaje con esta ficha</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por la psicología, no por la superficie</strong>
              <p>El nombre y la apariencia son lo último que importa. Primero define el deseo, la necesidad y el miedo: de ellos emergen de forma natural las decisiones de personaje que darán coherencia a todo lo demás.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Busca la contradicción, no la perfección</strong>
              <p>Los personajes interesantes son contradictorios porque las personas lo son. Un médico que cuida a los demás pero no puede cuidarse a sí mismo es más interesante que un médico heroico sin fisuras.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Conecta la herida con el comportamiento actual</strong>
              <p>La herida del pasado no es solo historia: explica el miedo, la mentira y el patrón en las relaciones. Si no puedes trazar esa conexión, probablemente la herida aún no está bien definida.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Define la voz antes de escribir el primer diálogo</strong>
              <p>El tic verbal y la frase que nunca diría son pruebas de fuego mientras escribes. Si un diálogo no suena consistente con la voz que has definido, el problema está en el diálogo, no en la voz.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Usa la ficha como diagnóstico en la revisión</strong>
              <p>Cuando algo en el personaje no funciona en el borrador, vuelve a la ficha. A menudo el problema es que el personaje actúa contra su miedo central sin que la historia haya justificado ese cambio, o que habla de una forma que contradice su voz definida.</p>
            </div>
          </li>
        </ol>

        <h3>Lo que una ficha de personaje no puede hacer</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✍️</span>
            <strong>No sustituye a la escritura</strong>
            <p>Una ficha perfecta con un personaje vacío en la página no sirve de nada. La ficha es un andamiaje: una vez que el personaje cobra vida en el texto, puede sorprenderte con decisiones que no planificaste.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>El personaje puede cambiar al escribir</strong>
            <p>Si el personaje "te pide" algo diferente mientras escribes, no lo ignores. Vuelve a la ficha y actualízala. El personaje escrito siempre tiene prioridad sobre el personaje planificado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎭</span>
            <strong>No todos los campos aplican a todos los géneros</strong>
            <p>En una comedia ligera o un thriller de acción, la dimensión psicológica puede ser más superficial. En una novela literaria o de personaje, las secciones de herida y arco son las más importantes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <strong>Los secundarios no necesitan ficha completa</strong>
            <p>Para personajes secundarios con pocas escenas, basta con una dimensión dominante, un tic verbal y una relación clara con el protagonista. No sobre-construyas personajes que no van a cargar el peso de la historia.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💡</span>
            <strong>No hace falta conocer todo antes de empezar</strong>
            <p>Algunos escritores descubren el miedo central o la herida del personaje solo después de haber escrito varios capítulos. La ficha puede rellenarse gradualmente a medida que conoces a tu personaje.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al crear personajes
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Confundir backstory con carácter: el pasado explica al personaje, pero el carácter se define por lo que hace cuando tiene que elegir.</li>
            <li><span aria-hidden="true">❌</span> Crear personajes sin defecto real: un personaje "demasiado perfecto" no genera conflicto interno ni permite arco. El defecto no tiene que ser moral: puede ser una limitación, un punto ciego o una habilidad aplicada en el momento equivocado.</li>
            <li><span aria-hidden="true">❌</span> Deseo y necesidad idénticos: si lo que busca es lo mismo que lo que necesita, no hay arco posible. El motor dramático vive en la tensión entre ambos.</li>
            <li><span aria-hidden="true">❌</span> Voz inconsistente: el personaje habla de forma diferente en cada escena sin que haya un motivo narrativo. Define la voz antes de escribir los diálogos.</li>
            <li><span aria-hidden="true">❌</span> La herida como decoración: incluir un trauma en el pasado sin que afecte las decisiones actuales del personaje es decoración, no psicología. La herida debe traducirse en comportamiento visible.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('constructor-personaje')} />
      <ShareCard appName="constructor-personaje" />
      <Footer appName="constructor-personaje" />
    </div>
  );
}
