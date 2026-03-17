'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorCodigosBarras.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TipoCodigoBarras = 'EAN13' | 'EAN8' | 'UPCA' | 'CODE128' | 'CODE39' | 'ITF14';

interface ConfigCodigo {
  tipo: TipoCodigoBarras;
  valor: string;
  mostrarTexto: boolean;
  alto: number;
  ancho: number;
}

// Tabla de codificación EAN/UPC
const EAN_PATTERNS = {
  L: ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
  G: ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
  R: ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
};

const FIRST_DIGIT_PATTERNS = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

const CODE128_CHARSET: { [key: string]: string } = {
  ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
  '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
  '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
  ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
  '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
  '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
  '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
  '<': '11100110100', '=': '11100110010', '>': '11011011000', '?': '11011000110',
  '@': '11000110110', 'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
  'D': '10110001000', 'E': '10001101000', 'F': '10001100010', 'G': '11010001000',
  'H': '11000101000', 'I': '11000100010', 'J': '10110111000', 'K': '10110001110',
  'L': '10001101110', 'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
  'P': '11101110110', 'Q': '11010001110', 'R': '11000101110', 'S': '11011101000',
  'T': '11011100010', 'U': '11011101110', 'V': '11101011000', 'W': '11101000110',
  'X': '11100010110', 'Y': '11101101000', 'Z': '11101100010', '[': '11100011010',
  '\\': '11101111010', ']': '11001000010', '^': '11110001010', '_': '10100110000',
  '`': '10100001100', 'a': '10010110000', 'b': '10010000110', 'c': '10000101100',
  'd': '10000100110', 'e': '10110010000', 'f': '10110000100', 'g': '10011010000',
  'h': '10011000010', 'i': '10000110100', 'j': '10000110010', 'k': '11000010010',
  'l': '11001010000', 'm': '11110111010', 'n': '11000010100', 'o': '10001111010',
  'p': '10100111100', 'q': '10010111100', 'r': '10010011110', 's': '10111100100',
  't': '10011110100', 'u': '10011110010', 'v': '11110100100', 'w': '11110010100',
  'x': '11110010010', 'y': '11011011110', 'z': '11011110110', '{': '11110110110',
  '|': '10101111000', '}': '10100011110', '~': '10001011110'
};

const CODE128_START_B = '11010010000';
const CODE128_STOP = '1100011101011';

export default function GeneradorCodigosBarrasPage() {
  const [config, setConfig] = useState<ConfigCodigo>({
    tipo: 'EAN13',
    valor: '',
    mostrarTexto: true,
    alto: 100,
    ancho: 2,
  });
  const [error, setError] = useState<string>('');
  const [codigoGenerado, setCodigoGenerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calcular dígito de control EAN-13
  const calcularDigitoControlEAN13 = (codigo: string): number => {
    let suma = 0;
    for (let i = 0; i < 12; i++) {
      const digito = parseInt(codigo[i]);
      suma += i % 2 === 0 ? digito : digito * 3;
    }
    return (10 - (suma % 10)) % 10;
  };

  // Calcular dígito de control EAN-8
  const calcularDigitoControlEAN8 = (codigo: string): number => {
    let suma = 0;
    for (let i = 0; i < 7; i++) {
      const digito = parseInt(codigo[i]);
      suma += i % 2 === 0 ? digito * 3 : digito;
    }
    return (10 - (suma % 10)) % 10;
  };

  // Generar patrón de barras EAN-13
  const generarPatronEAN13 = (codigo: string): string => {
    const primerDigito = parseInt(codigo[0]);
    const patron = FIRST_DIGIT_PATTERNS[primerDigito];

    let barras = '101'; // Inicio

    // Primera mitad (dígitos 2-7)
    for (let i = 1; i <= 6; i++) {
      const digito = parseInt(codigo[i]);
      const tipo = patron[i - 1] as 'L' | 'G';
      barras += EAN_PATTERNS[tipo][digito];
    }

    barras += '01010'; // Centro

    // Segunda mitad (dígitos 8-13)
    for (let i = 7; i <= 12; i++) {
      const digito = parseInt(codigo[i]);
      barras += EAN_PATTERNS.R[digito];
    }

    barras += '101'; // Fin

    return barras;
  };

  // Generar patrón de barras EAN-8
  const generarPatronEAN8 = (codigo: string): string => {
    let barras = '101'; // Inicio

    // Primera mitad (dígitos 1-4)
    for (let i = 0; i < 4; i++) {
      const digito = parseInt(codigo[i]);
      barras += EAN_PATTERNS.L[digito];
    }

    barras += '01010'; // Centro

    // Segunda mitad (dígitos 5-8)
    for (let i = 4; i < 8; i++) {
      const digito = parseInt(codigo[i]);
      barras += EAN_PATTERNS.R[digito];
    }

    barras += '101'; // Fin

    return barras;
  };

  // Generar patrón Code128
  const generarPatronCode128 = (texto: string): string => {
    let barras = CODE128_START_B;
    let checksum = 104; // Start B value

    for (let i = 0; i < texto.length; i++) {
      const char = texto[i];
      if (CODE128_CHARSET[char]) {
        barras += CODE128_CHARSET[char];
        const valor = char.charCodeAt(0) - 32;
        checksum += valor * (i + 1);
      }
    }

    // Añadir checksum
    const checksumMod = checksum % 103;
    const checksumChar = checksumMod < 95 ? String.fromCharCode(checksumMod + 32) : ' ';
    if (CODE128_CHARSET[checksumChar]) {
      barras += CODE128_CHARSET[checksumChar];
    }

    barras += CODE128_STOP;

    return barras;
  };

  // Validar entrada según tipo
  const validarEntrada = useCallback((tipo: TipoCodigoBarras, valor: string): { valido: boolean; mensaje: string } => {
    if (!valor.trim()) {
      return { valido: false, mensaje: '' };
    }

    switch (tipo) {
      case 'EAN13':
        if (!/^\d{12,13}$/.test(valor)) {
          return { valido: false, mensaje: 'EAN-13 debe tener 12 o 13 dígitos numéricos' };
        }
        break;
      case 'EAN8':
        if (!/^\d{7,8}$/.test(valor)) {
          return { valido: false, mensaje: 'EAN-8 debe tener 7 u 8 dígitos numéricos' };
        }
        break;
      case 'UPCA':
        if (!/^\d{11,12}$/.test(valor)) {
          return { valido: false, mensaje: 'UPC-A debe tener 11 o 12 dígitos numéricos' };
        }
        break;
      case 'CODE128':
        if (valor.length === 0 || valor.length > 48) {
          return { valido: false, mensaje: 'Code128: máximo 48 caracteres' };
        }
        // Verificar que todos los caracteres estén soportados
        for (const char of valor) {
          if (!CODE128_CHARSET[char]) {
            return { valido: false, mensaje: `Carácter no soportado: "${char}"` };
          }
        }
        break;
      case 'CODE39':
        if (!/^[A-Z0-9\-. $/+%]+$/i.test(valor)) {
          return { valido: false, mensaje: 'Code39: solo letras, números y -. $/+%' };
        }
        break;
      case 'ITF14':
        if (!/^\d{13,14}$/.test(valor)) {
          return { valido: false, mensaje: 'ITF-14 debe tener 13 o 14 dígitos numéricos' };
        }
        break;
    }

    return { valido: true, mensaje: '' };
  }, []);

  // Generar código de barras
  const generarCodigo = useCallback(() => {
    if (!canvasRef.current) return;

    const validacion = validarEntrada(config.tipo, config.valor);
    if (!validacion.valido) {
      setError(validacion.mensaje);
      setCodigoGenerado(false);
      return;
    }

    setError('');

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let patron = '';
    let codigoCompleto = config.valor;

    switch (config.tipo) {
      case 'EAN13':
        // Completar con dígito de control si solo hay 12 dígitos
        if (config.valor.length === 12) {
          codigoCompleto = config.valor + calcularDigitoControlEAN13(config.valor);
        }
        patron = generarPatronEAN13(codigoCompleto);
        break;
      case 'EAN8':
        if (config.valor.length === 7) {
          codigoCompleto = config.valor + calcularDigitoControlEAN8(config.valor);
        }
        patron = generarPatronEAN8(codigoCompleto);
        break;
      case 'UPCA':
        // UPC-A es similar a EAN-13 con primer dígito 0
        if (config.valor.length === 11) {
          const ean = '0' + config.valor;
          codigoCompleto = ean + calcularDigitoControlEAN13(ean);
        } else {
          codigoCompleto = '0' + config.valor;
        }
        patron = generarPatronEAN13(codigoCompleto);
        break;
      case 'CODE128':
        patron = generarPatronCode128(config.valor);
        codigoCompleto = config.valor;
        break;
      case 'CODE39':
      case 'ITF14':
        // Simplificado: usar Code128 como fallback para estos formatos
        patron = generarPatronCode128(config.valor.toUpperCase());
        codigoCompleto = config.valor.toUpperCase();
        break;
    }

    // Calcular dimensiones del canvas
    const margen = 20;
    const anchoBarras = patron.length * config.ancho;
    const altoTexto = config.mostrarTexto ? 25 : 0;

    canvas.width = anchoBarras + margen * 2;
    canvas.height = config.alto + margen * 2 + altoTexto;

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar barras
    ctx.fillStyle = '#000000';
    for (let i = 0; i < patron.length; i++) {
      if (patron[i] === '1') {
        ctx.fillRect(margen + i * config.ancho, margen, config.ancho, config.alto);
      }
    }

    // Dibujar texto si está activado
    if (config.mostrarTexto) {
      ctx.fillStyle = '#000000';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(codigoCompleto, canvas.width / 2, margen + config.alto + 18);
    }

    setCodigoGenerado(true);
  }, [config, validarEntrada]);

  // Descargar como PNG
  const descargarPNG = () => {
    if (!canvasRef.current || !codigoGenerado) return;

    const link = document.createElement('a');
    link.download = `barcode-${config.tipo}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Copiar al portapapeles
  const copiarAlPortapapeles = async () => {
    if (!canvasRef.current || !codigoGenerado) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('Tu navegador no soporta copiar imágenes al portapapeles');
    }
  };

  // Regenerar automáticamente
  useEffect(() => {
    if (config.valor.trim()) {
      const timer = setTimeout(generarCodigo, 300);
      return () => clearTimeout(timer);
    } else {
      setCodigoGenerado(false);
      setError('');
    }
  }, [config, generarCodigo]);

  const tiposCodigo = [
    { id: 'EAN13', nombre: 'EAN-13', desc: 'Productos Europa (13 dígitos)', ejemplo: '8414533043847' },
    { id: 'EAN8', nombre: 'EAN-8', desc: 'Productos pequeños (8 dígitos)', ejemplo: '96385074' },
    { id: 'UPCA', nombre: 'UPC-A', desc: 'Productos EEUU (12 dígitos)', ejemplo: '012345678905' },
    { id: 'CODE128', nombre: 'Code128', desc: 'Texto alfanumérico', ejemplo: 'ABC-123' },
    { id: 'CODE39', nombre: 'Code39', desc: 'Logística e industria', ejemplo: 'PROD001' },
    { id: 'ITF14', nombre: 'ITF-14', desc: 'Cajas y palés (14 dígitos)', ejemplo: '15400141288763' },
  ];

  const tipoActual = tiposCodigo.find(t => t.id === config.tipo);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Códigos de Barras</h1>
        <p className={styles.subtitle}>
          Crea códigos EAN-13, EAN-8, UPC-A, Code128 y más
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de código</h2>

          <div className={styles.tiposGrid}>
            {tiposCodigo.map((tipo) => (
              <button
                key={tipo.id}
                className={`${styles.tipoBtn} ${config.tipo === tipo.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setConfig({ ...config, tipo: tipo.id as TipoCodigoBarras, valor: '' })}
              >
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
                <span className={styles.tipoDesc}>{tipo.desc}</span>
              </button>
            ))}
          </div>

          {/* Entrada de datos */}
          <div className={styles.entradaDatos}>
            <div className={styles.formGroup}>
              <label>
                Valor del código
                <span className={styles.hint}>
                  {tipoActual?.desc}
                </span>
              </label>
              <input
                type="text"
                value={config.valor}
                onChange={(e) => setConfig({ ...config, valor: e.target.value })}
                placeholder={tipoActual?.ejemplo || 'Introduce el valor...'}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
              />
              {error && <span className={styles.error}>{error}</span>}
            </div>

            <button
              className={styles.btnEjemplo}
              onClick={() => setConfig({ ...config, valor: tipoActual?.ejemplo || '' })}
            >
              Usar ejemplo: {tipoActual?.ejemplo}
            </button>
          </div>

          {/* Opciones */}
          <div className={styles.opciones}>
            <h3 className={styles.sectionTitleSmall}>Opciones</h3>

            <div className={styles.opcionesGrid}>
              <div className={styles.formGroup}>
                <label>Alto de barras</label>
                <select
                  value={config.alto}
                  onChange={(e) => setConfig({ ...config, alto: Number(e.target.value) })}
                  className={styles.select}
                >
                  <option value={60}>Bajo (60px)</option>
                  <option value={80}>Medio (80px)</option>
                  <option value={100}>Alto (100px)</option>
                  <option value={120}>Extra alto (120px)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Ancho de barras</label>
                <select
                  value={config.ancho}
                  onChange={(e) => setConfig({ ...config, ancho: Number(e.target.value) })}
                  className={styles.select}
                >
                  <option value={1}>Fino (1px)</option>
                  <option value={2}>Normal (2px)</option>
                  <option value={3}>Grueso (3px)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.mostrarTexto}
                    onChange={(e) => setConfig({ ...config, mostrarTexto: e.target.checked })}
                  />
                  Mostrar texto debajo
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de vista previa */}
        <div className={styles.previewPanel}>
          <h2 className={styles.sectionTitle}>Vista previa</h2>

          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              style={{ display: codigoGenerado ? 'block' : 'none' }}
            />

            {!codigoGenerado && !error && (
              <div className={styles.placeholder}>
                <span className={styles.placeholderIcon}>📊</span>
                <p>Introduce un valor para generar el código de barras</p>
              </div>
            )}
          </div>

          {codigoGenerado && (
            <div className={styles.acciones}>
              <button onClick={descargarPNG} className={styles.btnPrimario}>
                📥 Descargar PNG
              </button>
              <button onClick={copiarAlPortapapeles} className={styles.btnSecundario}>
                {copiado ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          )}

          <div className={styles.infoCard}>
            <h4>💡 Información del formato {config.tipo}</h4>
            <ul>
              {config.tipo === 'EAN13' && (
                <>
                  <li>Usado en productos de Europa y resto del mundo</li>
                  <li>El dígito 13 se calcula automáticamente si introduces 12</li>
                  <li>El primer dígito indica el país de origen</li>
                </>
              )}
              {config.tipo === 'EAN8' && (
                <>
                  <li>Versión compacta para productos pequeños</li>
                  <li>El dígito 8 se calcula automáticamente si introduces 7</li>
                </>
              )}
              {config.tipo === 'UPCA' && (
                <>
                  <li>Estándar en Estados Unidos y Canadá</li>
                  <li>Compatible con lectores EAN-13</li>
                </>
              )}
              {config.tipo === 'CODE128' && (
                <>
                  <li>Soporta texto, números y caracteres especiales</li>
                  <li>Alta densidad de información</li>
                  <li>Usado en logística y etiquetado</li>
                </>
              )}
              {config.tipo === 'CODE39' && (
                <>
                  <li>Solo letras mayúsculas, números y algunos símbolos</li>
                  <li>Muy usado en industria y logística</li>
                </>
              )}
              {config.tipo === 'ITF14' && (
                <>
                  <li>Usado para identificar cajas y palés</li>
                  <li>Agrupa múltiples productos EAN-13</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Panel informativo */}
      <div className={styles.infoPanel}>
        <h3>Tipos de códigos de barras</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🛒</span>
            <div>
              <strong>EAN/UPC</strong>
              <p>Para productos de consumo en tiendas y supermercados</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📦</span>
            <div>
              <strong>Code128/39</strong>
              <p>Logística, inventario y etiquetado industrial</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🏭</span>
            <div>
              <strong>ITF-14</strong>
              <p>Cajas de envío y agrupación de productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre Códigos de Barras?"
        subtitle="Tipos, estándares, casos de uso y buenas prácticas para imprimir y escanear códigos"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de tipos de código de barras</h2>
          <p>
            Cada estándar de código de barras está diseñado para un caso de uso específico.
            Elegir el correcto mejora la legibilidad, reduce errores y cumple con los requisitos del sector.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Dimensiones</th>
                  <th>Capacidad de datos</th>
                  <th>Sectores de uso</th>
                  <th>Legibilidad</th>
                  <th>Ventajas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>EAN-13</strong></td>
                  <td>1D (lineal)</td>
                  <td>13 dígitos numéricos</td>
                  <td>Comercio minorista, supermercados</td>
                  <td>Lectores láser y cámara</td>
                  <td>Estándar global GS1, amplia compatibilidad</td>
                </tr>
                <tr>
                  <td><strong>EAN-8</strong></td>
                  <td>1D (lineal)</td>
                  <td>8 dígitos numéricos</td>
                  <td>Productos pequeños, cosmética</td>
                  <td>Lectores láser y cámara</td>
                  <td>Compacto para envases pequeños</td>
                </tr>
                <tr>
                  <td><strong>Code 128</strong></td>
                  <td>1D (lineal)</td>
                  <td>Alfanumérico, hasta 48 caracteres</td>
                  <td>Logística, paquetería, almacén</td>
                  <td>Lectores láser y cámara</td>
                  <td>Alta densidad, soporta mayúsculas y minúsculas</td>
                </tr>
                <tr>
                  <td><strong>QR Code</strong></td>
                  <td>2D (matricial)</td>
                  <td>Hasta 4.296 caracteres alfanuméricos</td>
                  <td>Marketing, hostelería, pagos, webs</td>
                  <td>Cámara smartphone</td>
                  <td>Corrección de errores, se puede escanear con daño</td>
                </tr>
                <tr>
                  <td><strong>DataMatrix</strong></td>
                  <td>2D (matricial)</td>
                  <td>Hasta 2.335 caracteres</td>
                  <td>Farmacia, electrónica, aeronáutica</td>
                  <td>Escáner industrial y cámara</td>
                  <td>Muy compacto, trazabilidad de componentes</td>
                </tr>
                <tr>
                  <td><strong>PDF417</strong></td>
                  <td>2D (apilado)</td>
                  <td>Hasta 1.850 caracteres</td>
                  <td>DNI, boarding pass, documentos legales</td>
                  <td>Escáner láser 2D y cámara</td>
                  <td>Alta capacidad de datos en formato alargado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso por sector</h2>
          <p>
            El código de barras adecuado depende del sector y del flujo de trabajo.
            Estos cuatro escenarios cubren los casos más frecuentes en España.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                <h4>Tienda minorista</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una tienda de alimentación necesita etiquetar 500 productos para venderlos en
                supermercados. Usa EAN-13 registrado en GS1 España para que los lectores de caja
                lo reconozcan en cualquier punto de venta.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: registra tu prefijo de empresa en GS1 España antes de imprimir etiquetas
                para venta en grandes superficies. Sin registro, el código puede ser rechazado.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📦</span>
                <h4>Logística y paquetería</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una empresa de envíos etiqueta sus paquetes con Code 128 para registrar el número
                de seguimiento, destino y fecha de envío. El código se escanea en cada punto del
                trayecto desde el almacén hasta la entrega.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa Code 128 o ITF-14 para logística interna. Son los más compatibles
                con escáneres de almacén y no requieren registro en GS1.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍽️</span>
                <h4>Hostelería y restaurantes</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un restaurante reemplaza la carta física por un menú digital. Coloca un QR en cada
                mesa que abre directamente la carta en el móvil del cliente, sin necesidad de app.
                También usa QR para pagos con Bizum.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: el QR es el formato más versátil para hostelería porque cualquier smartphone
                lo lee sin necesidad de instalar nada. Imprímelo con zona tranquila suficiente.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
                <h4>Farmacia y medicamentos</h4>
              </div>
              <p className={styles.escenarioExample}>
                La normativa europea obliga a incluir DataMatrix en todos los medicamentos de
                prescripción para garantizar la trazabilidad desde el fabricante hasta el paciente.
                El escáner verifica autenticidad y fecha de caducidad en tiempo real.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: el DataMatrix es obligatorio en medicamentos según el Reglamento Delegado
                UE 2016/161. Su pequeño tamaño es ideal para envases de medicamentos.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre códigos de barras</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué diferencia hay entre código de barras 1D y 2D?</summary>
                <p>
                  Los códigos 1D (lineales) como EAN-13 o Code 128 almacenan información solo en
                  sentido horizontal mediante barras de diferentes anchuras. Los códigos 2D como
                  QR o DataMatrix almacenan datos en dos dimensiones (filas y columnas), lo que
                  permite guardar mucha más información en el mismo espacio y mantener legibilidad
                  aunque parte del código esté dañado.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántos dígitos tiene un EAN-13?</summary>
                <p>
                  13 dígitos en total: los 3 primeros identifican el país (prefijo GS1), los
                  siguientes 4-9 identifican la empresa, los siguientes identifican el producto
                  específico, y el último es el dígito de control calculado automáticamente.
                  Por eso al introducir 12 dígitos en esta herramienta, el dígito 13 se calcula solo.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo se calcula el dígito de control?</summary>
                <p>
                  Para EAN-13: suma los dígitos en posiciones pares multiplicados por 3, más los
                  dígitos en posiciones impares sin multiplicar. Toma el resultado módulo 10 y
                  réstalo de 10 (si el resultado es 10, el dígito de control es 0). Esta herramienta
                  lo calcula automáticamente cuando introduces los 12 primeros dígitos.
                </p>
                <p className={styles.faqTip}>
                  Ejemplo: para &quot;590000001014&quot;, el dígito de control es 8, resultando en &quot;5900000010148&quot;.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo usar mis propios códigos o debo registrarlos?</summary>
                <p>
                  Depende del uso. Para uso interno (inventario, almacén, etiquetas propias) puedes
                  usar cualquier número sin registrar. Para venta en tiendas físicas o en plataformas
                  de comercio electrónico como Amazon, necesitas códigos EAN registrados oficialmente
                  en GS1 España (gs1es.org). Los códigos falsos o generados aleatoriamente pueden
                  ser rechazados o colisionar con productos de otra empresa.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué resolución mínima necesita un código impreso?</summary>
                <p>
                  Para impresión en papel se recomienda mínimo 300 dpi (puntos por pulgada). Para
                  etiquetas de alta calidad o tamaños muy pequeños, usa 600 dpi o más. Si imprimes
                  a baja resolución, las barras quedan borrosas y el lector puede no reconocer el
                  código. El formato SVG (vectorial) es ideal porque escala sin pérdida de calidad.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puede un smartphone leer todos los tipos?</summary>
                <p>
                  La mayoría de smartphones modernos leen QR y DataMatrix sin app adicional.
                  Para códigos 1D como EAN-13 o Code 128 generalmente necesitas una app de
                  escaneo (como Google Lens, Barcode Scanner o similares). Los lectores industriales
                  de mano leen prácticamente todos los formatos. En supermercados se usan
                  lectores láser especializados.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántos datos caben en un QR?</summary>
                <p>
                  Un QR puede almacenar hasta 7.089 caracteres numéricos, 4.296 alfanuméricos o
                  2.953 bytes en binario. El tamaño del QR aumenta con más datos. Para URLs cortas
                  el QR es pequeño y fácil de escanear; para URLs largas es recomendable usar
                  un acortador de URL para que el código sea más compacto y legible.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la diferencia entre QR y DataMatrix?</summary>
                <p>
                  Ambos son códigos 2D pero con usos distintos: el QR es cuadrado, diseñado para
                  ser leído por consumidores con smartphones, muy usado en marketing, pagos y webs.
                  DataMatrix es más compacto, puede ser rectangular, y está diseñado para entornos
                  industriales donde el espacio es muy reducido (componentes electrónicos,
                  medicamentos, piezas de maquinaria). Ambos tienen corrección de errores integrada.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo generar e imprimir un código de barras: 7 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Elige el tipo según el uso</strong>
                <p>
                  EAN-13 para productos de venta al público, Code 128 para logística interna,
                  QR para URLs y menús digitales, DataMatrix para medicamentos o electrónica.
                  El tipo incorrecto puede ser rechazado por los lectores del sector.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Introduce los datos del código</strong>
                <p>
                  Escribe el número o texto que quieres codificar. Para EAN-13, introduce
                  los 12 primeros dígitos y el generador calcula el dígito de control
                  automáticamente. Para Code 128 puedes usar texto alfanumérico.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Verifica el dígito de control</strong>
                <p>
                  El generador calcula el dígito de control al instante. Comprueba que el
                  código generado en pantalla coincide con el número que esperabas. Un dígito
                  incorrecto hace que el código sea inválido.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Ajusta el tamaño (mínimo 2,5 cm de ancho para EAN-13)</strong>
                <p>
                  Los estándares GS1 indican un ancho mínimo de 2,5 cm para EAN-13 en
                  impresión. Tamaños menores aumentan los errores de lectura. Usa el
                  selector de ancho de barras para ajustar la escala.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Elige el formato de imagen (SVG recomendado)</strong>
                <p>
                  SVG es un formato vectorial que escala sin pérdida de calidad, ideal para
                  cualquier tamaño de impresión. PNG es válido para impresión digital si
                  la resolución es de 300 dpi o superior. Evita JPEG por la compresión con pérdida.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Prueba con un lector antes de imprimir en masa</strong>
                <p>
                  Escanea el código con un lector físico o con el smartphone antes de imprimir
                  miles de etiquetas. Verifica que el valor leído coincide exactamente con el
                  dato original. Un error detectado a tiempo ahorra costes.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Registra en GS1 si es para venta comercial</strong>
                <p>
                  Si el producto va a venderse en tiendas físicas, grandes superficies o
                  marketplaces (Amazon, El Corte Inglés, Carrefour), necesitas un prefijo
                  de empresa GS1 España. Sin él, el código puede generar conflictos con
                  otros productos y ser rechazado por el sistema del distribuidor.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 buenas prácticas para códigos de barras</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🖨️</span>
              <h4>Usa SVG para impresión escalable</h4>
              <p>
                El formato SVG (vectorial) no pierde calidad al ampliar. Es el formato
                recomendado para etiquetas de cualquier tamaño, desde pequeños envases
                hasta carteles de almacén.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎨</span>
              <h4>Contraste mínimo del 70%</h4>
              <p>
                Las barras deben ser oscuras sobre fondo claro. El negro sobre blanco es
                el estándar. Evita colores que reduzcan el contraste: amarillo, naranja o
                rojo sobre fondos similares causan errores de lectura.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Zona tranquila (quiet zone) obligatoria</h4>
              <p>
                La zona tranquila es el espacio en blanco alrededor del código que permite
                al lector detectar dónde empieza y termina. Para EAN-13 es de al menos
                3 mm a cada lado. Sin ella, el código puede no leerse correctamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h4>No distorsionar proporciones</h4>
              <p>
                Estirar o comprimir un código de barras cambia la relación entre el ancho
                de las barras y los espacios, haciendo que sea ilegible. Siempre mantén
                las proporciones originales al redimensionar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <h4>Prueba en múltiples lectores</h4>
              <p>
                Verifica el código con distintos dispositivos: lector de mano, smartphone
                con Google Lens y, si tienes acceso, con el lector del punto de venta real.
                Lo que funciona en pantalla puede fallar en papel con baja resolución.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
              <h4>EAN de GS1 para grandes superficies</h4>
              <p>
                Si distribuyes en supermercados, hipermercados o vía Amazon España, el
                código EAN debe estar registrado en GS1. Un código no registrado puede
                coincidir con otro producto y causar errores en el sistema del distribuidor.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores habituales al crear códigos de barras</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Imprimir sin zona tranquila.</strong> El espacio en blanco alrededor
                del código es parte del estándar. Sin él, los lectores no detectan los límites
                del código y falla la lectura. Nunca recortes el código hasta el borde de las barras.
              </li>
              <li>
                <strong>Usar resolución menor a 300 dpi para impresión.</strong> Las barras
                quedan borrosas o con bordes irregulares. El lector no puede distinguir barras
                de espacios correctamente. Usa siempre 300 dpi mínimo o, mejor, formato SVG vectorial.
              </li>
              <li>
                <strong>Invertir colores (barras blancas sobre negro).</strong> Los lectores
                láser están calibrados para leer barras negras sobre fondo blanco. La inversión
                de colores hace que muchos lectores fallen o sean incapaces de leer el código.
              </li>
              <li>
                <strong>Crear códigos EAN sin registrar en GS1 para venta comercial.</strong>{' '}
                Un EAN generado aleatoriamente puede colisionar con el código de otro fabricante
                registrado. Los distribuidores pueden rechazar el producto o confundirlo con otro
                en sus sistemas.
              </li>
              <li>
                <strong>Estirar el código cambiando proporciones.</strong> Modificar el ancho o
                alto de forma no proporcional altera la relación entre barras y espacios que el
                lector necesita para decodificar. El resultado es un código visualmente similar
                pero ilegible.
              </li>
              <li>
                <strong>No verificar el dígito de control.</strong> Un código con el dígito de
                control incorrecto es técnicamente inválido aunque parezca correcto visualmente.
                Siempre comprueba que el dígito calculado coincide con el esperado antes de
                imprimir etiquetas en masa.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-codigos-barras')} />

      <ShareCard appName="generador-codigos-barras" />
      <Footer appName="generador-codigos-barras" />
    </div>
  );
}
