'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ConversorCnaeIae.module.css';
import {
  MeskeiaLogo,
  LegalNotice,
  RegionBadge,
  DisclaimerCard,
  DataReference,
  EducationalSection,
  RelatedApps,
  ShareCard,
  Footer,
} from '@/components';
import { formatDate, formatNumber, parseISODateLocal } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  SECCIONES_IAE,
  IAE_EXENCION,
  CNAE_VIGENCIA,
  CNAE_IAE_RUTA_CATALOGO,
} from '@/data/fiscal';

// ─── Tipos del catálogo oficial (public/datos/cnae-iae-catalogo.json) ────────

type NivelCnae = 'seccion' | 'division' | 'grupo' | 'clase';
type TipoIae = 'division' | 'agrupacion' | 'grupo' | 'epigrafe';
type SeccionIae = '1ª' | '2ª' | '3ª';

interface EntradaCnae {
  codigo: string;
  titulo: string;
  nivel: NivelCnae;
}

interface EntradaIae {
  seccion: SeccionIae;
  codigo: string;
  tipo: TipoIae;
  titulo: string;
}

interface FuenteMeta {
  fuente: string;
  urlOficial: string;
  nota: string;
}

interface MetaCatalogo {
  generado: string;
  iae: FuenteMeta;
  cnae: FuenteMeta;
  advertencia: string;
}

interface Catalogo {
  meta: MetaCatalogo;
  iae: EntradaIae[];
  cnae: EntradaCnae[];
  correspondencia: Record<string, string[]>;
  correspondenciaInversa: Record<string, string[]>;
  sinonimos: Record<string, string[]>;
}

interface CnaeIndexada extends EntradaCnae {
  seccionLetra: string;
  codigoDigitos: string;
  sinonimos: string[];
  textoBusqueda: string;
}

interface IaeIndexada extends EntradaIae {
  codigoDigitos: string;
  textoBusqueda: string;
}

interface PasoJerarquia {
  etiqueta: string;
  texto: string;
}

type EstadoCarga = 'cargando' | 'listo' | 'error';
type Pestana = 'cnae' | 'iae';

// ─── Constantes ──────────────────────────────────────────────────────────────

// Con criterio de búsqueda, 10 resultados bastan para reconocer la actividad; más
// solo alarga el scroll. Y SIN criterio no se lista nada: el catálogo entero por
// orden alfabético empieza en "Cultivo de cereales", que no le sirve a nadie.
const LIMITE_RESULTADOS = 10;
/*
 * La ruta la exporta el módulo de datos con ese fin explícito («Las apps hacen
 * fetch(CNAE_IAE_RUTA_CATALOGO)»), y hasta hoy no la usaba nadie: estaba redeclarada aquí.
 * Si el generador cambiara la ruta y se actualizara el módulo, esta app seguiría pidiendo
 * la antigua y caería en «No se han podido cargar los catálogos» sin que ningún candado lo
 * viera (hallazgo 426).
 */
const RUTA_CATALOGO = CNAE_IAE_RUTA_CATALOGO;

/**
 * La Sección 2ª del IAE, leída del módulo. Los porcentajes de retención son dato normativo
 * y el comentario de `data/fiscal/cnae-iae.ts` lo dice sin rodeos: «Fuente única de estos
 * textos: las apps NO deben redactar los suyos, porque el dato que contienen (los
 * porcentajes de retención) es normativo y divergiría» (hallazgo 425).
 */
const SECCION_PROFESIONAL = SECCIONES_IAE.find((s) => s.seccion === '2ª')!;

const EJEMPLOS_CNAE: string[] = [
  'hago páginas web',
  'peluquería',
  'tienda de barrio',
  'fotógrafo',
  'reformas',
  '4711',
];

const EJEMPLOS_IAE: string[] = [
  'peluquería',
  'comercio al por menor',
  'enseñanza',
  'pintura',
  '505.6',
];

const NIVEL_ETIQUETA: Record<NivelCnae, string> = {
  seccion: 'Sección',
  division: 'División',
  grupo: 'Grupo',
  clase: 'Clase',
};

const TIPO_ETIQUETA: Record<TipoIae, string> = {
  division: 'División',
  agrupacion: 'Agrupación',
  grupo: 'Grupo',
  epigrafe: 'Epígrafe',
};

const PESO_NIVEL_CNAE: Record<NivelCnae, number> = {
  clase: 0,
  grupo: 1,
  division: 2,
  seccion: 3,
};

const PESO_TIPO_IAE: Record<TipoIae, number> = {
  epigrafe: 0,
  grupo: 1,
  agrupacion: 2,
  division: 3,
};

// Las secciones del IAE son dato normativo: viven en data/fiscal/cnae-iae.ts para
// que su contrato de vigilancia sea el mismo que el del resto de datos fiscales.
// Aquí solo se les añade la clase de color que usa esta interfaz.
const CLASE_SECCION: Record<SeccionIae, string> = {
  '1ª': styles.seccion1,
  '2ª': styles.seccion2,
  '3ª': styles.seccion3,
};

// ─── Utilidades de texto ─────────────────────────────────────────────────────

/** Minúsculas y sin acentos, para que «diseño gráfico» encuentre «Diseno Grafico». */
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Deja solo los dígitos: «47.11» → «4711». */
function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/**
 * ¿La consulta aparece como PALABRA COMPLETA en el texto (delimitada por espacios o los
 * extremos), y no solo como fragmento dentro de otra palabra?
 *
 * Sin esto, «bar» encontraba antes «barnices» (subcadena accidental en el título) que el
 * sinónimo EXACTO «bar» de 56.30 «Servicios de bebidas», que solo aparece en textoBusqueda
 * porque el título no lo menciona. Los dos entraban en el mismo nivel de relevancia
 * (hallazgo 479): esta función separa uno de otro.
 */
function coincidePalabraCompleta(texto: string, consulta: string): boolean {
  if (!consulta) return false;
  const escapada = consulta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)${escapada}(\\s|$)`).test(texto);
}

/**
 * Garantiza que el corte visible (`limite`) incluya al menos una entrada de cada sección
 * presente en el conjunto ORDENADO completo, sin reordenar lo demás.
 *
 * Sin esto, una búsqueda cuyos resultados se reparten entre secciones puede dejar una
 * sección entera por debajo del corte, aunque tenga entradas relevantes: la Sección es «la
 * distinción con más efecto práctico sobre tus facturas» (retención de IRPF), así que
 * ocultarla del corte por defecto es el defecto que más importa de esta app (hallazgo 480).
 */
function conRepresentacionDeSeccion<T>(
  ordenados: T[],
  limite: number,
  seccionDe: (item: T) => string,
): T[] {
  if (ordenados.length <= limite) return ordenados;
  const prefijo = ordenados.slice(0, limite);
  const vistas = new Set(prefijo.map(seccionDe));
  const faltantes: T[] = [];
  for (const item of ordenados.slice(limite)) {
    const seccion = seccionDe(item);
    if (!vistas.has(seccion)) {
      vistas.add(seccion);
      faltantes.push(item);
    }
  }
  if (faltantes.length === 0) return prefijo;

  // Solo se puede sacrificar una entrada del prefijo cuya sección tenga OTRA representante
  // en el propio prefijo: si no, esa sección desaparecería del corte, que es justo lo que
  // esta función existe para evitar (hallazgo 522, la 3ª/04 salía del corte de «deporte»
  // aunque ya se viera antes de la reparación). Se recorta desde el final (lo menos
  // relevante) y, si no hay bastantes candidatos seguros, el corte crece en vez de perder
  // una sección que ya estaba representada.
  const cuentaEnPrefijo = new Map<string, number>();
  for (const item of prefijo) {
    const seccion = seccionDe(item);
    cuentaEnPrefijo.set(seccion, (cuentaEnPrefijo.get(seccion) ?? 0) + 1);
  }
  const descartables: T[] = [];
  for (let i = prefijo.length - 1; i >= 0 && descartables.length < faltantes.length; i--) {
    const item = prefijo[i];
    const seccion = seccionDe(item);
    const cuenta = cuentaEnPrefijo.get(seccion)!;
    if (cuenta > 1) {
      descartables.push(item);
      cuentaEnPrefijo.set(seccion, cuenta - 1);
    }
  }
  const aDescartar = new Set(descartables);
  const conservados = prefijo.filter((item) => !aDescartar.has(item));
  const visibles = new Set([...conservados, ...faltantes]);
  // Se mantiene el orden de relevancia original: solo cambia QUÉ entra en el corte.
  return ordenados.filter((item) => visibles.has(item));
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function ConversorCnaeIaePage() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [pestana, setPestana] = useState<Pestana>('cnae');

  const [consultaCnae, setConsultaCnae] = useState('');
  const [seccionCnae, setSeccionCnae] = useState<string>('todas');
  const [consultaIae, setConsultaIae] = useState('');
  const [seccionIae, setSeccionIae] = useState<'todas' | SeccionIae>('todas');
  /**
   * El tope de 10 resultados venía con el consejo «afina la búsqueda para ver el resto»,
   * inaplicable a una consulta POR CÓDIGO: cambiar los cuatro dígitos rompe la detección
   * del código antiguo, y el filtro por sección no baja de 10 cuando 31 de las 32 clases
   * están en la misma. Con 4791 —comercio electrónico, de los más frecuentes en altas
   * recientes— 22 de sus 32 clases eran inalcanzables (Inspector, 20/08/2026).
   */
  const [verTodosCnae, setVerTodosCnae] = useState(false);
  const [verTodosIae, setVerTodosIae] = useState(false);

  const inputCnaeRef = useRef<HTMLInputElement>(null);
  const inputIaeRef = useRef<HTMLInputElement>(null);

  // Carga diferida del catálogo (más de 300 KB): nunca dentro del bundle
  useEffect(() => {
    let cancelado = false;

    async function cargar(): Promise<void> {
      try {
        const respuesta = await fetch(RUTA_CATALOGO);
        if (!respuesta.ok) {
          throw new Error(`HTTP ${respuesta.status}`);
        }
        const datos = (await respuesta.json()) as Catalogo;
        if (!cancelado) {
          setCatalogo(datos);
          setEstado('listo');
        }
      } catch {
        if (!cancelado) {
          setEstado('error');
        }
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // Foco en el buscador de la pestaña activa una vez cargado el catálogo
  useEffect(() => {
    if (estado !== 'listo') return;
    const destino = pestana === 'cnae' ? inputCnaeRef.current : inputIaeRef.current;
    destino?.focus();
  }, [estado, pestana]);

  // ─── Índices de búsqueda ───────────────────────────────────────────────────

  const cnaeIndexado = useMemo<CnaeIndexada[]>(() => {
    if (!catalogo) return [];
    let seccionActual = '';
    const seccionPorDivision: Record<string, string> = {};

    // El catálogo va en orden jerárquico: cada división hereda la última sección leída
    for (const entrada of catalogo.cnae) {
      if (entrada.nivel === 'seccion') {
        seccionActual = entrada.codigo;
      } else if (entrada.nivel === 'division') {
        seccionPorDivision[entrada.codigo] = seccionActual;
      }
    }

    return catalogo.cnae.map((entrada) => {
      const division = entrada.nivel === 'seccion' ? '' : entrada.codigo.slice(0, 2);
      const seccionLetra =
        entrada.nivel === 'seccion' ? entrada.codigo : seccionPorDivision[division] ?? '';
      const sinonimos = catalogo.sinonimos[entrada.codigo] ?? [];
      return {
        ...entrada,
        seccionLetra,
        codigoDigitos: soloDigitos(entrada.codigo),
        sinonimos,
        textoBusqueda: normalizarTexto(
          `${entrada.codigo} ${entrada.titulo} ${sinonimos.join(' ')}`
        ),
      };
    });
  }, [catalogo]);

  const mapaCnae = useMemo<Record<string, EntradaCnae>>(() => {
    const mapa: Record<string, EntradaCnae> = {};
    for (const entrada of cnaeIndexado) {
      mapa[entrada.codigo] = entrada;
    }
    return mapa;
  }, [cnaeIndexado]);

  const seccionesCnae = useMemo<EntradaCnae[]>(
    () => cnaeIndexado.filter((entrada) => entrada.nivel === 'seccion'),
    [cnaeIndexado]
  );

  const iaeIndexado = useMemo<IaeIndexada[]>(() => {
    if (!catalogo) return [];

    // Título de cada entrada por sección+código, para que los hijos hereden el de sus
    // padres en el índice de búsqueda.
    const tituloPorCodigo: Record<string, string> = {};
    for (const entrada of catalogo.iae) {
      tituloPorCodigo[`${entrada.seccion}|${entrada.codigo}`] = entrada.titulo;
    }

    /**
     * 40 epígrafes tienen título DEPENDIENTE del grupo («De cinco tenedores», «De un
     * tenedor», «De categoría especial»…). Con el índice limitado a su propio título,
     * buscar la palabra natural de la actividad devolvía el grupo pero jamás el
     * epígrafe, que es el código que se declara en el modelo 036/037: «restaurante» no
     * sacaba ni uno de los 671.1 a 671.5 (Inspector, 20/08/2026).
     */
    const titulosDeLosPadres = (entrada: (typeof catalogo.iae)[number]): string => {
      // SOLO el grupo del que cuelga, nunca la agrupación ni la división: heredar la
      // división entera metía «COMERCIO, RESTAURANTES Y HOSPEDAJE» en los 216 epígrafes
      // que cuelgan de ella, y «restaurante» pasaba de no encontrar ninguno a devolver
      // 216 con los correctos fuera de los diez primeros. El grupo es el padre que da
      // sentido al título dependiente, y basta con él.
      if (entrada.tipo !== 'epigrafe') return '';
      const raiz = entrada.codigo.split('.')[0];
      return tituloPorCodigo[`${entrada.seccion}|${raiz}`] ?? '';
    };

    return catalogo.iae.map((entrada) => ({
      ...entrada,
      codigoDigitos: soloDigitos(entrada.codigo),
      textoBusqueda: normalizarTexto(
        `${entrada.codigo} ${entrada.titulo} ${titulosDeLosPadres(entrada)}`,
      ),
    }));
  }, [catalogo]);

  const mapaIae = useMemo<Record<string, EntradaIae>>(() => {
    const mapa: Record<string, EntradaIae> = {};
    for (const entrada of iaeIndexado) {
      mapa[`${entrada.seccion}|${entrada.codigo}`] = entrada;
    }
    return mapa;
  }, [iaeIndexado]);

  // ─── Búsqueda en la CNAE-2025 ──────────────────────────────────────────────

  const consultaCnaeNormalizada = normalizarTexto(consultaCnae);
  const digitosConsultaCnae = soloDigitos(consultaCnae);

  /**
   * ¿El código tecleado existe TAMBIÉN como clase vigente? Son 26 códigos que están en
   * las dos clasificaciones, y decirle a esa gente que su código «es de la anterior»
   * sin más es exactamente lo contrario de lo que necesita saber.
   */
  const vigenteHomonima = useMemo<CnaeIndexada | null>(() => {
    if (digitosConsultaCnae.length !== 4) return null;
    return (
      cnaeIndexado.find(
        (entrada) => entrada.nivel === 'clase' && entrada.codigoDigitos === digitosConsultaCnae,
      ) ?? null
    );
  }, [cnaeIndexado, digitosConsultaCnae]);

  /**
   * ¿La consulta viene escrita con el formato de la CNAE-2025 (dos dígitos, punto, dos
   * dígitos) Y existe de verdad una clase vigente con esos cuatro dígitos? Entonces no es
   * un código de la clasificación anterior, aunque sus cuatro dígitos también existan allí:
   * quien tiene hoy la clase 47.11 y la escribe como figura en su alta recibía «4711 existe
   * en la CNAE-2009, la clasificación anterior» sobre un código que está VIGENTE en el
   * catálogo que la app acaba de servir (hallazgo 424).
   *
   * El formato por sí solo no basta (hallazgo 481): 117 de los 629 códigos de la CNAE-2009
   * del catálogo NO tienen clase homónima en la CNAE-2025, y para esos la notación con
   * punto —la que aparece en escrituras, contratos y en la propia publicación del INE—
   * dejaba de devolver nada. Exigir `vigenteHomonima` es lo que distingue «47.11, que hoy
   * significa lo mismo» de «14.11, que hoy no significa nada: solo su equivalencia lo hace».
   */
  const consultaConFormatoVigente = /^\s*\d{2}\.\d{2}\s*$/.test(consultaCnae) && vigenteHomonima !== null;

  /** Código anterior: 4 dígitos presentes en la tabla oficial CNAE-2009 → CNAE-2025. */
  const equivalenciaAntigua = useMemo<string[] | null>(() => {
    if (!catalogo) return null;
    if (digitosConsultaCnae.length !== 4) return null;
    if (consultaConFormatoVigente) return null;
    return catalogo.correspondencia[digitosConsultaCnae] ?? null;
  }, [catalogo, digitosConsultaCnae, consultaConFormatoVigente]);

  /**
   * ¿La clase vigente con ese mismo número es DISTINTA de la actividad que se buscaba?
   *
   * ── Por qué esto no es «hay homónima» a secas (hallazgo 422) ─────────────────
   * El refuerzo «Ojo: ese mismo número también es una clase VIGENTE distinta» se añadió al
   * reparar el hallazgo 63 y era cierto en los 26 códigos de aquel caso, donde la homónima
   * NO figuraba en su propia correspondencia. Pero se emitía SIEMPRE que existiera homónima,
   * y de los 512 códigos de la CNAE-2009 con clase homónima en la CNAE-2025 hay 486 en los
   * que la homónima SÍ es una de sus equivalencias: para el 95 % de los casos la frase era
   * falsa, y encima enfática. Quien llegaba con «4711» leía que 47.11 era «distinta» y
   * descartaba precisamente la clase que le corresponde.
   */
  const homonimaEsOtraActividad =
    vigenteHomonima !== null &&
    equivalenciaAntigua !== null &&
    !equivalenciaAntigua.includes(vigenteHomonima.codigo);

  const resultadosCnae = useMemo<CnaeIndexada[]>(() => {
    if (cnaeIndexado.length === 0) return [];

    const relevancia = (entrada: CnaeIndexada): number => {
      if (consultaCnaeNormalizada.length === 0) return 0;
      if (digitosConsultaCnae.length > 0 && entrada.codigoDigitos === digitosConsultaCnae) return 0;
      if (digitosConsultaCnae.length > 0 && entrada.codigoDigitos.startsWith(digitosConsultaCnae)) {
        return 1;
      }
      const titulo = normalizarTexto(entrada.titulo);
      if (titulo.startsWith(consultaCnaeNormalizada)) return 2;
      // Palabra completa (en el título o en un sinónimo) antes que subcadena accidental:
      // «bar» tiene que encontrar el sinónimo exacto de 56.30 antes que «barnices».
      if (coincidePalabraCompleta(entrada.textoBusqueda, consultaCnaeNormalizada)) return 3;
      if (titulo.includes(consultaCnaeNormalizada)) return 4;
      return 5;
    };

    let base: CnaeIndexada[];

    if (equivalenciaAntigua) {
      // Código antiguo reconocido. Las clases equivalentes se SUMAN a la búsqueda
      // normal, no la sustituyen: 26 códigos de cuatro dígitos existen a la vez en la
      // CNAE-2009 y en la vigente (2530, 2540, 2561, 3512…), y al sustituirla la app
      // escondía la clase actual y afirmaba que el código era de la clasificación
      // anterior. El resultado era la clase de OTRA actividad, servida con un aviso
      // asertivo y sin ninguna pista (Inspector, 20/08/2026).
      const equivalentes = new Set(equivalenciaAntigua);
      const porCorrespondencia = cnaeIndexado.filter((entrada) => equivalentes.has(entrada.codigo));
      const porBusquedaNormal = cnaeIndexado.filter(
        (entrada) =>
          entrada.codigoDigitos.startsWith(digitosConsultaCnae) ||
          entrada.textoBusqueda.includes(consultaCnaeNormalizada),
      );
      base = [...new Set([...porBusquedaNormal, ...porCorrespondencia])];
    } else if (consultaCnaeNormalizada.length === 0) {
      base = cnaeIndexado;
    } else {
      base = cnaeIndexado.filter((entrada) => {
        if (
          digitosConsultaCnae.length > 0 &&
          entrada.codigoDigitos.startsWith(digitosConsultaCnae)
        ) {
          return true;
        }
        return entrada.textoBusqueda.includes(consultaCnaeNormalizada);
      });
    }

    if (seccionCnae !== 'todas') {
      base = base.filter((entrada) => entrada.seccionLetra === seccionCnae);
    }

    return [...base].sort((a, b) => {
      const porNivel = PESO_NIVEL_CNAE[a.nivel] - PESO_NIVEL_CNAE[b.nivel];
      if (porNivel !== 0) return porNivel;
      const porRelevancia = relevancia(a) - relevancia(b);
      if (porRelevancia !== 0) return porRelevancia;
      return a.codigo.localeCompare(b.codigo, 'es');
    });
  }, [cnaeIndexado, consultaCnaeNormalizada, digitosConsultaCnae, equivalenciaAntigua, seccionCnae]);

  // Sin texto ni filtro de sección no hay nada que mostrar: la pantalla inicial son
  // los ejemplos clicables, no un volcado del catálogo.
  const sinCriterioCnae = consultaCnaeNormalizada.length === 0 && seccionCnae === 'todas';
  const cnaeMostrados = sinCriterioCnae
    ? []
    : resultadosCnae.slice(0, verTodosCnae ? undefined : LIMITE_RESULTADOS);

  // ─── Búsqueda en las Tarifas del IAE ───────────────────────────────────────

  const consultaIaeNormalizada = normalizarTexto(consultaIae);
  const digitosConsultaIae = soloDigitos(consultaIae);

  const resultadosIae = useMemo<IaeIndexada[]>(() => {
    if (iaeIndexado.length === 0) return [];

    const relevancia = (entrada: IaeIndexada): number => {
      if (consultaIaeNormalizada.length === 0) return 0;
      if (entrada.codigo === consultaIae.trim()) return 0;
      if (digitosConsultaIae.length > 0 && entrada.codigoDigitos.startsWith(digitosConsultaIae)) {
        return 1;
      }
      if (normalizarTexto(entrada.titulo).startsWith(consultaIaeNormalizada)) return 2;
      if (coincidePalabraCompleta(entrada.textoBusqueda, consultaIaeNormalizada)) return 3;
      return 4;
    };

    let base = iaeIndexado;

    if (consultaIaeNormalizada.length > 0) {
      base = base.filter((entrada) => {
        if (digitosConsultaIae.length > 0 && entrada.codigoDigitos.startsWith(digitosConsultaIae)) {
          return true;
        }
        return entrada.textoBusqueda.includes(consultaIaeNormalizada);
      });
    }

    if (seccionIae !== 'todas') {
      base = base.filter((entrada) => entrada.seccion === seccionIae);
    }

    return [...base].sort((a, b) => {
      // La RELEVANCIA manda sobre el tipo de entrada. Al revés —que era como estaba—,
      // una coincidencia accidental de la Sección 1.ª se colocaba por delante de la
      // entrada correcta: «actores» devolvía primero «Construcción de tractores
      // agrícolas» y solo después el 013 «Actores de cine y teatro», y la sección
      // determina la retención de IRPF en factura (Inspector, 20/08/2026).
      const porRelevancia = relevancia(a) - relevancia(b);
      if (porRelevancia !== 0) return porRelevancia;
      const porTipo = PESO_TIPO_IAE[a.tipo] - PESO_TIPO_IAE[b.tipo];
      if (porTipo !== 0) return porTipo;
      if (a.seccion !== b.seccion) return a.seccion.localeCompare(b.seccion, 'es');
      return a.codigo.localeCompare(b.codigo, 'es', { numeric: true });
    });
  }, [iaeIndexado, consultaIae, consultaIaeNormalizada, digitosConsultaIae, seccionIae]);

  const sinCriterioIae = consultaIaeNormalizada.length === 0 && seccionIae === 'todas';
  const iaeMostrados = sinCriterioIae
    ? []
    : verTodosIae
      ? resultadosIae
      : conRepresentacionDeSeccion(resultadosIae, LIMITE_RESULTADOS, (entrada) => entrada.seccion);

  // ─── Jerarquías ────────────────────────────────────────────────────────────

  const jerarquiaCnae = (entrada: CnaeIndexada): PasoJerarquia[] => {
    const camino: PasoJerarquia[] = [];
    const seccion = mapaCnae[entrada.seccionLetra];
    if (seccion && entrada.nivel !== 'seccion') {
      camino.push({ etiqueta: `Sección ${seccion.codigo}`, texto: seccion.titulo });
    }
    if (entrada.nivel === 'grupo' || entrada.nivel === 'clase') {
      const division = mapaCnae[entrada.codigo.slice(0, 2)];
      if (division) camino.push({ etiqueta: `División ${division.codigo}`, texto: division.titulo });
    }
    if (entrada.nivel === 'clase') {
      const grupo = mapaCnae[entrada.codigo.slice(0, 4)];
      if (grupo) camino.push({ etiqueta: `Grupo ${grupo.codigo}`, texto: grupo.titulo });
    }
    return camino;
  };

  const jerarquiaIae = (entrada: IaeIndexada): PasoJerarquia[] => {
    const camino: PasoJerarquia[] = [];
    const raiz = entrada.codigo.split('.')[0];

    const division = mapaIae[`${entrada.seccion}|${raiz.slice(0, 1)}`];
    if (division && division.codigo !== entrada.codigo) {
      camino.push({ etiqueta: `División ${division.codigo}`, texto: division.titulo });
    }
    if (raiz.length >= 2) {
      const agrupacion = mapaIae[`${entrada.seccion}|${raiz.slice(0, 2)}`];
      if (agrupacion && agrupacion.codigo !== entrada.codigo) {
        camino.push({ etiqueta: `Agrupación ${agrupacion.codigo}`, texto: agrupacion.titulo });
      }
    }
    if (entrada.tipo === 'epigrafe') {
      const grupo = mapaIae[`${entrada.seccion}|${raiz}`];
      if (grupo) camino.push({ etiqueta: `Grupo ${grupo.codigo}`, texto: grupo.titulo });
    }
    return camino;
  };

  /** Códigos de la CNAE-2009 de los que procede una clase de la CNAE-2025. */
  const equivalenciaCnae2009 = (codigo: string): string[] => {
    if (!catalogo) return [];
    return catalogo.correspondenciaInversa[soloDigitos(codigo)] ?? [];
  };

  const descripcionSeccion = (seccion: SeccionIae) =>
    SECCIONES_IAE.find((item) => item.seccion === seccion);

  // ─── Render ────────────────────────────────────────────────────────────────

  const relacionadas = getRelatedApps('conversor-cnae-iae');
  const meta = catalogo?.meta;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Buscador de códigos CNAE-2025 y epígrafes del IAE</h1>
        <p className={styles.subtitle}>
          Dos catálogos completos y literales para localizar tu actividad: la CNAE-2025 del INE
          (la que sustituyó a la CNAE-2009 en enero de 2026) y las Tarifas del Impuesto sobre
          Actividades Económicas. Búsqueda por palabras corrientes, por código y también por
          códigos antiguos de la CNAE-2009.
        </p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" collapsible={false}>
        <p>
          Esta herramienta reproduce el literal de dos catálogos oficiales para que puedas
          consultarlos, pero no decide qué código corresponde a tu actividad ni sustituye al
          criterio de un asesor fiscal o al de la propia AEAT. Elegir mal un epígrafe del IAE tiene
          efectos reales sobre retenciones, IVA y obligaciones censales.
        </p>
      </DisclaimerCard>

      {meta && (
        <>
          <DataReference
            normativa="CNAE-2025"
            fuente={meta.cnae.fuente}
            verificado={meta.generado}
            urlOficial={meta.cnae.urlOficial}
            nota={meta.cnae.nota}
          />
          <DataReference
            normativa="Tarifas del IAE"
            fuente={meta.iae.fuente}
            verificado={meta.generado}
            urlOficial={meta.iae.urlOficial}
            nota={meta.iae.nota}
          />
        </>
      )}

      {/* Aviso principal — fuera de EducationalSection, nunca colapsable */}
      <section className={styles.warningBox} aria-labelledby="aviso-sin-tabla">
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">
            🧭
          </span>
          <h2 id="aviso-sin-tabla">
            Aquí no hay conversión automática de CNAE a IAE, y es a propósito
          </h2>
        </div>
        <ul className={styles.warningList}>
          <li>
            <strong>
              No existe una tabla oficial que traduzca un código CNAE en un epígrafe del IAE.
            </strong>{' '}
            La CNAE la mantiene el INE con finalidad estadística; las Tarifas del IAE son de la
            AEAT y tienen finalidad tributaria. Son dos clasificaciones de organismos distintos,
            escritas en momentos distintos y con criterios distintos.
          </li>
          <li>
            <strong>Cualquier equivalencia entre ambas es un criterio, no un dato.</strong> Puede
            ser un criterio razonable y útil, pero es de quien lo elabora y no de la
            Administración; y equivocarse de epígrafe tiene consecuencias fiscales concretas.
          </li>
          <li>
            <strong>Por eso aquí tienes los dos catálogos completos y literales.</strong> Localiza
            tu actividad en cada uno con el texto oficial delante: es la forma de decidir con
            información en lugar de con una equivalencia improvisada.
          </li>
        </ul>
      </section>

      {/* ─── Buscadores ─────────────────────────────────────────────────── */}

      <section className={styles.buscadorPanel} aria-label="Buscadores de códigos">
        <div className={styles.tabs} role="tablist" aria-label="Elige qué catálogo consultar">
          <button
            type="button"
            role="tab"
            id="tab-cnae"
            aria-selected={pestana === 'cnae'}
            aria-controls="panel-cnae"
            className={`${styles.tab} ${pestana === 'cnae' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('cnae')}
          >
            <span aria-hidden="true">🏷️</span> CNAE-2025
          </button>
          <button
            type="button"
            role="tab"
            id="tab-iae"
            aria-selected={pestana === 'iae'}
            aria-controls="panel-iae"
            className={`${styles.tab} ${pestana === 'iae' ? styles.tabActiva : ''}`}
            onClick={() => setPestana('iae')}
          >
            <span aria-hidden="true">⚖️</span> Epígrafes del IAE
          </button>
        </div>

        {estado === 'cargando' && (
          <p className={styles.estadoCarga} role="status" aria-live="polite">
            Cargando los catálogos oficiales…
          </p>
        )}

        {estado === 'error' && (
          <p className={styles.estadoError} role="alert">
            No se han podido cargar los catálogos. Comprueba tu conexión y vuelve a cargar la
            página; si el problema persiste, puedes consultar directamente las fuentes oficiales
            del INE y del BOE enlazadas más arriba.
          </p>
        )}

        {/* Panel CNAE-2025 */}
        {estado === 'listo' && pestana === 'cnae' && (
          <div id="panel-cnae" role="tabpanel" aria-labelledby="tab-cnae">
            <h2 className={styles.buscadorTitulo}>Buscador de la CNAE-2025</h2>
            <p className={styles.panelIntro}>
              Escribe cómo describirías tu trabajo («hago páginas web», «peluquería»), el nombre
              oficial o un código. También reconoce los códigos de cuatro dígitos de la{' '}
              <strong>CNAE-2009</strong> y muestra a qué equivalen hoy.
            </p>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="buscador-cnae">
                Actividad o código CNAE
              </label>
              <input
                id="buscador-cnae"
                ref={inputCnaeRef}
                type="search"
                className={styles.input}
                value={consultaCnae}
                onChange={(evento) => setConsultaCnae(evento.target.value)}
                placeholder="hago páginas web, peluquería, 4711…"
                autoComplete="off"
              />
              <p className={styles.ayuda}>
                La búsqueda tolera acentos y mayúsculas, y recorre también los términos coloquiales
                asociados a cada clase.
              </p>
            </div>

            <div className={styles.ejemplos}>
              <span className={styles.ejemplosEtiqueta}>Prueba con:</span>
              {EJEMPLOS_CNAE.map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => setConsultaCnae(ejemplo)}
                >
                  {ejemplo}
                </button>
              ))}
            </div>

            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar por sección de la CNAE"
            >
              <button
                type="button"
                className={`${styles.filtroBtn} ${seccionCnae === 'todas' ? styles.filtroActivo : ''}`}
                aria-pressed={seccionCnae === 'todas'}
                onClick={() => setSeccionCnae('todas')}
              >
                Todas
              </button>
              {seccionesCnae.map((seccion) => (
                <button
                  key={seccion.codigo}
                  type="button"
                  className={`${styles.filtroBtn} ${seccionCnae === seccion.codigo ? styles.filtroActivo : ''}`}
                  aria-pressed={seccionCnae === seccion.codigo}
                  onClick={() => setSeccionCnae(seccion.codigo)}
                  title={seccion.titulo}
                >
                  {seccion.codigo}
                </button>
              ))}
            </div>

            {equivalenciaAntigua && (
              <div className={styles.avisoAntiguo} role="note">
                <p>
                  <strong>{digitosConsultaCnae}</strong> existe en la <strong>{CNAE_VIGENCIA.anterior}</strong>,
                  la clasificación anterior. Desde el {formatDate(parseISODateLocal(CNAE_VIGENCIA.desde))} rige la{' '}
                  {CNAE_VIGENCIA.vigente} ({CNAE_VIGENCIA.normaVigente}), y
                  estas son las clases actuales que recogen esa actividad
                  {homonimaEsOtraActividad && vigenteHomonima ? (
                    <>
                      . <strong>Ojo</strong>: ese mismo número también es una clase VIGENTE
                      distinta —{vigenteHomonima.codigo} {vigenteHomonima.titulo}—, que{' '}
                      <strong>no</strong> recoge la actividad que buscas y aparece igualmente
                      en la lista
                    </>
                  ) : vigenteHomonima ? (
                    <>
                      , entre ellas <strong>{vigenteHomonima.codigo} {vigenteHomonima.titulo}</strong>,
                      que conserva el mismo número en la clasificación nueva
                    </>
                  ) : null}
                  :
                </p>
              </div>
            )}

            {!sinCriterioCnae && (
              <p className={styles.contador} role="status" aria-live="polite">
                {formatNumber(resultadosCnae.length, 0)}{' '}
                {resultadosCnae.length === 1 ? 'resultado' : 'resultados'}
                {resultadosCnae.length > LIMITE_RESULTADOS && !verTodosCnae && (
                  <>
                    {' '}
                    · se muestran los {LIMITE_RESULTADOS} primeros{' '}
                    <button
                      type="button"
                      className={styles.verTodos}
                      onClick={() => setVerTodosCnae(true)}
                    >
                      Ver los {resultadosCnae.length}
                    </button>
                  </>
                )}
              </p>
            )}

            {sinCriterioCnae ? (
              <div className={styles.sinResultados}>
                <p>
                  Escribe arriba a qué te dedicas para localizar tu código, o filtra por sección
                  si prefieres explorar la clasificación.
                </p>
              </div>
            ) : resultadosCnae.length === 0 ? (
              <div className={styles.sinResultados}>
                <p>No hay ninguna entrada que encaje con lo que has escrito.</p>
                <ul>
                  <li>
                    Prueba con una palabra más corta o con la raíz del término («fontaner» en vez
                    de «fontanería industrial»).
                  </li>
                  <li>
                    Si tienes un código antiguo, escríbelo con sus cuatro dígitos y sin puntos.
                  </li>
                  <li>Quita el filtro de sección: puede estar dejando fuera tu actividad.</li>
                </ul>
              </div>
            ) : (
              <ul className={styles.listaResultados}>
                {cnaeMostrados.map((entrada) => {
                  const camino = jerarquiaCnae(entrada);
                  const antiguos =
                    entrada.nivel === 'clase' ? equivalenciaCnae2009(entrada.codigo) : [];
                  return (
                    <li key={`${entrada.nivel}-${entrada.codigo}`} className={styles.ficha}>
                      <div className={styles.fichaCabecera}>
                        <div className={styles.fichaIdentidad}>
                          <span className={styles.codigoCnae}>{entrada.codigo}</span>
                          <p className={styles.denominacion}>{entrada.titulo}</p>
                        </div>
                        <span className={styles.badgeNivel}>{NIVEL_ETIQUETA[entrada.nivel]}</span>
                      </div>

                      {camino.length > 0 && (
                        <ul className={styles.jerarquia}>
                          {camino.map((paso) => (
                            <li key={paso.etiqueta}>
                              <strong>{paso.etiqueta}:</strong> {paso.texto}
                            </li>
                          ))}
                        </ul>
                      )}

                      {entrada.sinonimos.length > 0 && (
                        <p className={styles.sinonimosLinea}>
                          <strong>También se encuentra buscando:</strong>{' '}
                          {entrada.sinonimos.join(' · ')}
                        </p>
                      )}

                      {antiguos.length > 0 && (
                        <p className={styles.nota2009}>
                          En la CNAE-2009 esto correspondía a{' '}
                          {antiguos.map((codigo) => soloDigitos(codigo)).join(', ')}.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Panel IAE */}
        {estado === 'listo' && pestana === 'iae' && (
          <div id="panel-iae" role="tabpanel" aria-labelledby="tab-iae">
            <h2 className={styles.buscadorTitulo}>Buscador de epígrafes del IAE</h2>
            <p className={styles.panelIntro}>
              El epígrafe del IAE es el que se declara a la AEAT en el modelo 036 o 037 al darse de
              alta. Busca por denominación o por código, y fíjate en la sección: es la distinción
              con más efecto práctico sobre tus facturas.
            </p>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="buscador-iae">
                Actividad o código del epígrafe
              </label>
              <input
                id="buscador-iae"
                ref={inputIaeRef}
                type="search"
                className={styles.input}
                value={consultaIae}
                onChange={(evento) => setConsultaIae(evento.target.value)}
                placeholder="peluquería, enseñanza, 505.6…"
                autoComplete="off"
              />
              <p className={styles.ayuda}>
                El texto que se muestra es el literal de las Tarifas, tal y como figuran en el BOE.
              </p>
            </div>

            <div className={styles.ejemplos}>
              <span className={styles.ejemplosEtiqueta}>Prueba con:</span>
              {EJEMPLOS_IAE.map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => setConsultaIae(ejemplo)}
                >
                  {ejemplo}
                </button>
              ))}
            </div>

            <div className={styles.filtros} role="group" aria-label="Filtrar por sección del IAE">
              <button
                type="button"
                className={`${styles.filtroBtn} ${seccionIae === 'todas' ? styles.filtroActivo : ''}`}
                aria-pressed={seccionIae === 'todas'}
                onClick={() => setSeccionIae('todas')}
              >
                Todas las secciones
              </button>
              {SECCIONES_IAE.map((descripcion) => (
                <button
                  key={descripcion.seccion}
                  type="button"
                  className={`${styles.filtroBtn} ${seccionIae === descripcion.seccion ? styles.filtroActivo : ''}`}
                  aria-pressed={seccionIae === descripcion.seccion}
                  onClick={() => setSeccionIae(descripcion.seccion)}
                >
                  Sección {descripcion.seccion} · {descripcion.nombre}
                </button>
              ))}
            </div>

            <div className={styles.seccionesGrid}>
              {SECCIONES_IAE.map((descripcion) => (
                <article key={descripcion.seccion} className={styles.seccionCard}>
                  <h3 className={styles.seccionCardTitulo}>
                    <span className={`${styles.badgeSeccion} ${CLASE_SECCION[descripcion.seccion]}`}>
                      Sección {descripcion.seccion}
                    </span>
                    {descripcion.nombre}
                  </h3>
                  <p className={styles.seccionQuienes}>{descripcion.quienes}</p>
                  <p className={styles.seccionImplicacion}>{descripcion.retencion}</p>
                </article>
              ))}
            </div>

            {!sinCriterioIae && (
              <p className={styles.contador} role="status" aria-live="polite">
                {formatNumber(resultadosIae.length, 0)}{' '}
                {resultadosIae.length === 1 ? 'resultado' : 'resultados'}
                {resultadosIae.length > LIMITE_RESULTADOS && !verTodosIae && (
                  <>
                    {' '}
                    · se muestran {LIMITE_RESULTADOS}, con al menos uno de cada sección{' '}
                    <button
                      type="button"
                      className={styles.verTodos}
                      onClick={() => setVerTodosIae(true)}
                    >
                      Ver los {resultadosIae.length}
                    </button>
                  </>
                )}
              </p>
            )}

            {sinCriterioIae ? (
              <div className={styles.sinResultados}>
                <p>
                  Escribe arriba la actividad o el epígrafe que buscas, o filtra por sección para
                  ver las actividades empresariales, profesionales o artísticas.
                </p>
              </div>
            ) : resultadosIae.length === 0 ? (
              <div className={styles.sinResultados}>
                <p>Ningún epígrafe coincide con esa búsqueda.</p>
                <ul>
                  <li>
                    Las Tarifas usan el lenguaje de 1990: prueba con «peluquería» antes que con
                    «barbería moderna», o con «comercio al por menor» antes que con «tienda».
                  </li>
                  <li>Busca por la raíz de la palabra; se admiten coincidencias parciales.</li>
                  <li>Comprueba que el filtro de sección no esté excluyendo tu actividad.</li>
                </ul>
              </div>
            ) : (
              <ul className={styles.listaResultados}>
                {iaeMostrados.map((entrada) => {
                  const camino = jerarquiaIae(entrada);
                  const descripcion = descripcionSeccion(entrada.seccion);
                  return (
                    <li
                      key={`${entrada.seccion}-${entrada.tipo}-${entrada.codigo}`}
                      className={styles.ficha}
                    >
                      <div className={styles.fichaCabecera}>
                        <div className={styles.fichaIdentidad}>
                          <span className={styles.codigoCnae}>{entrada.codigo}</span>
                          <p className={styles.denominacion}>{entrada.titulo}</p>
                        </div>
                        <div className={styles.badgesFicha}>
                          <span
                            className={`${styles.badgeSeccion} ${descripcion ? CLASE_SECCION[descripcion.seccion] : styles.seccion1}`}
                          >
                            Sección {entrada.seccion}
                          </span>
                          <span className={styles.badgeNivel}>{TIPO_ETIQUETA[entrada.tipo]}</span>
                        </div>
                      </div>

                      {camino.length > 0 && (
                        <ul className={styles.jerarquia}>
                          {camino.map((paso) => (
                            <li key={paso.etiqueta}>
                              <strong>{paso.etiqueta}:</strong> {paso.texto}
                            </li>
                          ))}
                        </ul>
                      )}

                      {descripcion && (
                        <p className={styles.epigrafeImplicacion}>{descripcion.retencion}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className={styles.notaCuotas} role="note">
              <p>
                <strong>Por qué no aparecen las cuotas.</strong> Las cuotas del texto consolidado
                de las Tarifas siguen expresadas en pesetas de 1990, y lo que realmente se paga
                depende de coeficientes de ponderación y de los índices y recargos que fija cada
                ayuntamiento. Publicar aquí una cifra sería aparentar una precisión que el texto
                oficial no tiene. Además, la mayoría de quienes se dan de alta están exentos del
                pago por su cifra de negocio (se explica más abajo).
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ─── Contenido educativo v2.0 ───────────────────────────────────── */}

      <EducationalSection
        title="CNAE, IAE y el alta de actividad: lo que conviene saber"
        subtitle="Qué es cada clasificación, en qué trámite aparece y cómo elegir correctamente"
        icon="📚"
      >
        <div className={styles.guideSection}>
          <h2>Dos códigos distintos para dos trámites distintos</h2>
          <p className={styles.introText}>
            Quien empieza una actividad por cuenta propia se topa con dos códigos que se parecen
            pero no lo son. El <strong>CNAE</strong> es la Clasificación Nacional de Actividades
            Económicas, la mantiene el INE y su finalidad es estadística: sirve para saber cuánta
            gente hace qué en el país. El <strong>epígrafe del IAE</strong> procede de las Tarifas
            del Impuesto sobre Actividades Económicas (RD Legislativo 1175/1990), es de la AEAT y
            su finalidad es censal y tributaria: identifica qué actividad has declarado ejercer.
          </p>
          <p className={styles.introText}>
            La CNAE vigente es la <strong>{CNAE_VIGENCIA.vigente}</strong>, aprobada por el{' '}
            {CNAE_VIGENCIA.normaVigente}, que sustituye a la {CNAE_VIGENCIA.anterior} desde{' '}
            {formatDate(parseISODateLocal(CNAE_VIGENCIA.desde))}. Muchos formularios, escrituras y
            contratos anteriores siguen citando códigos de la CNAE-2009: por eso este buscador los
            reconoce y muestra a qué clase equivalen hoy. Las Tarifas del IAE, en cambio, siguen
            siendo las de 1990 con sus modificaciones posteriores, y su lenguaje refleja esa fecha.
          </p>

          <h2>Comparativa rápida</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Aspecto</th>
                  <th scope="col">CNAE-2025</th>
                  <th scope="col">Epígrafe del IAE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Quién la mantiene</strong>
                  </td>
                  <td>INE (Instituto Nacional de Estadística)</td>
                  <td>AEAT, sobre las Tarifas aprobadas por ley</td>
                </tr>
                <tr>
                  <td>
                    <strong>Para qué sirve</strong>
                  </td>
                  <td>Clasificación estadística de la actividad</td>
                  <td>Censo de empresarios, profesionales y retenedores</td>
                </tr>
                <tr>
                  <td>
                    <strong>Dónde te lo piden</strong>
                  </td>
                  <td>Alta en la Seguridad Social, Registro Mercantil, bancos, subvenciones</td>
                  <td>Modelo 036 o 037 de declaración censal ante la AEAT</td>
                </tr>
                <tr>
                  <td>
                    <strong>Formato</strong>
                  </td>
                  <td>Letra de sección y hasta cuatro dígitos: 47.11</td>
                  <td>Sección 1ª, 2ª o 3ª y hasta epígrafe: 505.6</td>
                </tr>
                <tr>
                  <td>
                    <strong>Norma de referencia</strong>
                  </td>
                  <td>RD 10/2025 (sustituye al RD 475/2007)</td>
                  <td>RD Legislativo 1175/1990 y modificaciones</td>
                </tr>
                <tr>
                  <td>
                    <strong>Efecto en tus facturas</strong>
                  </td>
                  <td>Ninguno directo</td>
                  <td>La sección determina si procede retención de IRPF</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Situaciones habituales</h2>
          <div className={styles.escenariosGrid}>
            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💻
                </span>
                <h3>Desarrollo de software por cuenta propia</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Búsqueda:</p>
                <code>hago páginas web → CNAE 62.10 Actividades de programación informática</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>A tener en cuenta:</strong> en el IAE, programar para terceros se declara
                con frecuencia en la Sección 2ª cuando se ejerce individualmente, lo que implica
                retención en las facturas a empresas. Si hay organización empresarial (local,
                personal, reventa de licencias), el encaje puede estar en la Sección 1ª.
              </p>
            </article>

            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  ✂️
                </span>
                <h3>Peluquería con local abierto</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Búsqueda:</p>
                <code>peluquería → clase CNAE de servicios personales · IAE Sección 1ª</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>A tener en cuenta:</strong> es una actividad empresarial típica de la
                Sección 1ª, de modo que sus facturas no llevan retención de IRPF. Si además se
                venden productos, conviene comprobar si procede un alta adicional de comercio al
                por menor.
              </p>
            </article>

            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📄
                </span>
                <h3>Llegas con un código antiguo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Búsqueda:</p>
                <code>4711 → clases CNAE-2025 equivalentes</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>A tener en cuenta:</strong> una clase de la CNAE-2009 puede repartirse
                entre varias de la CNAE-2025. Cuando aparezcan varias equivalencias hay que leer
                los literales y quedarse con la que describa lo que realmente haces.
              </p>
            </article>

            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🧱
                </span>
                <h3>Reformas y acabados de obra</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Búsqueda:</p>
                <code>pintura → IAE 505.6 Pintura de cualquier tipo y clase…</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>A tener en cuenta:</strong> las Tarifas separan mucho los oficios de obra
                (albañilería, solados, carpintería, pintura). Quien hace varios de esos trabajos
                suele necesitar alta en varios epígrafes.
              </p>
            </article>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Puedo deducir mi epígrafe del IAE a partir de mi código CNAE?</h4>
              <p>
                No de forma oficial: no hay ninguna tabla publicada por la AEAT ni por el INE que
                enlace ambas clasificaciones. Lo que sí puedes hacer es localizar tu actividad en
                cada catálogo por separado, leyendo los literales. Si dudas entre dos epígrafes,
                preguntar a la AEAT o a un asesor cuesta mucho menos que rectificar después.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Desde cuándo rige la CNAE-2025 y qué pasa con mi código antiguo?</h4>
              <p>
                La CNAE-2025 fue aprobada por el RD 10/2025 y se aplica desde enero de 2026, en
                sustitución de la CNAE-2009. Los códigos antiguos siguen apareciendo en documentos
                previos; para saber a qué corresponden hoy basta con escribir los cuatro dígitos en
                el buscador de esta página. En muchos casos la equivalencia es uno a uno, pero
                algunas clases se han dividido o fusionado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué cambia según la sección del IAE en la que me dé de alta?</h4>
              <p>
                La Sección 1ª recoge las actividades empresariales y la 2ª el ejercicio individual
                de una profesión. La diferencia práctica está en la factura: un profesional de la
                Sección 2ª aplica retención de IRPF en sus facturas a empresas y a otros
                profesionales ({formatNumber(SECCION_PROFESIONAL.tipoRetencion ?? 0, 0)} % con carácter
                general y {formatNumber(SECCION_PROFESIONAL.tipoRetencionInicio ?? 0, 0)} % el año de
                inicio de la actividad y los dos siguientes), mientras que una actividad empresarial de la Sección 1ª, con
                carácter general, no la aplica. La Sección 3ª, artística, tiene tratamiento
                análogo al profesional.
              </p>
              <p className={styles.faqTip}>
                <strong>Dato útil:</strong> una misma actividad puede encajar en una sección o en
                otra según cómo se ejerza; lo determinante es si hay organización empresarial de
                medios o ejercicio personal de la profesión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Tengo que pagar el IAE siendo autónomo?</h4>
              <p>
                Con carácter general, no. Están exentas del pago las personas físicas y quienes
                tengan un importe neto de la cifra de negocios inferior a{' '}
                {formatNumber(IAE_EXENCION.umbralCifraNegocio, 0)} €, lo
                que deja fuera del pago a la inmensa mayoría de autónomos y de pequeñas empresas.
                Otra cosa distinta es <strong>declarar</strong> el epígrafe: el alta censal es
                obligatoria aunque no se pague cuota, porque es la forma en que la AEAT registra
                qué actividad ejerces.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo estar dado de alta en varios epígrafes a la vez?</h4>
              <p>
                Sí, y es lo habitual en cuanto una actividad tiene varias patas: quien da clases y
                además vende material, o quien ejecuta obra y también redacta proyectos. Cada
                actividad efectivamente ejercida debe tener su alta en el epígrafe que le
                corresponda, y todas se declaran en el mismo modelo 036 o 037. Estar en varios
                epígrafes no multiplica las obligaciones formales, pero sí obliga a aplicar a cada
                factura el régimen propio de su actividad.
              </p>
            </div>
          </div>

          <h2>Cómo localizar tu código paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                1
              </span>
              <div className={styles.stepContent}>
                <h4>Describe tu actividad real, no la que te gustaría tener</h4>
                <p>
                  Parte de lo que vas a facturar desde el primer mes. Escríbelo con tus palabras en
                  el buscador de la CNAE: los términos coloquiales están indexados junto al literal
                  oficial.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                2
              </span>
              <div className={styles.stepContent}>
                <h4>Lee el literal completo de la clase, no solo su título</h4>
                <p>
                  Fíjate en la jerarquía que aparece bajo cada resultado: la división y el grupo
                  suelen aclarar si tu caso entra ahí o en la clase de al lado.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                3
              </span>
              <div className={styles.stepContent}>
                <h4>Busca tu actividad en las Tarifas del IAE empezando de cero</h4>
                <p>
                  No traslades el CNAE: inicia otra búsqueda con las palabras de tu actividad. El
                  lenguaje de las Tarifas es de 1990, así que a veces hay que probar términos más
                  antiguos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                4
              </span>
              <div className={styles.stepContent}>
                <h4>Decide la sección y anticipa su efecto en las facturas</h4>
                <p>
                  Comprueba si tu encaje es empresarial (Sección 1ª) o profesional (Sección 2ª) y
                  ten claro, antes de emitir la primera factura, si procede retención de IRPF.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                5
              </span>
              <div className={styles.stepContent}>
                <h4>Cumplimenta el modelo 036 o 037 y guarda el justificante</h4>
                <p>
                  Declara todos los epígrafes en los que vayas a operar. Si más adelante cambia la
                  actividad, se presenta una declaración censal de modificación: no hay que esperar
                  a fin de año.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📌
              </span>
              <h4>Prioriza la clase específica</h4>
              <p>
                Las clases residuales («otros servicios…») existen para lo que no encaja en ningún
                sitio. Si hay una clase que describe tu actividad, esa es la correcta.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧾
              </span>
              <h4>Contrasta con el literal del BOE</h4>
              <p>
                Antes de presentar el 036, abre la fuente oficial enlazada arriba y lee la
                redacción completa del epígrafe, incluidas sus notas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🗂️
              </span>
              <h4>Declara todas tus actividades</h4>
              <p>
                Si facturas dos cosas distintas, dos altas. Facturar bajo un epígrafe que no cubre
                lo que haces complica cualquier comprobación posterior.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📅
              </span>
              <h4>Revísalo cuando cambie tu negocio</h4>
              <p>
                Un giro de actividad, la apertura de un local o el paso de servicios a venta de
                producto son motivos para revisar el epígrafe declarado.
              </p>
            </div>
          </div>

          <h2>Errores frecuentes al elegir código</h2>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Cuatro tropiezos que salen caros</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Copiar el epígrafe de un conocido.</strong> Dos personas que hacen «lo
                mismo» pueden encajar en secciones distintas según cómo organicen la actividad, y
                con ello cambia la retención aplicable.
              </li>
              <li>
                <strong>Dar por buena una equivalencia CNAE → IAE encontrada en una web.</strong>{' '}
                No es un dato oficial. Puede orientar, pero la responsabilidad de lo declarado es
                de quien firma el modelo 036.
              </li>
              <li>
                <strong>Confundir exención con no declarar.</strong> Estar exento del pago del IAE
                por cifra de negocio inferior a {formatNumber(IAE_EXENCION.umbralCifraNegocio, 0)} € no exime del alta censal en el
                epígrafe.
              </li>
              <li>
                <strong>Usar un código de la CNAE-2009 como si siguiera vigente.</strong> Desde
                enero de 2026 la clasificación aplicable es la CNAE-2025, y algunas clases antiguas
                se han dividido en varias nuevas.
              </li>
            </ul>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />

      <ShareCard appName="conversor-cnae-iae" />

      <Footer appName="conversor-cnae-iae" />
    </div>
  );
}
