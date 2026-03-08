'use client';

import { useState } from 'react';
import styles from './ConversorBinario.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'texto-binario' | 'binario-texto';

interface Conversiones {
  binario: string;
  hexadecimal: string;
  octal: string;
  decimal: string;
}

export default function ConversorBinarioPage() {
  const [modo, setModo] = useState<ModoType>('texto-binario');
  const [entrada, setEntrada] = useState('');
  const [resultado, setResultado] = useState('');
  const [conversiones, setConversiones] = useState<Conversiones | null>(null);
  const [error, setError] = useState('');

  const textoABinario = (texto: string): string => {
    return texto
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  };

  const binarioATexto = (binario: string): string => {
    const bytes = binario.replace(/\s+/g, '').match(/.{1,8}/g);
    if (!bytes) return '';

    return bytes
      .map(byte => {
        const num = parseInt(byte, 2);
        if (isNaN(num)) throw new Error('Binario inválido');
        return String.fromCharCode(num);
      })
      .join('');
  };

  const calcularConversiones = (texto: string): Conversiones => {
    const binario = textoABinario(texto);
    const hexadecimal = texto
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    const octal = texto
      .split('')
      .map(char => char.charCodeAt(0).toString(8).padStart(3, '0'))
      .join(' ');
    const decimal = texto
      .split('')
      .map(char => char.charCodeAt(0).toString())
      .join(' ');

    return { binario, hexadecimal, octal, decimal };
  };

  const convertir = () => {
    setError('');
    setConversiones(null);

    try {
      if (modo === 'texto-binario') {
        if (!entrada.trim()) return;
        const binario = textoABinario(entrada);
        setResultado(binario);
        setConversiones(calcularConversiones(entrada));
      } else {
        if (!entrada.trim()) return;
        const texto = binarioATexto(entrada);
        setResultado(texto);
        setConversiones(calcularConversiones(texto));
      }
    } catch {
      setError('Error en la conversión. Verifica que el formato sea correcto.');
    }
  };

  const intercambiar = () => {
    setModo(modo === 'texto-binario' ? 'binario-texto' : 'texto-binario');
    setEntrada('');
    setResultado('');
    setConversiones(null);
    setError('');
  };

  const limpiar = () => {
    setEntrada('');
    setResultado('');
    setConversiones(null);
    setError('');
  };

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
    }
  };

  const cargarEjemplo = (texto: string) => {
    if (modo === 'texto-binario') {
      setEntrada(texto);
    } else {
      setEntrada(textoABinario(texto));
    }
    setResultado('');
    setConversiones(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor Binario</h1>
        <p className={styles.subtitle}>
          Convierte texto a código binario (0 y 1) y viceversa
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${modo === 'texto-binario' ? styles.active : ''}`}
            onClick={() => { setModo('texto-binario'); setEntrada(''); setResultado(''); setConversiones(null); setError(''); }}
          >
            Texto → Binario
          </button>
          <button
            className={`${styles.modeBtn} ${modo === 'binario-texto' ? styles.active : ''}`}
            onClick={() => { setModo('binario-texto'); setEntrada(''); setResultado(''); setConversiones(null); setError(''); }}
          >
            Binario → Texto
          </button>
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>
            {modo === 'texto-binario' ? 'Texto' : 'Código binario'}
          </label>
          <textarea
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            placeholder={modo === 'texto-binario'
              ? 'Escribe tu texto aquí...'
              : 'Introduce código binario (ej: 01001000 01101111 01101100 01100001)'}
            className={styles.textarea}
            rows={4}
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Ejemplos:</span>
            <button onClick={() => cargarEjemplo('Hola')} className={styles.exampleBtn}>Hola</button>
            <button onClick={() => cargarEjemplo('ABC')} className={styles.exampleBtn}>ABC</button>
            <button onClick={() => cargarEjemplo('123')} className={styles.exampleBtn}>123</button>
            <button onClick={() => cargarEjemplo('meskeIA')} className={styles.exampleBtn}>meskeIA</button>
          </div>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.buttonRow}>
          <button onClick={convertir} className={styles.btnPrimary} disabled={!entrada.trim()}>
            Convertir
          </button>
          <button onClick={intercambiar} className={styles.btnSwap} title="Intercambiar">
            ⇄
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {resultado && (
          <div className={styles.resultSection}>
            <label className={styles.label}>
              {modo === 'texto-binario' ? 'Código binario:' : 'Texto:'}
            </label>
            <div className={styles.resultBox}>{resultado}</div>
            <button onClick={copiarResultado} className={styles.btnCopy}>
              📋 Copiar
            </button>
          </div>
        )}

        {conversiones && (
          <div className={styles.conversionGrid}>
            <div className={styles.conversionCard}>
              <h4>Binario (Base 2)</h4>
              <code>{conversiones.binario}</code>
            </div>
            <div className={styles.conversionCard}>
              <h4>Hexadecimal (Base 16)</h4>
              <code>{conversiones.hexadecimal}</code>
            </div>
            <div className={styles.conversionCard}>
              <h4>Octal (Base 8)</h4>
              <code>{conversiones.octal}</code>
            </div>
            <div className={styles.conversionCard}>
              <h4>Decimal / ASCII</h4>
              <code>{conversiones.decimal}</code>
            </div>
          </div>
        )}
      </div>

      <EducationalSection
        title="Aprende sobre Sistemas de Numeración y Código Binario"
        subtitle="Historia, matemáticas y aplicaciones prácticas de los sistemas de numeración en informática"
        icon="💻"
      >
        {/* Tabla Comparativa */}
        <div className="edu-table-wrapper">
          <h3 className="edu-section-title">📊 Comparativa de Sistemas de Numeración</h3>
          <div className="edu-table-scroll">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Sistema</th>
                  <th>Base</th>
                  <th>Símbolos</th>
                  <th>Ejemplo (&quot;A&quot;)</th>
                  <th>Uso principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Binario</strong></td>
                  <td>2</td>
                  <td>0, 1</td>
                  <td>01000001</td>
                  <td>Hardware, transistores, lógica</td>
                </tr>
                <tr>
                  <td><strong>Octal</strong></td>
                  <td>8</td>
                  <td>0–7</td>
                  <td>101</td>
                  <td>Permisos Unix, sistemas embebidos</td>
                </tr>
                <tr>
                  <td><strong>Decimal</strong></td>
                  <td>10</td>
                  <td>0–9</td>
                  <td>65</td>
                  <td>Uso cotidiano, contabilidad</td>
                </tr>
                <tr>
                  <td><strong>Hexadecimal</strong></td>
                  <td>16</td>
                  <td>0–9, A–F</td>
                  <td>41</td>
                  <td>Colores, memoria, depuración</td>
                </tr>
                <tr>
                  <td><strong>BCD</strong></td>
                  <td>10 (en 4 bits)</td>
                  <td>0000–1001</td>
                  <td>0110 0101</td>
                  <td>Displays digitales, cajeros</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Casos de Uso */}
        <div className="edu-escenarios-section">
          <h3 className="edu-section-title">🎯 ¿Cuándo necesitas el código binario?</h3>
          <div className="edu-escenarios-grid">
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">⚙️</span>
              <h4>Programación de bajo nivel</h4>
              <p>En ensamblador, drivers y firmware trabajas directamente con bits y bytes. Entender binario es esencial para manipular registros de CPU y puertos de E/S.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🌐</span>
              <h4>Depuración de redes</h4>
              <p>Las máscaras de subred, direcciones IP y cabeceras de paquetes se entienden mejor en binario. Ejemplo: /24 = 11111111.11111111.11111111.00000000.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🔒</span>
              <h4>Criptografía y hashing</h4>
              <p>SHA-256, AES y otros algoritmos operan a nivel de bits con operaciones XOR, AND, OR y rotaciones. El resultado final se expresa habitualmente en hexadecimal.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🔌</span>
              <h4>Electrónica digital</h4>
              <p>Puertas lógicas AND, OR, NOT, XOR implementan el binario en hardware. Cada flip-flop almacena un bit. Comprender binario es la base de todo diseño digital.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="edu-faq-section">
          <h3 className="edu-section-title">❓ Preguntas Frecuentes</h3>
          <div className="edu-faq-list">
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Por qué los ordenadores usan binario y no decimal?</summary>
              <div className="edu-faq-answer">
                <p>Los transistores, el componente básico de los chips, tienen dos estados estables: conducen corriente (1) o no (0). El sistema binario se mapea perfectamente a esta realidad física. Representar 10 estados distintos (decimal) con transistores sería mucho más difícil, propenso a errores y consumiría más energía.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es exactamente un byte y por qué 8 bits?</summary>
              <div className="edu-faq-answer">
                <p>Un byte son 8 bits. Con 8 bits puedes representar 2⁸ = 256 valores distintos (0–255), suficiente para todos los caracteres ASCII básicos. El tamaño de 8 bits se estableció como estándar en los años 60-70 por razones prácticas de hardware. Antes existían bytes de 6, 7 o 9 bits en distintas arquitecturas.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuál es la diferencia entre ASCII y Unicode?</summary>
              <div className="edu-faq-answer">
                <p>ASCII usa 7 bits (128 caracteres) o 8 bits en versiones extendidas. Solo cubre el inglés básico. Unicode es un estándar universal que cubre más de 140.000 caracteres de todos los idiomas, emojis y símbolos. UTF-8 (la codificación más común de Unicode) usa entre 1 y 4 bytes por carácter, siendo compatible con ASCII para los primeros 128 caracteres.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Por qué los programadores prefieren hexadecimal al binario?</summary>
              <div className="edu-faq-answer">
                <p>Hexadecimal es un atajo del binario: cada dígito hex representa exactamente 4 bits (un nibble). Es más compacto y legible. Por ejemplo, el byte 11111111 en binario es FF en hex. Colores web (#FF5733), direcciones de memoria (0x7FFF) y valores de hash se expresan en hex por su compacidad.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es el complemento a dos y para qué sirve?</summary>
              <div className="edu-faq-answer">
                <p>Es el sistema estándar para representar números negativos en binario. Para obtener el complemento a dos de un número: invierte todos los bits y suma 1. Así, en 8 bits, -1 es 11111111. La ventaja es que la suma y resta funcionan igual para positivos y negativos, simplificando enormemente el hardware de la ALU del procesador.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué significa big-endian y little-endian?</summary>
              <div className="edu-faq-answer">
                <p>Define el orden en que se almacenan los bytes de un número multibyte en memoria. Big-endian almacena el byte más significativo primero (como escribimos los números), mientras que little-endian almacena el menos significativo primero. Los procesadores Intel/AMD son little-endian; muchos protocolos de red (TCP/IP) usan big-endian. Esto importa al intercambiar datos entre sistemas distintos.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es el BCD (Binary Coded Decimal)?</summary>
              <div className="edu-faq-answer">
                <p>BCD codifica cada dígito decimal (0–9) en 4 bits de forma separada. El número 65 en BCD sería 0110 0101 (6=0110, 5=0101). Es ineficiente comparado con binario puro, pero facilita la conversión a pantallas de 7 segmentos y evita errores de redondeo en cálculos financieros. Se usa en cajeros automáticos y relojes digitales.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cómo se multiplica en binario?</summary>
              <div className="edu-faq-answer">
                <p>La multiplicación binaria sigue las mismas reglas que la decimal pero simplificada: 0×cualquier cosa=0, 1×cualquier cosa=ese número. Se hacen productos parciales y se suman desplazando. En hardware, los procesadores modernos usan el algoritmo de Booth o multiplicadores de árbol de Wallace para hacerlo en un solo ciclo de reloj, usando desplazamientos de bits.</p>
              </div>
            </details>
          </div>
        </div>

        {/* Guía Paso a Paso */}
        <div className="edu-guide-section">
          <h3 className="edu-section-title">📋 Guía: Convierte decimal a binario manualmente</h3>
          <ol className="edu-steps-list">
            <li className="edu-step-item">
              <div className="edu-step-number">1</div>
              <div className="edu-step-content">
                <strong>Toma el número decimal</strong>
                <span>Ejemplo: 42. Lo dividiremos repetidamente entre 2 hasta llegar a 0.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">2</div>
              <div className="edu-step-content">
                <strong>Divide entre 2 y anota el resto</strong>
                <span>42 ÷ 2 = 21 resto 0 → 21 ÷ 2 = 10 resto 1 → 10 ÷ 2 = 5 resto 0</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">3</div>
              <div className="edu-step-content">
                <strong>Continúa dividiendo</strong>
                <span>5 ÷ 2 = 2 resto 1 → 2 ÷ 2 = 1 resto 0 → 1 ÷ 2 = 0 resto 1</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">4</div>
              <div className="edu-step-content">
                <strong>Lee los restos de abajo hacia arriba</strong>
                <span>Los restos obtenidos fueron: 0, 1, 0, 1, 0, 1. Leídos al revés: 101010.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">5</div>
              <div className="edu-step-content">
                <strong>Verifica el resultado</strong>
                <span>101010 en binario = 32+8+2 = 42 ✓. Puedes verificar sumando las potencias de 2 de cada bit en 1.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">6</div>
              <div className="edu-step-content">
                <strong>Practica con la herramienta</strong>
                <span>Usa el conversor de arriba para confirmar tus cálculos manuales. Prueba con letras para ver cómo ASCII conecta caracteres con números.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* Tips Grid */}
        <div className="edu-tips-section">
          <h3 className="edu-section-title">💡 Consejos para Dominar el Binario</h3>
          <div className="edu-tips-grid">
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🧠</span>
              <h4>Memoriza potencias de 2</h4>
              <p>1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024. Son la base de todo. Con práctica, los reconocerás automáticamente.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">⚡</span>
              <h4>Hex como atajo</h4>
              <p>Agrupa los bits en grupos de 4 y convierte cada grupo a hex. 1111 0000 = F0. Mucho más rápido que leer 8 bits individuales.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🏷️</span>
              <h4>Prefijos estándar</h4>
              <p>En código: 0b101010 (binario), 0x2A (hex), 0o52 (octal). Muchos lenguajes como Python, JavaScript y C los soportan nativamente.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">📚</span>
              <h4>ASCII de memoria</h4>
              <p>&apos;A&apos;=65, &apos;a&apos;=97 (diferencia de 32=00100000, el bit 5). Los dígitos &apos;0&apos;–&apos;9&apos; van de 48 a 57. Fácil de recordar.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🔢</span>
              <h4>Truco para binario rápido</h4>
              <p>Para saber si un número es par o impar en binario, mira solo el último bit: 0=par, 1=impar. Los desplazamientos de bits multiplican y dividen por 2.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🎯</span>
              <h4>Máscaras de bits</h4>
              <p>Usa AND para leer bits, OR para activarlos, XOR para invertirlos. Ejemplo: valor & 0b00001111 extrae los 4 bits menos significativos (nibble bajo).</p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="edu-warning-box">
          <h4 className="edu-warning-title">⚠️ Limitaciones de esta herramienta</h4>
          <ul className="edu-warning-list">
            <li><strong>ASCII de 8 bits solamente</strong>: Esta herramienta convierte cada carácter a su valor ASCII estándar (0–255). No soporta Unicode completo.</li>
            <li><strong>Caracteres especiales</strong>: Las tildes (á, é, í...) y la ñ tienen códigos superiores a 127 y pueden variar según la codificación del sistema.</li>
            <li><strong>No confundir base 16 con base 2</strong>: El hexadecimal mostrado es equivalente al binario pero más compacto; no son sistemas diferentes de datos.</li>
            <li><strong>Sin soporte de negativos</strong>: Los números negativos (complemento a dos) no están implementados en esta versión del conversor.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-binario')} />

      <ShareCard appName="conversor-binario" />
      <Footer appName="conversor-binario" />
    </div>
  );
}
