/**
 * Motor de selector-seguro-salud.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Los puntos,
 * los umbrales (pública hasta 2, complementario hasta 7, completo desde 8) y las tres
 * respuestas que fuerzan «sanidad pública» son los MISMOS que tenía la página.
 *
 * Aquí no hay empates que deshacer: es UNA puntuación contra dos umbrales. Lo que cambia son
 * las razones. Antes «sanidad pública» empezaba SIEMPRE por «Tu uso médico actual no
 * justifica el coste mensual de un seguro privado», también cuando lo había decidido el
 * presupuesto («Nada, no quiero gasto extra») a quien acababa de declarar más de diez visitas
 * al año y varios especialistas; y «seguro completo» podía salir sin una sola razón. Ahora se
 * dice qué ha decidido el resultado —la puntuación o la respuesta que lo fuerza— y qué
 * respuestas han sumado y restado.
 */

export type VeredictoKey = 'publico' | 'complementario' | 'completo';

export interface Opcion { valor: string; etiqueta: string; desc: string; }
export interface Pregunta { id: number; categoria: string; pregunta: string; icon: string; opciones: Opcion[]; }

export interface VeredictoInfo {
  nombre: string;
  icon: string;
  descripcion: string;
  cobertura: string[];
  precioOrientativo: string;
  precioNota: string;
}


export const VEREDICTOS: Record<VeredictoKey, VeredictoInfo> = {
  publico: {
    nombre: 'Sanidad pública es suficiente',
    icon: '🏥',
    descripcion: 'La sanidad pública cubre médico de cabecera, especialistas, hospitalización y urgencias. Con tus respuestas, contratar además un seguro privado no es la orientación: abajo tienes qué lo ha decidido.',
    cobertura: ['Médico de cabecera y especialistas', 'Hospitalización y urgencias', 'Analíticas y pruebas diagnósticas', 'Medicamentos con copago reducido'],
    precioOrientativo: '0 €/mes',
    precioNota: 'La sanidad pública está financiada vía impuestos',
  },
  complementario: {
    nombre: 'Seguro complementario recomendado',
    icon: '🛡️',
    descripcion: 'Tu perfil se beneficiaría de un seguro que complemente la sanidad pública: principalmente para reducir tiempos de espera en especialistas y acceder a segunda opinión médica.',
    cobertura: ['Especialistas sin lista de espera', 'Segunda opinión médica', 'Urgencias privadas', 'Cobertura dental básica (con módulo adicional)'],
    precioOrientativo: '35 – 80 €/mes',
    precioNota: 'Precio orientativo para adulto de 30-50 años. Varía por edad, CCAA y aseguradora.',
  },
  completo: {
    nombre: 'Seguro privado completo recomendado',
    icon: '⭐',
    descripcion: 'La suma de tus respuestas justifica un seguro de salud privado completo, más allá de un complemento a la sanidad pública: abajo tienes qué ha pesado más.',
    cobertura: ['Médico de cabecera privado', 'Todos los especialistas', 'Hospitalización en clínica privada', 'Urgencias 24h', 'Pruebas diagnósticas (resonancias, TAC…)', 'Ginecología y pediatría completas'],
    precioOrientativo: '60 – 180 €/mes',
    precioNota: 'Precio orientativo para familia de 3 (adultos 30-45 años + 1 niño). Varía mucho por edad y CCAA.',
  },
};

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1, categoria: 'Tu uso médico', pregunta: '¿Con qué frecuencia vas al médico aproximadamente?', icon: '🩺',
    opciones: [
      { valor: 'raro', etiqueta: 'Casi nunca (1 vez al año o menos)', desc: 'Visitas solo en caso de urgencia clara' },
      { valor: 'normal', etiqueta: 'Ocasional (2-4 veces al año)', desc: 'Revisiones y alguna consulta puntual' },
      { valor: 'frecuente', etiqueta: 'Con frecuencia (5-10 veces al año)', desc: 'Seguimiento de alguna condición' },
      { valor: 'muy_frecuente', etiqueta: 'Muy frecuente (más de 10 veces)', desc: 'Crónico o condición que requiere seguimiento continuo' },
    ],
  },
  {
    id: 2, categoria: 'Tu uso médico', pregunta: '¿Necesitas seguimiento de alguna especialidad médica de forma regular?', icon: '👨‍⚕️',
    opciones: [
      { valor: 'no', etiqueta: 'No, solo médico de cabecera', desc: 'Sin especialistas activos en este momento' },
      { valor: 'uno', etiqueta: 'Sí, un especialista', desc: 'Cardiólogo, dermatólogo, traumatólogo…' },
      { valor: 'varios', etiqueta: 'Sí, varios especialistas', desc: 'Seguimiento en varias especialidades' },
      { valor: 'cronico', etiqueta: 'Tengo una enfermedad crónica', desc: 'Diabetes, HTA, artritis, tiroides…' },
    ],
  },
  {
    id: 3, categoria: 'Tu situación', pregunta: '¿En qué comunidad autónoma resides?', icon: '🗺️',
    opciones: [
      { valor: 'buena', etiqueta: 'Madrid, Navarra o País Vasco', desc: 'Sanidad pública con buen rendimiento relativo' },
      { valor: 'media', etiqueta: 'Cataluña, Galicia, Aragón, Canarias…', desc: 'Sistema público con esperas moderadas' },
      { valor: 'saturada', etiqueta: 'Andalucía, Valencia, Murcia, Castilla-La Mancha…', desc: 'Sistemas con mayor presión asistencial' },
      { valor: 'rural', etiqueta: 'Zona rural o con poca oferta sanitaria', desc: 'Lejanía de centros especializados' },
    ],
  },
  {
    id: 4, categoria: 'Tu situación', pregunta: '¿Tienes hijos menores de 18 años a cargo?', icon: '👨‍👩‍👧',
    opciones: [
      { valor: 'no', etiqueta: 'No tengo hijos', desc: 'Sin menores a cargo' },
      { valor: 'si_1', etiqueta: 'Sí, 1 hijo', desc: 'Un menor en la unidad familiar' },
      { valor: 'si_varios', etiqueta: 'Sí, 2 o más hijos', desc: 'Varios menores a cargo' },
      { valor: 'embarazo', etiqueta: 'Estoy embarazada o planeando estarlo', desc: 'Cobertura maternal importante' },
    ],
  },
  {
    id: 5, categoria: 'Tu situación', pregunta: '¿Cuál es tu situación laboral?', icon: '💼',
    opciones: [
      { valor: 'empresa', etiqueta: 'Empleado/a por cuenta ajena', desc: 'Trabajo para una empresa' },
      { valor: 'autonomo', etiqueta: 'Autónomo/a o freelance', desc: 'Trabajo por cuenta propia' },
      { valor: 'funcionario', etiqueta: 'Funcionario/a (con MUFACE, ISFAS…)', desc: 'Tengo mutualidad de funcionarios' },
      { valor: 'desempleo', etiqueta: 'Desempleo, estudiante o jubilado/a', desc: 'Sin relación laboral activa' },
    ],
  },
  {
    id: 6, categoria: 'Tu uso médico', pregunta: '¿Cuánto valoras el acceso rápido a especialistas (sin esperar meses)?', icon: '⏱️',
    opciones: [
      { valor: 'poco', etiqueta: 'Puedo esperar sin problema', desc: 'Las listas de espera no me afectan mucho' },
      { valor: 'algo', etiqueta: 'Preferiría no esperar, pero lo acepto', desc: 'Me adaptaría aunque no es ideal' },
      { valor: 'mucho', etiqueta: 'Para mí es muy importante ir rápido', desc: 'Las esperas me generan estrés o perjuicio real' },
      { valor: 'critico', etiqueta: 'Es crítico por mi trabajo o condición', desc: 'No puedo permitirme largas bajas o esperas' },
    ],
  },
  {
    id: 7, categoria: 'Tu uso médico', pregunta: '¿Cuál es tu situación de salud dental?', icon: '🦷',
    opciones: [
      { valor: 'bien', etiqueta: 'Bien, solo revisiones anuales', desc: 'Sin tratamientos pendientes' },
      { valor: 'necesito', etiqueta: 'Necesito tratamientos próximamente', desc: 'Empastes, extracciones, ortodoncia…' },
      { valor: 'critico', etiqueta: 'Es un gasto importante para mí cada año', desc: 'Gasto dental recurrente y significativo' },
      { valor: 'indiferente', etiqueta: 'Voy a clínicas privadas de precio económico', desc: 'Ya tengo solución para el dentista' },
    ],
  },
  {
    id: 8, categoria: 'Tu situación', pregunta: '¿Has tenido ya algún seguro de salud privado?', icon: '📋',
    opciones: [
      { valor: 'si_contento', etiqueta: 'Sí y estaba muy satisfecho/a', desc: 'Le saqué partido real' },
      { valor: 'si_neutro', etiqueta: 'Sí pero apenas lo usé', desc: 'No amortizaba el coste mensual' },
      { valor: 'no_interes', etiqueta: 'No, pero me interesa', desc: 'Primera vez que lo considero seriamente' },
      { valor: 'no_duda', etiqueta: 'No, y no estoy seguro/a de si lo necesito', desc: 'Dudas sobre si compensa' },
    ],
  },
  {
    id: 9, categoria: 'Tu presupuesto', pregunta: '¿Cuánto estarías dispuesto/a a pagar mensualmente?', icon: '💶',
    opciones: [
      { valor: 'nada', etiqueta: 'Nada, no quiero gasto extra', desc: 'La sanidad pública debe ser suficiente' },
      { valor: 'poco', etiqueta: 'Hasta 40 €/mes', desc: 'Gasto muy ajustado' },
      { valor: 'medio', etiqueta: '40 – 100 €/mes', desc: 'Inversión razonable en salud' },
      { valor: 'alto', etiqueta: 'Más de 100 €/mes', desc: 'La salud es mi prioridad' },
    ],
  },
  {
    id: 10, categoria: 'Tu presupuesto', pregunta: '¿Tienes actualmente algún seguro de salud por convenio de empresa?', icon: '🏢',
    opciones: [
      { valor: 'si_completo', etiqueta: 'Sí, completo pagado por la empresa', desc: 'Cobertura total sin coste para mí' },
      { valor: 'si_parcial', etiqueta: 'Sí, pero con cobertura limitada', desc: 'Cubre lo básico, quiero ampliar' },
      { valor: 'no', etiqueta: 'No, tendría que contratarlo yo', desc: 'Sin seguro de empresa actualmente' },
      { valor: 'muface', etiqueta: 'Tengo mutualidad de funcionarios (MUFACE/ISFAS)', desc: 'Funcionario con cobertura específica' },
    ],
  },
];

/** Nombre corto de lo que pregunta cada pregunta, para citar la respuesta en las razones. */
export const TEMA: Record<number, string> = {
  1: 'Visitas al médico',
  2: 'Especialistas',
  3: 'Dónde resides',
  4: 'Hijos',
  5: 'Situación laboral',
  6: 'Acceso rápido',
  7: 'Salud dental',
  8: 'Seguro anterior',
  9: 'Presupuesto',
  10: 'Seguro de empresa',
};

/** Puntos de cada respuesta: más puntos, más justificado el seguro privado. */
export const PESOS: Record<number, Record<string, number>> = {
  1: { frecuente: 2, muy_frecuente: 3 },
  2: { uno: 2, varios: 3, cronico: 2 }, // Crónico a veces mejor en pública
  3: { saturada: 2, rural: 2 },
  4: { si_1: 2, si_varios: 3, embarazo: 3 },
  5: { autonomo: 2, funcionario: -3 }, // MUFACE ya cubre
  6: { mucho: 2, critico: 3 },
  7: { necesito: 2, critico: 3 },
  8: { si_contento: 2 },
  9: { nada: -3, poco: -1, alto: 1 },
  10: { si_completo: -5, muface: -4 }, // Ya lo tiene
};

/** Hasta este total, sanidad pública; hasta el siguiente, complementario; por encima, completo. */
export const UMBRAL_PUBLICO = 2;
export const UMBRAL_COMPLEMENTARIO = 7;

export interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
  /** El veredicto que daría la puntuación sola, sin las respuestas que lo fuerzan. */
  veredictoPorPuntos: VeredictoKey;
  /** La respuesta que ha forzado «sanidad pública», si la hay. */
  forzadoPor: 'si_completo' | 'muface' | 'nada' | null;
  razones: string[];
  consejos: string[];
}

const enLetra = (n: number) => `${Math.abs(n)} ${Math.abs(n) === 1 ? 'punto' : 'puntos'}`;

export function calcularResultado(r: Record<number, string>): Resultado {
  const aportes: { id: number; puntos: number }[] = [];
  let puntos = 0;
  for (const [idTexto, porRespuesta] of Object.entries(PESOS)) {
    const id = Number(idTexto);
    const p = porRespuesta[r[id]];
    if (p === undefined) continue;
    puntos += p;
    aportes.push({ id, puntos: p });
  }

  let veredictoPorPuntos: VeredictoKey;
  if (puntos <= UMBRAL_PUBLICO) veredictoPorPuntos = 'publico';
  else if (puntos <= UMBRAL_COMPLEMENTARIO) veredictoPorPuntos = 'complementario';
  else veredictoPorPuntos = 'completo';

  // Override por condición específica (el mismo orden de prioridad que antes)
  let forzadoPor: Resultado['forzadoPor'] = null;
  if (r[10] === 'si_completo') forzadoPor = 'si_completo';
  else if (r[10] === 'muface') forzadoPor = 'muface';
  else if (r[9] === 'nada') forzadoPor = 'nada';
  const veredicto: VeredictoKey = forzadoPor ? 'publico' : veredictoPorPuntos;

  // ─ Razones: qué ha decidido el resultado, y qué ha sumado y restado ─
  const etiqueta = (id: number) =>
    PREGUNTAS.find((p) => p.id === id)?.opciones.find((o) => o.valor === r[id])?.etiqueta ?? '';
  const frase = ({ id, puntos: p }: { id: number; puntos: number }) =>
    `${TEMA[id]}: «${etiqueta(id)}» ${p > 0 ? 'suma' : 'resta'} ${enLetra(p)}.`;
  const suman = aportes.filter((a) => a.puntos > 0).sort((a, b) => b.puntos - a.puntos || a.id - b.id);
  const restan = aportes.filter((a) => a.puntos < 0).sort((a, b) => a.puntos - b.puntos || a.id - b.id);

  const razones: string[] = [];
  if (forzadoPor === 'si_completo') {
    razones.push('Ya tienes cobertura privada completa pagada por tu empresa: la orientación es aprovecharla, no contratar otra.');
  } else if (forzadoPor === 'muface') {
    razones.push('Tienes mutualidad de funcionarios (MUFACE, ISFAS…): ya eliges entre la sanidad pública y la asistencia concertada, así que contratar otro seguro no es la orientación.');
  } else if (forzadoPor === 'nada') {
    razones.push('Has dicho que no quieres ningún gasto extra: con ese presupuesto la orientación es la sanidad pública, sea cual sea la puntuación.');
  }
  if (forzadoPor && veredictoPorPuntos !== 'publico') {
    razones.push(`Sin esa respuesta, tu puntuación (${puntos}) apuntaría a «${VEREDICTOS[veredictoPorPuntos].nombre.toLowerCase()}». Lo que más ha sumado:`);
    razones.push(...suman.slice(0, 3).map(frase));
  } else if (!forzadoPor) {
    razones.push(
      veredicto === 'publico'
        ? `Tu puntuación es ${puntos}: hasta ${UMBRAL_PUBLICO}, la sanidad pública cubre tu perfil sin necesidad de un seguro.`
        : veredicto === 'complementario'
          ? `Tu puntuación es ${puntos}: de ${UMBRAL_PUBLICO + 1} a ${UMBRAL_COMPLEMENTARIO}, un seguro que complemente a la sanidad pública.`
          : `Tu puntuación es ${puntos}: desde ${UMBRAL_COMPLEMENTARIO + 1}, un seguro privado completo.`,
    );
    if (suman.length > 0) razones.push(...suman.slice(0, 3).map(frase));
    else razones.push('Ninguna de tus respuestas apunta a una necesidad que la sanidad pública no cubra.');
    if (restan.length > 0 && veredicto !== 'publico') razones.push(...restan.slice(0, 2).map(frase));
  }

  // ─ Consejos generales ─
  const consejos: string[] = [];
  if (veredicto !== 'publico') {
    consejos.push('🔍 Compara siempre al menos 3 aseguradoras: Sanitas, Adeslas, Asisa, AXA Salud y DKV son las principales en España. Los precios y redes varían mucho por zona.');
    consejos.push('📋 Revisa la red de médicos en tu ciudad antes de contratar: importa más la calidad de la red que el precio.');
    if (r[7] === 'necesito' || r[7] === 'critico') {
      consejos.push('🦷 El dental suele ser módulo aparte. Compara si compensa un seguro dental independiente (desde 8 €/mes) frente al módulo dentro del seguro general.');
    }
    consejos.push('⚠️ Atención a las carencias: la mayoría de seguros tienen periodos sin cobertura para partos (8 meses), operaciones (6-8 meses) y algunas especialidades.');
  }
  if (veredicto === 'publico') {
    consejos.push('💊 Aunque no necesites seguro privado ahora, considera ahorrar el equivalente en un fondo de emergencia sanitaria para imprevistos.');
    consejos.push('📞 Conoce bien los recursos de tu sistema público: muchas CCAA tienen apps para cita online, telemedicina y resultados digitales.');
  }

  return { veredicto, puntuacion: puntos, veredictoPorPuntos, forzadoPor, razones, consejos };
}
