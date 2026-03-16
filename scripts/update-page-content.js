const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// [carpetaNueva, nombreAntiguo, nombreNuevo, slugAntiguo, slugNuevo, cssAntiguo, cssNuevo]
const apps = [
  ['estimador-hipoteca', 'Simulador de Hipoteca', 'Estimador de Hipoteca', 'simulador-hipoteca', 'estimador-hipoteca', 'SimuladorHipoteca', 'EstimadorHipoteca'],
  ['estimador-prestamos', 'Simulador de Préstamos', 'Estimador de Préstamos', 'simulador-prestamos', 'estimador-prestamos', 'SimuladorPrestamos', 'EstimadorPrestamos'],
  ['estimador-cartera-inversion', 'Simulador de Cartera de Inversión', 'Estimador de Cartera de Inversión', 'simulador-cartera-inversion', 'estimador-cartera-inversion', 'SimuladorCartera', 'EstimadorCartera'],
  ['estimador-jubilacion', 'Calculadora de Jubilación', 'Estimador de Jubilación', 'calculadora-jubilacion', 'estimador-jubilacion', 'CalculadoraJubilacion', 'EstimadorJubilacion'],
  ['estimador-inversiones', 'Calculadora de Inversiones', 'Estimador de Inversiones', 'calculadora-inversiones', 'estimador-inversiones', 'CalculadoraInversiones', 'EstimadorInversiones'],
  ['estimador-fire', 'Calculadora FIRE', 'Estimador FIRE', 'calculadora-fire', 'estimador-fire', 'Fire', 'EstimadorFire'],
  ['orientador-seguro-vida', 'Calculadora Seguro de Vida', 'Orientador Seguro de Vida', 'calculadora-seguro-vida', 'orientador-seguro-vida', 'CalculadoraSeguroVida', 'OrientadorSeguroVida'],
  ['estimador-infraseguro', 'Calculadora de Infraseguro', 'Estimador de Infraseguro', 'calculadora-infraseguro', 'estimador-infraseguro', 'CalculadoraInfraseguro', 'EstimadorInfraseguro'],
  ['estimador-deuda', 'Calculadora de Deuda', 'Estimador de Deuda', 'calculadora-deuda', 'estimador-deuda', 'CalculadoraDeuda', 'EstimadorDeuda'],
  ['orientador-tension-arterial', 'Calculadora de Tensión Arterial', 'Orientador Tensión Arterial', 'calculadora-tension-arterial', 'orientador-tension-arterial', 'CalculadoraTensionArterial', 'OrientadorTensionArterial'],
  ['orientador-colesterol', 'Calculadora de Colesterol', 'Orientador Colesterol', 'calculadora-colesterol', 'orientador-colesterol', 'CalculadoraColesterol', 'OrientadorColesterol'],
  ['orientador-medicamentos-mascotas', 'Calculadora de Medicamentos Mascotas', 'Orientador Medicamentos Mascotas', 'calculadora-medicamentos-mascotas', 'orientador-medicamentos-mascotas', 'CalculadoraMedicamentosMascotas', 'OrientadorMedicamentosMascotas'],
  ['estimador-compraventa-inmueble', 'Simulador de Compraventa Inmobiliaria', 'Estimador Compraventa Inmobiliaria', 'simulador-compraventa-inmueble', 'estimador-compraventa-inmueble', 'SimuladorCompraventa', 'EstimadorCompraventa'],
  ['orientador-regla-50-30-20', 'Calculadora Regla 50/30/20', 'Orientador Regla 50/30/20', 'calculadora-regla-50-30-20', 'orientador-regla-50-30-20', 'Regla503020', 'OrientadorRegla503020'],
  ['estimador-fondo-emergencia', 'Calculadora Fondo de Emergencia', 'Estimador Fondo de Emergencia', 'calculadora-fondo-emergencia', 'estimador-fondo-emergencia', 'FondoEmergencia', 'EstimadorFondoEmergencia'],
  ['orientador-alquiler-vs-compra', 'Calculadora Alquiler vs Compra', 'Orientador Alquiler vs Compra', 'calculadora-alquiler-vs-compra', 'orientador-alquiler-vs-compra', 'CalculadoraAlquilerVsCompra', 'OrientadorAlquilerVsCompra'],
  ['estimador-tir-van', 'Calculadora TIR-VAN', 'Estimador TIR-VAN', 'calculadora-tir-van', 'estimador-tir-van', 'CalculadoraTirVan', 'EstimadorTirVan'],
  ['estimador-break-even', 'Calculadora Break-Even', 'Estimador Break-Even', 'calculadora-break-even', 'estimador-break-even', 'CalculadoraBreakEven', 'EstimadorBreakEven'],
  ['estimador-roi-marketing', 'Calculadora ROI Marketing', 'Estimador ROI Marketing', 'calculadora-roi-marketing', 'estimador-roi-marketing', 'CalculadoraROIMarketing', 'EstimadorROIMarketing'],
  ['orientador-tarifa-freelance', 'Calculadora Tarifa Freelance', 'Orientador Tarifa Freelance', 'calculadora-tarifa-freelance', 'orientador-tarifa-freelance', 'CalculadoraTarifaFreelance', 'OrientadorTarifaFreelance'],
  ['estimador-coste-vivienda', 'Calculadora Coste Vivienda', 'Estimador Coste Vivienda', 'calculadora-coste-vivienda', 'estimador-coste-vivienda', 'CalculadoraCosteVivienda', 'EstimadorCosteVivienda'],
  ['estimador-reformas-hogar', 'Calculadora de Reformas del Hogar', 'Estimador Reformas del Hogar', 'calculadora-reformas-hogar', 'estimador-reformas-hogar', 'CalculadoraReformasHogar', 'EstimadorReformasHogar'],
  ['orientador-imc', 'Calculadora IMC', 'Orientador IMC', 'calculadora-imc', 'orientador-imc', 'CalculadoraIMC', 'OrientadorIMC'],
  ['orientador-percentiles', 'Calculadora Percentiles Infantiles', 'Orientador Percentiles Infantiles', 'calculadora-percentiles', 'orientador-percentiles', 'CalculadoraPercentiles', 'OrientadorPercentiles'],
  ['estimador-interes-compuesto', 'Calculadora de Interés Compuesto', 'Estimador Interés Compuesto', 'interes-compuesto', 'estimador-interes-compuesto', 'InteresCompuesto', 'EstimadorInteresCompuesto'],
  ['estimador-inflacion', 'Calculadora de Inflación', 'Estimador de Inflación', 'calculadora-inflacion', 'estimador-inflacion', 'CalculadoraInflacion', 'EstimadorInflacion'],
  ['estimador-gastos-comunidad', 'Calculadora de Gastos de Comunidad', 'Estimador Gastos de Comunidad', 'calculadora-gastos-comunidad', 'estimador-gastos-comunidad', 'CalculadoraGastosComunidad', 'EstimadorGastosComunidad'],
  ['estimador-coste-plazos', 'Calculadora Coste Real a Plazos', 'Estimador Coste Real a Plazos', 'calculadora-coste-plazos', 'estimador-coste-plazos', 'CalculadoraCostePlazos', 'EstimadorCostePlazos'],
  ['orientador-jet-lag', 'Simulador de Jet Lag', 'Orientador de Jet Lag', 'simulador-jet-lag', 'orientador-jet-lag', 'SimuladorJetLag', 'OrientadorJetLag'],
];

let totalFiles = 0;
let totalChanges = 0;

for (const [folder, oldName, newName, oldSlug, newSlug, oldCss, newCss] of apps) {
  const dir = path.join(BASE, 'app', folder);
  const files = ['page.tsx', 'metadata.ts', 'layout.tsx'];

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;

    // Reemplazar nombre visible (nombre antiguo → nombre nuevo)
    content = content.split(oldName).join(newName);
    // Reemplazar slug en Footer appName, ShareCard appName, etc.
    content = content.split(oldSlug).join(newSlug);
    // Reemplazar import CSS
    content = content.split(oldCss + '.module.css').join(newCss + '.module.css');

    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalChanges++;
      console.log('  ' + folder + '/' + file + ': actualizado');
    }
    totalFiles++;
  }
}

console.log('\nTotal archivos procesados: ' + totalFiles);
console.log('Total archivos modificados: ' + totalChanges);
