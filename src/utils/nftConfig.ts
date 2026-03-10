export interface NFTContractConfig {
  contractAddress: string;
  chainId: number;
  rpcEndpoint: string;
  isConfigured: boolean;
}

export const NFT_CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  8453: 'Base Mainnet',
  84532: 'Base Sepolia',
  137: 'Polygon',
  42161: 'Arbitrum One',
  10: 'Optimism',
};

export const NFT_EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  137: 'https://polygonscan.com',
  42161: 'https://arbiscan.io',
  10: 'https://optimistic.etherscan.io',
};

export function getExplorerUrl(chainId: number, txHash: string): string {
  const baseUrl = NFT_EXPLORERS[chainId] || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

export function getContractExplorerUrl(chainId: number, contractAddress: string): string {
  const baseUrl = NFT_EXPLORERS[chainId] || 'https://etherscan.io';
  return `${baseUrl}/address/${contractAddress}`;
}

export function formatContractAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
