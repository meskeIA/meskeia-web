#!/usr/bin/env node
/**
 * check-claude-md.mjs — candado de las obligaciones del CLAUDE.md raíz.
 *
 * El CLAUDE.md raíz es el único fichero de reglas del proyecto que llega a TODAS las sesiones
 * (los siete de carpeta no se cargan de forma fiable). Lo que se pierde de él no da ningún
 * error: la regla parece puesta y no está. Este candado lo compara con una lista DECLARADA de
 * obligaciones y falla si una desaparece o cambia de sección.
 *
 * Uso:  npm run check:claude-md
 *       node scripts/check-claude-md.mjs --verbose
 *       node scripts/check-claude-md.mjs --fichero <otro CLAUDE.md>     (lo usa la prueba)
 *
 * Comprobaciones:
 *   1. OBLIGACIONES: cada frase de la lista sigue en la sección (##/###) a la que está atada.
 *      Moverla a otra sección cuenta como perderla, y el error dice adónde fue.
 *   2. Cada `npm run X` citado existe en package.json.
 *   3. Cada ruta del repositorio citada (scripts/, tests/, data/, app/…) existe. Se omiten los
 *      globs y los <marcadores>; en Vercel se omite entera, porque allí no están los ficheros
 *      ignorados por git (`scripts/digest-diario.mjs`, `_private/`).
 *   4. Cada «### Candado de…» afirma que rompe el build: su `npm run check:x` tiene que estar
 *      de verdad en la cadena de `npm run build`.
 *   5. MOLDE, solo aviso: una sección «### Candado de…» de más de 1.200 B, o sin la línea
 *      «Salió de…» que nombra su caso de origen (candado de juicio nº 2).
 *
 * DE DÓNDE SALE (24/09/2026)
 * ──────────────────────────
 * El 23/09 una compactación con prisa del índice de memoria se llevó la mitad de los frenos
 * que agosto había dejado en él a propósito. Ningún enlace se perdió, así que ninguna
 * comprobación dio error; se blindó con la comprobación 11 de check-memoria.mjs. El CLAUDE.md
 * corría el mismo riesgo: crecía ~1.000 B/día (46.003 B el 06/09 → 64.523 B el 24/09) sin
 * cumplir la regla de podar en el mismo edit que añade, y la poda que eso acaba exigiendo es
 * justo la que se lleva las líneas largas, que son las que explican una obligación. La lista
 * se escribió leyendo el fichero de ANTES de la poda del 24/09, para que la poda tuviera algo
 * contra lo que medirse.
 *
 * La lista vive AQUÍ y no en _private/, al revés que la de frenos de memoria: el CLAUDE.md es
 * público, así que su lista puede serlo, y el candado corre también en Vercel.
 *
 * Se compara sin mayúsculas, negritas, backticks, marcas de cita (`> `) ni espacios dobles, con
 * la misma normalización que check-memoria.mjs §11: reformatear o reflujar un párrafo calla, y
 * reescribir la obligación suena.
 *
 * Sin escape, a propósito: retirar una obligación es quitarla de la lista, en el mismo commit
 * que la quita del CLAUDE.md. Una decisión explícita, no un efecto secundario de podar.
 *
 * ⚠️ NO hay umbral de tamaño TOTAL, y es deliberado. Uno calibrado sobre el tamaño en que quedó
 * el fichero un día es la trampa del 17.100 del 11/08 («como quedó aquel día»): se cruza a los
 * pocos días y enseña a ignorarlo. Los 80.000 B de la ficha feedback_claude_md_podar_al_ampliar
 * son un umbral de silencio (por debajo no se reabre el reparto), no de alarma. Lo que se
 * vigila es el molde de cada sección de candado, que es donde crecía: once secciones sumaban
 * ~22 KB el 24/09, casi todo crónica que ya vivía en la cabecera de su script.
 *
 * LO QUE NO DEMUESTRA
 * ───────────────────
 *   · Solo vigila lo declarado, y lo declara quien poda: el 24/09 la prueba ciega encontró
 *     cuatro respuestas operativas que la misma sesión había juzgado crónica y dejado fuera de
 *     la lista. En una poda grande, la prueba ciega sigue haciendo falta.
 *   · Que la frase siga en su sección no garantiza que baste: aquel día las tres frases de la
 *     hidratación seguían en su sitio, fundidas de forma que `SIEMBRA_ESTRICTA` parecía auditar
 *     también los `fill()`.
 *   · Que lo que se quita sea crónica y no instrucción. Eso lo da revisar el diff por fuera, en
 *     otra conversación: el 24/09, el usuario revisó uno a uno los 47 fragmentos de código,
 *     ratios, escapes y rutas que desaparecían, y así apareció lo de la hidratación. Esa revisión
 *     no mira la prosa.
 *   · No lee el CLAUDE.md global (~/.claude/CLAUDE.md), que vive fuera del repositorio.
 *
 * Prueba: `npm run claude-md:probar-candado` (quita, mueve, reformatea e inventa, y exige que
 * dispare y calle donde debe).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const iFichero = args.indexOf('--fichero');
const FICHERO = iFichero >= 0 ? path.resolve(args[iFichero + 1]) : path.join(REPO, 'CLAUDE.md');

const MOLDE_MAX_BYTES = 1200;

// ── La lista de obligaciones ────────────────────────────────────────────────────────────────
// [clave de la sección, [frases]]. La clave casa con el texto del encabezado (sin mayúsculas ni
// backticks) y tiene que señalar UNO solo. La sección de un «##» incluye sus «###»; la de un
// «###», solo su propio cuerpo. Las frases se escriben sin negritas ni backticks: se quitan al
// comparar.
const OBLIGACIONES = [
  ['Los CLAUDE.md de carpeta NO se cargan', [
    'hay que leerlos', 'antes de la primera escritura',
    'data/CLAUDE.md', 'scripts/CLAUDE.md', 'app/api/analytics/CLAUDE.md', 'types/CLAUDE.md',
    'styles/CLAUDE.md', 'app/delegum/CLAUDE.md', 'data/historias/CLAUDE.md',
  ]],
  ['Proyecto: meskeia-web', ['puerto 3050', 'Push a main despliega solo']],
  ['Identidad visual meskeIA', [
    'no duplicar la definición', '#2E86AB', '#48A9A6', '#7FB3D3', '#1a5278',
    'obligatorio en hero sections', 'Prohibido absoluto', '#7C3AED', '#2DD4BF',
    'No preguntar si aplicar la identidad meskeIA',
  ]],
  ['Estructura estándar de una app', [
    '<MeskeiaLogo />', '<LegalNotice /> ← RGPD',
    '<DisclaimerCard /> O // @disclaimer: exempt en la línea 2', '<EducationalSection>',
    "<RelatedApps apps={getRelatedApps('slug')} />", '<ShareCard appName="slug" />',
    '<Footer appName="slug" />', 'Los cinco obligatorios en TODAS las apps',
    'MeskeiaLogo, LegalNotice, RelatedApps, ShareCard, Footer', 'Se importan de @/components',
    'los formateadores, de @/lib',
    'Nunca ocultar dentro de <EducationalSection> un disclaimer legal, una advertencia de responsabilidad ni un aviso sobre datos personales',
    'components/README.md', '/nueva-app-meskeia',
  ]],
  ['Arquitectura de Clasificación', ['clasificación NO excluyente', 'se eliminó el 2026-05-06']],
  ['Suites (13)', ['data/suites.ts', 'NO duplicarla aquí']],
  ['Archivos de datos', ['public/ai-index.json', 'auto-generado en el build', 'No editar a mano']],
  ['Módulos de datos fiscales', ['ls data/fiscal/', 'no se mantiene aquí una tabla de módulos']],
  ['Regla obligatoria para apps Legal-Fiscal', [
    'ANTES de hardcodear cualquier dato normativo', 'revisar si ya existe en data/fiscal/',
    'crear el módulo correspondiente', 'Nunca inline',
  ]],
  ['Template visualizador-historia', [
    'Catálogo cerrado desde el 2026-05-09', 'data/historias/CLAUDE.md', 'hay que abrir a mano',
  ]],
  ['Sección Guías', ['proceso de decisión a corto-medio plazo', '5-7 herramientas']],
  ['Guías implementadas', [
    'data/guides-journey.ts', 'NO mantener tablas de guías en docs', '2 archivos OBLIGATORIOS',
    'app/guia/page.tsx (array guias)', 'Olvidar el segundo = la guía no aparece',
  ]],
  ['Política de Disclaimers', ['_private/DISCLAIMER-POLICY.md', 'leer SIEMPRE antes de crear una app']],
  ['Resumen ejecutivo', [
    '| 1 CRÍTICO | Fiscal, herencias, hipotecas, orientación médica clínica | ❌ Nunca | critical |',
    '| 2 ALTO | Financiero general, salud/hábitos, autónomos sin fiscal | ❌ Nunca | high |',
    '| 3 MEDIO | Planificadores cotidianos, productividad | ✅ sessionStorage | medium |',
    '| 4 INFORMATIVO | Educativo puro, quizzes, generadores | ✅ localStorage | low |',
  ]],
  ['Regla fiscal', ['Cualquier componente fiscal', 'Nivel 1 CRÍTICO obligatorio']],
  ['Regla multi-suite', ['aplicar siempre el nivel más alto']],
  ['Componente DataReference', [
    'fecha de caducidad', '<DataReference> inmediatamente después del <DisclaimerCard>',
  ]],
  ['Registro de una app en un portal vertical', [
    'data/applications.ts + data/implemented-apps.ts + data/app-relations.ts',
    'STEMUM_APPS en data/stemum.ts', 'COQUINUM_APPS en data/coquinum.ts',
    'data/cronicum/puertas.ts', 'es el orden de la parrilla', 'en exactamente una puerta',
    'npm run check:verticales', 'rompe el build',
  ]],
  ['Material de apoyo de Stemum', [
    'no cuentan en el hero ni en los contadores de disciplina',
    'buscador SIEMPRE + al menos una capa que un PDF no pueda dar',
    'Una lista plana se queda en meskeIA y no entra en Stemum', '4 archivos OBLIGATORIOS',
    'STEMUM_MATERIAL_APOYO en data/stemum.ts', 'Olvidar el cuarto',
    'el simulador equivalente DEBE enlazar de vuelta a la tabla en app-relations.ts',
    'app/tabla-derivadas/',
  ]],
  ['1. Cada app DEBE tener al menos una Suite', ['OBLIGATORIO: mínimo 1']],
  ['1.bis Lenguaje Latam-friendly', [
    'evitar términos exclusivos de España salvo que la app sea fiscal-España',
    '| ESO, Bachillerato | secundaria, preparatoria, educación media |',
    'selectividad, EBAU, EvAU, PAU', 'DNI, NIE, NIF, CIF', 'AEAT, Hacienda española',
    'CCAA, comunidad autónoma', '"festivos en España"',
    '<RegionBadge variant="es-only" /> justo después del hero', '<RegionBadge variant="es-data" />',
    'Parser: parseSpanishNumber', 'Con los dos separadores manda el último', 'gana el español',
    'Devuelve NaN', 'símbolo configurable o genérico', 'normativa España solo cuando sea relevante',
  ]],
  ['1.quater Cifras del catálogo', [
    'solo aparecen vía variable', 'TOTAL_IMPLEMENTED_APPS', 'PROHIBIDO hardcodear números',
    'eliminarla, no dejar un número que envejecerá', 'grep -rE',
  ]],
  ['1.ter JSON-LD', [
    'Toda app nueva DEBE incluir Schema.org JSON-LD', 'templates/app-base/',
    'url absoluta con barra final',
    'EducationalApplication, FinanceApplication, UtilityApplication o BusinessApplication',
    'features con 4-8 características reales', 'faqJsonLd con 5 preguntas',
    'sin mencionar "meskeIA"', 'FAQPage es obligatorio desde 2026-05-30',
    '"@type":"WebApplication"', '"@type":"FAQPage"', 'node scripts/faq-progress.mjs',
  ]],
  ['1.quinquies Neutralidad editorial', [
    'Cifras populares sin fuente', 'Asunción de privilegio', '"Demostró/documentó"',
    'Moralizar elecciones legítimas', 'Bias EEUU/anglosajón sin matiz',
    'Asimetría territorial valorativa', '"Optimizar X"', 'Contexto colonial omitido',
    'Alcohol como saludable', 'refutado por WHO 2023', 'carcinógeno Grupo 1 IARC',
    'Disclaimer incoherente con el riesgo', 'que es medicamento >1,9 mg en España',
    'releer _private/DISCLAIMER-POLICY.md antes de decidir severity',
  ]],
  ['2. Ciclo de creación de nueva app', [
    'Fase 1 — app funcional', 'Fase 2 — profesionalización v2.0', 'que es inmediata, no opcional',
    '/nueva-app-meskeia', '_private/PROFESIONALIZACION.md',
    'Cursos (/curso-*) y Guías (/guia/*) están excluidos del patrón v2.0',
    'Juegos y ocio → patrón lite',
  ]],
  ['3. Creación de múltiples apps en paralelo', [
    '3 o más apps', 'Fase secuencial ANTES', 'Fase paralela',
    'Cada agente DEBE incluir estas instrucciones EXACTAS en su prompt',
    '## REGLAS CRÍTICAS PARA ESTE AGENTE',
    'Crea SOLO los 3 archivos de tu app (metadata.ts, page.tsx, .module.css)',
    'npm run check:tipos UNA SOLA VEZ. Si falla, reporta el error y TERMINA — no reintentes',
    'PROHIBIDO: npm run build (lock entre agentes) · modificar compartidos (applications.ts, implemented-apps.ts, app-relations.ts) · reintentar en bucle (sleep + retry) · run_in_background',
    'TERMINAR INMEDIATAMENTE tras crear los ficheros y verificar TS una vez',
    'No usar JSX.Element ni React.JSX.Element como tipo de retorno (causa error TS)',
    'Fase secuencial DESPUÉS', 'CSS: no usar * puro, TS: no usar JSX.Element',
  ]],
  ['4. Modificar una app existente', [
    'npx playwright test tests/apps/<slug>.spec.ts', 'crear el fichero si no existe',
    'Una calculadora normal no lo necesita',
  ]],
  ['Stack Tecnológico: tRPC', ['/trpc-meskeia', 'no se migran']],
  ['Lo que vigila el pre-commit', [
    'los goldens (test:calc', '_backups/, .credentials/, scratch/, digests/',
    'npm run check:secrets', 'npm run audit:secrets', 'pragma: allowlist-secret',
    'git commit --no-verify está PROHIBIDO', 'lo rechaza un hook PreToolUse',
    'CUADRE_OK="por qué es correcto" git commit', 'npm run hooks:install',
    '.git/hooks/ no se versiona',
  ]],
  ['El Cuadre', [
    'npm run cuadre', 'que es donde bloquea', 'se coló algo que nadie pidió', 'Nueve reglas',
    'test borrado', 'fichero nuevo en la raíz', 'candado fuera de la cadena del build',
    '@ts-ignore/eslint-disable/allowlist-secret añadido a código que ya existía',
    'paquete nuevo', 'dominio nuevo en la CSP', 'DisclaimerCard/LegalNotice/',
    'RegionBadge/Footer/RelatedApps/ShareCard/role="alert"/aria-live',
    'que cae a CERO en un fichero de app/ o components/', 'registro del catálogo que encoge',
    'escrito fuera del ámbito declarado', 'comparan CONJUNTOS antes/después, nunca líneas del diff',
    'El radio del cambio NO dispara', 'toast de Windows', '/cuadre', 'npm run cuadre:probar-candado',
  ]],
  ['Backups y recuperación de Turso', [
    'único dato de producción no reproducible desde GitHub',
    'scripts/backup-turso.mjs | Diaria, en la Rutina Matinal (05:30)',
    'Verificador de Backups | Diaria, en la misma cadena, tras los backups',
    'npm run ensayo:restauracion | Semestral',
    'Antes de ejecutar el ensayo, leer _private/RUNBOOK-RESTAURACION-TURSO.md',
    'restauracion-turso-semestral', 'uso_aplicaciones.timestamp es TEXT en formato español',
    'Usar created_at (ISO)',
  ]],
  ['Candado de accesibilidad JSX', [
    'npm run check:a11y-jsx', 'rompe el build', '<button> sin type=',
    'emoji junto a texto sin aria-hidden', 'aria-pressed que falta en un toggle',
    'aria-pressed que sobra', 'emoji en nodo propio', 'solo avisan',
    'un aria-pressed en un botón de acción es una regresión', 'las líneas que el commit añade',
    'a11y-ok: <razón>', 'npm run check:a11y-jsx -- --todo', 'node scripts/check-a11y-jsx.mjs <fichero>',
  ]],
  ['Candado del aviso legal', [
    'npm run check:legal', 'rompe el build', 'no monta <LegalNotice />',
    'se monte y no solo se importe', 'no viva dentro de <EducationalSection>', 'Sin pasivo',
    'legal-ok: <razón>', 'razón es obligatoria', 'npm run legal:probar-candado',
  ]],
  ['Candado de las celdas braille', [
    'npm run check:braille', 'rompe el build',
    'celda que conversor-braille puede EMITIR no tiene entrada en brailleDots',
    'no cuadran con su código Unicode', 'Sin pasivo', 'sin escape, a propósito',
    'npm run braille:probar-candado',
  ]],
  ['Candado del mínimo personal del IRPF', [
    'npm run check:minimo-irpf', 'rompe el build', 'una resta cuyo sustraendo es un mínimo',
    'art. 63.1.2.º LIRPF', 'no reduce la renta', 'a TIPO CERO', 'calcularCuotaIntegraGeneral',
    'cuotaEscalaGeneral', 'desglosarEscalaGeneral', 'Sin pasivo', 'minimo-ok: <razón>',
    'art. 84.2 (3.400 / 2.150 €)', 'sí se resta de la base y no lo dispara',
    'npm run minimo:probar-candado',
  ]],
  ['Candado del contraste de las cabeceras de tabla', [
    'npm run check:contraste-cabeceras', 'rompe el build',
    'texto blanco sobre var(--primary) o var(--secondary)', 'app/ y components/',
    'un token -texto no se use como FONDO', '--primary-texto/--secondary-texto son para color:',
    '--primary-boton', '--secondary-boton', 'iguales en ambos temas',
    'var(--hero-bg) (8,33:1) no lo enciende', 'exige 4,5:1', '4,11:1 el azul y 2,80:1 el teal',
    'Sin pasivo', 'contraste-ok: <razón>',
    'razón es obligatoria', 'Lo que NO mira', 'el color de marca como TEXTO sobre fondo claro',
    'se resuelve con --primary-texto', 'campaña aparte', 'npm run contraste:probar-candado',
    'tests/contraste-cabeceras-tabla.spec.ts',
  ]],
  ['Candado del token sin variante oscura', [
    'npm run check:token-oscuro', 'rompe el build',
    'declara con color literal un token que globals.css define distinto en cada tema',
    'sin redeclararlo en la variante oscura de ese mismo selector', 'se planta si no la encuentra',
    ':root de módulo', 'Al drenar un token en un tema, medir el otro', 'Sin pasivo',
    '--primary, --secondary y los semánticos', 'oscuro-ok: <razón>', 'razón obligatoria',
    'Exige que la variante EXISTA', 'tests/contraste-text-muted-*.spec.ts',
    'un valor se decide midiendo contra el fondo REAL', 'npm run oscuro:probar-candado',
  ]],
  ['Candado del parser numérico', [
    'npm run check:parser', 'rompe el build', "parseFloat(x.replace(',', '.'))",
    'parseSpanishNumber', 'las líneas que el commit añade', 'Sustituirlos en bloque',
    'El pasivo lo drena el Inspector app por app', 'parser-ok: <razón>',
    'npm run check:parser -- --todo', 'node scripts/check-parser-numerico.mjs <fichero>',
  ]],
  ['Candado de la hidratación en los tests', [
    'npm run check:hidratacion', 'rompe el build', 'con el setter nativo',
    'HTMLInputElement.prototype', 'tests/apps/_hidratacion.ts', 'sembrarValor',
    'sembrarValorAcotado', 'esperarValorEnReact', 'no que React los haya ejecutado',
    'Sin pasivo', 'hidratacion-ok: <razón>', 'No mira los fill() ni los clics',
    'hay que esperar antes', 'sembrar el valor que el input YA tiene',
    // Atada a «eso lo audita»: SIEMBRA_ESTRICTA NO audita los fill() ni los clics
    'eso lo audita SIEMBRA_ESTRICTA=1 npx playwright test tests/apps',
    'npm run hidratacion:probar-candado', 'tests/hidratacion-carrera.spec.ts',
  ]],
  ['Candado de las familias de apps', [
    'npm run check:familias', 'rompe el build', 'el testigo de una familia no está en verde',
    'si su tabla no cubre cada <NumberInput> de cada hermana', 'scripts/inspector/familias.mjs',
    'una familia nueva entra en el build con declararla allí', 'ejecuta en vez de leer',
    'Sin pasivo', "falla: '<razón>'", 'ANTES de repararlo', 'se imprime con su cuenta',
    'una marca cuyo caso ya pasa sí rompe',
    'familia-ok: <razón>', 'razón obligatoria', 'En Vercel se omite la ejecución',
    'npm run familias:probar-candado',
  ]],
  ['Candado de la tarjeta social', [
    'npm run check:og-image', 'Rompe el build',
    'no declara la og de SU portal en openGraph y en twitter', 'si la imagen no existe en public/',
    'cae bajo un redirect de next.config.ts', 'Next NO hereda la imagen del layout raíz',
    'declarar openGraph en la página reemplaza entero el del padre',
    'templates/app-base/ ya trae images', 'Sin pasivo', 'declara openGraph sin images',
    'og-ok: <razón>', 'PORTALES', 'Delegum es la excepción: sus apps NO llevan la og del portal',
    'Delegum no sirve apps bajo su dominio', 'no hace passthrough',
    'delegum.com/estimador-irpf/ da 404', 'DELEGUM_APP_SLUGS alimenta Soluciones, no pertenencia',
    'home, /datos-fiscales/, asistente y blog', 'el árbol de cada portal',
    'npm run og:probar-candado',
  ]],
  ['Candado de las obligaciones del CLAUDE.md', [
    'npm run check:claude-md', 'rompe el build', 'desaparece o cambia de sección',
    'Sin escape, a propósito', 'retirar una obligación es quitarla de la lista',
    'Avisa (no rompe)', 'npm run claude-md:probar-candado',
  ]],
  ['TypeScript', [
    'ignoreBuildErrors: true', 'el build de producción NO type-chequea',
    'Validación de tipos SIEMPRE en local', 'npm run check:tipos',
    'NO usar npx tsc --noEmit a secas', 'puede estar CIEGO',
    'falla si no consigue dejar la validación limpia',
    'Casts conocidos: Chart.js → as never, jStat → Record, libs sin tipos → .d.ts en types/',
  ]],
  ['Cabeceras de Seguridad HTTP', [
    'dos capas (next.config.ts + vercel.json)', 'en modo enforcement', 'media-src incluye blob:',
    'cualquier recurso externo nuevo debe añadirse a la política',
    'feature=() desactiva cámara y micrófono en silencio', 'usar (self) y en AMBOS ficheros',
  ]],
  ['CORS en API Routes', ['restringidas a meskeia.com (no *)']],
  ['Disciplina de Build', [
    'UN solo build a la vez', '10 minutos (600000 ms)', 'CLAUDE.md global §7', '~1-2 minutos',
    'no dar un build por fallido antes de ese tiempo',
    'NUNCA npm run check:tipos mientras un build está corriendo', 'rm -f .next/lock',
    'un solo build',
  ]],
  ['Servidor local de pruebas', [
    'debe detenerse explícitamente antes de dar la tarea por terminada', 'npx kill-port 3050',
    'predev: npx kill-port 3050',
  ]],
  ['Candados de juicio', ['formas de fallo ya observadas y repetidas']],
  ['1. Candado tras cambio a escala', [
    'más de 20 apps', 'renombre, mueva o retire una URL', 'Verificar la salida, no la ejecución.',
    'Grepear la condición negativa', 'scripts/check-*.mjs enganchado a npm run build',
    '438 apps', '3 404 internos',
  ]],
  ['2. Nombrar el caso de origen', [
    'no basta con invocar la regla', 'de qué caso concreto nació',
    'Si no se puede nombrar el caso de origen, la regla no se está aplicando: se está invocando.',
    'Tesseract', 'S0010', 'S0014', 'S0042',
  ]],
  ['3. Contador de veredicto repetido', [
    'número de lecturas consecutivas que lleva diciendo lo mismo', '5 iguales seguidas',
    'el indicador está roto', 'El contador va impreso en la salida',
    'El contador va sobre el eje que discrimina, y la ausencia de un valor NO es una racha.',
    'Y va sobre UNA sola población.', 'npm run inspector:probar-contador',
    'Un indicador puede mentir por los dos extremos',
  ]],
  ['Proceso', [
    'se repara en el momento, se PUSHEA en lote.', '/push', 'No se difiere ninguna reparación',
    'NUNCA git add . ni git add -A', 'Sale con push propio, sin esperar al lote',
    'service workers, cabeceras, redirects, CSP', 'una regresión introducida hoy',
    'exposición nueva frente a exposición antigua',
  ]],
  ['app-dates.json lo refresca', [
    'data/app-dates.json', 'commit propio y no con --amend', 'se commitea a propósito',
    'guarda fechas de última modificación, no de publicación',
  ]],
  ['Variables de Entorno', ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN']],
  ['Archivos Auxiliares', ['Ninguno se edita a mano.']],
  ['Herramientas de Desarrollo', [
    'se retiraron el 11/08/2026', 'Testing de frontend interactivo: sin MCP',
    '@playwright/test directo',
  ]],
  ['Dónde vive una skill', [
    'Una skill de meskeIA se crea en .claude/skills/ del proyecto',
    '/agenda, /log, /markets, /correo', 'No se versionan', 'salvo cuadre y trpc-meskeia',
    'CRLF rompe el frontmatter en silencio', 'Guardar siempre en LF',
  ]],
  ['Agenda Operativa', [
    'Centro de Mando\\agenda.json',
    'Toda decisión con fecha futura se anota en la Agenda Operativa, en la MISMA sesión en que se toma.',
    'la sesión no termina sin crear su entrada', 'no contiene instrucciones', 'puntero donde',
    'ultimaVez', 'Nunca acumular notas encima de notas', 'No crear recordatorios en ningún otro sitio',
    'Si no está en la agenda, no existe', 'skill /agenda',
  ]],
  ['This is NOT the Next.js you know', ['node_modules/next/dist/docs/']],
];

// ── Utilidades ──────────────────────────────────────────────────────────────────────────────
// Misma normalización que check-memoria.mjs §11, más las marcas de cita: una frase partida
// entre dos líneas de un «> …» tiene que casar igual que en un párrafo normal.
const normalizar = s => s.normalize('NFC').replace(/^[ \t]*>[ \t]?/gm, '')
  .replace(/[*`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const miles = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function leerSecciones(texto) {
  const lineas = texto.split(/\r?\n/);
  const encabezados = [];
  let enCodigo = false;
  lineas.forEach((l, i) => {
    if (/^\s*```/.test(l)) { enCodigo = !enCodigo; return; }
    if (enCodigo) return;   // el «## REGLAS CRÍTICAS…» del bloque de agentes NO es una sección
    const m = l.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) encabezados.push({ nivel: m[1].length, titulo: m[2], linea: i });
  });
  return encabezados.map((h, k) => {
    let fin = lineas.length;
    for (let j = k + 1; j < encabezados.length; j++) {
      if (encabezados[j].nivel <= h.nivel) { fin = encabezados[j].linea; break; }
    }
    const finPropio = k + 1 < encabezados.length ? encabezados[k + 1].linea : lineas.length;
    return {
      ...h,
      clave: normalizar(h.titulo),
      texto: normalizar(lineas.slice(h.linea, fin).join('\n')),
      propio: lineas.slice(h.linea, finPropio).join('\n'),
    };
  });
}

// ── Carga ───────────────────────────────────────────────────────────────────────────────────
const errores = [];
const avisos = [];

let texto;
try {
  texto = fs.readFileSync(FICHERO, 'utf8');
} catch (e) {
  console.log(`\n✖ No se puede leer ${FICHERO}: ${e.message}\n`);
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
const secciones = leerSecciones(texto);
const textoEntero = normalizar(texto);

// ── 1. Obligaciones ─────────────────────────────────────────────────────────────────────────
let nFrases = 0;
for (const [clave, frases] of OBLIGACIONES) {
  const k = normalizar(clave);
  let candidatas = secciones.filter(s => s.clave.includes(k));
  if (candidatas.length > 1) candidatas = candidatas.filter(s => s.clave === k);
  if (candidatas.length !== 1) {
    errores.push(candidatas.length === 0
      ? `Sección desaparecida: «${clave}» (${frases.length} obligaciones atadas a ella). Si se renombró, ` +
        'actualizar su clave en OBLIGACIONES; si se retiró, decidir adónde van sus obligaciones'
      : `La clave «${clave}» señala más de una sección: la lista está mal escrita`);
    nFrases += frases.length;
    continue;
  }
  const seccion = candidatas[0];
  for (const frase of frases) {
    nFrases++;
    const f = normalizar(frase);
    if (seccion.texto.includes(f)) continue;
    if (textoEntero.includes(f)) {
      // Dónde está ahora: la sección más específica que la contiene
      const donde = secciones.filter(s => normalizar(s.propio).includes(f)).map(s => s.titulo)[0] ?? '¿?';
      errores.push(`Obligación fuera de su sección: «${frase}» debía estar en «${seccion.titulo}» y está en «${donde}»`);
    } else {
      errores.push(`Obligación perdida: «${frase}» (sección «${seccion.titulo}»). ` +
        'Si se retira a propósito, quitarla de OBLIGACIONES en scripts/check-claude-md.mjs');
    }
  }
}

// ── 2. Cada `npm run X` citado existe ───────────────────────────────────────────────────────
const citadosNpm = new Set();
for (const m of texto.matchAll(/npm run ([\w:.-]+)/g)) citadosNpm.add(m[1].replace(/[.:]+$/, ''));
for (const x of citadosNpm) {
  if (!pkg.scripts?.[x]) errores.push(`Cita un comando que no existe: «npm run ${x}» no está en package.json`);
}

// ── 3. Cada ruta del repositorio citada existe ──────────────────────────────────────────────
const RAICES = 'scripts|tests|data|components|lib|app|styles|types|templates|public|server|_private';
const rutas = new Set();
for (const m of texto.matchAll(new RegExp(`(?<![\\w/.@-])((?:${RAICES})/[\\w./\\[\\]<>*-]+)`, 'g'))) {
  const r = m[1].replace(/[.,;:)]+$/, '');
  if (!/[*<[]/.test(r)) rutas.add(r);   // globs, <marcadores> y [slug] no son rutas
}
let rutasComprobadas = 0;
if (!process.env.VERCEL) {
  const hayPrivado = fs.existsSync(path.join(REPO, '_private'));
  for (const r of rutas) {
    if (r.startsWith('_private/') && !hayPrivado) continue;
    rutasComprobadas++;
    if (!fs.existsSync(path.join(REPO, r))) errores.push(`Cita una ruta que no existe: ${r}`);
  }
}

// ── 4 y 5. Secciones de candado: en la cadena del build, y con su molde ─────────────────────
const cadenaBuild = pkg.scripts?.build ?? '';
const candados = secciones.filter(s => s.nivel === 3 && /^candado d/.test(s.clave));
for (const s of candados) {
  const comando = s.propio.match(/npm run (check:[\w-]+)/)?.[1];
  const script = comando ? pkg.scripts?.[comando]?.match(/^node (scripts\/\S+)/)?.[1] : null;
  if (!comando) {
    errores.push(`«${s.titulo}» no cita su «npm run check:…»`);
  } else if (!script || !cadenaBuild.includes(`node ${script}`)) {
    errores.push(`«${s.titulo}» afirma que rompe el build, pero «${comando}» no está en la cadena de «npm run build»`);
  }
  const bytes = Buffer.byteLength(s.propio, 'utf8');
  if (bytes > MOLDE_MAX_BYTES) {
    avisos.push(`Molde: «${s.titulo}» ocupa ${miles(bytes)} B (más de ${miles(MOLDE_MAX_BYTES)}). ` +
      'La crónica va a la cabecera de su script; aquí, qué rompe, qué barre, el escape y el caso de origen');
  }
  if (!/salió del? /i.test(s.propio)) {
    avisos.push(`Molde: «${s.titulo}» no nombra su caso de origen con una línea «Salió de…»`);
  }
}

// ── Informe ─────────────────────────────────────────────────────────────────────────────────
const bytesTotal = Buffer.byteLength(texto, 'utf8');
console.log(`\n📜 CLAUDE.md — ${path.relative(REPO, FICHERO) || FICHERO}`);
console.log(`   ${miles(bytesTotal)} B · ${miles((texto.match(/\n/g) ?? []).length)} líneas · ${nFrases} obligaciones en ` +
  `${OBLIGACIONES.length} secciones · ${citadosNpm.size} comandos citados · ` +
  `${process.env.VERCEL ? 'rutas sin comprobar (Vercel)' : `${rutasComprobadas} rutas`} · ${candados.length} candados en la cadena del build`);

if (VERBOSE) {
  for (const s of candados) console.log(`   ${String(miles(Buffer.byteLength(s.propio, 'utf8'))).padStart(6)} B  ${s.titulo}`);
}
if (avisos.length) {
  console.log(`\n⚠️  ${avisos.length} aviso(s):`);
  avisos.forEach(a => console.log(`   · ${a}`));
}
if (errores.length) {
  console.log(`\n✖ ${errores.length} error(es):`);
  errores.forEach(e => console.log(`   · ${e}`));
  console.log('');
  process.exit(1);
}
console.log('\n✅ Ninguna obligación perdida ni fuera de su sección, ningún comando ni ruta inexistente.\n');
