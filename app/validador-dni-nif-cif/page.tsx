'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ValidadorDniNifCif.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import RegionBadge from '@/components/RegionBadge';
import { getRelatedApps } from '@/data/app-relations';

// ───────────────────────────────────────────────────────────────
// Constantes del algoritmo oficial
// ───────────────────────────────────────────────────────────────

/** Cadena oficial de letras de control del DNI/NIE (23 letras, sin I, Ñ, O ni U) */
const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

/** Cadena de conversión del dígito de control del CIF a letra */
const LETRAS_CONTROL_CIF = 'JABCDEFGHI';

/** Equivalencia numérica del prefijo del NIE */
const PREFIJOS_NIE: Record<string, string> = { X: '0', Y: '1', Z: '2' };

/** Tipos de entidad según la letra inicial del CIF (NIF de persona jurídica) */
const TIPOS_ENTIDAD: Record<string, string> = {
  A: 'Sociedad anónima',
  B: 'Sociedad de responsabilidad limitada',
  C: 'Sociedad colectiva',
  D: 'Sociedad comanditaria',
  E: 'Comunidad de bienes y herencias yacentes',
  F: 'Sociedad cooperativa',
  G: 'Asociación, fundación u otra entidad sin ánimo de lucro',
  H: 'Comunidad de propietarios en régimen de propiedad horizontal',
  J: 'Sociedad civil, con o sin personalidad jurídica',
  N: 'Entidad extranjera',
  P: 'Corporación local (ayuntamientos, diputaciones)',
  Q: 'Organismo público',
  R: 'Congregación o institución religiosa',
  S: 'Órgano de la Administración del Estado o de las comunidades autónomas',
  U: 'Unión temporal de empresas (UTE)',
  V: 'Otros tipos no definidos en el resto de claves',
  W: 'Establecimiento permanente de entidad no residente',
};

/** Entidades cuyo carácter de control es siempre una LETRA */
const CIF_CONTROL_LETRA = 'PQRSNW';
/** Entidades cuyo carácter de control es siempre un NÚMERO */
const CIF_CONTROL_NUMERO = 'ABEH';

const LETRAS_ENTIDAD = Object.keys(TIPOS_ENTIDAD);

// ───────────────────────────────────────────────────────────────
// Tipos
// ───────────────────────────────────────────────────────────────

type Modo = 'validar' | 'generar';
type TipoIdentificador = 'DNI' | 'NIE' | 'CIF';
type Estado = 'valido' | 'invalido' | 'calculado';

interface PasoCalculo {
  etiqueta: string;
  valor: string;
}

interface Resultado {
  estado: Estado;
  tipo: TipoIdentificador | null;
  titulo: string;
  valor?: string;
  detalle: string;
  pasos: PasoCalculo[];
  entidad?: string;
}

// ───────────────────────────────────────────────────────────────
// Lógica de cálculo
// ───────────────────────────────────────────────────────────────

/** Devuelve la letra de control que corresponde a un número de 8 cifras */
function calcularLetraDni(numero: number): string {
  return LETRAS_DNI.charAt(numero % 23);
}

/** Calcula el dígito de control de un CIF a partir de sus 7 dígitos centrales */
function calcularControlCif(digitos: string): { control: number; sumaPares: number; sumaImpares: number; total: number } {
  let sumaPares = 0;
  let sumaImpares = 0;

  for (let i = 0; i < 7; i++) {
    const digito = Number(digitos.charAt(i));
    // Posición 1 = índice 0 → posición impar
    if (i % 2 === 0) {
      const doble = digito * 2;
      sumaImpares += doble > 9 ? Math.floor(doble / 10) + (doble % 10) : doble;
    } else {
      sumaPares += digito;
    }
  }

  const total = sumaPares + sumaImpares;
  const control = (10 - (total % 10)) % 10;
  return { control, sumaPares, sumaImpares, total };
}

/** Normaliza la entrada: quita espacios, guiones y puntos, y pasa a mayúsculas */
function normalizar(entrada: string): string {
  return entrada.toUpperCase().replace(/[\s.\-_/]/g, '');
}

/** Valida un DNI completo (8 dígitos + letra) */
function validarDni(valor: string): Resultado {
  const numero = Number(valor.slice(0, 8));
  const letraIntroducida = valor.charAt(8);
  const letraCorrecta = calcularLetraDni(numero);
  const resto = numero % 23;

  const pasos: PasoCalculo[] = [
    { etiqueta: 'Número del documento', valor: valor.slice(0, 8) },
    { etiqueta: 'División entre 23', valor: `${valor.slice(0, 8)} ÷ 23 → resto ${resto}` },
    { etiqueta: `Letra en la posición ${resto} de TRWAGMYFPDXBNJZSQVHLCKE`, valor: letraCorrecta },
    { etiqueta: 'Letra introducida', valor: letraIntroducida },
  ];

  if (letraIntroducida === letraCorrecta) {
    return {
      estado: 'valido',
      tipo: 'DNI',
      titulo: 'DNI válido',
      valor: valor,
      detalle:
        'La letra coincide con la que resulta del algoritmo módulo 23. Este mismo número, letra incluida, es también el NIF de la persona a efectos fiscales.',
      pasos,
    };
  }

  return {
    estado: 'invalido',
    tipo: 'DNI',
    titulo: 'DNI incorrecto: la letra no coincide',
    valor: valor,
    detalle: `La letra que corresponde a ${valor.slice(0, 8)} es la ${letraCorrecta}, no la ${letraIntroducida}. El documento correcto sería ${valor.slice(0, 8)}${letraCorrecta}.`,
    pasos,
  };
}

/** Valida un NIE completo (X, Y o Z + 7 dígitos + letra) */
function validarNie(valor: string): Resultado {
  const prefijo = valor.charAt(0);
  const equivalente = PREFIJOS_NIE[prefijo] + valor.slice(1, 8);
  const numero = Number(equivalente);
  const letraIntroducida = valor.charAt(8);
  const letraCorrecta = calcularLetraDni(numero);
  const resto = numero % 23;

  const pasos: PasoCalculo[] = [
    { etiqueta: `Sustitución del prefijo ${prefijo}`, valor: `${prefijo} → ${PREFIJOS_NIE[prefijo]}` },
    { etiqueta: 'Número equivalente de 8 cifras', valor: equivalente },
    { etiqueta: 'División entre 23', valor: `${equivalente} ÷ 23 → resto ${resto}` },
    { etiqueta: `Letra en la posición ${resto} de TRWAGMYFPDXBNJZSQVHLCKE`, valor: letraCorrecta },
    { etiqueta: 'Letra introducida', valor: letraIntroducida },
  ];

  if (letraIntroducida === letraCorrecta) {
    return {
      estado: 'valido',
      tipo: 'NIE',
      titulo: 'NIE válido',
      valor: valor,
      detalle:
        'El NIE se valida con el mismo algoritmo módulo 23 que el DNI, sustituyendo antes la letra inicial por su equivalente numérico (X=0, Y=1, Z=2). Este identificador es también el NIF fiscal de su titular.',
      pasos,
    };
  }

  return {
    estado: 'invalido',
    tipo: 'NIE',
    titulo: 'NIE incorrecto: la letra no coincide',
    valor: valor,
    detalle: `La letra que corresponde a ${valor.slice(0, 8)} es la ${letraCorrecta}, no la ${letraIntroducida}. El identificador correcto sería ${valor.slice(0, 8)}${letraCorrecta}.`,
    pasos,
  };
}

/** Valida un CIF completo (letra de entidad + 7 dígitos + control) */
function validarCif(valor: string): Resultado {
  const letraEntidad = valor.charAt(0);
  const digitos = valor.slice(1, 8);
  const controlIntroducido = valor.charAt(8);
  const { control, sumaPares, sumaImpares, total } = calcularControlCif(digitos);
  const letraControl = LETRAS_CONTROL_CIF.charAt(control);
  const entidad = TIPOS_ENTIDAD[letraEntidad];

  const admiteLetra = !CIF_CONTROL_NUMERO.includes(letraEntidad);
  const admiteNumero = !CIF_CONTROL_LETRA.includes(letraEntidad);

  const pasos: PasoCalculo[] = [
    { etiqueta: 'Dígitos centrales', valor: digitos },
    { etiqueta: 'Suma de las posiciones pares (2ª, 4ª, 6ª)', valor: String(sumaPares) },
    { etiqueta: 'Suma de los dobles de las posiciones impares (1ª, 3ª, 5ª, 7ª)', valor: String(sumaImpares) },
    { etiqueta: 'Suma total', valor: String(total) },
    { etiqueta: 'Control = (10 − unidad de la suma) módulo 10', valor: String(control) },
    { etiqueta: 'Equivalente en letra (JABCDEFGHI)', valor: letraControl },
    { etiqueta: 'Control introducido', valor: controlIntroducido },
  ];

  const esDigito = /\d/.test(controlIntroducido);
  const coincide = esDigito
    ? Number(controlIntroducido) === control && admiteNumero
    : controlIntroducido === letraControl && admiteLetra;

  if (coincide) {
    const formato = admiteNumero && admiteLetra
      ? 'Las entidades con esta letra inicial pueden usar indistintamente número o letra como carácter de control.'
      : admiteLetra
        ? 'Las entidades con esta letra inicial usan siempre una letra como carácter de control.'
        : 'Las entidades con esta letra inicial usan siempre un número como carácter de control.';

    return {
      estado: 'valido',
      tipo: 'CIF',
      titulo: 'CIF válido',
      valor: valor,
      detalle: `El carácter de control coincide con el que arroja el algoritmo. ${formato}`,
      pasos,
      entidad,
    };
  }

  let motivo: string;
  if (esDigito && !admiteNumero) {
    motivo = `Las entidades que empiezan por ${letraEntidad} deben llevar una LETRA como carácter de control. Aquí correspondería la ${letraControl}.`;
  } else if (!esDigito && !admiteLetra) {
    motivo = `Las entidades que empiezan por ${letraEntidad} deben llevar un NÚMERO como carácter de control. Aquí correspondería el ${control}.`;
  } else if (esDigito) {
    motivo = `El dígito de control correcto sería ${control}, no ${controlIntroducido}. El CIF correcto sería ${letraEntidad}${digitos}${control}.`;
  } else {
    motivo = `La letra de control correcta sería ${letraControl}, no ${controlIntroducido}. El CIF correcto sería ${letraEntidad}${digitos}${letraControl}.`;
  }

  return {
    estado: 'invalido',
    tipo: 'CIF',
    titulo: 'CIF incorrecto: el carácter de control no coincide',
    valor: valor,
    detalle: motivo,
    pasos,
    entidad,
  };
}

/** Punto de entrada: detecta el tipo de identificador y lo valida */
function analizar(entrada: string): Resultado | null {
  const valor = normalizar(entrada);
  if (!valor) return null;

  // Identificadores completos
  if (/^\d{8}[A-Z]$/.test(valor)) return validarDni(valor);
  if (/^[XYZ]\d{7}[A-Z]$/.test(valor)) return validarNie(valor);
  if (new RegExp(`^[${LETRAS_ENTIDAD.join('')}]\\d{7}[0-9A-J]$`).test(valor)) return validarCif(valor);

  // Solo el número: calculamos la letra que le corresponde
  if (/^\d{8}$/.test(valor)) {
    const numero = Number(valor);
    const letra = calcularLetraDni(numero);
    const resto = numero % 23;
    return {
      estado: 'calculado',
      tipo: 'DNI',
      titulo: 'Letra del DNI calculada',
      valor: `${valor}${letra}`,
      detalle:
        'Has introducido solo el número, así que hemos calculado la letra que le corresponde. Recuerda que la letra solo comprueba la coherencia aritmética del número: no significa que ese documento esté asignado a nadie.',
      pasos: [
        { etiqueta: 'Número del documento', valor },
        { etiqueta: 'División entre 23', valor: `${valor} ÷ 23 → resto ${resto}` },
        { etiqueta: `Letra en la posición ${resto} de TRWAGMYFPDXBNJZSQVHLCKE`, valor: letra },
      ],
    };
  }

  if (/^[XYZ]\d{7}$/.test(valor)) {
    const equivalente = PREFIJOS_NIE[valor.charAt(0)] + valor.slice(1);
    const numero = Number(equivalente);
    const letra = calcularLetraDni(numero);
    const resto = numero % 23;
    return {
      estado: 'calculado',
      tipo: 'NIE',
      titulo: 'Letra del NIE calculada',
      valor: `${valor}${letra}`,
      detalle:
        'Has introducido solo el número, así que hemos calculado la letra que le corresponde aplicando el módulo 23 al equivalente numérico.',
      pasos: [
        { etiqueta: `Sustitución del prefijo ${valor.charAt(0)}`, valor: `${valor.charAt(0)} → ${PREFIJOS_NIE[valor.charAt(0)]}` },
        { etiqueta: 'Número equivalente de 8 cifras', valor: equivalente },
        { etiqueta: 'División entre 23', valor: `${equivalente} ÷ 23 → resto ${resto}` },
        { etiqueta: `Letra en la posición ${resto} de TRWAGMYFPDXBNJZSQVHLCKE`, valor: letra },
      ],
    };
  }

  if (new RegExp(`^[${LETRAS_ENTIDAD.join('')}]\\d{7}$`).test(valor)) {
    const letraEntidad = valor.charAt(0);
    const digitos = valor.slice(1);
    const { control, sumaPares, sumaImpares, total } = calcularControlCif(digitos);
    const letraControl = LETRAS_CONTROL_CIF.charAt(control);
    const usaLetra = CIF_CONTROL_LETRA.includes(letraEntidad);
    return {
      estado: 'calculado',
      tipo: 'CIF',
      titulo: 'Carácter de control del CIF calculado',
      valor: `${valor}${usaLetra ? letraControl : control}`,
      detalle: usaLetra
        ? `Las entidades que empiezan por ${letraEntidad} usan letra de control: la que corresponde es la ${letraControl}.`
        : `El dígito de control que corresponde es ${control}${CIF_CONTROL_NUMERO.includes(letraEntidad) ? '' : ` (también sería admisible la letra ${letraControl})`}.`,
      pasos: [
        { etiqueta: 'Dígitos centrales', valor: digitos },
        { etiqueta: 'Suma de las posiciones pares', valor: String(sumaPares) },
        { etiqueta: 'Suma de los dobles de las posiciones impares', valor: String(sumaImpares) },
        { etiqueta: 'Suma total', valor: String(total) },
        { etiqueta: 'Control = (10 − unidad de la suma) módulo 10', valor: String(control) },
        { etiqueta: 'Equivalente en letra (JABCDEFGHI)', valor: letraControl },
      ],
      entidad: TIPOS_ENTIDAD[letraEntidad],
    };
  }

  // Diagnóstico del formato no reconocido
  let motivo: string;
  if (/^\d+$/.test(valor)) {
    motivo = `Has introducido ${valor.length} dígitos y un DNI tiene exactamente 8 dígitos seguidos de una letra. Revisa si falta o sobra alguna cifra.`;
  } else if (/^\d{8}[A-Z]{2,}$/.test(valor)) {
    motivo = 'Un DNI termina en una única letra de control. Has introducido más de una.';
  } else if (/^[XYZ]/.test(valor)) {
    motivo = 'Un NIE se compone de X, Y o Z, siete dígitos y una letra final. Comprueba que no falte ninguna cifra.';
  } else if (/^[A-Z]/.test(valor)) {
    motivo = `Un CIF se compone de una letra de entidad (${LETRAS_ENTIDAD.join(', ')}), siete dígitos y un carácter de control. Comprueba la letra inicial y el número de cifras.`;
  } else {
    motivo = 'No hemos reconocido el formato. Los formatos admitidos son 8 dígitos + letra (DNI), X/Y/Z + 7 dígitos + letra (NIE) y letra de entidad + 7 dígitos + control (CIF).';
  }

  return {
    estado: 'invalido',
    tipo: null,
    titulo: 'Formato no reconocido',
    valor,
    detalle: motivo,
    pasos: [],
  };
}

// ───────────────────────────────────────────────────────────────
// Generación de datos de prueba (ficticios, para desarrollo)
// ───────────────────────────────────────────────────────────────

function digitosAleatorios(cantidad: number): string {
  let salida = '';
  for (let i = 0; i < cantidad; i++) {
    salida += Math.floor(Math.random() * 10).toString();
  }
  return salida;
}

function generarDniPrueba(): string {
  const numero = digitosAleatorios(8);
  return `${numero}${calcularLetraDni(Number(numero))}`;
}

function generarNiePrueba(): string {
  const prefijos = Object.keys(PREFIJOS_NIE);
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = digitosAleatorios(7);
  return `${prefijo}${numero}${calcularLetraDni(Number(PREFIJOS_NIE[prefijo] + numero))}`;
}

function generarCifPrueba(letraEntidad: string): string {
  const digitos = digitosAleatorios(7);
  const { control } = calcularControlCif(digitos);
  const usaLetra = CIF_CONTROL_LETRA.includes(letraEntidad);
  return `${letraEntidad}${digitos}${usaLetra ? LETRAS_CONTROL_CIF.charAt(control) : control}`;
}

const EJEMPLOS = ['12345678Z', 'X1234567L', 'B12345674'];
const CANTIDADES = [1, 10, 25];

// ───────────────────────────────────────────────────────────────
// Componente
// ───────────────────────────────────────────────────────────────

export default function ValidadorDniNifCifPage() {
  const [modo, setModo] = useState<Modo>('validar');
  const [entrada, setEntrada] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const [tipoGenerar, setTipoGenerar] = useState<TipoIdentificador>('DNI');
  const [letraEntidad, setLetraEntidad] = useState('B');
  const [cantidad, setCantidad] = useState(10);
  const [generados, setGenerados] = useState<string[]>([]);
  const [copiado, setCopiado] = useState(false);

  const validar = (texto?: string) => {
    const valor = texto ?? entrada;
    if (texto !== undefined) setEntrada(texto);
    setResultado(analizar(valor));
  };

  const limpiar = () => {
    setEntrada('');
    setResultado(null);
  };

  const generar = () => {
    const lote: string[] = [];
    for (let i = 0; i < cantidad; i++) {
      if (tipoGenerar === 'DNI') lote.push(generarDniPrueba());
      else if (tipoGenerar === 'NIE') lote.push(generarNiePrueba());
      else lote.push(generarCifPrueba(letraEntidad));
    }
    setGenerados(lote);
    setCopiado(false);
  };

  const copiarGenerados = async () => {
    if (generados.length === 0) return;
    try {
      await navigator.clipboard.writeText(generados.join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const claseResultado =
    resultado?.estado === 'valido'
      ? styles.resValido
      : resultado?.estado === 'calculado'
        ? styles.resCalculado
        : styles.resInvalido;

  const iconoResultado =
    resultado?.estado === 'valido' ? '✅' : resultado?.estado === 'calculado' ? '🔤' : '❌';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Validar DNI, NIF, NIE y CIF</h1>
        <p className={styles.subtitle}>
          Calcula la letra del DNI y comprueba cualquier identificador español, con el algoritmo
          explicado paso a paso
        </p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <div className={styles.mainContent}>
        {/* ===== Pestañas ===== */}
        <div className={styles.tabList} role="tablist" aria-label="Modo de la herramienta">
          <button
            type="button"
            role="tab"
            id="tab-validar"
            aria-selected={modo === 'validar'}
            aria-controls="panel-validar"
            className={`${styles.tab} ${modo === 'validar' ? styles.tabActive : ''}`}
            onClick={() => setModo('validar')}
          >
            <span aria-hidden="true">🔍</span> Validar identificador
          </button>
          <button
            type="button"
            role="tab"
            id="tab-generar"
            aria-selected={modo === 'generar'}
            aria-controls="panel-generar"
            className={`${styles.tab} ${modo === 'generar' ? styles.tabActive : ''}`}
            onClick={() => setModo('generar')}
          >
            <span aria-hidden="true">🧪</span> Datos de prueba
          </button>
        </div>

        {/* ===== Panel 1: validar ===== */}
        {modo === 'validar' && (
          <div role="tabpanel" id="panel-validar" aria-labelledby="tab-validar">
            <label className={styles.label} htmlFor="campoIdentificador">
              Identificador a comprobar
            </label>
            <input
              id="campoIdentificador"
              type="text"
              className={styles.input}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') validar();
              }}
              placeholder="12345678Z"
              autoComplete="off"
              inputMode="text"
              spellCheck={false}
              maxLength={20}
            />
            <p className={styles.hint}>
              Admite DNI, NIE y CIF. Puedes escribirlo con espacios, guiones o en minúsculas. Si
              introduces solo el número, calculamos la letra que le corresponde.
            </p>

            <div className={styles.chipRow}>
              <span className={styles.chipLabel}>Ejemplos:</span>
              {EJEMPLOS.map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  className={styles.chip}
                  onClick={() => validar(ejemplo)}
                >
                  {ejemplo}
                </button>
              ))}
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => validar()}
                disabled={!entrada.trim()}
              >
                <span aria-hidden="true">🔍</span> Comprobar
              </button>
              <button type="button" className={styles.btnSecondary} onClick={limpiar}>
                Limpiar
              </button>
            </div>

            {resultado && (
              <div className={`${styles.resultado} ${claseResultado}`} role="alert" aria-live="polite">
                <div className={styles.resultadoHeader}>
                  <span className={styles.resultadoIcono} aria-hidden="true">
                    {iconoResultado}
                  </span>
                  <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
                  {resultado.tipo && <span className={styles.badgeTipo}>{resultado.tipo}</span>}
                </div>

                {resultado.valor && <code className={styles.resultadoValor}>{resultado.valor}</code>}

                <p className={styles.resultadoDetalle}>{resultado.detalle}</p>

                {resultado.entidad && (
                  <div className={styles.entidadBox}>
                    <strong>Tipo de entidad según la letra inicial:</strong> {resultado.entidad}
                  </div>
                )}

                {resultado.pasos.length > 0 && (
                  <div className={styles.pasos}>
                    <p className={styles.pasosTitulo}>Cálculo paso a paso</p>
                    <ul className={styles.pasosLista}>
                      {resultado.pasos.map((paso) => (
                        <li key={paso.etiqueta} className={styles.pasoItem}>
                          <span className={styles.pasoEtiqueta}>{paso.etiqueta}</span>
                          <span className={styles.pasoValor}>{paso.valor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== Panel 2: datos de prueba ===== */}
        {modo === 'generar' && (
          <div role="tabpanel" id="panel-generar" aria-labelledby="tab-generar">
            {/* Aviso permanente y NO colapsable sobre el uso de estos datos */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h2>Datos ficticios para entornos de desarrollo</h2>
              </div>
              <p>
                Los identificadores de esta sección son combinaciones aritméticamente coherentes
                con el algoritmo de control: sirven para que un formulario, una base de datos o un
                juego de pruebas automatizadas acepten el formato. <strong>No corresponden a
                ninguna persona ni a ninguna entidad real</strong> y no son válidos para ningún
                trámite.
              </p>
              <p>
                Usarlos para identificarse ante terceros, cumplimentar documentos oficiales,
                contratar servicios o suplantar a otra persona constituye un delito. Su único uso
                legítimo es poblar entornos de desarrollo, pruebas y demostraciones.
              </p>
            </div>

            <div className={styles.generadorGrid}>
              <div>
                <label className={styles.label} htmlFor="tipoGenerar">
                  Tipo de identificador
                </label>
                <select
                  id="tipoGenerar"
                  className={styles.select}
                  value={tipoGenerar}
                  onChange={(e) => setTipoGenerar(e.target.value as TipoIdentificador)}
                >
                  <option value="DNI">DNI (persona física)</option>
                  <option value="NIE">NIE (persona extranjera)</option>
                  <option value="CIF">CIF (persona jurídica)</option>
                </select>
              </div>

              {tipoGenerar === 'CIF' && (
                <div>
                  <label className={styles.label} htmlFor="letraEntidad">
                    Letra de entidad
                  </label>
                  <select
                    id="letraEntidad"
                    className={styles.select}
                    value={letraEntidad}
                    onChange={(e) => setLetraEntidad(e.target.value)}
                  >
                    {LETRAS_ENTIDAD.map((letra) => (
                      <option key={letra} value={letra}>
                        {letra} — {TIPOS_ENTIDAD[letra]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <span className={styles.label}>Cantidad</span>
                <div className={styles.cantidadRow}>
                  {CANTIDADES.map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      className={`${styles.cantidadBtn} ${cantidad === valor ? styles.cantidadActiva : ''}`}
                      aria-pressed={cantidad === valor}
                      onClick={() => setCantidad(valor)}
                    >
                      {valor}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnPrimary} onClick={generar}>
                <span aria-hidden="true">🧪</span> Generar datos de prueba
              </button>
            </div>

            {generados.length > 0 && (
              <div className={styles.salidaBox}>
                <div className={styles.salidaHeader}>
                  <span className={styles.label}>
                    {generados.length} {generados.length === 1 ? 'registro' : 'registros'} de prueba
                  </span>
                  <button type="button" className={styles.btnCopy} onClick={copiarGenerados}>
                    {copiado ? (
                      <>
                        <span aria-hidden="true">✅</span> Copiado
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">📋</span> Copiar al portapapeles
                      </>
                    )}
                  </button>
                </div>
                <pre className={styles.salidaPre} aria-live="polite">
                  {generados.join('\n')}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= CONTENIDO EDUCATIVO v2.0 ================= */}
      <EducationalSection
        title="¿Quieres entender cómo funcionan estos identificadores?"
        subtitle="Por qué la letra no es aleatoria, qué errores detecta el módulo 23 y en qué se diferencian DNI, NIF, NIE y CIF"
      >
        {/* Introducción */}
        <section className={styles.eduIntro}>
          <h2>
            <span aria-hidden="true">🧩</span> La letra no es un adorno: es un dígito de control
          </h2>
          <p>
            La letra final del DNI se incorporó en 1990 y no identifica nada por sí misma: es un
            <strong> dígito de control</strong>, el mismo concepto que el último dígito de un IBAN,
            de un código de barras EAN-13 o de una tarjeta bancaria. Su función es que, cuando
            alguien teclea o dicta un número, el sistema pueda detectar de inmediato que se ha
            equivocado, sin necesidad de consultar ninguna base de datos.
          </p>
          <p>
            El mecanismo es una operación de aritmética modular: se divide el número de ocho cifras
            entre 23 y el resto —siempre entre 0 y 22— señala una posición dentro de una cadena de
            23 letras. Como el resultado depende de todas las cifras a la vez, cambiar una sola
            altera el resto y, con él, la letra.
          </p>
          <pre className={styles.codeBlock}>
{`LETRAS = "TRWAGMYFPDXBNJZSQVHLCKE"   // 23 posiciones (0-22)

letra = LETRAS[ numero % 23 ]

Ejemplo:  12345678 % 23 = 14  →  LETRAS[14] = "Z"  →  12345678Z
NIE:      X1234567 → 01234567 % 23 = 19 → "L" → X1234567L`}
          </pre>
        </section>

        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>
            <span aria-hidden="true">📊</span> DNI, NIF, NIE y CIF: qué es cada cosa
          </h2>
          <p>
            La confusión es constante porque los cuatro términos se solapan y porque la
            denominación oficial cambió en 2008 sin que el lenguaje corriente se enterase.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Identificador</th>
                  <th>A quién identifica</th>
                  <th>Formato</th>
                  <th>Control</th>
                  <th>Situación actual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DNI</td>
                  <td>Persona física española</td>
                  <td>8 dígitos + 1 letra</td>
                  <td>Módulo 23</td>
                  <td>Documento de identidad vigente</td>
                </tr>
                <tr>
                  <td>NIE</td>
                  <td>Persona física extranjera con vínculos en España</td>
                  <td>X, Y o Z + 7 dígitos + 1 letra</td>
                  <td>Módulo 23 tras sustituir el prefijo</td>
                  <td>Vigente; las series X, Y y Z se agotan por orden</td>
                </tr>
                <tr>
                  <td>NIF de persona física</td>
                  <td>La misma persona, a efectos fiscales</td>
                  <td>Coincide con el DNI o el NIE</td>
                  <td>El del documento del que procede</td>
                  <td>No es un número distinto: es el mismo</td>
                </tr>
                <tr>
                  <td>CIF</td>
                  <td>Empresas, asociaciones, comunidades, organismos</td>
                  <td>1 letra de entidad + 7 dígitos + 1 control</td>
                  <td>Suma ponderada, control numérico o alfabético</td>
                  <td>Denominación derogada en 2008, uso coloquial masivo</td>
                </tr>
                <tr>
                  <td>NIF de entidad</td>
                  <td>Las mismas empresas y entidades</td>
                  <td>Idéntico al antiguo CIF</td>
                  <td>El mismo algoritmo</td>
                  <td>Denominación oficial desde el RD 1065/2007</td>
                </tr>
                <tr>
                  <td>NIF-IVA intracomunitario</td>
                  <td>Operadores dados de alta en el ROI</td>
                  <td>ES + NIF (por ejemplo ESB12345674)</td>
                  <td>El del NIF de base</td>
                  <td>Solo válido si figura de alta en el censo VIES</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>
            <span aria-hidden="true">💼</span> Cuatro situaciones reales
          </h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💻
                </span>
                <h3>Desarrollo: validación en formularios</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>
                  Un alta de usuario acepta &quot;12345678A&quot; y el error solo aparece semanas
                  después, al cruzar los datos con Hacienda.
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> validar la letra en el propio formulario cuesta
                cuatro líneas de código y evita registros irrecuperables. El coste de corregir un
                identificador erróneo crece con cada sistema al que se propaga.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🧾
                </span>
                <h3>Facturación: comprobar el CIF de un cliente</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>
                  Antes de emitir una factura, comprobar que B12345674 tiene el control correcto y
                  que la B corresponde a una sociedad limitada.
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> una factura con el NIF del destinatario mal
                escrito puede rechazarse en la deducción del IVA. La validación aritmética detecta
                el error de transcripción antes de emitirla, aunque no sustituye a la consulta
                censal.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📞
                </span>
                <h3>Atención al cliente: dato dictado por teléfono</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>
                  El cliente dicta 12345687Z; el sistema avisa de que a ese número le corresponde la
                  letra F, no la Z.
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> el módulo 23 detecta el 100% de las
                transposiciones de dos cifras contiguas, que es justo el error típico al oír un
                número. El operador puede pedir confirmación en el acto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🧪
                </span>
                <h3>QA: poblar un entorno de pruebas</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>
                  Generar 25 identificadores ficticios con formato correcto para cargar el entorno
                  de staging sin usar datos de personas reales.
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> usar datos personales reales en entornos de
                prueba es una de las causas más frecuentes de brechas de datos. Los identificadores
                sintéticos pasan la validación de formato sin exponer a nadie.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>
            <span aria-hidden="true">❓</span> Preguntas frecuentes
          </h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué el algoritmo divide entre 23 y no entre otro número?</h4>
              <p>
                Del alfabeto se descartaron la I, la Ñ, la O y la U —la I y la O se confunden con el
                1 y el 0, la Ñ no existe en muchos teclados y sistemas, y la U con la V manuscrita—,
                de modo que quedaron 23 letras utilizables. Que 23 sea además un número primo no es
                casualidad: con un módulo primo el resto se distribuye de forma uniforme y ninguna
                letra resulta más probable que otra, lo que maximiza la capacidad de detección de
                errores.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Detalle:</strong> con 23 letras, un
                número erróneo tiene aproximadamente 1 posibilidad entre 23 (un 4,3%) de conservar
                por azar la letra correcta.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué errores detecta la letra y cuáles se le escapan?</h4>
              <p>
                Detecta el 100% de los errores de una sola cifra (escribir un 7 donde hay un 1) y el
                100% de las transposiciones de dos cifras contiguas (45 por 54), que juntos suponen
                la inmensa mayoría de las equivocaciones humanas al copiar. En cambio, no detecta
                los errores que alteran el número en un múltiplo exacto de 23, ni sirve de nada si
                quien introduce el dato calcula la letra a propósito para que cuadre.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consecuencia práctica:</strong> la letra
                protege contra el descuido, no contra el fraude.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es lo mismo mi NIF que mi DNI?</h4>
              <p>
                Para una persona física española, sí: el NIF es el DNI con su letra, sin ningún
                añadido. Mucha gente busca «calcular la letra del NIF» pensando que existe un número
                fiscal distinto, y no lo hay. Para una persona extranjera, el NIF es el NIE. La
                distinción solo importa en el caso de las entidades, donde el NIF es lo que
                tradicionalmente se ha llamado CIF.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué significa la letra inicial de un CIF?</h4>
              <p>
                Codifica la naturaleza jurídica de la entidad: A para sociedades anónimas, B para
                limitadas, G para asociaciones y fundaciones, H para comunidades de propietarios, P
                para ayuntamientos y otras corporaciones locales, Q para organismos públicos, U para
                uniones temporales de empresas. Leerla da información inmediata sobre con quién se
                está contratando.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Detalle técnico:</strong> las entidades
                que empiezan por N, P, Q, R, S o W llevan letra de control; las que empiezan por A,
                B, E o H llevan número; el resto admiten ambas formas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el NIF intracomunitario y qué relación tiene con el VIES?</h4>
              <p>
                Cuando una empresa o un profesional opera con clientes o proveedores de otros
                estados miembros de la Unión Europea, su NIF se antepone del prefijo del país
                (ES para España) para formar el NIF-IVA. Ese identificador solo es operativo si la
                empresa está inscrita en el Registro de Operadores Intracomunitarios y figura en el
                censo VIES, la base de datos que la Comisión Europea pone a consulta pública.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Importante:</strong> un NIF-IVA
                sintácticamente correcto pero no dado de alta en VIES impide facturar sin IVA en una
                operación intracomunitaria.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puede un identificador ser válido y no existir?</h4>
              <p>
                Constantemente. Hay 100 millones de combinaciones de ocho dígitos y todas tienen su
                letra, frente a unos 47 millones de habitantes: la mayoría de los DNI
                aritméticamente correctos no están asignados a nadie. La validación de formato
                responde a «esto está bien escrito», nunca a «esta persona existe». Comprobar lo
                segundo exige acceso a registros oficiales, restringido a organismos autorizados.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué mi NIE empieza por Y o por Z y no por X?</h4>
              <p>
                Las tres letras son series consecutivas, no categorías distintas. La serie X se
                agotó en julio de 2008 y se abrió la Y; esta se agotó a su vez y en 2022 comenzó la
                serie Z. Por eso la letra inicial es, en la práctica, un indicio aproximado de la
                antigüedad del número, y por eso el algoritmo la traduce a 0, 1 o 2 para prolongar
                la numeración sin cambiar de sistema.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre validar el formato y verificar la identidad?</h4>
              <p>
                Validar el formato es una comprobación aritmética local e instantánea que no
                necesita conexión con nadie. Verificar la identidad implica contrastar el
                identificador con un registro oficial y, en operaciones sujetas a normativa de
                prevención del blanqueo, exhibir el documento físico o usar identificación
                electrónica. Confundir ambas cosas es el origen de muchos incidentes de fraude.
              </p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.eduSection}>
          <h2>
            <span aria-hidden="true">📋</span> Calcular la letra a mano, paso a paso
          </h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Aísla el número, sin la letra</h4>
                <p>
                  Toma las ocho cifras del documento. Si tienen ceros a la izquierda, consérvalos al
                  escribir el resultado, pero no afectan al cálculo: 00123456 se opera como 123456.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Si es un NIE, traduce la letra inicial</h4>
                <p>
                  X se convierte en 0, Y en 1 y Z en 2. Se antepone al resto de cifras: Y1234567
                  pasa a operarse como 11234567. A partir de aquí el procedimiento es idéntico al
                  del DNI.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Divide entre 23 y quédate con el resto</h4>
                <p>
                  No interesa el cociente, solo el resto, que estará siempre entre 0 y 22. Con
                  12345678 la división da 536.768 con resto 14.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Cuenta posiciones en la cadena TRWAGMYFPDXBNJZSQVHLCKE</h4>
                <p>
                  Empezando a contar en 0, no en 1: la T ocupa la posición 0, la R la 1, la W la 2.
                  La posición 14 corresponde a la Z. Ese desfase es la equivocación más común al
                  hacerlo a mano.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Para un CIF, separa posiciones pares e impares</h4>
                <p>
                  De los siete dígitos centrales, suma directamente los que ocupan las posiciones
                  2ª, 4ª y 6ª. Los de las posiciones 1ª, 3ª, 5ª y 7ª se multiplican por dos y, si el
                  resultado pasa de 9, se suman sus dos cifras (14 aporta 5).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Calcula lo que falta para la decena siguiente</h4>
                <p>
                  Suma ambos totales y resta la unidad resultante de 10. Si la suma termina en 0, el
                  control es 0. Con los dígitos 1234567 la suma es 26 y el control, 4.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Decide si el control va como número o como letra</h4>
                <p>
                  Si la entidad empieza por N, P, Q, R, S o W, convierte el control con la cadena
                  JABCDEFGHI (el 4 es la D). Si empieza por A, B, E o H, va como número. En el resto
                  de casos ambas formas son válidas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Buenas prácticas */}
        <section className={styles.eduSection}>
          <h2>
            <span aria-hidden="true">✅</span> Buenas prácticas al trabajar con identificadores
          </h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧹
              </span>
              <h4>Normaliza antes de validar</h4>
              <p>
                Pasa a mayúsculas y elimina espacios, puntos y guiones. Rechazar un dato correcto
                por un guion es un error de producto, no del usuario.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                0️⃣
              </span>
              <h4>Guarda el identificador como texto</h4>
              <p>
                Almacenarlo en un campo numérico destruye los ceros a la izquierda. 01234567L y
                1234567L no son el mismo documento.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔤
              </span>
              <h4>Muestra la letra correcta en el error</h4>
              <p>
                Decir «la letra no es válida» no ayuda; decir «a este número le corresponde la Z»
                resuelve el problema en un segundo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧪
              </span>
              <h4>Nunca uses datos reales en pruebas</h4>
              <p>
                Los entornos de staging suelen tener menos controles de acceso. Pobla con
                identificadores sintéticos y evita la exposición.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🇪🇺
              </span>
              <h4>Comprueba el VIES para operar en la UE</h4>
              <p>
                Antes de facturar sin IVA a un cliente comunitario, verifica su NIF-IVA en el censo
                VIES y guarda el justificante de la consulta.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔒
              </span>
              <h4>Trata el identificador como dato personal</h4>
              <p>
                El DNI y el NIE identifican directamente a una persona: minimiza su recogida, cífralo
                en reposo y no lo muestres completo en pantallas o listados.
              </p>
            </div>
          </div>
        </section>

        {/* Errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">
              ⚠️
            </span>
            <h3>Errores frecuentes al validar identificadores</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Contar las posiciones empezando en 1:</strong> la cadena
              TRWAGMYFPDXBNJZSQVHLCKE se indexa desde 0. Contar desde 1 desplaza la letra una
              posición y produce un resultado erróneo en todos los casos. Comprueba siempre que el
              resto 0 devuelve la T.
            </li>
            <li>
              <strong>❌ Olvidar traducir el prefijo del NIE:</strong> aplicar el módulo 23
              directamente a los siete dígitos de un NIE, sin anteponer el 0, 1 o 2 según sea X, Y o
              Z, da una letra distinta a la real. Es el fallo más habitual en implementaciones
              caseras.
            </li>
            <li>
              <strong>❌ Guardar el documento en un campo numérico:</strong> la base de datos elimina
              los ceros iniciales y el registro deja de validar. Usa siempre un campo de texto de
              longitud fija y normaliza en la capa de entrada, no en la de almacenamiento.
            </li>
            <li>
              <strong>❌ Aplicar al CIF el algoritmo del DNI:</strong> son sistemas de control
              distintos. El CIF usa una suma ponderada tipo Luhn, no una división modular, y su
              carácter final puede ser letra o número según la naturaleza de la entidad.
            </li>
            <li>
              <strong>❌ Confundir formato correcto con identidad verificada:</strong> que un
              identificador supere la validación aritmética no acredita que exista ni que pertenezca
              a quien lo aporta. En operaciones con riesgo, exige documento o identificación
              electrónica.
            </li>
            <li>
              <strong>❌ Usar identificadores ficticios fuera de un entorno de pruebas:</strong>
              &nbsp;introducirlos en un formulario real, en una factura o en cualquier documento
              oficial no es una travesura técnica: es falsear datos ante terceros y puede constituir
              un delito de falsedad documental o de usurpación de identidad.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('validador-dni-nif-cif')} />

      <ShareCard appName="validador-dni-nif-cif" />
      <Footer appName="validador-dni-nif-cif" />
    </div>
  );
}
