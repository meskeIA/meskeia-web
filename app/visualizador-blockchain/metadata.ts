import type { Metadata } from 'next';

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
