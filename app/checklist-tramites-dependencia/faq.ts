/**
 * Preguntas que salen a la vez en la FAQ visible (page.tsx) y en el FAQPage (metadata.ts).
 * Una sola fuente: escritas dos veces divergían (la visible callaba el silencio y el FAQPage lo
 * daba por negativo, mientras una tarjeta lo daba por positivo; hallazgo 5192, 18/11/2026).
 *
 * Plazo y nacimiento del derecho: Ley 39/2006, disposición final primera, apartados 2 y 3, en la
 * redacción del RDL 36/2026, de 10 de noviembre (en vigor el 12/11/2026), leída en el texto
 * consolidado del BOE (BOE-A-2006-21990) el 19/11/2026: «el plazo máximo, entre la fecha de
 * entrada de la solicitud y la de resolución de reconocimiento de la prestación de dependencia
 * será de tres meses, independientemente de que la Administración Competente haya establecido un
 * procedimiento diferenciado…», y el derecho «se generará desde la fecha de la resolución de
 * reconocimiento de las prestaciones, o, en su caso, cuando haya transcurrido el plazo de tres
 * meses desde la presentación de la solicitud sin haberse dictado y notificado resolución
 * expresa». La ley no contiene ninguna cláusula sobre el sentido del silencio: no se afirma ninguno.
 */
export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const FAQ_PLAZO: PreguntaFrecuente = {
  pregunta: '¿Cuánto tiempo tarda en resolverse una solicitud de dependencia?',
  respuesta:
    'El plazo legal máximo es de 3 meses desde la presentación de la solicitud hasta la resolución que reconoce la prestación, y cuenta también el Plan Individualizado de Atención aunque la comunidad autónoma tramite por separado el grado y la prestación (Ley 39/2006, disposición final primera, apartado 2, en la redacción vigente desde el 12/11/2026). En la práctica los tiempos varían mucho según la comunidad autónoma, y en algunas superan el año. Si pasan esos 3 meses sin resolución expresa, el derecho a las prestaciones nace en esa fecha y no en la de la resolución tardía, así que los meses de espera posteriores se pueden reclamar como atrasos (apartado 3).',
};
