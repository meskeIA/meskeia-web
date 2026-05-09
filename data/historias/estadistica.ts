import type { HistoriaData } from './types';

export const estadistica: HistoriaData = {
  slug: 'estadistica',
  titulo: 'Historia de la Estadística: Del Censo Babilónico al Big Data y la IA',
  subtitulo: 'De contar ganado para calcular impuestos a predecir qué película verás esta noche: 5.000 años de la ciencia de los datos',
  descripcionSEO: 'Cronología interactiva de la historia de la estadística: desde los censos de Babilonia (~3000 a.C.) hasta el machine learning y la IA. Pascal, Gauss, Fisher, la crisis de replicación y el big data en 10 hitos y 6 eras.',
  keywords: [
    'historia estadistica cronologia',
    'pascal fermat probabilidad origen',
    'gauss distribucion normal campana',
    'fisher p-valor inferencia estadistica',
    'big data machine learning estadistica',
    'crisis replicacion ciencia p-hacking',
    'estadistica bayesiana inteligencia artificial',
    'florence nightingale visualizacion datos',
  ],
  anioInicio: -3000,
  anioFin: 9999,

  hitos: [
    {
      id: 'censos-antiguos-aritmetica',
      nombre: 'Censos Antiguos y Aritmética del Poder',
      anioInicio: -3000,
      anioFin: -300,
      color: '#374151',
      categoria: 'origen',
      descripcion: `Los primeros censos de la historia son registros administrativos del poder: en Babilonia (~3000 a.C.) se contabilizaban ganado, cereales y personas para calcular tributos e impuestos. Las tablillas de arcilla de los templos sumerios registraban excedentes agrícolas con una precisión que asombraría a contables modernos. En China, los registros de población se realizaban desde la dinastía Zhou (~1100 a.C.) para calcular impuestos y organizar el ejército. El Imperio Romano institucionalizó los censos quinquenales (census) para calcular impuestos y reclutamiento militar; la propia palabra "estadística" deriva del latín status (Estado), reflejo de que la estadística nació al servicio de los gobernantes, no de los científicos.

El Libro Domesday (Domesday Book, 1086), encargado por Guillermo el Conquistador tras la invasión normanda de Inglaterra, es el primer gran censo medieval europeo: inventarió toda la propiedad de Inglaterra en apenas 2 años, con ~13.000 localidades registradas, el nombre de cada propietario y el valor de cada finca en chelines. Es un prodigio de organización administrativa medieval y la base de datos más antigua de Europa occidental aún conservada.

El cálculo de probabilidades tuvo precursores en los juegos de azar. Girolamo Cardano (1501-1576), matemático, médico y jugador compulsivo, analizó sistemáticamente los dados y el azar en su Liber de Ludo Aleae (escrito hacia 1564, publicado en 1663 tras su muerte). Cardano comprendió que la probabilidad de un evento es la proporción de casos favorables sobre el total de casos posibles —el primer paso hacia la formalización matemática de la incertidumbre. Este período fundacional establece un patrón que se repetirá a lo largo de la historia: la estadística avanza impulsada por necesidades concretas (tributar, reclutar, apostar) antes de convertirse en teoría abstracta.`,
      obraIconica: 'Libro Domesday (1086): el primer gran censo medieval europeo',
      paises: ['Babilonia', 'China', 'Roma', 'Inglaterra'],
    },
    {
      id: 'pascal-fermat-probabilidad',
      nombre: 'Pascal, Fermat y el Nacimiento de la Probabilidad',
      anioInicio: 1654,
      anioFin: 1800,
      color: '#7C3AED',
      categoria: 'probabilidad',
      descripcion: `En el verano de 1654, el matemático Blaise Pascal y Pierre de Fermat intercambiaron una serie de cartas sobre el "problema de los puntos": ¿cómo repartir el dinero apostado en un juego de dados interrumpido a medias, según las probabilidades de victoria de cada jugador si el juego continuase? Esta correspondencia epistolar, aparentemente un ejercicio matemático sobre el juego, es el punto de partida formal de la teoría de la probabilidad matemática moderna. Pascal y Fermat no resolvieron el problema del mismo modo —Pascal usó su triángulo y Fermat la combinatoria directa—, pero ambos llegaron al mismo resultado correcto.

Christiaan Huygens publicó en 1657 De Ratiociniis in Ludo Aleae, el primer tratado impreso formal de probabilidad, basado en las cartas de Pascal y Fermat pero organizado como texto matemático sistemático. Jacob Bernoulli (Ars Conjectandi, 1713, publicado póstumamente) demostró la Ley de los Grandes Números: con muestras suficientemente grandes, la frecuencia relativa de un evento converge a su probabilidad teórica. Esta ley es el fundamento teórico de todas las encuestas, ensayos clínicos y sondeos modernos. Abraham de Moivre (The Doctrine of Chances, 1718) describió por primera vez la distribución normal (lo que hoy llamamos campana de Gauss) en su forma proto-matemática, décadas antes de que Gauss la formalizara completamente.

La teoría de la probabilidad nació como matemática del azar en el contexto de las apuestas, pero en pocas décadas encontró aplicaciones en dominios muy diferentes: Edmund Halley (el del cometa) publicó en 1693 la primera tabla de mortalidad estadísticamente rigurosa para la ciudad de Breslau, que los aseguradores de vida utilizaron para calcular primas. La astronomía también adoptó la probabilidad: los astrónomos necesitaban combinar observaciones con errores de medición distintos, y la probabilidad proporcionó el marco matemático para hacerlo de forma óptima.`,
      obraIconica: `Ars Conjectandi de Jacob Bernoulli (1713): la Ley de los Grandes Números`,
      paises: ['Francia', 'Países Bajos', 'Alemania', 'Inglaterra'],
    },
    {
      id: 'estadistica-social-quetelet',
      nombre: 'Estadística Social: Quetelet y Nightingale',
      anioInicio: 1800,
      anioFin: 1870,
      color: '#059669',
      categoria: 'social',
      descripcion: `El siglo XIX transformó la estadística de herramienta de gobiernos a instrumento de análisis científico de la sociedad. Adolphe Quetelet (1796-1874), astrónomo belga reconvertido en estadístico social, aplicó la distribución normal —que hasta entonces se usaba para errores de medición astronómica— a las medidas del cuerpo humano y acuñó el concepto de "homme moyen" (hombre promedio): la idea de que las características humanas (estatura, peso, temperatura) se distribuyen normalmente alrededor de una media estadística. Quetelet fue el primero en aplicar la estadística a fenómenos sociales como las tasas de criminalidad, suicidio y matrimonio, fundando lo que llamó "física social", antecedente directo de la sociología cuantitativa moderna. Su obra Sur l'homme (1835) inauguró la estadística social.

Florence Nightingale (1820-1910) es al mismo tiempo pionera de la enfermería moderna y de la visualización estadística de datos. Durante la Guerra de Crimea (1853-1856), recogió datos sistemáticos sobre las causas de muerte de los soldados hospitalizados y descubrió que la gran mayoría morían de enfermedades infecciosas prevenibles (disentería, tifus, cólera) y no de heridas de combate. Para comunicar este hallazgo al Parlamento Británico —que no estaba habituado a leer tablas de datos— diseñó los diagramas de área polar ("coxcombs"), una forma de infografía estadística que visualizaba las causas de muerte por mes en colores diferenciados. Su presentación convenció al Parlamento de reformar radicalmente las condiciones sanitarias de los hospitales militares. Nightingale es considerada la madre de la enfermería basada en evidencia, de la infografía estadística moderna y de la epidemiología hospitalaria.`,
      obraIconica: `Diagramas de área polar de Florence Nightingale sobre mortalidad en Crimea (1858)`,
      paises: ['Bélgica', 'Reino Unido', 'Francia'],
    },
    {
      id: 'galton-pearson-estadistica-biologica',
      nombre: 'Galton, Pearson y la Estadística Biológica',
      anioInicio: 1870,
      anioFin: 1920,
      color: '#1E3A8A',
      categoria: 'ciencia',
      descripcion: `Francis Galton (1822-1911), primo de Charles Darwin, es una de las figuras más contradictorias de la historia de la estadística: inventor de conceptos fundamentales que siguen usándose a diario y fundador de la eugenesia, doctrina que usó esos mismos conceptos para promover políticas éticamente repudiables. Galton aplicó la estadística a la herencia biológica y desarrolló la correlación (la medida de hasta qué punto dos variables varían juntas), la regresión a la media (la tendencia de los hijos de padres extremos a ser más parecidos al promedio que sus padres) y el coeficiente de variación. Todos estos son conceptos estadísticos centrales en ciencia, medicina, economía y ciencias sociales.

Sin embargo, Galton también acuñó en 1883 el término "eugenesia" (del griego "buen nacimiento") para referirse a su propuesta de mejorar la especie humana mediante la selección de los individuos con mejores características para la reproducción y la limitación de la reproducción de los que consideraba inferiores. La eugenesia fue adoptada como política pública: en EEUU, más de 60.000 personas fueron esterilizadas por ley entre 1907 y 1981 (documentado por la Corte Suprema de EEUU); en Alemania nazi, fue la base pseudo-científica del Holocausto. Este es un caso paradigmático y documentado en la historia de la ciencia de cómo un corpus metodológico válido puede ser usado para fines éticamente execrables.

Karl Pearson (1857-1936), discípulo de Galton y fundador de la primera cátedra de estadística del mundo (University College London, 1911), formalizó el coeficiente de correlación de Pearson (r), el test chi-cuadrado (para comparar frecuencias observadas y esperadas) y fundó la revista Biometrika (1901), el primer journal de estadística aplicada a biología. Pearson también acuñó el término "distribución normal" y el concepto de "goodness of fit" (bondad del ajuste). Sus herramientas son estándar en cualquier curso de estadística del siglo XXI.`,
      obraIconica: 'Coeficiente de correlación de Pearson y test chi-cuadrado (1895-1900)',
      paises: ['Reino Unido', 'Europa'],
    },
    {
      id: 'fisher-neyman-inferencia',
      nombre: 'Fisher, Neyman y la Inferencia Estadística',
      anioInicio: 1920,
      anioFin: 1950,
      color: '#D97706',
      categoria: 'inferencia',
      descripcion: `Ronald Fisher (1890-1962) es ampliamente considerado el estadístico más influyente del siglo XX. Trabajó como biólogo estadístico en la Estación Experimental de Rothamsted (Reino Unido), donde necesitaba extraer conclusiones fiables de experimentos agrícolas con muchas variables y pocas repeticiones. Para resolverlo, desarrolló un conjunto de herramientas que transformaron la ciencia experimental: el análisis de varianza (ANOVA, para comparar medias de varios grupos), el diseño de experimentos (con grupos control, aleatorización y bloques), el concepto de significación estadística y el p-valor. Sus obras Statistical Methods for Research Workers (1925) y The Design of Experiments (1935) se convirtieron en el manual de cabecera de una generación de científicos en biología, medicina, psicología y agricultura.

El p-valor, tal como Fisher lo definió, es la probabilidad de obtener un resultado al menos tan extremo como el observado, asumiendo que la hipótesis nula (no hay efecto) es cierta. Fisher propuso 0,05 como umbral de significación —no como regla absoluta, sino como "evidencia suficiente para merecer investigación adicional"— pero este matiz se perdió en la aplicación práctica y el p<0,05 se convirtió en criterio binario de "verdad científica".

Jerzy Neyman y Egon Pearson (hijo de Karl) desarrollaron en paralelo la teoría formal de los tests de hipótesis (hipótesis nula vs. alternativa, errores de tipo I y II, potencia del test) y los intervalos de confianza. El debate Fisher-Neyman/Pearson sobre la interpretación correcta de la probabilidad fue profundamente personal y académicamente enconado: Fisher rechazó los intervalos de confianza de Neyman y Neyman rechazó el concepto de significación de Fisher. Sus posiciones no se reconciliaron en vida, pero la práctica estadística dominante hoy mezcla ambas de forma técnicamente inconsistente —lo que contribuye a la crisis de replicación del siglo XXI.

La estadística bayesiana (cuyo fundamento teórico es el teorema de Bayes, 1763, publicado póstumamente por Richard Price) fue desarrollada por Pierre-Simon Laplace para astronomía y balística, y experimentó un renacimiento aplicado desde los años 1950 gracias al aumento de potencia computacional.`,
      obraIconica: `Statistical Methods for Research Workers de Ronald Fisher (1925)`,
      paises: ['Reino Unido', 'EEUU', 'Europa'],
    },
    {
      id: 'computadoras-estadistica-masiva',
      nombre: 'Computadoras y Estadística Masiva',
      anioInicio: 1950,
      anioFin: 1990,
      color: '#0EA5E9',
      categoria: 'digital',
      descripcion: `Los ordenadores transformaron la estadística de cálculo manual laborioso —con tablas de logaritmos y calculadoras mecánicas— a ciencia computacional capaz de analizar millones de datos. El UNIVAC I (1951), el primer ordenador comercial americano, fue usado por CBS para predecir las elecciones presidenciales de EEUU de 1952: basándose en una muestra de los primeros resultados, predijo correctamente la victoria de Eisenhower sobre Stevenson cuando todos los medios daban la victoria al demócrata. Los productores de CBS desconfiaron de la predicción del ordenador y no la emitieron al público en tiempo real —pero el episodio demostró el potencial de la estadística computacional.

El paquete SPSS (Statistical Package for the Social Sciences, 1968), desarrollado en la Universidad de Chicago, democratizó el análisis estadístico para las ciencias sociales: por primera vez, un psicólogo o sociólogo sin formación matemática podía calcular correlaciones, regresiones y tests de hipótesis sin escribir código. SAS (Statistical Analysis System, 1976) se convirtió en el estándar de la industria farmacéutica y financiera. El lenguaje S (Bell Labs, 1976), que evolucionó a R (1993, Ross Ihaka y Robert Gentleman, Universidad de Auckland), es hoy el lenguaje estadístico estándar en academia y ciencia de datos.

En este período también se consolidaron las aplicaciones de la estadística inferencial que hoy son estándar: los ensayos clínicos aleatorizados (RCT, Randomized Controlled Trials) para evaluar medicamentos, con el primer gran ensayo moderno sobre la estreptomicina y la tuberculosis (1948, Medical Research Council, Reino Unido); las encuestas electorales con muestreo estratificado; y los sondeos de satisfacción del consumidor. La FDA (Food and Drug Administration) americana exige desde los años 1960 ensayos clínicos con grupos control aleatorizados para aprobar cualquier medicamento nuevo —un estándar que ha salvado millones de vidas al detectar medicamentos ineficaces o peligrosos.`,
      obraIconica: 'SPSS (1968) y el lenguaje R (1993): democratización del análisis estadístico',
      paises: ['EEUU', 'Reino Unido', 'Nueva Zelanda'],
    },
    {
      id: 'crisis-replicacion-p-hacking',
      nombre: 'La Crisis de Replicación y el P-Hacking',
      anioInicio: 1990,
      anioFin: 2015,
      color: '#DC2626',
      categoria: 'crisis',
      descripcion: `A finales del siglo XX y principios del XXI, la estadística científica enfrentó una crisis de credibilidad sin precedentes. El "p-hacking" (o "data dredging") es la práctica de analizar los datos de múltiples formas hasta que alguna produce un p<0,05, sin declarar las comparaciones fallidas. El sesgo de publicación —la tendencia de las revistas académicas a publicar solo resultados "positivos" (con efecto estadísticamente significativo) y rechazar los negativos— creó un ecosistema donde los resultados no replicables proliferaban en la literatura científica.

La "crisis de replicación" estalló públicamente con varios estudios de alto impacto. El Reproducibility Project (Open Science Collaboration, 2015) intentó replicar 100 estudios publicados en tres revistas de psicología de alto impacto: solo obtuvo resultados estadísticamente significativos similares en aproximadamente 39 de los 100 estudios originales. Los efectos replicados eran, en promedio, de la mitad de la magnitud del efecto original. Diederik Stapel, psicólogo social holandés, fue descubierto fabricando datos en más de 50 estudios —incluyendo estudios publicados en Science, la revista científica más prestigiosa del mundo.

John Ioannidis publicó en 2005 en PLOS Medicine el artículo "Why Most Published Research Findings Are False", uno de los más citados en la historia de la medicina: usando simulaciones estadísticas, demostró que en campos con muchas hipótesis probadas, bajos tamaños de muestra y presión para publicar resultados positivos, la mayoría de los hallazgos publicados son falsos positivos. La respuesta de la comunidad científica ha sido lenta pero estructural: la pre-registración de hipótesis (registrar el plan de análisis antes de ver los datos), los datos abiertos (Open Data), el aumento de tamaños muestrales y los meta-análisis. La American Statistical Association publicó en 2016 su Statement on p-values, pidiendo explícitamente una interpretación más matizada del p-valor y cuestionando el umbral de 0,05 como criterio binario de verdad científica.`,
      obraIconica: `"Why Most Published Research Findings Are False" — John Ioannidis (PLOS Medicine, 2005)`,
      paises: ['EEUU', 'Europa', 'Internacional'],
    },
    {
      id: 'big-data-machine-learning',
      nombre: 'Big Data y Machine Learning',
      anioInicio: 2000,
      anioFin: 2015,
      color: '#0EA5E9',
      categoria: 'digital',
      descripcion: `La era digital generó volúmenes de datos sin precedente histórico. El término "big data" fue popularizado por Roger Magoulas (O'Reilly Media) en 2005 para describir conjuntos de datos demasiado grandes y complejos para ser procesados con herramientas estadísticas tradicionales. Las tres "V" del big data —Volumen (petabytes), Velocidad (tiempo real) y Variedad (texto, imágenes, vídeo, sensores)— requerían nueva infraestructura computacional.

Google publicó en 2004 el paper de MapReduce, un paradigma de procesamiento paralelo masivo que permitía analizar petabytes de datos distribuyendo el cálculo en miles de ordenadores simultáneamente. Apache Hadoop (2006, Yahoo) implementó MapReduce como software de código abierto, democratizando el procesamiento de big data. En 2006, Jeff Bezos describió los datos como "el nuevo petróleo", y la metáfora capturó el espíritu de la época.

El machine learning —que tiene raíces profundas en la estadística (regresión logística, análisis discriminante, clustering, análisis de componentes principales)— se convirtió en la herramienta dominante para extraer patrones de datos masivos. La regresión logística es machine learning. Los árboles de decisión son estadística aplicada. Los random forests son ensembles de árboles. Las redes neuronales son regresiones no lineales con muchas capas. El Netflix Prize (2006-2009) ejemplificó la era: Netflix ofreció 1 millón de dólares al equipo que mejorara en más del 10% su algoritmo de recomendación. Ganó un consorcio que combinó cientos de modelos estadísticos distintos —el "ensemble learning". Harvard Business Review declaró en 2012 al "data scientist" el trabajo más atractivo del siglo XXI.`,
      obraIconica: `Netflix Prize (2006-2009): 1 millón de dólares por el mejor modelo estadístico de recomendación`,
      paises: ['EEUU', 'Global'],
    },
    {
      id: 'estadistica-ia-futuro',
      nombre: 'Estadística, IA y Causalidad',
      anioInicio: 2015,
      anioFin: 9999,
      color: '#0EA5E9',
      categoria: 'digital',
      descripcion: `Los modelos de lenguaje grande (LLMs) como GPT, Claude y Gemini son en esencia sistemas estadísticos masivos: aprenden distribuciones de probabilidad condicional sobre texto y generan predicciones de los tokens más probables dado el contexto previo. Toda la arquitectura Transformer (Attention Is All You Need, Google, 2017) que subyace a estos modelos es estadística aplicada a escala. La estadística bayesiana ha encontrado sus aplicaciones más potentes en la IA moderna: las redes neuronales bayesianas, la inferencia variacional y el aprendizaje por refuerzo con modelos de incertidumbre son áreas de investigación activa.

Al mismo tiempo, la estadística enfrenta nuevos desafíos éticos y técnicos. El sesgo algorítmico (algorithmic bias) es un problema documentado: el sistema COMPAS, usado en EEUU para predecir la reincidencia criminal e informar decisiones de libertad condicional, mostraba sesgos raciales estadísticamente significativos (investigación de ProPublica, 2016) —los acusados negros eran clasificados erróneamente como de alto riesgo con el doble de frecuencia que los acusados blancos. Los modelos de IA aprenden y amplifican los sesgos presentes en los datos de entrenamiento.

La inferencia causal es el nuevo horizonte de la estadística teórica: pasar de detectar correlaciones a establecer relaciones de causa-efecto sin experimentos aleatorizados. Judea Pearl (Premio Turing 2011) desarrolló el cálculo do-calculus y los grafos causales (DAGs, Directed Acyclic Graphs) para formalizar la causalidad matemáticamente (The Book of Why, 2018). La epidemiología computacional —los modelos SIR y SEIR usados para modelar la pandemia de COVID-19 en 2020— demostró la relevancia pública de la estadística matemática en tiempo real. Los errores en las predicciones del COVID-19 fueron lecciones públicas sobre la incertidumbre de los modelos estadísticos.`,
      obraIconica: `The Book of Why de Judea Pearl (2018): formalización matemática de la causalidad`,
      paises: ['Global', 'EEUU', 'Europa'],
    },
    {
      id: 'estadistica-sociedad-toma-decisiones',
      nombre: 'Estadística y Toma de Decisiones Pública',
      anioInicio: 2000,
      anioFin: 9999,
      color: '#059669',
      categoria: 'social',
      descripcion: `La estadística es hoy omnipresente en la toma de decisiones públicas y privadas, y su comprensión ciudadana —la "alfabetización estadística"— es considerada competencia básica del siglo XXI. La medicina basada en evidencia (Evidence-Based Medicine, EBM, formalizada en los años 1990 por Gordon Guyatt y el grupo de McMaster University) depende de ensayos clínicos aleatorizados y meta-análisis para evaluar tratamientos. La diferencia entre riesgo relativo y riesgo absoluto —presentada erróneamente en los medios de comunicación— es una de las causas más frecuentes de interpretación incorrecta de noticias de salud.

Las políticas públicas basadas en evidencia usan estadística sistemáticamente: el Informe PISA de la OCDE evalúa el rendimiento educativo de 79 países con muestras representativas de ~600.000 estudiantes; el índice de Gini mide la desigualdad de ingresos con un único número entre 0 (igualdad perfecta) y 1 (desigualdad máxima); el IDH (Índice de Desarrollo Humano) de la ONU combina esperanza de vida, educación e ingresos en un único indicador compuesto. Los bancos centrales (BCE, Fed) usan modelos econométricos para fijar tipos de interés. Las compañías de seguros usan la actuaría —rama de la estadística aplicada a riesgos financieros y demográficos— para calcular primas con márgenes controlados.

Los sondeos electorales y su fiabilidad han sido tema de debate público: las encuestas erraron en Brexit (2016), en las elecciones de EEUU (2016 y 2020) y en varios comicios europeos, generando una discusión pública sobre muestreo, sesgo de respuesta y ponderación estadística. La "alfabetización estadística" —entender porcentajes, riesgos relativos, intervalos de confianza y sesgos de selección— es considerada por la OCDE y la OMS tan necesaria como la alfabetización lectora para que los ciudadanos puedan tomar decisiones informadas sobre su salud, sus finanzas y su voto.`,
      obraIconica: `Informe PISA (OCDE, desde 2000): estadística al servicio de la política educativa global`,
      paises: ['Global', 'España', 'EEUU', 'Europa'],
    },
  ],

  eras: [
    {
      nombre: 'Censos y Aritmética del Poder',
      desde: -3000,
      hasta: 1654,
      icono: '🏛️',
      hitosDestacados: [
        'Censos Antiguos y Aritmética del Poder',
      ],
      eventos: [
        'Tablillas babilónicas de conteo de ganado y cereales (~3000 a.C.)',
        'Censos de población en la China Zhou (~1100 a.C.)',
        'Census romano quinquenal para impuestos y reclutamiento',
        'Libro Domesday: inventario de toda la propiedad de Inglaterra (1086)',
        'Cardano analiza los dados y el azar en el Liber de Ludo Aleae (~1564)',
        'La palabra "estadística" deriva del latín status (Estado)',
      ],
    },
    {
      nombre: 'Nacimiento de la Probabilidad',
      desde: 1654,
      hasta: 1800,
      icono: '🎲',
      hitosDestacados: [
        'Pascal, Fermat y el Nacimiento de la Probabilidad',
      ],
      eventos: [
        'Correspondencia Pascal-Fermat sobre el "problema de los puntos" (1654)',
        'De Ratiociniis in Ludo Aleae de Huygens (1657): primer tratado formal de probabilidad',
        'Tabla de mortalidad de Edmund Halley para Breslau (1693)',
        'Ars Conjectandi de Bernoulli: Ley de los Grandes Números (1713)',
        `The Doctrine of Chances de De Moivre: distribución normal proto-matemática (1718)`,
        'Teorema de Bayes (1763, publicado póstumamente por Richard Price)',
      ],
    },
    {
      nombre: 'Estadística Social y Científica',
      desde: 1800,
      hasta: 1920,
      icono: '📊',
      hitosDestacados: [
        'Estadística Social: Quetelet y Nightingale',
        'Galton, Pearson y la Estadística Biológica',
      ],
      eventos: [
        `Quetelet acuña el concepto de "homme moyen" y la física social (1835)`,
        'Florence Nightingale diseña los diagramas de área polar sobre mortalidad en Crimea (1858)',
        'Galton desarrolla la correlación y la regresión a la media (1877-1888)',
        'Galton acuña el término "eugenesia" (1883)',
        'Pearson formaliza el coeficiente de correlación r y el test chi-cuadrado (1895-1900)',
        'Fundación de Biometrika: el primer journal estadístico de biología (1901)',
        'Primera cátedra de Estadística del mundo en University College London (1911)',
        'Primera ley de esterilización eugenésica en Indiana, EEUU (1907)',
      ],
    },
    {
      nombre: 'Inferencia Estadística y Computadoras',
      desde: 1920,
      hasta: 1990,
      icono: '🔬',
      hitosDestacados: [
        'Fisher, Neyman y la Inferencia Estadística',
        'Computadoras y Estadística Masiva',
      ],
      eventos: [
        'Statistical Methods for Research Workers de Fisher (1925): ANOVA y p-valor',
        'The Design of Experiments de Fisher (1935): diseño experimental moderno',
        'Primer ensayo clínico aleatorizado: estreptomicina y tuberculosis (1948, MRC Reino Unido)',
        'UNIVAC I predice elecciones de EEUU (1952)',
        'FDA exige ensayos clínicos aleatorizados para aprobación de medicamentos (años 1960)',
        'SPSS democratiza el análisis estadístico para ciencias sociales (1968)',
        'SAS: estándar estadístico de la industria farmacéutica (1976)',
        'Lenguaje S en Bell Labs (1976), origen de R (1993)',
      ],
    },
    {
      nombre: 'Big Data y Crisis de Replicación',
      desde: 1990,
      hasta: 2015,
      icono: '💻',
      hitosDestacados: [
        'La Crisis de Replicación y el P-Hacking',
        'Big Data y Machine Learning',
      ],
      eventos: [
        'R (1993): lenguaje estadístico de código abierto, estándar académico mundial',
        `"Why Most Published Research Findings Are False" — Ioannidis (PLOS Medicine, 2005)`,
        'Google MapReduce (2004) y Apache Hadoop (2006): infraestructura big data',
        'Netflix Prize (2006-2009): 1 millón de dólares por el mejor modelo de recomendación',
        `"Data scientist: sexiest job of the 21st century" — Harvard Business Review (2012)`,
        'Caso Diederik Stapel: fabricación de datos en >50 estudios de psicología (2011)',
        'Reproducibility Project: solo ~39/100 estudios de psicología se replican (2015)',
        'American Statistical Association: Statement on p-values (2016)',
      ],
    },
    {
      nombre: 'IA, Causalidad y Decisión Pública',
      desde: 2015,
      hasta: 9999,
      icono: '🤖',
      hitosDestacados: [
        'Estadística, IA y Causalidad',
        'Estadística y Toma de Decisiones Pública',
      ],
      eventos: [
        'Caso COMPAS: sesgo racial documentado en algoritmos de reincidencia criminal (ProPublica, 2016)',
        'Attention Is All You Need: arquitectura Transformer (Google, 2017)',
        'The Book of Why de Judea Pearl: formalización matemática de la causalidad (2018)',
        'Modelos SIR/SEIR para COVID-19: estadística en tiempo real para política pública (2020)',
        'LLMs (GPT, Claude, Gemini): sistemas estadísticos masivos de distribuciones sobre texto',
        `Debate sobre "post-p-valor": propuestas de cambiar el umbral a 0,005 o eliminar umbrales fijos`,
        'Inferencia causal y DAGs como nuevo estándar en epidemiología y ciencias sociales',
        `"Alfabetización estadística" como competencia básica del siglo XXI (OCDE, OMS)`,
      ],
    },
  ],

  categorias: {
    origen: 'Censos y Orígenes',
    probabilidad: 'Probabilidad y Azar',
    social: 'Estadística Social',
    ciencia: 'Estadística Científica',
    inferencia: 'Inferencia y Tests',
    digital: 'Era Digital e IA',
    crisis: 'Controversias y Crisis',
  },

  colores: {
    origen: '#374151',
    probabilidad: '#7C3AED',
    social: '#059669',
    ciencia: '#1E3A8A',
    inferencia: '#D97706',
    digital: '#0EA5E9',
    crisis: '#DC2626',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: `Del censo babilónico que contaba cabezas de ganado para calcular impuestos (~3000 a.C.) al algoritmo de machine learning que predice qué película verás esta noche: la estadística es la ciencia de extraer información de datos inciertos. En 5.000 años ha pasado de herramienta del Estado a fundamento de la medicina, la economía y la inteligencia artificial. Hoy, cada vacuna aprobada, cada encuesta electoral y cada recomendación de Netflix son estadística aplicada. Entender sus conceptos básicos —y sus limitaciones— es una competencia ciudadana esencial.`,

    tablaComparativa: [
      {
        hito: 'Media y varianza',
        periodo: '1809 (Gauss)',
        categoria: 'Estadística descriptiva',
        personaje: 'Carl Friedrich Gauss',
        aportacion: 'Descripción numérica de una distribución de datos',
      },
      {
        hito: 'Correlación de Pearson',
        periodo: '1895 (Pearson)',
        categoria: 'Estadística descriptiva',
        personaje: 'Karl Pearson',
        aportacion: 'Mide la relación lineal entre dos variables (-1 a +1)',
      },
      {
        hito: 'P-valor',
        periodo: '1925 (Fisher)',
        categoria: 'Inferencia estadística',
        personaje: 'Ronald Fisher',
        aportacion: 'Probabilidad de obtener el resultado observado si la hipótesis nula es cierta',
      },
      {
        hito: 'Intervalo de confianza',
        periodo: '1937 (Neyman)',
        categoria: 'Inferencia estadística',
        personaje: 'Jerzy Neyman',
        aportacion: 'Rango de valores plausibles para el parámetro estimado',
      },
      {
        hito: 'Regresión lineal',
        periodo: '1886 (Galton)',
        categoria: 'Modelización',
        personaje: 'Francis Galton',
        aportacion: 'Predice el valor de una variable a partir de otra u otras',
      },
      {
        hito: 'Teorema de Bayes',
        periodo: '1763 (Bayes/Laplace)',
        categoria: 'Probabilidad bayesiana',
        personaje: 'Thomas Bayes / Pierre-Simon Laplace',
        aportacion: 'Actualiza probabilidades a medida que llega nueva información',
      },
    ],

    escenarios: [
      {
        icono: '🏥',
        titulo: 'Cómo la estadística salvó vidas: Florence Nightingale',
        perfil: 'Pionera de la enfermería basada en datos (1854-1858)',
        texto: `Durante la Guerra de Crimea, Florence Nightingale recogió datos sistemáticos sobre las causas de muerte de los soldados en el hospital de Scutari. Descubrió que el 87% de las muertes se debían a enfermedades infecciosas prevenibles (cólera, tifus, disentería), no a heridas de combate. Para comunicarlo al Parlamento Británico, diseñó los diagramas de área polar (coxcombs): infografías estadísticas que mostraban en colores las causas de muerte mes a mes. Su presentación convenció al Parlamento de invertir en saneamiento y mejorar las condiciones hospitalarias. La tasa de mortalidad en el hospital cayó del 42% al 2% en seis meses tras las reformas. Nightingale demostró que la visualización estadística puede salvar vidas al hacer comprensibles los datos para quienes toman decisiones.`,
      },
      {
        icono: '⚠️',
        titulo: 'Estadística y eugenesia: el mismo método, usos radicalmente diferentes',
        perfil: 'Correlación, regresión y sus aplicaciones éticamente opuestas (1880-1945)',
        texto: `Francis Galton usó los mismos conceptos estadísticos (correlación, regresión a la media) para dos fines completamente distintos: describir la herencia de la inteligencia (científicamente válido) y proponer la eugenesia —la mejora de la raza humana mediante control de la reproducción (éticamente execrable). La eugenesia fue adoptada como política pública en EEUU (más de 60.000 esterilizaciones forzadas documentadas entre 1907 y 1981) y en la Alemania nazi (base pseudo-científica del Holocausto). Este caso muestra que la validez matemática de una herramienta estadística no garantiza la validez ética de sus aplicaciones. La misma correlación que hoy usamos para análisis de mercado, genómica o psicología fue usada para justificar crímenes contra la humanidad. La historia de la estadística no puede contarse sin este episodio.`,
      },
      {
        icono: '🔄',
        titulo: 'La crisis de replicación: por qué muchos estudios científicos no son reproducibles',
        perfil: 'Psicología, medicina y ciencias sociales bajo escrutinio (2005-2020)',
        texto: `Publicar en una revista científica de prestigio no garantiza que un resultado sea real. La crisis de replicación reveló que muchos estudios publicados en las mejores revistas de psicología, medicina y economía no podían ser reproducidos por otros investigadores. Las causas son estadísticas: muestras pequeñas (poca potencia estadística), p-hacking (buscar análisis que den p<0,05), sesgo de publicación (las revistas solo publican resultados positivos) y falta de pre-registración de hipótesis. El resultado es que el 61% de los estudios de psicología social no se replicaron. La solución es también estadística: pre-registración de hipótesis, datos abiertos, aumento de tamaños muestrales y transparencia en el análisis. La crisis de replicación es una lección sobre los límites y el uso correcto de la estadística.`,
      },
      {
        icono: '🤖',
        titulo: 'Machine learning como estadística aplicada',
        perfil: 'De la regresión logística a los LLMs (1990-presente)',
        texto: `El machine learning no es una disciplina separada de la estadística: es estadística aplicada a escala computacional masiva. La regresión logística (estadística clásica) clasifica imágenes de spam. Los árboles de decisión (técnica estadística de los años 1980) se usan para diagnóstico médico. Los random forests (ensemble de árboles) predicen precios de viviendas. Las redes neuronales son regresiones no lineales con millones de parámetros. Los LLMs como GPT o Claude aprenden distribuciones de probabilidad condicional sobre texto y generan el token más probable dado el contexto. Toda la revolución de la IA moderna está construida sobre fundamentos estadísticos: probabilidad, optimización, estimación de distribuciones. Entender estadística es entender IA.`,
      },
    ],

    faq: [
      {
        pregunta: '¿Qué es el p-valor y por qué se usa —y se abusa— tanto?',
        respuesta: `El p-valor es la probabilidad de obtener un resultado al menos tan extremo como el observado, asumiendo que no hay ningún efecto real (hipótesis nula). Si p=0,03, significa que si no hubiera ningún efecto, obtendríamos este resultado (o uno más extremo) solo el 3% de las veces. Lo que NO significa: que el resultado sea verdadero con un 97% de probabilidad, que el efecto sea grande o importante, ni que sea reproducible. Se abusa del p-valor porque publicar resultados con p<0,05 es más fácil en las revistas científicas, lo que incentiva el p-hacking y el sesgo de publicación. La American Statistical Association recomendó en 2016 no usar el p-valor como único criterio de validez científica.`,
        tip: 'Un p<0,05 con una muestra de 10 personas es mucho menos convincente que un p<0,05 con una muestra de 10.000 personas.',
      },
      {
        pregunta: '¿Qué diferencia hay entre correlación y causalidad?',
        respuesta: `La correlación mide si dos variables tienden a variar juntas (cuando una sube, la otra también, o cuando una baja, la otra sube). La causalidad implica que una variable produce el cambio en la otra. Una correlación puede existir sin causalidad por tres razones: causalidad inversa (A parece causar B, pero B causa A), variable confusora (una tercera variable C causa tanto A como B), o pura coincidencia. Ejemplo clásico: los países con más televisores por habitante tienen mayor esperanza de vida. Los televisores no causan longevidad: ambas variables están causadas por el nivel de desarrollo económico. Establecer causalidad requiere experimentos aleatorizados o métodos cuasi-experimentales (diferencias en diferencias, regresión discontinua, variables instrumentales).`,
        tip: 'El sitio Spurious Correlations (tylervigen.com) muestra correlaciones absurdas como la entre los ahogados en piscinas y las películas de Nicolas Cage.',
      },
      {
        pregunta: '¿Qué es el sesgo de confirmación en el análisis de datos?',
        respuesta: `El sesgo de confirmación es la tendencia a buscar, interpretar y recordar datos que confirman creencias previas, ignorando los que las contradicen. En análisis de datos, se manifiesta como: elegir el período de análisis que muestra el resultado deseado, comparar con el grupo de referencia conveniente, ignorar variables confusoras, o detener el análisis cuando el resultado es positivo (sin esperar la muestra completa). La solución estadística es la pre-registración: declarar antes de ver los datos qué hipótesis se va a probar, con qué método y con qué muestra. Esto hace que el análisis sea verificable y reduce el sesgo de confirmación.`,
      },
      {
        pregunta: '¿Cómo se hace una encuesta representativa?',
        respuesta: `Una encuesta representativa requiere: (1) Marco muestral claro: definir exactamente la población que se quiere estudiar. (2) Muestreo aleatorio: cada individuo de la población debe tener la misma probabilidad de ser seleccionado (o una probabilidad conocida, en muestreo estratificado). (3) Tamaño muestral suficiente: para una precisión de ±3% con 95% de confianza, se necesitan ~1.067 personas independientemente del tamaño total de la población. (4) Control del sesgo de respuesta: los que responden pueden ser sistemáticamente diferentes de los que no responden. El error de las encuestas electorales recientes (Brexit, EEUU 2016/2020) se debió principalmente a sesgos de muestreo no cubiertos (votantes rurales, baja participación de ciertos grupos) y a errores en las ponderaciones estadísticas posteriores.`,
        tip: `El tamaño de muestra para una encuesta nacional es similar al de una encuesta local: lo que importa no es el tamaño relativo de la muestra sino el absoluto.`,
      },
      {
        pregunta: '¿Qué es el teorema de Bayes y por qué importa?',
        respuesta: `El teorema de Bayes (Thomas Bayes, 1763) describe cómo actualizar la probabilidad de una hipótesis cuando llega nueva evidencia. La fórmula: P(H|E) = P(E|H) × P(H) / P(E). En palabras: la probabilidad posterior de que H sea cierta dado que observamos E es proporcional a la probabilidad de observar E si H fuera cierta, multiplicada por la probabilidad previa de H. Ejemplo: si un test de enfermedad tiene un 99% de sensibilidad y la prevalencia de la enfermedad es del 1%, un resultado positivo solo implica ~50% de probabilidad real de tener la enfermedad. Importa porque: es la base de los filtros de spam, del diagnóstico médico bayesiano, del machine learning probabilístico, de los LLMs y de la epidemiología moderna.`,
        tip: `El teorema de Bayes fue publicado en 1763 por Richard Price tras la muerte de Bayes; Laplace lo desarrolló independientemente y le dio la forma moderna.`,
      },
    ],

    pasos: [
      {
        titulo: 'Formular la hipótesis antes de recoger datos (pre-registración)',
        cuerpo: `El primer paso de un estudio estadístico riguroso es declarar, antes de ver ningún dato, qué se va a probar: la hipótesis nula (no hay efecto), la hipótesis alternativa (hay efecto), el método estadístico que se va a usar, el tamaño muestral objetivo y el criterio de decisión. Esta pre-registración puede hacerse en plataformas como OSF (Open Science Framework) o AsPredicted.org. La razón es sencilla: si se decide qué probar después de ver los datos, se puede elegir la hipótesis que los datos ya confirman, generando un falso positivo. La pre-registración hace el análisis verificable y limita el p-hacking.`,
      },
      {
        titulo: 'Determinar el tamaño muestral necesario (análisis de potencia)',
        cuerpo: `Antes de recoger datos, se debe calcular cuántas observaciones se necesitan para tener una probabilidad razonable (típicamente 80%) de detectar el efecto de interés si existe. Este cálculo depende de tres parámetros: el tamaño del efecto esperado (¿cuánto cambia la variable de resultado?), el nivel de significación elegido (0,05) y la potencia deseada (1 menos la probabilidad de falso negativo). Estudios con muestras demasiado pequeñas tienen baja potencia: pueden no detectar efectos reales (falsos negativos) o, si detectan algo, el efecto es probablemente una sobreestimación (winner's curse). Hay calculadoras de potencia gratuitas: G*Power, pwr en R.`,
      },
      {
        titulo: 'Aleatorizar la asignación a grupos (diseño experimental)',
        cuerpo: `La aleatorización —asignar participantes al grupo de tratamiento o al grupo control mediante un proceso aleatorio— es el elemento clave que distingue un experimento de una observación. La aleatorización garantiza que, en promedio, los dos grupos son iguales en todas las variables (observadas y no observadas) antes del tratamiento, lo que permite atribuir cualquier diferencia posterior al tratamiento y no a diferencias previas entre los grupos. Sin aleatorización, las diferencias observadas pueden deberse a variables confusoras (selection bias). Los ensayos clínicos aleatorizados (RCT) son el estándar de oro en medicina; cuando la aleatorización no es posible (ética, práctica), se usan métodos cuasi-experimentales.`,
      },
      {
        titulo: 'Analizar los datos con el método pre-especificado',
        cuerpo: `Una vez recogidos los datos, el análisis debe seguir el plan pre-especificado. Si se descubren datos atípicos (outliers), su tratamiento debe justificarse explícitamente y, si se eliminan, el análisis debe hacerse también con ellos incluidos. Si hay datos faltantes (missing data), el método de imputación debe estar justificado. El análisis exploratorio (buscar patrones no anticipados en los datos) es valioso y legítimo, pero debe presentarse como hipótesis generadoras para estudios futuros, no como confirmaciones del estudio actual. Mezclar análisis confirmatorio y exploratorio sin distinguirlos es una de las causas del p-hacking.`,
      },
      {
        titulo: 'Publicar con datos abiertos, incluyendo resultados nulos',
        cuerpo: `El último paso de un estudio estadístico riguroso es la publicación transparente: compartir los datos crudos (Open Data) en un repositorio público (OSF, Zenodo, figshare), publicar el código de análisis (Open Code, en R, Python o Stata), y publicar los resultados independientemente de si son positivos o negativos. Los resultados nulos (no encontré el efecto que buscaba) son científicamente valiosos y combaten el sesgo de publicación. La pre-impresión (preprint en arXiv, medRxiv, bioRxiv) permite la revisión científica pública antes de la revisión formal por pares. Estas prácticas son el núcleo de la "Open Science" o Ciencia Abierta, que se está convirtiendo en estándar en muchas áreas científicas.`,
      },
    ],

    tips: [
      {
        icono: '📏',
        texto: `Cómo interpretar un intervalo de confianza del 95%: NO significa que hay un 95% de probabilidad de que el parámetro esté en ese rango. Significa que si repitieras el experimento muchas veces, el 95% de los intervalos calculados contendrían el verdadero parámetro. En la práctica: un IC 95% que no incluye el cero indica un efecto estadísticamente significativo al nivel 0,05.`,
      },
      {
        icono: '⚖️',
        texto: `Diferencia entre riesgo relativo y riesgo absoluto en noticias de salud: "Un medicamento reduce el riesgo de infarto en un 50%" suena impresionante. Pero si el riesgo basal es del 2% y pasa al 1%, la reducción absoluta es solo del 1%. El riesgo relativo (50%) es siempre más llamativo que el absoluto (1%). Para evaluar la utilidad real de una intervención, pide siempre el riesgo absoluto o el NNT (Number Needed to Treat: cuántos pacientes hay que tratar para evitar un evento).`,
      },
      {
        icono: '📚',
        texto: `Recursos gratuitos para aprender estadística: Seeing Theory (seeing-theory.brown.edu) visualiza interactivamente los conceptos de probabilidad. StatQuest with Josh Starmer (YouTube) explica estadística y machine learning con animaciones y humor. Khan Academy tiene un curso completo gratuito de estadística en español. R para principiantes: el paquete tidyverse y ggplot2 son el estándar para análisis y visualización de datos.`,
      },
      {
        icono: '🔍',
        texto: `Cómo detectar gráficos estadísticos manipulados: (1) Eje Y truncado: si el eje Y no empieza en 0, las diferencias parecen mucho mayores de lo que son. (2) Escala no lineal sin indicar: logarítmica vs. lineal cambia completamente la percepción del crecimiento. (3) Muestra selectiva: mostrar solo el período en que el indicador es favorable. (4) Comparación con el grupo equivocado: "somos mejores que nuestra media de hace 10 años" vs. "somos peores que la media del sector". La regla de oro: pedir siempre el gráfico con el eje Y empezando en 0 y el período completo de datos.`,
      },
    ],

    errores: [
      {
        titulo: '"Correlación implica causalidad"',
        cuerpo: `El error estadístico más frecuente en medios de comunicación y redes sociales. Solo porque dos cosas varíen juntas no significa que una cause la otra. Los países que comen más chocolate tienen más premios Nobel (r=0,79, Messerli 2012, New England Journal of Medicine —publicado como broma académica). Los usuarios de iPhone en EEUU tienen mayor esperanza de vida que los de Android. El número de piernas de un animal correlaciona negativamente con su velocidad de reproducción. Establecer causalidad requiere experimentos aleatorizados o métodos cuasi-experimentales. Cuando veas "X se asocia con Y", pregúntate siempre: ¿hay una variable confusora? ¿Podría ser causalidad inversa?`,
      },
      {
        titulo: `"Una muestra de 1.000 personas no puede representar a millones"`,
        cuerpo: `La intuición dice que para estudiar 47 millones de españoles, necesitarías millones de encuestados. Pero el error de muestreo depende del tamaño absoluto de la muestra, no del tamaño relativo respecto a la población. Con una muestra aleatoria de 1.067 personas, el margen de error es ±3% con 95% de confianza, independientemente de si la población total es un millón o mil millones. Lo que importa es la aleatorización (que cada persona tenga la misma probabilidad de ser seleccionada), no el porcentaje de la población muestreado. Las encuestas fallan cuando no son verdaderamente aleatorias, no cuando son pequeñas.`,
      },
      {
        titulo: `"Si el p-valor es 0,05, el resultado es verdadero con 95% de probabilidad"`,
        cuerpo: `Esta es la interpretación más común del p-valor y también la incorrecta. El p-valor no es la probabilidad de que la hipótesis nula sea falsa. Es la probabilidad de obtener datos al menos tan extremos como los observados, asumiendo que la hipótesis nula es verdadera. Son matemáticamente muy diferentes. Para calcular la probabilidad de que la hipótesis sea verdadera dada la evidencia, necesitas el teorema de Bayes y una probabilidad previa. Con una probabilidad previa baja (hipótesis improbable a priori), incluso con p<0,05, la probabilidad posterior de que sea verdadera puede ser inferior al 50%. Este error de interpretación es una de las causas de la crisis de replicación.`,
      },
      {
        titulo: '"Los datos no mienten"',
        cuerpo: `Los datos son recogidos, seleccionados, limpiados e interpretados por personas, con sesgos en cada paso. Los datos de entrenamiento de los LLMs sobrerrepresentan el inglés y las fuentes occidentales. Las encuestas hospitalarias sobre enfermedades crónicas sobrerrepresentan los casos graves (sesgo de Berkson). Las estadísticas de criminalidad reflejan también las prioridades policiales de dónde se patrulla. El índice GINI mide desigualdad de ingresos, no de riqueza. El PIB no incluye el trabajo no remunerado ni el daño medioambiental. Cada dato tiene una definición operativa, un método de recogida y un contexto. "Los datos no mienten" es una frase peligrosa que confunde la objetividad del número con la objetividad del proceso que lo generó.`,
      },
    ],
  },
};
