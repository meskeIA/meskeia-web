/**
 * Pregunta de la FAQ que comparten la guía visible (page.tsx) y el FAQPage del JSON-LD
 * (metadata.ts). Hallazgo 3782 (29/10/2026): eran dos redacciones con dos respuestas, y la del
 * FAQPage dejaba fuera a los hongos simbiontes que el propio banco enseña (trufa, liquen). Se
 * escribe UNA vez y la importan las dos bocas.
 */
export const FAQ_HONGOS = {
  pregunta: '¿Por qué los hongos no son plantas?',
  respuesta:
    'Porque no realizan la fotosíntesis. Los hongos son heterótrofos por absorción: secretan enzimas digestivas al exterior y absorben los nutrientes del medio, ya sea descomponiendo materia orgánica, como parásitos o en simbiosis con otros organismos (la trufa con las raíces de los árboles, el liquen con un alga). Además, su pared celular está hecha de quitina (como el exoesqueleto de los insectos), no de celulosa como la de las plantas.',
};
