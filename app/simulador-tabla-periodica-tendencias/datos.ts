/**
 * Datos de los 118 elementos para el heatmap de tendencias. Sin React: lo importa page.tsx.
 *
 * ── Fuentes (verificadas el 26/09/2026, hallazgos 1953, 1958 y 1959 del Inspector) ──
 * Cada propiedad sale de UNA sola serie, para que el color compare magnitudes iguales:
 *
 * · Radio: radio covalente de enlace sencillo de Pyykkö y Atsumi, Chem. Eur. J. 15, 186-197
 *   (2009), la única serie autoconsistente que cubre los 118 elementos. Antes se mezclaban
 *   tres magnitudes (radio calculado de Clementi 1967 para Z 1-86, van der Waals para Fr, Ra
 *   y actínidos y este covalente para Z 104-118), y el período 7 salía más pequeño que el 4.
 *   Tabla cotejada con la de «Covalent radius» y «Atomic radii of the elements (data page)».
 * · Electronegatividad: escala de Pauling (Allred, J. Inorg. Nucl. Chem. 17, 215, 1961),
 *   según la tabulan el CRC Handbook, WebElements y el Lange. Sin dato donde ninguna de las
 *   tres da valor (gases nobles salvo Kr y Xe, Lr y Z ≥ 104).
 * · 1.ª energía de ionización: NIST Atomic Spectra Database y CRC Handbook, en kJ/mol,
 *   redondeada a la unidad (Tc 687, At 899 —Rothe et al. 2013—, Lr 479 —Sato et al. 2015—).
 *   Para Z ≥ 104 son valores CALCULADOS: no hay medida.
 * · Afinidad electrónica: convenio de la entalpía (ΔH de X + e⁻ → X⁻; más negativo = más
 *   favorable), con los valores MEDIDOS de la compilación de Ning y Lu, J. Phys. Chem. Ref.
 *   Data 51, 021502 (2022) y posteriores: Tm −99 (Davis y Thompson 2001), At −233,1
 *   (Leimbach et al. 2020), Hf −17,2, Th −58,6, U −30,4. Donde solo hay estimaciones o
 *   cálculos (Pm, Sm, Ho, Er, Tc, Po, Fr, Ra, Ac, Pa, Np-Lr y Z ≥ 104) el dato va a null:
 *   antes llevaban −50 y −10 de relleno. Los que no forman anión estable (gases nobles,
 *   Be, Mg, Mn, Zn, Cd, Hg, Yb) van a 0 y se rotulan así; el N, con −0,07 eV medidos, a +6,8.
 * · Punto de fusión: CRC Handbook, °C a 1 atm. El carbono no funde a 1 atm (sublima; su
 *   punto triple está a 4489 °C y 10,3 MPa), así que va a null y con nota; el 3550 °C que
 *   llevaba era un valor obsoleto que además le daba el máximo de la escala. Rf: sin medida.
 */

export interface Elemento {
  Z: number;
  simbolo: string;
  nombre: string;
  grupo: number | null;
  periodo: number;
  radioAtomico: number | null;
  electronegatividad: number | null;
  energiaIonizacion: number | null;
  afinidadElectronica: number | null;
  puntoFusion: number | null;
  categoria: string;
}

export const ELEMENTOS: Elemento[] = [
  // Período 1
  { Z:1, simbolo:'H', nombre:'Hidrógeno', grupo:1, periodo:1, radioAtomico:32, electronegatividad:2.2, energiaIonizacion:1312, afinidadElectronica:-72.8, puntoFusion:-259.1, categoria:'no-metal' },
  { Z:2, simbolo:'He', nombre:'Helio', grupo:18, periodo:1, radioAtomico:46, electronegatividad:null, energiaIonizacion:2372, afinidadElectronica:0, puntoFusion:-272.2, categoria:'gas-noble' },
  // Período 2
  { Z:3, simbolo:'Li', nombre:'Litio', grupo:1, periodo:2, radioAtomico:133, electronegatividad:0.98, energiaIonizacion:520, afinidadElectronica:-59.6, puntoFusion:180.5, categoria:'metal-alcalino' },
  { Z:4, simbolo:'Be', nombre:'Berilio', grupo:2, periodo:2, radioAtomico:102, electronegatividad:1.57, energiaIonizacion:900, afinidadElectronica:0, puntoFusion:1287, categoria:'metal-alcalinoterreo' },
  { Z:5, simbolo:'B', nombre:'Boro', grupo:13, periodo:2, radioAtomico:85, electronegatividad:2.04, energiaIonizacion:801, afinidadElectronica:-27, puntoFusion:2075, categoria:'metaloide' },
  { Z:6, simbolo:'C', nombre:'Carbono', grupo:14, periodo:2, radioAtomico:75, electronegatividad:2.55, energiaIonizacion:1086, afinidadElectronica:-121.8, puntoFusion:null, categoria:'no-metal' },
  { Z:7, simbolo:'N', nombre:'Nitrógeno', grupo:15, periodo:2, radioAtomico:71, electronegatividad:3.04, energiaIonizacion:1402, afinidadElectronica:6.8, puntoFusion:-210, categoria:'no-metal' },
  { Z:8, simbolo:'O', nombre:'Oxígeno', grupo:16, periodo:2, radioAtomico:63, electronegatividad:3.44, energiaIonizacion:1314, afinidadElectronica:-141, puntoFusion:-218.8, categoria:'no-metal' },
  { Z:9, simbolo:'F', nombre:'Flúor', grupo:17, periodo:2, radioAtomico:64, electronegatividad:3.98, energiaIonizacion:1681, afinidadElectronica:-328.2, puntoFusion:-219.6, categoria:'halógeno' },
  { Z:10, simbolo:'Ne', nombre:'Neón', grupo:18, periodo:2, radioAtomico:67, electronegatividad:null, energiaIonizacion:2081, afinidadElectronica:0, puntoFusion:-248.6, categoria:'gas-noble' },
  // Período 3
  { Z:11, simbolo:'Na', nombre:'Sodio', grupo:1, periodo:3, radioAtomico:155, electronegatividad:0.93, energiaIonizacion:496, afinidadElectronica:-52.9, puntoFusion:97.8, categoria:'metal-alcalino' },
  { Z:12, simbolo:'Mg', nombre:'Magnesio', grupo:2, periodo:3, radioAtomico:139, electronegatividad:1.31, energiaIonizacion:738, afinidadElectronica:0, puntoFusion:650, categoria:'metal-alcalinoterreo' },
  { Z:13, simbolo:'Al', nombre:'Aluminio', grupo:13, periodo:3, radioAtomico:126, electronegatividad:1.61, energiaIonizacion:577, afinidadElectronica:-41.8, puntoFusion:660.3, categoria:'metal-postransicion' },
  { Z:14, simbolo:'Si', nombre:'Silicio', grupo:14, periodo:3, radioAtomico:116, electronegatividad:1.9, energiaIonizacion:786, afinidadElectronica:-134.1, puntoFusion:1414, categoria:'metaloide' },
  { Z:15, simbolo:'P', nombre:'Fósforo', grupo:15, periodo:3, radioAtomico:111, electronegatividad:2.19, energiaIonizacion:1012, afinidadElectronica:-72, puntoFusion:44.2, categoria:'no-metal' },
  { Z:16, simbolo:'S', nombre:'Azufre', grupo:16, periodo:3, radioAtomico:103, electronegatividad:2.58, energiaIonizacion:1000, afinidadElectronica:-200.4, puntoFusion:112.8, categoria:'no-metal' },
  { Z:17, simbolo:'Cl', nombre:'Cloro', grupo:17, periodo:3, radioAtomico:99, electronegatividad:3.16, energiaIonizacion:1251, afinidadElectronica:-348.6, puntoFusion:-101.5, categoria:'halógeno' },
  { Z:18, simbolo:'Ar', nombre:'Argón', grupo:18, periodo:3, radioAtomico:96, electronegatividad:null, energiaIonizacion:1521, afinidadElectronica:0, puntoFusion:-189.4, categoria:'gas-noble' },
  // Período 4
  { Z:19, simbolo:'K', nombre:'Potasio', grupo:1, periodo:4, radioAtomico:196, electronegatividad:0.82, energiaIonizacion:419, afinidadElectronica:-48.4, puntoFusion:63.4, categoria:'metal-alcalino' },
  { Z:20, simbolo:'Ca', nombre:'Calcio', grupo:2, periodo:4, radioAtomico:171, electronegatividad:1, energiaIonizacion:590, afinidadElectronica:-2.4, puntoFusion:842, categoria:'metal-alcalinoterreo' },
  { Z:21, simbolo:'Sc', nombre:'Escandio', grupo:3, periodo:4, radioAtomico:148, electronegatividad:1.36, energiaIonizacion:633, afinidadElectronica:-17.3, puntoFusion:1541, categoria:'metal-transicion' },
  { Z:22, simbolo:'Ti', nombre:'Titanio', grupo:4, periodo:4, radioAtomico:136, electronegatividad:1.54, energiaIonizacion:658, afinidadElectronica:-7.3, puntoFusion:1668, categoria:'metal-transicion' },
  { Z:23, simbolo:'V', nombre:'Vanadio', grupo:5, periodo:4, radioAtomico:134, electronegatividad:1.63, energiaIonizacion:650, afinidadElectronica:-50.9, puntoFusion:1910, categoria:'metal-transicion' },
  { Z:24, simbolo:'Cr', nombre:'Cromo', grupo:6, periodo:4, radioAtomico:122, electronegatividad:1.66, energiaIonizacion:653, afinidadElectronica:-65.2, puntoFusion:1907, categoria:'metal-transicion' },
  { Z:25, simbolo:'Mn', nombre:'Manganeso', grupo:7, periodo:4, radioAtomico:119, electronegatividad:1.55, energiaIonizacion:717, afinidadElectronica:0, puntoFusion:1246, categoria:'metal-transicion' },
  { Z:26, simbolo:'Fe', nombre:'Hierro', grupo:8, periodo:4, radioAtomico:116, electronegatividad:1.83, energiaIonizacion:762, afinidadElectronica:-14.8, puntoFusion:1538, categoria:'metal-transicion' },
  { Z:27, simbolo:'Co', nombre:'Cobalto', grupo:9, periodo:4, radioAtomico:111, electronegatividad:1.88, energiaIonizacion:760, afinidadElectronica:-63.9, puntoFusion:1495, categoria:'metal-transicion' },
  { Z:28, simbolo:'Ni', nombre:'Níquel', grupo:10, periodo:4, radioAtomico:110, electronegatividad:1.91, energiaIonizacion:737, afinidadElectronica:-111.7, puntoFusion:1455, categoria:'metal-transicion' },
  { Z:29, simbolo:'Cu', nombre:'Cobre', grupo:11, periodo:4, radioAtomico:112, electronegatividad:1.9, energiaIonizacion:745, afinidadElectronica:-119.2, puntoFusion:1084.6, categoria:'metal-transicion' },
  { Z:30, simbolo:'Zn', nombre:'Zinc', grupo:12, periodo:4, radioAtomico:118, electronegatividad:1.65, energiaIonizacion:906, afinidadElectronica:0, puntoFusion:419.5, categoria:'metal-transicion' },
  { Z:31, simbolo:'Ga', nombre:'Galio', grupo:13, periodo:4, radioAtomico:124, electronegatividad:1.81, energiaIonizacion:579, afinidadElectronica:-29.1, puntoFusion:29.8, categoria:'metal-postransicion' },
  { Z:32, simbolo:'Ge', nombre:'Germanio', grupo:14, periodo:4, radioAtomico:121, electronegatividad:2.01, energiaIonizacion:762, afinidadElectronica:-118.9, puntoFusion:938.3, categoria:'metaloide' },
  { Z:33, simbolo:'As', nombre:'Arsénico', grupo:15, periodo:4, radioAtomico:121, electronegatividad:2.18, energiaIonizacion:947, afinidadElectronica:-77.6, puntoFusion:817, categoria:'metaloide' },
  { Z:34, simbolo:'Se', nombre:'Selenio', grupo:16, periodo:4, radioAtomico:116, electronegatividad:2.55, energiaIonizacion:941, afinidadElectronica:-195, puntoFusion:220.8, categoria:'no-metal' },
  { Z:35, simbolo:'Br', nombre:'Bromo', grupo:17, periodo:4, radioAtomico:114, electronegatividad:2.96, energiaIonizacion:1140, afinidadElectronica:-324.5, puntoFusion:-7.3, categoria:'halógeno' },
  { Z:36, simbolo:'Kr', nombre:'Kriptón', grupo:18, periodo:4, radioAtomico:117, electronegatividad:3, energiaIonizacion:1351, afinidadElectronica:0, puntoFusion:-157.4, categoria:'gas-noble' },
  // Período 5
  { Z:37, simbolo:'Rb', nombre:'Rubidio', grupo:1, periodo:5, radioAtomico:210, electronegatividad:0.82, energiaIonizacion:403, afinidadElectronica:-46.9, puntoFusion:39.3, categoria:'metal-alcalino' },
  { Z:38, simbolo:'Sr', nombre:'Estroncio', grupo:2, periodo:5, radioAtomico:185, electronegatividad:0.95, energiaIonizacion:550, afinidadElectronica:-5, puntoFusion:777, categoria:'metal-alcalinoterreo' },
  { Z:39, simbolo:'Y', nombre:'Itrio', grupo:3, periodo:5, radioAtomico:163, electronegatividad:1.22, energiaIonizacion:600, afinidadElectronica:-30, puntoFusion:1522, categoria:'metal-transicion' },
  { Z:40, simbolo:'Zr', nombre:'Circonio', grupo:4, periodo:5, radioAtomico:154, electronegatividad:1.33, energiaIonizacion:640, afinidadElectronica:-41.8, puntoFusion:1855, categoria:'metal-transicion' },
  { Z:41, simbolo:'Nb', nombre:'Niobio', grupo:5, periodo:5, radioAtomico:147, electronegatividad:1.6, energiaIonizacion:652, afinidadElectronica:-88.5, puntoFusion:2477, categoria:'metal-transicion' },
  { Z:42, simbolo:'Mo', nombre:'Molibdeno', grupo:6, periodo:5, radioAtomico:138, electronegatividad:2.16, energiaIonizacion:684, afinidadElectronica:-72.1, puntoFusion:2623, categoria:'metal-transicion' },
  { Z:43, simbolo:'Tc', nombre:'Tecnecio', grupo:7, periodo:5, radioAtomico:128, electronegatividad:1.9, energiaIonizacion:687, afinidadElectronica:null, puntoFusion:2157, categoria:'metal-transicion' },
  { Z:44, simbolo:'Ru', nombre:'Rutenio', grupo:8, periodo:5, radioAtomico:125, electronegatividad:2.2, energiaIonizacion:711, afinidadElectronica:-101, puntoFusion:2334, categoria:'metal-transicion' },
  { Z:45, simbolo:'Rh', nombre:'Rodio', grupo:9, periodo:5, radioAtomico:125, electronegatividad:2.28, energiaIonizacion:720, afinidadElectronica:-110.3, puntoFusion:1964, categoria:'metal-transicion' },
  { Z:46, simbolo:'Pd', nombre:'Paladio', grupo:10, periodo:5, radioAtomico:120, electronegatividad:2.2, energiaIonizacion:805, afinidadElectronica:-54.2, puntoFusion:1555, categoria:'metal-transicion' },
  { Z:47, simbolo:'Ag', nombre:'Plata', grupo:11, periodo:5, radioAtomico:128, electronegatividad:1.93, energiaIonizacion:731, afinidadElectronica:-125.9, puntoFusion:961.8, categoria:'metal-transicion' },
  { Z:48, simbolo:'Cd', nombre:'Cadmio', grupo:12, periodo:5, radioAtomico:136, electronegatividad:1.69, energiaIonizacion:868, afinidadElectronica:0, puntoFusion:321.1, categoria:'metal-transicion' },
  { Z:49, simbolo:'In', nombre:'Indio', grupo:13, periodo:5, radioAtomico:142, electronegatividad:1.78, energiaIonizacion:558, afinidadElectronica:-37, puntoFusion:156.6, categoria:'metal-postransicion' },
  { Z:50, simbolo:'Sn', nombre:'Estaño', grupo:14, periodo:5, radioAtomico:140, electronegatividad:1.96, energiaIonizacion:709, afinidadElectronica:-107.3, puntoFusion:231.9, categoria:'metal-postransicion' },
  { Z:51, simbolo:'Sb', nombre:'Antimonio', grupo:15, periodo:5, radioAtomico:140, electronegatividad:2.05, energiaIonizacion:834, afinidadElectronica:-101.1, puntoFusion:630.6, categoria:'metaloide' },
  { Z:52, simbolo:'Te', nombre:'Telurio', grupo:16, periodo:5, radioAtomico:136, electronegatividad:2.1, energiaIonizacion:869, afinidadElectronica:-190.2, puntoFusion:449.5, categoria:'metaloide' },
  { Z:53, simbolo:'I', nombre:'Yodo', grupo:17, periodo:5, radioAtomico:133, electronegatividad:2.66, energiaIonizacion:1008, afinidadElectronica:-295.2, puntoFusion:113.7, categoria:'halógeno' },
  { Z:54, simbolo:'Xe', nombre:'Xenón', grupo:18, periodo:5, radioAtomico:131, electronegatividad:2.6, energiaIonizacion:1170, afinidadElectronica:0, puntoFusion:-111.8, categoria:'gas-noble' },
  // Período 6
  { Z:55, simbolo:'Cs', nombre:'Cesio', grupo:1, periodo:6, radioAtomico:232, electronegatividad:0.79, energiaIonizacion:376, afinidadElectronica:-45.5, puntoFusion:28.4, categoria:'metal-alcalino' },
  { Z:56, simbolo:'Ba', nombre:'Bario', grupo:2, periodo:6, radioAtomico:196, electronegatividad:0.89, energiaIonizacion:503, afinidadElectronica:-14, puntoFusion:727, categoria:'metal-alcalinoterreo' },
  // Lantánidos
  { Z:57, simbolo:'La', nombre:'Lantano', grupo:null, periodo:6, radioAtomico:180, electronegatividad:1.1, energiaIonizacion:538, afinidadElectronica:-53.8, puntoFusion:920, categoria:'lantanido' },
  { Z:58, simbolo:'Ce', nombre:'Cerio', grupo:null, periodo:6, radioAtomico:163, electronegatividad:1.12, energiaIonizacion:534, afinidadElectronica:-57.9, puntoFusion:798, categoria:'lantanido' },
  { Z:59, simbolo:'Pr', nombre:'Praseodimio', grupo:null, periodo:6, radioAtomico:176, electronegatividad:1.13, energiaIonizacion:527, afinidadElectronica:-10.5, puntoFusion:931, categoria:'lantanido' },
  { Z:60, simbolo:'Nd', nombre:'Neodimio', grupo:null, periodo:6, radioAtomico:174, electronegatividad:1.14, energiaIonizacion:533, afinidadElectronica:-9.4, puntoFusion:1021, categoria:'lantanido' },
  { Z:61, simbolo:'Pm', nombre:'Prometio', grupo:null, periodo:6, radioAtomico:173, electronegatividad:1.1, energiaIonizacion:540, afinidadElectronica:null, puntoFusion:1042, categoria:'lantanido' },
  { Z:62, simbolo:'Sm', nombre:'Samario', grupo:null, periodo:6, radioAtomico:172, electronegatividad:1.17, energiaIonizacion:545, afinidadElectronica:null, puntoFusion:1074, categoria:'lantanido' },
  { Z:63, simbolo:'Eu', nombre:'Europio', grupo:null, periodo:6, radioAtomico:168, electronegatividad:1.1, energiaIonizacion:547, afinidadElectronica:-11.2, puntoFusion:822, categoria:'lantanido' },
  { Z:64, simbolo:'Gd', nombre:'Gadolinio', grupo:null, periodo:6, radioAtomico:169, electronegatividad:1.2, energiaIonizacion:593, afinidadElectronica:-20.5, puntoFusion:1313, categoria:'lantanido' },
  { Z:65, simbolo:'Tb', nombre:'Terbio', grupo:null, periodo:6, radioAtomico:168, electronegatividad:1.1, energiaIonizacion:566, afinidadElectronica:-12.7, puntoFusion:1356, categoria:'lantanido' },
  { Z:66, simbolo:'Dy', nombre:'Disprosio', grupo:null, periodo:6, radioAtomico:167, electronegatividad:1.22, energiaIonizacion:573, afinidadElectronica:-1.4, puntoFusion:1412, categoria:'lantanido' },
  { Z:67, simbolo:'Ho', nombre:'Holmio', grupo:null, periodo:6, radioAtomico:166, electronegatividad:1.23, energiaIonizacion:581, afinidadElectronica:null, puntoFusion:1474, categoria:'lantanido' },
  { Z:68, simbolo:'Er', nombre:'Erbio', grupo:null, periodo:6, radioAtomico:165, electronegatividad:1.24, energiaIonizacion:589, afinidadElectronica:null, puntoFusion:1529, categoria:'lantanido' },
  { Z:69, simbolo:'Tm', nombre:'Tulio', grupo:null, periodo:6, radioAtomico:164, electronegatividad:1.25, energiaIonizacion:597, afinidadElectronica:-99, puntoFusion:1545, categoria:'lantanido' },
  { Z:70, simbolo:'Yb', nombre:'Iterbio', grupo:null, periodo:6, radioAtomico:170, electronegatividad:1.1, energiaIonizacion:603, afinidadElectronica:0, puntoFusion:819, categoria:'lantanido' },
  { Z:71, simbolo:'Lu', nombre:'Lutecio', grupo:null, periodo:6, radioAtomico:162, electronegatividad:1.27, energiaIonizacion:524, afinidadElectronica:-23, puntoFusion:1663, categoria:'lantanido' },
  // Transición período 6
  { Z:72, simbolo:'Hf', nombre:'Hafnio', grupo:4, periodo:6, radioAtomico:152, electronegatividad:1.3, energiaIonizacion:658, afinidadElectronica:-17.2, puntoFusion:2233, categoria:'metal-transicion' },
  { Z:73, simbolo:'Ta', nombre:'Tántalo', grupo:5, periodo:6, radioAtomico:146, electronegatividad:1.5, energiaIonizacion:761, afinidadElectronica:-31.7, puntoFusion:3017, categoria:'metal-transicion' },
  { Z:74, simbolo:'W', nombre:'Wolframio', grupo:6, periodo:6, radioAtomico:137, electronegatividad:2.36, energiaIonizacion:770, afinidadElectronica:-78.8, puntoFusion:3422, categoria:'metal-transicion' },
  { Z:75, simbolo:'Re', nombre:'Renio', grupo:7, periodo:6, radioAtomico:131, electronegatividad:1.9, energiaIonizacion:760, afinidadElectronica:-5.8, puntoFusion:3186, categoria:'metal-transicion' },
  { Z:76, simbolo:'Os', nombre:'Osmio', grupo:8, periodo:6, radioAtomico:129, electronegatividad:2.2, energiaIonizacion:840, afinidadElectronica:-104, puntoFusion:3033, categoria:'metal-transicion' },
  { Z:77, simbolo:'Ir', nombre:'Iridio', grupo:9, periodo:6, radioAtomico:122, electronegatividad:2.2, energiaIonizacion:880, afinidadElectronica:-150.9, puntoFusion:2446, categoria:'metal-transicion' },
  { Z:78, simbolo:'Pt', nombre:'Platino', grupo:10, periodo:6, radioAtomico:123, electronegatividad:2.28, energiaIonizacion:870, afinidadElectronica:-205, puntoFusion:1768.3, categoria:'metal-transicion' },
  { Z:79, simbolo:'Au', nombre:'Oro', grupo:11, periodo:6, radioAtomico:124, electronegatividad:2.54, energiaIonizacion:890, afinidadElectronica:-222.7, puntoFusion:1064.2, categoria:'metal-transicion' },
  { Z:80, simbolo:'Hg', nombre:'Mercurio', grupo:12, periodo:6, radioAtomico:133, electronegatividad:2, energiaIonizacion:1007, afinidadElectronica:0, puntoFusion:-38.8, categoria:'metal-transicion' },
  { Z:81, simbolo:'Tl', nombre:'Talio', grupo:13, periodo:6, radioAtomico:144, electronegatividad:1.62, energiaIonizacion:589, afinidadElectronica:-30.9, puntoFusion:304, categoria:'metal-postransicion' },
  { Z:82, simbolo:'Pb', nombre:'Plomo', grupo:14, periodo:6, radioAtomico:144, electronegatividad:2.33, energiaIonizacion:716, afinidadElectronica:-34.4, puntoFusion:327.5, categoria:'metal-postransicion' },
  { Z:83, simbolo:'Bi', nombre:'Bismuto', grupo:15, periodo:6, radioAtomico:151, electronegatividad:2.02, energiaIonizacion:703, afinidadElectronica:-90.9, puntoFusion:271.4, categoria:'metal-postransicion' },
  { Z:84, simbolo:'Po', nombre:'Polonio', grupo:16, periodo:6, radioAtomico:145, electronegatividad:2, energiaIonizacion:812, afinidadElectronica:null, puntoFusion:254, categoria:'metaloide' },
  { Z:85, simbolo:'At', nombre:'Astato', grupo:17, periodo:6, radioAtomico:147, electronegatividad:2.2, energiaIonizacion:899, afinidadElectronica:-233.1, puntoFusion:302, categoria:'halógeno' },
  { Z:86, simbolo:'Rn', nombre:'Radón', grupo:18, periodo:6, radioAtomico:142, electronegatividad:null, energiaIonizacion:1037, afinidadElectronica:0, puntoFusion:-71, categoria:'gas-noble' },
  // Período 7
  { Z:87, simbolo:'Fr', nombre:'Francio', grupo:1, periodo:7, radioAtomico:223, electronegatividad:0.7, energiaIonizacion:393, afinidadElectronica:null, puntoFusion:27, categoria:'metal-alcalino' },
  { Z:88, simbolo:'Ra', nombre:'Radio', grupo:2, periodo:7, radioAtomico:201, electronegatividad:0.9, energiaIonizacion:509, afinidadElectronica:null, puntoFusion:700, categoria:'metal-alcalinoterreo' },
  // Actínidos
  { Z:89, simbolo:'Ac', nombre:'Actinio', grupo:null, periodo:7, radioAtomico:186, electronegatividad:1.1, energiaIonizacion:499, afinidadElectronica:null, puntoFusion:1051, categoria:'actinido' },
  { Z:90, simbolo:'Th', nombre:'Torio', grupo:null, periodo:7, radioAtomico:175, electronegatividad:1.3, energiaIonizacion:587, afinidadElectronica:-58.6, puntoFusion:1750, categoria:'actinido' },
  { Z:91, simbolo:'Pa', nombre:'Protactinio', grupo:null, periodo:7, radioAtomico:169, electronegatividad:1.5, energiaIonizacion:568, afinidadElectronica:null, puntoFusion:1572, categoria:'actinido' },
  { Z:92, simbolo:'U', nombre:'Uranio', grupo:null, periodo:7, radioAtomico:170, electronegatividad:1.38, energiaIonizacion:598, afinidadElectronica:-30.4, puntoFusion:1135, categoria:'actinido' },
  { Z:93, simbolo:'Np', nombre:'Neptunio', grupo:null, periodo:7, radioAtomico:171, electronegatividad:1.36, energiaIonizacion:605, afinidadElectronica:null, puntoFusion:644, categoria:'actinido' },
  { Z:94, simbolo:'Pu', nombre:'Plutonio', grupo:null, periodo:7, radioAtomico:172, electronegatividad:1.28, energiaIonizacion:585, afinidadElectronica:null, puntoFusion:640, categoria:'actinido' },
  { Z:95, simbolo:'Am', nombre:'Americio', grupo:null, periodo:7, radioAtomico:166, electronegatividad:1.3, energiaIonizacion:578, afinidadElectronica:null, puntoFusion:1176, categoria:'actinido' },
  { Z:96, simbolo:'Cm', nombre:'Curio', grupo:null, periodo:7, radioAtomico:166, electronegatividad:1.3, energiaIonizacion:581, afinidadElectronica:null, puntoFusion:1345, categoria:'actinido' },
  { Z:97, simbolo:'Bk', nombre:'Berkelio', grupo:null, periodo:7, radioAtomico:168, electronegatividad:1.3, energiaIonizacion:601, afinidadElectronica:null, puntoFusion:986, categoria:'actinido' },
  { Z:98, simbolo:'Cf', nombre:'Californio', grupo:null, periodo:7, radioAtomico:168, electronegatividad:1.3, energiaIonizacion:608, afinidadElectronica:null, puntoFusion:900, categoria:'actinido' },
  { Z:99, simbolo:'Es', nombre:'Einstenio', grupo:null, periodo:7, radioAtomico:165, electronegatividad:1.3, energiaIonizacion:619, afinidadElectronica:null, puntoFusion:860, categoria:'actinido' },
  { Z:100, simbolo:'Fm', nombre:'Fermio', grupo:null, periodo:7, radioAtomico:167, electronegatividad:1.3, energiaIonizacion:629, afinidadElectronica:null, puntoFusion:1527, categoria:'actinido' },
  { Z:101, simbolo:'Md', nombre:'Mendelevio', grupo:null, periodo:7, radioAtomico:173, electronegatividad:1.3, energiaIonizacion:636, afinidadElectronica:null, puntoFusion:827, categoria:'actinido' },
  { Z:102, simbolo:'No', nombre:'Nobelio', grupo:null, periodo:7, radioAtomico:176, electronegatividad:1.3, energiaIonizacion:639, afinidadElectronica:null, puntoFusion:827, categoria:'actinido' },
  { Z:103, simbolo:'Lr', nombre:'Lawrencio', grupo:null, periodo:7, radioAtomico:161, electronegatividad:null, energiaIonizacion:479, afinidadElectronica:null, puntoFusion:1627, categoria:'actinido' },
  // Transición período 7
  { Z:104, simbolo:'Rf', nombre:'Rutherfordio', grupo:4, periodo:7, radioAtomico:157, electronegatividad:null, energiaIonizacion:580, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:105, simbolo:'Db', nombre:'Dubnio', grupo:5, periodo:7, radioAtomico:149, electronegatividad:null, energiaIonizacion:665, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:106, simbolo:'Sg', nombre:'Seaborgio', grupo:6, periodo:7, radioAtomico:143, electronegatividad:null, energiaIonizacion:757, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:107, simbolo:'Bh', nombre:'Bohrio', grupo:7, periodo:7, radioAtomico:141, electronegatividad:null, energiaIonizacion:740, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:108, simbolo:'Hs', nombre:'Hasio', grupo:8, periodo:7, radioAtomico:134, electronegatividad:null, energiaIonizacion:730, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:109, simbolo:'Mt', nombre:'Meitnerio', grupo:9, periodo:7, radioAtomico:129, electronegatividad:null, energiaIonizacion:800, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:110, simbolo:'Ds', nombre:'Darmstatio', grupo:10, periodo:7, radioAtomico:128, electronegatividad:null, energiaIonizacion:960, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:111, simbolo:'Rg', nombre:'Roentgenio', grupo:11, periodo:7, radioAtomico:121, electronegatividad:null, energiaIonizacion:1020, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:112, simbolo:'Cn', nombre:'Copernicio', grupo:12, periodo:7, radioAtomico:122, electronegatividad:null, energiaIonizacion:1155, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:113, simbolo:'Nh', nombre:'Nihonio', grupo:13, periodo:7, radioAtomico:136, electronegatividad:null, energiaIonizacion:707, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:114, simbolo:'Fl', nombre:'Flerovio', grupo:14, periodo:7, radioAtomico:143, electronegatividad:null, energiaIonizacion:832, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:115, simbolo:'Mc', nombre:'Moscovio', grupo:15, periodo:7, radioAtomico:162, electronegatividad:null, energiaIonizacion:538, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:116, simbolo:'Lv', nombre:'Livermorio', grupo:16, periodo:7, radioAtomico:175, electronegatividad:null, energiaIonizacion:663, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:117, simbolo:'Ts', nombre:'Teneso', grupo:17, periodo:7, radioAtomico:165, electronegatividad:null, energiaIonizacion:736, afinidadElectronica:null, puntoFusion:null, categoria:'halógeno' },
  { Z:118, simbolo:'Og', nombre:'Oganesón', grupo:18, periodo:7, radioAtomico:157, electronegatividad:null, energiaIonizacion:860, afinidadElectronica:null, puntoFusion:null, categoria:'gas-noble' },
];

/**
 * Elementos cuyo anión no es estable (afinidad electrónica ≤ 0 en el convenio físico). Su
 * valor en la tabla es 0 salvo el N (+6,8 kJ/mol medidos); se rotulan como tales en vez de
 * con el antiguo «0 (noble/metal d¹⁰)», que no describía ni al N, ni al Be, ni al Mg, ni al Mn.
 */
export const ANION_NO_ESTABLE: ReadonlySet<number> = new Set([2, 4, 7, 10, 12, 18, 25, 30, 36, 48, 54, 70, 80, 86]);

/** 1.ª energía de ionización calculada, no medida. */
export const IONIZACION_CALCULADA: ReadonlySet<number> = new Set(
  Array.from({ length: 15 }, (_, i) => 104 + i),
);

/** Punto de fusión estimado o predicho (el CRC los tabula, pero no hay medida directa). */
export const FUSION_ESTIMADA: ReadonlySet<number> = new Set([87, 100, 101, 102, 103]);

/** Notas de fusión que el número solo no cuenta (presión distinta de 1 atm, sublimación). */
export const NOTAS_FUSION: Readonly<Record<number, string>> = {
  2: 'No solidifica a 1 atm: el dato es a 2,5 MPa',
  6: 'No funde a 1 atm: sublima (punto triple a 4489 °C y 10,3 MPa)',
  33: 'Sublima a 1 atm; el dato es su punto triple, a 3,7 MPa',
};
