'use client';
// @disclaimer: exempt

/**
 * Sorteo del amigo invisible (amigo secreto) — vista. El sorteo, la validación de la lista y el
 * enlace privado viven en `./motor.ts`, probado en tests/amigo-invisible-motor.spec.ts.
 *
 * Dos vistas en la misma URL: la del ORGANIZADOR (lista, exclusiones, sorteo y entrega) y la del
 * PARTICIPANTE, que llega con `#r=…` en el enlace y solo ve lo suyo. El fragmento no llega al
 * servidor y AnalyticsTracker solo lee de él la marca `from`.
 *
 * El organizador no ve el resultado en pantalla en ningún momento: ni al sortear ni al copiar los
 * enlaces. Lo que no se puede evitar —y la página lo dice— es que quien abra un enlace ajeno lo vea.
 */

import { useEffect, useMemo, useState } from 'react';
import styles from './SorteoAmigoInvisible.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  sortear, leerParticipantes, claveNombre, codificarEnlace, decodificarEnlace, fechaEspanola,
  MIN_PARTICIPANTES, MAX_PARTICIPANTES, type DatosEnlace, type Exclusion, type ResultadoSorteo,
} from './motor';

interface ParExcluido {
  de: string;
  a: string;
}

interface SorteoHecho {
  nombres: string[];
  asignacion: number[];
  evento: string;
  presupuesto: string;
  fecha: string;
}

interface Guardado {
  v: 1;
  evento: string;
  textoNombres: string;
  exclusiones: ParExcluido[];
  sinMutuos: boolean;
  presupuesto: string;
  fecha: string;
  sorteo: SorteoHecho | null;
  vistos: number[];
}

type Entrega = 'enlaces' | 'movil';

const CLAVE_GUARDADO = 'meskeia:sorteo-amigo-invisible:v1';

const EJEMPLO_NOMBRES = 'Ana\nLuis\nMarta\nJorge\nLucía\nDaniel';

/** Azar del navegador (criptográfico), en [0, 1). */
function azarSeguro(): number {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

function leerGuardado(): Guardado | null {
  try {
    const crudo = localStorage.getItem(CLAVE_GUARDADO);
    if (!crudo) return null;
    const g = JSON.parse(crudo) as Partial<Guardado>;
    if (g.v !== 1 || typeof g.textoNombres !== 'string') return null;
    return {
      v: 1,
      evento: typeof g.evento === 'string' ? g.evento : '',
      textoNombres: g.textoNombres,
      exclusiones: Array.isArray(g.exclusiones)
        ? g.exclusiones.filter((e): e is ParExcluido => !!e && typeof e.de === 'string' && typeof e.a === 'string')
        : [],
      sinMutuos: g.sinMutuos === true,
      presupuesto: typeof g.presupuesto === 'string' ? g.presupuesto : '',
      fecha: typeof g.fecha === 'string' ? g.fecha : '',
      sorteo: g.sorteo && Array.isArray(g.sorteo.nombres) && Array.isArray(g.sorteo.asignacion) ? g.sorteo : null,
      vistos: Array.isArray(g.vistos) ? g.vistos.filter((x): x is number => Number.isInteger(x)) : [],
    };
  } catch {
    return null;
  }
}

function mensajeError(r: Extract<ResultadoSorteo, { ok: false }>, nombres: string[], n: number, sinMutuos: boolean): string {
  switch (r.motivo) {
    case 'pocos':
      return `Hacen falta al menos ${MIN_PARTICIPANTES} personas para que nadie sepa a quién le toca a otro (ahora hay ${n}).`;
    case 'sin-opciones':
      return `${nombres[r.indice ?? 0]} no puede regalar a nadie: quita alguna de sus exclusiones.`;
    case 'sin-regalador':
      return `Nadie puede regalar a ${nombres[r.indice ?? 0]}: quita alguna exclusión hacia esa persona.`;
    case 'imposible':
      return sinMutuos
        ? 'Con estas exclusiones y sin regalos mutuos no hay ningún reparto posible. Permite los regalos mutuos o quita alguna exclusión.'
        : 'Con estas exclusiones no hay ningún reparto posible: quita alguna.';
    case 'agotado':
      return 'No he encontrado un reparto con tantas restricciones. Quita alguna exclusión o permite los regalos mutuos.';
  }
}

export default function SorteoAmigoInvisiblePage() {
  // Vista del participante: se decide al montar, leyendo el fragmento de la URL.
  const [enlace, setEnlace] = useState<DatosEnlace | null>(null);
  const [enlaceRoto, setEnlaceRoto] = useState(false);
  const [reveladoReceptor, setReveladoReceptor] = useState(false);

  // Configuración del organizador
  const [evento, setEvento] = useState('');
  const [textoNombres, setTextoNombres] = useState('');
  const [exclusiones, setExclusiones] = useState<ParExcluido[]>([]);
  const [selDe, setSelDe] = useState('');
  const [selA, setSelA] = useState('');
  const [enLosDosSentidos, setEnLosDosSentidos] = useState(true);
  const [sinMutuos, setSinMutuos] = useState(false);
  const [presupuesto, setPresupuesto] = useState('');
  const [fecha, setFecha] = useState('');

  // Resultado y entrega
  const [sorteo, setSorteo] = useState<SorteoHecho | null>(null);
  const [error, setError] = useState('');
  const [confirmarRepetir, setConfirmarRepetir] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>('enlaces');
  const [vistos, setVistos] = useState<number[]>([]);
  const [turno, setTurno] = useState<number | null>(null);
  const [reveladoTurno, setReveladoTurno] = useState(false);
  const [aviso, setAviso] = useState('');
  const [enlaceManual, setEnlaceManual] = useState<number | null>(null);
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // También en `hashchange`: abrir otro enlace en la pestaña donde ya está la app solo cambia
    // el fragmento, sin recargar, y sin esto seguiría a la vista el resultado de la persona anterior.
    const leerFragmento = () => {
      const hash = window.location.hash;
      const d = hash.startsWith('#r=') ? decodificarEnlace(hash) : null;
      setEnlace(d);
      setEnlaceRoto(hash.startsWith('#r=') && !d);
      setReveladoReceptor(false);
    };
    leerFragmento();
    window.addEventListener('hashchange', leerFragmento);
    setPuedeCompartir(typeof navigator.share === 'function');
    const g = leerGuardado();
    if (g) {
      setEvento(g.evento);
      setTextoNombres(g.textoNombres);
      setExclusiones(g.exclusiones);
      setSinMutuos(g.sinMutuos);
      setPresupuesto(g.presupuesto);
      setFecha(g.fecha);
      setSorteo(g.sorteo);
      setVistos(g.vistos);
    }
    setListo(true);
    return () => window.removeEventListener('hashchange', leerFragmento);
  }, []);

  useEffect(() => {
    if (!listo) return;
    const g: Guardado = { v: 1, evento, textoNombres, exclusiones, sinMutuos, presupuesto, fecha, sorteo, vistos };
    try {
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(g));
    } catch {
      // Navegación privada o almacenamiento bloqueado: la app funciona igual, sin recordar.
    }
  }, [listo, evento, textoNombres, exclusiones, sinMutuos, presupuesto, fecha, sorteo, vistos]);

  const lista = useMemo(() => leerParticipantes(textoNombres), [textoNombres]);
  const nombres = lista.nombres;
  const claves = useMemo(() => new Map(nombres.map((n, i) => [claveNombre(n), i])), [nombres]);

  // Las exclusiones se guardan por nombre: si alguien sale de la lista, la suya deja de contar.
  const exclusionesVigentes = exclusiones.filter((e) => claves.has(claveNombre(e.de)) && claves.has(claveNombre(e.a)));

  const listaCambiada = sorteo !== null
    && (sorteo.nombres.length !== nombres.length || sorteo.nombres.some((n, i) => claveNombre(n) !== claveNombre(nombres[i] ?? '')));

  const agregarExclusion = () => {
    if (!selDe || !selA || claveNombre(selDe) === claveNombre(selA)) return;
    const nuevos: ParExcluido[] = [{ de: selDe, a: selA }];
    if (enLosDosSentidos) nuevos.push({ de: selA, a: selDe });
    setExclusiones((prev) => {
      const ya = new Set(prev.map((e) => `${claveNombre(e.de)}>${claveNombre(e.a)}`));
      return [...prev, ...nuevos.filter((e) => !ya.has(`${claveNombre(e.de)}>${claveNombre(e.a)}`))];
    });
    setSelA('');
  };

  const quitarExclusion = (e: ParExcluido) => {
    setExclusiones((prev) => prev.filter((x) => !(claveNombre(x.de) === claveNombre(e.de) && claveNombre(x.a) === claveNombre(e.a))));
  };

  const hacerSorteo = () => {
    setConfirmarRepetir(false);
    if (nombres.length > MAX_PARTICIPANTES) {
      setError(`Caben hasta ${MAX_PARTICIPANTES} personas por sorteo (ahora hay ${nombres.length}).`);
      return;
    }
    const indices: Exclusion[] = exclusionesVigentes.map((e) => ({
      de: claves.get(claveNombre(e.de)) ?? -1,
      a: claves.get(claveNombre(e.a)) ?? -1,
    }));
    const r = sortear(nombres.length, indices, { sinMutuos }, azarSeguro);
    if (!r.ok) {
      setError(mensajeError(r, nombres, nombres.length, sinMutuos));
      return;
    }
    setError('');
    setSorteo({ nombres: [...nombres], asignacion: r.asignacion, evento: evento.trim(), presupuesto: presupuesto.trim(), fecha });
    setVistos([]);
    setTurno(null);
    setReveladoTurno(false);
    setEnlaceManual(null);
    setAviso(`Sorteo hecho entre ${nombres.length} personas. Nadie ha visto el resultado.`);
  };

  const pedirSorteo = () => {
    if (sorteo) setConfirmarRepetir(true);
    else hacerSorteo();
  };

  const borrarTodo = () => {
    setEvento('');
    setTextoNombres('');
    setExclusiones([]);
    setSinMutuos(false);
    setPresupuesto('');
    setFecha('');
    setSorteo(null);
    setVistos([]);
    setTurno(null);
    setError('');
    setConfirmarRepetir(false);
    setAviso('Se ha borrado el sorteo y la lista de este navegador.');
  };

  const urlDe = (i: number): string => {
    if (!sorteo) return '';
    const frag = codificarEnlace({
      de: sorteo.nombres[i],
      a: sorteo.nombres[sorteo.asignacion[i]],
      evento: sorteo.evento || undefined,
      presupuesto: sorteo.presupuesto || undefined,
      fecha: sorteo.fecha || undefined,
    });
    return `${window.location.origin}${window.location.pathname}#${frag}`;
  };

  const mensajeDe = (i: number): string => {
    if (!sorteo) return '';
    const ev = sorteo.evento ? ` de «${sorteo.evento}»` : '';
    return `${sorteo.nombres[i]}, este es tu enlace del amigo invisible${ev}. Ábrelo solo tú para ver a quién le regalas:`;
  };

  const copiar = async (i: number) => {
    if (!sorteo) return;
    try {
      await navigator.clipboard.writeText(`${mensajeDe(i)} ${urlDe(i)}`);
      setEnlaceManual(null);
      setAviso(`Copiado el mensaje para ${sorteo.nombres[i]}. Pégalo en un chat privado con esa persona.`);
    } catch {
      setEnlaceManual(i);
      setAviso(`No se ha podido copiar solo: copia a mano el enlace de ${sorteo.nombres[i]}.`);
    }
  };

  const compartir = async (i: number) => {
    if (!sorteo) return;
    try {
      await navigator.share({ title: 'Amigo invisible', text: mensajeDe(i), url: urlDe(i) });
      setAviso(`Enlace de ${sorteo.nombres[i]} enviado.`);
    } catch {
      // Cancelar el menú de compartir también lanza: no es un error que haya que contar.
    }
  };

  const terminarTurno = () => {
    if (turno !== null) setVistos((prev) => (prev.includes(turno) ? prev : [...prev, turno]));
    setTurno(null);
    setReveladoTurno(false);
  };

  const salirDelEnlace = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setEnlace(null);
    setEnlaceRoto(false);
    setReveladoReceptor(false);
  };

  const opcionesNombre = nombres.map((n) => (
    <option key={claveNombre(n)} value={n}>{n}</option>
  ));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎁</span> Sorteo de Amigo Invisible</h1>
        <p className={styles.subtitle}>
          El amigo secreto de la familia, la oficina o la clase: con parejas que no se regalan entre sí
          y un enlace privado para cada persona. El organizador no ve a quién le toca a nadie.
        </p>
      </header>

      <LegalNotice />

      {enlace && (
        <section className={styles.receptor} aria-labelledby="titulo-receptor">
          <p className={styles.eventoReceptor}>{enlace.evento ?? 'Amigo invisible'}</p>
          <h2 id="titulo-receptor" className={styles.saludo}>Hola, {enlace.de}</h2>
          <p className={styles.textoAyuda}>
            Este enlace es solo para {enlace.de}. Si no eres tú, ciérralo sin mirar.
          </p>
          {reveladoReceptor ? (
            <div className={styles.revelacion}>
              <p className={styles.revelacionTitulo}>Te toca regalar a</p>
              <p className={styles.revelacionNombre}>{enlace.a}</p>
            </div>
          ) : (
            <button type="button" className={styles.btnPrimary} onClick={() => setReveladoReceptor(true)}>
              Ver a quién le regalo
            </button>
          )}
          {(enlace.presupuesto || enlace.fecha) && (
            <dl className={styles.detalles}>
              {enlace.presupuesto && (
                <div>
                  <dt>Presupuesto</dt>
                  <dd>{enlace.presupuesto}</dd>
                </div>
              )}
              {enlace.fecha && (
                <div>
                  <dt>Intercambio</dt>
                  <dd>{fechaEspanola(enlace.fecha)}</dd>
                </div>
              )}
            </dl>
          )}
          <div className={styles.filaBotones}>
            {reveladoReceptor && (
              <button type="button" className={styles.btnSecundario} onClick={() => setReveladoReceptor(false)}>
                Ocultar
              </button>
            )}
            <button type="button" className={styles.btnSecundario} onClick={salirDelEnlace}>
              Organizar otro sorteo
            </button>
          </div>
        </section>
      )}

      {enlaceRoto && (
        <div className={styles.error} role="alert">
          Este enlace está incompleto o dañado. Pide a quien organiza el sorteo que te lo vuelva a enviar.
        </div>
      )}

      {!enlace && (
        <>
          <section className={styles.panel} aria-labelledby="titulo-participantes">
            <h2 id="titulo-participantes" className={styles.panelTitulo}>1. Quién participa</h2>

            <label className={styles.label} htmlFor="ai-evento">Nombre del sorteo (opcional)</label>
            <input
              id="ai-evento"
              type="text"
              className={styles.input}
              value={evento}
              maxLength={60}
              placeholder="Navidad en familia"
              autoComplete="off"
              onChange={(e) => setEvento(e.target.value)}
            />

            <label className={styles.label} htmlFor="ai-nombres">Participantes, uno por línea</label>
            <textarea
              id="ai-nombres"
              className={styles.textarea}
              value={textoNombres}
              rows={7}
              placeholder={EJEMPLO_NOMBRES}
              aria-describedby="ai-nombres-ayuda"
              onChange={(e) => setTextoNombres(e.target.value)}
            />
            <p id="ai-nombres-ayuda" className={styles.textoAyuda}>
              {nombres.length === 1 ? '1 persona' : `${nombres.length} personas`} · mínimo {MIN_PARTICIPANTES}, máximo {MAX_PARTICIPANTES}.
              {' '}Si dos se llaman igual, añade la inicial del apellido.
            </p>
            {lista.repetidos.length > 0 && (
              <p className={styles.avisoSuave}>
                Nombre repetido, se cuenta una sola vez: {lista.repetidos.join(', ')}.
              </p>
            )}
            {!textoNombres && (
              <button type="button" className={styles.btnEnlace} onClick={() => setTextoNombres(EJEMPLO_NOMBRES)}>
                Probar con una lista de ejemplo
              </button>
            )}
          </section>

          <section className={styles.panel} aria-labelledby="titulo-exclusiones">
            <h2 id="titulo-exclusiones" className={styles.panelTitulo}>2. Quién no puede regalar a quién (opcional)</h2>
            <p className={styles.textoAyuda}>
              Para que las parejas no se regalen entre sí, o para que a nadie le toque la misma persona que el año pasado.
            </p>

            {nombres.length >= 2 ? (
              <div className={styles.formExclusion}>
                <div>
                  <label className={styles.label} htmlFor="ai-excl-de">Quien regala</label>
                  <select id="ai-excl-de" className={styles.select} value={selDe} onChange={(e) => setSelDe(e.target.value)}>
                    <option value="">Elige…</option>
                    {opcionesNombre}
                  </select>
                </div>
                <div>
                  <label className={styles.label} htmlFor="ai-excl-a">No puede regalar a</label>
                  <select id="ai-excl-a" className={styles.select} value={selA} onChange={(e) => setSelA(e.target.value)}>
                    <option value="">Elige…</option>
                    {opcionesNombre}
                  </select>
                </div>
                <label className={styles.check}>
                  <input type="checkbox" checked={enLosDosSentidos} onChange={(e) => setEnLosDosSentidos(e.target.checked)} />
                  {' '}Y al revés (son pareja)
                </label>
                <button
                  type="button"
                  className={styles.btnSecundario}
                  onClick={agregarExclusion}
                  disabled={!selDe || !selA || claveNombre(selDe) === claveNombre(selA)}
                >
                  Añadir exclusión
                </button>
              </div>
            ) : (
              <p className={styles.textoAyuda}>Escribe antes la lista de participantes.</p>
            )}

            {exclusionesVigentes.length > 0 && (
              <ul className={styles.listaExclusiones} aria-label="Exclusiones añadidas">
                {exclusionesVigentes.map((e) => (
                  <li key={`${claveNombre(e.de)}>${claveNombre(e.a)}`} className={styles.exclusion}>
                    <span>{e.de} no regala a {e.a}</span>
                    <button
                      type="button"
                      className={styles.btnQuitar}
                      aria-label={`Quitar: ${e.de} no regala a ${e.a}`}
                      onClick={() => quitarExclusion(e)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className={styles.check}>
              <input type="checkbox" checked={sinMutuos} onChange={(e) => setSinMutuos(e.target.checked)} />
              {' '}Sin regalos mutuos: si a Ana le toca Luis, a Luis no le toca Ana
            </label>
          </section>

          <section className={styles.panel} aria-labelledby="titulo-detalles">
            <h2 id="titulo-detalles" className={styles.panelTitulo}>3. Detalles para el mensaje (opcional)</h2>
            <div className={styles.dosColumnas}>
              <div>
                <label className={styles.label} htmlFor="ai-presupuesto">Presupuesto</label>
                <input
                  id="ai-presupuesto"
                  type="text"
                  className={styles.input}
                  value={presupuesto}
                  maxLength={30}
                  placeholder="Unos 20"
                  autoComplete="off"
                  onChange={(e) => setPresupuesto(e.target.value)}
                />
              </div>
              <div>
                <label className={styles.label} htmlFor="ai-fecha">Día del intercambio</label>
                <input id="ai-fecha" type="date" className={styles.input} value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
            </div>
          </section>

          <div className={styles.accionSorteo}>
            {confirmarRepetir ? (
              <div className={styles.confirmar} role="group" aria-labelledby="ai-confirmar-texto">
                <p id="ai-confirmar-texto">
                  Si sorteas otra vez, los enlaces que ya hayas enviado dejarán de valer: a cada uno le puede tocar otra persona.
                </p>
                <div className={styles.filaBotones}>
                  <button type="button" className={styles.btnPrimary} onClick={hacerSorteo}>Sí, sortear de nuevo</button>
                  <button type="button" className={styles.btnSecundario} onClick={() => setConfirmarRepetir(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button type="button" className={styles.btnPrimary} onClick={pedirSorteo} disabled={nombres.length < MIN_PARTICIPANTES}>
                {sorteo ? 'Volver a sortear' : 'Hacer el sorteo'}
              </button>
            )}
            {nombres.length > 0 && nombres.length < MIN_PARTICIPANTES && (
              <p className={styles.textoAyuda}>Faltan {MIN_PARTICIPANTES - nombres.length} para poder sortear.</p>
            )}
            <p className={styles.textoAyuda}>
              La lista y el sorteo se guardan solo en este navegador, para que puedas volver a copiar los enlaces. No se envían a ningún servidor.
            </p>
          </div>

          {error && <div className={styles.error} role="alert">{error}</div>}

          {sorteo && (
            <section className={styles.panel} aria-labelledby="titulo-entrega">
              <h2 id="titulo-entrega" className={styles.panelTitulo}>4. Que cada uno descubra el suyo</h2>
              {listaCambiada && (
                <p className={styles.avisoSuave}>
                  La lista ha cambiado desde el sorteo. Los enlaces de abajo son del sorteo anterior: vuelve a sortear si quieres incluir los cambios.
                </p>
              )}

              <div className={styles.pestanas} role="tablist" aria-label="Cómo entregar el resultado">
                <button
                  type="button"
                  role="tab"
                  id="tab-enlaces"
                  aria-selected={entrega === 'enlaces'}
                  aria-controls="panel-enlaces"
                  className={`${styles.pestana} ${entrega === 'enlaces' ? styles.pestanaActiva : ''}`}
                  onClick={() => setEntrega('enlaces')}
                >
                  Enviar enlaces
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-movil"
                  aria-selected={entrega === 'movil'}
                  aria-controls="panel-movil"
                  className={`${styles.pestana} ${entrega === 'movil' ? styles.pestanaActiva : ''}`}
                  onClick={() => setEntrega('movil')}
                >
                  Pasar el móvil
                </button>
              </div>

              {entrega === 'enlaces' && (
                <div role="tabpanel" id="panel-enlaces" aria-labelledby="tab-enlaces">
                  <p className={styles.textoAyuda}>
                    Manda a cada persona SU enlace por un chat privado, no por el grupo. Si abres un enlace que no es el tuyo, verás a quién le toca.
                  </p>
                  <ul className={styles.listaEnlaces}>
                    {sorteo.nombres.map((n, i) => (
                      <li key={claveNombre(n)} className={styles.filaEnlace}>
                        <span className={styles.nombreFila}>{n}</span>
                        <div className={styles.filaBotones}>
                          <button type="button" className={styles.btnSecundario} aria-label={`Copiar el mensaje para ${n}`} onClick={() => copiar(i)}>
                            Copiar mensaje
                          </button>
                          {puedeCompartir && (
                            <button type="button" className={styles.btnSecundario} aria-label={`Enviar el enlace a ${n}`} onClick={() => compartir(i)}>
                              Enviar
                            </button>
                          )}
                        </div>
                        {enlaceManual === i && (
                          <input
                            type="text"
                            readOnly
                            className={styles.input}
                            value={urlDe(i)}
                            aria-label={`Enlace de ${n}`}
                            onFocus={(e) => e.target.select()}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entrega === 'movil' && (
                <div role="tabpanel" id="panel-movil" aria-labelledby="tab-movil">
                  {turno === null ? (
                    <>
                      <p className={styles.textoAyuda}>
                        Para cuando estáis juntos: cada persona toca su nombre, mira y lo oculta antes de pasar el móvil. Funciona por confianza.
                      </p>
                      <ul className={styles.rejillaNombres}>
                        {sorteo.nombres.map((n, i) => (
                          <li key={claveNombre(n)}>
                            {/* a11y-ok: abre el turno de esa persona, no conmuta nada; «ya lo ha visto» va en el texto del botón */}
                            <button
                              type="button"
                              className={`${styles.btnNombre} ${vistos.includes(i) ? styles.btnNombreVisto : ''}`}
                              onClick={() => { setTurno(i); setReveladoTurno(false); }}
                            >
                              <span className={styles.nombreBoton}>{n}</span>
                              {vistos.includes(i) && <span className={styles.marcaVisto}>ya lo ha visto</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p className={styles.textoAyuda}>
                        {vistos.length} de {sorteo.nombres.length} lo han visto.
                      </p>
                    </>
                  ) : (
                    <div className={styles.turno}>
                      <p className={styles.saludo}>Turno de {sorteo.nombres[turno]}</p>
                      {reveladoTurno ? (
                        <div className={styles.revelacion}>
                          <p className={styles.revelacionTitulo}>{sorteo.nombres[turno]}, te toca regalar a</p>
                          <p className={styles.revelacionNombre}>{sorteo.nombres[sorteo.asignacion[turno]]}</p>
                        </div>
                      ) : (
                        <p className={styles.textoAyuda}>Pasa el móvil a {sorteo.nombres[turno]}. Que nadie más mire la pantalla.</p>
                      )}
                      <div className={styles.filaBotones}>
                        {reveladoTurno ? (
                          <button type="button" className={styles.btnPrimary} onClick={terminarTurno}>
                            Ya lo he visto: ocultar
                          </button>
                        ) : (
                          <>
                            <button type="button" className={styles.btnPrimary} onClick={() => setReveladoTurno(true)}>
                              Soy {sorteo.nombres[turno]}: ver el mío
                            </button>
                            <button type="button" className={styles.btnSecundario} onClick={() => setTurno(null)}>
                              Volver
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button type="button" className={styles.btnEnlace} onClick={borrarTodo}>
                Borrar el sorteo y la lista de este navegador
              </button>
            </section>
          )}
        </>
      )}

      <div className={styles.srOnly} role="status" aria-live="polite">{aviso}</div>

      <EducationalSection
        icon="📚"
        title="Cómo organizar un amigo invisible sin que nadie se entere"
        subtitle="Exclusiones, regalos mutuos, cómo repartir los resultados y errores frecuentes"
      >
        <section className={styles.guideSection}>
          <h2>Qué hace el sorteo, paso a paso</h2>
          <p>
            Cada persona regala a otra y recibe de otra, sin tocarse a sí misma. Matemáticamente es una permutación
            sin puntos fijos (un «desarreglo»): con 4 personas hay 9 repartos posibles, con 6 hay 265 y con 10 ya son
            más de 1,3 millones. Las exclusiones quitan repartos; si quitan todos, la app lo detecta y te dice qué
            persona se ha quedado sin opciones.
          </p>
          <p>
            Sin exclusiones ni restricciones raras, el sorteo prueba repartos al azar hasta dar con uno válido, así que
            todos los repartos posibles tienen la misma probabilidad. El azar sale del generador criptográfico del
            navegador, no de una fórmula predecible.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Tres formas de repartir los resultados</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Forma</th>
                  <th scope="col">Cuándo conviene</th>
                  <th scope="col">Quién puede ver el resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Enlace privado (esta app)</td>
                  <td>Gente que no está junta: familia repartida, oficina, clase</td>
                  <td>Solo quien abre cada enlace</td>
                </tr>
                <tr>
                  <td>Pasar el móvil (esta app)</td>
                  <td>Reunión en persona antes de la fecha</td>
                  <td>Cada uno el suyo, por confianza</td>
                </tr>
                <tr>
                  <td>Papelitos en una bolsa</td>
                  <td>Grupos pequeños sin exclusiones</td>
                  <td>Nadie, pero hay que repetir si a alguien le sale su nombre</td>
                </tr>
                <tr>
                  <td>Un organizador que sortea y avisa</td>
                  <td>Cuando el organizador no participa</td>
                  <td>El organizador lo sabe todo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Casos habituales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3>Familia con parejas</h3>
              <p>Excluye a cada pareja «y al revés» para que nadie le regale a su pareja, que ya le hace regalo aparte.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Oficina o equipo</h3>
              <p>Pon nombre al sorteo y presupuesto, y manda los enlaces por mensaje privado. Nadie tiene que reunirse para sortear.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Clase o grupo de amigos</h3>
              <p>Si os veis antes de la fecha, «Pasar el móvil» evita enviar nada: cada uno toca su nombre y lo oculta.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo hacerlo</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>Escribe los nombres, uno por línea, o pega la lista desde el chat del grupo.</div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>Añade las exclusiones que haga falta y decide si permites regalos mutuos.</div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>Pulsa «Hacer el sorteo». El resultado no se muestra en pantalla.</div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>Copia el mensaje de cada persona y envíaselo por privado, o pasad el móvil por turnos.</div>
            </li>
          </ol>
        </section>

        <section className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💬</span>
              <p>Envía cada enlace en un chat individual. En el grupo, cualquiera podría abrir el de otro.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <p>Fija un presupuesto: es la fuente de roces más común. Va incluido en el enlace de cada uno.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <p>Si alguien se apunta tarde, sortea otra vez y reenvía TODOS los enlaces, no solo el nuevo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <p>Haz el sorteo en el móvil desde el que vas a enviar: la lista se guarda en ese navegador.</p>
            </div>
          </div>
        </section>

        <section className={styles.warningBox} aria-labelledby="ai-errores">
          <h2 id="ai-errores" className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span> Errores frecuentes
          </h2>
          <ul className={styles.warningList}>
            <li>Abrir los enlaces para «comprobar que funcionan»: así el organizador se entera de todo.</li>
            <li>Sortear de nuevo después de enviar algunos enlaces: los ya enviados pasan a ser de otro sorteo.</li>
            <li>Excluir tanto que no quede reparto posible, sobre todo en grupos de 3 o 4 personas.</li>
            <li>Dos personas con el mismo nombre: la lista las cuenta como una. Añade la inicial del apellido.</li>
          </ul>
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
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="sorteo-amigo-invisible" />
      <Footer appName="sorteo-amigo-invisible" />
    </div>
  );
}
