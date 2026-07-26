'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RutinaPracticaHabla.module.css';
import {
  MeskeiaLogo,
  Footer,
  RelatedApps,
  LegalNotice,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  AREAS,
  DURACIONES,
  repartirMinutos,
  type AreaId,
  type BloqueConMinutos,
  type Duracion,
} from './rutinas';

/** Contador anónimo: vive solo en el navegador de quien practica. */
const CLAVE_HISTORIAL = 'meskeia_rutina_habla_v1';

interface Historial {
  sesiones: number;
  minutos: number;
  ultimaFecha: string;
  racha: number;
}

const HISTORIAL_VACIO: Historial = { sesiones: 0, minutos: 0, ultimaFecha: '', racha: 0 };

/** Fecha local en formato AAAA-MM-DD, para comparar días sin husos horarios. */
const claveDia = (fecha: Date): string => {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

const formatearReloj = (segundos: number): string => {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
};

export default function RutinaPracticaHablaPage() {
  const [areaId, setAreaId] = useState<AreaId>('fluidez');
  const [duracion, setDuracion] = useState<Duracion>(20);
  const [plan, setPlan] = useState<BloqueConMinutos[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [completada, setCompletada] = useState(false);
  const [avisoSonoro, setAvisoSonoro] = useState(true);
  const [historial, setHistorial] = useState<Historial>(HISTORIAL_VACIO);
  const [anuncio, setAnuncio] = useState('');

  const audioRef = useRef<AudioContext | null>(null);

  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0];

  // Contador local: se lee una vez al abrir la página.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_HISTORIAL);
      if (guardado) setHistorial({ ...HISTORIAL_VACIO, ...JSON.parse(guardado) });
    } catch {
      /* almacenamiento no disponible o dato corrupto: se sigue sin historial */
    }
  }, []);

  const reproducirAviso = useCallback(() => {
    if (!avisoSonoro) return;
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext;
        audioRef.current = new Ctx();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      /* el navegador puede bloquear el audio: el aviso es opcional */
    }
  }, [avisoSonoro]);

  const registrarSesion = useCallback((minutosSesion: number) => {
    setHistorial((previo) => {
      const hoy = claveDia(new Date());
      const ayer = claveDia(new Date(Date.now() - 86400000));

      let racha = previo.racha;
      if (previo.ultimaFecha === hoy) racha = Math.max(1, previo.racha);
      else if (previo.ultimaFecha === ayer) racha = previo.racha + 1;
      else racha = 1;

      const actualizado: Historial = {
        sesiones: previo.sesiones + 1,
        minutos: previo.minutos + minutosSesion,
        ultimaFecha: hoy,
        racha,
      };
      try {
        localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(actualizado));
      } catch {
        /* si no se puede guardar, la sesión sigue siendo válida */
      }
      return actualizado;
    });
  }, []);

  // Cuenta atrás del bloque en curso.
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setSegundos((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  // Fin de bloque: avisa y encadena el siguiente (o cierra la sesión).
  useEffect(() => {
    if (!corriendo || segundos > 0 || !plan) return;

    reproducirAviso();

    if (indice < plan.length - 1) {
      const siguiente = indice + 1;
      setIndice(siguiente);
      setSegundos(plan[siguiente].minutos * 60);
      setAnuncio(`Bloque terminado. Ahora: ${plan[siguiente].titulo}, ${plan[siguiente].minutos} minutos.`);
    } else {
      setCorriendo(false);
      setCompletada(true);
      setAnuncio('Sesión completada.');
      registrarSesion(duracion);
    }
  }, [segundos, corriendo, plan, indice, duracion, reproducirAviso, registrarSesion]);

  const prepararSesion = () => {
    const nuevoPlan = repartirMinutos(area.bloques, duracion);
    setPlan(nuevoPlan);
    setIndice(0);
    setSegundos(nuevoPlan[0].minutos * 60);
    setCorriendo(false);
    setCompletada(false);
    setAnuncio(`Sesión preparada: ${nuevoPlan.length} bloques, ${duracion} minutos.`);
  };

  const saltarBloque = () => {
    if (!plan) return;
    if (indice < plan.length - 1) {
      const siguiente = indice + 1;
      setIndice(siguiente);
      setSegundos(plan[siguiente].minutos * 60);
      setAnuncio(`Bloque saltado. Ahora: ${plan[siguiente].titulo}.`);
    } else {
      setCorriendo(false);
      setCompletada(true);
      setAnuncio('Sesión completada.');
      registrarSesion(duracion);
    }
  };

  const reiniciarBloque = () => {
    if (!plan) return;
    setSegundos(plan[indice].minutos * 60);
  };

  const salirDeSesion = () => {
    setPlan(null);
    setCorriendo(false);
    setCompletada(false);
    setIndice(0);
    setSegundos(0);
  };

  const borrarHistorial = () => {
    try {
      localStorage.removeItem(CLAVE_HISTORIAL);
    } catch {
      /* nada que borrar si el almacenamiento no está disponible */
    }
    setHistorial(HISTORIAL_VACIO);
    setAnuncio('Contador borrado.');
  };

  const bloqueActual = plan ? plan[indice] : null;
  const totalSegundosBloque = bloqueActual ? bloqueActual.minutos * 60 : 1;
  const progreso = bloqueActual ? ((totalSegundosBloque - segundos) / totalSegundosBloque) * 100 : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Rutina Guiada de Práctica del Habla y la Voz</h1>
        <p className={styles.subtitle}>
          Elige qué practicar y cuánto tiempo tienes: la sesión se reparte en bloques y cada uno te lleva
          a la herramienta que necesitas.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" collapsible={false}>
        <p>
          Esta rutina <strong>organiza el tiempo de una sesión de práctica; no es un tratamiento</strong>. No
          evalúa, no diagnostica y no adapta nada a un caso concreto: los bloques son los mismos para todo el
          mundo. No sustituye a la logopedia ni a ninguna otra atención profesional.
        </p>
        <p>
          Si tienes un diagnóstico o estás en tratamiento, <strong>la pauta la marca tu logopeda</strong>: sigue
          la suya y consúltale antes de incorporar cualquiera de estos bloques. Interrumpe la práctica si
          aparece dolor, tensión o cansancio en la garganta, y consulta si la dificultad es reciente o va a más.
        </p>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        <p className={styles.anuncio} role="status" aria-live="polite">{anuncio}</p>

        {!plan && (
          <>
            <section className={styles.bloque}>
              <h2 className={styles.bloqueTitulo}>1. Qué quieres practicar hoy</h2>
              <div className={styles.areasGrid} role="group" aria-label="Área de práctica">
                {AREAS.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    className={`${styles.areaCard} ${areaId === a.id ? styles.areaCardActiva : ''}`}
                    aria-pressed={areaId === a.id}
                    onClick={() => setAreaId(a.id)}
                  >
                    <span className={styles.areaIcono} aria-hidden="true">{a.icono}</span>
                    <span className={styles.areaNombre}>{a.nombre}</span>
                    <span className={styles.areaDescripcion}>{a.descripcion}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.bloque}>
              <h2 className={styles.bloqueTitulo}>2. Cuánto tiempo tienes</h2>
              <div className={styles.toggleGroup} role="group" aria-label="Duración de la sesión">
                {DURACIONES.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={`${styles.toggleBtn} ${duracion === d ? styles.toggleBtnActivo : ''}`}
                    aria-pressed={duracion === d}
                    onClick={() => setDuracion(d)}
                  >
                    {d} minutos
                  </button>
                ))}
              </div>

              <div className={styles.previsualizacion}>
                <h3 className={styles.previsualizacionTitulo}>Así quedaría la sesión</h3>
                <ol className={styles.previsualizacionLista}>
                  {repartirMinutos(area.bloques, duracion).map((b) => (
                    <li key={b.id}>
                      <span className={styles.previsualizacionMin}>{b.minutos} min</span>
                      {b.titulo}
                    </li>
                  ))}
                </ol>
              </div>

              <button type="button" className={styles.btnPrimary} onClick={prepararSesion}>
                Preparar la sesión
              </button>
            </section>
          </>
        )}

        {plan && !completada && bloqueActual && (
          <section className={styles.sesion}>
            <div className={styles.sesionCabecera}>
              <span className={styles.sesionEtiqueta}>
                Bloque {indice + 1} de {plan.length} · {area.nombre}
              </span>
              <button type="button" className={styles.btnTexto} onClick={salirDeSesion}>
                Salir de la sesión
              </button>
            </div>

            <h2 className={styles.bloqueActualTitulo}>{bloqueActual.titulo}</h2>

            <div className={styles.reloj}>
              <span className={styles.relojCifra} aria-live="off">{formatearReloj(segundos)}</span>
              <div
                className={styles.barraProgreso}
                role="progressbar"
                aria-valuenow={Math.round(progreso)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso del bloque ${bloqueActual.titulo}`}
              >
                <div className={styles.barraRelleno} style={{ width: `${progreso}%` }} />
              </div>
            </div>

            <div className={styles.controles}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setCorriendo(!corriendo)}
              >
                {corriendo ? 'Pausar' : 'Empezar'}
              </button>
              <button type="button" className={styles.btnSecondary} onClick={reiniciarBloque}>
                Reiniciar bloque
              </button>
              <button type="button" className={styles.btnSecondary} onClick={saltarBloque}>
                Saltar al siguiente
              </button>
            </div>

            <p className={styles.bloqueDescripcion}>{bloqueActual.descripcion}</p>

            {bloqueActual.herramienta && (
              <div className={styles.herramientaCard}>
                <span className={styles.herramientaEtiqueta}>Herramienta para este bloque</span>
                <a
                  className={styles.herramientaEnlace}
                  href={bloqueActual.herramienta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bloqueActual.herramienta.nombre}
                  <span className={styles.herramientaFlecha} aria-hidden="true"> ↗</span>
                </a>
                <p className={styles.herramientaAjuste}>{bloqueActual.herramienta.ajuste}</p>
                <p className={styles.herramientaAviso}>
                  Se abre en otra pestaña para que el temporizador siga corriendo aquí.
                </p>
              </div>
            )}

            <ol className={styles.listaBloques}>
              {plan.map((b, i) => (
                <li
                  key={b.id}
                  className={[
                    styles.itemBloque,
                    i === indice ? styles.itemBloqueActivo : '',
                    i < indice ? styles.itemBloqueHecho : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className={styles.itemMin}>{b.minutos} min</span>
                  <span>{b.titulo}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {completada && (
          <section className={styles.finSesion}>
            <h2 className={styles.finTitulo}>Sesión completada</h2>
            <p className={styles.finTexto}>
              Has practicado {duracion} minutos de {area.nombre.toLowerCase()}. Lo que sostiene el
              progreso es volver otro día, no alargar la sesión de hoy.
            </p>
            <div className={styles.controles}>
              <button type="button" className={styles.btnPrimary} onClick={prepararSesion}>
                Repetir esta sesión
              </button>
              <button type="button" className={styles.btnSecondary} onClick={salirDeSesion}>
                Elegir otra práctica
              </button>
            </div>
          </section>
        )}

        {/* Contador local */}
        <section className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>Tu constancia</h2>
          <div className={styles.historialGrid}>
            <div className={styles.historialDato}>
              <span className={styles.historialCifra}>{formatNumber(historial.sesiones, 0)}</span>
              <span className={styles.historialEtiqueta}>sesiones</span>
            </div>
            <div className={styles.historialDato}>
              <span className={styles.historialCifra}>{formatNumber(historial.minutos, 0)}</span>
              <span className={styles.historialEtiqueta}>minutos</span>
            </div>
            <div className={styles.historialDato}>
              <span className={styles.historialCifra}>{formatNumber(historial.racha, 0)}</span>
              <span className={styles.historialEtiqueta}>días seguidos</span>
            </div>
          </div>

          <div className={styles.opcionesFila}>
            <label className={styles.checkboxLabel} htmlFor="aviso-sonoro">
              <input
                id="aviso-sonoro"
                type="checkbox"
                checked={avisoSonoro}
                onChange={(e) => setAvisoSonoro(e.target.checked)}
              />
              Aviso sonoro al cambiar de bloque
            </label>
            <button type="button" className={styles.btnTexto} onClick={borrarHistorial}>
              Borrar mi contador
            </button>
          </div>

          <p className={styles.privacidad}>
            <span aria-hidden="true">🔒</span> Estas tres cifras se guardan solo en este navegador. No hay
            nombres, ni cuentas, ni ficheros, ni envío a ningún servidor: si borras los datos de navegación o
            cambias de dispositivo, el contador vuelve a cero.
          </p>
        </section>
      </div>

      <EducationalSection
        icon="🗣️"
        title="Cómo sacar partido a la práctica"
        subtitle="Qué trabaja cada área, cómo encadenar los bloques y cuándo consultar"
      >
        <section className={styles.guideSection}>
          <h2>Por qué una sesión ordenada rinde más que ejercicios sueltos</h2>
          <p>
            meskeIA tiene desde hace tiempo herramientas que sirven para practicar el habla: una guía de
            respiración, ejercicios de vocalización, retroalimentación auditiva retardada, un metrónomo, un
            lector de texto. Sueltas funcionan, pero exigen decidir cada día por dónde empezar, cuánto tiempo
            dedicar a cada cosa y cuándo parar. Esta rutina resuelve esa parte: reparte los minutos que tengas,
            encadena los bloques en un orden con sentido y te deja solo la tarea de practicar.
          </p>

          <h3>Qué trabaja cada área</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption className={styles.tableCaption}>
                Las cuatro áreas se apoyan en herramientas distintas porque atienden a cosas distintas
              </caption>
              <thead>
                <tr>
                  <th scope="col">Área</th>
                  <th scope="col">De qué se ocupa</th>
                  <th scope="col">En qué se apoya</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Fluidez</th>
                  <td>El flujo del habla: bloqueos, repeticiones, ritmo</td>
                  <td>Retardo auditivo y pulso regular</td>
                </tr>
                <tr>
                  <th scope="row">Voz y proyección</th>
                  <td>Sostener el sonido y llegar al final de la frase</td>
                  <td>Respiración y vocales sostenidas</td>
                </tr>
                <tr>
                  <th scope="row">Articulación</th>
                  <td>Precisión de cada sonido y de los finales</td>
                  <td>Separación silábica y repetición marcada</td>
                </tr>
                <tr>
                  <th scope="row">Lectura en voz alta</th>
                  <td>Leer con soltura, sin trabarse ni perder el hilo</td>
                  <td>Texto adaptado y escucha de un modelo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Tres formas de usarla</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🙋</span> Por tu cuenta</h4>
              <p>
                Sabes qué te cuesta y quieres practicarlo con cierto orden. Elige el área, pon 10 minutos
                los primeros días y sube solo cuando el hábito aguante.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🤝</span> Acompañando a alguien</h4>
              <p>
                Sirve de guion para practicar con un familiar: el temporizador marca los tiempos y evita
                la discusión de cuándo parar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">📋</span> Como apoyo profesional</h4>
              <p>
                Un logopeda puede usarla para ordenar el tiempo de una sesión o recomendarla entre citas,
                indicando qué área trabajar y qué bloques omitir.
              </p>
            </div>
          </div>

          <h3>Cómo funciona una sesión</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Elige área y minutos</h4>
                <p>Antes de empezar verás cómo queda el reparto: los bloques y los minutos que toca cada uno.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Abre la herramienta del bloque</h4>
                <p>Se abre en otra pestaña y el temporizador sigue corriendo aquí; vuelve cuando suene el aviso.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Salta lo que no te sirva</h4>
                <p>La rutina es genérica: si un bloque no te encaja, sáltalo. No hay nada que cumplir.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Vuelve otro día</h4>
                <p>El contador de días seguidos está para eso: la regularidad importa más que la duración.</p>
              </div>
            </div>
          </div>

          <h3>Cuatro ideas prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎧</span>
              <h4>Usa auriculares en los bloques de escucha</h4>
              <p>La retroalimentación auditiva necesita auriculares: con altavoz, el micrófono recoge el propio sonido y se acopla.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪑</span>
              <h4>Practica sentado y erguido</h4>
              <p>La postura condiciona la respiración, y la respiración sostiene la voz. Hundirse en el sofá se nota al hablar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📉</span>
              <h4>Menos tiempo, más días</h4>
              <p>Diez minutos cuatro días rinden más que cuarenta de una tacada, y son mucho más fáciles de sostener.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✋</span>
              <h4>Para si molesta</h4>
              <p>Tensión, picor o dolor de garganta son señal de parar ese día, no de insistir con más ganas.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Qué no hace esta rutina</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No evalúa ni diagnostica</strong>: no sabe nada de tu caso y los bloques son idénticos
                para todo el mundo.
              </li>
              <li>
                <strong>No sustituye a la logopedia</strong>: si tienes diagnóstico o tratamiento, la pauta que
                vale es la de tu profesional.
              </li>
              <li>
                <strong>No mide tu progreso</strong>: el contador registra que practicaste, no si lo hiciste
                bien ni si estás mejorando.
              </li>
              <li>
                <strong>No es el sitio para una dificultad nueva</strong>: si la voz o el habla han cambiado de
                forma reciente, eso lo valora un profesional antes de ponerse a practicar.
              </li>
            </ul>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuántos días a la semana conviene practicar?</h4>
              <p>
                No hay una cifra buena para todo el mundo, y desconfía de quien la dé sin conocer el caso. Lo
                que sí es consistente es que la regularidad sostiene el hábito mejor que las sesiones largas
                y espaciadas: por eso la opción más corta es de diez minutos.
              </p>
              <p className={styles.faqTip}>
                Si estás en tratamiento, la frecuencia la marca tu logopeda, no esta herramienta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué se abre cada herramienta en otra pestaña?</h4>
              <p>
                Para que el temporizador siga corriendo mientras practicas. Al volver a esta pestaña
                encontrarás la cuenta donde toca, y el aviso sonoro suena igual aunque estés en la otra.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo cambiar los bloques o el reparto de minutos?</h4>
              <p>
                El reparto es automático según la duración elegida, pero puedes saltar cualquier bloque o
                reiniciarlo. Si un área no te encaja del todo, nada impide usar directamente las herramientas
                sueltas: la rutina es un andamio, no una obligación.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se guarda algo mío?</h4>
              <p>
                Solo el número de sesiones, los minutos acumulados y los días seguidos, y solo en este
                navegador. No hay nombres, ni cuentas, ni ficheros, ni envío a ningún servidor, y puedes
                borrarlo con el botón que hay junto al contador.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('rutina-practica-habla')} />

      <ShareCard appName="rutina-practica-habla" />

      <Footer appName="rutina-practica-habla" />
    </div>
  );
}
