import type { HistoriaData } from './types';

export const primeraGuerraMundial: HistoriaData = {
  slug: 'primera-guerra-mundial',
  titulo: 'La Primera Guerra Mundial: De Sarajevo al Tratado de Versalles',
  subtitulo: 'La Gran Guerra que enterró el siglo XIX y redibujó el mapa de Europa: 4 años, 20 millones de muertos, el fin de cuatro imperios',
  descripcionSEO: 'Cronología interactiva de la Primera Guerra Mundial (1914-1919): desde el asesinato de Sarajevo hasta el Tratado de Versalles. Explora las batallas, los frentes, las revoluciones y las causas de la Gran Guerra.',
  keywords: [
    'Primera Guerra Mundial', 'Gran Guerra', '1914', '1918', 'Sarajevo',
    'Verdún', 'Somme', 'trincheras', 'Tratado de Versalles', 'frente occidental',
    'Revolución Rusa', 'Plan Schlieffen', 'guerra submarina', 'armisticio',
    'historia contemporánea', 'imperialismo', 'Triple Entente', 'Triplice'
  ],
  anioInicio: 1914,
  anioFin: 1919,

  hitos: [
    {
      id: 'sarajevo-julio',
      nombre: 'El Asesinato de Sarajevo y la Crisis de Julio',
      anioInicio: 1914,
      anioFin: 1914,
      color: '#8B4513',
      categoria: 'causas',
      descripcion: 'El 28 de junio de 1914, el archiduque Francisco Fernando de Austria y su esposa Sofía fueron asesinados en Sarajevo por Gavrilo Princip, nacionalista serbio de la organización Mano Negra. El atentado desencadenó la llamada "Crisis de Julio": Austria-Hungría envió un ultimátum humillante a Serbia, que lo rechazó parcialmente. El sistema de alianzas —Triple Entente (Francia, Rusia, Gran Bretaña) frente a la Triplice (Alemania, Austria-Hungría, Italia)— arrastró a las grandes potencias en cascada. El 28 de julio Austria declaró la guerra a Serbia; Rusia movilizó en apoyo serbio; Alemania declaró la guerra a Rusia el 1 de agosto y a Francia el 3 de agosto. La Europa de las alianzas convirtió un asesinato en una guerra continental.',
      obraIconica: 'Pistola FN Modèle 1910 con la que Princip disparó los tiros que iniciaron la Gran Guerra',
      paises: ['Austria-Hungría', 'Serbia', 'Alemania', 'Rusia', 'Francia', 'Gran Bretaña'],
    },
    {
      id: 'plan-schlieffen',
      nombre: 'El Plan Schlieffen: La Guerra Relámpago que No Fue',
      anioInicio: 1914,
      anioFin: 1914,
      color: '#8B4513',
      categoria: 'causas',
      descripcion: 'El Estado Mayor alemán ejecutó el Plan Schlieffen: una ofensiva relámpago hacia el oeste atravesando Bélgica para rodear París en seis semanas, antes de girar al frente oriental contra Rusia. La invasión de la neutral Bélgica el 4 de agosto provocó la entrada de Gran Bretaña en la guerra, al amparo del tratado de 1839 que garantizaba la neutralidad belga. Las tropas alemanas avanzaron hasta las puertas de París, pero el general Joffre reunió reservas —incluso en taxis parisinos— y en la primera batalla del Marne (5-12 septiembre 1914) detuvo el avance. El plan fracasó: Alemania tendría que combatir en dos frentes simultáneos, exactamente lo que había intentado evitar.',
      obraIconica: 'Primera batalla del Marne, que detuvo el avance alemán y frustró el Plan Schlieffen',
      paises: ['Alemania', 'Bélgica', 'Francia', 'Gran Bretaña'],
    },
    {
      id: 'trincheras-frente-occidental',
      nombre: 'La Carrera al Mar y el Frente de Trincheras',
      anioInicio: 1914,
      anioFin: 1915,
      color: '#708090',
      categoria: 'trincheras',
      descripcion: 'Tras el fracaso del Plan Schlieffen, ambos bandos intentaron flanquear al enemigo moviéndose hacia el norte —la "Carrera al Mar"— hasta que el frente se estabilizó desde el Canal de la Mancha hasta la frontera suiza: 700 kilómetros de trincheras. Los soldados vivían en zanjas de barro infectadas de ratas y piojos, bajo el fuego de artillería y los ataques con gas mostaza. Entre las líneas se extendía la "tierra de nadie", un páramo devastado de alambre de espino y cadáveres. Las grandes ofensivas ganaban apenas metros a costa de miles de vidas. La guerra de movimiento había dado paso a una guerra de desgaste que se prolongaría cuatro años.',
      obraIconica: 'Sistema de trincheras en Flandes: símbolo permanente de la crueldad de la guerra moderna',
      paises: ['Alemania', 'Francia', 'Gran Bretaña', 'Bélgica'],
    },
    {
      id: 'frente-oriental-imperios',
      nombre: 'El Frente Oriental y los Imperios Centrales',
      anioInicio: 1914,
      anioFin: 1916,
      color: '#4B0082',
      categoria: 'frente-oriental',
      descripcion: 'En el este, el frente fue más móvil que en el oeste. En Tannenberg (agosto 1914), Hindenburg y Ludendorff aniquilaron al ejército ruso del general Samsonov (90.000 prisioneros). La campaña de Galitzia alternó victorias y derrotas. En 1915 Italia abandonó la Triplice y entró en guerra del lado de la Entente tras el Tratado de Londres, abriendo el frente italiano. La campaña de Gallípoli (1915), impulsada por Churchill, intentó abrir el estrecho para abastecer a Rusia; los cuerpos ANZAC australianos y neozelandeses combatieron heroicamente pero la operación fracasó con 250.000 bajas aliadas. El Imperio Otomano, aliado de Alemania, perpetró el genocidio armenio (1915).',
      obraIconica: 'Batalla de Tannenberg (1914): mayor victoria alemana en el frente oriental y símbolo de la guerra de movimiento en el este',
      paises: ['Rusia', 'Alemania', 'Austria-Hungría', 'Imperio Otomano', 'Italia', 'Australia', 'Nueva Zelanda'],
    },
    {
      id: 'guerra-naval',
      nombre: 'La Guerra en el Mar',
      anioInicio: 1914,
      anioFin: 1916,
      color: '#1E90FF',
      categoria: 'mar',
      descripcion: 'La Royal Navy estableció un bloqueo naval que cortó las importaciones alemanas de alimentos y materias primas, provocando hambre en Alemania (700.000 civiles muertos por inanición al final de la guerra). Alemania respondió con la guerra submarina sin restricciones: los U-Boot atacaban cualquier barco en las aguas británicas. El 7 de mayo de 1915 el submarino U-20 hundió el trasatlántico Lusitania frente a la costa irlandesa: murieron 1.198 personas, incluidos 128 estadounidenses. La presión de EEUU obligó a Alemania a suspender temporalmente la guerra submarina irrestricta. La mayor batalla naval fue la de Jutlandia (mayo 1916): Gran Bretaña perdió más barcos, pero la flota alemana quedó bloqueada en puerto para el resto de la guerra.',
      obraIconica: 'Hundimiento del Lusitania (7 de mayo de 1915), que acercó a EEUU a la guerra',
      paises: ['Gran Bretaña', 'Alemania', 'Estados Unidos'],
    },
    {
      id: 'verdun-somme',
      nombre: 'La Carnicería de Verdún y el Somme',
      anioInicio: 1916,
      anioFin: 1916,
      color: '#B22222',
      categoria: 'crisis',
      descripcion: 'El año 1916 fue el más sangriento de la guerra. La batalla de Verdún (febrero-diciembre 1916) fue ideada por el general alemán Falkenhayn para "sangrar a Francia hasta morir": diez meses de combate entre las mismas colinas, con cerca de 700.000 bajas entre ambos bandos. El general Pétain se hizo legendario: "Ils ne passeront pas". Para aliviar Verdún, los aliados lanzaron la batalla del Somme (julio-noviembre 1916): el primer día, el 1 de julio, el ejército británico sufrió 57.470 bajas —el día más sangriento de su historia—. La batalla costó un millón de bajas y apenas avanzó unos kilómetros. Fue en el Somme donde los británicos emplearon por primera vez los tanques, sin éxito decisivo.',
      obraIconica: 'Batalla de Verdún (1916): símbolo del sacrificio absurdo y de la resistencia francesa',
      paises: ['Francia', 'Alemania', 'Gran Bretaña'],
    },
    {
      id: 'revolucion-rusa',
      nombre: 'La Revolución Rusa y el Frente Oriental se Rompe',
      anioInicio: 1917,
      anioFin: 1917,
      color: '#4B0082',
      categoria: 'frente-oriental',
      descripcion: 'Las enormes pérdidas rusas —hasta 1917 habían muerto más de 1,7 millones de soldados— y la miseria en la retaguardia desestabilizaron al Imperio zarista. En febrero de 1917 estalló la revolución que obligó al zar Nicolás II a abdicar. El gobierno provisional siguió combatiendo, pero el partido bolchevique de Lenin (que regresó en el "tren sellado" facilitado por Alemania) prometió "paz, tierra y pan". La revolución de octubre de 1917 llevó a los bolcheviques al poder. Lenin inició negociaciones con Alemania que culminaron en el Tratado de Brest-Litovsk (marzo 1918): Rusia cedía enormes territorios a cambio de la paz. Alemania liberó un millón de soldados del frente oriental hacia el occidental.',
      obraIconica: 'Revolución de Octubre de 1917: los bolcheviques toman el poder y sacan a Rusia de la guerra',
      paises: ['Rusia', 'Alemania'],
    },
    {
      id: 'eeuu-entra-guerra',
      nombre: 'Estados Unidos Entra en Guerra',
      anioInicio: 1917,
      anioFin: 1917,
      color: '#B22222',
      categoria: 'crisis',
      descripcion: 'En enero de 1917, Alemania reanudó la guerra submarina irrestricta, hundiendo barcos neutrales y americanos. En febrero, el servicio de inteligencia británico interceptó el "telegrama Zimmermann": el canciller alemán proponía a México una alianza —si EEUU entraba en guerra, México recuperaría Texas, Nuevo México y Arizona. La publicación del telegrama indignó a la opinión pública estadounidense. El presidente Woodrow Wilson, reelegido con el lema "nos mantuvo fuera de la guerra", no pudo resistir más: el 6 de abril de 1917 el Congreso declaró la guerra a Alemania. Dos millones de soldados americanos ("doughboys") cruzaron el Atlántico en 1917-1918, inclinando definitivamente la balanza a favor de la Entente.',
      obraIconica: 'Telegrama Zimmermann (enero 1917): la propuesta alemana a México que precipitó la entrada de EEUU en la guerra',
      paises: ['Estados Unidos', 'Alemania', 'México', 'Gran Bretaña'],
    },
    {
      id: 'ultima-ofensiva-colapso',
      nombre: 'La Última Ofensiva y el Colapso Alemán',
      anioInicio: 1918,
      anioFin: 1918,
      color: '#B22222',
      categoria: 'crisis',
      descripcion: 'Con las tropas liberadas del frente oriental, el general Ludendorff lanzó la Operación Miguel el 21 de marzo de 1918: la mayor ofensiva alemana del frente occidental, con nuevas tácticas de "Sturmtruppen". Los alemanes avanzaron 60 km, pero se agotaron logísticamente y sin refuerzos. En agosto, el mariscal Foch lanzó la contraofensiva de los "100 Días": una ofensiva aliada continua apoyada por tanques y tropas frescas americanas. El frente alemán se desintegró. En septiembre Bulgaria se rindió; en octubre el Imperio Otomano y Austria-Hungría. En Alemania estalló la revolución: motines en la marina de Kiel, el káiser Guillermo II abdicó el 9 de noviembre y se proclamó la república. El 11 de noviembre, a las 11 de la mañana, entró en vigor el armisticio.',
      obraIconica: 'Contraofensiva de los "100 Días" (agosto-noviembre 1918): la ofensiva final que quebró el frente alemán',
      paises: ['Alemania', 'Francia', 'Gran Bretaña', 'Estados Unidos', 'Bulgaria', 'Austria-Hungría', 'Imperio Otomano'],
    },
    {
      id: 'armisticio-versalles',
      nombre: 'El Armisticio y el Tratado de Versalles',
      anioInicio: 1918,
      anioFin: 1919,
      color: '#228B22',
      categoria: 'paz',
      descripcion: 'El 11 de noviembre de 1918 a las 11:00 horas entró en vigor el armisticio en un vagón de tren en el bosque de Compiègne. En enero de 1919 se abrió la Conferencia de Paz de París: los "Cuatro Grandes" (Wilson, Lloyd George, Clemenceau, Orlando) negociaron el nuevo orden mundial. El Tratado de Versalles (28 junio 1919) impuso a Alemania el artículo 231, la "cláusula de culpabilidad de guerra", enormes reparaciones económicas (132.000 millones de marcos de oro), la pérdida del 13% de su territorio y la limitación de su ejército a 100.000 hombres. Se creó la Sociedad de Naciones —propuesta de Wilson— aunque el Senado de EEUU rechazó ratificarla. Cuatro imperios desaparecieron: alemán, austro-húngaro, otomano y ruso. El resentimiento alemán ante las condiciones de Versalles sembraría las semillas de la Segunda Guerra Mundial.',
      obraIconica: 'Firma del Tratado de Versalles en el Salón de los Espejos (28 de junio de 1919)',
      paises: ['Alemania', 'Francia', 'Gran Bretaña', 'Estados Unidos', 'Italia', 'Japón'],
    },
  ],

  eras: [
    {
      nombre: 'El Estallido: De Sarajevo a las Trincheras',
      desde: 1914,
      hasta: 1914,
      icono: '💥',
      hitosDestacados: [
        'El Asesinato de Sarajevo y la Crisis de Julio',
        'El Plan Schlieffen: La Guerra Relámpago que No Fue',
        'La Carrera al Mar y el Frente de Trincheras',
      ],
      eventos: [
        'Asesinato del archiduque Francisco Fernando en Sarajevo (28 junio)',
        'Ultimátum austro-húngaro a Serbia (23 julio)',
        'Movilización general rusa (30 julio)',
        'Alemania declara la guerra a Rusia (1 agosto) y a Francia (3 agosto)',
        'Alemania invade Bélgica — Gran Bretaña entra en guerra (4 agosto)',
        'Primera batalla del Marne: el Plan Schlieffen fracasa (5-12 septiembre)',
        'Inicio de la "Carrera al Mar" — el frente se estabiliza en trincheras',
      ],
    },
    {
      nombre: 'La Guerra de Posiciones',
      desde: 1914,
      hasta: 1916,
      icono: '🪖',
      hitosDestacados: [
        'La Carrera al Mar y el Frente de Trincheras',
        'El Frente Oriental y los Imperios Centrales',
        'La Guerra en el Mar',
      ],
      eventos: [
        '700 km de trincheras desde el Canal de la Mancha hasta Suiza',
        'Primer uso de gas cloro por Alemania en Ypres (abril 1915)',
        'Italia entra en guerra del lado aliado — Tratado de Londres (1915)',
        'Campaña de Gallípoli: los cuerpos ANZAC desembarcan en abril 1915',
        'Hundimiento del Lusitania: 1.198 muertos (mayo 1915)',
        'Batalla de Jutlandia — la mayor batalla naval de la guerra (mayo 1916)',
        'Bloqueo naval británico provoca escasez de alimentos en Alemania',
      ],
    },
    {
      nombre: 'El Año del Infierno: 1916',
      desde: 1916,
      hasta: 1916,
      icono: '☠️',
      hitosDestacados: [
        'La Carnicería de Verdún y el Somme',
      ],
      eventos: [
        'Alemania lanza la ofensiva sobre Verdún (21 febrero)',
        '"Ils ne passeront pas" — Pétain defiende Verdún',
        'Primer día del Somme: 57.470 bajas británicas (1 julio)',
        'Primer uso de tanques en la batalla del Somme (septiembre)',
        'Verdún finaliza: ~700.000 bajas totales entre ambos bandos',
        'El Somme finaliza: ~1.000.000 de bajas — apenas unos kilómetros ganados',
        'El año más sangriento de la Primera Guerra Mundial',
      ],
    },
    {
      nombre: 'La Crisis de 1917: Rusia y América',
      desde: 1917,
      hasta: 1917,
      icono: '🔄',
      hitosDestacados: [
        'La Revolución Rusa y el Frente Oriental se Rompe',
        'Estados Unidos Entra en Guerra',
      ],
      eventos: [
        'Alemania reanuda guerra submarina irrestricta (febrero)',
        'Telegrama Zimmermann interceptado por inteligencia británica (febrero)',
        'Revolución de Febrero: el zar Nicolás II abdica (marzo)',
        'EEUU declara la guerra a Alemania (6 abril)',
        'Motines en el ejército francés tras ofensiva del Aisne',
        'Revolución de Octubre: los bolcheviques toman el poder en Rusia',
        'Primeras tropas americanas llegan a Francia',
      ],
    },
    {
      nombre: 'El Colapso Final',
      desde: 1918,
      hasta: 1918,
      icono: '🏳️',
      hitosDestacados: [
        'La Última Ofensiva y el Colapso Alemán',
      ],
      eventos: [
        'Tratado de Brest-Litovsk: Rusia abandona la guerra (marzo)',
        'Operación Miguel: la gran ofensiva alemana en el oeste (21 marzo)',
        'Los alemanes avanzan 60 km pero se agotan sin refuerzos',
        'Contraofensiva aliada de los "100 Días" comienza (8 agosto)',
        'Bulgaria, el Imperio Otomano y Austria-Hungría se rinden (septiembre-octubre)',
        'Revolución en Alemania: motines en Kiel, el káiser abdica (9 noviembre)',
        'Armisticio — la guerra termina el 11/11/1918 a las 11:00 horas',
      ],
    },
    {
      nombre: 'La Paz y el Nuevo Orden Mundial',
      desde: 1918,
      hasta: 1919,
      icono: '🕊️',
      hitosDestacados: [
        'El Armisticio y el Tratado de Versalles',
      ],
      eventos: [
        'Conferencia de Paz de París — los "Cuatro Grandes" negocian (enero)',
        'Los 14 puntos de Wilson como base para la paz',
        'Alemania firma el Tratado de Versalles con la "cláusula de culpabilidad" (28 junio)',
        'Desaparecen cuatro imperios: alemán, austro-húngaro, otomano y ruso',
        'Creación de la Sociedad de Naciones (enero 1920)',
        'El Senado de EEUU rechaza ratificar el Tratado y la Sociedad de Naciones',
        'Las duras condiciones de Versalles siembran las raíces del nazismo',
      ],
    },
  ],

  categorias: {
    causas: 'Causas y Estallido',
    trincheras: 'Frente Occidental y Trincheras',
    'frente-oriental': 'Frente Oriental y Revoluciones',
    mar: 'Guerra Naval',
    crisis: 'Crisis y Puntos de Inflexión',
    paz: 'Armisticio y Paz',
  },

  colores: {
    causas: '#8B4513',
    trincheras: '#708090',
    'frente-oriental': '#4B0082',
    mar: '#1E90FF',
    crisis: '#B22222',
    paz: '#228B22',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La Primera Guerra Mundial (1914-1918) fue el primer conflicto de escala verdaderamente global y el más mortífero que el mundo había conocido hasta entonces. Murieron entre 15 y 20 millones de personas —militares y civiles— y otros 21 millones quedaron heridos. Cuatro grandes imperios desaparecieron: el alemán, el austro-húngaro, el otomano y el ruso. Sus causas profundas —el imperialismo, el nacionalismo exacerbado, la carrera armamentística y el sistema de alianzas— habían estado madurando durante décadas. El pistoletazo de Sarajevo fue la chispa sobre un polvorín. La Gran Guerra transformó para siempre la política, la sociedad, la tecnología militar y la geografía de Europa, y las condiciones de paz que impuso sembraron directamente las semillas del siguiente conflicto mundial veinte años después.',

    tablaComparativa: [
      {
        hito: 'Asesinato de Sarajevo',
        periodo: '28 junio 1914',
        categoria: 'Causas y Estallido',
        personaje: 'Gavrilo Princip',
        aportacion: 'El detonante que activó el sistema de alianzas y desencadenó la guerra en pocas semanas',
      },
      {
        hito: 'Fracaso del Plan Schlieffen',
        periodo: 'Septiembre 1914',
        categoria: 'Causas y Estallido',
        personaje: 'General Joffre',
        aportacion: 'La derrota alemana en el Marne obligó a Alemania a combatir en dos frentes, haciendo inevitable una guerra larga',
      },
      {
        hito: 'Sistema de Trincheras',
        periodo: '1914-1918',
        categoria: 'Frente Occidental',
        personaje: 'Soldados de todos los bandos',
        aportacion: 'Símbolo de la guerra de desgaste: 700 km de frente estático, condiciones inhumanas y millones de muertos por metros de terreno',
      },
      {
        hito: 'Verdún y el Somme',
        periodo: '1916',
        categoria: 'Crisis',
        personaje: 'Generals Falkenhayn, Haig, Pétain',
        aportacion: 'El año más mortífero: casi 2 millones de bajas combinadas, primer uso de tanques, punto de no retorno moral y estratégico',
      },
      {
        hito: 'Revolución Rusa',
        periodo: 'Octubre 1917',
        categoria: 'Frente Oriental',
        personaje: 'Lenin y los bolcheviques',
        aportacion: 'Rusia sale de la guerra, nace el primer estado comunista y Alemania libera tropas para el frente occidental',
      },
      {
        hito: 'Tratado de Versalles',
        periodo: '28 junio 1919',
        categoria: 'Paz',
        personaje: 'Clemenceau, Wilson, Lloyd George',
        aportacion: 'La "paz cartaginesa" que humilló a Alemania con reparaciones y la cláusula de culpabilidad, creando el caldo de cultivo del nazismo',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'El Estudiante de Historia',
        perfil: 'Alumno de bachillerato o universitario',
        texto: 'Este visualizador te permite seguir la cronología de la Primera Guerra Mundial desde sus causas hasta el Tratado de Versalles. Explora los 10 hitos clave, comprende por qué fracasó el Plan Schlieffen, cómo se formó el frente de trincheras y qué papel tuvo la Revolución Rusa. La tabla comparativa y las preguntas frecuentes te ayudarán a consolidar los conceptos para tus exámenes.',
      },
      {
        icono: '📚',
        titulo: 'El Lector Curioso',
        perfil: 'Adulto apasionado por la historia',
        texto: 'Si has leído novelas como "Sin Novedad en el Frente" o "Birdsong", este visualizador te da el contexto geopolítico completo. Descubre cómo el sistema de alianzas convirtió un asesinato regional en una catástrofe mundial, por qué la batalla del Somme fue tan traumática para Gran Bretaña, y cómo las semillas de Versalles germinaron veinte años después.',
      },
      {
        icono: '🎮',
        titulo: 'El Jugador de Juegos Históricos',
        perfil: 'Fan de wargames o juegos de estrategia ambientados en la IGM',
        texto: 'Antes de lanzar tu ofensiva en Verdún o gestionar tus alianzas en el frente oriental, entiende los factores reales: por qué Alemania necesitaba una victoria rápida, cómo el bloqueo naval fue decisivo, qué supuso la entrada de EEUU y por qué las ofensivas de 1918 —tanto alemana como aliada— fueron tan distintas a las anteriores.',
      },
      {
        icono: '🌍',
        titulo: 'El Viajero del Patrimonio',
        perfil: 'Persona que visita o planea visitar campos de batalla y memoriales',
        texto: 'Si vas a visitar Verdún, el Somme, Ypres o Gallípoli, este visualizador te preparará para entender qué sucedió exactamente en cada lugar. Comprende la escala de los combates, quiénes combatieron allí y qué significa cada monumento. El contexto histórico transforma una visita turística en una experiencia profundamente significativa.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué el asesinato de un archiduque pudo desencadenar una guerra mundial?',
        respuesta: 'El asesinato de Francisco Fernando fue la chispa, no la causa. Las verdaderas causas llevaban décadas acumulándose: el nacionalismo agresivo (especialmente en los Balcanes), el imperialismo colonial que generaba rivalidades entre potencias, la carrera armamentística (especialmente naval entre Gran Bretaña y Alemania) y, sobre todo, el sistema de alianzas militares que convirtió cualquier conflicto bilateral en uno multilateral automáticamente. La "Crisis de Julio" mostró cómo las alianzas arrastraron a naciones que no tenían ningún interés directo en la disputa austro-serbia.',
        tip: 'El historiador Christopher Clark llama a los líderes de 1914 "sonámbulos": ninguno quería una guerra mundial, pero todos tomaron decisiones que la hicieron inevitable.',
      },
      {
        pregunta: '¿Por qué la guerra de trincheras fue tan devastadora?',
        respuesta: 'La tecnología defensiva (ametralladoras, alambre de espino, artillería de gran calibre) superó a la tecnología ofensiva. Una ametralladora podía detener a miles de soldados que avanzaban al descubierto. Los generales siguieron usando tácticas del siglo XIX —cargas masivas de infantería— contra armas del siglo XX. Además, los soldados vivían en zanjas inundadas de agua y barro, con ratas y enfermedades. La vida media en primera línea era de semanas. El resultado fue un frente de 700 km que apenas se movió durante cuatro años a un coste de millones de vidas.',
        tip: 'La introducción del tanque en el Somme (1916) y las nuevas tácticas de infiltración alemanas (Sturmtruppen, 1918) empezaron a romper el impasse, pero tardaron años en desarrollarse.',
      },
      {
        pregunta: '¿Cómo influyó la Revolución Rusa en el resultado de la guerra?',
        respuesta: 'Fue decisiva en dos sentidos opuestos. La salida de Rusia de la guerra (Tratado de Brest-Litovsk, marzo 1918) liberó un millón de soldados alemanes del frente oriental para el occidental, lo que permitió la gran ofensiva de primavera de 1918. Sin embargo, ese mismo año llegaron dos millones de soldados americanos frescos a Europa. La Revolución también demostró a todos los gobiernos que la moral de las tropas y de la retaguardia era crucial: el miedo al contagio revolucionario aceleró las negociaciones de armisticio cuando el frente alemán empezó a ceder.',
      },
      {
        pregunta: '¿Por qué el Tratado de Versalles contribuyó a la Segunda Guerra Mundial?',
        respuesta: 'El Tratado impuso a Alemania condiciones excepcionalmente duras: la "cláusula de culpabilidad de guerra" (artículo 231), reparaciones económicas equivalentes a 132.000 millones de marcos de oro, la pérdida de territorios con población alemana y la reducción de su ejército a 100.000 hombres. Los alemanes lo vivieron como una humillación inmerecida —no habían sido derrotados militarmente en suelo alemán, sino por el "frente interior"— y esta narrativa del "puñal por la espalda" fue instrumentalizada por Hitler. Las reparaciones y la depresión económica de los años 30 crearon las condiciones para el ascenso del nazismo.',
        tip: 'El economista John Maynard Keynes publicó en 1919 "Las consecuencias económicas de la paz", prediciendo exactamente las consecuencias que tendría Versalles.',
      },
      {
        pregunta: '¿Cuántas personas murieron en la Primera Guerra Mundial?',
        respuesta: 'Las estimaciones varían, pero se calcula que murieron entre 15 y 20 millones de personas: unos 10 millones de militares y entre 5 y 10 millones de civiles (por combates directos, hambre debida al bloqueo naval, enfermedades y represalias). A estas cifras hay que añadir los 50-100 millones de muertos de la pandemia de gripe española de 1918-1919, acelerada por las condiciones de la guerra. Además, 21 millones de soldados quedaron heridos, muchos con mutilaciones permanentes. La Primera Guerra Mundial fue un trauma civilizatorio sin precedentes.',
      },
    ],

    pasos: [
      {
        titulo: 'Entiende las causas estructurales (MAIN)',
        cuerpo: 'Los historiadores usan el acrónimo MAIN para las causas de la guerra: Militarismo (carrera armamentística), Alianzas (Triple Entente vs. Triplice), Imperialismo (rivalidades coloniales) y Nacionalismo (especialmente en los Balcanes). Ninguna causa aislada explica la guerra; fue la combinación de todas ellas lo que convirtió un asesinato en una catástrofe mundial. Comprende estas causas antes de analizar el desarrollo del conflicto.',
      },
      {
        titulo: 'Sitúa los dos frentes principales',
        cuerpo: 'La Primera Guerra Mundial tuvo dos frentes principales: el Occidental (Francia y Bélgica, guerra de trincheras estática) y el Oriental (desde el Báltico hasta el mar Negro, más móvil). Además hubo frentes secundarios: el italiano, el de Oriente Próximo, el de los Dardanelos y el colonial en África y Asia. Entender la diferencia entre ambos frentes principales es clave para comprender la estrategia de los Imperios Centrales y el dilema alemán de combatir en dos frentes simultáneos.',
      },
      {
        titulo: 'Identifica los puntos de inflexión',
        cuerpo: 'Tres momentos cambiaron el curso de la guerra: (1) El fracaso del Plan Schlieffen en el Marne (1914), que convirtió una guerra rápida en una guerra de desgaste. (2) La Revolución Rusa y la salida de Rusia (1917), que permitió la última gran ofensiva alemana pero también aceleró la llegada americana. (3) La contraofensiva de los "100 Días" (1918), que quebró definitivamente el frente alemán.',
      },
      {
        titulo: 'Analiza el papel de la tecnología',
        cuerpo: 'La Primera Guerra Mundial fue un laboratorio tecnológico brutal: primer uso masivo de ametralladoras, artillería de gran calibre, gas tóxico, aviones de combate, submarinos, tanques y lanzallamas. La tecnología defensiva superó durante años a la ofensiva, generando el impasse de las trincheras. Solo hacia 1917-1918, con la combinación de tanques, artillería de contrabatería y nuevas tácticas de infiltración, empezó a romperse el equilibrio. La guerra transformó radicalmente la tecnología militar moderna.',
      },
      {
        titulo: 'Conecta la guerra con sus consecuencias a largo plazo',
        cuerpo: 'La Primera Guerra Mundial no terminó en 1918: sus consecuencias se extendieron décadas. El Tratado de Versalles redibujó el mapa de Europa y Oriente Próximo, creando nuevas naciones y sembrando resentimientos. La revolución rusa instaló el comunismo en el poder. El genocidio armenio estableció un precedente. La crisis económica de los años 20-30, agravada por las reparaciones, condujo al ascenso del fascismo y el nazismo. Comprender la Gran Guerra es indispensable para entender el siglo XX.',
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto: 'Usa mapas históricos del frente occidental para visualizar por qué 700 km de trincheras apenas se movieron en cuatro años. La geografía y la tecnología defensiva explican el estancamiento mejor que cualquier explicación narrativa.',
      },
      {
        icono: '📖',
        texto: '"Sin novedad en el frente" de Erich Maria Remarque (1929) ofrece la perspectiva del soldado alemán raso, mientras que "Adiós a las armas" de Hemingway muestra el frente italiano. Para la perspectiva británica, los poemas de Wilfred Owen ("Dulce et Decorum Est") son incomparables.',
      },
      {
        icono: '🎬',
        texto: 'La película "1917" (2019, Sam Mendes) recrea con asombroso realismo el frente occidental. "Gallipoli" (1981, Peter Weir) muestra el sacrificio ANZAC. La serie "Peaky Blinders" muestra el trauma de los veteranos en la posguerra.',
      },
      {
        icono: '🏛️',
        texto: 'Si visitas París, el Musée de l\'Armée en Les Invalides tiene una colección excepcional sobre la Gran Guerra. En Bélgica, el In Flanders Fields Museum en Ypres y los cementerios militares de la región del Somme son lugares de memoria imprescindibles.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que los generales eran incompetentes o sádicos',
        cuerpo: 'Es fácil juzgar a los generales de la Primera Guerra Mundial con ojos del siglo XXI. Pero los altos mandos enfrentaban un problema genuinamente nuevo: nadie sabía cómo atacar posiciones fuertemente defendidas con ametralladoras y artillería pesada. Los generales aprendieron —lentamente y a un coste terrible— que las tácticas del siglo XIX no servían. El general Haig fue criticado por las bajas del Somme, pero también dirigió la contraofensiva final que ganó la guerra.',
      },
      {
        titulo: 'Pensar que la guerra fue exclusivamente europea',
        cuerpo: 'La Primera Guerra Mundial fue global. Combatieron soldados de Australia, Nueva Zelanda, Canadá, India, Sudáfrica, Senegal, Argelia, Marruecos y decenas de otros países coloniales. Hubo frentes en Mesopotamia (actual Iraq), Palestina, África oriental y occidental, el océano Atlántico y el Pacífico. Los imperios coloniales europeos arrastraron a sus territorios a una guerra en la que no tenían ningún interés directo, con consecuencias que aceleraron los movimientos de independencia del siglo XX.',
      },
      {
        titulo: 'Confundir causas inmediatas con causas profundas',
        cuerpo: 'El asesinato de Sarajevo fue el detonante, no la causa. Las causas profundas llevaban décadas gestándose: el nacionalismo alemán y el paneslavismo, la rivalidad naval anglo-alemana, las crisis marroquíes, las guerras de los Balcanes de 1912-1913. Sin estas tensiones acumuladas, el asesinato de Francisco Fernando habría sido solo una tragedia diplomática, no el inicio de una guerra mundial.',
      },
      {
        titulo: 'Olvidar el papel del frente doméstico y la propaganda',
        cuerpo: 'La Primera Guerra Mundial no se ganó solo en los campos de batalla. El bloqueo naval británico mató a 700.000 civiles alemanes por hambre. La propaganda de todos los bandos fue masiva —el cartel "Your Country Needs YOU" de Kitchener es un ícono. La moral de la retaguardia fue decisiva: las revoluciones en Rusia y Alemania en 1917-1918 mostraron que ningún gobierno podía mantener indefinidamente una guerra que aplastaba a su sociedad. La guerra total involucró a toda la población, no solo a los ejércitos.',
      },
    ],
  },
};
