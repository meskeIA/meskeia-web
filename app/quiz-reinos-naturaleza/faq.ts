/**
 * Pregunta de la FAQ que comparten la guía visible (page.tsx) y el FAQPage del JSON-LD
 * (metadata.ts). Hallazgo 3782 (29/10/2026): eran dos redacciones con dos respuestas, y la del
 * FAQPage dejaba fuera a los hongos simbiontes que el propio banco enseña (trufa, liquen). Se
 * escribe UNA vez y la importan las dos bocas.
 */
/**
 * Hallazgo 3711: «¿Cuántos reinos…?» tenía dos respuestas que se contradecían (la visible, seis
 * reinos; la del FAQPage, cinco y «seis dominios», cuando los dominios son tres). Una sola, aquí.
 */
export const FAQ_REINOS = {
  pregunta: '¿Cuántos reinos hay actualmente en biología?',
  respuesta:
    'Depende del sistema de clasificación. Este quiz usa el de 6 reinos (Animalia, Plantae, Fungi, Protista, Eubacteria y Archaea), muy extendido en la enseñanza secundaria. El de 5 reinos de Whittaker (1969) juntaba bacterias y arqueas en un solo reino, Monera. En investigación se usa el sistema de 3 dominios de Woese (1990): Bacteria, Archaea y Eukarya, que agrupa los cuatro reinos de organismos con núcleo.',
};

export const FAQ_HONGOS = {
  pregunta: '¿Por qué los hongos no son plantas?',
  respuesta:
    'Porque no realizan la fotosíntesis. Los hongos son heterótrofos por absorción: secretan enzimas digestivas al exterior y absorben los nutrientes del medio, ya sea descomponiendo materia orgánica, como parásitos o en simbiosis con otros organismos (la trufa con las raíces de los árboles, el liquen con un alga). Además, su pared celular está hecha de quitina (como el exoesqueleto de los insectos), no de celulosa como la de las plantas.',
};
