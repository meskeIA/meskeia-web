'use client';

import { useEffect, useState } from 'react';
import styles from './ConversorFechaJuliana.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import {
  NOMBRES_DIA_SEMANA,
  NOMBRES_MES,
  codigosDeFecha,
  diasDelAnio,
  diaSemanaGregoriano,
  fechaDesdeJd,
  jdDesdeFecha,
  leerCodigo,
  textoFecha,
  textoHora,
  type FechaCivil,
  type FormatoCodigo,
} from '@/lib/calculadoras/fechaJuliana';
import { PREGUNTAS_FRECUENTES } from './metadata';

/**
 * Conversor de fecha juliana (S0271, 12/11/2026). Tres modos, porque «fecha juliana» nombra dos
 * cosas: el día del año de los lotes (de la fecha al código y del código a la fecha) y el día
 * juliano astronómico. Todo el cálculo vive en `lib/calculadoras/fechaJuliana.ts`, sin `Date`.
 *
 * La fecha de hoy y el año de referencia se ponen AL MONTAR, en un efecto: el HTML prerenderizado
 * llevaría la fecha del build y React no corrige el valor al hidratar (check:reloj-azar).
 */

type Modo = 'fecha-codigo' | 'codigo-fecha' | 'astronomico';
type SentidoJd = 'fecha-jd' | 'jd-fecha';

const DESCRIPCION_FORMATO: Record<FormatoCodigo, string> = {
  DDD: 'DDD: solo el día del año (el año es el de referencia)',
  ADDD: 'ADDD: última cifra del año + día del año',
  AADDD: 'AADDD: dos cifras del año + día del año',
  AAAADDD: 'AAAADDD: año completo + día del año',
};

/** «2026-11-12» (valor de un <input type="date">) → fecha civil, o null. */
function leerInputFecha(valor: string): FechaCivil | null {
  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

const dos = (n: number): string => String(n).padStart(2, '0');

/** Entero desde un campo de texto; NaN si no lo es. */
function entero(texto: string): number {
  const n = parseSpanishNumber(texto);
  return Number.isInteger(n) ? n : Number.NaN;
}

export default function ConversorFechaJulianaPage() {
  const [modo, setModo] = useState<Modo>('fecha-codigo');

  // Modo 1 · de la fecha al código
  const [fechaTexto, setFechaTexto] = useState('');

  // Modo 2 · del código a la fecha
  const [codigo, setCodigo] = useState('');
  const [anioReferenciaTexto, setAnioReferenciaTexto] = useState('');

  // Modo 3 · día juliano astronómico (de partida, la época J2000.0)
  const [sentidoJd, setSentidoJd] = useState<SentidoJd>('fecha-jd');
  const [jdDia, setJdDia] = useState('1');
  const [jdMes, setJdMes] = useState('1');
  const [jdAnio, setJdAnio] = useState('2000');
  const [jdHora, setJdHora] = useState('12');
  const [jdMinuto, setJdMinuto] = useState('0');
  const [jdSegundo, setJdSegundo] = useState('0');
  const [jdTexto, setJdTexto] = useState('2451545');

  const ponerHoy = (): void => {
    const ahora = new Date();
    setFechaTexto(`${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`);
  };

  // Al montar: hoy y el año en curso (no en el render, ver cabecera).
  useEffect(() => {
    const ahora = new Date();
    setFechaTexto(`${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`);
    setAnioReferenciaTexto(String(ahora.getFullYear()));
  }, []);

  const ponerAhoraUtc = (): void => {
    const ahora = new Date();
    setJdDia(String(ahora.getUTCDate()));
    setJdMes(String(ahora.getUTCMonth() + 1));
    setJdAnio(String(ahora.getUTCFullYear()));
    setJdHora(String(ahora.getUTCHours()));
    setJdMinuto(String(ahora.getUTCMinutes()));
    setJdSegundo(String(ahora.getUTCSeconds()));
  };

  // ── Cálculos ──
  const fecha = leerInputFecha(fechaTexto);
  const codigos = fecha ? codigosDeFecha(fecha) : null;

  const anioReferencia = entero(anioReferenciaTexto);
  const lectura =
    codigo.trim() === ''
      ? null
      : Number.isInteger(anioReferencia) && anioReferencia >= 1 && anioReferencia <= 9999
        ? leerCodigo(codigo, anioReferencia)
        : ({ ok: false, error: 'Escribe un año de referencia entre 1 y 9999.' } as const);

  const resultadoJd = jdDesdeFecha({
    anio: entero(jdAnio),
    mes: entero(jdMes),
    dia: entero(jdDia),
    hora: entero(jdHora),
    minuto: entero(jdMinuto),
    segundo: parseSpanishNumber(jdSegundo),
  });
  const resultadoFecha = fechaDesdeJd(parseSpanishNumber(jdTexto));

  const botonModo = (valor: Modo, etiqueta: string) => (
    <button
      type="button"
      className={`${styles.modoBtn} ${modo === valor ? styles.modoActivo : ''}`}
      aria-pressed={modo === valor}
      onClick={() => setModo(valor)}
    >
      {etiqueta}
    </button>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📅</span> Conversor de Fecha Juliana
        </h1>
        <p className={styles.subtitle}>
          De la fecha al día del año y al código de lote (26316, 2026316, 6316), del código a la
          fecha, y el día juliano astronómico de cualquier fecha y hora.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.modos} role="group" aria-label="Qué quieres convertir">
        {botonModo('fecha-codigo', 'Fecha → código juliano')}
        {botonModo('codigo-fecha', 'Código juliano → fecha')}
        {botonModo('astronomico', 'Día juliano (astronomía)')}
      </div>

      {modo === 'fecha-codigo' && (
        <section className={styles.card} aria-labelledby="titulo-fecha-codigo" key="m1">
          <h2 id="titulo-fecha-codigo" className={styles.cardTitulo}>De la fecha al código juliano</h2>
          <div className={styles.filaCampo}>
            <div className={styles.campo}>
              <label htmlFor="fecha-entrada" className={styles.etiqueta}>Fecha</label>
              <input
                id="fecha-entrada"
                type="date"
                className={styles.input}
                value={fechaTexto}
                onChange={(e) => setFechaTexto(e.target.value)}
              />
            </div>
            <button type="button" className={styles.btnSecundario} onClick={ponerHoy}>
              Hoy
            </button>
          </div>

          <div role="status" aria-live="polite" aria-atomic="true">
            {codigos && fecha ? (
              <div key="r1">
                <div className={styles.destacado}>
                  <span className={styles.destacadoEtiqueta}>Día del año</span>
                  <span className={styles.destacadoValor}>{String(codigos.ordinal).padStart(3, '0')}</span>
                  <span className={styles.destacadoNota}>
                    {NOMBRES_DIA_SEMANA[diaSemanaGregoriano(fecha)]} {textoFecha(fecha)} · día {codigos.ordinal} de{' '}
                    {diasDelAnio(fecha.anio)} · faltan {codigos.diasRestantes}
                  </span>
                </div>
                <div className={styles.tarjetas}>
                  <div className={styles.tarjeta}>
                    <span className={styles.tarjetaEtiqueta}>AADDD</span>
                    <span className={styles.tarjetaValor}>{codigos.aaddd}</span>
                  </div>
                  <div className={styles.tarjeta}>
                    <span className={styles.tarjetaEtiqueta}>AAAADDD</span>
                    <span className={styles.tarjetaValor}>{codigos.aaaaddd}</span>
                  </div>
                  <div className={styles.tarjeta}>
                    <span className={styles.tarjetaEtiqueta}>ADDD</span>
                    <span className={styles.tarjetaValor}>{codigos.addd}</span>
                  </div>
                  <div className={styles.tarjeta}>
                    <span className={styles.tarjetaEtiqueta}>ISO 8601</span>
                    <span className={styles.tarjetaValor}>{codigos.iso}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className={styles.espera} key="e1">
                Elige una fecha entre el año 1 y el 9999.
              </p>
            )}
          </div>
        </section>
      )}

      {modo === 'codigo-fecha' && (
        <section className={styles.card} aria-labelledby="titulo-codigo-fecha" key="m2">
          <h2 id="titulo-codigo-fecha" className={styles.cardTitulo}>Del código juliano a la fecha</h2>
          <div className={styles.filaCampo}>
            <div className={styles.campo}>
              <label htmlFor="codigo-entrada" className={styles.etiqueta}>
                Código juliano (3, 4, 5 o 7 cifras)
              </label>
              <input
                id="codigo-entrada"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className={styles.input}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Por ejemplo, 26316"
              />
            </div>
            <div className={styles.campoCorto}>
              <label htmlFor="anio-referencia" className={styles.etiqueta}>Año de referencia</label>
              <input
                id="anio-referencia"
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={anioReferenciaTexto}
                onChange={(e) => setAnioReferenciaTexto(e.target.value)}
              />
            </div>
          </div>
          <p className={styles.ayuda}>
            El año de referencia decide la década o el siglo de los códigos que no llevan el año
            entero. Por defecto es el año en curso.
          </p>

          <div role="status" aria-live="polite" aria-atomic="true">
            {lectura === null && (
              <p className={styles.espera} key="e2">
                Escribe el código tal como aparece en el envase o el documento.
              </p>
            )}
            {lectura !== null && !lectura.ok && (
              <p className={styles.error} key="x2">
                {lectura.error}
              </p>
            )}
            {lectura !== null && lectura.ok && (
              <div key="r2">
                <div className={styles.destacado}>
                  <span className={styles.destacadoEtiqueta}>Fecha</span>
                  <span className={styles.destacadoValor}>{textoFecha(lectura.fecha)}</span>
                  <span className={styles.destacadoNota}>
                    {NOMBRES_DIA_SEMANA[diaSemanaGregoriano(lectura.fecha)]}, {lectura.fecha.dia} de{' '}
                    {NOMBRES_MES[lectura.fecha.mes - 1]} de {lectura.fecha.anio} · día {lectura.ordinal} del año
                  </span>
                </div>
                <p className={styles.detalle}>
                  <strong>Formato:</strong> <span>{DESCRIPCION_FORMATO[lectura.formato]}</span>
                </p>
                {lectura.alternativas.length > 0 && (
                  <p className={styles.detalle} key="alt">
                    <strong>También podría ser:</strong>{' '}
                    <span>{lectura.alternativas.map(textoFecha).join(' · ')}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {modo === 'astronomico' && (
        <section className={styles.card} aria-labelledby="titulo-astronomico" key="m3">
          <h2 id="titulo-astronomico" className={styles.cardTitulo}>Día juliano astronómico (JD)</h2>
          <div className={styles.subModos} role="group" aria-label="Sentido de la conversión">
            <button
              type="button"
              className={`${styles.subModoBtn} ${sentidoJd === 'fecha-jd' ? styles.subModoActivo : ''}`}
              aria-pressed={sentidoJd === 'fecha-jd'}
              onClick={() => setSentidoJd('fecha-jd')}
            >
              Fecha y hora → JD
            </button>
            <button
              type="button"
              className={`${styles.subModoBtn} ${sentidoJd === 'jd-fecha' ? styles.subModoActivo : ''}`}
              aria-pressed={sentidoJd === 'jd-fecha'}
              onClick={() => setSentidoJd('jd-fecha')}
            >
              JD → fecha y hora
            </button>
          </div>

          {sentidoJd === 'fecha-jd' ? (
            <div key="s1">
              <fieldset className={styles.grupo}>
                <legend className={styles.etiqueta}>Fecha (día, mes, año)</legend>
                <div className={styles.filaTres}>
                  <input aria-label="Día" type="text" inputMode="numeric" className={styles.input} value={jdDia} onChange={(e) => setJdDia(e.target.value)} />
                  <input aria-label="Mes" type="text" inputMode="numeric" className={styles.input} value={jdMes} onChange={(e) => setJdMes(e.target.value)} />
                  <input aria-label="Año" type="text" inputMode="numeric" className={styles.input} value={jdAnio} onChange={(e) => setJdAnio(e.target.value)} />
                </div>
              </fieldset>
              <fieldset className={styles.grupo}>
                <legend className={styles.etiqueta}>Hora en tiempo universal (UTC): horas, minutos, segundos</legend>
                <div className={styles.filaTres}>
                  <input aria-label="Hora" type="text" inputMode="numeric" className={styles.input} value={jdHora} onChange={(e) => setJdHora(e.target.value)} />
                  <input aria-label="Minuto" type="text" inputMode="numeric" className={styles.input} value={jdMinuto} onChange={(e) => setJdMinuto(e.target.value)} />
                  <input aria-label="Segundo" type="text" inputMode="decimal" className={styles.input} value={jdSegundo} onChange={(e) => setJdSegundo(e.target.value)} />
                </div>
              </fieldset>
              <button type="button" className={styles.btnSecundario} onClick={ponerAhoraUtc}>
                Ahora (UTC)
              </button>

              <div role="status" aria-live="polite" aria-atomic="true" className={styles.resultadoJd}>
                {resultadoJd.ok ? (
                  <div key="r3">
                    <div className={styles.destacado}>
                      <span className={styles.destacadoEtiqueta}>Día juliano (JD)</span>
                      <span className={styles.destacadoValor}>{formatNumber(resultadoJd.jd, 5)}</span>
                      <span className={styles.destacadoNota}>
                        {NOMBRES_DIA_SEMANA[resultadoJd.diaSemana]} · calendario {resultadoJd.calendario}
                      </span>
                    </div>
                    <p className={styles.detalle}>
                      <strong>Día juliano modificado (MJD):</strong> <span>{formatNumber(resultadoJd.mjd, 5)}</span>
                    </p>
                  </div>
                ) : (
                  <p className={styles.error} key="x3">
                    {resultadoJd.error}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div key="s2">
              <div className={styles.campo}>
                <label htmlFor="jd-entrada" className={styles.etiqueta}>
                  Día juliano (con decimales para la hora)
                </label>
                <input
                  id="jd-entrada"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  className={styles.input}
                  value={jdTexto}
                  onChange={(e) => setJdTexto(e.target.value)}
                  placeholder="Por ejemplo, 2451545,0"
                />
              </div>

              <div role="status" aria-live="polite" aria-atomic="true" className={styles.resultadoJd}>
                {resultadoFecha.ok ? (
                  <div key="r4">
                    <div className={styles.destacado}>
                      <span className={styles.destacadoEtiqueta}>Fecha y hora (UTC)</span>
                      <span className={styles.destacadoValor}>
                        {textoFecha(resultadoFecha.fecha)} {textoHora(resultadoFecha.fecha)}
                      </span>
                      <span className={styles.destacadoNota}>
                        {NOMBRES_DIA_SEMANA[resultadoFecha.diaSemana]} · calendario {resultadoFecha.calendario}
                      </span>
                    </div>
                    <p className={styles.detalle}>
                      <strong>Día juliano modificado (MJD):</strong> <span>{formatNumber(resultadoFecha.mjd, 5)}</span>
                    </p>
                  </div>
                ) : (
                  <p className={styles.error} key="x4">
                    {resultadoFecha.error}
                  </p>
                )}
              </div>
            </div>
          )}
          <p className={styles.ayuda}>
            Antes del 15/10/1582 la fecha se lee en el calendario juliano, como en astronomía; los
            días 5 a 14 de octubre de 1582 no existieron.
          </p>
        </section>
      )}

      {/*
        Visible y fuera del bloque educativo: quien descifra el código de un envase puede
        tomarlo por la fecha de caducidad, que es justo lo que no es.
      */}
      <div className={styles.aviso} role="note">
        <strong><span aria-hidden="true">⚠️</span> Un código juliano de lote no es la fecha de caducidad.</strong>{' '}
        Suele marcar el día de fabricación o envasado, y cada fabricante elige su formato (a veces
        con letras de planta o turno delante o detrás). Para consumir un producto, la fecha que
        vale es la de consumo preferente o caducidad impresa como tal.
      </div>

      <DisclaimerCard variant="technical" severity="low" context="conversor-fecha-juliana" collapsible={true} />

      <EducationalSection
        icon="📚"
        title="La fecha juliana, explicada"
        subtitle="Día del año, códigos de lote y día juliano astronómico"
      >
        <section className={styles.guideSection}>
          <h2>Dos cosas con el mismo nombre</h2>
          <p>
            La <strong>fecha juliana de la industria</strong> es el número de día del año: el 1 de
            enero es el 001 y el 31 de diciembre, el 365 (366 en un año bisiesto). Se imprime en
            lotes, palés y documentos de producción porque ocupa pocas cifras y se ordena sola. En
            rigor es una <em>fecha ordinal</em>, y la norma ISO 8601 la escribe 2026-316.
          </p>
          <p>
            El <strong>día juliano astronómico</strong> es otra cosa: una cuenta continua de días,
            con decimales para la hora, desde el mediodía del 1 de enero del 4713 a. C. Sirve para
            restar fechas sin pensar en meses, bisiestos ni cambios de calendario.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Comparativa de formatos</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption className={styles.caption}>El 12 de noviembre de 2026 en cada formato</caption>
              <thead>
                <tr>
                  <th scope="col">Formato</th>
                  <th scope="col">Ejemplo</th>
                  <th scope="col">Dónde se ve</th>
                  <th scope="col">Ambigüedad</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>DDD</td><td>316</td><td>Planes de producción del año en curso</td><td>Falta el año</td></tr>
                <tr><td>ADDD</td><td>6316</td><td>Lotes de alimentación y bebidas</td><td>La década (2016, 2026, 2036…)</td></tr>
                <tr><td>AADDD</td><td>26316</td><td>Lotes, etiquetas de palé, sistemas antiguos</td><td>El siglo</td></tr>
                <tr><td>AAAADDD</td><td>2026316</td><td>Bases de datos y registros</td><td>Ninguna</td></tr>
                <tr><td>ISO 8601 ordinal</td><td>2026-316</td><td>Documentación técnica, programación</td><td>Ninguna</td></tr>
                <tr><td>Día juliano (JD)</td><td>2.461.356,5 (0:00 UT)</td><td>Astronomía, geodesia, órbitas</td><td>Ninguna</td></tr>
                <tr><td>Día juliano modificado (MJD)</td><td>61.356</td><td>Astronomía, satélites</td><td>Ninguna</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Para quién es útil</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">📦</div>
              <h3>Calidad, almacén y logística</h3>
              <p>Saber de qué día es un lote para rotar el stock, localizar una partida o cruzar un registro de producción.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🛒</div>
              <h3>Consumidores</h3>
              <p>Comprobar si un producto pertenece a un lote retirado del mercado, cuando el aviso da el código del lote.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🔭</div>
              <h3>Astronomía y estudiantes</h3>
              <p>Pasar la hora de una observación a día juliano, o restar dos JD para saber cuánto tiempo pasó entre dos fenómenos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">💻</div>
              <h3>Programación</h3>
              <p>Comprobar a mano la fecha ordinal o el JD que devuelve un programa, o entender un campo AADDD de un fichero heredado.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo descifrar un código de lote, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>Busca en el envase un grupo de 4, 5 o 7 cifras, a veces precedido de «L» o «Lote».</div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>Quita las letras de planta o turno que lleve delante o detrás: solo cuentan las cifras.</div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>Las tres últimas cifras son el día del año (de 001 a 366): si pasan de 366, no es un código juliano.</div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>Las cifras de delante son el año: una (ADDD), dos (AADDD) o cuatro (AAAADDD).</div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>Escríbelo en el modo «Código juliano → fecha» y mira si la fecha y sus alternativas tienen sentido para ese producto.</div>
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
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🗂️</div>
              <h3>Guarda el año entero</h3>
              <p>En registros propios usa AAAADDD o AAAA-DDD: el código corto ahorra cifras y luego obliga a adivinar la década.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">📆</div>
              <h3>Cuidado con marzo en bisiesto</h3>
              <p>Desde el 1 de marzo, el día del año de un bisiesto va uno por delante: el 1/3 es el 060 en 2026 y el 061 en 2028.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🌐</div>
              <h3>El JD va en tiempo universal</h3>
              <p>Convierte antes tu hora local a UTC según la diferencia horaria de tu zona (que puede cambiar en verano).</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🔢</div>
              <h3>Resta JD, no fechas</h3>
              <p>Para saber cuántos días pasaron entre dos instantes, resta sus JD: el resultado ya incluye la hora en decimales.</p>
            </div>
          </div>
        </section>

        <section className={styles.warningBox}>
          <h2 className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span> Errores frecuentes
          </h2>
          <ul className={styles.warningList}>
            <li>Tomar el código juliano de un lote por la fecha de caducidad.</li>
            <li>Leer un ADDD con la década equivocada: 6316 puede ser de 2016 o de 2026.</li>
            <li>Confundir la fecha juliana de la industria con el día juliano astronómico, que tiene siete cifras antes de la coma.</li>
            <li>Olvidar que el día juliano empieza a mediodía: el 1/1/2000 a las 0:00 UT es el 2.451.544,5, no el 2.451.545.</li>
            <li>Calcular el JD de una fecha anterior a 1582 como si fuera gregoriana: sale desplazada hasta diez días.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="conversor-fecha-juliana" />

      <Footer appName="conversor-fecha-juliana" />
    </div>
  );
}
