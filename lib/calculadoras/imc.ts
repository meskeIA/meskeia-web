/**
 * Calculadora de IMC — lógica pura sin React ni DOM
 * Usada por: asistente conversacional, MCP server
 */

export interface ParametrosIMC {
  pesoKg: number;
  alturaCm: number;
}

export interface ResultadoIMC {
  imc: number;
  imcFormateado: string;      // "24,2"
  categoria: string;           // "Normopeso", "Sobrepeso"...
  descripcion: string;
  icono: string;
  pesoIdealMinKg: number;
  pesoIdealMaxKg: number;
  diferenciaKg: number;        // kg hasta peso ideal (negativo = bajar, positivo = subir)
}

const CATEGORIAS = [
  { max: 18.5,     texto: 'Bajo peso',          descripcion: 'IMC inferior a 18,5. Puede indicar desnutrición o problemas de salud.',      icono: '⚠️'  },
  { max: 25,       texto: 'Normopeso',           descripcion: 'IMC entre 18,5 y 24,9. Peso saludable según la OMS.',                        icono: '✅'  },
  { max: 30,       texto: 'Sobrepeso',           descripcion: 'IMC entre 25 y 29,9. Riesgo aumentado de enfermedades.',                     icono: '⚡'  },
  { max: 35,       texto: 'Obesidad grado I',    descripcion: 'IMC entre 30 y 34,9. Se recomienda consultar con un profesional.',           icono: '🔶' },
  { max: 40,       texto: 'Obesidad grado II',   descripcion: 'IMC entre 35 y 39,9. Riesgo alto de complicaciones de salud.',               icono: '🔴' },
  { max: Infinity, texto: 'Obesidad grado III',  descripcion: 'IMC igual o superior a 40. Requiere atención médica especializada.',         icono: '🚨' },
];

export function calcularIMC(p: ParametrosIMC): ResultadoIMC {
  if (p.pesoKg <= 0 || p.pesoKg > 500) {
    throw new Error('El peso debe estar entre 1 y 500 kg.');
  }
  if (p.alturaCm <= 0 || p.alturaCm > 300) {
    throw new Error('La altura debe estar entre 1 y 300 cm.');
  }

  const alturaM = p.alturaCm / 100;
  const imc = p.pesoKg / (alturaM * alturaM);

  const cat = CATEGORIAS.find((c) => imc < c.max)!;

  const pesoIdealMin = 18.5 * alturaM * alturaM;
  const pesoIdealMax = 24.9 * alturaM * alturaM;

  let diferenciaKg: number;
  if (imc < 18.5) {
    diferenciaKg = pesoIdealMin - p.pesoKg;  // positivo: hay que subir
  } else if (imc > 24.9) {
    diferenciaKg = pesoIdealMax - p.pesoKg;  // negativo: hay que bajar
  } else {
    diferenciaKg = 0;
  }

  return {
    imc,
    imcFormateado: imc.toFixed(1).replace('.', ','),
    categoria: cat.texto,
    descripcion: cat.descripcion,
    icono: cat.icono,
    pesoIdealMinKg: Math.round(pesoIdealMin * 10) / 10,
    pesoIdealMaxKg: Math.round(pesoIdealMax * 10) / 10,
    diferenciaKg: Math.round(diferenciaKg * 10) / 10,
  };
}
