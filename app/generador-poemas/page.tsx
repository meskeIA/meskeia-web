'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import EducationalSection from '@/components/EducationalSection';
import ShareCard from '@/components/ShareCard';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GeneradorPoemas.module.css';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type Dificultad = 'facil' | 'media' | 'avanzada';
type Pantalla = 'seleccion' | 'editor';
type EstadoSilaba = 'ok' | 'cerca' | 'error' | 'vacio';

interface FormaVerso {
  silabas: number;
  rimaId: string | null;
  tipo: 'consonante' | 'asonante' | 'libre';
  pausa?: boolean;
}

interface FormaPoet {
  id: string;
  nombre: string;
  icono: string;
  dificultad: Dificultad;
  descripcion: string;
  estructura: string;
  origen: string;
  versos: FormaVerso[];
  consejos: string[];
  ejemplo: string[];
}

// ─── DATOS ───────────────────────────────────────────────────────────────────

const FORMAS: FormaPoet[] = [
  {
    id: 'haiku',
    nombre: 'Haiku',
    icono: '🌸',
    dificultad: 'facil',
    descripcion: 'Poema japonés de tres versos que captura un instante de la naturaleza.',
    estructura: '5 · 7 · 5 sílabas — sin rima',
    origen: 'Japón, s. XVII (Matsuo Bashō)',
    versos: [
      { silabas: 5, rimaId: null, tipo: 'libre' },
      { silabas: 7, rimaId: null, tipo: 'libre' },
      { silabas: 5, rimaId: null, tipo: 'libre' },
    ],
    consejos: [
      'Describe un instante concreto de la naturaleza.',
      'Incluye una referencia estacional (kigo): primavera, lluvia, nieve…',
      'Crea un corte o contraste entre los versos.',
      'Evita metáforas complejas; prefiere imágenes directas.',
    ],
    ejemplo: [
      'Sobre el estanque',
      'salta la rana verde:',
      'ruido del agua.',
    ],
  },
  {
    id: 'redondilla',
    nombre: 'Redondilla',
    icono: '🎭',
    dificultad: 'facil',
    descripcion: 'Cuatro octosílabos con rima consonante abrazada (ABBA).',
    estructura: '8A 8B 8B 8A — consonante',
    origen: 'España, s. XV',
    versos: [
      { silabas: 8, rimaId: 'A', tipo: 'consonante' },
      { silabas: 8, rimaId: 'B', tipo: 'consonante' },
      { silabas: 8, rimaId: 'B', tipo: 'consonante' },
      { silabas: 8, rimaId: 'A', tipo: 'consonante' },
    ],
    consejos: [
      'El octosílabo es el verso más natural en español.',
      'Elige tus dos parejas de rima (A y B) antes de escribir.',
      'La rima abrazada (ABBA) da sensación de cierre perfecto.',
      'Úsala para reflexiones breves y aforismos poéticos.',
    ],
    ejemplo: [
      'La lluvia cae en el jardín',
      'y moja las flores del suelo.',
      'Asciende un perfume del cielo',
      'que lleva el aroma al festín.',
    ],
  },
  {
    id: 'serventesio',
    nombre: 'Serventesio',
    icono: '📜',
    dificultad: 'media',
    descripcion: 'Cuatro endecasílabos con rima consonante alterna (ABAB).',
    estructura: '11A 11B 11A 11B — consonante',
    origen: 'Occitania, s. XII — en España, Juan de Mena',
    versos: [
      { silabas: 11, rimaId: 'A', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
      { silabas: 11, rimaId: 'A', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
    ],
    consejos: [
      'El endecasílabo tiene tono solemne y elevado.',
      'La rima alterna (ABAB) crea sensación de diálogo entre versos.',
      'Permite el encabalgamiento entre los versos 1-2 y 3-4.',
      'Adecuado para poesía reflexiva y de tono culto.',
    ],
    ejemplo: [
      'En la ribera oscura del olvido',
      'el tiempo arrastra cuanto un día fue.',
      'Nada se guarda de lo que hemos sido,',
      'solo el recuerdo vuelve a lo que fue.',
    ],
  },
  {
    id: 'romance',
    nombre: 'Romance',
    icono: '⚔️',
    dificultad: 'media',
    descripcion: 'Serie de octosílabos con rima asonante en los versos pares; los impares quedan libres.',
    estructura: '8— 8a 8— 8a 8— 8a 8— 8a — asonante',
    origen: 'España, s. XIV — tradición oral',
    versos: [
      { silabas: 8, rimaId: null, tipo: 'libre' },
      { silabas: 8, rimaId: 'A', tipo: 'asonante' },
      { silabas: 8, rimaId: null, tipo: 'libre' },
      { silabas: 8, rimaId: 'A', tipo: 'asonante' },
      { silabas: 8, rimaId: null, tipo: 'libre' },
      { silabas: 8, rimaId: 'A', tipo: 'asonante' },
      { silabas: 8, rimaId: null, tipo: 'libre' },
      { silabas: 8, rimaId: 'A', tipo: 'asonante' },
    ],
    consejos: [
      'La rima asonante comparte solo las vocales finales (e.g. -a-o).',
      'Los versos impares libres dan agilidad narrativa.',
      'Ideal para contar historias y escenas épicas.',
      'Elige un par vocálico (e.g. a-o) y mantenlo en todos los pares.',
    ],
    ejemplo: [
      'Por los campos de Castilla',
      'cabalga un jinete gris.',
      'Lleva el alma en las espuelas',
      'y el viento en el arcabuz.',
      'Detrás queda la aldea',
      'con su torre de marfil.',
      'Delante solo el camino',
      'que nunca ha de tener fin.',
    ],
  },
  {
    id: 'lira',
    nombre: 'Lira',
    icono: '🎵',
    dificultad: 'avanzada',
    descripcion: 'Cinco versos alternando heptasílabos y endecasílabos, con rima consonante aBabB.',
    estructura: '7a 11B 7a 7b 11B — consonante',
    origen: 'Italia (adaptada por Garcilaso de la Vega), s. XVI',
    versos: [
      { silabas: 7, rimaId: 'A', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
      { silabas: 7, rimaId: 'A', tipo: 'consonante' },
      { silabas: 7, rimaId: 'B', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
    ],
    consejos: [
      'La alternancia 7-11 crea una musicalidad característica.',
      'La rima B aparece tres veces: planifícala bien antes de empezar.',
      'Los versos largos (11) suelen cerrar ideas importantes.',
      'Usada por Garcilaso, Fray Luis de León y San Juan de la Cruz.',
    ],
    ejemplo: [
      'Si de mi baja lira',
      'tanto pudiese el son, que en un momento',
      'aplacase la ira',
      'del animoso viento',
      'y la furia del mar y el movimiento.',
    ],
  },
  {
    id: 'soneto',
    nombre: 'Soneto',
    icono: '✨',
    dificultad: 'avanzada',
    descripcion: '14 endecasílabos: dos cuartetos (ABBA ABBA) y dos tercetos (CDC DCD).',
    estructura: 'ABBA ABBA CDC DCD — consonante',
    origen: 'Italia, s. XIII (Petrarca); en España, Boscán y Garcilaso',
    versos: [
      { silabas: 11, rimaId: 'A', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
      { silabas: 11, rimaId: 'A', tipo: 'consonante' },
      { silabas: 11, rimaId: 'A', tipo: 'consonante', pausa: true },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
      { silabas: 11, rimaId: 'B', tipo: 'consonante' },
      { silabas: 11, rimaId: 'A', tipo: 'consonante' },
      { silabas: 11, rimaId: 'C', tipo: 'consonante', pausa: true },
      { silabas: 11, rimaId: 'D', tipo: 'consonante' },
      { silabas: 11, rimaId: 'C', tipo: 'consonante' },
      { silabas: 11, rimaId: 'D', tipo: 'consonante', pausa: true },
      { silabas: 11, rimaId: 'C', tipo: 'consonante' },
      { silabas: 11, rimaId: 'D', tipo: 'consonante' },
    ],
    consejos: [
      'Planifica las 4 rimas (A, B, C, D) antes de escribir el primer verso.',
      'Los cuartetos plantean el tema; los tercetos lo resuelven.',
      'La volta (giro temático) entre cuartetos y tercetos es la clave del soneto.',
      'El endecasílabo tiene acento obligatorio en la 6.ª sílaba o en la 4.ª y 8.ª.',
      'Empieza por los versos de cierre de estrofa (4.º, 8.º, 14.º).',
    ],
    ejemplo: [
      'Un soneto me manda hacer Violante,',
      'que en mi vida me he visto en tal aprieto;',
      'catorce versos dicen que es soneto;',
      'burla burlando van los tres delante.',
      'Yo pensé que no hallara consonante,',
      'y estoy a la mitad de otro cuarteto;',
      'mas si me veo en el primer terceto,',
      'no hay cosa en los cuartetos que me espante.',
      'Por el primer terceto voy entrando,',
      'y parece que entré con pie derecho,',
      'pues fin con este verso le voy dando.',
      'Ya estoy en el segundo, y aun sospecho',
      'que voy los trece versos acabando;',
      'contad si son catorce, y está hecho.',
    ],
  },
];

const DIFICULTAD_CONFIG: Record<Dificultad, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: '#27ae60' },
  media: { label: 'Media', color: '#e07b39' },
  avanzada: { label: 'Avanzada', color: '#c0392b' },
};

const RIMA_COLOR: Record<string, string> = {
  A: '#2E86AB',
  B: '#48A9A6',
  C: '#e07b39',
  D: '#9b59b6',
};


// ─── ALGORITMO SILÁBICO ──────────────────────────────────────────────────────

function contarSilabas(verso: string): number {
  if (!verso.trim()) return 0;
  const palabras = verso.trim().split(/\s+/).filter(p => p.length > 0);
  if (palabras.length === 0) return 0;

  const esVocal = (c: string) => /[aeiouáéíóúü]/i.test(c);
  const esCerrada = (c: string) => /[iuíúü]/i.test(c);
  const esAbierta = (c: string) => /[aeoáéó]/i.test(c);

  function silabasPalabra(palabra: string): number {
    const p = palabra.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
    if (!p) return 0;
    let n = 0;
    let i = 0;
    while (i < p.length) {
      if (esVocal(p[i])) {
        n++;
        if (i + 1 < p.length && esVocal(p[i + 1])) {
          const a = p[i];
          const b = p[i + 1];
          const esDip =
            (esCerrada(a) && esAbierta(b)) ||
            (esAbierta(a) && esCerrada(b)) ||
            (esCerrada(a) && esCerrada(b));
          if (esDip) {
            i += 2;
            continue;
          }
        }
      }
      i++;
    }
    return Math.max(1, n);
  }

  let total = palabras.map(p => silabasPalabra(p)).reduce((a, b) => a + b, 0);

  // Sinalefa
  for (let j = 0; j < palabras.length - 1; j++) {
    const w1 = palabras[j].toLowerCase().replace(/[^a-záéíóúü]/g, '');
    const w2 = palabras[j + 1].toLowerCase().replace(/[^a-záéíóúü]/g, '');
    if (w1 && w2 && esVocal(w1[w1.length - 1]) && esVocal(w2[0])) {
      total = Math.max(1, total - 1);
    }
  }

  // Corrección por acento de la última palabra
  const ultima = palabras[palabras.length - 1].toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
  if (ultima) {
    if (/[áéíóú]/.test(ultima)) {
      const idx = ultima.search(/[áéíóú]/);
      const despues = ultima.slice(idx + 1);
      const vocalesDespues = (despues.match(/[aeiouáéíóúü]/g) ?? []).length;
      if (vocalesDespues === 0) total++;      // aguda acentuada
      else if (vocalesDespues >= 2) total--;  // esdrújula
    } else {
      const fin = ultima[ultima.length - 1];
      if (fin && !'aeiouáéíóúüns'.includes(fin)) total++; // aguda sin acento
    }
  }

  return Math.max(1, total);
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function GeneradorPoemas() {
  const [pantalla, setPantalla] = useState<Pantalla>('seleccion');
  const [formaActual, setFormaActual] = useState<FormaPoet | null>(null);
  const [versos, setVersos] = useState<string[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [mostrarEjemplo, setMostrarEjemplo] = useState(false);

  const silabasCont = useMemo(() => versos.map(v => contarSilabas(v)), [versos]);

  function seleccionarForma(forma: FormaPoet) {
    setFormaActual(forma);
    setVersos(new Array(forma.versos.length).fill(''));
    setCopiado(false);
    setMostrarEjemplo(false);
    setPantalla('editor');
  }

  function volver() {
    setPantalla('seleccion');
    setFormaActual(null);
  }

  function actualizarVerso(idx: number, valor: string) {
    setVersos(prev => {
      const nuevo = [...prev];
      nuevo[idx] = valor;
      return nuevo;
    });
  }

  function copiarPoema() {
    if (!formaActual) return;
    const lineas: string[] = [];
    formaActual.versos.forEach((def, idx) => {
      if (def.pausa && idx > 0) lineas.push('');
      lineas.push(versos[idx] ?? '');
    });
    navigator.clipboard.writeText(lineas.join('\n')).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function limpiar() {
    if (!formaActual) return;
    setVersos(new Array(formaActual.versos.length).fill(''));
    setCopiado(false);
  }

  function getEstado(actual: number, objetivo: number): EstadoSilaba {
    if (actual === 0) return 'vacio';
    if (actual === objetivo) return 'ok';
    if (Math.abs(actual - objetivo) <= 1) return 'cerca';
    return 'error';
  }

  function getEstadoClass(estado: EstadoSilaba): string {
    switch (estado) {
      case 'ok': return styles.silabaOk;
      case 'cerca': return styles.silabaCerca;
      case 'error': return styles.silabaError;
      default: return styles.silabaVacio;
    }
  }

  const relatedApps = getRelatedApps('generador-poemas');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Generador de Poemas por Forma</h1>
        <p>Escribe un haiku, soneto, lira o romance con guía de sílabas en tiempo real</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── PANTALLA DE SELECCIÓN ── */}
        {pantalla === 'seleccion' && (
          <section className={styles.seleccion}>
            <h2 className={styles.seccionTitulo}>Elige una forma poética</h2>
            <div className={styles.formasGrid}>
              {FORMAS.map(forma => (
                <button
                  key={forma.id}
                  type="button"
                  className={styles.formaCard}
                  onClick={() => seleccionarForma(forma)}
                  aria-label={`Escribir un ${forma.nombre}`}
                >
                  <div className={styles.formaIcono} aria-hidden="true">{forma.icono}</div>
                  <div className={styles.formaInfo}>
                    <div className={styles.formaCabecera}>
                      <span className={styles.formaNombre}>{forma.nombre}</span>
                      <span
                        className={styles.dificultadBadge}
                        style={{ backgroundColor: DIFICULTAD_CONFIG[forma.dificultad].color }}
                      >
                        {DIFICULTAD_CONFIG[forma.dificultad].label}
                      </span>
                    </div>
                    <p className={styles.formaDesc}>{forma.descripcion}</p>
                    <div className={styles.formaEstructura}>{forma.estructura}</div>
                    <div className={styles.formaOrigen}>{forma.origen}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── PANTALLA DE EDITOR ── */}
        {pantalla === 'editor' && formaActual && (
          <section className={styles.editor}>
            <div className={styles.editorCabecera}>
              <button type="button" className={styles.volverBtn} onClick={volver} aria-label="Volver a la selección de formas">
                ← Volver
              </button>
              <div className={styles.editorTitulo}>
                <span className={styles.editorIcono} aria-hidden="true">{formaActual.icono}</span>
                <h2>{formaActual.nombre}</h2>
                <span className={styles.editorEstructura}>{formaActual.estructura}</span>
              </div>
            </div>

            <div className={styles.editorLayout}>
              {/* Columna principal: versos */}
              <div className={styles.editorPrincipal}>
                <div className={styles.versosContainer} role="list">
                  {formaActual.versos.map((defVerso, idx) => {
                    const actual = silabasCont[idx] ?? 0;
                    const estado = getEstado(actual, defVerso.silabas);
                    return (
                      <div key={idx}>
                        {defVerso.pausa && idx > 0 && (
                          <div className={styles.pausaLinea} aria-hidden="true" />
                        )}
                        <div className={styles.versoItem} role="listitem">
                          <span className={styles.versoNum} aria-hidden="true">{idx + 1}</span>
                          <div className={styles.versoInputWrapper}>
                            <input
                              type="text"
                              className={styles.versoInput}
                              placeholder={`Verso ${idx + 1} — ${defVerso.silabas} sílabas`}
                              value={versos[idx] ?? ''}
                              onChange={e => actualizarVerso(idx, e.target.value)}
                              aria-label={`Verso ${idx + 1}, objetivo ${defVerso.silabas} sílabas, rima ${defVerso.rimaId ?? 'libre'}`}
                            />
                            <div className={styles.versoMeta}>
                              <span
                                className={`${styles.silabaCount} ${getEstadoClass(estado)}`}
                                aria-live="polite"
                                aria-label={`${actual} de ${defVerso.silabas} sílabas`}
                              >
                                {actual === 0 ? `—/${defVerso.silabas}` : `${actual}/${defVerso.silabas}`}
                              </span>
                              {defVerso.rimaId ? (
                                <span
                                  className={styles.rimaTag}
                                  style={{ backgroundColor: RIMA_COLOR[defVerso.rimaId] }}
                                  title={`Rima ${defVerso.rimaId} (${defVerso.tipo})`}
                                  aria-label={`Rima ${defVerso.rimaId}`}
                                >
                                  {defVerso.rimaId}
                                </span>
                              ) : (
                                <span className={styles.rimaLibre} title="Verso libre">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.accionesBar}>
                  <button
                    type="button"
                    className={`${styles.copiarBtn} ${copiado ? styles.copiarBtnOk : ''}`}
                    onClick={copiarPoema}
                    aria-label="Copiar poema al portapapeles"
                  >
                    {copiado ? '✓ ¡Copiado!' : '📋 Copiar poema'}
                  </button>
                  <button
                    type="button"
                    className={styles.limpiarBtn}
                    onClick={limpiar}
                    aria-label="Limpiar todos los versos"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    className={`${styles.ejemploBtn} ${mostrarEjemplo ? styles.ejemploBtnActivo : ''}`}
                    onClick={() => setMostrarEjemplo(v => !v)}
                    aria-expanded={mostrarEjemplo}
                    aria-controls="panel-ejemplo"
                  >
                    {mostrarEjemplo ? 'Ocultar ejemplo' : 'Ver ejemplo'}
                  </button>
                </div>

                {mostrarEjemplo && (
                  <div id="panel-ejemplo" className={styles.ejemploPanel}>
                    <h3 className={styles.ejemploTitulo}>Ejemplo — {formaActual.nombre}</h3>
                    <div className={styles.ejemploVersos}>
                      {formaActual.ejemplo.map((linea, i) => (
                        <div key={i}>
                          {formaActual.versos[i]?.pausa && i > 0 && (
                            <div className={styles.ejemploPausa} aria-hidden="true" />
                          )}
                          <p className={styles.ejemploVerso}>{linea}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Columna lateral: consejos + leyenda */}
              <aside className={styles.editorAside}>
                <div className={styles.consejosList}>
                  <h3 className={styles.consejosTitle}>Consejos</h3>
                  <ul>
                    {formaActual.consejos.map((c, i) => (
                      <li key={i} className={styles.consejoItem}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.leyendaRima}>
                  <h4 className={styles.leyendaTitulo}>Leyenda de rima</h4>
                  {['A', 'B', 'C', 'D'].filter(r => formaActual.versos.some(v => v.rimaId === r)).map(r => (
                    <div key={r} className={styles.leyendaItem}>
                      <span
                        className={styles.leyendaBadge}
                        style={{ backgroundColor: RIMA_COLOR[r] }}
                      >
                        {r}
                      </span>
                      <span className={styles.leyendaDesc}>
                        Rima {r} — {formaActual.versos.find(v => v.rimaId === r)?.tipo}
                      </span>
                    </div>
                  ))}
                  {formaActual.versos.some(v => !v.rimaId) && (
                    <div className={styles.leyendaItem}>
                      <span className={styles.leyendaBadgeLibre}>—</span>
                      <span className={styles.leyendaDesc}>Verso libre</span>
                    </div>
                  )}
                </div>

                <div className={styles.leyendaSilabas}>
                  <h4 className={styles.leyendaTitulo}>Contador de sílabas</h4>
                  <div className={styles.silabaEjemplo}>
                    <span className={`${styles.silabaCount} ${styles.silabaOk}`}>7/7</span>
                    <span>Correcto</span>
                  </div>
                  <div className={styles.silabaEjemplo}>
                    <span className={`${styles.silabaCount} ${styles.silabaCerca}`}>6/7</span>
                    <span>±1 sílaba</span>
                  </div>
                  <div className={styles.silabaEjemplo}>
                    <span className={`${styles.silabaCount} ${styles.silabaError}`}>4/7</span>
                    <span>Fuera de rango</span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* ── SECCIÓN EDUCATIVA v2.0 ── */}
        <EducationalSection
          title="Todo sobre las formas poéticas clásicas"
          subtitle="Historia, estructura y consejos para el haiku, la redondilla, el romance, la lira y el soneto."
        >
          {/* 1. TABLA COMPARATIVA */}
          <h3>Comparativa de las seis formas</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Forma</th>
                  <th>Versos</th>
                  <th>Sílabas</th>
                  <th>Tipo de rima</th>
                  <th>Esquema</th>
                  <th>Nivel</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Haiku</td><td>3</td><td>5-7-5</td><td>Sin rima</td><td>libre</td><td>Fácil</td></tr>
                <tr><td>Redondilla</td><td>4</td><td>8-8-8-8</td><td>Consonante</td><td>ABBA</td><td>Fácil</td></tr>
                <tr><td>Serventesio</td><td>4</td><td>11-11-11-11</td><td>Consonante</td><td>ABAB</td><td>Media</td></tr>
                <tr><td>Romance</td><td>8+</td><td>8-8-8-8…</td><td>Asonante</td><td>-a-a-a-a</td><td>Media</td></tr>
                <tr><td>Lira</td><td>5</td><td>7-11-7-7-11</td><td>Consonante</td><td>aBabB</td><td>Avanzada</td></tr>
                <tr><td>Soneto</td><td>14</td><td>11×14</td><td>Consonante</td><td>ABBA ABBA CDC DCD</td><td>Avanzada</td></tr>
              </tbody>
            </table>
          </div>

          {/* 2. CASOS DE USO */}
          <h3>¿Quién puede usar esta herramienta?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <strong><span aria-hidden="true">📚</span> Estudiante de Literatura</strong>
              <p>Practica las estructuras métricas que aparecen en el comentario de texto de tu examen de acceso a la universidad. Empieza por la redondilla y avanza al soneto.</p>
            </div>
            <div className={styles.escenarioCard}>
              <strong><span aria-hidden="true">✍️</span> Escritor principiante</strong>
              <p>Aprende la musicalidad del verso español escribiendo primero un haiku: solo 17 sílabas y sin rima. En 10 minutos ya tienes tu primer poema métrico.</p>
            </div>
            <div className={styles.escenarioCard}>
              <strong><span aria-hidden="true">🎓</span> Docente de Lengua</strong>
              <p>Crea ejemplos ilustrativos para trabajar formas clásicas en clase. Muestra en tiempo real cómo funciona la sinalefa o el efecto del acento final.</p>
            </div>
            <div className={styles.escenarioCard}>
              <strong><span aria-hidden="true">🌟</span> Aficionado a la poesía</strong>
              <p>Si escribes en verso libre, experimenta con la métrica clásica. La disciplina del soneto o la lira puede aportar musicalidad que no encontrarás de otro modo.</p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué es la sinalefa y cómo funciona?</strong>
              <p>La sinalefa funde la vocal final de una palabra con la vocal inicial de la siguiente, contando las dos como una sola sílaba. Por ejemplo: <em>«la_una»</em> (3 sílabas, no 4). Esta herramienta la aplica automáticamente.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre rima consonante y asonante?</strong>
              <p>La rima <strong>consonante</strong> coincide en todas las letras desde la última vocal tónica: <em>viento / aliento</em>. La rima <strong>asonante</strong> coincide solo en las vocales: <em>viento / quiero</em> (i-e en ambos). El romance utiliza asonante; el soneto y la redondilla usan consonante.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Es obligatorio que las sílabas sean exactas?</strong>
              <p>En la métrica clásica se espera exactitud, pero los poetas siempre han empleado licencias. El contador muestra ±1 en amarillo como variación aceptable en muchos contextos. Lo importante es que el ritmo fluya al leer en voz alta.</p>
              <div className={styles.faqTip}>💡 Lee siempre el verso en voz alta: el oído detecta lo que la pantalla no.</div>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué significa que el verso sea agudo, llano o esdrújulo?</strong>
              <p>El acento de la última palabra afecta al cómputo: si la última palabra es <strong>aguda</strong> (acento en la última sílaba, como <em>canción</em>), se suma 1. Si es <strong>esdrújula</strong> (acento en la antepenúltima, como <em>cálido</em>), se resta 1. Las llanas (acento en penúltima) no cambian el cómputo.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el contador puede diferir de mi propio recuento?</strong>
              <p>El algoritmo aplica las reglas estándar de sinalefa y corrección por acento, pero hay casos ambiguos (diptongos facultativos, hiatos opcionales, sinalefa rota) donde el poeta decide. El contador ofrece una guía, no un veredicto.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo escribir más estrofas de las que muestra el editor?</strong>
              <p>El editor muestra una estrofa completa (o el poema entero, en el caso de haiku, redondilla, serventesio, lira y soneto). Para el romance, muestra 8 versos como punto de partida. Puedes copiar el poema y añadir más estrofas en tu editor de texto habitual.</p>
            </div>
          </div>

          {/* 4. GUÍA PASO A PASO */}
          <h3>Cómo escribir tu primer poema métrico</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Elige la forma según tu nivel</strong>
                <p>Si es tu primera vez, empieza por el <strong>haiku</strong> (3 versos, sin rima) o la <strong>redondilla</strong> (4 versos octosílabos). Reserva el soneto para cuando tengas práctica con los octosílabos y endecasílabos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Lee los consejos y el ejemplo</strong>
                <p>Antes de escribir el primer verso, pulsa «Ver ejemplo» para ver un poema real en esa forma. Los consejos del panel lateral explican el carácter y origen histórico de la estructura.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Planifica las rimas (formas con rima)</strong>
                <p>Para redondilla, serventesio, lira o soneto, anota en papel dos o tres palabras para cada grupo de rima antes de empezar. Elegir <em>luz / cruz / voz</em> para la rima A evita el bloqueo creativo a mitad del poema.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Escribe verso a verso y ajusta</strong>
                <p>El contador se actualiza en tiempo real. Verde = correcto. Amarillo = ±1 sílaba (aceptable con licencia). Rojo = fuera de rango. Ajusta añadiendo o eliminando palabras sin cambiar el sentido.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Lee en voz alta y corrige</strong>
                <p>Una vez completado, lee el poema en voz alta marcando el ritmo. El oído detectará versos que suenan forzados aunque el contador diga «correcto». Ajusta el orden de palabras hasta que fluya.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Copia y perfecciona</strong>
                <p>Usa el botón «Copiar poema» para exportar el texto. Pégalo en tu editor de texto para revisiones más amplias, añadir más estrofas o dar el toque final al poema.</p>
              </div>
            </div>
          </div>

          {/* 5. MEJORES PRÁCTICAS */}
          <h3>Consejos para mejorar rápido</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <p><strong>Empieza con el haiku</strong> — 17 sílabas en total y sin rima. Es la forma más corta y permite entender el cómputo silábico sin la presión de buscar palabras rimadas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <p><strong>Planifica las rimas antes de escribir</strong> — Una lista de 3-4 palabras por grupo de rima evita el bloqueo a mitad del poema y da más opciones de vocabulario.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👂</span>
              <p><strong>Lee siempre en voz alta</strong> — El ritmo se percibe con el oído, no con la vista. Un verso que «cuenta bien» pero suena raro necesita ajuste de acentuación o de orden de palabras.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <p><strong>Acepta la variación ±1 sílaba</strong> — Los grandes poetas emplean licencias métricas. El contador muestra la desviación; el criterio artístico es tuyo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📚</span>
              <p><strong>Estudia los ejemplos clásicos</strong> — La lira de Garcilaso y el soneto de Lope no son solo referencias: son modelos de cómo resolver los problemas rítmicos más habituales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌱</span>
              <p><strong>Progresa gradualmente</strong> — El camino natural es: haiku → redondilla → romance → serventesio → lira → soneto. Cada forma añade una dificultad nueva sobre la anterior.</p>
            </div>
          </div>

          {/* 6. WARNING BOX */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Limitaciones del contador y normas a tener en cuenta</strong>
            </div>
            <ul className={styles.warningList}>
              <li>El contador es <strong>orientativo</strong>: el juicio poético final corresponde siempre al autor.</li>
              <li>La <strong>sinalefa se aplica automáticamente</strong> pero puede romperse por decisión estilística (pausa, énfasis, hiato expresivo).</li>
              <li>Las <strong>variantes dialectales</strong> del español (seseo, distinción c/z, diptongaciones regionales) pueden cambiar el cómputo.</li>
              <li>El algoritmo no contempla <strong>diptongos facultativos</strong> (como <em>sua-ve</em> vs <em>sua-ve</em> en dos sílabas): puede desviarse en casos de hiatos opcionales.</li>
              <li>La <strong>diéresis poética</strong> (dividir un diptongo en dos sílabas) es una licencia válida que este contador no detecta automáticamente.</li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="generador-poemas" />
      <Footer appName="generador-poemas" />
    </div>
  );
}
