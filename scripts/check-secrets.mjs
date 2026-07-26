#!/usr/bin/env node
/**
 * Guardián de secretos — meskeIA
 *
 * Analiza un diff de git recibido por entrada estándar y bloquea el commit si
 * detecta credenciales, tokens o rutas privadas. Una clave que llega a un
 * repositorio público es irreversible: borrarla en el commit siguiente NO la
 * elimina del historial, hay que rotarla.
 *
 * Solo inspecciona las líneas AÑADIDAS, de modo que el contenido ya existente
 * en el repositorio nunca genera ruido.
 *
 * Uso (ver package.json):
 *   npm run check:secrets    → lo que está preparado para commit (lo que ejecuta el hook)
 *   npm run audit:secrets    → auditoría de todo el repositorio contra el árbol vacío
 *
 * Códigos de salida: 0 = limpio · 1 = hallazgos (aborta el commit)
 *
 * Escape puntual (falso positivo): añadir el comentario `pragma: allowlist-secret`
 * en la misma línea, o saltarse el hook con `git commit --no-verify`.
 */

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

/** Marca para silenciar una línea concreta que es un falso positivo legítimo. */
const PRAGMA_PERMITIR = 'pragma: allowlist-secret';

/**
 * Rutas privadas que nunca deben subirse al repositorio público.
 * Ya están en .gitignore, pero `git add -f` las saltaría sin este control.
 */
const RUTAS_PROHIBIDAS = [
  { patron: /^_private\//, motivo: 'Documentación estratégica privada' },
  { patron: /^_backups\//, motivo: 'Dumps de la base de datos Turso' },
  { patron: /^\.credentials\//, motivo: 'Credenciales de service accounts' },
  { patron: /^scratch\//, motivo: 'Directorio de trabajo temporal' },
  { patron: /^digests\//, motivo: 'Serie histórica de analytics' },
  { patron: /^cruce-seo\//, motivo: 'Serie histórica de medición SEO externa' },
  { patron: /^semillas\//, motivo: 'Bitácora de ideas de la semilla diaria' },
];

/**
 * Archivos peligrosos por su propio nombre, con independencia del contenido.
 * `.env.example` se permite explícitamente: es la plantilla sin valores reales.
 */
const NOMBRES_PROHIBIDOS = [
  { patron: /(^|\/)\.env($|\.(?!example))/, motivo: 'Archivo de variables de entorno' },
  { patron: /\.(pem|key|p12|pfx|keystore|jks)$/i, motivo: 'Material criptográfico' },
  { patron: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/, motivo: 'Clave SSH privada' },
  { patron: /(^|\/)(credentials|client_secret)[^/]*\.json$/i, motivo: 'Archivo de credenciales' },
  { patron: /service[-_]?account[^/]*\.json$/i, motivo: 'Service account de Google Cloud' },
  { patron: /\.(sqlite|sqlite3|db)$/i, motivo: 'Base de datos local (puede contener datos personales)' },
];

/**
 * Archivos excluidos del análisis de contenido por generar ruido sistemático:
 * lockfiles (hashes base64 largos) y la clave pública de IndexNow, que es
 * pública por diseño y vive en public/<clave>.txt.
 */
const EXCLUIDOS_DEL_CONTENIDO = [
  /(^|\/)package-lock\.json$/,
  /(^|\/)(yarn|pnpm)-lock\.yaml$/,
  /^public\/[0-9a-f]{32}\.txt$/, // clave IndexNow: pública por diseño
];

/** Detectores de alta confianza: el formato identifica al proveedor sin ambigüedad. */
const DETECTORES = [
  { nombre: 'Clave de API de Anthropic', regex: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { nombre: 'Clave de API de OpenAI', regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/ },
  { nombre: 'Token JWT (posible TURSO_AUTH_TOKEN)', regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { nombre: 'URL de Turso con token embebido', regex: /libsql:\/\/[^\s"'`]*authToken=[A-Za-z0-9._-]+/ },
  { nombre: 'Clave de API de Google', regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { nombre: 'Secreto de cliente OAuth de Google', regex: /\bGOCSPX-[A-Za-z0-9_-]{20,}/ },
  { nombre: 'Service account de Google Cloud', regex: /"type"\s*:\s*"service_account"/ },
  { nombre: 'Clave privada en formato PEM', regex: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/ },
  { nombre: 'Token de acceso de GitHub', regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/ },
  { nombre: 'Token personal de GitHub', regex: /\bgithub_pat_[A-Za-z0-9_]{50,}/ },
  { nombre: 'Clave de API de Resend', regex: /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{20,}/ },
  { nombre: 'Clave de acceso de AWS', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { nombre: 'Token de Slack', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
];

/**
 * Detector genérico: asignación de una variable con pinta de secreto a un
 * literal largo. Es el que más falsos positivos puede dar, así que se filtra
 * con VALORES_INOCUOS y solo se aplica a archivos de código y configuración.
 */
const REGEX_ASIGNACION_SOSPECHOSA =
  /\b([A-Za-z_]*(?:API[_-]?KEY|APIKEY|SECRET|AUTH[_-]?TOKEN|ACCESS[_-]?KEY|PASSWORD|PASSWD|PRIVATE[_-]?KEY)[A-Za-z_]*)\s*[:=]\s*['"`]([^'"`\n]{20,})['"`]/gi;

const EXTENSIONES_CODIGO = /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|toml|ini|sh|bat|ps1|env)$/i;

/** Valores que parecen secretos pero son marcadores de posición o referencias. */
const VALORES_INOCUOS = [
  /process\.env\./,
  /^\$\{/,
  /^<[^>]*>$/,
  /\b(?:tu|your|my)[_-]?(?:clave|key|token|secret|api)/i,
  /(?:xxx|yyy|zzz|aaaa|1234567890|abcdef)/i,
  /(?:example|ejemplo|placeholder|changeme|cambiar|dummy|fake|sample|test|demo|redacted|oculto)/i,
  /^\*+$/,
  /^[A-Z][A-Z0-9_]{19,}$/, // parece un nombre de variable, no un valor
  /\.{3}/, // "sk-ant-api03-..." truncado en documentación
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const color = {
  rojo: (t) => `\x1b[31m${t}\x1b[0m`,
  amarillo: (t) => `\x1b[33m${t}\x1b[0m`,
  verde: (t) => `\x1b[32m${t}\x1b[0m`,
  gris: (t) => `\x1b[90m${t}\x1b[0m`,
  negrita: (t) => `\x1b[1m${t}\x1b[0m`,
};

function redactar(valor) {
  const texto = String(valor);
  return texto.length <= 10 ? '***' : `${texto.slice(0, 6)}…${texto.slice(-2)} (${texto.length} car.)`;
}

function esInocuo(valor) {
  return VALORES_INOCUOS.some((patron) => patron.test(valor));
}

/** Lee toda la entrada estándar como texto. */
async function leerEntrada() {
  const trozos = [];
  for await (const trozo of process.stdin) trozos.push(trozo);
  return Buffer.concat(trozos).toString('utf8');
}

// ---------------------------------------------------------------------------
// Análisis
// ---------------------------------------------------------------------------

function analizarRuta(ruta) {
  const hallazgos = [];
  for (const { patron, motivo } of RUTAS_PROHIBIDAS) {
    if (patron.test(ruta)) hallazgos.push({ ruta, tipo: `Ruta privada — ${motivo}` });
  }
  for (const { patron, motivo } of NOMBRES_PROHIBIDOS) {
    if (patron.test(ruta)) hallazgos.push({ ruta, tipo: `Archivo sensible — ${motivo}` });
  }
  return hallazgos;
}

function analizarLinea(ruta, numeroLinea, texto) {
  if (texto.includes(PRAGMA_PERMITIR)) return [];
  if (EXCLUIDOS_DEL_CONTENIDO.some((patron) => patron.test(ruta))) return [];

  const hallazgos = [];

  for (const { nombre, regex } of DETECTORES) {
    const coincidencia = regex.exec(texto);
    if (coincidencia) {
      hallazgos.push({ ruta, linea: numeroLinea, tipo: nombre, muestra: redactar(coincidencia[0]) });
    }
  }

  if (EXTENSIONES_CODIGO.test(ruta)) {
    REGEX_ASIGNACION_SOSPECHOSA.lastIndex = 0;
    let coincidencia;
    while ((coincidencia = REGEX_ASIGNACION_SOSPECHOSA.exec(texto)) !== null) {
      const [, variable, valor] = coincidencia;
      if (esInocuo(valor)) continue;
      hallazgos.push({
        ruta,
        linea: numeroLinea,
        tipo: `Asignación sospechosa a «${variable}»`,
        muestra: redactar(valor),
      });
    }
  }

  return hallazgos;
}

/**
 * Recorre un diff unificado y analiza las rutas de destino y las líneas añadidas.
 * Requiere que git se invoque con `--unified=0` y `core.quotepath=false`.
 */
function analizarDiff(diff) {
  const hallazgos = [];
  const rutasVistas = new Set();
  let rutaActual = null;
  let numeroLinea = 0;

  for (const linea of diff.split(/\r?\n/)) {
    if (linea.startsWith('+++ ')) {
      const destino = linea.slice(4).trim();
      rutaActual = destino === '/dev/null' ? null : destino.replace(/^b\//, '');
      if (rutaActual && !rutasVistas.has(rutaActual)) {
        rutasVistas.add(rutaActual);
        hallazgos.push(...analizarRuta(rutaActual));
      }
      continue;
    }

    if (linea.startsWith('@@')) {
      const cabecera = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(linea);
      numeroLinea = cabecera ? Number(cabecera[1]) : 0;
      continue;
    }

    if (rutaActual && linea.startsWith('+') && !linea.startsWith('+++')) {
      hallazgos.push(...analizarLinea(rutaActual, numeroLinea, linea.slice(1)));
      numeroLinea += 1;
    }
  }

  return { hallazgos: deduplicar(hallazgos), totalArchivos: rutasVistas.size };
}

/**
 * Un mismo valor puede activar varios detectores a la vez (por ejemplo, una
 * clave de Anthropic encaja también en el patrón genérico de asignación).
 * Se conserva solo el primer hallazgo, que es el más específico.
 */
function deduplicar(hallazgos) {
  const vistos = new Set();
  return hallazgos.filter((h) => {
    const clave = `${h.ruta}|${h.linea ?? ''}|${h.muestra ?? h.tipo}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------------

const diff = await leerEntrada();

if (!diff.trim()) {
  console.log(color.gris('✓ [secretos] Sin cambios que analizar.'));
  process.exit(0);
}

const { hallazgos, totalArchivos } = analizarDiff(diff);

if (hallazgos.length === 0) {
  console.log(
    color.verde('✓ [secretos]') +
      color.gris(` ${totalArchivos} archivo(s) analizado(s), sin credenciales detectadas.`)
  );
  process.exit(0);
}

console.error('');
console.error(color.rojo(color.negrita('  ✖ COMMIT BLOQUEADO — posibles credenciales detectadas')));
console.error('');
for (const h of hallazgos) {
  const ubicacion = h.linea ? `${h.ruta}:${h.linea}` : h.ruta;
  console.error(`  ${color.amarillo(h.tipo)}`);
  console.error(`    ${ubicacion}${h.muestra ? color.gris(`  →  ${h.muestra}`) : ''}`);
}
console.error('');
console.error(color.negrita('  Qué hacer:'));
console.error('    1. Si es una credencial real: sácala del código, llévala a .env.local');
console.error('       y a las variables de entorno de Vercel. Si ya se había usado, ROTARLA.');
console.error(`    2. Si es un falso positivo: añade ${color.gris(`«${PRAGMA_PERMITIR}»`)} en esa línea`);
console.error('       o ajusta los patrones en scripts/check-secrets.mjs.');
console.error(`    3. Para saltarte el control puntualmente: ${color.gris('git commit --no-verify')}`);
console.error('');
process.exit(1);
