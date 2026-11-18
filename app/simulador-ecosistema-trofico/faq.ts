/**
 * Preguntas que están a la vez en la FAQ visible (page.tsx) y en el FAQPage (metadata.ts).
 *
 * Hasta el 18/11/2026 cada boca tenía su texto y la cascada trófica salía con dos definiciones
 * («en los niveles no adyacentes», descendente o ascendente, frente a «sobre los demás niveles»,
 * solo descendente): hallazgo 3904. Ahora las dos leen de aquí.
 */
export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const FAQ_ESPECIE_CLAVE: PreguntaFrecuente = {
  pregunta: '¿Qué es una especie clave y por qué su pérdida es tan grave?',
  respuesta:
    'Una especie clave es aquella cuyo impacto en el ecosistema es desproporcionadamente grande en relación con su biomasa: su desaparición provoca cambios radicales en la estructura de toda la comunidad biológica, a veces su colapso. El concepto lo introdujo el ecólogo Robert Paine (1969) con las estrellas de mar Pisaster de la costa noroeste de EE. UU. Otros ejemplos: la nutria marina, que al comer erizos de mar evita que estos devoren los bosques de kelp del Pacífico; el lobo en los bosques boreales y los elefantes en la sabana africana.',
};

export const FAQ_CASCADA_TROFICA: PreguntaFrecuente = {
  pregunta: '¿Qué es una cascada trófica y cómo afecta al ecosistema?',
  respuesta:
    'Una cascada trófica es el efecto indirecto que la alteración de un nivel trófico produce en los niveles no adyacentes. Puede ser descendente (top-down), cuando los depredadores controlan a los herbívoros y eso beneficia a las plantas, o ascendente (bottom-up), cuando la disponibilidad de recursos (plantas, nutrientes) determina la abundancia de los niveles superiores. Un caso clásico es el de las nutrias marinas, los erizos y los bosques de kelp del Pacífico (Estes y Palmisano, 1974): sin nutrias, los erizos se multiplican y arrasan el kelp. La reintroducción del lobo en Yellowstone (1995) se propuso como otro ejemplo, pero es un caso debatido: estudios de campo de hasta 20 años (Marshall, Hobbs y Cooper, 2013; Hobbs et al., 2024) encuentran que la recuperación de los sauces es limitada y depende también de la pérdida de los castores.',
};
