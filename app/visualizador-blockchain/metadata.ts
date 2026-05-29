import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Blockchain | Bloques, Consenso y Contratos Inteligentes | meskeIA',
  description: 'Cómo funciona una blockchain: anatomía de un bloque (hash, merkle tree), Proof of Work vs Proof of Stake, contratos inteligentes, DeFi y comparativa Bitcoin vs Ethereum.',
  keywords: ['blockchain', 'bitcoin', 'ethereum', 'proof of work', 'proof of stake', 'contratos inteligentes', 'DeFi', 'NFT', 'criptografia', 'consenso'],
  openGraph: {
    title: 'Visualizador de Blockchain | meskeIA',
    description: 'Bloques, hashing, PoW vs PoS, contratos inteligentes y DeFi: cómo funciona una blockchain explicado visualmente.',
    url: 'https://meskeia.com/visualizador-blockchain/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Blockchain - Cadena de Bloques y Contratos Inteligentes",
  description: "Cómo funciona una blockchain: anatomía de un bloque (hash, merkle tree), Proof of Work vs Proof of Stake, contratos inteligentes, DeFi y comparativa Bitcoin vs Ethereum.",
  url: "https://meskeia.com/visualizador-blockchain/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona una blockchain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una blockchain es una base de datos distribuida formada por bloques enlazados criptográficamente. Cada bloque contiene un conjunto de transacciones, su propio hash (huella digital) y el hash del bloque anterior. Esta cadena hace que alterar cualquier bloque invalide todos los siguientes, garantizando la inmutabilidad del registro sin necesidad de una autoridad central.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Proof of Work y Proof of Stake?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Proof of Work (PoW) exige que los mineros resuelvan puzzles criptográficos computacionalmente intensivos para añadir bloques, consumiendo mucha energía (Bitcoin usa PoW). Proof of Stake (PoS) selecciona validadores en función de la criptomoneda que tienen bloqueada como garantía, reduciendo el consumo energético hasta un 99% (Ethereum migró a PoS en 2022 con "The Merge").',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un contrato inteligente (smart contract)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un contrato inteligente es un programa almacenado en la blockchain que se ejecuta automáticamente cuando se cumplen las condiciones definidas en su código, sin intermediarios. Ethereum popularizó los contratos inteligentes con su máquina virtual EVM. Son la base de las aplicaciones descentralizadas (dApps), los tokens ERC-20 y los proyectos DeFi.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia Bitcoin de Ethereum?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bitcoin fue diseñado principalmente como dinero digital descentralizado y reserva de valor; su scripting es intencionalmente limitado. Ethereum es una plataforma de contratos inteligentes programable con el lenguaje Solidity, orientada a aplicaciones descentralizadas. Bitcoin usa PoW; Ethereum migró a PoS. El suministro de Bitcoin está limitado a 21 millones de unidades, mientras que Ethereum no tiene tope fijo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es DeFi y cómo se relaciona con blockchain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DeFi (Finanzas Descentralizadas) es el ecosistema de servicios financieros —préstamos, intercambios, rendimientos— construidos sobre blockchains públicas, principalmente Ethereum, sin bancos ni intermediarios. Los protocolos DeFi funcionan mediante contratos inteligentes que gestionan automáticamente los fondos de los usuarios. A finales de 2024 el valor total bloqueado en DeFi superaba los 80.000 millones de dólares.',
      },
    },
  ],
};
