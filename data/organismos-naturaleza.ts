export type NivelOrganismo = 'basico' | 'intermedio' | 'avanzado';

export interface OrganismoNaturaleza {
  id: string;
  nombre: string;
  grupo: string;            // respuesta correcta
  confundibleCon: [string, string, string]; // exactamente 3 distractores plausibles
  porQueConfunde: string;   // por qué la gente se equivoca
  curiosidad: string;       // dato memorable para el feedback
  nivel: NivelOrganismo;
}

export const organismosNaturaleza: OrganismoNaturaleza[] = [

  // ── BÁSICO — Animales contraintuitivos (~20) ──────────────────────────

  {
    id: 'murcielago',
    nombre: 'Murciélago',
    grupo: 'Mamífero',
    confundibleCon: ['Ave', 'Reptil', 'Insecto'],
    porQueConfunde: 'Vuela y sale de noche, lo que lo hace parecer un ave extraña. Pero tiene pelo, da a luz crías vivas y las amamanta.',
    curiosidad: 'Es el único mamífero capaz de volar activamente. Existen más de 1.400 especies de murciélagos en el mundo.',
    nivel: 'basico',
  },

  {
    id: 'delfin',
    nombre: 'Delfín',
    grupo: 'Mamífero',
    confundibleCon: ['Pez', 'Reptil', 'Anfibio'],
    porQueConfunde: 'Vive en el mar, nada con agilidad y tiene forma de pez. Pero respira con pulmones, sale a la superficie y amamanta a sus crías.',
    curiosidad: 'Los delfines duermen con medio cerebro activo: el otro medio vigila para poder respirar y detectar depredadores.',
    nivel: 'basico',
  },

  {
    id: 'ballena',
    nombre: 'Ballena azul',
    grupo: 'Mamífero',
    confundibleCon: ['Pez', 'Reptil', 'Crustáceo'],
    porQueConfunde: 'Es el animal más grande del océano y tiene aletas, lo que lo hace parecer un pez gigante. Es mamífero como el delfín.',
    curiosidad: 'La ballena azul puede pesar 150 toneladas y medir 30 metros. Su corazón es del tamaño de un coche pequeño.',
    nivel: 'basico',
  },

  {
    id: 'ornitorrinco',
    nombre: 'Ornitorrinco',
    grupo: 'Mamífero',
    confundibleCon: ['Reptil', 'Ave', 'Anfibio'],
    porQueConfunde: 'Pone huevos como un reptil, tiene pico de pato y patas palmeadas. Sin embargo, produce leche y tiene pelo: es mamífero.',
    curiosidad: 'Es uno de los únicos mamíferos venenosos: el macho tiene un espolón con veneno en las patas traseras capaz de matar un perro.',
    nivel: 'basico',
  },

  {
    id: 'pinguino',
    nombre: 'Pingüino',
    grupo: 'Ave',
    confundibleCon: ['Mamífero', 'Pez', 'Reptil'],
    porQueConfunde: 'No vuela, camina erguido y parece un mamífero disfrazado. Pero tiene plumas, pico y pone huevos: es un ave.',
    curiosidad: 'Aunque no vuela por el aire, es un nadador excepcional que alcanza los 30 km/h bajo el agua.',
    nivel: 'basico',
  },

  {
    id: 'arana',
    nombre: 'Araña',
    grupo: 'Arácnido',
    confundibleCon: ['Insecto', 'Crustáceo', 'Molusco'],
    porQueConfunde: 'En el habla cotidiana se llama "bicho" o "insecto", pero tiene 8 patas (no 6) y solo 2 partes corporales (no 3).',
    curiosidad: 'La clave para distinguirlas: los insectos tienen 6 patas y 3 segmentos; los arácnidos, 8 patas y 2 segmentos.',
    nivel: 'basico',
  },

  {
    id: 'escorpion',
    nombre: 'Escorpión',
    grupo: 'Arácnido',
    confundibleCon: ['Insecto', 'Crustáceo', 'Reptil'],
    porQueConfunde: 'Su aspecto intimidante y sus pinzas hacen pensar en un insecto o un crustáceo, pero tiene 8 patas: es arácnido como la araña.',
    curiosidad: 'Los escorpiones llevan 430 millones de años en la Tierra, anteriores a los dinosaurios. Brillan con luz ultravioleta.',
    nivel: 'basico',
  },

  {
    id: 'coral',
    nombre: 'Coral',
    grupo: 'Animal (Cnidario)',
    confundibleCon: ['Planta', 'Hongo', 'Alga'],
    porQueConfunde: 'Está fijo al fondo marino, tiene formas vegetales y colores llamativos. Pero es una colonia de miles de pequeños animales.',
    curiosidad: 'Cada coral es miles de pólipos animales que construyen esqueletos de carbonato cálcico. Los arrecifes son los ecosistemas más biodiversos del océano.',
    nivel: 'basico',
  },

  {
    id: 'medusa',
    nombre: 'Medusa',
    grupo: 'Animal (Cnidario)',
    confundibleCon: ['Planta', 'Protista', 'Molusco'],
    porQueConfunde: 'Su cuerpo gelatinoso y transparente no parece animal. Sin embargo, es un depredador activo que paraliza sus presas con tentáculos urticantes.',
    curiosidad: 'El 95% de su cuerpo es agua. La Turritopsis dohrnii puede revertir su ciclo vital y rejuvenecer indefinidamente.',
    nivel: 'basico',
  },

  {
    id: 'esponja',
    nombre: 'Esponja marina',
    grupo: 'Animal (Porífero)',
    confundibleCon: ['Planta', 'Hongo', 'Alga'],
    porQueConfunde: 'Está adherida a las rocas sin moverse, sin boca visible. Parece un objeto inerte o una planta, pero es un animal sin cerebro ni músculos.',
    curiosidad: 'Filtra hasta 20.000 litros de agua al día. Es el animal más simple: no tiene tejidos ni órganos diferenciados.',
    nivel: 'basico',
  },

  {
    id: 'caballito-mar',
    nombre: 'Caballito de mar',
    grupo: 'Pez',
    confundibleCon: ['Molusco', 'Crustáceo', 'Anfibio'],
    porQueConfunde: 'Su aspecto no recuerda en nada a un pez: tiene cabeza de caballo, cuerpo vertical y nada en posición erguida. Pero tiene branquias y aletas.',
    curiosidad: 'Es el único pez en el que el macho queda embarazado y da a luz. Las crías nacen en grupos de hasta 2.000.',
    nivel: 'basico',
  },

  {
    id: 'anguila',
    nombre: 'Anguila',
    grupo: 'Pez',
    confundibleCon: ['Reptil', 'Anfibio', 'Anélido'],
    porQueConfunde: 'Tiene cuerpo alargado y sinuoso como una serpiente y se mueve de forma similar, pero es un pez con branquias.',
    curiosidad: 'La anguila europea nace en el mar de los Sargazos (Atlántico) y migra hasta 7.000 km para vivir en ríos europeos.',
    nivel: 'basico',
  },

  {
    id: 'tiburon',
    nombre: 'Tiburón',
    grupo: 'Pez',
    confundibleCon: ['Mamífero', 'Reptil', 'Cnidario'],
    porQueConfunde: 'Convive con delfines en el mar y mucha gente los confunde por su tamaño. El tiburón respira con branquias y tiene esqueleto de cartílago.',
    curiosidad: 'El tiburón no tiene huesos: su esqueleto es de cartílago. Sus dientes se renuevan continuamente: puede perder 30.000 en su vida.',
    nivel: 'basico',
  },

  {
    id: 'pulpo',
    nombre: 'Pulpo',
    grupo: 'Molusco',
    confundibleCon: ['Pez', 'Crustáceo', 'Equinodermo'],
    porQueConfunde: 'Con sus 8 tentáculos nada libremente y parece muy diferente a un mejillón, pero ambos son moluscos.',
    curiosidad: 'Tiene tres corazones, sangre azul (por hemocianina) y puede cambiar de color en milisegundos. Su inteligencia es comparable a la de muchos vertebrados.',
    nivel: 'basico',
  },

  {
    id: 'lombriz',
    nombre: 'Lombriz de tierra',
    grupo: 'Anélido',
    confundibleCon: ['Insecto', 'Reptil', 'Protista'],
    porQueConfunde: 'Es pequeña e invertebrada, lo que hace pensar en un insecto, pero no tiene patas ni exoesqueleto.',
    curiosidad: 'Darwin estudió las lombrices durante 40 años. Una hectárea de tierra fértil puede contener hasta 1 millón de lombrices.',
    nivel: 'basico',
  },

  {
    id: 'salamandra',
    nombre: 'Salamandra',
    grupo: 'Anfibio',
    confundibleCon: ['Reptil', 'Insecto', 'Pez'],
    porQueConfunde: 'Tiene 4 patas y aspecto similar a un lagarto, pero su piel es húmeda y sin escamas: es anfibio como la rana.',
    curiosidad: 'Las salamandras tienen una capacidad de regeneración asombrosa: pueden regenerar extremidades, partes del corazón e incluso tejido cerebral.',
    nivel: 'basico',
  },

  {
    id: 'erizo-mar',
    nombre: 'Erizo de mar',
    grupo: 'Equinodermo',
    confundibleCon: ['Crustáceo', 'Molusco', 'Insecto'],
    porQueConfunde: 'Sus púas y aspecto de "bicho" hacen pensar en un crustáceo o invertebrado genérico. Pertenece al grupo de las estrellas de mar.',
    curiosidad: 'Los equinodermos tienen simetría de 5 partes y son parientes de las estrellas de mar. Carecen de cerebro pero tienen sistema nervioso.',
    nivel: 'basico',
  },

  {
    id: 'calamar',
    nombre: 'Calamar',
    grupo: 'Molusco',
    confundibleCon: ['Pez', 'Crustáceo', 'Cnidario'],
    porQueConfunde: 'Nada en el mar con rapidez y parece emparentado con los peces, pero es pariente del caracol y el pulpo.',
    curiosidad: 'El calamar gigante puede alcanzar 13 metros y tiene los ojos más grandes del reino animal: hasta 30 cm de diámetro.',
    nivel: 'basico',
  },

  {
    id: 'tortuga',
    nombre: 'Tortuga de agua',
    grupo: 'Reptil',
    confundibleCon: ['Anfibio', 'Mamífero', 'Pez'],
    porQueConfunde: 'Vive en el agua como los anfibios y parece similar a una rana en su habitat, pero tiene escamas y pone huevos en tierra: es reptil.',
    curiosidad: 'Algunas tortugas pueden vivir más de 150 años. Son uno de los vertebrados más longevos de la Tierra.',
    nivel: 'basico',
  },

  {
    id: 'cangrejo',
    nombre: 'Cangrejo',
    grupo: 'Crustáceo',
    confundibleCon: ['Insecto', 'Arácnido', 'Molusco'],
    porQueConfunde: 'Es un "bicho" con exoesqueleto que la gente clasifica a menudo como insecto o similar. Es crustáceo: pariente de la langosta y el percebe.',
    curiosidad: 'Los crustáceos son básicamente "insectos del mar". Muda su caparazón para crecer y queda vulnerable hasta que endurece el nuevo.',
    nivel: 'basico',
  },

  // ── INTERMEDIO — Hongos, plantas y algas (~13) ────────────────────────

  {
    id: 'seta',
    nombre: 'Seta (champiñón silvestre)',
    grupo: 'Hongo',
    confundibleCon: ['Planta', 'Alga', 'Protista'],
    porQueConfunde: 'Crece en la tierra del bosque como una planta, pero no hace fotosíntesis y no tiene clorofila. Pertenece al reino Fungi, distinto del vegetal.',
    curiosidad: 'Los hongos son genéticamente más cercanos a los animales que a las plantas. Lo que vemos es solo la parte reproductora: el organismo real vive bajo tierra.',
    nivel: 'intermedio',
  },

  {
    id: 'levadura',
    nombre: 'Levadura',
    grupo: 'Hongo',
    confundibleCon: ['Bacteria', 'Protista', 'Planta'],
    porQueConfunde: 'Es microscópica y unicelular como las bacterias, pero tiene núcleo celular verdadero y pertenece al reino Fungi.',
    curiosidad: 'Llevamos 10.000 años usando levadura para hacer pan, cerveza y vino sin saber lo que era. Es el primer organismo secuenciado genéticamente.',
    nivel: 'intermedio',
  },

  {
    id: 'liquen',
    nombre: 'Liquen',
    grupo: 'Simbiosis Hongo + Alga',
    confundibleCon: ['Planta', 'Alga', 'Hongo'],
    porQueConfunde: 'Crece en piedras y cortezas como una costra vegetal, pero no es ni planta, ni alga, ni hongo: es la unión permanente e inseparable de los dos últimos.',
    curiosidad: 'Algunos líquenes tienen más de 9.000 años de antigüedad. Pueden sobrevivir en el espacio exterior y son los primeros colonizadores de las rocas desnudas.',
    nivel: 'intermedio',
  },

  {
    id: 'alga-verde',
    nombre: 'Alga verde',
    grupo: 'Protista (Alga)',
    confundibleCon: ['Planta', 'Bacteria', 'Hongo'],
    porQueConfunde: 'Es verde, hace fotosíntesis y vive en el agua: parece una planta acuática. Pero no tiene tejidos ni órganos diferenciados como las plantas terrestres.',
    curiosidad: 'Las plantas terrestres evolucionaron a partir de algas verdes hace 470 millones de años. Las algas son nuestros "abuelos" evolutivos vegetales.',
    nivel: 'intermedio',
  },

  {
    id: 'alga-roja',
    nombre: 'Alga roja (Nori)',
    grupo: 'Protista (Alga)',
    confundibleCon: ['Planta', 'Hongo', 'Animal (Cnidario)'],
    porQueConfunde: 'Su color rojo oscuro y textura la hacen parecer una planta marina, pero carece de los tejidos vasculares que definen a las plantas.',
    curiosidad: 'El agar-agar usado en cocina y laboratorios se extrae de algas rojas. El nori de los sushis también es un alga roja.',
    nivel: 'intermedio',
  },

  {
    id: 'bambu',
    nombre: 'Bambú',
    grupo: 'Planta (Gramínea)',
    confundibleCon: ['Árbol', 'Hongo', 'Alga'],
    porQueConfunde: 'Puede crecer 30 metros de altura y parece un árbol imponente, pero es una gramínea como el trigo o el maíz. No tiene crecimiento lateral del tallo.',
    curiosidad: 'Es la hierba más grande del mundo. Puede crecer hasta 90 cm en un solo día y su madera es más resistente que el acero en proporción al peso.',
    nivel: 'intermedio',
  },

  {
    id: 'musgo',
    nombre: 'Musgo',
    grupo: 'Planta',
    confundibleCon: ['Alga', 'Hongo', 'Bacteria'],
    porQueConfunde: 'No tiene flores, ni raíces verdaderas, ni tejido vascular: parece más un alga o un hongo que una planta. Pero sí es planta terrestre primitiva.',
    curiosidad: 'Los musgos son plantas terrestres que aún necesitan agua para reproducirse, igual que sus antepasados acuáticos. Son los primeros vegetales que colonizaron la tierra.',
    nivel: 'intermedio',
  },

  {
    id: 'helecho',
    nombre: 'Helecho',
    grupo: 'Planta',
    confundibleCon: ['Alga', 'Protista (Alga)', 'Hongo'],
    porQueConfunde: 'No tiene flores ni semillas y sus hojas recuerdan a algas, pero tiene tejido vascular y raíces verdaderas: es planta.',
    curiosidad: 'Los helechos llevan 360 millones de años en la Tierra, anteriores a los dinosaurios. Se reproducen por esporas, no por semillas.',
    nivel: 'intermedio',
  },

  {
    id: 'trufa',
    nombre: 'Trufa',
    grupo: 'Hongo',
    confundibleCon: ['Planta', 'Tubérculo vegetal', 'Protista (Alga)'],
    porQueConfunde: 'Crece bajo tierra junto a raíces de árboles y parece un tubérculo como la patata. Pero es el cuerpo fructífero de un hongo subterráneo.',
    curiosidad: 'Para crecer, las trufas necesitan la simbiosis con raíces de determinados árboles. Son imposibles de cultivar en solitario.',
    nivel: 'intermedio',
  },

  {
    id: 'kelp',
    nombre: 'Kelp (alga gigante)',
    grupo: 'Protista (Alga)',
    confundibleCon: ['Planta', 'Animal (Cnidario)', 'Hongo'],
    porQueConfunde: 'Forma bosques submarinos de hasta 45 metros que parecen vegetación marina. No tiene las estructuras celulares de las plantas.',
    curiosidad: 'Los bosques de kelp producen oxígeno y son refugio de miles de especies marinas. Son tan productivos como los bosques tropicales.',
    nivel: 'intermedio',
  },

  {
    id: 'fitoplancton',
    nombre: 'Fitoplancton',
    grupo: 'Protista (Alga)',
    confundibleCon: ['Planta', 'Bacteria', 'Animal (Cnidario)'],
    porQueConfunde: 'Hace fotosíntesis y es verde-azulado como las plantas, pero es microscópico, unicelular y sin ningún tipo de tejido.',
    curiosidad: 'El fitoplancton produce más del 50% del oxígeno del planeta. Respiramos gracias al océano tanto como gracias a los bosques.',
    nivel: 'intermedio',
  },

  {
    id: 'hongo-penicillium',
    nombre: 'Penicillium (moho verde)',
    grupo: 'Hongo',
    confundibleCon: ['Bacteria', 'Planta', 'Protista (Alga)'],
    porQueConfunde: 'Es microscópico y aparece en alimentos en descomposición como las bacterias, pero tiene núcleo celular verdadero: es un hongo.',
    curiosidad: 'Alexander Fleming descubrió en 1928 que este hongo mataba bacterias. De él se obtuvo la penicilina, que salvó millones de vidas.',
    nivel: 'intermedio',
  },

  {
    id: 'cactus',
    nombre: 'Cactus',
    grupo: 'Planta',
    confundibleCon: ['Hongo', 'Protista (Alga)', 'Animal (Porífero)'],
    porQueConfunde: 'Su aspecto tan diferente a cualquier otra planta —sin hojas visibles, lleno de espinas— hace pensar que es otro tipo de organismo.',
    curiosidad: 'Las espinas del cactus son en realidad hojas modificadas para minimizar la pérdida de agua. El tallo verde es quien realiza la fotosíntesis.',
    nivel: 'intermedio',
  },

  // ── AVANZADO — Microorganismos y casos límite (~10) ───────────────────

  {
    id: 'virus',
    nombre: 'Virus',
    grupo: 'Agente Acelular (no ser vivo)',
    confundibleCon: ['Bacteria', 'Protista (Alga)', 'Hongo'],
    porQueConfunde: 'Causa enfermedades como las bacterias, pero no tiene células propias, no tiene metabolismo y no puede reproducirse sin infectar a otro ser vivo.',
    curiosidad: 'Los científicos debaten si los virus están vivos. Solo "despiertan" al entrar en una célula huésped. Hay más virus en la Tierra que estrellas en el universo.',
    nivel: 'avanzado',
  },

  {
    id: 'bacteria',
    nombre: 'Bacteria',
    grupo: 'Procariota (Bacteria)',
    confundibleCon: ['Agente Acelular (no ser vivo)', 'Protista (Alga)', 'Hongo'],
    porQueConfunde: 'Se confunde con virus porque ambos causan enfermedades, pero la bacteria sí es un ser vivo con metabolismo, reproducción propia y célula (sin núcleo).',
    curiosidad: 'Las bacterias llevan 3.500 millones de años en la Tierra. El 90% de las células de tu cuerpo son bacterias que viven en simbiosis contigo.',
    nivel: 'avanzado',
  },

  {
    id: 'ameba',
    nombre: 'Ameba',
    grupo: 'Protista',
    confundibleCon: ['Bacteria', 'Animal (Porífero)', 'Hongo'],
    porQueConfunde: 'Se mueve, "come" otros organismos y parece un animal microscópico. Pero es unicelular con núcleo verdadero: pertenece al reino Protista.',
    curiosidad: 'Algunas especies de ameba tienen más ADN que los seres humanos, aunque sean organismos unicelulares. El tamaño del genoma no se correlaciona con la complejidad.',
    nivel: 'avanzado',
  },

  {
    id: 'paramecio',
    nombre: 'Paramecio',
    grupo: 'Protista',
    confundibleCon: ['Bacteria', 'Animal (Porífero)', 'Hongo'],
    porQueConfunde: 'Es microscópico y unicelular como las bacterias, pero tiene núcleo y organelas complejas: es eucariota, pertenece a los Protistas.',
    curiosidad: 'El paramecio tiene dos núcleos: el macronúcleo para las funciones cotidianas y el micronúcleo solo para la reproducción sexual.',
    nivel: 'avanzado',
  },

  {
    id: 'cianobacteria',
    nombre: 'Cianobacteria',
    grupo: 'Procariota (Bacteria)',
    confundibleCon: ['Protista (Alga)', 'Planta', 'Hongo'],
    porQueConfunde: 'Es fotosintética y de color verde-azulado como las algas, pero es una bacteria procariota sin núcleo celular verdadero.',
    curiosidad: 'Hace 2.400 millones de años, las cianobacterias crearon la atmósfera oxigenada de la Tierra. Toda la vida aeróbica existe gracias a ellas.',
    nivel: 'avanzado',
  },

  {
    id: 'prion',
    nombre: 'Prión',
    grupo: 'Proteína mal plegada (no ser vivo)',
    confundibleCon: ['Agente Acelular (no ser vivo)', 'Bacteria', 'Hongo'],
    porQueConfunde: 'Causa enfermedades devastadoras como el mal de las vacas locas, lo que hace pensar en un patógeno con células o genoma. Pero es solo una proteína.',
    curiosidad: 'Un prión es una proteína con forma incorrecta que "contagia" su mal plegamiento a otras proteínas sanas. No tiene ADN ni ARN.',
    nivel: 'avanzado',
  },

  {
    id: 'euglena',
    nombre: 'Euglena',
    grupo: 'Protista',
    confundibleCon: ['Planta', 'Animal (Cnidario)', 'Bacteria'],
    porQueConfunde: 'Hace fotosíntesis como una planta pero también se mueve y puede "comer" materia orgánica como un animal. Es el ejemplo clásico de organismo inclasificable.',
    curiosidad: 'La euglena fue uno de los argumentos más usados para justificar el reino Protista: los organismos que no son claramente planta ni animal.',
    nivel: 'avanzado',
  },

  {
    id: 'hongo-miel',
    nombre: 'Armillaria (hongo de miel)',
    grupo: 'Hongo',
    confundibleCon: ['Planta', 'Animal (Porífero)', 'Protista'],
    porQueConfunde: 'Sus filamentos subterráneos se extienden por todo el bosque como raíces de árbol, lo que hace pensar en una planta gigante.',
    curiosidad: 'El organismo vivo más grande del mundo es un Armillaria en Oregon (EE.UU.) que ocupa 9 km² y tiene más de 8.000 años de antigüedad.',
    nivel: 'avanzado',
  },

  {
    id: 'diatomea',
    nombre: 'Diatomea',
    grupo: 'Protista (Alga)',
    confundibleCon: ['Bacteria', 'Planta', 'Animal (Porífero)'],
    porQueConfunde: 'Son algas microscópicas unicelulares con una cubierta de sílice como vidrio. Parecen minerales o bacterias bajo el microscopio.',
    curiosidad: 'Las diatomeas producen el 20% del oxígeno de la Tierra y su cubierta de sílice se usa en filtros industriales, pasta de dientes y piscinas.',
    nivel: 'avanzado',
  },

  {
    id: 'mixomiceto',
    nombre: 'Mixomiceto (moho mucilaginoso)',
    grupo: 'Protista',
    confundibleCon: ['Hongo', 'Animal (Porífero)', 'Bacteria'],
    porQueConfunde: 'Parece un hongo y se clasifica junto a ellos en muchos libros viejos. Pero puede moverse lentamente buscando alimento como un animal unicelular gigante.',
    curiosidad: 'El Physarum polycephalum, un mixomiceto sin cerebro ni neuronas, puede resolver laberintos y optimizar rutas de forma similar a los ingenieros de redes.',
    nivel: 'avanzado',
  },
];
