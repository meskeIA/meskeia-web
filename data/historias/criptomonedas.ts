import type { HistoriaData } from './types';

export const criptomonedas: HistoriaData = {
  slug: 'criptomonedas',
  titulo: 'Historia de las Criptomonedas y Blockchain (2008–actualidad)',
  subtitulo: 'De la crisis financiera de 2008 al activo institucional: 15 años de experimento criptográfico que transformó las finanzas globales',
  descripcionSEO: 'Cronología interactiva de las criptomonedas: desde el whitepaper de Bitcoin de Satoshi Nakamoto (2008) hasta los ETFs institucionales y la regulación MiCA (2024). Bitcoin, Ethereum, DeFi, NFTs, colapso de FTX y madurez regulatoria en 10 hitos y 6 eras.',
  keywords: [
    'historia bitcoin criptomonedas cronología',
    'satoshi nakamoto blockchain whitepaper 2008',
    'ethereum contratos inteligentes vitalik buterin',
    'defi finanzas descentralizadas NFT boom',
    'ftx sam bankman-fried colapso fraude',
    'mica regulación criptomonedas etf bitcoin 2024',
  ],
  anioInicio: 2008,
  anioFin: 9999,

  hitos: [
    {
      id: 'bitcoin-whitepaper',
      nombre: 'Whitepaper de Bitcoin y Bloque Génesis',
      anioInicio: 2008,
      anioFin: 2009,
      color: '#D97706',
      categoria: 'protocolo',
      descripcion: `El 31 de octubre de 2008, en plena crisis financiera global tras el colapso de Lehman Brothers, una persona o grupo bajo el pseudónimo "Satoshi Nakamoto" publicó el whitepaper "Bitcoin: A Peer-to-Peer Electronic Cash System" en una lista de correo de criptografía (metzdowd.com). El documento de nueve páginas describía un sistema de dinero electrónico que permitía transacciones directas entre pares sin necesidad de un intermediario financiero de confianza, resolviendo el problema del doble gasto mediante una cadena de bloques con prueba de trabajo (Proof of Work).

El 3 de enero de 2009, Nakamoto minó el bloque génesis (bloque #0) de la blockchain de Bitcoin. En el campo coinbase de ese bloque, incrustó el titular del Times de Londres del mismo día: "Chancellor on brink of second bailout for banks" —el Canciller británico estaba a punto de aprobar un segundo rescate bancario—, interpretado ampliamente como un comentario explícito sobre las fallas del sistema bancario tradicional y la justificación filosófica del proyecto. El bloque génesis contenía 50 BTC que, por un detalle técnico intencional o accidental, no pueden ser gastados; siguen inamovibles en la cadena hasta hoy.

La identidad de Nakamoto nunca ha sido confirmada de forma definitiva. Los análisis estilométricos de los primeros mensajes en Bitcointalk.org, los patrones de actividad (principalmente en horario europeo o asiático oriental) y los conocimientos profundos tanto de criptografía como de sistemas distribuidos han generado decenas de teorías. Entre los candidatos más mencionados figuran Hal Finney (criptógrafo, primer receptor de BTC), Nick Szabo (creador del concepto "bit gold") y Adam Back (inventor de hashcash, el sistema de PoW que Bitcoin adapta). Nakamoto fue reduciendo gradualmente su participación en la comunidad entre 2010 y 2011, y envió un último mensaje privado a Gavin Andresen en abril de 2011 antes de desaparecer. La cartera original de Nakamoto, estimada en más de un millón de BTC (~600.000M$ al máximo de 2021), nunca se ha movido.`,
      obraIconica: 'Whitepaper "Bitcoin: A Peer-to-Peer Electronic Cash System" — Satoshi Nakamoto, 31 oct. 2008',
      paises: ['Global (internet)', 'Desconocido (Nakamoto)'],
    },
    {
      id: 'primera-transaccion-pizza',
      nombre: 'Primeras Transacciones y Comunidad Pionera',
      anioInicio: 2009,
      anioFin: 2011,
      color: '#059669',
      categoria: 'adopcion',
      descripcion: `El 12 de enero de 2009, apenas nueve días después del bloque génesis, Satoshi Nakamoto envió 10 BTC a Hal Finney en la primera transacción de la historia de Bitcoin. Finney, programador de PGP Corporation y uno de los grandes nombres de la comunidad cypherpunk, ya había descargado el cliente Bitcoin el mismo día en que Nakamoto lo anunció. Esta primera transferencia estableció que el sistema funcionaba de extremo a extremo.

El 22 de mayo de 2010 ocurrió lo que se considera la primera compra comercial con Bitcoin: Laszlo Hanyecz, programador en Florida, publicó en Bitcointalk.org que pagaría 10.000 BTC por dos pizzas de Papa John's. Un usuario del Reino Unido aceptó, las pidió por teléfono y las entregó. El precio fue aproximadamente 0,0041$ por BTC —unos 41$ en total—. Al precio máximo alcanzado en noviembre 2021 (69.000$), esas pizzas habrían costado ~690 millones de dólares. El 22 de mayo se celebra anualmente como "Bitcoin Pizza Day" en toda la comunidad cripto como recordatorio del valor que puede perder o ganar un activo emergente.

El foro Bitcointalk.org, fundado por Nakamoto en 2009, se convirtió en el núcleo de la comunidad: allí se discutían mejoras de protocolo, se intercambiaban BTC entre usuarios y se documentaban los primeros proyectos derivados. Mt. Gox, originalmente un sitio de intercambio de cartas del juego Magic: The Gathering (Magic: The Gathering Online eXchange, de ahí el nombre), fue reconvertido en 2010 por el desarrollador Jed McCaleb en el primer exchange Bitcoin relevante. Para 2011, Mt. Gox manejaba aproximadamente el 70% de todas las transacciones de Bitcoin a nivel mundial, estableciendo el modelo de exchange centralizado que dominaría la industria durante años.`,
      obraIconica: "Bitcoin Pizza Day — 10.000 BTC por dos pizzas de Papa John's (22 mayo 2010)",
      paises: ['EEUU', 'Reino Unido', 'Global (internet)'],
    },
    {
      id: 'mt-gox-crisis-darknet',
      nombre: 'Mt. Gox, Silk Road y las Primeras Crisis',
      anioInicio: 2011,
      anioFin: 2014,
      color: '#DC2626',
      categoria: 'crisis',
      descripcion: `Los años 2011-2014 pusieron a prueba la resiliencia del ecosistema Bitcoin con múltiples shocks simultáneos que revelaron las vulnerabilidades de una tecnología en estado experimental desplegada en el mundo real.

Mt. Gox fue hackeado por primera vez en junio de 2011: un atacante obtuvo acceso a las credenciales de un auditor y manipuló el precio de BTC hasta 0,01$ en minutos, robando aproximadamente 25.000 BTC en el proceso. El incidente generó el primer gran debate sobre la seguridad de los exchanges centralizados. El mercado Silk Road, lanzado en febrero de 2011 por Ross Ulbricht bajo el alias "Dread Pirate Roberts", se convirtió en el primer gran marketplace online para drogas ilegales usando Bitcoin como moneda de pago. Su existencia demostró tanto la utilidad de Bitcoin para transacciones pseudoanónimas como los riesgos reputacionales del ecosistema. El FBI lo clausuró en octubre de 2013; Ulbricht fue detenido en una biblioteca pública de San Francisco. Juzgado en 2015, fue condenado a cadena perpetua sin posibilidad de libertad condicional por cargos que incluían narcotráfico, conspiración y lavado de dinero.

En febrero de 2014, Mt. Gox suspendió todos los retiros y días después comunicó que había perdido 850.000 BTC (~450 millones de dólares al precio de entonces), resultado de hackeos acumulados durante años que el equipo había ocultado. Era el mayor robo en la historia de las criptomonedas en términos relativos. El CEO Mark Karpelès fue arrestado en Japón en 2015; su juicio se extendió hasta 2019, cuando fue condenado por manipulación de datos pero absuelto de malversación. El caso Mt. Gox estableció con claridad la necesidad de regulación de exchanges y el principio "not your keys, not your coins": si no controlas las claves privadas, no controlas los fondos.`,
      obraIconica: 'Colapso de Mt. Gox — 850.000 BTC perdidos (febrero 2014)',
      paises: ['Japón', 'EEUU', 'Global'],
    },
    {
      id: 'ethereum-contratos-inteligentes',
      nombre: 'Ethereum y los Contratos Inteligentes',
      anioInicio: 2013,
      anioFin: 2016,
      color: '#7C3AED',
      categoria: 'protocolo',
      descripcion: `En diciembre de 2013, Vitalik Buterin, programador nacido en Rusia y criado en Canadá que por entonces contaba 19 años, publicó el whitepaper de Ethereum. Buterin, que había sido editor de Bitcoin Magazine, argumentaba que Bitcoin tenía un lenguaje de scripting deliberadamente limitado y que el verdadero potencial de la tecnología blockchain residía en ejecutar código arbitrario de forma descentralizada —los denominados "contratos inteligentes" (smart contracts), concepto inicialmente articulado por Nick Szabo en los años 90—.

Ethereum se concibió como una "máquina virtual descentralizada" (Ethereum Virtual Machine, EVM): cualquier programador podría desplegar código (contratos) en la blockchain que se ejecutaría de forma automática, transparente e irreversible al cumplirse las condiciones programadas. Esto abría la puerta a aplicaciones descentralizadas (dApps) para cualquier caso de uso: préstamos, seguros, gobernanza, mercados de activos.

El proyecto se financió mediante una ICO pública entre julio y agosto de 2014, recaudando 18,4 millones de dólares en BTC de miles de inversores en todo el mundo. La mainnet de Ethereum se lanzó el 30 de julio de 2015 (bloque génesis de Ethereum). El primer gran test del ecosistema fue dramático: The DAO (Decentralized Autonomous Organization), un fondo de inversión gestionado íntegramente por smart contracts en Ethereum, recaudó 150 millones de dólares en ETH durante mayo de 2016. En junio de 2016, un atacante anónimo explotó una vulnerabilidad de "reentrancy" en el código del contrato inteligente y drenó 3,6 millones de ETH (~60 millones de dólares). La controversia sobre si se debía revertir la cadena para recuperar los fondos dividió profundamente a la comunidad: el resultado fue un hard fork en julio de 2016, creando Ethereum (ETH, con la reversión) y Ethereum Classic (ETC, manteniendo la cadena original inmutable). El debate sentó precedente sobre la gobernanza de protocolos descentralizados.`,
      obraIconica: 'Whitepaper de Ethereum (diciembre 2013) — Vitalik Buterin, 19 años',
      paises: ['Global (internet)', 'Suiza (Fundación Ethereum)', 'Canadá', 'Rusia'],
    },
    {
      id: 'ico-boom-altcoins',
      nombre: 'ICO Boom, Altcoins y el Gran Crash de 2018',
      anioInicio: 2017,
      anioFin: 2019,
      color: '#DC2626',
      categoria: 'crisis',
      descripcion: `El año 2017 fue el período de mayor efervescencia especulativa en la historia de las criptomonedas hasta ese momento. Bitcoin superó los 20.000 dólares en diciembre de 2017 por primera vez, multiplicando por 20 su precio de inicio de año. La fiebre de las ICO (Initial Coin Offerings) alcanzó proporciones sin precedentes: en 2017 se recaudaron aproximadamente 5.600 millones de dólares mediante ventas de tokens, muchas de ellas basadas únicamente en un whitepaper sin producto funcional ni equipo verificable. La barrera técnica para lanzar un token ERC-20 sobre Ethereum era mínima, lo que democratizó tanto la innovación legítima como el fraude.

Junto a Bitcoin y Ethereum emergieron cientos de "altcoins": Ripple (XRP), posicionado para pagos interbancarios en colaboración con bancos; Litecoin, creado por Charlie Lee como "plata digital" frente al "oro digital" de Bitcoin; Monero, centrado en privacidad real (no pseudoanonimato); y proyectos como Cardano, EOS, NEO y Stellar, cada uno con propuestas técnicas diferenciadas. La capitalización total del mercado cripto alcanzó 800.000 millones de dólares en enero de 2018.

La SEC estadounidense comenzó a investigar en julio de 2017 si las ICOs constituían valores (securities) no registrados, siguiendo el "test de Howey" establecido por el Tribunal Supremo. La ofensiva regulatoria, unida al colapso de expectativas sobre proyectos sin sustancia, desencadenó el crash de 2018: Bitcoin perdió el 84% de su valor en 12 meses. La mayoría de las altcoins perdieron entre el 90% y el 99% de su capitalización. Numerosas ICOs resultaron en proyectos abandonados, "exit scams" documentados o casos de fraude investigados. El exchange QuadrigaCX (Canadá) colapsó en 2019 cuando murió su fundador Gerald Cotten con las únicas claves privadas de ~190 millones de dólares en criptomonedas de clientes; investigaciones posteriores apuntaron a posible fraude previo a su muerte.`,
      obraIconica: 'Bitcoin a 20.000$ (diciembre 2017) — máximo histórico del ciclo ICO',
      paises: ['EEUU', 'China', 'Corea del Sur', 'Japón', 'Global'],
    },
    {
      id: 'defi-verano',
      nombre: 'DeFi, Verano Cripto y Máximos Históricos',
      anioInicio: 2019,
      anioFin: 2021,
      color: '#7C3AED',
      categoria: 'defi',
      descripcion: `Las finanzas descentralizadas (DeFi) emergieron como el siguiente paradigma tras el crash de 2018: protocolos que replicaban servicios financieros tradicionales —préstamos, intercambios, derivados, seguros— sin intermediarios, operando exclusivamente mediante smart contracts auditados públicamente en Ethereum. Los proyectos pioneros MakerDAO (stablecoin DAI colateralizada), Compound (préstamos algorítmicos), Aave (préstamos con flash loans) y Uniswap (exchange descentralizado con market maker automático, AMM) atrajeron miles de millones en "Total Value Locked" (TVL).

El "DeFi Summer" de 2020 marcó la explosión del sector: Compound lanzó el concepto de "yield farming" (obtener rendimiento proporcionando liquidez a protocolos), generando retornos anualizados de tres y cuatro dígitos que atrajeron a un nuevo perfil de usuario sofisticado. El TVL total en DeFi creció de ~700 millones de dólares en enero de 2020 a más de 15.000 millones en diciembre de 2020.

Bitcoin superó su máximo anterior de 20.000$ en diciembre de 2020 —tres años después del ciclo anterior— y continuó escalando hasta 69.000$ en noviembre de 2021. El Salvador, bajo el presidente Nayib Bukele, adoptó Bitcoin como moneda de curso legal el 7 de septiembre de 2021, convirtiéndose en la primera nación del mundo en hacerlo. El FMI expresó preocupaciones formales sobre los riesgos para la estabilidad financiera. La capitalización total del mercado de criptomonedas alcanzó un máximo histórico de 3 billones de dólares en noviembre de 2021, comparable a la capitalización de Apple en ese momento.`,
      obraIconica: 'Uniswap v2 y el "DeFi Summer" de 2020 — primer exchange descentralizado masivo',
      paises: ['Global (internet)', 'El Salvador', 'EEUU', 'Suiza'],
    },
    {
      id: 'nft-boom-metaverso',
      nombre: 'Boom de los NFTs y la Cultura Digital',
      anioInicio: 2020,
      anioFin: 2022,
      color: '#0EA5E9',
      categoria: 'nft',
      descripcion: `Los NFTs (Non-Fungible Tokens, tokens no fungibles) existen desde 2017 con proyectos como CryptoPunks y CryptoKitties, pero fue en 2021 cuando entraron de forma explosiva en el mainstream cultural y económico. Un NFT es un registro de propiedad único en una blockchain —típicamente Ethereum— que puede representar cualquier activo digital: arte, música, vídeos, objetos de videojuegos o entradas a eventos.

El hito que catalizó la fiebre fue la subasta en Christie's —la casa de subastas fundada en 1766— de "Everydays: The First 5000 Days" del artista digital Mike Winkelmann (conocido como Beeple): un collage de 5.000 imágenes digitales diarias se vendió en marzo de 2021 por 69,3 millones de dólares, convirtiéndolo en el tercer artista vivo más caro del mundo en ese momento. La transacción fue pionera al realizarse íntegramente en ETH, con el pago liquidado en criptomonedas.

Las colecciones de "profile picture" (PFP) como Bored Ape Yacht Club (BAYC, lanzada en abril 2021 por Yuga Labs) y CryptoPunks (10.000 imágenes pixeladas generadas algorítmicamente en 2017) alcanzaron precios de cientos de miles de dólares por pieza, con propietarios que incluían a celebridades como Eminem, Paris Hilton y Justin Bieber. El volumen total de mercado de NFTs superó los 25.000 millones de dólares en 2021 según datos de DappRadar.

En 2022, el mercado NFT colapsó con una velocidad que sorprendió incluso a los escépticos: el volumen mensual cayó más del 97% desde los máximos de enero 2022. Las razones fueron múltiples: exceso especulativo sin sustento en utilidad real, colapso general del mercado cripto y saturación de proyectos sin valor diferencial. OpenSea, el marketplace líder, pasó de un volumen mensual de 5.000 millones en enero 2022 a menos de 100 millones en diciembre 2022. La tecnología NFT, sin embargo, continuó explorándose para casos de uso más sustanciales: ticketing, licencias de música, gaming con activos interoperables y certificados de autenticidad.`,
      obraIconica: '"Everydays: The First 5000 Days" de Beeple — 69,3M$ en Christie\'s (marzo 2021)',
      paises: ['EEUU', 'Global (internet)', 'Suiza', 'Singapur'],
    },
    {
      id: 'luna-celsius-ftx-crisis',
      nombre: 'Colapso de Terra/Luna, Celsius y FTX',
      anioInicio: 2022,
      anioFin: 2023,
      color: '#DC2626',
      categoria: 'crisis',
      descripcion: `El año 2022 fue el más devastador de la historia de las criptomonedas en términos de destrucción de valor y confianza institucional, con tres colapsos en cascada que afectaron a decenas de millones de usuarios.

Terra/Luna (mayo 2022): El ecosistema Terra, fundado por Do Kwon y Daniel Shin en Corea del Sur, incluía la stablecoin algorítmica UST, diseñada para mantener su paridad con el dólar mediante un mecanismo de arbitraje con el token LUNA. En mayo de 2022, grandes ventas coordinadas de UST rompieron el mecanismo: el algoritmo imprimió cantidades masivas de LUNA para defender la paridad, causando hiperinflación del token y un colapso en espiral. En menos de una semana, ~40.000 millones de dólares en capitalización de mercado se evaporaron. Do Kwon fue investigado criminalmente en Corea del Sur y Estados Unidos; fue detenido en Montenegro en marzo de 2023 con un pasaporte falsificado y posteriormente extraditado a Corea del Sur.

Celsius Network (junio-julio 2022): Esta plataforma de préstamos cripto que prometía hasta el 18% anual sobre depósitos suspendió todos los retiros en junio de 2022, atrapando los fondos de 1,7 millones de clientes. Declaró quiebra (Chapter 11) en julio con 4.700 millones de dólares en deudas. Su CEO Alex Mashinsky fue arrestado en julio de 2023 y acusado de fraude.

FTX (noviembre 2022): El segundo exchange por volumen del mundo colapsó en 10 días. Todo comenzó con una información de CoinDesk que reveló la concentración de activos del fondo de inversión Alameda Research (controlado por SBF) en el token FTT del propio FTX. Binance anunció la venta de sus FTT, desencadenando una corrida bancaria. FTX suspendió retiros el 8 de noviembre; SBF presentó quiebra el 11 de noviembre. Sam Bankman-Fried fue arrestado en Bahamas el 12 de diciembre de 2022 y extraditado a EEUU. Su juicio concluyó en noviembre de 2023 con veredicto de culpabilidad en los siete cargos de fraude y conspiración. En marzo de 2024 fue sentenciado a 25 años de prisión. El administrador concursal John Ray III, que había gestionado la quiebra de Enron, estimó las pérdidas de clientes de FTX en 8.700 millones de dólares.`,
      obraIconica: 'Arresto de Sam Bankman-Fried (diciembre 2022) — sentenciado a 25 años (marzo 2024)',
      paises: ['EEUU', 'Bahamas', 'Corea del Sur', 'Montenegro', 'Global'],
    },
    {
      id: 'regulacion-institucional',
      nombre: 'MiCA, ETFs Institucionales y Nueva Regulación Global',
      anioInicio: 2023,
      anioFin: 2024,
      color: '#374151',
      categoria: 'regulacion',
      descripcion: `Las crisis de 2022 actuaron como catalizador para acelerar el desarrollo de marcos regulatorios que venían siendo discutidos durante años. La respuesta regulatoria más significativa fue el Reglamento sobre Mercados de Criptoactivos (MiCA, Markets in Crypto-Assets Regulation) de la Unión Europea, que entró en vigor gradualmente a lo largo de 2024. MiCA es el primer marco regulatorio integral y supranacional para criptoactivos a escala continental: establece requisitos de capital, transparencia, gobernanza y protección al consumidor para emisores de tokens e intermediarios cripto (CASPs, Crypto-Asset Service Providers). Las licencias MiCA otorgadas en un Estado miembro son válidas en toda la UE mediante el sistema de "pasaporte europeo".

En Estados Unidos, la SEC aprobó en enero de 2024 los primeros ETFs de Bitcoin al contado (spot Bitcoin ETFs) después de rechazar solicitudes durante más de una década. Los primeros productos fueron lanzados simultáneamente por once gestores, incluyendo BlackRock (iShares Bitcoin Trust), Fidelity (Wise Origin Bitcoin Fund) y Ark Invest. En las primeras semanas de cotización, estos ETFs acumularon decenas de miles de millones de dólares en activos bajo gestión, constituyendo uno de los lanzamientos de ETF más exitosos de la historia financiera y abriendo el mercado cripto a inversores institucionales como fondos de pensiones y gestoras de patrimonio con restricciones regulatorias.

Bitcoin superó los 73.000 dólares en marzo de 2024, estableciendo un nuevo máximo histórico. En abril de 2024 tuvo lugar el cuarto "halving" de Bitcoin: la recompensa por bloque minado se redujo de 6,25 BTC a 3,125 BTC, reduciendo la tasa de emisión de nuevos bitcoins. Los halvings ocurren aproximadamente cada cuatro años (cada 210.000 bloques) y forman parte del diseño de oferta limitada de Bitcoin: el suministro máximo está fijado en 21 millones de BTC.`,
      obraIconica: 'Aprobación de ETFs Bitcoin al contado por la SEC (enero 2024) — BlackRock, Fidelity y otros 9 gestores',
      paises: ['Unión Europea', 'EEUU', 'Reino Unido', 'Japón', 'Singapur', 'Global'],
    },
    {
      id: 'bitcoin-ethereum-madurez',
      nombre: 'Madurez Institucional y Consolidación Global',
      anioInicio: 2024,
      anioFin: 9999,
      color: '#059669',
      categoria: 'adopcion',
      descripcion: `A partir de 2024, el ecosistema de criptomonedas ha entrado en una fase de madurez institucional sin precedentes, caracterizada por la convergencia de tres factores: adopción por parte de gestores de activos tradicionales, marcos regulatorios en los principales bloques económicos y evolución técnica sostenida de los protocolos base.

Ethereum completó en septiembre de 2022 "The Merge", la transición de su mecanismo de consenso de Proof of Work (PoW) a Proof of Stake (PoS). Este cambio, preparado durante años, redujo el consumo energético de la red Ethereum en aproximadamente un 99,95%: de ~80 TWh anuales a menos de 0,01 TWh. El debate sobre el impacto medioambiental del minado de Bitcoin —estimado por el Cambridge Bitcoin Electricity Consumption Index (CBECI) en torno a 120 TWh anuales, comparable al consumo total de Noruega o Argentina— permanece activo. Países como China han prohibido el minado de criptomonedas; países como El Salvador, Bután y ciertos estados de EEUU lo fomentan activamente, a menudo usando energía geotérmica, hidroeléctrica o energía renovable excedente.

La tokenización de activos del mundo real (Real World Assets, RWA) emerge como una de las aplicaciones más prometedoras: fondos de bonos gubernamentales, deuda privada y commodities se representan como tokens en blockchain, combinando la eficiencia de los mercados descentralizados con activos regulados. BlackRock, JPMorgan y otras instituciones financieras tienen proyectos activos en este espacio. La capitalización total del mercado cripto superó de nuevo los 2 billones de dólares en 2024, consolidando las criptomonedas como una clase de activo reconocida —con toda la complejidad regulatoria, técnica y ética que ello implica— en el sistema financiero global.`,
      obraIconica: '"The Merge" de Ethereum (septiembre 2022) — reducción del 99,95% en consumo energético',
      paises: ['Global', 'EEUU', 'Unión Europea', 'El Salvador', 'Japón', 'Singapur'],
    },
  ],

  eras: [
    {
      nombre: 'Origen y Experimento',
      desde: 2008,
      hasta: 2013,
      icono: '🔬',
      hitosDestacados: [
        'Whitepaper de Bitcoin y Bloque Génesis',
        'Primeras Transacciones y Comunidad Pionera',
      ],
      eventos: [
        'Publicación del whitepaper de Bitcoin (31 oct. 2008)',
        'Bloque génesis minado por Nakamoto (3 ene. 2009)',
        'Primera transacción: Nakamoto → Hal Finney, 10 BTC (12 ene. 2009)',
        'Bitcoin Pizza Day: 10.000 BTC por dos pizzas (22 may. 2010)',
        'Mt. Gox se convierte en el exchange dominante (2010-2011)',
        'Primer hackeo de Mt. Gox: 25.000 BTC robados (jun. 2011)',
        'Lanzamiento de Silk Road, primer marketplace en Bitcoin (feb. 2011)',
        'Litecoin lanzado por Charlie Lee como alternativa (oct. 2011)',
        'Nakamoto envía su último mensaje conocido y desaparece (abr. 2011)',
      ],
    },
    {
      nombre: 'Colapso y Resiliencia',
      desde: 2013,
      hasta: 2017,
      icono: '⚡',
      hitosDestacados: [
        'Mt. Gox, Silk Road y las Primeras Crisis',
        'Ethereum y los Contratos Inteligentes',
      ],
      eventos: [
        'FBI cierra Silk Road; Ross Ulbricht detenido (oct. 2013)',
        'Mt. Gox suspende operaciones y declara pérdida de 850.000 BTC (feb. 2014)',
        'Whitepaper de Ethereum publicado por Vitalik Buterin (dic. 2013)',
        'ICO de Ethereum: 18,4M$ recaudados en BTC (jul-ago. 2014)',
        'Lanzamiento de la mainnet de Ethereum (30 jul. 2015)',
        'The DAO recauda 150M$ y es hackeado por 60M$ (may-jun. 2016)',
        'Hard fork: nacimiento de Ethereum Classic (ETC) vs Ethereum (ETH) (jul. 2016)',
        'Ripple (XRP), Monero y Zcash emergen como alternativas (2014-2016)',
        'Bitcoin supera los 1.000$ por primera vez desde 2013 (ene. 2017)',
      ],
    },
    {
      nombre: 'ICO Boom y Crash',
      desde: 2017,
      hasta: 2019,
      icono: '📈',
      hitosDestacados: [
        'ICO Boom, Altcoins y el Gran Crash de 2018',
      ],
      eventos: [
        'Bitcoin supera los 20.000$ (dic. 2017)',
        'Capitalización total del mercado cripto alcanza 800.000M$ (ene. 2018)',
        '5.600M$ recaudados mediante ICOs solo en 2017',
        'SEC investiga ICOs como posibles valores no registrados (jul. 2017)',
        'China prohíbe las ICOs y los exchanges de criptomonedas (sep. 2017)',
        'Bitcoin colapsa al 84% desde máximos a lo largo de 2018',
        'QuadrigaCX colapsa: Gerald Cotten muere con las claves privadas (ene. 2019)',
        'Facebook anuncia Libra (luego Diem), primera stablecoin de tech giant (jun. 2019)',
        'Binance supera a Mt. Gox como exchange líder mundial (2018)',
      ],
    },
    {
      nombre: 'DeFi y NFTs',
      desde: 2019,
      hasta: 2022,
      icono: '🔗',
      hitosDestacados: [
        'DeFi, Verano Cripto y Máximos Históricos',
        'Boom de los NFTs y la Cultura Digital',
      ],
      eventos: [
        'Total Value Locked en DeFi supera 1.000M$ (2020)',
        'Compound lanza el "yield farming" — DeFi Summer (jun. 2020)',
        'Uniswap v2: exchange descentralizado con AMM (may. 2020)',
        'Bitcoin supera su máximo de 2017 y alcanza 20.000$ (dic. 2020)',
        'Beeple vende "Everydays" en Christie\'s por 69,3M$ (mar. 2021)',
        'Lanzamiento de Bored Ape Yacht Club (BAYC) (abr. 2021)',
        'El Salvador adopta Bitcoin como moneda de curso legal (sep. 2021)',
        'Capitalización total del mercado alcanza 3 billones de dólares (nov. 2021)',
        'El mercado NFT colapsa: volumen cae >97% desde máximos (2022)',
      ],
    },
    {
      nombre: 'Crisis y Regulación',
      desde: 2022,
      hasta: 2024,
      icono: '⚖️',
      hitosDestacados: [
        'Colapso de Terra/Luna, Celsius y FTX',
        'MiCA, ETFs Institucionales y Nueva Regulación Global',
      ],
      eventos: [
        'Colapso de Terra/LUNA: 40.000M$ destruidos en días (may. 2022)',
        'Ethereum completa "The Merge": PoW → PoS, −99,95% consumo (sep. 2022)',
        'Celsius Network suspende retiros y declara quiebra (jun-jul. 2022)',
        'FTX colapsa en 10 días; SBF arrestado en Bahamas (nov-dic. 2022)',
        'Do Kwon detenido en Montenegro con pasaporte falso (mar. 2023)',
        'Sam Bankman-Fried condenado por fraude en todos los cargos (nov. 2023)',
        'Reglamento MiCA aprobado: primer marco regulatorio UE integral (2024)',
        'SEC aprueba primeros ETFs de Bitcoin al contado (ene. 2024)',
        'Bitcoin supera los 73.000$ — nuevo máximo histórico (mar. 2024)',
      ],
    },
    {
      nombre: 'Madurez Institucional',
      desde: 2024,
      hasta: 9999,
      icono: '🏛️',
      hitosDestacados: [
        'Madurez Institucional y Consolidación Global',
      ],
      eventos: [
        'ETFs de Bitcoin: BlackRock, Fidelity y otros 9 gestores acumulan decenas de miles de millones (2024)',
        'Cuarto halving de Bitcoin: recompensa baja de 6,25 a 3,125 BTC/bloque (abr. 2024)',
        'Tokenización de activos reales (RWA): fondos de bonos y deuda privada en blockchain',
        'MiCA en vigor en toda la UE: primeras licencias CASP emitidas',
        'Sam Bankman-Fried sentenciado a 25 años (mar. 2024)',
        'Capitalización total supera de nuevo los 2 billones de dólares',
        'Bitcoin alcanza 100.000$ por primera vez (dic. 2024)',
        'Debate regulatorio en EEUU: SEC vs CFTC sobre jurisdicción de criptoactivos',
        'Debate continuo sobre impacto medioambiental del minado de Bitcoin (CBECI ~120 TWh/año)',
      ],
    },
  ],

  categorias: {
    protocolo: 'Protocolos y tecnología',
    adopcion: 'Adopción y uso real',
    crisis: 'Crisis y fraudes',
    defi: 'DeFi y aplicaciones',
    nft: 'NFTs y cultura digital',
    regulacion: 'Regulación y gobernanza',
  },
  colores: {
    protocolo: '#D97706',
    adopcion: '#059669',
    crisis: '#DC2626',
    defi: '#7C3AED',
    nft: '#0EA5E9',
    regulacion: '#374151',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'Bitcoin nació el 31 de octubre de 2008, mientras los gobiernos del mundo rescataban bancos con dinero público tras la mayor crisis financiera desde 1929. Un desconocido bajo el seudónimo Satoshi Nakamoto propuso un sistema de dinero electrónico sin intermediarios, basado en criptografía y consenso distribuido. Lo que comenzó como un experimento técnico circulado entre criptógrafos se convirtió en quince años en una clase de activo con más de dos billones de dólares de capitalización, regulación específica en la Unión Europea y los principales bloques económicos, y productos de inversión aprobados por la SEC de Estados Unidos gestionados por BlackRock y Fidelity. El camino incluyó pizzas valoradas a posteriori en 600 millones de dólares, el mayor robo de la historia en términos relativos (Mt. Gox, 2014), la primera nación en adoptar Bitcoin como moneda de curso legal (El Salvador, 2021) y el mayor fraude en la historia cripto (FTX, 2022). La tecnología blockchain que subyace a Bitcoin ha dado lugar a contratos inteligentes, finanzas descentralizadas (DeFi), tokens no fungibles (NFTs) y la tokenización de activos del mundo real, abriendo debates profundos sobre privacidad, sostenibilidad energética, soberanía monetaria y la naturaleza del dinero en la era digital.',
    tablaComparativa: [
      {
        hito: 'Bitcoin (BTC)',
        periodo: '2008–presente',
        categoria: 'Protocolo base',
        personaje: 'Satoshi Nakamoto (seudónimo)',
        aportacion: 'Primera criptomoneda funcional. Proof of Work, oferta limitada a 21M BTC, "oro digital". Cap. aprox. 1,3 billones $ (2024).',
      },
      {
        hito: 'Ethereum (ETH)',
        periodo: '2013–presente',
        categoria: 'Plataforma de contratos inteligentes',
        personaje: 'Vitalik Buterin',
        aportacion: 'Máquina virtual descentralizada (EVM). Base de DeFi y NFTs. Migró a Proof of Stake (2022). Cap. aprox. 400.000M $ (2024).',
      },
      {
        hito: 'Ripple (XRP)',
        periodo: '2012–presente',
        categoria: 'Pagos interbancarios',
        personaje: 'Chris Larsen, Jed McCaleb',
        aportacion: 'Red de liquidación para bancos y remesas transfronterizas. Juicio SEC resuelto parcialmente en 2023. Cap. aprox. 35.000M $ (2024).',
      },
      {
        hito: 'Litecoin (LTC)',
        periodo: '2011–presente',
        categoria: 'Pagos ligeros',
        personaje: 'Charlie Lee (ex-Google)',
        aportacion: '"Plata digital" frente al "oro digital" de Bitcoin. Bloques más rápidos (2,5 min vs 10 min), algoritmo Scrypt. Cap. aprox. 5.000M $ (2024).',
      },
      {
        hito: 'Cardano (ADA)',
        periodo: '2017–presente',
        categoria: 'Contratos inteligentes académicos',
        personaje: 'Charles Hoskinson (cofundador Ethereum)',
        aportacion: 'Desarrollo basado en investigación académica peer-reviewed. Proof of Stake desde el inicio. Cap. aprox. 18.000M $ (2024).',
      },
      {
        hito: 'Solana (SOL)',
        periodo: '2020–presente',
        categoria: 'Blockchain de alta velocidad',
        personaje: 'Anatoly Yakovenko',
        aportacion: 'Proof of History + PoS: 65.000 tx/segundo teórico. Hub de NFTs y DeFi alternativo a Ethereum. Cap. aprox. 80.000M $ (2024).',
      },
    ],
    escenarios: [
      {
        icono: '🪙',
        titulo: 'Bitcoin como reserva de valor ("oro digital")',
        perfil: 'Inversor institucional o particular a largo plazo',
        texto: 'La tesis del "oro digital" parte de la escasez programada de Bitcoin: solo existirán 21 millones de BTC, de los cuales aproximadamente 19,7 millones ya han sido minados. Cada cuatro años, el "halving" reduce a la mitad la emisión de nuevos BTC, siguiendo una curva de emisión deflacionaria. Esta escasez algorítmica contrasta con las monedas fiduciarias, cuya oferta puede expandirse por decisión de los bancos centrales. Los defensores de esta tesis argumentan que Bitcoin ofrece protección a largo plazo frente a la inflación monetaria. La aprobación de ETFs al contado en EEUU (enero 2024) formalizó la vía para que gestores institucionales con restricciones regulatorias —fondos de pensiones, aseguradoras, endowments universitarios— pudieran añadir exposición a Bitcoin sin custodiar directamente el activo. Los críticos señalan la alta volatilidad histórica como incompatible con la función de reserva de valor a corto y medio plazo.',
      },
      {
        icono: '⚙️',
        titulo: 'Smart contracts y aplicaciones descentralizadas (Ethereum)',
        perfil: 'Desarrollador, protocolo DeFi, organización autónoma',
        texto: 'Ethereum introdujo la idea de que una blockchain podía ejecutar código arbitrario de forma descentralizada: los contratos inteligentes son programas que se ejecutan automáticamente cuando se cumplen las condiciones codificadas, sin posibilidad de censura o modificación unilateral. Sobre esta infraestructura se han construido los protocolos DeFi (préstamos algorítmicos en Aave, exchanges descentralizados en Uniswap, stablecoins en MakerDAO), los NFTs y las DAOs (Organizaciones Autónomas Descentralizadas). Cada operación en Ethereum requiere "gas" (comisiones pagadas en ETH), generando un mercado de tarifas que refleja la demanda de espacio en la cadena. Proyectos como Arbitrum, Optimism y Polygon funcionan como "capas 2" (L2) sobre Ethereum: ejecutan transacciones off-chain y las consolidan periódicamente en la cadena principal, reduciendo costes y aumentando la velocidad manteniendo las garantías de seguridad de Ethereum.',
      },
      {
        icono: '🌍',
        titulo: 'Pagos transfronterizos sin banco (Ripple, Stellar)',
        perfil: 'Inmigrante enviando remesas, empresa con pagos internacionales',
        texto: 'Los pagos internacionales tradicionales (SWIFT) pueden tardar 1-5 días hábiles e incurrir en comisiones de hasta el 5-7% del valor enviado, según datos del Banco Mundial. Redes como Ripple (XRP) y Stellar (XLM) se diseñaron específicamente para facilitar liquidación en segundos y con comisiones mínimas. Ripple trabaja directamente con bancos e instituciones financieras como Santander y MoneyGram para integrar XRP como activo puente en sus redes de liquidación. Stellar se orienta más a mercados emergentes y organizaciones sin ánimo de lucro. Las stablecoins (USDC, USDT) sobre distintas blockchains también se utilizan masivamente para remesas en América Latina y África, donde la volatilidad de las criptomonedas nativas es un obstáculo pero la velocidad y el coste de las blockchains son ventajas reales respecto al sistema bancario tradicional.',
      },
      {
        icono: '🏦',
        titulo: 'Tokenización de activos del mundo real (RWA)',
        perfil: 'Gestora de activos, banco, fondo de inversión',
        texto: 'La tokenización de activos del mundo real (Real World Assets, RWA) consiste en representar activos financieros tradicionales —bonos del Estado, deuda privada, fondos monetarios, acciones, inmuebles— como tokens en una blockchain. Las ventajas potenciales incluyen: liquidación instantánea (T+0 frente al T+2 estándar en bolsa), fraccionalización (posibilidad de invertir en fracciones de activos de alta denominación), transparencia de las posiciones y programabilidad (los tokens pueden incorporar condiciones automáticas de pago de cupones o dividendos). BlackRock lanzó en 2023 el BUIDL Fund (BlackRock USD Institutional Digital Liquidity Fund) sobre Ethereum, ofreciendo exposición a bonos del Tesoro de EEUU tokenizados. JPMorgan opera su propia blockchain privada (Onyx) para liquidación institucional. Los reguladores, en particular la SEC y la ESMA europea, están desarrollando marcos específicos para tokens que representen valores financieros regulados.',
      },
    ],
    faq: [
      {
        pregunta: '¿Qué es una blockchain y cómo funciona?',
        respuesta: 'Una blockchain es una base de datos distribuida que almacena información en bloques encadenados criptográficamente. Cada bloque contiene un conjunto de transacciones, el hash (huella digital) del bloque anterior y un número aleatorio (nonce) que, junto al resto del contenido, produce un hash con determinadas propiedades. Modificar cualquier bloque del pasado requeriría recalcular todos los bloques posteriores y hacerlo más rápido que todos los demás participantes de la red —algo computacionalmente inviable en una red suficientemente grande. No existe un servidor central: miles de nodos independientes mantienen copias idénticas de la cadena y validan nuevas transacciones según las reglas del protocolo. Bitcoin usa Proof of Work (los mineros compiten para encontrar el nonce válido consumiendo energía computacional); Ethereum migró a Proof of Stake (los validadores bloquean ETH como garantía y son elegidos aleatoriamente para proponer bloques).',
        tip: 'Clave: la seguridad de una blockchain no viene de quién la gestiona, sino del coste de atacarla — cuantos más participantes y más poder computacional o capital apostado, más costoso es el ataque.',
      },
      {
        pregunta: '¿Qué diferencia una criptomoneda de una stablecoin?',
        respuesta: 'Las criptomonedas como Bitcoin o Ethereum tienen precio de mercado flotante: su valor en moneda fiat varía constantemente en función de la oferta y la demanda. Las stablecoins son tokens diseñados para mantener un valor estable, generalmente paridad 1:1 con el dólar estadounidense. Existen tres tipos principales: (1) Respaldadas por reservas (Fiat-backed): USDC (Circle) y USDT (Tether) están supuestamente respaldadas por dólares o equivalentes en custodia centralizada; son auditadas (con distintos niveles de transparencia) y son las más utilizadas. (2) Colateralizadas por criptoactivos: DAI (MakerDAO) mantiene su paridad mediante sobrecolateralización en ETH y otros activos cripto, gestionada por un contrato inteligente sin intermediario central. (3) Algorítmicas: UST (Terra) intentaba mantener la paridad mediante mecanismos de arbitraje entre UST y LUNA sin respaldo real — el mecanismo colapsó en mayo 2022 eliminando ~40.000M$ en capitalización.',
        tip: 'Verificar siempre el mecanismo de respaldo de cualquier stablecoin antes de usarla como "equivalente al dólar".',
      },
      {
        pregunta: '¿Qué fue el caso FTX y por qué importa?',
        respuesta: 'FTX era en 2022 el segundo exchange de criptomonedas por volumen del mundo, fundado en 2019 por Sam Bankman-Fried (SBF) y valorado en más de 32.000 millones de dólares. SBF era un personaje público muy visible, donante político masivo en EEUU y defensor del "altruismo efectivo". En noviembre de 2022, un informe de CoinDesk reveló que el balance de Alameda Research (el fondo de trading propiedad de SBF) dependía masivamente de FTT, el token propio de FTX —una bandera roja sobre la solidez real de ambas entidades—. Binance anunció la venta de sus FTT, desencadenando una corrida que FTX no pudo cubrir. La investigación posterior reveló que FTX había utilizado fondos de clientes para financiar las operaciones de Alameda. SBF fue condenado en noviembre de 2023 por fraude en todos los cargos y sentenciado a 25 años de prisión en marzo de 2024. El caso importa porque demostró que la falta de segregación de fondos, la ausencia de auditorías independientes y la concentración de control en exchanges centralizados reproducen exactamente los mismos riesgos que en las finanzas tradicionales, acelerando la demanda de regulación.',
        tip: 'El colapso de FTX no fue un fallo de la tecnología blockchain, sino de un intermediario centralizado con controles inadecuados — la misma categoría de riesgo que un banco mal gestionado.',
      },
      {
        pregunta: '¿Cuánto consume Bitcoin en energía?',
        respuesta: 'El Cambridge Bitcoin Electricity Consumption Index (CBECI), mantenido por la Universidad de Cambridge, es la fuente de referencia más citada para el consumo energético de Bitcoin. Las estimaciones del CBECI sitúan el consumo anual de la red de minado de Bitcoin en torno a 100-150 TWh, comparable al consumo eléctrico total de países como Noruega, Argentina o Ucrania. Este consumo es inherente al diseño de Proof of Work: la seguridad de la red se garantiza precisamente porque atacarla requeriría controlar más del 50% de todo ese poder computacional (ataque del 51%). El debate sobre sostenibilidad tiene múltiples dimensiones: una parte de los mineros usa energía renovable excedente (hidroeléctrica en épocas de alta producción, geotérmica en Islandia o El Salvador); la proporción exacta es objeto de disputa. Ethereum eliminó este debate con su migración a Proof of Stake en 2022 (−99,95% de consumo). Los críticos del consumo de Bitcoin argumentan que no tiene justificación social equivalente; los defensores argumentan que el sistema bancario tradicional también consume cantidades significativas de energía cuando se considera su infraestructura completa.',
        tip: 'Fuente de referencia: Cambridge Bitcoin Electricity Consumption Index (CBECI) — actualizado en tiempo real en ccaf.io/cbnsi/cbeci.',
      },
      {
        pregunta: '¿Es legal usar criptomonedas en España y en América Latina?',
        respuesta: 'En España y la Unión Europea, las criptomonedas son legales. El Reglamento MiCA (Markets in Crypto-Assets), en vigor desde 2024, establece el primer marco regulatorio integral de la UE: los emisores de tokens y los proveedores de servicios cripto (exchanges, custodios, plataformas de inversión) necesitan registro y autorización, que en la UE equivale a licencia válida en todos los países miembros. Fiscalmente en España, las ganancias derivadas de criptomonedas tributan como ganancia patrimonial en el IRPF (tramos del 19% al 28% según la base imponible del ahorro). La CNMV y el Banco de España emiten advertencias periódicas sobre riesgos. En América Latina, el panorama es heterogéneo: El Salvador las reconoce como moneda de curso legal; Argentina, México, Colombia, Perú y Chile las permiten con distintos niveles de regulación y obligaciones fiscales en desarrollo; Venezuela ha emitido su propia criptomoneda estatal (Petro). La regulación cambia con rapidez en toda la región. Consultar siempre la normativa fiscal vigente en la jurisdicción específica.',
        tip: 'En España: modelo 721 (declaración de criptomonedas en el extranjero) y apartado de ganancias y pérdidas patrimoniales en la declaración de la Renta. Verificar con un asesor fiscal.',
      },
    ],
    pasos: [
      {
        titulo: 'Crear un wallet y obtener una dirección pública',
        cuerpo: 'Un wallet (monedero) de criptomonedas no almacena monedas en sí mismo, sino el par de claves criptográficas que acreditan la propiedad. La clave privada (private key) es el secreto que permite autorizar transacciones; la clave pública, derivada matemáticamente de la privada, genera la dirección pública —el equivalente al número de cuenta—. Los wallets pueden ser software (aplicaciones móviles como Trust Wallet o Exodus, o extensiones de navegador como MetaMask para Ethereum) o hardware (dispositivos físicos como Ledger o Trezor que mantienen la clave privada aislada de internet). Existe también la custodia en exchanges, donde el exchange controla las claves privadas en nombre del usuario —conveniente pero con el riesgo ilustrado por Mt. Gox y FTX.',
      },
      {
        titulo: 'Firmar la transacción con clave privada',
        cuerpo: 'Cuando un usuario quiere enviar BTC a otra dirección, el wallet construye un mensaje con los datos de la transacción (origen, destino, cantidad, comisión) y lo firma digitalmente usando el algoritmo ECDSA (Elliptic Curve Digital Signature Algorithm) con la clave privada. La firma digital prueba matemáticamente que el propietario de la clave privada ha autorizado la transacción, sin revelar la clave privada en ningún momento. Cualquier nodo de la red puede verificar la validez de la firma usando únicamente la clave pública, que es pública por definición. Este mecanismo de criptografía de clave pública —desarrollado por Diffie, Hellman, Rivest, Shamir y Adleman en los años 70— es el fundamento de seguridad de todas las criptomonedas.',
      },
      {
        titulo: 'Difusión a la red peer-to-peer',
        cuerpo: 'La transacción firmada se difunde (broadcast) a los nodos conectados al wallet, que a su vez la reenvían a sus pares (peer-to-peer). En cuestión de segundos, la transacción ha llegado a miles de nodos distribuidos por todo el mundo. Antes de ser incluida en un bloque, la transacción espera en el "mempool" (memory pool): un área temporal donde cada nodo mantiene las transacciones válidas pendientes de confirmación. Las transacciones con comisiones más altas son procesadas antes por los mineros, ya que las comisiones son parte de su incentivo económico. En períodos de alta demanda (como el pico de 2021), las comisiones por transacción en Bitcoin podían superar los 50 dólares; en períodos de baja demanda son cénts de dólar.',
      },
      {
        titulo: 'Verificación y minado (Proof of Work)',
        cuerpo: 'Los mineros recogen transacciones del mempool, las agrupan en un bloque candidato y compiten para encontrar el nonce (número aleatorio) que hace que el hash SHA-256 del bloque comience con un número determinado de ceros —la "dificultad" que la red ajusta automáticamente cada 2016 bloques (~2 semanas) para que, con el poder computacional total de la red, se mine un bloque cada ~10 minutos—. Este proceso requiere probar miles de millones de nonces por segundo; es inherentemente probabilístico y consume energía (Proof of Work). El primer minero que encuentra el nonce válido difunde el bloque, los demás nodos lo verifican en milisegundos y lo añaden a su copia de la cadena, y el minero recibe la recompensa en BTC (3,125 BTC desde el halving de abril 2024) más las comisiones de las transacciones incluidas.',
      },
      {
        titulo: 'Confirmación y registro inmutable en la cadena',
        cuerpo: 'Una vez incluida en un bloque y añadida a la cadena, la transacción tiene "1 confirmación". Cada bloque posterior que se mine encima añade una confirmación más. Para transacciones de bajo valor, 1-3 confirmaciones suelen considerarse suficientes (~10-30 minutos); para grandes cantidades, los exchanges y servicios esperan 6 confirmaciones (~1 hora) como estándar de seguridad. La inmutabilidad de la cadena se garantiza porque modificar una transacción pasada requeriría recalcular todos los bloques desde ese punto, acumulando suficiente poder computacional para superar a toda la red honesta —el llamado "ataque del 51%"—. En la red de Bitcoin, que cuenta con el mayor hashrate de la historia, este ataque sería extraordinariamente costoso. Los datos de la transacción quedan públicamente accesibles para siempre en la blockchain: cualquiera puede consultar el historial completo de cualquier dirección usando un explorador de bloques como Mempool.space o Blockchair.',
      },
    ],
    tips: [
      {
        icono: '🔐',
        texto: 'Custodiar las claves privadas de forma segura: "not your keys, not your coins". Si un exchange colapsa (como Mt. Gox o FTX), los fondos depositados pueden perderse. Para cantidades significativas, usar un hardware wallet (Ledger, Trezor) y guardar la seed phrase (12-24 palabras de recuperación) fuera de línea en un lugar seguro, sin fotos digitales ni almacenamiento en la nube.',
      },
      {
        icono: '⚖️',
        texto: 'Verificar la regulación fiscal vigente en tu jurisdicción antes de operar. En España, las ganancias por criptomonedas tributan como ganancia patrimonial en el IRPF y pueden requerir presentar el modelo 721 si se mantienen activos en exchanges fuera de la UE. En América Latina, la regulación varía por país y está en rápida evolución.',
      },
      {
        icono: '🏦',
        texto: 'Entender la diferencia entre exchange centralizado (CEX) y wallet personal (self-custody). En un CEX el exchange custodia las claves privadas; en self-custody el usuario es el único responsable. Los CEX regulados bajo MiCA (UE) o con registro en la SEC (EEUU) ofrecen mayor protección al consumidor que los no regulados, pero sigue existiendo riesgo de custodia.',
      },
      {
        icono: '📄',
        texto: 'Investigar el equipo, el whitepaper y la tokenomics antes de cualquier inversión. Preguntas clave: ¿quiénes son los fundadores y pueden verificarse sus identidades? ¿El proyecto tiene código en un repositorio público (GitHub)? ¿Cuál es la distribución inicial de tokens y existen periodos de vesting para el equipo? La mayoría de los proyectos del ICO boom de 2017 que colapsaron carecían de respuestas sólidas a estas preguntas.',
      },
    ],
    errores: [
      {
        titulo: '"Las criptomonedas son anónimas"',
        cuerpo: 'Las criptomonedas como Bitcoin son pseudoanónimas, no anónimas. Todas las transacciones son públicas y permanentes en la blockchain: cualquiera puede ver el historial completo de movimientos de cualquier dirección. La "seudoanonimidad" reside en que las direcciones no están vinculadas a identidades reales por defecto. Sin embargo, las empresas de análisis blockchain (Chainalysis, Elliptic) han desarrollado técnicas de "clustering" que permiten asociar direcciones a entidades y, en muchos casos, a individuos a través de KYC de exchanges regulados. El FBI usó estas técnicas para rastrear fondos de Silk Road y recuperar parte de los BTC de Colonial Pipeline. Las únicas criptomonedas con privacidad real por diseño de protocolo son Monero (XMR) y Zcash (ZEC), que usan criptografía de conocimiento cero y firmas de anillo.',
      },
      {
        titulo: '"Blockchain significa descentralización"',
        cuerpo: 'No toda blockchain es descentralizada en la práctica. Existen blockchains públicas y permissionless (Bitcoin, Ethereum) donde cualquiera puede participar como nodo o validador; blockchains privadas o de consorcio (Hyperledger Fabric, Quorum de JPMorgan) donde un grupo controlado de entidades gestiona la red; y blockchains "descentralizadas en teoría" donde el poder de validación está muy concentrado en la práctica (cuando un pequeño número de validadores controla >50% del stake o hashrate). El término "blockchain" describe una estructura de datos y un mecanismo de consenso, no garantiza automáticamente apertura, resistencia a la censura ni independencia de control centralizado.',
      },
      {
        titulo: '"DeFi elimina el riesgo"',
        cuerpo: 'Las finanzas descentralizadas eliminan algunos riesgos (intermediario central, opacidad) pero introducen o mantienen otros. El riesgo de smart contracts es real: auditorías realizadas, los contratos de The DAO (2016), Ronin Network (625M$ robados, 2022) y Euler Finance (196M$ robados, 2023) contenían vulnerabilidades que pasaron revisiones. Los protocolos de préstamo DeFi tienen mecanismos de liquidación automática: si el valor del colateral cae por debajo de un umbral, la posición se liquida sin intervención humana, potencialmente en momentos de alta volatilidad. Los "rug pulls" (fraudes donde los creadores retiran toda la liquidez del protocolo) han supuesto miles de millones en pérdidas documentadas. La pseudoanonimidad dificulta la recuperación legal de fondos.',
      },
      {
        titulo: '"Las stablecoins siempre valen 1$"',
        cuerpo: 'El colapso de UST (Terra) en mayo de 2022 demostró de forma definitiva que las stablecoins algorítmicas no garantizan la paridad en condiciones de estrés extremo. UST perdió su paridad en días y llegó a cotizar a 0,02$. Incluso las stablecoins respaldadas por reservas tienen riesgos: USDT (Tether) ha sido objeto de litigios y multas por parte del estado de Nueva York relacionados con la transparencia de sus reservas; USDC (Circle) llegó a cotizar brevemente a 0,87$ en marzo de 2023 cuando se supo que 3.300 millones de sus reservas estaban depositados en Silicon Valley Bank (que colapsó ese fin de semana). La paridad se restableció cuando el FDIC garantizó los depósitos.',
      },
    ],
  },
};
