import { applicationsDatabase } from '@/data/applications';
import { STEMUM_TOTAL_APPS } from '@/data/stemum';
import { COQUINUM_TOTAL_APPS } from '@/data/coquinum';
import { CRONICUM_TOTAL_CRONOLOGIAS } from '@/data/cronicum/puertas';

// llms.txt de meskeIA (meskeia.com/llms.txt).
//
// Mapa curado del catálogo para LLMs (ChatGPT, Perplexity, Claude, Gemini…).
// El proxy reescribe meskeia.com/llms.txt → /llms-txt (un .txt estático en
// public/ no podía auto-refrescar las cifras y caducaba: ahora el total de apps,
// los counts por suite, la fecha y los contadores de los verticales se calculan
// en build desde los datos. Las cifras de MCP (185 tools) y GPTs (12) siguen
// siendo manuales: no se derivan del catálogo de apps.
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

- **¿Cuánto voy a pagar de IRPF este año?** → [Estimador IRPF](https://meskeia.com/estimador-irpf/): tramos 2025, mínimo personal y familiar, cuota íntegra y resultado a pagar o devolver.
- **¿Cuánto es el IVA de este precio?** → [Calculadora IVA](https://meskeia.com/calculadora-iva/): añadir o quitar IVA al 21%, 10% o 4%; base imponible y cuota.
- **¿Qué gastos tiene comprar una vivienda?** → [Gastos compraventa](https://meskeia.com/gastos-compraventa/): ITP o IVA, notaría, registro y gestoría por comunidad autónoma.
- **¿Cuánto se paga de herencias en mi comunidad autónoma?** → [Calculadora herencias](https://meskeia.com/calculadora-herencias/): impuesto de sucesiones por CCAA con bonificaciones y reducciones 2025.
- **¿Cuánto pagaré de plusvalía municipal al vender mi piso?** → [Plusvalía municipal](https://meskeia.com/plusvalia-municipal/): cálculo IIVTNU por método real u objetivo con datos normativos 2025.
- **¿Cuánto me retienen de IRPF en la nómina?** → [Calculadora de retenciones](https://meskeia.com/calculadora-retenciones/): retención estimada según salario, situación familiar y número de pagadores.

### Nóminas, autónomos y freelance

- **¿Cuánto me queda neto de mi sueldo bruto?** → [Simulador desglose nómina](https://meskeia.com/simulador-desglose-nomina/): cotizaciones SS + IRPF animados paso a paso, bruto a neto con datos 2025.
- **¿Cuánto pagaré de cuota de autónomo con mis ingresos?** → [Estimador cuota autónomo](https://meskeia.com/estimador-cuota-autonomo/): tramos RETA 2025 por ingresos netos reales; tarifa plana para nuevos autónomos.
- **¿A cuánto tengo que poner mi tarifa hora como freelance?** → [Calculadora tarifa freelance](https://meskeia.com/tarifa-freelance/): precio cubriendo impuestos, gastos, vacaciones y margen de beneficio.
- **¿Cuánto pago de modelo 130 este trimestre?** → [Modelo 130](https://meskeia.com/modelo-130/): pago fraccionado IRPF trimestral para autónomos en estimación directa.

### Hipotecas y vivienda

- **¿Cuánto pagaré de hipoteca al mes?** → [Estimador hipoteca](https://meskeia.com/estimador-hipoteca/): cuota mensual, intereses totales y tabla de amortización completa para hipoteca fija, variable o mixta.
- **¿Cuánta hipoteca me puede conceder el banco?** → [Capacidad hipotecaria](https://meskeia.com/capacidad-hipoteca/): importe máximo según la regla del 30-35% de los ingresos netos.
- **¿Me conviene amortizar hipoteca reduciendo cuota o plazo?** → [Amortización anticipada](https://meskeia.com/amortizacion-anticipada/): comparativa de ahorro en intereses para cada opción.
- **¿Me sale mejor alquilar o comprar?** → [Alquiler vs compra](https://meskeia.com/alquiler-vs-compra/): coste total a largo plazo de cada opción incluyendo inflación y coste de oportunidad.

### Jubilación e inversión

- **¿Cuándo me puedo jubilar y qué pensión tendré?** → [Simulador jubilación pública](https://meskeia.com/simulador-jubilacion-publica/): edad ordinaria según años cotizados, pensión estimada y coeficientes de jubilación anticipada.
- **¿Cuánto necesito ahorrar para la jubilación?** → [Planificador ahorro jubilación](https://meskeia.com/planificador-ahorro-jubilacion/): brecha entre sueldo y pensión, ahorro mensual necesario y ventaja fiscal del plan de pensiones.
- **¿Cuánto crecerá mi dinero con interés compuesto?** → [Estimador interés compuesto](https://meskeia.com/estimador-interes-compuesto/): capital final con aportaciones periódicas, regla del 72, gráfico de evolución año a año.
- **¿En cuántos años me podré retirar si ahorro X al mes?** → [Calculadora FIRE](https://meskeia.com/calculadora-fire/): número FIRE, tasa de ahorro necesaria y años hasta la independencia financiera.

### Salud y bienestar

- **¿Cuál es mi IMC y qué significa?** → [Orientador IMC](https://meskeia.com/orientador-imc/): índice de masa corporal con clasificación OMS (bajo peso, normal, sobrepeso, obesidad) y rango saludable para tu altura.
- **¿Cuántas calorías necesito al día?** → [Calculadora calorías](https://meskeia.com/calculadora-calorias/): TDEE diario según peso, altura, edad, sexo y nivel de actividad física.
- **¿Cuántas calorías quemo corriendo, caminando o nadando?** → [Calorías por ejercicio](https://meskeia.com/calculadora-calorias-ejercicio/): gasto calórico con valores MET científicos para más de 30 actividades.
- **¿Cuántas proteínas, carbohidratos y grasas debo tomar?** → [Calculadora macros](https://meskeia.com/calculadora-macros/): distribución de macronutrientes personalizada según objetivo (volumen, definición o mantenimiento).
- **¿Cuáles son mis zonas de frecuencia cardíaca para entrenar?** → [Frecuencia cardíaca](https://meskeia.com/frecuencia-cardiaca/): zonas de entrenamiento por FCmax y método Karvonen.

### Educación y ciencia

- **¿Cuál es mi media ponderada universitaria?** → [Calculadora notas](https://meskeia.com/calculadora-notas/): media ponderada con créditos ECTS, simulador EvAU y conversión entre escalas de calificación.
- **¿Cuál es la masa molar de un compuesto?** → [Tabla periódica interactiva](https://meskeia.com/tabla-periodica/): 118 elementos con masas atómicas, electronegatividad y propiedades; cálculo de masa molar de cualquier compuesto.
- **¿Cómo se resuelve esta derivada o integral?** → [Derivadas](https://meskeia.com/calculadora-derivadas/) e [Integrales](https://meskeia.com/calculadora-integrales/): cálculo simbólico paso a paso.
- **¿Cuáles son las leyes de Mendel y cómo funciona la herencia?** → [Simulador genética](https://meskeia.com/simulador-genetica/): cuadros de Punnett, herencia ligada al sexo y genética de poblaciones.

### Cotidiano y productividad

- **¿Qué producto me sale más barato por unidad o por kilo?** → [Comparador de precios](https://meskeia.com/comparador-precios/): precio por unidad para comparar formatos y tamaños del supermercado.
- **¿Cuántos días hay entre dos fechas?** → [Calculadora de días](https://meskeia.com/calculadora-dias/): días naturales, hábiles, semanas y meses entre cualquier par de fechas.
- **¿Cómo genero una contraseña segura?** → [Generador de contraseñas](https://meskeia.com/generador-contrasenas/): contraseñas aleatorias configurables, procesadas localmente sin enviarlas a ningún servidor.

### Fotografía y técnica

- **¿Qué apertura, ISO y velocidad usar para esta foto?** → [Simulador de fotografía](https://meskeia.com/simulador-fotografia/): triángulo de exposición con simulación visual del resultado.
- **¿Cuánto tiempo de exposición máximo en astrofotografía sin trepidación estelar?** → [Regla 500/NPF astrofoto](https://meskeia.com/calculadora-regla-500-npf-astrofoto/): tiempo máximo según sensor, focal y montura.
- **¿Cuánta profundidad de campo tengo con este objetivo y apertura?** → [Profundidad de campo](https://meskeia.com/calculadora-profundidad-campo/): DOF según cámara, focal, apertura y distancia.

## Finanzas e Inversión (${n('finanzas')} herramientas)

Ahorro, inversión y planificación financiera personal.

- [Interés compuesto](https://meskeia.com/interes-compuesto/): Simulador de crecimiento de inversiones a largo plazo con aportaciones periódicas
- [Calculadora de ahorro](https://meskeia.com/calculadora-ahorro/): Proyección de ahorro con interés compuesto y objetivo de capital
- [Calculadora FIRE](https://meskeia.com/calculadora-fire/): Independencia financiera y retiro anticipado (número FIRE, tasa de ahorro)
- [Calculadora de inflación](https://meskeia.com/calculadora-inflacion/): Impacto de la inflación en el poder adquisitivo a largo plazo
- [Regla del 72](https://meskeia.com/regla-del-72/): Tiempo para duplicar una inversión según la tasa de rentabilidad
- [Fondo de emergencia](https://meskeia.com/fondo-emergencia/): Calcular el colchón financiero recomendado según gastos y perfil
- [Comparador de depósitos](https://meskeia.com/comparador-depositos/): Rentabilidad real de depósitos bancarios descontando inflación
- [Calculadora de dividendos](https://meskeia.com/calculadora-dividendos/): Rendimiento por dividendos con reinversión compuesta
- [Rentabilidad alquiler](https://meskeia.com/rentabilidad-alquiler/): Rentabilidad bruta y neta de inversión en vivienda para alquiler
- [Alquiler vs compra](https://meskeia.com/alquiler-vs-compra/): Comparar coste total de alquilar frente a comprar vivienda a largo plazo
- [Calculadora de propinas](https://meskeia.com/calculadora-propinas/): División de cuenta con propina entre comensales

## Legal, Fiscal y Patrimonio (${n('legal-fiscal')} herramientas)

Impuestos, herencias, jubilación, pensiones y planificación patrimonial. Datos normativos España 2025.

- [Calculadora IRPF](https://meskeia.com/calculadora-irpf/): Tramos IRPF 2025 con mínimos personales y familiares
- [Calculadora de IVA](https://meskeia.com/calculadora-iva/): IVA general (21%), reducido (10%) y superreducido (4%)
- [Calculadora de nómina](https://meskeia.com/calculadora-nomina/): Salario neto desde bruto con IRPF y Seguridad Social
- [Calculadora de retenciones](https://meskeia.com/calculadora-retenciones/): Retención IRPF en nómina y facturas profesionales
- [Plusvalía municipal](https://meskeia.com/plusvalia-municipal/): IIVTNU por método real u objetivo al vender vivienda
- [Gastos compraventa](https://meskeia.com/gastos-compraventa/): ITP/IVA, notaría, registro y gestoría al comprar vivienda por CCAA
- [Calculadora de herencias](https://meskeia.com/calculadora-herencias/): Impuesto de sucesiones por comunidad autónoma con bonificaciones
- [Calculadora de donaciones](https://meskeia.com/calculadora-donaciones/): Impuesto de donaciones por comunidad autónoma
- [Impuesto de sociedades](https://meskeia.com/calculadora-impuesto-sociedades/): Tipos IS y regímenes especiales (general, entidades pequeñas, start-ups)
- [Calculadora de finiquito](https://meskeia.com/calculadora-finiquito/): Liquidación por fin de contrato laboral
- [Calculadora de jubilación](https://meskeia.com/calculadora-jubilacion/): Pensión estimada según años cotizados y base reguladora
- [Jubilación anticipada](https://meskeia.com/jubilacion-anticipada/): Coeficientes reductores por jubilación antes de la edad legal
- [Planificador de pensiones](https://meskeia.com/planificador-pensiones/): Plan de ahorro complementario para cubrir brecha de jubilación

## Freelance y Autónomo (${n('freelance')} herramientas)

Herramientas para profesionales independientes en España.

- [Cuota de autónomos](https://meskeia.com/cuota-autonomos/): Tramos RETA 2025 según ingresos reales netos
- [Tarifa freelance](https://meskeia.com/tarifa-freelance/): Calcular tarifa hora/proyecto incluyendo impuestos, gastos y vacaciones
- [Modelo 130](https://meskeia.com/modelo-130/): Pago fraccionado IRPF trimestral para autónomos en estimación directa
- [Gastos deducibles](https://meskeia.com/gastos-deducibles-autonomos/): Qué gastos puede deducirse un autónomo en IRPF
- [Break-even freelance](https://meskeia.com/break-even/): Punto de equilibrio ingresos/gastos para profesionales independientes
- [Horas facturables](https://meskeia.com/horas-facturables/): Calcular horas reales productivas descontando vacaciones y baja
- [Checklist Verifactu](https://meskeia.com/checklist-verifactu/): Verificar cumplimiento del sistema de facturación electrónica

## Inmobiliaria y Hogar (${n('inmobiliaria')} herramientas)

Hipotecas, alquiler, compraventa y gestión del hogar.

- [Simulador de hipoteca](https://meskeia.com/simulador-hipoteca/): Cuota mensual, intereses totales y amortización para hipoteca fija, variable o mixta
- [Capacidad hipotecaria](https://meskeia.com/capacidad-hipoteca/): Cuánta hipoteca puedes permitirte según la regla del 30%
- [Amortización anticipada](https://meskeia.com/amortizacion-anticipada/): Comparar reducir cuota vs reducir plazo al amortizar hipoteca antes de tiempo
- [Selector de hipoteca](https://meskeia.com/selector-hipoteca/): Recomendación fija/variable/mixta/verde según perfil y tolerancia al riesgo
- [Calculadora de reforma](https://meskeia.com/calculadora-reforma/): Presupuesto estimado para reformas del hogar por tipo y superficie
- [Eficiencia energética](https://meskeia.com/eficiencia-energetica/): Ahorro potencial con mejoras energéticas en vivienda
- [Calculadora de mudanza](https://meskeia.com/calculadora-mudanza/): Estimación de costes de mudanza según distancia y volumen
- [Coste de vida por ciudades](https://meskeia.com/coste-vida-ciudades/): Comparar coste de vida entre ciudades españolas

## Salud y Bienestar (${n('salud')} herramientas)

Salud personal, nutrición, ejercicio y cuidado de mascotas.

- [Calculadora de IMC](https://meskeia.com/calculadora-imc/): Índice de masa corporal con interpretación y tabla de peso saludable
- [Calculadora de calorías](https://meskeia.com/calculadora-calorias/): Necesidades calóricas diarias según actividad física y objetivo
- [Calculadora de macros](https://meskeia.com/calculadora-macros/): Distribución óptima de macronutrientes personalizada
- [Frecuencia cardíaca](https://meskeia.com/frecuencia-cardiaca/): Zonas de entrenamiento por frecuencia cardíaca máxima
- [Calculadora de sueño](https://meskeia.com/calculadora-sueno/): Ciclos de sueño REM y hora óptima para acostarse o despertarse
- [Coste de fumar](https://meskeia.com/coste-fumar/): Impacto económico y sanitario del tabaquismo a largo plazo
- [Hidratación diaria](https://meskeia.com/hidratacion-diaria/): Cantidad de agua recomendada según peso, actividad y clima

## Estudiantes (${n('estudiantes')} herramientas)

Matemáticas, física, química, biología, informática y herramientas de estudio.

- [Calculadora científica](https://meskeia.com/calculadora-cientifica/): Operaciones científicas, trigonometría y funciones avanzadas
- [Calculadora de matrices](https://meskeia.com/calculadora-matrices/): Determinante, inversa, multiplicación y transposición de matrices
- [Calculadora de derivadas](https://meskeia.com/calculadora-derivadas/): Derivadas simbólicas paso a paso
- [Calculadora de integrales](https://meskeia.com/calculadora-integrales/): Integrales definidas e indefinidas paso a paso
- [Calculadora de probabilidad](https://meskeia.com/calculadora-probabilidad/): Combinaciones, permutaciones y distribuciones de probabilidad
- [Conversor de unidades](https://meskeia.com/conversor-unidades/): Longitud, peso, volumen, temperatura, presión y más
- [Tabla periódica](https://meskeia.com/tabla-periodica/): Tabla periódica interactiva con masas molares, electronegatividad, configuración electrónica y propiedades de los 118 elementos
- [Orientador de percentiles](https://meskeia.com/orientador-percentiles/): Calcular e interpretar percentiles en contextos educativos, médicos y estadísticos
- [Contador de sílabas](https://meskeia.com/contador-silabas/): Contar sílabas en español con separación silábica, acentuación y clasificación de palabras (aguda, llana, esdrújula)
- [Simulador de genética](https://meskeia.com/simulador-genetica/): Leyes de Mendel, cuadros de Punnett, herencia ligada al sexo y genética de poblaciones
- [Simulador de lentes ópticas](https://meskeia.com/simulador-lentes-opticas/): Óptica geométrica: lentes convergentes y divergentes, focos, espejos y formación de imágenes
- [Calculadora de notas](https://meskeia.com/calculadora-notas/): Media ponderada de calificaciones con equivalencias entre sistemas de notas (español, europeo, internacional)
- Simuladores de Bachillerato: física (cinemática, dinámica, óptica), química, biología, informática, estadística y cálculo

## Cultura General (${n('cultura')} herramientas)

Conocimiento, cronologías históricas, arte, música, geografía y divulgación.

- [Visualizador historia](https://meskeia.com/visualizador-historia/): ${CRONICUM_TOTAL_CRONOLOGIAS} cronologías históricas (Grecia, Roma, Egipto, Imperio Otomano, Mongol, Renacimiento, Revolución Industrial y más)
- [Cronologías de filosofía](https://meskeia.com/visualizador-filosofia/): Corrientes filosóficas desde la Antigüedad hasta hoy
- [Movimientos musicales](https://meskeia.com/visualizador-musica-movimientos/): Historia de los movimientos musicales con contexto
- [Quiz de banderas](https://meskeia.com/quiz-banderas/): Identificar banderas del mundo
- [Quiz de capitales](https://meskeia.com/quiz-capitales/): Adivinar capitales del mundo
- Visualizadores de ciencia, cosmos, geología, sociedad y economía

## Diseño y Contenido (${n('diseno')} herramientas)

Diseñadores, desarrolladores web y creadores de contenido.

- [Generador de paletas](https://meskeia.com/generador-paletas/): Paletas de colores armónicas para diseño web
- [Generador de gradientes](https://meskeia.com/generador-gradientes/): Gradientes CSS personalizables con código listo para copiar
- [Conversor de colores](https://meskeia.com/conversor-colores/): Convertir entre HEX, RGB, HSL y otros formatos
- [Generador de sombras CSS](https://meskeia.com/generador-sombras/): Box-shadow CSS visual e interactivo
- [Generador de meta tags](https://meskeia.com/generador-meta-tags/): Meta tags SEO con vista previa de Google y redes sociales
- [Contador de palabras](https://meskeia.com/contador-palabras/): Palabras, caracteres, tiempo de lectura y densidad de keywords
- [Analizador de legibilidad](https://meskeia.com/analizador-legibilidad/): Índice Flesch-Szigriszt adaptado al español
- [Calculadora de engagement](https://meskeia.com/calculadora-engagement/): Tasa de engagement para Instagram, TikTok y YouTube

## Herramientas Técnicas (${n('tecnicas')} herramientas)

Herramientas especializadas para fotografía, vídeo, programación y conversión.

- [Simulador de fotografía](https://meskeia.com/simulador-fotografia/): Triángulo de exposición (ISO, apertura, velocidad) con simulación visual
- [Calculadora profundidad de campo](https://meskeia.com/calculadora-profundidad-campo/): DOF según objetivo, apertura y distancia
- [Calculadora regla 500/NPF astrofoto](https://meskeia.com/calculadora-regla-500-npf-astrofoto/): Exposición máxima sin trepidación estelar
- [Generador de contraseñas](https://meskeia.com/generador-contrasenas/): Contraseñas seguras configurables por longitud y caracteres
- [Cifrado de texto](https://meskeia.com/cifrado-texto/): Cifrado AES-256 en el navegador sin enviar datos al servidor
- [Generador de hashes](https://meskeia.com/generador-hashes/): MD5, SHA-1, SHA-256, SHA-512
- [Generador de QR](https://meskeia.com/generador-qr/): Códigos QR para URLs, texto, WiFi y vCard

## Productividad (${n('productividad')} herramientas)

Organización personal y herramientas del día a día.

- [Temporizador Pomodoro](https://meskeia.com/pomodoro/): Técnica Pomodoro con ciclos configurables y sonidos
- [Calculadora de tiempo](https://meskeia.com/calculadora-tiempo/): Sumar y restar horas, minutos y segundos
- [Comparador de precios](https://meskeia.com/comparador-precios/): Precio por unidad para comparar ofertas del supermercado
- [Conversor de divisas](https://meskeia.com/conversor-divisas/): Tipos de cambio actualizados
- [Calculadora de días](https://meskeia.com/calculadora-dias/): Días entre dos fechas, días hábiles y festivos
- Apps de reflexión personal, gestión de objetivos y toma de decisiones

## Accesibilidad e Inclusión (${n('accesibilidad')} herramientas)

Herramientas adaptadas para personas con TDAH, dislexia, autismo o discapacidad visual.

- [Herramientas TDAH](https://meskeia.com/tdah-herramientas/): Timer visual, ruido blanco y organizador para personas con TDAH
- [Lector accesible](https://meskeia.com/lector-accesible/): Lectura adaptada con fuentes para dislexia (OpenDyslexic)
- [Conversor Braille](https://meskeia.com/conversor-braille/): Texto a Braille y viceversa
- [Calculadora accesible](https://meskeia.com/calculadora-accesible/): Calculadora con alto contraste y navegación completa por teclado
- [Guía de accesibilidad](https://meskeia.com/guia/accesibilidad/): Journey de 6 etapas con test de 3 perfiles de necesidades

## Juegos y Ocio (${n('juegos')} herramientas)

Diversión, entretenimiento y juegos de conocimiento.

- [Wordle en español](https://meskeia.com/wordle-espanol/): Wordle diario con palabras en español
- [Sudoku](https://meskeia.com/sudoku/): Sudoku con múltiples niveles de dificultad
- [Generador de dados](https://meskeia.com/generador-dados/): Dados virtuales de 4, 6, 8, 10, 12 y 20 caras
- [Quiz de banderas](https://meskeia.com/quiz-banderas/): Adivinar banderas de todos los países del mundo
- [Quiz de capitales](https://meskeia.com/quiz-capitales/): Adivinar capitales del mundo por continente

## Viajes y Turismo (${n('viajes')} herramientas)

Planificación de viajes, divisas y presupuestos.

- [Conversor de divisas](https://meskeia.com/conversor-divisas/): Tipos de cambio para más de 150 países
- [Calculadora de viaje](https://meskeia.com/calculadora-viaje/): Presupuesto completo para un viaje
- [Buscador de enchufes](https://meskeia.com/tipos-enchufes/): Tipos de enchufes y voltajes por país

## Guías de decisión (14 guías)

Landing pages que agrupan herramientas para procesos de decisión a corto-medio plazo con implicaciones económicas o legales en España:

- [Guía: Comprar casa](https://meskeia.com/guia/comprar-casa/): Proceso completo de compra de vivienda (hipoteca, gastos, ITP, reforma)
- [Guía: Invertir](https://meskeia.com/guia/invertir/): Primeros pasos en inversión (interés compuesto, perfil de riesgo, cartera, plusvalías)
- [Guía: Jubilación](https://meskeia.com/guia/jubilacion/): Pensión pública, brecha de ingresos, ahorro complementario, plan de pensiones e IRPF como pensionista
- [Guía: Freelance](https://meskeia.com/guia/freelance/): Todo para darte de alta como autónomo (cuota RETA, tarifa, modelo 130)
- [Guía: Ahorrar dinero](https://meskeia.com/guia/ahorrar-dinero/): Estrategias de ahorro y control de gastos (regla 50/30/20, fondo de emergencia)
- [Guía: Montar negocio](https://meskeia.com/guia/montar-negocio/): Emprender en España (forma jurídica, costes, impuestos)
- [Guía: Comprar coche](https://meskeia.com/guia/comprar-coche/): Decisión de compra: contado, financiación o renting; consumo y seguro
- [Guía: Vivir sano](https://meskeia.com/guia/vivir-sano/): Herramientas de salud y bienestar integradas (IMC, macros, sueño, hábitos)
- [Guía: Accesibilidad](https://meskeia.com/guia/accesibilidad/): Herramientas para neurodivergencia y discapacidad
- [Guía: Gestionar una herencia](https://meskeia.com/guia/herencias/): Documentos, impuestos y plazos (sucesiones por CCAA, donaciones, plusvalía municipal)
- [Guía: Pensar mejor](https://meskeia.com/guia/pensar-mejor/): Herramientas de reflexión para conocerse, decidir mejor y emprender con criterio
- [Guía: Programar con IA](https://meskeia.com/guia/programar-con-ia/): Empezar a construir webs, apps o scripts con asistentes de IA paso a paso
- [Guía: Primer empleo](https://meskeia.com/guia/primer-empleo/): Del estudio al primer trabajo (competencias digitales DigComp, currículum ATS-friendly, entrevista por competencias STAR y primer sueldo)
- [Guía: Seguridad en internet](https://meskeia.com/guia/seguridad-internet/): Proteger cuentas y privacidad online (contraseñas fuertes, verificación en dos pasos, detectar phishing y qué hacer si te hackean)

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

### Servidor MCP (Model Context Protocol)
- URL: https://meskeia.com/api/mcp
- 185 herramientas de cálculo disponibles: 163 fiscal/financieras + 8 cocina técnica + 6 deporte + 5 videografía + 3 fotografía
- Compatible con Claude Desktop, Perplexity Pro y cualquier cliente MCP
- Uso: calculadoras de IRPF, hipotecas, herencias, autónomos, nóminas, finiquitos, inversión, jubilación, fotografía y más

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
