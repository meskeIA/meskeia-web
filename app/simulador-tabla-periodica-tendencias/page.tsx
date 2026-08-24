'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef } from 'react';
import styles from './SimuladorTablaPeriodica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================================
// TIPOS
// ============================================================
interface Elemento {
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

type PropiedadKey = 'radioAtomico' | 'electronegatividad' | 'energiaIonizacion' | 'afinidadElectronica' | 'puntoFusion';

interface PropiedadInfo {
  key: PropiedadKey;
  label: string;
  unidad: string;
  descripcion: string;
  flechaGrupo: string;   // dirección de aumento en grupo (↑/↓)
  flechaPeriodo: string; // dirección de aumento en período (←/→)
  textoGrupo: string;
  textoPeriodo: string;
}

// ============================================================
// DATOS: 118 ELEMENTOS
// ============================================================
const ELEMENTOS: Elemento[] = [
  // Período 1
  { Z:1, simbolo:'H', nombre:'Hidrógeno', grupo:1, periodo:1, radioAtomico:53, electronegatividad:2.20, energiaIonizacion:1312, afinidadElectronica:-72.8, puntoFusion:-259.1, categoria:'no-metal' },
  { Z:2, simbolo:'He', nombre:'Helio', grupo:18, periodo:1, radioAtomico:31, electronegatividad:null, energiaIonizacion:2372, afinidadElectronica:0, puntoFusion:-272.2, categoria:'gas-noble' },
  // Período 2
  { Z:3, simbolo:'Li', nombre:'Litio', grupo:1, periodo:2, radioAtomico:167, electronegatividad:0.98, energiaIonizacion:520, afinidadElectronica:-59.6, puntoFusion:180.5, categoria:'metal-alcalino' },
  { Z:4, simbolo:'Be', nombre:'Berilio', grupo:2, periodo:2, radioAtomico:112, electronegatividad:1.57, energiaIonizacion:900, afinidadElectronica:0, puntoFusion:1287, categoria:'metal-alcalinoterreo' },
  { Z:5, simbolo:'B', nombre:'Boro', grupo:13, periodo:2, radioAtomico:87, electronegatividad:2.04, energiaIonizacion:801, afinidadElectronica:-26.7, puntoFusion:2075, categoria:'metaloide' },
  { Z:6, simbolo:'C', nombre:'Carbono', grupo:14, periodo:2, radioAtomico:67, electronegatividad:2.55, energiaIonizacion:1086, afinidadElectronica:-121.8, puntoFusion:3550, categoria:'no-metal' },
  { Z:7, simbolo:'N', nombre:'Nitrógeno', grupo:15, periodo:2, radioAtomico:56, electronegatividad:3.04, energiaIonizacion:1402, afinidadElectronica:0, puntoFusion:-210, categoria:'no-metal' },
  { Z:8, simbolo:'O', nombre:'Oxígeno', grupo:16, periodo:2, radioAtomico:48, electronegatividad:3.44, energiaIonizacion:1314, afinidadElectronica:-141, puntoFusion:-218.8, categoria:'no-metal' },
  { Z:9, simbolo:'F', nombre:'Flúor', grupo:17, periodo:2, radioAtomico:42, electronegatividad:3.98, energiaIonizacion:1681, afinidadElectronica:-328, puntoFusion:-219.6, categoria:'halógeno' },
  { Z:10, simbolo:'Ne', nombre:'Neón', grupo:18, periodo:2, radioAtomico:38, electronegatividad:null, energiaIonizacion:2081, afinidadElectronica:0, puntoFusion:-248.6, categoria:'gas-noble' },
  // Período 3
  { Z:11, simbolo:'Na', nombre:'Sodio', grupo:1, periodo:3, radioAtomico:190, electronegatividad:0.93, energiaIonizacion:496, afinidadElectronica:-52.8, puntoFusion:97.8, categoria:'metal-alcalino' },
  { Z:12, simbolo:'Mg', nombre:'Magnesio', grupo:2, periodo:3, radioAtomico:145, electronegatividad:1.31, energiaIonizacion:738, afinidadElectronica:0, puntoFusion:650, categoria:'metal-alcalinoterreo' },
  { Z:13, simbolo:'Al', nombre:'Aluminio', grupo:13, periodo:3, radioAtomico:118, electronegatividad:1.61, energiaIonizacion:577, afinidadElectronica:-42.5, puntoFusion:660.3, categoria:'metal-postransicion' },
  { Z:14, simbolo:'Si', nombre:'Silicio', grupo:14, periodo:3, radioAtomico:111, electronegatividad:1.90, energiaIonizacion:786, afinidadElectronica:-133.6, puntoFusion:1414, categoria:'metaloide' },
  { Z:15, simbolo:'P', nombre:'Fósforo', grupo:15, periodo:3, radioAtomico:98, electronegatividad:2.19, energiaIonizacion:1012, afinidadElectronica:-72, puntoFusion:44.2, categoria:'no-metal' },
  { Z:16, simbolo:'S', nombre:'Azufre', grupo:16, periodo:3, radioAtomico:88, electronegatividad:2.58, energiaIonizacion:1000, afinidadElectronica:-200.4, puntoFusion:112.8, categoria:'no-metal' },
  { Z:17, simbolo:'Cl', nombre:'Cloro', grupo:17, periodo:3, radioAtomico:79, electronegatividad:3.16, energiaIonizacion:1251, afinidadElectronica:-348.6, puntoFusion:-101.5, categoria:'halógeno' },
  { Z:18, simbolo:'Ar', nombre:'Argón', grupo:18, periodo:3, radioAtomico:71, electronegatividad:null, energiaIonizacion:1521, afinidadElectronica:0, puntoFusion:-189.4, categoria:'gas-noble' },
  // Período 4
  { Z:19, simbolo:'K', nombre:'Potasio', grupo:1, periodo:4, radioAtomico:243, electronegatividad:0.82, energiaIonizacion:419, afinidadElectronica:-48.4, puntoFusion:63.4, categoria:'metal-alcalino' },
  { Z:20, simbolo:'Ca', nombre:'Calcio', grupo:2, periodo:4, radioAtomico:194, electronegatividad:1.00, energiaIonizacion:590, afinidadElectronica:-2.4, puntoFusion:842, categoria:'metal-alcalinoterreo' },
  { Z:21, simbolo:'Sc', nombre:'Escandio', grupo:3, periodo:4, radioAtomico:184, electronegatividad:1.36, energiaIonizacion:633, afinidadElectronica:-18.1, puntoFusion:1541, categoria:'metal-transicion' },
  { Z:22, simbolo:'Ti', nombre:'Titanio', grupo:4, periodo:4, radioAtomico:176, electronegatividad:1.54, energiaIonizacion:658, afinidadElectronica:-7.6, puntoFusion:1668, categoria:'metal-transicion' },
  { Z:23, simbolo:'V', nombre:'Vanadio', grupo:5, periodo:4, radioAtomico:171, electronegatividad:1.63, energiaIonizacion:650, afinidadElectronica:-50.6, puntoFusion:1910, categoria:'metal-transicion' },
  { Z:24, simbolo:'Cr', nombre:'Cromo', grupo:6, periodo:4, radioAtomico:166, electronegatividad:1.66, energiaIonizacion:653, afinidadElectronica:-64.3, puntoFusion:1907, categoria:'metal-transicion' },
  { Z:25, simbolo:'Mn', nombre:'Manganeso', grupo:7, periodo:4, radioAtomico:161, electronegatividad:1.55, energiaIonizacion:717, afinidadElectronica:0, puntoFusion:1246, categoria:'metal-transicion' },
  { Z:26, simbolo:'Fe', nombre:'Hierro', grupo:8, periodo:4, radioAtomico:156, electronegatividad:1.83, energiaIonizacion:762, afinidadElectronica:-15.7, puntoFusion:1538, categoria:'metal-transicion' },
  { Z:27, simbolo:'Co', nombre:'Cobalto', grupo:9, periodo:4, radioAtomico:152, electronegatividad:1.88, energiaIonizacion:760, afinidadElectronica:-63.7, puntoFusion:1495, categoria:'metal-transicion' },
  { Z:28, simbolo:'Ni', nombre:'Níquel', grupo:10, periodo:4, radioAtomico:149, electronegatividad:1.91, energiaIonizacion:737, afinidadElectronica:-111.5, puntoFusion:1455, categoria:'metal-transicion' },
  { Z:29, simbolo:'Cu', nombre:'Cobre', grupo:11, periodo:4, radioAtomico:145, electronegatividad:1.90, energiaIonizacion:745, afinidadElectronica:-118.4, puntoFusion:1084.6, categoria:'metal-transicion' },
  { Z:30, simbolo:'Zn', nombre:'Zinc', grupo:12, periodo:4, radioAtomico:142, electronegatividad:1.65, energiaIonizacion:906, afinidadElectronica:0, puntoFusion:419.5, categoria:'metal-transicion' },
  { Z:31, simbolo:'Ga', nombre:'Galio', grupo:13, periodo:4, radioAtomico:136, electronegatividad:1.81, energiaIonizacion:579, afinidadElectronica:-28.9, puntoFusion:29.8, categoria:'metal-postransicion' },
  { Z:32, simbolo:'Ge', nombre:'Germanio', grupo:14, periodo:4, radioAtomico:125, electronegatividad:2.01, energiaIonizacion:762, afinidadElectronica:-119, puntoFusion:938.3, categoria:'metaloide' },
  { Z:33, simbolo:'As', nombre:'Arsénico', grupo:15, periodo:4, radioAtomico:114, electronegatividad:2.18, energiaIonizacion:947, afinidadElectronica:-78, puntoFusion:817, categoria:'metaloide' },
  { Z:34, simbolo:'Se', nombre:'Selenio', grupo:16, periodo:4, radioAtomico:103, electronegatividad:2.55, energiaIonizacion:941, afinidadElectronica:-195.1, puntoFusion:220.8, categoria:'no-metal' },
  { Z:35, simbolo:'Br', nombre:'Bromo', grupo:17, periodo:4, radioAtomico:94, electronegatividad:2.96, energiaIonizacion:1140, afinidadElectronica:-324.6, puntoFusion:-7.3, categoria:'halógeno' },
  { Z:36, simbolo:'Kr', nombre:'Kriptón', grupo:18, periodo:4, radioAtomico:88, electronegatividad:3.00, energiaIonizacion:1351, afinidadElectronica:0, puntoFusion:-157.4, categoria:'gas-noble' },
  // Período 5
  { Z:37, simbolo:'Rb', nombre:'Rubidio', grupo:1, periodo:5, radioAtomico:265, electronegatividad:0.82, energiaIonizacion:403, afinidadElectronica:-46.9, puntoFusion:39.3, categoria:'metal-alcalino' },
  { Z:38, simbolo:'Sr', nombre:'Estroncio', grupo:2, periodo:5, radioAtomico:219, electronegatividad:0.95, energiaIonizacion:550, afinidadElectronica:-5.0, puntoFusion:777, categoria:'metal-alcalinoterreo' },
  { Z:39, simbolo:'Y', nombre:'Itrio', grupo:3, periodo:5, radioAtomico:212, electronegatividad:1.22, energiaIonizacion:600, afinidadElectronica:-29.6, puntoFusion:1522, categoria:'metal-transicion' },
  { Z:40, simbolo:'Zr', nombre:'Circonio', grupo:4, periodo:5, radioAtomico:206, electronegatividad:1.33, energiaIonizacion:640, afinidadElectronica:-41.1, puntoFusion:1855, categoria:'metal-transicion' },
  { Z:41, simbolo:'Nb', nombre:'Niobio', grupo:5, periodo:5, radioAtomico:198, electronegatividad:1.6, energiaIonizacion:652, afinidadElectronica:-86.1, puntoFusion:2477, categoria:'metal-transicion' },
  { Z:42, simbolo:'Mo', nombre:'Molibdeno', grupo:6, periodo:5, radioAtomico:190, electronegatividad:2.16, energiaIonizacion:684, afinidadElectronica:-72.1, puntoFusion:2623, categoria:'metal-transicion' },
  { Z:43, simbolo:'Tc', nombre:'Tecnecio', grupo:7, periodo:5, radioAtomico:183, electronegatividad:1.9, energiaIonizacion:702, afinidadElectronica:-53, puntoFusion:2157, categoria:'metal-transicion' },
  { Z:44, simbolo:'Ru', nombre:'Rutenio', grupo:8, periodo:5, radioAtomico:178, electronegatividad:2.2, energiaIonizacion:711, afinidadElectronica:-101.3, puntoFusion:2334, categoria:'metal-transicion' },
  { Z:45, simbolo:'Rh', nombre:'Rodio', grupo:9, periodo:5, radioAtomico:173, electronegatividad:2.28, energiaIonizacion:720, afinidadElectronica:-109.7, puntoFusion:1964, categoria:'metal-transicion' },
  { Z:46, simbolo:'Pd', nombre:'Paladio', grupo:10, periodo:5, radioAtomico:169, electronegatividad:2.20, energiaIonizacion:805, afinidadElectronica:-53.7, puntoFusion:1555, categoria:'metal-transicion' },
  { Z:47, simbolo:'Ag', nombre:'Plata', grupo:11, periodo:5, radioAtomico:165, electronegatividad:1.93, energiaIonizacion:731, afinidadElectronica:-125.6, puntoFusion:961.8, categoria:'metal-transicion' },
  { Z:48, simbolo:'Cd', nombre:'Cadmio', grupo:12, periodo:5, radioAtomico:161, electronegatividad:1.69, energiaIonizacion:868, afinidadElectronica:0, puntoFusion:321.1, categoria:'metal-transicion' },
  { Z:49, simbolo:'In', nombre:'Indio', grupo:13, periodo:5, radioAtomico:156, electronegatividad:1.78, energiaIonizacion:558, afinidadElectronica:-28.9, puntoFusion:156.6, categoria:'metal-postransicion' },
  { Z:50, simbolo:'Sn', nombre:'Estaño', grupo:14, periodo:5, radioAtomico:145, electronegatividad:1.96, energiaIonizacion:709, afinidadElectronica:-107.3, puntoFusion:231.9, categoria:'metal-postransicion' },
  { Z:51, simbolo:'Sb', nombre:'Antimonio', grupo:15, periodo:5, radioAtomico:133, electronegatividad:2.05, energiaIonizacion:834, afinidadElectronica:-103.2, puntoFusion:630.6, categoria:'metaloide' },
  { Z:52, simbolo:'Te', nombre:'Telurio', grupo:16, periodo:5, radioAtomico:123, electronegatividad:2.1, energiaIonizacion:869, afinidadElectronica:-190.2, puntoFusion:449.5, categoria:'metaloide' },
  { Z:53, simbolo:'I', nombre:'Yodo', grupo:17, periodo:5, radioAtomico:115, electronegatividad:2.66, energiaIonizacion:1008, afinidadElectronica:-295.2, puntoFusion:113.7, categoria:'halógeno' },
  { Z:54, simbolo:'Xe', nombre:'Xenón', grupo:18, periodo:5, radioAtomico:108, electronegatividad:2.60, energiaIonizacion:1170, afinidadElectronica:0, puntoFusion:-111.8, categoria:'gas-noble' },
  // Período 6
  { Z:55, simbolo:'Cs', nombre:'Cesio', grupo:1, periodo:6, radioAtomico:298, electronegatividad:0.79, energiaIonizacion:376, afinidadElectronica:-45.5, puntoFusion:28.4, categoria:'metal-alcalino' },
  { Z:56, simbolo:'Ba', nombre:'Bario', grupo:2, periodo:6, radioAtomico:253, electronegatividad:0.89, energiaIonizacion:503, afinidadElectronica:-13.95, puntoFusion:727, categoria:'metal-alcalinoterreo' },
  // Lantánidos
  { Z:57, simbolo:'La', nombre:'Lantano', grupo:null, periodo:6, radioAtomico:247, electronegatividad:1.10, energiaIonizacion:538, afinidadElectronica:-48, puntoFusion:920, categoria:'lantanido' },
  { Z:58, simbolo:'Ce', nombre:'Cerio', grupo:null, periodo:6, radioAtomico:204, electronegatividad:1.12, energiaIonizacion:534, afinidadElectronica:-50, puntoFusion:798, categoria:'lantanido' },
  { Z:59, simbolo:'Pr', nombre:'Praseodimio', grupo:null, periodo:6, radioAtomico:247, electronegatividad:1.13, energiaIonizacion:527, afinidadElectronica:-50, puntoFusion:931, categoria:'lantanido' },
  { Z:60, simbolo:'Nd', nombre:'Neodimio', grupo:null, periodo:6, radioAtomico:206, electronegatividad:1.14, energiaIonizacion:533, afinidadElectronica:-50, puntoFusion:1021, categoria:'lantanido' },
  { Z:61, simbolo:'Pm', nombre:'Prometio', grupo:null, periodo:6, radioAtomico:205, electronegatividad:1.13, energiaIonizacion:540, afinidadElectronica:-50, puntoFusion:1042, categoria:'lantanido' },
  { Z:62, simbolo:'Sm', nombre:'Samario', grupo:null, periodo:6, radioAtomico:238, electronegatividad:1.17, energiaIonizacion:545, afinidadElectronica:-50, puntoFusion:1074, categoria:'lantanido' },
  { Z:63, simbolo:'Eu', nombre:'Europio', grupo:null, periodo:6, radioAtomico:231, electronegatividad:1.20, energiaIonizacion:547, afinidadElectronica:-50, puntoFusion:822, categoria:'lantanido' },
  { Z:64, simbolo:'Gd', nombre:'Gadolinio', grupo:null, periodo:6, radioAtomico:233, electronegatividad:1.20, energiaIonizacion:593, afinidadElectronica:-50, puntoFusion:1313, categoria:'lantanido' },
  { Z:65, simbolo:'Tb', nombre:'Terbio', grupo:null, periodo:6, radioAtomico:225, electronegatividad:1.20, energiaIonizacion:566, afinidadElectronica:-50, puntoFusion:1356, categoria:'lantanido' },
  { Z:66, simbolo:'Dy', nombre:'Disprosio', grupo:null, periodo:6, radioAtomico:228, electronegatividad:1.22, energiaIonizacion:573, afinidadElectronica:-50, puntoFusion:1412, categoria:'lantanido' },
  { Z:67, simbolo:'Ho', nombre:'Holmio', grupo:null, periodo:6, radioAtomico:226, electronegatividad:1.23, energiaIonizacion:581, afinidadElectronica:-50, puntoFusion:1474, categoria:'lantanido' },
  { Z:68, simbolo:'Er', nombre:'Erbio', grupo:null, periodo:6, radioAtomico:226, electronegatividad:1.24, energiaIonizacion:589, afinidadElectronica:-50, puntoFusion:1529, categoria:'lantanido' },
  { Z:69, simbolo:'Tm', nombre:'Tulio', grupo:null, periodo:6, radioAtomico:222, electronegatividad:1.25, energiaIonizacion:597, afinidadElectronica:-50, puntoFusion:1545, categoria:'lantanido' },
  { Z:70, simbolo:'Yb', nombre:'Iterbio', grupo:null, periodo:6, radioAtomico:222, electronegatividad:1.10, energiaIonizacion:603, afinidadElectronica:-50, puntoFusion:819, categoria:'lantanido' },
  { Z:71, simbolo:'Lu', nombre:'Lutecio', grupo:null, periodo:6, radioAtomico:217, electronegatividad:1.27, energiaIonizacion:524, afinidadElectronica:-50, puntoFusion:1663, categoria:'lantanido' },
  // Transición período 6
  { Z:72, simbolo:'Hf', nombre:'Hafnio', grupo:4, periodo:6, radioAtomico:208, electronegatividad:1.3, energiaIonizacion:658, afinidadElectronica:0, puntoFusion:2233, categoria:'metal-transicion' },
  { Z:73, simbolo:'Ta', nombre:'Tantalio', grupo:5, periodo:6, radioAtomico:200, electronegatividad:1.5, energiaIonizacion:761, afinidadElectronica:-31, puntoFusion:3017, categoria:'metal-transicion' },
  { Z:74, simbolo:'W', nombre:'Wolframio', grupo:6, periodo:6, radioAtomico:193, electronegatividad:2.36, energiaIonizacion:770, afinidadElectronica:-78.6, puntoFusion:3422, categoria:'metal-transicion' },
  { Z:75, simbolo:'Re', nombre:'Renio', grupo:7, periodo:6, radioAtomico:188, electronegatividad:1.9, energiaIonizacion:760, afinidadElectronica:-14.5, puntoFusion:3186, categoria:'metal-transicion' },
  { Z:76, simbolo:'Os', nombre:'Osmio', grupo:8, periodo:6, radioAtomico:185, electronegatividad:2.2, energiaIonizacion:840, afinidadElectronica:-106.1, puntoFusion:3033, categoria:'metal-transicion' },
  { Z:77, simbolo:'Ir', nombre:'Iridio', grupo:9, periodo:6, radioAtomico:180, electronegatividad:2.20, energiaIonizacion:880, afinidadElectronica:-151, puntoFusion:2446, categoria:'metal-transicion' },
  { Z:78, simbolo:'Pt', nombre:'Platino', grupo:10, periodo:6, radioAtomico:177, electronegatividad:2.28, energiaIonizacion:870, afinidadElectronica:-205.3, puntoFusion:1768.3, categoria:'metal-transicion' },
  { Z:79, simbolo:'Au', nombre:'Oro', grupo:11, periodo:6, radioAtomico:174, electronegatividad:2.54, energiaIonizacion:890, afinidadElectronica:-222.8, puntoFusion:1064.2, categoria:'metal-transicion' },
  { Z:80, simbolo:'Hg', nombre:'Mercurio', grupo:12, periodo:6, radioAtomico:171, electronegatividad:2.00, energiaIonizacion:1007, afinidadElectronica:0, puntoFusion:-38.8, categoria:'metal-transicion' },
  { Z:81, simbolo:'Tl', nombre:'Talio', grupo:13, periodo:6, radioAtomico:156, electronegatividad:1.62, energiaIonizacion:589, afinidadElectronica:-19.2, puntoFusion:304, categoria:'metal-postransicion' },
  { Z:82, simbolo:'Pb', nombre:'Plomo', grupo:14, periodo:6, radioAtomico:154, electronegatividad:2.33, energiaIonizacion:716, afinidadElectronica:-35.1, puntoFusion:327.5, categoria:'metal-postransicion' },
  { Z:83, simbolo:'Bi', nombre:'Bismuto', grupo:15, periodo:6, radioAtomico:143, electronegatividad:2.02, energiaIonizacion:703, afinidadElectronica:-91.2, puntoFusion:271.4, categoria:'metal-postransicion' },
  { Z:84, simbolo:'Po', nombre:'Polonio', grupo:16, periodo:6, radioAtomico:135, electronegatividad:2.0, energiaIonizacion:812, afinidadElectronica:-183.3, puntoFusion:254, categoria:'metaloide' },
  { Z:85, simbolo:'At', nombre:'Astato', grupo:17, periodo:6, radioAtomico:127, electronegatividad:2.2, energiaIonizacion:920, afinidadElectronica:-270.1, puntoFusion:302, categoria:'halógeno' },
  { Z:86, simbolo:'Rn', nombre:'Radón', grupo:18, periodo:6, radioAtomico:120, electronegatividad:null, energiaIonizacion:1037, afinidadElectronica:0, puntoFusion:-71, categoria:'gas-noble' },
  // Período 7
  { Z:87, simbolo:'Fr', nombre:'Francio', grupo:1, periodo:7, radioAtomico:348, electronegatividad:0.7, energiaIonizacion:393, afinidadElectronica:-44, puntoFusion:27, categoria:'metal-alcalino' },
  { Z:88, simbolo:'Ra', nombre:'Radio', grupo:2, periodo:7, radioAtomico:283, electronegatividad:0.9, energiaIonizacion:509, afinidadElectronica:-10, puntoFusion:700, categoria:'metal-alcalinoterreo' },
  // Actínidos
  { Z:89, simbolo:'Ac', nombre:'Actinio', grupo:null, periodo:7, radioAtomico:260, electronegatividad:1.1, energiaIonizacion:499, afinidadElectronica:-34, puntoFusion:1051, categoria:'actinido' },
  { Z:90, simbolo:'Th', nombre:'Torio', grupo:null, periodo:7, radioAtomico:237, electronegatividad:1.3, energiaIonizacion:587, afinidadElectronica:-112, puntoFusion:1750, categoria:'actinido' },
  { Z:91, simbolo:'Pa', nombre:'Protactinio', grupo:null, periodo:7, radioAtomico:243, electronegatividad:1.5, energiaIonizacion:568, afinidadElectronica:-53, puntoFusion:1572, categoria:'actinido' },
  { Z:92, simbolo:'U', nombre:'Uranio', grupo:null, periodo:7, radioAtomico:240, electronegatividad:1.38, energiaIonizacion:598, afinidadElectronica:-50.5, puntoFusion:1135, categoria:'actinido' },
  { Z:93, simbolo:'Np', nombre:'Neptunio', grupo:null, periodo:7, radioAtomico:221, electronegatividad:1.36, energiaIonizacion:605, afinidadElectronica:-45.9, puntoFusion:644, categoria:'actinido' },
  { Z:94, simbolo:'Pu', nombre:'Plutonio', grupo:null, periodo:7, radioAtomico:243, electronegatividad:1.28, energiaIonizacion:585, afinidadElectronica:-10, puntoFusion:640, categoria:'actinido' },
  { Z:95, simbolo:'Am', nombre:'Americio', grupo:null, periodo:7, radioAtomico:244, electronegatividad:1.3, energiaIonizacion:578, afinidadElectronica:-10, puntoFusion:1176, categoria:'actinido' },
  { Z:96, simbolo:'Cm', nombre:'Curio', grupo:null, periodo:7, radioAtomico:245, electronegatividad:1.3, energiaIonizacion:581, afinidadElectronica:-10, puntoFusion:1345, categoria:'actinido' },
  { Z:97, simbolo:'Bk', nombre:'Berkelio', grupo:null, periodo:7, radioAtomico:244, electronegatividad:1.3, energiaIonizacion:601, afinidadElectronica:-10, puntoFusion:986, categoria:'actinido' },
  { Z:98, simbolo:'Cf', nombre:'Californio', grupo:null, periodo:7, radioAtomico:245, electronegatividad:1.3, energiaIonizacion:608, afinidadElectronica:-10, puntoFusion:900, categoria:'actinido' },
  { Z:99, simbolo:'Es', nombre:'Einsteinio', grupo:null, periodo:7, radioAtomico:245, electronegatividad:1.3, energiaIonizacion:619, afinidadElectronica:-10, puntoFusion:860, categoria:'actinido' },
  { Z:100, simbolo:'Fm', nombre:'Fermio', grupo:null, periodo:7, radioAtomico:245, electronegatividad:1.3, energiaIonizacion:627, afinidadElectronica:-10, puntoFusion:1527, categoria:'actinido' },
  { Z:101, simbolo:'Md', nombre:'Mendelevio', grupo:null, periodo:7, radioAtomico:246, electronegatividad:1.3, energiaIonizacion:635, afinidadElectronica:-10, puntoFusion:827, categoria:'actinido' },
  { Z:102, simbolo:'No', nombre:'Nobelio', grupo:null, periodo:7, radioAtomico:246, electronegatividad:1.3, energiaIonizacion:642, afinidadElectronica:-10, puntoFusion:827, categoria:'actinido' },
  { Z:103, simbolo:'Lr', nombre:'Lawrencio', grupo:null, periodo:7, radioAtomico:246, electronegatividad:1.3, energiaIonizacion:470, afinidadElectronica:-10, puntoFusion:1627, categoria:'actinido' },
  // Transición período 7
  { Z:104, simbolo:'Rf', nombre:'Rutherfordio', grupo:4, periodo:7, radioAtomico:157, electronegatividad:null, energiaIonizacion:580, afinidadElectronica:null, puntoFusion:2100, categoria:'metal-transicion' },
  { Z:105, simbolo:'Db', nombre:'Dubnio', grupo:5, periodo:7, radioAtomico:149, electronegatividad:null, energiaIonizacion:664, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:106, simbolo:'Sg', nombre:'Seaborgio', grupo:6, periodo:7, radioAtomico:143, electronegatividad:null, energiaIonizacion:757, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:107, simbolo:'Bh', nombre:'Bohrio', grupo:7, periodo:7, radioAtomico:141, electronegatividad:null, energiaIonizacion:740, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:108, simbolo:'Hs', nombre:'Hasio', grupo:8, periodo:7, radioAtomico:134, electronegatividad:null, energiaIonizacion:730, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:109, simbolo:'Mt', nombre:'Meitnerio', grupo:9, periodo:7, radioAtomico:129, electronegatividad:null, energiaIonizacion:800, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:110, simbolo:'Ds', nombre:'Darmstadtio', grupo:10, periodo:7, radioAtomico:128, electronegatividad:null, energiaIonizacion:960, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:111, simbolo:'Rg', nombre:'Roentgenio', grupo:11, periodo:7, radioAtomico:121, electronegatividad:null, energiaIonizacion:1020, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:112, simbolo:'Cn', nombre:'Copernicio', grupo:12, periodo:7, radioAtomico:122, electronegatividad:null, energiaIonizacion:1155, afinidadElectronica:null, puntoFusion:null, categoria:'metal-transicion' },
  { Z:113, simbolo:'Nh', nombre:'Nihonio', grupo:13, periodo:7, radioAtomico:136, electronegatividad:null, energiaIonizacion:707, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:114, simbolo:'Fl', nombre:'Flerovio', grupo:14, periodo:7, radioAtomico:143, electronegatividad:null, energiaIonizacion:832, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:115, simbolo:'Mc', nombre:'Moscovio', grupo:15, periodo:7, radioAtomico:162, electronegatividad:null, energiaIonizacion:538, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:116, simbolo:'Lv', nombre:'Livermorio', grupo:16, periodo:7, radioAtomico:175, electronegatividad:null, energiaIonizacion:663, afinidadElectronica:null, puntoFusion:null, categoria:'metal-postransicion' },
  { Z:117, simbolo:'Ts', nombre:'Teneso', grupo:17, periodo:7, radioAtomico:165, electronegatividad:null, energiaIonizacion:736, afinidadElectronica:null, puntoFusion:null, categoria:'halógeno' },
  { Z:118, simbolo:'Og', nombre:'Oganesón', grupo:18, periodo:7, radioAtomico:157, electronegatividad:null, energiaIonizacion:860, afinidadElectronica:null, puntoFusion:null, categoria:'gas-noble' },
];

// ============================================================
// PROPIEDADES SELECCIONABLES
// ============================================================
const PROPIEDADES: PropiedadInfo[] = [
  {
    key: 'radioAtomico',
    label: 'Radio atómico',
    unidad: 'pm',
    descripcion: 'Distancia desde el núcleo al orbital más externo',
    flechaGrupo: '↓',
    flechaPeriodo: '←',
    textoGrupo: 'aumenta al bajar en el grupo',
    textoPeriodo: 'aumenta hacia la izquierda del período',
  },
  {
    key: 'electronegatividad',
    label: 'Electronegatividad',
    unidad: '(Pauling)',
    descripcion: 'Capacidad de un átomo de atraer electrones del enlace',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'aumenta al subir en el grupo',
    textoPeriodo: 'aumenta hacia la derecha del período',
  },
  {
    key: 'energiaIonizacion',
    label: '1ª Energía ionización',
    unidad: 'kJ/mol',
    descripcion: 'Energía necesaria para arrancar el primer electrón',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'aumenta al subir en el grupo',
    textoPeriodo: 'aumenta hacia la derecha (con excepciones)',
  },
  {
    key: 'afinidadElectronica',
    label: 'Afinidad electrónica',
    unidad: 'kJ/mol',
    descripcion: 'Energía liberada al ganar un electrón (más negativo = más favorable)',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'más exotérmica al subir en el grupo',
    textoPeriodo: 'tendencia irregular, máxima en halógenos',
  },
  {
    key: 'puntoFusion',
    label: 'Punto de fusión',
    unidad: '°C',
    descripcion: 'Temperatura a la que el sólido pasa a líquido',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'máximo en metales de transición centrales',
    textoPeriodo: 'tendencia irregular según tipo de enlace',
  },
];

// ============================================================
// UTILIDADES
// ============================================================

/** Calcula el rango [min, max] de una propiedad sobre todos los elementos con valor no nulo */
function calcularRango(propiedad: PropiedadKey): { min: number; max: number } {
  const valores = ELEMENTOS
    .map(e => e[propiedad] as number | null)
    .filter((v): v is number => v !== null);
  return { min: Math.min(...valores), max: Math.max(...valores) };
}

/** Interpola un color azul→amarillo→rojo según t ∈ [0,1] */
function interpolarColor(t: number): string {
  const r = Math.round(t < 0.5 ? t * 2 * 255 : 255);
  const g = Math.round(t < 0.5 ? t * 2 * 200 : (1 - t) * 2 * 200);
  const b = Math.round(t < 0.5 ? 255 : (1 - t) * 2 * 255);
  return `rgb(${r},${g},${b})`;
}

/** Convierte valor numérico a color del heatmap */
function valorAColor(valor: number | null, min: number, max: number): string {
  if (valor === null) return '#d4d4d4';
  if (max === min) return interpolarColor(0.5);
  const t = Math.max(0, Math.min(1, (valor - min) / (max - min)));
  return interpolarColor(t);
}

/** Determina si el texto debe ser oscuro o claro según la luminancia de fondo */
function colorTexto(bgColor: string): string {
  if (bgColor === '#d4d4d4') return '#555555';
  // Extraer RGB de rgb(r,g,b)
  const m = bgColor.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return '#000';
  const r = parseInt(m[1]);
  const g = parseInt(m[2]);
  const b = parseInt(m[3]);
  // Luminancia relativa (sRGB)
  const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminancia > 140 ? '#111111' : '#ffffff';
}

/** Formato número para tooltip */
function fmtValor(valor: number | null, unidad: string): string {
  if (valor === null) return 'No disponible';
  if (valor === 0 && unidad === 'kJ/mol') return '0 (noble/metal d¹⁰)';
  return `${valor} ${unidad}`;
}

/** Mapa grupo → columna CSS Grid (1-indexed) */
function grupoAColumna(grupo: number): number {
  if (grupo <= 2) return grupo;
  if (grupo >= 13) return grupo;
  // grupos 3-12 → columnas 3-12
  return grupo;
}

// ============================================================
// MAPA DE POSICIONES DE LA TABLA (período, columna)
// ============================================================
// Los lantánidos (57-71) y actínidos (89-103) van en filas separadas.
// En la tabla principal, posiciones 57 y 89 muestran un marcador.

interface PosicionTabla {
  fila: number;    // 1-7
  columna: number; // 1-18
}

function obtenerPosicion(elemento: Elemento): PosicionTabla | null {
  if (elemento.grupo === null) return null; // lantánido/actínido → fila separada
  return {
    fila: elemento.periodo,
    columna: grupoAColumna(elemento.grupo),
  };
}

// ============================================================
// COMPONENTE CELDA
// ============================================================
interface CeldaProps {
  elemento: Elemento;
  bgColor: string;
  valor: number | null;
  unidad: string;
  onHover: (elemento: Elemento | null, x: number, y: number) => void;
  esMarcador?: boolean;
}

function CeldaElemento({ elemento, bgColor, valor, unidad, onHover, esMarcador }: CeldaProps) {
  const textColor = colorTexto(bgColor);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    onHover(elemento, e.clientX, e.clientY);
  }, [elemento, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null, 0, 0);
  }, [onHover]);

  if (esMarcador) {
    return (
      <div
        className={`${styles.celda} ${styles.celdaMarcador}`}
        style={{ backgroundColor: '#e8e8e8', color: '#555' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={`${elemento.nombre} (ver fila inferior)`}
      >
        <span className={styles.celdaZ}>{elemento.Z}</span>
        <span className={styles.celdaSimbolo} style={{ fontSize: '0.7rem' }}>*</span>
        <span className={styles.celdaValor}>{elemento.simbolo}</span>
      </div>
    );
  }

  const valorFmt = valor !== null ? (Math.abs(valor) >= 100 ? Math.round(valor).toString() : valor.toFixed(1)) : '—';

  return (
    <div
      className={styles.celda}
      style={{ backgroundColor: bgColor, color: textColor }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`${elemento.nombre}, Z=${elemento.Z}, ${fmtValor(valor, unidad)}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onHover(elemento, 0, 0); }}
    >
      <span className={styles.celdaZ}>{elemento.Z}</span>
      <span className={styles.celdaSimbolo}>{elemento.simbolo}</span>
      <span className={styles.celdaValor}>{valorFmt}</span>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function SimuladorTablaPeriodica() {
  const [propiedad, setPropiedad] = useState<PropiedadKey>('electronegatividad');
  const [tooltip, setTooltip] = useState<{ elemento: Elemento; x: number; y: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const propInfo = PROPIEDADES.find(p => p.key === propiedad)!;
  const rango = calcularRango(propiedad);

  // Elementos de la tabla principal (con grupo)
  const elementosTabla = ELEMENTOS.filter(e => e.grupo !== null);
  // Lantánidos y actínidos
  const lantanidos = ELEMENTOS.filter(e => e.categoria === 'lantanido').sort((a, b) => a.Z - b.Z);
  const actinidos = ELEMENTOS.filter(e => e.categoria === 'actinido').sort((a, b) => a.Z - b.Z);

  // Construir mapa de posiciones para renderizar la grid
  const mapa = new Map<string, Elemento>();
  for (const el of elementosTabla) {
    const pos = obtenerPosicion(el);
    if (pos) {
      mapa.set(`${pos.fila}-${pos.columna}`, el);
    }
  }
  // Añadir marcadores para La y Ac en la tabla principal
  const laElement = ELEMENTOS.find(e => e.Z === 57)!;
  const acElement = ELEMENTOS.find(e => e.Z === 89)!;

  const handleHover = useCallback((elemento: Elemento | null, x: number, y: number) => {
    if (!elemento) {
      setTooltip(null);
    } else {
      setTooltip({ elemento, x, y });
    }
  }, []);

  // Calcular posición del tooltip para que no salga de pantalla
  const tooltipStyle: React.CSSProperties = (() => {
    if (!tooltip) return { display: 'none' };
    const tw = 220;
    const th = 140;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    let left = tooltip.x + 14;
    let top = tooltip.y + 14;
    if (left + tw > vw - 10) left = tooltip.x - tw - 14;
    if (top + th > vh - 10) top = tooltip.y - th - 14;
    return { left, top, display: 'block' };
  })();

  // Renderizar celdas de la tabla principal
  const renderFilas = () => {
    const filas: React.ReactNode[] = [];
    for (let fila = 1; fila <= 7; fila++) {
      for (let col = 1; col <= 18; col++) {
        const el = mapa.get(`${fila}-${col}`);

        // Posiciones especiales para lantánidos/actínidos
        const esLa = fila === 6 && col === 3;
        const esAc = fila === 7 && col === 3;

        if (esLa) {
          const bgColor = valorAColor(laElement[propiedad] as number | null, rango.min, rango.max);
          filas.push(
            <CeldaElemento
              key={`marcador-la`}
              elemento={laElement}
              bgColor={bgColor}
              valor={laElement[propiedad] as number | null}
              unidad={propInfo.unidad}
              onHover={handleHover}
              esMarcador
            />
          );
          continue;
        }
        if (esAc) {
          const bgColor = valorAColor(acElement[propiedad] as number | null, rango.min, rango.max);
          filas.push(
            <CeldaElemento
              key={`marcador-ac`}
              elemento={acElement}
              bgColor={bgColor}
              valor={acElement[propiedad] as number | null}
              unidad={propInfo.unidad}
              onHover={handleHover}
              esMarcador
            />
          );
          continue;
        }

        if (el) {
          const valor = el[propiedad] as number | null;
          const bgColor = valorAColor(valor, rango.min, rango.max);
          filas.push(
            <CeldaElemento
              key={el.Z}
              elemento={el}
              bgColor={bgColor}
              valor={valor}
              unidad={propInfo.unidad}
              onHover={handleHover}
            />
          );
        } else {
          filas.push(<div key={`vacio-${fila}-${col}`} className={`${styles.celda} ${styles.celdaVacia}`} />);
        }
      }
    }
    return filas;
  };

  const renderFilaLantanoides = (elementos: Elemento[], etiqueta: string) => (
    <div className={styles.filaLantanidos}>
      <div className={styles.etiquetaLantanidos}>{etiqueta}</div>
      {elementos.map(el => {
        const valor = el[propiedad] as number | null;
        const bgColor = valorAColor(valor, rango.min, rango.max);
        return (
          <CeldaElemento
            key={el.Z}
            elemento={el}
            bgColor={bgColor}
            valor={valor}
            unidad={propInfo.unidad}
            onHover={handleHover}
          />
        );
      })}
    </div>
  );

  const categoriaLabel = (cat: string): string => {
    const mapa: Record<string, string> = {
      'metal-alcalino': 'Metal alcalino',
      'metal-alcalinoterreo': 'Metal alcalinotérreo',
      'metal-transicion': 'Metal de transición',
      'metal-postransicion': 'Metal postransición',
      'metaloide': 'Metaloide',
      'no-metal': 'No metal',
      'halógeno': 'Halógeno',
      'gas-noble': 'Gas noble',
      'lantanido': 'Lantánido',
      'actinido': 'Actínido',
    };
    return mapa[cat] ?? cat;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tendencias de la Tabla Periódica</h1>
        <p className={styles.subtitle}>
          Selecciona una propiedad y observa cómo cambia con el color en los 118 elementos.
          Pasa el cursor sobre cualquier elemento para ver sus datos exactos.
        </p>
      </header>

      <LegalNotice />

      {/* Botones de propiedad */}
      <div className={styles.propiedadButtons} role="group" aria-label="Seleccionar propiedad">
        {PROPIEDADES.map(p => (
          <button
            key={p.key}
            className={`${styles.propiedadBtn} ${propiedad === p.key ? styles.propiedadBtnActive : ''}`}
            onClick={() => setPropiedad(p.key)}
            aria-pressed={propiedad === p.key}
            type="button"
          >
            {p.label} ({p.unidad})
          </button>
        ))}
      </div>

      {/* Flechas de tendencia y leyenda */}
      <div className={styles.tendenciasHeader}>
        <div className={styles.flechasRow}>
          <div className={styles.flechaItem}>
            <span className={styles.flechaIcon} aria-hidden="true">{propInfo.flechaGrupo}</span>
            <span>{propInfo.textoGrupo}</span>
          </div>
          <div className={styles.flechaItem}>
            <span className={styles.flechaIcon} aria-hidden="true">{propInfo.flechaPeriodo}</span>
            <span>{propInfo.textoPeriodo}</span>
          </div>
        </div>
        <div className={styles.leyenda} aria-label="Leyenda de color">
          <div className={styles.leyendaTitulo}>{propInfo.label}</div>
          <div className={styles.leyendaGradiente} role="img" aria-label={`Escala de ${rango.min} a ${rango.max} ${propInfo.unidad}`} />
          <div className={styles.leyendaLabels}>
            <span>{rango.min} {propInfo.unidad}</span>
            <span>{rango.max} {propInfo.unidad}</span>
          </div>
        </div>
      </div>

      {/* Tabla periódica */}
      <div className={styles.tablaWrapper}>
        <div className={styles.tablaGrid} role="grid" aria-label="Tabla periódica interactiva">
          {renderFilas()}
        </div>
        <div className={styles.separadorLantanidos} />
        {renderFilaLantanoides(lantanidos, 'Ln')}
        <div style={{ height: '4px' }} />
        {renderFilaLantanoides(actinidos, 'Ac')}
      </div>

      {/* Tooltip flotante */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={tooltipStyle}
          role="tooltip"
          aria-live="polite"
        >
          <div className={styles.tooltipNombre}>{tooltip.elemento.nombre}</div>
          <div className={styles.tooltipZ}>Z = {tooltip.elemento.Z} · {tooltip.elemento.simbolo}</div>
          <div className={styles.tooltipCategoria}>{categoriaLabel(tooltip.elemento.categoria)}</div>
          <div className={styles.tooltipValor}>
            {propInfo.label}:{' '}
            {tooltip.elemento[propiedad] !== null
              ? `${tooltip.elemento[propiedad]} ${propInfo.unidad}`
              : <span className={styles.tooltipNull}>Dato no disponible</span>
            }
          </div>
        </div>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Aprende sobre las Tendencias Periódicas"
        subtitle="Por qué los elementos se organizan así y cómo predecir sus propiedades"
        icon="📚"
      >
        {/* Introducción */}
        <div className={styles.formulaBox}>
          <strong>¿Por qué existen las tendencias periódicas?</strong><br />
          Las propiedades de los elementos varían de forma predecible porque dependen de dos fuerzas en competencia:
          la <em>carga nuclear efectiva</em> (Z<sub>ef</sub>) —la atracción neta que el núcleo ejerce sobre los electrones de valencia—
          y el <em>apantallamiento</em> —el efecto de los electrones internos que "esconden" parte de la carga nuclear a los electrones externos.
          Al moverse hacia la derecha en un período, Z aumenta pero los electrones de valencia están en el mismo nivel energético,
          así que Z<sub>ef</sub> crece y el átomo se contrae. Al bajar en un grupo, se añaden capas completas, el apantallamiento aumenta
          y el átomo se expande.
        </div>

        {/* Tabla comparativa */}
        <h4>Comparativa de tendencias (las 5 propiedades)</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>En el grupo (↓)</th>
                <th>En el período (→)</th>
                <th>Excepción notable</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Radio atómico</strong></td>
                <td>Aumenta (más capas)</td>
                <td>Disminuye (mayor Z<sub>ef</sub>)</td>
                <td>Lantánidos: contracción lantánida</td>
                <td>Cs (298 pm) es el más grande de los naturales</td>
              </tr>
              <tr>
                <td><strong>Electronegatividad</strong></td>
                <td>Disminuye</td>
                <td>Aumenta</td>
                <td>F (3,98) no sigue patrón suave en período 2</td>
                <td>F el más electronegativo; Fr el menos</td>
              </tr>
              <tr>
                <td><strong>1ª E. ionización</strong></td>
                <td>Disminuye</td>
                <td>Aumenta (con excepciones)</td>
                <td>N &gt; O y Be &gt; B por subcapas semillenas/llenas</td>
                <td>He (2372 kJ/mol) es el más alto; Cs el más bajo</td>
              </tr>
              <tr>
                <td><strong>Afinidad electrónica</strong></td>
                <td>Más exotérmica hacia arriba</td>
                <td>Tendencia irregular</td>
                <td>N, Be, Mg: AE ≈ 0 (subnivelstables)</td>
                <td>Cl (−348,6) más exotérmica que F (−328)</td>
              </tr>
              <tr>
                <td><strong>Punto de fusión</strong></td>
                <td>Irregular según familia</td>
                <td>Máximo en metales de transición</td>
                <td>W (3422 °C) el metal con mayor Tf conocido</td>
                <td>He y H: Tf más bajas; W la más alta</td>
              </tr>
              <tr>
                <td><strong>Regla general</strong></td>
                <td>Radio ↑, el resto ↓</td>
                <td>Radio ↓, el resto ↑ (aprox.)</td>
                <td>Metales de transición rompen la monotonía</td>
                <td>La tabla es más rica que cualquier regla simple</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios reales */}
        <h4>Aplicaciones reales de las tendencias</h4>
        <div className={styles.scenariosGrid}>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🔋</span>
            <h4>Baterías de litio</h4>
            <p>Li es el primer metal alcalino: radio pequeño, baja masa, baja energía de ionización. La combinación es ideal para ánodos ligeros y con alta densidad de energía. Sin las tendencias periódicas no habríamos predicho que Li sería mejor que Na o K.</p>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">💻</span>
            <h4>Semiconductores Si/Ge</h4>
            <p>Si y Ge son metaloides del grupo 14 con electronegatividad intermedia (1,90 y 2,01). Su estructura electrónica de 4 electrones de valencia los hace perfectos para semiconductores. La tendencia de EN en el grupo 14 guió la búsqueda de materiales alternativos.</p>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">⚗️</span>
            <h4>Catalizadores de metales de transición</h4>
            <p>Fe, Co, Ni, Pt, Pd tienen subniveles d parcialmente ocupados, energías de ionización moderadas y afinidades electrónicas que permiten adsorber y liberar reactivos. Las tendencias de los metales de transición predicen su actividad catalítica.</p>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🧪</span>
            <h4>Predicción de reactividad</h4>
            <p>Un halógeno desconocido en el grupo 17 tendrá electronegatividad alta, afinidad electrónica muy exotérmica y radio pequeño: será muy reactivo y oxidante fuerte. Las tendencias permiten predecir propiedades antes de sintetizar el compuesto.</p>
          </div>
        </div>

        {/* FAQ */}
        <h4>Preguntas frecuentes</h4>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Por qué el F tiene la mayor electronegatividad (3,98)?</strong>
            <p>El F tiene el radio atómico más pequeño del grupo 17, lo que significa que sus electrones de valencia están muy cerca del núcleo. Aunque el Cl tiene mayor afinidad electrónica, la pequeña distancia en el F hace que la atracción sobre los electrones compartidos en un enlace sea máxima. La electronegatividad no es solo afinidad electrónica: también depende del radio.</p>
            <div className={styles.faqTip}>Truco: F = Furiosamente electronegativo</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué el N tiene afinidad electrónica ≈ 0?</strong>
            <p>El N tiene la configuración 2p³: tres electrones en tres orbitales p semillenos, cada uno con su spin paralelo. Añadir un cuarto electrón obligaría a aparearlo en un orbital ya ocupado, lo que cuesta energía de repulsión interelectrónica. El resultado neto es que ganar un electrón no libera energía: AE ≈ 0. Lo mismo ocurre con Be (2s² lleno) y Mg.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué el W (wolframio) tiene el punto de fusión más alto de los metales?</strong>
            <p>El W (grupo 6, período 6) tiene 4 electrones d desapareados disponibles para el enlace metálico, además de su gran radio relativamente compacto para ser del período 6. Esto maximiza la densidad de estados en la banda d y la energía de cohesión de la red cristálica. Los metales de transición del período 5-6 con más electrones d desapareados tienen los mayores puntos de fusión.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué el radio atómico aumenta al bajar en la tabla?</strong>
            <p>Cada período añade un nuevo nivel energético (capa). Los electrones de valencia en la capa n+1 están más lejos del núcleo que los de la capa n, aunque la carga nuclear también haya aumentado. El efecto de apantallamiento de las capas internas es suficiente para que los electrones externos sientan menos atracción neta: el átomo se expande.</p>
            <div className={styles.faqTip}>Analogía: añadir una capa de ropa cada año — el volumen total crece aunque el corazón siga igual</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es la carga nuclear efectiva (Z<sub>ef</sub>)?</strong>
            <p>Es la carga del núcleo que "perciben" realmente los electrones de valencia después de restar el efecto de apantallamiento de los electrones internos. Se calcula con las reglas de Slater: Z<sub>ef</sub> ≈ Z − σ, donde σ es la constante de apantallamiento. Al avanzar en un período, Z aumenta en 1 pero σ aumenta menos de 1 (los electrones del mismo nivel no apantallan completamente), así que Z<sub>ef</sub> crece y el átomo se contrae.</p>
          </div>
        </div>

        {/* Pasos: cómo usar las tendencias */}
        <h4>Cómo predecir propiedades de un elemento desconocido</h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Localiza su posición en la tabla:</strong> identifica el grupo (columna) y el período (fila). Esto define su familia química y el nivel energético de los electrones de valencia.
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Aplica la tendencia del radio:</strong> compáralo con su vecino de la izquierda y su vecino de arriba. Si está a la derecha → radio más pequeño; si está abajo → radio más grande.
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Deduce electronegatividad e IE:</strong> siguen la tendencia inversa al radio (mayor Z<sub>ef</sub> → más electronegativo, más energía de ionización). Cuidado con excepciones en N, O y grupo 15/16.
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Valora la afinidad electrónica:</strong> los halógenos del período 3 y 4 tienen las AE más negativas. Desconfía de los elementos de configuración ns² o np³ (AE ≈ 0 por subniveles estables).
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Contrasta con el heatmap:</strong> selecciona la propiedad y localiza el elemento. El color confirma o corrige tu predicción intuitiva y te muestra cuánto se desvía de la tendencia general.
            </div>
          </div>
        </div>

        {/* Tips mnémicos */}
        <h4>Trucos para recordar las tendencias</h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔵</span>
            <p><strong>Radio:</strong> "Baja y a la izquierda = más gordo". Los metales alcalinos de la izquierda y abajo son los más voluminosos (Cs, Fr).</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p><strong>Electronegatividad:</strong> "Sube y a la derecha = más ávido". El F en la esquina superior derecha es el campeón absoluto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
            <p><strong>Energía ionización:</strong> "Igual que EN pero más irregular". Recuerda que N &gt; O y Be &gt; B por subniveles semillenos/llenos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <p><strong>Punto de fusión:</strong> "El centro de la tabla hierve más". Los metales de transición del centro (W, Re, Os, Mo) tienen los Tf más altos.</p>
          </div>
        </div>

        {/* Warning box — errores frecuentes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al estudiar tendencias periódicas
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir radio atómico con radio iónico:</strong> el catión siempre es más pequeño que el átomo neutral, el anión siempre es más grande. Las tendencias de radio iónico siguen reglas diferentes.</li>
            <li><strong>Creer que todos los gases nobles tienen AE negativa:</strong> He, Ne, Ar, Kr tienen AE = 0 o ligeramente positiva (no ganan electrones). Solo algunos gases nobles pesados como Xe tienen compuestos estables bajo condiciones extremas.</li>
            <li><strong>No recordar las anomalías de N y Be en IE:</strong> N (2p³ semilleno) tiene IE mayor que O (2p⁴), y Be (2s² lleno) mayor que B (2p¹). Estas excepciones aparecen tanto en el EBAU (España) como en los exámenes de admisión de preparatoria y secundaria en Latinoamérica.</li>
            <li><strong>Confundir electronegatividad con afinidad electrónica:</strong> la EN describe la atracción de electrones en un enlace (concepto de molécula); la AE describe la energía al ganar un electrón libre (concepto de átomo aislado). No son iguales: el Cl tiene mayor AE que el F, pero menor EN.</li>
            <li><strong>Ignorar la contracción lantánida:</strong> los elementos del período 6 después de los lantánidos (Hf, Ta, W...) tienen radios casi iguales a sus análogos del período 5, rompiendo la tendencia normal. Esto afecta a muchas propiedades de los metales pesados.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-tabla-periodica-tendencias')} />
      <ShareCard appName="simulador-tabla-periodica-tendencias" />
      <Footer appName="simulador-tabla-periodica-tendencias" />
    </div>
  );
}
