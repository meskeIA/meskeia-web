import type { HistoriaData } from './types';

export const historiaArquitecturaModerna: HistoriaData = {
  slug: 'historia-arquitectura-moderna',
  titulo: 'Historia de la Arquitectura Moderna: Del Crystal Palace a la IA',
  subtitulo:
    'De Paxton y Eiffel a Zaha Hadid y el diseño paramétrico: 170 años de revoluciones en cómo construimos el mundo',
  descripcionSEO:
    'Cronología interactiva de la arquitectura moderna y contemporánea: del Crystal Palace (1851) al diseño generativo con IA. Bauhaus, Movimiento Moderno, Brutalismo, Posmodernismo, Guggenheim Bilbao, Zaha Hadid y arquitectura sostenible en 10 hitos y 6 eras.',
  keywords: [
    'historia arquitectura moderna cronología',
    'bauhaus movimiento moderno le corbusier mies van der rohe',
    'crystal palace torre eiffel hierro vidrio rascacielos',
    'brutalismo posmodernismo guggenheim bilbao gehry',
    'zaha hadid arquitectura paramétrica sostenibilidad',
    'arquitectura digital inteligencia artificial diseño generativo',
  ],
  anioInicio: 1851,
  anioFin: 9999,

  hitos: [
    {
      id: 'hierro-y-cristal',
      nombre: 'El Crystal Palace y la Arquitectura del Hierro',
      anioInicio: 1851,
      anioFin: 1890,
      color: '#8B4513',
      categoria: 'hierro_cristal',
      descripcion:
        'El Crystal Palace de Joseph Paxton (Londres, 1851) fue la primera gran estructura prefabricada de hierro y vidrio: 563 metros de longitud construidos en nueve meses para la Gran Exposición Universal. Demostró que la industria podía producir arquitectura a escala y velocidad nunca vistas. Le siguieron la Torre Eiffel de Gustave Eiffel (París, 1889), considerada un escándalo estético por los intelectuales de la época y hoy símbolo universal, y el Puente de Brooklyn de John Augustus Roebling (Nueva York, 1883), pionero del cable de acero tensado. En Chicago, la Escuela de Chicago estableció los fundamentos del rascacielos moderno con el Home Insurance Building de William Le Baron Jenney (1885), primer edificio con estructura de acero independiente de la fachada. Louis Sullivan formuló el principio "la forma sigue a la función" y el joven Frank Lloyd Wright comenzó su formación con él. El Arts and Crafts de William Morris reaccionó contra la industrialización reivindicando la artesanía, sembrando la semilla del movimiento siguiente.',
      obraIconica: 'Crystal Palace (Paxton, Londres 1851) y Torre Eiffel (Eiffel, París 1889)',
      paises: ['Reino Unido', 'Francia', 'Estados Unidos'],
    },
    {
      id: 'art-nouveau',
      nombre: 'El Modernismo y Art Nouveau',
      anioInicio: 1890,
      anioFin: 1914,
      color: '#166534',
      categoria: 'art_nouveau',
      descripcion:
        'El Art Nouveau buscó una arquitectura orgánica, inspirada en las formas de la naturaleza, como reacción a la frialdad industrial. Victor Horta en Bruselas (Hotel Tassel, 1893) introdujo la línea curva y el hierro decorativo en el interior doméstico. Hector Guimard diseñó las icónicas entradas de hierro forjado del Metro de París. Otto Wagner en Viena y la Secesión austriaca exploraron la geometría decorativa. El caso más radical fue Antoni Gaudí en Barcelona: la Sagrada Família (iniciada en 1882 y aún en construcción), la Casa Milà "La Pedrera" y el Parque Güell crearon un universo arquitectónico sin parangón, fusión de catolicismo, naturaleza y artesanía catalana. Louis Sullivan en Chicago siguió desarrollando la tipología del rascacielos con ornamentación expresiva. Frank Lloyd Wright comenzó su carrera independiente con las "Prairie Houses" (casas de la pradera), de planta horizontal y apertura al paisaje americano. La Primera Guerra Mundial truncó el impulso del movimiento.',
      obraIconica: 'Sagrada Família (Gaudí, Barcelona, 1882–presente) y Hotel Tassel (Horta, Bruselas, 1893)',
      paises: ['España', 'Bélgica', 'Francia', 'Austria', 'Estados Unidos'],
    },
    {
      id: 'bauhaus',
      nombre: 'La Bauhaus y el Movimiento Moderno',
      anioInicio: 1919,
      anioFin: 1940,
      color: '#1E3A8A',
      categoria: 'bauhaus',
      descripcion:
        'Walter Gropius fundó la Bauhaus en Weimar en 1919 con una idea radical: unir arte, artesanía e industria en una sola escuela. La Bauhaus formó a una generación que definiría la estética del siglo XX: Mies van der Rohe, Marcel Breuer, László Moholy-Nagy, Paul Klee y Wassily Kandinsky pasaron por sus aulas. Le Corbusier, desde París, formuló los "Cinco Puntos de la Nueva Arquitectura": pilotis que liberan la planta baja, terraza jardín, planta libre, ventana horizontal continua y fachada libre de la estructura. La Villa Savoye (1929) fue su manifiesto construido. El Pabellón Alemán de Barcelona de Mies van der Rohe (1929) demostró que el espacio fluido, el mármol y el acero podían crear pura emoción sin ornamento. El movimiento impulsó también el urbanismo social (los Siedlung alemanes, vivienda obrera racionalista). La llegada del nazismo al poder en 1933 forzó el cierre de la Bauhaus y la emigración de sus maestros a Estados Unidos, donde transformarían la arquitectura americana.',
      obraIconica: 'Villa Savoye (Le Corbusier, Poissy, 1929) y Pabellón de Barcelona (Mies van der Rohe, 1929)',
      paises: ['Alemania', 'Francia', 'España', 'Suiza'],
    },
    {
      id: 'estilo-internacional',
      nombre: 'El Estilo Internacional y la Posguerra',
      anioInicio: 1945,
      anioFin: 1960,
      color: '#D97706',
      categoria: 'estilo_internacional',
      descripcion:
        'La destrucción de Europa en la Segunda Guerra Mundial exigió reconstrucción masiva y rápida. El Estilo Internacional —con sus fachadas de vidrio y acero, sus plantas libres y la ausencia total de ornamento— ofrecía una solución racional, universal y replicable. Mies van der Rohe en Nueva York diseñó el Seagram Building (1958) junto a Philip Johnson: la máxima expresión de "menos es más", una caja perfecta de vidrio ambarino y bronce. La Lever House de SOM (1952) estableció el modelo de la torre de oficinas corporativa. Le Corbusier aplicó su urbanismo a Chandigarh (India, 1953), capital diseñada desde cero. Oscar Niemeyer y Lúcio Costa planificaron Brasilia (inaugurada en 1960), la ciudad modernista más ambiciosa del siglo: una capital entera construida en cuatro años en la sabana brasileña. Frank Lloyd Wright cerró su carrera con el Guggenheim de Nueva York (1959), una espiral única que desafió todos los convencionalismos del museo. El hormigón armado se convirtió en el material simbólico de la modernidad y la reconstrucción.',
      obraIconica: 'Seagram Building (Mies van der Rohe y Philip Johnson, Nueva York, 1958)',
      paises: ['Estados Unidos', 'Brasil', 'India', 'Francia', 'Alemania'],
    },
    {
      id: 'brutalismo',
      nombre: 'El Brutalismo y la Crisis del Movimiento Moderno',
      anioInicio: 1955,
      anioFin: 1975,
      color: '#7C2D12',
      categoria: 'brutalismo',
      descripcion:
        'El Brutalismo —del francés "béton brut", hormigón visto— llevó la estética del movimiento moderno hasta sus consecuencias más extremas. Le Corbusier inauguró la Unité d\'Habitation en Marsella (1952): un bloque de 337 apartamentos concebido como una "ciudad vertical" autosuficiente con tiendas, guardería y azotea comunitaria. El Barbican de Londres, el Robin Hood Gardens o la Trellick Tower se convirtieron en iconos del estilo. Moshe Safdie en Montreal construyó Habitat 67 (1967), un conjunto de 354 módulos de hormigón prefabricado apilados en 12 configuraciones distintas. El Centro Pompidou de Renzo Piano y Richard Rogers (París, 1977) expuso las instalaciones al exterior en un gesto provocador de "arquitectura al revés". Pero la crisis llegó pronto: la demolición del complejo de vivienda social Pruitt-Igoe en St. Louis (1972) fue calificada por el teórico Charles Jencks como la "muerte del Movimiento Moderno". Jane Jacobs publicó "Muerte y Vida de las Grandes Ciudades Americanas" (1961), una devastadora crítica al urbanismo funcionalista que ignoraba la complejidad de la vida urbana real.',
      obraIconica: 'Centre Pompidou (Piano y Rogers, París, 1977) y Habitat 67 (Safdie, Montreal, 1967)',
      paises: ['Francia', 'Reino Unido', 'Canadá', 'Estados Unidos'],
    },
    {
      id: 'posmodernismo',
      nombre: 'El Posmodernismo y la Pluralidad',
      anioInicio: 1972,
      anioFin: 1990,
      color: '#374151',
      categoria: 'posmodernismo',
      descripcion:
        'Si el Movimiento Moderno había rechazado la historia y el ornamento, el Posmodernismo los recuperó con ironía y eclecticismo. Robert Venturi publicó "Aprendiendo de Las Vegas" (1972) junto a Denise Scott Brown: un manifiesto a favor de la complejidad, la contradicción y los símbolos populares en la arquitectura. El AT&T Building de Philip Johnson (Nueva York, 1984) coronó un rascacielos moderno con un remate de Chippendale: la provocación se hizo célebre en todo el mundo. James Stirling en Europa, Ricardo Bofill en España y Francia, Aldo Rossi en Italia desarrollaron sus propias versiones de un retorno historicista. Al mismo tiempo emergió el Deconstructivismo, que fragmentaba y descomponía las formas: Frank Gehry, Peter Eisenman, Zaha Hadid y Rem Koolhaas desafiaron las convenciones estructurales y compositivas. El Museo Judío de Berlín de Daniel Libeskind (concebido en 1989, inaugurado en 2001) hizo del edificio en sí mismo un memorial al trauma del Holocausto, con sus líneas fragmentadas y sus "vacíos" imposibles de habitar. La arquitectura se convirtió en un campo de debate cultural e ideológico sin precedentes.',
      obraIconica: 'AT&T Building (Philip Johnson, Nueva York, 1984) y Museo Judío de Berlín (Libeskind, 1989–2001)',
      paises: ['Estados Unidos', 'Alemania', 'Reino Unido', 'España', 'Italia'],
    },
    {
      id: 'high-tech',
      nombre: 'Gehry, Hadid y el High-Tech',
      anioInicio: 1990,
      anioFin: 2005,
      color: '#4338CA',
      categoria: 'high_tech',
      descripcion:
        `Los años noventa vieron el triunfo de los "starchitects": arquitectos convertidos en marcas globales capaces de transformar ciudades enteras. El Guggenheim de Bilbao de Frank Gehry (1997) fue el caso más estudiado: la ciudad vasca, devastada por la desindustrialización, se reinventó como destino cultural gracias a un edificio de titanio ondulado que parecía imposible antes de la llegada del software CAD y el CATIA (desarrollado para el diseño de aviones por Dassault). El "Efecto Bilbao" —un edificio icónico que transforma la imagen y la economía de una ciudad— se convirtió en estrategia de regeneración urbana global. Richard Rogers con el Lloyd's de Londres (1986) y Norman Foster con el Reichstag remodelado (Berlín, 1999), el Millennium Bridge y el aeropuerto de Pekín desarrollaron el High-Tech: estructuras que exhiben su propia ingeniería. Santiago Calatrava fusionó arquitectura e ingeniería en puentes y estaciones de poética escultural. En 2004, Zaha Hadid se convirtió en la primera mujer en recibir el Premio Pritzker, el Nobel de la arquitectura. Su obra, antes considerada "papel de arquitectura" (demasiado radical para construirse), se materializó por fin gracias al CAD y a la voluntad de sus clientes.`,
      obraIconica: 'Guggenheim Bilbao (Frank Gehry, 1997) y Reichstag remodelado (Norman Foster, Berlín, 1999)',
      paises: ['España', 'Reino Unido', 'Alemania', 'Estados Unidos', 'Singapur'],
    },
    {
      id: 'arquitectura-parametrica',
      nombre: 'Zaha Hadid y la Arquitectura Paramétrica',
      anioInicio: 2000,
      anioFin: 2016,
      color: '#B22222',
      categoria: 'parametrica',
      descripcion:
        'El diseño paramétrico —utilizar algoritmos para generar formas en lugar de dibujarlas directamente— abrió posibilidades radicalmente nuevas. Zaha Hadid Architects encarnó este paradigma: el Centro Cultural Heydar Aliyev en Bakú (2012), con sus curvas continuas sin ángulos, y el Centro Acuático de Londres para los Juegos Olímpicos de 2012, con su cubierta ondulante de 160 metros, parecían desafiar la gravedad. El software Grasshopper para Rhino popularizó el diseño generativo entre arquitectos de todo el mundo. Bjarke Ingels Group (BIG) propuso una arquitectura lúdica y narrativa: el complejo habitacional 8 House en Copenhague o el CopenHill (esquí sobre una planta de residuos) combinaban utilidad, sostenibilidad y espectáculo. La impresión 3D comenzó a usarse para prototipos, componentes de fachada y estructuras experimentales. Patrik Schumacher, socio de Hadid, proclamó el "parametricismo" como el nuevo estilo global del siglo XXI. La muerte de Zaha Hadid en marzo de 2016, a los 65 años, fue un golpe inesperado para la arquitectura mundial.',
      obraIconica: 'Centro Cultural Heydar Aliyev (Zaha Hadid, Bakú, 2012) y Centro Acuático de Londres (2012)',
      paises: ['Azerbaiyán', 'Reino Unido', 'Dinamarca', 'China', 'Emiratos Árabes'],
    },
    {
      id: 'arquitectura-sostenible',
      nombre: 'Sostenibilidad y Arquitectura Verde',
      anioInicio: 2005,
      anioFin: 2020,
      color: '#0D9488',
      categoria: 'sostenibilidad',
      descripcion:
        'La arquitectura empezó a tomar conciencia de que el sector de la construcción es responsable del 38% de las emisiones globales de CO₂ y de más del 40% del consumo energético mundial. Las certificaciones LEED (americana) y BREEAM (británica) establecieron estándares medibles de eficiencia energética, calidad del aire y uso del agua. El concepto de Passive House (casa pasiva) planteó edificios que prácticamente no necesitan calefacción ni refrigeración artificial gracias al aislamiento, la orientación y la ventilación controlada. Kengo Kuma en Japón exploró los materiales tradicionales —madera, bambú, piedra— aplicados con técnicas contemporáneas. El auge del CLT (madera laminada cruzada) permitió construir edificios de gran altura: el Mjøstårnet en Noruega (2019) se convirtió en el rascacielos de madera más alto del mundo (85,4 metros, 18 plantas). Los Jardines de la Bahía de Singapur de Grant Associates (2012), con sus "supertrees" de acero y plantas de hasta 50 metros, fusionaron naturaleza e ingeniería a escala urbana. El debate se agudizó: ¿puede conciliarse la arquitectura espectacular con la sostenibilidad real, o son metas antagónicas?',
      obraIconica: 'Jardines de la Bahía (Singapur, 2012) y Mjøstårnet, el rascacielos de madera (Noruega, 2019)',
      paises: ['Noruega', 'Singapur', 'Japón', 'Alemania', 'Reino Unido'],
    },
    {
      id: 'arq-digital-ia',
      nombre: 'Arquitectura Digital e IA',
      anioInicio: 2020,
      anioFin: 9999,
      color: '#059669',
      categoria: 'arq_digital',
      descripcion:
        'La pandemia de COVID-19 (2020) obligó a repensar radicalmente los espacios: las oficinas se vaciaron, el teletrabajo cuestionó la utilidad de los grandes campus corporativos y los hogares tuvieron que absorber nuevas funciones. La IA generativa irrumpió en el proceso de diseño: herramientas como Midjourney permiten generar imágenes fotorrealistas de edificios a partir de descripciones textuales, y el diseño generativo con algoritmos de optimización produce estructuras más eficientes de lo que ningún arquitecto diseñaría manualmente. El gemelo digital —una copia virtual exacta de un edificio que simula su comportamiento energético, estructural y de uso— se está convirtiendo en estándar para los grandes proyectos. Arabia Saudí anunció NEOM y The Line: una ciudad lineal de 170 km sin coches, con dos rascacielos espejo de 500 metros de altura como única fachada. La arquitectura modular y prefabricada de nueva generación busca reducir costes, plazos y residuos. El debate más urgente del sector es el de la circularidad: diseñar edificios pensando en su desmontaje y reutilización al final de su vida útil, en lugar de demolerlos y convertirlos en escombros.',
      obraIconica: 'NEOM / The Line (Arabia Saudí, en construcción) y primeros edificios diseñados con IA generativa (2023–)',
      paises: ['Arabia Saudí', 'Global', 'Estados Unidos', 'China', 'Países Bajos'],
    },
  ],

  eras: [
    {
      nombre: 'El Hierro, el Vidrio y el Modernismo',
      desde: 1851,
      hasta: 1919,
      icono: '🏗️',
      hitosDestacados: [
        'El Crystal Palace y la Arquitectura del Hierro',
        'El Modernismo y Art Nouveau',
      ],
      eventos: [
        'Crystal Palace de Paxton inaugura la Era Industrial en arquitectura (1851)',
        'Primer rascacielos: Home Insurance Building en Chicago (1885)',
        'Torre Eiffel: escándalo y símbolo de la ingeniería (1889)',
        'Hotel Tassel de Horta en Bruselas: el Art Nouveau nace (1893)',
        'Gaudí comienza la Sagrada Família y el Parque Güell (1882–1906)',
        'Sullivan acuña "la forma sigue a la función" (1896)',
        'Las Prairie Houses de Frank Lloyd Wright (1900–1910)',
        'La Gran Guerra detiene el impulso del Modernismo (1914–1918)',
      ],
    },
    {
      nombre: 'La Bauhaus y el Movimiento Moderno',
      desde: 1919,
      hasta: 1945,
      icono: '📐',
      hitosDestacados: ['La Bauhaus y el Movimiento Moderno'],
      eventos: [
        'Gropius funda la Bauhaus en Weimar (1919)',
        'Le Corbusier publica "Vers une Architecture" (1923)',
        'Villa Savoye de Le Corbusier, manifiesto construido (1929)',
        'Pabellón de Barcelona de Mies van der Rohe (1929)',
        'Exposición del Estilo Internacional en el MoMA de Nueva York (1932)',
        'El nazismo cierra la Bauhaus y los maestros emigran a EE.UU. (1933)',
        'Frank Lloyd Wright construye Fallingwater (1935)',
        'La Segunda Guerra Mundial destruye ciudades enteras (1939–1945)',
      ],
    },
    {
      nombre: 'El Estilo Internacional y la Posguerra',
      desde: 1945,
      hasta: 1972,
      icono: '🏙️',
      hitosDestacados: [
        'El Estilo Internacional y la Posguerra',
        'El Brutalismo y la Crisis del Movimiento Moderno',
      ],
      eventos: [
        'Reconstrucción masiva de Europa con hormigón y acero (1945–1955)',
        'Lever House, primera torre de vidrio en Nueva York (1952)',
        'Unité d\'Habitation de Le Corbusier en Marsella (1952)',
        'Le Corbusier planifica Chandigarh desde cero (1953)',
        'Seagram Building de Mies van der Rohe en Nueva York (1958)',
        'Guggenheim de Nueva York: Frank Lloyd Wright cierra su carrera (1959)',
        'Brasilia inaugurada como capital modernista (1960)',
        'Jane Jacobs publica su crítica al urbanismo funcionalista (1961)',
        'Habitat 67 de Moshe Safdie en la Expo de Montreal (1967)',
      ],
    },
    {
      nombre: 'El Posmodernismo y la Pluralidad',
      desde: 1972,
      hasta: 1990,
      icono: '🎭',
      hitosDestacados: ['El Posmodernismo y la Pluralidad'],
      eventos: [
        'Demolición del Pruitt-Igoe: "muerte del Movimiento Moderno" (1972)',
        'Venturi y Scott Brown publican "Aprendiendo de Las Vegas" (1972)',
        'Centro Pompidou de Piano y Rogers: arquitectura al revés (1977)',
        'Lloyd\'s de Londres de Richard Rogers (1986)',
        'AT&T Building de Philip Johnson: posmodernismo corporativo (1984)',
        'Se concibe el Museo Judío de Berlín de Libeskind (1989)',
        'Deconstructivismo: Gehry, Eisenman, Hadid, Koolhaas emergen (1988)',
        'Caída del Muro de Berlín: nueva era para la arquitectura europea (1989)',
      ],
    },
    {
      nombre: 'Los Starchitects y el Espectáculo',
      desde: 1990,
      hasta: 2010,
      icono: '✨',
      hitosDestacados: [
        'Gehry, Hadid y el High-Tech',
        'Zaha Hadid y la Arquitectura Paramétrica',
      ],
      eventos: [
        'Reichstag remodelado por Norman Foster en Berlín (1999)',
        'Guggenheim Bilbao: el "Efecto Bilbao" cambia el paradigma (1997)',
        'Zaha Hadid: primera mujer en ganar el Premio Pritzker (2004)',
        'Se populariza el CAD y el software CATIA para formas complejas (2000s)',
        'El Centro Cultural Heydar Aliyev de Hadid en Bakú (2012)',
        'Grasshopper/Rhino democratiza el diseño paramétrico (2007)',
        'Bjarke Ingels Group: arquitectura lúdica y sostenible (2009–)',
        'Impresión 3D en arquitectura: primeros prototipos estructurales (2008)',
      ],
    },
    {
      nombre: 'Sostenibilidad, Parametricismo e IA',
      desde: 2010,
      hasta: 9999,
      icono: '🌱',
      hitosDestacados: [
        'Sostenibilidad y Arquitectura Verde',
        'Arquitectura Digital e IA',
      ],
      eventos: [
        'Jardines de la Bahía en Singapur: naturaleza e ingeniería fusionadas (2012)',
        'Mjøstårnet: rascacielos de madera más alto del mundo, Noruega (2019)',
        'La pandemia obliga a rediseñar oficinas y viviendas (2020)',
        'Midjourney y IA generativa transforman el proceso de diseño (2022)',
        'El sector de la construcción representa el 38% de emisiones CO₂ globales',
        'NEOM / The Line en Arabia Saudí: utopía o megalomanía (2022–)',
        'Diseño generativo y gemelo digital: nuevos estándares de proyecto',
        'El debate circular: diseñar para desmontar, no para demoler',
      ],
    },
  ],

  categorias: {
    hierro_cristal: 'Hierro y Cristal',
    art_nouveau: 'Art Nouveau y Modernismo',
    bauhaus: 'Bauhaus y Movimiento Moderno',
    estilo_internacional: 'Estilo Internacional',
    brutalismo: 'Brutalismo',
    posmodernismo: 'Posmodernismo',
    high_tech: 'High-Tech y Deconstrucción',
    parametrica: 'Arquitectura Paramétrica',
    sostenibilidad: 'Arquitectura Sostenible',
    arq_digital: 'Era Digital e IA',
  },

  colores: {
    hierro_cristal: '#8B4513',
    art_nouveau: '#166534',
    bauhaus: '#1E3A8A',
    estilo_internacional: '#D97706',
    brutalismo: '#7C2D12',
    posmodernismo: '#374151',
    high_tech: '#4338CA',
    parametrica: '#B22222',
    sostenibilidad: '#0D9488',
    arq_digital: '#059669',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La arquitectura moderna no es solo un estilo: es el espejo de las transformaciones más profundas del siglo XX y XXI. Cada revolución arquitectónica refleja una revolución social, tecnológica o ideológica. La Bauhaus nació de la utopía socialista de unir arte e industria al servicio del pueblo; el Estilo Internacional creció sobre la necesidad de reconstruir Europa tras la devastación de la guerra; el Brutalismo intentó dar dignidad a las clases trabajadoras con vivienda social; el Posmodernismo reaccionó contra la frialdad de la modernidad recuperando la historia y el humor; y el parametricismo y la IA abren hoy un territorio donde los límites entre lo construible y lo inimaginable se desdibujan cada año. Entender la arquitectura moderna es entender cómo las sociedades han debatido dónde y cómo quieren vivir, trabajar, crear y recordar. Desde el Crystal Palace de 1851 hasta los algoritmos generativos de 2024, este viaje de 170 años transforma por completo la manera de mirar los edificios que nos rodean.',

    tablaComparativa: [
      {
        hito: 'El Crystal Palace y la Arquitectura del Hierro',
        periodo: '1851–1890',
        categoria: 'Hierro y Cristal',
        personaje: 'Joseph Paxton / Gustave Eiffel',
        aportacion: 'Prefabricación, estructura de acero, el rascacielos como tipología',
      },
      {
        hito: 'El Modernismo y Art Nouveau',
        periodo: '1890–1914',
        categoria: 'Art Nouveau y Modernismo',
        personaje: 'Antoni Gaudí / Victor Horta',
        aportacion: 'Forma orgánica, ornamento natural, rechazo de la industrialización fría',
      },
      {
        hito: 'La Bauhaus y el Movimiento Moderno',
        periodo: '1919–1940',
        categoria: 'Bauhaus y Movimiento Moderno',
        personaje: 'Walter Gropius / Le Corbusier / Mies van der Rohe',
        aportacion: 'Planta libre, pilotis, hormigón, funcionalismo puro sin ornamento',
      },
      {
        hito: 'El Estilo Internacional y la Posguerra',
        periodo: '1945–1960',
        categoria: 'Estilo Internacional',
        personaje: 'Mies van der Rohe / Oscar Niemeyer',
        aportacion: 'Reconstrucción masiva, torre de vidrio, urbanismo desde cero (Brasilia)',
      },
      {
        hito: 'El Posmodernismo y la Pluralidad',
        periodo: '1972–1990',
        categoria: 'Posmodernismo',
        personaje: 'Robert Venturi / Philip Johnson / Frank Gehry',
        aportacion: 'Ironía, historia, eclecticismo y deconstrucción como lenguajes arquitectónicos',
      },
      {
        hito: 'Sostenibilidad y Arquitectura Verde',
        periodo: '2005–2020',
        categoria: 'Arquitectura Sostenible',
        personaje: 'Kengo Kuma / Bjarke Ingels',
        aportacion: 'LEED, Passive House, madera laminada y circularidad como nuevos imperativos',
      },
    ],

    escenarios: [
      {
        icono: '🏛️',
        titulo: '¿Y si la Bauhaus no hubiera sido cerrada por los nazis?',
        perfil: 'Contrafactual histórico — impacto cultural',
        texto:
          'Walter Gropius cerró la Bauhaus en 1933 ante la presión nazi. Sus maestros emigraron a Estados Unidos y transformaron las escuelas de Harvard, el MIT y el IIT de Chicago. Pero si la Bauhaus hubiera sobrevivido en Alemania, ¿habría evitado la emigración de sus ideas? Probablemente, el Estilo Internacional no habría dominado la arquitectura americana de posguerra de la misma manera. El modernismo europeo habría seguido una evolución más diversa y menos dogmática. Y quizás el debate entre forma y función habría llegado antes, sin necesidad del trauma del Pruitt-Igoe.',
      },
      {
        icono: '🌊',
        titulo: '¿Y si el Guggenheim Bilbao hubiera fracasado?',
        perfil: 'Contrafactual — urbanismo y cultura',
        texto:
          'El Guggenheim de Bilbao (1997) se convirtió en el caso de estudio más influyente de la arquitectura de las últimas décadas: el "Efecto Bilbao" justificó inversiones billonarias en museos icónicos de todo el mundo. Pero si el museo hubiera fracasado económicamente —y hubo voces que predijeron ese fracaso—, la estrategia de "edificio-marca" para regenerar ciudades habría quedado desacreditada. La arquitectura espectacular como política cultural habría encontrado resistencia mucho antes. Y quizás ciudades como Abu Dhabi, Doha o Shanghái no habrían apostado por museos-icono de arquitectos occidentales.',
      },
      {
        icono: '🌿',
        titulo: '¿Y si el hormigón nunca hubiera triunfado?',
        perfil: 'Contrafactual tecnológico',
        texto:
          'El hormigón armado fue el material del siglo XX: barato, moldeable, duradero y capaz de cubrir grandes luces. Pero si la madera estructural laminada hubiera alcanzado su madurez técnica antes —como el CLT de hoy—, ¿habría dominado la construcción en lugar del hormigón? Los edificios serían más ligeros, más cálidos al tacto y con una huella de carbono radicalmente menor. El brutalismo no habría existido (o habría sido de madera). Y quizás la arquitectura del siglo XX habría sido más sensorial y menos monumental. El CLT de hoy sugiere que esa historia alternativa aún puede escribirse.',
      },
      {
        icono: '🤖',
        titulo: '¿Qué hace un arquitecto cuando la IA diseña más rápido que él?',
        perfil: 'Debate profesional actual',
        texto:
          'En 2023 un arquitecto puede pedirle a una IA generativa cien propuestas de fachada en minutos. El diseño generativo puede optimizar una estructura para que use el mínimo material manteniendo la máxima resistencia. ¿Qué queda para el arquitecto humano? Probablemente lo más difícil: entender al cliente, interpretar el contexto urbano y cultural, tomar decisiones éticas sobre impacto social, y asumir la responsabilidad de lo que se construye. La IA acelera el proceso pero no puede sustituir el juicio. Igual que el CAD no eliminó al arquitecto en los años 90, la IA generativa no lo hará ahora —pero transformará radicalmente su manera de trabajar.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué diferencia hay entre "arquitectura moderna" y "arquitectura contemporánea"?',
        respuesta:
          'En arquitectura, "moderno" tiene un significado técnico preciso: el Movimiento Moderno fue un período histórico específico (aproximadamente 1919–1972) caracterizado por el funcionalismo, la ausencia de ornamento y el uso del hormigón, el acero y el vidrio. No todo lo que es nuevo o actual es "moderno" en este sentido. "Contemporáneo" describe simplemente la arquitectura que se hace hoy, sin implicar ningún estilo concreto. Decir que el Guggenheim Bilbao (1997) es "arquitectura moderna" es un error técnico: es arquitectura deconstructivista contemporánea. La confusión es tan frecuente que en el uso cotidiano los dos términos se usan como sinónimos, pero en historia de la arquitectura no lo son.',
        tip: 'Un edificio de Mies van der Rohe de 1958 es "moderno". Un edificio de Zaha Hadid de 2012 es "contemporáneo", no "moderno".',
      },
      {
        pregunta: '¿Por qué el Movimiento Moderno fracasó en la vivienda social?',
        respuesta:
          'El Movimiento Moderno partía de una premisa racionalista: si diseñamos el espacio correcto, las personas vivirán mejor. Pero ignoró que las personas necesitan también identidad, mezcla de usos, escala humana y control sobre su entorno. Los bloques de vivienda social como el Pruitt-Igoe (St. Louis) o los grands ensembles franceses concentraron la pobreza en torres aisladas, sin comercio ni servicios en planta baja, con espacios comunes que nadie sentía suyos. Jane Jacobs demostró en 1961 que la ciudad funciona gracias a la diversidad de usos y la escala de barrio, no a la zonificación separada que los modernistas proponían.',
        tip: 'El Pruitt-Igoe fue demolido en 1972 solo 18 años después de ser construido y había ganado premios de diseño.',
      },
      {
        pregunta: '¿Qué es exactamente el diseño paramétrico?',
        respuesta:
          'En el diseño paramétrico, el arquitecto no dibuja una forma directamente: define los parámetros y las reglas que generan la forma (tamaño, proporción, relación con el sol, resistencia estructural...) y el ordenador calcula las soluciones posibles. Por ejemplo, en lugar de diseñar una fachada manualmente, se puede programar que "cada panel se oriente hacia el sur para maximizar la luz en invierno y minimizarla en verano". El resultado puede ser una fachada con miles de paneles en ángulos distintos que ningún arquitecto habría dibujado a mano. Herramientas como Grasshopper (dentro de Rhino) son el estándar actual.',
        tip: 'El diseño paramétrico no es solo estético: también optimiza estructuras para usar el mínimo material con la máxima resistencia.',
      },
      {
        pregunta: '¿Por qué la arquitectura contamina tanto?',
        respuesta:
          'El sector de la construcción es responsable de aproximadamente el 38% de las emisiones globales de CO₂. Hay dos fuentes principales: el "carbono operacional" (la energía para calentar, enfriar e iluminar los edificios durante su uso) y el "carbono embebido" (las emisiones generadas al fabricar los materiales, especialmente el cemento y el acero). El cemento portland solo es responsable del 8% de las emisiones globales de CO₂. La transición hacia edificios con certificación Passive House, materiales de bajo carbono (madera, cáñamo, tierra) y diseño para la circularidad es la respuesta estructural al problema.',
        tip: 'Fabricar una tonelada de cemento produce aproximadamente 0,9 toneladas de CO₂. El mundo produce unos 4.000 millones de toneladas de cemento al año.',
      },
      {
        pregunta: '¿Quién decide qué edificios son "históricos" y merecen protección?',
        respuesta:
          'En España, la declaración de Bien de Interés Cultural (BIC) o el nivel de protección en el planeamiento urbano es competencia autonómica, con distintos grados según la comunidad. A nivel europeo, el Consejo de Europa y la UNESCO supervisan el patrimonio de valor universal. El debate es permanente: el Barbican de Londres, icono del brutalismo, tardó décadas en ser protegido porque muchos lo consideraban simplemente "feo". En España, edificios racionalistas de los años 30 o la arquitectura del desarrollismo de los 60 siguen sin protección en muchas ciudades. La "musealización" de edificios modernos plantea también el problema de cómo conservar materiales pensados para una vida útil de 50 años.',
        tip: 'La Sagrada Família es Patrimonio de la Humanidad desde 2005, pero aún no está terminada. Será la primera gran catedral del mundo en ser catalogada como patrimonio antes de completarse.',
      },
    ],

    pasos: [
      {
        titulo: 'Observa la densidad de cambios en el siglo XX',
        cuerpo:
          'Antes de leer nada, mira la Línea del Tiempo y observa cuántos hitos se acumulan entre 1919 y 1975: la Bauhaus, el Movimiento Moderno, el Estilo Internacional y el Brutalismo en apenas 56 años. Ningún siglo anterior vivió tantas revoluciones arquitectónicas en tan poco tiempo. El hierro, el vidrio y el hormigón cambiaron lo que era posible construir; las guerras mundiales destruyeron y obligaron a reconstruir; las ideologías usaron la arquitectura como propaganda. Esa densidad te dará la escala de lo ocurrido.',
      },
      {
        titulo: 'Compara los extremos del debate: ornamento vs función',
        cuerpo:
          'Haz clic en "El Modernismo y Art Nouveau" y luego en "La Bauhaus y el Movimiento Moderno". Son movimientos casi opuestos en cuanto al ornamento: el Art Nouveau lo celebra como forma de vida; la Bauhaus lo elimina como deshonestidad. Luego haz clic en "El Posmodernismo y la Pluralidad": el posmodernismo recupera el ornamento con ironía. Este debate de ida y vuelta —ornamento sí / ornamento no— es el hilo rojo de la arquitectura del siglo XX.',
      },
      {
        titulo: 'Sigue la tecnología como motor del cambio',
        cuerpo:
          'En cada hito, fíjate en qué tecnología lo hace posible: el acero permite el Crystal Palace y los rascacielos; el hormigón armado permite la Unité d\'Habitation; el CAD y el CATIA permiten el Guggenheim Bilbao; Grasshopper permite los edificios de Zaha Hadid; la IA generativa permite los edificios del futuro. La arquitectura cambia porque la tecnología de construir cambia. Identificar esa relación es entender la historia del movimiento.',
      },
      {
        titulo: 'Usa la Comparativa para ver quién influyó en quién',
        cuerpo:
          'En la tabla Comparativa, observa los personajes de cada período. Notarás que los mismos nombres aparecen en varias etapas (Mies van der Rohe en la Bauhaus y en el Estilo Internacional; Frank Lloyd Wright de los inicios hasta 1959; Le Corbusier desde el Modernismo hasta el Brutalismo). La arquitectura moderna no es una secuencia de escuelas aisladas: es una conversación continua entre maestros y discípulos, rupturistas y continuadores.',
      },
      {
        titulo: 'Termina con el debate vigente: ¿qué viene después?',
        cuerpo:
          'La Era Digital e IA es el único hito abierto, sin fin definido (anioFin: 9999). Lee su descripción y luego lee los escenarios del bloque educativo. La arquitectura del presente no tiene nombre de estilo consensuado —y quizás no lo tendrá nunca, porque vivimos en una era de pluralidad radical. Pregúntate: si tuvieras que añadir un hito 11 dentro de 30 años, ¿cuál sería? Esa reflexión convierte la cronología en una herramienta de pensamiento sobre el futuro.',
      },
    ],

    tips: [
      {
        icono: '🏗️',
        texto:
          'La Sagrada Família lleva más de 140 años en construcción y se espera que se termine hacia 2030. Es el edificio más lento de la historia moderna. Si Gaudí hubiera vivido hasta hoy (habría cumplido 172 años), todavía no habría podido ver su obra terminada.',
      },
      {
        icono: '🌐',
        texto:
          'El "Efecto Bilbao" (Guggenheim, 1997) generó en sus primeros diez años más de 1.600 millones de euros en impacto económico para el País Vasco y triplicó el turismo de la ciudad. Un solo edificio transformó la economía de una región entera. Es el argumento más citado para justificar la arquitectura espectacular como inversión pública.',
      },
      {
        icono: '📐',
        texto:
          'La Bauhaus duró solo 14 años (1919–1933), pero su influencia fue desproporcionada a su duración. Tuvo apenas 1.400 estudiantes en total. Sin embargo, sus profesores y alumnos —emigrados a EE.UU. al huir del nazismo— transformaron el diseño, la arquitectura y el pensamiento visual del siglo XX desde Harvard, el MIT y el IIT de Chicago.',
      },
      {
        icono: '♻️',
        texto:
          'El CLT (Cross-Laminated Timber, madera laminada cruzada) puede sustituir al hormigón en edificios de hasta 20 plantas con una huella de carbono hasta 6 veces menor. Además, si los edificios se diseñan para desmontarse, la madera puede reutilizarse: es el único material estructural que puede ser también un sumidero neto de CO₂.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir "moderno" con "nuevo" o "actual"',
        cuerpo:
          'En el lenguaje cotidiano, "moderno" significa simplemente "reciente". En historia de la arquitectura, "Movimiento Moderno" es un período concreto (c. 1919–1972) con características definidas: funcionalismo, ausencia de ornamento, hormigón/acero/vidrio, planta libre. Un edificio de Le Corbusier de 1929 es "moderno"; un edificio de Zaha Hadid de 2010 es "contemporáneo" o "paramétrico", pero no "moderno" en el sentido técnico. Usar "moderno" como sinónimo de "actual" oscurece la comprensión del movimiento histórico.',
      },
      {
        titulo: 'Creer que el Brutalismo es sinónimo de fealdad deliberada',
        cuerpo:
          'El Brutalismo tomó su nombre del "béton brut" (hormigón visto) de Le Corbusier, no de la palabra "brutal" en español. Sus creadores lo concibieron como arquitectura honesta: mostrar los materiales tal como son, sin revestimientos que los oculten. La asociación con la fealdad y la degradación social proviene de cómo se ejecutaron (mal) y gestionaron (peor) muchos proyectos de vivienda social brutalista. El Barbican de Londres, también brutalista, es hoy uno de los barrios más valorados y codiciados de la ciudad.',
      },
      {
        titulo: 'Pensar que la sostenibilidad es solo una cuestión de tecnología',
        cuerpo:
          'La arquitectura sostenible no se reduce a instalar paneles solares o certificar un edificio con LEED. Implica decisiones mucho más profundas: dónde se construye (la densidad urbana reduce las necesidades de transporte mucho más que cualquier tecnología), qué materiales se usan (el carbono embebido en la construcción es tan importante como el consumo energético posterior), y cómo se diseña para que el edificio pueda adaptarse, ampliarse o desmontarse en lugar de demolerse. La sostenibilidad real es una cuestión de sistema, no de gadgets.',
      },
      {
        titulo: 'Subestimar el papel político de la arquitectura',
        cuerpo:
          'Los grandes proyectos arquitectónicos nunca son neutros. El Albert Speer de Hitler diseñó la Germania como símbolo del Tercer Reich. Le Corbusier aceptó encargos de Mussolini y de Vichy. Las ciudades planificadas desde cero —Brasilia, Chandigarh, Islamabad— expresaron ideologías de modernización nacional. Y hoy, los megaproyectos de Arabia Saudí (NEOM, The Line) o los rascacielos de las petromonarquías del Golfo son también declaraciones de poder político y económico antes que respuestas a necesidades reales de vivienda. La arquitectura siempre habla en nombre de alguien.',
      },
    ],
  },
};
