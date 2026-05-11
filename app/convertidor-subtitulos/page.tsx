'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import styles from './ConvertidorSubtitulos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Formato = 'srt' | 'vtt' | 'sub' | 'ssa';

interface Cue {
  index: number;
  start: number; // ms desde el inicio
  end: number;
  text: string; // con \n entre líneas
}

interface ParseResult {
  cues: Cue[];
  errores: string[];
  advertencias: string[];
}

const NOMBRES_FORMATO: Record<Formato, string> = {
  srt: 'SRT (SubRip)',
  vtt: 'WebVTT',
  sub: 'SUB (SubViewer)',
  ssa: 'SSA / ASS',
};

const EXTENSIONES: Record<Formato, string> = {
  srt: 'srt',
  vtt: 'vtt',
  sub: 'sub',
  ssa: 'ass',
};

// ---------------- Helpers de tiempo ----------------

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

function msToSrt(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const milis = total % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milis, 3)}`;
}

function msToVtt(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const milis = total % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(milis, 3)}`;
}

function msToSubViewer(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs, 2)}`;
}

function msToSsa(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  return `${h}:${pad(m)}:${pad(s)}.${pad(cs, 2)}`;
}

function parseTimeHmsMs(h: string, m: string, s: string, frac: string): number {
  let fracMs = 0;
  if (frac.length === 3) fracMs = parseInt(frac, 10);
  else if (frac.length === 2) fracMs = parseInt(frac, 10) * 10;
  else if (frac.length === 1) fracMs = parseInt(frac, 10) * 100;
  return parseInt(h, 10) * 3600000 + parseInt(m, 10) * 60000 + parseInt(s, 10) * 1000 + fracMs;
}

// ---------------- Parsers ----------------

function quitarBOM(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function detectarFormato(text: string): Formato | null {
  const t = quitarBOM(text).trim();
  if (!t) return null;
  if (/^WEBVTT/i.test(t)) return 'vtt';
  if (/^\[Script Info\]/im.test(t) || /^\[V4\+? Styles\]/im.test(t) || /^\[Events\]/im.test(t)) return 'ssa';
  if (/^\[INFORMATION\]/im.test(t) || /^\[SUBTITLE\]/im.test(t)) return 'sub';
  if (/\d{2}:\d{2}:\d{2},\d{3}\s*-->/.test(t)) return 'srt';
  if (/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->/.test(t)) return 'vtt';
  if (/\d{2}:\d{2}:\d{2}\.\d{2},\d{2}:\d{2}:\d{2}\.\d{2}/.test(t)) return 'sub';
  if (/^Dialogue:/im.test(t)) return 'ssa';
  return null;
}

function parseSRT(text: string): ParseResult {
  const cues: Cue[] = [];
  const errores: string[] = [];
  const advertencias: string[] = [];
  const normalizado = quitarBOM(text).replace(/\r\n?/g, '\n').trim();
  const bloques = normalizado.split(/\n\s*\n/);
  const reTime = /(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})/;

  bloques.forEach((bloque, i) => {
    const lineas = bloque.split('\n').map((l) => l.trim()).filter((l) => l !== '');
    if (lineas.length < 2) return;
    let timeLineIdx = 0;
    if (/^\d+$/.test(lineas[0])) timeLineIdx = 1;
    const m = lineas[timeLineIdx]?.match(reTime);
    if (!m) {
      errores.push(`Bloque ${i + 1}: no se encontró timestamp válido`);
      return;
    }
    const start = parseTimeHmsMs(m[1], m[2], m[3], m[4]);
    const end = parseTimeHmsMs(m[5], m[6], m[7], m[8]);
    const text = lineas.slice(timeLineIdx + 1).join('\n');
    if (!text) {
      advertencias.push(`Bloque ${i + 1}: cue sin texto`);
    }
    cues.push({ index: cues.length + 1, start, end, text });
  });

  return { cues, errores, advertencias };
}

function parseVTT(text: string): ParseResult {
  const cues: Cue[] = [];
  const errores: string[] = [];
  const advertencias: string[] = [];
  const normalizado = quitarBOM(text).replace(/\r\n?/g, '\n');

  // Quitar cabecera WEBVTT (primera línea + opcional metadata hasta línea vacía)
  let cuerpo = normalizado;
  const cabeceraMatch = cuerpo.match(/^WEBVTT[^\n]*\n(?:[^\n]*\n)*?\n/i);
  if (cabeceraMatch) {
    cuerpo = cuerpo.slice(cabeceraMatch[0].length);
  } else if (/^WEBVTT/i.test(cuerpo)) {
    // Cabecera sin cuerpo posterior
    const tras = cuerpo.indexOf('\n');
    cuerpo = tras >= 0 ? cuerpo.slice(tras + 1) : '';
  }

  const bloques = cuerpo.trim().split(/\n\s*\n/);
  const reTime = /(\d{1,3}):(\d{2}):(\d{2})\.(\d{1,3})\s*-->\s*(\d{1,3}):(\d{2}):(\d{2})\.(\d{1,3})/;
  const reTimeShort = /(\d{2}):(\d{2})\.(\d{1,3})\s*-->\s*(\d{2}):(\d{2})\.(\d{1,3})/;

  bloques.forEach((bloque) => {
    const trimmed = bloque.trim();
    if (!trimmed) return;
    if (/^(NOTE|STYLE|REGION)\b/.test(trimmed)) return; // Saltar bloques de metadata
    const lineas = trimmed.split('\n');
    let timeLineIdx = 0;
    let m = lineas[timeLineIdx].match(reTime);
    let mShort: RegExpMatchArray | null = null;
    if (!m) {
      mShort = lineas[timeLineIdx].match(reTimeShort);
    }
    if (!m && !mShort && lineas.length > 1) {
      // El identificador puede estar en la primera línea
      timeLineIdx = 1;
      m = lineas[timeLineIdx]?.match(reTime) ?? null;
      if (!m) mShort = lineas[timeLineIdx]?.match(reTimeShort) ?? null;
    }
    if (!m && !mShort) return;
    let start = 0;
    let end = 0;
    if (m) {
      start = parseTimeHmsMs(m[1], m[2], m[3], m[4]);
      end = parseTimeHmsMs(m[5], m[6], m[7], m[8]);
    } else if (mShort) {
      start = parseTimeHmsMs('0', mShort[1], mShort[2], mShort[3]);
      end = parseTimeHmsMs('0', mShort[4], mShort[5], mShort[6]);
    }
    const textoLineas = lineas.slice(timeLineIdx + 1);
    const text = textoLineas.join('\n').replace(/<[^>]+>/g, '').trim();
    if (!text) advertencias.push(`Cue VTT vacío en ${msToVtt(start)}`);
    cues.push({ index: cues.length + 1, start, end, text });
  });

  return { cues, errores, advertencias };
}

function parseSUB(text: string): ParseResult {
  const cues: Cue[] = [];
  const errores: string[] = [];
  const advertencias: string[] = [];
  const normalizado = quitarBOM(text).replace(/\r\n?/g, '\n');

  // Quitar bloques de metadata [INFORMATION]...[END INFORMATION]
  let cuerpo = normalizado.replace(/\[INFORMATION\][\s\S]*?\[END INFORMATION\]/i, '');
  cuerpo = cuerpo.replace(/^\[SUBTITLE\]/im, '');
  // Línea inicial con [COLF],[STYLE],[SIZE],[FONT] si existe
  cuerpo = cuerpo.replace(/^\[COLF\][^\n]*\n/m, '');

  const bloques = cuerpo.trim().split(/\n\s*\n/);
  const reTime = /(\d{2}):(\d{2}):(\d{2})\.(\d{2}),(\d{2}):(\d{2}):(\d{2})\.(\d{2})/;

  bloques.forEach((bloque) => {
    const lineas = bloque.split('\n').map((l) => l.trim()).filter((l) => l !== '');
    if (lineas.length < 2) return;
    const m = lineas[0].match(reTime);
    if (!m) return;
    const start = parseTimeHmsMs(m[1], m[2], m[3], m[4]);
    const end = parseTimeHmsMs(m[5], m[6], m[7], m[8]);
    const texto = lineas.slice(1).join('\n').replace(/\[br\]/gi, '\n');
    cues.push({ index: cues.length + 1, start, end, text: texto });
  });

  if (cues.length === 0) errores.push('No se ha podido detectar ningún cue en formato SUB (SubViewer)');
  return { cues, errores, advertencias };
}

function parseSSA(text: string): ParseResult {
  const cues: Cue[] = [];
  const errores: string[] = [];
  const advertencias: string[] = [];
  const normalizado = quitarBOM(text).replace(/\r\n?/g, '\n');

  const eventosIdx = normalizado.search(/\[Events\]/i);
  if (eventosIdx < 0) {
    errores.push('No se ha encontrado la sección [Events] en el archivo SSA/ASS');
    return { cues, errores, advertencias };
  }
  const eventos = normalizado.slice(eventosIdx);
  const lineas = eventos.split('\n');

  let formato: string[] | null = null;
  for (const linea of lineas) {
    const t = linea.trim();
    if (!t) continue;
    if (/^Format:/i.test(t)) {
      formato = t.slice(7).split(',').map((s) => s.trim().toLowerCase());
      continue;
    }
    if (/^Dialogue:/i.test(t)) {
      if (!formato) {
        formato = ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text'];
      }
      const valoresRaw = t.slice(9).trim();
      const idxText = formato.indexOf('text');
      const partes: string[] = [];
      let actual = '';
      let depth = 0;
      let count = 0;
      for (let i = 0; i < valoresRaw.length; i++) {
        const ch = valoresRaw[i];
        if (ch === ',' && depth === 0 && count < formato.length - 1) {
          partes.push(actual);
          actual = '';
          count++;
        } else {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
          actual += ch;
        }
      }
      partes.push(actual);
      const obtener = (clave: string): string => {
        const idx = formato!.indexOf(clave);
        return idx >= 0 ? (partes[idx] ?? '').trim() : '';
      };
      const startStr = obtener('start');
      const endStr = obtener('end');
      const textoStr = idxText >= 0 ? (partes[idxText] ?? '') : '';
      const reTime = /(\d):(\d{2}):(\d{2})\.(\d{2})/;
      const ms = startStr.match(reTime);
      const me = endStr.match(reTime);
      if (!ms || !me) {
        errores.push(`Dialogue con timestamps no parseables: ${startStr} / ${endStr}`);
        continue;
      }
      const start = parseTimeHmsMs(ms[1], ms[2], ms[3], ms[4]);
      const end = parseTimeHmsMs(me[1], me[2], me[3], me[4]);
      const texto = textoStr
        .replace(/\{[^}]*\}/g, '')
        .replace(/\\N|\\n/g, '\n')
        .replace(/\\h/g, ' ');
      cues.push({ index: cues.length + 1, start, end, text: texto });
    }
  }

  if (cues.length === 0) errores.push('La sección [Events] no contiene líneas Dialogue válidas');
  return { cues, errores, advertencias };
}

function parsearSegunFormato(text: string, formato: Formato): ParseResult {
  switch (formato) {
    case 'srt': return parseSRT(text);
    case 'vtt': return parseVTT(text);
    case 'sub': return parseSUB(text);
    case 'ssa': return parseSSA(text);
  }
}

// ---------------- Serializers ----------------

function serializeSRT(cues: Cue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${msToSrt(c.start)} --> ${msToSrt(c.end)}\n${c.text}`)
    .join('\n\n') + '\n';
}

function serializeVTT(cues: Cue[]): string {
  const cabecera = 'WEBVTT\n\n';
  const cuerpo = cues
    .map((c) => `${msToVtt(c.start)} --> ${msToVtt(c.end)}\n${c.text}`)
    .join('\n\n');
  return cabecera + cuerpo + '\n';
}

function serializeSUB(cues: Cue[]): string {
  const cabecera = '[INFORMATION]\n[TITLE]Subtítulos generados con meskeIA\n[AUTHOR]meskeIA\n[FILEPATH]\n[DELAY]0\n[CD TRACK]0\n[COMMENT]\n[END INFORMATION]\n[SUBTITLE]\n[COLF]&HFFFFFF,[STYLE]bd,[SIZE]18,[FONT]Arial\n';
  const cuerpo = cues
    .map((c) => `${msToSubViewer(c.start)},${msToSubViewer(c.end)}\n${c.text.replace(/\n/g, '[br]')}`)
    .join('\n\n');
  return cabecera + cuerpo + '\n';
}

function serializeSSA(cues: Cue[]): string {
  const cabecera = `[Script Info]
Title: Subtítulos generados con meskeIA
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const cuerpo = cues
    .map((c) => {
      const texto = c.text.replace(/\n/g, '\\N');
      return `Dialogue: 0,${msToSsa(c.start)},${msToSsa(c.end)},Default,,0,0,0,,${texto}`;
    })
    .join('\n');
  return cabecera + cuerpo + '\n';
}

function serializarSegunFormato(cues: Cue[], formato: Formato): string {
  switch (formato) {
    case 'srt': return serializeSRT(cues);
    case 'vtt': return serializeVTT(cues);
    case 'sub': return serializeSUB(cues);
    case 'ssa': return serializeSSA(cues);
  }
}

// ---------------- Validación ----------------

function validarCues(cues: Cue[]): string[] {
  const problemas: string[] = [];
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    if (c.end <= c.start) {
      problemas.push(`Cue ${i + 1}: el tiempo final no es posterior al inicial (${msToSrt(c.start)} → ${msToSrt(c.end)})`);
    }
    if (i > 0 && c.start < cues[i - 1].end) {
      problemas.push(`Cue ${i + 1}: solapamiento con el cue anterior (${msToSrt(c.start)} < ${msToSrt(cues[i - 1].end)})`);
    }
  }
  return problemas.slice(0, 8); // Limitar para no inundar la UI
}

function formatearDuracion(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}min ${s}s`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

// ---------------- Componente ----------------

const EJEMPLO_SRT = `1
00:00:01,000 --> 00:00:04,000
Hola, bienvenido a meskeIA.

2
00:00:05,500 --> 00:00:08,000
Convierte subtítulos sin salir
del navegador.

3
00:00:09,000 --> 00:00:12,500
Tus archivos nunca se suben
a ningún servidor.
`;

export default function ConvertidorSubtitulosPage() {
  const [inputText, setInputText] = useState<string>(EJEMPLO_SRT);
  const [nombreArchivo, setNombreArchivo] = useState<string>('ejemplo.srt');
  const [formatoOrigen, setFormatoOrigen] = useState<Formato | 'auto'>('auto');
  const [formatoDestino, setFormatoDestino] = useState<Formato>('vtt');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [copiado, setCopiado] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatoDetectado: Formato | null = useMemo(() => detectarFormato(inputText), [inputText]);
  const formatoUsado: Formato | null = formatoOrigen === 'auto' ? formatoDetectado : formatoOrigen;

  const resultado: ParseResult = useMemo(() => {
    if (!inputText.trim() || !formatoUsado) {
      return { cues: [], errores: [], advertencias: [] };
    }
    return parsearSegunFormato(inputText, formatoUsado);
  }, [inputText, formatoUsado]);

  const problemasValidacion: string[] = useMemo(() => validarCues(resultado.cues), [resultado.cues]);

  const salida: string = useMemo(() => {
    if (resultado.cues.length === 0) return '';
    return serializarSegunFormato(resultado.cues, formatoDestino);
  }, [resultado.cues, formatoDestino]);

  const duracionTotal: number = useMemo(() => {
    if (resultado.cues.length === 0) return 0;
    return Math.max(...resultado.cues.map((c) => c.end));
  }, [resultado.cues]);

  const procesarArchivo = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera 5 MB. Usa uno más pequeño.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setNombreArchivo(file.name);
      setInputText(text);
    };
    reader.readAsText(file);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivo(file);
  };

  const descargar = () => {
    if (!salida) return;
    const baseName = nombreArchivo.replace(/\.[^.]+$/, '') || 'subtitulos';
    const blob = new Blob([salida], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.${EXTENSIONES[formatoDestino]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copiar = async () => {
    if (!salida) return;
    try {
      await navigator.clipboard.writeText(salida);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('No se pudo copiar al portapapeles. Selecciona el texto manualmente.');
    }
  };

  const limpiar = () => {
    setInputText('');
    setNombreArchivo('subtitulos.srt');
  };

  const restaurarEjemplo = () => {
    setInputText(EJEMPLO_SRT);
    setNombreArchivo('ejemplo.srt');
    setFormatoOrigen('auto');
    setFormatoDestino('vtt');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎬 Convertidor de Subtítulos</h1>
        <p className={styles.subtitle}>
          Convierte entre SRT, WebVTT, SUB (SubViewer) y SSA/ASS sin subir el archivo a ningún servidor.
          Detección automática del formato, validación y descarga directa.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.columns}>
        {/* ENTRADA */}
        <section className={styles.column} aria-labelledby="titulo-entrada">
          <div className={styles.columnHeader}>
            <h2 id="titulo-entrada" className={styles.columnTitle}>📥 Entrada</h2>
            <div className={styles.fieldGroup}>
              <label htmlFor="formato-origen" className={styles.label}>Formato:</label>
              <select
                id="formato-origen"
                className={styles.select}
                value={formatoOrigen}
                onChange={(e) => setFormatoOrigen(e.target.value as Formato | 'auto')}
              >
                <option value="auto">Auto-detectar</option>
                <option value="srt">SRT</option>
                <option value="vtt">WebVTT</option>
                <option value="sub">SUB (SubViewer)</option>
                <option value="ssa">SSA / ASS</option>
              </select>
            </div>
          </div>

          <div
            className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Subir archivo de subtítulos"
          >
            <div className={styles.dropZoneIcon} aria-hidden="true">📄</div>
            <p className={styles.dropZoneText}>
              Arrastra un archivo o haz clic para seleccionarlo<br />
              <small>.srt · .vtt · .sub · .ssa · .ass · hasta 5 MB</small>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.sub,.ssa,.ass,text/plain"
              className={styles.hiddenInput}
              onChange={handleInputChange}
            />
          </div>

          <textarea
            className={styles.textarea}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="O pega aquí el contenido del archivo de subtítulos..."
            spellCheck={false}
            aria-label="Contenido del archivo de subtítulos"
          />

          {inputText.trim() && (
            formatoDetectado ? (
              <div className={styles.infoBox}>
                ✓ Formato detectado: <strong>{NOMBRES_FORMATO[formatoDetectado]}</strong>
                {formatoOrigen !== 'auto' && formatoOrigen !== formatoDetectado && (
                  <> · forzando <strong>{NOMBRES_FORMATO[formatoOrigen]}</strong></>
                )}
              </div>
            ) : (
              <div className={styles.warningBoxInline}>
                ⚠ No se ha podido detectar el formato automáticamente. Selecciona uno manualmente arriba.
              </div>
            )
          )}

          <div className={styles.buttonRow}>
            <button type="button" className={styles.btnSecondary} onClick={restaurarEjemplo}>
              🔄 Ejemplo
            </button>
            <button type="button" className={styles.btnSecondary} onClick={limpiar} disabled={!inputText}>
              🗑️ Limpiar
            </button>
          </div>
        </section>

        {/* SALIDA */}
        <section className={styles.column} aria-labelledby="titulo-salida">
          <div className={styles.columnHeader}>
            <h2 id="titulo-salida" className={styles.columnTitle}>📤 Salida</h2>
            <div className={styles.fieldGroup}>
              <label htmlFor="formato-destino" className={styles.label}>Convertir a:</label>
              <select
                id="formato-destino"
                className={styles.select}
                value={formatoDestino}
                onChange={(e) => setFormatoDestino(e.target.value as Formato)}
              >
                <option value="srt">SRT</option>
                <option value="vtt">WebVTT</option>
                <option value="sub">SUB (SubViewer)</option>
                <option value="ssa">SSA / ASS</option>
              </select>
            </div>
          </div>

          {resultado.cues.length > 0 && (
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{resultado.cues.length}</span>
                <span className={styles.statLabel}>Cues</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{formatearDuracion(duracionTotal)}</span>
                <span className={styles.statLabel}>Duración total</span>
              </div>
              {formatoUsado && (
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{NOMBRES_FORMATO[formatoUsado].split(' ')[0]}→{NOMBRES_FORMATO[formatoDestino].split(' ')[0]}</span>
                  <span className={styles.statLabel}>Conversión</span>
                </div>
              )}
            </div>
          )}

          <textarea
            className={`${styles.textarea} ${styles.textareaReadonly}`}
            value={salida}
            readOnly
            placeholder="El resultado de la conversión aparecerá aquí..."
            spellCheck={false}
            aria-label="Resultado de la conversión"
          />

          {resultado.errores.length > 0 && (
            <div className={styles.errorBox}>
              <strong>Errores durante el parseo:</strong>
              <ul>
                {resultado.errores.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {problemasValidacion.length > 0 && (
            <div className={styles.warningBoxInline}>
              <strong>Avisos de validación ({problemasValidacion.length}):</strong>
              <ul>
                {problemasValidacion.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          <div className={styles.buttonRow}>
            <button type="button" className={styles.btnPrimary} onClick={descargar} disabled={!salida}>
              ⬇ Descargar .{EXTENSIONES[formatoDestino]}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={copiar} disabled={!salida}>
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </section>
      </div>

      <EducationalSection
        title="Todo sobre los formatos de subtítulos"
        subtitle="Qué diferencia a SRT, VTT, SUB y SSA, cuál usar y por qué importan para la accesibilidad"
      >
        <section className={styles.guideSection}>
          <p>
            Los subtítulos son una de las herramientas de accesibilidad audiovisual más extendidas. Sirven a personas
            con discapacidad auditiva, a quienes consumen contenido en otro idioma, a quienes ven vídeo sin sonido
            (transporte público, oficinas abiertas) y a niños aprendiendo a leer. Existen varios formatos, cada uno
            pensado para un contexto distinto: reproductores de escritorio, navegadores web o renderizado profesional.
          </p>

          <h3>Comparativa de formatos</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Extensión</th>
                  <th>Soporte</th>
                  <th>Estilos</th>
                  <th>Cuándo usarlo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SRT (SubRip)</strong></td>
                  <td>.srt</td>
                  <td>Universal</td>
                  <td>Mínimos</td>
                  <td>Por defecto en cualquier reproductor (VLC, Plex, Kodi, YouTube)</td>
                </tr>
                <tr>
                  <td><strong>WebVTT</strong></td>
                  <td>.vtt</td>
                  <td>Navegadores web (HTML5 video)</td>
                  <td>CSS y posicionamiento</td>
                  <td>Sitios web con &lt;video&gt;, HLS/DASH streaming</td>
                </tr>
                <tr>
                  <td><strong>SUB (SubViewer)</strong></td>
                  <td>.sub</td>
                  <td>Reproductores clásicos (VLC, MPC)</td>
                  <td>Pocos</td>
                  <td>Compatibilidad con archivos antiguos</td>
                </tr>
                <tr>
                  <td><strong>SSA / ASS</strong></td>
                  <td>.ssa / .ass</td>
                  <td>VLC, MPC, mpv, Aegisub</td>
                  <td>Tipografía, color, animación</td>
                  <td>Karaoke, anime fansub, presentaciones tipográficas avanzadas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>¿A quién le sirve este convertidor?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎥</span>
              <h4>Creador de YouTube / podcast</h4>
              <p>Pasa los subtítulos descargados como SRT al formato VTT que necesita tu reproductor web embebido, o al revés.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
              <h4>Desarrollador web</h4>
              <p>HTML5 &lt;track&gt; solo acepta WebVTT. Convierte rápidamente los SRT que te entregan los clientes sin instalar nada.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📺</span>
              <h4>Aficionado a series y películas</h4>
              <p>Tu reproductor no entiende el .ass que viene en el torrent: pásalo a SRT y verás los subtítulos al instante.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🏫</span>
              <h4>Docente o formador</h4>
              <p>Necesitas subir un Moodle con vídeo accesible: WebVTT es lo que pide la mayoría de plataformas LMS.</p>
            </div>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqItem}>
            <h4>¿El archivo se sube a internet?</h4>
            <p>No. La conversión se hace íntegramente en tu navegador con JavaScript. El archivo nunca abandona tu equipo. Puedes verificarlo abriendo la pestaña Network de las DevTools mientras conviertes.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué no soportáis MicroDVD (.sub con &#123;1&#125;&#123;100&#125;)?</h4>
            <p>MicroDVD usa frames como unidad de tiempo y necesita conocer el FPS del vídeo original. Sin ese dato, la conversión es ambigua. El formato .sub que sí soportamos es SubViewer 2.0, que usa tiempos absolutos (HH:MM:SS.cc).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Al convertir de SSA a SRT pierdo el formato. ¿Es normal?</h4>
            <p>Sí. SSA/ASS soporta estilos avanzados (color, tipografía, animaciones, karaoke) que SRT no contempla. La conversión a SRT mantiene los tiempos y el texto, pero descarta las override tags &#123;...&#125; del SSA.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué hay solapamientos en los avisos de validación?</h4>
            <p>Indican que un cue empieza antes de que termine el anterior. A veces es intencional (dos hablantes simultáneos en SSA), pero en SRT/VTT puede causar que solo se vea uno. Repásalos en herramientas como Aegisub o Subtitle Edit si te importan.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo gestiona el encoding (UTF-8, Latin-1)?</h4>
            <p>El navegador lee el archivo como texto interpretándolo como UTF-8. Si tu .srt antiguo viene en Windows-1252 o ISO-8859-1 verás caracteres raros (acentos rotos). Solución: abre el .srt en un editor moderno (VS Code, Notepad++) y guárdalo como UTF-8.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Conserva los milisegundos exactos?</h4>
            <p>Sí en SRT y VTT (precisión 1 ms). SUB y SSA usan centisegundos (precisión 10 ms), así que al convertir hacia esos formatos se redondea al centisegundo más cercano. Volver a SRT no recupera los milisegundos exactos originales.</p>
          </div>

          <h3>Cómo usar el convertidor paso a paso</h3>
          <ol className={styles.pasosList}>
            <li>Arrastra tu archivo de subtítulos a la zona &ldquo;Entrada&rdquo;, haz clic para seleccionarlo, o pega directamente el texto en el cuadro inferior.</li>
            <li>El formato se detecta automáticamente. Si la detección falla (archivo muy antiguo o malformado), elige el formato manualmente en el desplegable de la izquierda.</li>
            <li>Comprueba el contador de cues y la duración total en el panel de salida: te confirma que el parseo ha sido correcto.</li>
            <li>Selecciona el formato de destino en el desplegable de la derecha. La conversión se aplica al instante.</li>
            <li>Si hay avisos de validación (solapamientos, tiempos invertidos), revísalos. No bloquean la conversión, pero te avisan de problemas que tal vez quieras corregir antes de publicar.</li>
            <li>Pulsa &ldquo;Descargar&rdquo; para guardar el archivo convertido, o &ldquo;Copiar&rdquo; para pasarlo al portapapeles.</li>
          </ol>

          <h3>Buenas prácticas con subtítulos accesibles</h3>
          <ul className={styles.tipsList}>
            <li><strong>Velocidad de lectura</strong>: máximo 17-20 caracteres por segundo en español. Por encima, el espectador no llega a leer.</li>
            <li><strong>Líneas cortas</strong>: máximo 42 caracteres por línea, 2 líneas por cue. Es el estándar de Netflix y la EBU.</li>
            <li><strong>Duración mínima de un cue</strong>: 1 segundo. Por debajo, parece un parpadeo.</li>
            <li><strong>Duración máxima</strong>: 6-7 segundos por cue. Por encima, los ojos se cansan.</li>
            <li><strong>Identifica al hablante</strong> con guiones (- Hola.) o etiquetas cuando hay varias voces o no se ve la persona.</li>
            <li><strong>Subtítulos SDH</strong> (para sordos): incluye descripciones de sonido entre corchetes [música suave], [risas], [aplausos].</li>
          </ul>

          <div className={styles.warningBox}>
            <h4>Errores frecuentes que evitar</h4>
            <ul>
              <li>Subtítulos con tiempos invertidos (final antes que inicio): el reproductor los ignora o muestra erráticamente.</li>
              <li>Mezclar comas y puntos en los milisegundos (SRT usa coma, VTT usa punto). El parser de un formato puede rechazar el del otro.</li>
              <li>BOM UTF-8 inicial en archivos .vtt: la W3C lo permite, pero algunos reproductores antiguos lo interpretan como texto.</li>
              <li>SSA/ASS sin sección [Events] o sin línea Format antes de los Dialogues.</li>
              <li>Subir un .sub MicroDVD esperando que se convierta sin saber el FPS: imposible determinar tiempos absolutos sin ese dato.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('convertidor-subtitulos')} />

      <ShareCard appName="convertidor-subtitulos" />

      <Footer appName="convertidor-subtitulos" />
    </div>
  );
}
