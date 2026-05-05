import { HistoriaData } from './types';
import { grecia } from './grecia';
import { roma } from './roma';
import { egipto } from './egipto';
import { mesopotamia } from './mesopotamia';
import { otomano } from './otomano';
import { mongol } from './mongol';
import { revolucionFrancesa } from './revolucion-francesa';
import { imperioPersa } from './imperio-persa';
import { japon } from './japon';
import { chinaDinastias } from './china-dinastias';
import { primeraGuerraMundial } from './primera-guerra-mundial';
import { segundaGuerraMundial } from './segunda-guerra-mundial';
import { civilizacionesPrecolombinas } from './civilizaciones-precolombinas';
import { espanaMedieval } from './espana-medieval';
import { edadMediaEuropea } from './edad-media-europea';
import { renacimiento } from './renacimiento';
import { laReforma } from './la-reforma';
import { lasCruzadas } from './las-cruzadas';
import { ilustracion } from './ilustracion';
import { cine } from './cine';
import { astronomia } from './astronomia';
import { automocion } from './automocion';
import { aviacion } from './aviacion';
import { banca } from './banca';
import { clima } from './clima';
import { comics } from './comics';
import { danza } from './danza';
import { deporte } from './deporte';
import { economiaEspana } from './economia-espana';
import { energia } from './energia';
import { epidemias } from './epidemias';
import { exploracion } from './exploracion';
import { fisica } from './fisica';
import { fotografia } from './fotografia';
import { gastronomia } from './gastronomia';
import { internet } from './internet';
import { matematicas } from './matematicas';
import { medicina } from './medicina';
import { moda } from './moda';
import { modaEspanola } from './moda-espanola';
import { ordenadores } from './ordenadores';
import { prensa } from './prensa';
import { psicologia } from './psicologia';
import { publicidad } from './publicidad';
import { quimica } from './quimica';
import { radio } from './radio';
import { robotica } from './robotica';
import { teatro } from './teatro';
import { telefono } from './telefono';
import { television } from './television';
import { tren } from './tren';
import { viajesEspaciales } from './viajes-espaciales';
import { videojuegos } from './videojuegos';
import { videojuegosEspanoles } from './videojuegos-espanoles';
import { arquitecturaEspanola } from './arquitectura-espanola';
import { historiaEeuu } from './historia-eeuu';
import { historiaRusia } from './historia-rusia';
import { historiaReinoUnido } from './historia-reino-unido';
import { historiaVikingos } from './historia-vikingos';
import { historiaGuerraFria } from './historia-guerra-fria';
import { historiaAmericaLatina } from './historia-america-latina';
import { historiaElectricidad } from './historia-electricidad';
import { historiaCienciaEspanola } from './historia-ciencia-espanola';
import { historiaDescubrimientosCientificos } from './historia-descubrimientos-cientificos';
import { historiaIndia } from './historia-india';
import { historiaBizancio } from './historia-bizancio';
import { historiaVideojuegosJaponeses } from './historia-videojuegos-japoneses';
import { historiaChinaModerna } from './historia-china-moderna';
import { historiaJaponModerno } from './historia-japon-moderno';
import { historiaOrienteMedio } from './historia-oriente-medio';
import { historiaAfrica } from './historia-africa';
import { historiaDerechosHumanos } from './historia-derechos-humanos';
import { historiaMedicinaContemporanea } from './historia-medicina-contemporanea';
import { historiaEconomiaMundial } from './historia-economia-mundial';
import { historiaInteligenciaArtificial } from './historia-inteligencia-artificial';
import { historiaFutbol } from './historia-futbol';
import { historiaMusicaPopular } from './historia-musica-popular';
import { historiaArquitecturaModerna } from './historia-arquitectura-moderna';
import { historiaPrehistoria } from './historia-prehistoria';
import { historiaUnionEuropea } from './historia-union-europea';
import { historiaConquistaAmerica } from './historia-conquista-america';
import { historiaAlemania } from './historia-alemania';

const registry: Record<string, HistoriaData> = {
  grecia,
  roma,
  egipto,
  mesopotamia,
  otomano,
  mongol,
  'revolucion-francesa': revolucionFrancesa,
  'imperio-persa': imperioPersa,
  japon,
  'china-dinastias': chinaDinastias,
  'primera-guerra-mundial': primeraGuerraMundial,
  'segunda-guerra-mundial': segundaGuerraMundial,
  'civilizaciones-precolombinas': civilizacionesPrecolombinas,
  'espana-medieval': espanaMedieval,
  'edad-media-europea': edadMediaEuropea,
  renacimiento,
  'la-reforma': laReforma,
  'las-cruzadas': lasCruzadas,
  ilustracion,
  cine,
  astronomia,
  automocion,
  aviacion,
  banca,
  clima,
  comics,
  danza,
  deporte,
  'economia-espana': economiaEspana,
  energia,
  epidemias,
  exploracion,
  fisica,
  fotografia,
  gastronomia,
  internet,
  matematicas,
  medicina,
  moda,
  'moda-espanola': modaEspanola,
  ordenadores,
  prensa,
  psicologia,
  publicidad,
  quimica,
  radio,
  robotica,
  teatro,
  telefono,
  television,
  tren,
  'viajes-espaciales': viajesEspaciales,
  videojuegos,
  'videojuegos-espanoles': videojuegosEspanoles,
  'arquitectura-espanola': arquitecturaEspanola,
  'historia-eeuu': historiaEeuu,
  'historia-rusia': historiaRusia,
  'historia-reino-unido': historiaReinoUnido,
  'historia-vikingos': historiaVikingos,
  'historia-guerra-fria': historiaGuerraFria,
  'historia-america-latina': historiaAmericaLatina,
  'historia-electricidad': historiaElectricidad,
  'historia-ciencia-espanola': historiaCienciaEspanola,
  'historia-descubrimientos-cientificos': historiaDescubrimientosCientificos,
  'historia-india': historiaIndia,
  'historia-bizancio': historiaBizancio,
  'historia-videojuegos-japoneses': historiaVideojuegosJaponeses,
  'historia-china-moderna': historiaChinaModerna,
  'historia-japon-moderno': historiaJaponModerno,
  'historia-oriente-medio': historiaOrienteMedio,
  'historia-africa': historiaAfrica,
  'historia-derechos-humanos': historiaDerechosHumanos,
  'historia-medicina-contemporanea': historiaMedicinaContemporanea,
  'historia-economia-mundial': historiaEconomiaMundial,
  'historia-inteligencia-artificial': historiaInteligenciaArtificial,
  'historia-futbol': historiaFutbol,
  'historia-musica-popular': historiaMusicaPopular,
  'historia-arquitectura-moderna': historiaArquitecturaModerna,
  'historia-prehistoria': historiaPrehistoria,
  'historia-union-europea': historiaUnionEuropea,
  'historia-conquista-america': historiaConquistaAmerica,
  'historia-alemania': historiaAlemania,
};

export function getHistoria(slug: string): HistoriaData | null {
  return registry[slug] ?? null;
}

export function getAllHistoriaSlugs(): string[] {
  return Object.keys(registry);
}
