import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Testigo de la familia «campo numérico que se puede teclear» — components/CampoNumerico.tsx
 *
 * DE DÓNDE SALE (cabos C0066, C0069 y C0081; Agenda `campo-numerico-compartido`, 19/10/2026)
 * Un `<input type="number">` con `onChange={(e) => setX(Number(e.target.value) || respaldo)}`
 * entrega vacío en cualquier estado intermedio, así que vaciar el campo lo rellenaba con el
 * respaldo BAJO EL CURSOR y lo tecleado quedaba detrás («1» + «3» = «13»), y «14.» o «-» a medio
 * escribir se convertían en 0. `fill()` no lo ve: escribe el valor entero de golpe y el test pasa
 * en verde. Por eso aquí se teclea PULSACIÓN A PULSACIÓN, como una persona.
 *
 * Para cada campo migrado:
 *   1. se vacía con Ctrl+A y Retroceso → el campo queda VACÍO (antes: el respaldo);
 *   2. se teclea la cifra tecla a tecla → el campo enseña exactamente lo tecleado;
 *   3. la app la usa: el valor aplicado (`aria-valuenow`) es esa cifra y, si la página la
 *      enseña en algún sitio, lo enseña en formato español;
 *   4. al salir del campo, enseña el valor aplicado en formato español.
 *
 * Reinyección: con el `type="number"` de antes, el paso 1 falla (el campo se rellena con el
 * respaldo: medido el 19/10/2026 en simulador-disoluciones, «1» donde debía quedar vacío).
 *
 * Una app migrada a CampoNumerico se añade a CAMPOS.
 */

interface Campo {
  slug: string;
  /** Selector del campo. */
  campo: string;
  /** Lo que se teclea, tecla a tecla. */
  teclear: string;
  /** El valor que la app tiene que aplicar. */
  valor: number;
  /** Lo que tiene que decir la página con ese valor (selector y texto), si lo enseña. */
  lectura?: { selector: string; texto: string };
  /** Lo que enseña el campo al salir. */
  alSalir: string;
  /** Antes de tocar el campo (pestañas, modos). */
  preparar?: (page: Page) => Promise<void>;
  /** Selector CSS de un `<input>` presente al cargar, si el campo solo aparece tras `preparar`. */
  hidratado?: string;
}

const CAMPOS: Campo[] = [
  {
    slug: 'calculadora-seccion-cable',
    campo: '#tension',
    teclear: '400',
    valor: 400,
    lectura: { selector: 'label[for="tension"]', texto: '400 V' },
    alSalir: '400',
  },
  {
    slug: 'calculadora-seccion-cable',
    campo: '#longitud',
    teclear: '12.5',
    valor: 12.5,
    lectura: { selector: 'label[for="longitud"]', texto: '12,5 m' },
    alSalir: '12,5',
  },
  {
    slug: 'calculadora-seccion-cable',
    campo: '#potencia',
    teclear: '2300',
    valor: 2300,
    lectura: { selector: 'label[for="potencia"]', texto: '2300 W' },
    alSalir: '2300',
  },
  {
    slug: 'calculadora-seccion-cable',
    campo: '#corriente',
    teclear: '16,5',
    valor: 16.5,
    lectura: { selector: 'label[for="corriente"]', texto: '16,5 A' },
    alSalir: '16,5',
    hidratado: '#tension',
    preparar: async (page) => {
      await page.getByRole('button', { name: 'Corriente (A)' }).click();
    },
  },
  {
    // Antes: Math.max(1, … Number(v) || 1): vaciar dejaba «1» y teclear «58» daba 158
    slug: 'simulador-disoluciones',
    campo: 'input[aria-label="Masa molar personalizada en g/mol"]',
    teclear: '58.44',
    valor: 58.44,
    lectura: { selector: 'p:has(input[aria-label="Masa molar personalizada en g/mol"]) strong', texto: '58,44 g/mol' },
    alSalir: '58,44',
    hidratado: '#masa-input',
    preparar: async (page) => {
      await page.locator('button:has-text("Personalizado")').first().click();
    },
  },
  {
    // Antes: Number(v) sin respaldo: vaciar dejaba «0» y «120» se leía «0120»
    slug: 'calculadora-tiempo-lectura',
    campo: '#velocidad-personalizada',
    teclear: '120',
    valor: 120,
    alSalir: '120',
  },
  {
    slug: 'calculadora-zonas-entrenamiento',
    campo: '#edad',
    teclear: '35',
    valor: 35,
    alSalir: '35',
  },
  {
    slug: 'calculadora-zonas-entrenamiento',
    campo: '#fcrep',
    teclear: '55',
    valor: 55,
    alSalir: '55',
  },
  {
    slug: 'conversor-colores',
    campo: '#ancho-libre',
    teclear: '800',
    valor: 800,
    lectura: { selector: 'button:has-text("Descargar")', texto: '800 × 1080' },
    alSalir: '800',
    hidratado: 'input[placeholder="#000000"]',
    preparar: async (page) => {
      await page.getByRole('button', { name: /A medida/ }).click();
    },
  },
  {
    // Antes: el manejador descartaba lo que caía fuera de 80-220 y React devolvía el campo al
    // valor anterior en cada pulsación: no se podía vaciar ni teclear «160»
    slug: 'calculadora-puntos-azucar',
    campo: '#temp-input',
    teclear: '160',
    valor: 160,
    alSalir: '160',
  },
  {
    // Antes: vaciar escribía «2» y teclear «12» daba «21», topado a 16
    slug: 'simulador-logica-secuencial',
    campo: '#modulo',
    teclear: '12',
    valor: 12,
    alSalir: '12',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Contador binario/ }).first().click();
    },
  },
  // Lote 2 (19/10/2026): la misma forma, encontrada por el censo fuera de la lista del cabo
  {
    // Antes: value={personas || ''} con `|| 1`: vaciar escribía «1» y «4» daba «14»
    slug: 'calculadora-propinas',
    campo: '#personas',
    teclear: '4',
    valor: 4,
    alSalir: '4',
  },
  {
    slug: 'presupuesto-viaje',
    campo: '#dias',
    teclear: '12',
    valor: 12,
    alSalir: '12',
  },
  {
    // Antes: `|| 10`: vaciar escribía «10» y «450» daba «10450»
    slug: 'comparador-transporte-viaje',
    campo: '#distancia',
    teclear: '450',
    valor: 450,
    alSalir: '450',
  },
  {
    // Antes: no dejaba teclear «-»: el navegador entregaba vacío y `|| 0` lo devolvía a 0
    slug: 'tirador-dados',
    campo: 'input[aria-label="Modificador"]',
    teclear: '-3',
    valor: -3,
    alSalir: '-3',
  },
  {
    slug: 'simulador-recursion',
    campo: '#n-fact',
    teclear: '9',
    valor: 9,
    alSalir: '9',
  },
  {
    slug: 'calculadora-fechas',
    campo: '#timeValue',
    teclear: '30',
    valor: 30,
    alSalir: '30',
  },
  {
    // Antes: `|| 30`: vaciar escribía «30» y teclear «21» daba «3021»
    slug: 'seguimiento-habitos',
    campo: '#objetivo-dias',
    teclear: '21',
    valor: 21,
    alSalir: '21',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Nuevo Hábito/ }).click();
    },
  },
  {
    // Antes: la media no dejaba teclear «-»: vacío → `|| 0` → «0»
    slug: 'simulador-intervalos-confianza',
    campo: 'input[aria-label="Media muestral X̄"]',
    teclear: '-2,5',
    valor: -2.5,
    alSalir: '-2,5',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Modo calculadora/ }).click();
    },
  },
  {
    slug: 'estimacion-baja-maternal',
    campo: '#diasHosp',
    teclear: '30',
    valor: 30,
    alSalir: '30',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('checkbox', { name: /Hospitalizacion neonatal/ }).check();
    },
  },
  {
    slug: 'generador-facturas',
    campo: '#configNumero',
    teclear: '25',
    valor: 25,
    alSalir: '25',
  },
  {
    slug: 'simulador-programacion-dinamica',
    campo: 'input[aria-label="Peso del objeto 1"]',
    teclear: '5',
    valor: 5,
    alSalir: '5',
  },
  {
    slug: 'visualizador-combinatoria',
    campo: 'input[aria-label^="Opciones en"] >> nth=0',
    teclear: '7',
    valor: 7,
    alSalir: '7',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('tab', { name: 'Multiplicación y Newton' }).click();
    },
  },
  // Lote 3 (cabo C0311, 19/10/2026): respaldo 0 (o 1, o 2) que el campo pintaba; el defecto
  // más leve de la familia —vaciar escribe 0, «5» da «05», el signo menos no entra—
  {
    slug: 'calculadora-gasto-energetico',
    campo: '[id^="horas-"] >> nth=0',
    teclear: '2,5',
    valor: 2.5,
    alSalir: '2,5',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Personalizado/ }).first().click();
    },
  },
  {
    // `|| 1`: vaciar escribía «1» y «3» daba «13»
    slug: 'calculadora-gasto-energetico',
    campo: '[id^="cantidad-"] >> nth=0',
    teclear: '3',
    valor: 3,
    alSalir: '3',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Personalizado/ }).first().click();
    },
  },
  {
    slug: 'calculadora-tiempos-running',
    campo: '#minutos',
    teclear: '45',
    valor: 45,
    alSalir: '45',
  },
  {
    // Además el campo libre desaparecía al teclear: compartía estado con el desplegable
    slug: 'calculadora-tiempos-running',
    campo: '#distanciaBaseLibre',
    teclear: '8',
    valor: 8,
    alSalir: '8',
    hidratado: '#minutos',
    preparar: async (page) => {
      await page.locator('#distanciaBase').selectOption('0');
    },
  },
  {
    // Temperatura bajo cero: el signo menos no entraba
    slug: 'simulador-calorimetria',
    campo: '#t-inicial',
    teclear: '-18',
    valor: -18,
    alSalir: '-18',
  },
  {
    slug: 'simulador-calorimetria',
    campo: '#masa',
    teclear: '250',
    valor: 250,
    alSalir: '250',
  },
  {
    slug: 'generador-facturas',
    campo: '#cantidad-1',
    teclear: '3',
    valor: 3,
    alSalir: '3',
  },
  {
    slug: 'generador-gradientes',
    campo: 'input[aria-label="Posición del color 2 en porcentaje"]',
    teclear: '40',
    valor: 40,
    alSalir: '40',
  },
  {
    slug: 'generador-horarios-estudio',
    campo: 'input[aria-label="Horas por semana de Matemáticas"]',
    teclear: '7',
    valor: 7,
    alSalir: '7',
  },
  {
    slug: 'planificador-boda',
    campo: 'input[aria-label="Duración en minutos del evento 1"]',
    teclear: '45',
    valor: 45,
    alSalir: '45',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Timeline|Cronograma|Programa/i }).first().click();
    },
  },
  {
    // Además acotaba en cada pulsación: «3» se volvía 100 y no se podía teclear «350»
    slug: 'simulador-equilibrio-quimico',
    campo: '#temperatura',
    teclear: '350',
    valor: 350,
    alSalir: '350',
  },
  {
    slug: 'simulador-equilibrio-quimico',
    campo: '#conc-N₂',
    teclear: '0,75',
    valor: 0.75,
    alSalir: '0,75',
  },
  {
    slug: 'visualizador-convolucion-kernels',
    campo: 'input[aria-label="Peso fila 1 columna 1"]',
    teclear: '-1',
    valor: -1,
    alSalir: '-1',
  },
  {
    slug: 'visualizador-convolucion-kernels',
    campo: '#offset-input',
    teclear: '-20',
    valor: -20,
    alSalir: '-20',
  },
  {
    // Number(''): vaciar escribía 0 y «12» daba «012»; y el valor salía con punto decimal.
    // El campo solo aparece con un vídeo: basta un fichero cualquiera (sin duración, el inicio
    // no se acota por el fin).
    slug: 'extractor-audio-video',
    campo: '#inicio-seg',
    teclear: '12,5',
    valor: 12.5,
    alSalir: '12,5',
    hidratado: 'input[type="file"]',
    preparar: async (page) => {
      await page.locator('input[type="file"]').setInputFiles({
        name: 'prueba.mp4', mimeType: 'video/mp4', buffer: Buffer.from('no es un vídeo'),
      });
    },
  },
  {
    // `value={x || 2}`: vaciar pintaba «2» bajo el cursor y «5» daba «25»
    slug: 'creador-thumbnails',
    campo: 'input[aria-label="Grosor del contorno del texto"]',
    teclear: '5',
    valor: 5,
    alSalir: '5',
    hidratado: 'input',
    preparar: async (page) => {
      await page.getByRole('button', { name: /Texto/ }).first().click();
      await page.getByRole('button', { name: /Añadir Texto/ }).click();
    },
  },
];

for (const c of CAMPOS) {
  test(`${c.slug} ${c.campo}: se vacía y se teclea «${c.teclear}» tecla a tecla`, async ({ page }) => {
    await page.goto(`/${c.slug}/`);
    await esperarHidratacion(page, [c.hidratado ?? c.campo]);
    if (c.preparar) await c.preparar(page);

    const campo = page.locator(c.campo);
    await campo.click();
    await campo.press('Control+a');
    await campo.press('Backspace');
    await expect(campo, 'vaciar el campo NO lo rellena con un respaldo').toHaveValue('');

    await campo.pressSequentially(c.teclear, { delay: 40 });
    await expect(campo, 'el campo enseña lo tecleado, tal cual').toHaveValue(c.teclear);
    await expect(campo, 'la app aplica la cifra tecleada').toHaveAttribute('aria-valuenow', String(c.valor));
    if (c.lectura) await expect(page.locator(c.lectura.selector)).toContainText(c.lectura.texto);

    await campo.press('Tab');
    await expect(campo, 'al salir enseña el valor aplicado').toHaveValue(c.alSalir);
  });
}
