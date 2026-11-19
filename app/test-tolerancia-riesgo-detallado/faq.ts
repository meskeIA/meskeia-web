/**
 * Pregunta que sale a la vez en la FAQ visible (page.tsx) y en el FAQPage (metadata.ts): una sola
 * fuente, porque escrita dos veces daba «una vez al año» en una y «cada 2-3 años» en la otra
 * (hallazgo 5207, 18/11/2026). La recomendación del perfil Conservador dice lo mismo.
 */
export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const FAQ_FRECUENCIA: PreguntaFrecuente = {
  pregunta: '¿Con qué frecuencia debería revisar mi tolerancia al riesgo?',
  respuesta:
    'Se recomienda revisar el perfil inversor al menos una vez al año y siempre que haya cambios significativos en tu vida: cambio de empleo, llegada de hijos, compra de vivienda, jubilación próxima o herencia. La tolerancia al riesgo no es estática; suele reducirse a medida que el horizonte de inversión se acorta o aumentan las responsabilidades financieras.',
};
