const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// Mapa completo: [nombreAntiguo, nombreNuevo, urlAntigua, urlNueva]
const renames = [
  ['Simulador de Hipoteca', 'Estimador de Hipoteca', '/simulador-hipoteca/', '/estimador-hipoteca/'],
  ['Simulador de Préstamos', 'Estimador de Préstamos', '/simulador-prestamos/', '/estimador-prestamos/'],
  ['Simulador de Cartera de Inversión', 'Estimador de Cartera de Inversión', '/simulador-cartera-inversion/', '/estimador-cartera-inversion/'],
  ['Calculadora de Jubilación', 'Estimador de Jubilación', '/calculadora-jubilacion/', '/estimador-jubilacion/'],
  ['Calculadora de Inversiones', 'Estimador de Inversiones', '/calculadora-inversiones/', '/estimador-inversiones/'],
  ['Calculadora FIRE', 'Estimador FIRE', '/calculadora-fire/', '/estimador-fire/'],
  ['Calculadora Seguro de Vida', 'Orientador Seguro de Vida', '/calculadora-seguro-vida/', '/orientador-seguro-vida/'],
  ['Calculadora de Infraseguro', 'Estimador de Infraseguro', '/calculadora-infraseguro/', '/estimador-infraseguro/'],
  ['Calculadora de Deuda', 'Estimador de Deuda', '/calculadora-deuda/', '/estimador-deuda/'],
  ['Calculadora de Tensión Arterial', 'Orientador Tensión Arterial', '/calculadora-tension-arterial/', '/orientador-tension-arterial/'],
  ['Calculadora de Colesterol', 'Orientador Colesterol', '/calculadora-colesterol/', '/orientador-colesterol/'],
  ['Calculadora de Medicamentos Mascotas', 'Orientador Medicamentos Mascotas', '/calculadora-medicamentos-mascotas/', '/orientador-medicamentos-mascotas/'],
  ['Simulador de Compraventa Inmobiliaria', 'Estimador Compraventa Inmobiliaria', '/simulador-compraventa-inmueble/', '/estimador-compraventa-inmueble/'],
  ['Calculadora Regla 50/30/20', 'Orientador Regla 50/30/20', '/calculadora-regla-50-30-20/', '/orientador-regla-50-30-20/'],
  ['Calculadora Fondo de Emergencia', 'Estimador Fondo de Emergencia', '/calculadora-fondo-emergencia/', '/estimador-fondo-emergencia/'],
  ['Calculadora Alquiler vs Compra', 'Orientador Alquiler vs Compra', '/calculadora-alquiler-vs-compra/', '/orientador-alquiler-vs-compra/'],
  ['Calculadora TIR-VAN', 'Estimador TIR-VAN', '/calculadora-tir-van/', '/estimador-tir-van/'],
  ['Calculadora Break-Even', 'Estimador Break-Even', '/calculadora-break-even/', '/estimador-break-even/'],
  ['Calculadora ROI Marketing', 'Estimador ROI Marketing', '/calculadora-roi-marketing/', '/estimador-roi-marketing/'],
  ['Calculadora Tarifa Freelance', 'Orientador Tarifa Freelance', '/calculadora-tarifa-freelance/', '/orientador-tarifa-freelance/'],
  ['Calculadora Coste Vivienda', 'Estimador Coste Vivienda', '/calculadora-coste-vivienda/', '/estimador-coste-vivienda/'],
  ['Calculadora de Reformas del Hogar', 'Estimador Reformas del Hogar', '/calculadora-reformas-hogar/', '/estimador-reformas-hogar/'],
  ['Calculadora IMC', 'Orientador IMC', '/calculadora-imc/', '/orientador-imc/'],
  ['Calculadora Percentiles Infantiles', 'Orientador Percentiles Infantiles', '/calculadora-percentiles/', '/orientador-percentiles/'],
  ['Calculadora de Interés Compuesto', 'Estimador Interés Compuesto', '/interes-compuesto/', '/estimador-interes-compuesto/'],
  ['Calculadora de Inflación', 'Estimador de Inflación', '/calculadora-inflacion/', '/estimador-inflacion/'],
  ['Calculadora de Gastos de Comunidad', 'Estimador Gastos de Comunidad', '/calculadora-gastos-comunidad/', '/estimador-gastos-comunidad/'],
  ['Calculadora Coste Real a Plazos', 'Estimador Coste Real a Plazos', '/calculadora-coste-plazos/', '/estimador-coste-plazos/'],
  ['Simulador de Jet Lag', 'Orientador de Jet Lag', '/simulador-jet-lag/', '/orientador-jet-lag/'],
];

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function applyRenames(filePath) {
  const full = path.join(BASE, filePath);
  let content = fs.readFileSync(full, 'utf8');
  let changes = 0;
  for (const [oldName, newName, oldUrl, newUrl] of renames) {
    const before = content;
    content = content.split(oldName).join(newName);
    content = content.split(oldUrl).join(newUrl);
    if (content !== before) changes++;
  }
  fs.writeFileSync(full, content, 'utf8');
  console.log(filePath + ': ' + changes + ' entradas modificadas');
  return changes;
}

let total = 0;
total += applyRenames('data/applications.ts');
total += applyRenames('data/implemented-apps.ts');
total += applyRenames('data/app-relations.ts');
console.log('Total cambios en data files: ' + total);

module.exports = { renames };
