'use client';

import { useState, useMemo } from 'react';
import styles from './AsistenteConstitucionAsociacion.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatDate } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface Fundador {
  id: number;
  nombre: string;
  dni: string;
  nacionalidad: string;
  domicilio: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  cargo: 'presidente' | 'secretario' | 'tesorero' | 'vocal' | '';
}

interface DatosAsociacion {
  // Datos básicos
  denominacion: string;
  siglas: string;
  ambitoTerritorial: 'local' | 'provincial' | 'autonomico' | 'nacional';
  domicilioSocial: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;

  // Fines y actividades
  fines: string[];
  actividades: string[];

  // Régimen fiscal
  acogerLey49_2002: boolean;

  // Cuotas
  cuotaIngreso: number;
  cuotaPeriodica: number;
  periodoCuota: 'mensual' | 'trimestral' | 'semestral' | 'anual';

  // Órganos de gobierno
  duracionMandatoJunta: number; // años

  // Patrimonio inicial
  patrimonioInicial: number;
  descripcionPatrimonio: string;
}

type WizardStep = 'intro' | 'fundadores' | 'datos-basicos' | 'fines' | 'cuotas' | 'revision' | 'documentos';

// ============================================
// DATOS POR DEFECTO Y CONSTANTES
// ============================================

const FINES_SUGERIDOS = [
  'Promover el uso y desarrollo de herramientas tecnológicas de interés general',
  'Fomentar la educación y formación en nuevas tecnologías',
  'Facilitar el acceso a recursos educativos gratuitos',
  'Promover la inclusión digital y la alfabetización tecnológica',
  'Desarrollar proyectos de innovación social',
  'Fomentar la colaboración y el trabajo en red',
  'Defender los derechos digitales de los ciudadanos',
  'Promover la cultura, el arte y la creatividad',
  'Fomentar el voluntariado y la participación ciudadana',
  'Proteger el medio ambiente y promover la sostenibilidad',
];

const ACTIVIDADES_SUGERIDAS = [
  'Creación y mantenimiento de plataformas web de utilidad pública',
  'Organización de talleres y cursos formativos',
  'Desarrollo de aplicaciones y herramientas gratuitas',
  'Publicación de contenidos educativos',
  'Organización de eventos y encuentros',
  'Gestión de comunidades de usuarios',
  'Colaboración con otras entidades afines',
  'Captación de fondos mediante donaciones',
  'Prestación de servicios relacionados con los fines',
];

const PROVINCIAS_ESPANA = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares',
  'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid',
  'Málaga', 'Murcia', 'Navarra', 'Orense', 'Palencia', 'Pontevedra', 'Salamanca',
  'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza', 'Ceuta', 'Melilla'
];

const CARGOS_JUNTA: { id: Fundador['cargo']; nombre: string; descripcion: string }[] = [
  { id: 'presidente', nombre: 'Presidente/a', descripcion: 'Representa legalmente a la asociación' },
  { id: 'secretario', nombre: 'Secretario/a', descripcion: 'Custodia documentación y certifica acuerdos' },
  { id: 'tesorero', nombre: 'Tesorero/a', descripcion: 'Gestiona los fondos y contabilidad' },
  { id: 'vocal', nombre: 'Vocal', descripcion: 'Participa en la toma de decisiones' },
];

const fundadorVacio = (): Fundador => ({
  id: Date.now(),
  nombre: '',
  dni: '',
  nacionalidad: 'Española',
  domicilio: '',
  localidad: '',
  provincia: '',
  codigoPostal: '',
  cargo: '',
});

const datosAsociacionInicial: DatosAsociacion = {
  denominacion: '',
  siglas: '',
  ambitoTerritorial: 'nacional',
  domicilioSocial: '',
  localidad: '',
  provincia: '',
  codigoPostal: '',
  fines: [],
  actividades: [],
  acogerLey49_2002: true,
  cuotaIngreso: 0,
  cuotaPeriodica: 0,
  periodoCuota: 'anual',
  duracionMandatoJunta: 4,
  patrimonioInicial: 0,
  descripcionPatrimonio: '',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AsistenteConstitucionAsociacionPage() {
  // Estado del wizard
  const [step, setStep] = useState<WizardStep>('intro');
  const [fundadores, setFundadores] = useState<Fundador[]>([
    { ...fundadorVacio(), id: 1 },
    { ...fundadorVacio(), id: 2 },
    { ...fundadorVacio(), id: 3 },
  ]);
  const [datosAsociacion, setDatosAsociacion] = useState<DatosAsociacion>(datosAsociacionInicial);
  const [finPersonalizado, setFinPersonalizado] = useState('');
  const [actividadPersonalizada, setActividadPersonalizada] = useState('');
  const [documentoActivo, setDocumentoActivo] = useState<'acta' | 'estatutos' | 'solicitud'>('acta');

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const agregarFundador = () => {
    if (fundadores.length < 10) {
      setFundadores([...fundadores, fundadorVacio()]);
    }
  };

  const eliminarFundador = (id: number) => {
    if (fundadores.length > 3) {
      setFundadores(fundadores.filter(f => f.id !== id));
    }
  };

  const actualizarFundador = (id: number, campo: keyof Fundador, valor: string) => {
    setFundadores(fundadores.map(f =>
      f.id === id ? { ...f, [campo]: valor } : f
    ));
  };

  const actualizarDatos = (campo: keyof DatosAsociacion, valor: DatosAsociacion[keyof DatosAsociacion]) => {
    setDatosAsociacion({ ...datosAsociacion, [campo]: valor });
  };

  const toggleFin = (fin: string) => {
    const fines = datosAsociacion.fines.includes(fin)
      ? datosAsociacion.fines.filter(f => f !== fin)
      : [...datosAsociacion.fines, fin];
    actualizarDatos('fines', fines);
  };

  const agregarFinPersonalizado = () => {
    if (finPersonalizado.trim() && !datosAsociacion.fines.includes(finPersonalizado.trim())) {
      actualizarDatos('fines', [...datosAsociacion.fines, finPersonalizado.trim()]);
      setFinPersonalizado('');
    }
  };

  const toggleActividad = (actividad: string) => {
    const actividades = datosAsociacion.actividades.includes(actividad)
      ? datosAsociacion.actividades.filter(a => a !== actividad)
      : [...datosAsociacion.actividades, actividad];
    actualizarDatos('actividades', actividades);
  };

  const agregarActividadPersonalizada = () => {
    if (actividadPersonalizada.trim() && !datosAsociacion.actividades.includes(actividadPersonalizada.trim())) {
      actualizarDatos('actividades', [...datosAsociacion.actividades, actividadPersonalizada.trim()]);
      setActividadPersonalizada('');
    }
  };

  // ============================================
  // VALIDACIONES
  // ============================================

  const validarFundadores = useMemo(() => {
    const errores: string[] = [];

    // Mínimo 3 fundadores
    if (fundadores.length < 3) {
      errores.push('Se requieren al menos 3 fundadores');
    }

    // Datos obligatorios
    fundadores.forEach((f, i) => {
      if (!f.nombre.trim()) errores.push(`Fundador ${i + 1}: Falta el nombre`);
      if (!f.dni.trim()) errores.push(`Fundador ${i + 1}: Falta el DNI/NIE`);
      if (!f.domicilio.trim()) errores.push(`Fundador ${i + 1}: Falta el domicilio`);
      if (!f.cargo) errores.push(`Fundador ${i + 1}: Falta asignar cargo`);
    });

    // Cargos obligatorios
    const tienePresidente = fundadores.some(f => f.cargo === 'presidente');
    const tieneSecretario = fundadores.some(f => f.cargo === 'secretario');
    const tieneTesorero = fundadores.some(f => f.cargo === 'tesorero');

    if (!tienePresidente) errores.push('Debe haber un Presidente/a');
    if (!tieneSecretario) errores.push('Debe haber un Secretario/a');
    if (!tieneTesorero) errores.push('Debe haber un Tesorero/a');

    return errores;
  }, [fundadores]);

  const validarDatosBasicos = useMemo(() => {
    const errores: string[] = [];

    if (!datosAsociacion.denominacion.trim()) errores.push('Falta la denominación de la asociación');
    if (!datosAsociacion.domicilioSocial.trim()) errores.push('Falta el domicilio social');
    if (!datosAsociacion.localidad.trim()) errores.push('Falta la localidad');
    if (!datosAsociacion.provincia) errores.push('Falta la provincia');

    return errores;
  }, [datosAsociacion]);

  const validarFines = useMemo(() => {
    const errores: string[] = [];

    if (datosAsociacion.fines.length === 0) errores.push('Debe seleccionar al menos un fin');
    if (datosAsociacion.actividades.length === 0) errores.push('Debe seleccionar al menos una actividad');

    return errores;
  }, [datosAsociacion.fines, datosAsociacion.actividades]);

  const puedeAvanzar = useMemo(() => {
    switch (step) {
      case 'fundadores': return validarFundadores.length === 0;
      case 'datos-basicos': return validarDatosBasicos.length === 0;
      case 'fines': return validarFines.length === 0;
      case 'cuotas': return true;
      default: return true;
    }
  }, [step, validarFundadores, validarDatosBasicos, validarFines]);

  // ============================================
  // GENERACIÓN DE DOCUMENTOS
  // ============================================

  const fechaActual = formatDate(new Date());

  const presidente = fundadores.find(f => f.cargo === 'presidente');
  const secretario = fundadores.find(f => f.cargo === 'secretario');
  const tesorero = fundadores.find(f => f.cargo === 'tesorero');

  const generarActaFundacional = (): string => {
    const listaFundadores = fundadores.map((f, i) =>
      `${i + 1}. D./Dña. ${f.nombre || '[NOMBRE]'}, mayor de edad, de nacionalidad ${f.nacionalidad}, con DNI/NIE ${f.dni || '[DNI]'}, y domicilio en ${f.domicilio || '[DOMICILIO]'}, ${f.codigoPostal} ${f.localidad}, ${f.provincia}.`
    ).join('\n');

    const listaJuntaDirectiva = fundadores.map(f => {
      const cargoNombre = CARGOS_JUNTA.find(c => c.id === f.cargo)?.nombre || '[CARGO]';
      return `   - ${cargoNombre}: D./Dña. ${f.nombre || '[NOMBRE]'}`;
    }).join('\n');

    return `
ACTA FUNDACIONAL DE LA ASOCIACIÓN "${datosAsociacion.denominacion || '[DENOMINACIÓN]'}"
${datosAsociacion.siglas ? `(${datosAsociacion.siglas})` : ''}
================================================================================

En ${datosAsociacion.localidad || '[LOCALIDAD]'}, a ${fechaActual}.

REUNIDOS

Las personas que a continuación se relacionan:

${listaFundadores}

MANIFIESTAN

Su voluntad de constituir una asociación al amparo de la Ley Orgánica 1/2002, de 22 de marzo, reguladora del Derecho de Asociación, y del resto de normativa aplicable.

Y, a tal efecto,

ACUERDAN

PRIMERO.- Constituir una asociación que se denominará "${datosAsociacion.denominacion || '[DENOMINACIÓN]'}"${datosAsociacion.siglas ? `, pudiendo utilizar las siglas "${datosAsociacion.siglas}"` : ''}.

SEGUNDO.- La asociación tendrá su domicilio social en ${datosAsociacion.domicilioSocial || '[DIRECCIÓN]'}, ${datosAsociacion.codigoPostal} ${datosAsociacion.localidad}, ${datosAsociacion.provincia}.

TERCERO.- La asociación tendrá ámbito territorial ${
  datosAsociacion.ambitoTerritorial === 'local' ? 'local' :
  datosAsociacion.ambitoTerritorial === 'provincial' ? 'provincial' :
  datosAsociacion.ambitoTerritorial === 'autonomico' ? 'autonómico' : 'nacional'
}.

CUARTO.- Los fines de la asociación serán:
${datosAsociacion.fines.map((f, i) => `   ${i + 1}. ${f}`).join('\n') || '   [FINES DE LA ASOCIACIÓN]'}

QUINTO.- Para el cumplimiento de estos fines, la asociación desarrollará las siguientes actividades:
${datosAsociacion.actividades.map((a, i) => `   ${i + 1}. ${a}`).join('\n') || '   [ACTIVIDADES DE LA ASOCIACIÓN]'}

SEXTO.- Aprobar los Estatutos por los que ha de regirse la asociación, que se incorporan como anexo a esta Acta.

SÉPTIMO.- Designar la Junta Directiva provisional de la asociación, que estará compuesta por:
${listaJuntaDirectiva}

   Los cargos tendrán una duración de ${datosAsociacion.duracionMandatoJunta} años, pudiendo ser reelegidos.

OCTAVO.- El patrimonio inicial de la asociación asciende a ${datosAsociacion.patrimonioInicial.toLocaleString('es-ES')} euros${datosAsociacion.descripcionPatrimonio ? `, consistente en: ${datosAsociacion.descripcionPatrimonio}` : ''}.

${datosAsociacion.acogerLey49_2002 ? `NOVENO.- La asociación solicitará su acogimiento al régimen fiscal especial previsto en la Ley 49/2002, de 23 de diciembre, de régimen fiscal de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo, una vez inscrita en el Registro de Asociaciones correspondiente.

DÉCIMO` : 'NOVENO'}.- Solicitar la inscripción de la asociación en el Registro de Asociaciones correspondiente.

Y en prueba de conformidad, los fundadores firman la presente Acta en el lugar y fecha indicados.


FIRMAS:

${fundadores.map(f => `
_______________________________
D./Dña. ${f.nombre || '[NOMBRE]'}
DNI: ${f.dni || '[DNI]'}
`).join('\n')}
`.trim();
  };

  const generarEstatutos = (): string => {
    const listaFines = datosAsociacion.fines.map((f, i) => `      ${String.fromCharCode(97 + i)}) ${f}`).join('\n');
    const listaActividades = datosAsociacion.actividades.map((a, i) => `      ${String.fromCharCode(97 + i)}) ${a}`).join('\n');

    return `
ESTATUTOS DE LA ASOCIACIÓN "${datosAsociacion.denominacion || '[DENOMINACIÓN]'}"
${datosAsociacion.siglas ? `(${datosAsociacion.siglas})` : ''}
================================================================================

TÍTULO I - DISPOSICIONES GENERALES
================================================================================

Artículo 1. Denominación y naturaleza
   Se constituye la Asociación denominada "${datosAsociacion.denominacion || '[DENOMINACIÓN]'}"${datosAsociacion.siglas ? `, que podrá utilizar las siglas "${datosAsociacion.siglas}"` : ''}, como entidad sin ánimo de lucro, al amparo de lo dispuesto en el artículo 22 de la Constitución Española y en la Ley Orgánica 1/2002, de 22 de marzo, reguladora del Derecho de Asociación.

Artículo 2. Personalidad jurídica
   La Asociación tiene personalidad jurídica propia y plena capacidad de obrar, pudiendo realizar todos aquellos actos que sean necesarios para el cumplimiento de sus fines.

Artículo 3. Domicilio social
   La Asociación establece su domicilio social en ${datosAsociacion.domicilioSocial || '[DIRECCIÓN]'}, ${datosAsociacion.codigoPostal} ${datosAsociacion.localidad} (${datosAsociacion.provincia}).

   El cambio de domicilio dentro de la misma localidad podrá ser acordado por la Junta Directiva. El traslado a otra localidad requerirá acuerdo de la Asamblea General.

Artículo 4. Ámbito territorial
   La Asociación desarrollará principalmente sus actividades en el ámbito ${
     datosAsociacion.ambitoTerritorial === 'local' ? 'local' :
     datosAsociacion.ambitoTerritorial === 'provincial' ? 'provincial' :
     datosAsociacion.ambitoTerritorial === 'autonomico' ? 'autonómico' : 'nacional'
   }.

Artículo 5. Duración
   La Asociación se constituye por tiempo indefinido.


TÍTULO II - FINES Y ACTIVIDADES
================================================================================

Artículo 6. Fines
   Los fines de la Asociación son:
${listaFines || '      [FINES DE LA ASOCIACIÓN]'}

Artículo 7. Actividades
   Para el cumplimiento de estos fines, la Asociación desarrollará las siguientes actividades:
${listaActividades || '      [ACTIVIDADES DE LA ASOCIACIÓN]'}

Artículo 8. Ausencia de ánimo de lucro
   La Asociación carece de ánimo de lucro. Los beneficios obtenidos se destinarán exclusivamente al cumplimiento de sus fines, sin que puedan repartirse entre los asociados ni entre sus cónyuges o personas que convivan con análoga relación de afectividad, ni entre sus parientes.


TÍTULO III - SOCIOS
================================================================================

Artículo 9. Clases de socios
   Podrán formar parte de la Asociación las siguientes categorías de socios:
      a) Socios fundadores: Las personas que suscriben el Acta Fundacional.
      b) Socios de número: Las personas que, con posterioridad a la constitución, soliciten su ingreso y sean admitidas.
      c) Socios de honor: Las personas o entidades que, por su prestigio o servicios a la Asociación, sean nombradas por la Asamblea General a propuesta de la Junta Directiva.

Artículo 10. Requisitos para ser socio
   Podrán ser socios las personas físicas mayores de edad y las personas jurídicas que:
      a) Tengan interés en el desarrollo de los fines de la Asociación.
      b) Acepten los presentes Estatutos.
      c) Soliciten su ingreso por escrito a la Junta Directiva.

Artículo 11. Admisión de socios
   La Junta Directiva resolverá sobre las solicitudes de ingreso en el plazo de 30 días desde su recepción. Transcurrido dicho plazo sin resolución expresa, se entenderá estimada la solicitud.

   La denegación de ingreso deberá ser motivada y podrá ser recurrida ante la Asamblea General.

Artículo 12. Derechos de los socios
   Los socios tendrán los siguientes derechos:
      a) Participar en las actividades de la Asociación.
      b) Asistir a las Asambleas Generales con voz y voto.
      c) Elegir y ser elegidos para los cargos de la Junta Directiva.
      d) Ser informados de la gestión de la Asociación.
      e) Acceder a la documentación de la Asociación.
      f) Impugnar los acuerdos de los órganos de la Asociación.
      g) Solicitar la baja voluntaria en cualquier momento.

Artículo 13. Deberes de los socios
   Los socios tendrán los siguientes deberes:
      a) Cumplir los presentes Estatutos y los acuerdos válidamente adoptados.
      b) Abonar las cuotas que se establezcan.
      c) Colaborar en la consecución de los fines de la Asociación.
      d) Desempeñar los cargos para los que sean elegidos.

Artículo 14. Pérdida de la condición de socio
   La condición de socio se pierde por:
      a) Baja voluntaria, comunicada por escrito a la Junta Directiva.
      b) Impago de cuotas durante más de seis meses.
      c) Expulsión acordada por la Asamblea General por conducta contraria a los fines de la Asociación.


TÍTULO IV - ÓRGANOS DE GOBIERNO
================================================================================

Artículo 15. Órganos de gobierno
   Los órganos de gobierno de la Asociación son:
      a) La Asamblea General.
      b) La Junta Directiva.

CAPÍTULO I - LA ASAMBLEA GENERAL

Artículo 16. Naturaleza y competencias
   La Asamblea General es el órgano supremo de gobierno de la Asociación, integrada por todos los socios.

   Corresponde a la Asamblea General:
      a) Aprobar la gestión de la Junta Directiva.
      b) Aprobar las cuentas anuales y el presupuesto.
      c) Modificar los Estatutos.
      d) Elegir y cesar a los miembros de la Junta Directiva.
      e) Acordar la disolución de la Asociación.
      f) Aprobar el reglamento de régimen interno.
      g) Acordar la integración en federaciones o confederaciones.
      h) Cualquier otra que le atribuyan estos Estatutos o la ley.

Artículo 17. Clases de Asambleas
   Las Asambleas podrán ser ordinarias o extraordinarias:
      a) La Asamblea Ordinaria se celebrará al menos una vez al año, dentro de los seis meses siguientes al cierre del ejercicio, para aprobar las cuentas y el presupuesto.
      b) Las Asambleas Extraordinarias se celebrarán cuando lo acuerde la Junta Directiva o lo solicite un 20% de los socios.

Artículo 18. Convocatoria
   La Asamblea será convocada por el Presidente con al menos 15 días de antelación, indicando lugar, fecha, hora y orden del día.

   La convocatoria se realizará de forma individual a cada socio por cualquier medio que permita acreditar su recepción.

Artículo 19. Quórum y adopción de acuerdos
   La Asamblea quedará válidamente constituida en primera convocatoria cuando asistan la mayoría de los socios, y en segunda convocatoria cualquiera que sea el número de asistentes.

   Los acuerdos se adoptarán por mayoría simple de los presentes, salvo para:
      a) Modificación de Estatutos: mayoría de 2/3.
      b) Disolución de la Asociación: mayoría de 2/3.
      c) Disposición de bienes: mayoría de 2/3.

CAPÍTULO II - LA JUNTA DIRECTIVA

Artículo 20. Composición
   La Junta Directiva es el órgano de representación y gestión de la Asociación, compuesta por:
      a) Presidente/a.
      b) Secretario/a.
      c) Tesorero/a.
      d) Vocales (si los hubiere).

Artículo 21. Elección y duración del cargo
   Los miembros de la Junta Directiva serán elegidos por la Asamblea General por un período de ${datosAsociacion.duracionMandatoJunta} años, pudiendo ser reelegidos.

   El cese anticipado de cualquier cargo podrá producirse por dimisión, fallecimiento, incapacidad o acuerdo de la Asamblea General.

Artículo 22. Competencias de la Junta Directiva
   Corresponde a la Junta Directiva:
      a) Dirigir las actividades de la Asociación.
      b) Ejecutar los acuerdos de la Asamblea General.
      c) Elaborar las cuentas anuales y el presupuesto.
      d) Acordar la celebración de contratos.
      e) Decidir sobre la admisión de socios.
      f) Convocar las Asambleas Generales.
      g) Cualquier otra que le delegue la Asamblea General.

Artículo 23. El Presidente
   Corresponde al Presidente:
      a) Representar legalmente a la Asociación.
      b) Presidir las reuniones de la Asamblea y la Junta Directiva.
      c) Ordenar los pagos válidamente acordados.
      d) Visar las actas y certificaciones.

Artículo 24. El Secretario
   Corresponde al Secretario:
      a) Custodiar la documentación de la Asociación.
      b) Redactar y firmar las actas de las reuniones.
      c) Expedir certificaciones.
      d) Llevar el libro de registro de socios.

Artículo 25. El Tesorero
   Corresponde al Tesorero:
      a) Custodiar los fondos de la Asociación.
      b) Llevar la contabilidad.
      c) Elaborar el proyecto de presupuesto y cuentas anuales.
      d) Firmar los recibos y documentos de pago.

Artículo 26. Reuniones de la Junta Directiva
   La Junta Directiva se reunirá cuantas veces lo determine su Presidente y a petición de la mitad de sus miembros.

   Quedará constituida cuando asista la mitad más uno de sus miembros, adoptándose los acuerdos por mayoría simple.


TÍTULO V - RÉGIMEN ECONÓMICO
================================================================================

Artículo 27. Patrimonio
   El patrimonio de la Asociación está constituido por:
      a) Las cuotas de los socios.
      b) Las subvenciones, donaciones, herencias y legados.
      c) Los bienes muebles e inmuebles.
      d) Los ingresos por actividades propias.
      e) Cualquier otro recurso lícito.

Artículo 28. Cuotas
   Los socios abonarán las siguientes cuotas:
      a) Cuota de ingreso: ${datosAsociacion.cuotaIngreso > 0 ? `${datosAsociacion.cuotaIngreso.toLocaleString('es-ES')} euros` : 'Exenta'}.
      b) Cuota ${datosAsociacion.periodoCuota}: ${datosAsociacion.cuotaPeriodica > 0 ? `${datosAsociacion.cuotaPeriodica.toLocaleString('es-ES')} euros` : 'Exenta'}.

   La Asamblea General podrá modificar las cuotas.

Artículo 29. Ejercicio económico
   El ejercicio económico coincidirá con el año natural, cerrándose el 31 de diciembre.

Artículo 30. Contabilidad
   La Asociación llevará una contabilidad ordenada y adecuada a su actividad, que permita el seguimiento cronológico de las operaciones realizadas.
${datosAsociacion.acogerLey49_2002 ? `
Artículo 31. Régimen fiscal
   La Asociación solicitará su acogimiento al régimen fiscal especial previsto en la Ley 49/2002, de 23 de diciembre, de régimen fiscal de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo, comprometiéndose a cumplir los requisitos establecidos en dicha norma.
` : ''}

TÍTULO VI - DISOLUCIÓN Y LIQUIDACIÓN
================================================================================

Artículo ${datosAsociacion.acogerLey49_2002 ? '32' : '31'}. Causas de disolución
   La Asociación se disolverá:
      a) Por acuerdo de la Asamblea General adoptado por mayoría de 2/3.
      b) Por las causas previstas en la legislación vigente.
      c) Por sentencia judicial firme.

Artículo ${datosAsociacion.acogerLey49_2002 ? '33' : '32'}. Liquidación
   Acordada la disolución, la Asamblea General nombrará una Comisión Liquidadora.

   El patrimonio resultante de la liquidación se destinará a entidades no lucrativas que persigan fines de interés general análogos a los de esta Asociación.


DISPOSICIÓN FINAL
================================================================================

Los presentes Estatutos han sido aprobados en la Asamblea Fundacional celebrada en ${datosAsociacion.localidad || '[LOCALIDAD]'}, a ${fechaActual}.


EL/LA PRESIDENTE/A                           EL/LA SECRETARIO/A


_______________________________           _______________________________
D./Dña. ${presidente?.nombre || '[NOMBRE PRESIDENTE]'}                 D./Dña. ${secretario?.nombre || '[NOMBRE SECRETARIO]'}
`.trim();
  };

  const generarSolicitudRegistro = (): string => {
    const registroCompetente = datosAsociacion.ambitoTerritorial === 'nacional'
      ? 'Registro Nacional de Asociaciones (Ministerio del Interior)'
      : `Registro de Asociaciones de ${datosAsociacion.provincia}`;

    return `
SOLICITUD DE INSCRIPCIÓN EN EL REGISTRO DE ASOCIACIONES
================================================================================

AL ${registroCompetente.toUpperCase()}

DATOS DEL SOLICITANTE (Representante de la Asociación)
--------------------------------------------------------------------------------
Nombre y apellidos: ${presidente?.nombre || '[NOMBRE DEL PRESIDENTE]'}
DNI/NIE: ${presidente?.dni || '[DNI]'}
Domicilio: ${presidente?.domicilio || '[DOMICILIO]'}
Localidad: ${presidente?.localidad || '[LOCALIDAD]'} (${presidente?.provincia || '[PROVINCIA]'})
En calidad de: Presidente/a de la Asociación

DATOS DE LA ASOCIACIÓN
--------------------------------------------------------------------------------
Denominación: ${datosAsociacion.denominacion || '[DENOMINACIÓN]'}
${datosAsociacion.siglas ? `Siglas: ${datosAsociacion.siglas}` : ''}
Domicilio social: ${datosAsociacion.domicilioSocial || '[DIRECCIÓN]'}
Localidad: ${datosAsociacion.localidad || '[LOCALIDAD]'}
Provincia: ${datosAsociacion.provincia || '[PROVINCIA]'}
Código Postal: ${datosAsociacion.codigoPostal || '[CP]'}
Ámbito territorial: ${
  datosAsociacion.ambitoTerritorial === 'local' ? 'Local' :
  datosAsociacion.ambitoTerritorial === 'provincial' ? 'Provincial' :
  datosAsociacion.ambitoTerritorial === 'autonomico' ? 'Autonómico' : 'Nacional'
}

FINES DE LA ASOCIACIÓN
--------------------------------------------------------------------------------
${datosAsociacion.fines.map((f, i) => `${i + 1}. ${f}`).join('\n') || '[FINES DE LA ASOCIACIÓN]'}

ÓRGANOS DE REPRESENTACIÓN (Junta Directiva)
--------------------------------------------------------------------------------
${fundadores.map(f => {
  const cargoNombre = CARGOS_JUNTA.find(c => c.id === f.cargo)?.nombre || '[CARGO]';
  return `${cargoNombre}: ${f.nombre || '[NOMBRE]'} - DNI: ${f.dni || '[DNI]'}`;
}).join('\n')}

SOLICITA
--------------------------------------------------------------------------------
La inscripción de la Asociación arriba indicada en el Registro de Asociaciones correspondiente, a los efectos previstos en la Ley Orgánica 1/2002, de 22 de marzo, reguladora del Derecho de Asociación.

DOCUMENTACIÓN QUE SE ACOMPAÑA
--------------------------------------------------------------------------------
□ Acta Fundacional (original y copia)
□ Estatutos (original y copia, firmados en todas las páginas)
□ Fotocopia del DNI/NIE de todos los fundadores
□ Justificante de pago de la tasa (si procede)
${datosAsociacion.acogerLey49_2002 ? '□ Solicitud de acogimiento a la Ley 49/2002 (se presentará tras la inscripción)' : ''}

DECLARACIÓN RESPONSABLE
--------------------------------------------------------------------------------
El/La solicitante declara bajo su responsabilidad:
- Que todos los datos consignados son ciertos.
- Que la denominación solicitada no coincide ni induce a confusión con otras inscritas.
- Que los fines de la Asociación no son contrarios al ordenamiento jurídico.
- Que los fundadores reúnen los requisitos legales para ejercer el derecho de asociación.

En ${datosAsociacion.localidad || '[LOCALIDAD]'}, a ${fechaActual}.


Firma del solicitante:


_______________________________
D./Dña. ${presidente?.nombre || '[NOMBRE DEL PRESIDENTE]'}


INFORMACIÓN ADICIONAL
================================================================================

REGISTRO COMPETENTE:
${datosAsociacion.ambitoTerritorial === 'nacional'
  ? `- Registro Nacional de Asociaciones
- Ministerio del Interior
- C/ Amador de los Ríos, 7 - 28010 Madrid
- https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/tramites-y-gestiones/asociaciones/`
  : `- Registro de Asociaciones de la Comunidad Autónoma correspondiente
- Consultar en la web de la Consejería competente de ${datosAsociacion.provincia}`
}

TASAS (aproximadas):
- Nacional: ~40€ (consultar tarifa vigente)
- Autonómico: Variable según CCAA (algunas son gratuitas)

PLAZO DE RESOLUCIÓN:
- 3 meses desde la presentación de la solicitud completa
- Silencio administrativo positivo

NOTA IMPORTANTE:
Una vez inscrita la Asociación, deberá:
1. Solicitar el CIF en la Agencia Tributaria (Modelo 036)
2. Darse de alta en el Censo de empresarios (si realiza actividades económicas)
${datosAsociacion.acogerLey49_2002 ? '3. Solicitar el acogimiento a la Ley 49/2002 mediante comunicación a la AEAT' : ''}
`.trim();
  };

  // ============================================
  // NAVEGACIÓN DEL WIZARD
  // ============================================

  const steps: { id: WizardStep; nombre: string; icon: string }[] = [
    { id: 'intro', nombre: 'Introducción', icon: '📋' },
    { id: 'fundadores', nombre: 'Fundadores', icon: '👥' },
    { id: 'datos-basicos', nombre: 'Datos básicos', icon: '🏢' },
    { id: 'fines', nombre: 'Fines y actividades', icon: '🎯' },
    { id: 'cuotas', nombre: 'Cuotas y régimen', icon: '💰' },
    { id: 'revision', nombre: 'Revisión', icon: '✅' },
    { id: 'documentos', nombre: 'Documentos', icon: '📄' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const irAnterior = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1].id);
    }
  };

  const irSiguiente = () => {
    if (currentStepIndex < steps.length - 1 && puedeAvanzar) {
      setStep(steps[currentStepIndex + 1].id);
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
    alert('Documento copiado al portapapeles');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🤝</span>
        <h1 className={styles.title}>Asistente Constitución de Asociación</h1>
        <p className={styles.subtitle}>
          Genera paso a paso los documentos necesarios para constituir tu Asociación sin Ánimo de Lucro
        </p>
      </header>

      <DisclaimerCard variant="financial" severity="critical" />

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={`${styles.progressStep} ${index <= currentStepIndex ? styles.progressStepActive : ''} ${index === currentStepIndex ? styles.progressStepCurrent : ''}`}
              onClick={() => index <= currentStepIndex && setStep(s.id)}
            >
              <span className={styles.progressIcon}>{s.icon}</span>
              <span className={styles.progressLabel}>{s.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className={styles.wizardContent}>

        {/* PASO: Introducción */}
        {step === 'intro' && (
          <div className={styles.stepContent}>
            <h2>👋 Bienvenido al Asistente de Constitución de Asociación</h2>

            <div className={styles.infoCard}>
              <h3>📋 ¿Qué es una Asociación sin Ánimo de Lucro?</h3>
              <p>
                Una asociación es una agrupación de personas físicas o jurídicas que se unen
                para conseguir un fin común de interés general o particular, sin ánimo de lucro.
              </p>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>👥</span>
                <h4>Mínimo 3 fundadores</h4>
                <p>Pueden ser personas físicas o jurídicas. Familiares directos también pueden ser fundadores.</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💰</span>
                <h4>Sin capital mínimo</h4>
                <p>No se requiere aportación de capital inicial obligatoria, aunque puede haberla.</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🛡️</span>
                <h4>Responsabilidad limitada</h4>
                <p>Si está inscrita, el patrimonio de los socios está separado del de la asociación.</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📊</span>
                <h4>Beneficios fiscales</h4>
                <p>Posibilidad de acogerse a la Ley 49/2002 para exenciones y deducciones por donativos.</p>
              </div>
            </div>

            <div className={styles.warningCard}>
              <h4>⚠️ Documentos que generarás</h4>
              <ul>
                <li><strong>Acta Fundacional</strong>: Documento de constitución firmado por todos los fundadores</li>
                <li><strong>Estatutos</strong>: Normas de funcionamiento de la asociación</li>
                <li><strong>Solicitud de inscripción</strong>: Modelo para el Registro de Asociaciones</li>
              </ul>
            </div>

            <p className={styles.introNote}>
              Este asistente te guiará paso a paso. Al finalizar, podrás copiar los documentos
              generados para revisarlos con un profesional antes de su presentación.
            </p>
          </div>
        )}

        {/* PASO: Fundadores */}
        {step === 'fundadores' && (
          <div className={styles.stepContent}>
            <h2>👥 Datos de los Fundadores ({fundadores.length})</h2>
            <p className={styles.stepDescription}>
              Introduce los datos de al menos 3 fundadores. Cada uno debe tener asignado un cargo en la Junta Directiva.
            </p>

            {validarFundadores.length > 0 && (
              <div className={styles.errorList}>
                <h4>⚠️ Corrige los siguientes errores:</h4>
                <ul>
                  {validarFundadores.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.fundadoresList}>
              {fundadores.map((fundador, index) => (
                <div key={fundador.id} className={styles.fundadorCard}>
                  <div className={styles.fundadorHeader}>
                    <h3>Fundador {index + 1}</h3>
                    {fundadores.length > 3 && (
                      <button
                        type="button"
                        className={styles.btnEliminar}
                        onClick={() => eliminarFundador(fundador.id)}
                      >
                        ✕ Eliminar
                      </button>
                    )}
                  </div>

                  <div className={styles.fundadorGrid}>
                    <div className={styles.inputGroup}>
                      <label>Nombre completo *</label>
                      <input
                        type="text"
                        value={fundador.nombre}
                        onChange={(e) => actualizarFundador(fundador.id, 'nombre', e.target.value)}
                        placeholder="Nombre y apellidos"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>DNI/NIE *</label>
                      <input
                        type="text"
                        value={fundador.dni}
                        onChange={(e) => actualizarFundador(fundador.id, 'dni', e.target.value)}
                        placeholder="12345678A"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Nacionalidad</label>
                      <input
                        type="text"
                        value={fundador.nacionalidad}
                        onChange={(e) => actualizarFundador(fundador.id, 'nacionalidad', e.target.value)}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Cargo en Junta Directiva *</label>
                      <select
                        value={fundador.cargo}
                        onChange={(e) => actualizarFundador(fundador.id, 'cargo', e.target.value)}
                      >
                        <option value="">Seleccionar cargo...</option>
                        {CARGOS_JUNTA.map(cargo => {
                          const yaAsignado = fundadores.some(f => f.id !== fundador.id && f.cargo === cargo.id);
                          const esUnico = cargo.id !== 'vocal';
                          return (
                            <option
                              key={cargo.id}
                              value={cargo.id}
                              disabled={esUnico && yaAsignado}
                            >
                              {cargo.nombre} {esUnico && yaAsignado ? '(ya asignado)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className={styles.inputGroupFull}>
                      <label>Domicilio *</label>
                      <input
                        type="text"
                        value={fundador.domicilio}
                        onChange={(e) => actualizarFundador(fundador.id, 'domicilio', e.target.value)}
                        placeholder="Calle, número, piso..."
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Localidad</label>
                      <input
                        type="text"
                        value={fundador.localidad}
                        onChange={(e) => actualizarFundador(fundador.id, 'localidad', e.target.value)}
                        placeholder="Ciudad"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Provincia</label>
                      <select
                        value={fundador.provincia}
                        onChange={(e) => actualizarFundador(fundador.id, 'provincia', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {PROVINCIAS_ESPANA.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Código Postal</label>
                      <input
                        type="text"
                        value={fundador.codigoPostal}
                        onChange={(e) => actualizarFundador(fundador.id, 'codigoPostal', e.target.value)}
                        placeholder="28001"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {fundadores.length < 10 && (
              <button type="button" className={styles.btnAgregar} onClick={agregarFundador}>
                + Añadir otro fundador
              </button>
            )}

            <div className={styles.infoCard}>
              <h4>ℹ️ Sobre los cargos de la Junta Directiva</h4>
              <ul>
                {CARGOS_JUNTA.map(cargo => (
                  <li key={cargo.id}>
                    <strong>{cargo.nombre}</strong>: {cargo.descripcion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* PASO: Datos Básicos */}
        {step === 'datos-basicos' && (
          <div className={styles.stepContent}>
            <h2>🏢 Datos de la Asociación</h2>

            {validarDatosBasicos.length > 0 && (
              <div className={styles.errorList}>
                <h4>⚠️ Corrige los siguientes errores:</h4>
                <ul>
                  {validarDatosBasicos.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.formSection}>
              <h3>Denominación</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroupFull}>
                  <label>Nombre completo de la Asociación *</label>
                  <input
                    type="text"
                    value={datosAsociacion.denominacion}
                    onChange={(e) => actualizarDatos('denominacion', e.target.value)}
                    placeholder="Asociación para el Desarrollo de..."
                  />
                  <span className={styles.inputHint}>
                    Debe incluir la palabra &quot;Asociación&quot; y no coincidir con otras ya inscritas
                  </span>
                </div>
                <div className={styles.inputGroup}>
                  <label>Siglas (opcional)</label>
                  <input
                    type="text"
                    value={datosAsociacion.siglas}
                    onChange={(e) => actualizarDatos('siglas', e.target.value.toUpperCase())}
                    placeholder="ASOC"
                    maxLength={10}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Ámbito territorial</label>
                  <select
                    value={datosAsociacion.ambitoTerritorial}
                    onChange={(e) => actualizarDatos('ambitoTerritorial', e.target.value)}
                  >
                    <option value="local">Local (un municipio)</option>
                    <option value="provincial">Provincial</option>
                    <option value="autonomico">Autonómico</option>
                    <option value="nacional">Nacional</option>
                  </select>
                  <span className={styles.inputHint}>
                    Determina el Registro donde debe inscribirse
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Domicilio Social</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroupFull}>
                  <label>Dirección completa *</label>
                  <input
                    type="text"
                    value={datosAsociacion.domicilioSocial}
                    onChange={(e) => actualizarDatos('domicilioSocial', e.target.value)}
                    placeholder="Calle, número, piso..."
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Localidad *</label>
                  <input
                    type="text"
                    value={datosAsociacion.localidad}
                    onChange={(e) => actualizarDatos('localidad', e.target.value)}
                    placeholder="Ciudad"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Provincia *</label>
                  <select
                    value={datosAsociacion.provincia}
                    onChange={(e) => actualizarDatos('provincia', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {PROVINCIAS_ESPANA.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Código Postal</label>
                  <input
                    type="text"
                    value={datosAsociacion.codigoPostal}
                    onChange={(e) => actualizarDatos('codigoPostal', e.target.value)}
                    placeholder="28001"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h4>📍 Sobre el ámbito territorial</h4>
              <ul>
                <li><strong>Local/Provincial/Autonómico</strong>: Se inscribe en el Registro de la Comunidad Autónoma</li>
                <li><strong>Nacional</strong>: Se inscribe en el Registro Nacional de Asociaciones (Ministerio del Interior)</li>
              </ul>
            </div>
          </div>
        )}

        {/* PASO: Fines y Actividades */}
        {step === 'fines' && (
          <div className={styles.stepContent}>
            <h2>🎯 Fines y Actividades</h2>

            {validarFines.length > 0 && (
              <div className={styles.errorList}>
                <h4>⚠️ Corrige los siguientes errores:</h4>
                <ul>
                  {validarFines.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.formSection}>
              <h3>Fines de la Asociación ({datosAsociacion.fines.length} seleccionados)</h3>
              <p className={styles.stepDescription}>
                Selecciona o añade los fines que perseguirá la asociación. Deben ser de interés general.
              </p>

              <div className={styles.checkboxGrid}>
                {FINES_SUGERIDOS.map(fin => (
                  <label key={fin} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={datosAsociacion.fines.includes(fin)}
                      onChange={() => toggleFin(fin)}
                    />
                    <span>{fin}</span>
                  </label>
                ))}
              </div>

              <div className={styles.addCustom}>
                <input
                  type="text"
                  value={finPersonalizado}
                  onChange={(e) => setFinPersonalizado(e.target.value)}
                  placeholder="Añadir fin personalizado..."
                  onKeyDown={(e) => e.key === 'Enter' && agregarFinPersonalizado()}
                />
                <button type="button" onClick={agregarFinPersonalizado}>Añadir</button>
              </div>

              {datosAsociacion.fines.filter(f => !FINES_SUGERIDOS.includes(f)).length > 0 && (
                <div className={styles.customList}>
                  <h4>Fines personalizados:</h4>
                  {datosAsociacion.fines.filter(f => !FINES_SUGERIDOS.includes(f)).map(fin => (
                    <span key={fin} className={styles.customTag}>
                      {fin}
                      <button type="button" onClick={() => toggleFin(fin)}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <h3>Actividades para cumplir los fines ({datosAsociacion.actividades.length} seleccionadas)</h3>
              <p className={styles.stepDescription}>
                Indica las actividades concretas que desarrollará la asociación.
              </p>

              <div className={styles.checkboxGrid}>
                {ACTIVIDADES_SUGERIDAS.map(actividad => (
                  <label key={actividad} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={datosAsociacion.actividades.includes(actividad)}
                      onChange={() => toggleActividad(actividad)}
                    />
                    <span>{actividad}</span>
                  </label>
                ))}
              </div>

              <div className={styles.addCustom}>
                <input
                  type="text"
                  value={actividadPersonalizada}
                  onChange={(e) => setActividadPersonalizada(e.target.value)}
                  placeholder="Añadir actividad personalizada..."
                  onKeyDown={(e) => e.key === 'Enter' && agregarActividadPersonalizada()}
                />
                <button type="button" onClick={agregarActividadPersonalizada}>Añadir</button>
              </div>

              {datosAsociacion.actividades.filter(a => !ACTIVIDADES_SUGERIDAS.includes(a)).length > 0 && (
                <div className={styles.customList}>
                  <h4>Actividades personalizadas:</h4>
                  {datosAsociacion.actividades.filter(a => !ACTIVIDADES_SUGERIDAS.includes(a)).map(actividad => (
                    <span key={actividad} className={styles.customTag}>
                      {actividad}
                      <button type="button" onClick={() => toggleActividad(actividad)}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO: Cuotas y Régimen */}
        {step === 'cuotas' && (
          <div className={styles.stepContent}>
            <h2>💰 Cuotas y Régimen</h2>

            <div className={styles.formSection}>
              <h3>Cuotas de los socios</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Cuota de ingreso (€)</label>
                  <input
                    type="number"
                    value={datosAsociacion.cuotaIngreso || ''}
                    onChange={(e) => actualizarDatos('cuotaIngreso', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                  <span className={styles.inputHint}>Dejar en 0 si no hay cuota de ingreso</span>
                </div>
                <div className={styles.inputGroup}>
                  <label>Cuota periódica (€)</label>
                  <input
                    type="number"
                    value={datosAsociacion.cuotaPeriodica || ''}
                    onChange={(e) => actualizarDatos('cuotaPeriodica', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Periodicidad</label>
                  <select
                    value={datosAsociacion.periodoCuota}
                    onChange={(e) => actualizarDatos('periodoCuota', e.target.value)}
                  >
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Duración del mandato de la Junta Directiva</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Duración (años)</label>
                  <select
                    value={datosAsociacion.duracionMandatoJunta}
                    onChange={(e) => actualizarDatos('duracionMandatoJunta', parseInt(e.target.value))}
                  >
                    <option value={2}>2 años</option>
                    <option value={3}>3 años</option>
                    <option value={4}>4 años</option>
                    <option value={5}>5 años</option>
                  </select>
                  <span className={styles.inputHint}>Los cargos podrán ser reelegidos</span>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Patrimonio inicial (opcional)</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Patrimonio inicial (€)</label>
                  <input
                    type="number"
                    value={datosAsociacion.patrimonioInicial || ''}
                    onChange={(e) => actualizarDatos('patrimonioInicial', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Descripción del patrimonio</label>
                  <input
                    type="text"
                    value={datosAsociacion.descripcionPatrimonio}
                    onChange={(e) => actualizarDatos('descripcionPatrimonio', e.target.value)}
                    placeholder="Ej: Aportación dineraria de los fundadores"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Régimen fiscal especial</h3>
              <label className={styles.checkboxLarge}>
                <input
                  type="checkbox"
                  checked={datosAsociacion.acogerLey49_2002}
                  onChange={(e) => actualizarDatos('acogerLey49_2002', e.target.checked)}
                />
                <div>
                  <strong>Solicitar acogimiento a la Ley 49/2002</strong>
                  <p>Permite exenciones fiscales y que los donantes puedan deducir sus aportaciones en el IRPF (80% primeros 250€, 40-45% resto)</p>
                </div>
              </label>

              {datosAsociacion.acogerLey49_2002 && (
                <div className={styles.infoCard}>
                  <h4>ℹ️ Requisitos para acogerse a la Ley 49/2002</h4>
                  <ul>
                    <li>Perseguir fines de interés general</li>
                    <li>Destinar al menos el 70% de las rentas a los fines</li>
                    <li>No repartir beneficios entre los socios</li>
                    <li>Los cargos directivos no pueden ser remunerados</li>
                    <li>Elaborar memoria económica anual</li>
                  </ul>
                  <p><strong>Nota:</strong> La solicitud se presenta a la AEAT una vez inscrita la asociación.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO: Revisión */}
        {step === 'revision' && (
          <div className={styles.stepContent}>
            <h2>✅ Revisión de Datos</h2>
            <p className={styles.stepDescription}>
              Revisa todos los datos antes de generar los documentos.
            </p>

            <div className={styles.resumenSection}>
              <h3>📋 Datos de la Asociación</h3>
              <div className={styles.resumenGrid}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Denominación</span>
                  <span className={styles.resumenValue}>{datosAsociacion.denominacion || '-'}</span>
                </div>
                {datosAsociacion.siglas && (
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenLabel}>Siglas</span>
                    <span className={styles.resumenValue}>{datosAsociacion.siglas}</span>
                  </div>
                )}
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Domicilio</span>
                  <span className={styles.resumenValue}>
                    {datosAsociacion.domicilioSocial}, {datosAsociacion.codigoPostal} {datosAsociacion.localidad} ({datosAsociacion.provincia})
                  </span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Ámbito</span>
                  <span className={styles.resumenValue}>
                    {datosAsociacion.ambitoTerritorial.charAt(0).toUpperCase() + datosAsociacion.ambitoTerritorial.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.resumenSection}>
              <h3>👥 Fundadores y Junta Directiva</h3>
              <div className={styles.resumenTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Cargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundadores.map(f => (
                      <tr key={f.id}>
                        <td>{f.nombre || '-'}</td>
                        <td>{f.dni || '-'}</td>
                        <td>{CARGOS_JUNTA.find(c => c.id === f.cargo)?.nombre || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.resumenSection}>
              <h3>🎯 Fines ({datosAsociacion.fines.length})</h3>
              <ul className={styles.resumenList}>
                {datosAsociacion.fines.map((fin, i) => (
                  <li key={i}>{fin}</li>
                ))}
              </ul>
            </div>

            <div className={styles.resumenSection}>
              <h3>📌 Actividades ({datosAsociacion.actividades.length})</h3>
              <ul className={styles.resumenList}>
                {datosAsociacion.actividades.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            <div className={styles.resumenSection}>
              <h3>💰 Régimen económico</h3>
              <div className={styles.resumenGrid}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Cuota de ingreso</span>
                  <span className={styles.resumenValue}>
                    {datosAsociacion.cuotaIngreso > 0 ? `${datosAsociacion.cuotaIngreso} €` : 'Exenta'}
                  </span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Cuota periódica</span>
                  <span className={styles.resumenValue}>
                    {datosAsociacion.cuotaPeriodica > 0
                      ? `${datosAsociacion.cuotaPeriodica} € / ${datosAsociacion.periodoCuota}`
                      : 'Exenta'}
                  </span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Patrimonio inicial</span>
                  <span className={styles.resumenValue}>
                    {datosAsociacion.patrimonioInicial > 0 ? `${datosAsociacion.patrimonioInicial} €` : 'Sin patrimonio inicial'}
                  </span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Ley 49/2002</span>
                  <span className={styles.resumenValue}>
                    {datosAsociacion.acogerLey49_2002 ? '✅ Sí, solicitar acogimiento' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO: Documentos */}
        {step === 'documentos' && (
          <div className={styles.stepContent}>
            <h2>📄 Documentos Generados</h2>
            <p className={styles.stepDescription}>
              Selecciona cada documento para verlo y copiarlo. Revísalos con un profesional antes de firmarlos.
            </p>

            <div className={styles.documentTabs}>
              <button
                type="button"
                className={`${styles.docTab} ${documentoActivo === 'acta' ? styles.docTabActive : ''}`}
                onClick={() => setDocumentoActivo('acta')}
                aria-pressed={documentoActivo === 'acta'}
              >
                <span aria-hidden="true">📋</span> Acta Fundacional
              </button>
              <button
                type="button"
                className={`${styles.docTab} ${documentoActivo === 'estatutos' ? styles.docTabActive : ''}`}
                onClick={() => setDocumentoActivo('estatutos')}
                aria-pressed={documentoActivo === 'estatutos'}
              >
                <span aria-hidden="true">📜</span> Estatutos
              </button>
              <button
                type="button"
                className={`${styles.docTab} ${documentoActivo === 'solicitud' ? styles.docTabActive : ''}`}
                onClick={() => setDocumentoActivo('solicitud')}
                aria-pressed={documentoActivo === 'solicitud'}
              >
                <span aria-hidden="true">📝</span> Solicitud Registro
              </button>
            </div>

            <div className={styles.documentPreview}>
              <div className={styles.documentHeader}>
                <h3>
                  {documentoActivo === 'acta' && '📋 Acta Fundacional'}
                  {documentoActivo === 'estatutos' && '📜 Estatutos'}
                  {documentoActivo === 'solicitud' && '📝 Solicitud de Inscripción'}
                </h3>
                <button
                  type="button"
                  className={styles.btnCopiar}
                  onClick={() => copiarAlPortapapeles(
                    documentoActivo === 'acta' ? generarActaFundacional() :
                    documentoActivo === 'estatutos' ? generarEstatutos() :
                    generarSolicitudRegistro()
                  )}
                >
                  <span aria-hidden="true">📋</span> Copiar documento
                </button>
              </div>
              <pre className={styles.documentText}>
                {documentoActivo === 'acta' && generarActaFundacional()}
                {documentoActivo === 'estatutos' && generarEstatutos()}
                {documentoActivo === 'solicitud' && generarSolicitudRegistro()}
              </pre>
            </div>

            <div className={styles.warningCard}>
              <h4>⚠️ Pasos siguientes</h4>
              <ol>
                <li>Revisa los documentos con un abogado o gestor</li>
                <li>Todos los fundadores deben firmar el Acta y los Estatutos</li>
                <li>Presenta la documentación en el Registro de Asociaciones correspondiente</li>
                <li>Una vez inscrita, solicita el CIF en la Agencia Tributaria</li>
                {datosAsociacion.acogerLey49_2002 && (
                  <li>Solicita el acogimiento a la Ley 49/2002 ante la AEAT</li>
                )}
              </ol>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className={styles.wizardNav}>
          {step !== 'intro' && (
            <button type="button" className={styles.btnSecondary} onClick={irAnterior}>
              ← Anterior
            </button>
          )}
          {step !== 'documentos' && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={irSiguiente}
              disabled={!puedeAvanzar}
            >
              {step === 'revision' ? 'Generar documentos →' : 'Siguiente →'}
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Este asistente genera documentos orientativos basados en la normativa general de asociaciones
          (Ley Orgánica 1/2002). <strong>Los documentos generados NO constituyen asesoramiento jurídico</strong> y
          deben ser revisados por un profesional antes de su firma y presentación.
        </p>
        <p>
          Cada Comunidad Autónoma puede tener requisitos específicos adicionales. meskeIA no se hace
          responsable de errores u omisiones en los documentos generados ni de las consecuencias de su uso.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre Asociaciones?"
        subtitle="Guía completa sobre constitución, gestión y fiscalidad de asociaciones sin ánimo de lucro"
      >
        <section className={styles.guideSection}>
          <h2>Guía de Asociaciones sin Ánimo de Lucro</h2>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>👥 ¿Cuántos fundadores necesito?</h4>
              <p>
                Mínimo 3 personas físicas o jurídicas. Pueden ser familiares directos
                (cónyuge, hijos mayores de edad) sin ningún problema legal.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>💼 ¿Puede la asociación tener empleados?</h4>
              <p>
                Sí, la asociación puede contratar trabajadores, incluso a sus propios socios,
                siempre que las funciones laborales estén diferenciadas de los cargos directivos.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>🛡️ ¿Cuál es la responsabilidad de los socios?</h4>
              <p>
                Si la asociación está inscrita en el Registro, el patrimonio de los socios
                está completamente separado del de la asociación. Los socios no responden
                con su patrimonio personal de las deudas de la entidad.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>📊 ¿Qué beneficios fiscales tiene?</h4>
              <p>
                Acogida a la Ley 49/2002, la asociación puede tener exenciones en el IS y los
                donantes pueden deducir el 80% de los primeros 250€ donados y el 40-45% del resto
                en su declaración del IRPF.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>💰 ¿Donativo vs Cuota de servicio?</h4>
              <p>
                Los donativos (sin contraprestación) están exentos. Las cuotas por servicios
                (ej: freemium) tributan en IS y llevan IVA del 21%. Es importante diferenciar
                ambos conceptos en la contabilidad.
              </p>
            </div>

            <div className={styles.guideCard}>
              <h4>📋 ¿Qué registro debo usar?</h4>
              <p>
                Si el ámbito es autonómico o inferior, el Registro de la Comunidad Autónoma.
                Si el ámbito es nacional, el Registro Nacional de Asociaciones del Ministerio del Interior.
              </p>
            </div>
          </div>
        </section>

        {/* ===== TABLA COMPARATIVA ===== */}
        <section className={styles.guideSection}>
          <h2>Comparativa: Asociación vs otras formas jurídicas sin ánimo de lucro</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Asociación</th>
                  <th>Fundación</th>
                  <th>Cooperativa</th>
                  <th>SL sin ánimo de lucro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Capital mínimo</td>
                  <td>Sin mínimo legal</td>
                  <td>Variable según CCAA (habitualmente 30.000 €)</td>
                  <td>3.000 € (variable por CCAA)</td>
                  <td>3.000 € (capital social SL)</td>
                </tr>
                <tr>
                  <td>Socios / fundadores</td>
                  <td>Mínimo 3 personas</td>
                  <td>1 o más fundadores (personas físicas o jurídicas)</td>
                  <td>Mínimo 3 socios cooperativistas</td>
                  <td>1 o más socios</td>
                </tr>
                <tr>
                  <td>Ánimo de lucro</td>
                  <td>No — beneficios reinvertidos</td>
                  <td>No — patrimonio afectado a fines</td>
                  <td>Parcial — reparto limitado entre socios</td>
                  <td>Formalmente sí, aunque sin reparto real</td>
                </tr>
                <tr>
                  <td>Tipo IS general</td>
                  <td>10 % (Ley 49/2002) o 25 %</td>
                  <td>10 % (Ley 49/2002) o 25 %</td>
                  <td>20 % (cooperativas protegidas)</td>
                  <td>25 % (tipo general)</td>
                </tr>
                <tr>
                  <td>Deducción para donantes</td>
                  <td>Sí, con Ley 49/2002</td>
                  <td>Sí, con Ley 49/2002</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Obligaciones contables</td>
                  <td>Simplificadas (ingresos &lt; 150.000 €)</td>
                  <td>Completas y auditoría si supera umbrales</td>
                  <td>Plan Contable de Cooperativas</td>
                  <td>Plan General Contable (PGC)</td>
                </tr>
                <tr>
                  <td>Complejidad administrativa</td>
                  <td>Baja</td>
                  <td>Alta (Protectorado + Registro)</td>
                  <td>Media</td>
                  <td>Media-alta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== CASOS DE USO ===== */}
        <section className={styles.guideSection}>
          <h2>Casos de uso: ¿cuándo elegir una asociación?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏘️</span>
                <h4>Asociación cultural de vecinos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un grupo de 3 vecinos quiere crear una asociación cultural para organizar eventos en el barrio.
                Con 3 fundadores es suficiente. Los estatutos pueden ser sencillos. Se registra en el Registro
                de Asociaciones de la CCAA. Se financia con cuotas de socios y subvenciones municipales,
                que están exentas del IS si se destinan a los fines propios.
              </p>
              <div className={styles.escenarioTip}>
                Registro: CCAA correspondiente — Plazo estimado: 1 a 3 meses
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <h4>ONG de ayuda humanitaria (Ley 49/2002)</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una ONG que quiere que sus donantes puedan deducirse el 80 % de los primeros 250 € y el
                40-45 % del resto debe solicitar la acreditación del Ministerio de Hacienda. Obligaciones:
                presentar memoria de actividades, destinar al menos el 70 % de rentas a fines,
                transparencia en la web y presentar el modelo 182 con los donantes.
              </p>
              <div className={styles.escenarioTip}>
                Requiere acreditación Hacienda — Muy recomendable para captar donaciones
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚽</span>
                <h4>Club deportivo amateur</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un club de fútbol sala amateur se registra como asociación deportiva ante la federación
                autonómica. Necesita seguros de responsabilidad civil y de accidentes para los participantes.
                Las licencias federativas son obligatorias para competir. El modelo fiscal es simplificado
                si los ingresos anuales no superan los 150.000 €.
              </p>
              <div className={styles.escenarioTip}>
                Registro adicional: Federación deportiva autonómica o nacional
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🩺</span>
                <h4>Asociación profesional (médicos, ingenieros)</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una asociación con objeto representativo de una profesión puede inscribirse en el Registro
                Nacional. Las cuotas que pagan los socios por la defensa de sus intereses profesionales
                pueden ser deducibles como gasto en el IRPF del asociado (hasta 500 € anuales por cuotas
                a sindicatos y colegios profesionales). El objeto estatutario debe ser claro y representativo.
              </p>
              <div className={styles.escenarioTip}>
                Cuotas deducibles en IRPF como gasto del trabajo — Hasta 500 € anuales
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Puede una asociación sin ánimo de lucro vender productos o servicios?</h4>
              <p>
                Sí, pero con matices importantes. Puede realizar actividades económicas siempre que el
                beneficio se destine a los fines estatutarios y no se reparta entre los socios. Las rentas
                derivadas de actividades relacionadas con los fines propios pueden estar exentas en el IS.
                Las actividades ajenas a los fines tributan al tipo general (25 %).
              </p>
              <span className={styles.faqTip}>Clave: separar contablemente actividades exentas y no exentas</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Los miembros de la junta directiva pueden cobrar por su trabajo?</h4>
              <p>
                Los cargos directivos son gratuitos por defecto. Los estatutos pueden prever retribución,
                pero en ese caso la asociación pierde la posibilidad de acogerse a Ley 49/2002 (que exige
                gratuidad de los cargos). Sí es posible contratar laboralmente a socios para tareas distintas
                de las funciones directivas, con contrato, nómina y cotización a la Seguridad Social.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué obligaciones fiscales tiene una asociación?</h4>
              <p>
                Toda asociación debe presentar el Impuesto sobre Sociedades (modelo 200) aunque el resultado
                sea cero. Si tiene trabajadores, debe gestionar retenciones (IRPF) y cuotas a la Seguridad
                Social. Si realiza actividades sujetas a IVA, debe presentar los modelos 303 y 390.
                Las entidades acogidas a Ley 49/2002 presentan además el modelo 182 si reciben donaciones.
              </p>
              <span className={styles.faqTip}>Sanción formal por no presentar IS aunque sea a cero: 200 €</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se acoge una asociación a la Ley 49/2002 para obtener más beneficios fiscales?</h4>
              <p>
                Debe reunir los requisitos del artículo 3 de la Ley 49/2002: fines de interés general,
                gratuidad de los cargos directivos, destino del 70 % de rentas a los fines, no distribución
                del patrimonio entre socios, y no desarrollar explotaciones económicas ajenas a los fines.
                Se comunica mediante el modelo 036 marcando la casilla correspondiente. Hacienda puede
                verificar el cumplimiento.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puede una asociación recibir subvenciones públicas?</h4>
              <p>
                Sí, y es una de las fuentes de financiación más habituales. Las subvenciones están exentas
                del IS si se destinan a los fines propios. Requieren justificación documental exhaustiva:
                facturas, contratos, memorias de actividad y declaración de otros ingresos. La Intervención
                General puede auditar la cuenta justificativa con posterioridad.
              </p>
              <span className={styles.faqTip}>Guarda todos los justificantes durante al menos 5 años</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si una asociación genera beneficios económicos?</h4>
              <p>
                Los beneficios (superávit) no pueden repartirse entre los socios. Deben reinvertirse en los
                fines de la asociación o constituir reservas. Si el superávit persiste y se destina a
                actividades distintas a los fines, puede tributar en IS. Una asociación que sistemáticamente
                genera y distribuye beneficios encubiertos puede ser investigada por Hacienda por simulación.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se disuelve una asociación y qué pasa con sus bienes?</h4>
              <p>
                La disolución se acuerda en asamblea general extraordinaria (con quórum estatutario) o por
                resolución judicial. El patrimonio remanente no puede entregarse a los socios: los estatutos
                deben prever su destino a entidades de interés general. Si los estatutos están acogidos a
                Ley 49/2002, el destino debe ser obligatoriamente otra entidad acogida a dicha ley. Se
                inscribe la disolución en el Registro.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuánto tarda inscribir una asociación en el registro?</h4>
              <p>
                Los plazos legales son de 3 meses (Registro Nacional) o variables por CCAA (generalmente
                entre 1 y 3 meses). En la práctica, la Comunidad de Madrid suele resolverlo en 4-8 semanas,
                otras CCAA pueden tardar más. El silencio administrativo positivo opera a los 3 meses: si no
                hay resolución, la asociación se considera inscrita. Durante la tramitación puede operar con
                el NIF provisional obtenido en Hacienda.
              </p>
              <span className={styles.faqTip}>Silencio positivo a los 3 meses — puedes operar con NIF provisional</span>
            </div>
          </div>
        </section>

        {/* ===== GUÍA PASO A PASO ===== */}
        <section className={styles.guideSection}>
          <h2>Guía paso a paso: constituir tu asociación</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Reunión de fundadores y acta fundacional</h4>
                <p>
                  Convoca a los mínimo 3 fundadores (personas físicas mayores de edad o jurídicas). En la reunión
                  constitutiva se aprueba la denominación, el domicilio social, los fines y se firma el acta
                  fundacional. Todos los fundadores deben firmar el acta con sus datos identificativos completos
                  (nombre, DNI/NIE, domicilio) y el cargo que asumen en la junta directiva provisional.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Redacción de estatutos</h4>
                <p>
                  Los estatutos son el documento constitutivo más importante. Deben contener: denominación y
                  domicilio, objeto y actividades, ámbito territorial, condiciones de socios y causas de
                  expulsión, órganos de gobierno (asamblea general y junta directiva), régimen económico,
                  procedimiento de modificación de estatutos y causas y procedimiento de disolución.
                  Este asistente genera estatutos adaptados a tu caso.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Presentación en el Registro correspondiente</h4>
                <p>
                  Si el ámbito es autonómico o inferior, dirígete al Registro de Asociaciones de tu Comunidad
                  Autónoma. Si el ámbito es nacional (actividad en más de una CCAA), al Registro Nacional de
                  Asociaciones del Ministerio del Interior. Documentos a presentar: solicitud, acta fundacional,
                  estatutos y fotocopia del DNI de los fundadores. La mayoría de CCAA admite presentación
                  telemática.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Obtención del NIF provisional en Hacienda (modelo 036)</h4>
                <p>
                  Antes o simultáneamente al registro, presenta el modelo 036 en la AEAT para obtener el NIF
                  provisional de la asociación. Necesitarás: acta fundacional firmada, estatutos y fotocopia del
                  DNI del representante (presidente). El NIF provisional permite abrir cuenta bancaria y operar
                  durante la tramitación del registro. Una vez inscrita, se obtiene el NIF definitivo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Apertura de cuenta bancaria a nombre de la asociación</h4>
                <p>
                  Con el acta fundacional y el NIF provisional puedes abrir una cuenta corriente a nombre de la
                  asociación en cualquier entidad bancaria. Algunos bancos piden también los estatutos y el
                  acuerdo de apertura de cuenta firmado por la junta directiva. La cuenta debe estar a nombre
                  de la asociación (no de ningún socio a título personal) para garantizar la separación patrimonial.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Alta en censos fiscales y obligaciones contables</h4>
                <p>
                  Una vez inscrita, actualiza el modelo 036 con el NIF definitivo. Si tienes trabajadores, alta en
                  Seguridad Social como empresa. Las obligaciones contables dependen del volumen: si los ingresos
                  anuales son inferiores a 150.000 € y el activo no supera 150.000 €, puedes llevar contabilidad
                  simplificada. Si superas esos umbrales, debes llevar contabilidad según el Plan de Contabilidad
                  para Entidades sin Fines Lucrativos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MEJORES PRÁCTICAS ===== */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para gestionar tu asociación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <p>
                <strong>Define el objeto social de forma amplia pero coherente.</strong> Los cambios
                posteriores en el objeto o la denominación requieren asamblea extraordinaria, modificación
                de estatutos y nuevo trámite registral. Pensar bien los fines desde el inicio ahorra
                tiempo y coste.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <p>
                <strong>Separa contablemente las actividades exentas de las no exentas.</strong> Las
                actividades relacionadas con los fines propios pueden estar exentas en el IS; las
                actividades económicas ajenas tributan al 25 %. Una contabilidad analítica clara es
                fundamental para demostrar la separación ante Hacienda.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <p>
                <strong>Lleva actas de todas las asambleas y reuniones de junta directiva.</strong> Es
                obligatorio y además protege a los directivos: los acuerdos adoptados deben poder
                acreditarse en caso de controversia o inspección. El secretario firma las actas y las
                custodia en el libro de actas.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📁</span>
              <p>
                <strong>Si recibes subvenciones, prepárate para la justificación documental.</strong>
                Guarda facturas, contratos, hojas de asistencia, fotografías de eventos y cualquier
                documento acreditativo. La cuenta justificativa debe presentarse en el plazo fijado
                por la entidad concedente, y la Intervención puede auditar durante 5 años.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⭐</span>
              <p>
                <strong>Para acceder a Ley 49/2002 necesitas acreditación del Ministerio de Hacienda.</strong>
                Comunícalo en el modelo 036. Hacienda puede comprobar el cumplimiento de todos los
                requisitos (gratuidad de cargos, destino del 70 % de rentas, etc.). La acreditación
                permite ofrecer a tus donantes las mayores deducciones fiscales.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <p>
                <strong>Renueva los cargos directivos dentro de los plazos estatutarios.</strong> Los
                estatutos fijan la duración del mandato (habitualmente 2-4 años). Los actos realizados
                por directivos con mandato caducado pueden ser impugnables. Convoca la asamblea con
                suficiente antelación para garantizar continuidad.
              </p>
            </div>
          </div>
        </section>

        {/* ===== WARNING BOX ===== */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores frecuentes que debes evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Actuar como empresa bajo forma de asociación.</strong> Un objeto lucrativo encubierto
                (vender servicios con ánimo de lucro real para los socios) puede llevar a Hacienda a recalificar
                la entidad como sociedad mercantil y aplicar sanciones por las diferencias tributarias.
              </li>
              <li>
                <strong>No presentar el modelo 182</strong> (declaración informativa de donantes) si recibes
                donaciones acogidas a Ley 49/2002. Es obligatorio antes del 31 de enero del año siguiente y
                su omisión conlleva sanción proporcional al importe de las donaciones no declaradas.
              </li>
              <li>
                <strong>Olvidar presentar el Impuesto sobre Sociedades</strong> aunque el resultado sea cero
                o negativo. La sanción formal por no presentar el modelo 200 es de 200 €, independientemente
                de que no haya cuota a ingresar.
              </li>
              <li>
                <strong>No renovar los cargos directivos en plazo.</strong> Los actos realizados por cargos
                con mandato caducado (compras, contratos, representación ante terceros) pueden ser impugnables
                por los socios o por la contraparte afectada.
              </li>
              <li>
                <strong>Usar el patrimonio de la asociación para beneficio personal</strong> de socios o
                directivos. Esto puede generar responsabilidad civil por daños a la entidad y, en casos
                graves, responsabilidad penal por apropiación indebida o administración desleal.
              </li>
              <li>
                <strong>No distinguir entre cuotas de socios y servicios a terceros.</strong> Las cuotas de
                socios destinadas a los fines propios están exentas de IVA e IS. Sin embargo, los servicios
                prestados a no socios o las cuotas con contraprestación directa están sujetos a IVA (21 %)
                e IS al tipo correspondiente.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('asistente-constitucion-asociacion')} />
      <ShareCard appName="asistente-constitucion-asociacion" />
      <Footer appName="asistente-constitucion-asociacion" />
    </div>
  );
}
