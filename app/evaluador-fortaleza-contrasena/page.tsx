'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './EvaluadorFortalezaContrasena.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────────────────
// Datos y lógica (100% en el navegador — nada se envía a ningún servidor)
// ─────────────────────────────────────────────────────────────────────────

// Muestra representativa de las contraseñas más filtradas del mundo (fugas públicas).
// Lista embebida: la comprobación es local, no se consulta ninguna API externa.
const CONTRASENAS_COMUNES = new Set([
  '123456', '123456789', '12345678', '12345', '1234567', '1234567890', '111111', '000000',
  'password', 'password1', 'passw0rd', 'contraseña', 'contrasena', 'admin', 'administrador',
  'qwerty', 'qwertyuiop', 'qwerty123', '1q2w3e4r', '1qaz2wsx', 'asdfgh', 'zxcvbnm',
  'abc123', 'a1b2c3', 'iloveyou', 'teamo', 'princesa', 'princess', 'dragon', 'monkey',
  'football', 'futbol', 'barcelona', 'realmadrid', 'madrid', 'sunshine', 'superman', 'batman',
  'master', 'shadow', 'michael', 'jennifer', 'jordan', 'hunter', 'ranger', 'daniel', 'david',
  'hola', 'holahola', 'holaquetal', 'usuario', 'cambiame', 'secreto', 'letmein', 'welcome',
  'bienvenido', 'login', 'test', 'test123', 'demo', 'root', 'toor', 'pokemon', 'naruto',
  'estrella', 'mariposa', 'chocolate', 'tequiero', 'amor', 'family', 'familia', 'google',
  'facebook', 'whatsapp', 'internet', 'computer', 'ordenador', 'samsung', 'apple', 'nokia',
  'antonio', 'manuel', 'francisco', 'juan', 'jose', 'maria', 'carmen', 'laura', 'sofia',
  '654321', '121212', '112233', '123123', '696969', '7777777', '888888', '999999',
  'qazwsx', 'qwe123', 'zaq12wsx', 'trustno1', 'starwars', 'freedom', 'whatever', 'ninja',
  'verano', 'invierno', 'primavera', 'otoño', 'enero', 'diciembre', 'lunes', 'gato', 'perro',
]);

const SECUENCIAS = [
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '!@#$%^&*()',
];

// Escenarios de ataque (intentos por segundo, orden de magnitud realista)
const ESCENARIOS = [
  { id: 'online', nombre: 'Ataque online con límites', detalle: 'Formulario web que bloquea tras varios fallos', rate: 1_000 },
  { id: 'gpu', nombre: 'Fuga de datos + GPU (hash rápido)', detalle: 'Base de datos filtrada, hash tipo SHA-256 con tarjetas gráficas', rate: 1e11 },
  { id: 'estado', nombre: 'Adversario de gran capacidad', detalle: 'Granja masiva de GPU / recursos estatales', rate: 1e14 },
];

interface Problema {
  texto: string;
}

interface Escenario {
  nombre: string;
  detalle: string;
  segundos: number;
}

interface Analisis {
  longitud: number;
  poolSize: number;
  conjuntos: string[];
  entropia: number;
  esComun: boolean;
  nivel: number; // 0-4
  problemas: Problema[];
  aciertos: string[];
  sugerencias: string[];
  escenarios: Escenario[];
}

const NIVELES = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];

function tieneSecuencia(pwd: string): boolean {
  const lower = pwd.toLowerCase();
  for (const seq of SECUENCIAS) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const tramo = seq.slice(i, i + 3);
      const tramoInv = tramo.split('').reverse().join('');
      if (lower.includes(tramo) || lower.includes(tramoInv)) return true;
    }
  }
  return false;
}

function nivelDeEntropia(bits: number): number {
  if (bits < 28) return 0;
  if (bits < 40) return 1;
  if (bits < 60) return 2;
  if (bits < 80) return 3;
  return 4;
}

function tiempoLegible(segundos: number): string {
  if (!isFinite(segundos) || segundos > 3.15e18) return 'prácticamente inviolable';
  if (segundos < 0.001) return 'instantáneo';
  if (segundos < 1) return 'menos de 1 segundo';
  // Elegir la unidad mayor cuyo valor resulte >= 1
  const escalas = [
    { div: 1, sing: 'segundo', plur: 'segundos' },
    { div: 60, sing: 'minuto', plur: 'minutos' },
    { div: 3600, sing: 'hora', plur: 'horas' },
    { div: 86400, sing: 'día', plur: 'días' },
    { div: 31_536_000, sing: 'año', plur: 'años' },
    { div: 3_153_600_000, sing: 'siglo', plur: 'siglos' },
    { div: 31_536_000_000_000, sing: 'millón de años', plur: 'millones de años' },
  ];
  let elegida = escalas[0];
  for (const e of escalas) {
    if (segundos / e.div >= 1) elegida = e;
  }
  const cantidad = segundos / elegida.div;
  const n = cantidad >= 100 ? Math.round(cantidad) : Math.round(cantidad * 10) / 10;
  const etiqueta = n === 1 ? elegida.sing : elegida.plur;
  return `${formatNumber(n, n >= 100 ? 0 : 1)} ${etiqueta}`;
}

function analizar(pwd: string): Analisis | null {
  if (!pwd) return null;
  const longitud = pwd.length;

  const tieneMin = /[a-zñ]/.test(pwd);
  const tieneMay = /[A-ZÑ]/.test(pwd);
  const tieneNum = /[0-9]/.test(pwd);
  const tieneSim = /[^a-zA-ZñÑ0-9]/.test(pwd);

  let poolSize = 0;
  const conjuntos: string[] = [];
  if (tieneMin) { poolSize += 26; conjuntos.push('minúsculas'); }
  if (tieneMay) { poolSize += 26; conjuntos.push('mayúsculas'); }
  if (tieneNum) { poolSize += 10; conjuntos.push('números'); }
  if (tieneSim) { poolSize += 33; conjuntos.push('símbolos'); }
  if (poolSize === 0) poolSize = 1;

  const entropia = longitud * Math.log2(poolSize);

  const esComun = CONTRASENAS_COMUNES.has(pwd.toLowerCase());
  const hayRepeticiones = /(.)\1{2,}/.test(pwd);
  const haySecuencia = tieneSecuencia(pwd);
  const hayAnio = /(19|20)\d{2}/.test(pwd);
  const soloUnConjunto = conjuntos.length <= 1;

  // Problemas detectados
  const problemas: Problema[] = [];
  if (esComun) problemas.push({ texto: 'Aparece en las listas de contraseñas más filtradas: un atacante la prueba de las primeras.' });
  if (longitud < 8) problemas.push({ texto: `Es demasiado corta (${longitud} caracteres). El mínimo recomendable son 12.` });
  else if (longitud < 12) problemas.push({ texto: `Es algo corta (${longitud} caracteres). Lo ideal son 14 o más.` });
  if (soloUnConjunto) problemas.push({ texto: 'Usa un solo tipo de carácter. Combina minúsculas, mayúsculas, números y símbolos.' });
  if (hayRepeticiones) problemas.push({ texto: 'Contiene caracteres repetidos seguidos (como "aaa" o "111").' });
  if (haySecuencia) problemas.push({ texto: 'Contiene secuencias predecibles de teclado o alfabeto (como "abc", "123" o "qwerty").' });
  if (hayAnio) problemas.push({ texto: 'Incluye un año reconocible: es de lo primero que prueban los atacantes.' });

  // Aciertos
  const aciertos: string[] = [];
  if (longitud >= 12) aciertos.push(`Longitud correcta (${longitud} caracteres)`);
  if (conjuntos.length >= 3) aciertos.push('Combina 3 o más tipos de carácter');
  if (!esComun && !haySecuencia && !hayRepeticiones && longitud >= 8) aciertos.push('No detectamos patrones obvios');
  if (entropia >= 70 && !esComun) aciertos.push('Alta imprevisibilidad (entropía elevada)');

  // Nivel: parte de la entropía, con penalizaciones por patrones
  let nivel = nivelDeEntropia(entropia);
  if (haySecuencia || hayRepeticiones || hayAnio) nivel = Math.max(0, nivel - 1);
  if (esComun) nivel = 0;

  // Sugerencias accionables
  const sugerencias: string[] = [];
  if (longitud < 14) sugerencias.push('Alárgala hasta 14-16 caracteres: la longitud es lo que más suma.');
  if (soloUnConjunto || conjuntos.length < 3) sugerencias.push('Mezcla mayúsculas, minúsculas, números y símbolos.');
  if (esComun || haySecuencia || hayAnio) sugerencias.push('Evita palabras del diccionario, nombres, fechas y secuencias.');
  sugerencias.push('Usa una frase larga de palabras al azar (passphrase), fácil de recordar y difícil de adivinar.');
  sugerencias.push('Mejor aún: deja que un gestor de contraseñas genere y guarde una clave única por servicio.');

  // Escenarios de descifrado (fuerza bruta, tiempo medio = mitad del espacio)
  const combinaciones = Math.pow(2, entropia);
  const escenarios: Escenario[] = ESCENARIOS.map((e) => ({
    nombre: e.nombre,
    detalle: e.detalle,
    segundos: esComun ? 0 : combinaciones / 2 / e.rate,
  }));

  return { longitud, poolSize, conjuntos, entropia, esComun, nivel, problemas, aciertos, sugerencias, escenarios };
}

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

export default function EvaluadorFortalezaContrasenaPage() {
  const [password, setPassword] = useState('');
  const [mostrar, setMostrar] = useState(false);

  const analisis = useMemo(() => analizar(password), [password]);

  const colorNivel = ['#C0392B', '#E67E22', '#F1C40F', '#27AE60', '#16A085'];
  const nivel = analisis?.nivel ?? -1;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🔒</span> Evaluador de Fortaleza de Contraseñas
        </h1>
        <p className={styles.subtitle}>
          Comprueba lo segura que es tu contraseña: entropía, tiempo de descifrado y errores frecuentes.
        </p>
      </header>

      <LegalNotice />

      {/* Aviso de privacidad — SIEMPRE visible, nunca dentro de un colapsable */}
      <div className={styles.privacyBox} role="note">
        <span className={styles.privacyIcon} aria-hidden="true">🛡️</span>
        <p>
          <strong>Tu contraseña no sale de tu dispositivo.</strong> Todo el análisis se ejecuta en tu
          navegador con JavaScript: no se envía a ningún servidor, no se guarda y no viaja por la red.
        </p>
      </div>

      {/* Herramienta principal */}
      <div className={styles.tool}>
        <label htmlFor="pwd" className={styles.label}>Escribe una contraseña para evaluarla</label>
        <div className={styles.inputRow}>
          <input
            id="pwd"
            type={mostrar ? 'text' : 'password'}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce tu contraseña…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setMostrar((m) => !m)}
            aria-pressed={mostrar}
            aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrar ? '🙈 Ocultar' : '👁️ Mostrar'}
          </button>
        </div>

        {/* Barra de fortaleza */}
        <div className={styles.barWrap} aria-hidden={!analisis}>
          <div className={styles.barTrack}>
            {[0, 1, 2, 3, 4].map((seg) => (
              <span
                key={seg}
                className={styles.barSeg}
                style={{ background: analisis && nivel >= seg ? colorNivel[nivel] : undefined }}
              />
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className={styles.results} role="status" aria-live="polite">
          {!analisis && (
            <p className={styles.placeholder}>Los resultados aparecerán aquí a medida que escribes.</p>
          )}

          {analisis && (
            <>
              <div className={styles.nivelHeader} style={{ color: colorNivel[nivel] }}>
                <span className={styles.nivelLabel}>{NIVELES[nivel]}</span>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{formatNumber(analisis.entropia, 1)}</span>
                  <span className={styles.metricLabel}>bits de entropía</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{analisis.longitud}</span>
                  <span className={styles.metricLabel}>caracteres</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{analisis.conjuntos.length}/4</span>
                  <span className={styles.metricLabel}>tipos de carácter</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>{tiempoLegible(analisis.escenarios[1].segundos)}</span>
                  <span className={styles.metricLabel}>en descifrarse (fuga + GPU)</span>
                </div>
              </div>

              {/* Escenarios de ataque */}
              <h3 className={styles.blockTitle}>
                <span aria-hidden="true">⏱️</span> Tiempo estimado de descifrado
              </h3>
              <div className={styles.tableWrapper}>
                <table className={styles.escenariosTable}>
                  <thead>
                    <tr>
                      <th>Escenario de ataque</th>
                      <th>Tiempo estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analisis.escenarios.map((e) => (
                      <tr key={e.nombre}>
                        <td>
                          <strong>{e.nombre}</strong>
                          <span className={styles.escDetalle}>{e.detalle}</span>
                        </td>
                        <td className={styles.escTiempo}>{tiempoLegible(e.segundos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Problemas */}
              {analisis.problemas.length > 0 && (
                <div className={styles.problemasBox}>
                  <h3 className={styles.blockTitle}>
                    <span aria-hidden="true">⚠️</span> Debilidades detectadas
                  </h3>
                  <ul className={styles.problemasList}>
                    {analisis.problemas.map((p, i) => (
                      <li key={i}>{p.texto}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aciertos */}
              {analisis.aciertos.length > 0 && (
                <div className={styles.aciertosBox}>
                  <h3 className={styles.blockTitle}>
                    <span aria-hidden="true">✅</span> Puntos fuertes
                  </h3>
                  <ul className={styles.aciertosList}>
                    {analisis.aciertos.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sugerencias */}
              <div className={styles.sugerenciasBox}>
                <h3 className={styles.blockTitle}>
                  <span aria-hidden="true">💡</span> Cómo mejorarla
                </h3>
                <ul className={styles.sugerenciasList}>
                  {analisis.sugerencias.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ───────── Contenido educativo v2.0 ───────── */}
      <EducationalSection
        icon="🔐"
        title="Todo sobre las contraseñas seguras"
        subtitle="Entropía, ataques reales y buenas prácticas explicadas sin tecnicismos"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Longitud frente a complejidad: qué pesa más</h2>
          <p>
            El instinto nos dice que añadir símbolos raros hace una contraseña segura. En realidad,
            lo que dispara la seguridad es la <strong>longitud</strong>, porque cada carácter extra
            multiplica el número de combinaciones posibles. Esta tabla lo ilustra con entropías aproximadas:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Ejemplo</th>
                  <th>Tipo</th>
                  <th>Entropía aprox.</th>
                  <th>Resistencia</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>hola</td><td>Palabra corta</td><td>~19 bits</td><td>Instantánea</td></tr>
                <tr><td>P@ssw0rd!</td><td>Palabra con sustituciones</td><td>~30 bits</td><td>Muy baja</td></tr>
                <tr><td>Marzo2026!</td><td>Palabra + año</td><td>~38 bits</td><td>Baja</td></tr>
                <tr><td>k7$Rm2!pQ</td><td>Aleatoria 9 caracteres</td><td>~53 bits</td><td>Media</td></tr>
                <tr><td>caballo-azul-mesa-trueno</td><td>Frase de 4 palabras al azar</td><td>~70+ bits</td><td>Alta</td></tr>
                <tr><td>xR9#mK2$vL8@qP4!</td><td>Aleatoria 16 caracteres</td><td>~100+ bits</td><td>Muy alta</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Qué contraseña necesitas según el caso</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🏦</span> Cuentas críticas</h3>
              <p>Correo principal, banca y gestor de contraseñas. Aquí usa la clave más larga posible (16+), única, y activa siempre la verificación en dos pasos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🛒</span> Tiendas y servicios</h3>
              <p>Comercios, apps de reparto, suscripciones. Contraseñas únicas de 12-14 caracteres generadas por el gestor; nunca reutilices la del correo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">📰</span> Registros de usar y tirar</h3>
              <p>Foros, descargas puntuales, pruebas. Aunque importen poco, siguen debiendo ser únicas: una fuga aquí no debe abrir tus cuentas importantes.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">👨‍👩‍👧</span> Dispositivos compartidos</h3>
              <p>Ordenador o tablet familiar. Cada persona con su sesión y su clave; evita apuntarlas en notas visibles o archivos sin cifrar.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Qué es exactamente la entropía?</h3>
              <p>Es una medida en bits de lo impredecible que es tu contraseña: cuántas combinaciones tendría que probar un atacante de media. Cada bit adicional duplica ese número. Por debajo de 40 bits se considera débil; por encima de 70-80, muy fuerte.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿De verdad no se envía mi contraseña a ningún sitio?</h3>
              <p>Correcto. El cálculo ocurre íntegramente en tu navegador; no hay ninguna petición de red con tu contraseña, ni almacenamiento. Aun así, para tu clave más crítica, la mejor práctica siempre es no teclearla en webs que no controlas.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Sirve de algo cambiar letras por símbolos (a→@, o→0)?</h3>
              <p>Muy poco. Los atacantes conocen esas sustituciones y sus programas las prueban automáticamente. "P@ssw0rd" es casi tan débil como "password". Es mucho más efectivo añadir longitud y aleatoriedad.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cada cuánto debo cambiar mis contraseñas?</h3>
              <p>El consejo moderno (recogido por guías de referencia como las del NIST) es no forzar cambios periódicos si la contraseña es fuerte y única. Cámbiala si hay indicios de filtración, si la reutilizabas o si sospechas un acceso no autorizado.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es seguro un gestor de contraseñas? ¿Y si lo hackean?</h3>
              <p>Un buen gestor guarda tus claves cifradas con una contraseña maestra que solo tú conoces. El riesgo de reutilizar contraseñas o usar unas débiles es muchísimo mayor que el de usar un gestor reputado. Protégelo con una clave maestra larga y con 2FA.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es una passphrase o frase de contraseña?</h3>
              <p>Es una contraseña formada por varias palabras al azar, como "trueno-mesa-caballo-limón". Al ser larga tiene mucha entropía, pero resulta fácil de recordar. Es una de las mejores opciones para claves que necesitas memorizar (correo, gestor).</p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.eduSection}>
          <h2>Cómo crear una contraseña realmente fuerte</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Piensa en longitud, no en rareza</h3>
                <p>Apunta a 14-16 caracteres como mínimo. Es el factor que más multiplica la seguridad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Elige palabras al azar</h3>
                <p>Combina 4 o 5 palabras sin relación entre sí. Evita frases hechas, letras de canciones o refranes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Añade algo de variedad</h3>
                <p>Intercala mayúsculas, un número y un símbolo en posiciones no predecibles, sin caer en "palabra+2026!".</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Una contraseña distinta por servicio</h3>
                <p>Nunca reutilices. Si un sitio sufre una fuga, las demás cuentas siguen a salvo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Guárdala en un gestor y activa el 2FA</h3>
                <p>El gestor recuerda las claves por ti; la verificación en dos pasos añade una barrera aunque roben la contraseña.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.eduSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔑</span>
              <p>Una contraseña única para cada cuenta importante, sin excepciones.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <p>Activa la verificación en dos pasos (2FA), mejor con app o llave física que por SMS.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧰</span>
              <p>Usa un gestor de contraseñas para generar y recordar claves largas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔔</span>
              <p>Vigila los avisos de filtraciones y cambia de inmediato las contraseñas afectadas.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores frecuentes */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">🚫</span>
              <h2>Errores que debes evitar</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Reutilizar la misma contraseña</strong> en varios servicios: una sola fuga las compromete todas.</li>
              <li><strong>Usar datos personales</strong> (nombre, fecha de nacimiento, mascota, equipo): son fáciles de averiguar.</li>
              <li><strong>Confiar en sustituciones obvias</strong> como a→@ u o→0: los programas de ataque las conocen.</li>
              <li><strong>Apuntarlas en notas visibles</strong> o archivos sin cifrar en el escritorio.</li>
              <li><strong>Compartirlas por mensajería</strong> o correo, aunque sea "solo esta vez".</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('evaluador-fortaleza-contrasena')} />
      <ShareCard appName="evaluador-fortaleza-contrasena" />
      <Footer appName="evaluador-fortaleza-contrasena" />
    </div>
  );
}
