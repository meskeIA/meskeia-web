'use client';

import { useState } from 'react';
import styles from './GuiaProductosLimpieza.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// =========================================================
// TIPOS
// =========================================================
type GravedadMezcla = 'critica' | 'alta';
type TipoQuimico = 'acido' | 'base' | 'solvente' | 'oxidante' | 'neutro';

interface Contraindicacion {
  superficie: string;
  razon: string;
}

interface MezclaPeligrosa {
  con: string;
  riesgo: string;
  gravedad: GravedadMezcla;
}

interface Producto {
  id: string;
  nombre: string;
  nombreQuimico: string;
  icono: string;
  tipo: TipoQuimico;
  usos: string[];
  contraindicaciones: Contraindicacion[];
  noMezclar: MezclaPeligrosa[];
  consejoUso: string;
  denominaciones: string[];
}

// =========================================================
// DATOS DE PRODUCTOS
// =========================================================
const PRODUCTOS: Producto[] = [
  {
    id: 'lejia',
    nombre: 'Lejía',
    nombreQuimico: 'Hipoclorito sódico (NaClO)',
    icono: '🧴',
    tipo: 'base',
    usos: [
      'Desinfectar WC, lavabos y bañeras de cerámica y porcelana',
      'Blanquear ropa blanca de algodón (muy diluida, 1:50)',
      'Eliminar moho en juntas y paredes de baño',
      'Desinfectar suelos de baldosa no porosa',
      'Limpiar contenedores y cubos de basura',
    ],
    contraindicaciones: [
      {
        superficie: 'Mármol y piedra caliza',
        razon: 'El cloro ataca la calcita del mármol causando manchas amarillas permanentes y erosión de la superficie. El daño es irreversible.',
      },
      {
        superficie: 'Acero inoxidable',
        razon: 'El hipoclorito produce corrosión en el acero, dejando manchas oscuras difíciles de eliminar.',
      },
      {
        superficie: 'Madera (tratada o sin tratar)',
        razon: 'Destruye la lignina de la madera, la decolora y puede hacer que se degrade y agriete con el tiempo.',
      },
      {
        superficie: 'Aluminio',
        razon: 'Reacciona con el aluminio generando gas hidrógeno y dañando la superficie con picaduras.',
      },
      {
        superficie: 'Ropa de color o fibras sintéticas',
        razon: 'Destiñe irreversiblemente los tejidos de color y puede dañar el nailon, poliéster y lycra.',
      },
    ],
    noMezclar: [
      {
        con: 'Amoniaco (limpiacristales, suavizantes)',
        riesgo: 'Genera cloraminas gaseosas: vapores tóxicos que irritan gravemente las vías respiratorias y pueden causar edema pulmonar.',
        gravedad: 'critica',
      },
      {
        con: 'Vinagre o cualquier ácido',
        riesgo: 'Libera cloro gaseoso (Cl₂), irritante severo de mucosas. La mezcla además reduce la eficacia de ambos productos.',
        gravedad: 'critica',
      },
      {
        con: 'Alcohol',
        riesgo: 'Puede formar cloroformo y otros trihalometanos, compuestos tóxicos.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'Siempre diluida (1 parte de lejía por 10-50 de agua según el uso). Ventilar bien la habitación y usar guantes. Nunca en espacios sin ventilación.',
    denominaciones: ['Cloro (Latam)', 'Lavandina (Argentina/Uruguay)', 'Blanqueador', 'Agua de cloro', 'Hipoclorito comercial'],
  },
  {
    id: 'salfuman',
    nombre: 'Salfumán',
    nombreQuimico: 'Ácido clorhídrico (HCl)',
    icono: '⚗️',
    tipo: 'acido',
    usos: [
      'Eliminar cal y sarro muy resistente en azulejos y baldosas',
      'Limpiar juntas muy incrustadas de cal',
      'Suelos de obra nueva con restos de cemento',
      'WC con incrustaciones calcáreas muy duras',
    ],
    contraindicaciones: [
      {
        superficie: 'Mármol, travertino y piedra caliza',
        razon: 'Reacción inmediata y visible: disuelve el carbonato cálcico (CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂). El daño es completamente irreversible.',
      },
      {
        superficie: 'Metales (acero, aluminio, hierro)',
        razon: 'El ácido clorhídrico disuelve los metales produciendo gas hidrógeno y dejando marcas de corrosión permanentes.',
      },
      {
        superficie: 'Granito y piedra natural porosa',
        razon: 'Aunque más resistente que el mármol, los ácidos fuertes atacan los minerales del granito y pueden oscurecer y erosionar la superficie.',
      },
      {
        superficie: 'Madera y parquet',
        razon: 'Destruye las fibras de la madera, la decolora y la vuelve quebradiza.',
      },
      {
        superficie: 'Superficies esmaltadas o pintadas',
        razon: 'Ataca el esmalte y la pintura, especialmente si se aplica concentrado.',
      },
    ],
    noMezclar: [
      {
        con: 'Lejía o cualquier producto con cloro',
        riesgo: 'Libera cloro gaseoso (Cl₂) en grandes cantidades: tóxico, corrosivo y potencialmente mortal en espacios cerrados.',
        gravedad: 'critica',
      },
      {
        con: 'Amoniaco u otros álcalis',
        riesgo: 'Reacción violenta de neutralización con generación de calor y vapores irritantes de cloruro de amonio.',
        gravedad: 'alta',
      },
      {
        con: 'Agua oxigenada',
        riesgo: 'Puede liberar cloro activo y acelerar la descomposición del peróxido con riesgo de salpicaduras.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'Usar muy diluido (5-10% máximo). Siempre con guantes de nitrilo, gafas de protección y ventilación máxima. Enjuagar abundantemente tras su uso.',
    denominaciones: ['Ácido muriático (Latam)', 'Salfumante', 'Desincrustante ácido fuerte', 'HCl doméstico'],
  },
  {
    id: 'vinagre',
    nombre: 'Vinagre',
    nombreQuimico: 'Ácido acético (CH₃COOH, 5-8%)',
    icono: '🍶',
    tipo: 'acido',
    usos: [
      'Eliminar cal en grifos, alcachofas de ducha y cafeteras',
      'Limpiar cristales y espejos sin dejar rayas',
      'Desodorizar el interior de neveras y microondas',
      'Manchas de agua en acero inoxidable',
      'Descalcificado de lavadoras y lavavajillas (en ciclo vacío)',
    ],
    contraindicaciones: [
      {
        superficie: 'Mármol, travertino y piedra caliza',
        razon: 'Al igual que el salfumán, el ácido acético reacciona con el carbonato cálcico y disuelve la superficie. El daño puede ser más lento pero igual de irreversible.',
      },
      {
        superficie: 'Hierro y metales ferrosos',
        razon: 'El ácido favorece la oxidación y aparición de herrumbre en superficies de hierro sin protección.',
      },
      {
        superficie: 'Madera sin tratar',
        razon: 'Penetra en la madera, la decolora y puede debilitar la estructura de la fibra con uso repetido.',
      },
      {
        superficie: 'Cauchos y juntas de goma',
        razon: 'Degrada el caucho con el tiempo, haciéndolo poroso y quebradizo.',
      },
    ],
    noMezclar: [
      {
        con: 'Lejía (hipoclorito sódico)',
        riesgo: 'Libera cloro gaseoso (Cl₂): irritante severo de ojos y vías respiratorias, incluso a bajas concentraciones en espacio cerrado.',
        gravedad: 'critica',
      },
      {
        con: 'Agua oxigenada',
        riesgo: 'Forma ácido peracético, corrosivo e irritante de piel y vías respiratorias.',
        gravedad: 'alta',
      },
      {
        con: 'Bicarbonato (en recipiente cerrado)',
        riesgo: 'Se neutralizan mutuamente y pierden toda eficacia. La efervescencia puede generar presión en envases cerrados.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'El vinagre blanco destilado (5% de acidez) es el más limpio para limpiar. Calentar ligeramente mejora la eficacia descalcificadora. Enjuagar bien para eliminar el olor.',
    denominaciones: ['Vinagre blanco', 'Vinagre destilado', 'Vinagre de limpieza', 'Ácido acético doméstico'],
  },
  {
    id: 'bicarbonato',
    nombre: 'Bicarbonato',
    nombreQuimico: 'Bicarbonato sódico (NaHCO₃)',
    icono: '🥄',
    tipo: 'base',
    usos: [
      'Desodorizar neveras, zapateros y contenedores (recipiente abierto)',
      'Limpiar hornos con grasa acumulada (pasta con agua)',
      'Eliminar manchas suaves en telas antes del lavado',
      'Pulir acero inoxidable sin rayar (pasta húmeda, frotado suave)',
      'Limpiar pequeños electrodomésticos sin rayar',
    ],
    contraindicaciones: [
      {
        superficie: 'Aluminio',
        razon: 'La alcalinidad del bicarbonato puede provocar reacciones de oxidación que oscurecen el aluminio con uso prolongado.',
      },
      {
        superficie: 'Superficies pulidas de alto brillo',
        razon: 'Su textura abrasiva (aunque suave) puede rayar superficies lacadas o con acabado espejo si se aplica en seco con frotado fuerte.',
      },
      {
        superficie: 'Madera barnizada o lacada',
        razon: 'La alcalinidad puede dañar el barniz o la laca, quitando el brillo y decolorando levemente.',
      },
    ],
    noMezclar: [
      {
        con: 'Vinagre (el mito de potenciar la limpieza)',
        riesgo: 'Falsa creencia popular: se neutralizan entre sí (ácido + base → agua + sal + CO₂). El resultado no tiene poder limpiador. Útil solo para destapar desagües obstruidos con grasa.',
        gravedad: 'alta',
      },
      {
        con: 'Salfumán u otros ácidos fuertes',
        riesgo: 'Reacción violenta con efervescencia brusca. La mezcla se neutraliza y puede salpicar con calor.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'Ideal mezclado con un poco de agua para formar pasta. Para desodorizar, dejar el recipiente abierto. Producto muy seguro y versátil para el día a día.',
    denominaciones: ['Soda de hornear', 'Baking soda', 'Carbonato ácido de sodio', 'Polvo de hornear sin levadura'],
  },
  {
    id: 'alcohol',
    nombre: 'Alcohol',
    nombreQuimico: 'Etanol (C₂H₅OH) o Isopropílico',
    icono: '💊',
    tipo: 'solvente',
    usos: [
      'Desinfectar rápido superficies duras (al 70%, más efectivo que al 96%)',
      'Limpiar cristales, espejos y pantallas electrónicas (al 70%)',
      'Eliminar marcas de rotulador permanente en plástico duro',
      'Quitar adhesivos y pegatinas de superficies no porosas',
      'Desinfectar herramientas de cocina o pequeños objetos',
    ],
    contraindicaciones: [
      {
        superficie: 'Madera barnizada o pintada',
        razon: 'El alcohol disuelve lacas, barnices y algunas pinturas, dañando irreversiblemente el acabado superficial.',
      },
      {
        superficie: 'Plásticos acrílicos (metacrilato/PMMA)',
        razon: 'Produce micro-fisuras en la superficie del acrílico que lo van opacando y debilitando con el uso repetido.',
      },
      {
        superficie: 'Cuero y piel natural',
        razon: 'Desengrasado excesivo: reseca el cuero, elimina los aceites naturales y puede cuartearlo.',
      },
      {
        superficie: 'Pinturas de látex o emulsión',
        razon: 'El alcohol puede disolver las pinturas de base acuosa, especialmente si no están completamente curadas.',
      },
    ],
    noMezclar: [
      {
        con: 'Lejía',
        riesgo: 'Puede formar cloroformo (CHCl₃) y otros compuestos halogenados tóxicos, depresores del sistema nervioso.',
        gravedad: 'critica',
      },
      {
        con: 'Fuentes de calor, llamas o chispas',
        riesgo: 'El alcohol es altamente inflamable (punto de inflamación ~13 °C para etanol). Puede arder o generar llamas a distancia de la fuente.',
        gravedad: 'critica',
      },
      {
        con: 'Agua oxigenada concentrada',
        riesgo: 'Con peróxido de hidrógeno concentrado puede producir una reacción exotérmica con riesgo de ignición.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'La concentración de 70% es más efectiva como desinfectante que el 96%: el agua ayuda a penetrar la membrana celular bacteriana. Usar en lugar ventilado.',
    denominaciones: ['Alcohol de farmacia', 'Alcohol sanitario', 'Alcohol de 96°', 'Alcohol isopropílico', 'IPA', 'Alcohol desnaturalizado'],
  },
  {
    id: 'amoniaco',
    nombre: 'Amoniaco',
    nombreQuimico: 'Hidróxido de amonio (NH₄OH)',
    icono: '🫧',
    tipo: 'base',
    usos: [
      'Limpiar cristales y espejos sin dejar rayas ni halo',
      'Desengrasante de hornos, campanas y quemadores de cocina',
      'Limpiar superficies esmaltadas con grasa acumulada',
      'Suelos de cerámica o baldosa con grasa difícil',
    ],
    contraindicaciones: [
      {
        superficie: 'Madera sin tratar o barnizada',
        razon: 'La alcalinidad del amoniaco daña las fibras de la madera y puede decolorar o atacar el barniz.',
      },
      {
        superficie: 'Aluminio',
        razon: 'Reacciona con el aluminio dejando manchas oscuras y corrosión superficial.',
      },
      {
        superficie: 'Superficies de piedra natural porosa',
        razon: 'Puede decolorar y dañar la superficie de piedras como pizarra, caliza o arenisca.',
      },
    ],
    noMezclar: [
      {
        con: 'Lejía — la mezcla más peligrosa del hogar',
        riesgo: 'Genera cloraminas gaseosas (NH₂Cl, NHCl₂): vapores tóxicos que causan irritación severa de pulmones, broncoespasmo y en dosis altas pueden ser mortales.',
        gravedad: 'critica',
      },
      {
        con: 'Vinagre, salfumán u otros ácidos',
        riesgo: 'Reacción de neutralización con vapores irritantes de cloruro de amonio. Muy irritante para las vías respiratorias.',
        gravedad: 'alta',
      },
      {
        con: 'Agua oxigenada',
        riesgo: 'Puede producir compuestos inestables y reduce la eficacia de ambos productos.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'Usar siempre en espacio muy ventilado o al aire libre. Irritante de ojos, piel y vías respiratorias. No usar donde haya niños o mascotas hasta que el olor se disipe por completo.',
    denominaciones: ['Limpiacristales con amoniaco', 'Limpiador amoniacal', 'Amoniaco doméstico', 'Amoníaco', 'NH₃ doméstico'],
  },
  {
    id: 'agua-oxigenada',
    nombre: 'Agua oxigenada',
    nombreQuimico: 'Peróxido de hidrógeno (H₂O₂, 3-10%)',
    icono: '💧',
    tipo: 'oxidante',
    usos: [
      'Desinfectar superficies sin dejar residuo tóxico (se descompone en agua y oxígeno)',
      'Eliminar manchas de sangre en telas (con agua fría)',
      'Blanquear juntas de azulejos oscurecidas',
      'Desinfectar tablas de cortar de madera y utensilios de cocina',
      'Limpiar cepillos y utensilios de baño',
    ],
    contraindicaciones: [
      {
        superficie: 'Telas de color oscuro',
        razon: 'El peróxido tiene efecto blanqueante y puede decolorar tejidos oscuros de forma desigual e irreversible.',
      },
      {
        superficie: 'Cobre y latón',
        razon: 'Puede oxidar la superficie metálica, causando decoloración y manchas verdosas en cobre y oscuras en latón.',
      },
      {
        superficie: 'Madera natural no tratada (concentrado)',
        razon: 'En concentraciones altas puede blanquear y manchar la madera de forma desigual.',
      },
    ],
    noMezclar: [
      {
        con: 'Vinagre',
        riesgo: 'Forma ácido peracético (CH₃CO₃H), un compuesto corrosivo e irritante de piel, ojos y vías respiratorias.',
        gravedad: 'alta',
      },
      {
        con: 'Lejía',
        riesgo: 'Reacción entre dos oxidantes: puede liberar oxígeno activo y acelerar la descomposición, con generación de calor y salpicaduras.',
        gravedad: 'alta',
      },
      {
        con: 'Amoniaco',
        riesgo: 'Forma compuestos inestables. Reduce la eficacia desinfectante de ambos productos.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'La concentración doméstica del 3% es la más segura. Se degrada al exponerse a la luz: guardar en frasco opaco. Siempre aclarar con agua tras su uso.',
    denominaciones: ['Peroxol', 'Oxigenada', 'H₂O₂ doméstico', 'Agua de oxígeno', 'Peróxido doméstico'],
  },
  {
    id: 'acetona',
    nombre: 'Acetona',
    nombreQuimico: 'Propanona (C₃H₆O)',
    icono: '🧪',
    tipo: 'solvente',
    usos: [
      'Quitar esmalte de uñas',
      'Eliminar pegamento (cianocrilato, doble cara) de superficies duras',
      'Quitar marcas de rotulador permanente en vidrio, cerámica o metal',
      'Limpiar herramientas con restos de resina, epoxi o pintura',
    ],
    contraindicaciones: [
      {
        superficie: 'Plásticos (prácticamente todos)',
        razon: 'La acetona disuelve o ataca la mayoría de plásticos: poliestireno, acrílico, PVC, ABS. Los deforma, opaca o funde.',
      },
      {
        superficie: 'Superficies pintadas o barnizadas',
        razon: 'Disuelve la pintura y el barniz con gran eficacia, dejando la superficie desnuda o con manchas.',
      },
      {
        superficie: 'Goma, neopreno y cauchos',
        razon: 'Degrada rápidamente la estructura del caucho, haciéndolo pegajoso y poroso.',
      },
      {
        superficie: 'Tejidos sintéticos (nailon, poliéster)',
        razon: 'Puede disolver o dañar las fibras sintéticas, dejando marcas permanentes.',
      },
    ],
    noMezclar: [
      {
        con: 'Cualquier llama, chispa o fuente de calor',
        riesgo: 'La acetona es extremadamente inflamable (punto de inflamación −18 °C). Sus vapores se extienden rápidamente y pueden arder a distancia de la fuente de ignición.',
        gravedad: 'critica',
      },
      {
        con: 'Lejía u oxidantes fuertes',
        riesgo: 'Puede formar compuestos explosivos o tóxicos en presencia de hipoclorito u otros oxidantes.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'Usar solo al aire libre o con ventilación máxima. Alejada de cualquier fuente de calor. Usar la cantidad mínima necesaria para la tarea.',
    denominaciones: ['Quitaesmalte', 'Disolvente de uñas', 'Solvente tipo acetona', 'Quitapintura doméstico'],
  },
  {
    id: 'jabon-castilla',
    nombre: 'Jabón de Castilla',
    nombreQuimico: 'Jabón potásico de aceite de oliva',
    icono: '🫧',
    tipo: 'neutro',
    usos: [
      'Limpieza general multiuso suave en suelos y superficies',
      'Fregar a mano utensilios de cocina delicados',
      'Limpiar madera, parquet y muebles sin dañar el acabado',
      'Lavar tejidos delicados a mano',
      'Como limpiador suave de uso general (piel, objetos)',
    ],
    contraindicaciones: [
      {
        superficie: 'Cristales y espejos (sin aclarado)',
        razon: 'Si no se aclara bien puede dejar restos blanquecinos o velo jabonoso, especialmente en zonas de agua muy calcárea.',
      },
      {
        superficie: 'Superficies muy porosas sin sellado',
        razon: 'Puede penetrar en la porosidad y dejar manchas de grasa si no se aclara correctamente con agua abundante.',
      },
    ],
    noMezclar: [
      {
        con: 'Vinagre, salfumán u otros ácidos',
        riesgo: 'Los ácidos «cortan» el jabón: precipita y se forma jabón de calcio insoluble (película grasienta blancuzca) que ensucia más de lo que limpia.',
        gravedad: 'alta',
      },
      {
        con: 'Agua muy dura (alta en cal)',
        riesgo: 'El calcio y magnesio del agua dura forman jabón de calcio insoluble, dejando restos blanquecinos difíciles de eliminar.',
        gravedad: 'alta',
      },
    ],
    consejoUso: 'Funciona mejor con agua blanda. Para agua muy dura, añadir unas gotas de vinagre al agua de aclarado (no mezclar directamente con el jabón). Muy seguro para uso diario.',
    denominaciones: ['Jabón negro', 'Jabón puro de oliva', 'Jabón potásico', 'Jabón de Marsella', 'Jabón verde (Europa)'],
  },
];

// =========================================================
// COLORES POR TIPO QUÍMICO
// =========================================================
const TIPO_CONFIG: Record<TipoQuimico, { etiqueta: string; colorFondo: string; colorTexto: string }> = {
  acido:    { etiqueta: 'Ácido',     colorFondo: '#FEF3C7', colorTexto: '#92400E' },
  base:     { etiqueta: 'Álcali',    colorFondo: '#DBEAFE', colorTexto: '#1E40AF' },
  solvente: { etiqueta: 'Solvente',  colorFondo: '#EDE9FE', colorTexto: '#5B21B6' },
  oxidante: { etiqueta: 'Oxidante',  colorFondo: '#D1FAE5', colorTexto: '#065F46' },
  neutro:   { etiqueta: 'Neutro',    colorFondo: '#F3F4F6', colorTexto: '#374151' },
};

const TIPO_CONFIG_DARK: Record<TipoQuimico, { colorFondo: string; colorTexto: string }> = {
  acido:    { colorFondo: '#78350F', colorTexto: '#FDE68A' },
  base:     { colorFondo: '#1E3A5F', colorTexto: '#BFDBFE' },
  solvente: { colorFondo: '#3B1F6A', colorTexto: '#DDD6FE' },
  oxidante: { colorFondo: '#064E3B', colorTexto: '#A7F3D0' },
  neutro:   { colorFondo: '#374151', colorTexto: '#D1D5DB' },
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function GuiaProductosLimpiezaPage() {
  const [productoActivo, setProductoActivo] = useState<string>('lejia');

  const producto = PRODUCTOS.find((p) => p.id === productoActivo) ?? PRODUCTOS[0];
  const tipoCfg = TIPO_CONFIG[producto.tipo];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🧹 Guía de Productos de Limpieza</h1>
        <p className={styles.subtitle}>
          Usos correctos, superficies que dañan y mezclas peligrosas de los productos domésticos más comunes
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="critical"
        collapsible={false}
        context="guia-productos-limpieza"
      >
        <p>
          <strong>Información de seguridad:</strong> Esta guía tiene carácter educativo y de referencia.
          Algunas mezclas de productos de limpieza generan gases tóxicos o reacciones peligrosas.
          Lee siempre la etiqueta del producto antes de usarlo, respeta las indicaciones del fabricante
          y consulta a profesionales ante cualquier duda sobre su uso seguro. En caso de intoxicación
          o accidente, llama al <strong>Servicio de Información Toxicológica</strong> de tu país.
        </p>
      </DisclaimerCard>

      {/* Selector de producto */}
      <section className={styles.selectorSection}>
        <h2 className={styles.selectorTitulo}>Selecciona un producto</h2>
        <div className={styles.productoGrid} role="group" aria-label="Seleccionar producto de limpieza">
          {PRODUCTOS.map((p) => {
            const cfg = TIPO_CONFIG[p.tipo];
            return (
              <button
                key={p.id}
                onClick={() => setProductoActivo(p.id)}
                className={`${styles.productoBtn} ${productoActivo === p.id ? styles.productoBtnActivo : ''}`}
                aria-pressed={productoActivo === p.id}
              >
                <span className={styles.productoBtnIcono} aria-hidden="true">{p.icono}</span>
                <span className={styles.productoBtnNombre}>{p.nombre}</span>
                <span
                  className={styles.productoBtnBadge}
                  style={{ backgroundColor: cfg.colorFondo, color: cfg.colorTexto }}
                >
                  {cfg.etiqueta}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Panel de detalle */}
      <section className={styles.detallePanel} aria-live="polite" aria-label={`Información sobre ${producto.nombre}`}>
        {/* Cabecera del producto */}
        <div className={styles.detalleHeader}>
          <span className={styles.detalleIcono} aria-hidden="true">{producto.icono}</span>
          <div className={styles.detalleHeaderTexto}>
            <h2 className={styles.detalleNombre}>{producto.nombre}</h2>
            <p className={styles.detalleQuimico}>{producto.nombreQuimico}</p>
          </div>
          <span
            className={styles.detalleTipoBadge}
            style={{ backgroundColor: tipoCfg.colorFondo, color: tipoCfg.colorTexto }}
          >
            {tipoCfg.etiqueta}
          </span>
        </div>

        <div className={styles.detalleGrid}>
          {/* Usos indicados */}
          <div className={styles.detalleBloque}>
            <h3 className={styles.bloqueTitle}>
              <span aria-hidden="true">✅</span> Indicado para
            </h3>
            <ul className={styles.usosList}>
              {producto.usos.map((uso, i) => (
                <li key={i} className={styles.usoItem}>{uso}</li>
              ))}
            </ul>
          </div>

          {/* Contraindicaciones */}
          <div className={styles.detalleBloque}>
            <h3 className={`${styles.bloqueTitle} ${styles.bloqueTitleRojo}`}>
              <span aria-hidden="true">❌</span> No usar en
            </h3>
            <ul className={styles.contraList}>
              {producto.contraindicaciones.map((c, i) => (
                <li key={i} className={styles.contraItem}>
                  <span className={styles.contraSuperficie}>{c.superficie}</span>
                  <span className={styles.contraRazon}>{c.razon}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mezclas peligrosas */}
        {producto.noMezclar.length > 0 && (
          <div className={styles.mezclasBloque}>
            <h3 className={styles.mezclasTitle}>
              <span aria-hidden="true">⚠️</span> Nunca mezclar con
            </h3>
            <div className={styles.mezclasGrid}>
              {producto.noMezclar.map((m, i) => (
                <div key={i} className={`${styles.mezclaCard} ${m.gravedad === 'critica' ? styles.mezclaCritica : styles.mezclaAlta}`}>
                  <div className={styles.mezclaCabecera}>
                    <span className={styles.mezclaGravedadBadge}>
                      {m.gravedad === 'critica' ? '🚨 PELIGRO CRÍTICO' : '⚠️ RIESGO ALTO'}
                    </span>
                    <strong className={styles.mezclaProducto}>{m.con}</strong>
                  </div>
                  <p className={styles.mezclaRiesgo}>{m.riesgo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consejo de uso */}
        <div className={styles.consejoBloque}>
          <span aria-hidden="true">💡</span>
          <p><strong>Consejo de uso:</strong> {producto.consejoUso}</p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CONTENIDO EDUCATIVO v2.0 */}
      {/* ========================================================= */}
      <EducationalSection
        title="📚 Guía completa de productos de limpieza domésticos"
        subtitle="Química, denominaciones, comparativa y errores frecuentes que debes conocer"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section className={styles.guideSection}>
          <h2>Comparativa de los 9 productos</h2>
          <p>Resumen rápido del tipo químico, pH aproximado y uso principal de cada producto.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>pH aprox.</th>
                  <th>Uso principal</th>
                  <th>Mayor precaución</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🧴 Lejía</strong></td>
                  <td>Álcali oxidante</td>
                  <td>11-13</td>
                  <td>Desinfectar y blanquear</td>
                  <td>No mezclar con ácidos ni amoniaco</td>
                </tr>
                <tr>
                  <td><strong>⚗️ Salfumán</strong></td>
                  <td>Ácido fuerte</td>
                  <td>0-1</td>
                  <td>Eliminar cal y sarro resistente</td>
                  <td>Destruye mármol y metales</td>
                </tr>
                <tr>
                  <td><strong>🍶 Vinagre</strong></td>
                  <td>Ácido débil</td>
                  <td>2-3</td>
                  <td>Descalcificar y desodorizar</td>
                  <td>Daña mármol; no mezclar con lejía</td>
                </tr>
                <tr>
                  <td><strong>🥄 Bicarbonato</strong></td>
                  <td>Base débil</td>
                  <td>8-9</td>
                  <td>Desodorizar y limpiar suave</td>
                  <td>No mezclar con ácidos (se neutraliza)</td>
                </tr>
                <tr>
                  <td><strong>💊 Alcohol</strong></td>
                  <td>Solvente</td>
                  <td>~7</td>
                  <td>Desinfectante y quitamanchas</td>
                  <td>Inflamable; no mezclar con lejía</td>
                </tr>
                <tr>
                  <td><strong>🫧 Amoniaco</strong></td>
                  <td>Base volátil</td>
                  <td>11-12</td>
                  <td>Cristales y desengrasante</td>
                  <td>No mezclar con lejía (gas tóxico)</td>
                </tr>
                <tr>
                  <td><strong>💧 Agua oxigenada</strong></td>
                  <td>Oxidante</td>
                  <td>4-5</td>
                  <td>Desinfectar y blanquear juntas</td>
                  <td>No mezclar con vinagre ni lejía</td>
                </tr>
                <tr>
                  <td><strong>🧪 Acetona</strong></td>
                  <td>Solvente orgánico</td>
                  <td>~7</td>
                  <td>Quitar esmaltes y adhesivos</td>
                  <td>Extremadamente inflamable</td>
                </tr>
                <tr>
                  <td><strong>🫧 Jabón de Castilla</strong></td>
                  <td>Base suave</td>
                  <td>9-10</td>
                  <td>Limpieza general suave</td>
                  <td>Se corta con ácidos (agua dura)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section className={styles.guideSection}>
          <h2>Por estancia o tarea: qué producto usar</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🚿</span>
                <h3>Baño: cal, moho y sanitarios</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Cal en grifos y ducha:</strong> vinagre diluido o agua oxigenada</p>
                <p><strong>Moho en juntas:</strong> lejía diluida (1:10)</p>
                <p><strong>Sarro muy duro en WC:</strong> salfumán muy diluido, aclarar inmediatamente</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Nunca uses:</strong> lejía sobre mármol o granito del baño. Para piedra natural, solo agua tibia con jabón neutro.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🍳</span>
                <h3>Cocina: grasa, manchas y electrodomésticos</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Grasa en vitrocerámica y horno:</strong> bicarbonato en pasta + amoniaco</p>
                <p><strong>Campana y quemadores:</strong> amoniaco diluido</p>
                <p><strong>Acero inoxidable (manchas de agua):</strong> vinagre o alcohol 70%</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Ojo:</strong> no mezcles amoniaco y lejía en la misma sesión de limpieza de cocina.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🪟</span>
                <h3>Cristales, espejos y ventanas</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Sin rayas y sin halo:</strong> amoniaco diluido o vinagre blanco</p>
                <p><strong>Desinfección extra:</strong> alcohol 70% con bayeta de microfibra</p>
                <p><strong>Marcos de aluminio:</strong> jabón de Castilla + agua (evitar ácidos)</p>
              </div>
              <p className={styles.escenarioTip}>
                Mejor limpiar cristales con cielo nublado: el sol seca el producto antes de poder aclarlo y deja marcas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🪵</span>
                <h3>Madera, parquet y muebles</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Limpieza suave general:</strong> jabón de Castilla muy diluido</p>
                <p><strong>Manchas de rotulador:</strong> alcohol 70% con trapo (poca cantidad)</p>
                <p><strong>Marcas de grasa:</strong> bicarbonato en pasta suave</p>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Nunca sobre madera:</strong> lejía, salfumán, vinagre, amoniaco ni acetona. Todos dañan la madera o su acabado.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el salfumán destruye el mármol pero no el azulejo?</h4>
              <p>
                El mármol y la piedra caliza están compuestos principalmente de carbonato cálcico (CaCO₃),
                que reacciona de forma inmediata y violenta con el ácido clorhídrico (HCl). El azulejo, en cambio,
                es una cerámica de silicato (SiO₂) que resiste bien los ácidos. Basta una gota de salfumán en
                mármol para observar la efervescencia del CO₂ liberado: ese es el mármol disolviéndose.
              </p>
              <p className={styles.faqTip}>
                💡 Si tienes dudas sobre un material, prueba en una zona oculta con una pequeña gota antes de aplicar en toda la superficie.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Es verdad que mezclar lejía y amoniaco es tan peligroso?</h4>
              <p>
                Sí, es la mezcla más peligrosa del hogar. El hipoclorito reacciona con el amoniaco
                generando cloraminas gaseosas (monocloramina NH₂Cl y dicloramina NHCl₂). Estos vapores
                son invisibles, irritan gravemente las vías respiratorias y, en espacios poco ventilados,
                pueden causar edema pulmonar (acumulación de líquido en los pulmones), hospitalización
                e incluso la muerte en exposiciones intensas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿El bicarbonato y el vinagre juntos limpian mejor?</h4>
              <p>
                Es el mito de limpieza más extendido. La reacción ácido-base los neutraliza completamente:
                el resultado es agua, sal de sodio (acetato sódico) y CO₂, sin propiedades limpiadoras.
                La efervescencia parece espectacular pero no aporta nada. Úsalos por separado para aprovechar
                sus propiedades individuales (el bicarbonato como base suave abrasiva; el vinagre como
                ácido descalcificador).
              </p>
              <p className={styles.faqTip}>
                💡 La única excepción donde la mezcla tiene sentido es para desatascar sifones: el CO₂ generado ayuda a mover la obstrucción.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el alcohol al 70% desinfecta mejor que el de 96%?</h4>
              <p>
                El agua presente en el alcohol al 70% es esencial: ralentiza la evaporación (más tiempo de contacto
                con la bacteria) y facilita la penetración a través de la membrana celular microbiana.
                El alcohol puro al 96% evapora demasiado rápido y además puede precipitar las proteínas en la
                superficie de la célula bacteriana creando una capa protectora que impide su destrucción total.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo limpio mármol correctamente?</h4>
              <p>
                El mármol solo admite productos neutros o ligeramente alcalinos muy suaves. La regla es:
                agua tibia + jabón de Castilla o jabón neutro de PH 7, escurrido (nunca empapado).
                Secar siempre inmediatamente para evitar manchas de cal. Nunca uses lejía, vinagre, salfumán,
                limpiadores multiusos con ácidos cítricos ni ningún producto ácido. El mármol es
                carbonato cálcico puro y reacciona con cualquier ácido, por débil que sea.
              </p>
              <p className={styles.faqTip}>
                💡 Si el mármol ha perdido brillo por haber usado un ácido, solo puede recuperarse con pulido profesional.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué hago si mezclo productos por error?</h4>
              <p>
                Si mezclas lejía con amoniaco, vinagre u otros ácidos por accidente: abandona la habitación
                inmediatamente, deja ventanas y puertas abiertas, sal al aire fresco y espera al menos
                15-20 minutos antes de volver. Si hay irritación de ojos o dificultad respiratoria,
                busca atención médica. En España, el Servicio de Información Toxicológica es el
                <strong> 915 620 420</strong> (disponible 24 horas).
              </p>
            </div>
          </div>
        </section>

        {/* 4. DENOMINACIONES REGIONALES */}
        <section className={styles.guideSection}>
          <h2>Denominaciones en distintos países hispanohablantes</h2>
          <p>
            El mismo producto tiene nombres muy distintos según la región. Si viajas o compras en otro
            país hispanohablante, esta tabla te ayudará a identificar el producto correcto.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Producto (España)</th>
                  <th>Nombre en Latam / resto</th>
                  <th>Nombre químico universal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lejía</strong></td>
                  <td>Cloro, lavandina (Arg/Uru), blanqueador, agua de cloro</td>
                  <td>Hipoclorito sódico (NaClO)</td>
                </tr>
                <tr>
                  <td><strong>Salfumán</strong></td>
                  <td>Ácido muriático, salfumante</td>
                  <td>Ácido clorhídrico (HCl)</td>
                </tr>
                <tr>
                  <td><strong>Agua oxigenada</strong></td>
                  <td>Peroxol, agua oxigenada (universal)</td>
                  <td>Peróxido de hidrógeno (H₂O₂)</td>
                </tr>
                <tr>
                  <td><strong>Alcohol</strong></td>
                  <td>Alcohol de 70°, IPA, alcohol isopropílico</td>
                  <td>Etanol (C₂H₅OH) / Isopropanol</td>
                </tr>
                <tr>
                  <td><strong>Jabón de Castilla</strong></td>
                  <td>Jabón de Marsella, jabón negro, jabón verde (Europa)</td>
                  <td>Jabón potásico de oleato</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section className={styles.guideSection}>
          <h2>Hábitos de limpieza segura</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🧤</span>
              <h3>Usa siempre guantes</h3>
              <p>Incluso productos aparentemente inofensivos como el amoniaco o el alcohol pueden irritar la piel con exposición prolongada. Los guantes de nitrilo son los más resistentes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🪟</span>
              <h3>Ventilación siempre</h3>
              <p>Abre ventanas antes de empezar, no después. El amoniaco, el salfumán y la acetona generan vapores desde el primer momento, incluso antes de mezclar nada.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🏷️</span>
              <h3>Lee la etiqueta primero</h3>
              <p>Muchos limpiadores multiusos contienen ácido cítrico, amoniaco o hipoclorito sin indicarlo claramente en el nombre comercial. La etiqueta revela los ingredientes activos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔬</span>
              <h3>Menos es más</h3>
              <p>Más producto no significa más limpio. En muchos casos (lejía, salfumán) la concentración exacta es clave: muy concentrado daña la superficie; muy diluido no limpia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🧴</span>
              <h3>Guarda en envase original</h3>
              <p>Nunca transvases productos de limpieza a botellas sin etiquetar. El salfumán en una botella de agua puede causar accidentes gravísimos, especialmente con niños en casa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🗓️</span>
              <h3>Respeta el tiempo de acción</h3>
              <p>Dejar actuar el producto el tiempo adecuado mejora el resultado y reduce la necesidad de frotar. Pero dejarlo demasiado tiempo (especialmente ácidos) puede dañar la superficie.</p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcono} aria-hidden="true">🚨</span>
              <h2>Las 5 mezclas más peligrosas del hogar</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Lejía + Amoniaco:</strong> Genera cloraminas gaseosas tóxicas. La combinación más peligrosa del hogar: provoca irritación respiratoria severa, broncoespasmo y puede ser mortal en espacio cerrado.</li>
              <li><strong>Lejía + Vinagre (o cualquier ácido):</strong> Libera cloro gaseoso (Cl₂), un gas irritante severo. Incluso cantidades pequeñas en baños cerrados pueden causar irritación intensa de ojos y pulmones.</li>
              <li><strong>Alcohol + Llama o chispa:</strong> El alcohol (y la acetona) son extremadamente inflamables. Sus vapores son más densos que el aire, se acumulan en el suelo y pueden arder a metros de la fuente de ignición.</li>
              <li><strong>Salfumán + Lejía:</strong> Doble liberación de cloro gaseoso. El ácido clorhídrico reacciona con el hipoclorito con mucha mayor violencia que el vinagre, generando cloro en grandes cantidades.</li>
              <li><strong>Vinagre + Agua oxigenada:</strong> Forma ácido peracético, un compuesto corrosivo que irrita piel, ojos y vías respiratorias incluso en pequeñas dosis. La mezcla no «potencia» la desinfección como se cree popularmente.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-productos-limpieza')} />
      <ShareCard appName="guia-productos-limpieza" />
      <Footer appName="guia-productos-limpieza" />
    </div>
  );
}
