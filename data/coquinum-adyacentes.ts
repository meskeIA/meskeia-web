/**
 * Apps afines a Coquinum que NO entran en el catálogo del portal (no están en
 * COQUINUM_APP_CATEGORIA) pero cuyo público se solapa con el de cocina y
 * gastronomía: nutrición aplicada a la comida, propiedades de los alimentos y
 * cultura alimentaria.
 *
 * Las consume DescubreVertical (Fase 2) para mostrar, cuando se ven en
 * meskeia.com, la banda de descubrimiento hacia la CATEGORÍA correspondiente en
 * coquinum.com, induciendo tráfico al portal sin meter estas apps en él.
 *
 * CURADO MANUAL (no hay señal autodeclarada). Excluida a propósito la frontera
 * Salud/YMYL —régimen dietético (ayuno), fisiología (metabolismo del alcohol),
 * nutrición clínica (IMC, colesterol, vitaminas como suplemento)— que iría a una
 * futura vertical de Salud, igual que Stemum dejó fuera la medicina. Tampoco las
 * cronologías gastro de historia (azúcar, gastronomía…): pertenecen a Cronicum.
 * Criterio: comida como cocina/alimento = Coquinum; comida como intervención
 * clínica = Salud. Worksheet: _private/GASTRONOMIA.md §10. Revisión periódica.
 */
export const COQUINUM_ADYACENTES: Record<string, string> = {
  // Las tres que apuntaban a 'cultura-gastronomica' pasan a 'ingredientes-despensa',
  // que la absorbió en la consolidación 9 → 6 del 09/08/2026.
  'calculadora-macros': 'cocina-recetas',
  'curso-nutrisalud': 'ingredientes-despensa',
  'visualizador-cadena-alimentaria': 'ingredientes-despensa',
  'visualizador-agua-virtual': 'ingredientes-despensa',
  'visualizador-indice-glucemico': 'ingredientes-despensa',
};
