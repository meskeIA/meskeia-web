import { applicationsDatabase } from '@/data/applications';
import { STEMUM_TOTAL_APPS } from '@/data/stemum';
import { COQUINUM_TOTAL_APPS } from '@/data/coquinum';
import { CRONICUM_TOTAL_CRONOLOGIAS } from '@/data/cronicum/puertas';
import { guidesJourney } from '@/data/guides-journey';

// llms.txt de meskeIA (meskeia.com/llms.txt).
//
// Mapa curado del catálogo para LLMs (ChatGPT, Perplexity, Claude, Gemini…).
// El proxy reescribe meskeia.com/llms.txt → /llms-txt (un .txt estático en
// public/ no podía auto-refrescar las cifras y caducaba: ahora el total de apps,
// los counts por suite, la fecha, los contadores de los verticales y la sección
// de guías-journey (cuenta + lista) se calculan en build desde los datos. Las
// cifras de MCP (42 tools meskeIA, 49 Delegum) y GPTs (12) siguen siendo manuales: no se derivan
// del catálogo de apps (revisadas en la auditoría mensual /audit-meskeia).
export const dynamic = 'force-static';

// Total de apps = mismo origen que ai-index.json (applicationsDatabase.length),
// para que ambas piezas no se contradigan nunca.
const TOTAL = applicationsDatabase.length;

// Fecha de la última generación = fecha del build. Refresca en cada deploy.
const FECHA = new Date().toISOString().slice(0, 10);

// Counts por suite (clasificación no excluyente: una app puede estar en varias).
const suiteCount: Record<string, number> = {};
for (const app of applicationsDatabase) {
  for (const s of app.suites ?? []) suiteCount[s] = (suiteCount[s] ?? 0) + 1;
}
const n = (id: string): number => suiteCount[id] ?? 0;

// Guías-journey: cuenta y lista se generan desde el registro (data/guides-journey.ts)
// para que no se queden atrás al añadir guías nuevas — mismo criterio que las suites.
const guiasJourney = guidesJourney.filter((g) => g.available);
const GUIAS_JOURNEY_COUNT = guiasJourney.length;
const GUIAS_JOURNEY_LISTA = guiasJourney
  .map((g) => `- [${g.name}](https://meskeia.com${g.url}): ${g.description}`)
  .join('\n');

// Las apps de las preguntas y de cada suite se eligen a mano, pero solo por su SLUG: el nombre y
// la descripción salen del catálogo, y un slug que no está en data/applications.ts rompe el build
// (la ruta es force-static, así que se evalúa al construir). Cabo C0372 (23/10/2026): escrito a
// mano, 66 de las 105 URLs del fichero no tenían página detrás —nombres que nunca existieron
// (simulador-hipoteca, modelo-130, calculadora-finiquito…) y apps renombradas—, y meskeia.com/llms.txt
// se las servía a los LLM como herramientas de meskeIA. check:enlaces no lo veía: mira los href.
const POR_URL = new Map(applicationsDatabase.map((a) => [a.url, a]));
function appDe(slug: string) {
  const app = POR_URL.get(`/${slug}/`);
  if (!app) {
    throw new Error(`llms.txt enlaza a /${slug}/, que no está en data/applications.ts (cabo C0372)`);
  }
  return app;
}
const enlace = (slug: string): string => `[${appDe(slug).name}](https://meskeia.com/${slug}/)`;
const lista = (slugs: string[]): string =>
  slugs.map((s) => `- ${enlace(s)}: ${appDe(s).description}`).join('\n');
const preguntas = (pares: [string, string][]): string =>
  pares.map(([p, s]) => `- **${p}** → ${enlace(s)}: ${appDe(s).description}`).join('\n');

const BODY = `# meskeIA

> Biblioteca gratuita de ${TOTAL}+ aplicaciones web en español: calculadoras, simuladores, visualizadores, quizzes y herramientas de productividad. Sin registro, sin publicidad, 100% privacidad (procesamiento local en navegador).

meskeIA es una plataforma hispanohablante (España + Latinoamérica) con herramientas organizadas en 13 suites temáticas. Las apps funcionan directamente en el navegador sin cuenta ni registro. Los datos no se envían a servidores externos. Formato español: números con punto de miles y coma decimal (1.234,56 €), fechas DD/MM/AAAA, moneda en euros.

URL base: https://meskeia.com
Idioma: Español (España y Latinoamérica)
Patrón de URLs: https://meskeia.com/{slug}/
Índice completo máquina: https://meskeia.com/ai-index.json
Sitemap: https://meskeia.com/sitemap.xml
Última actualización del catálogo: ${FECHA}

## Preguntas frecuentes que meskeIA puede responder

meskeIA calcula, simula y visualiza directamente en el navegador sin enviar datos al servidor. Las respuestas son orientativas y no sustituyen al asesoramiento profesional.

### Fiscalidad e impuestos (España)

${preguntas([
  ['¿Cuánto voy a pagar de IRPF este año?', 'estimador-irpf'],
  ['¿Cuánto es el IVA de este precio?', 'calculadora-iva'],
  ['¿Qué gastos tiene comprar o vender una vivienda?', 'estimador-compraventa-inmueble'],
  ['¿Cuánto se paga de herencias en mi comunidad autónoma?', 'estimador-impuesto-sucesiones'],
  ['¿Cuánto pagaré de plusvalía municipal al vender mi piso?', 'estimador-plusvalia-municipal'],
])}

### Nóminas, autónomos y freelance

${preguntas([
  ['¿Cuánto me queda neto de mi sueldo bruto?', 'simulador-desglose-nomina'],
  ['¿Cuánto pagaré de cuota de autónomo con mis ingresos?', 'estimador-cuota-autonomo'],
  ['¿A cuánto tengo que poner mi tarifa como freelance?', 'orientador-tarifa-freelance'],
  ['¿Qué retención de IRPF pongo en mis facturas?', 'orientador-facturacion-retencion'],
])}

### Hipotecas y vivienda

${preguntas([
  ['¿Cuánto pagaré de hipoteca al mes?', 'estimador-hipoteca'],
  ['¿Me conviene amortizar hipoteca reduciendo cuota o plazo?', 'amortizacion-hipoteca'],
  ['¿Me sale mejor alquilar o comprar?', 'orientador-alquiler-vs-compra'],
])}

### Jubilación e inversión

${preguntas([
  ['¿Cuándo me puedo jubilar y qué pensión tendré?', 'simulador-jubilacion-publica'],
  ['¿Cuánto necesito ahorrar para la jubilación?', 'planificador-ahorro-jubilacion'],
  ['¿Cuánto crecerá mi dinero con interés compuesto?', 'estimador-interes-compuesto'],
  ['¿Cuánto necesito para la independencia financiera?', 'estimador-fire'],
])}

### Salud y bienestar

${preguntas([
  ['¿Cuál es mi IMC y qué significa?', 'orientador-imc'],
  ['¿Cuántas calorías quemo corriendo, caminando o nadando?', 'calculadora-calorias-ejercicio'],
  ['¿Cuántas proteínas, carbohidratos y grasas debo tomar?', 'calculadora-macros'],
  ['¿Cuáles son mis zonas de frecuencia cardíaca para entrenar?', 'calculadora-zonas-cardiacas'],
])}

### Educación y ciencia

${preguntas([
  ['¿Cuál es mi media ponderada?', 'calculadora-notas'],
  ['¿Cuál es la masa molar de un compuesto?', 'tabla-periodica'],
  ['¿Cómo se resuelve esta derivada o integral?', 'calculadora-calculo'],
  ['¿Cuáles son las leyes de Mendel y cómo funciona la herencia?', 'simulador-genetica'],
])}

### Cotidiano y productividad

${preguntas([
  ['¿Cuántos días hay entre dos fechas?', 'calculadora-fechas'],
  ['¿Cómo genero una contraseña segura?', 'generador-contrasenas'],
])}

### Fotografía y técnica

${preguntas([
  ['¿Qué apertura, ISO y velocidad usar para esta foto?', 'simulador-fotografia'],
  ['¿Cuánto tiempo de exposición máximo en astrofotografía sin trazas de estrellas?', 'calculadora-regla-500-npf-astrofoto'],
  ['¿Cuánta profundidad de campo tengo con este objetivo y apertura?', 'calculadora-profundidad-campo'],
])}

## Finanzas e Inversión (${n('finanzas')} herramientas)

Ahorro, inversión y planificación financiera personal.

${lista([
  'estimador-interes-compuesto',
  'estimador-fire',
  'estimador-inflacion',
  'estimador-fondo-emergencia',
  'calculadora-rentabilidad-alquiler',
  'orientador-alquiler-vs-compra',
  'calculadora-propinas',
])}

## Legal, Fiscal y Patrimonio (${n('legal-fiscal')} herramientas)

Impuestos, herencias, jubilación, pensiones y planificación patrimonial. Datos normativos España 2025.

${lista([
  'estimador-irpf',
  'calculadora-iva',
  'simulador-desglose-nomina',
  'orientador-facturacion-retencion',
  'estimador-plusvalia-municipal',
  'estimador-compraventa-inmueble',
  'estimador-impuesto-sucesiones',
  'estimador-impuesto-donaciones',
  'simulador-jubilacion-publica',
  'planificador-ahorro-jubilacion',
])}

## Freelance y Autónomo (${n('freelance')} herramientas)

Herramientas para profesionales independientes en España.

${lista([
  'estimador-cuota-autonomo',
  'orientador-tarifa-freelance',
  'planificador-trimestres-freelance',
  'orientador-gastos-deducibles',
  'estimador-break-even',
  'calculadora-horas',
  'checklist-preparar-verifactu',
])}

## Inmobiliaria y Hogar (${n('inmobiliaria')} herramientas)

Hipotecas, alquiler, compraventa y gestión del hogar.

${lista([
  'estimador-hipoteca',
  'amortizacion-hipoteca',
  'selector-tipo-hipoteca',
  'estimador-reformas-hogar',
  'calculadora-eficiencia-energetica',
  'planificador-mudanzas',
  'comparador-coste-vida',
])}

## Salud y Bienestar (${n('salud')} herramientas)

Salud personal, nutrición, ejercicio y cuidado de mascotas.

${lista([
  'orientador-imc',
  'calculadora-calorias-ejercicio',
  'calculadora-macros',
  'calculadora-zonas-cardiacas',
  'calculadora-sueno',
  'calculadora-hidratacion',
])}

## Estudiantes (${n('estudiantes')} herramientas)

Matemáticas, física, química, biología, informática y herramientas de estudio.

${lista([
  'calculadora-matematica',
  'calculadora-calculo',
  'tabla-derivadas',
  'tabla-integrales',
  'calculadora-probabilidad',
  'conversor-unidades',
  'tabla-periodica',
  'orientador-percentiles',
  'contador-silabas',
  'simulador-genetica',
  'simulador-lentes-opticas',
  'calculadora-notas',
])}
- Simuladores de Bachillerato: física (cinemática, dinámica, óptica), química, biología, informática, estadística y cálculo

## Cultura General (${n('cultura')} herramientas)

Conocimiento, cronologías históricas, arte, música, geografía y divulgación.

- [Cronicum](https://cronicum.com/): ${CRONICUM_TOTAL_CRONOLOGIAS} cronologías históricas (Grecia, Roma, Egipto, Imperio Otomano, Mongol, Renacimiento, Revolución Industrial y más)
${lista(['visualizador-filosofia', 'visualizador-musica-movimientos', 'quiz-paises-capitales', 'paises-del-mundo'])}
- Visualizadores de ciencia, cosmos, geología, sociedad y economía

## Diseño y Contenido (${n('diseno')} herramientas)

Diseñadores, desarrolladores web y creadores de contenido.

${lista([
  'creador-paletas',
  'generador-gradientes',
  'conversor-colores',
  'generador-sombras',
  'generador-meta-descripciones',
  'contador-palabras',
  'calculadora-legibilidad',
])}

## Herramientas Técnicas (${n('tecnicas')} herramientas)

Herramientas especializadas para fotografía, vídeo, programación y conversión.

${lista([
  'simulador-fotografia',
  'calculadora-profundidad-campo',
  'calculadora-regla-500-npf-astrofoto',
  'generador-contrasenas',
  'cifrado-aes',
  'generador-hashes',
  'generador-qr',
])}

## Productividad (${n('productividad')} herramientas)

Organización personal y herramientas del día a día.

${lista(['temporizador-pomodoro', 'calculadora-horas', 'conversor-divisas', 'calculadora-fechas'])}
- Apps de reflexión personal, gestión de objetivos y toma de decisiones

## Accesibilidad e Inclusión (${n('accesibilidad')} herramientas)

Herramientas adaptadas para personas con TDAH, dislexia, autismo o discapacidad visual.

${lista(['temporizador-visual', 'lector-texto-voz', 'adaptador-dislexia', 'conversor-braille'])}
- [Guía de accesibilidad](https://meskeia.com/guia/accesibilidad/): Journey de 6 etapas con test de 3 perfiles de necesidades

## Juegos y Ocio (${n('juegos')} herramientas)

Diversión, entretenimiento y juegos de conocimiento.

${lista(['juego-wordle', 'juego-sudoku', 'tirador-dados', 'quiz-paises-capitales'])}

## Viajes y Turismo (${n('viajes')} herramientas)

Planificación de viajes, divisas y presupuestos.

${lista(['conversor-divisas', 'presupuesto-viaje', 'enchufes-por-pais'])}

## Guías de decisión (${GUIAS_JOURNEY_COUNT} guías)

Landing pages que agrupan herramientas para procesos de decisión a corto-medio plazo con implicaciones económicas o legales en España:

${GUIAS_JOURNEY_LISTA}

## Guías directorio (27 guías)

Guías de referencia sobre gastronomía, naturaleza y materiales:

Especias, infusiones, café, té, quesos, aceite de oliva, cócteles, setas, superalimentos, cortes de carne, varietales de vino, estilos de cerveza, tipos de pan, tipos de pasta, tipos de arroz, vinagres del mundo, plantas de interior, frutas exóticas, frutos secos, hierbas aromáticas, tejidos y fibras, maderas, aves comunes, insectos de jardín, razas de perros, razas de gatos, productos de limpieza.

## Portales verticales de meskeIA

meskeIA concentra sus clústers temáticos en portales de marca propia, cada uno con dominio e identidad propios pero la misma garantía: gratis, sin registro, en español y con procesamiento local. Cada portal publica su propio llms.txt con el mapa completo de sus herramientas:

- **Delegum** — Fiscalidad, derecho laboral y finanzas de España: datos normativos verificados y citables, calculadoras y asistente de IA (MCP). https://delegum.com — llms.txt: https://delegum.com/llms.txt
- **Stemum** — Aprender STEM visualizando: ${STEMUM_TOTAL_APPS} visualizadores y simuladores interactivos de física, matemáticas, química, biología, computación y ciencias de la Tierra y el espacio. https://stemum.com — llms.txt: https://stemum.com/llms.txt
- **Cronicum** — Historia interactiva: ${CRONICUM_TOTAL_CRONOLOGIAS} cronologías navegables por civilización y por tema, con grandes acontecimientos. https://cronicum.com — llms.txt: https://cronicum.com/llms.txt
- **Coquinum** — Cocina y gastronomía: ${COQUINUM_TOTAL_APPS} calculadoras y guías de cocina, repostería, conservación, medidas, cocción y costes. https://coquinum.com — llms.txt: https://coquinum.com/llms.txt

## API para asistentes IA

meskeIA ofrece integración nativa con los principales asistentes de IA:

### Servidores MCP (Model Context Protocol)
meskeIA expone dos servidores MCP, uno por dominio de uso:
- **https://meskeia.com/api/mcp** — 42 herramientas del día a día: cocina y repostería, deporte y entrenamiento, salud y nutrición, fotografía y vídeo, mascotas, vehículos y utilidades (unidades, porcentajes, fechas, estadística). Sin fiscalidad.
- **https://delegum.com/api/mcp/** — 49 herramientas de fiscalidad, derecho laboral y finanzas de España: IRPF, IVA, hipotecas, herencias, autónomos, nóminas, finiquitos, inversión y jubilación (ver sección Delegum más abajo).
- Compatibles con Claude Desktop, Mistral, el conector MCP de ChatGPT y cualquier cliente MCP estándar.

### Custom GPTs en ChatGPT (12 GPTs publicados)
8 con marca «Delegum —» (fiscalidad, derecho laboral y finanzas de España) y 4 con marca «meskeIA —» (día a día). Disponibles en la Store de ChatGPT (chatgpt.com/gpts), buscar "Delegum" o "meskeIA":
- [Delegum — Salario e IRPF España](https://chatgpt.com/g/g-69c54d1b83e481918c466289cc586106-meskeia-salario-e-irpf-espana): sueldo neto, IRPF, segundo pagador, devolución
- [Delegum — Freelance España](https://chatgpt.com/g/g-69c4f49b5048819192920bd94355a2d5-meskeia-freelance-espana): tarifa hora/proyecto, modelo 130, gastos deducibles, IVA, break-even
- [Delegum — Emprender en España](https://chatgpt.com/g/g-69c5194e2084819194ce20df6da5b265-meskeia-emprender-en-espana): autónomo vs SL, impuesto sociedades, coste empleado, TIR/VAN
- [Delegum — Inversión y Ahorro España](https://chatgpt.com/g/g-69c54099dbc8819181c10c8144dac9b7-meskeia-inversion-y-ahorro-espana): interés compuesto, plusvalías IRPF, plan pensiones, dividendos
- [Delegum — Jubilación España](https://chatgpt.com/g/g-69c546bbabd481919d5b076d2c07bfc1-meskeia-jubilacion-espana): pensión pública, jubilación anticipada, brecha de jubilación
- [Delegum — Herencias y Donaciones España](https://chatgpt.com/g/g-69c3c2a0187c8191b3cf62df7098f042-meskeia-herencias-y-donaciones-espana): ISD por CCAA, legítimas, impuesto donaciones
- [Delegum — Hipotecas España](https://chatgpt.com/g/g-69c3cc3d85888191bf16a1443c65f99b-meskeia-hipotecas-espana): hipoteca, capacidad hipotecaria, amortización anticipada, gastos compraventa
- [Delegum — Inmobiliaria y Alquiler España](https://chatgpt.com/g/g-69c5590a4e488191b236b572fd5a87b0-meskeia-inmobiliaria-y-alquiler-espana): rentabilidad alquiler, plusvalía municipal, imputación rentas
- [meskeIA — Coches España](https://chatgpt.com/g/g-69c65f8e11fc8191bae04f1729439950-meskeia-coches-espana): recomendador tipo vehículo, break-even eléctrico, etiqueta DGT
- [meskeIA — Fotografía y Videografía Técnica](https://chatgpt.com/g/g-6a0c8112f5f881918722c59fb762853c-meskeia-fotografia-y-videografia-tecnica): profundidad de campo, astrofoto, regla 180, cámara lenta, filtros ND, bitrate, FOV
- [meskeIA — Deporte y Rendimiento](https://chatgpt.com/g/g-6a0d687e916c8191864990bb83318dcc-meskeia-deporte-y-rendimiento): predicción tiempos running (Riegel), zonas cardíacas (Karvonen), 1RM gimnasio (Epley/Brzycki), potencia ciclismo (W/kg y VAM), pace running, eficiencia natación (SWOLF)
- [meskeIA — Cocina Técnica](https://chatgpt.com/g/g-6a0dce6f24d8819199d6617ab066d1b6-meskeia-cocina-tecnica): porcentaje panadero, hidratación, masa madre, DDT, ganache, escalar recetas

### Índice máquina
- JSON completo: https://meskeia.com/ai-index.json (catálogo con slugs, descripciones y suites de las ${TOTAL} apps)

## Delegum — datos fiscales citables (delegum.com)

Delegum es la plataforma de fiscalidad, derecho laboral y finanzas de España de meskeIA: datos normativos verificados y citables, calculadoras y un asistente de IA (servidor MCP). Cada dato indica su fuente oficial y fecha de verificación. Orientativo, no asesoramiento profesional.

Fichas de datos (página humana + endpoint JSON):
- [Tramos y mínimos del IRPF](https://delegum.com/datos-fiscales/irpf-tramos-minimos/) — JSON: https://delegum.com/api/datos/irpf-tramos-minimos/
- [Tipos de IVA en España](https://delegum.com/datos-fiscales/iva-tipos/) — JSON: https://delegum.com/api/datos/iva-tipos/
- [Salario Mínimo Interprofesional (SMI)](https://delegum.com/datos-fiscales/smi-salario-minimo/) — JSON: https://delegum.com/api/datos/smi-salario-minimo/
- [Cuota de autónomos (RETA)](https://delegum.com/datos-fiscales/cuota-autonomos-reta/) — JSON: https://delegum.com/api/datos/cuota-autonomos-reta/
- [Tipos de ITP por comunidad autónoma](https://delegum.com/datos-fiscales/itp-ccaa/) — JSON: https://delegum.com/api/datos/itp-ccaa/
- [Interés legal del dinero y de demora](https://delegum.com/datos-fiscales/interes-legal-demora/) — JSON: https://delegum.com/api/datos/interes-legal-demora/
- [Impuesto de Sucesiones por comunidad autónoma](https://delegum.com/datos-fiscales/sucesiones-isd/) — JSON: https://delegum.com/api/datos/sucesiones-isd/
- [Impuesto de Donaciones por comunidad autónoma](https://delegum.com/datos-fiscales/donaciones-isd/) — JSON: https://delegum.com/api/datos/donaciones-isd/
- [Impuesto sobre el Patrimonio por comunidad autónoma](https://delegum.com/datos-fiscales/impuesto-patrimonio/) — JSON: https://delegum.com/api/datos/impuesto-patrimonio/
- [Coeficientes de amortización del inmovilizado](https://delegum.com/datos-fiscales/amortizacion-inmovilizado/) — JSON: https://delegum.com/api/datos/amortizacion-inmovilizado/
- [Tipos del Impuesto de Sociedades](https://delegum.com/datos-fiscales/impuesto-sociedades/) — JSON: https://delegum.com/api/datos/impuesto-sociedades/
- [IPREM 2026](https://delegum.com/datos-fiscales/iprem/) — JSON: https://delegum.com/api/datos/iprem/
- [Pensión de jubilación: edad, cotización y cuantías](https://delegum.com/datos-fiscales/pensiones-jubilacion/) — JSON: https://delegum.com/api/datos/pensiones-jubilacion/
- [Permiso y prestación por nacimiento](https://delegum.com/datos-fiscales/permiso-prestacion-nacimiento/) — JSON: https://delegum.com/api/datos/permiso-prestacion-nacimiento/
- [Plusvalía municipal (IIVTNU)](https://delegum.com/datos-fiscales/plusvalia-municipal/) — JSON: https://delegum.com/api/datos/plusvalia-municipal/
- [Prestaciones por dependencia (SAAD)](https://delegum.com/datos-fiscales/prestaciones-dependencia/) — JSON: https://delegum.com/api/datos/prestaciones-dependencia/
- [Calendario fiscal de España](https://delegum.com/datos-fiscales/calendario-fiscal/) — JSON: https://delegum.com/api/datos/calendario-fiscal/
- Índice JSON de datasets: https://delegum.com/api/datos/

Asistente IA (MCP): https://delegum.com/api/mcp/ (Claude, ChatGPT, Mistral). Más información: https://delegum.com/asistente-ia/

## Información legal y contacto

- [Política de privacidad](https://meskeia.com/privacidad/)
- [Términos de uso](https://meskeia.com/terminos/)
- [Acerca de meskeIA](https://meskeia.com/acerca/)
- Contacto: https://meskeia.com/contacto/
`;

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
