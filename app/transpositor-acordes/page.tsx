'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './TranspositorAcordes.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Escala cromática: 12 notas
const ESCALA_CROMATICA = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
type Nota = (typeof ESCALA_CROMATICA)[number];

// Equivalencias enarmónicas: Db=C#, Eb=D#, Gb=F#, Ab=G#, Bb=A#
const ENARM: Record<string, Nota> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Fb': 'E',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'Cb': 'B',
};

// Grados de la escala mayor (intervalos semitono desde la tónica)
const GRADOS_MAYOR = [0, 2, 4, 5, 7, 9, 11];
const NOMBRES_GRADO = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Progresiones predefinidas populares
const PROGRESIONES: { nombre: string; grados: number[]; descripcion: string }[] = [
  { nombre: 'I – V – vi – IV', grados: [0, 4, 5, 3], descripcion: 'La progresión más popular del pop' },
  { nombre: 'I – IV – V',      grados: [0, 3, 4],    descripcion: 'Blues y rock clásico' },
  { nombre: 'ii – V – I',      grados: [1, 4, 0],    descripcion: 'Estándar de jazz' },
  { nombre: 'I – vi – IV – V', grados: [0, 5, 3, 4], descripcion: 'Doo-wop y pop de los 50-60' },
];

// Sufijos de acorde válidos (de más largo a más corto para parseo)
const SUFIJOS = ['maj7', 'maj9', 'm7b5', 'dim7', 'aug7', 'sus2', 'sus4', 'm7', 'm9', 'm6', 'add9', 'dim', 'aug', 'maj', 'm'];

function parsearNota(token: string): { nota: Nota; sufijo: string } | null {
  // Intentar leer una nota con posible sostenido/bemol
  let notaRaw = '';
  let resto = token;
  if (token.length >= 2 && (token[1] === '#' || token[1] === 'b')) {
    notaRaw = token.slice(0, 2);
    resto = token.slice(2);
  } else if (token.length >= 1) {
    notaRaw = token.slice(0, 1);
    resto = token.slice(1);
  } else {
    return null;
  }

  // Normalizar la raíz
  const notaBase = notaRaw.slice(0, 1).toUpperCase() + notaRaw.slice(1);
  let nota: Nota;
  if (ENARM[notaBase]) {
    nota = ENARM[notaBase];
  } else if ((ESCALA_CROMATICA as readonly string[]).includes(notaBase)) {
    nota = notaBase as Nota;
  } else {
    return null;
  }

  // Buscar sufijo
  let sufijo = '';
  for (const s of SUFIJOS) {
    if (resto.startsWith(s)) {
      sufijo = s;
      break;
    }
  }

  return { nota, sufijo };
}

function transponerNota(nota: Nota, intervalo: number): Nota {
  const idx = ESCALA_CROMATICA.indexOf(nota);
  const nuevoIdx = (idx + intervalo + 12) % 12;
  return ESCALA_CROMATICA[nuevoIdx];
}

function calcularIntervalo(origen: Nota, destino: Nota): number {
  const iOrigen = ESCALA_CROMATICA.indexOf(origen);
  const iDestino = ESCALA_CROMATICA.indexOf(destino);
  return (iDestino - iOrigen + 12) % 12;
}

function transponerTexto(texto: string, intervalo: number): string {
  if (intervalo === 0) return texto;
  // Dividir por espacios y saltos de línea, preservar estructura
  const lineas = texto.split('\n');
  return lineas.map(linea => {
    const tokens = linea.split(/(\s+)/);
    return tokens.map(token => {
      if (/^\s+$/.test(token)) return token;
      const parseado = parsearNota(token);
      if (!parseado) return token;
      const notaTranspuesta = transponerNota(parseado.nota, intervalo);
      return notaTranspuesta + parseado.sufijo;
    }).join('');
  }).join('\n');
}

function obtenerGrado(nota: Nota, tonica: Nota, grado: number): string {
  const intervalo = GRADOS_MAYOR[grado];
  const notaGrado = transponerNota(tonica, intervalo);
  // Sufijo según el grado: I maj, ii min, iii min, IV maj, V maj, vi min, VII dim
  const sufijosGrado = ['', 'm', 'm', '', '', 'm', 'dim'];
  return notaGrado + sufijosGrado[grado];
}

// Evitar warning de unused variable: nota es el primer parámetro del tipo Nota
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildTablaGrados(tonica: Nota) {
  return GRADOS_MAYOR.map((_, i) => obtenerGrado(tonica, tonica, i));
}

export default function TranspositorAcordesPage() {
  const [tonoOrigen, setTonoOrigen] = useState<Nota>('C');
  const [tonoDestino, setTonoDestino] = useState<Nota>('G');
  const [textoAcordes, setTextoAcordes] = useState('Am G F E');
  const [copiado, setCopiado] = useState(false);

  const intervalo = calcularIntervalo(tonoOrigen, tonoDestino);
  const acordesTranspuestos = transponerTexto(textoAcordes, intervalo);

  const copiarResultado = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(acordesTranspuestos);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback silencioso
    }
  }, [acordesTranspuestos]);

  const aplicarProgresion = useCallback((grados: number[]) => {
    const sufijosGrado = ['', 'm', 'm', '', '', 'm', 'dim'];
    const acordes = grados.map(g => {
      const intervaloGrado = GRADOS_MAYOR[g];
      const nota = transponerNota(tonoOrigen, intervaloGrado);
      return nota + sufijosGrado[g];
    });
    setTextoAcordes(acordes.join(' '));
  }, [tonoOrigen]);

  const tablaOrigen = buildTablaGrados(tonoOrigen);
  const tablaDestino = buildTablaGrados(tonoDestino);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎸</span> Transpositor de Acordes</h1>
        <p className={styles.subtitle}>
          Transpón los acordes de cualquier canción a otro tono al instante. Escribe los acordes, elige el tono destino y obtén la versión transpuesta.
        </p>
      </header>

      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.herramienta}>

        {/* Selectores de tono */}
        <div className={styles.tonosGrid}>
          <div className={styles.tonoBloque}>
            <label className={styles.tonoLabel} htmlFor="tono-origen">Tono original</label>
            <select
              id="tono-origen"
              className={styles.tonoSelect}
              value={tonoOrigen}
              onChange={e => setTonoOrigen(e.target.value as Nota)}
            >
              {ESCALA_CROMATICA.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className={styles.flechaIntervalo} aria-hidden="true">
            <span className={styles.flechaIcono}>→</span>
            <span className={styles.intervaloTexto}>
              {intervalo === 0
                ? 'Mismo tono'
                : `+${intervalo} semitono${intervalo !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className={styles.tonoBloque}>
            <label className={styles.tonoLabel} htmlFor="tono-destino">Tono destino</label>
            <select
              id="tono-destino"
              className={styles.tonoSelect}
              value={tonoDestino}
              onChange={e => setTonoDestino(e.target.value as Nota)}
            >
              {ESCALA_CROMATICA.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Progresiones predefinidas */}
        <div className={styles.progresionesBloque}>
          <div className={styles.progresionesLabel}>Progresiones populares en {tonoOrigen}:</div>
          <div className={styles.progresionBtns}>
            {PROGRESIONES.map(p => (
              <button
                key={p.nombre}
                type="button"
                className={styles.progresionBtn}
                onClick={() => aplicarProgresion(p.grados)}
                title={p.descripcion}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Input de acordes */}
        <div className={styles.acordesBloque}>
          <label className={styles.acordesLabel} htmlFor="acordes-input">
            Acordes de la canción
          </label>
          <textarea
            id="acordes-input"
            className={styles.acordesInput}
            value={textoAcordes}
            onChange={e => setTextoAcordes(e.target.value)}
            placeholder="Ej: Am G F E&#10;o varias líneas:&#10;Am G&#10;F E7"
            rows={4}
            spellCheck={false}
          />
          <div className={styles.acordesHint}>
            Separa los acordes por espacios o saltos de línea. Soporta sufijos: m, 7, m7, maj7, sus2, sus4, dim, aug, etc.
          </div>
        </div>

        {/* Resultado */}
        <div className={styles.resultadoBloque}>
          <div className={styles.resultadoHeader}>
            <span className={styles.resultadoTitulo}>
              {intervalo === 0
                ? `Acordes en ${tonoOrigen} (sin cambio)`
                : `Acordes transpuestos a ${tonoDestino}`}
            </span>
            <button
              type="button"
              className={`${styles.copiarBtn} ${copiado ? styles.copiarBtnCopiado : ''}`}
              onClick={copiarResultado}
              aria-label="Copiar acordes transpuestos"
              disabled={!acordesTranspuestos.trim()}
            >
              <span aria-hidden="true">{copiado ? '✓' : '📋'}</span> {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className={styles.resultadoTexto} aria-live="polite">
            {acordesTranspuestos || <span className={styles.resultadoVacio}>Los acordes transpuestos aparecerán aquí</span>}
          </div>
        </div>

        {/* Tabla de referencia de grados */}
        <div className={styles.tablaBloque}>
          <h2 className={styles.tablaTitulo}>Tabla de referencia: grados de la escala</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaGrados}>
              <thead>
                <tr>
                  <th>Grado</th>
                  {NOMBRES_GRADO.map(g => <th key={g}>{g}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tablaFilaLabel}>En {tonoOrigen}</td>
                  {tablaOrigen.map((acorde, i) => (
                    <td key={i} className={styles.tablaCeldaOrigen}>{acorde}</td>
                  ))}
                </tr>
                <tr>
                  <td className={styles.tablaFilaLabel}>En {tonoDestino}</td>
                  {tablaDestino.map((acorde, i) => (
                    <td key={i} className={styles.tablaCeldaDestino}>{acorde}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.tablaNota}>
            I, IV, V = acordes mayores · II, III, VI = acordes menores · VII = disminuido
          </p>
        </div>
      </div>

      {/* Sección educativa v2.0 */}
      <EducationalSection title="📚 Guía de transposición musical" subtitle="Todo lo que necesitas saber para cambiar de tono con confianza">

        {/* 1. Tabla comparativa: notaciones */}
        <div className={styles.guideSection}>
          <h2>Notaciones de acordes: latino, anglosajón y cifrado americano</h2>
          <p>
            Existen diferentes sistemas para nombrar notas y acordes según la tradición musical. Conocerlos evita confusión al leer partituras o tablaturas de distintas fuentes.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nota anglosajona</th>
                  <th>Nota latina (solfeo)</th>
                  <th>Escala cromática (posición)</th>
                  <th>Acorde mayor</th>
                  <th>Acorde menor</th>
                </tr>
              </thead>
              <tbody>
                {ESCALA_CROMATICA.map((nota, i) => (
                  <tr key={nota}>
                    <td><strong>{nota}</strong></td>
                    <td>{['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'][i]}</td>
                    <td>{i + 1}</td>
                    <td>{nota}</td>
                    <td>{nota}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🎸</div>
            <h3>Guitarrista con cejilla</h3>
            <p>Prefieres tocar con cejilla en el traste 2 (sube 2 semitonos). Transpón la partitura original 2 semitonos hacia abajo para que suene en el tono correcto con la cejilla puesta.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🎤</div>
            <h3>Cantante ajusta su rango</h3>
            <p>Una canción está en La pero es demasiado aguda. Transpónla a Fa o Sol para adaptarla a tu tesitura sin cambiar la relación entre los acordes.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🎹</div>
            <h3>Músico transporta partitura</h3>
            <p>Una partitura para violín en Re mayor necesita ser transportada a Do mayor para un instrumento transpositor como la flauta. El transpositor calcula los acordes al instante.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon}>🥁</div>
            <h3>Banda ensaya en otro tono</h3>
            <p>El bajista prefiere que la canción esté en Mi por la resonancia de las cuerdas abiertas. Transpón la partitura completa y comparte los acordes actualizados con el resto de la banda.</p>
          </div>
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué significa transponer un acorde?</strong>
            <p className={styles.faqTip}>Transponer significa subir o bajar todos los acordes de una canción la misma distancia (en semitonos) para cambiar la tonalidad sin alterar la relación armónica entre ellos. La canción suena igual pero en un tono diferente.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre tono y semitono?</strong>
            <p className={styles.faqTip}>Un semitono es la distancia mínima entre dos notas en la escala cromática occidental (p. ej. Do → Do#). Un tono equivale a 2 semitonos (p. ej. Do → Re). La escala mayor tiene 12 semitonos = 1 octava completa.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuándo usar cejilla en lugar de transponer?</strong>
            <p className={styles.faqTip}>Usa la cejilla cuando quieras tocar con las mismas formas de acordes en otra posición del mástil — la cejilla sube el tono. Usa el transpositor cuando necesites conocer los nombres reales de los acordes en la nueva tonalidad (para escribirlos, compartirlos o tocarlos en piano).</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué son las enarmónicas? (C# / Db)</strong>
            <p className={styles.faqTip}>Dos notas enarmónicas suenan igual pero se llaman de forma diferente según el contexto musical. C# (Do sostenido) y Db (Re bemol) son la misma tecla del piano. Este transpositor usa siempre la notación con sostenido (#) por convención.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuándo NO conviene transponer?</strong>
            <p className={styles.faqTip}>Cuando los acordes tienen afinaciones especiales (open tuning, drop D) o cuando la canción tiene riffs o solos que dependen de posiciones específicas del instrumento. En esos casos, cambiar de tono puede hacer imposibles ciertos pasajes.</p>
          </div>
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.stepGuide}>
          <h3>Cómo transponer acordes paso a paso</h3>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>Identifica el tono original de la canción. Si no lo sabes, prueba los 12 tonos en el selector hasta que los acordes encajen con la música.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>Selecciona el tono de destino donde necesitas que suene la canción. Sube hacia tonos agudos o baja hacia tonos graves según tu rango vocal.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>Escribe los acordes en la caja de texto, separados por espacios o línea por línea. Usa la notación anglosajona: Am, G, F, E7, Bm, Cmaj7, etc.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>Lee el resultado en el área de acordes transpuestos. El intervalo entre el tono original y destino se muestra junto a la flecha.</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>Usa el botón "Copiar" para transferir los acordes transpuestos a tu aplicación de notas, hoja de acordes o chat.</div>
          </div>
        </div>

        {/* 5. Tips */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔤</div>
            <h4>Conserva los sufijos</h4>
            <p>El transpositor mantiene automáticamente el sufijo del acorde (m, 7, maj7, etc.). Am transpuesto 2 semitonos se convierte en Bm, no en B.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>↔️</div>
            <h4>Dirección de transposición</h4>
            <p>Para bajar el tono: selecciona un destino que esté a la izquierda en la escala (menos posición). Para subir: elige uno a la derecha. 6 semitonos sube o baja según lo que prefieras.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎯</div>
            <h4>Usa la tabla de grados</h4>
            <p>La tabla de grados (I–VII) te muestra qué acordes son la tónica, subdominante y dominante en ambas tonalidades. Útil para improvisación y composición.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎵</div>
            <h4>Prueba progresiones populares</h4>
            <p>Usa los botones de progresiones para cargar automáticamente I-V-vi-IV o ii-V-I en el tono que hayas seleccionado. Perfecto para practicar o componer.</p>
          </div>
        </div>

        {/* 6. Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al transponer acordes
          </div>
          <ul className={styles.warningList}>
            <li>Usar notación latina (Do, Re, Mi) mezclada con anglosajona (C, D, E): el transpositor solo acepta notación anglosajona.</li>
            <li>Olvidar que transponer en guitarra acústica puede dejar acordes sin formas estándar en cejilla 0 — comprueba si el nuevo tono tiene posiciones cómodas.</li>
            <li>Confundir el tono original: si la canción tiene acordes en Am pero la tónica es Do mayor (relativa), el resultado puede no ser el esperado al transponer desde Am.</li>
            <li>No considerar los instrumentos de acompañamiento: transponer una guitarra sin avisar al resto de la banda produce desafinaciones en el ensayo.</li>
            <li>Usar bemoles (b) en lugar de sostenidos (#): escribe Db como C#, Eb como D#, etc., para que el transpositor los reconozca correctamente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('transpositor-acordes')} />
      <ShareCard appName="transpositor-acordes" />
      <Footer appName="transpositor-acordes" />
    </div>
  );
}
