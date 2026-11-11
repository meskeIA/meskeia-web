/**
 * Los cuatro estilos parentales del modelo de Diana Baumrind (1966), ampliado por Eleanor Maccoby y
 * John Martin (1983) — contenido EDUCATIVO, no normativo.
 *
 * Lo usa `test-estilo-parental`. Hasta el 11/11/2026 vivía en `data/fiscal/maternidad.ts`, bajo el
 * sello de ese módulo (RDL 9/2025, LGSS, Ley 35/2006 del IRPF) y con el comentario «Clasificación
 * clásica validada», sin fuente; por estar allí, la cola del Inspector clasificaba la app como
 * «fiscal, riesgo 1» (hallazgo 4502). Mismo precedente que los gastos del bebé, que se mudaron a
 * `data/gastos-bebe.ts` el 12/10/2026 (cabo C0165).
 *
 * El marco se formuló y se estudió sobre todo con familias de EE. UU.: los textos describen
 * tendencias que esa investigación asocia a cada estilo, no resultados garantizados.
 */

export interface EstiloParental {
  id: string;
  nombre: string;
  icono: string;
  control: 'alto' | 'bajo';
  afecto: 'alto' | 'bajo';
  descripcion: string;
  caracteristicas: string[];
  impactoHijos: string;
  recomendacion: string;
}

export const ESTILOS_PARENTALES: EstiloParental[] = [
  {
    id: 'democratico',
    nombre: 'Democrático (Autoritativo)',
    icono: '🤝',
    control: 'alto',
    afecto: 'alto',
    descripcion: 'Equilibrio entre firmeza y calidez. Establece normas claras con explicación, escucha activa y negociación según la edad.',
    caracteristicas: [
      'Normas claras con explicaciones razonadas',
      'Escucha activa y validación emocional',
      'Consecuencias proporcionales y coherentes',
      'Fomento de la autonomía progresiva',
      'Comunicación bidireccional',
    ],
    impactoHijos: 'Mayor autoestima, mejor rendimiento académico, habilidades sociales sólidas, mejor regulación emocional.',
    // Hasta el 11/11/2026: «Considerado el estilo más equilibrado por la evidencia» (hallazgo 4494).
    recomendacion: 'La investigación sobre este modelo, hecha sobre todo en EE. UU., lo asocia con frecuencia a buenos resultados en los hijos. Mantener la coherencia entre ambos progenitores refuerza su eficacia.',
  },
  {
    id: 'autoritario',
    nombre: 'Autoritario',
    icono: '👊',
    control: 'alto',
    afecto: 'bajo',
    descripcion: 'Normas rígidas con poca explicación. La obediencia se espera sin discusión. Escasa demostración de afecto.',
    caracteristicas: [
      'Reglas estrictas sin margen de negociación',
      'Escasa explicación de los motivos',
      'Castigos como herramienta principal',
      'Poca expresión emocional',
      'Comunicación unidireccional (de padre a hijo)',
    ],
    impactoHijos: 'Obediencia a corto plazo, pero posible baja autoestima, ansiedad, dificultad en la toma de decisiones y rebeldía en adolescencia.',
    recomendacion: 'Si te identificas aquí, incorporar más momentos de escucha y explicar el porqué de las normas puede mejorar la relación sin perder autoridad.',
  },
  {
    id: 'permisivo',
    nombre: 'Permisivo (Indulgente)',
    icono: '🫶',
    control: 'bajo',
    afecto: 'alto',
    descripcion: 'Mucho cariño y aceptación, pero pocas normas o límites. Evita la confrontación y tiende a ceder ante las demandas del hijo.',
    caracteristicas: [
      'Pocos límites o normas definidas',
      'Dificultad para decir "no"',
      'Muy afectuoso y cercano',
      'Evita conflictos con el hijo',
      'El hijo tiene gran poder de decisión',
    ],
    impactoHijos: 'Buena autoestima pero posible baja tolerancia a la frustración, dificultad con normas sociales, impulsividad.',
    recomendacion: 'Mantener el afecto es valioso. Introducir normas claras y consistentes (pocas pero firmes) ayuda a equilibrar este estilo.',
  },
  {
    id: 'negligente',
    nombre: 'Negligente (No implicado)',
    icono: '😶',
    control: 'bajo',
    afecto: 'bajo',
    descripcion: 'Escasa implicación tanto en normas como en afecto. El progenitor está ausente física o emocionalmente.',
    caracteristicas: [
      'Poca supervisión del hijo',
      'Escasa o nula demostración de afecto',
      'Desinterés por el rendimiento escolar o las amistades',
      'Delegación excesiva del cuidado en terceros',
      'Falta de rutinas o estructura',
    ],
    impactoHijos: 'Riesgo de problemas de conducta, baja autoestima, dificultades académicas, apego inseguro.',
    recomendacion: 'Si te identificas aquí y deseas mejorar, buscar apoyo profesional (psicólogo familiar, servicios sociales) es un paso positivo y valiente. No se juzga, se acompaña.',
  },
];
