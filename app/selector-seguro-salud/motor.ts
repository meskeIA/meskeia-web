/**
 * Motor de selector-seguro-salud.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Los umbrales
 * (pública hasta 2, complementario hasta 7, completo desde 8) son los MISMOS que tenía la página.
 *
 * Es UNA puntuación contra dos umbrales. Encima van las respuestas que NO son una preferencia
 * sino una situación que decide por sí sola (reparación del 24/09/2026, hallazgos 1420-1436):
 *
 *   · FILTROS (lo declarado manda sobre los puntos):
 *       - Seguro completo pagado por la empresa → «aprovecha tu seguro de empresa» (1434: antes
 *         se titulaba «Sanidad pública es suficiente» con «0 €/mes · vía impuestos»).
 *       - Mutualidad de funcionarios, declarada en la pregunta 10 O en la 5 → «tu mutualidad ya
 *         te da cobertura» (1421: la de la pregunta 5 solo restaba 3 y en 84.716 perfiles salía
 *         «contrata un seguro»).
 *       - «Nada, no quiero gasto extra» → sanidad pública.
 *       - «Hasta 40 €/mes» → nunca el seguro completo, la modalidad de prima más alta: se acota
 *         al complementario y se dice (1423, misma forma que el 1333 de selector-mascota).
 *   · PESOS (preferencias o necesidades, con su aviso cuando la cobertura no está garantizada):
 *       - Enfermedad crónica: sigue sumando como un especialista, porque la necesidad existe,
 *         pero sale SIEMPRE el aviso de preexistencias (1422).
 *       - Embarazo: se separa «estoy embarazada ahora» (0 puntos: una póliza nueva no cubre ese
 *         parto) de «planeo un embarazo» (+3, con el aviso de carencias) (1424).
 *
 * La pregunta 3 ya no califica comunidades autónomas (1420: nota valorativa por territorio sin
 * fuente, que las cifras oficiales contradecían): pregunta cuánto espera el usuario en SU zona,
 * con la media oficial del SNS como referencia.
 */

export type VeredictoKey = 'publico' | 'complementario' | 'completo' | 'empresa' | 'mutualidad';

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

// ─── Datos con fuente: UNA sola verdad para la pantalla, la guía y el FAQPage (hallazgo 1427) ───

/**
 * Prima media del ramo de salud. UNESPA: «los seguros de salud crecieron un 7,4%, contabilizando
 * 12.059 millones de euros a lo largo del ejercicio [2024]» (nota del 16/01/2025,
 * unespa.es/notasdeprensa/negocio-asegurador-diciembre-2024/) y «El seguro cuida la salud de 12,6
 * millones de personas de todas las edades» (Memoria Social del Seguro 2024, nota del 17/06/2025,
 * unespa.es/notasdeprensa/memoria-social-seguro-2024/). 12.059 / 12,6 / 12 = 79,76 €/mes.
 * Antes: «60 – 180 €/mes» para una «familia de 3» (20 €/persona) frente a «entre 40 y 80 € al
 * mes» para una persona en el FAQ: dos cifras sin fuente que no cabían juntas.
 */
export const REFERENCIA_PRIMA = { primasMillones: 12_059, personasMillones: 12.6, anio: 2024 } as const;
export const PRIMA_MEDIA_MENSUAL = Math.round(REFERENCIA_PRIMA.primasMillones / REFERENCIA_PRIMA.personasMillones / 12);

/** OCU, «Cómo elegir un seguro de salud» (ocu.org/salud/seguros-salud/como-elegir): el copago «irá
 *  normalmente entre 3 y 20 euros por cada servicio médico»; «El tiempo de carencia puede ser entre
 *  6 y 8 meses, dependiendo del tratamiento», con partos y cesáreas en la lista, y hasta 48 meses en
 *  los tratamientos de infertilidad. Antes el FAQ decía copago de 2-15 € y la guía de 3-8 €. */
export const COPAGO_EUROS = { min: 3, max: 20 } as const;
export const CARENCIA_MESES = { min: 6, max: 8, fertilidad: 48 } as const;

/** SISLE-SNS a 31/12/2025 (Ministerio de Sanidad, LISTAS_PUBLICACION_Dic_2025.pdf, pág. 14):
 *  tiempo medio de espera para primera consulta en el conjunto del SNS, 102 días. Es el promedio
 *  de días que llevaban esperando los pacientes pendientes en la fecha de corte. */
export const ESPERA_MEDIA_SNS = { dias: 102, fecha: '31/12/2025' } as const;

const n = (x: number, dec = 0) => x.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** Frases derivadas de los datos: las usan la pantalla, la guía y el FAQPage. */
export const TEXTO_PRIMA_MEDIA =
  `los seguros de salud facturaron ${n(REFERENCIA_PRIMA.primasMillones)} millones de euros en primas en ${REFERENCIA_PRIMA.anio} y cubren a ${n(REFERENCIA_PRIMA.personasMillones, 1)} millones de personas (UNESPA): de media, unos ${PRIMA_MEDIA_MENSUAL} € al mes por persona asegurada, sumando todas las edades y tipos de póliza`;
export const TEXTO_COPAGO = `normalmente entre ${COPAGO_EUROS.min} y ${COPAGO_EUROS.max} € por cada servicio médico (OCU)`;
export const TEXTO_CARENCIAS =
  `intervenciones, hospitalización, pruebas complejas o partos tienen un periodo sin cobertura, normalmente de ${CARENCIA_MESES.min} a ${CARENCIA_MESES.max} meses según el tratamiento, y los tratamientos de fertilidad pueden llegar a ${CARENCIA_MESES.fertilidad} meses (OCU)`;
export const TEXTO_ESPERA_SNS =
  `a ${ESPERA_MEDIA_SNS.fecha}, los pacientes pendientes de una primera consulta con el especialista llevaban esperando ${ESPERA_MEDIA_SNS.dias} días de media en el conjunto del Sistema Nacional de Salud, con grandes diferencias entre zonas y especialidades (SISLE-SNS, Ministerio de Sanidad)`;

const NOTA_PRECIO_BASE =
  `Prima media del sector por persona asegurada en ${REFERENCIA_PRIMA.anio} (UNESPA), de todas las edades y tipos de póliza. Esta app no pregunta tu edad, que es lo que más mueve el precio: pide presupuesto con tus datos.`;

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
    // La descripción de la pantalla la compone calcularResultado con lo que ha pesado (1425).
    descripcion: 'Tu perfil se beneficiaría de un seguro que complemente la sanidad pública.',
    cobertura: ['Especialistas sin lista de espera', 'Segunda opinión médica', 'Urgencias privadas', 'Cobertura dental básica (con módulo adicional)'],
    precioOrientativo: `≈ ${PRIMA_MEDIA_MENSUAL} €/mes de media`,
    precioNota: `${NOTA_PRECIO_BASE} Con copago, la prima baja.`,
  },
  completo: {
    nombre: 'Seguro privado completo recomendado',
    icon: '⭐',
    descripcion: 'La suma de tus respuestas justifica un seguro de salud privado completo, más allá de un complemento a la sanidad pública.',
    cobertura: ['Médico de cabecera privado', 'Todos los especialistas', 'Hospitalización en clínica privada', 'Urgencias 24h', 'Pruebas diagnósticas (resonancias, TAC…)', 'Ginecología y pediatría completas'],
    precioOrientativo: `≈ ${PRIMA_MEDIA_MENSUAL} €/mes de media`,
    // Antes: «familia de 3 (adultos 30-45 años + 1 niño)» también a quien no tiene hijos (1426).
    precioNota: `${NOTA_PRECIO_BASE} Sin copago y con hospitalización, la prima queda por encima de la de una póliza con copago. Es por persona: cada familiar que añadas paga la suya.`,
  },
  empresa: {
    nombre: 'Aprovecha tu seguro de empresa',
    icon: '🏢',
    descripcion: 'Ya tienes un seguro de salud completo pagado por tu empresa: la orientación es sacarle partido antes que pagar otro. La sanidad pública sigue a tu disposición.',
    cobertura: ['La de tu póliza de empresa: revisa su cuadro médico y sus exclusiones', 'La sanidad pública, que no pierdes por tener un seguro privado'],
    precioOrientativo: '0 € adicionales',
    precioNota: 'Lo paga tu empresa.',
  },
  mutualidad: {
    nombre: 'Tu mutualidad ya te da cobertura',
    icon: '🏛️',
    descripcion: 'Como mutualista ya tienes asistencia sanitaria. En MUFACE y en ISFAS, por ejemplo, cada titular elige entre la sanidad pública y una entidad concertada, y puede cambiar en los periodos que abre su mutualidad: contratar además otro seguro no es la orientación.',
    cobertura: ['La del sistema público o la de la entidad concertada que hayas elegido', 'Cambio de entidad en los periodos que abra tu mutualidad'],
    precioOrientativo: '0 € adicionales',
    precioNota: 'Incluida en tu condición de mutualista.',
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
    // Antes: «¿En qué comunidad autónoma resides?» con tres grupos de comunidades calificados sin
    // fuente («buen rendimiento relativo», «mayor presión asistencial»…) y +2 puntos al tercero.
    // Según el acta del Inspector, el SISLE-SNS a 31/12/2025 los contradecía, y ocho territorios
    // no tenían grupo (hallazgo 1420). La espera cambia por zona y especialidad dentro de cada
    // comunidad: lo que decide es la que tiene el usuario, con la media del SNS como referencia.
    id: 3, categoria: 'Tu situación', pregunta: '¿Cuánto sueles esperar en tu zona para una primera cita con el especialista de la sanidad pública?', icon: '🗺️',
    opciones: [
      { valor: 'corta', etiqueta: 'Menos de 2 meses', desc: 'Por tu experiencia o la de tu entorno' },
      { valor: 'media', etiqueta: 'Entre 2 y 4 meses, o no lo sé', desc: `Referencia: ${ESPERA_MEDIA_SNS.dias} días de media en el sistema público (SISLE-SNS, ${ESPERA_MEDIA_SNS.fecha})` },
      { valor: 'larga', etiqueta: 'Más de 4 meses', desc: 'Esperas largas en tu área sanitaria' },
      { valor: 'rural', etiqueta: 'Vivo en zona rural o con poca oferta sanitaria', desc: 'Lejos de los centros de especialidades' },
    ],
  },
  {
    id: 4, categoria: 'Tu situación', pregunta: '¿Tienes hijos menores de 18 años a cargo?', icon: '👨‍👩‍👧',
    opciones: [
      { valor: 'no', etiqueta: 'No tengo hijos', desc: 'Sin menores a cargo' },
      { valor: 'si_1', etiqueta: 'Sí, 1 hijo', desc: 'Un menor en la unidad familiar' },
      { valor: 'si_varios', etiqueta: 'Sí, 2 o más hijos', desc: 'Varios menores a cargo' },
      // Antes era UNA opción, «Estoy embarazada o planeando estarlo», que sumaba 3 puntos en los
      // dos casos. Un embarazo en curso al contratar no lo cubre una póliza nueva (hallazgo 1424).
      { valor: 'embarazo_curso', etiqueta: 'Estoy embarazada ahora', desc: 'Embarazo ya en curso' },
      { valor: 'planeando', etiqueta: 'Planeo un embarazo', desc: 'Cobertura de maternidad a medio plazo' },
    ],
  },
  {
    id: 5, categoria: 'Tu situación', pregunta: '¿Cuál es tu situación laboral?', icon: '💼',
    opciones: [
      { valor: 'empresa', etiqueta: 'Empleado/a por cuenta ajena', desc: 'Trabajo para una empresa' },
      { valor: 'autonomo', etiqueta: 'Autónomo/a o freelance', desc: 'Trabajo por cuenta propia' },
      // No todo el funcionariado es mutualista: quien no lo es, va por el régimen general.
      { valor: 'funcionario', etiqueta: 'Funcionario/a con mutualidad (MUFACE, ISFAS, MUGEJU)', desc: 'Si no tienes mutualidad, elige «por cuenta ajena»' },
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
  3: 'Espera en tu zona',
  4: 'Hijos',
  5: 'Situación laboral',
  6: 'Acceso rápido',
  7: 'Salud dental',
  8: 'Seguro anterior',
  9: 'Presupuesto',
  10: 'Seguro de empresa',
};

/** Qué ha pesado, dicho en una frase: compone la descripción del veredicto (hallazgo 1425). */
const LO_QUE_PESA: Record<number, (valor: string) => string> = {
  1: () => 'la frecuencia con que vas al médico',
  2: (v) => (v === 'cronico' ? 'el seguimiento de tu enfermedad crónica' : 'el seguimiento de especialistas'),
  3: (v) => (v === 'rural' ? 'la lejanía de los centros de especialidades' : 'la espera para el especialista en tu zona'),
  4: (v) => (v === 'planeando' ? 'la cobertura de maternidad' : 'la atención a tus hijos'),
  5: () => 'trabajar por cuenta propia',
  6: () => 'la importancia que das al acceso rápido',
  7: () => 'la salud dental',
  8: () => 'tu buena experiencia con un seguro anterior',
  9: () => 'el presupuesto que puedes dedicarle',
};

/** Puntos de cada respuesta: más puntos, más justificado el seguro privado. */
export const PESOS: Record<number, Record<string, number>> = {
  1: { frecuente: 2, muy_frecuente: 3 },
  2: { uno: 2, varios: 3, cronico: 2 }, // la necesidad existe; la cobertura, no está garantizada: aviso
  3: { larga: 2, rural: 2 },
  4: { si_1: 2, si_varios: 3, planeando: 3 }, // embarazo_curso: 0, una póliza nueva no cubre ese parto
  5: { autonomo: 2, funcionario: -3 }, // la mutualidad, además, FILTRA (ver decidir)
  6: { mucho: 2, critico: 3 },
  7: { necesito: 2, critico: 3 },
  8: { si_contento: 2 },
  9: { nada: -3, poco: -1, alto: 1 },
  10: { si_completo: -5, muface: -4 }, // Ya lo tiene
};

/** Hasta este total, sanidad pública; hasta el siguiente, complementario; por encima, completo. */
export const UMBRAL_PUBLICO = 2;
export const UMBRAL_COMPLEMENTARIO = 7;

export type ForzadoPor = 'si_completo' | 'muface' | 'funcionario' | 'nada' | null;

export interface Consejo { icono: string; texto: string; }

export interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
  /** El veredicto que daría la puntuación sola, sin filtros. */
  veredictoPorPuntos: 'publico' | 'complementario' | 'completo';
  /** La respuesta que ha decidido el veredicto por encima de los puntos, si la hay. */
  forzadoPor: ForzadoPor;
  /** «Hasta 40 €/mes» ha bajado un «completo» a «complementario» (hallazgo 1423). */
  acotadoPorPresupuesto: boolean;
  /** La descripción del veredicto, con lo que ha pesado en este perfil. */
  descripcion: string;
  razones: string[];
  /** Lo que el usuario tiene que saber ANTES de contratar, dicho a la cara (role="note"). */
  avisos: string[];
  consejos: Consejo[];
}

const enLetra = (x: number) => `${Math.abs(x)} ${Math.abs(x) === 1 ? 'punto' : 'puntos'}`;

const enumerar = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);

interface Decision {
  puntos: number;
  aportes: { id: number; puntos: number }[];
  veredictoPorPuntos: Resultado['veredictoPorPuntos'];
  forzadoPor: ForzadoPor;
  acotado: boolean;
  veredicto: VeredictoKey;
}

function decidir(r: Record<number, string>): Decision {
  const aportes: { id: number; puntos: number }[] = [];
  let puntos = 0;
  for (const [idTexto, porRespuesta] of Object.entries(PESOS)) {
    const id = Number(idTexto);
    const p = porRespuesta[r[id]];
    if (p === undefined) continue;
    puntos += p;
    aportes.push({ id, puntos: p });
  }
  const veredictoPorPuntos: Decision['veredictoPorPuntos'] =
    puntos <= UMBRAL_PUBLICO ? 'publico' : puntos <= UMBRAL_COMPLEMENTARIO ? 'complementario' : 'completo';

  // Filtros, por prioridad: lo que ya se tiene pagado, luego el presupuesto cero.
  let forzadoPor: ForzadoPor = null;
  if (r[10] === 'si_completo') forzadoPor = 'si_completo';
  else if (r[10] === 'muface') forzadoPor = 'muface';
  else if (r[5] === 'funcionario') forzadoPor = 'funcionario';
  else if (r[9] === 'nada') forzadoPor = 'nada';

  let veredicto: VeredictoKey = veredictoPorPuntos;
  if (forzadoPor === 'si_completo') veredicto = 'empresa';
  else if (forzadoPor === 'muface' || forzadoPor === 'funcionario') veredicto = 'mutualidad';
  else if (forzadoPor === 'nada') veredicto = 'publico';

  // «Hasta 40 €/mes» es un tope declarado: el seguro completo, sin copago y con hospitalización,
  // es la modalidad de prima más alta, y la media del sector (≈ 80 €/mes por persona) ya dobla el
  // tope. No se recomienda lo que el usuario ha dicho que no puede pagar; se acota y se avisa.
  const acotado = !forzadoPor && r[9] === 'poco' && veredicto === 'completo';
  if (acotado) veredicto = 'complementario';

  return { puntos, aportes, veredictoPorPuntos, forzadoPor, acotado, veredicto };
}

export function calcularResultado(r: Record<number, string>): Resultado {
  const d = decidir(r);
  const { puntos, aportes, veredictoPorPuntos, forzadoPor, acotado, veredicto } = d;

  const etiqueta = (id: number) =>
    PREGUNTAS.find((p) => p.id === id)?.opciones.find((o) => o.valor === r[id])?.etiqueta ?? '';
  const frase = ({ id, puntos: p }: { id: number; puntos: number }) =>
    `${TEMA[id]}: «${etiqueta(id)}» ${p > 0 ? 'suma' : 'resta'} ${enLetra(p)}.`;
  const suman = aportes.filter((a) => a.puntos > 0).sort((a, b) => b.puntos - a.puntos || a.id - b.id);
  const restan = aportes.filter((a) => a.puntos < 0).sort((a, b) => a.puntos - b.puntos || a.id - b.id);

  // ─ Razones: qué ha decidido el resultado, y la cuenta ENTERA ─
  const razones: string[] = [];
  if (forzadoPor === 'si_completo') {
    razones.push('Ya tienes cobertura privada completa pagada por tu empresa: la orientación es aprovecharla, no contratar otra.');
  } else if (forzadoPor === 'muface' || forzadoPor === 'funcionario') {
    razones.push('Tienes mutualidad de funcionarios (MUFACE, ISFAS, MUGEJU): ya tienes asistencia sanitaria, así que contratar otro seguro no es la orientación.');
  } else if (forzadoPor === 'nada') {
    razones.push('Has dicho que no quieres ningún gasto extra: con ese presupuesto la orientación es la sanidad pública, sea cual sea la puntuación.');
  }
  if (forzadoPor && veredictoPorPuntos !== 'publico') {
    razones.push(`Sin esa respuesta, tu puntuación (${puntos}) apuntaría a «${VEREDICTOS[veredictoPorPuntos].nombre.toLowerCase()}». Lo que más ha sumado:`);
    razones.push(...suman.slice(0, 3).map(frase));
  } else if (!forzadoPor) {
    razones.push(
      acotado
        ? `Tu puntuación es ${puntos}: desde ${UMBRAL_COMPLEMENTARIO + 1} apuntaría a un seguro privado completo, pero con un presupuesto de «${etiqueta(9)}» la orientación se queda en un seguro complementario.`
        : veredicto === 'publico'
          ? `Tu puntuación es ${puntos}: hasta ${UMBRAL_PUBLICO}, la sanidad pública cubre tu perfil sin necesidad de un seguro.`
          : veredicto === 'complementario'
            ? `Tu puntuación es ${puntos}: de ${UMBRAL_PUBLICO + 1} a ${UMBRAL_COMPLEMENTARIO}, un seguro que complemente a la sanidad pública.`
            : `Tu puntuación es ${puntos}: desde ${UMBRAL_COMPLEMENTARIO + 1}, un seguro privado completo.`,
    );
    if (suman.length === 0) razones.push('Ninguna de tus respuestas apunta a una necesidad que la sanidad pública no cubra.');
    // Todas las que suman y todas las que restan: la cuenta que se ve da el total. Antes, en
    // «sanidad pública» se enseñaban las sumas y se ocultaban las restas (hallazgo 1432).
    razones.push(...suman.map(frase), ...restan.map(frase));
  }

  // ─ Descripción: lo que ha pesado en ESTE perfil (hallazgo 1425) ─
  const pesa = enumerar(suman.slice(0, 2).map((a) => LO_QUE_PESA[a.id]?.(r[a.id]) ?? TEMA[a.id].toLowerCase()));
  let descripcion = VEREDICTOS[veredicto].descripcion;
  if (veredicto === 'complementario') {
    descripcion = acotado
      ? `Por tus respuestas encajaría un seguro completo, pero tu presupuesto lo acota: un seguro que complemente la sanidad pública.${pesa ? ` En tu caso, lo que más pesa es ${pesa}.` : ''}`
      : `${VEREDICTOS.complementario.descripcion}${pesa ? ` En tu caso, lo que más pesa es ${pesa}.` : ''}`;
  } else if (veredicto === 'completo' && pesa) {
    descripcion = `${VEREDICTOS.completo.descripcion} En tu caso, lo que más pesa es ${pesa}.`;
  }

  // ─ Avisos: lo que la póliza puede NO cubrir, o lo que no cabe en lo declarado ─
  const avisos: string[] = [];
  const contrataria = veredicto === 'complementario' || veredicto === 'completo';
  if (r[9] === 'poco' && contrataria) {
    avisos.push(
      (acotado
        ? `Por puntos saldría un seguro completo, pero has dicho que puedes pagar «${etiqueta(9)}». El completo, sin copago y con hospitalización, es la modalidad de prima más alta, así que la orientación se queda en un complementario: el copago abarata la prima (OCU). `
        : `Has dicho que puedes pagar «${etiqueta(9)}». `) +
        `Comprueba con un presupuesto real que la póliza cabe en ese tope: la prima media del sector es de unos ${PRIMA_MEDIA_MENSUAL} € al mes por persona asegurada (UNESPA, ${REFERENCIA_PRIMA.anio}). Si no cabe, la sanidad pública sigue cubriéndote.`,
    );
  }
  if (r[2] === 'cronico' && contrataria) {
    // Sin la crónica (como «solo cabecera»), ¿cambiaría la orientación? Se dice si es así (1422).
    const sin = decidir({ ...r, 2: 'no' }).veredicto;
    avisos.push(
      'Has declarado una enfermedad crónica. Antes de contratar tendrás que responder al cuestionario de salud de la aseguradora y declarar en él lo que sepas de tu salud (art. 10 de la Ley 50/1980 de Contrato de Seguro), y la asistencia relacionada con enfermedades anteriores a la contratación suele quedar excluida de la cobertura o encarecer la prima (OCU). Pregunta por escrito si cubrirán tu enfermedad y en qué condiciones.' +
        (sin !== veredicto ? ` Sin esa respuesta, la orientación sería «${VEREDICTOS[sin].nombre.toLowerCase()}».` : ''),
    );
  }
  if (r[4] === 'embarazo_curso' && !forzadoPor) {
    avisos.push(
      `Si ya estás embarazada, lo normal es que una póliza nueva no cubra este embarazo ni este parto: la asistencia por lo que ya existía al contratar suele quedar excluida, y el parto tiene periodo de carencia (${CARENCIA_MESES.min} a ${CARENCIA_MESES.max} meses según el tratamiento, OCU). Por eso tu embarazo no suma puntos. Si cuando nazca quieres pediatría privada, repite el test.`,
    );
  }
  if (r[4] === 'planeando' && contrataria) {
    avisos.push(
      `Si planeas un embarazo, contrata con antelación: el parto está entre las prestaciones con periodo de carencia, normalmente de ${CARENCIA_MESES.min} a ${CARENCIA_MESES.max} meses, y los tratamientos de fertilidad pueden llegar a ${CARENCIA_MESES.fertilidad} meses (OCU).`,
    );
  }

  // ─ Consejos generales ─
  const consejos: Consejo[] = [];
  if (contrataria) {
    // Sin marcas: el proyecto orienta por perfiles, no por aseguradoras.
    consejos.push({ icono: '🔍', texto: 'Compara siempre varias aseguradoras: los precios y los cuadros médicos varían mucho por zona.' });
    consejos.push({ icono: '📋', texto: 'Revisa la red de médicos en tu ciudad antes de contratar: importa más la calidad de la red que el precio.' });
    if (r[7] === 'necesito' || r[7] === 'critico') {
      consejos.push({ icono: '🦷', texto: 'El dental suele ser módulo aparte. Compara si compensa un seguro dental independiente frente al módulo dentro del seguro general.' });
    }
    consejos.push({ icono: '⚠️', texto: `Atención a las carencias: ${TEXTO_CARENCIAS}.` });
  } else if (veredicto === 'publico') {
    consejos.push({ icono: '📞', texto: 'Conoce bien los recursos de tu sistema público: muchas comunidades tienen apps para cita online, telemedicina y resultados digitales.' });
    // Antes: «considera ahorrar el equivalente en un fondo de emergencia sanitaria», también a
    // quien acababa de decir «Nada, no quiero gasto extra» o «Desempleo…» (hallazgo 1433).
    consejos.push({ icono: '🔁', texto: 'Si tu situación cambia (un trabajo nuevo, hijos, una enfermedad), repite el test: la orientación depende de tus respuestas de hoy.' });
  } else if (veredicto === 'empresa') {
    consejos.push({ icono: '📋', texto: 'Revisa el cuadro médico y las exclusiones de tu póliza de empresa: es lo que ya tienes pagado.' });
    consejos.push({ icono: '👨‍👩‍👧', texto: 'Pregunta si puedes incluir a tu familia en la póliza de empresa y en qué condiciones.' });
    consejos.push({ icono: '🔁', texto: 'Si cambias de trabajo, la póliza de empresa puede terminar: repite entonces el test.' });
  } else {
    consejos.push({ icono: '🔄', texto: 'Revisa si la entidad que elegiste, pública o concertada, es la que mejor te atiende donde vives: puedes cambiar en los periodos que abre tu mutualidad.' });
    consejos.push({ icono: '📋', texto: 'Si tienes entidad concertada, consulta su cuadro médico antes de pagar nada aparte.' });
  }

  return { veredicto, puntuacion: puntos, veredictoPorPuntos, forzadoPor, acotadoPorPresupuesto: acotado, descripcion, razones, avisos, consejos };
}
