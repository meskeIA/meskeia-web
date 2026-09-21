'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AfinadorInstrumentos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import {
  AFINACIONES,
  NOTAS_ES,
  NOTAS_EN,
  frecuenciaDeNota,
  notaMasCercana,
  notaEscritaDesdeReal,
  nombreNota,
  type FamiliaInstrumento,
} from '@/lib/calculadoras/afinacionInstrumentos';

// Las afinaciones, la transposición de los instrumentos que no suenan donde leen y la
// conversión nota↔frecuencia viven en el motor, probado aparte: un signo al revés en la
// transposición da una nota igual de plausible en pantalla y no se ve sin un instrumento
// delante. Aquí solo queda la captura de audio, que sí necesita navegador.

const FAMILIAS: { id: FamiliaInstrumento; titulo: string; icono: string }[] = [
  { id: 'cuerda', titulo: 'Cuerda', icono: '🎸' },
  { id: 'viento', titulo: 'Viento', icono: '🎺' },
  { id: 'tecla', titulo: 'Tecla', icono: '🎹' },
];

// Algoritmo de autocorrelación para detectar pitch
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let foundGoodCorrelation = false;
  const correlations = new Array(MAX_SAMPLES);

  // Verificar si hay suficiente señal
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let lastCorrelation = 1;
  for (let offset = 0; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - (correlation / MAX_SAMPLES);
    correlations[offset] = correlation;

    if ((correlation > 0.9) && (correlation > lastCorrelation)) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      const shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
      return sampleRate / (bestOffset + (8 * shift));
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  return -1;
}

export default function AfinadorInstrumentosPage() {
  const [escuchando, setEscuchando] = useState(false);
  const [frecuenciaDetectada, setFrecuenciaDetectada] = useState<number | null>(null);
  const [notaActual, setNotaActual] = useState<{ nota: number; octava: number; cents: number } | null>(null);
  const [instrumentoId, setInstrumentoId] = useState(AFINACIONES[0].id);
  const [a4Referencia, setA4Referencia] = useState(440);
  const [permisoMicrofono, setPermisoMicrofono] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);

  const detectarPitch = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current) return;

    analyserRef.current.getFloatTimeDomainData(bufferRef.current as Float32Array<ArrayBuffer>);
    const frecuencia = autoCorrelate(bufferRef.current, audioContextRef.current!.sampleRate);

    // Hasta 2.500 Hz: el registro agudo de la flauta (Do7 = 2.093 Hz) y las teclas altas
    // del piano se salian del limite anterior de 2.000 Hz y la pantalla se quedaba muda.
    if (frecuencia > 0 && frecuencia < 2500) {
      setFrecuenciaDetectada(frecuencia);
      const info = notaMasCercana(frecuencia, a4Referencia);
      setNotaActual(info);
    } else {
      setFrecuenciaDetectada(null);
      setNotaActual(null);
    }

    animationRef.current = requestAnimationFrame(detectarPitch);
  }, [a4Referencia]);

  const iniciarEscucha = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setPermisoMicrofono('granted');

      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      bufferRef.current = new Float32Array(analyserRef.current.fftSize);

      setEscuchando(true);
      detectarPitch();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setPermisoMicrofono('denied');
    }
  };

  const detenerEscucha = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setEscuchando(false);
    setFrecuenciaDetectada(null);
    setNotaActual(null);
  };

  useEffect(() => {
    return () => {
      detenerEscucha();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEstadoAfinacion = (): 'bajo' | 'afinado' | 'alto' | null => {
    if (!notaActual) return null;
    if (Math.abs(notaActual.cents) <= 5) return 'afinado';
    return notaActual.cents < 0 ? 'bajo' : 'alto';
  };

  const estado = getEstadoAfinacion();
  const instrumento = AFINACIONES.find((a) => a.id === instrumentoId) ?? AFINACIONES[0];
  const transpone = instrumento.transposicion !== 0;
  // Lo que el instrumentista LEE cuando suena la nota detectada: una trompeta en si bemol
  // que toca su Do escrito hace sonar un Si bemol, y sin esta linea el afinador le contesta
  // con una nota que no es la que tiene delante en la partitura.
  const notaEscrita = notaActual && transpone
    ? notaEscritaDesdeReal({ nota: notaActual.nota, octava: notaActual.octava }, instrumento.transposicion)
    : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Afinador de Instrumentos</h1>
        <p className={styles.subtitle}>
          Afinador cromático de cuerda, viento y tecla. Con los instrumentos transpositores
          te dice también qué nota estás leyendo tú
        </p>
      </header>

      <LegalNotice />

      {/* Panel principal */}
      <div className={styles.afinadorPanel}>
        {/* Display de nota */}
        <div className={`${styles.notaDisplay} ${estado ? styles[estado] : ''}`}>
          {notaActual ? (
            <>
              <span className={styles.notaNombre}>{NOTAS_ES[notaActual.nota]}</span>
              <span className={styles.notaOctava}>{notaActual.octava}</span>
              <span className={styles.notaEn}>({NOTAS_EN[notaActual.nota]})</span>
            </>
          ) : (
            <span className={styles.notaVacia}>--</span>
          )}
        </div>

        {/* Traducción para instrumentos transpositores */}
        {transpone && (
          <div className={styles.transposicionAviso} role="status" aria-live="polite">
            {notaEscrita ? (
              <>
                <span className={styles.transposicionSuena}>
                  Suena <strong>{nombreNota({ nota: notaActual!.nota, octava: notaActual!.octava })}</strong> real
                </span>
                <span className={styles.transposicionFlecha} aria-hidden="true">→</span>
                <span className={styles.transposicionLee}>
                  tú lees <strong>{nombreNota(notaEscrita)}</strong>
                </span>
              </>
            ) : (
              <span className={styles.transposicionSuena}>
                {instrumento.nombre}: lo que suena va {Math.abs(instrumento.transposicion)} semitonos
                por debajo de lo que lees
              </span>
            )}
          </div>
        )}

        {/* Indicador de cents */}
        <div className={styles.centsContainer}>
          <div className={styles.centsBar}>
            <div className={styles.centsMarcas}>
              <span>-50</span>
              <span>-25</span>
              <span>0</span>
              <span>+25</span>
              <span>+50</span>
            </div>
            <div className={styles.centsTrack}>
              <div
                className={`${styles.centsIndicador} ${estado ? styles[estado] : ''}`}
                style={{
                  left: notaActual
                    ? `${50 + Math.max(-50, Math.min(50, notaActual.cents))}%`
                    : '50%'
                }}
              />
              <div className={styles.centsCentro} />
            </div>
          </div>
          <p className={styles.centsValor}>
            {notaActual ? `${notaActual.cents > 0 ? '+' : ''}${notaActual.cents} cents` : '--'}
          </p>
        </div>

        {/* Frecuencia detectada */}
        <div className={styles.frecuenciaInfo}>
          <span className={styles.frecuenciaLabel}>Frecuencia:</span>
          <span className={styles.frecuenciaValor}>
            {frecuenciaDetectada ? `${formatNumber(frecuenciaDetectada, 1)} Hz` : '-- Hz'}
          </span>
        </div>

        {/* Estado de afinación */}
        {estado && (
          <div className={`${styles.estadoAfinacion} ${styles[estado]}`}>
            {estado === 'afinado' && '✓ Afinado'}
            {estado === 'bajo' && '↓ Subir tensión'}
            {estado === 'alto' && '↑ Bajar tensión'}
          </div>
        )}

        {/* Botón de escucha */}
        {permisoMicrofono === 'denied' ? (
          <div className={styles.errorPermiso}>
            <p>Permiso de micrófono denegado</p>
            <p className={styles.errorSubtexto}>Activa el micrófono en la configuración del navegador</p>
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.btnEscuchar} ${escuchando ? styles.activo : ''}`}
            onClick={escuchando ? detenerEscucha : iniciarEscucha}
            aria-pressed={escuchando}
          >
            <span className={styles.btnIcono} aria-hidden="true">{escuchando ? '🎤' : '🎙️'}</span>
            <span>{escuchando ? 'Detener' : 'Iniciar afinador'}</span>
          </button>
        )}
      </div>

      {/* Selección de instrumento */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Instrumento</h3>
        {FAMILIAS.map((familia) => (
          <div key={familia.id} className={styles.familiaBloque}>
            <h4 className={styles.familiaTitulo}>
              <span aria-hidden="true">{familia.icono}</span> {familia.titulo}
            </h4>
            <div className={styles.instrumentosGrid}>
              {AFINACIONES.filter((a) => a.familia === familia.id).map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  className={`${styles.instrumentoBtn} ${instrumentoId === inst.id ? styles.instrumentoActivo : ''}`}
                  onClick={() => setInstrumentoId(inst.id)}
                  aria-pressed={instrumentoId === inst.id}
                >
                  {inst.nombre}
                </button>
              ))}
            </div>
          </div>
        ))}

        {instrumento.aviso && <p className={styles.instrumentoAviso}>{instrumento.aviso}</p>}

        {/* Cuerdas al aire: las frecuencias salen del La4 elegido, no de una tabla fija */}
        {instrumento.cuerdas && (
          <div className={styles.cuerdasGrid}>
            {instrumento.cuerdas.map((cuerda, idx) => (
              <div key={`${cuerda.nota}-${cuerda.octava}-${idx}`} className={styles.cuerdaItem}>
                <span className={styles.cuerdaNumero}>{idx + 1}</span>
                <span className={styles.cuerdaNota}>{nombreNota(cuerda)}</span>
                <span className={styles.cuerdaFrec}>
                  {formatNumber(frecuenciaDeNota(cuerda.nota, cuerda.octava, a4Referencia), 1)} Hz
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notas de afinación de un viento o una tecla, con su equivalente escrito */}
        {instrumento.referencias && (
          <div className={styles.tableWrapper}>
            <table className={styles.referenciasTable}>
              <caption className={styles.referenciasCaption}>
                {transpone
                  ? 'Notas de afinación habituales: lo que suena y lo que tú lees para darlo'
                  : 'Notas de afinación habituales'}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Suena (real)</th>
                  {transpone && <th scope="col">Tú lees</th>}
                  <th scope="col">Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {instrumento.referencias.map((ref) => (
                  <tr key={`${ref.nota}-${ref.octava}`}>
                    <td><strong>{nombreNota(ref)}</strong></td>
                    {transpone && <td>{nombreNota(notaEscritaDesdeReal(ref, instrumento.transposicion))}</td>}
                    <td>{formatNumber(frecuenciaDeNota(ref.nota, ref.octava, a4Referencia), 1)} Hz</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referencia A4 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Frecuencia de referencia (La4)</h3>
        <div className={styles.referenciaControl}>
          <button
            type="button"
            className={styles.btnReferencia}
            onClick={() => setA4Referencia(Math.max(420, a4Referencia - 1))}
          >
            −
          </button>
          <span className={styles.referenciaValor}>{a4Referencia} Hz</span>
          <button
            type="button"
            className={styles.btnReferencia}
            onClick={() => setA4Referencia(Math.min(460, a4Referencia + 1))}
          >
            +
          </button>
        </div>
        <div className={styles.referenciasPreset}>
          <button type="button" onClick={() => setA4Referencia(440)} className={a4Referencia === 440 ? styles.presetActivo : ''} aria-pressed={a4Referencia === 440}>440 Hz (Estándar)</button>
          <button type="button" onClick={() => setA4Referencia(442)} className={a4Referencia === 442 ? styles.presetActivo : ''} aria-pressed={a4Referencia === 442}>442 Hz (Orquesta)</button>
          <button type="button" onClick={() => setA4Referencia(432)} className={a4Referencia === 432 ? styles.presetActivo : ''} aria-pressed={a4Referencia === 432}>432 Hz</button>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres dominar la afinación de instrumentos?"
        subtitle="Aprende técnicas profesionales y cómo funciona la detección automática de tono"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Instrumento</th>
                <th>Cuerdas / Notas</th>
                <th>Rango Hz</th>
                <th>Dificultad afinación</th>
                <th>Consejo clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Guitarra estándar (6c)</strong></td>
                <td>Mi2, La2, Re3, Sol3, Si3, Mi4</td>
                <td>82 – 330 Hz</td>
                <td>⭐⭐ Media</td>
                <td>Afina siempre de grave a agudo</td>
              </tr>
              <tr>
                <td><strong>Bajo 4 cuerdas</strong></td>
                <td>Mi1, La1, Re2, Sol2</td>
                <td>41 – 98 Hz</td>
                <td>⭐⭐ Media</td>
                <td>Usa el 5º traste para afinar por armónicos</td>
              </tr>
              <tr>
                <td><strong>Ukelele estándar (C)</strong></td>
                <td>Sol4, Do4, Mi4, La4</td>
                <td>261 – 440 Hz</td>
                <td>⭐ Fácil</td>
                <td>La 4ª cuerda (Sol) es aguda, no confundir</td>
              </tr>
              <tr>
                <td><strong>Violín</strong></td>
                <td>Sol3, Re4, La4, Mi5</td>
                <td>196 – 660 Hz</td>
                <td>⭐⭐⭐ Alta</td>
                <td>Afina en 5ªs exactas; usa el diapasón para La4</td>
              </tr>
              <tr>
                <td><strong>Mandolina (4 pares)</strong></td>
                <td>Sol3, Re4, La4, Mi5</td>
                <td>196 – 660 Hz</td>
                <td>⭐⭐⭐ Alta</td>
                <td>Afina cada par de cuerdas al unísono exacto</td>
              </tr>
              <tr>
                <td><strong>Guitarra 7 cuerdas</strong></td>
                <td>Si1 + 6 estándar</td>
                <td>62 – 330 Hz</td>
                <td>⭐⭐ Media</td>
                <td>La 7ª (Si1) necesita mayor tensión de clavija</td>
              </tr>
              <tr>
                <td><strong>Bajo 5 cuerdas</strong></td>
                <td>Si0, Mi1, La1, Re2, Sol2</td>
                <td>31 – 98 Hz</td>
                <td>⭐⭐⭐ Alta</td>
                <td>El Si0 puede ser difícil de detectar por el micrófono</td>
              </tr>
              <tr>
                <td><strong>Viola</strong></td>
                <td>Do3, Sol3, Re4, La4</td>
                <td>131 – 440 Hz</td>
                <td><span aria-hidden="true">⭐⭐⭐</span> Alta</td>
                <td>Una quinta por debajo del violín: no la afines de oído con él</td>
              </tr>
              <tr>
                <td><strong>Bandurria</strong></td>
                <td>Sol#3, Do#4, Fa#4, Si4, Mi5, La5</td>
                <td>208 – 880 Hz</td>
                <td><span aria-hidden="true">⭐⭐⭐</span> Alta</td>
                <td>Seis órdenes dobles: afina cada par al unísono exacto</td>
              </tr>
              <tr>
                <td><strong>Laúd español</strong></td>
                <td>Sol#2, Do#3, Fa#3, Si3, Mi4, La4</td>
                <td>104 – 440 Hz</td>
                <td><span aria-hidden="true">⭐⭐⭐</span> Alta</td>
                <td>Igual que la bandurria, una octava por debajo</td>
              </tr>
              <tr>
                <td><strong>Vihuela mexicana</strong></td>
                <td>La3, Re4, Sol4, Si3, Mi4</td>
                <td>220 – 392 Hz</td>
                <td><span aria-hidden="true">⭐⭐</span> Media</td>
                <td>Reentrante: la 3ª (Sol4) es la más aguda de las cinco</td>
              </tr>
              <tr>
                <td><strong>Banjo 5 cuerdas</strong></td>
                <td>Sol4, Re3, Sol3, Si3, Re4</td>
                <td>196 – 392 Hz</td>
                <td>⭐⭐ Media</td>
                <td>La 5ª cuerda corta (Sol4) es la más aguda</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Instrumentos transpositores */}
        <h3 className={styles.sectionTitle}>
          <span aria-hidden="true">🎺</span> Por qué el afinador te dice otra nota (instrumentos transpositores)
        </h3>
        <p className={styles.parrafoEducativo}>
          Un afinador cromático nombra la nota que <strong>suena</strong>. En trompeta, clarinete o
          saxo, la nota que suena no es la que está escrita en tu papel: son instrumentos
          transpositores. Si tocas tu <strong>Do</strong> con una trompeta en si bemol, el aire hace
          sonar un <strong>Si bemol</strong> real, y eso es exactamente lo que el afinador escribe en
          pantalla. No está equivocado ni tú tampoco: selecciona tu instrumento arriba y el
          afinador añade debajo la nota que tú estás leyendo.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Instrumento</th>
                <th>Afinación</th>
                <th>Lo que suena</th>
                <th>Tocas tu…</th>
                <th>…y suena</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Trompeta</strong></td>
                <td>Si bemol</td>
                <td>Un tono por debajo (2 semitonos)</td>
                <td>Do4</td>
                <td>Si bemol 3 — 233,1 Hz</td>
              </tr>
              <tr>
                <td><strong>Clarinete</strong></td>
                <td>Si bemol</td>
                <td>Un tono por debajo (2 semitonos)</td>
                <td>Do4</td>
                <td>Si bemol 3 — 233,1 Hz</td>
              </tr>
              <tr>
                <td><strong>Saxo alto</strong></td>
                <td>Mi bemol</td>
                <td>Una sexta mayor por debajo (9 semitonos)</td>
                <td>Sol4</td>
                <td>Si bemol 3 — 233,1 Hz</td>
              </tr>
              <tr>
                <td><strong>Saxo tenor</strong></td>
                <td>Si bemol</td>
                <td>Una novena mayor por debajo (14 semitonos)</td>
                <td>Do5</td>
                <td>Si bemol 3 — 233,1 Hz</td>
              </tr>
              <tr>
                <td><strong>Flauta travesera</strong></td>
                <td>Do</td>
                <td>Tal como se escribe</td>
                <td>La4</td>
                <td>La4 — 440,0 Hz</td>
              </tr>
              <tr>
                <td><strong>Trombón</strong></td>
                <td>Do</td>
                <td>Tal como se escribe (clave de fa)</td>
                <td>Si bemol 2</td>
                <td>Si bemol 2 — 116,5 Hz</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.parrafoEducativo}>
          Por eso, cuando en una banda se dice «afinamos al si bemol», cada instrumento toca una
          nota escrita distinta y todos hacen sonar la misma: el si bemol de concierto. La columna
          «Tocas tu…» de la tabla es justo esa traducción.
        </p>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🎸 Principiante con guitarra</h3>
            <p>Selecciona &quot;Guitarra estándar&quot; para ver las 6 notas y frecuencias exactas. Toca cuerda por cuerda y observa el indicador: verde = afinado, rojo = ajusta la clavija.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎺</span> Viento en la banda</h3>
            <p>Selecciona trompeta, clarinete o saxo y toca tu nota de afinación. El afinador te
            dice la nota real que sale del instrumento y, debajo, la que tú estás leyendo: así
            sabes si el problema es la embocadura o la posición de la bomba.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎵 Músico en ensayo</h3>
            <p>Antes de empezar el ensayo, afina todas las cuerdas rápidamente. El afinador cromático detecta automáticamente la nota más cercana, sin necesidad de seleccionar manualmente.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔧 Luthier en ajuste</h3>
            <p>Verifica la afinación de instrumentos en reparación o configuración. Cambia la referencia de La4 entre 440, 442 o 443 Hz según las especificaciones del cliente o del conjunto musical.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎤 Guitarrista de escenario</h3>
            <p>En el escenario, el ruido ambiente puede dificultar la afinación. Conecta el instrumento directo al ordenador por interfaz de audio para una detección más limpia y precisa.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎻 Músico clásico (440 vs 442)</h3>
            <p>Si tocas con una orquesta que usa 442 Hz, ajusta la referencia antes de afinar. Una diferencia de 2 Hz equivale a ~7,8 cents: perceptible en música de cámara e instrumentos de cuerda.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎶 Ukelele para niños</h3>
            <p>El ukelele estándar en Do es perfecto para iniciarse. Sus 4 cuerdas (Sol-Do-Mi-La) tienen frecuencias fácilmente detectables por el micrófono. Ideal como primer instrumento.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Cómo detecta el afinador qué nota estoy tocando?</h3>
            <p>Usa la Web Audio API para capturar el audio del micrófono y aplica un algoritmo de detección de frecuencia fundamental (pitch detection). El método más común es el autocorrelación: compara la señal consigo misma con diferentes retardos para encontrar el período fundamental de la onda.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué a veces el afinador detecta la nota incorrecta?</h3>
            <p>El ruido ambiente, los armónicos fuertes o el eco pueden confundir al algoritmo. Asegúrate de tocar en un entorno silencioso, cerca del micrófono y de forma sostenida. Los instrumentos de bajo (fundamentales &lt;80 Hz) son los más difíciles de detectar con micrófonos de portátil.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Es igual de preciso que un afinador de clip físico?</h3>
            <p>En condiciones ideales (silencio, buena señal), la precisión es comparable (±1-2 cents). Un afinador de clip físico (Peterson, Snark, TC Electronic) tiene ventaja en escenarios ruidosos porque detecta las vibraciones mecánicas directamente, sin capturar el ruido ambiente.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué necesito dar permiso al micrófono?</h3>
            <p>El afinador analiza el audio en tiempo real desde tu micrófono. El navegador requiere permiso explícito por razones de privacidad. Todo el procesamiento ocurre localmente en tu dispositivo: no se envía ningún audio a ningún servidor.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué significa el indicador de cents?</h3>
            <p>Los cents miden la desviación respecto a la nota temperada. 0 = afinado perfectamente. +50 cents = medio semitono alto. -50 cents = medio semitono bajo. El oído humano entrenado detecta desviaciones de 5-10 cents. Para música de cámara, el objetivo es mantenerse dentro de ±5 cents.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo afinar un instrumento de viento con este afinador?</h3>
            <p>Sí. El afinador cromático detecta cualquier instrumento que produzca un tono sostenido: flauta, clarinete, saxofón, trompeta... Asegúrate de sostener la nota durante al menos 1-2 segundos para que el algoritmo estabilice la lectura.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Funciona bien en móvil?</h3>
            <p>Sí, funciona en navegadores móviles modernos (Chrome, Safari). El micrófono del móvil suele ser suficiente para guitarras y ukeleles. Para bajos eléctricos y contrabajo, un micrófono externo o una interfaz de audio mejoran significativamente la detección.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuándo debo cambiar la referencia de La4 a 442 o 443 Hz?</h3>
            <p>Solo si vas a tocar con una orquesta o conjunto que use esa afinación. Para grabaciones en casa, ensayos con pop/rock o música electrónica, el estándar es 440 Hz. Verificar con el director o el primer violín antes de cada ensayo orquestal.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Selecciona tu instrumento</h3>
              <p>Elige entre Guitarra estándar, Bajo, Ukelele o Violín para ver las notas y frecuencias exactas de cada cuerda como referencia visual.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Ajusta la referencia si es necesario</h3>
              <p>Si tocas con una orquesta europea, cambia La4 a 442 Hz. Para música barroca, usa 415 Hz (usa el Diapasón Digital de meskeIA). Para todo lo demás, deja 440 Hz.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Pulsa &quot;Iniciar afinador&quot;</h3>
              <p>El navegador pedirá permiso para usar el micrófono. Concédelo y espera a que el indicador se active. Busca un entorno silencioso para mejores resultados.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Toca una cuerda de forma sostenida</h3>
              <p>Puntea o haz sonar la cuerda con fuerza normal y mantenla vibrando. El afinador necesita 1-2 segundos de señal estable para mostrar una lectura precisa.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Lee el indicador de cents</h3>
              <p>Si el indicador está a la izquierda del centro, la cuerda está baja (sube tensión). Si está a la derecha, está alta (baja tensión). El objetivo es el centro exacto (verde).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Ajusta la clavija lentamente</h3>
              <p>Gira la clavija en pequeños incrementos mientras la cuerda sigue sonando. Toca y ajusta alternativamente hasta que el indicador se estabilice en verde en el centro.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Repite con cada cuerda</h3>
              <p>Afina de la cuerda más grave a la más aguda. Cuando termines, vuelve a verificar la primera cuerda: al tensar las otras, la primera puede haberse desafinado ligeramente.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>⬆️ Afina siempre subiendo</h3>
            <p>Si una cuerda está demasiado alta, bájala por debajo de la nota y luego sube hasta afinar. Las cuerdas mantienen mejor la afinación cuando la tensión final es ascendente.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔇 Silencio = mejor detección</h3>
            <p>Aleja el micrófono de altavoces, ventiladores y conversaciones. El ruido ambiente es la principal causa de lecturas incorrectas en afinadores de micrófono.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎸 Cuerdas nuevas necesitan más tiempo</h3>
            <p>Las cuerdas nuevas se estiran durante los primeros días. Afina con más frecuencia al inicio y tira suavemente de las cuerdas después de afinar para acelerar el asentamiento.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🌡️ La temperatura afecta la afinación</h3>
            <p>Cambios bruscos de temperatura desafinan los instrumentos. Deja que tu guitarra o violín se adapten a la temperatura del local antes de afinar (10-15 minutos).</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔁 Verifica después de afinar todo</h3>
            <p>Siempre repasa todas las cuerdas al final. La tensión añadida al afinar las cuerdas agudas puede afectar ligeramente a las graves. Una segunda pasada garantiza la precisión.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📱 Usa interfaz de audio si tienes</h3>
            <p>Una interfaz de audio (Focusrite Scarlett, Behringer UM2) conectada por cable ofrece detección mucho más limpia y precisa que el micrófono interno del portátil o móvil.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3>⚠️ Para una detección precisa</h3>
          <ul className={styles.warningList}>
            <li>Concede permiso al micrófono: sin él, el afinador no puede capturar el sonido de tu instrumento.</li>
            <li>Toca en un entorno silencioso: el ruido ambiente es la principal causa de lecturas incorrectas.</li>
            <li>Las notas muy graves (Si0, Mi1 del bajo de 5 cuerdas) pueden ser difíciles de detectar con micrófonos de portátil debido a su baja frecuencia.</li>
            <li>El audio se procesa completamente en tu navegador: no se envía nada a servidores externos.</li>
          </ul>
        </div>

        {/* Instrucciones originales */}
        <div className={styles.instrucciones}>
          <h3>Cómo usar el afinador</h3>
          <ol>
            <li>Pulsa &quot;Iniciar afinador&quot; y permite el acceso al micrófono</li>
            <li>Toca una cuerda de tu instrumento cerca del micrófono</li>
            <li>Ajusta la tensión hasta que el indicador esté en el centro (verde)</li>
            <li>Repite con cada cuerda</li>
          </ol>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('afinador-instrumentos')} />
      <ShareCard appName="afinador-instrumentos" />
      <Footer appName="afinador-instrumentos" />
    </div>
  );
}
