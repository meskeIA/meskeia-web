/**
 * Verificación en navegador de las cinco apps que el 10/09/2026 dejaron de llevar su propio
 * cálculo y pasaron a importar el motor de `lib/calculadoras/`.
 *
 * Por qué existe: `tests/calculadoras-invariantes.spec.ts` prueba los MOTORES, que son funciones
 * puras. Lo que ese fichero no puede ver es si la página sigue pintando la cifra en pantalla
 * después de que le cambiaran el origen — que es exactamente el riesgo de esta reparación:
 * renombrar un campo del resultado y dejar un `undefined` donde había un euro.
 *
 * Cada caso está resuelto A MANO contra el artículo que lo sostiene, y todos son casos en los
 * que la web publicaba una cifra DISTINTA de la que respondía el MCP antes de unificar.
 *
 * ⚠️ Nota de método: la primera versión de este fichero afirmaba que en el caso balear NO debía
 * aparecer «100.000,00 €» en pantalla. Falló, y el que estaba mal era el test: esos 100.000 € son
 * el usufructo viudal del art. 45, que es la mitad del haber y es correcto que se publique. Es el
 * mismo aviso del acta del 09/09 —un test no prueba nada hasta releer lo que AFIRMA— cazado esta
 * vez en rojo en lugar de en verde.
 */
import { test, expect } from '@playwright/test';

test.describe('estimador-legitimas — la web ya da la misma legítima que la API', () => {
  test('Baleares con 2 hijos: 1/3, no 1/2 (art. 42 Compilació)', async ({ page }) => {
    await page.goto('/estimador-legitimas/');

    // 200.000 € · Baleares · 2 hijos → legítima 1/3 = 66.666,67 € y libre disposición 133.333,33 €.
    // La copia inline cortaba en UN hijo, así que aquí publicaba 100.000 € de legítima: 33.333,33 €
    // de más, y una libre disposición de 100.000 € en vez de 133.333,33 €.
    await page.getByLabel('Patrimonio neto hereditario (€)').fill('200000');
    await page.getByLabel('Régimen civil aplicable').selectOption('baleares');
    await page.getByLabel('Número de hijos / descendientes').selectOption('2');
    await page.getByRole('button', { name: 'Calcular legítimas' }).click();

    await expect(page.getByText('66.666,67 €').first()).toBeVisible();
    await expect(page.getByText('133.333,33 €').first()).toBeVisible();
    // 66.666,67 / 2 hijos. El desglose por hijo también sale del motor.
    // ⚠️ Los importes se buscan como CADENA, no como expresión regular: `formatCurrency` separa
    // la cifra del € con un espacio duro (U+00A0), y getByText solo normaliza espacios cuando
    // recibe una cadena. Con regex, `33.333,34 €` no casa nunca.
    await expect(page.getByText('33.333,34 €/hijo · Obligatoria')).toBeVisible();
    // La nota explica la fracción con su artículo, y ya no dice que Menorca siga el Derecho Común.
    await expect(page.getByText(/cuatro o menos/i)).toBeVisible();
    await expect(page.getByText(/Menorca[^.]*Derecho Común/i)).toHaveCount(0);
  });

  test('Baleares con 5 hijos sí pasa a 1/2: el corte está donde dice el art. 42', async ({ page }) => {
    await page.goto('/estimador-legitimas/');
    await page.getByLabel('Patrimonio neto hereditario (€)').fill('200000');
    await page.getByLabel('Régimen civil aplicable').selectOption('baleares');
    await page.getByLabel('Número de hijos / descendientes').selectOption('5');
    await page.getByRole('button', { name: 'Calcular legítimas' }).click();

    // 1/2 de 200.000 € = 100.000 €, y la libre disposición es la otra mitad.
    await expect(page.getByText(/más de cuatro/i)).toBeVisible();
    await expect(page.getByText('20.000,00 €/hijo · Obligatoria')).toBeVisible();
  });

  test('el usufructo del viudo vasco es la mitad y ya no se llama «universal»', async ({ page }) => {
    await page.goto('/estimador-legitimas/');
    await page.getByLabel('Patrimonio neto hereditario (€)').fill('300000');
    await page.getByLabel('Régimen civil aplicable').selectOption('pais-vasco');
    await page.getByLabel('Número de hijos / descendientes').selectOption('2');
    await page.getByRole('button', { name: 'Calcular legítimas' }).click();

    // Art. 52 Ley 5/2015: la MITAD, no los 300.000 € enteros que decía la copia inline.
    await expect(page.getByText('Usufructo estimado sobre 150.000,00 €')).toBeVisible();
    // «Universal» era la palabra que delataba el defecto. Se busca SOLO en la tarjeta del
    // cónyuge: más abajo, la guía educativa menciona legítimamente el usufructo universal que el
    // testador PUEDE legar en Derecho Común (cautela Socini), que es otra figura.
    await expect(page.getByText(/Ley 5\/2015 art\. 52/)).toBeVisible();
    await expect(page.getByText(/Usufructo de la mitad de los bienes/)).toBeVisible();
  });

  test('el Derecho Común mantiene sus 2/3 y el desglose cuadra con el caudal', async ({ page }) => {
    await page.goto('/estimador-legitimas/');
    await page.getByLabel('Patrimonio neto hereditario (€)').fill('300000');
    await page.getByLabel('Número de hijos / descendientes').selectOption('3');
    await page.getByRole('button', { name: 'Calcular legítimas' }).click();

    // 300.000 € → estricta 100.000 · mejora 100.000 · libre 100.000. Suman el caudal exacto.
    await expect(page.getByText('Legítima estricta').first()).toBeVisible();
    await expect(page.getByText('Tercio de mejora').first()).toBeVisible();
    await expect(page.getByText('Libre disposición').first()).toBeVisible();
    // 100.000 / 3 hijos = 33.333,33 € cada uno (la estricta es la que se reparte).
    await expect(page.getByText('33.333,33 €/hijo · Obligatoria e igual para todos')).toBeVisible();
  });
});

test.describe('impuestos-divorcio — el asistente sigue llegando a su análisis', () => {
  test('recorrido completo sin bloques opcionales', async ({ page }) => {
    await page.goto('/impuestos-divorcio/');

    // Paso 0 — régimen e ingresos
    await page.getByRole('radio').first().check();
    await page.getByRole('textbox').first().fill('30000');
    await page.getByRole('button', { name: 'Siguiente →' }).click();

    // Pasos 1 a 4: «No» a hijos, vivienda, pensión e hipoteca. El último botón no se llama
    // «No» sino «No / No aplica», de ahí el ancla al principio del nombre en vez de exacto.
    for (let paso = 1; paso <= 4; paso++) {
      await page.getByRole('button', { name: /^No/ }).first().click();
      const avanzar = paso === 4
        ? page.getByRole('button', { name: /Ver mi análisis fiscal/ })
        : page.getByRole('button', { name: 'Siguiente →' });
      await avanzar.click();
    }

    // El paso 5 pinta el análisis, no una pantalla en blanco ni el aviso de datos incompletos.
    await expect(page.getByRole('heading', { name: /análisis fiscal personalizado/i })).toBeVisible();
    await expect(page.getByText(/No se puede calcular con estos datos/i)).toHaveCount(0);
  });

  test('con hipoteca anterior a 2013 que se conserva, la deducción se publica', async ({ page }) => {
    await page.goto('/impuestos-divorcio/');

    await page.getByRole('radio').first().check();
    await page.getByRole('textbox').first().fill('40000');
    await page.getByRole('button', { name: 'Siguiente →' }).click();

    // Hijos, vivienda y pensión: no.
    for (let paso = 1; paso <= 3; paso++) {
      await page.getByRole('button', { name: /^No/ }).first().click();
      await page.getByRole('button', { name: 'Siguiente →' }).click();
    }

    // Paso 4 — hipoteca anterior a 2013, me la quedo, 6.000 €/año → 6.000 × 15 % = 900 €.
    // Es el caso del «TODO: unificar»: el motor, sin el discriminante, afirmaba que se PERDÍA
    // la deducción. Aquí se declara, y la deducción tiene que salir publicada.
    await page.getByRole('button', { name: 'Sí', exact: true }).first().click();
    await page.getByRole('radio', { name: /Yo me quedo con la hipoteca/ }).check();
    await page.getByRole('textbox').last().fill('6000');
    await page.getByRole('button', { name: /Ver mi análisis fiscal/ }).click();

    await expect(page.getByText('900,00 €/año')).toBeVisible();
  });
});

test.describe('estimacion-deduccion-discapacidad — la regla del art. 60', () => {
  test('grado ≥65 % sin acreditar ayuda: el mínimo llega a 12.000 €', async ({ page }) => {
    await page.goto('/estimacion-deduccion-discapacidad/');

    // Ascendiente · ≥65 % · SIN marcar la casilla de ayuda de terceros → 9.000 + 3.000 = 12.000 €.
    // Los tres supuestos del art. 60 son ALTERNATIVOS y el grado basta por sí solo. Esta era la
    // regla que el motor tenía mal y la app tenía bien: al unificar había que conservar la de la app.
    await page.getByRole('radio', { name: /ascendiente/i }).check();
    await page.getByRole('radio', { name: /65% o superior/i }).check();
    await expect(page.getByRole('checkbox', { name: /asistencia de terceras/i })).not.toBeChecked();
    await page.getByRole('button', { name: /Estimar ahorro fiscal/i }).click();

    await expect(page.getByText('12.000,00 €').first()).toBeVisible();
  });

  test('grado 33-64 % sin acreditar ayuda: ahí el incremento NO procede', async ({ page }) => {
    await page.goto('/estimacion-deduccion-discapacidad/');

    // Con grado 33-64 % la acreditación sí es condición necesaria: solo el mínimo de 3.000 €.
    await page.getByRole('radio', { name: /ascendiente/i }).check();
    await page.getByRole('radio', { name: /33% al 64%/i }).check();
    await page.getByRole('button', { name: /Estimar ahorro fiscal/i }).click();

    // Sin acreditar, con grado 33-64 % el incremento de asistencia NO procede: la línea de
    // gastos de asistencia queda en cero. (La guía educativa de más abajo también imprime
    // 12.000 €, así que ese importe no sirve para distinguir: se mira la línea que cambia.)
    await expect(page.getByText('0,00 €').first()).toBeVisible();
  });
});

test.describe('estimacion-deduccion-maternidad — el límite por cotizaciones ya se pregunta', () => {
  test('un hijo, 12 meses y cotizaciones holgadas: 1.200 € sin recorte', async ({ page }) => {
    await page.goto('/estimacion-deduccion-maternidad/');

    await page.getByLabel(/Cotizaciones a la Seguridad Social/i).fill('3000');
    await page.getByRole('button', { name: /Estimar deduccion/i }).click();

    // 12 meses × 100 € = 1.200 €, por debajo de las cotizaciones: no hay recorte que anunciar.
    // Se escribe «1200,00 €» sin punto: el español no agrupa los números de cuatro cifras, y
    // `Intl.NumberFormat('es-ES')` lo respeta. No es un fallo de formato.
    await expect(page.getByText('1200,00 €').first()).toBeVisible();
    await expect(page.getByText(/Limite por cotizaciones/i)).toHaveCount(0);
  });

  test('con cotizaciones por debajo, el límite del art. 81.1 recorta Y SE DICE', async ({ page }) => {
    await page.goto('/estimacion-deduccion-maternidad/');

    // 500 € cotizados topan la deducción de 1.200 € en 500 €. La página sin este campo publicaba
    // 1.200 € a cualquiera, que es el máximo legal y rara vez la cifra de nadie.
    await page.getByLabel(/Cotizaciones a la Seguridad Social/i).fill('500');
    await page.getByRole('button', { name: /Estimar deduccion/i }).click();

    await expect(page.getByText(/Limite por cotizaciones/i).first()).toBeVisible();
    await expect(page.getByText('500,00 €').first()).toBeVisible();
  });

  test('sin el dato de cotizaciones no se publica ninguna cifra', async ({ page }) => {
    await page.goto('/estimacion-deduccion-maternidad/');
    await page.getByRole('button', { name: /Estimar deduccion/i }).click();

    // Se dice por qué y NO se enseña un número: un aviso debajo de una cifra falsa no vale.
    await expect(page.getByRole('heading', { name: /No se puede estimar con estos datos/i })).toBeVisible();
    // No se comprueba la ausencia del importe en TODA la página: la guía educativa cita 1.200 €
    // como cuantía de la deducción, y eso es correcto. Lo que no debe existir es el panel de
    // resultado, que es donde saldría la cifra atribuida a ESTE usuario.
    await expect(page.getByText('Total deduccion anual')).toHaveCount(0);
  });

  test('los meses con derecho recortan la deducción: medio año son 600 €', async ({ page }) => {
    await page.goto('/estimacion-deduccion-maternidad/');

    // 6 meses × 100 € = 600 €. Antes esta página daba 1.200 € naciera el bebé en enero o en julio.
    await page.getByLabel(/Cotizaciones a la Seguridad Social/i).fill('3000');
    await page.getByLabel(/Meses del ano en que fue menor de 3 anos/i).selectOption('6');
    await page.getByRole('button', { name: /Estimar deduccion/i }).click();

    await expect(page.getByText('600,00 €').first()).toBeVisible();
  });
});

test.describe('orientador-impuesto-patrimonio — el veredicto del art. 37', () => {
  test('Madrid con 1,5 M €: cuota 0 y NO obligado a declarar', async ({ page }) => {
    await page.goto('/orientador-impuesto-patrimonio/');

    await page.getByLabel('Selecciona tu comunidad autónoma').selectOption('madrid');
    await page.getByLabel(/Otros bienes \(vehículos/).fill('1500000');

    // La bonificación del 100 % deja la cuota en cero, y el art. 37 mide sobre la cuota YA
    // bonificada. Antes esta página decía «obligado a declarar» contradiciendo a su propia FAQ.
    await expect(page.getByText(/no.*obligad/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Madrid con 2,5 M € brutos: obligado por la segunda vía del art. 37', async ({ page }) => {
    await page.goto('/orientador-impuesto-patrimonio/');

    await page.getByLabel('Selecciona tu comunidad autónoma').selectOption('madrid');
    await page.getByLabel(/Otros bienes \(vehículos/).fill('2500000');
    // Deudas grandes: los bienes BRUTOS no las descuentan, y son ellos los que obligan.
    await page.getByLabel(/Deudas deducibles/).fill('2000000');

    await expect(page.getByText(/2\.000\.000|obligado/i).first()).toBeVisible({ timeout: 10000 });
  });
});
