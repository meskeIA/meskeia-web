/**
 * Preguntas que salen a la vez en la FAQ visible (page.tsx) y en el FAQPage (metadata.ts): una
 * sola fuente, porque escritas dos veces divergían (hallazgos 5173 y 5174, 18/11/2026).
 *
 * Fuentes, leídas en el BOE el 19/11/2026:
 *   · Ley 14/2013 consolidada (BOE-A-2013-10074): art. 75.5, el visado «se resolverán y
 *     notificarán en el plazo de 10 días hábiles»; art. 74 quater, «vigencia máxima de un año»;
 *     art. 76, autorización: «veinte días desde la presentación electrónica» y «se entenderá
 *     estimada por silencio administrativo»; art. 74 quinquies, «vigencia máxima de tres años».
 *   · Art. 93 de la Ley 35/2006 en la redacción de la Ley 28/2022 (BOE-A-2022-21739): el período
 *     del cambio de residencia y «los cinco períodos impositivos siguientes»; no haber sido
 *     residente «durante los cinco períodos impositivos anteriores»; la letra b) 1.º da por cumplida
 *     la condición con el «visado para teletrabajo de carácter internacional», y el profesional por
 *     cuenta propia entra por el 3.º (actividad emprendedora) o el 4.º (altamente cualificado para
 *     empresas emergentes o I+D+i); apartado 2.e: 24 % de la base liquidable hasta 600.000 €, 47 %
 *     por encima.
 */
export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const FAQ_PLAZO: PreguntaFrecuente = {
  pregunta: '¿Cuánto tiempo tarda en resolverse la solicitud de visa nómada digital?',
  respuesta:
    'Depende de lo que pidas. El visado para teletrabajo de carácter internacional, que se pide en el consulado desde fuera de España, se resuelve en 10 días hábiles (Ley 14/2013, art. 75.5) y dura como máximo un año (art. 74 quater). La autorización de residencia para teletrabajo, que se pide estando ya en España de forma regular, se resuelve en veinte días desde la presentación electrónica y, si no hay respuesta en ese plazo, se entiende concedida por silencio administrativo (art. 76); dura hasta tres años (art. 74 quinquies). En la práctica el plazo puede variar según el consulado o la oficina.',
};

export const FAQ_FISCAL: PreguntaFrecuente = {
  pregunta: '¿Qué ventaja fiscal tiene la visa nómada digital?',
  respuesta:
    'Si pasas a ser residente fiscal en España (por ejemplo, por vivir aquí más de 183 días al año) y no lo has sido en los cinco años anteriores, puedes optar al régimen especial del art. 93 de la Ley del IRPF, conocido como «Ley Beckham». Dura el año del cambio de residencia y los cinco siguientes, y grava al 24 % la base liquidable hasta 600.000 € y al 47 % lo que la supere. Lo tiene quien trabaja por cuenta ajena con el visado para teletrabajo; un freelancer solo entra si su actividad se califica como emprendedora o si es un profesional altamente cualificado que presta servicios a empresas emergentes o hace actividades de formación, investigación, desarrollo e innovación (art. 93.1.b). Es optativo y hay que pedirlo expresamente.',
};
