'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './TecladoBarridoSwitch.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import {
  construirFilas,
  nombreTecla,
  siguienteIndice,
  LETRAS_ALFABETICO,
  LETRAS_POR_FRECUENCIA,
} from './barrido';

type Fase = 'fila' | 'columna';
type Orden = 'frecuencia' | 'alfabetico';

const VELOCIDAD_MIN = 500;
const VELOCIDAD_MAX = 3000;
const VELOCIDAD_INICIAL = 1200;

export default function TecladoBarridoSwitchPage() {
  const [orden, setOrden] = useState<Orden>('frecuencia');
  const filas = useMemo(
    () => construirFilas(orden === 'frecuencia' ? LETRAS_POR_FRECUENCIA : LETRAS_ALFABETICO),
    [orden]
  );

  const [activo, setActivo] = useState(false);
  const [fase, setFase] = useState<Fase>('fila');
  const [filaActual, setFilaActual] = useState(0);
  const [columnaActual, setColumnaActual] = useState(0);
  const [velocidad, setVelocidad] = useState(VELOCIDAD_INICIAL);

  const [teclaSwitch, setTeclaSwitch] = useState('Space');
  const [capturando, setCapturando] = useState(false);

  const [texto, setTexto] = useState('');
  const [avisoVoz, setAvisoVoz] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Cambiar el orden de las letras reordena las filas: reiniciar el barrido evita
  // quedarse apuntando a una fila o columna que ya no existe en la cuadrícula nueva.
  useEffect(() => {
    setFase('fila');
    setFilaActual(0);
    setColumnaActual(0);
  }, [orden]);

  // Temporizador de barrido automático (fase fila o fase columna, según toque)
  useEffect(() => {
    if (!activo) return undefined;
    const totalFilas = filas.length;
    const totalColumnas = filas[filaActual]?.length ?? 1;

    const id = setInterval(() => {
      if (fase === 'fila') {
        setFilaActual((f) => siguienteIndice(f, totalFilas));
      } else {
        setColumnaActual((c) => siguienteIndice(c, totalColumnas));
      }
    }, velocidad);

    return () => clearInterval(id);
  }, [activo, fase, filaActual, filas, velocidad]);

  const leerEnVozAlta = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !texto.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  }, [texto]);

  // Aviso hablado opcional de cada fila/celda resaltada — pensado para velocidades
  // lentas (2 s o más); a velocidades rápidas la voz no llega a terminar la frase.
  const anunciar = useCallback(
    (mensaje: string) => {
      if (!avisoVoz || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(mensaje);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    },
    [avisoVoz]
  );

  const ejecutarTecla = useCallback(
    (id: string) => {
      if (id === '__espacio__') setTexto((t) => t + ' ');
      else if (id === '__borrar__') setTexto((t) => t.slice(0, -1));
      else if (id === '__limpiar__') setTexto('');
      else if (id === '__leer__') leerEnVozAlta();
      else setTexto((t) => t + id);
    },
    [leerEnVozAlta]
  );

  // El "switch": una única activación, venga de una tecla, un clic o un toque.
  // En fase fila, fija la fila y pasa a recorrer sus columnas; en fase columna,
  // selecciona la celda resaltada y vuelve a empezar desde la primera fila.
  const activar = useCallback(() => {
    if (!activo) return;
    if (fase === 'columna') {
      const tecla = filas[filaActual]?.[columnaActual];
      if (tecla) ejecutarTecla(tecla.id);
      setFase('fila');
      setFilaActual(0);
      setColumnaActual(0);
    } else {
      setFase('columna');
      setColumnaActual(0);
      const fila = filas[filaActual];
      if (fila) anunciar(`Fila: ${fila.map((t) => t.etiqueta).join(', ')}`);
    }
  }, [activo, fase, filaActual, columnaActual, filas, ejecutarTecla, anunciar]);

  // Anuncia cada celda al recorrerla en fase columna (si el aviso de voz está activo)
  useEffect(() => {
    if (!activo || fase !== 'columna') return;
    const tecla = filas[filaActual]?.[columnaActual];
    if (tecla) anunciar(tecla.aria);
    // Debe dispararse solo al cambiar de celda, no en cada render de `anunciar`/`filas`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnaActual]);

  // `activar` cambia de identidad en cada paso del barrido (depende de fase/fila/columna,
  // que avanzan solas cada pocos cientos de ms mientras está activo). Si el listener de
  // keydown dependiera directamente de `activar`, se desengancharía y reengancharía sin
  // parar durante el barrido, y esa rotación tan frecuente dejaba colarse pulsaciones con
  // un closure obsoleto (`capturando` volvía a leerse `true` sin que nadie repitiera el
  // clic en «Cambiar»). Con la ref, el listener solo se reengancha cuando de verdad cambia
  // la tecla del switch o el modo de captura — no en cada tic del barrido.
  const activarRef = useRef(activar);
  useEffect(() => {
    activarRef.current = activar;
  }, [activar]);

  // Escucha la tecla configurada como switch (y, en modo captura, aprende una nueva)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (capturando) {
        e.preventDefault();
        setTeclaSwitch(e.code);
        setCapturando(false);
        // El foco sigue en el botón «Cambiar» tras la captura. Si se deja ahí, la
        // PRÓXIMA tecla que no coincida con el switch (típicamente Espacio o Enter,
        // justo lo más probable como switch real) activa por su cuenta ese botón vía
        // el comportamiento nativo del navegador y reabre la captura sin pedirlo.
        (document.activeElement as HTMLElement | null)?.blur();
        return;
      }
      if (e.code === teclaSwitch) {
        e.preventDefault(); // la barra espaciadora, por defecto, no debe desplazar la página
        activarRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [teclaSwitch, capturando]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles no disponible (permiso denegado o contexto no seguro): sin efecto visible
    }
  };

  const estadoTexto = !activo
    ? 'Barrido pausado'
    : fase === 'fila'
      ? `Fila ${filaActual + 1} de ${filas.length}`
      : `Fila ${filaActual + 1}, columna ${columnaActual + 1}: ${
          filas[filaActual]?.[columnaActual]?.aria ?? ''
        }`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Teclado de Barrido por Switch</h1>
        <p className={styles.subtitle}>
          Escribe con un único pulsador: barrido automático fila-columna, velocidad y tecla de
          activación configurables
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="high"
        context="teclado-barrido-switch"
        title="Herramienta de práctica, no un dispositivo certificado"
      >
        <p>
          Esta es una <strong>demostración y herramienta de práctica</strong> del acceso por
          switch (barrido fila-columna), no un sustituto de una configuración profesional. Una
          persona que dependa de esta técnica para comunicarse a diario necesita la valoración de
          un terapeuta ocupacional o logopeda, ajustada a su capacidad motora concreta.
        </p>
        <p>
          iOS (Switch Control) y Android (Switch Access) ya ofrecen barrido por switch a nivel de
          todo el dispositivo, no solo de una web. Esta herramienta sirve para entender la técnica
          o probarla sin instalar nada ni bucear en ajustes, especialmente en ordenador.
        </p>
      </DisclaimerCard>

      {/* Ajustes */}
      <section className={styles.panel} aria-label="Ajustes del barrido">
        <h2 className={styles.panelTitle}>Ajustes</h2>
        <div className={styles.ajustes}>
          <div className={styles.ajusteGrupo}>
            <label htmlFor="velocidad" className={styles.ajusteLabel}>
              Velocidad de barrido:{' '}
              <span className={styles.ajusteValor}>{formatNumber(velocidad / 1000, 1)} s</span>
            </label>
            <input
              id="velocidad"
              type="range"
              min={VELOCIDAD_MIN}
              max={VELOCIDAD_MAX}
              step={100}
              value={velocidad}
              onChange={(e) => setVelocidad(Number(e.target.value))}
              className={styles.rangoVelocidad}
            />
          </div>

          <div className={styles.ajusteGrupo}>
            <span className={styles.ajusteLabel}>Tecla del switch</span>
            <div className={styles.filaSwitch}>
              <span className={styles.teclaActual}>{nombreTecla(teclaSwitch)}</span>
              <button
                type="button"
                className={styles.botonSecundario}
                onClick={() => setCapturando(true)}
              >
                Cambiar
              </button>
            </div>
            {capturando && (
              <p className={styles.capturandoAviso} role="status">
                Pulsa la tecla que quieras usar como tu switch…
              </p>
            )}
          </div>

          <div className={styles.ajusteGrupo}>
            <span className={styles.ajusteLabel}>Orden de las letras</span>
            <div className={styles.filaSwitch}>
              <button
                type="button"
                className={`${styles.botonSecundario} ${orden === 'frecuencia' ? styles.botonActivo : ''}`}
                aria-pressed={orden === 'frecuencia'}
                onClick={() => setOrden('frecuencia')}
              >
                Por frecuencia
              </button>
              <button
                type="button"
                className={`${styles.botonSecundario} ${orden === 'alfabetico' ? styles.botonActivo : ''}`}
                aria-pressed={orden === 'alfabetico'}
                onClick={() => setOrden('alfabetico')}
              >
                Alfabético
              </button>
            </div>
          </div>

          <div className={styles.ajusteGrupo}>
            <span className={styles.ajusteLabel}>Aviso por voz de cada celda</span>
            <button
              type="button"
              className={`${styles.botonSecundario} ${avisoVoz ? styles.botonActivo : ''}`}
              aria-pressed={avisoVoz}
              onClick={() => setAvisoVoz((v) => !v)}
            >
              {avisoVoz ? 'Activado' : 'Desactivado'}
            </button>
          </div>
        </div>

        <div className={styles.control}>
          <button
            type="button"
            className={styles.botonIniciar}
            aria-pressed={activo}
            onClick={() => setActivo((a) => !a)}
          >
            <span aria-hidden="true">{activo ? '⏸' : '▶'}</span> {activo ? 'Pausar barrido' : 'Iniciar barrido'}
          </button>

          <button
            type="button"
            className={styles.botonSwitch}
            onClick={activar}
            disabled={!activo}
            aria-label="Activar mi switch: selecciona la fila o la letra resaltada"
          >
            <span aria-hidden="true">⏺</span> Mi switch
          </button>
        </div>

        <p className={styles.estado} role="status" aria-live="polite">
          {estadoTexto}
        </p>
      </section>

      {/* Teclado */}
      <section className={styles.panel} aria-label="Teclado de barrido">
        <h2 className={styles.panelTitle}>Teclado</h2>
        <div className={styles.teclado}>
          {filas.map((filaTeclas, iFila) => (
            <div
              key={iFila}
              className={`${styles.fila} ${
                // La fila se mantiene resaltada mientras es la "actual", tanto al recorrer
                // filas como al recorrer sus columnas — si se apagara al fijarla, se pierde
                // la referencia de en qué fila se está mientras se busca la letra.
                activo && filaActual === iFila ? styles.filaResaltada : ''
              }`}
            >
              {filaTeclas.map((tecla, iCol) => (
                <button
                  key={tecla.id}
                  type="button"
                  className={`${styles.tecla} ${tecla.ancha ? styles.teclaAncha : ''} ${
                    activo && fase === 'columna' && filaActual === iFila && columnaActual === iCol
                      ? styles.teclaResaltada
                      : ''
                  }`}
                  aria-label={tecla.aria}
                  onClick={() => ejecutarTecla(tecla.id)}
                >
                  {tecla.etiqueta}
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className={styles.aviso}>
          También puedes pulsar cualquier tecla del teclado en pantalla directamente, sin esperar
          al barrido — útil para probar rápido el resultado.
        </p>
      </section>

      {/* Salida */}
      <section className={styles.panel} aria-label="Texto escrito">
        <h2 className={styles.panelTitle}>Lo que has escrito</h2>
        <textarea
          value={texto}
          readOnly
          rows={3}
          className={styles.salidaTexto}
          aria-label="Texto escrito con el barrido"
          placeholder="Aquí aparecerá el texto que compongas con el teclado…"
        />
        <div className={styles.accionesSalida}>
          <button type="button" className={styles.botonSecundario} onClick={leerEnVozAlta}>
            <span aria-hidden="true">🔊</span> Leer en voz alta
          </button>
          <button type="button" className={styles.botonSecundario} onClick={copiar}>
            <span aria-hidden="true">📋</span> {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button type="button" className={styles.botonSecundario} onClick={() => setTexto('')}>
            <span aria-hidden="true">🗑️</span> Borrar todo
          </button>
        </div>
      </section>

      <EducationalSection
        icon="⌨️"
        title="Acceso por Switch: Cómo Funciona y Para Quién Es"
        subtitle="Barrido fila-columna, la técnica detrás de este teclado"
      >
        <section>
          <h3>
            <span aria-hidden="true">🔁</span> Qué es el barrido fila-columna
          </h3>
          <p>
            Es un método de escritura para quien no puede usar un teclado ni un ratón
            convencional, pero sí accionar de forma fiable <strong>un único pulsador</strong> (un
            &quot;switch&quot;). El sistema resalta automáticamente las filas del teclado, una a
            una; al activar el switch se fija esa fila y empieza a resaltarse cada letra dentro de
            ella, también automáticamente; una segunda activación selecciona la letra. Es una
            búsqueda binaria visual: con un solo botón se llega a cualquier tecla en dos pasos, en
            vez de necesitar mover un cursor.
          </p>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">🧑‍🦽</span> Para quién es útil
          </h3>
          <p>
            Para personas con movilidad muy reducida en manos y brazos —esclerosis lateral
            amiotrófica (ELA), parálisis cerebral, distrofia muscular, lesión medular alta— que
            solo pueden accionar de forma fiable un único punto de contacto: un botón grande, un
            leve movimiento de cabeza sobre un sensor, un parpadeo detectado por un pulsador
            óptico. También para familiares, docentes o terapeutas que quieran entender la técnica
            antes de configurar un dispositivo real, y para cualquiera con curiosidad por cómo
            funciona la tecnología de acceso.
          </p>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">🔌</span> Qué hace falta para probarlo de verdad
          </h3>
          <p>
            En un ordenador, nada especial: la barra espaciadora (o la tecla que elijas) ya
            funciona como switch. Los pulsadores de accesibilidad físicos reales se conectan al
            ordenador o al móvil <strong>emulando una pulsación de teclado o un clic</strong>, así
            que cualquier switch que ya tengas configurado en tu sistema debería activar también
            esta herramienta, sin ajustes adicionales aquí más allá de decir qué tecla usa.
          </p>
          <p>
            Por eso esta herramienta no necesita conectarse a ningún dispositivo por Bluetooth ni
            instalar nada: todo el ecosistema de switches está pensado, desde el origen, para
            funcionar con cualquier programa que responda a una tecla o un clic.
          </p>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">📊</span> Por qué el orden de las letras importa
          </h3>
          <p>
            Cada letra que se busca cuesta, de media, tantos pasos de barrido como filas y
            columnas haya que recorrer hasta llegar a ella. Colocar las letras más frecuentes del
            español —E, A, O, S, R, N...— en las primeras filas reduce el número medio de pasos
            por letra, y por tanto el tiempo y el esfuerzo para escribir un texto. Prueba a
            cambiar entre el orden &quot;Por frecuencia&quot; y el &quot;Alfabético&quot; y compara
            cuántas activaciones te cuesta escribir la misma palabra con cada uno: es el mismo
            principio que usan los teclados de comunicación aumentativa reales.
          </p>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <div>
              <strong>Límites de esta herramienta</strong>
              <ul>
                <li>
                  Es una <strong>demostración de práctica</strong>, no un dispositivo de
                  comunicación aumentativa certificado ni un sustituto de la valoración de un
                  profesional.
                </li>
                <li>
                  Está pensada sobre todo para <strong>ordenador</strong>. En móvil, un toque en
                  pantalla funciona como switch, pero la experiencia real de una persona con
                  switch físico en su teléfono puede variar.
                </li>
                <li>
                  El barrido pierde su temporizador si la pestaña pasa a segundo plano (los
                  navegadores ralentizan los temporizadores de pestañas inactivas): pausa el
                  barrido antes de cambiar de pestaña.
                </li>
                <li>
                  El aviso por voz de cada celda puede no llegar a completarse si la velocidad de
                  barrido es alta: actívalo junto con una velocidad de 2 segundos o más.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('teclado-barrido-switch')} />

      <ShareCard appName="teclado-barrido-switch" />
      <Footer appName="teclado-barrido-switch" />
    </div>
  );
}
