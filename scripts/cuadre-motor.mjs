/**
 * cuadre-motor.mjs — las nueve reglas del Cuadre, sin git y sin disco
 *
 * Este fichero NO lee ficheros, NO llama a git y NO imprime nada: recibe el estado de un
 * conjunto de ficheros ANTES y DESPUÉS y devuelve los hechos que ha contado. Está aparte
 * justamente para poder tenderle trampas a mano en `scripts/pruebas/probar-cuadre.mjs`
 * sin tocar el repositorio ni preparar un clon.
 *
 * LA REGLA DE ORO DE TODAS LAS REGLAS
 * ───────────────────────────────────
 * Se comparan CONJUNTOS antes/después, nunca líneas del diff. Medido el 15/09/2026 sobre
 * los últimos 100 commits reales: leyendo líneas, el detector habría bloqueado 21 de 100,
 * porque un reformateo produce exactamente las mismas líneas que un borrado —añadir un
 * candado reescribe entera la línea "build" de package.json, y mover un <div role="alert">
 * lo borra y lo vuelve a escribir—. Comparando conjuntos, 8 de 400.
 *
 * Una regla que mira líneas cuenta tecleo. Una que compara conjuntos cuenta hechos.
 */

// ---------------------------------------------------------------------------
// Qué se vigila
// ---------------------------------------------------------------------------

/** Componentes y atributos cuya desaparición de un fichero es un hecho, no un detalle. */
const GUARDIAS = [
  ['<DisclaimerCard', 'DisclaimerCard'],
  ['<LegalNotice', 'LegalNotice'],
  ['<DataReference', 'DataReference'],
  ['<RegionBadge', 'RegionBadge'],
  ['<Footer', 'Footer'],
  ['<RelatedApps', 'RelatedApps'],
  ['<ShareCard', 'ShareCard'],
  ['role="alert"', 'role="alert"'],
  ['aria-live', 'aria-live'],
];

/**
 * Escapes AJENOS a la casa: los prohíbe el CLAUDE.md global y no obligan a escribir razón.
 * Los de la casa (`parser-ok:`, `a11y-ok:`, `minimo-ok:`, `og-ok:`, `hidratacion-ok:`,
 * `@disclaimer: exempt`) NO bloquean: su convención ya exige la razón al lado, que es
 * precisamente el rastro que el Cuadre busca. Se nombran en el acta y nada más.
 */
const ESCAPES_AJENOS = /@ts-ignore|eslint-disable|pragma: allowlist-secret/;
const ESCAPES_CASA = /parser-ok:|a11y-ok:|minimo-ok:|og-ok:|hidratacion-ok:|@disclaimer: exempt/;

/** Registros del catálogo: si pierden entradas, alguien ha retirado algo. */
const REGISTROS = [
  'data/applications.ts',
  'data/implemented-apps.ts',
  'data/app-relations.ts',
  'data/stemum.ts',
  'data/coquinum.ts',
];

/** Ficheros que el acta nombra cuando se tocan. No bloquean: se tocan a menudo y con motivo. */
const SENSIBLES = [
  /^next\.config\.ts$/,
  /^vercel\.json$/,
  /^\.gitignore$/,
  /^\.github\//,
  /^scripts\/check-[a-z-]+\.mjs$/,
  /^scripts\/install-hooks\.mjs$/,
  /^scripts\/cuadre/,
  /^app\/api\//,
  /^server\//,
  /^middleware\.ts$/,
];

// ---------------------------------------------------------------------------
// Utilidades sin estado
// ---------------------------------------------------------------------------

/** Cuenta cuántas veces aparece un literal en un texto. */
function apariciones(texto, literal) {
  if (!texto) return 0;
  let n = 0;
  let i = texto.indexOf(literal);
  while (i !== -1) {
    n += 1;
    i = texto.indexOf(literal, i + literal.length);
  }
  return n;
}

/** Líneas presentes en `despues` que no estaban (con ese mismo texto) en `antes`. */
function lineasNuevas(antes, despues) {
  const previas = new Set((antes || '').split('\n').map((l) => l.trim()));
  return (despues || '').split('\n').map((l) => l.trim()).filter((l) => l && !previas.has(l));
}

/** Claves de dependencias declaradas en un package.json. */
function dependencias(textoJson) {
  try {
    const p = JSON.parse(textoJson);
    return new Set([...Object.keys(p.dependencies || {}), ...Object.keys(p.devDependencies || {})]);
  } catch {
    return null; // JSON ilegible: no se inventa nada, la regla se abstiene
  }
}

/** Candados enganchados a la cadena de `npm run build`. */
function candadosDelBuild(textoJson) {
  try {
    const build = JSON.parse(textoJson).scripts?.build || '';
    return new Set(build.match(/scripts\/check-[a-z-]+\.mjs/g) || []);
  } catch {
    return null;
  }
}

/** Dominios https declarados en un fichero de configuración. */
function dominios(texto) {
  return new Set(((texto || '').match(/https:\/\/[a-z0-9.-]+/gi) || []).map((d) => d.toLowerCase()));
}

/**
 * Entradas de un registro del catálogo. Cuenta los `slug:` declarados, que es la forma que
 * tienen las cinco listas; si un registro no usa `slug:` se cae a contar las aperturas de
 * objeto, y si tampoco hay, la regla se abstiene devolviendo null.
 */
function entradasDeRegistro(texto) {
  if (!texto) return null;
  const porSlug = (texto.match(/^\s*slug:/gm) || []).length;
  if (porSlug > 0) return porSlug;
  const porObjeto = (texto.match(/^\s*\{\s*$/gm) || []).length;
  return porObjeto > 0 ? porObjeto : null;
}

/** El área a la que pertenece un fichero: una app es un área; si no, su carpeta de primer nivel. */
export function areaDe(ruta) {
  const app = ruta.match(/^app\/([^/]+)\//);
  if (app) return `app:${app[1]}`;
  const primera = ruta.split('/')[0];
  return ruta.includes('/') ? primera : '(raíz)';
}

/** Huella estable de un hallazgo, para que un visto bueno no haya que darlo dos veces. */
function huellaDe(regla, ruta, detalle) {
  const base = `${regla}|${ruta}|${detalle}`;
  let h = 0;
  for (let i = 0; i < base.length; i += 1) {
    h = (h * 31 + base.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// El contador
// ---------------------------------------------------------------------------

/**
 * Cuenta las sorpresas de un cambio.
 *
 * @param {object} entrada
 * @param {{ruta: string, estado: 'A'|'M'|'D'}[]} entrada.ficheros  qué se tocó
 * @param {(ruta: string) => string|null} entrada.leerAntes         contenido antes del cambio
 * @param {(ruta: string) => string|null} entrada.leerDespues       contenido después
 * @param {string[]} [entrada.ficherosFuera]  rutas escritas fuera del repositorio (del transcript)
 * @returns {{hallazgos: object[], notas: object[], radio: object}}
 */
export function contar({ ficheros, leerAntes, leerDespues, ficherosFuera = [] }) {
  const hallazgos = [];
  const notas = [];
  const anotar = (regla, ruta, detalle, texto) =>
    hallazgos.push({ regla, ruta, detalle, texto, huella: huellaDe(regla, ruta, detalle) });

  // ── R1 · Un fichero de tests desaparece ──────────────────────────────────
  // Un test borrado hace que el build pase MÁS fácil: es el fallo silencioso perfecto.
  // Precedentes en toda la historia del repositorio: 1, y era un generador de imágenes.
  for (const f of ficheros) {
    if (f.estado === 'D' && f.ruta.startsWith('tests/')) {
      anotar('test-borrado', f.ruta, '', `desapareció el test ${f.ruta}`);
    }
  }

  // ── R2 · Alta de fichero en la raíz del repositorio ──────────────────────
  // Precedentes en 200 commits: 0. Es la forma que tiene de colarse lo que nadie encargó.
  for (const f of ficheros) {
    if (f.estado === 'A' && !f.ruta.includes('/')) {
      anotar('fichero-en-raiz', f.ruta, '', `fichero nuevo en la raíz: ${f.ruta}`);
    }
  }

  const paquete = ficheros.find((f) => f.ruta === 'package.json' && f.estado !== 'D');
  if (paquete) {
    // ── R3 · Un candado sale de la cadena del build ───────────────────────
    const antes = candadosDelBuild(leerAntes('package.json'));
    const ahora = candadosDelBuild(leerDespues('package.json'));
    if (antes && ahora) {
      const fuera = [...antes].filter((c) => !ahora.has(c));
      for (const c of fuera) {
        anotar('candado-fuera-del-build', 'package.json', c, `${c} ya no lo ejecuta npm run build`);
      }
    }

    // ── R5 · Paquete nuevo ────────────────────────────────────────────────
    // Solo altas: subir la versión de algo que ya estaba no es una sorpresa, y es lo que
    // hace la mayoría de los commits que tocan este fichero.
    const depAntes = dependencias(leerAntes('package.json'));
    const depAhora = dependencias(leerDespues('package.json'));
    if (depAntes && depAhora) {
      const nuevas = [...depAhora].filter((d) => !depAntes.has(d));
      for (const d of nuevas) {
        anotar('dependencia-nueva', 'package.json', d, `dependencia nueva: ${d}`);
      }
    }
  }

  // ── R6 · Dominio que no estaba en la política anterior ───────────────────
  // check:csp exige que todo dominio cargado esté PERMITIDO; esto cuenta que sea NUEVO,
  // que es lo que aquel no puede ver: añadir la llamada y el permiso a la vez le cuadra.
  for (const cfg of ['next.config.ts', 'vercel.json']) {
    if (!ficheros.some((f) => f.ruta === cfg && f.estado !== 'D')) continue;
    const antes = dominios(leerAntes(cfg));
    const nuevos = [...dominios(leerDespues(cfg))].filter((d) => !antes.has(d));
    for (const d of nuevos) {
      anotar('dominio-nuevo', cfg, d, `dominio nuevo en la política: ${d}`);
    }
  }

  for (const f of ficheros) {
    if (f.estado !== 'M') continue;
    const antes = leerAntes(f.ruta);
    const despues = leerDespues(f.ruta);
    if (antes === null || despues === null) continue;

    // ── R7 · Una guardia cae a cero ───────────────────────────────────────
    // Acotada a app/ y components/: en tests/ estos literales son asertos, no guardias,
    // y contarlos allí producía tres falsos positivos de cada cuatro (medido en 400 commits).
    if (/^(app|components)\//.test(f.ruta) && /\.(tsx?|css)$/.test(f.ruta)) {
      for (const [literal, nombre] of GUARDIAS) {
        if (apariciones(antes, literal) > 0 && apariciones(despues, literal) === 0) {
          anotar('guardia-a-cero', f.ruta, nombre, `${nombre} desapareció de ${f.ruta}`);
        }
      }
    }

    // ── R4 · Escape de candado añadido a fichero preexistente ─────────────
    // Solo en código: un escape escrito en un .md es prosa, no desarma nada. Sin este
    // matiz, documentar el propio guardián de secretos disparaba el candado (commit
    // `bfd94ad1`, que explicaba en CLAUDE.md cómo se marca un falso positivo).
    if (!/\.(tsx?|jsx?|mjs|cjs|css)$/.test(f.ruta)) continue;
    const nuevas = lineasNuevas(antes, despues);
    if (nuevas.some((l) => ESCAPES_AJENOS.test(l))) {
      const cual = nuevas.find((l) => ESCAPES_AJENOS.test(l)).match(ESCAPES_AJENOS)[0];
      anotar('escape-ajeno', f.ruta, cual, `escape ${cual} añadido a ${f.ruta}`);
    }
    if (nuevas.some((l) => ESCAPES_CASA.test(l))) {
      const cual = nuevas.find((l) => ESCAPES_CASA.test(l)).match(ESCAPES_CASA)[0];
      notas.push({ tipo: 'escape-de-la-casa', texto: `${cual} añadido a ${f.ruta}` });
    }
  }

  // ── R8 · Un registro del catálogo pierde entradas ────────────────────────
  for (const reg of REGISTROS) {
    if (!ficheros.some((f) => f.ruta === reg && f.estado === 'M')) continue;
    const antes = entradasDeRegistro(leerAntes(reg));
    const ahora = entradasDeRegistro(leerDespues(reg));
    if (antes !== null && ahora !== null && ahora < antes) {
      anotar('registro-encoge', reg, `${antes}→${ahora}`, `${reg} pierde ${antes - ahora} entrada(s)`);
    }
  }

  // ── R9 · Se escribió fuera del ámbito declarado ──────────────────────────
  // El único «fuera de ámbito» que se puede contar sin opinar. Sale del transcript, no de git,
  // y el ámbito son el repositorio más los directorios que el usuario declara en settings.json:
  // escribir la entrada de la Agenda en la misma sesión es una regla del proyecto, no una fuga.
  for (const ruta of ficherosFuera) {
    anotar('fuera-del-repositorio', ruta, '', `se escribió fuera del ámbito declarado: ${ruta}`);
  }

  // ── Contexto del acta: no dispara, acompaña ──────────────────────────────
  for (const f of ficheros) {
    if (SENSIBLES.some((re) => re.test(f.ruta))) {
      notas.push({ tipo: 'fichero-sensible', texto: `${f.estado === 'A' ? 'nuevo' : 'tocado'}: ${f.ruta}` });
    }
  }

  const areas = [...new Set(ficheros.map((f) => areaDe(f.ruta)))];
  return {
    hallazgos,
    notas,
    radio: { ficheros: ficheros.length, areas: areas.length, listaAreas: areas },
  };
}

// ---------------------------------------------------------------------------
// Autoverificación: las cuatro trampas que el contador se tiende a sí mismo
// ---------------------------------------------------------------------------

/**
 * Escenarios escritos a mano que DEBEN disparar, y el ruido cotidiano que NO.
 *
 * Viven aquí, y no solo en la prueba, porque el contador los ejecuta contra sí mismo en CADA
 * pre-commit: cuestan menos de un milisegundo —no tocan git ni el disco— y convierten el
 * silencio en silencio VERIFICADO. Un detector diseñado para callar no se distingue de uno
 * roto, y el patrón de la casa dice que una calibración periódica solo se justifica cuando el
 * control no se puede automatizar (agenda: `vigilancia-pc-calibracion-semestral`). Este sí.
 *
 * Lo que NO cabe aquí es la otra mitad, la especificidad: reinyectar 400 commits reales cuesta
 * 22 segundos y no puede correr en cada commit. Esa sigue siendo manual —`npm run
 * cuadre:probar-candado`— y tiene su entrada en la Agenda.
 */
export const TRAMPAS = [
  {
    nombre: 'test borrado',
    espera: 'test-borrado',
    ficheros: [{ ruta: 'tests/apps/x.spec.ts', estado: 'D' }],
    antes: { 'tests/apps/x.spec.ts': 'test("algo", () => {});' },
    despues: {},
  },
  {
    nombre: 'dependencia nueva',
    espera: 'dependencia-nueva',
    ficheros: [{ ruta: 'package.json', estado: 'M' }],
    antes: { 'package.json': '{"dependencies":{"next":"^16.2.0"}}' },
    despues: { 'package.json': '{"dependencies":{"next":"^16.2.0","paquete-inventado":"^1.0.0"}}' },
  },
  {
    nombre: 'candado fuera del build',
    espera: 'candado-fuera-del-build',
    ficheros: [{ ruta: 'package.json', estado: 'M' }],
    antes: { 'package.json': '{"scripts":{"build":"node scripts/check-og-image.mjs && next build"}}' },
    despues: { 'package.json': '{"scripts":{"build":"next build"}}' },
  },
  {
    nombre: 'disclaimer caído',
    espera: 'guardia-a-cero',
    ficheros: [{ ruta: 'app/x/page.tsx', estado: 'M' }],
    antes: { 'app/x/page.tsx': '<DisclaimerCard severity="critical" />\n<Resultado />' },
    despues: { 'app/x/page.tsx': '<Resultado />' },
  },
  {
    nombre: 'ruido cotidiano (NO debe disparar)',
    espera: null,
    ficheros: [
      { ruta: 'app/app-nueva/page.tsx', estado: 'A' },
      { ruta: 'package.json', estado: 'M' },
      { ruta: 'app/y/page.tsx', estado: 'M' },
    ],
    antes: {
      'package.json': '{"dependencies":{"next":"^16.2.11"}}',
      'app/y/page.tsx': '<div role="alert">Error</div>\n<Resultado />',
    },
    despues: {
      'package.json': '{"dependencies":{"next":"^16.2.12"}}',
      'app/y/page.tsx': '<Resultado />\n<div role="alert">Error</div>',
    },
  },
];

/**
 * Ejecuta las trampas y devuelve las que han fallado. Vacío = el contador mira de verdad.
 */
export function autoverificar() {
  const fallos = [];
  for (const t of TRAMPAS) {
    const { hallazgos } = contar({
      ficheros: t.ficheros,
      leerAntes: (r) => (r in t.antes ? t.antes[r] : null),
      leerDespues: (r) => (r in t.despues ? t.despues[r] : null),
    });
    const reglas = hallazgos.map((h) => h.regla);
    if (t.espera === null) {
      if (reglas.length > 0) fallos.push(`«${t.nombre}» hizo saltar ${reglas.join(', ')}`);
    } else if (!reglas.includes(t.espera)) {
      fallos.push(`«${t.nombre}» NO hizo saltar ${t.espera}`);
    }
  }
  return fallos;
}

export const REGLAS_QUE_BLOQUEAN = [
  'test-borrado',
  'fichero-en-raiz',
  'candado-fuera-del-build',
  'escape-ajeno',
  'dependencia-nueva',
  'dominio-nuevo',
  'guardia-a-cero',
  'registro-encoge',
  'fuera-del-repositorio',
];
